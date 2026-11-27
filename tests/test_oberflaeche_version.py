"""Version der Oberfläche (2026.11.5b12 / 2026.11.4.12).

Nach einem Update läuft eine offene Seite mit dem alten panel.js weiter. Die Seite kennt deshalb ihre eigene Version (FE_VER),
schickt sie mit jedem Fehlerbericht und bittet ums Neuladen, wenn die installierte Version eine andere ist.
"""
from __future__ import annotations

import json
import pathlib
import re
import shutil
import subprocess

import pytest

ROOT = pathlib.Path(__file__).resolve().parents[1]
CC = ROOT / "custom_components" / "fenster_heizung"
PART = ROOT / "frontend-src" / "parts" / "12e6a-oberflaeche-version.js"
NODE = shutil.which("node")


def test_fe_ver_matches_manifest():
    ver = json.loads((CC / "manifest.json").read_text(encoding="utf-8"))["version"]
    m = re.search(r'^const FE_VER = "([^"]*)";$', (CC / "frontend" / "panel.js").read_text(encoding="utf-8"), re.M)
    assert m and m.group(1) == ver


def test_report_sends_fe_and_backend_knows_it():
    js = (ROOT / "frontend-src" / "parts" / "12e6-fehlerprotokoll.js").read_text(encoding="utf-8")
    assert 'type: "fenster_heizung/err_report", dev: this._errDev(), fe: FE_VER' in js
    api = (CC / "api.py").read_text(encoding="utf-8")
    assert 'vol.Optional("fe", default="")' in api and "fhs.stale(msg[\"fe\"])" in api
    assert '"fenster_heizung/ver"' in api and "ws_err_report, ws_ver," in api


HARNESS = r"""
const fs = require("fs");
const src = fs.readFileSync(process.argv[1], "utf8");
globalThis.FE_VER = "2026.11.5b12";
const C = eval(`(class { ${src} })`);
const store = {}; let reloads = 0, timers = [];
globalThis.sessionStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); } };
globalThis.location = { reload: () => { reloads++; } };
globalThis.document = { visibilityState: "visible" };
globalThis.setTimeout = (f) => { timers.push(f); };
const run = () => { const t = timers; timers = []; t.forEach((f) => f()); };
const mk = (tm) => { const a = new C(); a._tmOn = () => tm; a.shadowRoot = { activeElement: null }; a._shown = 0; a._feShow = () => { a._shown++; }; return a; };
const out = {};
let a = mk(false); a._feChk("2026.11.5b12"); out.same = [a._shown, a._feNew || ""];
a._feChk("2026.11.5b13"); run(); out.phone = [a._shown, reloads];
a = mk(true); a._modal = { type: "x" }; a._feChk("2026.11.5b13"); run(); out.busy = reloads;
a._modal = null; run(); run(); out.tablet = reloads;
a = mk(true); a._feChk("2026.11.5b13"); run(); out.again = reloads;
console.log(JSON.stringify(out));
"""


@pytest.mark.skipif(not NODE, reason="node fehlt")
def test_reload_hint_and_tablet_reload_once():
    r = subprocess.run([NODE, "-e", HARNESS, str(PART)], capture_output=True, text=True, timeout=60)
    out = json.loads(r.stdout.strip().splitlines()[-1])
    assert out["same"] == [0, ""]           # gleiche Version: nichts
    assert out["phone"] == [1, 0]           # ohne Tablet-Modus nur der Hinweis
    assert out["busy"] == 0                 # offenes Fenster: warten
    assert out["tablet"] == 1               # dann einmal neu laden
    assert out["again"] == 1                # dieselbe Version nie zweimal
