"""Versions-Statistik: freiwillig, anonym, nur Version und Kanal.

Nach ausdrücklicher Zustimmung (Popup oder Einstellungen → System → Versions-Statistik) meldet diese Integration
höchstens einmal pro Tag drei Werte an den Statistik-Server des Entwicklers:

    {"schema": 1, "id": "<zufällige Kennung>", "version": "2026.11.4", "channel": "stable" | "beta"}

Nicht gesendet werden: Name, Standort, Räume, Geräte, Sensorwerte, die Home-Assistant-Instanz-ID. Die Kennung ist eine
zufällige UUID, die erst bei „Ja“ erzeugt wird und mit nichts anderem zusammenhängt. Beim Ausschalten (und bei
„Meine Daten auf dem Server löschen“) wird der Server gebeten, die Kennung zu vergessen, und sie wird hier gelöscht.

Fehler (Server nicht erreichbar, falsche Antwort) werden still ignoriert: Die Integration läuft normal weiter und
versucht es am nächsten Tag erneut. Server: Ordner statistik-server/ im Repository.
"""
from __future__ import annotations

import asyncio
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

from .const import DOMAIN
from .stats_logic import _ID_RE, SCHEMA, active_modules, build_payload, channel_of, is_due, next_due

_LOGGER = logging.getLogger(__name__)

# Adresse des Statistik-Servers (Cloudflare Tunnel zum Container auf dem Proxmox des Entwicklers).
STATS_URL = "https://stats.stromwaerme.dev"
TIMEOUT = 10              # Sekunden
CHECK_MIN = 60            # so oft wird geprüft, ob eine Meldung fällig ist


class VersionStats:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store = Store(hass, 1, "fenster_heizung_stats")
        self.asked = False     # Popup wurde beantwortet oder geschlossen
        self.on = False
        self.id = ""
        self.last_ok = 0.0
        self.last_try = 0.0
        self.err = ""
        self.url_dev = ""      # nur Entwickler: anderer Server zum Testen
        self._busy = False
        self._unsubs: list[CALLBACK_TYPE] = []

    # ------------------------------------------------------------ Start, Speichern
    async def async_start(self) -> None:
        d = await self._store.async_load()
        if isinstance(d, dict):
            self.asked = bool(d.get("asked"))
            self.on = bool(d.get("on"))
            i = str(d.get("id") or "")
            self.id = i if _ID_RE.match(i) else ""
            self.last_ok = float(d.get("last_ok") or 0)
            self.last_try = float(d.get("last_try") or 0)
            self.err = str(d.get("err") or "")[:20]
            self.url_dev = str(d.get("url_dev") or "")[:200]
        if self.on and not self.id:
            self.on = False  # ohne gültige Kennung wird nichts gesendet
        self._unsubs.append(async_call_later(self.hass, random.randint(300, 3000), self._tick))
        self._unsubs.append(async_track_time_interval(self.hass, self._tick, timedelta(minutes=CHECK_MIN)))

    def async_stop(self) -> None:
        for u in self._unsubs:
            u()
        self._unsubs.clear()

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {
            "asked": self.asked, "on": self.on, "id": self.id, "last_ok": self.last_ok, "last_try": self.last_try,
            "err": self.err, "url_dev": self.url_dev,
        }, 1)

    # ------------------------------------------------------------ Werte für das Panel
    @property
    def url(self) -> str:
        return (self.url_dev or STATS_URL).rstrip("/")

    async def _version(self) -> str:
        from .api import _version
        return await _version(self.hass)

    def _modules(self) -> list[str]:
        """Eingeschaltete Module (nur Kurzzeichen). Ohne Modul-Verwaltung: leere Liste."""
        mgr = self.hass.data.get(DOMAIN, {}).get("wasser")
        try:
            return active_modules(mgr.modules["on"]) if mgr is not None else []
        except (AttributeError, KeyError, TypeError):
            return []

    async def snapshot(self) -> dict[str, Any]:
        ver = await self._version()
        pay = build_payload(self.id, ver, self._modules()) if self.on else None
        return {
            "ok": True, "asked": self.asked, "on": self.on, "version": ver, "channel": channel_of(ver),
            "id": (self.id[:4] + "…" + self.id[-4:]) if self.id else "", "last_ok": self.last_ok, "last_try": self.last_try,
            "next": next_due(self.last_ok, self.last_try) if self.on else 0, "err": self.err,
            "url_dev": self.url_dev, "payload": pay or build_payload("7f3c1e9a-4b2d-4c5e-9a1f-2d8b6e0c3a41", ver, self._modules()),
            "payload_real": bool(pay), "now": time.time(),
        }

    # ------------------------------------------------------------ Zustimmung
    async def async_answer(self, on: bool) -> None:
        """Antwort aus dem Popup bzw. der Schalter in den Einstellungen. „Nein“ erzeugt nie eine Kennung."""
        self.asked = True
        if on and not self.on:
            self.id = str(uuid.uuid4())
            self.on = True
            self.err = ""
            self.last_ok = self.last_try = 0.0
            self._save()
            self._unsubs.append(async_call_later(self.hass, 45, self._tick))  # erste Meldung kurz danach
        elif not on and self.on:
            await self.async_forget(keep_asked=True)
        else:
            self._save()

    async def async_reset_id(self) -> None:
        """Neue zufällige Kennung (die alte wird auf dem Server vergessen)."""
        if not self.on:
            return
        old = self.id
        self.id = str(uuid.uuid4())
        self.last_ok = self.last_try = 0.0
        self.err = ""
        self._save()
        await self._post("/v1/forget", {"schema": SCHEMA, "id": old})
        self._unsubs.append(async_call_later(self.hass, 20, self._tick))

    async def async_forget(self, keep_asked: bool = True) -> dict[str, Any]:
        """Server bitten, die Kennung zu vergessen, dann lokal alles löschen und ausschalten."""
        ok = True
        if self.id:
            ok = await self._post("/v1/forget", {"schema": SCHEMA, "id": self.id})
        self.on = False
        self.id = ""
        self.last_ok = self.last_try = 0.0
        self.err = ""
        self.asked = self.asked or keep_asked
        self._save()
        return {"forgotten": ok}

    def set_dev(self, url_dev: str | None) -> None:
        if url_dev is not None:
            u = str(url_dev).strip()[:200]
            self.url_dev = u if u.startswith(("http://", "https://")) else ""
            self._save()

    # ------------------------------------------------------------ Senden
    async def _post(self, path: str, body: dict[str, Any]) -> bool:
        try:
            sess = async_get_clientsession(self.hass)
            async with sess.post(self.url + path, json=body, timeout=aiohttp.ClientTimeout(total=TIMEOUT)) as r:
                return 200 <= r.status < 300
        except (aiohttp.ClientError, asyncio.TimeoutError, OSError, ValueError):
            return False

    async def async_send(self) -> bool:
        if not self.on or self._busy:
            return False
        pay = build_payload(self.id, await self._version(), self._modules())
        if pay is None:
            return False
        self._busy = True
        try:
            self.last_try = time.time()
            ok = await self._post("/v1/ping", pay)
            if ok:
                self.last_ok = self.last_try
                self.err = ""
            else:
                self.err = "offline"
            self._save()
            return ok
        finally:
            self._busy = False

    async def _tick(self, _now: Any = None) -> None:
        if self.on and is_due(time.time(), self.last_ok, self.last_try):
            await self.async_send()
