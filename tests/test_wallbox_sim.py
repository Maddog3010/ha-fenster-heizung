"""Regel-Simulator für Modul 8 (Build 10): ganze Ladeabläufe mit einer nachgebauten Wallbox, ohne Home Assistant.

Ausführen: python3 -m pytest tests  oder  python3 tests/test_wallbox_sim.py
Die Wallbox (go-e) wird nachgebaut, Home Assistant durch kleine Ersatzklassen ersetzt. Jeder Takt entspricht 10 Sekunden.
Geprüft werden: Modus beim Anstecken (je Fahrzeug, Gastfahrzeug, Karte nach dem Anstecken, Neustart), Befehls-Rückmeldung
am Ladelimit (kein „von Hand umgestellt“, Meldung nach drei Versuchen), veralteter Ladestand aus der Auto-Cloud,
offene Zugangskontrolle der go-e (Build 8) und das gespeicherte Protokoll.
"""
from __future__ import annotations

import asyncio
import importlib.util
import pathlib
import sys
import types
from datetime import datetime, timedelta, timezone

ROOT = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung"
CLOCK = [datetime(2026, 11, 21, 17, 0, tzinfo=timezone.utc)]
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

    async def async_save(self, data):
        self.saved = data


def _load():
    if "fh8sim.wallbox" in sys.modules:
        return sys.modules["fh8sim.wallbox"]
    for n in ("homeassistant", "homeassistant.helpers", "homeassistant.util", "homeassistant.config_entries"):
        _stub(n)
    sys.modules["homeassistant.config_entries"].ConfigEntry = object
    _stub("homeassistant.core", CALLBACK_TYPE=object, HomeAssistant=object)
    _stub("homeassistant.helpers.aiohttp_client", async_get_clientsession=lambda hass: None)
    _stub("homeassistant.helpers.event", async_track_time_interval=lambda *a, **k: (lambda: None))
    _stub("homeassistant.helpers.storage", Store=_Store)
    _stub("homeassistant.util.dt", now=lambda: CLOCK[0], utcnow=lambda: CLOCK[0], parse_datetime=lambda s: datetime.fromisoformat(str(s)))
    sys.modules["homeassistant.util"].dt = sys.modules["homeassistant.util.dt"]
    pkg = _stub("fh8sim")
    pkg.__path__ = [str(ROOT)]
    _stub("fh8sim.backup", SafeStore=_Store)
    out = {}
    try:
        for name in ("const", "geraete_calc", "wallbox_adapter", "wallbox_calc", "wallbox_plan", "wallbox", "diagnostics"):
            spec = importlib.util.spec_from_file_location(f"fh8sim.{name}", ROOT / f"{name}.py")
            mod = importlib.util.module_from_spec(spec)
            sys.modules[f"fh8sim.{name}"] = mod
            spec.loader.exec_module(mod)
            out[name] = mod
    finally:
        for n, old in _ALT.items():
            if old is None:
                sys.modules.pop(n, None)
            else:
                sys.modules[n] = old
    w = out["wallbox"]
    w.dt_util = types.SimpleNamespace(now=lambda: CLOCK[0], utcnow=lambda: CLOCK[0], parse_datetime=lambda s: datetime.fromisoformat(str(s)))
    w.time = types.SimpleNamespace(time=lambda: CLOCK[0].timestamp())
    w.diag_mod = out["diagnostics"]
    return w


W = _load()


class _State:
    def __init__(self, state, attrs=None):
        self.state, self.attributes = str(state), attrs or {}
        self.last_updated = self.last_reported = CLOCK[0]


class _States(dict):
    def get(self, k):  # noqa: D401 - wie hass.states.get
        return dict.get(self, k)

    def set(self, k, v, attrs=None):
        self[k] = _State(v, attrs)


class _Services:
    def __init__(self):
        self.calls = []

    def has_service(self, d, n):
        return True

    async def async_call(self, d, n, data, blocking=False, **kw):
        self.calls.append((d, n, data))


class _Bus:
    def __init__(self):
        self.fired = []

    def async_fire(self, ev, data):
        self.fired.append((ev, data))


class _Hass:
    def __init__(self):
        self.data, self.states, self.services, self.bus = {}, _States(), _Services(), _Bus()
        self.tasks = []

    def async_create_task(self, coro):
        self.tasks.append(coro)


class FakeGoe:
    """Nachgebaute go-e: car 1 frei, 2 lädt, 3 wartet, 4 fertig. ignore = Befehle, die nicht ankommen."""
    kind, rfid = "goe", True

    def __init__(self):
        self.car, self.frc, self.amp, self.psm, self.trx, self.acs = 1, 0, 16, 2, None, 1
        self.ignore: set[str] = set()
        self.sets: list[dict] = []

    async def read(self):
        on = self.car in (2, 3) and self.frc != 1
        if self.car in (2, 3):
            self.car = 2 if on else 3
        ph = 1 if self.psm == 1 else 3
        pw = self.amp * 230.0 * ph if self.car == 2 else 0.0
        info = {"car": self.car, "car_text": "", "amp": self.amp, "psm": self.psm, "frc": self.frc, "power": pw, "cur": self.amp, "phases": ph,
                "trx": self.trx, "cards": [], "acs": self.acs, "ctrl": True, "kind": "goe"}
        return {"info": info, "cur": {"frc": self.frc, "amp": self.amp, "psm": self.psm}}

    async def set(self, cmd, max_a):
        self.sets.append(dict(cmd))
        for k, v in cmd.items():
            if k not in self.ignore:
                setattr(self, k, v)

    def plug(self, card=None):
        self.car, self.trx = 3, card

    def unplug(self):
        self.car, self.trx = 1, None


def run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def make(vehicles=None, **cfg):
    hass = _Hass()
    m = W.WallboxManager(hass)
    base = {"ip": "192.168.1.45", "enabled": True, "mode": "pv", "vehicles": vehicles or [
        {"id": "v1", "name": "BYD", "ids": [4], "mode": "pv", "limit": 80, "plug": "pv", "ent": {"soc": "sensor.byd_soc"}, "cap": 80},
        {"id": "v2", "name": "Zoe", "ids": [5], "mode": "now", "limit": 90, "plug": "last"}],
        "defVeh": "v1", "notify": {"cmd": True, "off": True, "to": ["notify.handy"]}, "planOn": False}
    m.cfg = W.clean_wb({**base, **cfg})
    m.cfg["vs"] = W.SCHEMA
    box = FakeGoe()
    m._adapter = lambda: box
    hass.states.set("sensor.byd_soc", 50)
    return m, box, hass


def tick(m, n=1, sec=10):
    for _ in range(n):
        CLOCK[0] += timedelta(seconds=sec)
        run(m._run())
        for t in list(m.hass.tasks):
            run(t)
        m.hass.tasks.clear()


def veh(m, vid):
    return next(v for v in m.cfg["vehicles"] if v["id"] == vid)


# ---------- Modus beim Anstecken

def test_plug_mode_resets_vehicle_mode():
    m, box, _ = make()
    m.cfg["vehicles"][0]["mode"] = "now"  # gestern auf „Voll“ gestellt
    tick(m)
    box.plug(card=4)
    tick(m, 2)
    assert veh(m, "v1")["mode"] == "pv"
    assert m.plug_info and m.plug_info["mode"] == "pv" and m.plug_info["prev"] == "now"
    assert any("Einstellung beim Anstecken" in e["x"] and e["k"] == "card" for e in m.log)


def test_plug_mode_last_changes_nothing():
    m, box, _ = make()
    tick(m)
    box.plug(card=5)  # Zoe: „Wie zuletzt“
    tick(m, 2)
    assert veh(m, "v2")["mode"] == "now"
    assert not any("Einstellung beim Anstecken" in e["x"] for e in m.log)


def test_change_during_session_stays_until_unplug():
    m, box, _ = make()
    tick(m)
    box.plug(card=4)
    tick(m, 2)
    m.cfg["vehicles"][0]["mode"] = "now"  # während der Ladung auf „Voll“
    tick(m, 5)
    assert veh(m, "v1")["mode"] == "now"
    box.unplug()
    tick(m)
    box.plug(card=4)
    tick(m, 2)
    assert veh(m, "v1")["mode"] == "pv"


def test_card_after_plug_applies_when_vehicle_known():
    m, box, _ = make(lock=True)
    tick(m)
    box.plug(card=None)  # erst anstecken, Karte kommt später
    tick(m, 3)
    m.cfg["vehicles"][0]["mode"] = "now"
    box.trx = 4
    tick(m, 2)
    assert veh(m, "v1")["mode"] == "pv"


def test_restart_while_plugged_keeps_mode():
    m, box, _ = make()
    m.cfg["vehicles"][0]["mode"] = "now"
    box.plug(card=4)  # Home Assistant startet mit angestecktem Auto
    tick(m, 3)
    assert veh(m, "v1")["mode"] == "now"


def test_plug_mode_guest():
    m, box, _ = make(guest={"mode": "off", "limit": 70, "plug": "minpv"})
    tick(m)
    box.plug(card=9)  # unbekannte Karte = Gastfahrzeug
    tick(m, 2)
    assert m.cfg["guest"]["mode"] == "minpv"


def test_plug_mode_manual_guest_choice():
    m, box, _ = make(guest={"mode": "off", "limit": 70, "plug": "now"})
    tick(m)
    m._who_set = "guest"  # „Wer lädt gerade?“ vor dem Anstecken
    box.plug(card=4)
    tick(m, 2)
    assert m.cfg["guest"]["mode"] == "now" and veh(m, "v1")["mode"] == "pv"


def test_clean_keeps_plug_and_defaults_last():
    c = W.clean_wb({"vehicles": [{"id": "a", "name": "A", "plug": "now"}, {"id": "b", "name": "B", "plug": "quatsch"}, {"id": "c", "name": "C"}]})
    assert [v["plug"] for v in c["vehicles"]] == ["now", "last", "last"]
    assert c["guest"]["plug"] == "last" and c["socAge"] == 45 and c["notify"]["cmd"] is True


# ---------- Befehls-Rückmeldung

def test_command_not_arriving_is_not_manual_change_and_warns():
    m, box, hass = make(vehicles=[{"id": "v1", "name": "BYD", "ids": [4], "mode": "now", "limit": 80, "plug": "last", "ent": {"soc": "sensor.byd_soc"}, "cap": 80}])
    tick(m)
    box.plug(card=4)
    tick(m, 3)
    assert box.frc == 2 and box.car == 2
    box.ignore = {"frc"}  # „Laden aus“ kommt nicht an
    hass.states.set("sensor.byd_soc", 81)
    tick(m, 6)
    assert m.want.get("state") != "pausiert", "darf nicht als Handumstellung gelten"
    assert sum(1 for s in box.sets if s.get("frc") == 1) >= 3
    assert any(c[0] == "notify" and "reagiert nicht" in c[2]["title"] for c in hass.services.calls)
    assert m._cmd["fail"] == 1
    box.ignore = set()
    tick(m, 2)
    assert box.frc == 1 and m._pend is None
    assert any("jetzt übernommen" in e["x"] for e in m.log)


def test_command_confirmed_counts_ok():
    m, box, _ = make(vehicles=[{"id": "v1", "name": "BYD", "ids": [4], "mode": "now", "limit": 80, "plug": "last"}])
    tick(m)
    box.plug(card=4)
    tick(m, 3)
    assert m._cmd["ok"] >= 1 and m._cmd["fail"] == 0 and m._pend is None


def test_real_manual_change_still_pauses():
    m, box, _ = make(vehicles=[{"id": "v1", "name": "BYD", "ids": [4], "mode": "now", "limit": 80, "plug": "last"}])
    tick(m)
    box.plug(card=4)
    tick(m, 3)
    box.frc = 1  # jemand stoppt in der go-e-App
    tick(m, 2)
    assert m.want.get("state") == "pausiert"


def test_cmd_match():
    C = sys.modules["fh8sim.wallbox_calc"]
    assert C.cmd_match({"frc": 2, "amp": 10}, {"frc": 2, "amp": 10}, "goe")
    assert not C.cmd_match({"frc": 1}, {"frc": 2, "amp": 10}, "goe")
    assert C.cmd_match({"frc": 1, "amp": 6}, {"frc": 1, "amp": 16}, "goe")  # Strom bei „aus“ egal
    assert C.cmd_match({"frc": 0}, {"frc": 2}, "goe")  # neutral wird nicht geprüft
    assert C.cmd_match({"amp": 10}, {"amp": 10.4}, "ha") and not C.cmd_match({"amp": 10}, {"amp": 12}, "ha")
    assert C.cmd_match({"amp": 10}, {}, "ha")  # Wert unbekannt: gilt als übernommen


# ---------- Ladestand-Alter

def test_stale_soc_uses_estimate_for_limit():
    m, box, hass = make(vehicles=[{"id": "v1", "name": "BYD", "ids": [4], "mode": "now", "limit": 80, "plug": "last", "ent": {"soc": "sensor.byd_soc"}, "cap": 40}])
    hass.states.set("sensor.byd_soc", 74)
    tick(m)
    box.plug(card=4)
    tick(m, 2)
    # 11 kW, Sensor meldet sich 50 Minuten nicht: 74 % + ~9 kWh / 40 kWh = über 80 %
    tick(m, 300)
    assert "v1" in m.soc_est and m.soc_est["v1"]["sensor"] == 74
    assert m._soc() >= 80
    assert box.frc == 1, "Ladelimit muss mit der Schätzung greifen"


def test_fresh_soc_is_used_as_is():
    m, box, hass = make(vehicles=[{"id": "v1", "name": "BYD", "ids": [4], "mode": "now", "limit": 80, "plug": "last", "ent": {"soc": "sensor.byd_soc"}, "cap": 40}])
    hass.states.set("sensor.byd_soc", 60)
    tick(m)
    box.plug(card=4)
    tick(m, 30)
    hass.states.set("sensor.byd_soc", 61)  # frischer Wert
    tick(m)
    assert m._soc() == 61 and "v1" not in m.soc_est


def test_soc_age_off():
    m, box, hass = make(vehicles=[{"id": "v1", "name": "BYD", "ids": [4], "mode": "now", "limit": 80, "plug": "last", "ent": {"soc": "sensor.byd_soc"}, "cap": 40}], socAge=0)
    hass.states.set("sensor.byd_soc", 74)
    tick(m)
    box.plug(card=4)
    tick(m, 300)
    assert m._soc() == 74


def test_soc_guess():
    C = sys.modules["fh8sim.wallbox_calc"]
    assert C.soc_guess(50, 8, 80) == 60.0 and C.soc_guess(98, 10, 50) == 100.0 and C.soc_guess(None, 5, 50) is None


# ---------- schwere Fehler früherer Builds

def test_build8_open_access_still_limits():
    m, box, hass = make(vehicles=[{"id": "v1", "name": "BYD", "ids": [4], "mode": "now", "limit": 65, "plug": "last", "ent": {"soc": "sensor.byd_soc"}, "cap": 80}], lock=True)
    box.acs = 0  # Zugangskontrolle in der go-e-App offen
    tick(m)
    box.car, box.trx, box.frc = 2, 0, 0  # lädt ohne Karte
    hass.states.set("sensor.byd_soc", 66)
    tick(m, 3)
    assert m.lock_open and box.frc == 1


def test_unplug_clears_pending_and_flag():
    m, box, _ = make()
    tick(m)
    box.plug(card=4)
    tick(m)
    box.ignore = {"frc", "amp"}
    tick(m, 2)
    box.unplug()
    tick(m)
    assert m._pend is None and not m._plug_new


# ---------- Protokoll und Diagnose

def test_log_persisted_with_kind_and_loaded():
    m, box, _ = make()
    tick(m)
    box.plug(card=4)
    tick(m, 3)
    saved = m._log_store.saved
    assert saved and all("k" in e for e in saved)
    m2, _, _ = make()
    m2._log_store.data = saved + [{"t": "2026-11-20T10:00:00", "x": "Karte 4 erkannt."}]
    m2._store.data, m2._st_store.data = m.cfg, None
    m2.hass.data = {}
    run(m2.async_start())
    assert len(m2.log) == len(saved) + 1
    assert W._log_kind("Wallbox nicht erreichbar: x") == "err" and W._log_kind("Karte 4 erkannt.") == "card"


def test_diagnostics_redacts():
    m, box, _ = make(vehicles=[{"id": "v1", "name": "BYD", "ids": [4], "person": "person.sandra", "dep": {"cal": "calendar.arbeit"}}], pdf={"name": "Max Muster"})
    tick(m)
    d = W.diag_mod.wallbox_diag(m)
    e = d["einstellungen"]
    assert e["ip"] == W.diag_mod.REDACT and e["notify"]["to"] == [W.diag_mod.REDACT] and e["pdf"]["name"] == W.diag_mod.REDACT
    assert e["vehicles"][0]["person"] == W.diag_mod.REDACT and e["vehicles"][0]["dep"]["cal"] == W.diag_mod.REDACT
    assert m.cfg["ip"] == "192.168.1.45", "die Diagnose darf die Einstellungen nicht verändern"
    assert W.diag_mod.wallbox_diag(None) == {"eingerichtet": False}


# ---------- Sichern und Wiederherstellen (A5)

def test_backup_roundtrip_settings_and_stats():
    """Was gesichert wird (JSON), kommt beim Wiederherstellen unverändert zurück – inklusive laufender Ladung."""
    import json
    P = sys.modules["fh8sim.wallbox_plan"]
    m, box, hass = make(guest={"mode": "pv", "limit": 70, "plug": "now"}, socAge=30, guard={"on": True, "maxA": 40})
    tick(m)
    box.plug(card=5)  # Zoe, Modus „Voll“
    tick(m, 40)  # lädt, Statistik und offene Ladung entstehen
    cfg2 = W.clean_wb(json.loads(json.dumps(m.cfg)))
    assert cfg2 == m.cfg
    st = m._st
    assert st["open"] is not None and st["days"]
    st2 = P.clean_stats(json.loads(json.dumps(st)))
    assert st2["open"]["kwh"] == st["open"]["kwh"] and st2["days"] == st["days"] and st2["sessions"] == st["sessions"]


if __name__ == "__main__":
    for k, f in list(globals().items()):
        if k.startswith("test_"):
            f()
            print("ok", k)
