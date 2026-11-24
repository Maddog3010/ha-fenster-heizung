"""Binärsensoren: Modul 17 Müllabfuhr „Tonne rausstellen“ und „Tonne reinholen“ (entstehen erst mit dem Addon),
Weihnachts-Theme „Weihnachtszeit“ (01.–27.12.)."""
from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from . import muell_ent
from . import saison_ent
from . import gr_ent
from . import mx_ent
from .const import DOMAIN

OWNER = "bs_owner"


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback) -> None:
    store = hass.data.setdefault(DOMAIN, {})
    if store.get(OWNER) in (None, entry.entry_id):
        store[OWNER] = entry.entry_id
        muell_ent.register(hass, "binary_sensor", async_add_entities, MuellBinary, entry.async_on_unload)
        async_add_entities([SaisonBinary()])
        gr_ent.register(hass, "binary_sensor", async_add_entities, RaumBinary, entry.async_on_unload)  # Modul 0 Build 9: Fenster offen, belegt
        mx_ent.register(hass, "binary_sensor", async_add_entities, MxBinary, entry.async_on_unload)  # Sponsor-Max-Extras 2026.11.4.4b4


class MuellBinary(muell_ent._Base, BinarySensorEntity):
    def __init__(self, key: str) -> None:
        muell_ent._Base.__init__(self, "binary_sensor", key)

    @property
    def is_on(self) -> bool | None:
        r = self._row()
        return bool(r.get("value")) if r else None


class RaumBinary(gr_ent.Base, BinarySensorEntity):
    """Modul 0: Fenster offen und belegt je Raum."""

    @property
    def is_on(self) -> bool | None:
        r = self._row()
        return bool(r.get("value")) if r and r.get("value") is not None else None

    @property
    def device_class(self) -> str | None:
        return (self._row() or {}).get("dc")


class SaisonBinary(saison_ent.Base, BinarySensorEntity):
    """Weihnachts-Theme: an vom 01.12. bis 27.12. (echtes Datum, nie die Simulation)."""

    def __init__(self) -> None:
        saison_ent.Base.__init__(self, "binary_sensor", "weihnachtszeit", "Weihnachtszeit", "mdi:pine-tree")

    @property
    def is_on(self) -> bool | None:
        r = saison_ent.real(self.hass)
        return bool(r["in_saison"]) if r else None


class MxBinary(mx_ent.MxBase, BinarySensorEntity):
    """Sponsor-Max-Extras: Schimmelrisiko je Raum, Tablet wach."""

    def __init__(self, key: str, v: dict) -> None:
        mx_ent.MxBase.__init__(self, key, v)
        if v.get("dc"):
            self._attr_device_class = v["dc"]

    @property
    def is_on(self) -> bool | None:
        v = self._v()
        return bool(v.get("v")) if v else None
