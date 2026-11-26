"""Elektroheizer pro Raum: mit PV-Überschuss und – wenn gewählt – als Zusatzheizung bei Frost, mit Leistungsstufen."""
from __future__ import annotations

import asyncio
import logging
import math
import re
import time
from datetime import timedelta
from typing import Any

from homeassistant.const import EVENT_HOMEASSISTANT_STOP
from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.event import async_call_later, async_track_time_interval
from homeassistant.util import dt as dt_util

from .diag import diag_expect, diag_log
from .const import (
    CONF_NOTIFY_SERVICE,
    CONF_ROOM_TEMP,
    CONF_THERMOSTATS,
    DOMAIN,
    HEATER_KEEP_DAYS,
    HEATING_MODES,
    PV_TICK_SECONDS,
)
from .preisdienst import preis
from .pvlogic import (
    FROST_AWAY,
    FROST_CONFIRM,
    FROST_GRID,
    FROST_HEATOFF,
    FROST_LIMIT,
    FROST_PAUSE,
    FROST_PAUSE_S,
    FROST_PRICE,
    FROST_SENSOR,
    FROST_WAIT,
    FROST_WARM,
    STATUS_FROST,
    STATUS_OFF,
    STATUS_PV,
    STATUS_SOC,
    STATUS_TIME,
    STATUS_WAIT,
    STATUS_WARM,
    STATUS_WINDOW,
    allocate,
    available_surplus,
    frost_grid,
    frost_state,
    frost_step,
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


def geraetefehler(err: BaseException) -> bool:
    """True, wenn das Gerät oder seine Integration den Befehl nicht ausführen konnte (Funk, Hub, Cloud) – kein Programmfehler."""
    return isinstance(err, (HomeAssistantError, TimeoutError, OSError))
_ON_MODES = ("heat", "auto", "heat_cool")
SENSOR_STALE = timedelta(hours=2)  # Raumsensor ohne neuen Wert: Zusatzheizung aus
CMD_GRACE_S = 90  # so lange darf ein Gerät nach einem Befehl noch den alten Zustand melden
STOP_WATCH_S = 180  # so lange wird nach dem Ende der Zusatzheizung geprüft, ob das Gerät wirklich aus ist
EFFECT_S = 3600  # nach so viel Zuheizen muss der Raum wärmer sein
EFFECT_MIN = 0.3


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
        self.pv_stage = 0  # Stufe, die die PV-Regel will (ohne Frost gleich `stage`)
        self.cmd_at = 0.0  # letzter Schaltbefehl
        self.frost = frost_state()
        self.frost_on = False  # das Gerät läuft gerade wegen der Frostregel (Netzstrom)
        self.orphan = False  # lief zuletzt ohne Regelung (Neustart, nicht erreichbar): sofort neu bewerten
        self.frost_entity: str | None = None  # Gerät, das die Frostregel eingeschaltet hat
        self.frost_stop_at = 0.0
        self.frost_status: str | None = None
        self.frost_rest: float | None = None
        self.frost_s = 0.0  # heute zugeheizt (Sekunden)
        self.cost = 0.0  # Netzstrom heute in Euro
        self.effect: dict[str, float] | None = None
        self.warned: dict[str, str] = {}

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
        mode = c.get("htr_mode") if c.get("htr_mode") in ("frost", "both") else "pv"

        def val(key: str, default: float) -> float:
            v = c.get(key)
            return float(default if v in (None, "") else v)

        return {
            "mode": mode,
            "frost": {
                "out": val("htr_frost_out", 0),
                "target": val("htr_frost_target", 21),
                "wait": val("htr_frost_wait", 20) * 60,
                "max_run": val("htr_frost_run", 60) * 60,
                "max_day": val("htr_frost_day", 8) * 3600,
                "stage": max(1, min(len(steps), int(val("htr_frost_stage", 1)))),
                "from": c.get("htr_frost_from") or "06:00:00",
                "to": c.get("htr_frost_to") or "22:00:00",
                "ok": c.get("htr_frost_ok") == "on",
            },
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
            if geraetefehler(err):  # das Gerät lehnt ab: im Protokoll vermerken, aber kein Programmfehler
                _LOGGER.warning("%s.%s für %s fehlgeschlagen: %s", domain, service, data.get("entity_id"), err)
            else:
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

    async def release(self) -> None:
        """Elektroheizer wurde in den Einstellungen abgeschaltet: Gerät aus, Thermostate zurück."""
        eid = self.ctrl.cfg.get("htr_entity")
        if (self.stage > 0 or self.saved or self.dev_temp is not None) and eid and self.hass.states.get(eid) is not None:  # nach dem Neuladen ist die Stufe unbekannt
            await self.async_apply({"entity": eid, "climate": eid.startswith("climate."), "presets": [], "devtemp": "max"}, 0)
        self.stage, self.pending, self.started = 0, None, None
        self.pv_stage, self.frost_on, self.orphan = 0, False, False
        self.frost, self.frost_status, self.frost_rest, self.effect = frost_state(), None, None, None
        self.status = STATUS_OFF
        await self.restore_thermostats()

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

    # --- Zusatzheizung bei Frost -------------------------------------------
    def frost_temp(self) -> float | None:
        """Wert des Raumsensors (Pflicht). None: nicht gesetzt, ausgefallen oder seit 2 Stunden ohne neuen Wert."""
        val = self.ctrl.sensor_temp(None)
        if val is None:
            return None
        st = self.hass.states.get(self.ctrl.cfg.get(CONF_ROOM_TEMP))
        last = getattr(st, "last_reported", None) or getattr(st, "last_updated", None)
        if last is not None and dt_util.utcnow() - last > SENSOR_STALE:
            return None
        return val

    def outdoor_temp(self) -> float | None:
        """Außensensor des Raums, sonst der Sensor aus „Darstellung“, sonst das Wetter."""
        val = self.ctrl._outdoor_temp()
        if val is not None:
            return val
        gen = self.hass.data.get(DOMAIN, {}).get("general")
        return gen.outdoor()[0] if gen is not None else None

    def frost_block(self, c: dict[str, Any]) -> str | None:
        if not self.manual_on:
            return STATUS_OFF
        if not c["frost"]["ok"]:
            return FROST_CONFIRM
        if self.ctrl.active or self.ctrl.window_open():
            return STATUS_WINDOW
        if self.ctrl.away_temp is not None:
            return FROST_AWAY
        gen = self.hass.data.get(DOMAIN, {}).get("general")
        if (gen is not None and gen.summer) or self.ctrl._heating_off():
            return FROST_HEATOFF
        if not time_allowed(c["frost"]["from"], c["frost"]["to"], dt_util.now().strftime("%H:%M:%S")):
            return STATUS_TIME
        return None

    async def async_switch_off(self, entity: str) -> None:
        await self.async_apply({"entity": entity, "climate": entity.startswith("climate."), "presets": [], "devtemp": "max"}, 0)

    async def async_frost_off(self) -> None:
        """Läuft der Heizer wegen Frost, sofort ausschalten (Beenden, Entladen des Raums)."""
        if not self.frost_on or not self.frost_entity:
            return
        st = self.hass.states.get(self.frost_entity)
        if st is None or st.state in ("unavailable", "unknown"):
            self.orphan = True  # nicht erreichbar: beim nächsten Kontakt neu bewerten
        else:
            await self.async_switch_off(self.frost_entity)
        self.stage = self.pv_stage = 0
        self.pending = self.started = None
        self.frost_on, self.frost = False, frost_state()
        await self.ctrl._save()

    async def async_warn(self, kind: str, msg: str) -> None:
        """Meldung an die Benachrichtigung des Raums, sonst an Home Assistant (je Art einmal am Tag)."""
        self._roll()
        if self.warned.get(kind) == self._day:
            return
        self.warned[kind] = self._day
        title = f"Elektroheizer · {getattr(getattr(self.ctrl, 'entry', None), 'title', 'Raum')}"
        raw = self.ctrl.cfg.get(CONF_NOTIFY_SERVICE) or []
        services = [x for x in (re.split(r"[,;\s]+", raw) if isinstance(raw, str) else raw) if x]
        calls = [(s.partition(".")[0], s.partition(".")[2]) if "." in s else ("notify", s) for s in services]
        for domain, name in calls or [("persistent_notification", "create")]:
            data = {"title": title, "message": msg}
            if domain == "persistent_notification":
                data["notification_id"] = f"{DOMAIN}_frost_{kind}_{getattr(getattr(self.ctrl, 'entry', None), 'entry_id', '')}"
            try:
                await self.hass.services.async_call(domain, name, data, blocking=True)
            except Exception as err:  # noqa: BLE001 - eine Meldung darf die Regelung nie stören
                _LOGGER.warning("Meldung über %s.%s fehlgeschlagen: %s", domain, name, err)
        diag_log(self.hass, "warning", f"{title}: {msg}")

    async def async_effect(self, dt_s: float, temp: float | None) -> None:
        """Wirkung prüfen: nach einer Stunde Zuheizen muss der Raum mindestens 0,3 °C wärmer sein."""
        if temp is None:
            return
        if self.effect is None:
            self.effect = {"temp": temp, "s": 0.0}
        self.effect["s"] += dt_s
        if self.effect["s"] < EFFECT_S:
            return
        if temp - self.effect["temp"] < EFFECT_MIN:
            await self.async_warn("effect", f"Seit einer Stunde wird zugeheizt, aber der Raum wird kaum wärmer ({temp:.1f} °C). Bitte Heizer, Sensor und Fenster prüfen.")
        self.effect = {"temp": temp, "s": 0.0}

    # --- Statistik -------------------------------------------------------------
    def _roll(self) -> None:
        today = dt_util.now().date().isoformat()
        if today == self._day:
            return
        if self.kwh > 0:
            self.history[self._day] = [round(self.kwh, 3), round(self.pv_kwh, 3), round(self.minutes, 1)]
        self.kwh = self.pv_kwh = self.minutes = 0.0
        self.frost_s = self.cost = 0.0
        self._day = today
        cutoff = (dt_util.now().date() - timedelta(days=HEATER_KEEP_DAYS)).isoformat()
        for k in [k for k in self.history if k < cutoff]:
            del self.history[k]

    def account(self, power_w: float, pv_w: float, dt_s: float, frost: bool = False, ct: float | None = None) -> None:
        self._roll()
        if frost and dt_s > 0:
            self.frost_s += dt_s
        if ct is not None and power_w > 0 and dt_s > 0:
            self.cost += max(0.0, power_w - pv_w) * dt_s / 3_600_000 * ct / 100
        if power_w <= 0 or dt_s <= 0:
            return
        self.kwh += power_w * dt_s / 3_600_000
        self.pv_kwh += min(pv_w, power_w) * dt_s / 3_600_000
        self.minutes += dt_s / 60

    def stats_data(self) -> dict[str, Any]:
        """Statistik des Heizers (für den Papierkorb beim Entfernen)."""
        self._roll()
        return {"day": self._day, "kwh": round(self.kwh, 4), "pv_kwh": round(self.pv_kwh, 4),
                "minutes": round(self.minutes, 2), "history": dict(self.history)}

    def load_stats(self, raw: dict[str, Any]) -> None:
        """Statistik eines Heizers übernehmen, der aus einem anderen Raum hierher gestellt wurde."""
        if not isinstance(raw, dict):
            return
        self._day = raw.get("day") or self._day
        self.kwh = float(raw.get("kwh") or 0)
        self.pv_kwh = float(raw.get("pv_kwh") or 0)
        self.minutes = float(raw.get("minutes") or 0)
        hist = raw.get("history")
        self.history = {k: [float(x) for x in v] for k, v in hist.items() if isinstance(v, list)} if isinstance(hist, dict) else {}
        if "manual_on" in raw:
            self.manual_on = raw.get("manual_on") is not False
        self._roll()

    def reset_stats(self) -> None:
        """Statistik leeren (neues Gerät im Raum oder Heizer entfernt)."""
        self.kwh = self.pv_kwh = self.minutes = 0.0
        self.frost_s = self.cost = 0.0
        self.history = {}
        self._day = dt_util.now().date().isoformat()

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
            "modus": c["mode"],
            "heute_kosten": round(self.cost, 2),
            "frost": None if c["mode"] == "pv" else {
                "ziel": c["frost"]["target"],
                "grenze": c["frost"]["out"],
                "status": self.frost_status,
                "rest_min": None if self.frost_rest is None else max(1, math.ceil(self.frost_rest / 60)),
                "raum": self.frost_temp(),
                "aussen": self.outdoor_temp(),
                "heute_min": round(self.frost_s / 60),
                "max_std": round(c["frost"]["max_day"] / 3600),
                "max_min": round(c["frost"]["max_run"] / 60),
                "laeuft": self.frost_on,
            },
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
            "frost_on": self.frost_entity if self.frost_on or self.orphan else None,
            "frost_pause": self.frost.get("pause"),
            "frost_s": round(self.frost_s),
            "cost": round(self.cost, 4),
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
        ent = raw.get("frost_on")
        self.frost_entity = ent if isinstance(ent, str) and ent else None
        self.orphan = self.frost_entity is not None
        pause = raw.get("frost_pause")
        self.frost["pause"] = float(pause) if isinstance(pause, (int, float)) else None
        self.frost_s = float(raw.get("frost_s") or 0)
        self.cost = float(raw.get("cost") or 0)
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
        self._unsub_stop: CALLBACK_TYPE | None = None
        self._last: float | None = None
        self._lock = asyncio.Lock()

    async def async_start(self) -> None:
        self._unsub = async_track_time_interval(self.hass, self._tick, timedelta(seconds=PV_TICK_SECONDS))
        self._first = async_call_later(self.hass, 20, self._tick)
        bus = getattr(self.hass, "bus", None)
        if bus is not None:
            self._unsub_stop = bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, self._on_stop)

    async def _on_stop(self, _event) -> None:
        """Home Assistant wird beendet: Zusatzheizungen aus."""
        self._unsub_stop = None
        async with self._lock:
            for ctrl in self._rooms():
                try:
                    await ctrl.heater.async_frost_off()
                except Exception:  # noqa: BLE001
                    _LOGGER.warning("Zusatzheizung beim Beenden nicht ausgeschaltet", exc_info=True)

    def async_stop(self) -> None:
        for attr in ("_unsub", "_first", "_unsub_stop"):
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

    def _frost_cfg(self) -> dict[str, Any]:
        gen = self.hass.data.get(DOMAIN, {}).get("general")
        return {"watt": 2000, "price_on": False, "price": 40.0, **((gen.data.get("frost") if gen else None) or {})}

    def tarif_ct(self) -> float | None:
        """Aktueller Preis aus Modul 14, nur mit dynamischem Tarif (Tibber oder Preis-Sensor)."""
        tm = self.hass.data.get(DOMAIN, {}).get("tarif")
        try:
            if tm is None or not tm.active() or tm.src not in ("tibber", "sensor"):
                return None
            return tm.at()
        except Exception:  # noqa: BLE001 - ohne Preis wird trotzdem geheizt
            return None

    def frost_info(self) -> dict[str, Any]:
        """Für die Oberfläche: Regeln für alle Heizer und der Strompreis jetzt."""
        cfg = self._frost_cfg()
        ct = self.tarif_ct()
        tm = self.hass.data.get(DOMAIN, {}).get("tarif")
        dyn = bool(tm is not None and tm.active() and getattr(tm, "src", "") in ("tibber", "sensor"))
        return {**cfg, "tarif": dyn, "ct": None if ct is None else round(ct, 2), "teuer": self._price_high(cfg, ct)}

    @staticmethod
    def _price_high(cfg: dict[str, Any], ct: float | None) -> bool:
        return bool(cfg["price_on"] and ct is not None and ct > float(cfg["price"]))

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

    async def _release_disabled(self) -> None:
        from homeassistant.config_entries import ConfigEntryState  # noqa: PLC0415

        for entry in self.hass.config_entries.async_entries(DOMAIN):
            ctrl = getattr(entry, "runtime_data", None)
            if ctrl is None or entry.state is not ConfigEntryState.LOADED or ctrl.heater.cfg() is not None:
                continue
            if ctrl.heater.orphan and ctrl.heater.frost_entity:
                await ctrl.heater.async_switch_off(ctrl.heater.frost_entity)
                ctrl.heater.orphan = False
            if ctrl.heater.stage > 0 or ctrl.heater.saved or ctrl.heater.dev_temp is not None:
                await ctrl.heater.release()
                ctrl._signal()

    async def _run(self) -> None:
        await self._release_disabled()
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
            if real is not None:
                if h.orphan:  # lief ohne Regelung: die Frostregel entscheidet jetzt sofort, ob er weiterlaufen darf
                    h.orphan = False
                    if h.frost_entity != c["entity"]:
                        await h.async_switch_off(h.frost_entity)
                        h.stage = h.pv_stage = real
                    else:
                        h.stage, h.pv_stage, h.frost_on = real, 0, real > 0
                    h.started = now if h.pv_stage > 0 else None
                    h.pending = None
                    await ctrl._save()
                elif h.frost_on:
                    if real == 0 and now - h.cmd_at > CMD_GRACE_S:  # von Hand oder von der Steckdose ausgeschaltet
                        h.stage = h.pv_stage = 0
                        h.started = h.pending = None
                        h.frost_on = False
                        h.frost["run"] = None
                        h.frost["pause"] = now + FROST_PAUSE_S
                elif real != h.stage:
                    if h.stage == 0 and now - h.frost_stop_at < STOP_WATCH_S:  # Zusatzheizung beendet, Gerät noch an
                        if now - h.cmd_at > CMD_GRACE_S:
                            await h.async_apply(c, 0)
                            h.cmd_at = now
                    else:
                        h.stage = h.pv_stage = real  # Gerät wurde von außen geschaltet oder nach einem Neustart erkannt
                        h.started = now if real > 0 else None
                        h.pending = None
            h.update_warm(c)
            soc_ok = soc_allows(soc, float(pv.get("soc_min", 0)) if pv.get("soc_sensor") else 0, h.pv_stage > 0)
            if c["mode"] == "frost":  # keine PV-Regel; Fenster und Schalter gelten trotzdem sofort
                blocked = STATUS_OFF if not h.manual_on else STATUS_WINDOW if ctrl.active or ctrl.window_open() else None
            else:
                blocked = h.block_reason(c, soc_ok)
            items.append((ctrl, h, c, blocked, real is None))

        running = sum(h.power(c) for _, h, c, _, _ in items)
        avail = available_surplus(export, running) if export is not None else 0.0
        plan = allocate(
            [{"id": id(h), "prio": c["prio"], "steps": c["steps"], "auto": c["auto"],
              "cur": 0 if c["mode"] == "frost" else h.pv_stage, "blocked": blocked is not None or c["mode"] == "frost"}
             for _, h, c, blocked, _ in items],
            avail,
            reserve,
        )
        # 1. PV-Regel
        pv_new: dict[int, int] = {}
        for ctrl, h, c, blocked, offline in items:
            if offline:
                continue
            new, h.pending = step_decision(
                h.pv_stage, plan[id(h)], h.pending, now, h.started, delay, minrun, blocked is not None
            )
            pv_new[id(h)] = new
        # 2. Frostregel: füllt nur die Lücke, die der PV-Überschuss lässt
        fcfg = self._frost_cfg()
        high = self._price_high(fcfg, self.tarif_ct())
        wants: list[dict[str, Any]] = []
        for ctrl, h, c, _, offline in items:
            h.frost_status, h.frost_rest = None, None
            if c["mode"] == "pv" or offline:
                if c["mode"] == "pv":
                    h.frost = frost_state()
                continue
            f = c["frost"]
            covered = pv_new[id(h)] >= f["stage"]
            if covered:
                h.frost["run"] = None
                continue
            h._roll()
            status, on, rest = frost_step(
                f, h.frost, now, outdoor=h.outdoor_temp(), temp=h.frost_temp(), blocked=h.frost_block(c),
                price_high=high, minrun_s=minrun, day_s=h.frost_s,
            )
            h.frost_status, h.frost_rest = status, rest
            if on:
                wants.append({"id": id(h), "prio": c["prio"], "steps": c["steps"], "want": f["stage"]})
        granted = frost_grid(wants, float(fcfg["watt"]))

        # 3. Schalten
        heater_w: dict[str, float] = {}
        for ctrl, h, c, blocked, offline in items:
            if offline:  # Gerät nicht erreichbar: nichts schalten
                if h.frost_on:
                    await h.async_warn("offline", "Der laufende Elektroheizer ist nicht erreichbar. Bitte am Gerät prüfen.")
                    h.frost_on, h.orphan = False, True
                    h.frost["run"] = None
                    await ctrl._save()
                    ctrl._signal()
                h.status = STATUS_WAIT
                continue
            old = (h.stage, h.status, h.frost_status, h.frost_on)
            was_frost = h.frost_on
            pvs = pv_new[id(h)]
            if h.pv_stage == 0 and pvs > 0:
                h.started = now
            if pvs == 0:
                h.started = None
            h.pv_stage = pvs
            grid = granted.get(id(h))
            if grid == 0:
                h.frost_status = FROST_GRID
                h.frost["run"] = None
            frost_drives = bool(grid) and grid > pvs
            new = grid if frost_drives else pvs
            if new != h.stage:
                await h.async_apply(c, new)
                h.cmd_at = now
                h.stage = new
            elif frost_drives and new != h.current_stage(c) and now - h.cmd_at > CMD_GRACE_S:
                await h.async_apply(c, new)  # Stufe am Gerät weicht ab
                h.cmd_at = now
            h.frost_on = frost_drives
            if frost_drives:
                h.frost_entity = c["entity"]
            elif was_frost and new == 0:
                h.frost_stop_at = now
            outdoor = h.outdoor_temp() if c["mode"] == "both" else None
            keep = c["mode"] == "frost" or (c["mode"] == "both" and (frost_drives or (outdoor is not None and outdoor < c["frost"]["out"])))  # bei Frost bleiben die Heizkörper an
            if h.stage > 0 and c["thermo_off"] and not keep and not h.saved and not ctrl.active:
                await h.thermo_off()
            if h.saved and (h.stage == 0 or not c["thermo_off"] or keep):
                await h.restore_thermostats()
            if frost_drives:
                h.status = STATUS_FROST
            elif h.stage > 0 and pvs > 0:
                h.status = STATUS_PV
            elif c["mode"] == "frost":
                h.status = blocked or h.frost_status or STATUS_WAIT
            elif c["mode"] == "both" and h.frost_status in (FROST_WAIT, FROST_PAUSE, FROST_PRICE, FROST_GRID, FROST_SENSOR, FROST_LIMIT):
                h.status = h.frost_status
            else:
                h.status = blocked or (STATUS_PV if h.stage > 0 else STATUS_WAIT)
            if was_frost and h.frost_status == FROST_SENSOR:
                await h.async_warn("sensor", "Der Raumsensor liefert keine aktuellen Werte. Die Zusatzheizung ist aus.")
            if h.frost_status == FROST_WARM:
                h.effect = None
            heater_w[str(id(h))] = h.power(c)
            if was_frost != h.frost_on:
                await ctrl._save()
            if (h.stage, h.status, h.frost_status, h.frost_on) != old or h.frost_rest is not None:
                ctrl._store.async_delay_save(ctrl._data, 30)
                ctrl._signal()
        # ohne Netz-Sensor ist kein PV-Anteil bekannt
        shares = pv_share(heater_w, export) if export is not None else {}
        price = preis(self.hass, "strom")
        for ctrl, h, c, _, _ in items:
            w = heater_w.get(str(id(h)), 0.0)
            h.account(w, shares.get(str(id(h)), 0.0), dt, frost=h.frost_on, ct=price["ct"] if price else None)
            if h.frost_on:
                await h.async_effect(dt, h.frost_temp())
