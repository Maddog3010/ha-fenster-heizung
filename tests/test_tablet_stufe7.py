"""Tablet-Modus Stufe 7 (2026.11.5b15): Module in Entwicklung und Grundriss ohne Scrollen."""
from __future__ import annotations

import pathlib
import re

PANEL = (pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung" / "frontend" / "panel.js").read_text(encoding="utf-8")


def test_tabs_registered():
    m = re.search(r"static TM2_TABS = \{(.*?)\};", PANEL, re.S)
    assert m
    for key in ("lu:", "rb:", "wp:", "pl:", "bt:", "ga:", "gr:"):
        assert key in m.group(1), key


def test_methods_present():
    for name in ("_tm2Cs", "_tm2CsNow", "_tm2CsPre", "_tm2CsPlan", "_tm2CsImg", "_tm7Act", "_tm2Gr", "_tm2CsTiles"):
        assert re.search(rf"^  {name}\(", PANEL, re.M), name


def test_wiring():
    assert "/^tm2cs/.test(a) && this._tm7Act" in PANEL
    assert 'kind === "csimg"' in PANEL
    assert "this._tm2TabList(v).length < 2" in PANEL
