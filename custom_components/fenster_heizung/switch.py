"""Schalter pro Raum: Fensterregelung, Heizplan und Elektroheizer."""
from __future__ import annotations

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from .const import DOMAIN, SIGNAL_UPDATE


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    entities = [EnabledSwitch(entry), PlanSwitch(entry)]
    cfg = {**entry.data, **entry.options}
    if cfg.get("htr_on") == "on" and cfg.get("htr_entity"):
        entities.append(HeaterSwitch(entry))
    async_add_entities(entities)


class _Base(SwitchEntity):
    _attr_has_entity_name = True

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


class EnabledSwitch(RestoreEntity, _Base):
    """Fensterregelung pro Raum ein- oder ausschalten."""

    _attr_icon = "mdi:window-open-variant"

    def __init__(self, entry: ConfigEntry) -> None:
        super().__init__(entry, "enabled")

    @property
    def is_on(self) -> bool:
        return self._ctrl.enabled

    @property
    def extra_state_attributes(self) -> dict:
        return {"heizung_pausiert": self._ctrl.active, "funktion": "fensterregelung"}

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


class PlanSwitch(_Base):
    """Heizplan pro Raum ein- oder ausschalten (Plan selbst bearbeitest du im Dashboard)."""

    _attr_icon = "mdi:calendar-clock"
    _attr_should_poll = False

    def __init__(self, entry: ConfigEntry) -> None:
        super().__init__(entry, "plan_enabled")

    @property
    def is_on(self) -> bool:
        return self._ctrl.plan_enabled_flag

    @property
    def extra_state_attributes(self) -> dict:
        return {"funktion": "heizplan"}

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass, SIGNAL_UPDATE.format(self._entry.entry_id), self._refresh
            )
        )

    @callback
    def _refresh(self) -> None:
        self.async_write_ha_state()

    async def async_turn_on(self, **kwargs) -> None:
        if not self._ctrl.plan_dict()["entries"]:
            raise ServiceValidationError(
                "Noch kein Heizplan eingerichtet. Lege zuerst im Dashboard Schaltpunkte an."
            )
        await self._ctrl.async_set_plan_enabled(True)

    async def async_turn_off(self, **kwargs) -> None:
        await self._ctrl.async_set_plan_enabled(False)


class HeaterSwitch(_Base):
    """Elektroheizer des Raums erlauben oder pausieren (die Regelung selbst läuft im Hintergrund)."""

    _attr_icon = "mdi:heat-wave"
    _attr_should_poll = False

    def __init__(self, entry: ConfigEntry) -> None:
        super().__init__(entry, "heater_enabled")

    @property
    def is_on(self) -> bool:
        return self._ctrl.heater.manual_on

    @property
    def extra_state_attributes(self) -> dict:
        return {"funktion": "heizer"}

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass, SIGNAL_UPDATE.format(self._entry.entry_id), self._refresh
            )
        )

    @callback
    def _refresh(self) -> None:
        self.async_write_ha_state()

    async def _set(self, on: bool) -> None:
        await self._ctrl.heater.async_set_manual(on)
        pv = self.hass.data.get(DOMAIN, {}).get("pv")
        if pv is not None:
            await pv.async_evaluate()  # sofort reagieren, nicht erst im nächsten Takt

    async def async_turn_on(self, **kwargs) -> None:
        await self._set(True)

    async def async_turn_off(self, **kwargs) -> None:
        await self._set(False)
