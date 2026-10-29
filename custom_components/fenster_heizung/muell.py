"""Modul 17: Müllabfuhr (Labs) – Termine aus einem Kalender (z. B. waste_collection_schedule), Ampel, Erinnerung, Ansage, Licht, Statistik.

Das Modul gehört zum Lab „Müllabfuhr“ (id mm) und ist nur aktiv, solange dieses Lab eingeschaltet ist. Die reinen
Rechenfunktionen stehen oben, der Manager (Abruf, Meldungen, Speicher) unten.
"""
from __future__ import annotations

import logging
import re
import time
from collections import Counter
from datetime import date, datetime, timedelta
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import DOMAIN
from .diag import diag_log
from .labs import lab_on

_LOGGER = logging.getLogger(__name__)

TICK_SECONDS = 60
REFRESH_S = 1800          # Termine höchstens alle 30 Minuten neu abrufen
SENT_KEEP = 40
CATCHUP_MIN = 120         # nach einem Neustart wird die Erinnerung noch bis 2 Stunden nach der Uhrzeit nachgeholt
PASSED_MIN = 12 * 60      # ab Mittag gilt die Abholung des Tages als erledigt
SNOOZE_MIN = 60
BINS: dict[str, tuple[str, str]] = {
    "rest": ("Restmüll", "#78716c"), "bio": ("Bio", "#92400e"), "papier": ("Papier", "#3b82f6"), "gelb": ("Gelber Sack", "#eab308"),
}
ORDER = ("bio", "papier", "gelb", "rest")   # Reihenfolge beim Erkennen, damit „Gelber Sack“ nicht als „Rest“ zählt
DEFAULT_MATCH = {"rest": "rest,hausmüll,hausmuell,schwarz", "bio": "bio", "papier": "papier,pappe,blau", "gelb": "gelb,wertstoff,verpackung,lvp"}
WD = ("Mo", "Di", "Mi", "Do", "Fr", "Sa", "So")
_ENT = re.compile(r"^[a-z_]+\.[a-z0-9_]+$")
_HM = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


def default_cfg() -> dict[str, Any]:
    return {
        "cal": "", "time": "18:30", "bins": {k: {"on": True, "match": DEFAULT_MATCH[k]} for k in BINS},
        "push": {"on": False, "to": []}, "cost": {"on": False, "fee": 0.0, "incl": 0}, "wx": True,
        "tts": {"on": False, "ent": "", "player": "", "text": "Morgen wird {tonnen} abgeholt."}, "light": {"on": False, "ent": ""},
    }


def _ent(v: Any, domains: tuple[str, ...]) -> str:
    return v if isinstance(v, str) and _ENT.match(v) and v.split(".")[0] in domains else ""


def _num(v: Any, lo: float, hi: float, d: float) -> float:
    try:
        x = float(v)
    except (TypeError, ValueError):
        return d
    return min(hi, max(lo, x)) if x == x else d


def clean_cfg(raw: Any) -> dict[str, Any]:
    d = default_cfg()
    r = raw if isinstance(raw, dict) else {}
    d["cal"] = _ent(r.get("cal"), ("calendar",))
    d["time"] = r["time"] if isinstance(r.get("time"), str) and _HM.match(r["time"]) else d["time"]
    b = r.get("bins") if isinstance(r.get("bins"), dict) else {}
    for k in BINS:
        x = b.get(k) if isinstance(b.get(k), dict) else {}
        words = ",".join(w.strip().lower() for w in str(x.get("match", DEFAULT_MATCH[k])).split(",") if w.strip())[:80]
        d["bins"][k] = {"on": bool(x.get("on", True)), "match": words or DEFAULT_MATCH[k]}
    p = r.get("push") if isinstance(r.get("push"), dict) else {}
    to: list[str] = []
    for s in p.get("to") if isinstance(p.get("to"), list) else []:
        s = _ent(s, ("notify",))
        if s and s not in to and len(to) < 10:
            to.append(s)
    d["push"] = {"on": bool(p.get("on", False)), "to": to}
    c = r.get("cost") if isinstance(r.get("cost"), dict) else {}
    d["cost"] = {"on": bool(c.get("on", False)), "fee": round(_num(c.get("fee"), 0, 999, 0), 2), "incl": int(_num(c.get("incl"), 0, 99, 0))}
    d["wx"] = bool(r.get("wx", True))
    t = r.get("tts") if isinstance(r.get("tts"), dict) else {}
    txt = str(t.get("text") or d["tts"]["text"]).strip()[:120]
    d["tts"] = {"on": bool(t.get("on", False)), "ent": _ent(t.get("ent"), ("tts",)), "player": _ent(t.get("player"), ("media_player",)), "text": txt or d["tts"]["text"]}
    li = r.get("light") if isinstance(r.get("light"), dict) else {}
    d["light"] = {"on": bool(li.get("on", False)), "ent": _ent(li.get("ent"), ("light",))}
    return d


# --------------------------------------------------------------------------- reine Rechnung
def classify(summary: str, bins_cfg: dict[str, Any]) -> str | None:
    """Welche Tonne meint dieser Kalendertitel? Erste passende nach ORDER, nur eingeschaltete."""
    s = (summary or "").lower()
    for k in ORDER:
        x = bins_cfg.get(k) or {}
        if x.get("on", True) and any(w and w in s for w in str(x.get("match", "")).split(",")):
            return k
    return None


def parse_events(raw: list[Any], bins_cfg: dict[str, Any]) -> list[tuple[str, str]]:
    """Kalendereinträge → sortierte, eindeutige Liste (Datum, Tonne)."""
    out: set[tuple[str, str]] = set()
    for e in raw or []:
        if not isinstance(e, dict):
            continue
        k = classify(str(e.get("summary") or e.get("message") or ""), bins_cfg)
        day = str(e.get("start") or "")[:10]
        if k and re.match(r"^\d{4}-\d{2}-\d{2}$", day):
            out.add((day, k))
    return sorted(out)


def next_for(events: list[tuple[str, str]], k: str, today: date, minute: int) -> str | None:
    """Nächste Abholung einer Tonne. Die des heutigen Tages zählt bis Mittag."""
    t = today.isoformat()
    for d, b in events:
        if b == k and (d > t or (d == t and minute < PASSED_MIN)):
            return d
    return None


def bin_state(nxt: str | None, today: date, minute: int, evening: int, done: str | None) -> str:
    if not nxt:
        return "none"
    if done == nxt:
        return "done"
    days = (date.fromisoformat(nxt) - today).days
    if days == 0:
        return "today"
    if days == 1:
        return "out" if minute >= evening else "soon"
    return "ok"


def month_days(events: list[tuple[str, str]], year: int, month: int) -> dict[str, list[str]]:
    pre = f"{year:04d}-{month:02d}-"
    out: dict[str, list[str]] = {}
    for d, b in events:
        if d.startswith(pre):
            out.setdefault(str(int(d[8:])), []).append(b)
    return out


def stats(events: list[tuple[str, str]], today: date, incl: int, fee: float) -> dict[str, Any]:
    pre = f"{today.year:04d}-"
    rest = [d for d, b in events if b == "rest" and d.startswith(pre)]
    done = sum(1 for d in rest if d <= today.isoformat())
    return {"year": today.year, "total": len(rest), "done": done, "incl": incl, "free": max(0, incl - done) if incl else None,
            "extra": max(0, done - incl) if incl else None, "cost": round(max(0, done - incl) * fee, 2) if incl and fee else None}


def shift_notes(events: list[tuple[str, str]], today: date) -> list[dict[str, str]]:
    """Abholung weicht vom üblichen Wochentag ab (zum Beispiel nach einem Feiertag)."""
    out: list[dict[str, str]] = []
    horizon = (today + timedelta(days=90)).isoformat()
    for k in BINS:
        ds = [d for d, b in events if b == k and today.isoformat() <= d <= horizon]
        if len(ds) < 4:
            continue
        usual = Counter(date.fromisoformat(d).weekday() for d in ds).most_common(1)[0][0]
        near = next((d for d in ds if (date.fromisoformat(d) - today).days <= 14), None)
        if near and date.fromisoformat(near).weekday() != usual:
            out.append({"k": k, "d": near, "text": f"{BINS[k][0]} kommt am {WD[date.fromisoformat(near).weekday()]}, {date.fromisoformat(near).day}.{date.fromisoformat(near).month}. statt am {WD[usual]} (verschoben)."})
    return out


def _tm(s: str) -> int:
    h, m = str(s).split(":")
    return int(h) * 60 + int(m)


def names_text(keys: list[str]) -> str:
    n = [BINS[k][0] for k in keys]
    return n[0] if len(n) == 1 else ", ".join(n[:-1]) + " und " + n[-1]


# --------------------------------------------------------------------------- Manager
class MuellManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_muell")
        self.cfg = default_cfg()
        self.done: dict[str, str] = {}
        self.sent: list[str] = []
        self.light_on = False
        self.snooze_until = 0.0
        self.ev: list[tuple[str, str]] = []
        self.ev_ts = 0.0
        self.error = ""
        self._busy = False
        self._unsub: CALLBACK_TYPE | None = None

    async def async_start(self) -> None:
        d = await self._store.async_load()
        if isinstance(d, dict):
            self.cfg = clean_cfg(d.get("cfg"))
            self.done = {k: str(v) for k, v in (d.get("done") or {}).items() if k in BINS}
            self.sent = [str(x) for x in d.get("sent") or []][-SENT_KEEP:]
            self.light_on = bool(d.get("light_on"))
        self._unsub = async_track_time_interval(self.hass, self._tick, timedelta(seconds=TICK_SECONDS))

    def async_stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"cfg": self.cfg, "done": self.done, "sent": self.sent[-SENT_KEEP:], "light_on": self.light_on}, 5)

    async def async_set(self, raw: Any) -> dict[str, Any]:
        old = self.cfg
        self.cfg = clean_cfg({**self.cfg, **raw} if isinstance(raw, dict) else raw)  # fehlende Felder (alter Browser) behalten ihren Stand
        if self.cfg["cal"] != old["cal"] or self.cfg["bins"] != old["bins"]:
            self.ev_ts = 0.0
        self._save()
        return await self.snapshot()

    def active(self) -> bool:
        return lab_on(self.hass, "mm")

    def cal_entity(self) -> str:
        if self.cfg["cal"]:
            return self.cfg["cal"]
        try:
            reg = er.async_get(self.hass)
            for e in reg.entities.values():
                if e.platform == "waste_collection_schedule" and e.domain == "calendar" and not e.disabled:
                    return e.entity_id
        except Exception:  # noqa: BLE001
            pass
        return ""

    # ---- Termine abrufen
    async def refresh(self, force: bool = False) -> None:
        if self._busy or (not force and time.time() - self.ev_ts < REFRESH_S):
            return
        cal = self.cal_entity()
        if not cal:
            self.ev, self.error = [], "Kein Kalender gewählt"
            return
        self._busy = True
        try:
            today = dt_util.now().date()
            end = max(date(today.year, 12, 31), today + timedelta(days=90)) + timedelta(days=1)
            res = await self.hass.services.async_call(
                "calendar", "get_events",
                {"entity_id": cal, "start_date_time": dt_util.start_of_local_day(date(today.year, 1, 1)), "end_date_time": dt_util.start_of_local_day(end)},
                blocking=True, return_response=True,
            )
            raw = ((res or {}).get(cal) or {}).get("events") or []
            self.ev = parse_events(raw, self.cfg["bins"])
            self.error = "" if self.ev else "Im Kalender wurden keine passenden Termine gefunden"
        except Exception as err:  # noqa: BLE001 - Kalender kann fehlen oder nicht antworten
            self.error = "Kalender nicht erreichbar"
            _LOGGER.debug("Müllabfuhr: Abruf fehlgeschlagen: %s", err)
        finally:
            self.ev_ts = time.time()
            self._busy = False

    # ---- Aktionen
    def _due(self, today: date, minute: int, day_offset: int = 1) -> list[str]:
        """Tonnen, die an today+offset abgeholt werden und noch nicht als draußen markiert sind."""
        target = (today + timedelta(days=day_offset)).isoformat()
        return [k for k in BINS if self.cfg["bins"][k]["on"] and any(d == target and b == k for d, b in self.ev) and self.done.get(k) != target]

    async def _send_push(self, title: str, msg: str) -> int:
        sent = 0
        for svc in self.cfg["push"]["to"]:
            name = svc.split(".", 1)[1]
            if not self.hass.services.has_service("notify", name):
                continue
            try:
                await self.hass.services.async_call("notify", name, {"title": title, "message": msg}, blocking=False)
                sent += 1
            except Exception as err:  # noqa: BLE001
                _LOGGER.debug("Müllabfuhr: Meldung %s: %s", svc, err)
        return sent

    async def _speak(self, keys: list[str]) -> None:
        t = self.cfg["tts"]
        if not (t["on"] and t["ent"] and t["player"]):
            return
        try:
            await self.hass.services.async_call("tts", "speak", {"entity_id": t["ent"], "media_player_entity_id": t["player"], "message": t["text"].replace("{tonnen}", names_text(keys))}, blocking=False)
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("Müllabfuhr: Ansage: %s", err)

    async def _light(self, keys: list[str]) -> None:
        li = self.cfg["light"]
        if not li["ent"]:
            return
        want = bool(li["on"] and keys)
        try:
            if want and not self.light_on:
                h = BINS[keys[0]][1].lstrip("#")
                await self.hass.services.async_call("light", "turn_on", {"entity_id": li["ent"], "rgb_color": [int(h[i:i + 2], 16) for i in (0, 2, 4)], "brightness_pct": 60}, blocking=False)
                self.light_on = True
                self._save()
            elif not want and self.light_on:
                await self.hass.services.async_call("light", "turn_off", {"entity_id": li["ent"]}, blocking=False)
                self.light_on = False
                self._save()
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("Müllabfuhr: Licht: %s", err)

    async def _remind(self, keys: list[str], why: str) -> None:
        if self.cfg["push"]["on"]:
            await self._send_push("Tonnen rausstellen", f"Morgen wird {names_text(keys)} abgeholt.")
        await self._speak(keys)
        diag_log(self.hass, "info", f"Müllabfuhr: Erinnerung ({why}): {names_text(keys)}", room="Müllabfuhr")

    async def _tick(self, _now: Any) -> None:
        try:
            if not self.active():
                if self.light_on:
                    await self._light([])
                return
            await self.refresh()
            now = dt_util.now()
            today, minute = now.date(), now.hour * 60 + now.minute
            ev_min = _tm(self.cfg["time"])
            due = self._due(today, minute)
            key = f"p:{today.isoformat()}"
            if due and ev_min <= minute < ev_min + CATCHUP_MIN and key not in self.sent:
                self.sent.append(key)
                self.sent = self.sent[-SENT_KEEP:]
                self._save()
                await self._remind(due, "Vorabend")
            if self.snooze_until and time.time() >= self.snooze_until:
                self.snooze_until = 0.0
                if due:
                    await self._remind(due, "später")
            today_due = self._due(today, minute, 0) if minute < PASSED_MIN else []
            await self._light(due if minute >= ev_min else today_due)
        except Exception:  # noqa: BLE001 - die Müllabfuhr darf nie etwas anderes stören
            _LOGGER.exception("Müllabfuhr: Auswertung fehlgeschlagen")

    async def async_done(self, k: str) -> dict[str, Any]:
        now = dt_util.now()
        nxt = next_for(self.ev, k, now.date(), now.hour * 60 + now.minute) if k in BINS else None
        if nxt:
            self.done[k] = nxt
            self._save()
            await self._tick(None)
        return await self.snapshot()

    async def async_undo(self, k: str) -> dict[str, Any]:
        self.done.pop(k, None)
        self._save()
        return await self.snapshot()

    async def async_snooze(self) -> dict[str, Any]:
        self.snooze_until = time.time() + SNOOZE_MIN * 60
        return await self.snapshot()

    async def async_test(self) -> dict[str, Any]:
        sent = await self._send_push("Müllabfuhr", "Testmeldung von Modul 17. Die Benachrichtigung funktioniert.")
        await self._speak(["rest"])
        return {"sent": sent}

    # ---- Ansicht
    def _wx_notes(self, due: list[str]) -> list[dict[str, str]]:
        wm = self.hass.data.get(DOMAIN, {}).get("wetter")
        if not (self.cfg["wx"] and due and wm is not None):
            return []
        out = []
        for k, txt in (("storm", "Sturm gemeldet oder erwartet: Tonnen sichern oder erst spät rausstellen."), ("frost", "Frost: Biotonne kann festfrieren, Deckel prüfen.")):
            st = (getattr(wm, "st", {}) or {}).get(k) or {}
            if st.get("a") or st.get("ahead"):
                out.append({"k": k, "text": txt})
        return out

    async def snapshot(self) -> dict[str, Any]:
        on = self.active()
        if on:
            await self.refresh()
        out: dict[str, Any] = {"on": on, "cfg": self.cfg, "cal": self.cal_entity(), "error": self.error}
        if not on:
            return out
        now = dt_util.now()
        today, minute = now.date(), now.hour * 60 + now.minute
        ev_min = _tm(self.cfg["time"])
        rows = []
        for k, (name, color) in BINS.items():
            if not self.cfg["bins"][k]["on"]:
                continue
            nx = next_for(self.ev, k, today, minute)
            rows.append({"k": k, "name": name, "color": color, "next": nx, "days": (date.fromisoformat(nx) - today).days if nx else None,
                         "state": bin_state(nx, today, minute, ev_min, self.done.get(k))})
        rows.sort(key=lambda r: (r["next"] is None, r["next"] or ""))
        due = self._due(today, minute)
        out.update({
            "bins": rows, "month": {"y": today.year, "m": today.month, "d": month_days(self.ev, today.year, today.month), "today": today.day},
            "stats": stats(self.ev, today, self.cfg["cost"]["incl"], self.cfg["cost"]["fee"]) if self.cfg["cost"]["on"] else None,
            "notes": shift_notes(self.ev, today) + self._wx_notes(due), "n_events": len(self.ev), "now": now.isoformat(timespec="minutes"),
            "snooze": bool(self.snooze_until), "light_on": self.light_on,
        })
        return out
