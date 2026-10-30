"""Strom & Wärme: Fenster, Heizung, Warmwasser und Energie."""
from __future__ import annotations

import logging
import os
import re
from datetime import date, timedelta
from typing import Any

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.const import STATE_OFF, STATE_ON
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
    async_track_time_change,
    async_track_time_interval,
)
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .api import async_register_api
from .diag import DiagManager, diag_expect, diag_log
from .general import GeneralManager
from .geraete import GeraeteManager
from .hersteller import logic as hs_logic, lookup as hs_lookup
from .raumregelung import RoomRegulator
from .sicherheit import SicherheitManager
from .labs import LabsManager
from .muell import MuellManager
from .hausfluss import FlussManager
from .tags import TagManager
from .sponsor import SponsorManager
from .tablet import TabletManager
from .solar import SolarManager
from .wetter import WetterManager
from .wasser import WasserManager
from .heater import HeaterRoom, PvManager
from .presence import PresenceManager
from .tibber import TibberManager
from .extbackup import ExtBackup
from .wallbox import WallboxManager
from .backup import SafeStore
from .const import (
    ACTION_OFF,
    CONF_ACTION,
    CONF_ROOM_TEMP,
    CONF_BLOCK_FROM,
    CONF_BLOCK_TO,
    CONF_CLOSE_DELAY,
    CONF_DESIGN_TEMP,
    CONF_COP,
    CONF_ENERGY_PER_UNIT,
    CONF_FUEL,
    CONF_GAS_KWH_PER_M3,
    CONF_HEAT_LOAD,
    CONF_HEAT_POWER,
    CONF_HEATING_ENTITY,
    CONF_HEATING_OFF_STATES,
    CONF_NOTIFY_AFTER,
    CONF_NOTIFY_MESSAGE,
    CONF_NOTIFY_SERVICE,
    CONF_NOTIFY_TITLE,
    CONF_OPEN_DELAY,
    CONF_OUTDOOR_MAX,
    CONF_OUTDOOR_SENSOR,
    CONF_ROOM_AREA,
    CONF_SETBACK_TEMP,
    CONF_THERMOSTATS,
    CONF_WINDOWS,
    DEFAULT_CLOSE_DELAY,
    DEFAULT_DESIGN_TEMP,
    DEFAULT_COP,
    DEFAULT_FUEL,
    FUELS,
    DEFAULT_HEAT_LOAD,
    DEFAULT_HEAT_POWER,
    DEFAULT_HEATING_OFF_STATES,
    DEFAULT_NOTIFY_MESSAGE,
    DEFAULT_OPEN_DELAY,
    DEFAULT_OUTDOOR_MAX,
    DEFAULT_SETBACK_TEMP,
    DOMAIN,
    HEATING_MODES,
    LEARN_KEEP_DAYS,
    LEARN_MAX_SAMPLES,
    LEARN_MIN_DELTA,
    MODE_ACTIVE,
    MODE_DISABLED,
    MODE_PAUSED,
    MODE_WINDOW_ONLY,
    PANEL_URL,
    PLAN_MAX_TEMP,
    PLAN_MIN_TEMP,
    PLAN_MODES,
    SIGNAL_UPDATE,
    STATIC_URL,
)

_LOGGER = logging.getLogger(__name__)
PLATFORMS = ["switch", "sensor"]
RECHECK_SECONDS = 300


class _SafeDict(dict):
    """Unbekannte Platzhalter bleiben unverändert stehen."""

    def __missing__(self, key: str) -> str:
        return "{" + key + "}"


def _render(template: str, values: dict[str, Any]) -> str:
    try:
        return template.format_map(_SafeDict(values))
    except Exception:  # noqa: BLE001
        return template


def _to_min(value: str) -> int:
    try:
        h, m = str(value).split(":")
        return int(h) * 60 + int(m)
    except (ValueError, TypeError):
        return 0


def normalize_entries(raw: Any) -> list[dict[str, Any]]:
    """Schaltpunkte prüfen und vereinheitlichen. Wirft ValueError bei Fehlern."""
    out: list[dict[str, Any]] = []
    for e in raw or []:
        days = sorted({int(d) for d in e.get("days", []) if 0 <= int(d) <= 6})
        if not days:
            continue
        m = re.fullmatch(r"([01]?\d|2[0-3]):([0-5]\d)", str(e.get("time", "")))
        if not m:
            raise ValueError(f"Ungültige Uhrzeit: {e.get('time')}")
        temp = round(float(e.get("temp")) * 2) / 2
        if not PLAN_MIN_TEMP <= temp <= PLAN_MAX_TEMP:
            raise ValueError(f"Temperatur außerhalb {PLAN_MIN_TEMP}-{PLAN_MAX_TEMP} °C: {temp}")
        out.append(
            {
                "id": str(e.get("id") or f"e{len(out)}")[:16],
                "days": days,
                "time": f"{int(m[1]):02d}:{m[2]}",
                "temp": temp,
            }
        )
    out.sort(key=lambda e: (e["days"][0], e["time"]))
    return out


class WindowController:
    """Steuert die Thermostate eines Raums anhand der Fenstersensoren."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        self.enabled = True
        self.active = False  # True = Heizung gerade pausiert
        self._saved: dict[str, dict[str, Any]] = {}
        self._timer: CALLBACK_TYPE | None = None
        self._notify_timer: CALLBACK_TYPE | None = None
        self._notified = False
        self._unsub: CALLBACK_TYPE | None = None
        self._unsub_t: CALLBACK_TYPE | None = None
        self._unsub_h: CALLBACK_TYPE | None = None
        self._store = SafeStore(hass, 1, f"{DOMAIN}_{entry.entry_id}")
        # Statistik "pausiert heute"
        self._day = dt_util.now().date().isoformat()
        self._seconds = 0.0
        self._pauses = 0
        self._paused_since = None
        self._history: dict[str, float] = {}  # abgeschlossene Tage -> Sekunden
        self._archived = 0.0  # Sekunden älterer Tage (> 400 Tage)
        self._kwh = 0.0  # geschätzte Energie heute
        self._kwh_history: dict[str, float] = {}
        self._kwh_archived = 0.0
        self._last_tick = None
        self._unsub_e: CALLBACK_TYPE | None = None
        self._unsub_p: CALLBACK_TYPE | None = None
        self._plan: dict[str, Any] = {"enabled": False, "entries": [], "mode": "heat"}
        self._plan_key: int | str | None = None  # zuletzt angewandter Schaltpunkt
        self._away_temp: float | None = None  # Absenkung bei Abwesenheit oder Urlaub
        self._away_saved: dict[str, float] = {}  # Solltemperaturen vor der Absenkung
        self._learn: list[dict[str, Any]] = []  # gelernte Aufheizphasen
        self._phase: dict[str, Any] | None = None
        self._last_aired: str | None = None  # Zeitpunkt, zu dem zuletzt ein Fenster geschlossen wurde
        self._was_open = False
        self.heater = HeaterRoom(self)
        self.rt = RoomRegulator(self)  # Regelung mit Raumsensor (Offset-Ausgleich, Abschalten bei Ziel)

    @property
    def cfg(self) -> dict[str, Any]:
        return {**self.entry.data, **self.entry.options}

    async def async_start(self) -> None:
        data = await self._store.async_load() or {}
        if "saved" in data:
            self._saved = data.get("saved") or {}
            self._day = data.get("day") or self._day
            self._seconds = float(data.get("seconds") or 0)
            self._pauses = int(data.get("pauses") or 0)
            self._history = {k: float(v) for k, v in (data.get("history") or {}).items()}
            self._archived = float(data.get("archived") or 0)
            self._kwh = float(data.get("kwh") or 0)
            self._kwh_history = {
                k: float(v) for k, v in (data.get("kwh_history") or {}).items()
            }
            self._kwh_archived = float(data.get("kwh_archived") or 0)
            try:
                raw = data.get("plan") or {}
                self._plan = {
                    "enabled": bool(raw.get("enabled")),
                    "entries": normalize_entries(raw.get("entries")),
                    "mode": raw.get("mode") if raw.get("mode") in PLAN_MODES else "heat",
                }
            except (ValueError, TypeError):
                _LOGGER.warning("Gespeicherter Heizplan ist ungültig und wird ignoriert")
            self._plan_key = data.get("plan_key")
            la = data.get("last_aired")
            self._last_aired = la if isinstance(la, str) and dt_util.parse_datetime(la) else None
            self.heater.load(data.get("heater"))
            self.rt.load(data.get("rt"))
            self._learn = [x for x in (data.get("learn") or []) if isinstance(x, dict)][-LEARN_MAX_SAMPLES:]
            at = data.get("away_temp")
            self._away_temp = float(at) if isinstance(at, (int, float)) else None
            self._away_saved = {k: float(v) for k, v in (data.get("away_saved") or {}).items()}
            if data.get("paused_since"):
                self._paused_since = dt_util.parse_datetime(data["paused_since"])
        else:  # Altformat (bis 1.1.x): nur die gemerkten Thermostate
            self._saved = data
        self.active = bool(self._saved)
        if self.active and self._paused_since is None:
            self._paused_since = dt_util.now()
        self._roll()
        if self.rt.comp_on != bool(self.rt.sent):
            # Ausgleich gerade ein- oder ausgeschaltet: Ziel beim nächsten Takt neu setzen
            self._plan_key = None
            if not self.rt.comp_on:
                self.rt.sent, self.rt.when = {}, {}
        self._unsub = async_track_state_change_event(
            self.hass, self.cfg[CONF_WINDOWS], self._window_changed
        )
        self._unsub_t = async_track_state_change_event(
            self.hass, self.cfg[CONF_THERMOSTATS], self._thermostat_changed
        )
        if self.cfg.get(CONF_HEATING_ENTITY):
            self._unsub_h = async_track_state_change_event(
                self.hass, [self.cfg[CONF_HEATING_ENTITY]], self._heating_changed
            )
        self._last_tick = dt_util.now() if self.active else None
        self._unsub_p = async_track_time_change(self.hass, self._plan_tick, second=0)
        self._unsub_e = async_track_time_interval(
            self.hass, self._energy_tick, timedelta(seconds=60)
        )
        self._was_open = self._any_open()
        self._evaluate()

    async def async_stop(self) -> None:
        self._cancel_timer()
        self._cancel_notify()
        for attr in ("_unsub", "_unsub_t", "_unsub_h", "_unsub_e", "_unsub_p"):
            unsub = getattr(self, attr)
            if unsub:
                unsub()
                setattr(self, attr, None)

    # --- Zustand für Sensoren ----------------------------------------------
    def mode(self) -> str:
        if not self.enabled:
            return MODE_DISABLED
        if self.active:
            return MODE_PAUSED
        if self.heater.thermo_off_active:
            return MODE_ACTIVE  # Thermostate ruhen nur, solange der Elektroheizer läuft
        if self._heating_off():
            return MODE_WINDOW_ONLY
        for eid in self.cfg[CONF_THERMOSTATS]:
            st = self.hass.states.get(eid)
            if st is not None and st.state in HEATING_MODES:
                return MODE_ACTIVE
        return MODE_WINDOW_ONLY

    def _heating_off(self) -> bool:
        """Eigener Sensor: Zustand aus der Liste -> Heizung aus, nur Fenstermeldung."""
        eid = self.cfg.get(CONF_HEATING_ENTITY)
        if not eid:
            return False
        st = self.hass.states.get(eid)
        if st is None or st.state in ("unavailable", "unknown"):
            return False
        raw = self.cfg.get(CONF_HEATING_OFF_STATES) or DEFAULT_HEATING_OFF_STATES
        off = {x.strip().lower() for x in re.split(r"[,;]", raw) if x.strip()}
        return st.state.lower() in off

    def heating_source(self) -> str | None:
        eid = self.cfg.get(CONF_HEATING_ENTITY)
        if not eid:
            return None
        st = self.hass.states.get(eid)
        return f"{eid}: {st.state if st else 'unbekannt'}"

    @callback
    def _heating_changed(self, event: Event) -> None:
        if self._heating_off() and self.active:
            self.hass.async_create_task(self._release())
        self._evaluate()
        self._signal()

    async def _release(self) -> None:
        """Heizung ging aus: Pause beenden, ohne die Thermostate zurückzustellen."""
        self._cancel_timer()
        self._energy_step()
        now = self._roll()
        if self._paused_since:
            self._seconds += max((now - self._paused_since).total_seconds(), 0)
            self._paused_since = None
        self._saved = {}
        self.active = False
        await self._save()
        self._signal()

    def thermostat_states(self) -> dict[str, str]:
        out = {}
        for eid in self.cfg[CONF_THERMOSTATS]:
            st = self.hass.states.get(eid)
            out[eid] = st.state if st else "unbekannt"
        return out

    def _fixed_kw(self) -> float:
        return float(self.cfg.get(CONF_HEAT_POWER, DEFAULT_HEAT_POWER))

    def _roll(self):
        """Tageswechsel: abgeschlossene Tage in den Verlauf schreiben."""
        now = dt_util.now()
        today = now.date()
        cur = date.fromisoformat(self._day)
        while cur < today:
            day_start = dt_util.start_of_local_day(cur)
            end = dt_util.start_of_local_day(cur + timedelta(days=1))
            secs = self._seconds
            if self._paused_since:
                begin = max(self._paused_since, day_start)
                secs += max((end - begin).total_seconds(), 0)
                self._paused_since = end
            if secs > 0:
                self._history[cur.isoformat()] = round(secs, 1)
            if self._kwh > 0:
                self._kwh_history[cur.isoformat()] = round(self._kwh, 3)
            self._seconds = 0.0
            self._kwh = 0.0
            self._pauses = 0
            cur += timedelta(days=1)
        self._day = today.isoformat()
        cutoff = (today - timedelta(days=400)).isoformat()
        fixed = self._fixed_kw()
        for key in [k for k in self._history if k < cutoff]:
            secs = self._history.pop(key)
            self._archived += secs
            self._kwh_archived += self._kwh_history.pop(key, secs / 3600 * fixed)
        for key in [k for k in self._kwh_history if k < cutoff]:
            self._kwh_archived += self._kwh_history.pop(key)
        return now

    def seconds(self, scope: str) -> float:
        """Pausenzeit in Sekunden: day, month, year oder total."""
        now = self._roll()
        total = self._seconds
        if self._paused_since:
            total += max((now - self._paused_since).total_seconds(), 0)
        if scope == "day":
            return total
        if scope == "total":
            return total + sum(self._history.values()) + self._archived
        prefix = now.strftime("%Y-%m" if scope == "month" else "%Y")
        return total + sum(v for k, v in self._history.items() if k.startswith(prefix))

    def kwh(self, scope: str) -> float:
        """Geschätzte eingesparte Energie (kWh)."""
        now = self._roll()
        total = self._kwh
        if scope == "day":
            return total
        fixed = self._fixed_kw()
        if scope == "total":
            prefix, extra = "", self._kwh_archived
        else:
            prefix, extra = now.strftime("%Y-%m" if scope == "month" else "%Y"), 0.0
        for day, secs in self._history.items():
            if day.startswith(prefix):
                # Tage aus älteren Versionen: Sekunden mal feste Leistung
                total += self._kwh_history.get(day, secs / 3600 * fixed)
        return total + extra

    def minutes_history(self, days: int = 13) -> dict[str, float]:
        """Pausenminuten der letzten abgeschlossenen Tage (für das Dashboard)."""
        self._roll()
        today = dt_util.now().date()
        out: dict[str, float] = {}
        for i in range(1, days + 1):
            key = (today - timedelta(days=i)).isoformat()
            if key in self._history:
                out[key] = round(self._history[key] / 60, 1)
        return out

    def fuel_info(self) -> dict[str, Any]:
        """Brennstoff, Einheit und Umrechnung von kWh Wärme in Menge."""
        cfg = self.cfg
        fuel = cfg.get(CONF_FUEL)
        if fuel not in FUELS:
            fuel = DEFAULT_FUEL
        unit, default = FUELS[fuel]
        per_unit = cfg.get(CONF_ENERGY_PER_UNIT)
        if not per_unit and fuel == "erdgas":
            per_unit = cfg.get(CONF_GAS_KWH_PER_M3)  # Einstellung aus Version 2.3 und älter
        per_unit = float(per_unit or default) or default
        cop = 1.0
        if fuel == "strom":
            cop = float(cfg.get(CONF_COP) or DEFAULT_COP) or DEFAULT_COP
        return {
            "brennstoff": fuel,
            "einheit": unit,
            "energie_pro_einheit": per_unit,
            "cop": cop,
            "faktor": 1.0 / (per_unit * cop),
        }

    def saved_gas(self, scope: str) -> dict[str, Any]:
        """Grobe Schätzung des eingesparten Brennstoffs."""
        kwh = self.kwh(scope)
        info = self.fuel_info()
        amount = round(kwh * info["faktor"], 2)
        out: dict[str, Any] = {
            "gespart_menge": amount,
            "einheit": info["einheit"],
            "brennstoff": info["brennstoff"],
            "menge_pro_kwh": round(info["faktor"], 5),
            "gespartes_gas_kwh": round(kwh, 2),
        }
        if info["brennstoff"] == "erdgas":
            out["gespartes_gas_m3"] = amount  # bleibt für ältere Dashboards erhalten
        if info["brennstoff"] == "strom":
            out["cop"] = info["cop"]
        return out

    def _indoor_target(self) -> float:
        temps = [
            d.get("temperature")
            for d in self._saved.values()
            if isinstance(d.get("temperature"), (int, float))
        ]
        return sum(temps) / len(temps) if temps else 20.0

    def _outdoor_temp(self) -> float | None:
        eid = self.cfg.get(CONF_OUTDOOR_SENSOR)
        st = self.hass.states.get(eid) if eid else None
        try:
            return float(st.state)
        except (AttributeError, ValueError, TypeError):
            return None

    def room_power_kw(self) -> float:
        """Aktuelle Heizleistung des Raums.

        Mit Raumfläche: Fläche x spezifische Heizlast bei Auslegungstemperatur,
        skaliert mit (innen - außen) / (innen - Auslegung). Sonst feste Leistung.
        """
        cfg = self.cfg
        area = float(cfg.get(CONF_ROOM_AREA) or 0)
        if area <= 0:
            return self._fixed_kw()
        design_kw = area * float(cfg.get(CONF_HEAT_LOAD, DEFAULT_HEAT_LOAD)) / 1000
        t_in = self._indoor_target()
        t_design = float(cfg.get(CONF_DESIGN_TEMP, DEFAULT_DESIGN_TEMP))
        t_out = self._outdoor_temp()
        if t_out is None:
            factor = 0.5  # ohne Außensensor: pauschal halbe Auslegungsleistung
        elif t_in <= t_design:
            factor = 1.0
        else:
            factor = min(max((t_in - t_out) / (t_in - t_design), 0.0), 1.0)
        return design_kw * factor

    def power_info(self) -> dict[str, Any]:
        area = float(self.cfg.get(CONF_ROOM_AREA) or 0)
        return {
            "aktuelle_leistung_kw": round(self.room_power_kw(), 2),
            "berechnung": "Raumfläche und Außentemperatur" if area > 0 else "feste Leistung",
        }

    # --- Heizplan ----------------------------------------------------------
    def plan_dict(self) -> dict[str, Any]:
        return {
            "enabled": bool(self._plan["enabled"]),
            "entries": [dict(e) for e in self._plan["entries"]],
            "mode": self._plan.get("mode", "heat"),
        }

    @property
    def plan_enabled_flag(self) -> bool:
        return bool(self._plan["enabled"])

    def _plan_enabled(self) -> bool:
        return bool(self._plan["enabled"] and self._plan["entries"])

    def _plan_points(self) -> list[tuple[int, float]]:
        pts: list[tuple[int, float]] = []
        for e in self._plan["entries"]:
            minute = _to_min(e["time"])
            pts.extend((d * 1440 + minute, float(e["temp"])) for d in e["days"])
        return sorted(pts)

    @staticmethod
    def _week_minute(now) -> int:
        return now.weekday() * 1440 + now.hour * 60 + now.minute

    def plan_current(self, now=None) -> tuple[int, float] | None:
        """Der zuletzt erreichte Schaltpunkt der Woche (mit Umbruch zur Vorwoche)."""
        pts = self._plan_points()
        if not pts:
            return None
        w = self._week_minute(now or dt_util.now())
        cur = pts[-1]
        for point in pts:
            if point[0] <= w:
                cur = point
            else:
                break
        return cur

    def plan_next(self, now=None):
        """Nächster Schaltpunkt und Minuten bis dahin."""
        pts = self._plan_points()
        if not pts:
            return None
        w = self._week_minute(now or dt_util.now())
        for point in pts:
            if point[0] > w:
                return point, point[0] - w
        return pts[0], pts[0][0] + 10080 - w

    def plan_target(self) -> float | None:
        if not self._plan_enabled():
            return None
        cur = self.plan_current()
        return cur[1] if cur else None

    def plan_info(self) -> dict[str, Any]:
        mgr = self._general()
        info: dict[str, Any] = {"heizplan_aktiv": self._plan_enabled()}
        if mgr is not None:
            info["sommermodus"] = mgr.summer
            info["wetter_anpassung"] = mgr.delta_for(self.cfg)
        nxt = self.plan_next()
        if nxt:
            (_, temp), mins = nxt
            start = dt_util.now().replace(second=0, microsecond=0)
            info["naechste_aenderung"] = (start + timedelta(minutes=mins)).isoformat()
            info["naechste_temperatur"] = temp
        return info

    @property
    def away_temp(self) -> float | None:
        return self._away_temp

    def _current_target(self):
        """Was soll gerade gelten? Absenkung bei Abwesenheit hat Vorrang vor dem Heizplan."""
        if self._away_temp is not None:
            return "away", self._away_temp, False
        mgr = self._general()
        if mgr is not None and mgr.summer:
            return None  # Sommermodus: Heizplan ruht
        if self._plan_enabled():
            cur = self.plan_current()
            lab = self.hass.data.get(DOMAIN, {}).get("labs")
            if cur and lab is not None:
                cur = lab.vh_point(self, cur) or cur  # Lab „Smart Vorheizen“: Plan früher starten
            if cur:
                delta = mgr.delta_for(self.cfg) if mgr is not None else 0.0
                temp = min(max(cur[1] + delta, PLAN_MIN_TEMP), PLAN_MAX_TEMP)
                key = f"{cur[0]}:{delta:+g}" if delta else cur[0]
                return key, temp, self._plan.get("mode", "heat") in HEATING_MODES
        return None

    def window_open(self) -> bool:
        return self._any_open()

    def sensor_temp(self, use: str | None = None) -> float | None:
        """Wert des optionalen Raumtemperatur-Sensors (None: nicht gesetzt, aus, ausgefallen oder unplausibel)."""
        eid = self.cfg.get(CONF_ROOM_TEMP)
        if not eid or (use and self.cfg.get(use) == "off"):
            return None
        st = self.hass.states.get(eid)
        if st is None or st.state in ("unknown", "unavailable", ""):
            return None
        try:
            val = float(st.state)
        except (TypeError, ValueError):
            return None
        unit = str(st.attributes.get("unit_of_measurement") or "")
        if unit in ("°F", "F"):
            val = (val - 32) * 5 / 9
        elif unit == "K":
            val -= 273.15
        return round(val, 2) if -20 <= val <= 50 else None

    def thermostat_temperature(self) -> float | None:
        for eid in self.cfg[CONF_THERMOSTATS]:
            st = self.hass.states.get(eid)
            cur = st.attributes.get("current_temperature") if st else None
            if isinstance(cur, (int, float)):
                return float(cur)
        return None

    def room_temperature(self, use: str = "rt_heater") -> float | None:
        """Raumtemperatur: Raumsensor (falls gesetzt und für diesen Zweck aktiv), sonst erstes Thermostat."""
        val = self.sensor_temp(use)
        return val if val is not None else self.thermostat_temperature()

    @property
    def last_aired(self) -> str | None:
        return self._last_aired

    def _general(self):
        return self.hass.data.get(DOMAIN, {}).get("general")

    async def async_general_changed(self) -> None:
        """Sommermodus oder Wetter-Anpassung haben sich geändert: Ziel neu setzen."""
        self._plan_key = None
        self._signal()
        await self._plan_apply_if_due(force=True)

    # --- Lernende Aufheizzeit ------------------------------------------------
    def _room_temps(self) -> tuple[float, float] | None:
        for eid in self.cfg[CONF_THERMOSTATS]:
            st = self.hass.states.get(eid)
            if st is None or st.state not in HEATING_MODES:
                continue
            cur, tgt = st.attributes.get("current_temperature"), st.attributes.get("temperature")
            if isinstance(cur, (int, float)) and isinstance(tgt, (int, float)):
                own = self.sensor_temp("rt_learn")
                return (own if own is not None else float(cur)), float(tgt)
        return None

    def _outdoor_now(self) -> float | None:
        temp = self._outdoor_temp()
        if temp is None:
            mgr = self._general()
            temp = mgr.outdoor()[0] if mgr is not None else None
        return temp

    def _learn_step(self) -> None:
        """Jede Minute: Aufheizphasen erkennen und ihre Dauer pro Kelvin merken."""
        now = dt_util.now()
        temps = None if self.active else self._room_temps()
        if temps is None:
            self._phase = None
            return
        cur, tgt = temps
        ph = self._phase
        if ph is None:
            if tgt - cur >= LEARN_MIN_DELTA:
                self._phase = {"t": now.isoformat(), "c": cur, "g": tgt, "o": self._outdoor_now()}
            return
        if abs(tgt - ph["g"]) > 0.01:
            self._phase = None  # Ziel geändert: Messung verwerfen
            return
        start = dt_util.parse_datetime(ph["t"])
        hours = (now - start).total_seconds() / 3600 if start else 99.0
        if cur >= tgt - 0.2:
            gain = cur - ph["c"]
            if hours >= 10 / 60 and gain >= 0.8:
                cutoff = (now - timedelta(days=LEARN_KEEP_DAYS)).isoformat()
                self._learn = [x for x in self._learn if str(x.get("t", "")) >= cutoff]
                self._learn.append({
                    "t": ph["t"], "min_per_k": round(hours * 60 / gain, 1),
                    "out": ph["o"], "gain": round(gain, 1),
                })
                self._learn = self._learn[-LEARN_MAX_SAMPLES:]
                self._store.async_delay_save(self._data, 60)
            self._phase = None
        elif hours > 6:
            self._phase = None

    def learning_info(self) -> dict[str, Any] | None:
        """Gelernte Aufheizzeit für den Bericht (mindestens 3 Phasen), sonst None."""
        rows = [x for x in self._learn if isinstance(x.get("min_per_k"), (int, float)) and x["min_per_k"] > 0]
        if len(rows) < 3:
            return None

        def med(vals: list[float]) -> float:
            v = sorted(vals)
            n = len(v)
            return v[n // 2] if n % 2 else (v[n // 2 - 1] + v[n // 2]) / 2

        bands = []
        for label, lo, hi in (("Frost (unter 0 °C)", -99, 0), ("Kühl (0 bis 10 °C)", 0, 10), ("Mild (über 10 °C)", 10, 99)):
            sel = [x["min_per_k"] for x in rows if isinstance(x.get("out"), (int, float)) and lo <= x["out"] < hi]
            if sel:
                bands.append({"label": label, "min_per_k": round(med(sel)), "n": len(sel)})
        first = min(str(x["t"]) for x in rows)
        start = dt_util.parse_datetime(first)
        days = max(1, (dt_util.now() - start).days + 1) if start else 1
        return {
            "days": min(days, LEARN_KEEP_DAYS),
            "samples": len(rows),
            "rate": round(60 / med([x["min_per_k"] for x in rows]), 2),
            "bands": bands,
        }

    async def _plan_apply(self, temp: float, turn_on: bool = True) -> None:
        """Temperatur setzen; ausgeschaltete Thermostate je nach Einstellung einschalten."""
        mode = self._plan.get("mode", "heat") if turn_on else "keep"
        for eid in self.cfg[CONF_THERMOSTATS]:
            st = self.hass.states.get(eid)
            if st is None:
                continue
            if st.state not in HEATING_MODES:
                if st.state != "off" or mode not in HEATING_MODES:
                    continue  # anderer Modus (z. B. cool) oder "nicht einschalten"
                modes = st.attributes.get("hvac_modes") or []
                target = next((m for m in (mode, "heat", "auto") if m in modes), None)
                if target is None:
                    continue
                await self._call("set_hvac_mode", eid, hvac_mode=target)
            value = temp
            lo, hi = st.attributes.get("min_temp"), st.attributes.get("max_temp")
            if isinstance(lo, (int, float)):
                value = max(value, lo)
            if isinstance(hi, (int, float)):
                value = min(value, hi)
            value = self.rt.clamp(st, round((value + self.rt.offset(eid)) * 2) / 2) if self.rt.offset(eid) else value
            await self._call("set_temperature", eid, temperature=value)
            self.rt.noted(eid, value)

    async def _plan_apply_if_due(self, force: bool = False) -> None:
        """Plan- oder Absenktemperatur setzen, wenn sich das Ziel geändert hat."""
        target = self._current_target()
        if target is None:
            return
        key, temp, turn_on = target
        if self.active or self._heating_off() or self.heater.thermo_off_active or self.rt.cutting:
            return  # Fenster offen, Heizung aus, Elektroheizer läuft oder Ziel erreicht: später erneut prüfen
        if not force and key == self._plan_key:
            return
        await self._plan_apply(temp, turn_on)
        self._plan_key = key
        await self._save()
        self._signal()

    async def async_set_away(self, temp: float | None) -> None:
        """Absenkung bei Abwesenheit oder Urlaub ein- oder ausschalten."""
        if temp is None:
            if self._away_temp is None:
                return
            saved, self._away_saved, self._away_temp = self._away_saved, {}, None
            self._plan_key = None
            await self._save()
            self._signal()
            if self._plan_enabled():
                await self._plan_apply_if_due(force=True)
            elif not self.active and not self._heating_off():
                for eid, value in saved.items():  # ohne Plan: vorherige Temperaturen zurück
                    st = self.hass.states.get(eid)
                    if st is not None and st.state in HEATING_MODES:
                        await self._call("set_temperature", eid, temperature=value)
            return
        if self._away_temp is None:  # Eintritt: aktuelle Solltemperaturen merken
            self._away_saved = {}
            for eid in self.cfg[CONF_THERMOSTATS]:
                st = self.hass.states.get(eid)
                value = st.attributes.get("temperature") if st else None
                if st is not None and st.state in HEATING_MODES and isinstance(value, (int, float)):
                    self._away_saved[eid] = float(value)
        self._away_temp = float(temp)
        self._plan_key = None
        await self._save()
        self._signal()
        await self._plan_apply_if_due(force=True)

    def reasons(self) -> list[dict[str, str]]:
        """Gründe für den aktuellen Zustand, für den Knopf „Warum?“ im Dashboard."""
        cfg, hass, now = self.cfg, self.hass, dt_util.now()
        out: list[dict[str, str]] = []

        def add(level: str, text: str) -> None:
            out.append({"s": level, "t": text})

        def span(seconds: float) -> str:
            return f"{int(seconds)} Sek." if seconds < 60 else f"{int(round(seconds / 60))} Min."

        def deg(value: float) -> str:
            return f"{value:.1f} °C".replace(".", ",")

        blocked, cold = self._blocked_now(), self._outdoor_ok()
        if not self.enabled:
            add("warn", "Der Schalter „Fensterregelung“ ist ausgeschaltet")
        opened = []
        for eid in cfg[CONF_WINDOWS]:
            st = hass.states.get(eid)
            if st and st.state in (STATE_ON, "open"):
                opened.append((st.attributes.get("friendly_name", eid), dt_util.as_local(st.last_changed)))
        delay = float(cfg.get(CONF_OPEN_DELAY, DEFAULT_OPEN_DELAY))
        explained = False  # Sperrzeit bzw. Außentemperatur wurden schon als Grund genannt
        if opened:
            for name, since in opened[:3]:
                add("warn", f"{name} ist seit {since:%H:%M} Uhr offen ({span(max((now - since).total_seconds(), 0))})")
            if self.active and self._paused_since:
                since = dt_util.as_local(self._paused_since)
                add("ok", f"Verzögerung von {span(delay)} erreicht: Heizung pausiert seit {since:%H:%M} Uhr")
            elif self.enabled:
                if blocked:
                    add("info", "Sperrzeit ist aktiv: Die Heizung wird nicht pausiert")
                    explained = True
                elif not cold:
                    add("info", "Es ist draußen nicht kalt genug: Die Heizung wird nicht pausiert")
                    explained = True
                elif self._heating_off():
                    add("info", "Der Heizungs-Sensor meldet „Heizung aus“: Es wird nichts pausiert")
                else:
                    left = max(delay - (now - min(s for _, s in opened)).total_seconds(), 0)
                    add("info", f"Die Heizung pausiert in etwa {span(left)}" if left else "Die Heizung wird gleich pausiert")
        else:
            add("ok", "Alle Fenster sind geschlossen")
            if self.active:
                add("info", f"Die Heizung startet nach {span(float(cfg.get(CONF_CLOSE_DELAY, DEFAULT_CLOSE_DELAY)))} wieder")
        if cfg.get(CONF_OUTDOOR_SENSOR) and not explained:
            out_t = self._outdoor_temp()
            if out_t is not None:
                limit = float(cfg.get(CONF_OUTDOOR_MAX, DEFAULT_OUTDOOR_MAX))
                if out_t < limit:
                    add("ok" if opened else "info", f"Außentemperatur {deg(out_t)} liegt unter der Schwelle von {deg(limit)}")
                else:
                    add("info", f"Außentemperatur {deg(out_t)} liegt nicht unter der Schwelle von {deg(limit)}: Es wird nicht pausiert")
        if cfg.get(CONF_BLOCK_FROM) and cfg.get(CONF_BLOCK_TO) and not (blocked and explained):
            span_txt = f"{str(cfg[CONF_BLOCK_FROM])[:5]} bis {str(cfg[CONF_BLOCK_TO])[:5]} Uhr"
            add("info", f"Sperrzeit {span_txt} ist {'aktiv' if blocked else 'nicht aktiv'}")
        states = [hass.states.get(e) for e in cfg[CONF_THERMOSTATS]]
        heating = [s for s in states if s is not None and s.state in HEATING_MODES]
        if heating:
            add("info", f"{len(heating)} von {len(states)} Thermostaten im Heizbetrieb")
        elif not self.active:
            add("info", "Die Thermostate stehen auf „aus“, es gibt nichts zu regeln")
        if self._heating_off() and not opened:
            add("info", "Der Heizungs-Sensor meldet „Heizung aus“: Es bleibt nur die Fenstermeldung")
        if self.rt.cutting:
            add("ok", "Raumsensor hat das Ziel erreicht: Thermostate sind aus, ab 0,5 K darunter heizen sie wieder")
        if self.rt.comp_on and self.sensor_temp() is not None and not self.rt.cutting:
            offs = [self.rt.offset(e) for e in cfg[CONF_THERMOSTATS] if e in self.rt.ema]
            if self._current_target() is None:
                add("info", "Offset-Ausgleich wartet: Er wirkt nur mit Heizplan oder Abwesenheit")
            elif offs:
                big = max(offs, key=abs)
                add("info", f"Offset-Ausgleich: Thermostat misst {abs(big):.1f} K {'mehr' if big >= 0 else 'weniger'} als der Raum, Soll wird angepasst".replace(".", ","))
        if (self.rt.comp_on or self.rt.cut_on) and cfg.get(CONF_ROOM_TEMP) and self.sensor_temp() is None:
            add("warn", "Raumsensor liefert keinen Wert: Die Thermostate regeln wieder allein")
        if self._away_temp is not None:
            add("warn", f"Abwesenheit oder Urlaub: Absenkung auf {deg(self._away_temp)}")
        if self._plan["entries"]:
            if self._plan["enabled"]:
                cur, nxt = self.plan_current(), self.plan_next()
                if cur and nxt:
                    (_, ntemp), mins = nxt
                    when = now.replace(second=0, microsecond=0) + timedelta(minutes=mins)
                    gap = (when.date() - now.date()).days
                    day = "" if gap == 0 else "morgen " if gap == 1 else ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"][when.weekday()] + " "
                    add("info", f"Heizplan: aktuell {deg(cur[1])}, ab {day}{when:%H:%M} Uhr {deg(ntemp)}")
            else:
                add("info", "Der Heizplan ist ausgeschaltet")
        else:
            add("info", "Kein Heizplan eingerichtet")
        return out[:8]

    async def _plan_tick(self, _now) -> None:
        self._learn_step()
        await self._plan_apply_if_due()
        await self.rt.tick()

    async def async_set_plan(self, enabled: bool, entries: Any, mode: str | None = None) -> None:
        clean = normalize_entries(entries)
        mode = mode if mode in PLAN_MODES else self._plan.get("mode", "heat")
        self._plan = {"enabled": bool(enabled and clean), "entries": clean, "mode": mode}
        self._plan_key = None
        await self._save()
        self._signal()
        await self._plan_apply_if_due(force=True)

    async def async_set_plan_enabled(self, enabled: bool) -> None:
        self._plan["enabled"] = bool(enabled and self._plan["entries"])
        self._plan_key = None
        await self._save()
        self._signal()
        await self._plan_apply_if_due(force=True)

    def _energy_step(self) -> None:
        """Energie seit dem letzten Schritt aufaddieren (nur während einer Pause)."""
        now = self._roll()
        last, self._last_tick = self._last_tick, now
        if not self.active or last is None:
            return
        dt = min(max((now - last).total_seconds(), 0.0), 300.0)
        self._kwh += self.room_power_kw() * dt / 3600

    @callback
    def _energy_tick(self, _now) -> None:
        self._energy_step()
        if self.active:
            self._store.async_delay_save(self._data, 120)
            self._signal()

    @property
    def pauses_today(self) -> int:
        self._roll()
        return self._pauses

    @property
    def paused_since(self):
        return self._paused_since

    def _signal(self) -> None:
        async_dispatcher_send(self.hass, SIGNAL_UPDATE.format(self.entry.entry_id))

    def _data(self) -> dict[str, Any]:
        return {
            "saved": self._saved,
            "paused_since": self._paused_since.isoformat() if self._paused_since else None,
            "day": self._day,
            "seconds": self._seconds,
            "pauses": self._pauses,
            "history": self._history,
            "archived": self._archived,
            "kwh": round(self._kwh, 4),
            "kwh_history": self._kwh_history,
            "kwh_archived": round(self._kwh_archived, 4),
            "plan": self._plan,
            "plan_key": self._plan_key,
            "away_temp": self._away_temp,
            "away_saved": self._away_saved,
            "learn": self._learn,
            "last_aired": self._last_aired,
            "heater": self.heater.data(),
            "rt": self.rt.data(),
        }

    async def _save(self) -> None:
        await self._store.async_save(self._data())

    # --- Logik -------------------------------------------------------------
    def _any_open(self) -> bool:
        for eid in self.cfg[CONF_WINDOWS]:
            st = self.hass.states.get(eid)
            if st and st.state in (STATE_ON, "open"):
                return True
        return False

    @callback
    def _window_changed(self, event: Event) -> None:
        is_open = self._any_open()
        if self._was_open and not is_open:  # gelüftet: Zeitpunkt merken (übersteht Neustarts)
            self._last_aired = dt_util.now().isoformat()
            self._store.async_delay_save(self._data, 30)
            self._signal()
        self._was_open = is_open
        if is_open and self.heater.stage > 0:  # Elektroheizer sofort stoppen
            pv = self.hass.data.get(DOMAIN, {}).get("pv")
            if pv is not None:
                self.hass.async_create_task(pv.async_evaluate())
        self._evaluate()

    @callback
    def _thermostat_changed(self, event: Event) -> None:
        self._signal()

    @callback
    def _evaluate(self) -> None:
        self._cancel_timer()
        self._update_notify()  # Fenstermeldung gilt auch, wenn die Heizung aus ist
        if not self.enabled:
            return
        is_open = self._any_open()
        if is_open and not self.active and not self._heating_off():
            delay = self.cfg.get(CONF_OPEN_DELAY, DEFAULT_OPEN_DELAY)
            self._timer = async_call_later(self.hass, delay, self._suppress)
        elif not is_open and self.active:
            delay = self.cfg.get(CONF_CLOSE_DELAY, DEFAULT_CLOSE_DELAY)
            self._timer = async_call_later(self.hass, delay, self._restore)

    def _cancel_timer(self) -> None:
        if self._timer:
            self._timer()
            self._timer = None

    def _blocked_now(self) -> bool:
        """Sperrzeit: in dieser Zeit wird nichts abgeschaltet."""
        start = self.cfg.get(CONF_BLOCK_FROM)
        end = self.cfg.get(CONF_BLOCK_TO)
        if not start or not end or start == end:
            return False
        now = dt_util.now().strftime("%H:%M:%S")
        if start < end:
            return start <= now < end
        return now >= start or now < end

    def _outdoor_ok(self) -> bool:
        """True, wenn es draußen kalt genug ist (oder kein Sensor gewählt)."""
        eid = self.cfg.get(CONF_OUTDOOR_SENSOR)
        if not eid:
            return True
        st = self.hass.states.get(eid)
        try:
            return float(st.state) < float(
                self.cfg.get(CONF_OUTDOOR_MAX, DEFAULT_OUTDOOR_MAX)
            )
        except (AttributeError, ValueError, TypeError):
            return True

    def _cancel_notify(self) -> None:
        if self._notify_timer:
            self._notify_timer()
            self._notify_timer = None

    def _update_notify(self) -> None:
        minutes = self.cfg.get(CONF_NOTIFY_AFTER) or 0
        if not minutes or not self.cfg.get(CONF_NOTIFY_SERVICE) or not self.enabled:
            self._cancel_notify()
            return
        if self._any_open():
            if self._notify_timer is None and not self._notified:
                self._notify_timer = async_call_later(
                    self.hass, float(minutes) * 60, self._send_notify
                )
        else:
            self._cancel_notify()
            self._notified = False

    async def _send_notify(self, _now) -> None:
        self._notify_timer = None
        if not self._any_open():
            return
        self._notified = True
        raw = self.cfg[CONF_NOTIFY_SERVICE]
        if isinstance(raw, str):  # ältere Einträge: Text mit Komma
            raw = re.split(r"[,;\s]+", raw)
        services = [x for x in raw if x]
        minutes = int(float(self.cfg.get(CONF_NOTIFY_AFTER) or 0))
        open_names = []
        for eid in self.cfg[CONF_WINDOWS]:
            st = self.hass.states.get(eid)
            if st and st.state in (STATE_ON, "open"):
                open_names.append(st.attributes.get("friendly_name", eid))
        values = {
            "raum": self.entry.title,
            "minuten": minutes,
            "fenster": ", ".join(open_names),
        }
        template = self.cfg.get(CONF_NOTIFY_MESSAGE) or DEFAULT_NOTIFY_MESSAGE
        payload: dict[str, Any] = {"message": _render(template, values)}
        title = _render(self.cfg.get(CONF_NOTIFY_TITLE) or "", values).strip()
        if title:
            payload["title"] = title
        for service in services:
            domain, _, name = service.partition(".")
            if not name:
                domain, name = "notify", service
            try:
                await self.hass.services.async_call(
                    domain, name, payload, blocking=True
                )
            except Exception:  # noqa: BLE001
                _LOGGER.exception("Benachrichtigung über %s fehlgeschlagen", service)
                diag_log(self.hass, "error", f"Benachrichtigung über {service} fehlgeschlagen", room=self.entry.title)

    async def async_set_enabled(self, enabled: bool) -> None:
        self.enabled = enabled
        if not enabled and self.active:
            self._cancel_timer()
            await self._restore(None)
        else:
            self._evaluate()
        self._signal()

    async def _suppress(self, _now) -> None:
        self._timer = None
        if not self.enabled or not self._any_open() or self._heating_off():
            return
        if self.heater.thermo_off_active:  # Thermostate wurden für den Elektroheizer abgestellt
            await self.heater.restore_thermostats()
        if self._blocked_now() or not self._outdoor_ok():
            # später erneut prüfen, solange das Fenster offen bleibt
            self._timer = async_call_later(self.hass, RECHECK_SECONDS, self._suppress)
            return
        cfg = self.cfg
        for eid in cfg[CONF_THERMOSTATS]:
            st = self.hass.states.get(eid)
            # nur Thermostate im Heizbetrieb (heat/auto) werden angefasst;
            # "off" und alle anderen Modi bleiben unberührt
            if st is None or st.state not in HEATING_MODES:
                continue
            self._saved[eid] = {
                "hvac_mode": st.state,
                "temperature": st.attributes.get("temperature"),
            }
            if cfg.get(CONF_ACTION, ACTION_OFF) == ACTION_OFF and STATE_OFF in (
                st.attributes.get("hvac_modes") or []
            ):
                await self._call("set_hvac_mode", eid, hvac_mode=STATE_OFF)
            elif cfg.get(CONF_ACTION, ACTION_OFF) == ACTION_OFF and hs_logic(hs_lookup(self.hass, eid))["off_min"]:
                # Gerät ohne echten Aus-Zustand (z. B. Homematic IP, Shelly TRV, Danfoss Ally): kleinste Temperatur
                low = st.attributes.get("min_temp")
                await self._call("set_temperature", eid, temperature=low if isinstance(low, (int, float)) else 5)
            else:
                await self._call(
                    "set_temperature",
                    eid,
                    temperature=cfg.get(CONF_SETBACK_TEMP, DEFAULT_SETBACK_TEMP),
                )
        if self._saved and not self.active:
            self.active = True
            self._paused_since = self._roll()
            self._last_tick = self._paused_since
            self._pauses += 1
        await self._save()
        self._signal()

    async def _restore(self, _now) -> None:
        self._timer = None
        for eid, data in self._saved.items():
            st = self.hass.states.get(eid)
            if st is None or st.state == "unavailable":
                continue
            resume = data["hvac_mode"] == "auto" and "auto" in (st.attributes.get("hvac_modes") or []) and hs_logic(hs_lookup(self.hass, eid))["auto_resume"]
            if st.state != data["hvac_mode"] or resume:
                # Zeitplan-Geräte (tado, Homematic IP, FRITZ!): Automatik erneut setzen beendet die manuelle Übersteuerung
                await self._call("set_hvac_mode", eid, hvac_mode=data["hvac_mode"])
            if resume:
                continue
            if data.get("temperature") is not None:
                await self._call("set_temperature", eid, temperature=data["temperature"])
        self._energy_step()
        now = self._roll()
        if self._paused_since:
            self._seconds += max((now - self._paused_since).total_seconds(), 0)
            self._paused_since = None
        self._saved = {}
        self.active = False
        await self._save()
        self._signal()
        await self._plan_apply_if_due()  # nach dem Fenster gilt der aktuelle Plan

    async def _call(self, service: str, entity_id: str, **data: Any) -> None:
        try:
            await self.hass.services.async_call(
                "climate", service, {"entity_id": entity_id, **data}, blocking=True
            )
        except Exception as err:  # noqa: BLE001
            _LOGGER.exception("climate.%s für %s fehlgeschlagen", service, entity_id)
            diag_log(self.hass, "error", f"climate.{service} für {entity_id} fehlgeschlagen: {err}", entity=entity_id, room=self.entry.title)
        else:
            if service == "set_temperature":
                diag_expect(self.hass, entity_id, temperature=data.get("temperature"))
            elif service == "set_hvac_mode":
                diag_expect(self.hass, entity_id, hvac_mode=data.get("hvac_mode"))


async def _async_register_panel(hass: HomeAssistant) -> None:
    """Dashboard als Eintrag in der Seitenleiste bereitstellen."""
    store = hass.data.setdefault(DOMAIN, {})
    if not store.get("api"):
        async_register_api(hass)
        store["api"] = True
    path = os.path.join(os.path.dirname(__file__), "frontend")
    if not store.get("static"):
        try:
            await hass.http.async_register_static_paths(
                [StaticPathConfig(STATIC_URL, path, True)]
            )
        except RuntimeError:  # Pfad ist bereits registriert
            pass
        store["static"] = True
    if store.get("panel"):
        return
    version = await hass.async_add_executor_job(
        lambda: int(os.path.getmtime(os.path.join(path, "panel.js")))
    )
    try:
        await panel_custom.async_register_panel(
            hass,
            webcomponent_name="fenster-heizung-panel",
            frontend_url_path=PANEL_URL,
            module_url=f"{STATIC_URL}/panel.js?v={version}",
            sidebar_title="Strom & Wärme",
            sidebar_icon="mdi:window-open-variant",
            require_admin=False,
            config={},
            embed_iframe=False,
        )
    except ValueError:  # Panel existiert bereits
        pass
    store["panel"] = True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    controller = WindowController(hass, entry)
    entry.runtime_data = controller
    await controller.async_start()
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_reload))
    await _async_register_panel(hass)
    store = hass.data.setdefault(DOMAIN, {})
    if "presence" not in store:
        store["presence"] = PresenceManager(hass)
        await store["presence"].async_start()
    if "general" not in store:
        store["general"] = GeneralManager(hass)
        await store["general"].async_start()
    if "diag" not in store:
        store["diag"] = DiagManager(hass)
        await store["diag"].async_start()
    if "pv" not in store:
        store["pv"] = PvManager(hass)
        await store["pv"].async_start()
    if "wasser" not in store:
        store["wasser"] = WasserManager(hass)
        await store["wasser"].async_start()
    if "geraete" not in store:
        store["geraete"] = GeraeteManager(hass)
        await store["geraete"].async_start()
    if "tibber" not in store:
        store["tibber"] = TibberManager(hass)
        await store["tibber"].async_start()
    if "extbak" not in store:
        store["extbak"] = ExtBackup(hass)
        await store["extbak"].async_start()
    if "wallbox" not in store:
        store["wallbox"] = WallboxManager(hass)
        await store["wallbox"].async_start()
    if "wetter" not in store:
        store["wetter"] = WetterManager(hass)
        await store["wetter"].async_start()
    if "solar" not in store:
        store["solar"] = SolarManager(hass)
        await store["solar"].async_start()
    if "labs" not in store:
        store["labs"] = LabsManager(hass)
        await store["labs"].async_start()
    if "muell" not in store:
        store["muell"] = MuellManager(hass)
        await store["muell"].async_start()
    if "fluss" not in store:
        store["fluss"] = FlussManager(hass)
        await store["fluss"].async_start()
    if "tags" not in store:
        store["tags"] = TagManager(hass)
        await store["tags"].async_start()
    if "tablet" not in store:
        store["tablet"] = TabletManager(hass)
        await store["tablet"].async_start()
    if "sponsor" not in store:
        store["sponsor"] = SponsorManager(hass)
        await store["sponsor"].async_start()
    if "sicherheit" not in store:
        store["sicherheit"] = SicherheitManager(hass)
        await store["sicherheit"].async_start()
    return True


async def _reload(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if ok:
        await entry.runtime_data.async_stop()
        others = [
            e
            for e in hass.config_entries.async_entries(DOMAIN)
            if e.entry_id != entry.entry_id and e.state is ConfigEntryState.LOADED
        ]
        if not others:  # letzter Raum entfernt: Seitenleisten-Eintrag wieder löschen
            frontend.async_remove_panel(hass, PANEL_URL, warn_if_unknown=False)
            hass.data.get(DOMAIN, {}).pop("panel", None)
            mgr = hass.data.get(DOMAIN, {}).pop("presence", None)
            if mgr is not None:
                mgr.async_stop()
            gen = hass.data.get(DOMAIN, {}).pop("general", None)
            if gen is not None:
                gen.async_stop()
            dgm = hass.data.get(DOMAIN, {}).pop("diag", None)
            if dgm is not None:
                dgm.async_stop()
            pvm = hass.data.get(DOMAIN, {}).pop("pv", None)
            if pvm is not None:
                pvm.async_stop()
            wwm = hass.data.get(DOMAIN, {}).pop("wasser", None)
            if wwm is not None:
                wwm.async_stop()
            gsm = hass.data.get(DOMAIN, {}).pop("geraete", None)
            if gsm is not None:
                gsm.async_stop()
            wbm = hass.data.get(DOMAIN, {}).pop("wallbox", None)
            if wbm is not None:
                wbm.async_stop()
            wxm = hass.data.get(DOMAIN, {}).pop("wetter", None)
            if wxm is not None:
                wxm.async_stop()
            spm = hass.data.get(DOMAIN, {}).pop("solar", None)
            if spm is not None:
                spm.async_stop()
            lbm = hass.data.get(DOMAIN, {}).pop("labs", None)
            if lbm is not None:
                lbm.async_stop()
            mum = hass.data.get(DOMAIN, {}).pop("muell", None)
            if mum is not None:
                mum.async_stop()
            tgm = hass.data.get(DOMAIN, {}).pop("tags", None)
            if tgm is not None:
                tgm.async_stop()
            hass.data.get(DOMAIN, {}).pop("fluss", None)
            tbm = hass.data.get(DOMAIN, {}).pop("tablet", None)
            if tbm is not None:
                tbm.async_stop()
            spn = hass.data.get(DOMAIN, {}).pop("sponsor", None)
            if spn is not None:
                spn.async_stop()
            sfm = hass.data.get(DOMAIN, {}).pop("sicherheit", None)
            if sfm is not None:
                sfm.async_stop()
            hass.data.get(DOMAIN, {}).pop("tibber", None)
            ebm = hass.data.get(DOMAIN, {}).pop("extbak", None)
            if ebm is not None:
                ebm.async_stop()
    return ok
