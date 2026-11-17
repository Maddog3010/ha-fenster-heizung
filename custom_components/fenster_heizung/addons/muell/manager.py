"""Modul 17: Müllabfuhr (Addon) – Termine aus Kalendern (z. B. waste_collection_schedule), Ampel, Erinnerung, Ansage, Licht, Statistik.

Früher das Lab „Müllabfuhr“ (id mm) im Kern, seit Phase 3 ein Addon. Der Speicher heißt weiter fenster_heizung_muell,
damit alle Einstellungen und Termine erhalten bleiben. Die reinen Rechenfunktionen stehen oben, der Manager unten.

v0.2 (Fundament): Liste „Nicht erkannt“, „Später erinnern“ übersteht einen Neustart, Termine werden zwischengespeichert,
Abholzeit je Abfallart, Baustein fürs Morgen-Briefing, Tests (tests/test_muell.py).
v0.3 (Freie Abfallarten): bis zu 10 Abfallarten mit Name, Farbe, Bild und Erkennungswörtern, Vorlagen, bis zu drei
Kalender, Sondertermine mit früherer Vorwarnung. Die vier bisherigen Tonnen werden einmalig übernommen (Schema 2).
"""
from __future__ import annotations

import logging
import re
import time
from collections import Counter
from datetime import date, timedelta
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.util import dt as dt_util

from custom_components.fenster_heizung.backup import SafeStore
from custom_components.fenster_heizung.const import DOMAIN
from custom_components.fenster_heizung.diag import diag_log

_LOGGER = logging.getLogger(__name__)

SCHEMA = 2
TICK_SECONDS = 60
REFRESH_S = 1800          # Termine höchstens alle 30 Minuten neu abrufen
SENT_KEEP = 60
CATCHUP_MIN = 120         # nach einem Neustart wird die Erinnerung noch bis 2 Stunden nach der Uhrzeit nachgeholt
MAX_KINDS = 10
MAX_CALS = 3
MAX_IGNORE = 40
SNOOZE_STEPS = (30, 60, 90, 120, 180)
MOTION = ("aus", "dezent", "voll")
IMGS = ("tonne", "sack", "glas", "gruen", "sperr", "schad", "baum")
COLORS = ("#78716c", "#a8531a", "#3b82f6", "#eab308", "#16a34a", "#65a30d", "#a855f7", "#ef4444", "#0ea5e9", "#ec4899")

# Vorlagen für Abfallarten. Die ersten vier sind die bisherigen festen Tonnen (gleiche ids, gleiche Wörter).
TEMPLATES: dict[str, dict[str, Any]] = {
    "rest": {"name": "Restmüll", "color": "#78716c", "img": "tonne", "match": "rest,hausmüll,hausmuell,schwarz", "pre": 1},
    "bio": {"name": "Bio", "color": "#a8531a", "img": "tonne", "match": "bio", "pre": 1},
    "papier": {"name": "Papier", "color": "#3b82f6", "img": "tonne", "match": "papier,pappe,blau", "pre": 1},
    "gelb": {"name": "Gelber Sack", "color": "#eab308", "img": "sack", "match": "gelb,wertstoff,verpackung,lvp", "pre": 1},
    "glas": {"name": "Glas", "color": "#16a34a", "img": "glas", "match": "glas,altglas", "pre": 1},
    "gruen": {"name": "Grünschnitt", "color": "#65a30d", "img": "gruen", "match": "grünschnitt,gruenschnitt,grüngut,gruengut,strauchschnitt,gartenabfall", "pre": 2},
    "sperr": {"name": "Sperrmüll", "color": "#a855f7", "img": "sperr", "match": "sperr", "pre": 3},
    "schad": {"name": "Schadstoffmobil", "color": "#ef4444", "img": "schad", "match": "schadstoff,problemabfall,sondermüll,sondermuell", "pre": 3},
    "baum": {"name": "Weihnachtsbaum", "color": "#15803d", "img": "baum", "match": "weihnachtsbaum,tannenbaum,christbaum", "pre": 3},
}
BASE = ("rest", "bio", "papier", "gelb")
WD = ("Mo", "Di", "Mi", "Do", "Fr", "Sa", "So")
_ENT = re.compile(r"^[a-z_]+\.[a-z0-9_]+$")
_HM = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")
_ID = re.compile(r"^[a-z0-9_]{1,12}$")
_COL = re.compile(r"^#[0-9a-fA-F]{6}$")

# Für alten Code (Tags im Kern, Tests): die vier Grundtonnen mit Name und Farbe
BINS: dict[str, tuple[str, str]] = {k: (TEMPLATES[k]["name"], TEMPLATES[k]["color"]) for k in BASE}


def kind_from_tpl(tid: str, kid: str | None = None) -> dict[str, Any]:
    t = TEMPLATES.get(tid) or {"name": "Eigene Abfallart", "color": "#0ea5e9", "img": "tonne", "match": "", "pre": 1}
    return {"id": kid or tid, "name": t["name"], "color": t["color"], "img": t["img"], "match": t["match"], "on": True, "until": "12:00", "pre": t["pre"], "tpl": tid if tid in TEMPLATES else ""}


def default_cfg() -> dict[str, Any]:
    return {
        "v": SCHEMA, "cals": [], "cal": "", "time": "18:30", "kinds": [kind_from_tpl(k) for k in BASE], "ignore": [], "snooze": 60,
        "push": {"on": False, "to": []}, "cost": {"on": False, "fee": 0.0, "incl": 0}, "wx": True,
        "tts": {"on": False, "ent": "", "player": "", "text": "Morgen wird {tonnen} abgeholt."}, "light": {"on": False, "ent": ""},
        "look": {"old": False, "motion": "dezent"},
    }


def _ent(v: Any, domains: tuple[str, ...]) -> str:
    return v if isinstance(v, str) and _ENT.match(v) and v.split(".")[0] in domains else ""


def _num(v: Any, lo: float, hi: float, d: float) -> float:
    try:
        x = float(v)
    except (TypeError, ValueError):
        return d
    return min(hi, max(lo, x)) if x == x else d


def _words(v: Any, fallback: str = "") -> str:
    out: list[str] = []
    for w in str(v if v is not None else fallback).split(","):
        w = w.strip().lower()[:60]
        if w and w not in out:
            out.append(w)
    return ",".join(out)[:300]


def migrate_bins(bins: dict[str, Any]) -> list[dict[str, Any]]:
    """Schema 1 (feste Tonnen als dict) → Liste von Abfallarten. Wörter und Ein/Aus bleiben, Reihenfolge wie bisher."""
    out = []
    for k in BASE:
        x = bins.get(k) if isinstance(bins.get(k), dict) else {}
        kd = kind_from_tpl(k)
        kd["on"] = bool(x.get("on", True))
        kd["match"] = _words(x.get("match"), TEMPLATES[k]["match"]) or TEMPLATES[k]["match"]
        out.append(kd)
    return out


def clean_kind(x: Any, used: set[str]) -> dict[str, Any] | None:
    if not isinstance(x, dict):
        return None
    kid = str(x.get("id") or "").lower()
    if not _ID.match(kid) or kid in used:
        return None
    tpl = str(x.get("tpl") or "")
    base = kind_from_tpl(tpl if tpl in TEMPLATES else "", kid)
    name = str(x.get("name") or "").strip()[:30] or base["name"]
    return {
        "id": kid, "name": name,
        "color": x["color"] if isinstance(x.get("color"), str) and _COL.match(x["color"]) else base["color"],
        "img": x["img"] if x.get("img") in IMGS else base["img"],
        "match": _words(x.get("match"), base["match"]),
        "on": bool(x.get("on", True)),
        "until": x["until"] if isinstance(x.get("until"), str) and _HM.match(x["until"]) else "12:00",
        "pre": int(_num(x.get("pre"), 1, 7, base["pre"])),
        "tpl": tpl if tpl in TEMPLATES else "",
    }


def clean_cfg(raw: Any) -> dict[str, Any]:
    d = default_cfg()
    r = raw if isinstance(raw, dict) else {}
    # Kalender: neu bis zu drei, früher einer („cal“)
    cals: list[str] = []
    src = r.get("cals") if isinstance(r.get("cals"), list) else ([r.get("cal")] if r.get("cal") else [])
    for c in src:
        c = _ent(c, ("calendar",))
        if c and c not in cals and len(cals) < MAX_CALS:
            cals.append(c)
    d["cals"], d["cal"] = cals, (cals[0] if cals else "")
    d["time"] = r["time"] if isinstance(r.get("time"), str) and _HM.match(r["time"]) else d["time"]
    # Abfallarten: neu als Liste, früher feste Tonnen („bins“)
    if isinstance(r.get("kinds"), list):
        kinds: list[dict[str, Any]] = []
        used: set[str] = set()
        for x in r["kinds"]:
            k = clean_kind(x, used)
            if k and len(kinds) < MAX_KINDS:
                kinds.append(k)
                used.add(k["id"])
        d["kinds"] = kinds or d["kinds"]
    elif isinstance(r.get("bins"), dict):
        d["kinds"] = migrate_bins(r["bins"])
    ign: list[str] = []
    for s in r.get("ignore") if isinstance(r.get("ignore"), list) else []:
        s = str(s).strip()[:80]
        if s and s.lower() not in [i.lower() for i in ign] and len(ign) < MAX_IGNORE:
            ign.append(s)
    d["ignore"] = ign
    sn = int(_num(r.get("snooze"), 30, 180, 60))
    d["snooze"] = min(SNOOZE_STEPS, key=lambda s: abs(s - sn))
    p = r.get("push") if isinstance(r.get("push"), dict) else {}
    to: list[str] = []
    for s in p.get("to") if isinstance(p.get("to"), list) else []:
        s = _ent(s, ("notify",))
        if s and s not in to and len(to) < 10:
            to.append(s)
    d["push"] = {"on": bool(p.get("on", False)), "to": to}
    c = r.get("cost") if isinstance(r.get("cost"), dict) else {}
    d["cost"] = {"on": bool(c.get("on", False)), "fee": round(_num(c.get("fee"), 0, 999, 0), 2), "incl": int(_num(c.get("incl"), 0, 99, 0))}
    d["wx"] = bool(r.get("wx", True))
    t = r.get("tts") if isinstance(r.get("tts"), dict) else {}
    txt = str(t.get("text") or d["tts"]["text"]).strip()[:120]
    d["tts"] = {"on": bool(t.get("on", False)), "ent": _ent(t.get("ent"), ("tts",)), "player": _ent(t.get("player"), ("media_player",)), "text": txt or d["tts"]["text"]}
    li = r.get("light") if isinstance(r.get("light"), dict) else {}
    d["light"] = {"on": bool(li.get("on", False)), "ent": _ent(li.get("ent"), ("light",))}
    lk = r.get("look") if isinstance(r.get("look"), dict) else {}
    d["look"] = {"old": bool(lk.get("old", False)), "motion": lk["motion"] if lk.get("motion") in MOTION else "dezent"}
    return d


# --------------------------------------------------------------------------- reine Rechnung
def kmap(kinds: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    return {k["id"]: k for k in kinds}


def classify(summary: str, kinds: list[dict[str, Any]]) -> str | None:
    """Welche Abfallart meint dieser Kalendertitel? Das längste passende Wort gewinnt („Weihnachtsbaum“ vor „baum“),
    bei Gleichstand zählt der Restmüll zuletzt und sonst die Reihenfolge der Liste. Nur eingeschaltete Arten."""
    s = (summary or "").lower()
    best: tuple[int, int, int] | None = None
    hit = None
    for i, k in enumerate(kinds):
        if not k.get("on", True):
            continue
        ln = max((len(w) for w in str(k.get("match", "")).split(",") if w and w in s), default=0)
        if not ln:
            continue
        key = (ln, 0 if k["id"] == "rest" else 1, -i)
        if best is None or key > best:
            best, hit = key, k["id"]
    return hit


def parse_events(raw: list[Any], kinds: list[dict[str, Any]], ignore: list[str] | None = None) -> tuple[list[tuple[str, str]], dict[str, dict[str, Any]]]:
    """Kalendereinträge → sortierte, eindeutige Liste (Datum, Abfallart) und Titel, die zu keiner Art passen."""
    out: set[tuple[str, str]] = set()
    unknown: dict[str, dict[str, Any]] = {}
    ign = {i.lower() for i in ignore or []}
    for e in raw or []:
        if not isinstance(e, dict):
            continue
        title = str(e.get("summary") or e.get("message") or "").strip()
        day = str(e.get("start") or "")[:10]
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", day):
            continue
        k = classify(title, kinds)
        if k:
            out.add((day, k))
        elif title and title.lower() not in ign:
            u = unknown.setdefault(title[:80], {"t": title[:80], "n": 0, "first": day, "last": day, "ds": []})
            u["n"] += 1
            u["first"], u["last"] = min(u["first"], day), max(u["last"], day)
            if day not in u["ds"] and len(u["ds"]) < 60:
                u["ds"].append(day)
    return sorted(out), unknown


def unknown_list(unknown: dict[str, dict[str, Any]], today: date) -> list[dict[str, Any]]:
    t = today.isoformat()
    rows = []
    for u in unknown.values():
        nxt = min((d for d in u.get("ds") or [u["last"]] if d >= t), default=None)
        rows.append({"t": u["t"], "n": u["n"], "first": u["first"], "last": u["last"], "next": nxt, "upcoming": nxt is not None})
    rows.sort(key=lambda r: (not r["upcoming"], r["next"] or "", r["t"].lower()))
    return rows[:20]


def _tm(s: str) -> int:
    h, m = str(s).split(":")
    return int(h) * 60 + int(m)


def until_min(kind: dict[str, Any] | None) -> int:
    try:
        return _tm((kind or {}).get("until") or "12:00")
    except (ValueError, AttributeError):
        return 12 * 60


def next_for(events: list[tuple[str, str]], k: str, today: date, minute: int, until: int = 12 * 60) -> str | None:
    """Nächste Abholung einer Art. Die des heutigen Tages zählt bis zur Abholzeit dieser Art."""
    t = today.isoformat()
    for d, b in events:
        if b == k and (d > t or (d == t and minute < until)):
            return d
    return None


def bin_state(nxt: str | None, today: date, minute: int, evening: int, done: str | None) -> str:
    if not nxt:
        return "none"
    if done == nxt:
        return "done"
    days = (date.fromisoformat(nxt) - today).days
    if days == 0:
        return "today"
    if days == 1:
        return "out" if minute >= evening else "soon"
    return "ok"


def month_days(events: list[tuple[str, str]], year: int, month: int) -> dict[str, list[str]]:
    pre = f"{year:04d}-{month:02d}-"
    out: dict[str, list[str]] = {}
    for d, b in events:
        if d.startswith(pre):
            out.setdefault(str(int(d[8:])), []).append(b)
    return out


def stats(events: list[tuple[str, str]], today: date, incl: int, fee: float) -> dict[str, Any]:
    pre = f"{today.year:04d}-"
    rest = [d for d, b in events if b == "rest" and d.startswith(pre)]
    done = sum(1 for d in rest if d <= today.isoformat())
    return {"year": today.year, "total": len(rest), "done": done, "incl": incl, "free": max(0, incl - done) if incl else None,
            "extra": max(0, done - incl) if incl else None, "cost": round(max(0, done - incl) * fee, 2) if incl and fee else None}


def _dm(d: date) -> str:
    return f"{WD[d.weekday()]}, {d.day}.{d.month}."


def shift_notes(events: list[tuple[str, str]], today: date, kinds: list[dict[str, Any]]) -> list[dict[str, str]]:
    """Abholung weicht vom üblichen Wochentag ab (zum Beispiel nach einem Feiertag). Nur regelmäßige Arten (ab 4 Terminen)."""
    out: list[dict[str, str]] = []
    horizon = (today + timedelta(days=90)).isoformat()
    for kd in kinds:
        k = kd["id"]
        ds = [d for d, b in events if b == k and today.isoformat() <= d <= horizon]
        if len(ds) < 4:
            continue
        usual = Counter(date.fromisoformat(d).weekday() for d in ds).most_common(1)[0][0]
        near = next((d for d in ds if (date.fromisoformat(d) - today).days <= 14), None)
        if near and date.fromisoformat(near).weekday() != usual:
            nd = date.fromisoformat(near)
            out.append({"k": "shift", "bin": k, "d": near, "text": f"{kd['name']} kommt am {WD[nd.weekday()]}, {nd.day}.{nd.month}. statt am {WD[usual]} (verschoben)."})
    return out


def early_due(events: list[tuple[str, str]], kinds: list[dict[str, Any]], today: date, done: dict[str, str]) -> list[tuple[str, str, int]]:
    """Sondertermine mit Vorwarnung von mehr als einem Tag: (Art, Datum, Tage), die heute angekündigt werden."""
    km = kmap(kinds)
    out = []
    for d, b in events:
        kd = km.get(b)
        if not kd or not kd["on"] or kd["pre"] <= 1 or done.get(b) == d:
            continue
        days = (date.fromisoformat(d) - today).days
        if days == kd["pre"]:
            out.append((b, d, days))
    return out


def upcoming_special(events: list[tuple[str, str]], kinds: list[dict[str, Any]], today: date) -> list[dict[str, Any]]:
    """Sondertermine, die schon in der Vorwarnzeit liegen (für Hinweise und Briefing), ohne morgen und heute."""
    km = kmap(kinds)
    out = []
    for d, b in events:
        kd = km.get(b)
        if not kd or not kd["on"] or kd["pre"] <= 1:
            continue
        days = (date.fromisoformat(d) - today).days
        if 2 <= days <= kd["pre"]:
            out.append({"k": b, "d": d, "days": days, "name": kd["name"]})
    return out


def names_text(keys: list[str], kinds: list[dict[str, Any]] | None = None) -> str:
    km = kmap(kinds or [kind_from_tpl(k) for k in BASE])
    n = [km[k]["name"] if k in km else k for k in keys]
    if not n:
        return ""
    return n[0] if len(n) == 1 else ", ".join(n[:-1]) + " und " + n[-1]


def ev_sig(cfg: dict[str, Any]) -> str:
    """Kennung für den Zwischenspeicher: ändern sich Kalender oder Erkennung, zählt der Speicher nicht mehr."""
    return "|".join(cfg["cals"]) + "#" + ";".join(f"{k['id']}:{int(k['on'])}:{k['match']}" for k in cfg["kinds"]) + "#" + ";".join(sorted(i.lower() for i in cfg["ignore"]))


# --------------------------------------------------------------------------- Manager
class MuellManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_muell")
        self.cfg = default_cfg()
        self.cfg_v1: dict[str, Any] | None = None
        self.done: dict[str, str] = {}
        self.sent: list[str] = []
        self.light_on = False
        self.snooze_until = 0.0
        self.ev: list[tuple[str, str]] = []
        self.unknown: dict[str, dict[str, Any]] = {}
        self.ev_ts = 0.0          # letzter Abrufversuch
        self.ev_ok = 0.0          # letzter erfolgreicher Abruf (auch aus dem Zwischenspeicher)
        self.ev_cached = False    # Termine kommen gerade aus dem Zwischenspeicher
        self.ev_sig = ""
        self.cal_err: list[str] = []
        self.error = ""
        self.migrated = False
        self._busy = False
        self._unsub: CALLBACK_TYPE | None = None

    async def async_start(self) -> None:
        d = await self._store.async_load()
        if isinstance(d, dict):
            raw = d.get("cfg")
            if isinstance(raw, dict) and int(raw.get("v") or 1) < SCHEMA:
                self.cfg_v1 = raw          # bleibt im Speicher, falls man zurück will
                self.migrated = True
            elif isinstance(d.get("cfg_v1"), dict):
                self.cfg_v1 = d["cfg_v1"]
            self.cfg = clean_cfg(raw)
            ids = {k["id"] for k in self.cfg["kinds"]}
            self.done = {k: str(v) for k, v in (d.get("done") or {}).items() if k in ids}
            self.sent = [str(x) for x in d.get("sent") or []][-SENT_KEEP:]
            self.light_on = bool(d.get("light_on"))
            su = _num(d.get("snooze_until"), 0, 4e10, 0)
            self.snooze_until = su if su > time.time() - 6 * 3600 else 0.0
            c = d.get("cache") if isinstance(d.get("cache"), dict) else {}
            if c.get("sig") == ev_sig(self.cfg) and isinstance(c.get("ev"), list):
                self.ev = [(str(a), str(b)) for a, b in (x for x in c["ev"] if isinstance(x, (list, tuple)) and len(x) == 2)]
                self.unknown = {str(k): v for k, v in (c.get("unknown") or {}).items() if isinstance(v, dict)}
                self.ev_ok = _num(c.get("ts"), 0, 4e10, 0)
                self.ev_cached = True
                self.ev_sig = c["sig"]
        if self.migrated:
            diag_log(self.hass, "info", "Müllabfuhr: Tonnen in die neue Liste der Abfallarten übernommen", room="Müllabfuhr")
            self._save()
        self._unsub = async_track_time_interval(self.hass, self._tick, timedelta(seconds=TICK_SECONDS))

    def async_stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None

    def _data(self) -> dict[str, Any]:
        out = {"cfg": self.cfg, "done": self.done, "sent": self.sent[-SENT_KEEP:], "light_on": self.light_on, "snooze_until": self.snooze_until,
               "cache": {"sig": self.ev_sig, "ts": self.ev_ok, "ev": [list(x) for x in self.ev], "unknown": self.unknown}}
        if self.cfg_v1 is not None:
            out["cfg_v1"] = self.cfg_v1
        return out

    def _save(self) -> None:
        self._store.async_delay_save(self._data, 5)

    async def async_set(self, raw: Any) -> dict[str, Any]:
        old_sig = ev_sig(self.cfg)
        self.cfg = clean_cfg({**self.cfg, **raw} if isinstance(raw, dict) else raw)  # fehlende Felder (alter Browser) behalten ihren Stand
        ids = {k["id"] for k in self.cfg["kinds"]}
        self.done = {k: v for k, v in self.done.items() if k in ids}
        if ev_sig(self.cfg) != old_sig:
            self.ev_ts = 0.0       # sofort neu abrufen (B5)
            await self.refresh(force=True)
        self._save()
        return await self.snapshot()

    def active(self) -> bool:
        return True  # als Addon aktiv, solange es installiert und nicht pausiert ist

    def kinds(self) -> list[dict[str, Any]]:
        return self.cfg["kinds"]

    def kind(self, k: str) -> dict[str, Any] | None:
        return kmap(self.cfg["kinds"]).get(k)

    def bin_names(self) -> dict[str, str]:
        """Für Tags & Karten im Kern: alle eingeschalteten Abfallarten mit Namen."""
        return {k["id"]: k["name"] for k in self.cfg["kinds"] if k["on"]}

    def auto_cals(self) -> list[str]:
        try:
            reg = er.async_get(self.hass)
            return sorted(e.entity_id for e in reg.entities.values() if e.platform == "waste_collection_schedule" and e.domain == "calendar" and not e.disabled)[:MAX_CALS]
        except Exception:  # noqa: BLE001
            return []

    def cal_entities(self) -> list[str]:
        return self.cfg["cals"] or self.auto_cals()

    def cal_entity(self) -> str:
        c = self.cal_entities()
        return c[0] if c else ""

    # ---- Termine abrufen
    async def refresh(self, force: bool = False) -> None:
        if self._busy or (not force and time.time() - self.ev_ts < REFRESH_S):
            return
        cals = self.cal_entities()
        if not cals:
            self.ev, self.unknown, self.error = [], {}, "Kein Kalender gewählt"
            return
        self._busy = True
        try:
            today = dt_util.now().date()
            end = max(date(today.year, 12, 31), today + timedelta(days=90)) + timedelta(days=1)
            raw: list[Any] = []
            errs: list[str] = []
            ok = 0
            for cal in cals:   # einzeln, damit ein fehlender Kalender die anderen nicht mitreißt
                try:
                    res = await self.hass.services.async_call(
                        "calendar", "get_events",
                        {"entity_id": cal, "start_date_time": dt_util.start_of_local_day(date(today.year, 1, 1)), "end_date_time": dt_util.start_of_local_day(end)},
                        blocking=True, return_response=True,
                    )
                    raw += ((res or {}).get(cal) or {}).get("events") or []
                    ok += 1
                except Exception as err:  # noqa: BLE001 - Kalender kann fehlen oder nicht antworten
                    errs.append(cal)
                    _LOGGER.debug("Müllabfuhr: Abruf %s fehlgeschlagen: %s", cal, err)
            self.cal_err = errs
            if not ok:
                # B5: Zwischenspeicher behalten, statt die Seite zu leeren
                self.error = "Kalender nicht erreichbar"
                self.ev_cached = bool(self.ev)
                return
            self.ev, self.unknown = parse_events(raw, self.cfg["kinds"], self.cfg["ignore"])
            self.ev_ok, self.ev_cached, self.ev_sig = time.time(), False, ev_sig(self.cfg)
            self.error = "" if self.ev else "Im Kalender wurden keine passenden Termine gefunden"
            self._save()
        finally:
            self.ev_ts = time.time()
            self._busy = False

    # ---- Aktionen
    def _due(self, today: date, minute: int, day_offset: int = 1) -> list[str]:
        """Arten, die an today+offset abgeholt werden und noch nicht als draußen markiert sind.
        Am Abholtag selbst (offset 0) nur bis zur Abholzeit der Art."""
        target = (today + timedelta(days=day_offset)).isoformat()
        return [k["id"] for k in self.cfg["kinds"] if k["on"] and (day_offset or minute < until_min(k))
                and any(d == target and b == k["id"] for d, b in self.ev) and self.done.get(k["id"]) != target]

    async def _send_push(self, title: str, msg: str) -> int:
        sent = 0
        for svc in self.cfg["push"]["to"]:
            name = svc.split(".", 1)[1]
            if not self.hass.services.has_service("notify", name):
                continue
            try:
                await self.hass.services.async_call("notify", name, {"title": title, "message": msg}, blocking=False)
                sent += 1
            except Exception as err:  # noqa: BLE001
                _LOGGER.debug("Müllabfuhr: Meldung %s: %s", svc, err)
        return sent

    async def _speak(self, text: str) -> None:
        t = self.cfg["tts"]
        if not (t["on"] and t["ent"] and t["player"]):
            return
        try:
            await self.hass.services.async_call("tts", "speak", {"entity_id": t["ent"], "media_player_entity_id": t["player"], "message": text}, blocking=False)
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("Müllabfuhr: Ansage: %s", err)

    async def _light(self, keys: list[str]) -> None:
        li = self.cfg["light"]
        if not li["ent"]:
            return
        want = bool(li["on"] and keys)
        try:
            if want and not self.light_on:
                h = ((self.kind(keys[0]) or {}).get("color") or "#78716c").lstrip("#")
                await self.hass.services.async_call("light", "turn_on", {"entity_id": li["ent"], "rgb_color": [int(h[i:i + 2], 16) for i in (0, 2, 4)], "brightness_pct": 60}, blocking=False)
                self.light_on = True
                self._save()
            elif not want and self.light_on:
                await self.hass.services.async_call("light", "turn_off", {"entity_id": li["ent"]}, blocking=False)
                self.light_on = False
                self._save()
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("Müllabfuhr: Licht: %s", err)

    async def _remind(self, keys: list[str], why: str) -> None:
        txt = names_text(keys, self.cfg["kinds"])
        if self.cfg["push"]["on"]:
            await self._send_push("Tonnen rausstellen", f"Morgen wird {txt} abgeholt.")
        await self._speak(self.cfg["tts"]["text"].replace("{tonnen}", txt))
        diag_log(self.hass, "info", f"Müllabfuhr: Erinnerung ({why}): {txt}", room="Müllabfuhr")

    async def _remind_early(self, items: list[tuple[str, str, int]]) -> None:
        parts = []
        for k, d, days in items:
            kd = self.kind(k) or {"name": k}
            parts.append(f"{kd['name']} in {days} Tagen ({_dm(date.fromisoformat(d))})")
        msg = "Vorwarnung: " + "; ".join(parts) + "."
        if self.cfg["push"]["on"]:
            await self._send_push("Sondertermin Müllabfuhr", msg)
        diag_log(self.hass, "info", f"Müllabfuhr: {msg}", room="Müllabfuhr")

    async def _tick(self, _now: Any) -> None:
        try:
            if not self.active():
                if self.light_on:
                    await self._light([])
                return
            await self.refresh()
            now = dt_util.now()
            today, minute = now.date(), now.hour * 60 + now.minute
            ev_min = _tm(self.cfg["time"])
            due = self._due(today, minute)
            in_window = ev_min <= minute < ev_min + CATCHUP_MIN
            key = f"p:{today.isoformat()}"
            if due and in_window and key not in self.sent:
                self.sent.append(key)
                self.sent = self.sent[-SENT_KEEP:]
                self._save()
                await self._remind(due, "Vorabend")
            early = early_due(self.ev, self.cfg["kinds"], today, self.done)
            ekey = f"e:{today.isoformat()}"
            if early and in_window and ekey not in self.sent:
                self.sent.append(ekey)
                self.sent = self.sent[-SENT_KEEP:]
                self._save()
                await self._remind_early(early)
            if self.snooze_until and time.time() >= self.snooze_until:
                self.snooze_until = 0.0
                self._save()
                if due:
                    await self._remind(due, "später")
            today_due = self._due(today, minute, 0)
            await self._light(due if minute >= ev_min else today_due)
        except Exception:  # noqa: BLE001 - die Müllabfuhr darf nie etwas anderes stören
            _LOGGER.exception("Müllabfuhr: Auswertung fehlgeschlagen")

    async def async_done(self, k: str) -> dict[str, Any]:
        now = dt_util.now()
        kd = self.kind(k)
        nxt = next_for(self.ev, k, now.date(), now.hour * 60 + now.minute, until_min(kd)) if kd else None
        if nxt:
            self.done[k] = nxt
            self._save()
            await self._tick(None)
        return await self.snapshot()

    async def async_undo(self, k: str) -> dict[str, Any]:
        self.done.pop(k, None)
        self._save()
        return await self.snapshot()

    async def async_snooze(self) -> dict[str, Any]:
        self.snooze_until = time.time() + self.cfg["snooze"] * 60
        self._save()   # B4: übersteht einen Neustart
        return await self.snapshot()

    async def async_test(self) -> dict[str, Any]:
        sent = await self._send_push("Müllabfuhr", "Testmeldung von Modul 17. Die Benachrichtigung funktioniert.")
        first = next((k["id"] for k in self.cfg["kinds"] if k["on"]), "rest")
        await self._speak(self.cfg["tts"]["text"].replace("{tonnen}", names_text([first], self.cfg["kinds"])))
        return {"sent": sent}

    # ---- Morgen-Briefing (Sponsor Max)
    def briefing_line(self) -> str | None:
        now = dt_util.now()
        today, minute = now.date(), now.hour * 60 + now.minute
        parts = []
        t0 = self._due(today, minute, 0)
        if t0:
            parts.append(f"Heute wird {names_text(t0, self.cfg['kinds'])} abgeholt")
        t1 = self._due(today, minute, 1)
        if t1:
            parts.append(f"morgen {names_text(t1, self.cfg['kinds'])} (heute Abend raus)")
        for s in upcoming_special(self.ev, self.cfg["kinds"], today)[:2]:
            parts.append(f"{s['name']} in {s['days']} Tagen")
        if not parts:
            return None
        txt = "; ".join(parts)
        return "🗑️ " + txt[0].upper() + txt[1:]

    # ---- Ansicht
    def _wx_notes(self, due: list[str]) -> list[dict[str, str]]:
        wm = self.hass.data.get(DOMAIN, {}).get("wetter")
        if not (self.cfg["wx"] and due and wm is not None):
            return []
        out = []
        for k, txt in (("storm", "Sturm gemeldet oder erwartet: Tonnen sichern oder erst spät rausstellen."), ("frost", "Frost: Biotonne kann festfrieren, Deckel prüfen.")):
            st = (getattr(wm, "st", {}) or {}).get(k) or {}
            if st.get("a") or st.get("ahead"):
                out.append({"k": k, "text": txt})
        return out

    async def snapshot(self) -> dict[str, Any]:
        on = self.active()
        if on:
            await self.refresh()
        cals = self.cal_entities()
        out: dict[str, Any] = {"on": on, "cfg": self.cfg, "cal": cals[0] if cals else "", "cals": cals, "auto": not self.cfg["cals"] and bool(cals),
                               "error": self.error, "cal_err": self.cal_err, "migrated": self.migrated,
                               "templates": {k: {"name": v["name"], "color": v["color"], "img": v["img"], "pre": v["pre"], "match": v["match"]} for k, v in TEMPLATES.items()}}
        if not on:
            return out
        now = dt_util.now()
        today, minute = now.date(), now.hour * 60 + now.minute
        ev_min = _tm(self.cfg["time"])
        rows = []
        for kd in self.cfg["kinds"]:
            if not kd["on"]:
                continue
            nx = next_for(self.ev, kd["id"], today, minute, until_min(kd))
            rows.append({"k": kd["id"], "name": kd["name"], "color": kd["color"], "img": kd["img"], "pre": kd["pre"], "next": nx,
                         "days": (date.fromisoformat(nx) - today).days if nx else None,
                         "state": bin_state(nx, today, minute, ev_min, self.done.get(kd["id"]))})
        rows.sort(key=lambda r: (r["next"] is None, r["next"] or ""))
        due = self._due(today, minute)
        special = [{"k": "pre", "bin": s["k"], "d": s["d"], "text": f"{s['name']} in {s['days']} Tagen ({_dm(date.fromisoformat(s['d']))}). Rechtzeitig vorbereiten."}
                   for s in upcoming_special(self.ev, self.cfg["kinds"], today)]
        out.update({
            "bins": rows, "month": {"y": today.year, "m": today.month, "d": month_days(self.ev, today.year, today.month), "today": today.day},
            "stats": stats(self.ev, today, self.cfg["cost"]["incl"], self.cfg["cost"]["fee"]) if self.cfg["cost"]["on"] else None,
            "ev": [list(x) for x in self.ev], "today": today.isoformat(), "minute": minute, "ev_min": ev_min,
            "until": {k["id"]: until_min(k) for k in self.cfg["kinds"]},
            "notes": special + shift_notes(self.ev, today, self.cfg["kinds"]) + self._wx_notes(due), "n_events": len(self.ev),
            "unknown": unknown_list(self.unknown, today), "now": now.isoformat(timespec="minutes"),
            "snooze": bool(self.snooze_until), "snooze_until": dt_util.as_local(dt_util.utc_from_timestamp(self.snooze_until)).strftime("%H:%M") if self.snooze_until else "",
            "light_on": self.light_on,
            "cached": self.ev_cached and bool(self.ev),
            "ev_ok": dt_util.as_local(dt_util.utc_from_timestamp(self.ev_ok)).strftime("%d.%m. %H:%M") if self.ev_ok else "",
        })
        return out
