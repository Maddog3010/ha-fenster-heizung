"""Messwerk: reine Hilfen ohne Home Assistant (testbar).

- Namen für die Sensoren des Hausflusses (Modul 19): „Akku · Leistung“ statt „Power“.
- Vorschläge für offene Haus-Aufgaben aus den Kacheln von Modul 19 (Batterie, Netz, Solar).
- Solar-Sensoren, die nachts „nicht verfügbar“ melden, sind kein Fehler.
"""
from __future__ import annotations

import re
from typing import Any, Iterator

EID = re.compile(r"^[a-z_]+\.[a-z0-9_]{1,200}$")

# Felder einer Hausfluss-Kachel → Bezeichnung im Messwerk
FLUSS_FIELD = {
    "power": "Leistung",
    "power_to_node": "Leistung zur Kachel",
    "power_to_house": "Leistung zum Haus",
    "top": "Wert oben",
    "bottom": "Wert unten",
    "left": "Wert links",
    "right": "Wert rechts",
    "status": "Status",
    "group": "Gruppe",
    "chips": "Chip",
}

RX_BAT = re.compile(r"batter|akku|speicher|zendure|hyper|powerwall|_bat_|_bat$|^sensor\.bat", re.I)
RX_GRID = re.compile(r"netz|grid|smartmeter|smart_meter|zaehler|zähler|meter_power|bezug", re.I)
RX_PV = re.compile(r"solar|photovolt|wechselrichter|inverter|solarnet|fronius|_pv|pv_|^sensor\.pv|balkon|mppt|dc_power", re.I)

# Sonne so tief, dass Wechselrichter meist schlafen (Grad)
NIGHT_ELEV = 5.0


def fluss_items(cfg: Any) -> Iterator[tuple[str, str, str, str, dict[str, Any]]]:
    """(Pfad, Entität, Name, Zweck, Kachel) für alle Sensoren aktiver Hausfluss-Kacheln."""
    if not isinstance(cfg, dict):
        return
    nodes = cfg.get("nodes") if isinstance(cfg.get("nodes"), dict) else {}
    hub = cfg.get("hub") if isinstance(cfg.get("hub"), dict) else None
    todo: list[tuple[str, dict[str, Any]]] = [(f"nodes.{p}", n) for p, n in nodes.items() if isinstance(n, dict)]
    if hub:
        todo.append(("hub", hub))
    for base, n in todo:
        if n.get("on") is False:
            continue  # ausgeschaltete Kachel: nichts prüfen
        title = str(n.get("name") or ("Haus" if base == "hub" else "Kachel")).strip() or "Kachel"
        for field, lab in FLUSS_FIELD.items():
            v = n.get(field)
            vals = v if isinstance(v, list) else [v]
            for i, eid in enumerate(vals):
                if not (isinstance(eid, str) and EID.match(eid)):
                    continue
                own = str(n.get(f"{field}_label") or "").strip() if field in ("top", "bottom", "left", "right") else ""
                what = own or lab
                path = f"{base}.{field}" + (f"[{i}]" if isinstance(v, list) else "")
                yield path, eid, f"{title} · {what}", f"Kachel „{title}“: {what}", n


def node_kind(n: dict[str, Any], eid: str = "", fname: str = "") -> str:
    """Was eine Kachel zeigt: bat, grid, pv oder ''."""
    img = str(n.get("image") or "")
    txt = f"{n.get('name') or ''} {img} {eid} {fname}"
    flow = n.get("flow")
    if "battery" in img or (flow in ("both", "split") and RX_BAT.search(txt)):
        return "bat"
    if img == "hd:grid" or (flow == "both" and RX_GRID.search(txt)):
        return "grid"
    if img in ("hd:pvRoof", "hd:balcony") or (flow == "supply" and RX_PV.search(txt)):
        return "pv"
    return ""


def suggest(cfg: Any, kind: str, fname=lambda e: "") -> dict[str, Any] | None:
    """Vorschlag aus Modul 19 für eine offene Haus-Aufgabe (bat, grid oder pv)."""
    if not isinstance(cfg, dict):
        return None
    for pos, n in (cfg.get("nodes") or {}).items():
        if not isinstance(n, dict) or n.get("on") is False:
            continue
        if kind == "bat" and n.get("flow") == "split":
            a, b = n.get("power_to_node"), n.get("power_to_house")
            if isinstance(a, str) and EID.match(a) and isinstance(b, str) and EID.match(b) and node_kind(n, a + b, fname(a)) == "bat":
                return {"mode": "two", "bchg": a, "bdis": b, "from": f"Modul 19 · Kachel „{n.get('name') or pos}“"}
            continue
        eid = n.get("power")
        if not (isinstance(eid, str) and EID.match(eid) and eid.startswith("sensor.")):
            continue
        if node_kind(n, eid, fname(eid)) != kind:
            continue
        out: dict[str, Any] = {"eid": eid, "from": f"Modul 19 · Kachel „{n.get('name') or pos}“"}
        # Hausfluss: positiv = in die Kachel (Akku lädt, Einspeisung ins Netz); „umkehren“ dreht das
        if kind == "bat":
            out["bsign"] = "discharge" if n.get("invert") else "charge"
        elif kind == "grid":
            out["sign"] = "import" if n.get("invert") else "export"
        return out
    return None


def bat_open(energy: Any) -> bool:
    """Batterie gilt als offen nur, wenn weder ein Sensor für beide Richtungen noch Laden/Entladen gewählt ist."""
    e = energy if isinstance(energy, dict) else {}
    ent = e.get("ent") if isinstance(e.get("ent"), dict) else {}
    if ent.get("bat"):
        return False
    if e.get("bmode") == "two" or ent.get("bchg") or ent.get("bdis"):
        return False
    return True


def is_night(sun_state: str | None, elevation: Any) -> bool | None:
    """True/False, oder None, wenn sun.sun fehlt."""
    try:
        if elevation is not None:
            return float(elevation) < NIGHT_ELEV
    except (TypeError, ValueError):
        pass
    if sun_state in ("below_horizon", "above_horizon"):
        return sun_state == "below_horizon"
    return None


def pv_like(eid: str, fname: str = "", pv_ents: set[str] | frozenset[str] = frozenset(), node: dict[str, Any] | None = None) -> bool:
    if eid in pv_ents:
        return True
    if node is not None and node_kind(node, eid, fname) == "pv":
        return True
    return bool(RX_PV.search(f"{eid} {fname}"))
