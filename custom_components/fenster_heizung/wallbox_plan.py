"""Modul 8: Ladeplanung nach Strompreis und PV-Prognose sowie Ladestatistik (reine Rechenlogik, ohne Home-Assistant-Importe)."""
from __future__ import annotations

import re
from datetime import date, datetime, timedelta
from typing import Any

STRATS = ("mix", "sun", "price")
LEVEL_RANK = {"VERY_CHEAP": 0, "CHEAP": 1, "NORMAL": 2, "EXPENSIVE": 3, "VERY_EXPENSIVE": 4}
HORIZON_H = 36
KEEP_DAYS = 800
KEEP_SESSIONS = 2000  # b32: vorher 100 – beim Import älterer Ladungen fielen die ältesten aus der Liste
UNKNOWN = "Unbekannt"
KEEP_CHG = 8


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
    """Nächstes Vorkommen von „HH:MM“ – oder ein fester Zeitpunkt (ISO, Abfahrt aus dem Kalender)."""
    if len(until) > 5:
        dl = datetime.fromisoformat(until)
        return dl.astimezone(now.tzinfo) if dl.tzinfo and now.tzinfo else dl
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
        # Sonnenanteil der Leistung, die hier wirklich gebraucht wird: Braucht das Auto weniger als eine volle Stunde, zählt nur dieser Teil
        p = min(pw(i), need / slots[i]["h"]) if need > 0 else pw(i)
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
    return {"days": {}, "sessions": [], "open": None, "odo": None, "odos": {}, "est": {}, "odoset": {}, "goe": {}}


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
                             **({"tsum": float(v["tsum"]), "tw": float(v["tw"])} if v.get("tw") else {}),
                             "veh": {str(n)[:30]: {"kwh": float(x.get("kwh", 0)), "cost": float(x.get("cost", 0)), **({"km": max(0.0, float(x["km"]))} if x.get("km") else {})} for n, x in (v.get("veh") or {}).items() if isinstance(x, dict)}}
        except (TypeError, ValueError):
            continue
    for s in raw.get("sessions") if isinstance(raw.get("sessions"), list) else []:
        if isinstance(s, dict) and s.get("start"):
            try:
                st["sessions"].append({"start": str(s["start"]), "min": float(s.get("min", 0)), "veh": str(s.get("veh") or "Unbekannt")[:30], "kwh": float(s.get("kwh", 0)),
                                       "pv": float(s.get("pv", 0)), "cost": float(s.get("cost", 0)), **({"card": str(s["card"])[:30]} if s.get("card") else {}),
                                       **({"note": str(s["note"])[:80]} if s.get("note") else {}), **({"biz": True} if s.get("biz") else {}),
                                       **({"edit": str(s["edit"])[:25]} if s.get("edit") else {}),
                                       **({"gid": str(s["gid"])[:20]} if s.get("gid") else {}), **({"src": "goe"} if s.get("src") == "goe" else {}),
                                       **({"pvest": True} if s.get("pvest") else {}),
                                       **({"pct": float(s["pct"])} if s.get("pct") is not None else {}), **({"pcost": True} if s.get("pcost") else {}),
                                       **({"orig": float(s["orig"])} if s.get("orig") is not None and abs(float(s["orig"]) - float(s.get("kwh", 0))) >= 0.01 else {}),
                                       **({"chg": [{"t": str(c.get("t", ""))[:25], "x": [str(y)[:80] for y in c.get("x", [])][:6]} for c in s["chg"] if isinstance(c, dict)][-KEEP_CHG:]} if isinstance(s.get("chg"), list) and s["chg"] else {})})
            except (TypeError, ValueError):
                continue
    st["sessions"] = st["sessions"][:KEEP_SESSIONS]
    # b42: Die laufende Ladung überlebt einen Neustart von Home Assistant (vorher ging sie verloren, die Tageswerte blieben, die Ladung zeigte nur den Rest)
    o = raw.get("open")
    if isinstance(o, dict) and o.get("start") and o.get("last"):
        try:
            datetime.fromisoformat(str(o["start"]))
            datetime.fromisoformat(str(o["last"]))
            st["open"] = {"start": str(o["start"])[:25], "last": str(o["last"])[:25], "kwh": max(0.0, float(o.get("kwh", 0))), "pv": max(0.0, float(o.get("pv", 0))),
                          "cost": max(0.0, float(o.get("cost", 0))), "veh": str(o.get("veh") or "Unbekannt")[:30],
                          **({"card": str(o["card"])[:30]} if o.get("card") else {})}
            if isinstance(o.get("unk"), dict):
                st["open"]["unk"] = {str(k)[:10]: [max(0.0, float(v[0])), max(0.0, float(v[1]))] for k, v in o["unk"].items() if isinstance(v, (list, tuple)) and len(v) == 2}
        except (TypeError, ValueError):
            st["open"] = None
    # Aus go-e übernommene Ladungen (Session-ID → Tag): zählen nie doppelt in den Tageswerten, auch wenn die Ladung gelöscht wurde
    g = raw.get("goe") if isinstance(raw.get("goe"), dict) else {}
    st["goe"] = {str(k)[:20]: str(v)[:10] for k, v in g.items() if re.fullmatch(r"[0-9A-Za-z_-]{1,20}", str(k)) and re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(v))}
    try:
        o = float(raw.get("odo")) if raw.get("odo") is not None else None
        st["odo"] = o if o is not None and 0 <= o < 5e6 else None
    except (TypeError, ValueError):
        st["odo"] = None
    for k, v in (raw.get("odos") or {}).items() if isinstance(raw.get("odos"), dict) else []:
        try:
            if re.fullmatch(r"[a-z0-9]{1,12}", str(k)) and 0 <= float(v) < 5e6:
                st["odos"][str(k)] = float(v)
        except (TypeError, ValueError):
            continue
    for k, v in (raw.get("odoset") or {}).items() if isinstance(raw.get("odoset"), dict) else []:
        try:
            if re.fullmatch(r"[a-z0-9]{1,12}", str(k)) and isinstance(v, dict) and 0 <= float(v.get("km")) < 5e6 and re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(v.get("d"))):
                st["odoset"][str(k)] = {"km": float(v["km"]), "d": str(v["d"])}
        except (TypeError, ValueError):
            continue
    for k, v in (raw.get("est") or {}).items() if isinstance(raw.get("est"), dict) else []:
        try:
            if re.fullmatch(r"[a-z0-9]{1,12}", str(k)) and isinstance(v, dict) and 0 <= float(v.get("soc")) <= 100:
                st["est"][str(k)] = {"soc": float(v["soc"]), "set": str(v.get("set") or ""), "at": float(v.get("at", v["soc"])), "stale": bool(v.get("stale"))}
        except (TypeError, ValueError):
            continue
    return st


def day_ok(days: str, when: datetime) -> bool:
    """Gilt die Planung für den Tag, an dem das Ziel erreicht sein soll? days: all, wk (Mo–Fr), we (Sa–So)."""
    wd = when.weekday()
    return not ((days == "wk" and wd > 4) or (days == "we" and wd < 5))


def add_km(st: dict[str, Any], now: datetime, odo: float | None, vid: str = "", veh: str = "") -> None:
    """Gefahrene Kilometer aus dem Kilometerstand-Sensor fortschreiben – je Fahrzeug (v0.8), damit ein Wechsel keinen Sprung ergibt."""
    if odo is None or odo < 0:
        return
    if vid:
        last = st["odos"].get(vid)
        if last is None and st.get("odo") is not None and not st["odos"]:
            last = st["odo"]  # Übernahme: bisher gab es nur einen Kilometerstand
        st["odos"][vid] = float(odo)
    else:
        last = st.get("odo")
    st["odo"] = float(odo)
    if last is not None and 0 < odo - last < 2000:
        d = st["days"].setdefault(now.date().isoformat(), {"pv": 0.0, "grid": 0.0, "cost": 0.0, "full": 0.0, "km": 0.0, "veh": {}})
        d["km"] = d.get("km", 0.0) + (odo - last)
        if veh:
            v = d["veh"].setdefault(veh, {"kwh": 0.0, "cost": 0.0})
            v["km"] = v.get("km", 0.0) + (odo - last)


def _day(st: dict[str, Any], d: str) -> dict[str, Any]:
    return st["days"].setdefault(d, {"pv": 0.0, "grid": 0.0, "cost": 0.0, "full": 0.0, "km": 0.0, "veh": {}})


def add_temp(st: dict[str, Any], now: datetime, temp: float | None, dt_s: float) -> None:
    """Außentemperatur des Tages (zeitgewichtet) – für „Verbrauch nach Außentemperatur“."""
    if temp is None or dt_s <= 0 or not -50 < temp < 60:
        return
    d = _day(st, now.date().isoformat())
    d["tsum"] = d.get("tsum", 0.0) + temp * dt_s
    d["tw"] = d.get("tw", 0.0) + dt_s


def odo_manual(st: dict[str, Any], vid: str, veh: str, odo: float, today: date) -> dict[str, Any]:
    """Kilometerstand von Hand (Fahrzeug ohne Sensor): Die Strecke seit dem letzten Eintrag wird gleichmäßig auf die Tage dazwischen verteilt.
    Rückgabe: {"ok", "km" (verteilt), "days", "base" (erster Eintrag), "err"}."""
    last = st["odoset"].get(vid)
    d0 = today.isoformat()
    if last is None:
        st["odoset"][vid] = {"km": float(odo), "d": d0}
        st["odos"][vid] = float(odo)
        return {"ok": True, "km": 0.0, "days": 0, "base": True}
    diff = float(odo) - last["km"]
    if diff < 0:
        return {"ok": False, "err": f"Der Stand ist kleiner als der letzte Eintrag ({round(last['km'])} km)."}
    if diff > 50000:
        return {"ok": False, "err": "Mehr als 50.000 km seit dem letzten Eintrag – bitte den Stand prüfen."}
    start = date.fromisoformat(last["d"])
    n = max(1, (today - start).days)
    days = [start + timedelta(days=i + 1) for i in range(n)] if today > start else [today]
    per = diff / len(days)
    lim = (today - timedelta(days=KEEP_DAYS)).isoformat()
    for t in days:
        k = t.isoformat()
        if k < lim:
            continue
        d = _day(st, k)
        d["km"] = d.get("km", 0.0) + per
        if veh:
            v = d["veh"].setdefault(veh, {"kwh": 0.0, "cost": 0.0})
            v["km"] = v.get("km", 0.0) + per
    st["odoset"][vid] = {"km": float(odo), "d": d0}
    st["odos"][vid] = float(odo)
    return {"ok": True, "km": round(diff, 1), "days": len(days), "base": False}


EST_EFF = 0.9  # Ladeverluste: so viel der geladenen Energie kommt im Akku an


def est_set(st: dict[str, Any], vid: str, soc: float, now: datetime) -> None:
    """B4: Ladestand von Hand angeben („Auto hat jetzt 40 %“) – Ausgangspunkt für die Schätzung."""
    st["est"][vid] = {"soc": min(100.0, max(0.0, float(soc))), "at": min(100.0, max(0.0, float(soc))), "set": now.isoformat(timespec="minutes"), "stale": False}


def est_add(st: dict[str, Any], vid: str, kwh: float, cap: float) -> None:
    """B4: geladene Energie auf den geschätzten Ladestand rechnen (mit Ladeverlusten)."""
    e = st["est"].get(vid)
    if e is None or cap <= 0 or kwh <= 0:
        return
    e["soc"] = min(100.0, e["soc"] + kwh * EST_EFF / cap * 100)


def add_energy(st: dict[str, Any], now: datetime, dt_s: float, power_w: float, surplus_w: float | None, price_ct: float | None, veh: str, card: str = "") -> None:
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
        if veh == UNKNOWN:
            u = o.setdefault("unk", {}).setdefault(now.date().isoformat(), [0.0, 0.0])
            u[0] += kwh
            u[1] += cost
        elif o.get("unk"):
            # Fahrzeug erst während der Ladung erkannt: bisher „Unbekannt“ gebuchte Energie dieser Ladung nachträglich zuordnen
            for day, (k, c) in o.pop("unk").items():
                dd = st["days"].get(day)
                if dd and UNKNOWN in dd["veh"]:
                    _veh_move(dd, UNKNOWN, veh, k, c)
        o["veh"] = veh
        if card:
            o["card"] = card
        o["last"] = now.isoformat(timespec="seconds")


SES_IDLE_S = 600        # ohne Stecker-Info: so lange Pause gehört noch zur selben Ladung
SES_PLUGGED_MAX_S = 12 * 3600  # angesteckt, aber so lange nicht geladen: Ladung trotzdem abschließen


def session_tick(st: dict[str, Any], now: datetime, charging: bool, power_w: float, plugged: bool | None = None) -> dict[str, Any] | None:
    """Ladevorgang starten, solange geladen wird, und abschließen, wenn das Auto abgesteckt wird.

    Eine Ladung reicht vom ersten Strom bis zum Abstecken – Pausen dazwischen (Phasenwechsel, zu wenig Sonne, Ladeplan wartet)
    bleiben in derselben Ladung (vorher wurde nach 3 Minuten ohne Strom eine neue begonnen).
    plugged: True/False, wenn die Wallbox den Stecker meldet; None = unbekannt, dann gilt eine Pause von 10 Minuten.
    """
    o = st.get("open")
    if charging and power_w > 200:
        if not o:
            st["open"] = {"start": now.isoformat(timespec="seconds"), "last": now.isoformat(timespec="seconds"), "kwh": 0.0, "pv": 0.0, "cost": 0.0, "veh": "Unbekannt"}
        else:
            o["last"] = now.isoformat(timespec="seconds")
        return None
    if o:
        try:
            idle = (now - datetime.fromisoformat(o["last"])).total_seconds()
        except (ValueError, TypeError):
            idle = 1e9
        if plugged is False or idle >= (SES_PLUGGED_MAX_S if plugged else SES_IDLE_S):
            return close_session(st)
    return None


def close_session(st: dict[str, Any]) -> dict[str, Any] | None:
    """Laufende Ladung abschließen. Rückgabe: die abgeschlossene Ladung (für das Ereignis „Ladung beendet“) oder None."""
    o = st.get("open")
    st["open"] = None
    if not o or o["kwh"] < 0.05:
        return None
    try:
        mins = (datetime.fromisoformat(o["last"]) - datetime.fromisoformat(o["start"])).total_seconds() / 60
    except (ValueError, TypeError):
        mins = 0.0
    st["sessions"].insert(0, {"start": o["start"], "min": round(mins, 1), "veh": o["veh"], "kwh": round(o["kwh"], 3), "pv": round(o["pv"], 3), "cost": round(o["cost"], 4), **({"card": o["card"]} if o.get("card") else {})})
    del st["sessions"][KEEP_SESSIONS:]
    return st["sessions"][0]


def _veh_move(d: dict[str, Any], a: str, b: str, kwh: float, cost: float) -> None:
    """Energie eines Tages von Fahrzeug a nach b umbuchen (höchstens so viel, wie a hat)."""
    va = d["veh"].get(a)
    if not va or a == b:
        return
    k = min(kwh, va["kwh"])
    c = min(cost, va["cost"]) if va["kwh"] > 0 else 0.0
    va["kwh"] -= k
    va["cost"] -= c
    vb = d["veh"].setdefault(b, {"kwh": 0.0, "cost": 0.0})
    vb["kwh"] += k
    vb["cost"] += c
    if va["kwh"] < 1e-6 and not va.get("km"):
        del d["veh"][a]


def _fmt(v: float) -> str:
    return f"{v:.2f}".replace(".", ",")


def uncovered(st: dict[str, Any], day: str) -> tuple[float, float, float]:
    """Energie (kWh, davon Sonne, Kosten) eines Tages, die in keiner Ladung steht – z. B. wenn Home Assistant während einer Ladung neu gestartet wurde."""
    d = st["days"].get(day)
    if d is None:
        return 0.0, 0.0, 0.0
    k, p, c = d["pv"] + d["grid"], d["pv"], d["cost"]
    for x in [*st["sessions"], *([st["open"]] if st.get("open") else [])]:
        if x["start"][:10] == day:
            k -= x["kwh"]
            p -= x["pv"]
            c -= x["cost"]
    return max(0.0, k), max(0.0, p), max(0.0, c)


def session_edit(st: dict[str, Any], start: str, ch: dict[str, Any], now: datetime) -> dict[str, Any] | None:
    """Abgeschlossene Ladung bearbeiten oder löschen (Statistik). Tages- und Fahrzeugwerte werden mitgeführt.
    ch: veh, kwh, card, note, biz, delete. Die gemessene Menge bleibt als „orig“ erhalten, jede Änderung steht in „chg“."""
    s = next((x for x in st["sessions"] if x["start"] == start), None)
    if s is None:
        return None
    d = st["days"].get(start[:10])
    if ch.get("delete"):
        if d is not None:
            fr = d["full"] / (d["pv"] + d["grid"]) if d["pv"] + d["grid"] > 0 else 0.0
            d["pv"] = max(0.0, d["pv"] - s["pv"])
            d["grid"] = max(0.0, d["grid"] - (s["kwh"] - s["pv"]))
            d["cost"] = max(0.0, d["cost"] - s["cost"])
            d["full"] = max(0.0, d["full"] - s["kwh"] * fr)
            v = d["veh"].get(s["veh"])
            if v:
                v["kwh"] = max(0.0, v["kwh"] - s["kwh"])
                v["cost"] = max(0.0, v["cost"] - s["cost"])
                if v["kwh"] < 1e-6 and not v.get("km"):
                    del d["veh"][s["veh"]]
        st["sessions"].remove(s)
        if s.get("gid"):  # Tageswerte sind wieder abgezogen – ein späterer Import darf die Ladung neu zählen
            (st.get("goe") or {}).pop(str(s["gid"]), None)
        return {"deleted": start}
    if ch.get("merge"):
        return session_merge(st, s, now)
    log: list[str] = []
    nv = str(ch.get("veh") or "")[:30]
    if nv and nv != s["veh"]:
        if d is not None:
            _veh_move(d, s["veh"], nv, s["kwh"], s["cost"])
        log.append(f"Fahrzeug: {s['veh']} → {nv}")
        s["veh"] = nv
    if ch.get("kwh") is not None:
        k = round(max(0.0, min(300.0, float(ch["kwh"]))), 3)
        old = s["kwh"]
        if abs(k - old) >= 0.01:
            f = s["pv"] / old if old > 0 else 0.0
            c = s["cost"] / old if old > 0 else 0.0
            dk = k - old
            # b42: Energie, die der Tag schon zählt, aber keine Ladung enthält (z. B. nach einem Neustart während der Ladung), wird zuerst
            # dieser Ladung zugerechnet. Die Tageswerte bleiben dafür gleich; nur der Rest ändert auch den Tag.
            take = apv = ac = 0.0
            if dk > 0 and d is not None:
                ukwh, upv, ucost = uncovered(st, start[:10])
                if ukwh > 0.05:
                    take = min(dk, ukwh)
                    apv, ac = upv * take / ukwh, ucost * take / ukwh
            rest = dk - take
            dpv, dc = rest * f, rest * c
            if d is not None and abs(rest) > 1e-9:
                fr = d["full"] / (d["pv"] + d["grid"]) if d["pv"] + d["grid"] > 0 else 0.0
                d["pv"] = max(0.0, d["pv"] + dpv)
                d["grid"] = max(0.0, d["grid"] + rest - dpv)
                d["cost"] = max(0.0, d["cost"] + dc)
                d["full"] = max(0.0, d["full"] + rest * fr)
                v = d["veh"].setdefault(s["veh"], {"kwh": 0.0, "cost": 0.0})
                v["kwh"] = max(0.0, v["kwh"] + rest)
                v["cost"] = max(0.0, v["cost"] + dc)
            s.setdefault("orig", old)
            if abs(k - s["orig"]) < 0.01:
                s.pop("orig")
            log.append(f"Menge: {_fmt(old)} → {_fmt(k)} kWh" + (f" (davon {_fmt(take)} kWh bisher in keiner Ladung, Tageswerte unverändert)" if take > 0.005 else ""))
            keep = s.get("cost") if s.get("pcost") else None  # von Hand gesetzte Kosten bleiben
            s["kwh"], s["pv"], s["cost"] = k, round(s["pv"] + apv + dpv, 3), round(s["cost"] + ac + dc, 4)
            target = keep if keep is not None else (round(max(0.0, k - s["pv"]) * s["pct"] / 100, 4) if s.get("pct") is not None else None)
            if target is not None:
                if d is not None:
                    d["cost"] = max(0.0, d["cost"] + target - s["cost"])
                    vv = d["veh"].get(s["veh"])
                    if vv:
                        vv["cost"] = max(0.0, vv["cost"] + target - s["cost"])
                s["cost"] = target
    if ch.get("cost") is not None:  # Kosten der Ladung direkt (€), z. B. auch bei 100 % Sonne
        nc = round(max(0.0, min(1000.0, float(ch["cost"]))), 4)
        if abs(nc - s["cost"]) >= 0.005:
            dc = nc - s["cost"]
            if d is not None:
                d["cost"] = max(0.0, d["cost"] + dc)
                v = d["veh"].setdefault(s["veh"], {"kwh": 0.0, "cost": 0.0})
                v["cost"] = max(0.0, v["cost"] + dc)
            log.append(f"Kosten: {_fmt(s['cost'])} → {_fmt(nc)} €")
            s["cost"], s["pcost"] = nc, True
            s.pop("pct", None)
    if ch.get("ct") is not None:
        ct = round(max(0.0, min(500.0, float(ch["ct"]))), 2)
        grid = max(0.0, s["kwh"] - s["pv"])
        old_ct = s["cost"] / grid * 100 if grid > 0 else s.get("pct")
        nc = round(grid * ct / 100, 4)
        if abs(nc - s["cost"]) >= 0.005 or s.get("pct") != ct:
            dc = nc - s["cost"]
            if d is not None:
                d["cost"] = max(0.0, d["cost"] + dc)
                if old_ct is not None:
                    d["full"] = max(0.0, d["full"] + s["kwh"] * (ct - old_ct) / 100)
                v = d["veh"].setdefault(s["veh"], {"kwh": 0.0, "cost": 0.0})
                v["cost"] = max(0.0, v["cost"] + dc)
            log.append(f"Preis: {_fmt(old_ct) if old_ct is not None else '–'} → {_fmt(ct)} ct/kWh (Netzanteil {_fmt(grid)} kWh) · Kosten {_fmt(s['cost'])} → {_fmt(nc)} €")
            s["cost"], s["pct"] = nc, ct
    if "card" in ch:
        nc = str(ch["card"] or "").strip()[:30]
        if nc != s.get("card", ""):
            log.append(f"Karte: {s.get('card') or 'ohne'} → {nc or 'ohne'}")
            if nc:
                s["card"] = nc
            else:
                s.pop("card", None)
    if "note" in ch:
        nn = str(ch["note"] or "").strip()[:80]
        if nn != s.get("note", ""):
            log.append(f"Notiz: „{nn}“" if nn else "Notiz entfernt")
            if nn:
                s["note"] = nn
            else:
                s.pop("note", None)
    if "biz" in ch and bool(ch["biz"]) != bool(s.get("biz")):
        log.append("als dienstlich markiert" if ch["biz"] else "nicht mehr dienstlich")
        if ch["biz"]:
            s["biz"] = True
        else:
            s.pop("biz", None)
    if log:
        s["edit"] = now.isoformat(timespec="seconds")
        s.setdefault("chg", []).append({"t": s["edit"], "x": log})
        del s["chg"][:-KEEP_CHG]
    return s


def reconcile_days(st: dict[str, Any]) -> int:
    """Fahrzeug-Werte der Tage an die Ladungen angleichen (b32-Fehler beim „Zurück in die Liste“).

    Hat ein Fahrzeug an einem Tag laut Ladungen mehr Energie, als der Tag ihm zuschreibt, und ein anderes Fahrzeug
    (meist „Gastfahrzeug“ oder „Unbekannt“) mehr, als seine Ladungen erklären, wird der Unterschied umgebucht.
    Tage ohne Ladungen in der Liste bleiben unangetastet. Rückgabe: Anzahl der Umbuchungen."""
    by: dict[str, dict[str, list[float]]] = {}
    for s in st.get("sessions") or []:
        d = str(s.get("start", ""))[:10]
        x = by.setdefault(d, {}).setdefault(str(s.get("veh") or UNKNOWN), [0.0, 0.0])
        x[0] += float(s.get("kwh") or 0)
        x[1] += float(s.get("cost") or 0)
    n = 0
    for d, sv in by.items():
        day = (st.get("days") or {}).get(d)
        if not day:
            continue
        vehs = day.get("veh") or {}
        need = {v: k - vehs.get(v, {}).get("kwh", 0.0) for v, (k, _c) in sv.items() if k - vehs.get(v, {}).get("kwh", 0.0) > 0.01}
        if not need:
            continue
        # Überschuss: Tageswert größer als die Ladungen dieses Fahrzeugs – zuerst Gast/Unbekannt
        surplus = {v: x.get("kwh", 0.0) - sv.get(v, [0.0, 0.0])[0] for v, x in vehs.items() if x.get("kwh", 0.0) - sv.get(v, [0.0, 0.0])[0] > 0.01}
        order = sorted(surplus, key=lambda v: (v not in ("Gastfahrzeug", UNKNOWN), v))
        for tgt, k_need in sorted(need.items()):
            for src in order:
                if k_need <= 0.01:
                    break
                k = min(k_need, surplus[src])
                if k <= 0.01:
                    continue
                va = vehs[src]
                c = va.get("cost", 0.0) * k / va["kwh"] if va.get("kwh") else 0.0
                _veh_move(day, src, tgt, k, c)
                surplus[src] -= k
                k_need -= k
                n += 1
    return n


def sessions_bulk(st: dict[str, Any], act: str, starts: list[str], now: datetime, veh: str = "") -> int:
    """Mehrere Ladungen auf einmal löschen (act „delete“) oder einem Fahrzeug zuordnen (act „veh“). Rückgabe: Anzahl."""
    n = 0
    for s0 in list(dict.fromkeys(str(x) for x in starts))[:KEEP_SESSIONS]:
        r = session_edit(st, s0, {"delete": True} if act == "delete" else {"veh": veh}, now)
        if r is not None:
            n += 1
    return n


def sessions_clear(st: dict[str, Any], mode: str) -> int:
    """Alle gespeicherten Ladungen löschen. mode „list“: nur die Liste (Tageswerte, Summen und km bleiben).
    mode „all“: auch die geladene Energie und Kosten aller Tage (km und Temperaturen bleiben), Import-Gedächtnis leer."""
    n = len(st.get("sessions") or [])
    st["sessions"] = []
    if mode == "all":
        for d in (st.get("days") or {}).values():
            d["pv"] = d["grid"] = d["cost"] = d["full"] = 0.0
            d["veh"] = {k: {"kwh": 0.0, "cost": 0.0, "km": v["km"]} for k, v in (d.get("veh") or {}).items() if v.get("km")}
        st["goe"] = {}
    return n


MERGE_GAP_H = 12  # so weit dürfen zwei Teile einer Ladung auseinanderliegen


# ---------------------------------------------------------------- Import aus dem go-e-Ladelog (CSV aus der App)
IMPORT_NEAR_S = 20 * 60  # so nah müssen Starts liegen, damit es dieselbe Ladung ist


def _ts(s: str) -> float | None:
    try:
        return datetime.fromisoformat(s).timestamp()
    except (TypeError, ValueError):
        return None


def _legacy_counted(st: dict[str, Any], r: dict[str, Any], a: float) -> bool:
    """b31 hat importierte Ladungen in die Tageswerte gebucht, die Liste aber nach 100 Ladungen abgeschnitten.
    Fehlt eine Ladung, die älter als die älteste gespeicherte ist, und hat ihr Tag schon so viel Energie: nur wiederherstellen."""
    if st.get("goe"):
        return False  # ab b32 wird jede importierte Ladung gemerkt
    ts = [t for t in (_ts(s["start"]) for s in st.get("sessions") or []) if t is not None]
    if len(ts) < 100 or a >= min(ts):
        return False
    d = (st.get("days") or {}).get(str(r.get("start", ""))[:10])
    return bool(d) and d.get("pv", 0) + d.get("grid", 0) >= float(r.get("kwh") or 0) - 0.01


def import_plan(st: dict[str, Any], rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Jede Zeile einordnen: new (fehlt), dup (schon da, gleiche Menge), diff (schon da, Menge weicht ab), open (läuft gerade), bad."""
    ses = st.get("sessions") or []
    o = st.get("open")
    o_ts = _ts(o["start"]) if o else None
    out = []
    for r in rows:
        a, b = _ts(r.get("start", "")), _ts(r.get("end", ""))
        if a is None or b is None or b < a or not 0 < float(r.get("kwh") or 0) < 300:
            out.append({**r, "st": "bad"})
            continue
        if o_ts is not None and b >= o_ts - 60:
            out.append({**r, "st": "open"})
            continue
        hit = None
        for s in ses:
            if r.get("gid") and s.get("gid") == r["gid"]:
                hit = s
                break
            t = _ts(s["start"])
            if t is not None and (abs(t - a) <= IMPORT_NEAR_S or a - 60 <= t <= b):
                hit = s
                break
        if hit is None:
            gd = (st.get("goe") or {}).get(str(r.get("gid") or ""))
            if gd:
                out.append({**r, "st": "restore"})  # schon einmal importiert (Tageswerte gezählt), Ladung fehlt aber in der Liste
            elif _legacy_counted(st, r, a):
                out.append({**r, "st": "restore"})
            else:
                out.append({**r, "st": "new"})
        else:
            d = float(r["kwh"]) - float(hit.get("kwh", 0))
            out.append({**r, "st": "diff" if abs(d) >= 0.05 else "dup", "have": hit["start"], "have_kwh": round(float(hit.get("kwh", 0)), 3)})
    return out


def import_apply(st: dict[str, Any], plan: list[dict[str, Any]], take_kwh: bool, now: datetime) -> dict[str, int]:
    """Neue Ladungen eintragen (Tageswerte am Starttag), auf Wunsch Mengen vorhandener Ladungen an go-e angleichen."""
    n_new = n_fix = n_res = 0
    goe = st.setdefault("goe", {})
    for r in plan:
        if r["st"] == "restore":  # nur die Ladung zurück in die Liste, Tageswerte sind schon gezählt
            kwh, pv = round(float(r["kwh"]), 3), round(min(float(r["kwh"]), max(0.0, float(r.get("pv") or 0))), 3)
            mins = max(0.0, (_ts(r["end"]) - _ts(r["start"])) / 60)
            cost = round(float(r["cost"]), 4) if r.get("cost") is not None else round((kwh - pv) * float(r.get("ct") or 0) / 100, 4)
            st["sessions"].append({"start": r["start"], "min": round(mins, 1), "veh": str(r.get("veh") or UNKNOWN)[:30], "kwh": kwh, "pv": pv, "cost": cost,
                                   **({"card": str(r["card"])[:30]} if r.get("card") else {}), "gid": str(r.get("gid") or "")[:20], "src": "goe", "pvest": True,
                                   "chg": [{"t": now.isoformat(timespec="minutes"), "x": ["aus go-e wiederhergestellt (Tageswerte waren schon gezählt)"]}]})
            if r.get("gid"):
                goe[str(r["gid"])[:20]] = r["start"][:10]
            n_res += 1
            continue
        if r["st"] == "new":
            kwh, pv = round(float(r["kwh"]), 3), round(min(float(r["kwh"]), max(0.0, float(r.get("pv") or 0))), 3)
            grid, price = kwh - pv, float(r.get("ct") or 0)
            cost = round(float(r["cost"]), 4) if r.get("cost") is not None else round(grid * price / 100, 4)
            full = float(r["full"]) if r.get("full") is not None else kwh * price / 100
            mins = max(0.0, (_ts(r["end"]) - _ts(r["start"])) / 60)
            st["sessions"].append({"start": r["start"], "min": round(mins, 1), "veh": str(r.get("veh") or UNKNOWN)[:30], "kwh": kwh, "pv": pv, "cost": cost,
                                   **({"card": str(r["card"])[:30]} if r.get("card") else {}), "gid": str(r.get("gid") or "")[:20], "src": "goe",
                                   **({"pvest": True} if r.get("pvest") else {}),
                                   "chg": [{"t": now.isoformat(timespec="minutes"), "x": ["aus go-e importiert", f"Preis: {r.get('psrc') or 'heute'}"]}]})
            d = _day(st, r["start"][:10])
            d["pv"] += pv
            d["grid"] += grid
            d["cost"] += cost
            d["full"] += full
            v = d["veh"].setdefault(str(r.get("veh") or UNKNOWN)[:30], {"kwh": 0.0, "cost": 0.0})
            v["kwh"] += kwh
            v["cost"] += cost
            if r.get("gid"):
                goe[str(r["gid"])[:20]] = r["start"][:10]
            n_new += 1
        elif r["st"] == "diff" and take_kwh:
            res = session_edit(st, r["have"], {"kwh": float(r["kwh"])}, now)
            s = next((x for x in st["sessions"] if x["start"] == r["have"]), None)
            if s is not None:
                s["gid"] = str(r.get("gid") or "")[:20]
                if s.get("chg"):
                    s["chg"][-1]["x"] = [*s["chg"][-1]["x"], "Menge aus go-e übernommen"][:6]
            if res is not None:
                n_fix += 1
    st["sessions"].sort(key=lambda x: _ts(x["start"]) or 0, reverse=True)
    del st["sessions"][KEEP_SESSIONS:]
    reconcile_days(st)
    return {"new": n_new, "fixed": n_fix, "restored": n_res}


def merge_prev(st: dict[str, Any], s: dict[str, Any]) -> dict[str, Any] | None:
    """Die Ladung davor (älter), wenn sie zum selben Fahrzeug gehört und höchstens 12 Stunden davor endete."""
    i = st["sessions"].index(s)
    p = st["sessions"][i + 1] if i + 1 < len(st["sessions"]) else None
    if p is None or p["veh"] != s["veh"]:
        return None
    try:
        end = datetime.fromisoformat(p["start"]) + timedelta(minutes=p.get("min") or 0)
        gap = (datetime.fromisoformat(s["start"]) - end).total_seconds() / 3600
    except (ValueError, TypeError):
        return None
    return p if -0.1 <= gap <= MERGE_GAP_H else None


def session_merge(st: dict[str, Any], s: dict[str, Any], now: datetime) -> dict[str, Any] | None:
    """Zwei Teile einer Ladung zusammenführen (z. B. nach einem Phasenwechsel vor 2026.11.3b23 getrennt gezählt).
    Die Tageswerte bleiben unverändert – die Energie war schon gezählt, nur die Ladungsliste ändert sich."""
    p = merge_prev(st, s)
    if p is None:
        return None
    try:
        mins = (datetime.fromisoformat(s["start"]) + timedelta(minutes=s.get("min") or 0) - datetime.fromisoformat(p["start"])).total_seconds() / 60
    except (ValueError, TypeError):
        mins = (p.get("min") or 0) + (s.get("min") or 0)
    t = s["start"][11:16]
    p["min"] = round(max(mins, 0.0), 1)
    for k, r in (("kwh", 3), ("pv", 3), ("cost", 4)):
        p[k] = round(p[k] + s[k], r)
    if "orig" in p or "orig" in s:
        p["orig"] = round(p.get("orig", p["kwh"] - s["kwh"]) + s.get("orig", s["kwh"]), 3)
    if not p.get("card") and s.get("card"):
        p["card"] = s["card"]
    nn = " · ".join(x for x in (p.get("note"), s.get("note")) if x)[:80]
    if nn:
        p["note"] = nn
    if s.get("biz"):
        p["biz"] = True
    p["edit"] = now.isoformat(timespec="seconds")
    p["chg"] = (p.get("chg") or []) + (s.get("chg") or []) + [{"t": p["edit"], "x": [f"Zusammengeführt mit dem Teil ab {t} Uhr (+{_fmt(s['kwh'])} kWh)"]}]
    del p["chg"][:-KEEP_CHG]
    st["sessions"].remove(s)
    return p


def assign_unknown(st: dict[str, Any], d0: str, d1: str, to: str, now: datetime) -> dict[str, float]:
    """Alle „Unbekannt“-Energie im Zeitraum [d0, d1] (Tage, ISO) einem Fahrzeug zuordnen – Tageswerte und Ladungen."""
    to = str(to)[:30]
    kwh = 0.0
    n = 0
    if not to or to == UNKNOWN:
        return {"kwh": 0.0, "n": 0}
    for day, d in st["days"].items():
        if d0 <= day <= d1 and UNKNOWN in d["veh"]:
            kwh += d["veh"][UNKNOWN]["kwh"]
            _veh_move(d, UNKNOWN, to, d["veh"][UNKNOWN]["kwh"], d["veh"][UNKNOWN]["cost"])
    t = now.isoformat(timespec="seconds")
    for s in st["sessions"]:
        if s["veh"] == UNKNOWN and d0 <= s["start"][:10] <= d1:
            s["veh"] = to
            s["edit"] = t
            s.setdefault("chg", []).append({"t": t, "x": [f"Fahrzeug: {UNKNOWN} → {to}"]})
            del s["chg"][:-KEEP_CHG]
            n += 1
    return {"kwh": round(kwh, 3), "n": n}


def prune(st: dict[str, Any], today: date) -> None:
    lim = (today - timedelta(days=KEEP_DAYS)).isoformat()
    for k in [k for k in st["days"] if k < lim]:
        del st["days"][k]


def stats_view(st: dict[str, Any]) -> dict[str, Any]:
    days = [{"d": k, "pv": round(v["pv"], 3), "grid": round(v["grid"], 3), "cost": round(v["cost"], 4), "full": round(v["full"], 4), "km": round(v.get("km", 0.0), 1),
             **({"t": round(v["tsum"] / v["tw"], 1)} if v.get("tw") else {}),
             "veh": {n: {"kwh": round(x["kwh"], 3), "cost": round(x["cost"], 4), "km": round(x.get("km", 0.0), 1)} for n, x in v["veh"].items()}} for k, v in sorted(st["days"].items())]
    ses = list(st["sessions"])
    o = st.get("open")
    if o and o["kwh"] >= 0.05:
        ses.insert(0, {**({"card": o["card"]} if o.get("card") else {}), "start": o["start"], "min": 0.0, "veh": o["veh"], "kwh": round(o["kwh"], 3), "pv": round(o["pv"], 3), "cost": round(o["cost"], 4), "running": True})
    return {"days": days, "sessions": ses[:KEEP_SESSIONS]}  # v0.9: alle gespeicherten Ladungen (Ladenachweis je Monat)
