"""Tests für Modul 0 · Haus & Grundriss (grundriss.py) ohne Home Assistant.

Ausführen: python3 -m pytest tests  oder  python3 tests/test_grundriss.py
Geprüft werden: Umzug des Plans aus Modul 11 beim ersten Start (mit Melder- und Lampen-Ebene und Umzugs-Kopie), leere Pläne werden nicht
übernommen, danach hat Modul 0 Vorrang, der Baukasten von Modul 11 schreibt in Modul 0 (nur wenn der Plan mitgeschickt wird), Zahlen für
Banner und Ebenen, welche Module den Plan nutzen und das Aufräumen der Umzugs-Kopie nach 90 Tagen.
"""
from __future__ import annotations

import asyncio
import importlib.util
import pathlib
import sys
import types
from datetime import datetime, timedelta, timezone

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent / "custom_components" / "fenster_heizung"


def _sf():
    """Modul 11 samt Ersatz-Home-Assistant aus test_sicherheit.py wiederverwenden."""
    if "test_sicherheit" in sys.modules:   # gleiche Instanz wie pytest, sonst gäbe es zwei Ersatz-Speicher
        return sys.modules["test_sicherheit"]
    spec = importlib.util.spec_from_file_location("test_sicherheit", HERE / "test_sicherheit.py")
    m = importlib.util.module_from_spec(spec)
    sys.modules["test_sicherheit"] = m
    spec.loader.exec_module(m)
    return m


T = _sf()
S = T.S
NOW = [datetime(2026, 11, 22, 14, 0, tzinfo=timezone.utc)]


def _load():
    saved = {k: sys.modules.get(k) for k in ("fhpkg", "fhpkg.backup", "fhpkg.const", "fhpkg.sicherheit", "homeassistant", "homeassistant.core", "homeassistant.util", "homeassistant.util.dt")}
    pkg = types.ModuleType("fhpkg"); pkg.__path__ = [str(ROOT)]; sys.modules["fhpkg"] = pkg
    sys.modules["fhpkg.backup"] = types.SimpleNamespace(SafeStore=T._Store)
    sys.modules["fhpkg.const"] = types.SimpleNamespace(DOMAIN="fenster_heizung")
    sys.modules["fhpkg.sicherheit"] = S
    sys.modules["homeassistant"] = types.ModuleType("homeassistant")
    sys.modules["homeassistant.core"] = types.SimpleNamespace(HomeAssistant=object)
    dt = types.SimpleNamespace(now=lambda: NOW[0], parse_datetime=lambda s: datetime.fromisoformat(str(s)))
    sys.modules["homeassistant.util"] = types.SimpleNamespace(dt=dt)
    sys.modules["homeassistant.util.dt"] = dt
    spec = importlib.util.spec_from_file_location("fhpkg.grundriss", ROOT / "grundriss.py")
    mod = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(mod)
    finally:
        for k, v in saved.items():
            if v is None:
                sys.modules.pop(k, None)
            else:
                sys.modules[k] = v
    mod.dt_util = dt
    return mod


G = _load()
PLAN = {"floors": [{"id": "eg", "n": "EG"}, {"id": "og", "n": "OG"}], "bg": {}, "items": [
    {"id": "r1", "fl": "eg", "t": "r", "x": 0, "y": 0, "w": 200, "h": 100, "n": "Wohnzimmer"},
    {"id": "r2", "fl": "og", "t": "r", "x": 0, "y": 0, "w": 100, "h": 100, "n": ""},
    {"id": "w1", "fl": "eg", "t": "w", "x": 0, "y": 0, "x2": 200, "y2": 0},
    {"id": "m1", "fl": "eg", "t": "m", "x": 50, "y": 50, "e": "binary_sensor.rauch"},
    {"id": "l1", "fl": "eg", "t": "l", "x": 80, "y": 50, "e": "light.decke", "k": "decke"}]}


def _setup(sf_plan=None, gr_data=None):
    m, h = T.mgr()
    gm = G.GrundrissManager(h)
    h.data["fenster_heizung"]["grundriss"] = gm
    st = {x.key: x for x in T._Store.stores}
    if gr_data is not None:
        st["fenster_heizung_grundriss"].data = gr_data
    asyncio.run(gm.async_start())
    if sf_plan is not None:
        [x for x in T._Store.stores if x.key.endswith("sicherheit_plan")][0].data = {"v": 2, "plan": sf_plan}
        [x for x in T._Store.stores if x.key.endswith("sicherheit")][0].data = {"v": 2, "cfg": {}}
    asyncio.run(m.async_start())
    return m, gm, h, {x.key: x for x in T._Store.stores}


def test_umzug_aus_modul_11():
    m, gm, h, st = _setup(PLAN)
    assert gm.has and gm.meta["src"] == "sf" and len(gm.plan["items"]) == 5
    assert {i["t"] for i in gm.plan["items"]} == {"r", "w", "m", "l"}            # Melder und Lampen ziehen als Ebenen mit
    assert st["fenster_heizung_grundriss"].saved["plan"] == gm.plan
    copy = st["fenster_heizung_grundriss_umzug"].saved
    assert copy["src"] == "sf" and copy["plan"]["items"] == gm.plan["items"]     # Umzugs-Kopie
    assert gm.meta["copy_until"].startswith((NOW[0] + timedelta(days=90)).date().isoformat())
    m.async_stop()


def test_leerer_plan_wird_nicht_uebernommen():
    m, gm, h, st = _setup({"floors": [{"id": "eg", "n": "EG"}], "items": [], "bg": {}})
    assert not gm.has and st["fenster_heizung_grundriss"].saved is None
    m.async_stop()


def test_modul_0_hat_danach_vorrang():
    neu = {**PLAN, "items": PLAN["items"][:1]}
    m, gm, h, st = _setup(PLAN, gr_data={"v": 1, "plan": neu, "meta": {"since": "2026-11-20T10:00:00+00:00", "src": "sf"}})
    assert len(m.cfg["plan"]["items"]) == 1 and len(gm.plan["items"]) == 1       # Modul 11 liest den Plan aus Modul 0
    assert st["fenster_heizung_grundriss_umzug"].saved is None                    # kein zweiter Umzug
    m.async_stop()


def test_baukasten_von_modul_11_schreibt_in_modul_0():
    m, gm, h, st = _setup(PLAN)

    async def _noop(*a, **k):
        return {}
    m.async_config_changed, m.snapshot = _noop, _noop   # Melder-Prüfung braucht die Register von Home Assistant
    calls = []
    gm.listen(lambda: calls.append(1))
    p2 = {**PLAN, "items": PLAN["items"] + [{"id": "r3", "fl": "og", "t": "r", "x": 100, "y": 0, "w": 50, "h": 50, "n": "Bad"}]}
    asyncio.run(m.async_set({"plan": p2}))
    assert len(gm.plan["items"]) == 6 and gm.meta["by"] == "sf" and calls == [1]
    asyncio.run(m.async_set({"repeat": 15}))                                      # andere Einstellung: Plan bleibt
    assert len(gm.plan["items"]) == 6 and calls == [1]
    assert gm.set_plan(gm.plan) is False                                          # gleicher Plan: nichts zu tun
    m.async_stop()


def test_zahlen_und_nutzer():
    m, gm, h, st = _setup(PLAN)
    s = gm.snapshot()
    assert s["stats"] == {"floors": 2, "rooms": 2, "named": 1, "build": 3, "layers": {"sf": 1, "licht": 1}, "bg": 0}
    assert s["users"] == ["fh", "sf"]
    h.data["fenster_heizung"]["addons"] = types.SimpleNamespace(live={"licht": object()})
    h.data["fenster_heizung"]["wasser"].modules["on"]["sf"] = False
    assert gm.users() == ["fh", "li"]
    m.async_stop()


def test_umzugs_kopie_wird_nach_90_tagen_geleert():
    old = {"v": 1, "plan": PLAN, "meta": {"since": "2026-08-01T10:00:00+00:00", "src": "sf", "copy_until": "2026-10-30T10:00:00+00:00"}}
    m, gm, h, st = _setup(None, gr_data=old)
    assert "copy_until" not in gm.meta and st["fenster_heizung_grundriss_umzug"].saved["plan"] is None
    assert st["fenster_heizung_grundriss"].saved["meta"]["since"] == "2026-08-01T10:00:00+00:00"
    m.async_stop()


if __name__ == "__main__":
    n = 0
    for k, f in list(globals().items()):
        if k.startswith("test_") and callable(f):
            f(); n += 1
    print(f"{n} Tests ok")
