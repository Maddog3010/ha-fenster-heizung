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
from datetime import datetime, timedelta, timezone

ROOT = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung"
NOW = [datetime(2026, 11, 17, 19, 0, tzinfo=timezone.utc)]
DAY = 86400


_ALT: dict = {}


def _stub(name: str, **attrs) -> types.ModuleType:
    """Eigenes Ersatzmodul, das nach dem Laden wieder verschwindet (sonst stören sich die Testdateien gegenseitig)."""
    _ALT.setdefault(name, sys.modules.get(name))
    m = types.ModuleType(name)
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
    _stub("homeassistant.helpers.dispatcher", async_dispatcher_send=lambda *a, **k: None)
    _stub("homeassistant.util.dt", now=lambda: NOW[0], utcnow=lambda: NOW[0], parse_datetime=lambda s: datetime.fromisoformat(str(s).replace("Z", "+00:00")))
    sys.modules["homeassistant.util"].dt = sys.modules["homeassistant.util.dt"]
    _stub("fhpkg").__path__ = [str(ROOT)]
    _stub("fhpkg.backup", SafeStore=_Store)
    _stub("fhpkg.const", DOMAIN="fenster_heizung")
    spec = importlib.util.spec_from_file_location("fhpkg.sicherheit", ROOT / "sicherheit.py")
    mod = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(mod)
    finally:
        for n, old in _ALT.items():
            if old is None:
                sys.modules.pop(n, None)
            else:
                sys.modules[n] = old
    sys.modules["fh_sicherheit"] = mod
    return mod


S = _load()
# eigene Uhr: andere Testdateien tauschen die Funktionen im gemeinsamen Ersatzmodul von homeassistant.util.dt aus
S.dt_util = types.SimpleNamespace(now=lambda: NOW[0], utcnow=lambda: NOW[0], parse_datetime=lambda s: datetime.fromisoformat(str(s).replace("Z", "+00:00")))


def hist(*pairs):
    return [[d * DAY, b] for d, b in pairs]


class _Bus:
    def __init__(self):
        self.handlers = {}

    def async_listen(self, ev, fn):
        self.handlers[ev] = fn
        return lambda: None


class _Bus2(_Bus):
    def __init__(self):
        super().__init__()
        self.fired = []

    def async_fire(self, ev, data):
        self.fired.append((ev, data))


class _States:
    def __init__(self):
        self.d = {}

    def get(self, e):
        return self.d.get(e)

    def async_entity_ids(self, dom):
        return []


class _Services:
    def __init__(self):
        self.calls = []

    def has_service(self, dom, name):
        return True

    async def async_call(self, dom, svc, data, blocking=False):
        self.calls.append((dom, svc, data))


class _Hass:
    def __init__(self):
        self.bus, self.tasks = _Bus2(), []
        self.data = {}
        self.states, self.services = _States(), _Services()

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
    assert on(_Ev("binary_sensor.rauch", _St("off"), _St("on"))) == 2  # Ende: sofort prüfen (Test per Testknopf wird so erkannt)
    assert on(_Ev("binary_sensor.rauch", _St("unavailable"), _St("off"))) == 3  # Ausfall
    assert on(_Ev("binary_sensor.rauch", _St("off"), _St("unavailable"))) == 4  # Rückkehr
    assert on(_Ev("binary_sensor.tuer", _St("on", "door"))) == 4  # kein Melder
    m._known.add("binary_sensor.eigener")
    assert on(_Ev("binary_sensor.eigener", _St("unavailable", None), _St("off", None))) == 5  # von Hand hinzugefügt, ohne Geräteklasse
    m2, h2 = mgr(wm_on=False)
    m2._on_state(_Ev("binary_sensor.rauch", _St("on")))
    assert not h2.tasks  # Modul aus


# ---------------------------------------------------------------- v0.8: Ausgeschaltet, Stufen, Verstanden
def _det(h, eid="binary_sensor.rauch", state="on", dc="smoke", name="Rauchmelder Küche"):
    st = _St(state, dc)
    st.attributes["friendly_name"] = name
    h.states.d[eid] = st
    return st


def _snap_stub(m):
    m.snapshot = lambda: asyncio.sleep(0, {})
    m._known = {"binary_sensor.rauch", "binary_sensor.gas"}


def test_standard_und_grenzen_v08():
    c = S.default_cfg()
    assert c["stages"]["s2"]["on"] and not c["stages"]["s3"]["on"] and not c["stages"]["s4"]["on"]  # Vorgabe: Stufe 1 und 2
    assert c["offask"] == {"mode": "ask", "days": 7}
    d = S.clean_cfg({"stages": {"s2": {"on": True, "sec": 1}, "s3": {"on": True, "sec": 99999}}, "offask": {"mode": "x", "days": 500},
                     "tts": {"player": "media_player.kueche", "engine": "light.x"}, "contact": {"to": "notify.nachbar"},
                     "acts": [{"id": "a1", "kind": "smoke", "ent": "light.flur", "do": "on", "st": 9}]})
    assert d["stages"]["s2"]["sec"] == 5 and d["stages"]["s3"]["sec"] == 900 and d["offask"] == {"mode": "ask", "days": 60}
    assert d["tts"] == {"player": "media_player.kueche", "engine": ""} and d["contact"]["to"] == "notify.nachbar"
    assert d["acts"][0]["st"] == 4
    assert S.clean_cfg({"acts": [{"id": "a1", "kind": "smoke", "ent": "light.flur", "do": "on"}]})["acts"][0]["st"] == 1


def test_ausschalten_und_einschalten():
    m, h = mgr()
    _snap_stub(m)
    _det(h, "binary_sensor.gas", "unavailable", "gas", "Gasmelder")
    asyncio.run(m.async_pause("binary_sensor.gas", 0))
    assert m.is_paused("binary_sensor.gas") and m.paused["binary_sensor.gas"]["was_off"] is True
    asyncio.run(m.async_resume("binary_sensor.gas"))
    assert not m.is_paused("binary_sensor.gas") and "binary_sensor.gas" not in m.paused
    asyncio.run(m.async_pause("binary_sensor.gas", 7))
    assert m.is_paused("binary_sensor.gas")
    NOW[0] += timedelta(days=8)
    try:
        assert not m.is_paused("binary_sensor.gas")  # Zeit abgelaufen
    finally:
        NOW[0] -= timedelta(days=8)
    asyncio.run(m.async_pause("binary_sensor.unbekannt", 0))
    assert "binary_sensor.unbekannt" not in m.paused  # nur erkannte Melder


def test_weiter_warnen_merkt_die_antwort():
    m, h = mgr()
    _snap_stub(m)
    m.asked["binary_sensor.gas"] = "ask"
    asyncio.run(m.async_resume("binary_sensor.gas", True))
    assert m.asked["binary_sensor.gas"] == "warn"


def test_verstanden_haelt_stufen_an_und_merkt_fehlalarm():
    m, h = mgr()
    _snap_stub(m)
    _det(h)
    m.cfg["notify"]["to"] = ["notify.handy"]
    m.st["binary_sensor.rauch"] = {"a": True, "since": "x", "off_since": 0.0, "rep": 0.0, "stage": 1, "t0": 0.0, "ack": "", "why": ""}
    asyncio.run(m.async_ack("", "Toast", "Handy"))
    s = m.st["binary_sensor.rauch"]
    assert s["ack"] and s["why"] == "Toast"
    assert m.fa["binary_sensor.rauch"][0]["why"] == "Toast"
    assert any(c[2].get("message") == "clear_notification" for c in h.services.calls)  # Mitteilung wird entfernt
    assert any(e[1]["art"] == "verstanden" and e[1]["fehlalarm"] == "Toast" for e in h.bus.fired)
    n = len(h.services.calls)
    asyncio.run(m.async_ack("", "", "Handy"))  # zweites Mal: nichts mehr offen
    assert len(h.services.calls) == n


def test_stufen_laufen_der_zeit_nach_und_enden_mit_verstanden():
    m, h = mgr()
    _snap_stub(m)
    _det(h)
    m.cfg["stages"]["s3"]["on"] = True
    m.cfg["notify"]["to"] = ["notify.handy"]
    m.cfg["tts"] = {"player": "media_player.kueche", "engine": "tts.cloud"}
    h.states.d["tts.cloud"] = _St("unknown", None)
    m.cfg["acts"] = [{"id": "l2", "kind": "smoke", "ent": "light.flur", "do": "on", "st": 2}, {"id": "l1", "kind": "smoke", "ent": "light.bad", "do": "on", "st": 1}]
    h.states.d["light.flur"], h.states.d["light.bad"] = _St("off", None), _St("off", None)
    m.st["binary_sensor.rauch"] = {"a": True, "since": "x", "off_since": 0.0, "rep": 0.0, "stage": 1, "t0": 1000.0, "ack": "", "why": ""}
    asyncio.run(m.stages_tick(1005.0))
    assert m.st["binary_sensor.rauch"]["stage"] == 1  # noch nicht
    asyncio.run(m.stages_tick(1011.0))
    assert m.st["binary_sensor.rauch"]["stage"] == 2
    assert [c[2]["entity_id"] for c in h.services.calls if c[0] == "light"] == ["light.flur"]  # nur die Stufe-2-Aktion
    asyncio.run(m.stages_tick(1070.0))
    assert m.st["binary_sensor.rauch"]["stage"] == 3
    assert any(c[0] == "tts" and c[1] == "speak" for c in h.services.calls)  # Durchsage
    assert any(c[0] == "notify" and "nicht quittiert" in c[2].get("title", "") for c in h.services.calls)
    asyncio.run(m.async_ack("", "", "Panel"))
    k = len(h.services.calls)
    asyncio.run(m.stages_tick(5000.0))  # quittiert: keine Stufe 4 mehr
    assert m.st["binary_sensor.rauch"]["stage"] == 3 and len(h.services.calls) == k


def test_stufe4_meldet_kontaktperson_und_wiederholt():
    m, h = mgr()
    _snap_stub(m)
    _det(h)
    m.cfg["stages"]["s4"]["on"] = True
    m.cfg["contact"]["to"] = "notify.nachbar"
    m.st["binary_sensor.rauch"] = {"a": True, "since": "x", "off_since": 0.0, "rep": 0.0, "stage": 1, "t0": 1000.0, "ack": "", "why": ""}
    asyncio.run(m.stages_tick(1400.0))
    to = lambda: [c for c in h.services.calls if c[0] == "notify" and c[1] == "nachbar"]  # noqa: E731
    assert m.st["binary_sensor.rauch"]["stage"] == 4 and len(to()) == 1
    assert any(a.get("uri") == "tel:112" for a in to()[0][2]["data"]["actions"])  # 112-Knopf
    asyncio.run(m.stages_tick(1450.0))
    assert len(to()) == 1  # noch keine 2 Minuten
    asyncio.run(m.stages_tick(1530.0))
    assert len(to()) == 2


def test_kurzstand_fuer_sensoren():
    m, h = mgr()
    m.first_seen = NOW[0].isoformat()
    det = [{"id": "a", "off": False, "bat": 80}, {"id": "b", "off": True, "bat": None}, {"id": "c", "off": False, "bat": 12}]
    m.paused["b"] = {"until": "", "since": "", "auto": False, "was_off": True}
    sm = m._summary(det, NOW[0])
    assert sm["status"] == "hinweis" and sm["melder"] == 2 and sm["ausgeschaltet"] == 1 and sm["bat_min"] == 12  # b ist ausgeschaltet: zählt nicht
    m.st["a"] = {"a": True, "ack": ""}
    sm = m._summary(det, NOW[0])
    assert sm["status"] == "alarm" and sm["alarme"] == 1 and sm["unquittiert"] == 1
    assert sm["pruefung"] == "2027-05-17"  # 6 Monate nach dem ersten Start


def _check_mit(m, h, dets):
    m.detectors = lambda: [dict(x) for x in dets]
    m.cfg["notify"]["to"] = ["notify.handy"]
    m.first_seen = (NOW[0] - timedelta(days=400)).isoformat()  # Prüfung wäre fällig
    asyncio.run(m._check())
    return [c[2].get("title", "") for c in h.services.calls if c[0] == "notify"]


def _d(eid="binary_sensor.gas", off=True, bat=None):
    return {"id": eid, "name": "Gasmelder", "k": "gas", "kind": "Gasmelder", "area": "Küche", "src": "", "alarm": False, "off": off, "bat": bat, "test": "", "manual": False}


def test_ausgeschalteter_melder_loest_keine_wartungsmeldungen_aus():
    m, h = mgr()
    m.cfg["lead"] = 0
    m.paused["binary_sensor.gas"] = {"until": "", "since": "", "auto": False, "was_off": True}
    m.st["binary_sensor.gas"] = {"a": False, "since": "", "off_since": 1.0, "rep": 0.0, "stage": 0, "t0": 0.0, "ack": "", "why": ""}  # seit Jahren nicht erreichbar
    assert _check_mit(m, h, [_d()]) == []  # weder „nicht erreichbar“ noch „Melder prüfen“


def test_nicht_erreichbar_nur_einmal_dann_frage_nach_tagen():
    m, h = mgr()
    m.cfg["lead"] = 0
    m.st["binary_sensor.gas"] = {"a": False, "since": "", "off_since": time_ago(2), "rep": 0.0, "stage": 0, "t0": 0.0, "ack": "", "why": ""}
    t = _check_mit(m, h, [_d()])
    assert t == ["Melder nicht erreichbar"]  # Prüf-Erinnerung entfällt, der Melder ist ja aus
    h.services.calls.clear()
    m._notes["off:binary_sensor.gas"] -= 2 * DAY  # am nächsten Tag
    assert _check_mit(m, h, [_d()]) == []  # kein tägliches Wiederholen mehr
    m.st["binary_sensor.gas"]["off_since"] = time_ago(8)
    assert _check_mit(m, h, [_d()]) == ["Melder wirkt ausgeschaltet"]
    assert m.asked["binary_sensor.gas"] == "ask"
    h.services.calls.clear()
    assert _check_mit(m, h, [_d()]) == []  # die Frage kommt nur einmal


def test_modus_auto_schaltet_selbst_aus_und_never_warnt_wie_bisher():
    m, h = mgr()
    m.cfg["lead"] = 0
    m.cfg["offask"] = {"mode": "auto", "days": 7}
    m.st["binary_sensor.gas"] = {"a": False, "since": "", "off_since": time_ago(9), "rep": 0.0, "stage": 0, "t0": 0.0, "ack": "", "why": ""}
    _check_mit(m, h, [_d()])
    assert m.is_paused("binary_sensor.gas") and m.paused["binary_sensor.gas"]["auto"]
    m2, h2 = mgr()
    m2.cfg["lead"] = 0
    m2.cfg["offask"] = {"mode": "never", "days": 7}
    m2.st["binary_sensor.gas"] = {"a": False, "since": "", "off_since": time_ago(9), "rep": 0.0, "stage": 0, "t0": 0.0, "ack": "", "why": ""}
    assert _check_mit(m2, h2, [_d()]) == ["Melder nicht erreichbar"]
    m2._notes["off:binary_sensor.gas"] -= 2 * DAY
    h2.services.calls.clear()
    assert _check_mit(m2, h2, [_d()]) == ["Melder nicht erreichbar"]  # wie bisher täglich


def test_ausgeschalteter_melder_ist_wieder_da_schaltet_sich_ein():
    m, h = mgr()
    m.cfg["lead"] = 0
    m.paused["binary_sensor.gas"] = {"until": "", "since": "", "auto": True, "was_off": True}
    t = _check_mit(m, h, [_d(off=False, bat=80)])
    assert "binary_sensor.gas" not in m.paused and t[0] == "Melder wieder da"


def test_alarm_kommt_auch_von_ausgeschaltetem_melder():
    m, h = mgr()
    m.paused["binary_sensor.gas"] = {"until": "", "since": "", "auto": False, "was_off": False}
    d = _d(off=False, bat=80)
    d["alarm"] = True
    t = _check_mit(m, h, [d])
    assert t == ["ALARM: Gasmelder"] and m.st["binary_sensor.gas"]["stage"] == 1
    assert any(e[1]["art"] == "alarm" for e in h.bus.fired)


def time_ago(days):
    import time
    return time.time() - days * DAY


def test_katalog_im_frontend_passt_zur_liste_im_backend():
    """Jeder Gegenstand des Katalogs (Frontend) muss beim Speichern erhalten bleiben – sonst wird er still zu „tisch“ (Fehler in 2026.11.5b18)."""
    import re
    src = (pathlib.Path(__file__).resolve().parent.parent / "frontend-src" / "parts" / "12m9-grundriss-puppenhaus.js").read_text(encoding="utf-8")
    a = src.index("const L = ["); b = src.index("const G = {", a)
    ids = re.findall(r'\["([a-z0-9]+)", "[^"]+", "(?:wohnen|kueche|bad|garten|spiel|bauten)"', src[a:b])
    assert len(ids) >= 90 and len(set(ids)) == len(ids)
    items = [{"id": f"o{n}", "fl": "eg", "t": "o", "ok": k, "x": 10, "y": 10, "w": 40, "h": 40} for n, k in enumerate(ids)]
    p = S.clean_plan({"floors": [{"id": "eg", "n": "EG"}], "items": items})
    assert [i["ok"] for i in p["items"]] == ids[: len(p["items"])] and len(p["items"]) == len(ids)


def test_fest_bleibt_erhalten():
    p = S.clean_plan({"floors": [{"id": "eg", "n": "EG"}], "items": [
        {"id": "a", "fl": "eg", "t": "o", "ok": "sofa", "x": 1, "y": 1, "w": 40, "h": 40, "lk": 1},
        {"id": "b", "fl": "eg", "t": "o", "ok": "sofa", "x": 1, "y": 1, "w": 40, "h": 40},
        {"id": "c", "fl": "eg", "t": "h", "hk": "steckdose", "x": 1, "y": 1, "lk": True}]})
    d = {i["id"]: i for i in p["items"]}
    assert d["a"].get("lk") == 1 and "lk" not in d["b"] and d["c"].get("lk") == 1


def test_boden_je_raum():
    base = {"fl": "eg", "t": "r", "x": 0, "y": 0, "w": 100, "h": 100}
    p = S.clean_plan({"floors": [{"id": "eg", "n": "EG"}], "items": [
        {**base, "id": "a", "fm": "parkett_dunkel", "fd": 45}, {**base, "id": "b", "fm": "fliese_klein", "fd": 33},
        {**base, "id": "c", "fm": "lava"}, {**base, "id": "d", "fd": 90}, {**base, "id": "e", "fm": "rasen", "fd": 90}]})
    d = {i["id"]: i for i in p["items"]}
    assert d["a"]["fm"] == "parkett_dunkel" and d["a"]["fd"] == 45
    assert d["b"]["fm"] == "fliese_klein" and "fd" not in d["b"]            # ungültige Richtung entfällt
    assert "fm" not in d["c"] and "fd" not in d["c"]                          # unbekannter Belag entfällt
    assert "fm" not in d["d"] and "fd" not in d["d"]                          # Richtung ohne Belag entfällt
    assert d["e"]["fm"] == "rasen" and d["e"]["fd"] == 90


def test_etagen_art_und_dachschraege():
    base = {"fl": "dg", "t": "r", "x": 0, "y": 0, "w": 200, "h": 200}
    p = S.clean_plan({"floors": [{"id": "dg", "n": "DG", "k": "dg"}, {"id": "x1", "n": "X", "k": "burg"}], "items": [
        {**base, "id": "a", "hh": 250, "dn": 35, "sd": "n", "kn": 100}, {**base, "id": "b", "hh": 9999, "dn": 90, "sd": "w", "kn": 500},
        {**base, "id": "c", "hh": 250, "dn": 35, "sd": "x"}, {**base, "id": "d", "dn": 35, "sd": "n"}]})
    assert [f.get("k") for f in p["floors"]] == ["dg", None]
    d = {i["id"]: i for i in p["items"]}
    assert (d["a"]["hh"], d["a"]["dn"], d["a"]["sd"], d["a"]["kn"]) == (250, 35, "n", 100)
    assert (d["b"]["hh"], d["b"]["dn"], d["b"]["kn"]) == (600, 70, 200)           # Werte werden begrenzt
    assert d["c"]["hh"] == 250 and "dn" not in d["c"] and "sd" not in d["c"]       # ungültige Seite: keine Schräge
    assert "hh" not in d["d"] and "dn" not in d["d"]                                # Schräge ohne Raumhöhe entfällt


if __name__ == "__main__":
    for k, v in list(globals().items()):
        if k.startswith("test_"):
            v()
            print("ok", k)


def test_warndienste_sind_keine_melder():
    assert "nina" in S.NO_DETECTOR and "dwd_weather_warnings" in S.NO_DETECTOR
    assert "zha" not in S.NO_DETECTOR


def test_plan_20_felder():
    p = S.clean_plan({"floors": [{"id": "eg", "n": "EG"}], "scale": 500, "items": [{"id": "m1", "fl": "eg", "t": "m", "e": "binary_sensor.x", "rg": 4.3}, {"id": "m2", "fl": "eg", "t": "m", "rg": 99}, {"id": "r1", "fl": "eg", "t": "r", "w": 100, "h": 80, "lk": "  Küche  "}, {"id": "d1", "fl": "eg", "t": "d", "rg": 3, "lk": "x"}]})
    assert p["scale"] == 120
    it = {i["id"]: i for i in p["items"]}
    assert it["m1"]["rg"] == 4.5 and it["m2"]["rg"] == 15
    assert it["r1"]["lk"] == "Küche"
    assert "rg" not in it["d1"] and "lk" not in it["d1"]
    assert S.clean_plan(None)["scale"] == 40


def test_warnname_regex():
    assert S.WARN_NAME.search("binary_sensor.rohr_roth_bayern_warnung_1 Rohr (Roth - Bayern) Warnung 1")
    assert not S.WARN_NAME.search("binary_sensor.rauchmelder_kueche Rauchmelder Küche")


def test_raum_form_pts():
    p = S.clean_plan({"floors": [{"id": "eg", "n": "EG"}], "items": [
        {"id": "r1", "fl": "eg", "t": "r", "x": 0, "y": 0, "w": 5, "h": 5, "pts": [[40, 40], [300, 40], [300, 150], [440, 150], [440, 300], [40, 300]]},
        {"id": "r2", "fl": "eg", "t": "r", "x": 10, "y": 10, "w": 100, "h": 80, "pts": [[0, 0], [10, 10]]},
        {"id": "r3", "fl": "eg", "t": "r", "x": 10, "y": 10, "w": 100, "h": 80, "pts": [[0, 0], [10, 0], [20, 0]]},
        {"id": "r4", "fl": "eg", "t": "r", "x": 10, "y": 10, "w": 100, "h": 80, "pts": "x"}]})
    it = {i["id"]: i for i in p["items"]}
    assert len(it["r1"]["pts"]) == 6 and (it["r1"]["x"], it["r1"]["y"], it["r1"]["w"], it["r1"]["h"]) == (40, 40, 400, 260)
    assert "pts" not in it["r2"] and "pts" not in it["r3"] and "pts" not in it["r4"]
    assert it["r4"]["w"] == 100


def test_lampe_im_plan():
    """Modul 18 Build 5: Lampen als eigenes Element im Baukasten (Typ „l“)."""
    p = S.clean_plan({"floors": [{"id": "eg", "n": "EG"}], "items": [
        {"id": "l1", "fl": "eg", "t": "l", "x": 120, "y": 80, "e": "light.decke", "k": "spot"},
        {"id": "l2", "fl": "eg", "t": "l", "x": 200, "y": 80, "e": "binary_sensor.x", "k": "laser", "r": 90},
        {"id": "m1", "fl": "eg", "t": "m", "x": 10, "y": 10, "e": "light.decke"}]})
    it = {i["id"]: i for i in p["items"]}
    assert it["l1"]["e"] == "light.decke" and it["l1"]["k"] == "spot"
    assert it["l2"]["e"] == "" and it["l2"]["k"] == "decke" and it["l2"]["r"] == 90
    assert it["m1"]["e"] == "" and "k" not in it["m1"]   # Melder nehmen weiter nur binary_sensor
    assert S.MAX_ITEMS == 400
    t = S.clean_plan({"floors": [{"id": "eg", "n": "EG"}], "items": [{"id": "l3", "fl": "eg", "t": "l", "x": 5, "y": 5, "e": "light.nacht", "k": "tisch"}]})
    assert t["items"][0]["k"] == "tisch"   # Modul 18 Build 7: Art „Tisch“ auch im Plan


def test_testknopf_wird_als_pruefung_eingetragen():
    from datetime import datetime, timedelta
    m, h = mgr()
    m._known.add("binary_sensor.rauch")
    t0 = datetime(2026, 11, 18, 12, 0, 0)
    old, new = _St("on"), _St("off")
    old.last_changed, new.last_changed = t0, t0 + timedelta(seconds=15)
    m._on_state(_Ev("binary_sensor.rauch", new, old))
    assert "binary_sensor.rauch" in m.tested and m.thist["binary_sensor.rauch"]
    m2, _ = mgr()
    m2._known.add("binary_sensor.rauch")
    old.last_changed, new.last_changed = t0, t0 + timedelta(seconds=600)
    m2._on_state(_Ev("binary_sensor.rauch", new, old))
    assert not m2.tested


def test_testknopf_entitaet_traegt_pruefung_ein():
    m, h = mgr()
    m._btns["button.rauch_test"] = "binary_sensor.rauch"
    m._on_state(_Ev("button.rauch_test", _St("2026-11-18T19:00:00+00:00", None), _St("2026-11-01T11:00:00+00:00", None)))
    assert "binary_sensor.rauch" in m.tested
    n = len(m.thist["binary_sensor.rauch"])
    m._on_state(_Ev("button.rauch_test", _St("2026-11-18T19:00:05+00:00", None), _St("2026-11-18T19:00:00+00:00", None)))
    assert len(m.thist["binary_sensor.rauch"]) == n  # derselbe Test, nicht doppelt


def test_plan_ausgang_markierung():
    p = S.clean_plan({"floors": [{"id": "eg", "n": "EG"}], "items": [
        {"id": "d1", "fl": "eg", "t": "d", "x": 10, "y": 10, "ex": 1},
        {"id": "d2", "fl": "eg", "t": "d", "x": 20, "y": 10, "ex": 0},
        {"id": "d3", "fl": "eg", "t": "d", "x": 30, "y": 10, "ex": "ja", "mv": 1, "mh": 0},
        {"id": "s1", "fl": "eg", "t": "s", "x": 0, "y": 0, "w": 40, "h": 80, "ex": 1},
        {"id": "w1", "fl": "eg", "t": "w", "x": 0, "y": 0, "x2": 40, "y2": 0, "ex": 1}]})
    it = {i["id"]: i for i in p["items"]}
    assert it["d1"]["ex"] == 1 and it["d2"]["ex"] == 0 and "ex" not in it["d3"] and it["d3"]["mv"] == 1 and "mh" not in it["d3"] and it["s1"]["ex"] == 1 and "ex" not in it["w1"]


def test_plan_durchgang_und_raumrand():
    p = S.clean_plan({"floors": [{"id": "eg", "n": "EG"}], "items": [
        {"id": "d1", "fl": "eg", "t": "d", "x": 10, "y": 10, "dg": 1},
        {"id": "d2", "fl": "eg", "t": "d", "x": 20, "y": 10, "ds": 1},
        {"id": "r1", "fl": "eg", "t": "r", "x": 0, "y": 0, "w": 100, "h": 100, "ds": 1, "dg": 1}]})
    it = {i["id"]: i for i in p["items"]}
    assert it["d1"]["dg"] == 1 and "ds" not in it["d2"] and it["r1"]["ds"] == 1 and "dg" not in it["r1"]


# ---------------------------------------------------------------- v0.9 Build 11: Quellen-Wächter, Selbsttest, letzter Alarm
def _xs(n, off=True, bat=80):
    return [{**_d(f"binary_sensor.rauch_{i}", off=off, bat=bat), "name": f"Rauchmelder {i}", "k": "smoke", "kind": "Rauchmelder", "src": "xsense"} for i in range(n)]


def _offen_seit(m, dets, days):
    for d in dets:
        m.st[d["id"]] = {"a": False, "since": "", "off_since": time_ago(days), "rep": 0.0, "stage": 0, "t0": 0.0, "ack": "", "why": ""}


def test_quelle_aus_eine_meldung_statt_vieler():
    m, h = mgr()
    m.cfg["lead"], m.cfg["test"]["on"] = 0, False
    dets = _xs(4)
    _offen_seit(m, dets, 0.5)
    t = _check_mit(m, h, dets)
    assert t == ["Melder-Quelle ausgefallen"] and "xsense" in m.src_off
    assert any(ev == "fenster_heizung_sicherheit" and d["art"] == "quelle_aus" and d["anzahl"] == 4 for ev, d in h.bus.fired)
    h.services.calls.clear()
    assert _check_mit(m, h, dets) == []  # keine Einzelwarnungen und keine Wiederholung


def test_quelle_unter_mindestzahl_warnt_je_melder():
    m, h = mgr()
    m.cfg["lead"], m.cfg["test"]["on"] = 0, False
    dets = _xs(2)
    _offen_seit(m, dets, 0.5)
    assert _check_mit(m, h, dets) == ["Melder nicht erreichbar", "Melder nicht erreichbar"] and not m.src_off


def test_quelle_nicht_aus_wenn_einer_noch_da_ist():
    m, h = mgr()
    m.cfg["lead"], m.cfg["test"]["on"] = 0, False
    dets = _xs(3) + [{**_xs(1, off=False)[0], "id": "binary_sensor.rauch_x"}]
    _offen_seit(m, dets[:3], 0.5)
    assert _check_mit(m, h, dets).count("Melder nicht erreichbar") == 3 and not m.src_off


def test_quelle_wieder_da_und_waechter_aus():
    m, h = mgr()
    m.cfg["lead"], m.cfg["test"]["on"] = 0, False
    dets = _xs(3)
    _offen_seit(m, dets, 0.5)
    _check_mit(m, h, dets)
    h.services.calls.clear()
    assert _check_mit(m, h, _xs(3, off=False)) == ["Melder-Quelle wieder da"] and not m.src_off
    m2, h2 = mgr()
    m2.cfg["lead"], m2.cfg["test"]["on"] = 0, False
    m2.cfg["guard"]["src"] = False
    _offen_seit(m2, dets, 0.5)
    assert _check_mit(m2, h2, dets) == ["Melder nicht erreichbar"] * 3


def test_quelle_aus_ausgeschaltete_zaehlen_nicht_und_keine_frage():
    m, h = mgr()
    m.cfg["lead"], m.cfg["test"]["on"] = 0, False
    dets = _xs(3)
    _offen_seit(m, dets, 9)  # länger als „Ausschalten?“-Frist
    assert _check_mit(m, h, dets) == ["Melder-Quelle ausgefallen"] and not m.asked
    m.paused[dets[0]["id"]] = {"until": "", "since": "", "auto": False, "was_off": True}
    assert S.src_down(dets, {dets[0]["id"]}) == {}  # nur noch 2 aktive Melder


def test_selbsttest_sonntags_einmal_mit_hinweisen():
    old = NOW[0]
    try:
        NOW[0] = datetime(2026, 11, 22, 18, 5, tzinfo=timezone.utc)  # Sonntag
        m, h = mgr()
        m.cfg["lead"], m.cfg["test"]["on"], m.cfg["off"]["on"], m.cfg["bat"]["on"] = 0, False, False, False
        dets = [_d("binary_sensor.a", off=False, bat=8), _d("binary_sensor.b", off=False, bat=90)]
        t = _check_mit(m, h, dets)
        assert t == ["Wochen-Selbsttest: 1 Hinweis"] and m.selftest["ok"] is False and m.selftest["n"] == 2
        assert "Batterie 8 %" in m.selftest["p"][0]
        h.services.calls.clear()
        assert _check_mit(m, h, dets) == []  # nur einmal je Sonntag
        NOW[0] = datetime(2026, 11, 22, 17, 0, tzinfo=timezone.utc)
        m2, h2 = mgr()
        m2.cfg["lead"], m2.cfg["test"]["on"] = 0, False
        assert _check_mit(m2, h2, [_d("binary_sensor.b", off=False, bat=90)]) == [] and not m2.selftest  # vor 18 Uhr nicht
    finally:
        NOW[0] = old


def test_selbsttest_alles_gut_ohne_mitteilung_und_ruhezeit():
    old = NOW[0]
    try:
        NOW[0] = datetime(2026, 11, 22, 18, 5, tzinfo=timezone.utc)
        m, h = mgr()
        m.cfg["lead"] = 0
        m.tested = {"binary_sensor.b": NOW[0].isoformat()}
        assert _check_mit(m, h, [{**_d("binary_sensor.b", off=False, bat=90)}]) == [] and m.selftest["ok"] is True
        assert m.log[0]["x"].startswith("Wochen-Selbsttest: alle 1 Melder")
        m2, h2 = mgr()
        m2.cfg["lead"], m2.cfg["test"]["on"], m2.cfg["bat"]["on"] = 0, False, False
        m2.cfg["quiet"] = {"on": True, "from": "17:00", "to": "07:00"}
        assert _check_mit(m2, h2, [_d("binary_sensor.b", off=False, bat=5)]) == []  # Test läuft, Mitteilung wartet
        assert m2.selftest["ok"] is False and m2.selftest["pend"] is True
        m2.cfg["quiet"]["on"] = False
        assert _check_mit(m2, h2, [_d("binary_sensor.b", off=False, bat=5)]) == ["Wochen-Selbsttest: 1 Hinweis"] and not m2.selftest["pend"]
        nx = S.SicherheitManager._selftest_next(datetime(2026, 11, 17, 19, 0, tzinfo=timezone.utc))
        assert nx.startswith("2026-11-22T18:00")
    finally:
        NOW[0] = old


def test_letzter_alarm_und_neue_sensorwerte():
    m, h = mgr()
    m.cfg["lead"] = 0
    d = _d(off=False, bat=80)
    d["alarm"] = True
    _check_mit(m, h, [d, _d("binary_sensor.weg", off=True)])
    assert m.last_alarm["melder"] == "binary_sensor.gas" and m.last_alarm["raum"] == "Küche"
    sm = m._sum
    assert sm["letzter_alarm"] == NOW[0].isoformat() and sm["offline"] == ["Gasmelder"]
    m._save()
    saved = [x for x in _Store.stores if x.key.endswith("_sicherheit")][0].saved
    assert saved["last_alarm"]["melder"] == "binary_sensor.gas" and "selftest" in saved and "src_off" in saved


def test_clean_cfg_build11():
    c = S.clean_cfg({})
    assert c["guard"] == {"src": True} and c["selftest"] == {"on": True} and c["notify"]["self"] is True
    c = S.clean_cfg({"guard": {"src": 0}, "selftest": {"on": False}, "notify": {"self": False}})
    assert c["guard"]["src"] is False and c["selftest"]["on"] is False and c["notify"]["self"] is False
    assert S.src_name("xsense") == "X-Sense" and S.src_name("foo") == "foo"


# ---------------------------------------------------------------- v0.9 Build 12: Fehler aus der Testwoche
def test_stufe2_nutzt_eigene_melderart():
    m, h = mgr()
    _snap_stub(m)
    h.states.d["binary_sensor.melder_x"] = _St("on", None)  # von Hand hinzugefügt, ohne Geräteklasse
    m.cfg["meta"]["binary_sensor.melder_x"] = {"kind": "heat"}
    m.cfg["acts"] = [{"id": "l2", "kind": "heat", "ent": "light.flur", "do": "on", "st": 2}]
    h.states.d["light.flur"] = _St("off", None)
    m.st["binary_sensor.melder_x"] = {"a": True, "since": "x", "off_since": 0.0, "rep": 0.0, "stage": 1, "t0": 1000.0, "ack": "", "why": ""}
    asyncio.run(m.stages_tick(1011.0))
    assert [c[2]["entity_id"] for c in h.services.calls if c[0] == "light"] == ["light.flur"]  # vorher: als „safety“ gelesen, Aktion fehlte


def test_fehlalarm_zaehlt_nicht_als_pruefung():
    m, h = mgr()
    m._known.add("binary_sensor.rauch")
    m.st["binary_sensor.rauch"] = {"a": True, "since": "x", "off_since": 0.0, "rep": 0.0, "stage": 1, "t0": 1.0, "ack": "x", "why": "Toast"}
    t0 = datetime(2026, 11, 18, 12, 0, 0)
    old, new = _St("on"), _St("off")
    old.last_changed, new.last_changed = t0, t0 + timedelta(seconds=40)
    m._on_state(_Ev("binary_sensor.rauch", new, old))
    assert not m.tested


def test_kontaktperson_bekommt_entwarnung_und_mitteilungen_verschwinden():
    m, h = mgr()
    _snap_stub(m)
    _det(h)
    m.cfg["notify"]["to"] = ["notify.handy"]
    m.cfg["contact"]["to"] = "notify.nachbar"
    m.st["binary_sensor.rauch"] = {"a": True, "since": "x", "off_since": 0.0, "rep": 0.0, "stage": 4, "t0": 1000.0, "ack": "", "why": "", "s4t": 1.0}
    asyncio.run(m.async_ack("", "", "Handy"))
    nb = [c for c in h.services.calls if c[0] == "notify" and c[1] == "nachbar"]
    assert any(c[2]["message"] == "clear_notification" for c in nb) and any("Erledigt" in c[2]["message"] for c in nb)
    m2, h2 = mgr()
    m2.cfg["lead"], m2.cfg["test"]["on"] = 0, False
    m2.st["binary_sensor.gas"] = {"a": True, "since": "x", "off_since": 0.0, "rep": 0.0, "stage": 4, "t0": 1.0, "ack": "", "why": ""}
    m2.cfg["contact"]["to"] = "notify.nachbar"
    _check_mit(m2, h2, [_d(off=False, bat=80)])
    calls = [(c[1], c[2]["message"]) for c in h2.services.calls if c[0] == "notify"]
    assert ("handy", "clear_notification") in calls and ("nachbar", "clear_notification") in calls
    assert any(n == "nachbar" and m.startswith("Entwarnung") for n, m in calls)


def test_diagnose_modul11_ohne_persoenliche_daten():
    import importlib.util as iu
    saved = {n: sys.modules.get(n) for n in ("homeassistant", "homeassistant.config_entries", "homeassistant.core", "fhdiag", "fhdiag.const")}
    try:
        for n, kw in (("homeassistant", {}), ("homeassistant.config_entries", {"ConfigEntry": object}), ("homeassistant.core", {"HomeAssistant": object}), ("fhdiag.const", {"DOMAIN": "fenster_heizung"})):
            mm = types.ModuleType(n)
            for k, v in kw.items():
                setattr(mm, k, v)
            sys.modules[n] = mm
        sys.modules["fhdiag"] = types.ModuleType("fhdiag")
        sys.modules["fhdiag"].__path__ = [str(ROOT)]
        spec = iu.spec_from_file_location("fhdiag.diagnostics", ROOT / "diagnostics.py")
        D = iu.module_from_spec(spec)
        spec.loader.exec_module(D)
    finally:
        for n, old in saved.items():
            if old is None:
                sys.modules.pop(n, None)
            else:
                sys.modules[n] = old
    m, h = mgr()
    m.cfg["notify"]["to"] = ["notify.handy"]
    m.cfg["contact"]["to"] = "notify.nachbar"
    m.cfg["proto"] = {"name": "Max", "addr": "Musterweg 1", "who": ""}
    m.cfg["plan"]["bg"] = {"eg": "data:image/png;base64,AAAA"}
    m.detectors = lambda: [_d(off=False, bat=80)]
    dd = D.sicherheit_diag(m)
    txt = str(dd)
    assert "notify.handy" not in txt and "nachbar" not in txt and "Musterweg" not in txt and "base64" not in txt
    assert dd["einstellungen"]["proto"] == {"name": D.REDACT, "addr": D.REDACT, "who": ""} and dd["schema"] == S.SCHEMA
    assert dd["melder"][0]["id"] == "binary_sensor.gas" and dd["einstellungen"]["plan"]["hintergrundbild"] is True
    assert m.cfg["notify"]["to"] == ["notify.handy"] and D.sicherheit_diag(None) == {"eingerichtet": False}


def test_tueren_fenster_schraeg_und_arten():
    """Modul 0 Build 7: Türen und Fenster frei drehbar, mit Breite und Art."""
    p = S.clean_plan({"floors": [{"id": "eg", "n": "EG"}], "items": [
        {"id": "d1", "fl": "eg", "t": "d", "x": 10, "y": 10, "r": 45.4, "b": 88.5, "dk": "schiebe"},
        {"id": "d2", "fl": "eg", "t": "d", "x": 10, "y": 10, "r": -30, "b": 9999, "dk": "rakete"},
        {"id": "f1", "fl": "eg", "t": "f", "x": 10, "y": 10, "r": 375, "b": 10, "fk": "dach", "dk": "doppel"},
        {"id": "r1", "fl": "eg", "t": "r", "x": 0, "y": 0, "w": 100, "h": 100, "b": 120, "fk": "boden"}]})
    it = {i["id"]: i for i in p["items"]}
    assert it["d1"]["r"] == 45 and it["d1"]["b"] == 88 and it["d1"]["dk"] == "schiebe"
    assert it["d2"]["r"] == 330 and it["d2"]["b"] == 600 and "dk" not in it["d2"]
    assert it["f1"]["r"] == 15 and it["f1"]["b"] == 40 and it["f1"]["fk"] == "dach" and "dk" not in it["f1"]
    assert "b" not in it["r1"] and "fk" not in it["r1"] and it["r1"]["r"] == 0


def test_treppen_geraete_markise():
    """Modul 0 Build 7: Treppenarten, mobile Heizer/Entfeuchter, Markise."""
    p = S.clean_plan({"floors": [{"id": "eg", "n": "EG"}], "items": [
        {"id": "s1", "fl": "eg", "t": "s", "x": 0, "y": 0, "w": 80, "h": 120, "sk": "u"},
        {"id": "s2", "fl": "eg", "t": "s", "x": 0, "y": 0, "w": 80, "h": 120, "sk": "rutsche"},
        {"id": "g1", "fl": "eg", "t": "g", "x": 5, "y": 5, "e": "climate.heizer_bad", "gk": "heizer", "fix": 1},
        {"id": "g2", "fl": "eg", "t": "g", "x": 5, "y": 5, "e": "light.x", "gk": "toaster"},
        {"id": "g3", "fl": "eg", "t": "g", "x": 5, "y": 5, "e": "humidifier.keller", "gk": "entf"},
        {"id": "a1", "fl": "eg", "t": "a", "x": 50, "y": 280, "e": "cover.markise", "b": 400, "tf": 350, "mv": 1},
        {"id": "a2", "fl": "eg", "t": "a", "x": 50, "y": 280, "e": "switch.x", "tf": 9999}]})
    it = {i["id"]: i for i in p["items"]}
    assert it["s1"]["sk"] == "u" and "sk" not in it["s2"]
    assert it["g1"] == {**it["g1"], "e": "climate.heizer_bad", "gk": "heizer", "fix": 1}
    assert it["g2"]["e"] == "" and it["g2"]["gk"] == "heizer" and "fix" not in it["g2"]
    assert it["g3"]["e"] == "humidifier.keller" and it["g3"]["gk"] == "entf"
    assert it["a1"]["e"] == "cover.markise" and it["a1"]["b"] == 400 and it["a1"]["tf"] == 350 and it["a1"]["mv"] == 1
    assert it["a2"]["e"] == "" and it["a2"]["tf"] == 800


def test_haustechnik():
    """Modul 0 Build 9: Haustechnik, Sensoren und Notfall-Punkte (Typ „h“)."""
    p = S.clean_plan({"floors": [{"id": "eg", "n": "EG"}], "items": [
        {"id": "h1", "fl": "eg", "t": "h", "x": 5, "y": 5, "hk": "bewegung", "e": "binary_sensor.flur", "rg": 7.3, "fov": 999, "r": 45},
        {"id": "h2", "fl": "eg", "t": "h", "x": 5, "y": 5, "hk": "rakete", "e": "kaputt", "tx": "x"},
        {"id": "h3", "fl": "eg", "t": "h", "x": 5, "y": 5, "hk": "notiz", "tx": "Rohr in der Wand " * 20},
        {"id": "h4", "fl": "eg", "t": "h", "x": 5, "y": 5, "hk": "heizkoerper", "e": "climate.bad"}]})
    it = {i["id"]: i for i in p["items"]}
    assert it["h1"]["hk"] == "bewegung" and it["h1"]["e"] == "binary_sensor.flur" and it["h1"]["rg"] == 7.5 and it["h1"]["fov"] == 360 and it["h1"]["r"] == 45
    assert it["h2"]["hk"] == "steckdose" and it["h2"]["e"] == "" and "tx" not in it["h2"] and "rg" not in it["h2"]
    assert len(it["h3"]["tx"]) == 200 and it["h4"]["e"] == "climate.bad"


def test_moebel_aussen_norden():
    """Modul 0 Build 10: Möbel/Außen (Typ „o“), Grundstück als Etage, Nordrichtung."""
    p = S.clean_plan({"north": 405, "floors": [{"id": "eg", "n": "EG"}, {"id": "ga", "n": "Außen", "ga": 1}, {"id": "og", "n": "OG", "ga": "ja"}], "items": [
        {"id": "o1", "fl": "eg", "t": "o", "x": 10, "y": 10, "w": 72, "h": 80, "ok": "bett", "r": 90},
        {"id": "o2", "fl": "ga", "t": "o", "x": 10, "y": 10, "w": 240, "h": 120, "ok": "pool", "e": "sensor.pool_temp"},
        {"id": "o3", "fl": "ga", "t": "o", "x": 10, "y": 10, "w": 40, "h": 40, "ok": "ufo", "e": "x"},
        {"id": "o4", "fl": "ga", "t": "o", "x": 10, "y": 10, "w": 120, "h": 80, "ok": "spielturm"},
        {"id": "o5", "fl": "ga", "t": "o", "x": 10, "y": 10, "w": 160, "h": 120, "ok": "bewaesserung", "e": "valve.zone_rasen"}]})
    assert p["north"] == 45 and p["floors"][1]["ga"] == 1 and "ga" not in p["floors"][0] and "ga" not in p["floors"][2]
    it = {i["id"]: i for i in p["items"]}
    assert it["o1"]["ok"] == "bett" and it["o1"]["w"] == 72 and it["o1"]["r"] == 90 and it["o1"]["e"] == ""
    assert it["o2"]["ok"] == "pool" and it["o2"]["e"] == "sensor.pool_temp"
    assert it["o3"]["ok"] == "tisch" and it["o3"]["e"] == ""
    assert it["o4"]["ok"] == "spielturm" and it["o5"]["ok"] == "bewaesserung" and it["o5"]["e"] == "valve.zone_rasen"
    assert "north" not in S.clean_plan({"floors": []})


def test_clean_plan_keeps_rotated_long_item_in_place():
    """2026.11.4.6: Ein langer, um 90° gedrehter Zaun am linken Rand hat seine ungedrehte Ecke weit links.
    Vorher wurde x auf −50 begrenzt und der Zaun sprang bei jedem Speichern nach rechts."""
    z = {"id": "z1", "fl": "ga", "t": "o", "ok": "zaun", "x": -270, "y": 300, "w": 575, "h": 6, "r": 90}
    p = S.clean_plan({"floors": [{"id": "ga", "n": "Außen", "ga": 1}], "items": [z]})
    o = p["items"][0]
    assert (o["x"], o["y"], o["w"], o["h"], o["r"]) == (-270, 300, 575, 6, 90)
    assert S.clean_plan(p)["items"][0]["x"] == -270  # bleibt auch beim zweiten Speichern
    far = S.clean_plan({"floors": [{"id": "ga", "n": "Außen", "ga": 1}], "items": [{**z, "x": -5000}]})["items"][0]
    assert far["x"] + far["w"] / 2 >= -51  # die Mitte bleibt im Plan (±1 durch Runden)


def test_clean_plan_window_rollladen_and_height():
    """2026.11.4.7: Rollladen bei jeder Fensterart (auch bodentief), Höhe je Fenster; alte Art „rollo“ wird übernommen."""
    fl = [{"id": "eg", "n": "EG"}]
    its = [{"id": "f1", "fl": "eg", "t": "f", "x": 10, "y": 10, "fk": "boden", "ro": 1, "hh": 215, "b": 120},
           {"id": "f2", "fl": "eg", "t": "f", "x": 20, "y": 10, "fk": "rollo"},
           {"id": "f3", "fl": "eg", "t": "f", "x": 30, "y": 10, "hh": 9999}]
    p = {i["id"]: i for i in S.clean_plan({"floors": fl, "items": its})["items"]}
    assert p["f1"]["fk"] == "boden" and p["f1"]["ro"] == 1 and p["f1"]["hh"] == 215 and p["f1"]["b"] == 120
    assert "fk" not in p["f2"] and p["f2"]["ro"] == 1
    assert p["f3"]["hh"] == 400 and "ro" not in p["f3"]
