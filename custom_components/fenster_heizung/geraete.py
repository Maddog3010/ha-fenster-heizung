"""Modul 4: Gerätestrom – eigener Rechenkern (Solar / Batterie / Netz je Gerät, Kosten, Ersparnis, Verlauf)."""
from __future__ import annotations

import logging
import time
from datetime import timedelta
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import DOMAIN
from .geraete_calc import (
    advice, clean_days, cover_pct, free_solar, grid_import_w, history, money, new_day,
    period_sum, rate_eur, solar_for_house, split_power, watts, DEFAULT_TYPICAL_W,
)

_LOGGER = logging.getLogger(__name__)

TICK_SECONDS = 20
MAX_DT_S = 600.0


class GeraeteManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = Store(hass, 1, f"{DOMAIN}_geraete")
        self.days: dict[str, dict[str, list[float]]] = {}
        self.last: dict[str, dict[str, Any]] = {}
        self.typ: dict[str, float] = {}
        self._run: dict[str, dict[str, Any]] = {}  # laufende Durchläufe
        self._live: dict[str, list[float]] = {}  # aktuelle Leistung je Gerät [s, b, g]
        self._tick_ts = 0.0
        self._solar_now = 0.0
        self._unsub: CALLBACK_TYPE | None = None

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
        self._tick_ts = time.time()
        self._unsub = async_track_time_interval(self.hass, self._tick, timedelta(seconds=TICK_SECONDS))

    def async_stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"days": self.days, "last": self.last, "typ": self.typ}, 30)

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
                    run = self._run[did] = {"start": now, "e": [0.0, 0.0, 0.0], "cost": 0.0, "saved": 0.0, "low": None, "peak": 0.0}
                run["low"] = None
            elif run is not None and run["low"] is None:
                run["low"] = now
            if run is None:
                self._live[did] = [0.0, 0.0, 0.0]
                continue
            # Quellen so aufteilen, dass andere laufende Geräte vorher abgezogen werden
            parts = split_power(g, s, b, n)
            self._live[did] = [parts["solar"], parts["battery"], parts["grid"]]
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
        ts = dt_util.now().isoformat(timespec="seconds")
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
                "id": did, "name": d["name"], "running": run is not None,
                "w": [round(x) for x in self._live.get(did, [0.0, 0.0, 0.0])],
                "e": [round(x, 4) for x in (run["e"] if run else [0.0, 0.0, 0.0])],
                "day": period_sum(days, d0), "month": period_sum(days, m0), "year": period_sum(days, y0), "total": period_sum(days, ""),
                "last": self.last.get(did), "cover": round(cover), "advice": advice(cover),
            })
            hist[did] = history(days)
        return {"ready": ready, "devices": devices, "hist": hist}


def _ord(key: str) -> int:
    from datetime import date
    try:
        return date.fromisoformat(key).toordinal()
    except ValueError:
        return 0
