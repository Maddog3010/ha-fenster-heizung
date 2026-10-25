"""WebSocket-Schnittstelle für das Dashboard (Heizplan und Anordnung)."""
from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import BLOCK_IDS, DOMAIN, ROOM_ICON_IDS


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
    return {"blocks": blocks, "rooms": rooms, "icons": icons}


async def _layout(hass: HomeAssistant) -> dict[str, Any]:
    store = hass.data.setdefault(DOMAIN, {})
    if "layout" not in store:
        s = Store(hass, 1, f"{DOMAIN}_layout")
        store["layout_store"] = s
        store["layout"] = clean_layout(await s.async_load())
    return store["layout"]


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/get_state"})
@websocket_api.async_response
async def ws_get_state(hass: HomeAssistant, connection, msg: dict) -> None:
    layout = await _layout(hass)
    plans = {}
    for entry in hass.config_entries.async_entries(DOMAIN):
        ctrl = getattr(entry, "runtime_data", None)
        if ctrl is not None and entry.state is ConfigEntryState.LOADED:
            plans[entry.entry_id] = ctrl.plan_dict()
    connection.send_result(msg["id"], {"layout": layout, "plans": plans})


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
        await ctrl.async_set_plan(msg["enabled"], msg["entries"])
    except (ValueError, TypeError) as err:
        connection.send_error(msg["id"], "invalid_format", str(err))
        return
    connection.send_result(msg["id"], ctrl.plan_dict())


def async_register_api(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, ws_get_state)
    websocket_api.async_register_command(hass, ws_set_layout)
    websocket_api.async_register_command(hass, ws_set_plan)
