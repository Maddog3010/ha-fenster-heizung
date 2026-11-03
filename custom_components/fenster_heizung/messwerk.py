"""Messwerk (Stufe M1): alle Sensoren der Module 1–19 an einer Stelle.

Das Messwerk sammelt jede Entität, die irgendwo in der Integration eingestellt ist (Haus, Räume, Modul 2 bis 19,
Labs, Tablet-Modus, Personen), und ordnet sie einer Aufgabe zu („Netzleistung“, „Fenster · Bad“). Daraus entsteht
für jeden Sensor die Liste „genutzt in“: welche Module ihn wofür verwenden. Dazu kommt eine laufende Prüfung
(liefert, fehlt in Home Assistant, Einheit) und Hinweise auf doppelte oder abweichende Zuordnungen.

In M1 bleibt jede Einstellung an ihrer bisherigen Stelle. Das Messwerk liest nur und zeigt an, wo ein Sensor
eingestellt wird. Zuordnen und Tauschen direkt im Messwerk folgen in M2 und M3.

Der eigene Speicher hält die Schema-Version, den Zeitpunkt der ersten Übernahme und wann ein Sensor zuerst und
zuletzt gesehen wurde (für „fehlt seit …“).
"""
from __future__ import annotations

import logging
import re
import time
from typing import Any, Iterator

from homeassistant.core import HomeAssistant

from .backup import SafeStore
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

SCHEMA = 1
EID = re.compile(r"^[a-z_]+\.[a-z0-9_]{1,200}$")
SKIP_DOMAINS = {"notify", "tts"}
# Gruppen der Aufgaben
GROUPS = {"strom": "Strom", "klima": "Klima", "fenster": "Fenster & Türen", "wetter": "Wetter", "wasser": "Wasser & Wärme",
          "geraete": "Geräte", "auto": "Fahrzeug", "sicher": "Sicherheit", "alltag": "Alltag", "person": "Personen", "sonst": "Sonstiges"}
MODN = {1: "Fenster & Heizung", 2: "Warmwasser", 3: "Energie", 4: "Gerätestrom", 8: "E-Auto & Wallbox", 9: "Wetter",
        11: "Sicherheit", 13: "Batterie", 16: "Solar-Prognose", 17: "Müllabfuhr", 18: "Licht", 19: "Hausfluss"}

# Haus-Aufgaben: Pfad im Haus-Speicher → (Aufgabe, Gruppe, Einheit-Regel, [(Modul, Zweck)])
HAUS = {
    "energy.ent.pv": ("Solarleistung", "strom", "power", [(3, "Bilanz und Autarkie"), (4, "Woher der Gerätestrom kommt"), (8, "Laden mit Sonne"), (13, "Batterie laden"), (19, "Linie Solar im Hausfluss")]),
    "energy.ent.pv2": ("Zweite Solaranlage", "strom", "power", [(3, "wird zur Solarleistung addiert"), (19, "zweite Anlage im Hausfluss")]),
    "energy.ent.grid": ("Netzleistung", "strom", "power", [(1, "PV-Überschuss für Elektroheizer"), (3, "Bilanz, Autarkie, Kosten"), (4, "Woher der Gerätestrom kommt"), (8, "Laden mit Sonne, Hausanschluss-Schutz"), (13, "Batterie laden und halten"), (19, "Linie Netz im Hausfluss")]),
    "energy.ent.house": ("Hausverbrauch", "strom", "power", [(3, "Verbrauch statt Berechnung"), (19, "Haus im Hausfluss")]),
    "energy.ent.bat": ("Batterieleistung", "strom", "power", [(3, "Laden und Entladen"), (4, "Strom aus der Batterie"), (13, "Batterie-Planung"), (19, "Linie Batterie im Hausfluss")]),
    "energy.ent.bchg": ("Batterie lädt", "strom", "power", [(3, "Laden"), (19, "Hausfluss")]),
    "energy.ent.bdis": ("Batterie entlädt", "strom", "power", [(3, "Entladen"), (19, "Hausfluss")]),
    "energy.ent.pve": ("Zähler Solar-Ertrag", "strom", "energy", [(3, "Tagessummen Woche, Monat, Jahr"), (16, "Vergleich mit der Prognose")]),
    "energy.ent.pve2": ("Zähler Ertrag zweite Anlage", "strom", "energy", [(3, "Tagessummen")]),
    "energy.ent.imp": ("Zähler Netzbezug", "strom", "energy", [(3, "Tagessummen und Kosten"), (4, "Kosten")]),
    "energy.ent.exp": ("Zähler Einspeisung", "strom", "energy", [(3, "Tagessummen und Vergütung")]),
    "soc": ("Ladestand Batterie", "strom", "pct", [(1, "Elektroheizer erst ab Ladestand"), (2, "Heizstab erst ab Ladestand"), (3, "Ring und Anzeige"), (8, "Laden aus der Batterie"), (13, "Grenzen der Batterie"), (19, "Ladestand im Hausfluss")]),
    "price.price_sensor": ("Strompreis", "strom", "price", [(1, "Vorteil im Bericht"), (3, "Kosten"), (4, "Kosten je Durchlauf"), (8, "Preisgrenze im Ladeplan")]),
    "price.feed_sensor": ("Einspeisevergütung", "strom", "price", [(1, "Vorteil im Bericht"), (3, "Vergütung"), (4, "entgangene Vergütung")]),
    "wx.entity": ("Wetter", "wetter", "", [(1, "Sommermodus und Wetter-Absenkung"), (9, "Warnungen und Vorhersage"), (0, "Wetter in Kopfkarte und Startseite")]),
    "wx.outdoor": ("Außentemperatur", "wetter", "temp", [(1, "Sommermodus und Wetter-Absenkung"), (2, "Frostschutz"), (9, "Frost- und Hitzewarnung"), (0, "Kopfkarte")]),
    "wx.wind": ("Wind", "wetter", "", [(9, "Sturmwarnung")]),
    "wx.official": ("Amtliche Warnungen", "wetter", "", [(9, "DWD- und NINA-Warnungen")]),
}
UNIT = {"power": re.compile(r"^k?W$"), "energy": re.compile(r"^[kM]?Wh$"), "pct": re.compile(r"^%$"), "temp": re.compile(r"^°[CF]$"), "price": re.compile(r"(ct|€|eur|cent)", re.I)}

# Räume (Modul 1): Optionsschlüssel → (Aufgabe, Gruppe, Zweck, Einheit)
ROOM = {
    "window_sensors": ("Fenster", "fenster", "Heizung pausieren, wenn offen", ""),
    "thermostats": ("Thermostat", "klima", "Heizen, Absenken, Pausieren", ""),
    "humidity_sensor": ("Luftfeuchte", "klima", "Lüftungs- und Schimmelhinweis", "pct"),
    "room_temp_sensor": ("Raumtemperatur", "klima", "Anzeige, Aufheizen lernen, Regeln", "temp"),
    "outdoor_sensor": ("Außentemperatur (Raum)", "wetter", "Fenstermeldung nur unter Höchsttemperatur", "temp"),
    "heating_entity": ("Heizung", "klima", "Fenstermeldung nur bei laufender Heizung", ""),
    "htr_entity": ("Elektroheizer", "geraete", "Heizen mit PV-Überschuss", ""),
}

# Weitere Speicher: Schlüssel in hass.data → (Modul, Bereich der Oberfläche, Gruppe, {Pfadteil: Zweck})
SOURCES = {
    "wasser.cfg": (2, "Modul 2 · Einstellungen", "wasser", {"top": "Speicher oben", "mid": "Speicher Mitte", "bot": "Speicher unten", "src": "Wärmeerzeuger", "rod": "Heizstab", "pump": "Zirkulationspumpe", "ret": "Rücklauf Zirkulation", "trig": "Auslöser Zirkulation"}),
    "wallbox.cfg": (8, "Modul 8 · Einstellungen", "auto", {}),
    "wetter.cfg": (9, "Modul 9 · Einstellungen", "wetter", {"acts": "Aktion bei einer Warnung"}),
    "sicherheit.cfg": (11, "Modul 11 · Einstellungen", "sicher", {"bat": "Batterie des Melders", "depart": "Abfahrt-Prüfung", "acts": "Aktion bei Alarm", "frost": "Frost bei Abfahrt"}),
    "muell.cfg": (17, "Modul 17 · Einstellungen", "alltag", {"cal": "Abfallkalender", "tts": "Ansage", "player": "Lautsprecher", "light": "Licht als Erinnerung"}),
    "entfeuchter.cfg": (1, "Modul 1 › Geräte › Luftentfeuchter", "geraete", {"ent": "Luftentfeuchter schalten", "power": "Leistung (läuft er wirklich?)", "tank": "Wassertank voll"}),
    "fluss.cfg": (19, "Modul 19 · Einstellungen", "strom", {}),
    "tags.cfg": (0, "Lab Tags & Karten", "alltag", {}),
    "solar.cfg": (16, "Modul 16 · Einstellungen", "strom", {"fc_sensor": "Prognose-Sensor", "act": "Ertrag für den Vergleich"}),
    "tablet.tablets": (0, "Tablet-Modus", "sonst", {"motion": "Display wecken bei Bewegung"}),
    "presence.data": (0, "Personen & Standort", "person", {"trackers": "Standort", "wifi": "WLAN-/Router-Erkennung"}),
}
GS_GROUP = "geraete"


def walk(x: Any, path: str = "") -> Iterator[tuple[str, str]]:
    """Alle Entitäts-IDs in einem Speicher, mit Pfad. Schlüssel zählen mit (z. B. Thermostate in batsrc)."""
    if isinstance(x, dict):
        for k, v in x.items():
            ks = str(k)
            if EID.match(ks) and ks.split(".")[0] not in SKIP_DOMAINS:
                yield f"{path}.{ks}" if path else ks, ks
            yield from walk(v, f"{path}.{ks}" if path else ks)
    elif isinstance(x, (list, tuple)):
        for i, v in enumerate(x):
            yield from walk(v, f"{path}[{i}]")
    elif isinstance(x, str) and EID.match(x) and x.split(".")[0] not in SKIP_DOMAINS:
        yield path, x


def _purpose(path: str, table: dict[str, str]) -> str:
    for part in reversed(re.split(r"[.\[\]]+", path)):
        if part in table:
            return table[part]
    last = [p for p in re.split(r"[.\[\]]+", path) if p and not p.isdigit()]
    return (last[-1] if last else path).replace("_", " ")


class Messwerk:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_messwerk")
        self.data: dict[str, Any] = {"v": SCHEMA, "mig": None, "seen": {}}
        self._cache: tuple[float, dict[str, Any]] | None = None

    async def async_start(self) -> None:
        d = await self._store.async_load()
        if isinstance(d, dict) and d.get("v"):
            self.data = {"v": SCHEMA, "mig": d.get("mig"), "seen": d.get("seen") if isinstance(d.get("seen"), dict) else {}}
        snap = self._collect()
        if not self.data.get("mig"):
            self.data["mig"] = {"ts": time.strftime("%Y-%m-%dT%H:%M"), "sensors": len(snap["sensors"]), "tasks": len(snap["tasks"])}
            _LOGGER.info("Messwerk: %s Sensoren in %s Aufgaben übernommen", len(snap["sensors"]), len(snap["tasks"]))
        self._seen(snap)
        await self._store.async_save(self.data)

    def _seen(self, snap: dict[str, Any]) -> None:
        now = int(time.time())
        seen = self.data.setdefault("seen", {})
        for eid in snap["sensors"]:
            s = self.hass.states.get(eid)
            e = seen.setdefault(eid, {"first": now, "ok": 0})
            if s is not None and s.state not in ("unavailable", "unknown"):
                e["ok"] = now
        for eid in [k for k in seen if k not in snap["sensors"]]:
            del seen[eid]
        self._store.async_delay_save(lambda: self.data, 300)

    # ---- Sammeln
    def _mods_on(self) -> dict[int, bool]:
        wm = self.hass.data.get(DOMAIN, {}).get("wasser")
        on = (wm.modules.get("on") if wm is not None else {}) or {}
        key = {2: "ww", 3: "en", 4: "gs", 8: "ev", 9: "wx", 11: "sf", 13: "bt", 16: "sp", 19: "ef"}
        out = {n: bool(on.get(k, n in (2, 3, 4))) for n, k in key.items()}
        out[1] = True
        out[0] = True
        labs = (((self.hass.data.get(DOMAIN, {}).get("layout") or {}).get("labs") or {}).get("on")) or []
        out[17], out[18] = "mm" in labs, "li" in labs
        return out

    def _collect(self) -> dict[str, Any]:
        store = self.hass.data.get(DOMAIN, {})
        tasks: dict[str, dict[str, Any]] = {}
        sensors: dict[str, dict[str, Any]] = {}
        on = self._mods_on()

        def add(tid: str, name: str, group: str, unit: str, eid: str, uses: list[tuple[int, str]], where: str, go: str) -> None:
            t = tasks.setdefault(tid, {"id": tid, "n": name, "g": group, "u": unit, "ents": [], "uses": [], "where": where, "go": go})
            if eid not in t["ents"]:
                t["ents"].append(eid)
            s = sensors.setdefault(eid, {"tasks": [], "uses": []})
            if tid not in s["tasks"]:
                s["tasks"].append(tid)
            for m, why in uses:
                u = {"m": m, "why": why, "on": on.get(m, True), "where": where, "go": go, "task": tid}
                if not any(x["m"] == m and x["why"] == why for x in t["uses"]):
                    t["uses"].append({k: u[k] for k in ("m", "why", "on")})
                if not any(x["m"] == m and x["why"] == why and x["task"] == tid for x in s["uses"]):
                    s["uses"].append(u)

        # Haus (Stufe 2): Energiequellen, Ladestand, Preise, Wetterquelle
        h = store.get("haus")
        if h is not None and getattr(h, "ready", False):
            hd = h.data
            for path, (name, g, unit, uses) in HAUS.items():
                cur: Any = hd
                for p in path.split("."):
                    cur = cur.get(p) if isinstance(cur, dict) else None
                if path.startswith("price.") and hd.get("price", {}).get(path.split(".")[1].replace("_sensor", "_mode")) != "entity":
                    continue
                if isinstance(cur, str) and EID.match(cur):
                    sub = {"energy": "en", "soc": "en", "price": "pr", "wx": "wx"}[path.split(".")[0]]
                    add(f"haus.{path}", name, g, unit, cur, uses, f"Haus › {'Energiequellen' if sub == 'en' else 'Preise & Tarif' if sub == 'pr' else 'Wetterquelle'}", f"hs:{sub}")
        # Räume (Modul 1)
        for entry in self.hass.config_entries.async_entries(DOMAIN):
            cfg = {**entry.data, **entry.options}
            room = entry.title or "Raum"
            for key, (name, g, why, unit) in ROOM.items():
                val = cfg.get(key)
                vals = val if isinstance(val, list) else [val]
                for eid in vals:
                    if isinstance(eid, str) and EID.match(eid):
                        tid = f"room.{entry.entry_id}.{key}"
                        add(tid, f"{name} · {room}", g, unit, eid, [(1, why)], f"Modul 1 › Raum {room}", f"room:{entry.entry_id}")
        # Thermostat-Batterien (Modul 1, Diagnose)
        gen = store.get("general")
        if gen is not None:
            for th, src in ((gen.data.get("valve") or {}).get("batsrc") or {}).items():
                s = (src or {}).get("src")
                if isinstance(s, str) and EID.match(s):
                    add(f"bat.{th}", f"Batterie · {self._fn(th)}", "klima", "pct", s, [(1, "Batterie des Thermostats")], "Modul 1 › Diagnose", "diag")
        # Messräume (Modul 1)
        layout = store.get("layout") or {}
        for m in layout.get("mess") or []:
            for key, (name, unit) in {"temp": ("Raumtemperatur", "temp"), "hum": ("Luftfeuchte", "pct"), "bat": ("Batterie", "pct")}.items():
                eid = m.get(key)
                if isinstance(eid, str) and EID.match(eid):
                    add(f"mess.{m.get('id')}.{key}", f"{name} · {m.get('name')}", "klima", unit, eid, [(1, f"Messraum {m.get('name')}")], f"Modul 1 › Messraum {m.get('name')}", f"mess:{m.get('id')}")
        for k, v in ((layout.get("li") or {}).get("scenes") or {}).items():
            if isinstance(v, str) and EID.match(v):
                add(f"li.{k}", f"Szene „{ {'night': 'Gute Nacht', 'arrive': 'Ankommen', 'cozy': 'Gemütlich'}.get(k, k)}“", "alltag", "", v, [(18, "Szenenknopf")], "Modul 18 · Einstellungen", "mod:li")
        al = (layout.get("start") or {}).get("alarm")
        if isinstance(al, str) and EID.match(al):
            add("start.alarm", "Alarmanlage", "sicher", "", al, [(0, "Startseite: Alarm-Bubble")], "Startseite · Einstellungen", "hz")
        # Modul 4 Geräte
        wm = store.get("wasser")
        if wm is not None:
            for d in (wm.modules.get("gs") or {}).get("devices") or []:
                if d.get("ent"):
                    add(f"gs.{d['id']}", f"Leistung · {d.get('name') or 'Gerät'}", GS_GROUP, "power", d["ent"], [(4, "Durchläufe, Kosten, eigener Strom")], "Modul 4 · Einstellungen", "mod:gs")
            fc = (wm.modules.get("gs") or {}).get("forecast")
            if fc:
                add("gs.forecast", "Prognose für Startfenster", "strom", "", fc, [(4, "bestes Startfenster")], "Modul 4 · Einstellungen", "mod:gs")
            for k, eid in ((wm.modules.get("ev") or {}).get("ent") or {}).items():
                if eid:
                    add(f"ev.{k}", {"soc": "Ladestand Auto", "odo": "Kilometerstand", "range": "Reichweite", "plug": "Ladekabel", "power": "Ladeleistung", "charging": "Lädt gerade"}.get(k, k), "auto", "pct" if k == "soc" else "power" if k == "power" else "", eid, [(8, "Fahrzeug-Anzeige")], "Modul 8 › Fahrzeug", "mod:ev")
        # Weitere Speicher
        for src, (mod, where, g, table) in SOURCES.items():
            key, attr = src.split(".")
            mgr = store.get(key)
            raw = getattr(mgr, attr, None) if mgr is not None else None
            if raw is None:
                continue
            if src == "wetter.cfg":  # Wind und amtliche Warnungen gehören dem Haus
                raw = {k: v for k, v in raw.items() if k not in ("wind", "official")}
            go = {"wasser": "mod:ww", "wallbox": "mod:ev", "wetter": "mod:wx", "sicherheit": "mod:sf", "muell": "mod:mu", "entfeuchter": "lfx", "fluss": "mod:ef", "tags": "tgx", "solar": "mod:sp", "tablet": "tm", "presence": "ort"}[key]
            for path, eid in walk(raw):
                if src == "presence.data" and ".people." not in f".{path}":
                    continue
                why = _purpose(path, table)
                name = why if why[:1].isupper() else why.capitalize()
                if src == "presence.data":
                    pm = re.search(r"people\.(person\.[a-z0-9_]+)", path)
                    if pm and pm.group(1) == eid:
                        continue  # die Person selbst ist kein Sensor
                    name = f"{'WLAN' if 'wifi' in path else 'Standort'} · {self._fn(pm.group(1)) if pm else ''}".strip(" ·")
                if src == "tablet.tablets":
                    name = f"Bewegungsmelder · Tablet {path.split('.')[0][:6]}"
                if key == "sicherheit" and why == "Batterie des Melders":
                    name = f"Batterie · {self._fn(eid)}"
                elif key == "sicherheit" and eid.startswith("binary_sensor.") and why not in ("Abfahrt-Prüfung",):
                    name, why = f"Melder · {self._fn(eid)}", "Alarm und Wartung"
                add(f"{key}.{path}", name, g, "", eid, [(mod, why)], where, go)
        return {"tasks": tasks, "sensors": sensors, "on": on}

    def _fn(self, eid: str) -> str:
        s = self.hass.states.get(eid)
        return str(s.attributes.get("friendly_name") or eid) if s else eid

    # ---- Prüfen
    def _check(self, eid: str, unit: str) -> dict[str, Any]:
        s = self.hass.states.get(eid)
        if s is None:
            return {"st": "missing", "txt": "fehlt in Home Assistant"}
        u = str(s.attributes.get("unit_of_measurement") or "")
        if s.state in ("unavailable", "unknown"):
            return {"st": "dead", "txt": "liefert keinen Wert", "unit": u}
        if unit in UNIT and eid.startswith("sensor.") and not UNIT[unit].search(u):
            return {"st": "unit", "txt": f"Einheit „{u or 'ohne'}“ passt nicht", "unit": u}
        return {"st": "ok", "txt": "liefert", "unit": u}

    def snapshot(self) -> dict[str, Any]:
        now = time.time()
        if self._cache and now - self._cache[0] < 5:
            return self._cache[1]
        snap = self._collect()
        self._seen(snap)
        seen = self.data.get("seen", {})
        tasks = []
        for t in snap["tasks"].values():
            chk = [self._check(e, t["u"]) for e in t["ents"]]
            st = next((c["st"] for c in chk if c["st"] != "ok"), "ok")
            if st == "dead" and t["n"] in ("Solarleistung", "Zweite Solaranlage"):
                st = "ok"  # nachts oft „nicht verfügbar“
            tasks.append({**t, "st": st, "chk": chk, "since": [seen.get(e, {}).get("ok", 0) for e in t["ents"]]})
        hints = self._hints(snap)
        mods = sorted({u["m"] for s in snap["sensors"].values() for u in s["uses"] if u["m"]})
        out = {
            "v": SCHEMA, "mig": self.data.get("mig"), "groups": GROUPS, "mods": MODN, "tasks": tasks,
            "sensors": {e: {"tasks": s["tasks"], "uses": [{k: u[k] for k in ("m", "why", "on", "where", "go")} for u in s["uses"]]} for e, s in snap["sensors"].items()},
            "stats": {"sensors": len(snap["sensors"]), "tasks": len(tasks), "ok": sum(1 for t in tasks if t["st"] == "ok"), "bad": sum(1 for t in tasks if t["st"] != "ok"), "mods": len(mods)},
            "hints": hints,
        }
        self._cache = (now, out)
        return out

    def _hints(self, snap: dict[str, Any]) -> list[dict[str, str]]:
        """Abweichungen, die man an einer Stelle vereinen sollte."""
        out: list[dict[str, str]] = []
        T = snap["tasks"]
        outdoor = (T.get("haus.wx.outdoor") or {}).get("ents") or []
        for t in T.values():
            if t["id"].endswith(".outdoor_sensor") and outdoor and t["ents"] and t["ents"][0] not in outdoor:
                out.append({"t": f"{t['n']} weicht vom Haus ab", "x": f"{self._fn(t['ents'][0])} statt {self._fn(outdoor[0])}. Ab M2 lässt sich das an einer Stelle vereinen.", "go": t["go"]})
        grid = ((T.get("haus.energy.ent.grid") or {}).get("ents") or [""])[0]
        if grid:
            for t in T.values():
                if t["id"].startswith("fluss.") and t["ents"] and self.hass.states.get(t["ents"][0]) is not None:
                    st = self.hass.states.get(t["ents"][0])
                    if str(st.attributes.get("unit_of_measurement") or "") in ("W", "kW") and "netz" in (t["ents"][0] + str(st.attributes.get("friendly_name") or "")).lower() and t["ents"][0] != grid:
                        out.append({"t": "Hausfluss nutzt einen anderen Netz-Sensor", "x": f"{self._fn(t['ents'][0])} statt {self._fn(grid)} aus dem Haus.", "go": t["go"]})
        multi = {e: s for e, s in snap["sensors"].items() if len({u["m"] for u in s["uses"]}) >= 4}
        if multi:
            top = max(multi.items(), key=lambda kv: len({u["m"] for u in kv[1]["uses"]}))
            out.append({"t": f"{self._fn(top[0])} wird in {len({u['m'] for u in top[1]['uses']})} Modulen genutzt", "x": "Ein Ausfall dieses Sensors betrifft viele Funktionen. Das Messwerk meldet ihn einmal für alle.", "go": "", "lvl": "in"})
        return out[:8]
