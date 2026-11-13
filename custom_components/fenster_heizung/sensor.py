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
from .wetter import KEYS as WX_KEYS, NAMES as WX_NAMES, SIGNAL_WX

SP_OWNER = "sp_sensor_owner"
SP_KEYS = ("sp_today", "sp_tomorrow", "sp_rest", "sp_corr", "sp_best")
EV_KEYS = ("ev_soc", "ev_done", "ev_next", "ev_sun")

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
        extra = [SolarSensor(k) for k in SP_KEYS] + [WetterSensor("wx_level")] + [WetterSensor("wx_" + k) for k in WX_KEYS] + [EvSensor(k) for k in EV_KEYS]
    async_add_entities(
        [PausedMinutesSensor(entry, key, scope) for key, scope in SCOPES.items()]
        + [PlanTargetSensor(entry), ModeSensor(entry)]
        + extra
    )


class WetterSensor(SensorEntity):
    """Modul 9 (E2): Warnstufe 0–4 gesamt und je Warnart, für eigene Automationen. Eigenes Gerät „Wetter & Warnungen“."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_icon = "mdi:weather-lightning-rainy"

    def __init__(self, key: str) -> None:
        self._key = key
        self._attr_translation_key = key
        self._attr_unique_id = f"{DOMAIN}_wetter_{key[3:]}"
        self._attr_device_info = {
            "identifiers": {(DOMAIN, "wetter_warnungen")},
            "name": "Strom & Wärme · Wetter & Warnungen",
            "manufacturer": "Strom & Wärme",
            "model": "Modul 9",
            "entry_type": "service",
        }

    def _m(self):
        m = self.hass.data.get(DOMAIN, {}).get("wetter") if self.hass else None
        return m if m is not None and m.active() else None

    @property
    def available(self) -> bool:
        return self._m() is not None

    @property
    def native_value(self):
        m = self._m()
        if m is None:
            return None
        if self._key == "wx_level":
            return m.level()
        s = m.st.get(self._key[3:]) or {}
        return s.get("lv", 0) if s.get("a") else 0

    @property
    def extra_state_attributes(self) -> dict:
        m = self._m()
        if m is None:
            return {}
        try:
            if self._key == "wx_level":
                return {"warnungen": [{"art": x["art"], "titel": x["titel"], "stufe": x["stufe"], "quelle": x["quelle"], "von": x.get("von") or None, "bis": x.get("bis") or None, "vorab": x["vorab"]} for x in m.warnings()][:12],
                        "quittiert": bool(m.ack) or bool(m.ack_off), "aktionen_ausgesetzt": m.pause_until > 0}
            k = self._key[3:]
            s = m.st.get(k) or {}
            return {"name": WX_NAMES.get(k), "seit": s.get("since") or None, "wert": s.get("v"), "vorwarnung_ab": s.get("ahead") or None, "vorwarnung_stufe": s.get("ahead_lv") or 0, **({"art": "Glätte" if s.get("kind") == "ice" else "Frost"} if k == "frost" and s.get("a") else {})}
        except Exception:  # noqa: BLE001 - Attribute dürfen den Sensor nicht abstürzen lassen
            return {}

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(async_dispatcher_connect(self.hass, SIGNAL_WX, self._refresh))

    @callback
    def _refresh(self, *_a) -> None:
        self.async_write_ha_state()


class EvSensor(SensorEntity):
    """Modul 8 (B9): Ladestand, fertig um, nächster Ladestart und Sonnenanteil jetzt – für eigene Automationen. Eigenes Gerät."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, key: str) -> None:
        self._key = key
        self._attr_translation_key = key
        self._attr_unique_id = f"{DOMAIN}_wallbox_{key[3:]}"
        self._attr_device_info = {
            "identifiers": {(DOMAIN, "elektroauto_wallbox")},
            "name": "Strom & Wärme · Elektroauto & Wallbox",
            "manufacturer": "Strom & Wärme",
            "model": "Modul 8",
            "entry_type": "service",
        }
        if key in ("ev_done", "ev_next"):
            self._attr_device_class = SensorDeviceClass.TIMESTAMP
            self._attr_icon = "mdi:clock-check-outline" if key == "ev_done" else "mdi:clock-start"
        else:
            self._attr_native_unit_of_measurement = "%"
            self._attr_icon = "mdi:battery-charging-80" if key == "ev_soc" else "mdi:solar-power"
            if key == "ev_soc":
                self._attr_device_class = SensorDeviceClass.BATTERY
                self._attr_state_class = SensorStateClass.MEASUREMENT

    def _v(self) -> dict:
        m = self.hass.data.get(DOMAIN, {}).get("wallbox") if self.hass else None
        try:
            return m.ev_values() if m is not None else {"ok": False}
        except Exception:  # noqa: BLE001 - ein Fehler in der Berechnung darf den Sensor nicht abstürzen lassen
            return {"ok": False}

    @property
    def available(self) -> bool:
        return bool(self._v().get("ok"))

    @property
    def native_value(self):
        v = self._v()
        return {"ev_soc": v.get("soc"), "ev_done": v.get("done"), "ev_next": v.get("next"), "ev_sun": v.get("sun")}.get(self._key) if v.get("ok") else None

    @property
    def extra_state_attributes(self) -> dict:
        v = self._v()
        if not v.get("ok"):
            return {}
        if self._key == "ev_soc":
            return {"fahrzeug": v.get("veh"), "geschaetzt": v.get("est"), "ziel": v.get("goal"), "fehlt_kwh": v.get("need")}
        if self._key == "ev_done":
            return {"leistung_kw": v.get("power"), "fehlt_kwh": v.get("need")}
        if self._key == "ev_sun":
            return {"leistung_kw": v.get("power"), "zustand": v.get("state")}
        return {}

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(async_track_time_interval(self.hass, self._refresh, timedelta(seconds=30)))

    @callback
    def _refresh(self, *_a) -> None:
        self.async_write_ha_state()


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
