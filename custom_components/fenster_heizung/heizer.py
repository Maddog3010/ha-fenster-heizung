"""Modul 1: Elektroheizer als eigene Geräte (Elektroheizer 2.0, Build 1).

Bis 2026.11.4b58 war der Elektroheizer nur eine Einstellung des Raums (Felder ``htr_*``). Ab jetzt hat jeder
Heizer einen Eintrag in einer eigenen Geräteliste mit fester ID und Namen. So lässt er sich gezielt hinzufügen,
ändern und entfernen, und spätere Builds können ihn in einen anderen Raum stellen oder aus dem Papierkorb holen.

Aufbau (Build 1):
- Die Liste (``heaters``) ist das Verzeichnis der Heizer: ID, Name, Raum, Gerät und eine Kopie der Einstellungen.
- Die Regelung (heater.py, PvManager) liest weiter die ``htr_*``-Felder des Raums. Die Liste schreibt diese Felder
  beim Hinzufügen, Ändern und Entfernen; umgekehrt gleicht ``reconcile`` die Liste beim Laden jedes Raums mit den
  Feldern ab. Dadurch funktionieren alte Wege (Raum-Einstellungen im Dashboard, Wiederherstellen einer Sicherung)
  unverändert weiter, und Liste und Raum können nie auseinanderlaufen.
- Übernahme: Beim ersten Start wird jeder Raum mit eingeschaltetem Heizer zu einem Eintrag der Liste. Räume mit
  ausgeschaltetem Heizer, aber eingetragenem Gerät, landen im Papierkorb (``trash``). Die Raum-Einstellungen selbst
  werden dabei nicht verändert – die Übernahme ist ohne Datenverlust umkehrbar.
- Entfernen: Gerät aus, Thermostate zurück, Felder des Raums zurückgesetzt, Schalter „Elektroheizer aktiv“ aus der
  Entitäten-Registrierung gelöscht. Auf Wunsch wandert die Statistik mit in den Papierkorb (30 Tage).

Oben stehen reine Rechenfunktionen ohne Home-Assistant-Importe (testbar), unten der Manager.
"""
from __future__ import annotations

import logging
import re
import time
from typing import Any

_LOGGER = logging.getLogger(__name__)

VERSION = 1
TRASH_DAYS = 30
TRASH_MAX = 20
MAX_HEATERS = 40
NAME_MAX = 40
_HID = re.compile(r"^h[0-9a-z]{1,12}$")

# API-Feld -> Feld des Raums. "room", "name" und "entity" kommen gesondert.
FIELD_MAP = {
    "entity": "htr_entity",
    "steps": "htr_steps",
    "watt": "htr_watt",
    "target": "htr_target",
    "prio": "htr_prio",
    "from": "htr_from",
    "to": "htr_to",
    "presets": "htr_presets",
    "devtemp": "htr_devtemp",
    "auto": "htr_auto",
    "thermo": "htr_thermo",
}
CFG_KEYS = tuple(FIELD_MAP.values())
# Grundwerte eines Raums ohne Heizer (wie clean_options sie für ein leeres Formular liefert)
EMPTY = {
    "htr_on": "off", "htr_entity": None, "htr_steps": [], "htr_watt": 1500, "htr_target": 22.0, "htr_prio": 5,
    "htr_from": None, "htr_to": None, "htr_presets": [], "htr_devtemp": "max", "htr_auto": "on", "htr_thermo": "off",
}


def empty_state() -> dict[str, Any]:
    return {"v": VERSION, "migrated": False, "heaters": [], "trash": []}


def is_on(opts: dict[str, Any]) -> bool:
    """Hat der Raum einen eingeschalteten Heizer?"""
    return opts.get("htr_on") == "on" and bool(opts.get("htr_entity"))


def cfg_of(opts: dict[str, Any]) -> dict[str, Any]:
    """Heizer-Einstellungen eines Raums (ohne htr_on), als Kopie für die Liste."""
    out = {}
    for k in CFG_KEYS:
        v = opts.get(k, EMPTY[k])
        out[k] = list(v) if isinstance(v, list) else v
    return out


def to_options(inp: dict[str, Any]) -> dict[str, Any]:
    """API-Felder in Felder des Raums übersetzen (nur die übergebenen)."""
    out: dict[str, Any] = {}
    for k, key in FIELD_MAP.items():
        if k not in inp:
            continue
        v = inp[k]
        if k in ("auto",) and isinstance(v, bool):
            v = "on" if v else "off"
        if k == "thermo" and isinstance(v, bool):  # True = Thermostate weiterlaufen lassen
            v = "on" if v else "off"
        out[key] = v
    return out


def clean_name(raw: Any, fallback: str = "Elektroheizer") -> str:
    name = re.sub(r"\s+", " ", str(raw or "")).strip()[:NAME_MAX]
    return name or fallback


def new_id(used: set[str], now: float) -> str:
    n = int(now * 1000)
    while True:
        hid = "h" + _b36(n)[-10:]
        if hid not in used:
            return hid
        n += 1


def _b36(n: int) -> str:
    chars = "0123456789abcdefghijklmnopqrstuvwxyz"
    out = ""
    while n:
        n, r = divmod(n, 36)
        out = chars[r] + out
    return out or "0"


def clean_state(raw: Any) -> dict[str, Any]:
    """Gespeicherten Stand prüfen; kaputte Einträge fallen weg."""
    st = empty_state()
    if not isinstance(raw, dict):
        return st
    st["migrated"] = bool(raw.get("migrated"))
    seen: set[str] = set()
    for lst in ("heaters", "trash"):
        for h in raw.get(lst) or []:
            if not isinstance(h, dict) or not _HID.match(str(h.get("id") or "")) or h["id"] in seen:
                continue
            if not isinstance(h.get("room"), str) or not h["room"]:
                continue
            cfg = h.get("cfg") if isinstance(h.get("cfg"), dict) else {}
            item = {
                "id": h["id"],
                "name": clean_name(h.get("name")),
                "room": h["room"],
                "cfg": cfg_of(cfg),
                "created": float(h.get("created") or 0),
            }
            if lst == "trash":
                item["removed"] = float(h.get("removed") or 0)
                item["reason"] = str(h.get("reason") or "removed")[:20]
                item["room_name"] = str(h.get("room_name") or "")[:60]
                if isinstance(h.get("stats"), dict):
                    item["stats"] = h["stats"]
            seen.add(h["id"])
            st[lst].append(item)
    return st


def expire_trash(st: dict[str, Any], now: float) -> bool:
    """Alte Einträge aus dem Papierkorb löschen; True, wenn sich etwas geändert hat."""
    keep = [t for t in st["trash"] if now - t.get("removed", 0) < TRASH_DAYS * 86400]
    keep = sorted(keep, key=lambda t: t.get("removed", 0), reverse=True)[:TRASH_MAX]
    changed = len(keep) != len(st["trash"])
    st["trash"] = keep
    return changed


def to_trash(st: dict[str, Any], h: dict[str, Any], now: float, reason: str, room_name: str = "", stats: dict | None = None) -> None:
    st["heaters"] = [x for x in st["heaters"] if x["id"] != h["id"]]
    item = {**h, "removed": now, "reason": reason, "room_name": room_name}
    if stats:
        item["stats"] = stats
    st["trash"] = [item] + [t for t in st["trash"] if t["id"] != h["id"]]
    expire_trash(st, now)


def by_room(st: dict[str, Any], room: str) -> dict[str, Any] | None:
    return next((h for h in st["heaters"] if h["room"] == room), None)


def by_id(st: dict[str, Any], hid: str) -> dict[str, Any] | None:
    return next((h for h in st["heaters"] if h["id"] == hid), None)


def sync_room(st: dict[str, Any], room: str, opts: dict[str, Any], now: float, *, migrate: bool = False,
              name_of=None, room_name: str = "") -> str | None:
    """Liste mit den Feldern eines Raums abgleichen.

    Rückgabe: "added", "updated", "trashed", "migrated_off" oder None (nichts geändert).
    name_of(entity) liefert einen lesbaren Namen für neue Einträge.
    """
    h = by_room(st, room)
    if is_on(opts):
        cfg = cfg_of(opts)
        if h is not None:
            if h["cfg"] != cfg:
                h["cfg"] = cfg
                return "updated"
            return None
        # gleiches Gerät im Papierkorb (z. B. im alten Raum-Dialog aus- und wieder eingeschaltet): ID und Name zurück
        old = next((t for t in st["trash"] if t["room"] == room and t["cfg"].get("htr_entity") == cfg["htr_entity"]), None)
        used = {x["id"] for x in st["heaters"]} | {x["id"] for x in st["trash"]}
        if old is not None:
            st["trash"] = [t for t in st["trash"] if t["id"] != old["id"]]
            item = {k: old[k] for k in ("id", "name", "room", "created")}
        else:
            ent = cfg["htr_entity"]
            item = {"id": new_id(used, now), "name": clean_name(name_of(ent) if name_of else None), "room": room, "created": now}
        item["cfg"] = cfg
        st["heaters"].append(item)
        return "added"
    if h is not None:  # Heizer im Raum ausgeschaltet (alter Weg) oder Raum zurückgesetzt
        to_trash(st, h, now, "off", room_name)
        return "trashed"
    if migrate and opts.get("htr_entity"):  # Reste aus der Zeit vor der Liste
        used = {x["id"] for x in st["heaters"]} | {x["id"] for x in st["trash"]}
        cfg = cfg_of(opts)
        item = {"id": new_id(used, now), "name": clean_name(name_of(cfg["htr_entity"]) if name_of else None),
                "room": room, "created": now, "cfg": cfg}
        st["trash"].append({**item, "removed": now, "reason": "migrated", "room_name": room_name})
        return "migrated_off"
    return None


def drop_missing_rooms(st: dict[str, Any], rooms: set[str], now: float) -> list[str]:
    """Heizer, deren Raum gelöscht wurde, in den Papierkorb legen."""
    gone = [h for h in st["heaters"] if h["room"] not in rooms]
    for h in gone:
        to_trash(st, h, now, "room_deleted")
    return [h["id"] for h in gone]


def check_entity(st: dict[str, Any], entity: str, room: str, thermostats_by_room: dict[str, list[str]], skip_id: str | None = None) -> str | None:
    """Fehlermeldung, wenn das Gerät schon anderweitig belegt ist."""
    if not entity:
        return "Schalter oder Gerät des Heizers wählen"
    if entity.split(".")[0] not in ("switch", "climate"):
        return "Nur Schalter (switch) oder Klima-Geräte (climate) sind möglich"
    for h in st["heaters"]:
        if h["id"] != skip_id and h["cfg"].get("htr_entity") == entity:
            return f"{entity} ist schon als Elektroheizer „{h['name']}“ eingerichtet"
    for rid, ths in thermostats_by_room.items():
        if entity in (ths or []):
            return f"{entity} ist Heizungsthermostat eines Raums" if rid != room else "Das Gerät ist Heizungsthermostat dieses Raums"
    return None


def public(h: dict[str, Any]) -> dict[str, Any]:
    """Eintrag für das Dashboard (Felder in API-Namen)."""
    c = h["cfg"]
    out = {"id": h["id"], "name": h["name"], "room": h["room"], "created": h.get("created", 0)}
    for k, key in FIELD_MAP.items():
        v = c.get(key)
        out[k] = list(v) if isinstance(v, list) else v
    for k in ("removed", "reason", "room_name"):
        if k in h:
            out[k] = h[k]
    if "stats" in h:
        out["has_stats"] = True
    return out


# ---------------------------------------------------------------------------------------------------------------
# Manager (Home Assistant)
# ---------------------------------------------------------------------------------------------------------------
class HeizerManager:
    """Geräteliste der Elektroheizer: Übernahme, Abgleich mit den Räumen, Hinzufügen, Ändern, Entfernen."""

    def __init__(self, hass) -> None:
        from .backup import SafeStore  # noqa: PLC0415
        from .const import DOMAIN  # noqa: PLC0415

        self.hass = hass
        self._domain = DOMAIN
        self._store = SafeStore(hass, 1, f"{DOMAIN}_heizer")
        self.st = empty_state()

    # ---- Start, Speichern
    async def async_start(self) -> None:
        self.st = clean_state(await self._store.async_load())
        now = time.time()
        changed = expire_trash(self.st, now)
        migrate = not self.st["migrated"]
        rooms = {e.entry_id: e for e in self._entries()}
        for e in rooms.values():
            res = sync_room(self.st, e.entry_id, self._opts(e), now, migrate=migrate, name_of=self._ent_name, room_name=e.title)
            changed = changed or res is not None
            if res == "trashed":
                self._drop_switch(e.entry_id)
        if drop_missing_rooms(self.st, set(rooms), now):
            changed = True
        if migrate:
            self.st["migrated"] = True
            changed = True
            n, t = len(self.st["heaters"]), len(self.st["trash"])
            if n or t:
                _LOGGER.info("Elektroheizer in die Geräteliste übernommen: %s aktiv, %s im Papierkorb", n, t)
        if changed:
            self._save()

    def async_stop(self) -> None:
        return None

    def _save(self) -> None:
        self._store.async_delay_save(lambda: self.st, 0)

    def _entries(self) -> list:
        return list(self.hass.config_entries.async_entries(self._domain))

    @staticmethod
    def _opts(entry) -> dict[str, Any]:
        return {**entry.data, **entry.options}

    def _ent_name(self, eid: str | None) -> str:
        st = self.hass.states.get(eid) if eid else None
        name = st.attributes.get("friendly_name") if st is not None else None
        return name or (eid.split(".", 1)[1].replace("_", " ").title() if eid else "Elektroheizer")

    def _entry(self, room: str):
        e = self.hass.config_entries.async_get_entry(room)
        return e if e is not None and e.domain == self._domain else None

    def _ctrl(self, room: str):
        from homeassistant.config_entries import ConfigEntryState  # noqa: PLC0415

        e = self._entry(room)
        if e is None or e.state is not ConfigEntryState.LOADED:
            return None
        return getattr(e, "runtime_data", None)

    def _drop_switch(self, room: str) -> None:
        """Schalter „Elektroheizer aktiv“ des Raums aus der Registrierung löschen (bleibt sonst als Leiche stehen)."""
        try:
            from homeassistant.helpers import entity_registry as er  # noqa: PLC0415

            reg = er.async_get(self.hass)
            eid = reg.async_get_entity_id("switch", self._domain, f"{room}_heater_enabled")
            if eid:
                reg.async_remove(eid)
        except Exception:  # noqa: BLE001 - Aufräumen darf das Entfernen nie verhindern
            _LOGGER.warning("Schalter des Elektroheizers in %s nicht entfernt", room, exc_info=True)

    # ---- Abgleich beim Laden eines Raums
    async def async_sync_room(self, entry) -> None:
        now = time.time()
        res = sync_room(self.st, entry.entry_id, self._opts(entry), now, name_of=self._ent_name, room_name=entry.title)
        if res == "trashed":
            self._drop_switch(entry.entry_id)
        if res is not None:
            self._save()

    # ---- Lesen
    def snapshot(self) -> dict[str, Any]:
        now = time.time()
        if expire_trash(self.st, now) | bool(drop_missing_rooms(self.st, {e.entry_id for e in self._entries()}, now)):
            self._save()
        heaters = []
        for h in sorted(self.st["heaters"], key=lambda x: (x["cfg"].get("htr_prio") or 5, x["name"].lower())):
            item = public(h)
            e = self._entry(h["room"])
            item["room_name"] = e.title if e else ""
            ctrl = self._ctrl(h["room"])
            item["live"] = ctrl.heater.attrs() if ctrl is not None else None
            item["manual_on"] = ctrl.heater.manual_on if ctrl is not None else True
            heaters.append(item)
        return {"heaters": heaters, "trash": [public(t) for t in self.st["trash"]]}

    # ---- Schreiben
    def _thermostats(self) -> dict[str, list[str]]:
        from .const import CONF_THERMOSTATS  # noqa: PLC0415

        return {e.entry_id: list(self._opts(e).get(CONF_THERMOSTATS) or []) for e in self._entries()}

    def _write_room(self, entry, fields: dict[str, Any]) -> None:
        """Felder des Raums setzen; prüft wie der Raum-Dialog und lädt den Raum über den Update-Listener neu."""
        from .api import _current_options  # noqa: PLC0415
        from .options import clean_options  # noqa: PLC0415

        cur = _current_options(entry)
        cleaned = clean_options({**cur, **fields})  # ValueError mit lesbarer Meldung
        self.hass.config_entries.async_update_entry(entry, options=cleaned)

    async def async_add(self, inp: dict[str, Any]) -> dict[str, Any]:
        room = str(inp.get("room") or "")
        entry = self._entry(room)
        if entry is None:
            raise ValueError("Raum nicht gefunden")
        if by_room(self.st, room) is not None or is_on(self._opts(entry)):
            raise ValueError(f"In „{entry.title}“ ist schon ein Elektroheizer eingerichtet")
        if len(self.st["heaters"]) >= MAX_HEATERS:
            raise ValueError("Zu viele Elektroheizer")
        entity = str(inp.get("entity") or "")
        err = check_entity(self.st, entity, room, self._thermostats())
        if err:
            raise ValueError(err)
        fields = {**EMPTY, **to_options(inp), "htr_on": "on", "htr_entity": entity}
        self._check(entry, fields)
        now = time.time()
        used = {x["id"] for x in self.st["heaters"]} | {x["id"] for x in self.st["trash"]}
        h = {"id": new_id(used, now), "name": clean_name(inp.get("name"), self._ent_name(entity)), "room": room,
             "created": now, "cfg": cfg_of(fields)}
        ctrl = self._ctrl(room)
        if ctrl is not None:  # Statistik gehört zum neuen Gerät
            ctrl.heater.reset_stats()
            await ctrl._save()
        self.st["heaters"].append(h)
        self.st["trash"] = [t for t in self.st["trash"] if not (t["room"] == room and t["cfg"].get("htr_entity") == entity)]
        self._save()
        self._write_room(entry, fields)
        return public(h)

    async def async_update(self, hid: str, inp: dict[str, Any]) -> dict[str, Any]:
        h = by_id(self.st, hid)
        if h is None:
            raise ValueError("Elektroheizer nicht gefunden")
        if "room" in inp and inp["room"] != h["room"]:
            raise ValueError("Raum wechseln kommt mit Build 3")
        entry = self._entry(h["room"])
        if entry is None:
            raise ValueError("Raum nicht gefunden")
        fields = to_options(inp)
        if "htr_entity" in fields:
            err = check_entity(self.st, str(fields["htr_entity"] or ""), h["room"], self._thermostats(), skip_id=hid)
            if err:
                raise ValueError(err)
        if "name" in inp:
            h["name"] = clean_name(inp["name"], h["name"])
        if fields:
            new = {**h["cfg"], **fields, "htr_on": "on"}
            self._check(entry, new)
            h["cfg"] = cfg_of(new)
            self._save()
            if self._opts(entry).get("htr_on") != "on" or cfg_of(self._opts(entry)) != h["cfg"]:
                self._write_room(entry, new)
        else:
            self._save()
        return public(h)

    async def async_remove(self, hid: str, keep_stats: bool = True) -> dict[str, Any]:
        h = by_id(self.st, hid)
        if h is None:
            raise ValueError("Elektroheizer nicht gefunden")
        entry = self._entry(h["room"])
        ctrl = self._ctrl(h["room"])
        stats = None
        if ctrl is not None:
            await ctrl.heater.release()  # Gerät aus, Solltemperatur zurück, Thermostate wieder an
            if keep_stats:
                stats = ctrl.heater.stats_data()
            ctrl.heater.reset_stats()
            await ctrl._save()
            ctrl._signal()
        to_trash(self.st, h, time.time(), "removed", entry.title if entry else "", stats)
        self._save()
        self._drop_switch(h["room"])
        if entry is not None and self._opts(entry).get("htr_entity"):
            self._write_room(entry, dict(EMPTY))  # Felder zurücksetzen; der Raum lädt neu, ohne Schalter
        return {"removed": hid, "kept_stats": bool(stats)}

    def _check(self, entry, fields: dict[str, Any]) -> None:
        """Felder vorab prüfen, ohne zu speichern (gleiche Regeln wie der Raum-Dialog)."""
        from .api import _current_options  # noqa: PLC0415
        from .options import clean_options  # noqa: PLC0415

        clean_options({**_current_options(entry), **fields})
