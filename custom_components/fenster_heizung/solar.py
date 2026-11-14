"""Modul 16 – Solar-Prognose: Ertrag heute und morgen gegen den tatsächlichen Ertrag.

Stufe 2 (v0.9 Build 4, Konzept F1–F4, F6):
- F1 Quelle: über die Energie-Plattformen von Home Assistant (dieselbe Schnittstelle wie das Energie-Dashboard) – Forecast.Solar,
  Solcast, Open-Meteo Solar Forecast und jede andere Integration mit Solar-Prognose. Rückfall: Dienst forecast_solar.get_forecast.
  Eigener Sensor: Attribut wh_period (Wh je Stunde) oder detailedForecast/detailedHourly (Solcast, kW je Zeitraum).
- F2 Ertrag je Stunde aus der Langzeitstatistik des Ertragssensors (Änderung je Stunde), heute live und für abgeschlossene Tage gespeichert.
- F3 Schnappschuss: ab 4 Uhr wird die ganze Stundenkurve des Tages festgehalten (Messlatte), nicht nur die Tagessumme.
- F4 Speicher mit Schema-Version: 400 Tage Tageswerte, 30 Tage Stundenkurven; alte Stände werden umgewandelt.
- F6 Abruf nur im Hintergrund alle 30 Minuten; die Ansicht liest den Zwischenspeicher.

Stufe 4 (v1.0, Konzept E2, E6/F7):
- E2 Anlagen einzeln: Tagessummen je Anlage (Forecast.Solar-Dächer, Solcast-Standorte …).
- E6/F7 Werte für Home Assistant: values() liefert Prognose heute, morgen, Rest heute, korrigiert und Beginn der besten Zeit;
  sensor.py stellt sie als eigenes Gerät „Strom & Wärme · Solar-Prognose“ bereit (Signal SIGNAL_SOLAR).
"""
from __future__ import annotations

import logging
import re
import time
from datetime import date, datetime, timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_time_interval
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
SIGNAL_SOLAR = f"{DOMAIN}_solar_update"


def default_cfg() -> dict[str, Any]:
    return {"src": "forecast", "fc_sensor": "", "act": "", "mode": "day", "look": "new", "corr": True, "sites": [], "since": ""}


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
        if "corr" in raw:  # v0.9 Build 5: korrigierte Prognose an/aus
            d["corr"] = raw.get("corr") is not False
        # v1.0 Build 2: gewählte Anlagen (Config-Entry-IDs); leer = automatisch (wie im Energie-Dashboard, sonst alle)
        if isinstance(raw.get("sites"), list):
            d["sites"] = [str(x)[:64] for x in raw["sites"] if isinstance(x, str) and re.match(r"^[A-Za-z0-9_]+$", x)][:30]
        v = str(raw.get("since") or "")
        d["since"] = v if re.match(r"^\d{4}-\d{2}-\d{2}$", v) else ""
    return d


CORR_DAYS = 14   # F5: so viele gültige Tage fließen in die Korrektur ein
CORR_MIN = 7     # erst ab so vielen Tagen
CORR_LIM = (0.6, 1.4)


def correction(hist: dict[str, dict[str, Any]], today: date, since: str = "") -> tuple[float | None, int]:
    """F5/E1: Median von Ertrag/Prognose der letzten gültigen Tage (ohne heute). Median, damit ein Schneetag den Faktor nicht verzieht.
    since: erster Tag mit der aktuellen Anlagen-Auswahl – ältere Tage wurden mit einer anderen Summe verglichen und zählen nicht."""
    q = []
    for k in sorted(hist, reverse=True):
        if k >= today.isoformat() or (since and k < since):
            continue
        r = hist[k]
        f, a = r.get("f"), r.get("a")
        if f is None or a is None or f < 0.5:
            continue
        q.append(float(a) / float(f))
        if len(q) >= CORR_DAYS:
            break
    if len(q) < CORR_MIN:
        return None, len(q)
    q.sort()
    m = q[len(q) // 2] if len(q) % 2 else (q[len(q) // 2 - 1] + q[len(q) // 2]) / 2
    return round(min(max(m, CORR_LIM[0]), CORR_LIM[1]), 3), len(q)


def low_yield(act: dict[int, float] | None, fc: list[list[Any]] | None, now_h: int) -> dict[str, Any] | None:
    """E5: Ertrag in den letzten beiden vollen Stunden unter 30 % der Prognose, obwohl mindestens 0,4 kWh erwartet waren."""
    if not act or not fc:
        return None
    byh = {int(h): float(v) for h, v in fc}
    hrs = [now_h - 2, now_h - 1]
    f = sum(byh.get(h, 0.0) for h in hrs)
    a = sum(float(act.get(h, 0.0)) for h in hrs)
    if f < 0.4 or a >= 0.3 * f:
        return None
    return {"from": hrs[0], "to": now_h, "f": round(f, 2), "a": round(a, 2), "pct": round(a / f * 100)}


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


def rest_today(rows: list[list[Any]], now: datetime) -> float:
    """Noch zu erwartender Ertrag heute (kWh): kommende Stunden plus der Rest der laufenden Stunde."""
    tot = 0.0
    for h, v in rows:
        if h > now.hour:
            tot += float(v)
        elif h == now.hour:
            tot += float(v) * max(0.0, 1 - now.minute / 60)
    return round(tot, 1)


SVC = {"forecast_solar": "Forecast.Solar", "solcast_solar": "Solcast", "open_meteo_solar_forecast": "Open-Meteo", "solarprognose": "Solarprognose"}


def pick_sites(cands: list[dict[str, Any]], manual: list[str], energy: list[str]) -> tuple[set[str], str]:
    """Welche Anlagen addiert werden: von Hand gewählt, sonst wie im Energie-Dashboard, sonst alle.
    Mehrere Dienste für dasselbe Dach (z. B. Forecast.Solar und Solcast) würden sonst doppelt gezählt."""
    ids = {c["id"] for c in cands}
    m = [x for x in manual if x in ids]
    if m:
        return set(m), "manual"
    e = [x for x in energy if x in ids]
    if e:
        return set(e), "energy"
    return ids, "all"


def site_name(title: Any, fallback: str, used: list[str]) -> str:
    n = re.sub(r"[<>\"'&]", "", str(title or fallback))[:30] or fallback
    if n not in used:
        return n
    i = 2
    while f"{n} {i}" in used:
        i += 1
    return f"{n} {i}"


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
        self._per: list[tuple[str, dict[Any, float]]] = []      # E2: Prognose je Anlage
        self._per_new: list[tuple[str, dict[Any, float]]] = []
        self._cands: list[dict[str, Any]] = []                  # alle gefundenen Anlagen (auch nicht gewählte)
        self._cands_new: list[dict[str, Any]] = []
        self._mode = ""                                          # manual | energy | all
        self._mode_new = ""
        self._eids: list[str] = []
        self._cfull: list[dict[str, Any]] = []                 # gefundene Anlagen mit Stundenwerten (für neue Auswahl ohne neuen Abruf)
        self._cfull_new: list[dict[str, Any]] = []
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
    async def _energy_ids(self) -> list[str]:
        """Prognose-Einträge, die im Energie-Dashboard bei „Solar“ eingetragen sind."""
        try:
            from homeassistant.components.energy.data import async_get_manager
            mgr = await async_get_manager(self.hass)
            prefs = mgr.data or {}
        except Exception:  # noqa: BLE001 - ohne Energie-Dashboard gibt es keine Vorgabe
            return []
        return [str(i) for s in prefs.get("energy_sources") or [] if s.get("type") == "solar" for i in (s.get("config_entry_solar_forecast") or [])]

    def _sum_sites(self, cands: list[dict[str, Any]], tz: Any) -> tuple[dict[Any, float], list[str]]:
        """Auswahl anwenden und die gewählten Anlagen addieren. Merkt sich alle gefundenen Anlagen für die Einstellungen."""
        sel, mode = pick_sites(cands, self.cfg.get("sites") or [], self._eids)
        wh: dict[Any, float] = {}
        sites: list[str] = []
        self._per_new = []
        d0 = dt_util.now().date()
        for c in cands:
            c["on"] = c["id"] in sel
            c["t"], c["m"] = day_sums(c["wh"], tz, d0), day_sums(c["wh"], tz, d0 + timedelta(days=1))
            if not c["on"]:
                continue
            for k, v in c["wh"].items():
                wh[k] = wh.get(k, 0.0) + v
            sites.append(c["n"])
            self._per_new.append((c["n"], c["wh"], c["dom"]))
        self._cands_new = [{k: c[k] for k in ("id", "n", "dom", "on", "t", "m")} for c in cands]
        self._cfull_new = cands
        self._mode_new = mode
        return wh, sites

    async def _via_energy(self) -> tuple[dict[Any, float], list[str]]:
        """Alle Integrationen mit Energie-Plattform „Solar-Prognose“ (Forecast.Solar, Solcast, Open-Meteo …), je geladenem Eintrag."""
        cands: list[dict[str, Any]] = []
        try:
            from homeassistant.components.energy.websocket_api import async_get_energy_platforms
            platforms = await async_get_energy_platforms(self.hass)
        except Exception as err:  # noqa: BLE001 - Energie-Integration fehlt oder hat sich geändert: Rückfall
            _LOGGER.debug("Solar-Prognose: Energie-Plattformen nicht verfügbar: %s", err)
            return {}, []
        used: list[str] = []
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
                one: dict[Any, float] = {}
                for k, v in part.items():
                    try:
                        one[k] = float(v or 0)
                    except (TypeError, ValueError):
                        continue
                n = site_name(e.title, domain, used)
                used.append(n)
                cands.append({"id": e.entry_id, "n": n, "dom": domain, "wh": one})
        self._eids = await self._energy_ids()
        return self._sum_sites(cands, dt_util.now().tzinfo)

    async def _via_service(self) -> tuple[dict[Any, float], list[str]]:
        """Bisheriger Weg (bis Build 3): Dienst forecast_solar.get_forecast je Anlage."""
        cands: list[dict[str, Any]] = []
        used: list[str] = []
        if not self.hass.services.has_service("forecast_solar", "get_forecast"):
            return {}, []
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
            one: dict[Any, float] = {}
            for k, v in part.items():
                try:
                    one[k] = float(v or 0)
                except (TypeError, ValueError):
                    continue
            n = site_name(e.title, "Anlage", used)
            used.append(n)
            cands.append({"id": e.entry_id, "n": n, "dom": "forecast_solar", "wh": one})
        self._eids = await self._energy_ids()
        return self._sum_sites(cands, dt_util.now().tzinfo)

    async def _fetch(self, force: bool = False) -> None:
        """F6: Prognose abrufen, höchstens alle 30 Min. (Forecast.Solar erlaubt kostenlos nur wenige Abrufe pro Stunde)."""
        if not force and time.time() - self._fetched < (FETCH_SECONDS if self._wh else 300):
            return  # auch ohne Daten nicht öfter als alle 5 Min. versuchen
        wh: dict[Any, float] = {}
        sites: list[str] = []
        via = ""
        self._per_new, self._cands_new, self._mode_new = [], [], ""
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
            self._per = self._per_new if len(self._per_new) > 1 else []
            self._cands, self._mode, self._cfull = self._cands_new, self._mode_new, self._cfull_new
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
        async_dispatcher_send(self.hass, SIGNAL_SOLAR)

    # ---- E6/F7 Werte für die Sensoren (ohne Abruf, nur aus dem Zwischenspeicher)
    def values(self) -> dict[str, Any]:
        if not self.active() or not self._wh:
            return {"ok": False}
        now = dt_util.now()
        tz, d0 = now.tzinfo, now.date()
        rows0 = hourly(self._wh, tz, d0)
        today = day_sums(self._wh, tz, d0)
        corr, n = correction(self.hist, d0, self.cfg.get("since") or "")
        use = corr if (corr is not None and self.cfg.get("corr", True)) else None
        rest = rest_today(rows0, now)
        bd = d0 if now.hour < 16 else d0 + timedelta(days=1)
        bw = best_window(rows0 if now.hour < 16 else hourly(self._wh, tz, bd))
        best_at = None
        if bw:
            t = datetime.combine(bd, datetime.min.time(), tzinfo=tz) + timedelta(hours=bw["from"])
            best_at = t if t + timedelta(hours=3) > now else None
        return {
            "ok": True, "today": today, "tomorrow": day_sums(self._wh, tz, d0 + timedelta(days=1)),
            "rest": rest, "corr_today": round(today * use, 1) if use is not None else today,
            "corr": use, "corr_n": n, "best_at": best_at, "best": bw, "src": self._via,
            "sites": [p[0] for p in self._per] or self._sites, "fetched": self._fetched,
            "got": (self.hist.get(d0.isoformat()) or {}).get("a"),
        }

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
        hist30 = []
        for i in range(30, 0, -1):  # D1/D2: bis zu 30 Tage, mit Stundenkurven für „Tag als Kurve“
            k = (d0 - timedelta(days=i)).isoformat()
            r = self.hist.get(k)
            if r and r.get("f") is not None:
                x = {"d": k, "f": r["f"], "a": r.get("a")}
                if r.get("fh"):
                    x["fh"] = r["fh"]
                if r.get("ah"):
                    x["ah"] = r["ah"]
                hist30.append(x)
                if i <= 7:
                    hist.append({"d": k, "f": r["f"], "a": r.get("a")})
        corr, corr_n = correction(self.hist, d0, self.cfg.get("since") or "")
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
            "hist": hist, "hist30": hist30, "dev": deviation(hist), "now_h": now.hour, "days": len(self.hist), "schema": SCHEMA,
            "corr": corr if self.cfg.get("corr", True) else None, "corr_raw": corr, "corr_n": corr_n,
            "low": low_yield(act_h, rec.get("fh") or hrs0, now.hour) if now.hour >= 9 else None,
            "rest": rest_today(hrs0, now),
            "site_sums": [{"n": p[0], "dom": p[2], "svc": SVC.get(p[2], p[2]), "t": day_sums(p[1], tz, d0), "m": day_sums(p[1], tz, d1), "h": hourly(p[1], tz, d0)} for p in self._per] if self.active() else [],
            # v1.0 Build 2: alle gefundenen Anlagen mit Auswahl, Art der Auswahl und Warnung bei mehreren Diensten
            "cands": [{**c, "svc": SVC.get(c["dom"], c["dom"])} for c in self._cands] if self.active() else [],
            "sel_mode": self._mode, "energy_ids": self._eids, "since": self.cfg.get("since") or "",
            "dup": len({c["dom"] for c in self._cands if c.get("on")}) > 1,
        }
        self._cache = (ts, out)
        return {**out, "cfg": self.cfg}

    async def async_set(self, raw: Any) -> dict[str, Any]:
        old = dict(self.cfg)
        self.cfg = clean_cfg({**self.cfg, **raw} if isinstance(raw, dict) else raw)  # fehlende Felder (alter Browser) behalten ihren Stand
        if (old["src"], old["fc_sensor"], sorted(old.get("sites") or [])) != (self.cfg["src"], self.cfg["fc_sensor"], sorted(self.cfg["sites"])):
            # Andere Quelle oder andere Anlagen: Summe ändert sich. Korrektur lernt ab heute neu, Prognose von heute wird neu festgehalten.
            today = dt_util.now().date()
            self.cfg["since"] = today.isoformat()
            rec = self.hist.get(today.isoformat())
            if rec is not None:
                rec["f"] = None
                rec.pop("fh", None)
            self._cache = None
            if (old["src"], old["fc_sensor"]) == (self.cfg["src"], self.cfg["fc_sensor"]) and self._cfull:
                # nur andere Anlagen: aus den vorhandenen Stundenwerten neu addieren, ohne neuen Abruf (Forecast.Solar zählt Abrufe)
                wh, sites = self._sum_sites(self._cfull, dt_util.now().tzinfo)
                self._wh, self._sites = wh, sites
                self._per = self._per_new if len(self._per_new) > 1 else []
                self._cands, self._mode, self._cfull = self._cands_new, self._mode_new, self._cfull_new
            else:
                self._wh = {}
                self._fetched = 0.0
        self._save()
        if old["act"] != self.cfg["act"]:
            self._act_h = None
        out = await self.snapshot(force=not self._wh)
        if self.cfg.get("since") != old.get("since") and self._wh:
            await self._tick(None)        # Prognose von heute mit der neuen Auswahl festhalten
            self._cache = None
            out = await self.snapshot()
        async_dispatcher_send(self.hass, SIGNAL_SOLAR)
        return out
