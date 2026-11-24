"""Fehler-Statistik Build 1: Bereinigung, Zusammenfassen, Speicher und der Sammler am Logger – ohne Home Assistant."""
from __future__ import annotations

import importlib.util
import logging
import pathlib
import sys
import types
from datetime import date, timedelta

BASE = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung"


def _load(name: str, file: str):
    spec = importlib.util.spec_from_file_location(name, BASE / file)
    m = importlib.util.module_from_spec(spec)
    sys.modules[name] = m
    spec.loader.exec_module(m)
    return m


L = _load("fh_fehler_logic", "fehler_logic.py")
D = date(2026, 11, 23)


def test_sanitize_removes_personal_data():
    s = L.sanitize("expected str at 'id'. Got 154")
    assert s == "expected str at 'id'. Got #"
    s = L.sanitize('Entity sensor.wohnzimmer_temp in "Fiona`s Zimmer" hat 21.5 °C, http://192.168.1.20:8123/api, mail max@example.de')
    assert "wohnzimmer" not in s and "Fiona" not in s and "21.5" not in s and "192.168" not in s and "example" not in s
    assert "sensor.*" in s and "<adresse>" in s
    s = L.sanitize("File /config/custom_components/fenster_heizung/wallbox.py could not open /home/user/secret.txt")
    assert "secret" not in s and "/home" not in s
    s = L.sanitize("key 7f3c1e9a-4b2d-4c5e-9a1f-2d8b6e0c3a41 and token deadbeefdeadbeefdeadbeef")
    assert "7f3c" not in s and "deadbeef" not in s
    assert len(L.sanitize("x" * 1000)) == L.MSG_MAX


def test_where_only_our_files():
    assert L.where_of("/config/custom_components/fenster_heizung/wallbox.py", 976, "add_km") == "wallbox.py:976 add_km"
    assert L.where_of("/config/custom_components/fenster_heizung/addons/licht/manager.py", 10, "x") == "addons/licht/manager.py:10 x"
    assert L.where_of("/usr/lib/python3/site-packages/homeassistant/core.py", 5, "run") == ""


def test_same_error_counts_once_even_after_update():
    st = L.empty()
    a = L.add(st, src="backend", kind="TypeError", where="wallbox.py:976 add_km", msg="bad 1", today=D, version="2026.11.4.1")
    b = L.add(st, src="backend", kind="TypeError", where="wallbox.py:990 add_km", msg="bad 2", today=D + timedelta(days=1), version="2026.11.4.2")
    assert a is b and len(st["items"]) == 1 and b["n"] == 2 and b["first"] == "2026-11-23" and b["last"] == "2026-11-24"
    assert b["vers"] == ["2026.11.4.1", "2026.11.4.2"] and b["mod"] == "Modul 8"


def test_command_error_module_and_text():
    st = L.empty()
    e = L.add(st, src="befehl", kind="invalid_format", where="heizer_update", cmd="fenster_heizung/heizer_update",
              msg="expected str at 'id'. Got 154", today=D, version="2026.11.4.1", ha="2026.11.2", dev="tablet")
    assert e["mod"] == "Modul 1" and e["dev"] == {"tablet": 1}
    t = L.as_text(e)
    assert "Modul 1" in t and "expected str at 'id'. Got #" in t and "2026.11.4.1" in t and e["fp"] in t
    assert L.add(st, src="geraet", kind="x", where="", msg="", today=D, version="") is None   # keine Geräte-Diagnose


def test_prune_limit_and_clean():
    st = L.empty()
    L.add(st, src="backend", kind="A", where="", msg="alt", today=D - timedelta(days=40), version="v")
    L.add(st, src="backend", kind="B", where="", msg="neu", today=D, version="v")
    assert L.prune(st, D) == 1 and len(st["items"]) == 1
    for i in range(L.MAX_ENTRIES + 20):
        L.add(st, src="oberflaeche", kind=f"K{i}", where="", msg="m", today=D, version="v")
    assert len(st["items"]) == L.MAX_ENTRIES
    c = L.clean({"items": {**st["items"], "kaputt": {"src": "backend"}, "0123456789ab": {"src": "boese"}}})
    assert len(c["items"]) == L.MAX_ENTRIES and "kaputt" not in c["items"]
    assert L.clean(None) == L.empty()


def _stub_ha():
    """Minimaler Ersatz für die Home-Assistant-Module, die fehler.py importiert (danach wieder aufgeräumt)."""
    saved = dict(sys.modules)
    try:
        return _stub_ha2()
    finally:
        for k in list(sys.modules):
            if k not in saved:
                del sys.modules[k]
        sys.modules.update(saved)


def _stub_ha2():
    def mod(name, **kw):
        m = types.ModuleType(name)
        m.__dict__.update(kw)
        sys.modules[name] = m
        return m
    mod("homeassistant"); mod("homeassistant.helpers"); mod("homeassistant.util")
    mod("homeassistant.const", __version__="2026.11.2")
    mod("homeassistant.core", HomeAssistant=object, callback=lambda f: f)
    mod("homeassistant.helpers.storage", Store=object)
    mod("homeassistant.helpers.aiohttp_client", async_get_clientsession=None)
    mod("homeassistant.helpers.event", async_call_later=None, async_track_time_interval=None)
    if "aiohttp" not in sys.modules:
        try:
            import aiohttp  # noqa: F401
        except ImportError:
            mod("aiohttp", ClientError=Exception, ClientTimeout=lambda **k: None)
    mod("homeassistant.util.dt", now=lambda: types.SimpleNamespace(date=lambda: D))
    pkg = mod("fhfpkg"); pkg.__path__ = [str(BASE)]
    mod("fhfpkg.const", DOMAIN="fenster_heizung")
    sys.modules["fhfpkg.fehler_logic"] = L
    spec = importlib.util.spec_from_file_location("fhfpkg.fehler", BASE / "fehler.py")
    m = importlib.util.module_from_spec(spec)
    sys.modules["fhfpkg.fehler"] = m
    spec.loader.exec_module(m)
    return m


def test_handler_only_program_errors():
    F = _stub_ha()
    got = []
    owner = types.SimpleNamespace(record_threadsafe=lambda *a, **k: got.append(a))
    h = F._Handler(owner)
    ours = "/config/custom_components/fenster_heizung/wallbox.py"

    def rec(name, level, msg, exc=None, path=ours):
        r = logging.LogRecord(name, level, path, 976, msg, None, None, "add_km")
        if exc is not None:
            try:
                raise exc
            except Exception:  # noqa: BLE001
                r.exc_info = sys.exc_info()
        return r
    h.emit(rec("custom_components.fenster_heizung.wallbox", logging.WARNING, "Sensor nicht verfügbar"))   # Warnung: nein
    h.emit(rec("homeassistant.core", logging.ERROR, "fremder Fehler", path="/usr/lib/homeassistant/core.py"))   # fremd: nein
    h.emit(rec("custom_components.fenster_heizung.wallbox", logging.ERROR, "Speichern fehlgeschlagen"))   # eigener Fehler: ja
    h.emit(rec("homeassistant.components.websocket_api", logging.ERROR, "Error handling message", exc=TypeError("fremd")))   # Stapel ohne uns: nein
    r = logging.LogRecord("homeassistant.components.websocket_api", logging.ERROR, "x", 1, "Error handling message", None, None)
    try:   # Ausnahme, die in „unserem“ Code entsteht (Dateiname wie in Home Assistant)
        exec(compile("def add_km():\n    raise TypeError('bad op 12 and 3.5')\nadd_km()", ours, "exec"), {})
    except TypeError:
        r.exc_info = sys.exc_info()
    h.emit(r)
    assert len(got) == 2
    assert got[0][:3] == ("backend", "Fehler", "wallbox.py:976 add_km")
    assert got[1][:3] == ("backend", "TypeError", "wallbox.py:2 add_km") and got[1][3] == "bad op 12 and 3.5"


def test_module_from_frontend_function():
    assert L.module_of("_grStrip · Neuaufbau") == "Modul 0"
    assert L.module_of("_evKmCards · Neuaufbau") == "Modul 8"
    assert L.module_of("Neuaufbau") == "Allgemein"
    assert L.module_of("gr_ent.py:171 _sync") == "Modul 0"


def test_report_only_new_not_skipped_and_mark_sent():
    st = L.empty()
    assert L.build_report(st, "2026.11.5b2") is None                     # aus: kein Bericht
    st["cfg"].update(on=True, id="7f3c1e9a-4b2d-4c5e-9a1f-2d8b6e0c3a41", asked=True)
    a = L.add(st, src="befehl", kind="invalid_format", where="heizer_update", cmd="fenster_heizung/heizer_update", msg="expected str at 'id'. Got 154", today=D, version="2026.11.4.1")
    b = L.add(st, src="backend", kind="TypeError", where="wallbox.py:976 add_km", msg="x", today=D, version="2026.11.4.1")
    L.add(st, src="backend", kind="TypeError", where="wallbox.py:976 add_km", msg="x", today=D, version="2026.11.4.1")
    st["cfg"]["skip"] = [a["fp"]]
    r = L.build_report(st, "2026.11.5b2", "2026.11.2")
    assert set(r) == {"schema", "id", "version", "channel", "ha", "mods", "known", "errors"} and r["channel"] == "beta"
    assert [e["fp"] for e in r["errors"]] == [b["fp"]] and r["errors"][0]["n"] == 2
    assert set(r["errors"][0]) == {"fp", "src", "mod", "kind", "where", "msg", "n", "first", "last", "vers"}   # nichts darüber hinaus
    L.mark_sent(st, r, 1000.0)
    assert b["nd"] == 0 and b["n"] == 2 and L.build_report(st, "2026.11.5b2")["errors"] == []
    assert not L.is_due(st, 1000.0 + 3600) and L.is_due(st, 1000.0 + L.INTERVAL)
    L.add(st, src="backend", kind="TypeError", where="wallbox.py:976 add_km", msg="x", today=D, version="2026.11.4.1")
    assert L.build_report(st, "2026.11.5b2")["errors"][0]["n"] == 1      # nur seit dem letzten Bericht


def test_cfg_clean_and_kept_on_clear():
    c = L.clean_cfg({"on": True, "id": "kaputt", "skip": ["0123456789ab", "nope"]})
    assert c["on"] is False and c["skip"] == ["0123456789ab"]             # ohne gültige Kennung kein Senden
    st = L.clean({"cfg": {"asked": True}, "items": {}})
    assert st["cfg"]["asked"] is True
    assert L.build_report(L.empty(), "2026.11.4", real=False)["id"].startswith("7f3c")   # Beispiel für „Was würde gesendet?“


def test_manager_send_forget_and_404():
    import asyncio
    F = _stub_ha()
    F.async_call_later = lambda *a, **k: (lambda: None)
    hass = types.SimpleNamespace(data={"fenster_heizung": {}}, loop=types.SimpleNamespace(call_soon_threadsafe=lambda f: f()))
    m = F.FehlerSammler.__new__(F.FehlerSammler)
    m.hass, m._st, m._lock, m._version, m._rep, m._unsubs, m._busy = hass, L.empty(), __import__("threading").Lock(), "2026.11.5b2", [], [], False
    m._store = types.SimpleNamespace(async_delay_save=lambda *a, **k: None)
    calls = []

    async def post(path, body, status=[404]):
        calls.append((path, body)); return status[0]
    m._post = post
    srv = {}

    async def post_json(path, body):
        st = await post(path, body)
        return st, ({"ok": True, "status": srv} if 200 <= st < 300 else None)
    m._post_json = post_json

    async def run():
        await m.async_answer(True)
        assert m._st["cfg"]["on"] and L._ID.match(m._st["cfg"]["id"])
        r = await m.async_send(force=True)
        assert r == {"sent": False, "n": 0, "why": "noch nicht"} and calls[-1][1]["errors"] == []   # Build 6: Tages-Meldung „0 Fehler“
        assert calls[-1][1]["schema"] == L.SCHEMA and calls[-1][1]["mods"] == [] and calls[-1][1]["id"] == m._st["cfg"]["id"]
        m.record_threadsafe("backend", "TypeError", "wallbox.py:1 x", "boom 5")
        r = await m.async_send(force=True)
        assert calls[-1][0] == "/v1/errors" and not r["sent"] and r["why"] == "noch nicht"   # Server kennt /v1/errors noch nicht
        assert m.snapshot()["items"][0]["nd"] == 1                           # bleibt für später
        post.__defaults__[0][0] = 200
        r = await m.async_send(force=True)
        assert r["sent"] and m.snapshot()["items"][0]["nd"] == 0
        fp0 = m.snapshot()["items"][0]["fp"]
        srv[fp0] = {"s": "behoben", "fx": "2026.11.5b3"}                     # Build 7: Rückmeldung des Servers
        await m.async_send(force=True)
        assert calls[-1][1]["known"] == [fp0] and calls[-1][1]["errors"] == []
        sn = m.snapshot()
        assert sn["items"][0]["fix"]["upd"] and sn["upd"] == {"n": 1, "to": "2026.11.5b3"}
        idv = m._st["cfg"]["id"]
        s = await m.async_forget()
        assert calls[-1] == ("/v1/errors/forget", {"schema": L.SCHEMA, "id": idv}) and s["forgotten"] and not s["cfg"]["on"] and s["cfg"]["id"] == ""
    asyncio.run(run())


def test_build6_daily_report_and_modules():
    """Build 6: Bericht auch ohne Fehler (Tages-Meldung) und mit den Kurzzeichen der aktiven Module."""
    st = L.empty()
    st["cfg"].update(on=True, id="7f3c1e9a-4b2d-4c5e-9a1f-2d8b6e0c3a41")
    r = L.build_report(st, "2026.11.5b1", "2026.11.3", mods=["ev", "gr", "xmein", "<b>"])
    assert r["schema"] == L.SCHEMA and r["errors"] == [] and r["mods"] == ["gr", "ev"]
    assert set(r) == {"schema", "id", "version", "channel", "ha", "mods", "known", "errors"}
    assert L.build_report(st, "2026.11.5b1")["mods"] == []


def test_build6_active_mods():
    on = {"gr": True, "ww": False, "ev": True, "wx": 1, "xmein": True}
    addons = {"licht": {"v": "1"}, "muell": {"paused": True}, "abrechnung": {}, "saugroboter": {}, "boese": "x"}
    assert L.active_mods(on, addons) == ["gr", "ev", "li", "ab"]
    assert L.active_mods(None, None) == [] and L.active_mods([1], [2]) == []


def test_build7_versions_order():
    v = ["2026.11.5b1", "2026.11.4.2", "2026.11.4.3b1", "2026.11.4.3", "2026.11.5", "2026.11.4", "kaputt"]
    assert sorted(v, key=L.vkey) == ["kaputt", "2026.11.4", "2026.11.4.2", "2026.11.4.3b1", "2026.11.4.3", "2026.11.5b1", "2026.11.5"]


def test_build7_known_and_status():
    """Build 7: Der Bericht fragt nach dem Status schon gesendeter Fehler; die Antwort landet am Eintrag."""
    st = L.empty()
    st["cfg"].update(on=True, id="7f3c1e9a-4b2d-4c5e-9a1f-2d8b6e0c3a41")
    a = L.add(st, src="backend", kind="TypeError", where="a.py:1 f", msg="a", today=D, version="2026.11.5b1")
    b = L.add(st, src="backend", kind="TypeError", where="b.py:1 f", msg="b", today=D, version="2026.11.5b1")
    c = L.add(st, src="backend", kind="TypeError", where="c.py:1 f", msg="c", today=D, version="2026.11.5b1")
    r = L.build_report(st, "2026.11.5b1")
    assert r["schema"] == L.SCHEMA and r["known"] == [] and len(r["errors"]) == 3
    L.mark_sent(st, r, 1.0)
    L.add(st, src="backend", kind="TypeError", where="a.py:1 f", msg="a", today=D, version="2026.11.5b1")   # a ist wieder neu
    st["cfg"]["skip"] = [c["fp"]]
    r = L.build_report(st, "2026.11.5b1")
    assert [x["fp"] for x in r["errors"]] == [a["fp"]] and r["known"] == [b["fp"]], "weggelassene nie, neue stehen in errors"
    ans = {a["fp"]: {"s": "behoben", "fx": "2026.11.5b2"}, b["fp"]: {"s": "ignoriert"}, "ffffffffffff": {"s": "offen"}}
    b["srv"] = {"s": "arbeit", "fx": "", "d": "x"}
    assert L.apply_status(st, r, ans, D) == 1
    assert a["srv"] == {"s": "behoben", "fx": "2026.11.5b2", "d": D.isoformat()}
    assert "srv" not in b, "ignoriert → keine Anzeige, alter Status weg"
    assert "ffffffffffff" not in st["items"]
    st2 = L.clean(st)
    assert st2["items"][a["fp"]]["srv"]["fx"] == "2026.11.5b2" and "srv" not in st2["items"][b["fp"]]
    assert L.clean_srv({"s": "behoben", "fx": "<script>"}) == {"s": "behoben", "fx": "", "d": ""}
    assert L.clean_srv({"s": "geheim"}) is None and L.clean_srv("x") is None
    L.clear_status(st)
    assert "srv" not in a


def test_build7_fix_info():
    e = {"vers": ["2026.11.5b1"], "srv": {"s": "behoben", "fx": "2026.11.5b2", "d": ""}}
    f = L.fix_info(e, "2026.11.5b1")
    assert f["upd"] and not f["again"] and f["beta_fix"]
    assert not L.fix_info(e, "2026.11.5b2")["upd"]
    f = L.fix_info(e, "2026.11.4.5")          # stabiler Nutzer, Fix bisher nur in einer Beta
    assert not f["upd"] and f["wait"]
    assert L.fix_info({**e, "srv": {"s": "behoben", "fx": "2026.11.4.6", "d": ""}}, "2026.11.4.5")["upd"]
    f = L.fix_info({"vers": ["2026.11.5b1", "2026.11.5b2"], "srv": e["srv"]}, "2026.11.5b2")
    assert f["again"] and not f["upd"], "trotz Fix wieder aufgetreten"
    assert L.fix_info({"srv": {"s": "arbeit", "fx": "", "d": ""}}, "2026.11.5b1") == {"s": "arbeit", "fx": "", "upd": False, "again": False, "beta_fix": False}
    assert L.fix_info({}, "2026.11.5b1") is None


def test_build12_chain_and_device():
    """Build 12: Aufrufkette (bis 3 Stellen, nur eigener Code) und Gerätearten im Bericht – Fingerabdruck bleibt gleich."""
    st = L.empty()
    st["cfg"].update(on=True, id="7f3c1e9a-4b2d-4c5e-9a1f-2d8b6e0c3a41")
    ch = ["gr_ent.py:171 _sync", "gr_ent.py:98 _on_plan", "haus.py:412 async_save_plan", "x.py:1 zu_viel"]
    a = L.add(st, src="backend", kind="RuntimeError", where="gr_ent.py:171 _sync", msg="m", today=D, version="2026.11.5b3", chain=ch)
    b = L.add(st, src="backend", kind="RuntimeError", where="gr_ent.py:171 _sync", msg="m", today=D, version="2026.11.5b3")
    assert a is b and a["fp"] == L.fingerprint("backend", "RuntimeError", "gr_ent.py:171 _sync", "m"), "Kette ändert den Fingerabdruck nicht"
    assert a["chain"] == ch[:3]
    u = L.add(st, src="oberflaeche", kind="TypeError", where="_rkHtml", msg="x", today=D, version="2026.11.5b3", dev="handy")
    L.add(st, src="oberflaeche", kind="TypeError", where="_rkHtml", msg="x", today=D, version="2026.11.5b3", dev="handy")
    L.add(st, src="oberflaeche", kind="TypeError", where="_rkHtml", msg="x", today=D, version="2026.11.5b3", dev="tablet")
    r = L.build_report(st, "2026.11.5b3")
    assert r["schema"] == 4
    by = {x["fp"]: x for x in r["errors"]}
    assert by[a["fp"]]["chain"] == ch[:3] and "dev" not in by[a["fp"]]
    assert by[u["fp"]]["dev"] == ["handy", "tablet"] and "chain" not in by[u["fp"]], "nur die Arten, keine Zahlen"
    for bad in (["/config/custom_components/x.py:1 f", "a.py:1 g"], ["../geheim.py:1 f", "a.py:1 g"], ["a b c d", "x.py:1 f"], "kein Array", [1, 2]):
        assert len(L.clean_chain(bad)) <= 1, bad
    assert "chain" in L.clean(st)["items"][a["fp"]] and L.clean(st)["items"][a["fp"]]["chain"] == ch[:3]
    assert "chain" not in L.add(L.empty(), src="backend", kind="X", where="a.py:1 f", msg="m", today=D, version="2026.11.5b3", chain=["a.py:1 f"]), "eine Stelle allein ist keine Kette"
