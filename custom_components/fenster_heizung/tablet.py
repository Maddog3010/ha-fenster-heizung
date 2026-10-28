"""Tablet-Modus: Geräteliste, PIN-Schutz und Display-Steuerung per Bewegungsmelder.

Jedes Tablet bekommt im Browser eine zufällige Kennung. Hier liegen pro Tablet der Name, die PIN (nur als Prüfwert) und die
Einstellungen. Der Bewegungsmelder wird hier im Home Assistant überwacht und nicht in der Seite, weil die Seite bei
ausgeschaltetem Display nicht zuverlässig läuft.
"""
from __future__ import annotations

import hashlib
import hmac
import logging
import re
import secrets
import time
from typing import Any

from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers.event import async_call_later, async_track_state_change_event
from homeassistant.helpers.storage import Store

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

ID_RE = re.compile(r"^[a-z0-9]{6,20}$")
PIN_RE = re.compile(r"^\d{6}$")
ENT_RE = re.compile(r"^[a-z_]+\.[a-z0-9_]+$")
SVC_RE = re.compile(r"^[a-z0-9_]{3,64}$")
KINDS = ("", "fully", "app", "browser")
SIZES = ("auto", "large", "xl")
IDLE_HOME = (0, 2, 5, 15)
SLEEP = (0, 5, 15, 30)
OFF_AFTER = (0, 10, 30)
MAX_TABLETS = 20
ITER = 60000
FAILS_MAX = 5
LOCK_S = 60
SEEN_KEEP = 90 * 86400


def default_cfg() -> dict[str, Any]:
    return {
        "size": "auto", "idle_home": 2, "sleep": 15, "wake_warn": True,
        "motion": "", "screen": "", "notify": "", "off_after": 0, "dock_hide": [],
    }


def _pick(v: Any, allowed: tuple, default: Any) -> Any:
    try:
        return v if v in allowed else default
    except TypeError:
        return default


def _ent(v: Any, domains: tuple[str, ...]) -> str:
    return v if isinstance(v, str) and ENT_RE.match(v) and v.split(".")[0] in domains else ""


def clean_cfg(raw: Any) -> dict[str, Any]:
    raw = raw if isinstance(raw, dict) else {}
    d = default_cfg()
    hide = [str(x)[:16] for x in (raw.get("dock_hide") or []) if isinstance(x, str)][:20]
    notify = raw.get("notify")
    return {
        "size": _pick(raw.get("size"), SIZES, d["size"]),
        "idle_home": _pick(raw.get("idle_home"), IDLE_HOME, d["idle_home"]),
        "sleep": _pick(raw.get("sleep"), SLEEP, d["sleep"]),
        "wake_warn": raw.get("wake_warn") is not False,
        "motion": _ent(raw.get("motion"), ("binary_sensor",)),
        "screen": _ent(raw.get("screen"), ("switch",)),
        "notify": notify if isinstance(notify, str) and SVC_RE.match(notify) else "",
        "off_after": _pick(raw.get("off_after"), OFF_AFTER, d["off_after"]),
        "dock_hide": list(dict.fromkeys(hide)),
    }


def hash_pin(pin: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(8)
    h = hashlib.pbkdf2_hmac("sha256", pin.encode(), salt.encode(), ITER).hex()
    return f"{salt}${h}"


def check_pin(pin: str, stored: str) -> bool:
    try:
        salt, _ = stored.split("$", 1)
    except ValueError:
        return False
    return hmac.compare_digest(hash_pin(pin, salt), stored)


class TabletManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = Store(hass, 1, f"{DOMAIN}_tablets")
        self.tablets: dict[str, dict[str, Any]] = {}
        self._fails: dict[str, list[float]] = {}
        self._unsubs: list[CALLBACK_TYPE] = []
        self._off_timers: dict[str, CALLBACK_TYPE] = {}

    async def async_start(self) -> None:
        d = await self._store.async_load()
        if isinstance(d, dict):
            for tid, t in (d.get("tablets") or {}).items():
                if isinstance(t, dict) and ID_RE.match(str(tid)):
                    self.tablets[tid] = {
                        "name": str(t.get("name") or "Tablet")[:24], "pin": str(t.get("pin") or ""),
                        "kind": _pick(t.get("kind"), KINDS, ""), "size": str(t.get("size") or "")[:12],
                        "seen": float(t.get("seen") or 0), "cfg": clean_cfg(t.get("cfg")),
                    }
        self._listen()

    def async_stop(self) -> None:
        self._unlisten()

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"tablets": self.tablets}, 3)

    # ------------------------------------------------------------ Abfragen
    def snapshot(self) -> dict[str, Any]:
        return {"tablets": [
            {"id": tid, "name": t["name"], "has_pin": bool(t["pin"]), "kind": t["kind"], "size": t["size"], "seen": t["seen"], "cfg": t["cfg"]}
            for tid, t in sorted(self.tablets.items(), key=lambda x: x[1]["name"].lower())
        ]}

    def _locked(self, tid: str) -> int:
        now = time.time()
        f = [x for x in self._fails.get(tid, []) if now - x < LOCK_S]
        self._fails[tid] = f
        return int(LOCK_S - (now - f[0])) + 1 if len(f) >= FAILS_MAX else 0

    # ------------------------------------------------------------ Änderungen
    def hello(self, tid: str, name: str, kind: str, size: str) -> dict[str, Any]:
        if not ID_RE.match(tid):
            return {"ok": False, "error": "bad_id"}
        t = self.tablets.get(tid)
        if t is None:
            if len(self.tablets) >= MAX_TABLETS:
                return {"ok": False, "error": "too_many"}
            t = self.tablets[tid] = {"name": (name or "Tablet")[:24], "pin": "", "kind": "", "size": "", "seen": 0.0, "cfg": default_cfg()}
        elif name and name.strip():
            t["name"] = name.strip()[:24] if t["name"] in ("", "Tablet") else t["name"]
        t["kind"] = _pick(kind, KINDS, t["kind"])
        t["size"] = str(size or "")[:12]
        t["seen"] = time.time()
        self._save()
        return {"ok": True}

    def set_name(self, tid: str, name: str) -> bool:
        t = self.tablets.get(tid)
        if t is None or not name.strip():
            return False
        t["name"] = name.strip()[:24]
        self._save()
        return True

    def set_cfg(self, tid: str, raw: Any) -> bool:
        t = self.tablets.get(tid)
        if t is None:
            return False
        t["cfg"] = clean_cfg(raw)
        self._save()
        self._listen()
        return True

    def verify(self, tid: str, pin: str) -> dict[str, Any]:
        t = self.tablets.get(tid)
        if t is None or not t["pin"]:
            return {"ok": False, "error": "no_pin"}
        wait = self._locked(tid)
        if wait:
            return {"ok": False, "error": "locked", "wait": wait}
        if PIN_RE.match(pin or "") and check_pin(pin, t["pin"]):
            self._fails.pop(tid, None)
            return {"ok": True}
        self._fails.setdefault(tid, []).append(time.time())
        left = FAILS_MAX - len(self._fails[tid])
        return {"ok": False, "error": "wrong", "left": max(0, left)}

    def set_pin(self, tid: str, pin: str, old: str | None, admin: bool) -> dict[str, Any]:
        t = self.tablets.get(tid)
        if t is None:
            return {"ok": False, "error": "unknown"}
        if not PIN_RE.match(pin or ""):
            return {"ok": False, "error": "bad_pin"}
        if t["pin"] and not admin:
            r = self.verify(tid, old or "")
            if not r["ok"]:
                return r
        t["pin"] = hash_pin(pin)
        self._save()
        return {"ok": True}

    def reset_pin(self, tid: str) -> bool:
        t = self.tablets.get(tid)
        if t is None:
            return False
        t["pin"] = ""
        self._fails.pop(tid, None)
        self._save()
        return True

    def remove(self, tid: str) -> bool:
        if self.tablets.pop(tid, None) is None:
            return False
        self._save()
        self._listen()
        return True

    # ------------------------------------------------------------ Bewegung und Display
    def _unlisten(self) -> None:
        for u in self._unsubs:
            u()
        self._unsubs = []
        for u in self._off_timers.values():
            u()
        self._off_timers = {}

    def _listen(self) -> None:
        self._unlisten()
        motions: dict[str, list[str]] = {}
        for tid, t in self.tablets.items():
            c = t["cfg"]
            if c["motion"] and (c["screen"] or c["notify"]):
                motions.setdefault(c["motion"], []).append(tid)
        for ent, tids in motions.items():
            self._unsubs.append(async_track_state_change_event(self.hass, [ent], self._motion(tids)))
        if any(t["cfg"]["wake_warn"] and (t["cfg"]["screen"] or t["cfg"]["notify"]) for t in self.tablets.values()):
            alarms = [s.entity_id for s in self.hass.states.async_all("alarm_control_panel")]
            if alarms:
                self._unsubs.append(async_track_state_change_event(self.hass, alarms, self._alarm))

    def _motion(self, tids: list[str]):
        @callback
        def _h(event: Event) -> None:
            new = event.data.get("new_state")
            if new is None:
                return
            for tid in tids:
                t = self.tablets.get(tid)
                if t is None:
                    continue
                if new.state == "on":
                    self._cancel_off(tid)
                    self.hass.async_create_task(self._screen(t, True))
                elif new.state == "off" and t["cfg"]["off_after"]:
                    self._cancel_off(tid)
                    self._off_timers[tid] = async_call_later(self.hass, t["cfg"]["off_after"] * 60, self._off_cb(tid))
        return _h

    def _cancel_off(self, tid: str) -> None:
        u = self._off_timers.pop(tid, None)
        if u:
            u()

    def _off_cb(self, tid: str):
        async def _cb(_now: Any) -> None:
            self._off_timers.pop(tid, None)
            t = self.tablets.get(tid)
            if t is None:
                return
            m = self.hass.states.get(t["cfg"]["motion"])
            if m is not None and m.state == "on":
                return  # inzwischen wieder Bewegung
            await self._screen(t, False)
        return _cb

    @callback
    def _alarm(self, event: Event) -> None:
        new = event.data.get("new_state")
        if new is None or new.state != "triggered":
            return
        for t in self.tablets.values():
            if t["cfg"]["wake_warn"]:
                self.hass.async_create_task(self._screen(t, True))

    async def _screen(self, t: dict[str, Any], on: bool) -> None:
        c = t["cfg"]
        try:
            if c["screen"]:
                cur = self.hass.states.get(c["screen"])
                if cur is not None and cur.state == ("on" if on else "off"):
                    return
                await self.hass.services.async_call("switch", "turn_on" if on else "turn_off", {"entity_id": c["screen"]}, blocking=False)
            elif c["notify"] and on:
                await self.hass.services.async_call("notify", c["notify"], {"message": "command_screen_on"}, blocking=False)
        except Exception as err:  # noqa: BLE001 - Gerät kann fehlen
            _LOGGER.debug("Tablet-Display schalten fehlgeschlagen: %s", err)
