"""Schalter zum Aktivieren/Deaktivieren der Regelung pro Raum."""
from __future__ import annotations

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from .const import DOMAIN


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    async_add_entities([EnabledSwitch(entry)])


class EnabledSwitch(RestoreEntity, SwitchEntity):
    _attr_has_entity_name = True
    _attr_translation_key = "enabled"
    _attr_icon = "mdi:window-open-variant"

    def __init__(self, entry: ConfigEntry) -> None:
        self._entry = entry
        self._attr_unique_id = f"{entry.entry_id}_enabled"
        self._attr_device_info = {
            "identifiers": {(DOMAIN, entry.entry_id)},
            "name": entry.title,
        }

    @property
    def _ctrl(self):
        return self._entry.runtime_data

    @property
    def is_on(self) -> bool:
        return self._ctrl.enabled

    @property
    def extra_state_attributes(self) -> dict:
        return {"heizung_pausiert": self._ctrl.active}

    async def async_added_to_hass(self) -> None:
        last = await self.async_get_last_state()
        if last is not None and last.state == "off":
            await self._ctrl.async_set_enabled(False)

    async def async_turn_on(self, **kwargs) -> None:
        await self._ctrl.async_set_enabled(True)
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs) -> None:
        await self._ctrl.async_set_enabled(False)
        self.async_write_ha_state()
