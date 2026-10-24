"""Sensoren: Pausenzeit pro Tag und Betriebszustand je Raum."""
from __future__ import annotations

from datetime import timedelta

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfTime
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_time_interval

from .const import DOMAIN, MODES, SIGNAL_UPDATE


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    async_add_entities([PausedMinutesSensor(entry), ModeSensor(entry)])


class _Base(SensorEntity):
    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, entry: ConfigEntry, key: str) -> None:
        self._entry = entry
        self._attr_translation_key = key
        self._attr_unique_id = f"{entry.entry_id}_{key}"
        self._attr_device_info = {
            "identifiers": {(DOMAIN, entry.entry_id)},
            "name": entry.title,
        }

    @property
    def _ctrl(self):
        return self._entry.runtime_data

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass, SIGNAL_UPDATE.format(self._entry.entry_id), self._refresh
            )
        )
        self.async_on_remove(
            async_track_time_interval(self.hass, self._tick, timedelta(seconds=60))
        )

    @callback
    def _refresh(self) -> None:
        self.async_write_ha_state()

    @callback
    def _tick(self, _now) -> None:
        self.async_write_ha_state()


class PausedMinutesSensor(_Base):
    """Minuten pro Tag, in denen die Heizung wegen offener Fenster pausierte."""

    _attr_device_class = SensorDeviceClass.DURATION
    _attr_native_unit_of_measurement = UnitOfTime.MINUTES
    _attr_state_class = SensorStateClass.TOTAL_INCREASING
    _attr_icon = "mdi:radiator-off"

    def __init__(self, entry: ConfigEntry) -> None:
        super().__init__(entry, "minutes_today")

    @property
    def native_value(self) -> float:
        return self._ctrl.minutes_today()

    @property
    def extra_state_attributes(self) -> dict:
        since = self._ctrl.paused_since
        return {
            "pausen_heute": self._ctrl.pauses_today,
            "pausiert_seit": since.isoformat() if since else None,
        }


class ModeSensor(_Base):
    """Zeigt, ob geregelt wird, pausiert ist oder nur die Fenstermeldung läuft."""

    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = MODES
    _attr_icon = "mdi:thermostat-box"

    def __init__(self, entry: ConfigEntry) -> None:
        super().__init__(entry, "mode")

    @property
    def native_value(self) -> str:
        return self._ctrl.mode()

    @property
    def extra_state_attributes(self) -> dict:
        return {
            "thermostate": self._ctrl.thermostat_states(),
            "heizung_quelle": self._ctrl.heating_source(),
        }
