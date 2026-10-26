"""Anwesenheit und Urlaub: senkt alle Räume ab und gibt sie danach wieder frei."""
from __future__ import annotations

import re
from datetime import date, datetime, timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.event import async_track_time_change
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import DOMAIN

MODES = ("home", "away", "vacation")
DEFAULT: dict[str, Any] = {
    "mode": "home", "origin": "manual", "from": None, "to": None, "temp": 16.0,
    "preheat": True, "preheat_time": "12:00", "auto": True, "persons": [], "away_after": 30,
}


def clean_presence(raw: Any) -> dict[str, Any]:
    """Eingaben prüfen und auf gültige Werte bringen."""
    raw = raw if isinstance(raw, dict) else {}
    out = dict(DEFAULT)
    if raw.get("mode") in MODES:
        out["mode"] = raw["mode"]
    out["origin"] = "auto" if raw.get("origin") == "auto" else "manual"
    for key in ("from", "to"):
        try:
            out[key] = date.fromisoformat(raw[key]).isoformat() if raw.get(key) else None
        except (TypeError, ValueError):
            out[key] = None
    try:
        out["temp"] = min(max(round(float(raw.get("temp", 16)) * 2) / 2, 5.0), 25.0)
    except (TypeError, ValueError):
        pass
    out["preheat"] = bool(raw.get("preheat", True))
    t = str(raw.get("preheat_time", "12:00"))
    out["preheat_time"] = t if re.fullmatch(r"([01]\d|2[0-3]):[0-5]\d", t) else "12:00"
    out["auto"] = bool(raw.get("auto", True))
    out["persons"] = [p for p in (raw.get("persons") or []) if isinstance(p, str) and p.startswith("person.")][:20]
    try:
        out["away_after"] = min(max(int(raw.get("away_after", 30)), 15), 120)
    except (TypeError, ValueError):
        pass
    if out["mode"] == "vacation" and not (out["from"] and out["to"] and out["from"] <= out["to"]):
        out["mode"] = "home"  # Urlaub ohne gültige Daten gibt es nicht
    return out


def vacation_window(p: dict[str, Any]) -> tuple[datetime, datetime]:
    """Beginn (0 Uhr des Von-Tags) und Ende des Urlaubsmodus.

    Mit Vorheizen endet er am Bis-Tag zur eingestellten Uhrzeit, sonst mit Ablauf des Bis-Tags.
    """
    start = dt_util.start_of_local_day(date.fromisoformat(p["from"]))
    last = dt_util.start_of_local_day(date.fromisoformat(p["to"]))
    if p["preheat"]:
        h, m = (int(x) for x in p["preheat_time"].split(":"))
        return start, last.replace(hour=h, minute=m)
    return start, dt_util.start_of_local_day(date.fromisoformat(p["to"]) + timedelta(days=1))


class PresenceManager:
    """Hält den Anwesenheitszustand und gibt ihn an alle Räume weiter."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = Store(hass, 1, f"{DOMAIN}_presence")
        self.data: dict[str, Any] = clean_presence({})
        self._unsub: CALLBACK_TYPE | None = None

    async def async_start(self) -> None:
        self.data = clean_presence(await self._store.async_load())
        self._unsub = async_track_time_change(self.hass, self._tick, second=0)
        await self._tick(dt_util.now())

    def async_stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None

    def effective(self, now: datetime | None = None) -> str:
        p = self.data
        if p["mode"] == "vacation":
            start, end = vacation_window(p)
            return "vacation" if start <= (now or dt_util.now()) < end else "home"
        return p["mode"]

    def snapshot(self) -> dict[str, Any]:
        return {**self.data, "effective": self.effective()}

    async def async_set(self, raw: Any, origin: str = "manual") -> dict[str, Any]:
        self.data = clean_presence({**(raw if isinstance(raw, dict) else {}), "origin": origin})
        await self._store.async_save(self.data)
        await self._sync()
        return self.snapshot()

    def _person_states(self):
        ids = self.data["persons"] or [e for e in self.hass.states.async_entity_ids("person")]
        states = [self.hass.states.get(e) for e in ids]
        return [s for s in states if s is not None and s.state not in ("unknown", "unavailable")]

    async def _tick(self, now: datetime) -> None:
        p, changed = self.data, False
        if p["mode"] == "vacation":
            if now >= vacation_window(p)[1]:  # Urlaub vorbei: zurück auf "Zu Hause"
                self.data, changed = {**p, "mode": "home", "origin": "auto"}, True
        elif p["auto"]:
            states = self._person_states()
            if p["mode"] == "home" and states and all(s.state != "home" for s in states):
                latest = max(s.last_changed for s in states)
                if now - latest >= timedelta(minutes=p["away_after"]):
                    self.data, changed = {**p, "mode": "away", "origin": "auto"}, True
            elif p["mode"] == "away" and p["origin"] == "auto" and any(s.state == "home" for s in states):
                self.data, changed = {**p, "mode": "home", "origin": "auto"}, True
        if changed:
            await self._store.async_save(self.data)
        await self._sync()

    async def _sync(self) -> None:
        eff = self.effective()
        temp = self.data["temp"] if eff in ("away", "vacation") else None
        for entry in self.hass.config_entries.async_entries(DOMAIN):
            ctrl = getattr(entry, "runtime_data", None)
            if ctrl is not None and entry.state is ConfigEntryState.LOADED and ctrl.away_temp != temp:
                await ctrl.async_set_away(temp)
