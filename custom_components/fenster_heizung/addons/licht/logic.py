"""Modul 18 Licht & Lampen: reine Logik ohne Home Assistant (testbar).

Build 2 (Konzept „Modul 18 · Licht & Lampen“, Teil C3, C4, C9):
  * Lichtfarbe richtig lesen: Kelvin → RGB, hs/xy/rgb der Lampe, Mischfarbe eines Raums nach Helligkeit gewichtet
  * Lichtgruppen erkennen (entity_id-Liste) und die Gruppe finden, die genau eine Lampenauswahl abdeckt
  * Einschaltzeiten, die einen Neustart überstehen, und Brennstunden je Lampe und Tag
"""
from __future__ import annotations

import math
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
VIEWS = ("rooms", "list")
OPTIK = ("neu", "alt")


def clean_prefs(raw: Any) -> dict[str, Any]:
    r = raw if isinstance(raw, dict) else {}
    return {"view": r.get("view") if r.get("view") in VIEWS else "rooms", "optik": r.get("optik") if r.get("optik") in OPTIK else "neu"}


def clean_legacy(raw: Any) -> dict[str, Any] | None:
    """Kopie der bisherigen Einstellungen aus dem Layout (layout.li), so wie Build 1 sie gespeichert hat."""
    if not isinstance(raw, dict):
        return None
    sc = raw.get("scenes") if isinstance(raw.get("scenes"), dict) else {}
    return {"scenes": {k: str(sc.get(k) or "")[:80] for k in ("night", "arrive", "cozy")},
            "hours": raw.get("hours") if raw.get("hours") in (1, 2, 4) else 2,
            "hidden": [str(x)[:64] for x in raw.get("hidden") or [] if isinstance(x, str)][:60]}
