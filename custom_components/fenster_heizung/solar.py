"""Modul 16 – Solar-Prognose: Ertrag heute und morgen (Forecast.Solar) gegen den tatsächlichen Ertrag."""
from __future__ import annotations

import logging
import re
import time
from datetime import date, datetime, timedelta
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

TICK_SECONDS = 300
KEEP_DAYS = 60
UNIT_KWH = {"Wh": 0.001, "kWh": 1.0, "MWh": 1000.0}
EID = re.compile(r"^[a-z_]+\.[a-z0-9_]+$")


def default_cfg() -> dict[str, Any]:
    return {"src": "forecast", "fc_sensor": "", "act": "", "mode": "day"}


def clean_cfg(raw: Any) -> dict[str, Any]:
    d = default_cfg()
    if isinstance(raw, dict):
        if raw.get("src") in ("forecast", "sensor"):
            d["src"] = raw["src"]
        for k in ("fc_sensor", "act"):
            v = str(raw.get(k) or "").strip().lower()
            d[k] = v if EID.match(v) else ""
        if raw.get("mode") in ("day", "total"):
            d["mode"] = raw["mode"]
    return d


def day_sums(wh: dict[Any, float], tz: Any, day: date) -> float:
    """Summe der Stundenwerte (Wh) eines Tages in kWh."""
    tot = 0.0
    for k, v in wh.items():
        try:
            t = k if isinstance(k, datetime) else datetime.fromisoformat(str(k))
            if (t.astimezone(tz) if tz else t).date() == day:
                tot += float(v)
        except (TypeError, ValueError):
            continue
    return round(tot / 1000, 1)


def hourly(wh: dict[Any, float], tz: Any, day: date) -> list[list[Any]]:
    """Stundenwerte eines Tages: [[Stunde, kWh]]."""
    out: dict[int, float] = {}
    for k, v in wh.items():
        try:
            t = k if isinstance(k, datetime) else datetime.fromisoformat(str(k))
            t = t.astimezone(tz) if tz else t
            if t.date() == day:
                out[t.hour] = out.get(t.hour, 0.0) + float(v) / 1000
        except (TypeError, ValueError):
            continue
    return [[h, round(out[h], 2)] for h in sorted(out)]


def deviation(hist: list[dict[str, Any]]) -> float | None:
    """Abweichung Ertrag gegen Prognose in Prozent über abgeschlossene Tage."""
    f = sum(x["f"] for x in hist if x.get("f") and x.get("a") is not None)
    a = sum(x["a"] for x in hist if x.get("f") and x.get("a") is not None)
    return round((a - f) / f * 100, 1) if f > 0 else None


def best_window(rows: list[list[Any]], hours: int = 3) -> dict[str, Any] | None:
    """Zusammenhängende Stunden mit der höchsten Erzeugung."""
    if len(rows) < hours:
        return None
    best, at = -1.0, 0
    byh = {h: v for h, v in rows}
    for h in sorted(byh):
        s = sum(byh.get(h + i, 0.0) for i in range(hours))
        if s > best:
            best, at = s, h
    return {"from": at, "to": at + hours, "kwh": round(best, 1)} if best > 0 else None


class SolarManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_solar")
        self.cfg = default_cfg()
        self.hist: dict[str, dict[str, Any]] = {}  # "2026-10-26": {f, a, base}
        self._cache: tuple[float, dict[str, Any]] | None = None
        self._unsub: CALLBACK_TYPE | None = None

    async def async_start(self) -> None:
        d = await self._store.async_load()
        if isinstance(d, dict):
            self.cfg = clean_cfg(d.get("cfg"))
            h = d.get("hist")
            if isinstance(h, dict):
                for k, v in h.items():
                    if isinstance(v, dict):
                        self.hist[str(k)] = {"f": v.get("f"), "a": v.get("a"), "base": v.get("base")}
        self._unsub = async_track_time_interval(self.hass, self._tick, timedelta(seconds=TICK_SECONDS))
        self.hass.async_create_task(self._tick(None))

    def async_stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"cfg": self.cfg, "hist": self.hist}, 5)

    def active(self) -> bool:
        wm = self.hass.data.get(DOMAIN, {}).get("wasser")
        return bool(wm is not None and wm.modules.get("on", {}).get("sp"))

    # ---- Quellen
    async def _wh(self) -> tuple[dict[Any, float], list[dict[str, Any]]]:
        wh: dict[Any, float] = {}
        sites: list[dict[str, Any]] = []
        if self.cfg["src"] == "sensor":
            st = self.hass.states.get(self.cfg["fc_sensor"]) if self.cfg["fc_sensor"] else None
            part = st.attributes.get("wh_period") if st is not None else None
            if isinstance(part, dict):
                wh = {k: float(v or 0) for k, v in part.items()}
            return wh, sites
        for e in self.hass.config_entries.async_entries("forecast_solar"):
            try:
                resp = await self.hass.services.async_call(
                    "forecast_solar", "get_forecast", {"config_entry": e.entry_id, "resolution": "hourly"}, blocking=True, return_response=True)
            except Exception as err:  # Dienst fehlt (ältere HA-Version) oder Abruf begrenzt
                _LOGGER.debug("Forecast.Solar: %s", err)
                continue
            if isinstance(resp, dict) and "wh_period" not in resp and len(resp) == 1:
                resp = next(iter(resp.values()))
            part = (resp or {}).get("wh_period") if isinstance(resp, dict) else None
            if not isinstance(part, dict):
                continue
            for k, v in part.items():
                wh[k] = wh.get(k, 0.0) + float(v or 0)
            sites.append(re.sub(r"[<>\"'&]", "", str(e.title or "Anlage"))[:30])
        return wh, sites

    def _actual_now(self) -> float | None:
        """Aktueller Zählerstand (kWh) des Ertragssensors."""
        st = self.hass.states.get(self.cfg["act"]) if self.cfg["act"] else None
        if st is None:
            return None
        try:
            v = float(st.state)
        except (TypeError, ValueError):
            return None
        return v * UNIT_KWH.get(str(st.attributes.get("unit_of_measurement") or "kWh").strip(), 1.0)

    # ---- Takt
    async def _tick(self, _now: Any) -> None:
        if not self.active():
            return
        now = dt_util.now()
        today = now.date().isoformat()
        rec = self.hist.setdefault(today, {"f": None, "a": None, "base": None})
        if rec["f"] is None and now.hour >= 4:
            wh, _s = await self._wh()
            f = day_sums(wh, now.tzinfo, now.date())
            if f > 0:
                rec["f"] = f  # Prognose des Tages bleibt festgehalten, damit der Vergleich ehrlich bleibt
        cur = self._actual_now()
        if cur is not None:
            if self.cfg["mode"] == "day":
                rec["a"] = round(cur, 1)
            else:
                if rec["base"] is None or cur < float(rec["base"]):
                    rec["base"] = cur if rec["base"] is None else 0.0
                rec["a"] = round(max(0.0, cur - float(rec["base"])), 1)
        for k in sorted(self.hist)[:-KEEP_DAYS]:
            self.hist.pop(k, None)
        self._save()

    # ---- Ansicht
    async def snapshot(self, force: bool = False) -> dict[str, Any]:
        ts = time.time()
        if self._cache and not force and ts - self._cache[0] < 120:
            return {**self._cache[1], "cfg": self.cfg}
        now = dt_util.now()
        wh, sites = await self._wh() if self.active() else ({}, [])
        tz = now.tzinfo
        d0, d1 = now.date(), now.date() + timedelta(days=1)
        rec = self.hist.get(d0.isoformat()) or {}
        hrs0 = hourly(wh, tz, d0)
        hist = []
        for i in range(7, 0, -1):
            k = (d0 - timedelta(days=i)).isoformat()
            r = self.hist.get(k)
            if r and r.get("f") is not None:
                hist.append({"d": k, "f": r["f"], "a": r.get("a")})
        out = {
            "found": bool(wh),
            "src": "Forecast.Solar" if self.cfg["src"] == "forecast" else (self.cfg["fc_sensor"] or "–"),
            "sites": sites,
            "today": day_sums(wh, tz, d0), "tomorrow": day_sums(wh, tz, d1),
            "today_f": rec.get("f"), "got": rec.get("a"), "has_act": bool(self.cfg["act"]),
            "hours": hrs0, "hours_tm": hourly(wh, tz, d1),
            "best": best_window(hrs0 if now.hour < 16 else hourly(wh, tz, d1)),
            "best_day": "today" if now.hour < 16 else "tomorrow",
            "hist": hist, "dev": deviation(hist), "now_h": now.hour,
        }
        self._cache = (ts, out)
        return {**out, "cfg": self.cfg}

    async def async_set(self, raw: Any) -> dict[str, Any]:
        self.cfg = clean_cfg({**self.cfg, **raw} if isinstance(raw, dict) else raw)  # fehlende Felder (alter Browser) behalten ihren Stand
        self._save()
        return await self.snapshot(force=True)
