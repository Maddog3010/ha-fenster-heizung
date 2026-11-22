"""Modul 18 Licht & Lampen: Hintergrund-Teil des Addons (ab v0.2 Build 2).

Ab Build 8: Regeln – Bewegung → Licht, Alle weg → Alle aus, Alarm in Modul 11 → Licht an, Abends → Licht an. Die Regeln laufen hier im
Python-Teil (auch ohne offenes Dashboard), schalten nur Lampen, die sie selbst angemacht haben, wieder aus und schreiben ein kurzes
Protokoll (letzte 40 Einträge). Pausieren geht für alle Regeln auf einmal.

Ab Build 6: „Meine Lampen“ – Liste mit eigenem Namen, Raum (Bereich), Art und „bei Alle aus“, Modus auto/mine, Testen (Blinken) und
der letzte Fehler je Lampe (z. B. Overkiz „No such command“), bis das Schalten wieder klappt.

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
        self.lamps = L.clean_lamps(d.get("lamps"))
        self.mode = d.get("mode") if d.get("mode") in L.MODES else ""
        self.ignored = L.clean_ignored(d.get("ignored"))
        self.errs: dict[str, dict[str, str]] = {}
        self.started = d.get("started") or dt_util.now().date().isoformat()
        self.rules = L.clean_rules(d.get("rules"))                       # Build 8
        self.rlog: list[dict[str, Any]] = [x for x in d.get("rlog") or [] if isinstance(x, dict)][: L.LOG_MAX]
        self.rpause = float(d.get("rpause") or 0)                         # Regeln pausiert bis (Zeitstempel), 0 = aktiv
        self.rsun: dict[str, dict[str, str]] = d.get("rsun") if isinstance(d.get("rsun"), dict) else {}
        self._rs: dict[str, dict[str, Any]] = {}                          # Laufzeit je Regel: mine (selbst angemacht), last (Bewegung)
        self._away_since: float | None = None
        self._watch: dict[str, list[str]] = {}
        now = time.time()
        self.burn.resume({e: self._lc(e) for e in self._lamps() if self._is_on(e)}, now)
        self.burn.prune(now)
        for c in ("get", "set", "act"):
            self.core.cmd(c, getattr(self, f"_c_{c}"))
        self.core.on_unload(self.hass.bus.async_listen("state_changed", self._on_state))
        self.core.every(60, self._tick)
        self.core.every(20, self._rules_tick)
        self.core.on_unload(self.hass.bus.async_listen(f"{DOMAIN}_sicherheit", self._on_sf))
        self._rewatch()
        self.core.provide("licht", self)
        gr = self.hass.data.get(DOMAIN, {}).get("grundriss")  # ab Modul 0 Build 2: Zuordnung zieht in die Raumliste von Modul 0
        if gr is not None and hasattr(gr, "merge_pmap") and self.pmap:
            gr.merge_pmap(self.pmap)
        self._save(1)
        self._push()

    async def async_unload(self) -> None:
        self.burn.tick(time.time())
        self._save(0)

    async def async_remove(self, keep: bool) -> None:
        self.hass.data.get(DOMAIN, {}).pop("licht", None)

    def _save(self, delay: float = 10) -> None:
        self.store.async_delay_save(lambda: {"burn": self.burn.dump(), "prefs": self.prefs, "pmap": self.pmap, "lamps": self.lamps, "mode": self.mode, "ignored": self.ignored, "legacy": self.legacy, "started": self.started,
                                             "rules": self.rules, "rlog": self.rlog, "rpause": self.rpause, "rsun": self.rsun}, delay)

    # ---- Lampen
    def _lamps(self) -> list[str]:
        """Lampen des Moduls: mit „Meine Lampen“ nur die hinzugefügten (auch Gruppen), sonst alle einzelnen Lampen (ohne Lichtgruppen)."""
        st = self.hass.states
        if self.mode == "mine":
            return sorted(x["e"] for x in self.lamps if st.get(x["e"]) is not None)
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
        if eid in self._watch or eid.startswith("person."):
            self.hass.async_create_task(self._rules_eval(eid))
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
            for rs in self._rs.values():   # von Hand oder anders ausgeschaltet: die Regel kümmert sich nicht mehr darum
                rs.get("mine", set()).discard(eid)
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
                "week": self.burn.week(t), "groups": self._groups(), "prefs": self.prefs, "pmap": self.pmap, "lamps": self.lamps, "mode": self.mode, "ignored": self.ignored, "errs": self.errs, "legacy": bool(self.legacy),
                "areas": self.core.areas(), "floors": self._floors(), "since": self.started,
                "rules": self.rules, "rlog": self.rlog, "rpause": self.rpause if self._paused() else 0, "rinfo": self._rinfo()}

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
        if "lamps" in data:   # Meine Lampen (Build 6): ganze Liste
            self.lamps = L.clean_lamps(data.get("lamps"))
        if data.get("mode") in L.MODES:
            self.mode = data["mode"]
        if "ignored" in data:
            self.ignored = L.clean_ignored(data.get("ignored"))
        if "rules" in data:   # Regeln (Build 8): ganze Liste
            self.rules = L.clean_rules(data.get("rules"))
            ids = {r["id"] for r in self.rules}
            self._rs = {k: v for k, v in self._rs.items() if k in ids}
            self.rsun = {k: v for k, v in self.rsun.items() if k in ids}
            self._rewatch()
        pm = data.get("pmap")  # Grundriss-Zuordnung: {Plan-ID: Bereich | "-" | ""}; leer = wieder automatisch
        if isinstance(pm, dict):
            merged = {**self.pmap, **{k: v for k, v in pm.items() if isinstance(v, str) and v}}
            for k, v in pm.items():
                if v in ("", None):
                    merged.pop(k, None)
            self.pmap = L.clean_pmap(merged)
            gr = self.hass.data.get(DOMAIN, {}).get("grundriss")
            if gr is not None and hasattr(gr, "set_rooms"):
                gr.set_rooms({k: v for k, v in pm.items() if isinstance(k, str)})
        self._save(2)
        return self._state()

    async def _c_act(self, data: dict[str, Any], admin: bool) -> dict[str, Any]:
        """Schalten über die Seite. a = "switch": ids (Lampen), on (bool), optional brightness_pct.
        Passt eine Lichtgruppe genau, wird über sie geschaltet (alle Lampen gleichzeitig, weniger Funkverkehr)."""
        a = data.get("a")
        if a == "test":   # kurz blinken lassen, damit man weiß, welche Lampe welche ist
            e = data.get("e")
            if not (isinstance(e, str) and _ENT.match(e) and self.hass.states.get(e) is not None):
                raise AddonError("Lampe nicht gefunden")
            await self._test(e)
            return {"ok": True}
        if a in ("rule_test", "rules_pause"):
            if not admin:
                raise AddonError("Nur Administratoren können das ändern")
            if a == "rule_test":
                await self._rule_test(str(data.get("id") or ""))
            else:
                mins = int(data.get("min") or 0)
                self.rpause = time.time() + max(0, min(7 * 1440, mins)) * 60 if mins > 0 else 0
                self._save(1)
            return self._state()
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
            msg = str(err)[:160]
            for e in ids:   # Fehler an der Lampe merken, bis es wieder klappt
                self.errs[e] = {"t": dt_util.now().isoformat(), "msg": msg, "svc": svc}
            raise AddonError(f"Integration meldet: {msg}"[:200]) from err
        for e in ids:
            self.errs.pop(e, None)
        return {"via": target}

    async def _test(self, e: str) -> None:
        """Blinken: mit flash, wenn die Lampe es kann, sonst zweimal kurz umschalten und den alten Zustand wiederherstellen."""
        import asyncio
        st = self.hass.states.get(e)
        was_on = bool(st and st.state == ON)
        try:
            await self.hass.services.async_call("light", "turn_on", {"entity_id": e, "flash": "short"}, blocking=True)
            return
        except Exception:  # noqa: BLE001 - flash wird nicht überall unterstützt
            pass
        try:
            for _ in range(2):
                await self.hass.services.async_call("light", "turn_off" if was_on else "turn_on", {"entity_id": e}, blocking=True)
                await asyncio.sleep(0.6)
                await self.hass.services.async_call("light", "turn_on" if was_on else "turn_off", {"entity_id": e}, blocking=True)
                await asyncio.sleep(0.6)
            self.errs.pop(e, None)
        except Exception as err:  # noqa: BLE001
            self.errs[e] = {"t": dt_util.now().isoformat(), "msg": str(err)[:160], "svc": "test"}
            raise AddonError(f"Integration meldet: {str(err)[:160]}") from err

    # ---- Regeln (Build 8)
    def _rewatch(self) -> None:
        w: dict[str, list[str]] = {}
        for r in self.rules:
            for e in (r.get("sensors") or []) + ([r["lux"]] if r.get("lux") else []):
                w.setdefault(e, []).append(r["id"])
        self._watch = w

    def _rule_lamps(self, r: dict[str, Any]) -> list[str]:
        """Lampen einer Regel: ausgewählte, sonst alle Lampen im Raum, bei Alarm ohne Auswahl alle Lampen."""
        lamps = self._lamps()
        if r.get("lamps"):
            return [e for e in r["lamps"] if self.hass.states.get(e) is not None]
        if r.get("room"):
            return [e for e in lamps if self._area(e) == r["room"]]
        return lamps if r["t"] in ("alarm", "away") else []

    def _area(self, e: str) -> str:
        c = next((x for x in self.lamps if x["e"] == e), None) if self.mode == "mine" else None
        if c and c.get("room"):
            return c["room"]
        try:
            from homeassistant.helpers import device_registry as dr, entity_registry as er
            ent = er.async_get(self.hass).async_get(e)
            if ent is None:
                return ""
            if ent.area_id:
                return ent.area_id
            dev = dr.async_get(self.hass).async_get(ent.device_id) if ent.device_id else None
            return (dev.area_id if dev else "") or ""
        except Exception:  # noqa: BLE001
            return ""

    def _paused(self) -> bool:
        return self.rpause > time.time()

    def _log(self, r: dict[str, Any], txt: str) -> None:
        self.rlog = ([{"t": dt_util.now().isoformat(), "id": r["id"], "n": r.get("n") or "", "rt": r["t"], "txt": txt[:140]}] + self.rlog)[: L.LOG_MAX]
        self._save(5)

    async def _rule_switch(self, r: dict[str, Any], ids: list[str], on: bool, bri: int | None = None) -> bool:
        if not ids:
            return False
        sd: dict[str, Any] = {"entity_id": L.plan_switch(ids, self._groups())}
        if on and bri:
            sd["brightness_pct"] = bri
        try:
            await self.hass.services.async_call("light", "turn_on" if on else "turn_off", sd, blocking=True)
        except Exception as err:  # noqa: BLE001
            for e in ids:
                self.errs[e] = {"t": dt_util.now().isoformat(), "msg": str(err)[:160], "svc": "regel"}
            self._log(r, f"Schalten hat nicht geklappt: {str(err)[:90]}")
            return False
        return True

    def _names(self, ids: list[str]) -> str:
        st = self.hass.states
        nm = [next((x["n"] for x in self.lamps if x["e"] == e and x["n"]), None) or (st.get(e).attributes.get("friendly_name") if st.get(e) else None) or e for e in ids]
        return ", ".join(nm[:3]) + (f" und {len(nm) - 3} weitere" if len(nm) > 3 else "")

    def _sensor_on(self, e: str) -> bool:
        s = self.hass.states.get(e)
        return bool(s and s.state == ON)

    def _lux(self, e: str) -> float | None:
        s = self.hass.states.get(e) if e else None
        try:
            return float(s.state) if s else None
        except (TypeError, ValueError):
            return None

    async def _rules_eval(self, eid: str | None = None) -> None:
        if self._paused():
            return
        now, now_dt = time.time(), dt_util.now()
        sun = self.hass.states.get("sun.sun")
        for r in self.rules:
            if not r["on"]:
                continue
            rs = self._rs.setdefault(r["id"], {"mine": set(), "last": None})
            if r["t"] == "motion" and (eid is None or eid in (r.get("sensors") or []) or eid == r.get("lux")):
                motion = any(self._sensor_on(e) for e in r.get("sensors") or [])
                if motion:
                    rs["last"] = now
                lamps = self._rule_lamps(r)
                st = {e: self._is_on(e) for e in lamps}
                dark = L.is_dark(sun.state if sun else None, self._lux(r.get("lux") or ""), r.get("lux_max", 30))
                step = L.motion_step({**r, "lamps": lamps}, now, now_dt, motion, rs["last"], dark, st, rs["mine"])
                if step and step[0] == "on" and await self._rule_switch(r, step[1], True, step[2]):
                    rs["mine"].update(step[1])
                    self._log(r, f"Bewegung → an: {self._names(step[1])}" + (f" ({step[2]} %)" if step[2] else ""))
                elif step and step[0] == "off" and await self._rule_switch(r, step[1], False):
                    rs["mine"].clear()
                    self._log(r, f"Keine Bewegung seit {r['off_min']} Min. → aus: {self._names(step[1])}")
                elif step and step[0] == "forget":
                    rs["mine"].clear()
            elif r["t"] == "away" and (eid is None or eid.startswith("person.")):
                persons = [s for s in self.hass.states.async_all("person")]
                home = sum(1 for s in persons if s.state == "home")
                if home or not persons:
                    self._away_since, rs["fired"] = None, False
                elif self._away_since is None:
                    self._away_since = now
                if L.away_step(r, home, len(persons), self._away_since, now, bool(rs.get("fired"))):
                    rs["fired"] = True
                    alloff = {x["e"]: x["alloff"] for x in self.lamps}
                    ids = [e for e in self._rule_lamps(r) if self._is_on(e) and alloff.get(e, True)]
                    if ids and await self._rule_switch(r, ids, False):
                        self._log(r, f"Alle weg → aus: {self._names(ids)}")
                    elif not ids:
                        self._log(r, "Alle weg – es war schon alles aus")
            elif r["t"] == "sun" and eid is None:
                done = self.rsun.setdefault(r["id"], {})
                ss, sr = self._sun_events(now_dt)
                act = L.sun_step(r, now_dt, ss, sr, done)
                lamps = self._rule_lamps(r)
                if act == "on":
                    done["on"] = now_dt.date().isoformat()
                    ids = [e for e in lamps if not self._is_on(e)]
                    if ids and await self._rule_switch(r, ids, True):
                        rs["mine"].update(ids)
                        self._log(r, f"Sonnenuntergang → an: {self._names(ids)}")
                    self._save(2)
                elif act == "off":
                    done["off"] = done.get("on", "")
                    ids = [e for e in lamps if self._is_on(e) and (e in rs["mine"] or not rs["mine"])]
                    if ids and await self._rule_switch(r, ids, False):
                        self._log(r, f"Feierabend fürs Licht → aus: {self._names(ids)}")
                    rs["mine"].clear()
                    self._save(2)

    def _sun_events(self, now_dt: Any) -> tuple[Any, Any]:
        try:
            from datetime import timedelta
            from homeassistant.helpers.sun import get_astral_event_date
            ss = get_astral_event_date(self.hass, "sunset", now_dt.date())
            sr = get_astral_event_date(self.hass, "sunrise", now_dt.date() + timedelta(days=1))
            return (dt_util.as_local(ss) if ss else None, dt_util.as_local(sr) if sr else None)
        except Exception:  # noqa: BLE001
            return (None, None)

    @callback
    def _rules_tick(self, _now: Any = None) -> None:
        if self.rules:
            self.hass.async_create_task(self._rules_eval(None))

    @callback
    def _on_sf(self, ev: Event) -> None:
        art = ev.data.get("art")
        if art in ("alarm", "ende") and not self._paused():
            self.hass.async_create_task(self._rules_alarm(art, ev.data))

    async def _rules_alarm(self, art: str, data: dict[str, Any]) -> None:
        for r in self.rules:
            if not r["on"] or r["t"] != "alarm":
                continue
            rs = self._rs.setdefault(r["id"], {"mine": set(), "last": None})
            if art == "alarm":
                ids = self._rule_lamps(r)   # alle auf volle Helligkeit; „wieder aus“ betrifft später nur die, die vorher aus waren
                was_off = [e for e in ids if not self._is_on(e)]
                if await self._rule_switch(r, ids, True, 100):
                    rs["mine"].update(was_off)
                    self._log(r, f"Alarm ({data.get('name') or 'Melder'}) → {len(ids)} Lampen auf 100 %")
            elif art == "ende" and r.get("off_end") and rs["mine"]:
                ids = [e for e in rs["mine"] if self._is_on(e)]
                if await self._rule_switch(r, ids, False):
                    self._log(r, f"Alarm vorbei → wieder aus: {len(ids)} Lampen")
                rs["mine"].clear()

    def _rinfo(self) -> dict[str, Any]:
        out = {}
        persons = self.hass.states.async_all("person")
        for r in self.rules:
            rs = self._rs.get(r["id"]) or {}
            lamps = self._rule_lamps(r)
            out[r["id"]] = {"lamps": lamps, "mine": sorted(rs.get("mine") or []), "last": rs.get("last"),
                            "warn": ("Keine Bewegungsmelder gewählt" if r["t"] == "motion" and not r.get("sensors") else
                                     "Keine Lampen" if not lamps else
                                     "Keine Personen in Home Assistant" if r["t"] == "away" and not persons else
                                     "Modul 11 ist aus" if r["t"] == "alarm" and self.hass.data.get(DOMAIN, {}).get("sicherheit") is None else "")}
        return out

    async def _rule_test(self, rid: str) -> None:
        r = next((x for x in self.rules if x["id"] == rid), None)
        if r is None:
            raise AddonError("Regel nicht gefunden")
        lamps = self._rule_lamps(r)
        if not lamps:
            raise AddonError("Die Regel hat keine Lampen")
        on = r["t"] != "away"
        ids = [e for e in lamps if self._is_on(e) != on]
        if ids and await self._rule_switch(r, ids, on, 100 if r["t"] == "alarm" else (r.get("bri") or None)):
            if on:
                self._rs.setdefault(r["id"], {"mine": set(), "last": time.time()})["mine"].update(ids)
                self._rs[r["id"]]["last"] = time.time()
            self._log(r, f"Test → {'an' if on else 'aus'}: {self._names(ids)}")

    def summary(self) -> dict[str, Any]:
        lamps = self._lamps()
        n = sum(1 for e in lamps if self._is_on(e))
        return {"info": f"{len(lamps)} Lampen", "tile": {"sub": f"{n} von {len(lamps)} an" if lamps else "Keine Lampen", "c": "wa" if n else ""}}
