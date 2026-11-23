"""Weihnachts-Theme Build 1: Saison-Erkennung, Phasen, Adventskerzen, Countdown, Datum simulieren.

Die Weihnachtszeit läuft jedes Jahr vom 01.12. 00:00 bis 27.12. 23:59 (Zeitzone von Home Assistant):
  advent (1.–23.12.), heiligabend (24.12.), feiertage (25.–26.12.), ausklang (27.12.), sonst aus.
Die Adventssonntage werden jedes Jahr neu berechnet (4. Advent = letzter Sonntag vor dem 25.12., 2028 also der 24.12.).

Einstellung „Saison-Theme“ (für alle Nutzer): auto (nach Datum), an (immer), aus (nie), akzente (nach Datum, ohne Bewegung).
Die Entitäten folgen immer dem echten Datum. „Datum simulieren“ (nur mit Entwickler-Zugang) verschiebt nur das Theme im
Dashboard – Heizpläne, Statistiken, Automationen und die Entitäten bleiben bei der echten Zeit. Die Simulation liegt nur im
Speicher: Sie endet nach der eingestellten Dauer (höchstens 8 Stunden) oder mit dem nächsten Neustart.
Die reine Logik oben braucht kein Home Assistant und ist in tests/test_saison.py geprüft.
"""
from __future__ import annotations

import logging
import time
from datetime import date, datetime, timedelta
from typing import Any

from homeassistant.util import dt as dt_util

try:
    from homeassistant.core import callback
except ImportError:  # Tests ohne Home Assistant
    def callback(f):  # type: ignore[no-redef]
        return f

from .backup import SafeStore

_LOGGER = logging.getLogger(__name__)

SCHEMA = 1
START_TAG, ENDE_TAG = 1, 27  # Dezember
PHASEN = ("aus", "advent", "heiligabend", "feiertage", "ausklang")
MODI = ("auto", "an", "aus", "akzente")
SIM_MIN, SIM_MAX = 5, 480  # Minuten
SIGNAL = "fenster_heizung_saison"


# ------------------------------------------------------------------ reine Logik
def advent_sonntage(jahr: int) -> list[date]:
    """1. bis 4. Advent. Der 4. Advent ist der letzte Sonntag vor dem 25.12. (fällt Heiligabend auf einen Sonntag, ist er es)."""
    xmas = date(jahr, 12, 25)
    vierter = xmas - timedelta(days=(xmas.weekday() + 1) % 7 or 7)
    return [vierter - timedelta(weeks=3 - i) for i in range(4)]


def in_saison(d: date) -> bool:
    return d.month == 12 and START_TAG <= d.day <= ENDE_TAG


def phase(d: date) -> str:
    if not in_saison(d):
        return "aus"
    if d.day <= 23:
        return "advent"
    if d.day == 24:
        return "heiligabend"
    if d.day <= 26:
        return "feiertage"
    return "ausklang"


def kerzen(d: date) -> int:
    """Brennende Kerzen: ab dem 1. Advent bis zum Ende der Weihnachtszeit (27.12.), sonst 0."""
    if d > date(d.year, 12, ENDE_TAG):
        return 0
    return sum(1 for s in advent_sonntage(d.year) if s <= d)


def tage_bis_heiligabend(d: date) -> int:
    """Tage bis zum nächsten Heiligabend (am 24.12. selbst 0, ab dem 25.12. zählt der nächste)."""
    ha = date(d.year, 12, 24)
    if d > ha:
        ha = date(d.year + 1, 12, 24)
    return (ha - d).days


def zustand(d: date, modus: str = "auto") -> dict[str, Any]:
    """Alles, was das Dashboard für ein Datum braucht. sichtbar: Theme wird gezeigt, bewegt: mit Lichter-Animation."""
    ph = phase(d)
    if modus == "an" and ph == "aus":
        ph = "advent"  # „Immer an“ außerhalb der Weihnachtszeit: Advents-Optik
    sichtbar = modus == "an" or (modus in ("auto", "akzente") and in_saison(d))
    return {
        "datum": d.isoformat(), "phase": ph, "sichtbar": sichtbar, "bewegt": sichtbar and modus != "akzente",
        "kerzen": kerzen(d), "tage": tage_bis_heiligabend(d), "advent_sonntage": [s.isoformat() for s in advent_sonntage(d.year)],
    }


def default_cfg() -> dict[str, Any]:
    return {"modus": "auto", "lichter": True, "countdown": True, "icons": True}


def clean_cfg(raw: Any, old: dict[str, Any] | None = None) -> dict[str, Any]:
    c = dict(old or default_cfg())
    r = raw if isinstance(raw, dict) else {}
    if r.get("modus") in MODI:
        c["modus"] = r["modus"]
    for k in ("lichter", "countdown", "icons"):
        if isinstance(r.get(k), bool):
            c[k] = r[k]
    return c


def parse_sim(at: Any) -> datetime | None:
    """„2026-12-24T08:00“ oder „2026-12-24“ (dann 08:00). Jahre 2000–2099, sonst None."""
    s = str(at or "").strip()[:16]
    try:
        d = datetime.fromisoformat(s if "T" in s else s + "T08:00")
    except ValueError:
        return None
    return d.replace(second=0, microsecond=0, tzinfo=None) if 2000 <= d.year <= 2099 else None


# ------------------------------------------------------------------ Manager
class SaisonManager:
    """Speicher fenster_heizung_saison (Schema 1): nur die Einstellungen. Die Simulation bleibt im Arbeitsspeicher."""

    def __init__(self, hass) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, "fenster_heizung_saison")
        self.cfg = default_cfg()
        self.sim_offset = 0.0  # Sekunden, um die das Theme-Datum verschoben ist
        self.sim_until = 0.0  # Zeitpunkt (time.time()), an dem die Simulation endet
        self._unsubs: list = []
        self._last = ""

    async def async_start(self) -> None:
        d = await self._store.async_load()
        if isinstance(d, dict):
            self.cfg = clean_cfg(d.get("cfg"))
        if self.hass is not None:
            from homeassistant.helpers.event import async_track_time_change

            # Jede Minute prüfen: Tageswechsel um 00:00 ohne Neustart, Ende der Simulation
            self._unsubs.append(async_track_time_change(self.hass, self._tick, second=5))
            self._tick()  # Entitäten sofort mit dem echten Datum füllen

    def async_stop(self) -> None:
        for u in self._unsubs:
            u()
        self._unsubs = []

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"v": SCHEMA, "cfg": self.cfg}, 1)

    # ---- Zeit
    def _now(self) -> datetime:
        return dt_util.now().replace(tzinfo=None)

    def sim_active(self) -> bool:
        if self.sim_until and time.time() >= self.sim_until:
            self.sim_offset, self.sim_until = 0.0, 0.0
        return bool(self.sim_until)

    def theme_now(self) -> datetime:
        n = self._now()
        return n + timedelta(seconds=self.sim_offset) if self.sim_active() else n

    # ---- Abfragen
    def real(self) -> dict[str, Any]:
        """Echtes Datum – für die Entitäten (unabhängig von Einstellung und Simulation)."""
        d = self._now().date()
        return {**zustand(d, "auto"), "in_saison": in_saison(d)}

    def snapshot(self, dev: bool = False) -> dict[str, Any]:
        on = self.sim_active()
        t = self.theme_now()
        return {
            "cfg": self.cfg, "theme": zustand(t.date(), self.cfg["modus"]), "real": self.real(), "dev": bool(dev),
            "sim": {"on": on, "offset": round(self.sim_offset) if on else 0, "at": t.isoformat(timespec="minutes") if on else "",
                    "until": round(self.sim_until) if on else 0},
            "start": f"{START_TAG:02d}.12.", "ende": f"{ENDE_TAG:02d}.12.",
        }

    # ---- Änderungen
    def set_cfg(self, raw: Any) -> dict[str, Any]:
        self.cfg = clean_cfg(raw, self.cfg)
        self._save()
        return self.cfg

    def set_sim(self, at: Any, minutes: Any = 60) -> bool:
        d = parse_sim(at)
        if d is None:
            return False
        try:
            m = max(SIM_MIN, min(SIM_MAX, int(minutes)))
        except (TypeError, ValueError):
            m = 60
        self.sim_offset = (d - self._now()).total_seconds()
        self.sim_until = time.time() + m * 60
        return True

    def stop_sim(self) -> None:
        self.sim_offset, self.sim_until = 0.0, 0.0

    # ---- Takt
    @callback   # 2026.11.4.3b2: im Event-Loop – sonst lief der Minutentakt in einem Hilfs-Thread und der Tageswechsel (Signal) schlug still fehl
    def _tick(self, _now: Any = None) -> None:
        self.sim_active()  # beendet eine abgelaufene Simulation
        key = self._now().date().isoformat()
        if key != self._last and self.hass is not None:
            self._last = key
            try:
                from homeassistant.helpers.dispatcher import async_dispatcher_send

                async_dispatcher_send(self.hass, SIGNAL)
            except Exception:  # noqa: BLE001 - die Entitäten sind ein Zusatz
                _LOGGER.debug("Saison-Signal fehlgeschlagen", exc_info=True)

    def diag(self) -> dict[str, Any]:
        return {"cfg": self.cfg, "sim": self.sim_active(), "real": self.real()}
