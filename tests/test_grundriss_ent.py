"""Modul 0 Build 9: Raum-Sensoren (gr_ent.compute) ohne Home Assistant."""
from __future__ import annotations

import importlib.util
import pathlib
import sys
import types

ROOT = pathlib.Path(__file__).resolve().parent.parent / "custom_components" / "fenster_heizung"


def _mod():
    """gr_ent laden; die Home-Assistant-Importe oben werden durch leere Ersatz-Module bedient."""
    for name in ("homeassistant", "homeassistant.core", "homeassistant.helpers", "homeassistant.helpers.dispatcher"):
        sys.modules.setdefault(name, types.ModuleType(name))
    core = sys.modules["homeassistant.core"]
    core.HomeAssistant = getattr(core, "HomeAssistant", object)
    core.callback = getattr(core, "callback", lambda f: f)
    dp = sys.modules["homeassistant.helpers.dispatcher"]
    dp.async_dispatcher_connect = getattr(dp, "async_dispatcher_connect", lambda *a: None)
    dp.async_dispatcher_send = getattr(dp, "async_dispatcher_send", lambda *a: None)
    pkg = sys.modules.setdefault("fhx", types.ModuleType("fhx"))
    pkg.__path__ = [str(ROOT)]
    const = types.ModuleType("fhx.const")
    const.DOMAIN = "fenster_heizung"
    sys.modules["fhx.const"] = const
    spec = importlib.util.spec_from_file_location("fhx.gr_ent", ROOT / "gr_ent.py")
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


G = _mod()

PLAN = {"scale": 40, "items": [
    {"id": "r1", "t": "r", "fl": "eg", "n": "Küche", "x": 0, "y": 0, "w": 200, "h": 160},
    {"id": "r2", "t": "r", "fl": "eg", "n": "Wohnzimmer", "x": 0, "y": 0, "w": 400, "h": 200, "pts": [[0, 0], [400, 0], [400, 200], [0, 200]]},
    {"id": "r3", "t": "r", "fl": "eg", "n": "Terrasse", "x": 0, "y": 0, "w": 200, "h": 200},
    {"id": "r4", "t": "r", "fl": "eg", "n": "Flur", "x": 0, "y": 0, "w": 80, "h": 80, "ds": 1},
    {"id": "r5", "t": "r", "fl": "eg", "n": "", "x": 0, "y": 0, "w": 80, "h": 80},
    {"id": "r6", "t": "r", "fl": "og", "n": "Bad", "x": 0, "y": 0, "w": 80, "h": 120}]}
AREAS = {"kueche": "Küche", "wohnen": "Wohnzimmer", "bad": "Badezimmer"}
EA = {"sensor.t1": "kueche", "sensor.t2": "kueche", "sensor.h": "kueche", "binary_sensor.fk": "kueche", "binary_sensor.bw": "kueche", "light.a": "kueche", "light.b": "kueche", "light.w": "wohnen", "binary_sensor.bad_bw": "bad"}
ST = {"sensor.t1": ("21.0", {"device_class": "temperature"}), "sensor.t2": ("22.4", {"device_class": "temperature"}), "sensor.h": ("55", {"device_class": "humidity"}),
      "binary_sensor.fk": ("on", {"device_class": "window"}), "binary_sensor.bw": ("off", {"device_class": "motion"}), "light.a": ("on", {}), "light.b": ("off", {}),
      "light.w": ("off", {}), "binary_sensor.bad_bw": ("on", {"device_class": "occupancy"})}


def test_raum_werte():
    out = G.compute(PLAN, {"r6": "bad"}, AREAS, EA, ST)
    R = out["rows"]
    assert R["r1:flaeche"]["value"] == 20.0 and R["r1:temperatur"]["value"] == 21.7 and R["r1:lampen_an"]["value"] == 1 and R["r1:lampen_an"]["attrs"]["lampen"] == 2
    assert R["r1:fenster_offen"]["value"] is True and R["r1:belegt"]["value"] is False and R["r1:flaeche"]["area"] == "kueche"
    assert R["r2:flaeche"]["value"] == 50.0 and R["r2:flaeche"]["area"] == "wohnen"
    assert R["r6:belegt"]["value"] is True and R["r6:temperatur"]["value"] is None   # Raumliste: Bad → Bereich „Badezimmer“
    assert "r4:flaeche" not in R and "r5:flaeche" not in R   # gestrichelt oder ohne Namen: keine Sensoren
    assert R["haus:wohnflaeche"]["value"] == 20.0 + 50.0 + 6.0   # Terrasse zählt nicht zur Wohnfläche
    assert R["r3:lampen_an"]["value"] is None and R["r3:fenster_offen"]["value"] is None   # ohne Bereich: nicht verfügbar
    assert set(out["watch"]) == {"sensor.t1", "sensor.t2", "sensor.h", "binary_sensor.fk", "binary_sensor.bw", "light.a", "light.b", "light.w", "binary_sensor.bad_bw"}


def test_b8_feuchte_fensterflaeche_ereignis():
    plan = {**PLAN, "items": PLAN["items"] + [
        {"id": "f1", "t": "f", "fl": "eg", "x": 90, "y": 0, "w": 20, "h": 4, "b": 100, "hh": 130},       # in der Küche: 1,30 m²
        {"id": "f2", "t": "f", "fl": "eg", "x": 150, "y": 0, "w": 20, "h": 4},                           # Küche, Standard 0,9 × 1,2 = 1,08 m²
        {"id": "f3", "t": "f", "fl": "og", "x": 10, "y": 10, "w": 20, "h": 4, "b": 200, "hh": 100}]}    # andere Etage: Bad, 2 m²
    R = G.compute(plan, {"r6": "bad"}, AREAS, EA, ST)["rows"]
    assert R["r1:luftfeuchte"]["value"] == 55.0 and R["r6:luftfeuchte"]["value"] is None
    assert R["r1:fensterflaeche"]["value"] == 2.38 and R["r1:fensterflaeche"]["attrs"]["fenster"] == 2
    assert R["r6:fensterflaeche"]["value"] == 2.0
    assert R["r1:zuletzt_belegt"]["value"] is None and R["r1:zuletzt_belegt"]["dc"] == "timestamp"
    old = G.compute(plan, {"r6": "bad"}, AREAS, EA, ST)
    st2 = {**ST, "binary_sensor.bw": ("on", {"device_class": "motion"}), "binary_sensor.fk": ("off", {"device_class": "window"})}
    new = G.compute(plan, {"r6": "bad"}, AREAS, EA, st2)
    ch = G.raum_changes(old, new)
    assert {(c["raum"], c["was"], c["alt"], c["neu"]) for c in ch} == {("Küche", "belegt", False, True), ("Küche", "fenster_offen", True, False)}
    assert G.raum_changes(None, new) == [] and G.raum_changes(old, old) == []


def test_wohnflaeche_mit_dachschraege():
    plan = {"scale": 40, "items": [{"id": "a", "t": "r", "fl": "dg", "n": "Kind", "x": 0, "y": 0, "w": 160, "h": 200, "hh": 250, "dn": 35, "sd": "n", "kn": 100}]}
    R = G.compute(plan, {}, {}, {}, {})["rows"]
    assert R["a:flaeche"]["value"] == 20.0 and R["haus:wohnflaeche"]["value"] == 17.2   # Grundfläche 20 m², Wohnfläche 17,15 m² (gerundet)


def test_ids_und_bereich():
    out = G.compute(PLAN, {"r1": "-"}, AREAS, EA, ST)
    assert out["rows"]["r1:temperatur"]["value"] is None and out["rows"]["r1:flaeche"]["area"] == ""   # „-“ = bewusst kein Bereich
    r = out["rows"]["r2:belegt"]
    assert G.entity_id_for("binary_sensor", "r2:belegt", r) == "binary_sensor.strom_waerme_raum_wohnzimmer_belegt"
    assert G.entity_id_for("sensor", "haus:wohnflaeche", out["rows"]["haus:wohnflaeche"]) == "sensor.strom_waerme_haus_wohnflaeche"
    assert G.slug("Gäste-WC") == "gaeste_wc" and G.slug("") == "raum"
    p2 = {"scale": 40, "items": [{"id": "a", "t": "r", "n": "Bad", "w": 40, "h": 40}, {"id": "b", "t": "r", "n": "Bad", "w": 40, "h": 40}]}
    rows = G.compute(p2, {}, {}, {}, {})["rows"]
    assert rows["a:flaeche"]["slug"] == "bad" and rows["b:flaeche"]["slug"] == "bad_2"
