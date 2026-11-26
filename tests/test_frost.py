"""Tests für die Zusatzheizung bei Frost (pvlogic.py und heater.py) ohne Home Assistant.

Ausführen: python3 -m pytest tests/test_frost.py
Geprüft werden alle Start- und Stoppbedingungen, Netzgrenze, Preisgrenze, Pause und Tageslimit, Neustart,
Beenden, nicht erreichbare Geräte, Meldungen und dass die PV-Regel ohne Frost wie bisher arbeitet.
"""
from __future__ import annotations

import asyncio
import importlib.util
import pathlib
import sys
import types
from unittest import mock
from datetime import datetime, timedelta, timezone

ROOT = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung"
_ALT: dict = {}


def _stub(name: str, **attrs) -> types.ModuleType:
    _ALT.setdefault(name, sys.modules.get(name))
    m = types.ModuleType(name)
    for k, v in attrs.items():
        setattr(m, k, v)
    sys.modules[name] = m
    return m


def _exec(name: str, file: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / file)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod


class Clock:
    def __init__(self):
        self.t = datetime(2026, 12, 10, 8, 0, tzinfo=timezone.utc).timestamp()

    def now(self):
        return datetime.fromtimestamp(self.t, timezone.utc)


CLOCK = Clock()
PRICE = {"ct": 30.0}


def _load():
    for n in ("homeassistant", "homeassistant.helpers", "homeassistant.util"):
        _stub(n)
    _stub("homeassistant.const", EVENT_HOMEASSISTANT_STOP="homeassistant_stop")
    _stub("homeassistant.core", CALLBACK_TYPE=object, HomeAssistant=object)
    _stub("homeassistant.exceptions", HomeAssistantError=type("HomeAssistantError", (Exception,), {}))
    _stub("homeassistant.helpers.event", async_call_later=lambda *a: None, async_track_time_interval=lambda *a: None)
    dt = _stub("homeassistant.util.dt", now=CLOCK.now, utcnow=CLOCK.now)
    sys.modules["homeassistant.util"].dt = dt
    _stub("homeassistant.config_entries", ConfigEntryState=types.SimpleNamespace(LOADED="loaded"))
    _stub("fhfrost").__path__ = [str(ROOT)]
    _exec("fhfrost.const", "const.py")
    _stub("fhfrost.diag", diag_expect=lambda *a, **k: None, diag_log=lambda *a, **k: None)
    _stub("fhfrost.preisdienst", preis=lambda hass, sparte="strom": {"ct": PRICE["ct"]})
    logic = _exec("fhfrost.pvlogic", "pvlogic.py")
    heater = _exec("fhfrost.heater", "heater.py")
    heater.time = types.SimpleNamespace(time=lambda: CLOCK.t)
    for name, old in _ALT.items():  # andere Tests bekommen ihre eigenen Attrappen
        if name.startswith("homeassistant"):
            if old is None:
                sys.modules.pop(name, None)
            else:
                sys.modules[name] = old
    return logic, heater


L, H = _load()
_ENTRIES = types.SimpleNamespace(ConfigEntryState=types.SimpleNamespace(LOADED="loaded"))


def _go(coro):
    """Zur Laufzeit importiert heater.py ConfigEntryState: nur für diesen Aufruf bereitstellen."""
    with mock.patch.dict(sys.modules, {"homeassistant.config_entries": _ENTRIES}):
        asyncio.run(coro)


class State:
    def __init__(self, state, attrs=None, last=None):
        self.state, self.attributes = state, attrs or {}
        self.last_reported = last
        self.last_updated = last


class Hass:
    def __init__(self):
        self.s: dict[str, State] = {}
        self.calls: list[tuple] = []
        self.ignore: set[str] = set()  # Gerät meldet den neuen Zustand (noch) nicht
        self.states = types.SimpleNamespace(get=self.s.get)
        self.services = types.SimpleNamespace(async_call=self._call)
        self.rooms: list = []
        self.config_entries = types.SimpleNamespace(async_entries=lambda domain: self.rooms)
        self.data = {"fenster_heizung": {}}

    async def _call(self, domain, service, data, blocking=False):
        self.calls.append((domain, service, data.get("entity_id"), data.get("message")))
        eid = data.get("entity_id")
        if domain == "switch" and eid not in self.ignore:
            self.s[eid] = State("on" if service == "turn_on" else "off")

    def on(self, eid):
        return self.s[eid].state == "on"


class Gen:
    def __init__(self):
        self.data = {"pv": {"sensor": "", "sign": "export", "reserve": 200, "delay": 3, "minrun": 10},
                     "frost": {"watt": 2000, "price_on": False, "price": 40.0}}
        self.summer = False
        self.out = -5.0

    def outdoor(self):
        return self.out, False


class Tarif:
    src = "tibber"

    def __init__(self):
        self.ct = 30.0

    def active(self):
        return True

    def at(self, when=None):
        return self.ct


class Ctrl:
    def __init__(self, hass, key="wz", **cfg):
        self.hass = hass
        self.entry = types.SimpleNamespace(entry_id=key, title=key.upper())
        self.cfg = {"htr_on": "on", "htr_entity": f"switch.heizer_{key}", "htr_steps": [], "htr_watt": 2000, "htr_target": 22.0,
                    "htr_prio": 5, "htr_thermo": "off", "htr_mode": "frost", "htr_frost_ok": "on", "room_temp_sensor": f"sensor.raum_{key}",
                    "thermostats": [f"climate.{key}"], "htr_frost_from": "00:00:00", "htr_frost_to": "00:00:00", **cfg}
        self.active = False
        self.window = False
        self.away_temp = None
        self.off = False
        self.temp = 20.0
        self.fresh = True
        self.saves = 0
        self._store = types.SimpleNamespace(async_delay_save=lambda fn, delay=0: None)
        self.heater = H.HeaterRoom(self)
        self.thermo_calls: list[tuple] = []
        hass.s[self.cfg["htr_entity"]] = State("off")
        hass.s[f"climate.{key}"] = State("heat", {"temperature": 21, "hvac_modes": ["off", "heat"]})
        hass.rooms.append(types.SimpleNamespace(state="loaded", runtime_data=self))
        self.sensor()

    def sensor(self):
        if self.fresh:
            self.hass.s[self.cfg["room_temp_sensor"]] = State(str(self.temp), last=CLOCK.now())

    def sensor_temp(self, use=None):
        return self.temp

    def room_temperature(self, use="rt_heater"):
        return self.temp

    def _outdoor_temp(self):
        return None

    def window_open(self):
        return self.window

    def _heating_off(self):
        return self.off

    async def _save(self):
        self.saves += 1

    def _data(self):
        return {}

    def _signal(self):
        pass

    async def _call(self, service, eid, **data):
        self.thermo_calls.append((service, eid, data))
        st = self.hass.s[eid]
        if service == "set_hvac_mode":
            self.hass.s[eid] = State(data["hvac_mode"], st.attributes)

    async def _plan_apply_if_due(self):
        pass


def world(n=1, **cfg):
    CLOCK.t = datetime(2026, 12, 10, 8, 0, tzinfo=timezone.utc).timestamp()
    PRICE["ct"] = 30.0
    hass = Hass()
    gen = Gen()
    hass.data["fenster_heizung"]["general"] = gen
    rooms = [Ctrl(hass, key, **({**cfg, "htr_prio": i + 1})) for i, key in enumerate(["wz", "bad"][:n])]
    return hass, gen, H.PvManager(hass), rooms


def run_min(mgr, minutes, rooms):
    """So viele Minuten im 30-Sekunden-Takt regeln."""

    async def go():
        for _ in range(int(minutes * 2)):
            CLOCK.t += 30
            for r in rooms:
                r.sensor()
            await mgr._run()

    _go(go())


def started(**cfg):
    hass, gen, mgr, (r,) = world(**cfg)
    run_min(mgr, 21, [r])
    assert hass.on("switch.heizer_wz")
    return hass, gen, mgr, r


# ---- reine Logik --------------------------------------------------------------------------------------------------
F = {"out": 0.0, "target": 21.0, "wait": 1200, "max_run": 3600, "max_day": 8 * 3600}


def _step(st, now, **kw):
    a = {"outdoor": -5.0, "temp": 20.0, "blocked": None, "price_high": False, "minrun_s": 600, "day_s": 0}
    a.update(kw)
    return L.frost_step(F, st, now, **a)


def test_startbedingungen():
    st = L.frost_state()
    assert _step(st, 0) == ("frost_wartet", False, 1200)
    assert _step(st, 1199)[0] == "frost_wartet"
    assert _step(st, 1200) == ("frost", True, None)
    for kw, status in (({"outdoor": 0.0}, "frost_mild"), ({"temp": 20.6}, "frost_warm"), ({"temp": None}, "frost_sensor"),
                       ({"outdoor": None}, "frost_aussen"), ({"blocked": "fenster"}, "fenster"), ({"day_s": 8 * 3600}, "frost_limit")):
        s = {"cold": 0, "run": None, "pause": None}
        assert _step(s, 5000, **kw)[:2] == (status, False), kw
        assert s["run"] is None
    assert _step({"cold": 0, "run": None, "pause": None}, 5000, price_high=True)[:2] == ("frost_preis", False)
    assert _step({"cold": 0, "run": None, "pause": None}, 5000, temp=20.5)[:2] == ("frost", True)


def test_ende_erst_nach_mindestlaufzeit_stoerung_sofort():
    for kw, status in (({"temp": 21.0}, "frost_warm"), ({"outdoor": 1.0}, "frost_mild"), ({"price_high": True}, "frost_preis")):
        st = {"cold": 0, "run": 1000, "pause": None}
        assert _step(st, 1300, **kw)[:2] == ("frost", True), kw
        assert _step(st, 1600, **kw)[:2] == (status, False), kw
    st = {"cold": 0, "run": 1000, "pause": None}
    assert _step(st, 1100, outdoor=0.9)[1] is True  # 1 °C Spielraum
    assert _step(st, 1100, blocked="fenster")[:2] == ("fenster", False)


def test_pause_nach_laengster_laufzeit():
    st = {"cold": 0, "run": 0, "pause": None}
    assert _step(st, 3600)[:2] == ("frost_pause", False)
    assert _step(st, 3700) == ("frost_pause", False, 800)
    assert _step(st, 4500)[:2] == ("frost", True)  # ohne neue Wartezeit


def test_netzgrenze_nach_prioritaet():
    hs = [{"id": "b", "prio": 2, "steps": [800, 1200], "want": 2}, {"id": "a", "prio": 1, "steps": [1000], "want": 1}]
    assert L.frost_grid(hs, 2500) == {"a": 1, "b": 2}
    assert L.frost_grid(hs, 2000) == {"a": 1, "b": 1}
    assert L.frost_grid(hs, 1500) == {"a": 1, "b": 0}


# ---- Steuerung ----------------------------------------------------------------------------------------------------
def test_ohne_pv_startet_nach_wartezeit_und_zaehlt_netzstrom():
    hass, gen, mgr, (r,) = world()
    run_min(mgr, 19, [r])
    assert not hass.on("switch.heizer_wz") and r.heater.status == "frost_wartet"
    run_min(mgr, 2, [r])
    assert hass.on("switch.heizer_wz") and r.heater.status == "frost" and r.heater.frost_on
    run_min(mgr, 30, [r])
    a = r.heater.attrs()
    assert a["heute_pv_kwh"] == 0 and a["heute_kwh"] > 0.9 and abs(a["heute_kosten"] - a["heute_kwh"] * 0.30) < 0.02
    assert hass.s["climate.wz"].state == "heat" and not r.thermo_calls  # Heizkörper bleiben an
    assert a["frost"]["laeuft"] and 29 <= a["frost"]["heute_min"] <= 31


def test_sperren_schalten_sofort_ab():
    for attr, value, status in (("window", True, "fenster"), ("away_temp", 17.0, "frost_abwesend"), ("off", True, "frost_heizaus")):
        hass, gen, mgr, r = started()
        setattr(r, attr, value)
        run_min(mgr, 0.5, [r])
        assert not hass.on("switch.heizer_wz") and r.heater.status == status, attr
    hass, gen, mgr, r = started()
    gen.summer = True
    run_min(mgr, 0.5, [r])
    assert not hass.on("switch.heizer_wz") and r.heater.status == "frost_heizaus"
    hass, gen, mgr, r = started()
    r.heater.manual_on = False
    run_min(mgr, 0.5, [r])
    assert not hass.on("switch.heizer_wz") and r.heater.status == "aus"


def test_ohne_bestaetigung_nie():
    hass, gen, mgr, (r,) = world(htr_frost_ok="off")
    run_min(mgr, 40, [r])
    assert not hass.on("switch.heizer_wz") and r.heater.status == "frost_ok"


def test_zeitfenster():
    hass, gen, mgr, (r,) = world(htr_frost_from="09:00:00", htr_frost_to="22:00:00")
    run_min(mgr, 30, [r])
    assert r.heater.status == "zeit" and not hass.on("switch.heizer_wz")
    run_min(mgr, 51, [r])
    assert hass.on("switch.heizer_wz")


def test_ziel_und_mildes_wetter():
    hass, gen, mgr, r = started()
    r.temp = 21.2
    run_min(mgr, 5, [r])
    assert hass.on("switch.heizer_wz")  # Mindestlaufzeit
    run_min(mgr, 6, [r])
    assert not hass.on("switch.heizer_wz") and r.heater.status == "frost_warm"
    hass, gen, mgr, (r,) = world()
    gen.out = 2.0
    run_min(mgr, 40, [r])
    assert r.heater.status == "frost_mild" and not hass.on("switch.heizer_wz")


def test_pause_und_tageslimit():
    hass, gen, mgr, r = started(htr_frost_day=2)
    run_min(mgr, 60, [r])
    assert not hass.on("switch.heizer_wz") and r.heater.status == "frost_pause"
    run_min(mgr, 16, [r])
    assert hass.on("switch.heizer_wz")
    run_min(mgr, 70, [r])
    assert not hass.on("switch.heizer_wz") and r.heater.status == "frost_limit"
    assert 119 <= r.heater.frost_s / 60 <= 121


def test_wirkung_pruefen_meldet_einmal():
    hass, gen, mgr, r = started()
    run_min(mgr, 180, [r])
    msgs = [c for c in hass.calls if c[0] == "persistent_notification"]
    assert len(msgs) == 1 and "kaum wärmer" in msgs[0][3]


def test_sensor_seit_zwei_stunden_still():
    hass, gen, mgr, r = started(notify_service=["notify.handy"])
    r.fresh = False
    hass.s["sensor.raum_wz"] = State("20.0", last=CLOCK.now() - timedelta(hours=2, minutes=1))
    run_min(mgr, 0.5, [r])
    assert not hass.on("switch.heizer_wz") and r.heater.status == "frost_sensor"
    assert [c for c in hass.calls if c[:2] == ("notify", "handy") and "Raumsensor" in c[3]]


def test_preisgrenze_aus_modul_14():
    hass, gen, mgr, (r,) = world()
    tm = hass.data["fenster_heizung"]["tarif"] = Tarif()
    gen.data["frost"].update(price_on=True, price=35.0)
    tm.ct = 41.0
    run_min(mgr, 25, [r])
    assert r.heater.status == "frost_preis" and not hass.on("switch.heizer_wz")
    tm.ct = 35.0
    run_min(mgr, 0.5, [r])
    assert hass.on("switch.heizer_wz")
    tm.ct = 36.0
    run_min(mgr, 5, [r])
    assert hass.on("switch.heizer_wz")
    run_min(mgr, 6, [r])
    assert not hass.on("switch.heizer_wz")
    assert mgr.frost_info() == {"watt": 2000, "price_on": True, "price": 35.0, "tarif": True, "ct": 36.0, "teuer": True}


def test_preisgrenze_ohne_dynamischen_tarif_wirkt_nicht():
    hass, gen, mgr, (r,) = world()
    gen.data["frost"].update(price_on=True, price=1.0)
    run_min(mgr, 21, [r])
    assert hass.on("switch.heizer_wz")
    tm = hass.data["fenster_heizung"]["tarif"] = Tarif()
    tm.src = "fix"
    assert mgr.tarif_ct() is None and mgr.frost_info()["tarif"] is False


def test_netzgrenze_zwei_heizer():
    hass, gen, mgr, rooms = world(2)
    run_min(mgr, 22, rooms)
    assert hass.on("switch.heizer_wz") and not hass.on("switch.heizer_bad")
    assert rooms[1].heater.status == "frost_netz"
    gen.data["frost"]["watt"] = 4000
    run_min(mgr, 0.5, rooms)
    assert hass.on("switch.heizer_bad")


def test_von_hand_ausgeschaltet_gibt_pause():
    hass, gen, mgr, r = started()
    run_min(mgr, 3, [r])
    hass.s["switch.heizer_wz"] = State("off")
    run_min(mgr, 5, [r])
    assert not hass.on("switch.heizer_wz") and r.heater.status == "frost_pause"
    run_min(mgr, 12, [r])
    assert hass.on("switch.heizer_wz")


def test_traeges_geraet_wird_sicher_ausgeschaltet():
    hass, gen, mgr, r = started()
    hass.ignore.add("switch.heizer_wz")
    r.window = True
    run_min(mgr, 1, [r])
    assert hass.on("switch.heizer_wz")  # meldet noch an
    hass.ignore.clear()
    run_min(mgr, 2, [r])
    assert not hass.on("switch.heizer_wz")


def test_neustart_bewertet_sofort_neu():
    hass, gen, mgr, r = started()
    saved = r.heater.data()
    assert saved["frost_on"] == "switch.heizer_wz"
    for window, bleibt in ((True, False), (False, False)):  # nach dem Neustart gilt die Wartezeit neu
        hass.s["switch.heizer_wz"] = State("on")
        r.heater = H.HeaterRoom(r)
        r.heater.load(saved)
        r.window = window
        run_min(H.PvManager(hass), 0.5, [r])
        assert hass.on("switch.heizer_wz") is bleibt


def test_beenden_und_entladen_schalten_aus():
    hass, gen, mgr, r = started()
    _go(mgr._on_stop(None))
    assert not hass.on("switch.heizer_wz") and not r.heater.frost_on and r.heater.data()["frost_on"] is None
    hass, gen, mgr, r = started()
    r.cfg["htr_entity"] = "switch.anderer"  # Gerät geändert: das alte wird ausgeschaltet
    hass.s["switch.anderer"] = State("off")
    _go(r.heater.async_frost_off())
    assert not hass.on("switch.heizer_wz")


def test_nicht_erreichbar_meldet_und_bewertet_neu():
    hass, gen, mgr, r = started()
    hass.s["switch.heizer_wz"] = State("unavailable")
    run_min(mgr, 1, [r])
    assert [c for c in hass.calls if c[0] == "persistent_notification" and "nicht erreichbar" in c[3]]
    assert r.heater.data()["frost_on"] == "switch.heizer_wz"
    r.window = True
    hass.s["switch.heizer_wz"] = State("on")
    run_min(mgr, 0.5, [r])
    assert not hass.on("switch.heizer_wz")


# ---- PV zusammen mit Frost ----------------------------------------------------------------------------------------
def _surplus(hass, gen, watt):
    gen.data["pv"]["sensor"] = "sensor.netz"
    hass.s["sensor.netz"] = State(str(watt))


def test_nur_pv_wie_bisher():
    hass, gen, mgr, (r,) = world(htr_mode="pv")
    _surplus(hass, gen, 3000)
    run_min(mgr, 2.5, [r])
    assert not hass.on("switch.heizer_wz")
    run_min(mgr, 2, [r])
    assert hass.on("switch.heizer_wz") and r.heater.status == "pv" and not r.heater.frost_on
    assert hass.s["climate.wz"].state == "off"  # Thermostat ruht
    _surplus(hass, gen, -3000)
    run_min(mgr, 4, [r])
    assert hass.on("switch.heizer_wz")  # Mindestlaufzeit
    run_min(mgr, 8, [r])
    assert not hass.on("switch.heizer_wz") and r.heater.status == "wartet" and hass.s["climate.wz"].state == "heat"
    assert r.heater.attrs()["frost"] is None


def test_nur_pv_ohne_sensor_heizt_nie():
    hass, gen, mgr, (r,) = world(htr_mode="pv")
    run_min(mgr, 60, [r])
    assert not hass.on("switch.heizer_wz") and r.heater.status == "wartet"


def test_beides_pv_zuerst_frost_fuellt_die_luecke():
    hass, gen, mgr, (r,) = world(htr_mode="both")
    _surplus(hass, gen, 3000)
    run_min(mgr, 25, [r])
    assert hass.on("switch.heizer_wz") and r.heater.status == "pv" and r.heater.frost_s == 0
    assert hass.s["climate.wz"].state == "heat"  # bei Frost bleiben die Heizkörper an
    _surplus(hass, gen, -2000)
    run_min(mgr, 15, [r])
    assert hass.on("switch.heizer_wz") and r.heater.status == "frost" and r.heater.frost_s > 0


def test_beides_bei_mildem_wetter_ruhen_thermostate_wie_gewaehlt():
    hass, gen, mgr, (r,) = world(htr_mode="both")
    gen.out = 8.0
    _surplus(hass, gen, 3000)
    run_min(mgr, 5, [r])
    assert r.heater.status == "pv" and hass.s["climate.wz"].state == "off"
    gen.out = -3.0
    run_min(mgr, 0.5, [r])
    assert hass.s["climate.wz"].state == "heat"
