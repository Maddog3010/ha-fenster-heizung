"""Tests für Modul 15 (wartung.py) ohne Home Assistant.

Ausführen: python3 -m pytest tests  oder  python3 tests/test_wartung.py
Geprüft werden Abstände (Monatsende, Schaltjahr), Ampel mit Vorwarnung und Kulanz, Prüfen der Eingaben,
Anlegen, Ändern, Löschen, Erledigt mit Rückgängig, Speichern und Laden (auch kaputte Einträge) und die Diagnose ohne Namen.
"""
from __future__ import annotations

import asyncio
import importlib.util
import pathlib
import sys
import types
from datetime import date, datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung"
NOW = [datetime(2026, 11, 21, 20, 0, tzinfo=timezone.utc)]
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
    if "fh_wartung" in sys.modules:
        return sys.modules["fh_wartung"]
    for n in ("homeassistant", "homeassistant.util"):
        _stub(n)
    _stub("homeassistant.core", HomeAssistant=object)
    _stub("homeassistant.util.dt", now=lambda: NOW[0])
    sys.modules["homeassistant.util"].dt = sys.modules["homeassistant.util.dt"]
    _stub("fhpkg").__path__ = [str(ROOT)]
    _stub("fhpkg.backup", SafeStore=_Store)
    _stub("fhpkg.const", DOMAIN="fenster_heizung")
    spec = importlib.util.spec_from_file_location("fhpkg.wartung", ROOT / "wartung.py")
    mod = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(mod)
    finally:
        for n, old in _ALT.items():
            if old is None:
                sys.modules.pop(n, None)
            else:
                sys.modules[n] = old
    sys.modules["fh_wartung"] = mod
    return mod


W = _load()
run = asyncio.run


def _mgr(data=None):
    m = W.WartungManager(None)
    m._store.data = data
    run(m.async_start())
    return m


def test_interval_month_end_and_leap_year():
    assert W.add_interval(date(2026, 1, 31), 1, "m") == date(2026, 2, 28)
    assert W.add_interval(date(2028, 1, 31), 1, "m") == date(2028, 2, 29)
    assert W.add_interval(date(2024, 2, 29), 1, "y") == date(2025, 2, 28)
    assert W.add_interval(date(2026, 11, 21), 18, "m") == date(2028, 5, 21)
    assert W.add_interval(date(2026, 11, 21), 2, "w") == date(2026, 12, 5)
    assert W.add_interval(date(2026, 12, 30), 3, "d") == date(2027, 1, 2)


def test_status_traffic_light():
    today = date(2026, 11, 21)
    t = {"every": 1, "unit": "y", "lead": 7}
    assert W.status({**t, "last": "2025-12-01"}, today)["days"] == 10
    assert W.status({**t, "last": "2025-12-01", "lead": 14}, today)["st"] == "soon"
    assert W.status({**t, "last": "2025-12-01", "lead": 7}, today)["st"] == "ok"
    assert W.status({**t, "last": "2025-11-21"}, today)["st"] == "due"  # heute fällig
    assert W.status({**t, "last": "2025-11-19"}, today)["st"] == "due"  # 2 Tage drüber, noch Kulanz
    assert W.status({**t, "last": "2025-11-18"}, today)["st"] == "over"  # 3 Tage drüber
    assert W.status({**t}, today)["st"] == "new"
    assert W.status({**t, "first": "2026-11-25"}, today) == {"st": "soon", "due": "2026-11-25", "days": 4}
    assert W.status({**t, "last": "2020-01-01", "off": True}, today)["st"] == "off"


def test_clean_task_limits():
    assert W.clean_task({"name": "  "}) is None
    assert W.clean_task("x") is None
    t = W.clean_task({"name": "Schornsteinfeger " * 5, "unit": "y", "every": 99, "lead": -4, "icon": "evil", "last": "2026-02-31", "first": "2026-13-01", "hist": [{"d": "2026-01-01"}]})
    assert len(t["name"]) <= 40 and t["every"] == 30 and t["lead"] == 0 and t["icon"] == "tools"
    assert t["last"] == "" and t["first"] == "" and t["hist"] == []  # neue Termine bringen keinen Verlauf mit
    assert W.clean_task({"name": "X", "unit": "?"})["unit"] == "m"


def test_create_edit_delete_and_persist():
    m = _mgr()
    r = run(m.async_save_task({"name": "Heizungswartung", "area": "Heizung", "every": 1, "unit": "y", "last": "2025-11-10", "icon": "flame"}))
    assert r["ok"] and len(r["tasks"]) == 1
    tid = r["id"]
    assert r["tasks"][0]["st"] == "over" and r["tasks"][0]["due"] == "2026-11-10"
    assert m._store.saved["v"] == W.SCHEMA and m._store.saved["tasks"][0]["name"] == "Heizungswartung"
    r = run(m.async_save_task({"id": tid, "name": "Heizungswartung (Fachbetrieb)", "every": 2, "unit": "y", "last": "2025-11-10", "pro": True}))
    assert r["ok"] and r["tasks"][0]["st"] == "ok" and r["tasks"][0]["pro"] and r["tasks"][0]["created"] == "2026-11-21"
    assert not run(m.async_save_task({"id": "nichtda1", "name": "X"}))["ok"]
    assert run(m.async_save_task({"name": ""}))["err"] == "name"
    m2 = _mgr(m._store.saved)  # Neustart
    assert [t["id"] for t in m2.tasks] == [tid]
    assert run(m2.async_delete(tid))["ok"] and m2.tasks == []
    assert not run(m2.async_delete(tid))["ok"]


def test_done_undo_and_backdated_entry():
    m = _mgr()
    tid = run(m.async_save_task({"name": "Dunstabzug-Filter", "every": 3, "unit": "m", "last": "2026-08-01"}))["id"]
    r = run(m.async_done(tid, cost="12,50", note="Ersatzfilter"))
    t = r["tasks"][0]
    assert t["last"] == "2026-11-21" and t["due"] == "2027-02-21" and t["st"] == "ok"
    assert t["hist"][-1] == {"d": "2026-11-21", "prev": "2026-08-01", "cost": 12.5, "note": "Ersatzfilter"}
    assert r["sum"]["done_year"] == 1 and r["sum"]["cost_year"] == 12.5
    r = run(m.async_done(tid, day="2026-05-01"))  # älterer Eintrag nachgetragen: Termin bleibt
    assert r["tasks"][0]["last"] == "2026-11-21"
    assert run(m.async_undo(tid))["tasks"][0]["last"] == "2026-11-21"  # nimmt den Nachtrag zurück
    r = run(m.async_undo(tid))
    assert r["tasks"][0]["last"] == "2026-08-01" and r["tasks"][0]["hist"] == []
    assert not run(m.async_undo(tid))["ok"]
    assert run(m.async_done(tid, day="2026-12-24"))["err"] == "future"


def test_load_repairs_bad_entries_and_limit():
    data = {"v": 1, "tasks": [{"id": "abcd1234", "name": "A", "every": 1, "unit": "y"}, {"id": "abcd1234", "name": "B"}, {"name": ""}, "kaputt",
                              {"id": "x!", "name": "C", "hist": [{"d": "2026-01-01", "cost": "abc"}, {"d": "nie"}]}], "log": [{"t": "1", "x": "a"}, {"y": 1}]}
    m = _mgr(data)
    ids = [t["id"] for t in m.tasks]
    assert [t["name"] for t in m.tasks] == ["A", "B", "C"] and len(set(ids)) == 3 and ids[0] == "abcd1234"
    assert m.tasks[2]["hist"] == [{"d": "2026-01-01"}] and len(m.log) == 1
    m = _mgr({"tasks": [{"name": f"T{i}"} for i in range(W.MAX_TASKS)]})
    assert run(m.async_save_task({"name": "zu viel"}))["err"] == "full"


def test_snapshot_order_and_summary():
    m = _mgr()
    for name, last, every in (("später", "2026-11-01", 12), ("überfällig", "2025-01-01", 12), ("bald", "2026-08-25", 3)):
        run(m.async_save_task({"name": name, "every": every, "unit": "m", "last": last}))
    run(m.async_save_task({"name": "ohne Datum"}))
    s = run(m.snapshot())
    assert [t["name"] for t in s["tasks"]] == ["überfällig", "bald", "später", "ohne Datum"]
    assert s["sum"]["over"] == 1 and s["sum"]["soon"] == 1 and s["sum"]["ok"] == 1 and s["sum"]["new"] == 1
    assert s["sum"]["next"]["name"] == "überfällig"


def test_diag_without_names_or_notes():
    m = _mgr()
    run(m.async_save_task({"name": "Geheim", "note": "Code 1234", "every": 1, "unit": "y", "last": "2026-01-01"}))
    d = m.diag()
    txt = str(d)
    assert "Geheim" not in txt and "1234" not in txt and d["tasks"][0]["st"] == "ok"


if __name__ == "__main__":
    for k, f in list(globals().items()):
        if k.startswith("test_"):
            f()
            print("ok", k)
