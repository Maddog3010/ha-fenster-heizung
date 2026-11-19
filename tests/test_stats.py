"""Tests für die Rechenfunktionen der Versions-Statistik (stats_logic.py) – ohne Home Assistant."""
from __future__ import annotations

import importlib.util
import pathlib
import sys

P = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung" / "stats_logic.py"
spec = importlib.util.spec_from_file_location("fh_stats_logic", P)
L = importlib.util.module_from_spec(spec)
sys.modules["fh_stats_logic"] = L
spec.loader.exec_module(L)

GOOD_ID = "7f3c1e9a-4b2d-4c5e-9a1f-2d8b6e0c3a41"


def test_channel():
    assert L.channel_of("2026.11.4") == "stable"
    assert L.channel_of("2026.11.3.1") == "stable"
    assert L.channel_of("2026.11.4b25") == "beta"
    assert L.channel_of("") == "stable"


def test_payload_has_exactly_five_fields():
    p = L.build_payload(GOOD_ID, "2026.11.4", ["en", "ww"])
    assert p == {"schema": 2, "id": GOOD_ID, "version": "2026.11.4", "channel": "stable", "modules": ["ww", "en"]}
    assert L.build_payload(GOOD_ID, "2026.11.4")["modules"] == []


def test_modules_only_known_keys():
    on = {"ww": True, "en": False, "gs": 1, "ev": True, "xmein": True, "wx": "ja", "ef": True, "evil": True}
    assert L.active_modules(on) == ["ww", "ev", "ef"]           # nur echtes True, nur bekannte Schlüssel, feste Reihenfolge
    assert L.active_modules(None) == [] and L.active_modules([1]) == []
    p = L.build_payload(GOOD_ID, "2026.11.4", ["ww", "xmein", "<b>", 7])
    assert p["modules"] == ["ww"]
    assert L.build_payload(GOOD_ID, "2026.11.4b3")["channel"] == "beta"


def test_payload_rejects_bad_input():
    assert L.build_payload("", "2026.11.4") is None
    assert L.build_payload("abc", "2026.11.4") is None
    assert L.build_payload(GOOD_ID.upper(), "2026.11.4") is None
    assert L.build_payload(GOOD_ID, "") is None
    assert L.build_payload(GOOD_ID, "3.0.7.7-dev") is None
    assert L.build_payload(GOOD_ID, "2026.11.4b") is None


def test_due():
    assert L.next_due(0, 0) == 0
    assert L.is_due(1000, 0, 0)
    t = 1_000_000.0
    assert not L.is_due(t + 3600, t, 0)
    assert L.is_due(t + 24 * 3600, t, 0)
    # Fehlversuch zählt mit: erst nach 23 h wieder
    assert not L.is_due(t + 3600, 0, t)
    assert L.is_due(t + 23 * 3600, 0, t)
    # später gelungener Versuch schiebt weiter
    assert not L.is_due(t + 24 * 3600, t, t + 20 * 3600)
