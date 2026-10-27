"""Modul 4 (Gerätestrom) und Modul 8 (Elektroauto): reine Rechen- und Prüffunktionen ohne Home-Assistant-Importe."""
from __future__ import annotations

import re
from datetime import date
from typing import Any

SOURCES = ("solar", "battery", "grid")
MAX_DEVICES = 8
MAX_NOTIFY = 8
KEEP_DAYS = 800
DEFAULT_TYPICAL_W = 1500.0

_ENTITY = re.compile(r"^[a-z_]+\.[a-z0-9_]+$")
_NOTIFY = re.compile(r"^notify\.[a-z0-9_]+$")
_ID = re.compile(r"^[a-z0-9]{1,16}$")

EV_BRANDS = ("Mercedes-Benz", "Audi", "VW", "BYD", "BMW", "Andere")
EV_BODIES = ("limousine", "suv", "kombi", "kompakt")
EV_COLORS = ("blue", "red", "white", "black", "silver", "green")
EV_KEYS = ("soc", "odo", "range", "plug", "power", "charging")
EV_DOMAINS = {
    "soc": ("sensor",), "odo": ("sensor",), "range": ("sensor",), "power": ("sensor",),
    "plug": ("binary_sensor", "sensor", "switch"), "charging": ("binary_sensor", "sensor", "switch"),
}


# --------------------------------------------------------------------------- Rechnen
def split_power(g: float, s: float, b: float, n: float) -> dict[str, float]:
    """Geräteleistung g anteilig auf Solar (s), Batterie (b) und Netz (n) verteilen."""
    g, s, b, n = max(g, 0.0), max(s, 0.0), max(b, 0.0), max(n, 0.0)
    t = s + b + n
    if t <= 0:
        return {"solar": 0.0, "battery": 0.0, "grid": g}
    return {"solar": g * s / t, "battery": g * b / t, "grid": g * n / t}


def money(d_kwh: float, source: str, price: float, feed: float, bat_cost: float) -> tuple[float, float]:
    """Kosten und Ersparnis (in €) für d_kwh aus einer Quelle. Preise in €/kWh."""
    if source == "grid":
        return d_kwh * price, 0.0
    if source == "solar":
        return 0.0, d_kwh * (price - feed)
    return 0.0, d_kwh * (price - bat_cost)


def solar_for_house(pv: float, charge: float, export: float) -> float:
    """Solarleistung fürs Haus: Gesamterzeugung abzüglich Batterie-Ladeleistung und Einspeisung."""
    return max(max(pv, 0.0) - max(charge, 0.0) - max(export, 0.0), 0.0)


def free_solar(estimate_w: float, others_solar_w: float) -> float:
    return max(estimate_w - max(others_solar_w, 0.0), 0.0)


def cover_pct(estimate_w: float, typical_w: float) -> float:
    if typical_w <= 0:
        return 0.0
    return max(0.0, min(estimate_w / typical_w, 1.0)) * 100


def advice(cover: float) -> str:
    if cover >= 70:
        return "Jetzt starten"
    if cover >= 30:
        return "Teilweise Solar"
    return "Besser warten"


def watts(state: str | None, unit: str | None) -> float | None:
    """Zahlenwert eines Sensors in Watt (kW wird umgerechnet); None bei ungültigem Wert."""
    if state in (None, "", "unknown", "unavailable"):
        return None
    try:
        v = float(str(state).replace(",", "."))
    except ValueError:
        return None
    return v * 1000 if unit == "kW" else v


def rate_eur(value: float, unit: str | None) -> float:
    """Preis aus einem Sensor in €/kWh (Cent-Angaben werden umgerechnet)."""
    u = (unit or "").lower()
    if re.search(r"ct|cent", u):
        return value / 100
    return value if (re.search(r"€|eur", u) or value < 5) else value / 100


def grid_import_w(value: float, sign: str) -> float:
    """Netzleistung in Watt; positiv = Bezug. sign „import“: Bezug ist positiv, sonst Einspeisung."""
    return value if sign == "import" else -value


# --------------------------------------------------------------------------- Zeiträume
def new_day() -> list[float]:
    """[solar, battery, grid (kWh), Kosten €, Ersparnis €, Durchläufe]."""
    return [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]


def prune_days(days: dict[str, list[float]], today: date) -> None:
    cutoff = today.toordinal() - KEEP_DAYS
    for k in [k for k in days if _ord(k) < cutoff]:
        del days[k]


def _ord(key: str) -> int:
    try:
        return date.fromisoformat(key).toordinal()
    except ValueError:
        return 0


def period_sum(days: dict[str, list[float]], prefix: str) -> dict[str, float]:
    """Summe aller Tage, deren Schlüssel mit prefix beginnt („2026-10-27“, „2026-10“, „2026“, „“)."""
    t = new_day()
    for k, v in days.items():
        if k.startswith(prefix):
            for i in range(6):
                t[i] += v[i]
    return {"kwh": t[0] + t[1] + t[2], "cost": t[3], "saved": t[4], "runs": t[5]}


def clean_days(raw: Any) -> dict[str, list[float]]:
    out: dict[str, list[float]] = {}
    if not isinstance(raw, dict):
        return out
    for k, v in raw.items():
        if not (isinstance(k, str) and re.match(r"^\d{4}-\d{2}-\d{2}$", k) and isinstance(v, list) and len(v) == 6):
            continue
        try:
            out[k] = [max(float(x), 0.0) for x in v]
        except (TypeError, ValueError):
            continue
    return out


def history(days: dict[str, list[float]]) -> list[dict[str, Any]]:
    return [{"d": k, "s": round(v[0], 4), "b": round(v[1], 4), "g": round(v[2], 4), "cost": round(v[3], 4), "saved": round(v[4], 4)}
            for k, v in sorted(days.items())]


# --------------------------------------------------------------------------- Prüfen
def _entity(v: Any, domains: tuple[str, ...]) -> str:
    return v if isinstance(v, str) and len(v) <= 120 and _ENTITY.match(v) and v.split(".")[0] in domains else ""


def _text(v: Any, n: int) -> str:
    return re.sub(r"[<>\"'&]", "", str(v or "").strip())[:n]


def _num(v: Any, lo: float, hi: float, default: float) -> float:
    try:
        x = float(v)
    except (TypeError, ValueError):
        return default
    return min(max(x, lo), hi)


def clean_gs(raw: Any) -> dict[str, Any]:
    """Einstellungen von Modul 4 (Gerätestrom)."""
    raw = raw if isinstance(raw, dict) else {}
    devices: list[dict[str, Any]] = []
    seen: set[str] = set()
    for d in (raw.get("devices") or [])[:MAX_DEVICES] if isinstance(raw.get("devices"), list) else []:
        if not isinstance(d, dict):
            continue
        did = str(d.get("id") or "")
        if not _ID.match(did) or did in seen:
            continue
        seen.add(did)
        devices.append({
            "id": did, "name": _text(d.get("name"), 30) or "Gerät", "ent": _entity(d.get("ent"), ("sensor",)),
            "thr": int(_num(d.get("thr"), 1, 500, 20)), "end": int(_num(d.get("end"), 1, 120, 5)),
        })
    notify: list[str] = []
    for n in raw.get("notify") if isinstance(raw.get("notify"), list) else []:
        if isinstance(n, str) and _NOTIFY.match(n) and n not in notify and len(notify) < MAX_NOTIFY:
            notify.append(n)
    return {"devices": devices, "bat_cost": round(_num(raw.get("bat_cost"), 0, 100, 0.0), 2),
            "forecast": _entity(raw.get("forecast"), ("sensor",)), "notify": notify}


def clean_ev(raw: Any) -> dict[str, Any]:
    """Einstellungen von Modul 8 (Elektroauto & Wallbox)."""
    raw = raw if isinstance(raw, dict) else {}
    ent_raw = raw.get("ent") if isinstance(raw.get("ent"), dict) else {}
    brand = raw.get("brand")
    body, color = raw.get("body"), raw.get("color")
    return {
        "brand": brand if brand in EV_BRANDS else "",
        "model": _text(raw.get("model"), 30),
        "body": body if body in EV_BODIES else "limousine",
        "color": color if color in EV_COLORS else "blue",
        "ent": {k: _entity(ent_raw.get(k), EV_DOMAINS[k]) for k in EV_KEYS},
    }
