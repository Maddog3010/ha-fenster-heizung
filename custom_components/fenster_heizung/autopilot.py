"""Sponsor Max 3: Haus-Autopilot I (M1, Stufen „nur Vorschläge“ und „mit Bestätigung“) und Heizplan-Assistent (M6).

Autopilot I: einmal pro Stunde ein gemeinsamer Plan für die nächsten 24 Stunden aus Solarprognose (Modul 16 bzw.
Forecast.Solar), Strompreis (Tibber) und dem, was die Module schon wissen. Er schlägt vor:
  dev – Geräte aus Modul 4 im besten Sonnenfenster starten (Bestätigung = Erinnerung über den Meldedienst von Modul 4)
  car – Auto steckt, aber lädt mit Netzstrom: heute nur mit Sonne laden (Bestätigung = Schnellstart „Sonne“ in Modul 8)
  ww  – Sonniger Tag, Warmwasser nutzt den PV-Überschuss nicht (Bestätigung = „PV-Überschuss nutzen“ in Modul 2 ein)
„Nur Vorschläge“ zeigt und meldet nur, „mit Bestätigung“ führt einen Vorschlag erst nach „Ja“ (Lounge oder Handy) aus.
Abwesend und Urlaub haben Vorrang (dann keine Gerätevorschläge). Not-Aus: alles, was der Autopilot angestoßen hat,
wird zurückgenommen und er steht auf „aus“. „Automatisch“ kommt erst mit Max 4.

Heizplan-Assistent: aus der gelernten Aufheizzeit je Raum (Modul 1) Vorschläge für den Heizplan:
  down – früher absenken: Restwärme reicht, spart Heizöl (Ersparnis aus Heizleistung und Brennstoff des Raums)
  up   – früher aufheizen: der Raum braucht länger, als der Plan vorsieht (Komfort)
Ein Tipp übernimmt, „Rückgängig“ stellt den Plan wieder her.
"""
from __future__ import annotations

import logging
import re
import time
from datetime import timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

STAGES = ("off", "suggest", "confirm")
ACT = "FHAP_"                  # Handy-Tasten: FHAP_<Vorschlag>_YES / _NO
_NOTIFY = re.compile(r"^notify\.[a-z0-9_]+$")
SUN_MIN_KWH = 8.0              # ab dieser Tagesprognose gilt ein Tag als sonnig
DOWN_MIN = 30                  # so viel früher absenken
UP_SLACK = 15                  # erst ab 15 Min. fehlender Aufheizzeit vorschlagen


def _n(v: float, d: int = 1) -> str:
    return f"{v:.{d}f}".replace(".", ",")


def _hm(t: str) -> int:
    h, m = t.split(":")
    return int(h) * 60 + int(m)


def _fmt(mins: int) -> str:
    mins %= 1440
    return f"{mins // 60:02d}:{mins % 60:02d}"


DAYS = ("Mo", "Di", "Mi", "Do", "Fr", "Sa", "So")


def days_label(days: list[int]) -> str:
    d = sorted(days)
    if d == [0, 1, 2, 3, 4]:
        return "Mo–Fr"
    if d == [5, 6]:
        return "Sa–So"
    if d == list(range(7)):
        return "täglich"
    return ", ".join(DAYS[x] for x in d)


def clean_cfg(raw: Any) -> dict[str, Any]:
    r = raw if isinstance(raw, dict) else {}
    return {
        "stage": r.get("stage") if r.get("stage") in STAGES else "suggest",
        "notify": list(dict.fromkeys(n for n in (r.get("notify") or []) if isinstance(n, str) and _NOTIFY.match(n)))[:6],
        "parts": {k: (r.get("parts") or {}).get(k) is not False for k in ("dev", "car", "ww")} if isinstance(r.get("parts"), dict) else {"dev": True, "car": True, "ww": True},
    }


def plan_suggestions(entries: list[dict[str, Any]], min_per_k: float, power_kw: float, faktor: float, unit: str, room: str) -> list[dict[str, Any]]:
    """Vorschläge für einen Heizplan aus der gelernten Aufheizzeit (Minuten pro Kelvin)."""
    out: list[dict[str, Any]] = []
    if not entries or min_per_k <= 0:
        return out
    by_day: dict[int, list[dict[str, Any]]] = {}
    for e in entries:
        for d in e["days"]:
            by_day.setdefault(d, []).append(e)
    seen: set[str] = set()
    for e in entries:
        d0 = e["days"][0]
        day = sorted(by_day.get(d0, []), key=lambda x: x["time"])
        i = day.index(e)
        prev = day[i - 1] if i > 0 else (sorted(by_day.get((d0 - 1) % 7, []), key=lambda x: x["time"]) or [None])[-1]
        if prev is None or e["id"] in seen:
            continue
        seen.add(e["id"])
        dk = e["temp"] - prev["temp"]
        lab = days_label(e["days"])
        if dk <= -1 and power_kw > 0:
            # Absenken: Restwärme hält den Raum noch eine Weile, früher absenken spart
            kwh = DOWN_MIN / 60 * power_kw * len(e["days"]) * 0.5  # die Hälfte der Heizleistung wird in der Zeit wirklich gespart
            amt = kwh * faktor
            out.append({"id": f"down:{e['id']}", "kind": "down", "entry": e["id"], "new": _fmt(_hm(e["time"]) - DOWN_MIN),
                        "t": f"{room}: {lab} schon um {_fmt(_hm(e['time']) - DOWN_MIN)} statt {e['time']} auf {_n(e['temp'])} °C absenken – die Restwärme reicht",
                        "save": f"≈ {_n(amt, 1)} {unit} pro Woche" if amt >= 0.1 else ""})
        elif dk >= 1:
            need = dk * min_per_k
            if need > UP_SLACK:
                new = _hm(e["time"]) - int(round(need / 15.0) * 15)
                out.append({"id": f"up:{e['id']}", "kind": "up", "entry": e["id"], "new": _fmt(new),
                            "t": f"{room}: {lab} braucht {round(need)} Min. für +{_n(dk)} K – um {_fmt(new)} statt {e['time']} starten, dann ist es pünktlich warm",
                            "save": "Komfort"})
    return out[:4]


class AutopilotManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_autopilot")
        self.cfg = clean_cfg({})
        self.props: dict[str, dict[str, Any]] = {}
        self.undo: dict[str, dict[str, Any]] = {}  # Heizplan vor dem Übernehmen, je Raum
        self.mine: dict[str, Any] = {"remind": [], "quick": False}
        self.hp_done: list[str] = []  # übernommene oder abgelehnte Heizplan-Vorschläge (Raum:Art:Schaltpunkt), nicht noch einmal vorschlagen
        self._unsubs: list[CALLBACK_TYPE] = []

    async def async_start(self) -> None:
        d = await self._store.async_load() or {}
        self.cfg = clean_cfg(d.get("cfg"))
        self.props = {k: v for k, v in (d.get("props") or {}).items() if isinstance(v, dict)}
        self.undo = {k: v for k, v in (d.get("undo") or {}).items() if isinstance(v, dict)}
        self.mine = d.get("mine") if isinstance(d.get("mine"), dict) else {"remind": [], "quick": False}
        self.hp_done = [str(x) for x in (d.get("hp_done") or [])][-200:]
        self._unsubs.append(async_track_time_interval(self.hass, self._tick, timedelta(minutes=15)))
        self._unsubs.append(self.hass.bus.async_listen("mobile_app_notification_action", self._on_action))

    def async_stop(self) -> None:
        for u in self._unsubs:
            try:
                u()
            except Exception:  # noqa: BLE001
                pass
        self._unsubs.clear()

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"cfg": self.cfg, "props": self.props, "undo": self.undo, "mine": self.mine, "hp_done": self.hp_done[-200:]}, 5)

    def allowed(self) -> bool:
        sm = self.hass.data.get(DOMAIN, {}).get("sponsor")
        try:
            return bool(sm and sm.is_max())
        except Exception:  # noqa: BLE001
            return False

    def _away(self) -> bool:
        pm = self.hass.data.get(DOMAIN, {}).get("presence")
        try:
            return bool(pm and pm.effective() in ("away", "vacation"))
        except Exception:  # noqa: BLE001
            return False

    # ---- Plan
    async def _tick(self, _now: Any) -> None:
        if self.cfg["stage"] == "off" or not self.allowed():
            return
        await self.plan()

    async def plan(self) -> dict[str, dict[str, Any]]:
        D = self.hass.data.get(DOMAIN, {})
        now = dt_util.now()
        today = now.date().isoformat()
        found: dict[str, dict[str, Any]] = {}
        sun_kwh = None
        sm = D.get("solar")
        if sm is not None:
            try:
                from .solar import day_sums
                wh, _s = await sm._wh()  # noqa: SLF001
                sun_kwh = day_sums(wh, now.tzinfo, now.date()) or None
            except Exception:  # noqa: BLE001
                sun_kwh = None
        # Geräte: bestes Sonnenfenster aus Modul 4
        gm = D.get("geraete")
        if self.cfg["parts"]["dev"] and gm is not None and gm.active() and not self._away():
            for d in gm.snapshot().get("devices", []):
                b = d.get("best")
                if not b or d.get("running"):
                    continue
                at = dt_util.as_local(dt_util.utc_from_timestamp(b["ts"]))
                if at.date() != now.date() or at < now:
                    continue
                k = f"dev:{d['id']}:{today}"
                found[k] = {"id": k, "kind": "dev", "dev": d["id"], "at": b["ts"],
                            "t": f"{d['name']} um {at:%H:%M} starten – dann deckt die Sonne ca. {b.get('pct', 0)} %", "act": "Erinnerung um " + at.strftime("%H:%M")}
        # Auto: steckt und lädt mit Netz, obwohl heute viel Sonne kommt
        wb = D.get("wallbox")
        if self.cfg["parts"]["car"] and wb is not None and wb.cfg.get("enabled") and sun_kwh and sun_kwh >= SUN_MIN_KWH and now.hour < 14:
            info = wb.info or {}
            mode = (wb.cfg or {}).get("mode")
            if info.get("car") not in (None, 1) and mode in ("now", "minpv") and not getattr(wb, "_quick", None):
                k = f"car:{today}"
                found[k] = {"id": k, "kind": "car", "t": f"Heute kommen ca. {_n(sun_kwh)} kWh Sonne: Auto nur mit Sonne laden statt mit Netzstrom", "act": "Schnellstart „heute nur Sonne“"}
        # Warmwasser: sonniger Tag, PV-Überschuss in Modul 2 aus
        wm = D.get("wasser")
        if self.cfg["parts"]["ww"] and wm is not None and sun_kwh and sun_kwh >= SUN_MIN_KWH:
            ww = wm.cfg or {}
            if (ww.get("ent") or {}).get("rod") and not (ww.get("pv") or {}).get("on") and (wm.modules.get("on") or {}).get("ww"):
                k = "ww:pv"
                found[k] = {"id": k, "kind": "ww", "t": f"Heute ca. {_n(sun_kwh)} kWh Sonne: Warmwasser mit dem PV-Überschuss laden (Heizstab)", "act": "„PV-Überschuss nutzen“ in Modul 2 einschalten"}
        # Zustand übernehmen, Altes vom Vortag verwerfen
        out: dict[str, dict[str, Any]] = {}
        for k, p in found.items():
            old = self.props.get(k) or {}
            p["state"] = old.get("state", "new")
            p["ts"] = old.get("ts", time.time())
            out[k] = p
        for k, p in self.props.items():  # erledigte von heute bleiben sichtbar
            if k not in out and p.get("state") in ("done", "no") and (k.endswith(today) or k == "ww:pv"):
                out[k] = p
        newk = [k for k in out if k not in self.props and out[k]["state"] == "new"]
        self.props = out
        self._save()
        if newk and self.cfg["stage"] != "off":
            await self._push([out[k] for k in newk])
        return out

    async def _push(self, items: list[dict[str, Any]]) -> None:
        for p in items:
            data: dict[str, Any] = {"tag": f"fh_ap_{p['id']}"}
            if self.cfg["stage"] == "confirm":
                data["actions"] = [{"action": f"{ACT}{p['id']}_YES", "title": "Ja, machen"}, {"action": f"{ACT}{p['id']}_NO", "title": "Nein"}]
            for svc in self.cfg["notify"]:
                dom, name = svc.split(".", 1)
                if self.hass.services.has_service(dom, name):
                    try:
                        await self.hass.services.async_call(dom, name, {"title": "🤖 Autopilot", "message": p["t"] + (f"\n→ {p['act']}" if self.cfg["stage"] == "confirm" else ""), "data": data}, blocking=False)
                    except Exception as err:  # noqa: BLE001
                        _LOGGER.warning("Autopilot-Meldung über %s fehlgeschlagen: %s", svc, err)

    async def _on_action(self, event) -> None:
        a = str((event.data or {}).get("action") or "")
        if not a.startswith(ACT):
            return
        body = a[len(ACT):]
        pid, _, ans = body.rpartition("_")
        if pid in self.props:
            await self.answer(pid, ans == "YES")

    async def answer(self, pid: str, yes: bool) -> dict[str, Any]:
        p = self.props.get(pid)
        if not p or p.get("state") != "new":
            return self.snapshot()
        if not yes:
            p["state"] = "no"
        elif self.cfg["stage"] != "confirm" or not self.allowed():
            p["state"] = "seen"
        else:
            ok = await self._do(p)
            p["state"] = "done" if ok else "fail"
        self._save()
        return self.snapshot()

    async def _do(self, p: dict[str, Any]) -> bool:
        D = self.hass.data.get(DOMAIN, {})
        try:
            if p["kind"] == "dev":
                gm = D.get("geraete")
                r = gm.set_remind(p["dev"], True) if gm is not None else {"ok": False}
                if r.get("ok"):
                    self.mine["remind"] = list(dict.fromkeys([*self.mine.get("remind", []), p["dev"]]))
                return bool(r.get("ok"))
            if p["kind"] == "car":
                wb = D.get("wallbox")
                if wb is None:
                    return False
                await wb.async_quick("sun")
                self.mine["quick"] = True
                return True
            if p["kind"] == "ww":
                wm = D.get("wasser")
                if wm is None:
                    return False
                cfg = dict(wm.cfg)
                cfg["pv"] = {**(cfg.get("pv") or {}), "on": True}
                await wm.async_set_cfg(cfg)
                return True
        except Exception:  # noqa: BLE001
            _LOGGER.exception("Autopilot: Vorschlag %s nicht ausgeführt", p.get("id"))
        return False

    async def stop_all(self) -> dict[str, Any]:
        """Not-Aus: alles zurücknehmen, was der Autopilot angestoßen hat, und ausschalten."""
        D = self.hass.data.get(DOMAIN, {})
        gm, wb = D.get("geraete"), D.get("wallbox")
        for did in self.mine.get("remind", []):
            try:
                if gm is not None:
                    gm.set_remind(did, False)
            except Exception:  # noqa: BLE001
                pass
        if self.mine.get("quick") and wb is not None and getattr(wb, "_quick", None):
            try:
                await wb.async_quick("")
            except Exception:  # noqa: BLE001
                pass
        self.mine = {"remind": [], "quick": False}
        self.cfg["stage"] = "off"
        for p in self.props.values():
            if p.get("state") == "new":
                p["state"] = "no"
        self._save()
        return self.snapshot()

    async def async_set(self, raw: Any) -> dict[str, Any]:
        r = raw if isinstance(raw, dict) else {}
        self.cfg = clean_cfg({**self.cfg, **r})
        self._save()
        if self.cfg["stage"] != "off" and self.allowed():
            await self.plan()
        return self.snapshot()

    # ---- Heizplan-Assistent
    def heat_suggestions(self) -> list[dict[str, Any]]:
        out = []
        for entry in self.hass.config_entries.async_entries(DOMAIN):
            ctrl = getattr(entry, "runtime_data", None)
            if ctrl is None or entry.state is not ConfigEntryState.LOADED:
                continue
            try:
                info = ctrl.learning_info()
                plan = ctrl.plan_dict()
                if not info or not plan.get("enabled") or not plan.get("entries"):
                    continue
                fi = ctrl.fuel_info()
                for s in plan_suggestions(plan["entries"], 60 / info["rate"] if info.get("rate") else 0, ctrl.room_power_kw(), fi["faktor"], fi["einheit"], entry.title):
                    if f"{entry.entry_id}:{s['id']}" in self.hp_done:
                        continue
                    out.append({**s, "room": entry.entry_id, "name": entry.title, "id": f"{entry.entry_id}:{s['id']}"})
            except Exception:  # noqa: BLE001
                _LOGGER.debug("Heizplan-Assistent: Raum %s übersprungen", entry.title, exc_info=True)
        return out

    async def heat_apply(self, sid: str) -> dict[str, Any]:
        s = next((x for x in self.heat_suggestions() if x["id"] == sid), None)
        if s is None:
            return {"ok": False, "msg": "Vorschlag gibt es nicht mehr"}
        entry = self.hass.config_entries.async_get_entry(s["room"])
        ctrl = getattr(entry, "runtime_data", None) if entry else None
        if ctrl is None:
            return {"ok": False, "msg": "Raum nicht gefunden"}
        plan = ctrl.plan_dict()
        self.undo[s["room"]] = {"plan": plan, "ts": time.time(), "t": s["t"], "sid": sid}
        self.hp_done.append(sid)
        entries = [dict(e, time=s["new"]) if e["id"] == s["entry"] else e for e in plan["entries"]]
        await ctrl.async_set_plan(plan["enabled"], entries, plan.get("mode"))
        self._save()
        return {"ok": True}

    def heat_dismiss(self, sid: str) -> None:
        self.hp_done.append(sid)
        self._save()

    async def heat_undo(self, room: str) -> dict[str, Any]:
        u = self.undo.pop(room, None)
        if u and u.get("sid") in self.hp_done:
            self.hp_done.remove(u["sid"])
        entry = self.hass.config_entries.async_get_entry(room)
        ctrl = getattr(entry, "runtime_data", None) if entry else None
        if not u or ctrl is None:
            return {"ok": False, "msg": "Nichts zum Zurücknehmen"}
        await ctrl.async_set_plan(u["plan"]["enabled"], u["plan"]["entries"], u["plan"].get("mode"))
        self._save()
        return {"ok": True}

    def snapshot(self) -> dict[str, Any]:
        ok = self.allowed()
        return {"cfg": self.cfg, "allowed": ok, "props": sorted(self.props.values(), key=lambda p: p.get("at") or 0) if ok else [],
                "heat": self.heat_suggestions() if ok else [],
                "undo": [{"room": k, "t": v.get("t"), "ts": v.get("ts")} for k, v in self.undo.items()] if ok else []}
