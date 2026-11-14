"""Support-Chat für alle, Sponsor Max bevorzugt (wie WhatsApp, Antworten kommen vom Entwickler über Telegram).

Weg einer Nachricht: Panel → diese Integration → Support-Vermittler (Cloudflare Worker, Ordner
support-worker/ im Repo) → Telegram-Bot → Telegram-App des Entwicklers. Antwortet der Entwickler
in Telegram auf die Nachricht, legt der Vermittler die Antwort ab und diese Integration holt sie ab.

Der Chat steht allen offen. Der Vermittler prüft bei jeder Nachricht, ob ein Sponsoring besteht
(Sponsor-Schlüssel mit Signatur wie in sponsor.py, GitHub-Anmeldung oder – nur für den Entwickler –
Signatur mit dem privaten Verwaltungs-Schlüssel), und kennzeichnet Sponsor bzw. Sponsor Max (bevorzugt).

Gespeichert wird hier: eine zufällige Installations-Nummer mit Geheimnis, der Verlauf (höchstens
200 Nachrichten), ob der Datenschutz-Hinweis bestätigt wurde und wie viele Antworten ungelesen sind.
"""
from __future__ import annotations

import json
import logging
import platform
import secrets
import time
from datetime import timedelta
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.event import async_call_later, async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

# Adresse des Support-Vermittlers (Cloudflare Worker). Leer = Chat ist noch nicht eingerichtet.
SUPPORT_URL = ""
MAX_MSGS = 200
MAX_TEXT = 2000
POLL_BG_MIN = 15  # Hintergrund-Abfrage nach Antworten, in Minuten
PRIVACY_VERSION = 1


class SupportChat:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store = Store(hass, 1, "fenster_heizung_support")
        self.inst = ""
        self.secret = ""
        self.msgs: list[dict[str, Any]] = []
        self.privacy = 0
        self.unread = 0
        self.last_poll = 0.0
        self.url_dev = ""  # nur Entwickler: anderer Vermittler zum Testen
        self.err = ""
        self.notify = True
        self._unsubs: list[CALLBACK_TYPE] = []

    # ------------------------------------------------------------ Start, Speichern
    async def async_start(self) -> None:
        d = await self._store.async_load()
        if isinstance(d, dict):
            self.inst = str(d.get("inst") or "")[:40]
            self.secret = str(d.get("secret") or "")[:80]
            self.msgs = [m for m in (d.get("msgs") or []) if isinstance(m, dict)][-MAX_MSGS:]
            self.privacy = int(d.get("privacy") or 0)
            self.unread = int(d.get("unread") or 0)
            self.url_dev = str(d.get("url_dev") or "")[:200]
            self.notify = bool(d.get("notify", True))
        if not self.inst:
            self.inst = secrets.token_hex(8)
            self.secret = secrets.token_urlsafe(24)
            self._save()
        self._unsubs.append(async_call_later(self.hass, 90, self._bg))
        self._unsubs.append(async_track_time_interval(self.hass, self._bg, timedelta(minutes=POLL_BG_MIN)))

    def async_stop(self) -> None:
        for u in self._unsubs:
            u()
        self._unsubs.clear()

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {
            "inst": self.inst, "secret": self.secret, "msgs": self.msgs[-MAX_MSGS:], "privacy": self.privacy,
            "unread": self.unread, "url_dev": self.url_dev, "notify": self.notify,
        }, 2)

    @property
    def url(self) -> str:
        return (self.url_dev or SUPPORT_URL).rstrip("/")

    # ------------------------------------------------------------ Sponsor-Nachweis
    def _spn(self):
        return self.hass.data.get(DOMAIN, {}).get("sponsor")

    def _proof(self) -> dict[str, Any]:
        """Nachweis für den Vermittler. Ohne Sponsoring: {"kind": "free"} – der Chat ist für alle da."""
        mgr = self._spn()
        if mgr is None:
            return {"kind": "free"}
        st = mgr.combined()
        if st.get("ok"):
            if st.get("source") == "github" and mgr.gh.data.get("token"):
                return {"kind": "github", "token": mgr.gh.data["token"], "tier": st.get("tier", "sponsor"), "name": st.get("name", "")}
            if st.get("source") == "key" and mgr.key:
                return {"kind": "key", "key": mgr.key, "tier": st.get("tier", "sponsor"), "name": st.get("name", "")}
        if mgr.priv and not mgr.dev_off:  # Entwickler zum Testen: Signatur mit dem privaten Schlüssel
            from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
            from .sponsor import PRIV_PREFIX, _b64d, _b64e
            day = dt_util.utcnow().date().isoformat()
            raw = f"chat:{self.inst}:{day}".encode()
            k = Ed25519PrivateKey.from_private_bytes(_b64d(mgr.priv[len(PRIV_PREFIX):]))
            return {"kind": "dev", "day": day, "sig": _b64e(k.sign(raw)), "tier": "max", "name": "Entwickler (Test)"}
        return {"kind": "free"}

    def access(self) -> dict[str, Any]:
        mgr = self._spn()
        snap = mgr.snapshot() if mgr is not None else {"active": False, "tier": ""}
        return {"active": bool(snap.get("active")), "tier": snap.get("tier", ""), "name": snap.get("name", ""),
                "dev": bool(mgr is not None and mgr.priv)}

    # ------------------------------------------------------------ Zustand für das Panel
    def snapshot(self) -> dict[str, Any]:
        return {
            "ready": bool(self.url), "inst": self.inst[:4], "msgs": self.msgs[-MAX_MSGS:], "privacy": self.privacy >= PRIVACY_VERSION,
            "privacy_version": PRIVACY_VERSION, "unread": self.unread, "err": self.err, "last_poll": self.last_poll,
            "access": self.access(), "notify": self.notify, "url_dev": self.url_dev if self.access()["dev"] else "",
        }

    def accept_privacy(self) -> None:
        self.privacy = PRIVACY_VERSION
        self._save()

    def mark_read(self) -> None:
        if self.unread:
            self.unread = 0
            self._save()
            self.hass.async_create_task(self.hass.services.async_call(
                "persistent_notification", "dismiss", {"notification_id": "fenster_heizung_support"}))

    def set_opts(self, notify: bool | None = None, url_dev: str | None = None) -> None:
        if notify is not None:
            self.notify = bool(notify)
        if url_dev is not None and self.access()["dev"]:
            u = str(url_dev).strip()[:200]
            self.url_dev = u if (not u or u.startswith("https://")) else self.url_dev
        self._save()

    # ------------------------------------------------------------ Diagnose
    def diagnose(self) -> dict[str, Any]:
        from homeassistant.const import __version__ as ha_version
        man = {}
        try:
            with open(__file__.rsplit("/", 1)[0] + "/manifest.json", encoding="utf-8") as f:
                man = json.load(f)
        except Exception:  # noqa: BLE001
            pass
        mods: list[str] = []
        try:
            w = self.hass.data.get(DOMAIN, {}).get("wasser")
            if w is not None:
                mods = sorted(str(k) for k, v in ((w.snapshot().get("modules") or {}).get("on") or {}).items() if v)
        except Exception:  # noqa: BLE001
            pass
        errs: list[str] = []
        try:
            sl = self.hass.data.get("system_log")
            recs = list(getattr(sl, "records", {}).values()) if sl is not None else []
            for r in recs:
                d = r.to_dict() if hasattr(r, "to_dict") else {}
                if "fenster_heizung" in str(d.get("name", "")):
                    msg = d.get("message") or [""]
                    errs.append(f"{d.get('level', '')}: {str(msg[0] if isinstance(msg, list) else msg)[:240]} (×{d.get('count', 1)})")
        except Exception:  # noqa: BLE001
            pass
        return {
            "version": man.get("version", "?"), "ha": ha_version, "python": platform.python_version(),
            "module": mods, "fehler": errs[-10:], "sprache": self.hass.config.language, "zeitzone": str(self.hass.config.time_zone),
        }

    # ------------------------------------------------------------ Senden und Abholen
    async def _call(self, path: str, body: dict[str, Any]) -> dict[str, Any]:
        if not self.url:
            return {"ok": False, "error": "not_ready"}
        try:
            session = async_get_clientsession(self.hass)
            async with session.post(self.url + path, json=body, timeout=20) as r:
                data = await r.json(content_type=None)
                if not isinstance(data, dict):
                    return {"ok": False, "error": "bad_reply"}
                if r.status >= 400 and "error" not in data:
                    data["error"] = f"http_{r.status}"
                data.setdefault("ok", r.status < 400)
                return data
        except Exception as e:  # noqa: BLE001
            _LOGGER.debug("Support-Chat: %s", e)
            return {"ok": False, "error": "offline"}

    async def async_send(self, text: str, diag: bool = False) -> dict[str, Any]:
        text = str(text or "").strip()[:MAX_TEXT]
        if not text:
            return {"ok": False, "error": "empty"}
        proof = self._proof()
        if self.privacy < PRIVACY_VERSION:
            return {"ok": False, "error": "privacy"}
        now = time.time()
        mid = secrets.token_hex(6)
        m = {"id": mid, "from": "me", "text": text, "ts": now, "state": "sending", "diag": bool(diag)}
        self.msgs.append(m)
        body = {"inst": self.inst, "secret": self.secret, "id": mid, "text": text, "proof": proof}
        if diag:
            body["diag"] = self.diagnose()
        res = await self._call("/send", body)
        m["state"] = "sent" if res.get("ok") else "failed"
        m["err"] = "" if res.get("ok") else str(res.get("error") or "")[:40]
        self.err = m["err"]
        self.msgs = self.msgs[-MAX_MSGS:]
        self._save()
        return {"ok": bool(res.get("ok")), "error": m["err"]}

    async def async_retry(self, mid: str) -> dict[str, Any]:
        m = next((x for x in self.msgs if x.get("id") == mid and x.get("from") == "me" and x.get("state") == "failed"), None)
        if m is None:
            return {"ok": False, "error": "unknown"}
        self.msgs.remove(m)
        return await self.async_send(m["text"], bool(m.get("diag")))

    def delete_failed(self, mid: str) -> None:
        self.msgs = [x for x in self.msgs if not (x.get("id") == mid and x.get("state") == "failed")]
        self._save()

    async def async_poll(self, opened: bool = False) -> dict[str, Any]:
        if not self.url or not any(x.get("from") == "me" and x.get("state") == "sent" for x in self.msgs):
            return {"ok": True, "new": 0}
        since = max([float(x.get("ts") or 0) for x in self.msgs if x.get("from") == "dev"] or [0])
        res = await self._call("/poll", {"inst": self.inst, "secret": self.secret, "since": since})
        self.last_poll = time.time()
        if not res.get("ok"):
            self.err = str(res.get("error") or "")[:40]
            return {"ok": False, "error": self.err}
        self.err = ""
        known = {x.get("id") for x in self.msgs}
        new = 0
        for r in res.get("msgs") or []:
            if not isinstance(r, dict) or r.get("id") in known:
                continue
            self.msgs.append({"id": str(r.get("id"))[:40], "from": "dev", "text": str(r.get("text") or "")[:4000], "ts": float(r.get("ts") or time.time())})
            new += 1
        seen = float(res.get("seen") or 0)  # bis wann der Entwickler gelesen hat (in Telegram geantwortet)
        for x in self.msgs:
            if x.get("from") == "me" and x.get("state") == "sent" and seen and float(x.get("ts") or 0) <= seen:
                x["state"] = "read"
        if new:
            self.msgs.sort(key=lambda x: float(x.get("ts") or 0))
            self.msgs = self.msgs[-MAX_MSGS:]
            if not opened:
                self.unread += new
                if self.notify:
                    await self.hass.services.async_call("persistent_notification", "create", {
                        "notification_id": "fenster_heizung_support", "title": "Strom & Wärme: Antwort vom Support",
                        "message": f"Du hast {self.unread} neue {'Antwort' if self.unread == 1 else 'Antworten'} im Support-Chat (Sponsor-Lounge → Support)."})
        self._save()
        return {"ok": True, "new": new}

    async def async_clear(self) -> dict[str, Any]:
        """Verlauf hier und beim Vermittler löschen."""
        res = await self._call("/delete", {"inst": self.inst, "secret": self.secret}) if self.url else {"ok": True}
        self.msgs = []
        self.unread = 0
        self._save()
        return {"ok": True, "remote": bool(res.get("ok"))}

    async def _bg(self, _now: Any = None) -> None:
        try:
            await self.async_poll()
        except Exception as e:  # noqa: BLE001
            _LOGGER.debug("Support-Chat Abfrage: %s", e)
