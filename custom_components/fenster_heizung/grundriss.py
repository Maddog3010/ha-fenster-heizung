"""Modul 0 · Haus & Grundriss (Build 1): der gemeinsame Bauplan aller Module.

Bis 2026.11.4b52 lag der Grundriss im Speicher von Modul 11 (fenster_heizung_sicherheit_plan). Ab Modul 0 Build 1 gehört er dem Kern:
Speicher fenster_heizung_grundriss, Schema 1. Modul 11 liest und schreibt seinen Plan ab jetzt hier (sein eigener Plan-Speicher bleibt als
zusätzliche Kopie). Modul 1 (Wärmekarte) und Modul 18 (Lichtkarte) lesen über gr_get. (Nicht zu verwechseln mit haus.py, den Haus-Werten aus den Einstellungen.)

Build 2: Raumliste – Plan-Raum → Bereich in Home Assistant (rooms, „-“ = bewusst kein Bereich). Ersetzt die Zuordnung pmap aus Modul 18
(wird einmalig übernommen). Die Spalte „Raum in Modul 1“ bleibt im Layout (gmap) und wird aus Modul 0 bearbeitet.

Umzug: Beim ersten Start übernimmt Modul 0 den Plan aus Modul 11 (mit Meldern und Lampen als Ebenen-Elemente „m“ und „l“) und legt eine
Umzugs-Kopie an, die 90 Tage aufgehoben wird. Bearbeitet wird in Build 1 noch im Baukasten von Modul 11 (zieht in Build 3 um).
"""
from __future__ import annotations

import logging
import re
from datetime import timedelta
from typing import Any, Callable

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import DOMAIN
from .sicherheit import clean_plan

_LOGGER = logging.getLogger(__name__)
SCHEMA = 1
KEEP_COPY_DAYS = 90
LAYERS = {"m": "sf", "l": "licht"}  # Element-Typ → Ebene (Modul 11 Melder, Modul 18 Lampen)
_ID = re.compile(r"^[A-Za-z0-9_.:-]{1,64}$")
ROOMS_MAX = 300


def clean_rooms(raw: Any) -> dict[str, str]:
    """Raumliste: Plan-Raum-ID → Bereichs-ID in Home Assistant oder „-“ (bewusst kein Bereich). Fehlt ein Eintrag, gilt der Name."""
    out: dict[str, str] = {}
    if not isinstance(raw, dict):
        return out
    for k, v in raw.items():
        if len(out) >= ROOMS_MAX:
            break
        if isinstance(k, str) and _ID.match(k) and isinstance(v, str) and (v == "-" or _ID.match(v)):
            out[k] = v
    return out


def plan_stats(plan: dict[str, Any]) -> dict[str, Any]:
    """Zahlen für Banner und Ebenen: Etagen, Räume (mit Namen), Bauplan-Elemente, Elemente je Ebene."""
    items = plan.get("items") or []
    layers = {k: 0 for k in LAYERS.values()}
    for i in items:
        lay = LAYERS.get(i.get("t"))
        if lay:
            layers[lay] += 1
    rooms = [i for i in items if i.get("t") == "r"]
    return {"floors": len(plan.get("floors") or []), "rooms": len(rooms), "named": sum(1 for r in rooms if str(r.get("n") or "").strip()),
            "build": sum(1 for i in items if i.get("t") not in LAYERS), "layers": layers, "bg": sum(1 for v in (plan.get("bg") or {}).values() if v)}


class GrundrissManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, SCHEMA, f"{DOMAIN}_grundriss")
        self._copy = SafeStore(hass, 1, f"{DOMAIN}_grundriss_umzug")  # Stand des Plans aus Modul 11 beim Umzug
        self.plan: dict[str, Any] = clean_plan(None)
        self.has = False                  # gibt es schon einen eigenen Plan in Modul 0?
        self.meta: dict[str, Any] = {}    # since (Umzug), src, copy_until, changed, pmap (Übernahme aus Modul 18)
        self.rooms: dict[str, str] = {}   # Plan-Raum → Bereich (Build 2)
        self._listeners: list[Callable[[], None]] = []

    async def async_start(self) -> None:
        d = await self._store.async_load()
        if isinstance(d, dict) and isinstance(d.get("plan"), dict):
            self.plan = clean_plan(d["plan"])
            self.has = True
            self.meta = {k: str(v) for k, v in (d.get("meta") or {}).items() if isinstance(v, str)}
        if isinstance(d, dict):
            self.rooms = clean_rooms(d.get("rooms"))
        until = self.meta.get("copy_until")
        if until:
            u = dt_util.parse_datetime(until)
            if u and dt_util.now() > u:  # Umzugs-Kopie nach 90 Tagen löschen
                self._copy.async_delay_save(lambda: {"t": "", "src": "", "plan": None}, 1)  # Inhalt leeren, Datei bleibt
                self.meta.pop("copy_until", None)
                self._save(1)

    def _save(self, delay: float = 5) -> None:
        self._store.async_delay_save(lambda: {"v": SCHEMA, "plan": self.plan, "meta": self.meta, "rooms": self.rooms}, delay)

    def listen(self, cb: Callable[[], None]) -> Callable[[], None]:
        self._listeners.append(cb)
        return lambda: self._listeners.remove(cb) if cb in self._listeners else None

    # ---- Umzug und Schreiben
    def adopt(self, plan: dict[str, Any], src: str) -> bool:
        """Einmalig: Plan aus einem Modul übernehmen, wenn Modul 0 noch keinen hat. Leere Pläne werden nicht übernommen."""
        if self.has:
            return False
        p = clean_plan(plan)
        if not (p["items"] or any(p["bg"].values())):
            return False
        now = dt_util.now()
        self.plan, self.has = p, True
        self.meta = {"since": now.isoformat(), "src": src, "copy_until": (now + timedelta(days=KEEP_COPY_DAYS)).isoformat(), "changed": now.isoformat()}
        self._copy.async_delay_save(lambda: {"t": now.isoformat(), "src": src, "plan": p}, 1)
        self._save(1)
        s = plan_stats(p)
        _LOGGER.info("Modul 0: Grundriss aus %s übernommen (%s Etagen, %s Räume, %s Melder, %s Lampen)", src, s["floors"], s["rooms"], s["layers"]["sf"], s["layers"]["licht"])
        return True

    def set_plan(self, plan: dict[str, Any], src: str = "") -> bool:
        """Plan schreiben (Build 1: aus dem Baukasten von Modul 11). True, wenn sich etwas geändert hat."""
        p = clean_plan(plan)
        if self.has and p == self.plan:
            return False
        self.plan, self.has = p, True
        self.meta["changed"] = dt_util.now().isoformat()
        if src:
            self.meta["by"] = src
        self._save()
        for cb in list(self._listeners):
            try:
                cb()
            except Exception:  # noqa: BLE001
                _LOGGER.debug("Plan-Hörer fehlgeschlagen", exc_info=True)
        return True

    # ---- Raumliste (Build 2)
    def set_rooms(self, patch: Any) -> bool:
        """Einträge setzen; leerer Wert = wieder automatisch über den Namen."""
        if not isinstance(patch, dict):
            return False
        r = dict(self.rooms)
        for k, v in patch.items():
            if not isinstance(k, str):
                continue
            if v in ("", None):
                r.pop(k, None)
            else:
                r[k] = v
        r = clean_rooms(r)
        if r == self.rooms:
            return False
        self.rooms = r
        self._save()
        return True

    def merge_pmap(self, pmap: Any) -> int:
        """Einmalig: Zuordnung aus Modul 18 (pmap) übernehmen. Was in Modul 0 schon steht, gewinnt. Gibt die Zahl übernommener Einträge zurück."""
        if self.meta.get("pmap"):
            return 0
        add = {k: v for k, v in clean_rooms(pmap).items() if k not in self.rooms}
        self.rooms = clean_rooms({**self.rooms, **add})
        self.meta["pmap"] = dt_util.now().isoformat()
        self._save(1)
        return len(add)

    # ---- Lesen
    def users(self) -> list[str]:
        """Welche Module den Plan gerade nutzen (für Banner, Rückfrage beim Ausschalten)."""
        out = ["fh"]  # Modul 1: Wärmekarte
        wm = self.hass.data.get(DOMAIN, {}).get("wasser")
        on = (wm.modules.get("on", {}) if wm is not None else {}) or {}
        if on.get("sf"):
            out.append("sf")
        am = self.hass.data.get(DOMAIN, {}).get("addons")
        if am is not None and "licht" in (getattr(am, "live", None) or {}):  # Addon „licht“ läuft
            out.append("li")
        return out

    def snapshot(self) -> dict[str, Any]:
        return {"v": SCHEMA, "plan": self.plan, "rooms": dict(self.rooms), "has": self.has, "meta": dict(self.meta), "stats": plan_stats(self.plan), "users": self.users()}
