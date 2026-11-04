"""Modul 17 Müllabfuhr – Addon (früher Lab „Müllabfuhr“ im Kern)."""
from __future__ import annotations

from typing import Any

from custom_components.fenster_heizung.addon_api import SWAddon

from .manager import MuellManager


class Addon(SWAddon):
    async def async_setup(self) -> None:
        self.mgr = MuellManager(self.hass)   # Speicher fenster_heizung_muell wie bisher
        self.core.adopt_store(self.mgr._store)  # noqa: SLF001
        await self.mgr.async_start()
        # Seite, Start, Tablet, Tags und Messwerk finden das Modul wie früher unter hass.data[DOMAIN]["muell"]
        self.core.provide("muell", self.mgr)

    async def async_unload(self) -> None:
        self.mgr.async_stop()

    def summary(self) -> dict[str, Any]:
        cal = self.mgr.cal_entity()
        return {"info": "Kalender " + (self.hass.states.get(cal).attributes.get("friendly_name", cal) if cal and self.hass.states.get(cal) else "fehlt")}
