"""Modul 21 Saugroboter: reine Rechenfunktionen (ohne Home Assistant, gut testbar)."""
from __future__ import annotations

import re
import unicodedata
from typing import Any

DAY = 86400
RUNS_KEEP = 1500            # so viele Fahrten bleiben gespeichert (gut ein Jahr bei 3–4 Fahrten am Tag)
RUN_DAYS = 400
PENDING_S = 300             # ein Raumbefehl zählt für die nächste Fahrt, wenn sie innerhalb von 5 Minuten startet
DEF_DAYS = 3

STATE_TXT = {
    "cleaning": "reinigt", "docked": "an der Station", "returning": "fährt zur Station", "paused": "pausiert",
    "idle": "bereit", "error": "Fehler", "unavailable": "nicht erreichbar", "unknown": "unbekannt",
}
ACTIVE = ("cleaning", "returning", "paused")

# Verschleißteile: Teil im Namen der Entität → (Anzeige, Lebensdauer in Stunden, Sortierung)
PARTS: list[tuple[str, str, float, int]] = [
    ("main_brush", "Hauptbürste", 300, 1), ("side_brush", "Seitenbürste", 200, 2), ("filter", "Filter", 150, 3),
    ("sensor", "Sensoren reinigen", 30, 4), ("strainer", "Sieb der Station", 150, 5), ("mop", "Wischtuch", 180, 6),
    ("dust_bag", "Staubbeutel", 0, 7), ("cleaning_brush", "Reinigungsbürste Station", 300, 8),
]


def norm(s: Any) -> str:
    s = unicodedata.normalize("NFKD", str(s or "").lower())
    s = s.replace("ß", "ss")
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "", s)


ALIAS = {  # Robotername (oft englisch) → deutscher Raumname
    "kitchen": "kuche", "livingroom": "wohnzimmer", "living": "wohnzimmer", "bedroom": "schlafzimmer", "masterbedroom": "schlafzimmer",
    "bathroom": "bad", "bath": "bad", "hallway": "flur", "corridor": "flur", "hall": "flur", "office": "buro", "study": "arbeitszimmer",
    "diningroom": "esszimmer", "dining": "esszimmer", "kidsroom": "kinderzimmer", "childrensroom": "kinderzimmer", "nursery": "kinderzimmer",
    "guestroom": "gastezimmer", "laundry": "hwr", "utilityroom": "hwr", "toilet": "wc", "entrance": "eingang", "balcony": "balkon",
}


def name_key(s: Any) -> str:
    k = norm(s)
    k = ALIAS.get(k, k)
    k = {"badezimmer": "bad", "kueche": "kuche", "buero": "buro", "hauswirtschaftsraum": "hwr", "diele": "flur", "gaestezimmer": "gastezimmer"}.get(k, k)
    for suf in ("zimmer", "raum"):
        if k.endswith(suf) and len(k) > len(suf) + 2 and k not in ("wohnzimmer", "schlafzimmer", "kinderzimmer", "arbeitszimmer", "esszimmer", "gastezimmer"):
            k = k[: -len(suf)]
    return k


def match_areas(names: dict[str, str], areas: list[dict[str, Any]]) -> dict[str, str]:
    """Raum-Namen des Roboters {segment: name} → {segment: area_id} über den Namen."""
    by = {}
    for a in areas:
        by.setdefault(name_key(a["name"]), a["id"])
        by.setdefault(norm(a["id"]), a["id"])
    out = {}
    for seg, nm in names.items():
        aid = by.get(name_key(nm)) or by.get(norm(nm))
        if aid:
            out[str(seg)] = aid
    return out


def hours(state: Any, unit: str) -> float | None:
    try:
        v = float(state)
    except (TypeError, ValueError):
        return None
    if v != v:
        return None
    u = (unit or "").lower()
    return v / 3600 if u in ("s", "sec") else v / 60 if u == "min" else v * 24 if u == "d" else v


def part_of(key: str) -> tuple[str, str, float, int] | None:
    k = key.lower()
    if "time_left" not in k and "remaining" not in k and "life" not in k and not k.endswith("_left"):
        return None
    for p in PARTS:
        if p[0] in k:
            return p
    return None


def consumable(key: str, state: Any, unit: str) -> dict[str, Any] | None:
    p = part_of(key)
    if p is None:
        return None
    if (unit or "") == "%":
        try:
            pct = max(0.0, min(100.0, float(state)))
        except (TypeError, ValueError):
            return None
        return {"k": p[0], "name": p[1], "pct": round(pct), "left_h": None, "o": p[3]}
    h = hours(state, unit)
    if h is None:
        return None
    pct = round(max(0.0, min(100.0, h / p[2] * 100))) if p[2] else None
    return {"k": p[0], "name": p[1], "pct": pct, "left_h": round(h, 1), "o": p[3]}


def due_state(last: float | None, days: float, now: float) -> dict[str, Any]:
    if not last:
        return {"st": "never", "age_d": None, "ratio": None}
    age = max(0.0, (now - last) / DAY)
    r = age / max(0.25, days)
    st = "ok" if r < 0.8 else "soon" if r < 1 else "due" if r < 2 else "over"
    return {"st": st, "age_d": round(age, 2), "ratio": round(r, 2)}


def prune_runs(runs: list[dict[str, Any]], now: float) -> list[dict[str, Any]]:
    lim = now - RUN_DAYS * DAY
    return [r for r in runs if (r.get("t1") or r.get("t0") or 0) >= lim][-RUNS_KEEP:]


def week(runs: list[dict[str, Any]], now: float, tz_off: float = 0) -> list[dict[str, Any]]:
    """Fahrten der letzten 7 Tage (heute zuletzt), je Tag mit Start/Ende in Stunden (lokal)."""
    out = []
    today = int((now + tz_off) // DAY)
    for d in range(today - 6, today + 1):
        lo, hi = d * DAY - tz_off, (d + 1) * DAY - tz_off
        rs = []
        for r in runs:
            t0, t1 = r.get("t0") or 0, r.get("t1") or now
            if t1 < lo or t0 >= hi:
                continue
            rs.append({"h0": round(max(0.0, (t0 - lo) / 3600), 2), "h1": round(min(24.0, (t1 - lo) / 3600), 2), "rob": r.get("rob", ""), "areas": r.get("areas", []),
                       "err": r.get("err", ""), "src": r.get("src", ""), "open": not r.get("t1")})
        out.append({"day": d, "runs": rs})
    return out


def stats(runs: list[dict[str, Any]], now: float, days: int = 7) -> dict[str, Any]:
    rs = [r for r in runs if (r.get("t0") or 0) >= now - days * DAY and r.get("t1")]
    return {"n": len(rs), "min": round(sum((r["t1"] - r["t0"]) / 60 for r in rs)), "m2": round(sum(float(r.get("m2") or 0) for r in rs)), "err": sum(1 for r in rs if r.get("err"))}


def credit(run: dict[str, Any]) -> list[str]:
    """Welche Räume eine beendete Fahrt als gereinigt zählt: besuchte Räume, sonst die geplanten."""
    if run.get("visited"):
        return list(dict.fromkeys(run["visited"]))
    if run.get("err"):
        return []
    return list(dict.fromkeys(run.get("areas") or []))
