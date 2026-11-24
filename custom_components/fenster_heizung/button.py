"""Knöpfe: Sponsor-Max-Extras · „Tablet wecken“ je Wand-Tablet (z. B. für die Türklingel)."""
from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from . import mx_ent
from .const import DOMAIN

OWNER = "btn_owner"


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback) -> None:
    store = hass.data.setdefault(DOMAIN, {})
    if store.get(OWNER) in (None, entry.entry_id):
        store[OWNER] = entry.entry_id
        mx_ent.register(hass, "button", async_add_entities, MxButton, entry.async_on_unload)


class MxButton(mx_ent.MxBase, ButtonEntity):
    def __init__(self, key: str, v: dict) -> None:
        mx_ent.MxBase.__init__(self, key, v)
        self._tid = v.get("tid") or ""

    async def async_press(self) -> None:
        mm = self.hass.data.get(DOMAIN, {}).get("mxx")
        if mm is not None and mm.on("tb"):
            await mm.async_wake(self._tid)
