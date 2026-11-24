"""Sponsor Max · Extras: Entitäten für eigene Automationen (entstehen nur, solange das jeweilige Extra an ist).

Wohnklima-Zeugnis   sensor.sw_wohnklima_note_haus, sensor.sw_wohnklima_note_<raum>, binary_sensor.sw_schimmelrisiko_<raum>
Heizkosten je Raum  sensor.sw_heizkosten_haus_monat, sensor.sw_heizkosten_<raum>_heute / _monat, sensor.sw_heizkosten_fenster_offen_monat
Wand-Tablet-Extras  binary_sensor.sw_tablet_<name>_wach, sensor.sw_tablet_<name>_zustand, button.sw_tablet_<name>_wecken

Die Werte werden einmal je Änderung zentral berechnet (values) und an alle Entitäten verteilt.
Schaltet man ein Extra aus, entfernt mx_extras.sync() die Entitäten aus der Registrierung.
"""
from __future__ import annotations

import re
from typing import Any, Callable

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect, async_dispatcher_send

from .const import DOMAIN

SIGNAL_VALS = f"{DOMAIN}_mx_vals"
DEVICE = {"identifiers": {(DOMAIN, "sponsor_max_extras")}, "name": "Strom & Wärme · Sponsor-Max-Extras", "manufacturer": "Strom & Wärme",
          "model": "Wohnklima · Heizkosten · Wand-Tablet", "entry_type": "service"}


def slug(s: Any) -> str:
    t = str(s or "").lower().replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    return re.sub(r"[^a-z0-9]+", "_", t).strip("_")[:40] or "raum"


def values(hass: HomeAssistant) -> dict[str, dict[str, Any]]:
    """key -> {platform, extra, name, eid, state, attrs, unit, ...} für alle Entitäten, die es gerade geben soll."""
    mm = hass.data.get(DOMAIN, {}).get("mxx")
    out: dict[str, dict[str, Any]] = {}
    if mm is None:
        return out
    meta = mm._room_meta()  # noqa: SLF001
    if mm.on("wk"):
        z = mm.zeugnis_pair("week", done=True)
        cur = mm.zeugnis_pair("week")
        out["wk_haus"] = {"p": "sensor", "x": "wk", "n": "Wohnklima-Note Haus", "eid": "sensor.sw_wohnklima_note_haus", "v": z["note"], "icon": "mdi:school",
                          "a": {"wort": z["wort"], "trend": z.get("trend"), "zeitraum": z["label"], "von": z["from"], "bis": z["to"],
                                "laufende_woche": cur["note"], "faecher": {r["name"]: r["faecher"] for r in z["rooms"]}}}
        for r in z["rooms"]:
            s = slug(r["name"])
            out[f"wk_{r['id']}"] = {"p": "sensor", "x": "wk", "n": f"Wohnklima-Note {r['name']}", "eid": f"sensor.sw_wohnklima_note_{s}", "v": r["note"], "icon": "mdi:school-outline",
                                    "a": {"wort": r["wort"], "temperatur": r["faecher"]["temperatur"], "feuchte": r["faecher"]["feuchte"], "lueften": r["faecher"]["lueften"],
                                          "schimmel": r["faecher"]["schimmel"], "tipp": r["tipp"], "zeitraum": z["label"]}}
            out[f"wkr_{r['id']}"] = {"p": "binary_sensor", "x": "wk", "n": f"Schimmelrisiko {r['name']}", "eid": f"binary_sensor.sw_schimmelrisiko_{s}",
                                     "v": bool(mm.risk_now.get(r["id"])), "icon": "mdi:water-alert", "dc": "moisture"}
    if mm.on("hk"):
        mv, dv = mm.cost_view("month"), mm.cost_view("day")
        dmap = {r["id"]: r for r in dv["rooms"]}
        lr_m, lr_d = mv["from"], dv["from"]  # Beginn des Zeitraums (last_reset für die Statistik)
        out["hk_haus"] = {"p": "sensor", "x": "hk", "n": "Heizkosten Haus Monat", "eid": "sensor.sw_heizkosten_haus_monat", "v": mv["eur"], "eur": True, "lr": lr_m,
                          "a": {"gemessen": mv["meas"], "geschaetzt": mv["est"], "prognose": mv["prognose"], "zaehler": mv["meter"]}}
        out["hk_win"] = {"p": "sensor", "x": "hk", "n": "Heizkosten Fenster offen Monat", "eid": "sensor.sw_heizkosten_fenster_offen_monat", "v": mv["win"], "eur": True, "lr": lr_m,
                         "a": {r["name"]: r["win"] for r in mv["rooms"] if r["win"] > 0}}
        ids = {r["id"] for r in mv["rooms"]} | set(dmap) | {rid for rid, m in meta.items() if m["thermo"] or m["heater"]}
        for rid in ids:
            m = meta.get(rid)
            if m is None or not (m["thermo"] or m["heater"]):
                continue
            r = next((x for x in mv["rooms"] if x["id"] == rid), None) or {}
            s = slug(m["name"])
            attrs = {"methode": "gemessen" if r.get("meas", 0) > 0 and r.get("est", 0) == 0 else "geschätzt", "anteil": r.get("share"), "euro_pro_m2": r.get("eur_m2")}
            out[f"hk_{rid}_m"] = {"p": "sensor", "x": "hk", "n": f"Heizkosten {m['name']} Monat", "eid": f"sensor.sw_heizkosten_{s}_monat", "v": r.get("eur", 0.0), "eur": True, "lr": lr_m, "a": attrs}
            out[f"hk_{rid}_d"] = {"p": "sensor", "x": "hk", "n": f"Heizkosten {m['name']} heute", "eid": f"sensor.sw_heizkosten_{s}_heute", "v": (dmap.get(rid) or {}).get("eur", 0.0), "eur": True, "lr": lr_d,
                                  "a": {"methode": attrs["methode"]}}
    if mm.on("tb"):
        for t in mm.tablets():
            s = slug(t["name"])
            st = t["state"]
            out[f"tb_{t['id']}_w"] = {"p": "binary_sensor", "x": "tb", "n": f"Tablet {t['name']} wach", "eid": f"binary_sensor.sw_tablet_{s}_wach", "v": st in ("wach", "alarm"), "icon": "mdi:tablet"}
            out[f"tb_{t['id']}_z"] = {"p": "sensor", "x": "tb", "n": f"Tablet {t['name']} Zustand", "eid": f"sensor.sw_tablet_{s}_zustand", "v": st, "icon": "mdi:tablet-dashboard",
                                      "opts": ["wach", "ruhe", "nacht", "schlafen", "alarm", "aus"]}
            out[f"tb_{t['id']}_b"] = {"p": "button", "x": "tb", "n": f"Tablet {t['name']} wecken", "eid": f"button.sw_tablet_{s}_wecken", "tid": t["id"], "icon": "mdi:gesture-tap"}
    return out


def register(hass: HomeAssistant, platform: str, add: Callable[[list], None], make: Callable[[str, dict], Any], on_unload: Callable[[Callable], None]) -> None:
    store = hass.data.setdefault(DOMAIN, {})
    have: set[str] = set()

    @callback
    def _sync(*_a: Any) -> None:
        try:
            vals = values(hass)
        except Exception:  # noqa: BLE001
            return
        store["mx_vals"] = vals
        new = [k for k, v in vals.items() if v["p"] == platform and k not in have]
        if new:
            have.update(new)
            add([make(k, vals[k]) for k in new])
        removed = [k for k in have if k not in vals]
        for k in removed:
            have.discard(k)  # Registrierung räumt mx_extras.sync() auf; hier nur „nicht verfügbar“
        async_dispatcher_send(hass, SIGNAL_VALS)

    mm = store.get("mxx")
    unsubs = [async_dispatcher_connect(hass, f"{DOMAIN}_mx_update", _sync)]
    if mm is not None:
        unsubs.append(mm.add_entity_listener(_sync))

    def _gone() -> None:
        for u in unsubs:
            u()

    on_unload(_gone)
    _sync()


class MxBase:
    _attr_should_poll = False
    _attr_has_entity_name = False

    def __init__(self, key: str, v: dict[str, Any]) -> None:
        self._key = key
        self._attr_unique_id = f"{DOMAIN}_mx_{v['x']}_{key}"
        self._attr_name = v["n"]
        self.entity_id = v["eid"]
        self._attr_device_info = DEVICE
        if v.get("icon"):
            self._attr_icon = v["icon"]

    def _v(self) -> dict[str, Any] | None:
        return (self.hass.data.get(DOMAIN, {}).get("mx_vals") or {}).get(self._key) if self.hass else None

    @property
    def available(self) -> bool:
        return self._v() is not None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        v = self._v()
        return dict(v.get("a") or {}) if v else {}

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(async_dispatcher_connect(self.hass, SIGNAL_VALS, self._refresh))

    @callback
    def _refresh(self) -> None:
        self.async_write_ha_state()
