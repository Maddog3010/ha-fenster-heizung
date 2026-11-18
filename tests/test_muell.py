"""Tests für Modul 17 Müllabfuhr (addons/muell/manager.py) ohne Home Assistant.

Ausführen: python3 -m pytest tests  oder  python3 tests/test_muell.py
Geprüft werden Erkennung der Abfallarten, „Nicht erkannt“, Zustände und Abholzeit, Übernahme der alten Tonnen (Schema 1 → 2),
Vorwarnung für Sondertermine, Erinnerung, „Später erinnern“ über einen Neustart, Zwischenspeicher, mehrere Kalender und Briefing,
ab v0.6 Knöpfe in der Meldung, Erinnerung am Abholtag, „Tonne reinholen“ und das Licht mit Rückkehr zum vorherigen Zustand,
ab v0.8 „Wer ist dran?“, Urlaub, Sturm verschiebt die Erinnerung, „Diesmal nicht“, Verlauf und Kosten nur für Tonnen draußen,
ab v0.9 Jahresübersicht, Entitäten und Ereignis, Vorrat Säcke und Labs „Automatisch erkennen“.
"""
from __future__ import annotations

import asyncio
import importlib.util
import pathlib
import sys
import time
import types
from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo

P = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung" / "addons" / "muell" / "manager.py"
TZ = ZoneInfo("Europe/Berlin")
NOW = [datetime(2026, 11, 16, 19, 0, tzinfo=TZ)]   # Montagabend
LOG: list = []


_ALT: dict = {}   # was vor dem Laden in sys.modules stand (None = nichts)


def _stub(name: str, **attrs) -> types.ModuleType:
    """Eigenes Ersatzmodul, nie das einer anderen Testdatei: sonst überschreiben sich die Tests gegenseitig (z. B. entity_registry)."""
    _ALT.setdefault(name, sys.modules.get(name))
    m = types.ModuleType(name)
    for k, v in attrs.items():
        setattr(m, k, v)
    sys.modules[name] = m
    return m


class _Store:
    """Ersatz für SafeStore: ein gemeinsamer Speicher je Schlüssel, damit ein „Neustart“ ihn wieder liest."""
    DATA: dict = {}

    def __init__(self, hass, version, key, **k):
        self.key = key

    async def async_load(self):
        import json
        d = _Store.DATA.get(self.key)
        return json.loads(json.dumps(d)) if d is not None else None

    def async_delay_save(self, fn, delay=0):
        _Store.DATA[self.key] = fn()


class _Ent:
    def __init__(self, eid, platform):
        self.entity_id, self.platform, self.domain, self.disabled = eid, platform, eid.split(".")[0], False


class _Reg:
    entities = {"a": _Ent("calendar.abfall_stadt", "waste_collection_schedule"), "b": _Ent("calendar.familie", "local_calendar")}


def _load():
    for n in ("homeassistant", "homeassistant.helpers", "homeassistant.util", "custom_components", "custom_components.fenster_heizung"):
        _stub(n)
    _stub("homeassistant.core", CALLBACK_TYPE=object, HomeAssistant=object)
    _stub("homeassistant.helpers.entity_registry", async_get=lambda h: _Reg())
    sys.modules["homeassistant.helpers"].entity_registry = sys.modules["homeassistant.helpers.entity_registry"]
    _stub("homeassistant.helpers.event", async_track_time_interval=lambda *a, **k: (lambda: None))
    dtm = types.ModuleType("homeassistant.util.dt")
    dtm.now = lambda: NOW[0]
    dtm.start_of_local_day = lambda d: datetime(d.year, d.month, d.day, tzinfo=TZ)
    dtm.utc_from_timestamp = lambda ts: datetime.fromtimestamp(ts, tz=timezone.utc)
    dtm.as_local = lambda t: t.astimezone(TZ)
    _ALT.setdefault("homeassistant.util.dt", sys.modules.get("homeassistant.util.dt"))
    sys.modules["homeassistant.util.dt"] = dtm
    sys.modules["homeassistant.util"].dt = dtm
    _stub("custom_components.fenster_heizung.backup", SafeStore=_Store)
    _stub("custom_components.fenster_heizung.const", DOMAIN="fenster_heizung")
    _stub("custom_components.fenster_heizung.diag", diag_log=lambda h, lvl, msg, **k: LOG.append(msg))
    spec = importlib.util.spec_from_file_location("muell_manager", P)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


try:
    M = _load()
finally:  # sys.modules wieder so, wie es war: die Ersatzmodule bleiben nur im geladenen Manager
    for _n, _old in _ALT.items():
        if _old is None:
            sys.modules.pop(_n, None)
        else:
            sys.modules[_n] = _old


class _Services:
    def __init__(self, cals):
        self.cals, self.calls = cals, []

    def has_service(self, dom, name):
        return True

    async def async_call(self, dom, svc, data, blocking=False, return_response=False):
        self.calls.append((dom, svc, data))
        if dom == "calendar":
            cal = data["entity_id"]
            if cal not in self.cals:
                raise RuntimeError("nicht da")
            return {cal: {"events": [{"summary": s, "start": d} for d, s in self.cals[cal]]}}
        return None


class _Bus:
    def __init__(self):
        self.listen, self.fired = {}, []

    def async_fire(self, ev, data):
        self.fired.append((ev, data))

    def async_listen(self, ev, fn):
        self.listen[ev] = fn
        return lambda: self.listen.pop(ev, None)


class _St:
    def __init__(self, state, attrs):
        self.state, self.attributes = state, attrs


class _States:
    def __init__(self):
        self.d, self.pub = {}, {}

    def get(self, e):
        return self.d.get(e)

    def async_set(self, e, state, attrs):
        self.pub[e] = (state, attrs)

    def async_remove(self, e):
        self.pub.pop(e, None)

    def async_entity_ids(self, dom):
        return [e for e in self.d if e.startswith(dom + ".")]


class _Hass:
    def __init__(self, cals):
        self.services, self.data, self.bus, self.states = _Services(cals), {}, _Bus(), _States()


EV = [("2026-11-17", "Restmüll"), ("2026-11-17", "Gelber Sack"), ("2026-11-20", "Biotonne"), ("2026-11-23", "Papiertonne"),
      ("2026-11-26", "Altglas"), ("2026-11-19", "Sperrmüll nach Anmeldung"), ("2026-12-01", "Schadstoffmobil Marktplatz"),
      ("2026-11-24", "Problemabfall"), ("2026-11-25", "Laubsammlung"), ("2026-12-09", "Laubsammlung")]


def run(c):
    return asyncio.new_event_loop().run_until_complete(c)


def kinds(*ids):
    return [M.kind_from_tpl(i) for i in ids]


# ---------------------------------------------------------------- Erkennung
def test_erkennung_laengstes_wort():
    K = kinds("rest", "bio", "papier", "gelb", "baum", "gruen")
    assert M.classify("Restmüll", K) == "rest"
    assert M.classify("Gelbe Tonne", K) == "gelb"
    assert M.classify("Weihnachtsbaum-Abholung", K) == "baum"
    assert M.classify("Grünschnitt (Bio)", K) == "gruen"        # „grünschnitt“ ist länger als „bio“
    assert M.classify("Gelbe Tonne (Restabfall)", K) == "gelb"   # Gleichstand: Restmüll zählt zuletzt
    assert M.classify("Laubsammlung", K) is None
    K[1]["on"] = False
    assert M.classify("Biotonne", K) is None                    # ausgeschaltete Arten zählen nicht


def test_nicht_erkannt_und_ignorieren():
    K = kinds("rest", "bio", "papier", "gelb")
    raw = [{"summary": s, "start": d} for d, s in EV] + [{"summary": "kaputt", "start": "17.11."}]
    ev, unk = M.parse_events(raw, K)
    assert ("2026-11-17", "rest") in ev and ("2026-11-17", "gelb") in ev and len([1 for _, b in ev if b == "rest"]) == 1
    assert set(unk) == {"Altglas", "Sperrmüll nach Anmeldung", "Schadstoffmobil Marktplatz", "Problemabfall", "Laubsammlung"}
    assert unk["Laubsammlung"]["n"] == 2 and unk["Laubsammlung"]["first"] == "2026-11-25"
    _, unk = M.parse_events(raw, K, ["laubsammlung"])
    assert "Laubsammlung" not in unk
    rows = M.unknown_list(M.parse_events(raw, K)[1], date(2026, 11, 16))
    assert all(r["upcoming"] for r in rows) and rows[0]["next"] == "2026-11-19" and next(r for r in rows if r["t"] == "Laubsammlung")["next"] == "2026-11-25"
    rows = M.unknown_list(M.parse_events(raw, K)[1], date(2026, 12, 2))
    assert next(r for r in rows if r["t"] == "Laubsammlung")["next"] == "2026-12-09" and not next(r for r in rows if r["t"] == "Altglas")["upcoming"]


def test_zustaende_und_abholzeit():
    ev = [("2026-11-17", "rest")]
    d = date(2026, 11, 17)
    assert M.next_for(ev, "rest", d, 11 * 60) == "2026-11-17"
    assert M.next_for(ev, "rest", d, 12 * 60) is None                 # Vorgabe: ab 12 Uhr erledigt
    assert M.next_for(ev, "rest", d, 14 * 60, until=15 * 60) == "2026-11-17"   # B8: Wagen kommt erst nachmittags
    assert M.bin_state("2026-11-17", date(2026, 11, 16), 18 * 60, 18 * 60 + 30, None) == "soon"
    assert M.bin_state("2026-11-17", date(2026, 11, 16), 19 * 60, 18 * 60 + 30, None) == "out"
    assert M.bin_state("2026-11-17", date(2026, 11, 16), 19 * 60, 18 * 60 + 30, "2026-11-17") == "done"


# ---------------------------------------------------------------- Einstellungen und Übernahme
def test_uebernahme_schema1():
    old = {"cal": "calendar.abfall", "time": "19:00", "bins": {"rest": {"on": True, "match": "rest,graue"}, "bio": {"on": False, "match": "bio"},
           "papier": {"on": True, "match": "papier"}, "gelb": {"on": True, "match": "gelb"}}, "push": {"on": True, "to": ["notify.handy"]}}
    c = M.clean_cfg(old)
    assert c["v"] == 2 and c["cals"] == ["calendar.abfall"] and c["cal"] == "calendar.abfall" and c["time"] == "19:00"
    assert [k["id"] for k in c["kinds"]] == ["rest", "bio", "papier", "gelb"]
    assert c["kinds"][0]["match"] == "rest,graue" and c["kinds"][1]["on"] is False and c["kinds"][3]["img"] == "sack"
    assert c["push"]["to"] == ["notify.handy"]


def test_clean_kinds_grenzen():
    ks = [{"id": "rest", "name": "Restmüll"}, {"id": "rest", "name": "doppelt"}, {"id": "Böse ID"}, {"id": "glas", "tpl": "glas", "color": "rot", "img": "x", "pre": 12, "until": "25:00"}]
    ks += [{"id": f"k{i}", "name": f"Art {i}"} for i in range(12)]
    c = M.clean_cfg({"kinds": ks, "cals": ["calendar.a", "calendar.b", "calendar.a", "calendar.c", "calendar.d", "light.x"], "snooze": 70})
    ids = [k["id"] for k in c["kinds"]]
    assert ids[:2] == ["rest", "glas"] and len(ids) == M.MAX_KINDS and len(set(ids)) == len(ids)
    g = c["kinds"][1]
    assert g["color"] == M.TEMPLATES["glas"]["color"] and g["img"] == "glas" and g["pre"] == 7 and g["until"] == "12:00"
    assert c["cals"] == ["calendar.a", "calendar.b", "calendar.c"] and c["snooze"] == 60
    assert c["look"] == {"old": False, "motion": "dezent"}
    assert M.clean_cfg({"look": {"old": 1, "motion": "wild"}})["look"] == {"old": True, "motion": "dezent"}
    assert M.clean_cfg({"look": {"motion": "voll"}})["look"]["motion"] == "voll"


# ---------------------------------------------------------------- Sondertermine
def test_vorwarnung_sondertermine():
    K = kinds("rest", "sperr", "schad")
    ev = [("2026-11-19", "sperr"), ("2026-11-17", "rest"), ("2026-12-01", "schad")]
    assert M.early_due(ev, K, date(2026, 11, 16), {}) == [("sperr", "2026-11-19", 3)]
    assert M.early_due(ev, K, date(2026, 11, 16), {"sperr": "2026-11-19"}) == []
    up = M.upcoming_special(ev, K, date(2026, 11, 17))
    assert [(u["k"], u["days"]) for u in up] == [("sperr", 2)]


# ---------------------------------------------------------------- Manager
def _mgr(cfg=None, cals=None):
    h = _Hass(cals if cals is not None else {"calendar.abfall_stadt": EV})
    m = M.MuellManager(h)
    if cfg is not None:
        _Store.DATA["fenster_heizung_muell"] = {"cfg": cfg}
    run(m.async_start())
    return h, m


def test_neustart_uebernahme_und_snapshot():
    _Store.DATA.clear()
    NOW[0] = datetime(2026, 11, 16, 19, 0, tzinfo=TZ)
    old = {"cal": "", "time": "18:30", "bins": {"rest": {"on": True, "match": "rest"}, "bio": {"on": True, "match": "bio"}, "papier": {"on": True, "match": "papier"}, "gelb": {"on": True, "match": "gelb"}}}
    h, m = _mgr(old)
    assert m.migrated and _Store.DATA["fenster_heizung_muell"]["cfg_v1"] == old
    s = run(m.snapshot())
    assert s["cals"] == ["calendar.abfall_stadt"] and s["auto"] is True            # automatisch erkannt
    st = {r["k"]: r["state"] for r in s["bins"]}
    assert st["rest"] == "out" and st["gelb"] == "out" and st["bio"] == "ok"
    assert {u["t"] for u in s["unknown"]} >= {"Altglas", "Laubsammlung"}
    assert s["today"] == "2026-11-16" and ["2026-11-17", "rest"] in s["ev"] and s["until"]["rest"] == 720 and s["ev_min"] == 18 * 60 + 30


def test_freie_arten_und_neu_abrufen():
    _Store.DATA.clear()
    NOW[0] = datetime(2026, 11, 16, 19, 0, tzinfo=TZ)
    h, m = _mgr()
    run(m.snapshot())
    n = len(h.services.calls)
    cfg = dict(m.cfg)
    cfg["kinds"] = m.cfg["kinds"] + [M.kind_from_tpl("glas"), M.kind_from_tpl("sperr"), M.kind_from_tpl("schad")]
    cfg["ignore"] = ["Laubsammlung"]
    s = run(m.async_set(cfg))
    assert len(h.services.calls) > n                         # B5: geänderte Erkennung → sofort neu abgerufen
    assert {r["k"] for r in s["bins"]} >= {"glas", "sperr", "schad"} and not s["unknown"]
    assert any(x["k"] == "pre" and x["bin"] == "sperr" for x in s["notes"])   # 19.11. liegt in der Vorwarnzeit (3 Tage)
    NOW[0] = datetime(2026, 11, 17, 8, 0, tzinfo=TZ)
    s = run(m.snapshot())
    assert any(x["k"] == "pre" and x["bin"] == "sperr" for x in s["notes"])
    # Vorwarnung am Vorabend-Zeitpunkt, drei Tage vorher
    m.cfg["push"] = {"on": True, "to": ["notify.handy"]}
    NOW[0] = datetime(2026, 11, 16, 18, 31, tzinfo=TZ)
    run(m._tick(None))
    msgs = [c[2]["message"] for c in h.services.calls if c[0] == "notify"]
    assert any("Sperrmüll in 3 Tagen" in x for x in msgs) and any(x.startswith("Morgen wird Restmüll und Gelber Sack") for x in msgs)
    run(m._tick(None))
    assert len([c for c in h.services.calls if c[0] == "notify"]) == len(msgs)   # nur einmal pro Tag


def test_spaeter_erinnern_uebersteht_neustart():
    _Store.DATA.clear()
    NOW[0] = datetime(2026, 11, 16, 19, 0, tzinfo=TZ)
    h, m = _mgr()
    m.cfg["snooze"] = 90
    run(m.async_snooze())
    su = _Store.DATA["fenster_heizung_muell"]["snooze_until"]
    assert abs(su - (time.time() + 90 * 60)) < 5
    h2, m2 = _mgr(cals={"calendar.abfall_stadt": EV})
    assert abs(m2.snooze_until - su) < 1


def test_zwischenspeicher_ohne_kalender():
    _Store.DATA.clear()
    NOW[0] = datetime(2026, 11, 16, 19, 0, tzinfo=TZ)
    h, m = _mgr()
    run(m.snapshot())
    assert _Store.DATA["fenster_heizung_muell"]["cache"]["ev"]
    h2, m2 = _mgr(cals={})                                    # nach Neustart antwortet der Kalender nicht
    assert m2.ev and m2.ev_cached
    s = run(m2.snapshot())
    assert s["cached"] and s["error"] == "Kalender nicht erreichbar" and any(r["next"] for r in s["bins"])


def test_mehrere_kalender():
    _Store.DATA.clear()
    NOW[0] = datetime(2026, 11, 16, 9, 0, tzinfo=TZ)
    cals = {"calendar.a": [("2026-11-17", "Restmüll")], "calendar.b": [("2026-11-18", "Papier")]}
    h, m = _mgr({"v": 2, "cals": ["calendar.a", "calendar.b", "calendar.fehlt"]}, cals)
    s = run(m.snapshot())
    nx = {r["k"]: r["next"] for r in s["bins"]}
    assert nx["rest"] == "2026-11-17" and nx["papier"] == "2026-11-18" and s["cal_err"] == ["calendar.fehlt"] and not s["error"]


def test_briefing_und_abholzeit_am_tag():
    _Store.DATA.clear()
    NOW[0] = datetime(2026, 11, 17, 6, 30, tzinfo=TZ)
    h, m = _mgr()
    run(m.snapshot())
    line = m.briefing_line()
    assert line.startswith("🗑️ Heute wird Restmüll und Gelber Sack abgeholt"), line
    m.cfg["kinds"][0]["until"] = "06:00"                    # Restmüll kommt früh
    assert "Restmüll" not in m.briefing_line()
    run(m.async_done("gelb"))
    assert m.done["gelb"] == "2026-11-17" and m.briefing_line() is None



# ---------------------------------------------------------------- v0.6 Erinnern
def _notes(h):
    return [c[2] for c in h.services.calls if c[0] == "notify"]


def test_meldung_mit_knoepfen_und_aktion():
    _Store.DATA.clear()
    NOW[0] = datetime(2026, 11, 16, 18, 31, tzinfo=TZ)
    h, m = _mgr()
    m.cfg["push"] = {"on": True, "to": ["notify.mobile_app_iphone", "notify.familie"], "btn": True}
    run(m.snapshot()); run(m._tick(None))
    n = [x for x in _notes(h) if x["title"] == "Tonnen rausstellen"]
    app = next(x for x in n if "data" in x)
    assert [a["action"] for a in app["data"]["actions"]] == [M.ACT_DONE, M.ACT_SNOOZE] and app["data"]["tag"] == "strom_waerme_muell"
    assert any("data" not in x for x in n)                     # andere Dienste bekommen keine Knöpfe
    ev = types.SimpleNamespace(data={"action": M.ACT_DONE})
    run(h.bus.listen["mobile_app_notification_action"](ev))
    assert m.done == {"rest": "2026-11-17", "gelb": "2026-11-17"}
    m.cfg["push"]["btn"] = False
    m.sent.clear(); h.services.calls.clear(); m.done.clear()
    run(m._tick(None))
    assert all("actions" not in x.get("data", {}) for x in _notes(h))


def test_erinnerung_am_morgen():
    _Store.DATA.clear()
    NOW[0] = datetime(2026, 11, 17, 6, 40, tzinfo=TZ)
    h, m = _mgr()
    m.cfg["push"] = {"on": True, "to": ["notify.mobile_app_iphone"], "btn": True}
    m.cfg["morning"] = {"on": True, "time": "06:30"}
    run(m.snapshot())
    m.done["gelb"] = "2026-11-17"
    run(m._tick(None)); run(m._tick(None))
    n = [x for x in _notes(h) if x["title"] == "Heute ist Abholung"]
    assert len(n) == 1 and "Heute wird Restmüll abgeholt" in n[0]["message"] and "Gelber" not in n[0]["message"]


def test_tonne_reinholen():
    _Store.DATA.clear()
    NOW[0] = datetime(2026, 11, 17, 7, 0, tzinfo=TZ)
    h, m = _mgr()
    m.cfg["back"] = {"on": True, "time": "17:00"}
    m.cfg["push"] = {"on": True, "to": ["notify.mobile_app_iphone"], "btn": True}
    run(m.snapshot()); run(m.async_done("rest"))
    assert not M.back_list(m.cfg["kinds"], m.done, m.inn, date(2026, 11, 17), 7 * 60)   # vor der Abholzeit noch nicht
    NOW[0] = datetime(2026, 11, 17, 17, 5, tzinfo=TZ)
    s = run(m.snapshot())
    r = next(x for x in s["bins"] if x["k"] == "rest")
    assert r["state"] == "back" and r["back_d"] == "2026-11-17" and s["bins"][0]["k"] == "rest"
    run(m._tick(None))
    n = [x for x in _notes(h) if x["title"] == "Tonnen reinholen"]
    assert len(n) == 1 and n[0]["data"]["actions"][0]["action"] == M.ACT_IN
    run(h.bus.listen["mobile_app_notification_action"](types.SimpleNamespace(data={"action": M.ACT_IN})))
    s = run(m.snapshot())
    assert m.inn["rest"] == "2026-11-17" and next(x for x in s["bins"] if x["k"] == "rest")["state"] != "back"
    NOW[0] = datetime(2026, 11, 20, 9, 0, tzinfo=TZ)   # nach drei Tagen fällt es von selbst weg
    assert not M.back_list(m.cfg["kinds"], m.done, {}, date(2026, 11, 20), 9 * 60)


def test_licht_helligkeit_wechsel_und_vorher():
    _Store.DATA.clear()
    NOW[0] = datetime(2026, 11, 16, 18, 40, tzinfo=TZ)
    h, m = _mgr()
    h.states.d["light.flur"] = _St("on", {"brightness": 120, "color_mode": "color_temp", "color_temp_kelvin": 2700})
    m.cfg["light"] = {"on": True, "ent": "light.flur", "bri": 30, "restore": True}
    run(m.snapshot()); run(m._tick(None)); run(m._tick(None))
    on = [c[2] for c in h.services.calls if c[0] == "light" and c[1] == "turn_on"]
    assert on[0]["brightness_pct"] == 30 and on[0]["rgb_color"] != on[1]["rgb_color"]   # zwei Tonnen: Farbe wechselt
    assert m.light_prev == {"on": True, "brightness": 120, "color_temp_kelvin": 2700}
    run(m.async_done("rest")); run(m.async_done("gelb"))
    last = h.services.calls[-1]
    assert last[1] == "turn_on" and last[2] == {"entity_id": "light.flur", "brightness": 120, "color_temp_kelvin": 2700} and not m.light_on


def test_einstellungen_v06():
    c = M.clean_cfg({"push": {"on": True, "btn": False}, "morning": {"on": True, "time": "6:30"}, "back": {"on": 1, "time": "18:15"}, "light": {"bri": 500}})
    assert c["push"]["btn"] is False and c["morning"] == {"on": True, "time": "06:30"} and c["back"] == {"on": True, "time": "18:15"}
    assert c["light"]["bri"] == 100 and c["light"]["restore"] is True


# ---------------------------------------------------------------- v0.8 Haushalt
class _Pres:
    def __init__(self, data):
        self.data = data


class _Wx:
    def __init__(self, **st):
        self.st = st


def test_wer_ist_dran_wechsel_und_zuhause():
    _Store.DATA.clear()
    NOW[0] = datetime(2026, 11, 16, 18, 31, tzinfo=TZ)
    h, m = _mgr()
    h.states.d.update({"person.anna": _St("home", {"friendly_name": "Anna"}), "person.ben": _St("not_home", {"friendly_name": "Ben"})})
    c = dict(m.cfg)
    c["turn"] = {"on": True, "mode": "pickup", "home": True, "people": [{"pid": "person.ben", "to": "notify.mobile_app_ben"}, {"pid": "person.anna", "to": "notify.mobile_app_anna"}]}
    c["push"] = {"on": True, "to": ["notify.mobile_app_anna", "notify.mobile_app_ben"], "btn": True}
    s = run(m.async_set(c))
    assert m.cfg["turn"]["since"] == "2026-11-16" and s["turn"][0]["name"] == "Ben" and s["turn"][1]["name"] == "Anna"
    run(m._tick(None))
    n = [x for x in _notes(h) if x["title"] == "Tonnen rausstellen"]
    assert len(n) == 1 and n[0]["message"].startswith("Anna ist dran.")    # Ben ist nicht zu Hause → Anna
    s = run(m.async_take("2026-11-20", "person.ben"))
    t20 = next(t for t in s["turn"] if t["d"] == "2026-11-20")
    assert t20["name"] == "Ben" and t20["ovr"]
    assert M.turn_index("week", "2026-11-16", "2026-11-30", []) == 2


def test_diesmal_nicht_und_verlauf():
    _Store.DATA.clear()
    NOW[0] = datetime(2026, 11, 16, 18, 31, tzinfo=TZ)
    h, m = _mgr()
    m.cfg["push"] = {"on": True, "to": ["notify.handy"], "btn": True}
    run(m.snapshot())
    s = run(m.async_skip("rest"))
    assert next(x for x in s["bins"] if x["k"] == "rest")["state"] == "skip"
    run(m._tick(None))
    msg = [x["message"] for x in _notes(h) if x["title"] == "Tonnen rausstellen"][0]
    assert "Restmüll" not in msg and "Gelber Sack" in msg
    run(m.async_done("gelb", "tag", "Anna"))
    NOW[0] = datetime(2026, 11, 18, 9, 0, tzinfo=TZ)
    s = run(m.snapshot())
    H = {(x["d"], x["k"]): x for x in s["hist"]}
    assert H[("2026-11-17", "rest")]["st"] == "skip" and H[("2026-11-17", "gelb")]["st"] == "out" and H[("2026-11-17", "gelb")]["how"] == "tag" and H[("2026-11-17", "gelb")]["who"] == "Anna"
    run(m.async_unskip("rest"))
    assert not m.skip and not any(x["k"] == "rest" and x["act"] == "skip" for x in m.hist)


def test_kosten_nur_wenn_draussen():
    ev = [("2026-01-06", "rest"), ("2026-01-20", "rest"), ("2026-02-03", "rest"), ("2026-02-17", "rest"), ("2026-03-03", "rest")]
    st = M.stats(ev, date(2026, 2, 20), 2, 5.0, "out", {"2026-02-03"}, {"2026-02-17"}, "2026-02-01")
    assert st["done"] == 3 and st["skipped"] == 1 and st["total"] == 4 and st["extra"] == 1 and st["cost"] == 5.0 and st["not_out"] == 0
    st = M.stats(ev, date(2026, 2, 20), 2, 5.0, "cal", set(), {"2026-02-17"}, "")
    assert st["done"] == 3


def test_urlaub_und_sturm():
    _Store.DATA.clear()
    NOW[0] = datetime(2026, 11, 16, 18, 31, tzinfo=TZ)
    h, m = _mgr()
    h.data["fenster_heizung"] = {"presence": _Pres({"mode": "vacation", "from": "2026-11-17", "to": "2026-11-21"}), "wetter": _Wx(storm={"a": True})}
    m.cfg["push"] = {"on": True, "to": ["notify.handy"], "btn": True}
    m.cfg["wxmode"] = "shift"
    s = run(m.snapshot())
    assert any(x["k"] == "vac" and "Restmüll" in x["text"] for x in s["notes"])
    run(m._tick(None))
    t = [x["title"] for x in _notes(h)]
    assert "Sturm gemeldet" in t and "Tonnen rausstellen" not in t and "Abholung im Urlaub" in t and m.wx_shift == "2026-11-17"
    NOW[0] = datetime(2026, 11, 17, 6, 35, tzinfo=TZ)            # Morgen-Erinnerung kommt, obwohl sie aus ist
    run(m._tick(None))
    assert "Heute ist Abholung" in [x["title"] for x in _notes(h)]


# ---------------------------------------------------------------- v0.9 Vorabversion
def test_entitaeten_und_ereignis():
    _Store.DATA.clear()
    NOW[0] = datetime(2026, 11, 16, 19, 0, tzinfo=TZ)
    h, m = _mgr()
    run(m.snapshot())
    P = h.states.pub
    assert P["sensor.strom_waerme_muell_naechste_abholung"][0] == "2026-11-17" and P["sensor.strom_waerme_muell_naechste_abholung"][1]["arten"] == ["Restmüll", "Gelber Sack"]
    assert P["sensor.strom_waerme_muell_bio"][0] == "4" and P["binary_sensor.strom_waerme_muell_rausstellen"][0] == "on"
    run(m.async_done("rest", "tipp", "Anna"))
    ev = [d for e, d in h.bus.fired if e == M.EVENT]
    assert any(d["typ"] == "draussen" and d["art"] == "rest" and d["wer"] == "Anna" for d in ev)
    m.cfg["ha"] = False
    run(m.snapshot())
    assert not h.states.pub


def test_jahresuebersicht():
    ev = [("2026-01-06", "rest"), ("2026-11-03", "rest"), ("2026-11-17", "rest"), ("2026-12-01", "rest"), ("2026-11-06", "bio")]
    K = kinds("rest", "bio")
    H = [{"d": "2026-11-03", "k": "rest", "act": "out"}, {"d": "2026-11-06", "k": "bio", "act": "skip"}]
    y = M.year_stats(ev, K, H, date(2026, 11, 18), "2026-11-01")
    r = {x["k"]: x for x in y["rows"]}
    assert r["rest"]["plan"] == 4 and r["rest"]["past"] == 3 and r["rest"]["tracked"] == 2 and r["rest"]["out"] == 1 and r["rest"]["none"] == 1
    assert r["bio"]["skip"] == 1 and r["bio"]["none"] == 0 and y["tot"]["rate"] == 50


def test_vorrat_saecke():
    _Store.DATA.clear()
    NOW[0] = datetime(2026, 11, 16, 19, 0, tzinfo=TZ)
    h, m = _mgr()
    m.cfg["push"] = {"on": True, "to": ["notify.handy"], "btn": True}
    m.cfg["bags"] = {"on": True, "kind": "gelb", "per": 2, "warn": 5}
    run(m.snapshot()); run(m.async_bags(6))
    run(m.async_done("gelb"))
    assert m.bags == 4 and any(x["title"] == "Säcke holen" for x in _notes(h))
    run(m.async_undo("gelb"))
    assert m.bags == 6


def test_labs_automatisch_erkennen():
    _Store.DATA.clear()
    NOW[0] = datetime(2026, 11, 16, 19, 0, tzinfo=TZ)
    h, m = _mgr()
    m.cfg["labs_auto"] = True
    m.cfg["back"] = {"on": True, "time": "17:00"}
    m.cfg["kinds"][0]["sensor"], m.cfg["kinds"][0]["sensor_out"] = "binary_sensor.tonne_rest", "off"
    h.states.d["binary_sensor.tonne_rest"] = _St("on", {})
    run(m.snapshot()); run(m._tick(None))
    assert "rest" not in m.done                                 # erster Wert: nur merken
    h.states.d["binary_sensor.tonne_rest"] = _St("off", {})     # Tonne vom Stellplatz weg
    run(m._tick(None))
    assert m.done.get("rest") == "2026-11-17" and m.hist[-1]["how"] == "auto"
    NOW[0] = datetime(2026, 11, 17, 18, 0, tzinfo=TZ)
    h.states.d["binary_sensor.tonne_rest"] = _St("on", {})      # wieder am Stellplatz
    run(m._tick(None))
    assert m.inn.get("rest") == "2026-11-17"
    c = M.clean_cfg({"kinds": [{"id": "rest", "sensor": "binary_sensor.x", "sensor_out": "kaputt"}]})
    assert c["kinds"][0]["sensor"] == "binary_sensor.x" and c["kinds"][0]["sensor_out"] == "on"


# ---------------------------------------------------------------- v1.0
def test_echte_entitaeten_mit_neuem_kern():
    _Store.DATA.clear()
    NOW[0] = datetime(2026, 11, 16, 19, 0, tzinfo=TZ)
    h, m = _mgr()
    run(m.snapshot())
    assert "sensor.strom_waerme_muell_rest" in h.states.pub      # alter Kern: Zustände
    pushed = []
    h.data["fenster_heizung"] = {"muell_ent": 1, "muell_push": lambda: pushed.append(1)}
    s = run(m.snapshot())
    assert not h.states.pub and pushed and s["ents_real"]          # neuer Kern: Zustände geräumt, Entitäten übernehmen
    v = m.values()
    assert v["sensor"]["naechste_abholung"]["value"] == "2026-11-17" and v["sensor"]["bio"]["value"] == 4
    assert v["binary_sensor"]["rausstellen"]["value"] is True and v["binary_sensor_keys"] == ["rausstellen", "reinholen"]
    n = len(pushed)
    run(m.snapshot())
    assert len(pushed) == n                                         # ohne Änderung keine neue Meldung
    m.cfg["ha"] = False
    run(m.snapshot())
    assert m.values() == {"sensor": {}, "binary_sensor": {}} and len(pushed) == n + 1

if __name__ == "__main__":
    fails = 0
    for name, fn in list(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
                print("ok  ", name)
            except Exception as e:  # noqa: BLE001
                fails += 1
                import traceback
                traceback.print_exc()
                print("FEHLER", name, repr(e))
    sys.exit(1 if fails else 0)
