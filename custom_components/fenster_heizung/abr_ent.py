"""Modul 20 Abrechnungen: echte Sensoren im Kern (ab Addon v0.9).

Das Addon liefert die Werte über `values()` seines Managers (hass.data[DOMAIN]["abrechnung"]) und meldet Änderungen über
`hass.data[DOMAIN]["abr_push"]()`. Die Sensoren entstehen erst, wenn das Addon das erste Mal meldet – ohne Addon gibt es keine.
Preise in €/kWh bzw. €/m³ passen direkt ins Energie-Dashboard von Home Assistant („Entität mit dem aktuellen Preis“).
Entitäts-IDs: sensor.strom_waerme_abrechnung_<key>.
"""
from __future__ import annotations

from datetime import date
from typing import Any, Callable

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect, async_dispatcher_send

from .const import DOMAIN

SIGNAL_ABR = "fenster_heizung_abr"
PRE = "strom_waerme_abrechnung"
DEVICE = {"identifiers": {(DOMAIN, "abrechnung")}, "name": "Strom & Wärme · Abrechnungen", "manufacturer": "Strom & Wärme", "model": "Modul 20", "entry_type": "service"}


def values(hass: HomeAssistant) -> dict[str, Any] | None:
    m = hass.data.get(DOMAIN, {}).get("abrechnung") if hass else None
    try:
        return m.values() if m is not None and hasattr(m, "values") else None
    except Exception:  # noqa: BLE001 - ein Fehler im Addon darf die Sensoren nicht abstürzen lassen
        return None


def register(hass: HomeAssistant, add: Callable[[list], None], make: Callable[[str], Any], on_unload: Callable[[Callable], None]) -> None:
    """Plattform anmelden. Neue Schlüssel (neuer Vertrag, neues Fahrzeug, neuer Vorrat) werden nachgelegt, entfallene werden „nicht verfügbar“."""
    store = hass.data.setdefault(DOMAIN, {})
    have: set[str] = set()
    store["abr_ent"] = 1
    store["abr_push"] = lambda: async_dispatcher_send(hass, SIGNAL_ABR)

    @callback
    def _sync(*_a) -> None:
        v = values(hass)
        if not v:
            return
        new = [k for k in v.get("keys") or [] if k not in have]
        if new:
            have.update(new)
            add([make(k) for k in new])

    unsub = async_dispatcher_connect(hass, SIGNAL_ABR, _sync)

    def _gone() -> None:
        unsub()
        store.pop("abr_ent", None)
        store.pop("abr_push", None)

    on_unload(_gone)
    _sync()


class Base:
    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, key: str) -> None:
        self._key = key
        self._attr_unique_id = f"{DOMAIN}_abr_{key}"
        self._attr_device_info = DEVICE
        self.entity_id = f"sensor.{PRE}_{key}"

    def _row(self) -> dict[str, Any] | None:
        v = values(self.hass)
        return ((v or {}).get("sensor") or {}).get(self._key) if v else None

    @property
    def available(self) -> bool:
        r = self._row()
        return r is not None and r.get("value") is not None

    @property
    def name(self) -> str | None:
        return (self._row() or {}).get("name") or self._key

    @property
    def icon(self) -> str | None:
        return (self._row() or {}).get("icon")

    @property
    def native_unit_of_measurement(self) -> str | None:
        return (self._row() or {}).get("unit")

    @property
    def device_class(self) -> str | None:
        return (self._row() or {}).get("dc")

    @property
    def state_class(self) -> str | None:
        return (self._row() or {}).get("sc")

    @property
    def native_value(self) -> Any:
        r = self._row()
        if not r:
            return None
        v = r.get("value")
        if r.get("dc") == "date" and isinstance(v, str):
            try:
                return date.fromisoformat(v)
            except ValueError:
                return None
        return v

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return (self._row() or {}).get("attrs") or {}

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(async_dispatcher_connect(self.hass, SIGNAL_ABR, self._refresh))

    @callback
    def _refresh(self, *_a) -> None:
        self.async_write_ha_state()
