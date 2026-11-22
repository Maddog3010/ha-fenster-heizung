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
from .tarif import SIGNAL_TARIF
from .sicherheit import SIGNAL_SF
from .wetter import KEYS as WX_KEYS, NAMES as WX_NAMES, SIGNAL_WX
from . import muell_ent
from . import abr_ent
from . import licht_ent
from . import saison_ent

SP_OWNER = "sp_sensor_owner"
SP_KEYS = ("sp_today", "sp_tomorrow", "sp_rest", "sp_corr", "sp_best")
EV_KEYS = ("ev_soc", "ev_done", "ev_next", "ev_sun")
TF_KEYS = ("tf_price", "tf_level", "tf_next_cheap", "tf_best", "tf_avg_today", "tf_avg_tomorrow", "tf_saved_month")

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
        extra = [SolarSensor(k) for k in SP_KEYS] + [SicherheitSensor(k) for k in SF_KEYS] + [WetterSensor("wx_level")] + [WetterSensor("wx_" + k) for k in WX_KEYS] + [EvSensor(k) for k in EV_KEYS] + [TarifSensor(k) for k in TF_KEYS] + [SaisonSensor(k) for k in saison_ent.SENSORS]
    if store.get(SP_OWNER) == entry.entry_id:
        muell_ent.register(hass, "sensor", async_add_entities, MuellSensor, entry.async_on_unload)  # Modul 17: Entitäten entstehen mit dem Addon
        abr_ent.register(hass, async_add_entities, AbrSensor, entry.async_on_unload)  # Modul 20: Preise, Ergebnis, Termine (Addon v0.9)
        licht_ent.register(hass, async_add_entities, LichtSensor, entry.async_on_unload)  # Modul 18: Lampen an, Licht heute, Längste an (Addon v0.2)
    async_add_entities(
        [PausedMinutesSensor(entry, key, scope) for key, scope in SCOPES.items()]
        + [PlanTargetSensor(entry), ModeSensor(entry)]
        + extra
    )


SF_KEYS = ("sf_status", "sf_alarme", "sf_bat_min", "sf_pruefung", "sf_offline", "sf_letzter_alarm")


class SicherheitSensor(SensorEntity):
    """Modul 11: Zustand der Melder für eigene Automationen (ruhig · hinweis · alarm, Zahl der Alarme, schwächste Batterie, nächste Prüfung)."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, key: str) -> None:
        self._key = key
        self._attr_translation_key = key
        self._attr_unique_id = f"{DOMAIN}_sicherheit_{key[3:]}"
        self._attr_icon = {"sf_status": "mdi:shield-home", "sf_alarme": "mdi:smoke-detector-alert", "sf_bat_min": "mdi:battery-alert", "sf_pruefung": "mdi:calendar-check", "sf_offline": "mdi:access-point-network-off", "sf_letzter_alarm": "mdi:history"}[key]
        if key == "sf_bat_min":
            self._attr_native_unit_of_measurement = "%"
            self._attr_device_class = SensorDeviceClass.BATTERY
        if key == "sf_pruefung":
            self._attr_device_class = SensorDeviceClass.DATE
        if key == "sf_letzter_alarm":
            self._attr_device_class = SensorDeviceClass.TIMESTAMP
        if key == "sf_status":
            self._attr_device_class = SensorDeviceClass.ENUM
            self._attr_options = ["ruhig", "hinweis", "alarm"]
        self._attr_device_info = {
            "identifiers": {(DOMAIN, "sicherheit_melder")},
            "name": "Strom & Wärme · Rauch- & Sicherheitsmelder",
            "manufacturer": "Strom & Wärme",
            "model": "Modul 11",
            "entry_type": "service",
        }

    def _m(self):
        m = self.hass.data.get(DOMAIN, {}).get("sicherheit") if self.hass else None
        return m if m is not None and m.active() and m._sum else None

    @property
    def available(self) -> bool:
        return self._m() is not None

    @property
    def native_value(self):
        m = self._m()
        if m is None:
            return None
        if self._key == "sf_offline":
            return len(m._sum.get("offline") or [])
        v = m._sum.get({"sf_status": "status", "sf_alarme": "alarme", "sf_bat_min": "bat_min", "sf_pruefung": "pruefung", "sf_letzter_alarm": "letzter_alarm"}[self._key])
        if self._key == "sf_letzter_alarm":
            from datetime import datetime
            try:
                return datetime.fromisoformat(v) if v else None
            except ValueError:
                return None
        if self._key == "sf_pruefung" and v:
            from datetime import date
            return date.fromisoformat(v)
        return v

    @property
    def extra_state_attributes(self) -> dict:
        m = self._m()
        if m is None:
            return {}
        sm = m._sum
        if self._key == "sf_offline":
            return {"melder": sm.get("offline") or [], "quellen_ausgefallen": sm.get("quellen_aus") or []}
        if self._key == "sf_letzter_alarm":
            la = sm.get("letzter_alarm_info") or {}
            return {"melder": la.get("melder") or None, "name": la.get("name") or None, "raum": la.get("raum") or None}
        if self._key != "sf_status":
            return {}
        return {"melder": sm.get("melder"), "ausgeschaltet": sm.get("ausgeschaltet"), "hinweise": sm.get("hinweise"), "alarme": sm.get("alarme"), "unquittiert": sm.get("unquittiert")}

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(async_dispatcher_connect(self.hass, SIGNAL_SF, self._refresh))

    @callback
    def _refresh(self, *_a) -> None:
        self.async_write_ha_state()


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


class TarifSensor(SensorEntity):
    """Modul 14 (C3): Preis jetzt, Stufe, nächste günstige Zeit, bestes Fenster, Ø heute und morgen. Gerät „Stromtarif“."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    LV = {"cheap": "guenstig", "normal": "normal", "dear": "teuer", "neg": "negativ"}

    def __init__(self, key: str) -> None:
        self._key = key
        self._attr_translation_key = key
        self._attr_unique_id = f"{DOMAIN}_tarif_{key[3:]}"
        self._attr_device_info = {"identifiers": {(DOMAIN, "stromtarif")}, "name": "Strom & Wärme · Stromtarif", "manufacturer": "Strom & Wärme", "model": "Modul 14", "entry_type": "service"}
        if key in ("tf_price", "tf_avg_today", "tf_avg_tomorrow"):
            self._attr_native_unit_of_measurement = "ct/kWh"
            self._attr_suggested_display_precision = 1
            self._attr_icon = "mdi:cash-clock" if key == "tf_price" else "mdi:chart-line"
            if key == "tf_price":
                self._attr_state_class = SensorStateClass.MEASUREMENT
        elif key == "tf_saved_month":  # v0.9: Tarif-Check, Ersparnis im laufenden Monat gegenüber dem Vergleichs-Festpreis
            self._attr_device_class = SensorDeviceClass.MONETARY
            self._attr_native_unit_of_measurement = "EUR"
            self._attr_suggested_display_precision = 2
            self._attr_icon = "mdi:piggy-bank-outline"
        elif key == "tf_level":
            self._attr_device_class = SensorDeviceClass.ENUM
            self._attr_options = list(self.LV.values())
            self._attr_icon = "mdi:traffic-light"
        else:
            self._attr_device_class = SensorDeviceClass.TIMESTAMP
            self._attr_icon = "mdi:clock-check-outline"

    def _m(self):
        m = self.hass.data.get(DOMAIN, {}).get("tarif") if self.hass else None
        return m if m is not None and m.active() and m.src else None

    @property
    def available(self) -> bool:
        return self._m() is not None

    def _snap(self) -> dict:
        m = self._m()
        try:
            return m.snapshot() if m is not None else {}
        except Exception:  # noqa: BLE001
            return {}

    @property
    def native_value(self):
        S = self._snap()
        if not S:
            return None
        from homeassistant.util import dt as dt_util
        ts = lambda v: dt_util.utc_from_timestamp(v) if v else None  # noqa: E731
        N = S.get("now") or {}
        if self._key == "tf_price":
            return N.get("ct")
        if self._key == "tf_level":
            return self.LV.get(N.get("lv") or "")
        if self._key == "tf_next_cheap":
            if N.get("lv") in ("cheap", "neg"):
                return dt_util.utcnow().replace(second=0, microsecond=0)
            sl = S.get("slots") or []
            return ts(sl[0]["s"]) if sl else None
        if self._key == "tf_saved_month":
            v = S.get("saved_m")
            return v.get("save") if v else None
        if self._key == "tf_best":
            b = S.get("best")
            return ts(b["s"]) if b else None
        d = S.get("today" if self._key == "tf_avg_today" else "tomorrow")
        return d.get("avg") if d else None

    @property
    def extra_state_attributes(self) -> dict:
        S = self._snap()
        if not S:
            return {}
        try:
            if self._key == "tf_price":
                return {"quelle": S.get("src_name"), "naechste_stunde": (S.get("now") or {}).get("next_h"), "boersenpreis_mit_aufschlaegen": bool(S.get("boerse"))}
            if self._key == "tf_best":
                b = S.get("best") or {}
                return {"ende": b.get("e"), "mittel_ct": b.get("avg"), "stunden": S["cfg"]["win_h"]}
            if self._key == "tf_saved_month":
                v = S.get("saved_m") or {}
                return {"bezahlt_eur": v.get("paid"), "netzbezug_kwh": v.get("kwh"), "tage": v.get("n"), "davon_geschaetzt": v.get("est")}
            if self._key in ("tf_avg_today", "tf_avg_tomorrow"):
                d = S.get("today" if self._key == "tf_avg_today" else "tomorrow") or {}
                return {"min": d.get("min"), "max": d.get("max"), "negativ_zeitraeume": d.get("neg", 0)}
        except Exception:  # noqa: BLE001
            return {}
        return {}

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(async_dispatcher_connect(self.hass, SIGNAL_TARIF, self._refresh))
        self.async_on_remove(async_track_time_interval(self.hass, self._refresh, timedelta(minutes=1)))

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


class MuellSensor(muell_ent._Base, SensorEntity):
    """Modul 17: nächste Abholung (Datum), je Abfallart Tage bis zur Abholung, Vorrat Säcke."""

    def __init__(self, key: str) -> None:
        muell_ent._Base.__init__(self, "sensor", key)
        if key == "naechste_abholung":
            self._attr_device_class = SensorDeviceClass.DATE
        elif key == "gelbe_saecke":
            self._attr_native_unit_of_measurement = "Stk."
        else:
            self._attr_native_unit_of_measurement = UnitOfTime.DAYS

    @property
    def native_value(self):
        r = self._row()
        if not r:
            return None
        v = r.get("value")
        if self._key == "naechste_abholung" and isinstance(v, str):
            from datetime import date
            try:
                return date.fromisoformat(v)
            except ValueError:
                return None
        return v


class LichtSensor(licht_ent.Base, SensorEntity):
    """Modul 18: Lampen an, Brennstunden heute, längste Einschaltdauer."""


class SaisonSensor(saison_ent.Base, SensorEntity):
    """Weihnachts-Theme: Saison-Phase, Adventskerzen, Tage bis Heiligabend (echtes Datum)."""

    def __init__(self, key: str) -> None:
        name, icon = saison_ent.SENSORS[key]
        saison_ent.Base.__init__(self, "sensor", key, name, icon)
        if key == "saison_phase":
            self._attr_device_class = SensorDeviceClass.ENUM
            self._attr_options = saison_ent.PHASE_OPTIONS
            self._attr_translation_key = "saison_phase"
        elif key == "tage_bis_heiligabend":
            self._attr_native_unit_of_measurement = UnitOfTime.DAYS

    @property
    def native_value(self):
        r = saison_ent.real(self.hass)
        return saison_ent.sensor_value(self._key, r) if r else None

    @property
    def extra_state_attributes(self):
        r = saison_ent.real(self.hass)
        return saison_ent.sensor_attrs(self._key, r) if r else {}


class AbrSensor(abr_ent.Base, SensorEntity):
    """Modul 20: Preise für das Energie-Dashboard, erwartetes Ergebnis, nächster Abschlag und Termin, Fahrtkosten, Vorräte."""

    def __init__(self, key: str) -> None:
        abr_ent.Base.__init__(self, key)
