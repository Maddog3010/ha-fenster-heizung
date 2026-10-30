"""Regelung mit Raumsensor (Modul 1).

Ein Heizkörperthermostat misst direkt am Heizkörper und hält sich dort oft für wärmer (oder kälter),
als der Raum wirklich ist. Mit einem eigenen Raumsensor gibt es zwei Hilfen, beide je Raum wählbar:

A  Offset-Ausgleich: Die Solltemperatur wird um den geglätteten Unterschied zwischen Thermostat
   und Raumsensor verschoben (höchstens ±3 K). Das Thermostat regelt weiter selbst, nur mit
   korrigiertem Ziel. Wirkt nur, wenn die Integration das Ziel kennt (Heizplan oder Abwesenheit),
   und nur, solange niemand die Temperatur am Gerät von Hand geändert hat.
B  Abschalten bei Ziel: Erreicht der Raumsensor das Ziel, werden die Thermostate ausgeschaltet
   (Geräte ohne Aus-Zustand: kleinste Temperatur). Erst 0,5 K unter dem Ziel geht es wieder an.

Bei offenem Fenster, „Heizung aus“ oder laufendem Elektroheizer wird nichts verändert. Fällt der
Raumsensor aus, werden ausgeschaltete Thermostate sofort wieder eingeschaltet.
"""
from __future__ import annotations

from typing import Any

from homeassistant.util import dt as dt_util

from .const import CONF_THERMOSTATS, HEATING_MODES
from .hersteller import logic as hs_logic, lookup as hs_lookup
from .pvlogic import warm_state

COMP_MAX = 3.0  # größte Verschiebung in Kelvin
COMP_ALPHA = 0.1  # Glättung je Minute (etwa 10 Minuten Zeitkonstante)
COMP_EVERY = 600  # frühestens alle 10 Minuten nachstellen (schont die Batterie)
VALVE_ATTRS = ("valve_position", "pi_heating_demand", "valve_opening", "valve", "position")


def _half(value: float) -> float:
    return round(value * 2) / 2


class RoomRegulator:
    def __init__(self, ctrl) -> None:
        self.ctrl = ctrl
        self.hass = ctrl.hass
        self.ema: dict[str, float] = {}  # geglätteter Unterschied Thermostat − Raum je Gerät
        self.sent: dict[str, float] = {}  # zuletzt von uns gesetzte Solltemperatur je Gerät
        self.when: dict[str, str] = {}  # Zeitpunkt der letzten Nachstellung je Gerät
        self.satt: dict[str, dict[str, Any]] = {}  # wegen „Ziel erreicht“ ausgeschaltete Geräte
        self.warm = False

    # --- Einstellungen ---------------------------------------------------------
    @property
    def comp_on(self) -> bool:
        return self.ctrl.cfg.get("rt_comp") == "on"

    @property
    def cut_on(self) -> bool:
        return self.ctrl.cfg.get("rt_off") == "on"

    @property
    def cutting(self) -> bool:
        return bool(self.satt)

    # --- Speichern ---------------------------------------------------------------
    def data(self) -> dict[str, Any]:
        return {
            "ema": {k: round(v, 2) for k, v in self.ema.items()},
            "sent": self.sent, "when": self.when, "satt": self.satt, "warm": self.warm,
        }

    def load(self, raw: Any) -> None:
        if not isinstance(raw, dict):
            return
        self.ema = {k: float(v) for k, v in (raw.get("ema") or {}).items() if isinstance(v, (int, float))}
        self.sent = {k: float(v) for k, v in (raw.get("sent") or {}).items() if isinstance(v, (int, float))}
        self.when = {k: str(v) for k, v in (raw.get("when") or {}).items()}
        self.satt = {k: v for k, v in (raw.get("satt") or {}).items() if isinstance(v, dict)}
        self.warm = bool(raw.get("warm"))

    # --- Offset-Ausgleich --------------------------------------------------------
    def offset(self, eid: str) -> float:
        """Verschiebung für ein Gerät; 0, wenn der Ausgleich aus ist oder kein Raumwert vorliegt."""
        if not self.comp_on or eid not in self.ema or self.ctrl.sensor_temp() is None:
            return 0.0
        return min(max(self.ema[eid], -COMP_MAX), COMP_MAX)

    def noted(self, eid: str, value: float) -> None:
        """Die Integration hat diese Solltemperatur gesetzt (Plan, Abwesenheit, Ausgleich)."""
        self.sent[eid] = float(value)
        self.when[eid] = dt_util.now().isoformat()

    def manual(self, eid: str, st) -> bool:
        """Wurde die Solltemperatur am Gerät (oder vom Gerätezeitplan) geändert?"""
        if eid not in self.sent:
            return True
        cur = st.attributes.get("temperature") if st else None
        if not isinstance(cur, (int, float)):
            return False
        return abs(float(cur) - self.sent[eid]) > 0.25

    def _learn(self, room: float) -> None:
        for eid in self.ctrl.cfg[CONF_THERMOSTATS]:
            st = self.hass.states.get(eid)
            cur = st.attributes.get("current_temperature") if st else None
            if st is None or st.state not in HEATING_MODES or not isinstance(cur, (int, float)):
                continue
            raw = float(cur) - room
            old = self.ema.get(eid)
            self.ema[eid] = raw if old is None else old + (raw - old) * COMP_ALPHA

    async def _comp(self, base: float) -> None:
        now = dt_util.now()
        for eid in self.ctrl.cfg[CONF_THERMOSTATS]:
            st = self.hass.states.get(eid)
            if st is None or st.state not in HEATING_MODES or self.manual(eid, st):
                continue
            last = dt_util.parse_datetime(self.when.get(eid, "")) if self.when.get(eid) else None
            if last is not None and (now - last).total_seconds() < COMP_EVERY:
                continue
            value = self.clamp(st, _half(base + self.offset(eid)))
            if abs(value - float(st.attributes.get("temperature") or 0)) < 0.5:
                continue
            await self.ctrl._call("set_temperature", eid, temperature=value)
            self.noted(eid, value)

    @staticmethod
    def clamp(st, value: float) -> float:
        lo, hi = st.attributes.get("min_temp"), st.attributes.get("max_temp")
        if isinstance(lo, (int, float)):
            value = max(value, lo)
        if isinstance(hi, (int, float)):
            value = min(value, hi)
        return value

    # --- Abschalten bei Ziel ------------------------------------------------------
    def _target_b(self, base: float | None) -> float | None:
        if base is not None:
            return base
        for data in self.satt.values():
            if isinstance(data.get("temperature"), (int, float)):
                return float(data["temperature"])
        for eid in self.ctrl.cfg[CONF_THERMOSTATS]:
            st = self.hass.states.get(eid)
            tgt = st.attributes.get("temperature") if st else None
            if st is not None and st.state in HEATING_MODES and isinstance(tgt, (int, float)):
                return float(tgt)  # ohne Heizplan wird nichts verschoben
        return None

    async def _cut(self) -> None:
        for eid in self.ctrl.cfg[CONF_THERMOSTATS]:
            st = self.hass.states.get(eid)
            if st is None or st.state not in HEATING_MODES:
                continue
            self.satt[eid] = {"hvac_mode": st.state, "temperature": st.attributes.get("temperature")}
            if "off" in (st.attributes.get("hvac_modes") or []) and not hs_logic(hs_lookup(self.hass, eid))["off_min"]:
                await self.ctrl._call("set_hvac_mode", eid, hvac_mode="off")
            else:
                low = st.attributes.get("min_temp")
                await self.ctrl._call("set_temperature", eid, temperature=low if isinstance(low, (int, float)) else 5)

    async def release(self) -> None:
        """Ausgeschaltete Thermostate wieder einschalten und das aktuelle Ziel setzen."""
        if not self.satt:
            return
        saved, self.satt = self.satt, {}
        self.warm = False
        ctrl = self.ctrl
        for eid, data in saved.items():
            st = self.hass.states.get(eid)
            if st is None or st.state == "unavailable":
                continue
            if data.get("hvac_mode") and st.state != data["hvac_mode"]:
                await ctrl._call("set_hvac_mode", eid, hvac_mode=data["hvac_mode"])
            if ctrl._current_target() is None and isinstance(data.get("temperature"), (int, float)):
                await ctrl._call("set_temperature", eid, temperature=data["temperature"])
        ctrl._plan_key = None
        await ctrl._save()
        ctrl._signal()
        await ctrl._plan_apply_if_due(force=True)

    # --- Minutentakt ----------------------------------------------------------------
    async def tick(self) -> None:
        ctrl = self.ctrl
        if not (self.comp_on or self.cut_on):
            await self.release()
            return
        room = ctrl.sensor_temp()
        if room is None:  # Sensor ausgefallen: lieber heizen als frieren
            await self.release()
            return
        if ctrl.active or ctrl._any_open() or ctrl._heating_off() or ctrl.heater.thermo_off_active:
            return
        if not self.satt:
            self._learn(room)
        tgt = ctrl._current_target()
        base = tgt[1] if tgt else None
        changed = False
        if self.cut_on:
            target = self._target_b(base)
            if target is not None:
                self.warm = warm_state(room, target, self.warm)
                if self.warm and not self.satt:
                    await self._cut()
                    changed = True
                elif not self.warm and self.satt:
                    await self.release()
                    return
        elif self.satt:
            await self.release()
            return
        if self.comp_on and base is not None and not self.satt:
            await self._comp(base)
        if changed:
            await ctrl._save()
            ctrl._signal()
        else:
            ctrl._store.async_delay_save(ctrl._data, 300)

    # --- Diagnose ---------------------------------------------------------------------
    def diag(self) -> dict[str, Any]:
        ctrl = self.ctrl
        tgt = ctrl._current_target()
        rows = []
        for eid in ctrl.cfg[CONF_THERMOSTATS]:
            st = self.hass.states.get(eid)
            if st is None:
                continue
            a = st.attributes
            valve = next((a[k] for k in VALVE_ATTRS if isinstance(a.get(k), (int, float))), None)
            rows.append({
                "e": eid,
                "modus": st.state,
                "soll": a.get("temperature") if isinstance(a.get("temperature"), (int, float)) else None,
                "ist": a.get("current_temperature") if isinstance(a.get("current_temperature"), (int, float)) else None,
                "diff": round(self.ema[eid], 1) if eid in self.ema else None,
                "ausgleich": round(self.offset(eid), 1),
                "ventil": valve,
                "manuell": bool(self.comp_on and tgt and st.state in HEATING_MODES and self.manual(eid, st)),
            })
        return {
            "ziel": tgt[1] if tgt else None,
            "raum": ctrl.sensor_temp(),
            "ausgleich": self.comp_on,
            "aus_bei_ziel": self.cut_on,
            "satt": bool(self.satt),
            "geraete": rows,
        }
