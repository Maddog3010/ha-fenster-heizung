"""Addon-Schnittstelle (API 1) für Strom & Wärme.

Ein Addon ist ein Modul als eigenes Paket mit Steckbrief (addon.json), Python-Teil und Oberfläche (www/panel.js).
Der Kern lädt es, gibt ihm über ``AddonCore`` Zugriff auf seine Dienste und kann es jederzeit wieder entladen.

Was ein Addon darf:
  * eigenen Speicher (``core.store()``), mit Sicherung wie alle Module
  * Befehle für seine Seite anmelden (``core.cmd()``), die Seite ruft sie über ``fenster_heizung/addon_call`` auf
  * Zustände beobachten und Timer stellen (``core.track_state()``, ``core.every()``), alles wird beim Entladen gelöst
  * Räume (Bereiche) des Hauses lesen, Meldungen senden, ins Protokoll schreiben

Was ein Addon nicht darf: Dateien des Kerns ändern oder Speicher anderer Module schreiben.
"""
from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any, Awaitable, Callable

from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import async_track_state_change_event, async_track_time_interval

from .backup import SafeStore
from .const import DOMAIN
from .diag import diag_log

_LOGGER = logging.getLogger(__name__)

API_VERSION = 1

Handler = Callable[[dict[str, Any], bool], Awaitable[Any]]


class AddonError(Exception):
    """Fehler, den die Seite als Text anzeigen darf."""


class AddonCore:
    """Was der Kern einem Addon anbietet. Jedes Addon bekommt seine eigene Instanz."""

    def __init__(self, hass: HomeAssistant, meta: dict[str, Any]) -> None:
        self.hass = hass
        self.meta = meta
        self.id: str = meta["id"]
        self._cmds: dict[str, Handler] = {}
        self._unsubs: list[CALLBACK_TYPE] = []
        self._stores: list[SafeStore] = []
        self._provided: list[str] = []

    # ---- Speicher
    def store(self, version: int = 1, name: str = "", legacy: str = "") -> SafeStore:
        """Eigener Speicher. legacy = Name des Speichers, den das Modul schon vor dem Umzug ins Addon hatte
        (z. B. fenster_heizung_muell): so bleiben alle Daten erhalten."""
        key = legacy or (f"{DOMAIN}_addon_{self.id}" + (f"_{name}" if name else ""))
        s = SafeStore(self.hass, version, key)
        self._stores.append(s)
        return s

    def adopt_store(self, s: SafeStore) -> None:
        """Einen Speicher, den das Addon selbst angelegt hat, zum Addon zählen (für Deinstallieren ohne Daten)."""
        if s not in self._stores:
            self._stores.append(s)

    def provide(self, key: str, obj: Any) -> None:
        """Unter hass.data[DOMAIN][key] bereitstellen, wie es ein Modul im Kern tat (Start, Tags, Messwerk finden es dort)."""
        self.hass.data.setdefault(DOMAIN, {})[key] = obj
        self._provided.append(key)

    async def async_remove_stores(self) -> None:
        for s in self._stores:
            try:
                await s.async_remove()
                await s._bk.async_remove()  # noqa: SLF001 - Sicherungskopie gehört dazu
            except Exception:  # noqa: BLE001
                _LOGGER.debug("Speicher %s ließ sich nicht löschen", s.key)

    # ---- Befehle für die Seite
    def cmd(self, name: str, handler: Handler) -> None:
        self._cmds[name] = handler

    async def async_call(self, name: str, data: dict[str, Any], admin: bool) -> Any:
        h = self._cmds.get(name)
        if h is None:
            raise AddonError(f"Unbekannter Befehl {name}")
        return await h(data, admin)

    # ---- Beobachten, Timer
    def track_state(self, entities: list[str], cb: Callable[[Event], Any]) -> CALLBACK_TYPE:
        u = async_track_state_change_event(self.hass, entities, cb)
        self._unsubs.append(u)
        return u

    def every(self, seconds: float, cb: Callable[[Any], Any]) -> CALLBACK_TYPE:
        u = async_track_time_interval(self.hass, cb, timedelta(seconds=seconds))
        self._unsubs.append(u)
        return u

    def on_unload(self, u: CALLBACK_TYPE) -> None:
        self._unsubs.append(u)

    @callback
    def release(self) -> None:
        for u in self._unsubs:
            try:
                u()
            except Exception:  # noqa: BLE001
                pass
        self._unsubs.clear()
        self._cmds.clear()
        for k in self._provided:
            self.hass.data.get(DOMAIN, {}).pop(k, None)
        self._provided.clear()

    # ---- Haus
    def areas(self) -> list[dict[str, Any]]:
        """Bereiche (Räume) aus Home Assistant mit Etage."""
        reg = ar.async_get(self.hass)
        out = [{"id": a.id, "name": a.name, "floor": getattr(a, "floor_id", None) or "", "icon": a.icon or ""} for a in reg.async_list_areas()]
        return sorted(out, key=lambda x: x["name"].lower())

    def device_entities(self, entity_id: str) -> list[er.RegistryEntry]:
        """Alle Entitäten, die zum selben Gerät gehören wie ``entity_id``."""
        reg = er.async_get(self.hass)
        ent = reg.async_get(entity_id)
        if ent is None or not ent.device_id:
            return []
        return [e for e in er.async_entries_for_device(reg, ent.device_id) if not e.disabled]

    def device_info(self, entity_id: str) -> dict[str, str]:
        reg = er.async_get(self.hass)
        ent = reg.async_get(entity_id)
        if ent is None or not ent.device_id:
            return {"platform": ent.platform if ent else "", "model": "", "maker": ""}
        dev = dr.async_get(self.hass).async_get(ent.device_id)
        return {"platform": ent.platform, "model": (dev.model if dev else "") or "", "maker": (dev.manufacturer if dev else "") or "", "area": (dev.area_id if dev else "") or ""}

    # ---- Meldungen, Protokoll
    async def notify(self, title: str, message: str, to: list[str]) -> int:
        n = 0
        for svc in to:
            dom, _, name = svc.partition(".")
            if dom != "notify" or not name or not self.hass.services.has_service("notify", name):
                continue
            try:
                await self.hass.services.async_call("notify", name, {"title": title, "message": message}, blocking=False)
                n += 1
            except Exception:  # noqa: BLE001
                diag_log(self.hass, "warn", f"Modul {self.meta.get('n')}: Meldung an {svc} fehlgeschlagen")
        return n

    def log(self, level: str, msg: str, entity: str | None = None) -> None:
        diag_log(self.hass, level, f"Modul {self.meta.get('n')} {self.meta.get('name')}: {msg}", entity=entity)


def addon_on(hass: HomeAssistant, aid: str) -> bool:
    """Läuft das Addon gerade?"""
    mgr = hass.data.get(DOMAIN, {}).get("addons")
    return bool(mgr is not None and aid in getattr(mgr, "live", {}))


class SWAddon:
    """Basisklasse. Ein Addon überschreibt async_setup und meist summary()."""

    def __init__(self, core: AddonCore) -> None:
        self.core = core
        self.hass = core.hass

    async def async_setup(self) -> None:
        """Speicher laden, Befehle anmelden, beobachten."""

    async def async_unload(self) -> None:
        """Wird vor dem Entladen gerufen. Timer und Beobachter löst der Kern selbst."""

    async def async_remove(self, keep: bool) -> None:
        """Wird beim Deinstallieren nach async_unload gerufen. Ohne keep löscht der Kern danach den Speicher."""

    def messwerk(self) -> list[dict[str, Any]]:
        """Sensoren für das Messwerk: [{"id", "name", "eid", "why", "group", "unit", "where", "tab"}]. tab = Reiter der Einstellungen."""
        return []

    def summary(self) -> dict[str, Any]:
        """Kurzfassung für Start, Tablet und Einstellungen: {"tile": {...}, "hints": [...], "info": "..."}"""
        return {}
