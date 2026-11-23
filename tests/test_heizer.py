"""Tests für die Geräteliste der Elektroheizer (heizer.py, Elektroheizer 2.0 Build 1) ohne Home Assistant.

Ausführen: python3 -m pytest tests  oder  python3 tests/test_heizer.py
Geprüft werden Übernahme alter Räume (an, aus mit Resten, ohne Heizer), Abgleich mit den Raum-Feldern (ändern,
ausschalten, wieder einschalten mit gleicher ID), gelöschte Räume, Papierkorb (30 Tage, höchstens 20),
Prüfen des Geräts (doppelt, Thermostat, falsche Art), kaputte gespeicherte Einträge und die Felder für das Dashboard.
"""
from __future__ import annotations

import asyncio
import importlib.util
import pathlib
import sys
import types

ROOT = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung"
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


class _Reg:
    def __init__(self):
        self.ents = {}
        self.removed = []

    def async_get_entity_id(self, dom, plat, uid):
        return self.ents.get(uid)

    def async_remove(self, eid):
        self.removed.append(eid)


REG = _Reg()


def _load():
    if "fh_heizer" in sys.modules:
        return sys.modules["fh_heizer"]
    for n in ("homeassistant", "homeassistant.helpers"):
        _stub(n)
    _stub("homeassistant.helpers.entity_registry", async_get=lambda hass: REG)
    sys.modules["homeassistant.helpers"].entity_registry = sys.modules["homeassistant.helpers.entity_registry"]
    _stub("homeassistant.config_entries", ConfigEntryState=types.SimpleNamespace(LOADED="loaded"))
    _stub("fhpkg").__path__ = [str(ROOT)]
    _stub("fhpkg.backup", SafeStore=_Store)
    _stub("fhpkg.const", DOMAIN="fenster_heizung", CONF_THERMOSTATS="thermostats")
    spec = importlib.util.spec_from_file_location("fhpkg.heizer", ROOT / "heizer.py")
    mod = importlib.util.module_from_spec(spec)
    sys.modules["fhpkg.heizer"] = mod
    spec.loader.exec_module(mod)
    sys.modules["fh_heizer"] = mod
    return mod


H = _load()
run = asyncio.run
NOW = 1_800_000_000.0


def _on(entity="switch.oelradiator", **kw):
    return {"htr_on": "on", "htr_entity": entity, "htr_steps": [800, 1200, 2000], "htr_target": 21.0, **kw}


def test_sync_adds_updates_and_trashes():
    st = H.empty_state()
    assert H.sync_room(st, "r1", _on(), NOW, name_of=lambda e: "Ölradiator") == "added"
    h = st["heaters"][0]
    assert h["name"] == "Ölradiator" and h["room"] == "r1" and h["cfg"]["htr_steps"] == [800, 1200, 2000]
    assert H.sync_room(st, "r1", _on(), NOW) is None  # nichts geändert
    assert H.sync_room(st, "r1", _on(htr_target=19.5), NOW) == "updated"
    assert st["heaters"][0]["cfg"]["htr_target"] == 19.5
    assert H.sync_room(st, "r1", {**_on(), "htr_on": "off"}, NOW, room_name="Büro") == "trashed"
    assert st["heaters"] == [] and st["trash"][0]["reason"] == "off" and st["trash"][0]["room_name"] == "Büro"


def test_reenable_same_device_keeps_id_and_name():
    st = H.empty_state()
    H.sync_room(st, "r1", _on(), NOW, name_of=lambda e: "Mein Heizer")
    hid = st["heaters"][0]["id"]
    H.sync_room(st, "r1", {**_on(), "htr_on": "off"}, NOW + 10)
    assert H.sync_room(st, "r1", _on(), NOW + 20, name_of=lambda e: "anders") == "added"
    assert st["heaters"][0]["id"] == hid and st["heaters"][0]["name"] == "Mein Heizer" and st["trash"] == []
    # anderes Gerät im Raum: neue ID
    H.sync_room(st, "r1", {**_on(), "htr_on": "off"}, NOW + 30)
    H.sync_room(st, "r1", _on("climate.luefter"), NOW + 40)
    assert st["heaters"][0]["id"] != hid and len(st["trash"]) == 1


def test_migration_moves_leftovers_to_trash_only_once():
    st = H.empty_state()
    off = {"htr_on": "off", "htr_entity": "switch.alt", "htr_watt": 900}
    assert H.sync_room(st, "r2", off, NOW, migrate=True, room_name="Bad") == "migrated_off"
    assert st["trash"][0]["reason"] == "migrated" and st["trash"][0]["cfg"]["htr_watt"] == 900
    assert H.sync_room(st, "r2", off, NOW) is None  # später nicht noch einmal
    assert H.sync_room(st, "r3", {"htr_on": "off"}, NOW, migrate=True) is None  # Raum ohne Heizer


def test_missing_rooms_and_trash_expiry():
    st = H.empty_state()
    H.sync_room(st, "r1", _on(), NOW)
    H.sync_room(st, "r2", _on("switch.b"), NOW)
    assert len(H.drop_missing_rooms(st, {"r1"}, NOW)) == 1
    assert [h["room"] for h in st["heaters"]] == ["r1"] and st["trash"][0]["reason"] == "room_deleted"
    assert not H.expire_trash(st, NOW + 29 * 86400)
    assert H.expire_trash(st, NOW + 31 * 86400) and st["trash"] == []
    for i in range(25):
        st["trash"].append({"id": f"h{i}", "room": "x", "cfg": {}, "removed": NOW + i})
    H.expire_trash(st, NOW + 30)
    assert len(st["trash"]) == H.TRASH_MAX and st["trash"][0]["id"] == "h24"


def test_check_entity():
    st = H.empty_state()
    H.sync_room(st, "r1", _on(), NOW, name_of=lambda e: "Ölradiator")
    ths = {"r1": ["climate.bad"], "r2": ["climate.buero"]}
    assert "Ölradiator" in H.check_entity(st, "switch.oelradiator", "r2", ths)
    assert H.check_entity(st, "switch.oelradiator", "r1", ths, skip_id=st["heaters"][0]["id"]) is None
    assert "dieses Raums" in H.check_entity(st, "climate.bad", "r1", ths)
    assert "eines Raums" in H.check_entity(st, "climate.buero", "r1", ths)
    assert "Nur Schalter" in H.check_entity(st, "light.lampe", "r1", ths)
    assert H.check_entity(st, "", "r1", ths)


def test_clean_state_drops_broken_entries():
    raw = {"migrated": 1, "heaters": [
        {"id": "h1", "room": "r1", "name": "  A  ", "cfg": {"htr_entity": "switch.a"}},
        {"id": "h1", "room": "r2"},  # doppelte ID
        {"id": "böse", "room": "r3"},
        {"id": "h2"},  # ohne Raum
        "kaputt",
    ], "trash": [{"id": "h3", "room": "r9", "removed": NOW, "stats": {"kwh": 1}}]}
    st = H.clean_state(raw)
    assert st["migrated"] is True and [h["id"] for h in st["heaters"]] == ["h1"]
    assert st["heaters"][0]["name"] == "A" and st["heaters"][0]["cfg"]["htr_auto"] == "on"
    assert st["trash"][0]["stats"] == {"kwh": 1}
    assert H.clean_state(None) == H.empty_state()


def test_public_and_to_options():
    st = H.empty_state()
    H.sync_room(st, "r1", _on(htr_from="08:00:00", htr_to="18:00:00"), NOW)
    p = H.public(st["heaters"][0])
    assert p["entity"] == "switch.oelradiator" and p["steps"] == [800, 1200, 2000] and p["from"] == "08:00:00"
    assert H.to_options({"entity": "switch.x", "auto": False, "target": 20, "unknown": 1}) == {
        "htr_entity": "switch.x", "htr_auto": "off", "htr_target": 20}
    assert H.clean_name("   ") == "Elektroheizer" and len(H.clean_name("x" * 99)) == H.NAME_MAX


class _Entry:
    def __init__(self, eid, title, options):
        self.entry_id, self.title, self.options, self.data = eid, title, options, {}
        self.domain, self.state, self.runtime_data = "fenster_heizung", "loaded", None


class _Hass:
    def __init__(self, entries):
        self._e = entries
        self.config_entries = types.SimpleNamespace(
            async_entries=lambda dom: list(self._e), async_get_entry=lambda eid: next((e for e in self._e if e.entry_id == eid), None))
        self.states = types.SimpleNamespace(get=lambda eid: types.SimpleNamespace(attributes={"friendly_name": "Heizlüfter Bad"}) if eid == "climate.luefter" else None)


def test_manager_start_migrates_once_and_drops_switch():
    er = types.ModuleType("homeassistant.helpers.entity_registry")
    er.async_get = lambda hass: REG
    old = {n: sys.modules.get(n) for n in ("homeassistant", "homeassistant.helpers", "homeassistant.helpers.entity_registry", "homeassistant.config_entries")}
    sys.modules["homeassistant.helpers.entity_registry"] = er
    sys.modules.setdefault("homeassistant", types.ModuleType("homeassistant"))
    sys.modules.setdefault("homeassistant.helpers", types.ModuleType("homeassistant.helpers")).entity_registry = er
    try:
        _manager_case()
    finally:
        for n, mod in old.items():
            if mod is None:
                sys.modules.pop(n, None)
            else:
                sys.modules[n] = mod


def _manager_case():
    REG.ents = {"r2_heater_enabled": "switch.bad_elektroheizer_aktiv"}
    REG.removed = []
    entries = [_Entry("r1", "Büro", _on()), _Entry("r2", "Bad", {"htr_on": "off", "htr_entity": "climate.luefter"}), _Entry("r3", "Flur", {})]
    m = H.HeizerManager(_Hass(entries))
    run(m.async_start())
    saved = m._store.saved
    assert saved["migrated"] is True and len(saved["heaters"]) == 1 and saved["heaters"][0]["name"] == "Oelradiator"
    assert saved["trash"][0]["name"] == "Heizlüfter Bad" and saved["trash"][0]["reason"] == "migrated"
    # zweiter Start: nichts Neues, Heizer im Büro ausgeschaltet -> Papierkorb und Schalter weg
    entries[0].options = {**_on(), "htr_on": "off"}
    REG.ents["r1_heater_enabled"] = "switch.buero_elektroheizer_aktiv"
    m2 = H.HeizerManager(_Hass(entries))
    m2._store.data = saved
    run(m2.async_start())
    assert m2.st["heaters"] == [] and len(m2.st["trash"]) == 2
    assert REG.removed == ["switch.buero_elektroheizer_aktiv"]


class _Heater:
    def __init__(self):
        self.manual_on, self.released, self.stats = True, 0, {"kwh": 1.5, "history": {"2026-11-22": [2.0, 1.8]}}

    async def release(self):
        self.released += 1

    def stats_data(self):
        return dict(self.stats)

    def reset_stats(self):
        self.stats = {}

    def load_stats(self, raw):
        self.stats = {k: v for k, v in raw.items() if k != "manual_on"}
        self.manual_on = raw.get("manual_on") is not False

    async def async_set_manual(self, on):
        self.manual_on = on


class _Ctrl:
    def __init__(self):
        self.heater = _Heater()

    async def _save(self):
        pass

    def _signal(self):
        pass


def test_manager_move_carries_stats_and_pause():
    REG.ents, REG.removed = {"r1_heater_enabled": "switch.buero_aktiv"}, []
    er = types.ModuleType("homeassistant.helpers.entity_registry")
    er.async_get = lambda hass: REG
    old = {n: sys.modules.get(n) for n in ("homeassistant.helpers.entity_registry", "homeassistant.config_entries", "fhpkg.api", "fhpkg.options")}
    sys.modules["homeassistant.helpers.entity_registry"] = er
    sys.modules.setdefault("homeassistant.helpers", types.ModuleType("homeassistant.helpers")).entity_registry = er
    sys.modules["homeassistant.config_entries"] = types.SimpleNamespace(ConfigEntryState=types.SimpleNamespace(LOADED="loaded"))
    sys.modules["fhpkg.api"] = types.SimpleNamespace(_current_options=lambda e: dict(e.options))
    sys.modules["fhpkg.options"] = types.SimpleNamespace(clean_options=lambda raw: dict(raw))
    try:
        e1, e2 = _Entry("r1", "Büro", _on()), _Entry("r2", "Schlafzimmer", {"thermostats": ["climate.schlaf"]})
        e1.runtime_data, e2.runtime_data = _Ctrl(), _Ctrl()
        hass = _Hass([e1, e2])
        hass.config_entries.async_update_entry = lambda e, options: setattr(e, "options", options)
        m = H.HeizerManager(hass)
        run(m.async_start())
        hid = m.st["heaters"][0]["id"]
        run(m.async_update(hid, {"paused": True}))
        assert e1.runtime_data.heater.manual_on is False
        run(m.async_update(hid, {"room": "r2", "target": 19.0}))
        assert e1.runtime_data.heater.released == 1 and e1.runtime_data.heater.stats == {}
        assert e1.options["htr_on"] == "off" and e1.options["htr_entity"] is None
        assert e2.options["htr_on"] == "on" and e2.options["htr_target"] == 19.0
        assert REG.removed == ["switch.buero_aktiv"]
        run(m.async_sync_room(e1))
        run(m.async_sync_room(e2))  # nach dem Neuladen des neuen Raums
        h2 = e2.runtime_data.heater
        assert h2.stats["kwh"] == 1.5 and h2.manual_on is False and "move" not in m.st["heaters"][0]
        assert m.st["heaters"][0]["room"] == "r2" and m.st["trash"] == []
        try:
            run(m.async_move(hid, "r2"))
            raise AssertionError("gleicher Raum")
        except ValueError:
            pass
    finally:
        for n, mod in old.items():
            if mod is None:
                sys.modules.pop(n, None)
            else:
                sys.modules[n] = mod


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
    print("ok")
