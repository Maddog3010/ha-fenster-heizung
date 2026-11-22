"""Modul 18 Licht & Lampen: Hintergrund-Teil des Addons (ab v0.2 Build 2).

Ab Build 4 auch die Zuordnung Grundriss-Raum → Bereich (pmap) für die Ansicht „Grundriss“.

Bis Build 1 lief das Modul nur im Dashboard. Ab Build 2 merkt sich der Python-Teil:
  * seit wann jede Lampe an ist – auch über einen Neustart von Home Assistant (vorher kam „an seit“ aus last_changed)
  * die Brennstunden je Lampe und Tag (90 Tage)
  * die Ansicht und den Schalter „Optik wie bisher“
und schaltet Räume über eine passende Lichtgruppe, damit alle Lampen gleichzeitig reagieren.
Szenen, ausgeblendete Räume und „Licht lange an“ bleiben in Build 2 im Layout (layout.li), weil Tags und Messwerk
sie dort lesen. Beim ersten Start legt das Addon eine Kopie davon in seinem Speicher ab (Umzug ab Build 6).

Speicher: fenster_heizung_addon_licht, Schema 1. Sensoren: sensor.strom_waerme_licht_* (über licht_ent im Kern).
"""
from __future__ import annotations

import logging
import re
import time
from typing import Any

from homeassistant.core import Event, callback
from homeassistant.util import dt as dt_util

from custom_components.fenster_heizung.addon_api import AddonError, SWAddon
from custom_components.fenster_heizung.const import DOMAIN

from . import logic as L

_LOGGER = logging.getLogger(__name__)
_ENT = re.compile(r"^light\.[a-z0-9_]+$")
SCHEMA = 1
ON = "on"


class Addon(SWAddon):
    async def async_setup(self) -> None:
        self.store = self.core.store(SCHEMA)
        d = await self.store.async_load()
        d = d if isinstance(d, dict) else {}
        self.burn = L.Burn(dt_util.DEFAULT_TIME_ZONE, d.get("burn"))
        self.prefs = L.clean_prefs(d.get("prefs"))
        self.legacy = L.clean_legacy(d.get("legacy"))
        self.pmap = L.clean_pmap(d.get("pmap"))
        self.started = d.get("started") or dt_util.now().date().isoformat()
        now = time.time()
        self.burn.resume({e: self._lc(e) for e in self._lamps() if self._is_on(e)}, now)
        self.burn.prune(now)
        for c in ("get", "set", "act"):
            self.core.cmd(c, getattr(self, f"_c_{c}"))
        self.core.on_unload(self.hass.bus.async_listen("state_changed", self._on_state))
        self.core.every(60, self._tick)
        self.core.provide("licht", self)
        self._save(1)
        self._push()

    async def async_unload(self) -> None:
        self.burn.tick(time.time())
        self._save(0)

    async def async_remove(self, keep: bool) -> None:
        self.hass.data.get(DOMAIN, {}).pop("licht", None)

    def _save(self, delay: float = 10) -> None:
        self.store.async_delay_save(lambda: {"burn": self.burn.dump(), "prefs": self.prefs, "pmap": self.pmap, "legacy": self.legacy, "started": self.started}, delay)

    # ---- Lampen
    def _lamps(self) -> list[str]:
        """Einzelne Lampen (ohne Lichtgruppen)."""
        st = self.hass.states
        return sorted(e for e in st.async_entity_ids("light") if not L.members((st.get(e).attributes if st.get(e) else {})))

    def _groups(self) -> dict[str, list[str]]:
        st = self.hass.states
        out = {}
        for e in st.async_entity_ids("light"):
            s = st.get(e)
            m = L.members(s.attributes) if s else []
            if m:
                out[e] = m
        return out

    def _is_on(self, e: str) -> bool:
        s = self.hass.states.get(e)
        return bool(s and s.state == ON)

    def _lc(self, e: str) -> float | None:
        s = self.hass.states.get(e)
        try:
            return s.last_changed.timestamp() if s else None
        except Exception:  # noqa: BLE001
            return None

    @callback
    def _on_state(self, ev: Event) -> None:
        eid = ev.data.get("entity_id") or ""
        if not eid.startswith("light."):
            return
        new, old = ev.data.get("new_state"), ev.data.get("old_state")
        if new is not None and L.members(new.attributes):
            return  # Gruppen zählen nicht doppelt
        was, now_on = bool(old and old.state == ON), bool(new and new.state == ON)
        if was == now_on:
            return
        t = time.time()
        if now_on:
            self.burn.start(eid, t)
        else:
            self.burn.stop(eid, t)
        self._save()
        self._push()

    @callback
    def _tick(self, _now: Any = None) -> None:
        t = time.time()
        self.burn.tick(t)
        lamps = set(self._lamps())
        self.burn.prune(t, keep=lambda e: e in lamps and self._is_on(e))
        self._save(30)
        self._push()

    def _push(self) -> None:
        f = self.hass.data.get(DOMAIN, {}).get("licht_push")
        if f:
            try:
                f()
            except Exception:  # noqa: BLE001
                _LOGGER.debug("licht_push fehlgeschlagen", exc_info=True)

    # ---- Sensoren (licht_ent im Kern liest das hier)
    def values(self) -> dict[str, Any]:
        t = time.time()
        lamps = self._lamps()
        on = [e for e in lamps if self._is_on(e)]
        st = self.hass.states
        fn = lambda e: (st.get(e).attributes.get("friendly_name") if st.get(e) else None) or e  # noqa: E731
        today = self.burn.today(t)
        h = round(sum(today.values()) / 3600, 2)
        top = sorted(today.items(), key=lambda x: -x[1])[:5]
        lon = min(on, key=lambda e: self.burn.on.get(e, t)) if on else None
        mins = round((t - self.burn.on.get(lon, t)) / 60) if lon else 0
        return {"keys": ["lampen_an", "licht_heute", "laengste_an"], "sensor": {
            "lampen_an": {"name": "Lampen an", "icon": "mdi:lightbulb-group", "value": len(on), "sc": "measurement",
                          "attrs": {"lampen": [fn(e) for e in on], "von": len(lamps)}},
            "licht_heute": {"name": "Licht heute", "icon": "mdi:lightbulb-on-outline", "unit": "h", "value": h, "sc": "measurement",
                            "attrs": {"meiste": [{"lampe": fn(e), "stunden": round(s / 3600, 2)} for e, s in top]}},
            "laengste_an": {"name": "Längste an", "icon": "mdi:timer-outline", "unit": "min", "dc": "duration", "value": mins,
                            "attrs": {"lampe": fn(lon) if lon else None, "seit": dt_util.utc_from_timestamp(self.burn.on[lon]).isoformat() if lon else None}},
        }}

    # ---- Befehle der Seite
    def _floors(self) -> dict[str, str]:
        try:
            from homeassistant.helpers import floor_registry as fr
            return {f.floor_id: f.name for f in fr.async_get(self.hass).async_list_floors()}
        except Exception:  # noqa: BLE001 - ältere Home-Assistant-Versionen ohne Etagen
            return {}

    def _state(self) -> dict[str, Any]:
        t = time.time()
        return {"ver": 2, "on": {e: round(v) for e, v in self.burn.on.items()}, "today": {e: round(s) for e, s in self.burn.today(t).items()},
                "week": self.burn.week(t), "groups": self._groups(), "prefs": self.prefs, "pmap": self.pmap, "legacy": bool(self.legacy),
                "areas": self.core.areas(), "floors": self._floors(), "since": self.started}

    async def _c_get(self, data: dict[str, Any], admin: bool) -> dict[str, Any]:
        if self.legacy is None and admin:  # Kopie der bisherigen Einstellungen, einmal
            leg = L.clean_legacy(data.get("legacy"))
            if leg is not None:
                self.legacy = leg
                self._save(1)
        return self._state()

    async def _c_set(self, data: dict[str, Any], admin: bool) -> dict[str, Any]:
        if not admin:
            raise AddonError("Nur Administratoren können das ändern")
        self.prefs = L.clean_prefs({**self.prefs, **(data.get("prefs") or {})})
        pm = data.get("pmap")  # Grundriss-Zuordnung: {Plan-ID: Bereich | "-" | ""}; leer = wieder automatisch
        if isinstance(pm, dict):
            merged = {**self.pmap, **{k: v for k, v in pm.items() if isinstance(v, str) and v}}
            for k, v in pm.items():
                if v in ("", None):
                    merged.pop(k, None)
            self.pmap = L.clean_pmap(merged)
        self._save(2)
        return self._state()

    async def _c_act(self, data: dict[str, Any], admin: bool) -> dict[str, Any]:
        """Schalten über die Seite. a = "switch": ids (Lampen), on (bool), optional brightness_pct.
        Passt eine Lichtgruppe genau, wird über sie geschaltet (alle Lampen gleichzeitig, weniger Funkverkehr)."""
        a = data.get("a")
        if a != "switch":
            raise AddonError("Unbekannte Aktion")
        lamps = set(self._lamps())
        ids = [e for e in data.get("ids") or [] if isinstance(e, str) and _ENT.match(e) and e in lamps][:200]
        if not ids:
            raise AddonError("Keine Lampe gewählt")
        target = L.plan_switch(ids, self._groups())
        svc = "turn_on" if data.get("on") else "turn_off"
        sd: dict[str, Any] = {"entity_id": target}
        if svc == "turn_on" and data.get("brightness_pct") is not None:
            try:
                sd["brightness_pct"] = max(1, min(100, int(data["brightness_pct"])))
            except (TypeError, ValueError):
                pass
        try:  # warten, damit ein Fehler der Integration (z. B. „No such command“) auf der Seite ankommt
            await self.hass.services.async_call("light", svc, sd, blocking=True)
        except Exception as err:  # noqa: BLE001
            raise AddonError(f"Integration meldet: {err}"[:200]) from err
        return {"via": target}

    def summary(self) -> dict[str, Any]:
        lamps = self._lamps()
        n = sum(1 for e in lamps if self._is_on(e))
        return {"info": f"{len(lamps)} Lampen", "tile": {"sub": f"{n} von {len(lamps)} an" if lamps else "Keine Lampen", "c": "wa" if n else ""}}
