"""Modul 11: Rauch- & Sicherheitsmelder – Alarme, Batterie, Erreichbarkeit, Prüf-Erinnerung, Aktionen und Meldungen.

Das Modul liest vorhandene Melder aus Home Assistant (Geräteklasse Rauch, CO, Gas, Wasser, Hitze, Sicherheit),
zum Beispiel von X-Sense, Zigbee, Z-Wave oder Homematic. Es ersetzt keine zertifizierte Alarmanlage.
"""
from __future__ import annotations

import logging
import re
import time
from datetime import timedelta
from typing import Any

from homeassistant.const import EVENT_STATE_CHANGED
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

TICK_SECONDS = 30
# Geräteklasse -> (Schlüssel, Name)
CLASSES = {
    "smoke": ("smoke", "Rauchmelder"),
    "carbon_monoxide": ("co", "CO-Melder"),
    "gas": ("gas", "Gasmelder"),
    "moisture": ("water", "Wassermelder"),
    "heat": ("heat", "Hitzemelder"),
    "safety": ("safety", "Sicherheitsmelder"),
}
KINDS = tuple(v[0] for v in CLASSES.values())
KIND_NAMES = {v[0]: v[1] for v in CLASSES.values()}
BAT_NOTE_GAP_S = 7 * 86400
OFF_NOTE_GAP_S = 86400
TEST_NOTE_GAP_S = 7 * 86400
MAX_ACTS = 12
MAX_LOG = 40
MAX_EXCL = 60
_ENT = re.compile(r"^[a-z_]+\.[a-z0-9_]+$")
OFF_STATES = ("unavailable", "unknown")


def default_cfg() -> dict[str, Any]:
    return {
        "kinds": list(KINDS), "excl": [], "repeat": 10,
        "bat": {"on": True, "pct": 20}, "off": {"on": True, "min": 60}, "test": {"on": True, "months": 6},
        "acts": [], "notify": {"alarm": True, "end": False, "bat": True, "off": True, "test": True, "to": []},
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
    return ("open", "close") if d == "cover" else ("run",) if d in ("script", "scene") else ("on", "off")


def action_service(ent: str, do: str) -> tuple[str, str]:
    d = ent.split(".")[0]
    if d == "cover":
        return "cover", "open_cover" if do == "open" else "close_cover"
    if d in ("script", "scene"):
        return d, "turn_on"
    return d, "turn_on" if do == "on" else "turn_off"


def clean_cfg(raw: Any) -> dict[str, Any]:
    d = default_cfg()
    r = raw if isinstance(raw, dict) else {}
    if isinstance(r.get("kinds"), list):
        d["kinds"] = [k for k in KINDS if k in r["kinds"]]
    ex = []
    for e in r.get("excl") if isinstance(r.get("excl"), list) else []:
        e = _ent(e, ("binary_sensor",))
        if e and e not in ex and len(ex) < MAX_EXCL:
            ex.append(e)
    d["excl"] = ex
    d["repeat"] = int(_num(r.get("repeat"), 0, 60, 10))
    b = r.get("bat") if isinstance(r.get("bat"), dict) else {}
    d["bat"] = {"on": bool(b.get("on", True)), "pct": int(round(_num(b.get("pct"), 5, 50, 20) / 5) * 5)}
    o = r.get("off") if isinstance(r.get("off"), dict) else {}
    d["off"] = {"on": bool(o.get("on", True)), "min": int(_num(o.get("min"), 15, 1440, 60))}
    t = r.get("test") if isinstance(r.get("test"), dict) else {}
    m = int(_num(t.get("months"), 1, 12, 6))
    d["test"] = {"on": bool(t.get("on", True)), "months": min((1, 3, 6, 12), key=lambda x: abs(x - m))}
    acts, seen = [], set()
    for x in r.get("acts") if isinstance(r.get("acts"), list) else []:
        if not isinstance(x, dict) or len(acts) >= MAX_ACTS:
            continue
        ent, aid = _ent(x.get("ent"), ("cover", "switch", "input_boolean", "light", "script", "scene")), str(x.get("id") or "")[:20]
        kind = x.get("kind") if x.get("kind") in KINDS or x.get("kind") == "any" else ""
        if not ent or not kind or not re.match(r"^[a-z0-9_]+$", aid) or aid in seen:
            continue
        seen.add(aid)
        do = x.get("do") if x.get("do") in do_options(ent) else do_options(ent)[0]
        acts.append({"id": aid, "kind": kind, "ent": ent, "do": do})
    d["acts"] = acts
    n = r.get("notify") if isinstance(r.get("notify"), dict) else {}
    to = []
    for s in n.get("to") if isinstance(n.get("to"), list) else []:
        s = _ent(s, ("notify",))
        if s and s not in to and len(to) < 10:
            to.append(s)
    d["notify"] = {k: bool(n.get(k, d["notify"][k])) for k in ("alarm", "end", "bat", "off", "test")}
    d["notify"]["to"] = to
    return d


def kind_of(device_class: Any) -> tuple[str, str] | None:
    return CLASSES.get(device_class) if isinstance(device_class, str) else None


def battery_of(attrs: dict[str, Any], sibling: Any = None) -> float | None:
    """Batterie in Prozent: aus Attribut oder aus dem Batterie-Sensor desselben Geräts."""
    for v in (attrs.get("battery_level"), attrs.get("battery"), sibling):
        try:
            x = float(str(v).replace(",", "."))
        except (TypeError, ValueError):
            continue
        if x == x and 0 <= x <= 100:
            return x
    return None


def months_since(iso: str | None, now: Any) -> float | None:
    if not iso:
        return None
    t = dt_util.parse_datetime(iso)
    if t is None:
        return None
    return max(0.0, (now - t).total_seconds() / (30.44 * 86400))


class SicherheitManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = Store(hass, 1, f"{DOMAIN}_sicherheit")
        self.cfg = default_cfg()
        self.st: dict[str, dict[str, Any]] = {}  # je Melder: a (Alarm), since, off_since, rep
        self.last_test = ""
        self.first_seen = ""
        self.log: list[dict[str, str]] = []
        self._notes: dict[str, float] = {}
        self._unsub: CALLBACK_TYPE | None = None
        self._unsub_ev: CALLBACK_TYPE | None = None
        self._busy = False

    # ---- Start/Stop
    async def async_start(self) -> None:
        d = await self._store.async_load()
        if isinstance(d, dict):
            self.cfg = clean_cfg(d.get("cfg"))
            self.last_test = str(d.get("last_test") or "")
            self.first_seen = str(d.get("first_seen") or "")
            for k, v in (d.get("st") if isinstance(d.get("st"), dict) else {}).items():
                if isinstance(v, dict):
                    self.st[str(k)] = {"a": bool(v.get("a")), "since": str(v.get("since") or ""), "off_since": 0.0, "rep": 0.0}
            self.log = [x for x in (d.get("log") or []) if isinstance(x, dict) and "t" in x and "x" in x][:MAX_LOG]
            self._notes = {str(k): float(v) for k, v in (d.get("notes") or {}).items() if isinstance(v, (int, float))}
        self._unsub = async_track_time_interval(self.hass, self._tick, timedelta(seconds=TICK_SECONDS))
        self._unsub_ev = self.hass.bus.async_listen(EVENT_STATE_CHANGED, self._on_state)
        self.hass.async_create_task(self._tick(None))

    def async_stop(self) -> None:
        for u in (self._unsub, self._unsub_ev):
            if u:
                u()
        self._unsub = self._unsub_ev = None

    def _save(self) -> None:
        self._store.async_delay_save(
            lambda: {
                "cfg": self.cfg, "last_test": self.last_test, "first_seen": self.first_seen,
                "st": {k: {"a": v["a"], "since": v["since"]} for k, v in self.st.items()}, "log": self.log, "notes": self._notes,
            }, 10,
        )

    def _add(self, text: str) -> None:
        self.log.insert(0, {"t": dt_util.now().isoformat(), "x": text})
        del self.log[MAX_LOG:]

    def active(self) -> bool:
        wm = self.hass.data.get(DOMAIN, {}).get("wasser")
        return bool(wm is not None and wm.modules.get("on", {}).get("sf"))

    @callback
    def _on_state(self, event: Event) -> None:
        """Ein Melder geht auf „an“: sofort prüfen statt bis zum nächsten Takt zu warten."""
        eid = event.data.get("entity_id") or ""
        new = event.data.get("new_state")
        if not eid.startswith("binary_sensor.") or new is None or new.state != "on" or not self.active():
            return
        if kind_of(new.attributes.get("device_class")) is None:
            return
        self.hass.async_create_task(self._tick(None))

    # ---- Melder lesen
    def detectors(self) -> list[dict[str, Any]]:
        reg = er.async_get(self.hass)
        devs = dr.async_get(self.hass)
        areas = ar.async_get(self.hass)
        bat_by_dev: dict[str, str] = {}
        btn_by_dev: dict[str, str] = {}
        for e in reg.entities.values():
            if not e.device_id or e.disabled_by:
                continue
            if e.domain == "sensor" and (e.device_class or e.original_device_class) == "battery":
                bat_by_dev.setdefault(e.device_id, e.entity_id)
            elif e.domain == "button" and "test" in e.entity_id:
                btn_by_dev.setdefault(e.device_id, e.entity_id)
        out = []
        for s in self.hass.states.async_all("binary_sensor"):
            k = kind_of(s.attributes.get("device_class"))
            if k is None or k[0] not in self.cfg["kinds"] or s.entity_id in self.cfg["excl"]:
                continue
            ent = reg.async_get(s.entity_id)
            did = ent.device_id if ent else None
            dev = devs.async_get(did) if did else None
            aid = (ent.area_id if ent and ent.area_id else (dev.area_id if dev else None))
            area = areas.async_get_area(aid).name if aid and areas.async_get_area(aid) else ""
            sib = self.hass.states.get(bat_by_dev[did]) if did in bat_by_dev else None
            bat = battery_of(s.attributes or {}, sib.state if sib is not None else None)
            out.append({
                "id": s.entity_id, "name": s.attributes.get("friendly_name") or s.entity_id, "k": k[0], "kind": k[1], "area": area,
                "src": ent.platform if ent else "", "alarm": s.state == "on", "off": s.state in OFF_STATES, "bat": bat,
                "test": btn_by_dev.get(did, "") if did else "",
            })
        out.sort(key=lambda x: (not x["alarm"], x["name"].lower()))
        return out

    # ---- Meldungen und Aktionen
    async def _notify(self, kind: str, title: str, msg: str, gap_key: str = "", gap: float = 0) -> int:
        n = self.cfg["notify"]
        if kind and not n.get(kind):
            return 0
        if gap_key:
            if time.time() - self._notes.get(gap_key, 0) < gap:
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
            except Exception as err:  # Dienst fehlerhaft: nie die Überwachung stören
                _LOGGER.debug("Benachrichtigung %s: %s", svc, err)
        return sent

    async def async_test(self) -> dict[str, Any]:
        return {"sent": await self._notify("", "Rauch- und Sicherheitsmelder", "Testmeldung von Modul 11. Die Benachrichtigung funktioniert.")}

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

    async def _run_acts(self, kind: str) -> int:
        n = 0
        for a in self.cfg["acts"]:
            if a["kind"] in (kind, "any") and await self._call(a["ent"], a["do"]):
                n += 1
        return n

    async def async_press_test(self, det_id: str) -> dict[str, Any]:
        """Testknopf des Melders drücken (zum Beispiel X-Sense), sofern das Gerät einen hat."""
        for d in self.detectors():
            if d["id"] == det_id and d["test"]:
                ok = await self._call_press(d["test"])
                if ok:
                    self._add(f"Test ausgelöst: {d['name']}.")
                    self._save()
                return {"ok": ok}
        return {"ok": False}

    async def _call_press(self, ent: str) -> bool:
        if self.hass.states.get(ent) is None:
            return False
        try:
            await self.hass.services.async_call("button", "press", {"entity_id": ent}, blocking=False)
            return True
        except Exception as err:
            _LOGGER.debug("Testknopf %s: %s", ent, err)
            return False

    # ---- Hauptschleife
    async def _tick(self, _now: Any) -> None:
        if not self.active() or self._busy:
            return
        self._busy = True
        try:
            await self._check()
        finally:
            self._busy = False

    async def _check(self) -> None:
        now_ts, now = time.time(), dt_util.now()
        if not self.first_seen:
            self.first_seen = now.isoformat()
            self._save()
        det = self.detectors()
        seen = {d["id"] for d in det}
        for d in det:
            s = self.st.setdefault(d["id"], {"a": False, "since": "", "off_since": 0.0, "rep": 0.0})
            where = f" ({d['area']})" if d["area"] else ""
            # Alarm
            if d["alarm"] and not s["a"]:
                s.update({"a": True, "since": now.isoformat(), "rep": now_ts})
                n = await self._run_acts(d["k"])
                self._add(f"ALARM: {d['name']}{where}." + (f" {n} Aktion(en) ausgelöst." if n else ""))
                await self._notify("alarm", f"ALARM: {d['kind']}", f"{d['name']}{where} hat ausgelöst.")
                self._save()
            elif d["alarm"] and s["a"]:
                rep = self.cfg["repeat"]
                if rep and now_ts - s["rep"] >= rep * 60:
                    s["rep"] = now_ts
                    await self._notify("alarm", f"ALARM läuft noch: {d['kind']}", f"{d['name']}{where} meldet weiter Alarm.")
            elif not d["alarm"] and s["a"] and not d["off"]:
                s.update({"a": False, "since": ""})
                self._add(f"Alarm beendet: {d['name']}{where}.")
                await self._notify("end", f"Alarm beendet: {d['kind']}", f"{d['name']}{where} meldet keinen Alarm mehr.")
                self._save()
            # Erreichbarkeit
            if d["off"]:
                s["off_since"] = s["off_since"] or now_ts
                o = self.cfg["off"]
                if o["on"] and now_ts - s["off_since"] >= o["min"] * 60:
                    key = f"off:{d['id']}"
                    if now_ts - self._notes.get(key, 0) >= OFF_NOTE_GAP_S:
                        self._add(f"Nicht erreichbar: {d['name']}{where}.")
                    await self._notify("off", "Melder nicht erreichbar", f"{d['name']}{where} meldet sich seit über {o['min']} Minuten nicht.", key, OFF_NOTE_GAP_S)
                    self._save()
            else:
                s["off_since"] = 0.0
            # Batterie
            b = self.cfg["bat"]
            if b["on"] and d["bat"] is not None and d["bat"] < b["pct"]:
                key = f"bat:{d['id']}"
                if now_ts - self._notes.get(key, 0) >= BAT_NOTE_GAP_S:
                    self._add(f"Batterie schwach: {d['name']}{where} ({round(d['bat'])} %).")
                await self._notify("bat", "Melder-Batterie schwach", f"{d['name']}{where}: Batterie bei {round(d['bat'])} %. Bitte bald wechseln.", key, BAT_NOTE_GAP_S)
                self._save()
        for k in [k for k in self.st if k not in seen]:
            if not self.st[k]["a"]:
                del self.st[k]
        # Prüf-Erinnerung
        t = self.cfg["test"]
        if t["on"] and det:
            ms = months_since(self.last_test or self.first_seen, now)
            if ms is not None and ms >= t["months"]:
                if now_ts - self._notes.get("test", 0) >= TEST_NOTE_GAP_S:
                    self._add("Erinnerung: Melder prüfen (Testknopf drücken).")
                await self._notify("test", "Melder prüfen", f"Die Melder wurden seit über {t['months']} Monaten nicht geprüft. Bitte den Testknopf drücken und danach in der App „Geprüft“ antippen.", "test", TEST_NOTE_GAP_S)
                self._save()

    async def async_config_changed(self) -> None:
        await self._tick(None)

    async def async_set(self, raw: Any) -> dict[str, Any]:
        self.cfg = clean_cfg(raw)
        self._save()
        await self.async_config_changed()
        return await self.snapshot()

    async def async_mark_tested(self) -> dict[str, Any]:
        self.last_test = dt_util.now().isoformat()
        self._notes.pop("test", None)
        self._add("Melder geprüft (von Hand bestätigt).")
        self._save()
        return await self.snapshot()

    async def snapshot(self) -> dict[str, Any]:
        det = self.detectors()
        now = dt_util.now()
        ms = months_since(self.last_test or self.first_seen, now)
        t = self.cfg["test"]
        test = {"last": self.last_test or None, "first": self.first_seen or None, "months": t["months"], "due": bool(t["on"] and ms is not None and ms >= t["months"])}
        for d in det:
            s = self.st.get(d["id"]) or {}
            d["since"] = s.get("since") or None
        # Alle erkannten Melder inkl. ausgeschlossener, damit man sie wieder einschalten kann
        reg = er.async_get(self.hass)
        excl = []
        for e in self.cfg["excl"]:
            st = self.hass.states.get(e)
            excl.append({"id": e, "name": (st.attributes.get("friendly_name") if st is not None else "") or e})
        xs = sum(1 for d in det if d["src"] == "xsense")
        xs_any = any(e.platform == "xsense" for e in reg.entities.values())
        return {"cfg": self.cfg, "det": det, "excl": excl, "test": test, "log": self.log[:12], "xs": {"found": xs_any, "n": xs}}
