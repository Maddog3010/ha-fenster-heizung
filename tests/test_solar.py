"""Tests für Modul 16 (solar.py) ohne Home Assistant.

Ausführen: python3 -m pytest tests  oder  python3 tests/test_solar.py
Die Home-Assistant-Module werden durch kleine Platzhalter ersetzt; geprüft werden nur die reinen Rechenfunktionen.
"""
from __future__ import annotations

import importlib.util
import pathlib
import sys
import types
from datetime import date, datetime, timedelta, timezone

ROOT = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung"


def _stub(name: str, **attrs) -> None:
    m = sys.modules.get(name) or types.ModuleType(name)
    for k, v in attrs.items():
        setattr(m, k, v)
    sys.modules[name] = m


def _load():
    if "fh_solar" in sys.modules:
        return sys.modules["fh_solar"]
    for n in ("homeassistant", "homeassistant.helpers", "homeassistant.util"):
        _stub(n)
    _stub("homeassistant.config_entries", ConfigEntryState=type("S", (), {"LOADED": object()}))
    _stub("homeassistant.core", CALLBACK_TYPE=object, HomeAssistant=object)
    _stub("homeassistant.helpers.dispatcher", async_dispatcher_send=lambda *a, **k: None)
    _stub("homeassistant.helpers.event", async_track_time_interval=lambda *a, **k: None)
    _stub("homeassistant.helpers.storage", Store=object)
    _stub("homeassistant.util.dt", now=lambda: datetime.now(timezone.utc), as_utc=lambda t: t)
    sys.modules["homeassistant.util"].dt = sys.modules["homeassistant.util.dt"]
    _stub("fhpkg")
    sys.modules["fhpkg"].__path__ = [str(ROOT)]
    _stub("fhpkg.backup", SafeStore=object)
    _stub("fhpkg.const", DOMAIN="fenster_heizung")
    spec = importlib.util.spec_from_file_location("fhpkg.solar", ROOT / "solar.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    sys.modules["fh_solar"] = mod
    return mod


S = _load()
TZ = timezone(timedelta(hours=1))
D0 = date(2026, 11, 12)


def _hist(pairs):
    return {(D0 - timedelta(days=i + 1)).isoformat(): {"f": f, "a": a} for i, (f, a) in enumerate(pairs)}


def test_correction_needs_seven_days():
    assert S.correction(_hist([(10, 9)] * 6), D0)[0] is None
    cf, n = S.correction(_hist([(10, 9)] * 7), D0)
    assert n == 7 and abs(cf - 0.9) < 0.01


def test_correction_median_ignores_snow_day():
    cf, _ = S.correction(_hist([(10, 9)] * 8 + [(10, 0.1)]), D0)
    assert 0.85 <= cf <= 0.95


def test_correction_is_clamped():
    assert S.correction(_hist([(10, 2)] * 10), D0)[0] == 0.6
    assert S.correction(_hist([(10, 30)] * 10), D0)[0] == 1.4


def test_low_yield():
    fc = [[h, 1.0] for h in range(8, 17)]
    assert S.low_yield({10: 0.1, 11: 0.1}, fc, 12) is not None
    assert S.low_yield({10: 0.9, 11: 0.9}, fc, 12) is None


def test_rest_today_counts_part_of_current_hour():
    rows = [[10, 1.0], [11, 2.0], [12, 2.0]]
    assert S.rest_today(rows, datetime(2026, 11, 12, 11, 30, tzinfo=TZ)) == 3.0
    assert S.rest_today(rows, datetime(2026, 11, 12, 13, 0, tzinfo=TZ)) == 0.0


def test_site_names_unique():
    used: list[str] = []
    for t in ("Süd", "Süd", None):
        used.append(S.site_name(t, "Anlage", used))
    assert used == ["Süd", "Süd 2", "Anlage"]


def test_day_sums_and_best_window():
    wh = {datetime(2026, 11, 12, h, tzinfo=TZ).isoformat(): v for h, v in ((9, 500), (10, 1500), (11, 2000), (12, 1800), (13, 400))}
    assert S.day_sums(wh, TZ, D0) == 6.2
    b = S.best_window(S.hourly(wh, TZ, D0))
    assert b == {"from": 10, "to": 13, "kwh": 5.3}


def test_parse_detailed_solcast():
    r = S.parse_detailed([{"period_start": "2026-11-12T10:00:00+01:00", "pv_estimate": 2.0},
                          {"period_start": "2026-11-12T10:30:00+01:00", "pv_estimate": 2.0}])
    assert abs(sum(r.values()) - 2000) < 1


def test_upgrade_and_prune():
    d = S.upgrade({"v": 1, "cfg": {}, "hist": {"2026-11-01": {"f": 5, "a": 4, "base": 1, "alt": "x"}, "kaputt": 3}})
    assert d["v"] == S.SCHEMA and d["hist"] == {"2026-11-01": {"f": 5, "a": 4, "base": 1}}
    h = {(D0 - timedelta(days=i)).isoformat(): {"f": 1, "a": 1, "fh": [[1, 1]]} for i in range(450)}
    S.prune(h, D0)
    assert len(h) == S.KEEP_DAYS
    assert not any("fh" in v for k, v in h.items() if (D0 - date.fromisoformat(k)).days > S.KEEP_HOURLY)
    assert "fh" in h[D0.isoformat()]


def test_pick_sites():
    c = [{"id": "fs1"}, {"id": "fs2"}, {"id": "sc1"}]
    assert S.pick_sites(c, [], []) == ({"fs1", "fs2", "sc1"}, "all")
    assert S.pick_sites(c, [], ["sc1", "weg"]) == ({"sc1"}, "energy")
    assert S.pick_sites(c, ["fs1", "fs2"], ["sc1"]) == ({"fs1", "fs2"}, "manual")
    assert S.pick_sites(c, ["weg"], []) == ({"fs1", "fs2", "sc1"}, "all")


def test_correction_since():
    h = _hist([(10, 9)] * 10)
    since = (D0 - timedelta(days=3)).isoformat()
    assert S.correction(h, D0, since) == (None, 3)


def test_clean_cfg_sites():
    c = S.clean_cfg({"sites": ["abc123", "x y", 5], "since": "2026-11-12"})
    assert c["sites"] == ["abc123"] and c["since"] == "2026-11-12"
    assert S.clean_cfg({"since": "gestern"})["since"] == ""


if __name__ == "__main__":
    n = 0
    for k, f in list(globals().items()):
        if k.startswith("test_") and callable(f):
            f()
            n += 1
    print(f"{n} Tests ok")
