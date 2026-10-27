"""Modul 8: Laderegelung der Wallbox – reine Rechenlogik (ohne Home-Assistant-Importe)."""
from __future__ import annotations

import ipaddress
import math
import re
from datetime import datetime, timedelta
from typing import Any

VOLT = 230.0
MODES = ("off", "pv", "minpv", "now")
PHASE_MODES = ("auto", "1", "3")
PLAN_DAYS = ("all", "wk", "we")
PLAN_STRATS = ("mix", "sun", "price")
PLAN_SRCS = ("auto", "tibber", "sensor")
PV_SRCS = ("forecast", "sensor")
PHASE_HOLD_S = 600  # so lange bleibt eine Phasenumschaltung bestehen
EXTERN_HOLD_S = 1800  # Pause, wenn jemand die Wallbox von Hand umstellt

# go-e API v2: car 1 = frei, 2 = lädt, 3 = wartet aufs Auto, 4 = fertig; frc 0 = neutral, 1 = aus, 2 = an; psm 1 = 1 Phase, 2 = 3 Phasen
CAR_IDLE, CAR_CHARGING, CAR_WAIT, CAR_DONE = 1, 2, 3, 4

DEFAULT: dict[str, Any] = {
    "ip": "", "enabled": False, "mode": "off", "minA": 6, "maxA": 16, "ph": "auto", "startW": 1400,
    "onMin": 1, "offMin": 3, "limit": 80, "plan": False, "planSoc": 80, "planTime": "07:00", "planDays": "all",
    "cap": 60, "batOn": True, "batSoc": 30, "priceOn": False, "priceMax": 18,
    "lock": False, "reset": True, "vehicles": [], "guest": {"mode": "off", "limit": 80},
    "planOn": False, "planStrat": "mix", "planSrc": "auto", "pvSrc": "forecast", "baseW": 400,
}
MAX_VEHICLES = 6
MAX_CARDS = 10


def _int(v: Any, lo: int, hi: int, d: int) -> int:
    try:
        return min(max(int(round(float(v))), lo), hi)
    except (TypeError, ValueError, OverflowError):
        return d


def valid_host(host: Any) -> str:
    """Nur Adressen im lokalen Netz: private IPv4/IPv6 oder ein einfacher Rechnername. Sonst leer."""
    h = str(host or "").strip()
    if not h or len(h) > 64:
        return ""
    try:
        ip = ipaddress.ip_address(h)
        return h if (ip.is_private or ip.is_link_local) and not ip.is_loopback and not ip.is_multicast and not ip.is_unspecified else ""
    except ValueError:
        pass
    return h if re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9-]{0,40}(\.(local|lan|fritz\.box|home|internal))?", h) else ""


def clean_wb(raw: Any) -> dict[str, Any]:
    raw = raw if isinstance(raw, dict) else {}
    d = DEFAULT
    out: dict[str, Any] = {
        "ip": valid_host(raw.get("ip")),
        "enabled": bool(raw.get("enabled", False)),
        "mode": raw.get("mode") if raw.get("mode") in MODES else "off",
        "ph": raw.get("ph") if raw.get("ph") in PHASE_MODES else "auto",
        "planDays": raw.get("planDays") if raw.get("planDays") in PLAN_DAYS else "all",
        "plan": bool(raw.get("plan", False)),
        "batOn": bool(raw.get("batOn", True)),
        "priceOn": bool(raw.get("priceOn", False)),
        "planOn": bool(raw.get("planOn", False)),
        "planStrat": raw.get("planStrat") if raw.get("planStrat") in PLAN_STRATS else "mix",
        "planSrc": raw.get("planSrc") if raw.get("planSrc") in PLAN_SRCS else "auto",
        "pvSrc": raw.get("pvSrc") if raw.get("pvSrc") in PV_SRCS else "forecast",
    }
    out["baseW"] = _int(raw.get("baseW"), 0, 3000, d["baseW"])
    out["minA"] = _int(raw.get("minA"), 6, 16, d["minA"])
    out["maxA"] = max(_int(raw.get("maxA"), 6, 16, d["maxA"]), out["minA"])
    out["startW"] = _int(raw.get("startW"), 500, 8000, d["startW"])
    out["onMin"] = _int(raw.get("onMin"), 0, 15, d["onMin"])
    out["offMin"] = _int(raw.get("offMin"), 0, 30, d["offMin"])
    out["limit"] = _int(raw.get("limit"), 50, 100, d["limit"])
    out["planSoc"] = _int(raw.get("planSoc"), 20, 100, d["planSoc"])
    t = str(raw.get("planTime", d["planTime"]))
    out["planTime"] = t if re.fullmatch(r"([01]\d|2[0-3]):[0-5]\d", t) else d["planTime"]
    out["cap"] = _int(raw.get("cap"), 10, 120, d["cap"])
    out["batSoc"] = _int(raw.get("batSoc"), 0, 100, d["batSoc"])
    out["priceMax"] = _int(raw.get("priceMax"), 1, 80, d["priceMax"])
    out["lock"] = bool(raw.get("lock", False))
    out["reset"] = bool(raw.get("reset", True))
    out["vehicles"] = clean_vehicles(raw.get("vehicles"))
    g = raw.get("guest") if isinstance(raw.get("guest"), dict) else {}
    out["guest"] = {"mode": g.get("mode") if g.get("mode") in MODES else "off", "limit": _int(g.get("limit"), 50, 100, 80)}
    return out


def clean_vehicles(raw: Any) -> list[dict[str, Any]]:
    """Fahrzeuge mit Kennungen (Kartennummern der Wallbox). Eine Karte gehört zu höchstens einem Fahrzeug."""
    out: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    used: set[int] = set()
    for v in (raw if isinstance(raw, list) else [])[:MAX_VEHICLES]:
        if not isinstance(v, dict):
            continue
        vid = str(v.get("id") or "")
        if not re.fullmatch(r"[a-z0-9]{1,12}", vid) or vid in seen_ids:
            continue
        seen_ids.add(vid)
        ids: list[int] = []
        for i in (v.get("ids") if isinstance(v.get("ids"), list) else []):
            try:
                n = int(i)
            except (TypeError, ValueError):
                continue
            if 1 <= n <= MAX_CARDS and n not in used and n not in ids:
                ids.append(n)
        used.update(ids)
        name = re.sub(r"[<>\"'&]", "", str(v.get("name") or "")).strip()[:30] or "Fahrzeug"
        out.append({"id": vid, "name": name, "ids": ids, "mode": v.get("mode") if v.get("mode") in MODES else "pv", "limit": _int(v.get("limit"), 50, 100, 80)})
    return out


def resolve_who(cfg: dict[str, Any], card: int | None) -> dict[str, Any] | None:
    """Wer lädt? card = Kartennummer (1 bis 10) oder None. Rückgabe: kind (vehicle/guest), name, mode, limit."""
    if card is None:
        return None
    for v in cfg["vehicles"]:
        if card in v["ids"]:
            return {"kind": "vehicle", "name": v["name"], "card": card, "mode": v["mode"], "limit": v["limit"]}
    g = cfg["guest"]
    return {"kind": "guest", "name": "Gastfahrzeug", "card": card, "mode": g["mode"], "limit": g["limit"]}


def parse_nrg(nrg: Any) -> dict[str, float | None]:
    """Leistung (W), Strom (A) und Phasen aus dem nrg-Feld der go-e.

    Index 0-3: Spannung L1-L3, N; 4-6: Strom L1-L3; 7-10: Leistung L1-L3, N; 11: Gesamtleistung.
    Die Gesamtleistung wird gegen Spannung mal Strom geprüft, weil die Einheit je nach Gerät abweichen kann.
    """
    if not isinstance(nrg, (list, tuple)) or len(nrg) < 7:
        return {"power": None, "amp": None, "phases": None}
    try:
        u = [float(nrg[i]) for i in range(3)]
        i_ = [float(nrg[i]) for i in range(4, 7)]
    except (TypeError, ValueError):
        return {"power": None, "amp": None, "phases": None}
    calc = sum(a * b for a, b in zip(u, i_))
    power = None
    if len(nrg) > 11:
        try:
            power = float(nrg[11])
        except (TypeError, ValueError):
            power = None
    if power is None or (calc > 200 and not 0.5 * calc <= power <= 2.0 * calc) or (calc <= 200 and power > 400):
        power = calc
    phases = sum(1 for a in i_ if a > 1.0)
    return {"power": max(power, 0.0), "amp": max(i_) if i_ else None, "phases": phases or None}


def phases_for(cfg: dict[str, Any], surplus_w: float, cur_ph: int | None) -> int:
    """1 oder 3 Phasen: fest nach Einstellung, bei „auto“ nach Überschuss mit etwas Abstand zur Schwelle."""
    if cfg["ph"] == "1":
        return 1
    if cfg["ph"] == "3":
        return 3
    need3 = VOLT * 3 * cfg["minA"]
    if cur_ph == 3:
        return 3 if surplus_w >= need3 * 0.95 else 1
    return 3 if surplus_w >= need3 * 1.1 else 1


def plan_due(cfg: dict[str, Any], soc: float | None, now: datetime) -> tuple[bool, float, datetime | None]:
    """(muss jetzt geladen werden?, fehlende kWh, spätester Start). Ohne Ladestand keine Planung."""
    if not cfg["plan"] or soc is None:
        return False, 0.0, None
    need = max(0.0, (cfg["planSoc"] - soc) / 100 * cfg["cap"])
    if need <= 0.2:
        return False, 0.0, None
    h, m = (int(x) for x in cfg["planTime"].split(":"))
    target = now.replace(hour=h, minute=m, second=0, microsecond=0)
    if target <= now:
        target += timedelta(days=1)
    wd = target.weekday()
    if (cfg["planDays"] == "wk" and wd > 4) or (cfg["planDays"] == "we" and wd < 5):
        return False, need, None
    ph = 1 if cfg["ph"] == "1" else 3
    kw = ph * VOLT * cfg["maxA"] / 1000
    start = target - timedelta(minutes=math.ceil(need / kw * 60 * 1.1) + 5)
    return now >= start, need, start


def decide(cfg: dict[str, Any], inp: dict[str, Any], mem: dict[str, Any], now_ts: float, now: datetime) -> dict[str, Any]:
    """Wunschzustand der Wallbox.

    inp: car, surplus_w (None = unbekannt), soc, bat_ok, price_ct, cur_ph (Phasen, die gerade geladen werden)
    mem: above_since, below_since, ph_change_ts (werden fortgeschrieben)
    Rückgabe: frc (1 aus, 2 an), amp, psm (1 oder 2), reason (Text), state (Kurzstatus)
    """
    car, soc = inp.get("car"), inp.get("soc")
    surplus = inp.get("surplus_w")
    out = {"frc": 1, "amp": cfg["minA"], "psm": 2 if cfg["ph"] != "1" else 1, "reason": "", "state": "aus", "ph": 1 if cfg["ph"] == "1" else 3}
    if cfg["mode"] == "off":
        out["reason"] = "Modus „Aus“: Die Wallbox lädt nicht."
        mem["above_since"] = mem["below_since"] = None
        return out
    if car == CAR_DONE:
        out["reason"] = "Das Auto meldet „fertig geladen“."
        out["state"] = "fertig"
        return out
    if soc is not None and soc >= cfg["limit"]:
        out["reason"] = f"Ladelimit von {cfg['limit']} % erreicht."
        out["state"] = "limit"
        return out
    due, need, _start = plan_due(cfg, soc, now)
    cheap = bool(cfg["priceOn"] and inp.get("price_ct") is not None and inp["price_ct"] <= cfg["priceMax"])
    if cfg["mode"] == "now" or (due and cfg["mode"] in ("pv", "minpv")) or (cheap and cfg["mode"] in ("pv", "minpv")):
        ph = 1 if cfg["ph"] == "1" else 3
        out.update(frc=2, amp=cfg["maxA"], psm=1 if ph == 1 else 2, ph=ph, state="voll")
        out["reason"] = ("Schnellladen mit dem höchsten Ladestrom." if cfg["mode"] == "now" else
                         "Ladeplan: Ohne Netzstrom würde das Ziel nicht rechtzeitig erreicht." if due else
                         f"Strompreis unter {cfg['priceMax']} ct/kWh: Es wird mit Netzstrom geladen.")
        mem["above_since"] = mem["below_since"] = None
        return out
    # Laden mit Überschuss
    if surplus is None:
        surplus = 0.0
    if not inp.get("bat_ok", True):
        surplus = 0.0
        out["reason"] = f"Die Hausbatterie lädt zuerst (unter {cfg['batSoc']} %). "
    charging = car == CAR_CHARGING
    ph = phases_for(cfg, surplus, inp.get("cur_ph") if charging else None)
    last = mem.get("ph_change_ts")
    cur_ph = inp.get("cur_ph")
    if charging and cur_ph in (1, 3) and ph != cur_ph and last is not None and now_ts - last < PHASE_HOLD_S:
        ph = cur_ph  # Phasen nicht zu oft umschalten
    amp = min(cfg["maxA"], int(surplus // (VOLT * ph)))
    out.update(ph=ph, psm=1 if ph == 1 else 2)
    if cfg["mode"] == "minpv":
        out.update(frc=2, amp=min(cfg["maxA"], max(cfg["minA"], amp)), state="minpv", reason=out["reason"] + f"Mindestens {cfg['minA']} A, mehr bei Überschuss.")
        mem["above_since"] = mem["below_since"] = None
        return out
    enough = amp >= cfg["minA"] and surplus >= cfg["startW"] if not charging else amp >= cfg["minA"]
    if enough:
        mem["below_since"] = None
        if not charging:
            mem["above_since"] = mem.get("above_since") or now_ts
            if now_ts - mem["above_since"] < cfg["onMin"] * 60:
                out.update(frc=1, state="wartet", reason=out["reason"] + f"Der Überschuss muss {cfg['onMin']} Min. durchgehend da sein.")
                return out
        out.update(frc=2, amp=max(cfg["minA"], amp), state="pv", reason=out["reason"] + f"{max(cfg['minA'], amp)} A auf {ph} {'Phase' if ph == 1 else 'Phasen'}, nach dem Überschuss geregelt.")
        return out
    mem["above_since"] = None
    if charging:
        mem["below_since"] = mem.get("below_since") or now_ts
        if now_ts - mem["below_since"] < cfg["offMin"] * 60:
            out.update(frc=2, amp=cfg["minA"], state="pv", reason=out["reason"] + f"Zu wenig Überschuss. Mindeststrom, Stopp nach {cfg['offMin']} Min.")
            return out
    out.update(frc=1, state="wartet", reason=out["reason"] + f"Wartet auf mindestens {max(cfg['startW'], round(VOLT * ph * cfg['minA']))} W Überschuss.")
    return out


def commands(want: dict[str, Any], cur: dict[str, Any]) -> dict[str, int]:
    """Nur die Werte, die sich gegenüber der Wallbox wirklich ändern."""
    cmd: dict[str, int] = {}
    if want["frc"] != cur.get("frc"):
        cmd["frc"] = want["frc"]
    if want["frc"] == 2:
        if want["amp"] != cur.get("amp"):
            cmd["amp"] = want["amp"]
        if want["psm"] != cur.get("psm"):
            cmd["psm"] = want["psm"]
    return cmd
