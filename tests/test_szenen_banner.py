"""Tests für die Szenen-Banner (frontend-src/parts/12i2-szenen-banner.js) mit Node, falls vorhanden.

Ausführen: python3 -m pytest tests  oder  python3 tests/test_szenen_banner.py
Geprüft: Jedes neue Banner liefert ohne Sensor „–“ und einen Hinweis (keine erfundenen Werte), mit Werten die richtige
große Zahl, die Sonne steht auf dem Bogen an der richtigen Seite, und alle Bilder sind gültiges SVG/HTML ohne „undefined“/„NaN“.
"""
from __future__ import annotations

import json
import pathlib
import shutil
import subprocess

import pytest

ROOT = pathlib.Path(__file__).resolve().parents[1]
PART = ROOT / "frontend-src" / "parts" / "12i2-szenen-banner.js"
NODE = shutil.which("node")

HARNESS = r"""
const part = require("fs").readFileSync(process.argv[process.argv.length - 1], "utf8");
const num = (v, d = 0) => Number(v).toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const wfmt = (w) => (Math.abs(w) >= 1000 ? num(w / 1000, 1) + " kW" : num(w) + " W");
const ic = (n) => `<svg data-i="${n}"></svg>`;
const wwCol = (t) => (t == null ? "#64748b" : t < 40 ? "#38bdf8" : t < 55 ? "#fbbf24" : "#ef4444");
const WX = { sunny: ["sun", "Sonnig"], rainy: ["rain", "Regen"], snowy: ["snow", "Schnee"], cloudy: ["cloud", "Bewölkt"] };
const MOLD = [["gering", "green"], ["erhöht", "amber"], ["hoch", "red"]];
const MV = { lu: { v: "0.1", b: 2 } };
const X = eval("(class X {" + part + "})");
const mk = (o) => { const x = new X(); x._cfg = { layout: {} }; x._hass = { states: o.states || {} }; x._out = () => o.out || { t: null, rh: null, w: null };
  x._collect = () => o.rooms || []; x._airData = (r) => r.a || null; x._pvNow = () => (o.pv === undefined ? null : o.pv); x._price = () => o.price || 0;
  x._soc = () => (o.soc === undefined ? null : o.soc); x._pv = () => o.pvcfg || {}; return x; };
const R = {};
const empty = mk({});
for (const k of ["Lu", "Rb", "Wp", "Ga", "Pl", "Bt"]) R["empty" + k] = empty["_sb" + k + "Data"]();
R.lu = mk({ rooms: [{ name: "Bad", a: { rh: 74, td: 16.1, lvl: 2, open: 0 } }, { name: "Küche", a: { rh: 52, td: 10, lvl: 0, open: 1 } }] })._sbLuData();
R.luOk = mk({ rooms: [{ name: "Küche", a: { rh: 52, td: 10, lvl: 0, open: 0 } }] })._sbLuData();
R.rbE = mk({ states: { "sun.sun": { state: "above_horizon", attributes: { elevation: 20, azimuth: 100 } } }, out: { t: 12 } })._sbRbData();
R.rbW = mk({ states: { "sun.sun": { state: "above_horizon", attributes: { elevation: 20, azimuth: 260 } } }, out: { t: 12 } })._sbRbData();
R.rbN = mk({ states: { "sun.sun": { state: "below_horizon", attributes: { elevation: -10, azimuth: 330 } } }, out: { t: -2 } })._sbRbData();
R.wp = mk({ out: { t: 3.5, rh: 88 } })._sbWpData();
R.ga = mk({ out: { t: 12, rh: 90, w: "rainy" } })._sbGaData();
R.pl = mk({ out: { t: 22 }, pv: 2300, price: 18.4 })._sbPlData();
R.bt = mk({ soc: 24, pv: 0, pvcfg: { soc_sensor: "sensor.x", soc_min: 20 } })._sbBtData();
R.ww = mk({})._sbWw({ top: 58, mid: 50, bot: 34 }, { want: 55, pump: true, heat: true, pv: true });
R.wa = mk({})._sbWa({ tasks: [{ name: "Schornsteinfeger", st: "over", due: "2026-12-03", days: -1, every: 1, unit: "y", icon: "flame" }] });
console.log(JSON.stringify(R));
"""


def _run():
    out = subprocess.run([NODE, "-e", HARNESS, str(PART)], capture_output=True, text=True, timeout=30, check=True)
    return json.loads(out.stdout)


@pytest.mark.skipif(NODE is None, reason="Node nicht installiert")
def test_scene_banners():
    R = _run()
    for k in ("Lu", "Rb", "Wp", "Ga", "Pl", "Bt"):
        e = R["empty" + k]
        assert e["big"] == "–" and e["sub"], k  # ohne Sensor: Strich und Hinweis, nichts erfunden
    assert R["lu"]["big"] == "Bad 74" and R["lu"]["unit"] == "%" and any("zu feucht" in c for c in R["lu"]["chips"])
    assert R["luOk"]["big"] == "Luft gut"
    assert R["rbE"]["big"] == "Ost" and "Osten" in R["rbE"]["sub"] and R["rbW"]["big"] == "West" and R["rbN"]["big"] == "Nacht"
    assert any("Frost" in c for c in R["rbN"]["chips"])
    assert R["wp"]["big"] == "3,5" and any("Abtauen" in c for c in R["wp"]["chips"])
    assert R["ga"]["big"] == "Regen" and any("nicht gießen" in c for c in R["ga"]["chips"])
    assert R["pl"]["big"] == "22,0" and any("Pumpe" in c for c in R["pl"]["chips"])
    assert R["bt"]["big"] == "24" and any("Untergrenze" in c for c in R["bt"]["chips"])
    for k, v in R.items():
        html = v if isinstance(v, str) else v["scene"]
        assert "undefined" not in html and "NaN" not in html, k
    assert R["ww"].startswith("<svg") and "58 °C" in R["ww"] and "Schornsteinfeger" in R["wa"]


if __name__ == "__main__":
    test_scene_banners()
    print("ok test_scene_banners")
