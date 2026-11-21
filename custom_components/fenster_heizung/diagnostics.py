"""Diagnosedaten für Home Assistant (Einstellungen → Geräte & Dienste → Strom & Wärme → Diagnose herunterladen).

Modul 8 (Build 10): Zustand, Einstellungen und letzte Entscheidungen der Wallbox – ohne Adresse der Wallbox,
Kartennamen, Personen, Kalender und Benachrichtigungsdienste.
Modul 14 (v0.9): Quelle, Einstellungen, Umfang der Zeitreihe und Historie, Prüfung der Daten – ohne Benachrichtigungsdienste.
"""
from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN

REDACT = "**entfernt**"


def wallbox_diag(wbm: Any) -> dict[str, Any]:
    """Modul 8 für die Diagnose. Läuft auch ohne Home Assistant (Tests)."""
    if wbm is None:
        return {"eingerichtet": False}
    cfg = dict(wbm.cfg)
    cfg["ip"] = REDACT if cfg.get("ip") else ""
    cfg["notify"] = {**cfg.get("notify", {}), "to": [REDACT for _ in (cfg.get("notify") or {}).get("to", [])]}
    cfg["pdf"] = {**cfg.get("pdf", {}), "name": REDACT if (cfg.get("pdf") or {}).get("name") else ""}
    cfg["vehicles"] = [{**v, "person": REDACT if v.get("person") else "", "dep": {**(v.get("dep") or {}), "cal": REDACT if (v.get("dep") or {}).get("cal") else ""}}
                       for v in cfg.get("vehicles", [])]
    info = {k: v for k, v in (wbm.info or {}).items() if k not in ("cards", "fna", "sse")}
    st = getattr(wbm, "_st", {}) or {}
    return {
        "eingerichtet": True,
        "erreichbar": wbm.ok, "fehler": wbm.err, "zustand": info, "wunsch": {k: v for k, v in (wbm.want or {}).items() if k != "who"},
        "fahrzeug": (wbm.who or {}).get("kind"), "befehle": {k: wbm._cmd.get(k) for k in ("ok", "fail", "last")},
        "ladestand_geschaetzt": wbm.soc_est, "datenpruefung": wbm.check,
        "einstellungen": cfg,
        "statistik": {"ladungen": len(st.get("sessions") or []), "tage": len(st.get("days") or {}), "laufende_ladung": bool(st.get("open"))},
        "entscheidungen": list(wbm.log)[:50],
    }


def tarif_diag(tm: Any) -> dict[str, Any]:
    """Modul 14 für die Diagnose (ohne Preise im Einzelnen, ohne Meldedienste)."""
    if tm is None:
        return {"eingerichtet": False}
    cfg = dict(tm.cfg)
    cfg["alarm"] = {**cfg.get("alarm", {}), "to": [REDACT for _ in (cfg.get("alarm") or {}).get("to", [])]}
    ser = tm.series or []
    try:
        dc = tm.datacheck()
    except Exception as err:  # noqa: BLE001 - die Diagnose darf nie scheitern
        dc = [{"fehler": str(err)}]
    return {"eingerichtet": True, "quelle": tm.src, "quelle_name": tm.src_name, "boerse": tm.boerse, "hinweis": tm.note, "einstellungen": cfg,
            "zeitreihe": {"werte": len(ser), "aufloesung_s": ser[0]["d"] if ser else 0, "von": ser[0]["s"] if ser else None, "bis": (ser[-1]["s"] + ser[-1]["d"]) if ser else None},
            "historie_tage": len(tm.hist), "historie_ab": min(tm.hist) if tm.hist else None, "datenpruefung": dc, "meldungen": len(tm.alog)}


async def async_get_config_entry_diagnostics(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, Any]:
    data = hass.data.get(DOMAIN, {})
    return {"version": entry.version, "modul_8": wallbox_diag(data.get("wallbox")), "modul_14": tarif_diag(data.get("tarif"))}
