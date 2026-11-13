"""Sponsor-Freischaltung über GitHub (Konzept Sponsor-Freischaltung, Stufe 2).

Der Sponsor meldet sich im Panel mit dem GitHub-Gerätecode an (OAuth Device Flow). Dafür braucht die Integration nur die
öffentliche Client-ID der OAuth-App „Strom & Wärme“, kein Geheimnis und keinen eigenen Server. Mit dem Token des Sponsors
(nur Lesen: read:user) fragt die Integration GitHub direkt: Sponsert dieser Nutzer Maddog3010, mit welcher Stufe, seit wann,
einmalig oder monatlich? Das Ergebnis wird hier gespeichert und täglich neu geprüft.

Zuordnung nach dem Namen der GitHub-Stufe: steht in GH_STUFEN (Vorgabe) und kann über die Datei sponsor_gesperrt.json im Repo
(Feld "github_stufen") ohne neue Version geändert werden.

Regeln:
- monatlich: aktiv, solange das Sponsoring läuft. Endet es, gelten die Extras noch KULANZ_ENDE Tage.
- einmalig: Sponsor 1 Jahr ab Zahlung, Max 3 Monate ab Zahlung und danach bis 1 Jahr ab Zahlung wieder „Sponsor“ (wie beim
  Max-Schlüssel). GitHub liefert Einmal-Zahlungen nur etwa 30 Tage lang – deshalb zählt das beim ersten Abruf gespeicherte Datum.
- ohne Internet: der letzte bestätigte Stand gilt KULANZ_OFFLINE Tage weiter.
"""
from __future__ import annotations

import asyncio
import logging
import re
import time
from datetime import date, datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.util import dt as dt_util

_LOGGER = logging.getLogger(__name__)

# Öffentliche Client-ID der OAuth-App „Strom & Wärme“ (GitHub → Settings → Developer settings → OAuth Apps, Device Flow an).
# Leer = Anmeldung mit GitHub ist noch nicht eingerichtet, das Panel zeigt dann nur den Schlüssel-Weg.
GH_CLIENT_ID = "Ov23livKYkcPzIQBaJxv"
GH_OWNER = "Maddog3010"
GH_SCOPE = "read:user"
DEVICE_URL = "https://github.com/login/device/code"
TOKEN_URL = "https://github.com/login/oauth/access_token"
GQL_URL = "https://api.github.com/graphql"
# Vorgabe für die Zuordnung. GitHub benennt Stufen nach dem Preis (z. B. "$3 a month", "$10 one time");
# verglichen wird ohne Leer- und Sonderzeichen. Alles andere zählt als „Sponsor“.
GH_STUFEN: dict[str, list[str]] = {"max": ["$3 a month", "$10 one time"]}
# Freie Beträge (Custom amounts) nach Höhe: monatlich ab MAX_AB_MONAT, einmalig ab MAX_AB_EINMALIG Dollar gilt Max
MAX_AB_MONAT = 3
MAX_AB_EINMALIG = 10
KULANZ_OFFLINE = 14
KULANZ_ENDE = 7
CHECK_HOURS = 24
LOGIN_RE = re.compile(r"^[A-Za-z0-9-]{1,39}$")

Q_FULL = """query($o:String!){viewer{login}user(login:$o){viewerIsSponsoring
sponsorshipForViewerAsSponsor(activeOnly:false){createdAt isOneTimePayment isActive tier{name isOneTime isCustomAmount monthlyPriceInDollars}}}}"""
Q_MIN = """query($o:String!){viewer{login}user(login:$o){viewerIsSponsoring
sponsorshipForViewerAsSponsor{createdAt tier{name isOneTime}}}}"""


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
    except ValueError:
        return d.replace(year=d.year + 1, day=28)


def tier_of(name: str, stufen: dict[str, list[str]] | None = None, custom: bool = False, price: Any = None, one_time: bool = False) -> str:
    """Name der GitHub-Stufe → "max" oder "sponsor". Freie Beträge werden nach Höhe zugeordnet."""
    if custom:
        try:
            p = float(price or 0)
        except (TypeError, ValueError):
            p = 0
        return "max" if p >= (MAX_AB_EINMALIG if one_time else MAX_AB_MONAT) else "sponsor"
    st = stufen or GH_STUFEN
    norm = lambda v: re.sub(r"[^a-z0-9]", "", str(v or "").lower())  # "$10 one-time" = "$10 one time"
    n = norm(name)
    if n and any(n == norm(x) for x in st.get("max", [])):
        return "max"
    return "sponsor"


def clean_stufen(raw: Any) -> dict[str, list[str]] | None:
    if not isinstance(raw, dict) or not isinstance(raw.get("max"), list):
        return None
    names = [str(x).strip()[:60] for x in raw["max"] if isinstance(x, str) and str(x).strip()][:10]
    return {"max": names} if names else None


def evaluate(link: dict[str, Any], today: date, now_ts: float, stufen: dict[str, list[str]] | None = None) -> dict[str, Any]:
    """Wertet den gespeicherten GitHub-Stand aus. Ergebnis wie verify_key: ok, state, tier, bis, days (+ monthly, ended)."""
    if not link or not link.get("login") or not link.get("found"):
        return {"ok": False, "state": "none" if not link or not link.get("login") else "notfound"}
    tier = tier_of(link.get("tier_name", ""), stufen, bool(link.get("custom")), link.get("price"), bool(link.get("one_time")))
    out: dict[str, Any] = {"ok": True, "state": "ok", "tier": tier, "name": link["login"], "since": "", "bis": "", "days": None,
                           "monthly": not link.get("one_time"), "tier_name": link.get("tier_name", "")}
    try:
        created = datetime.fromisoformat(str(link.get("created", "")).replace("Z", "+00:00")).date()
        out["since"] = created.isoformat()
    except ValueError:
        created = None
    if link.get("one_time"):
        if created is None:
            return {"ok": False, "state": "invalid"}
        year_end = _plus_year(created)
        if tier == "max":
            max_end = _plus_months(created, 3)
            if today <= max_end:
                out.update(bis=max_end.isoformat(), days=(max_end - today).days)
            elif today <= year_end:
                out.update(tier="sponsor", bis=year_end.isoformat(), days=(year_end - today).days, max_ended=max_end.isoformat())
            else:
                out.update(ok=False, state="expired", bis=year_end.isoformat())
        elif today <= year_end:
            out.update(bis=year_end.isoformat(), days=(year_end - today).days)
        else:
            out.update(ok=False, state="expired", bis=year_end.isoformat())
        return out
    # monatlich: läuft, solange GitHub es aktiv meldet
    ended = str(link.get("ended") or "")
    if ended:
        try:
            end = date.fromisoformat(ended) + timedelta(days=KULANZ_ENDE)
        except ValueError:
            end = today
        if today > end:
            return {**out, "ok": False, "state": "ended", "bis": ended}
        out.update(state="ending", bis=end.isoformat(), days=(end - today).days, ended=ended)
        return out
    last = float(link.get("last_ok") or 0)
    if last and now_ts - last > KULANZ_OFFLINE * 86400:
        return {**out, "ok": False, "state": "stale"}
    return out


class GithubLink:
    """Anmeldung per Gerätecode und regelmäßige Prüfung. Daten liegen im Speicher des SponsorManager (Feld "gh")."""

    def __init__(self, hass: HomeAssistant, save) -> None:
        self.hass = hass
        self._save = save
        self.data: dict[str, Any] = {}   # login, token, found, tier_name, one_time, created, last_ok, last_try, ended, err
        self.flow: dict[str, Any] = {}   # laufende Anmeldung: user_code, uri, until, state, msg
        self.stufen: dict[str, list[str]] | None = None   # aus sponsor_gesperrt.json
        self._task: asyncio.Task | None = None

    @property
    def ready(self) -> bool:
        return bool(GH_CLIENT_ID)

    def load(self, raw: Any) -> None:
        if isinstance(raw, dict):
            self.data = {k: raw[k] for k in ("login", "token", "found", "tier_name", "one_time", "custom", "price", "created", "last_ok", "last_try", "ended", "err") if k in raw}
            if not LOGIN_RE.match(str(self.data.get("login") or "x")):
                self.data = {}

    def dump(self) -> dict[str, Any]:
        return dict(self.data)

    def status(self) -> dict[str, Any]:
        return evaluate(self.data, dt_util.now().date(), time.time(), self.stufen)

    def public(self) -> dict[str, Any]:
        """Für das Panel (ohne Token)."""
        d = self.data
        f = self.flow
        flow = {k: f.get(k) for k in ("user_code", "uri", "until", "state", "msg")} if f else None
        return {"ready": self.ready, "linked": bool(d.get("login")), "login": d.get("login", ""), "found": bool(d.get("found")),
                "tier_name": d.get("tier_name", ""), "one_time": bool(d.get("one_time")), "last_ok": d.get("last_ok") or 0,
                "last_try": d.get("last_try") or 0, "err": d.get("err", ""), "flow": flow, "eval": self.status(),
                "stufen": (self.stufen or GH_STUFEN).get("max", [])}

    # ------------------------------------------------------------ Gerätecode-Anmeldung
    async def async_start(self) -> dict[str, Any]:
        if not self.ready:
            return {"ok": False, "error": "not_ready"}
        if self._task and not self._task.done():
            self._task.cancel()
        session = async_get_clientsession(self.hass)
        try:
            async with session.post(DEVICE_URL, data={"client_id": GH_CLIENT_ID, "scope": GH_SCOPE}, headers={"Accept": "application/json"}, timeout=15) as r:
                d = await r.json(content_type=None)
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("Gerätecode nicht erhalten: %s", err)
            return {"ok": False, "error": "net"}
        if not isinstance(d, dict) or not d.get("device_code"):
            return {"ok": False, "error": str((d or {}).get("error") or "github")}
        until = time.time() + int(d.get("expires_in") or 900)
        self.flow = {"user_code": str(d.get("user_code", ""))[:16], "uri": str(d.get("verification_uri") or "https://github.com/login/device")[:80],
                     "until": until, "state": "wait", "msg": ""}
        self._task = self.hass.async_create_background_task(
            self._poll(str(d["device_code"]), max(5, int(d.get("interval") or 5)), until), "fenster_heizung_gh_login")
        return {"ok": True}

    def cancel(self) -> None:
        if self._task and not self._task.done():
            self._task.cancel()
        self.flow = {}

    async def _poll(self, device_code: str, interval: int, until: float) -> None:
        session = async_get_clientsession(self.hass)
        while time.time() < until:
            await asyncio.sleep(interval)
            try:
                async with session.post(TOKEN_URL, data={"client_id": GH_CLIENT_ID, "device_code": device_code,
                                                         "grant_type": "urn:ietf:params:oauth:grant-type:device_code"},
                                        headers={"Accept": "application/json"}, timeout=15) as r:
                    d = await r.json(content_type=None)
            except Exception:  # noqa: BLE001 - kurz weg, weiter warten
                continue
            err = (d or {}).get("error")
            if err == "authorization_pending":
                continue
            if err == "slow_down":
                interval += 5
                continue
            if err in ("expired_token", "access_denied") or not (d or {}).get("access_token"):
                self.flow.update(state="denied" if err == "access_denied" else "expired" if err == "expired_token" else "error", msg=str(err or ""))
                return
            self.flow["state"] = "check"
            res = await self.async_check(str(d["access_token"]))
            self.flow["state"] = "ok" if res.get("found") else "notfound" if res.get("ok") else "error"
            self.flow["msg"] = res.get("error", "")
            return
        self.flow["state"] = "expired"

    # ------------------------------------------------------------ Prüfung
    async def _query(self, token: str, q: str) -> dict[str, Any] | None:
        session = async_get_clientsession(self.hass)
        async with session.post(GQL_URL, json={"query": q, "variables": {"o": GH_OWNER}},
                                headers={"Authorization": f"bearer {token}", "Accept": "application/json"}, timeout=20) as r:
            if r.status == 401:
                return {"_unauth": True}
            return await r.json(content_type=None)

    async def async_check(self, token: str | None = None) -> dict[str, Any]:
        """Fragt GitHub. token=None: gespeichertes Token. Ergebnis: ok (Abfrage ging), found (sponsert)."""
        tok = token or str(self.data.get("token") or "")
        if not tok:
            return {"ok": False, "error": "no_token"}
        self.data["last_try"] = time.time()
        try:
            d = await self._query(tok, Q_FULL)
            if d and d.get("errors") and not d.get("data"):
                d = await self._query(tok, Q_MIN)   # ältere/andere Felder: mit der kleinen Abfrage noch einmal
        except Exception as err:  # noqa: BLE001 - ohne Internet bleibt der alte Stand (Kulanz)
            self.data["err"] = "net"
            self._save()
            return {"ok": False, "error": "net"}
        if not d or d.get("_unauth"):
            self.data["err"] = "token"
            self._save()
            return {"ok": False, "error": "token"}
        dd = d.get("data") or {}
        login = str(((dd.get("viewer") or {}).get("login")) or "")
        if not LOGIN_RE.match(login):
            self.data["err"] = "github"
            self._save()
            return {"ok": False, "error": "github"}
        u = dd.get("user") or {}
        sp = u.get("sponsorshipForViewerAsSponsor") or None
        active = bool(u.get("viewerIsSponsoring")) or bool(sp and sp.get("isActive"))
        old = self.data if self.data.get("login") == login else {}
        new: dict[str, Any] = {"login": login, "token": tok, "last_try": time.time(), "err": ""}
        if sp:
            t = sp.get("tier") or {}
            one = bool(sp.get("isOneTimePayment", t.get("isOneTime")))
            new.update(found=True, tier_name=str(t.get("name") or "")[:60], one_time=one, created=str(sp.get("createdAt") or "")[:32],
                       custom=bool(t.get("isCustomAmount")), price=t.get("monthlyPriceInDollars"),
                       last_ok=time.time(), ended="" if active or one else (old.get("ended") or dt_util.now().date().isoformat()))
        elif old.get("found") and old.get("one_time"):
            # Einmal-Zahlung nach ~30 Tagen nicht mehr in der Schnittstelle: gespeicherter Nachweis gilt (Laufzeit ab Zahlung)
            new.update({k: old[k] for k in ("found", "tier_name", "one_time", "custom", "price", "created") if k in old}, last_ok=time.time(), ended="")
        elif old.get("found"):
            new.update({k: old[k] for k in ("found", "tier_name", "one_time", "custom", "price", "created", "last_ok") if k in old},
                       ended=old.get("ended") or dt_util.now().date().isoformat())
        else:
            new.update(found=False)
        self.data = new
        self._save()
        return {"ok": True, "found": bool(new.get("found")) and self.status().get("ok", False), "login": login}

    async def async_refresh(self) -> None:
        if self.data.get("token") and time.time() - float(self.data.get("last_try") or 0) > (CHECK_HOURS - 1) * 3600:
            await self.async_check()

    def logout(self) -> None:
        self.cancel()
        self.data = {}
        self._save()
