"""Sponsor Max · Extras 2026.11.4.4b4: reine Rechenfunktionen (ohne Home-Assistant-Importe, testbar).

Wohnklima-Zeugnis (Build 2)
  Je Raum und Tag werden Zähler gesammelt (alle 5 Minuten eine Probe, siehe mx_extras.py):
    n   Proben insgesamt          tn/to  Proben mit Soll-Temperatur / davon im Bereich ±1 °C
    hn/ho  Proben mit Feuchte / davon im Bereich 40–60 %
    rk  Proben mit Schimmelrisiko  st  Stoßlüften (3–20 Min. offen)  kp  Minuten Dauerkipp (> 30 Min. offen beim Heizen)
    w/h  Fenster- bzw. Feuchtesensor vorhanden
  Daraus entstehen Schulnoten 1–6 je Fach, die Raumnote (Schimmel zählt doppelt) und die Hausnote (nach Fläche gewichtet).

Heizkosten je Raum (Build 3)
  ix  geschätzte Wärme (kWh) aus Heizlast des Raums × Ventilöffnung × Zeit – Grundlage der Verteilung
  ce  Kosten dieser Wärme ohne Zähler (€)          ek/ee  Elektroheizer kWh / €   em  Elektroheizer gemessen
  wk/we/wm  Wärmeverlust bei offenem Fenster (kWh) / € / Minuten
  Tageswerte des Hauses unter "_": mk/me  Zähler-kWh / € der zentralen Heizung (wenn ein Zähler gewählt ist).
"""
from __future__ import annotations

import math
from typing import Any, Iterable

SAMPLE_MIN = 5  # Minuten je Probe
PER_H = 60 // SAMPLE_MIN
WORDS = {1: "sehr gut", 2: "gut", 3: "befriedigend", 4: "ausreichend", 5: "mangelhaft", 6: "ungenügend"}
FACH = ("temperatur", "feuchte", "lueften", "schimmel")
FACH_NAME = {"temperatur": "Temperatur", "feuchte": "Luftfeuchte", "lueften": "Lüften", "schimmel": "Schimmelrisiko"}

# Grundwerte, je Raum änderbar
DEF_LIMITS = {"td": 1.0, "hlo": 40.0, "hhi": 60.0, "wall": 4.0}
RH_RISK = 70.0  # ab dieser Feuchte zählt eine Stunde als Risiko
DEW_MARGIN = 3.0  # K Abstand Taupunkt – Wand
STOSS = (3, 20)  # Minuten
KIPP_FROM = 30  # ab so vielen Minuten offen zählt die Zeit als Dauerkipp
MIN_DAYS = {"week": 5, "month": 20}
DAY_MIN_SAMPLES = 6 * PER_H  # ein Tag zählt ab 6 Stunden Daten

# Heizkosten
ACH = {"tilt": 2.0, "open": 10.0}
TILT_AFTER = 20  # Minuten: ohne Kippkontakt gilt ein offenes Fenster danach als gekippt
EFF = {"erdgas": 0.9, "fluessiggas": 0.9, "heizoel": 0.85, "pellets": 0.85, "fern": 1.0}
DEF_PRICE_CT = {"erdgas": 12.0, "fluessiggas": 14.0, "heizoel": 11.0, "pellets": 8.0, "fern": 15.0}
ROOM_H = 2.5
SAVE_PER_K = 0.06  # Faustwert: 1 °C weniger ≈ 6 %


def word(g: float | None) -> str:
    if g is None:
        return ""
    return WORDS[min(6, max(1, int(round(g))))]


def pct_grade(p: float) -> int:
    """Anteil der Zeit im Bereich (0–1) → Note."""
    for lim, g in ((0.9, 1), (0.8, 2), (0.65, 3), (0.5, 4), (0.3, 5)):
        if p >= lim:
            return g
    return 6


def risk_grade(h_week: float) -> int:
    for lim, g in ((0, 1), (2, 2), (6, 3), (12, 4), (24, 5)):
        if h_week <= lim + 1e-9:
            return g
    return 6


def air_grade(per_day: float, kipp_h_week: float) -> int:
    if per_day <= 0 or kipp_h_week >= 40:
        return 6
    if 2 <= per_day <= 4 and kipp_h_week < 1:
        return 1
    if 1 <= per_day <= 5 and kipp_h_week < 4:
        return 2
    if per_day >= 1 and kipp_h_week < 10:
        return 3
    if kipp_h_week < 20:
        return 4
    return 5


def dewpoint(t: float, rh: float) -> float:
    """Taupunkt nach Magnus (°C)."""
    rh = min(max(rh, 1.0), 100.0)
    a, b = 17.62, 243.12
    g = math.log(rh / 100.0) + a * t / (b + t)
    return b * g / (a - g)


def is_risk(t: float | None, rh: float | None, wall_off: float = DEF_LIMITS["wall"]) -> bool:
    if rh is None:
        return False
    if rh > RH_RISK:
        return True
    if t is None:
        return False
    return (t - wall_off) - dewpoint(t, rh) < DEW_MARGIN


def limits(raw: Any) -> dict[str, float]:
    out = dict(DEF_LIMITS)
    if isinstance(raw, dict):
        for k, (lo, hi) in {"td": (0.3, 3.0), "hlo": (20.0, 60.0), "hhi": (40.0, 80.0), "wall": (0.0, 10.0)}.items():
            try:
                out[k] = min(max(float(raw[k]), lo), hi)
            except (KeyError, TypeError, ValueError):
                pass
    if out["hhi"] <= out["hlo"]:
        out["hhi"] = out["hlo"] + 5
    return out


def empty_wk() -> dict[str, Any]:
    return {"n": 0, "tn": 0, "to": 0, "hn": 0, "ho": 0, "rk": 0, "st": 0, "kp": 0.0, "w": False, "h": False}


def add_sample(d: dict[str, Any], *, t: float | None, target: float | None, rh: float | None, lim: dict[str, float],
               has_win: bool, win_open: bool) -> None:
    """Eine 5-Minuten-Probe in die Tageszähler eines Raums schreiben (Lüften zählt close_window())."""
    d["n"] += 1
    d["w"] = d["w"] or has_win
    d["h"] = d["h"] or rh is not None
    if t is not None and target is not None and not win_open:
        d["tn"] += 1
        if abs(t - target) <= lim["td"]:
            d["to"] += 1
    if rh is not None:
        d["hn"] += 1
        if lim["hlo"] <= rh <= lim["hhi"]:
            d["ho"] += 1
        if is_risk(t, rh, lim["wall"]):
            d["rk"] += 1


def close_window(d: dict[str, Any], minutes: float, heat_minutes: float) -> None:
    """Ein Fenster wurde nach ``minutes`` geschlossen; ``heat_minutes`` davon lief die Heizung."""
    if STOSS[0] <= minutes <= STOSS[1]:
        d["st"] += 1
    if minutes > KIPP_FROM:
        d["kp"] = round(d["kp"] + max(0.0, min(heat_minutes, minutes - KIPP_FROM)), 1)


def sum_days(days: Iterable[dict[str, Any]]) -> tuple[dict[str, Any], int]:
    tot, n = empty_wk(), 0
    for d in days:
        if not d or d.get("n", 0) < DAY_MIN_SAMPLES:
            continue
        n += 1
        for k in ("n", "tn", "to", "hn", "ho", "rk", "st", "kp"):
            tot[k] += d.get(k, 0)
        tot["w"] = tot["w"] or bool(d.get("w"))
        tot["h"] = tot["h"] or bool(d.get("h"))
    return tot, n


def subjects(tot: dict[str, Any], days: int) -> dict[str, int | None]:
    if days <= 0:
        return {k: None for k in FACH}
    wk = 7.0 / days
    return {
        "temperatur": pct_grade(tot["to"] / tot["tn"]) if tot["tn"] else None,
        "feuchte": pct_grade(tot["ho"] / tot["hn"]) if tot["hn"] else None,
        "lueften": air_grade(tot["st"] / days, tot["kp"] / 60.0 * wk) if tot["w"] else None,
        "schimmel": risk_grade(tot["rk"] / PER_H * wk) if tot["h"] else None,
    }


def room_grade(sub: dict[str, int | None]) -> float | None:
    w = {"temperatur": 1, "feuchte": 1, "lueften": 1, "schimmel": 2}
    s = sum(w[k] * v for k, v in sub.items() if v is not None)
    n = sum(w[k] for k, v in sub.items() if v is not None)
    return round(s / n, 1) if n else None


def house_grade(rows: list[tuple[float | None, float]]) -> float | None:
    """(Raumnote, Fläche) → Hausnote; ohne Flächen gleich gewichtet."""
    ok = [(g, a) for g, a in rows if g is not None]
    if not ok:
        return None
    if all(a > 0 for _, a in ok):
        return round(sum(g * a for g, a in ok) / sum(a for _, a in ok), 1)
    return round(sum(g for g, _ in ok) / len(ok), 1)


def tip(name: str, sub: dict[str, int | None], tot: dict[str, Any], days: int, dehum: bool = False, win_eur: float = 0.0) -> str:
    """Ein Satz zum schlechtesten Fach (nur wenn es schlechter als 2 ist)."""
    worst = max(((v, k) for k, v in sub.items() if v is not None), default=None)
    if not worst or worst[0] <= 2:
        return ""
    k = worst[1]
    if k == "schimmel":
        t = f"{name}: Feuchte oft zu hoch – nach Duschen oder Kochen 5–10 Min. ganz öffnen statt kippen."
        return t + (" Der Luftentfeuchter hilft hier." if dehum else "")
    if k == "lueften":
        kh = tot["kp"] / 60.0
        if kh >= 1:
            t = f"{name}: Fenster war ca. {kh:.0f} h gekippt, während geheizt wurde – lieber 2–4× kurz stoßlüften."
            return t + (f" Das kostete ca. {win_eur:.2f} €.".replace(f"{win_eur:.2f}", f"{win_eur:.2f}".replace(".", ",")) if win_eur >= 0.1 else "")
        return f"{name}: Zu selten gelüftet – 2–4× am Tag 5–10 Min. reicht."
    if k == "feuchte":
        return f"{name}: Luftfeuchte oft außerhalb 40–60 % – regelmäßig stoßlüften."
    return f"{name}: Temperatur weicht oft vom Heizplan ab – Thermostat und Heizplan prüfen."


# ---------------------------------------------------------------- Heizkosten
def empty_hk() -> dict[str, Any]:
    return {"ix": 0.0, "ce": 0.0, "ek": 0.0, "ee": 0.0, "em": False, "wk": 0.0, "we": 0.0, "wm": 0.0}


def valve(state: str | None, attrs: dict[str, Any] | None) -> float:
    """Ventilöffnung 0–1 eines Thermostats; ohne Ventilwert zählt „heizt“ als 100 %."""
    a = attrs or {}
    for k in ("valve_position", "pi_heating_demand", "heating_power_request", "valve", "position"):
        v = a.get(k)
        if isinstance(v, (int, float)) and not isinstance(v, bool):
            return min(max(float(v) / (100.0 if v > 1 else 1.0), 0.0), 1.0)
    act = a.get("hvac_action")
    if act is not None:
        return 1.0 if act == "heating" else 0.0
    if state in ("heat", "auto"):
        cur, tg = a.get("current_temperature"), a.get("temperature")
        if isinstance(cur, (int, float)) and isinstance(tg, (int, float)):
            return 1.0 if cur < tg - 0.2 else 0.0
    return 0.0


def ach(kind: str, minutes_open: float) -> float:
    if kind in ACH:
        return ACH[kind]
    return ACH["open"] if minutes_open < TILT_AFTER else ACH["tilt"]


def window_kwh(air_change: float, area: float, height: float, t_in: float, t_out: float, hours: float) -> float:
    """Lüftungsverlust Q = 0,34 Wh/(m³·K) × n × V × ΔT × t."""
    dt = max(t_in - t_out, 0.0)
    return 0.34 * air_change * area * height * dt * hours / 1000.0


def room_cost(day: dict[str, Any], house: dict[str, Any], six: float) -> dict[str, float]:
    """Kosten eines Raums an einem Tag: zentrale Heizung (nach Anteil oder Schätzung) + Elektroheizer."""
    if house.get("mk", 0) > 0 and six > 0:
        central = house.get("me", 0.0) * day.get("ix", 0.0) / six
        meas = True
    else:
        central = day.get("ce", 0.0)
        meas = False
    elec = day.get("ee", 0.0)
    win = min(day.get("we", 0.0), central + elec)  # Teil der Raumkosten, nie mehr als diese
    return {"central": central, "elec": elec, "win": win, "meter": meas, "elec_meas": bool(day.get("em"))}


def period_costs(days: dict[str, dict[str, Any]]) -> dict[str, Any]:
    """Tage {datum: {raum: hk, "_": haus}} → Summen je Raum, getrennt nach gemessen und geschätzt."""
    rooms: dict[str, dict[str, float]] = {}
    for _d, rows in days.items():
        house = rows.get("_") or {}
        six = sum(v.get("ix", 0.0) for k, v in rows.items() if k != "_")
        for rid, row in rows.items():
            if rid == "_":
                continue
            c = room_cost(row, house, six)
            r = rooms.setdefault(rid, {"eur": 0.0, "meas": 0.0, "est": 0.0, "win": 0.0, "wm": 0.0, "kwh": 0.0, "elec": 0.0})
            r["eur"] += c["central"] + c["elec"]
            r["elec"] += c["elec"]
            r["win"] += c["win"]
            r["wm"] += row.get("wm", 0.0)
            r["kwh"] += row.get("ix", 0.0) + row.get("ek", 0.0)
            r["meas" if c["elec_meas"] else "est"] += c["elec"]
            r["est"] += c["central"]  # Anteil an der Zentralheizung ist immer eine Schätzung
    for r in rooms.values():
        for k in r:
            r[k] = round(r[k], 2)
    return rooms


def what_if(eur: float, k: float = 1.0) -> float:
    return round(eur * SAVE_PER_K * k, 2)
