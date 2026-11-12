"""Modul 16 – Solar-Prognose: Ertrag heute und morgen gegen den tatsächlichen Ertrag.

Stufe 2 (v0.9 Build 4, Konzept F1–F4, F6):
- F1 Quelle: über die Energie-Plattformen von Home Assistant (dieselbe Schnittstelle wie das Energie-Dashboard) – Forecast.Solar,
  Solcast, Open-Meteo Solar Forecast und jede andere Integration mit Solar-Prognose. Rückfall: Dienst forecast_solar.get_forecast.
  Eigener Sensor: Attribut wh_period (Wh je Stunde) oder detailedForecast/detailedHourly (Solcast, kW je Zeitraum).
- F2 Ertrag je Stunde aus der Langzeitstatistik des Ertragssensors (Änderung je Stunde), heute live und für abgeschlossene Tage gespeichert.
- F3 Schnappschuss: ab 4 Uhr wird die ganze Stundenkurve des Tages festgehalten (Messlatte), nicht nur die Tagessumme.
- F4 Speicher mit Schema-Version: 400 Tage Tageswerte, 30 Tage Stundenkurven; alte Stände werden umgewandelt.
- F6 Abruf nur im Hintergrund alle 30 Minuten; die Ansicht liest den Zwischenspeicher.
"""
from __future__ import annotations

import logging
import re
import time
from datetime import date, datetime, timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

TICK_SECONDS = 300
FETCH_SECONDS = 1800   # F6: Prognose höchstens alle 30 Min. abrufen
KEEP_DAYS = 400       # F4: Tageswerte
KEEP_HOURLY = 30      # F4: Stundenkurven
SCHEMA = 2
UNIT_KWH = {"Wh": 0.001, "kWh": 1.0, "MWh": 1000.0}
EID = re.compile(r"^[a-z_]+\.[a-z0-9_]+$")


def default_cfg() -> dict[str, Any]:
    return {"src": "forecast", "fc_sensor": "", "act": "", "mode": "day", "look": "new"}


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
        if raw.get("look") in ("new", "classic"):  # v0.9 Build 3: neue Optik oder „wie bisher“
            d["look"] = raw["look"]
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


def parse_detailed(items: Any) -> dict[str, float]:
    """Solcast-Format: Liste von {period_start, pv_estimate (kW)} je 30 oder 60 Min. → Wh je Stunde (Schlüssel ISO-Zeit der vollen Stunde)."""
    out: dict[str, float] = {}
    if not isinstance(items, list):
        return out
    rows = []
    for x in items:
        if not isinstance(x, dict):
            continue
        try:
            t = x.get("period_start")
            t = t if isinstance(t, datetime) else datetime.fromisoformat(str(t))
            rows.append((t, float(x.get("pv_estimate") or 0)))
        except (TypeError, ValueError):
            continue
    rows.sort(key=lambda r: r[0])
    for i, (t, kw) in enumerate(rows):
        step = (rows[i + 1][0] - t).total_seconds() / 3600 if i + 1 < len(rows) else (rows[i][0] - rows[i - 1][0]).total_seconds() / 3600 if i else 1.0
        step = step if 0 < step <= 1 else 1.0
        k = t.replace(minute=0, second=0, microsecond=0).isoformat()
        out[k] = out.get(k, 0.0) + kw * 1000 * step
    return out


def wh_from_state(attrs: dict[str, Any]) -> dict[Any, float]:
    """Stundenwerte (Wh) aus den Attributen eines Prognose-Sensors."""
    part = attrs.get("wh_period") or attrs.get("wh_hours")
    if isinstance(part, dict):
        out: dict[Any, float] = {}
        for k, v in part.items():
            try:
                out[k] = float(v or 0)
            except (TypeError, ValueError):
                continue
        return out
    for key in ("detailedHourly", "detailedForecast", "forecast"):
        d = parse_detailed(attrs.get(key))
        if d:
            return d
    return {}


def upgrade(d: dict[str, Any]) -> dict[str, Any]:
    """F4: Speicherstand auf die aktuelle Schema-Version bringen, ohne Daten zu verlieren."""
    v = int(d.get("v") or 1) if str(d.get("v") or 1).isdigit() else 1
    hist = d.get("hist") if isinstance(d.get("hist"), dict) else {}
    if v < 2:  # 1 → 2: Tageswerte bleiben, neu sind Stundenkurven (Prognose am Morgen „fh“, Ertrag „ah“)
        hist = {str(k): {"f": r.get("f"), "a": r.get("a"), "base": r.get("base")} for k, r in hist.items() if isinstance(r, dict)}
    out = {}
    for k, r in hist.items():
        if not isinstance(r, dict):
            continue
        rec = {"f": r.get("f"), "a": r.get("a"), "base": r.get("base")}
        for hk in ("fh", "ah"):
            h = r.get(hk)
            if isinstance(h, list):
                rec[hk] = [[int(x[0]), round(float(x[1]), 3)] for x in h if isinstance(x, (list, tuple)) and len(x) == 2]
        out[str(k)] = rec
    return {"v": SCHEMA, "cfg": d.get("cfg"), "hist": out}


def prune(hist: dict[str, dict[str, Any]], today: date) -> None:
    """Tageswerte 400 Tage, Stundenkurven 30 Tage behalten."""
    for k in sorted(hist)[:-KEEP_DAYS]:
        hist.pop(k, None)
    cut = (today - timedelta(days=KEEP_HOURLY)).isoformat()
    for k, r in hist.items():
        if k < cut:
            r.pop("fh", None)
            r.pop("ah", None)


class SolarManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_solar")
        self.cfg = default_cfg()
        self.hist: dict[str, dict[str, Any]] = {}  # "2026-10-26": {f, a, base, fh, ah}
        self._cache: tuple[float, dict[str, Any]] | None = None
        self._wh: dict[Any, float] = {}            # F6: zuletzt abgerufene Prognose (Wh je Stunde)
        self._sites: list[str] = []
        self._via = ""                             # „energy“, „service“, „sensor“ oder ""
        self._fetched = 0.0
        self._fetch_err = ""
        self._act_h: tuple[float, dict[int, float]] | None = None
        self._unsub: CALLBACK_TYPE | None = None

    async def async_start(self) -> None:
        d = await self._store.async_load()
        if isinstance(d, dict):
            old = int(d.get("v") or 1) if str(d.get("v") or 1).isdigit() else 1
            d = upgrade(d)
            self.cfg = clean_cfg(d.get("cfg"))
            self.hist = d["hist"]
            if old < SCHEMA:
                _LOGGER.info("Solar-Prognose: Speicher von Version %s auf %s umgestellt (%s Tage übernommen)", old, SCHEMA, len(self.hist))
                self._save()
        self._unsub = async_track_time_interval(self.hass, self._tick, timedelta(seconds=TICK_SECONDS))
        self.hass.async_create_task(self._tick(None))

    def async_stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"v": SCHEMA, "cfg": self.cfg, "hist": self.hist}, 5)

    def active(self) -> bool:
        wm = self.hass.data.get(DOMAIN, {}).get("wasser")
        return bool(wm is not None and wm.modules.get("on", {}).get("sp"))

    # ---- F1 Quellen
    async def _via_energy(self) -> tuple[dict[Any, float], list[str]]:
        """Alle Integrationen mit Energie-Plattform „Solar-Prognose“ (Forecast.Solar, Solcast, Open-Meteo …), je geladenem Eintrag."""
        wh: dict[Any, float] = {}
        sites: list[str] = []
        try:
            from homeassistant.components.energy.websocket_api import async_get_energy_platforms
            platforms = await async_get_energy_platforms(self.hass)
        except Exception as err:  # noqa: BLE001 - Energie-Integration fehlt oder hat sich geändert: Rückfall
            _LOGGER.debug("Solar-Prognose: Energie-Plattformen nicht verfügbar: %s", err)
            return wh, sites
        for domain, fn in (platforms or {}).items():
            for e in self.hass.config_entries.async_entries(domain):
                if e.state is not ConfigEntryState.LOADED:
                    continue
                try:
                    r = await fn(self.hass, e.entry_id)
                except Exception as err:  # noqa: BLE001 - eine fehlerhafte Anlage stoppt die anderen nicht
                    _LOGGER.debug("Solar-Prognose: %s (%s): %s", domain, e.title, err)
                    continue
                part = (r or {}).get("wh_hours") if isinstance(r, dict) else None
                if not isinstance(part, dict) or not part:
                    continue
                for k, v in part.items():
                    try:
                        wh[k] = wh.get(k, 0.0) + float(v or 0)
                    except (TypeError, ValueError):
                        continue
                sites.append(re.sub(r"[<>\"'&]", "", str(e.title or domain))[:30])
        return wh, sites

    async def _via_service(self) -> tuple[dict[Any, float], list[str]]:
        """Bisheriger Weg (bis Build 3): Dienst forecast_solar.get_forecast je Anlage."""
        wh: dict[Any, float] = {}
        sites: list[str] = []
        if not self.hass.services.has_service("forecast_solar", "get_forecast"):
            return wh, sites
        for e in self.hass.config_entries.async_entries("forecast_solar"):
            try:
                resp = await self.hass.services.async_call(
                    "forecast_solar", "get_forecast", {"config_entry": e.entry_id, "resolution": "hourly"}, blocking=True, return_response=True)
            except Exception as err:  # noqa: BLE001
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

    async def _fetch(self, force: bool = False) -> None:
        """F6: Prognose abrufen, höchstens alle 30 Min. (Forecast.Solar erlaubt kostenlos nur wenige Abrufe pro Stunde)."""
        if not force and time.time() - self._fetched < (FETCH_SECONDS if self._wh else 300):
            return  # auch ohne Daten nicht öfter als alle 5 Min. versuchen
        wh: dict[Any, float] = {}
        sites: list[str] = []
        via = ""
        if self.cfg["src"] == "sensor":
            st = self.hass.states.get(self.cfg["fc_sensor"]) if self.cfg["fc_sensor"] else None
            if st is not None:
                wh, via = wh_from_state(dict(st.attributes)), "sensor"
        else:
            wh, sites = await self._via_energy()
            via = "energy" if wh else ""
            if not wh:
                wh, sites = await self._via_service()
                via = "service" if wh else ""
        self._fetched = time.time()
        if wh:
            self._wh, self._sites, self._via, self._fetch_err = wh, sites, via, ""
            self._cache = None
        else:
            self._fetch_err = "Keine Prognose gefunden" if not self._wh else "Letzter Abruf ohne Daten – zeige den vorherigen Stand"

    # ---- F2 Ertrag je Stunde aus der Langzeitstatistik
    async def _act_hours(self, day: date, tz: Any) -> dict[int, float] | None:
        eid = self.cfg["act"]
        st = self.hass.states.get(eid) if eid else None
        if st is None:
            return None
        k = UNIT_KWH.get(str(st.attributes.get("unit_of_measurement") or "kWh").strip(), 1.0)
        start = datetime.combine(day, datetime.min.time(), tzinfo=tz)
        end = min(start + timedelta(days=1), dt_util.now())
        try:
            from homeassistant.components.recorder import get_instance
            from homeassistant.components.recorder.statistics import statistics_during_period

            def job() -> dict[str, list[Any]]:
                return statistics_during_period(self.hass, dt_util.as_utc(start), dt_util.as_utc(end), {eid}, "hour", None, {"change"})

            r = await get_instance(self.hass).async_add_executor_job(job)
        except Exception:  # noqa: BLE001 - ohne Recorder oder ohne state_class gibt es keine Stundenwerte
            _LOGGER.debug("Solar-Prognose: Langzeitstatistik für %s nicht lesbar", eid, exc_info=True)
            return None
        out: dict[int, float] = {}
        for x in (r or {}).get(eid) or []:
            try:
                t = x["start"]
                t = datetime.fromtimestamp(t, tz) if isinstance(t, (int, float)) else (t if isinstance(t, datetime) else datetime.fromisoformat(str(t))).astimezone(tz)
                ch = x.get("change")
                if ch is not None:
                    out[t.hour] = round(max(0.0, float(ch) * k), 3)
            except (KeyError, TypeError, ValueError):
                continue
        return out or None

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

    # ---- Takt (alle 5 Min.)
    async def _tick(self, _now: Any) -> None:
        if not self.active():
            return
        now = dt_util.now()
        await self._fetch()
        today = now.date().isoformat()
        rec = self.hist.setdefault(today, {"f": None, "a": None, "base": None})
        if rec["f"] is None and now.hour >= 4 and self._wh:
            f = day_sums(self._wh, now.tzinfo, now.date())
            if f > 0:
                rec["f"] = f  # Prognose des Tages bleibt festgehalten, damit der Vergleich ehrlich bleibt
                rec["fh"] = hourly(self._wh, now.tzinfo, now.date())  # F3: ganze Kurve als Messlatte
        cur = self._actual_now()
        if cur is not None:
            if self.cfg["mode"] == "day":
                rec["a"] = round(cur, 1)
            else:
                if rec["base"] is None or cur < float(rec["base"]):
                    rec["base"] = cur if rec["base"] is None else 0.0
                rec["a"] = round(max(0.0, cur - float(rec["base"])), 1)
        # F2: Stundenwerte von gestern einmal festhalten (für Tage im Vergleich als Kurve)
        y = (now.date() - timedelta(days=1)).isoformat()
        yr = self.hist.get(y)
        if yr is not None and "ah" not in yr and self.cfg["act"] and now.hour >= 1:
            ah = await self._act_hours(now.date() - timedelta(days=1), now.tzinfo)
            yr["ah"] = [[h, v] for h, v in sorted((ah or {}).items())]
        prune(self.hist, now.date())
        self._save()

    # ---- Ansicht
    async def snapshot(self, force: bool = False) -> dict[str, Any]:
        ts = time.time()
        if self._cache and not force and ts - self._cache[0] < 120:
            return {**self._cache[1], "cfg": self.cfg}
        now = dt_util.now()
        if self.active() and (force or not self._wh):
            await self._fetch(force=force)
        wh = self._wh if self.active() else {}
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
        act_h = None
        if self.active() and self.cfg["act"]:
            if self._act_h and ts - self._act_h[0] < 300:
                act_h = self._act_h[1]
            else:
                act_h = await self._act_hours(d0, tz)
                self._act_h = (ts, act_h or {})
        out = {
            "found": bool(wh),
            "src": {"energy": "Energie-Schnittstelle", "service": "Forecast.Solar", "sensor": self.cfg["fc_sensor"] or "–"}.get(self._via, "–"),
            "via": self._via, "sites": self._sites, "fetched": round(self._fetched) if self._fetched else None, "fetch_err": self._fetch_err,
            "today": day_sums(wh, tz, d0), "tomorrow": day_sums(wh, tz, d1),
            "today_f": rec.get("f"), "got": rec.get("a"), "has_act": bool(self.cfg["act"]),
            "hours": hrs0, "hours_tm": hourly(wh, tz, d1), "hours_f": rec.get("fh"),
            "act_h": [[h, v] for h, v in sorted(act_h.items())] if act_h else None,
            "best": best_window(hrs0 if now.hour < 16 else hourly(wh, tz, d1)),
            "best_day": "today" if now.hour < 16 else "tomorrow",
            "hist": hist, "dev": deviation(hist), "now_h": now.hour, "days": len(self.hist), "schema": SCHEMA,
        }
        self._cache = (ts, out)
        return {**out, "cfg": self.cfg}

    async def async_set(self, raw: Any) -> dict[str, Any]:
        old = dict(self.cfg)
        self.cfg = clean_cfg({**self.cfg, **raw} if isinstance(raw, dict) else raw)  # fehlende Felder (alter Browser) behalten ihren Stand
        self._save()
        if (old["src"], old["fc_sensor"]) != (self.cfg["src"], self.cfg["fc_sensor"]):
            self._wh = {}  # neue Quelle: sofort neu abrufen
        if old["act"] != self.cfg["act"]:
            self._act_h = None
        return await self.snapshot(force=True)
