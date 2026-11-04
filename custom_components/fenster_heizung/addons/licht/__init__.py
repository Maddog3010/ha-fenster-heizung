"""Modul 18 Licht & Lampen – Addon (früher Lab „Licht & Lampen“ im Kern).

Das Modul läuft ganz im Dashboard. Seine Einstellungen (Szenen, Hinweis bei langem Licht) liegen weiter im Layout
unter „li“, deshalb bleibt beim Umzug alles erhalten. Der Python-Teil meldet nur, dass das Addon läuft.
"""
from __future__ import annotations

from typing import Any

from custom_components.fenster_heizung.addon_api import SWAddon


class Addon(SWAddon):
    def summary(self) -> dict[str, Any]:
        n = sum(1 for s in self.hass.states.async_all("light") if not isinstance(s.attributes.get("entity_id"), (list, tuple)))
        return {"info": f"{n} Lampen"}
