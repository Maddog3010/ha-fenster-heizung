"""Haus-Energiebuch: Herkunft und Verbleib des Stroms im ganzen Haus, alle 20 Sekunden mitgezählt.

Stundenmittel aus der Langzeitstatistik verrechnen Bezug und Einspeisung bzw. Laden und Entladen innerhalb
derselben Stunde (kurz über der PV-Leistung laden → Akku/Netz, danach Überschuss → im Mittel „alles Solar“).
Das Energiebuch zählt deshalb selbst mit – mit den Sensoren aus Einstellungen → Haus → Energiequellen.

Je Abschnitt werden zehn Werte in kWh gezählt (Reihenfolge = FIELDS):
  pv     Solar direkt ins Haus           bat   Akku entladen ins Haus      net   Netzbezug ins Haus
  exp    Einspeisung                     chg   Akku geladen                gen   PV erzeugt (alle Anlagen)
  imp    Netzbezug gesamt                pvb   Solar in den Akku           pvx   Solar ins Netz
  nb     Netz in den Akku                gen2  davon zweite Anlage (z. B. Balkonkraftwerk)
Regeln wie in Modul 19: Solar deckt zuerst das Haus, Überschuss geht zuerst in den Akku, der Rest ins Netz;
was der Akku darüber hinaus lädt, kam aus dem Netz.

Gespeichert: Stundenwerte 62 Tage, Tageswerte 800 Tage. Modul 19 (und später weitere Module) lesen sie über
fenster_heizung/ebuch.
"""
from __future__ import annotations

import logging
import time
from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import DOMAIN
from .geraete_calc import watts

_LOGGER = logging.getLogger(__name__)

FIELDS = ("pv", "bat", "net", "exp", "chg", "gen", "imp", "pvb", "pvx", "nb", "gen2")
_N = len(FIELDS)


def _pad(r: list) -> list[float] | None:
    """Ältere Zeilen (weniger Felder) mit Nullen auffüllen."""
    if not isinstance(r, list) or not 10 <= len(r) <= _N:
        return None
    try:
        return [float(x) for x in r] + [0.0] * (_N - len(r))
    except (TypeError, ValueError):
        return None
TICK_S = 20
MAX_DT_S = 120.0          # längere Lücken (Neustart, Sensor weg) werden nicht hochgerechnet
KEEP_HOURS_DAYS = 62
KEEP_DAYS = 800
SAVE_EVERY_S = 300


def split_flows(pv: float, grid_import: float, charge: float, discharge: float, pv2: float = 0.0) -> list[float]:
    """Leistungen (W) → die Werte in W (Reihenfolge FIELDS). pv ist die Summe aller Anlagen, pv2 der Anteil der zweiten."""
    pv = max(pv, 0.0)
    imp, exp = max(grid_import, 0.0), max(-grid_import, 0.0)
    chg, dis = max(charge, 0.0), max(discharge, 0.0)
    pv_x = min(exp, pv)
    pv_b = min(chg, max(pv - pv_x, 0.0))
    pv_h = max(pv - pv_x - pv_b, 0.0)
    n_b = min(max(chg - pv_b, 0.0), imp)
    n_h = max(imp - n_b, 0.0)
    return [pv_h, dis, n_h, exp, chg, pv, imp, pv_b, pv_x, n_b, max(pv2, 0.0)]


class EnergiebuchManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_energiebuch")
        self.hours: dict[str, dict[str, list[float]]] = {}   # "JJJJ-MM-TT" → {"0".."23": [10 Werte]}
        self.days: dict[str, list[float]] = {}               # "JJJJ-MM-TT" → [10 Werte]
        self.first = 0.0                                     # Zeitpunkt des ersten gezählten Abschnitts
        self.ok = False                                      # Sensoren vorhanden?
        self.last_err = ""
        self._ts = 0.0
        self._saved = 0.0
        self._unsubs: list[CALLBACK_TYPE] = []

    async def async_start(self) -> None:
        d = await self._store.async_load()
        if isinstance(d, dict):
            self.first = float(d.get("first") or 0)
            for k, v in (d.get("hours") or {}).items():
                if isinstance(v, dict):
                    self.hours[str(k)] = {str(h): p for h, r in v.items() if (p := _pad(r)) is not None}
            for k, v in (d.get("days") or {}).items():
                if (p := _pad(v)) is not None:
                    self.days[str(k)] = p
        self._ts = time.time()
        self._unsubs.append(async_track_time_interval(self.hass, self._tick, timedelta(seconds=TICK_S)))

    def async_stop(self) -> None:
        for u in self._unsubs:
            u()
        self._unsubs.clear()
        self._save(now=True)

    def _save(self, now: bool = False) -> None:
        self._saved = time.time()
        self._store.async_delay_save(lambda: {"first": self.first, "hours": self.hours, "days": self.days}, 1 if now else 10)

    # ------------------------------------------------------------ Sensoren lesen (Einstellungen → Haus → Energiequellen)
    def _w(self, eid: str) -> float | None:
        if not eid:
            return None
        st = self.hass.states.get(eid)
        return watts(st.state, st.attributes.get("unit_of_measurement")) if st is not None else None

    def _powers(self) -> tuple[float, float, float, float, float] | None:
        haus = self.hass.data.get(DOMAIN, {}).get("haus")
        en = ((haus.data if haus is not None else {}) or {}).get("energy") or {}
        ent = en.get("ent") or {}
        pv1, pv2 = self._w(ent.get("pv", "")), self._w(ent.get("pv2", ""))
        g = self._w(ent.get("grid", ""))
        if (pv1 is None and pv2 is None) or g is None:
            return None  # ohne Solar- und Netzleistung lässt sich nichts zuordnen
        grid_import = g if en.get("sign") == "import" else -g
        if en.get("bmode") == "two":
            chg, dis = max(self._w(ent.get("bchg", "")) or 0.0, 0.0), max(self._w(ent.get("bdis", "")) or 0.0, 0.0)
        else:
            b = self._w(ent.get("bat", "")) or 0.0
            b = b if en.get("bsign", "charge") == "charge" else -b
            chg, dis = max(b, 0.0), max(-b, 0.0)
        return (pv1 or 0.0) + (pv2 or 0.0), grid_import, chg, dis, (pv2 or 0.0)

    # ------------------------------------------------------------ Takt
    async def _tick(self, _now: Any = None) -> None:
        now = time.time()
        dt = now - self._ts
        self._ts = now
        p = self._powers()
        self.ok = p is not None
        if p is None or dt <= 0 or dt > MAX_DT_S:
            return
        flows = split_flows(*p)
        ln = dt_util.now()
        day, hr = ln.strftime("%Y-%m-%d"), str(ln.hour)
        hrow = self.hours.setdefault(day, {}).setdefault(hr, [0.0] * _N)
        drow = self.days.setdefault(day, [0.0] * _N)
        for i, w in enumerate(flows):
            kwh = w * dt / 3_600_000
            hrow[i] += kwh
            drow[i] += kwh
        if not self.first:
            self.first = now - dt
        self._prune(ln)
        if now - self._saved >= SAVE_EVERY_S:
            self._save()

    def _prune(self, ln: datetime) -> None:
        cut_h = (ln - timedelta(days=KEEP_HOURS_DAYS)).strftime("%Y-%m-%d")
        cut_d = (ln - timedelta(days=KEEP_DAYS)).strftime("%Y-%m-%d")
        for k in [k for k in self.hours if k < cut_h]:
            del self.hours[k]
        for k in [k for k in self.days if k < cut_d]:
            del self.days[k]

    # ------------------------------------------------------------ Abfrage
    def covers(self, start_ts: float) -> bool:
        """Hat das Energiebuch ab diesem Zeitpunkt (Sekunden) lückenlos gezählt?"""
        return bool(self.first) and self.first <= start_ts + 60

    def totals(self, start: str, end: str) -> dict[str, float]:
        """Summe der Tageswerte von start (inkl.) bis end (exkl.), JJJJ-MM-TT, als Name → kWh."""
        t = [0.0] * _N
        for day, v in self.days.items():
            if start <= day < end:
                for i, x in enumerate(v):
                    t[i] += x
        out = dict(zip(FIELDS, t))
        out["use"] = out["pv"] + out["bat"] + out["net"]
        return out

    def query(self, start: str, end: str, res: str) -> dict[str, Any]:
        """start/end JJJJ-MM-TT (end exklusiv). res „hour“: Stundenwerte, sonst Tageswerte."""
        rows: list[dict[str, Any]] = []
        if res == "hour":
            for day in sorted(k for k in self.hours if start <= k < end):
                for h, v in sorted(self.hours[day].items(), key=lambda x: int(x[0])):
                    rows.append({"d": day, "h": int(h), "v": [round(x, 5) for x in v]})
        else:
            for day in sorted(k for k in self.days if start <= k < end):
                rows.append({"d": day, "v": [round(x, 5) for x in self.days[day]]})
        return {"ok": self.ok, "first": self.first, "fields": list(FIELDS), "rows": rows, "hours_from": min(self.hours) if self.hours else ""}
