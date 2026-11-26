"""Akku-Hinweise auf der Startseite: Speicher ausnehmen und einzelne Akkus abschalten (layout.start.batoff)."""
from __future__ import annotations

import ast
import json
import pathlib
import shutil
import subprocess

import pytest

ROOT = pathlib.Path(__file__).resolve().parents[1]
PART = ROOT / "frontend-src" / "parts" / "12c-start.js"
API = ROOT / "custom_components" / "fenster_heizung" / "api.py"
NODE = shutil.which("node")

HARNESS = r"""
const fs = require("fs");
const src = fs.readFileSync(process.argv[1], "utf8"), arg = JSON.parse(process.argv[2]);
const a = src.indexOf("  _hzBatSkip() {"), b = src.indexOf("  _hzHints() {");
const c = src.indexOf("    let nb = 0;"), d = src.indexOf("try { const sp = this._spnS()", c);
const C = eval(`(class { ${src.slice(a, b)} _akku(H, st, out) { ${src.slice(c, d)} return out; } })`);
globalThis.num = (v) => String(v); globalThis.esc = (v) => v;
const states = {};
for (const [e, v] of Object.entries(arg.states)) states[e] = { state: v, attributes: { device_class: "battery", friendly_name: e }, last_changed: new Date().toISOString() };
const o = new C();
o._hass = { states, entities: arg.entities || {} };
o._haus = { soc: arg.haus || "" };
o._pv = () => ({ soc_sensor: arg.pv || "" });
o._mdState = () => ({ on: { ev: false } });
o._evState = () => ({ ent: { soc: arg.car || "" } });
o._wb = () => ({ vehicles: (arg.vehicles || []).map((soc) => ({ ent: { soc } })) });
o._hzCfg = () => ({ batoff: arg.off || [] });
o._hzNew = () => true;
o._hzLaterMap = () => Object.fromEntries((arg.later || []).map((e) => [`bat:${e}`, Date.now() + 60000]));
console.log(JSON.stringify(o._akku(o._hass, states, []).map((h) => h.bat)));
"""


def _hints(**arg):
    if not NODE:
        pytest.skip("node fehlt")
    r = subprocess.run([NODE, "-e", HARNESS, str(PART), json.dumps(arg)], capture_output=True, text=True, timeout=30, check=True)
    return json.loads(r.stdout)


SIM = {f"sensor.sim_{k}": "10" for k in "abc"}


def test_battery_sim_wird_nicht_gemeldet_und_verdraengt_nichts():
    ent = {e: {"platform": "battery_sim"} for e in SIM}
    assert _hints(states={**SIM, "sensor.melder": "3"}, entities=ent) == ["sensor.melder"]


def test_eingetragene_ladestaende_werden_nicht_gemeldet():
    st = {"sensor.speicher": "5", "sensor.haus": "5", "sensor.auto": "5", "sensor.auto2": "5", "binary_sensor.melder": "on"}
    got = _hints(states=st, pv="sensor.speicher", haus="sensor.haus", car="sensor.auto", vehicles=["sensor.auto2", ""])
    assert got == ["binary_sensor.melder"]


def test_nie_melden_und_grenze_von_15_prozent():
    st = {"sensor.a": "10", "sensor.b": "15", "sensor.c": "16"}
    assert _hints(states=st) == ["sensor.a", "sensor.b"]
    assert _hints(states=st, off=["sensor.a"]) == ["sensor.b"]


def test_hoechstens_drei_und_spaeter_zaehlt_nicht_mit():
    st = {f"sensor.m{i}": "5" for i in range(6)}
    assert _hints(states=st) == ["sensor.m0", "sensor.m1", "sensor.m2"]
    assert _hints(states=st, later=["sensor.m0", "sensor.m1"]) == [f"sensor.m{i}" for i in range(5)]


def test_server_behaelt_abgeschaltete_akkus():
    ns: dict = {"re": __import__("re"), "Any": object}
    nodes = [n for f in (API.with_name("const.py"), API) for n in ast.parse(f.read_text(encoding="utf-8")).body]  # erst die Konstanten
    for node in nodes:
        wanted = isinstance(node, ast.Assign) or (isinstance(node, ast.FunctionDef) and node.name in ("clean_layout", "clean_mess", "_clean_look"))
        if not wanted:
            continue
        mod = ast.Module(body=[node], type_ignores=[])
        code = compile(mod, str(API), "exec", flags=annotations.compiler_flag)
        try:
            exec(code, ns)  # noqa: S102 - nur Konstanten und reine Prüffunktionen aus dem eigenen Code
        except Exception:  # noqa: BLE001
            pass  # Konstanten, die Home Assistant brauchen
    off = ["sensor.a", "sensor.a", "binary_sensor.b", "light.c", "sensor.Ä", 7, {"x": 1}]
    assert ns["clean_layout"]({"start": {"batoff": off}})["start"]["batoff"] == ["sensor.a", "binary_sensor.b"]
    assert ns["clean_layout"]({"start": {"batoff": []}})["start"]["batoff"] == []
