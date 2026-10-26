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
    CONF_BLOCK_TO,
    CONF_ENERGY_PER_UNIT,
    CONF_FUEL,
    CONF_GAS_KWH_PER_M3,
    CONF_NOTIFY_SERVICE,
    DEFAULT_FUEL,
    DOMAIN,
    GROUP_ICON_IDS,
    MAX_GROUPS,
    PLAN_MODES,
    ROOM_ICON_IDS,
)
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
    return {"blocks": blocks, "rooms": rooms, "icons": icons, "groups": groups}


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
    for key in (CONF_BLOCK_FROM, CONF_BLOCK_TO):
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
    # Speichern lädt den Raum über den Update-Listener neu
    hass.config_entries.async_update_entry(entry, options=cleaned)
    connection.send_result(msg["id"], {"options": _current_options(entry)})


def async_register_api(hass: HomeAssistant) -> None:
    for command in (
        ws_get_state, ws_set_layout, ws_set_plan, ws_set_presence, ws_get_options, ws_set_options
    ):
        websocket_api.async_register_command(hass, command)
