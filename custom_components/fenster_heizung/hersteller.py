"""Herstellerprofile für Heizkörperthermostate.

Erkennt anhand der Integration (Plattform) und der Geräteangaben, von welchem Hersteller ein
Thermostat stammt, und liefert die Besonderheiten, die die Regelung beachten muss. Die
Beschreibungstexte für die Oberfläche stehen im Dashboard (panel.js).
"""
from __future__ import annotations

from typing import Any

# Regelverhalten je Profil:
#   off_min:   Das Gerät hat keinen echten Aus-Zustand. „Ausschalten“ bedeutet die kleinste Temperatur des Geräts.
#   auto_resume: Im Automatikbetrieb (Zeitplan) wird nach dem Lüften der Zeitplan wieder aufgenommen,
#              statt die alte Temperatur als manuelle Übersteuerung zu setzen.
PROFILES: dict[str, dict[str, Any]] = {
    "tado": {"off_min": False, "auto_resume": True},
    "hmip": {"off_min": True, "auto_resume": True},
    "fritz": {"off_min": False, "auto_resume": True},
    "shelly": {"off_min": True, "auto_resume": False},
    "aqara": {"off_min": False, "auto_resume": False},
    "danfoss": {"off_min": True, "auto_resume": False},
}

PLATFORMS = {
    "tado": "tado",
    "homematicip_cloud": "hmip",
    "homematicip_local": "hmip",
    "homematic": "hmip",
    "fritzbox": "fritz",
    "shelly": "shelly",
}


def profile_id(platform: str | None, manufacturer: str | None = None, model: str | None = None) -> str | None:
    """Profil-Kennung aus Integration, Hersteller und Modell ableiten."""
    p = (platform or "").lower()
    if p in PLATFORMS:
        return PLATFORMS[p]
    man = (manufacturer or "").lower()
    mod = (model or "").lower()
    if "danfoss" in man or "ally" in mod and "danfoss" in (man + mod):
        return "danfoss"
    if any(x in man for x in ("aqara", "lumi", "xiaomi")) or "srts" in mod:
        return "aqara"
    return None


def lookup(hass: Any, entity_id: str) -> str | None:
    """Profil eines Thermostats über Entity- und Geräteverzeichnis bestimmen."""
    try:
        from homeassistant.helpers import device_registry as dr, entity_registry as er

        ent = er.async_get(hass).async_get(entity_id)
        if ent is None:
            return None
        man = model = None
        if ent.device_id:
            dev = dr.async_get(hass).async_get(ent.device_id)
            if dev is not None:
                man, model = dev.manufacturer, dev.model
        return profile_id(ent.platform, man, model)
    except Exception:  # noqa: BLE001
        return None


def logic(pid: str | None) -> dict[str, Any]:
    return PROFILES.get(pid or "", {"off_min": False, "auto_resume": False})
