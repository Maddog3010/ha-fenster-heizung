"""WebSocket-Schnittstelle für das Dashboard (Heizplan, Anordnung, Anwesenheit)."""
from __future__ import annotations

import json
import os
import re
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import (
    BLOCK_IDS,
    CONF_BLOCK_FROM,
    BACKUP_FORMAT,
    CONF_BLOCK_TO,
    CONF_ENERGY_PER_UNIT,
    CONF_FUEL,
    CONF_GAS_KWH_PER_M3,
    CONF_NOTIFY_SERVICE,
    DEFAULT_FUEL,
    DOMAIN,
    GROUP_ICON_IDS,
    MAX_GROUPS,
    MAX_PHOTO_CHARS,
    MAX_PHOTOS,
    PLAN_MODES,
    ROOM_ICON_IDS,
)
from .general import clean_general
from .options import clean_options
from .presence import clean_presence

def clean_layout(raw: Any) -> dict[str, Any]:
    """Anordnung und Symbole prüfen, unbekannte Werte verwerfen."""
    raw = raw if isinstance(raw, dict) else {}
    blocks: list[str] = []
    for b in raw.get("blocks") or []:
        if b in BLOCK_IDS and b not in blocks:
            blocks.append(b)
    rooms: list[str] = []
    for r in raw.get("rooms") or []:
        if isinstance(r, str) and r not in rooms:
            rooms.append(r[:64])
    icons = {
        str(k)[:64]: v
        for k, v in (raw.get("icons") or {}).items()
        if isinstance(v, str) and v in ROOM_ICON_IDS
    }
    groups: list[dict[str, Any]] = []
    used: set[str] = set()
    seen_ids: set[str] = set()
    for g in (raw.get("groups") or [])[:MAX_GROUPS]:
        if not isinstance(g, dict):
            continue
        gid = str(g.get("id") or "")[:16]
        name = str(g.get("name") or "").strip()[:30]
        if not gid or not name or gid in seen_ids:
            continue
        seen_ids.add(gid)
        members: list[str] = []
        for r in g.get("rooms") or []:
            if isinstance(r, str) and r not in used and r not in members:
                members.append(r[:64])
        used.update(members)
        icon = g.get("icon")
        groups.append(
            {
                "id": gid,
                "name": name,
                "icon": icon if icon in GROUP_ICON_IDS else GROUP_ICON_IDS[0],
                "rooms": members,
            }
        )
    out: dict[str, Any] = {"blocks": blocks, "rooms": rooms, "icons": icons, "groups": groups}
    out.update(_clean_look(raw))
    return out


_HEX = re.compile(r"^#[0-9a-fA-F]{6}$")
_PHOTO = re.compile(r"^data:image/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$")


def _clean_look(raw: dict[str, Any]) -> dict[str, Any]:
    """Akzentfarbe, Raumfarben, Raumfotos und Wetteranzeige prüfen."""
    out: dict[str, Any] = {}
    accent = raw.get("accent")
    if isinstance(accent, str) and _HEX.match(accent):
        out["accent"] = accent.lower()
    colors = {
        str(k)[:64]: v.lower()
        for k, v in (raw.get("colors") or {}).items()
        if isinstance(raw.get("colors"), dict) and isinstance(v, str) and _HEX.match(v)
    }
    if colors:
        out["colors"] = colors
    photos: dict[str, str] = {}
    if isinstance(raw.get("photos"), dict):
        for k, v in raw["photos"].items():
            if len(photos) >= MAX_PHOTOS:
                break
            if isinstance(v, str) and len(v) <= MAX_PHOTO_CHARS and _PHOTO.match(v):
                photos[str(k)[:64]] = v
    if photos:
        out["photos"] = photos
    wx = raw.get("wx")
    if isinstance(wx, dict):
        clean: dict[str, Any] = {}
        if isinstance(wx.get("on"), bool):
            clean["on"] = wx["on"]
        ent = wx.get("entity")
        if isinstance(ent, str) and re.match(r"^weather\.[a-z0-9_]+$", ent):
            clean["entity"] = ent
        out_s = wx.get("outdoor")
        if isinstance(out_s, str) and re.match(r"^sensor\.[a-z0-9_]+$", out_s):
            clean["outdoor"] = out_s
        if clean:
            out["wx"] = clean
    return out


def _read_version() -> str:
    try:
        path = os.path.join(os.path.dirname(__file__), "manifest.json")
        with open(path, encoding="utf-8") as fh:
            return str(json.load(fh).get("version", ""))
    except (OSError, ValueError):
        return ""


async def _version(hass: HomeAssistant) -> str:
    cached = hass.data.get(f"{DOMAIN}_version")
    if cached is None:
        cached = await hass.async_add_executor_job(_read_version)
        hass.data[f"{DOMAIN}_version"] = cached
    return cached


async def _layout(hass: HomeAssistant) -> dict[str, Any]:
    store = hass.data.setdefault(DOMAIN, {})
    if "layout" not in store:
        s = Store(hass, 1, f"{DOMAIN}_layout")
        store["layout_store"] = s
        store["layout"] = clean_layout(await s.async_load())
    return store["layout"]


def _presence_snapshot(hass: HomeAssistant) -> dict[str, Any]:
    mgr = hass.data.get(DOMAIN, {}).get("presence")
    if mgr is not None:
        return mgr.snapshot()
    return {**clean_presence({}), "effective": "home"}


def _general_snapshot(hass: HomeAssistant) -> dict[str, Any]:
    mgr = hass.data.get(DOMAIN, {}).get("general")
    if mgr is None:
        return {"general": clean_general({}), "status": None}
    return {"general": mgr.data, "status": mgr.status()}


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/get_general"})
@websocket_api.async_response
async def ws_get_general(hass: HomeAssistant, connection, msg: dict) -> None:
    connection.send_result(msg["id"], _general_snapshot(hass))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "fenster_heizung/set_general", vol.Required("general"): dict}
)
@websocket_api.async_response
async def ws_set_general(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("general")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Noch nicht bereit")
        return
    await mgr.async_set(msg["general"])
    connection.send_result(msg["id"], _general_snapshot(hass))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "fenster_heizung/get_update", vol.Optional("force", default=False): bool}
)
@websocket_api.async_response
async def ws_get_update(hass: HomeAssistant, connection, msg: dict) -> None:
    current = await _version(hass)
    mgr = hass.data.get(DOMAIN, {}).get("general")
    connection.send_result(msg["id"], await mgr.async_update_info(current, msg.get("force", False)) if mgr else {"latest": current})


@websocket_api.websocket_command(
    {vol.Required("type"): "fenster_heizung/get_learning", vol.Required("entry_id"): str}
)
@websocket_api.async_response
async def ws_get_learning(hass: HomeAssistant, connection, msg: dict) -> None:
    entry = hass.config_entries.async_get_entry(msg["entry_id"])
    ctrl = getattr(entry, "runtime_data", None) if entry else None
    connection.send_result(msg["id"], ctrl.learning_info() if ctrl is not None else None)


def match_rooms(backup_rooms: dict[str, Any], entries: list[tuple[str, str]]) -> dict[str, str]:
    """Räume der Sicherung den vorhandenen zuordnen: erst nach ID, dann nach eindeutigem Namen."""
    ids = {eid for eid, _ in entries}
    by_name: dict[str, list[str]] = {}
    for eid, title in entries:
        by_name.setdefault(title.strip().lower(), []).append(eid)
    out: dict[str, str] = {}
    taken: set[str] = set()
    for old, info in backup_rooms.items():
        if old in ids and old not in taken:
            out[old] = old
            taken.add(old)
    for old, info in backup_rooms.items():
        if old in out:
            continue
        name = str((info or {}).get("name") or "").strip().lower()
        cand = [e for e in by_name.get(name, []) if e not in taken]
        if len(cand) == 1:
            out[old] = cand[0]
            taken.add(cand[0])
    return out


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "fenster_heizung/restore", vol.Required("data"): dict}
)
@websocket_api.async_response
async def ws_restore(hass: HomeAssistant, connection, msg: dict) -> None:
    """Sicherung einspielen: Aussehen, Allgemeines, Anwesenheit, Heizpläne, Raumeinstellungen."""
    data = msg["data"]
    rooms = data.get("rooms")
    if data.get("app") != DOMAIN or data.get("format") != BACKUP_FORMAT or not isinstance(rooms, dict):
        connection.send_error(msg["id"], "invalid_format", "Das ist keine gültige Sicherung")
        return
    entries = hass.config_entries.async_entries(DOMAIN)
    mapping = match_rooms(rooms, [(e.entry_id, e.title) for e in entries])
    # Layout: Raum-IDs auf die vorhandenen Räume umschreiben
    layout = dict(data.get("layout") or {})

    def remap(ids):
        return [mapping[i] for i in ids if i in mapping]

    def remap_dict(d):
        return {mapping[k]: v for k, v in (d or {}).items() if k in mapping}

    layout["rooms"] = remap(layout.get("rooms") or [])
    for key in ("icons", "colors", "photos"):
        if isinstance(layout.get(key), dict):
            layout[key] = remap_dict(layout[key])
    layout["groups"] = [
        {**g, "rooms": remap(g.get("rooms") or [])} for g in layout.get("groups") or [] if isinstance(g, dict)
    ]
    await _layout(hass)
    store = hass.data[DOMAIN]
    store["layout"] = clean_layout(layout)
    await store["layout_store"].async_save(store["layout"])
    gen = hass.data[DOMAIN].get("general")
    if gen is not None and isinstance(data.get("general"), dict):
        await gen.async_set(data["general"])
    mgr = hass.data[DOMAIN].get("presence")
    if mgr is not None and isinstance(data.get("presence"), dict):
        await mgr.async_set(data["presence"])
    plans = data.get("plans") if isinstance(data.get("plans"), dict) else {}
    done = skipped_opts = 0
    for old, new in mapping.items():
        entry = hass.config_entries.async_get_entry(new)
        ctrl = getattr(entry, "runtime_data", None)
        plan = plans.get(old)
        if ctrl is not None and isinstance(plan, dict):
            try:
                await ctrl.async_set_plan(bool(plan.get("enabled")), plan.get("entries") or [], plan.get("mode"))
            except (ValueError, TypeError):
                pass
    for old, new in mapping.items():
        opts = (rooms.get(old) or {}).get("options")
        entry = hass.config_entries.async_get_entry(new)
        if entry is None or not isinstance(opts, dict):
            continue
        try:
            hass.config_entries.async_update_entry(entry, options=clean_options(opts))
            done += 1
        except ValueError:
            skipped_opts += 1  # Entitäten gibt es hier evtl. nicht: Raum behält seine Einstellungen
    connection.send_result(
        msg["id"],
        {"rooms": len(mapping), "missing": len(rooms) - len(mapping), "options": done, "options_skipped": skipped_opts},
    )


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/get_state"})
@websocket_api.async_response
async def ws_get_state(hass: HomeAssistant, connection, msg: dict) -> None:
    layout = await _layout(hass)
    plans = {}
    for entry in hass.config_entries.async_entries(DOMAIN):
        ctrl = getattr(entry, "runtime_data", None)
        if ctrl is not None and entry.state is ConfigEntryState.LOADED:
            plans[entry.entry_id] = ctrl.plan_dict()
    connection.send_result(
        msg["id"],
        {
            "layout": layout,
            "plans": plans,
            "presence": _presence_snapshot(hass),
            "version": await _version(hass),
            **_general_snapshot(hass),
        },
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "fenster_heizung/set_layout", vol.Required("layout"): dict}
)
@websocket_api.async_response
async def ws_set_layout(hass: HomeAssistant, connection, msg: dict) -> None:
    await _layout(hass)
    store = hass.data[DOMAIN]
    store["layout"] = clean_layout(msg["layout"])
    await store["layout_store"].async_save(store["layout"])
    connection.send_result(msg["id"], store["layout"])


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "fenster_heizung/set_plan",
        vol.Required("entry_id"): str,
        vol.Required("enabled"): bool,
        vol.Required("entries"): [dict],
        vol.Optional("mode"): vol.In(list(PLAN_MODES)),
    }
)
@websocket_api.async_response
async def ws_set_plan(hass: HomeAssistant, connection, msg: dict) -> None:
    entry = hass.config_entries.async_get_entry(msg["entry_id"])
    ctrl = getattr(entry, "runtime_data", None) if entry else None
    if entry is None or entry.domain != DOMAIN or ctrl is None:
        connection.send_error(msg["id"], "not_found", "Raum nicht gefunden")
        return
    try:
        await ctrl.async_set_plan(msg["enabled"], msg["entries"], msg.get("mode"))
    except (ValueError, TypeError) as err:
        connection.send_error(msg["id"], "invalid_format", str(err))
        return
    connection.send_result(msg["id"], ctrl.plan_dict())


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "fenster_heizung/set_presence", vol.Required("presence"): dict}
)
@websocket_api.async_response
async def ws_set_presence(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("presence")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Anwesenheit ist noch nicht bereit")
        return
    connection.send_result(msg["id"], await mgr.async_set(msg["presence"]))


def _current_options(entry) -> dict[str, Any]:
    """Aktuelle Einstellungen eines Raums (Daten und Optionen zusammengeführt)."""
    cur = {**entry.data, **entry.options}
    cur.pop("name", None)
    if not cur.get(CONF_ENERGY_PER_UNIT) and cur.get(CONF_GAS_KWH_PER_M3):
        if cur.get(CONF_FUEL, DEFAULT_FUEL) == DEFAULT_FUEL:
            cur[CONF_ENERGY_PER_UNIT] = cur[CONF_GAS_KWH_PER_M3]  # Wert aus Version 2.3 und älter
    cur.pop(CONF_GAS_KWH_PER_M3, None)
    raw = cur.get(CONF_NOTIFY_SERVICE)
    if isinstance(raw, str):
        cur[CONF_NOTIFY_SERVICE] = [x for x in re.split(r"[,;\s]+", raw) if x]
    for key in (CONF_BLOCK_FROM, CONF_BLOCK_TO, "htr_from", "htr_to"):
        if isinstance(cur.get(key), str) and len(cur[key]) >= 5:
            cur[key] = cur[key][:5]
    return cur


def _room_entry(hass: HomeAssistant, entry_id: str):
    entry = hass.config_entries.async_get_entry(entry_id)
    return entry if entry is not None and entry.domain == DOMAIN else None


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "fenster_heizung/get_options", vol.Required("entry_id"): str}
)
@websocket_api.async_response
async def ws_get_options(hass: HomeAssistant, connection, msg: dict) -> None:
    entry = _room_entry(hass, msg["entry_id"])
    if entry is None:
        connection.send_error(msg["id"], "not_found", "Raum nicht gefunden")
        return
    connection.send_result(msg["id"], {"name": entry.title, "options": _current_options(entry)})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "fenster_heizung/set_options",
        vol.Required("entry_id"): str,
        vol.Required("options"): dict,
    }
)
@websocket_api.async_response
async def ws_set_options(hass: HomeAssistant, connection, msg: dict) -> None:
    entry = _room_entry(hass, msg["entry_id"])
    if entry is None:
        connection.send_error(msg["id"], "not_found", "Raum nicht gefunden")
        return
    try:
        cleaned = clean_options(msg["options"])
    except ValueError as err:
        connection.send_error(msg["id"], "invalid_format", str(err))
        return
    heater = cleaned.get("htr_entity")
    if heater and cleaned.get("htr_on") == "on":
        for other in hass.config_entries.async_entries(DOMAIN):
            used = {**other.data, **other.options}.get("thermostats") or []
            if other.entry_id != entry.entry_id and heater in used:
                connection.send_error(
                    msg["id"], "invalid_format",
                    f"Elektroheizer: {heater} ist Heizungsthermostat in „{other.title}“",
                )
                return
    # Speichern lädt den Raum über den Update-Listener neu
    hass.config_entries.async_update_entry(entry, options=cleaned)
    connection.send_result(msg["id"], {"options": _current_options(entry)})


def async_register_api(hass: HomeAssistant) -> None:
    for command in (
        ws_get_state, ws_set_layout, ws_set_plan, ws_set_presence, ws_get_options, ws_set_options,
        ws_get_general, ws_set_general, ws_get_update, ws_get_learning, ws_restore,
    ):
        websocket_api.async_register_command(hass, command)
