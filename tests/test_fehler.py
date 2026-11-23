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
