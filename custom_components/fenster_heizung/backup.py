"""Automatische Sicherungskopien aller Speicher der Integration.

SafeStore verhält sich wie ein normaler Store, legt aber vor dem Überschreiben Kopien des letzten Stands an:
- sofort, wenn ein neuer Stand deutlich weniger Inhalt hat als der vorige (z. B. durch Standardwerte)
- sonst höchstens alle 6 Stunden
Es bleiben die 3 neuesten Kopien und die inhaltsreichste erhalten. Ist die Datei beim Start nicht lesbar,
wird die inhaltsreichste Kopie geladen. Wiederherstellen aus der Oberfläche setzt eine Marke, die beim nächsten
Laden (Integration neu laden oder Neustart) die gewählte Kopie einliest.
"""
from __future__ import annotations

import json
import logging
import time
from datetime import datetime
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

SNAP_GAP_S = 6 * 3600
SHRINK = 0.6
MAX_SNAPS = 4
MAX_JSON = 1_500_000
MIN_SCORE = 2
REG_KEY = f"{DOMAIN}_safestores"

LABELS = {
    "layout": "Aussehen des Dashboards", "general": "Allgemeine Einstellungen", "presence": "Anwesenheit",
    "wasser": "Modul 2 bis 4 (Warmwasser, Energie, Gerätestrom, E-Auto)", "geraete": "Modul 4 Messwerte",
    "wallbox": "Modul 8 Wallbox", "wallbox_stats": "Modul 8 Statistik", "solar": "Modul 16 Solar-Prognose",
    "wetter": "Modul 9 Wetter", "sicherheit": "Modul 11 Sicherheit", "muell": "Modul 17 Müllabfuhr",
    "hausfluss": "Modul 19 Hausfluss", "tags": "Lab Tags & Karten", "tablets": "Tablet-Modus", "labs": "Labs",
    "tibber": "Tibber", "diag": "Diagnose",
}


def score(x: Any) -> int:
    """Wie viel Inhalt steckt drin? Zählt nichtleere Texte und Zahlen ungleich 0 (Wahrheitswerte zählen nicht)."""
    if isinstance(x, bool) or x is None:
        return 0
    if isinstance(x, (int, float)):
        return 1 if x else 0
    if isinstance(x, str):
        return 1 if x.strip() else 0
    if isinstance(x, dict):
        return sum(score(v) for v in x.values())
    if isinstance(x, (list, tuple)):
        return sum(score(v) for v in x)
    return 0


def _trim(snaps: list[dict[str, Any]]) -> list[dict[str, Any]]:
    snaps = sorted(snaps, key=lambda s: s.get("t", 0), reverse=True)
    if len(snaps) <= MAX_SNAPS:
        return snaps
    best = max(snaps, key=lambda s: (s.get("score", 0), s.get("t", 0)))
    keep = [s for s in snaps if s is not best][: MAX_SNAPS - 1] + [best]
    return sorted(keep, key=lambda s: s.get("t", 0), reverse=True)


class SafeStore(Store):
    def __init__(self, hass: HomeAssistant, version: int, key: str, **kw: Any) -> None:
        super().__init__(hass, version, key, **kw)
        self._sk = key
        self.hass = hass
        self._bk = Store(hass, 1, f"{key}_bak")
        self._snaps: list[dict[str, Any]] = []
        self._pend: int | None = None
        self._prev: tuple[int, str] | None = None
        self._loaded = False
        hass.data.setdefault(REG_KEY, {})[key] = self

    # ---- Laden
    async def async_load(self) -> Any:
        data = await super().async_load()
        try:
            bk = await self._bk.async_load()
            bk = bk if isinstance(bk, dict) else {}
            self._snaps = [s for s in bk.get("snaps", []) if isinstance(s, dict) and "data" in s]
            pend = bk.get("pending")
            if isinstance(pend, int) and 0 <= pend < len(self._snaps):
                chosen = json.loads(json.dumps(self._snaps[pend]["data"]))
                self._add_snap(data)  # das Ersetzte bleibt wiederherstellbar
                data = chosen
                _LOGGER.warning("%s: Sicherung wiederhergestellt", self._sk)
                self._pend = None
                self._flush_bk()
            elif data is None and self._snaps:
                best = max(self._snaps, key=lambda s: (s.get("score", 0), s.get("t", 0)))
                _LOGGER.warning("%s: Datei fehlte oder war unlesbar, Sicherung vom %s geladen", self._sk, best.get("ts"))
                data = json.loads(json.dumps(best["data"]))
        except Exception:  # noqa: BLE001 - Sicherung ist nur ein Zusatz
            _LOGGER.exception("%s: Sicherung konnte nicht gelesen werden", self._sk)
        if data is not None:
            try:
                self._prev = (score(data), json.dumps(data, default=str, sort_keys=True))
            except (TypeError, ValueError):
                self._prev = None
        self._loaded = True
        return data

    # ---- Speichern
    def _add_snap(self, data: Any) -> None:
        if data is None:
            return
        try:
            js = json.dumps(data, default=str, sort_keys=True)
        except (TypeError, ValueError):
            return
        sc = score(data)
        if sc < MIN_SCORE or len(js) > MAX_JSON:
            return
        if self._snaps and self._snaps[0].get("js") == js:
            return
        now = time.time()
        self._snaps.insert(0, {"t": now, "ts": datetime.now().isoformat(timespec="seconds"), "score": sc, "js": js, "data": json.loads(js)})
        self._snaps = _trim(self._snaps)

    def _note(self, new: Any) -> None:
        try:
            js = json.dumps(new, default=str, sort_keys=True)
            sc = score(new)
            prev = self._prev
            if prev and prev[1] != js and prev[0] >= MIN_SCORE:
                last = self._snaps[0]["t"] if self._snaps else 0
                if sc < prev[0] * SHRINK or time.time() - last > SNAP_GAP_S:
                    self._add_snap(json.loads(prev[1]))
                    self._flush_bk()
            changed = prev is None or prev[1] != js
            self._prev = (sc, js)
            if changed:
                m = self.hass.data.get(DOMAIN, {}).get("extbak")
                if m is not None:
                    m.poke(self._sk)
        except Exception:  # noqa: BLE001
            _LOGGER.exception("%s: Sicherung fehlgeschlagen", self._sk)

    def _flush_bk(self) -> None:
        snaps = [{k: v for k, v in s.items() if k != "js"} for s in self._snaps]
        out = {"snaps": snaps, "pending": self._pend}
        self._bk.async_delay_save(lambda: out, 2)

    def async_delay_save(self, data_func: Any, delay: float = 0) -> None:
        def f() -> Any:
            d = data_func()
            self._note(d)
            return d
        super().async_delay_save(f, delay)

    async def async_save(self, data: Any) -> None:
        self._note(data)
        await super().async_save(data)

    def current(self) -> Any:
        """Letzter bekannter Stand (Kopie) oder None."""
        return json.loads(self._prev[1]) if self._prev else None

    # ---- Oberfläche
    def info(self) -> dict[str, Any]:
        return {"key": self._sk, "snaps": [{"i": i, "ts": s.get("ts"), "score": s.get("score", 0)} for i, s in enumerate(self._snaps)]}

    async def async_stage(self, data: Any) -> bool:
        """Eingelesene Rohdaten als Kopie ablegen und für den nächsten Ladevorgang vormerken."""
        try:
            js = json.dumps(data, default=str, sort_keys=True)
        except (TypeError, ValueError):
            return False
        if len(js) > MAX_JSON * 2:
            return False
        self._snaps.insert(0, {"t": time.time(), "ts": datetime.now().isoformat(timespec="seconds"), "score": max(score(data), 1), "js": js, "data": json.loads(js)})
        self._snaps = _trim(self._snaps)
        # Einlesen soll genau diese Kopie nehmen, auch wenn _trim sie nicht an Position 0 lässt
        idx = next((i for i, s in enumerate(self._snaps) if s.get("js") == js), 0)
        return await self.async_mark_restore(idx)

    async def async_mark_restore(self, i: int) -> bool:
        if not (0 <= i < len(self._snaps)):
            return False
        self._pend = i
        snaps = [{k: v for k, v in s.items() if k != "js"} for s in self._snaps]
        await self._bk.async_save({"snaps": snaps, "pending": i})
        return True


def stores(hass: HomeAssistant) -> dict[str, SafeStore]:
    return hass.data.get(REG_KEY, {})


def label(key: str) -> str:
    k = key[len(DOMAIN) + 1:] if key.startswith(DOMAIN + "_") else key
    if k in LABELS:
        return LABELS[k]
    return "Raum" if len(k) > 20 else k
