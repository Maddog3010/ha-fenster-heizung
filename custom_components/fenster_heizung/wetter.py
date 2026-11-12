"""Modul 9: Wetter & Warnungen – eigene Warnungen aus Wetter-Entität/Wetterstation, Vorwarnung, Aktionen, Fenster-Erinnerung, Meldungen."""
from __future__ import annotations

import logging
import re
import time
from datetime import timedelta
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

TICK_SECONDS = 60
SCHEMA = 2  # 2: Hagel getrennt, Stufen 1–4, Starkregen in mm/h, Glätte (Modul 9 v0.6)
KEYS = ("storm", "thunder", "hail", "rain", "frost", "heat")
NAMES = {"storm": "Sturm", "thunder": "Gewitter", "hail": "Hagel", "rain": "Starkregen", "frost": "Frost & Glätte", "heat": "Hitze"}
OFFICIAL_PLATFORMS = ("dwd_weather_warnings", "nina", "meteoalarm")
SRC = {"dwd_weather_warnings": "DWD", "nina": "NINA", "meteoalarm": "MeteoAlarm"}
THUNDER_CONDS = ("lightning", "lightning-rainy")
WET_CONDS = ("rainy", "pouring", "snowy", "snowy-rainy", "fog", "lightning-rainy", "hail")
CLEAR_AFTER_S = 600  # eine Warnung (oder Stufe) endet erst, wenn sie 10 Minuten lang vorbei ist
UNDO_AFTER_S = 900  # Rückgängig 15 Minuten nach Ende der Warnung
START_TICKS = 2  # Sturm beginnt erst nach zwei Messungen in Folge (Böen glätten)
NOTE_GAP_S = 3600  # Vorwarnung/amtliche Warnung höchstens einmal pro Stunde je Art
STALE_S = 5400  # Wetterquelle gilt nach 90 Minuten ohne neuen Wert als veraltet
FC_TTL_S = 900
FC_HOURS = 48
MAX_ACTS = 16
MAX_LOG = 400
LOG_DAYS = 90
MAX_OFF = 12
WIN_REPEAT_S = 900  # Fenster-Erinnerung alle 15 Minuten, bis zu oder quittiert
WHEN = ("always", "away", "home", "day", "night")
SIGNAL_WX = f"{DOMAIN}_wetter_update"  # Sensoren (Warnstufe) neu schreiben
EVENT_WX = f"{DOMAIN}_wetter_warnung"  # Ereignis für eigene Automationen
SEVERE_ARTS = ("storm", "thunder", "hail", "rain", "flood", "other")
ACT_PREFIX = "FHWX_"  # Knöpfe in der Handy-Meldung: FHWX_ACK, FHWX_CLOSE, FHWX_PAUSE
WIND_FACTOR = {"km/h": 1.0, "m/s": 3.6, "mph": 1.609344, "kn": 1.852, "kt": 1.852, "ft/s": 1.09728}
RAIN_FACTOR = {"mm/h": 1.0, "mm": 1.0, "in/h": 25.4, "in": 25.4, "mm/hr": 1.0, "l/m²/h": 1.0}
_ENT = re.compile(r"^[a-z_]+\.[a-z0-9_]+$")
# Begriffe amtlicher Warnungen -> eigene Warnart (für Zuordnung und spätere Zeitleiste)
_ART = (("hagel", "hail"), ("gewitter", "thunder"), ("sturm", "storm"), ("orkan", "storm"), ("wind", "storm"), ("böen", "storm"),
        ("starkregen", "rain"), ("dauerregen", "rain"), ("regen", "rain"), ("frost", "frost"), ("glätte", "frost"), ("glatteis", "frost"),
        ("schnee", "frost"), ("hitze", "heat"), ("hochwasser", "flood"), ("thunder", "thunder"), ("wind", "storm"), ("rain", "rain"), ("snow", "frost"), ("ice", "frost"), ("heat", "heat"))


def default_cfg() -> dict[str, Any]:
    return {
        "v": SCHEMA,
        "warn": {
            "storm": {"on": True, "kmh": 60, "kmh3": 90}, "thunder": {"on": True}, "hail": {"on": True},
            "rain": {"on": False, "mm": 10, "mm3": 25}, "frost": {"on": True, "temp": 0, "ice": True, "ice_temp": 1},
            "heat": {"on": False, "temp": 30, "temp2": 35},
        },
        "wind": "", "rainrate": "", "ahead": {"on": True, "hours": 3}, "official": {"on": True, "ent": "", "vorab": True}, "acts": [],
        "win": {"on": False, "warn": ["storm", "thunder", "hail", "rain"], "repeat": True},
        "notify": {"start": True, "end": False, "ahead": True, "to": [], "stale": True, "buttons": True, "critical": False},
        "vor": {"on": True, "hours": 12, "akku": True, "akku_ent": "", "akku_auto": False, "car": True, "car_min": 50, "car_auto": False,
                "heat": True, "heat_covers": [], "heat_auto": False, "frost": True},
        "tab_lv": 3,
    }


def _num(v: Any, lo: float, hi: float, d: float) -> float:
    try:
        x = float(v)
    except (TypeError, ValueError):
        return d
    return min(hi, max(lo, x)) if x == x else d


def _ent(v: Any, domains: tuple[str, ...] | None = None) -> str:
    if isinstance(v, str) and _ENT.match(v) and (domains is None or v.split(".")[0] in domains):
        return v
    return ""


def do_options(ent: str) -> tuple[str, ...]:
    d = ent.split(".")[0]
    return ("close", "open") if d == "cover" else ("run",) if d in ("script", "scene") else ("on", "off")


def migrate(raw: Any) -> tuple[Any, bool]:
    """Alte Einstellungen (vor v0.6) einmalig übernehmen: Hagel wie Gewitter, Aktionen bei Gewitter gelten auch für Hagel, Sturm Stufe 3 = Grenze + 30 km/h."""
    if not isinstance(raw, dict) or not raw or int(_num(raw.get("v"), 0, 99, 0)) >= SCHEMA:
        return raw, False
    r = json_copy(raw)
    w = r.get("warn") if isinstance(r.get("warn"), dict) else {}
    th = w.get("thunder") if isinstance(w.get("thunder"), dict) else {}
    w.setdefault("hail", {"on": bool(th.get("on", True))})
    st = w.get("storm") if isinstance(w.get("storm"), dict) else {}
    if "kmh3" not in st:
        st["kmh3"] = min(200, int(_num(st.get("kmh"), 30, 120, 60)) + 30)
        w["storm"] = st
    r["warn"] = w
    acts = r.get("acts") if isinstance(r.get("acts"), list) else []
    ids = {str(x.get("id")) for x in acts if isinstance(x, dict)}
    for x in list(acts):
        if isinstance(x, dict) and x.get("warn") == "thunder" and len(acts) < MAX_ACTS:
            nid = (str(x.get("id") or "a") + "h")[:20]
            if nid not in ids:
                acts.append({**x, "id": nid, "warn": "hail"})
                ids.add(nid)
    r["acts"] = acts
    wi = r.get("win") if isinstance(r.get("win"), dict) else None
    if wi and isinstance(wi.get("warn"), list) and "thunder" in wi["warn"] and "hail" not in wi["warn"]:
        wi["warn"].append("hail")
    r["v"] = SCHEMA
    return r, True


def json_copy(x: Any) -> Any:
    import json
    return json.loads(json.dumps(x, default=str))


def clean_cfg(raw: Any) -> dict[str, Any]:
    d = default_cfg()
    r = raw if isinstance(raw, dict) else {}
    w = r.get("warn") if isinstance(r.get("warn"), dict) else {}
    g = lambda k: w.get(k) if isinstance(w.get(k), dict) else {}  # noqa: E731
    for k in KEYS:
        if "on" in g(k):
            d["warn"][k]["on"] = bool(g(k)["on"])
    s = d["warn"]["storm"]
    s["kmh"] = int(round(_num(g("storm").get("kmh"), 30, 120, 60) / 5) * 5)
    s["kmh3"] = int(round(_num(g("storm").get("kmh3"), s["kmh"] + 10, 200, max(90, s["kmh"] + 30)) / 5) * 5)
    rn = d["warn"]["rain"]
    rn["mm"] = int(_num(g("rain").get("mm"), 2, 50, 10))
    rn["mm3"] = int(_num(g("rain").get("mm3"), rn["mm"] + 2, 100, max(25, rn["mm"] + 5)))
    fr = d["warn"]["frost"]
    fr["temp"] = int(_num(g("frost").get("temp"), -10, 5, 0))
    fr["ice"] = bool(g("frost").get("ice", True))
    fr["ice_temp"] = int(_num(g("frost").get("ice_temp"), -2, 3, 1))
    ht = d["warn"]["heat"]
    ht["temp"] = int(_num(g("heat").get("temp"), 20, 45, 30))
    ht["temp2"] = int(_num(g("heat").get("temp2"), ht["temp"] + 1, 50, max(35, ht["temp"] + 5)))
    d["wind"] = _ent(r.get("wind"), ("sensor",))
    d["rainrate"] = _ent(r.get("rainrate"), ("sensor",))
    a = r.get("ahead") if isinstance(r.get("ahead"), dict) else {}
    d["ahead"] = {"on": bool(a.get("on", True)), "hours": int(_num(a.get("hours"), 1, 12, 3))}
    o = r.get("official") if isinstance(r.get("official"), dict) else {}
    d["official"] = {"on": bool(o.get("on", True)), "ent": _ent(o.get("ent"), ("sensor", "binary_sensor")), "vorab": bool(o.get("vorab", True))}
    acts, seen = [], set()
    for x in r.get("acts") if isinstance(r.get("acts"), list) else []:
        if not isinstance(x, dict) or len(acts) >= MAX_ACTS:
            continue
        ent, aid = _ent(x.get("ent"), ("cover", "switch", "input_boolean", "light", "script", "scene")), str(x.get("id") or "")[:20]
        if not ent or x.get("warn") not in KEYS or not re.match(r"^[a-z0-9_]+$", aid) or aid in seen:
            continue
        seen.add(aid)
        do = x.get("do") if x.get("do") in do_options(ent) else do_options(ent)[0]
        guard = _ent(x.get("guard"), ("binary_sensor",)) if ent.startswith("cover.") and do == "close" else ""
        acts.append({"id": aid, "warn": x["warn"], "ent": ent, "do": do, "undo": bool(x.get("undo", True)) and do != "run",
                     "min": int(_num(x.get("min"), 1, 4, 1)), "when": x.get("when") if x.get("when") in WHEN else "always",
                     "delay": int(_num(x.get("delay"), 0, 60, 0)), "guard": guard})
    d["acts"] = acts
    wi = r.get("win") if isinstance(r.get("win"), dict) else {}
    d["win"] = {"on": bool(wi.get("on", False)), "warn": [k for k in KEYS if k in (wi.get("warn") if isinstance(wi.get("warn"), list) else d["win"]["warn"])], "repeat": bool(wi.get("repeat", True))}
    n = r.get("notify") if isinstance(r.get("notify"), dict) else {}
    to = []
    for s in n.get("to") if isinstance(n.get("to"), list) else []:
        s = _ent(s, ("notify",))
        if s and s not in to and len(to) < 10:
            to.append(s)
    d["notify"] = {"start": bool(n.get("start", True)), "end": bool(n.get("end", False)), "ahead": bool(n.get("ahead", True)), "to": to, "stale": bool(n.get("stale", True)), "buttons": bool(n.get("buttons", True)), "critical": bool(n.get("critical", False))}
    v = r.get("vor") if isinstance(r.get("vor"), dict) else {}
    dv = d["vor"]
    covers = []
    for c in v.get("heat_covers") if isinstance(v.get("heat_covers"), list) else []:
        c = _ent(c, ("cover",))
        if c and c not in covers and len(covers) < 12:
            covers.append(c)
    d["vor"] = {"on": bool(v.get("on", dv["on"])), "hours": int(_num(v.get("hours"), 3, 24, 12)),
                "akku": bool(v.get("akku", True)), "akku_ent": _ent(v.get("akku_ent"), ("script", "switch", "input_boolean", "button", "input_button", "scene")), "akku_auto": bool(v.get("akku_auto", False)),
                "car": bool(v.get("car", True)), "car_min": int(round(_num(v.get("car_min"), 10, 100, 50) / 5) * 5), "car_auto": bool(v.get("car_auto", False)),
                "heat": bool(v.get("heat", True)), "heat_covers": covers, "heat_auto": bool(v.get("heat_auto", False)), "frost": bool(v.get("frost", True))}
    d["tab_lv"] = int(_num(r.get("tab_lv"), 0, 4, 3))
    return d


def to_kmh(value: Any, unit: str | None) -> float | None:
    """Windgeschwindigkeit in km/h (Einheiten: km/h, m/s, mph, kn)."""
    try:
        v = float(str(value).replace(",", "."))
    except (TypeError, ValueError):
        return None
    if v != v or v < 0:
        return None
    return v * WIND_FACTOR.get((unit or "km/h").strip().lower(), 1.0)


def to_mmh(value: Any, unit: str | None) -> float | None:
    """Regenmenge in mm pro Stunde (mm/h, in/h)."""
    try:
        v = float(str(value).replace(",", "."))
    except (TypeError, ValueError):
        return None
    if v != v or v < 0:
        return None
    return v * RAIN_FACTOR.get((unit or "mm/h").strip().lower(), 1.0)


def _steps(v: float | None, limits: list[float], margin: float = 0.0) -> int:
    """Wie viele Grenzen erreicht v (mit Spielraum nach unten)?"""
    if v is None:
        return 0
    return sum(1 for x in limits if v >= x - margin)


def icy(cfg: dict[str, Any], m: dict[str, Any], hyst: bool = False) -> bool:
    """Glätte möglich: kalt (bis Glätte-Grenze) und nass (Niederschlag, nasser Zustand oder ≥ 90 % Feuchte)."""
    f = cfg["warn"]["frost"]
    t = m.get("temp")
    if not f.get("ice") or t is None or t > f["ice_temp"] + (1 if hyst else 0):
        return False
    rain, hum = m.get("rain"), m.get("hum")
    return m.get("cond") in WET_CONDS or (rain is not None and rain > 0.05) or (hum is not None and hum >= (88 if hyst else 90))


def level_of(cfg: dict[str, Any], k: str, m: dict[str, Any], hyst: bool = False) -> int:
    """Stufe 0–4 einer eigenen Warnung für einen Messwert oder eine Vorhersage-Stunde.

    m: {temp, wind (km/h), cond, rain (mm/h), hum (%)}. hyst=True: Spielraum, damit eine aktive Stufe nicht flattert.
    """
    w = cfg["warn"][k]
    if not w.get("on"):
        return 0
    cond = m.get("cond")
    if k == "storm":
        a, c = w["kmh"], w["kmh3"]
        return _steps(m.get("wind"), [a, (a + c) / 2, c, c + 30], 5 if hyst else 0)
    if k == "thunder":
        return 2 if cond in THUNDER_CONDS else 0
    if k == "hail":
        return 3 if cond == "hail" else 0
    if k == "rain":
        r = m.get("rain")
        if r is not None:
            lv = _steps(r, [w["mm"], (w["mm"] + w["mm3"]) / 2, w["mm3"]], 1 if hyst else 0)
            if lv:
                return lv
        return 1 if cond == "pouring" else 0
    if k == "frost":
        t = m.get("temp")
        cold = t is not None and t <= w["temp"] + (1 if hyst else 0)
        return 1 if cold or icy(cfg, m, hyst) else 0
    if k == "heat":
        return _steps(m.get("temp"), [w["temp"], w["temp2"]], 1 if hyst else 0)
    return 0


def hour_flags(cfg: dict[str, Any], temp: float | None, wind: float | None, cond: str | None, precip: float | None = None, hum: float | None = None) -> set[str]:
    """Welche Warnungen gelten für diesen Messwert oder diese Vorhersage-Stunde? (nur eingeschaltete)"""
    m = {"temp": temp, "wind": wind, "cond": cond, "rain": precip, "hum": hum}
    return {k for k in KEYS if level_of(cfg, k, m) > 0}


def art_of(text: str) -> str:
    t = (text or "").lower()
    for word, art in _ART:
        if word in t:
            return art
    return "other"


def _iso(v: Any) -> str:
    if v in (None, "", "unknown"):
        return ""
    if hasattr(v, "isoformat"):
        return v.isoformat()
    t = dt_util.parse_datetime(str(v))
    return t.isoformat() if t else ""


def _short(v: Any, n: int = 280) -> str:
    t = " ".join(str(v or "").split())
    return t if len(t) <= n else t[: n - 1].rstrip() + "…"


def official_list(state: Any, platform: str, vorab: bool = False) -> list[dict[str, Any]]:
    """Alle Warnungen einer Warn-Entität (DWD, NINA, MeteoAlarm) im einheitlichen Warnmodell.

    Eintrag: {art, quelle, stufe 1–4, von, bis, titel, text, hinweis, vorab, gebiet}
    """
    if state is None or str(state.state) in ("unknown", "unavailable", "", "off", "0"):
        return []
    a, st, src = dict(state.attributes or {}), str(state.state), SRC.get(platform, "Amtlich")
    out: list[dict[str, Any]] = []
    if platform == "dwd_weather_warnings":
        try:
            n = int(float(a.get("warning_count") or 0))
        except (TypeError, ValueError):
            n = 0
        i = 1
        while i <= max(n, 1) or f"warning_{i}_name" in a:
            if i > MAX_OFF:
                break
            name = a.get(f"warning_{i}_name")
            if not name:
                i += 1
                if i > max(n, 1):
                    break
                continue
            try:
                lv = int(float(a.get(f"warning_{i}_level") or 0))
            except (TypeError, ValueError):
                lv = 0
            if lv <= 0:
                try:
                    lv = int(float(st))
                except ValueError:
                    lv = 1
            out.append({
                "art": art_of(str(name)), "quelle": src, "stufe": max(1, min(lv, 4)), "von": _iso(a.get(f"warning_{i}_start")), "bis": _iso(a.get(f"warning_{i}_end")),
                "titel": str(name), "text": _short(a.get(f"warning_{i}_description") or a.get(f"warning_{i}_headline")), "hinweis": _short(a.get(f"warning_{i}_instruction"), 200),
                "vorab": vorab, "gebiet": str(a.get("region_name") or ""),
            })
            i += 1
        if not out:
            try:
                lv = int(float(st))
            except ValueError:
                lv = 0
            if lv > 0:
                out.append({"art": "other", "quelle": src, "stufe": min(lv, 4), "von": "", "bis": "", "titel": "Unwetter", "text": "", "hinweis": "", "vorab": vorab, "gebiet": str(a.get("region_name") or "")})
        return out
    if st != "on":
        try:
            lv = int(float(st))
        except ValueError:
            return []
        return [{"art": "other", "quelle": src, "stufe": min(lv, 4), "von": "", "bis": "", "titel": "Amtliche Warnung", "text": "", "hinweis": "", "vorab": vorab, "gebiet": ""}] if lv > 0 else []
    sev = {"minor": 1, "moderate": 2, "severe": 3, "extreme": 4}.get(str(a.get("severity") or "").lower(), 2)
    if platform == "meteoalarm":
        try:
            sev = max(1, min(4, int(str(a.get("awareness_level") or "").split(";")[0]) - 1))
        except ValueError:
            pass
        title = str(a.get("event") or a.get("headline") or "Warnung")
        von, bis = _iso(a.get("onset") or a.get("effective")), _iso(a.get("expires"))
    else:
        title = str(a.get("headline") or a.get("event") or "Warnung")
        von, bis = _iso(a.get("start") or a.get("sent")), _iso(a.get("expires"))
    sender = str(a.get("sender") or "")
    text = _short(a.get("description"))
    art = art_of(title + " " + text[:80])
    if platform == "nina" and art == "other" and "wetter" not in sender.lower():
        art = "civil"
    return [{"art": art, "quelle": src + (f" · {sender}" if sender and platform == "nina" and sender.lower() not in ("nina",) else ""), "stufe": sev, "von": von, "bis": bis,
             "titel": title, "text": text, "hinweis": _short(a.get("recommended_actions") or a.get("instruction"), 200), "vorab": vorab, "gebiet": str(a.get("affected_areas") or a.get("area") or "")[:120]}]


def merge_official(items: list[dict[str, Any]], now: Any) -> list[dict[str, Any]]:
    """Abgelaufene weg, doppelte (gleicher Titel, gleiches Ende) zusammenfassen, höchste Stufe zuerst; aktuelle vor Vorab."""
    seen: dict[tuple[str, str], dict[str, Any]] = {}
    for x in items:
        end = dt_util.parse_datetime(x["bis"]) if x.get("bis") else None
        if end is not None and end < now:
            continue
        beg = dt_util.parse_datetime(x["von"]) if x.get("von") else None
        if beg is not None and beg > now and not x["vorab"]:
            x = {**x, "kommt": True}
        key = (x["titel"].strip().lower(), (x.get("bis") or "")[:16])
        old = seen.get(key)
        if old is None or (old["vorab"] and not x["vorab"]) or (old["vorab"] == x["vorab"] and x["stufe"] > old["stufe"]):
            seen[key] = x
    return sorted(seen.values(), key=lambda x: (x["vorab"], bool(x.get("kommt")), -x["stufe"], x.get("von") or ""))[:MAX_OFF]


def official_best(items: list[dict[str, Any]]) -> dict[str, Any]:
    """Höchste aktuelle Warnung im alten Format {level, title, text} (Startseite, Tablet, ältere Ansichten)."""
    cur = [x for x in items if not x["vorab"] and not x.get("kommt")]
    if not cur:
        return {"level": 0, "title": "", "text": ""}
    b = max(cur, key=lambda x: x["stufe"])
    hm = ""
    if b.get("bis"):
        t = dt_util.parse_datetime(b["bis"])
        hm = f" · bis {dt_util.as_local(t).strftime('%H:%M')} Uhr" if t else ""
    return {"level": b["stufe"], "title": f"Amtliche Warnung: {b['titel']}", "text": b["quelle"] + hm}


def official_view(state: Any, platform: str) -> dict[str, Any]:
    """Kompatibel zu früher: höchste Warnung einer Entität."""
    return official_best(official_list(state, platform))


def is_vorab(entity_id: str, unique_id: str = "", translation_key: str | None = None) -> bool:
    if translation_key == "advance_warning_level" or str(unique_id).endswith("advance_warning_level"):
        return True
    return bool(re.search(r"advance|expected|vorab|vorwarn", entity_id))


def stale_info(state: Any, now_ts: float) -> dict[str, Any]:
    """Liefert die Wetter-Entität noch Werte? {on, why}"""
    if state is None:
        return {"on": True, "why": "nicht gefunden"}
    if str(state.state) in ("unavailable", "unknown"):
        return {"on": True, "why": "nicht verfügbar"}
    t = getattr(state, "last_reported", None) or getattr(state, "last_updated", None)
    try:
        age = now_ts - t.timestamp()
    except Exception:  # noqa: BLE001 - kein Zeitstempel: nicht melden
        return {"on": False, "why": ""}
    if age > STALE_S:
        return {"on": True, "why": f"seit {int(age // 60)} Minuten kein neuer Wert"}
    return {"on": False, "why": ""}


WHEN_TXT = {"away": "nur bei Abwesenheit", "home": "nur wenn jemand zu Hause ist", "day": "nur tagsüber", "night": "nur nachts"}


def when_ok(when: str, away: bool, day: bool) -> bool:
    return when == "always" or (when == "away" and away) or (when == "home" and not away) or (when == "day" and day) or (when == "night" and not day)


def act_check(x: dict[str, Any], lv: int, now_ts: float, first_ts: float, paused: bool, away: bool, day: bool, guard_open: bool) -> tuple[str, str]:
    """Darf eine Aktion jetzt laufen? -> (Zustand, Grund). Zustand: go | wait | pause | blocked."""
    if lv < x.get("min", 1):
        return "wait", f"ab Stufe {x['min']}"
    if paused:
        return "pause", "Aktionen ausgesetzt"
    left = first_ts + x.get("delay", 0) * 60 - now_ts
    if x.get("delay", 0) and left > 0:
        return "wait", f"in {max(1, int(round(left / 60)))} Min."
    if not when_ok(x.get("when", "always"), away, day):
        return "wait", WHEN_TXT.get(x.get("when", ""), "Bedingung nicht erfüllt")
    if guard_open:
        return "blocked", "nicht gefahren, Tür oder Fenster offen"
    return "go", ""


def notify_data(svc: str, buttons: bool, critical: bool, close: bool = True) -> dict[str, Any] | None:
    """Zusatz für die Home-Assistant-App: Knöpfe und kritische Mitteilung (nur notify.mobile_app_*)."""
    if not svc.startswith("notify.mobile_app_") or not (buttons or critical):
        return None
    d: dict[str, Any] = {}
    if buttons:
        d["actions"] = [{"action": ACT_PREFIX + "ACK", "title": "Verstanden"}] + ([{"action": ACT_PREFIX + "CLOSE", "title": "Alles schließen"}] if close else []) + [{"action": ACT_PREFIX + "PAUSE", "title": "Aktionen 2 Std. aussetzen"}]
    if critical:
        d["push"] = {"sound": {"name": "default", "critical": 1, "volume": 1.0}, "interruption-level": "critical"}
        d["ttl"], d["priority"], d["channel"] = 0, "high", "Unwetter"
    return d


def timeline(cfg: dict[str, Any], fc: list[dict[str, Any]], offl: list[dict[str, Any]], hours: int = FC_HOURS) -> dict[str, Any]:
    """48-Stunden-Zeitleiste: Stufe je Stunde für jede eigene Warnung und die amtlichen Warnungen als Bänder."""
    rows = fc[:hours]
    own = {}
    for k in KEYS:
        if cfg["warn"][k]["on"]:
            own[k] = [level_of(cfg, k, {"temp": h.get("temp"), "wind": h.get("wind"), "cond": h.get("cond"), "rain": h.get("p"), "hum": h.get("hum")}) for h in rows]
    off = [{"art": x["art"], "titel": x["titel"], "stufe": x["stufe"], "von": x.get("von") or "", "bis": x.get("bis") or "", "vorab": x["vorab"], "quelle": x["quelle"]} for x in offl]
    return {"t": [h["t"] for h in rows], "own": own, "off": off}


def plan_vorsorge(cfg: dict[str, Any], x: dict[str, Any]) -> list[dict[str, Any]]:
    """Unwetter-Vorsorge (C2, C3, C5, Frost). x: {sev, sev_at, hail, heat_now, heat_soon, heat_today, frost_soon, frost_at, day, evening, out_t, soc, car_soc, car_plugged, wallbox}.

    Liefert Empfehlungen {id, icon, title, text, btn, auto}; btn leer = nur Hinweis.
    """
    v, out = cfg["vor"], []
    if not v["on"]:
        return out
    when = lambda at: f"ab {at}" if at else "jetzt"  # noqa: E731
    sev = x.get("sev", 0)
    if v["akku"] and sev >= 3:
        soc = x.get("soc")
        if soc is None or soc < 95:
            out.append({"id": "akku", "icon": "battery", "title": "Hausakku voll halten", "text": f"Unwetter Stufe {sev} {when(x.get('sev_at'))}. Bei Stromausfall hilft ein voller Akku." + (f" Jetzt {soc:.0f} %." if soc is not None else ""),
                        "btn": "Akku vorbereiten" if v["akku_ent"] else "", "auto": v["akku_auto"] and bool(v["akku_ent"])})
    if v["car"] and sev >= 3 and x.get("wallbox"):
        cs = x.get("car_soc")
        if cs is not None and cs < v["car_min"]:
            plug = x.get("car_plugged")
            out.append({"id": "car", "icon": "car", "title": f"Auto auf {v['car_min']} % laden", "text": f"Unwetter {when(x.get('sev_at'))}. Das Auto hat {cs:.0f} %." + ("" if plug else " Zum Laden bitte anstecken."),
                        "btn": "Jetzt laden" if plug else "", "auto": v["car_auto"] and bool(plug)})
    if x.get("hail"):
        out.append({"id": "garage", "icon": "car", "title": "Auto unterstellen", "text": f"Hagel {when(x.get('hail_at'))}. Auto in die Garage oder unter den Carport, Gartenmöbel und Kissen rein.", "btn": "", "auto": False})
    if v["heat"] and (x.get("heat_now") or x.get("heat_soon")) and x.get("day"):
        out.append({"id": "heat_close", "icon": "sun", "title": "Hitze aussperren", "text": "Rollläden auf der Sonnenseite tagsüber schließen, Fenster zu lassen.",
                    "btn": "Rollläden schließen" if v["heat_covers"] else "", "auto": v["heat_auto"] and bool(v["heat_covers"])})
    if v["heat"] and x.get("heat_today") and x.get("evening") and x.get("out_t") is not None and x["out_t"] < 24:
        out.append({"id": "heat_air", "icon": "window", "title": "Jetzt lüften", "text": f"Draußen ist es mit {x['out_t']:.0f} °C kühler. Fenster auf, Rollläden hoch.",
                    "btn": "Rollläden öffnen" if v["heat_covers"] else "", "auto": False})
    if v["frost"] and x.get("frost_soon"):
        out.append({"id": "frost", "icon": "snow", "title": "Frost vorbereiten", "text": f"Frost {when(x.get('frost_at'))}. Außenwasserhahn und Gartenleitungen entleeren, Pflanzen schützen, Scheibe abdecken.", "btn": "", "auto": False})
    return out


def action_service(ent: str, do: str) -> tuple[str, str]:
    d = ent.split(".")[0]
    if d == "cover":
        return "cover", "close_cover" if do == "close" else "open_cover"
    if d in ("script", "scene"):
        return d, "turn_on"
    return d, "turn_on" if do == "on" else "turn_off"


def undo_of(do: str) -> str:
    return {"close": "open", "open": "close", "on": "off", "off": "on"}.get(do, "")


class WetterManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_wetter")
        self.cfg = default_cfg()
        self.st: dict[str, dict[str, Any]] = {k: self._blank() for k in KEYS}
        self.acts: dict[str, dict[str, Any]] = {}  # ausgelöste Aktionen: {id: {at, undo_at, undo}}
        self.win_sent: dict[str, float] = {}  # "Warnung:Raum" -> letzte Erinnerung
        self.ares: dict[str, dict[str, Any]] = {}  # Zustand je Aktion: wait | pause | blocked | err (mit Grund)
        self.first: dict[str, float] = {}  # seit wann eine Aktion laufen dürfte (für Verzögerung)
        self.pause_until = 0.0
        self.ack: dict[str, int] = {}  # quittierte Warnungen: Art -> Stufe
        self.ack_off: set[str] = set()
        self._unsub_ev: CALLBACK_TYPE | None = None
        self.vor: list[dict[str, Any]] = []
        self.vor_done: dict[str, str] = {}  # Empfehlung -> erledigt (Zeit)
        self._tab_key = ""
        self.log: list[dict[str, str]] = []
        self._off: dict[str, Any] = {"level": 0, "title": "", "text": ""}
        self._offl: list[dict[str, Any]] = []
        self._off_seen: set[str] = set()
        self._fc: list[dict[str, Any]] = []
        self._fc_ts = 0.0
        self._notes: dict[str, float] = {}
        self._stale: dict[str, Any] = {"on": False, "why": "", "since": ""}
        self._now: dict[str, Any] = {}
        self.migrated = False
        self._unsub: CALLBACK_TYPE | None = None

    @staticmethod
    def _blank() -> dict[str, Any]:
        return {"a": False, "lv": 0, "since": "", "v": None, "pend": 0, "clear": 0.0, "ahead": "", "ahead_lv": 0, "kind": ""}

    # ---- Start/Stop
    async def async_start(self) -> None:
        d = await self._store.async_load()
        if isinstance(d, dict):
            raw, changed = migrate(d.get("cfg"))
            if changed:
                self._store.snapshot_now()  # Stand vor der Übernahme bleibt unter „Sichern & Wiederherstellen“
                self.migrated = True
            self.cfg = clean_cfg(raw)
            for k, v in (d.get("st") if isinstance(d.get("st"), dict) else {}).items():
                if k in self.st and isinstance(v, dict):
                    a = bool(v.get("a"))
                    self.st[k].update({"a": a, "since": str(v.get("since") or ""), "lv": int(_num(v.get("lv"), 0, 4, 1 if a else 0)) if a else 0})
            for k, v in (d.get("acts") if isinstance(d.get("acts"), dict) else {}).items():
                if isinstance(v, dict):
                    self.acts[str(k)] = {"at": str(v.get("at") or ""), "undo_at": float(v.get("undo_at") or 0), "undo": str(v.get("undo") or ""), "ent": str(v.get("ent") or "")}
            ws = d.get("win_sent")
            self.win_sent = {str(k): float(v) for k, v in ws.items()} if isinstance(ws, dict) else {str(x): time.time() for x in ws or []}
            self.pause_until = float(_num(d.get("pause_until"), 0, 1e11, 0))
            self.ack = {str(k): int(_num(v, 0, 4, 1)) for k, v in (d.get("ack") or {}).items() if k in KEYS} if isinstance(d.get("ack"), dict) else {}
            self.ack_off = {str(x) for x in d.get("ack_off") or []}
            self.vor_done = {str(k): str(v) for k, v in (d.get("vor_done") or {}).items()} if isinstance(d.get("vor_done"), dict) else {}
            self._off_seen = {str(x) for x in d.get("off_seen") or []}
            self.log = [x for x in (d.get("log") or []) if isinstance(x, dict) and "t" in x and "x" in x][:MAX_LOG]
            if changed:
                self._add("Einstellungen für Modul 9 v0.6 übernommen: Hagel eigene Warnung, Stufen 1–4 (vorher gesichert).")
                self._save()
        self._unsub = async_track_time_interval(self.hass, self._tick, timedelta(seconds=TICK_SECONDS))
        try:
            self._unsub_ev = self.hass.bus.async_listen("mobile_app_notification_action", self._on_action)
        except Exception:  # noqa: BLE001 - ohne Ereignisbus (Tests) keine Knöpfe
            self._unsub_ev = None
        self.hass.async_create_task(self._tick(None))

    def async_stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None
        if self._unsub_ev:
            self._unsub_ev()
            self._unsub_ev = None

    def _save(self) -> None:
        self._store.async_delay_save(
            lambda: {
                "cfg": self.cfg, "st": {k: {"a": v["a"], "since": v["since"], "lv": v["lv"]} for k, v in self.st.items()},
                "acts": self.acts, "win_sent": self.win_sent, "off_seen": sorted(self._off_seen)[-40:], "log": self.log,
                "pause_until": self.pause_until, "ack": self.ack, "ack_off": sorted(self.ack_off)[-40:], "vor_done": self.vor_done,
            }, 10,
        )

    def persist(self) -> None:
        """Speichern ohne Übernahme ins Haus."""
        self._save()

    def _add(self, text: str, kind: str = "") -> None:
        self.log.insert(0, {"t": dt_util.now().isoformat(), "x": text, **({"k": kind} if kind else {})})
        cut = (dt_util.now() - timedelta(days=LOG_DAYS)).isoformat()
        self.log = [x for x in self.log[:MAX_LOG] if str(x.get("t", "")) >= cut[:10]]

    def _fire(self, typ: str, **data: Any) -> None:
        """E3: Ereignis für eigene Automationen (Beginn, Stufe, Ende, Quittung, amtlich)."""
        try:
            self.hass.bus.async_fire(EVENT_WX, {"typ": typ, **data})
        except Exception:  # noqa: BLE001 - ohne Ereignisbus (Tests)
            pass

    def level(self) -> int:
        """Höchste aktuelle Stufe aus eigenen und amtlichen Warnungen."""
        own = max([s["lv"] for s in self.st.values() if s["a"]] or [0])
        off = max([x["stufe"] for x in self._offl if not x["vorab"] and not x.get("kommt")] or [0])
        return max(own, off)

    def active(self) -> bool:
        wm = self.hass.data.get(DOMAIN, {}).get("wasser")
        return bool(wm is not None and wm.modules.get("on", {}).get("wx"))

    # ---- Messwerte
    def _layout(self) -> dict[str, Any]:
        return ((self.hass.data.get(DOMAIN, {}).get("layout") or {}).get("wx")) or {}

    def weather_entity(self) -> str:
        ent = self._layout().get("entity")
        if ent and self.hass.states.get(ent) is not None:
            return ent
        ids = sorted(s.entity_id for s in self.hass.states.async_all("weather"))
        return ids[0] if ids else ""

    def _read(self) -> dict[str, Any]:
        """Aktuelle Werte: Temperatur, Wind (km/h), Zustand, Regen (mm/h), Feuchte."""
        w = self.hass.states.get(self.weather_entity()) if self.weather_entity() else None
        a = (w.attributes if w is not None else {}) or {}
        temp = None
        out = self._layout().get("outdoor")
        st = self.hass.states.get(out) if out else None
        if st is not None:
            try:
                temp = float(str(st.state).replace(",", "."))
            except ValueError:
                temp = None
        if temp is None and a.get("temperature") is not None:
            try:
                temp = float(a["temperature"])
            except (TypeError, ValueError):
                temp = None
        wind = None
        ws = self.hass.states.get(self.cfg["wind"]) if self.cfg["wind"] else None
        if ws is not None:
            wind = to_kmh(ws.state, ws.attributes.get("unit_of_measurement"))
        if wind is None:
            unit = a.get("wind_speed_unit") or self.hass.config.units.wind_speed_unit
            wind = to_kmh(a.get("wind_speed"), unit)
            gust = to_kmh(a.get("wind_gust_speed"), unit)
            if gust is not None and (wind is None or gust > wind):
                wind = gust
        rain, rsrc = None, ""
        rs = self.hass.states.get(self.cfg["rainrate"]) if self.cfg["rainrate"] else None
        if rs is not None:
            rain, rsrc = to_mmh(rs.state, rs.attributes.get("unit_of_measurement")), "sensor"
        if rain is None:  # Rückfall: Niederschlag der laufenden Stunde aus der Vorhersage
            now = dt_util.utcnow()
            for h in self._fc[:2]:
                t = dt_util.parse_datetime(h["t"])
                if t is not None and t - timedelta(minutes=60) <= now <= t + timedelta(minutes=60) and isinstance(h.get("p"), (int, float)):
                    rain, rsrc = float(h["p"]), "forecast"
                    break
        try:
            hum = float(a["humidity"]) if a.get("humidity") is not None else None
        except (TypeError, ValueError):
            hum = None
        return {"temp": temp, "wind": wind, "cond": w.state if w is not None else None, "rain": rain, "rain_src": rsrc, "hum": hum,
                "unit": a.get("wind_speed_unit") or self.hass.config.units.wind_speed_unit}

    async def _forecast(self, force: bool = False) -> list[dict[str, Any]]:
        ent = self.weather_entity()
        if not ent:
            return []
        if not force and self._fc and time.time() - self._fc_ts < FC_TTL_S:
            return self._fc
        self._fc_ts = time.time()
        try:
            res = await self.hass.services.async_call("weather", "get_forecasts", {"type": "hourly"}, target={"entity_id": ent}, blocking=True, return_response=True)
            rows = ((res or {}).get(ent) or {}).get("forecast") or []
        except Exception as err:  # Dienst ohne Stundenvorhersage: nie stören
            _LOGGER.debug("Vorhersage: %s", err)
            rows = []
        unit = (self.hass.states.get(ent).attributes.get("wind_speed_unit") if self.hass.states.get(ent) else None) or self.hass.config.units.wind_speed_unit
        out, now = [], dt_util.utcnow()
        for r in rows:
            t = dt_util.parse_datetime(str(r.get("datetime") or ""))
            if t is None or t < now - timedelta(minutes=30):
                continue
            wind, gust = to_kmh(r.get("wind_speed"), unit), to_kmh(r.get("wind_gust_speed"), unit)
            if gust is not None and (wind is None or gust > wind):
                wind = gust
            try:
                temp = float(r["temperature"]) if r.get("temperature") is not None else None
            except (TypeError, ValueError):
                temp = None
            p = r.get("precipitation")
            hum = r.get("humidity")
            out.append({"t": t.isoformat(), "temp": temp, "wind": wind, "cond": r.get("condition"), "p": p if isinstance(p, (int, float)) else None, "hum": hum if isinstance(hum, (int, float)) else None})
            if len(out) >= FC_HOURS:
                break
        self._fc = out
        return out

    @staticmethod
    def _hm(h: dict[str, Any]) -> dict[str, Any]:
        return {"temp": h.get("temp"), "wind": h.get("wind"), "cond": h.get("cond"), "rain": h.get("p"), "hum": h.get("hum")}

    def _official_ents(self) -> list[tuple[str, str, bool]]:
        """Warn-Entitäten (entity_id, Plattform, Vorab). Eine gewählte Entität bringt die Geschwister ihres Eintrags mit (z. B. DWD-Vorabwarnstufe)."""
        o = self.cfg["official"]
        reg = er.async_get(self.hass)
        if o["ent"]:
            chosen = reg.async_get(o["ent"])
            if chosen is None:
                return [(o["ent"], "", is_vorab(o["ent"]))] if self.hass.states.get(o["ent"]) else []
            pool = [e for e in reg.entities.values() if e.config_entry_id and e.config_entry_id == chosen.config_entry_id and not e.disabled] or [chosen]
        else:
            pool = [e for e in reg.entities.values() if e.platform in OFFICIAL_PLATFORMS and not e.disabled]
        out = []
        for e in pool:
            if e.domain not in ("sensor", "binary_sensor"):
                continue
            v = is_vorab(e.entity_id, e.unique_id or "", getattr(e, "translation_key", None))
            if v and not o["vorab"]:
                continue
            out.append((e.entity_id, e.platform, v))
        return out

    def _official(self) -> list[dict[str, Any]]:
        if not self.cfg["official"]["on"]:
            return []
        items: list[dict[str, Any]] = []
        for eid, plat, v in self._official_ents():
            for x in official_list(self.hass.states.get(eid), plat, v):
                items.append({**x, "ent": eid})
        return merge_official(items, dt_util.utcnow())

    def open_windows(self) -> list[str]:
        from homeassistant.config_entries import ConfigEntryState
        out = []
        for e in self.hass.config_entries.async_entries(DOMAIN):
            c = getattr(e, "runtime_data", None)
            if e.state is ConfigEntryState.LOADED and c is not None and hasattr(c, "window_open"):
                try:
                    if c.window_open():
                        out.append(e.title)
                except Exception:  # Raum nicht bereit
                    continue
        return out

    # ---- Meldungen und Aktionen
    async def _notify(self, kind: str, title: str, msg: str, gap_key: str = "", lv: int = 0, buttons: bool = False) -> int:
        n = self.cfg["notify"]
        if kind and not n.get(kind):
            return 0
        if gap_key:
            if time.time() - self._notes.get(gap_key, 0) < NOTE_GAP_S:
                return 0
            self._notes[gap_key] = time.time()
        sent = 0
        for svc in n["to"]:
            name = svc.split(".", 1)[1]
            if not self.hass.services.has_service("notify", name):
                continue
            try:
                data = notify_data(svc, buttons and n["buttons"], n["critical"] and lv >= 3, any(x["ent"].startswith("cover.") for x in self.cfg["acts"]))
                await self.hass.services.async_call("notify", name, {"title": title, "message": msg, **({"data": data} if data else {})}, blocking=False)
                sent += 1
            except Exception as err:  # Dienst fehlerhaft: nie die Regelung stören
                _LOGGER.debug("Benachrichtigung %s: %s", svc, err)
        return sent

    async def async_test(self) -> dict[str, Any]:
        return {"sent": await self._notify("", "Wetter und Warnungen", "Testmeldung von Modul 9. Die Benachrichtigung funktioniert.")}

    async def _call(self, ent: str, do: str) -> bool:
        if self.hass.states.get(ent) is None:
            return False
        dom, svc = action_service(ent, do)
        try:
            await self.hass.services.async_call(dom, svc, {"entity_id": ent}, blocking=False)
            return True
        except Exception as err:
            _LOGGER.debug("Aktion %s %s: %s", ent, do, err)
            return False

    def _away(self) -> bool:
        pm = self.hass.data.get(DOMAIN, {}).get("presence")
        try:
            return pm is not None and pm.effective() in ("away", "vacation")
        except Exception:  # noqa: BLE001
            return False

    def _day(self) -> bool:
        sun = self.hass.states.get("sun.sun")
        if sun is not None:
            return sun.state == "above_horizon"
        return 7 <= dt_util.now().hour < 19

    def _guard_open(self, x: dict[str, Any]) -> bool:
        g = self.hass.states.get(x["guard"]) if x.get("guard") else None
        return g is not None and g.state == "on"

    def _fname(self, ent: str) -> str:
        st = self.hass.states.get(ent)
        return (st.attributes.get("friendly_name") if st else None) or ent

    async def _do(self, x: dict[str, Any], why: str) -> bool:
        ok = await self._call(x["ent"], x["do"])
        if ok:
            self.acts[x["id"]] = {"at": dt_util.now().isoformat(), "undo_at": 0.0, "undo": undo_of(x["do"]) if x["undo"] else "", "ent": x["ent"]}
            self.ares.pop(x["id"], None)
            self._add(f"{self._fname(x['ent'])}: {dict(close='geschlossen', open='geöffnet', on='eingeschaltet', off='ausgeschaltet', run='ausgeführt')[x['do']]} ({why}).", "act")
        elif self.ares.get(x["id"], {}).get("state") != "err":
            self.ares[x["id"]] = {"state": "err", "why": "Gerät nicht gefunden"}
            self._add(f"{self._fname(x['ent'])} nicht gefunden, Aktion übersprungen.", "act")
        return ok

    async def _process_acts(self, now_ts: float, only: str = "") -> None:
        """Aktions-Planer: Stufe, Aussetzen, Verzögerung, Bedingung und Aussperrschutz je Aktion prüfen; Reihenfolge = Liste."""
        away, day, paused = self._away(), self._day(), now_ts < self.pause_until
        for x in self.cfg["acts"]:
            k, aid = x["warn"], x["id"]
            if only and k != only:
                continue
            s = self.st[k]
            if not s["a"]:
                self.first.pop(aid, None)
                if self.ares.get(aid, {}).get("state") != "err":
                    self.ares.pop(aid, None)
                continue
            if aid in self.acts:
                continue  # in dieser Warnung schon erledigt
            first = self.first.setdefault(aid, now_ts)
            st, why = act_check(x, s["lv"], now_ts, first, paused, away, day, self._guard_open(x))
            if st == "go":
                await self._do(x, f"{NAMES[k]}, Stufe {s['lv']}")
                continue
            prev = self.ares.get(aid, {}).get("state")
            if st == "blocked" and prev != "blocked":
                gn = self._fname(x["guard"])
                self._add(f"{self._fname(x['ent'])} nicht gefahren: {gn} ist offen (Aussperrschutz).", "act")
                await self._notify("", f"{self._fname(x['ent'])} nicht geschlossen", f"{NAMES[k]}: {gn} ist offen. Der Rollladen fährt, sobald zu ist.", f"guard:{aid}", 0, False)
            if st == "pause" and prev != "pause":
                self._add(f"{self._fname(x['ent'])}: ausgesetzt ({NAMES[k]}).", "act")
            self.ares[aid] = {"state": st, "why": why}

    # ---- Bedienung: Quittieren, Aussetzen, Alles schließen
    async def async_ack(self, who: str = "") -> dict[str, Any]:
        self.ack = {k: s["lv"] for k, s in self.st.items() if s["a"]}
        self.ack_off = {self._offkey(x) for x in self._offl if not x["vorab"]}
        self._add("Warnungen quittiert" + (f" ({who})" if who else "") + ".", "ack")
        self._fire("quittiert", wer=who, stufe=self.level())
        self._save()
        return await self.snapshot()

    async def async_pause(self, minutes: int, who: str = "") -> dict[str, Any]:
        minutes = int(_num(minutes, 0, 24 * 60, 0))
        self.pause_until = time.time() + minutes * 60 if minutes else 0.0
        if minutes:
            self._add(f"Aktionen {minutes // 60 if minutes % 60 == 0 else minutes} {'Std.' if minutes % 60 == 0 else 'Min.'} ausgesetzt" + (f" ({who})" if who else "") + ".", "act")
        else:
            self._add("Aktionen laufen wieder" + (f" ({who})" if who else "") + ".", "act")
            await self._process_acts(time.time())
        self._save()
        return await self.snapshot()

    async def async_close_all(self, who: str = "") -> dict[str, Any]:
        n, blocked = 0, []
        for x in self.cfg["acts"]:
            if not x["ent"].startswith("cover.") or x["do"] != "close" or (x["id"] in self.acts and not self.acts[x["id"]].get("undo_at")):
                continue
            if self._guard_open(x):
                blocked.append(self._fname(x["ent"]))
                continue
            if await self._do(x, "Alles schließen" + (f", {who}" if who else "")):
                n += 1
        if blocked:
            self._add(f"Nicht geschlossen (Aussperrschutz): {', '.join(blocked)}.", "act")
        self._save()
        return {**(await self.snapshot()), "closed": n, "blocked": blocked}

    async def _on_action(self, event: Any) -> None:
        act = str((getattr(event, "data", None) or {}).get("action") or "")
        if not act.startswith(ACT_PREFIX):
            return
        cmd = act[len(ACT_PREFIX):]
        if cmd == "ACK":
            await self.async_ack("Handy")
        elif cmd == "CLOSE":
            await self.async_close_all("Handy")
        elif cmd == "PAUSE":
            await self.async_pause(120, "Handy")

    @staticmethod
    def _offkey(x: dict[str, Any]) -> str:
        return f"{x['quelle']}|{x['titel']}|{x['stufe']}|{(x.get('bis') or '')[:16]}|{int(x['vorab'])}"

    async def _undo_due(self, now_ts: float) -> None:
        busy = {x["ent"] for x in self.cfg["acts"] if self.st[x["warn"]]["a"]}
        for aid, a in list(self.acts.items()):
            if not any(x["id"] == aid for x in self.cfg["acts"]):
                del self.acts[aid]
                continue
            if a.get("undo_at") and now_ts >= a["undo_at"]:
                if a["ent"] not in busy and a.get("undo"):
                    await self._call(a["ent"], a["undo"])
                    st = self.hass.states.get(a["ent"])
                    self._add(f"{(st.attributes.get('friendly_name') if st else None) or a['ent']}: wieder zurückgesetzt.", "act")
                del self.acts[aid]

    async def _windows(self, key: str) -> None:
        w = self.cfg["win"]
        if not w["on"] or key not in w["warn"]:
            return
        now, acked = time.time(), key in self.ack
        names = []
        for n in self.open_windows():
            kk = f"{key}:{n}"
            t = self.win_sent.get(kk)
            if t is None or (w["repeat"] and not acked and now - t >= WIN_REPEAT_S):
                names.append(n)
                self.win_sent[kk] = now
        if not names:
            return
        txt = ", ".join(names)
        self._add(f"Fenster-Erinnerung ({NAMES[key]}): {txt}.", "win")
        await self._notify("", f"{NAMES[key]}: Fenster offen", f"Bei {NAMES[key]} ist noch offen: {txt}.", "", self.st[key]["lv"], True)

    # ---- Hauptschleife
    async def async_config_changed(self) -> None:
        for aid in [a for a in self.acts if not any(x["id"] == a for x in self.cfg["acts"])]:
            del self.acts[aid]
        self._fc_ts = 0.0
        await self._tick(None)

    def _val(self, k: str, r: dict[str, Any]) -> Any:
        return r["wind"] if k == "storm" else r["temp"] if k in ("frost", "heat") else r["rain"] if k == "rain" else None

    async def _check_stale(self, now_ts: float) -> None:
        ent = self.weather_entity()
        if not ent:
            self._stale = {"on": False, "why": "", "since": "", "ent": ""}
            return
        info = stale_info(self.hass.states.get(ent), now_ts)
        if info["on"] and not self._stale.get("on"):
            self._stale = {**info, "since": dt_util.now().isoformat(), "ent": ent}
            self._add(f"Wetterquelle {ent} {info['why']}. Warnungen aus eigenen Messwerten sind unsicher.", "src")
            if self.cfg["notify"]["stale"]:
                await self._notify("", "Wetterquelle prüfen", f"{ent} {info['why']}. Modul 9 kann eigene Warnungen gerade nicht sicher berechnen.", "stale")
        elif not info["on"] and self._stale.get("on"):
            self._add(f"Wetterquelle {ent} liefert wieder Werte.", "src")
            self._stale = {"on": False, "why": "", "since": "", "ent": ent}
        elif info["on"]:
            self._stale["why"] = info["why"]

    async def _tick(self, _now: Any) -> None:
        if not self.active():
            return
        now_ts = time.time()
        fc = await self._forecast() if self.cfg["ahead"]["on"] or not self.cfg["rainrate"] else self._fc
        r = self._read()
        self._now = r
        await self._check_stale(dt_util.utcnow().timestamp())
        for k in KEYS:
            s, on = self.st[k], self.cfg["warn"][k]["on"]
            s["v"] = self._val(k, r)
            if k == "frost":
                cold = r["temp"] is not None and r["temp"] <= self.cfg["warn"]["frost"]["temp"]
                s["kind"] = "frost" if cold else "ice" if icy(self.cfg, r, hyst=s["a"]) else (s["kind"] if s["a"] else "")
            if not on:
                if s["a"]:
                    s["a"], s["lv"] = False, 0
                    await self._end(k)
                s["pend"], s["ahead"], s["ahead_lv"] = 0, "", 0
                continue
            raw = level_of(self.cfg, k, r)
            if not s["a"]:
                s["pend"] = s["pend"] + 1 if raw else 0
                if s["pend"] >= (START_TICKS if k == "storm" else 1):
                    await self._start(k, r, raw)
            else:
                hold = level_of(self.cfg, k, r, hyst=True)
                if raw > s["lv"]:
                    s["pend"] = s["pend"] + 1
                    if s["pend"] >= (START_TICKS if k == "storm" else 1):
                        await self._raise(k, r, raw)
                elif hold >= s["lv"]:
                    s["clear"], s["pend"] = 0.0, 0
                    if k in self.cfg["win"]["warn"]:
                        await self._windows(k)
                elif not s["clear"]:
                    s["clear"], s["pend"] = now_ts, 0
                elif now_ts - s["clear"] >= CLEAR_AFTER_S:
                    s["clear"] = 0.0
                    if hold <= 0:
                        s["a"], s["lv"] = False, 0
                        await self._end(k)
                    else:
                        s["lv"] = hold
                        self._add(f"{NAMES[k]}: Stufe {hold}.")
            # Vorwarnung aus der Stundenvorhersage
            s["ahead"], s["ahead_lv"] = "", 0
            if not s["a"] and not s["pend"] and self.cfg["ahead"]["on"]:
                lim = dt_util.utcnow() + timedelta(hours=self.cfg["ahead"]["hours"])
                for h in fc:
                    if dt_util.parse_datetime(h["t"]) > lim:
                        break
                    lv = level_of(self.cfg, k, self._hm(h))
                    if lv:
                        s["ahead"], s["ahead_lv"] = h["t"], lv
                        break
                if s["ahead"]:
                    hm = dt_util.as_local(dt_util.parse_datetime(s["ahead"])).strftime("%H:%M")
                    if await self._notify("ahead", f"Vorwarnung: {NAMES[k]}", f"{NAMES[k]} (Stufe {s['ahead_lv']}) wird ab etwa {hm} Uhr erwartet.", f"ahead:{k}"):
                        self._add(f"Vorwarnung {NAMES[k]} ab {hm} Uhr.", "ahead")
        # amtliche Warnungen
        offl = self._official()
        keys = set()
        for x in offl:
            key = self._offkey(x)
            keys.add(key)
            if key in self._off_seen:
                continue
            bis = ""
            if x.get("bis"):
                t = dt_util.parse_datetime(x["bis"])
                bis = f" bis {dt_util.as_local(t).strftime('%H:%M')} Uhr" if t else ""
            if x["vorab"]:
                self._add(f"Vorabinformation {x['quelle']}: {x['titel']} (Stufe {x['stufe']}).", "off")
                await self._notify("ahead", "Vorabinformation Unwetter", f"{x['titel']} (Stufe {x['stufe']}){bis}. Quelle: {x['quelle']}.", "offv:" + x["titel"])
            else:
                self._add(f"Amtliche Warnung {x['quelle']}: {x['titel']} (Stufe {x['stufe']}){bis}.", "off")
                self._fire("amtlich", art=x["art"], name=x["titel"], stufe=x["stufe"], quelle=x["quelle"], von=x.get("von"), bis=x.get("bis"))
                await self._notify("start", f"Amtliche Warnung: {x['titel']}", f"Stufe {x['stufe']}{bis}. Quelle: {x['quelle']}." + (f" {x['hinweis']}" if x.get("hinweis") else ""), "off:" + x["titel"], x["stufe"], True)
        self._off_seen = keys
        self._offl = offl
        self._off = official_best(offl)
        self.ack_off &= keys
        await self._process_acts(now_ts)
        await self._undo_due(now_ts)
        if not any(s["a"] for s in self.st.values()):
            self.win_sent.clear()
        if self.pause_until and now_ts >= self.pause_until:
            self.pause_until = 0.0
            self._add("Aussetzen beendet, Aktionen laufen wieder.", "act")
        await self._vorsorge()
        await self._tablet_alarm()
        async_dispatcher_send(self.hass, SIGNAL_WX)
        self._save()

    def _valtxt(self, k: str, r: dict[str, Any]) -> str:
        if k == "storm" and r["wind"] is not None:
            return f" ({r['wind']:.0f} km/h)"
        if k in ("frost", "heat") and r["temp"] is not None:
            return f" ({r['temp']:.1f} °C{', Glätte möglich' if k == 'frost' and self.st['frost']['kind'] == 'ice' else ''})"
        if k == "rain" and r["rain"] is not None:
            return f" ({r['rain']:.1f} mm/h)"
        return ""

    async def _start(self, k: str, r: dict[str, Any], lv: int) -> None:
        s = self.st[k]
        s["a"], s["lv"], s["pend"], s["clear"], s["since"] = True, lv, 0, 0.0, dt_util.now().isoformat()
        val = self._valtxt(k, r)
        self._add(f"{NAMES[k]} gestartet, Stufe {lv}{val}.", "warn")
        self._fire("beginn", art=k, name=NAMES[k], stufe=lv, quelle="eigen", wert=self._val(k, r))
        for x in self.cfg["acts"]:  # neue Warnung: Aktionen dürfen wieder laufen, ein offenes Rückgängig entfällt
            if x["warn"] == k:
                self.acts.pop(x["id"], None)
                self.ares.pop(x["id"], None)
                self.first.pop(x["id"], None)
        self.ack.pop(k, None)
        await self._notify("start", f"Warnung: {NAMES[k]} (Stufe {lv})", f"{NAMES[k]}{val}.", "", lv, True)
        await self._process_acts(time.time(), k)
        await self._windows(k)

    async def _raise(self, k: str, r: dict[str, Any], lv: int) -> None:
        s = self.st[k]
        s["lv"], s["pend"], s["clear"] = lv, 0, 0.0
        val = self._valtxt(k, r)
        self._add(f"{NAMES[k]}: Stufe {lv}{val}.", "warn")
        self._fire("stufe", art=k, name=NAMES[k], stufe=lv, quelle="eigen", wert=self._val(k, r))
        if self.ack.get(k, 9) < lv:
            self.ack.pop(k, None)  # höhere Stufe: Quittung gilt nicht mehr
        await self._notify("start", f"{NAMES[k]}: jetzt Stufe {lv}", f"{NAMES[k]}{val}.", f"raise:{k}:{lv}", lv, True)
        await self._process_acts(time.time(), k)

    async def _end(self, k: str) -> None:
        self.st[k]["since"] = ""
        self._add(f"{NAMES[k]} beendet.", "warn")
        self._fire("ende", art=k, name=NAMES[k], stufe=0, quelle="eigen")
        await self._notify("end", f"Entwarnung: {NAMES[k]}", f"{NAMES[k]} ist vorbei.")
        for x in self.cfg["acts"]:
            a = self.acts.get(x["id"])
            if x["warn"] == k and a is not None:
                if a.get("undo"):
                    a["undo_at"] = time.time() + UNDO_AFTER_S
                else:
                    del self.acts[x["id"]]
        self.win_sent = {w: t for w, t in self.win_sent.items() if not w.startswith(k + ":")}
        self.ack.pop(k, None)
        for x in self.cfg["acts"]:
            if x["warn"] == k:
                self.first.pop(x["id"], None)
                if self.ares.get(x["id"], {}).get("state") != "err":
                    self.ares.pop(x["id"], None)

    # ---- Stufe 4 (v0.9): Unwetter-Vorsorge und Tablet-Alarm
    def _vor_inputs(self) -> dict[str, Any]:
        v, now = self.cfg["vor"], dt_util.utcnow()
        fc = [h for h in self._fc if dt_util.parse_datetime(h["t"]) <= now + timedelta(hours=v["hours"])]
        hm = lambda iso: dt_util.as_local(dt_util.parse_datetime(iso)).strftime("%H:%M") if iso else ""  # noqa: E731
        sev, sev_at, hail, hail_at = 0, "", False, ""
        for k in ("storm", "thunder", "hail", "rain"):
            s = self.st[k]
            if s["a"] and s["lv"] > sev:
                sev, sev_at = s["lv"], ""
            if s["a"] and k == "hail":
                hail = True
        for h in fc:
            for k in ("storm", "thunder", "hail", "rain"):
                lv = level_of(self.cfg, k, self._hm(h))
                if lv >= 3 and lv > sev:
                    sev, sev_at = lv, hm(h["t"])
                if lv and k == "hail" and not hail:
                    hail, hail_at = True, hm(h["t"])
        for x in self._offl:
            beg = dt_util.parse_datetime(x["von"]) if x.get("von") else None
            if beg is not None and beg > now + timedelta(hours=v["hours"]):
                continue
            if x["art"] in SEVERE_ARTS and x["stufe"] > sev:
                sev, sev_at = x["stufe"], (hm(x["von"]) if beg is not None and beg > now else "")
            if x["art"] == "hail" and not hail:
                hail, hail_at = True, (hm(x["von"]) if beg is not None and beg > now else "")
        heat_now = self.st["heat"]["a"]
        heat_soon = any(level_of(self.cfg, "heat", self._hm(h)) for h in fc)
        today = dt_util.now().date().isoformat()
        heat_today = heat_now or any(str(x.get("t", "")).startswith(today) and "Hitze" in x.get("x", "") for x in self.log[:60])
        frost_at = ""
        frost_soon = self.st["frost"]["a"]
        if not frost_soon:
            for h in fc:
                if level_of(self.cfg, "frost", self._hm(h)):
                    frost_soon, frost_at = True, hm(h["t"])
                    break
        haus = self.hass.data.get(DOMAIN, {}).get("haus")
        soc_ent = ((getattr(haus, "data", None) or {}).get("soc") or "") if haus is not None else ""
        st = self.hass.states.get(soc_ent) if soc_ent else None
        try:
            soc = float(st.state) if st is not None else None
        except (TypeError, ValueError):
            soc = None
        wb = self.hass.data.get(DOMAIN, {}).get("wallbox")
        car_soc, plugged = None, False
        if wb is not None:
            try:
                car_soc = wb._soc()
                plugged = (getattr(wb, "info", {}) or {}).get("car") in (2, 3, 4)
            except Exception:  # noqa: BLE001
                car_soc = None
        day = self._day()
        return {"sev": sev, "sev_at": sev_at, "hail": hail, "hail_at": hail_at, "heat_now": heat_now, "heat_soon": heat_soon, "heat_today": heat_today,
                "frost_soon": frost_soon, "frost_at": frost_at, "day": day, "evening": not day and dt_util.now().hour >= 17, "out_t": (self._now or {}).get("temp"),
                "soc": soc, "car_soc": car_soc, "car_plugged": plugged, "wallbox": wb is not None and bool(getattr(wb, "cfg", {}).get("enabled", True))}

    async def _vorsorge(self) -> None:
        try:
            self.vor = plan_vorsorge(self.cfg, self._vor_inputs())
        except Exception as err:  # noqa: BLE001 - Vorsorge darf die Warnungen nie stören
            _LOGGER.debug("Vorsorge: %s", err)
            self.vor = []
        ids = {x["id"] for x in self.vor}
        self.vor_done = {k: v for k, v in self.vor_done.items() if k in ids}
        for x in self.vor:
            if x["auto"] and x["id"] not in self.vor_done and time.time() >= self.pause_until:
                await self.async_vor(x["id"], "automatisch")

    async def async_vor(self, vid: str, who: str = "") -> dict[str, Any]:
        v, ok, txt = self.cfg["vor"], False, ""
        if vid == "akku" and v["akku_ent"]:
            dom = v["akku_ent"].split(".")[0]
            svc = "press" if dom in ("button", "input_button") else "turn_on"
            try:
                await self.hass.services.async_call(dom, svc, {"entity_id": v["akku_ent"]}, blocking=False)
                ok, txt = True, f"Akku vorbereitet ({self._fname(v['akku_ent'])})"
            except Exception as err:  # noqa: BLE001
                _LOGGER.debug("Vorsorge Akku: %s", err)
        elif vid == "car":
            wb = self.hass.data.get(DOMAIN, {}).get("wallbox")
            if wb is not None:
                try:
                    await wb.async_quick("goal")
                    ok, txt = True, "Auto lädt bis zum Ziel (Schnellstart)"
                except Exception as err:  # noqa: BLE001
                    _LOGGER.debug("Vorsorge Auto: %s", err)
        elif vid in ("heat_close", "heat_air") and v["heat_covers"]:
            for c in v["heat_covers"]:
                ok = await self._call(c, "close" if vid == "heat_close" else "open") or ok
            txt = "Rollläden für Hitzeschutz " + ("geschlossen" if vid == "heat_close" else "geöffnet")
        if ok:
            self.vor_done[vid] = dt_util.now().isoformat()
            self._add(f"Vorsorge: {txt}" + (f" ({who})" if who else "") + ".", "act")
            self._fire("vorsorge", id=vid, wer=who)
        self._save()
        return {**(await self.snapshot()), "ok": ok}

    async def _tablet_alarm(self) -> None:
        lim, lv = self.cfg["tab_lv"], self.level()
        acked = all(k in self.ack for k, s in self.st.items() if s["a"]) and all(self._offkey(x) in self.ack_off for x in self._offl if not x["vorab"] and not x.get("kommt"))
        key = f"{lv}|" + ",".join(sorted([k for k, s in self.st.items() if s["a"]] + [x["titel"] for x in self._offl if not x["vorab"] and not x.get("kommt")])) if lim and lv >= lim and not acked else ""
        if key and key != self._tab_key:
            tm = self.hass.data.get(DOMAIN, {}).get("tablet")
            if tm is not None and hasattr(tm, "async_wake_warn"):
                try:
                    if await tm.async_wake_warn():
                        self._add(f"Wandtablet geweckt (Stufe {lv}).", "msg")
                except Exception as err:  # noqa: BLE001
                    _LOGGER.debug("Tablet wecken: %s", err)
        self._tab_key = key

    # ---- Ansicht und Speichern
    async def async_set(self, raw: Any) -> dict[str, Any]:
        self.cfg = clean_cfg({**self.cfg, **raw} if isinstance(raw, dict) else raw)  # fehlende Felder (alter Browser) behalten ihren Stand
        self._save()
        haus = self.hass.data.get(DOMAIN, {}).get("haus")
        if haus is not None and isinstance(raw, dict) and ("wind" in raw or "official" in raw):  # Wetterquelle gehört dem Haus
            await haus.async_adopt("wetter", self.cfg)
        await self.async_config_changed()
        return await self.snapshot()

    def warnings(self) -> list[dict[str, Any]]:
        """Einheitliches Warnmodell: amtliche zuerst, dann eigene (aktiv), dann eigene Vorwarnungen."""
        out = [{k: v for k, v in x.items() if k != "ent"} for x in self._offl]
        for k in KEYS:
            s = self.st[k]
            if s["a"]:
                titel = "Glätte" if k == "frost" and s["kind"] == "ice" else NAMES[k]
                out.append({"art": k, "quelle": "eigen", "stufe": s["lv"], "von": s["since"] or "", "bis": "", "titel": titel, "text": self._valtxt(k, self._now or {"wind": None, "temp": None, "rain": None}).strip(" ()"), "hinweis": "", "vorab": False, "gebiet": ""})
        for k in KEYS:
            s = self.st[k]
            if not s["a"] and s["ahead"]:
                out.append({"art": k, "quelle": "eigen", "stufe": s["ahead_lv"], "von": s["ahead"], "bis": "", "titel": NAMES[k], "text": "aus der Stundenvorhersage", "hinweis": "", "vorab": True, "gebiet": ""})
        return out

    async def snapshot(self) -> dict[str, Any]:
        r, fc = self._read(), []
        if self.active():
            rows = await self._forecast()
            for h in rows[:12]:
                m = self._hm(h)
                lv = {k: level_of(self.cfg, k, m) for k in KEYS}
                fc.append({"t": h["t"], "temp": h["temp"], "wind": h["wind"], "cond": h["cond"], "p": h.get("p"), "w": sorted(k for k, v in lv.items() if v), "lv": max(lv.values())})
        warn = {}
        for k in KEYS:
            s = self.st[k]
            warn[k] = {"a": bool(s["a"]), "lv": s["lv"], "v": s["v"], "since": s["since"] or None, "ahead": s["ahead"] or None, "ahead_lv": s["ahead_lv"], **({"kind": s["kind"]} if k == "frost" else {})}
        acts = {aid: ({"state": "undo", "at": a["at"], "until": dt_util.utc_from_timestamp(a["undo_at"]).isoformat()} if a.get("undo_at") and hasattr(dt_util, "utc_from_timestamp") else {"state": "run", "at": a["at"]}) for aid, a in self.acts.items()}
        for aid, r in self.ares.items():
            if aid not in acts:
                acts[aid] = dict(r)
        actv = [k for k, s in self.st.items() if s["a"]]
        offcur = [self._offkey(x) for x in self._offl if not x["vorab"] and not x.get("kommt")]
        return {
            "cfg": self.cfg,
            "state": {"warn": warn, "official": self._off, "officials": [{k: v for k, v in x.items() if k != "ent"} for x in self._offl], "acts": acts, "now": r, "stale": self._stale,
                      "pause": dt_util.utc_from_timestamp(self.pause_until).isoformat() if self.pause_until > time.time() and hasattr(dt_util, "utc_from_timestamp") else None,
                      "acked": bool(actv or offcur) and all(k in self.ack for k in actv) and all(o in self.ack_off for o in offcur), "any": bool(actv or offcur)},
            "tl": timeline(self.cfg, self._fc, self._offl),
            "vor": [{**x, "done": self.vor_done.get(x["id"])} for x in self.vor], "level": self.level(),
            "warnings": self.warnings(), "fc": fc, "fc_n": len(self._fc), "open": self.open_windows(), "log": self.log[:200],
        }
