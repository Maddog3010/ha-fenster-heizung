"""Änderungsverlauf mit Rückgängig (Konzept Einstellungen, Stufe 3: B4 und C4).

Jede Änderung an den allgemeinen Einstellungen, den Haus-Werten, den Modulen und Modul 2 wird als einzelne
Zeile gemerkt: wann, wer, welcher Wert (Pfad wie "general.summer.temp"), alter und neuer Wert. Es bleiben die
letzten 50 Änderungen. Eine Zeile lässt sich einzeln zurücknehmen: Der alte Wert wird über denselben Weg
gespeichert wie aus der Oberfläche, also mit allen Prüfungen. Das Zurücknehmen erscheint selbst im Verlauf.

Den Namen des Benutzers setzt die Websocket-Schnittstelle über WHO, bevor sie speichert.
"""
from __future__ import annotations

import contextvars
import copy
import json
import logging
import time
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

MAX = 50
MAX_PER_SAVE = 12
MAX_VALUE_CHARS = 1500
WHO: contextvars.ContextVar[str] = contextvars.ContextVar("fh_who", default="")
SKIP = {"haus.mig", "haus.used", "haus.schema", "haus.v"}


def diff(old: Any, new: Any, path: str = "") -> list[tuple[str, Any, Any]]:
    """Geänderte Blätter. Listen zählen als ein Wert."""
    if path in SKIP:
        return []
    if isinstance(old, dict) and isinstance(new, dict):
        out: list[tuple[str, Any, Any]] = []
        for k in list(dict.fromkeys([*old.keys(), *new.keys()])):
            out += diff(old.get(k), new.get(k), f"{path}.{k}" if path else str(k))
        return out
    if old != new:
        return [(path, old, new)]
    return []


def get_path(d: Any, path: str) -> Any:
    for p in path.split(".")[1:]:
        if not isinstance(d, dict):
            return None
        d = d.get(p)
    return d


def set_path(d: dict[str, Any], path: str, value: Any) -> dict[str, Any]:
    """Kopie von d mit geändertem Wert. Der erste Teil des Pfads ist der Bereich und gehört nicht zu d."""
    out = copy.deepcopy(d)
    parts = path.split(".")[1:]
    cur = out
    for p in parts[:-1]:
        if not isinstance(cur.get(p), dict):
            cur[p] = {}
        cur = cur[p]
    if parts:
        cur[parts[-1]] = value
    return out


def _small(v: Any) -> bool:
    try:
        return len(json.dumps(v, default=str)) <= MAX_VALUE_CHARS
    except (TypeError, ValueError):
        return False


class Verlauf:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = Store(hass, 1, f"{DOMAIN}_verlauf")
        self.log: list[dict[str, Any]] = []
        self._n = 0
        self._busy = False

    async def async_start(self) -> None:
        d = await self._store.async_load()
        if isinstance(d, dict) and isinstance(d.get("log"), list):
            self.log = [x for x in d["log"] if isinstance(x, dict) and "id" in x][:MAX]
            self._n = int(d.get("n") or 0)

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"log": self.log, "n": self._n}, 5)

    def record(self, area: str, old: Any, new: Any, note: str = "") -> None:
        """Unterschied zwischen altem und neuem Stand merken."""
        try:
            ch = diff(old, new, area)
        except Exception:  # noqa: BLE001 - Verlauf ist nur ein Zusatz
            _LOGGER.exception("Verlauf: Vergleich fehlgeschlagen")
            return
        if not ch:
            return
        who = WHO.get() or "System"
        now = time.time()
        if len(ch) > MAX_PER_SAVE:  # z. B. Sicherung eingelesen: eine Sammelzeile ohne Rückgängig
            self._n += 1
            self.log.insert(0, {"id": self._n, "t": now, "who": who, "path": area, "many": len(ch), "note": note, "undo": False})
        else:
            for path, o, n in ch:
                self._n += 1
                ok = _small(o) and _small(n)
                self.log.insert(0, {"id": self._n, "t": now, "who": who, "path": path, "old": o if ok else None, "new": n if ok else None, "note": note, "undo": ok and not self._busy})
        del self.log[MAX:]
        self._save()

    def snapshot(self) -> list[dict[str, Any]]:
        return self.log

    async def async_undo(self, eid: int) -> dict[str, Any]:
        e = next((x for x in self.log if x.get("id") == eid), None)
        if e is None or not e.get("undo"):
            raise ValueError("Diese Änderung lässt sich nicht zurücknehmen")
        area = e["path"].split(".")[0]
        store = self.hass.data.get(DOMAIN, {})
        tok = WHO.set((WHO.get() or "System"))
        self._busy = True
        try:
            if area == "general" and store.get("general") is not None:
                g = store["general"]
                await g.async_set(set_path(g.data, e["path"], e["old"]))
            elif area == "haus" and store.get("haus") is not None:
                h = store["haus"]
                await h.async_set({k: v for k, v in set_path(h.data, e["path"], e["old"]).items() if k in ("energy", "soc", "price", "wx")})
            elif area == "modules" and store.get("wasser") is not None:
                w = store["wasser"]
                await w.async_set_modules(set_path(w.modules, e["path"], e["old"]))
            elif area == "ww" and store.get("wasser") is not None:
                w = store["wasser"]
                await w.async_set_cfg(set_path(w.cfg, e["path"], e["old"]))
            else:
                raise ValueError("Bereich ist nicht bereit")
        finally:
            self._busy = False
            WHO.reset(tok)
        # Die neue Zeile (vom Speichern) als Rücknahme kennzeichnen
        for x in self.log:
            if x.get("path") == e["path"] and x.get("id", 0) > eid:
                x["note"] = f"undo:{eid}"
                break
        e["undone"] = True
        self._save()
        return {"log": self.log}
