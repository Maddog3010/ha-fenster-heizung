"""Fehler-Statistik Build 1: Programmfehler von Strom & Wärme lokal sammeln (Fehlerprotokoll in Einstellungen → System).

Quellen:
- Backend: Meldungen ab „Fehler“ aus dem Logger von Strom & Wärme und jede Ausnahme, deren Stapel durch Code von
  Strom & Wärme läuft (auch wenn Home Assistant sie protokolliert, z. B. „Error handling message“).
- Befehle und Oberfläche: meldet das Dashboard über fenster_heizung/err_report (Schema-Fehler wie „expected str at 'id'“,
  unbekannte Befehle, Anzeigefehler).
Nur Programmfehler – keine Geräte-Diagnose. Alles wird bereinigt (fehler_logic.sanitize) und bleibt in Build 1 lokal.

Build 6 (Statistik): Mit Zustimmung geht einmal am Tag ein Bericht raus – auch ohne Fehler („0 Fehler“), mit Version, Kanal,
Home-Assistant-Version und den Kurzzeichen der aktiven Module. Daraus entstehen Fehlerquote je Version und Fehler je Modul.
"""
from __future__ import annotations

import asyncio
import logging
import random
import threading
import time
import traceback
import uuid
from datetime import timedelta
from typing import Any

import aiohttp
from homeassistant.const import __version__ as HA_VERSION
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.event import async_call_later, async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from . import fehler_logic as L
from .const import DOMAIN

_PKG = "custom_components.fenster_heizung"
REPORT_LIMIT = 30          # Meldungen aus der Oberfläche je Stunde
_SELF = "fehler.py"
TIMEOUT = 10
DEFAULT_URL = "https://stats.stromwaerme.dev"   # Cloudflare-Worker (Build 3: POST /v1/errors, /v1/errors/forget)


def _our_frame(tb) -> tuple[str, int, str] | None:
    """Innerste Stelle im Stapel, die zu Strom & Wärme gehört."""
    best = None
    for fr in traceback.extract_tb(tb):
        p = fr.filename.replace("\\", "/")
        if "/fenster_heizung/" in p and not p.endswith("/" + _SELF):
            best = (p, fr.lineno or 0, fr.name)
    return best


class _Handler(logging.Handler):
    def __init__(self, owner: "FehlerSammler") -> None:
        super().__init__(level=logging.WARNING)
        self.owner = owner

    def emit(self, record: logging.LogRecord) -> None:   # läuft auch in Hilfs-Threads
        try:
            if getattr(record, "_fh_err", False):
                return
            ours = record.name.startswith(_PKG)
            exc = record.exc_info[1] if record.exc_info and record.exc_info[1] is not None else None
            fr = _our_frame(record.exc_info[2]) if exc is not None else None
            if exc is None and not (ours and record.levelno >= logging.ERROR):
                return                                   # Warnungen ohne Ausnahme sind keine Programmfehler
            if exc is not None and not ours and fr is None:
                return                                   # Ausnahme ohne Bezug zu Strom & Wärme
            if fr is None and ours:
                fr = (record.pathname, record.lineno, record.funcName)
            if fr and fr[0].replace("\\", "/").endswith("/" + _SELF):
                return
            where = L.where_of(fr[0], fr[1], fr[2]) if fr else ""
            kind = type(exc).__name__ if exc is not None else ("Fehler" if record.levelno >= logging.ERROR else "Warnung")
            msg = str(exc) if exc is not None else record.getMessage()
            self.owner.record_threadsafe("backend", kind, where, msg)
        except Exception:  # noqa: BLE001 - der Sammler darf nie selbst stören
            pass


class FehlerSammler:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store = Store(hass, 1, f"{DOMAIN}_fehler")
        self._st: dict[str, Any] = L.empty()
        self._lock = threading.Lock()
        self._handler: _Handler | None = None
        self._version = ""
        self._rep: list[float] = []
        self._unsubs: list = []
        self._busy = False

    async def async_start(self) -> None:
        try:
            self._st = L.clean(await self._store.async_load())
        except Exception:  # noqa: BLE001
            self._st = L.empty()
        try:
            from .api import _version
            self._version = await _version(self.hass)
        except Exception:  # noqa: BLE001
            self._version = ""
        L.prune(self._st, dt_util.now().date())
        self._handler = _Handler(self)
        logging.getLogger().addHandler(self._handler)
        self._unsubs.append(async_call_later(self.hass, random.randint(600, 3600), self._tick))
        self._unsubs.append(async_track_time_interval(self.hass, self._tick, timedelta(minutes=60)))

    @callback
    def async_stop(self) -> None:
        for u in self._unsubs:
            u()
        self._unsubs.clear()
        if self._handler is not None:
            logging.getLogger().removeHandler(self._handler)
            self._handler = None
        self._store.async_delay_save(lambda: self._st, 0)

    # ---- Eintragen
    def record_threadsafe(self, src: str, kind: str, where: str, msg: str, cmd: str = "", dev: str = "") -> None:
        with self._lock:
            L.add(self._st, src=src, kind=kind, where=where, msg=msg, today=dt_util.now().date(), version=self._version,
                  ha=HA_VERSION, cmd=cmd, dev=dev)
        try:
            self.hass.loop.call_soon_threadsafe(self._save)
        except RuntimeError:
            pass

    @callback
    def _save(self) -> None:
        self._store.async_delay_save(lambda: self._st, 10)

    def report(self, src: str, kind: str, where: str, msg: str, cmd: str = "", dev: str = "") -> bool:
        """Meldung aus der Oberfläche (Befehl oder Anzeige). Begrenzt, damit ein Fehler in einer Schleife nichts flutet."""
        now = time.monotonic()
        self._rep = [t for t in self._rep if now - t < 3600]
        if len(self._rep) >= REPORT_LIMIT or src not in ("befehl", "oberflaeche"):
            return False
        self._rep.append(now)
        self.record_threadsafe(src, kind, where, msg, cmd=cmd, dev=dev)
        return True

    # ---- Ansehen
    def snapshot(self) -> dict[str, Any]:
        with self._lock:
            items = [dict(e, text=L.as_text(e)) for e in L.view(self._st)]
            c = dict(self._st["cfg"])
            rep = L.build_report(self._st, self._version, HA_VERSION, real=c["on"], mods=self._mods()) or {}
        sts = self.hass.data.get(DOMAIN, {}).get("stats")
        return {"items": items, "version": self._version, "ha": HA_VERSION, "keep_days": L.KEEP_DAYS,
                "cfg": {"asked": c["asked"], "on": c["on"], "id": (c["id"][:4] + "…" + c["id"][-4:]) if c["id"] else "",
                        "last_ok": c["last_ok"], "last_try": c["last_try"], "err": c["err"], "skip": c["skip"],
                        "next": (max(c["last_ok"], c["last_try"]) + L.INTERVAL) if c["on"] else 0,
                        "stats_on": bool(sts is not None and getattr(sts, "on", False)), "channel": L.channel_of(self._version)},
                "report": rep, "now": time.time()}

    async def async_clear(self, fp: str = "") -> dict[str, Any]:
        with self._lock:
            if fp:
                self._st["items"].pop(fp, None)
            else:
                self._st["items"] = {}
        await self._store.async_save(self._st)
        return self.snapshot()

    # ---- Build 2: Fehlerberichte senden (eigene Zustimmung, eigene Kennung)
    @property
    def url(self) -> str:
        sts = self.hass.data.get(DOMAIN, {}).get("stats")
        return str(getattr(sts, "url", "") or DEFAULT_URL).rstrip("/")   # Entwickler-Testserver aus der Versions-Statistik gilt mit

    def _cfg_save(self) -> None:
        self._store.async_delay_save(lambda: self._st, 1)

    async def async_answer(self, on: bool) -> dict[str, Any]:
        """Zustimmung aus der Nachfrage oder dem Schalter. „Nein“ erzeugt nie eine Kennung; „Aus“ löscht auch auf dem Server."""
        c = self._st["cfg"]
        c["asked"] = True
        if on and not c["on"]:
            c.update(on=True, id=str(uuid.uuid4()), last_ok=0.0, last_try=0.0, err="")
            self._unsubs.append(async_call_later(self.hass, 60, self._tick))   # erster Bericht kurz danach (falls es Fehler gibt)
            self._cfg_save()
        elif not on and c["on"]:
            return await self.async_forget()
        else:
            self._cfg_save()
        return self.snapshot()

    async def async_skip(self, fp: str, skip: bool) -> dict[str, Any]:
        """„Weglassen“: dieser Fehler wird nie gesendet (bleibt im Protokoll)."""
        c = self._st["cfg"]
        s = [x for x in c["skip"] if x != fp]
        c["skip"] = (s + [fp])[-L.MAX_ENTRIES:] if skip else s
        self._cfg_save()
        return self.snapshot()

    def _mods(self) -> list[str]:
        """Aktive Module als Kurzzeichen (Build 6, für „Fehler je Modul“). Fehlt etwas, ist die Liste eben kürzer."""
        d = self.hass.data.get(DOMAIN, {})
        on: Any = {}
        try:
            on = d["wasser"].modules["on"]
        except (KeyError, AttributeError, TypeError):
            pass
        return L.active_mods(on, getattr(d.get("addons"), "inst", None))

    async def _post(self, path: str, body: dict[str, Any]) -> int:
        try:
            sess = async_get_clientsession(self.hass)
            async with sess.post(self.url + path, json=body, timeout=aiohttp.ClientTimeout(total=TIMEOUT)) as r:
                return r.status
        except (aiohttp.ClientError, asyncio.TimeoutError, OSError, ValueError):
            return 0

    async def async_send(self, force: bool = False) -> dict[str, Any]:
        """Bericht senden – nur wenn eingeschaltet. Build 6: auch ohne neue Fehler (Tages-Meldung „0 Fehler“)."""
        c = self._st["cfg"]
        if not c["on"] or self._busy:
            return {"sent": False, "why": "aus" if not c["on"] else "läuft"}
        mods = self._mods()
        with self._lock:
            rep = L.build_report(self._st, self._version, HA_VERSION, mods=mods)
        if not rep:
            return {"sent": False, "why": "aus"}
        self._busy = True
        try:
            st = await self._post("/v1/errors", rep)
            now = time.time()
            if 200 <= st < 300:
                with self._lock:
                    L.mark_sent(self._st, rep, now)
            else:
                c["last_try"] = now
                c["err"] = "offline" if st == 0 else "noch nicht" if st == 404 else "zu oft" if st == 429 else f"http{st}"
            self._cfg_save()
            return {"sent": 200 <= st < 300, "n": len(rep["errors"]), "why": c["err"]}
        finally:
            self._busy = False

    async def async_forget(self) -> dict[str, Any]:
        """Server bitten, alle Berichte dieser Kennung zu löschen; dann ausschalten und Kennung vergessen."""
        c = self._st["cfg"]
        ok = True
        if c["id"]:
            st = await self._post("/v1/errors/forget", {"schema": L.SCHEMA, "id": c["id"]})
            ok = 200 <= st < 300
        c.update(on=False, id="", last_ok=0.0, last_try=0.0, err="", asked=True)
        self._cfg_save()
        return {**self.snapshot(), "forgotten": ok}

    async def _tick(self, _now: Any = None) -> None:
        if L.is_due(self._st, time.time()):
            await self.async_send()
