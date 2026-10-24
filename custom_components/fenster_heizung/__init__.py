"""Fenster & Heizung: Thermostate pausieren, solange Fenster offen sind."""
from __future__ import annotations

import logging
import re
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_OFF, STATE_ON
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_call_later, async_track_state_change_event
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    ACTION_OFF,
    CONF_ACTION,
    CONF_BLOCK_FROM,
    CONF_BLOCK_TO,
    CONF_CLOSE_DELAY,
    CONF_NOTIFY_AFTER,
    CONF_NOTIFY_SERVICE,
    CONF_OPEN_DELAY,
    CONF_OUTDOOR_MAX,
    CONF_OUTDOOR_SENSOR,
    CONF_SETBACK_TEMP,
    CONF_THERMOSTATS,
    CONF_WINDOWS,
    DEFAULT_CLOSE_DELAY,
    DEFAULT_OPEN_DELAY,
    DEFAULT_OUTDOOR_MAX,
    DEFAULT_SETBACK_TEMP,
    DOMAIN,
    HEATING_MODES,
    MODE_ACTIVE,
    MODE_DISABLED,
    MODE_PAUSED,
    MODE_WINDOW_ONLY,
    SIGNAL_UPDATE,
)

_LOGGER = logging.getLogger(__name__)
PLATFORMS = ["switch", "sensor"]
RECHECK_SECONDS = 300


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
        self._store = Store(hass, 1, f"{DOMAIN}_{entry.entry_id}")
        # Statistik "pausiert heute"
        self._day = dt_util.now().date().isoformat()
        self._seconds = 0.0
        self._pauses = 0
        self._paused_since = None

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
            if data.get("paused_since"):
                self._paused_since = dt_util.parse_datetime(data["paused_since"])
        else:  # Altformat (bis 1.1.x): nur die gemerkten Thermostate
            self._saved = data
        self.active = bool(self._saved)
        if self.active and self._paused_since is None:
            self._paused_since = dt_util.now()
        self._roll()
        self._unsub = async_track_state_change_event(
            self.hass, self.cfg[CONF_WINDOWS], self._window_changed
        )
        self._unsub_t = async_track_state_change_event(
            self.hass, self.cfg[CONF_THERMOSTATS], self._thermostat_changed
        )
        self._evaluate()

    async def async_stop(self) -> None:
        self._cancel_timer()
        self._cancel_notify()
        for attr in ("_unsub", "_unsub_t"):
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
        for eid in self.cfg[CONF_THERMOSTATS]:
            st = self.hass.states.get(eid)
            if st is not None and st.state in HEATING_MODES:
                return MODE_ACTIVE
        return MODE_WINDOW_ONLY

    def thermostat_states(self) -> dict[str, str]:
        out = {}
        for eid in self.cfg[CONF_THERMOSTATS]:
            st = self.hass.states.get(eid)
            out[eid] = st.state if st else "unbekannt"
        return out

    def _roll(self):
        """Tageswechsel: Zähler auf 0, laufende Pause ab Mitternacht zählen."""
        now = dt_util.now()
        today = now.date().isoformat()
        if self._day != today:
            self._day = today
            self._seconds = 0.0
            self._pauses = 0
            if self._paused_since:
                self._paused_since = now.replace(hour=0, minute=0, second=0, microsecond=0)
        return now

    def minutes_today(self) -> float:
        now = self._roll()
        seconds = self._seconds
        if self._paused_since:
            seconds += max((now - self._paused_since).total_seconds(), 0)
        return round(seconds / 60, 1)

    @property
    def pauses_today(self) -> int:
        self._roll()
        return self._pauses

    @property
    def paused_since(self):
        return self._paused_since

    def _signal(self) -> None:
        async_dispatcher_send(self.hass, SIGNAL_UPDATE.format(self.entry.entry_id))

    async def _save(self) -> None:
        await self._store.async_save(
            {
                "saved": self._saved,
                "paused_since": self._paused_since.isoformat() if self._paused_since else None,
                "day": self._day,
                "seconds": self._seconds,
                "pauses": self._pauses,
            }
        )

    # --- Logik -------------------------------------------------------------
    def _any_open(self) -> bool:
        for eid in self.cfg[CONF_WINDOWS]:
            st = self.hass.states.get(eid)
            if st and st.state in (STATE_ON, "open"):
                return True
        return False

    @callback
    def _window_changed(self, event: Event) -> None:
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
        if is_open and not self.active:
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
        services = [
            x for x in re.split(r"[,;\s]+", self.cfg[CONF_NOTIFY_SERVICE]) if x
        ]
        minutes = int(float(self.cfg.get(CONF_NOTIFY_AFTER) or 0))
        message = f"Fenster in {self.entry.title} ist seit {minutes} Minuten offen."
        for service in services:
            domain, _, name = service.partition(".")
            if not name:
                domain, name = "notify", service
            try:
                await self.hass.services.async_call(
                    domain, name, {"message": message}, blocking=True
                )
            except Exception:  # noqa: BLE001
                _LOGGER.exception("Benachrichtigung über %s fehlgeschlagen", service)

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
        if not self.enabled or not self._any_open():
            return
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
            else:
                await self._call(
                    "set_temperature",
                    eid,
                    temperature=cfg.get(CONF_SETBACK_TEMP, DEFAULT_SETBACK_TEMP),
                )
        if self._saved and not self.active:
            self.active = True
            self._paused_since = self._roll()
            self._pauses += 1
        await self._save()
        self._signal()

    async def _restore(self, _now) -> None:
        self._timer = None
        for eid, data in self._saved.items():
            st = self.hass.states.get(eid)
            if st is None or st.state == "unavailable":
                continue
            if st.state != data["hvac_mode"]:
                await self._call("set_hvac_mode", eid, hvac_mode=data["hvac_mode"])
            if data.get("temperature") is not None:
                await self._call("set_temperature", eid, temperature=data["temperature"])
        now = self._roll()
        if self._paused_since:
            self._seconds += max((now - self._paused_since).total_seconds(), 0)
            self._paused_since = None
        self._saved = {}
        self.active = False
        await self._save()
        self._signal()

    async def _call(self, service: str, entity_id: str, **data: Any) -> None:
        try:
            await self.hass.services.async_call(
                "climate", service, {"entity_id": entity_id, **data}, blocking=True
            )
        except Exception:  # noqa: BLE001
            _LOGGER.exception("climate.%s für %s fehlgeschlagen", service, entity_id)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    controller = WindowController(hass, entry)
    entry.runtime_data = controller
    await controller.async_start()
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_reload))
    return True


async def _reload(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if ok:
        await entry.runtime_data.async_stop()
    return ok
