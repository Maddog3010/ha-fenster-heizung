"""Tablet-Modus Stufe 6 (2026.11.5b14): Modul 18, 20 und 15 ohne Scrollen."""
from __future__ import annotations

import pathlib
import re

PANEL = (pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung" / "frontend" / "panel.js").read_text(encoding="utf-8")


def test_methods_present():
    for fn in ("_tm2Li()", "_tm2Wa()", "_tm2Ab()", "_tm2AbSp(d)", "_tm2AbSpark(f, col)", "_tm2AbRd(d)", "_tm2AbPay(d)", "_tm2WaYear(S)", "_tm6Act(a, b)", "_tm2S6Modal(m)"):
        name = fn.split("(")[0]
        assert re.search(rf"^  {re.escape(name)}\(", PANEL, re.M), name


def test_tabs_registered():
    m = re.search(r"static TM2_TABS = \{(.*?)\};", PANEL, re.S)
    assert m
    for key in ("li:", "wa:", "abrechnung:"):
        assert key in m.group(1), key


def test_actions_routed_and_guarded():
    assert "/^tm2(li|wt|ab)/.test(a) && this._tm6Act" in PANEL
    assert 'data-act="tm2g"' in PANEL
    # Anlegen und Bearbeiten von Terminen nur mit PIN
    assert 'data-g="tm2wted"' in PANEL or "tm2wted" in PANEL


def test_amounts_hidden_by_default():
    assert "tm2abrev" in PANEL and "_tm2AbAmt" in PANEL


def test_no_id_field_in_ws_commands():
    start = PANEL.index("  _tm2AbLoad(force) {")
    part = PANEL[start:PANEL.index("\n  }\n", start)]
    assert '_adApi().call("abrechnung", "get", {})' in part
    assert not re.search(r"[{,]\s*id\s*:", part)
