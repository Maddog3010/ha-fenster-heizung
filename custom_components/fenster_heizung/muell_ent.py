"""Modul 17 Müllabfuhr: echte Entitäten im Kern (ab Modul 17 v1.0).

Das Addon liefert die Werte über `values()` seines Managers (hass.data[DOMAIN]["muell"]) und meldet Änderungen über
`hass.data[DOMAIN]["muell_push"]()`. Die Entitäten entstehen erst, wenn das Addon das erste Mal meldet: Sensor
„nächste Abholung“, je Abfallart „Tage bis zur Abholung“, Vorrat sowie zwei Binärsensoren „rausstellen“ und „reinholen“.
Die Entitäts-IDs bleiben dieselben wie bisher (sensor.strom_waerme_muell_…), damit eigene Karten und Automationen weiterlaufen.
"""
from __future__ import annotations

from typing import Any, Callable

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect, async_dispatcher_send

from .const import DOMAIN

SIGNAL_MUELL = "fenster_heizung_muell"
PRE = "strom_waerme_muell"
DEVICE = {"identifiers": {(DOMAIN, "muellabfuhr")}, "name": "Strom & Wärme · Müllabfuhr", "manufacturer": "Strom & Wärme", "model": "Modul 17", "entry_type": "service"}


def values(hass: HomeAssistant) -> dict[str, Any] | None:
    m = hass.data.get(DOMAIN, {}).get("muell") if hass else None
    try:
        return m.values() if m is not None and hasattr(m, "values") else None
    except Exception:  # noqa: BLE001 - ein Fehler im Addon darf die Entitäten nicht abstürzen lassen
        return None


def register(hass: HomeAssistant, kind: str, add: Callable[[list], None], make: Callable[[str], Any], on_unload: Callable[[Callable], None]) -> None:
    """Plattform (sensor/binary_sensor) anmelden. Neue Schlüssel (zum Beispiel eine neue Abfallart) werden nachgelegt."""
    store = hass.data.setdefault(DOMAIN, {})
    reg = store.setdefault("muell_reg", {})
    reg[kind] = {"add": add, "make": make, "have": set()}
    store["muell_ent"] = 1
    store["muell_push"] = lambda: async_dispatcher_send(hass, SIGNAL_MUELL)

    @callback
    def _sync(*_a) -> None:
        v = values(hass)
        if not v:
            return
        r = reg.get(kind)
        if r is None:
            return
        keys = v.get(kind + "_keys") or []
        new = [k for k in keys if k not in r["have"]]
        if new:
            m = store.get("muell")
            if m is not None and getattr(m, "_pub", None):
                m._unpublish()  # vorher nur gesetzte Zustände räumen, sonst bekämen die Entitäten eine ID mit „_2“
            r["have"].update(new)
            r["add"]([r["make"](k) for k in new])

    unsub = async_dispatcher_connect(hass, SIGNAL_MUELL, _sync)

    def _gone() -> None:
        unsub()
        reg.pop(kind, None)
        if not reg:
            store.pop("muell_ent", None)
            store.pop("muell_push", None)

    on_unload(_gone)
    _sync()


class _Base:
    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, kind: str, key: str) -> None:
        self._kind, self._key = kind, key
        self._attr_unique_id = f"{DOMAIN}_muell_{key}"
        self._attr_device_info = DEVICE
        self.entity_id = f"{kind}.{PRE}_{key}"

    def _row(self) -> dict[str, Any] | None:
        v = values(self.hass)
        return ((v or {}).get(self._kind) or {}).get(self._key) if v else None

    @property
    def available(self) -> bool:
        return self._row() is not None

    @property
    def name(self) -> str | None:
        r = self._row() or {}
        return r.get("name") or self._key

    @property
    def icon(self) -> str | None:
        return (self._row() or {}).get("icon")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return (self._row() or {}).get("attrs") or {}

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(async_dispatcher_connect(self.hass, SIGNAL_MUELL, self._refresh))

    @callback
    def _refresh(self, *_a) -> None:
        self.async_write_ha_state()
