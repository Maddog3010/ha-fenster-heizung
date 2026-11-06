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

from .verlauf import WHO
from .backup import SafeStore
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
    HERO_MODES,
    HERO_SLOTS,
    MAX_GROUPS,
    MAX_HERO_CHARS,
    MAX_HERO_PHOTOS,
    MAX_PHOTO_CHARS,
    MAX_PHOTOS,
    PLAN_MODES,
    ROOM_ICON_IDS,
)
from .general import clean_general
from .options import clean_options
from .presence import clean_presence
from .wasser import clean_modules, clean_wasser

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
    out: dict[str, Any] = {"blocks": blocks, "rooms": rooms, "icons": icons, "groups": groups, "mess": clean_mess(raw.get("mess"))}
    out.update(_clean_look(raw))
    return out


MAX_MESS = 20
_MS_ID = re.compile(r"^ms_[a-z0-9]{1,16}$")
_MS_ENT = re.compile(r"^(sensor|binary_sensor)\.[a-z0-9_]{1,200}$")


def clean_mess(raw: Any) -> list[dict[str, Any]]:
    """Messräume in Modul 1: Raum nur mit Temperatur und Luftfeuchte, steuert nichts.

    "parts" hält die Bausteine des Raums (heute nur "mess"), damit später Räume aus Bausteinen möglich sind.
    """
    out: list[dict[str, Any]] = []
    seen: set[str] = set()

    def num(v: Any, d: float, lo: float, hi: float) -> float:
        try:
            x = float(v)
        except (TypeError, ValueError):
            return d
        return d if x != x else min(max(x, lo), hi)

    def ent(v: Any, sensor_only: bool = True) -> str:
        if not isinstance(v, str) or not _MS_ENT.match(v):
            return ""
        return v if (v.startswith("sensor.") or not sensor_only) else ""

    for m in (raw if isinstance(raw, list) else [])[:MAX_MESS]:
        if not isinstance(m, dict):
            continue
        mid, name = str(m.get("id") or ""), str(m.get("name") or "").strip()[:30]
        temp, hum = ent(m.get("temp")), ent(m.get("hum"))
        if not _MS_ID.match(mid) or mid in seen or not name or not (temp or hum):
            continue
        seen.add(mid)
        t_lo, t_hi = num(m.get("t_lo"), 18, -20, 40), num(m.get("t_hi"), 24, -20, 40)
        h_lo, h_hi = num(m.get("h_lo"), 40, 0, 100), num(m.get("h_hi"), 60, 0, 100)
        if t_lo >= t_hi:
            t_lo, t_hi = 18.0, 24.0
        if h_lo >= h_hi:
            h_lo, h_hi = 40.0, 60.0
        out.append({
            "id": mid, "name": name, "parts": ["mess"], "temp": temp, "hum": hum, "bat": ent(m.get("bat"), False),
            "mm": m.get("mm") is not False, "dew": m.get("dew") is True, "mold": m.get("mold") is True,
            "t_lo": t_lo, "t_hi": t_hi, "h_lo": h_lo, "h_hi": h_hi, "stale": int(num(m.get("stale"), 60, 10, 1440)),
        })
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
    hero = raw.get("hero")
    if isinstance(hero, dict):
        mode = hero.get("mode") if hero.get("mode") in HERO_MODES else "standard"
        own: dict[str, str] = {}
        if isinstance(hero.get("own"), dict):
            for k, v in hero["own"].items():
                if len(own) >= MAX_HERO_PHOTOS:
                    break
                if k in HERO_SLOTS and isinstance(v, str) and len(v) <= MAX_HERO_CHARS and _PHOTO.match(v):
                    own[k] = v
        if mode != "standard" or own:
            out["hero"] = {"mode": mode, "own": own}
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
    store = raw.get("store")
    if isinstance(store, dict):
        sc = {k: store[k] for k in ("icon", "tab") if isinstance(store.get(k), bool)}
        if sc:
            out["store"] = sc
    mu = raw.get("mu")
    if isinstance(mu, dict):
        mc: dict[str, Any] = {}
        for key in ("order", "hidden"):
            v = mu.get(key)
            if isinstance(v, list):
                mc[key] = [x for x in dict.fromkeys(v) if isinstance(x, str) and x in MU_BLOCKS]
        if mc:
            out["mu"] = mc
    li = raw.get("li")
    if isinstance(li, dict):
        lc2: dict[str, Any] = {}
        sce = li.get("scenes")
        if isinstance(sce, dict):
            lc2["scenes"] = {
                k: sce[k] for k in ("night", "arrive", "cozy")
                if isinstance(sce.get(k), str) and re.match(r"^(scene|script)\.[a-z0-9_]+$", sce[k])
            }
        if li.get("hours") in (1, 2, 4):
            lc2["hours"] = li["hours"]
        hid = li.get("hidden")
        if isinstance(hid, list):
            lc2["hidden"] = [x[:64] for x in dict.fromkeys(hid) if isinstance(x, str) and x][:60]
        if lc2:
            out["li"] = lc2
    start = raw.get("start")
    if isinstance(start, dict):
        sc2: dict[str, Any] = {k: start[k] for k in ("on", "greet", "ctl") if isinstance(start.get(k), bool)}
        if start.get("open") in ("start", "last"):
            sc2["open"] = start["open"]
        for key in ("order", "hidden"):
            v = start.get(key)
            if isinstance(v, list):
                sc2[key] = [x for x in dict.fromkeys(v) if isinstance(x, str) and x in ST_BLOCKS]
        al = start.get("alarm")
        if isinstance(al, str) and (al == "" or re.match(r"^alarm_control_panel\.[a-z0-9_]+$", al)):
            sc2["alarm"] = al
        bub = start.get("bub")
        if isinstance(bub, dict):
            bc: dict[str, Any] = {}
            ids = bub.get("ids")
            if isinstance(ids, list):
                bc["ids"] = [x for x in dict.fromkeys(ids) if isinstance(x, str) and x in ST_BUBBLES][:8]
            if isinstance(bub.get("warn"), bool):
                bc["warn"] = bub["warn"]
            if bub.get("tap") in ("block", "module"):
                bc["tap"] = bub["tap"]
            if bc:
                sc2["bub"] = bc
        if sc2:
            out["start"] = sc2
    labs = raw.get("labs")
    if isinstance(labs, dict):
        lc: dict[str, Any] = {k: labs[k] for k in ("icon", "tab") if isinstance(labs.get(k), bool)}
        on = labs.get("on")
        if isinstance(on, list):
            lc["on"] = [x for x in dict.fromkeys(on) if isinstance(x, str) and x in LAB_IDS]
        cfg = labs.get("cfg")
        if isinstance(cfg, dict):
            lc["cfg"] = {k: float(v) for k, v in cfg.items() if k in LAB_NUM and isinstance(v, (int, float)) and not isinstance(v, bool) and -1e6 < v < 1e6}
            cal = cfg.get("lk_cal")
            if isinstance(cal, str) and re.match(r"^calendar\.[a-z0-9_]+$", cal):
                lc["cfg"]["lk_cal"] = cal
        out["labs"] = lc
    return out


MU_BLOCKS = {"tonnen", "next", "cal", "rem", "hint", "cost"}
ST_BLOCKS = {"zuhause", "wetter", "personen", "hinweise", "alarm", "energie", "muell"}
ST_BUBBLES = {"wetter", "personen", "alarm", "solar", "batterie", "auto", "fenster", "muell", "warmwasser", "preis", "hinweise"}
LAB_IDS = {"lx", "ae", "wl", "lf", "st", "vh", "dz", "ld", "lk", "mm", "sb", "li"}  # tg (Tags & Karten) ist seit 2026.11.1b16 fest eingebaut
LAB_NUM = {"lx_diff", "ae_cons", "ae_share", "wl_wind", "lf_days", "vh_dk", "vh_max", "dz_days", "dz_lead", "ld_wait", "ld_min", "lk_hi", "lk_dur"}


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
        s = SafeStore(hass, 1, f"{DOMAIN}_layout")
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
    connection.send_result(msg["id"], {**_general_snapshot(hass), "presence": _presence_snapshot(hass)})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "fenster_heizung/set_general", vol.Required("general"): dict}
)
@websocket_api.async_response
async def ws_set_general(hass: HomeAssistant, connection, msg: dict) -> None:
    _who(connection)
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
    _who(connection)
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
        # Messräume (ms_…) gehören zu keinem Home-Assistant-Eintrag und behalten ihre ID
        return {(k if k.startswith("ms_") else mapping[k]): v for k, v in (d or {}).items() if k in mapping or k.startswith("ms_")}

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
    wmgr = hass.data[DOMAIN].get("wasser")
    if wmgr is not None:
        if isinstance(data.get("modules"), dict):
            await wmgr.async_set_modules(data["modules"])
        if isinstance(data.get("wasser"), dict):
            await wmgr.async_set_cfg(data["wasser"])
    hmgr = hass.data[DOMAIN].get("haus")
    if hmgr is not None and isinstance(data.get("haus"), dict):  # neuere Sicherung: Haus-Werte haben Vorrang
        await hmgr.async_set({k: data["haus"][k] for k in ("energy", "soc", "price", "wx") if k in data["haus"]})
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
    staged = 0
    raw = data.get("stores")
    if isinstance(raw, dict):
        from .backup import stores as _stores
        for full, st in _stores(hass).items():
            key = full[len(DOMAIN) + 1:] if full.startswith(DOMAIN + "_") else full
            if key in ("sponsor", "tibber", "extbak") or len(key) > 20 or not isinstance(raw.get(key), (dict, list)):
                continue
            if await st.async_stage(raw[key]):
                staged += 1
    connection.send_result(
        msg["id"],
        {"rooms": len(mapping), "missing": len(rooms) - len(mapping), "options": done, "options_skipped": skipped_opts, "staged": staged},
    )


def _modules_snapshot(hass: HomeAssistant) -> dict[str, Any]:
    mgr = hass.data.get(DOMAIN, {}).get("wasser")
    if mgr is None:
        return {"modules": clean_modules({}), "wasser": {"ww": clean_wasser({}), "status": {}}}
    snap = mgr.snapshot()
    return {"modules": snap["modules"], "wasser": {"ww": snap["ww"], "status": snap["status"]}}


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
            "haus": _haus_snapshot(hass),
            **_general_snapshot(hass),
            **_modules_snapshot(hass),
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
    if store.get("wetter") is not None:
        store["wetter"]._fc_ts = 0.0  # neue Wetter-Entität: Vorhersage neu holen
    if store.get("haus") is not None and isinstance(msg["layout"].get("wx"), dict):  # Wetterquelle gehört dem Haus
        await store["haus"].async_adopt("layout", store["layout"].get("wx") or {})
    connection.send_result(msg["id"], store["layout"])


def _who(connection) -> None:
    """Name des Benutzers für den Änderungsverlauf."""
    user = getattr(connection, "user", None)
    WHO.set((getattr(user, "name", "") or "Benutzer")[:40])


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/mw_get"})
@websocket_api.async_response
async def ws_mw_get(hass: HomeAssistant, connection, msg: dict) -> None:
    mw = hass.data.get(DOMAIN, {}).get("messwerk")
    if mw is None:
        connection.send_result(msg["id"], {"ready": False})
        return
    await _layout(hass)  # Messräume und Szenen stehen im Layout
    connection.send_result(msg["id"], {"ready": True, **mw.snapshot()})


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/log_get"})
@websocket_api.async_response
async def ws_log_get(hass: HomeAssistant, connection, msg: dict) -> None:
    vl = hass.data.get(DOMAIN, {}).get("verlauf")
    connection.send_result(msg["id"], {"log": vl.snapshot() if vl is not None else []})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/log_undo", vol.Required("id"): int})
@websocket_api.async_response
async def ws_log_undo(hass: HomeAssistant, connection, msg: dict) -> None:
    vl = hass.data.get(DOMAIN, {}).get("verlauf")
    if vl is None:
        connection.send_error(msg["id"], "not_ready", "Verlauf ist noch nicht bereit")
        return
    _who(connection)
    try:
        r = await vl.async_undo(msg["id"])
    except ValueError as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    connection.send_result(msg["id"], {**r, "haus": _haus_snapshot(hass), "layout": hass.data[DOMAIN].get("layout"), **_general_snapshot(hass), **_modules_snapshot(hass)})


def _haus_snapshot(hass: HomeAssistant) -> dict[str, Any] | None:
    mgr = hass.data.get(DOMAIN, {}).get("haus")
    return mgr.snapshot() if mgr is not None and mgr.ready else None


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/haus_get"})
@websocket_api.async_response
async def ws_haus_get(hass: HomeAssistant, connection, msg: dict) -> None:
    connection.send_result(msg["id"], {"haus": _haus_snapshot(hass)})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/haus_set", vol.Required("haus"): dict})
@websocket_api.async_response
async def ws_haus_set(hass: HomeAssistant, connection, msg: dict) -> None:
    _who(connection)
    mgr = hass.data.get(DOMAIN, {}).get("haus")
    if mgr is None or not mgr.ready:
        connection.send_error(msg["id"], "not_ready", "Haus-Werte sind noch nicht bereit")
        return
    await mgr.async_set(msg["haus"])
    connection.send_result(msg["id"], {"haus": mgr.snapshot(), "layout": hass.data[DOMAIN].get("layout"), **_general_snapshot(hass), **_modules_snapshot(hass)})


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


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/get_diag"})
@websocket_api.async_response
async def ws_get_diag(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("diag")
    connection.send_result(msg["id"], mgr.snapshot() if mgr is not None else {"devices": [], "notify": [], "valves": [], "log": []})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/clear_diag"})
@websocket_api.async_response
async def ws_clear_diag(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("diag")
    if mgr is not None:
        mgr.clear()
    connection.send_result(msg["id"], {})


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/get_modules"})
@websocket_api.async_response
async def ws_get_modules(hass: HomeAssistant, connection, msg: dict) -> None:
    connection.send_result(msg["id"], _modules_snapshot(hass))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/bak_list"})
@websocket_api.async_response
async def ws_bak_list(hass: HomeAssistant, connection, msg: dict) -> None:
    from .backup import label, stores
    out = []
    for key, st in stores(hass).items():
        inf = st.info()
        if inf["snaps"]:
            out.append({"key": key, "name": label(key), "snaps": inf["snaps"]})
    out.sort(key=lambda x: x["name"])
    connection.send_result(msg["id"], {"stores": out})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/bak_restore", vol.Required("key"): str, vol.Required("i"): int})
@websocket_api.async_response
async def ws_bak_restore(hass: HomeAssistant, connection, msg: dict) -> None:
    from .backup import stores
    st = stores(hass).get(msg["key"])
    ok = bool(st is not None and await st.async_mark_restore(msg["i"]))
    connection.send_result(msg["id"], {"ok": ok})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/ebk_get"})
@websocket_api.async_response
async def ws_ebk_get(hass: HomeAssistant, connection, msg: dict) -> None:
    from .extbackup import public
    m = hass.data.get(DOMAIN, {}).get("extbak")
    connection.send_result(msg["id"], {"cfg": public(m.cfg)} if m is not None else {"cfg": None})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/ebk_set", vol.Required("cfg"): dict})
@websocket_api.async_response
async def ws_ebk_set(hass: HomeAssistant, connection, msg: dict) -> None:
    m = hass.data.get(DOMAIN, {}).get("extbak")
    connection.send_result(msg["id"], {"cfg": await m.async_set(msg["cfg"])} if m is not None else {"cfg": None})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/ebk_test", vol.Optional("cfg"): dict})
@websocket_api.async_response
async def ws_ebk_test(hass: HomeAssistant, connection, msg: dict) -> None:
    m = hass.data.get(DOMAIN, {}).get("extbak")
    connection.send_result(msg["id"], await m.async_test(msg.get("cfg")) if m is not None else {"ok": False, "msg": "Nicht bereit"})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/ebk_run"})
@websocket_api.async_response
async def ws_ebk_run(hass: HomeAssistant, connection, msg: dict) -> None:
    from .extbackup import public
    m = hass.data.get(DOMAIN, {}).get("extbak")
    if m is None:
        connection.send_result(msg["id"], {"ok": False, "msg": "Nicht bereit"})
        return
    res = await m.run()
    connection.send_result(msg["id"], {"res": res, "cfg": public(m.cfg)})


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/gs_get"})
@websocket_api.async_response
async def ws_gs_get(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("geraete")
    connection.send_result(msg["id"], mgr.snapshot() if mgr is not None else {"ready": False, "devices": [], "hist": {}})


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/gs_remind", vol.Required("id"): str, vol.Required("on"): bool})
@websocket_api.async_response
async def ws_gs_remind(hass: HomeAssistant, connection, msg: dict) -> None:
    """Modul 4 v1.2: Erinnerung „jetzt starten“ zur besten Startzeit setzen oder löschen."""
    mgr = hass.data.get(DOMAIN, {}).get("geraete")
    if mgr is None:
        connection.send_result(msg["id"], {"ok": False, "msg": "Gerätestrom ist noch nicht bereit"})
        return
    res = mgr.set_remind(msg["id"][:16], msg["on"])
    connection.send_result(msg["id"], {**res, **mgr.snapshot()})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/set_modules", vol.Required("modules"): dict})
@websocket_api.async_response
async def ws_set_modules(hass: HomeAssistant, connection, msg: dict) -> None:
    _who(connection)
    mgr = hass.data.get(DOMAIN, {}).get("wasser")
    if mgr is not None:
        await mgr.async_set_modules(msg["modules"])
    connection.send_result(msg["id"], _modules_snapshot(hass))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/set_wasser", vol.Required("ww"): dict})
@websocket_api.async_response
async def ws_set_wasser(hass: HomeAssistant, connection, msg: dict) -> None:
    _who(connection)
    mgr = hass.data.get(DOMAIN, {}).get("wasser")
    if mgr is not None:
        await mgr.async_set_cfg(msg["ww"])
    connection.send_result(msg["id"], _modules_snapshot(hass))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "fenster_heizung/wasser_cmd", vol.Required("cmd"): vol.In(("boost", "circ5", "away")), vol.Required("value"): bool}
)
@websocket_api.async_response
async def ws_wasser_cmd(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("wasser")
    if mgr is not None:
        await mgr.async_command(msg["cmd"], msg["value"])
    connection.send_result(msg["id"], _modules_snapshot(hass))


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/wb_get"})
@websocket_api.async_response
async def ws_wb_get(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("wallbox")
    connection.send_result(msg["id"], mgr.snapshot() if mgr is not None else {"cfg": None, "ok": False})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/wb_set", vol.Required("cfg"): dict})
@websocket_api.async_response
async def ws_wb_set(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("wallbox")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Wallbox ist noch nicht bereit")
        return
    connection.send_result(msg["id"], await mgr.async_set(msg["cfg"]))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/wb_test", vol.Required("ip"): str})
@websocket_api.async_response
async def ws_wb_test(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("wallbox")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Wallbox ist noch nicht bereit")
        return
    connection.send_result(msg["id"], await mgr.async_test(msg["ip"]))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/wb_quick", vol.Required("kind"): vol.In(["", "h1", "goal", "sun"])})
@websocket_api.async_response
async def ws_wb_quick(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("wallbox")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Wallbox ist noch nicht bereit")
        return
    connection.send_result(msg["id"], await mgr.async_quick(msg["kind"]))


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/wb_stats"})
@websocket_api.async_response
async def ws_wb_stats(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("wallbox")
    connection.send_result(msg["id"], mgr.stats() if mgr is not None else {"days": [], "sessions": []})


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/wb_forecast"})
@websocket_api.async_response
async def ws_wb_forecast(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("wallbox")
    connection.send_result(msg["id"], await mgr.forecast() if mgr is not None else {"hours": []})


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/tb_get"})
@websocket_api.async_response
async def ws_tb_get(hass: HomeAssistant, connection, msg: dict) -> None:
    tb = hass.data.get(DOMAIN, {}).get("tibber")
    if tb is not None and tb.connected:
        await tb.async_prices()
    connection.send_result(msg["id"], tb.view() if tb is not None else {"connected": False})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/tb_test", vol.Required("token"): str})
@websocket_api.async_response
async def ws_tb_test(hass: HomeAssistant, connection, msg: dict) -> None:
    tb = hass.data.get(DOMAIN, {}).get("tibber")
    if tb is None:
        connection.send_error(msg["id"], "not_ready", "Tibber ist noch nicht bereit")
        return
    connection.send_result(msg["id"], await tb.async_test(msg["token"]))


@websocket_api.require_admin
@websocket_api.websocket_command({
    vol.Required("type"): "fenster_heizung/tb_set", vol.Optional("token"): str, vol.Optional("home", default=""): str, vol.Optional("res", default="h"): str,
})
@websocket_api.async_response
async def ws_tb_set(hass: HomeAssistant, connection, msg: dict) -> None:
    tb = hass.data.get(DOMAIN, {}).get("tibber")
    if tb is None:
        connection.send_error(msg["id"], "not_ready", "Tibber ist noch nicht bereit")
        return
    await tb.async_set(msg.get("token"), msg["home"], msg["res"])
    wb = hass.data.get(DOMAIN, {}).get("wallbox")
    if wb is not None:
        wb._fc = None
    connection.send_result(msg["id"], tb.view())


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/wx_get"})
@websocket_api.async_response
async def ws_wx_get(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("wetter")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Wetter ist noch nicht bereit")
        return
    await _layout(hass)
    connection.send_result(msg["id"], await mgr.snapshot())


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/wx_set", vol.Required("cfg"): dict})
@websocket_api.async_response
async def ws_wx_set(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("wetter")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Wetter ist noch nicht bereit")
        return
    connection.send_result(msg["id"], await mgr.async_set(msg["cfg"]))


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/mu_get"})
@websocket_api.async_response
async def ws_mu_get(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("muell")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Müllabfuhr ist noch nicht bereit")
        return
    await _layout(hass)
    connection.send_result(msg["id"], await mgr.snapshot())


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/mu_set", vol.Required("cfg"): dict})
@websocket_api.async_response
async def ws_mu_set(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("muell")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Müllabfuhr ist noch nicht bereit")
        return
    connection.send_result(msg["id"], await mgr.async_set(msg["cfg"]))


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/mu_act", vol.Required("act"): vol.In(["done", "undo", "snooze"]), vol.Optional("bin"): str})
@websocket_api.async_response
async def ws_mu_act(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("muell")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Müllabfuhr ist noch nicht bereit")
        return
    act, k = msg["act"], str(msg.get("bin") or "")
    connection.send_result(msg["id"], await (mgr.async_done(k) if act == "done" else mgr.async_undo(k) if act == "undo" else mgr.async_snooze()))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/mu_test"})
@websocket_api.async_response
async def ws_mu_test(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("muell")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Müllabfuhr ist noch nicht bereit")
        return
    connection.send_result(msg["id"], await mgr.async_test())


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/ef_get"})
@websocket_api.async_response
async def ws_ef_get(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("fluss")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Hausfluss ist noch nicht bereit")
        return
    connection.send_result(msg["id"], mgr.snapshot())


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/ef_set", vol.Required("cfg"): dict})
@websocket_api.async_response
async def ws_ef_set(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("fluss")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Hausfluss ist noch nicht bereit")
        return
    connection.send_result(msg["id"], await mgr.async_set(msg["cfg"]))


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/tg_get"})
@websocket_api.async_response
async def ws_tg_get(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("tags")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Tags & Karten ist noch nicht bereit")
        return
    connection.send_result(msg["id"], mgr.snapshot())


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/tg_set", vol.Required("cfg"): dict})
@websocket_api.async_response
async def ws_tg_set(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("tags")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Tags & Karten ist noch nicht bereit")
        return
    connection.send_result(msg["id"], await mgr.async_set(msg["cfg"]))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/tg_act", vol.Required("act"): vol.In(["learn", "stop", "test", "forget"]), vol.Optional("tid"): str, vol.Optional("preset"): dict})
@websocket_api.async_response
async def ws_tg_act(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("tags")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Tags & Karten ist noch nicht bereit")
        return
    act, tid = msg["act"], str(msg.get("tid") or "")
    if act == "test":
        connection.send_result(msg["id"], await mgr.async_test(tid))
    elif act == "forget":
        connection.send_result(msg["id"], mgr.async_clear_unknown(tid))
    else:
        connection.send_result(msg["id"], mgr.async_learn(act == "learn", msg.get("preset")))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/wx_test"})
@websocket_api.async_response
async def ws_wx_test(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("wetter")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Wetter ist noch nicht bereit")
        return
    connection.send_result(msg["id"], await mgr.async_test())


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/sp_get"})
@websocket_api.async_response
async def ws_sp_get(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("solar")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Solar-Prognose ist noch nicht bereit")
        return
    connection.send_result(msg["id"], await mgr.snapshot())


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/labs_get"})
@websocket_api.async_response
async def ws_labs_get(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("labs")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Labs sind noch nicht bereit")
        return
    connection.send_result(msg["id"], await mgr.snapshot())


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/sp_set", vol.Required("cfg"): dict})
@websocket_api.async_response
async def ws_sp_set(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("solar")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Solar-Prognose ist noch nicht bereit")
        return
    connection.send_result(msg["id"], await mgr.async_set(msg["cfg"]))


def _sf(hass: HomeAssistant, connection, msg: dict):
    mgr = hass.data.get(DOMAIN, {}).get("sicherheit")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Sicherheit ist noch nicht bereit")
    return mgr


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/sf_get"})
@websocket_api.async_response
async def ws_sf_get(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = _sf(hass, connection, msg)
    if mgr is not None:
        connection.send_result(msg["id"], await mgr.snapshot())


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/sf_set", vol.Required("cfg"): dict})
@websocket_api.async_response
async def ws_sf_set(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = _sf(hass, connection, msg)
    if mgr is not None:
        connection.send_result(msg["id"], await mgr.async_set(msg["cfg"]))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/sf_test"})
@websocket_api.async_response
async def ws_sf_test(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = _sf(hass, connection, msg)
    if mgr is not None:
        connection.send_result(msg["id"], await mgr.async_test())


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/sf_tested", vol.Optional("ent"): str})
@websocket_api.async_response
async def ws_sf_tested(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = _sf(hass, connection, msg)
    if mgr is not None:
        connection.send_result(msg["id"], await mgr.async_mark_tested(str(msg.get("ent") or "")[:80]))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/sf_press", vol.Required("ent"): str})
@websocket_api.async_response
async def ws_sf_press(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = _sf(hass, connection, msg)
    if mgr is not None:
        connection.send_result(msg["id"], await mgr.async_press_test(msg["ent"]))


def _tm(hass: HomeAssistant, connection, msg: dict):
    mgr = hass.data.get(DOMAIN, {}).get("tablet")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Tablet-Modus ist noch nicht bereit")
    return mgr


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/tm_get"})
@websocket_api.async_response
async def ws_tm_get(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = _tm(hass, connection, msg)
    if mgr is not None:
        connection.send_result(msg["id"], mgr.snapshot())


@websocket_api.websocket_command({
    vol.Required("type"): "fenster_heizung/tm_hello", vol.Required("tid"): str,
    vol.Optional("name"): str, vol.Optional("kind"): str, vol.Optional("size"): str,
})
@websocket_api.async_response
async def ws_tm_hello(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = _tm(hass, connection, msg)
    if mgr is not None:
        r = mgr.hello(msg["tid"], msg.get("name", ""), msg.get("kind", ""), msg.get("size", ""))
        r.update(mgr.snapshot())
        connection.send_result(msg["id"], r)


def _tm_allowed(mgr, connection, msg: dict) -> bool:
    """Änderungen an einem Tablet mit PIN: Administrator oder richtige PIN."""
    t = mgr.tablets.get(msg["tid"])
    if t is None:
        return False
    if not t["pin"] or (connection.user and connection.user.is_admin):
        return True
    return bool(mgr.verify(msg["tid"], msg.get("pin", ""))["ok"])


@websocket_api.websocket_command({
    vol.Required("type"): "fenster_heizung/tm_set", vol.Required("tid"): str, vol.Required("cfg"): dict,
    vol.Optional("name"): str, vol.Optional("pin"): str,
})
@websocket_api.async_response
async def ws_tm_set(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = _tm(hass, connection, msg)
    if mgr is None:
        return
    if not _tm_allowed(mgr, connection, msg):
        connection.send_error(msg["id"], "denied", "PIN falsch oder Tablet unbekannt")
        return
    if "name" in msg:
        mgr.set_name(msg["tid"], msg["name"])
    mgr.set_cfg(msg["tid"], msg["cfg"])
    connection.send_result(msg["id"], mgr.snapshot())


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/tm_check", vol.Required("tid"): str, vol.Required("pin"): str})
@websocket_api.async_response
async def ws_tm_check(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = _tm(hass, connection, msg)
    if mgr is not None:
        connection.send_result(msg["id"], mgr.verify(msg["tid"], msg["pin"]))


@websocket_api.websocket_command({
    vol.Required("type"): "fenster_heizung/tm_pin", vol.Required("tid"): str, vol.Required("pin"): str, vol.Optional("old"): str,
})
@websocket_api.async_response
async def ws_tm_pin(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = _tm(hass, connection, msg)
    if mgr is not None:
        connection.send_result(msg["id"], mgr.set_pin(msg["tid"], msg["pin"], msg.get("old"), False))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/tm_reset", vol.Required("tid"): str})
@websocket_api.async_response
async def ws_tm_reset(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = _tm(hass, connection, msg)
    if mgr is not None:
        mgr.reset_pin(msg["tid"])
        connection.send_result(msg["id"], mgr.snapshot())


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/tm_del", vol.Required("tid"): str})
@websocket_api.async_response
async def ws_tm_del(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = _tm(hass, connection, msg)
    if mgr is not None:
        mgr.remove(msg["tid"])
        connection.send_result(msg["id"], mgr.snapshot())


def _spn(hass: HomeAssistant, connection, msg: dict):
    mgr = hass.data.get(DOMAIN, {}).get("sponsor")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Sponsor-Bereich ist noch nicht bereit")
    return mgr


def _is_admin(connection) -> bool:
    return bool(connection.user and connection.user.is_admin)


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/spn_get"})
@websocket_api.async_response
async def ws_spn_get(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = _spn(hass, connection, msg)
    if mgr is not None:
        connection.send_result(msg["id"], mgr.snapshot(_is_admin(connection)))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/spn_redeem", vol.Required("key"): str})
@websocket_api.async_response
async def ws_spn_redeem(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = _spn(hass, connection, msg)
    if mgr is not None:
        r = mgr.redeem(msg["key"])
        connection.send_result(msg["id"], {"result": r, **mgr.snapshot(True)})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/spn_clear"})
@websocket_api.async_response
async def ws_spn_clear(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = _spn(hass, connection, msg)
    if mgr is not None:
        mgr.clear()
        connection.send_result(msg["id"], mgr.snapshot(True))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/spn_prefs", vol.Required("prefs"): dict})
@websocket_api.async_response
async def ws_spn_prefs(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = _spn(hass, connection, msg)
    if mgr is not None:
        mgr.set_prefs(msg["prefs"])
        connection.send_result(msg["id"], mgr.snapshot(True))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/spn_admin_get"})
@websocket_api.async_response
async def ws_spn_admin_get(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = _spn(hass, connection, msg)
    if mgr is None:
        return
    if not mgr.priv:
        connection.send_result(msg["id"], {"setup": True})
        return
    connection.send_result(msg["id"], mgr.admin_list())


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/spn_admin_setup", vol.Required("priv"): str})
@websocket_api.async_response
async def ws_spn_admin_setup(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = _spn(hass, connection, msg)
    if mgr is not None:
        ok = mgr.setup(msg["priv"])
        connection.send_result(msg["id"], {"ok": ok, **(mgr.admin_list() if ok else {"setup": True})})


@websocket_api.require_admin
@websocket_api.websocket_command({
    vol.Required("type"): "fenster_heizung/spn_admin_act", vol.Required("act"): vol.In(["create", "extend", "revoke", "unrevoke", "danke", "remove", "forget"]),
    vol.Optional("sid"): str, vol.Optional("name"): str, vol.Optional("bis"): str, vol.Optional("note"): str, vol.Optional("on"): bool,
})
@websocket_api.async_response
async def ws_spn_admin_act(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = _spn(hass, connection, msg)
    if mgr is None:
        return
    if not mgr.priv:
        connection.send_error(msg["id"], "no_priv", "Verwaltung ist nicht eingerichtet")
        return
    act, sid, res = msg["act"], msg.get("sid", ""), {"ok": True}
    if act == "create":
        res = mgr.create(msg.get("name", ""), msg.get("bis", ""), msg.get("note", ""), bool(msg.get("on")))
    elif act == "extend":
        res = mgr.extend(sid)
    elif act == "revoke":
        res = {"ok": mgr.revoke(sid, True)}
    elif act == "unrevoke":
        res = {"ok": mgr.revoke(sid, False)}
    elif act == "danke":
        res = {"ok": mgr.set_danke(sid, bool(msg.get("on")))}
    elif act == "remove":
        res = {"ok": mgr.remove(sid)}
    elif act == "forget":
        mgr.forget_priv()
        connection.send_result(msg["id"], {"ok": True, "setup": True})
        return
    connection.send_result(msg["id"], {**res, **mgr.admin_list()})


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/lf_get"})
@websocket_api.async_response
async def ws_lf_get(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("entfeuchter")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Luftentfeuchter ist noch nicht bereit")
        return
    connection.send_result(msg["id"], mgr.snapshot())


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/lf_set", vol.Required("cfg"): dict})
@websocket_api.async_response
async def ws_lf_set(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("entfeuchter")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Luftentfeuchter ist noch nicht bereit")
        return
    connection.send_result(msg["id"], await mgr.async_set(msg["cfg"]))


# Standort setzen, heute aus/an und „Tank geleert“ darf jeder im Haushalt (tägliche Bedienung)
@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/lf_cmd", vol.Required("cmd"): vol.In(["loc", "off_today", "on_today", "tank_empty", "filter_reset", "ask_test"]), vol.Optional("arg", default=""): str, vol.Optional("dev", default=""): str})
@websocket_api.async_response
async def ws_lf_cmd(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = hass.data.get(DOMAIN, {}).get("entfeuchter")
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Luftentfeuchter ist noch nicht bereit")
        return
    connection.send_result(msg["id"], await mgr.async_cmd(msg["cmd"], msg.get("arg") or "", msg.get("dev") or ""))


def async_register_api(hass: HomeAssistant) -> None:
    for command in (
        ws_get_state, ws_set_layout, ws_haus_get, ws_haus_set, ws_log_get, ws_log_undo, ws_mw_get, ws_set_plan, ws_set_presence, ws_get_options, ws_set_options,
        ws_get_general, ws_set_general, ws_get_update, ws_get_learning, ws_restore,
        ws_get_diag, ws_clear_diag, ws_get_modules, ws_bak_list, ws_bak_restore, ws_ebk_get, ws_ebk_set, ws_ebk_test, ws_ebk_run, ws_gs_get, ws_gs_remind, ws_set_modules, ws_set_wasser, ws_wasser_cmd,
        ws_wb_get, ws_wb_set, ws_wb_test, ws_wb_quick, ws_wb_stats, ws_wb_forecast, ws_tb_get, ws_tb_test, ws_tb_set, ws_wx_get, ws_wx_set, ws_wx_test,
        ws_sf_get, ws_sf_set, ws_sf_test, ws_sf_tested, ws_sf_press, ws_sp_get, ws_sp_set, ws_labs_get, ws_mu_get, ws_mu_set, ws_mu_act, ws_mu_test, ws_tg_get, ws_tg_set, ws_tg_act, ws_ef_get, ws_ef_set,
        ws_tm_get, ws_tm_hello, ws_tm_set, ws_tm_check, ws_tm_pin, ws_tm_reset, ws_tm_del, ws_lf_get, ws_lf_set, ws_lf_cmd,
        ws_spn_get, ws_spn_redeem, ws_spn_clear, ws_spn_prefs, ws_spn_admin_get, ws_spn_admin_setup, ws_spn_admin_act,
    ):
        websocket_api.async_register_command(hass, command)
