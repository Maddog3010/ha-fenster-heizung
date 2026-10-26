"""Allgemeine Einstellungen: Sommermodus, Wetter-Anpassung, Update-Hinweis."""
from __future__ import annotations

import logging
import re
import time
from datetime import timedelta
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import DOMAIN, GITHUB_REPO, UPDATE_CACHE_SECONDS

_LOGGER = logging.getLogger(__name__)

SUMMER_MODES = ("off", "auto", "on")
DEFAULTS: dict[str, Any] = {
    "updates": True,
    "summer": {"mode": "auto", "temp": 18.0, "days": 3},
    "wxadj": {"on": False, "mild": 12.0, "down": 1.0, "frost": 0.0, "up": 1.0},
}


def _number(val: Any, lo: float, hi: float, default: float) -> float:
    try:
        v = float(val)
    except (TypeError, ValueError):
        return default
    return round(min(max(v, lo), hi), 1)


def clean_general(raw: Any) -> dict[str, Any]:
    """Allgemeine Einstellungen prüfen, Ungültiges durch Standardwerte ersetzen."""
    raw = raw if isinstance(raw, dict) else {}
    s = raw.get("summer") if isinstance(raw.get("summer"), dict) else {}
    w = raw.get("wxadj") if isinstance(raw.get("wxadj"), dict) else {}
    ds, dw = DEFAULTS["summer"], DEFAULTS["wxadj"]
    days = s.get("days")
    return {
        "updates": raw.get("updates") is not False,
        "summer": {
            "mode": s.get("mode") if s.get("mode") in SUMMER_MODES else ds["mode"],
            "temp": _number(s.get("temp"), 5, 35, ds["temp"]),
            "days": int(days) if days in (1, 3, 7) else ds["days"],
        },
        "wxadj": {
            "on": w.get("on") is True,
            "mild": _number(w.get("mild"), -20, 40, dw["mild"]),
            "down": _number(w.get("down"), 0, 5, dw["down"]),
            "frost": _number(w.get("frost"), -20, 40, dw["frost"]),
            "up": _number(w.get("up"), 0, 5, dw["up"]),
        },
    }


def summer_state(cfg: dict[str, Any], mean_temp: float | None, was_active: bool) -> bool:
    """Sommermodus ja/nein. Beim Wechsel zurück gilt 1 K Spielraum gegen Flackern."""
    mode = cfg["mode"]
    if mode == "on":
        return True
    if mode == "off" or mean_temp is None:
        return False
    return mean_temp >= cfg["temp"] - (1.0 if was_active else 0.0)


def weather_delta(cfg: dict[str, Any], temp: float | None, sunny: bool, prev: float) -> float:
    """Änderung der Zieltemperatur in Kelvin: Frost hebt an, Sonne oder Milde senkt ab."""
    if not cfg["on"] or temp is None:
        return 0.0
    hyst = 1.0
    frost_lim = cfg["frost"] + (hyst if prev > 0 else 0.0)
    if temp <= frost_lim:
        return float(cfg["up"])
    mild_lim = cfg["mild"] - (hyst if prev < 0 else 0.0)
    if temp >= mild_lim or (sunny and temp >= mild_lim - 5):
        return -float(cfg["down"])
    return 0.0


def parse_notes(body: str) -> list[list[str]]:
    """Aufzählungspunkte einer GitHub-Release-Beschreibung als [Symbol, Text]."""
    icons = (("lüft", "windy"), ("luft", "drop"), ("schimmel", "drop"), ("sommer", "sun"),
             ("sicher", "copy"), ("ansicht", "user"), ("update", "bell"), ("wetter", "partly"),
             ("aufheiz", "clock"), ("symbol", "palette"), ("farbe", "palette"))
    out: list[list[str]] = []
    for line in (body or "").splitlines():
        m = re.match(r"^\s*[-*]\s+(.*\S)\s*$", line)
        if not m:
            continue
        text = re.sub(r"[*_`]", "", m.group(1)).strip()[:140]
        icon = next((i for k, i in icons if k in text.lower()), "check")
        out.append([icon, text])
        if len(out) >= 8:
            break
    return out


def _tag_ok(tag: str) -> bool:
    return bool(re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}$", tag))


class GeneralManager:
    """Hält die allgemeinen Einstellungen und berechnet Sommermodus und Wetter-Anpassung."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = Store(hass, 1, f"{DOMAIN}_general")
        self.data: dict[str, Any] = clean_general({})
        self.summer = False
        self.delta = 0.0
        self._daily: dict[str, list[float]] = {}  # Tag -> [Summe, Anzahl]
        self._unsub: CALLBACK_TYPE | None = None
        self._upd: tuple[float, dict[str, Any]] | None = None

    async def async_start(self) -> None:
        saved = await self._store.async_load() or {}
        self.data = clean_general(saved.get("general"))
        self._daily = {
            k: [float(v[0]), float(v[1])]
            for k, v in (saved.get("daily") or {}).items()
            if isinstance(v, list) and len(v) == 2
        }
        self._unsub = async_track_time_interval(self.hass, self._tick, timedelta(minutes=10))
        await self._tick(None)

    def async_stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None

    # --- Außenwerte --------------------------------------------------------
    def _layout_wx(self) -> dict[str, Any]:
        layout = self.hass.data.get(DOMAIN, {}).get("layout") or {}
        return layout.get("wx") or {}

    def outdoor(self) -> tuple[float | None, bool]:
        """Außentemperatur und ob die Sonne scheint (Sensor aus „Darstellung“, sonst Wetter)."""
        cfg = self._layout_wx()
        states = self.hass.states
        wid = cfg.get("entity")
        w = states.get(wid) if wid else None
        if w is None:
            ids = states.async_entity_ids("weather")
            w = states.get(ids[0]) if ids else None
        temp = None
        sensor = states.get(cfg["outdoor"]) if cfg.get("outdoor") else None
        for st, attr in ((sensor, None), (w, "temperature")):
            if st is None:
                continue
            try:
                temp = float(st.state if attr is None else st.attributes.get(attr))
                break
            except (TypeError, ValueError):
                continue
        return temp, bool(w is not None and w.state == "sunny")

    def _mean(self, temp: float | None) -> float | None:
        days = self.data["summer"]["days"]
        today = dt_util.now().date()
        keys = {(today - timedelta(days=i)).isoformat() for i in range(days)}
        total = sum(v[0] for k, v in self._daily.items() if k in keys)
        n = sum(v[1] for k, v in self._daily.items() if k in keys)
        return total / n if n else temp

    # --- Berechnung --------------------------------------------------------
    async def _tick(self, _now) -> None:
        temp, _ = self.outdoor()
        if temp is not None:
            iso = dt_util.now().date().isoformat()
            d = self._daily.setdefault(iso, [0.0, 0.0])
            d[0] += temp
            d[1] += 1
            for k in sorted(self._daily)[:-10]:
                del self._daily[k]
            self._store.async_delay_save(self._data, 300)
        await self.async_recalc()

    async def async_recalc(self) -> None:
        temp, sunny = self.outdoor()
        summer = summer_state(self.data["summer"], self._mean(temp), self.summer)
        delta = weather_delta(self.data["wxadj"], temp, sunny, self.delta)
        if summer == self.summer and delta == self.delta:
            return
        self.summer, self.delta = summer, delta
        from homeassistant.config_entries import ConfigEntryState  # noqa: PLC0415

        for entry in self.hass.config_entries.async_entries(DOMAIN):
            ctrl = getattr(entry, "runtime_data", None)
            if ctrl is not None and entry.state is ConfigEntryState.LOADED:
                await ctrl.async_general_changed()

    def delta_for(self, cfg: dict[str, Any]) -> float:
        return 0.0 if cfg.get("weather_adj") == "off" else self.delta

    def status(self) -> dict[str, Any]:
        temp, sunny = self.outdoor()
        why = None
        if self.delta:
            why = (
                f"Frost, {temp:.1f} °C draußen" if self.delta > 0
                else f"{'Sonne' if sunny else 'mild'}, {temp:.1f} °C draußen"
            )
        return {"summer": self.summer, "delta": self.delta, "why": why, "outdoor": temp}

    def _data(self) -> dict[str, Any]:
        return {"general": self.data, "daily": self._daily}

    async def async_set(self, raw: Any) -> dict[str, Any]:
        self.data = clean_general(raw)
        await self._store.async_save(self._data())
        await self.async_recalc()
        return self.data

    # --- Update-Hinweis ----------------------------------------------------
    async def async_update_info(self, current: str) -> dict[str, Any]:
        base = {"latest": current}
        if not self.data["updates"]:
            return base
        now = time.monotonic()
        if self._upd and now - self._upd[0] < UPDATE_CACHE_SECONDS:
            return self._upd[1]
        from homeassistant.helpers.aiohttp_client import async_get_clientsession  # noqa: PLC0415

        info = base
        try:
            sess = async_get_clientsession(self.hass)
            async with sess.get(
                f"https://api.github.com/repos/{GITHUB_REPO}/releases/latest",
                headers={"Accept": "application/vnd.github+json"},
                timeout=10,
            ) as resp:
                if resp.status == 200:
                    j = await resp.json()
                    tag = str(j.get("tag_name") or "").lstrip("vV")
                    if _tag_ok(tag):
                        info = {
                            "latest": tag,
                            "date": str(j.get("published_at") or "")[:10],
                            "notes": parse_notes(str(j.get("body") or "")),
                            "url": str(j.get("html_url") or ""),
                        }
        except Exception as err:  # noqa: BLE001  - Netzwerkfehler dürfen nie stören
            _LOGGER.debug("Update-Prüfung nicht möglich: %s", err)
        self._upd = (now, info)
        return info
