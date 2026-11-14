"""Preisdienst: eine Stelle, die allen Modulen den Preis einer Sparte nennt.

Reihenfolge der Quellen (Konzept Modul 20, Teil F):
  1. ein angemeldeter Preis-Anbieter (Addon Modul 20 Abrechnungen, hass.data[DOMAIN]["preis_anbieter"]) – der Vertragspreis des Tages
  2. Strom: Tibber, wenn verbunden (Börsenpreis der Stunde)
  3. Einstellungen -> Haus-Werte (Strompreis fest oder aus einem Sensor, Einspeisevergütung)
Ohne Anbieter rechnet alles wie bisher. Der Dienst hat keine eigene Abrechnungs-Logik.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .const import DOMAIN

SPARTEN = ("strom", "gas", "wasser", "einspeisung")


def _num(hass: HomeAssistant, eid: str) -> float | None:
    st = hass.states.get(eid) if eid else None
    if st is None:
        return None
    try:
        v = float(str(st.state).replace(",", "."))
    except ValueError:
        return None
    unit = str(st.attributes.get("unit_of_measurement") or "").lower()
    return v * 100 if ("eur" in unit or "€" in unit) and "ct" not in unit and "cent" not in unit else v  # €/kWh -> ct/kWh


def tibber_ct(hass: HomeAssistant, when: datetime) -> float | None:
    tb = hass.data.get(DOMAIN, {}).get("tibber")
    try:
        return tb.current_ct(when) if tb is not None and tb.connected else None
    except Exception:  # noqa: BLE001 - der Preisdienst darf nie stören
        return None


def preis(hass: HomeAssistant, sparte: str = "strom", when: datetime | None = None, mit_grundpreis: bool = False) -> dict[str, Any] | None:
    """Preis der Sparte zum Zeitpunkt: {"ct": Cent je Einheit (brutto), "unit": "kWh" | "m³", "src": "modul20" | "tibber" | "haus", "name": …}.
    None, wenn keine Quelle einen Preis kennt (z. B. Gas ohne Vertrag)."""
    if sparte not in SPARTEN:
        return None
    when = when or dt_util.now()
    store = hass.data.get(DOMAIN, {})
    anb = store.get("preis_anbieter")
    if anb is not None:
        try:
            r = anb.preis(sparte, when, mit_grundpreis)
        except Exception:  # noqa: BLE001
            r = None
        if r and r.get("ct") is not None:
            return {**r, "src": "modul20"}
    haus = store.get("haus")
    hp = (getattr(haus, "data", None) or {}).get("price") or {}
    if sparte == "strom":
        ct = tibber_ct(hass, when)
        if ct is not None:
            return {"ct": round(ct, 4), "unit": "kWh", "src": "tibber", "name": "Tibber", "dyn": True}
        ct = _num(hass, hp.get("price_sensor", "")) if hp.get("price_mode") == "entity" else None
        if ct is None and hp.get("price") is not None:
            ct = float(hp["price"])
        return None if ct is None else {"ct": round(ct, 4), "unit": "kWh", "src": "haus", "name": "Haus-Werte", "dyn": hp.get("price_mode") == "entity"}
    if sparte == "einspeisung":
        ct = _num(hass, hp.get("feed_sensor", "")) if hp.get("feed_mode") == "entity" else None
        if ct is None and hp.get("feed") is not None:
            ct = float(hp["feed"])
        return None if ct is None else {"ct": round(ct, 4), "unit": "kWh", "src": "haus", "name": "Haus-Werte", "dyn": False}
    return None


def alle(hass: HomeAssistant) -> dict[str, Any]:
    """Alle Sparten für die Oberfläche (Haus-Werte zeigen „verwaltet in Modul 20“)."""
    return {s: preis(hass, s) for s in SPARTEN}
