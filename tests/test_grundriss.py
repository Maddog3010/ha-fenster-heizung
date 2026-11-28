"""Tests für Modul 0 · Haus & Grundriss (grundriss.py) ohne Home Assistant.

Ausführen: python3 -m pytest tests  oder  python3 tests/test_grundriss.py
Geprüft werden: Umzug des Plans aus Modul 11 beim ersten Start (mit Melder- und Lampen-Ebene und Umzugs-Kopie), leere Pläne werden nicht
übernommen, danach hat Modul 0 Vorrang, der Baukasten von Modul 11 schreibt in Modul 0 (nur wenn der Plan mitgeschickt wird), Zahlen für
Banner und Ebenen, welche Module den Plan nutzen, das Aufräumen der Umzugs-Kopie nach 90 Tagen und (Build 2) die Raumliste
mit einmaliger Übernahme der Zuordnung aus Modul 18.
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


def test_raumliste_setzen_und_uebernehmen():
    m, gm, h, st = _setup(PLAN)
    assert gm.set_rooms({"r1": "wohnen", "r2": "-", "bad id!": "x", "r9": "ok ä"}) is True
    assert gm.rooms == {"r1": "wohnen", "r2": "-"} and gm.snapshot()["rooms"] == {"r1": "wohnen", "r2": "-"}
    assert gm.set_rooms({"r1": "wohnen"}) is False                                 # nichts geändert
    assert gm.set_rooms({"r2": ""}) is True and gm.rooms == {"r1": "wohnen"}      # leer = wieder automatisch
    # einmalige Übernahme aus Modul 18: was in Modul 0 schon steht, gewinnt
    assert gm.merge_pmap({"r1": "kueche", "r2": "bad", "r3": "-"}) == 2
    assert gm.rooms == {"r1": "wohnen", "r2": "bad", "r3": "-"} and gm.meta["pmap"]
    assert gm.merge_pmap({"r4": "flur"}) == 0                                      # nur einmal
    saved = st["fenster_heizung_grundriss"].saved
    assert saved["rooms"] == gm.rooms
    # Neustart: Raumliste bleibt
    gm2 = G.GrundrissManager(h)
    [x for x in T._Store.stores if x.key == "fenster_heizung_grundriss"][-1].data = saved
    asyncio.run(gm2.async_start())
    assert gm2.rooms == gm.rooms and gm2.has
    m.async_stop()


def test_baukasten_in_modul_0_modul_11_zieht_nach():
    m, gm, h, st = _setup(PLAN)
    p2 = {**PLAN, "items": PLAN["items"][:2] + [{"id": "d1", "fl": "eg", "t": "d", "x": 100, "y": 0, "r": 0}]}
    assert gm.set_plan(p2, "gr") is True and gm.meta["by"] == "gr"
    assert [i["id"] for i in m.cfg["plan"]["items"]] == ["r1", "r2", "d1"]       # Modul 11 liest mit, ohne zurückzuschreiben
    assert [x for x in T._Store.stores if x.key.endswith("sicherheit_plan")][-1].saved["plan"]["items"] == m.cfg["plan"]["items"]
    m.async_stop()
    assert gm.set_plan(PLAN, "gr") is True and len(m.cfg["plan"]["items"]) == 3   # nach dem Stoppen hört Modul 11 nicht mehr zu
    assert not gm._listeners


def _p(n):
    """Plan mit n Wänden – jeder Stand unterscheidbar."""
    return {**PLAN, "items": PLAN["items"][:1] + [{"id": f"w{i}", "fl": "eg", "t": "w", "x": 0, "y": i, "x2": 10, "y2": i} for i in range(n)]}


def test_verlauf_und_wiederherstellen():
    m, gm, h, st = _setup(PLAN)
    bg = {"eg": "data:image/png;base64,AAAA"}
    gm.set_plan({**_p(1), "bg": bg}, "gr")
    gm.set_plan({**_p(2), "bg": bg}, "import")
    assert [x["by"] for x in gm.hist] == ["gr", "umzug"] and gm.hist[0]["next"] == "import"   # neuester zuerst, wer davor schrieb
    assert all(x["plan"]["bg"] == {} for x in gm.hist)                                      # ohne Hintergrundbilder
    assert st["fenster_heizung_grundriss_verlauf"].saved["hist"] == gm.hist
    lst = asyncio.run(gm.hist_list())
    assert len(lst["hist"]) == 2 and "plan" not in lst["hist"][0] and lst["hist"][0]["stats"]["build"] == 2
    hid = gm.hist[0]["id"]
    assert asyncio.run(gm.restore(hid)) is True
    assert len(gm.plan["items"]) == 2 and gm.plan["bg"] == bg and gm.meta["by"] == "restore"   # Bilder bleiben
    assert len(m.cfg["plan"]["items"]) == 2                                                   # Modul 11 zieht nach
    assert gm.hist[0]["next"] == "restore" and len(gm.plan["items"]) == 2
    assert asyncio.run(gm.restore("gibtsnicht")) is False
    m.async_stop()


def test_verlauf_hat_ein_ende_und_umzugs_kopie():
    m, gm, h, st = _setup(PLAN)
    for n in range(1, 20):
        gm.set_plan(_p(n), "gr")
    assert len(gm.hist) == G.HIST_MAX
    st["fenster_heizung_grundriss_umzug"].data = st["fenster_heizung_grundriss_umzug"].saved
    lst = asyncio.run(gm.hist_list())
    assert lst["copy"]["src"] == "sf" and lst["copy"]["stats"]["layers"] == {"sf": 1, "licht": 1}
    assert asyncio.run(gm.restore("umzug")) is True and len(gm.plan["items"]) == 5
    m.async_stop()


# ---- v0.13 (Stufe 1 Technik): Schema 2, Prüfung, feste Raum-IDs, Bearbeitungs-Sperre
def _item(i, t="r", fl="eg", **kw):
    return {"id": i, "fl": fl, "t": t, "x": 0, "y": 0, "w": 50, "h": 50, "n": "R", **kw}


def test_schema_2_umstellung_beim_start():
    m, gm, h, st = _setup(PLAN, gr_data={"v": 1, "plan": PLAN, "meta": {"since": "2026-11-20T10:00:00+00:00", "src": "sf"}})
    assert G.SCHEMA == 2 and gm.meta["schema"] == "2" and gm.meta["schema_from"] == "1" and gm.meta["schema_at"]
    assert gm.hist and gm.hist[0]["next"] == "schema" and len(gm.hist[0]["plan"]["items"]) == 5   # alter Stand liegt im Verlauf
    assert st["fenster_heizung_grundriss"].saved["v"] == 2                                       # Datei trägt Schema 2
    m.async_stop()


def test_schema_2_wird_nicht_zweimal_umgestellt():
    m, gm, h, st = _setup(PLAN, gr_data={"v": 2, "plan": PLAN, "meta": {"since": "2026-11-20T10:00:00+00:00", "src": "sf"}})
    assert "schema_from" not in gm.meta and gm.hist == []
    m.async_stop()


def test_pruefung_lehnt_kaputte_plaene_ab():
    for bad, txt in ((None, "Format"), ({"items": "x"}, "beschädigt"), ({"floors": {}, "items": []}, "beschädigt"),
                     ({"items": [_item(f"r{n}") for n in range(G.MAX_ITEMS + 1)]}, "Zu viele Elemente"),
                     ({"floors": [{"id": f"f{n}", "n": "x"} for n in range(G.MAX_FLOORS + 1)], "items": []}, "Zu viele Etagen"),
                     ({"items": [{"id": "a", "t": "?", "fl": "eg"}, "kein Objekt"]}, "Kein einziges Element")):
        try:
            G.check_plan(bad)
        except G.PlanError as e:
            assert txt in str(e), (bad, e)
        else:
            raise AssertionError(f"nicht abgelehnt: {bad!r}")


def test_abgelehnter_plan_aendert_nichts():
    m, gm, h, st = _setup(PLAN)
    before, hist = dict(gm.plan), len(gm.hist)
    try:
        gm.set_plan({"items": [{"id": "a", "t": "?", "fl": "eg"}]}, "gr")
    except G.PlanError:
        pass
    else:
        raise AssertionError("kaputter Plan wurde gespeichert")
    assert gm.plan == before and len(gm.hist) == hist
    m.async_stop()


def test_doppelte_ids_bekommen_neue_ids():
    r1, r2, r3 = _item("r1"), _item("r1", n="Doppelt"), _item("Ungültig!", n="Kaputte ID")
    p, info = G.check_plan({"floors": [{"id": "eg", "n": "EG"}], "items": [r1, r2, r3, _item("w1", "w")]})
    ids = [i["id"] for i in p["items"]]
    assert len(ids) == 4 and len(set(ids)) == 4 and info == {"ids": 2, "dropped": 0}   # nichts verschwindet
    assert p["items"][0]["id"] == "r1" and p["items"][0]["n"] == "R"                   # das erste behält seine ID (Raumliste bleibt gültig)
    assert {i["n"] for i in p["items"] if i["t"] == "r"} == {"R", "Doppelt", "Kaputte ID"}
    assert all(G._ITEM_ID.match(i) for i in ids)


def test_pruefung_zaehlt_verworfene_elemente():
    p, info = G.check_plan({"floors": [{"id": "eg", "n": "EG"}], "items": [_item("r1"), _item("r2", fl="gibtsnicht"), {"id": "x", "t": "?", "fl": "eg"}]})
    assert [i["id"] for i in p["items"]] == ["r1"] and info["dropped"] == 2 and info["ids"] == 0


def test_set_plan_merkt_pruefbericht_und_snapshot():
    m, gm, h, st = _setup(PLAN)
    gm.set_plan({**PLAN, "items": PLAN["items"] + [dict(PLAN["items"][0], n="Kopie")]}, "gr")   # Kopie mit gleicher ID
    s = gm.snapshot()
    assert s["check"]["ids"] == 1 and s["check"]["at"] and s["v"] == 2 and len({i["id"] for i in gm.plan["items"]}) == 6
    m.async_stop()


def test_sperre_holen_halten_freigeben():
    m, gm, h, st = _setup(PLAN)
    assert gm.lock_public() is None and gm.snapshot()["lock"] is None
    assert gm.lock_take("a", "Anna") is True
    lk = gm.snapshot()["lock"]
    assert lk["by"] == "Anna" and lk["sid"] == "a" and "ts" not in lk
    assert gm.lock_take("b", "Ben") is False and gm.lock_public()["by"] == "Anna"        # belegt
    assert gm.lock_take("a", "Anna") is True and gm.lock_public()["since"] == lk["since"]  # erneut holen behält „seit“
    assert gm.lock_keep("a") is True and gm.lock_keep("b") is False
    gm.lock_release("b")                                                                   # fremde Freigabe wirkt nicht
    assert gm.lock_public()["by"] == "Anna"
    gm.lock_release("a")
    assert gm.lock_public() is None
    m.async_stop()


def test_sperre_laeuft_ab_und_kann_uebernommen_werden():
    m, gm, h, st = _setup(PLAN)
    t0 = NOW[0]
    try:
        gm.lock_take("a", "Anna")
        NOW[0] = t0 + timedelta(minutes=G.LOCK_MIN - 1)
        assert gm.lock_keep("a") is True and gm.lock_take("b", "Ben") is False             # Aktion verlängert
        NOW[0] = t0 + timedelta(minutes=2 * G.LOCK_MIN)
        assert gm.lock_public() is None and gm.lock_keep("a") is False                    # abgelaufen
        assert gm.lock_take("b", "Ben") is True
        assert gm.lock_take("a", "Anna") is False and gm.lock_take("a", "Anna", force=True) is True   # übernehmen
        assert gm.lock_public()["by"] == "Anna"
    finally:
        NOW[0] = t0
    m.async_stop()


def test_sperre_blockiert_schreiben_anderer_geraete():
    m, gm, h, st = _setup(PLAN)
    gm.lock_check(None)                                   # ohne Sperre darf jeder schreiben
    gm.lock_take("a", "Anna")
    gm.lock_check("a")                                    # Besitzer darf
    for sid in ("b", None):
        try:
            gm.lock_check(sid)
        except G.LockedError as e:
            assert e.lock["by"] == "Anna" and "ts" not in e.lock
        else:
            raise AssertionError("fremdes Gerät durfte schreiben")
    m.async_stop()


def test_verlauf_zeigt_aenderungen():
    d = G.plan_diff({"floors": [{"id": "eg"}], "items": [_item("r1"), _item("r2"), _item("t1", "d")]},
                    {"floors": [{"id": "eg"}, {"id": "og"}], "items": [_item("r1", n="Neu"), _item("r3"), _item("r4"), _item("t1", "d")]})
    assert d == {"add": {"floor": 1, "r": 2}, "del": {"r": 1}, "mod": {"r": 1}}, d
    assert G.plan_diff({}, {}) == {"add": {}, "del": {}, "mod": {}}


def test_hist_list_hat_chg():
    m, gm, h, st = _setup(PLAN)
    gm.set_plan(_p(1), "gr")
    gm.set_plan(_p(2), "gr")
    lst = asyncio.run(gm.hist_list())
    assert all("chg" in x for x in lst["hist"])
    assert lst["hist"][0]["chg"] == G.plan_diff(gm.hist[0]["plan"], gm.plan)        # neuester Eintrag: Stand → jetzt
    assert lst["hist"][1]["chg"] == G.plan_diff(gm.hist[1]["plan"], gm.hist[0]["plan"])
    m.async_stop()


if __name__ == "__main__":
    n = 0
    for k, f in list(globals().items()):
        if k.startswith("test_") and callable(f):
            f(); n += 1
    print(f"{n} Tests ok")
