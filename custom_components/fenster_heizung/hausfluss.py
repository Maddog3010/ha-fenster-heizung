"""Modul 19 Hausfluss (Beta, nur für Sponsoren): Kacheln rund um das Haus mit Energiefluss.

Hier liegt nur die Einrichtung (Kacheln, Entitäten, Flussarten, Bilder). Die Werte liest das Dashboard live
aus Home Assistant, es wird nichts geschaltet.
"""
from __future__ import annotations

import re
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .backup import SafeStore
from .const import DOMAIN

POSITIONS = ("top_1", "top_2", "left_1", "left_2", "left_3", "right_1", "right_2", "right_3", "bottom")
FLOWS = ("consume", "supply", "both", "split")
SIDES = ("top", "bottom", "left", "right")
MAX_CHIPS = 4
_ENT = re.compile(r"^(sensor|number|input_number|counter)\.[a-z0-9_]+$")
_COLOR = re.compile(r"^#[0-9a-fA-F]{6}$")
_IMG = re.compile(r"^(svg:[a-z]{2,20}|mdi:[a-z0-9-]{2,60}|/local/[A-Za-z0-9_./-]{1,150}|https://[^\s<>\"']{4,200})$")


def _ent(v: Any) -> str:
    return v if isinstance(v, str) and _ENT.match(v) else ""


def _img(v: Any, default: str) -> str:
    if not isinstance(v, str):
        return default
    v = v.strip()
    if v in ("", "none"):
        return default if v == "" else "none"
    if _IMG.match(v) or (1 <= len(v) <= 8 and not re.search(r"[<>\"'&\x00-\x1f]", v)):
        return v
    return default


def _label(v: Any) -> str:
    return re.sub(r"[<>\"'&]", "", str(v or "").strip())[:24]


def _name(v: Any, default: str) -> str:
    return re.sub(r"[<>\"'&]", "", str(v or "").strip())[:30] or default


def clean_node(raw: Any, hub: bool = False) -> dict[str, Any]:
    r = raw if isinstance(raw, dict) else {}
    out: dict[str, Any] = {
        "on": bool(r.get("on", True)),
        "name": _name(r.get("name"), "Haus" if hub else "Kachel"),
        "image": _img(r.get("image"), "🏠" if hub else "⚡"),
        "color": r.get("color") if isinstance(r.get("color"), str) and _COLOR.match(r["color"]) else "",
    }
    for s in SIDES:
        out[s] = _ent(r.get(s))
        out[s + "_label"] = _label(r.get(s + "_label"))
    if hub:
        out["calc"] = "rest" if r.get("calc") == "rest" else "total"
        out["chips"] = list(dict.fromkeys(e for e in (_ent(x) for x in (r.get("chips") or [])[:8] if isinstance(x, str)) if e))[:MAX_CHIPS]
    else:
        out["flow"] = r.get("flow") if r.get("flow") in FLOWS else "consume"
        out["power"] = _ent(r.get("power"))
        out["power_to_node"] = _ent(r.get("power_to_node"))
        out["power_to_house"] = _ent(r.get("power_to_house"))
        out["invert"] = bool(r.get("invert", False))
    return out


def clean_cfg(raw: Any) -> dict[str, Any]:
    r = raw if isinstance(raw, dict) else {}
    hero = r.get("hero") if isinstance(r.get("hero"), dict) else {}
    nodes_raw = r.get("nodes") if isinstance(r.get("nodes"), dict) else {}
    return {
        "hero": {"show": hero.get("show") is not False},
        "hub": clean_node(r.get("hub"), hub=True),
        "nodes": {p: clean_node(nodes_raw[p]) for p in POSITIONS if isinstance(nodes_raw.get(p), dict)},
    }


class FlussManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_hausfluss")
        self.cfg = clean_cfg({})

    async def async_start(self) -> None:
        d = await self._store.async_load()
        self.cfg = clean_cfg(d)

    def sponsor(self) -> bool:
        sm = self.hass.data.get(DOMAIN, {}).get("sponsor")
        try:
            return bool(sm and sm.snapshot().get("active"))
        except Exception:  # noqa: BLE001 - ohne Sponsor-Prüfung bleibt das Modul zu
            return False

    def snapshot(self) -> dict[str, Any]:
        ok = self.sponsor()
        return {"locked": not ok, "cfg": self.cfg if ok else clean_cfg({})}

    async def async_set(self, raw: Any) -> dict[str, Any]:
        if not self.sponsor():
            return self.snapshot()
        self.cfg = clean_cfg(raw)
        await self._store.async_save(self.cfg)
        return self.snapshot()
