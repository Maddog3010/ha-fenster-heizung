"""Fenster & Heizung: Thermostate pausieren, solange Fenster offen sind."""
from __future__ import annotations

import logging
import re
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_OFF, STATE_ON, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers.event import async_call_later, async_track_state_change_event
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    ACTION_OFF,
    CONF_ACTION,
    CONF_CLOSE_DELAY,
    CONF_OPEN_DELAY,
    CONF_SETBACK_TEMP,
    CONF_THERMOSTATS,
    CONF_WINDOWS,
    DEFAULT_CLOSE_DELAY,
    DEFAULT_OPEN_DELAY,
    DEFAULT_SETBACK_TEMP,
    DOMAIN,
)

from .const import (  # noqa: E402
    CONF_BLOCK_FROM,
    CONF_BLOCK_TO,
    CONF_NOTIFY_AFTER,
    CONF_NOTIFY_SERVICE,
    CONF_OUTDOOR_MAX,
    CONF_OUTDOOR_SENSOR,
    DEFAULT_OUTDOOR_MAX,
)

_LOGGER = logging.getLogger(__name__)
RECHECK_SECONDS = 300
PLATFORMS = ["switch"]


class WindowController:
    """Steuert die Thermostate eines Raums anhand der Fenstersensoren."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        self.enabled = True
        self.active = False  # True = Heizung gerade pausiert
        self._saved: dict[str, dict[str, Any]] = {}
        self._timer: CALLBACK_TYPE | None = None
        self._unsub: CALLBACK_TYPE | None = None
        self._notify_timer: CALLBACK_TYPE | None = None
        self._notified = False
        self._store = Store(hass, 1, f"{DOMAIN}_{entry.entry_id}")

    @property
    def cfg(self) -> dict[str, Any]:
        return {**self.entry.data, **self.entry.options}

    async def async_start(self) -> None:
        saved = await self._store.async_load()
        if saved:
            self._saved = saved
            self.active = bool(saved)
        self._unsub = async_track_state_change_event(
            self.hass, self.cfg[CONF_WINDOWS], self._window_changed
        )
        self._evaluate()

    async def async_stop(self) -> None:
        self._cancel_timer()
        self._cancel_notify()
        if self._unsub:
            self._unsub()
            self._unsub = None

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
    def _evaluate(self) -> None:
        self._cancel_timer()
        self._update_notify()
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
            return True  # Sensor unbekannt -> normal regeln

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
            if st is None or st.state in (STATE_UNAVAILABLE, STATE_UNKNOWN, STATE_OFF):
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
        self.active = bool(self._saved)
        await self._store.async_save(self._saved)

    async def _restore(self, _now) -> None:
        self._timer = None
        for eid, data in self._saved.items():
            st = self.hass.states.get(eid)
            if st is None or st.state == STATE_UNAVAILABLE:
                continue
            if st.state != data["hvac_mode"]:
                await self._call("set_hvac_mode", eid, hvac_mode=data["hvac_mode"])
            if data.get("temperature") is not None:
                await self._call("set_temperature", eid, temperature=data["temperature"])
        self._saved = {}
        self.active = False
        await self._store.async_save(self._saved)

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
