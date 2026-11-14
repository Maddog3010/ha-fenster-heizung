"""Anwesenheit und Urlaub: senkt alle Räume ab und gibt sie danach wieder frei."""
from __future__ import annotations

import math
import re
from datetime import date, datetime, timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.event import async_track_time_change
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import DOMAIN

MODES = ("home", "away", "vacation")
DEFAULT: dict[str, Any] = {
    "mode": "home", "origin": "manual", "from": None, "to": None, "temp": 16.0,
    "preheat": True, "preheat_time": "12:00", "auto": True, "persons": [], "away_after": 30,
    "zone": None, "people": {}, "since": None,
}
KEEP = ("mode", "origin", "from", "to", "since")  # Zustand, den reine Einstellungs-Änderungen nie anfassen


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

    Sind für die Person eigene Quellen gewählt (Geräte oder WLAN-/Router-Erkennung), zählen nur
    diese: zu Hause, sobald eine davon "home" meldet oder eine genaue Position in der Zone liegt.
    Die Personen-Entität von Home Assistant wird dann nicht mehr ausgewertet, denn sie kann über
    weitere, dort hinterlegte Tracker oder eine alte Position noch "home" melden, obwohl das
    gewählte Gerät längst unterwegs ist.
    Ohne eigene Quellen gilt wie bisher die Personen-Entität samt ihren Trackern.
    """
    cfg = cfg or {}
    acc = cfg.get("acc", 100)
    wifi = cfg.get("wifi") or None
    own = [t for t in (cfg.get("trackers") or []) if isinstance(t, str)]
    s = get_state(pid)
    usable, home, last = False, False, []
    if own or wifi:
        sources = own + ([wifi] if wifi else [])
    else:
        sources = list((s.attributes.get("device_trackers") or []) if s is not None else [])
        if s is not None:
            last.append(s.last_changed)
            if s.state not in ("unknown", "unavailable"):
                usable = True
                home = s.state == "home" or _in_zone(s.attributes, zone, acc)
    for tid in sources:
        t = get_state(tid)
        if t is None or t.state in ("unknown", "unavailable"):
            continue
        usable = True
        last.append(t.last_changed)
        if tid == wifi:
            home = home or t.state in ("home", "on")
        else:
            home = home or t.state == "home" or _in_zone(t.attributes, zone, acc)
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
    try:
        out["since"] = datetime.fromisoformat(raw["since"]).isoformat() if raw.get("since") else None
    except (TypeError, ValueError):
        out["since"] = None
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
        self._store = SafeStore(hass, 1, f"{DOMAIN}_presence")
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
        """Neue Einstellungen übernehmen.

        Ein Wechsel von Modus oder Urlaubsdaten gilt als Entscheidung (origin, since neu). Kommt nur eine Einstellung
        (Temperatur, Personen, Zone …) oder ausdrücklich keep_mode, bleiben Modus, Herkunft und Zeitpunkt wie sie sind.
        Sonst würde ein automatisches „Abwesend“ beim Speichern einer Einstellung zu einem manuellen und käme nie
        mehr von selbst auf „Zu Hause“ zurück. Ein veralteter Browser kann so auch keinen alten Modus zurückschreiben.
        """
        raw = dict(raw) if isinstance(raw, dict) else {}
        cur = self.data
        raw.pop("effective", None)
        # Nur geänderte Werte übernehmen: was im Aufruf fehlt, bleibt wie gespeichert. Früher ersetzte ein unvollständiger
        # Aufruf (zum Beispiel nur „Abwesend“ aus einem noch nicht geladenen Dashboard) Temperatur, Home-Zone und Personen
        # durch die Grundwerte.
        raw = {**{k: v for k, v in cur.items() if k not in KEEP}, **raw}
        if raw.pop("keep_mode", False):
            raw.update({k: cur.get(k) for k in KEEP})
        new = clean_presence({**raw, "origin": origin})
        if all(new.get(k) == cur.get(k) for k in ("mode", "from", "to")):
            new.update({k: cur.get(k) for k in ("origin", "since")})
        else:
            new["since"] = dt_util.now().isoformat()
        self.data = new
        await self._store.async_save(self.data)
        await self._tick(dt_util.now(), sync=False)
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

    def _arrived(self, states: list, since: str | None) -> bool:
        """Ist seit dem manuellen „Abwesend“ jemand nach Hause gekommen?"""
        try:
            t0 = datetime.fromisoformat(since) if since else None
        except ValueError:
            t0 = None
        return any(h and (t0 is None or (t is not None and t >= t0)) for h, t in states)

    async def _tick(self, now: datetime, sync: bool = True) -> None:
        p, changed = self.data, False
        stamp = {"since": now.isoformat()}
        if p["mode"] == "vacation":
            if now >= vacation_window(p)[1]:  # Urlaub vorbei: zurück auf "Zu Hause"
                self.data, changed = {**p, "mode": "home", "origin": "auto", **stamp}, True
        elif p["auto"]:
            states = self._person_states()
            if p["mode"] == "home" and states and not any(h for h, _ in states):
                latest = max((t for _, t in states if t is not None), default=now)
                try:  # nach einem „Zu Hause“ von Hand erst wieder zählen, wenn die Wartezeit ab da vorbei ist
                    latest = max(latest, datetime.fromisoformat(p["since"])) if p.get("since") else latest
                except (TypeError, ValueError):
                    pass
                if now - latest >= timedelta(minutes=p["away_after"]):
                    self.data, changed = {**p, "mode": "away", "origin": "auto", **stamp}, True
            elif p["mode"] == "away" and states and (
                any(h for h, _ in states) if p["origin"] == "auto" else self._arrived(states, p.get("since"))
            ):
                # automatisch abwesend: zurück, sobald jemand da ist. Von Hand abwesend: zurück, sobald jemand ankommt.
                self.data, changed = {**p, "mode": "home", "origin": "auto", **stamp}, True
        if changed:
            await self._store.async_save(self.data)
        if sync:
            await self._sync()

    async def _sync(self) -> None:
        eff = self.effective()
        temp = self.data["temp"] if eff in ("away", "vacation") else None
        for entry in self.hass.config_entries.async_entries(DOMAIN):
            ctrl = getattr(entry, "runtime_data", None)
            if ctrl is not None and entry.state is ConfigEntryState.LOADED and ctrl.away_temp != temp:
                await ctrl.async_set_away(temp)
