"""Tests für Modul 18 Licht & Lampen (addons/licht) ohne Home Assistant.

Ausführen: python3 -m pytest tests  oder  python3 tests/test_licht.py
Geprüft werden (Build 2): Lichtfarbe aus Kelvin, hs, xy und rgb, Mischfarbe nach Helligkeit, Erkennung von Lichtgruppen
und Schalten über eine genau passende Gruppe, Brennstunden über Mitternacht und Zeitumstellung, Einschaltzeit über einen
Neustart (kurze und lange Lücke), Aufräumen nach 90 Tagen, Einstellungen und Kopie des Layouts, dazu der Python-Teil mit
Ersatz-Home-Assistant: Sensorwerte, Schalten über die Gruppe, Rechte und Neustart; ab Build 4 die Grundriss-Zuordnung.
"""
from __future__ import annotations

import asyncio
import importlib.util
import pathlib
import sys
import types
from datetime import datetime
from zoneinfo import ZoneInfo

ROOT = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung" / "addons" / "licht"
TZ = ZoneInfo("Europe/Berlin")


def _load(name: str, path: pathlib.Path, pkg: str | None = None):
    spec = importlib.util.spec_from_file_location(name, path, submodule_search_locations=None)
    m = importlib.util.module_from_spec(spec)
    if pkg:
        m.__package__ = pkg
    sys.modules[name] = m
    spec.loader.exec_module(m)
    return m


L = _load("licht_logic_test", ROOT / "logic.py")


def ts(*a) -> float:
    return datetime(*a, tzinfo=TZ).timestamp()


# ------------------------------------------------------------------ Farbe
def test_kelvin_warm_und_kalt():
    r, g, b = L.kelvin_rgb(2700)
    assert r == 255 and 150 < g < 190 and b < 120          # warm: viel Rot, wenig Blau
    r2, g2, b2 = L.kelvin_rgb(6500)
    assert r2 > 240 and g2 > 240 and b2 > 240              # fast weiß
    assert L.kelvin_rgb(500) == L.kelvin_rgb(1000)         # Grenzen


def test_lampenfarbe_nach_modus():
    assert L.lamp_rgb({"color_mode": "color_temp", "color_temp_kelvin": 2700, "rgb_color": [1, 2, 3]}) == L.kelvin_rgb(2700)
    assert L.lamp_rgb({"color_mode": "rgb", "rgb_color": [167, 139, 250]}) == (167, 139, 250)
    assert L.lamp_rgb({"color_mode": "hs", "hs_color": [0, 100]}) == (255, 0, 0)
    r, g, b = L.lamp_rgb({"color_mode": "xy", "xy_color": [0.15, 0.06]})   # Blau
    assert b == 255 and r < 120 and g < 60
    assert L.lamp_rgb({}) == L.WARM
    assert L.lamp_rgb({"rgb_color": "kaputt"}) == L.WARM


def test_mischfarbe_gewichtet():
    assert L.mix([]) is None
    assert L.mix([((255, 0, 0), 0)]) is None
    assert L.mix([((255, 0, 0), 100), ((0, 0, 255), 100)]) == (128, 0, 128)
    assert L.mix([((255, 0, 0), 75), ((0, 0, 255), 25)]) == (191, 0, 64)
    assert L.hex_rgb((255, 179, 107)) == "#ffb36b" and L.hex_rgb(None) == ""


# ------------------------------------------------------------------ Gruppen
def test_gruppen_erkennen_und_waehlen():
    assert L.members({"entity_id": ["light.a", "light.b", "switch.x"]}) == ["light.a", "light.b"]
    assert L.members({"friendly_name": "x"}) == []
    G = {"light.wohnen": ["light.a", "light.b", "light.c"], "light.ab": ["light.a", "light.b"], "light.ab2": ["light.b", "light.a"]}
    assert L.group_for(["light.c", "light.b", "light.a"], G) == "light.wohnen"
    assert L.group_for(["light.a", "light.b"], G) == "light.ab"          # stabil: kleinster Name
    assert L.group_for(["light.a"], G) is None                           # eine Lampe braucht keine Gruppe
    assert L.plan_switch(["light.a", "light.b", "light.c"], G) == ["light.wohnen"]
    assert L.plan_switch(["light.a", "light.b", "light.d"], G) == ["light.ab", "light.d"]
    assert L.plan_switch(["light.d", "light.d"], G) == ["light.d"]


# ------------------------------------------------------------------ Brennstunden
def test_tage_zerlegen_mitternacht_und_zeitumstellung():
    p = L.split_days(ts(2026, 11, 21, 23, 30), ts(2026, 11, 22, 0, 45), TZ)
    assert p == [("2026-11-21", 1800.0), ("2026-11-22", 2700.0)]
    p = L.split_days(ts(2026, 10, 24, 23, 0), ts(2026, 10, 25, 23, 0), TZ)   # Umstellung auf Winterzeit: Tag hat 25 Std.
    assert p[0] == ("2026-10-24", 3600.0) and p[1] == ("2026-10-25", 25 * 3600 - 3600.0)


def test_brenndauer_start_tick_stop():
    B = L.Burn(TZ)
    B.start("light.a", ts(2026, 11, 22, 18, 0))
    B.start("light.a", ts(2026, 11, 22, 18, 5))                    # doppelt: Einschaltzeit bleibt
    B.tick(ts(2026, 11, 22, 19, 0))
    assert B.today(ts(2026, 11, 22, 19, 0)) == {"light.a": 3600.0}
    B.stop("light.a", ts(2026, 11, 22, 19, 30))
    assert B.today(ts(2026, 11, 22, 20, 0)) == {"light.a": 5400.0} and "light.a" not in B.on
    B.stop("light.a", ts(2026, 11, 22, 21, 0))                     # schon aus: nichts passiert
    assert B.today(ts(2026, 11, 22, 21, 0))["light.a"] == 5400.0
    w = B.week(ts(2026, 11, 22, 21, 0))
    assert len(w) == 7 and w[-1] == {"day": "2026-11-22", "h": 1.5} and w[0]["h"] == 0


def test_neustart_kurze_und_lange_luecke():
    B = L.Burn(TZ)
    B.start("light.a", ts(2026, 11, 22, 17, 0))
    B.start("light.b", ts(2026, 11, 22, 17, 0))
    B.start("light.c", ts(2026, 11, 22, 17, 0))
    B.tick(ts(2026, 11, 22, 18, 0))
    data = B.dump()
    # Neustart: a ist nach 10 Min. noch an, c ist jetzt aus, d war unbekannt
    B2 = L.Burn(TZ, data)
    B2.resume({"light.a": ts(2026, 11, 22, 18, 9), "light.d": ts(2026, 11, 22, 18, 5)}, ts(2026, 11, 22, 18, 10))
    assert B2.on["light.a"] == ts(2026, 11, 22, 17, 0)             # Einschaltzeit übersteht den Neustart
    assert B2.today(ts(2026, 11, 22, 18, 10))["light.a"] == 3600 + 600   # kurze Lücke zählt mit
    assert "light.c" not in B2.on and "light.b" not in B2.on
    assert B2.on["light.d"] == ts(2026, 11, 22, 18, 5)             # unbekannt: an seit last_changed
    # lange Lücke (2 Std.) zählt nicht
    B3 = L.Burn(TZ, data)
    B3.resume({"light.a": None}, ts(2026, 11, 22, 20, 0))
    assert B3.today(ts(2026, 11, 22, 20, 0))["light.a"] == 3600 and B3.cut["light.a"] == ts(2026, 11, 22, 20, 0)


def test_aufraeumen_und_kaputte_daten():
    B = L.Burn(TZ, {"on": {"light.a": "x", "light.b": 5.0}, "days": {"2026-01-01": {"light.a": 10}, "kaputt": {}, "2026-11-20": {"light.a": -3}}})
    assert B.on == {"light.b": 5.0} and "kaputt" not in B.days and B.days["2026-11-20"] == {}
    B.prune(ts(2026, 11, 22, 12, 0), keep=lambda e: False)
    assert "2026-01-01" not in B.days and B.on == {}


def test_grundriss_zuordnung():
    assert L.clean_prefs({"view": "plan"})["view"] == "plan"
    assert L.clean_pmap(None) == {}
    pm = L.clean_pmap({"r1": "wohnen", "r2": "-", "r3": "", "bad id!": "x", "r4": 5, "r5": "küche ä"})
    assert pm == {"r1": "wohnen", "r2": "-"}
    assert len(L.clean_pmap({f"r{i}": "a" for i in range(500)})) == 200


def test_einstellungen_und_layout_kopie():
    assert L.clean_prefs(None) == {"view": "rooms", "optik": "neu"}
    assert L.clean_prefs({"view": "list", "optik": "alt"}) == {"view": "list", "optik": "alt"}
    assert L.clean_prefs({"view": "karte", "optik": 1}) == {"view": "rooms", "optik": "neu"}
    assert L.clean_legacy("x") is None
    leg = L.clean_legacy({"scenes": {"night": "scene.nacht", "evil": "x"}, "hours": 3, "hidden": ["garten", 5]})
    assert leg == {"scenes": {"night": "scene.nacht", "arrive": "", "cozy": ""}, "hours": 2, "hidden": ["garten"]}


# ------------------------------------------------------------------ Python-Teil mit Ersatz-Home-Assistant
class _State:
    def __init__(self, eid, state, attrs=None, lc=None):
        self.entity_id, self.state, self.attributes = eid, state, attrs or {}
        self.last_changed = datetime.fromtimestamp(lc or ts(2026, 11, 22, 18, 0), TZ)


class _States:
    def __init__(self):
        self.d: dict[str, _State] = {}

    def get(self, e):
        return self.d.get(e)

    def async_entity_ids(self, dom):
        return [e for e in self.d if e.startswith(dom + ".")]


class _Services:
    def __init__(self):
        self.calls = []

    async def async_call(self, dom, svc, data, blocking=False):
        self.calls.append((dom, svc, data))


class _Bus:
    def __init__(self):
        self.cb = None

    def async_listen(self, ev, cb):
        self.cb = cb
        return lambda: None


class _Hass:
    def __init__(self):
        self.states, self.services, self.bus, self.data = _States(), _Services(), _Bus(), {}


class _StoreX:
    DATA: dict = {}

    def __init__(self, key):
        self.key = key

    async def async_load(self):
        import json
        d = _StoreX.DATA.get(self.key)
        return json.loads(json.dumps(d)) if d is not None else None

    def async_delay_save(self, fn, delay=0):
        _StoreX.DATA[self.key] = fn()


class _Core:
    def __init__(self, hass):
        self.hass, self.cmds, self.provided = hass, {}, {}

    def store(self, v=1):
        return _StoreX("licht")

    def cmd(self, n, h):
        self.cmds[n] = h

    def on_unload(self, u):
        pass

    def every(self, s, cb):
        return lambda: None

    def provide(self, k, o):
        self.hass.data.setdefault("fenster_heizung", {})[k] = o

    def areas(self):
        return [{"id": "wohnen", "name": "Wohnzimmer", "floor": "eg", "icon": ""}]


NOW = [ts(2026, 11, 22, 19, 0)]


def _manager():
    """manager.py mit Ersatzmodulen laden (eigene Module, keine fremden Testdateien überschreiben)."""
    saved = {k: sys.modules.get(k) for k in ("homeassistant", "homeassistant.core", "homeassistant.util", "homeassistant.util.dt",
                                               "custom_components", "custom_components.fenster_heizung", "custom_components.fenster_heizung.addon_api",
                                               "custom_components.fenster_heizung.const", "licht_pkg", "licht_pkg.logic")}

    def stub(name, **a):
        m = types.ModuleType(name)
        m.__dict__.update(a)
        sys.modules[name] = m
        return m

    class AddonError(Exception):
        pass

    class SWAddon:
        def __init__(self, core):
            self.core, self.hass = core, core.hass

    stub("homeassistant"); stub("homeassistant.core", Event=object, callback=lambda f: f); stub("homeassistant.util")
    stub("homeassistant.util.dt", DEFAULT_TIME_ZONE=TZ, now=lambda: datetime.fromtimestamp(NOW[0], TZ),
         utc_from_timestamp=lambda t: datetime.fromtimestamp(t, ZoneInfo("UTC")))
    stub("custom_components"); stub("custom_components.fenster_heizung")
    stub("custom_components.fenster_heizung.addon_api", AddonError=AddonError, SWAddon=SWAddon)
    stub("custom_components.fenster_heizung.const", DOMAIN="fenster_heizung")
    pkg = stub("licht_pkg"); pkg.__path__ = [str(ROOT)]
    _load("licht_pkg.logic", ROOT / "logic.py", "licht_pkg")
    M = _load("licht_pkg.manager", ROOT / "manager.py", "licht_pkg")
    M.time = types.SimpleNamespace(time=lambda: NOW[0])
    for k, v in saved.items():  # Ersatzmodule wieder entfernen
        if v is None:
            sys.modules.pop(k, None)
        else:
            sys.modules[k] = v
    return M, AddonError


def _haus(H):
    S = H.states.d
    S["light.decke"] = _State("light.decke", "on", {"friendly_name": "Decke", "color_mode": "color_temp", "color_temp_kelvin": 2700, "brightness": 153}, ts(2026, 11, 22, 17, 0))
    S["light.steh"] = _State("light.steh", "on", {"friendly_name": "Stehlampe"}, ts(2026, 11, 22, 18, 30))
    S["light.bad"] = _State("light.bad", "off", {"friendly_name": "Bad"})
    S["light.wohnen"] = _State("light.wohnen", "on", {"friendly_name": "Wohnen (Gruppe)", "entity_id": ["light.decke", "light.steh"]})


def test_python_teil_sensoren_schalten_neustart():
    M, AddonError = _manager()
    _StoreX.DATA.clear()
    H = _Hass(); _haus(H)
    A = M.Addon(_Core(H))
    asyncio.run(A.async_setup())
    v = A.values()
    assert v["sensor"]["lampen_an"]["value"] == 2 and v["sensor"]["lampen_an"]["attrs"]["von"] == 3   # Gruppe zählt nicht
    assert v["sensor"]["laengste_an"]["value"] == 120 and v["sensor"]["laengste_an"]["attrs"]["lampe"] == "Decke"
    st = asyncio.run(A.core.cmds["get"]({"legacy": {"scenes": {"night": "scene.nacht"}, "hours": 4}}, True))
    assert st["groups"] == {"light.wohnen": ["light.decke", "light.steh"]} and st["legacy"] is True and A.legacy["hours"] == 4
    # Raum schalten: Gruppe passt genau
    r = asyncio.run(A.core.cmds["act"]({"a": "switch", "ids": ["light.steh", "light.decke"], "on": False}, False))
    assert r["via"] == ["light.wohnen"] and H.services.calls[-1] == ("light", "turn_off", {"entity_id": ["light.wohnen"]})
    asyncio.run(A.core.cmds["act"]({"a": "switch", "ids": ["light.bad", "light.unbekannt"], "on": True, "brightness_pct": 400}, False))
    assert H.services.calls[-1] == ("light", "turn_on", {"entity_id": ["light.bad"], "brightness_pct": 100})
    try:
        asyncio.run(A.core.cmds["set"]({"prefs": {"view": "list"}}, False)); assert False
    except AddonError:
        pass
    assert asyncio.run(A.core.cmds["set"]({"prefs": {"view": "list"}}, True))["prefs"]["view"] == "list"
    # Grundriss-Zuordnung (Build 4): setzen, „kein Bereich“, zurück auf automatisch
    st = asyncio.run(A.core.cmds["set"]({"pmap": {"r1": "wohnen", "r2": "-"}}, True))
    assert st["pmap"] == {"r1": "wohnen", "r2": "-"}
    st = asyncio.run(A.core.cmds["set"]({"pmap": {"r2": ""}}, True))
    assert st["pmap"] == {"r1": "wohnen"} and st["prefs"]["view"] == "list"
    # Ereignis: Decke geht aus
    NOW[0] = ts(2026, 11, 22, 19, 30)
    old, H.states.d["light.decke"] = H.states.d["light.decke"], _State("light.decke", "off")
    H.bus.cb(types.SimpleNamespace(data={"entity_id": "light.decke", "old_state": old, "new_state": H.states.d["light.decke"]}))
    assert "light.decke" not in A.burn.on and A.burn.today(NOW[0])["light.decke"] == 9000   # 17:00–19:30
    # Neustart nach 5 Min.: Stehlampe behält „an seit 18:30“
    asyncio.run(A.async_unload())
    NOW[0] = ts(2026, 11, 22, 19, 35)
    A2 = M.Addon(_Core(H)); asyncio.run(A2.async_setup())
    assert A2.burn.on["light.steh"] == ts(2026, 11, 22, 18, 30) and A2.prefs["view"] == "list" and A2.legacy["hours"] == 4
    assert A2.pmap == {"r1": "wohnen"}   # Zuordnung übersteht den Neustart
    assert round(A2.values()["sensor"]["licht_heute"]["value"], 2) == round((9000 + 65 * 60) / 3600, 2)


if __name__ == "__main__":
    n = 0
    for k, f in list(globals().items()):
        if k.startswith("test_") and callable(f):
            f(); n += 1
    print(f"{n} Tests ok")
