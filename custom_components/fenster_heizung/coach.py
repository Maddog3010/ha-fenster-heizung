"""Sponsor-Bereich 2.0, Stufe S3: Energie-Coach und Werte für den Monatsbericht.

Energie-Coach: feste Prüfregeln (keine KI), einmal pro Woche am Montag um 6 Uhr über die letzten 7 Tage:
  dev  – ein Gerät aus Modul 4 lief mehrmals abends/nachts überwiegend aus dem Netz (mit Euro-Betrag, nur mit Solar)
  win  – in einem Raum aus Modul 1 war das Fenster mehrmals länger als 20 Minuten offen (aus dem Verlauf von Home Assistant)
  bat  – der Akku war an mehreren Tagen schon vor 15 Uhr voll (Sensor aus den PV-Einstellungen)
Gezeigt werden höchstens drei Tipps, die mit Euro-Betrag zuerst. Nichts wird geschaltet, nichts verlässt Home Assistant.
Monatsbericht: Wärme gespart (Modul 1, Tageswerte) und Gerätestrom (Modul 4) für einen Monat „JJJJ-MM“.
Solar und Autarkie rechnet das Dashboard aus der Statistik von Home Assistant (Modul 3).
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.event import async_call_later, async_track_time_change
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import CONF_WINDOWS, DOMAIN

_LOGGER = logging.getLogger(__name__)

NIGHT = (18, 7)  # Start ab 18 Uhr oder vor 7 Uhr gilt als „abends/nachts“
GRID_SHARE = 0.6  # ab diesem Netzanteil zählt ein Lauf
MIN_RUNS = 2  # so oft muss es in der Woche vorkommen
WIN_MIN = 20  # Minuten, ab denen ein Fenster „lange offen“ ist
WIN_COUNT = 3
BAT_FULL = 98.0
BAT_HOUR = 15
BAT_DAYS = 3


def _eur(v: float) -> str:
    return f"{v:.2f}".replace(".", ",")


def _on(state: str) -> bool:
    return state in ("on", "open", "true")


class CoachManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_coach")
        self.res: dict[str, Any] = {}
        self._unsubs: list[CALLBACK_TYPE] = []
        self._busy = False

    async def async_start(self) -> None:
        d = await self._store.async_load() or {}
        self.res = d.get("res") if isinstance(d.get("res"), dict) else {}
        self._unsubs.append(async_track_time_change(self.hass, self._weekly, hour=6, minute=0, second=20))
        # Nach dem Start einmal rechnen, wenn das Ergebnis fehlt oder älter als eine Woche ist
        if not self.res or dt_util.utcnow().timestamp() - float(self.res.get("ts_u") or 0) > 7.5 * 86400:
            self._unsubs.append(async_call_later(self.hass, 90, self._later))

    def async_stop(self) -> None:
        for u in self._unsubs:
            try:
                u()
            except Exception:  # noqa: BLE001
                pass
        self._unsubs.clear()

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"res": self.res}, 5)

    def _allowed(self) -> bool:
        sm = self.hass.data.get(DOMAIN, {}).get("sponsor")
        try:
            return bool(sm and sm.snapshot()["active"])
        except Exception:  # noqa: BLE001
            return False

    async def _later(self, _now: Any) -> None:
        await self.async_run()

    async def _weekly(self, now: datetime) -> None:
        if now.weekday() == 0:
            await self.async_run()

    # ---- Hilfen
    def _prices(self) -> tuple[float, float]:
        gm = self.hass.data.get(DOMAIN, {}).get("geraete")
        gen = self.hass.data.get(DOMAIN, {}).get("general")
        pvc = (gen.data.get("pv") if gen is not None else None) or {}
        if gm is None:
            return float(pvc.get("price") or 0) / 100, float(pvc.get("feed") or 0) / 100
        return gm._price(pvc, "price_mode", "price_sensor", "price"), gm._price(pvc, "feed_mode", "feed_sensor", "feed")  # noqa: SLF001

    def _has_pv(self) -> bool:
        wm = self.hass.data.get(DOMAIN, {}).get("wasser")
        ent = (((wm.modules if wm is not None else {}) or {}).get("energy") or {}).get("ent") or {}
        return bool(ent.get("pv") or ent.get("pve"))

    async def _hist(self, eid: str, start: datetime, end: datetime) -> list[Any]:
        try:
            from homeassistant.components.recorder import get_instance, history

            def job() -> dict[str, list[Any]]:
                return history.state_changes_during_period(self.hass, start, end, eid, no_attributes=True, include_start_time_state=True)

            r = await get_instance(self.hass).async_add_executor_job(job)
            return list((r or {}).get(eid) or [])
        except Exception:  # noqa: BLE001 - ohne Recorder fällt die Regel einfach weg
            _LOGGER.debug("Coach: Verlauf für %s nicht lesbar", eid, exc_info=True)
            return []

    # ---- Regeln
    def _rule_dev(self, start: datetime) -> list[dict[str, Any]]:
        gm = self.hass.data.get(DOMAIN, {}).get("geraete")
        if gm is None or not self._has_pv():
            return []
        price, feed = self._prices()
        t0 = start.timestamp()
        by: dict[str, dict[str, Any]] = {}
        for r in getattr(gm, "rlog", []) or []:
            if r.get("t", 0) < t0 or not r.get("kwh"):
                continue
            h = dt_util.as_local(dt_util.utc_from_timestamp(r["t"])).hour
            if not (h >= NIGHT[0] or h < NIGHT[1]) or r.get("g", 0) / r["kwh"] < GRID_SHARE:
                continue
            x = by.setdefault(r.get("d", ""), {"n": r.get("n") or "Gerät", "c": 0, "g": 0.0})
            x["c"] += 1
            x["g"] += r.get("g", 0.0)
        out = []
        for x in by.values():
            if x["c"] < MIN_RUNS:
                continue
            eur = max(x["g"] * max(price - feed, 0.0), 0.0)
            txt = f"{x['n']} lief {x['c']}× abends oder nachts aus dem Netz."
            txt += f" Mittags mit Sonne starten spart ca. {_eur(eur)} €." if eur >= 0.05 else " Mittags mit Sonne starten spart Netzstrom."
            out.append({"k": "dev", "t": txt, "eur": round(eur, 2) if eur >= 0.05 else 0})
        return out

    async def _rule_win(self, start: datetime, end: datetime) -> list[dict[str, Any]]:
        best: tuple[int, str] | None = None
        for entry in self.hass.config_entries.async_entries(DOMAIN):
            ctrl = getattr(entry, "runtime_data", None)
            if ctrl is None or entry.state is not ConfigEntryState.LOADED:
                continue
            cnt = 0
            for eid in (getattr(ctrl, "cfg", {}) or {}).get(CONF_WINDOWS) or []:
                since: datetime | None = None
                for st in await self._hist(eid, start, end):
                    t = max(st.last_changed, start)
                    if _on(st.state):
                        since = since or t
                    elif since is not None:
                        if (t - since).total_seconds() > WIN_MIN * 60:
                            cnt += 1
                        since = None
            if cnt >= WIN_COUNT and (best is None or cnt > best[0]):
                best = (cnt, entry.title)
        if not best:
            return []
        return [{"k": "win", "t": f"{best[1]}: Fenster {best[0]}× länger als {WIN_MIN} Min. offen. Bei Kälte reichen 5–10 Min. Stoßlüften.", "eur": 0}]

    async def _rule_bat(self, start: datetime, end: datetime) -> list[dict[str, Any]]:
        gen = self.hass.data.get(DOMAIN, {}).get("general")
        eid = ((gen.data.get("pv") if gen is not None else None) or {}).get("soc_sensor")
        if not eid:
            return []
        days: set[str] = set()
        for st in await self._hist(eid, start, end):
            try:
                v = float(st.state)
            except (TypeError, ValueError):
                continue
            loc = dt_util.as_local(st.last_changed)
            if v >= BAT_FULL and 6 <= loc.hour < BAT_HOUR:
                days.add(loc.date().isoformat())
        if len(days) < BAT_DAYS:
            return []
        return [{"k": "bat", "t": f"Akku war {len(days)} Tage schon vor {BAT_HOUR} Uhr voll – Heizstab oder große Geräte in den Mittag legen.", "eur": 0}]

    async def async_run(self) -> dict[str, Any]:
        if self._busy:
            return self.res
        self._busy = True
        try:
            now = dt_util.now()
            end = now
            start = now - timedelta(days=7)
            if not self._allowed():
                return self.res
            tips: list[dict[str, Any]] = []
            for fn in (self._rule_dev(start),):
                tips += fn
            tips += await self._rule_win(start, end)
            tips += await self._rule_bat(start, end)
            tips.sort(key=lambda x: -x.get("eur", 0))
            tips = tips[:3]
            gm = self.hass.data.get(DOMAIN, {}).get("geraete")
            first = min((r.get("t", 0) for r in (getattr(gm, "rlog", []) or [])), default=0)
            learn = not tips and (not first or now.timestamp() - first < 7 * 86400)
            nxt = (now + timedelta(days=(7 - now.weekday()) % 7 or 7)).date()
            self.res = {
                "week": now.isocalendar()[1], "from": start.date().isoformat(), "to": end.date().isoformat(),
                "ts": now.isoformat(timespec="seconds"), "ts_u": now.timestamp(), "tips": tips,
                "eur": round(sum(t.get("eur", 0) for t in tips), 2), "learn": learn, "next": nxt.strftime("%d.%m."),
            }
            self._save()
            return self.res
        except Exception:  # noqa: BLE001
            _LOGGER.exception("Energie-Coach: Auswertung fehlgeschlagen")
            return self.res
        finally:
            self._busy = False

    # ---- Monatsbericht: Werte aus Modul 1 und Modul 4
    def month(self, ym: str) -> dict[str, Any]:
        out: dict[str, Any] = {"ym": ym}
        kwh, amt, units = 0.0, 0.0, set()
        for entry in self.hass.config_entries.async_entries(DOMAIN):
            ctrl = getattr(entry, "runtime_data", None)
            if ctrl is None or entry.state is not ConfigEntryState.LOADED:
                continue
            try:
                k = ctrl.kwh_prefix(ym)
                info = ctrl.fuel_info()
            except Exception:  # noqa: BLE001
                continue
            kwh += k
            amt += k * info["faktor"]
            units.add((info["brennstoff"], info["einheit"]))
        if kwh > 0:
            out["heat"] = {"kwh": round(kwh, 1), **({"amt": round(amt, 1), "fuel": next(iter(units))[0], "unit": next(iter(units))[1]} if len(units) == 1 else {})}
        gm = self.hass.data.get(DOMAIN, {}).get("geraete")
        if gm is not None:
            sv = own = tot = 0.0
            for day, devs in (gm.days or {}).items():
                if not str(day).startswith(ym):
                    continue
                for row in devs.values():
                    sv += row[4]
                    own += row[0] + row[1]
                    tot += row[0] + row[1] + row[2]
            if tot > 0:
                out["gs"] = {"saved": round(sv, 2), "own": round(own / tot * 100, 1), "kwh": round(tot, 2)}
        return out
