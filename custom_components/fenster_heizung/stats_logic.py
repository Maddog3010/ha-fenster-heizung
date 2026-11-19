"""Reine Rechenfunktionen der Versions-Statistik (ohne Home Assistant, damit sie sich testen lassen)."""
from __future__ import annotations

import re
from typing import Any

SCHEMA = 2
# Module, deren Ein/Aus-Zustand gemeldet wird (Kurzzeichen wie in der Oberfläche). Eigene Erweiterungen (x…) nie.
MODULE_KEYS = ("ww", "en", "gs", "lu", "rb", "wp", "ev", "wx", "ga", "sf", "pl", "bt", "dt", "wa", "sp", "ef")
INTERVAL = 23 * 3600      # frühestens nach 23 Stunden wieder melden (Fehlversuche zählen mit)
_VER_RE = re.compile(r"^\d{4}\.\d{1,2}\.\d{1,2}(\.\d{1,2})?(b\d{1,3})?$")
_ID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")


def channel_of(version: str) -> str:
    """„beta“ für Testversionen (2026.11.4b25), sonst „stable“."""
    return "beta" if re.search(r"b\d+$", version or "") else "stable"


def active_modules(on: Any) -> list[str]:
    """Kurzzeichen der eingeschalteten Module in fester Reihenfolge; nur bekannte Schlüssel, nur echtes True."""
    on = on if isinstance(on, dict) else {}
    return [k for k in MODULE_KEYS if on.get(k) is True]


def build_payload(inst_id: str, version: str, modules: Any = None) -> dict[str, Any] | None:
    """Die komplette Meldung – oder None, wenn Kennung oder Version nicht gültig sind (dann wird nichts gesendet)."""
    if not _ID_RE.match(inst_id or "") or not _VER_RE.match(version or ""):
        return None
    mods = [k for k in MODULE_KEYS if isinstance(modules, (list, tuple, set)) and k in modules]
    return {"schema": SCHEMA, "id": inst_id, "version": version, "channel": channel_of(version), "modules": mods}


def next_due(last_ok: float, last_try: float) -> float:
    """Zeitpunkt der nächsten Meldung (Unix-Zeit). 0 = sofort."""
    last = max(float(last_ok or 0), float(last_try or 0))
    return last + INTERVAL if last else 0.0


def is_due(now: float, last_ok: float, last_try: float) -> bool:
    return now >= next_due(last_ok, last_try)
