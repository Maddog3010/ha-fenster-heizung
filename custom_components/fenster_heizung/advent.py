"""Weihnachts-Theme Build 2: Adventskalender.

Inhalte: advent/<jahr>.yaml (24 Türchen). Fehlt die Datei für ein Jahr, gilt die letzte vorhandene.
Speicher fenster_heizung_advent (Schema 1): Einstellungen und je Jahr die geöffneten Türchen mit Zeitpunkt –
gemeinsam für alle oder je Home-Assistant-Benutzer (Einstellung „Stand“).

Türchen-Zustände: offen · heute · nachholen · gesperrt · rueckblick. Öffnen geht vom 01.12. bis 27.12.
(Türchen bis heute), ab 28.12. bis 06.01. ist der Kalender nur noch zum Nachlesen da, danach ausgeblendet.
Läuft im Weihnachts-Theme „Datum simulieren“ (nur Entwickler), gilt dessen Datum – geöffnete Türchen landen dann nur
im Arbeitsspeicher und sind mit dem Ende der Simulation wieder zu. Der echte Stand bleibt unberührt.

Beim Öffnen kommt das Ereignis strom_waerme_advent_geoeffnet (tag, typ, titel, jahr, benutzer) für eigene Automationen.
Die reine Logik oben braucht kein Home Assistant und ist in tests/test_advent.py geprüft.
"""
from __future__ import annotations

import logging
import pathlib
import re
from datetime import date, datetime
from typing import Any

from homeassistant.util import dt as dt_util

from .backup import SafeStore

_LOGGER = logging.getLogger(__name__)

SCHEMA = 1
EVENT = "strom_waerme_advent_geoeffnet"
SIGNAL = "fenster_heizung_advent"
TYPEN = ("tipp", "statistik", "deko", "funktion", "raetsel", "besonders")
VARIANTEN = ("A", "B")
STAENDE = ("gemeinsam", "benutzer")
SCHNEE = ("aus", "leicht")
DIR = pathlib.Path(__file__).parent / "advent"
_NOTIFY = re.compile(r"^notify\.[a-z0-9_]+$")
_TIME = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")
_UID = re.compile(r"^[a-zA-Z0-9_-]{1,64}$")
GEMEINSAM = "gemeinsam"


# ------------------------------------------------------------------ reine Logik
def sichtbar(d: date) -> bool:
    """Kalender zu sehen: 01.12. bis 06.01."""
    return (d.month == 12) or (d.month == 1 and d.day <= 6)


def kalender_jahr(d: date) -> int:
    return d.year - 1 if d.month == 1 else d.year


def tuer_status(tag: int, heute: date, geoeffnet: set[int] | dict) -> str:
    """offen | heute | nachholen | gesperrt | rueckblick"""
    if tag in geoeffnet:
        return "offen"
    if not sichtbar(heute):
        return "gesperrt"
    if heute.month == 1 or heute.day > 27:
        return "rueckblick"
    if tag > heute.day:
        return "gesperrt"
    return "heute" if tag == heute.day else "nachholen"


def clean_tuer(raw: Any) -> dict[str, Any] | None:
    if not isinstance(raw, dict):
        return None
    try:
        tag = int(raw.get("tag"))
    except (TypeError, ValueError):
        return None
    if not 1 <= tag <= 24:
        return None
    t = {
        "tag": tag, "typ": raw.get("typ") if raw.get("typ") in TYPEN else "tipp",
        "icon": str(raw.get("icon") or "🎁")[:4], "titel": str(raw.get("titel") or f"Türchen {tag}")[:80],
        "text": str(raw.get("text") or "")[:600],
    }
    if raw.get("daten") and raw.get("mit_daten"):
        t["daten"], t["mit_daten"] = str(raw["daten"])[:30], str(raw["mit_daten"])[:600]
    if raw.get("modul"):
        t["modul"] = str(raw["modul"])[:6]
    return t


def parse_inhalt(raw: Any) -> dict[int, dict[str, Any]]:
    """YAML-Inhalt → {tag: tür}. Doppelte Tage: der erste gilt."""
    out: dict[int, dict[str, Any]] = {}
    for x in (raw or {}).get("tuerchen") or [] if isinstance(raw, dict) else []:
        t = clean_tuer(x)
        if t and t["tag"] not in out:
            out[t["tag"]] = t
    return out


def datei_fuer(jahr: int, vorhanden: list[int]) -> int | None:
    """Datei für das Jahr, sonst die letzte vorhandene davor, sonst die früheste."""
    if not vorhanden:
        return None
    vorher = [j for j in vorhanden if j <= jahr]
    return max(vorher) if vorher else min(vorhanden)


def default_cfg() -> dict[str, Any]:
    return {"variante": "A", "stand": GEMEINSAM, "schnee": "aus", "notify": {"on": False, "zeit": "07:00", "dienst": ""}}


def clean_cfg(raw: Any, old: dict[str, Any] | None = None) -> dict[str, Any]:
    c = dict(old or default_cfg())
    c["notify"] = dict(c.get("notify") or default_cfg()["notify"])
    r = raw if isinstance(raw, dict) else {}
    if r.get("variante") in VARIANTEN:
        c["variante"] = r["variante"]
    if r.get("stand") in STAENDE:
        c["stand"] = r["stand"]
    if r.get("schnee") in SCHNEE:
        c["schnee"] = r["schnee"]
    n = r.get("notify") if isinstance(r.get("notify"), dict) else {}
    if isinstance(n.get("on"), bool):
        c["notify"]["on"] = n["on"]
    if isinstance(n.get("zeit"), str) and _TIME.match(n["zeit"]):
        c["notify"]["zeit"] = n["zeit"]
    if isinstance(n.get("dienst"), str) and (n["dienst"] == "" or _NOTIFY.match(n["dienst"])):
        c["notify"]["dienst"] = n["dienst"]
    return c


def clean_offen(raw: Any) -> dict[str, str]:
    out: dict[str, str] = {}
    if isinstance(raw, dict):
        for k, v in raw.items():
            if str(k).isdigit() and 1 <= int(k) <= 24 and isinstance(v, str):
                out[str(int(k))] = v[:25]
    return out


# ------------------------------------------------------------------ Manager
class AdventManager:
    def __init__(self, hass) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, "fenster_heizung_advent")
        self.cfg = default_cfg()
        self.jahre: dict[str, dict[str, dict[str, str]]] = {}  # "2026" → {"gemeinsam"|user_id → {"3": iso}}
        self.sim_offen: dict[str, dict[str, str]] = {}  # nur während einer Simulation
        self._inhalt: dict[int, dict[int, dict[str, Any]]] = {}
        self._dateien: list[int] = []
        self._unsubs: list = []
        self._notified = ""

    async def async_start(self) -> None:
        d = await self._store.async_load()
        if isinstance(d, dict):
            self.cfg = clean_cfg(d.get("cfg"))
            for j, users in (d.get("jahre") or {}).items() if isinstance(d.get("jahre"), dict) else []:
                if str(j).isdigit() and isinstance(users, dict):
                    self.jahre[str(j)] = {str(u)[:64]: clean_offen(o) for u, o in users.items() if _UID.match(str(u))}
        await self._load_files()
        if self.hass is not None:
            from homeassistant.helpers.event import async_track_time_change

            self._unsubs.append(async_track_time_change(self.hass, self._tick, second=20))

    async def _load_files(self) -> None:
        def _read() -> dict[int, Any]:
            import yaml

            out: dict[int, Any] = {}
            for p in sorted(DIR.glob("*.yaml")):
                if p.stem.isdigit():
                    try:
                        out[int(p.stem)] = yaml.safe_load(p.read_text(encoding="utf-8"))
                    except Exception:  # noqa: BLE001 - eine kaputte Datei darf den Start nicht verhindern
                        _LOGGER.warning("Adventskalender %s nicht lesbar", p.name)
            return out

        raw = await self.hass.async_add_executor_job(_read) if self.hass is not None else _read()
        self._inhalt = {j: parse_inhalt(r) for j, r in raw.items()}
        self._dateien = sorted(j for j, v in self._inhalt.items() if v)

    def async_stop(self) -> None:
        for u in self._unsubs:
            u()
        self._unsubs = []

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"v": SCHEMA, "cfg": self.cfg, "jahre": self.jahre}, 1)

    # ---- Zeit (Datum simulieren aus dem Weihnachts-Theme)
    def _saison(self):
        return self.hass.data.get("fenster_heizung", {}).get("saison") if self.hass is not None else None

    def sim(self) -> bool:
        s = self._saison()
        return bool(s is not None and s.sim_active())

    def heute(self) -> date:
        s = self._saison()
        if s is not None:
            return s.theme_now().date()
        return dt_util.now().date()

    # ---- Inhalt und Stand
    def inhalt(self, jahr: int) -> dict[int, dict[str, Any]]:
        j = datei_fuer(jahr, self._dateien)
        return self._inhalt.get(j, {}) if j is not None else {}

    def _key(self, user_id: str | None) -> str:
        return str(user_id) if self.cfg["stand"] == "benutzer" and user_id and _UID.match(str(user_id)) else GEMEINSAM

    def _bucket(self, jahr: int, user_id: str | None, create: bool = False) -> dict[str, str]:
        if self.sim():
            if not create:
                return self.sim_offen.get(self._key(user_id), {})
            return self.sim_offen.setdefault(self._key(user_id), {})
        if not create:
            return self.jahre.get(str(jahr), {}).get(self._key(user_id), {})
        return self.jahre.setdefault(str(jahr), {}).setdefault(self._key(user_id), {})

    def snapshot(self, user_id: str | None = None, dev: bool = False) -> dict[str, Any]:
        if not self.sim():
            self.sim_offen = {}
        heute = self.heute()
        jahr = kalender_jahr(heute)
        inh, offen = self.inhalt(jahr), self._bucket(jahr, user_id)
        tueren = []
        for tag in range(1, 25):
            st = tuer_status(tag, heute, {int(k) for k in offen})
            t = inh.get(tag) or {"tag": tag, "typ": "tipp", "icon": "🎁", "titel": f"Türchen {tag}", "text": ""}
            row: dict[str, Any] = {"tag": tag, "st": st, "typ": t["typ"]}
            if st in ("offen", "rueckblick") or dev:
                row["t"] = t
            if str(tag) in offen:
                row["am"] = offen[str(tag)]
            tueren.append(row)
        return {"cfg": self.cfg, "jahr": jahr, "heute": heute.isoformat(), "sichtbar": sichtbar(heute), "sim": self.sim(),
                "dev": bool(dev), "tueren": tueren, "offen": len(offen), "haben_inhalt": bool(inh)}

    def count(self) -> dict[str, Any]:
        """Für den Sensor (echtes Datum): geöffnete Türchen (gemeinsam bzw. der weiteste Benutzer), heutiges noch zu?"""
        d = dt_util.now().date()
        j = self.jahre.get(str(kalender_jahr(d)), {})
        n = max((len(v) for v in j.values()), default=0)
        auf = any(str(d.day) in v for v in j.values())
        return {"n": n, "heute_verfuegbar": bool(d.month == 12 and d.day <= 24 and not auf), "jahr": kalender_jahr(d)}

    # ---- Änderungen
    def set_cfg(self, raw: Any) -> dict[str, Any]:
        self.cfg = clean_cfg(raw, self.cfg)
        self._save()
        return self.cfg

    def open(self, tag: int, user_id: str | None = None, user_name: str = "") -> dict[str, Any]:
        heute = self.heute()
        jahr = kalender_jahr(heute)
        try:
            tag = int(tag)
        except (TypeError, ValueError):
            return {"ok": False, "err": "tag"}
        if not 1 <= tag <= 24:
            return {"ok": False, "err": "tag"}
        offen = self._bucket(jahr, user_id)
        st = tuer_status(tag, heute, {int(k) for k in offen})
        if st == "gesperrt":
            return {"ok": False, "err": "gesperrt", "tage": max(0, tag - heute.day) if heute.month == 12 else None}
        t = self.inhalt(jahr).get(tag) or {"tag": tag, "typ": "tipp", "icon": "🎁", "titel": f"Türchen {tag}", "text": ""}
        neu = st in ("heute", "nachholen")
        if neu:
            self._bucket(jahr, user_id, True)[str(tag)] = datetime.now().isoformat(timespec="seconds")
            if not self.sim():
                self._save()
                self._push()
            self._fire({"tag": tag, "typ": t["typ"], "titel": t["titel"], "jahr": jahr, "benutzer": user_name or "", "simuliert": self.sim()})
        return {"ok": True, "neu": neu, "t": t, "st": "offen" if neu else st}

    def reset(self) -> None:
        if self.sim():
            self.sim_offen = {}
            return
        self.jahre.pop(str(kalender_jahr(self.heute())), None)
        self._save()
        self._push()

    def _fire(self, data: dict[str, Any]) -> None:
        if self.hass is not None:
            try:
                self.hass.bus.async_fire(EVENT, data)
            except Exception:  # noqa: BLE001 - das Ereignis ist ein Zusatz
                _LOGGER.debug("Advent-Ereignis fehlgeschlagen", exc_info=True)

    def _push(self) -> None:
        if self.hass is not None:
            try:
                from homeassistant.helpers.dispatcher import async_dispatcher_send

                async_dispatcher_send(self.hass, SIGNAL)
            except Exception:  # noqa: BLE001
                _LOGGER.debug("Advent-Signal fehlgeschlagen", exc_info=True)

    # ---- Benachrichtigung und Tageswechsel
    async def _tick(self, now: Any = None) -> None:
        n = dt_util.now()
        if n.hour == 0 and n.minute == 0:
            self._push()  # Sensor: neues Türchen verfügbar
        c = self.cfg["notify"]
        if not (c["on"] and c["dienst"]) or n.strftime("%H:%M") != c["zeit"]:
            return
        d = n.date()
        if not (d.month == 12 and d.day <= 24) or self._notified == d.isoformat():
            return
        self._notified = d.isoformat()
        t = self.inhalt(d.year).get(d.day) or {}
        dom, name = c["dienst"].split(".", 1)
        if not self.hass.services.has_service(dom, name):
            return
        try:
            await self.hass.services.async_call(dom, name, {
                "title": f"🎄 Türchen {d.day} ist da!", "message": t.get("titel") or "Dein Adventskalender in Strom & Wärme",
                "data": {"url": "/fenster-heizung", "clickAction": "/fenster-heizung"}}, blocking=False)
        except Exception:  # noqa: BLE001 - eine fehlende Mitteilung darf nichts anderes stören
            _LOGGER.debug("Advent-Mitteilung fehlgeschlagen", exc_info=True)


def async_register_services(hass) -> None:
    """Dienste advent_tuer_oeffnen (Türchen öffnen, z. B. per NFC-Tag) und advent_zuruecksetzen (nur mit Entwickler-Zugang)."""
    import voluptuous as vol

    def mgr() -> AdventManager | None:
        return hass.data.get("fenster_heizung", {}).get("advent")

    async def tuer(call: Any) -> None:
        m = mgr()
        if m is None:
            return
        tag = call.data.get("tag") or m.heute().day
        uid = call.context.user_id if call.context else None
        name = ""
        if uid:
            u = await hass.auth.async_get_user(uid)
            name = u.name if u else ""
        m.open(tag, uid, name)

    async def reset(call: Any) -> None:
        m, spn = mgr(), hass.data.get("fenster_heizung", {}).get("sponsor")
        if m is not None and spn is not None and getattr(spn, "priv", ""):
            m.reset()

    for name, fn, schema in (("advent_tuer_oeffnen", tuer, vol.Schema({vol.Optional("tag"): vol.All(int, vol.Range(min=1, max=24))})),
                             ("advent_zuruecksetzen", reset, vol.Schema({}))):
        if not hass.services.has_service("fenster_heizung", name):
            hass.services.async_register("fenster_heizung", name, fn, schema=schema)
