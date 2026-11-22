"""Weihnachts-Theme Build 1: Entitäten (immer echtes Datum, nie die Simulation).

binary_sensor.strom_waerme_weihnachtszeit       an vom 01.12. bis 27.12.
sensor.strom_waerme_saison_phase                aus / advent / heiligabend / feiertage / ausklang
sensor.strom_waerme_advent_kerzen               0–4
sensor.strom_waerme_tage_bis_heiligabend        Tage bis zum nächsten 24.12.
Aktualisiert wird beim Tageswechsel über das Signal des SaisonManagers (hass.data[DOMAIN]["saison"]).
"""
from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from .const import DOMAIN
from .saison import PHASEN, SIGNAL

PRE = "strom_waerme"
DEVICE = {"identifiers": {(DOMAIN, "saison")}, "name": "Strom & Wärme · Saison", "manufacturer": "Strom & Wärme", "model": "Weihnachts-Theme", "entry_type": "service"}
SENSORS = {
    "saison_phase": ("Saison-Phase", "mdi:calendar-star"),
    "advent_kerzen": ("Adventskerzen", "mdi:candle"),
    "tage_bis_heiligabend": ("Tage bis Heiligabend", "mdi:timer-sand"),
}


def real(hass: HomeAssistant) -> dict[str, Any] | None:
    m = hass.data.get(DOMAIN, {}).get("saison") if hass else None
    try:
        return m.real() if m is not None else None
    except Exception:  # noqa: BLE001 - nie die Plattform abstürzen lassen
        return None


class Base:
    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, domain: str, key: str, name: str, icon: str) -> None:
        self._key = key
        self._attr_unique_id = f"{DOMAIN}_saison_{key}"
        self._attr_device_info = DEVICE
        self._attr_name = name
        self._attr_icon = icon
        self.entity_id = f"{domain}.{PRE}_{key}"

    @property
    def available(self) -> bool:
        return real(self.hass) is not None

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(async_dispatcher_connect(self.hass, SIGNAL, self._refresh))

    @callback
    def _refresh(self, *_a) -> None:
        self.async_write_ha_state()


def sensor_value(key: str, r: dict[str, Any]) -> Any:
    return {"saison_phase": r["phase"], "advent_kerzen": r["kerzen"], "tage_bis_heiligabend": r["tage"]}[key]


def sensor_attrs(key: str, r: dict[str, Any]) -> dict[str, Any]:
    if key == "saison_phase":
        return {"start": "12-01", "ende": "12-27", "advent_sonntage": r["advent_sonntage"], "simuliert": False}
    return {}


PHASE_OPTIONS = list(PHASEN)


# ------------------------------------------------------------ Adventskalender (Build 2)
def advent_count(hass: HomeAssistant) -> dict[str, Any] | None:
    m = hass.data.get(DOMAIN, {}).get("advent") if hass else None
    try:
        return m.count() if m is not None else None
    except Exception:  # noqa: BLE001
        return None
