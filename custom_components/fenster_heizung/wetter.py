"""Modul 9: Wetter & Warnungen – eigene Warnungen aus Wetter-Entität/Wetterstation, Vorwarnung, Aktionen, Fenster-Erinnerung, Meldungen."""
from __future__ import annotations

import logging
import re
import time
from datetime import timedelta
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

TICK_SECONDS = 60
KEYS = ("storm", "thunder", "frost", "heat", "rain")
NAMES = {"storm": "Sturm", "thunder": "Gewitter und Hagel", "frost": "Frost", "heat": "Hitze", "rain": "Starkregen"}
OFFICIAL_PLATFORMS = ("dwd_weather_warnings", "nina", "meteoalarm")
THUNDER_CONDS = ("lightning", "lightning-rainy", "hail")
CLEAR_AFTER_S = 600  # eine Warnung endet erst, wenn sie 10 Minuten lang vorbei ist
UNDO_AFTER_S = 900  # Rückgängig 15 Minuten nach Ende der Warnung
START_TICKS = 2  # Beginn erst nach zwei Messungen in Folge (Böen glätten)
NOTE_GAP_S = 3600  # Vorwarnung/amtliche Warnung höchstens einmal pro Stunde je Art
FC_TTL_S = 900
MAX_ACTS = 12
MAX_LOG = 40
WIND_FACTOR = {"km/h": 1.0, "m/s": 3.6, "mph": 1.609344, "kn": 1.852, "kt": 1.852, "ft/s": 1.09728}
_ENT = re.compile(r"^[a-z_]+\.[a-z0-9_]+$")


def default_cfg() -> dict[str, Any]:
    return {
        "warn": {"storm": {"on": True, "kmh": 60}, "thunder": {"on": True}, "frost": {"on": True, "temp": 0}, "heat": {"on": False, "temp": 30}, "rain": {"on": False}},
        "wind": "", "ahead": {"on": True, "hours": 3}, "official": {"on": True, "ent": ""}, "acts": [],
        "win": {"on": False, "warn": ["storm", "thunder", "rain"]}, "notify": {"start": True, "end": False, "ahead": True, "to": []},
    }


def _num(v: Any, lo: float, hi: float, d: float) -> float:
    try:
        x = float(v)
    except (TypeError, ValueError):
        return d
    return min(hi, max(lo, x)) if x == x else d


def _ent(v: Any, domains: tuple[str, ...] | None = None) -> str:
    if isinstance(v, str) and _ENT.match(v) and (domains is None or v.split(".")[0] in domains):
        return v
    return ""


def do_options(ent: str) -> tuple[str, ...]:
    d = ent.split(".")[0]
    return ("close", "open") if d == "cover" else ("run",) if d in ("script", "scene") else ("on", "off")


def clean_cfg(raw: Any) -> dict[str, Any]:
    d = default_cfg()
    r = raw if isinstance(raw, dict) else {}
    w = r.get("warn") if isinstance(r.get("warn"), dict) else {}
    for k in KEYS:
        x = w.get(k) if isinstance(w.get(k), dict) else {}
        if "on" in x:
            d["warn"][k]["on"] = bool(x["on"])
    d["warn"]["storm"]["kmh"] = int(round(_num((w.get("storm") or {}).get("kmh") if isinstance(w.get("storm"), dict) else None, 30, 120, 60) / 5) * 5)
    d["warn"]["frost"]["temp"] = int(_num((w.get("frost") or {}).get("temp") if isinstance(w.get("frost"), dict) else None, -10, 5, 0))
    d["warn"]["heat"]["temp"] = int(_num((w.get("heat") or {}).get("temp") if isinstance(w.get("heat"), dict) else None, 20, 45, 30))
    d["wind"] = _ent(r.get("wind"), ("sensor",))
    a = r.get("ahead") if isinstance(r.get("ahead"), dict) else {}
    d["ahead"] = {"on": bool(a.get("on", True)), "hours": int(_num(a.get("hours"), 1, 12, 3))}
    o = r.get("official") if isinstance(r.get("official"), dict) else {}
    d["official"] = {"on": bool(o.get("on", True)), "ent": _ent(o.get("ent"), ("sensor", "binary_sensor"))}
    acts, seen = [], set()
    for x in r.get("acts") if isinstance(r.get("acts"), list) else []:
        if not isinstance(x, dict) or len(acts) >= MAX_ACTS:
            continue
        ent, aid = _ent(x.get("ent"), ("cover", "switch", "input_boolean", "light", "script", "scene")), str(x.get("id") or "")[:20]
        if not ent or x.get("warn") not in KEYS or not re.match(r"^[a-z0-9_]+$", aid) or aid in seen:
            continue
        seen.add(aid)
        do = x.get("do") if x.get("do") in do_options(ent) else do_options(ent)[0]
        acts.append({"id": aid, "warn": x["warn"], "ent": ent, "do": do, "undo": bool(x.get("undo", True)) and do != "run"})
    d["acts"] = acts
    wi = r.get("win") if isinstance(r.get("win"), dict) else {}
    d["win"] = {"on": bool(wi.get("on", False)), "warn": [k for k in KEYS if k in (wi.get("warn") if isinstance(wi.get("warn"), list) else d["win"]["warn"])]}
    n = r.get("notify") if isinstance(r.get("notify"), dict) else {}
    to = []
    for s in n.get("to") if isinstance(n.get("to"), list) else []:
        s = _ent(s, ("notify",))
        if s and s not in to and len(to) < 10:
            to.append(s)
    d["notify"] = {"start": bool(n.get("start", True)), "end": bool(n.get("end", False)), "ahead": bool(n.get("ahead", True)), "to": to}
    return d


def to_kmh(value: Any, unit: str | None) -> float | None:
    """Windgeschwindigkeit in km/h (Einheiten: km/h, m/s, mph, kn)."""
    try:
        v = float(str(value).replace(",", "."))
    except (TypeError, ValueError):
        return None
    if v != v or v < 0:
        return None
    return v * WIND_FACTOR.get((unit or "km/h").strip().lower(), 1.0)


def hour_flags(cfg: dict[str, Any], temp: float | None, wind: float | None, cond: str | None, precip: float | None = None) -> set[str]:
    """Welche Warnungen gelten für diesen Messwert oder diese Vorhersage-Stunde? (nur eingeschaltete)"""
    w, out = cfg["warn"], set()
    if w["storm"]["on"] and wind is not None and wind >= w["storm"]["kmh"]:
        out.add("storm")
    if w["thunder"]["on"] and cond in THUNDER_CONDS:
        out.add("thunder")
    if w["frost"]["on"] and temp is not None and temp <= w["frost"]["temp"]:
        out.add("frost")
    if w["heat"]["on"] and temp is not None and temp >= w["heat"]["temp"]:
        out.add("heat")
    if w["rain"]["on"] and (cond == "pouring" or (precip is not None and precip >= 5)):
        out.add("rain")
    return out


def still_active(cfg: dict[str, Any], key: str, temp: float | None, wind: float | None, cond: str | None) -> bool:
    """Hysterese: Eine aktive Warnung bleibt, bis der Wert deutlich unter der Grenze liegt."""
    w = cfg["warn"]
    if key == "storm":
        return wind is not None and wind >= w["storm"]["kmh"] - 5
    if key == "frost":
        return temp is not None and temp <= w["frost"]["temp"] + 1
    if key == "heat":
        return temp is not None and temp >= w["heat"]["temp"] - 1
    if key == "thunder":
        return cond in THUNDER_CONDS
    return cond == "pouring"


def official_view(state: Any, platform: str) -> dict[str, Any]:
    """Zustand einer Warn-Entität (DWD, NINA, MeteoAlarm) als {level 0-4, title, text}."""
    if state is None or str(state.state) in ("unknown", "unavailable", "", "off"):
        return {"level": 0, "title": "", "text": ""}
    a, st = state.attributes or {}, str(state.state)
    if platform == "dwd_weather_warnings":
        try:
            lvl = int(float(st))
        except ValueError:
            lvl = 0
        if lvl <= 0:
            return {"level": 0, "title": "", "text": ""}
        name = a.get("warning_1_name") or "Unwetter"
        end = str(a.get("warning_1_end") or "")
        hm = dt_util.parse_datetime(end) if end else None
        return {"level": min(lvl, 4), "title": f"Amtliche Warnung: {name}", "text": "DWD" + (f" · bis {dt_util.as_local(hm).strftime('%H:%M')} Uhr" if hm else "")}
    sev = {"minor": 1, "moderate": 2, "severe": 3, "extreme": 4}.get(str(a.get("severity") or "").lower(), 2)
    if st == "on":
        title = a.get("headline") or a.get("event") or "Warnung"
        return {"level": sev, "title": f"Amtliche Warnung: {title}", "text": str(a.get("sender") or ("NINA" if platform == "nina" else "MeteoAlarm"))}
    try:
        lvl = int(float(st))
    except ValueError:
        lvl = 0
    return {"level": max(0, min(lvl, 4)), "title": "Amtliche Warnung" if lvl > 0 else "", "text": ""}


def action_service(ent: str, do: str) -> tuple[str, str]:
    d = ent.split(".")[0]
    if d == "cover":
        return "cover", "close_cover" if do == "close" else "open_cover"
    if d in ("script", "scene"):
        return d, "turn_on"
    return d, "turn_on" if do == "on" else "turn_off"


def undo_of(do: str) -> str:
    return {"close": "open", "open": "close", "on": "off", "off": "on"}.get(do, "")


class WetterManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_wetter")
        self.cfg = default_cfg()
        self.st: dict[str, dict[str, Any]] = {k: {"a": False, "since": "", "v": None, "pend": 0, "clear": 0.0, "ahead": ""} for k in KEYS}
        self.acts: dict[str, dict[str, Any]] = {}  # ausgelöste Aktionen: {id: {at, undo_at, undo}}
        self.win_sent: set[str] = set()
        self.log: list[dict[str, str]] = []
        self._off: dict[str, Any] = {"level": 0, "title": "", "text": ""}
        self._off_seen = ""
        self._fc: list[dict[str, Any]] = []
        self._fc_ts = 0.0
        self._notes: dict[str, float] = {}
        self._unsub: CALLBACK_TYPE | None = None

    # ---- Start/Stop
    async def async_start(self) -> None:
        d = await self._store.async_load()
        if isinstance(d, dict):
            self.cfg = clean_cfg(d.get("cfg"))
            for k, v in (d.get("st") if isinstance(d.get("st"), dict) else {}).items():
                if k in self.st and isinstance(v, dict):
                    self.st[k].update({"a": bool(v.get("a")), "since": str(v.get("since") or "")})
            for k, v in (d.get("acts") if isinstance(d.get("acts"), dict) else {}).items():
                if isinstance(v, dict):
                    self.acts[str(k)] = {"at": str(v.get("at") or ""), "undo_at": float(v.get("undo_at") or 0), "undo": str(v.get("undo") or ""), "ent": str(v.get("ent") or "")}
            self.win_sent = {str(x) for x in d.get("win_sent") or []}
            self.log = [x for x in (d.get("log") or []) if isinstance(x, dict) and "t" in x and "x" in x][:MAX_LOG]
        self._unsub = async_track_time_interval(self.hass, self._tick, timedelta(seconds=TICK_SECONDS))
        self.hass.async_create_task(self._tick(None))

    def async_stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None

    def _save(self) -> None:
        self._store.async_delay_save(
            lambda: {
                "cfg": self.cfg, "st": {k: {"a": v["a"], "since": v["since"]} for k, v in self.st.items()},
                "acts": self.acts, "win_sent": sorted(self.win_sent), "log": self.log,
            }, 10,
        )

    def _add(self, text: str) -> None:
        self.log.insert(0, {"t": dt_util.now().isoformat(), "x": text})
        del self.log[MAX_LOG:]

    def active(self) -> bool:
        wm = self.hass.data.get(DOMAIN, {}).get("wasser")
        return bool(wm is not None and wm.modules.get("on", {}).get("wx"))

    # ---- Messwerte
    def _layout(self) -> dict[str, Any]:
        return ((self.hass.data.get(DOMAIN, {}).get("layout") or {}).get("wx")) or {}

    def weather_entity(self) -> str:
        ent = self._layout().get("entity")
        if ent and self.hass.states.get(ent) is not None:
            return ent
        ids = sorted(s.entity_id for s in self.hass.states.async_all("weather"))
        return ids[0] if ids else ""

    def _read(self) -> dict[str, Any]:
        """Aktuelle Werte: Temperatur, Wind (km/h), Zustand."""
        w = self.hass.states.get(self.weather_entity()) if self.weather_entity() else None
        a = (w.attributes if w is not None else {}) or {}
        temp = None
        out = self._layout().get("outdoor")
        st = self.hass.states.get(out) if out else None
        if st is not None:
            try:
                temp = float(str(st.state).replace(",", "."))
            except ValueError:
                temp = None
        if temp is None and a.get("temperature") is not None:
            try:
                temp = float(a["temperature"])
            except (TypeError, ValueError):
                temp = None
        wind = None
        ws = self.hass.states.get(self.cfg["wind"]) if self.cfg["wind"] else None
        if ws is not None:
            wind = to_kmh(ws.state, ws.attributes.get("unit_of_measurement"))
        if wind is None:
            unit = a.get("wind_speed_unit") or self.hass.config.units.wind_speed_unit
            wind = to_kmh(a.get("wind_speed"), unit)
            gust = to_kmh(a.get("wind_gust_speed"), unit)
            if gust is not None and (wind is None or gust > wind):
                wind = gust
        return {"temp": temp, "wind": wind, "cond": w.state if w is not None else None, "unit": a.get("wind_speed_unit") or self.hass.config.units.wind_speed_unit}

    async def _forecast(self, force: bool = False) -> list[dict[str, Any]]:
        ent = self.weather_entity()
        if not ent:
            return []
        if not force and self._fc and time.time() - self._fc_ts < FC_TTL_S:
            return self._fc
        self._fc_ts = time.time()
        try:
            res = await self.hass.services.async_call("weather", "get_forecasts", {"type": "hourly"}, target={"entity_id": ent}, blocking=True, return_response=True)
            rows = ((res or {}).get(ent) or {}).get("forecast") or []
        except Exception as err:  # Dienst ohne Stundenvorhersage: nie stören
            _LOGGER.debug("Vorhersage: %s", err)
            rows = []
        unit = (self.hass.states.get(ent).attributes.get("wind_speed_unit") if self.hass.states.get(ent) else None) or self.hass.config.units.wind_speed_unit
        out, now = [], dt_util.utcnow()
        for r in rows:
            t = dt_util.parse_datetime(str(r.get("datetime") or ""))
            if t is None or t < now - timedelta(minutes=30):
                continue
            wind, gust = to_kmh(r.get("wind_speed"), unit), to_kmh(r.get("wind_gust_speed"), unit)
            if gust is not None and (wind is None or gust > wind):
                wind = gust
            try:
                temp = float(r["temperature"]) if r.get("temperature") is not None else None
            except (TypeError, ValueError):
                temp = None
            out.append({"t": t.isoformat(), "temp": temp, "wind": wind, "cond": r.get("condition"), "p": r.get("precipitation")})
            if len(out) >= 24:
                break
        self._fc = out
        return out

    def _official(self) -> dict[str, Any]:
        o = self.cfg["official"]
        if not o["on"]:
            return {"level": 0, "title": "", "text": ""}
        reg = er.async_get(self.hass)
        ents = [o["ent"]] if o["ent"] else [
            e.entity_id for e in reg.entities.values()
            if e.platform in OFFICIAL_PLATFORMS and e.domain in ("sensor", "binary_sensor") and not re.search(r"advance|expected|vorab", e.entity_id) and not e.disabled
        ]
        best = {"level": 0, "title": "", "text": ""}
        for eid in ents:
            ent = reg.async_get(eid)
            v = official_view(self.hass.states.get(eid), ent.platform if ent else "")
            if v["level"] > best["level"]:
                best = v
        return best

    def open_windows(self) -> list[str]:
        from homeassistant.config_entries import ConfigEntryState
        out = []
        for e in self.hass.config_entries.async_entries(DOMAIN):
            c = getattr(e, "runtime_data", None)
            if e.state is ConfigEntryState.LOADED and c is not None and hasattr(c, "window_open"):
                try:
                    if c.window_open():
                        out.append(e.title)
                except Exception:  # Raum nicht bereit
                    continue
        return out

    # ---- Meldungen und Aktionen
    async def _notify(self, kind: str, title: str, msg: str, gap_key: str = "") -> int:
        n = self.cfg["notify"]
        if kind and not n.get(kind):
            return 0
        if gap_key:
            if time.time() - self._notes.get(gap_key, 0) < NOTE_GAP_S:
                return 0
            self._notes[gap_key] = time.time()
        sent = 0
        for svc in n["to"]:
            name = svc.split(".", 1)[1]
            if not self.hass.services.has_service("notify", name):
                continue
            try:
                await self.hass.services.async_call("notify", name, {"title": title, "message": msg}, blocking=False)
                sent += 1
            except Exception as err:  # Dienst fehlerhaft: nie die Regelung stören
                _LOGGER.debug("Benachrichtigung %s: %s", svc, err)
        return sent

    async def async_test(self) -> dict[str, Any]:
        return {"sent": await self._notify("", "Wetter und Warnungen", "Testmeldung von Modul 9. Die Benachrichtigung funktioniert.")}

    async def _call(self, ent: str, do: str) -> bool:
        if self.hass.states.get(ent) is None:
            return False
        dom, svc = action_service(ent, do)
        try:
            await self.hass.services.async_call(dom, svc, {"entity_id": ent}, blocking=False)
            return True
        except Exception as err:
            _LOGGER.debug("Aktion %s %s: %s", ent, do, err)
            return False

    async def _run_acts(self, key: str) -> None:
        for x in self.cfg["acts"]:
            if x["warn"] != key:
                continue
            ok = await self._call(x["ent"], x["do"])
            name = (self.hass.states.get(x["ent"]).attributes.get("friendly_name") if self.hass.states.get(x["ent"]) else None) or x["ent"]
            if ok:
                self.acts[x["id"]] = {"at": dt_util.now().isoformat(), "undo_at": 0.0, "undo": undo_of(x["do"]) if x["undo"] else "", "ent": x["ent"]}
                self._add(f"{name}: {dict(close='geschlossen', open='geöffnet', on='eingeschaltet', off='ausgeschaltet', run='ausgeführt')[x['do']]} ({NAMES[key]}).")
            else:
                self._add(f"{name} nicht gefunden, Aktion übersprungen.")

    async def _undo_due(self, now_ts: float) -> None:
        busy = {x["ent"] for x in self.cfg["acts"] if self.st[x["warn"]]["a"]}
        for aid, a in list(self.acts.items()):
            if not any(x["id"] == aid for x in self.cfg["acts"]):
                del self.acts[aid]
                continue
            if a.get("undo_at") and now_ts >= a["undo_at"]:
                if a["ent"] not in busy and a.get("undo"):
                    await self._call(a["ent"], a["undo"])
                    st = self.hass.states.get(a["ent"])
                    self._add(f"{(st.attributes.get('friendly_name') if st else None) or a['ent']}: wieder zurückgesetzt.")
                del self.acts[aid]

    async def _windows(self, key: str) -> None:
        w = self.cfg["win"]
        if not w["on"] or key not in w["warn"]:
            return
        names = [n for n in self.open_windows() if f"{key}:{n}" not in self.win_sent]
        if not names:
            return
        for n in names:
            self.win_sent.add(f"{key}:{n}")
        txt = ", ".join(names)
        self._add(f"Fenster-Erinnerung ({NAMES[key]}): {txt}.")
        await self._notify("", f"{NAMES[key]}: Fenster offen", f"Bei {NAMES[key]} ist noch offen: {txt}.")

    # ---- Hauptschleife
    async def async_config_changed(self) -> None:
        for aid in [a for a in self.acts if not any(x["id"] == a for x in self.cfg["acts"])]:
            del self.acts[aid]
        self._fc_ts = 0.0
        await self._tick(None)

    async def _tick(self, _now: Any) -> None:
        if not self.active():
            return
        now_ts = time.time()
        r = self._read()
        fc = await self._forecast() if self.cfg["ahead"]["on"] else []
        cur = hour_flags(self.cfg, r["temp"], r["wind"], r["cond"])
        for k in KEYS:
            s, on = self.st[k], self.cfg["warn"][k]["on"]
            s["v"] = r["wind"] if k == "storm" else r["temp"] if k in ("frost", "heat") else None
            if not on:
                if s["a"]:
                    s["a"] = False
                    await self._end(k)
                s["pend"], s["ahead"] = 0, ""
                continue
            if not s["a"]:
                s["pend"] = s["pend"] + 1 if k in cur else 0
                if s["pend"] >= (START_TICKS if k == "storm" else 1):
                    await self._start(k, r)
            else:
                if still_active(self.cfg, k, r["temp"], r["wind"], r["cond"]):
                    s["clear"] = 0.0
                    if k in self.cfg["win"]["warn"]:
                        await self._windows(k)
                elif not s["clear"]:
                    s["clear"] = now_ts
                elif now_ts - s["clear"] >= CLEAR_AFTER_S:
                    s["a"], s["clear"] = False, 0.0
                    await self._end(k)
            # Vorwarnung aus der Stundenvorhersage
            s["ahead"] = ""
            if not s["a"] and self.cfg["ahead"]["on"]:
                lim = dt_util.utcnow() + timedelta(hours=self.cfg["ahead"]["hours"])
                for h in fc:
                    if dt_util.parse_datetime(h["t"]) <= lim and k in hour_flags(self.cfg, h["temp"], h["wind"], h["cond"], h["p"] if isinstance(h.get("p"), (int, float)) else None):
                        s["ahead"] = h["t"]
                        break
                if s["ahead"]:
                    hm = dt_util.as_local(dt_util.parse_datetime(s["ahead"])).strftime("%H:%M")
                    if await self._notify("ahead", f"Vorwarnung: {NAMES[k]}", f"{NAMES[k]} wird ab etwa {hm} Uhr erwartet.", f"ahead:{k}"):
                        self._add(f"Vorwarnung {NAMES[k]} ab {hm} Uhr.")
        # amtliche Warnung
        off = self._official()
        if off["level"] > 0 and off["title"] != self._off_seen:
            self._add(off["title"])
            await self._notify("start", "Wetter-Warnung", off["title"] + (f" ({off['text']})" if off["text"] else "") + ".", "off:" + off["title"])
        self._off_seen = off["title"] if off["level"] > 0 else ""
        self._off = off
        await self._undo_due(now_ts)
        if any(s["a"] for s in self.st.values()) is False:
            self.win_sent.clear()
        self._save()

    async def _start(self, k: str, r: dict[str, Any]) -> None:
        s = self.st[k]
        s["a"], s["pend"], s["clear"], s["since"] = True, 0, 0.0, dt_util.now().isoformat()
        val = {"storm": f" ({r['wind']:.0f} km/h)" if r["wind"] is not None else "", "frost": f" ({r['temp']:.1f} °C)" if r["temp"] is not None else "", "heat": f" ({r['temp']:.1f} °C)" if r["temp"] is not None else ""}.get(k, "")
        self._add(f"{NAMES[k]} gestartet{val}.")
        for aid, a in list(self.acts.items()):  # neue Warnung: ein noch offenes Rückgängig verwerfen
            if any(x["id"] == aid and x["warn"] == k for x in self.cfg["acts"]):
                a["undo_at"] = 0.0
        await self._notify("start", f"Warnung: {NAMES[k]}", f"{NAMES[k]}{val}.")
        await self._run_acts(k)
        await self._windows(k)

    async def _end(self, k: str) -> None:
        self.st[k]["since"] = ""
        self._add(f"{NAMES[k]} beendet.")
        await self._notify("end", f"Entwarnung: {NAMES[k]}", f"{NAMES[k]} ist vorbei.")
        for x in self.cfg["acts"]:
            a = self.acts.get(x["id"])
            if x["warn"] == k and a is not None:
                if a.get("undo"):
                    a["undo_at"] = time.time() + UNDO_AFTER_S
                else:
                    del self.acts[x["id"]]
        self.win_sent = {w for w in self.win_sent if not w.startswith(k + ":")}

    # ---- Ansicht und Speichern
    async def async_set(self, raw: Any) -> dict[str, Any]:
        self.cfg = clean_cfg({**self.cfg, **raw} if isinstance(raw, dict) else raw)  # fehlende Felder (alter Browser) behalten ihren Stand
        self._save()
        await self.async_config_changed()
        return await self.snapshot()

    async def snapshot(self) -> dict[str, Any]:
        r, fc = self._read(), []
        if self.active():
            rows = await self._forecast()
            for h in rows[:12]:
                p = h["p"] if isinstance(h.get("p"), (int, float)) else None
                fc.append({"t": h["t"], "temp": h["temp"], "wind": h["wind"], "cond": h["cond"], "w": sorted(hour_flags(self.cfg, h["temp"], h["wind"], h["cond"], p))})
        warn = {}
        for k in KEYS:
            s = self.st[k]
            warn[k] = {"a": bool(s["a"]), "v": s["v"], "since": s["since"] or None, "ahead": s["ahead"] or None}
        acts = {aid: {"state": "run", "at": a["at"]} for aid, a in self.acts.items()}
        return {"cfg": self.cfg, "state": {"warn": warn, "official": self._off, "acts": acts, "now": r}, "fc": fc, "open": self.open_windows(), "log": self.log[:12]}
