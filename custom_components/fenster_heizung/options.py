"""Prüfung der Raumeinstellungen aus dem Dashboard (ohne Home-Assistant-Importe)."""
from __future__ import annotations

import re
from typing import Any

from .const import (
    ACTION_OFF,
    ACTION_SETBACK,
    CONF_ACTION,
    CONF_AIR_HINT,
    CONF_BLOCK_FROM,
    CONF_BLOCK_TO,
    CONF_CLOSE_DELAY,
    CONF_COP,
    CONF_DESIGN_TEMP,
    CONF_ENERGY_PER_UNIT,
    CONF_FUEL,
    CONF_HEAT_LOAD,
    CONF_HEAT_POWER,
    CONF_HEATING_ENTITY,
    CONF_HEATING_OFF_STATES,
    CONF_HUMIDITY,
    CONF_WEATHER_ADJ,
    CONF_NOTIFY_AFTER,
    CONF_NOTIFY_MESSAGE,
    CONF_NOTIFY_SERVICE,
    CONF_NOTIFY_TITLE,
    CONF_OPEN_DELAY,
    CONF_OUTDOOR_MAX,
    CONF_OUTDOOR_SENSOR,
    CONF_ROOM_AREA,
    CONF_SETBACK_TEMP,
    CONF_THERMOSTATS,
    CONF_WINDOWS,
    DEFAULT_COP,
    DEFAULT_DESIGN_TEMP,
    DEFAULT_FUEL,
    DEFAULT_HEAT_LOAD,
    DEFAULT_HEAT_POWER,
    DEFAULT_HEATING_OFF_STATES,
    DEFAULT_NOTIFY_AFTER,
    DEFAULT_NOTIFY_MESSAGE,
    DEFAULT_OUTDOOR_MAX,
    DEFAULT_OPEN_DELAY,
    DEFAULT_CLOSE_DELAY,
    DEFAULT_SETBACK_TEMP,
    FUELS,
)

_ENTITY = re.compile(r"^[a-z0-9_]+\.[a-z0-9_]+$")
_NOTIFY = re.compile(r"^notify\.[a-z0-9_]+$")
_TIME = re.compile(r"^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$")
_HEATING_DOMAINS = ("climate", "binary_sensor", "sensor", "switch", "input_boolean", "input_select", "select")

# Schlüssel -> (Minimum, Maximum, Standard, ganzzahlig)
_NUMBERS: dict[str, tuple[float, float, float, bool]] = {
    CONF_OPEN_DELAY: (0, 3600, DEFAULT_OPEN_DELAY, True),
    CONF_CLOSE_DELAY: (0, 3600, DEFAULT_CLOSE_DELAY, True),
    CONF_SETBACK_TEMP: (5, 25, DEFAULT_SETBACK_TEMP, False),
    CONF_OUTDOOR_MAX: (-20, 40, DEFAULT_OUTDOOR_MAX, False),
    CONF_NOTIFY_AFTER: (0, 240, DEFAULT_NOTIFY_AFTER, True),
    CONF_HEAT_POWER: (0.1, 30, DEFAULT_HEAT_POWER, False),
    CONF_ROOM_AREA: (0, 300, 0, False),
    CONF_HEAT_LOAD: (10, 250, DEFAULT_HEAT_LOAD, False),
    CONF_DESIGN_TEMP: (-30, 5, DEFAULT_DESIGN_TEMP, False),
    CONF_COP: (1, 8, DEFAULT_COP, False),
}

LABELS = {
    CONF_WINDOWS: "Fenstersensoren",
    CONF_THERMOSTATS: "Heizungsthermostate",
    CONF_OPEN_DELAY: "Verzögerung nach Öffnen",
    CONF_CLOSE_DELAY: "Verzögerung nach Schließen",
    CONF_SETBACK_TEMP: "Absenktemperatur",
    CONF_OUTDOOR_MAX: "Außentemperatur-Grenze",
    CONF_NOTIFY_AFTER: "Erinnerung nach Minuten",
    CONF_HEAT_POWER: "Feste Heizleistung",
    CONF_ROOM_AREA: "Raumfläche",
    CONF_HEAT_LOAD: "Heizlast",
    CONF_DESIGN_TEMP: "Auslegungstemperatur",
    CONF_COP: "JAZ / COP",
    CONF_ENERGY_PER_UNIT: "Energie pro Einheit",
}


def _num(raw: dict, key: str) -> float | int:
    lo, hi, default, whole = _NUMBERS[key]
    val = raw.get(key)
    if val is None or val == "":
        return int(default) if whole else float(default)
    try:
        val = float(val)
    except (TypeError, ValueError):
        raise ValueError(f"{LABELS[key]}: keine Zahl") from None
    if not lo <= val <= hi:
        raise ValueError(f"{LABELS[key]}: erlaubt sind {lo:g} bis {hi:g}")
    return int(round(val)) if whole else round(val, 2)


def _entity_list(raw: dict, key: str, domain: str) -> list[str]:
    vals = raw.get(key)
    if not isinstance(vals, list):
        vals = []
    out: list[str] = []
    for v in vals:
        if not isinstance(v, str) or not _ENTITY.match(v) or not v.startswith(domain + "."):
            raise ValueError(f"{LABELS[key]}: ungültige Entität „{str(v)[:40]}“")
        if v not in out:
            out.append(v)
    if not out:
        raise ValueError(f"{LABELS[key]}: mindestens eine Entität wählen")
    return out[:20]


def _opt_entity(raw: dict, key: str, domains: tuple[str, ...]) -> str | None:
    val = raw.get(key)
    if val in (None, ""):
        return None
    if not isinstance(val, str) or not _ENTITY.match(val) or val.split(".")[0] not in domains:
        raise ValueError(f"Ungültige Entität „{str(val)[:40]}“")
    return val


def _time(raw: dict, key: str) -> str | None:
    val = raw.get(key)
    if val in (None, ""):
        return None
    m = _TIME.match(str(val).strip())
    if not m:
        raise ValueError("Sperrzeit: Uhrzeit wie 22:00 angeben")
    return f"{int(m.group(1)):02d}:{m.group(2)}:{m.group(3) or '00'}"


def clean_options(raw: Any) -> dict[str, Any]:
    """Raumeinstellungen prüfen und in das Format des Optionsdialogs bringen."""
    if not isinstance(raw, dict):
        raise ValueError("Ungültige Einstellungen")
    out: dict[str, Any] = {
        CONF_WINDOWS: _entity_list(raw, CONF_WINDOWS, "binary_sensor"),
        CONF_THERMOSTATS: _entity_list(raw, CONF_THERMOSTATS, "climate"),
    }
    for key in (CONF_OPEN_DELAY, CONF_CLOSE_DELAY, CONF_SETBACK_TEMP, CONF_OUTDOOR_MAX,
                CONF_NOTIFY_AFTER, CONF_HEAT_POWER, CONF_ROOM_AREA, CONF_HEAT_LOAD,
                CONF_DESIGN_TEMP, CONF_COP):
        out[key] = _num(raw, key)
    action = raw.get(CONF_ACTION) or ACTION_OFF
    if action not in (ACTION_OFF, ACTION_SETBACK):
        raise ValueError("Ungültige Aktion")
    out[CONF_ACTION] = action
    out[CONF_HEATING_ENTITY] = _opt_entity(raw, CONF_HEATING_ENTITY, _HEATING_DOMAINS)
    states = str(raw.get(CONF_HEATING_OFF_STATES) or "").strip()[:200]
    out[CONF_HEATING_OFF_STATES] = states or DEFAULT_HEATING_OFF_STATES
    out[CONF_OUTDOOR_SENSOR] = _opt_entity(raw, CONF_OUTDOOR_SENSOR, ("sensor",))
    out[CONF_HUMIDITY] = _opt_entity(raw, CONF_HUMIDITY, ("sensor",))
    for key in (CONF_AIR_HINT, CONF_WEATHER_ADJ):
        out[key] = "off" if raw.get(key) == "off" else "on"
    out[CONF_BLOCK_FROM] = _time(raw, CONF_BLOCK_FROM)
    out[CONF_BLOCK_TO] = _time(raw, CONF_BLOCK_TO)
    if bool(out[CONF_BLOCK_FROM]) != bool(out[CONF_BLOCK_TO]):
        raise ValueError("Sperrzeit: Beginn und Ende angeben (oder beides leer lassen)")
    services = raw.get(CONF_NOTIFY_SERVICE) or []
    if not isinstance(services, list):
        raise ValueError("Benachrichtigungs-Aktionen: ungültig")
    clean_services: list[str] = []
    for s in services:
        if not isinstance(s, str) or not _NOTIFY.match(s):
            raise ValueError(f"Benachrichtigung „{str(s)[:40]}“ ist ungültig (notify.name)")
        if s not in clean_services:
            clean_services.append(s)
    out[CONF_NOTIFY_SERVICE] = clean_services or None
    title = str(raw.get(CONF_NOTIFY_TITLE) or "").strip()[:100]
    out[CONF_NOTIFY_TITLE] = title or None
    out[CONF_NOTIFY_MESSAGE] = str(raw.get(CONF_NOTIFY_MESSAGE) or "").strip()[:500] or DEFAULT_NOTIFY_MESSAGE
    fuel = raw.get(CONF_FUEL) or DEFAULT_FUEL
    if fuel not in FUELS:
        raise ValueError("Ungültiger Brennstoff")
    out[CONF_FUEL] = fuel
    epu = raw.get(CONF_ENERGY_PER_UNIT)
    if epu in (None, "", 0, "0"):
        out[CONF_ENERGY_PER_UNIT] = None
    else:
        try:
            epu = float(epu)
        except (TypeError, ValueError):
            raise ValueError(f"{LABELS[CONF_ENERGY_PER_UNIT]}: keine Zahl") from None
        if not 0 < epu <= 40:
            raise ValueError(f"{LABELS[CONF_ENERGY_PER_UNIT]}: erlaubt sind 0 bis 40")
        out[CONF_ENERGY_PER_UNIT] = round(epu, 2)
    return out
