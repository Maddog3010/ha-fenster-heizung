"""Modul 8: Wallbox lesen und regeln – go-e Charger direkt (lokale HTTP-API v2) oder jede Wallbox über Home Assistant."""
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
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import DOMAIN
from .geraete_calc import grid_import_w, rate_eur, watts
from .wallbox_adapter import KNOWN, WALLBOXISH, GoeAdapter, HaAdapter, WallboxError, guess_roles, manual_change
from .wallbox_calc import (
    CAR_CHARGING, CAR_DONE, CAR_IDLE, EXTERN_HOLD_S, SCHEMA, VOLT, cal_pick, clean_wb, clean_wbx, commands, decide, guard_limit, migrate_v2, parse_nrg,
    plan_due, resolve_who, valid_host, wbx_ready, bat_split, dim_amp, surplus_adj,
)
STALE_S = 180  # B6: so alt darf der Netz-Sensor sein, sonst wird nicht mehr erhöht
from .wallbox_plan import (
    add_energy, add_km, add_temp, build_slots, odo_manual, clean_stats, close_session, day_ok, deadline, est_add, est_set, plan_calc, plan_mode, prices_from_attr, prune, pv_from_wh, session_edit, session_tick, assign_unknown,
    stats_view,
)

EVENT_DONE = "fenster_heizung_ladung_beendet"
SIGNAL_EV = f"{DOMAIN}_wallbox_update"

_LOGGER = logging.getLogger(__name__)

TICK_SECONDS = 10
TIMEOUT_S = 5
KEYS = ("car", "amp", "psm", "frc", "nrg", "wh", "eto", "fwv", "sse", "typ", "fna", "err", "alw", "acu", "pnp", "cbl", "ama", "trx", "cards")
CAR_TEXT = {0: "Unbekannt", 1: "Nicht angesteckt", 2: "Lädt", 3: "Wartet aufs Auto", 4: "Fertig geladen", 5: "Fehler"}


class GoeError(WallboxError):
    """go-e nicht erreichbar oder Antwort unbrauchbar."""


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
        self._mem: dict[str, Any] = {"above_since": None, "below_since": None, "ph_change_ts": None, "ph_set": None, "chg_ts": None, "done_since": None}
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
        self._set_ts = 0.0  # Zeit des letzten eigenen Befehls (für Wallboxen über Home Assistant)
        self._grid_last: Any = None
        self._grid_stale = False
        self.dimmed = False
        self._skip = 0  # B6: bei Funkstille seltener fragen
        self._last_veh = ""  # zuletzt erkanntes Fahrzeug (für die Anzeige nach dem Abstecken)
        self._cal: dict[str, tuple[float, list[dict[str, Any]]]] = {}  # Kalender-Termine je Kalender (5 Minuten zwischengespeichert)
        self._cal_said = ""

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
        self.cfg["vs"] = max(old.get("vs", 1), self.cfg["vs"])  # die Übernahme läuft nur einmal
        if (old.get("wbx") or {}).get("kind") != self.cfg["wbx"]["kind"] or old.get("ip") != self.cfg["ip"]:
            self._last_set, self._hold_until = {}, 0.0
        if not self.cfg["enabled"]:
            self._quick = None
        if old["enabled"] and not self.cfg["enabled"]:
            self._restore = True  # Wallbox wieder auf „neutral“ stellen
        if self.cfg["enabled"] != old["enabled"] or self.cfg["mode"] != old["mode"]:
            self._hold_until = 0.0
            mn = {"off": "Aus", "pv": "Sonne", "minpv": "Sonne + Netz", "now": "Voll"}.get(self.cfg["mode"], self.cfg["mode"])
            self._add(f"Regelung {'ein' if self.cfg['enabled'] else 'aus'}. Modus „{mn}“.")
        await self._store.async_save(self.cfg)
        self._fc = None
        await self._tick(None)
        return self.snapshot()

    def configured(self) -> bool:
        return wbx_ready(self.cfg)

    def _adapter(self) -> GoeAdapter | HaAdapter:
        w = self.cfg["wbx"]
        if w["kind"] == "ha":
            return HaAdapter(self.hass, w)
        return GoeAdapter(GoeClient(self.hass, self.cfg["ip"]), summarize)

    async def async_ha_test(self, raw: Any) -> dict[str, Any]:
        """Andere Wallbox: gewählte Entitäten einmal lesen (ohne zu speichern)."""
        w = clean_wbx({**(raw if isinstance(raw, dict) else {}), "kind": "ha"})
        try:
            r = await HaAdapter(self.hass, w).read()
        except WallboxError as err:
            return {"ok": False, "error": str(err)}
        return {"ok": True, **r["info"], "on": r["cur"]["frc"] == 2, "set_a": r["cur"]["amp"]}

    def scan(self) -> list[dict[str, Any]]:
        """Wallbox-Integrationen in Home Assistant finden und Entitäten je Rolle vorschlagen."""
        from homeassistant.helpers import device_registry as dr, entity_registry as er
        reg, dreg = er.async_get(self.hass), dr.async_get(self.hass)
        by: dict[str, list[Any]] = {}
        for e in reg.entities.values():
            if e.disabled_by is None and e.platform and e.platform != DOMAIN:
                by.setdefault(e.platform, []).append(e)
        out: list[dict[str, Any]] = []
        for plat, items in by.items():
            doms = {x.entity_id.split(".")[0] for x in items}
            txt = " ".join(f"{x.entity_id} {x.original_name or ''}" for x in items)
            if plat not in KNOWN and not (doms & {"switch", "number"} and WALLBOXISH.search(plat + " " + txt)):
                continue
            ents = []
            for x in items[:200]:
                st = self.hass.states.get(x.entity_id)
                a = st.attributes if st is not None else {}
                try:
                    float(str(st.state)) if st is not None else None
                    num = st is not None
                except ValueError:
                    num = False
                ents.append({"eid": x.entity_id, "name": str(a.get("friendly_name") or x.original_name or x.entity_id), "unit": a.get("unit_of_measurement") or "",
                             "dc": a.get("device_class") or x.original_device_class or "", "num": num, "opts": list(a.get("options") or [])[:12]})
            dev = dreg.async_get(items[0].device_id) if items[0].device_id else None
            g = guess_roles(ents)
            out.append({"plat": plat, "name": KNOWN.get(plat) or plat.replace("_", " ").title(), "known": plat in KNOWN,
                        "dev": re.sub(r"[<>\"'&]", "", str((dev.name_by_user or dev.name) if dev else ""))[:40],
                        "guess": g, "ctrl": bool(g.get("switch")), "ents": [{k: e[k] for k in ("eid", "name", "unit")} for e in ents]})
        out.sort(key=lambda x: (not x["known"], not x["ctrl"], x["name"]))
        return out[:12]

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

    def _haus(self) -> dict[str, Any]:
        """Haus-Werte (zentral unter Einstellungen → Haus). Leer, solange sie nicht bereit sind – dann gelten die alten Orte."""
        h = self.hass.data.get(DOMAIN, {}).get("haus")
        return h.data if h is not None and getattr(h, "ready", False) and isinstance(getattr(h, "data", None), dict) else {}

    def _grid_src(self) -> tuple[str, str]:
        """Netz-Sensor und Vorzeichen: Haus-Werte, sonst Modul 3, sonst Photovoltaik in Modul 1."""
        he = (self._haus().get("energy") or {})
        if (he.get("ent") or {}).get("grid"):
            return he["ent"]["grid"], he.get("sign") or "export"
        en = self._modules().get("energy") or {}
        pvc = self._pv_cfg()
        return (en.get("ent") or {}).get("grid") or pvc.get("sensor") or "", en.get("sign") or pvc.get("sign") or "export"

    def _grid_import(self) -> float | None:
        """Netzbezug in Watt (negativ = Einspeisung). B6: Ein Sensor, der seit Minuten nichts meldet, zählt als unbekannt."""
        ent, sign = self._grid_src()
        st = self.hass.states.get(ent) if ent else None
        if st is None:
            return None
        lu = getattr(st, "last_reported", None) or getattr(st, "last_updated", None)
        try:
            if lu is not None and (dt_util.utcnow() - lu).total_seconds() > STALE_S and str(st.state) == str(getattr(self, "_grid_last", None)):
                self._grid_stale = True
                return None
        except TypeError:
            pass
        self._grid_last, self._grid_stale = st.state, False
        w = watts(st.state, st.attributes.get("unit_of_measurement"))
        return None if w is None else grid_import_w(w, sign)

    def _bat(self) -> tuple[float, float]:
        """Hausakku (Laden W, Entladen W) aus den Haus-Werten bzw. Modul 3."""
        en = self._haus().get("energy") or self._modules().get("energy") or {}
        e = en.get("ent") or {}
        w = lambda k: (lambda st: watts(st.state, st.attributes.get("unit_of_measurement")) if st is not None else None)(self.hass.states.get(e[k]) if e.get(k) else None)  # noqa: E731
        return bat_split(en.get("bmode") or "one", en.get("bsign") or "charge", w("bat"), w("bchg"), w("bdis"))

    def surplus_raw(self, wb_power: float) -> float | None:
        imp = self._grid_import()
        return None if imp is None else max(-imp + wb_power, 0.0)

    def surplus(self, wb_power: float) -> float | None:
        """Überschuss in Watt: Einspeisung ins Netz plus die Leistung der Wallbox – ohne das, was der Hausakku gerade abgibt (v0.9)."""
        chg, dis = self._bat()
        return surplus_adj(self.surplus_raw(wb_power), chg, dis, self.cfg["batProtect"], self.cfg["carFirst"])

    def _price_ct(self) -> float | None:
        pvc = {**self._pv_cfg(), **(self._haus().get("price") or {})}
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

    def _price_view(self) -> dict[str, Any] | None:
        """Strompreis für den Chip im Banner (v0.9 Build 4): ct/kWh, Stufe und Quelle.
        Zuerst der Preis, mit dem die Regelung rechnet; sonst der Preisdienst (Modul 20, Haus-Werte, auch Festpreis)."""
        now = dt_util.now()
        ct, src, lvl = self._price_now(now), "", ""
        if ct is not None:
            src = "Tibber" if self._use_tibber() and self._tibber().current_ct(now) is not None else "Preis-Sensor"
        else:
            try:
                from .preisdienst import preis
                p = preis(self.hass, "strom", now)
            except Exception:  # noqa: BLE001 - die Anzeige darf die Regelung nie stören
                p = None
            if not p or p.get("ct") is None:
                return None
            ct, src = float(p["ct"]), {"modul20": "Vertrag", "tibber": "Tibber", "haus": "Haus-Werte"}.get(p.get("src"), "")
            if not p.get("dyn"):
                return {"ct": round(ct, 1), "lvl": "fix", "src": "Festpreis" if src == "Haus-Werte" else src}
        if self.cfg["priceOn"] and ct <= self.cfg["priceMax"]:
            lvl = "billig"
        elif src == "Tibber":
            c = self._tibber()._cache or {}
            day = [p["ct"] for p in c.get("prices") or [] if p["start"].astimezone(now.tzinfo).date() == now.date()]
            if len(day) >= 4:
                avg = sum(day) / len(day)
                lvl = "guenstig" if ct <= avg * 0.9 else "teuer" if ct >= avg * 1.1 else "normal"
        return {"ct": round(ct, 1), "lvl": lvl, "src": src}

    def _eff_view(self) -> dict[str, Any]:
        """Eingestellte Leistung, die gerade gilt (für den Überschuss-Balken): Ladestrom, Phasen, Startschwelle, Verzögerungen."""
        c = self._eff_cfg(self.who)
        return {k: c[k] for k in ("minA", "maxA", "ph", "startW", "onMin", "offMin", "mode")}

    # ---- Fahrzeuge
    def _vehicle(self, vid: str | None) -> dict[str, Any] | None:
        return next((v for v in self.cfg["vehicles"] if v["id"] == vid), None) if vid else None

    def cur_vehicle(self) -> dict[str, Any] | None:
        """Das Fahrzeug, das gerade gilt: an der Karte erkannt, sonst das Fahrzeug ohne Karte, sonst das einzige
        bzw. das zuletzt erkannte, sonst das erste mit Ladestand-Sensor (so wie bisher, als es nur einen Sensor gab)."""
        vs = self.cfg["vehicles"]
        w = self.who
        if w and w.get("kind") == "vehicle":
            v = self._vehicle(w.get("id")) or next((x for x in vs if x["name"] == w.get("name")), None)
            if v:
                return v
        if w and w.get("kind") == "guest":
            return None
        v = self._vehicle(self.cfg.get("defVeh")) or (vs[0] if len(vs) == 1 else None) or self._vehicle(self._last_veh)
        return v or next((x for x in vs if x["ent"].get("soc")), None)

    def _legacy_ent(self, k: str) -> str:
        return ((self._modules().get("ev") or {}).get("ent") or {}).get(k) or ""

    def veh_soc(self, v: dict[str, Any] | None) -> float | None:
        """Ladestand vom Sensor des Fahrzeugs, sonst (B4) der geschätzte Ladestand."""
        eid = (v or {}).get("ent", {}).get("soc") if v else (self._legacy_ent("soc") if not self.cfg["vehicles"] else "")
        x = self._num(eid)
        if x is not None and 0 <= x <= 100:
            return x
        e = self._st["est"].get(v["id"]) if v and not eid else None
        return round(e["soc"], 1) if e else None

    def veh_est(self, v: dict[str, Any] | None) -> dict[str, Any] | None:
        """B4: Schätzung für ein Fahrzeug ohne Ladestand-Sensor (soc, set, stale) oder None."""
        if not v or v["ent"].get("soc"):
            return None
        return self._st["est"].get(v["id"])

    async def async_est(self, vid: str, soc: float) -> dict[str, Any]:
        """B4: „Auto hat jetzt … %“ – Startwert der Schätzung (nur für Fahrzeuge ohne Ladestand-Sensor)."""
        v = self._vehicle(vid)
        if v is not None:
            est_set(self._st, vid, soc, dt_util.now())
            self._st_store.async_delay_save(lambda: self._st, 2)
            self._add(f"Ladestand von {v['name']} eingegeben: {round(soc)} %. Ab jetzt wird beim Laden geschätzt.")
        return self.snapshot()

    async def async_odo(self, vid: str, km: float) -> dict[str, Any]:
        """Kilometerstand von Hand für ein Fahrzeug ohne Kilometer-Sensor (Statistik)."""
        v = self._vehicle(vid)
        if v is None:
            return {"ok": False, "err": "Fahrzeug nicht gefunden."}
        if v["ent"].get("odo"):
            return {"ok": False, "err": "Dieses Fahrzeug hat einen Kilometer-Sensor."}
        r = odo_manual(self._st, vid, v["name"], km, dt_util.now().date())
        if r["ok"]:
            self._st_store.async_delay_save(lambda: self._st, 2)
            self._add(f"Kilometerstand von {v['name']}: {round(km)} km" + ("" if r["base"] else f", {round(r['km'])} km auf {r['days']} Tage verteilt") + ".")
        return {**r, "snap": self.snapshot()}

    async def async_assign(self, d0: str, d1: str, to: str) -> dict[str, Any]:
        """Ladestatistik: „Unbekannt“ im Zeitraum einem Fahrzeug zuordnen."""
        r = assign_unknown(self._st, d0, d1, to, dt_util.now())
        self._st_store.async_delay_save(lambda: self._st, 2)
        if r["kwh"] > 0 or r["n"]:
            self._add(f"{str(round(r['kwh'], 1)).replace('.', ',')} kWh „Unbekannt“ an {to} zugeordnet ({r['n']} Ladungen).")
        return self.stats()

    async def async_session(self, start: str, ch: dict[str, Any]) -> dict[str, Any]:
        """Ladestatistik: eine abgeschlossene Ladung bearbeiten oder löschen."""
        r = session_edit(self._st, start, ch, dt_util.now())
        if r is None:
            raise ValueError("Ladung nicht gefunden")
        self._st_store.async_delay_save(lambda: self._st, 2)
        t = start[:16].replace("T", " ")
        self._add(f"Ladung vom {t} gelöscht." if r.get("deleted") else f"Ladung vom {t} bearbeitet.")
        return self.stats()

    def _soc(self) -> float | None:
        return self.veh_soc(self.cur_vehicle())

    def _cap(self) -> float:
        v = self.cur_vehicle()
        return float(v["cap"]) if v and v.get("cap") else float(self.cfg["cap"])

    def _bat_ok(self) -> bool:
        if not self.cfg["batOn"]:
            return True
        soc_ent = self._haus().get("soc") or self._pv_cfg().get("soc_sensor")
        v = self._num(soc_ent)
        return v is None or v >= self.cfg["batSoc"]

    # ---- Abfahrt aus dem Kalender (v0.9 Build 4, vorher Lab „Ladeziel nach Kalender“)
    async def _cal_refresh(self) -> None:
        """Termine der nächsten 36 Stunden je Kalender holen (calendar.get_events, höchstens alle 5 Minuten)."""
        now, ts = dt_util.now(), time.time()
        for cal in {(v.get("dep") or {}).get("cal") for v in self.cfg["vehicles"]} - {"", None}:
            got = self._cal.get(cal)
            if got and ts - got[0] < 300:
                continue
            evs: list[dict[str, Any]] = []
            try:
                res = await self.hass.services.async_call("calendar", "get_events", {"entity_id": cal, "start_date_time": now.isoformat(),
                                                          "end_date_time": (now + timedelta(hours=36)).isoformat()}, blocking=True, return_response=True)
                for e in ((res or {}).get(cal) or {}).get("events") or []:
                    st, en = dt_util.parse_datetime(str(e.get("start") or "")), dt_util.parse_datetime(str(e.get("end") or ""))
                    if st is None or "T" not in str(e.get("start") or ""):
                        continue  # ganztägig: keine Uhrzeit, keine Abfahrt
                    evs.append({"summary": e.get("summary") or "", "start": dt_util.as_local(st), "end": dt_util.as_local(en) if en else None})
            except Exception as err:  # noqa: BLE001 - ohne Kalender gilt einfach der normale Plan
                st = self.hass.states.get(cal)  # Rückfall: nächster Termin aus den Attributen
                a = st.attributes if st is not None else {}
                s0, e0 = dt_util.parse_datetime(str(a.get("start_time") or "")), dt_util.parse_datetime(str(a.get("end_time") or ""))
                if s0 is not None and not a.get("all_day"):
                    tz = now.tzinfo
                    evs.append({"summary": a.get("message") or "", "start": s0.replace(tzinfo=s0.tzinfo or tz), "end": e0.replace(tzinfo=e0.tzinfo or tz) if e0 else None})
                _LOGGER.debug("Modul 8: Kalender %s: %s", cal, err)
            self._cal[cal] = (ts, evs)

    def _cal_trip(self, v: dict[str, Any] | None) -> dict[str, Any] | None:
        dp = (v or {}).get("dep") or {}
        if not dp.get("cal"):
            return None
        return cal_pick((self._cal.get(dp["cal"]) or (0, []))[1], dp, dt_util.now())

    def _eff_cfg(self, who: dict[str, Any] | None) -> dict[str, Any]:
        """Einstellungen, die gerade gelten: Modus/Limit/Abfahrt des Fahrzeugs, Lab „Ladeziel nach Kalender“, feste Phasen."""
        cfg = {**self.cfg, "cap": self._cap()}
        if who is not None:
            cfg = {**cfg, "mode": who["mode"], "limit": who["limit"]}
            dp = who.get("dep") or {}
            if who["kind"] == "vehicle" and dp.get("on"):  # eigene Abfahrt dieses Fahrzeugs
                cfg = {**cfg, "planSoc": dp["soc"], "planTime": dp["time"], "planDays": dp["days"]}
        v = self._vehicle(who.get("id")) if who is not None and who.get("kind") == "vehicle" else (self.cur_vehicle() if who is None else None)
        trip = self._cal_trip(v)
        if trip is not None:  # Abfahrt aus dem Kalender: gilt, wenn keine normale Abfahrt früher kommt
            now = dt_util.now()
            reg = deadline(now, cfg["planTime"]) if cfg["planOn"] or cfg["plan"] else None
            if reg is not None and not day_ok(cfg["planDays"], reg):
                reg = None
            if reg is None or trip["at"] <= reg:
                at = trip["at"].isoformat(timespec="minutes")
                cfg = {**cfg, "planOn": True, "planSoc": trip["soc"], "planTime": trip["at"].strftime("%H:%M"), "planAt": at, "planDays": "all",
                       "planCal": {"msg": trip["msg"], "start": trip["start"].isoformat(timespec="minutes"), "at": at}}
                key = f"{trip['msg']}|{at}"
                if key != self._cal_said:
                    self._cal_said = key
                    self._add(f"Abfahrt aus dem Kalender: „{trip['msg'] or 'Termin'}“, losfahren {trip['at'].strftime('%d.%m. %H:%M')} Uhr, Ziel {trip['soc']} %.")
        w = cfg["wbx"]
        if w["kind"] == "ha" and not w["ent"].get("phase"):
            cfg = {**cfg, "ph": "1" if w["ph"] == 1 else "3"}  # diese Wallbox kann die Phasen nicht umschalten
        return cfg

    # ---- Takt
    async def _migrate(self) -> None:
        """Schema 2: Sensoren und Aussehen je Fahrzeug. Läuft einmal, sobald die Moduleinstellungen geladen sind.
        Schema 3: Lab „Ladeziel nach Kalender“ wird zur Abfahrt aus dem Kalender an den Fahrzeugen."""
        if self.cfg.get("vs", 1) < 2:
            wm = self.hass.data.get(DOMAIN, {}).get("wasser")
            if wm is None or not getattr(wm, "modules", None):
                return
            self.cfg, txt = migrate_v2(self.cfg, wm.modules.get("ev"))
            await self._store.async_save(self.cfg)
            if txt:
                self._add(txt + ".")
                _LOGGER.info("Modul 8: %s", txt)
        if self.cfg.get("vs", 1) < 3:
            if self.hass.data.get(DOMAIN, {}).get("layout") is None:
                return  # Einstellungen noch nicht geladen
            from .labs import labs_cfg  # noqa: PLC0415
            lc = labs_cfg(self.hass)
            on, lv = "lk" in (lc.get("on") or []), lc.get("cfg") or {}
            cal = lv.get("lk_cal") if isinstance(lv.get("lk_cal"), str) else ""
            vs = [dict(v) for v in self.cfg["vehicles"]]
            moved = on and cal.startswith("calendar.") and vs and not any((v.get("dep") or {}).get("cal") for v in vs)
            if moved:
                for v in vs:
                    v["dep"] = {**(v.get("dep") or {}), "cal": cal, "calSoc": lv.get("lk_hi", 90), "calDur": lv.get("lk_dur", 2), "calLead": 30}
            self.cfg = clean_wb({**self.cfg, "vehicles": vs, "vs": 3})
            await self._store.async_save(self.cfg)
            if moved:
                self._add("Lab „Ladeziel nach Kalender“ übernommen: Abfahrt aus dem Kalender an den Fahrzeugen.")

    async def _tick(self, _now: Any) -> None:
        if self._busy:
            return
        self._busy = True
        try:
            if self.cfg.get("vs", 1) < SCHEMA:
                await self._migrate()
            await self._run()
        finally:
            self._busy = False

    async def _run(self) -> None:
        cfg = self.cfg
        if any((v.get("dep") or {}).get("cal") for v in cfg["vehicles"]):
            await self._cal_refresh()
        if not wbx_ready(cfg):
            self.ok, self.info = False, {}
            return
        if self._skip > 0:
            self._skip -= 1
            return
        cl = self._adapter()
        try:
            rd = await cl.read()
        except WallboxError as err:
            if self.ok or not self.err:
                self._add(f"Wallbox nicht erreichbar: {err}")
            self.ok, self.err = False, str(err)
            self._fail += 1
            self._skip = 2 if self._fail >= 30 else 0  # nach 5 Minuten Funkstille nur noch alle 30 Sekunden fragen
            if self._fail >= 6 and not self._n["off"]:
                self._n["off"] = True
                await self._notify("off", "Wallbox nicht erreichbar", f"Die Wallbox antwortet seit einer Minute nicht: {err}")
            return
        self._fail, self._skip = 0, 0
        self._n["off"] = False
        self.ok, self.err = True, ""
        self.guard = None
        self.info = rd["info"]
        self._count(st_car=self.info["car"])
        await self._events(time.time())
        self._quick_check(self.info["car"], time.time())
        if self._restore:
            self._restore = False
            await self._apply(cl, {"frc": 0}, "Regelung ausgeschaltet: Die Wallbox ist wieder auf „neutral“.")
            return
        if not cfg["enabled"]:
            self.want = {}
            self.who = resolve_who(cfg, self._card)
            return
        if not self.info.get("ctrl", True):
            self.want = {"state": "anzeige", "reason": "Diese Wallbox hat keine Schalter-Entität. Strom & Wärme zeigt nur an und regelt nicht."}
            return
        now_ts = time.time()
        cur = dict(rd["cur"])
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
        if who and who.get("kind") == "vehicle":
            self._last_veh = who.get("id") or ""
        if cfg["lock"] and who is None and cl.rfid:
            self.want = {"state": "gesperrt", "reason": "Wartet auf eine Karte. Strom & Wärme verändert nichts, bis ein Fahrzeug erkannt ist."}
            return
        cfg = self._eff_cfg(who)
        # Jemand hat von Hand umgestellt: nicht dagegen regeln
        if manual_change(self._last_set, cur, cl.kind, self._set_ts, now_ts):
            self._hold_until = now_ts + EXTERN_HOLD_S
            self._last_set = {}
            self._add("Wallbox von Hand umgestellt: Die Regelung pausiert 30 Minuten.")
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
        if self.want.get("pause"):
            self.info["car_text"] = "kurze Pause"  # go-e meldet „fertig“, das Auto startet aber gleich wieder
        self._guard(cfg, wb_w)
        self._dim()
        if q:
            self.want["quick"] = q["k"]
        cmd = commands(self.want, cur)
        if cmd:
            if "psm" in cmd:
                self._mem["ph_change_ts"] = now_ts
                self._mem["ph_set"] = 1 if cmd["psm"] == 1 else 3
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
        card = next((c["n"] for c in self.info.get("cards") or [] if w and c["i"] == w.get("card")), "") if w and w.get("card") else ""
        cv = self.cur_vehicle()
        done = session_tick(self._st, now, charging, power)
        if done:
            self._fire_done(done)
        add_km(self._st, now, self._odo(), cv["id"] if cv else "", cv["name"] if cv else "")
        gm = self.hass.data.get(DOMAIN, {}).get("general")
        if gm is not None and dt > 0:
            try:
                add_temp(self._st, now, gm.outdoor()[0], dt)
            except Exception:  # noqa: BLE001 - die Temperatur ist nur für die Statistik
                pass
        if charging and power > 0 and dt > 0:
            add_energy(self._st, now, dt, power, self.surplus_raw(power), self._price_now(now), veh, card)  # Sonne = Überschuss und Hausakku (wie bisher)
            if cv and not cv["ent"].get("soc"):
                est_add(self._st, cv["id"], power * dt / 3.6e6, self._cap())
        day = now.date().isoformat()
        if day != self._st_day:
            self._st_day = day
            prune(self._st, now.date())
        self._st_store.async_delay_save(lambda: self._st, 60)

    def _fire_done(self, ses: dict[str, Any]) -> None:
        """B9: Ereignis „Ladung beendet“ für eigene Automationen (kWh, Sonne, Kosten, Fahrzeug, Karte)."""
        kwh = ses.get("kwh") or 0.0
        self.hass.bus.async_fire(EVENT_DONE, {"fahrzeug": ses.get("veh"), "karte": ses.get("card") or None, "kwh": round(kwh, 2), "sonne_kwh": round(ses.get("pv") or 0.0, 2),
                                              "sonnenanteil": round((ses.get("pv") or 0.0) / kwh * 100) if kwh > 0 else 0, "kosten_eur": round(ses.get("cost") or 0.0, 2),
                                              "minuten": round(ses.get("min") or 0.0), "start": ses.get("start")})

    def ev_values(self) -> dict[str, Any]:
        """B9: Werte für die Sensoren von Modul 8 (Ladestand, fertig um, nächster Ladestart, Sonne jetzt)."""
        v = self.cur_vehicle()
        soc = self._soc()
        i, w = self.info or {}, self.want or {}
        pw = (i.get("power") or 0.0) if i.get("car") == CAR_CHARGING else 0.0
        cfg = self._eff_cfg(self.who)
        goal = cfg["planSoc"] if (self.who or {}).get("dep", {}) and (self.who.get("dep") or {}).get("on") else cfg["limit"]
        goal = min(goal, cfg["limit"])
        need = max(0.0, (goal - soc) / 100 * self._cap()) if soc is not None else None
        done = dt_util.now() + timedelta(hours=need / (pw / 1000)) if need and pw > 500 else None
        nxt = None
        if self.cfg["planOn"] and self._slots:
            pv = self.plan_view()
            st = [self._slots[x["s"]]["t"] for x in pv.get("wins") or [] if x["s"] < len(self._slots)]
            nxt = next((t for t in st if t > dt_util.now()), None)
        sun = round(min(100.0, max(0.0, (w.get("surplus_w") or 0.0) / pw * 100))) if pw > 0 and w.get("surplus_w") is not None else None
        return {"ok": self.configured() or bool(v), "soc": soc, "est": self.veh_est(v) is not None, "veh": v["name"] if v else None, "goal": goal, "need": round(need, 1) if need is not None else None,
                "done": done, "next": nxt, "sun": sun, "power": round(pw / 1000, 2), "state": w.get("state")}

    def stats(self) -> dict[str, Any]:
        return {**stats_view(self._st), "odoset": dict(self._st.get("odoset") or {}), "odos": {k: round(v, 1) for k, v in (self._st.get("odos") or {}).items()}}

    # ---- Planung nach Preis und PV-Prognose
    async def _pv_forecast(self, now: Any) -> tuple[dict[Any, float], dict[str, Any], str]:
        """Überschuss-kW je Stunde aus Forecast.Solar (Aktion forecast_solar.get_forecast) oder aus einem eigenen Sensor."""
        base_kw = self.cfg["baseW"] / 1000
        info: dict[str, Any] = {"found": False}
        wh: dict[Any, float] = {}
        src = self.cfg["pvSrc"]
        if src in ("auto", "m16"):
            sm = self.hass.data.get(DOMAIN, {}).get("solar")
            m16 = dict(getattr(sm, "_wh", {}) or {}) if sm is not None and sm.active() else {}
            if m16:
                v = sm.values()
                info = {"found": True, "m16": True, "sites": [{"name": re.sub(r"[<>\"'&]", "", str(n))[:30], "kwp": 0.0} for n in (v.get("sites") or [])],
                        "today": v.get("today"), "tomorrow": v.get("tomorrow"), "corr": v.get("corr")}
                return pv_from_wh(m16, base_kw, now.tzinfo), info, "Modul 16 · Solar-Prognose"
            if src == "m16":
                return {}, {"found": False, "m16": True}, "Modul 16 · Solar-Prognose (keine Daten)"
            src = "forecast"  # Rückfall: Forecast.Solar direkt
        if src == "forecast":
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
            return {**self._fc[1], "plan": self.plan_view()}
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
        return {**out, "plan": self.plan_view()}

    def plan_view(self) -> dict[str, Any]:
        """B1: Der Plan, den die Regelung wirklich nutzt – für die Oberfläche (keine zweite Rechnung im Browser)."""
        now = dt_util.now()
        who = self.who if self.who is not None else resolve_who(self.cfg, self._card)
        cfg = self._eff_cfg(who)
        v = self.cur_vehicle()
        own = bool(who and who.get("kind") == "vehicle" and (who.get("dep") or {}).get("on"))
        base = {"veh": v["name"] if v else "", "vid": v["id"] if v else "", "own": own, "est": self.veh_est(v) is not None, "target": cfg["planSoc"], "until": cfg["planTime"],
                "days": cfg["planDays"], "strat": cfg["planStrat"], "cap": cfg["cap"], "cal": cfg.get("planCal")}
        soc = self._soc()
        if soc is None:
            return {"ok": False, "why": "soc", **base}
        if not self._slots:
            return {"ok": False, "why": "fc", **base, "soc": soc}
        o = self._plan_opts(cfg, soc, self._slot_res)
        R = plan_calc(self._slots, now, o)
        pm = plan_mode(self._slots, R, now, o)
        wins: list[dict[str, Any]] = []
        for i in sorted(R["sel"]):
            e, sl = R["sel"][i], self._slots[i]
            kw = e / sl["h"]
            share = min(1.0, sl["pv"] / kw) if kw > 0 else 0.0
            if wins and wins[-1]["e"] == i:
                w = wins[-1]
                w["e"], w["kwh"], w["pv"], w["cost"] = i + 1, w["kwh"] + e, w["pv"] + e * share, w["cost"] + e * (1 - share) * (sl["price"] or 0) / 100
            else:
                wins.append({"s": i, "e": i + 1, "kwh": e, "pv": e * share, "cost": e * (1 - share) * (sl["price"] or 0) / 100})
        r2 = lambda x: round(x, 3)  # noqa: E731
        return {
            "ok": True, **base, "soc": soc, "pmax": o["pmax"], "need": r2(R["need"]), "left": r2(R["left"]),
            "deadline": R["deadline"].isoformat(timespec="minutes"), "day_ok": day_ok(cfg["planDays"], R["deadline"]),
            "sel": {str(i): r2(e) for i, e in R["sel"].items()}, "plan": {k: r2(x) for k, x in R["plan"].items()}, "imm": {k: r2(x) for k, x in R["imm"].items()},
            "wins": [{"s": w["s"], "e": w["e"], "kwh": r2(w["kwh"]), "share": round(w["pv"] / w["kwh"] * 100) if w["kwh"] > 0 else 0, "cost": r2(w["cost"])} for w in wins],
            "now": {"mode": pm["mode"], "state": pm["state"], "reason": pm["reason"]},
        }

    def _plan_opts(self, cfg: dict[str, Any], soc: float, res: str) -> dict[str, Any]:
        ph = 1 if cfg["ph"] == "1" else 3
        return {"strat": cfg["planStrat"], "target": cfg["planSoc"], "soc": soc, "cap": cfg["cap"], "until": cfg.get("planAt") or cfg["planTime"],
                "pmax": round(cfg["maxA"] * VOLT * ph / 1000, 2), "minkw": max(1.4, cfg["startW"] / 1000), "rank": "level" if res == "lvl" else "price"}

    async def _plan_now(self, cfg: dict[str, Any], now: Any) -> dict[str, Any] | None:
        """Planung für jetzt. None = nicht planbar (zum Beispiel Ladestand unbekannt) – dann gilt der normale Modus."""
        soc = self._soc()
        if soc is None:
            return None
        if not day_ok(cfg["planDays"], deadline(now, cfg.get("planAt") or cfg["planTime"])):
            return None  # an diesem Tag ist keine Abfahrt geplant
        await self.forecast()
        slots = self._slots
        if not slots:
            return None
        o = self._plan_opts(cfg, soc, self._slot_res)
        R = plan_calc(slots, now, o)
        return plan_mode(slots, R, now, o)

    def _odo(self) -> float | None:
        v = self.cur_vehicle()
        eid = v["ent"].get("odo") if v else (self._legacy_ent("odo") if not self.cfg["vehicles"] else "")
        x = self._num(eid)
        return x if x is not None and x >= 0 else None

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

    def _dim(self) -> None:
        """B7 § 14a EnWG: Ist das Signal des Netzbetreibers an, höchstens die vorgegebene Leistung."""
        d = self.cfg["dim"]
        st = self.hass.states.get(d["ent"]) if d["on"] and d["ent"] else None
        self.dimmed = bool(st is not None and str(st.state).lower() in ("on", "true", "1", "aktiv", "active"))
        w = self.want
        if not self.dimmed or w.get("frc") != 2:
            return
        ph = 1 if w.get("psm") == 1 else 3
        mx = dim_amp(d["kw"], ph)
        if w.get("amp", 0) > mx:
            w["amp"] = mx
            w["state"] = "gedimmt"
            w["reason"] = f"§ 14a: Der Netzbetreiber dimmt auf {str(d['kw']).replace('.', ',')} kW – höchstens {mx} A. " + w.get("reason", "")

    def _quick_check(self, car: int | None, now_ts: float) -> None:
        q = self._quick
        if not q:
            return
        if car is not None and car != CAR_IDLE:
            q["seen"] = True
        done = car == CAR_DONE and (self.want or {}).get("state") == "fertig"  # nicht bei der kurzen Pause nach dem Umschalten
        if (car == CAR_IDLE and q["seen"]) or done or (q["until"] and now_ts > q["until"]):
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
            if prev is not None and prev != CAR_IDLE:  # abgesteckt: das Auto fährt, die Schätzung stimmt nicht mehr sicher
                for e in self._st["est"].values():
                    e["stale"] = True
            self._plug_ts, self._charged = None, False
            self._n.update(start=False, goal=False, plan=False, long=False)
            return
        if self._plug_ts is None:
            self._plug_ts = now_ts
        if car == CAR_CHARGING:
            self._charged = True
        w = self.want or {}
        if ((car == CAR_DONE and w.get("state") == "fertig") or w.get("state") == "limit") and not self._n["goal"]:
            self._n["goal"] = True
            await self._notify("goal", "Ladeziel erreicht", f"{who} ist fertig geladen.")
        if self._plan_late and not self._n["plan"]:
            self._n["plan"] = True
            await self._notify("plan", "Ladeplan braucht Netzstrom", "Die Sonne reicht nicht bis zur Abfahrt. Es wird mit Netzstrom nachgeladen.")
        if not self._charged and not self._n["long"] and now_ts - self._plug_ts > 12 * 3600:
            self._n["long"] = True
            await self._notify("long", "Auto steckt ohne Ladung", f"{who} steckt seit über 12 Stunden an der Wallbox und hat nicht geladen.")

    async def _apply(self, cl: GoeAdapter | HaAdapter, cmd: dict[str, int], why: str) -> None:
        try:
            await cl.set(cmd, self.cfg["maxA"])
        except WallboxError as err:
            self._add(f"Befehl fehlgeschlagen: {err}")
            return
        self._set_ts = time.time()
        self._last_set.update({k: v for k, v in cmd.items() if k in ("frc", "amp")})
        names = {"frc": {0: "Wallbox frei", 1: "Laden aus", 2: "Laden an"}, "amp": None, "psm": {1: "1 Phase", 2: "3 Phasen"}}
        txt = ", ".join(names[k][v] if names[k] else f"{v} A" for k, v in cmd.items())
        self._add(f"{txt}. {why}".strip())

    def snapshot(self) -> dict[str, Any]:
        due = plan_due({**self.cfg, "cap": self._cap()}, self._soc(), dt_util.now())
        return {
            "cfg": self.cfg, "ok": self.ok, "error": self.err, "info": self.info, "want": self.want, "log": list(self.log),
            "who": self.who, "soc": self._soc(), "plan": {"due": due[0], "need_kwh": round(due[1], 1), "start": due[2].isoformat(timespec="minutes") if due[2] else None},
            "hold": max(0, int(self._hold_until - time.time())),
            "quick": {"k": self._quick["k"], "until": self._quick["until"]} if self._quick else None, "guard": self.guard,
            "veh": (self.cur_vehicle() or {}).get("id") or "", "socs": {v["id"]: self.veh_soc(v) for v in self.cfg["vehicles"]},
            "est": {v["id"]: self.veh_est(v) for v in self.cfg["vehicles"] if self.veh_est(v)},
            "price": self._price_view(), "eff": self._eff_view(),
            "ready": self.configured(), "kind": self.cfg["wbx"]["kind"], "dimmed": self.dimmed, "stale": self._grid_stale,
            "bat": dict(zip(("chg", "dis"), self._bat())),
        }
