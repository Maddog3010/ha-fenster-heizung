"""Modul 1: Luftentfeuchter (Schritt 1 des Konzepts: Gerät und Regelung).

Ein mobiler Entfeuchter steht in einem Raum von Modul 1 (Heizungsraum oder Messraum). Modul 1 regelt ihn mit der
Luftfeuchte und den Fensterkontakten genau dieses Raums: Ein über der Obergrenze, aus unter der Untergrenze
(Hysterese), aus bei offenem Fenster oder vollem Tank, mit Mindestlaufzeit und Sperrzeit gegen ständiges Schalten.
Bei Abwesenheit oder Urlaub gilt eine höhere Obergrenze (Mindestschutz vor Schimmel).

Gerätearten: eigene Entität (humidifier.*, auch switch.* oder fan.*), Schaltsteckdose (switch.*) mit optionaler
Leistungsmessung, oder „nur beobachten“ (Gerät mit eigenem Hygrostat, Modul 1 schaltet nichts).

Schritt 2 (Standort): Einmal am Tag wird bestätigt, in welchem Raum der Entfeuchter steht – über die Standort-Karte
im Dashboard und auf Wunsch per Benachrichtigung am Handy mit Tasten für die häufigsten Räume. Bis zur Antwort gilt der
Standort von gestern. Ohne Antwort bis zur eingestellten Uhrzeit gilt „Wie gestern“, „Pausieren“ oder „Nur Hinweis“.
Der Standort jedes Tages wird mit der Art der Bestätigung gespeichert (Verlauf, später Statistik). Die Daten sind als Liste von Geräten angelegt, damit später mehrere Geräte möglich
sind; heute wird nur das erste genutzt.

Oben stehen reine Rechenfunktionen ohne Home-Assistant-Importe (testbar), unten der Manager.
"""
from __future__ import annotations

import logging
import math
import re
import time
from datetime import timedelta
from typing import Any

_LOGGER = logging.getLogger(__name__)

TICK_SECONDS = 30
HIST_DAYS = 60
CMD_GAP_S = 60          # höchstens ein Schaltbefehl pro Minute, falls das Gerät nicht reagiert
KINDS = ("entity", "plug", "watch")
_ENT = re.compile(r"^[a-z_]+\.[a-z0-9_]{1,200}$")
_LOC = re.compile(r"^(ms_[a-z0-9]{1,16}|[A-Za-z0-9]{8,40})$")
FULL_STATES = {"on", "true", "full", "voll", "problem", "1"}
_HM = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")
_NOTIFY = re.compile(r"^notify\.[a-z0-9_]{1,120}$")
MISS = ("same", "pause", "hint")
ACT_PREFIX = "FHLF_"          # Aktionen der Handy-Benachrichtigung: FHLF_L_<Standort> und FHLF_OFF
PUSH_ROOMS = 3                # so viele Raum-Tasten in der Benachrichtigung (Android zeigt höchstens drei)


def default_dev() -> dict[str, Any]:
    return {
        "id": "d1", "name": "Luftentfeuchter", "kind": "entity", "ent": "", "power": "", "run_w": 20.0, "tank": "",
        "cap_l": 0.0, "lph": 0.0,  # Tankschätzung ohne Sensor: Tankinhalt und Entfeuchtung pro Stunde (0 = aus)
        "hi": 60.0, "lo": 55.0, "hi_away": 65.0, "minrun": 15, "lock": 10, "vent": False,
        "ask": default_ask(),
    }


def default_ask() -> dict[str, Any]:
    """Tägliche Standortabfrage: Uhrzeit, nur wenn jemand zu Hause ist, Verhalten ohne Antwort bis …, Räume, Handys."""
    return {"on": True, "time": "08:00", "home_only": True, "until": "12:00", "miss": "same", "rooms": [], "push": []}


def clean_ask(raw: Any) -> dict[str, Any]:
    d, r = default_ask(), raw if isinstance(raw, dict) else {}
    t = r.get("time") if isinstance(r.get("time"), str) and _HM.match(r.get("time")) else d["time"]
    u = r.get("until") if isinstance(r.get("until"), str) and _HM.match(r.get("until")) else d["until"]
    if u <= t:  # die Frist liegt immer nach der Abfrage
        u = "23:59" if t >= "23:00" else f"{int(t[:2]) + 1:02d}:{t[3:]}"
    rooms = [x for x in (r.get("rooms") or []) if isinstance(x, str) and _LOC.match(x)]
    push = [x for x in (r.get("push") or []) if isinstance(x, str) and _NOTIFY.match(x)]
    return {"on": r.get("on") is not False, "time": t, "home_only": r.get("home_only") is not False, "until": u,
            "miss": r.get("miss") if r.get("miss") in MISS else d["miss"], "rooms": list(dict.fromkeys(rooms))[:20], "push": list(dict.fromkeys(push))[:6]}


def push_rooms(offer: list[str], yest: str, counts: dict[str, int]) -> list[str]:
    """Raum-Tasten für die Benachrichtigung: zuerst der Raum von gestern, dann die meistgenutzten."""
    order = sorted(offer, key=lambda x: (-counts.get(x, 0), offer.index(x)))
    if yest in order:
        order.remove(yest)
        order.insert(0, yest)
    return order[:PUSH_ROOMS]


def ask_phase(ask: dict[str, Any], hm: str, confirmed: bool) -> str:
    """Stand der Abfrage am Tag: off (keine tägliche Abfrage), done (bestätigt), wait (vor der Uhrzeit), open, missed."""
    if not ask["on"]:
        return "off"
    if confirmed:
        return "done"
    if hm < ask["time"]:
        return "wait"
    return "missed" if hm >= ask["until"] else "open"


def _num(v: Any, lo: float, hi: float, d: float) -> float:
    try:
        x = float(v)
    except (TypeError, ValueError):
        return d
    return d if math.isnan(x) else min(max(x, lo), hi)


def _ent(v: Any, domains: tuple[str, ...]) -> str:
    return v if isinstance(v, str) and _ENT.match(v) and v.split(".")[0] in domains else ""


def clean_dev(raw: Any) -> dict[str, Any]:
    d, r = default_dev(), raw if isinstance(raw, dict) else {}
    kind = r.get("kind") if r.get("kind") in KINDS else d["kind"]
    out = {
        "id": "d1", "name": str(r.get("name") or d["name"]).strip()[:30] or d["name"], "kind": kind,
        "ent": _ent(r.get("ent"), ("switch",) if kind == "plug" else ("humidifier", "switch", "fan", "input_boolean")),
        "power": _ent(r.get("power"), ("sensor",)), "run_w": _num(r.get("run_w"), 1, 2000, d["run_w"]),
        "tank": _ent(r.get("tank"), ("binary_sensor", "sensor")),
        "cap_l": _num(r.get("cap_l"), 0, 50, 0), "lph": _num(r.get("lph"), 0, 10, 0),
        "hi": _num(r.get("hi"), 30, 90, d["hi"]), "lo": _num(r.get("lo"), 25, 85, d["lo"]),
        "hi_away": _num(r.get("hi_away"), 30, 95, d["hi_away"]),
        "minrun": int(_num(r.get("minrun"), 0, 120, d["minrun"])), "lock": int(_num(r.get("lock"), 0, 120, d["lock"])),
        "vent": r.get("vent") is True, "ask": clean_ask(r.get("ask")),
    }
    if out["lo"] >= out["hi"]:
        out["lo"] = max(25.0, out["hi"] - 5)
    if out["hi_away"] < out["hi"]:
        out["hi_away"] = out["hi"]
    return out


def clean_cfg(raw: Any) -> dict[str, Any]:
    r = raw if isinstance(raw, dict) else {}
    devs = [clean_dev(x) for x in (r.get("devs") or [])[:1] if isinstance(x, dict)]
    return {"devs": devs}


def abs_h(t: float, rh: float) -> float:
    """Absolute Feuchte in g/m³ (Magnus)."""
    es = 6.112 * math.exp(17.62 * t / (243.12 + t))
    return 216.7 * (rh / 100 * es) / (273.15 + t)


def tank_fill(dev: dict[str, Any], run_h: float) -> float | None:
    """Geschätzte Tankfüllung 0..1 ohne Sensor, oder None, wenn keine Schätzung eingestellt ist."""
    if dev["cap_l"] <= 0 or dev["lph"] <= 0:
        return None
    return max(0.0, run_h * dev["lph"] / dev["cap_l"])


def decide(dev: dict[str, Any], ctx: dict[str, Any], is_on: bool) -> tuple[bool | None, bool, str, list[str]]:
    """Soll das Gerät laufen? Ergebnis: (an?, harter Grund, Kennung, Gründe für „Warum?“).

    Ein harter Grund (Tank voll, Fenster offen, Standort fehlt, heute aus …) schaltet sofort, auch während der
    Mindestlaufzeit. None heißt: nicht schalten (Gerät nicht erreichbar).
    ctx: loc, loc_name, hum, open (Namen offener Fenster), away, out_t, out_rh, avail, full, day_off
    """
    if ctx.get("day_off") == "pause":
        return False, True, "pause", ["Pausiert: Der Standort wurde heute nicht bestätigt. Bestätige ihn, dann regelt Modul 1 wieder."]
    if ctx.get("day_off"):
        return False, True, "day_off", ["Heute nicht in Betrieb. Morgen regelt Modul 1 wieder."]
    if not ctx.get("loc"):
        return False, True, "no_loc", ["Standort unbekannt: Wähle, in welchem Raum der Entfeuchter steht."]
    if not ctx.get("avail"):
        return None, True, "unavail", ["Gerät nicht erreichbar. Modul 1 schaltet nichts, bis es wieder meldet."]
    if ctx.get("full"):
        return False, True, "full", ["Wassertank voll. Bitte leeren und „Tank geleert“ tippen."]
    hum = ctx.get("hum")
    if hum is None:
        return False, True, "no_hum", [f"Luftfeuchte in {ctx.get('loc_name') or 'diesem Raum'} fehlt. Sicherheitshalber aus."]
    if ctx.get("open"):
        return False, True, "window", [f"Fenster offen ({', '.join(ctx['open'])}). Lüften hilft gerade mehr."]
    away = bool(ctx.get("away"))
    hi = dev["hi_away"] if away else dev["hi"]
    lo = hi - (dev["hi"] - dev["lo"])
    tag = " (Abwesenheit: nur Schutz vor Schimmel)" if away else ""
    t, ot, orh = ctx.get("t"), ctx.get("out_t"), ctx.get("out_rh")
    if dev["vent"] and hum > lo and t is not None and ot is not None and orh is not None and abs_h(ot, orh) < abs_h(t, hum) - 0.5:
        return False, False, "vent", [f"Feuchte {hum:.0f} %. Draußen ist die Luft trockener: Lüften statt Entfeuchten."]
    if is_on:
        if hum > lo:
            return True, False, "run", [f"Feuchte {hum:.0f} % über der Untergrenze {lo:.0f} %: läuft weiter{tag}."]
        return False, False, "target", [f"Ziel erreicht: Feuchte {hum:.0f} % ist bei {lo:.0f} % oder darunter{tag}."]
    if hum > hi:
        return True, False, "start", [f"Feuchte {hum:.0f} % über der Obergrenze {hi:.0f} %: einschalten bis {lo:.0f} %{tag}."]
    return False, False, "ok", [f"Feuchte {hum:.0f} % in Ordnung. Ein ab {hi:.0f} %{tag}."]


# --------------------------------------------------------------------------- Manager
from homeassistant.core import CALLBACK_TYPE, HomeAssistant  # noqa: E402
from homeassistant.helpers.event import async_track_time_interval  # noqa: E402
from homeassistant.util import dt as dt_util  # noqa: E402

from .backup import SafeStore  # noqa: E402
from .const import CONF_HUMIDITY, CONF_ROOM_TEMP, CONF_THERMOSTATS, CONF_WINDOWS, DOMAIN, PANEL_URL  # noqa: E402


def _fnum(st: Any) -> float | None:
    try:
        x = float(st.state)
    except (AttributeError, TypeError, ValueError):
        return None
    return None if math.isnan(x) else x


class EntfeuchterManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_entfeuchter")
        self.cfg = clean_cfg({})
        # Laufzustand: Standort, heute aus, Zeiten, Laufzeit je Tag, Standort je Tag, Stunden seit dem Leeren
        # locs: je Tag {"l": Standort oder "off", "h": Art} mit h = ok (bestätigt), auto (wie gestern übernommen), pause (ohne Antwort pausiert), hint (ohne Antwort), "" (offen)
        self.st: dict[str, Any] = {"loc": "", "off_day": "", "on_ts": 0.0, "off_ts": 0.0, "run": {}, "locs": {}, "tank_h": 0.0, "full_ts": 0.0,
                                   "conf_day": "", "sent_day": "", "miss_day": ""}
        self.live: dict[str, Any] = {}
        self._last_tick = 0.0
        self._cmd_ts = 0.0
        self._unsub: CALLBACK_TYPE | None = None
        self._unsub_ev: CALLBACK_TYPE | None = None

    async def async_start(self) -> None:
        from .api import _layout  # Messräume stehen im Layout
        await _layout(self.hass)
        d = await self._store.async_load()
        if isinstance(d, dict):
            self.cfg = clean_cfg(d.get("cfg"))
            s = d.get("st") if isinstance(d.get("st"), dict) else {}
            self.st.update({
                "loc": str(s.get("loc") or "") if _LOC.match(str(s.get("loc") or "")) else "",
                "off_day": str(s.get("off_day") or ""), "on_ts": float(s.get("on_ts") or 0), "off_ts": float(s.get("off_ts") or 0),
                "run": {str(k): float(v) for k, v in (s.get("run") or {}).items() if isinstance(v, (int, float))},
                "locs": {str(k): ({"l": str(v.get("l") or ""), "h": str(v.get("h") or "")} if isinstance(v, dict) else {"l": str(v), "h": ""}) for k, v in (s.get("locs") or {}).items()},
                "conf_day": str(s.get("conf_day") or ""), "sent_day": str(s.get("sent_day") or ""), "miss_day": str(s.get("miss_day") or ""),
                "tank_h": float(s.get("tank_h") or 0), "full_ts": float(s.get("full_ts") or 0),
            })
        self._unsub = async_track_time_interval(self.hass, self._tick, timedelta(seconds=TICK_SECONDS))
        self._unsub_ev = self.hass.bus.async_listen("mobile_app_notification_action", self._on_action)

    def async_stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None
        if self._unsub_ev:
            self._unsub_ev()
            self._unsub_ev = None

    async def _on_action(self, event) -> None:
        """Antwort aus der Handy-Benachrichtigung."""
        act = str((event.data or {}).get("action") or "")
        if not act.startswith(ACT_PREFIX):
            return
        if act == ACT_PREFIX + "OFF":
            await self.async_cmd("off_today")
        elif act.startswith(ACT_PREFIX + "L_"):
            await self.async_cmd("loc", act[len(ACT_PREFIX) + 2:])

    def _save(self) -> None:
        keep = sorted(self.st["run"])[-HIST_DAYS:]
        self.st["run"] = {k: self.st["run"][k] for k in keep}
        self.st["locs"] = {k: self.st["locs"][k] for k in sorted(self.st["locs"])[-HIST_DAYS:]}
        self._store.async_delay_save(lambda: {"cfg": self.cfg, "st": self.st}, 5)

    def dev(self) -> dict[str, Any] | None:
        return self.cfg["devs"][0] if self.cfg["devs"] else None

    # ---- Raum des Standorts: Name, Luftfeuchte, Temperatur, Fenster
    def _room(self, loc: str) -> dict[str, Any] | None:
        if not loc:
            return None
        if loc.startswith("ms_"):
            lay = self.hass.data.get(DOMAIN, {}).get("layout") or {}
            m = next((x for x in lay.get("mess") or [] if x.get("id") == loc), None)
            return {"name": m["name"], "hum": m.get("hum") or "", "temp": m.get("temp") or "", "win": []} if m else None
        e = self.hass.config_entries.async_get_entry(loc)
        if e is None or e.domain != DOMAIN:
            return None
        o = {**e.data, **e.options}
        win = o.get(CONF_WINDOWS) or []
        th = o.get(CONF_THERMOSTATS) or []
        return {"name": e.title, "hum": o.get(CONF_HUMIDITY) or "", "temp": o.get(CONF_ROOM_TEMP) or "", "win": list(win) if isinstance(win, list) else [win],
                "th": list(th) if isinstance(th, list) else [th]}

    def rooms(self) -> list[dict[str, Any]]:
        """Mögliche Standorte: Räume mit Luftfeuchte-Sensor (Heizungsräume und Messräume)."""
        out = []
        for e in self.hass.config_entries.async_entries(DOMAIN):
            r = self._room(e.entry_id)
            if r and r["hum"]:
                out.append({"id": e.entry_id, "name": r["name"], "hum": _fnum(self.hass.states.get(r["hum"])), "ms": False})
        for m in (self.hass.data.get(DOMAIN, {}).get("layout") or {}).get("mess") or []:
            if m.get("hum"):
                out.append({"id": m["id"], "name": m["name"], "hum": _fnum(self.hass.states.get(m["hum"])), "ms": True})
        return out

    def _outdoor(self) -> tuple[float | None, float | None]:
        lay = self.hass.data.get(DOMAIN, {}).get("layout") or {}
        wx = lay.get("wx") or {}
        st = self.hass.states
        w = st.get(wx.get("entity") or "") if wx.get("entity") else next(iter(st.async_all("weather")), None)
        o = st.get(wx.get("outdoor") or "") if wx.get("outdoor") else None
        t = _fnum(o) if o is not None else None
        if t is None and w is not None:
            t = w.attributes.get("temperature")
        rh = w.attributes.get("humidity") if w is not None else None
        try:
            return (float(t) if t is not None else None, float(rh) if rh is not None else None)
        except (TypeError, ValueError):
            return None, None

    def _away(self) -> bool:
        pm = self.hass.data.get(DOMAIN, {}).get("presence")
        try:
            return pm is not None and pm.effective() in ("away", "vacation")
        except Exception:  # noqa: BLE001
            return False

    def _is_on(self, dev: dict[str, Any]) -> bool | None:
        s = self.hass.states.get(dev["ent"]) if dev["ent"] else None
        if s is None or s.state in ("unavailable", "unknown"):
            return None
        return s.state == "on"

    def _running(self, dev: dict[str, Any], on: bool | None) -> bool:
        if not on:
            return False
        if dev["power"]:
            p = _fnum(self.hass.states.get(dev["power"]))
            if p is not None:
                return p >= dev["run_w"]
        return True

    def _tank_full(self, dev: dict[str, Any]) -> tuple[bool, float | None]:
        if dev["tank"]:
            s = self.hass.states.get(dev["tank"])
            if s is not None:
                v = _fnum(s)
                if v is not None and dev["tank"].startswith("sensor."):
                    return v >= 95, min(1.0, v / 100)
                return s.state.lower() in FULL_STATES, None
        f = tank_fill(dev, self.st["tank_h"])
        return (f is not None and f >= 1.0), f

    async def _switch(self, dev: dict[str, Any], on: bool) -> None:
        dom = dev["ent"].split(".")[0]
        svc_dom = dom if dom in ("humidifier", "fan", "input_boolean") else "switch"
        try:
            await self.hass.services.async_call(svc_dom, "turn_on" if on else "turn_off", {"entity_id": dev["ent"]}, blocking=False)
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("Luftentfeuchter %s konnte nicht geschaltet werden: %s", dev["ent"], err)

    # ---- Regelung
    async def _tick(self, _now=None) -> None:
        dev = self.dev()
        now = time.time()
        dt = min(max(now - (self._last_tick or now), 0.0), 120.0)
        self._last_tick = now
        if dev is None or not dev["ent"]:
            self.live = {"code": "setup", "why": ["Noch kein Gerät eingerichtet."]}
            return
        today = dt_util.now().date().isoformat()
        on = self._is_on(dev)
        running = self._running(dev, on)
        # Laufzeit zählen (Tag und seit dem letzten Leeren)
        if running and dt:
            self.st["run"][today] = self.st["run"].get(today, 0.0) + dt / 60
            self.st["tank_h"] += dt / 3600
        if self.st["off_day"] and self.st["off_day"] != today:
            self.st["off_day"] = ""
        await self._ask_step(dev, today)
        rec = self.st["locs"].get(today) or {"l": "", "h": ""}
        rec["l"] = "off" if self.st["off_day"] == today else self.st["loc"]
        if rec["l"]:
            self.st["locs"][today] = rec
        room = self._room(self.st["loc"])
        if self.st["loc"] and room is None:  # Raum gelöscht
            self.st["loc"] = ""
        hum = _fnum(self.hass.states.get(room["hum"])) if room and room["hum"] else None
        if hum is not None and not 0 <= hum <= 100:
            hum = None
        t = _fnum(self.hass.states.get(room["temp"])) if room and room["temp"] else None
        if t is None and room:
            for th in room.get("th") or []:  # sonst die Temperatur am ersten Thermostat
                s = self.hass.states.get(th)
                try:
                    t = float(s.attributes.get("current_temperature")) if s is not None and s.attributes.get("current_temperature") is not None else None
                except (TypeError, ValueError):
                    t = None
                if t is not None:
                    break
        open_w = []
        for w in (room or {}).get("win") or []:
            s = self.hass.states.get(w)
            if s is not None and s.state in ("on", "open"):
                open_w.append(s.attributes.get("friendly_name") or w)
        full, fill = self._tank_full(dev)
        if full and not self.st["full_ts"]:
            self.st["full_ts"] = now
        ot, orh = self._outdoor()
        ctx = {"loc": self.st["loc"] if room else "", "loc_name": room["name"] if room else "", "hum": hum, "t": t, "open": open_w,
               "away": self._away(), "out_t": ot, "out_rh": orh, "avail": on is not None, "full": full,
               "day_off": ("pause" if (self.st["locs"].get(today) or {}).get("h") == "pause" else True) if self.st["off_day"] == today else False}
        want, hard, code, why = decide(dev, ctx, bool(on))
        hint = ""
        if on and dev["power"] and not running:
            hint = "Eingeschaltet, zieht aber keinen Strom. Ist der Tank voll?"
        # Mindestlaufzeit und Sperrzeit
        if want is not None and on is not None and want != on and not hard:
            if on and now - self.st["on_ts"] < dev["minrun"] * 60:
                left = math.ceil((dev["minrun"] * 60 - (now - self.st["on_ts"])) / 60)
                want, why = True, why + [f"Mindestlaufzeit: noch {left} Min."]
            elif not on and now - self.st["off_ts"] < dev["lock"] * 60:
                left = math.ceil((dev["lock"] * 60 - (now - self.st["off_ts"])) / 60)
                want, why = False, why + [f"Sperrzeit nach dem Ausschalten: noch {left} Min."]
        if dev["kind"] == "watch":
            why = ["Nur beobachten: Das Gerät regelt selbst, Modul 1 schaltet nichts."] + why
        elif want is not None and on is not None and want != on and now - self._cmd_ts >= CMD_GAP_S:
            self._cmd_ts = now
            await self._switch(dev, want)
            if want:
                self.st["on_ts"] = now
            else:
                self.st["off_ts"] = now
        if on and not self.st["on_ts"]:
            self.st["on_ts"] = now
        self.live = {
            "code": code, "why": why, "hint": hint, "on": on, "running": running, "want": want, "hum": hum, "t": t,
            "loc_name": room["name"] if room else "", "open": open_w, "away": ctx["away"], "full": full,
            "fill": fill, "since": self.st["on_ts"] if on else self.st["off_ts"], "today_min": round(self.st["run"].get(today, 0.0), 1),
        }
        self._save()

    # ---- Tägliche Standortabfrage (Schritt 2)
    def _offer(self, dev: dict[str, Any]) -> list[dict[str, Any]]:
        """Räume zur Auswahl: die gewählten, sonst alle Räume mit Luftfeuchte-Sensor."""
        allr = self.rooms()
        sel = dev["ask"]["rooms"]
        return [r for r in allr if r["id"] in sel] if sel and any(r["id"] in sel for r in allr) else allr

    def _yesterday(self) -> str:
        y = (dt_util.now().date() - timedelta(days=1)).isoformat()
        rec = self.st["locs"].get(y) or {}
        return rec.get("l") or ""

    def _someone_home(self) -> bool:
        pm = self.hass.data.get(DOMAIN, {}).get("presence")
        try:
            states = pm._person_states() if pm is not None else []
        except Exception:  # noqa: BLE001
            states = []
        return (not states) or any(h for h, _ in states)

    async def _ask_step(self, dev: dict[str, Any], today: str) -> None:
        ask = dev["ask"]
        hm = dt_util.now().strftime("%H:%M")
        phase = ask_phase(ask, hm, self.st["conf_day"] == today)
        if phase == "open" and ask["push"] and self.st["sent_day"] != today and (not ask["home_only"] or self._someone_home()):
            self.st["sent_day"] = today
            await self._send_ask(dev)
        if phase == "missed" and self.st["miss_day"] != today:
            self.st["miss_day"] = today
            rec = self.st["locs"].setdefault(today, {"l": self.st["loc"], "h": ""})
            if ask["miss"] == "same" and self.st["loc"]:
                self.st["conf_day"], rec["h"] = today, "auto"
            elif ask["miss"] == "pause":
                self.st["off_day"], rec["h"] = today, "pause"
            else:
                rec["h"] = "hint"

    def _name(self, loc: str) -> str:
        if loc == "off":
            return "nicht in Betrieb"
        r = self._room(loc)
        return r["name"] if r else ""

    async def _send_ask(self, dev: dict[str, Any], targets: list[str] | None = None) -> int:
        """Benachrichtigung „Wo steht der Entfeuchter heute?“ mit Tasten für die häufigsten Räume."""
        offer = self._offer(dev)
        counts: dict[str, int] = {}
        for rec in self.st["locs"].values():
            if rec.get("l") and rec["l"] != "off":
                counts[rec["l"]] = counts.get(rec["l"], 0) + 1
        ids = push_rooms([r["id"] for r in offer], self.st["loc"] or self._yesterday(), counts)
        names = {r["id"]: r["name"] for r in offer}
        hum = {r["id"]: r["hum"] for r in offer}
        cur = self.st["loc"]
        msg = f"Gestern: {names.get(cur) or self._name(cur)}" + (f" · Feuchte dort {hum[cur]:.0f} %" if cur in hum and hum[cur] is not None else "") if cur else "Noch kein Standort gewählt."
        data = {"tag": "fh_entfeuchter", "url": f"/{PANEL_URL}?modul=fh", "clickAction": f"/{PANEL_URL}?modul=fh",
                "actions": [{"action": f"{ACT_PREFIX}L_{i}", "title": names[i]} for i in ids]}
        sent = 0
        for svc in targets if targets is not None else dev["ask"]["push"]:
            name = svc.split(".", 1)[1]
            if not self.hass.services.has_service("notify", name):
                continue
            try:
                await self.hass.services.async_call("notify", name, {"title": f"Wo steht der {dev['name']} heute?", "message": msg + " Anderer Raum oder heute aus: im Dashboard.", "data": data}, blocking=False)
                sent += 1
            except Exception as err:  # noqa: BLE001
                _LOGGER.warning("Entfeuchter-Abfrage an %s fehlgeschlagen: %s", svc, err)
        return sent

    def _hist(self, days: int = 14) -> list[dict[str, Any]]:
        out = []
        base = dt_util.now().date()
        for i in range(days):
            d = (base - timedelta(days=i)).isoformat()
            rec = self.st["locs"].get(d)
            out.append({"d": d, "l": rec["l"] if rec else "", "name": self._name(rec["l"]) if rec and rec["l"] else "", "h": rec["h"] if rec else "",
                        "min": round(self.st["run"].get(d, 0.0))})
        return out

    # ---- Bedienung
    def snapshot(self) -> dict[str, Any]:
        dev = self.dev()
        today = dt_util.now().date().isoformat()
        ask = None
        if dev is not None:
            ph = ask_phase(dev["ask"], dt_util.now().strftime("%H:%M"), self.st["conf_day"] == today)
            y = self._yesterday()
            rec = self.st["locs"].get(today) or {}
            ask = {"phase": ph, "conf": self.st["conf_day"] == today, "how": rec.get("h") or "", "yest": y, "yest_name": self._name(y) if y else "",
                   "sent": self.st["sent_day"] == today, "offer": [r["id"] for r in self._offer(dev)]}
        return {"cfg": self.cfg, "loc": self.st["loc"], "off_day": self.st["off_day"], "live": self.live, "rooms": self.rooms(),
                "ask": ask, "hist": self._hist()}

    async def async_set(self, raw: Any) -> dict[str, Any]:
        self.cfg = clean_cfg(raw)
        self._save()
        await self._tick()
        return self.snapshot()

    async def async_cmd(self, cmd: str, arg: str = "") -> dict[str, Any]:
        today = dt_util.now().date().isoformat()
        if cmd == "loc":  # Standort setzen oder bestätigen, gilt für den Tag
            ok = arg == "" or (_LOC.match(arg) and self._room(arg) is not None)
            if ok:
                self.st["loc"] = arg
                self.st["off_day"] = ""
                if arg:
                    self.st["conf_day"] = today
                    self.st["locs"][today] = {"l": arg, "h": "ok"}
        elif cmd == "off_today":  # Antwort „Heute nicht in Betrieb“
            self.st["off_day"], self.st["conf_day"] = today, today
            self.st["locs"][today] = {"l": "off", "h": "ok"}
        elif cmd == "on_today":
            self.st["off_day"] = ""
            if self.st["loc"]:
                self.st["locs"][today] = {"l": self.st["loc"], "h": (self.st["locs"].get(today) or {}).get("h") or "ok"}
        elif cmd == "ask_test":
            dev = self.dev()
            n = await self._send_ask(dev, [arg] if arg else None) if dev else 0
            snap = self.snapshot()
            snap["test_sent"] = n
            return snap
        elif cmd == "tank_empty":
            self.st["tank_h"], self.st["full_ts"] = 0.0, 0.0
        self._save()
        await self._tick()
        return self.snapshot()
