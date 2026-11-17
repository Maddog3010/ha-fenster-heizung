"""Modul 14: Tarif-Dienst – Strompreise heute und morgen als Zeitreihe für alle Module.

Quellen (Reihenfolge „auto“): Tibber direkt (Einstellungen → Integrationen) → Preis-Sensor (Tibber, Nord Pool, EPEX Spot,
aWATTar, Octopus, Energi Data Service … – die Formate der Attribute werden erkannt) → Festpreis aus den Haus-Werten.
Fällt eine Quelle aus, springt die nächste ein. Die Zeitreihe arbeitet mit echten Zeitpunkten (Viertelstunden oder
Stunden), deshalb stimmen auch 23- und 25-Stunden-Tage. Für reine Börsenpreise kann ein Endpreis gerechnet werden
(Aufschläge + MwSt.), optional mit zeitvariablem Netzentgelt. Die Preise jedes Tages werden 400 Tage gemerkt
(Grundlage für den Tarif-Check in v1.0). Oberfläche: WebSocket tarif_get / tarif_set / tarif_sub (Push).

v0.8: bestes Startfenster je Gerät aus Modul 4 (gelernte Laufzeit und Leistungskurve, Preis × Verbrauch, eigener
Solarstrom aus der Prognose zum Einspeisepreis gerechnet) mit Erinnerung, Preisalarm (unter/über einer Grenze, negativ,
Preise für morgen da – je Zeitraum höchstens einmal, mit Ruhezeit) und das Ereignis fenster_heizung_tarif.
"""
from __future__ import annotations

import json
import logging
from datetime import date, datetime, timedelta
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_point_in_utc_time, async_track_state_change_event, async_track_time_interval
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

SIGNAL_TARIF = f"{DOMAIN}_tarif_update"
TICK_S = 60
HIST_DAYS = 400
SRC_NAMES = {"tibber": "Tibber", "sensor": "Preis-Sensor", "fix": "Festpreis"}
START_KEYS = ("start", "start_time", "startsAt", "starts_at", "from", "valid_from", "time", "begin", "datetime")
END_KEYS = ("end", "end_time", "endsAt", "ends_at", "till", "to", "valid_to")
VAL_KEYS = ("value", "price", "total", "price_ct_per_kwh", "price_per_kwh", "value_inc_vat", "marketprice", "price_eur_per_kwh", "price_ct")
LIST_KEYS = ("raw_today", "raw_tomorrow", "data", "prices", "rates", "forecast", "prices_today", "prices_tomorrow", "today", "tomorrow", "today_prices", "tomorrow_prices")
EVENT_TARIF = "fenster_heizung_tarif"
SHIFT_TYPES = ("", "wasch", "trockner", "spuel", "pool", "ebike", "sauger", "sonst")  # Geräte, die man verschieben kann
SOLAR_SHARE = 0.5  # vorsichtig: die Hälfte der erwarteten Solarerzeugung steht dem Gerät zur Verfügung
SLOT_S = 900
ALOG_MAX = 60
BOERSE_HINT = ("nordpool", "nord_pool", "epex", "awattar", "energi_data", "entsoe", "spot", "boerse", "börse")


def default_cfg() -> dict[str, Any]:
    return {"src": "auto", "sensor": "", "boerse": "auto", "add": 18.6, "vat": 19.0, "down": 3.0, "up": 4.0, "res": "q", "win_h": 3,
            "nne": {"on": False, "ht_from": 17, "ht_to": 20, "ht_ct": 6.1, "nt_from": 0, "nt_to": 6, "nt_ct": -4.2},
            "devs": {}, "sun": True,
            "alarm": {"to": [], "below": {"on": False, "ct": 20.0}, "above": {"on": False, "ct": 40.0}, "neg": {"on": True}, "tomorrow": {"on": False},
                      "lead": 0, "quiet": {"on": True, "from": 22, "to": 7}}}


def _f(v: Any, lo: float, hi: float, d: float) -> float:
    try:
        x = float(v)
    except (TypeError, ValueError):
        return d
    return d if x != x else min(hi, max(lo, x))


def clean_cfg(raw: Any) -> dict[str, Any]:
    d, r = default_cfg(), raw if isinstance(raw, dict) else {}
    d["src"] = r.get("src") if r.get("src") in ("auto", "tibber", "sensor", "fix") else "auto"
    s = r.get("sensor")
    d["sensor"] = s if isinstance(s, str) and s.startswith("sensor.") and len(s) < 200 else ""
    d["boerse"] = r.get("boerse") if r.get("boerse") in ("auto", "on", "off") else "auto"
    d["add"] = round(_f(r.get("add"), 0, 60, 18.6), 2)
    d["vat"] = round(_f(r.get("vat"), 0, 30, 19.0), 1)
    d["down"] = round(_f(r.get("down"), 0.5, 20, 3.0), 1)
    d["up"] = round(_f(r.get("up"), 0.5, 20, 4.0), 1)
    d["res"] = r.get("res") if r.get("res") in ("q", "h") else "q"
    d["win_h"] = int(_f(r.get("win_h"), 1, 8, 3))
    n = r.get("nne") if isinstance(r.get("nne"), dict) else {}
    dn = d["nne"]
    d["nne"] = {"on": bool(n.get("on", False)),
                "ht_from": int(_f(n.get("ht_from"), 0, 23, dn["ht_from"])), "ht_to": int(_f(n.get("ht_to"), 1, 24, dn["ht_to"])), "ht_ct": round(_f(n.get("ht_ct"), -30, 30, dn["ht_ct"]), 2),
                "nt_from": int(_f(n.get("nt_from"), 0, 23, dn["nt_from"])), "nt_to": int(_f(n.get("nt_to"), 1, 24, dn["nt_to"])), "nt_ct": round(_f(n.get("nt_ct"), -30, 30, dn["nt_ct"]), 2)}
    devs = r.get("devs") if isinstance(r.get("devs"), dict) else {}
    d["devs"] = {}
    for k, v in list(devs.items())[:40]:
        if isinstance(k, str) and 0 < len(k) <= 40 and isinstance(v, dict):
            d["devs"][k] = {"on": bool(v.get("on", True)), "by": int(_f(v.get("by"), 0, 24, 0)) if v.get("by") not in (None, "", 0) else None,
                            "from": int(_f(v.get("from"), 0, 23, 0)) if v.get("from") not in (None, "") else None}
    d["sun"] = r.get("sun") is not False
    a = r.get("alarm") if isinstance(r.get("alarm"), dict) else {}
    da = d["alarm"]
    to = [x for x in (a.get("to") or []) if isinstance(x, str) and x.startswith("notify.") and len(x) < 120] if isinstance(a.get("to"), list) else []
    sub = lambda k: a.get(k) if isinstance(a.get(k), dict) else {}  # noqa: E731
    q = sub("quiet")
    d["alarm"] = {"to": list(dict.fromkeys(to))[:8],
                  "below": {"on": bool(sub("below").get("on", False)), "ct": round(_f(sub("below").get("ct"), -20, 100, da["below"]["ct"]), 1)},
                  "above": {"on": bool(sub("above").get("on", False)), "ct": round(_f(sub("above").get("ct"), 0, 150, da["above"]["ct"]), 1)},
                  "neg": {"on": bool(sub("neg").get("on", True))}, "tomorrow": {"on": bool(sub("tomorrow").get("on", False))},
                  "lead": int(_f(a.get("lead"), 0, 120, 0)) // 15 * 15,
                  "quiet": {"on": bool(q.get("on", True)), "from": int(_f(q.get("from"), 0, 23, 22)), "to": int(_f(q.get("to"), 0, 23, 7))}}
    return d


# ---------------------------------------------------------------- Formate der Preis-Sensoren
def _ts(v: Any) -> datetime | None:
    if isinstance(v, datetime):
        return v if v.tzinfo else v.replace(tzinfo=dt_util.DEFAULT_TIME_ZONE)
    if v in (None, ""):
        return None
    t = dt_util.parse_datetime(str(v))
    if t is None:
        return None
    return t if t.tzinfo else t.replace(tzinfo=dt_util.DEFAULT_TIME_ZONE)


def _factor(vals: list[float], unit: str) -> float:
    """Einheit nach ct/kWh: €/kWh ×100, €/MWh ÷10; ohne Einheit an der Größe erkennen."""
    u = (unit or "").lower().replace(" ", "")
    if "mwh" in u:
        return 0.1
    if "ct" in u or "cent" in u or "¢" in u:
        return 1.0
    if "eur" in u or "€" in u or "dkk" in u or "sek" in u or "nok" in u:
        return 100.0
    big = max((abs(v) for v in vals), default=0)
    return 100.0 if big < 5 else 0.1 if big > 150 else 1.0


def parse_series(attrs: dict[str, Any], unit: str, now: datetime) -> list[tuple[datetime, float]]:
    """Alle bekannten Formate → [(Start, Wert in Quellen-Einheit)], sortiert, ohne Doppelte."""
    out: dict[float, tuple[datetime, float]] = {}
    today = now.astimezone(dt_util.DEFAULT_TIME_ZONE).date()
    for key in LIST_KEYS:
        raw = attrs.get(key)
        if not isinstance(raw, list) or not raw:
            continue
        if all(isinstance(x, dict) for x in raw):
            for x in raw:
                st = next((_ts(x[k]) for k in START_KEYS if k in x and _ts(x[k]) is not None), None)
                v = next((x[k] for k in VAL_KEYS if x.get(k) is not None), None)
                try:
                    v = float(v)
                except (TypeError, ValueError):
                    continue
                if st is not None:
                    out[st.timestamp()] = (st, v)
        elif all(isinstance(x, (int, float)) and not isinstance(x, bool) for x in raw):
            day = today + timedelta(days=1) if "tomorrow" in key else today
            if key in ("data", "prices", "rates", "forecast"):
                continue  # Zahlenliste ohne Datum nur bei „heute/morgen“-Schlüsseln
            start = datetime(day.year, day.month, day.day, tzinfo=dt_util.DEFAULT_TIME_ZONE)
            nxt = start + timedelta(days=1)
            secs = (nxt.timestamp() - start.timestamp())  # 23, 24 oder 25 Stunden
            step = secs / len(raw)
            if abs(step - 900) > 1 and abs(step - 3600) > 1:
                step = 900 if len(raw) > 30 else 3600
            for i, v in enumerate(raw):
                st = datetime.fromtimestamp(start.timestamp() + i * step, tz=dt_util.DEFAULT_TIME_ZONE)
                out[st.timestamp()] = (st, float(v))
    rows = [out[k] for k in sorted(out)]
    return rows


def to_series(rows: list[tuple[datetime, float]], factor: float) -> list[dict[str, Any]]:
    """[(Start, Wert)] → [{s, d, ct}] mit Dauer aus dem Abstand (Ende des letzten Eintrags: gleiche Länge)."""
    out = []
    for i, (st, v) in enumerate(rows):
        nxt = rows[i + 1][0].timestamp() if i + 1 < len(rows) else None
        d = (nxt - st.timestamp()) if nxt else (out[-1]["d"] if out else 3600)
        if d <= 0 or d > 3600 * 2:
            d = out[-1]["d"] if out else 3600
        out.append({"s": int(st.timestamp()), "d": int(d), "ct": round(v * factor, 4)})
    return out


def end_price(ct: float, cfg: dict[str, Any]) -> float:
    """Börsenpreis (netto) → Endpreis: (Börse + Aufschläge) × (1 + MwSt)."""
    return round((ct + cfg["add"]) * (1 + cfg["vat"] / 100), 4)


def nne_add(ts: float, cfg: dict[str, Any]) -> float:
    n = cfg["nne"]
    if not n["on"]:
        return 0.0
    h = datetime.fromtimestamp(ts, tz=dt_util.DEFAULT_TIME_ZONE).hour
    inside = lambda a, b: (a <= h < b) if a < b else (h >= a or h < b)  # noqa: E731
    if inside(n["ht_from"], n["ht_to"]):
        return n["ht_ct"]
    if inside(n["nt_from"], n["nt_to"]):
        return n["nt_ct"]
    return 0.0


def hourly(series: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Viertelstunden → Stunden (Mittel), für den Umschalter und Quellen mit Stunden."""
    by: dict[int, list[float]] = {}
    for x in series:
        by.setdefault(x["s"] // 3600 * 3600, []).append(x["ct"])
    return [{"s": k, "d": 3600, "ct": round(sum(v) / len(v), 4)} for k, v in sorted(by.items())]


def day_of(ts: int) -> date:
    return datetime.fromtimestamp(ts, tz=dt_util.DEFAULT_TIME_ZONE).date()


def day_stats(series: list[dict[str, Any]], d: date) -> dict[str, Any] | None:
    xs = [x for x in series if day_of(x["s"]) == d]
    if not xs:
        return None
    w = sum(x["d"] for x in xs)
    avg = sum(x["ct"] * x["d"] for x in xs) / w
    lo, hi = min(xs, key=lambda x: x["ct"]), max(xs, key=lambda x: x["ct"])
    return {"avg": round(avg, 2), "min": lo["ct"], "min_s": lo["s"], "max": hi["ct"], "max_s": hi["s"], "n": len(xs), "hours": round(w / 3600, 2),
            "neg": sum(1 for x in xs if x["ct"] < 0)}


def level(ct: float | None, avg: float | None, cfg: dict[str, Any]) -> str:
    if ct is None or avg is None:
        return ""
    if ct < 0:
        return "neg"
    if ct <= avg - cfg["down"]:
        return "cheap"
    if ct >= avg + cfg["up"]:
        return "dear"
    return "normal"


def best_window(series: list[dict[str, Any]], start: float, hours: float, end: float | None = None) -> dict[str, Any] | None:
    """Günstigstes zusammenhängendes Fenster von `hours` Stunden, das nicht vor `start` beginnt (gewichtet nach Dauer)."""
    xs = [x for x in series if x["s"] + x["d"] > start and (end is None or x["s"] < end)]
    need = hours * 3600
    best = None
    for i in range(len(xs)):
        s0 = max(xs[i]["s"], start)
        acc, w, j = 0.0, 0.0, i
        while j < len(xs) and w < need - 1:
            seg = xs[j]
            a = max(seg["s"], s0)
            b = min(seg["s"] + seg["d"], s0 + need)
            if j > i and seg["s"] != xs[j - 1]["s"] + xs[j - 1]["d"]:
                break  # Lücke in den Daten
            if b > a:
                acc += seg["ct"] * (b - a)
                w += b - a
            j += 1
        if w >= need - 1:
            avg = acc / w
            if best is None or avg < best["avg"] - 1e-9:
                best = {"s": int(s0), "e": int(s0 + need), "avg": round(avg, 2)}
    return best


def cheapest_slots(series: list[dict[str, Any]], start: float, n: int = 3, hours: float = 1.0) -> list[dict[str, Any]]:
    """Die n günstigsten Fenster ab jetzt, die sich nicht überschneiden."""
    out: list[dict[str, Any]] = []
    cands = []
    xs = [x for x in hourly(series) if x["s"] + 3600 > start] if hours >= 1 else series
    for x in xs:
        w = best_window(series, max(x["s"], start), hours, x["s"] + 3600 * hours + 1)
        if w and w["s"] >= start - 1:
            cands.append(w)
    for c in sorted(cands, key=lambda c: c["avg"]):
        if all(c["e"] <= o["s"] or c["s"] >= o["e"] for o in out):
            out.append(c)
        if len(out) >= n:
            break
    return sorted(out, key=lambda c: c["s"])


def periods(series: list[dict[str, Any]], test: Any) -> list[dict[str, Any]]:
    """Zusammenhängende Zeiträume, in denen test(ct) gilt: [{s, e, min, max}]."""
    out: list[dict[str, Any]] = []
    for x in series:
        if not test(x["ct"]):
            continue
        if out and out[-1]["e"] == x["s"]:
            o = out[-1]
            o["e"] = x["s"] + x["d"]
            o["min"], o["max"] = min(o["min"], x["ct"]), max(o["max"], x["ct"])
        else:
            out.append({"s": x["s"], "e": x["s"] + x["d"], "min": x["ct"], "max": x["ct"]})
    return out


def in_hours(h: int, a: int, b: int) -> bool:
    return (a <= h < b) if a < b else (h >= a or h < b) if a != b else False


def profile(cv: list[list[float]] | None, dur: float, kwh: float) -> list[tuple[float, float, float]]:
    """Verbrauchsprofil [(Versatz s, Länge s, kW)] aus der letzten Kurve (Modul 4) oder gleichmäßig verteilt."""
    pts = [p for p in (cv or []) if isinstance(p, (list, tuple)) and len(p) >= 4]
    if len(pts) >= 4 and dur > 0:
        segs = []
        for i, p in enumerate(pts):
            nxt = pts[i + 1][0] if i + 1 < len(pts) else dur
            ln = max(0.0, min(dur, nxt) - p[0])
            if ln > 0:
                segs.append((float(p[0]), ln, max(0.0, (p[1] + p[2] + p[3]) / 1000)))
        e = sum(ln * kw for _, ln, kw in segs) / 3600
        if e > 0.001:
            k = kwh / e if kwh > 0 else 1.0  # auf die typische Energie je Lauf eichen
            return [(o, ln, kw * k) for o, ln, kw in segs]
    n = max(1, int(round(dur / SLOT_S)))
    ln = dur / n
    kw = kwh / (dur / 3600) if dur > 0 else 0.0
    return [(i * ln, ln, kw) for i in range(n)]


def run_cost(prof: list[tuple[float, float, float]], t0: float, price_at: Any, solar_w: Any, feed: float) -> tuple[float, float] | None:
    """Kosten in ct und Solar-kWh für einen Start um t0. Eigener Solarstrom kostet den entgangenen Einspeisepreis."""
    ct_sum, sun = 0.0, 0.0
    for o, ln, kw in prof:
        t = t0 + o + ln / 2
        p = price_at(t)
        if p is None:
            return None
        e = kw * ln / 3600
        f = min(1.0, solar_w(t) / (kw * 1000)) if kw > 0 else 0.0
        ct_sum += e * ((1 - f) * p + f * feed)
        sun += e * f
    return ct_sum, sun


def best_dev(prof: list[tuple[float, float, float]], now: float, end: float, price_at: Any, solar_w: Any, feed: float,
             earliest_h: int | None = None, by_h: int | None = None) -> dict[str, Any] | None:
    """Günstigster Start ab jetzt (Raster 15 Min.), optional frühestens ab Stunde X und fertig bis Stunde Y."""
    dur = max((o + ln for o, ln, _ in prof), default=0.0)
    kwh = sum(ln * kw for _, ln, kw in prof) / 3600
    if dur <= 0 or kwh <= 0:
        return None
    tz = dt_util.DEFAULT_TIME_ZONE
    deadline = end
    if by_h is not None:
        d = datetime.fromtimestamp(now, tz=tz)
        dl = d.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(hours=by_h)
        if dl.timestamp() < now + dur:
            dl += timedelta(days=1)
        deadline = min(end, dl.timestamp())
    cands = []
    t_grid = (int(now) // SLOT_S + 1) * SLOT_S
    starts = [now] + [t_grid + i * SLOT_S for i in range(0, 48 * 4)]
    nowc = run_cost(prof, now, price_at, solar_w, feed)
    for t in starts:
        if t + dur > deadline + 1:
            break
        if earliest_h and datetime.fromtimestamp(t, tz=tz).hour < earliest_h:
            continue  # „frühestens ab X Uhr“ gilt jeden Tag (z. B. nachts keine laute Waschmaschine)
        c = run_cost(prof, t, price_at, solar_w, feed)
        if c is not None:
            cands.append((c[0], t, c[1]))
    if not cands:
        return None
    ct, t, sun = min(cands, key=lambda c: (round(c[0], 3), c[1]))
    out = {"s": int(t), "e": int(t + dur), "avg": round(ct / kwh, 2), "kwh": round(kwh, 3), "sun": round(min(100, sun / kwh * 100)), "now": t - now < 60}
    if nowc is not None:
        out["now_avg"] = round(nowc[0] / kwh, 2)
        out["save"] = round(max(0.0, nowc[0] - ct) / 100, 2)
    return out


# ---------------------------------------------------------------- Dienst
class TarifManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_tarif")
        self.cfg = default_cfg()
        self.series: list[dict[str, Any]] = []
        self.src = ""
        self.src_name = ""
        self.boerse = False
        self.note = ""
        self.hist: dict[str, list[Any]] = {}
        self._unsub: CALLBACK_TYPE | None = None
        self._unsub_st: CALLBACK_TYPE | None = None
        self._last = ""
        self._last_js = ""
        self._busy = False
        self.sent: dict[str, float] = {}  # Preisalarm: schon gemeldete Zeiträume
        self.alog: list[dict[str, Any]] = []
        self.rem: dict[str, float] = {}  # Erinnerung je Gerät (Startzeit)
        self._rem_unsub: dict[str, CALLBACK_TYPE] = {}
        self.devs: list[dict[str, Any]] = []

    # ---- Start/Stop/Speichern
    async def async_start(self) -> None:
        d = await self._store.async_load()
        if isinstance(d, dict):
            self.cfg = clean_cfg(d.get("cfg"))
            h = d.get("hist")
            self.hist = {str(k): v for k, v in h.items() if isinstance(v, list)} if isinstance(h, dict) else {}
            self.sent = {str(k): float(v) for k, v in (d.get("sent") or {}).items() if isinstance(v, (int, float))} if isinstance(d.get("sent"), dict) else {}
            self.alog = [x for x in (d.get("alog") or []) if isinstance(x, dict)][-ALOG_MAX:]
            for k, v in (d.get("rem") or {}).items() if isinstance(d.get("rem"), dict) else []:
                if isinstance(v, (int, float)) and v > dt_util.now().timestamp() + 30:
                    self._schedule(str(k), float(v))
        self._unsub = async_track_time_interval(self.hass, self._tick, timedelta(seconds=TICK_S))
        self._listen()
        self.hass.async_create_task(self._tick(None))

    def async_stop(self) -> None:
        for u in (self._unsub, self._unsub_st, *self._rem_unsub.values()):
            if u:
                u()
        self._unsub = self._unsub_st = None
        self._rem_unsub = {}

    def _save(self) -> None:
        data = {"cfg": self.cfg, "hist": self.hist, "sent": self.sent, "alog": self.alog, "rem": self.rem}
        try:
            js = json.dumps(data, sort_keys=True)
        except (TypeError, ValueError):
            js = ""
        if js and js == self._last_js:
            return
        self._last_js = js
        self._store.async_delay_save(lambda: data, 30)

    def active(self) -> bool:
        wm = self.hass.data.get(DOMAIN, {}).get("wasser")
        return bool(wm is not None and wm.modules.get("on", {}).get("dt"))

    # ---- Quellen
    def price_sensor(self) -> str:
        if self.cfg["sensor"]:
            return self.cfg["sensor"]
        haus = self.hass.data.get(DOMAIN, {}).get("haus")
        hp = ((getattr(haus, "data", None) or {}).get("price") or {})
        if hp.get("price_mode") == "entity" and hp.get("price_sensor"):
            return hp["price_sensor"]
        gen = self.hass.data.get(DOMAIN, {}).get("general")
        pv = ((getattr(gen, "data", None) or {}).get("pv") or {})
        return str(pv.get("price_sensor") or "")

    def _listen(self) -> None:
        if self._unsub_st:
            self._unsub_st()
            self._unsub_st = None
        ent = self.price_sensor()
        if ent:
            try:
                self._unsub_st = async_track_state_change_event(self.hass, [ent], self._on_state)
            except Exception as err:  # noqa: BLE001
                _LOGGER.debug("Tarif: Beobachten nicht möglich: %s", err)

    async def _on_state(self, _ev: Any) -> None:
        await self._tick(None)

    def found(self) -> list[dict[str, Any]]:
        """Für die Einstellungen: welche Quellen es gibt (Tibber, Preis-Sensoren mit Zeitreihe)."""
        out = []
        tb = self.hass.data.get(DOMAIN, {}).get("tibber")
        if tb is not None and getattr(tb, "connected", False):
            out.append({"id": "tibber", "name": "Tibber (direkt verbunden)", "res": "15 Min." if getattr(tb, "res", "h") == "q" else "Stunden"})
        now = dt_util.now()
        for st in self.hass.states.async_all("sensor"):
            a = st.attributes or {}
            if not any(k in a for k in LIST_KEYS):
                continue
            rows = parse_series(dict(a), str(a.get("unit_of_measurement") or ""), now)
            if len(rows) >= 12:
                out.append({"id": st.entity_id, "name": str(a.get("friendly_name") or st.entity_id), "res": "15 Min." if len(rows) > 30 and (rows[1][0] - rows[0][0]).total_seconds() < 1000 else "Stunden",
                            "boerse": any(h in st.entity_id for h in BOERSE_HINT)})
            if len(out) >= 12:
                break
        return out

    async def _from_tibber(self) -> list[dict[str, Any]]:
        tb = self.hass.data.get(DOMAIN, {}).get("tibber")
        if tb is None or not getattr(tb, "connected", False):
            return []
        try:
            c = await tb.async_prices()
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("Tarif/Tibber: %s", err)
            return []
        rows = [(p["start"], float(p["ct"])) for p in (c or {}).get("prices") or [] if p.get("start") is not None and p.get("ct") is not None]
        return to_series(sorted(rows, key=lambda r: r[0].timestamp()), 1.0)

    def _from_sensor(self) -> tuple[list[dict[str, Any]], bool, str]:
        ent = self.price_sensor()
        st = self.hass.states.get(ent) if ent else None
        if st is None:
            return [], False, ""
        a = dict(st.attributes or {})
        rows = parse_series(a, str(a.get("unit_of_measurement") or ""), dt_util.now())
        if len(rows) < 12:
            return [], False, ent
        fac = _factor([v for _, v in rows], str(a.get("unit_of_measurement") or ""))
        boerse = self.cfg["boerse"] == "on" or (self.cfg["boerse"] == "auto" and any(h in ent for h in BOERSE_HINT))
        return to_series(rows, fac), boerse, ent

    def _fix(self) -> list[dict[str, Any]]:
        haus = self.hass.data.get(DOMAIN, {}).get("haus")
        hp = ((getattr(haus, "data", None) or {}).get("price") or {})
        try:
            ct = float(hp.get("price")) if hp.get("price") is not None else None
        except (TypeError, ValueError):
            ct = None
        if ct is None:
            return []
        start = dt_util.start_of_local_day()
        return [{"s": int(start.timestamp()), "d": int((start + timedelta(days=2)).timestamp() - start.timestamp()), "ct": round(ct, 4)}]

    async def _load(self) -> None:
        order = {"auto": ("tibber", "sensor", "fix"), "tibber": ("tibber", "sensor", "fix"), "sensor": ("sensor", "tibber", "fix"), "fix": ("fix",)}[self.cfg["src"]]
        series, src, name, boerse, note = [], "", "", False, ""
        for o in order:
            if o == "tibber":
                series = await self._from_tibber()
                name = "Tibber"
            elif o == "sensor":
                series, boerse, ent = self._from_sensor()
                st = self.hass.states.get(ent) if ent else None
                name = str((st.attributes or {}).get("friendly_name") or ent) if st is not None else "Preis-Sensor"
            else:
                series, name = self._fix(), "Festpreis (Haus-Werte)"
            if series:
                src = o
                break
            if o == order[0] and self.cfg["src"] != "auto" and o != "fix":
                note = f"{SRC_NAMES[o]} liefert gerade keine Preise – Ersatzquelle aktiv."
        if boerse:
            series = [{**x, "ct": end_price(x["ct"], self.cfg), "b": x["ct"]} for x in series]
        if self.cfg["nne"]["on"] and src != "fix":
            series = [{**x, "ct": round(x["ct"] + nne_add(x["s"], self.cfg), 4)} for x in series]
        self.series, self.src, self.src_name, self.boerse, self.note = series, src, name, boerse, note

    def _remember(self) -> None:
        """A9: Preise je Tag (Index = Viertelstunde/Stunde ab Mitternacht) für den Tarif-Check."""
        if self.src in ("", "fix"):
            return
        by: dict[str, list[list[float]]] = {}
        for x in self.series:
            d = day_of(x["s"]).isoformat()
            by.setdefault(d, []).append([x["s"], x["d"], x["ct"]])
        today = dt_util.now().date()
        for d, rows in by.items():
            if date.fromisoformat(d) <= today:
                self.hist[d] = rows
        if len(self.hist) > HIST_DAYS:
            for k in sorted(self.hist)[: len(self.hist) - HIST_DAYS]:
                del self.hist[k]

    async def _tick(self, _now: Any) -> None:
        if self._busy:
            return
        self._busy = True
        try:
            await self._load()
            self._remember()
            try:
                self.devs = self._dev_windows()
            except Exception as err:  # noqa: BLE001 - Fenster sind ein Zusatz
                _LOGGER.debug("Tarif: Gerätefenster: %s", err)
                self.devs = []
            try:
                self._alarm()
            except Exception as err:  # noqa: BLE001
                _LOGGER.debug("Tarif: Preisalarm: %s", err)
            self._save()
            snap = self.snapshot()
            key = json.dumps({k: snap[k] for k in ("series", "now", "src", "devs", "alarm")}, sort_keys=True, default=str)
            if key != self._last:
                self._last = key
                async_dispatcher_send(self.hass, SIGNAL_TARIF)
        finally:
            self._busy = False

    # ---- v0.8 C1: bestes Fenster je Gerät (Modul 4)
    def _feed(self) -> float:
        haus = self.hass.data.get(DOMAIN, {}).get("haus")
        hp = ((getattr(haus, "data", None) or {}).get("price") or {})
        try:
            return float(hp.get("feed", 8.0))
        except (TypeError, ValueError):
            return 8.0

    def _solar_fn(self) -> Any:
        gm = self.hass.data.get(DOMAIN, {}).get("geraete")
        fc = dict(getattr(gm, "_fc", {}) or {}) if gm is not None and self.cfg.get("sun", True) else {}
        return lambda t: float(fc.get(int(t // 3600 * 3600), 0.0)) * SOLAR_SHARE  # Wh in der Stunde ≈ mittlere Leistung in W

    def _dev_windows(self) -> list[dict[str, Any]]:
        gm = self.hass.data.get(DOMAIN, {}).get("geraete")
        if gm is None or self.src in ("", "fix") or not self.series:
            return []
        try:
            devices = gm._cfg().get("devices") or []
        except Exception:  # noqa: BLE001
            return []
        now = dt_util.now().timestamp()
        end = self.series[-1]["s"] + self.series[-1]["d"]
        solar, feed, out = self._solar_fn(), self._feed(), []
        for dev in devices:
            did = dev.get("id")
            dc = self.cfg["devs"].get(did) or {}
            on = dc.get("on", dev.get("typ", "") in SHIFT_TYPES)
            durs = [x for x in (getattr(gm, "durs", {}) or {}).get(did, []) if x > 0]
            base = {"id": did, "name": dev.get("name") or "Gerät", "typ": dev.get("typ", ""), "on": bool(on), "n": len(durs), "by": dc.get("by"), "from": dc.get("from"),
                    "running": did in (getattr(gm, "_run", {}) or {}), "rem": self.rem.get(did)}
            if not on or len(durs) < 2:
                out.append({**base, "w": None})
                continue
            sd = sorted(durs)
            dur = sd[len(sd) // 2]
            runs = [r for r in (getattr(gm, "rlog", []) or []) if r.get("d") == did and r.get("kwh")]
            kw = sorted(r["kwh"] for r in runs[-10:])
            kwh = kw[len(kw) // 2] if kw else (gm.typ.get(did, 0) * dur / 3600 / 1000)
            cv = next((r.get("cv") for r in reversed(runs) if r.get("cv")), None)
            prof = profile(cv, dur, kwh)
            w = best_dev(prof, now, end, self.at, solar, feed, dc.get("from"), dc.get("by"))
            out.append({**base, "dur": int(dur), "kwh": round(kwh, 3), "curve": bool(cv), "w": w})
        return out

    def _schedule(self, did: str, ts: float) -> None:
        if did in self._rem_unsub:
            self._rem_unsub.pop(did)()
        self.rem[did] = ts

        async def _fire(_now: Any) -> None:
            self._rem_unsub.pop(did, None)
            self.rem.pop(did, None)
            d = next((x for x in self.devs if x["id"] == did), None)
            name = d["name"] if d else "Gerät"
            w = (d or {}).get("w") or {}
            msg = f"Jetzt ist die günstigste Zeit: Ø {w.get('avg', 0):.1f} ct/kWh".replace(".", ",") + (f", spart etwa {w['save']:.2f} €".replace(".", ",") if w.get("save") else "") + "."
            self._notify(f"{name}: jetzt starten", msg, "geraet", {"geraet": name})
            self._save()

        self._rem_unsub[did] = async_track_point_in_utc_time(self.hass, _fire, dt_util.utc_from_timestamp(ts))

    def set_remind(self, did: str, on: bool) -> dict[str, Any]:
        if not on:
            if did in self._rem_unsub:
                self._rem_unsub.pop(did)()
            self.rem.pop(did, None)
            self._save()
            return {"ok": True}
        if not self._targets():
            return {"ok": False, "msg": "Kein Meldedienst gewählt (Einstellungen → Fenster & Alarm)"}
        d = next((x for x in self.devs if x["id"] == did), None)
        w = (d or {}).get("w")
        if not w:
            return {"ok": False, "msg": "Für dieses Gerät gibt es noch kein Fenster"}
        if w["s"] <= dt_util.now().timestamp() + 60:
            return {"ok": False, "msg": "Gerade ist schon die günstigste Zeit"}
        self._schedule(did, float(w["s"]))
        self._save()
        return {"ok": True, "ts": w["s"]}

    # ---- v0.8 C2: Preisalarm
    def _targets(self) -> list[str]:
        to = list(self.cfg["alarm"]["to"])
        if not to:  # Rückfall: Meldedienste aus Modul 4
            gm = self.hass.data.get(DOMAIN, {}).get("geraete")
            try:
                to = list((gm._cfg() if gm is not None else {}).get("notify") or [])
            except Exception:  # noqa: BLE001
                to = []
        return to

    def _notify(self, title: str, msg: str, kind: str, extra: dict[str, Any] | None = None) -> int:
        self.alog = (self.alog + [{"t": int(dt_util.now().timestamp()), "k": kind, "title": title, "msg": msg}])[-ALOG_MAX:]
        self.hass.bus.async_fire(EVENT_TARIF, {"typ": kind, "titel": title, "text": msg, **(extra or {})})
        n = 0
        for svc in self._targets():
            dom, _, name = svc.partition(".")
            if self.hass.services.has_service(dom, name):
                self.hass.async_create_task(self.hass.services.async_call(dom, name, {"title": title, "message": msg}))
                n += 1
        return n

    def _quiet(self, now: datetime) -> bool:
        q = self.cfg["alarm"]["quiet"]
        return bool(q["on"]) and in_hours(now.hour, q["from"], q["to"])

    def alarm_view(self) -> dict[str, Any]:
        """Für die Oberfläche: nächster bzw. laufender Zeitraum je Alarm."""
        A, now = self.cfg["alarm"], dt_util.now().timestamp()
        ser = self.series if self.src not in ("", "fix") else []
        fut = lambda ps: next((p for p in ps if p["e"] > now), None)  # noqa: E731
        st_m = day_stats(self.series, dt_util.now().date() + timedelta(days=1)) if ser else None
        return {"below": fut(periods(ser, lambda c: c <= A["below"]["ct"])), "above": fut(periods(ser, lambda c: c >= A["above"]["ct"])),
                "neg": fut(periods(ser, lambda c: c < 0)), "tomorrow": bool(st_m), "targets": self._targets()}

    def _alarm(self) -> None:
        A = self.cfg["alarm"]
        if self.src in ("", "fix") or not self.series or not self.active():
            return
        nd = dt_util.now()
        now = nd.timestamp()
        for k in [k for k, v in self.sent.items() if v < now - 3 * 86400]:
            del self.sent[k]
        if self._quiet(nd):
            return
        lead = A["lead"] * 60
        hm = lambda ts: datetime.fromtimestamp(ts, tz=dt_util.DEFAULT_TIME_ZONE).strftime("%H:%M")  # noqa: E731
        day = lambda ts: "morgen " if day_of(int(ts)) > nd.date() else ""  # noqa: E731
        f1 = lambda v: f"{v:.1f}".replace(".", ",")  # noqa: E731
        rules = [("neg", A["neg"]["on"], lambda c: c < 0, "Negativer Strompreis", lambda p: f"{day(p['s'])}{hm(p['s'])}–{hm(p['e'])} Uhr, bis {f1(p['min'])} ct/kWh. Gute Zeit für Akku, Auto und große Verbraucher."),
                 ("below", A["below"]["on"], lambda c: c <= A["below"]["ct"], f"Strom unter {f1(A['below']['ct'])} ct", lambda p: f"{day(p['s'])}{hm(p['s'])}–{hm(p['e'])} Uhr, tiefster Preis {f1(p['min'])} ct/kWh."),
                 ("above", A["above"]["on"], lambda c: c >= A["above"]["ct"], f"Strom über {f1(A['above']['ct'])} ct", lambda p: f"{day(p['s'])}{hm(p['s'])}–{hm(p['e'])} Uhr, bis {f1(p['max'])} ct/kWh. Große Verbraucher besser verschieben.")]
        for kind, on, test, title, text in rules:
            if not on:
                continue
            for p in periods(self.series, test):
                key = f"{kind}:{p['s']}"
                if p["s"] - lead <= now < p["e"] and key not in self.sent:
                    self.sent[key] = now
                    if kind == "below" and A["neg"]["on"] and p["min"] < 0 and f"neg:{p['s']}" in self.sent:
                        continue  # schon als „negativ“ gemeldet
                    self._notify(title, text(p), kind, {"start": datetime.fromtimestamp(p["s"], tz=dt_util.DEFAULT_TIME_ZONE).isoformat(), "ende": datetime.fromtimestamp(p["e"], tz=dt_util.DEFAULT_TIME_ZONE).isoformat(), "min": p["min"], "max": p["max"]})
        if A["tomorrow"]["on"]:
            tm = nd.date() + timedelta(days=1)
            st = day_stats(self.series, tm)
            key = f"tomorrow:{tm.isoformat()}"
            if st and key not in self.sent:
                self.sent[key] = now
                b = best_window(self.series, datetime(tm.year, tm.month, tm.day, tzinfo=dt_util.DEFAULT_TIME_ZONE).timestamp(), self.cfg["win_h"])
                msg = f"Ø {f1(st['avg'])} ct/kWh, {f1(st['min'])} bis {f1(st['max'])} ct." + (f" Günstigste {self.cfg['win_h']} Std. ab {hm(b['s'])} Uhr (Ø {f1(b['avg'])} ct)." if b else "") + (f" {st['neg']} × negativ." if st["neg"] else "")
                self._notify("Strompreise für morgen da", msg, "tomorrow", {"avg": st["avg"], "min": st["min"], "max": st["max"]})

    def test_alarm(self) -> int:
        return self._notify("Strom & Wärme · Preisalarm", "Test: So sieht eine Meldung von Modul 14 aus.", "test")

    # ---- Abfragen für andere Module
    def at(self, when: datetime | float | None = None) -> float | None:
        ts = (when.timestamp() if isinstance(when, datetime) else when) if when is not None else dt_util.now().timestamp()
        for x in self.series:
            if x["s"] <= ts < x["s"] + x["d"]:
                return x["ct"]
        return None

    def snapshot(self) -> dict[str, Any]:
        nd = dt_util.now()
        now = nd.timestamp()
        today = nd.astimezone(dt_util.DEFAULT_TIME_ZONE).date()
        tomorrow = today + timedelta(days=1)
        st_t, st_m = day_stats(self.series, today), day_stats(self.series, tomorrow)
        cur = self.at(now)
        seg = next((x for x in self.series if x["s"] <= now < x["s"] + x["d"]), None)
        nxt = next((x for x in self.series if seg and x["s"] >= seg["s"] + seg["d"]), None)
        # „bis wann“ gilt die aktuelle Stufe
        avg = st_t["avg"] if st_t else None
        lv = level(cur, avg, self.cfg)
        until = None
        if seg:
            for x in self.series:
                if x["s"] >= seg["s"] and level(x["ct"], avg, self.cfg) != lv:
                    until = x["s"]
                    break
        hours = self.cfg["win_h"]
        best = best_window(self.series, now, hours)
        best_m = best_window(self.series, datetime(tomorrow.year, tomorrow.month, tomorrow.day, tzinfo=dt_util.DEFAULT_TIME_ZONE).timestamp(), hours) if st_m else None
        fut = [x for x in self.series if x["s"] + x["d"] > now]
        dear = max(fut, key=lambda x: x["ct"]) if fut else None
        neg = [x for x in fut if x["ct"] < 0]
        start = int(datetime(today.year, today.month, today.day, tzinfo=dt_util.DEFAULT_TIME_ZONE).timestamp()) - 3600 * 2
        ser = [x for x in self.series if x["s"] >= start]
        return {
            "cfg": self.cfg, "src": self.src, "src_name": self.src_name, "boerse": self.boerse, "note": self.note, "active": self.active(),
            "series": ser, "res": (ser[0]["d"] if ser else 0),
            "now": {"ct": cur, "lv": lv, "until": until, "next": nxt["ct"] if nxt else None, "next_s": nxt["s"] if nxt else None, "next_h": round(sum(x["ct"] * x["d"] for x in self.series if now <= x["s"] < now + 3600) / max(1, sum(x["d"] for x in self.series if now <= x["s"] < now + 3600)), 2) if any(now <= x["s"] < now + 3600 for x in self.series) else None},
            "today": st_t, "tomorrow": st_m, "best": best, "best_tomorrow": best_m,
            "slots": cheapest_slots(self.series, now, 3, 1.0), "dear": {"s": dear["s"], "ct": dear["ct"]} if dear else None,
            "neg": {"n": len(neg), "s": neg[0]["s"], "min": min(x["ct"] for x in neg)} if neg else None,
            "hist_days": len(self.hist),
            "devs": [{**d, "rem": self.rem.get(d["id"])} for d in self.devs], "alarm": self.alarm_view(), "alog": self.alog[-20:][::-1],
        }

    async def async_set(self, raw: Any) -> dict[str, Any]:
        old = self.cfg
        self.cfg = clean_cfg({**self.cfg, **raw} if isinstance(raw, dict) else raw)
        vl = self.hass.data.get(DOMAIN, {}).get("verlauf")
        if vl is not None:
            vl.record("tarif", old, self.cfg)
        self._listen()
        self._last = ""
        await self._tick(None)
        return {**self.snapshot(), "found": self.found()}
