"""Binärsensoren: Modul 17 Müllabfuhr „Tonne rausstellen“ und „Tonne reinholen“ (entstehen erst mit dem Addon)."""
from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from . import muell_ent
from .const import DOMAIN

OWNER = "bs_owner"


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback) -> None:
    store = hass.data.setdefault(DOMAIN, {})
    if store.get(OWNER) in (None, entry.entry_id):
        store[OWNER] = entry.entry_id
        muell_ent.register(hass, "binary_sensor", async_add_entities, MuellBinary, entry.async_on_unload)


class MuellBinary(muell_ent._Base, BinarySensorEntity):
    def __init__(self, key: str) -> None:
        muell_ent._Base.__init__(self, "binary_sensor", key)

    @property
    def is_on(self) -> bool | None:
        r = self._row()
        return bool(r.get("value")) if r else None
