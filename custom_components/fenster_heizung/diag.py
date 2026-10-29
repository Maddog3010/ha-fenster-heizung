"""Gerätediagnose: Fehlerprotokoll, Ventilprüfung und Hinweise bei Problemen (2.8.0)."""
from __future__ import annotations

import logging
from collections import deque
from datetime import timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
    async_track_time_interval,
)
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import CONF_HUMIDITY, CONF_ROOM_TEMP, CONF_OUTDOOR_SENSOR, CONF_THERMOSTATS, CONF_WINDOWS, DOMAIN

_LOGGER = logging.getLogger(__name__)

MAX_LOG = 200
VERIFY_AFTER = 120  # Sekunden, bis geprüft wird, ob ein Ventil den Befehl übernommen hat
TEMP_TOLERANCE = 0.6
NOTIFY_EVERY = 24 * 3600
_BAD = ("unavailable",)


def _num(val: Any) -> float | None:
    try:
        return float(str(val).replace(",", "."))
    except (TypeError, ValueError):
        return None


def diag_log(hass: HomeAssistant, level: str, msg: str, entity: str | None = None, room: str | None = None) -> None:
    """Meldung ins Fehlerprotokoll schreiben (sicher aufrufbar, auch ohne Manager)."""
    mgr = hass.data.get(DOMAIN, {}).get("diag")
    if mgr is not None:
        mgr.log(level, msg, entity=entity, room=room)


def diag_expect(hass: HomeAssistant, entity: str, **expect: Any) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("diag")
    if mgr is not None:
        mgr.expect(entity, **expect)


class DiagManager:
    """Hält Protokoll und Ventilprüfung. Alles bleibt über Neustarts erhalten."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_diag")
        self._log: deque[dict[str, Any]] = deque(maxlen=MAX_LOG)
        self._valves: dict[str, dict[str, Any]] = {}
        self._sent: dict[str, float] = {}
        self._unsub_tick: CALLBACK_TYPE | None = None
        self._unsub_state: CALLBACK_TYPE | None = None
        self._watched: tuple[str, ...] = ()
        self._timers: dict[str, CALLBACK_TYPE] = {}

    # --- Lebenszyklus ------------------------------------------------------
    async def async_start(self) -> None:
        saved = await self._store.async_load() or {}
        for e in saved.get("log") or []:
            if isinstance(e, dict) and e.get("msg") and e.get("t"):
                self._log.append({"t": str(e["t"]), "level": e.get("level") if e.get("level") in ("error", "warning", "info") else "warning", "room": e.get("room") or "", "msg": str(e["msg"])[:300]})
        for k, v in (saved.get("sent") or {}).items():
            if isinstance(v, (int, float)):
                self._sent[k] = float(v)
        self._unsub_tick = async_track_time_interval(self.hass, self._tick, timedelta(minutes=5))
        self._watch()

    def async_stop(self) -> None:
        for unsub in (self._unsub_tick, self._unsub_state):
            if unsub:
                unsub()
        self._unsub_tick = self._unsub_state = None
        for cancel in self._timers.values():
            cancel()
        self._timers.clear()

    def _save(self) -> None:
        self._store.async_delay_save(
            lambda: {"log": list(self._log), "sent": {k: v for k, v in self._sent.items() if v > dt_util.utcnow().timestamp() - 7 * 86400}}, 10
        )

    # --- Protokoll ---------------------------------------------------------
    def room_of(self, entity: str | None) -> str:
        if not entity:
            return ""
        for entry in self.hass.config_entries.async_entries(DOMAIN):
            cfg = {**entry.data, **entry.options}
            used = [*(cfg.get(CONF_WINDOWS) or []), *(cfg.get(CONF_THERMOSTATS) or []), cfg.get(CONF_HUMIDITY), cfg.get(CONF_ROOM_TEMP), cfg.get("htr_entity")]
            if entity in used:
                return entry.title
        return ""

    def log(self, level: str, msg: str, entity: str | None = None, room: str | None = None) -> None:
        room = room or self.room_of(entity)
        if self._log and self._log[-1]["msg"] == msg and self._log[-1]["room"] == room:
            last = dt_util.parse_datetime(self._log[-1]["t"])
            if last and (dt_util.utcnow() - last).total_seconds() < 60:
                return
        self._log.append({"t": dt_util.utcnow().isoformat(), "level": level, "room": room, "msg": msg[:300]})
        self._save()

    def clear(self) -> None:
        self._log.clear()
        self._save()

    # --- Ventilprüfung -----------------------------------------------------
    def expect(self, entity: str, temperature: Any = None, hvac_mode: str | None = None) -> None:
        """Ein Befehl wurde gesendet: kurz danach prüfen, ob das Gerät ihn übernommen hat."""
        v = self._valves.setdefault(entity, {"entity": entity})
        v["room"] = self.room_of(entity)
        v["cmd_at"] = dt_util.utcnow().isoformat()
        v["expect"] = _num(temperature) if temperature is not None else v.get("expect")
        v["mode"] = hvac_mode
        v["ok"] = None
        if (cancel := self._timers.pop(entity, None)) is not None:
            cancel()

        @callback
        def _check(_now: Any) -> None:
            self._timers.pop(entity, None)
            self._verify(entity)

        self._timers[entity] = async_call_later(self.hass, VERIFY_AFTER, _check)

    def _verify(self, entity: str) -> None:
        v = self._valves.get(entity)
        st = self.hass.states.get(entity)
        if v is None or st is None or st.state in _BAD:
            return
        ok = True
        if v.get("mode") and st.state != v["mode"]:
            ok = False
            v["actual"] = _num(st.attributes.get("temperature"))
        if v.get("expect") is not None:
            act = _num(st.attributes.get("temperature"))
            v["actual"] = act
            if act is None or abs(act - v["expect"]) > TEMP_TOLERANCE:
                ok = False
        v["ok"] = ok
        if not ok:
            name = st.attributes.get("friendly_name") or entity
            self.log("warning", f"{name} reagiert nicht: Ziel {v.get('expect')} gesendet, Gerät meldet {v.get('actual')}", entity=entity)

    # --- Zustandsänderungen überwachen --------------------------------------
    def _monitored(self) -> list[str]:
        out: list[str] = []
        for entry in self.hass.config_entries.async_entries(DOMAIN):
            if entry.state is not ConfigEntryState.LOADED:
                continue
            cfg = {**entry.data, **entry.options}
            out += [*(cfg.get(CONF_WINDOWS) or []), *(cfg.get(CONF_THERMOSTATS) or [])]
            out += [e for e in (cfg.get(CONF_HUMIDITY), cfg.get(CONF_ROOM_TEMP), cfg.get("htr_entity"), cfg.get(CONF_OUTDOOR_SENSOR)) if e]
        return sorted(set(out))

    def _watch(self) -> None:
        ents = tuple(self._monitored())
        if ents == self._watched:
            return
        if self._unsub_state:
            self._unsub_state()
            self._unsub_state = None
        self._watched = ents
        if ents:
            self._unsub_state = async_track_state_change_event(self.hass, list(ents), self._state_changed)

    @callback
    def _state_changed(self, event: Event) -> None:
        new, old = event.data.get("new_state"), event.data.get("old_state")
        if new is None or old is None:
            return
        if new.state in _BAD and old.state not in _BAD:
            name = new.attributes.get("friendly_name") or new.entity_id
            self.log("warning", f"{name} ist nicht erreichbar", entity=new.entity_id)

    # --- Hinweise bei Problemen ----------------------------------------------
    def _cfg(self) -> dict[str, Any]:
        gen = self.hass.data.get(DOMAIN, {}).get("general")
        return (gen.data.get("valve") if gen is not None else None) or {"warn": 20, "days": 7, "notify": "", "batsrc": {}}

    def battery(self, entity: str) -> dict[str, Any] | None:
        """Batteriezustand: Prozent oder 'low' (Binärsensor). Eigene Quelle hat Vorrang."""
        cfg = self._cfg()
        st = self.hass.states
        ov = (cfg.get("batsrc") or {}).get(entity)
        if ov:
            if ov.get("src") == "none":
                return None
            bs = st.get(ov["src"])
            if bs is None or bs.state in ("unavailable", "unknown"):
                return {"unknown": True}
            if ov["src"].startswith("binary_sensor."):
                return {"low": (bs.state == "on") != bool(ov.get("inv"))}
            n = _num(bs.state)
            return {"pct": n} if n is not None else {"unknown": True}
        s = st.get(entity)
        if s is None:
            return None
        for k in ("battery_level", "battery"):
            n = _num(s.attributes.get(k))
            if n is not None:
                return {"pct": n}
        if s.attributes.get("battery_low") is True:
            return {"low": True}
        reg = er.async_get(self.hass)
        ent = reg.async_get(entity)
        if ent is None or not ent.device_id:
            return None
        for e in er.async_entries_for_device(reg, ent.device_id):
            bs = st.get(e.entity_id)
            if bs is None or bs.attributes.get("device_class") != "battery":
                continue
            if e.entity_id.startswith("sensor.") and (n := _num(bs.state)) is not None:
                return {"pct": n}
            if e.entity_id.startswith("binary_sensor."):
                return {"low": bs.state == "on"}
        return None

    def problems(self) -> list[tuple[str, str, str]]:
        """(Schlüssel, Raum, Text) aller aktuellen Probleme von Ventilen und Fensterkontakten."""
        cfg, out, now = self._cfg(), [], dt_util.utcnow()
        warn = float(cfg.get("warn", 20))
        for entry in self.hass.config_entries.async_entries(DOMAIN):
            if entry.state is not ConfigEntryState.LOADED:
                continue
            conf = {**entry.data, **entry.options}
            for kind, ents in (("Ventil", conf.get(CONF_THERMOSTATS) or []), ("Fensterkontakt", conf.get(CONF_WINDOWS) or [])):
                for e in ents:
                    s = self.hass.states.get(e)
                    name = (s.attributes.get("friendly_name") if s else None) or e
                    lab = f"{kind} {name} ({entry.title})"
                    if s is None:
                        out.append((f"{e}:gone", entry.title, f"{lab}: Entität existiert nicht mehr"))
                        continue
                    if s.state in _BAD:
                        out.append((f"{e}:off", entry.title, f"{lab}: nicht erreichbar"))
                    elif kind == "Ventil" and (self._valves.get(e) or {}).get("ok") is False:
                        out.append((f"{e}:react", entry.title, f"{lab}: reagiert nicht auf Befehle"))
                    elif kind == "Fensterkontakt" and s.state != "on" and (now - s.last_changed).days >= int(cfg.get("days", 7)):
                        out.append((f"{e}:stale", entry.title, f"{lab}: seit {(now - s.last_changed).days} Tagen unverändert"))
                    b = self.battery(e)
                    if b:
                        if b.get("low") or (b.get("pct") is not None and b["pct"] <= 10):
                            out.append((f"{e}:bat", entry.title, f"{lab}: Batterie leer"))
                        elif b.get("pct") is not None and b["pct"] <= warn:
                            out.append((f"{e}:batw", entry.title, f"{lab}: Batterie schwach ({round(b['pct'])} %)"))
        return out

    async def _tick(self, _now: Any) -> None:
        self._watch()
        svc = str(self._cfg().get("notify") or "")
        probs = self.problems()
        ts = dt_util.utcnow().timestamp()
        keys = {k for k, _, _ in probs}
        for k in [k for k in self._sent if k not in keys]:
            del self._sent[k]  # gelöst: beim nächsten Auftreten wieder melden
        if not svc:
            return
        domain, _, name = svc.partition(".")
        if not name or not self.hass.services.has_service(domain, name):
            self.log("warning", f"Benachrichtigungsdienst {svc} nicht gefunden")
            return
        new = [(k, r, t) for k, r, t in probs if ts - self._sent.get(k, 0) >= NOTIFY_EVERY]
        if not new:
            return
        try:
            await self.hass.services.async_call(domain, name, {"title": "Strom & Wärme: Geräteproblem", "message": "\n".join(t for _, _, t in new)}, blocking=True)
        except Exception as err:  # noqa: BLE001
            self.log("error", f"Benachrichtigung über {svc} fehlgeschlagen: {err}")
            return
        for k, _, t in new:
            self._sent[k] = ts
            self.log("info", f"Benachrichtigt: {t}")
        self._save()

    # --- Abfrage -------------------------------------------------------------
    def snapshot(self) -> dict[str, Any]:
        devices: list[dict[str, str]] = []
        notify: list[dict[str, str]] = []
        for entry in self.hass.config_entries.async_entries(DOMAIN):
            if entry.state is not ConfigEntryState.LOADED:
                continue
            cfg = {**entry.data, **entry.options}
            room = entry.title

            def add(role: str, ent: str | None) -> None:
                if ent:
                    devices.append({"room": room, "entry_id": entry.entry_id, "role": role, "entity": ent})

            for e in cfg.get(CONF_WINDOWS) or []:
                add("window", e)
            for e in cfg.get(CONF_THERMOSTATS) or []:
                add("thermo", e)
            add("hum", cfg.get(CONF_HUMIDITY))
            add("rtemp", cfg.get(CONF_ROOM_TEMP))
            if cfg.get("htr_on") == "on":
                add("heater", cfg.get("htr_entity"))
            for s in cfg.get("notify_service") or []:
                notify.append({"room": room, "service": s if "." in s else f"notify.{s}"})
        gen = self.hass.data.get(DOMAIN, {}).get("general")
        g = gen.data if gen is not None else {}
        pv = g.get("pv") or {}
        for role, key in (("pv", "sensor"), ("soc", "soc_sensor"), ("price", "price_sensor"), ("feed", "feed_sensor")):
            if pv.get(key) and (role in ("pv", "soc") or pv.get(f"{role}_mode") == "entity"):
                devices.append({"room": "", "entry_id": "", "role": role, "entity": pv[key]})
        if (g.get("valve") or {}).get("notify"):
            notify.append({"room": "", "service": g["valve"]["notify"]})
        seen: set[str] = set()
        uniq = [d for d in devices if not (d["entity"] + d["role"] in seen or seen.add(d["entity"] + d["role"]))]
        return {"devices": uniq, "notify": notify, "valves": list(self._valves.values()), "log": list(reversed(self._log))}
