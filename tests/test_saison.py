"""Tests für das Weihnachts-Theme Build 1 (saison.py) ohne Home Assistant.

Ausführen: python3 -m pytest tests  oder  python3 tests/test_saison.py
Geprüft werden Adventssonntage über mehrere Jahre (auch 4. Advent = Heiligabend), Phasen an allen Grenzen,
Kerzen, Countdown, die Einstellung „Saison-Theme“, Speichern und Laden sowie die Simulation (nur Theme, Ablauf, Grenzen).
"""
from __future__ import annotations

import asyncio
import importlib.util
import pathlib
import sys
import types
from datetime import date, datetime

ROOT = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung"
NOW = [datetime(2026, 11, 30, 23, 59)]
CLOCK = [1_000_000.0]
_ALT: dict = {}


def _stub(name: str, **attrs) -> types.ModuleType:
    _ALT.setdefault(name, sys.modules.get(name))
    m = types.ModuleType(name)
    for k, v in attrs.items():
        setattr(m, k, v)
    sys.modules[name] = m
    return m


class _Store:
    def __init__(self, hass, v, key, **kw):
        self.key, self.data, self.saved = key, None, None

    async def async_load(self):
        return self.data

    def async_delay_save(self, fn, delay=0):
        self.saved = fn()


def _load():
    if "fh_saison" in sys.modules:
        return sys.modules["fh_saison"]
    for n in ("homeassistant", "homeassistant.util"):
        _stub(n)
    _stub("homeassistant.util.dt", now=lambda: NOW[0])
    sys.modules["homeassistant.util"].dt = sys.modules["homeassistant.util.dt"]
    _stub("fhpkg").__path__ = [str(ROOT)]
    _stub("fhpkg.backup", SafeStore=_Store)
    spec = importlib.util.spec_from_file_location("fhpkg.saison", ROOT / "saison.py")
    mod = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(mod)
    finally:
        for n, old in _ALT.items():
            if old is None:
                sys.modules.pop(n, None)
            else:
                sys.modules[n] = old
    mod.time = types.SimpleNamespace(time=lambda: CLOCK[0])
    sys.modules["fh_saison"] = mod
    return mod


S = _load()
run = asyncio.run


def _mgr(data=None):
    m = S.SaisonManager(None)
    m._store.data = data
    run(m.async_start())
    return m


def test_advent_sundays_many_years():
    assert S.advent_sonntage(2026) == [date(2026, 11, 29), date(2026, 12, 6), date(2026, 12, 13), date(2026, 12, 20)]
    assert S.advent_sonntage(2027)[3] == date(2027, 12, 19)
    assert S.advent_sonntage(2028) == [date(2028, 12, 3), date(2028, 12, 10), date(2028, 12, 17), date(2028, 12, 24)]  # 4. Advent = Heiligabend
    assert S.advent_sonntage(2033)[0] == date(2033, 11, 27)  # frühester 1. Advent
    for y in range(2026, 2060):
        a = S.advent_sonntage(y)
        assert all(d.weekday() == 6 for d in a) and date(y, 12, 18) <= a[3] <= date(y, 12, 24)


def test_phases_at_all_borders():
    p = S.phase
    assert p(date(2026, 11, 30)) == "aus" and p(date(2026, 12, 1)) == "advent" and p(date(2026, 12, 23)) == "advent"
    assert p(date(2026, 12, 24)) == "heiligabend" and p(date(2026, 12, 25)) == "feiertage" and p(date(2026, 12, 26)) == "feiertage"
    assert p(date(2026, 12, 27)) == "ausklang" and p(date(2026, 12, 28)) == "aus" and p(date(2027, 1, 1)) == "aus"


def test_candles_and_countdown():
    k, t = S.kerzen, S.tage_bis_heiligabend
    assert k(date(2026, 11, 28)) == 0 and k(date(2026, 11, 29)) == 1 and k(date(2026, 12, 1)) == 1
    assert k(date(2026, 12, 6)) == 2 and k(date(2026, 12, 19)) == 3 and k(date(2026, 12, 20)) == 4
    assert k(date(2026, 12, 27)) == 4 and k(date(2026, 12, 28)) == 0 and k(date(2026, 6, 1)) == 0
    assert t(date(2026, 12, 1)) == 23 and t(date(2026, 12, 24)) == 0 and t(date(2026, 12, 25)) == 364
    assert t(date(2027, 12, 25)) == 365  # 2028 ist ein Schaltjahr


def test_modes():
    z = S.zustand
    assert z(date(2026, 11, 30), "auto")["sichtbar"] is False
    a = z(date(2026, 12, 6), "auto")
    assert a["sichtbar"] and a["bewegt"] and a["phase"] == "advent" and a["kerzen"] == 2 and a["tage"] == 18
    assert z(date(2026, 12, 6), "akzente")["sichtbar"] and not z(date(2026, 12, 6), "akzente")["bewegt"]
    assert not z(date(2026, 12, 6), "aus")["sichtbar"]
    j = z(date(2026, 7, 1), "an")
    assert j["sichtbar"] and j["phase"] == "advent"  # „Immer an“ außerhalb: Advents-Optik


def test_cfg_clean_save_load():
    assert S.clean_cfg({"modus": "kaputt", "lichter": "ja"}) == S.default_cfg()
    m = _mgr()
    assert m.set_cfg({"modus": "akzente", "lichter": False, "boese": 1}) == {"modus": "akzente", "lichter": False, "countdown": True, "icons": True}
    assert m._store.saved == {"v": S.SCHEMA, "cfg": m.cfg}
    m2 = _mgr(m._store.saved)  # Neustart
    assert m2.cfg["modus"] == "akzente" and m2.cfg["lichter"] is False
    assert _mgr({"v": 1, "cfg": "kaputt"}).cfg == S.default_cfg()


def test_simulation_only_theme_and_expiry():
    NOW[0], CLOCK[0] = datetime(2026, 11, 22, 10, 0), 1_000_000.0
    m = _mgr()
    assert not m.set_sim("kein Datum") and not m.set_sim("1999-12-24")
    assert m.set_sim("2026-11-30T23:59", 60)
    snap = m.snapshot(True)
    assert snap["sim"]["on"] and snap["theme"]["phase"] == "aus" and snap["real"]["phase"] == "aus"
    NOW[0], CLOCK[0] = datetime(2026, 11, 22, 10, 1), CLOCK[0] + 60  # eine Minute später: Theme springt an
    snap = m.snapshot(True)
    assert snap["theme"]["datum"] == "2026-12-01" and snap["theme"]["sichtbar"] and snap["theme"]["kerzen"] == 1
    assert snap["real"]["datum"] == "2026-11-22" and snap["real"]["in_saison"] is False  # Entitäten bleiben echt
    CLOCK[0] += 60 * 60  # Simulation läuft ab
    snap = m.snapshot(True)
    assert not snap["sim"]["on"] and snap["theme"]["datum"] == "2026-11-22"
    assert m.set_sim("2026-12-24", 99999)
    assert m.sim_until - CLOCK[0] == S.SIM_MAX * 60 and m.theme_now() == datetime(2026, 12, 24, 8, 0)  # ohne Uhrzeit: 08:00
    m.stop_sim()
    assert not m.snapshot()["sim"]["on"]


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
            print("ok", name)
