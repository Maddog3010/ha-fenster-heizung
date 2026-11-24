#!/usr/bin/env python3
"""Statistik-Server für „Strom & Wärme“ (Versions-Statistik). Nur Python-Standardbibliothek, keine Pakete nötig.

Zwei getrennte Listener in einem Prozess:

  Eingang    (INGEST_HOST:INGEST_PORT, Standard 127.0.0.1:8081)  – wird vom Cloudflare Tunnel erreicht, nimmt nur
             POST /v1/ping und POST /v1/forget an und gibt nie Daten heraus.
  Dashboard  (DASH_HOST:DASH_PORT, Standard 127.0.0.1:8443)       – nur die Auswertung, mit Passwort. Bind auf die
             LAN-IP des Containers; von außen nur per VPN (WireGuard der Fritzbox) erreichbar.

Gespeichert wird je Installation: zufällige Kennung (UUID), Version, Kanal, erster/letzter Tag. IP-Adressen und
User-Agent werden weder gespeichert noch protokolliert (die Begrenzung pro Absender lebt nur im Arbeitsspeicher).

  python3 server.py            Server starten (Einstellungen über Umgebungsvariablen, siehe README.md)
  python3 server.py hash       Passwort-Hash für DASH_PASS_HASH erzeugen
"""
from __future__ import annotations

import base64
import getpass
import hashlib
import hmac
import html
import json
import os
import re
import secrets
import sqlite3
import ssl
import sys
import threading
import time
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

SCHEMA = (1, 2, 3)   # Schema 1: ohne Module · Schema 2: mit Modulliste · Schema 3: dazu HA-Version (hier nicht ausgewertet)
MODULES = {"ww": "2 Warmwasser", "en": "3 Energie", "gs": "4 Gerätestrom", "lu": "5 Lüftung", "rb": "6 Rollläden", "wp": "7 Wärmepumpe", "ev": "8 E-Auto", "wx": "9 Wetter", "ga": "10 Garten", "sf": "11 Sicherheit", "pl": "12 Pool & Sauna", "bt": "13 Batterie", "dt": "14 Stromtarif", "wa": "15 Wartung", "sp": "16 Prognose", "ef": "19 Hausfluss"}
MAX_BODY = 1024
ID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")
VER_RE = re.compile(r"^(\d{4})\.(\d{1,2})\.(\d{1,2})(?:\.(\d{1,2}))?(?:b(\d{1,3}))?$")
PING_MIN_GAP = 3600           # eine Kennung höchstens 1× pro Stunde
IP_LIMIT = 60                 # Meldungen pro Minute je Absender
LOGIN_FAILS = 5               # Fehlversuche, danach Sperre
LOGIN_LOCK = 900              # Sekunden


def cfg(name: str, default: str = "") -> str:
    return os.environ.get(name, default)


# ------------------------------------------------------------------ Versionen
def ver_key(v: str) -> tuple:
    """Sortierschlüssel: 2026.11.4b25 < 2026.11.4 < 2026.11.4.1 < 2026.11.4.2 < 2026.11.4.3b1 < 2026.11.4.3 < 2026.11.5b1."""
    m = VER_RE.match(v or "")
    if not m:
        return (0, 0, 0, 0, 0, 0)
    y, mo, r, h, b = m.groups()
    return (int(y), int(mo), int(r), int(h or 0), 0 if b else 1, int(b or 0))


def channel_of(v: str) -> str:
    return "beta" if re.search(r"b\d+$", v or "") else "stable"


def valid_ping(d: object) -> dict | None:
    """Prüft eine Meldung streng. Nur die vier bekannten Felder zählen, alles andere wird verworfen."""
    if not isinstance(d, dict) or d.get("schema") not in SCHEMA:
        return None
    i, v, c = d.get("id"), d.get("version"), d.get("channel")
    if not (isinstance(i, str) and ID_RE.match(i) and isinstance(v, str) and VER_RE.match(v) and isinstance(c, str)):
        return None
    if c != channel_of(v):
        return None
    mods = None            # None = Schema 1 / nicht gemeldet
    if d.get("schema") in (2, 3):
        m = d.get("modules")
        if not isinstance(m, list) or len(m) > len(MODULES) or any(not isinstance(x, str) or x not in MODULES for x in m):
            return None
        mods = ",".join(k for k in MODULES if k in m)   # feste Reihenfolge, Duplikate fallen weg
    return {"id": i, "version": v, "channel": c, "modules": mods}


# ------------------------------------------------------------------ Datenbank
class DB:
    def __init__(self, path: str) -> None:
        self.path = path
        self.lock = threading.Lock()
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
        self.c = sqlite3.connect(path, check_same_thread=False, isolation_level=None)
        self.c.execute("PRAGMA journal_mode=WAL")
        self.c.executescript("""
            CREATE TABLE IF NOT EXISTS installs(id TEXT PRIMARY KEY, first_day TEXT NOT NULL, last_day TEXT NOT NULL,
                version TEXT NOT NULL, channel TEXT NOT NULL, last_ts INTEGER NOT NULL);
            CREATE TABLE IF NOT EXISTS daily(day TEXT NOT NULL, id TEXT NOT NULL, version TEXT NOT NULL, channel TEXT NOT NULL,
                PRIMARY KEY(day, id));
            CREATE INDEX IF NOT EXISTS daily_id ON daily(id);
        """)
        if "modules" not in [r[1] for r in self.c.execute("PRAGMA table_info(installs)")]:
            self.c.execute("ALTER TABLE installs ADD COLUMN modules TEXT")   # NULL = keine Modulangabe

    def ping(self, p: dict, now: float | None = None) -> str:
        now = now or time.time()
        day = datetime.fromtimestamp(now).strftime("%Y-%m-%d")
        with self.lock:
            row = self.c.execute("SELECT last_ts FROM installs WHERE id=?", (p["id"],)).fetchone()
            if row and now - row[0] < PING_MIN_GAP:
                return "too_many"
            if row:
                self.c.execute("UPDATE installs SET last_day=?, version=?, channel=?, last_ts=?, modules=? WHERE id=?",
                               (day, p["version"], p["channel"], int(now), p.get("modules"), p["id"]))
            else:
                self.c.execute("INSERT INTO installs(id, first_day, last_day, version, channel, last_ts, modules) VALUES(?,?,?,?,?,?,?)",
                               (p["id"], day, day, p["version"], p["channel"], int(now), p.get("modules")))
            self.c.execute("INSERT OR REPLACE INTO daily(day, id, version, channel) VALUES(?,?,?,?)",
                           (day, p["id"], p["version"], p["channel"]))
        return "ok"

    def forget(self, inst_id: str) -> None:
        with self.lock:
            self.c.execute("DELETE FROM installs WHERE id=?", (inst_id,))
            self.c.execute("DELETE FROM daily WHERE id=?", (inst_id,))

    def cleanup(self, keep_days: int, today: date | None = None) -> int:
        today = today or date.today()
        cut = (today - timedelta(days=keep_days)).isoformat()
        with self.lock:
            gone = [r[0] for r in self.c.execute("SELECT id FROM installs WHERE last_day<?", (cut,))]
            for i in gone:
                self.c.execute("DELETE FROM installs WHERE id=?", (i,))
                self.c.execute("DELETE FROM daily WHERE id=?", (i,))
            self.c.execute("DELETE FROM daily WHERE day<?", ((today - timedelta(days=400)).isoformat(),))
        return len(gone)

    def installs(self) -> list[tuple]:
        with self.lock:
            return self.c.execute("SELECT id, first_day, last_day, version, channel, modules FROM installs").fetchall()

    def daily(self, since: str) -> list[tuple]:
        with self.lock:
            return self.c.execute("SELECT day, id, version, channel FROM daily WHERE day>=?", (since,)).fetchall()


# ------------------------------------------------------------------ Auswertung
def d_(s: str) -> date:
    return date.fromisoformat(s)


def compute(db: DB, today: date | None = None) -> dict:
    today = today or date.today()
    ins = db.installs()
    age = lambda r: (today - d_(r[2])).days
    act30 = [r for r in ins if age(r) <= 29]
    act7 = [r for r in ins if age(r) <= 6]
    out: dict = {"today": today.isoformat(), "total": len(ins), "a30": len(act30), "a7": len(act7),
                 "new7": sum(1 for r in ins if (today - d_(r[1])).days <= 6), "inactive": sum(1 for r in ins if age(r) > 14)}
    vc: dict[str, int] = defaultdict(int)
    for r in act30:
        vc[r[3]] += 1
    out["versions"] = sorted(vc.items(), key=lambda kv: ver_key(kv[0]), reverse=True)
    newest = out["versions"][0][0] if out["versions"] else ""
    out["newest"] = newest
    out["newest_share"] = round(100 * vc[newest] / len(act30)) if act30 and newest else 0
    ch = defaultdict(int)
    for r in act30:
        ch[r[4]] += 1
    out["channels"] = {"stable": ch.get("stable", 0), "beta": ch.get("beta", 0)}
    withm = [r for r in act30 if r[5] is not None]
    mc: dict[str, int] = defaultdict(int)
    for r in withm:
        for k in filter(None, r[5].split(",")):
            mc[k] += 1
    out["mod_base"] = len(withm)
    out["modules"] = sorted(((MODULES[k], n) for k, n in mc.items() if k in MODULES), key=lambda kv: (-kv[1], kv[0]))
    out["seen"] = [("heute", sum(1 for r in ins if age(r) == 0)), ("2–7 Tage", sum(1 for r in ins if 1 <= age(r) <= 6)),
                   ("8–14 Tage", sum(1 for r in ins if 7 <= age(r) <= 14)), ("> 14 Tage", out["inactive"])]
    # Wochenverlauf (letzte 8 Wochen, Montag bis Sonntag)
    mon = today - timedelta(days=today.weekday())
    weeks = [mon - timedelta(weeks=k) for k in range(7, -1, -1)]
    rows = db.daily((weeks[0]).isoformat())
    per: dict[tuple[date, str], str] = {}
    for day, i, v, _c in rows:
        w = d_(day) - timedelta(days=d_(day).weekday())
        k = (w, i)
        if k not in per or ver_key(v) > ver_key(per[k]):
            per[k] = v
    wk: list[dict[str, int]] = [defaultdict(int) for _ in weeks]
    idx = {w: n for n, w in enumerate(weeks)}
    for (w, _i), v in per.items():
        if w in idx:
            wk[idx[w]][v] += 1
    allv = sorted({v for w in wk for v in w}, key=ver_key, reverse=True)
    out["week_versions"] = allv[:4]
    out["weeks"] = [{"label": w.strftime("%d.%m."), "counts": {v: w_.get(v, 0) for v in allv[:4]},
                     "other": sum(c for v, c in w_.items() if v not in allv[:4])} for w, w_ in zip(weeks, wk)]
    # Update-Tempo der letzten zwei Versionen (Anteil der aktiven Installationen, die nach d Tagen auf der Version sind)
    since = (today - timedelta(days=60)).isoformat()
    drows = db.daily(since)
    first_seen: dict[str, str] = {}
    for day, _i, v, _c in sorted(drows):
        first_seen.setdefault(v, day)
    cand = [v for v in sorted(first_seen, key=ver_key, reverse=True)][:3]
    curves = []
    for v in cand:
        r0 = d_(first_seen[v])
        span = (today - r0).days
        if span < 2:
            continue
        cohort = {i for day, i, _v, _c in drows if r0 <= d_(day) <= r0 + timedelta(days=14)}
        if len(cohort) < 2:
            continue
        pts = []
        for d in range(0, min(span, 14) + 1):
            have = {i for day, i, vv, _c in drows if vv == v and d_(day) <= r0 + timedelta(days=d)}
            pts.append(round(100 * len(have & cohort) / len(cohort), 1))
        curves.append({"v": v, "pts": pts})
        if len(curves) == 2:
            break
    out["curves"] = curves
    t50 = None
    for c in curves:
        for d, p in enumerate(c["pts"]):
            if p >= 50:
                t50 = d
                break
        if t50 is not None:
            break
    out["t50"] = t50
    return out


# ------------------------------------------------------------------ Darstellung
VCOL = ["#86b6ef", "#5598e7", "#2a78d6", "#1c5cab"]
CSS = """
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#111110;color:#f0efec;font:14px/1.45 system-ui,Segoe UI,Roboto,sans-serif}
.w{max-width:1100px;margin:0 auto;padding:14px}.ban{background:#0e5f59;border-radius:16px;padding:16px 20px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between}
.ban h1{margin:0;font-size:1.35rem}.ban small{color:#bfe9e5;display:block}.chip{background:#134e4a;color:#bfe9e5;border-radius:99px;padding:4px 12px;font-size:.78rem;font-weight:700}
.k{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin:10px 0}.c{background:#1a1a19;border:1px solid #3a3a38;border-radius:16px;padding:14px 16px}
.c .t{color:#c3c2b7;font-size:.82rem}.c .n{font-size:1.9rem;font-weight:800;margin:2px 0}.c .s{color:#8d8c84;font-size:.74rem}
.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:10px}.c h2{margin:0 0 2px;font-size:1rem}.c .u{color:#8d8c84;font-size:.78rem;margin-bottom:8px}
.l{display:flex;gap:12px;flex-wrap:wrap;font-size:.78rem;color:#c3c2b7;margin-top:6px}.l i{display:inline-block;width:11px;height:11px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.empty{color:#8d8c84;padding:20px 0;text-align:center}svg{max-width:100%;height:auto}.f{color:#8d8c84;font-size:.74rem;margin:12px 2px}
"""


def e(x: object) -> str:
    return html.escape(str(x))


def bars(rows: list[tuple[str, int]], colors: list[str] | str, label_w: int = 96) -> str:
    if not rows:
        return '<div class="empty">Noch keine Daten</div>'
    mx = max(v for _, v in rows) or 1
    h = 30 * len(rows)
    tot = sum(v for _, v in rows) or 1
    s = [f'<svg viewBox="0 0 460 {h}" role="img" aria-label="Balkendiagramm">']
    for n, (name, v) in enumerate(rows):
        col = colors if isinstance(colors, str) else colors[min(n, len(colors) - 1)]
        w = max(3, 250 * v / mx)
        y = n * 30
        s.append(f'<text x="0" y="{y + 19}" fill="#c3c2b7" font-size="12">{e(name)}</text>'
                 f'<rect x="{label_w}" y="{y + 5}" width="{w:.1f}" height="18" rx="4" fill="{col}"/>'
                 f'<text x="{label_w + w + 8:.1f}" y="{y + 19}" fill="#f0efec" font-size="12">{v} · {round(100 * v / tot)} %</text>')
    return "".join(s) + "</svg>"


def mod_bars(rows: list[tuple[str, int]], base: int) -> str:
    if not rows or not base:
        return '<div class="empty">Noch keine Modul-Angaben</div>'
    rows = rows[:16]
    h = 26 * len(rows)
    s = [f'<svg viewBox="0 0 460 {h}" role="img" aria-label="Modul-Nutzung">']
    for n, (name, v) in enumerate(rows):
        w = max(3, 240 * v / base)
        y = n * 26
        s.append(f'<text x="0" y="{y + 17}" fill="#c3c2b7" font-size="12">{e(name)}</text>'
                 f'<rect x="120" y="{y + 4}" width="{w:.1f}" height="16" rx="4" fill="#3987e5"/>'
                 f'<text x="{120 + w + 8:.1f}" y="{y + 17}" fill="#f0efec" font-size="12">{round(100 * v / base)} %</text>')
    return "".join(s) + "</svg>"


def columns(weeks: list[dict], vers: list[str]) -> str:
    tot = [sum(w["counts"].values()) + w["other"] for w in weeks]
    if not any(tot):
        return '<div class="empty">Noch keine Daten</div>'
    mx = max(tot) or 1
    s = ['<svg viewBox="0 0 460 190" role="img" aria-label="Versionen pro Woche">']
    bw = 38
    for n, w in enumerate(weeks):
        x = 6 + n * 56
        y = 158
        stack = [(vers[k], w["counts"].get(vers[k], 0), VCOL[k]) for k in range(len(vers) - 1, -1, -1)] + [("Andere", w["other"], "#5b5a55")]
        for _name, v, col in stack:
            if not v:
                continue
            h = 140 * v / mx
            y -= h
            s.append(f'<rect x="{x}" y="{y:.1f}" width="{bw}" height="{max(h - 1.5, 1):.1f}" rx="3" fill="{col}"/>')
        s.append(f'<text x="{x + bw / 2}" y="176" fill="#8d8c84" font-size="10" text-anchor="middle">{e(w["label"])}</text>')
        if tot[n]:
            s.append(f'<text x="{x + bw / 2}" y="{y - 4:.1f}" fill="#c3c2b7" font-size="10" text-anchor="middle">{tot[n]}</text>')
    return "".join(s) + "</svg>"


def curves_svg(curves: list[dict]) -> str:
    if not curves:
        return '<div class="empty">Sobald eine neue Version zwei Tage alt ist, erscheint hier das Update-Tempo.</div>'
    cols = ["#3987e5", "#d95926"]
    s = ['<svg viewBox="0 0 460 190" role="img" aria-label="Update-Tempo">']
    for p in (0, 50, 100):
        y = 160 - 140 * p / 100
        s.append(f'<line x1="40" x2="400" y1="{y}" y2="{y}" stroke="#3a3a38" stroke-width="1"/><text x="34" y="{y + 4}" fill="#8d8c84" font-size="10" text-anchor="end">{p} %</text>')
    for n, c in enumerate(curves):
        pts = " ".join(f"{40 + 360 * d / 14:.1f},{160 - 140 * v / 100:.1f}" for d, v in enumerate(c["pts"]))
        s.append(f'<polyline points="{pts}" fill="none" stroke="{cols[n]}" stroke-width="2.5"/>')
        d = len(c["pts"]) - 1
        s.append(f'<text x="{min(40 + 360 * d / 14 + 6, 404):.1f}" y="{160 - 140 * c["pts"][-1] / 100 + 4:.1f}" fill="#c3c2b7" font-size="11">{e(c["v"])}</text>')
    for d in (0, 3, 7, 10, 14):
        s.append(f'<text x="{40 + 360 * d / 14}" y="178" fill="#8d8c84" font-size="10" text-anchor="middle">{d}</text>')
    return "".join(s) + "</svg>"


def render(db: DB, today: date | None = None) -> str:
    r = compute(db, today)
    ch = r["channels"]
    cht = (ch["stable"] + ch["beta"]) or 1
    kan = (f'<svg viewBox="0 0 460 40"><rect x="0" y="6" width="{440 * ch["stable"] / cht:.1f}" height="26" rx="5" fill="#3987e5"/>'
           f'<rect x="{440 * ch["stable"] / cht + 2:.1f}" y="6" width="{max(440 * ch["beta"] / cht - 2, 0):.1f}" height="26" rx="5" fill="#d95926"/>'
           f'<text x="10" y="24" fill="#fff" font-size="12" font-weight="700">Stabil {round(100 * ch["stable"] / cht)} %</text>'
           f'<text x="{440 * ch["stable"] / cht + 10:.1f}" y="24" fill="#fff" font-size="12" font-weight="700">{"Beta " + str(round(100 * ch["beta"] / cht)) + " %" if ch["beta"] else ""}</text></svg>') if (ch["stable"] + ch["beta"]) else '<div class="empty">Noch keine Daten</div>'
    legend = "".join(f'<span><i style="background:{VCOL[k]}"></i>{e(v)}</span>' for k, v in enumerate(r["week_versions"]))
    t50 = f'{r["t50"]} Tage' if r["t50"] is not None else "–"
    return f"""<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Strom &amp; Wärme · Statistik</title><style>{CSS}</style></head><body><div class="w">
<div class="ban"><div><h1>Strom &amp; Wärme · Statistik</h1><small>Welche Version ist im Einsatz? · anonym · Version und Module</small></div><span class="chip">nur lokal · Stand {e(r["today"])}</span></div>
<div class="k"><div class="c"><div class="t">Aktive Installationen</div><div class="n">{r["a30"]}</div><div class="s">30 Tage · {r["a7"]} in den letzten 7 Tagen</div></div>
<div class="c"><div class="t">Neu diese Woche</div><div class="n">+{r["new7"]}</div><div class="s">{r["inactive"]} Installationen seit &gt;14 Tagen inaktiv</div></div>
<div class="c"><div class="t">Auf neuester Version</div><div class="n">{r["newest_share"]} %</div><div class="s">{e(r["newest"] or "–")}</div></div>
<div class="c"><div class="t">Update-Tempo</div><div class="n">{e(t50)}</div><div class="s">bis 50 % einer neuen Version nutzen</div></div></div>
<div class="g"><div class="c"><h2>Versionen aktuell</h2><div class="u">{r["a30"]} aktive Installationen (30 Tage)</div>{bars(r["versions"][:8], VCOL + ["#1c5cab"])}</div>
<div class="c"><h2>Verlauf: Versionen pro Woche</h2><div class="u">Neueste Version je Installation und Woche</div>{columns(r["weeks"], r["week_versions"])}<div class="l">{legend}</div></div>
<div class="c"><h2>Kanal &amp; Aktivität</h2><div class="u">Kanal (30 Tage)</div>{kan}<div class="u" style="margin-top:10px">Zuletzt gesehen</div>{bars(r["seen"], "#3987e5", 78)}</div>
<div class="c"><h2>Update-Tempo</h2><div class="u">Anteil auf neuer Version nach x Tagen</div>{curves_svg(r["curves"])}</div>
<div class="c"><h2>Modul-Nutzung</h2><div class="u">Installationen mit Modul an · Basis {r["mod_base"]} (30 Tage)</div>{mod_bars(r["modules"], r["mod_base"])}</div></div>
<div class="f">Nur Teilnehmende zählen: Die Zahlen sind Untergrenzen und zeigen Trends, keine absolute Nutzerzahl. Kennungen ohne Meldung seit {e(cfg("RETENTION_DAYS", "180"))} Tagen werden gelöscht.</div></div></body></html>"""


# ------------------------------------------------------------------ Passwort
def hash_password(pw: str, iters: int = 200_000) -> str:
    salt = secrets.token_hex(16)
    h = hashlib.pbkdf2_hmac("sha256", pw.encode(), bytes.fromhex(salt), iters).hex()
    return f"pbkdf2_sha256${iters}${salt}${h}"


def check_password(pw: str, stored: str) -> bool:
    try:
        algo, iters, salt, h = stored.split("$")
        if algo != "pbkdf2_sha256":
            return False
        calc = hashlib.pbkdf2_hmac("sha256", pw.encode(), bytes.fromhex(salt), int(iters)).hex()
        return hmac.compare_digest(calc, h)
    except (ValueError, TypeError):
        return False


# ------------------------------------------------------------------ Begrenzung (nur im Arbeitsspeicher)
class Limiter:
    def __init__(self) -> None:
        self.hits: dict[str, list[float]] = defaultdict(list)
        self.lock = threading.Lock()

    def allow(self, key: str, limit: int, window: float, now: float | None = None) -> bool:
        now = now or time.time()
        with self.lock:
            h = [t for t in self.hits[key] if now - t < window]
            ok = len(h) < limit
            if ok:
                h.append(now)
            self.hits[key] = h
            if len(self.hits) > 5000:
                for k in [k for k, v in self.hits.items() if not v or now - v[-1] > window]:
                    del self.hits[k]
            return ok

    def count(self, key: str, window: float, now: float | None = None) -> int:
        now = now or time.time()
        with self.lock:
            return sum(1 for t in self.hits.get(key, []) if now - t < window)

    def add(self, key: str, now: float | None = None) -> None:
        with self.lock:
            self.hits[key].append(now or time.time())


# ------------------------------------------------------------------ HTTP
def make_ingest(db: DB) -> type[BaseHTTPRequestHandler]:
    lim = Limiter()

    class H(BaseHTTPRequestHandler):
        server_version = "stats"
        sys_version = ""

        def log_message(self, *a):  # keine Protokolle: keine IP-Adressen auf der Platte
            pass

        def _send(self, code: int, body: dict | None = None) -> None:
            raw = json.dumps(body or {"ok": code < 300}).encode()
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(raw)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(raw)

        def _src(self) -> str:
            return self.headers.get("CF-Connecting-IP") or self.headers.get("X-Forwarded-For", "").split(",")[0].strip() or self.client_address[0]

        def do_GET(self):
            if self.path == "/health":
                self._send(200)
            else:
                self._send(404, {"ok": False})

        def do_POST(self):
            if self.path not in ("/v1/ping", "/v1/forget"):
                self._send(404, {"ok": False})
                return
            if not lim.allow(self._src(), IP_LIMIT, 60):
                self._send(429, {"ok": False, "error": "too_many"})
                return
            try:
                n = int(self.headers.get("Content-Length", ""))
            except ValueError:
                self._send(411, {"ok": False})
                return
            if n <= 0 or n > MAX_BODY:
                self._send(413, {"ok": False})
                return
            try:
                d = json.loads(self.rfile.read(n))
            except ValueError:
                self._send(400, {"ok": False})
                return
            if self.path == "/v1/forget":
                i = d.get("id") if isinstance(d, dict) else None
                if isinstance(i, str) and ID_RE.match(i):
                    db.forget(i)
                    self._send(200)
                else:
                    self._send(400, {"ok": False})
                return
            p = valid_ping(d)
            if p is None:
                self._send(400, {"ok": False})
                return
            res = db.ping(p)
            self._send(200 if res == "ok" else 429, {"ok": res == "ok"} if res == "ok" else {"ok": False, "error": res})

    return H


def make_dash(db: DB, user: str, pw_hash: str) -> type[BaseHTTPRequestHandler]:
    lim = Limiter()

    class H(BaseHTTPRequestHandler):
        server_version = "stats"
        sys_version = ""

        def log_message(self, *a):
            pass

        def _send(self, code: int, body: bytes, ctype: str = "text/html; charset=utf-8", extra: dict | None = None) -> None:
            self.send_response(code)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; img-src data:")
            self.send_header("Referrer-Policy", "no-referrer")
            for k, v in (extra or {}).items():
                self.send_header(k, v)
            self.end_headers()
            self.wfile.write(body)

        def _auth(self) -> bool:
            ip = self.client_address[0]
            if lim.count(ip, LOGIN_LOCK) >= LOGIN_FAILS:
                self._send(429, "Zu viele Versuche. Bitte später erneut.".encode(), "text/plain; charset=utf-8")
                return False
            h = self.headers.get("Authorization", "")
            ok = False
            if h.startswith("Basic "):
                try:
                    u, _, p = base64.b64decode(h[6:]).decode().partition(":")
                    ok = hmac.compare_digest(u, user) and check_password(p, pw_hash)
                except (ValueError, UnicodeDecodeError):
                    ok = False
            if not ok:
                if h:
                    lim.add(ip)
                self._send(401, b"Anmeldung noetig", "text/plain; charset=utf-8", {"WWW-Authenticate": 'Basic realm="Statistik", charset="UTF-8"'})
            return ok

        def do_GET(self):
            if self.path == "/health":
                self._send(200, b"ok", "text/plain")
                return
            if not self._auth():
                return
            if self.path in ("/", "/index.html"):
                self._send(200, render(db).encode())
            else:
                self._send(404, b"nicht gefunden", "text/plain; charset=utf-8")

    return H


def serve(host: str, port: int, handler: type[BaseHTTPRequestHandler], cert: str = "", key: str = "") -> ThreadingHTTPServer:
    srv = ThreadingHTTPServer((host, port), handler)
    srv.daemon_threads = True
    if cert and key:
        ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        ctx.load_cert_chain(cert, key)
        srv.socket = ctx.wrap_socket(srv.socket, server_side=True)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def main() -> int:
    if len(sys.argv) > 1 and sys.argv[1] == "hash":
        a, b = getpass.getpass("Passwort: "), getpass.getpass("Wiederholen: ")
        if a != b or len(a) < 10:
            print("Die Passwörter sind verschieden oder kürzer als 10 Zeichen.", file=sys.stderr)
            return 1
        print("DASH_PASS_HASH=" + hash_password(a))
        return 0
    user, ph = cfg("DASH_USER", "admin"), cfg("DASH_PASS_HASH")
    if not ph:
        print("DASH_PASS_HASH fehlt. Erzeugen mit: python3 server.py hash", file=sys.stderr)
        return 1
    db = DB(cfg("STATS_DB", "/var/lib/stats/stats.db"))
    keep = int(cfg("RETENTION_DAYS", "180"))
    db.cleanup(keep)
    serve(cfg("INGEST_HOST", "127.0.0.1"), int(cfg("INGEST_PORT", "8081")), make_ingest(db))
    serve(cfg("DASH_HOST", "127.0.0.1"), int(cfg("DASH_PORT", "8443")), make_dash(db, user, ph), cfg("TLS_CERT"), cfg("TLS_KEY"))
    print(f"Eingang {cfg('INGEST_HOST', '127.0.0.1')}:{cfg('INGEST_PORT', '8081')} · Dashboard {cfg('DASH_HOST', '127.0.0.1')}:{cfg('DASH_PORT', '8443')}", flush=True)
    while True:
        time.sleep(6 * 3600)
        db.cleanup(keep)


if __name__ == "__main__":
    sys.exit(main())
