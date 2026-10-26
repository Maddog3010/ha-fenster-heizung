"""Sensoren: Pausenzeit pro Tag und Betriebszustand je Raum."""
from __future__ import annotations

from datetime import timedelta

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfTemperature, UnitOfTime
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_time_interval

from .const import CONF_AIR_EVERY, CONF_AIR_HINT, CONF_HUMIDITY, CONF_WEATHER_ADJ, CONF_WINDOWS, DEFAULT_AIR_EVERY, DOMAIN, MODES, SIGNAL_UPDATE

SCOPES = {
    "minutes_today": "day",
    "minutes_month": "month",
    "minutes_year": "year",
    "minutes_total": "total",
}


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    async_add_entities(
        [PausedMinutesSensor(entry, key, scope) for key, scope in SCOPES.items()]
        + [PlanTargetSensor(entry), ModeSensor(entry)]
    )


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
    """Minuten, in denen die Heizung wegen offener Fenster pausierte."""

    _attr_device_class = SensorDeviceClass.DURATION
    _attr_native_unit_of_measurement = UnitOfTime.MINUTES
    _attr_state_class = SensorStateClass.TOTAL_INCREASING
    _attr_icon = "mdi:radiator-off"
    _unrecorded_attributes = frozenset({"verlauf"})

    def __init__(self, entry: ConfigEntry, key: str, scope: str) -> None:
        super().__init__(entry, key)
        self._scope = scope

    @property
    def native_value(self) -> float:
        return round(self._ctrl.seconds(self._scope) / 60, 1)

    @property
    def extra_state_attributes(self) -> dict:
        attrs = self._ctrl.saved_gas(self._scope)
        attrs["zeitraum"] = self._scope
        if self._scope == "day":
            attrs.update(self._ctrl.power_info())
            attrs["verlauf"] = self._ctrl.minutes_history()
            since = self._ctrl.paused_since
            attrs["pausen_heute"] = self._ctrl.pauses_today
            attrs["pausiert_seit"] = since.isoformat() if since else None
        return attrs


class ModeSensor(_Base):
    """Zeigt, ob geregelt wird, pausiert ist oder nur die Fenstermeldung läuft."""

    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = MODES
    _attr_icon = "mdi:thermostat-box"
    _unrecorded_attributes = frozenset({"grund"})

    def __init__(self, entry: ConfigEntry) -> None:
        super().__init__(entry, "mode")

    @property
    def native_value(self) -> str:
        return self._ctrl.mode()

    @property
    def extra_state_attributes(self) -> dict:
        return {
            "thermostate": self._ctrl.thermostat_states(),
            "fenster": list(self._ctrl.cfg[CONF_WINDOWS]),
            "entry_id": self._entry.entry_id,
            "grund": self._ctrl.reasons(),
            "heizung_quelle": self._ctrl.heating_source(),
            "zuletzt_gelueftet": self._ctrl.last_aired,
            "lueften_nach_h": self._ctrl.cfg.get(CONF_AIR_EVERY, DEFAULT_AIR_EVERY),
            "luftfeuchte_sensor": self._ctrl.cfg.get(CONF_HUMIDITY),
            "lueftungshinweise": "aus" if self._ctrl.cfg.get(CONF_AIR_HINT) == "off" else "an",
            "wetter_anpassung": "aus" if self._ctrl.cfg.get(CONF_WEATHER_ADJ) == "off" else "an",
        }


class PlanTargetSensor(_Base):
    """Solltemperatur, die der Heizplan gerade vorgibt."""

    _attr_device_class = SensorDeviceClass.TEMPERATURE
    _attr_native_unit_of_measurement = UnitOfTemperature.CELSIUS
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_icon = "mdi:calendar-clock"

    def __init__(self, entry: ConfigEntry) -> None:
        super().__init__(entry, "plan_target")

    @property
    def native_value(self) -> float | None:
        return self._ctrl.plan_target()

    @property
    def extra_state_attributes(self) -> dict:
        return self._ctrl.plan_info()
