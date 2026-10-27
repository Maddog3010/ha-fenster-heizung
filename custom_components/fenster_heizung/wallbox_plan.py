"""Modul 8: Ladeplanung nach Strompreis und PV-Prognose sowie Ladestatistik (reine Rechenlogik, ohne Home-Assistant-Importe)."""
from __future__ import annotations

import re
from datetime import date, datetime, timedelta
from typing import Any

STRATS = ("mix", "sun", "price")
LEVEL_RANK = {"VERY_CHEAP": 0, "CHEAP": 1, "NORMAL": 2, "EXPENSIVE": 3, "VERY_EXPENSIVE": 4}
HORIZON_H = 36
KEEP_DAYS = 800
KEEP_SESSIONS = 100


# ---- Zeitraster
def build_slots(now: datetime, pv_kw: dict[datetime, float], prices: list[dict[str, Any]], slot_min: int = 60,
                horizon_h: int = HORIZON_H, flat_ct: float | None = None) -> list[dict[str, Any]]:
    """Zeitraster ab dem aktuellen Slot. pv_kw: Überschuss je Stundenbeginn (kW), prices: [{start, ct, level}].

    Fehlende Preise (zum Beispiel morgen vor 13 Uhr) werden mit dem Mittel der bekannten Preise gefüllt (est = True).
    """
    step = timedelta(minutes=slot_min)
    t = now.replace(minute=0, second=0, microsecond=0)
    if slot_min < 60:
        t = t.replace(minute=(now.minute // slot_min) * slot_min)
    pmap = {p["start"].astimezone(now.tzinfo) if now.tzinfo else p["start"]: p for p in prices}
    known = [p["ct"] for p in prices if p.get("ct") is not None]
    avg = sum(known) / len(known) if known else flat_ct
    out: list[dict[str, Any]] = []
    for _ in range(int(horizon_h * 60 / slot_min)):
        hour = t.replace(minute=0)
        p = pmap.get(t)
        if p is None and slot_min == 60:
            p = pmap.get(hour)
        if p is None and slot_min < 60:  # Stundenpreise auf Viertelstunden verteilen
            p = pmap.get(hour)
        ct = p["ct"] if p is not None else avg
        out.append({
            "t": t, "h": slot_min / 60, "pv": round(max(0.0, pv_kw.get(hour, 0.0)), 2), "price": None if ct is None else round(float(ct), 2),
            "level": (p or {}).get("level"), "est": p is None,
        })
        t += step
    return out


def pv_from_wh(wh_period: dict[Any, Any], base_kw: float, tz: Any) -> dict[datetime, float]:
    """Forecast.Solar (wh_period je Stunde) in Überschuss-kW je Stundenbeginn: Erzeugung minus Grundverbrauch."""
    out: dict[datetime, float] = {}
    for k, v in (wh_period or {}).items():
        try:
            t = k if isinstance(k, datetime) else datetime.fromisoformat(str(k))
            wh = float(v)
        except (TypeError, ValueError):
            continue
        t = t.astimezone(tz) if tz else t
        h = t.replace(minute=0, second=0, microsecond=0)
        out[h] = out.get(h, 0.0) + wh / 1000.0  # Viertelstunden werden zu Stunden addiert
    return {h: max(0.0, kw - base_kw) for h, kw in out.items()}


# ---- Plan
def deadline(now: datetime, until: str) -> datetime:
    h, m = (int(x) for x in until.split(":"))
    dl = now.replace(hour=h, minute=m, second=0, microsecond=0)
    if dl <= now:
        dl += timedelta(days=1)
    return dl


def _cost(slots: list[dict[str, Any]], sel: dict[int, float]) -> dict[str, float]:
    kwh = pv = cost = 0.0
    for i, e in sel.items():
        s = slots[i]
        kw = e / s["h"]
        share = min(1.0, s["pv"] / kw) if kw > 0 else 0.0
        kwh += e
        pv += e * share
        cost += e * (1 - share) * (s["price"] or 0.0) / 100
    return {"kwh": kwh, "pv": pv, "cost": cost}


def plan_calc(slots: list[dict[str, Any]], now: datetime, o: dict[str, Any]) -> dict[str, Any]:
    """Günstigste Ladefenster bis zur Uhrzeit.

    o: strat (mix/sun/price), target (%), soc (%), cap (kWh), until ("HH:MM"), pmax (kW), minkw (kW), rank ("price" oder "level")
    """
    strat, pmax = o["strat"], float(o["pmax"])
    need = max(0.0, (o["target"] - o["soc"]) / 100 * o["cap"])
    dl = deadline(now, o["until"])
    sun, level = strat == "sun", o.get("rank") == "level"
    cand = [i for i, s in enumerate(slots) if s["t"] + timedelta(hours=s["h"]) > now and s["t"] + timedelta(hours=s["h"]) <= dl]

    def pw(i: int) -> float:
        return min(pmax, slots[i]["pv"]) if sun else pmax

    def share(i: int) -> float:
        p = pw(i)
        return min(slots[i]["pv"], p) / p if p > 0 else 0.0

    def key(i: int) -> float:
        s = slots[i]
        price = s["price"] if s["price"] is not None else 0.0
        if sun:
            return -s["pv"]
        base = LEVEL_RANK.get(s.get("level") or "NORMAL", 2) * 100 + price if level else price
        return base if strat == "price" else (LEVEL_RANK.get(s.get("level") or "NORMAL", 2) * 100 if level else 0) + price * (1 - share(i))

    pool = [i for i in cand if not sun or slots[i]["pv"] >= o["minkw"]]
    pool.sort(key=key)
    sel: dict[int, float] = {}
    left = need
    for i in pool:
        if left <= 0.01:
            break
        e = min(pw(i) * slots[i]["h"], left)
        if e <= 0:
            continue
        sel[i] = e
        left -= e
    imm: dict[int, float] = {}
    l2 = need
    for i in cand:
        if l2 <= 0.01:
            break
        e = min(pmax * slots[i]["h"], l2)
        imm[i] = e
        l2 -= e
    return {"sel": sel, "left": max(0.0, left), "need": need, "deadline": dl, "plan": _cost(slots, sel), "imm": _cost(slots, imm)}


def plan_mode(slots: list[dict[str, Any]], R: dict[str, Any], now: datetime, o: dict[str, Any]) -> dict[str, Any]:
    """Was soll die Wallbox jetzt tun? Rückgabe: mode (now/pv/None = pausieren), state, reason."""
    if R["need"] <= 0.05:
        return {"mode": None, "state": "fertig", "reason": "Ladeplan: Das Ziel ist schon erreicht."}
    cur = next((i for i, s in enumerate(slots) if s["t"] <= now < s["t"] + timedelta(hours=s["h"])), None)
    pmax = float(o["pmax"])
    if cur is not None and cur in R["sel"]:
        s = slots[cur]
        sunny = o["strat"] == "sun" or (pmax > 0 and s["pv"] >= 0.9 * pmax)
        t0 = s["t"].strftime("%H:%M")
        return {"mode": "pv" if sunny else "now", "state": "plan", "reason": f"Ladeplan: Ladefenster ab {t0} Uhr" + (" mit Sonne." if sunny else " zum günstigen Preis.")}
    # Notfall: Reicht der Plan nicht, startet die Ladung spätestens zur berechneten Zeit mit Netzstrom
    if R["left"] > 0.05 and pmax > 0:
        start = R["deadline"] - timedelta(minutes=int(R["left"] / pmax * 60 * 1.1) + 5)
        if now >= start:
            return {"mode": "now", "state": "plan", "late": True, "reason": "Ladeplan: Die Sonne reicht nicht, es wird mit Netzstrom nachgeladen."}
    nxt = min((slots[i]["t"] for i in R["sel"] if slots[i]["t"] > now), default=None)
    return {"mode": None, "state": "plan_wartet", "reason": "Ladeplan: Wartet auf das nächste Ladefenster" + (f" um {nxt.strftime('%H:%M')} Uhr." if nxt else ".")}


# ---- Tibber
def parse_tibber(resp: Any, home: str = "") -> dict[str, Any]:
    """Antwort der Tibber-API: Häuser und Preise (ct/kWh) des gewählten Hauses."""
    homes = (((resp or {}).get("data") or {}).get("viewer") or {}).get("homes") or []
    out_homes = []
    for h in homes:
        if isinstance(h, dict) and h.get("id"):
            nm = (h.get("appNickname") or ((h.get("address") or {}).get("address1")) or "Zuhause")
            out_homes.append({"id": str(h["id"]), "name": re.sub(r"[<>\"'&]", "", str(nm))[:40]})
    pick = next((h for h in homes if isinstance(h, dict) and str(h.get("id")) == home), homes[0] if homes else None)
    prices: list[dict[str, Any]] = []
    cur = None
    if isinstance(pick, dict):
        info = ((pick.get("currentSubscription") or {}).get("priceInfo")) or {}
        for key in ("today", "tomorrow"):
            for p in info.get(key) or []:
                try:
                    prices.append({"start": datetime.fromisoformat(str(p["startsAt"])), "ct": float(p["total"]) * 100, "level": p.get("level")})
                except (KeyError, TypeError, ValueError):
                    continue
        c = info.get("current")
        if isinstance(c, dict) and c.get("total") is not None:
            try:
                cur = float(c["total"]) * 100
            except (TypeError, ValueError):
                cur = None
    prices.sort(key=lambda x: x["start"])
    return {"homes": out_homes, "home_id": str(pick.get("id")) if isinstance(pick, dict) else "", "prices": prices, "current_ct": cur}


def hourly_mean(prices: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Viertelstundenpreise zu Stundenmitteln (der Preisstufe wird die häufigste der Stunde zugeordnet)."""
    buckets: dict[datetime, list[dict[str, Any]]] = {}
    for p in prices:
        buckets.setdefault(p["start"].replace(minute=0, second=0, microsecond=0), []).append(p)
    out = []
    for h, ps in sorted(buckets.items()):
        lv = [x.get("level") for x in ps if x.get("level")]
        out.append({"start": h, "ct": sum(x["ct"] for x in ps) / len(ps), "level": max(set(lv), key=lv.count) if lv else None})
    return out


def prices_from_attr(attrs: dict[str, Any]) -> list[dict[str, Any]]:
    """Preisliste aus den Attributen eines Preis-Sensors (zum Beispiel raw_today und raw_tomorrow)."""
    out: list[dict[str, Any]] = []
    for key in ("raw_today", "raw_tomorrow", "prices", "forecast", "data"):
        lst = attrs.get(key)
        if not isinstance(lst, list):
            continue
        for p in lst:
            if not isinstance(p, dict):
                continue
            st = next((p[k] for k in ("start", "start_time", "startsAt", "from", "datetime", "time") if p.get(k)), None)
            val = next((p[k] for k in ("value", "price", "total", "marketprice", "price_per_kwh") if p.get(k) is not None), None)
            try:
                t = st if isinstance(st, datetime) else datetime.fromisoformat(str(st))
                v = float(val)
            except (TypeError, ValueError):
                continue
            out.append({"start": t, "ct": v * 100 if abs(v) < 5 else v, "level": None})
    out.sort(key=lambda x: x["start"])
    return out


# ---- Ladestatistik
def empty_stats() -> dict[str, Any]:
    return {"days": {}, "sessions": [], "open": None, "odo": None}


def clean_stats(raw: Any) -> dict[str, Any]:
    st = empty_stats()
    if not isinstance(raw, dict):
        return st
    days = raw.get("days") if isinstance(raw.get("days"), dict) else {}
    for k, v in days.items():
        if not (isinstance(k, str) and re.fullmatch(r"\d{4}-\d{2}-\d{2}", k) and isinstance(v, dict)):
            continue
        try:
            st["days"][k] = {"pv": float(v.get("pv", 0)), "grid": float(v.get("grid", 0)), "cost": float(v.get("cost", 0)), "full": float(v.get("full", 0)), "km": max(0.0, float(v.get("km", 0))),
                             "veh": {str(n)[:30]: {"kwh": float(x.get("kwh", 0)), "cost": float(x.get("cost", 0))} for n, x in (v.get("veh") or {}).items() if isinstance(x, dict)}}
        except (TypeError, ValueError):
            continue
    for s in raw.get("sessions") if isinstance(raw.get("sessions"), list) else []:
        if isinstance(s, dict) and s.get("start"):
            try:
                st["sessions"].append({"start": str(s["start"]), "min": float(s.get("min", 0)), "veh": str(s.get("veh") or "Unbekannt")[:30], "kwh": float(s.get("kwh", 0)),
                                       "pv": float(s.get("pv", 0)), "cost": float(s.get("cost", 0))})
            except (TypeError, ValueError):
                continue
    st["sessions"] = st["sessions"][:KEEP_SESSIONS]
    try:
        o = float(raw.get("odo")) if raw.get("odo") is not None else None
        st["odo"] = o if o is not None and 0 <= o < 5e6 else None
    except (TypeError, ValueError):
        st["odo"] = None
    return st


def day_ok(days: str, when: datetime) -> bool:
    """Gilt die Planung für den Tag, an dem das Ziel erreicht sein soll? days: all, wk (Mo–Fr), we (Sa–So)."""
    wd = when.weekday()
    return not ((days == "wk" and wd > 4) or (days == "we" and wd < 5))


def add_km(st: dict[str, Any], now: datetime, odo: float | None) -> None:
    """Gefahrene Kilometer aus dem Kilometerstand-Sensor fortschreiben (für Ø Verbrauch)."""
    if odo is None or odo < 0:
        return
    last = st.get("odo")
    st["odo"] = float(odo)
    if last is not None and 0 < odo - last < 2000:
        d = st["days"].setdefault(now.date().isoformat(), {"pv": 0.0, "grid": 0.0, "cost": 0.0, "full": 0.0, "km": 0.0, "veh": {}})
        d["km"] = d.get("km", 0.0) + (odo - last)


def add_energy(st: dict[str, Any], now: datetime, dt_s: float, power_w: float, surplus_w: float | None, price_ct: float | None, veh: str) -> None:
    """Energie eines Taktes auf Sonne und Netz aufteilen und mit dem Preis zum Zeitpunkt bewerten."""
    if power_w <= 0 or dt_s <= 0:
        return
    kwh = power_w * dt_s / 3.6e6
    pv_share = min(1.0, max(0.0, (surplus_w or 0.0) / power_w))
    pv, grid = kwh * pv_share, kwh * (1 - pv_share)
    price = price_ct if price_ct is not None else 0.0
    cost = grid * price / 100
    d = st["days"].setdefault(now.date().isoformat(), {"pv": 0.0, "grid": 0.0, "cost": 0.0, "full": 0.0, "km": 0.0, "veh": {}})
    d["pv"] += pv
    d["grid"] += grid
    d["cost"] += cost
    d["full"] += kwh * price / 100
    v = d["veh"].setdefault(veh, {"kwh": 0.0, "cost": 0.0})
    v["kwh"] += kwh
    v["cost"] += cost
    o = st.get("open")
    if o:
        o["kwh"] += kwh
        o["pv"] += pv
        o["cost"] += cost
        o["veh"] = veh
        o["last"] = now.isoformat(timespec="seconds")


def session_tick(st: dict[str, Any], now: datetime, charging: bool, power_w: float) -> None:
    """Ladevorgang starten, solange geladen wird, und nach 3 Minuten ohne Ladung abschließen."""
    o = st.get("open")
    if charging and power_w > 200:
        if not o:
            st["open"] = {"start": now.isoformat(timespec="seconds"), "last": now.isoformat(timespec="seconds"), "kwh": 0.0, "pv": 0.0, "cost": 0.0, "veh": "Unbekannt"}
        else:
            o["last"] = now.isoformat(timespec="seconds")
        return
    if o:
        try:
            idle = (now - datetime.fromisoformat(o["last"])).total_seconds()
        except (ValueError, TypeError):
            idle = 1e9
        if idle >= 180:
            close_session(st)


def close_session(st: dict[str, Any]) -> None:
    o = st.get("open")
    st["open"] = None
    if not o or o["kwh"] < 0.05:
        return
    try:
        mins = (datetime.fromisoformat(o["last"]) - datetime.fromisoformat(o["start"])).total_seconds() / 60
    except (ValueError, TypeError):
        mins = 0.0
    st["sessions"].insert(0, {"start": o["start"], "min": round(mins, 1), "veh": o["veh"], "kwh": round(o["kwh"], 3), "pv": round(o["pv"], 3), "cost": round(o["cost"], 4)})
    del st["sessions"][KEEP_SESSIONS:]


def prune(st: dict[str, Any], today: date) -> None:
    lim = (today - timedelta(days=KEEP_DAYS)).isoformat()
    for k in [k for k in st["days"] if k < lim]:
        del st["days"][k]


def stats_view(st: dict[str, Any]) -> dict[str, Any]:
    days = [{"d": k, "pv": round(v["pv"], 3), "grid": round(v["grid"], 3), "cost": round(v["cost"], 4), "full": round(v["full"], 4), "km": round(v.get("km", 0.0), 1),
             "veh": {n: {"kwh": round(x["kwh"], 3), "cost": round(x["cost"], 4)} for n, x in v["veh"].items()}} for k, v in sorted(st["days"].items())]
    ses = list(st["sessions"])
    o = st.get("open")
    if o and o["kwh"] >= 0.05:
        ses.insert(0, {"start": o["start"], "min": 0.0, "veh": o["veh"], "kwh": round(o["kwh"], 3), "pv": round(o["pv"], 3), "cost": round(o["cost"], 4), "running": True})
    return {"days": days, "sessions": ses[:30]}
