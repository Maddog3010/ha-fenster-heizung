"""Tests für Modul 17 Müllabfuhr (addons/muell/manager.py) ohne Home Assistant.

Ausführen: python3 -m pytest tests  oder  python3 tests/test_muell.py
Geprüft werden Erkennung der Abfallarten, „Nicht erkannt“, Zustände und Abholzeit, Übernahme der alten Tonnen (Schema 1 → 2),
Vorwarnung für Sondertermine, Erinnerung, „Später erinnern“ über einen Neustart, Zwischenspeicher, mehrere Kalender und Briefing.
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


def _stub(name: str, **attrs) -> types.ModuleType:
    m = sys.modules.get(name) or types.ModuleType(name)
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
    sys.modules["homeassistant.util.dt"] = dtm
    sys.modules["homeassistant.util"].dt = dtm
    _stub("custom_components.fenster_heizung.backup", SafeStore=_Store)
    _stub("custom_components.fenster_heizung.const", DOMAIN="fenster_heizung")
    _stub("custom_components.fenster_heizung.diag", diag_log=lambda h, lvl, msg, **k: LOG.append(msg))
    spec = importlib.util.spec_from_file_location("muell_manager", P)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


M = _load()


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


class _Hass:
    def __init__(self, cals):
        self.services, self.data = _Services(cals), {}


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
