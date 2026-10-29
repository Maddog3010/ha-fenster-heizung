"""Lab „Tags & Karten“ (id tg): RFID-Karten und NFC-Sticker lösen feste Aktionen aus.

Home Assistant meldet jeden Scan als Ereignis `tag_scanned` (Handy mit NFC, ESPHome PN532/RC522 und andere Leser).
Dieses Modul ordnet jedem angelernten Tag genau eine Aktion aus einer festen Liste zu. Es gibt bewusst keine freien
Dienstaufrufe und keine Aktionen, die einen Alarm entschärfen oder etwas aufschließen: Karten lassen sich kopieren.
Die reinen Prüffunktionen stehen oben, der Manager (Ereignis, Aktionen, Speicher) unten.
"""
from __future__ import annotations

import logging
import re
import time
from datetime import date, timedelta
from typing import Any

from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import DOMAIN
from .diag import diag_log
from .labs import lab_on

_LOGGER = logging.getLogger(__name__)

DEBOUNCE_S = 3.0          # ein Tag zählt höchstens alle 3 Sekunden (Doppelscans)
LEARN_S = 30              # so lange wartet „Tag anlernen“ auf den nächsten Scan
LOG_KEEP = 30
UNKNOWN_KEEP = 8
MAX_TAGS = 40
OVERRIDE_H = 12           # „… ist zu Hause“ per Tag gilt höchstens so viele Stunden

_TID = re.compile(r"^[A-Za-z0-9_\-:.]{1,100}$")
_ENT = re.compile(r"^[a-z_]+\.[a-z0-9_]+$")
_HM = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")
BINS = ("rest", "bio", "papier", "gelb")

# Aktion -> (Gruppe, Name, Zusatzangabe). Nur diese Liste ist erlaubt.
GROUPS = {
    "fh": "Modul 1 · Fenster & Heizung", "pe": "Personen", "ww": "Modul 2 · Warmwasser",
    "ev": "Modul 8 · Elektroauto", "mu": "Modul 17 · Müllabfuhr", "li": "Modul 18 · Licht",
}
ACTIONS: dict[str, tuple[str, str, str | None]] = {
    "pres_home": ("fh", "Alle Räume auf „Zu Hause“", None),
    "pres_away": ("fh", "Alle Räume auf „Abwesend“", None),
    "pres_vac": ("fh", "Urlaub für mehrere Tage", "days"),
    "fh_on": ("fh", "Fensterregelung einschalten", None),
    "fh_off": ("fh", "Fensterregelung ausschalten", None),
    "plan_on": ("fh", "Heizpläne einschalten", None),
    "plan_off": ("fh", "Heizpläne ausschalten", None),
    "person_home": ("pe", "Person ist zu Hause", "person"),
    "person_away": ("pe", "Person ist unterwegs", "person"),
    "ww_boost": ("ww", "Einmal aufheizen", None),
    "ww_circ": ("ww", "Zirkulation 5 Minuten", None),
    "ww_away_on": ("ww", "Warmwasser auf „Abwesend“", None),
    "ww_away_off": ("ww", "Warmwasser „Abwesend“ beenden", None),
    "ev_h1": ("ev", "Schnellstart: 1 Stunde voll", None),
    "ev_goal": ("ev", "Schnellstart: bis zum Ziel voll", None),
    "ev_sun": ("ev", "Schnellstart: heute nur Sonne", None),
    "ev_stop": ("ev", "Schnellstart stoppen", None),
    "mu_done": ("mu", "Tonne ist draußen", "bin"),
    "li_night": ("li", "Szene „Gute Nacht“", None),
    "li_arrive": ("li", "Szene „Ankommen“", None),
    "li_cozy": ("li", "Szene „Gemütlich“", None),
    "li_off": ("li", "Alle Lampen aus", None),
}
BIN_NAMES = {"rest": "Restmüll", "bio": "Bio", "papier": "Papier", "gelb": "Gelber Sack"}


def catalog() -> list[dict[str, Any]]:
    return [{"k": k, "g": g, "gn": GROUPS[g], "n": n, "arg": a} for k, (g, n, a) in ACTIONS.items()]


def default_cfg() -> dict[str, Any]:
    return {"tags": {}, "fb": {"notify": [], "tts": {"ent": "", "player": ""}, "light": ""}}


def _hm(v: Any) -> str:
    return v if isinstance(v, str) and _HM.match(v) else ""


def clean_tag(raw: Any) -> dict[str, Any] | None:
    r = raw if isinstance(raw, dict) else {}
    act = r.get("act") if isinstance(r.get("act"), dict) else {}
    kind = act.get("k")
    if kind not in ACTIONS:
        return None
    arg = act.get("arg")
    need = ACTIONS[kind][2]
    if need == "days":
        try:
            arg = min(21, max(1, int(arg)))
        except (TypeError, ValueError):
            arg = 7
    elif need == "person":
        arg = arg if isinstance(arg, str) and re.match(r"^person\.[a-z0-9_]+$", arg) else ""
        if not arg:
            return None
    elif need == "bin":
        arg = arg if arg in BINS else "rest"
    else:
        arg = None
    persons = [p for p in dict.fromkeys(r.get("persons") or []) if isinstance(p, str) and re.match(r"^person\.[a-z0-9_]+$", p)][:12]
    fb = r.get("fb") if isinstance(r.get("fb"), dict) else {}
    return {
        "name": (str(r.get("name") or "").strip()[:40] or "Tag"),
        "on": bool(r.get("on", True)),
        "act": {"k": kind, "arg": arg},
        "persons": persons,
        "fb": {"notify": bool(fb.get("notify", False)), "tts": bool(fb.get("tts", False)), "blink": bool(fb.get("blink", False))},
        "from": _hm(r.get("from")), "to": _hm(r.get("to")),
    }


def clean_cfg(raw: Any) -> dict[str, Any]:
    d = default_cfg()
    r = raw if isinstance(raw, dict) else {}
    tags = r.get("tags") if isinstance(r.get("tags"), dict) else {}
    for tid, t in list(tags.items())[:MAX_TAGS]:
        if isinstance(tid, str) and _TID.match(tid):
            c = clean_tag(t)
            if c:
                d["tags"][tid] = c
    f = r.get("fb") if isinstance(r.get("fb"), dict) else {}
    to: list[str] = []
    for s in f.get("notify") if isinstance(f.get("notify"), list) else []:
        if isinstance(s, str) and _ENT.match(s) and s.startswith("notify.") and s not in to and len(to) < 10:
            to.append(s)
    t = f.get("tts") if isinstance(f.get("tts"), dict) else {}
    ent = lambda v, dom: v if isinstance(v, str) and _ENT.match(v) and v.split(".")[0] == dom else ""  # noqa: E731
    d["fb"] = {"notify": to, "tts": {"ent": ent(t.get("ent"), "tts"), "player": ent(t.get("player"), "media_player")}, "light": ent(f.get("light"), "light")}
    return d


def in_window(frm: str, to: str, minute: int) -> bool:
    """Nur zwischen von und bis (über Mitternacht möglich). Ohne Angabe immer."""
    if not frm or not to:
        return True
    a = int(frm[:2]) * 60 + int(frm[3:])
    b = int(to[:2]) * 60 + int(to[3:])
    return a <= minute < b if a <= b else (minute >= a or minute < b)


def who_may(persons: list[str], who: str | None) -> bool:
    """Ist die Person, die gescannt hat, für diesen Tag zugelassen? Ohne Auswahl darf jeder."""
    return not persons or (who is not None and who in persons)


def describe(act: dict[str, Any], names: dict[str, str] | None = None) -> str:
    k, arg = act["k"], act.get("arg")
    n = ACTIONS[k][1]
    if k == "pres_vac":
        return f"Urlaub für {arg} {'Tag' if arg == 1 else 'Tage'}"
    if k in ("person_home", "person_away"):
        p = (names or {}).get(arg) or str(arg).split(".")[-1].capitalize()
        return f"{p} ist {'zu Hause' if k == 'person_home' else 'unterwegs'}"
    if k == "mu_done":
        return f"{BIN_NAMES.get(arg, 'Tonne')} ist draußen"
    return n


# --------------------------------------------------------------------------- Manager
class TagManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_tags")
        self.cfg = default_cfg()
        self.log: list[dict[str, Any]] = []
        self.unknown: dict[str, dict[str, Any]] = {}
        self._last: dict[str, float] = {}
        self.learn_until = 0.0
        self.learned: dict[str, Any] | None = None
        self._unsub: CALLBACK_TYPE | None = None

    async def async_start(self) -> None:
        d = await self._store.async_load()
        if isinstance(d, dict):
            self.cfg = clean_cfg(d.get("cfg"))
            self.log = [x for x in d.get("log") or [] if isinstance(x, dict)][-LOG_KEEP:]
            self.unknown = {k: v for k, v in (d.get("unknown") or {}).items() if isinstance(k, str) and isinstance(v, dict)}
        self._unsub = self.hass.bus.async_listen("tag_scanned", self._on_scan)

    def async_stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"cfg": self.cfg, "log": self.log[-LOG_KEEP:], "unknown": self.unknown}, 5)

    def active(self) -> bool:
        return lab_on(self.hass, "tg")

    # ---- Wer und wo
    def _names(self) -> dict[str, str]:
        return {s.entity_id: str(s.attributes.get("friendly_name") or s.entity_id) for s in self.hass.states.async_all("person")}

    def _who(self, event: Event) -> str | None:
        uid = getattr(getattr(event, "context", None), "user_id", None)
        if not uid:
            return None
        for s in self.hass.states.async_all("person"):
            if s.attributes.get("user_id") == uid:
                return s.entity_id
        return None

    def _reader(self, event: Event, who: str | None) -> str:
        if who:
            return f"Handy {self._names().get(who, who)}"
        did = (event.data or {}).get("device_id")
        if did:
            try:
                dev = dr.async_get(self.hass).async_get(did)
                if dev:
                    return str(dev.name_by_user or dev.name or "Leser")[:40]
            except Exception:  # noqa: BLE001
                pass
        return "Leser"

    # ---- Scan
    async def _on_scan(self, event: Event) -> None:
        if not self.active():
            return
        tid = str((event.data or {}).get("tag_id") or "")
        if not _TID.match(tid):
            return
        now = time.time()
        if now - self._last.get(tid, 0.0) < DEBOUNCE_S:
            return
        self._last[tid] = now
        who = self._who(event)
        reader = self._reader(event, who)
        if now < self.learn_until:
            self.learned = {"id": tid, "ts": now, "reader": reader, "known": tid in self.cfg["tags"]}
            self.learn_until = 0.0
            return
        t = self.cfg["tags"].get(tid)
        if t is None:
            self.unknown[tid] = {"ts": now, "reader": reader}
            for k in sorted(self.unknown, key=lambda x: self.unknown[x]["ts"])[:-UNKNOWN_KEEP]:
                self.unknown.pop(k, None)
            self._add(tid, tid[:14], reader, "unknown", "Unbekannt, nichts getan")
            return
        if not t["on"]:
            self._add(tid, t["name"], reader, "off", "Tag ist ausgeschaltet")
            return
        if not who_may(t["persons"], who):
            self._add(tid, t["name"], reader, "deny", "Nicht für diese Person freigegeben")
            return
        m = dt_util.now()
        if not in_window(t["from"], t["to"], m.hour * 60 + m.minute):
            self._add(tid, t["name"], reader, "time", f"Außerhalb {t['from']}–{t['to']} Uhr")
            return
        ok, msg = await self.run(t["act"])
        self._add(tid, t["name"], reader, "ok" if ok else "fail", msg)
        await self._feedback(t, ok, msg)

    def _add(self, tid: str, name: str, reader: str, res: str, msg: str) -> None:
        self.log.append({"ts": time.time(), "id": tid, "name": name, "reader": reader, "res": res, "msg": msg})
        self.log = self.log[-LOG_KEEP:]
        self._save()
        if res in ("ok", "fail"):
            diag_log(self.hass, "info" if res == "ok" else "warning", f"Tag „{name}“: {msg}")

    # ---- Aktionen
    async def run(self, act: dict[str, Any]) -> tuple[bool, str]:
        k, arg = act["k"], act.get("arg")
        if k not in ACTIONS:
            return False, "Unbekannte Aktion"
        text = describe(act, self._names())
        try:
            ok, why = await self._do(k, arg)
        except Exception as err:  # noqa: BLE001 - ein Tag darf nie etwas Weiteres stören
            _LOGGER.debug("Tag-Aktion %s: %s", k, err)
            return False, f"{text}: fehlgeschlagen"
        return ok, f"{text} ausgeführt" if ok else f"{text}: {why}"

    def _rooms(self):
        from homeassistant.config_entries import ConfigEntryState
        return [e for e in self.hass.config_entries.async_entries(DOMAIN) if getattr(e, "runtime_data", None) is not None and e.state is ConfigEntryState.LOADED]

    async def _do(self, k: str, arg: Any) -> tuple[bool, str]:
        D = self.hass.data.get(DOMAIN, {})
        if k in ("pres_home", "pres_away", "pres_vac"):
            pm = D.get("presence")
            if pm is None:
                return False, "Anwesenheit nicht bereit"
            cur = dict(pm.data)
            if k == "pres_vac":
                a = dt_util.now().date()
                cur.update(mode="vacation", **{"from": a.isoformat(), "to": (a + timedelta(days=int(arg))).isoformat()})
            else:
                cur["mode"] = "home" if k == "pres_home" else "away"
            await pm.async_set(cur, origin="manual")
            return True, ""
        if k in ("person_home", "person_away"):
            pm = D.get("presence")
            if pm is None or not await pm.async_person(str(arg), k == "person_home", OVERRIDE_H):
                return False, "Anwesenheit nicht bereit"
            return True, ""
        if k in ("fh_on", "fh_off", "plan_on", "plan_off"):
            rooms, n = self._rooms(), 0
            for e in rooms:
                c = e.runtime_data
                if k.startswith("fh"):
                    await c.async_set_enabled(k == "fh_on")
                    n += 1
                elif k == "plan_off" or c.plan_dict()["entries"]:
                    await c.async_set_plan_enabled(k == "plan_on")
                    n += 1
            return (True, "") if n else (False, "Keine Räume oder Heizpläne vorhanden")
        if k.startswith("ww_"):
            wm = D.get("wasser")
            if wm is None:
                return False, "Modul 2 nicht bereit"
            cmd, val = {"ww_boost": ("boost", True), "ww_circ": ("circ5", True), "ww_away_on": ("away", True), "ww_away_off": ("away", False)}[k]
            await wm.async_command(cmd, val)
            return True, ""
        if k.startswith("ev_"):
            wb = D.get("wallbox")
            if wb is None or not wb.cfg.get("enabled"):
                return False, "Die Wallbox-Regelung ist aus"
            await wb.async_quick({"ev_h1": "h1", "ev_goal": "goal", "ev_sun": "sun", "ev_stop": ""}[k])
            return True, ""
        if k == "mu_done":
            mm = D.get("muell")
            if mm is None or not lab_on(self.hass, "mm"):
                return False, "Modul 17 ist aus"
            await mm.async_done(str(arg))
            return True, ""
        if k.startswith("li_"):
            if not lab_on(self.hass, "li"):
                return False, "Modul 18 ist aus"
            if k == "li_off":
                ids = [s.entity_id for s in self.hass.states.async_all("light") if s.state == "on" and not isinstance(s.attributes.get("entity_id"), (list, tuple))]
                if ids:
                    await self.hass.services.async_call("light", "turn_off", {"entity_id": ids}, blocking=False)
                return True, ""
            from .api import _layout
            ent = (((await _layout(self.hass)).get("li") or {}).get("scenes") or {}).get({"li_night": "night", "li_arrive": "arrive", "li_cozy": "cozy"}[k]) or ""
            if not ent:
                return False, "Keine Szene verknüpft (Modul 18, Einstellungen)"
            dom = ent.split(".")[0]
            await self.hass.services.async_call(dom, "turn_on", {"entity_id": ent}, blocking=False)
            return True, ""
        return False, "Unbekannte Aktion"

    # ---- Rückmeldung
    async def _feedback(self, t: dict[str, Any], ok: bool, msg: str) -> None:
        fb, cfg = t["fb"], self.cfg["fb"]
        S = self.hass.services
        try:
            if fb["notify"]:
                for svc in cfg["notify"]:
                    name = svc.split(".", 1)[1]
                    if S.has_service("notify", name):
                        await S.async_call("notify", name, {"title": "Strom & Wärme", "message": f"{t['name']}: {msg}"}, blocking=False)
            if fb["tts"] and cfg["tts"]["ent"] and cfg["tts"]["player"]:
                await S.async_call("tts", "speak", {"entity_id": cfg["tts"]["ent"], "media_player_entity_id": cfg["tts"]["player"], "message": msg}, blocking=False)
            if fb["blink"] and cfg["light"]:
                await S.async_call("light", "turn_on", {"entity_id": cfg["light"], "flash": "short", "rgb_color": [45, 212, 191] if ok else [251, 113, 133]}, blocking=False)
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("Tag-Rückmeldung: %s", err)

    # ---- Schnittstelle zur Oberfläche
    async def async_set(self, raw: Any) -> dict[str, Any]:
        self.cfg = clean_cfg(raw)
        for tid in self.cfg["tags"]:
            self.unknown.pop(tid, None)
        self._save()
        return self.snapshot()

    def async_learn(self, on: bool) -> dict[str, Any]:
        self.learned = None
        self.learn_until = time.time() + LEARN_S if on else 0.0
        return self.snapshot()

    async def async_test(self, tid: str) -> dict[str, Any]:
        t = self.cfg["tags"].get(tid)
        ok, msg = (await self.run(t["act"])) if t else (False, "Tag nicht gefunden")
        self._add(tid, (t or {}).get("name", tid[:14]), "Test", "ok" if ok else "fail", msg)
        return {**self.snapshot(), "test": {"ok": ok, "msg": msg}}

    def async_clear_unknown(self, tid: str = "") -> dict[str, Any]:
        if tid:
            self.unknown.pop(tid, None)
        else:
            self.unknown.clear()
        self._save()
        return self.snapshot()

    def snapshot(self) -> dict[str, Any]:
        now = time.time()
        last: dict[str, dict[str, Any]] = {}
        for x in self.log:
            last[x["id"]] = x
        return {
            "on": self.active(), "cfg": self.cfg, "actions": catalog(), "groups": GROUPS, "bins": BIN_NAMES,
            "last": last, "log": list(reversed(self.log)),
            "unknown": [{"id": k, **v} for k, v in sorted(self.unknown.items(), key=lambda i: -i[1]["ts"])],
            "learn": {"active": now < self.learn_until, "left": max(0, int(self.learn_until - now)), "found": self.learned},
            "now": now,
        }
