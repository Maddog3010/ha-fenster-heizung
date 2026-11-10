"""Modul 4: Gerätestrom – eigener Rechenkern (Solar / Batterie / Netz je Gerät, Kosten, Ersparnis, Verlauf)."""
from __future__ import annotations

import logging
import time
from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.event import async_track_point_in_utc_time, async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import DOMAIN
from .geraete_calc import (
    RUNS_KEEP, advice, best_start, clean_days, median, cover_pct, free_solar, grid_import_w, history, money, new_day,
    period_sum, rate_eur, solar_for_house, split_power, watts, DEFAULT_TYPICAL_W,
)

_LOGGER = logging.getLogger(__name__)

TICK_SECONDS = 20
MAX_DT_S = 600.0
FC_REFRESH_S = 600.0  # Stundenprognose für die Startempfehlung alle 10 Minuten neu holen


RLOG_KEEP = 200  # Läufe für den Energie-Coach (etwa die letzten Wochen)
CURVE_KEEP = 6  # v1.3: so viele Programm-Kurven je Gerät bleiben gespeichert (Speicher klein halten)
CURVE_MAX = 180  # höchstens so viele Punkte je Kurve
CURVE_STEP_S = 60  # ein Kurvenpunkt pro Minute: [Sekunden seit Start, Solar W, Batterie W, Netz W]
TYP_RUNS = 10  # typischer Lauf aus den letzten 10 Läufen
OUTLIER = 1.4  # ein Lauf mit 40 % mehr Energie als der Median gilt als Ausreißer (z. B. 90 °C)

class GeraeteManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_geraete")
        self.days: dict[str, dict[str, list[float]]] = {}
        self.last: dict[str, dict[str, Any]] = {}
        self.typ: dict[str, float] = {}
        self._run: dict[str, dict[str, Any]] = {}  # laufende Durchläufe
        self._live: dict[str, list[float]] = {}  # aktuelle Leistung je Gerät [s, b, g]
        self._tick_ts = 0.0
        self._solar_now = 0.0
        self._unsub: CALLBACK_TYPE | None = None
        self.durs: dict[str, list[float]] = {}  # v1.2: Laufzeiten (s) der letzten Läufe je Gerät
        self.remind: dict[str, float] = {}  # v1.2: Erinnerung „jetzt starten“ je Gerät (Unix-Zeit)
        self._rem_unsub: dict[str, CALLBACK_TYPE] = {}
        self.rlog: list[dict[str, Any]] = []  # S3: die letzten Läufe mit Startzeit und Netzanteil (für den Energie-Coach)
        self._fc: dict[int, float] = {}  # Stundenbeginn → erwartete Solarerzeugung (Wh)
        self._fc_ts = 0.0

    # ---- Konfiguration aus dem Modul-Manager
    def _modules(self) -> dict[str, Any]:
        wm = self.hass.data.get(DOMAIN, {}).get("wasser")
        return wm.modules if wm is not None else {}

    def _cfg(self) -> dict[str, Any]:
        return self._modules().get("gs") or {"devices": [], "bat_cost": 0.0, "forecast": "", "notify": []}

    def active(self) -> bool:
        m = self._modules()
        return bool(m.get("on", {}).get("gs", True)) and bool(self._cfg()["devices"])

    # ---- Start/Stop
    async def async_start(self) -> None:
        saved = await self._store.async_load() or {}
        raw = saved.get("days") if isinstance(saved.get("days"), dict) else {}
        self.days = {}
        for day, devs in raw.items():
            if isinstance(day, str) and isinstance(devs, dict):
                for did, row in devs.items():
                    ok = clean_days({day: row})
                    if ok:
                        self.days.setdefault(day, {})[str(did)] = ok[day]
        last = saved.get("last") if isinstance(saved.get("last"), dict) else {}
        self.last = {k: v for k, v in last.items() if isinstance(v, dict)}
        typ = saved.get("typ") if isinstance(saved.get("typ"), dict) else {}
        for k, v in typ.items():
            try:
                self.typ[str(k)] = max(float(v), 0.0)
            except (TypeError, ValueError):
                pass
        durs = saved.get("durs") if isinstance(saved.get("durs"), dict) else {}
        for k, v in durs.items():
            if isinstance(v, list):
                self.durs[str(k)] = [float(x) for x in v if isinstance(x, (int, float)) and x > 0][-RUNS_KEEP:]
        self.rlog = [r for r in (saved.get("rlog") or []) if isinstance(r, dict) and isinstance(r.get("t"), (int, float))][-RLOG_KEEP:]
        rem = saved.get("remind") if isinstance(saved.get("remind"), dict) else {}
        for k, v in rem.items():
            if isinstance(v, (int, float)) and v > time.time():
                self._schedule(str(k), float(v))
        self._tick_ts = time.time()
        self._unsub = async_track_time_interval(self.hass, self._tick, timedelta(seconds=TICK_SECONDS))

    def async_stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None
        for u in self._rem_unsub.values():
            u()
        self._rem_unsub.clear()

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"days": self.days, "last": self.last, "typ": self.typ, "durs": self.durs, "remind": self.remind, "rlog": self.rlog}, 30)

    async def async_config_changed(self) -> None:
        ids = {d["id"] for d in self._cfg()["devices"]}
        for k in [k for k in self._run if k not in ids]:
            del self._run[k]
        await self._tick(None)

    # ---- Messwerte
    def _w(self, entity: str) -> float | None:
        if not entity:
            return None
        st = self.hass.states.get(entity)
        if st is None:
            return None
        return watts(st.state, st.attributes.get("unit_of_measurement"))

    def _price(self, pv: dict[str, Any], mode: str, sensor: str, fix: str) -> float:
        if pv.get(mode) == "entity" and pv.get(sensor):
            st = self.hass.states.get(pv[sensor])
            if st is not None:
                try:
                    return rate_eur(float(str(st.state).replace(",", ".")), st.attributes.get("unit_of_measurement"))
                except ValueError:
                    pass
        return float(pv.get(fix) or 0) / 100

    def _sources(self) -> tuple[float, float, float]:
        """Aktuell verfügbare Leistung (Watt): Solar fürs Haus, Batterie-Entladung, Netzbezug."""
        m = self._modules()
        en = m.get("energy") or {}
        ent = en.get("ent") or {}
        gen = self.hass.data.get(DOMAIN, {}).get("general")
        pvc = (gen.data.get("pv") if gen is not None else None) or {}
        sign = en.get("sign") or pvc.get("sign") or "export"
        pv = (self._w(ent.get("pv")) or 0.0) + (self._w(ent.get("pv2")) or 0.0)
        grid_v = self._w(ent.get("grid") or pvc.get("sensor"))
        grid = grid_import_w(grid_v, sign) if grid_v is not None else 0.0
        if en.get("bmode") == "two":
            charge = max(self._w(ent.get("bchg")) or 0.0, 0.0)
            dis = max(self._w(ent.get("bdis")) or 0.0, 0.0)
        else:
            b = self._w(ent.get("bat")) or 0.0
            b = b if en.get("bsign", "charge") == "charge" else -b
            charge, dis = max(b, 0.0), max(-b, 0.0)
        solar = solar_for_house(pv, charge, max(-grid, 0.0))
        return solar, dis, max(grid, 0.0)

    # ---- Takt
    async def _tick(self, _now: Any) -> None:
        now = time.time()
        dt = min(max(now - self._tick_ts, 0.0), MAX_DT_S)
        self._tick_ts = now
        cfg = self._cfg()
        if not self.active():
            self._live.clear()
            return
        if now - self._fc_ts >= FC_REFRESH_S:
            self._fc_ts = now
            await self._load_forecast()
        s, b, n = self._sources()
        self._solar_now = s
        gen = self.hass.data.get(DOMAIN, {}).get("general")
        pvc = (gen.data.get("pv") if gen is not None else None) or {}
        price = self._price(pvc, "price_mode", "price_sensor", "price")
        feed = self._price(pvc, "feed_mode", "feed_sensor", "feed")
        bat_cost = float(cfg.get("bat_cost") or 0) / 100
        day = dt_util.now().strftime("%Y-%m-%d")
        powers = {d["id"]: (self._w(d["ent"]) or 0.0) for d in cfg["devices"]}
        for d in cfg["devices"]:
            did, g = d["id"], max(powers[d["id"]], 0.0)
            run = self._run.get(did)
            if g >= d["thr"]:
                if run is None:
                    run = self._run[did] = {"start": now, "e": [0.0, 0.0, 0.0], "cost": 0.0, "saved": 0.0, "low": None, "peak": 0.0, "cv": []}
                run["low"] = None
            elif run is not None and run["low"] is None:
                run["low"] = now
            if run is None:
                self._live[did] = [0.0, 0.0, 0.0]
                continue
            # Quellen so aufteilen, dass andere laufende Geräte vorher abgezogen werden
            parts = split_power(g, s, b, n)
            self._live[did] = [parts["solar"], parts["battery"], parts["grid"]]
            cv = run.setdefault("cv", [])
            if not cv or now - run["start"] - cv[-1][0] >= CURVE_STEP_S:  # v1.3: Programm-Kurve nach Herkunft
                cv.append([int(now - run["start"]), round(parts["solar"]), round(parts["battery"]), round(parts["grid"])])
            row = self.days.setdefault(day, {}).setdefault(did, new_day())
            for i, src in enumerate(("solar", "battery", "grid")):
                kwh = parts[src] * dt / 3600 / 1000
                c, sv = money(kwh, src, price, feed, bat_cost)
                run["e"][i] += kwh
                run["cost"] += c
                run["saved"] += sv
                row[i] += kwh
                row[3] += c
                row[4] += sv
            run["peak"] = max(run["peak"], g)
            if run["low"] is not None and now - run["low"] >= d["end"] * 60:
                self._finish(d, run, row, now)
        self._prune()
        self._save()

    def _prune(self) -> None:
        today = dt_util.now().date().toordinal()
        for k in [k for k in self.days if _ord(k) < today - 800]:
            del self.days[k]

    def _finish(self, dev: dict[str, Any], run: dict[str, Any], row: list[float], now: float) -> None:
        did = dev["id"]
        self._run.pop(did, None)
        kwh = sum(run["e"])
        if kwh < 0.005:
            return
        row[5] += 1
        share = (run["e"][0] + run["e"][1]) / kwh * 100 if kwh else 0.0
        dur = max(now - run["start"] - dev["end"] * 60, 60.0)
        self.typ[did] = max(kwh * 3600 * 1000 / dur, 0.0)
        self.durs[did] = (self.durs.get(did, []) + [round(dur)])[-RUNS_KEEP:]
        ts = dt_util.now().isoformat(timespec="seconds")
        rec = {"d": did, "n": dev["name"], "t": int(run["start"]), "kwh": round(kwh, 3), "g": round(run["e"][2], 3), "c": round(run["cost"], 3),
               "s": round(run["e"][0], 3), "b": round(run["e"][1], 3), "sv": round(run["saved"], 3), "dur": round(dur), "cv": thin(run.get("cv") or [], CURVE_MAX)}
        self.rlog = (self.rlog + [rec])[-RLOG_KEEP:]
        keep = 0
        for r in reversed(self.rlog):  # nur die letzten Kurven je Gerät behalten
            if r.get("d") == did and r.get("cv"):
                keep += 1
                if keep > CURVE_KEEP:
                    r.pop("cv", None)
        self.last[did] = {"cost": round(run["cost"], 4), "kwh": round(kwh, 4), "share": round(share, 1), "saved": round(run["saved"], 4), "ts": ts}
        data = {"device": dev["name"], "id": did, "kwh": round(kwh, 3), "cost": round(run["cost"], 2), "saved": round(run["saved"], 2), "share": round(share)}
        self.hass.bus.async_fire("geraetestrom_run_finished", data)
        msg = f"{kwh:.2f} kWh · {run['cost']:.2f} € · {share:.0f} % eigener Strom (gespart: {run['saved']:.2f} €)".replace(".", ",")
        for svc in self._cfg().get("notify", []):
            domain, name = svc.split(".", 1)
            if self.hass.services.has_service(domain, name):
                self.hass.async_create_task(
                    self.hass.services.async_call(domain, name, {"title": f"{dev['name']} fertig", "message": msg})
                )

    # ---- v1.2: Stundenprognose (Forecast.Solar oder Sensor aus Modul 16) für die beste Startzeit
    async def _load_forecast(self) -> None:
        sm = self.hass.data.get(DOMAIN, {}).get("solar")
        if sm is None:
            return
        try:
            wh, _sites = await sm._wh()  # noqa: SLF001 - gleiche Quelle wie Modul 16, auch wenn Modul 16 aus ist
        except Exception:  # noqa: BLE001 - ohne Prognose gibt es nur die einfache Empfehlung
            _LOGGER.debug("Gerätestrom: Solarprognose nicht verfügbar", exc_info=True)
            return
        out: dict[int, float] = {}
        for k, v in (wh or {}).items():
            try:
                t = k if isinstance(k, datetime) else datetime.fromisoformat(str(k))
                h = int(t.timestamp() // 3600 * 3600)
                out[h] = out.get(h, 0.0) + float(v or 0)
            except (TypeError, ValueError):
                continue
        self._fc = out

    # ---- v1.2: Erinnern („jetzt starten“) über die Meldedienste von Modul 4
    def _schedule(self, did: str, ts: float) -> None:
        if did in self._rem_unsub:
            self._rem_unsub.pop(did)()
        self.remind[did] = ts

        async def _fire(_now: Any) -> None:
            self._rem_unsub.pop(did, None)
            self.remind.pop(did, None)
            self._save()
            dev = next((d for d in self._cfg()["devices"] if d["id"] == did), None)
            if dev is None:
                return
            b = self._best(dev)
            msg = "Jetzt ist eine gute Zeit zum Starten" + (f" – etwa {b['pct']:.0f} % Solar erwartet." if b else ".")
            self.hass.bus.async_fire("geraetestrom_reminder", {"device": dev["name"], "id": did})
            for svc in self._cfg().get("notify", []):
                domain, name = svc.split(".", 1)
                if self.hass.services.has_service(domain, name):
                    self.hass.async_create_task(self.hass.services.async_call(domain, name, {"title": f"{dev['name']}: jetzt starten", "message": msg}))

        self._rem_unsub[did] = async_track_point_in_utc_time(self.hass, _fire, dt_util.utc_from_timestamp(ts))

    def set_remind(self, did: str, on: bool) -> dict[str, Any]:
        dev = next((d for d in self._cfg()["devices"] if d["id"] == did), None)
        if dev is None:
            return {"ok": False, "msg": "Gerät nicht gefunden"}
        if not on:
            if did in self._rem_unsub:
                self._rem_unsub.pop(did)()
            self.remind.pop(did, None)
            self._save()
            return {"ok": True}
        if not self._cfg().get("notify"):
            return {"ok": False, "msg": "Kein Meldedienst gewählt (Einstellungen → Modul 4 → Meldung)"}
        b = self._best(dev)
        if not b or b["ts"] <= time.time() + 60:
            return {"ok": False, "msg": "Gerade ist schon eine gute Zeit zum Starten"}
        self._schedule(did, b["ts"])
        self._save()
        return {"ok": True, "ts": b["ts"]}

    def _best(self, dev: dict[str, Any]) -> dict[str, Any] | None:
        did = dev["id"]
        b = best_start(self._fc, time.time(), median(self.durs.get(did, [])) or 7200, self.typ.get(did) or DEFAULT_TYPICAL_W)
        if b:
            b["day"] = "today" if dt_util.as_local(dt_util.utc_from_timestamp(b["ts"])).date() == dt_util.now().date() else "tomorrow"
        return b

    # ---- Abfrage
    def snapshot(self) -> dict[str, Any]:
        cfg = self._cfg()
        now = dt_util.now()
        d0, m0, y0 = now.strftime("%Y-%m-%d"), now.strftime("%Y-%m"), now.strftime("%Y")
        ready = self.active()
        devices: list[dict[str, Any]] = []
        hist: dict[str, Any] = {}
        running_solar = {k: v[0] for k, v in self._live.items()}
        for d in cfg["devices"]:
            did = d["id"]
            days = {k: v[did] for k, v in self.days.items() if did in v}
            run = self._run.get(did)
            others = sum(v for k, v in running_solar.items() if k != did)
            est = free_solar(self._solar_now, others)
            cover = cover_pct(est, self.typ.get(did) or DEFAULT_TYPICAL_W)
            devices.append({
                "id": did, "name": d["name"], "typ": d.get("typ", ""), "running": run is not None,
                "since": round(run["start"]) if run else None,
                "w": [round(x) for x in self._live.get(did, [0.0, 0.0, 0.0])],
                "e": [round(x, 4) for x in (run["e"] if run else [0.0, 0.0, 0.0])],
                "day": period_sum(days, d0), "month": period_sum(days, m0), "year": period_sum(days, y0), "total": period_sum(days, ""),
                "last": self.last.get(did), "cover": round(cover), "advice": advice(cover),
                "runs": len(self.durs.get(did, [])), "med": round(median(self.durs.get(did, []))),
                "best": None if run else self._best(d), "remind": self.remind.get(did),
            })
            hist[did] = history(days)
        return {"ready": ready, "devices": devices, "hist": hist}


    def runs(self, did: str) -> dict[str, Any]:
        """v1.3 Geräte-Seite: Durchlauf-Protokoll (neueste zuerst), typischer Lauf und die Kurve des laufenden Durchlaufs."""
        L = [r for r in self.rlog if r.get("d") == did]
        last = L[-TYP_RUNS:]
        kw = sorted(r["kwh"] for r in last if r.get("kwh"))
        med_kwh = kw[len(kw) // 2] if kw else 0.0
        norm = [r for r in last if not med_kwh or r["kwh"] <= med_kwh * OUTLIER]
        durs = [r["dur"] for r in norm if r.get("dur")]
        typ = None
        if len(norm) >= 3:
            typ = {"n": len(norm), "dur": round(median(durs)) if durs else round(median(self.durs.get(did, []))),
                   "kwh": round(sum(r["kwh"] for r in norm) / len(norm), 3), "c": round(sum(r["c"] for r in norm) / len(norm), 3),
                   "sun": sum(1 for r in last if r.get("kwh") and (r.get("s", 0) + r.get("b", 0)) / r["kwh"] >= 0.7 and r.get("s", 0) / r["kwh"] >= 0.5),
                   "of": len(last), "out": len(last) - len(norm), "has_split": any("s" in r for r in last)}
        out = []
        for r in reversed(L[-20:]):
            o = {k: r.get(k) for k in ("t", "kwh", "g", "c", "s", "b", "sv", "dur")}
            o["x"] = bool(med_kwh and len(last) >= 3 and r["kwh"] > med_kwh * OUTLIER)
            o["cv"] = r.get("cv")
            out.append(o)
        run = self._run.get(did)
        live = {"t": int(run["start"]), "cv": run.get("cv") or [], "e": [round(x, 3) for x in run["e"]]} if run else None
        return {"runs": out, "typ": typ, "live": live}


def thin(cv: list[list[int]], n: int) -> list[list[int]]:
    """Kurve auf höchstens n Punkte ausdünnen (gleichmäßig, erster und letzter Punkt bleiben)."""
    if len(cv) <= n:
        return cv
    step = (len(cv) - 1) / (n - 1)
    return [cv[round(i * step)] for i in range(n)]


def _ord(key: str) -> int:
    from datetime import date
    try:
        return date.fromisoformat(key).toordinal()
    except ValueError:
        return 0
