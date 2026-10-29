"""Labs: experimentelle Funktionen, die Geräte schalten.

Smart Vorheizen (Heizplan früher starten), Duschzeiten lernen (Warmwasser vorheizen),
Legionellenschutz nach Sonne (Lauf auf den sonnigeren Tag verschieben) und
Ladeziel nach Kalender (Ziel-Ladestand der Wallbox). Alle sind ab Werk aus und werden im
Dashboard unter „Labs“ eingeschaltet. Die reinen Rechenfunktionen stehen oben, der Manager unten.
"""
from __future__ import annotations

import logging
from collections import Counter
from datetime import date, datetime, timedelta
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import DOMAIN
from .diag import diag_log

_LOGGER = logging.getLogger(__name__)

DEFAULTS: dict[str, float] = {
    "vh_dk": 3.0, "vh_max": 90.0, "dz_days": 14.0, "dz_lead": 45.0, "ld_wait": 3.0, "ld_min": 8.0, "lk_hi": 90.0, "lk_dur": 2.0,
}
TICK_SECONDS = 60
KEEP_DAYS = 30
TAP_DROP_K = 1.0          # so viel kühlt der Speicher bei einer Entnahme in 10 Minuten ab
TAP_WINDOW_S = 600
TAP_DEBOUNCE_S = 1800
DAY_MIN_SAMPLES = 600     # ab so vielen Messungen zählt ein Tag als beobachtet
BUCKET = 30               # Minuten je Zeitfenster beim Erkennen
HOLD_MIN = 30             # so lange bleibt der Speicher nach einer erkannten Zeit warm
LEG_OVERDUE_DAYS = 9
SAFE_MAX = 62.0


# --------------------------------------------------------------------------- reine Rechnung
def vh_lead(gain_k: float, rate_kh: float | None, max_min: float) -> int:
    """Minuten, die der Heizplan früher starten soll. 0 = kein Vorlauf."""
    if rate_kh is None or rate_kh <= 0 or gain_k <= 0:
        return 0
    return int(min(max_min, round(gain_k / rate_kh * 60)))


def ld_decide(shift: int, wait: int, min_kwh: float, fc_today: float | None, fc_tomorrow: float | None, overdue: bool) -> int:
    """Neue Verschiebung (in Tagen) des Legionellenlaufs. Wird einmal pro Tag am Laufzeitpunkt entschieden."""
    if overdue or shift >= wait:
        return shift
    if fc_today is not None and fc_today >= min_kwh:
        return shift
    if fc_tomorrow is not None and fc_tomorrow >= min_kwh and (fc_today is None or fc_tomorrow > fc_today):
        return shift + 1
    return shift


def is_overdue(last_ts: str | None, now: datetime) -> bool:
    if not last_ts:
        return False
    try:
        return (now.date() - datetime.fromisoformat(last_ts).astimezone(now.tzinfo).date()).days > LEG_OVERDUE_DAYS
    except ValueError:
        return False


def mean(vals: list[float]) -> float | None:
    return sum(vals) / len(vals) if vals else None


def detect_tap(hist: list[tuple[float, float]], now_ts: float, last_tap: float) -> float | None:
    """Zeitpunkt einer Warmwasser-Entnahme aus dem Verlauf (ts, Mittelwert) oder None."""
    if now_ts - last_tap < TAP_DEBOUNCE_S or len(hist) < 2:
        return None
    ts, cur = hist[-1]
    old = [(t, v) for t, v in hist[:-1] if TAP_WINDOW_S * 0.6 <= ts - t <= TAP_WINDOW_S * 1.5]
    if not old:
        return None
    t0, v0 = max(old, key=lambda x: x[1])
    return t0 if v0 - cur >= TAP_DROP_K else None


def typical_times(days: dict[str, dict[str, Any]], weekend: bool, min_share: float = 0.5) -> list[int]:
    """Typische Zapfzeiten (Minute des Tages) für Werktage oder Wochenende."""
    sel = []
    for k, v in days.items():
        try:
            wk = date.fromisoformat(k).weekday() >= 5
        except ValueError:
            continue
        if wk == weekend and int(v.get("n", 0)) >= DAY_MIN_SAMPLES:
            sel.append(v)
    if len(sel) < 3:
        return []
    cnt: Counter[int] = Counter()
    for v in sel:
        for b in {int(m) // BUCKET for m in v.get("taps", [])}:
            cnt[b] += 1
    hot = sorted(b for b, c in cnt.items() if c / len(sel) >= min_share)
    out: list[int] = []
    prev = -9
    for b in hot:
        if b != prev + 1:
            out.append(b * BUCKET)
        prev = b
    return out


def observed_days(days: dict[str, dict[str, Any]]) -> int:
    return sum(1 for v in days.values() if int(v.get("n", 0)) >= DAY_MIN_SAMPLES)


def dz_active(times: list[int], minute: int, lead: int) -> bool:
    """Liegt die Uhrzeit im Vorlauf vor einer gelernten Zeit (oder kurz danach)?"""
    return any(t - lead <= minute < t + HOLD_MIN for t in times)


def lk_target(base: int, hi: int, min_h: float, start: datetime | None, end: datetime | None, now: datetime) -> int:
    """Ziel-Ladestand nach dem nächsten Termin: langer Termin in den nächsten 36 Stunden = höheres Ziel."""
    if start is None or end is None:
        return base
    if start < now or start - now > timedelta(hours=36):
        return base
    if (end - start).total_seconds() / 3600 >= min_h:
        return max(base, hi)
    return base


def parse_dt(val: Any, tz: Any) -> datetime | None:
    if not isinstance(val, str) or not val:
        return None
    d = dt_util.parse_datetime(val.replace(" ", "T")) if "T" in val or " " in val else None
    if d is None:
        day = dt_util.parse_date(val)
        d = datetime(day.year, day.month, day.day) if day else None
    if d is None:
        return None
    return d.replace(tzinfo=tz) if d.tzinfo is None else d.astimezone(tz)


# --------------------------------------------------------------------------- Zugriff auf die Einstellungen
def labs_cfg(hass: HomeAssistant) -> dict[str, Any]:
    lay = hass.data.get(DOMAIN, {}).get("layout") or {}
    labs = lay.get("labs")
    return labs if isinstance(labs, dict) else {}


def lab_on(hass: HomeAssistant, lab: str) -> bool:
    return lab in (labs_cfg(hass).get("on") or [])


def lab_val(hass: HomeAssistant, key: str) -> float:
    v = (labs_cfg(hass).get("cfg") or {}).get(key)
    return float(v) if isinstance(v, (int, float)) and not isinstance(v, bool) else DEFAULTS[key]


# --------------------------------------------------------------------------- Manager
class LabsManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_labs")
        self.days: dict[str, dict[str, Any]] = {}   # Duschzeiten: Tag → {n, taps}
        self.ld: dict[str, Any] = {"shift": 0, "dec": ""}
        self._hist: list[tuple[float, float]] = []
        self._last_tap = 0.0
        self._logged: set[str] = set()
        self._unsub: CALLBACK_TYPE | None = None

    async def async_start(self) -> None:
        from .api import _layout  # spät importiert: api importiert die Manager nicht, braucht aber das Layout

        await _layout(self.hass)
        d = await self._store.async_load()
        if isinstance(d, dict):
            days = d.get("days")
            if isinstance(days, dict):
                for k, v in days.items():
                    if isinstance(v, dict):
                        self.days[str(k)] = {"n": int(v.get("n") or 0), "taps": [int(m) for m in v.get("taps", []) if isinstance(m, (int, float))][:200]}
            ld = d.get("ld")
            if isinstance(ld, dict):
                self.ld = {"shift": max(0, min(7, int(ld.get("shift") or 0))), "dec": str(ld.get("dec") or "")}
        self._unsub = async_track_time_interval(self.hass, self._tick, timedelta(seconds=TICK_SECONDS))

    def async_stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"days": self.days, "ld": self.ld}, 10)

    def _log_once(self, key: str, level: str, text: str, room: str) -> None:
        if key in self._logged:
            return
        if len(self._logged) > 400:
            self._logged.clear()
        self._logged.add(key)
        diag_log(self.hass, level, text, room=room)

    # ---- Smart Vorheizen (Modul 1)
    def vh_point(self, ctrl: Any, cur: tuple[int, float]) -> tuple[int, float] | None:
        """Schaltpunkt, der schon jetzt gelten soll, weil der Raum vorgeheizt werden muss. Sonst None."""
        if not lab_on(self.hass, "vh"):
            return None
        nxt = ctrl.plan_next()
        if not nxt:
            return None
        point, mins = nxt
        if point[1] <= cur[1]:
            return None
        room_t = ctrl.room_temperature()
        info = ctrl.learning_info()
        if room_t is None or room_t >= point[1] or not info:
            return None
        lead = vh_lead(min(lab_val(self.hass, "vh_dk"), point[1] - room_t), float(info["rate"]), lab_val(self.hass, "vh_max"))
        if lead <= 0 or mins > lead:
            return None
        room = str(getattr(getattr(ctrl, "entry", None), "title", "") or "")
        self._log_once(f"vh:{room}:{point[0]}:{dt_util.now().date()}", "info",
                       f"Smart Vorheizen: Der Heizplan startet {mins} Min. früher (Vorlauf {lead} Min.)", room)
        return point

    # ---- Legionellenschutz nach Sonne (Modul 2)
    async def leg_effective(self, leg: dict[str, Any], local: datetime, last_ts: str | None) -> dict[str, Any]:
        if not lab_on(self.hass, "ld"):
            if self.ld["shift"]:
                self.ld["shift"] = 0
                self._save()
            return leg
        shift = int(self.ld["shift"])
        today = local.date().isoformat()
        eff_day = (int(leg["day"]) + shift) % 7
        mins = local.hour * 60 + local.minute
        if local.weekday() == eff_day and mins >= _tm(leg["time"]) and self.ld["dec"] != today:
            fc_t = fc_m = None
            sm = self.hass.data.get(DOMAIN, {}).get("solar")
            if sm is not None:
                try:
                    snap = await sm.snapshot()
                    if snap.get("found"):
                        fc_t, fc_m = float(snap["today"]), float(snap["tomorrow"])
                except Exception:  # noqa: BLE001 - ohne Prognose bleibt der Lauf wie geplant
                    _LOGGER.debug("Labs: Prognose nicht lesbar", exc_info=True)
            new = ld_decide(shift, int(lab_val(self.hass, "ld_wait")), lab_val(self.hass, "ld_min"), fc_t, fc_m, is_overdue(last_ts, local))
            self.ld["dec"] = today
            if new != shift:
                self.ld["shift"] = new
                shift = new
                eff_day = (int(leg["day"]) + shift) % 7
                diag_log(self.hass, "info", f"Legionellenschutz nach Sonne: Der Lauf wird auf morgen verschoben (Prognose heute {fc_t} kWh, morgen {fc_m} kWh)", room="Warmwasser")
            self._save()
        return {**leg, "day": eff_day}

    def leg_started(self) -> None:
        if self.ld["shift"]:
            self.ld["shift"] = 0
            self._save()

    # ---- Duschzeiten lernen (Modul 2)
    def dz_temp(self, cfg: dict[str, Any], local: datetime) -> float:
        """Wunschtemperatur wegen gelernter Zapfzeiten (0 = keine)."""
        if not lab_on(self.hass, "dz") or observed_days(self.days) < int(lab_val(self.hass, "dz_days")):
            return 0.0
        wk = local.weekday() >= 5
        times = typical_times(self.days, wk)
        if not dz_active(times, local.hour * 60 + local.minute, int(lab_val(self.hass, "dz_lead"))):
            return 0.0
        wins = cfg["heat"]["we" if wk else "wd"]
        temp = max([float(w["temp"]) for w in wins] or [float(cfg["heat"]["low"])])
        return min(temp, SAFE_MAX - 2)

    def _dz_sample(self) -> None:
        if not lab_on(self.hass, "dz"):
            self._hist.clear()
            return
        wm = self.hass.data.get(DOMAIN, {}).get("wasser")
        if wm is None or not wm.active():
            return
        vals = []
        for k in ("top", "mid", "bot"):
            st = self.hass.states.get(wm.cfg["ent"][k]) if wm.cfg["ent"].get(k) else None
            try:
                vals.append(float(st.state)) if st is not None else None
            except (TypeError, ValueError):
                continue
        m = mean(vals)
        if m is None:
            return
        now = dt_util.now()
        ts = now.timestamp()
        self._hist = [x for x in self._hist if ts - x[0] <= TAP_WINDOW_S * 2] + [(ts, m)]
        key = now.date().isoformat()
        day = self.days.setdefault(key, {"n": 0, "taps": []})
        day["n"] += 1
        t0 = detect_tap(self._hist, ts, self._last_tap)
        if t0 is not None:
            self._last_tap = ts
            when = dt_util.as_local(datetime.fromtimestamp(t0, now.tzinfo))
            day["taps"].append(when.hour * 60 + when.minute)
            day["taps"] = day["taps"][-200:]
        for old in sorted(self.days)[:-KEEP_DAYS]:
            self.days.pop(old, None)
        if day["n"] % 5 == 0 or t0 is not None:
            self._save()

    async def _tick(self, _now: Any) -> None:
        try:
            self._dz_sample()
        except Exception:  # noqa: BLE001 - Lernen darf die Regelung nie stören
            _LOGGER.exception("Labs: Auswertung fehlgeschlagen")

    # ---- Ladeziel nach Kalender (Modul 8)
    def _event(self) -> tuple[str, datetime | None, datetime | None]:
        cal = (labs_cfg(self.hass).get("cfg") or {}).get("lk_cal")
        st = self.hass.states.get(cal) if isinstance(cal, str) and cal else None
        if st is None:
            return "", None, None
        tz = dt_util.now().tzinfo
        a = st.attributes or {}
        return str(a.get("message") or "")[:60], parse_dt(a.get("start_time"), tz), parse_dt(a.get("end_time"), tz)

    def wb_cfg(self, cfg: dict[str, Any]) -> dict[str, Any]:
        """Wallbox-Einstellungen mit dem Ziel-Ladestand nach Kalender."""
        if not lab_on(self.hass, "lk"):
            return cfg
        msg, start, end = self._event()
        now = dt_util.now()
        goal = lk_target(int(cfg["planSoc"]), int(lab_val(self.hass, "lk_hi")), lab_val(self.hass, "lk_dur"), start, end, now)
        if goal > cfg["planSoc"]:
            self._log_once(f"lk:{msg}:{start}", "info", f"Ladeziel nach Kalender: {goal} % wegen „{msg}“", "Wallbox")
            return {**cfg, "planSoc": goal}
        return cfg

    # ---- Ansicht
    async def snapshot(self) -> dict[str, Any]:
        now = dt_util.now()
        need = int(lab_val(self.hass, "dz_days"))
        seen = observed_days(self.days)
        out: dict[str, Any] = {
            "dz": {"on": lab_on(self.hass, "dz"), "seen": seen, "need": need, "ready": seen >= need,
                   "wd": [_hm(m) for m in typical_times(self.days, False)], "we": [_hm(m) for m in typical_times(self.days, True)]},
            "ld": {"on": lab_on(self.hass, "ld"), "shift": int(self.ld["shift"])},
        }
        wm = self.hass.data.get(DOMAIN, {}).get("wasser")
        if wm is not None:
            leg = wm.cfg["leg"]
            out["ld"].update({"plan_day": int(leg["day"]), "eff_day": (int(leg["day"]) + int(self.ld["shift"])) % 7, "time": leg["time"], "on_leg": bool(leg["on"])})
        sm = self.hass.data.get(DOMAIN, {}).get("solar")
        if sm is not None:
            try:
                snap = await sm.snapshot()
                out["ld"].update({"found": bool(snap.get("found")), "today": snap.get("today"), "tomorrow": snap.get("tomorrow")})
            except Exception:  # noqa: BLE001
                out["ld"]["found"] = False
        msg, start, end = self._event()
        out["lk"] = {"on": lab_on(self.hass, "lk"), "msg": msg, "start": start.isoformat() if start else None, "end": end.isoformat() if end else None}
        out["now"] = now.isoformat(timespec="minutes")
        return out


def _tm(s: str) -> int:
    h, m = str(s).split(":")
    return int(h) * 60 + int(m)


def _hm(minute: int) -> str:
    return f"{minute // 60:02d}:{minute % 60:02d}"
