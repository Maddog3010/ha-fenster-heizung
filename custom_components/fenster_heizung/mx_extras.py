"""Sponsor Max · Extras (Beta 2026.11.4.4b4): Wohnklima-Zeugnis, Heizkosten je Raum, Wand-Tablet-Extras.

Build 1  Freischaltung (nur Sponsor Max oder Entwickler-Zugang), Schalter in „Deine Extras“, Einstellungen.
Build 2  Wohnklima-Zeugnis: alle 5 Minuten eine Probe je Raum aus Modul 1 (Temperatur, Soll, Feuchte, Fenster), Tageszähler,
         Wochenzeugnis Mo 0:05, Monatszeugnis am 1. um 0:10, Ereignis ``fenster_heizung_wohnklima_zeugnis``,
         Zeilen für Morgen-Briefing und Monatsbericht, optional Push über die Dienste des Morgen-Briefings.
Build 3  Heizkosten je Raum: Elektroheizer (Energiezähler des Geräts = gemessen, sonst Leistung × Laufzeit), zentrale Heizung
         nach Heizlast × Ventilöffnung verteilt und – mit Zähler – genau auf den Zähler abgeglichen, Fenster-offen-Kosten.
         Räume ohne Thermostat und ohne Heizer (Messräume) erscheinen nicht.
Build 4  Wand-Tablet-Extras: Einstellungen je Tablet, Zustand (wach/ruhe/nacht/schlafen/alarm) vom Tablet, Wecken per
         Knopf-Entität, Display an bei Alarm aus Modul 11, Ladesteckdose für den Tablet-Akku (30–80 %).

Ein Extra arbeitet nur, wenn es eingeschaltet ist (Sponsor-Einstellung mx_wk/mx_hk/mx_tb) und Sponsor Max aktiv ist.
Ist es aus, bleiben Einstellungen und Daten 30 Tage erhalten, danach werden die Tageswerte gelöscht.
Nichts verlässt Home Assistant (außer der Push-Nachricht über die eigenen Benachrichtigungsdienste).
"""
from __future__ import annotations

import logging
import random
import re
import time
from datetime import date, datetime, timedelta
from typing import Any, Callable

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect, async_dispatcher_send
from homeassistant.helpers.event import async_track_state_change_event, async_track_time_change, async_track_time_interval
from homeassistant.util import dt as dt_util

from . import mx_logic as L
from .backup import SafeStore
from .const import CONF_HUMIDITY, CONF_ROOM_AREA, CONF_THERMOSTATS, CONF_WINDOWS, DOMAIN

_LOGGER = logging.getLogger(__name__)

SIGNAL = f"{DOMAIN}_mx_update"
EVENT_ZEUGNIS = f"{DOMAIN}_wohnklima_zeugnis"
EVENT_WAKE = f"{DOMAIN}_mx_wake"
EXTRAS = ("wk", "hk", "tb")
KEEP_DAYS = 400
GRACE_DAYS = 30
TB_STATES = ("wach", "ruhe", "nacht", "schlafen", "alarm")
TB_STALE_S = 180
_ENT = re.compile(r"^[a-z_]+\.[a-z0-9_]+$")
_TID = re.compile(r"^[a-z0-9]{6,20}$")
_NIGHT = re.compile(r"^([01]?\d|2[0-3])-([01]?\d|2[0-3])$")
FUEL_CHOICES = ("auto", "erdgas", "fluessiggas", "heizoel", "pellets", "fern", "strom")


def _ent(v: Any, domains: tuple[str, ...]) -> str:
    return v if isinstance(v, str) and _ENT.match(v) and v.split(".")[0] in domains else ""


def _f(v: Any) -> float | None:
    try:
        x = float(v)
    except (TypeError, ValueError):
        return None
    return x if x == x and abs(x) < 1e9 else None


def _eur(v: float) -> str:
    return f"{v:.2f}".replace(".", ",")


def default_cfg() -> dict[str, Any]:
    return {
        "wk": {"week": True, "month": True, "brief": True, "push": False, "lim": {}},
        "hk": {"meter": "", "fuel": "auto", "price": None, "eff": None, "winc": True, "rooms": {}},
        "tb": {},
    }


def default_tb() -> dict[str, Any]:
    return {"room": "", "night": "22-6", "nc": "red", "dark": False, "shift": True, "acts": [], "alarm": True, "bright": "", "bat": "", "charge": ""}


def clean_tb(raw: Any) -> dict[str, Any]:
    r = raw if isinstance(raw, dict) else {}
    d = default_tb()
    night = r.get("night")
    acts = [a for a in (r.get("acts") or []) if _ent(a, ("scene", "script", "switch", "light", "input_boolean", "button"))][:4]
    return {
        "room": str(r.get("room") or "")[:64],
        "night": night if night in ("off", "sun") or (isinstance(night, str) and _NIGHT.match(night)) else d["night"],
        "nc": r.get("nc") if r.get("nc") in ("red", "teal") else d["nc"],
        "dark": bool(r.get("dark")),
        "shift": r.get("shift") is not False,
        "acts": list(dict.fromkeys(acts)),
        "alarm": r.get("alarm") is not False,
        "bright": _ent(r.get("bright"), ("number", "light")),
        "bat": _ent(r.get("bat"), ("sensor",)),
        "charge": _ent(r.get("charge"), ("switch",)),
    }


def clean_cfg(raw: Any, old: dict[str, Any] | None = None) -> dict[str, Any]:
    out = default_cfg()
    old = old or {}
    r = raw if isinstance(raw, dict) else {}
    wk_in = {**(old.get("wk") or {}), **(r.get("wk") if isinstance(r.get("wk"), dict) else {})}
    for k in ("week", "month", "brief", "push"):
        if isinstance(wk_in.get(k), bool):
            out["wk"][k] = wk_in[k]
    lim = wk_in.get("lim") if isinstance(wk_in.get("lim"), dict) else {}
    out["wk"]["lim"] = {str(k)[:64]: L.limits(v) for k, v in list(lim.items())[:60] if isinstance(v, dict)}
    hk_in = {**(old.get("hk") or {}), **(r.get("hk") if isinstance(r.get("hk"), dict) else {})}
    out["hk"]["meter"] = _ent(hk_in.get("meter"), ("sensor",))
    out["hk"]["fuel"] = hk_in.get("fuel") if hk_in.get("fuel") in FUEL_CHOICES else "auto"
    p = _f(hk_in.get("price"))
    out["hk"]["price"] = round(min(max(p, 0.0), 200.0), 2) if p is not None else None
    e = _f(hk_in.get("eff"))
    out["hk"]["eff"] = round(min(max(e, 0.3), 6.0), 2) if e is not None else None
    out["hk"]["winc"] = hk_in.get("winc") is not False
    rooms = hk_in.get("rooms") if isinstance(hk_in.get("rooms"), dict) else {}
    rc: dict[str, Any] = {}
    for rid, v in list(rooms.items())[:60]:
        if not isinstance(v, dict):
            continue
        fct, hh = _f(v.get("f")), _f(v.get("h"))
        rc[str(rid)[:64]] = {"f": round(min(max(fct, 0.1), 10.0), 2) if fct is not None else None,
                             "h": round(min(max(hh, 1.8), 6.0), 2) if hh is not None else L.ROOM_H}
    out["hk"]["rooms"] = rc
    tb_in = {**(old.get("tb") or {}), **(r.get("tb") if isinstance(r.get("tb"), dict) else {})}
    out["tb"] = {tid: clean_tb(v) for tid, v in list(tb_in.items())[:20] if isinstance(tid, str) and _TID.match(tid)}
    return out


def _week_bounds(day: date) -> tuple[date, date]:
    s = day - timedelta(days=day.weekday())
    return s, s + timedelta(days=6)


def _month_bounds(day: date) -> tuple[date, date]:
    s = day.replace(day=1)
    n = (s.replace(day=28) + timedelta(days=4)).replace(day=1)
    return s, n - timedelta(days=1)


class MxExtrasManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_mx_extras")
        self.cfg = default_cfg()
        self.wk: dict[str, dict[str, Any]] = {}  # datum -> raum -> Zähler
        self.hk: dict[str, dict[str, Any]] = {}  # datum -> raum|"_" -> Werte
        self.off_since: dict[str, float] = {}
        self.sent: dict[str, str] = {}  # "week"/"month" -> Zeitraum, für den das Zeugnis schon verschickt wurde
        self.tb: dict[str, dict[str, Any]] = {}  # Laufzeit: tid -> {"state", "ts"}
        self.wake_ts: dict[str, float] = {}
        self.risk_now: dict[str, bool] = {}
        self._open: dict[str, dict[str, Any]] = {}  # raum -> offenes Fenster
        self._last: dict[str, Any] = {}  # letzte Zählerstände (Heizer, Zähler)
        self._unsubs: list[CALLBACK_TYPE] = []
        self._tb_unsubs: list[CALLBACK_TYPE] = []
        self._sf_alarm = False
        self._ent_cb: list[Callable[[], None]] = []

    # ------------------------------------------------------------ Lebenslauf
    async def async_start(self) -> None:
        d = await self._store.async_load() or {}
        self.cfg = clean_cfg(d.get("cfg"))
        self.wk = d.get("wk") if isinstance(d.get("wk"), dict) else {}
        self.hk = d.get("hk") if isinstance(d.get("hk"), dict) else {}
        self.off_since = {k: float(v) for k, v in (d.get("off") or {}).items() if k in EXTRAS and _f(v) is not None}
        self.sent = {k: str(v) for k, v in (d.get("sent") or {}).items() if k in ("week", "month")}
        self._unsubs.append(async_track_time_interval(self.hass, self._sample, timedelta(minutes=L.SAMPLE_MIN)))
        self._unsubs.append(async_track_time_change(self.hass, self._weekly, hour=0, minute=5, second=30))
        self._unsubs.append(async_track_time_change(self.hass, self._monthly, hour=0, minute=10, second=30))
        self._unsubs.append(async_dispatcher_connect(self.hass, f"{DOMAIN}_sicherheit_update", self._sf_update))
        self._tb_listen()

    def async_stop(self) -> None:
        for u in self._unsubs + self._tb_unsubs:
            try:
                u()
            except Exception:  # noqa: BLE001
                pass
        self._unsubs.clear()
        self._tb_unsubs.clear()

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"cfg": self.cfg, "wk": self.wk, "hk": self.hk, "off": self.off_since, "sent": self.sent}, 10)

    def _push(self) -> None:
        async_dispatcher_send(self.hass, SIGNAL)

    # ------------------------------------------------------------ Freischaltung (Build 1)
    def is_max(self) -> bool:
        sm = self.hass.data.get(DOMAIN, {}).get("sponsor")
        try:
            return bool(sm and sm.is_max())
        except Exception:  # noqa: BLE001
            return False

    def _pref(self, k: str) -> bool:
        sm = self.hass.data.get(DOMAIN, {}).get("sponsor")
        return bool(sm is not None and (sm.prefs or {}).get("mx_" + k))

    def on(self, k: str) -> bool:
        return self._pref(k) and self.is_max()

    def sync(self) -> None:
        """Nach dem Umschalten oder wenn Max endet: Entitäten anlegen bzw. entfernen, Wartezeit merken."""
        now = time.time()
        changed = False
        for k in EXTRAS:
            if self.on(k):
                changed |= self.off_since.pop(k, None) is not None
            elif k not in self.off_since:
                self.off_since[k] = now
                changed = True
                self._drop_entities(k)
        for k, ts in list(self.off_since.items()):
            if now - ts > GRACE_DAYS * 86400:
                if k == "wk" and self.wk:
                    self.wk = {}
                    changed = True
                if k == "hk" and self.hk:
                    self.hk = {}
                    changed = True
        self._tb_listen()
        if changed:
            self._save()
        for cb in list(self._ent_cb):
            cb()
        self._push()

    def sync_later(self, seconds: float) -> None:
        """Nach dem Start: erst wenn der Sponsor-Schlüssel geladen ist, Entitäten anlegen."""
        from homeassistant.helpers.event import async_call_later

        @callback
        def _go(_now: Any) -> None:
            self.sync()

        self._unsubs.append(async_call_later(self.hass, seconds, _go))

    def _drop_entities(self, k: str) -> None:
        try:
            from homeassistant.helpers import entity_registry as er

            reg = er.async_get(self.hass)
            pre = f"{DOMAIN}_mx_{k}_"
            for e in list(reg.entities.values()):
                if e.platform == DOMAIN and str(e.unique_id).startswith(pre):
                    reg.async_remove(e.entity_id)
        except Exception:  # noqa: BLE001
            _LOGGER.debug("Max-Extras: Entitäten von %s nicht entfernt", k, exc_info=True)

    def add_entity_listener(self, cb: Callable[[], None]) -> Callable[[], None]:
        self._ent_cb.append(cb)

        def _rm() -> None:
            if cb in self._ent_cb:
                self._ent_cb.remove(cb)
        return _rm

    # ------------------------------------------------------------ Räume
    def _rooms(self) -> list[tuple[str, Any, Any, dict[str, Any]]]:
        out = []
        for entry in self.hass.config_entries.async_entries(DOMAIN):
            ctrl = getattr(entry, "runtime_data", None)
            if ctrl is None or entry.state is not ConfigEntryState.LOADED:
                continue
            cfg = {**(entry.data or {}), **(entry.options or {}), **(getattr(ctrl, "cfg", {}) or {})}
            out.append((entry.entry_id, entry, ctrl, cfg))
        return out

    def _mess(self) -> list[dict[str, Any]]:
        """Messräume (nur Temperatur und Feuchte) aus Modul 1 – zählen fürs Zeugnis, nicht für die Heizkosten."""
        lay = self.hass.data.get(DOMAIN, {}).get("layout") or {}
        return [m for m in (lay.get("mess") or []) if isinstance(m, dict) and m.get("id") and m.get("name")]

    def _dehum_rooms(self) -> set[str]:
        em = self.hass.data.get(DOMAIN, {}).get("entfeuchter")
        try:
            return {str(em._ds(d["id"]).get("loc") or "") for d in em.cfg["devs"]} - {""} if em is not None else set()  # noqa: SLF001
        except Exception:  # noqa: BLE001
            return set()

    def _num_state(self, eid: str | None) -> float | None:
        st = self.hass.states.get(eid) if eid else None
        return _f(st.state) if st is not None else None

    def _heater_energy_sensor(self, eid: str) -> str:
        """Energiezähler am selben Gerät wie der Elektroheizer (z. B. Steckdose mit Messung)."""
        try:
            from homeassistant.helpers import entity_registry as er

            reg = er.async_get(self.hass)
            ent = reg.async_get(eid)
            if ent is None or not ent.device_id:
                return ""
            for e in er.async_entries_for_device(reg, ent.device_id):
                if e.domain == "sensor" and (e.device_class or e.original_device_class) == "energy" and not e.disabled_by:
                    return e.entity_id
        except Exception:  # noqa: BLE001
            pass
        return ""

    def _fuel(self, rooms: list) -> tuple[str, float]:
        """Wärmequelle der Zentralheizung und Umrechnung Wärme → Einsatz (Wirkungsgrad bzw. JAZ)."""
        f = self.cfg["hk"]["fuel"]
        cop = None
        if f == "auto":
            f = "erdgas"
            for _rid, _e, ctrl, _c in rooms:
                try:
                    info = ctrl.fuel_info()
                    f, cop = info["brennstoff"], info.get("cop")
                    break
                except Exception:  # noqa: BLE001
                    continue
        eff = self.cfg["hk"]["eff"]
        if eff is None:
            eff = float(cop or 3.0) if f == "strom" else L.EFF.get(f, 0.9)
        return f, eff

    def _elec_price(self) -> float:
        cm = self.hass.data.get(DOMAIN, {}).get("coach")
        try:
            return max(float(cm._prices()[0]), 0.0) if cm is not None else 0.3  # noqa: SLF001
        except Exception:  # noqa: BLE001
            return 0.3

    def _price_in(self, fuel: str) -> float:
        if fuel == "strom":
            return self._elec_price()
        p = self.cfg["hk"]["price"]
        return (p if p is not None else L.DEF_PRICE_CT.get(fuel, 12.0)) / 100.0

    # ------------------------------------------------------------ Proben (Build 2 + 3)
    async def _sample(self, _now: Any = None) -> None:
        st = tuple(self.on(k) for k in EXTRAS)
        if st != getattr(self, "_on_cache", None):  # Max beendet oder Schalter umgelegt: Entitäten und Wartezeit nachziehen
            self._on_cache = st
            self.sync()
        on_wk, on_hk = self.on("wk"), self.on("hk")
        if not on_wk and not on_hk:
            return
        try:
            self._sample_now(on_wk, on_hk)
        except Exception:  # noqa: BLE001
            _LOGGER.exception("Max-Extras: Probe fehlgeschlagen")

    def _sample_now(self, on_wk: bool, on_hk: bool, now: datetime | None = None) -> None:
        now = now or dt_util.now()
        day = now.date().isoformat()
        dt_h = L.SAMPLE_MIN / 60.0
        rooms = self._rooms()
        fuel, eff = self._fuel(rooms)
        p_in, p_el = self._price_in(fuel), self._elec_price()
        WK = self.wk.setdefault(day, {}) if on_wk else {}
        HK = self.hk.setdefault(day, {}) if on_hk else {}
        for rid, _entry, ctrl, cfg in rooms:
            t = _f(ctrl.room_temperature()) if hasattr(ctrl, "room_temperature") else None
            tg = None
            try:
                cur = ctrl._current_target()  # noqa: SLF001
                if cur and cur[2]:
                    tg = float(cur[1])
            except Exception:  # noqa: BLE001
                tg = None
            rh = self._num_state(cfg.get(CONF_HUMIDITY))
            rh = rh if rh is not None and 0 < rh <= 100 else None
            wins = list(cfg.get(CONF_WINDOWS) or [])
            try:
                w_open = bool(ctrl.window_open())
            except Exception:  # noqa: BLE001
                w_open = False
            thermos = list(cfg.get(CONF_THERMOSTATS) or [])
            vf = 0.0
            if thermos:
                vals = []
                for e in thermos:
                    st = self.hass.states.get(e)
                    vals.append(L.valve(st.state if st else None, dict(st.attributes) if st else None))
                vf = sum(vals) / len(vals)
            heating = vf > 0 or tg is not None
            lim = L.limits(self.cfg["wk"]["lim"].get(rid))
            self.risk_now[rid] = L.is_risk(t, rh, lim["wall"])
            # Fenster-Spanne (für Lüften und Fenster-Kosten)
            op = self._open.get(rid)
            if w_open:
                if op is None:
                    op = self._open[rid] = {"since": now.timestamp(), "heat": 0.0}
                if heating:
                    op["heat"] += L.SAMPLE_MIN
            elif op is not None:
                mins = (now.timestamp() - op["since"]) / 60.0
                self._open.pop(rid, None)
                if on_wk:
                    L.close_window(WK.setdefault(rid, L.empty_wk()), mins, op["heat"])
            if on_wk:
                L.add_sample(WK.setdefault(rid, L.empty_wk()), t=t, target=tg, rh=rh, lim=lim, has_win=bool(wins), win_open=w_open)
            if not on_hk:
                continue
            hcfg = None
            try:
                hcfg = ctrl.heater.cfg() if getattr(ctrl, "heater", None) is not None else None
            except Exception:  # noqa: BLE001
                hcfg = None
            if not thermos and not hcfg:
                continue  # Messraum: erscheint nicht (Entscheidung zu Build 3)
            row = HK.setdefault(rid, L.empty_hk())
            rc = self.cfg["hk"]["rooms"].get(rid) or {}
            if thermos:
                try:
                    p_kw = float(ctrl.room_power_kw())
                except Exception:  # noqa: BLE001
                    p_kw = 1.0
                q = p_kw * vf * dt_h * (rc.get("f") or 1.0)
                row["ix"] = round(row["ix"] + q, 4)
                row["ce"] = round(row["ce"] + q / eff * p_in, 4)
            if hcfg:
                ek, meas = self._heater_delta(rid, hcfg.get("entity") or "", ctrl)
                if ek > 0:
                    row["ek"] = round(row["ek"] + ek, 4)
                    row["ee"] = round(row["ee"] + ek * p_el, 4)
                row["em"] = row["em"] or meas
            if w_open and heating and self.cfg["hk"]["winc"]:
                mins = (now.timestamp() - self._open[rid]["since"]) / 60.0
                area = float(cfg.get(CONF_ROOM_AREA) or 0) or 15.0
                t_out = _f(ctrl._outdoor_temp()) if hasattr(ctrl, "_outdoor_temp") else None  # noqa: SLF001
                q = L.window_kwh(L.ach("", mins), area, rc.get("h") or L.ROOM_H, t if t is not None else (tg or 20.0), t_out if t_out is not None else 5.0, dt_h)
                row["wk"] = round(row["wk"] + q, 4)
                row["we"] = round(row["we"] + q / eff * (p_in if thermos else p_el), 4)
                row["wm"] = row["wm"] + L.SAMPLE_MIN
        if on_wk:
            for m in self._mess():
                rid = str(m["id"])
                t = self._num_state(m.get("temp"))
                rh = self._num_state(m.get("hum"))
                rh = rh if rh is not None and 0 < rh <= 100 else None
                lim = L.limits(self.cfg["wk"]["lim"].get(rid))
                self.risk_now[rid] = L.is_risk(t, rh, lim["wall"])
                L.add_sample(WK.setdefault(rid, L.empty_wk()), t=t, target=None, rh=rh, lim=lim, has_win=False, win_open=False)
        if on_hk and self.cfg["hk"]["meter"]:
            v = self._num_state(self.cfg["hk"]["meter"])
            st = self.hass.states.get(self.cfg["hk"]["meter"])
            if v is not None and st is not None and str(st.attributes.get("unit_of_measurement") or "").lower() == "wh":
                v /= 1000.0
            prev = self._last.get("meter")
            self._last["meter"] = v
            if v is not None and prev is not None and 0 <= v - prev < 50:
                h = HK.setdefault("_", {"mk": 0.0, "me": 0.0})
                h["mk"] = round(h["mk"] + (v - prev), 4)
                h["me"] = round(h["me"] + (v - prev) * p_in, 4)
        self._trim(now.date())
        self._save()
        self._push()

    def _heater_delta(self, rid: str, eid: str, ctrl: Any) -> tuple[float, bool]:
        sens = self._heater_energy_sensor(eid) if eid else ""
        key = f"h:{rid}"
        if sens:
            v = self._num_state(sens)
            st = self.hass.states.get(sens)
            if v is not None and st is not None and str(st.attributes.get("unit_of_measurement") or "").lower() == "wh":
                v /= 1000.0
            prev = self._last.get(key + ":m")
            self._last[key + ":m"] = v
            if v is not None and prev is not None and 0 <= v - prev < 10:
                return v - prev, True
            return 0.0, True
        v = _f(getattr(getattr(ctrl, "heater", None), "kwh", None))
        prev = self._last.get(key)
        self._last[key] = v
        if v is None or prev is None:
            return 0.0, False
        return (v - prev if v >= prev else v), False  # Tageswechsel: Zähler beginnt bei 0

    def _trim(self, today: date) -> None:
        cut = (today - timedelta(days=KEEP_DAYS)).isoformat()
        for D in (self.wk, self.hk):
            for k in [k for k in D if k < cut]:
                D.pop(k, None)

    # ------------------------------------------------------------ Zeugnis (Build 2)
    def _room_meta(self) -> dict[str, dict[str, Any]]:
        dh = self._dehum_rooms()
        out = {}
        for rid, entry, ctrl, cfg in self._rooms():
            heater = False
            try:
                heater = bool(ctrl.heater.cfg()) if getattr(ctrl, "heater", None) is not None else False
            except Exception:  # noqa: BLE001
                heater = False
            out[rid] = {"id": rid, "name": entry.title, "area": float(cfg.get(CONF_ROOM_AREA) or 0), "thermo": bool(cfg.get(CONF_THERMOSTATS)),
                        "win": bool(cfg.get(CONF_WINDOWS)), "hum": bool(cfg.get(CONF_HUMIDITY)), "heater": heater, "dehum": rid in dh, "mess": False}
        for m in self._mess():
            rid = str(m["id"])
            out[rid] = {"id": rid, "name": str(m["name"]), "area": 0.0, "thermo": False, "win": False, "hum": bool(m.get("hum")), "heater": False,
                        "dehum": rid in dh, "mess": True}
        return out

    def zeugnis(self, kind: str, start: date, end: date, hk: dict[str, Any] | None = None) -> dict[str, Any]:
        meta = self._room_meta()
        days = [(start + timedelta(days=i)).isoformat() for i in range((end - start).days + 1)]
        rooms = []
        for rid, m in meta.items():
            tot, n = L.sum_days(self.wk.get(d, {}).get(rid) for d in days)
            sub = L.subjects(tot, n)
            g = L.room_grade(sub) if n >= L.MIN_DAYS[kind] else None
            win_eur = ((hk or {}).get(rid) or {}).get("win", 0.0)
            rooms.append({"id": rid, "name": m["name"], "note": g, "wort": L.word(g), "faecher": sub if g is not None else {k: None for k in L.FACH},
                          "tage": n, "risiko_h": round(tot["rk"] / L.PER_H, 1), "stoss": tot["st"], "kipp_h": round(tot["kp"] / 60.0, 1),
                          "zeit_t": round(tot["to"] / tot["tn"] * 100) if tot["tn"] else None, "zeit_h": round(tot["ho"] / tot["hn"] * 100) if tot["hn"] else None,
                          "tipp": L.tip(m["name"], sub, tot, n, m["dehum"], win_eur) if g is not None else "", "risk": g is not None and (sub.get("schimmel") or 1) >= 4})
        hg = L.house_grade([(r["note"], meta[r["id"]]["area"]) for r in rooms])
        need = L.MIN_DAYS[kind]
        return {"kind": kind, "from": start.isoformat(), "to": end.isoformat(), "note": hg, "wort": L.word(hg), "rooms": sorted(rooms, key=lambda r: (r["note"] is None, r["name"].lower())),
                "label": f"KW {start.isocalendar()[1]}" if kind == "week" else f"{L_MONTHS[start.month - 1]} {start.year}", "need": need}

    def zeugnis_pair(self, kind: str, ref: date | None = None, done: bool = False) -> dict[str, Any]:
        """Zeugnis für den laufenden (done=False) bzw. letzten abgeschlossenen Zeitraum, mit Trend zum Zeitraum davor."""
        today = ref or dt_util.now().date()
        bounds = _week_bounds if kind == "week" else _month_bounds
        s, e = bounds(today)
        if done:
            s, e = bounds(s - timedelta(days=1))
        e = min(e, today)
        ps, pe = bounds(s - timedelta(days=1))
        cur = self.zeugnis(kind, s, e, self.costs(s, e) if self.on("hk") else None)
        prev = self.zeugnis(kind, ps, pe)
        if cur["note"] is not None and prev["note"] is not None:
            cur["trend"] = round(prev["note"] - cur["note"], 1)  # positiv = besser
            cur["vorher"] = prev["note"]
        pmap = {r["id"]: r["note"] for r in prev["rooms"]}
        for r in cur["rooms"]:
            if r["note"] is not None and pmap.get(r["id"]) is not None:
                r["trend"] = round(pmap[r["id"]] - r["note"], 1)
        return cur

    def history(self, weeks: int = 8) -> dict[str, list[float | None]]:
        today = dt_util.now().date()
        s0, _ = _week_bounds(today)
        out: dict[str, list[float | None]] = {}
        for i in range(weeks, 0, -1):
            s = s0 - timedelta(days=7 * i)
            z = self.zeugnis("week", s, s + timedelta(days=6))
            out.setdefault("_", []).append(z["note"])
            for r in z["rooms"]:
                out.setdefault(r["id"], []).append(r["note"])
        return out

    async def _weekly(self, now: datetime) -> None:
        if now.weekday() == 0 and self.on("wk") and self.cfg["wk"]["week"]:
            await self.async_report("week")

    async def _monthly(self, now: datetime) -> None:
        if now.day == 1 and self.on("wk") and self.cfg["wk"]["month"]:
            await self.async_report("month")

    async def async_report(self, kind: str, force: bool = False) -> dict[str, Any]:
        z = self.zeugnis_pair(kind, done=True)
        key = z["from"]
        if not force and self.sent.get(kind) == key:
            return z
        self.sent[kind] = key
        self._save()
        self.hass.bus.async_fire(EVENT_ZEUGNIS, {"zeitraum": kind, "von": z["from"], "bis": z["to"], "note": z["note"], "wort": z["wort"],
                                                 "raeume": {r["name"]: r["note"] for r in z["rooms"]}})
        if self.cfg["wk"]["push"] and z["note"] is not None:
            await self._notify("📋 Wohnklima-Zeugnis", f"Dein Wohnklima-Zeugnis für {z['label']} ist da: {self._gs(z['note'])} ({z['wort'].capitalize()})")
        self._push()
        return z

    async def _notify(self, title: str, text: str) -> int:
        bm = self.hass.data.get(DOMAIN, {}).get("briefing")
        svcs = list(((bm.cfg if bm is not None else {}) or {}).get("notify") or [])
        n = 0
        for svc in svcs:
            domain, name = svc.split(".", 1)
            if self.hass.services.has_service(domain, name):
                try:
                    await self.hass.services.async_call(domain, name, {"title": title, "message": text}, blocking=False)
                    n += 1
                except Exception:  # noqa: BLE001
                    _LOGGER.debug("Max-Extras: Push über %s fehlgeschlagen", svc, exc_info=True)
        return n

    @staticmethod
    def _gs(g: float | None) -> str:
        return "–" if g is None else f"{g:.1f}".replace(".", ",")

    # ------------------------------------------------------------ Heizkosten (Build 3)
    def costs(self, start: date, end: date) -> dict[str, Any]:
        days = {(start + timedelta(days=i)).isoformat(): self.hk.get((start + timedelta(days=i)).isoformat(), {}) for i in range((end - start).days + 1)}
        return L.period_costs({d: v for d, v in days.items() if v})

    def cost_view(self, scope: str) -> dict[str, Any]:
        today = dt_util.now().date()
        if scope == "day":
            s = e = today
        elif scope == "week":
            s, e = _week_bounds(today)
        elif scope == "season":
            y = today.year if today.month >= 9 else today.year - 1
            s, e = date(y, 9, 1), today
        else:
            s, e = _month_bounds(today)
        e = min(e, today)
        meta = self._room_meta()
        rows = self.costs(s, e)
        out = []
        for rid, r in rows.items():
            m = meta.get(rid)
            if m is None or (not m["thermo"] and not m["heater"]):
                continue
            out.append({"id": rid, "name": m["name"], "area": m["area"], "eur_m2": round(r["eur"] / m["area"], 2) if m["area"] else None,
                        "heater": m["heater"], "what_if": L.what_if(r["eur"] - r["elec"]), **r})
        out.sort(key=lambda x: -x["eur"])
        tot = round(sum(r["eur"] for r in out), 2)
        meas = round(sum(r["meas"] for r in out), 2)
        meter = any((self.hk.get((s + timedelta(days=i)).isoformat(), {}).get("_") or {}).get("mk", 0) > 0 for i in range((e - s).days + 1))
        days_done = (e - s).days + 1
        _, full_end = _month_bounds(today)
        prog = round(tot / days_done * ((full_end - s).days + 1), 2) if scope == "month" and days_done >= 3 else None
        for r in out:
            r["share"] = round(r["eur"] / tot * 100) if tot > 0 else 0
        daily: list[list[Any]] = []
        for i in range(min(days_done, 31)):
            d = (s + timedelta(days=i)).isoformat()
            c = L.period_costs({d: self.hk.get(d, {})}) if self.hk.get(d) else {}
            daily.append([d, {k: v["eur"] for k, v in c.items()}])
        return {"scope": scope, "from": s.isoformat(), "to": e.isoformat(), "eur": tot, "meas": meas, "est": round(tot - meas, 2), "meter": meter,
                "win": round(sum(r["win"] for r in out), 2), "rooms": out, "prognose": prog, "daily": daily}

    # ------------------------------------------------------------ Briefing & Monatsbericht
    def brief_lines(self) -> list[str]:
        out: list[str] = []
        today = dt_util.now().date()
        if self.on("wk") and self.cfg["wk"]["brief"]:
            if today.weekday() == 0:
                z = self.zeugnis_pair("week", done=True)
                if z["note"] is not None:
                    tr = z.get("trend")
                    arrow = " ▲" if tr and tr > 0 else " ▼" if tr and tr < 0 else ""
                    out.append(f"🏠 Wohnklima {z['label']}: Note {self._gs(z['note'])}{arrow}")
            days = [(today - timedelta(days=i)).isoformat() for i in range(1, 8)]
            for m in self._room_meta().values():
                n = sum(1 for d in days if (self.wk.get(d, {}).get(m["id"]) or {}).get("rk", 0) >= L.PER_H)
                if n >= 3:
                    out.append(f"💧 {m['name']}: Schimmelrisiko an {n} Tagen")
        if self.on("hk"):
            y = today - timedelta(days=1)
            c = self.costs(y, y)
            meta = self._room_meta()
            c = {k: v for k, v in c.items() if k in meta and (meta[k]["thermo"] or meta[k]["heater"])}
            tot = sum(v["eur"] for v in c.values())
            if tot >= 0.05:
                txt = f"🔥 Gestern Heizung ca. {_eur(tot)} €"
                worst = max(c.items(), key=lambda kv: kv[1]["win"], default=None)
                if worst and worst[1]["win"] >= 0.5:
                    txt += f" · {meta[worst[0]]['name']}-Fenster {worst[1]['wm'] / 60:.0f} h offen (ca. {_eur(worst[1]['win'])} €)"
                out.append(txt)
        return out

    def month(self, ym: str) -> dict[str, Any]:
        try:
            s = date.fromisoformat(ym + "-01")
        except ValueError:
            return {}
        _, e = _month_bounds(s)
        e = min(e, dt_util.now().date())
        out: dict[str, Any] = {}
        if self.on("wk"):
            z = self.zeugnis("month", s, e)
            rated = [r for r in z["rooms"] if r["note"] is not None]
            if z["note"] is not None:
                ps, pe = _month_bounds(s - timedelta(days=1))
                pz = self.zeugnis("month", ps, pe)
                out["wk"] = {"note": z["note"], "wort": z["wort"], "best": min(rated, key=lambda r: r["note"])["name"] if rated else "",
                             "best_n": min(r["note"] for r in rated) if rated else None, "worst": max(rated, key=lambda r: r["note"])["name"] if rated else "",
                             "worst_n": max(r["note"] for r in rated) if rated else None, "vorher": pz["note"]}
        if self.on("hk"):
            c = self.costs(s, e)
            meta = self._room_meta()
            c = {k: v for k, v in c.items() if k in meta and (meta[k]["thermo"] or meta[k]["heater"])}
            if c:
                ps, pe = _month_bounds(s - timedelta(days=1))
                pc = self.costs(ps, pe)
                top = max(c.items(), key=lambda kv: kv[1]["eur"])
                out["hk"] = {"eur": round(sum(v["eur"] for v in c.values()), 2), "top": meta[top[0]]["name"], "win": round(sum(v["win"] for v in c.values()), 2),
                             "vorher": round(sum(v["eur"] for v in pc.values()), 2) if pc else None}
        return out

    # ------------------------------------------------------------ Wand-Tablet (Build 4)
    def tb_state(self, tid: str) -> str:
        t = self.tb.get(tid)
        if not t or time.time() - t["ts"] > TB_STALE_S:
            return "aus"
        return t["state"]

    def tb_set_state(self, tid: str, state: str) -> bool:
        if not _TID.match(tid) or state not in TB_STATES:
            return False
        old = self.tb_state(tid)
        self.tb[tid] = {"state": state, "ts": time.time()}
        if old != state:
            self._push()
            for cb in list(self._ent_cb):
                cb()
        return True

    def tablets(self) -> list[dict[str, Any]]:
        tm = self.hass.data.get(DOMAIN, {}).get("tablet")
        snap = tm.snapshot() if tm is not None else {"tablets": []}
        return [{"id": t["id"], "name": t["name"], "state": self.tb_state(t["id"]), "cfg": self.cfg["tb"].get(t["id"]) or default_tb(),
                 "bat": self._num_state((self.cfg["tb"].get(t["id"]) or {}).get("bat"))} for t in snap.get("tablets", [])]

    async def async_wake(self, tid: str) -> None:
        self.wake_ts[tid] = time.time()  # das Tablet holt das mit seiner nächsten Meldung ab (auch ohne Admin-Rechte)
        self.hass.bus.async_fire(EVENT_WAKE, {"tid": tid})
        tm = self.hass.data.get(DOMAIN, {}).get("tablet")
        t = (tm.tablets.get(tid) if tm is not None else None)
        if t is not None:
            try:
                await tm._screen(t, True)  # noqa: SLF001
            except Exception:  # noqa: BLE001
                pass

    @callback
    def _sf_update(self, *_a: Any) -> None:
        sm = self.hass.data.get(DOMAIN, {}).get("sicherheit")
        try:
            alarm = bool(sm is not None and sm.active() and (sm._sum or {}).get("status") == "alarm")  # noqa: SLF001
        except Exception:  # noqa: BLE001
            alarm = False
        if alarm and not self._sf_alarm and self.on("tb"):
            for tid, c in self.cfg["tb"].items():
                if c.get("alarm", True):
                    self.hass.async_create_task(self.async_wake(tid))
        self._sf_alarm = alarm

    def _tb_listen(self) -> None:
        for u in self._tb_unsubs:
            u()
        self._tb_unsubs = []
        if not self.on("tb"):
            return
        bats = {c["bat"]: tid for tid, c in self.cfg["tb"].items() if c.get("bat") and c.get("charge")}
        if bats:
            self._tb_unsubs.append(async_track_state_change_event(self.hass, list(bats), self._bat_changed))

    @callback
    def _bat_changed(self, event: Event) -> None:
        eid = event.data.get("entity_id")
        new = event.data.get("new_state")
        v = _f(new.state) if new is not None else None
        if v is None:
            return
        for c in self.cfg["tb"].values():
            if c.get("bat") != eid or not c.get("charge"):
                continue
            sw = self.hass.states.get(c["charge"])
            if v < 30 and (sw is None or sw.state != "on"):
                self.hass.async_create_task(self.hass.services.async_call("switch", "turn_on", {"entity_id": c["charge"]}, blocking=False))
            elif v > 80 and (sw is None or sw.state != "off"):
                self.hass.async_create_task(self.hass.services.async_call("switch", "turn_off", {"entity_id": c["charge"]}, blocking=False))

    # ------------------------------------------------------------ Einstellungen & Ansicht
    def set_cfg(self, raw: Any) -> dict[str, Any]:
        self.cfg = clean_cfg(raw, self.cfg)
        self._save()
        self._tb_listen()
        self._push()
        return self.cfg

    def snapshot(self, admin: bool = False, scope: str = "month") -> dict[str, Any]:
        mx = self.is_max()
        out: dict[str, Any] = {"max": mx, "on": {k: self.on(k) for k in EXTRAS}, "pref": {k: self._pref(k) for k in EXTRAS}, "cfg": self.cfg,
                               "rooms": list(self._room_meta().values()), "tablets": self.tablets() if mx else []}
        if self.on("wk"):
            out["wk"] = {"week": self.zeugnis_pair("week"), "month": self.zeugnis_pair("month"), "last_week": self.zeugnis_pair("week", done=True), "last_month": self.zeugnis_pair("month", done=True),
                         "hist": self.history(), "risk_now": {k: v for k, v in self.risk_now.items() if v}}
        if self.on("hk"):
            out["hk"] = self.cost_view(scope)
            out["hk_fuel"] = dict(zip(("fuel", "eff"), self._fuel(self._rooms())))
            out["hk_price"] = round(self._price_in(out["hk_fuel"]["fuel"]), 4)
        sm = self.hass.data.get(DOMAIN, {}).get("sponsor")
        try:
            out["dev"] = bool(admin and sm is not None and sm.snapshot().get("state") == "dev")
        except Exception:  # noqa: BLE001
            out["dev"] = False
        return out

    # ------------------------------------------------------------ Testlabor
    def demo(self, days: int = 35) -> int:
        """Entwickler-Zugang: Tageswerte für die letzten Tage mit plausiblen Zufallswerten füllen (nur zum Prüfen)."""
        rnd = random.Random(4711)
        today = dt_util.now().date()
        meta = self._room_meta()
        for i in range(1, days + 1):
            d = (today - timedelta(days=i)).isoformat()
            W, H = self.wk.setdefault(d, {}), self.hk.setdefault(d, {})
            for rid, m in meta.items():
                bath = bool(re.search(r"bad|dusch", m["name"], re.I))
                n = 288
                tn = rnd.randint(150, 220)
                hn = n if m["hum"] else 0
                tn = 0 if m["mess"] else tn
                W[rid] = {"n": n, "tn": tn, "to": int(tn * rnd.uniform(0.6, 0.98)), "hn": hn, "ho": int(hn * rnd.uniform(0.45 if bath else 0.7, 0.95)),
                          "rk": int(rnd.uniform(6, 40) if bath and m["hum"] else rnd.uniform(0, 3)), "st": rnd.randint(1, 4) if m["win"] else 0,
                          "kp": round(rnd.uniform(60, 180) if bath else rnd.uniform(0, 30), 1), "w": m["win"], "h": m["hum"]}
                if m["thermo"] or m["heater"]:
                    ix = rnd.uniform(1.5, 6.0) * (1 + (m["area"] or 15) / 30)
                    H[rid] = {"ix": round(ix, 3), "ce": round(ix / 0.9 * 0.12, 3), "ek": round(rnd.uniform(0.5, 3), 3) if m["heater"] else 0.0,
                              "ee": round(rnd.uniform(0.15, 0.9), 3) if m["heater"] else 0.0, "em": m["heater"], "wk": round(rnd.uniform(0, 1.2), 3),
                              "we": round(rnd.uniform(0, 0.15), 3), "wm": rnd.choice([0, 0, 15, 40, 120])}
        self._save()
        self._push()
        return len(meta)


L_MONTHS = ("Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember")
