"""Anwesenheit und Urlaub: senkt alle Räume ab und gibt sie danach wieder frei."""
from __future__ import annotations

import math
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
    "zone": None, "people": {},
}


def clean_zone(raw: Any) -> dict[str, Any] | None:
    """Eigene Home-Zone (Mittelpunkt und Radius in Metern) oder None."""
    if not isinstance(raw, dict):
        return None
    try:
        lat, lon, r = float(raw["lat"]), float(raw["lon"]), int(round(float(raw.get("r", 150))))
    except (KeyError, TypeError, ValueError):
        return None
    if not (-90 <= lat <= 90 and -180 <= lon <= 180) or not all(map(math.isfinite, (lat, lon))):
        return None
    return {"lat": round(lat, 6), "lon": round(lon, 6), "r": min(max(r, 30), 1000)}


def clean_people(raw: Any) -> dict[str, dict[str, Any]]:
    """Einstellungen je Person: Name, Standortquellen, WLAN-Quelle, Zählregel, Genauigkeitsgrenze."""
    out: dict[str, dict[str, Any]] = {}
    if not isinstance(raw, dict):
        return out
    for pid, c in list(raw.items())[:20]:
        if not (isinstance(pid, str) and pid.startswith("person.") and isinstance(c, dict)):
            continue
        trackers = [t for t in (c.get("trackers") or []) if isinstance(t, str) and t.startswith("device_tracker.")]
        wifi = c.get("wifi")
        try:
            acc = min(max(int(c.get("acc", 100)), 20), 500)
        except (TypeError, ValueError):
            acc = 100
        out[pid] = {
            "label": str(c.get("label") or "").strip()[:40],
            "trackers": list(dict.fromkeys(trackers))[:10],
            "wifi": wifi if isinstance(wifi, str) and wifi.startswith(("device_tracker.", "binary_sensor.")) else "",
            "count": c.get("count") is not False,
            "acc": acc,
        }
    return out


def distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Entfernung zweier Punkte in Metern (Haversine)."""
    p1, p2 = math.radians(lat1), math.radians(lat2)
    a = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(math.radians(lon2 - lon1) / 2) ** 2
    return 2 * 6371000 * math.asin(math.sqrt(a))


def _in_zone(attrs: dict[str, Any], zone: dict[str, Any] | None, acc: int) -> bool:
    """Liegt die gemeldete Position in der Zone? Zu ungenaue Positionen zählen nicht."""
    if not zone:
        return False
    try:
        lat, lon = float(attrs["latitude"]), float(attrs["longitude"])
        a = attrs.get("gps_accuracy")
        if a is not None and float(a) > acc:
            return False
    except (KeyError, TypeError, ValueError):
        return False
    return distance_m(zone["lat"], zone["lon"], lat, lon) <= zone["r"]


def person_home(get_state, pid: str, cfg: dict[str, Any] | None, zone: dict[str, Any] | None):
    """(zu Hause?, letzte Änderung) einer Person oder (None, None) ohne verwertbare Daten.

    Zu Hause, wenn Home Assistant "home" meldet, eine Quelle "home" meldet, eine genaue Position
    in der Zone liegt oder die WLAN-/Router-Quelle "home" meldet.
    """
    cfg = cfg or {}
    s = get_state(pid)
    usable, home, last = [], False, []
    if s is not None:
        last.append(s.last_changed)
        if s.state not in ("unknown", "unavailable"):
            usable.append(True)
            home = home or s.state == "home" or _in_zone(s.attributes, zone, cfg.get("acc", 100))
    trackers = cfg.get("trackers") or ((s.attributes.get("device_trackers") or []) if s is not None else [])
    for tid in list(trackers) + ([cfg["wifi"]] if cfg.get("wifi") else []):
        t = get_state(tid)
        if t is None or t.state in ("unknown", "unavailable"):
            continue
        usable.append(True)
        last.append(t.last_changed)
        is_wifi = tid == cfg.get("wifi")
        home = home or t.state in ("home", "on") and is_wifi or t.state == "home" or _in_zone(t.attributes, zone, cfg.get("acc", 100))
    if not usable:
        return None, None
    return home, (max(last) if last else None)


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
    out["zone"] = clean_zone(raw.get("zone"))
    out["people"] = clean_people(raw.get("people"))
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
        self.override: dict[str, tuple[bool, datetime, datetime]] = {}  # Person -> (zu Hause?, seit, bis), zum Beispiel per Tag
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
        """Zählende Personen als Liste (zu Hause?, letzte Änderung)."""
        d = self.data
        ids = d["persons"] or list(self.hass.states.async_entity_ids("person"))
        out = []
        now = dt_util.now()
        for pid in ids:
            cfg = d["people"].get(pid)
            if cfg is not None and not cfg["count"]:
                continue
            home, last = person_home(self.hass.states.get, pid, cfg, d["zone"])
            ov = self.override.get(pid)
            if ov and now < ov[2]:
                home, last = ov[0], ov[1]
            if home is not None:
                out.append((home, last))
        return out

    async def async_person(self, pid: str, home: bool, hours: int = 12) -> bool:
        """Eine Person von Hand auf „zu Hause“ oder „unterwegs“ setzen (zum Beispiel mit einem Tag), gilt höchstens einige Stunden."""
        if not isinstance(pid, str) or not pid.startswith("person."):
            return False
        now = dt_util.now()
        self.override[pid] = (bool(home), now, now + timedelta(hours=max(1, min(24, int(hours)))))
        await self._tick(now)
        return True

    async def _tick(self, now: datetime) -> None:
        p, changed = self.data, False
        if p["mode"] == "vacation":
            if now >= vacation_window(p)[1]:  # Urlaub vorbei: zurück auf "Zu Hause"
                self.data, changed = {**p, "mode": "home", "origin": "auto"}, True
        elif p["auto"]:
            states = self._person_states()
            if p["mode"] == "home" and states and not any(h for h, _ in states):
                latest = max(t for _, t in states)
                if now - latest >= timedelta(minutes=p["away_after"]):
                    self.data, changed = {**p, "mode": "away", "origin": "auto"}, True
            elif p["mode"] == "away" and p["origin"] == "auto" and any(h for h, _ in states):
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
