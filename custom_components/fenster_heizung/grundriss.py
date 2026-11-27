"""Modul 0 · Haus & Grundriss (Build 1): der gemeinsame Bauplan aller Module.

Bis 2026.11.4b52 lag der Grundriss im Speicher von Modul 11 (fenster_heizung_sicherheit_plan). Ab Modul 0 Build 1 gehört er dem Kern:
Speicher fenster_heizung_grundriss, Schema 1. Modul 11 liest und schreibt seinen Plan ab jetzt hier (sein eigener Plan-Speicher bleibt als
zusätzliche Kopie). Modul 1 (Wärmekarte) und Modul 18 (Lichtkarte) lesen über gr_get. (Nicht zu verwechseln mit haus.py, den Haus-Werten aus den Einstellungen.)

Build 2: Raumliste – Plan-Raum → Bereich in Home Assistant (rooms, „-“ = bewusst kein Bereich). Ersetzt die Zuordnung pmap aus Modul 18
(wird einmalig übernommen). Die Spalte „Raum in Modul 1“ bleibt im Layout (gmap) und wird aus Modul 0 bearbeitet.

Umzug: Beim ersten Start übernimmt Modul 0 den Plan aus Modul 11 (mit Meldern und Lampen als Ebenen-Elemente „m“ und „l“) und legt eine
Umzugs-Kopie an, die 90 Tage aufgehoben wird.

Build 3: Der Baukasten zieht nach Modul 0 und speichert über gr_set (plan). Modul 11 hört über listen() mit und zieht seine Kopie nach.

v0.13 (Stufe 1 Technik): Schema 2 mit Umstellung beim Start (B1), Plan-Prüfung vor dem Speichern (B2: kaputte Pläne werden abgelehnt, doppelte
oder ungültige Element-IDs bekommen neue IDs statt still zu verschwinden = feste Raum-IDs, B3) und eine Bearbeitungs-Sperre für den Baukasten (B4).

Build 4: Sichern & Einlesen. Verlauf der letzten Stände (HIST_MAX, ohne Hintergrundbilder, eigener Speicher
fenster_heizung_grundriss_verlauf), Wiederherstellen eines Stands oder der Umzugs-Kopie (gr_hist, gr_restore). Sichern als Datei und
Einlesen laufen im Browser; eingelesen wird über gr_set mit src „import“, damit der Verlauf die Herkunft kennt.
"""
from __future__ import annotations

import json
import logging
import re
import secrets
from datetime import timedelta
from typing import Any, Callable

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import DOMAIN
from .sicherheit import MAX_FLOORS, MAX_ITEMS, clean_plan

_LOGGER = logging.getLogger(__name__)
SCHEMA = 2        # Schema der gespeicherten Daten (Schlüssel "v"); 2 = v0.13
STORE_V = 1       # Version der Speicherdatei selbst bleibt 1 – die Umstellung läuft über "v" (wie bei den Haus-Werten)
KEEP_COPY_DAYS = 90
LOCK_MIN = 15     # B4: Bearbeitungs-Sperre läuft nach so vielen Minuten ohne Aktion ab
MAX_PLAN_JSON = 1_000_000  # B2: Plan ohne Hintergrundbilder, höchstens so viele Zeichen
_ITEM_ID = re.compile(r"^[a-z0-9_]{1,24}$")  # wie in sicherheit.py (clean_plan)
LAYERS = {"m": "sf", "l": "licht"}  # Element-Typ → Ebene (Modul 11 Melder, Modul 18 Lampen)
_ID = re.compile(r"^[A-Za-z0-9_.:-]{1,64}$")
ROOMS_MAX = 300
HIST_MAX = 15
SRC = ("gr", "sf", "import", "restore")  # wer hat geschrieben: Baukasten, Modul 11, Datei, Wiederherstellen


def clean_rooms(raw: Any) -> dict[str, str]:
    """Raumliste: Plan-Raum-ID → Bereichs-ID in Home Assistant oder „-“ (bewusst kein Bereich). Fehlt ein Eintrag, gilt der Name."""
    out: dict[str, str] = {}
    if not isinstance(raw, dict):
        return out
    for k, v in raw.items():
        if len(out) >= ROOMS_MAX:
            break
        if isinstance(k, str) and _ID.match(k) and isinstance(v, str) and (v == "-" or _ID.match(v)):
            out[k] = v
    return out


class PlanError(ValueError):
    """Der Plan ist so kaputt, dass er nicht gespeichert wird (Text ist für die Oberfläche gedacht)."""


class LockedError(RuntimeError):
    """Ein anderer Administrator bearbeitet den Plan gerade (B4)."""

    def __init__(self, lock: dict[str, Any]) -> None:
        super().__init__(lock.get("by") or "")
        self.lock = lock


def check_plan(raw: Any) -> tuple[dict[str, Any], dict[str, Any]]:
    """B2 + B3: Plan prüfen und aufräumen. Gibt (sauberer Plan, Bericht) zurück oder wirft PlanError.

    Abgelehnt wird, was nicht sinnvoll gespeichert werden kann: kein Objekt, Etagen/Elemente keine Liste, zu viele Elemente oder Etagen,
    zu groß, oder kein einziges Element ist gültig. Alles andere wird repariert und im Bericht gezählt:
      ids      Elemente mit doppelter oder ungültiger ID bekamen eine neue (das erste behält seine ID – Raumliste und Zuordnungen bleiben gültig)
      dropped  Elemente, die nicht zu retten waren (unbekannte Art, Etage gibt es nicht)
    """
    if not isinstance(raw, dict):
        raise PlanError("Der Plan hat kein gültiges Format.")
    fl, it = raw.get("floors"), raw.get("items")
    if (fl is not None and not isinstance(fl, list)) or (it is not None and not isinstance(it, list)):
        raise PlanError("Etagen oder Elemente des Plans sind beschädigt.")
    fl, it = fl or [], it or []
    if len(fl) > MAX_FLOORS:
        raise PlanError(f"Zu viele Etagen: {len(fl)} (höchstens {MAX_FLOORS}).")
    if len(it) > MAX_ITEMS:
        raise PlanError(f"Zu viele Elemente: {len(it)} (höchstens {MAX_ITEMS}). Bitte einige löschen.")
    try:
        size = len(json.dumps({k: v for k, v in raw.items() if k != "bg"}, ensure_ascii=False))
    except (TypeError, ValueError) as err:
        raise PlanError("Der Plan enthält Werte, die nicht gespeichert werden können.") from err
    if size > MAX_PLAN_JSON:
        raise PlanError("Der Plan ist zu groß.")
    taken = {str(i.get("id")) for i in it if isinstance(i, dict) and _ITEM_ID.match(str(i.get("id") or ""))}
    seen: set[str] = set()
    fixed, items = 0, []
    for i in it:
        if not isinstance(i, dict):
            items.append(i)
            continue
        iid = str(i.get("id") or "")
        if not _ITEM_ID.match(iid) or iid in seen:
            while True:
                new = "i" + secrets.token_hex(4)
                if new not in taken and new not in seen:
                    break
            i = {**i, "id": new}
            iid = new
            fixed += 1
        seen.add(iid)
        items.append(i)
    p = clean_plan({**raw, "items": items})
    dropped = len(it) - len(p["items"])
    if it and not p["items"]:
        raise PlanError("Kein einziges Element des Plans ist gültig – der Plan wird nicht gespeichert.")
    return p, {"ids": fixed, "dropped": max(0, dropped)}


def plan_stats(plan: dict[str, Any]) -> dict[str, Any]:
    """Zahlen für Banner und Ebenen: Etagen, Räume (mit Namen), Bauplan-Elemente, Elemente je Ebene."""
    items = plan.get("items") or []
    layers = {k: 0 for k in LAYERS.values()}
    for i in items:
        lay = LAYERS.get(i.get("t"))
        if lay:
            layers[lay] += 1
    rooms = [i for i in items if i.get("t") == "r"]
    return {"floors": len(plan.get("floors") or []), "rooms": len(rooms), "named": sum(1 for r in rooms if str(r.get("n") or "").strip()),
            "build": sum(1 for i in items if i.get("t") not in LAYERS), "layers": layers, "bg": sum(1 for v in (plan.get("bg") or {}).values() if v)}


class GrundrissManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, STORE_V, f"{DOMAIN}_grundriss")
        self._copy = SafeStore(hass, 1, f"{DOMAIN}_grundriss_umzug")  # Stand des Plans aus Modul 11 beim Umzug
        self.plan: dict[str, Any] = clean_plan(None)
        self.has = False                  # gibt es schon einen eigenen Plan in Modul 0?
        self.meta: dict[str, Any] = {}    # since (Umzug), src, copy_until, changed, pmap (Übernahme aus Modul 18)
        self.rooms: dict[str, str] = {}   # Plan-Raum → Bereich (Build 2)
        self._listeners: list[Callable[[], None]] = []
        self._hstore = SafeStore(hass, 1, f"{DOMAIN}_grundriss_verlauf")  # Build 4: frühere Stände ohne Hintergrundbilder
        self.hist: list[dict[str, Any]] = []
        self.lock: dict[str, str] | None = None   # B4: { sid, by, since, ts } – nur im Speicher, nach einem Neustart gibt es keine Sperre
        self.check: dict[str, Any] = {}            # B2: Bericht der letzten Prüfung (ids, dropped, at)

    async def async_start(self) -> None:
        d = await self._store.async_load()
        if isinstance(d, dict) and isinstance(d.get("plan"), dict):
            self.plan = clean_plan(d["plan"])
            self.has = True
            self.meta = {k: str(v) for k, v in (d.get("meta") or {}).items() if isinstance(v, str)}
        if isinstance(d, dict):
            self.rooms = clean_rooms(d.get("rooms"))
        h = await self._hstore.async_load()
        if isinstance(h, dict) and isinstance(h.get("hist"), list):
            self.hist = [x for x in h["hist"] if isinstance(x, dict) and isinstance(x.get("plan"), dict) and isinstance(x.get("id"), str)][:HIST_MAX]
        ver = d.get("v") if isinstance(d, dict) and isinstance(d.get("v"), int) else 1
        if self.has and ver < SCHEMA:
            self._upgrade(ver)
        elif ver > SCHEMA:
            _LOGGER.warning("Modul 0: Grundriss wurde mit einer neueren Version gespeichert (Schema %s, hier %s) – Felder, die diese Version nicht kennt, gehen beim nächsten Speichern verloren", ver, SCHEMA)
        until = self.meta.get("copy_until")
        if until:
            u = dt_util.parse_datetime(until)
            if u and dt_util.now() > u:  # Umzugs-Kopie nach 90 Tagen löschen
                self._copy.async_delay_save(lambda: {"t": "", "src": "", "plan": None}, 1)  # Inhalt leeren, Datei bleibt
                self.meta.pop("copy_until", None)
                self._save(1)

    def _upgrade(self, ver: int) -> None:
        """B1: gespeicherten Stand auf das aktuelle Schema bringen. Vorher kommt der alte Stand in den Verlauf („schema“), damit man zurück kann.
        1 → 2: Plan durch die Prüfung schicken (IDs), Schema-Nummer und Zeitpunkt in meta vermerken."""
        self._push_hist("schema")
        try:
            self.plan, self.check = check_plan(self.plan)
        except PlanError:
            _LOGGER.warning("Modul 0: gespeicherter Plan besteht die Prüfung nicht – er bleibt, wie er ist", exc_info=True)
            self.check = {"ids": 0, "dropped": 0}
        self.check["at"] = dt_util.now().isoformat()
        self.meta["schema"] = str(SCHEMA)
        self.meta["schema_from"] = str(ver)
        self.meta["schema_at"] = self.check["at"]
        self._save(1)
        _LOGGER.info("Modul 0: Grundriss von Schema %s auf %s umgestellt (%s Element-IDs erneuert)", ver, SCHEMA, self.check.get("ids", 0))

    def _save(self, delay: float = 5) -> None:
        self._store.async_delay_save(lambda: {"v": SCHEMA, "plan": self.plan, "meta": self.meta, "rooms": self.rooms}, delay)

    def listen(self, cb: Callable[[], None]) -> Callable[[], None]:
        self._listeners.append(cb)
        return lambda: self._listeners.remove(cb) if cb in self._listeners else None

    # ---- Umzug und Schreiben
    def adopt(self, plan: dict[str, Any], src: str) -> bool:
        """Einmalig: Plan aus einem Modul übernehmen, wenn Modul 0 noch keinen hat. Leere Pläne werden nicht übernommen."""
        if self.has:
            return False
        p = clean_plan(plan)
        if not (p["items"] or any(p["bg"].values())):
            return False
        now = dt_util.now()
        self.plan, self.has = p, True
        self.meta = {"since": now.isoformat(), "src": src, "copy_until": (now + timedelta(days=KEEP_COPY_DAYS)).isoformat(), "changed": now.isoformat()}
        self._copy.async_delay_save(lambda: {"t": now.isoformat(), "src": src, "plan": p}, 1)
        self._save(1)
        s = plan_stats(p)
        _LOGGER.info("Modul 0: Grundriss aus %s übernommen (%s Etagen, %s Räume, %s Melder, %s Lampen)", src, s["floors"], s["rooms"], s["layers"]["sf"], s["layers"]["licht"])
        return True

    def _push_hist(self, by: str) -> None:
        """Den jetzigen Stand in den Verlauf legen (neuester zuerst). Hintergrundbilder bleiben draußen – sie sind groß und ändern sich selten."""
        if not self.has or not (self.plan.get("items") or []):
            return
        now = dt_util.now()
        hid = now.strftime("%Y%m%d%H%M%S") + "-" + secrets.token_hex(3)
        entry = {"id": hid, "t": now.isoformat(), "by": self.meta.get("by") or ("umzug" if self.meta.get("src") else ""), "next": by, "plan": {**self.plan, "bg": {}}, "stats": plan_stats(self.plan)}
        self.hist = [entry] + [x for x in self.hist if x.get("plan") != entry["plan"]][: HIST_MAX - 1]
        self._hstore.async_delay_save(lambda: {"v": 1, "hist": self.hist}, 5)

    def set_plan(self, plan: dict[str, Any], src: str = "") -> bool:
        """Plan schreiben (src „gr“ = Baukasten in Modul 0, „sf“ = ältere Oberfläche über Modul 11). True, wenn sich etwas geändert hat."""
        p, self.check = check_plan(plan)   # B2: wirft PlanError bei kaputten Plänen, bevor irgendetwas geändert wird
        self.check["at"] = dt_util.now().isoformat()
        if self.has and p == self.plan:
            return False
        self._push_hist(src)
        self.plan, self.has = p, True
        self.meta["changed"] = dt_util.now().isoformat()
        if src:
            self.meta["by"] = src
        self._save()
        for cb in list(self._listeners):
            try:
                cb()
            except Exception:  # noqa: BLE001
                _LOGGER.debug("Plan-Hörer fehlgeschlagen", exc_info=True)
        return True

    def set_flag(self, key: str, on: bool) -> None:
        """Schalter in meta (Build 9: „ent“ = Raum-Sensoren in Home Assistant)."""
        if on:
            self.meta[key] = "1"
        else:
            self.meta.pop(key, None)
        self._save(1)

    # ---- Bearbeitungs-Sperre (B4)
    def _lock_now(self) -> dict[str, str] | None:
        """Aktive Sperre oder None (abgelaufene wird verworfen)."""
        lk = self.lock
        if lk:
            ts = dt_util.parse_datetime(lk.get("ts", ""))
            if ts is None or dt_util.now() - ts > timedelta(minutes=LOCK_MIN):
                self.lock = lk = None
        return lk

    def lock_public(self) -> dict[str, str] | None:
        lk = self._lock_now()
        return {k: lk[k] for k in ("sid", "by", "since")} if lk else None

    def lock_take(self, sid: str, by: str, force: bool = False) -> bool:
        """Sperre holen. False, wenn ein anderes Gerät sie hält (außer mit force: dann wird sie übernommen)."""
        lk = self._lock_now()
        if lk and lk["sid"] != sid and not force:
            return False
        now = dt_util.now().isoformat()
        self.lock = {"sid": sid, "by": by, "since": lk["since"] if lk and lk["sid"] == sid else now, "ts": now}
        return True

    def lock_keep(self, sid: str) -> bool:
        """Sperre verlängern (jede Aktion des Besitzers). False, wenn sie jemand anderem gehört oder abgelaufen ist."""
        lk = self._lock_now()
        if not lk or lk["sid"] != sid:
            return False
        lk["ts"] = dt_util.now().isoformat()
        return True

    def lock_release(self, sid: str) -> None:
        lk = self._lock_now()
        if lk and lk["sid"] == sid:
            self.lock = None

    def lock_check(self, sid: str | None) -> None:
        """Wirft LockedError, wenn ein anderes Gerät den Baukasten gerade hält. Ohne Sperre darf jeder schreiben."""
        lk = self._lock_now()
        if lk and lk["sid"] != sid:
            raise LockedError({k: lk[k] for k in ("sid", "by", "since")})

    # ---- Verlauf und Wiederherstellen (Build 4)
    async def hist_list(self) -> dict[str, Any]:
        """Verlauf für die Oberfläche (ohne Pläne) und die Umzugs-Kopie aus Modul 11, falls noch da."""
        out = {"hist": [{k: x.get(k) for k in ("id", "t", "by", "next", "stats")} for x in self.hist], "copy": None}
        c = await self._copy.async_load() if self.meta.get("copy_until") else None
        if isinstance(c, dict) and isinstance(c.get("plan"), dict):
            out["copy"] = {"t": c.get("t", ""), "src": c.get("src", ""), "until": self.meta.get("copy_until", ""), "stats": plan_stats(clean_plan(c["plan"]))}
        return out

    async def restore(self, hid: str) -> bool:
        """Einen Stand aus dem Verlauf („umzug“ = Kopie aus Modul 11) wiederherstellen. Der jetzige Stand landet vorher im Verlauf.
        Hintergrundbilder bleiben, wie sie jetzt sind (für Etagen, die es im wiederhergestellten Stand gibt)."""
        if hid == "umzug":
            c = await self._copy.async_load() if self.meta.get("copy_until") else None
            plan = c.get("plan") if isinstance(c, dict) else None
        else:
            plan = next((x["plan"] for x in self.hist if x.get("id") == hid), None)
        if not isinstance(plan, dict):
            return False
        p = clean_plan(plan)
        ids = {f["id"] for f in p["floors"]}
        if hid != "umzug" or not any(p["bg"].values()):
            p["bg"] = {k: v for k, v in (self.plan.get("bg") or {}).items() if k in ids and v}
        return self.set_plan(p, "restore")

    # ---- Raumliste (Build 2)
    def set_rooms(self, patch: Any) -> bool:
        """Einträge setzen; leerer Wert = wieder automatisch über den Namen."""
        if not isinstance(patch, dict):
            return False
        r = dict(self.rooms)
        for k, v in patch.items():
            if not isinstance(k, str):
                continue
            if v in ("", None):
                r.pop(k, None)
            else:
                r[k] = v
        r = clean_rooms(r)
        if r == self.rooms:
            return False
        self.rooms = r
        self._save()
        return True

    def merge_pmap(self, pmap: Any) -> int:
        """Einmalig: Zuordnung aus Modul 18 (pmap) übernehmen. Was in Modul 0 schon steht, gewinnt. Gibt die Zahl übernommener Einträge zurück."""
        if self.meta.get("pmap"):
            return 0
        add = {k: v for k, v in clean_rooms(pmap).items() if k not in self.rooms}
        self.rooms = clean_rooms({**self.rooms, **add})
        self.meta["pmap"] = dt_util.now().isoformat()
        self._save(1)
        return len(add)

    # ---- Lesen
    def users(self) -> list[str]:
        """Welche Module den Plan gerade nutzen (für Banner, Rückfrage beim Ausschalten)."""
        out = ["fh"]  # Modul 1: Wärmekarte
        wm = self.hass.data.get(DOMAIN, {}).get("wasser")
        on = (wm.modules.get("on", {}) if wm is not None else {}) or {}
        if on.get("sf"):
            out.append("sf")
        am = self.hass.data.get(DOMAIN, {}).get("addons")
        if am is not None and "licht" in (getattr(am, "live", None) or {}):  # Addon „licht“ läuft
            out.append("li")
        return out

    def snapshot(self) -> dict[str, Any]:
        return {"v": SCHEMA, "plan": self.plan, "rooms": dict(self.rooms), "has": self.has, "meta": dict(self.meta), "stats": plan_stats(self.plan), "users": self.users(), "lock": self.lock_public(), "check": dict(self.check)}
