"""Modul 15: Wartung & Erinnerungen – eigene Termine mit Abstand, Erledigt-Knopf und Ampel.

Stand v0.2 Build 2 (Konzept „Modul 15 · Wartung & Erinnerungen“, Stand 21.11.2026):
Datenmodell und eigener Speicher, Termine anlegen, bearbeiten, löschen und als erledigt eintragen.
Der nächste Termin rechnet sich aus dem Abstand (Tage, Wochen, Monate oder Jahre) ab der letzten Erledigung.
Betriebsstunden, Zähler, Erinnerungen aufs Handy und Daten aus anderen Modulen folgen ab Build 3.
"""
from __future__ import annotations

import calendar
import logging
import re
import secrets
from datetime import date, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

SCHEMA = 1  # Stand des Speichers (1 = Termine mit Kalender-Abstand, Build 2)
MAX_TASKS = 100
MAX_HIST = 50  # Einträge im Verlauf je Termin
MAX_LOG = 100
GRACE_DAYS = 3  # so lange nach dem Fälligkeitstag gilt ein Termin als „fällig“, danach „überfällig“
LEAD_DEF = 7
UNITS = {"d": (1, 3650, "Tag", "Tage"), "w": (1, 520, "Woche", "Wochen"), "m": (1, 120, "Monat", "Monate"), "y": (1, 30, "Jahr", "Jahre")}
ICONS = ("tools", "flame", "fan", "drop", "shield", "heatpump", "boiler", "home", "roof", "plant", "car", "robot", "energy", "sun", "wave", "lamp", "laundry", "pot")
TRIGGERS = ("kal",)  # ab Build 3: "std" (Betriebsstunden), "zae" (Zähler), "zus" (Zustand)
STATES = ("ok", "soon", "due", "over", "new")
_ID = re.compile(r"^[a-z0-9]{4,16}$")
_DAY = re.compile(r"^(19|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$")


def _txt(v: Any, n: int) -> str:
    return re.sub(r"\s+", " ", str(v or "")).strip()[:n]


def _int(v: Any, lo: int, hi: int, d: int) -> int:
    try:
        x = int(float(v))
    except (TypeError, ValueError):
        return d
    return max(lo, min(hi, x))


def parse_day(v: Any) -> date | None:
    s = str(v or "")[:10]
    if not _DAY.match(s):
        return None
    try:
        return date.fromisoformat(s)
    except ValueError:
        return None


def _money(v: Any) -> float | None:
    if v in (None, ""):
        return None
    try:
        x = round(float(str(v).replace(",", ".")), 2)
    except (TypeError, ValueError):
        return None
    return x if 0 <= x <= 100_000 else None


def add_interval(d: date, every: int, unit: str) -> date:
    """Datum plus Abstand. Monate und Jahre bleiben am selben Tag, am Monatsende auf den letzten Tag gekürzt (31.01. + 1 Monat = 28./29.02.)."""
    if unit == "d":
        return d + timedelta(days=every)
    if unit == "w":
        return d + timedelta(weeks=every)
    months = every * (12 if unit == "y" else 1)
    m0 = d.month - 1 + months
    y, m = d.year + m0 // 12, m0 % 12 + 1
    return date(y, m, min(d.day, calendar.monthrange(y, m)[1]))


def new_id(taken: set[str]) -> str:
    while True:
        i = secrets.token_hex(4)
        if i not in taken:
            return i


def clean_hist(raw: Any) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for h in raw if isinstance(raw, list) else []:
        if not isinstance(h, dict) or not parse_day(h.get("d")):
            continue
        e: dict[str, Any] = {"d": str(h["d"])[:10]}
        c = _money(h.get("cost"))
        if c is not None:
            e["cost"] = c
        n = _txt(h.get("note"), 200)
        if n:
            e["note"] = n
        if "prev" in h:  # Stand vor dem Eintrag – für „Rückgängig“
            e["prev"] = str(h["prev"])[:10] if parse_day(h.get("prev")) else ""
        out.append(e)
    return out[-MAX_HIST:]


def clean_task(raw: Any, old: dict[str, Any] | None = None) -> dict[str, Any] | None:
    """Prüft einen Termin aus der Oberfläche. Ohne Namen kein Termin. Verlauf und Anlagedatum bleiben vom alten Stand."""
    if not isinstance(raw, dict):
        return None
    name = _txt(raw.get("name"), 40)
    if not name:
        return None
    unit = raw.get("unit") if raw.get("unit") in UNITS else "m"
    lo, hi = UNITS[unit][:2]
    old = old or {}
    t = {
        "id": str(old.get("id") or raw.get("id") or ""),
        "name": name,
        "area": _txt(raw.get("area"), 30),
        "icon": raw.get("icon") if raw.get("icon") in ICONS else "tools",
        "trig": "kal",
        "every": _int(raw.get("every"), lo, hi, 12 if unit == "m" else 1),
        "unit": unit,
        "last": str(raw.get("last"))[:10] if parse_day(raw.get("last")) else "",
        "first": str(raw.get("first"))[:10] if parse_day(raw.get("first")) else "",
        "lead": _int(raw.get("lead"), 0, 90, LEAD_DEF),
        "note": _txt(raw.get("note"), 200),
        "pro": bool(raw.get("pro")),  # Fachbetrieb statt selbst
        "off": bool(raw.get("off")),  # pausiert: keine Ampel, zählt nicht mit
        "hist": clean_hist(old.get("hist")) if old else [],
        "created": str(old.get("created") or raw.get("created") or "")[:10],
    }
    return t


def due_of(t: dict[str, Any]) -> date | None:
    """Nächster Termin: letzte Erledigung + Abstand, sonst das erste Datum. Ohne beides: noch offen („new“)."""
    last = parse_day(t.get("last"))
    if last:
        return add_interval(last, int(t.get("every") or 1), str(t.get("unit") or "m"))
    return parse_day(t.get("first"))


def status(t: dict[str, Any], today: date) -> dict[str, Any]:
    """Ampel eines Termins: ok (grün), soon (in der Vorwarnzeit), due (ab Fälligkeit, GRACE_DAYS lang), over (danach)."""
    due = due_of(t)
    if t.get("off"):
        return {"st": "off", "due": due.isoformat() if due else "", "days": None}
    if due is None:
        return {"st": "new", "due": "", "days": None}
    days = (due - today).days
    lead = int(t.get("lead") if t.get("lead") is not None else LEAD_DEF)
    st = "ok" if days > lead else "soon" if days > 0 else "due" if days > -GRACE_DAYS else "over"
    return {"st": st, "due": due.isoformat(), "days": days}


def summary(tasks: list[dict[str, Any]], today: date) -> dict[str, Any]:
    n = {k: 0 for k in (*STATES, "off")}
    nxt: dict[str, Any] | None = None
    year, cost = str(today.year), 0.0
    done_year = 0
    for t in tasks:
        s = status(t, today)
        n[s["st"]] += 1
        if s["st"] not in ("off", "new") and (nxt is None or s["days"] < nxt["days"]):
            nxt = {"id": t["id"], "name": t["name"], **s}
        for h in t.get("hist") or []:
            if str(h.get("d", "")).startswith(year):
                done_year += 1
                cost += float(h.get("cost") or 0)
    return {**n, "total": len(tasks), "next": nxt, "done_year": done_year, "cost_year": round(cost, 2)}


class WartungManager:
    SCHEMA = SCHEMA  # für die Diagnose

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_wartung")
        self.tasks: list[dict[str, Any]] = []
        self.log: list[dict[str, str]] = []

    # ---- Start/Stop
    async def async_start(self) -> None:
        d = await self._store.async_load()
        if not isinstance(d, dict):
            return
        seen: set[str] = set()
        for raw in d.get("tasks") if isinstance(d.get("tasks"), list) else []:
            t = clean_task(raw, raw if isinstance(raw, dict) else None)
            if not t or len(self.tasks) >= MAX_TASKS:
                continue
            if not _ID.match(t["id"]) or t["id"] in seen:
                t["id"] = new_id(seen)
            seen.add(t["id"])
            self.tasks.append(t)
        self.log = [x for x in (d.get("log") or []) if isinstance(x, dict) and "t" in x and "x" in x][:MAX_LOG]
        if int(d.get("v") or 0) > SCHEMA:
            _LOGGER.warning("Modul 15: Speicher stammt aus einer neueren Version (Schema %s), gelesen wird nur, was Build 2 kennt", d.get("v"))

    def async_stop(self) -> None:
        """Build 2 hat noch keine Zeitgeber oder Zuhörer."""

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"v": SCHEMA, "tasks": self.tasks, "log": self.log}, 2)

    def _add(self, text: str) -> None:
        self.log.insert(0, {"t": dt_util.now().isoformat(), "x": text})
        del self.log[MAX_LOG:]

    def _get(self, tid: str) -> dict[str, Any] | None:
        return next((t for t in self.tasks if t["id"] == tid), None)

    @staticmethod
    def _today() -> date:
        return dt_util.now().date()

    # ---- Lesen
    async def snapshot(self) -> dict[str, Any]:
        today = self._today()
        tasks = [{**t, **status(t, today)} for t in self.tasks]
        order = {"over": 0, "due": 1, "soon": 2, "ok": 3, "new": 4, "off": 5}
        tasks.sort(key=lambda t: (order.get(t["st"], 9), t["days"] if t["days"] is not None else 99999, t["name"].lower()))
        return {"v": SCHEMA, "today": today.isoformat(), "grace": GRACE_DAYS, "tasks": tasks, "sum": summary(self.tasks, today), "log": self.log[:20], "max": MAX_TASKS}

    # ---- Ändern
    async def async_save_task(self, raw: Any) -> dict[str, Any]:
        tid = str((raw or {}).get("id") or "") if isinstance(raw, dict) else ""
        old = self._get(tid) if tid else None
        if tid and old is None:
            return {"ok": False, "err": "unknown", **(await self.snapshot())}
        if old is None and len(self.tasks) >= MAX_TASKS:
            return {"ok": False, "err": "full", **(await self.snapshot())}
        t = clean_task(raw, old)
        if t is None:
            return {"ok": False, "err": "name", **(await self.snapshot())}
        if old is None:
            t["id"] = new_id({x["id"] for x in self.tasks})
            t["created"] = self._today().isoformat()
            self.tasks.append(t)
            self._add(f"Neu: {t['name']}")
        else:
            self.tasks[self.tasks.index(old)] = t
            self._add(f"Geändert: {t['name']}")
        self._save()
        return {"ok": True, "id": t["id"], **(await self.snapshot())}

    async def async_delete(self, tid: str) -> dict[str, Any]:
        t = self._get(tid)
        if t is None:
            return {"ok": False, "err": "unknown", **(await self.snapshot())}
        self.tasks.remove(t)
        self._add(f"Gelöscht: {t['name']}")
        self._save()
        return {"ok": True, **(await self.snapshot())}

    async def async_done(self, tid: str, day: str = "", cost: Any = None, note: str = "") -> dict[str, Any]:
        """Erledigt eintragen: setzt die letzte Erledigung, der nächste Termin rechnet sich aus dem Abstand. Ohne Datum gilt heute."""
        t = self._get(tid)
        if t is None:
            return {"ok": False, "err": "unknown", **(await self.snapshot())}
        today = self._today()
        d = parse_day(day) or today
        if d > today:
            return {"ok": False, "err": "future", **(await self.snapshot())}
        e: dict[str, Any] = {"d": d.isoformat(), "prev": t.get("last") or ""}
        c = _money(cost)
        if c is not None:
            e["cost"] = c
        if _txt(note, 200):
            e["note"] = _txt(note, 200)
        t["hist"] = [*t.get("hist", []), e][-MAX_HIST:]
        if not t.get("last") or d.isoformat() >= t["last"]:  # ein nachgetragener älterer Eintrag verschiebt den Termin nicht zurück
            t["last"] = d.isoformat()
        self._add(f"Erledigt: {t['name']}")
        self._save()
        return {"ok": True, **(await self.snapshot())}

    async def async_undo(self, tid: str) -> dict[str, Any]:
        """Letztes „Erledigt“ zurücknehmen (zum Beispiel nach einem versehentlichen Tipp)."""
        t = self._get(tid)
        if t is None or not t.get("hist") or "prev" not in t["hist"][-1]:
            return {"ok": False, "err": "nothing", **(await self.snapshot())}
        e = t["hist"].pop()
        if t.get("last") == e["d"]:
            t["last"] = e.get("prev") or ""
        self._add(f"Rückgängig: {t['name']}")
        self._save()
        return {"ok": True, **(await self.snapshot())}

    def diag(self) -> dict[str, Any]:
        today = self._today()
        sm = summary(self.tasks, today)
        if sm.get("next"):
            sm["next"] = {k: v for k, v in sm["next"].items() if k != "name"}
        return {"schema": SCHEMA, "tasks": [{k: t[k] for k in ("id", "trig", "every", "unit", "last", "first", "lead", "off")} | status(t, today) | {"hist": len(t["hist"])} for t in self.tasks],
                "sum": sm}
