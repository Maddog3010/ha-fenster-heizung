"""Modul 1: Luftentfeuchter (Schritt 1 des Konzepts: Gerät und Regelung).

Ein mobiler Entfeuchter steht in einem Raum von Modul 1 (Heizungsraum oder Messraum). Modul 1 regelt ihn mit der
Luftfeuchte und den Fensterkontakten genau dieses Raums: Ein über der Obergrenze, aus unter der Untergrenze
(Hysterese), aus bei offenem Fenster oder vollem Tank, mit Mindestlaufzeit und Sperrzeit gegen ständiges Schalten.
Bei Abwesenheit oder Urlaub gilt eine höhere Obergrenze (Mindestschutz vor Schimmel).

Gerätearten: eigene Entität (humidifier.*, auch switch.* oder fan.*), Schaltsteckdose (switch.*) mit optionaler
Leistungsmessung, oder „nur beobachten“ (Gerät mit eigenem Hygrostat, Modul 1 schaltet nichts).

Schritt 2 (Standort): Einmal am Tag wird bestätigt, in welchem Raum der Entfeuchter steht – über die Standort-Karte
im Dashboard und auf Wunsch per Benachrichtigung am Handy mit Tasten für die häufigsten Räume. Bis zur Antwort gilt der
Standort von gestern. Ohne Antwort bis zur eingestellten Uhrzeit gilt „Wie gestern“, „Pausieren“ oder „Nur Hinweis“.
Der Standort jedes Tages wird mit der Art der Bestätigung gespeichert.

Schritt 3 (Schnellumzug): „Hierher stellen“ auf jeder Raumkarte, bis zu vier Geräte mit eigenem Standort.

Schritt 4 (Strom und Statistik): Bei PV-Überschuss oder günstigem Strom startet das Gerät schon bei einer niedrigeren
Schwelle (Vorziehen), die Obergrenze gilt immer. Je Tag werden Laufzeit, Strom (aus der Leistung oder der Nennleistung),
Kosten (aktueller Strompreis der Haus-Werte), entfeuchtete Menge (Liter pro Stunde) und Standort gespeichert.
Meldungen: Tank voll, Feuchte bleibt trotz Betrieb zu hoch, Standort fehlt, Filter reinigen nach Betriebsstunden.
Ereignis „fenster_heizung_entfeuchter“ bei Start, Stopp, Tank voll und Standortwechsel für eigene Automationen.

Schritt 5 (nur NFC): Am Stellplatz klebt ein NFC-Tag. Die Tags gehören zu „Tags & Karten“ (tags.py) mit der Aktion
„Entfeuchter steht hier“ (lf_here, Gerät|Raum); dort laufen auch Personen, Zeitfenster und Protokoll. Das Feld „nfc“ je
Gerät wird nur noch gelesen, um Tags aus 2026.11.1b14/b15 einmalig dorthin zu übernehmen.

Nachtmodus: In der eingestellten Nachtzeit (z. B. 22–7 Uhr) läuft der Entfeuchter nur bei hoher Feuchte (eigene
Nacht-Grenze, kein Vorziehen) oder bleibt ganz aus. Optional schaltet Modul 1 den Leise-/Schlafmodus des Geräts ein
(humidifier mit passendem Modus) und hält Meldungen bis zum Morgen zurück.

Oben stehen reine Rechenfunktionen ohne Home-Assistant-Importe (testbar), unten der Manager.
"""
from __future__ import annotations

import logging
import math
import re
import time
from datetime import timedelta
from typing import Any

_LOGGER = logging.getLogger(__name__)

TICK_SECONDS = 30
HIST_DAYS = 60
STALL_MIN = 15          # so lange an, gewollt und kein Strom: „läuft nicht an“
CMD_GAP_S = 60          # höchstens ein Schaltbefehl pro Minute, falls das Gerät nicht reagiert
KINDS = ("entity", "plug", "watch")
MAX_DEVS = 4
BOOSTS = ("off", "pv", "cheap", "both")
EVENT = "fenster_heizung_entfeuchter"
_DID = re.compile(r"^d[0-9a-z]{1,10}$")
_TID = re.compile(r"^[A-Za-z0-9_\-:.]{1,100}$")
_ENT = re.compile(r"^[a-z_]+\.[a-z0-9_]{1,200}$")
_LOC = re.compile(r"^(ms_[a-z0-9]{1,16}|[A-Za-z0-9]{8,40})$")
FULL_STATES = {"on", "true", "full", "voll", "problem", "1"}
_HM = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")
_NOTIFY = re.compile(r"^notify\.[a-z0-9_]{1,120}$")
MISS = ("same", "pause", "hint")
NIGHT_MODES = ("hi", "off")
QUIET_MODES = ("sleep", "night", "quiet", "silent", "schlaf", "nacht", "leise", "ruhe", "comfort_sleep")
ACT_PREFIX = "FHLF_"          # Aktionen der Handy-Benachrichtigung: FHLF_<Gerät>_L_<Standort> und FHLF_<Gerät>_OFF (alt: FHLF_L_…)
PUSH_ROOMS = 3                # so viele Raum-Tasten in der Benachrichtigung (Android zeigt höchstens drei)


def default_dev() -> dict[str, Any]:
    return {
        "id": "d1", "name": "Luftentfeuchter", "kind": "entity", "ent": "", "power": "", "run_w": 20.0, "tank": "",
        "tgt": "", "tgt_mode": "min",  # Zielfeuchte am Gerät (number/input_number/humidifier): beim Betrieb auf Minimum oder Untergrenze
        "cap_l": 0.0, "lph": 0.0,  # Tankschätzung ohne Sensor: Tankinhalt und Entfeuchtung pro Stunde (0 = aus)
        "hi": 60.0, "lo": 55.0, "hi_away": 65.0, "minrun": 15, "lock": 10, "vent": False,
        "ask": default_ask(),
        # Schritt 4: Nennleistung ohne Messung, Vorziehen bei PV-Überschuss oder günstigem Strom, Meldungen
        "watt": 250.0, "boost": "off", "boost_hi": 57.0, "cheap_ct": 25.0, "pv_min": 300.0,
        # Nur mit PV-Überschuss: Start nach pv_on Min. Überschuss, Stopp nach pv_off Min. ohne, Schimmelschutz ab pv_safe % (0 = aus),
        # Batterie-Ladung zählt ab pv_soc % Ladestand als Überschuss (0 = nie)
        "pv_only": False, "pv_on": 2, "pv_off": 5, "pv_safe": 70.0, "pv_soc": 0.0,
        "msg": {"full": True, "high": True, "noloc": True, "filter": True, "stall": True}, "high_h": 4.0, "filter_h": 0.0,
        # Nachtmodus
        "night": False, "n_from": "22:00", "n_to": "07:00", "n_mode": "hi", "hi_night": 70.0, "n_quiet": True, "n_msg": True,
    }


def default_ask() -> dict[str, Any]:
    """Tägliche Standortabfrage: Uhrzeit, nur wenn jemand zu Hause ist, Verhalten ohne Antwort bis …, Räume, Handys."""
    return {"on": True, "time": "08:00", "home_only": True, "until": "12:00", "miss": "same", "rooms": [], "push": []}


def clean_ask(raw: Any) -> dict[str, Any]:
    d, r = default_ask(), raw if isinstance(raw, dict) else {}
    t = r.get("time") if isinstance(r.get("time"), str) and _HM.match(r.get("time")) else d["time"]
    u = r.get("until") if isinstance(r.get("until"), str) and _HM.match(r.get("until")) else d["until"]
    if u <= t:  # die Frist liegt immer nach der Abfrage
        u = "23:59" if t >= "23:00" else f"{int(t[:2]) + 1:02d}:{t[3:]}"
    rooms = [x for x in (r.get("rooms") or []) if isinstance(x, str) and _LOC.match(x)]
    push = [x for x in (r.get("push") or []) if isinstance(x, str) and _NOTIFY.match(x)]
    return {"on": r.get("on") is not False, "time": t, "home_only": r.get("home_only") is not False, "until": u,
            "miss": r.get("miss") if r.get("miss") in MISS else d["miss"], "rooms": list(dict.fromkeys(rooms))[:20], "push": list(dict.fromkeys(push))[:6]}


def push_rooms(offer: list[str], yest: str, counts: dict[str, int]) -> list[str]:
    """Raum-Tasten für die Benachrichtigung: zuerst der Raum von gestern, dann die meistgenutzten."""
    order = sorted(offer, key=lambda x: (-counts.get(x, 0), offer.index(x)))
    if yest in order:
        order.remove(yest)
        order.insert(0, yest)
    return order[:PUSH_ROOMS]


def ask_phase(ask: dict[str, Any], hm: str, confirmed: bool) -> str:
    """Stand der Abfrage am Tag: off (keine tägliche Abfrage), done (bestätigt), wait (vor der Uhrzeit), open, missed."""
    if not ask["on"]:
        return "off"
    if confirmed:
        return "done"
    if hm < ask["time"]:
        return "wait"
    return "missed" if hm >= ask["until"] else "open"


def _num(v: Any, lo: float, hi: float, d: float) -> float:
    try:
        x = float(v)
    except (TypeError, ValueError):
        return d
    return d if math.isnan(x) else min(max(x, lo), hi)


def _ent(v: Any, domains: tuple[str, ...]) -> str:
    return v if isinstance(v, str) and _ENT.match(v) and v.split(".")[0] in domains else ""


def clean_dev(raw: Any, did: str = "d1") -> dict[str, Any]:
    d, r = default_dev(), raw if isinstance(raw, dict) else {}
    kind = r.get("kind") if r.get("kind") in KINDS else d["kind"]
    m = r.get("msg") if isinstance(r.get("msg"), dict) else {}
    out = {
        "id": did, "name": str(r.get("name") or d["name"]).strip()[:30] or d["name"], "kind": kind,
        "ent": _ent(r.get("ent"), ("switch",) if kind == "plug" else ("humidifier", "switch", "fan", "input_boolean")),
        "power": _ent(r.get("power"), ("sensor",)), "run_w": _num(r.get("run_w"), 1, 2000, d["run_w"]),
        "tank": _ent(r.get("tank"), ("binary_sensor", "sensor")),
        "tgt": _ent(r.get("tgt"), ("number", "input_number", "humidifier", "select")), "tgt_mode": "lo" if r.get("tgt_mode") == "lo" else "min",
        "cap_l": _num(r.get("cap_l"), 0, 50, 0), "lph": _num(r.get("lph"), 0, 10, 0),
        "hi": _num(r.get("hi"), 30, 90, d["hi"]), "lo": _num(r.get("lo"), 25, 85, d["lo"]),
        "hi_away": _num(r.get("hi_away"), 30, 95, d["hi_away"]),
        "minrun": int(_num(r.get("minrun"), 0, 120, d["minrun"])), "lock": int(_num(r.get("lock"), 0, 120, d["lock"])),
        "vent": r.get("vent") is True, "ask": clean_ask(r.get("ask")),
        "watt": _num(r.get("watt"), 0, 3000, d["watt"]), "boost": r.get("boost") if r.get("boost") in BOOSTS else "off",
        "boost_hi": _num(r.get("boost_hi"), 26, 90, d["boost_hi"]), "cheap_ct": _num(r.get("cheap_ct"), 0, 100, d["cheap_ct"]),
        "pv_min": _num(r.get("pv_min"), 0, 5000, d["pv_min"]),
        "pv_only": r.get("pv_only") is True, "pv_on": int(_num(r.get("pv_on"), 0, 30, d["pv_on"])), "pv_off": int(_num(r.get("pv_off"), 0, 60, d["pv_off"])),
        "pv_safe": _num(r.get("pv_safe"), 0, 95, d["pv_safe"]), "pv_soc": _num(r.get("pv_soc"), 0, 100, d["pv_soc"]),
        "msg": {k: m.get(k) is not False for k in ("full", "high", "noloc", "filter", "stall")},
        "high_h": _num(r.get("high_h"), 1, 48, d["high_h"]), "filter_h": _num(r.get("filter_h"), 0, 5000, 0),
        "nfc": clean_nfc(r.get("nfc")),
        "night": r.get("night") is True,
        "n_from": r.get("n_from") if isinstance(r.get("n_from"), str) and _HM.match(r["n_from"]) else d["n_from"],
        "n_to": r.get("n_to") if isinstance(r.get("n_to"), str) and _HM.match(r["n_to"]) else d["n_to"],
        "n_mode": r.get("n_mode") if r.get("n_mode") in NIGHT_MODES else "hi",
        "hi_night": _num(r.get("hi_night"), 40, 95, d["hi_night"]),
        "n_quiet": r.get("n_quiet") is not False, "n_msg": r.get("n_msg") is not False,
    }
    if out["lo"] >= out["hi"]:
        out["lo"] = max(25.0, out["hi"] - 5)
    if out["hi_night"] < out["hi"]:
        out["hi_night"] = out["hi"]
    if out["hi_away"] < out["hi"]:
        out["hi_away"] = out["hi"]
    if out["pv_safe"] and out["pv_safe"] <= out["lo"]:
        out["pv_safe"] = min(95.0, out["hi"] + 10)
    if not out["lo"] < out["boost_hi"] <= out["hi"]:  # Vorziehen liegt zwischen Unter- und Obergrenze
        out["boost_hi"] = min(out["hi"], out["lo"] + 2)
    return out


def clean_nfc(raw: Any) -> dict[str, str]:
    """NFC-Tags am Stellplatz: Raum -> Tag-ID (ein Tag je Raum und Gerät)."""
    out: dict[str, str] = {}
    for k, v in (raw.items() if isinstance(raw, dict) else []):
        if isinstance(k, str) and _LOC.match(k) and isinstance(v, str) and _TID.match(v) and v not in out.values():
            out[k] = v
    return dict(list(out.items())[:30])


def clean_cfg(raw: Any) -> dict[str, Any]:
    r = raw if isinstance(raw, dict) else {}
    devs, seen = [], set()
    for i, x in enumerate((r.get("devs") or [])[:MAX_DEVS]):
        if not isinstance(x, dict):
            continue
        did = str(x.get("id") or "")
        if not _DID.match(did) or did in seen:
            did = next(f"d{n}" for n in range(1, 50) if f"d{n}" not in seen)
        seen.add(did)
        devs.append(clean_dev(x, did))
    return {"devs": devs}


def price_ct(value: float | None, unit: str = "") -> float | None:
    """Strompreis in ct/kWh. Sensoren in €/kWh (z. B. Tibber) werden umgerechnet."""
    if value is None:
        return None
    if "ct" in unit.lower() or "cent" in unit.lower():
        return value
    return value * 100 if value < 3 else value


def boost_reason(dev: dict[str, Any], pv_w: float | None, price: float | None) -> str:
    """Grund zum Vorziehen: „pv“, „cheap“ oder „“."""
    if dev["boost"] in ("pv", "both") and pv_w is not None and pv_w >= dev["pv_min"]:
        return "pv"
    if dev["boost"] in ("cheap", "both") and price is not None and price <= dev["cheap_ct"]:
        return "cheap"
    return ""


def period_sum(days: dict[str, dict[str, float]], keys: list[str]) -> dict[str, float]:
    """Summe von Laufzeit (min), Strom (kWh), Kosten (€) und Litern über die angegebenen Tage."""
    out = {"min": 0.0, "kwh": 0.0, "eur": 0.0, "lit": 0.0}
    for k in keys:
        d = days.get(k) or {}
        for f in out:
            out[f] += float(d.get(f) or 0)
    return {k: round(v, 3) for k, v in out.items()}


def abs_h(t: float, rh: float) -> float:
    """Absolute Feuchte in g/m³ (Magnus)."""
    es = 6.112 * math.exp(17.62 * t / (243.12 + t))
    return 216.7 * (rh / 100 * es) / (273.15 + t)


def tank_fill(dev: dict[str, Any], run_h: float) -> float | None:
    """Geschätzte Tankfüllung 0..1 ohne Sensor, oder None, wenn keine Schätzung eingestellt ist."""
    if dev["cap_l"] <= 0 or dev["lph"] <= 0:
        return None
    return max(0.0, run_h * dev["lph"] / dev["cap_l"])


def in_night(dev: dict[str, Any], hm: str) -> bool:
    """Liegt die Uhrzeit „HH:MM“ in der Nachtzeit des Geräts (auch über Mitternacht)?"""
    if not dev.get("night"):
        return False
    a, b = dev["n_from"], dev["n_to"]
    if a == b:
        return False
    return a <= hm < b if a < b else (hm >= a or hm < b)


def quiet_mode(modes: Any) -> str:
    """Passender Leise-/Schlafmodus aus available_modes eines humidifier (oder "")."""
    for m in modes if isinstance(modes, (list, tuple)) else []:
        if isinstance(m, str) and any(q in m.lower() for q in QUIET_MODES):
            return m
    return ""


def decide(dev: dict[str, Any], ctx: dict[str, Any], is_on: bool) -> tuple[bool | None, bool, str, list[str]]:
    """Soll das Gerät laufen? Ergebnis: (an?, harter Grund, Kennung, Gründe für „Warum?“).

    Ein harter Grund (Tank voll, Fenster offen, Standort fehlt, heute aus …) schaltet sofort, auch während der
    Mindestlaufzeit. None heißt: nicht schalten (Gerät nicht erreichbar).
    ctx: loc, loc_name, hum, open (Namen offener Fenster), away, out_t, out_rh, avail, full, day_off
    """
    if ctx.get("day_off") == "pause":
        return False, True, "pause", ["Pausiert: Der Standort wurde heute nicht bestätigt. Bestätige ihn, dann regelt Modul 1 wieder."]
    if ctx.get("day_off"):
        return False, True, "day_off", ["Heute nicht in Betrieb. Morgen regelt Modul 1 wieder."]
    if not ctx.get("loc"):
        return False, True, "no_loc", ["Standort unbekannt: Wähle, in welchem Raum der Entfeuchter steht."]
    if not ctx.get("avail"):
        return None, True, "unavail", ["Gerät nicht erreichbar. Modul 1 schaltet nichts, bis es wieder meldet."]
    if ctx.get("full"):
        return False, True, "full", ["Wassertank voll. Bitte leeren und „Tank geleert“ tippen."]
    hum = ctx.get("hum")
    if hum is None:
        return False, True, "no_hum", [f"Luftfeuchte in {ctx.get('loc_name') or 'diesem Raum'} fehlt. Sicherheitshalber aus."]
    if ctx.get("open"):
        return False, True, "window", [f"Fenster offen ({', '.join(ctx['open'])}). Lüften hilft gerade mehr."]
    away, night = bool(ctx.get("away")), bool(ctx.get("night"))
    if night and dev.get("n_mode") == "off":
        return False, True, "night", [f"Nachtmodus bis {dev['n_to']} Uhr: Der Entfeuchter bleibt aus."]
    hi = dev["hi_away"] if away else dev["hi"]
    if night:
        hi = max(hi, dev.get("hi_night", hi))
    lo = hi - (dev["hi"] - dev["lo"])
    tag = " (Abwesenheit: nur Schutz vor Schimmel)" if away else f" (Nachtmodus bis {dev['n_to']} Uhr)" if night else ""
    t, ot, orh = ctx.get("t"), ctx.get("out_t"), ctx.get("out_rh")
    if dev["vent"] and hum > lo and t is not None and ot is not None and orh is not None and abs_h(ot, orh) < abs_h(t, hum) - 0.5:
        return False, False, "vent", [f"Feuchte {hum:.0f} %. Draußen ist die Luft trockener: Lüften statt Entfeuchten."]
    if dev.get("pv_only"):
        safe = bool(dev.get("pv_safe")) and hum >= max(dev["pv_safe"], hi if away or night else 0)
        pv = ctx.get("pv")  # True: Überschuss bestätigt, False: keiner, None: kein Netz-Sensor
        start = dev["boost_hi"] + (hi - dev["hi"])
        if is_on:
            if hum <= lo:
                return False, False, "target", [f"Ziel erreicht: Feuchte {hum:.0f} % ist bei {lo:.0f} % oder darunter{tag}."]
            if pv and (ctx.get("pv_w") or 0) < dev["pv_min"]:
                return True, False, "pv_run", [f"Gerade nur {max(0, ctx.get('pv_w') or 0):.0f} W Überschuss: läuft weiter, aus nach {dev['pv_off']} Min. ohne."]
            if pv:
                return True, False, "pv_run", [f"PV-Überschuss {ctx.get('pv_w', 0):.0f} W: läuft bis {lo:.0f} %{tag}."]
            if safe:
                return True, False, "safe", [f"Schimmelschutz: Feuchte {hum:.0f} % ab {dev['pv_safe']:.0f} %, läuft auch ohne Überschuss bis {lo:.0f} %."]
            if pv is None:
                return False, False, "no_pv", ["Nur mit PV-Überschuss, aber kein Netz-Sensor unter Haus → Energiequellen."]
            return False, False, "no_pv", [f"Kein PV-Überschuss mehr (seit {dev['pv_off']} Min. unter {dev['pv_min']:.0f} W): aus."]
        if safe:
            return True, False, "safe", [f"Schimmelschutz: Feuchte {hum:.0f} % ab {dev['pv_safe']:.0f} %, startet auch ohne Überschuss."]
        if hum <= start:
            return False, False, "ok", [f"Feuchte {hum:.0f} % in Ordnung. Mit PV-Überschuss ein ab {start:.0f} %{tag}."]
        if pv:
            return True, False, "pv_start", [f"PV-Überschuss {ctx.get('pv_w', 0):.0f} W und Feuchte {hum:.0f} % über {start:.0f} %: einschalten bis {lo:.0f} %{tag}."]
        if pv is None:
            return False, False, "no_pv", ["Nur mit PV-Überschuss, aber kein Netz-Sensor unter Haus → Energiequellen."]
        if (ctx.get("pv_w") or 0) >= dev["pv_min"]:
            return False, False, "wait_pv", [f"PV-Überschuss {ctx.get('pv_w'):.0f} W: startet, wenn er {dev['pv_on']} Min. lang anhält."]
        return False, False, "wait_pv", [f"Feuchte {hum:.0f} % über {start:.0f} %, wartet auf PV-Überschuss (ab {dev['pv_min']:.0f} W, gerade {max(0, ctx.get('pv_w') or 0):.0f} W)."
                                        + (f" Schimmelschutz ab {dev['pv_safe']:.0f} %." if dev.get("pv_safe") else "")]
    if is_on:
        if hum > lo:
            return True, False, "run", [f"Feuchte {hum:.0f} % über der Untergrenze {lo:.0f} %: läuft weiter{tag}."]
        return False, False, "target", [f"Ziel erreicht: Feuchte {hum:.0f} % ist bei {lo:.0f} % oder darunter{tag}."]
    if hum > hi:
        return True, False, "start", [f"Feuchte {hum:.0f} % über der Obergrenze {hi:.0f} %: einschalten bis {lo:.0f} %{tag}."]
    b = "" if night else (ctx.get("boost") or "")
    bhi = dev["boost_hi"] + (hi - dev["hi"])
    if b and hum > bhi:
        why = "PV-Überschuss" if b == "pv" else "Strom gerade günstig"
        return True, False, "boost", [f"{why}: Feuchte {hum:.0f} % über {bhi:.0f} %, vorgezogen bis {lo:.0f} %{tag}."]
    return False, False, "ok", [f"Feuchte {hum:.0f} % in Ordnung. Ein ab {hi:.0f} %" + (f", bei PV-Überschuss oder günstigem Strom ab {bhi:.0f} %" if dev["boost"] != "off" and not night else "") + f"{tag}."]


# --------------------------------------------------------------------------- Manager
from homeassistant.core import CALLBACK_TYPE, HomeAssistant  # noqa: E402
from homeassistant.helpers.event import async_track_time_interval  # noqa: E402
from homeassistant.util import dt as dt_util  # noqa: E402

from .backup import SafeStore  # noqa: E402
from .const import CONF_HUMIDITY, CONF_ROOM_TEMP, CONF_THERMOSTATS, CONF_WINDOWS, DOMAIN, PANEL_URL  # noqa: E402


def _fnum(st: Any) -> float | None:
    try:
        x = float(st.state)
    except (AttributeError, TypeError, ValueError):
        return None
    return None if math.isnan(x) else x


def new_state() -> dict[str, Any]:
    """Laufzustand eines Geräts. days: je Tag min, kwh, eur, lit. locs: je Tag {"l": Standort oder "off", "h": Art}."""
    return {"loc": "", "off_day": "", "on_ts": 0.0, "off_ts": 0.0, "days": {}, "locs": {}, "tank_h": 0.0, "full_ts": 0.0,
            "conf_day": "", "sent_day": "", "miss_day": "", "filter_h": 0.0, "high_ts": 0.0, "sent": {}, "held": [], "q_prev": ""}


def load_state(s: Any) -> dict[str, Any]:
    s = s if isinstance(s, dict) else {}
    st = new_state()
    st.update({
        "loc": str(s.get("loc") or "") if _LOC.match(str(s.get("loc") or "")) else "",
        "off_day": str(s.get("off_day") or ""), "on_ts": float(s.get("on_ts") or 0), "off_ts": float(s.get("off_ts") or 0),
        "locs": {str(k): ({"l": str(v.get("l") or ""), "h": str(v.get("h") or "")} if isinstance(v, dict) else {"l": str(v), "h": ""}) for k, v in (s.get("locs") or {}).items()},
        "tank_h": float(s.get("tank_h") or 0), "full_ts": float(s.get("full_ts") or 0), "filter_h": float(s.get("filter_h") or 0),
        "conf_day": str(s.get("conf_day") or ""), "sent_day": str(s.get("sent_day") or ""), "miss_day": str(s.get("miss_day") or ""),
        "high_ts": float(s.get("high_ts") or 0), "sent": {str(k): str(v) for k, v in (s.get("sent") or {}).items()},
        "held": [x for x in (s.get("held") or []) if isinstance(x, dict) and isinstance(x.get("t"), str)][-10:],
        "q_prev": str(s.get("q_prev") or ""),
    })
    days = s.get("days") if isinstance(s.get("days"), dict) else {}
    st["days"] = {str(k): {f: float((v or {}).get(f) or 0) for f in ("min", "kwh", "eur", "lit")} for k, v in days.items() if isinstance(v, dict)}
    for k, v in (s.get("run") or {}).items():  # bis 2026.11.1b13: nur Laufzeit je Tag
        if isinstance(v, (int, float)):
            st["days"].setdefault(str(k), {"min": 0.0, "kwh": 0.0, "eur": 0.0, "lit": 0.0})["min"] = float(v)
    return st


class EntfeuchterManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_entfeuchter")
        self.cfg = clean_cfg({})
        self.st: dict[str, dict[str, Any]] = {}     # je Gerät
        self.live: dict[str, dict[str, Any]] = {}
        self._last_tick = 0.0
        self._cmd_ts: dict[str, float] = {}
        self._was: dict[str, bool] = {}
        self._was_on: dict[str, bool] = {}
        self._pv_st: dict[str, dict[str, Any]] = {}  # Überschuss mit Verzögerung je Gerät
        self._run_ts: dict[str, float] = {}  # zuletzt mit Strom gelaufen
        self._unsub: CALLBACK_TYPE | None = None
        self._unsub_ev: CALLBACK_TYPE | None = None

    async def async_start(self) -> None:
        from .api import _layout  # Messräume stehen im Layout
        await _layout(self.hass)
        d = await self._store.async_load()
        if isinstance(d, dict):
            self.cfg = clean_cfg(d.get("cfg"))
            if isinstance(d.get("devs"), dict):
                self.st = {k: load_state(v) for k, v in d["devs"].items()}
            elif isinstance(d.get("st"), dict) and self.cfg["devs"]:  # bis 2026.11.1b13: ein Gerät, Zustand flach
                self.st = {self.cfg["devs"][0]["id"]: load_state(d["st"])}
        self._unsub = async_track_time_interval(self.hass, self._tick, timedelta(seconds=TICK_SECONDS))
        self._unsub_ev = self.hass.bus.async_listen("mobile_app_notification_action", self._on_action)

    def async_stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None
        if self._unsub_ev:
            self._unsub_ev()
            self._unsub_ev = None

    def _ds(self, did: str) -> dict[str, Any]:
        return self.st.setdefault(did, new_state())

    def dev(self, did: str = "") -> dict[str, Any] | None:
        devs = self.cfg["devs"]
        if did:
            return next((x for x in devs if x["id"] == did), None)
        return devs[0] if devs else None

    async def _on_action(self, event) -> None:
        """Antwort aus der Handy-Benachrichtigung."""
        act = str((event.data or {}).get("action") or "")
        if not act.startswith(ACT_PREFIX):
            return
        rest = act[len(ACT_PREFIX):]
        did = ""
        if not rest.startswith(("L_", "OFF")):  # FHLF_<Gerät>_…
            did, _, rest = rest.partition("_")
        if rest == "OFF":
            await self.async_cmd("off_today", "", did)
        elif rest.startswith("L_"):
            await self.async_cmd("loc", rest[2:], did)

    def _save(self) -> None:
        for ds in self.st.values():
            ds["days"] = {k: ds["days"][k] for k in sorted(ds["days"])[-HIST_DAYS * 7:]}   # gut ein Jahr für die Statistik
            ds["locs"] = {k: ds["locs"][k] for k in sorted(ds["locs"])[-HIST_DAYS * 7:]}
        keep = {d["id"] for d in self.cfg["devs"]}
        self.st = {k: v for k, v in self.st.items() if k in keep}
        self._store.async_delay_save(lambda: {"cfg": self.cfg, "devs": self.st}, 5)

    # ---- Raum des Standorts: Name, Luftfeuchte, Temperatur, Fenster
    def _room(self, loc: str) -> dict[str, Any] | None:
        if not loc:
            return None
        if loc.startswith("ms_"):
            lay = self.hass.data.get(DOMAIN, {}).get("layout") or {}
            m = next((x for x in lay.get("mess") or [] if x.get("id") == loc), None)
            return {"name": m["name"], "hum": m.get("hum") or "", "temp": m.get("temp") or "", "win": [], "th": []} if m else None
        e = self.hass.config_entries.async_get_entry(loc)
        if e is None or e.domain != DOMAIN:
            return None
        o = {**e.data, **e.options}
        win = o.get(CONF_WINDOWS) or []
        th = o.get(CONF_THERMOSTATS) or []
        return {"name": e.title, "hum": o.get(CONF_HUMIDITY) or "", "temp": o.get(CONF_ROOM_TEMP) or "", "win": list(win) if isinstance(win, list) else [win],
                "th": list(th) if isinstance(th, list) else [th]}

    def rooms(self) -> list[dict[str, Any]]:
        """Mögliche Standorte: Räume mit Luftfeuchte-Sensor (Heizungsräume und Messräume)."""
        out = []
        for e in self.hass.config_entries.async_entries(DOMAIN):
            r = self._room(e.entry_id)
            if r and r["hum"]:
                out.append({"id": e.entry_id, "name": r["name"], "hum": _fnum(self.hass.states.get(r["hum"])), "ms": False})
        for m in (self.hass.data.get(DOMAIN, {}).get("layout") or {}).get("mess") or []:
            if m.get("hum"):
                out.append({"id": m["id"], "name": m["name"], "hum": _fnum(self.hass.states.get(m["hum"])), "ms": True})
        return out

    def _outdoor(self) -> tuple[float | None, float | None]:
        lay = self.hass.data.get(DOMAIN, {}).get("layout") or {}
        wx = lay.get("wx") or {}
        st = self.hass.states
        w = st.get(wx.get("entity") or "") if wx.get("entity") else next(iter(st.async_all("weather")), None)
        o = st.get(wx.get("outdoor") or "") if wx.get("outdoor") else None
        t = _fnum(o) if o is not None else None
        if t is None and w is not None:
            t = w.attributes.get("temperature")
        rh = w.attributes.get("humidity") if w is not None else None
        try:
            return (float(t) if t is not None else None, float(rh) if rh is not None else None)
        except (TypeError, ValueError):
            return None, None

    def _haus(self) -> dict[str, Any]:
        hm = self.hass.data.get(DOMAIN, {}).get("haus")
        return getattr(hm, "data", None) or {}

    def _price(self) -> float | None:
        """Aktueller Strompreis in ct/kWh aus den Haus-Werten (Sensor oder Festpreis)."""
        p = self._haus().get("price") or {}
        if p.get("price_mode") == "entity" and p.get("price_sensor"):
            s = self.hass.states.get(p["price_sensor"])
            v = _fnum(s)
            if v is not None:
                return price_ct(v, str(s.attributes.get("unit_of_measurement") or ""))
        try:
            return float(p.get("price")) if p.get("price") is not None else None
        except (TypeError, ValueError):
            return None

    def _export_w(self) -> float | None:
        """Einspeisung am Netzanschluss in Watt (positiv), aus den Haus-Werten."""
        e = self._haus().get("energy") or {}
        ent = (e.get("ent") or {}).get("grid") or ""
        s = self.hass.states.get(ent) if ent else None
        v = _fnum(s)
        if v is None:
            return None
        if str(s.attributes.get("unit_of_measurement") or "").lower() == "kw":
            v *= 1000
        return -v if e.get("sign") == "import" else v

    def _away(self) -> bool:
        pm = self.hass.data.get(DOMAIN, {}).get("presence")
        try:
            return pm is not None and pm.effective() in ("away", "vacation")
        except Exception:  # noqa: BLE001
            return False

    def _is_on(self, dev: dict[str, Any]) -> bool | None:
        s = self.hass.states.get(dev["ent"]) if dev["ent"] else None
        if s is None or s.state in ("unavailable", "unknown"):
            return None
        return s.state == "on"

    def _pw(self, dev: dict[str, Any]) -> float | None:
        """Leistung in Watt (Sensor in W oder kW)."""
        st = self.hass.states.get(dev["power"]) if dev["power"] else None
        p = _fnum(st)
        if p is not None and str((st.attributes or {}).get("unit_of_measurement") or "").strip().lower() == "kw":
            p *= 1000
        return p

    def _power(self, dev: dict[str, Any], running: bool) -> float:
        if dev["power"]:
            p = self._pw(dev)
            if p is not None:
                return max(0.0, p)
        return dev["watt"] if running else 0.0

    def _running(self, dev: dict[str, Any], on: bool | None) -> bool:
        if not on:
            return False
        if dev["power"]:
            p = self._pw(dev)
            if p is not None:
                return p >= dev["run_w"]  # Schalter an, aber unter der Schwelle: Standby, läuft nicht
        st = self.hass.states.get(dev["ent"])  # humidifier meldet (seit HA 2023.7) action: drying, idle, off …
        act = str((st.attributes or {}).get("action") or "") if st is not None else ""
        if act:
            return act in ("drying", "humidifying")
        return True

    def _tgt_want(self, dev: dict[str, Any]) -> tuple[str, Any, Any] | None:
        """Gewünschte Zielfeuchte am Gerät: (Domäne, Wert, aktueller Wert). Minimum des Geräts oder Untergrenze von Modul 1."""
        eid = dev.get("tgt") or (dev["ent"] if dev["ent"].startswith("humidifier.") and dev.get("tgt_mode") else "")
        st = self.hass.states.get(eid) if eid else None
        if st is None or st.state in ("unavailable", "unknown"):
            return None
        dom, a = eid.split(".")[0], st.attributes or {}
        if dom == "humidifier":
            lo_dev, cur = a.get("min_humidity", 30), a.get("humidity")
        elif dom == "select":
            opts = [o for o in a.get("options") or [] if re.match(r"^\d+", str(o))]
            if not opts:
                return None
            nums = sorted(opts, key=lambda o: float(re.match(r"^\d+", str(o)).group()))
            if dev["tgt_mode"] == "lo":
                pick = next((o for o in reversed(nums) if float(re.match(r"^\d+", str(o)).group()) <= dev["lo"]), nums[0])
            else:
                pick = nums[0]
            return (dom, pick, st.state)
        else:
            lo_dev, cur = a.get("min", 30), _fnum(st)
        try:
            lo_dev = float(lo_dev)
        except (TypeError, ValueError):
            lo_dev = 30.0
        want = lo_dev if dev["tgt_mode"] == "min" else max(lo_dev, float(dev["lo"]))
        step = a.get("step") or 1
        try:
            want = round(want / float(step)) * float(step)
        except (TypeError, ValueError, ZeroDivisionError):
            pass
        return (dom, want, cur)

    async def _tgt_step(self, dev: dict[str, Any], on: bool | None, want: bool | None) -> str:
        """Steht das Gerät an und soll laufen, die Zielfeuchte am Gerät tiefer stellen als die Grenze von Modul 1."""
        if dev["kind"] == "watch" or not on or want is False or not dev.get("tgt"):
            return ""
        w = self._tgt_want(dev)
        if w is None:
            return ""
        dom, val, cur = w
        try:
            same = float(cur) == float(val) if dom != "select" else str(cur) == str(val)
        except (TypeError, ValueError):
            same = False
        if same:
            return ""
        now, key = time.time(), dev["id"] + "_tgt"
        if now - self._cmd_ts.get(key, 0) < CMD_GAP_S * 5:
            return ""
        self._cmd_ts[key] = now
        eid = dev["tgt"]
        try:
            if dom == "humidifier":
                await self.hass.services.async_call("humidifier", "set_humidity", {"entity_id": eid, "humidity": int(val)}, blocking=False)
            elif dom == "select":
                await self.hass.services.async_call("select", "select_option", {"entity_id": eid, "option": val}, blocking=False)
            else:
                await self.hass.services.async_call(dom, "set_value", {"entity_id": eid, "value": val}, blocking=False)
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("Luftentfeuchter %s: Zielfeuchte nicht gesetzt: %s", eid, err)
            return ""
        fmt = lambda v: str(v).rstrip("%").removesuffix(".0")  # noqa: E731
        return f"Zielfeuchte am Gerät von {fmt(cur)} auf {fmt(val)} % gestellt, damit Modul 1 regelt."

    def _bat_charge_w(self, dev: dict[str, Any]) -> float:
        """Ladeleistung der Hausbatterie in W, wenn sie ab pv_soc % Ladestand als Überschuss zählt (sonst 0)."""
        if not dev.get("pv_soc"):
            return 0.0
        h = self._haus()
        soc = _fnum(self.hass.states.get(h.get("soc") or "")) if h.get("soc") else None
        if soc is None or soc < dev["pv_soc"]:
            return 0.0
        e = h.get("energy") or {}
        ent = e.get("ent") or {}

        def w(eid: str) -> float | None:
            st = self.hass.states.get(eid) if eid else None
            v = _fnum(st)
            if v is not None and str((st.attributes or {}).get("unit_of_measurement") or "").lower() == "kw":
                v *= 1000
            return v
        if e.get("bmode") == "two":
            c = w(ent.get("bchg") or "")
            return max(0.0, c or 0.0)
        b = w(ent.get("bat") or "")
        if b is None:
            return 0.0
        return max(0.0, -b if e.get("bsign") == "discharge" else b)

    def _has_action(self, dev: dict[str, Any]) -> bool:
        st = self.hass.states.get(dev["ent"]) if dev["ent"] else None
        return st is not None and bool((st.attributes or {}).get("action"))

    def _tank_full(self, dev: dict[str, Any], ds: dict[str, Any]) -> tuple[bool, float | None]:
        if dev["tank"]:
            s = self.hass.states.get(dev["tank"])
            if s is not None:
                v = _fnum(s)
                if v is not None and dev["tank"].startswith("sensor."):
                    return v >= 95, min(1.0, v / 100)
                return s.state.lower() in FULL_STATES, None
        f = tank_fill(dev, ds["tank_h"])
        return (f is not None and f >= 1.0), f

    async def _switch(self, dev: dict[str, Any], on: bool) -> None:
        dom = dev["ent"].split(".")[0]
        svc_dom = dom if dom in ("humidifier", "fan", "input_boolean") else "switch"
        try:
            await self.hass.services.async_call(svc_dom, "turn_on" if on else "turn_off", {"entity_id": dev["ent"]}, blocking=False)
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("Luftentfeuchter %s konnte nicht geschaltet werden: %s", dev["ent"], err)

    def _qmode(self, dev: dict[str, Any]) -> str:
        """Leise-/Schlafmodus, den das Gerät anbietet (nur humidifier mit available_modes)."""
        if not dev["ent"].startswith("humidifier."):
            return ""
        st = self.hass.states.get(dev["ent"])
        return quiet_mode(st.attributes.get("available_modes")) if st is not None else ""

    async def _quiet(self, dev: dict[str, Any], ds: dict[str, Any], want: bool) -> None:
        """Nachts den Leise-Modus setzen, morgens den vorherigen Modus wiederherstellen."""
        qm = self._qmode(dev)
        st = self.hass.states.get(dev["ent"]) if dev["ent"] else None
        if st is None or st.state in ("unavailable", "unknown"):
            return
        cur = str(st.attributes.get("mode") or "")
        try:
            if want and qm and not ds["q_prev"]:
                ds["q_prev"] = cur or "__none__"
                if cur != qm:
                    await self.hass.services.async_call("humidifier", "set_mode", {"entity_id": dev["ent"], "mode": qm}, blocking=False)
            elif not want and ds["q_prev"]:
                prev, ds["q_prev"] = ds["q_prev"], ""
                if prev != "__none__" and cur == qm and prev != qm:
                    await self.hass.services.async_call("humidifier", "set_mode", {"entity_id": dev["ent"], "mode": prev}, blocking=False)
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("Luftentfeuchter %s: Leise-Modus nicht gesetzt: %s", dev["ent"], err)

    def _event(self, dev: dict[str, Any], typ: str, **extra: Any) -> None:
        ds = self._ds(dev["id"])
        self.hass.bus.async_fire(EVENT, {"type": typ, "device": dev["id"], "name": dev["name"], "room": self._name(ds["loc"]), "location": ds["loc"], **extra})

    async def _notify(self, dev: dict[str, Any], key: str, mark: str, text: str) -> None:
        """Meldung einmal je Anlass (mark) an die Handys des Geräts."""
        ds = self._ds(dev["id"])
        if not dev["msg"].get(key) or ds["sent"].get(key) == mark:
            return
        ds["sent"][key] = mark
        if dev.get("n_msg") and in_night(dev, dt_util.now().strftime("%H:%M")):
            ds["held"] = [x for x in ds["held"] if x.get("k") != key] + [{"k": key, "t": text}]  # nachts zurückhalten, morgens senden
            return
        await self._push(dev, key, text)

    async def _push(self, dev: dict[str, Any], key: str, text: str) -> None:
        for svc in dev["ask"]["push"]:
            name = svc.split(".", 1)[1]
            if self.hass.services.has_service("notify", name):
                try:
                    await self.hass.services.async_call("notify", name, {"title": dev["name"], "message": text, "data": {"tag": f"fh_lf_{dev['id']}_{key}", "url": f"/{PANEL_URL}?modul=fh", "clickAction": f"/{PANEL_URL}?modul=fh"}}, blocking=False)
                except Exception as err:  # noqa: BLE001
                    _LOGGER.warning("Entfeuchter-Meldung an %s fehlgeschlagen: %s", svc, err)

    # ---- Regelung
    async def _tick(self, _now=None) -> None:
        now = time.time()
        dt = min(max(now - (self._last_tick or now), 0.0), 120.0)
        self._last_tick = now
        price, export = self._price(), self._export_w()
        ot, orh = self._outdoor()
        away = self._away()
        for dev in self.cfg["devs"]:
            try:
                await self._tick_dev(dev, now, dt, price, export, ot, orh, away)
            except Exception:  # noqa: BLE001
                _LOGGER.exception("Luftentfeuchter %s: Fehler in der Regelung", dev["id"])
        self._save()

    async def _tick_dev(self, dev, now, dt, price, export, ot, orh, away) -> None:
        did, ds = dev["id"], self._ds(dev["id"])
        if not dev["ent"]:
            self.live[did] = {"code": "setup", "why": ["Noch kein Gerät gewählt."]}
            return
        today = dt_util.now().date().isoformat()
        on = self._is_on(dev)
        prev_on = self._was_on.get(did)
        if on is not None and prev_on is not None and on != prev_on:  # auch von Hand oder durch das Gerät geschaltet
            if on:
                ds["on_ts"] = now
            else:
                ds["off_ts"] = now
        if on is not None:
            self._was_on[did] = on
        running = self._running(dev, on)
        pw = self._power(dev, running)
        # Laufzeit, Strom, Kosten und Liter je Tag
        if dt:
            day = ds["days"].setdefault(today, {"min": 0.0, "kwh": 0.0, "eur": 0.0, "lit": 0.0})
            kwh = pw * dt / 3.6e6
            day["kwh"] += kwh
            day["eur"] += kwh * (price or 0) / 100
            if running:
                day["min"] += dt / 60
                day["lit"] += dev["lph"] * dt / 3600
                ds["tank_h"] += dt / 3600
                ds["filter_h"] += dt / 3600
        if ds["off_day"] and ds["off_day"] != today:
            ds["off_day"] = ""
        await self._ask_step(dev, ds, today)
        rec = ds["locs"].get(today) or {"l": "", "h": ""}
        rec["l"] = "off" if ds["off_day"] == today else ds["loc"]
        if rec["l"]:
            ds["locs"][today] = rec
        room = self._room(ds["loc"])
        if ds["loc"] and room is None:  # Raum gelöscht
            ds["loc"] = ""
        hum = _fnum(self.hass.states.get(room["hum"])) if room and room["hum"] else None
        if hum is not None and not 0 <= hum <= 100:
            hum = None
        t = _fnum(self.hass.states.get(room["temp"])) if room and room["temp"] else None
        if t is None and room:
            for th in room.get("th") or []:
                s = self.hass.states.get(th)
                try:
                    t = float(s.attributes.get("current_temperature")) if s is not None and s.attributes.get("current_temperature") is not None else None
                except (TypeError, ValueError):
                    t = None
                if t is not None:
                    break
        open_w = []
        for w in (room or {}).get("win") or []:
            s = self.hass.states.get(w)
            if s is not None and s.state in ("on", "open"):
                open_w.append(s.attributes.get("friendly_name") or w)
        full, fill = self._tank_full(dev, ds)
        if not full and ds["full_ts"] and dev["tank"]:  # Tank-Sensor meldet wieder leer: nächste volle Meldung zählt neu
            ds["full_ts"] = 0.0
            ds["sent"].pop("full", None)
        if full and not ds["full_ts"]:
            ds["full_ts"] = now
            self._event(dev, "tank_full")
        pv_w = (export + (pw if running else 0)) if export is not None else None  # eigener Verbrauch zählt zum Überschuss
        bat_w = self._bat_charge_w(dev)
        if pv_w is not None and bat_w:
            pv_w += bat_w  # Batterie lädt und ist voll genug: diese Leistung darf der Entfeuchter nehmen
        pv_ok = None
        if dev["pv_only"] and pv_w is not None:
            raw = pv_w >= dev["pv_min"]
            ps = self._pv_st.setdefault(did, {"raw": raw, "ts": now, "ok": raw and running})
            if raw != ps["raw"]:
                ps["raw"], ps["ts"] = raw, now
            held = (now - ps["ts"]) / 60
            if raw and not ps["ok"] and held >= dev["pv_on"]:
                ps["ok"] = True
            elif not raw and ps["ok"] and held >= dev["pv_off"]:
                ps["ok"] = False
            pv_ok = ps["ok"]
        boost = boost_reason(dev, pv_w, price)
        ctx = {"loc": ds["loc"] if room else "", "loc_name": room["name"] if room else "", "hum": hum, "t": t, "open": open_w,
               "away": away, "out_t": ot, "out_rh": orh, "avail": on is not None, "full": full, "boost": "" if dev["pv_only"] else boost,
               "pv": pv_ok, "pv_w": pv_w,
               "day_off": ("pause" if (ds["locs"].get(today) or {}).get("h") == "pause" else True) if ds["off_day"] == today else False}
        night = in_night(dev, dt_util.now().strftime("%H:%M"))
        ctx["night"] = night
        if dev["kind"] != "watch":
            await self._quiet(dev, ds, night and dev["n_quiet"])
        if not night and ds["held"]:
            held, ds["held"] = ds["held"], []
            for x in held:
                await self._push(dev, x.get("k", "msg"), x["t"])
        want, hard, code, why = decide(dev, ctx, bool(on))
        hint = ""
        if on and dev["power"] and not running and code == "run":
            why = [f"Steckdose an, das Gerät läuft aber nicht: {pw:.1f} W, gezählt wird erst ab {dev['run_w']:g} W.".replace(".", ",", 1)] + why
        if running:
            self._run_ts[did] = now
        stall_m = (now - max(ds["on_ts"], self._run_ts.get(did, 0.0))) / 60 if on and ds["on_ts"] and not running and (dev["power"] or self._has_action(dev)) and want else 0.0
        stall = dev["kind"] != "watch" and stall_m >= STALL_MIN and not full
        if stall:
            was = self._run_ts.get(did, 0.0) > ds["on_ts"]
            tw = self._tgt_want(dev) if dev.get("tgt") else None
            hint = (f"Seit {stall_m:.0f} Min. eingeschaltet, aber das Gerät läuft nicht. "
                    + ("Es lief schon und hat aufgehört: Tank voll, Schwimmer ausgelöst oder eigene Zielfeuchte erreicht?" if was
                       else ("Startet es nach dem Einschalten nicht von selbst (Auto-Neustart aus)?" + (f" Zielfeuchte am Gerät steht auf {tw[2]} %." if tw else " Oder ist am Gerät eine höhere Zielfeuchte eingestellt? Unter Gerät lässt sich die Zielfeuchte-Entität wählen."))))
            where = f" ({room['name']})" if room else ""
            await self._notify(dev, "stall", today, f"{dev['name']}{where}: eingeschaltet, läuft aber nicht. Tank voll oder Gerät aus?")
        elif on and dev["power"] and not running:
            hint = f"Eingeschaltet, zieht aber nur {pw:.1f} W (läuft erst ab {dev['run_w']:g} W). Standby, Tank voll oder Zielfeuchte am Gerät erreicht?".replace(".", ",", 1)
        if want is not None and on is not None and want != on and not hard:
            if on and now - ds["on_ts"] < dev["minrun"] * 60:
                left = math.ceil((dev["minrun"] * 60 - (now - ds["on_ts"])) / 60)
                want, why = True, why + [f"Mindestlaufzeit: noch {left} Min."]
            elif not on and now - ds["off_ts"] < dev["lock"] * 60:
                left = math.ceil((dev["lock"] * 60 - (now - ds["off_ts"])) / 60)
                want, why = False, why + [f"Sperrzeit nach dem Ausschalten: noch {left} Min."]
        tmsg = await self._tgt_step(dev, on, want)
        if tmsg:
            why = why + [tmsg]
        if dev["kind"] == "watch":
            why = ["Nur beobachten: Das Gerät regelt selbst, Modul 1 schaltet nichts."] + why
        elif want is not None and on is not None and want != on and now - self._cmd_ts.get(did, 0) >= CMD_GAP_S:
            self._cmd_ts[did] = now
            await self._switch(dev, want)
            if want:
                ds["on_ts"] = now
            else:
                ds["off_ts"] = now
        if on and not ds["on_ts"]:
            ds["on_ts"] = now
        if did in self._was and self._was[did] != running:
            self._event(dev, "start" if running else "stop", reason=code)
        self._was[did] = running
        # Meldungen
        rname = room["name"] if room else ""
        if full:
            await self._notify(dev, "full", str(int(ds["full_ts"])), f"Wassertank voll{f' ({rname})' if rname else ''}. Bitte leeren und im Dashboard „Tank geleert“ tippen.")
        hi_now = max(dev["hi_away"] if away else dev["hi"], dev["hi_night"] if night and dev["n_mode"] == "hi" else 0)
        if running and hum is not None and hum > hi_now:
            ds["high_ts"] = ds["high_ts"] or now
        else:
            ds["high_ts"] = 0.0
        high = bool(ds["high_ts"]) and now - ds["high_ts"] >= dev["high_h"] * 3600
        if high:
            await self._notify(dev, "high", today, f"Feuchte in {rname} bleibt trotz {dev['high_h']:.0f} Std. Betrieb über {hi_now:.0f} %. Tür zu? Gerät zu klein oder Filter voll?")
        noloc = dev["ask"]["on"] and ds["miss_day"] == today and (not ds["loc"] or (ds["locs"].get(today) or {}).get("h") in ("pause", "hint"))
        if noloc:
            await self._notify(dev, "noloc", today, "Standort heute nicht bestätigt. Wo steht der Entfeuchter?")
        filt = dev["filter_h"] > 0 and ds["filter_h"] >= dev["filter_h"]
        if filt:
            await self._notify(dev, "filter", "due", f"Filter reinigen: {ds['filter_h']:.0f} Betriebsstunden seit der letzten Reinigung.")
        msgs = []
        if full:
            msgs.append(["full", "Wassertank voll"])
        if high:
            msgs.append(["high", f"Feuchte bleibt trotz {dev['high_h']:.0f} Std. Betrieb zu hoch"])
        if noloc:
            msgs.append(["noloc", "Standort heute nicht bestätigt"])
        if stall:
            msgs.append(["stall", "Eingeschaltet, läuft aber nicht"])
        if filt:
            msgs.append(["filter", f"Filter reinigen ({ds['filter_h']:.0f} Betriebsstunden)"])
        self.live[did] = {
            "code": code, "why": why, "hint": hint, "on": on, "running": running, "want": want, "hum": hum, "t": t,
            "loc_name": rname, "open": open_w, "away": away, "full": full, "fill": fill, "boost": "" if dev["pv_only"] else boost, "power": round(pw),
            "since": ds["on_ts"] if on else ds["off_ts"], "today_min": round((ds["days"].get(today) or {}).get("min", 0.0), 1),
            "msgs": msgs, "filter_h": round(ds["filter_h"], 1), "night": night, "held": len(ds["held"]),
            "has_pw": bool(dev["power"]) or self._has_action(dev), "stall": stall, "run_w": dev["run_w"], "quiet": self._qmode(dev), "quiet_on": bool(ds["q_prev"]), "price": price, "pv_w": round(pv_w) if pv_w is not None else None, "pv_only": dev["pv_only"], "pv_ok": pv_ok,
        }

    # ---- Tägliche Standortabfrage (Schritt 2)
    def _offer(self, dev: dict[str, Any]) -> list[dict[str, Any]]:
        allr = self.rooms()
        sel = dev["ask"]["rooms"]
        return [r for r in allr if r["id"] in sel] if sel and any(r["id"] in sel for r in allr) else allr

    def _yesterday(self, ds: dict[str, Any]) -> str:
        y = (dt_util.now().date() - timedelta(days=1)).isoformat()
        return (ds["locs"].get(y) or {}).get("l") or ""

    def _someone_home(self) -> bool:
        pm = self.hass.data.get(DOMAIN, {}).get("presence")
        try:
            states = pm._person_states() if pm is not None else []
        except Exception:  # noqa: BLE001
            states = []
        return (not states) or any(h for h, _ in states)

    async def _ask_step(self, dev: dict[str, Any], ds: dict[str, Any], today: str) -> None:
        ask = dev["ask"]
        hm = dt_util.now().strftime("%H:%M")
        phase = ask_phase(ask, hm, ds["conf_day"] == today)
        if phase == "open" and ask["push"] and ds["sent_day"] != today and (not ask["home_only"] or self._someone_home()):
            ds["sent_day"] = today
            await self._send_ask(dev)
        if phase == "missed" and ds["miss_day"] != today:
            ds["miss_day"] = today
            rec = ds["locs"].setdefault(today, {"l": ds["loc"], "h": ""})
            if ask["miss"] == "same" and ds["loc"]:
                ds["conf_day"], rec["h"] = today, "auto"
            elif ask["miss"] == "pause":
                ds["off_day"], rec["h"] = today, "pause"
            else:
                rec["h"] = "hint"

    def _name(self, loc: str) -> str:
        if loc == "off":
            return "nicht in Betrieb"
        r = self._room(loc)
        return r["name"] if r else ""

    async def _send_ask(self, dev: dict[str, Any], targets: list[str] | None = None) -> int:
        """Benachrichtigung „Wo steht der Entfeuchter heute?“ mit Tasten für die häufigsten Räume."""
        ds = self._ds(dev["id"])
        offer = self._offer(dev)
        counts: dict[str, int] = {}
        for rec in ds["locs"].values():
            if rec.get("l") and rec["l"] != "off":
                counts[rec["l"]] = counts.get(rec["l"], 0) + 1
        ids = push_rooms([r["id"] for r in offer], ds["loc"] or self._yesterday(ds), counts)
        names = {r["id"]: r["name"] for r in offer}
        hum = {r["id"]: r["hum"] for r in offer}
        cur = ds["loc"]
        msg = f"Gestern: {names.get(cur) or self._name(cur)}" + (f" · Feuchte dort {hum[cur]:.0f} %" if cur in hum and hum[cur] is not None else "") if cur else "Noch kein Standort gewählt."
        data = {"tag": f"fh_entfeuchter_{dev['id']}", "url": f"/{PANEL_URL}?modul=fh", "clickAction": f"/{PANEL_URL}?modul=fh",
                "actions": [{"action": f"{ACT_PREFIX}{dev['id']}_L_{i}", "title": names[i]} for i in ids]}
        sent = 0
        for svc in targets if targets is not None else dev["ask"]["push"]:
            name = svc.split(".", 1)[1]
            if not self.hass.services.has_service("notify", name):
                continue
            try:
                await self.hass.services.async_call("notify", name, {"title": f"Wo steht der {dev['name']} heute?", "message": msg + " Anderer Raum oder heute aus: im Dashboard.", "data": data}, blocking=False)
                sent += 1
            except Exception as err:  # noqa: BLE001
                _LOGGER.warning("Entfeuchter-Abfrage an %s fehlgeschlagen: %s", svc, err)
        return sent

    def _hist(self, ds: dict[str, Any], days: int = 14) -> list[dict[str, Any]]:
        out = []
        base = dt_util.now().date()
        for i in range(days):
            d = (base - timedelta(days=i)).isoformat()
            rec = ds["locs"].get(d)
            out.append({"d": d, "l": rec["l"] if rec else "", "name": self._name(rec["l"]) if rec and rec["l"] else "", "h": rec["h"] if rec else "",
                        "min": round((ds["days"].get(d) or {}).get("min", 0.0))})
        return out

    def _stats(self, ds: dict[str, Any]) -> dict[str, Any]:
        """Statistik: Heute, 7 Tage, dieser Monat, dieses Jahr – Summen und Tage pro Raum."""
        base = dt_util.now().date()
        per = {
            "day": [base.isoformat()],
            "week": [(base - timedelta(days=i)).isoformat() for i in range(7)],
            "month": [k for k in set(ds["days"]) | set(ds["locs"]) if k[:7] == base.isoformat()[:7]],
            "year": [k for k in set(ds["days"]) | set(ds["locs"]) if k[:4] == base.isoformat()[:4]],
        }
        out = {}
        for k, keys in per.items():
            rooms: dict[str, int] = {}
            for d in keys:
                rec = ds["locs"].get(d)
                if rec and rec.get("l"):
                    n = self._name(rec["l"]) or "Raum gelöscht"
                    rooms[n] = rooms.get(n, 0) + 1
            out[k] = {**period_sum(ds["days"], keys), "rooms": sorted(rooms.items(), key=lambda x: -x[1])}
        return out

    # ---- Bedienung
    def _dev_snap(self, dev: dict[str, Any]) -> dict[str, Any]:
        ds = self._ds(dev["id"])
        today = dt_util.now().date().isoformat()
        ph = ask_phase(dev["ask"], dt_util.now().strftime("%H:%M"), ds["conf_day"] == today)
        y = self._yesterday(ds)
        rec = ds["locs"].get(today) or {}
        return {"id": dev["id"], "loc": ds["loc"], "off_day": ds["off_day"], "live": self.live.get(dev["id"], {}),
                "ask": {"phase": ph, "conf": ds["conf_day"] == today, "how": rec.get("h") or "", "yest": y, "yest_name": self._name(y) if y else "",
                        "sent": ds["sent_day"] == today, "offer": [r["id"] for r in self._offer(dev)]},
                "hist": self._hist(ds), "stats": self._stats(ds)}

    def snapshot(self) -> dict[str, Any]:
        return {"cfg": self.cfg, "rooms": self.rooms(), "devs": {d["id"]: self._dev_snap(d) for d in self.cfg["devs"]}, "max": MAX_DEVS}

    async def async_set(self, raw: Any) -> dict[str, Any]:
        old = {d["id"]: d for d in self.cfg["devs"]}
        self.cfg = clean_cfg(raw)
        for d in self.cfg["devs"]:  # alte NFC-Zuordnung bleibt bis zur Übernahme durch „Tags & Karten“ erhalten
            d["nfc"] = dict(old[d["id"]]["nfc"]) if d["id"] in old else {}
        for d in self.cfg["devs"]:  # neues Gerät oder anderes Gerät: Zustand neu
            if d["id"] in old and old[d["id"]]["ent"] and old[d["id"]]["ent"] != d["ent"]:
                ds = self._ds(d["id"])
                ds["on_ts"] = ds["off_ts"] = 0.0
        self._save()
        await self._tick()
        return self.snapshot()

    async def async_cmd(self, cmd: str, arg: str = "", did: str = "", how: str = "ok") -> dict[str, Any]:
        dev = self.dev(did)
        if dev is None:
            return self.snapshot()
        ds = self._ds(dev["id"])
        today = dt_util.now().date().isoformat()
        if cmd == "loc":  # Standort setzen oder bestätigen (auch „Hierher stellen“), gilt für den Tag
            if arg == "" or (_LOC.match(arg) and self._room(arg) is not None):
                moved = arg != ds["loc"]
                ds["loc"], ds["off_day"] = arg, ""
                if arg:
                    ds["conf_day"] = today
                    ds["locs"][today] = {"l": arg, "h": how}
                if moved:
                    self._event(dev, "location")
        elif cmd == "off_today":
            ds["off_day"], ds["conf_day"] = today, today
            ds["locs"][today] = {"l": "off", "h": "ok"}
        elif cmd == "on_today":
            ds["off_day"] = ""
            if ds["loc"]:
                ds["locs"][today] = {"l": ds["loc"], "h": (ds["locs"].get(today) or {}).get("h") or "ok"}
        elif cmd == "tank_empty":
            ds["tank_h"], ds["full_ts"] = 0.0, 0.0
            ds["sent"].pop("full", None)
        elif cmd == "filter_reset":
            ds["filter_h"] = 0.0
            ds["sent"].pop("filter", None)
        elif cmd == "ask_test":
            n = await self._send_ask(dev)
            snap = self.snapshot()
            snap["test_sent"] = n
            return snap
        self._save()
        await self._tick()
        return self.snapshot()
