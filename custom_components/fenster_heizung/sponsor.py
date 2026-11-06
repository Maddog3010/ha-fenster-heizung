"""Sponsor-Bereich: Schlüssel prüfen und Sponsoren verwalten.

Ein Schlüssel ist ein kurzer Text mit digitaler Unterschrift (Ed25519). Die Integration prüft die Unterschrift mit dem
öffentlichen Schlüssel unten, ganz ohne Server. Erzeugen kann einen Schlüssel nur, wer den privaten Schlüssel hat. Der
private Schlüssel gehört dem Entwickler und liegt nie im Repo. Wer ihn im Sponsor-Bereich einträgt, bekommt die Verwaltung.

Schlüsselformat: "FH1-" + base64url(Daten als JSON) + "." + base64url(Unterschrift).
Daten: n = Name, s = Stufe (sponsor oder max), b = gültig bis (JJJJ-MM-TT), i = Nummer, a = ausgestellt am,
sb = nur bei Max: bis wann danach noch „Sponsor“ gilt (das Sponsor-Jahr). Schlüssel ohne s gelten als „sponsor“.
"""
from __future__ import annotations

import base64
import json
import logging
import re
from datetime import date, datetime, timedelta
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.event import async_call_later, async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

SPONSOR_URL = "https://github.com/sponsors/Maddog3010"
PUBLIC_KEY = "Ec624NzE6Y_YndUW4UbMOy3wYiIaNDTa_6URg33a_6Y"
REVOKED_URL = "https://raw.githubusercontent.com/Maddog3010/ha-fenster-heizung/main/sponsor_gesperrt.json"
PREFIX = "FH1-"
PRIV_PREFIX = "FHPRIV1-"
KEY_MAX = 600
ID_RE = re.compile(r"^\d{4}$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
GRADS = ("none", "meer", "abend")
CLOCKS = ("standard", "duenn", "kraeftig", "digital")
SOON_DAYS = 30
SOON_DAYS_MAX = 14
TIERS = ("sponsor", "max")
BADGES = ("heart", "gold")
MAX_SPONSORS = 200


def _b64e(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()


def _b64d(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def _pub():
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
    return Ed25519PublicKey.from_public_bytes(_b64d(PUBLIC_KEY))


def clean_name(v: Any) -> str:
    s = re.sub(r"[\x00-\x1f<>]", "", str(v or "")).strip()
    return s[:40]


def verify_key(key: Any, today: date | None = None, revoked: set[str] | None = None) -> dict[str, Any]:
    """Prüft einen Schlüssel. state: ok, expired, revoked oder invalid."""
    today = today or dt_util.now().date()
    bad = {"state": "invalid", "ok": False}
    if not isinstance(key, str):
        return bad
    key = key.strip()
    if not key.startswith(PREFIX) or len(key) > KEY_MAX or "." not in key:
        return bad
    try:
        body, sig = key[len(PREFIX):].split(".", 1)
        raw = _b64d(body)
        _pub().verify(_b64d(sig), raw)
        d = json.loads(raw.decode())
        bis = str(d["b"])
        if not DATE_RE.match(bis):
            return bad
        until = date.fromisoformat(bis)
        sid = str(d["i"])
        if not ID_RE.match(sid):
            return bad
        name = clean_name(d.get("n"))
        stufe = str(d.get("s") or "sponsor")[:16]
        sb = str(d.get("sb") or "")
        since = str(d.get("a") or "")
    except Exception:  # noqa: BLE001 - jede Abweichung heißt ungültig
        return bad
    tier = stufe if stufe in TIERS else "sponsor"
    out = {"ok": True, "state": "ok", "name": name, "stufe": stufe, "tier": tier, "bis": bis, "id": sid, "days": (until - today).days,
           "since": since if DATE_RE.match(since) else ""}
    if revoked and sid in revoked:
        out.update(ok=False, state="revoked")
    elif until < today:
        # Max abgelaufen: bis zum Ende des Sponsor-Jahres gilt automatisch wieder „Sponsor“
        if tier == "max" and DATE_RE.match(sb) and date.fromisoformat(sb) >= today:
            out.update(tier="sponsor", bis=sb, days=(date.fromisoformat(sb) - today).days, max_ended=bis)
        else:
            out.update(ok=False, state="expired")
    return out


def make_key(priv: str, name: str, bis: str, sid: str, stufe: str = "sponsor", issued: str = "", sb: str = "") -> str:
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
    k = Ed25519PrivateKey.from_private_bytes(_b64d(priv[len(PRIV_PREFIX):]))
    d = {"n": name, "s": stufe, "b": bis, "i": sid, "a": issued}
    if sb:
        d["sb"] = sb
    raw = json.dumps(d, separators=(",", ":"), ensure_ascii=False).encode()
    return PREFIX + _b64e(raw) + "." + _b64e(k.sign(raw))


def priv_matches(priv: Any) -> bool:
    """Passt der private Schlüssel zum öffentlichen im Code?"""
    from cryptography.hazmat.primitives import serialization as S
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
    try:
        if not isinstance(priv, str) or not priv.startswith(PRIV_PREFIX) or len(priv) > 100:
            return False
        k = Ed25519PrivateKey.from_private_bytes(_b64d(priv.strip()[len(PRIV_PREFIX):]))
        pub = k.public_key().public_bytes(S.Encoding.Raw, S.PublicFormat.Raw)
        return _b64e(pub) == PUBLIC_KEY
    except Exception:  # noqa: BLE001
        return False


def default_prefs() -> dict[str, Any]:
    return {"badge": True, "grad": "none", "clock": "standard", "early": False, "badge_style": "gold", "name_head": False, "brief": True, "poster": True}


def clean_prefs(raw: Any, old: dict[str, Any] | None = None) -> dict[str, Any]:
    out = dict(old or default_prefs())
    raw = raw if isinstance(raw, dict) else {}
    if isinstance(raw.get("badge"), bool):
        out["badge"] = raw["badge"]
    if isinstance(raw.get("early"), bool):
        out["early"] = raw["early"]
    if raw.get("grad") in GRADS:
        out["grad"] = raw["grad"]
    if raw.get("clock") in CLOCKS:
        out["clock"] = raw["clock"]
    if raw.get("badge_style") in BADGES:
        out["badge_style"] = raw["badge_style"]
    for k in ("name_head", "brief", "poster"):
        if isinstance(raw.get(k), bool):
            out[k] = raw[k]
    for k, v in default_prefs().items():
        out.setdefault(k, v)
    return out


def _plus_months(d: date, n: int) -> date:
    m = d.month - 1 + n
    y, m = d.year + m // 12, m % 12 + 1
    for day in (d.day, 30, 29, 28):
        try:
            return d.replace(year=y, month=m, day=day)
        except ValueError:
            continue
    return d


def _plus_year(d: date) -> date:
    try:
        return d.replace(year=d.year + 1)
    except ValueError:  # 29. Februar
        return d.replace(year=d.year + 1, day=28)


class SponsorManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store = Store(hass, 1, "fenster_heizung_sponsor")
        self.key = ""
        self.priv = ""
        self.sponsors: list[dict[str, Any]] = []
        self.remote_revoked: list[str] = []
        self.remote_ts = 0.0
        self.prefs = default_prefs()
        self.notify_soon = False  # Verwaltung: Meldung, wenn ein Schlüssel bald abläuft
        self._soon_day = ""
        self.dev_off = False  # Entwickler-Zugang zum Testen aus: alles wirkt wie ohne Sponsoring, die Verwaltung bleibt erreichbar
        self._unsubs: list[CALLBACK_TYPE] = []

    async def async_start(self) -> None:
        d = await self._store.async_load()
        if isinstance(d, dict):
            self.key = str(d.get("key") or "")[:KEY_MAX]
            p = str(d.get("priv") or "")
            self.priv = p if priv_matches(p) else ""
            self.prefs = clean_prefs(d.get("prefs"))
            self.dev_off = bool(d.get("dev_off", False))
            self.notify_soon = bool(d.get("notify_soon", False))
            self.remote_revoked = [x for x in (d.get("remote_revoked") or []) if isinstance(x, str) and ID_RE.match(x)]
            self.remote_ts = float(d.get("remote_ts") or 0)
            for s in (d.get("sponsors") or [])[:MAX_SPONSORS]:
                if isinstance(s, dict) and ID_RE.match(str(s.get("id", ""))) and verify_key(s.get("key"), date(2000, 1, 1))["ok"]:
                    self.sponsors.append({
                        "id": s["id"], "name": clean_name(s.get("name")), "bis": str(s.get("bis")), "since": str(s.get("since") or ""),
                        "note": str(s.get("note") or "")[:120], "danke": bool(s.get("danke")), "key": s["key"],
                        "revoked": bool(s.get("revoked")), "revoked_at": str(s.get("revoked_at") or ""),
                        "stufe": s.get("stufe") if s.get("stufe") in TIERS else "sponsor", "sb": str(s.get("sb") or ""),
                    })
        self._unsubs.append(async_call_later(self.hass, 30, self._refresh_cb))
        self._unsubs.append(async_track_time_interval(self.hass, self._refresh_cb, timedelta(hours=24)))

    def async_stop(self) -> None:
        for u in self._unsubs:
            u()
        self._unsubs = []

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {
            "key": self.key, "priv": self.priv, "prefs": self.prefs, "sponsors": self.sponsors,
            "remote_revoked": self.remote_revoked, "remote_ts": self.remote_ts, "dev_off": self.dev_off, "notify_soon": self.notify_soon,
        }, 2)

    # ------------------------------------------------------------ Sperrliste
    async def _soon_check(self) -> None:
        """Einmal am Tag: Meldung in Home Assistant, wenn Sponsor-Schlüssel bald ablaufen (nur mit Verwaltung)."""
        today = dt_util.now().date().isoformat()
        if not (self.priv and self.notify_soon) or self._soon_day == today:
            return
        self._soon_day = today
        soon = [i for i in self.admin_list()["items"] if i["state"] == "soon"]
        if soon:
            txt = "\n".join(f"- {i['name']} ({'★ Max' if i['stufe'] == 'max' else '♥ Sponsor'}): bis {i['bis']}" for i in soon)
            await self.hass.services.async_call("persistent_notification", "create", {
                "notification_id": "fenster_heizung_sponsor_soon", "title": "Strom & Wärme: Sponsor-Schlüssel laufen bald ab",
                "message": txt + "\n\nVerlängern: Sponsor-Lounge → Sponsoren verwalten."}, blocking=False)

    async def _refresh_cb(self, _now: Any = None) -> None:
        try:
            await self._soon_check()
        except Exception:  # noqa: BLE001 - die Meldung ist nur ein Zusatz
            _LOGGER.debug("Ablauf-Meldung fehlgeschlagen", exc_info=True)
        await self.async_refresh_revoked()

    async def async_refresh_revoked(self) -> bool:
        try:
            session = async_get_clientsession(self.hass)
            async with session.get(REVOKED_URL, timeout=15) as r:
                if r.status != 200:
                    return False
                d = json.loads(await r.text())
            ids = [x for x in (d.get("gesperrt") or []) if isinstance(x, str) and ID_RE.match(x)][:1000]
        except Exception as err:  # noqa: BLE001 - ohne GitHub bleibt alles wie es war
            _LOGGER.debug("Sperrliste nicht geladen: %s", err)
            return False
        self.remote_revoked = ids
        self.remote_ts = dt_util.utcnow().timestamp()
        self._save()
        return True

    def revoked_ids(self) -> set[str]:
        return set(self.remote_revoked) | {s["id"] for s in self.sponsors if s["revoked"]}

    # ------------------------------------------------------------ Abfragen
    def status(self) -> dict[str, Any]:
        if not self.key:
            return {"state": "none", "ok": False}
        return verify_key(self.key, None, set(self.remote_revoked))

    def snapshot(self, admin: bool = False) -> dict[str, Any]:
        st = self.status()
        active = bool(st.get("ok"))
        if not active and self.priv and not self.dev_off:
            st = {"state": "dev", "ok": True, "name": "Entwickler", "bis": "", "days": None, "tier": "max"}
            active = True
        tier = st.get("tier", "sponsor") if active else ""
        out: dict[str, Any] = {
            "url": SPONSOR_URL, "state": st["state"], "active": active, "name": st.get("name", ""), "tier": tier,
            "since": st.get("since", ""), "max_ended": st.get("max_ended", ""), "notify_soon": self.notify_soon,
            "bis": st.get("bis", ""), "days": st.get("days"),
            "prefs": self.prefs if active else default_prefs(),
            "saved_prefs": self.prefs, "manage": bool(self.priv), "dev_off": bool(self.priv and self.dev_off),
        }
        if admin and self.priv:
            out["soon"] = len([s for s in self.admin_list()["items"] if s["state"] == "soon"])
        return out

    def _item_state(self, s: dict[str, Any], today: date) -> tuple[str, int]:
        days = (date.fromisoformat(s["bis"]) - today).days
        if s["revoked"] or s["id"] in self.remote_revoked:
            return "revoked", days
        if days < 0:
            return "expired", days
        if days <= (SOON_DAYS_MAX if s.get("stufe") == "max" else SOON_DAYS):
            return "soon", days
        return "ok", days

    def admin_list(self) -> dict[str, Any]:
        today = dt_util.now().date()
        items = []
        for s in sorted(self.sponsors, key=lambda x: x["name"].lower()):
            state, days = self._item_state(s, today)
            items.append({**s, "state": state, "days": days})
        count = {k: len([i for i in items if i["state"] == k]) for k in ("ok", "soon", "expired", "revoked")}
        count["max"] = len([i for i in items if i.get("stufe") == "max" and i["state"] in ("ok", "soon")])
        revoked = sorted(self.revoked_ids())
        return {
            "setup": False, "items": items, "count": count,
            "revoked_json": json.dumps({"gesperrt": revoked}, ensure_ascii=False),
            "danke": [i["name"] for i in items if i["danke"] and i["state"] in ("ok", "soon")],
        }

    # ------------------------------------------------------------ Änderungen (Nutzer)
    def redeem(self, key: Any) -> dict[str, Any]:
        st = verify_key(key, None, self.revoked_ids())
        if st["state"] in ("invalid", "revoked"):
            return st
        self.key = str(key).strip()
        self._save()
        return st

    def clear(self) -> None:
        self.key = ""
        self._save()

    def set_prefs(self, raw: Any) -> dict[str, Any]:
        self.prefs = clean_prefs(raw, self.prefs)
        self._save()
        return self.prefs

    # ------------------------------------------------------------ Änderungen (Verwaltung)
    def setup(self, priv: Any) -> bool:
        p = str(priv or "").strip()
        if not priv_matches(p):
            return False
        self.priv = p
        self._save()
        return True

    def set_notify_soon(self, on: bool) -> None:
        self.notify_soon = bool(on)
        self._soon_day = ""
        self._save()

    def is_max(self) -> bool:
        snap = self.snapshot()
        return bool(snap["active"] and snap["tier"] == "max")

    def set_dev_off(self, off: bool) -> None:
        self.dev_off = bool(off)
        self._save()

    def forget_priv(self) -> None:
        self.priv = ""
        self._save()

    def _next_id(self) -> str:
        used = {int(s["id"]) for s in self.sponsors}
        n = 1
        while n in used:
            n += 1
        return f"{n:04d}"

    def create(self, name: str, bis: str = "", note: str = "", danke: bool = False, stufe: str = "sponsor") -> dict[str, Any]:
        stufe = stufe if stufe in TIERS else "sponsor"
        if not self.priv:
            return {"ok": False, "error": "no_priv"}
        name = clean_name(name)
        if not name:
            return {"ok": False, "error": "name"}
        if len(self.sponsors) >= MAX_SPONSORS:
            return {"ok": False, "error": "too_many"}
        today = dt_util.now().date()
        if bis:
            if not DATE_RE.match(bis):
                return {"ok": False, "error": "date"}
            try:
                until = date.fromisoformat(bis)
            except ValueError:
                return {"ok": False, "error": "date"}
        else:
            until = _plus_months(today, 3) if stufe == "max" else _plus_year(today)
        if until < today:
            return {"ok": False, "error": "date"}
        sid = self._next_id()
        sb = _plus_year(today).isoformat() if stufe == "max" else ""
        key = make_key(self.priv, name, until.isoformat(), sid, stufe=stufe, issued=today.isoformat(), sb=sb)
        self.sponsors.append({
            "id": sid, "name": name, "bis": until.isoformat(), "since": today.isoformat(), "note": str(note or "")[:120],
            "danke": bool(danke), "key": key, "revoked": False, "revoked_at": "", "stufe": stufe, "sb": sb,
        })
        self._save()
        return {"ok": True, "id": sid, "key": key}

    def _find(self, sid: str) -> dict[str, Any] | None:
        return next((s for s in self.sponsors if s["id"] == sid), None)

    def extend(self, sid: str) -> dict[str, Any]:
        s = self._find(sid)
        if s is None or not self.priv:
            return {"ok": False, "error": "unknown"}
        today = dt_util.now().date()
        base = max(date.fromisoformat(s["bis"]), today)
        mx = s.get("stufe") == "max"
        until = _plus_months(base, 3) if mx else _plus_year(base)
        s["bis"] = until.isoformat()
        if mx and (not s.get("sb") or date.fromisoformat(s["sb"]) < until):
            s["sb"] = _plus_year(today).isoformat()
        s["key"] = make_key(self.priv, s["name"], s["bis"], s["id"], stufe=s.get("stufe", "sponsor"), issued=s.get("since") or today.isoformat(), sb=s.get("sb", "") if mx else "")
        self._save()
        return {"ok": True, "id": sid, "key": s["key"]}

    def revoke(self, sid: str, on: bool = True) -> bool:
        s = self._find(sid)
        if s is None:
            return False
        s["revoked"] = bool(on)
        s["revoked_at"] = dt_util.now().date().isoformat() if on else ""
        self._save()
        return True

    def set_danke(self, sid: str, on: bool) -> bool:
        s = self._find(sid)
        if s is None:
            return False
        s["danke"] = bool(on)
        self._save()
        return True

    def remove(self, sid: str) -> bool:
        n = len(self.sponsors)
        self.sponsors = [s for s in self.sponsors if s["id"] != sid]
        self._save()
        return len(self.sponsors) != n
