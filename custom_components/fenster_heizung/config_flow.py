"""Config- und Options-Flow: Sensoren und Thermostate per UI wählbar."""
from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.const import CONF_NAME
from homeassistant.core import callback
from homeassistant.helpers import selector

from .const import (
    ACTION_OFF,
    ACTION_SETBACK,
    CONF_ACTION,
    CONF_BLOCK_FROM,
    CONF_BLOCK_TO,
    CONF_CLOSE_DELAY,
    CONF_GAS_KWH_PER_M3,
    CONF_HEAT_POWER,
    CONF_HEATING_ENTITY,
    CONF_HEATING_OFF_STATES,
    CONF_NOTIFY_AFTER,
    CONF_NOTIFY_SERVICE,
    CONF_OPEN_DELAY,
    CONF_OUTDOOR_MAX,
    CONF_OUTDOOR_SENSOR,
    CONF_SETBACK_TEMP,
    CONF_THERMOSTATS,
    CONF_WINDOWS,
    DEFAULT_CLOSE_DELAY,
    DEFAULT_GAS_KWH_PER_M3,
    DEFAULT_HEAT_POWER,
    DEFAULT_HEATING_OFF_STATES,
    DEFAULT_NOTIFY_AFTER,
    DEFAULT_OUTDOOR_MAX,
    DEFAULT_OPEN_DELAY,
    DEFAULT_SETBACK_TEMP,
    DOMAIN,
    OPTIONAL_KEYS,
)


def _delay(max_s: int) -> selector.NumberSelector:
    return selector.NumberSelector(
        selector.NumberSelectorConfig(
            min=0, max=max_s, step=5, unit_of_measurement="s",
            mode=selector.NumberSelectorMode.BOX,
        )
    )


def _schema(with_name: bool) -> vol.Schema:
    fields: dict = {}
    if with_name:
        fields[vol.Required(CONF_NAME)] = selector.TextSelector()
    fields.update(
        {
            vol.Required(CONF_WINDOWS): selector.EntitySelector(
                selector.EntitySelectorConfig(domain="binary_sensor", multiple=True)
            ),
            vol.Required(CONF_THERMOSTATS): selector.EntitySelector(
                selector.EntitySelectorConfig(domain="climate", multiple=True)
            ),
            vol.Required(
                CONF_OPEN_DELAY, default=DEFAULT_OPEN_DELAY
            ): _delay(3600),
            vol.Required(
                CONF_CLOSE_DELAY, default=DEFAULT_CLOSE_DELAY
            ): _delay(3600),
            vol.Required(CONF_ACTION, default=ACTION_OFF): selector.SelectSelector(
                selector.SelectSelectorConfig(
                    options=[ACTION_OFF, ACTION_SETBACK],
                    translation_key="action",
                    mode=selector.SelectSelectorMode.DROPDOWN,
                )
            ),
            vol.Required(
                CONF_SETBACK_TEMP, default=DEFAULT_SETBACK_TEMP
            ): selector.NumberSelector(
                selector.NumberSelectorConfig(
                    min=5, max=25, step=0.5, unit_of_measurement="°C",
                    mode=selector.NumberSelectorMode.BOX,
                )
            ),
            vol.Optional(CONF_HEATING_ENTITY): selector.EntitySelector(
                selector.EntitySelectorConfig(
                    domain=[
                        "climate", "binary_sensor", "sensor", "switch",
                        "input_boolean", "input_select", "select",
                    ]
                )
            ),
            vol.Required(
                CONF_HEATING_OFF_STATES, default=DEFAULT_HEATING_OFF_STATES
            ): selector.TextSelector(),
            vol.Optional(CONF_OUTDOOR_SENSOR): selector.EntitySelector(
                selector.EntitySelectorConfig(domain="sensor", device_class="temperature")
            ),
            vol.Required(
                CONF_OUTDOOR_MAX, default=DEFAULT_OUTDOOR_MAX
            ): selector.NumberSelector(
                selector.NumberSelectorConfig(
                    min=-20, max=40, step=0.5, unit_of_measurement="°C",
                    mode=selector.NumberSelectorMode.BOX,
                )
            ),
            vol.Optional(CONF_BLOCK_FROM): selector.TimeSelector(),
            vol.Optional(CONF_BLOCK_TO): selector.TimeSelector(),
            vol.Optional(CONF_NOTIFY_SERVICE): selector.TextSelector(),
            vol.Required(
                CONF_NOTIFY_AFTER, default=DEFAULT_NOTIFY_AFTER
            ): selector.NumberSelector(
                selector.NumberSelectorConfig(
                    min=0, max=240, step=1, unit_of_measurement="min",
                    mode=selector.NumberSelectorMode.BOX,
                )
            ),
            vol.Required(
                CONF_HEAT_POWER, default=DEFAULT_HEAT_POWER
            ): selector.NumberSelector(
                selector.NumberSelectorConfig(
                    min=0.1, max=30, step=0.1, unit_of_measurement="kW",
                    mode=selector.NumberSelectorMode.BOX,
                )
            ),
            vol.Required(
                CONF_GAS_KWH_PER_M3, default=DEFAULT_GAS_KWH_PER_M3
            ): selector.NumberSelector(
                selector.NumberSelectorConfig(
                    min=5, max=15, step=0.1, unit_of_measurement="kWh/m³",
                    mode=selector.NumberSelectorMode.BOX,
                )
            ),
        }
    )
    return vol.Schema(fields)


class FensterHeizungFlow(ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(title=user_input[CONF_NAME], data=user_input)
        return self.async_show_form(step_id="user", data_schema=_schema(True))

    @staticmethod
    @callback
    def async_get_options_flow(config_entry) -> OptionsFlow:
        return FensterHeizungOptions()


class FensterHeizungOptions(OptionsFlow):
    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            for key in OPTIONAL_KEYS:  # geleerte Felder wirklich leeren
                user_input.setdefault(key, None)
            return self.async_create_entry(data=user_input)
        current = {**self.config_entry.data, **self.config_entry.options}
        return self.async_show_form(
            step_id="init",
            data_schema=self.add_suggested_values_to_schema(_schema(False), current),
        )
