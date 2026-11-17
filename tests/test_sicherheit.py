"""Tests für Modul 11 (sicherheit.py) ohne Home Assistant.

Ausführen: python3 -m pytest tests  oder  python3 tests/test_sicherheit.py
Geprüft werden Einstellungen und Plan (clean_cfg, clean_plan), Batterie-Prognose (Gerade, Batterietausch,
zu wenig Daten), Speicher in zwei Teilen (Plan mit Bild getrennt), Übernahme des alten Stands und das sofortige Prüfen
bei Ausfall und Rückkehr eines Melders.
"""
from __future__ import annotations

import asyncio
import importlib.util
import pathlib
import sys
import types
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung"
NOW = [datetime(2026, 11, 17, 19, 0, tzinfo=timezone.utc)]
DAY = 86400


def _stub(name: str, **attrs) -> types.ModuleType:
    m = sys.modules.get(name) or types.ModuleType(name)
    for k, v in attrs.items():
        setattr(m, k, v)
    sys.modules[name] = m
    return m


class _Store:
    stores: list = []

    def __init__(self, hass, v, key, **kw):
        self.key, self.data, self.saved, self.snaps = key, None, None, 0
        _Store.stores.append(self)

    async def async_load(self):
        return self.data

    def async_delay_save(self, fn, delay=0):
        self.saved = fn()

    def snapshot_now(self):
        self.snaps += 1


def _load():
    if "fh_sicherheit" in sys.modules:
        return sys.modules["fh_sicherheit"]
    for n in ("homeassistant", "homeassistant.helpers", "homeassistant.util"):
        _stub(n)
    _stub("homeassistant.const", EVENT_STATE_CHANGED="state_changed")
    _stub("homeassistant.core", CALLBACK_TYPE=object, Event=object, HomeAssistant=object, callback=lambda f: f)
    for n in ("area_registry", "device_registry", "entity_registry"):
        _stub(f"homeassistant.helpers.{n}", async_get=lambda hass: None)
        setattr(sys.modules["homeassistant.helpers"], n, sys.modules[f"homeassistant.helpers.{n}"])
    _stub("homeassistant.helpers.event", async_track_time_interval=lambda *a, **k: (lambda: None))
    _stub("homeassistant.util.dt", now=lambda: NOW[0], utcnow=lambda: NOW[0], parse_datetime=lambda s: datetime.fromisoformat(str(s).replace("Z", "+00:00")))
    sys.modules["homeassistant.util"].dt = sys.modules["homeassistant.util.dt"]
    _stub("fhpkg").__path__ = [str(ROOT)]
    _stub("fhpkg.backup", SafeStore=_Store)
    _stub("fhpkg.const", DOMAIN="fenster_heizung")
    spec = importlib.util.spec_from_file_location("fhpkg.sicherheit", ROOT / "sicherheit.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    sys.modules["fh_sicherheit"] = mod
    return mod


S = _load()


def hist(*pairs):
    return [[d * DAY, b] for d, b in pairs]


class _Bus:
    def __init__(self):
        self.handlers = {}

    def async_listen(self, ev, fn):
        self.handlers[ev] = fn
        return lambda: None


class _Hass:
    def __init__(self):
        self.bus, self.tasks = _Bus(), []
        self.data = {}

    def async_create_task(self, coro):
        self.tasks.append(coro)
        coro.close()


class _St:
    def __init__(self, state, dc="smoke"):
        self.state, self.attributes = state, {"device_class": dc}


class _Ev:
    def __init__(self, eid, new, old=None):
        self.data = {"entity_id": eid, "new_state": new, "old_state": old}


def mgr(wm_on=True):
    h = _Hass()
    h.data["fenster_heizung"] = {"wasser": types.SimpleNamespace(modules={"on": {"sf": wm_on}})}
    _Store.stores.clear()
    return S.SicherheitManager(h), h


# ---------------------------------------------------------------- Prognose
def test_prognose_gerade():
    f = S.bat_fit(hist((0, 100), (30, 80), (60, 60)))
    assert f and abs(f["slope"] + 2 / 3) < 0.01 and f["pts"] == 3


def test_prognose_zu_wenig_oder_steigend():
    assert S.bat_fit(hist((0, 90))) is None
    assert S.bat_fit(hist((0, 90), (3, 88))) is None  # unter 7 Tagen
    assert S.bat_fit(hist((0, 60), (30, 70))) is None  # keine Abnahme
    assert S.bat_fit([]) is None


def test_prognose_nach_batterietausch():
    f = S.bat_fit(hist((0, 40), (30, 15), (60, 100), (90, 90), (120, 80)))
    assert f and abs(f["slope"] + 1 / 3) < 0.01 and f["pts"] == 3  # nur die Punkte seit dem Tausch


def test_prognose_tage_bis_schwelle():
    m, _ = mgr()
    m.bhist["a"] = hist((0, 100), (30, 80), (60, 60))
    f = m.bat_forecast("a")
    assert f["zero"] == 90 and f["thr"] == 60  # 60 % bei 2/3 % pro Tag, Schwelle 20 %
    assert m.bat_days("a") == 90
    m.bhist["b"] = hist((0, 15), (30, 10))
    assert m.bat_forecast("b")["thr"] == 0


# ---------------------------------------------------------------- Einstellungen und Plan
def test_ui_und_standard():
    assert S.clean_cfg({})["ui"] == {"old": False}
    assert S.clean_cfg({"ui": {"old": 1}})["ui"] == {"old": True}
    assert S.clean_cfg({"ui": "x"})["ui"] == {"old": False}


def test_clean_cfg_grenzen():
    c = S.clean_cfg({"bat": {"pct": 99}, "off": {"min": 1}, "test": {"months": 5}, "lead": 40})
    assert c["bat"]["pct"] == 50 and c["off"]["min"] == 15 and c["test"]["months"] in (3, 6) and c["lead"] in (30, 60)


def test_clean_plan():
    img = "data:image/png;base64,AAAA"
    p = S.clean_plan({"floors": [{"id": "eg", "n": "EG"}], "items": [{"id": "r1", "fl": "eg", "t": "r", "x": 0, "y": 0, "w": 100, "h": 80, "n": "Küche"}, {"id": "q", "fl": "xx", "t": "r"}, {"id": "m1", "fl": "eg", "t": "m", "e": "sensor.x"}], "bg": {"eg": img, "xx": img}})
    assert [i["id"] for i in p["items"]] == ["r1", "m1"] and p["items"][1]["e"] == "" and p["bg"] == {"eg": img}
    assert S.clean_plan({"bg": {"eg": "http://x/y.png"}})["bg"] == {}
    assert S.clean_plan(None)["floors"][0]["id"] == "eg"


def test_batterie_quellen():
    assert S.battery_of({"battery_level": "42"}) == 42 and S.battery_of({}, "17,5") == 17.5 and S.battery_of({"battery": 150}) is None


# ---------------------------------------------------------------- Speicher in zwei Teilen
def test_speichern_trennt_plan_und_bild():
    m, _ = mgr()
    img = "data:image/png;base64,AAAA"
    m.cfg["plan"] = S.clean_plan({"floors": [{"id": "eg", "n": "EG"}], "items": [{"id": "r1", "fl": "eg", "t": "r", "w": 10, "h": 10}], "bg": {"eg": img}})
    m._save()
    main, plan = [x for x in _Store.stores if x.key.endswith("sicherheit")][0], [x for x in _Store.stores if x.key.endswith("sicherheit_plan")][0]
    assert main.saved["v"] == S.SCHEMA and main.saved["cfg"]["plan"]["bg"] == {} and len(main.saved["cfg"]["plan"]["items"]) == 1
    assert plan.saved["plan"]["bg"] == {"eg": img}


def test_alter_stand_wird_uebernommen():
    m, _ = mgr()
    img = "data:image/png;base64,AAAA"
    old = {"cfg": {"plan": {"floors": [{"id": "eg", "n": "EG"}], "items": [{"id": "r1", "fl": "eg", "t": "r", "w": 10, "h": 10}], "bg": {"eg": img}}}}
    main = [x for x in _Store.stores if x.key.endswith("sicherheit")][0]
    main.data = old
    asyncio.run(m.async_start())
    plan = [x for x in _Store.stores if x.key.endswith("sicherheit_plan")][0]
    assert m.cfg["plan"]["bg"] == {"eg": img} and plan.saved["plan"]["bg"] == {"eg": img}  # Bild landet im neuen Speicher
    assert main.snaps == 1  # Kopie vor der Übernahme
    assert main.saved["cfg"]["plan"]["bg"] == {}  # und ist nicht mehr bei den Einstellungen
    m.async_stop()


def test_neuer_stand_hat_vorrang():
    m, _ = mgr()
    main = [x for x in _Store.stores if x.key.endswith("sicherheit")][0]
    plan = [x for x in _Store.stores if x.key.endswith("sicherheit_plan")][0]
    main.data = {"v": 2, "cfg": {"plan": {"floors": [{"id": "alt", "n": "alt"}]}}}
    plan.data = {"v": 2, "plan": {"floors": [{"id": "neu", "n": "Neu"}], "items": [], "bg": {}}}
    asyncio.run(m.async_start())
    assert m.cfg["plan"]["floors"][0]["id"] == "neu" and main.snaps == 0
    m.async_stop()


# ---------------------------------------------------------------- Geprüft und Batterie getauscht
def test_geprueft_und_batterie_getauscht():
    m, _ = mgr()
    m.snapshot = lambda: asyncio.sleep(0, {})  # Momentaufnahme braucht Home Assistant, hier nicht nötig
    m._known = {"binary_sensor.a", "binary_sensor.b"}
    asyncio.run(m.async_mark_tested("binary_sensor.a"))
    asyncio.run(m.async_mark_tested(""))
    assert len(m.thist["binary_sensor.a"]) == 2 and len(m.thist["binary_sensor.b"]) == 1 and m.tested == {}
    m.bhist["binary_sensor.a"] = hist((0, 50), (30, 40))
    asyncio.run(m.async_mark_tested("binary_sensor.a", True))
    assert "binary_sensor.a" not in m.bhist and len(m.swaps["binary_sensor.a"]) == 1 and len(m.thist["binary_sensor.a"]) == 2  # Tausch zählt nicht als Prüfung


# ---------------------------------------------------------------- Sofort prüfen
def test_ausfall_und_rueckkehr_loesen_pruefung_aus():
    m, h = mgr()
    on = lambda ev: m._on_state(ev) or len(h.tasks)  # noqa: E731
    assert on(_Ev("binary_sensor.rauch", _St("on"))) == 1  # Alarm
    assert on(_Ev("binary_sensor.rauch", _St("off"), _St("on"))) == 1  # Ende: wie bisher erst im Takt
    assert on(_Ev("binary_sensor.rauch", _St("unavailable"), _St("off"))) == 2  # Ausfall
    assert on(_Ev("binary_sensor.rauch", _St("off"), _St("unavailable"))) == 3  # Rückkehr
    assert on(_Ev("binary_sensor.tuer", _St("on", "door"))) == 3  # kein Melder
    m._known.add("binary_sensor.eigener")
    assert on(_Ev("binary_sensor.eigener", _St("unavailable", None), _St("off", None))) == 4  # von Hand hinzugefügt, ohne Geräteklasse
    m2, h2 = mgr(wm_on=False)
    m2._on_state(_Ev("binary_sensor.rauch", _St("on")))
    assert not h2.tasks  # Modul aus


if __name__ == "__main__":
    for k, v in list(globals().items()):
        if k.startswith("test_"):
            v()
            print("ok", k)
