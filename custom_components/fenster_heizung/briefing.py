"""Sponsor Max (Max 1): Morgen-Briefing und optionaler Abend-Rückblick.

Eine Meldung am Morgen zur gewählten Uhrzeit, gebaut aus den Daten, die die Integration schon hat: Solarprognose
(Modul 16 bzw. Forecast.Solar), Strompreis (Tibber), beste Startzeit der Geräte (Modul 4), Auto (Modul 8), Heizung und
Fenster (Modul 1) und Auffälligkeiten aus der Gerätediagnose. Jeder Baustein ist einzeln abschaltbar und fällt einfach
weg, wenn seine Daten fehlen. Es wird nichts geschaltet und nichts nach außen geschickt außer der Meldung selbst.
Nur aktiv mit einem gültigen Max-Schlüssel (oder dem Entwickler-Zugang).
"""
from __future__ import annotations

import logging
import re
from datetime import datetime, timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.event import async_track_time_change
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

BLOCKS = ("sun", "price", "dev", "car", "heat", "warn", "muell")
_TIME = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")
_NOTIFY = re.compile(r"^notify\.[a-z0-9_]+$")


def default_cfg() -> dict[str, Any]:
    return {"on": False, "time": "06:30", "evening": False, "evening_time": "21:00",
            "blocks": ["sun", "price", "dev", "car", "heat", "warn"], "notify": [], "tablet": True}


def clean_cfg(raw: Any) -> dict[str, Any]:
    r = raw if isinstance(raw, dict) else {}
    d = default_cfg()
    out = {
        "on": bool(r.get("on", d["on"])),
        "time": r.get("time") if isinstance(r.get("time"), str) and _TIME.match(r["time"]) else d["time"],
        "evening": bool(r.get("evening", d["evening"])),
        "evening_time": r.get("evening_time") if isinstance(r.get("evening_time"), str) and _TIME.match(r["evening_time"]) else d["evening_time"],
        "blocks": [b for b in BLOCKS if b in (r.get("blocks") if isinstance(r.get("blocks"), list) else d["blocks"])],
        "notify": list(dict.fromkeys(n for n in (r.get("notify") or []) if isinstance(n, str) and _NOTIFY.match(n)))[:6],
        "tablet": bool(r.get("tablet", d["tablet"])),
    }
    return out


def _num(v: float, d: int = 1) -> str:
    return f"{v:.{d}f}".replace(".", ",")


class BriefingManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_briefing")
        self.cfg = default_cfg()
        self.last: dict[str, Any] = {}  # letzte Meldung (für Lounge und Tablet-Kachel)
        self._unsub: CALLBACK_TYPE | None = None

    async def async_start(self) -> None:
        d = await self._store.async_load() or {}
        self.cfg = clean_cfg(d.get("cfg"))
        self.last = d.get("last") if isinstance(d.get("last"), dict) else {}
        self._unsub = async_track_time_change(self.hass, self._tick, second=5)

    def async_stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"cfg": self.cfg, "last": self.last}, 5)

    def _allowed(self) -> bool:
        sm = self.hass.data.get(DOMAIN, {}).get("sponsor")
        try:
            return bool(sm and sm.is_max())
        except Exception:  # noqa: BLE001 - ohne Prüfung kein Briefing
            return False

    async def async_set(self, raw: Any) -> dict[str, Any]:
        self.cfg = clean_cfg({**self.cfg, **(raw if isinstance(raw, dict) else {})})
        self._save()
        return self.snapshot()

    def snapshot(self) -> dict[str, Any]:
        return {"cfg": self.cfg, "last": self.last, "allowed": self._allowed(), "blocks": list(BLOCKS)}

    async def _tick(self, now: datetime) -> None:
        if not self.cfg["on"] or not self._allowed():
            return
        hm = now.strftime("%H:%M")
        if hm == self.cfg["time"]:
            await self.async_send("morning")
        elif self.cfg["evening"] and hm == self.cfg["evening_time"]:
            await self.async_send("evening")

    # ------------------------------------------------------------ Inhalt
    async def build(self, kind: str = "morning") -> dict[str, Any]:
        D = self.hass.data.get(DOMAIN, {})
        lines: list[str] = []
        if kind == "evening":
            lines += [x for x in (self._evening(D),) if x]
            return {"title": "🌙 Abend-Rückblick", "lines": lines or ["Heute gab es nichts Besonderes."]}
        for b in self.cfg["blocks"]:
            try:
                fn = {"sun": self._sun, "price": self._price, "dev": self._dev, "car": self._car, "heat": self._heat, "warn": self._warn, "muell": self._muell}[b]
                r = await fn(D)
            except Exception:  # noqa: BLE001 - ein fehlender Baustein darf das Briefing nicht verhindern
                _LOGGER.debug("Briefing-Baustein %s fehlgeschlagen", b, exc_info=True)
                r = None
            if r:
                lines.append(r)
        return {"title": "☀️ Guten Morgen – dein Tag", "lines": lines or ["Heute liegen keine Daten für das Briefing vor."]}

    async def _sun(self, D: dict) -> str | None:
        sm = D.get("solar")
        if sm is None:
            return None
        wh, _ = await sm._wh()  # noqa: SLF001 - gleiche Quelle wie Modul 16
        if not wh:
            return None
        from .solar import best_window, day_sums, hourly
        now = dt_util.now()
        kwh = day_sums(wh, now.tzinfo, now.date())
        best = best_window(hourly(wh, now.tzinfo, now.date()))
        if kwh <= 0:
            return None
        return f"☀️ Sonne: {_num(kwh)} kWh erwartet" + (f", am meisten {best['from']}–{best['to']} Uhr" if best else "")

    async def _price(self, D: dict) -> str | None:
        tm = D.get("tibber")
        if tm is None or not getattr(tm, "connected", False):
            return None
        c = await tm.async_prices()
        if not c or not c.get("prices"):
            return None
        now = dt_util.now()
        today = [p for p in c["prices"] if p["start"].astimezone(now.tzinfo).date() == now.date() and p["start"] >= now - timedelta(hours=1)]
        if not today:
            return None
        lo = min(today, key=lambda p: p["ct"])
        return f"€ Strom am günstigsten ab {lo['start'].astimezone(now.tzinfo):%H:%M} Uhr ({_num(lo['ct'])} ct)"

    async def _dev(self, D: dict) -> str | None:
        gm = D.get("geraete")
        if gm is None or not gm.active():
            return None
        snap = gm.snapshot()
        best = [(d["best"]["ts"], d["name"]) for d in snap.get("devices", []) if d.get("best") and not d.get("running")]
        if not best:
            return None
        ts, name = min(best)
        at = dt_util.as_local(dt_util.utc_from_timestamp(ts))
        if at.date() != dt_util.now().date():
            return None
        return f"🧺 {name} am besten ab {at:%H:%M} Uhr"

    async def _car(self, D: dict) -> str | None:
        wb = D.get("wallbox")
        if wb is None:
            return None
        soc = wb._soc()  # noqa: SLF001
        if soc is None:
            return None
        return f"🚗 Auto {round(soc)} %"

    async def _heat(self, D: dict) -> str | None:
        rooms = opened = 0
        for entry in self.hass.config_entries.async_entries(DOMAIN):
            ctrl = getattr(entry, "runtime_data", None)
            if ctrl is None or entry.state is not ConfigEntryState.LOADED:
                continue
            rooms += 1
            try:
                opened += 1 if ctrl.window_open() else 0
            except Exception:  # noqa: BLE001
                continue
        if not rooms:
            return None
        pm = D.get("presence")
        mode = {"away": "Abwesend", "vacation": "Urlaub"}.get(pm.effective() if pm else "home", "")
        txt = "alle Fenster zu" if not opened else f"{opened} {'Fenster' if opened == 1 else 'Fenster'} offen"
        return f"🔥 Heizung {'· ' + mode + ' · ' if mode else 'normal, '}{txt}"

    async def _warn(self, D: dict) -> str | None:
        dm = D.get("diag")
        if dm is None:
            return None
        probs = dm.problems()
        if not probs:
            return None
        first = probs[0][2]
        return f"⚠️ {first}" + (f" (+{len(probs) - 1} weitere)" if len(probs) > 1 else "")

    async def _muell(self, D: dict) -> str | None:
        return None  # Müllabfuhr ist ein Addon; die Termine liest das Briefing erst, wenn das Addon sie anbietet

    def _evening(self, D: dict) -> str | None:
        gm = D.get("geraete")
        if gm is None or not gm.active():
            return None
        day = dt_util.now().strftime("%Y-%m-%d")
        sv = kwh = own = 0.0
        for row in (gm.days.get(day) or {}).values():
            kwh += row[0] + row[1] + row[2]
            own += row[0] + row[1]
            sv += row[4]
        if kwh <= 0:
            return None
        return f"Heute {_num(sv, 2)} € gespart · {round(own / kwh * 100)} % eigener Strom"

    async def async_send(self, kind: str = "morning", test: bool = False) -> dict[str, Any]:
        msg = await self.build(kind)
        text = "\n".join(msg["lines"])
        sent = 0
        for svc in self.cfg["notify"]:
            domain, name = svc.split(".", 1)
            if self.hass.services.has_service(domain, name):
                try:
                    await self.hass.services.async_call(domain, name, {"title": msg["title"] + (" (Probe)" if test else ""), "message": text}, blocking=True)
                    sent += 1
                except Exception as err:  # noqa: BLE001
                    _LOGGER.warning("Briefing über %s fehlgeschlagen: %s", svc, err)
        self.last = {"kind": kind, "title": msg["title"], "lines": msg["lines"], "ts": dt_util.now().isoformat(timespec="minutes"), "sent": sent, "test": test}
        self._save()
        return {"ok": sent > 0 or not self.cfg["notify"], "sent": sent, "msg": msg, "no_service": not self.cfg["notify"]}
