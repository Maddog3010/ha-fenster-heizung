"""Modul 18 Licht & Lampen: reine Logik ohne Home Assistant (testbar).

Build 2 (Konzept „Modul 18 · Licht & Lampen“, Teil C3, C4, C9):
  * Lichtfarbe richtig lesen: Kelvin → RGB, hs/xy/rgb der Lampe, Mischfarbe eines Raums nach Helligkeit gewichtet
  * Lichtgruppen erkennen (entity_id-Liste) und die Gruppe finden, die genau eine Lampenauswahl abdeckt
  * Einschaltzeiten, die einen Neustart überstehen, und Brennstunden je Lampe und Tag
"""
from __future__ import annotations

import math
import re
from datetime import datetime, timedelta, tzinfo
from typing import Any, Callable, Iterable

DAYS_KEEP = 90          # Brennstunden-Verlauf in Tagen
GAP_MAX = 30 * 60       # Lücke (z. B. Neustart), die noch als „war an“ zählt, in Sekunden
WARM = (255, 179, 107)  # Standard-Lichtfarbe, wenn eine Lampe nichts meldet (≈ 2700 K)


# ---------------------------------------------------------------- Farbe
def kelvin_rgb(k: float) -> tuple[int, int, int]:
    """Farbtemperatur in Kelvin → RGB (Näherung nach Tanner Helland, 1000–40000 K)."""
    t = max(1000.0, min(40000.0, float(k))) / 100.0
    if t <= 66:
        r = 255.0
        g = 99.4708025861 * math.log(t) - 161.1195681661
        b = 0.0 if t <= 19 else 138.5177312231 * math.log(t - 10) - 305.0447927307
    else:
        r = 329.698727446 * ((t - 60) ** -0.1332047592)
        g = 288.1221695283 * ((t - 60) ** -0.0755148492)
        b = 255.0
    c = lambda v: int(max(0, min(255, round(v))))  # noqa: E731
    return c(r), c(g), c(b)


def hs_rgb(h: float, s: float) -> tuple[int, int, int]:
    """Farbton (0–360) und Sättigung (0–100) bei voller Helligkeit → RGB."""
    h, s = float(h) % 360 / 60.0, max(0.0, min(100.0, float(s))) / 100.0
    i, f = int(h), h - int(h)
    p, q, t = 1 - s, 1 - s * f, 1 - s * (1 - f)
    r, g, b = [(1, t, p), (q, 1, p), (p, 1, t), (p, q, 1), (t, p, 1), (1, p, q)][i % 6]
    return round(r * 255), round(g * 255), round(b * 255)


def xy_rgb(x: float, y: float) -> tuple[int, int, int]:
    """CIE xy → RGB (sRGB, auf volle Helligkeit normiert)."""
    x, y = float(x), max(1e-6, float(y))
    X, Z = x / y, (1 - x - y) / y
    r, g, b = 3.2406 * X - 1.5372 - 0.4986 * Z, -0.9689 * X + 1.8758 + 0.0415 * Z, 0.0557 * X - 0.2040 + 1.0570 * Z
    gam = lambda v: 12.92 * v if v <= 0.0031308 else 1.055 * (v ** (1 / 2.4)) - 0.055  # noqa: E731
    r, g, b = (gam(max(0.0, v)) for v in (r, g, b))
    m = max(r, g, b, 1e-6)
    return round(r / m * 255), round(g / m * 255), round(b / m * 255)


def lamp_rgb(attrs: dict[str, Any]) -> tuple[int, int, int]:
    """Lichtfarbe einer Lampe aus ihren Attributen. Reihenfolge wie Home Assistant: color_mode zuerst."""
    a = attrs or {}
    mode = a.get("color_mode")
    try:
        if mode == "color_temp" and a.get("color_temp_kelvin"):
            return kelvin_rgb(a["color_temp_kelvin"])
        if isinstance(a.get("rgb_color"), (list, tuple)) and len(a["rgb_color"]) >= 3:
            return tuple(int(max(0, min(255, v))) for v in a["rgb_color"][:3])  # type: ignore[return-value]
        if isinstance(a.get("hs_color"), (list, tuple)) and len(a["hs_color"]) >= 2:
            return hs_rgb(*a["hs_color"][:2])
        if isinstance(a.get("xy_color"), (list, tuple)) and len(a["xy_color"]) >= 2:
            return xy_rgb(*a["xy_color"][:2])
        if a.get("color_temp_kelvin"):
            return kelvin_rgb(a["color_temp_kelvin"])
    except (TypeError, ValueError):
        pass
    return WARM


def mix(lamps: Iterable[tuple[tuple[int, int, int], float]]) -> tuple[int, int, int] | None:
    """Mischfarbe: Mittel der Farben, gewichtet nach Helligkeit (0–100). None, wenn nichts leuchtet."""
    sr = sg = sb = w = 0.0
    for (r, g, b), br in lamps:
        k = max(0.0, float(br))
        sr, sg, sb, w = sr + r * k, sg + g * k, sb + b * k, w + k
    if w <= 0:
        return None
    return round(sr / w), round(sg / w), round(sb / w)


def hex_rgb(c: tuple[int, int, int] | None) -> str:
    return "" if c is None else "#%02x%02x%02x" % c


# ---------------------------------------------------------------- Gruppen
def members(attrs: dict[str, Any]) -> list[str]:
    """Mitglieder einer Lichtgruppe (Gruppen-Helfer, Hue-Raum, Zigbee-Gruppe). Leer = keine Gruppe."""
    m = (attrs or {}).get("entity_id")
    return [e for e in m if isinstance(e, str) and e.startswith("light.")] if isinstance(m, (list, tuple)) else []


def group_for(ids: Iterable[str], groups: dict[str, list[str]]) -> str | None:
    """Gruppe, deren Mitglieder genau die gewünschten Lampen sind (dann schaltet alles gleichzeitig).
    Bei mehreren passenden die mit dem kleinsten Namen, damit das Ergebnis stabil ist."""
    want = set(ids)
    if len(want) < 2:
        return None
    hit = sorted(g for g, m in groups.items() if set(m) == want)
    return hit[0] if hit else None


def plan_switch(ids: list[str], groups: dict[str, list[str]]) -> list[str]:
    """Welche Entitäten für „diese Lampen schalten“ aufgerufen werden: eine Gruppe, wenn sie genau passt,
    sonst Gruppen, die vollständig in der Auswahl liegen, plus die übrigen Lampen einzeln."""
    want = list(dict.fromkeys(ids))
    g = group_for(want, groups)
    if g:
        return [g]
    rest, out = set(want), []
    for name, m in sorted(groups.items(), key=lambda x: (-len(x[1]), x[0])):
        if len(m) >= 2 and set(m) <= rest:
            out.append(name)
            rest -= set(m)
    return out + [e for e in want if e in rest]


# ---------------------------------------------------------------- Einschaltzeit und Brennstunden
def day_key(ts: float, tz: tzinfo) -> str:
    return datetime.fromtimestamp(ts, tz).date().isoformat()


def split_days(t0: float, t1: float, tz: tzinfo) -> list[tuple[str, float]]:
    """Zeitraum [t0, t1) in Sekunden je Kalendertag (Ortszeit) zerlegen."""
    out: list[tuple[str, float]] = []
    t = t0
    while t < t1:
        d = datetime.fromtimestamp(t, tz)
        nxt = (d.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)).timestamp()
        end = min(t1, nxt)
        out.append((d.date().isoformat(), end - t))
        t = end
    return out


class Burn:
    """Einschaltzeiten und Brennstunden.

    on[eid]  = Zeitpunkt (epoch s), seit dem die Lampe an ist – bleibt über einen Neustart erhalten
    cut[eid] = bis wann die Brenndauer schon gezählt ist
    days[tag][eid] = Sekunden
    """

    def __init__(self, tz: tzinfo, data: dict[str, Any] | None = None) -> None:
        self.tz = tz
        d = data if isinstance(data, dict) else {}
        num = lambda m: {str(k): float(v) for k, v in (m or {}).items() if isinstance(v, (int, float)) and v > 0}  # noqa: E731
        self.on: dict[str, float] = num(d.get("on"))
        self.cut: dict[str, float] = num(d.get("cut"))
        self.days: dict[str, dict[str, float]] = {}
        for k, v in (d.get("days") or {}).items():
            if isinstance(k, str) and len(k) == 10 and isinstance(v, dict):
                self.days[k] = num(v)

    def dump(self) -> dict[str, Any]:
        return {"on": self.on, "cut": self.cut, "days": {k: {e: round(s) for e, s in v.items()} for k, v in self.days.items()}}

    def _add(self, eid: str, t0: float, t1: float) -> None:
        if t1 <= t0:
            return
        for day, s in split_days(t0, t1, self.tz):
            row = self.days.setdefault(day, {})
            row[eid] = row.get(eid, 0.0) + s

    def start(self, eid: str, now: float, since: float | None = None) -> None:
        if eid in self.on:
            return
        t = min(now, since) if since else now
        self.on[eid] = t
        self.cut[eid] = t

    def stop(self, eid: str, now: float) -> None:
        if eid not in self.on:
            return
        self._add(eid, self.cut.get(eid, self.on[eid]), now)
        self.on.pop(eid, None)
        self.cut.pop(eid, None)

    def tick(self, now: float) -> None:
        """Brenndauer der eingeschalteten Lampen bis jetzt zählen (jede Minute)."""
        for eid, t_on in self.on.items():
            c = self.cut.get(eid, t_on)
            self._add(eid, c, now)
            self.cut[eid] = now

    def resume(self, lit: dict[str, float | None], now: float) -> None:
        """Nach dem Start: lit = {Lampe: last_changed} der Lampen, die jetzt an sind.

        * Lampe war an und ist noch an → Einschaltzeit bleibt. Die Lücke seit dem letzten Zählen zählt nur mit,
          wenn sie kurz war (GAP_MAX), sonst wird ab jetzt weitergezählt.
        * Lampe ist jetzt an, aber unbekannt → an seit last_changed (besser als nichts)
        * Lampe war an, ist jetzt aus → beendet beim letzten Zählen
        """
        for eid in [e for e in self.on if e not in lit]:
            self.on.pop(eid, None)   # bis cut ist schon gezählt, die Zeit danach ist unbekannt
            self.cut.pop(eid, None)
        for eid, lc in lit.items():
            if eid in self.on:
                c = self.cut.get(eid, self.on[eid])
                if now - c <= GAP_MAX:
                    self._add(eid, c, now)
                self.cut[eid] = now
            else:
                self.start(eid, now, lc)

    def prune(self, now: float, keep: Callable[[str], bool] | None = None) -> None:
        cut = day_key(now - DAYS_KEEP * 86400, self.tz)
        for k in [k for k in self.days if k < cut]:
            self.days.pop(k, None)
        if keep is not None:
            for eid in [e for e in self.on if not keep(e)]:
                self.on.pop(eid, None)
                self.cut.pop(eid, None)

    def today(self, now: float) -> dict[str, float]:
        return dict(self.days.get(day_key(now, self.tz)) or {})

    def week(self, now: float) -> list[dict[str, Any]]:
        """Die letzten 7 Tage (ältester zuerst), Summe der Brennstunden aller Lampen."""
        out = []
        for i in range(6, -1, -1):
            k = day_key(now - i * 86400, self.tz)
            out.append({"day": k, "h": round(sum((self.days.get(k) or {}).values()) / 3600, 2)})
        return out


# ---------------------------------------------------------------- Einstellungen des Addons
VIEWS = ("rooms", "list", "plan")  # „plan“ = Grundriss als Lichtkarte (ab Build 4)
OPTIK = ("neu", "alt")


def clean_prefs(raw: Any) -> dict[str, Any]:
    r = raw if isinstance(raw, dict) else {}
    return {"view": r.get("view") if r.get("view") in VIEWS else "rooms", "optik": r.get("optik") if r.get("optik") in OPTIK else "neu"}


_ID = re.compile(r"^[A-Za-z0-9_.:-]{1,32}$")


def clean_pmap(raw: Any) -> dict[str, str]:
    """Zuordnung Grundriss-Raum (Modul 11) → Bereich in Home Assistant (ab Build 4).
    Wert = Bereichs-ID oder „-“ (Fläche gehört zu keinem Bereich). Fehlt ein Eintrag, gilt die Zuordnung über den Namen."""
    if not isinstance(raw, dict):
        return {}
    out: dict[str, str] = {}
    for k, v in raw.items():
        if len(out) >= 200:
            break
        if isinstance(k, str) and _ID.match(k) and isinstance(v, str) and v and (v == "-" or _ID.match(v[:64])):
            out[k] = v[:64]
    return out


# ---------------------------------------------------------------- Meine Lampen (Build 6)
KINDS = ("decke", "steh", "spot", "streifen", "aussen", "tisch")
MODES = ("", "auto", "mine")   # "" = noch nicht entschieden (verhält sich wie "auto"), "mine" = nur hinzugefügte Lampen
LAMPS_MAX = 150
_LENT = re.compile(r"^light\.[a-z0-9_]{1,80}$")
_AREA = re.compile(r"^[A-Za-z0-9_.:-]{1,64}$")


def guess_kind(name: str) -> str:
    """Art aus dem Namen erraten (nur als Vorschlag beim Hinzufügen)."""
    n = str(name or "").lower()
    for k, words in (("streifen", ("streifen", "strip", "leiste", "led-band", "ledbox", "lightstrip")), ("steh", ("steh", "floor")), ("spot", ("spot", "strahler", "einbau")),
                     ("aussen", ("außen", "aussen", "garten", "terrasse", "wand", "outdoor")), ("tisch", ("tisch", "nacht", "lese", "desk"))):
        if any(w in n for w in words):
            return k
    return "decke"


def clean_lamps(raw: Any) -> list[dict[str, Any]]:
    """Meine Lampen: e (light.*), n (eigener Name, leer = Name aus Home Assistant), room (Bereichs-ID, leer = wie in Home Assistant),
    k (Art), alloff (bei „Alle aus“ mitschalten). Doppelte Entitäten zählen einmal."""
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    for x in raw if isinstance(raw, list) else []:
        if len(out) >= LAMPS_MAX:
            break
        if not isinstance(x, dict):
            continue
        e = x.get("e")
        if not (isinstance(e, str) and _LENT.match(e)) or e in seen:
            continue
        seen.add(e)
        room = x.get("room") if isinstance(x.get("room"), str) and _AREA.match(x.get("room") or "") else ""
        out.append({"e": e, "n": str(x.get("n") or "").strip()[:40], "room": room, "k": x.get("k") if x.get("k") in KINDS else "decke", "alloff": x.get("alloff") is not False})
    return out


def clean_ignored(raw: Any) -> list[str]:
    return [e for e in (raw if isinstance(raw, list) else []) if isinstance(e, str) and _LENT.match(e)][:300]


def clean_legacy(raw: Any) -> dict[str, Any] | None:
    """Kopie der bisherigen Einstellungen aus dem Layout (layout.li), so wie Build 1 sie gespeichert hat."""
    if not isinstance(raw, dict):
        return None
    sc = raw.get("scenes") if isinstance(raw.get("scenes"), dict) else {}
    return {"scenes": {k: str(sc.get(k) or "")[:80] for k in ("night", "arrive", "cozy")},
            "hours": raw.get("hours") if raw.get("hours") in (1, 2, 4) else 2,
            "hidden": [str(x)[:64] for x in raw.get("hidden") or [] if isinstance(x, str)][:60]}


# ---- Regeln (Build 8): Bewegung → Licht, Alle weg → Alle aus, Alarm → Licht an, Abends → Licht an
RULE_T = ("motion", "away", "alarm", "sun")
RULES_MAX = 40
LOG_MAX = 40
_BENT = re.compile(r"^binary_sensor\.[a-z0-9_]{1,80}$")
_SENT = re.compile(r"^sensor\.[a-z0-9_]{1,80}$")
_HM = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")
_RID = re.compile(r"^[A-Za-z0-9_-]{1,20}$")


def _int(v: Any, lo: int, hi: int, d: int) -> int:
    try:
        return max(lo, min(hi, int(v)))
    except (TypeError, ValueError):
        return d


def _ents(raw: Any, rx: re.Pattern[str], n: int) -> list[str]:
    out: list[str] = []
    for e in raw if isinstance(raw, list) else []:
        if isinstance(e, str) and rx.match(e) and e not in out:
            out.append(e)
    return out[:n]


def clean_rules(raw: Any) -> list[dict[str, Any]]:
    """Regeln prüfen. Gemeinsam: id, t (Art), on (an/aus), n (eigener Name). Je Art eigene Felder mit Grenzen und Vorgaben."""
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    for x in raw if isinstance(raw, list) else []:
        if len(out) >= RULES_MAX or not isinstance(x, dict) or x.get("t") not in RULE_T:
            continue
        rid = x.get("id")
        if not (isinstance(rid, str) and _RID.match(rid)) or rid in seen:
            continue
        seen.add(rid)
        t = x["t"]
        r: dict[str, Any] = {"id": rid, "t": t, "on": x.get("on") is not False, "n": str(x.get("n") or "").strip()[:40],
                             "room": x.get("room") if isinstance(x.get("room"), str) and _AREA.match(x.get("room") or "") else "",
                             "lamps": _ents(x.get("lamps"), _LENT, 30)}
        if t == "motion":
            r.update(sensors=_ents(x.get("sensors"), _BENT, 6), cond=x.get("cond") if x.get("cond") in ("dark", "always") else "dark",
                     lux=x.get("lux") if isinstance(x.get("lux"), str) and _SENT.match(x.get("lux") or "") else "",
                     lux_max=_int(x.get("lux_max"), 0, 2000, 30), off_min=_int(x.get("off_min"), 0, 120, 5),
                     bri=_int(x.get("bri"), 0, 100, 0), night_bri=_int(x.get("night_bri"), 0, 100, 0))
        elif t == "away":
            r.update(delay_min=_int(x.get("delay_min"), 0, 120, 10))
        elif t == "alarm":
            r.update(off_end=x.get("off_end") is not False)
        elif t == "sun":
            off = x.get("off") if isinstance(x.get("off"), str) and (x.get("off") in ("", "sunrise") or _HM.match(x.get("off"))) else "23:00"
            r.update(offset=_int(x.get("offset"), -120, 120, 0), off=off)
        out.append(r)
    return out


def hm(dt: datetime) -> int:
    return dt.hour * 60 + dt.minute


def parse_hm(s: str) -> int | None:
    return int(s[:2]) * 60 + int(s[3:]) if isinstance(s, str) and _HM.match(s) else None


NIGHT = (22 * 60, 6 * 60)   # nachts gedimmt: 22–6 Uhr


def is_night(dt: datetime) -> bool:
    m = hm(dt)
    return m >= NIGHT[0] or m < NIGHT[1]


def is_dark(sun_state: str | None, lux: float | None, lux_max: int) -> bool:
    """Dunkel: mit Helligkeitssensor nach Lux, sonst nach dem Sonnenstand (unter dem Horizont)."""
    if lux is not None:
        return lux <= lux_max
    return sun_state != "above_horizon"


def motion_step(rule: dict[str, Any], now: float, now_dt: datetime, motion: bool, last_motion: float | None, dark: bool,
                lamps_on: dict[str, bool], mine: set[str]) -> tuple[str, list[str], int | None] | None:
    """Ein Schritt für „Bewegung → Licht“. Schaltet nur Lampen an, die aus sind, und schaltet später nur die wieder aus, die die
    Regel selbst angemacht hat (von Hand eingeschaltete bleiben an). Ergebnis: ("on"|"off", Lampen, Helligkeit) oder None."""
    lamps = [e for e in rule.get("lamps") or [] if e in lamps_on]
    if motion:
        if rule.get("cond") == "dark" and not dark:
            return None
        ids = [e for e in lamps if not lamps_on[e]]
        if not ids:
            return None
        bri = rule.get("night_bri") if rule.get("night_bri") and is_night(now_dt) else rule.get("bri")
        return ("on", ids, bri or None)
    off = rule.get("off_min") or 0
    if off and mine and last_motion is not None and now - last_motion >= off * 60:
        ids = [e for e in lamps if e in mine and lamps_on.get(e)]
        return ("off", ids, None) if ids else ("forget", [], None)
    return None


def away_step(rule: dict[str, Any], home: int, persons: int, away_since: float | None, now: float, fired: bool) -> bool:
    """„Alle weg → Alle aus“: feuert einmal, wenn es Personen gibt, keine zu Hause ist und die Wartezeit um ist."""
    if persons <= 0 or home > 0 or away_since is None or fired:
        return False
    return now - away_since >= (rule.get("delay_min") or 0) * 60


def sun_step(rule: dict[str, Any], now_dt: datetime, sunset: datetime | None, sunrise_next: datetime | None, done: dict[str, str]) -> str | None:
    """„Abends Licht an“: an zum Sonnenuntergang (+/− Versatz), aus zur Uhrzeit oder zum Sonnenaufgang. done merkt je Tag, was schon lief
    ({"on": "2026-11-22", "off": "2026-11-22"}), damit ein Neustart nichts doppelt schaltet."""
    if sunset is None:
        return None
    day = now_dt.date().isoformat()
    start = sunset + timedelta(minutes=rule.get("offset") or 0)
    off = rule.get("off") or ""
    stop: datetime | None = None
    if off == "sunrise":
        stop = sunrise_next
    elif parse_hm(off) is not None:
        m = parse_hm(off)
        stop = now_dt.replace(hour=m // 60, minute=m % 60, second=0, microsecond=0)
        if stop <= start:
            stop += timedelta(days=1)
    if stop is not None and now_dt >= stop and done.get("on") and done.get("off") != done.get("on"):
        return "off"
    if now_dt >= start and (stop is None or now_dt < stop) and done.get("on") != day:
        return "on"
    return None


def rule_text(r: dict[str, Any], n_lamps: int, room_name: str) -> str:
    """Ein Satz, der die Regel beschreibt (für Liste und Protokoll)."""
    lp = f"{n_lamps} Lampe{'' if n_lamps == 1 else 'n'}"
    if r["t"] == "motion":
        s = f"Bewegung{' · ' + room_name if room_name else ''} → {lp} an{', wenn dunkel' if r.get('cond') == 'dark' else ''}"
        return s + (f", aus nach {r['off_min']} Min. ohne Bewegung" if r.get("off_min") else "")
    if r["t"] == "away":
        return f"Alle weg{' seit ' + str(r['delay_min']) + ' Min.' if r.get('delay_min') else ''} → Alle aus"
    if r["t"] == "alarm":
        return f"Alarm in Modul 11 → {lp} an, volle Helligkeit{', danach wieder aus' if r.get('off_end') else ''}"
    off = r.get("off") or ""
    o = r.get("offset") or 0
    return f"Sonnenuntergang{(' ' + ('+' if o > 0 else '−') + str(abs(o)) + ' Min.') if o else ''} → {lp} an" + (
        ", aus bei Sonnenaufgang" if off == "sunrise" else f", aus um {off} Uhr" if off else "")
