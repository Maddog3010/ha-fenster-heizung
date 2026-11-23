"""Fehler-Statistik Build 1: Programmfehler von Strom & Wärme lokal sammeln (Fehlerprotokoll in Einstellungen → System).

Quellen:
- Backend: Meldungen ab „Fehler“ aus dem Logger von Strom & Wärme und jede Ausnahme, deren Stapel durch Code von
  Strom & Wärme läuft (auch wenn Home Assistant sie protokolliert, z. B. „Error handling message“).
- Befehle und Oberfläche: meldet das Dashboard über fenster_heizung/err_report (Schema-Fehler wie „expected str at 'id'“,
  unbekannte Befehle, Anzeigefehler).
Nur Programmfehler – keine Geräte-Diagnose. Alles wird bereinigt (fehler_logic.sanitize) und bleibt in Build 1 lokal.
"""
from __future__ import annotations

import logging
import threading
import time
import traceback
from typing import Any

from homeassistant.const import __version__ as HA_VERSION
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from . import fehler_logic as L
from .const import DOMAIN

_PKG = "custom_components.fenster_heizung"
REPORT_LIMIT = 30          # Meldungen aus der Oberfläche je Stunde
_SELF = "fehler.py"


def _our_frame(tb) -> tuple[str, int, str] | None:
    """Innerste Stelle im Stapel, die zu Strom & Wärme gehört."""
    best = None
    for fr in traceback.extract_tb(tb):
        p = fr.filename.replace("\\", "/")
        if "/fenster_heizung/" in p and not p.endswith("/" + _SELF):
            best = (p, fr.lineno or 0, fr.name)
    return best


class _Handler(logging.Handler):
    def __init__(self, owner: "FehlerSammler") -> None:
        super().__init__(level=logging.WARNING)
        self.owner = owner

    def emit(self, record: logging.LogRecord) -> None:   # läuft auch in Hilfs-Threads
        try:
            if getattr(record, "_fh_err", False):
                return
            ours = record.name.startswith(_PKG)
            exc = record.exc_info[1] if record.exc_info and record.exc_info[1] is not None else None
            fr = _our_frame(record.exc_info[2]) if exc is not None else None
            if exc is None and not (ours and record.levelno >= logging.ERROR):
                return                                   # Warnungen ohne Ausnahme sind keine Programmfehler
            if exc is not None and not ours and fr is None:
                return                                   # Ausnahme ohne Bezug zu Strom & Wärme
            if fr is None and ours:
                fr = (record.pathname, record.lineno, record.funcName)
            if fr and fr[0].replace("\\", "/").endswith("/" + _SELF):
                return
            where = L.where_of(fr[0], fr[1], fr[2]) if fr else ""
            kind = type(exc).__name__ if exc is not None else ("Fehler" if record.levelno >= logging.ERROR else "Warnung")
            msg = str(exc) if exc is not None else record.getMessage()
            self.owner.record_threadsafe("backend", kind, where, msg)
        except Exception:  # noqa: BLE001 - der Sammler darf nie selbst stören
            pass


class FehlerSammler:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store = Store(hass, 1, f"{DOMAIN}_fehler")
        self._st: dict[str, Any] = L.empty()
        self._lock = threading.Lock()
        self._handler: _Handler | None = None
        self._version = ""
        self._rep: list[float] = []

    async def async_start(self) -> None:
        try:
            self._st = L.clean(await self._store.async_load())
        except Exception:  # noqa: BLE001
            self._st = L.empty()
        try:
            from .api import _version
            self._version = await _version(self.hass)
        except Exception:  # noqa: BLE001
            self._version = ""
        L.prune(self._st, dt_util.now().date())
        self._handler = _Handler(self)
        logging.getLogger().addHandler(self._handler)

    @callback
    def async_stop(self) -> None:
        if self._handler is not None:
            logging.getLogger().removeHandler(self._handler)
            self._handler = None
        self._store.async_delay_save(lambda: self._st, 0)

    # ---- Eintragen
    def record_threadsafe(self, src: str, kind: str, where: str, msg: str, cmd: str = "", dev: str = "") -> None:
        with self._lock:
            L.add(self._st, src=src, kind=kind, where=where, msg=msg, today=dt_util.now().date(), version=self._version,
                  ha=HA_VERSION, cmd=cmd, dev=dev)
        try:
            self.hass.loop.call_soon_threadsafe(self._save)
        except RuntimeError:
            pass

    @callback
    def _save(self) -> None:
        self._store.async_delay_save(lambda: self._st, 10)

    def report(self, src: str, kind: str, where: str, msg: str, cmd: str = "", dev: str = "") -> bool:
        """Meldung aus der Oberfläche (Befehl oder Anzeige). Begrenzt, damit ein Fehler in einer Schleife nichts flutet."""
        now = time.monotonic()
        self._rep = [t for t in self._rep if now - t < 3600]
        if len(self._rep) >= REPORT_LIMIT or src not in ("befehl", "oberflaeche"):
            return False
        self._rep.append(now)
        self.record_threadsafe(src, kind, where, msg, cmd=cmd, dev=dev)
        return True

    # ---- Ansehen
    def snapshot(self) -> dict[str, Any]:
        with self._lock:
            items = [dict(e, text=L.as_text(e)) for e in L.view(self._st)]
        return {"items": items, "version": self._version, "ha": HA_VERSION, "keep_days": L.KEEP_DAYS}

    async def async_clear(self, fp: str = "") -> dict[str, Any]:
        with self._lock:
            if fp:
                self._st["items"].pop(fp, None)
            else:
                self._st = L.empty()
        await self._store.async_save(self._st)
        return self.snapshot()
