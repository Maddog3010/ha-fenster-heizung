"""Fehler-Statistik Build 1: Programmfehler bereinigen, zusammenfassen und speichern – ohne Home Assistant (testbar).

Ein Fehler wird zu einem Eintrag mit „Fingerabdruck“ (Quelle + Art + Stelle + bereinigte Meldung). Gleiche Fehler werden
gezählt statt wiederholt. Die Bereinigung entfernt alles, was auf den Nutzer zeigt: Entitäten, Namen in Anführungszeichen,
Zahlen und Werte, Adressen, Dateipfade außerhalb von Strom & Wärme, Kennungen. In Build 1 bleibt alles lokal.
"""
from __future__ import annotations

import hashlib
import re
from datetime import date, timedelta
from typing import Any

KEEP_DAYS = 30
MAX_ENTRIES = 200
MSG_MAX = 200
SOURCES = ("backend", "befehl", "oberflaeche")

_DOMAINS = (
    "sensor|binary_sensor|switch|light|climate|cover|fan|input_boolean|input_number|input_select|input_text|input_datetime|"
    "number|select|button|lock|media_player|person|device_tracker|zone|weather|sun|automation|script|scene|group|timer|"
    "counter|water_heater|humidifier|vacuum|camera|alarm_control_panel|notify|update|event|todo|calendar|image|text|valve|siren"
)
_RX = [
    (re.compile(r"https?://\S+|wss?://\S+", re.I), "<adresse>"),
    (re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b"), "<adresse>"),
    (re.compile(r"\b\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?\b"), "<adresse>"),
    (re.compile(r"\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b", re.I), "<id>"),
    (re.compile(r"\b[0-9a-f]{16,}\b", re.I), "<id>"),
    (re.compile(rf"\b({_DOMAINS})\.[a-z0-9_]+\b"), r"\1.*"),
    (re.compile(r"(?:[A-Za-z]:)?(?:[\\/][\w.\-]+){2,}[\\/]?"), "<pfad>"),
]
_QUOTED = re.compile(r"(['\"„“])([^'\"„“\n]{0,80})(['\"“”])")
_KEY = re.compile(r"^[a-z_][a-z0-9_.]{0,23}$")
_NUM = re.compile(r"(?<![\w.])-?\d+(?:[.,]\d+)?(?![\w])")


def sanitize(msg: Any) -> str:
    """Meldung ohne persönliche Angaben. Technische Schlüssel in Anführungszeichen ('id', 'heater') bleiben stehen."""
    s = str(msg or "").replace("\r", " ").replace("\n", " ").strip()
    for rx, rep in _RX:
        s = rx.sub(rep, s)
    s = _QUOTED.sub(lambda m: m.group(0) if _KEY.match(m.group(2)) else f"{m.group(1)}…{m.group(3)}", s)
    s = _NUM.sub("#", s)
    s = re.sub(r"\s+", " ", s)
    return s[:MSG_MAX]


def where_of(path: str, line: int | None = None, func: str = "") -> str:
    """Stelle im Code: nur Dateiname aus Strom & Wärme, Zeile und Funktion (z. B. „wallbox.py:976 add_km“)."""
    p = str(path or "").replace("\\", "/")
    if "/fenster_heizung/" not in p and not p.startswith("fenster_heizung/"):
        return ""
    name = p.split("/fenster_heizung/", 1)[-1] if "/fenster_heizung/" in p else p.split("/", 1)[-1]
    out = f"{name}:{int(line)}" if line else name
    return f"{out} {func}".strip() if func and re.fullmatch(r"[A-Za-z_]\w{0,60}", func) else out


_MOD_FILES = [
    (r"^wallbox|^goe|evcc", "Modul 8"), (r"^wetter", "Modul 9"), (r"^grundriss|^haus|^gr_", "Modul 0"),
    (r"^sicherheit|^melder", "Modul 11"), (r"^heizer|^geraete|^climate|^luftf|^lueft", "Modul 1"),
    (r"^warmwasser", "Modul 2"), (r"^energie|^ebuch|^energiebuch", "Modul 3"), (r"^tarif|^preise", "Modul 14"),
    (r"^wartung", "Modul 15"), (r"^addons/licht", "Modul 18"), (r"^addons/muell", "Modul 17"), (r"^addons/abrechnung", "Modul 20"),
    (r"^stats|^fehler", "Statistik"), (r"^saison|^advent", "Weihnachts-Theme"), (r"^sponsor", "Sponsor"),
]
_MOD_CMDS = [
    (r"^(heizer|room|plan|layout|presence|lf_|mess)", "Modul 1"), (r"^(wb_|goe)", "Modul 8"), (r"^wx", "Modul 9"), (r"^gr_|^haus", "Modul 0"),
    (r"^sf_", "Modul 11"), (r"^tarif|^preise", "Modul 14"), (r"^wt_", "Modul 15"), (r"^li_", "Modul 18"), (r"^advent|^saison", "Weihnachts-Theme"),
    (r"^stats|^err_", "Statistik"), (r"^spn", "Sponsor"),
]


_MOD_JS = [
    (r"^_(gr|haus)", "Modul 0"), (r"^_(rk|eh|htr|lf|mess|room)", "Modul 1"), (r"^_ww", "Modul 2"), (r"^_(en|ef|m3)", "Modul 3"),
    (r"^_(ev|wb|goe|rf)", "Modul 8"), (r"^_wx", "Modul 9"), (r"^_sf", "Modul 11"), (r"^_tarif|^_tf", "Modul 14"), (r"^_wt", "Modul 15"),
    (r"^_li", "Modul 18"), (r"^_(sts|err)", "Statistik"), (r"^_(adv|sz)", "Weihnachts-Theme"), (r"^_spn", "Sponsor"),
]


def module_of(where: str = "", cmd: str = "") -> str:
    if str(where or "").startswith("_"):   # Oberfläche: Funktionsname aus panel.js
        for rx, m in _MOD_JS:
            if re.search(rx, where):
                return m
    if cmd:
        c = str(cmd).split("/", 1)[-1]
        for rx, m in _MOD_CMDS:
            if re.search(rx, c):
                return m
    w = str(where or "").split(":", 1)[0]
    for rx, m in _MOD_FILES:
        if re.search(rx, w):
            return m
    return "Allgemein"


def fingerprint(src: str, kind: str, where: str, msg: str) -> str:
    w = re.sub(r":\d+", "", str(where or ""))   # Zeilennummer gehört nicht dazu – nach einem Update bleibt es derselbe Fehler
    return hashlib.sha1(f"{src}|{kind}|{w}|{msg}".encode()).hexdigest()[:12]


def empty() -> dict[str, Any]:
    return {"v": 1, "items": {}, "cfg": clean_cfg(None)}


def add(st: dict[str, Any], *, src: str, kind: str, where: str, msg: str, today: date, version: str, ha: str = "",
        cmd: str = "", dev: str = "", chain: list[str] | None = None) -> dict[str, Any] | None:
    """Einen Fehler eintragen (bereinigt). Gibt den Eintrag zurück oder None, wenn er nicht zählt."""
    if src not in SOURCES:
        return None
    kind = re.sub(r"[^\w.\- ]", "", str(kind or "Fehler"))[:60] or "Fehler"
    where = str(where or "")[:120]
    m = sanitize(msg)
    fp = fingerprint(src, kind, where, m)
    it = st.setdefault("items", {})
    d = today.isoformat()
    e = it.get(fp)
    if e is None:
        if len(it) >= MAX_ENTRIES:
            oldest = min(it.values(), key=lambda x: (x["last"], x["n"]))
            it.pop(oldest["fp"], None)
        e = it[fp] = {"fp": fp, "src": src, "kind": kind, "where": where, "mod": module_of(where, cmd), "msg": m,
                      "n": 0, "first": d, "last": d, "vers": [], "ha": ha[:20], "dev": {}}
    e["n"] = min(e["n"] + 1, 999999)
    e["nd"] = min(int(e.get("nd", 0)) + 1, 999999)   # seit dem letzten Senden (Build 2)
    e["last"] = d
    if version and version not in e["vers"]:
        e["vers"] = (e["vers"] + [version[:20]])[-5:]
    if ha:
        e["ha"] = ha[:20]
    if dev in ("handy", "tablet", "pc", "app"):
        e["dev"][dev] = e["dev"].get(dev, 0) + 1
    ch = clean_chain(chain)
    if len(ch) > 1:
        e["chain"] = ch   # Build 12: letzte Aufrufkette (nur Stellen in Strom & Wärme)
    return e


def prune(st: dict[str, Any], today: date) -> int:
    lim = (today - timedelta(days=KEEP_DAYS)).isoformat()
    it = st.get("items", {})
    old = [k for k, e in it.items() if e.get("last", "") < lim]
    for k in old:
        it.pop(k, None)
    return len(old)


def clean(raw: Any) -> dict[str, Any]:
    st = empty()
    if not isinstance(raw, dict):
        return st
    st["cfg"] = clean_cfg(raw.get("cfg"))
    if not isinstance(raw.get("items"), dict):
        return st
    for k, e in list(raw["items"].items())[:MAX_ENTRIES]:
        if isinstance(e, dict) and re.fullmatch(r"[0-9a-f]{12}", str(k)) and e.get("src") in SOURCES:
            try:
                st["items"][k] = {"fp": k, "src": e["src"], "kind": str(e.get("kind", ""))[:60], "where": str(e.get("where", ""))[:120],
                                  "mod": str(e.get("mod", "Allgemein"))[:30], "msg": str(e.get("msg", ""))[:MSG_MAX], "n": int(e.get("n", 1)),
                                  "first": str(e.get("first", ""))[:10], "last": str(e.get("last", ""))[:10],
                                  "vers": [str(v)[:20] for v in (e.get("vers") or [])][-5:], "ha": str(e.get("ha", ""))[:20],
                                  "dev": {str(a): int(b) for a, b in (e.get("dev") or {}).items() if a in ("handy", "tablet", "pc", "app")},
                                  "nd": max(0, int(e.get("nd", 0)))}
                ch = clean_chain(e.get("chain"))
                if len(ch) > 1:
                    st["items"][k]["chain"] = ch
                srv = clean_srv(e.get("srv"))
                if srv:
                    st["items"][k]["srv"] = srv
            except (TypeError, ValueError):
                continue
    return st


def view(st: dict[str, Any]) -> list[dict[str, Any]]:
    """Liste für die Oberfläche: neueste zuerst, dann häufigste."""
    return sorted(st.get("items", {}).values(), key=lambda e: (e["last"], e["n"]), reverse=True)


def as_text(e: dict[str, Any]) -> str:
    """Zum Kopieren (z. B. für ein GitHub-Issue)."""
    src = {"backend": "Backend", "befehl": "Befehl", "oberflaeche": "Oberfläche"}.get(e["src"], e["src"])
    return (f"Strom & Wärme · {e['mod']} · {src}\n{e['kind']}: {e['msg']}\n"
            + (f"Stelle: {e['where']}\n" if e.get("where") else "")
            + f"{e['n']}× · {e['first']} bis {e['last']} · Version {', '.join(e.get('vers') or ['?'])}"
            + (f" · Home Assistant {e['ha']}" if e.get("ha") else "") + f" · Fehler-ID {e['fp']}")


# ------------------------------------------------------------ Build 2: Fehlerberichte senden (eigene Zustimmung)
SCHEMA = 4          # Build 12: „dev“ = Gerätearten (Handy, Tablet, Computer, App), „chain“ = bis zu 3 Stellen im eigenen Code · Build 7: „known“ = schon gesendete Fehler, für die der Server den Status zurückmeldet · Build 6: Bericht auch ohne Fehler (Tages-Meldung „0 Fehler“) und mit den Kurzzeichen der aktiven Module
# Module, die man aus- oder einschalten kann (Kurzzeichen wie in der Versions-Statistik, dazu gr = Modul 0 und die Add-ons).
# Modul 1 und der Kern sind immer an und brauchen kein Kürzel. Eigene Erweiterungen (x…) werden nie gemeldet.
MOD_KEYS = ("gr", "ww", "en", "gs", "lu", "rb", "wp", "ev", "wx", "ga", "sf", "pl", "bt", "dt", "wa", "sp", "mu", "li", "ef", "ab")
ADDON_KEYS = {"muell": "mu", "licht": "li", "abrechnung": "ab"}
MAX_SEND = 50
INTERVAL = 24 * 3600
_ID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")


def clean_cfg(raw: Any) -> dict[str, Any]:
    r = raw if isinstance(raw, dict) else {}
    i = str(r.get("id") or "")
    c = {"asked": bool(r.get("asked")), "on": bool(r.get("on")), "id": i if _ID.match(i) else "",
         "last_ok": float(r.get("last_ok") or 0), "last_try": float(r.get("last_try") or 0), "err": str(r.get("err") or "")[:20],
         "skip": [str(x) for x in (r.get("skip") or []) if re.fullmatch(r"[0-9a-f]{12}", str(x))][:MAX_ENTRIES]}
    if c["on"] and not c["id"]:
        c["on"] = False   # ohne gültige Kennung wird nichts gesendet
    return c


def channel_of(version: str) -> str:
    return "beta" if re.search(r"b\d+$", str(version or "")) else "stable"


def active_mods(on: Any, addons: Any = None) -> list[str]:
    """Kurzzeichen der eingeschalteten Module (nur echtes True) und der installierten, nicht pausierten Add-ons – feste Reihenfolge."""
    on = on if isinstance(on, dict) else {}
    got = {k for k in MOD_KEYS if on.get(k) is True}
    if isinstance(addons, dict):
        got |= {ADDON_KEYS[a] for a, v in addons.items() if a in ADDON_KEYS and isinstance(v, dict) and not v.get("paused")}
    return [k for k in MOD_KEYS if k in got]


def build_report(st: dict[str, Any], version: str, ha: str = "", real: bool = True, mods: Any = None) -> dict[str, Any] | None:
    """Der komplette Bericht – genau das wird gesendet. Nur Fehler seit dem letzten Senden (nd > 0), ohne „weglassen“.

    Build 6: Auch ohne neue Fehler wird einmal am Tag ein Bericht mit „errors: []“ geschickt. Nur so weiß die Statistik,
    wie viele Installationen eine Version fehlerfrei nutzen (Fehlerquote je Version). Dazu die aktiven Module als Kurzzeichen."""
    c = st.get("cfg") or clean_cfg(None)
    if real and not (c["on"] and c["id"]):
        return None
    skip = set(c["skip"])
    rows = [e for e in view(st) if e.get("nd", 0) > 0 and e["fp"] not in skip][:MAX_SEND]
    return {"schema": SCHEMA, "id": c["id"] if real else "7f3c1e9a-4b2d-4c5e-9a1f-2d8b6e0c3a41", "version": str(version)[:20],
            "channel": channel_of(version), "ha": str(ha)[:20],
            "mods": [k for k in MOD_KEYS if isinstance(mods, (list, tuple, set)) and k in mods],
            "known": [e["fp"] for e in view(st) if e["fp"] not in skip and e["fp"] not in {x["fp"] for x in rows} and was_sent(e)][:MAX_ENTRIES],
            "errors": [{"fp": e["fp"], "src": e["src"], "mod": e["mod"], "kind": e["kind"], "where": e["where"], "msg": e["msg"],
                        "n": int(e["nd"]), "first": e["first"], "last": e["last"], "vers": list(e.get("vers") or []),
                        **({"dev": sorted(k for k, v in e["dev"].items() if v)} if any(e.get("dev", {}).values()) else {}),
                        **({"chain": list(e["chain"])} if e.get("chain") else {})} for e in rows]}


def mark_sent(st: dict[str, Any], report: dict[str, Any], now: float) -> None:
    sent = {x["fp"] for x in report.get("errors", [])}
    for fp, e in st.get("items", {}).items():
        if fp in sent:
            e["nd"] = 0
    st["cfg"]["last_ok"] = st["cfg"]["last_try"] = now
    st["cfg"]["err"] = ""


def is_due(st: dict[str, Any], now: float) -> bool:
    c = st.get("cfg") or {}
    return bool(c.get("on")) and now - max(c.get("last_ok", 0), c.get("last_try", 0)) >= INTERVAL


# ------------------------------------------------------------ Build 7: Rückmeldung an den Nutzer (Status der eigenen Fehler)
SRV_STATUS = ("offen", "arbeit", "behoben")   # „ignoriert“ meldet der Server nicht – dann zeigt die Integration nichts an
_VER = re.compile(r"^(\d{4})\.(\d{1,2})\.(\d{1,2})(?:\.(\d{1,2}))?(?:b(\d{1,3}))?$")


def was_sent(e: dict[str, Any]) -> bool:
    """Schon einmal gesendet: „nd“ zählt seit dem letzten Senden, „n“ insgesamt – ist n größer, ging ein Teil schon raus."""
    return int(e.get("n", 0)) > int(e.get("nd", 0))


def vkey(v: Any) -> tuple[int, ...]:
    """Versions-Reihenfolge wie im Worker: 2026.11.4.2 < 2026.11.4.3b1 < 2026.11.4.3 < 2026.11.5b1. Unbekannt → ganz alt."""
    m = _VER.match(str(v or ""))
    if not m:
        return (0, 0, 0, 0, 0, 0)
    y, mo, r_, h, b = m.groups()
    return (int(y), int(mo), int(r_), int(h or 0), 0 if b is not None else 1, int(b or 0))


def clean_srv(raw: Any) -> dict[str, str] | None:
    if not isinstance(raw, dict) or raw.get("s") not in SRV_STATUS:
        return None
    fx = str(raw.get("fx") or "")
    return {"s": raw["s"], "fx": fx if raw["s"] == "behoben" and _VER.match(fx) else "", "d": str(raw.get("d") or "")[:10]}


def apply_status(st: dict[str, Any], report: dict[str, Any], answer: Any, today: date) -> int:
    """Antwort des Servers übernehmen. Nur Fehler, nach denen gefragt wurde; was der Server nicht (mehr) meldet, verliert den Status."""
    asked = {x["fp"] for x in report.get("errors", [])} | set(report.get("known", []))
    got = answer if isinstance(answer, dict) else {}
    n = 0
    for fp in asked:
        e = st.get("items", {}).get(fp)
        if e is None:
            continue
        srv = clean_srv(got.get(fp))
        if srv:
            srv["d"] = today.isoformat()
            e["srv"] = srv
            n += 1
        else:
            e.pop("srv", None)
    return n


def clear_status(st: dict[str, Any]) -> None:
    for e in st.get("items", {}).values():
        e.pop("srv", None)


def fix_info(e: dict[str, Any], version: str) -> dict[str, Any] | None:
    """Was das Fehlerprotokoll zu diesem Fehler anzeigt. upd = in einer neueren Version behoben als der installierten;
    again = trotz Fix in dieser oder einer neueren Version wieder aufgetreten."""
    srv = e.get("srv")
    if not srv:
        return None
    out: dict[str, Any] = {"s": srv["s"], "fx": srv.get("fx", ""), "upd": False, "again": False, "beta_fix": False}
    if srv["s"] == "behoben" and srv.get("fx"):
        fx = vkey(srv["fx"])
        cur_beta = channel_of(version) == "beta"
        out["beta_fix"] = channel_of(srv["fx"]) == "beta"
        out["again"] = any(vkey(v) >= fx for v in e.get("vers") or [])
        newer = vkey(version) < fx
        out["upd"] = newer and (cur_beta or not out["beta_fix"])   # stabile Nutzer warten auf die nächste stabile Version
        out["wait"] = newer and not out["upd"]
    return out


# ------------------------------------------------------------ Build 12: Aufrufkette
_WHERE = re.compile(r"^[\w./-]{1,80}(?::\d{1,6})?(?: [A-Za-z_]\w{0,60})?$")


def clean_chain(raw: Any) -> list[str]:
    """Höchstens 3 Stellen im Format von where_of („gr_ent.py:171 _sync“) – nie Pfade außerhalb von Strom & Wärme."""
    if not isinstance(raw, (list, tuple)):
        return []
    out = [str(x)[:120] for x in raw if isinstance(x, str) and _WHERE.match(x) and not x.startswith("/") and ".." not in x]
    return out[:3]
