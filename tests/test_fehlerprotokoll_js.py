"""Fehlerprotokoll im Dashboard: der Umschlag um hass.callWS (2026.11.4.7).

Home Assistant baut das hass-Objekt bei jeder Zustandsänderung neu ({ ...hass }). Vorher wurde dabei jedes Mal ein weiterer
Umschlag um callWS gelegt – nach Stunden endete ein Befehl mit „RangeError: Maximum call stack size exceeded“.
"""
from __future__ import annotations

import pathlib
import shutil
import subprocess

import pytest

PART = pathlib.Path(__file__).resolve().parents[1] / "frontend-src" / "parts" / "12e6-fehlerprotokoll.js"
NODE = shutil.which("node")

HARNESS = r"""
const fs = require("fs");
const src = fs.readFileSync(process.argv[1], "utf8");
const C = eval(`(class { ${src} })`);
const o = new C(); o.constructor._errHook = true; let seen = 0; o._errCmd = () => { seen++; };
let h = { callWS: async (m) => { if (m.bad) throw { code: "unknown_error" }; return "ok:" + m.type; } };
for (let i = 0; i < 50000; i++) { o._errWrap(h); h = { ...h }; }
(async () => {
  const r = await h.callWS({ type: "x" });
  try { await h.callWS({ type: "fenster_heizung/y", bad: 1 }); } catch (_) { /* erwartet */ }
  console.log(JSON.stringify({ r, seen }));
})().catch((e) => { console.log(JSON.stringify({ err: String(e && e.message || e) })); });
"""


@pytest.mark.skipif(NODE is None, reason="node fehlt")
def test_callws_wrapped_once_even_when_hass_is_rebuilt():
    out = subprocess.run([NODE, "-e", HARNESS, str(PART)], capture_output=True, text=True, timeout=60, check=True).stdout.strip()
    assert out == '{"r":"ok:x","seen":1}', out
