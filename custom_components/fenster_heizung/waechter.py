"""Sponsor Max 2: Wächter (M4) und Woche voraus (M5).

Wächter: lernt aus den eigenen Daten, was „normal“ ist, und meldet Abweichungen – feste Regeln, keine KI:
  dev   – ein Gerät aus Modul 4 brauchte gestern deutlich mehr als an den letzten (bis zu) 4 gleichen Wochentagen
  pv    – die PV lieferte gestern deutlich weniger als die Prognose aus Modul 16
  inv   – die PV liefert tagsüber bei Sonne seit 30 Minuten nichts (Wechselrichter still?)
  win   – nachts (0–5 Uhr) ist ein Fenster seit über einer Stunde offen, draußen unter 10 °C
Jeder Fund lässt sich 7 Tage ignorieren; optional Meldung aufs Handy, die Funde stehen auch im Morgen-Briefing.

Woche voraus: 7 Tage Sonne (Prognose aus Modul 16 für heute/morgen, danach aus der Bewölkung des Wetterberichts
geschätzt), Wetter, Preisniveau (Tibber, soweit bekannt) und Heizbedarf – mit Empfehlungen (bester Waschtag,
Akku vor trüben Tagen voll halten, Auto am Sonnentag laden). Nur mit Max-Schlüssel (oder Entwickler-Zugang).
Rechnet nur in Home Assistant, nichts wird gesendet außer den eigenen Meldungen.
"""
from __future__ import annotations

import logging
import re
import time
from datetime import date, datetime, timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.event import async_track_time_change, async_track_time_interval
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

DEV_PCT = 30.0        # ab so viel Prozent mehr als normal
DEV_MIN_KWH = 0.15    # und mindestens so viel kWh mehr
PV_PCT = 30.0         # PV so viel Prozent unter der Prognose
PV_MIN_F = 3.0        # nur bei einer Prognose ab 3 kWh
INV_MIN = 30          # Minuten ohne PV-Leistung bei Sonne
WIN_MIN = 60          # Minuten offen in der Nacht
IGNORE_DAYS = 7
_NOTIFY = re.compile(r"^notify\.[a-z0-9_]+$")
DAYN = ("Mo", "Di", "Mi", "Do", "Fr", "Sa", "So")
CLOUD = {"sunny": 10, "clear-night": 10, "partlycloudy": 45, "windy": 40, "windy-variant": 55, "cloudy": 80, "fog": 85,
         "rainy": 90, "pouring": 95, "snowy": 90, "snowy-rainy": 92, "hail": 90, "lightning": 85, "lightning-rainy": 92, "exceptional": 70}


def _n(v: float, d: int = 0) -> str:
    return f"{v:.{d}f}".replace(".", ",")


def clean_cfg(raw: Any) -> dict[str, Any]:
    r = raw if isinstance(raw, dict) else {}
    ign = r.get("ignore") if isinstance(r.get("ignore"), dict) else {}
    return {
        "on": r.get("on") is not False,
        "notify": list(dict.fromkeys(n for n in (r.get("notify") or []) if isinstance(n, str) and _NOTIFY.match(n)))[:6],
        "rules": {k: (r.get("rules") or {}).get(k) is not False for k in ("dev", "pv", "inv", "win")} if isinstance(r.get("rules"), dict) else {k: True for k in ("dev", "pv", "inv", "win")},
        "ignore": {str(k)[:80]: float(v) for k, v in ign.items() if isinstance(v, (int, float))},
    }


def dev_findings(days: dict[str, dict[str, list[float]]], names: dict[str, str], day: date, price: float) -> list[dict[str, Any]]:
    """Geräte, die am Tag `day` deutlich mehr brauchten als an den (bis zu) 4 gleichen Wochentagen davor."""
    out = []
    k0 = day.isoformat()
    for did, name in names.items():
        row = (days.get(k0) or {}).get(did)
        if not row:
            continue
        cur = row[0] + row[1] + row[2]
        ref = [sum((days.get((day - timedelta(days=7 * w)).isoformat()) or {}).get(did, [0, 0, 0])[:3]) for w in range(1, 5)]
        ref = [x for x in ref if x > 0]
        if len(ref) < 3:
            continue
        avg = sum(ref) / len(ref)
        if avg <= 0:
            continue
        pct = (cur - avg) / avg * 100
        if pct >= DEV_PCT and cur - avg >= DEV_MIN_KWH:
            eur = (cur - avg) * price
            out.append({"k": f"dev:{did}", "kind": "dev", "t": f"{name} brauchte {DAYN[day.weekday()]} +{_n(pct)} % ({_n(cur - avg, 2)} kWh mehr als sonst" + (f", ≈ {_n(eur, 2)} €)" if eur >= 0.01 else ")"),
                        "eur": round(eur, 2), "pct": round(pct)})
    return out


def pv_finding(hist: dict[str, dict[str, Any]], day: date) -> dict[str, Any] | None:
    r = hist.get(day.isoformat()) or {}
    f, a = r.get("f"), r.get("a")
    if not f or a is None or f < PV_MIN_F:
        return None
    pct = (a - f) / f * 100
    if pct > -PV_PCT:
        return None
    return {"k": f"pv:{day.isoformat()}", "kind": "pv", "t": f"PV lieferte {DAYN[day.weekday()]} {_n(-pct)} % weniger als die Prognose ({_n(a, 1)} statt {_n(f, 1)} kWh)", "eur": 0, "pct": round(pct)}


def sun_pct(cond: str | None, cloud: float | None) -> float:
    """0–1: wie sonnig ein Tag wird (aus Bewölkung, sonst aus dem Wetterzustand)."""
    c = cloud if isinstance(cloud, (int, float)) else CLOUD.get(str(cond or ""), 60)
    return max(0.05, min(1.0, 1 - 0.85 * float(c) / 100))


def week_tips(days: list[dict[str, Any]], has_bat: bool, has_car: bool) -> list[str]:
    tips = []
    sol = [d for d in days if d.get("kwh") is not None]
    if sol:
        best = max(sol, key=lambda d: d["kwh"])
        if best["kwh"] > 0:
            tips.append(f"Bester Waschtag: {best['dn']} ({'≈ ' if best.get('est') else ''}{_n(best['kwh'])} kWh Sonne)")
        if has_car and best["kwh"] > 0:
            tips.append(f"Auto am {best['dn']} mit Sonne laden")
        if has_bat:
            ref = max(d["kwh"] for d in sol) or 1
            for i in range(1, len(sol)):
                if sol[i]["kwh"] < 0.35 * ref and sol[i - 1]["kwh"] >= 0.5 * ref:
                    tips.append(f"{sol[i]['dn']} wenig Sonne: Akku am {sol[i - 1]['dn']} abends voll halten")
                    break
    cold = [d for d in days if d.get("heat") == "hoch"]
    if cold:
        tips.append(f"Hoher Heizbedarf: {', '.join(d['dn'] for d in cold[:3])}")
    return tips[:4]


class WaechterManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_waechter")
        self.cfg = clean_cfg({})
        self.found: list[dict[str, Any]] = []      # Funde des Tages (Gerät, PV)
        self.live: dict[str, dict[str, Any]] = {}  # laufende Funde (Wechselrichter, Fenster)
        self._since: dict[str, float] = {}
        self._sent: dict[str, float] = {}
        self._unsubs: list[CALLBACK_TYPE] = []
        self._week: tuple[float, dict[str, Any]] | None = None

    async def async_start(self) -> None:
        d = await self._store.async_load() or {}
        self.cfg = clean_cfg(d.get("cfg"))
        self.found = [x for x in (d.get("found") or []) if isinstance(x, dict) and "k" in x][:20]
        self._sent = {str(k): float(v) for k, v in (d.get("sent") or {}).items() if isinstance(v, (int, float))}
        self._unsubs.append(async_track_time_change(self.hass, self._daily, hour=6, minute=5, second=0))
        self._unsubs.append(async_track_time_interval(self.hass, self._tick, timedelta(minutes=5)))
        if not self.found or str(d.get("day") or "") != dt_util.now().date().isoformat():
            self.hass.async_create_task(self._daily(None))

    def async_stop(self) -> None:
        for u in self._unsubs:
            try:
                u()
            except Exception:  # noqa: BLE001
                pass
        self._unsubs.clear()

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"cfg": self.cfg, "found": self.found, "sent": self._sent, "day": dt_util.now().date().isoformat()}, 5)

    def allowed(self) -> bool:
        sm = self.hass.data.get(DOMAIN, {}).get("sponsor")
        try:
            return bool(sm and sm.is_max())
        except Exception:  # noqa: BLE001
            return False

    def _price(self) -> float:
        gm = self.hass.data.get(DOMAIN, {}).get("geraete")
        gen = self.hass.data.get(DOMAIN, {}).get("general")
        pvc = (gen.data.get("pv") if gen is not None else None) or {}
        try:
            return gm._price(pvc, "price_mode", "price_sensor", "price") if gm is not None else float(pvc.get("price") or 0) / 100  # noqa: SLF001
        except Exception:  # noqa: BLE001
            return 0.0

    # ---- Regeln
    async def _daily(self, _now: Any) -> None:
        if not self.allowed() or not self.cfg["on"]:
            return
        D = self.hass.data.get(DOMAIN, {})
        y = dt_util.now().date() - timedelta(days=1)
        out: list[dict[str, Any]] = []
        gm = D.get("geraete")
        if gm is not None and self.cfg["rules"]["dev"]:
            names = {d["id"]: d["name"] for d in (gm._cfg().get("devices") or [])}  # noqa: SLF001
            out += dev_findings(gm.days or {}, names, y, self._price())
        sm = D.get("solar")
        if sm is not None and self.cfg["rules"]["pv"]:
            f = pv_finding(getattr(sm, "hist", {}) or {}, y)
            if f:
                out.append(f)
        ts = time.time()
        for f in out:
            f["ts"] = ts
        self.found = out
        self._save()
        await self._notify_new(out)

    def _pv_w(self) -> float | None:
        wm = self.hass.data.get(DOMAIN, {}).get("wasser")
        ent = (((wm.modules if wm is not None else {}) or {}).get("energy") or {}).get("ent") or {}
        eid = ent.get("pv")
        st = self.hass.states.get(eid) if eid else None
        if st is None or st.state in ("unknown", "unavailable"):
            return None
        try:
            v = float(st.state)
        except (TypeError, ValueError):
            return None
        return v * 1000 if str(st.attributes.get("unit_of_measurement") or "") == "kW" else v

    async def _tick(self, _now: Any) -> None:
        if not self.allowed() or not self.cfg["on"]:
            self.live = {}
            return
        now, ts = dt_util.now(), time.time()
        live: dict[str, dict[str, Any]] = {}
        # Wechselrichter still: Sonne hoch, Prognose für heute nennenswert, aber 0 W
        if self.cfg["rules"]["inv"]:
            sun = self.hass.states.get("sun.sun")
            elev = float(sun.attributes.get("elevation") or 0) if sun is not None else 0.0
            sm = self.hass.data.get(DOMAIN, {}).get("solar")
            f_today = ((getattr(sm, "hist", {}) or {}).get(now.date().isoformat()) or {}).get("f") if sm is not None else None
            w = self._pv_w()
            bad = w is not None and w < 5 and elev > 20 and (f_today is None or f_today >= 2)
            k = f"inv:{now.date().isoformat()}"
            if bad:
                self._since.setdefault(k, ts)
                if ts - self._since[k] >= INV_MIN * 60:
                    live[k] = {"k": k, "kind": "inv", "t": f"PV liefert seit {round((ts - self._since[k]) / 60)} Min. nichts, obwohl die Sonne hoch steht. Wechselrichter aus oder ohne Verbindung?", "eur": 0, "ts": self._since[k]}
            else:
                self._since.pop(k, None)
        # Fenster nachts offen
        if self.cfg["rules"]["win"] and now.hour < 5:
            for entry in self.hass.config_entries.async_entries(DOMAIN):
                ctrl = getattr(entry, "runtime_data", None)
                if ctrl is None or entry.state is not ConfigEntryState.LOADED:
                    continue
                k = f"win:{entry.entry_id}:{now.date().isoformat()}"
                try:
                    op, out_t = ctrl.window_open(), ctrl._outdoor_now()  # noqa: SLF001
                except Exception:  # noqa: BLE001
                    continue
                if op and (out_t is None or out_t < 10):
                    self._since.setdefault(k, ts)
                    if ts - self._since[k] >= WIN_MIN * 60:
                        live[k] = {"k": k, "kind": "win", "t": f"{entry.title}: Fenster seit {round((ts - self._since[k]) / 60)} Min. offen in der Nacht" + (f" bei {_n(out_t, 1)} °C draußen" if out_t is not None else ""), "eur": 0, "ts": self._since[k]}
                else:
                    self._since.pop(k, None)
        new = [v for k, v in live.items() if k not in self.live]
        self.live = live
        if new:
            await self._notify_new(new)

    @staticmethod
    def _base(k: str) -> str:
        """Ignorieren gilt für das Gerät bzw. den Raum (dev:…, win:…) oder die ganze Regel (pv, inv)."""
        return ":".join(k.split(":")[:2]) if k.startswith(("dev:", "win:")) else k.split(":")[0]

    def _ignored(self, k: str) -> bool:
        u = self.cfg["ignore"].get(self._base(k))
        return bool(u and u > time.time())

    def findings(self) -> list[dict[str, Any]]:
        if not self.allowed() or not self.cfg["on"]:
            return []
        return [f for f in [*self.live.values(), *self.found] if not self._ignored(f["k"])]

    async def _notify_new(self, items: list[dict[str, Any]]) -> None:
        for f in items:
            if self._ignored(f["k"]) or f["k"] in self._sent:
                continue
            self._sent[f["k"]] = time.time()
            for svc in self.cfg["notify"]:
                dom, name = svc.split(".", 1)
                if self.hass.services.has_service(dom, name):
                    try:
                        await self.hass.services.async_call(dom, name, {"title": "🛡️ Wächter", "message": f["t"]}, blocking=False)
                    except Exception as err:  # noqa: BLE001
                        _LOGGER.warning("Wächter-Meldung über %s fehlgeschlagen: %s", svc, err)
        cut = time.time() - 14 * 86400
        self._sent = {k: v for k, v in self._sent.items() if v > cut}
        self._save()

    async def async_set(self, raw: Any) -> dict[str, Any]:
        r = raw if isinstance(raw, dict) else {}
        cfg = clean_cfg({**self.cfg, **r})
        if isinstance(r.get("ign"), str):  # „Ignorieren für 7 Tage“: gilt für dieses Gerät/diese Regel
            cfg["ignore"][self._base(r["ign"][:80])] = time.time() + IGNORE_DAYS * 86400
        cfg["ignore"] = {k: v for k, v in cfg["ignore"].items() if v > time.time()}
        self.cfg = cfg
        self._save()
        if r.get("run"):
            await self._daily(None)
            await self._tick(None)
        return await self.snapshot()

    # ---- M5 Woche voraus
    async def _daily_fc(self) -> list[dict[str, Any]]:
        wm = self.hass.data.get(DOMAIN, {}).get("wetter")
        ent = wm.weather_entity() if wm is not None else ""
        if not ent:
            ids = sorted(s.entity_id for s in self.hass.states.async_all("weather"))
            ent = ids[0] if ids else ""
        if not ent:
            return []
        try:
            res = await self.hass.services.async_call("weather", "get_forecasts", {"type": "daily"}, target={"entity_id": ent}, blocking=True, return_response=True)
            return list(((res or {}).get(ent) or {}).get("forecast") or [])
        except Exception:  # noqa: BLE001 - kein Tageswetter: aus Stundenwerten
            try:
                res = await self.hass.services.async_call("weather", "get_forecasts", {"type": "hourly"}, target={"entity_id": ent}, blocking=True, return_response=True)
                rows = list(((res or {}).get(ent) or {}).get("forecast") or [])
            except Exception:  # noqa: BLE001
                return []
            by: dict[str, dict[str, Any]] = {}
            for r in rows:
                try:
                    t = dt_util.as_local(datetime.fromisoformat(str(r.get("datetime"))))
                except (TypeError, ValueError):
                    continue
                d = by.setdefault(t.date().isoformat(), {"datetime": t.date().isoformat(), "temps": [], "clouds": [], "cond": {}})
                if isinstance(r.get("temperature"), (int, float)):
                    d["temps"].append(r["temperature"])
                if isinstance(r.get("cloud_coverage"), (int, float)) and 8 <= t.hour <= 17:
                    d["clouds"].append(r["cloud_coverage"])
                if 8 <= t.hour <= 17:
                    d["cond"][r.get("condition")] = d["cond"].get(r.get("condition"), 0) + 1
            return [{"datetime": k, "temperature": max(v["temps"]) if v["temps"] else None, "templow": min(v["temps"]) if v["temps"] else None,
                     "cloud_coverage": sum(v["clouds"]) / len(v["clouds"]) if v["clouds"] else None,
                     "condition": max(v["cond"], key=v["cond"].get) if v["cond"] else None} for k, v in sorted(by.items())]

    async def week(self, force: bool = False) -> dict[str, Any]:
        if self._week and not force and time.time() - self._week[0] < 1800:
            return self._week[1]
        D = self.hass.data.get(DOMAIN, {})
        now = dt_util.now()
        today = now.date()
        fc = await self._daily_fc()
        # Sonne heute und morgen aus Modul 16, danach aus dem Wetter geschätzt (Bezug: dein bester Tag der letzten 30 Tage)
        sm, sol, ref = D.get("solar"), {}, None
        if sm is not None:
            try:
                from .solar import day_sums
                wh, _s = await sm._wh()  # noqa: SLF001
                for i in range(2):
                    v = day_sums(wh, now.tzinfo, today + timedelta(days=i))
                    if v > 0:
                        sol[(today + timedelta(days=i)).isoformat()] = v
                acts = [r.get("a") for r in (getattr(sm, "hist", {}) or {}).values() if isinstance(r.get("a"), (int, float))]
                fcs = [r.get("f") for r in (getattr(sm, "hist", {}) or {}).values() if isinstance(r.get("f"), (int, float))]
                ref = max(acts + fcs) if (acts or fcs) else None
            except Exception:  # noqa: BLE001
                _LOGGER.debug("Woche voraus: Solar nicht lesbar", exc_info=True)
        if not ref and sol:
            ref = max(sol.values())
        # Preisniveau aus Tibber (so weit bekannt: heute, morgen)
        lvl: dict[str, str] = {}
        tm = D.get("tibber")
        if tm is not None and getattr(tm, "connected", False):
            try:
                c = await tm.async_prices()
                by: dict[str, list[float]] = {}
                for p in (c or {}).get("prices") or []:
                    by.setdefault(p["start"].astimezone(now.tzinfo).date().isoformat(), []).append(p["ct"])
                allp = [x for v in by.values() for x in v]
                if allp:
                    avg = sum(allp) / len(allp)
                    for k, v in by.items():
                        m = sum(v) / len(v)
                        lvl[k] = "günstig" if m < avg * 0.93 else "teuer" if m > avg * 1.07 else "normal"
            except Exception:  # noqa: BLE001
                pass
        days = []
        for r in fc:
            try:
                d = date.fromisoformat(str(r.get("datetime"))[:10]) if len(str(r.get("datetime"))) == 10 else dt_util.as_local(datetime.fromisoformat(str(r.get("datetime")))).date()
            except (TypeError, ValueError):
                continue
            if d < today or len(days) >= 7 or any(x["d"] == d.isoformat() for x in days):
                continue
            hi, lo = r.get("temperature"), r.get("templow")
            mean = (hi + lo) / 2 if isinstance(hi, (int, float)) and isinstance(lo, (int, float)) else hi if isinstance(hi, (int, float)) else None
            hdd = max(0.0, 18 - mean) if mean is not None else None
            k = d.isoformat()
            est = k not in sol
            kwh = sol.get(k) if not est else (round(ref * sun_pct(r.get("condition"), r.get("cloud_coverage")), 1) if ref else None)
            days.append({"d": k, "dn": "Heute" if d == today else "Morgen" if d == today + timedelta(days=1) else DAYN[d.weekday()],
                         "wd": DAYN[d.weekday()], "cond": r.get("condition"), "hi": hi, "lo": lo, "kwh": kwh, "est": est and kwh is not None,
                         "price": lvl.get(k), "heat": None if hdd is None else "hoch" if hdd >= 12 else "mittel" if hdd >= 6 else "gering"})
        wb = D.get("wallbox")
        has_car = bool(wb is not None and wb.configured())
        wm = D.get("wasser")
        on = ((wm.modules if wm is not None else {}) or {}).get("on") or {}
        has_bat = bool(on.get("bt"))
        out = {"days": days, "tips": week_tips(days, has_bat, has_car), "ref": ref, "ts": now.isoformat(timespec="minutes"),
               "src": {"sun": "Modul 16" if sol else "", "weather": bool(fc), "price": bool(lvl)}}
        self._week = (time.time(), out)
        return out

    async def snapshot(self) -> dict[str, Any]:
        return {"cfg": self.cfg, "allowed": self.allowed(), "found": self.findings(), "ts": dt_util.now().isoformat(timespec="minutes")}
