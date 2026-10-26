"""Elektroheizer pro Raum: heizen nur mit PV-Überschuss, mit Leistungsstufen."""
from __future__ import annotations

import asyncio
import logging
import time
from datetime import timedelta
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.event import async_call_later, async_track_time_interval
from homeassistant.util import dt as dt_util

from .diag import diag_expect, diag_log
from .const import (
    CONF_THERMOSTATS,
    DOMAIN,
    HEATER_KEEP_DAYS,
    HEATING_MODES,
    PV_TICK_SECONDS,
)
from .pvlogic import (
    STATUS_OFF,
    STATUS_PV,
    STATUS_SOC,
    STATUS_TIME,
    STATUS_WAIT,
    STATUS_WARM,
    STATUS_WINDOW,
    allocate,
    available_surplus,
    grid_to_export,
    guess_presets,
    parse_steps,
    pv_share,
    soc_allows,
    step_decision,
    time_allowed,
    warm_state,
)

_LOGGER = logging.getLogger(__name__)
_ON_MODES = ("heat", "auto", "heat_cool")


class HeaterRoom:
    """Elektroheizer eines Raums: Zustand, Geräte-Befehle, Thermostate und Statistik."""

    def __init__(self, ctrl) -> None:
        self.ctrl = ctrl
        self.manual_on = True  # Schalter „Elektroheizer aktiv“
        self.stage = 0
        self.status = STATUS_WAIT
        self.pending: tuple[int, float] | None = None
        self.started: float | None = None
        self.warm = False
        self.saved: dict[str, dict[str, Any]] = {}  # Thermostate, die für den Heizer abgestellt wurden
        self.dev_temp: float | None = None  # Solltemperatur des Geräts vor dem Hochsetzen
        self._day = dt_util.now().date().isoformat()
        self.kwh = 0.0
        self.pv_kwh = 0.0
        self.minutes = 0.0
        self.history: dict[str, list[float]] = {}

    @property
    def hass(self) -> HomeAssistant:
        return self.ctrl.hass

    # --- Einstellungen -----------------------------------------------------
    def cfg(self) -> dict[str, Any] | None:
        c = self.ctrl.cfg
        eid = c.get("htr_entity")
        if c.get("htr_on") != "on" or not eid:
            return None
        climate = eid.startswith("climate.")
        steps = parse_steps(c.get("htr_steps"))
        watt = int(float(c.get("htr_watt") or 1500))
        presets: list[str] = []
        if climate:
            st = self.hass.states.get(eid)
            modes = (st.attributes.get("preset_modes") if st else None) or []
            n = len(steps) or 1
            explicit = [p if isinstance(p, str) else "" for p in (c.get("htr_presets") or [])]
            guess = guess_presets(modes, n)
            presets = [
                explicit[i] if i < len(explicit) and explicit[i] else (guess[i] if i < len(guess) else "")
                for i in range(n)
            ]
            steps = steps or [watt]
            if any(presets):  # Stufen ohne Voreinstellung entfallen
                keep = [i for i, p in enumerate(presets) if p]
                steps = [steps[i] for i in keep]
                presets = [presets[i] for i in keep]
            else:  # keine Voreinstellungen: nur ein und aus
                steps, presets = [max(steps)], [""]
        else:
            steps = [max(steps)] if steps else [watt]
        return {
            "entity": eid,
            "climate": climate,
            "steps": steps,
            "presets": presets,
            "target": float(c.get("htr_target") or 22.0),
            "prio": int(c.get("htr_prio") or 5),
            "start": c.get("htr_from") or None,
            "end": c.get("htr_to") or None,
            "devtemp": "keep" if c.get("htr_devtemp") == "keep" else "max",
            "auto": c.get("htr_auto") != "off",
            "thermo_off": c.get("htr_thermo") != "on",
        }

    def power(self, c: dict[str, Any] | None = None, stage: int | None = None) -> float:
        c = c or self.cfg()
        s = self.stage if stage is None else stage
        return float(c["steps"][s - 1]) if c and 0 < s <= len(c["steps"]) else 0.0

    @property
    def thermo_off_active(self) -> bool:
        return bool(self.saved)

    # --- Gerät ---------------------------------------------------------------
    def current_stage(self, c: dict[str, Any]) -> int | None:
        """Tatsächliche Stufe laut Gerät; None, wenn das Gerät nicht erreichbar ist."""
        st = self.hass.states.get(c["entity"])
        if st is None or st.state in ("unavailable", "unknown"):
            return None
        if not c["climate"]:
            return 1 if st.state == "on" else 0
        if st.state not in _ON_MODES:
            return 0
        pm = st.attributes.get("preset_mode")
        if pm in c["presets"]:
            return c["presets"].index(pm) + 1
        return 1

    async def _svc(self, domain: str, service: str, **data: Any) -> None:
        try:
            await self.hass.services.async_call(domain, service, data, blocking=True)
        except Exception as err:  # noqa: BLE001
            _LOGGER.exception("%s.%s für %s fehlgeschlagen", domain, service, data.get("entity_id"))
            diag_log(self.hass, "error", f"{domain}.{service} für {data.get('entity_id')} fehlgeschlagen: {err}", entity=data.get("entity_id"))
        else:
            if domain == "climate" and service == "set_temperature":
                diag_expect(self.hass, data.get("entity_id"), temperature=data.get("temperature"))

    async def async_apply(self, c: dict[str, Any], stage: int) -> None:
        """Gerät auf die Stufe stellen (0 = aus). Nur Befehle, die wirklich nötig sind."""
        eid = c["entity"]
        st = self.hass.states.get(eid)
        if st is None:
            return
        if not c["climate"]:
            await self._svc("switch", "turn_on" if stage else "turn_off", entity_id=eid)
            return
        attrs = st.attributes
        if stage == 0:
            if self.dev_temp is not None and st.state in _ON_MODES:
                await self._svc("climate", "set_temperature", entity_id=eid, temperature=self.dev_temp)
            self.dev_temp = None
            if st.state != "off":
                if "off" in (attrs.get("hvac_modes") or []):
                    await self._svc("climate", "set_hvac_mode", entity_id=eid, hvac_mode="off")
            return
        modes = attrs.get("hvac_modes") or []
        if st.state not in _ON_MODES:
            mode = next((m for m in ("heat", "auto", "heat_cool") if m in modes), None)
            if mode is None:
                _LOGGER.warning("%s kennt keinen Heizmodus", eid)
                diag_log(self.hass, "warning", f"{eid} kennt keinen Heizmodus", entity=eid)
                return
            await self._svc("climate", "set_hvac_mode", entity_id=eid, hvac_mode=mode)
        if c["devtemp"] == "max":
            top = attrs.get("max_temp")
            cur = attrs.get("temperature")
            if isinstance(top, (int, float)) and cur != top:
                if self.dev_temp is None and isinstance(cur, (int, float)):
                    self.dev_temp = float(cur)
                await self._svc("climate", "set_temperature", entity_id=eid, temperature=top)
        preset = c["presets"][stage - 1] if stage <= len(c["presets"]) else ""
        if preset and attrs.get("preset_mode") != preset and preset in (attrs.get("preset_modes") or []):
            await self._svc("climate", "set_preset_mode", entity_id=eid, preset_mode=preset)

    # --- Thermostate des Raums ---------------------------------------------
    async def thermo_off(self) -> None:
        ctrl = self.ctrl
        if self.saved or ctrl.active:
            return
        for eid in ctrl.cfg[CONF_THERMOSTATS]:
            st = self.hass.states.get(eid)
            if st is None or st.state not in HEATING_MODES:
                continue
            self.saved[eid] = {"hvac_mode": st.state, "temperature": st.attributes.get("temperature")}
            if "off" in (st.attributes.get("hvac_modes") or []):
                await ctrl._call("set_hvac_mode", eid, hvac_mode="off")
            else:
                low = st.attributes.get("min_temp")
                await ctrl._call("set_temperature", eid, temperature=low if isinstance(low, (int, float)) else 5)
        if self.saved:
            await ctrl._save()
            ctrl._signal()

    async def restore_thermostats(self) -> None:
        if not self.saved:
            return
        ctrl = self.ctrl
        saved, self.saved = self.saved, {}
        for eid, data in saved.items():
            st = self.hass.states.get(eid)
            if st is None or st.state == "unavailable":
                continue
            if st.state != data.get("hvac_mode"):
                await ctrl._call("set_hvac_mode", eid, hvac_mode=data["hvac_mode"])
            if data.get("temperature") is not None:
                await ctrl._call("set_temperature", eid, temperature=data["temperature"])
        await ctrl._save()
        ctrl._signal()
        await ctrl._plan_apply_if_due()  # inzwischen geänderten Heizplan nachziehen

    # --- Bedingungen ---------------------------------------------------------
    def update_warm(self, c: dict[str, Any]) -> None:
        self.warm = warm_state(self.ctrl.room_temperature(), c["target"], self.warm)

    def block_reason(self, c: dict[str, Any], soc_ok: bool) -> str | None:
        if not self.manual_on:
            return STATUS_OFF
        if self.ctrl.active or self.ctrl.window_open():
            return STATUS_WINDOW
        if not time_allowed(c["start"], c["end"], dt_util.now().strftime("%H:%M:%S")):
            return STATUS_TIME
        if self.warm:
            return STATUS_WARM
        if not soc_ok:
            return STATUS_SOC
        return None

    # --- Statistik -------------------------------------------------------------
    def _roll(self) -> None:
        today = dt_util.now().date().isoformat()
        if today == self._day:
            return
        if self.kwh > 0:
            self.history[self._day] = [round(self.kwh, 3), round(self.pv_kwh, 3), round(self.minutes, 1)]
        self.kwh = self.pv_kwh = self.minutes = 0.0
        self._day = today
        cutoff = (dt_util.now().date() - timedelta(days=HEATER_KEEP_DAYS)).isoformat()
        for k in [k for k in self.history if k < cutoff]:
            del self.history[k]

    def account(self, power_w: float, pv_w: float, dt_s: float) -> None:
        self._roll()
        if power_w <= 0 or dt_s <= 0:
            return
        self.kwh += power_w * dt_s / 3_600_000
        self.pv_kwh += min(pv_w, power_w) * dt_s / 3_600_000
        self.minutes += dt_s / 60

    def attrs(self) -> dict[str, Any] | None:
        c = self.cfg()
        if c is None:
            return None
        self._roll()
        return {
            "entity": c["entity"],
            "watt": max(c["steps"]),
            "stufen": c["steps"],
            "stufe": self.stage,
            "watt_now": self.power(c),
            "presets": c["presets"] if any(c["presets"]) else [],
            "ziel": c["target"],
            "status": self.status,
            "prio": c["prio"],
            "heute_kwh": round(self.kwh, 2),
            "heute_pv_kwh": round(self.pv_kwh, 2),
            "heute_min": round(self.minutes),
            "thermo_aus": c["thermo_off"],
            "thermo_aktiv": bool(self.saved),
            "auto": "on" if c["auto"] else "off",
            "verlauf": {k: v[:2] for k, v in sorted(self.history.items())[-8:]},
        }

    # --- Speichern -------------------------------------------------------------
    def data(self) -> dict[str, Any]:
        return {
            "manual_on": self.manual_on,
            "saved": self.saved,
            "dev_temp": self.dev_temp,
            "day": self._day,
            "kwh": round(self.kwh, 4),
            "pv_kwh": round(self.pv_kwh, 4),
            "minutes": round(self.minutes, 2),
            "history": self.history,
            "warm": self.warm,
        }

    def load(self, raw: Any) -> None:
        if not isinstance(raw, dict):
            return
        self.manual_on = raw.get("manual_on") is not False
        saved = raw.get("saved")
        self.saved = saved if isinstance(saved, dict) else {}
        dt = raw.get("dev_temp")
        self.dev_temp = float(dt) if isinstance(dt, (int, float)) else None
        self._day = raw.get("day") or self._day
        self.kwh = float(raw.get("kwh") or 0)
        self.pv_kwh = float(raw.get("pv_kwh") or 0)
        self.minutes = float(raw.get("minutes") or 0)
        hist = raw.get("history")
        self.history = {k: [float(x) for x in v] for k, v in hist.items() if isinstance(v, list)} if isinstance(hist, dict) else {}
        self.warm = bool(raw.get("warm"))
        self._roll()

    async def async_set_manual(self, on: bool) -> None:
        self.manual_on = on
        await self.ctrl._save()
        self.ctrl._signal()


class PvManager:
    """Verteilt den PV-Überschuss auf die Elektroheizer aller Räume."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._unsub: CALLBACK_TYPE | None = None
        self._first: CALLBACK_TYPE | None = None
        self._last: float | None = None
        self._lock = asyncio.Lock()

    async def async_start(self) -> None:
        self._unsub = async_track_time_interval(self.hass, self._tick, timedelta(seconds=PV_TICK_SECONDS))
        self._first = async_call_later(self.hass, 20, self._tick)

    def async_stop(self) -> None:
        for attr in ("_unsub", "_first"):
            unsub = getattr(self, attr)
            if unsub:
                unsub()
                setattr(self, attr, None)

    async def _tick(self, _now) -> None:
        await self.async_evaluate()

    def _cfg(self) -> dict[str, Any]:
        gen = self.hass.data.get(DOMAIN, {}).get("general")
        return dict((gen.data.get("pv") if gen else None) or {})

    def _number(self, eid: str | None) -> float | None:
        st = self.hass.states.get(eid) if eid else None
        if st is None:
            return None
        try:
            val = float(st.state)
        except (TypeError, ValueError):
            return None
        if st.attributes.get("unit_of_measurement") == "kW":
            val *= 1000
        return val

    def _rooms(self) -> list:
        from homeassistant.config_entries import ConfigEntryState  # noqa: PLC0415

        out = []
        for entry in self.hass.config_entries.async_entries(DOMAIN):
            ctrl = getattr(entry, "runtime_data", None)
            if ctrl is not None and entry.state is ConfigEntryState.LOADED and ctrl.heater.cfg() is not None:
                out.append(ctrl)
        return out

    async def async_evaluate(self) -> None:
        async with self._lock:
            try:
                await self._run()
            except Exception as err:  # noqa: BLE001  - die Regelung darf nie abstürzen
                _LOGGER.exception("PV-Heizer: Auswertung fehlgeschlagen")
                diag_log(self.hass, "error", f"PV-Heizer: Auswertung fehlgeschlagen: {err}")

    async def _run(self) -> None:
        rooms = self._rooms()
        now = time.time()
        dt = min(max(now - self._last, 0.0), 120.0) if self._last else 0.0
        self._last = now
        if not rooms:
            return
        pv = self._cfg()
        grid = self._number(pv.get("sensor"))
        export = grid_to_export(grid, pv.get("sign", "export")) if grid is not None else None
        soc = self._number(pv.get("soc_sensor"))
        reserve = float(pv.get("reserve", 200))
        delay = float(pv.get("delay", 3)) * 60
        minrun = float(pv.get("minrun", 10)) * 60

        items = []
        for ctrl in rooms:
            h = ctrl.heater
            c = h.cfg()
            real = h.current_stage(c)
            if real is not None and real != h.stage:
                h.stage = real  # Gerät wurde von außen geschaltet oder nach einem Neustart erkannt
                h.started = now if real > 0 else None
                h.pending = None
            h.update_warm(c)
            soc_ok = soc_allows(soc, float(pv.get("soc_min", 0)) if pv.get("soc_sensor") else 0, h.stage > 0)
            items.append((ctrl, h, c, h.block_reason(c, soc_ok), real is None))

        running = sum(h.power(c) for _, h, c, _, _ in items)
        avail = available_surplus(export, running) if export is not None else 0.0
        plan = allocate(
            [{"id": id(h), "prio": c["prio"], "steps": c["steps"], "auto": c["auto"],
              "cur": h.stage, "blocked": blocked is not None} for _, h, c, blocked, _ in items],
            avail,
            reserve,
        )
        heater_w: dict[str, float] = {}
        for ctrl, h, c, blocked, offline in items:
            if offline:  # Gerät nicht erreichbar: nichts schalten
                h.status = STATUS_WAIT
                continue
            old_stage, old_status = h.stage, h.status
            new, h.pending = step_decision(
                h.stage, plan[id(h)], h.pending, now, h.started, delay, minrun, blocked is not None
            )
            if new != h.stage:
                await h.async_apply(c, new)
                if h.stage == 0 and new > 0:
                    h.started = now
                if new == 0:
                    h.started = None
                h.stage = new
            if h.stage > 0 and c["thermo_off"] and not h.saved and not ctrl.active:
                await h.thermo_off()
            if h.stage == 0 and h.saved:
                await h.restore_thermostats()
            h.status = blocked or (STATUS_PV if h.stage > 0 else STATUS_WAIT)
            heater_w[str(id(h))] = h.power(c)
            if h.stage != old_stage or h.status != old_status:
                ctrl._store.async_delay_save(ctrl._data, 30)
                ctrl._signal()
        shares = pv_share(heater_w, export if export is not None else 0.0)
        for ctrl, h, c, _, _ in items:
            w = heater_w.get(str(id(h)), 0.0)
            h.account(w, shares.get(str(id(h)), 0.0), dt)
