"""Tests für den Statistik-Server (statistik-server/server.py) – nur Standardbibliothek."""
from __future__ import annotations

import base64
import importlib.util
import json
import pathlib
import sys
import urllib.error
import urllib.request
import uuid
from datetime import date, datetime, timedelta

P = pathlib.Path(__file__).resolve().parents[1] / "statistik-server" / "server.py"
spec = importlib.util.spec_from_file_location("fh_stats_server", P)
S = importlib.util.module_from_spec(spec)
sys.modules["fh_stats_server"] = S
spec.loader.exec_module(S)


def new_id():
    return str(uuid.uuid4())


def ts(day: date, hour: int = 12) -> float:
    return datetime(day.year, day.month, day.day, hour).timestamp()


def ping(db, i, v, day, hour=12):
    return db.ping({"id": i, "version": v, "channel": S.channel_of(v)}, ts(day, hour))


def test_version_order():
    vs = ["2026.11.4", "2026.11.4b25", "2026.11.4.1", "2026.11.5b1", "2026.11.3.1", "2026.12.1", "2026.11.10"]
    out = sorted(vs, key=S.ver_key)
    assert out == ["2026.11.3.1", "2026.11.4b25", "2026.11.4", "2026.11.4.1", "2026.11.5b1", "2026.11.10", "2026.12.1"]


def test_valid_ping():
    i = new_id()
    ok = {"schema": 1, "id": i, "version": "2026.11.4", "channel": "stable"}
    assert S.valid_ping(ok) == {"id": i, "version": "2026.11.4", "channel": "stable", "modules": None}
    # unbekannte Felder werden verworfen (nicht gespeichert)
    assert S.valid_ping({**ok, "name": "Max", "ip": "1.2.3.4"}) == {"id": i, "version": "2026.11.4", "channel": "stable", "modules": None}
    # Schema 2: Modulliste, nur bekannte Kurzzeichen, feste Reihenfolge
    assert S.valid_ping({**ok, "schema": 2, "modules": ["en", "ww", "ww"]})["modules"] == "ww,en"
    assert S.valid_ping({**ok, "schema": 2, "modules": []})["modules"] == ""
    for badm in [None, "ww", ["xeigen"], ["ww", 1], ["a"] * 40, {"ww": True}]:
        assert S.valid_ping({**ok, "schema": 2, "modules": badm}) is None
    assert S.valid_ping({**ok, "channel": "beta"}) is None            # passt nicht zur Version
    assert S.valid_ping({**ok, "version": "2026.11.4b3", "channel": "beta"})["channel"] == "beta"
    for bad in [{**ok, "schema": 4}, {**ok, "schema": 2}, {**ok, "id": "abc"}, {**ok, "version": "x"}, {**ok, "id": i.upper()}, [], "x", None, {}]:
        assert S.valid_ping(bad) is None


def test_ping_forget_cleanup(tmp_path):
    db = S.DB(str(tmp_path / "s.db"))
    a, b = new_id(), new_id()
    d0 = date(2026, 11, 1)
    assert ping(db, a, "2026.11.4", d0) == "ok"
    assert ping(db, a, "2026.11.4", d0, 12) == "too_many"            # höchstens 1× pro Stunde
    assert ping(db, a, "2026.11.5", d0 + timedelta(days=1)) == "ok"  # nächster Tag: neue Version
    assert db.installs()[0][3] == "2026.11.5"
    assert ping(db, b, "2026.11.4", d0) == "ok"
    db.forget(a)
    assert [r[0] for r in db.installs()] == [b]
    assert all(r[1] == b for r in db.daily("2000-01-01"))
    assert db.cleanup(180, today=d0 + timedelta(days=100)) == 0
    assert db.cleanup(180, today=d0 + timedelta(days=200)) == 1
    assert db.installs() == []


def test_compute_and_render(tmp_path):
    db = S.DB(str(tmp_path / "s.db"))
    today = date(2026, 12, 10)
    ids = [new_id() for _ in range(10)]
    # alle auf 2026.11.4, ab 2026.12.2 wechseln 8 von 10 nach und nach auf 2026.12.1
    for n, i in enumerate(ids):
        for k in range(12):
            day = today - timedelta(days=11 - k)
            v = "2026.12.1" if (day >= date(2026, 12, 2) + timedelta(days=n // 2) and n < 8) else "2026.11.4"
            ping(db, i, v, day)
    r = S.compute(db, today)
    assert r["a30"] == 10 and r["a7"] == 10 and r["inactive"] == 0
    assert r["newest"] == "2026.12.1" and r["newest_share"] == 80
    assert dict(r["versions"]) == {"2026.12.1": 8, "2026.11.4": 2}
    assert r["channels"] == {"stable": 10, "beta": 0}
    assert r["curves"] and r["curves"][0]["v"] == "2026.12.1"
    assert r["curves"][0]["pts"][0] <= r["curves"][0]["pts"][-1] <= 100
    assert r["t50"] is not None
    page = S.render(db, today)
    assert "2026.12.1" in page and "Aktive Installationen" in page and "<svg" in page
    assert "192.168" not in page


def test_render_empty(tmp_path):
    page = S.render(S.DB(str(tmp_path / "e.db")), date(2026, 12, 10))
    assert "Noch keine Daten" in page


def test_password():
    h = S.hash_password("ein-langes-passwort", iters=1000)
    assert S.check_password("ein-langes-passwort", h)
    assert not S.check_password("falsch", h)
    assert not S.check_password("x", "kaputt")


def post(url, body):
    req = urllib.request.Request(url, data=json.dumps(body).encode() if not isinstance(body, bytes) else body, method="POST",
                                 headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=5) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code


def test_http_ingest_and_dashboard(tmp_path):
    db = S.DB(str(tmp_path / "h.db"))
    ing = S.serve("127.0.0.1", 0, S.make_ingest(db))
    ph = S.hash_password("geheimes-passwort-1", iters=1000)
    dash = S.serve("127.0.0.1", 0, S.make_dash(db, "admin", ph))
    try:
        base = f"http://127.0.0.1:{ing.server_address[1]}"
        i = new_id()
        good = {"schema": 1, "id": i, "version": "2026.11.4", "channel": "stable"}
        assert post(base + "/v1/ping", good) == 200
        assert post(base + "/v1/ping", good) == 429                      # zu schnell wiederholt
        assert post(base + "/v1/ping", {**good, "id": "x"}) == 400
        assert post(base + "/v1/ping", b"{kaputt") == 400
        assert post(base + "/v1/ping", b"x" * 5000) == 413
        assert post(base + "/v1/zeigmir", good) == 404
        # Der Eingang gibt nie Daten heraus
        try:
            urllib.request.urlopen(base + "/", timeout=5)
            assert False
        except urllib.error.HTTPError as e:
            assert e.code == 404
        assert len(db.installs()) == 1
        assert post(base + "/v1/forget", {"schema": 1, "id": i}) == 200
        assert db.installs() == []
        # Dashboard: ohne Passwort gesperrt, mit Passwort erreichbar, nach Fehlversuchen gesperrt
        dbase = f"http://127.0.0.1:{dash.server_address[1]}/"

        def get(auth=None):
            req = urllib.request.Request(dbase)
            if auth:
                req.add_header("Authorization", "Basic " + base64.b64encode(auth.encode()).decode())
            try:
                with urllib.request.urlopen(req, timeout=5) as r:
                    return r.status, r.read().decode()
            except urllib.error.HTTPError as e:
                return e.code, ""
        assert get()[0] == 401
        code, body = get("admin:geheimes-passwort-1")
        assert code == 200 and "Statistik" in body
        for _ in range(5):
            assert get("admin:falsch")[0] == 401
        assert get("admin:geheimes-passwort-1")[0] == 429
    finally:
        ing.shutdown()
        dash.shutdown()


def test_modules_stored_and_shown(tmp_path):
    db = S.DB(str(tmp_path / "m.db"))
    today = date(2026, 12, 10)
    a, b, c = new_id(), new_id(), new_id()
    base = {"version": "2026.11.4", "channel": "stable"}
    ts_ = ts(today)
    assert db.ping({"id": a, **base, "modules": "ww,en,ev"}, now=ts_) == "ok"
    assert db.ping({"id": b, **base, "modules": "ww"}, now=ts_) == "ok"
    assert db.ping({"id": c, **base, "modules": None}, now=ts_) == "ok"     # ohne Angabe: zählt nicht in die Basis
    r = S.compute(db, today)
    assert r["mod_base"] == 2 and dict(r["modules"]) == {"2 Warmwasser": 2, "3 Energie": 1, "8 E-Auto": 1}
    page = S.render(db, today)
    assert "Modul-Nutzung" in page and "100 %" in page and "50 %" in page
    # spätere Meldung ersetzt die Liste
    db.ping({"id": a, **base, "modules": "ww"}, now=ts_ + 7200)
    assert dict(S.compute(db, today)["modules"]) == {"2 Warmwasser": 2}


def test_old_database_is_migrated(tmp_path):
    import sqlite3
    p = str(tmp_path / "old.db")
    c = sqlite3.connect(p)
    c.executescript("CREATE TABLE installs(id TEXT PRIMARY KEY, first_day TEXT NOT NULL, last_day TEXT NOT NULL, version TEXT NOT NULL, channel TEXT NOT NULL, last_ts INTEGER NOT NULL);"
                    "INSERT INTO installs VALUES('x','2026-01-01','2026-01-02','2026.11.3','stable',1);")
    c.commit(); c.close()
    db = S.DB(p)
    assert db.installs()[0][5] is None
