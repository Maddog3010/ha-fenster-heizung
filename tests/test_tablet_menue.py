"""Tablet-Einstellungen 2026.11.5b13: Startseite, Ruhebild „Uhr“, Wetter-Szene, Nachtruhe (tablet.py ohne Home Assistant)."""
from __future__ import annotations

import importlib.util
import pathlib
import sys
import types

BASE = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung"


def _load():
    saved = dict(sys.modules)
    try:
        def mod(name, **kw):
            m = types.ModuleType(name); m.__dict__.update(kw); sys.modules[name] = m; return m
        mod("homeassistant"); mod("homeassistant.helpers"); mod("homeassistant.util")
        mod("homeassistant.core", CALLBACK_TYPE=object, Event=object, HomeAssistant=object, callback=lambda f: f)
        mod("homeassistant.helpers.event", async_call_later=None, async_track_state_change_event=None)
        mod("homeassistant.helpers.storage", Store=object)
        mod("homeassistant.util.dt", now=None)
        sys.modules["homeassistant.util"].dt = sys.modules["homeassistant.util.dt"]
        pkg = mod("fhtpkg"); pkg.__path__ = [str(BASE)]
        mod("fhtpkg.const", DOMAIN="fenster_heizung")
        spec = importlib.util.spec_from_file_location("fhtpkg.tablet", BASE / "tablet.py")
        m = importlib.util.module_from_spec(spec); sys.modules["fhtpkg.tablet"] = m; spec.loader.exec_module(m)
        return m
    finally:
        for k in list(sys.modules):
            if k not in saved:
                del sys.modules[k]
        sys.modules.update(saved)


T = _load()


def test_defaults_and_cleaning():
    d = T.clean_cfg({})
    assert d["home"] == "st" and d["rest_wx"] is True and d["night"] == {"on": False, "from": "22:00", "to": "06:00", "bri": 30}
    c = T.clean_cfg({"home": "wx", "rest": "clock", "rest_wx": False, "night": {"on": True, "from": "23:30", "to": "05:45", "bri": 12}})
    assert c["home"] == "wx" and c["rest"] == "clock" and c["rest_wx"] is False and c["night"] == {"on": True, "from": "23:30", "to": "05:45", "bri": 10}
    b = T.clean_cfg({"home": "../x", "rest": "kaputt", "night": {"on": "ja", "from": "25:00", "to": 7, "bri": "x"}})
    assert b["home"] == "st" and b["rest"] == "auto" and b["night"] == {"on": False, "from": "22:00", "to": "06:00", "bri": 30}
    assert T.clean_cfg({"night": {"bri": 500}})["night"]["bri"] == 100 and T.clean_cfg({"night": {"bri": 0}})["night"]["bri"] == 5


def test_night_window():
    n = {"night": {"on": True, "from": "22:00", "to": "06:00", "bri": 30}}
    assert T.night_active(n, "23:10") and T.night_active(n, "00:00") and T.night_active(n, "05:59")
    assert not T.night_active(n, "06:00") and not T.night_active(n, "12:00") and not T.night_active(n, "21:59")
    day = {"night": {"on": True, "from": "13:00", "to": "15:00"}}
    assert T.night_active(day, "14:00") and not T.night_active(day, "15:00")
    assert not T.night_active({"night": {"on": False, "from": "22:00", "to": "06:00"}}, "23:00")
    assert not T.night_active({"night": {"on": True, "from": "22:00", "to": "22:00"}}, "22:00")


def test_menu_wired():
    panel = (BASE / "frontend" / "panel.js").read_text(encoding="utf-8")
    assert "return this._tmSetHtml();" in panel and "  _tmSetHtml() {" in panel and "if (this._tmxAct(a, b)) return;" in panel
    assert 'if (a === "mdgo" && this._tmOn && this._tmOn())' in panel   # Hausfluss-Knopf im Tablet-Modus
    api = (BASE / "api.py").read_text(encoding="utf-8")
    assert '"fenster_heizung/tm_test"' in api and "ws_tm_test, ws_tm_check" in api
