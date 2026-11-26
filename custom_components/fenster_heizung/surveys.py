"""Umfragen: Der Entwickler stellt Fragen, Administratoren dürfen freiwillig antworten.

Abruf (abschaltbar, höchstens etwa 1× pro Tag): GET /v1/surveys – ohne Kennung, Version oder Module. Alle bekommen
dieselbe Liste; ob eine Umfrage zu Kanal und Modulen passt, entscheidet diese Integration selbst.

Antworten (nur nach „Absenden“): {"schema": 1, "survey", "rev", "rid", "version", "channel", "answers"}. „rid“ ist ein
Zufallscode nur für diese eine Umfrage, nicht die Kennung der Versions-Statistik. Damit lässt sich genau diese Antwort
ändern oder löschen. Fehler werden still abgefangen: Die Integration läuft normal weiter.
"""
from __future__ import annotations

import asyncio
import json
import logging
import random
import time
import uuid
from datetime import timedelta
from typing import Any

import aiohttp
from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.event import async_call_later, async_track_time_interval
from homeassistant.helpers.storage import Store

from . import surveys_logic as L
from .const import DOMAIN
from .stats_logic import _ID_RE, active_modules, channel_of

_LOGGER = logging.getLogger(__name__)

TIMEOUT = 10              # Sekunden
CHECK_MIN = 60            # so oft wird geprüft, ob ein Abruf fällig ist
MAX_BYTES = 200_000       # mehr liefert der Server nie
AGENT = "Strom-und-Waerme" # statt der Kennzeichnung von Home Assistant, die dessen Version verraten würde


class Surveys:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store = Store(hass, 1, "fenster_heizung_surveys")
        self.on = True            # Umfragen laden
        self.popup = True         # neue Umfragen als Popup zeigen
        self.list: list[dict[str, Any]] = []
        self.recs: dict[str, dict[str, Any]] = {}   # je Umfrage: eigener Zufallscode, Antworten, Popup-Zähler
        self.last_ok = 0.0
        self.last_try = 0.0
        self.last_popup = 0.0
        self.err = ""
        self.code = ""            # nur Entwickler: Testcode
        self._busy: set[str] = set()
        self._fetching = False
        self._unsubs: list[CALLBACK_TYPE] = []

    # ------------------------------------------------------------ Start, Speichern
    async def async_start(self) -> None:
        d = await self._store.async_load()
        if isinstance(d, dict):
            self.on = d.get("on") is not False
            self.popup = d.get("popup") is not False
            self.list = L.clean_list({"ok": True, "surveys": d.get("list") or []}) or []
            recs = d.get("recs")
            self.recs = {k: dict(v) for k, v in recs.items() if isinstance(v, dict) and _ID_RE.match(str(v.get("rid") or ""))} if isinstance(recs, dict) else {}
            self.last_ok = float(d.get("last_ok") or 0)
            self.last_try = float(d.get("last_try") or 0)
            self.last_popup = float(d.get("last_popup") or 0)
            self.err = str(d.get("err") or "")[:20]
            self.code = L.clean_code(d.get("code"))
        self._unsubs.append(async_call_later(self.hass, random.randint(60, 600), self._tick))
        self._unsubs.append(async_track_time_interval(self.hass, self._tick, timedelta(minutes=CHECK_MIN)))

    def async_stop(self) -> None:
        for u in self._unsubs:
            u()
        self._unsubs.clear()

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {
            "on": self.on, "popup": self.popup, "list": self.list, "recs": self.recs, "last_ok": self.last_ok,
            "last_try": self.last_try, "last_popup": self.last_popup, "err": self.err, "code": self.code,
        }, 1)

    # ------------------------------------------------------------ Umgebung
    @property
    def url(self) -> str:
        """Gleicher Server wie die Versions-Statistik (auch deren Test-Adresse im Entwickler-Bereich)."""
        sts = self.hass.data.get(DOMAIN, {}).get("stats")
        if sts is not None:
            return sts.url
        from .stats import STATS_URL
        return STATS_URL

    async def _version(self) -> str:
        from .api import _version
        return await _version(self.hass)

    def _modules(self) -> list[str]:
        mgr = self.hass.data.get(DOMAIN, {}).get("wasser")
        try:
            return active_modules(mgr.modules["on"]) if mgr is not None else []
        except (AttributeError, KeyError, TypeError):
            return []

    def _rec(self, survey: dict[str, Any]) -> dict[str, Any]:
        """Eigener Stand zu einer Umfrage. Neue Fragen (andere Revision) = von vorn; der Zufallscode bleibt."""
        r = self.recs.get(survey["id"])
        if r is None or r.get("rev") != survey["rev"]:
            r = {"rid": (r or {}).get("rid") or str(uuid.uuid4()), "rev": survey["rev"]}
            self.recs[survey["id"]] = r
        r["title"], r["ts"] = survey["title"], r.get("ts") or time.time()
        return r

    def _find(self, sid: Any) -> dict[str, Any] | None:
        return next((s for s in self.list if s["id"] == sid), None)

    async def _visible(self) -> list[dict[str, Any]]:
        ver, mods = await self._version(), self._modules()
        return [s for s in self.list if L.matches(s, channel_of(ver), mods)]

    # ------------------------------------------------------------ Werte für das Panel
    async def snapshot(self) -> dict[str, Any]:
        ver, now = await self._version(), time.time()
        vis = await self._visible() if self.on else []
        items = []
        for s in vis:
            r = self.recs.get(s["id"]) or {}
            r = r if r.get("rev") == s["rev"] else {}
            st = L.status_of(s, r)
            item = {k: s[k] for k in ("id", "rev", "state", "title", "questions", "from", "to", "popup")}
            item.update({
                "status": st, "mine": r.get("answers"), "sent": float(r.get("sent") or 0), "busy": s["id"] in self._busy,
                "card": st in ("open", "pending") and now >= float(r.get("card_next") or 0),
                "dot": st in ("open", "pending"),
            })
            # Ergebnis (falls freigegeben) erst nach der eigenen Antwort oder nach dem Ende
            item["result"] = s.get("result") if st in ("answered", "ended") else None
            items.append(item)
        return {
            "ok": True, "on": self.on, "popup": self.popup, "surveys": items, "version": ver, "channel": channel_of(ver),
            "prompt": L.popup_pick(vis, self.recs, now, self.last_popup) if self.popup else "",
            "mine": sum(1 for r in self.recs.values() if r.get("sent") or r.get("maybe")),
            "last_ok": self.last_ok, "err": self.err, "code": self.code, "now": now,
        }

    # ------------------------------------------------------------ Abruf
    async def _request(self, method: str, path: str, body: dict[str, Any] | None = None, params: dict[str, str] | None = None) -> tuple[int, Any]:
        """(Status, JSON) – Status 0 = nicht erreichbar."""
        try:
            sess = async_get_clientsession(self.hass)
            kw: dict[str, Any] = {"timeout": aiohttp.ClientTimeout(total=TIMEOUT), "headers": {"User-Agent": AGENT}}
            if body is not None:  # UTF-8 statt \u-Folgen, damit 500 Zeichen sicher in 4 KB passen
                kw["data"] = json.dumps(body, ensure_ascii=False, separators=(",", ":")).encode()
                kw["headers"]["content-type"] = "application/json"
            if params:
                kw["params"] = params
            async with sess.request(method, self.url + path, **kw) as r:
                raw = await r.content.read(MAX_BYTES + 1)
                while len(raw) <= MAX_BYTES and (more := await r.content.read(MAX_BYTES + 1 - len(raw))):
                    raw += more
                data = None
                if len(raw) <= MAX_BYTES:
                    try:
                        data = json.loads(raw)
                    except ValueError:
                        data = None
                return r.status, data
        except (aiohttp.ClientError, asyncio.TimeoutError, OSError, ValueError):
            return 0, None

    async def async_fetch(self) -> bool:
        if not self.on or self._fetching:
            return False
        self._fetching = True
        try:
            self.last_try = time.time()
            status, data = await self._request("GET", "/v1/surveys", params={"test": self.code} if self.code else None)
            lst = L.clean_list(data) if status == 200 else None
            if not self.on:  # inzwischen ausgeschaltet
                return False
            if lst is None:
                self.err = "offline" if status == 0 else "noch nicht" if status == 404 else f"http{status}"
                self._save()
                return False
            self.list, self.last_ok, self.err = lst, self.last_try, ""
            self._prune()
            self._save()
            return True
        finally:
            self._fetching = False

    def _prune(self) -> None:
        """Sehr alte Einträge ohne Umfrage in der Liste vergessen."""
        ids, now = {s["id"] for s in self.list}, time.time()
        for sid, r in list(self.recs.items()):
            if sid in ids:
                continue
            last = max(float(r.get("sent") or 0), float(r.get("ts") or 0))
            if not (r.get("sent") or r.get("maybe")) or now - last > L.KEEP:
                del self.recs[sid]

    async def _tick(self, _now: Any = None) -> None:
        if self.on and L.is_due(time.time(), self.last_ok, self.last_try):
            await self.async_fetch()

    # ------------------------------------------------------------ Einstellungen
    async def async_opts(self, on: bool | None = None, popup: bool | None = None) -> None:
        if popup is not None:
            self.popup = bool(popup)
        fetch = False
        if on is not None and bool(on) != self.on:
            self.on = bool(on)
            if self.on:
                fetch = True
            else:  # nichts mehr zeigen und nichts mehr abrufen; eigene Zufallscodes bleiben zum Löschen
                self.list, self.last_ok, self.last_try, self.err = [], 0.0, 0.0, ""
        self._save()
        if fetch:
            await self.async_fetch()

    async def async_set_code(self, code: str) -> dict[str, Any]:
        """Testcode speichern (leer = löschen) und sofort neu abrufen. Test-Popups dürfen dann wieder erscheinen."""
        c = L.clean_code(code)
        if code.strip() and not c:
            return {"error": "code"}
        self.code = c
        self._save()
        return await self.async_refresh()

    async def async_refresh(self) -> dict[str, Any]:
        ok = await self.async_fetch()
        if ok and self.code:
            for s in self.list:
                if s["state"] == "test" and (r := self.recs.get(s["id"])):
                    for k in ("popups", "popup_next", "card_next", "declined"):
                        r.pop(k, None)
            self._save()
        return {"fetched": ok, "tests": sum(1 for s in self.list if s["state"] == "test")}

    # ------------------------------------------------------------ Popup und Karte
    def shown(self, sid: str) -> None:
        """Das Popup ist erschienen – zählt für „höchstens zweimal“ und den Wochenabstand."""
        if s := self._find(sid):
            r, now = self._rec(s), time.time()
            r["popups"] = int(r.get("popups") or 0) + 1
            r["popup_next"] = now + L.POPUP_AGAIN
            if s["state"] != "test":
                self.last_popup = now
            self._save()

    def later(self, sid: str) -> None:
        """„Später“ auf der Karte der Startseite. (Beim Popup genügt das Schließen – „shown“ hat den Abstand gesetzt.)"""
        if s := self._find(sid):
            self._rec(s)["card_next"] = time.time() + L.CARD_SNOOZE
            self._save()

    def never(self, sid: str) -> None:
        if s := self._find(sid):
            self._rec(s)["declined"] = True
            self._save()

    # ------------------------------------------------------------ Antworten
    async def async_answer(self, sid: str, answers: Any) -> dict[str, Any]:
        s = self._find(sid)
        if s is None or not self.on:
            return {"sent": False, "error": "unbekannt"}
        if s["state"] == "beendet":
            return {"sent": False, "error": "beendet"}
        a = L.check_answers(s["questions"], answers)
        if a is None:
            return {"sent": False, "error": "antworten"}
        r = self._rec(s)
        r["answers"], r["pending"] = a, True
        r.pop("declined", None)
        r.pop("card_next", None)  # kommt die Antwort nicht an, zeigt die Karte das wieder
        self._save()
        return await self.async_send(sid)

    async def async_send(self, sid: str) -> dict[str, Any]:
        """Gespeicherte Antworten senden (auch „Erneut senden“)."""
        s = self._find(sid)
        r = self.recs.get(sid)
        if s is None or r is None or r.get("rev") != s["rev"] or not r.get("answers") or not self.on:
            return {"sent": False, "error": "unbekannt"}
        if sid in self._busy:
            return {"sent": False, "error": "laeuft"}
        self._busy.add(sid)
        try:
            ver = await self._version()
            body: dict[str, Any] = {"schema": L.SCHEMA, "survey": sid, "rev": s["rev"], "rid": r["rid"], "version": ver,
                                    "channel": channel_of(ver), "answers": r["answers"]}
            if s["state"] == "test" and self.code:
                body["test"] = self.code
            r["maybe"] = True  # ab jetzt könnte der Server etwas haben → beim Löschen mitnehmen
            status, data = await self._request("POST", "/v1/surveys/answer", body)
            if status == 200:
                r.update(sent=time.time(), pending=False)
                s = self._find(sid) or s  # die Liste kann inzwischen neu geholt worden sein
                res = L.clean_result(data.get("result") if isinstance(data, dict) else None, s["questions"])
                if res:
                    s["result"] = res
                else:
                    s.pop("result", None)
                self._save()
                return {"sent": True}
            why = data.get("error") if isinstance(data, dict) else ""
            error = {0: "offline", 404: "unbekannt", 409: "veraltet", 410: "beendet", 413: "abgelehnt", 400: "abgelehnt"}.get(status) \
                or ("voll" if why == "voll" else "kurz" if status == 429 else "offline")
            if error in ("unbekannt", "veraltet", "beendet"):
                r["pending"] = False
                self._save()
                await self.async_fetch()
            else:
                r["pending"] = error not in ("abgelehnt", "voll")
                self._save()
            return {"sent": False, "error": error}
        finally:
            self._busy.discard(sid)

    async def _forget(self, sid: str, rid: str) -> bool:
        status, _ = await self._request("POST", "/v1/surveys/forget", {"survey": sid, "rid": rid})
        return status == 200

    async def async_withdraw(self, sid: str) -> dict[str, Any]:
        """Eigene Antwort zurückziehen: auf dem Server löschen, dann hier. Die Umfrage drängt sich danach nicht mehr auf."""
        r = self.recs.get(sid)
        if r is None:
            return {"withdrawn": False}
        if sid in self._busy:  # erst fertig senden lassen, sonst bliebe die Antwort unlöschbar auf dem Server
            return {"withdrawn": False, "error": "laeuft"}
        if (r.get("sent") or r.get("maybe")) and not await self._forget(sid, r["rid"]):
            return {"withdrawn": False, "error": "offline"}
        for k in ("answers", "pending", "sent", "maybe"):
            r.pop(k, None)
        r["declined"] = True
        r["rid"] = str(uuid.uuid4())
        self._save()
        return {"withdrawn": True}

    async def async_forget_all(self) -> dict[str, Any]:
        """„Meine Antworten auf dem Server löschen“ – alle, auch zu beendeten Umfragen."""
        done = failed = 0
        for sid, r in list(self.recs.items()):
            if not (r.get("sent") or r.get("maybe") or r.get("pending")):
                continue
            res = await self.async_withdraw(sid)
            done, failed = done + bool(res["withdrawn"]), failed + (not res["withdrawn"])
        return {"deleted": done, "failed": failed}
