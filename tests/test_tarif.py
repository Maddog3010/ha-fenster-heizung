"""Tests für Modul 14 (tarif.py) ohne Home Assistant.

Ausführen: python3 -m pytest tests  oder  python3 tests/test_tarif.py
Geprüft werden die Formate der Preis-Sensoren, Einheiten, Sommer-/Winterzeit, Endpreis, Netzentgelt, Stufen,
beste Fenster und der Dienst mit Tibber, Ersatzquelle und Preis-Historie.
"""
from __future__ import annotations

import asyncio
import importlib.util
import pathlib
import sys
import types
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

ROOT = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung"
TZ = ZoneInfo("Europe/Berlin")
NOW = [datetime(2026, 11, 17, 17, 40, tzinfo=TZ)]
SENT: list = []
SCHED: list = []


def _stub(name: str, **attrs) -> types.ModuleType:
    m = sys.modules.get(name) or types.ModuleType(name)
    for k, v in attrs.items():
        setattr(m, k, v)
    sys.modules[name] = m
    return m


def _parse(s):
    try:
        t = datetime.fromisoformat(str(s).replace("Z", "+00:00"))
    except ValueError:
        return None
    return t


class _Store:
    def __init__(self, *a, **k):
        self.data, self.saved = None, None

    async def async_load(self):
        return self.data

    def async_delay_save(self, fn, delay=0):
        self.saved = fn()


def _load():
    for n in ("homeassistant", "homeassistant.helpers", "homeassistant.util"):
        _stub(n)
    _stub("homeassistant.core", CALLBACK_TYPE=object, HomeAssistant=object)
    _stub("homeassistant.helpers.dispatcher", async_dispatcher_send=lambda *a, **k: SENT.append(a[1:]))
    ev = sys.modules.get("homeassistant.helpers.event") or types.ModuleType("homeassistant.helpers.event")
    ev.async_track_time_interval = lambda *a, **k: (lambda: None)
    ev.async_track_state_change_event = lambda *a, **k: (lambda: None)
    ev.async_track_point_in_utc_time = lambda h, fn, when: (SCHED.append((fn, when)) or (lambda: None))
    sys.modules["homeassistant.helpers.event"] = ev
    dtm = types.ModuleType("homeassistant.util.dt")
    dtm.DEFAULT_TIME_ZONE = TZ
    dtm.parse_datetime = _parse
    dtm.now = lambda: NOW[0]
    dtm.start_of_local_day = lambda: NOW[0].replace(hour=0, minute=0, second=0, microsecond=0)
    dtm.utc_from_timestamp = lambda ts: datetime.fromtimestamp(ts, tz=timezone.utc)
    sys.modules["homeassistant.util.dt"] = dtm
    sys.modules["homeassistant.util"].dt = dtm
    _stub("fhtar").__path__ = [str(ROOT)]
    _stub("fhtar.backup", SafeStore=_Store)
    _stub("fhtar.const", DOMAIN="fenster_heizung")
    spec = importlib.util.spec_from_file_location("fhtar.tarif", ROOT / "tarif.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


T = _load()
CFG = T.default_cfg()


def day0(d=17, m=11):
    return datetime(2026, m, d, tzinfo=TZ)


# ---------------------------------------------------------------- Formate
def test_nordpool_raw_eur():
    a = {"raw_today": [{"start": (day0() + timedelta(minutes=15 * i)).isoformat(), "end": (day0() + timedelta(minutes=15 * (i + 1))).isoformat(), "value": 0.10 + i * 0.001} for i in range(96)],
         "raw_tomorrow": [{"start": (day0(18) + timedelta(hours=i)).isoformat(), "value": 0.2} for i in range(24)], "unit_of_measurement": "EUR/kWh"}
    rows = T.parse_series(a, "EUR/kWh", NOW[0])
    assert len(rows) == 120
    s = T.to_series(rows, T._factor([v for _, v in rows], "EUR/kWh"))
    assert s[0]["d"] == 900 and abs(s[0]["ct"] - 10.0) < 1e-9 and s[-1]["d"] == 3600 and abs(s[-1]["ct"] - 20) < 1e-9


def test_zahlenliste_und_sommerzeit():
    NOW[0] = datetime(2026, 3, 29, 12, tzinfo=TZ)  # Umstellung: 23 Stunden
    rows = T.parse_series({"today": [0.3] * 92}, "", NOW[0])
    assert len(rows) == 92 and rows[-1][0].hour == 23 and rows[-1][0].minute == 45 and rows[8][0].hour == 3  # 2 Uhr fehlt
    rows = T.parse_series({"prices_today": [30.0] * 23}, "ct/kWh", NOW[0])
    assert len(rows) == 23 and rows[2][0].timestamp() - rows[1][0].timestamp() == 3600
    NOW[0] = datetime(2026, 11, 17, 17, 40, tzinfo=TZ)


def test_epex_octopus_awattar():
    e = {"data": [{"start_time": (day0() + timedelta(hours=i)).isoformat(), "end_time": "", "price_ct_per_kwh": 8.5} for i in range(24)]}
    rows = T.parse_series(e, "ct/kWh", NOW[0])
    assert len(rows) == 24 and T._factor([v for _, v in rows], "ct/kWh") == 1
    o = {"rates": [{"start": (day0() + timedelta(minutes=30 * i)).isoformat(), "value_inc_vat": 0.25} for i in range(48)]}
    assert len(T.parse_series(o, "", NOW[0])) == 48
    a = {"data": [{"start": (day0() + timedelta(hours=i)).isoformat(), "marketprice": 95.0} for i in range(24)]}
    rows = T.parse_series(a, "EUR/MWh", NOW[0])
    assert T._factor([v for _, v in rows], "EUR/MWh") == 0.1  # €/MWh -> ct/kWh
    assert T._factor([120.0, 300.0], "") == 0.1 and T._factor([0.3], "") == 100 and T._factor([28.0], "") == 1


def test_endpreis_und_netzentgelt():
    c = T.clean_cfg({"add": 18.6, "vat": 19, "nne": {"on": True}})
    assert abs(T.end_price(10.0, c) - 34.034) < 1e-6
    assert T.nne_add(datetime(2026, 11, 17, 18, tzinfo=TZ).timestamp(), c) == 6.1
    assert T.nne_add(datetime(2026, 11, 17, 3, tzinfo=TZ).timestamp(), c) == -4.2
    assert T.nne_add(datetime(2026, 11, 17, 12, tzinfo=TZ).timestamp(), c) == 0
    assert T.nne_add(datetime(2026, 11, 17, 18, tzinfo=TZ).timestamp(), T.default_cfg()) == 0


def _series(vals, start=None, d=900):
    st = int((start or day0()).timestamp())
    return [{"s": st + i * d, "d": d, "ct": v} for i, v in enumerate(vals)]


def test_stufen_und_tageswerte():
    s = _series([30.0] * 40 + [20.0] * 16 + [40.0] * 40)
    st = T.day_stats(s, day0().date())
    assert st["n"] == 96 and abs(st["avg"] - (30 * 40 + 20 * 16 + 40 * 40) / 96) < 0.01 and st["min"] == 20 and st["max"] == 40
    assert T.level(20, st["avg"], CFG) == "cheap" and T.level(40, st["avg"], CFG) == "dear" and T.level(st["avg"], st["avg"], CFG) == "normal" and T.level(-1, 30, CFG) == "neg"


def test_bestes_fenster_und_stunden():
    s = _series([30.0] * 40 + [20.0] * 12 + [40.0] * 44)
    b = T.best_window(s, day0().timestamp(), 3)
    assert b["s"] == int(day0().timestamp()) + 40 * 900 and b["avg"] == 20.0
    b2 = T.best_window(s, day0().timestamp() + 45 * 900, 3)  # erst ab 11:15
    assert b2["s"] >= int(day0().timestamp()) + 45 * 900
    h = T.hourly(s)
    assert len(h) == 24 and h[10]["ct"] == 20.0
    sl = T.cheapest_slots(s, day0().timestamp(), 3, 1.0)
    assert len(sl) == 3 and all(x["e"] - x["s"] == 3600 for x in sl) and sl[0]["avg"] == 20.0
    assert T.best_window(s[:4], day0().timestamp(), 3) is None  # zu wenig Daten


# ---------------------------------------------------------------- Dienst
class _States:
    def __init__(self):
        self.d = {}

    def get(self, e):
        return self.d.get(e)

    def async_all(self, dom):
        return [s for k, s in self.d.items() if k.startswith(dom + ".")]


class St:
    def __init__(self, eid, state, attrs):
        self.entity_id, self.state, self.attributes = eid, state, attrs


class Tib:
    def __init__(self, prices, ok=True):
        self.connected, self.res, self._p, self.ok = True, "q", prices, ok

    async def async_prices(self):
        return {"prices": self._p} if self.ok else None


def _mgr(tibber=None, sensor=None, fix=32.0):
    h = types.SimpleNamespace(states=_States(), data={"fenster_heizung": {"wasser": types.SimpleNamespace(modules={"on": {"dt": True}}),
                                                                           "haus": types.SimpleNamespace(data={"price": {"price": fix, "price_mode": "entity" if sensor else "fix", "price_sensor": sensor or ""}})}})
    h.async_create_task = lambda c: c.close()
    h.calls, h.events = [], []
    h.bus = types.SimpleNamespace(async_fire=lambda e, d: h.events.append((e, d)))

    async def _call(dom, name, data):
        h.calls.append((dom, name, data))
    h.services = types.SimpleNamespace(has_service=lambda d, n: True, async_call=_call)
    if tibber is not None:
        h.data["fenster_heizung"]["tibber"] = tibber
    return h, T.TarifManager(h)


def run(c):
    d = T.dt_util  # das Stub-Modul wird mit anderen Testdateien geteilt: kurz setzen, danach zurück
    keys = ("DEFAULT_TIME_ZONE", "parse_datetime", "now", "start_of_local_day", "utc_from_timestamp")
    old = {k: getattr(d, k, None) for k in keys}
    d.DEFAULT_TIME_ZONE, d.parse_datetime, d.now = TZ, _parse, (lambda: NOW[0])
    d.start_of_local_day = lambda: NOW[0].replace(hour=0, minute=0, second=0, microsecond=0)
    d.utc_from_timestamp = lambda ts: datetime.fromtimestamp(ts, tz=timezone.utc)
    try:
        return asyncio.run(c)
    finally:
        for k, v in old.items():
            if v is None:
                d.__dict__.pop(k, None)
            else:
                setattr(d, k, v)


def test_dienst_tibber_ersatz_und_historie():
    tib = [{"start": day0() + timedelta(minutes=15 * i), "ct": 25.0 + (10 if 68 <= i < 80 else 0) - (8 if 120 <= i < 132 else 0)} for i in range(192)]
    nord = {"raw_today": [{"start": (day0() + timedelta(hours=i)).isoformat(), "value": 0.08} for i in range(24)], "unit_of_measurement": "EUR/kWh"}
    h, m = _mgr(Tib(tib), "sensor.nordpool_kwh_de")
    h.states.d["sensor.nordpool_kwh_de"] = St("sensor.nordpool_kwh_de", "0.08", nord)

    async def go():
        await m._tick(None)
        assert m.src == "tibber" and len(m.series) == 192
        s = m.snapshot()
        assert s["now"]["ct"] == 35.0 and s["now"]["lv"] == "dear" and s["tomorrow"]["n"] == 96
        assert s["best_tomorrow"]["avg"] == 17.0 and s["today"]["max"] == 35
        assert "2026-11-17" in m.hist and "2026-11-18" not in m.hist  # morgen erst, wenn er da ist
        assert SENT
        m.hass.data["fenster_heizung"]["tibber"].ok = False  # Tibber fällt aus -> Preis-Sensor (Börse -> Endpreis)
        await m._tick(None)
        assert m.src == "sensor" and m.boerse and abs(m.series[0]["ct"] - T.end_price(8.0, m.cfg)) < 1e-6
        found = m.found()
        assert found[0]["id"] == "tibber" and any(f["id"] == "sensor.nordpool_kwh_de" and f["boerse"] for f in found)
        h.data["fenster_heizung"].pop("tibber")
        h.states.d.clear()
        await m._tick(None)
        assert m.src == "fix" and m.at() == 32.0
        r = await m.async_set({"src": "sensor", "down": 2, "res": "h"})
        assert r["cfg"]["down"] == 2 and r["cfg"]["res"] == "h" and r["src"] == "fix"
    run(go())


def test_speichern_nur_bei_aenderung():
    h, m = _mgr(Tib([{"start": day0() + timedelta(hours=i), "ct": 30.0} for i in range(24)]))

    async def go():
        await m._tick(None)
        m._store.saved = None
        await m._tick(None)
        assert m._store.saved is None
    run(go())


def test_einstellungen_geklemmt():
    c = T.clean_cfg({"src": "x", "sensor": "light.a", "add": 99, "vat": -1, "win_h": 20, "nne": {"on": 1, "ht_ct": 99}})
    assert c["src"] == "auto" and c["sensor"] == "" and c["add"] == 60 and c["vat"] == 0 and c["win_h"] == 8 and c["nne"]["on"] and c["nne"]["ht_ct"] == 30


# ---------------------------------------------------------------- v0.8
def test_profil_und_geraetefenster():
    prof = T.profile(None, 3600, 1.0)
    assert len(prof) == 4 and abs(sum(l * k for _, l, k in prof) / 3600 - 1.0) < 1e-9
    cv = [[0, 0, 0, 2000], [600, 0, 0, 200], [1800, 0, 0, 200], [3000, 0, 0, 100]]
    p2 = T.profile(cv, 3600, 1.0)
    assert abs(sum(l * k for _, l, k in p2) / 3600 - 1.0) < 1e-6 and p2[0][2] > p2[1][2]  # Heizphase am Anfang
    s = _series([30.0] * 40 + [20.0] * 12 + [40.0] * 44)
    at = lambda t: next((x["ct"] for x in s if x["s"] <= t < x["s"] + x["d"]), None)  # noqa: E731
    now = day0().timestamp() + 3600
    w = T.best_dev(prof, now, s[-1]["s"] + 900, at, lambda t: 0.0, 8.0)
    assert w["s"] == int(day0().timestamp()) + 40 * 900 and w["avg"] == 20.0 and w["save"] == 0.1 and w["now_avg"] == 30.0
    w2 = T.best_dev(prof, now, s[-1]["s"] + 900, at, lambda t: 0.0, 8.0, by_h=8)  # fertig bis 8 Uhr: nur vor dem günstigen Block
    assert w2["e"] <= day0().timestamp() + 8 * 3600 and w2["avg"] == 30.0
    w3 = T.best_dev(prof, now, s[-1]["s"] + 900, at, lambda t: 0.0, 8.0, earliest_h=12)
    assert w3["s"] >= day0().timestamp() + 12 * 3600
    sun = lambda t: 5000.0 if day0().timestamp() + 16 * 3600 <= t < day0().timestamp() + 18 * 3600 else 0.0  # noqa: E731
    w4 = T.best_dev(prof, now, s[-1]["s"] + 900, at, sun, 8.0)
    assert w4["s"] == int(day0().timestamp()) + 16 * 3600 and w4["sun"] == 100 and w4["avg"] == 8.0  # Sonne schlägt Preis
    assert T.periods(s, lambda c: c <= 20)[0] == {"s": s[40]["s"], "e": s[52]["s"], "min": 20.0, "max": 20.0}


def _gm(devs, durs, rlog):
    return types.SimpleNamespace(_cfg=lambda: {"devices": devs, "notify": ["notify.handy"]}, durs=durs, rlog=rlog, typ={}, _run={}, _fc={})


def test_dienst_fenster_alarm_erinnerung():
    tib = [{"start": day0() + timedelta(minutes=15 * i), "ct": 30.0 - (12 if 76 <= i < 84 else 0) - (35 if 120 <= i < 124 else 0) + (14 if 72 <= i < 76 else 0)} for i in range(192)]
    h, m = _mgr(Tib(tib))
    devs = [{"id": "wm", "name": "Waschmaschine", "typ": "wasch"}, {"id": "kb", "name": "Kühlschrank", "typ": "kuehl"}, {"id": "tr", "name": "Trockner", "typ": "trockner"}]
    h.data["fenster_heizung"]["geraete"] = _gm(devs, {"wm": [3600, 3700, 3500], "kb": [600, 700], "tr": [5400]}, [{"d": "wm", "kwh": 0.9}])
    NOW[0] = datetime(2026, 11, 17, 17, 40, tzinfo=TZ)
    SCHED.clear()

    async def go():
        m.cfg = T.clean_cfg({"alarm": {"below": {"on": True, "ct": 20}, "above": {"on": True, "ct": 40}, "neg": {"on": True}, "tomorrow": {"on": True}, "quiet": {"on": False}}})
        await m._tick(None)
        d = {x["id"]: x for x in m.devs}
        assert not d["kb"]["on"] and d["kb"]["w"] is None and d["tr"]["w"] is None  # Kühlschrank aus, Trockner erst ein Lauf
        w = d["wm"]["w"]
        assert w and w["s"] == int((day0(18) + timedelta(hours=6)).timestamp()) and abs(w["avg"] + 5.0) < 0.01 and w["save"] > 0  # negativer Preis morgen früh
        kinds = [e[1]["typ"] for e in h.events]
        assert kinds == ["tomorrow"]  # 17:40: teuer erst ab 18 Uhr
        m.cfg["alarm"]["lead"] = 30  # mit Vorlauf 30 Min. kommt „teuer ab 18 Uhr“ schon jetzt
        await m._tick(None)
        assert h.events[-1][1]["typ"] == "above" and "18:00–19:00" in h.events[-1][1]["text"]
        n = len(h.events)
        NOW[0] = datetime(2026, 11, 17, 18, 10, tzinfo=TZ)
        await m._tick(None)
        assert len(h.events) == n  # nicht doppelt
        m.cfg["alarm"]["lead"] = 0
        NOW[0] = datetime(2026, 11, 17, 19, 5, tzinfo=TZ)
        await m._tick(None)
        assert [e[1]["typ"] for e in h.events[n:]] == ["below"]
        NOW[0] = datetime(2026, 11, 18, 6, 0, tzinfo=TZ)
        m.cfg["alarm"]["quiet"] = {"on": True, "from": 22, "to": 7}
        await m._tick(None)
        assert all(e[1]["typ"] != "neg" for e in h.events)  # Ruhezeit
        m.cfg["alarm"]["quiet"]["on"] = False
        await m._tick(None)
        assert h.events[-1][1]["typ"] == "neg" and m._targets() == ["notify.handy"]  # Rückfall auf die Meldedienste aus Modul 4
        NOW[0] = datetime(2026, 11, 17, 17, 40, tzinfo=TZ)
        await m._tick(None)
        r = m.set_remind("wm", True)
        assert r["ok"] and SCHED and m.rem["wm"] == r["ts"]
        await SCHED[-1][0](None)
        assert "wm" not in m.rem and h.events[-1][1]["typ"] == "geraet" and "jetzt starten" in h.events[-1][1]["titel"]
        assert m.set_remind("kb", True)["ok"] is False
        s = m.snapshot()
        assert s["alarm"]["below"]["s"] == int((day0() + timedelta(hours=19)).timestamp()) and s["alog"][0]["k"] == "geraet"
        c = T.clean_cfg({"devs": {"wm": {"on": False, "by": 18}}, "alarm": {"lead": 37, "to": ["notify.a", "x", "notify.a"]}})
        assert c["devs"]["wm"] == {"on": False, "by": 18, "from": None} and c["alarm"]["lead"] == 30 and c["alarm"]["to"] == ["notify.a"]
    run(go())


if __name__ == "__main__":
    fails = 0
    for name, fn in list(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
                print("ok  ", name)
            except Exception as e:  # noqa: BLE001
                fails += 1
                print("FEHLER", name, repr(e))
    sys.exit(1 if fails else 0)
