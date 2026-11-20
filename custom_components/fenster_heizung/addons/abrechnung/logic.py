"""Modul 20 Abrechnungen: Rechenkern ohne Home Assistant (Konzept G1).

Bausteine mit Zeitbezug:
  Vertrag  -> Preisperioden (gültig ab), bei Wasser Gebührensätze
  Zähler   -> Ablesungen (Zeit, Stand, Quelle), Zählerwechsel und Überlauf
Rechnen:
  preis()         Preis einer Sparte an einem Tag (für den Preisdienst des Kerns)
  eff_price()     Arbeitspreis inkl. Grundpreis-Anteil beim eigenen Jahresverbrauch
  check_reading() Prüfung einer Ablesung gegen Verlauf (Rückwärtslauf, Zahlendreher, ungewöhnlicher Verbrauch)
  usage()/cost()  Verbrauch und Kosten eines Zeitraums, tagesgenau über Preiswechsel hinweg
v0.3 „Übersicht & Prognose“:
  bounds()        Abrechnungszeitraum (Jahr, Quartal oder Monat)
  schedule()      Abschlagsplan mit Änderungen (gültig ab) und gebuchten Zahlungen
  forecast()      Hochrechnung bis zum Ende des Zeitraums mit Bandbreite, Monatsreihe, Ergebnis und Empfehlung
  dyn_compare()   Dynamischer Tarif gegen festen Vergleichspreis mit dem eigenen Stundenprofil
v0.5 „Rechnungen“ (Beta):
  check_invoice() Rechnungsprüfung gegen eigene Messung, Vertrag und gezahlte Abschläge
  vehicle_stats() Fahrtkosten je Fahrzeug: € je 100 km, Verbrauch (Volltank zu Volltank), Vollkosten je km
  stock()         Vorräte: Bestand, gleitender Durchschnittspreis, Verbrauch je Tag, Reichweite, „bestellen bis“
Geld wird mit Decimal gerechnet und erst am Ende kaufmännisch gerundet.
"""
from __future__ import annotations

import math
import re
from datetime import date, datetime, timedelta
from decimal import ROUND_HALF_UP, Decimal
from typing import Any

SCHEMA = 3
SPARTEN = ("strom", "gas", "wasser", "einspeisung")
SP_NAME = {"strom": "Strom", "gas": "Gas", "wasser": "Wasser & Abwasser", "einspeisung": "Einspeisung"}
SP_UNIT = {"strom": "kWh", "gas": "kWh", "wasser": "m³", "einspeisung": "kWh"}
ARTEN = {"strom_bezug": ("strom", "kWh"), "strom_einsp": ("einspeisung", "kWh"), "gas": ("gas", "m³"), "wasser": ("wasser", "m³"), "garten": ("wasser", "m³")}
QUELLEN = ("manuell", "sensor", "nfc", "foto", "rechnung", "start", "geschaetzt")
DEF_VERBRAUCH = {"strom": 3500.0, "gas": 14000.0, "wasser": 120.0, "einspeisung": 4000.0}
DEF_BRENNWERT, DEF_ZUSTAND = 11.2, 0.96
KEEP_READ = 800
# Monatsanteile am Jahresverbrauch (Jan … Dez), solange kein eigenes Vorjahr vorliegt. Gas: Heizung + Warmwasser, Strom: Haushalt,
# Wasser: Garten im Sommer, Einspeisung: Ertrag einer Süd-Anlage in Deutschland.
PROFIL = {
    "gas": (0.165, 0.14, 0.12, 0.08, 0.045, 0.025, 0.02, 0.02, 0.035, 0.075, 0.12, 0.155),
    "strom": (0.095, 0.085, 0.088, 0.08, 0.078, 0.072, 0.074, 0.074, 0.076, 0.084, 0.09, 0.104),
    "wasser": (0.075, 0.07, 0.078, 0.082, 0.09, 0.095, 0.1, 0.1, 0.085, 0.078, 0.072, 0.075),
    "einspeisung": (0.02, 0.04, 0.08, 0.11, 0.13, 0.15, 0.15, 0.12, 0.09, 0.06, 0.03, 0.02),
}
MONATE = ("Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez")
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
        "abschlag": {"betrag": _f(ab.get("betrag"), 0, 5000, 0.0), "rhythmus": ab.get("rhythmus") if ab.get("rhythmus") in ("monat", "quartal") or (ab.get("rhythmus") == "var" and sp == "einspeisung") else "monat", "tag": int(_f(ab.get("tag"), 1, 28, 1))},
        "brennwert": _f(r.get("brennwert"), 5, 40, DEF_BRENNWERT), "zustand": _f(r.get("zustand"), 0.5, 1.2, DEF_ZUSTAND),
        "meters": [m for m in r.get("meters") or [] if isinstance(m, str) and _ID.match(m)][:6], "periods": periods,
        "abplan": clean_abplan(r.get("abplan")), "zahlungen": clean_pays(r.get("zahlungen")),
        "rechnungen": sorted((x for x in (clean_invoice(y) for y in r.get("rechnungen") or []) if x), key=lambda x: x["bis"])[-30:],
        **({"anlagen": clean_anlagen(r.get("anlagen"))} if sp == "einspeisung" else {}),
    }


def clean_anlagen(raw: Any) -> dict[str, Any]:
    """Einspeisung: mehrere Anlagen hinter demselben Zähler (z. B. Dachanlage + Balkonkraftwerk). kwp = installierte Modulleistung,
    ct = Vergütung der weiteren Anlage (0 = unentgeltliche Abnahme, wie bei Steckersolargeräten üblich)."""
    r = raw if isinstance(raw, dict) else {}
    w = []
    for x in (r.get("weitere") if isinstance(r.get("weitere"), list) else [])[:4]:
        x = x if isinstance(x, dict) else {}
        k = _f(x.get("kwp"), 0, 100, 0.0)
        if k > 0:
            w.append({"name": _t(x.get("name"), 30) or "Balkonkraftwerk", "kwp": round(k, 3), "ct": _f(x.get("ct"), 0, 50, 0.0)})
    return {"kwp": round(_f(r.get("kwp"), 0, 1000, 0.0), 3), "weitere": w, "modus": "kwh" if r.get("modus") == "kwh" else "mix",
            "abzug_kwh": round(_f(r.get("abzug_kwh"), 0, 100000, 0.0), 1)}


def mix_rate(c: dict[str, Any], ct: float) -> tuple[float, dict[str, Any] | None]:
    """§ 24 Abs. 3 EEG: Speisen Anlagen mit unterschiedlicher Vergütung über denselben Zähler ein, gilt für die gemessene Einspeisung
    ein Mischsatz im Verhältnis der installierten Modulleistung (Bundesnetzagentur, Steckersolargeräte)."""
    a = c.get("anlagen") or {}
    w = a.get("weitere") or []
    if c.get("sparte") != "einspeisung" or not w or not a.get("kwp") or a.get("modus") == "kwh":
        return ct, None
    tot = a["kwp"] + sum(x["kwp"] for x in w)
    mix = ct * a["kwp"] / tot + sum(x["kwp"] * x["ct"] for x in w) / tot
    return mix, {"satz": round(ct, 4), "mix": round(mix, 4), "anteil": round(a["kwp"] / tot * 100, 1), "abzug": round(ct - mix, 4), "kwp": a["kwp"], "weitere": w, "summe_kwp": round(tot, 3)}


def clean_abplan(raw: Any) -> list[dict[str, Any]]:
    """Abschlagsänderungen: ab diesem Tag gilt der neue Betrag (Rhythmus und Fälligkeitstag)."""
    out: dict[str, dict[str, Any]] = {}
    for x in raw if isinstance(raw, list) else []:
        x = x if isinstance(x, dict) else {}
        ab = _d(x.get("ab"))
        if ab:
            out[ab] = {"ab": ab, "betrag": _f(x.get("betrag"), 0, 5000, 0.0), "rhythmus": x.get("rhythmus") if x.get("rhythmus") in ("monat", "quartal") else "monat",
                       "tag": int(_f(x.get("tag"), 1, 28, 1)), "note": _t(x.get("note"), 60)}
    return [out[k] for k in sorted(out)][-40:]


def clean_pays(raw: Any) -> list[dict[str, Any]]:
    """Gebuchte Zahlungen: gleicher Tag wie ein geplanter Abschlag ersetzt ihn (0 € = ausgefallen), sonst Sonderzahlung."""
    out: dict[str, dict[str, Any]] = {}
    for x in raw if isinstance(raw, list) else []:
        x = x if isinstance(x, dict) else {}
        d = _d(x.get("d"))
        if d:
            out[d] = {"d": d, "betrag": _f(x.get("betrag"), 0, 20000, 0.0), "note": _t(x.get("note"), 60)}
    return [out[k] for k in sorted(out)][-120:]


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
    gp = r.get("gas_prev") if isinstance(r.get("gas_prev"), dict) else None
    vg = o.get("vgl") if isinstance(o.get("vgl"), dict) else {}
    vgl = {"ap": _f(vg.get("ap"), 0, 200, 0.0), "gp": _f(vg.get("gp"), 0, 100, 0.0), "name": _t(vg.get("name"), 30)} if vg.get("ap") not in (None, "", 0, 0.0) else None
    rm = o.get("remind") if isinstance(o.get("remind"), dict) else {}
    opts = {"mirror": bool(o.get("mirror", True)), "verbrauch": {k: _f(vb.get(k), 1, 1e6, DEF_VERBRAUCH[k]) for k in SPARTEN}, "vgl": vgl,
            "notify": [x for x in dict.fromkeys(o.get("notify") or []) if isinstance(x, str) and re.match(r"^notify\.[a-z0-9_]+$", x)][:6],
            "remind": {"on": bool(rm.get("on", True)), "tage": int(_f(rm.get("tage"), 0, 14, 0))}, "tol": _f(o.get("tol"), 0.5, 10, 2.0),
            "todo": str(o.get("todo") or "") if re.match(r"^todo\.[a-z0-9_]+$", str(o.get("todo") or "")) else "", "solar": o.get("solar") if o.get("solar") in ("null", "einsp", "vertrag") else "einsp",
            "sensoren": bool(o.get("sensoren", True)),
            "muell": {"grund": _f((o.get("muell") or {}).get("grund") if isinstance(o.get("muell"), dict) else None, 0, 5000, 0.0)}}
    cars, seen = [], set()
    for v in (clean_vehicle(x) for x in r.get("fahrzeuge") or []):
        if v and v["id"] not in seen:
            seen.add(v["id"])
            cars.append(v)
    st, seen = [], set()
    for v in (clean_item(x) for x in r.get("vorraete") or []):
        if v and v["id"] not in seen:
            seen.add(v["id"])
            st.append(v)
    sent = r.get("sent") if isinstance(r.get("sent"), dict) else {}
    return {"v": SCHEMA, "opts": opts, "fahrzeuge": cars[:8], "vorraete": st[:30], "sent": {str(k)[:40]: str(v)[:10] for k, v in list(sent.items())[-200:]},
            "contracts": cs[:24], "meters": ms[:16], "haus_prev": hp, "gas_prev": gp,
            "fixes": [str(x)[:20] for x in (r.get("fixes") or []) if isinstance(x, str)][:20]}


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
    mx = None
    if ct is not None and c["sparte"] == "einspeisung":
        ct, mx = mix_rate(c, ct)
    out = {"ct": None if ct is None else round(ct, 4), "unit": "kWh", "grund": round(_g(p["gp"] + p["mess"], p), 4), "jahr": 0.0, "dyn": dyn, "ab": p["ab"], **({"mix": mx} if mx else {})}
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
        if c["sparte"] in ("strom", "gas", "wasser") and (not c["ende"] or c["ende"] >= today.isoformat()):
            nx = next((x for x in schedule(c, today, add_months(today, 2)) if x["d"] >= today.isoformat() and x["betrag"] > 0), None)
            if nx and (parse_date(nx["d"]) - today).days <= 21:
                out.append({"k": "abschlag", "d": nx["d"], "tage": (parse_date(nx["d"]) - today).days, "t": f"Abschlag {SP_NAME[c['sparte']].split(' ')[0]}",
                            "s": f"{_eur(nx['betrag'])}{' · gebucht' if nx['src'] != 'plan' else ''}", "c": ""})
        if c["sparte"] != "einspeisung" and c.get("zahl") != "monat" and (not c["ende"] or c["ende"] >= today.isoformat()):
            stich = bounds(c, today)[1] - timedelta(days=1)
            hand = [m for m in data["meters"] if m["id"] in c["meters"] and not m["sensor"]]
            if hand and 0 <= (stich - today).days <= 30:
                out.append({"k": "ablesen", "d": stich.isoformat(), "tage": (stich - today).days, "t": f"Ablesung {SP_NAME[c['sparte']].split(' ')[0]}",
                            "s": f"Stichtag · {', '.join(m['name'] for m in hand)}", "c": "", "m": hand[0]["id"]})
    for it in data.get("vorraete") or []:
        st = stock(it, today)
        if st["unter_min"]:
            out.append({"k": "vorrat", "d": today.isoformat(), "tage": 0, "t": f"{it['name']} nachkaufen", "s": f"Bestand {_n(st['bestand'], 1)} {it['unit']} · Mindestbestand erreicht", "c": "wa"})
        elif st.get("bestellen_bis") and (parse_date(st["bestellen_bis"]) - today).days <= 30:
            out.append({"k": "vorrat", "d": st["bestellen_bis"], "tage": max(0, (parse_date(st["bestellen_bis"]) - today).days), "t": f"{it['name']} bestellen",
                        "s": f"reicht bis {_de(st['reicht_bis'])} · {it['liefer']} Tage Lieferzeit", "c": "wa" if (parse_date(st["bestellen_bis"]) - today).days <= 7 else ""})
    for m in data["meters"]:
        if m["eich"] and m["eich"] <= today.year + 1:
            out.append({"k": "eich", "d": f"{m['eich']}-12-31", "tage": (date(m["eich"], 12, 31) - today).days, "t": f"Eichfrist {m['name']}", "s": f"gültig bis Ende {m['eich']}", "c": "wa" if m["eich"] <= today.year else ""})
    return sorted(out, key=lambda x: x["d"])


def _eur(x: float) -> str:
    return f"{x:,.2f} €".replace(",", "X").replace(".", ",").replace("X", ".")


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


# --------------------------------------------------------------------------- v0.3: Abrechnungszeitraum, Abschläge, Hochrechnung
def _month_start(d: date) -> date:
    return date(d.year, d.month, 1)


def bounds(c: dict[str, Any], today: date) -> tuple[date, date]:
    """Laufender Abrechnungszeitraum [Beginn, Ende): Jahr ab Stichtag, Quartal oder Kalendermonat. Nie vor Vertragsbeginn, nie nach Vertragsende."""
    if c.get("zahl") == "monat":
        s, e = _month_start(today), add_months(_month_start(today), 1)
    elif c.get("zahl") == "quartal":
        s = date(today.year, (today.month - 1) // 3 * 3 + 1, 1)
        e = add_months(s, 3)
    else:
        s = billing_start(c, today)
        m, d = int(c["abr"][:2]), int(c["abr"][3:])
        try:
            e = date(s.year + 1, m, d) if (s.month, s.day) >= (m, d) else date(s.year, m, d)
        except ValueError:
            e = date(s.year + 1, 1, 1)
        if e <= s:
            e = add_months(s, 12)
    b = parse_date(c.get("beginn"))
    if b and s < b <= today:
        s = b
    end = parse_date(c.get("ende"))
    if end and s < end + timedelta(days=1) < e:
        e = end + timedelta(days=1)
    return s, e


def abschlag_at(c: dict[str, Any], day: date) -> dict[str, Any]:
    """Abschlag, der an dem Tag gilt: letzte Änderung mit „ab“ <= Tag, sonst der Abschlag aus dem Vertrag."""
    k = day.isoformat()
    cur = [x for x in c.get("abplan") or [] if x["ab"] <= k]
    return cur[-1] if cur else {"ab": "", **c.get("abschlag", {"betrag": 0.0, "rhythmus": "monat", "tag": 1})}


def schedule(c: dict[str, Any], d0: date, d1: date) -> list[dict[str, Any]]:
    """Abschläge von d0 (inkl.) bis d1 (exkl.). Lastschrift: am Fälligkeitstag gilt der Abschlag als bezahlt.
    src: plan (aus dem Plan) · gebucht (am Tag eines geplanten Abschlags anders gezahlt, 0 € = ausgefallen) · extra (Sonderzahlung)."""
    if d1 <= d0:
        return []  # bei Einspeisung: Abschläge, die der Netzbetreiber überweist
    b = parse_date(c.get("beginn"))
    e = parse_date(c.get("ende"))
    out: dict[str, dict[str, Any]] = {}
    anchor = _month_start(bounds(c, d0)[0])
    m = _month_start(d0)
    while m < d1:
        a = abschlag_at(c, m.replace(day=min(28, abschlag_at(c, m)["tag"])))
        day = m.replace(day=a["tag"])
        anc = _month_start(parse_date(a["ab"])) if a.get("ab") else anchor
        months = (m.year - anc.year) * 12 + m.month - anc.month
        if a["betrag"] > 0 and a["rhythmus"] != "var" and d0 <= day < d1 and (a["rhythmus"] == "monat" or months % 3 == 0) and (not b or day >= b) and (not e or day <= e):
            out[day.isoformat()] = {"d": day.isoformat(), "betrag": a["betrag"], "src": "plan", "plan": a["betrag"]}
        m = add_months(m, 1)
    for p in c.get("zahlungen") or []:
        dp = parse_date(p["d"])
        if dp and d0 <= dp < d1:
            x = out.get(p["d"])
            out[p["d"]] = {"d": p["d"], "betrag": p["betrag"], "src": "gebucht" if x else "extra", "plan": x["plan"] if x else 0.0, "note": p.get("note", "")}
    return [out[k] for k in sorted(out)]


def _share(prof: tuple[float, ...], a: date, b: date) -> float:
    """Anteil des Jahresverbrauchs zwischen a (inkl.) und b (exkl.) nach Monatsprofil, tagesgenau."""
    t, d = 0.0, a
    while d < b:
        nm = add_months(_month_start(d), 1)
        e = min(b, nm)
        dim = (nm - _month_start(d)).days
        t += prof[d.month - 1] * (e - d).days / dim
        d = e
    return t


def learned_profile(meters: list[dict[str, Any]], today: date) -> tuple[float, ...] | None:
    """Eigenes Monatsprofil aus den letzten zwölf vollen Monaten (Vorjahr), wenn die Zähler so weit zurückreichen."""
    main = [m for m in meters if m["art"] != "garten"]
    end = _month_start(today)
    start = add_months(end, -12)
    t0 = datetime.combine(start, datetime.min.time())
    if not main or any(not m["readings"] or parse_ts(m["readings"][0]["t"]) > t0 + timedelta(days=3) for m in main):
        return None
    vals = []
    for i in range(12):
        a = add_months(start, i)
        b = add_months(a, 1)
        v = 0.0
        for m in main:
            u = usage(m, datetime.combine(a, datetime.min.time()), datetime.combine(b, datetime.min.time()))
            v += u["v"] if u else 0.0
        vals.append((a.month, v))
    tot = sum(v for _, v in vals)
    if tot <= 0:
        return None
    prof = [0.0] * 12
    for mo, v in vals:
        prof[mo - 1] = v / tot
    return tuple(prof)


def _rest(c: dict[str, Any], a: date, b: date, annual: float, prof: tuple[float, ...], gfrac: float, dyn_ct: float | None) -> dict[str, Decimal | float]:
    """Kosten von a bis b aus einem angenommenen Jahresverbrauch (Zählereinheit) – Monate und Preisperioden tagesgenau geteilt."""
    cuts = {a, b}
    d = add_months(_month_start(a), 1)
    while d < b:
        cuts.add(d)
        d = add_months(d, 1)
    cuts |= {x for x in (parse_date(p["ab"]) for p in c["periods"]) if x and a < x < b}
    cuts = sorted(cuts)
    arbeit = grund = Decimal(0)
    menge = 0.0
    for x, y in zip(cuts, cuts[1:]):
        u = unit_price(c, x, dyn_ct)
        if u is None:
            continue
        days = (y - x).days
        grund += Decimal(str(u["grund"])) * 12 * days / Decimal(365) + Decimal(str(u["jahr"])) * days / Decimal(365)
        v = annual * _share(prof, x, y)
        if c["sparte"] == "gas":
            v *= gas_factor(c)
        menge += v
        if u["ct"] is None:
            continue
        if c["sparte"] == "wasser":
            t = u["teile"]
            arbeit += Decimal(str(t["frisch"])) * Decimal(str(v)) + Decimal(str(t["abw"])) * Decimal(str(v * (1 - gfrac)))
        else:
            arbeit += Decimal(str(u["ct"])) * Decimal(str(v)) / 100
    return {"arbeit": arbeit, "grund": grund, "menge": menge}


def forecast(c: dict[str, Any], meters: list[dict[str, Any]], today: date, verbrauch: float, dyn_ct: float | None = None,
             temps: dict[str, float] | None = None) -> dict[str, Any]:
    """Hochrechnung für den laufenden Abrechnungszeitraum.

    bisher  gemessen von Beginn bis heute (inkl.), ohne passende Ablesungen aus dem Jahresverbrauch geschätzt
    rest    ab morgen bis zum Ende: Jahresverbrauch × Monatsprofil (Vorjahr, sonst Standard), Jahresverbrauch aus dem bisherigen Verlauf
    Bandbreite: je kürzer der Verlauf, desto breiter; mit eigenem Vorjahr schmal.
    Ergebnis = Abschläge bis zum Ende – Kosten bis zum Ende (+ Guthaben, – Nachzahlung). Bei Einspeisung: Gutschrift."""
    sp = c["sparte"]
    s, e = bounds(c, today)
    t1 = min(e, today + timedelta(days=1))
    learned = learned_profile(meters, today)
    prof = learned or PROFIL[sp]
    unit_factor = gas_factor(c) if sp == "gas" else 1.0
    base_annual = verbrauch / unit_factor  # Jahresverbrauch in Zählereinheit (Gas: kWh -> m³)
    main = [m for m in meters if m["art"] != "garten"]
    garden = [m for m in meters if m["art"] == "garten"]
    k = cost(c, meters, s, t1, dyn_ct) if main else None
    measured = bool(k and k["gemessen"])
    # Verlauf, aus dem der Jahresverbrauch geschätzt wird: von der ersten Ablesung im Zeitraum (bzw. 120 Tage zurück) bis heute
    win0 = max(s, today - timedelta(days=120)) if measured else s
    if measured:
        first = min(parse_ts(m["readings"][0]["t"]).date() for m in main if m["readings"])
        win0 = max(win0, first)
    used = 0.0
    for m in main:
        u = usage(m, datetime.combine(win0, datetime.min.time()), datetime.combine(t1, datetime.min.time()))
        used += u["v"] if u else 0.0
    days = (t1 - win0).days
    sh = _share(prof, win0, t1)
    w = min(1.0, days / 120) if measured and sh >= 0.01 else 0.0
    wx = weather_factor(temps, win0, t1) if sp == "gas" and w > 0 else None
    if wx:
        # nur der Heizanteil hängt vom Wetter ab; Warmwasser & Co. (Sommer-Grundlast laut Profil) bleiben
        heat = max(0.0, min(1.0, 1 - (min(prof) * days / 30.44) / sh))
        wx = {**wx, "heiz": round(heat, 2), "faktor": round(1 + (wx["faktor"] - 1) * heat, 3)}
    implied = used / sh * (wx["faktor"] if wx else 1.0) if w > 0 else base_annual
    annual = w * implied + (1 - w) * base_annual
    gfrac = 0.0
    if sp == "wasser" and garden and main and measured:
        gv = sum((usage(g, datetime.combine(s, datetime.min.time()), datetime.combine(t1, datetime.min.time())) or {"v": 0.0})["v"] for g in garden)
        mv = sum((usage(m, datetime.combine(s, datetime.min.time()), datetime.combine(t1, datetime.min.time())) or {"v": 0.0})["v"] for m in main)
        gfrac = min(0.9, gv / mv) if mv > 0 else 0.0
    if measured:
        bis = {"eur": Decimal(str(k["eur"])), "arbeit": Decimal(str(k["arbeit"])), "menge": k["menge"], "est": k["est"]}
    else:
        r0 = _rest(c, s, t1, annual, prof, gfrac, dyn_ct)
        bis = {"eur": r0["arbeit"] + r0["grund"], "arbeit": r0["arbeit"], "menge": r0["menge"], "est": True}
    r = _rest(c, t1, e, annual, prof, gfrac, dyn_ct) if t1 < e else {"arbeit": Decimal(0), "grund": Decimal(0), "menge": 0.0}
    total = bis["eur"] + r["arbeit"] + r["grund"]
    pct = 0.08 if learned and measured else 0.10 + 0.15 * (1 - w) if measured else 0.2
    unsicher = (r["arbeit"] + (bis["arbeit"] if not measured else Decimal(0))) * Decimal(str(pct))
    plan = schedule(c, s, e)
    if sp == "einspeisung" and (c.get("abschlag") or {}).get("rhythmus") == "var":
        plan = var_payments(c, plan, s, e, today, bis, annual, prof, dyn_ct)
    paid = sum(x["betrag"] for x in plan if x["d"] <= today.isoformat())
    ab_total = sum(x["betrag"] for x in plan)
    bezug = sp != "einspeisung"
    bonus = 0.0
    b = parse_date(c.get("beginn"))
    if bezug and c.get("bonus") and b and s <= b < e:
        bonus = c["bonus"]  # Bonus wird mit der Rechnung des ersten Jahres verrechnet
    total_eur = money(total) - bonus
    abz = kwh_abzug(c, s, e, t1)
    if abz:
        total_eur = round(total_eur - abz["eur"], 2)
        bis = {**bis, "eur": bis["eur"] - Decimal(str(abz["eur_bis"]))}
    res: dict[str, Any] = {
        "start": s.isoformat(), "ende": e.isoformat(), "tage": (e - s).days, "vergangen": (t1 - s).days, "zahl": c.get("zahl", "jahr"),
        "bisher": money(bis["eur"]), "menge_bisher": round(bis["menge"], 3), "gemessen": measured, "geschaetzt": bool(bis["est"]),
        "total": round(total_eur, 2), "lo": round(total_eur - money(unsicher), 2), "hi": round(total_eur + money(unsicher), 2), "pct": round(pct * 100),
        "menge": round(bis["menge"] + r["menge"], 3), "unit": SP_UNIT[sp], "jahr_v": round(annual * unit_factor, 1),
        "profil": "vorjahr" if learned else "standard", "basis": "zaehler" if measured else "jahresverbrauch", "bonus": bonus,
        "abschlaege": [{**x, "bezahlt": x["d"] <= today.isoformat()} for x in plan], "gezahlt": round(paid, 2), "ab_total": round(ab_total, 2),
    }
    if measured and bis["menge"] > 0 and sp != "wasser":
        res["avg_ct"] = round(float(bis["eur"]) * 100 / bis["menge"], 2)  # Ø Preis inkl. Grundpreis-Anteil
    if bezug and ab_total > 0:
        res["ergebnis"] = round(ab_total - total_eur, 2)
        res["deckung"] = round(ab_total / total_eur * 100) if total_eur > 0 else None
        res["erg_lo"] = round(ab_total - res["hi"], 2)
        res["erg_hi"] = round(ab_total - res["lo"], 2)
    if not bezug and ab_total > 0:
        # Einspeisung: positiv = der Netzbetreiber zahlt mit der Abrechnung nach, negativ = du zahlst zurück
        res["ergebnis"] = round(total_eur - ab_total, 2)
        res["deckung"] = round(ab_total / total_eur * 100) if total_eur > 0 else None
        res["erg_lo"] = round(res["lo"] - ab_total, 2)
        res["erg_hi"] = round(res["hi"] - ab_total, 2)
    if abz:
        res["abzug"] = abz
    if wx:
        res["wetter"] = wx
    res["empf"] = recommend(c, res, today)
    res["gruende"] = reasons(c, res, today, implied if w > 0 else None, base_annual, w)
    res["monate"] = months(c, meters, s, e, today, annual, prof, gfrac, dyn_ct, plan, pct)
    if abz:  # fester kWh-Abzug auch in der Monatsreihe, tagesgenau verteilt
        cum, span = 0.0, max(1, (e - s).days)
        for mo in res["monate"]:
            a0 = parse_date(mo["a"])
            b0 = min(e, add_months(a0, 1))
            d = round(abz["eur"] * (b0 - max(s, a0)).days / span, 2)
            mo["kosten"] = round(mo["kosten"] - d, 2)
            mo["k_bis"] = round(max(0.0, mo["k_bis"] - d * mo["anteil"]), 2)
            cum += d
            mo["cum_k"] = round(mo["cum_k"] - cum, 2)
    return res


def recommend(c: dict[str, Any], f: dict[str, Any], today: date) -> dict[str, Any] | None:
    """Abschlag, mit dem der Zeitraum bei ± 0 € endet: (Hochrechnung – schon gezahlt – feste Sonderzahlungen) ÷ offene Termine, auf ganze Euro aufgerundet."""
    if f["zahl"] == "monat":
        return None
    offen = [x for x in f["abschlaege"] if not x["bezahlt"] and x["src"] == "plan"]
    if not offen:
        # Alles bezahlt: Ergebnis kommt mit der Rechnung. Vorschlag fürs nächste Jahr = Hochrechnung ÷ Termine im Jahr.
        alle = [x for x in f["abschlaege"] if x["src"] in ("plan", "gebucht")]
        if not alle:
            return None
        last = abschlag_at(c, parse_date(alle[-1]["d"]))
        return {"neu": None, "next": float(math.ceil(round(f["total"] / len(alle), 6))), "alt": last["betrag"], "diff": 0.0, "n": 0, "ab": "", "show": False,
                "rhythmus": last["rhythmus"], "tag": last["tag"]}
    fest = sum(x["betrag"] for x in f["abschlaege"] if not x["bezahlt"] and x["src"] != "plan")
    need = max(0.0, f["total"] - f["gezahlt"] - fest)
    neu = float(math.ceil(round(need / len(offen), 6)))  # auf ganze Euro aufrunden
    cur = offen[0]["plan"]
    diff = neu - cur
    show = abs(diff) >= max(2.0, cur * 0.03) and f["vergangen"] >= 14
    return {"neu": neu, "alt": cur, "diff": round(diff, 2), "n": len(offen), "ab": offen[0]["d"], "show": show,
            "rhythmus": abschlag_at(c, parse_date(offen[0]["d"]))["rhythmus"], "tag": abschlag_at(c, parse_date(offen[0]["d"]))["tag"]}


def reasons(c: dict[str, Any], f: dict[str, Any], today: date, implied: float | None, base: float, w: float) -> list[str]:
    """Kurze Begründung für Ergebnis und Empfehlung."""
    out: list[str] = []
    fac = gas_factor(c) if c["sparte"] == "gas" else 1.0
    if implied is not None and w >= 0.25 and base > 0:
        d = (implied - base) / base * 100
        if abs(d) >= 5:
            out.append(f"{'Einspeisung' if c['sparte'] == 'einspeisung' else 'Verbrauch'} bisher {abs(round(d))} % {'über' if d > 0 else 'unter'} dem eingestellten Jahresverbrauch ({round(implied * fac):,} statt {round(base * fac):,} {SP_UNIT[c['sparte']]})".replace(",", "."))
    for x in price_changes(c):
        d = parse_date(x["ab"])
        if d and today < d < parse_date(f["ende"]) and x["pct"]:
            out.append(f"Preis ändert sich am {_de(x['ab'])} um {'+' if x['pct'] > 0 else ''}{str(x['pct']).replace('.', ',')} %")
    if f.get("bonus"):
        out.append(f"Bonus {_eur(f['bonus'])} ist eingerechnet")
    wx = f.get("wetter")
    if wx and abs(wx["abw"]) >= 3:
        out.insert(0, f"Die letzten {wx['tage']} Tage waren {abs(wx['abw'])} % {'kälter' if wx['abw'] > 0 else 'wärmer'} als normal – hochgerechnet ist mit normalem Wetter")
    if f["basis"] == "jahresverbrauch":
        out.append("Noch keine zwei Ablesungen: geschätzt aus dem eingestellten Jahresverbrauch")
    elif f["profil"] == "vorjahr":
        out.append("Verteilung über das Jahr wie im Vorjahr gemessen")
    return out[:4]


def months(c: dict[str, Any], meters: list[dict[str, Any]], s: date, e: date, today: date, annual: float, prof: tuple[float, ...], gfrac: float,
           dyn_ct: float | None, plan: list[dict[str, Any]], pct: float) -> list[dict[str, Any]]:
    """Monatsreihe für die Jahreskurve: Kosten (gemessen bzw. hochgerechnet) und Abschläge je Monat, dazu die Summen."""
    out: list[dict[str, Any]] = []
    main = [m for m in meters if m["art"] != "garten"]
    t1 = today + timedelta(days=1)
    cum_k = cum_z = cum_u = 0.0
    a = s
    while a < e:
        b = min(e, add_months(_month_start(a), 1))
        kosten = Decimal(0)
        g_frac = 0.0
        unsicher = Decimal(0)
        gm = False
        k_bis = Decimal(0)
        if a < t1:
            m1 = min(b, t1)
            k = cost(c, meters, a, m1, dyn_ct) if main else None
            if k and k["gemessen"]:
                k_bis = Decimal(str(k["eur"]))
                gm = True
            else:
                r0 = _rest(c, a, m1, annual, prof, gfrac, dyn_ct)
                k_bis = r0["arbeit"] + r0["grund"]
            kosten += k_bis
            g_frac = (m1 - a).days / (b - a).days
        if b > t1:
            r = _rest(c, max(a, t1), b, annual, prof, gfrac, dyn_ct)
            kosten += r["arbeit"] + r["grund"]
            unsicher = r["arbeit"] * Decimal(str(pct))
        z = sum(x["betrag"] for x in plan if a.isoformat() <= x["d"] < b.isoformat())
        zb = sum(x["betrag"] for x in plan if a.isoformat() <= x["d"] < b.isoformat() and x["d"] <= today.isoformat())
        cum_k += money(kosten)
        cum_z += z
        cum_u += money(unsicher)
        out.append({"m": a.isoformat()[:7], "l": MONATE[a.month - 1], "a": a.isoformat(), "kosten": money(kosten), "zahl": round(z, 2), "zahl_bez": round(zb, 2),
                    "gemessen": gm, "anteil": round(g_frac, 3), "k_bis": money(k_bis), "cum_k": round(cum_k, 2), "cum_z": round(cum_z, 2), "u": round(cum_u, 2)})
        a = b
    return out


def dyn_compare(hours: list[tuple[int, float]], prices: dict[int, float], auf: float, own_gp: float, vgl: dict[str, Any] | None) -> dict[str, Any] | None:
    """Dynamisch gegen fest mit dem eigenen Stundenprofil: Netzbezug je Stunde × Börsenpreis der Stunde (+ Aufschlag)
    gegen denselben Bezug × festen Vergleichspreis. Grundpreise werden je Monat dazugerechnet."""
    if not hours:
        return None
    kwh = sum(v for _, v in hours)
    hit = [(t, v) for t, v in hours if t in prices]
    kwh_hit = sum(v for _, v in hit)
    if kwh <= 0 or kwh_hit <= 0:
        return None
    dyn = Decimal(0)
    for t, v in hit:
        dyn += Decimal(str(prices[t] + auf)) * Decimal(str(v)) / 100
    avg = float(dyn) * 100 / kwh_hit
    span_days = max(1.0, (max(t for t, _ in hours) - min(t for t, _ in hours) + 3600) / 86400)
    out = {"kwh": round(kwh, 2), "abdeckung": round(kwh_hit / kwh * 100), "avg_ct": round(avg, 2), "tage": round(span_days, 1),
           "dyn": money(dyn * Decimal(str(kwh / kwh_hit)) + Decimal(str(own_gp * span_days / 30.4)))}
    # Anteil des Bezugs in den günstigsten Stunden (unter dem Durchschnitt aller Preise der Zeit)
    allp = [prices[t] for t, _ in hit]
    mean = sum(allp) / len(allp)
    out["guenstig"] = round(sum(v for t, v in hit if prices[t] < mean) / kwh_hit * 100)
    out["mittel_ct"] = round(mean + auf, 2)  # Ø Börsenpreis ohne Gewichtung
    if vgl and vgl.get("ap"):
        fix = Decimal(str(vgl["ap"])) * Decimal(str(kwh)) / 100 + Decimal(str(vgl.get("gp", 0.0) * span_days / 30.4))
        out["fix"] = money(fix)
        out["diff"] = round(out["fix"] - out["dyn"], 2)  # > 0: dynamisch günstiger
        out["diff_monat"] = round(out["diff"] / span_days * 30.4, 2)
    return out



# --------------------------------------------------------------------------- v0.5: Rechnungen
def clean_invoice(raw: Any) -> dict[str, Any] | None:
    """Rechnung: Zeitraum von–bis (bis = letzter Tag), Zählerstände und Menge laut Rechnung, Betrag, angerechnete Abschläge, Ergebnis, neuer Abschlag, Beleg."""
    r = raw if isinstance(raw, dict) else {}
    iid, von, bis = str(r.get("id") or ""), _d(r.get("von")), _d(r.get("bis"))
    if not _ID.match(iid) or not von or not bis or bis < von:
        return None
    def num_or_none(k: str, lo: float, hi: float) -> float | None:
        v = r.get(k)
        return None if v in (None, "") else _f(v, lo, hi, 0.0)
    b = r.get("beleg") if isinstance(r.get("beleg"), dict) else {}
    beleg = {"name": _t(b.get("name"), 80), "file": str(b.get("file") or "") if re.fullmatch(r"[a-z0-9_]{2,40}\.(pdf|jpg|jpeg|png|heic|webp)", str(b.get("file") or "")) else "", "size": int(_f(b.get("size"), 0, 2e7, 0)), "type": _t(b.get("type"), 40)} if b.get("file") else None
    out = {"id": iid, "von": von, "bis": bis, "datum": _d(r.get("datum")), "nr": _t(r.get("nr"), 30), "anfang": num_or_none("anfang", 0, 1e9), "ende": num_or_none("ende", 0, 1e9),
           "menge": num_or_none("menge", 0, 1e8), "betrag": _f(r.get("betrag"), 0, 1e6, 0.0), "angerechnet": _f(r.get("angerechnet"), 0, 1e6, 0.0),
           "ergebnis": num_or_none("ergebnis", -1e6, 1e6), "neu_abschlag": num_or_none("neu_abschlag", 0, 5000), "brennwert": num_or_none("brennwert", 5, 40), "zustand": num_or_none("zustand", 0.5, 1.2),
           "geschaetzt": bool(r.get("geschaetzt")), "note": _t(r.get("note"), 80), "beleg": beleg, "gelernt": bool(r.get("gelernt"))}
    if out["ergebnis"] is None:
        out["ergebnis"] = round(out["angerechnet"] - out["betrag"], 2)
    return out


def _day0(x: date) -> datetime:
    return datetime.combine(x, datetime.min.time())


def own_usage(meters: list[dict[str, Any]], von: date, bis: date) -> dict[str, Any] | None:
    """Eigene Messung der Hauptzähler von „von“ 0 Uhr bis „bis“ 24 Uhr (Zählereinheit)."""
    return _usage_tol([m for m in meters if m["art"] != "garten"], von, bis)


def _usage_tol(ms: list[dict[str, Any]], von: date, bis: date) -> dict[str, Any] | None:
    """Verbrauch von „von“ 0 Uhr bis „bis“ 24 Uhr. Eine Ablesung bis zu drei Tage nach Beginn zählt noch (z. B. am 1. um 9 Uhr abgelesen)."""
    t0, t1 = _day0(von), _day0(bis + timedelta(days=1))
    v, est, ok = 0.0, False, False
    for m in ms:
        if not m["readings"]:
            continue
        first = parse_ts(m["readings"][0]["t"])
        if first > t0 + timedelta(days=3) or first >= t1:
            continue
        u = usage(m, max(t0, first), t1)
        if u:
            v, est, ok = v + u["v"], est or u["est"] or first > t0, True
    return {"v": v, "est": est} if ok else None


def expected_cost(c: dict[str, Any], meters: list[dict[str, Any]], inv: dict[str, Any]) -> float | None:
    """Was die Rechnung nach Vertrag kosten müsste: Menge laut Rechnung, auf die Preisperioden verteilt wie der eigene Verbrauch
    (ohne Messung: nach Tagen), plus feste Kosten tagesanteilig, minus Bonus im Zeitraum."""
    von, bis = parse_date(inv["von"]), parse_date(inv["bis"])
    d1 = bis + timedelta(days=1)
    menge = inv["menge"]
    if menge is None and inv["anfang"] is not None and inv["ende"] is not None:
        menge = (inv["ende"] - inv["anfang"]) * (_inv_factor(c, inv) if c["sparte"] == "gas" else 1.0)
    if menge is None or not c["periods"]:
        return None
    cuts = sorted({von, d1, *(x for x in (parse_date(p["ab"]) for p in c["periods"]) if x and von < x < d1)})
    own = [own_usage(meters, a, b - timedelta(days=1)) for a, b in zip(cuts, cuts[1:])]
    tot = sum(x["v"] for x in own if x) if all(own) else 0.0
    arbeit = grund = Decimal(0)
    for (a, b), o in zip(zip(cuts, cuts[1:]), own):
        u = unit_price(c, a)
        if u is None:
            continue
        days = (b - a).days
        share = (o["v"] / tot) if tot > 0 and o else days / (d1 - von).days
        v = menge * share
        grund += Decimal(str(u["grund"])) * 12 * days / Decimal(365) + Decimal(str(u["jahr"])) * days / Decimal(365)
        if u["ct"] is None:
            return None
        if c["sparte"] == "wasser":
            g = _usage_tol([m for m in meters if m["art"] == "garten"], a, b - timedelta(days=1)) if any(m["art"] == "garten" for m in meters) else None
            gv = min(v, g["v"]) if g else 0.0  # Gartenwasser: kein Abwasser
            arbeit += Decimal(str(u["teile"]["frisch"])) * Decimal(str(v)) + Decimal(str(u["teile"]["abw"])) * Decimal(str(v - gv))
        else:
            arbeit += Decimal(str(u["ct"])) * Decimal(str(v)) / 100
    bonus = c["bonus"] if c.get("bonus") and von <= (parse_date(c.get("beginn")) or date(1900, 1, 1)) <= bis else 0.0
    return money(arbeit + grund) - bonus


def _inv_factor(c: dict[str, Any], inv: dict[str, Any]) -> float:
    return (inv.get("brennwert") or c.get("brennwert", DEF_BRENNWERT)) * (inv.get("zustand") or c.get("zustand", DEF_ZUSTAND))


def _n(x: float, d: int = 1) -> str:
    return f"{x:,.{d}f}".replace(",", "X").replace(".", ",").replace("X", ".")


def check_invoice(c: dict[str, Any], meters: list[dict[str, Any]], inv: dict[str, Any], tol: float = 2.0) -> list[dict[str, Any]]:
    """Rechnungsprüfung in fünf Punkten. lv: ok · warn · na (nicht prüfbar). v = kurzer Wert rechts."""
    out: list[dict[str, Any]] = []
    sp, von, bis = c["sparte"], parse_date(inv["von"]), parse_date(inv["bis"])
    fac = _inv_factor(c, inv) if sp == "gas" else 1.0
    zu = "m³" if sp in ("gas", "wasser") else "kWh"
    # 1 Verbrauch gegen eigene Messung (in Zählereinheit)
    inv_z = (inv["ende"] - inv["anfang"]) if inv["anfang"] is not None and inv["ende"] is not None else (inv["menge"] / fac if inv["menge"] is not None else None)
    own = own_usage(meters, von, bis)
    if inv_z is None:
        out.append({"k": "menge", "lv": "na", "t": "Verbrauch: auf der Rechnung fehlen Zählerstände oder Menge", "v": ""})
    elif own is None:
        out.append({"k": "menge", "lv": "na", "t": f"Verbrauch: Rechnung {_n(inv_z, 0)} {zu} · eigene Ablesungen decken den Zeitraum nicht ab", "v": ""})
    else:
        d = (inv_z - own["v"]) / own["v"] * 100 if own["v"] > 0 else 0.0
        out.append({"k": "menge", "lv": "ok" if abs(d) <= tol else "warn", "t": f"Verbrauch: Rechnung {_n(inv_z, 0)} {zu} · gemessen {_n(own['v'], 0)} {zu}{' (teils geschätzt)' if own['est'] else ''}",
                    "v": f"{'+' if d > 0 else '−' if d < 0 else '±'}{_n(abs(d))} %", "d": round(d, 2)})
    # 2 Gas: Umrechnung m³ → kWh
    if sp == "gas":
        if inv["anfang"] is not None and inv["ende"] is not None and inv["menge"] is not None:
            calc = (inv["ende"] - inv["anfang"]) * fac
            d = (inv["menge"] - calc) / calc * 100 if calc > 0 else 0.0
            out.append({"k": "umr", "lv": "ok" if abs(d) <= 0.5 else "warn", "t": f"Umrechnung {_n(inv['ende'] - inv['anfang'], 0)} m³ × {_n(inv.get('brennwert') or c['brennwert'], 3)} × {_n(inv.get('zustand') or c['zustand'], 4)} = {_n(calc, 0)} kWh",
                        "v": "stimmt" if abs(d) <= 0.5 else f"Rechnung {_n(inv['menge'], 0)} kWh"})
        else:
            out.append({"k": "umr", "lv": "na", "t": "Umrechnung: Zählerstände und kWh auf der Rechnung eintragen, dann wird sie geprüft", "v": ""})
    # 3 Preise laut Vertrag
    exp = expected_cost(c, meters, inv)
    if exp is None or not inv["betrag"]:
        out.append({"k": "preis", "lv": "na", "t": "Preise: Betrag oder Menge fehlt", "v": ""})
    else:
        d = inv["betrag"] - exp
        ok = abs(d) <= max(2.0, exp * 0.01)
        out.append({"k": "preis", "lv": "ok" if ok else "warn", "t": f"Preise wie im Vertrag{' (Preiswechsel tagesgenau)' if len(c['periods']) > 1 else ''}: erwartet {_eur(exp)}",
                    "v": "stimmt" if ok else f"{'+' if d > 0 else '−'}{_eur(abs(d))}", "d": round(d, 2)})
    # 4 Endstand vom Versorger geschätzt?
    if inv["ende"] is not None:
        t = _day0(bis + timedelta(days=1))
        near = [(abs((parse_ts(r["t"]) - t).total_seconds()), m, r) for m in meters if m["art"] != "garten" for r in m["readings"] if r["src"] not in ("rechnung", "geschaetzt")]
        near = [x for x in near if x[0] <= 3 * 86400]
        if near:
            _, m, r = min(near, key=lambda x: x[0])
            ip = interp(m, t)
            # eigener Stand auf den Stichtag umgerechnet (fortlaufender Verbrauch → Zählerstand über die letzte Ablesung)
            diff = None
            if ip is not None:
                c0 = cumulative(m)
                base = next((v - cum for ts, cum, rr in c0 for v in [rr["v"]] if rr is r), None)
                if base is not None:
                    diff = inv["ende"] - (base + ip[0])
            if diff is not None:
                ok = abs(diff) <= max(0.5, abs(inv_z or 0) * tol / 100)
                out.append({"k": "ende", "lv": "ok" if ok else "warn",
                            "t": f"Endstand {'vom Versorger geschätzt' if inv['geschaetzt'] else 'laut Rechnung'} {_n(inv['ende'], 1)} {zu} · eigene Ablesung {_de(r['t'])}: {_n(inv['ende'] - diff, 1)} {zu}",
                            "v": "passt" if ok else f"Δ {_n(abs(diff), 1)} {zu}"})
        else:
            out.append({"k": "ende", "lv": "warn" if inv["geschaetzt"] else "na", "t": "Endstand: keine eigene Ablesung am Stichtag" + (" – der Versorger hat geschätzt" if inv["geschaetzt"] else ""), "v": ""})
    # 5 Abschläge angerechnet
    plan = [x for x in schedule(c, von, bis + timedelta(days=1)) if x["betrag"] > 0]
    gez = sum(x["betrag"] for x in plan)
    if not plan and not inv["angerechnet"]:
        out.append({"k": "ab", "lv": "na", "t": "Abschläge: keine im Zeitraum", "v": ""})
    else:
        d = inv["angerechnet"] - gez
        out.append({"k": "ab", "lv": "ok" if abs(d) < 0.5 else "warn", "t": f"Abschläge: {len(plan)} gezahlt = {_eur(gez)} · auf der Rechnung {_eur(inv['angerechnet'])}",
                    "v": "alle erkannt" if abs(d) < 0.5 else f"{'+' if d > 0 else '−'}{_eur(abs(d))}"})
    return out


def invoice_view(c: dict[str, Any], meters: list[dict[str, Any]], inv: dict[str, Any], tol: float, today: date, fc: dict[str, Any] | None) -> dict[str, Any]:
    chk = check_invoice(c, meters, inv, tol)
    warn = sum(1 for x in chk if x["lv"] == "warn")
    learn = []
    if c["sparte"] == "gas" and inv["brennwert"] and abs(inv["brennwert"] - c["brennwert"]) > 1e-6:
        learn.append({"k": "bw", "t": f"Brennwert {_n(inv['brennwert'], 3)} und Zustandszahl {_n(inv['zustand'] or c['zustand'], 4)} übernehmen"})
    later = [x for x in c.get("abplan") or [] if x["ab"] > (inv["datum"] or inv["bis"])]  # danach schon geändert: nicht mehr anbieten
    if inv["neu_abschlag"] and not later and abs(inv["neu_abschlag"] - abschlag_at(c, today)["betrag"]) > 0.005:
        learn.append({"k": "ab", "t": f"Neuen Abschlag {_eur(inv['neu_abschlag'])} ab dem nächsten Termin eintragen"})
    ms = [m for m in meters if m["art"] != "garten"]
    def has(d: date) -> bool:
        return any(abs((parse_ts(r["t"]) - _day0(d)).total_seconds()) < 86400 for m in ms for r in m["readings"])
    need = [d for d, v in ((parse_date(inv["von"]), inv["anfang"]), (parse_date(inv["bis"]) + timedelta(days=1), inv["ende"])) if v is not None and not has(d)]
    if len(ms) == 1 and need:
        learn.append({"k": "st", "t": "Zählerstände der Rechnung in die Ablesungen übernehmen"})
    return {**inv, "cid": c["id"], "sparte": c["sparte"], "pruefung": chk, "warn": warn, "learn": learn,
            "empf": (fc or {}).get("empf") if fc and inv["neu_abschlag"] else None}


# --------------------------------------------------------------------------- v0.5: Fahrtkosten
ANTRIEB = {"elektro": "Elektro", "benzin": "Benzin", "diesel": "Diesel", "lpg": "Autogas", "hybrid": "Plug-in-Hybrid"}
FAHRT_ART = ("tanken", "laden_haus", "laden_weg", "km", "fix")
FIX_K = ("vers", "steuer", "wartung", "reifen", "sonst")


def clean_entry(raw: Any) -> dict[str, Any] | None:
    r = raw if isinstance(raw, dict) else {}
    eid, ts, art = str(r.get("id") or ""), parse_ts(r.get("t")), r.get("art")
    if not _ID.match(eid) or ts is None or art not in FAHRT_ART:
        return None
    def nn(k: str, hi: float) -> float | None:
        v = r.get(k)
        return None if v in (None, "") else _f(v, 0, hi, 0.0)
    out = {"id": eid, "t": ts.isoformat(timespec="minutes"), "art": art, "menge": nn("menge", 2000), "preis": nn("preis", 500), "betrag": nn("betrag", 1e5), "km": nn("km", 2e6),
           "voll": bool(r.get("voll", art == "tanken")), "note": _t(r.get("note"), 60), "src": r.get("src") if r.get("src") in ("manuell", "nfc", "modul8", "foto") else "manuell",
           "fix": r.get("fix") if r.get("fix") in FIX_K else "sonst", "solar": _f(r.get("solar"), 0, 100, 0.0)}
    # zwei von drei Werten genügen: Menge × Preis = Betrag
    m, p, b = out["menge"], out["preis"], out["betrag"]
    if art in ("tanken", "laden_haus", "laden_weg"):
        if b is None and m is not None and p is not None:
            out["betrag"] = round(m * p, 2)
        elif p is None and m and b is not None:
            out["preis"] = round(b / m, 4)
        elif m is None and p and b is not None:
            out["menge"] = round(b / p, 3)
    return out


def clean_vehicle(raw: Any) -> dict[str, Any] | None:
    r = raw if isinstance(raw, dict) else {}
    vid = str(r.get("id") or "")
    if not _ID.match(vid):
        return None
    fx = r.get("fix") if isinstance(r.get("fix"), dict) else {}
    ent = sorted((x for x in (clean_entry(y) for y in r.get("eintraege") or []) if x), key=lambda x: x["t"])[-600:]
    return {"id": vid, "name": _t(r.get("name"), 30) or "Fahrzeug", "antrieb": r.get("antrieb") if r.get("antrieb") in ANTRIEB else "benzin", "tank": _f(r.get("tank"), 0, 200, 50.0),
            "akku": _f(r.get("akku"), 0, 200, 0.0), "sensor": str(r.get("sensor") or "") if _ENT.match(str(r.get("sensor") or "")) else "", "start_km": _f(r.get("start_km"), 0, 2e6, 0.0),
            "fix": {k: _f(fx.get(k), 0, 20000, 0.0) for k in FIX_K}, "m8": _t(r.get("m8"), 20), "farbe": _t(r.get("farbe"), 12), "eintraege": ent}


def _km_points(v: dict[str, Any], sensor_km: float | None, now: datetime) -> list[tuple[datetime, float]]:
    pts = [(parse_ts(e["t"]), e["km"]) for e in v["eintraege"] if e["km"]]
    if sensor_km:
        pts.append((now, sensor_km))
    pts.sort()
    out: list[tuple[datetime, float]] = []
    for t, k in pts:  # Kilometerstand läuft nie rückwärts
        if not out or k >= out[-1][1]:
            out.append((t, k))
    return out


def km_between(pts: list[tuple[datetime, float]], t0: datetime, t1: datetime) -> float | None:
    """Gefahrene km zwischen zwei Zeitpunkten, zwischen Kilometerständen tagesgenau verteilt."""
    if len(pts) < 2:
        return None
    def at(t: datetime) -> float:
        if t <= pts[0][0]:
            return pts[0][1]
        if t >= pts[-1][0]:
            return pts[-1][1]
        for (a, x), (b, y) in zip(pts, pts[1:]):
            if a <= t <= b:
                return x + (y - x) * ((t - a).total_seconds() / max(1, (b - a).total_seconds()))
        return pts[-1][1]
    return max(0.0, at(t1) - at(t0))


def vehicle_stats(v: dict[str, Any], d0: date, d1: date, now: datetime, sensor_km: float | None = None) -> dict[str, Any]:
    """Fahrtkosten eines Zeitraums [d0, d1). Energie: Tanken und Laden (zuhause/unterwegs). Fixkosten: Jahresbeträge tagesanteilig + Einzelbelege.
    Verbrauch Verbrenner: Liter zwischen zwei Volltankungen ÷ km dazwischen (Teiltankungen zählen zur nächsten Volltankung)."""
    t0, t1 = _day0(d0), _day0(d1)
    E = [e for e in v["eintraege"] if t0 <= parse_ts(e["t"]) < t1]
    elek = v["antrieb"] == "elektro"
    pts = _km_points(v, sensor_km, now)
    km = km_between(pts, t0, min(t1, now)) or 0.0
    by = {a: {"menge": 0.0, "eur": 0.0, "n": 0} for a in ("tanken", "laden_haus", "laden_weg")}
    fixe = 0.0
    for e in E:
        if e["art"] in by and e["betrag"] is not None:
            by[e["art"]]["menge"] += e["menge"] or 0.0
            by[e["art"]]["eur"] += e["betrag"]
            by[e["art"]]["n"] += 1
        elif e["art"] == "fix" and e["betrag"]:
            fixe += e["betrag"]
    days = (min(d1, now.date() + timedelta(days=1)) - d0).days
    fix_jahr = sum(v["fix"].values())
    fix = fix_jahr * max(0, days) / 365 + fixe
    eur = sum(x["eur"] for x in by.values())
    kwh = by["laden_haus"]["menge"] + by["laden_weg"]["menge"]
    liter = by["tanken"]["menge"]
    # Verbrauch Volltank zu Volltank (Verbrenner) über alle Einträge, damit auch kurze Zeiträume einen Wert haben
    full = [e for e in v["eintraege"] if e["art"] == "tanken"]
    vb_l, seg = [], 0.0
    last_full = None
    for e in full:
        if last_full is not None:
            seg += e["menge"] or 0.0
        if e["voll"] and e["km"]:
            if last_full is not None and e["km"] > last_full["km"] and seg > 0:
                vb_l.append((seg, e["km"] - last_full["km"], e["t"]))
            last_full, seg = e, 0.0
    l100 = round(sum(x[0] for x in vb_l[-6:]) / sum(x[1] for x in vb_l[-6:]) * 100, 2) if vb_l else None
    kwh100 = round(kwh / km * 100, 1) if elek and km >= 50 and kwh else None
    e100 = round(eur / km * 100, 2) if km >= 50 and eur else None
    voll = round((eur + fix) / km * 100, 2) if km >= 50 else None
    share = {k: round(by[k]["menge"] / kwh * 100) for k in ("laden_haus", "laden_weg")} if kwh else {}
    return {"km": round(km, 0), "eur": round(eur, 2), "fix": round(fix, 2), "fix_jahr": round(fix_jahr, 2), "kwh": round(kwh, 1), "liter": round(liter, 1),
            "l100": l100, "kwh100": kwh100, "e100": e100, "voll_ct": voll, "by": {k: {**x, "eur": round(x["eur"], 2), "menge": round(x["menge"], 2)} for k, x in by.items()},
            "anteil": share, "verlauf_l100": [{"t": t[:10], "l100": round(l / k * 100, 2)} for l, k, t in vb_l[-12:]], "km_stand": pts[-1][1] if pts else None,
            "preis_l": [{"t": e["t"][:10], "p": e["preis"]} for e in full if e["preis"]][-24:]}


# --------------------------------------------------------------------------- v0.5: Vorräte
VORRAT_ART = {"oel": ("Heizöl", "l", 9.8), "pellets": ("Pellets", "t", 4800.0), "lpg": ("Flüssiggas", "l", 6.6), "holz": ("Brennholz", "rm", 1900.0),
              "briketts": ("Briketts", "kg", 5.0), "salz": ("Regeneriersalz", "Sack", 0.0), "pool": ("Poolchemie", "kg", 0.0), "adblue": ("AdBlue", "l", 0.0),
              "filter": ("Filter", "Stück", 0.0), "sonst": ("Vorrat", "Stück", 0.0)}
BUCH_ART = ("kauf", "entnahme", "zaehlung")


def clean_item(raw: Any) -> dict[str, Any] | None:
    r = raw if isinstance(raw, dict) else {}
    iid, art = str(r.get("id") or ""), r.get("art")
    if not _ID.match(iid) or art not in VORRAT_ART:
        return None
    nm, unit, hw = VORRAT_ART[art]
    bs = []
    for x in r.get("buchungen") or []:
        x = x if isinstance(x, dict) else {}
        ts, ba = parse_ts(x.get("t")), x.get("art")
        if ts is None or ba not in BUCH_ART or not _ID.match(str(x.get("id") or "")):
            continue
        bs.append({"id": str(x["id"]), "t": ts.isoformat(timespec="minutes"), "art": ba, "menge": _f(x.get("menge"), 0, 1e6, 0.0), "betrag": _f(x.get("betrag"), 0, 1e6, 0.0),
                   "liefer": _t(x.get("liefer"), 40), "note": _t(x.get("note"), 60), "src": x.get("src") if x.get("src") in ("manuell", "sensor", "nfc", "liste") else "manuell"})
    bs.sort(key=lambda x: x["t"])
    return {"id": iid, "art": art, "name": _t(r.get("name"), 30) or nm, "unit": _t(r.get("unit"), 8) or unit, "lager": _f(r.get("lager"), 0, 1e6, 0.0), "min": _f(r.get("min"), 0, 1e6, 0.0),
            "liefer": int(_f(r.get("liefer"), 0, 120, 7)), "sensor": str(r.get("sensor") or "") if _ENT.match(str(r.get("sensor") or "")) else "",
            "pct": bool(r.get("pct")), "heizwert": _f(r.get("heizwert"), 0, 1e5, hw), "brennstoff": hw > 0, "buchungen": bs[-500:]}


def stock(it: dict[str, Any], today: date) -> dict[str, Any]:
    """Bestand und Wert mit gleitendem Durchschnittspreis. Kosten zählen beim Verbrauch, nicht beim Kauf.
    Verbrauch je Tag aus Entnahmen und Zählungen der letzten 120 Tage; Reichweite und „bestellen bis“ (Mindestbestand minus Lieferzeit)."""
    best, avg = 0.0, 0.0
    verbraucht: list[tuple[str, float, float]] = []  # (Zeit, Menge, Kosten)
    kaeufe = []
    for b in it["buchungen"]:
        if b["art"] == "kauf":
            if b["menge"] > 0:
                # Startbestand ohne Kaufpreis (Zählung): er gilt zum Preis des ersten Einkaufs, sonst würde er den Durchschnitt drücken
                avg = b["betrag"] / b["menge"] if avg == 0 else (best * avg + b["betrag"]) / (best + b["menge"])
                kaeufe.append(b)
            best += b["menge"]
        elif b["art"] == "entnahme":
            x = min(best, b["menge"])
            verbraucht.append((b["t"], x, x * avg))
            best -= x
        else:  # Zählung setzt den Bestand; weniger als vorher = verbraucht
            if b["menge"] < best:
                verbraucht.append((b["t"], best - b["menge"], (best - b["menge"]) * avg))
            best = b["menge"]  # mehr als vorher ohne Kauf (Startbestand): Wert bleibt beim bisherigen Durchschnittspreis
    lim = (today - timedelta(days=120)).isoformat()
    rec = [x for x in verbraucht if x[0][:10] >= lim]
    first = min((b["t"][:10] for b in it["buchungen"]), default=today.isoformat())
    span = max(1, (today - max(parse_date(lim), parse_date(first))).days)
    rate = sum(x[1] for x in rec) / span if rec else None
    out = {"bestand": round(best, 3), "avg": round(avg, 4), "wert": round(best * avg, 2), "rate": round(rate, 4) if rate else None,
           "fuell": round(best / it["lager"] * 100) if it["lager"] else None, "unter_min": it["min"] > 0 and best <= it["min"],
           "kosten_jahr": round(sum(x[2] for x in verbraucht if x[0][:4] == str(today.year)), 2), "verbraucht_jahr": round(sum(x[1] for x in verbraucht if x[0][:4] == str(today.year)), 3),
           "kaeufe": len(kaeufe), "letzter_kauf": kaeufe[-1]["t"][:10] if kaeufe else ""}
    if rate and rate > 0:
        out["reicht_tage"] = int(best / rate)
        out["reicht_bis"] = (today + timedelta(days=int(best / rate))).isoformat()
        if it["min"] > 0:
            t_min = max(0.0, (best - it["min"]) / rate)
            out["bestellen_bis"] = (today + timedelta(days=int(t_min) - it["liefer"])).isoformat()
    if it["heizwert"] and avg:
        out["ct_kwh"] = round(avg / it["heizwert"] * 100, 2)  # Wärmepreis je kWh (Heizwert)
    return out


# --------------------------------------------------------------------------- v0.7: Anbindung der Module
GAS_KEYS = ("price", "grund", "gunit", "netto", "mwst", "hw", "zz", "start", "abschlag", "absday", "prices", "years")


def gas_mirror(c: dict[str, Any], today: date) -> dict[str, Any]:
    """Gasvertrag für Modul 3 (Haus-Werte „gas“): Preise brutto, Grundpreis je Jahr, Preisliste aus den Preisperioden,
    Brennwert und Zustandszahl, Beginn des Abrechnungsjahrs, Abschlag je Monat (bei Quartal ein Drittel). Eigene Jahreswerte entfallen."""
    u = unit_price(c, today) or {"ct": 0.0, "grund": 0.0}
    p = period_at(c, today) or {}
    prices = []
    for x in c["periods"]:
        ux = unit_price({**c, "periods": [x]}, parse_date(x["ab"]))
        if ux and ux["ct"] is not None:
            prices.append({"ab": x["ab"], "price": round(ux["ct"], 4), "grund": round(ux["grund"] * 12, 2)})
    a = abschlag_at(c, today)
    ab = a["betrag"] / 3 if a["rhythmus"] == "quartal" else a["betrag"]
    return {"price": round(u["ct"] or 0.0, 4), "grund": round(u["grund"] * 12, 2), "gunit": "y", "netto": False, "mwst": p.get("ust", 19.0),
            "hw": round(c["brennwert"], 4), "zz": round(c["zustand"], 5), "start": int(c["abr"][:2]), "abschlag": round(ab, 2), "absday": a["tag"],
            "prices": prices[-40:], "years": {}}


def m8_entries(sessions: list[dict[str, Any]], name: str, solar_ct: float) -> list[dict[str, Any]]:
    """Ladungen aus Modul 8 (Ladestatistik) als Einträge „Laden zuhause“ für die Fahrtkosten.
    Kosten = Netzanteil laut Modul 8 + Solaranteil × Bewertung des Solarstroms (0 €, entgangene Einspeisung oder Vertragspreis)."""
    out = []
    for s in sessions or []:
        if str(s.get("veh") or "") != name or s.get("running"):
            continue
        ts = parse_ts(s.get("start"))
        kwh, pv, cost = float(s.get("kwh") or 0), float(s.get("pv") or 0), float(s.get("cost") or 0)
        if ts is None or kwh < 0.05:
            continue
        eur = round(cost + pv * solar_ct / 100, 2)
        out.append({"id": "m8" + ts.strftime("%y%m%d%H%M"), "t": ts.isoformat(timespec="minutes"), "art": "laden_haus", "menge": round(kwh, 2), "preis": round(eur / kwh, 4),
                    "betrag": eur, "km": None, "voll": False, "note": f"{round(pv / kwh * 100)} % Solar" if pv > 0 else "", "src": "modul8", "fix": "sonst",
                    "solar": round(pv / kwh * 100, 1)})
    return sorted(out, key=lambda x: x["t"])


def merge_m8(entries: list[dict[str, Any]], m8: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Ab der ersten Ladung aus Modul 8 zählen dessen Ladungen; von Hand eingetragenes „Laden zuhause“ ab dann nicht mehr (sonst doppelt)."""
    if not m8:
        return entries
    first = m8[0]["t"]
    keep = [e for e in entries if not (e["art"] == "laden_haus" and e["t"] >= first)]
    return sorted(keep + m8, key=lambda x: x["t"])


# --------------------------------------------------------------------------- v0.9: Sensoren für Home Assistant
SP_NAME = {"strom": "Strom", "gas": "Gas", "wasser": "Wasser", "einspeisung": "Einspeisung"}


def _slug(x: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", str(x).lower()).strip("_")[:24] or "x"


def ha_values(view: dict[str, Any]) -> dict[str, Any]:
    """Sensoren aus der Ansicht. Preise brutto in €/kWh bzw. €/m³ (Energie-Dashboard: „Entität mit dem aktuellen Preis“).
    Dynamischer Strom: Zustand = Preis der aktuellen Stunde inkl. Aufschlag (so rechnet das Energie-Dashboard stundengenau), Ø 30 Tage als Merkmal."""
    out: dict[str, dict[str, Any]] = {}
    cards = view.get("cards") or {}
    C = {c["id"]: c for c in view.get("contracts") or []}
    def price(key: str, name: str, eur: float | None, unit: str, icon: str, attrs: dict[str, Any]) -> None:
        out[key] = {"name": name, "icon": icon, "unit": unit, "sc": "measurement", "value": None if eur is None else round(eur, 5), "attrs": attrs}
    for sp in SPARTEN:
        X = cards.get(sp)
        if not X or not X.get("u"):
            continue
        u, c = X["u"], C.get(X["id"]) or {}
        base = {"anbieter": c.get("anbieter", ""), "tarif": c.get("tarif", ""), "grundpreis_monat": u.get("grund"), "gueltig_ab": u.get("ab")}
        if sp == "strom":
            cur = u.get("jetzt") if u.get("dyn") else u.get("ct")
            if u.get("dyn"):
                base.update(dynamisch=True, durchschnitt_30_tage=None if u.get("ct") is None else round(u["ct"] / 100, 5), quelle=u.get("src") or "")
            price("preis_strom", "Strompreis", None if cur is None else cur / 100, "EUR/kWh", "mdi:flash", base)
        elif sp == "gas":
            price("preis_gas", "Gaspreis", None if u.get("ct") is None else u["ct"] / 100, "EUR/kWh", "mdi:fire", base)
            if u.get("ct_m3") is not None:
                price("preis_gas_m3", "Gaspreis je m³", u["ct_m3"] / 100, "EUR/m³", "mdi:fire", {**base, "faktor_kwh_m3": round(u["ct_m3"] / u["ct"], 4) if u.get("ct") else None})
        elif sp == "wasser":
            price("preis_wasser", "Wasserpreis", None if u.get("ct") is None else u["ct"] / 100, "EUR/m³", "mdi:water", {**base, **(u.get("teile") or {})})
        else:
            price("verguetung_einspeisung", "Einspeisevergütung", None if u.get("ct") is None else u["ct"] / 100, "EUR/kWh", "mdi:solar-power", base)
        f = X.get("fc")
        if f and (sp != "einspeisung" or f.get("ergebnis") is not None):
            out["ergebnis_" + sp] = {"name": f"Ergebnis {SP_NAME[sp]}", "icon": "mdi:scale-balance", "unit": "EUR", "dc": "monetary", "value": f.get("ergebnis"),
                                     "attrs": {"kosten_jahr": f.get("total"), "bisher": f.get("bisher"), "abschlaege": f.get("ab_total"), "deckung_prozent": f.get("deckung"),
                                               "von": f.get("erg_lo"), "bis": f.get("erg_hi"), "abrechnung_bis": f.get("ende"),
                                               "empfohlener_abschlag": (f.get("empf") or {}).get("neu"), "hinweis": "positiv = Guthaben, negativ = Nachzahlung"}}
    sm = view.get("sum") or {}
    if sm.get("ergebnis") is not None:
        out["ergebnis"] = {"name": "Erwartetes Ergebnis", "icon": "mdi:cash-check", "unit": "EUR", "dc": "monetary", "value": sm["ergebnis"],
                           "attrs": {"von": sm.get("lo"), "bis": sm.get("hi"), "sparten": sm.get("teile"), "einspeisung": sm.get("einspeisung"), "hinweis": "positiv = Guthaben, negativ = Nachzahlung"}}
    ev = view.get("events") or []
    out["naechster_termin"] = {"name": "Nächster Termin", "icon": "mdi:calendar-clock", "dc": "date", "value": ev[0]["d"] if ev else None,
                               "attrs": {"titel": ev[0]["t"], "text": ev[0]["s"], "tage": ev[0]["tage"], "weitere": [f"{e['d']} {e['t']}" for e in ev[1:5]]} if ev else {}}
    mu = view.get("muell")
    if mu:
        out["kosten_muell"] = {"name": "Müllgebühren im Jahr", "icon": "mdi:trash-can", "unit": "EUR", "dc": "monetary", "value": mu["jahr"],
                               "attrs": {"grundgebuehr": mu["grund"], "zusatzleerungen": mu["extra_n"], "zusatzkosten_bisher": mu["extra_bisher"], "leerungen_bisher": mu["done"], "leerungen_im_jahr": mu["total"], "inklusive": mu["incl"]}}
    for v in view.get("fahrzeuge") or []:
        J = v.get("jahr") or {}
        out["fahrtkosten_" + _slug(v["id"])] = {"name": f"Fahrtkosten {v['name']}", "icon": "mdi:car", "unit": "EUR", "value": J.get("e100") if J.get("e100") is not None else (v.get("d30") or {}).get("e100"),
                                                "attrs": {"je": "100 km", "vollkosten_ct_km": J.get("voll_ct"), "km_jahr": J.get("km"), "kosten_jahr": J.get("eur"), "verbrauch_l_100km": J.get("l100"), "verbrauch_kwh_100km": J.get("kwh100")}}
    for it in view.get("vorraete") or []:
        st = it.get("st") or {}
        out["vorrat_" + _slug(it["id"])] = {"name": f"Vorrat {it['name']}", "icon": "mdi:package-variant", "unit": it.get("unit"), "sc": "measurement", "value": st.get("bestand"),
                                            "attrs": {"reicht_bis": st.get("reicht_bis"), "bestellen_bis": st.get("bestellen_bis"), "mindestbestand": it.get("min"), "unter_mindestbestand": st.get("unter_min"),
                                                      "wert_eur": st.get("wert"), "preis_je_einheit": st.get("avg")}}
    return {"sensor": out, "keys": list(out)}


# --------------------------------------------------------------------------- v0.9: Tarifwechsel-Rechner (Sponsor Max)
def clean_offer(raw: Any) -> dict[str, Any] | None:
    r = raw if isinstance(raw, dict) else {}
    ap = _f(r.get("ap"), 0, 300, -1.0)
    if ap <= 0:
        return None
    return {"name": _t(r.get("name"), 30) or "Angebot", "ap": ap, "gp": _f(r.get("gp"), 0, 200, 0.0), "bonus": _f(r.get("bonus"), 0, 2000, 0.0),
            "laufzeit": int(_f(r.get("laufzeit"), 0, 36, 12)), "garantie": int(_f(r.get("garantie"), 0, 36, 0))}


def switch_calc(c: dict[str, Any], menge: float, offer: dict[str, Any], today: date, dyn_ct: float | None = None) -> dict[str, Any]:
    """Angebot gegen den laufenden Vertrag mit deinem Jahresverbrauch (aus der Hochrechnung). Brutto, Grundpreis je Monat.
    Jahr 1 mit Bonus, ab Jahr 2 ohne. Der „Gleichstand-Arbeitspreis“ sagt, ab welchem Arbeitspreis sich das Angebot nicht mehr lohnt."""
    u = unit_price(c, today, dyn_ct) or {"ct": None, "grund": 0.0}
    q = Decimal(str(round(menge, 3)))
    cur = None if u["ct"] is None else money(q * Decimal(str(u["ct"])) / 100 + Decimal(str(u["grund"])) * 12)
    y2 = money(q * Decimal(str(offer["ap"])) / 100 + Decimal(str(offer["gp"])) * 12)
    y1 = money(Decimal(str(y2)) - Decimal(str(offer["bonus"])))
    t = term(c, today)
    out = {"menge": round(menge, 0), "unit": SP_UNIT[c["sparte"]], "aktuell": cur, "ct_aktuell": u["ct"], "jahr1": y1, "jahr2": y2,
           "kuendigen_bis": t["kuendigen_bis"] if t else None, "wechsel_ab": t["ende"] if t else None, "dyn": bool(u.get("dyn"))}
    if cur is not None:
        out["spart1"] = round(cur - y1, 2)
        out["spart2"] = round(cur - y2, 2)
        out["spart_laufzeit"] = round(cur * offer["laufzeit"] / 12 - (y2 * offer["laufzeit"] / 12 - offer["bonus"]), 2) if offer["laufzeit"] else out["spart1"]
        out["gleich_ap"] = round(((cur - offer["gp"] * 12) / menge) * 100, 2) if menge > 0 else None
        out["urteil"] = "lohnt" if out["spart2"] > 20 else "bonus" if out["spart1"] > 20 else "nein"
    return out


# --------------------------------------------------------------------------- 1.1: Gas aus Modul 3 übernehmen
def from_modul3(g: dict[str, Any], today: date, cid: str, mid: str, reads: list[dict[str, Any]], sensor_ok: bool) -> dict[str, Any]:
    """Gaszähler-Einstellungen aus Modul 3 (Haus-Werte „gas“) als Vertrag und Zähler für Modul 20.
    Preisliste → Preisperioden (Grundpreis je Monat, netto/brutto wie eingegeben), Brennwert und Zustandszahl des laufenden
    Abrechnungsjahrs, Abschläge je Abrechnungsjahr → Abschlagsplan. Einzelne abweichende Monate werden nicht übernommen."""
    start = int(_f(g.get("start"), 1, 12, 1))
    by = today.year if today.month >= start else today.year - 1  # laufendes Abrechnungsjahr
    years = {int(k): v for k, v in (g.get("years") or {}).items() if re.fullmatch(r"20\d\d", str(k)) and isinstance(v, dict)}
    prices = sorted((p for p in g.get("prices") or [] if isinstance(p, dict) and re.fullmatch(r"20\d\d-\d\d-\d\d", str(p.get("ab") or ""))), key=lambda p: p["ab"])
    y0 = min([by, *years, *(int(p["ab"][:4]) - (1 if int(p["ab"][5:7]) < start else 0) for p in prices)])
    beginn = date(y0, start, 1)
    if reads:
        r0 = parse_ts(reads[0]["t"])
        if r0 is not None and r0.date() < beginn:
            beginn = date(r0.year if r0.month >= start else r0.year - 1, start, 1)
    netto, gj = bool(g.get("netto")), 12.0 if g.get("gunit", "y") != "m" else 1.0
    def gpm(grund: float) -> float:
        """Grundpreis je Monat. „pro Jahr“ mit weniger als 40 € ist fast sicher ein Monatswert (Gas-Grundpreise liegen bei 100–300 € im Jahr)."""
        return float(grund) / gj if gj == 1.0 or float(grund) >= 40 else float(grund)
    def per(ab: str, price: float, grund: float, y: int) -> dict[str, Any]:
        mw = (years.get(y) or {}).get("mwst", g.get("mwst", 19.0))
        return {"ab": ab, "ap": round(float(price), 4), "gp": round(gpm(grund), 4), "mess": 0.0, "brutto": not netto, "ust": float(mw), "note": "aus Modul 3"}
    def yof(ab: str) -> int:
        return int(ab[:4]) if int(ab[5:7]) >= start else int(ab[:4]) - 1
    periods = [per(beginn.isoformat(), g.get("price") or 0.0, g.get("grund") or 0.0, beginn.year)]
    pr, gr = float(g.get("price") or 0.0), float(g.get("grund") or 0.0)
    for p in prices:
        pr = float(p["price"]) if p.get("price") is not None else pr
        gr = float(p["grund"]) if p.get("grund") is not None else gr
        if p["ab"] <= beginn.isoformat():
            periods = [per(beginn.isoformat(), pr, gr, beginn.year)]
        else:
            periods.append(per(p["ab"], pr, gr, yof(p["ab"])))
    cur = years.get(by) or {}
    hw, zz = float(cur.get("hw", g.get("hw") or 0)), float(cur.get("zz", g.get("zz") or 0))
    if not (hw > 0 and zz > 0):
        hw, zz = float(g.get("brw") or DEF_BRENNWERT * DEF_ZUSTAND), 1.0  # nur ein Umrechnungsfaktor bekannt
    tag = int(_f(g.get("absday"), 1, 28, 1))
    abplan = []
    for y in sorted(years):
        if years[y].get("abs") is not None and date(y, start, 1) >= beginn:
            abplan.append({"ab": date(y, start, 1).isoformat(), "betrag": float(years[y]["abs"]), "rhythmus": "monat", "tag": tag, "note": "aus Modul 3"})
    pays = []
    for y in sorted(years):
        for k, v in (years[y].get("absm") or {}).items():
            try:
                i = int(k)
            except (TypeError, ValueError):
                continue
            mm = (start - 1 + i) % 12 + 1
            yy = y + (start - 1 + i) // 12
            d = date(yy, mm, min(28, tag))
            if d >= beginn:
                pays.append({"d": d.isoformat(), "betrag": float(v), "note": "Monat abweichend (Modul 3)"})
    contract = clean_contract({"id": cid, "sparte": "gas", "anbieter": "", "tarif": "aus Modul 3", "zahlungen": pays, "beginn": beginn.isoformat(), "abr": f"{start:02d}-01", "zahl": "jahr",
                               "abschlag": {"betrag": float(g.get("abschlag") or 0.0), "rhythmus": "monat", "tag": tag}, "brennwert": hw, "zustand": zz, "meters": [mid],
                               "periods": periods, "abplan": abplan})
    meter = clean_meter({"id": mid, "art": "gas", "name": "Gaszähler", "dec": 3, "digits": 5, "sensor": g.get("ent") if sensor_ok else "", "readings": reads})
    return {"contract": contract, "meter": meter, "monate_abweichend": []}


def stats_readings(rows: list[tuple[datetime, float]], factor: float = 1.0) -> list[dict[str, Any]]:
    """Monatsendstände aus der Langzeitstatistik als Ablesungen (Stand am Monatsersten 00:00). Rückwärts laufende Werte (Zählertausch) beenden die Übernahme davor."""
    out: list[dict[str, Any]] = []
    for t, v in sorted(rows):
        if v is None or v < 0:
            continue
        v = round(v * factor, 3)
        if out and v < out[-1]["v"]:
            out = []  # Zähler wurde getauscht oder zurückgesetzt: nur der neue Verlauf zählt
        out.append({"t": t.replace(tzinfo=None).isoformat(timespec="minutes"), "v": v, "src": "sensor", "note": "aus der Statistik (Modul 3)"})
    return out


# --------------------------------------------------------------------------- 1.2: aus den Modulen übernehmen
UNIT_F = {"kWh": 1.0, "Wh": 0.001, "MWh": 1000.0, "m³": 1.0, "m3": 1.0, "L": 0.001}


def strom_from_haus(cid: str, today: date, dyn: bool, price_ct: float, meters: list[str]) -> dict[str, Any] | None:
    """Stromvertrag aus den Haus-Werten (Festpreis) bzw. mit Tibber dynamisch (Tibber-Preis ist schon der Endpreis, Aufschlag 0).
    Grundpreis und Abschlag kennt kein Modul – sie bleiben 0 und werden danach eingetragen."""
    b = date(today.year, 1, 1).isoformat()
    p = {"ab": b, "mode": "dyn", "auf": 0.0, "gp": 0.0, "ust": 19.0, "note": "Tibber-Endpreis"} if dyn else {"ab": b, "ap": round(price_ct, 4), "gp": 0.0, "ust": 19.0, "note": "aus den Haus-Werten"}
    return clean_contract({"id": cid, "sparte": "strom", "anbieter": "Tibber" if dyn else "", "tarif": "dynamisch" if dyn else "aus den Haus-Werten", "beginn": b, "abr": "01-01",
                           "zahl": "monat" if dyn else "jahr", "meters": meters, "periods": [p]})


def einsp_from_haus(cid: str, today: date, feed_ct: float, meters: list[str]) -> dict[str, Any] | None:
    b = date(today.year, 1, 1).isoformat()
    return clean_contract({"id": cid, "sparte": "einspeisung", "anbieter": "Netzbetreiber", "tarif": "aus den Haus-Werten", "beginn": b, "abr": "01-01", "zahl": "jahr", "meters": meters,
                           "periods": [{"ab": b, "ap": round(feed_ct, 4), "ust": 0.0, "note": "aus den Haus-Werten"}]})


def car_from_m8(vid: str, v: dict[str, Any]) -> dict[str, Any] | None:
    """Elektroauto aus Modul 8: Name, Akku, Kilometer-Sensor und gleich mit den Ladungen verknüpft."""
    ent = v.get("ent") or {}
    return clean_vehicle({"id": vid, "name": v.get("name"), "antrieb": "elektro", "akku": v.get("cap") or 0,
                          "sensor": ent.get("odo") or "", "m8": v.get("name"), "eintraege": []})



# --------------------------------------------------------------------------- 1.3: genauer rechnen
# Monatsmittel der Lufttemperatur in Deutschland (DWD, Klimanormal 1991–2020, gerundet) – Maßstab für „normales“ Wetter
NORM_T = (0.9, 1.6, 4.6, 8.9, 12.9, 16.2, 18.0, 17.6, 13.9, 9.4, 4.9, 1.8)
HEIZGRENZE = 15.0


def weather_factor(temps: dict[str, float] | None, a: date, b: date) -> dict[str, Any] | None:
    """Gradtage (Heizgrenze 15 °C) im Zeitraum [a, b) gemessen gegen das Klimanormal. faktor < 1: kälter als normal – der gemessene
    Verbrauch war wetterbedingt höher und wird für die Hochrechnung heruntergerechnet. Nur mit Tagesmitteln für mindestens 80 % der Tage."""
    if not temps or b <= a:
        return None
    n = (b - a).days
    hdd = norm = 0.0
    have = 0
    d = a
    while d < b:
        nt = max(0.0, HEIZGRENZE - NORM_T[d.month - 1])
        t = temps.get(d.isoformat())
        if t is not None:
            have += 1
            hdd += max(0.0, HEIZGRENZE - t)
            norm += nt
        d += timedelta(days=1)
    if have < max(14, 0.8 * n) or norm < 60 or hdd <= 0:  # im Sommer gibt es kaum Gradtage – dann keine Bereinigung
        return None
    f = max(0.6, min(1.6, norm / hdd))
    return {"faktor": round(f, 3), "gradtage": round(hdd), "normal": round(norm), "tage": have, "abw": round((hdd / norm - 1) * 100)}


def device_split(days: dict[str, dict[str, list[float]]], names: dict[str, str], d0: date, d1: date, total_kwh: float | None) -> dict[str, Any]:
    """Modul 4: Strom je Gerät im Abrechnungszeitraum [d0, d1) – kWh (Sonne, Batterie, Netz), Kosten, Anteil am gemessenen Hausverbrauch."""
    k0, k1 = d0.isoformat(), d1.isoformat()
    agg: dict[str, list[float]] = {}
    for k, row in days.items():
        if not (k0 <= k < k1) or not isinstance(row, dict):
            continue
        for did, v in row.items():
            if did in names and isinstance(v, list) and len(v) >= 4:
                a = agg.setdefault(did, [0.0, 0.0, 0.0, 0.0])
                for i in range(4):
                    a[i] += float(v[i] or 0)
    rows = [{"id": did, "name": names[did], "kwh": round(a[0] + a[1] + a[2], 2), "netz": round(a[2], 2), "sonne": round(a[0], 2), "eur": round(a[3], 2)} for did, a in agg.items() if a[0] + a[1] + a[2] > 0.01]
    rows.sort(key=lambda x: -x["kwh"])
    dev = sum(r["kwh"] for r in rows)
    tot = total_kwh if total_kwh and total_kwh > 0 else None
    for r in rows:
        r["pct"] = round(r["kwh"] / tot * 100, 1) if tot else None
    return {"rows": rows, "kwh": round(dev, 2), "eur": round(sum(r["eur"] for r in rows), 2), "haus": round(max(0.0, tot - dev), 2) if tot else None,
            "pct": round(dev / tot * 100) if tot else None, "von": k0, "bis": k1}



def muell_costs(info: dict[str, Any] | None, grund: float) -> dict[str, Any] | None:
    """Modul 17: Müllgebühren im Jahr = Grundgebühr (in Modul 20 eingetragen) + Restmüll-Leerungen über den inklusiven hinaus × Gebühr.
    Hochgerechnet mit allen Restmüll-Terminen des Jahres im Kalender."""
    if info is None and not grund:
        return None
    i = info or {}
    fee, incl, done, total = float(i.get("fee") or 0), int(i.get("incl") or 0), int(i.get("done") or 0), int(i.get("total") or 0)
    extra_bis = max(0, done - incl) * fee if incl else 0.0
    extra_jahr = max(0, total - incl) * fee if incl else 0.0
    return {"grund": round(grund, 2), "fee": fee, "incl": incl, "done": done, "total": total, "year": i.get("year"), "zaehlt": info is not None,
            "extra_bisher": round(extra_bis, 2), "extra_jahr": round(extra_jahr, 2), "jahr": round(grund + extra_jahr, 2),
            "frei": max(0, incl - done) if incl else None, "extra_n": max(0, total - incl) if incl else 0}



def fix_m3_import(c: dict[str, Any], g: dict[str, Any] | None) -> list[str]:
    """2026.11.4b33: Korrektur für Gasverträge aus Modul 3 (übernommen mit b31/b32). g = Werte von Modul 3 vor der Übernahme (gas_prev).
    Brennwert über 15 wurde abgeschnitten, ein Grundpreis „pro Jahr“ unter 40 € durch 12 geteilt, einzelne Abschlags-Monate fehlten."""
    out: list[str] = []
    if c.get("sparte") != "gas":
        return out
    g = g or {}
    hw = float(g.get("hw") or 0) if float(g.get("zz") or 0) > 0 else float(g.get("brw") or 0)
    if abs(c["brennwert"] - 15.0) < 1e-9 and hw > 15:
        c["brennwert"] = round(min(40.0, hw), 4)
        out.append(f"Brennwert {str(round(hw, 3)).replace('.', ',')} kWh/m³")
    n = 0
    for p in c["periods"]:
        if p.get("note") == "aus Modul 3" and 0 < p["gp"] * 12 < 40:
            p["gp"] = round(p["gp"] * 12, 4)
            n += 1
    if n:
        out.append(f"Grundpreis in {n} {'Preis' if n == 1 else 'Preisen'}")
    tag = c["abschlag"]["tag"]
    start = int(c["abr"][:2])
    have = {x["d"] for x in c.get("zahlungen") or []}
    add = 0
    b = parse_date(c.get("beginn"))
    for y, yv in (g.get("years") or {}).items():
        if not (re.fullmatch(r"20\d\d", str(y)) and isinstance(yv, dict)):
            continue
        for k, v in (yv.get("absm") or {}).items():
            try:
                i = int(k)
            except (TypeError, ValueError):
                continue
            d = date(int(y) + (start - 1 + i) // 12, (start - 1 + i) % 12 + 1, min(28, tag))
            if (b is None or d >= b) and d.isoformat() not in have:
                c.setdefault("zahlungen", []).append({"d": d.isoformat(), "betrag": float(v), "note": "Monat abweichend (Modul 3)"})
                add += 1
    if add:
        c["zahlungen"] = sorted(c["zahlungen"], key=lambda x: x["d"])
        out.append(f"{add} abweichende Abschlags-Monate")
    return out



def var_payments(c: dict[str, Any], plan: list[dict[str, Any]], s: date, e: date, today: date, bis: dict[str, Any], annual: float,
                 prof: tuple[float, ...], dyn_ct: float | None) -> list[dict[str, Any]]:
    """Einspeisung mit wechselnden Monatsbeträgen: gebuchte Eingänge zählen, künftige Monate werden geschätzt –
    Vergütung des Monats × bisherige Auszahlungsquote (Eingänge ÷ Vergütung bis zum Monat des letzten Eingangs)."""
    got = [x for x in plan if x["d"] <= today.isoformat()]
    tag = int((c.get("abschlag") or {}).get("tag") or 15)
    quote = 1.0
    if got:
        last = parse_date(got[-1]["d"])
        cut = max(s + timedelta(days=1), _month_start(last))
        verg = float(_rest(c, s, cut, annual, prof, 0.0, dyn_ct)["arbeit"]) if cut > s else 0.0
        if bis.get("menge") and today > s:
            # gemessene Vergütung bis heute auf den Zeitraum bis zum letzten Eingang herunterrechnen
            share = _share(prof, s, cut) / max(1e-9, _share(prof, s, today + timedelta(days=1)))
            verg = float(bis["eur"]) * min(1.0, share)
        paid = sum(x["betrag"] for x in got)
        if verg > 1:
            quote = max(0.2, min(2.0, paid / verg))
    out = [dict(x) for x in plan]
    have = {x["d"][:7] for x in plan}
    m = _month_start(today)
    while m < e:
        d = m.replace(day=min(28, tag))
        if d > today and s <= d < e and d.isoformat()[:7] not in have:
            prev0 = add_months(m, -1)
            v = float(_rest(c, max(s, prev0), max(s + timedelta(days=1), m), annual, prof, 0.0, dyn_ct)["arbeit"]) if m > s else 0.0
            out.append({"d": d.isoformat(), "betrag": round(v * quote, 2), "src": "schaetz", "plan": 0.0, "note": f"geschätzt · {round(quote * 100)} % der Vergütung"})
        m = add_months(m, 1)
    return sorted(out, key=lambda x: x["d"])



def kwh_abzug(c: dict[str, Any], s: date, e: date, t1: date) -> dict[str, Any] | None:
    """Einspeisung: fester Abzug in kWh je Jahr, wie ihn manche Netzbetreiber für ein Balkonkraftwerk am selben Zähler ansetzen
    (statt Mischsatz). Bewertet mit der Vergütung laut Vertrag, tagesgenau auf den Zeitraum verteilt."""
    a = c.get("anlagen") or {}
    if c.get("sparte") != "einspeisung" or a.get("modus") != "kwh" or not a.get("abzug_kwh"):
        return None
    u = unit_price(c, min(max(s, t1 - timedelta(days=1)), e - timedelta(days=1))) or {}
    ct = float(u.get("ct") or 0.0)
    year = (e - s).days / 365.0 if (e - s).days > 40 else (e - s).days / 365.0
    kwh = a["abzug_kwh"] * year
    frac = max(0.0, min(1.0, (t1 - s).days / max(1, (e - s).days)))
    return {"kwh": round(kwh, 1), "kwh_jahr": a["abzug_kwh"], "ct": ct, "eur": round(kwh * ct / 100, 2), "eur_bis": round(kwh * frac * ct / 100, 2)}
