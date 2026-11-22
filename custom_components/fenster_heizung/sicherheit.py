"""Modul 11: Rauch- & Sicherheitsmelder – Alarme, Batterie, Erreichbarkeit, Prüf-Erinnerung, Aktionen und Meldungen.

Das Modul liest vorhandene Melder aus Home Assistant (Geräteklasse Rauch, CO, Gas, Wasser, Hitze, Sicherheit),
zum Beispiel von X-Sense, Zigbee, Z-Wave oder Homematic. Es ersetzt keine zertifizierte Alarmanlage.
"""
from __future__ import annotations

import logging
import re
import time
from datetime import timedelta
from typing import Any, Callable

from homeassistant.const import EVENT_STATE_CHANGED
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

TICK_SECONDS = 60  # Netz; Zustandswechsel der Melder lösen die Prüfung sofort aus
SCHEMA = 3  # Stand des Speichers (2 = Plan in eigenem Speicher, 3 = Stufen, Ausgeschaltet, Fehlalarme)
EVENT_SF = f"{DOMAIN}_sicherheit"  # Ereignis für eigene Automationen
SIGNAL_SF = f"{DOMAIN}_sicherheit_update"  # Sensoren neu schreiben
ACT_PREFIX = "SF_"  # Knöpfe in der Handy-Mitteilung
STAGE_TICK_S = 5  # solange ein Alarm läuft, prüft das Modul die Stufen im 5-s-Takt
S4_REPEAT_S = 120
FA_MAX = 30  # gemerkte Fehlalarme je Melder
PAUSE_MAX = 40
REG_EVENT = "entity_registry_updated"
# Geräteklasse -> (Schlüssel, Name)
CLASSES = {
    "smoke": ("smoke", "Rauchmelder"),
    "carbon_monoxide": ("co", "CO-Melder"),
    "gas": ("gas", "Gasmelder"),
    "moisture": ("water", "Wassermelder"),
    "heat": ("heat", "Hitzemelder"),
    "safety": ("safety", "Sicherheitsmelder"),
}
# Warndienste liefern auch binary_sensor mit Geräteklasse „safety“, sind aber keine Melder im Haus
WARN_NAME = re.compile(r"warnung|warning|unwetter|wetterwarn", re.I)
NO_DETECTOR = {"nina", "dwd_weather_warnings", "meteoalarm", "nws", "nws_alerts", "gdacs", "usgs_earthquakes_feed", "waze_travel_time"}
KINDS = tuple(v[0] for v in CLASSES.values())
KIND_NAMES = {v[0]: v[1] for v in CLASSES.values()}
BAT_NOTE_GAP_S = 7 * 86400
OFF_NOTE_GAP_S = 86400
TEST_NOTE_GAP_S = 7 * 86400
MAX_ACTS = 12
MAX_LOG = 100
MAX_META = 60
MAX_ITEMS = 400
MAX_FLOORS = 6
MAX_BG = 320_000
MAX_DEP = 30
LIFE_NOTE_GAP_S = 7 * 86400
BHIST_MAX = 60
TEST_ALARM_MAX_S = 120  # Alarm bis zu dieser Dauer gilt als Test per Testknopf
THIST_MAX = 24  # Prüfungen und Batterietausche je Melder fürs Jahresband
BHIST_GAP_S = 20 * 3600
ITEM_T = ("r", "w", "d", "f", "s", "x", "m", "l")  # l = Lampe (Modul 18, ab 2026.11.4b51)
LAMP_K = ("decke", "steh", "spot", "streifen", "aussen", "tisch")  # tisch ab Modul 18 Build 7
_ID = re.compile(r"^[a-z0-9_]{1,24}$")
_MON = re.compile(r"^(20\d\d|19\d\d)-(0[1-9]|1[0-2])$")
_HM = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")
MAX_EXCL = 60
_ENT = re.compile(r"^[a-z_]+\.[a-z0-9_]+$")
OFF_STATES = ("unavailable", "unknown")
SRC_MIN = 3  # Quellen-Wächter: ab so vielen Meldern einer Quelle gilt „alle weg“ als Ausfall der Quelle
SRC_NAMES = {"xsense": "X-Sense", "zha": "Zigbee (ZHA)", "mqtt": "MQTT / Zigbee2MQTT", "zwave_js": "Z-Wave", "homematicip_cloud": "Homematic IP",
             "homematic": "Homematic", "deconz": "deCONZ", "hue": "Philips Hue", "tuya": "Tuya", "shelly": "Shelly", "matter": "Matter", "netatmo": "Netatmo"}
SELF_DAY, SELF_AT = 6, "18:00"  # Wochen-Selbsttest: sonntags ab 18 Uhr


def src_name(src: str) -> str:
    return SRC_NAMES.get(src, src or "unbekannt")


def src_down(det: list[dict[str, Any]], skip: set[str] | None = None) -> dict[str, list[dict[str, Any]]]:
    """Quellen, deren Melder (ohne ausgeschaltete) alle gleichzeitig nicht erreichbar sind, ab SRC_MIN Meldern."""
    by: dict[str, list[dict[str, Any]]] = {}
    for d in det:
        if d.get("src") and d["id"] not in (skip or set()):
            by.setdefault(d["src"], []).append(d)
    return {k: v for k, v in by.items() if len(v) >= SRC_MIN and all(x["off"] for x in v)}


def default_cfg() -> dict[str, Any]:
    return {
        "kinds": list(KINDS), "excl": [], "repeat": 10,
        "bat": {"on": True, "pct": 20}, "off": {"on": True, "min": 60}, "test": {"on": True, "months": 6},
        "acts": [], "notify": {"alarm": True, "end": False, "bat": True, "off": True, "test": True, "life": True, "depart": True, "self": True, "to": []},
        "meta": {}, "add": [], "plan": {"floors": [{"id": "eg", "n": "EG"}], "items": [], "bg": {}, "scale": 40},
        "quiet": {"on": False, "from": "22:00", "to": "07:00"}, "lead": 30,
        "depart": {"on": True, "ents": [], "frost": {"on": False, "ent": "", "below": 3}},
        "proto": {"name": "", "addr": "", "who": ""}, "ui": {"old": False},
        "stages": {"s2": {"on": True, "sec": 10}, "s3": {"on": False, "sec": 60}, "s4": {"on": False, "sec": 300}},
        "tts": {"player": "", "engine": ""}, "contact": {"to": ""}, "offask": {"mode": "ask", "days": 7},
        "guard": {"src": True}, "selftest": {"on": True},
    }


def _num(v: Any, lo: float, hi: float, d: float) -> float:
    try:
        x = float(v)
    except (TypeError, ValueError):
        return d
    return min(hi, max(lo, x)) if x == x else d


def _ent(v: Any, domains: tuple[str, ...] | None = None) -> str:
    if isinstance(v, str) and _ENT.match(v) and (domains is None or v.split(".")[0] in domains):
        return v
    return ""


def do_options(ent: str) -> tuple[str, ...]:
    d = ent.split(".")[0]
    return ("open", "close") if d == "cover" else ("run",) if d in ("script", "scene") else ("on", "off")


def action_service(ent: str, do: str) -> tuple[str, str]:
    d = ent.split(".")[0]
    if d == "cover":
        return "cover", "open_cover" if do == "open" else "close_cover"
    if d in ("script", "scene"):
        return d, "turn_on"
    return d, "turn_on" if do == "on" else "turn_off"


def clean_cfg(raw: Any) -> dict[str, Any]:
    d = default_cfg()
    r = raw if isinstance(raw, dict) else {}
    if isinstance(r.get("kinds"), list):
        d["kinds"] = [k for k in KINDS if k in r["kinds"]]
    ex = []
    for e in r.get("excl") if isinstance(r.get("excl"), list) else []:
        e = _ent(e, ("binary_sensor",))
        if e and e not in ex and len(ex) < MAX_EXCL:
            ex.append(e)
    d["excl"] = ex
    d["repeat"] = int(_num(r.get("repeat"), 0, 60, 10))
    b = r.get("bat") if isinstance(r.get("bat"), dict) else {}
    d["bat"] = {"on": bool(b.get("on", True)), "pct": int(round(_num(b.get("pct"), 5, 50, 20) / 5) * 5)}
    o = r.get("off") if isinstance(r.get("off"), dict) else {}
    d["off"] = {"on": bool(o.get("on", True)), "min": int(_num(o.get("min"), 15, 1440, 60))}
    t = r.get("test") if isinstance(r.get("test"), dict) else {}
    m = int(_num(t.get("months"), 1, 12, 6))
    d["test"] = {"on": bool(t.get("on", True)), "months": min((1, 3, 6, 12), key=lambda x: abs(x - m))}
    acts, seen = [], set()
    for x in r.get("acts") if isinstance(r.get("acts"), list) else []:
        if not isinstance(x, dict) or len(acts) >= MAX_ACTS:
            continue
        ent, aid = _ent(x.get("ent"), ("cover", "switch", "input_boolean", "light", "script", "scene")), str(x.get("id") or "")[:20]
        kind = x.get("kind") if x.get("kind") in KINDS or x.get("kind") == "any" else ""
        if not ent or not kind or not re.match(r"^[a-z0-9_]+$", aid) or aid in seen:
            continue
        seen.add(aid)
        do = x.get("do") if x.get("do") in do_options(ent) else do_options(ent)[0]
        acts.append({"id": aid, "kind": kind, "ent": ent, "do": do, "st": int(_num(x.get("st"), 1, 4, 1))})
    d["acts"] = acts
    n = r.get("notify") if isinstance(r.get("notify"), dict) else {}
    to = []
    for s in n.get("to") if isinstance(n.get("to"), list) else []:
        s = _ent(s, ("notify",))
        if s and s not in to and len(to) < 10:
            to.append(s)
    d["notify"] = {k: bool(n.get(k, d["notify"][k])) for k in ("alarm", "end", "bat", "off", "test", "life", "depart", "self")}
    d["notify"]["to"] = to
    add = []
    for e in r.get("add") if isinstance(r.get("add"), list) else []:
        e = _ent(e, ("binary_sensor",))
        if e and e not in add and len(add) < MAX_META:
            add.append(e)
    d["add"] = add
    meta = {}
    mr = r.get("meta") if isinstance(r.get("meta"), dict) else {}
    for e, m in mr.items():
        e = _ent(e, ("binary_sensor",))
        if not e or not isinstance(m, dict) or len(meta) >= MAX_META:
            continue
        inst = str(m.get("inst") or "")
        meta[e] = {
            "name": str(m.get("name") or "").strip()[:40], "kind": m.get("kind") if m.get("kind") in KINDS else "",
            "floor": str(m.get("floor") or "")[:24] if _ID.match(str(m.get("floor") or "")) else "",
            "room": str(m.get("room") or "").strip()[:40], "bat": _ent(m.get("bat"), ("sensor",)),
            "btype": str(m.get("btype") or "").strip()[:20], "inst": inst if _MON.match(inst) else "",
            "life": int(_num(m.get("life"), 0, 20, 0)), "int": min((0, 1, 3, 6, 12), key=lambda x: abs(x - int(_num(m.get("int"), 0, 12, 0)))),
            "press": _ent(m.get("press"), ("button",)),
        }
    d["meta"] = meta
    d["plan"] = clean_plan(r.get("plan"))
    q = r.get("quiet") if isinstance(r.get("quiet"), dict) else {}
    d["quiet"] = {"on": bool(q.get("on", False)), "from": q.get("from") if _HM.match(str(q.get("from"))) else "22:00", "to": q.get("to") if _HM.match(str(q.get("to"))) else "07:00"}
    d["lead"] = min((0, 7, 14, 30, 60), key=lambda x: abs(x - int(_num(r.get("lead"), 0, 60, 30))))
    dp = r.get("depart") if isinstance(r.get("depart"), dict) else {}
    de = []
    for e in dp.get("ents") if isinstance(dp.get("ents"), list) else []:
        e = _ent(e, ("binary_sensor", "cover", "lock", "switch", "light", "input_boolean", "climate", "camera"))
        if e and e not in de and len(de) < MAX_DEP:
            de.append(e)
    fr = dp.get("frost") if isinstance(dp.get("frost"), dict) else {}
    d["depart"] = {"on": bool(dp.get("on", True)), "ents": de, "frost": {"on": bool(fr.get("on", False)), "ent": _ent(fr.get("ent"), ("sensor", "weather")), "below": int(_num(fr.get("below"), -10, 10, 3))}}
    pr = r.get("proto") if isinstance(r.get("proto"), dict) else {}
    d["proto"] = {k: str(pr.get(k) or "").strip()[:60] for k in ("name", "addr", "who")}
    ui = r.get("ui") if isinstance(r.get("ui"), dict) else {}
    d["ui"] = {"old": bool(ui.get("old", False))}
    sg = r.get("stages") if isinstance(r.get("stages"), dict) else {}
    dflt = d["stages"]
    d["stages"] = {}
    for k, lo, hi in (("s2", 5, 120), ("s3", 30, 900), ("s4", 60, 1800)):
        v = sg.get(k) if isinstance(sg.get(k), dict) else {}
        d["stages"][k] = {"on": bool(v.get("on", dflt[k]["on"])), "sec": int(_num(v.get("sec"), lo, hi, dflt[k]["sec"]))}
    tt = r.get("tts") if isinstance(r.get("tts"), dict) else {}
    d["tts"] = {"player": _ent(tt.get("player"), ("media_player",)), "engine": _ent(tt.get("engine"), ("tts",))}
    ct = r.get("contact") if isinstance(r.get("contact"), dict) else {}
    d["contact"] = {"to": _ent(ct.get("to"), ("notify",))}
    oa = r.get("offask") if isinstance(r.get("offask"), dict) else {}
    d["offask"] = {"mode": oa.get("mode") if oa.get("mode") in ("ask", "auto", "never") else "ask", "days": int(_num(oa.get("days"), 1, 60, 7))}
    gd = r.get("guard") if isinstance(r.get("guard"), dict) else {}
    d["guard"] = {"src": bool(gd.get("src", True))}
    se = r.get("selftest") if isinstance(r.get("selftest"), dict) else {}
    d["selftest"] = {"on": bool(se.get("on", True))}
    return d


def _poly(raw: Any) -> list[list[int]] | None:
    """Eckpunkte eines Raums (3 bis 16, ganze Zahlen). Ungültig oder ohne Fläche: None, dann gilt das Rechteck."""
    if not isinstance(raw, list) or not 3 <= len(raw) <= 16:
        return None
    out: list[list[int]] = []
    for p in raw:
        if not (isinstance(p, (list, tuple)) and len(p) == 2):
            return None
        out.append([int(_num(p[0], -50, 1200, 0)), int(_num(p[1], -50, 1200, 0))])
    area = sum(out[i][0] * out[(i + 1) % len(out)][1] - out[(i + 1) % len(out)][0] * out[i][1] for i in range(len(out)))
    return out if abs(area) >= 400 else None


def clean_plan(raw: Any) -> dict[str, Any]:
    r = raw if isinstance(raw, dict) else {}
    floors, ids = [], set()
    for f in r.get("floors") if isinstance(r.get("floors"), list) else []:
        if isinstance(f, dict) and _ID.match(str(f.get("id") or "")) and f["id"] not in ids and len(floors) < MAX_FLOORS:
            ids.add(f["id"])
            floors.append({"id": f["id"], "n": str(f.get("n") or f["id"]).strip()[:16] or f["id"]})
    if not floors:
        floors, ids = [{"id": "eg", "n": "EG"}], {"eg"}
    items, seen = [], set()
    for it in r.get("items") if isinstance(r.get("items"), list) else []:
        if not isinstance(it, dict) or len(items) >= MAX_ITEMS or it.get("t") not in ITEM_T:
            continue
        iid, fl = str(it.get("id") or ""), str(it.get("fl") or "")
        if not _ID.match(iid) or iid in seen or fl not in ids:
            continue
        seen.add(iid)
        o = {"id": iid, "fl": fl, "t": it["t"]}
        for k in ("x", "y", "w", "h", "x2", "y2"):
            if k in it:
                o[k] = int(_num(it[k], -50, 1200, 0))
        o["r"] = int(_num(it.get("r"), 0, 270, 0) // 90 * 90)
        o["n"] = str(it.get("n") or "").strip()[:30]
        if it["t"] in ("d", "r"):
            for fk_ in ("dg", "ds"):  # dg: Durchgang statt Tür, ds: Raumrand nur gestrichelt (keine Wand)
                if (fk_ == "dg") == (it["t"] == "d") and it.get(fk_) in (1, True):
                    o[fk_] = 1
        if it["t"] == "d":
            for mk_ in ("mv", "mh"):
                if it.get(mk_) in (1, True):
                    o[mk_] = 1  # Türöffnung gespiegelt (Seite, Angel)
        if it["t"] in ("d", "s") and it.get("ex") in (0, 1, True, False):
            o["ex"] = 1 if it["ex"] else 0  # Ausgang: Außentür oder Treppe nach unten
        o["e"] = _ent(it.get("e"), ("binary_sensor",))
        if it["t"] == "l":  # Lampe: Entität light.*, Art (Streifen wird als Balken gezeichnet und gedreht)
            o["e"] = _ent(it.get("e"), ("light",))
            o["k"] = it.get("k") if it.get("k") in LAMP_K else "decke"
        if it["t"] == "m":
            o["rg"] = round(_num(it.get("rg"), 0, 15, 0) * 2) / 2  # Reichweite in Metern, 0 = je nach Art
        if it["t"] == "r":
            o["lk"] = str(it.get("lk") or "").strip()[:40]  # Raum aus Modul 1
            pts = _poly(it.get("pts"))
            if pts:  # freie Raumform: x, y, w, h bleiben der umschließende Rahmen
                o["pts"] = pts
                xs, ys = [p[0] for p in pts], [p[1] for p in pts]
                o["x"], o["y"], o["w"], o["h"] = min(xs), min(ys), max(xs) - min(xs), max(ys) - min(ys)
        items.append(o)
    bg = {}
    for k, v in (r.get("bg") if isinstance(r.get("bg"), dict) else {}).items():
        if k in ids and isinstance(v, str) and len(v) <= MAX_BG and re.match(r"^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$", v):
            bg[k] = v
    return {"floors": floors, "items": items, "bg": bg, "scale": int(_num(r.get("scale"), 10, 120, 40))}  # Bildpunkte je Meter (Plan ist 800 breit)


def kind_of(device_class: Any) -> tuple[str, str] | None:
    return CLASSES.get(device_class) if isinstance(device_class, str) else None


def battery_of(attrs: dict[str, Any], sibling: Any = None) -> float | None:
    """Batterie in Prozent: aus Attribut oder aus dem Batterie-Sensor desselben Geräts."""
    for v in (attrs.get("battery_level"), attrs.get("battery"), sibling):
        try:
            x = float(str(v).replace(",", "."))
        except (TypeError, ValueError):
            continue
        if x == x and 0 <= x <= 100:
            return x
    return None


def bat_fit(h: list[list[float]]) -> dict[str, Any] | None:
    """Batterie-Prognose aus dem Verlauf [[Zeit, Prozent], …]: Gerade durch die Punkte seit dem letzten Tausch.

    Ein Sprung nach oben um mindestens 20 Punkte gilt als Batterietausch, davor zählt nichts mehr. Gibt
    {"slope": Prozent pro Tag (negativ), "span": Tage, "pts": Anzahl} zurück, sonst None (zu wenig Daten oder keine Abnahme).
    """
    pts = [(float(a), float(b)) for a, b in h if isinstance(a, (int, float)) and isinstance(b, (int, float))]
    for k in range(len(pts) - 1, 0, -1):
        if pts[k][1] - pts[k - 1][1] >= 20:
            pts = pts[k:]
            break
    if len(pts) < 2:
        return None
    span = (pts[-1][0] - pts[0][0]) / 86400
    if span < 7:
        return None
    n = len(pts)
    mx, my = sum(t for t, _ in pts) / n, sum(b for _, b in pts) / n
    den = sum((t - mx) ** 2 for t, _ in pts)
    if den <= 0:
        return None
    slope = sum((t - mx) * (b - my) for t, b in pts) / den * 86400
    if slope >= -0.01:
        return None
    return {"slope": slope, "span": span, "pts": n}


def months_since(iso: str | None, now: Any) -> float | None:
    if not iso:
        return None
    t = dt_util.parse_datetime(iso)
    if t is None:
        return None
    return max(0.0, (now - t).total_seconds() / (30.44 * 86400))


class SicherheitManager:
    SCHEMA = SCHEMA  # für die Diagnose

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_sicherheit")
        self._pstore = SafeStore(hass, 1, f"{DOMAIN}_sicherheit_plan")  # Grundriss und Hintergrundbild getrennt von den Einstellungen
        self._known: set[str] = set()
        self._btns: dict[str, str] = {}  # Testknopf-Entität → Melder
        self._regc: tuple[dict[str, str], dict[str, str]] | None = None
        self._unsub_reg: CALLBACK_TYPE | None = None
        self.cfg = default_cfg()
        self.st: dict[str, dict[str, Any]] = {}  # je Melder: a (Alarm), since, off_since, rep
        self.last_test = ""
        self.first_seen = ""
        self.tested: dict[str, str] = {}
        self.bhist: dict[str, list[list[float]]] = {}
        self.thist: dict[str, list[str]] = {}  # Zeitpunkte „geprüft“ je Melder
        self.swaps: dict[str, list[str]] = {}  # Zeitpunkte „Batterie getauscht“ je Melder
        self._home: bool | None = None
        self.log: list[dict[str, str]] = []
        self._notes: dict[str, float] = {}
        self._unsub: CALLBACK_TYPE | None = None
        self._unsub_gr: Callable[[], None] | None = None
        self._unsub_ev: CALLBACK_TYPE | None = None
        self._busy = False
        self._sum: dict[str, Any] = {}
        self.paused: dict[str, dict[str, Any]] = {}  # ausgeschaltete Melder: until (ISO oder leer = dauerhaft), since, auto, was_off
        self.asked: dict[str, str] = {}  # Frage „Ausschalten?“ gestellt: ask (offen) oder warn (weiter warnen)
        self.fa: dict[str, list[dict[str, str]]] = {}  # Fehlalarme je Melder (t, why)
        self._unsub_fast: CALLBACK_TYPE | None = None
        self._unsub_act: CALLBACK_TYPE | None = None
        self.src_off: dict[str, str] = {}  # Quellen-Wächter: ausgefallene Quelle → seit (ISO)
        self.selftest: dict[str, Any] = {}  # letzter Wochen-Selbsttest: t, ok, n, p (Hinweise)
        self.last_alarm: dict[str, str] = {}  # letzter Alarm: t, melder, name, raum

    # ---- Start/Stop
    async def async_start(self) -> None:
        d = await self._store.async_load()
        pd = await self._pstore.async_load()
        migrate = False
        if isinstance(d, dict):
            self.cfg = clean_cfg(d.get("cfg"))
            if isinstance(pd, dict) and isinstance(pd.get("plan"), dict):
                self.cfg["plan"] = clean_plan(pd["plan"])
            else:
                migrate = bool(self.cfg["plan"]["items"] or self.cfg["plan"]["bg"])  # Stand vor 2026.11.4: Plan lag in den Einstellungen
            self.last_test = str(d.get("last_test") or "")
            self.first_seen = str(d.get("first_seen") or "")
            self.tested = {str(k): str(v) for k, v in (d.get("tested") or {}).items() if isinstance(v, str)}
            for k, v in (d.get("bhist") or {}).items():
                if isinstance(v, list):
                    self.bhist[str(k)] = [[float(a), float(b)] for a, b in v if isinstance(a, (int, float)) and isinstance(b, (int, float))][-BHIST_MAX:]
            for key, dst in (("thist", self.thist), ("swaps", self.swaps)):
                for k, v in (d.get(key) or {}).items():
                    if isinstance(v, list):
                        dst[str(k)] = [str(x) for x in v if isinstance(x, str)][-THIST_MAX:]
            for k, v in (d.get("st") if isinstance(d.get("st"), dict) else {}).items():
                if isinstance(v, dict):
                    self.st[str(k)] = {"a": bool(v.get("a")), "since": str(v.get("since") or ""), "off_since": float(v.get("off_since") or 0), "rep": 0.0,
                                       "stage": int(v.get("stage") or 0), "t0": float(v.get("t0") or 0), "ack": str(v.get("ack") or ""), "why": str(v.get("why") or "")}
            for k, v in (d.get("paused") if isinstance(d.get("paused"), dict) else {}).items():
                if isinstance(v, dict) and _ENT.match(str(k)) and len(self.paused) < PAUSE_MAX:
                    self.paused[str(k)] = {"until": str(v.get("until") or ""), "since": str(v.get("since") or ""), "auto": bool(v.get("auto")), "was_off": bool(v.get("was_off"))}
            self.asked = {str(k): str(v) for k, v in (d.get("asked") or {}).items() if v in ("ask", "warn")}
            for k, v in (d.get("fa") if isinstance(d.get("fa"), dict) else {}).items():
                if isinstance(v, list):
                    self.fa[str(k)] = [{"t": str(x.get("t") or ""), "why": str(x.get("why") or "")[:30]} for x in v if isinstance(x, dict) and x.get("t")][-FA_MAX:]
            self.log = [x for x in (d.get("log") or []) if isinstance(x, dict) and "t" in x and "x" in x][:MAX_LOG]
            self._notes = {str(k): float(v) for k, v in (d.get("notes") or {}).items() if isinstance(v, (int, float))}
            self.src_off = {str(k): str(v) for k, v in (d.get("src_off") or {}).items() if isinstance(v, str)}
            se = d.get("selftest") if isinstance(d.get("selftest"), dict) else {}
            if se.get("t"):
                self.selftest = {"t": str(se["t"]), "ok": bool(se.get("ok")), "n": int(se.get("n") or 0), "p": [str(x)[:80] for x in (se.get("p") or [])][:10], "pend": bool(se.get("pend"))}
            la = d.get("last_alarm") if isinstance(d.get("last_alarm"), dict) else {}
            if la.get("t"):
                self.last_alarm = {k: str(la.get(k) or "") for k in ("t", "melder", "name", "raum")}
        hs = self.hass.data.get(DOMAIN, {}).get("grundriss")  # Modul 0 · Haus & Grundriss: der Plan gehört dem Kern
        if hs is not None:
            if hs.has:
                self.cfg["plan"] = clean_plan(hs.plan)
            else:
                hs.adopt(self.cfg["plan"], "sf")  # einmaliger Umzug aus Modul 11
            self._unsub_gr = hs.listen(self._gr_changed)  # Modul 0 Build 3: Plan wird in Modul 0 bearbeitet, Modul 11 liest mit
        if migrate:
            try:
                self._store.snapshot_now()
            except Exception:  # noqa: BLE001 - Kopie ist nur ein Zusatz
                _LOGGER.debug("Kopie vor der Übernahme nicht möglich", exc_info=True)
            self._save()
        self._unsub = async_track_time_interval(self.hass, self._tick, timedelta(seconds=TICK_SECONDS))
        self._unsub_ev = self.hass.bus.async_listen(EVENT_STATE_CHANGED, self._on_state)
        self._unsub_reg = self.hass.bus.async_listen(REG_EVENT, self._on_reg)
        try:
            self._unsub_act = self.hass.bus.async_listen("mobile_app_notification_action", self._on_action)
        except Exception:  # noqa: BLE001 - ohne Ereignisbus (Tests) keine Knöpfe
            self._unsub_act = None
        if any(v.get("a") and not v.get("ack") for v in self.st.values()):
            self._fast_on()
        self.hass.async_create_task(self._tick(None))

    def _gr_changed(self) -> None:
        """Plan in Modul 0 geändert (Baukasten in Modul 0): eigene Kopie nachziehen, ohne zurückzuschreiben."""
        hs = self.hass.data.get(DOMAIN, {}).get("grundriss")
        if hs is None:
            return
        p = clean_plan(hs.plan)
        if p != self.cfg["plan"]:
            self.cfg["plan"] = p
            self._save()

    def async_stop(self) -> None:
        if getattr(self, "_unsub_gr", None):
            self._unsub_gr()
            self._unsub_gr = None
        for u in (self._unsub, self._unsub_ev, self._unsub_reg, self._unsub_fast, self._unsub_act):
            if u:
                u()
        self._unsub = self._unsub_ev = self._unsub_reg = self._unsub_fast = self._unsub_act = None

    def _save(self) -> None:
        def main() -> dict[str, Any]:
            plan = {**self.cfg["plan"], "bg": {}}  # das Bild liegt nur im Plan-Speicher, Etagen und Elemente zur Sicherheit auch hier
            return {
                "v": SCHEMA, "cfg": {**self.cfg, "plan": plan}, "last_test": self.last_test, "first_seen": self.first_seen, "tested": self.tested, "bhist": self.bhist, "thist": self.thist, "swaps": self.swaps,
                "st": {k: {"a": v["a"], "since": v["since"], "off_since": v.get("off_since", 0.0), "stage": v.get("stage", 0), "t0": v.get("t0", 0.0), "ack": v.get("ack", ""), "why": v.get("why", "")} for k, v in self.st.items()},
                "log": self.log, "notes": self._notes, "paused": self.paused, "asked": self.asked, "fa": self.fa,
                "src_off": self.src_off, "selftest": self.selftest, "last_alarm": self.last_alarm,
            }
        self._store.async_delay_save(main, 10)
        self._pstore.async_delay_save(lambda: {"v": SCHEMA, "plan": self.cfg["plan"]}, 10)

    def _add(self, text: str, c: str = "") -> None:
        self.log.insert(0, {"t": dt_util.now().isoformat(), "x": text, "c": c})
        del self.log[MAX_LOG:]

    def active(self) -> bool:
        wm = self.hass.data.get(DOMAIN, {}).get("wasser")
        return bool(wm is not None and wm.modules.get("on", {}).get("sf"))

    @callback
    def _on_reg(self, event: Event) -> None:
        self._regc = None  # Zuordnung Gerät → Batterie/Testknopf neu lesen

    def _auto_test(self, eid: str, how: str) -> None:
        """Test am Melder erkannt (Testknopf-Entität ausgelöst oder kurzer Alarm): als Prüfung eintragen."""
        if not self.cfg["test"]["on"]:
            return
        now = dt_util.now()
        prev = dt_util.parse_datetime(self.tested[eid]) if self.tested.get(eid) else None
        if prev is not None and abs((now - prev).total_seconds()) < TEST_ALARM_MAX_S:
            return  # Knopf und Alarm gehören zum selben Test
        self.last_test = now.isoformat()
        self.tested[eid] = now.isoformat()
        self.thist.setdefault(eid, []).append(now.isoformat())
        del self.thist[eid][:-THIST_MAX]
        self._notes.pop("test", None)
        self._add(f"Test erkannt und eingetragen: {self._name(eid)} ({how}).", "ok")
        self._save()

    @callback
    def _on_state(self, event: Event) -> None:
        """Ein Melder geht auf „an“ oder fällt aus bzw. kommt zurück: sofort prüfen statt bis zum nächsten Takt zu warten."""
        eid = event.data.get("entity_id") or ""
        new, old = event.data.get("new_state"), event.data.get("old_state")
        if eid.startswith("button.") and new is not None and old is not None and eid in self._btns and new.state != old.state and new.state not in OFF_STATES and old.state not in OFF_STATES:
            if self.active():
                self._auto_test(self._btns[eid], "Testknopf")  # die Entität „Test“ wurde ausgelöst
            return
        if not eid.startswith("binary_sensor.") or new is None or not self.active():
            return
        if eid not in self._known and kind_of(new.attributes.get("device_class")) is None:
            return
        if old is not None and old.state == "on" and new.state == "off" and eid in self._known:
            try:  # kurzer Alarm = Testknopf am Melder gedrückt
                el = (new.last_changed - old.last_changed).total_seconds()
            except Exception:  # noqa: BLE001
                el = None
            if el is not None and 0 <= el <= TEST_ALARM_MAX_S and not (self.st.get(eid) or {}).get("why"):
                self._auto_test(eid, f"Alarm {int(el)} s")  # als Fehlalarm quittiert (Toast, Dampf …) zählt nicht als Prüfung
        if new.state == "on" or (old is not None and old.state == "on") or (new.state in OFF_STATES) != (old is not None and old.state in OFF_STATES):
            self.hass.async_create_task(self._tick(None))

    # ---- Melder lesen
    def detectors(self) -> list[dict[str, Any]]:
        reg = er.async_get(self.hass)
        devs = dr.async_get(self.hass)
        areas = ar.async_get(self.hass)
        if self._regc is None:  # nur bei Änderung im Entitäten-Register neu lesen
            bats: dict[str, str] = {}
            btns: dict[str, str] = {}
            for e in reg.entities.values():
                if not e.device_id or e.disabled_by:
                    continue
                if e.domain == "sensor" and (e.device_class or e.original_device_class) == "battery":
                    bats.setdefault(e.device_id, e.entity_id)
                elif e.domain == "button" and "test" in e.entity_id:
                    btns.setdefault(e.device_id, e.entity_id)
            self._regc = (bats, btns)
        bat_by_dev, btn_by_dev = self._regc
        out = []
        meta = self.cfg["meta"]
        for s in self.hass.states.async_all("binary_sensor"):
            k = kind_of(s.attributes.get("device_class"))
            m = meta.get(s.entity_id) or {}
            manual = s.entity_id in self.cfg["add"]
            if s.entity_id in self.cfg["excl"]:
                continue
            if k is None and not manual:
                continue
            if k is not None and k[0] not in self.cfg["kinds"] and not manual:
                continue
            ent = reg.async_get(s.entity_id)
            if ent and ent.platform in NO_DETECTOR:
                continue  # Warndienste sind nie Melder, auch nicht von Hand hinzugefügt
            if not manual and WARN_NAME.search(f"{s.entity_id} {s.attributes.get('friendly_name') or ''}"):
                continue  # Name nach Warndienst („… Warnung 1“): kein Melder, außer von Hand gewählt
            if m.get("kind"):
                k = (m["kind"], KIND_NAMES[m["kind"]])
            elif k is None:
                k = ("safety", KIND_NAMES["safety"])
            did = ent.device_id if ent else None
            dev = devs.async_get(did) if did else None
            aid = (ent.area_id if ent and ent.area_id else (dev.area_id if dev else None))
            area = areas.async_get_area(aid).name if aid and areas.async_get_area(aid) else ""
            sib = self.hass.states.get(m["bat"]) if m.get("bat") else (self.hass.states.get(bat_by_dev[did]) if did in bat_by_dev else None)
            bat = battery_of(s.attributes or {}, sib.state if sib is not None else None)
            out.append({
                "id": s.entity_id, "name": m.get("name") or s.attributes.get("friendly_name") or s.entity_id, "k": k[0], "kind": k[1], "area": area,
                "src": ent.platform if ent else "", "alarm": s.state == "on", "off": s.state in OFF_STATES, "bat": bat,
                "test": m.get("press") or (btn_by_dev.get(did, "") if did else ""), "manual": manual and kind_of(s.attributes.get("device_class")) is None,
            })
        out.sort(key=lambda x: (not x["alarm"], x["name"].lower()))
        self._known = {d["id"] for d in out}
        self._btns = {d["test"]: d["id"] for d in out if d.get("test")}
        return out

    # ---- Meldungen und Aktionen
    async def _notify(self, kind: str, title: str, msg: str, gap_key: str = "", gap: float = 0, data: dict[str, Any] | None = None, to: list[str] | None = None) -> int:
        n = self.cfg["notify"]
        if kind and not n.get(kind):
            return 0
        if kind and kind != "alarm" and self.is_quiet():
            return 0
        if gap_key:
            if time.time() - self._notes.get(gap_key, 0) < gap:
                return 0
            self._notes[gap_key] = time.time()
        sent = 0
        for svc in (n["to"] if to is None else to):
            name = svc.split(".", 1)[1]
            if not self.hass.services.has_service("notify", name):
                continue
            try:
                await self.hass.services.async_call("notify", name, {"title": title, "message": msg, **({"data": data} if data else {})}, blocking=False)
                sent += 1
            except Exception as err:  # Dienst fehlerhaft: nie die Überwachung stören
                _LOGGER.debug("Benachrichtigung %s: %s", svc, err)
        return sent

    def is_quiet(self) -> bool:
        q = self.cfg["quiet"]
        if not q["on"]:
            return False
        t = dt_util.now().strftime("%H:%M")
        return (q["from"] <= t < q["to"]) if q["from"] <= q["to"] else (t >= q["from"] or t < q["to"])

    async def async_test(self) -> dict[str, Any]:
        return {"sent": await self._notify("", "Rauch- und Sicherheitsmelder", "Testmeldung von Modul 11. Die Benachrichtigung funktioniert.")}

    async def _call(self, ent: str, do: str) -> bool:
        if self.hass.states.get(ent) is None:
            return False
        dom, svc = action_service(ent, do)
        try:
            await self.hass.services.async_call(dom, svc, {"entity_id": ent}, blocking=False)
            return True
        except Exception as err:
            _LOGGER.debug("Aktion %s %s: %s", ent, do, err)
            return False

    async def _run_acts(self, kind: str, stage: int = 1) -> int:
        n = 0
        for a in self.cfg["acts"]:
            if a["kind"] in (kind, "any") and a.get("st", 1) == stage and await self._call(a["ent"], a["do"]):
                n += 1
        return n

    # ---- Ausgeschaltete Melder
    def is_paused(self, ent: str, now: Any = None) -> bool:
        p = self.paused.get(ent)
        if not p:
            return False
        if not p["until"]:
            return True
        until = dt_util.parse_datetime(p["until"])
        return bool(until is not None and until > (now or dt_util.now()))

    def _kind(self, ent: str) -> str:
        """Melderart wie in Stufe 1: eigene Zuordnung vor der Geräteklasse, sonst „safety“ (auch für von Hand hinzugefügte)."""
        m = self.cfg["meta"].get(ent) or {}
        if m.get("kind") in KINDS:
            return m["kind"]
        st = self.hass.states.get(ent)
        return (kind_of(st.attributes.get("device_class") if st is not None else "") or ("safety", ""))[0]

    def _name(self, ent: str) -> str:
        m = self.cfg["meta"].get(ent) or {}
        st = self.hass.states.get(ent)
        return m.get("name") or (st.attributes.get("friendly_name") if st is not None else "") or ent

    def _pause(self, ent: str, days: int, auto: bool = False) -> None:
        st = self.hass.states.get(ent)
        until = (dt_util.now() + timedelta(days=days)).isoformat() if days else ""
        self.paused[ent] = {"until": until, "since": dt_util.now().isoformat(), "auto": auto, "was_off": bool(st is None or st.state in OFF_STATES)}
        self.asked.pop(ent, None)
        self._add(f"Ausgeschaltet: {self._name(ent)}" + (" (nach langer Funkstille von selbst)." if auto else "."), "off")

    async def async_pause(self, ent: str, days: int = 0) -> dict[str, Any]:
        """Melder ausschalten: keine Hinweise zu Erreichbarkeit, Batterie, Prüfung und Lebensdauer. Ein Alarm kommt weiter durch."""
        if _ENT.match(ent) and ent in self._known and (ent in self.paused or len(self.paused) < PAUSE_MAX):
            self._pause(ent, int(_num(days, 0, 365, 0)))
            self._save()
        return await self.snapshot()

    async def async_resume(self, ent: str, keep_warn: bool = False) -> dict[str, Any]:
        """Wieder einschalten. Mit keep_warn=True (Antwort auf die Frage „Ausschalten?“) bleibt es beim Warnen."""
        if ent in self.paused:
            del self.paused[ent]
            self._add(f"Eingeschaltet: {self._name(ent)}.", "ok")
        if keep_warn:
            self.asked[ent] = "warn"
        else:
            self.asked.pop(ent, None)
        self._save()
        return await self.snapshot()

    # ---- Ereignis, Mitteilung mit „Verstanden“
    def _fire(self, art: str, ent: str, **extra: Any) -> None:
        m = self.cfg["meta"].get(ent) or {}
        data = {"art": art, "melder": ent, "name": self._name(ent), "raum": m.get("room") or "", **extra}
        try:
            self.hass.bus.async_fire(EVENT_SF, data)
        except Exception:  # noqa: BLE001 - ein Ereignis darf die Überwachung nie stören
            _LOGGER.debug("Ereignis nicht gesendet", exc_info=True)

    @staticmethod
    def _push(ent: str, call: bool = False) -> dict[str, Any]:
        acts = [{"action": ACT_PREFIX + "ACK", "title": "Verstanden"}]
        if call:
            acts.append({"action": "URI", "title": "112 anrufen", "uri": "tel:112"})
        return {"tag": f"sf_{ent}", "ttl": 0, "priority": "high", "channel": "Alarm", "importance": "max",
                "push": {"interruption-level": "critical", "sound": {"name": "default", "critical": 1, "volume": 1.0}}, "actions": acts}

    async def _on_action(self, event: Any) -> None:
        if str((getattr(event, "data", None) or {}).get("action") or "") == ACT_PREFIX + "ACK":
            await self.async_ack("", "", "Handy")

    def _fast_on(self) -> None:
        if self._unsub_fast is None:
            self._unsub_fast = async_track_time_interval(self.hass, self._stages_cb, timedelta(seconds=STAGE_TICK_S))

    def _fast_off(self) -> None:
        if self._unsub_fast is not None:
            self._unsub_fast()
            self._unsub_fast = None

    async def _stages_cb(self, _now: Any) -> None:
        await self.stages_tick()

    async def stages_tick(self, now_ts: float | None = None) -> None:
        """Alarm läuft und niemand hat „Verstanden“ gedrückt: die nächste Stufe auslösen, wenn ihre Zeit um ist."""
        now_ts = now_ts or time.time()
        live = False
        for eid, s in list(self.st.items()):
            if not s.get("a") or s.get("ack"):
                continue
            live = True
            sg = self.cfg["stages"]
            el = now_ts - (s.get("t0") or now_ts)
            name = self._name(eid)
            m = self.cfg["meta"].get(eid) or {}
            where = f" ({m['room']})" if m.get("room") else ""
            k = self._kind(eid)
            for n in (2, 3, 4):
                cfgn = sg[f"s{n}"]
                if cfgn["on"] and s.get("stage", 1) < n and el >= cfgn["sec"]:
                    s["stage"] = n
                    ran = await self._run_acts(k, n)
                    if n == 2:
                        self._add(f"Stufe 2: Haus vorbereitet ({name}){f', {ran} Aktion(en)' if ran else ''}.", "alarm")
                    elif n == 3:
                        self._add(f"Stufe 3: niemand hat „Verstanden“ gedrückt, alle werden informiert ({name}).", "alarm")
                        await self._notify("", f"ALARM nicht quittiert: {name}", f"{name}{where} hat vor {int(el)} Sekunden ausgelöst. Bitte nachsehen und „Verstanden“ drücken.", data=self._push(eid))
                        await self._announce(f"Achtung, Alarm. {name}{where}.")
                    else:
                        self._add(f"Stufe 4: Kontaktperson wird benachrichtigt ({name}).", "alarm")
                        s["s4t"] = 0.0
                    self._fire("stufe", eid, stufe=n)
                    self._save()
            if s.get("stage", 1) >= 4 and now_ts - float(s.get("s4t") or 0) >= S4_REPEAT_S:
                s["s4t"] = now_ts
                c = self.cfg["contact"]["to"]
                await self._notify("", f"ALARM: {name}", f"{name}{where} hat ausgelöst und niemand hat reagiert. Bitte nachsehen. Notruf 112, wenn es brennt.", data=self._push(eid, True), to=[c] if c else [])
        if not live:
            self._fast_off()
        async_dispatcher_send(self.hass, SIGNAL_SF)

    async def _announce(self, text: str) -> None:
        t = self.cfg["tts"]
        if not t["player"] or not t["engine"] or self.hass.states.get(t["engine"]) is None:
            return
        try:
            await self.hass.services.async_call("tts", "speak", {"entity_id": t["engine"], "media_player_entity_id": t["player"], "message": text}, blocking=False)
        except Exception as err:  # noqa: BLE001 - Durchsage ist nur ein Zusatz
            _LOGGER.debug("Durchsage: %s", err)

    async def async_ack(self, ent: str = "", why: str = "", who: str = "App") -> dict[str, Any]:
        """„Verstanden“: die Stufen halten an, die Wiederholungen enden. Mit why wird der Alarm als Fehlalarm gemerkt."""
        now = dt_util.now().isoformat()
        why = re.sub(r"[^\wäöüÄÖÜß .,-]", "", str(why or "")).strip()[:30]
        n = 0
        for eid, s in list(self.st.items()):
            if (ent and eid != ent) or not s.get("a") or s.get("ack"):
                continue
            s["ack"], s["why"] = now, why
            n += 1
            self._add(f"Verstanden: {self._name(eid)} (von {who})" + (f", Fehlalarm: {why}." if why else "."), "ack")
            if why:
                self.fa.setdefault(eid, []).append({"t": now, "why": why})
                del self.fa[eid][:-FA_MAX]
            self._fire("verstanden", eid, fehlalarm=why or None)
            s4 = s.get("stage", 0) >= 4
            await self._clear_push(eid, with_contact=s4)
            if s4:  # die Kontaktperson wurde schon gerufen: Bescheid geben, dass sich jemand kümmert
                await self._tell_contact(f"Erledigt: {self._name(eid)} – jemand hat „Verstanden“ gedrückt und kümmert sich." + (f" Ursache: {why}." if why else ""))
        if n:
            self._save()
            if not any(v.get("a") and not v.get("ack") for v in self.st.values()):
                self._fast_off()
            async_dispatcher_send(self.hass, SIGNAL_SF)
        return await self.snapshot()

    async def _clear_push(self, eid: str, with_contact: bool = False) -> None:
        """Alarm-Mitteilungen (gleicher Tag) auf den Handys entfernen – nach „Verstanden“ und wenn der Alarm endet."""
        to = list(self.cfg["notify"]["to"])
        c = self.cfg["contact"]["to"]
        if with_contact and c and c not in to:
            to.append(c)
        for svc in to:
            name = svc.split(".", 1)[1]
            if self.hass.services.has_service("notify", name):
                try:
                    await self.hass.services.async_call("notify", name, {"message": "clear_notification", "data": {"tag": f"sf_{eid}"}}, blocking=False)
                except Exception:  # noqa: BLE001
                    _LOGGER.debug("Mitteilung nicht entfernt", exc_info=True)

    async def _tell_contact(self, msg: str) -> None:
        c = self.cfg["contact"]["to"]
        if c:
            await self._notify("", "Rauch- und Sicherheitsmelder", msg, to=[c])

    async def async_press_test(self, det_id: str) -> dict[str, Any]:
        """Testknopf des Melders drücken (zum Beispiel X-Sense), sofern das Gerät einen hat."""
        for d in self.detectors():
            if d["id"] == det_id and d["test"]:
                ok = await self._call_press(d["test"])
                if ok:
                    self._add(f"Test ausgelöst: {d['name']}.", "ok")
                    self._save()
                return {"ok": ok}
        return {"ok": False}

    async def _call_press(self, ent: str) -> bool:
        if self.hass.states.get(ent) is None:
            return False
        try:
            await self.hass.services.async_call("button", "press", {"entity_id": ent}, blocking=False)
            return True
        except Exception as err:
            _LOGGER.debug("Testknopf %s: %s", ent, err)
            return False

    # ---- Hauptschleife
    async def _tick(self, _now: Any) -> None:
        if not self.active() or self._busy:
            return
        self._busy = True
        try:
            await self._check()
        finally:
            self._busy = False

    async def _check(self) -> None:
        now_ts, now = time.time(), dt_util.now()
        if not self.first_seen:
            self.first_seen = now.isoformat()
            self._save()
        det = self.detectors()
        seen = {d["id"] for d in det}
        quiet = self.is_quiet()
        self._sample_bat(det, now_ts)
        for e, p in list(self.paused.items()):  # abgelaufen oder wieder erreichbar: von selbst einschalten
            cur = next((x for x in det if x["id"] == e), None)
            if not self.is_paused(e, now):
                del self.paused[e]
                self._add(f"Eingeschaltet: {self._name(e)} (Zeit abgelaufen).", "ok")
                self._save()
            elif p.get("was_off") and cur is not None and not cur["off"]:
                del self.paused[e]
                self._add(f"Wieder erreichbar und eingeschaltet: {self._name(e)}.", "ok")
                await self._notify("off", "Melder wieder da", f"{self._name(e)} ist wieder erreichbar und überwacht wieder.")
                self._save()
        down = await self._src_guard(det, now_ts, now, quiet)
        for d in det:
            s = self.st.setdefault(d["id"], {"a": False, "since": "", "off_since": 0.0, "rep": 0.0})
            s.setdefault("stage", 0), s.setdefault("t0", 0.0), s.setdefault("ack", ""), s.setdefault("why", "")
            where = f" ({d['area']})" if d["area"] else ""
            paused = self.is_paused(d["id"], now)
            in_down = d["src"] in down  # ganze Quelle weg: eine Meldung für alle statt je Melder
            # Alarm (kommt auch bei ausgeschaltetem Melder durch)
            if d["alarm"] and not s["a"]:
                s.update({"a": True, "since": now.isoformat(), "rep": now_ts, "stage": 1, "t0": now_ts, "ack": "", "why": "", "s4t": 0.0})
                n = await self._run_acts(d["k"], 1)
                self._add(f"Alarm: {d['name']}{where}." + (f" {n} Aktion(en) ausgelöst." if n else ""), "alarm")
                await self._notify("alarm", f"ALARM: {d['kind']}", f"{d['name']}{where} hat ausgelöst.", data=self._push(d["id"]))
                self._fire("alarm", d["id"], stufe=1, art_melder=d["k"])
                self.last_alarm = {"t": now.isoformat(), "melder": d["id"], "name": d["name"], "raum": (self.cfg["meta"].get(d["id"]) or {}).get("room") or d["area"]}
                self._fast_on()
                self._save()
            elif d["alarm"] and s["a"]:
                rep = self.cfg["repeat"]
                if rep and not s.get("ack") and now_ts - s["rep"] >= rep * 60:
                    s["rep"] = now_ts
                    await self._notify("alarm", f"ALARM läuft noch: {d['kind']}", f"{d['name']}{where} meldet weiter Alarm.", data=self._push(d["id"]))
            elif not d["alarm"] and s["a"] and not d["off"]:
                was_s4, was_ack = s.get("stage", 0) >= 4, bool(s.get("ack"))
                s.update({"a": False, "since": "", "stage": 0, "t0": 0.0, "ack": "", "why": ""})
                self._add(f"Alarm beendet: {d['name']}{where}.", "ok")
                await self._clear_push(d["id"], with_contact=was_s4)
                await self._notify("end", f"Alarm beendet: {d['kind']}", f"{d['name']}{where} meldet keinen Alarm mehr.")
                if was_s4 and not was_ack:
                    await self._tell_contact(f"Entwarnung: {d['name']}{where} meldet keinen Alarm mehr.")
                self._fire("ende", d["id"])
                self._save()
            # Erreichbarkeit
            if d["off"]:
                s["off_since"] = s["off_since"] or now_ts
                o, oa = self.cfg["off"], self.cfg["offask"]
                off_s = now_ts - s["off_since"]
                if not paused and not in_down:
                    key = f"off:{d['id']}"
                    if o["on"] and not quiet and off_s >= o["min"] * 60 and (oa["mode"] == "never" or self.asked.get(d["id"]) == "warn" or key not in self._notes):
                        if now_ts - self._notes.get(key, 0) >= OFF_NOTE_GAP_S:
                            self._add(f"Nicht erreichbar: {d['name']}{where}.", "off")
                            self._fire("offline", d["id"])
                        await self._notify("off", "Melder nicht erreichbar", f"{d['name']}{where} meldet sich seit über {o['min']} Minuten nicht.", key, OFF_NOTE_GAP_S)
                        self._save()
                    if oa["mode"] != "never" and off_s >= oa["days"] * 86400 and d["id"] not in self.asked:
                        if oa["mode"] == "auto":
                            self._pause(d["id"], 0, True)
                        else:
                            self.asked[d["id"]] = "ask"
                            self._add(f"{d['name']}{where} wirkt ausgeschaltet (seit {oa['days']} Tagen nicht erreichbar).", "off")
                            await self._notify("off", "Melder wirkt ausgeschaltet", f"{d['name']}{where} meldet sich seit {oa['days']} Tagen nicht. Im Modul „Ausschalten“ wählen, dann kommen keine Warnungen mehr dazu.")
                        self._save()
            else:
                if s["off_since"] or d["id"] in self.asked:
                    self._notes.pop(f"off:{d['id']}", None)
                    self.asked.pop(d["id"], None)
                s["off_since"] = 0.0
            # Batterie
            b = self.cfg["bat"]
            if paused:
                pass
            elif b["on"] and not quiet and d["bat"] is not None and d["bat"] < b["pct"]:
                key = f"bat:{d['id']}"
                if now_ts - self._notes.get(key, 0) >= BAT_NOTE_GAP_S:
                    self._add(f"Batterie schwach: {d['name']}{where} ({round(d['bat'])} %).", "warn")
                await self._notify("bat", "Melder-Batterie schwach", f"{d['name']}{where}: Batterie bei {round(d['bat'])} %. Bitte bald wechseln.", key, BAT_NOTE_GAP_S)
                self._save()
        # Frühe Erinnerung aus der Prognose: Batterie erreicht die Schwelle bald (Vorlauf wie bei der Lebensdauer)
        lead, bt = self.cfg["lead"], self.cfg["bat"]
        if bt["on"] and lead and not quiet:
            for d in det:
                f = self.bat_forecast(d["id"]) if d["bat"] is not None and d["bat"] >= bt["pct"] and not self.is_paused(d["id"], now) else None
                if f and 0 < f["thr"] <= lead:
                    key = f"batf:{d['id']}"
                    if now_ts - self._notes.get(key, 0) >= BAT_NOTE_GAP_S:
                        self._add(f"Batterie reicht bald nicht mehr: {d['name']} (noch etwa {f['thr']} Tage bis {bt['pct']} %).", "warn")
                    where = f" ({d['area']})" if d["area"] else ""
                    await self._notify("bat", "Melder-Batterie wird bald schwach", f"{d['name']}{where}: noch etwa {f['thr']} Tage bis {bt['pct']} %.", key, BAT_NOTE_GAP_S)
                    self._save()
        for k in [k for k in self.st if k not in seen]:
            if not self.st[k]["a"]:
                del self.st[k]
        # Prüf-Erinnerung (je Melder, sonst nach der allgemeinen Frist) und Lebensdauer
        if not quiet and det:
            due = [d for d in det if not d["off"] and not self.is_paused(d["id"], now) and self._test_due(d, now)]
            if due and self.cfg["test"]["on"]:
                if now_ts - self._notes.get("test", 0) >= TEST_NOTE_GAP_S:
                    self._add("Erinnerung: Melder prüfen (Testknopf drücken).", "warn")
                names = ", ".join(d["name"] for d in due[:4]) + (" …" if len(due) > 4 else "")
                await self._notify("test", "Melder prüfen", f"Zu prüfen: {names}. Bitte den Testknopf drücken und danach in der App „Geprüft“ antippen.", "test", TEST_NOTE_GAP_S)
                self._save()
            lead = self.cfg["lead"]
            for d in det:
                left = self._life_days(d, now)
                if left is not None and left <= lead and not self.is_paused(d["id"], now):
                    key = f"life:{d['id']}"
                    if now_ts - self._notes.get(key, 0) >= LIFE_NOTE_GAP_S:
                        self._add(f"Austausch fällig: {d['name']}" + (f" (in {left} Tagen)." if left > 0 else " (überfällig)."), "warn")
                    await self._notify("life", "Melder austauschen", f"{d['name']}: " + (f"Lebensdauer endet in {left} Tagen." if left > 0 else "Die Lebensdauer ist abgelaufen. Bitte austauschen."), key, LIFE_NOTE_GAP_S)
                    self._save()
        await self._check_depart()
        await self._selftest_due(det, now, quiet)
        self._sum = self._summary(det, now)
        async_dispatcher_send(self.hass, SIGNAL_SF)

    async def _src_guard(self, det: list[dict[str, Any]], now_ts: float, now: Any, quiet: bool) -> set[str]:
        """Quellen-Wächter: Fallen alle Melder einer Quelle (z. B. X-Sense-Cloud) gleichzeitig aus, kommt eine Meldung statt vieler."""
        if not self.cfg["guard"]["src"]:
            if self.src_off:
                self.src_off = {}
                self._save()
            return set()
        down = src_down(det, {d["id"] for d in det if self.is_paused(d["id"], now)})
        o = self.cfg["off"]
        for src, lst in down.items():
            for d in lst:  # Ausfallzeit gilt je Melder, damit die Einzelwarnung später richtig weiterzählt
                s = self.st.setdefault(d["id"], {"a": False, "since": "", "off_since": 0.0, "rep": 0.0})
                s["off_since"] = s.get("off_since") or now_ts
            since = min(self.st[d["id"]]["off_since"] for d in lst)
            key = f"src:{src}"
            if src not in self.src_off and o["on"] and now_ts - since >= o["min"] * 60:
                self.src_off[src] = dt_util.now().isoformat()
                self._add(f"Quelle ausgefallen: {src_name(src)} ({len(lst)} Melder nicht erreichbar).", "off")
                self._fire("quelle_aus", "", quelle=src, anzahl=len(lst))
                if not quiet:
                    await self._notify("off", "Melder-Quelle ausgefallen", f"Alle {len(lst)} Melder von {src_name(src)} sind seit über {o['min']} Minuten nicht erreichbar. "
                                       "Meist liegt es an der Cloud, dem Gateway oder dem Internet, nicht an den Meldern. Die Melder warnen vor Ort weiter selbst.", key, OFF_NOTE_GAP_S)
                self._save()
        for src in [k for k in self.src_off if k not in down]:
            del self.src_off[src]
            self._add(f"Quelle wieder erreichbar: {src_name(src)}.", "ok")
            self._fire("quelle_da", "", quelle=src)
            if self._notes.pop(f"src:{src}", None) is not None and not quiet:
                await self._notify("off", "Melder-Quelle wieder da", f"Die Melder von {src_name(src)} melden sich wieder.")
            self._save()
        return set(down)

    def selftest_run(self, det: list[dict[str, Any]], now: Any) -> dict[str, Any]:
        """Wochen-Selbsttest: Sind alle Melder erreichbar, Batterien gut, Prüfung und Austausch im Plan? Nur Anzeige, keine Aktion."""
        act = [d for d in det if not self.is_paused(d["id"], now)]
        b, p = self.cfg["bat"], []
        for src, lst in src_down(act).items():
            p.append(f"Quelle {src_name(src)} ausgefallen ({len(lst)} Melder)")
        gone = {d["id"] for lst in src_down(act).values() for d in lst}
        p += [f"{d['name']} nicht erreichbar" for d in act if d["off"] and d["id"] not in gone]
        p += [f"{d['name']}: Batterie {round(d['bat'])} %" for d in act if d["bat"] is not None and d["bat"] < b["pct"]]
        if self.cfg["test"]["on"]:
            p += [f"{d['name']}: Prüfung fällig" for d in act if not d["off"] and self._test_due(d, now)]
        for d in act:
            left = self._life_days(d, now)
            if left is not None and left <= 0:
                p.append(f"{d['name']}: Lebensdauer abgelaufen")
        self.selftest = {"t": now.isoformat(), "ok": not p, "n": len(act), "p": p[:10]}
        if p:
            self._add(f"Wochen-Selbsttest: {len(p)} Hinweis(e) – " + "; ".join(p[:3]) + (" …" if len(p) > 3 else "."), "warn")
        else:
            self._add(f"Wochen-Selbsttest: alle {len(act)} Melder erreichbar, Batterien gut.", "ok")
        self._fire("selbsttest", "", ok=not p, hinweise=len(p))
        self._save()
        return self.selftest

    async def _selftest_due(self, det: list[dict[str, Any]], now: Any, quiet: bool) -> None:
        """Sonntags ab 18 Uhr einmal prüfen. Fällt das in die Ruhezeit, läuft der Test trotzdem, die Mitteilung kommt danach."""
        r = self.selftest
        if r.get("pend") and not quiet:
            r["pend"] = False
            self._save()
            if not r.get("ok"):
                await self._notify("self", "Wochen-Selbsttest: " + (f"{len(r['p'])} Hinweise" if len(r["p"]) > 1 else "1 Hinweis"), "\n".join(r["p"][:6]))
        if not self.cfg["selftest"]["on"] or not det or now.weekday() != SELF_DAY or now.strftime("%H:%M") < SELF_AT:
            return
        if str(self.selftest.get("t") or "")[:10] == now.date().isoformat():
            return
        r = self.selftest_run(det, now)
        if not r["ok"] and quiet:
            r["pend"] = True
            self._save()
        elif not r["ok"]:
            await self._notify("self", "Wochen-Selbsttest: " + (f"{len(r['p'])} Hinweise" if len(r["p"]) > 1 else "1 Hinweis"), "\n".join(r["p"][:6]))

    async def async_selftest(self) -> dict[str, Any]:
        """„Jetzt prüfen“ in der App oder per Dienst: Selbsttest sofort, ohne Mitteilung."""
        if self.active():
            self.selftest_run(self.detectors(), dt_util.now())
            async_dispatcher_send(self.hass, SIGNAL_SF)
        return await self.snapshot()

    def _summary(self, det: list[dict[str, Any]], now: Any) -> dict[str, Any]:
        """Kurzstand für die Sensoren (ruhig, hinweis, alarm) und die Startseite."""
        act = [d for d in det if not self.is_paused(d["id"], now)]
        alarm = [d for d in det if self.st.get(d["id"], {}).get("a")]
        b = self.cfg["bat"]
        warn = [d for d in act if d["off"] or (d["bat"] is not None and d["bat"] < b["pct"]) or self._test_due(d, now)]
        bats = [d["bat"] for d in act if d["bat"] is not None]
        nxt = None
        for d in act:
            m = self.cfg["meta"].get(d["id"]) or {}
            base = dt_util.parse_datetime(self.tested.get(d["id"]) or self.last_test or self.first_seen or "")
            if base is None:
                continue
            mo = (m.get("int") or self.cfg["test"]["months"])
            t = base.replace(year=base.year + (base.month - 1 + mo) // 12, month=(base.month - 1 + mo) % 12 + 1, day=min(base.day, 28))
            if nxt is None or t < nxt:
                nxt = t
        return {"status": "alarm" if alarm else "hinweis" if warn else "ruhig", "alarme": len(alarm), "melder": len(act), "ausgeschaltet": len(det) - len(act),
                "hinweise": len(warn), "bat_min": round(min(bats)) if bats else None, "pruefung": nxt.date().isoformat() if nxt else None,
                "unquittiert": sum(1 for d in alarm if not self.st[d["id"]].get("ack")),
                "offline": [d["name"] for d in act if d["off"]], "quellen_aus": [src_name(k) for k in self.src_off],
                "letzter_alarm": self.last_alarm.get("t") or None, "letzter_alarm_info": dict(self.last_alarm)}

    def _sample_bat(self, det: list[dict[str, Any]], now_ts: float) -> None:
        for d in det:
            if d["bat"] is None:
                continue
            h = self.bhist.setdefault(d["id"], [])
            if not h or now_ts - h[-1][0] >= BHIST_GAP_S:
                h.append([round(now_ts), round(d["bat"], 1)])
                del h[:-BHIST_MAX]
                self._save()

    def bat_forecast(self, det_id: str) -> dict[str, Any] | None:
        """Prognose aus dem Verlauf: Tage bis 0 % und bis zur Schwelle (ab Einstellung „Batterie schwach“)."""
        h = self.bhist.get(det_id) or []
        f = bat_fit(h)
        if f is None:
            return None
        now_b = h[-1][1]
        thr = self.cfg["bat"]["pct"]
        days = lambda to: max(0, int((to - now_b) / f["slope"])) if now_b > to else 0  # noqa: E731
        return {"zero": days(0), "thr": days(thr), "slope": round(f["slope"], 3)}

    def bat_days(self, det_id: str, now_ts: float | None = None) -> int | None:
        """Wie viele Tage die Batterie noch bis 0 % hält (Gerade durch die Messpunkte seit dem letzten Tausch)."""
        f = self.bat_forecast(det_id)
        return f["zero"] if f else None

    def _life_days(self, d: dict[str, Any], now: Any) -> int | None:
        m = self.cfg["meta"].get(d["id"]) or {}
        if not m.get("inst") or not m.get("life"):
            return None
        y, mo = int(m["inst"][:4]) + int(m["life"]), int(m["inst"][5:])
        end = now.replace(year=y, month=mo, day=1, hour=0, minute=0, second=0, microsecond=0)
        return (end - now).days

    def _test_due(self, d: dict[str, Any], now: Any) -> bool:
        m = self.cfg["meta"].get(d["id"]) or {}
        months = m.get("int") or self.cfg["test"]["months"]
        ms = months_since(self.tested.get(d["id"]) or self.last_test or self.first_seen, now)
        return ms is not None and ms >= months

    @staticmethod
    def _is_open(state: Any) -> bool:
        return state in ("on", "open", "opening", "unlocked", "heat", "cool")

    def depart_open(self) -> list[dict[str, str]]:
        out = []
        for e in self.cfg["depart"]["ents"]:
            st = self.hass.states.get(e)
            if st is not None and self._is_open(st.state):
                out.append({"id": e, "name": st.attributes.get("friendly_name") or e})
        return out

    async def _check_depart(self) -> None:
        """Alle Personen weg und noch etwas offen: einmal melden."""
        ids = list(self.hass.states.async_entity_ids("person"))
        if not ids:
            return
        home = any((self.hass.states.get(i) is not None and self.hass.states.get(i).state == "home") for i in ids)
        was, self._home = self._home, home
        if was is True and not home and self.cfg["depart"]["on"]:
            op = self.depart_open()
            if op:
                names = ", ".join(x["name"] for x in op[:5]) + (" …" if len(op) > 5 else "")
                self._add(f"Abfahrt-Prüfung: {len(op)} offen ({names}).", "warn")
                await self._notify("depart", "Du bist unterwegs, es ist noch etwas offen", names)
                self._save()

    async def async_config_changed(self) -> None:
        await self._tick(None)

    async def async_set(self, raw: Any) -> dict[str, Any]:
        self.cfg = clean_cfg({**self.cfg, **raw} if isinstance(raw, dict) else raw)  # fehlende Felder (alter Browser) behalten ihren Stand
        hs = self.hass.data.get(DOMAIN, {}).get("grundriss")
        if hs is not None and isinstance(raw, dict) and "plan" in raw:
            hs.set_plan(self.cfg["plan"], "sf")  # Baukasten von Modul 11 schreibt in Modul 0
        self._save()
        await self.async_config_changed()
        return await self.snapshot()

    async def async_mark_tested(self, ent: str = "", bat: bool = False) -> dict[str, Any]:
        """Geprüft (ein Melder oder alle). Mit bat=True: Batterie getauscht, der Verlauf beginnt neu."""
        now = dt_util.now().isoformat()
        if bat and ent:
            self.bhist.pop(ent, None)
            self._notes.pop(f"bat:{ent}", None)
            self._notes.pop(f"batf:{ent}", None)
            self.swaps.setdefault(ent, []).append(now)
            del self.swaps[ent][:-THIST_MAX]
            self._add(f"Batterie getauscht: {self._name(ent)}.", "ok")
            self._save()
            return await self.snapshot()
        self.last_test = now
        if ent:
            self.tested[ent] = now
            self.thist.setdefault(ent, []).append(now)
            del self.thist[ent][:-THIST_MAX]
        else:
            self.tested = {}
            for d in self._known:
                self.thist.setdefault(d, []).append(now)
                del self.thist[d][:-THIST_MAX]
        self._notes.pop("test", None)
        self._add("Melder geprüft (von Hand bestätigt)." if not ent else f"Geprüft: {self._name(ent)}.", "ok")
        self._save()
        return await self.snapshot()

    async def snapshot(self) -> dict[str, Any]:
        det = self.detectors()
        now = dt_util.now()
        ms = months_since(self.last_test or self.first_seen, now)
        t = self.cfg["test"]
        test = {"last": self.last_test or None, "first": self.first_seen or None, "months": t["months"], "due": bool(t["on"] and ms is not None and ms >= t["months"])}
        for d in det:
            s = self.st.get(d["id"]) or {}
            d["since"] = s.get("since") or None
            m = self.cfg["meta"].get(d["id"]) or {}
            d["floor"], d["room"], d["btype"], d["inst"], d["life"] = m.get("floor", ""), m.get("room", ""), m.get("btype", ""), m.get("inst", ""), m.get("life", 0)
            d["life_days"] = self._life_days(d, now)
            d["tested"] = self.tested.get(d["id"]) or None
            d["tests"] = self.thist.get(d["id"]) or ([d["tested"]] if d["tested"] else [])
            d["swaps"] = self.swaps.get(d["id"]) or []
            d["test_due"] = self._test_due(d, now)
            fc = self.bat_forecast(d["id"])
            d["bat_days"] = fc["zero"] if fc else None
            d["bat_thr_days"] = fc["thr"] if fc else None
            d["bat_hist"] = (self.bhist.get(d["id"]) or [])[-BHIST_MAX:]
            p = self.paused.get(d["id"])
            d["paused"] = {"until": p["until"] or None, "since": p["since"] or None, "auto": p["auto"]} if p and self.is_paused(d["id"], now) else None
            d["ask"] = self.asked.get(d["id"]) == "ask"
            d["off_days"] = int((time.time() - s["off_since"]) // 86400) if d["off"] and s.get("off_since") else 0
            d["stage"], d["t0"], d["ack"], d["why"] = (s.get("stage") or 0) if s.get("a") else 0, s.get("t0") or 0, s.get("ack") or None, s.get("why") or None
            cut = (now - timedelta(days=90)).isoformat()
            d["fa_n"] = sum(1 for x in self.fa.get(d["id"], []) if x["t"] >= cut)
            d["fa_why"] = [x["why"] for x in self.fa.get(d["id"], [])[-5:] if x["why"]]
        # Alle erkannten Melder inkl. ausgeschlossener, damit man sie wieder einschalten kann
        reg = er.async_get(self.hass)
        excl = []
        for e in self.cfg["excl"]:
            st = self.hass.states.get(e)
            excl.append({"id": e, "name": (st.attributes.get("friendly_name") if st is not None else "") or e})
        xs = sum(1 for d in det if d["src"] == "xsense")
        xs_any = any(e.platform == "xsense" for e in reg.entities.values())
        return {"cfg": self.cfg, "det": det, "excl": excl, "test": test, "log": self.log[:40], "open": self.depart_open(), "home": self._home, "xs": {"found": xs_any, "n": xs},
                "sum": self._sum or self._summary(det, now), "now": time.time(),
                "src_off": [{"src": k, "name": src_name(k), "since": v} for k, v in self.src_off.items()], "selftest": self.selftest or None,
                "selftest_next": self._selftest_next(now) if self.cfg["selftest"]["on"] else None}

    @staticmethod
    def _selftest_next(now: Any) -> str:
        h, m = (int(x) for x in SELF_AT.split(":"))
        t = (now + timedelta(days=(SELF_DAY - now.weekday()) % 7)).replace(hour=h, minute=m, second=0, microsecond=0)
        return (t if t > now else t + timedelta(days=7)).isoformat()


SERVICES = ("sicherheit_quittieren", "melder_geprueft", "sicherheit_selbsttest")


def async_register_services(hass: HomeAssistant) -> None:
    """Dienste für eigene Automationen: quittieren, Melder geprüft, Selbsttest. Ohne aktives Modul 11 tun sie nichts."""
    import voluptuous as vol  # erst hier, damit die Tests ohne Home Assistant laufen

    def mgr() -> SicherheitManager | None:
        m = hass.data.get(DOMAIN, {}).get("sicherheit")
        return m if m is not None and m.active() else None

    async def ack(call: Any) -> None:
        m = mgr()
        if m is not None:
            await m.async_ack(_ent(call.data.get("melder"), ("binary_sensor",)), str(call.data.get("fehlalarm") or "")[:30], "Automation")

    async def tested(call: Any) -> None:
        m = mgr()
        if m is not None:
            await m.async_mark_tested(_ent(call.data.get("melder"), ("binary_sensor",)))

    async def selftest(call: Any) -> None:
        m = mgr()
        if m is not None:
            await m.async_selftest()

    opt = vol.Schema({vol.Optional("melder"): str, vol.Optional("fehlalarm"): str})
    for name, fn, schema in (("sicherheit_quittieren", ack, opt), ("melder_geprueft", tested, vol.Schema({vol.Optional("melder"): str})), ("sicherheit_selbsttest", selftest, vol.Schema({}))):
        if not hass.services.has_service(DOMAIN, name):
            hass.services.async_register(DOMAIN, name, fn, schema=schema)
