"""Modul 20 Abrechnungen: Rechenkern ohne Home Assistant (Konzept G1).

Bausteine mit Zeitbezug:
  Vertrag  -> Preisperioden (gültig ab), bei Wasser Gebührensätze
  Zähler   -> Ablesungen (Zeit, Stand, Quelle), Zählerwechsel und Überlauf
Rechnen:
  preis()         Preis einer Sparte an einem Tag (für den Preisdienst des Kerns)
  eff_price()     Arbeitspreis inkl. Grundpreis-Anteil beim eigenen Jahresverbrauch
  check_reading() Prüfung einer Ablesung gegen Verlauf (Rückwärtslauf, Zahlendreher, ungewöhnlicher Verbrauch)
  usage()/cost()  Verbrauch und Kosten eines Zeitraums, tagesgenau über Preiswechsel hinweg
Geld wird mit Decimal gerechnet und erst am Ende kaufmännisch gerundet.
"""
from __future__ import annotations

import re
from datetime import date, datetime, timedelta
from decimal import ROUND_HALF_UP, Decimal
from typing import Any

SCHEMA = 1
SPARTEN = ("strom", "gas", "wasser", "einspeisung")
SP_NAME = {"strom": "Strom", "gas": "Gas", "wasser": "Wasser & Abwasser", "einspeisung": "Einspeisung"}
SP_UNIT = {"strom": "kWh", "gas": "kWh", "wasser": "m³", "einspeisung": "kWh"}
ARTEN = {"strom_bezug": ("strom", "kWh"), "strom_einsp": ("einspeisung", "kWh"), "gas": ("gas", "m³"), "wasser": ("wasser", "m³"), "garten": ("wasser", "m³")}
QUELLEN = ("manuell", "sensor", "nfc", "foto", "rechnung", "start", "geschaetzt")
DEF_VERBRAUCH = {"strom": 3500.0, "gas": 14000.0, "wasser": 120.0, "einspeisung": 4000.0}
DEF_BRENNWERT, DEF_ZUSTAND = 11.2, 0.96
KEEP_READ = 800
_ID = re.compile(r"^[a-z0-9]{2,16}$")
_ENT = re.compile(r"^(sensor|number|input_number)\.[a-z0-9_]+$")
_TXT = re.compile(r"[<>\"'&\x00-\x1f]")


# --------------------------------------------------------------------------- Helfer
def _f(v: Any, lo: float, hi: float, d: float) -> float:
    try:
        x = float(str(v).replace(",", ".")) if not isinstance(v, (int, float)) else float(v)
    except (TypeError, ValueError):
        return d
    if x != x or x in (float("inf"), float("-inf")):
        return d
    return min(hi, max(lo, x))


def _t(v: Any, n: int) -> str:
    return _TXT.sub("", str(v or "")).strip()[:n]


def parse_date(v: Any) -> date | None:
    if isinstance(v, datetime):
        return v.date()
    if isinstance(v, date):
        return v
    try:
        return date.fromisoformat(str(v)[:10])
    except (TypeError, ValueError):
        return None


def _d(v: Any) -> str:
    x = parse_date(v)
    return x.isoformat() if x and 1990 <= x.year <= 2100 else ""


def parse_ts(v: Any) -> datetime | None:
    try:
        x = datetime.fromisoformat(str(v))
    except (TypeError, ValueError):
        return None
    return x.replace(tzinfo=None)


def add_months(d: date, n: int) -> date:
    m = d.month - 1 + n
    y, m = d.year + m // 12, m % 12 + 1
    last = (date(y + (m == 12), m % 12 + 1, 1) - timedelta(days=1)).day
    return date(y, m, min(d.day, last))


def money(x: Decimal | float) -> float:
    return float(Decimal(str(x)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


# --------------------------------------------------------------------------- Daten säubern
def clean_period(sparte: str, raw: Any) -> dict[str, Any] | None:
    r = raw if isinstance(raw, dict) else {}
    ab = _d(r.get("ab"))
    if not ab:
        return None
    base = {"ab": ab, "brutto": bool(r.get("brutto", True)), "note": _t(r.get("note"), 60)}
    if sparte == "wasser":
        return {**base, "frisch": _f(r.get("frisch"), 0, 50, 0.0), "abw": _f(r.get("abw"), 0, 50, 0.0), "nieder": _f(r.get("nieder"), 0, 20, 0.0),
                "flaeche": _f(r.get("flaeche"), 0, 100000, 0.0), "zg": _f(r.get("zg"), 0, 200, 0.0), "ust": _f(r.get("ust"), 0, 30, 7.0)}
    return {**base, "mode": "dyn" if r.get("mode") == "dyn" and sparte == "strom" else "fix", "ap": _f(r.get("ap"), 0, 500, 0.0), "auf": _f(r.get("auf"), 0, 100, 0.0),
            "gp": _f(r.get("gp"), 0, 500, 0.0), "mess": _f(r.get("mess"), 0, 200, 0.0), "co2": _f(r.get("co2"), 0, 100, 0.0), "steuer": _f(r.get("steuer"), 0, 100, 0.0),
            "ust": _f(r.get("ust"), 0, 30, 0.0 if sparte == "einspeisung" else 19.0)}


def clean_contract(raw: Any) -> dict[str, Any] | None:
    r = raw if isinstance(raw, dict) else {}
    cid, sp = str(r.get("id") or ""), r.get("sparte")
    if not _ID.match(cid) or sp not in SPARTEN:
        return None
    periods = sorted((p for p in (clean_period(sp, x) for x in r.get("periods") or []) if p), key=lambda p: p["ab"])[:40]
    ab = r.get("abschlag") if isinstance(r.get("abschlag"), dict) else {}
    abr = str(r.get("abr") or "")
    return {
        "id": cid, "sparte": sp, "anbieter": _t(r.get("anbieter"), 40), "tarif": _t(r.get("tarif"), 40), "nr": _t(r.get("nr"), 30), "kunde": _t(r.get("kunde"), 30),
        "beginn": _d(r.get("beginn")), "ende": _d(r.get("ende")), "erst": _d(r.get("erst")), "verl": int(_f(r.get("verl"), 0, 36, 0)), "frist": int(_f(r.get("frist"), 0, 52, 0)),
        "garantie": _d(r.get("garantie")), "bonus": _f(r.get("bonus"), 0, 2000, 0.0), "abr": abr if re.fullmatch(r"\d{2}-\d{2}", abr) else "01-01",
        "zahl": r.get("zahl") if r.get("zahl") in ("jahr", "quartal", "monat") else "jahr",
        "abschlag": {"betrag": _f(ab.get("betrag"), 0, 5000, 0.0), "rhythmus": ab.get("rhythmus") if ab.get("rhythmus") in ("monat", "quartal") else "monat", "tag": int(_f(ab.get("tag"), 1, 28, 1))},
        "brennwert": _f(r.get("brennwert"), 5, 15, DEF_BRENNWERT), "zustand": _f(r.get("zustand"), 0.5, 1.2, DEF_ZUSTAND),
        "meters": [m for m in r.get("meters") or [] if isinstance(m, str) and _ID.match(m)][:6], "periods": periods,
    }


def clean_reading(raw: Any) -> dict[str, Any] | None:
    r = raw if isinstance(raw, dict) else {}
    ts = parse_ts(r.get("t"))
    try:
        v = float(r.get("v"))
    except (TypeError, ValueError):
        return None
    if ts is None or v != v or v < 0 or v > 1e9:
        return None
    return {"t": ts.isoformat(timespec="minutes"), "v": round(v, 4), "src": r.get("src") if r.get("src") in QUELLEN else "manuell",
            **({"start": True} if r.get("start") else {}), **({"who": _t(r.get("who"), 30)} if r.get("who") else {}), **({"note": _t(r.get("note"), 60)} if r.get("note") else {})}


def clean_meter(raw: Any) -> dict[str, Any] | None:
    r = raw if isinstance(raw, dict) else {}
    mid, art = str(r.get("id") or ""), r.get("art")
    if not _ID.match(mid) or art not in ARTEN:
        return None
    reads = sorted((x for x in (clean_reading(y) for y in r.get("readings") or []) if x), key=lambda x: x["t"])
    return {"id": mid, "art": art, "name": _t(r.get("name"), 30) or art, "nr": _t(r.get("nr"), 30), "unit": ARTEN[art][1], "dec": int(_f(r.get("dec"), 0, 4, 1 if ARTEN[art][1] == "kWh" else 3)),
            "digits": int(_f(r.get("digits"), 3, 9, 6 if ARTEN[art][1] == "kWh" else 5)), "sensor": str(r.get("sensor") or "") if _ENT.match(str(r.get("sensor") or "")) else "",
            "eich": int(_f(r.get("eich"), 0, 2100, 0)), "readings": thin(reads)}


def thin(reads: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Automatische Tagesstände ausdünnen, sobald es zu viele werden: von Hand erfasste bleiben alle, automatische älter als 400 Tage nur am Monatsersten."""
    if len(reads) <= KEEP_READ:
        return reads
    lim = (parse_ts(reads[-1]["t"]) - timedelta(days=400)).isoformat()
    out = [r for r in reads if r["src"] != "sensor" or r["t"] >= lim or r["t"][8:10] == "01"]
    return out[-KEEP_READ:] if len(out) > KEEP_READ else out


def clean_data(raw: Any) -> dict[str, Any]:
    r = raw if isinstance(raw, dict) else {}
    o = r.get("opts") if isinstance(r.get("opts"), dict) else {}
    vb = o.get("verbrauch") if isinstance(o.get("verbrauch"), dict) else {}
    cs, seen = [], set()
    for c in (clean_contract(x) for x in r.get("contracts") or []):
        if c and c["id"] not in seen:
            seen.add(c["id"])
            cs.append(c)
    ms, seen = [], set()
    for m in (clean_meter(x) for x in r.get("meters") or []):
        if m and m["id"] not in seen:
            seen.add(m["id"])
            ms.append(m)
    ids = {m["id"] for m in ms}
    for c in cs:
        c["meters"] = [m for m in c["meters"] if m in ids]
    hp = r.get("haus_prev") if isinstance(r.get("haus_prev"), dict) else None
    return {"v": SCHEMA, "opts": {"mirror": bool(o.get("mirror", True)), "verbrauch": {k: _f(vb.get(k), 1, 1e6, DEF_VERBRAUCH[k]) for k in SPARTEN}},
            "contracts": cs[:24], "meters": ms[:16], "haus_prev": hp}


# --------------------------------------------------------------------------- Verträge und Preise
def period_at(c: dict[str, Any], day: date) -> dict[str, Any] | None:
    """Preisperiode, die an dem Tag gilt (die letzte mit „gültig ab“ <= Tag). Vor der ersten Periode: die erste."""
    ps = c.get("periods") or []
    if not ps:
        return None
    k = day.isoformat()
    cur = [p for p in ps if p["ab"] <= k]
    return cur[-1] if cur else ps[0]


def active_contract(contracts: list[dict[str, Any]], sparte: str, day: date) -> dict[str, Any] | None:
    k = day.isoformat()
    ok = [c for c in contracts if c["sparte"] == sparte and c["periods"] and (not c["beginn"] or c["beginn"] <= k) and (not c["ende"] or k <= c["ende"])]
    return max(ok, key=lambda c: c["beginn"]) if ok else None


def _g(x: float, p: dict[str, Any]) -> float:
    """Brutto: Eingaben können brutto oder netto sein, gerechnet und angezeigt wird immer brutto."""
    return x if p.get("brutto", True) else x * (1 + p.get("ust", 0) / 100)


def gas_factor(c: dict[str, Any]) -> float:
    """kWh je m³ = Brennwert × Zustandszahl."""
    return c.get("brennwert", DEF_BRENNWERT) * c.get("zustand", DEF_ZUSTAND)


def unit_price(c: dict[str, Any], day: date, dyn_ct: float | None = None) -> dict[str, Any] | None:
    """Preis je Einheit (brutto) an einem Tag. ct = Arbeitspreis in ct je kWh bzw. je m³, grund = feste Kosten in € je Monat."""
    p = period_at(c, day)
    if p is None:
        return None
    if c["sparte"] == "wasser":
        ct = (_g(p["frisch"], p) + p["abw"]) * 100  # Abwasser ist eine Gebühr ohne Umsatzsteuer
        return {"ct": round(ct, 4), "unit": "m³", "grund": round(_g(p["zg"], p), 4), "jahr": round(p["nieder"] * p["flaeche"], 2), "dyn": False, "ab": p["ab"],
                "teile": {"frisch": round(_g(p["frisch"], p), 4), "abw": p["abw"], "nieder": p["nieder"], "flaeche": p["flaeche"]}}
    dyn = p.get("mode") == "dyn"
    if dyn:
        ct = None if dyn_ct is None else dyn_ct + _g(p["auf"], p)
    else:
        ct = _g(p["ap"], p)
    out = {"ct": None if ct is None else round(ct, 4), "unit": "kWh", "grund": round(_g(p["gp"] + p["mess"], p), 4), "jahr": 0.0, "dyn": dyn, "ab": p["ab"]}
    if c["sparte"] == "gas" and ct is not None:
        out["ct_m3"] = round(ct * gas_factor(c), 4)
    return out


def eff_price(c: dict[str, Any], day: date, verbrauch: float, dyn_ct: float | None = None) -> float | None:
    """Effektiver Preis in ct je Einheit beim eigenen Jahresverbrauch: Arbeitspreis + feste Kosten des Jahres – Bonus im ersten Jahr."""
    u = unit_price(c, day, dyn_ct)
    if u is None or u["ct"] is None or verbrauch <= 0:
        return None
    fix = u["grund"] * 12 + u["jahr"]
    b = parse_date(c.get("beginn"))
    if c.get("bonus") and b and b <= day < add_months(b, 12):
        fix -= c["bonus"]
    return round(u["ct"] + fix * 100 / verbrauch, 3)


def preis(data: dict[str, Any], sparte: str, day: date, mit_grundpreis: bool = False, dyn_ct: float | None = None) -> dict[str, Any] | None:
    """Für den Preisdienst des Kerns: Preis der Sparte am Tag. None = kein Vertrag (der Kern fragt dann die nächste Quelle)."""
    c = active_contract(data["contracts"], sparte, day)
    if c is None:
        return None
    u = unit_price(c, day, dyn_ct)
    if u is None or u["ct"] is None:
        return None
    ct = eff_price(c, day, data["opts"]["verbrauch"][sparte], dyn_ct) if mit_grundpreis else u["ct"]
    return {"ct": ct, "unit": u["unit"], "grund": u["grund"], "dyn": u["dyn"], "vertrag": c["id"], "name": c["tarif"] or c["anbieter"] or SP_NAME[sparte], "ab": u["ab"]}


def price_changes(c: dict[str, Any]) -> list[dict[str, Any]]:
    """Preisverlauf mit Änderung in Prozent gegenüber der Periode davor (Arbeitspreis)."""
    out: list[dict[str, Any]] = []
    prev = None
    for p in c["periods"]:
        u = unit_price({**c, "periods": [p]}, parse_date(p["ab"]))
        ct = u["ct"] if u else None
        out.append({"ab": p["ab"], "ct": ct, "grund": u["grund"] if u else 0.0, "dyn": bool(u and u["dyn"]), "note": p.get("note", ""),
                    "pct": round((ct - prev) / prev * 100, 1) if ct is not None and prev else None})
        prev = ct if ct is not None else prev
    return out


def term(c: dict[str, Any], today: date) -> dict[str, Any] | None:
    """Laufzeit: Ende der laufenden Vertragsperiode und der Tag, bis zu dem gekündigt sein muss."""
    end = parse_date(c.get("erst"))
    if end is None:
        return None
    n = 0
    while end < today and c.get("verl") and n < 120:
        end = add_months(end, c["verl"])
        n += 1
    bis = end - timedelta(weeks=c.get("frist", 0))
    return {"ende": end.isoformat(), "kuendigen_bis": bis.isoformat(), "tage": (bis - today).days, "verlaengert": n > 0, "abgelaufen": end < today}


def billing_start(c: dict[str, Any], today: date) -> date:
    """Beginn des laufenden Abrechnungsjahres (Stichtag MM-TT), nie vor dem Vertragsbeginn."""
    m, d = int(c["abr"][:2]), int(c["abr"][3:])
    try:
        s = date(today.year, m, d)
    except ValueError:
        s = date(today.year, 1, 1)
    if s > today:
        s = date(s.year - 1, s.month, s.day)
    b = parse_date(c.get("beginn"))
    return max(s, b) if b and b <= today else s


def events(data: dict[str, Any], today: date) -> list[dict[str, Any]]:
    """„Als Nächstes“: Kündigungsfristen, Ende der Preisgarantie, angekündigte Preisänderungen, Eichfristen."""
    out: list[dict[str, Any]] = []
    for c in data["contracts"]:
        if c["ende"] and c["ende"] < today.isoformat():
            continue
        nm = f"{SP_NAME[c['sparte']]}{' · ' + c['tarif'] if c['tarif'] else ''}"
        t = term(c, today)
        if t and not t["abgelaufen"] and 0 <= t["tage"] <= 120:
            out.append({"k": "frist", "d": t["kuendigen_bis"], "tage": t["tage"], "t": f"Kündigungsfrist {nm}", "s": f"Laufzeit bis {_de(t['ende'])}", "c": "wa" if t["tage"] <= 45 else ""})
        g = parse_date(c.get("garantie"))
        if g and 0 <= (g - today).days <= 120:
            out.append({"k": "garantie", "d": g.isoformat(), "tage": (g - today).days, "t": f"Preisgarantie endet · {nm}", "s": "Danach kann der Anbieter den Preis ändern", "c": ""})
        for x in price_changes(c):
            d = parse_date(x["ab"])
            if d and d > today and (d - today).days <= 200:
                pct = f"{'+' if (x['pct'] or 0) > 0 else ''}{str(x['pct']).replace('.', ',')} %" if x["pct"] is not None else ""
                out.append({"k": "preis", "d": x["ab"], "tage": (d - today).days, "t": f"Neuer Preis ab {_de(x['ab'])} · {nm}", "s": f"{pct}{' · Sonderkündigung möglich' if (x['pct'] or 0) > 0 else ''}".strip(" ·"),
                            "c": "wa" if (x["pct"] or 0) > 0 else "ok"})
    for m in data["meters"]:
        if m["eich"] and m["eich"] <= today.year + 1:
            out.append({"k": "eich", "d": f"{m['eich']}-12-31", "tage": (date(m["eich"], 12, 31) - today).days, "t": f"Eichfrist {m['name']}", "s": f"gültig bis Ende {m['eich']}", "c": "wa" if m["eich"] <= today.year else ""})
    return sorted(out, key=lambda x: x["d"])


def _de(iso: str) -> str:
    d = parse_date(iso)
    return d.strftime("%d.%m.%Y") if d else iso


# --------------------------------------------------------------------------- Zähler und Ablesungen
def cumulative(m: dict[str, Any]) -> list[tuple[datetime, float, dict[str, Any]]]:
    """Ablesungen als fortlaufender Verbrauch: Zählerwechsel („start“) und Überlauf (999999 -> 0) werden herausgerechnet."""
    out: list[tuple[datetime, float, dict[str, Any]]] = []
    cum, prev = 0.0, None
    span = 10 ** m.get("digits", 6)
    for r in m["readings"]:
        ts = parse_ts(r["t"])
        if ts is None:
            continue
        if prev is not None and not r.get("start"):
            dv = r["v"] - prev
            if dv < 0 and prev > span * 0.9 and r["v"] < span * 0.1:
                dv += span  # Zählerüberlauf
            cum += max(0.0, dv)
        prev = r["v"]
        out.append((ts, cum, r))
    return out


def rate(m: dict[str, Any], days: int = 90) -> float | None:
    """Durchschnitt je Tag aus den letzten Ablesungen (höchstens 90 Tage zurück, mindestens ein Tag Abstand)."""
    c = cumulative(m)
    if len(c) < 2:
        return None
    t1, v1, _ = c[-1]
    first = next((x for x in c if (t1 - x[0]).days <= days), c[-2])
    if (t1 - first[0]).total_seconds() < 86400:
        first = next((x for x in reversed(c) if (t1 - x[0]).total_seconds() >= 86400), c[0])
    span = (t1 - first[0]).total_seconds() / 86400
    return (v1 - first[1]) / span if span >= 1 else None


def expect(m: dict[str, Any], ts: datetime) -> float | None:
    """Erwarteter Zählerstand zum Zeitpunkt (Vorschlag für die Eingabe)."""
    if not m["readings"]:
        return None
    last = m["readings"][-1]
    r = rate(m)
    t0 = parse_ts(last["t"])
    if r is None or t0 is None:
        return last["v"]
    return last["v"] + r * max(0.0, (ts - t0).total_seconds() / 86400)


def interp(m: dict[str, Any], ts: datetime) -> tuple[float, bool] | None:
    """Fortlaufender Verbrauch zum Zeitpunkt. Zwischen zwei Ablesungen tagesgenau verteilt, danach mit dem Durchschnitt geschätzt. (Wert, geschätzt)."""
    c = cumulative(m)
    if not c or ts < c[0][0]:
        return None
    for i, (t, v, _) in enumerate(c):
        if t == ts:
            return v, False
        if t > ts:
            t0, v0, _ = c[i - 1]
            return v0 + (v - v0) * (ts - t0).total_seconds() / (t - t0).total_seconds(), True
    t1, v1, _ = c[-1]
    r = rate(m) or 0.0
    return v1 + r * (ts - t1).total_seconds() / 86400, (ts - t1).total_seconds() > 86400


def usage(m: dict[str, Any], t0: datetime, t1: datetime) -> dict[str, Any] | None:
    """Verbrauch zwischen zwei Zeitpunkten. Beginnt der Zeitraum vor der ersten Ablesung, zählt er ab dieser."""
    c = cumulative(m)
    if not c or t1 <= c[0][0]:
        return None
    a = interp(m, max(t0, c[0][0]))
    b = interp(m, t1)
    if a is None or b is None:
        return None
    return {"v": max(0.0, b[0] - a[0]), "est": a[1] or b[1], "ab": max(t0, c[0][0]).isoformat(timespec="minutes"), "kurz": t0 < c[0][0]}


def _swaps(v: float) -> list[float]:
    s = f"{v:.4f}"
    ip, _, fp = s.partition(".")
    out = []
    for i in range(len(ip) - 1):
        if ip[i] != ip[i + 1]:
            out.append(float(f"{ip[:i]}{ip[i + 1]}{ip[i]}{ip[i + 2:]}.{fp}"))
    return out


def check_reading(m: dict[str, Any], v: float, ts: datetime, now: datetime) -> dict[str, Any]:
    """Prüfung gegen den Verlauf. level: ok · warn (speichern möglich) · bad (nur als Zählerwechsel sinnvoll)."""
    u = m["unit"]

    def n(x: float) -> str:
        return f"{x:,.{min(3, m['dec'])}f}".replace(",", "X").replace(".", ",").replace("X", ".")

    if ts > now + timedelta(minutes=10):
        return {"level": "bad", "msg": "Der Zeitpunkt liegt in der Zukunft.", "expect": None}
    reads = m["readings"]
    if not reads:
        return {"level": "ok", "msg": "Erster Stand dieses Zählers.", "expect": None}
    before = [r for r in reads if r["t"] <= ts.isoformat(timespec="minutes")]
    after = [r for r in reads if r["t"] > ts.isoformat(timespec="minutes")]
    exp = expect(m, ts) if not after else None
    span = 10 ** m["digits"]
    if v >= span:
        return {"level": "bad", "msg": f"Der Zähler hat nur {m['digits']} Stellen vor dem Komma.", "expect": exp}
    if before:
        p = before[-1]
        if p["t"] == ts.isoformat(timespec="minutes") and abs(p["v"] - v) < 1e-9:
            return {"level": "bad", "msg": "Dieser Stand ist für diesen Zeitpunkt schon gespeichert.", "expect": exp}
        if v < p["v"] - 1e-9:
            if p["v"] > span * 0.9 and v < span * 0.1:
                return {"level": "warn", "msg": "Zählerüberlauf erkannt: Der Zähler ist über das Ende gelaufen und zählt wieder von vorn.", "expect": exp}
            sw = [x for x in _swaps(v) if x >= p["v"] and exp is not None and abs(x - exp) <= max(2.0, abs(exp - p["v"]) * 1.5)]
            hint = f" Ziffern vertauscht? Gemeint ist vielleicht {n(sw[0])}." if sw else " Wurde der Zähler getauscht, nutze „Zähler tauschen“."
            return {"level": "bad", "msg": f"Kleiner als der letzte Stand ({n(p['v'])} {u} vom {_de(p['t'])}).{hint}", "expect": exp}
    if after and v > after[0]["v"] + 1e-9:
        return {"level": "bad", "msg": f"Größer als der spätere Stand ({n(after[0]['v'])} {u} vom {_de(after[0]['t'])}).", "expect": exp}
    r = rate(m)
    if before and r is not None and r > 0 and not after:
        p = before[-1]
        days = max((ts - parse_ts(p["t"])).total_seconds() / 86400, 1 / 24)
        per = (v - p["v"]) / days
        tol = max(r * days * 3, r * 2, 10 ** -m["dec"] * 5)
        if v - p["v"] > tol and days >= 0.5:
            sw = [x for x in _swaps(v) if x >= p["v"] and abs(x - exp) < abs(v - exp) / 4] if exp is not None else []
            if sw:
                return {"level": "warn", "msg": f"Ziffern vertauscht? Erwartet werden etwa {n(exp)} {u}, {n(sw[0])} würde passen.", "expect": exp}
            return {"level": "warn", "msg": f"Ungewöhnlich hoch: {n(per)} {u} je Tag statt sonst {n(r)}.", "expect": exp}
    return {"level": "ok", "msg": "plausibel", "expect": exp}


def add_reading(m: dict[str, Any], r: dict[str, Any]) -> None:
    """Ablesung einsortieren. Gleicher Zeitpunkt ersetzt den alten Eintrag."""
    m["readings"] = thin(sorted([x for x in m["readings"] if x["t"] != r["t"]] + [r], key=lambda x: x["t"]))


def daily(m: dict[str, Any]) -> list[dict[str, Any]]:
    """Ablesungen mit Verbrauch je Tag seit dem Eintrag davor (für die Liste)."""
    out: list[dict[str, Any]] = []
    prev = None
    for ts, cum, r in cumulative(m):
        x = {**r, "per": None}
        if prev is not None and not r.get("start"):
            days = (ts - prev[0]).total_seconds() / 86400
            if days >= 0.02:
                x["per"] = round((cum - prev[1]) / days, 4)
        out.append(x)
        prev = (ts, cum)
    return out


# --------------------------------------------------------------------------- Kosten eines Zeitraums
def cost(c: dict[str, Any], meters: list[dict[str, Any]], d0: date, d1: date, dyn_ct: float | None = None) -> dict[str, Any] | None:
    """Kosten von d0 (einschließlich) bis d1 (ausschließlich): Verbrauch je Preisperiode × Arbeitspreis + feste Kosten tagesanteilig.
    Mehrere Zähler einer Sparte: Hauptzähler zählen zusammen, ein Gartenzähler mindert bei Wasser nur die Abwassermenge."""
    if d1 <= d0 or not c["periods"]:
        return None
    cuts = sorted({d0, d1, *(x for x in (parse_date(p["ab"]) for p in c["periods"]) if x and d0 < x < d1)})
    main = [m for m in meters if m["art"] != "garten"]
    garden = [m for m in meters if m["art"] == "garten"]
    arbeit = grund = Decimal(0)
    menge, est, any_use, kurz = 0.0, False, False, False
    for a, b in zip(cuts, cuts[1:]):
        u = unit_price(c, a, dyn_ct)
        if u is None:
            continue
        days = (b - a).days
        grund += Decimal(str(u["grund"])) * 12 * days / Decimal(365) + Decimal(str(u["jahr"])) * days / Decimal(365)
        t0, t1 = datetime.combine(a, datetime.min.time()), datetime.combine(b, datetime.min.time())
        v, gv = 0.0, 0.0
        for m in main:
            x = usage(m, t0, t1)
            if x:
                v, est, any_use, kurz = v + x["v"], est or x["est"], True, kurz or x["kurz"]
        for m in garden:
            x = usage(m, t0, t1)
            if x:
                gv += x["v"]
        if c["sparte"] == "gas":
            v *= gas_factor(c)
        menge += v
        if u["ct"] is None:
            continue
        if c["sparte"] == "wasser":
            t = u["teile"]
            arbeit += Decimal(str(t["frisch"])) * Decimal(str(v)) + Decimal(str(t["abw"])) * Decimal(str(max(0.0, v - gv)))
        else:
            arbeit += Decimal(str(u["ct"])) * Decimal(str(v)) / 100
    return {"eur": money(arbeit + grund), "arbeit": money(arbeit), "grund": money(grund), "menge": round(menge, 3), "unit": SP_UNIT[c["sparte"]], "est": est, "gemessen": any_use, "kurz": kurz, "tage": (d1 - d0).days}
