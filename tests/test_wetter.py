"""Tests für Modul 9 (wetter.py) ohne Home Assistant.

Ausführen: python3 -m pytest tests  oder  python3 tests/test_wetter.py
Home Assistant wird durch kleine Platzhalter ersetzt. Geprüft werden Warnmodell, Stufen, Glätte, Starkregen,
amtliche Warnungen (DWD mit mehreren Warnungen und Vorabinformation, NINA, MeteoAlarm), Übernahme alter
Einstellungen und der Ablauf im Manager (Beginn, Stufenwechsel, Hysterese, Ende, veraltete Quelle).
"""
from __future__ import annotations

import asyncio
import importlib.util
import pathlib
import sys
import types
from datetime import datetime, timedelta, timezone

ROOT = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung"
NOW = [datetime(2026, 11, 12, 13, 0, tzinfo=timezone.utc)]


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
    return t if t.tzinfo else t.replace(tzinfo=timezone.utc)


class _Reg:
    def __init__(self):
        self.entities = {}

    def async_get(self, eid):
        return self.entities.get(eid)


REG = _Reg()
SENT: list = []


class _Store:
    def __init__(self, hass, v, key, **kw):
        self.data, self.saved, self.snaps = None, None, 0

    async def async_load(self):
        return self.data

    def async_delay_save(self, fn, delay=0):
        self.saved = fn()

    def snapshot_now(self):
        self.snaps += 1


def _load():
    if "fh_wetter" in sys.modules:
        return sys.modules["fh_wetter"]
    for n in ("homeassistant", "homeassistant.helpers", "homeassistant.util"):
        _stub(n)
    _stub("homeassistant.config_entries", ConfigEntryState=type("S", (), {"LOADED": object()}))
    _stub("homeassistant.core", CALLBACK_TYPE=object, HomeAssistant=object)
    _stub("homeassistant.helpers.entity_registry", async_get=lambda hass: REG)
    sys.modules["homeassistant.helpers"].entity_registry = sys.modules["homeassistant.helpers.entity_registry"]
    _stub("homeassistant.helpers.event", async_track_time_interval=lambda *a, **k: (lambda: None))
    SENT.clear()
    _stub("homeassistant.helpers.dispatcher", async_dispatcher_send=lambda *a, **k: SENT.append(a[1:]))
    _stub("homeassistant.helpers.storage", Store=object)
    _stub("homeassistant.util.dt", now=lambda: NOW[0], utcnow=lambda: NOW[0], parse_datetime=_parse, as_local=lambda t: t, utc_from_timestamp=lambda ts: datetime.fromtimestamp(ts, timezone.utc))
    sys.modules["homeassistant.util"].dt = sys.modules["homeassistant.util.dt"]
    _stub("fhpkg").__path__ = [str(ROOT)]
    _stub("fhpkg.backup", SafeStore=_Store)
    _stub("fhpkg.const", DOMAIN="fenster_heizung")
    spec = importlib.util.spec_from_file_location("fhpkg.wetter", ROOT / "wetter.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    sys.modules["fh_wetter"] = mod
    return mod


W = _load()


class St:
    def __init__(self, entity_id, state, attrs=None, age_min=1):
        self.entity_id, self.state, self.attributes = entity_id, state, attrs or {}
        self.last_updated = self.last_reported = NOW[0] - timedelta(minutes=age_min)


def cfg(**over):
    c = W.default_cfg()
    for k, v in over.items():
        c["warn"][k].update(v)
    return W.clean_cfg(c)


# ---------------------------------------------------------------- Stufen
def test_sturm_stufen():
    c = cfg(storm={"kmh": 60, "kmh3": 90})
    L = lambda w, h=False: W.level_of(c, "storm", {"wind": w}, h)  # noqa: E731
    assert [L(50), L(60), L(75), L(90), L(120)] == [0, 1, 2, 3, 4]
    assert L(56, True) == 1 and L(54, True) == 0  # 5 km/h Spielraum beim Halten


def test_starkregen_mm():
    c = cfg(rain={"on": True, "mm": 10, "mm3": 25})
    L = lambda r, cond=None: W.level_of(c, "rain", {"rain": r, "cond": cond})  # noqa: E731
    assert [L(3), L(10), L(18), L(30)] == [0, 1, 2, 3]
    assert L(None, "pouring") == 1 and L(2, "pouring") == 1 and L(None, "rainy") == 0


def test_gewitter_hagel_getrennt():
    c = cfg()
    assert W.level_of(c, "thunder", {"cond": "lightning-rainy"}) == 2
    assert W.level_of(c, "thunder", {"cond": "hail"}) == 0
    assert W.level_of(c, "hail", {"cond": "hail"}) == 3


def test_glaette():
    c = cfg(frost={"temp": 0, "ice": True, "ice_temp": 1})
    assert W.level_of(c, "frost", {"temp": 0.5, "cond": "rainy"}) == 1  # nass und kalt
    assert W.level_of(c, "frost", {"temp": 0.5, "cond": "cloudy", "hum": 93}) == 1
    assert W.level_of(c, "frost", {"temp": 0.5, "cond": "sunny", "hum": 60}) == 0  # trocken: keine Glätte
    assert W.level_of(c, "frost", {"temp": 2.5, "cond": "rainy"}) == 0
    assert W.level_of(c, "frost", {"temp": -1, "cond": "sunny"}) == 1  # Frost
    c2 = cfg(frost={"ice": False})
    assert W.level_of(c2, "frost", {"temp": 0.5, "cond": "rainy"}) == 0


def test_hitze_zwei_stufen():
    c = cfg(heat={"on": True, "temp": 30, "temp2": 35})
    assert [W.level_of(c, "heat", {"temp": t}) for t in (29, 31, 36)] == [0, 1, 2]


def test_aus_ist_null():
    c = cfg(storm={"on": False})
    assert W.level_of(c, "storm", {"wind": 150}) == 0


def test_regen_einheiten():
    assert W.to_mmh("0,5", "in/h") == 12.7 and W.to_mmh("4", "mm/h") == 4 and W.to_mmh("x", "mm/h") is None


# ---------------------------------------------------------------- Einstellungen
def test_grenzen_werden_geklemmt():
    c = W.clean_cfg({"warn": {"storm": {"kmh": 80, "kmh3": 70}, "rain": {"mm": 99, "mm3": 1}, "heat": {"temp": 40, "temp2": 30}}})
    assert c["warn"]["storm"]["kmh3"] >= 90  # Stufe 3 liegt immer über Stufe 1
    assert c["warn"]["rain"]["mm"] == 50 and c["warn"]["rain"]["mm3"] >= 52
    assert c["warn"]["heat"]["temp2"] == 41
    assert c["v"] == W.SCHEMA


def test_uebernahme_alter_einstellungen():
    old = {"warn": {"storm": {"on": True, "kmh": 70}, "thunder": {"on": False}, "frost": {"on": True, "temp": -2}},
           "acts": [{"id": "a1", "warn": "thunder", "ent": "cover.markise", "do": "close", "undo": True},
                    {"id": "a2", "warn": "storm", "ent": "cover.markise", "do": "close", "undo": True}],
           "win": {"on": True, "warn": ["storm", "thunder"]}}
    raw, changed = W.migrate(old)
    assert changed
    c = W.clean_cfg(raw)
    assert c["warn"]["hail"]["on"] is False  # wie vorher Gewitter
    assert c["warn"]["storm"]["kmh"] == 70 and c["warn"]["storm"]["kmh3"] == 100
    assert c["warn"]["frost"]["temp"] == -2
    hail = [x for x in c["acts"] if x["warn"] == "hail"]
    assert len(hail) == 1 and hail[0]["id"] == "a1h" and hail[0]["ent"] == "cover.markise"
    assert "hail" in c["win"]["warn"]
    assert W.migrate(raw) == (raw, False)  # nur einmal
    assert W.migrate({}) == ({}, False) and W.migrate(None) == (None, False)


# ---------------------------------------------------------------- Amtliche Warnungen
def dwd(level, warnings, vorab=False):
    a = {"region_name": "Kreis Musterstadt", "warning_count": len(warnings)}
    for i, (name, lv, start, end) in enumerate(warnings, 1):
        a.update({f"warning_{i}_name": name, f"warning_{i}_level": lv, f"warning_{i}_start": start, f"warning_{i}_end": end,
                  f"warning_{i}_description": f"Es treten {name} auf.", f"warning_{i}_instruction": "Fenster und Türen schließen."})
    return St("sensor.musterstadt_vorwarnstufe" if vorab else "sensor.musterstadt_aktuelle_warnstufe", str(level), a)


def test_dwd_mehrere_warnungen():
    s = dwd(3, [("Sturmböen", 2, "2026-11-12T12:00:00+00:00", "2026-11-12T21:00:00+00:00"),
                ("Schwere Gewitter mit Hagel", 3, "2026-11-12T15:00:00+00:00", "2026-11-12T18:30:00+00:00")])
    L = W.official_list(s, "dwd_weather_warnings")
    assert [x["titel"] for x in L] == ["Sturmböen", "Schwere Gewitter mit Hagel"]
    assert [x["stufe"] for x in L] == [2, 3] and [x["art"] for x in L] == ["storm", "hail"]
    assert L[0]["gebiet"] == "Kreis Musterstadt" and L[0]["hinweis"].startswith("Fenster")
    m = W.merge_official(L, NOW[0])
    assert m[0]["titel"] == "Sturmböen"  # läuft schon, Gewitter kommt erst
    assert m[1].get("kommt") is True
    b = W.official_best(m)
    assert b["level"] == 2 and "Sturmböen" in b["title"] and "bis 21:00" in b["text"]


def test_dwd_vorab_und_abgelaufen():
    v = dwd(2, [("Frost", 1, "2026-11-13T02:00:00+00:00", "2026-11-13T08:00:00+00:00")], vorab=True)
    old = dwd(1, [("Nebel", 1, "2026-11-12T05:00:00+00:00", "2026-11-12T09:00:00+00:00")])
    m = W.merge_official(W.official_list(v, "dwd_weather_warnings", True) + W.official_list(old, "dwd_weather_warnings"), NOW[0])
    assert len(m) == 1 and m[0]["vorab"] and m[0]["art"] == "frost"
    assert W.official_best(m)["level"] == 0  # Vorab ist keine aktuelle Warnung
    assert W.official_list(dwd(0, []), "dwd_weather_warnings") == []


def test_vorab_erkennung():
    assert W.is_vorab("sensor.x_vorwarnstufe") and W.is_vorab("sensor.x", "abc-advance_warning_level")
    assert W.is_vorab("sensor.x", "", "advance_warning_level") and not W.is_vorab("sensor.x_aktuelle_warnstufe", "abc-current_warning_level", "current_warning_level")


def test_nina_und_meteoalarm():
    n = St("binary_sensor.warnung_musterstadt_1", "on", {"headline": "Hochwasser an der Mosel", "severity": "Severe", "sender": "Landesamt für Umwelt",
                                                          "start": "2026-11-12T10:00:00+00:00", "expires": "2026-11-13T10:00:00+00:00", "description": "Pegel steigt."})
    x = W.official_list(n, "nina")[0]
    assert x["stufe"] == 3 and x["art"] == "flood" and "Landesamt" in x["quelle"]
    c = St("binary_sensor.warnung_musterstadt_2", "on", {"headline": "Gefahreninformation", "severity": "Minor", "sender": "Leitstelle"})
    assert W.official_list(c, "nina")[0]["art"] == "civil"
    m = St("binary_sensor.meteoalarm", "on", {"event": "Wind", "awareness_level": "3; orange; Severe", "onset": "2026-11-12T12:00:00+00:00", "expires": "2026-11-12T20:00:00+00:00"})
    x = W.official_list(m, "meteoalarm")[0]
    assert x["stufe"] == 2 and x["art"] == "storm" and x["quelle"] == "MeteoAlarm"
    assert W.official_list(St("binary_sensor.y", "off"), "nina") == []


def test_doppelte_zusammengefasst():
    a = {"art": "storm", "quelle": "DWD", "stufe": 2, "von": "", "bis": "2026-11-12T21:00:00+00:00", "titel": "Sturmböen", "text": "", "hinweis": "", "vorab": False, "gebiet": ""}
    b = {**a, "quelle": "NINA · Deutscher Wetterdienst"}
    assert len(W.merge_official([a, b], NOW[0])) == 1


def test_veraltete_quelle():
    t = NOW[0].timestamp()
    assert W.stale_info(St("weather.home", "cloudy", age_min=20), t)["on"] is False
    s = W.stale_info(St("weather.home", "cloudy", age_min=120), t)
    assert s["on"] and "120 Minuten" in s["why"]
    assert W.stale_info(St("weather.home", "unavailable"), t)["why"] == "nicht verfügbar"


# ---------------------------------------------------------------- Ablauf im Manager
class _States:
    def __init__(self):
        self.d = {}

    def get(self, e):
        return self.d.get(e)

    def async_all(self, dom):
        return [s for k, s in self.d.items() if k.startswith(dom + ".")]


class _Services:
    def __init__(self):
        self.calls = []

    def has_service(self, d, n):
        return True

    async def async_call(self, dom, svc, data=None, **kw):
        if dom == "weather":
            return {}
        self.calls.append((dom, svc, data))


class Hass:
    def __init__(self):
        self.states, self.services = _States(), _Services()
        self.config = types.SimpleNamespace(units=types.SimpleNamespace(wind_speed_unit="km/h"))
        self.config_entries = types.SimpleNamespace(async_entries=lambda d: [])
        self.data = {"fenster_heizung": {"wasser": types.SimpleNamespace(modules={"on": {"wx": True}}), "layout": {"wx": {"entity": "weather.home"}}}}

    def async_create_task(self, c):
        c.close()


def _mgr():
    h = Hass()
    m = W.WetterManager(h)
    m.cfg = cfg()
    m.cfg["notify"]["to"] = ["notify.handy"]
    return h, m


def run(c):
    return asyncio.get_event_loop().run_until_complete(c) if False else asyncio.run(c)


def test_ablauf_sturm():
    h, m = _mgr()
    REG.entities = {}
    wind = lambda v: h.states.d.__setitem__("weather.home", St("weather.home", "windy", {"wind_speed": v, "temperature": 8}))  # noqa: E731

    async def go():
        wind(65)
        await m._tick(None)
        assert not m.st["storm"]["a"]  # erst nach zwei Messungen
        await m._tick(None)
        assert m.st["storm"]["a"] and m.st["storm"]["lv"] == 1
        wind(95)
        await m._tick(None)
        await m._tick(None)
        assert m.st["storm"]["lv"] == 3
        wind(88)  # knapp unter Stufe 3: wegen Spielraum bleibt Stufe 3
        await m._tick(None)
        assert m.st["storm"]["lv"] == 3 and not m.st["storm"]["clear"]
        wind(62)
        await m._tick(None)
        assert m.st["storm"]["lv"] == 3 and m.st["storm"]["clear"]
        m.st["storm"]["clear"] -= W.CLEAR_AFTER_S + 1
        await m._tick(None)
        assert m.st["storm"]["a"] and m.st["storm"]["lv"] == 1  # Stufe sinkt erst nach 10 Minuten
        wind(20)
        await m._tick(None)
        m.st["storm"]["clear"] -= W.CLEAR_AFTER_S + 1
        await m._tick(None)
        assert not m.st["storm"]["a"]
        texts = [x["x"] for x in m.log]
        assert any("Stufe 3" in t for t in texts) and any("beendet" in t for t in texts)
        titles = [c[2]["title"] for c in h.services.calls if c[0] == "notify"]
        assert "Warnung: Sturm (Stufe 1)" in titles and "Sturm: jetzt Stufe 3" in titles
    run(go())


def test_ablauf_amtlich_und_snapshot():
    h, m = _mgr()
    h.states.d["weather.home"] = St("weather.home", "cloudy", {"wind_speed": 10, "temperature": 8})
    cur = dwd(3, [("Sturmböen", 2, "2026-11-12T12:00:00+00:00", "2026-11-12T21:00:00+00:00")])
    adv = dwd(2, [("Frost", 1, "2026-11-13T02:00:00+00:00", "2026-11-13T08:00:00+00:00")], vorab=True)
    h.states.d[cur.entity_id], h.states.d[adv.entity_id] = cur, adv
    E = lambda eid, uid: types.SimpleNamespace(entity_id=eid, unique_id=uid, platform="dwd_weather_warnings", domain="sensor", disabled=False, config_entry_id="e1", translation_key=None)  # noqa: E731
    REG.entities = {cur.entity_id: E(cur.entity_id, "1-current_warning_level"), adv.entity_id: E(adv.entity_id, "1-advance_warning_level")}
    m.cfg["official"]["ent"] = cur.entity_id  # gewählt: aktuelle Warnstufe, die Vorabwarnstufe kommt mit

    async def go():
        await m._tick(None)
        snap = await m.snapshot()
        offs = snap["state"]["officials"]
        assert [(x["titel"], x["vorab"]) for x in offs] == [("Sturmböen", False), ("Frost", True)]
        assert snap["state"]["official"]["level"] == 2
        assert snap["warnings"][0]["quelle"] == "DWD"
        n = len([c for c in h.services.calls if c[0] == "notify"])
        await m._tick(None)
        assert len([c for c in h.services.calls if c[0] == "notify"]) == n  # nicht doppelt melden
        m.cfg["official"]["vorab"] = False
        await m._tick(None)
        assert len(m._offl) == 1
    run(go())


def test_veraltete_quelle_im_manager():
    h, m = _mgr()
    REG.entities = {}
    h.states.d["weather.home"] = St("weather.home", "cloudy", {"temperature": 5}, age_min=200)

    async def go():
        await m._tick(None)
        assert m._stale["on"] and "Minuten" in m._stale["why"]
        assert any(c[2]["title"] == "Wetterquelle prüfen" for c in h.services.calls if c[0] == "notify")
        h.states.d["weather.home"] = St("weather.home", "cloudy", {"temperature": 5})
        await m._tick(None)
        assert not m._stale["on"] and "wieder Werte" in m.log[0]["x"]
    run(go())


def test_start_mit_alten_daten():
    h, m = _mgr()
    m._store.data = {"cfg": {"warn": {"thunder": {"on": True}}, "acts": [{"id": "a1", "warn": "thunder", "ent": "cover.m", "do": "close"}]},
                     "st": {"storm": {"a": True, "since": "2026-11-12T12:00:00+00:00"}}}

    async def go():
        await m.async_start()
        assert m.migrated and m._store.snaps == 1
        assert m.cfg["warn"]["hail"]["on"] and any(x["warn"] == "hail" for x in m.cfg["acts"])
        assert m.st["storm"]["lv"] == 1  # alte aktive Warnung = Stufe 1
        assert m._store.saved["cfg"]["v"] == W.SCHEMA
    run(go())


# ---------------------------------------------------------------- Stufe 3 (v0.8): Aktions-Planer, Quittieren, Aussetzen, Meldungen, Zeitleiste
def test_act_check():
    x = {"min": 2, "delay": 5, "when": "away"}
    assert W.act_check(x, 1, 1000, 1000, False, True, True, False) == ("wait", "ab Stufe 2")
    assert W.act_check(x, 2, 1000, 1000, True, True, True, False)[0] == "pause"
    assert W.act_check(x, 2, 1100, 1000, False, True, True, False) == ("wait", "in 3 Min.")
    assert W.act_check(x, 2, 1400, 1000, False, False, True, False) == ("wait", "nur bei Abwesenheit")
    assert W.act_check(x, 3, 1400, 1000, False, True, True, True)[0] == "blocked"
    assert W.act_check(x, 3, 1400, 1000, False, True, False, False) == ("go", "")
    assert W.when_ok("night", False, False) and not W.when_ok("day", False, False)


def test_notify_data():
    assert W.notify_data("notify.telegram", True, True) is None  # nur die Home-Assistant-App kennt Knöpfe
    d = W.notify_data("notify.mobile_app_iphone", True, False)
    assert [a["action"] for a in d["actions"]] == ["FHWX_ACK", "FHWX_CLOSE", "FHWX_PAUSE"] and "push" not in d
    d = W.notify_data("notify.mobile_app_iphone", False, True)
    assert d["push"]["sound"]["critical"] == 1 and "actions" not in d
    assert [a["action"] for a in W.notify_data("notify.mobile_app_x", True, False, close=False)["actions"]] == ["FHWX_ACK", "FHWX_PAUSE"]


def test_zeitleiste():
    c = cfg(rain={"on": True})
    fc = [{"t": f"2026-11-12T{13 + i:02d}:00:00+00:00", "temp": 8, "wind": w, "cond": cond, "p": p, "hum": 80} for i, (w, cond, p) in enumerate([(95, "windy", 0), (70, "lightning-rainy", 12), (20, "hail", 1), (10, "cloudy", 0)])]
    t = W.timeline(c, fc, [{"art": "storm", "titel": "Sturmböen", "stufe": 2, "von": "a", "bis": "b", "vorab": False, "quelle": "DWD", "text": ""}])
    assert t["own"]["storm"] == [3, 1, 0, 0] and t["own"]["thunder"] == [0, 2, 0, 0] and t["own"]["hail"] == [0, 0, 3, 0] and t["own"]["rain"] == [0, 1, 0, 0]
    assert "heat" not in t["own"] and t["off"][0]["titel"] == "Sturmböen" and len(t["t"]) == 4


def _storm_mgr(acts, **cfgx):
    h, m = _mgr()
    REG.entities = {}
    m.cfg["acts"] = W.clean_cfg({"acts": acts})["acts"]
    m.cfg["win"].update(cfgx.get("win", {}))
    for e in ("cover.markise", "cover.rollo_tuer", "switch.pumpe"):
        h.states.d[e] = St(e, "open", {"friendly_name": e.split(".")[1].capitalize()})
    h.states.d["weather.home"] = St("weather.home", "windy", {"wind_speed": 95, "temperature": 8})
    return h, m


def _calls(h, dom=None):
    return [c for c in h.services.calls if dom is None or c[0] == dom]


def test_aktionen_stufe_verzoegerung_aussperrschutz():
    h, m = _storm_mgr([{"id": "a1", "warn": "storm", "ent": "cover.markise", "do": "close"},
                       {"id": "a2", "warn": "storm", "ent": "cover.rollo_tuer", "do": "close", "guard": "binary_sensor.tuer"},
                       {"id": "a3", "warn": "storm", "ent": "switch.pumpe", "do": "off", "min": 4},
                       {"id": "a4", "warn": "storm", "ent": "cover.markise", "do": "open", "delay": 10}])
    h.states.d["binary_sensor.tuer"] = St("binary_sensor.tuer", "on", {"friendly_name": "Terrassentür"})

    async def go():
        await m._tick(None)
        await m._tick(None)  # Sturm Stufe 3 beginnt
        assert m.st["storm"]["lv"] == 3
        assert "a1" in m.acts and m.ares["a2"]["state"] == "blocked" and m.ares["a3"] == {"state": "wait", "why": "ab Stufe 4"}
        assert m.ares["a4"]["state"] == "wait" and "Min." in m.ares["a4"]["why"]
        assert not any(c[2] and c[2].get("entity_id") == "cover.rollo_tuer" for c in _calls(h, "cover"))
        assert any("Aussperrschutz" in x["x"] for x in m.log)
        h.states.d["binary_sensor.tuer"] = St("binary_sensor.tuer", "off")  # Tür zu: Rollladen fährt jetzt
        m.first["a4"] -= 11 * 60
        await m._tick(None)
        assert "a2" in m.acts and "a4" in m.acts
        snap = await m.snapshot()
        assert snap["state"]["acts"]["a1"]["state"] == "run" and snap["state"]["acts"]["a3"]["state"] == "wait"
    run(go())


def test_aussetzen_und_alles_schliessen():
    h, m = _storm_mgr([{"id": "a1", "warn": "storm", "ent": "cover.markise", "do": "close"}])

    async def go():
        await m.async_pause(120, "Tobias")
        await m._tick(None)
        await m._tick(None)
        assert m.st["storm"]["a"] and "a1" not in m.acts and m.ares["a1"]["state"] == "pause"
        r = await m.async_close_all("Tobias")
        assert r["closed"] == 1 and "a1" in m.acts
        snap = await m.snapshot()
        assert snap["state"]["pause"] is not None
        await m.async_pause(0)
        assert m.pause_until == 0
    run(go())


def test_quittieren_und_fenster_wiederholung():
    h, m = _storm_mgr([], win={"on": True, "warn": ["storm"], "repeat": True})
    m.open_windows = lambda: ["Bad"]

    async def go():
        await m._tick(None)
        await m._tick(None)
        n = lambda: len([c for c in _calls(h, "notify") if "Fenster offen" in c[2]["title"]])  # noqa: E731
        assert n() == 1
        await m._tick(None)
        assert n() == 1  # nicht sofort wieder
        m.win_sent["storm:Bad"] -= W.WIN_REPEAT_S + 1
        await m._tick(None)
        assert n() == 2  # nach 15 Minuten erneut
        snap = await m.async_ack("Tobias")
        assert snap["state"]["acked"] is True
        m.win_sent["storm:Bad"] -= W.WIN_REPEAT_S + 1
        await m._tick(None)
        assert n() == 2  # quittiert: keine Wiederholung
        msg = [c for c in _calls(h, "notify") if "Fenster offen" in c[2]["title"]][0][2]
        assert msg.get("data") is None  # notify.handy ist keine HA-App
    run(go())


def test_knopf_aus_der_meldung():
    h, m = _storm_mgr([{"id": "a1", "warn": "storm", "ent": "cover.markise", "do": "close", "min": 4}])
    m.cfg["notify"]["to"] = ["notify.mobile_app_iphone"]

    async def go():
        await m._tick(None)
        await m._tick(None)
        start = [c for c in _calls(h, "notify") if c[2]["title"].startswith("Warnung: Sturm")][0][2]
        assert start["data"]["actions"][0]["action"] == "FHWX_ACK"
        await m._on_action(types.SimpleNamespace(data={"action": "FHWX_CLOSE"}))
        assert "a1" in m.acts
        await m._on_action(types.SimpleNamespace(data={"action": "FHWX_PAUSE"}))
        assert m.pause_until > 0
        await m._on_action(types.SimpleNamespace(data={"action": "FHWX_ACK"}))
        assert m.ack == {"storm": 3}
        await m._on_action(types.SimpleNamespace(data={"action": "ANDERES"}))
    run(go())


def test_aktion_neu_und_einstellungen():
    c = W.clean_cfg({"acts": [{"id": "a1", "warn": "storm", "ent": "cover.r", "do": "close", "min": 9, "when": "x", "delay": 99, "guard": "binary_sensor.t"},
                              {"id": "a2", "warn": "storm", "ent": "switch.s", "do": "on", "guard": "binary_sensor.t"}]})
    a1, a2 = c["acts"]
    assert (a1["min"], a1["when"], a1["delay"], a1["guard"]) == (4, "always", 60, "binary_sensor.t")
    assert a2["guard"] == ""  # Aussperrschutz nur beim Schließen von Rollläden
    assert c["notify"]["buttons"] is True and c["notify"]["critical"] is False and c["win"]["repeat"] is True


# ---------------------------------------------------------------- Stufe 4 (v0.9): Vorsorge, Tablet, Ereignisse
def _vx(**k):
    base = {"sev": 0, "sev_at": "", "hail": False, "hail_at": "", "heat_now": False, "heat_soon": False, "heat_today": False, "frost_soon": False, "frost_at": "",
            "day": True, "evening": False, "out_t": 20, "soc": 40, "car_soc": 30, "car_plugged": True, "wallbox": True}
    base.update(k)
    return base


def test_vorsorge_plan():
    c = W.default_cfg()
    assert W.plan_vorsorge(c, _vx()) == []
    ids = lambda L: [x["id"] for x in L]  # noqa: E731
    L = W.plan_vorsorge(c, _vx(sev=3, sev_at="17:00", hail=True, hail_at="17:00"))
    assert ids(L) == ["akku", "car", "garage"]
    assert "ab 17:00" in L[0]["text"] and "40 %" in L[0]["text"] and L[0]["btn"] == ""  # ohne Akku-Entität nur Hinweis
    assert L[1]["btn"] == "Jetzt laden"
    assert ids(W.plan_vorsorge(c, _vx(sev=3, soc=97, car_soc=80))) == []  # Akku voll, Auto genug
    assert W.plan_vorsorge(c, _vx(sev=3, car_plugged=False))[1]["btn"] == ""
    c["vor"]["heat_covers"] = ["cover.sued"]
    assert W.plan_vorsorge(c, _vx(heat_soon=True))[0]["btn"] == "Rollläden schließen"
    assert ids(W.plan_vorsorge(c, _vx(heat_today=True, day=False, evening=True, out_t=22))) == ["heat_air"]
    assert ids(W.plan_vorsorge(c, _vx(frost_soon=True, frost_at="03:00"))) == ["frost"]
    c["vor"]["on"] = False
    assert W.plan_vorsorge(c, _vx(sev=4)) == []
    cc = W.clean_cfg({"vor": {"akku_ent": "script.netzladen", "akku_auto": True, "car_min": 63, "hours": 99}, "tab_lv": 9})
    assert cc["vor"]["akku_ent"] == "script.netzladen" and cc["vor"]["car_min"] == 65 and cc["vor"]["hours"] == 24 and cc["tab_lv"] == 4


class _Bus:
    def __init__(self):
        self.ev = []

    def async_fire(self, typ, data):
        self.ev.append((typ, data))


def test_vorsorge_ablauf_und_tablet():
    h, m = _storm_mgr([])
    h.bus = _Bus()
    m.cfg["vor"]["akku_ent"] = "script.netzladen"
    m.cfg["vor"]["akku_auto"] = True
    woke = []
    h.data["fenster_heizung"]["tablet"] = types.SimpleNamespace(async_wake_warn=lambda: _co(woke))

    async def go():
        await m._tick(None)
        await m._tick(None)  # Sturm Stufe 3 -> Akku automatisch, Tablet weckt
        assert any(c[0] == "script" and c[2]["entity_id"] == "script.netzladen" for c in h.services.calls)
        assert "akku" in m.vor_done and woke == [1]
        await m._tick(None)
        assert woke == [1]  # nur einmal je Lage
        typs = [e[1]["typ"] for e in h.bus.ev]
        assert "beginn" in typs and "vorsorge" in typs and h.bus.ev[0][0] == "fenster_heizung_wetter_warnung"
        snap = await m.snapshot()
        assert snap["level"] == 3 and snap["vor"][0]["id"] == "akku" and snap["vor"][0]["done"]
        await m.async_ack()
        assert any(e[1]["typ"] == "quittiert" for e in h.bus.ev)
        assert SENT  # Sensoren bekommen ein Signal
    run(go())


async def _co(woke):
    woke.append(1)
    return 1


def test_verlauf_90_tage():
    h, m = _mgr()
    m.log = [{"t": "2026-01-01T10:00:00+00:00", "x": "alt"}]
    m._add("neu", "warn")
    assert [x["x"] for x in m.log] == ["neu"] and m.log[0]["k"] == "warn"


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
