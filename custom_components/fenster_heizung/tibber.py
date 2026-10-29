"""Tibber: Strompreise direkt über die Tibber-Schnittstelle (nur Preise, keine Verbrauchsdaten)."""
from __future__ import annotations

import asyncio
import logging
import time
from datetime import datetime
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.storage import Store

from .backup import SafeStore
from .const import DOMAIN
from .wallbox_plan import hourly_mean, parse_tibber

_LOGGER = logging.getLogger(__name__)

URL = "https://api.tibber.com/v1-beta/gql"
TIMEOUT_S = 15
CACHE_S = 600
RES = ("h", "q", "lvl")
FIELDS = "total startsAt level"


def _query(quarter: bool) -> str:
    pi = "priceInfo(resolution: QUARTER_HOURLY)" if quarter else "priceInfo"
    return ("{viewer{homes{id appNickname address{address1} currentSubscription{" + pi +
            "{current{" + FIELDS + "} today{" + FIELDS + "} tomorrow{" + FIELDS + "}}}}}}")


class TibberError(Exception):
    """Tibber nicht erreichbar oder Token abgelehnt."""


class TibberManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_tibber")
        self.token = ""
        self.home = ""
        self.res = "h"
        self._cache: dict[str, Any] | None = None
        self._cache_ts = 0.0
        self._err = ""
        self._busy = asyncio.Lock()

    async def async_start(self) -> None:
        d = await self._store.async_load()
        if isinstance(d, dict):
            self.token = str(d.get("token") or "")[:200]
            self.home = str(d.get("home") or "")[:64]
            self.res = d.get("res") if d.get("res") in RES else "h"

    @property
    def connected(self) -> bool:
        return bool(self.token)

    async def _post(self, token: str, quarter: bool) -> Any:
        s = async_get_clientsession(self.hass)
        try:
            async with asyncio.timeout(TIMEOUT_S):
                async with s.post(URL, json={"query": _query(quarter)}, headers={"Authorization": f"Bearer {token}"}) as r:
                    if r.status in (401, 403):
                        raise TibberError("Der Token wurde von Tibber nicht akzeptiert")
                    if r.status != 200:
                        raise TibberError(f"HTTP {r.status}")
                    return await r.json(content_type=None)
        except TibberError:
            raise
        except (TimeoutError, OSError) as err:
            raise TibberError(str(err) or "Keine Antwort von Tibber") from err
        except Exception as err:  # aiohttp- und JSON-Fehler
            raise TibberError(str(err) or err.__class__.__name__) from err

    async def _fetch(self, token: str, home: str, res: str) -> dict[str, Any]:
        resp = await self._post(token, res == "q")
        if isinstance(resp, dict) and resp.get("errors") and res == "q":
            resp = await self._post(token, False)  # ältere API ohne Viertelstunden
        if not isinstance(resp, dict) or resp.get("errors") and not (resp.get("data") or {}).get("viewer"):
            msg = ""
            try:
                msg = str(resp["errors"][0].get("message"))[:120]
            except (KeyError, IndexError, TypeError, AttributeError):
                pass
            raise TibberError(msg or "Unerwartete Antwort")
        out = parse_tibber(resp, home)
        if res != "q":
            out["prices"] = hourly_mean(out["prices"])
        return out

    async def async_test(self, token: str) -> dict[str, Any]:
        token = (token or "").strip()
        if len(token) < 8 or len(token) > 200:
            return {"ok": False, "error": "Der Token wurde von Tibber nicht akzeptiert"}
        try:
            d = await self._fetch(token, "", "h")
        except TibberError as err:
            return {"ok": False, "error": str(err)}
        now = datetime.now().astimezone()
        today = [p["ct"] for p in d["prices"] if p["start"].astimezone(now.tzinfo).date() == now.date()]
        tomorrow = any(p["start"].astimezone(now.tzinfo).date() > now.date() for p in d["prices"])
        cur = d["current_ct"]
        if not d["homes"]:
            return {"ok": False, "error": "In diesem Konto wurde kein Zuhause mit Stromvertrag gefunden"}
        return {"ok": True, "home": d["homes"][0]["name"], "homes": d["homes"], "price_now": None if cur is None else round(cur, 1),
                "min": round(min(today), 1) if today else None, "max": round(max(today), 1) if today else None, "tomorrow": tomorrow}

    async def async_set(self, token: str | None, home: str, res: str) -> None:
        if token is not None:
            self.token = token.strip()[:200]
        if not self.token:
            self.home, self.res = "", "h"
        else:
            self.home = str(home or "")[:64]
            self.res = res if res in RES else "h"
        self._cache, self._cache_ts, self._err = None, 0.0, ""
        await self._store.async_save({"token": self.token, "home": self.home, "res": self.res})

    async def async_prices(self, force: bool = False) -> dict[str, Any] | None:
        """Preise von heute und morgen (zwischengespeichert, morgen erscheint am frühen Nachmittag)."""
        if not self.token:
            return None
        age = time.time() - self._cache_ts
        if self._cache is not None and not force and age < CACHE_S:
            return self._cache
        async with self._busy:
            if not force and self._cache is not None and time.time() - self._cache_ts < 30:
                return self._cache
            try:
                self._cache = await self._fetch(self.token, self.home, self.res)
                self._cache_ts = time.time()
                self._err = ""
            except TibberError as err:
                if str(err) != self._err:
                    _LOGGER.warning("Tibber: %s", err)
                self._err = str(err)
                self._cache_ts = time.time() - CACHE_S + 60  # in einer Minute erneut versuchen
        return self._cache

    def current_ct(self, now: datetime) -> float | None:
        c = self._cache
        if not c:
            return None
        for p in c["prices"]:
            st = p["start"].astimezone(now.tzinfo)
            span = 3600 if self.res != "q" else 900
            if 0 <= (now - st).total_seconds() < span:
                return p["ct"]
        return c.get("current_ct")

    def view(self) -> dict[str, Any]:
        homes = (self._cache or {}).get("homes") or []
        name = next((h["name"] for h in homes if h["id"] == (self.home or (self._cache or {}).get("home_id"))), "")
        cur = self.current_ct(datetime.now().astimezone())
        return {"connected": self.connected, "has_token": self.connected, "home": name or ("Zuhause" if self.connected else ""),
                "home_id": self.home or (self._cache or {}).get("home_id", ""), "res": self.res, "price_now": None if cur is None else round(cur, 1), "error": self._err}
