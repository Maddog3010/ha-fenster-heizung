"""Fehlerprotokoll im Dashboard: der Umschlag um hass.callWS (2026.11.4.8).

Home Assistant baut das hass-Objekt bei jeder Zustandsänderung neu ({ ...hass }). Die Seite darf dieses Objekt nicht verändern,
sonst stapeln sich Umschläge und ein Befehl endet mit „RangeError: Maximum call stack size exceeded“.
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
const listeners = {}; globalThis.window = { innerWidth: 1500, addEventListener: (t, f) => (listeners[t] = f) };
const a = new C(); let seen = 0; C.prototype._errCmd = () => { seen++; };
const real = async (m) => { if (m.bad) throw { code: "unknown_error" }; return "ok:" + m.type; };
let h = { callWS: real, states: { x: 1 } };
for (let i = 0; i < 50000; i++) {
  if (i % 2) { const f = h.callWS; if (!f.__other) { const w = (m) => f(m); w.__other = true; h.callWS = w; } }   /* fremder Zusatz legt seinen Umschlag darum */
  const before = h.callWS; a._hass = a._errWrap(h); if (h.callWS !== before) throw new Error("hass verändert"); h = { ...h };
}
for (let i = 0; i < 50000; i++) a._hass = a._errWrap(a._hass);   /* dieselbe Kopie erneut hineingereicht */
const b = new C(); b._hass = b._errWrap(h);
const got = []; C.prototype._errJs = function (e, w) { got.push([this === b, w]); };
listeners.error({ filename: "/fenster_heizung_static/panel.js", error: new Error("x") });
(async () => {
  const r = await a._hass.callWS({ type: "x" });
  try { await a._hass.callWS({ type: "fenster_heizung/y", bad: 1 }); } catch (_) { /* erwartet */ }
  console.log(JSON.stringify({ r, seen, got, states: a._hass.states.x }));
})().catch((e) => { console.log(JSON.stringify({ err: String(e && e.message || e) })); });
"""


@pytest.mark.skipif(NODE is None, reason="node fehlt")
def test_hass_object_stays_untouched_and_no_wrapper_chain():
    out = subprocess.run([NODE, "-e", HARNESS, str(PART)], capture_output=True, text=True, timeout=60, check=True).stdout.strip()
    assert out == '{"r":"ok:x","seen":1,"got":[[true,"Fenster"]],"states":1}', out
