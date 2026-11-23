"""Messwerk: Namen im Hausfluss, Vorschläge aus Modul 19, Solar nachts – ohne Home Assistant."""
from __future__ import annotations

import importlib.util
import pathlib
import sys

BASE = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung"
spec = importlib.util.spec_from_file_location("fh_messwerk_logic", BASE / "messwerk_logic.py")
L = importlib.util.module_from_spec(spec)
sys.modules["fh_messwerk_logic"] = L
spec.loader.exec_module(L)

# Wie beim Nutzer: Akku mit einem Sensor für beide Richtungen, umgekehrt; SolarNet als Solar-Kachel
CFG = {
    "hub": {"on": True, "name": "Haus", "bottom": "sensor.haus_verbrauch", "chips": []},
    "nodes": {
        "left_3": {"on": True, "name": "Hyper 2000", "image": "hd:battery", "flow": "both", "power": "sensor.hyper_2000_bat_in_out", "invert": True,
                   "bottom": "sensor.hyper_2000_bat_in_out", "bottom_label": "", "top": "sensor.hyper_2000_soc", "top_label": "Ladestand"},
        "top_1": {"on": True, "name": "PV Dach", "image": "hd:pvRoof", "flow": "supply", "power": "sensor.solarnet_pv_leistung", "bottom": "sensor.solarnet_pv_leistung"},
        "right_2": {"on": False, "name": "Alt", "flow": "consume", "power": "sensor.alt_power"},
    },
}


def test_fluss_names_use_tile_and_field():
    items = {p: (e, n) for p, e, n, _w, _node in L.fluss_items(CFG)}
    assert items["nodes.top_1.power"] == ("sensor.solarnet_pv_leistung", "PV Dach · Leistung")
    assert items["nodes.top_1.bottom"][1] == "PV Dach · Wert unten"
    assert items["nodes.left_3.top"][1] == "Hyper 2000 · Ladestand"  # eigene Beschriftung gewinnt
    assert items["hub.bottom"][1] == "Haus · Wert unten"
    assert not any("right_2" in p for p in items)  # ausgeschaltete Kachel wird nicht geprüft
    assert all(not n.endswith(("Power", "Bottom")) for _e, n in items.values())


def test_battery_suggestion_with_sign():
    s = L.suggest(CFG, "bat")
    assert s["eid"] == "sensor.hyper_2000_bat_in_out" and s["bsign"] == "discharge"
    assert "Hyper 2000" in s["from"]
    c = {"nodes": {"left_3": {**CFG["nodes"]["left_3"], "invert": False}}}
    assert L.suggest(c, "bat")["bsign"] == "charge"
    assert L.suggest(CFG, "pv")["eid"] == "sensor.solarnet_pv_leistung"
    assert L.suggest(CFG, "grid") is None


def test_battery_suggestion_split_and_by_name():
    c = {"nodes": {"l": {"name": "Speicher", "flow": "split", "power_to_node": "sensor.akku_laden", "power_to_house": "sensor.akku_entladen"}}}
    s = L.suggest(c, "bat")
    assert s["mode"] == "two" and s["bchg"] == "sensor.akku_laden" and s["bdis"] == "sensor.akku_entladen"
    c = {"nodes": {"l": {"name": "Kachel", "image": "⚡", "flow": "both", "power": "sensor.zendure_bat_power"}}}
    assert L.suggest(c, "bat")["eid"] == "sensor.zendure_bat_power"
    c = {"nodes": {"l": {"name": "Netz", "image": "hd:grid", "flow": "both", "power": "sensor.smartmeter_w", "invert": True}}}
    assert L.suggest(c, "grid") == {"eid": "sensor.smartmeter_w", "from": "Modul 19 · Kachel „Netz“", "sign": "import"}


def test_bat_open_only_without_any_battery_sensor():
    assert L.bat_open({"ent": {"bat": ""}, "bmode": "one"})
    assert not L.bat_open({"ent": {"bat": "sensor.b"}})
    assert not L.bat_open({"ent": {"bchg": "sensor.c", "bdis": "sensor.d"}, "bmode": "two"})
    assert not L.bat_open({"ent": {}, "bmode": "two"})


def test_night_and_pv_detection():
    assert L.is_night("above_horizon", -2) is True  # Dämmerung: Wechselrichter schläft noch
    assert L.is_night("above_horizon", 30) is False
    assert L.is_night("below_horizon", None) is True
    assert L.is_night(None, None) is None
    assert L.pv_like("sensor.solarnet_pv_leistung")
    assert L.pv_like("sensor.x", "Fronius Wechselrichter AC")
    assert L.pv_like("sensor.dach", pv_ents={"sensor.dach"})
    assert L.pv_like("sensor.dach", node=CFG["nodes"]["top_1"])
    assert not L.pv_like("sensor.hyper_2000_bat_in_out", "Hyper 2000 Batterie")
    assert L.node_kind(CFG["nodes"]["left_3"]) == "bat"
