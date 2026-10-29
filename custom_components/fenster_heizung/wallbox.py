"""Modul 8: go-e Charger direkt über die lokale HTTP-API v2 lesen und regeln."""
from __future__ import annotations

import asyncio
import json
import logging
import re
import time
from collections import deque
from datetime import datetime, timedelta
from typing import Any
from urllib.parse import quote

from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import DOMAIN
from .geraete_calc import grid_import_w, rate_eur, watts
from .wallbox_calc import (
    CAR_CHARGING, CAR_DONE, CAR_IDLE, EXTERN_HOLD_S, VOLT, clean_wb, commands, decide, guard_limit, parse_nrg, plan_due, resolve_who, valid_host,
)
from .wallbox_plan import (
    add_energy, add_km, build_slots, clean_stats, close_session, day_ok, deadline, plan_calc, plan_mode, prices_from_attr, prune, pv_from_wh, session_tick, stats_view,
)

_LOGGER = logging.getLogger(__name__)

TICK_SECONDS = 10
TIMEOUT_S = 5
KEYS = ("car", "amp", "psm", "frc", "nrg", "wh", "eto", "fwv", "sse", "typ", "fna", "err", "alw", "acu", "pnp", "cbl", "ama", "trx", "cards")
CAR_TEXT = {0: "Unbekannt", 1: "Nicht angesteckt", 2: "Lädt", 3: "Wartet aufs Auto", 4: "Fertig geladen", 5: "Fehler"}


class GoeError(Exception):
    """Wallbox nicht erreichbar oder Antwort unbrauchbar."""


class GoeClient:
    """Lokale HTTP-API v2 der go-e Charger (siehe github.com/goecharger/go-eCharger-API-v2)."""

    def __init__(self, hass: HomeAssistant, host: str) -> None:
        self._s = async_get_clientsession(hass)
        self.host = valid_host(host)

    async def _get(self, path: str) -> Any:
        if not self.host:
            raise GoeError("Ungültige Adresse")
        try:
            async with asyncio.timeout(TIMEOUT_S):
                async with self._s.get(f"http://{self.host}{path}") as r:
                    if r.status != 200:
                        raise GoeError(f"HTTP {r.status}")
                    return json.loads(await r.text())
        except (TimeoutError, OSError, ValueError) as err:
            raise GoeError(str(err) or err.__class__.__name__) from err
        except GoeError:
            raise
        except Exception as err:  # aiohttp-Fehler
            raise GoeError(str(err) or err.__class__.__name__) from err

    async def status(self) -> dict[str, Any]:
        try:
            data = await self._get("/api/status?filter=" + ",".join(KEYS))
        except GoeError:
            # ältere Firmware (bis 051.3) erwartet das Filter als JSON-Liste
            data = await self._get("/api/status?filter=" + quote(json.dumps(list(KEYS[:10]), separators=(",", ":"))))
        if not isinstance(data, dict):
            raise GoeError("Unerwartete Antwort")
        return data

    async def set(self, values: dict[str, int]) -> None:
        q = "&".join(f"{k}={json.dumps(int(v))}" for k, v in values.items() if k in ("frc", "amp", "psm"))
        if not q:
            return
        res = await self._get("/api/set?" + q)
        bad = {k: v for k, v in (res.items() if isinstance(res, dict) else []) if v is not True}
        if bad:
            raise GoeError(f"Wallbox hat abgelehnt: {bad}")


def summarize(st: dict[str, Any]) -> dict[str, Any]:
    """Status der Wallbox für die Oberfläche."""
    n = parse_nrg(st.get("nrg"))
    car = st.get("car") if isinstance(st.get("car"), int) else None
    trx = st.get("trx") if isinstance(st.get("trx"), int) and not isinstance(st.get("trx"), bool) else None
    cards = []
    for i, c in enumerate(st.get("cards") if isinstance(st.get("cards"), list) else [], 1):
        if isinstance(c, dict) and c.get("cardId") and i <= 10:
            try:
                kwh = round(float(c.get("energy") or 0) / 1000, 1)
            except (TypeError, ValueError):
                kwh = 0.0
            cards.append({"i": i, "n": str(c.get("name") or f"Karte {i}")[:30], "kwh": kwh})
    return {
        "car": car, "car_text": CAR_TEXT.get(car, "–"), "amp": st.get("amp"), "psm": st.get("psm"), "frc": st.get("frc"),
        "power": n["power"], "cur": n["amp"], "phases": n["phases"], "session_wh": st.get("wh"), "total_wh": st.get("eto"),
        "fw": st.get("fwv"), "serial": st.get("sse"), "type": st.get("typ"), "name": st.get("fna"), "err": st.get("err"),
        "cable": st.get("cbl"), "ama": st.get("ama"), "trx": trx, "cards": cards,
    }


class WallboxManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_wallbox")
        self.cfg: dict[str, Any] = clean_wb({})
        self.info: dict[str, Any] = {}  # letzter Status
        self.ok = False
        self.err = ""
        self.want: dict[str, Any] = {}
        self.log: deque[dict[str, Any]] = deque(maxlen=40)
        self._mem: dict[str, Any] = {"above_since": None, "below_since": None, "ph_change_ts": None}
        self._last_set: dict[str, int] = {}
        self._hold_until = 0.0
        self._restore = False
        self._card: int | None = None  # Karte der laufenden Ladung
        self.who: dict[str, Any] | None = None
        self._unsub: CALLBACK_TYPE | None = None
        self._busy = False
        self._st_store = SafeStore(hass, 1, f"{DOMAIN}_wallbox_stats")
        self._st: dict[str, Any] = clean_stats(None)
        self._last_ts: float | None = None
        self._st_day = ""
        self._fc: tuple[float, dict[str, Any]] | None = None  # Zwischenspeicher der Vorhersage
        self._fc_busy = False
        self._slots: list[dict[str, Any]] = []
        self._slot_res = "h"
        self._quick: dict[str, Any] | None = None  # Schnellstart (einmalig, nicht gespeichert)
        self.guard: dict[str, Any] | None = None  # Hausanschluss-Schutz: letzte Messung
        self._plan_late = False
        self._prev_car: int | None = None
        self._fail = 0
        self._n = {"start": False, "goal": False, "plan": False, "off": False, "long": False}
        self._plug_ts: float | None = None
        self._charged = False

    async def async_start(self) -> None:
        self.cfg = clean_wb(await self._store.async_load())
        self._st = clean_stats(await self._st_store.async_load())
        self._unsub = async_track_time_interval(self.hass, self._tick, timedelta(seconds=TICK_SECONDS))

    def async_stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None
        close_session(self._st)
        self.hass.async_create_task(self._st_store.async_save(self._st))

    async def async_set(self, raw: Any) -> dict[str, Any]:
        old = self.cfg
        self.cfg = clean_wb({**self.cfg, **raw} if isinstance(raw, dict) else raw)  # fehlende Felder (alter Browser) behalten ihren Stand
        if not self.cfg["enabled"]:
            self._quick = None
        if old["enabled"] and not self.cfg["enabled"]:
            self._restore = True  # Wallbox wieder auf „neutral“ stellen
        if self.cfg["enabled"] != old["enabled"] or self.cfg["mode"] != old["mode"]:
            self._hold_until = 0.0
            self._add(f"Regelung {'ein' if self.cfg['enabled'] else 'aus'}, Modus „{self.cfg['mode']}“")
        await self._store.async_save(self.cfg)
        self._fc = None
        await self._tick(None)
        return self.snapshot()

    async def async_test(self, host: str) -> dict[str, Any]:
        if not valid_host(host):
            return {"ok": False, "error": "Nur Adressen im lokalen Netz sind erlaubt (zum Beispiel 192.168.1.45)."}
        try:
            return {"ok": True, **summarize(await GoeClient(self.hass, host).status())}
        except GoeError as err:
            return {"ok": False, "error": str(err)}

    def _add(self, text: str) -> None:
        self.log.appendleft({"t": dt_util.now().isoformat(timespec="seconds"), "x": text})

    # ---- Messwerte
    def _modules(self) -> dict[str, Any]:
        wm = self.hass.data.get(DOMAIN, {}).get("wasser")
        return wm.modules if wm is not None else {}

    def _num(self, entity: str | None) -> float | None:
        st = self.hass.states.get(entity) if entity else None
        if st is None:
            return None
        try:
            return float(str(st.state).replace(",", "."))
        except ValueError:
            return None

    def _pv_cfg(self) -> dict[str, Any]:
        gen = self.hass.data.get(DOMAIN, {}).get("general")
        return (gen.data.get("pv") if gen is not None else None) or {}

    def surplus(self, wb_power: float) -> float | None:
        """Überschuss in Watt: Einspeisung ins Netz plus die Leistung, die die Wallbox gerade selbst zieht."""
        m = self._modules()
        en = m.get("energy") or {}
        pvc = self._pv_cfg()
        ent = (en.get("ent") or {}).get("grid") or pvc.get("sensor")
        st = self.hass.states.get(ent) if ent else None
        if st is None:
            return None
        w = watts(st.state, st.attributes.get("unit_of_measurement"))
        if w is None:
            return None
        sign = en.get("sign") or pvc.get("sign") or "export"
        return max(-grid_import_w(w, sign) + wb_power, 0.0)

    def _price_ct(self) -> float | None:
        pvc = self._pv_cfg()
        if pvc.get("price_mode") == "entity" and pvc.get("price_sensor"):
            st = self.hass.states.get(pvc["price_sensor"])
            if st is not None:
                try:
                    return rate_eur(float(str(st.state).replace(",", ".")), st.attributes.get("unit_of_measurement")) * 100
                except ValueError:
                    return None
        return None

    def _tibber(self) -> Any:
        return self.hass.data.get(DOMAIN, {}).get("tibber")

    def _use_tibber(self) -> bool:
        tb = self._tibber()
        return bool(tb is not None and tb.connected and self.cfg["planSrc"] != "sensor")

    def _price_now(self, now: Any) -> float | None:
        """Aktueller Preis in ct/kWh: von Tibber, sonst aus dem Preis-Sensor von Modul 1."""
        if self._use_tibber():
            v = self._tibber().current_ct(now)
            if v is not None:
                return v
        return self._price_ct()

    def _soc(self) -> float | None:
        ev = self._modules().get("ev") or {}
        v = self._num((ev.get("ent") or {}).get("soc"))
        return v if v is not None and 0 <= v <= 100 else None

    def _bat_ok(self) -> bool:
        if not self.cfg["batOn"]:
            return True
        pvc = self._pv_cfg()
        v = self._num(pvc.get("soc_sensor"))
        return v is None or v >= self.cfg["batSoc"]

    # ---- Takt
    async def _tick(self, _now: Any) -> None:
        if self._busy:
            return
        self._busy = True
        try:
            await self._run()
        finally:
            self._busy = False

    async def _run(self) -> None:
        cfg = self.cfg
        if not cfg["ip"]:
            self.ok, self.info = False, {}
            return
        cl = GoeClient(self.hass, cfg["ip"])
        try:
            st = await cl.status()
        except GoeError as err:
            if self.ok or not self.err:
                self._add(f"Wallbox nicht erreichbar: {err}")
            self.ok, self.err = False, str(err)
            self._fail += 1
            if self._fail >= 6 and not self._n["off"]:
                self._n["off"] = True
                await self._notify("off", "Wallbox nicht erreichbar", f"Die Wallbox antwortet seit einer Minute nicht: {err}")
            return
        self._fail = 0
        self._n["off"] = False
        self.ok, self.err = True, ""
        self.guard = None
        self.info = summarize(st)
        self._count(st_car=self.info["car"])
        await self._events(time.time())
        self._quick_check(self.info["car"], time.time())
        if self._restore:
            self._restore = False
            await self._apply(cl, {"frc": 0}, "Regelung ausgeschaltet: Die Wallbox ist wieder auf „neutral“.")
            return
        if not cfg["enabled"]:
            self.want = {}
            return
        now_ts = time.time()
        cur = {"frc": st.get("frc"), "amp": st.get("amp"), "psm": st.get("psm")}
        # Fahrzeug an der Karte erkennen (trx = Kartennummer, 0 = ohne Karte, leer = keine Ladung)
        trx, car = self.info.get("trx"), self.info["car"]
        if trx is not None and trx >= 1:
            if self._card != trx:
                self._add(f"Karte {trx} erkannt.")
            self._card = trx
        if car == CAR_IDLE and (self._card is not None or cur.get("frc") == 2) and cfg["reset"]:
            self._card = None
            self.who = None
            self._mem.update(above_since=None, below_since=None)
            if cur.get("frc") != 0:
                await self._apply(cl, {"frc": 0}, "Abgesteckt: Die Wallbox ist wieder auf „neutral“.")
            return
        who = resolve_who(cfg, self._card)
        self.who = who
        if cfg["lock"] and who is None:
            self.want = {"state": "gesperrt", "reason": "Wartet auf eine Karte. Strom & Wärme verändert nichts, bis ein Fahrzeug erkannt ist."}
            return
        if who is not None:
            cfg = {**cfg, "mode": who["mode"], "limit": who["limit"]}
            dp = who.get("dep") or {}
            if who["kind"] == "vehicle" and dp.get("on"):  # eigene Abfahrt dieses Fahrzeugs
                cfg = {**cfg, "planSoc": dp["soc"], "planTime": dp["time"], "planDays": dp["days"]}
        lab = self.hass.data.get(DOMAIN, {}).get("labs")
        if lab is not None:
            cfg = lab.wb_cfg(cfg)  # Lab „Ladeziel nach Kalender“
        # Jemand hat von Hand umgestellt: nicht dagegen regeln
        for k, v in self._last_set.items():
            if cur.get(k) is not None and cur[k] != v and (k == "frc" or cur.get("frc") == 2):
                self._hold_until = now_ts + EXTERN_HOLD_S
                self._last_set = {}
                self._add("Wallbox von Hand umgestellt: Die Regelung pausiert 30 Minuten.")
                break
        if now_ts < self._hold_until:
            self.want = {"state": "pausiert", "reason": "Von Hand umgestellt. Die Regelung pausiert kurz."}
            return
        wb_w = self.info["power"] or 0.0
        plan_txt = ""
        self._plan_late = False
        q = self._quick
        if q:  # Schnellstart: einmalig, ohne Modus und Planung zu ändern
            cfg = {**cfg, "mode": "pv" if q["k"] == "sun" else "now", "plan": False, "priceOn": False}
        if cfg["planOn"] and not q and not (who is not None and who["mode"] == "off"):
            pm = await self._plan_now(cfg, dt_util.now())
            if pm is not None:
                if pm["mode"] is None:
                    self._mem.update(above_since=None, below_since=None)
                    self.want = {"frc": 1, "amp": cfg["minA"], "psm": 2, "state": pm["state"], "reason": pm["reason"], "surplus_w": self.surplus(wb_w)}
                    if who is not None:
                        self.want["who"] = who
                    cmd = commands(self.want, cur)
                    if cmd:
                        await self._apply(cl, cmd, pm["reason"])
                    return
                cfg = {**cfg, "mode": pm["mode"]}
                plan_txt = pm["reason"] + " "
                self._plan_late = bool(pm.get("late"))
        inp = {
            "car": self.info["car"], "surplus_w": self.surplus(wb_w), "soc": self._soc(), "bat_ok": self._bat_ok(),
            "price_ct": self._price_now(dt_util.now()), "cur_ph": self.info["phases"],
        }
        self.want = decide(cfg, inp, self._mem, now_ts, dt_util.now())
        if plan_txt:
            self.want["reason"] = plan_txt + self.want["reason"]
        if who is not None:
            self.want["who"] = who
        self.want["surplus_w"] = inp["surplus_w"]
        self._guard(cfg, wb_w)
        if q:
            self.want["quick"] = q["k"]
        cmd = commands(self.want, cur)
        if cmd:
            if "psm" in cmd:
                self._mem["ph_change_ts"] = now_ts
            await self._apply(cl, cmd, self.want["reason"])

    def _count(self, st_car: int | None) -> None:
        """Ladestatistik: Energie dieses Taktes auf Sonne und Netz aufteilen und mit dem aktuellen Preis bewerten."""
        now, ts = dt_util.now(), time.time()
        dt = min(ts - self._last_ts, 60.0) if self._last_ts else 0.0
        self._last_ts = ts
        charging = st_car == CAR_CHARGING
        power = (self.info.get("power") or 0.0) if charging else 0.0
        trx = self.info.get("trx")
        w = resolve_who(self.cfg, trx if isinstance(trx, int) and trx >= 1 else self._card)
        veh = w["name"] if w else "Unbekannt"
        session_tick(self._st, now, charging, power)
        add_km(self._st, now, self._odo())
        if charging and power > 0 and dt > 0:
            add_energy(self._st, now, dt, power, self.surplus(power), self._price_now(now), veh)
        day = now.date().isoformat()
        if day != self._st_day:
            self._st_day = day
            prune(self._st, now.date())
        self._st_store.async_delay_save(lambda: self._st, 60)

    def stats(self) -> dict[str, Any]:
        return stats_view(self._st)

    # ---- Planung nach Preis und PV-Prognose
    async def _pv_forecast(self, now: Any) -> tuple[dict[Any, float], dict[str, Any], str]:
        """Überschuss-kW je Stunde aus Forecast.Solar (Aktion forecast_solar.get_forecast) oder aus einem eigenen Sensor."""
        base_kw = self.cfg["baseW"] / 1000
        info: dict[str, Any] = {"found": False}
        wh: dict[Any, float] = {}
        if self.cfg["pvSrc"] == "forecast":
            entries = self.hass.config_entries.async_entries("forecast_solar")
            sites = []
            for e in entries:
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
                kwp = None
                try:
                    kwp = float((e.options or {}).get("modules_power") or (e.options or {}).get("modules power") or 0) / 1000 or None
                except (TypeError, ValueError):
                    kwp = None
                sites.append({"name": re.sub(r"[<>\"'&]", "", str(e.title or "Anlage"))[:30], "kwp": kwp or 0.0})
            if sites:
                def day_kwh(d: Any) -> float:
                    tot = 0.0
                    for k, v in wh.items():
                        try:
                            t = k if hasattr(k, "date") else datetime.fromisoformat(str(k))
                            if t.astimezone(now.tzinfo).date() == d:
                                tot += v
                        except ValueError:
                            continue
                    return round(tot / 1000, 1)
                info = {"found": True, "sites": sites, "today": day_kwh(now.date()), "tomorrow": day_kwh(now.date() + timedelta(days=1))}
            label = "Forecast.Solar"
        else:
            ent = self._pv_cfg().get("forecast_sensor")
            st = self.hass.states.get(ent) if ent else None
            part = st.attributes.get("wh_period") if st is not None else None
            if isinstance(part, dict):
                wh = {k: float(v or 0) for k, v in part.items()}
            label = str(ent or "–")
        return pv_from_wh(wh, base_kw, now.tzinfo), info, label

    async def _price_list(self, now: Any) -> tuple[list[dict[str, Any]], str, str]:
        """Preise je Stunde oder Viertelstunde: (Liste, Quelle, Auflösung h/q/lvl)."""
        if self._use_tibber():
            tb = self._tibber()
            d = await tb.async_prices()
            if d and d.get("prices"):
                return d["prices"], "Tibber" + (f" · {tb.view()['home']}" if tb.view().get("home") else ""), tb.res
        pvc = self._pv_cfg()
        ent = pvc.get("price_sensor")
        st = self.hass.states.get(ent) if ent else None
        if st is not None:
            lst = prices_from_attr(dict(st.attributes))
            if lst:
                return lst, str(ent), "h"
        return [], str(ent or "–"), "h"

    async def forecast(self, force: bool = False) -> dict[str, Any]:
        """Vorhersage und Plan für die Oberfläche und die Steuerung (Zwischenspeicher: 2 Minuten)."""
        ts = time.time()
        if self._fc and not force and ts - self._fc[0] < 120:
            return self._fc[1]
        cfg = self.cfg
        now = dt_util.now()
        pv, fs, pv_label = await self._pv_forecast(now)
        prices, price_src, res = await self._price_list(now)
        slot_min = 15 if res == "q" else 60
        flat = self._price_now(now)
        slots = build_slots(now, pv, prices, slot_min, flat_ct=flat)
        out: dict[str, Any] = {
            "hours": [{"t": x["t"].isoformat(timespec="minutes"), "pv": x["pv"], "price": x["price"] if x["price"] is not None else 0.0, "level": x["level"]} for x in slots],
            "slot_min": slot_min, "price_src": price_src, "pv_src": pv_label, "fs": fs, "has_price": any(x["price"] is not None for x in slots),
            "has_pv": any(x["pv"] > 0 for x in slots),
        }
        self._fc = (ts, out)
        self._slots = slots
        self._slot_res = res
        return out

    def _plan_opts(self, cfg: dict[str, Any], soc: float, res: str) -> dict[str, Any]:
        ph = 1 if cfg["ph"] == "1" else 3
        return {"strat": cfg["planStrat"], "target": cfg["planSoc"], "soc": soc, "cap": cfg["cap"], "until": cfg["planTime"],
                "pmax": round(cfg["maxA"] * VOLT * ph / 1000, 2), "minkw": max(1.4, cfg["startW"] / 1000), "rank": "level" if res == "lvl" else "price"}

    async def _plan_now(self, cfg: dict[str, Any], now: Any) -> dict[str, Any] | None:
        """Planung für jetzt. None = nicht planbar (zum Beispiel Ladestand unbekannt) – dann gilt der normale Modus."""
        soc = self._soc()
        if soc is None:
            return None
        if not day_ok(cfg["planDays"], deadline(now, cfg["planTime"])):
            return None  # an diesem Tag ist keine Abfahrt geplant
        await self.forecast()
        slots = self._slots
        if not slots:
            return None
        o = self._plan_opts(cfg, soc, self._slot_res)
        R = plan_calc(slots, now, o)
        return plan_mode(slots, R, now, o)

    def _odo(self) -> float | None:
        ev = self._modules().get("ev") or {}
        v = self._num((ev.get("ent") or {}).get("odo"))
        return v if v is not None and v >= 0 else None

    def _grid_import(self) -> float | None:
        """Netzbezug in Watt (negativ = Einspeisung) vom Zähler aus Modul 3."""
        m = self._modules()
        en = m.get("energy") or {}
        pvc = self._pv_cfg()
        ent = (en.get("ent") or {}).get("grid") or pvc.get("sensor")
        st = self.hass.states.get(ent) if ent else None
        if st is None:
            return None
        w = watts(st.state, st.attributes.get("unit_of_measurement"))
        if w is None:
            return None
        return grid_import_w(w, en.get("sign") or pvc.get("sign") or "export")

    def _guard(self, cfg: dict[str, Any], wb_w: float) -> None:
        """Hausanschluss-Schutz: Die Wallbox drosseln, wenn Haus und Wallbox zusammen die Grenze überschreiten würden."""
        g = cfg["guard"]
        self.guard = None
        if not g["on"]:
            return
        imp = self._grid_import()
        if imp is None:
            return
        r = guard_limit(g, imp, wb_w, self.info.get("phases"))
        r["limited"] = False
        w = self.want
        if w.get("frc") == 2 and w.get("amp", 0) > r["allowed_a"]:
            r["limited"] = True
            if r["allowed_a"] >= cfg["minA"]:
                w["amp"] = r["allowed_a"]
                w["state"] = "gedrosselt"
                w["reason"] = f"Hausanschluss-Schutz: Die Wallbox wird auf {r['allowed_a']} A gedrosselt. " + w.get("reason", "")
            else:
                w.update(frc=1, state="gedrosselt", reason=f"Hausanschluss-Schutz: Das Haus braucht gerade {r['house_a']} A von {r['max_a']} A. Die Wallbox pausiert.")
        self.guard = r

    def _quick_check(self, car: int | None, now_ts: float) -> None:
        q = self._quick
        if not q:
            return
        if car is not None and car != CAR_IDLE:
            q["seen"] = True
        if (car == CAR_IDLE and q["seen"]) or car == CAR_DONE or (q["until"] and now_ts > q["until"]):
            self._quick = None
            self._add("Schnellstart beendet.")

    async def async_quick(self, kind: str) -> dict[str, Any]:
        """Schnellstart: h1 = 1 Stunde voll, goal = bis zum Ziel voll, sun = heute nur Sonne. Leer = Stopp."""
        if kind in ("h1", "goal", "sun") and self.cfg["enabled"]:
            now = dt_util.now()
            until = time.time() + 3600 if kind == "h1" else (now.replace(hour=23, minute=59, second=59, microsecond=0).timestamp() if kind == "sun" else None)
            self._quick = {"k": kind, "until": until, "seen": self.info.get("car") not in (None, CAR_IDLE)}
            self._add({"h1": "Schnellstart: 1 Stunde voll laden.", "goal": "Schnellstart: bis zum Ziel voll laden.", "sun": "Schnellstart: heute nur mit Sonne."}[kind])
        elif self._quick:
            self._quick = None
            self._add("Schnellstart gestoppt.")
        self._hold_until = 0.0
        await self._tick(None)
        return self.snapshot()

    async def _notify(self, kind: str, title: str, msg: str) -> None:
        n = self.cfg["notify"]
        if not n.get(kind):
            return
        for svc in n["to"]:
            name = svc.split(".", 1)[1]
            if not self.hass.services.has_service("notify", name):
                continue
            try:
                await self.hass.services.async_call("notify", name, {"title": title, "message": msg}, blocking=False)
            except Exception as err:  # Dienst fehlerhaft: nie die Regelung stören
                _LOGGER.debug("Benachrichtigung %s: %s", svc, err)

    async def _events(self, now_ts: float) -> None:
        """Meldungen aufs Handy: Ladung gestartet, Ziel erreicht, Plan reicht nicht, lange ohne Ladung."""
        car, prev = self.info.get("car"), self._prev_car
        self._prev_car = car
        who = self.who["name"] if self.who else "Das Auto"
        if car == CAR_CHARGING and prev is not None and prev != CAR_CHARGING and not self._n["start"]:
            self._n["start"] = True
            await self._notify("start", "Ladung gestartet", f"{who} lädt mit {round((self.info.get('power') or 0) / 1000, 1)} kW.")
        if car == CAR_IDLE:
            self._plug_ts, self._charged = None, False
            self._n.update(start=False, goal=False, plan=False, long=False)
            return
        if self._plug_ts is None:
            self._plug_ts = now_ts
        if car == CAR_CHARGING:
            self._charged = True
        w = self.want or {}
        if (car == CAR_DONE or w.get("state") == "limit") and not self._n["goal"]:
            self._n["goal"] = True
            await self._notify("goal", "Ladeziel erreicht", f"{who} ist fertig geladen.")
        if self._plan_late and not self._n["plan"]:
            self._n["plan"] = True
            await self._notify("plan", "Ladeplan braucht Netzstrom", "Die Sonne reicht nicht bis zur Abfahrt. Es wird mit Netzstrom nachgeladen.")
        if not self._charged and not self._n["long"] and now_ts - self._plug_ts > 12 * 3600:
            self._n["long"] = True
            await self._notify("long", "Auto steckt ohne Ladung", f"{who} steckt seit über 12 Stunden an der Wallbox und hat nicht geladen.")

    async def _apply(self, cl: GoeClient, cmd: dict[str, int], why: str) -> None:
        try:
            await cl.set(cmd)
        except GoeError as err:
            self._add(f"Befehl fehlgeschlagen: {err}")
            return
        self._last_set.update({k: v for k, v in cmd.items() if k in ("frc", "amp")})
        names = {"frc": {0: "neutral", 1: "aus", 2: "an"}, "amp": None, "psm": {1: "1 Phase", 2: "3 Phasen"}}
        txt = ", ".join(f"{k}={names[k][v] if names[k] else str(v) + ' A'}" for k, v in cmd.items())
        self._add(f"{txt}. {why}".strip())

    def snapshot(self) -> dict[str, Any]:
        due = plan_due(self.cfg, self._soc(), dt_util.now())
        return {
            "cfg": self.cfg, "ok": self.ok, "error": self.err, "info": self.info, "want": self.want, "log": list(self.log),
            "who": self.who, "soc": self._soc(), "plan": {"due": due[0], "need_kwh": round(due[1], 1), "start": due[2].isoformat(timespec="minutes") if due[2] else None},
            "hold": max(0, int(self._hold_until - time.time())),
            "quick": {"k": self._quick["k"], "until": self._quick["until"]} if self._quick else None, "guard": self.guard,
        }
