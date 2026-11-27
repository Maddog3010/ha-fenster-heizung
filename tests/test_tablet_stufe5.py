"""Tablet-Modus Stufe 5 (2026.11.5b13): Modul 9, 11 und 17 ohne Scrollen."""
from __future__ import annotations

import pathlib
import re

PANEL = (pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung" / "frontend" / "panel.js").read_text(encoding="utf-8")


def test_tabs_and_pages_registered():
    m = re.search(r"static TM2_TABS = \{(.*?)\};", PANEL, re.S)
    assert m
    tabs = m.group(1)
    for key, labels in (("wx", ("Jetzt", "48 Stunden", "Karte")), ("sf", ("Übersicht", "Melder", "Grundriss")), ("mu", ("Abholung", "Kalender", "Haushalt"))):
        assert f"{key}: [" in tabs and all(f'"{l}"' for l in labels if f'"{l}"' in tabs)
    for fn in ("_tm2Wx()", "_tm2Sf()", "_tm2Mu()", "_tm2WxChart(box, w, h)", "_tm2WxMapDraw(box, w, h)", "_tm2RestWx()", "_tm2TabList(v)"):
        assert f"  {fn} {{" in PANEL, fn


def test_tablet_never_changes_without_pin():
    """Geräte schalten und Einstellungen laufen über tm2g (PIN), „Verstanden“ und „Steht draußen“ nicht."""
    part = PANEL[PANEL.index("Tablet-Modus · Stufe 5"):PANEL.index("  _tm2MuHome(S) {")]
    assert 'data-g="wxsclose"' in part and 'data-g="wxsvor"' in part
    assert 'data-act="wxsclose"' not in part and 'data-act="wxsvor"' not in part
    assert 'data-act="wxsack"' in part and 'data-act="muxdoneall"' in part


def test_hidden_tabs_and_visibility():
    assert 'if (v === "sf" && !this._tm2SfPlanOn()) return T.filter((t) => t[0] !== "pl");' in PANEL
    assert 'this._tm2Shows("sf")' in PANEL and 'this._tm2Shows("wx")' in PANEL
    assert 'const k = this._tm2RestWxOn() ? "wx" : this._tm2RestKind()' in PANEL
