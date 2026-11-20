"""Modul 17: Müllabfuhr (Addon) – Termine aus Kalendern (z. B. waste_collection_schedule), Ampel, Erinnerung, Ansage, Licht, Statistik.

Früher das Lab „Müllabfuhr“ (id mm) im Kern, seit Phase 3 ein Addon. Der Speicher heißt weiter fenster_heizung_muell,
damit alle Einstellungen und Termine erhalten bleiben. Die reinen Rechenfunktionen stehen oben, der Manager unten.

v0.2 (Fundament): Liste „Nicht erkannt“, „Später erinnern“ übersteht einen Neustart, Termine werden zwischengespeichert,
Abholzeit je Abfallart, Baustein fürs Morgen-Briefing, Tests (tests/test_muell.py).
v0.3 (Freie Abfallarten): bis zu 10 Abfallarten mit Name, Farbe, Bild und Erkennungswörtern, Vorlagen, bis zu drei
Kalender, Sondertermine mit früherer Vorwarnung. Die vier bisherigen Tonnen werden einmalig übernommen (Schema 2).
v0.6 (Erinnern): Meldung mit Knöpfen (HA-App), zweite Erinnerung am Abholtag, „Tonne reinholen“, Licht mit Helligkeit,
wechselnder Farbe und Rückkehr zum vorherigen Zustand.
v0.8 (Haushalt): „Wer ist dran?“ im Wechsel, Hinweis vor dem Urlaub, Sturm verschiebt die Erinnerung, „Diesmal nicht“
(Leerung auslassen), Verlauf je Abholung, Kosten wahlweise nur für Tonnen, die wirklich draußen standen.
v0.9 (Vorabversion): Jahresübersicht je Abfallart mit Vorjahr, Sensoren und Ereignis für Home Assistant, Vorrat Gelbe
Säcke, Labs „Automatisch erkennen“ (Sensor an der Tonne oder am Stellplatz).
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
HIST_KEEP = 400
EVENT = "strom_waerme_muell"         # Ereignis für eigene Automationen
ENT_PRE = "strom_waerme_muell"       # sensor.strom_waerme_muell_… und binary_sensor.strom_waerme_muell_…
OUT_STATES = ("on", "off", "not_home", "home")
API_V = 2                 # ab v0.8: async_done(how, who), Aktionen skip / unskip / take
BACK_DAYS = 2             # so lange nach der Abholung gilt „reinholen“
ACT_DONE, ACT_SNOOZE, ACT_IN = "SWMU_DONE", "SWMU_SNOOZE", "SWMU_IN"   # Knöpfe in der Meldung der HA-App
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
    return {"id": kid or tid, "name": t["name"], "color": t["color"], "img": t["img"], "match": t["match"], "on": True, "until": "12:00", "pre": t["pre"], "tpl": tid if tid in TEMPLATES else "", "sensor": "", "sensor_out": "on"}


def default_cfg() -> dict[str, Any]:
    return {
        "v": SCHEMA, "cals": [], "cal": "", "time": "18:30", "kinds": [kind_from_tpl(k) for k in BASE], "ignore": [], "snooze": 60,
        "push": {"on": False, "to": [], "btn": True}, "morning": {"on": False, "time": "06:30"}, "back": {"on": False, "time": "17:00"}, "cost": {"on": False, "fee": 0.0, "incl": 0}, "wx": True,
        "tts": {"on": False, "ent": "", "player": "", "text": "Morgen wird {tonnen} abgeholt."}, "light": {"on": False, "ent": "", "bri": 60, "restore": True},
        "look": {"old": False, "motion": "dezent"},
        "turn": {"on": False, "mode": "pickup", "home": True, "people": [], "since": ""},
        "wxmode": "hint", "vac": True,
        "ha": True, "bags": {"on": False, "kind": "gelb", "per": 1, "warn": 5}, "labs_auto": False,
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
        # Labs C12: Sensor an der Tonne oder am Stellplatz, out = Zustand, der „draußen“ bedeutet
        "sensor": _ent(x.get("sensor"), ("binary_sensor", "device_tracker", "sensor", "input_boolean")),
        "sensor_out": x["sensor_out"] if x.get("sensor_out") in OUT_STATES else "on",
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
    d["push"] = {"on": bool(p.get("on", False)), "to": to, "btn": bool(p.get("btn", True))}
    for key, dt in (("morning", "06:30"), ("back", "17:00")):
        x = r.get(key) if isinstance(r.get(key), dict) else {}
        d[key] = {"on": bool(x.get("on", False)), "time": x["time"] if isinstance(x.get("time"), str) and _HM.match(x["time"]) else dt}
    c = r.get("cost") if isinstance(r.get("cost"), dict) else {}
    d["cost"] = {"on": bool(c.get("on", False)), "fee": round(_num(c.get("fee"), 0, 999, 0), 2), "incl": int(_num(c.get("incl"), 0, 99, 0)),
                 "count": "out" if c.get("count") == "out" else "cal"}
    tr = r.get("turn") if isinstance(r.get("turn"), dict) else {}
    ppl: list[dict[str, str]] = []
    for x in tr.get("people") if isinstance(tr.get("people"), list) else []:
        pid = _ent((x or {}).get("pid") if isinstance(x, dict) else x, ("person",))
        if pid and pid not in [q["pid"] for q in ppl] and len(ppl) < 6:
            ppl.append({"pid": pid, "to": _ent((x or {}).get("to") if isinstance(x, dict) else "", ("notify",))})
    since = str(tr.get("since") or "")
    d["turn"] = {"on": bool(tr.get("on", False)), "mode": "week" if tr.get("mode") == "week" else "pickup", "home": bool(tr.get("home", True)),
                 "people": ppl, "since": since if re.match(r"^\d{4}-\d{2}-\d{2}$", since) else ""}
    d["wxmode"] = "shift" if r.get("wxmode") == "shift" else "hint"
    d["vac"] = bool(r.get("vac", True))
    d["ha"] = bool(r.get("ha", True))
    d["labs_auto"] = bool(r.get("labs_auto", False))
    bg = r.get("bags") if isinstance(r.get("bags"), dict) else {}
    bk = str(bg.get("kind") or "gelb")
    d["bags"] = {"on": bool(bg.get("on", False)), "kind": bk if _ID.match(bk) else "gelb", "per": int(_num(bg.get("per"), 1, 5, 1)), "warn": int(_num(bg.get("warn"), 0, 50, 5))}
    d["wx"] = bool(r.get("wx", True))
    t = r.get("tts") if isinstance(r.get("tts"), dict) else {}
    txt = str(t.get("text") or d["tts"]["text"]).strip()[:120]
    d["tts"] = {"on": bool(t.get("on", False)), "ent": _ent(t.get("ent"), ("tts",)), "player": _ent(t.get("player"), ("media_player",)), "text": txt or d["tts"]["text"]}
    li = r.get("light") if isinstance(r.get("light"), dict) else {}
    d["light"] = {"on": bool(li.get("on", False)), "ent": _ent(li.get("ent"), ("light",)), "bri": int(_num(li.get("bri"), 10, 100, 60)), "restore": bool(li.get("restore", True))}
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


def stats(events: list[tuple[str, str]], today: date, incl: int, fee: float, count: str = "cal", out_days: set[str] | None = None,
          skipped: set[str] | None = None, since: str = "") -> dict[str, Any]:
    """Restmüll-Leerungen im Jahr. count „cal“: jeder Termin zählt; „out“: ab `since` nur Termine, an denen die Tonne
    als draußen markiert war (davor wie im Kalender). Ausgelassene Leerungen zählen nie."""
    pre = f"{today.year:04d}-"
    rest = [d for d, b in events if b == "rest" and d.startswith(pre)]
    sk = {d for d in (skipped or set()) if d.startswith(pre)}
    od = out_days or set()
    past = [d for d in rest if d <= today.isoformat() and d not in sk]
    if count == "out":
        done = sum(1 for d in past if (since and d < since) or d in od)
    else:
        done = len(past)
    n_skip = len([d for d in rest if d in sk])
    return {"year": today.year, "total": len(rest) - n_skip, "done": done, "incl": incl, "free": max(0, incl - done) if incl else None,
            "extra": max(0, done - incl) if incl else None, "cost": round(max(0, done - incl) * fee, 2) if incl and fee else None,
            "skipped": n_skip, "count": count, "not_out": len(past) - done if count == "out" else 0}


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


def back_list(kinds: list[dict[str, Any]], done: dict[str, str], inn: dict[str, str], today: date, minute: int) -> list[tuple[str, str]]:
    """Tonnen, die abgeholt wurden (als draußen markiert) und wieder rein müssen: (Art, Abholtag)."""
    out = []
    for k in kinds:
        d = done.get(k["id"])
        if not k["on"] or not d or inn.get(k["id"]) == d:
            continue
        try:
            age = (today - date.fromisoformat(d)).days
        except ValueError:
            continue
        if 0 <= age <= BACK_DAYS and (age > 0 or minute >= until_min(k)):
            out.append((k["id"], d))
    return out


def year_stats(events: list[tuple[str, str]], kinds: list[dict[str, Any]], hist: list[dict[str, Any]], today: date, since: str) -> dict[str, Any]:
    """C9: Abholungen im laufenden Jahr je Abfallart: geplant, bisher, draußen, ausgelassen, ohne Angabe."""
    y = f"{today.year:04d}-"
    t = today.isoformat()
    out_set = {(h["d"], h["k"]) for h in hist if h.get("act") == "out"}
    skip_set = {(h["d"], h["k"]) for h in hist if h.get("act") == "skip"}
    rows = []
    tot = {"plan": 0, "past": 0, "out": 0, "skip": 0, "none": 0, "tracked": 0}
    for k in kinds:
        if not k["on"]:
            continue
        ds = sorted({d for d, b in events if b == k["id"] and d.startswith(y)})
        past = [d for d in ds if d <= t]
        tr = [d for d in past if since and d >= since]
        r = {"k": k["id"], "name": k["name"], "plan": len(ds), "past": len(past), "out": sum(1 for d in tr if (d, k["id"]) in out_set),
             "skip": sum(1 for d in ds if (d, k["id"]) in skip_set), "tracked": len(tr)}
        r["none"] = max(0, r["tracked"] - r["out"] - sum(1 for d in tr if (d, k["id"]) in skip_set))
        rows.append(r)
        for x in tot:
            tot[x] += r[x]
    tot["rate"] = round(tot["out"] / max(1, tot["tracked"] - tot["skip"]) * 100) if tot["tracked"] - tot["skip"] > 0 else None
    return {"year": today.year, "rows": rows, "tot": tot, "since": since}


def pickup_dates(events: list[tuple[str, str]], kinds: list[dict[str, Any]]) -> list[str]:
    on = {k["id"] for k in kinds if k["on"]}
    return sorted({d for d, b in events if b in on})


def turn_index(mode: str, since: str, d: str, dates: list[str]) -> int:
    """C4: Position im Wechsel. „week“: Wochen seit dem Start; „pickup“: Abholtage seit dem Start."""
    if not since:
        since = d
    if mode == "week":
        a, b = date.fromisoformat(since), date.fromisoformat(d)
        return ((b - timedelta(days=b.weekday())) - (a - timedelta(days=a.weekday()))).days // 7
    return len([x for x in dates if since <= x < d])


def vacation_pickups(events: list[tuple[str, str]], kinds: list[dict[str, Any]], frm: str, to: str, today: date) -> list[tuple[str, str]]:
    on = {k["id"] for k in kinds if k["on"]}
    t = today.isoformat()
    return [(d, b) for d, b in events if b in on and frm <= d <= to and d >= t]


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
    api_v = API_V

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_muell")
        self.cfg = default_cfg()
        self.cfg_v1: dict[str, Any] | None = None
        self.done: dict[str, str] = {}
        self.sent: list[str] = []
        self.light_on = False
        self.light_prev: dict[str, Any] | None = None
        self.light_alt = 0
        self.inn: dict[str, str] = {}
        self.skip: dict[str, str] = {}
        self.hist: list[dict[str, Any]] = []
        self.hist_since = ""
        self.turn_ovr: dict[str, str] = {}
        self.wx_shift: str = ""
        self.years: dict[str, Any] = {}
        self.bags: int | None = None
        self._pub: dict[str, tuple[str, dict[str, Any]]] = {}
        self._vals: dict[str, Any] = {"sensor": {}, "binary_sensor": {}}
        self._ha_last: bool | None = None
        self._auto_last: dict[str, str] = {}
        self.snooze_until = 0.0
        self._unsub_act: CALLBACK_TYPE | None = None
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
            self.light_prev = d.get("light_prev") if isinstance(d.get("light_prev"), dict) else None
            self.inn = {k: str(v) for k, v in (d.get("inn") or {}).items() if k in ids}
            self.skip = {k: str(v) for k, v in (d.get("skip") or {}).items() if k in ids}
            self.hist = [h for h in d.get("hist") or [] if isinstance(h, dict) and h.get("d") and h.get("k")][-HIST_KEEP:]
            self.hist_since = str(d.get("hist_since") or "")
            self.turn_ovr = {str(k): str(v) for k, v in (d.get("turn_ovr") or {}).items()}
            self.wx_shift = str(d.get("wx_shift") or "")
            self.years = {str(k): v for k, v in (d.get("years") or {}).items() if isinstance(v, dict)}
            self.bags = int(d["bags"]) if isinstance(d.get("bags"), (int, float)) else None
            su = _num(d.get("snooze_until"), 0, 4e10, 0)
            self.snooze_until = su if su > time.time() - 6 * 3600 else 0.0
            c = d.get("cache") if isinstance(d.get("cache"), dict) else {}
            if c.get("sig") == ev_sig(self.cfg) and isinstance(c.get("ev"), list):
                self.ev = [(str(a), str(b)) for a, b in (x for x in c["ev"] if isinstance(x, (list, tuple)) and len(x) == 2)]
                self.unknown = {str(k): v for k, v in (c.get("unknown") or {}).items() if isinstance(v, dict)}
                self.ev_ok = _num(c.get("ts"), 0, 4e10, 0)
                self.ev_cached = True
                self.ev_sig = c["sig"]
        if not self.hist_since:
            self.hist_since = dt_util.now().date().isoformat()
            self._save()
        if self.migrated:
            diag_log(self.hass, "info", "Müllabfuhr: Tonnen in die neue Liste der Abfallarten übernommen", room="Müllabfuhr")
            self._save()
        self._unsub = async_track_time_interval(self.hass, self._tick, timedelta(seconds=TICK_SECONDS))
        try:
            self._unsub_act = self.hass.bus.async_listen("mobile_app_notification_action", self._on_action)
        except Exception:  # noqa: BLE001 - ohne Ereignisbus (Tests) geht es auch
            self._unsub_act = None

    def async_stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None
        if self._unsub_act:
            self._unsub_act()
            self._unsub_act = None
        self._unpublish()

    async def _on_action(self, event: Any) -> None:
        """Knopf in der Meldung der HA-App: Steht draußen, Später, Wieder drin."""
        act = str((getattr(event, "data", None) or {}).get("action") or "")
        try:
            if act == ACT_DONE:
                await self.async_done_all("meldung")
            elif act == ACT_SNOOZE:
                await self.async_snooze()
            elif act == ACT_IN:
                await self.async_in("")
            else:
                return
            diag_log(self.hass, "info", f"Müllabfuhr: Knopf in der Meldung ({act})", room="Müllabfuhr")
        except Exception:  # noqa: BLE001
            _LOGGER.exception("Müllabfuhr: Knopf %s", act)

    def _data(self) -> dict[str, Any]:
        out = {"cfg": self.cfg, "done": self.done, "inn": self.inn, "skip": self.skip, "hist": self.hist[-HIST_KEEP:], "hist_since": self.hist_since,
               "turn_ovr": self.turn_ovr, "wx_shift": self.wx_shift, "years": self.years, "bags": self.bags, "sent": self.sent[-SENT_KEEP:], "light_on": self.light_on, "light_prev": self.light_prev, "snooze_until": self.snooze_until,
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
        self.inn = {k: v for k, v in self.inn.items() if k in ids}
        self.skip = {k: v for k, v in self.skip.items() if k in ids}
        if self.cfg["turn"]["on"] and not self.cfg["turn"]["since"]:
            self.cfg["turn"]["since"] = dt_util.now().date().isoformat()
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
                and any(d == target and b == k["id"] for d, b in self.ev) and self.done.get(k["id"]) != target and self.skip.get(k["id"]) != target]

    async def _send_push(self, title: str, msg: str, buttons: list[tuple[str, str]] | None = None, to: list[str] | None = None) -> int:
        sent = 0
        for svc in (to if to else self.cfg["push"]["to"]):
            name = svc.split(".", 1)[1]
            if not self.hass.services.has_service("notify", name):
                continue
            data: dict[str, Any] = {"title": title, "message": msg}
            if name.startswith("mobile_app_"):
                # gleiche Kennung: eine neue Meldung ersetzt die alte auf dem Handy
                data["data"] = {"tag": "strom_waerme_muell", "group": "strom_waerme_muell"}
                if buttons and self.cfg["push"].get("btn", True):
                    data["data"]["actions"] = [{"action": a, "title": t} for a, t in buttons]
            try:
                await self.hass.services.async_call("notify", name, data, blocking=False)
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

    # ---- Personen (C4, C5)
    def _pres(self) -> Any:
        return self.hass.data.get(DOMAIN, {}).get("presence")

    def _name(self, pid: str) -> str:
        st = self.hass.states.get(pid) if hasattr(self.hass, "states") else None
        nm = str((st.attributes or {}).get("friendly_name") or "") if st is not None else ""
        return nm or pid.split(".")[-1].capitalize()

    def _is_home(self, pid: str) -> bool | None:
        pm = self._pres()
        try:
            from custom_components.fenster_heizung.presence import person_home
            d = getattr(pm, "data", {}) or {}
            h, _ = person_home(self.hass.states.get, pid, (d.get("people") or {}).get(pid), d.get("zone"))
            return h
        except Exception:  # noqa: BLE001 - ohne Modul 1 nur die Personen-Entität
            st = self.hass.states.get(pid) if hasattr(self.hass, "states") else None
            return None if st is None or st.state in ("unknown", "unavailable") else st.state == "home"

    def who_for(self, day: str, check_home: bool = False) -> dict[str, Any] | None:
        """C4: Wer ist an diesem Abholtag dran? Tausch von Hand geht vor. Mit „nur wer zu Hause ist“ springt die
        Erinnerung zur nächsten Person, die gerade zu Hause ist; ist niemand da, bekommen alle die Meldung."""
        t = self.cfg["turn"]
        P = t["people"]
        if not (t["on"] and P):
            return None
        ids = [p["pid"] for p in P]
        if self.turn_ovr.get(day) in ids:
            i = ids.index(self.turn_ovr[day])
        else:
            i = turn_index(t["mode"], t["since"], day, pickup_dates(self.ev, self.cfg["kinds"])) % len(P)
        if check_home and t["home"]:
            for j in range(len(P)):
                q = P[(i + j) % len(P)]
                if self._is_home(q["pid"]) is not False:
                    return {**q, "name": self._name(q["pid"]), "moved": j > 0}
            return None
        return {**P[i], "name": self._name(P[i]["pid"]), "moved": False}

    def vacation(self) -> tuple[str, str] | None:
        d = getattr(self._pres(), "data", None) or {}
        if d.get("mode") == "vacation" and d.get("from") and d.get("to"):
            return str(d["from"]), str(d["to"])
        return None

    def _storm(self) -> bool:
        wm = self.hass.data.get(DOMAIN, {}).get("wetter")
        st = ((getattr(wm, "st", {}) or {}).get("storm") or {}) if wm is not None else {}
        return bool(st.get("a") or st.get("ahead"))

    # ---- B9: Ereignis und Entitäten für Home Assistant
    def _fire(self, typ: str, **data: Any) -> None:
        try:
            self.hass.bus.async_fire(EVENT, {"typ": typ, **data})
        except Exception:  # noqa: BLE001
            pass

    def _set(self, eid: str, state: str, attrs: dict[str, Any]) -> None:
        if self._pub.get(eid) == (state, attrs):
            return
        self._pub[eid] = (state, attrs)
        try:
            self.hass.states.async_set(eid, state, attrs)
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("Müllabfuhr: %s: %s", eid, err)

    def _unpublish(self) -> None:
        for eid in list(self._pub):
            try:
                self.hass.states.async_remove(eid)
            except Exception:  # noqa: BLE001
                pass
        self._pub.clear()

    def _values(self, rows: list[dict[str, Any]]) -> dict[str, Any]:
        """Alle Werte für Entitäten: sensor.strom_waerme_muell_<key> und binary_sensor.strom_waerme_muell_<key>."""
        sen: dict[str, Any] = {}
        up = [r for r in rows if r["next"] and r["state"] != "skip"]
        nx = min((r["next"] for r in up), default=None)
        same = [r for r in up if r["next"] == nx]
        sen["naechste_abholung"] = {"name": "Nächste Abholung", "icon": "mdi:trash-can", "value": nx, "attrs": {"arten": [r["name"] for r in same], "tage": same[0]["days"] if same else None}}
        for r in rows:
            sen[r["k"]] = {"name": r["name"], "icon": "mdi:delete-variant", "value": r["days"],
                           "attrs": {"naechste_abholung": r["next"], "zustand": r["state"], "farbe": r["color"]}}
        if self.cfg["bags"]["on"] and self.bags is not None:
            sen["gelbe_saecke"] = {"name": "Vorrat Säcke", "icon": "mdi:sack", "value": self.bags, "attrs": {"art": self.cfg["bags"]["kind"], "melden_ab": self.cfg["bags"]["warn"]}}
        out = [r["name"] for r in rows if r["state"] in ("out", "today")]
        back = [r["name"] for r in rows if r["state"] == "back"]
        bs = {"rausstellen": {"name": "Tonne rausstellen", "icon": "mdi:delete-alert", "value": bool(out), "attrs": {"arten": out}},
              "reinholen": {"name": "Tonne reinholen", "icon": "mdi:delete-restore", "value": bool(back), "attrs": {"arten": back}}}
        return {"sensor": sen, "sensor_keys": list(sen), "binary_sensor": bs, "binary_sensor_keys": list(bs)}

    def cost_info(self) -> dict[str, Any] | None:
        """Für Modul 20 (Kosten an einem Ort): Restmüll-Leerungen und Zusatzkosten im laufenden Jahr – nur wenn „Leerungen zählen“ an ist."""
        c = self.cfg["cost"]
        if not c["on"]:
            return None
        today = dt_util.now().date()
        s = stats(self.ev, today, c["incl"], c["fee"], c["count"], {h["d"] for h in self.hist if h["k"] == "rest" and h["act"] == "out"},
                  {h["d"] for h in self.hist if h["k"] == "rest" and h["act"] == "skip"} | ({self.skip["rest"]} if self.skip.get("rest") else set()), self.hist_since)
        return {**s, "fee": c["fee"]}

    def values(self) -> dict[str, Any]:
        """Für die Entitäten im Kern (ab 2026.11.4b6). Ausgeschaltet: keine Werte, die Entitäten sind dann nicht verfügbar."""
        return self._vals if self.cfg["ha"] else {"sensor": {}, "binary_sensor": {}}

    def publish(self, rows: list[dict[str, Any]]) -> None:
        """Werte veröffentlichen: mit neuem Kern als echte Entitäten, sonst wie bisher als Zustände."""
        store = self.hass.data.get(DOMAIN, {})
        vals = self._values(rows)
        if store.get("muell_ent") and callable(store.get("muell_push")):
            if self._pub:
                self._unpublish()          # frühere, nur gesetzte Zustände räumen, die Entitäten übernehmen
            if vals != self._vals or self._ha_last != self.cfg["ha"]:
                self._vals, self._ha_last = vals, self.cfg["ha"]
                try:
                    store["muell_push"]()
                except Exception:  # noqa: BLE001
                    pass
            return
        self._vals = vals
        if not self.cfg["ha"]:
            self._unpublish()
            return
        ids = set()
        for key, x in vals["sensor"].items():
            e = f"sensor.{ENT_PRE}_{key}"
            ids.add(e)
            a = {"friendly_name": f"Müllabfuhr {x['name']}", "icon": x["icon"], **x["attrs"]}
            if key == "naechste_abholung":
                a["device_class"] = "date"
            else:
                a["unit_of_measurement"] = "Stk." if key == "gelbe_saecke" else "d"
            self._set(e, "unknown" if x["value"] is None else str(x["value"]), a)
        for key, x in vals["binary_sensor"].items():
            e = f"binary_sensor.{ENT_PRE}_{key}"
            ids.add(e)
            self._set(e, "on" if x["value"] else "off", {"friendly_name": f"Müllabfuhr {x['name']}", "icon": x["icon"], **x["attrs"]})
        for eid in [x for x in self._pub if x not in ids]:
            try:
                self.hass.states.async_remove(eid)
            except Exception:  # noqa: BLE001
                pass
            self._pub.pop(eid, None)

    # ---- C11: Vorrat Säcke
    async def _bag_use(self, k: str) -> None:
        bg = self.cfg["bags"]
        if not bg["on"] or k != bg["kind"] or self.bags is None:
            return
        self.bags = max(0, self.bags - bg["per"])
        if self.bags <= bg["warn"] and f"bag:{self.bags}" not in self.sent and not any(x.startswith("bag:") and int(x[4:] or 99) <= self.bags for x in self.sent[-SENT_KEEP:] if x[4:].isdigit()):
            self.sent.append(f"bag:{self.bags}")
            if self.cfg["push"]["on"]:
                kd = self.kind(k) or {"name": "Säcke"}
                await self._send_push("Säcke holen", f"Nur noch {self.bags} {kd['name'] if kd['name'] != 'Gelber Sack' else 'Gelbe Säcke'} übrig. Zeit für eine neue Rolle.")
            self._fire("vorrat", art=k, anzahl=self.bags)

    async def async_bags(self, n: int) -> dict[str, Any]:
        self.bags = max(0, min(500, int(n)))
        self.sent = [x for x in self.sent if not x.startswith("bag:")]
        self._save()
        return await self.snapshot()

    # ---- C12 (Labs): automatisch erkennen
    async def _auto(self, today: date, minute: int) -> None:
        if not self.cfg["labs_auto"]:
            return
        for k in self.cfg["kinds"]:
            ent = k.get("sensor")
            if not (k["on"] and ent):
                continue
            st = self.hass.states.get(ent) if hasattr(self.hass, "states") else None
            if st is None or st.state in ("unknown", "unavailable"):
                continue
            is_out = st.state == k.get("sensor_out", "on")
            prev = self._auto_last.get(k["id"])
            self._auto_last[k["id"]] = "out" if is_out else "in"
            if prev is None or prev == self._auto_last[k["id"]]:
                continue                      # nur auf Wechsel reagieren
            due = set(self._due(today, minute, 1)) | set(self._due(today, minute, 0))
            if is_out and k["id"] in due:
                await self.async_done(k["id"], "auto", "")
            elif not is_out and k["id"] in dict(back_list(self.cfg["kinds"], self.done, self.inn, today, minute)):
                await self.async_in(k["id"])

    def _hist_add(self, k: str, d: str, act: str, how: str = "", who: str = "") -> None:
        self.hist = [h for h in self.hist if not (h["k"] == k and h["d"] == d and h["act"] in (("out", "skip") if act in ("out", "skip", "undo") else (act,)))]
        if act in ("out", "skip", "in"):
            self._fire({"out": "draussen", "skip": "ausgelassen", "in": "drin"}[act], art=k, name=(self.kind(k) or {}).get("name", k), datum=d, wie=how, wer=who)
        if act != "undo":
            self.hist.append({"k": k, "d": d, "act": act, "how": how[:12], "who": who[:40], "ts": int(dt_util.now().timestamp())})
        self.hist = self.hist[-HIST_KEEP:]

    def _light_snapshot(self, ent: str) -> dict[str, Any]:
        st = self.hass.states.get(ent) if hasattr(self.hass, "states") else None
        if st is None or st.state != "on":
            return {"on": False}
        a = st.attributes or {}
        out: dict[str, Any] = {"on": True}
        if a.get("brightness") is not None:
            out["brightness"] = a.get("brightness")
        mode = a.get("color_mode")
        if mode in ("color_temp",) and a.get("color_temp_kelvin"):
            out["color_temp_kelvin"] = a.get("color_temp_kelvin")
        elif a.get("rgb_color"):
            out["rgb_color"] = list(a.get("rgb_color"))
        return out

    async def _light(self, keys: list[str]) -> None:
        """B10: Helligkeit einstellbar, bei mehreren Tonnen wechselnde Farbe, danach vorheriger Zustand."""
        li = self.cfg["light"]
        if not li["ent"]:
            return
        want = bool(li["on"] and keys)
        try:
            if want:
                if not self.light_on and li.get("restore", True):
                    self.light_prev = self._light_snapshot(li["ent"])
                k = keys[self.light_alt % len(keys)] if len(keys) > 1 else keys[0]
                if len(keys) > 1:
                    self.light_alt += 1
                if not self.light_on or len(keys) > 1:
                    h = ((self.kind(k) or {}).get("color") or "#78716c").lstrip("#")
                    await self.hass.services.async_call("light", "turn_on", {"entity_id": li["ent"], "rgb_color": [int(h[i:i + 2], 16) for i in (0, 2, 4)], "brightness_pct": li.get("bri", 60)}, blocking=False)
                    if not self.light_on:
                        self.light_on = True
                        self._save()
            elif self.light_on:
                prev = self.light_prev if li.get("restore", True) else None
                if prev and prev.get("on"):
                    data = {"entity_id": li["ent"], **{k: v for k, v in prev.items() if k != "on"}}
                    await self.hass.services.async_call("light", "turn_on", data, blocking=False)
                else:
                    await self.hass.services.async_call("light", "turn_off", {"entity_id": li["ent"]}, blocking=False)
                self.light_on, self.light_prev, self.light_alt = False, None, 0
                self._save()
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("Müllabfuhr: Licht: %s", err)

    async def _remind(self, keys: list[str], why: str, day: str | None = None) -> None:
        txt = names_text(keys, self.cfg["kinds"])
        day = day or (dt_util.now().date() + timedelta(days=1)).isoformat()
        who = self.who_for(day, check_home=True)
        to = [who["to"]] if who and who.get("to") else None
        pre = f"{who['name']} ist dran. " if who else ""
        self._fire("erinnerung", arten=keys, text=f"Morgen wird {txt} abgeholt.", datum=day, wer=(who or {}).get("pid", ""))
        if self.cfg["push"]["on"]:
            await self._send_push("Tonnen rausstellen", f"{pre}Morgen wird {txt} abgeholt.", [(ACT_DONE, "Steht draußen"), (ACT_SNOOZE, "Später")], to)
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
            await self._auto(today, minute)
            if f"y:{today.isoformat()}" not in self.sent and self.ev:
                self.sent.append(f"y:{today.isoformat()}")
                self.years[str(today.year)] = year_stats(self.ev, self.cfg["kinds"], self.hist, today, self.hist_since)
                self.years = {k: v for k, v in sorted(self.years.items())[-5:]}
                self._save()
            due = self._due(today, minute)
            in_window = ev_min <= minute < ev_min + CATCHUP_MIN
            key = f"p:{today.isoformat()}"
            if due and in_window and key not in self.sent:
                self.sent.append(key)
                self.sent = self.sent[-SENT_KEEP:]
                tomorrow = (today + timedelta(days=1)).isoformat()
                if self.cfg["wxmode"] == "shift" and self._storm():
                    # C7: bei Sturm erst morgen früh rausstellen
                    self.wx_shift = tomorrow
                    self._save()
                    if self.cfg["push"]["on"]:
                        await self._send_push("Sturm gemeldet", f"Morgen wird {names_text(due, self.cfg['kinds'])} abgeholt. Wegen Sturm lieber erst morgen früh rausstellen, ich erinnere um {self.cfg['morning']['time']} Uhr.")
                    diag_log(self.hass, "info", "Müllabfuhr: Sturm, Erinnerung auf den Morgen verschoben", room="Müllabfuhr")
                else:
                    self._save()
                    await self._remind(due, "Vorabend")
            # C5: Hinweis vor dem Urlaub (am Vorabend des ersten Urlaubstags)
            vac = self.vacation() if self.cfg["vac"] else None
            if vac and in_window and vac[0] == (today + timedelta(days=1)).isoformat() and f"v:{vac[0]}" not in self.sent:
                vp = vacation_pickups(self.ev, self.cfg["kinds"], vac[0], vac[1], today)
                self.sent.append(f"v:{vac[0]}")
                self.sent = self.sent[-SENT_KEEP:]
                self._save()
                if vp and self.cfg["push"]["on"]:
                    items = ", ".join(f"{(self.kind(b) or {}).get('name', b)} {_dm(date.fromisoformat(d))}" for d, b in vp[:6])
                    await self._send_push("Abholung im Urlaub", f"Während du weg bist, wird abgeholt: {items}. Vorher rausstellen oder jemanden bitten.")
            early = early_due(self.ev, self.cfg["kinds"], today, self.done)
            ekey = f"e:{today.isoformat()}"
            if early and in_window and ekey not in self.sent:
                self.sent.append(ekey)
                self.sent = self.sent[-SENT_KEEP:]
                self._save()
                await self._remind_early(early)
                for k, d, days in early:
                    self._fire("vorwarnung", art=k, name=(self.kind(k) or {}).get("name", k), datum=d, tage=days)
            # C2: zweite Erinnerung am Abholtag, nur wenn noch nicht draußen
            mo = self.cfg["morning"]
            t0 = self._due(today, minute, 0)
            m_min = _tm(mo["time"])
            if (mo["on"] or self.wx_shift == today.isoformat()) and t0 and m_min <= minute < m_min + CATCHUP_MIN and f"m:{today.isoformat()}" not in self.sent:
                self.sent.append(f"m:{today.isoformat()}")
                self.sent = self.sent[-SENT_KEEP:]
                self._save()
                txt = names_text(t0, self.cfg["kinds"])
                who = self.who_for(today.isoformat(), check_home=True)
                if self.cfg["push"]["on"]:
                    await self._send_push("Heute ist Abholung", f"{who['name'] + ' ist dran. ' if who else ''}Heute wird {txt} abgeholt. Steht die Tonne schon draußen?", [(ACT_DONE, "Steht draußen")], [who["to"]] if who and who.get("to") else None)
                diag_log(self.hass, "info", f"Müllabfuhr: Erinnerung am Morgen: {txt}", room="Müllabfuhr")
            # C3: Tonne reinholen
            bk = self.cfg["back"]
            bl = back_list(self.cfg["kinds"], self.done, self.inn, today, minute) if bk["on"] else []
            b_min = _tm(bk["time"])
            if bl and b_min <= minute < b_min + CATCHUP_MIN and f"b:{today.isoformat()}" not in self.sent:
                self.sent.append(f"b:{today.isoformat()}")
                self.sent = self.sent[-SENT_KEEP:]
                self._save()
                txt = names_text([k for k, _ in bl], self.cfg["kinds"])
                self._fire("reinholen", arten=[k for k, _ in bl], text=f"{txt} wurde abgeholt.")
                if self.cfg["push"]["on"]:
                    await self._send_push("Tonnen reinholen", f"{txt} wurde abgeholt. Bitte wieder reinstellen.", [(ACT_IN, "Wieder drin")])
                diag_log(self.hass, "info", f"Müllabfuhr: Erinnerung reinholen: {txt}", room="Müllabfuhr")
            if self.snooze_until and time.time() >= self.snooze_until:
                self.snooze_until = 0.0
                self._save()
                if due:
                    await self._remind(due, "später")
            today_due = self._due(today, minute, 0)
            await self._light(due if minute >= ev_min else today_due)
            self.publish(self._rows(today, minute))
        except Exception:  # noqa: BLE001 - die Müllabfuhr darf nie etwas anderes stören
            _LOGGER.exception("Müllabfuhr: Auswertung fehlgeschlagen")

    async def async_done(self, k: str, how: str = "tipp", who: str = "") -> dict[str, Any]:
        now = dt_util.now()
        kd = self.kind(k)
        nxt = next_for(self.ev, k, now.date(), now.hour * 60 + now.minute, until_min(kd)) if kd else None
        if nxt:
            self.done[k] = nxt
            self.skip.pop(k, None) if self.skip.get(k) == nxt else None
            self._hist_add(k, nxt, "out", how, who)
            await self._bag_use(k)
            self._save()
            await self._tick(None)
        return await self.snapshot()

    async def async_skip(self, k: str, who: str = "") -> dict[str, Any]:
        """C8: Diesmal nicht – keine Erinnerung, kein Licht, zählt nicht als Leerung."""
        now = dt_util.now()
        kd = self.kind(k)
        nxt = next_for(self.ev, k, now.date(), now.hour * 60 + now.minute, until_min(kd)) if kd else None
        if nxt:
            self.skip[k] = nxt
            if self.done.get(k) == nxt:
                self.done.pop(k, None)
            self._hist_add(k, nxt, "skip", "tipp", who)
            self._save()
            await self._tick(None)
        return await self.snapshot()

    async def async_unskip(self, k: str) -> dict[str, Any]:
        d = self.skip.pop(k, None)
        if d:
            self._hist_add(k, d, "undo")
            self._save()
        return await self.snapshot()

    async def async_take(self, day: str, pid: str) -> dict[str, Any]:
        """C4: Für einen Abholtag eine andere Person eintragen (leer = wieder nach Plan)."""
        if re.match(r"^\d{4}-\d{2}-\d{2}$", day or ""):
            if pid and pid in [p["pid"] for p in self.cfg["turn"]["people"]]:
                self.turn_ovr[day] = pid
            else:
                self.turn_ovr.pop(day, None)
            t = dt_util.now().date().isoformat()
            self.turn_ovr = {k: v for k, v in self.turn_ovr.items() if k >= t}
            self._save()
        return await self.snapshot()

    async def async_done_all(self, how: str = "tipp", who: str = "") -> dict[str, Any]:
        now = dt_util.now()
        today, minute = now.date(), now.hour * 60 + now.minute
        keys = self._due(today, minute, 1) if minute >= _tm(self.cfg["time"]) or not self._due(today, minute, 0) else self._due(today, minute, 0)
        for k in keys:
            nxt = next_for(self.ev, k, today, minute, until_min(self.kind(k)))
            if nxt:
                self.done[k] = nxt
                self._hist_add(k, nxt, "out", how, who)
                await self._bag_use(k)
        if keys:
            self._save()
            await self._tick(None)
        return await self.snapshot()

    async def async_in(self, k: str) -> dict[str, Any]:
        """C3: Tonne ist wieder drin. Ohne Art: alle, die rein müssen."""
        now = dt_util.now()
        for kk, d in back_list(self.cfg["kinds"], self.done, self.inn, now.date(), now.hour * 60 + now.minute):
            if not k or kk == k:
                self.inn[kk] = d
                self._hist_add(kk, d, "in")
        if k and k not in self.inn and self.done.get(k):
            self.inn[k] = self.done[k]
        self._save()
        return await self.snapshot()

    async def async_undo(self, k: str) -> dict[str, Any]:
        d = self.done.pop(k, None)
        if d:
            self._hist_add(k, d, "undo")
            bg = self.cfg["bags"]
            if bg["on"] and k == bg["kind"] and self.bags is not None:
                self.bags += bg["per"]
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

    def _rows(self, today: date, minute: int) -> list[dict[str, Any]]:
        ev_min = _tm(self.cfg["time"])
        back = dict(back_list(self.cfg["kinds"], self.done, self.inn, today, minute)) if self.cfg["back"]["on"] else {}
        rows = []
        for kd in self.cfg["kinds"]:
            if not kd["on"]:
                continue
            nx = next_for(self.ev, kd["id"], today, minute, until_min(kd))
            rows.append({"k": kd["id"], "name": kd["name"], "color": kd["color"], "img": kd["img"], "pre": kd["pre"], "next": nx,
                         "days": (date.fromisoformat(nx) - today).days if nx else None,
                         "state": "back" if kd["id"] in back and self.done.get(kd["id"]) != nx else "skip" if nx and self.skip.get(kd["id"]) == nx else bin_state(nx, today, minute, ev_min, self.done.get(kd["id"])),
                         "back_d": back.get(kd["id"])})
        rows.sort(key=lambda r: (r["state"] != "back", r["next"] is None, r["next"] or ""))
        return rows

    def _turn_rows(self, today: date) -> list[dict[str, Any]]:
        t = today.isoformat()
        out = []
        km = kmap(self.cfg["kinds"])
        for d in [x for x in pickup_dates(self.ev, self.cfg["kinds"]) if x >= t][:5]:
            w = self.who_for(d)
            ks = [b for dd, b in self.ev if dd == d and b in km and km[b]["on"] and self.skip.get(b) != d]
            if w and ks:
                out.append({"d": d, "pid": w["pid"], "name": w["name"], "ovr": d in self.turn_ovr, "kinds": ks})
        return out[:4]

    def _hist_rows(self, today: date) -> list[dict[str, Any]]:
        """B6: die letzten Abholungen seit Beginn des Verlaufs mit Status je Abfallart."""
        t = today.isoformat()
        km = kmap(self.cfg["kinds"])
        by = {(h["d"], h["k"]): h for h in self.hist if h["act"] in ("out", "skip")}
        ins = {(h["d"], h["k"]): h for h in self.hist if h["act"] == "in"}
        rows = []
        for d, b in reversed(self.ev):
            if d > t or (self.hist_since and d < self.hist_since) or b not in km:
                continue
            h = by.get((d, b))
            rows.append({"d": d, "k": b, "st": h["act"] if h else "none", "how": (h or {}).get("how", ""), "who": (h or {}).get("who", ""), "ts": (h or {}).get("ts", 0),
                         "in": bool(ins.get((d, b)))})
            if len(rows) >= 10:
                break
        return rows

    def _vac_notes(self, today: date) -> list[dict[str, str]]:
        vac = self.vacation() if self.cfg["vac"] else None
        if not vac or vac[1] < today.isoformat() or (date.fromisoformat(vac[0]) - today).days > 21:
            return []
        vp = vacation_pickups(self.ev, self.cfg["kinds"], vac[0], vac[1], today)
        if not vp:
            return []
        items = ", ".join(f"{(self.kind(b) or {}).get('name', b)} {_dm(date.fromisoformat(d))}" for d, b in vp[:5])
        f, t = date.fromisoformat(vac[0]), date.fromisoformat(vac[1])
        return [{"k": "vac", "text": f"Urlaub {f.day}.{f.month}.–{t.day}.{t.month}.: Es wird abgeholt: {items}. Vorher rausstellen oder jemanden bitten."}]

    def _wx_extra(self, today: date) -> list[dict[str, str]]:
        out = []
        if self.cfg["wxmode"] == "shift" and self.wx_shift >= today.isoformat():
            out.append({"k": "storm", "text": f"Wegen Sturm erst am Abholtag früh rausstellen. Erinnerung um {self.cfg['morning']['time']} Uhr."})
        wm = self.hass.data.get(DOMAIN, {}).get("wetter")
        st = ((getattr(wm, "st", {}) or {}).get("heat") or {}) if wm is not None else {}
        if self.cfg["wx"] and (st.get("a") or st.get("ahead")) and any(b == "bio" for d, b in self.ev if 0 <= (date.fromisoformat(d) - today).days <= 2):
            out.append({"k": "heat", "text": "Hitze: Biotonne in den Schatten stellen und Deckel geschlossen halten."})
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
        back = dict(back_list(self.cfg["kinds"], self.done, self.inn, today, minute)) if self.cfg["back"]["on"] else {}
        rows = self._rows(today, minute)
        self.publish(rows)
        due = self._due(today, minute)
        special = [{"k": "pre", "bin": s["k"], "d": s["d"], "text": f"{s['name']} in {s['days']} Tagen ({_dm(date.fromisoformat(s['d']))}). Rechtzeitig vorbereiten."}
                   for s in upcoming_special(self.ev, self.cfg["kinds"], today)]
        out.update({
            "bins": rows, "month": {"y": today.year, "m": today.month, "d": month_days(self.ev, today.year, today.month), "today": today.day},
            "stats": stats(self.ev, today, self.cfg["cost"]["incl"], self.cfg["cost"]["fee"], self.cfg["cost"]["count"],
                           {h["d"] for h in self.hist if h["k"] == "rest" and h["act"] == "out"}, {h["d"] for h in self.hist if h["k"] == "rest" and h["act"] == "skip"} | ({self.skip["rest"]} if self.skip.get("rest") else set()),
                           self.hist_since) if self.cfg["cost"]["on"] else None,
            "ev": [list(x) for x in self.ev], "today": today.isoformat(), "minute": minute, "ev_min": ev_min,
            "until": {k["id"]: until_min(k) for k in self.cfg["kinds"]},
            "notes": self._vac_notes(today) + self._wx_extra(today) + special + shift_notes(self.ev, today, self.cfg["kinds"]) + self._wx_notes(due), "n_events": len(self.ev),
            "unknown": unknown_list(self.unknown, today), "now": now.isoformat(timespec="minutes"),
            "snooze": bool(self.snooze_until), "snooze_until": dt_util.as_local(dt_util.utc_from_timestamp(self.snooze_until)).strftime("%H:%M") if self.snooze_until else "",
            "year": year_stats(self.ev, self.cfg["kinds"], self.hist, today, self.hist_since), "prev_year": self.years.get(str(today.year - 1)),
            "bags": self.bags, "ents": (sorted([f"sensor.{ENT_PRE}_{k}" for k in self._vals.get("sensor", {})] + [f"binary_sensor.{ENT_PRE}_{k}" for k in self._vals.get("binary_sensor", {})]) if self.cfg["ha"] else []),
            "ents_real": bool(self.hass.data.get(DOMAIN, {}).get("muell_ent")),
            "turn": self._turn_rows(today) if self.cfg["turn"]["on"] else [], "hist": self._hist_rows(today), "api_v": API_V,
            "people": [{"pid": e, "name": self._name(e)} for e in (self.hass.states.async_entity_ids("person") if hasattr(self.hass.states, "async_entity_ids") else [])][:12],
            "light_on": self.light_on, "back": [{"k": k, "d": d} for k, d in back.items()],
            "cached": self.ev_cached and bool(self.ev),
            "ev_ok": dt_util.as_local(dt_util.utc_from_timestamp(self.ev_ok)).strftime("%d.%m. %H:%M") if self.ev_ok else "",
        })
        return out
