"""Modul 0 Build 9: Räume werden zu Home-Assistant-Daten.

Je Raum im Grundriss (mit Namen, ohne gestrichelte Flächen) entstehen auf Wunsch (Modul 0 → Einstellungen → „Raum-Sensoren“):
  sensor.strom_waerme_raum_<name>_flaeche        Fläche in m² (aus dem Plan)
  sensor.strom_waerme_raum_<name>_temperatur     Mittel der Temperatursensoren im Bereich
  sensor.strom_waerme_raum_<name>_lampen_an      Lampen an (Attribut: von wie vielen)
  binary_sensor.strom_waerme_raum_<name>_fenster_offen   ein Fenster-/Türkontakt im Bereich offen
  binary_sensor.strom_waerme_raum_<name>_belegt          Bewegung oder Präsenz im Bereich
und einmal sensor.strom_waerme_haus_wohnflaeche.
Der Bereich kommt aus der Raumliste von Modul 0 (sonst über den Namen). Werte werden zentral berechnet (compute) und
bei Änderungen an Plan, Bereichen oder beobachteten Entitäten neu verteilt.
"""
from __future__ import annotations

import re
from datetime import timedelta
from typing import Any, Callable

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect, async_dispatcher_send

from .const import DOMAIN

SIGNAL = "fenster_heizung_raum"
PRE = "strom_waerme"
DEVICE = {"identifiers": {(DOMAIN, "grundriss")}, "name": "Strom & Wärme · Haus & Grundriss", "manufacturer": "Strom & Wärme", "model": "Modul 0", "entry_type": "service"}
WIN_DC = ("window", "door", "opening", "garage_door")
OCC_DC = ("motion", "occupancy", "presence")
OUT_RE = re.compile(r"terrasse|balkon|garten|außen|aussen|hof|carport|einfahrt", re.I)
SENS = ("flaeche", "temperatur", "lampen_an", "luftfeuchte", "fensterflaeche", "zuletzt_belegt")
EVENT = "strom_waerme_raum_geaendert"   # v0.17 B8: feuert, wenn sich bei einem Raum Fenster, Belegung oder Lampen ändern
EVENT_KINDS = ("fenster_offen", "belegt", "lampen_an")
BINS = ("fenster_offen", "belegt")
LABEL = {"flaeche": "Fläche", "temperatur": "Temperatur", "lampen_an": "Lampen an", "fenster_offen": "Fenster offen", "belegt": "belegt", "luftfeuchte": "Luftfeuchte", "fensterflaeche": "Fensterfläche", "zuletzt_belegt": "zuletzt belegt"}


def _norm(s: Any) -> str:
    return re.sub(r"zimmer|raum|[^a-zäöüß0-9]", "", str(s or "").lower())


def slug(s: Any) -> str:
    t = str(s or "").lower().replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    return re.sub(r"[^a-z0-9]+", "_", t).strip("_")[:40] or "raum"


def poly_area(r: dict[str, Any]) -> float:
    pts = r.get("pts")
    if isinstance(pts, list) and len(pts) >= 3:
        return abs(sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts)))) / 2
    return float(r.get("w") or 0) * float(r.get("h") or 0)


def _in_room(r: dict[str, Any], x: float, y: float) -> bool:
    pts = r.get("pts")
    if isinstance(pts, list) and len(pts) >= 3:
        ins = False
        for i, a in enumerate(pts):
            b = pts[(i + 1) % len(pts)]
            if (a[1] > y) != (b[1] > y) and x < (b[0] - a[0]) * (y - a[1]) / ((b[1] - a[1]) or 1e-9) + a[0]:
                ins = not ins
        return ins
    return r.get("x", 0) <= x <= r.get("x", 0) + r.get("w", 0) and r.get("y", 0) <= y <= r.get("y", 0) + r.get("h", 0)


def wohn_area(r: dict[str, Any], sc: float) -> float:
    """Wohnfläche in m² (v0.16 F1): mit Dachschräge nach Wohnflächenverordnung (unter 1 m 0 %, 1–2 m 50 %, ab 2 m 100 %), sonst Grundfläche."""
    gf = poly_area(r) / (sc * sc)
    if not (r.get("dn") and r.get("sd") and r.get("hh")):
        return gf
    import math
    ln = float(r.get("h" if r["sd"] in ("n", "s") else "w") or 0) / sc * 100
    tan, n, wf = math.tan(math.radians(r["dn"])), 200, 0.0
    for i in range(n):
        h = min(r["hh"], (r.get("kn") or 0) + (i + 0.5) / n * ln * tan)
        wf += (0 if h < 100 else 0.5 if h < 200 else 1.0) / n
    return gf * wf


def raum_changes(prev: dict[str, Any] | None, new: dict[str, Any] | None) -> list[dict[str, Any]]:
    """v0.17 B8: Was hat sich zwischen zwei Berechnungen bei Fenster, Belegung und Lampen geändert? Beim ersten Mal (ohne Vorgänger) nichts."""
    out: list[dict[str, Any]] = []
    if not prev or not new:
        return out
    for k, r in new["rows"].items():
        o = prev["rows"].get(k)
        if r.get("kind") in EVENT_KINDS and o is not None and o.get("value") is not None and r.get("value") is not None and o["value"] != r["value"]:
            out.append({"raum_id": r["room"], "raum": r["name"].rsplit(" ", 1 if r["kind"] == "belegt" else 2)[0], "bereich": r.get("area", ""), "was": r["kind"], "alt": o["value"], "neu": r["value"]})
    return out


def area_of(r: dict[str, Any], rooms: dict[str, str], areas: dict[str, str]) -> str:
    """Bereich eines Plan-Raums: aus der Raumliste, sonst über den Namen (wie die Oberfläche)."""
    v = rooms.get(r.get("id", ""))
    if v == "-":
        return ""
    if v:
        return v if v in areas else ""
    n = _norm(r.get("n"))
    if not n:
        return ""
    A = [(k, _norm(nm)) for k, nm in areas.items()]
    hit = next((k for k, m in A if m == n), None) or next((k for k, m in A if len(m) > 2 and (m in n or n in m)), None)
    return hit or ""


def compute(plan: dict[str, Any], rooms: dict[str, str], areas: dict[str, str], ent_area: dict[str, str], states: dict[str, tuple[str, dict]]) -> dict[str, Any]:
    """Alle Werte auf einmal. states: entity_id → (Zustand, Attribute)."""
    sc = float(plan.get("scale") or 40) or 40.0
    by_area: dict[str, list[str]] = {}
    for e, a in ent_area.items():
        by_area.setdefault(a, []).append(e)
    rows: dict[str, dict[str, Any]] = {}
    watch: set[str] = set()
    used: set[str] = set()
    total = 0.0
    wins_plan = [i for i in plan.get("items") or [] if i.get("t") == "f"]
    for r in plan.get("items") or []:
        if r.get("t") != "r" or r.get("ds") or not str(r.get("n") or "").strip():
            continue
        name = str(r["n"]).strip()
        m2 = round(poly_area(r) / (sc * sc), 1)
        if not OUT_RE.search(name):
            total += wohn_area(r, sc)
        s = slug(name)
        while s in used:
            s += "_2"
        used.add(s)
        aid = area_of(r, rooms, areas)
        ents = by_area.get(aid, []) if aid else []
        temps, wins, occ, lamps_on, lamps, hum = [], [], [], 0, 0, []
        for e in ents:
            st = states.get(e)
            if not st:
                continue
            val, attrs = st
            dom = e.split(".")[0]
            dc = attrs.get("device_class")
            if dom == "sensor" and dc == "temperature" and not e.startswith(f"sensor.{PRE}_raum_"):
                try:
                    temps.append(float(val))
                    watch.add(e)
                except (TypeError, ValueError):
                    pass
            elif dom == "sensor" and dc == "humidity" and not e.startswith(f"sensor.{PRE}_raum_"):
                try:
                    hum.append(float(val))
                    watch.add(e)
                except (TypeError, ValueError):
                    pass
            elif dom == "binary_sensor" and dc in WIN_DC and not e.startswith(f"binary_sensor.{PRE}_"):
                watch.add(e)
                if val == "on":
                    wins.append(e)
            elif dom == "binary_sensor" and dc in OCC_DC and not e.startswith(f"binary_sensor.{PRE}_"):
                watch.add(e)
                if val == "on":
                    occ.append(e)
            elif dom == "light":
                watch.add(e)
                lamps += 1
                lamps_on += 1 if val == "on" else 0
        base = {"room": r["id"], "slug": s, "area": aid, "floor": r.get("fl", "")}
        rows[f"{r['id']}:flaeche"] = {**base, "kind": "flaeche", "name": f"{name} Fläche", "value": m2, "unit": "m²", "icon": "mdi:floor-plan", "sc": "measurement"}
        rows[f"{r['id']}:temperatur"] = {**base, "kind": "temperatur", "name": f"{name} Temperatur", "value": round(sum(temps) / len(temps), 1) if temps else None, "unit": "°C", "dc": "temperature", "sc": "measurement", "attrs": {"sensoren": len(temps)}}
        rows[f"{r['id']}:luftfeuchte"] = {**base, "kind": "luftfeuchte", "name": f"{name} Luftfeuchte", "value": round(sum(hum) / len(hum), 1) if hum else None, "unit": "%", "dc": "humidity", "sc": "measurement", "attrs": {"sensoren": len(hum)}}
        fa = [w for w in wins_plan if w.get("fl") == r.get("fl") and _in_room(r, float(w.get("x", 0)) + float(w.get("w", 0)) / 2, float(w.get("y", 0)) + float(w.get("h", 0)) / 2)]
        rows[f"{r['id']}:fensterflaeche"] = {**base, "kind": "fensterflaeche", "name": f"{name} Fensterfläche", "value": round(sum(float(w.get("b") or 90) * float(w.get("hh") or 120) for w in fa) / 10000, 2), "unit": "m²", "icon": "mdi:window-closed-variant", "attrs": {"fenster": len(fa)}}
        rows[f"{r['id']}:zuletzt_belegt"] = {**base, "kind": "zuletzt_belegt", "name": f"{name} zuletzt belegt", "value": None, "dc": "timestamp", "attrs": {}}
        rows[f"{r['id']}:lampen_an"] = {**base, "kind": "lampen_an", "name": f"{name} Lampen an", "value": lamps_on if aid else None, "icon": "mdi:lightbulb-group", "sc": "measurement", "attrs": {"lampen": lamps}}
        rows[f"{r['id']}:fenster_offen"] = {**base, "kind": "fenster_offen", "name": f"{name} Fenster offen", "value": bool(wins) if aid else None, "dc": "window", "attrs": {"offen": wins}}
        rows[f"{r['id']}:belegt"] = {**base, "kind": "belegt", "name": f"{name} belegt", "value": bool(occ) if aid else None, "dc": "occupancy", "attrs": {"durch": occ}}
    rows["haus:wohnflaeche"] = {"room": "", "slug": "haus", "kind": "wohnflaeche", "name": "Haus Wohnfläche", "value": round(total, 1), "unit": "m²", "icon": "mdi:home-floor-0", "sc": "measurement"}
    return {"rows": rows, "watch": sorted(watch)}


def entity_id_for(platform: str, key: str, row: dict[str, Any]) -> str:
    if key == "haus:wohnflaeche":
        return f"sensor.{PRE}_haus_wohnflaeche"
    return f"{platform}.{PRE}_raum_{row['slug']}_{row['kind']}"


# ---------------------------------------------------------------- Home Assistant
def _snapshot(hass: HomeAssistant) -> dict[str, Any] | None:
    gm = hass.data.get(DOMAIN, {}).get("grundriss")
    if gm is None or gm.meta.get("ent") != "1":
        return None
    from homeassistant.helpers import area_registry as ar, device_registry as dr, entity_registry as er
    areas = {a.id: a.name for a in ar.async_get(hass).async_list_areas()}
    devs = dr.async_get(hass)
    ent_area: dict[str, str] = {}
    for e in er.async_get(hass).entities.values():
        a = e.area_id or ((devs.async_get(e.device_id).area_id if e.device_id and devs.async_get(e.device_id) else None))
        if a:
            ent_area[e.entity_id] = a
    states = {s.entity_id: (s.state, dict(s.attributes)) for s in hass.states.async_all(["sensor", "binary_sensor", "light"]) if s.entity_id in ent_area}
    return compute(gm.plan, gm.rooms, areas, ent_area, states)


def register(hass: HomeAssistant, platform: str, add: Callable[[list], None], make: Callable[[str], Any], on_unload: Callable[[Callable], None]) -> None:
    """Plattform anmelden (sensor oder binary_sensor). Neue Räume werden nachgelegt, entfernte werden „nicht verfügbar“."""
    from homeassistant.const import EVENT_STATE_CHANGED
    from homeassistant.helpers.event import async_call_later, async_track_time_interval

    store = hass.data.setdefault(DOMAIN, {})
    have: set[str] = set()
    kinds = ("flaeche", "temperatur", "lampen_an", "wohnflaeche", "luftfeuchte", "fensterflaeche", "zuletzt_belegt") if platform == "sensor" else BINS
    st: dict[str, Any] = {"watch": set(), "later": None, "gm": None}

    @callback
    def _sync(*_a) -> None:
        snap = _snapshot(hass)
        if snap:   # v0.17 B8: „zuletzt belegt“ merken (im Speicher, nach einem Neustart leer bis zur nächsten Belegung) und Änderungen als Ereignis melden
            from datetime import datetime, timezone
            last = store.setdefault("raum_last_occ", {})
            for k, r in snap["rows"].items():
                if r.get("kind") == "belegt" and r.get("value"):
                    last[r["room"]] = datetime.now(timezone.utc)
            for r in snap["rows"].values():
                if r.get("kind") == "zuletzt_belegt":
                    r["value"] = last.get(r["room"])
            for c in raum_changes(store.get("raum_vals"), snap):
                hass.bus.async_fire(EVENT, c)
        store["raum_vals"] = snap
        st["watch"] = set(snap["watch"]) if snap else set()
        if snap:
            new = [k for k, r in snap["rows"].items() if r["kind"] in kinds and k not in have]
            if new:
                have.update(new)
                add([make(k, entity_id_for(platform, k, snap["rows"][k])) for k in new])
        gm = hass.data.get(DOMAIN, {}).get("grundriss")
        if gm is not None and st["gm"] is None:
            st["gm"] = gm.listen(_soon)
        async_dispatcher_send(hass, SIGNAL)

    @callback
    def _soon(*_a) -> None:
        if st["later"] is None:
            @callback   # 2026.11.4.3b2: ohne @callback lief _go in einem Hilfs-Thread → async_dispatcher_send aus fremdem Thread (RuntimeError)
            def _go(_now) -> None:
                st["later"] = None
                _sync()
            st["later"] = async_call_later(hass, 2, _go)

    @callback
    def _changed(ev) -> None:
        if ev.data.get("entity_id") in st["watch"]:
            _soon()

    store.setdefault("raum_sync", []).append(_soon)
    unsubs = [hass.bus.async_listen(EVENT_STATE_CHANGED, _changed), async_track_time_interval(hass, _sync, timedelta(minutes=5)),
              hass.bus.async_listen("area_registry_updated", _soon), hass.bus.async_listen("entity_registry_updated", _soon)]

    def _gone() -> None:
        for u in unsubs:
            u()
        if st["gm"]:
            st["gm"]()
        if st["later"]:
            st["later"]()
        try:
            store.get("raum_sync", []).remove(_soon)
        except ValueError:
            pass

    on_unload(_gone)
    _sync()


def poke(hass: HomeAssistant) -> None:
    """Nach dem Ein-/Ausschalten in Modul 0: sofort neu berechnen."""
    for f in list(hass.data.get(DOMAIN, {}).get("raum_sync", [])):
        f()


class Base:
    _attr_has_entity_name = False
    _attr_should_poll = False

    def __init__(self, key: str, eid: str) -> None:
        self._key = key
        self._attr_unique_id = f"{DOMAIN}_raum_{key.replace(':', '_')}"
        self._attr_device_info = DEVICE
        self.entity_id = eid

    def _row(self) -> dict[str, Any] | None:
        v = self.hass.data.get(DOMAIN, {}).get("raum_vals") if self.hass else None
        return (v or {}).get("rows", {}).get(self._key) if v else None

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
    def extra_state_attributes(self) -> dict[str, Any]:
        r = self._row() or {}
        return {**(r.get("attrs") or {}), **({"bereich": r["area"]} if r.get("area") else {})}

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(async_dispatcher_connect(self.hass, SIGNAL, self._refresh))

    @callback
    def _refresh(self, *_a) -> None:
        self.async_write_ha_state()
