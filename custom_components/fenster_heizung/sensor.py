"""Sensoren: Pausenzeit pro Tag und Betriebszustand je Raum, dazu einmal die Werte der Solar-Prognose (Modul 16)."""
from __future__ import annotations

from datetime import timedelta

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfEnergy, UnitOfTemperature, UnitOfTime
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_time_interval

from .const import CONF_AIR_EVERY, CONF_AIR_HINT, CONF_HUMIDITY, CONF_ROOM_TEMP, CONF_WEATHER_ADJ, RT_USES, CONF_WINDOWS, DEFAULT_AIR_EVERY, DOMAIN, MODES, SIGNAL_UPDATE

from .solar import SIGNAL_SOLAR

SP_OWNER = "sp_sensor_owner"
SP_KEYS = ("sp_today", "sp_tomorrow", "sp_rest", "sp_corr", "sp_best")

SCOPES = {
    "minutes_today": "day",
    "minutes_month": "month",
    "minutes_year": "year",
    "minutes_total": "total",
}


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    store = hass.data.setdefault(DOMAIN, {})
    extra: list[SensorEntity] = []
    if store.get(SP_OWNER) in (None, entry.entry_id):  # E6/F7: Solar-Werte nur einmal, am ersten Raum
        store[SP_OWNER] = entry.entry_id
        extra = [SolarSensor(k) for k in SP_KEYS]
    async_add_entities(
        [PausedMinutesSensor(entry, key, scope) for key, scope in SCOPES.items()]
        + [PlanTargetSensor(entry), ModeSensor(entry)]
        + extra
    )


class SolarSensor(SensorEntity):
    """Modul 16: Prognose als Sensor für Automationen und Dashboards. Eigenes Gerät, unabhängig vom Raum."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, key: str) -> None:
        self._key = key
        self._attr_translation_key = key
        self._attr_unique_id = f"{DOMAIN}_solar_{key[3:]}"
        self._attr_device_info = {
            "identifiers": {(DOMAIN, "solar_forecast")},
            "name": "Strom & Wärme · Solar-Prognose",
            "manufacturer": "Strom & Wärme",
            "model": "Modul 16",
            "entry_type": "service",
        }
        if key == "sp_best":
            self._attr_device_class = SensorDeviceClass.TIMESTAMP
            self._attr_icon = "mdi:weather-sunny-alert"
        else:
            self._attr_device_class = SensorDeviceClass.ENERGY
            self._attr_native_unit_of_measurement = UnitOfEnergy.KILO_WATT_HOUR
            self._attr_suggested_display_precision = 1
            self._attr_icon = "mdi:solar-power-variant"

    def _v(self) -> dict:
        m = self.hass.data.get(DOMAIN, {}).get("solar") if self.hass else None
        try:
            return m.values() if m is not None else {"ok": False}
        except Exception:  # noqa: BLE001 - ein Fehler in der Berechnung darf den Sensor nicht abstürzen lassen
            return {"ok": False}

    @property
    def available(self) -> bool:
        return bool(self._v().get("ok"))

    @property
    def native_value(self):
        v = self._v()
        if not v.get("ok"):
            return None
        return {"sp_today": v["today"], "sp_tomorrow": v["tomorrow"], "sp_rest": v["rest"],
                "sp_corr": v["corr_today"], "sp_best": v["best_at"]}.get(self._key)

    @property
    def extra_state_attributes(self) -> dict:
        v = self._v()
        if not v.get("ok"):
            return {}
        if self._key == "sp_best":
            b = v.get("best") or {}
            return {"bis": f"{b.get('to', 0):02d}:00" if b else None, "kwh": b.get("kwh")}
        if self._key == "sp_corr":
            return {"faktor": v.get("corr"), "tage": v.get("corr_n"), "ungekorrigiert": v.get("today")}
        if self._key == "sp_today":
            return {"quelle": v.get("src"), "anlagen": v.get("sites"), "erzeugt": v.get("got")}
        return {}

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(async_dispatcher_connect(self.hass, SIGNAL_SOLAR, self._refresh))
        self.async_on_remove(async_track_time_interval(self.hass, self._refresh, timedelta(seconds=300)))

    @callback
    def _refresh(self, *_a) -> None:
        self.async_write_ha_state()


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
    _unrecorded_attributes = frozenset({"grund", "heizer", "regelung", "praesenz"})

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
            "raumtemperatur_sensor": self._ctrl.cfg.get(CONF_ROOM_TEMP),
            "raumtemperatur_nutzung": {k: self._ctrl.cfg.get(k) != "off" for k in RT_USES},
            "raumtemperatur_wert": self._ctrl.sensor_temp(),
            "lueftungshinweise": "aus" if self._ctrl.cfg.get(CONF_AIR_HINT) == "off" else "an",
            "wetter_anpassung": "aus" if self._ctrl.cfg.get(CONF_WEATHER_ADJ) == "off" else "an",
            "heizer": self._ctrl.heater.attrs(),
            "regelung": self._ctrl.rt.diag(),
            "praesenz": self._ctrl.pr.attrs(),
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
