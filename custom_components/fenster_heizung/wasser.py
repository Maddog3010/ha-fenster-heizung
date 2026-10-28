"""Modul 2: Warmwasser und Zirkulation (2.9.0).

Steuert Speicher-Erzeuger, Heizstab (PV-Überschuss) und Zirkulationspumpe nach Zeitplan,
Bedarf oder Intervall und führt den Legionellenschutz aus. Außerdem hält dieses Bündel die
Liste der Module (an/aus, eigene Module).
"""
from __future__ import annotations

import logging
import asyncio
import re
import time
from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.event import async_track_state_change_event, async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import DOMAIN
from .diag import diag_log
from .geraete_calc import clean_ev, clean_gs
from .pvlogic import grid_to_export, soc_allows

_LOGGER = logging.getLogger(__name__)

TICK_SECONDS = 30
HYST = 3.0                 # Erzeuger schaltet ein, wenn der Speicher so viel unter Soll liegt
SAFE_MAX = 65.0            # darüber wird immer abgeschaltet (Verbrühschutz)
BOOST_MAX_S = 3 * 3600
CIRC_MANUAL_S = 5 * 60
LEG_ABORT_S = 6 * 3600
ROD_MIN_ON = 300
ROD_MIN_OFF = 180
CIRC_MODES = ("plan", "demand", "interval", "off")
MAX_WINDOWS = 8
MAX_EXT = 12

_DEFAULT_ENT = {"top": "", "mid": "", "bot": "", "src": "", "rod": "", "pump": "", "ret": "", "trig": ""}
_ENT_DOMAINS = {
    "top": ("sensor",), "mid": ("sensor",), "bot": ("sensor",), "ret": ("sensor",),
    "src": ("switch", "input_boolean", "water_heater", "climate"),
    "rod": ("switch", "input_boolean"),
    "pump": ("switch", "input_boolean"),
    "trig": ("binary_sensor", "button", "input_button", "event"),
}
_ENTITY = re.compile(r"^[a-z_]+\.[a-z0-9_]+$")
_TIME = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")
_EXT_URL = re.compile(r"^(https://|/local/|/hacsfiles/)[^\s\"'<>]+\.js$", re.IGNORECASE)

DEFAULTS: dict[str, Any] = {
    "size": 300,
    "target": 55,
    "ent": dict(_DEFAULT_ENT),
    "heat": {
        "low": 42,
        "wd": [{"from": "05:00", "to": "07:30", "temp": 55}, {"from": "16:30", "to": "21:30", "temp": 55}],
        "we": [{"from": "07:00", "to": "10:00", "temp": 55}, {"from": "17:00", "to": "21:30", "temp": 55}],
    },
    "circ": {
        "mode": "plan", "ret_max": 45, "run": 3, "on": 3, "every": 30,
        "wd": [{"from": "05:30", "to": "08:00"}, {"from": "17:00", "to": "21:30"}],
        "we": [{"from": "07:00", "to": "10:30"}, {"from": "17:00", "to": "21:30"}],
    },
    "leg": {"on": True, "day": 5, "time": "03:00", "temp": 60, "hold": 20},
    "pv": {"on": True, "min": 1800, "max": 62, "watt": 2000},
}


# --------------------------------------------------------------------------- Prüfen
def _num(val: Any, lo: float, hi: float, default: float) -> int:
    if isinstance(val, str):
        val = val.strip().replace(",", ".")
    try:
        v = float(val)
    except (TypeError, ValueError):
        return int(default)
    if v != v or v in (float("inf"), float("-inf")):
        return int(default)
    return int(round(min(max(v, lo), hi)))


def _hm(val: Any, default: str) -> str:
    return val if isinstance(val, str) and _TIME.match(val) else default


def tm(s: str) -> int:
    """'HH:MM' in Minuten seit Mitternacht."""
    h, m = s.split(":")
    return int(h) * 60 + int(m)


def _windows(raw: Any, temp: bool, default: list[dict[str, Any]], default_temp: int = 55) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    if not isinstance(raw, list):
        raw = default
    for item in raw[:MAX_WINDOWS]:
        if not isinstance(item, dict):
            continue
        a, b = _hm(item.get("from"), ""), _hm(item.get("to"), "")
        if not a or not b or tm(b) <= tm(a):
            continue
        w: dict[str, Any] = {"from": a, "to": b}
        if temp:
            w["temp"] = _num(item.get("temp"), 30, 70, default_temp)
        out.append(w)
    out.sort(key=lambda w: tm(w["from"]))
    return out


def clean_wasser(raw: Any) -> dict[str, Any]:
    """Einstellungen des Moduls prüfen. Laufzeitwerte (Boost, Abwesend …) gehören nicht dazu."""
    raw = raw if isinstance(raw, dict) else {}
    d = DEFAULTS
    ent_raw = raw.get("ent") if isinstance(raw.get("ent"), dict) else {}
    ent: dict[str, str] = {}
    for k, domains in _ENT_DOMAINS.items():
        v = ent_raw.get(k)
        ok = isinstance(v, str) and _ENTITY.match(v) and v.split(".")[0] in domains
        ent[k] = v if ok else ""
    h = raw.get("heat") if isinstance(raw.get("heat"), dict) else {}
    c = raw.get("circ") if isinstance(raw.get("circ"), dict) else {}
    lg = raw.get("leg") if isinstance(raw.get("leg"), dict) else {}
    pv = raw.get("pv") if isinstance(raw.get("pv"), dict) else {}
    target = _num(raw.get("target"), 40, 65, d["target"])
    return {
        "size": _num(raw.get("size"), 50, 1000, d["size"]),
        "target": target,
        "ent": ent,
        "heat": {
            "low": _num(h.get("low"), 30, 55, d["heat"]["low"]),
            "wd": _windows(h.get("wd"), True, d["heat"]["wd"], target),
            "we": _windows(h.get("we"), True, d["heat"]["we"], target),
        },
        "circ": {
            "mode": c.get("mode") if c.get("mode") in CIRC_MODES else d["circ"]["mode"],
            "ret_max": _num(c.get("ret_max"), 30, 60, d["circ"]["ret_max"]),
            "run": _num(c.get("run"), 1, 15, d["circ"]["run"]),
            "on": _num(c.get("on"), 1, 15, d["circ"]["on"]),
            "every": _num(c.get("every"), 10, 120, d["circ"]["every"]),
            "wd": _windows(c.get("wd"), False, d["circ"]["wd"]),
            "we": _windows(c.get("we"), False, d["circ"]["we"]),
        },
        "leg": {
            "on": bool(lg.get("on", d["leg"]["on"])),
            "day": _num(lg.get("day"), 0, 6, d["leg"]["day"]),
            "time": _hm(lg.get("time"), d["leg"]["time"]),
            "temp": _num(lg.get("temp"), 55, 65, d["leg"]["temp"]),
            "hold": _num(lg.get("hold"), 10, 60, d["leg"]["hold"]),
        },
        "pv": {
            "on": bool(pv.get("on", d["pv"]["on"])),
            "min": _num(pv.get("min"), 300, 6000, d["pv"]["min"]),
            "max": _num(pv.get("max"), 50, 65, d["pv"]["max"]),
            "watt": _num(pv.get("watt"), 300, 9000, d["pv"]["watt"]),
        },
    }


# Beta-Module ohne eigene Einstellungen im Backend: nur der Schalter wird gespeichert (standardmäßig aus)
BETA_KEYS = ("wx", "ga", "sf", "pl", "bt", "dt", "wa", "sp", "ef")
EN_KEYS = ("pv", "grid", "house", "bat", "bchg", "bdis", "pve", "pv2", "pve2", "imp", "exp")
EN_DOMAIN = "sensor"


def _name(v: Any) -> str:
    return re.sub(r"[<>\"'&]", "", str(v or "").strip())[:20]


def clean_energy(raw: Any) -> dict[str, Any]:
    """Einstellungen von Modul 3 (Energie-Übersicht): nur Sensor-IDs und zwei Vorzeichen-Optionen."""
    raw = raw if isinstance(raw, dict) else {}
    ent_raw = raw.get("ent") if isinstance(raw.get("ent"), dict) else {}
    ent: dict[str, str] = {}
    for k in EN_KEYS:
        v = ent_raw.get(k)
        ok = isinstance(v, str) and len(v) <= 120 and _ENTITY.match(v) and v.split(".")[0] == EN_DOMAIN
        ent[k] = v if ok else ""
    sign = raw.get("sign")
    bsign = raw.get("bsign")
    return {
        "ent": ent,
        "sign": sign if sign in ("export", "import") else "",
        "bsign": bsign if bsign in ("charge", "discharge") else "charge",
        "bmode": "two" if raw.get("bmode") == "two" else "one",
        "pvn": _name(raw.get("pvn")),
        "pv2n": _name(raw.get("pv2n")),
    }


def clean_modules(raw: Any) -> dict[str, Any]:
    raw = raw if isinstance(raw, dict) else {}
    on = raw.get("on") if isinstance(raw.get("on"), dict) else {}
    ext: list[dict[str, Any]] = []
    seen: set[str] = set()
    for x in (raw.get("ext") or [])[:MAX_EXT] if isinstance(raw.get("ext"), list) else []:
        if not isinstance(x, dict):
            continue
        xid = str(x.get("id") or "")[:20]
        url = x.get("url")
        if not re.match(r"^x[a-z0-9]{1,18}$", xid) or xid in seen or not (isinstance(url, str) and len(url) <= 300 and _EXT_URL.match(url)):
            continue
        seen.add(xid)
        name = re.sub(r"[<>\"'&]", "", str(x.get("name") or "").strip())[:40] or "Eigenes Modul"
        ext.append({"id": xid, "name": name, "url": url, "on": bool(x.get("on", True))})
    return {"on": {"ww": bool(on.get("ww", True)), "en": bool(on.get("en", True)), "gs": bool(on.get("gs", True)), "lu": bool(on.get("lu", False)), "rb": bool(on.get("rb", False)), "wp": bool(on.get("wp", False)), "ev": bool(on.get("ev", False)), **{k: bool(on.get(k, False)) for k in BETA_KEYS}}, "ext": ext, "energy": clean_energy(raw.get("energy")), "gs": clean_gs(raw.get("gs")), "ev": clean_ev(raw.get("ev"))}


def configured(cfg: dict[str, Any]) -> bool:
    e = cfg["ent"]
    return bool(e["top"] or e["mid"] or e["bot"] or e["pump"])


# --------------------------------------------------------------------------- Entscheidungen (rein)
def day_key(weekday: int) -> str:
    """Montag = 0 … Sonntag = 6 → 'wd' oder 'we'."""
    return "we" if weekday >= 5 else "wd"


def in_windows(wins: list[dict[str, Any]], minute: int) -> bool:
    return any(tm(w["from"]) <= minute < tm(w["to"]) for w in wins)


def schedule_temp(cfg: dict[str, Any], weekday: int, minute: int) -> int:
    for w in cfg["heat"][day_key(weekday)]:
        if tm(w["from"]) <= minute < tm(w["to"]):
            return int(w["temp"])
    return int(cfg["heat"]["low"])


def pump_wanted(
    cfg: dict[str, Any], weekday: int, minute: int, now: float, ret: float | None, pump_on: bool,
    demand_until: float, manual_until: float, away: bool,
) -> bool:
    c = cfg["circ"]
    if manual_until > now:
        return True
    if away or c["mode"] == "off":
        return False
    if ret is not None:
        if ret >= c["ret_max"] or (not pump_on and ret > c["ret_max"] - 2):
            return False
    wins = c[day_key(weekday)]
    if c["mode"] == "plan":
        return in_windows(wins, minute)
    if c["mode"] == "demand":
        return demand_until > now and (not wins or in_windows(wins, minute))
    # Intervall: im Zeitfenster alle X Minuten für Y Minuten
    for w in wins:
        a = tm(w["from"])
        if a <= minute < tm(w["to"]):
            return (minute - a) % c["every"] < c["on"]
    return False


def source_wanted(control: float | None, want: float, on: bool, tolerance: float = HYST) -> bool | None:
    """Erzeuger an/aus mit Hysterese. None = kein Messwert, nichts ändern."""
    if control is None:
        return None
    if control >= SAFE_MAX:
        return False
    if on:
        return control < want
    return control <= want - tolerance


def rod_wanted(
    pv_cfg: dict[str, Any], top: float | None, avail_w: float | None, soc_ok: bool, on: bool,
    since: float, now: float, away: bool,
) -> bool | None:
    """Heizstab bei PV-Überschuss. avail_w = Einspeisung plus Leistung des Heizstabs selbst."""
    if top is not None and top >= min(pv_cfg["max"], SAFE_MAX):
        return False
    if not pv_cfg["on"] or away or not soc_ok:
        return False
    if avail_w is None or top is None:
        return None
    if on:
        if now - since < ROD_MIN_ON:
            return True
        return avail_w - pv_cfg["watt"] > -100      # Netzbezug über 100 W: abschalten
    if now - since < ROD_MIN_OFF:
        return False
    return avail_w >= pv_cfg["min"]


def leg_due(leg: dict[str, Any], now: datetime, last_ts: str | None, running: bool) -> bool:
    if not leg["on"] or running or now.weekday() != leg["day"]:
        return False
    if now.hour * 60 + now.minute < tm(leg["time"]):
        return False
    if last_ts:
        try:
            if datetime.fromisoformat(last_ts).astimezone(now.tzinfo).date() == now.date():
                return False
        except ValueError:
            pass
    return True


def leg_step(run: dict[str, Any], low: float | None, mx: float | None, leg: dict[str, Any], now: float) -> dict[str, Any] | None:
    """Fortschritt eines Legionellenlaufs. Gibt das Ergebnis zurück, wenn er endet, sonst None."""
    if mx is not None:
        run["max"] = max(run.get("max", 0.0), mx)
    if low is not None and low >= leg["temp"] - 1:
        run.setdefault("held_since", now)
    else:
        run.pop("held_since", None)
    held = int((now - run["held_since"]) // 60) if run.get("held_since") else 0
    if held >= leg["hold"]:
        return {"ok": True, "max": round(run.get("max", 0.0), 1), "held": held}
    if now - run["start"] > LEG_ABORT_S:
        return {"ok": False, "max": round(run.get("max", 0.0), 1), "held": held}
    return None


def shower_count(size: int, temps: list[float]) -> int | None:
    """Wie viele Duschen (50 Liter Mischwasser mit 38 °C) der Speicher noch hergibt."""
    if not temps:
        return None
    part = size / len(temps)
    mixed = sum(part * (t - 10) / 28 for t in temps if t > 38)
    return int(mixed // 50)


# --------------------------------------------------------------------------- Manager
class WasserManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = Store(hass, 1, f"{DOMAIN}_wasser")
        self.modules = clean_modules({})
        self.cfg = clean_wasser({})
        self.state: dict[str, Any] = {"away": False, "boost_until": 0.0, "circ_until": 0.0, "demand_until": 0.0, "leg_run": None, "leg_last": None}
        self._unsub: CALLBACK_TYPE | None = None
        self._unsub_trig: CALLBACK_TYPE | None = None
        self._rod_since = 0.0
        self._last_set: dict[str, Any] = {}
        self._last_set_ts: dict[str, float] = {}
        self._lock = asyncio.Lock()
        self._ours: set[str] = set()
        self._info: dict[str, Any] = {}

    async def async_start(self) -> None:
        saved = await self._store.async_load() or {}
        self.modules = clean_modules(saved.get("modules"))
        self.cfg = clean_wasser(saved.get("cfg"))
        st = saved.get("state") if isinstance(saved.get("state"), dict) else {}
        for k in ("boost_until", "circ_until", "demand_until"):
            try:
                self.state[k] = float(st.get(k) or 0.0)
            except (TypeError, ValueError):
                self.state[k] = 0.0
        self.state["away"] = bool(st.get("away"))
        run = st.get("leg_run")
        self.state["leg_run"] = run if isinstance(run, dict) and isinstance(run.get("start"), (int, float)) else None
        last = st.get("leg_last")
        self.state["leg_last"] = last if isinstance(last, dict) and isinstance(last.get("ts"), str) else None
        self._unsub = async_track_time_interval(self.hass, self._tick, timedelta(seconds=TICK_SECONDS))
        self._watch_trigger()

    def async_stop(self) -> None:
        for attr in ("_unsub", "_unsub_trig"):
            unsub = getattr(self, attr)
            if unsub:
                unsub()
                setattr(self, attr, None)

    # ---- Speichern / API
    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"modules": self.modules, "cfg": self.cfg, "state": self.state}, 5)

    def active(self) -> bool:
        return self.modules["on"]["ww"] and configured(self.cfg)

    async def async_set_modules(self, raw: Any) -> None:
        self.modules = clean_modules(raw)
        self._save()
        gsm = self.hass.data.get(DOMAIN, {}).get("geraete")
        if gsm is not None:
            await gsm.async_config_changed()
        await self._tick(None)

    async def async_set_cfg(self, raw: Any) -> None:
        self.cfg = clean_wasser(raw)
        self._last_set.clear()
        self._last_set_ts.clear()
        self._watch_trigger()
        self._save()
        await self._tick(None)

    async def async_command(self, cmd: str, value: bool) -> None:
        now = time.time()
        if cmd == "boost":
            self.state["boost_until"] = now + BOOST_MAX_S if value else 0.0
        elif cmd == "circ5":
            self.state["circ_until"] = now + CIRC_MANUAL_S if value else 0.0
        elif cmd == "away":
            self.state["away"] = bool(value)
        else:
            return
        self._save()
        await self._tick(None)

    def snapshot(self) -> dict[str, Any]:
        now = time.time()
        s = self.state
        return {
            "modules": self.modules,
            "ww": self.cfg,
            "status": {
                "away": s["away"],
                "boost": s["boost_until"] > now,
                "circ5": s["circ_until"] > now,
                "leg_last": s["leg_last"],
                "leg_running": s["leg_run"] is not None,
                **self._info,
            },
        }

    # ---- Auslöser (Zirkulation bei Bedarf)
    def _watch_trigger(self) -> None:
        if self._unsub_trig:
            self._unsub_trig()
            self._unsub_trig = None
        eid = self.cfg["ent"]["trig"]
        if eid:
            self._unsub_trig = async_track_state_change_event(self.hass, [eid], self._on_trigger)

    async def _on_trigger(self, event) -> None:
        new = event.data.get("new_state")
        if new is None or new.state in ("unavailable", "unknown", "off"):
            return
        self.state["demand_until"] = time.time() + self.cfg["circ"]["run"] * 60
        await self._tick(None)

    # ---- Messwerte
    def _val(self, eid: str | None) -> float | None:
        st = self.hass.states.get(eid) if eid else None
        if st is None:
            return None
        try:
            v = float(str(st.state).replace(",", "."))
        except (TypeError, ValueError):
            return None
        return v if -30 < v < 150 else None

    def _is_on(self, eid: str | None) -> bool:
        st = self.hass.states.get(eid) if eid else None
        return bool(st and st.state in ("on", "heat", "heating", "performance", "eco", "electric", "gas", "heat_pump", "high_demand"))

    def _surplus(self, rod_on: bool) -> tuple[float | None, bool]:
        gen = self.hass.data.get(DOMAIN, {}).get("general")
        pv = dict((gen.data.get("pv") if gen else None) or {})
        if not pv.get("sensor"):
            return None, True
        st = self.hass.states.get(pv["sensor"])
        try:
            val = float(st.state) if st is not None else None
        except (TypeError, ValueError):
            val = None
        if val is None:
            return None, True
        if st.attributes.get("unit_of_measurement") == "kW":
            val *= 1000
        export = grid_to_export(val, pv.get("sign", "export"))
        soc_st = self.hass.states.get(pv["soc_sensor"]) if pv.get("soc_sensor") else None
        try:
            soc = float(soc_st.state) if soc_st is not None else None
        except (TypeError, ValueError):
            soc = None
        soc_ok = soc_allows(soc, float(pv.get("soc_min", 0)) if pv.get("soc_sensor") else 0, rod_on)
        return export + (self.cfg["pv"]["watt"] if rod_on else 0.0), soc_ok

    # ---- Schalten
    async def _call(self, domain: str, service: str, **data: Any) -> None:
        try:
            await self.hass.services.async_call(domain, service, data, blocking=True)
        except Exception as err:  # noqa: BLE001
            _LOGGER.exception("%s.%s für %s fehlgeschlagen", domain, service, data.get("entity_id"))
            diag_log(self.hass, "error", f"Warmwasser: {domain}.{service} für {data.get('entity_id')} fehlgeschlagen: {err}", entity=data.get("entity_id"), room="Warmwasser")

    async def _switch(self, eid: str, want: bool) -> None:
        st = self.hass.states.get(eid)
        if st is None or st.state in ("unavailable", "unknown"):
            return
        if (st.state == "on") == want:
            return
        domain = eid.split(".")[0]
        await self._call(domain, "turn_on" if want else "turn_off", entity_id=eid)

    def _src_on(self, eid: str) -> bool:
        """Läuft der Erzeuger? Schalter: Zustand. Thermostat oder Wasserbereiter: Solltemperatur über der Absenkung."""
        if not eid:
            return False
        if eid.split(".")[0] in ("switch", "input_boolean"):
            return self._is_on(eid)
        st = self.hass.states.get(eid)
        if st is None or st.state in ("unavailable", "unknown", "off"):
            return False
        try:
            sp = float(st.attributes.get("temperature"))
        except (TypeError, ValueError):
            return self._is_on(eid)
        return sp > self.cfg["heat"]["low"] + 1.0

    async def _source(self, eid: str, want_on: bool, temp: float) -> None:
        domain = eid.split(".")[0]
        if domain in ("switch", "input_boolean"):
            await self._switch(eid, want_on)
            return
        st = self.hass.states.get(eid)
        if st is None or st.state in ("unavailable", "unknown"):
            return
        target = float(temp if want_on else self.cfg["heat"]["low"])
        try:
            sp = float(st.attributes.get("temperature"))
        except (TypeError, ValueError):
            sp = None
        now = time.time()
        # Neu setzen: bei anderem Ziel, oder wenn jemand die Solltemperatur verstellt hat (höchstens alle 10 Minuten)
        drift = sp is not None and abs(sp - target) > 1.0 and now - self._last_set_ts.get(eid, 0.0) > 600
        if self._last_set.get(eid) != target or drift:
            await self._call(domain, "set_temperature", entity_id=eid, temperature=target)
            self._last_set[eid] = target
            self._last_set_ts[eid] = now

    # ---- Takt
    async def _release(self) -> None:
        """Modul aus oder Gerät abgewählt: Heizstab und Pumpe, die dieses Modul eingeschaltet hat, wieder ausschalten."""
        keep = {self.cfg["ent"]["rod"], self.cfg["ent"]["pump"]} if self.active() else set()
        for eid in list(self._ours):
            if eid not in keep:
                self._ours.discard(eid)
                await self._switch(eid, False)

    async def _tick(self, _now) -> None:
        try:
            async with self._lock:
                await self._release()
                await self._run()
        except Exception as err:  # noqa: BLE001  - die Regelung darf nie abstürzen
            _LOGGER.exception("Warmwasser: Auswertung fehlgeschlagen")
            diag_log(self.hass, "error", f"Warmwasser: Auswertung fehlgeschlagen: {err}", room="Warmwasser")

    async def _run(self) -> None:
        if not self.active():
            self._info = {}
            return
        cfg, E, s = self.cfg, self.cfg["ent"], self.state
        now = time.time()
        local = dt_util.now()
        minute = local.hour * 60 + local.minute
        t = {k: self._val(E[k]) for k in ("top", "mid", "bot")}
        known = [v for v in t.values() if v is not None]
        control = t["top"] if t["top"] is not None else (known[0] if known else None)
        lowest = min(known) if known else None
        away = s["away"]

        # Boost und Legionellenschutz
        boost = s["boost_until"] > now
        if boost and lowest is not None and lowest >= cfg["leg"]["temp"] - 1:
            s["boost_until"] = 0.0
            self._save()
            boost = False
            diag_log(self.hass, "info", "Warmwasser: Einmal-Aufheizen abgeschlossen", room="Warmwasser")
        leg_active = False
        if cfg["leg"]["on"] and (E["src"] or E["rod"]):  # ohne Erzeuger oder Heizstab kann nichts aufgeheizt werden
            leg = cfg["leg"]
            lab = self.hass.data.get(DOMAIN, {}).get("labs")
            if lab is not None and s["leg_run"] is None:
                leg = await lab.leg_effective(leg, local, (s["leg_last"] or {}).get("ts"))  # Lab „Legionellenschutz nach Sonne“
            if s["leg_run"] is None and leg_due(leg, local, (s["leg_last"] or {}).get("ts"), False):
                if lab is not None:
                    lab.leg_started()
                s["leg_run"] = {"start": now}
                self._save()
                diag_log(self.hass, "info", f"Warmwasser: Legionellenschutz startet (Ziel {cfg['leg']['temp']} °C)", room="Warmwasser")
            if s["leg_run"] is not None:
                res = leg_step(s["leg_run"], lowest, max(known) if known else None, cfg["leg"], now)
                if res is not None:
                    s["leg_last"] = {"ts": local.isoformat(), **res}
                    s["leg_run"] = None
                    self._save()
                    if res["ok"]:
                        diag_log(self.hass, "info", f"Warmwasser: Legionellenschutz abgeschlossen ({res['max']} °C, {res['held']} Min. gehalten)", room="Warmwasser")
                    else:
                        diag_log(self.hass, "warning", f"Warmwasser: Legionellenschutz abgebrochen, {cfg['leg']['temp']} °C wurden nicht gehalten", room="Warmwasser")
                else:
                    leg_active = True
        elif s["leg_run"] is not None:
            s["leg_run"] = None
            self._save()

        # Soll und Erzeuger
        hot = boost or leg_active
        want = float(cfg["leg"]["temp"]) if hot else float(cfg["heat"]["low"] if away else schedule_temp(cfg, local.weekday(), minute))
        lab = self.hass.data.get(DOMAIN, {}).get("labs")
        if lab is not None and not hot and not away:
            want = max(want, lab.dz_temp(cfg, local))  # Lab „Duschzeiten lernen“: vor gelernten Zapfzeiten vorheizen
        ctl = lowest if hot else control
        src_on = self._src_on(E["src"])
        src_want = None
        if E["src"]:
            src_want = source_wanted(ctl, want, src_on)
            if control is not None and control >= SAFE_MAX:
                src_want = False                       # Verbrühschutz gilt immer für den oberen Sensor
            if src_want is not None:
                await self._source(E["src"], src_want, want)

        # Heizstab
        rod_want = None
        if E["rod"]:
            rod_on = self._is_on(E["rod"])
            avail, soc_ok = self._surplus(rod_on)
            if control is not None and control >= SAFE_MAX:
                rod_want = False
            else:
                rod_want = rod_wanted(cfg["pv"], control, avail, soc_ok, rod_on, self._rod_since, now, away)
            if rod_want is not None and rod_want != rod_on:
                self._rod_since = now
                await self._switch(E["rod"], rod_want)
                if rod_want:
                    self._ours.add(E["rod"])

        # Pumpe
        pump_want = None
        if E["pump"]:
            pump_on = self._is_on(E["pump"])
            pump_want = pump_wanted(cfg, local.weekday(), minute, now, self._val(E["ret"]), pump_on, s["demand_until"], s["circ_until"], away)
            await self._switch(E["pump"], pump_want)
            if pump_want:
                self._ours.add(E["pump"])

        self._info = {"want": want, "src_want": src_want, "rod_want": rod_want, "pump_want": pump_want, "showers": shower_count(cfg["size"], known)}
