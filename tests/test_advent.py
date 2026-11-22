"""Tests für den Adventskalender (Weihnachts-Theme Build 2, advent.py) ohne Home Assistant.

Ausführen: python3 -m pytest tests  oder  python3 tests/test_advent.py
Geprüft werden die Türchen-Zustände an allen Grenzen, die Inhaltsdatei 2026 (24 Türchen, gültige Typen und Platzhalter),
Ersatz-Datei für andere Jahre, Einstellungen, Öffnen und Nachholen mit Speichern und Laden, Stand pro Benutzer,
Ereignis, Simulation nur im Arbeitsspeicher, Zurücksetzen und der Zähler für den Sensor.
"""
from __future__ import annotations

import asyncio
import importlib.util
import pathlib
import re
import sys
import types
from datetime import date, datetime

ROOT = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung"
NOW = [datetime(2026, 12, 8, 9, 0)]
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
    if "fh_advent" in sys.modules:
        return sys.modules["fh_advent"]
    for n in ("homeassistant", "homeassistant.util"):
        _stub(n)
    _stub("homeassistant.util.dt", now=lambda: NOW[0])
    sys.modules["homeassistant.util"].dt = sys.modules["homeassistant.util.dt"]
    _stub("fhpkg").__path__ = [str(ROOT)]
    _stub("fhpkg.backup", SafeStore=_Store)
    spec = importlib.util.spec_from_file_location("fhpkg.advent", ROOT / "advent.py")
    mod = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(mod)
    finally:
        for n, old in _ALT.items():
            if old is None:
                sys.modules.pop(n, None)
            else:
                sys.modules[n] = old
    sys.modules["fh_advent"] = mod
    return mod


A = _load()
run = asyncio.run


class _Saison:
    def __init__(self, d=None):
        self.d = d

    def sim_active(self):
        return self.d is not None

    def theme_now(self):
        return self.d or NOW[0]


class _Bus:
    def __init__(self):
        self.ev = []

    def async_fire(self, name, data):
        self.ev.append((name, data))


class _Hass:
    def __init__(self, sim=None):
        self.data = {"fenster_heizung": {"saison": _Saison(sim)}}
        self.bus = _Bus()

    async def async_add_executor_job(self, fn):
        return fn()


def _mgr(data=None, hass=None):
    m = A.AdventManager(hass)
    m._store.data = data
    if hass is not None:  # Takt nicht anmelden (kein Home Assistant)
        m.hass = None
        run(m.async_start())
        m.hass = hass
    else:
        run(m.async_start())
    return m


def test_door_states_at_borders():
    s = A.tuer_status
    g = {1, 2, 3, 5}
    assert s(8, date(2026, 12, 8), g) == "heute" and s(4, date(2026, 12, 8), g) == "nachholen"
    assert s(9, date(2026, 12, 8), g) == "gesperrt" and s(2, date(2026, 12, 8), g) == "offen"
    assert s(24, date(2026, 12, 27), g) == "nachholen" and s(10, date(2026, 12, 28), g) == "rueckblick"
    assert s(10, date(2027, 1, 6), g) == "rueckblick" and s(10, date(2027, 1, 7), g) == "gesperrt"
    assert s(1, date(2026, 11, 30), set()) == "gesperrt"
    assert A.kalender_jahr(date(2027, 1, 3)) == 2026


def test_content_file_2026_complete():
    m = _mgr()
    inh = m.inhalt(2026)
    assert sorted(inh) == list(range(1, 25))
    quellen = {"heiz_monat", "heiz_jahr", "licht_heute", "pv_jetzt", "raum_waermster", "fenster_offen", "ev_soc", "melder", "feuchte", "sonne"}
    for t in inh.values():
        assert t["typ"] in A.TYPEN and t["titel"] and t["text"]  # nie leer, auch ohne Daten
        if "daten" in t:
            assert t["daten"] in quellen and re.search(r"\{[a-z]+\}", t["mit_daten"])
    assert m.inhalt(2031) == inh and m.inhalt(2020) == inh  # andere Jahre: letzte bzw. früheste Datei
    assert A.datei_fuer(2028, [2026, 2027]) == 2027 and A.datei_fuer(2026, []) is None


def test_parse_and_cfg_limits():
    p = A.parse_inhalt({"tuerchen": [{"tag": 3, "typ": "boese", "titel": "X" * 200}, {"tag": 3, "titel": "doppelt"}, {"tag": 30}, "kaputt", {"tag": "abc"}]})
    assert list(p) == [3] and p[3]["typ"] == "tipp" and len(p[3]["titel"]) == 80
    assert A.parse_inhalt("kaputt") == {}
    c = A.clean_cfg({"variante": "Z", "stand": "benutzer", "schnee": "leicht", "notify": {"on": True, "zeit": "25:00", "dienst": "light.kueche"}})
    assert c["variante"] == "A" and c["stand"] == "benutzer" and c["schnee"] == "leicht"
    assert c["notify"] == {"on": True, "zeit": "07:00", "dienst": ""}
    assert A.clean_cfg({"notify": {"zeit": "06:30", "dienst": "notify.mobile_app_iphone"}})["notify"]["dienst"] == "notify.mobile_app_iphone"


def test_open_catch_up_persist_and_event():
    NOW[0] = datetime(2026, 12, 8, 9, 0)
    h = _Hass()
    m = _mgr(hass=h)
    r = m.open(8, "u1", "Anna")
    assert r["ok"] and r["neu"] and r["t"]["tag"] == 8
    assert h.bus.ev[-1] == (A.EVENT, {"tag": 8, "typ": r["t"]["typ"], "titel": r["t"]["titel"], "jahr": 2026, "benutzer": "Anna", "simuliert": False})
    assert m.open(4, "u1")["neu"]  # nachholen
    assert not m.open(8, "u1")["neu"]  # schon offen: Inhalt, kein zweites Ereignis
    assert len(h.bus.ev) == 2
    g = m.open(9, "u1")
    assert not g["ok"] and g["err"] == "gesperrt" and g["tage"] == 1
    assert not m.open(25)["ok"] and not m.open("x")["ok"]
    snap = m.snapshot("u1")
    assert snap["offen"] == 2 and [t["st"] for t in snap["tueren"]][3:9] == ["offen", "nachholen", "nachholen", "nachholen", "offen", "gesperrt"]
    assert "t" in snap["tueren"][7] and "t" not in snap["tueren"][8]  # Inhalt nur für offene Türchen
    m2 = _mgr(m._store.saved)  # Neustart
    assert m2.snapshot()["offen"] == 2


def test_per_user_state():
    h = _Hass()
    m = _mgr(hass=h)
    m.set_cfg({"stand": "benutzer"})
    m.open(8, "anna")
    assert m.snapshot("anna")["offen"] == 1 and m.snapshot("ben")["offen"] == 0
    m.set_cfg({"stand": "gemeinsam"})
    assert m.snapshot("anna")["offen"] == 0  # gemeinsamer Stand ist ein eigener


def test_simulation_only_in_memory_and_reset():
    NOW[0] = datetime(2026, 11, 22, 10, 0)
    h = _Hass(sim=datetime(2026, 12, 6, 8, 0))
    m = _mgr(hass=h)
    assert m.open(6)["neu"] and m.snapshot()["offen"] == 1 and m.snapshot()["sim"]
    assert m._store.saved is None and m.jahre == {}  # nichts gespeichert
    assert h.bus.ev[-1][1]["simuliert"] is True
    h.data["fenster_heizung"]["saison"].d = None  # Simulation vorbei
    assert m.snapshot()["offen"] == 0 and m.sim_offen == {}
    NOW[0] = datetime(2026, 12, 8, 9, 0)
    m.open(8)
    m.reset()
    assert m.snapshot()["offen"] == 0 and "2026" not in m.jahre


def test_counter_for_sensor():
    NOW[0] = datetime(2026, 12, 8, 9, 0)
    h = _Hass()
    m = _mgr(hass=h)
    assert m.count() == {"n": 0, "heute_verfuegbar": True, "jahr": 2026}
    m.open(8)
    m.open(3)
    assert m.count() == {"n": 2, "heute_verfuegbar": False, "jahr": 2026}
    NOW[0] = datetime(2026, 12, 25, 9, 0)
    assert m.count()["heute_verfuegbar"] is False


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
            print("ok", name)
