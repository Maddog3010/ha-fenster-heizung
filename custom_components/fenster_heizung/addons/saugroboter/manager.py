"""Modul 21 Saugroboter: Hintergrund-Logik des Addons.

Roboter sind alle vacuum-Entitäten. Was ein Roboter kann, wird aus seinem Gerät gelesen:
  * Räume:  Home-Assistant-Aktion vacuum.clean_area (ab HA 2026.3, Zuordnung in den Entitäts-Einstellungen)
            oder bei Roborock die Raum-Segmente aus roborock.get_maps (Zuordnung über den Namen)
  * Karte:  image-Entitäten am selben Gerät (Roborock, Dreame, Valetudo)
  * Akku, aktueller Raum, Fehler, Fläche, Zeit und Verschleißteile: Sensoren am selben Gerät
Jede Fahrt (auch aus der Hersteller-App) wird erkannt und den Räumen gutgeschrieben.
"""
from __future__ import annotations

import logging
import re
import time
from typing import Any

from homeassistant.core import Event, callback
from homeassistant.util import dt as dt_util

from custom_components.fenster_heizung.addon_api import AddonError, SWAddon

from . import logic as L

_LOGGER = logging.getLogger(__name__)

_ENT = re.compile(r"^[a-z_]+\.[a-z0-9_]+$")
SEG_TTL = 3600
try:  # ab Home Assistant 2026.3
    from homeassistant.components.vacuum import VacuumEntityFeature

    F_CLEAN_AREA = int(getattr(VacuumEntityFeature, "CLEAN_AREA", 0))
    F_LOCATE = int(VacuumEntityFeature.LOCATE)
    F_PAUSE = int(VacuumEntityFeature.PAUSE)
except Exception:  # noqa: BLE001
    F_CLEAN_AREA, F_LOCATE, F_PAUSE = 0, 512, 4


def default_cfg() -> dict[str, Any]:
    return {"robots": {}, "areas": {}, "notify": {"to": [], "stuck": True, "done": False}, "main": "auto"}


def clean_cfg(raw: Any) -> dict[str, Any]:
    d = default_cfg()
    r = raw if isinstance(raw, dict) else {}
    for ent, x in (r.get("robots") or {}).items():
        if not (isinstance(ent, str) and ent.startswith("vacuum.") and _ENT.match(ent) and isinstance(x, dict)):
            continue
        d["robots"][ent] = {
            "name": str(x.get("name") or "")[:24], "floor": str(x.get("floor") or "")[:24], "on": bool(x.get("on", True)),
            "areas": [str(a)[:64] for a in x.get("areas") or [] if isinstance(a, str)][:40],
        }
    for aid, x in (r.get("areas") or {}).items():
        if isinstance(aid, str) and isinstance(x, dict):
            try:
                days = min(30.0, max(0.5, float(x.get("days", L.DEF_DAYS))))
            except (TypeError, ValueError):
                days = L.DEF_DAYS
            d["areas"][aid[:64]] = {"days": days, "off": bool(x.get("off"))}
    n = r.get("notify") if isinstance(r.get("notify"), dict) else {}
    d["notify"] = {"to": [s for s in n.get("to") or [] if isinstance(s, str) and s.startswith("notify.") and _ENT.match(s)][:8],
                   "stuck": bool(n.get("stuck", True)), "done": bool(n.get("done", False))}
    d["main"] = r.get("main") if r.get("main") in ("auto", "tiles", "map") else "auto"
    return d


class Addon(SWAddon):
    async def async_setup(self) -> None:
        self.store = self.core.store(1)
        d = await self.store.async_load()
        d = d if isinstance(d, dict) else {}
        self.cfg = clean_cfg(d.get("cfg"))
        self.last: dict[str, float] = {k: float(v) for k, v in (d.get("last") or {}).items() if isinstance(v, (int, float))}
        self.runs: list[dict[str, Any]] = [r for r in d.get("runs") or [] if isinstance(r, dict)]
        self.open: dict[str, dict[str, Any]] = {k: v for k, v in (d.get("open") or {}).items() if isinstance(v, dict)}
        self.pending: dict[str, dict[str, Any]] = {}
        self._seg: dict[str, tuple[float, dict[str, str]]] = {}
        self._watch: list[str] = []
        self._last_map: dict[str, dict[str, list[str]]] = {}
        self._unw = None
        for c in ("get", "set", "act"):
            self.core.cmd(c, getattr(self, f"_c_{c}"))
        self._rewatch()
        self.core.every(300, self._tick)
        now = time.time()
        for ent in self._robots():  # läuft gerade eine Fahrt, die wir noch nicht kennen?
            st = self._st(ent)
            if st in L.ACTIVE and ent not in self.open:
                self.open[ent] = {"rob": ent, "t0": now, "areas": [], "visited": [], "src": "app"}
            elif st not in L.ACTIVE and ent in self.open:
                self._close(ent, now)

    async def async_unload(self) -> None:
        self._save(0)

    def _save(self, delay: float = 5) -> None:
        self.store.async_delay_save(lambda: {"cfg": self.cfg, "last": self.last, "runs": self.runs[-L.RUNS_KEEP:], "open": self.open}, delay)

    # ---- Roboter und Geräte
    def _robots(self) -> list[str]:
        ids = sorted(self.hass.states.async_entity_ids("vacuum"))
        return [e for e in ids if (self.cfg["robots"].get(e) or {}).get("on", True)]

    def _st(self, ent: str) -> str:
        s = self.hass.states.get(ent)
        return s.state if s else "unavailable"

    def _dev(self, ent: str) -> dict[str, list[Any]]:
        """Entitäten am Gerät des Roboters, nach Aufgabe sortiert."""
        out: dict[str, list[Any]] = {"bat": [], "room": [], "err": [], "map": [], "part": [], "m2": [], "time": []}
        for e in self.core.device_entities(ent):
            key = (e.translation_key or e.entity_id.split(".", 1)[1]).lower()
            dom = e.entity_id.split(".")[0]
            if dom == "image":
                out["map"].append(e.entity_id)
            elif dom != "sensor":
                continue
            elif (e.original_device_class or e.device_class) == "battery" or key.endswith("battery"):
                out["bat"].append(e.entity_id)
            elif "current_room" in key:
                out["room"].append(e.entity_id)
            elif key in ("vacuum_error", "error", "status_error") or key.endswith("_error") and "dock" not in key:
                out["err"].append(e.entity_id)
            elif L.part_of(key):
                out["part"].append((key, e.entity_id))
            elif key in ("cleaning_area", "last_clean_area", "current_clean_area"):
                out["m2"].append(e.entity_id)
            elif key in ("cleaning_time", "current_clean_time"):
                out["time"].append(e.entity_id)
        return out

    def _rewatch(self) -> None:
        ents = self._robots()
        extra = [x for e in ents for x in self._dev(e)["room"]]
        w = sorted(set(ents + extra))
        if w == self._watch:
            return
        if self._unw:
            self._unw()
        self._watch = w
        self._unw = self.core.track_state(w, self._on_change) if w else None

    def _opt_map(self, ent: str) -> dict[str, list[str]]:
        """Zuordnung Bereich → Segmente aus den Entitäts-Einstellungen (vacuum.clean_area, HA 2026.3)."""
        from homeassistant.helpers import entity_registry as er

        e = er.async_get(self.hass).async_get(ent)
        opt = (e.options or {}).get("vacuum") if e else None
        if not isinstance(opt, dict):
            return {}
        for k, v in opt.items():
            if "area" in k and isinstance(v, dict) and v:
                return {str(a): [str(s) for s in (segs if isinstance(segs, list) else [segs])] for a, segs in v.items()}
        return {}

    async def _segments(self, ent: str, force: bool = False) -> dict[str, str]:
        """Raum-Segmente {id: Name} (Roborock)."""
        c = self._seg.get(ent)
        if c and not force and time.time() - c[0] < SEG_TTL:
            return c[1]
        rooms: dict[str, str] = {}
        if self.core.device_info(ent).get("platform") == "roborock" and self.hass.services.has_service("roborock", "get_maps"):
            try:
                res = await self.hass.services.async_call("roborock", "get_maps", {"entity_id": ent}, blocking=True, return_response=True)
                maps = ((res or {}).get(ent) or {}).get("maps") or []
                for m in maps[:1]:  # die aktive Karte steht zuerst
                    for sid, nm in (m.get("rooms") or {}).items():
                        rooms[str(sid)] = str(nm)
            except Exception as e:  # noqa: BLE001
                _LOGGER.debug("roborock.get_maps für %s: %s", ent, e)
        self._seg[ent] = (time.time(), rooms)
        return rooms

    async def _area_map(self, ent: str) -> tuple[str, dict[str, list[str]]]:
        """('area', {area: [seg]}) für clean_area, ('seg', {area: [seg]}) für Roborock-Segmente, ('', {}) wenn nichts geht."""
        s = self.hass.states.get(ent)
        feat = int((s.attributes if s else {}).get("supported_features") or 0)
        om = self._opt_map(ent)
        if F_CLEAN_AREA and feat & F_CLEAN_AREA and om and self.hass.services.has_service("vacuum", "clean_area"):
            return "area", om
        segs = await self._segments(ent)
        if segs:
            m = L.match_areas(segs, self.core.areas())
            out: dict[str, list[str]] = {}
            for seg, aid in m.items():
                out.setdefault(aid, []).append(seg)
            if om:  # Zuordnung aus HA gewinnt, falls vorhanden
                out.update(om)
            return "seg", out
        return "", {}

    def _robot_areas(self, ent: str, amap: dict[str, list[str]]) -> list[str]:
        own = (self.cfg["robots"].get(ent) or {}).get("areas") or []
        return own or list(amap)

    # ---- Fahrten
    @callback
    def _on_change(self, ev: Event) -> None:
        ent = ev.data.get("entity_id", "")
        new = ev.data.get("new_state")
        old = ev.data.get("old_state")
        now = time.time()
        if ent.startswith("vacuum."):
            ns, os_ = (new.state if new else "unavailable"), (old.state if old else "")
            if ns in L.ACTIVE and ent not in self.open:
                p = self.pending.pop(ent, None)
                fresh = p and now - p["ts"] < L.PENDING_S
                self.open[ent] = {"rob": ent, "t0": now, "areas": p["areas"] if fresh else [], "visited": [], "src": "sw" if fresh else "app"}
                self._visit(ent)
                self._save()
            elif ns == "error" and ent in self.open and not self.open[ent].get("err"):
                self.open[ent]["err"] = self._err_txt(ent) or "Fehler"
                self._save()
                if self.cfg["notify"]["stuck"] and self.cfg["notify"]["to"]:
                    self.hass.async_create_task(self.core.notify("Saugroboter braucht Hilfe", f"{self._name(ent)}: {self.open[ent]['err']}", self.cfg["notify"]["to"]))
            elif ns in ("docked", "idle") and ent in self.open:
                r = self._close(ent, now)
                if r and self.cfg["notify"]["done"] and self.cfg["notify"]["to"] and not r.get("err"):
                    names = ", ".join(self._aname(a) for a in r.get("credit") or []) or "Reinigung"
                    self.hass.async_create_task(self.core.notify("Saugroboter fertig", f"{self._name(ent)}: {names} gereinigt", self.cfg["notify"]["to"]))
            if os_ == "" or ns != os_:
                self._rewatch()
            return
        # aktueller Raum hat sich geändert
        rob = next((r for r in self.open if ent in self._dev(r)["room"]), None)
        if rob:
            self._visit(rob)

    def _visit(self, rob: str) -> None:
        """Aktuellen Raum des Roboters als besucht merken (nur während einer Fahrt, nur wenn er wirklich saugt)."""
        run = self.open.get(rob)
        if not run or self._st(rob) != "cleaning":
            return
        for e in self._dev(rob)["room"]:
            s = self.hass.states.get(e)
            if s and s.state not in ("unknown", "unavailable", ""):
                aid = L.match_areas({"x": s.state}, self.core.areas()).get("x")
                if aid and aid not in run["visited"]:
                    run["visited"].append(aid)
                    self._save()

    def _close(self, ent: str, now: float) -> dict[str, Any] | None:
        r = self.open.pop(ent, None)
        if not r:
            return None
        r["t1"] = now
        if now - r["t0"] < 60:  # kurzes Antippen ist keine Fahrt
            self._save()
            return None
        dv = self._dev(ent)
        r["m2"] = self._num(dv["m2"][0]) if dv["m2"] else None
        if not r.get("areas") and r.get("src") == "app" and not r.get("visited"):
            r["areas"] = self._robot_areas(ent, self._last_map.get(ent, {}))
            r["full"] = True
        r["credit"] = L.credit(r)
        for a in r["credit"]:
            self.last[a] = now
        self.runs = L.prune_runs(self.runs + [r], now)
        self._save()
        return r

    async def _tick(self, _now: Any = None) -> None:
        self._rewatch()
        now = time.time()
        for ent in list(self.open):
            if self._st(ent) not in L.ACTIVE and self._st(ent) != "error":
                self._close(ent, now)
            elif now - self.open[ent]["t0"] > 6 * 3600:  # hängt fest oder Zustand kam nie zurück
                self._close(ent, now)

    # ---- Werte
    def _num(self, ent: str) -> float | None:
        s = self.hass.states.get(ent)
        try:
            return float(s.state) if s else None
        except (TypeError, ValueError):
            return None

    def _name(self, ent: str) -> str:
        n = (self.cfg["robots"].get(ent) or {}).get("name")
        s = self.hass.states.get(ent)
        return n or (s.attributes.get("friendly_name") if s else "") or ent

    def _aname(self, aid: str) -> str:
        return next((a["name"] for a in self.core.areas() if a["id"] == aid), aid)

    def _err_txt(self, ent: str) -> str:
        for e in self._dev(ent)["err"]:
            s = self.hass.states.get(e)
            if s and s.state not in ("none", "ok", "unknown", "unavailable", "", "no_error"):
                return s.state.replace("_", " ")
        s = self.hass.states.get(ent)
        return str((s.attributes if s else {}).get("error") or "")

    async def _robot(self, ent: str) -> dict[str, Any]:
        s = self.hass.states.get(ent)
        a = s.attributes if s else {}
        st = s.state if s else "unavailable"
        dv = self._dev(ent)
        bat = a.get("battery_level")
        if bat is None and dv["bat"]:
            bat = self._num(dv["bat"][0])
        room = ""
        for e in dv["room"]:
            rs = self.hass.states.get(e)
            if rs and rs.state not in ("unknown", "unavailable"):
                room = rs.state
        kind, amap = await self._area_map(ent)
        self._last_map[ent] = amap
        parts = []
        for key, pe in dv["part"]:
            ps = self.hass.states.get(pe)
            if ps:
                c = L.consumable(key, ps.state, ps.attributes.get("unit_of_measurement", ""))
                if c:
                    c["ent"] = pe
                    parts.append(c)
        parts.sort(key=lambda x: x["o"])
        maps = []
        for me in dv["map"]:
            ms = self.hass.states.get(me)
            if ms and ms.attributes.get("entity_picture"):
                maps.append({"ent": me, "name": ms.attributes.get("friendly_name", me), "pic": ms.attributes["entity_picture"], "ts": ms.state})
        feat = int(a.get("supported_features") or 0)
        run = self.open.get(ent)
        areas = self._robot_areas(ent, amap)
        prog = None
        if run and run.get("areas"):
            prog = round(100 * len([x for x in run["visited"] if x in run["areas"]]) / max(1, len(run["areas"])))
        info = self.core.device_info(ent)
        return {
            "ent": ent, "name": self._name(ent), "state": st, "st_txt": L.STATE_TXT.get(st, st), "battery": bat,
            "room": L.match_areas({"x": room}, self.core.areas()).get("x", "") if room else "", "room_txt": room,
            "err": self._err_txt(ent) if st == "error" else "", "fan": a.get("fan_speed") or "", "floor": (self.cfg["robots"].get(ent) or {}).get("floor", ""),
            "m2": self._num(dv["m2"][0]) if dv["m2"] else None, "min": self._num(dv["time"][0]) if dv["time"] else None,
            "maps": maps, "parts": parts, "areas": areas, "amap": kind, "mapped": list(amap), "segs": await self._segments(ent) if kind == "seg" else {},
            "caps": {"rooms": bool(kind), "locate": bool(feat & F_LOCATE), "pause": bool(feat & F_PAUSE), "map": bool(maps)},
            "run": run, "prog": prog, "maker": info.get("maker", ""), "model": info.get("model", ""), "platform": info.get("platform", ""),
        }

    async def snapshot(self) -> dict[str, Any]:
        now = time.time()
        robots = [await self._robot(e) for e in self._robots()]
        all_areas = self.core.areas()
        served: dict[str, list[str]] = {}
        for r in robots:
            for aid in r["areas"]:
                served.setdefault(aid, []).append(r["ent"])
        areas = []
        for ar_ in all_areas:
            if ar_["id"] not in served:
                continue
            c = self.cfg["areas"].get(ar_["id"]) or {}
            if c.get("off"):
                continue
            days = float(c.get("days", L.DEF_DAYS))
            ds = L.due_state(self.last.get(ar_["id"]), days, now)
            live = next((r["ent"] for r in robots if r["state"] == "cleaning" and r["room"] == ar_["id"]), "")
            areas.append({**ar_, "days": days, "last": self.last.get(ar_["id"]), **ds, "robs": served[ar_["id"]], "live": live})
        off = dt_util.now().utcoffset()
        return {
            "cfg": self.cfg, "robots": robots, "areas": areas, "all_areas": all_areas, "now": now,
            "week": L.week(self.runs + list(self.open.values()), now, off.total_seconds() if off else 0),
            "stats": L.stats(self.runs, now), "last_runs": self.runs[-8:][::-1],
            "all_vac": sorted(self.hass.states.async_entity_ids("vacuum")),
        }

    def summary(self) -> dict[str, Any]:
        """Für Start, Tablet und Einstellungen (ohne Dienst-Aufrufe)."""
        now = time.time()
        hints, live = [], []
        for ent in self._robots():
            st = self._st(ent)
            if st == "error":
                hints.append({"i": "alert", "t": f"{self._name(ent)} braucht Hilfe", "s": self._err_txt(ent) or "Fehler am Saugroboter", "c": "bad"})
            elif st == "cleaning":
                live.append(ent)
        due = []
        served = {a for e in self._robots() for a in (self.cfg["robots"].get(e) or {}).get("areas") or self._last_map_areas(e)}
        for aid in served:
            c = self.cfg["areas"].get(aid) or {}
            if c.get("off"):
                continue
            if L.due_state(self.last.get(aid), float(c.get("days", L.DEF_DAYS)), now)["st"] in ("due", "over"):
                due.append(aid)
        if live:
            r = self.open.get(live[0]) or {}
            hints.append({"i": "robot", "t": f"{self._name(live[0])} reinigt", "s": ", ".join(self._aname(a) for a in r.get("areas") or []) or "ganze Etage", "c": ""})
        if due:
            hints.append({"i": "robot", "t": f"{len(due)} {'Raum' if len(due) == 1 else 'Räume'} fällig", "s": ", ".join(self._aname(a) for a in due[:3]), "c": "wa"})
        n = len(self._robots())
        tile = {"sub": "reinigt" if live else hints[0]["t"] if hints and hints[0]["c"] == "bad" else f"{len(due)} fällig" if due else (f"{n} Roboter" if n else "Kein Roboter"),
                "c": "bad" if any(h["c"] == "bad" for h in hints) else "wa" if due else "" if n else "mut"}
        return {"tile": tile, "hints": hints, "info": f"{n} {'Roboter' if n == 1 else 'Roboter'}" if n else "noch kein Roboter"}

    def messwerk(self) -> list[dict[str, Any]]:
        """Sensoren für das Messwerk (ohne Dienst-Aufrufe)."""
        out: list[dict[str, Any]] = []
        for ent in self._robots():
            nm = self._name(ent)
            out.append({"id": ent, "name": f"Saugroboter · {nm}", "eid": ent, "why": "Status, Start und Raumreinigung", "tab": "rob"})
            dv = self._dev(ent)
            for e in dv["bat"][:1]:
                out.append({"id": f"{ent}.bat", "name": f"Akku · {nm}", "eid": e, "why": "Akku in der Roboter-Karte", "unit": "pct", "tab": "rob"})
            for e in dv["room"][:1]:
                out.append({"id": f"{ent}.room", "name": f"Aktueller Raum · {nm}", "eid": e, "why": "Fahrten den Räumen zuordnen", "tab": "rob"})
            for e in dv["err"][:1]:
                out.append({"id": f"{ent}.err", "name": f"Fehler · {nm}", "eid": e, "why": "Meldung, wenn er Hilfe braucht", "tab": "msg"})
            for key, e in dv["part"]:
                p = L.part_of(key)
                out.append({"id": f"{ent}.{key}", "name": f"{p[1] if p else key} · {nm}", "eid": e, "why": "Wartung der Verschleißteile", "tab": "rob"})
            for e in dv["map"][:2]:
                out.append({"id": f"{ent}.{e}", "name": f"Karte · {nm}", "eid": e, "why": "Karte auf der Seite", "tab": "view"})
        return out

    def _last_map_areas(self, ent: str) -> list[str]:
        return list(self._last_map.get(ent, {}))

    # ---- Befehle der Seite
    async def _c_get(self, data: dict[str, Any], admin: bool) -> dict[str, Any]:
        if data.get("refresh"):
            self._seg.clear()
        return await self.snapshot()

    async def _c_set(self, data: dict[str, Any], admin: bool) -> dict[str, Any]:
        if not admin:
            raise AddonError("Nur für Administratoren")
        raw = data.get("cfg") if isinstance(data.get("cfg"), dict) else {}
        self.cfg = clean_cfg({**self.cfg, **raw})
        self._save()
        self._rewatch()
        return await self.snapshot()

    async def _c_act(self, data: dict[str, Any], admin: bool) -> dict[str, Any]:
        a, ent = str(data.get("a") or ""), str(data.get("rob") or "")
        if ent not in self.hass.states.async_entity_ids("vacuum"):
            raise AddonError("Roboter nicht gefunden")
        svc = {"start": "start", "pause": "pause", "dock": "return_to_base", "stop": "stop", "locate": "locate"}.get(a)
        if svc:
            await self.hass.services.async_call("vacuum", svc, {"entity_id": ent}, blocking=True)
            if a == "start":
                self.pending.pop(ent, None)
        elif a == "clean":
            areas = [x for x in data.get("areas") or [] if isinstance(x, str)][:30]
            if not areas:
                raise AddonError("Kein Raum gewählt")
            kind, amap = await self._area_map(ent)
            miss = [x for x in areas if x not in amap]
            if not kind:
                raise AddonError("Dieser Roboter kann keine einzelnen Räume reinigen")
            if miss:
                raise AddonError(f"Für {', '.join(self._aname(x) for x in miss)} ist kein Raum des Roboters zugeordnet")
            if kind == "area":
                await self.hass.services.async_call("vacuum", "clean_area", {"entity_id": ent, "cleaning_area_id": areas}, blocking=True)
            else:
                segs = [int(s) if str(s).isdigit() else s for x in areas for s in amap[x]]
                await self.hass.services.async_call("vacuum", "send_command", {"entity_id": ent, "command": "app_segment_clean", "params": [{"segments": segs, "repeat": 1}]}, blocking=True)
            self.pending[ent] = {"areas": areas, "ts": time.time()}
            if ent in self.open and not self.open[ent].get("areas"):
                self.open[ent]["areas"] = areas
        else:
            raise AddonError("Unbekannter Befehl")
        return await self.snapshot()
