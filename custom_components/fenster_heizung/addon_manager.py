"""Addon-Verwaltung: Addons finden, installieren, laden, pausieren und deinstallieren.

Ablage (Konzept A + B):
  A  mitgeliefert:  custom_components/fenster_heizung/addons/<id>/   kommt mit jeder Version der Integration
  B  extern:        <config>/strom_waerme_addons/<id>/                 übersteht HACS-Updates (Download folgt in Phase 2)
Liegt dasselbe Addon an beiden Orten, gewinnt die neuere Version.

Ein Addon-Ordner enthält addon.json (Steckbrief), __init__.py mit der Klasse ``Addon`` und www/panel.js für die Seite.
"""
from __future__ import annotations

import importlib
import importlib.util
import json
import logging
import os
import re
import sys
import time
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .addon_api import API_VERSION, AddonCore, AddonError, SWAddon
from .backup import SafeStore
from .const import DOMAIN
from .diag import diag_log

_LOGGER = logging.getLogger(__name__)

BUNDLED_DIR = os.path.join(os.path.dirname(__file__), "addons")
EXT_DIRNAME = "strom_waerme_addons"
URL_PREFIX = "/fenster_heizung_addon"
_ID = re.compile(r"^[a-z][a-z0-9_]{1,30}$")
ERR_MAX = 5           # so viele Fehler ...
ERR_WINDOW = 600      # ... in 10 Minuten pausieren ein Addon
STAGES = ("dev", "beta", "vorab", "stabil")


def vkey(v: Any) -> tuple[int, ...]:
    """2026.11.1b6 → (2026, 11, 1, 6); stabile Versionen zählen als neuer als jede Beta derselben Nummer."""
    m = re.match(r"^\s*(\d+)\.(\d+)(?:\.(\d+))?(?:b(\d+))?", str(v or ""))
    if not m:
        return (0,)
    return (int(m.group(1)), int(m.group(2)), int(m.group(3) or 0), int(m.group(4)) if m.group(4) else 999)


def clean_meta(raw: Any, path: str, src: str) -> dict[str, Any] | None:
    if not isinstance(raw, dict) or not _ID.match(str(raw.get("id", ""))):
        return None
    needs = raw.get("needs") if isinstance(raw.get("needs"), dict) else {}
    return {
        "id": raw["id"], "n": int(raw.get("n") or 0), "name": str(raw.get("name") or raw["id"])[:40],
        "short": str(raw.get("short") or raw.get("name") or raw["id"])[:20], "icon": str(raw.get("icon") or "puzzle")[:20],
        "tag": str(raw.get("tag") or "")[:90], "desc": str(raw.get("desc") or "")[:400],
        "version": str(raw.get("version") or "0.0.0")[:20], "build": int(raw.get("build") or 1),
        "stage": raw.get("stage") if raw.get("stage") in STAGES else "dev",
        "api": int(raw.get("api") or 1), "core_min": str(raw.get("core_min") or ""),
        "needs": {"domains": [str(d) for d in needs.get("domains") or [] if isinstance(d, str)][:6], "text": str(needs.get("text") or "")[:80]},
        "optional": [str(x) for x in raw.get("optional") or [] if isinstance(x, str)][:12],
        "sponsor": bool(raw.get("sponsor")), "network": [str(x) for x in raw.get("network") or []][:8],
        "path": path, "src": src,
    }


def _scan_dir(base: str, src: str) -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    if not os.path.isdir(base):
        return out
    for name in sorted(os.listdir(base)):
        p = os.path.join(base, name)
        f = os.path.join(p, "addon.json")
        if not os.path.isfile(f) or not os.path.isfile(os.path.join(p, "__init__.py")):
            continue
        try:
            with open(f, encoding="utf-8") as fh:
                meta = clean_meta(json.load(fh), p, src)
        except (OSError, ValueError):
            _LOGGER.warning("Addon %s: addon.json ist nicht lesbar", name)
            continue
        if meta and meta["id"] == name:
            js = os.path.join(p, "www", "panel.js")
            meta["js_mtime"] = int(os.path.getmtime(js)) if os.path.isfile(js) else 0
            meta["size"] = sum(os.path.getsize(os.path.join(r, x)) for r, _, fs in os.walk(p) for x in fs if "__pycache__" not in r)
            out[meta["id"]] = meta
    return out


def scan(ext_dir: str) -> dict[str, dict[str, Any]]:
    found = _scan_dir(BUNDLED_DIR, "bundled")
    for k, m in _scan_dir(ext_dir, "ext").items():
        if k not in found or vkey(m["version"]) >= vkey(found[k]["version"]):
            found[k] = m
    return found


class AddonManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_addons")
        self.ext_dir = hass.config.path(EXT_DIRNAME)
        self.avail: dict[str, dict[str, Any]] = {}
        self.inst: dict[str, dict[str, Any]] = {}     # id → {v, src, ts, paused}
        self.kept: list[str] = []                     # deinstalliert, Daten behalten
        self.live: dict[str, tuple[AddonCore, SWAddon]] = {}
        self.err: dict[str, str] = {}
        self._errs: dict[str, list[float]] = {}
        self.core_ver = ""

    # ---- Start / Stopp
    async def async_start(self, core_ver: str) -> None:
        self.core_ver = core_ver
        d = await self._store.async_load()
        if isinstance(d, dict):
            self.inst = {k: v for k, v in (d.get("inst") or {}).items() if isinstance(v, dict) and _ID.match(k)}
            self.kept = [k for k in d.get("kept") or [] if isinstance(k, str)]
        await self.async_rescan()
        for aid, st in list(self.inst.items()):
            if not st.get("paused") and aid in self.avail:
                await self._load(aid)

    async def async_stop(self) -> None:
        for aid in list(self.live):
            await self._unload(aid)

    async def async_rescan(self) -> None:
        self.avail = await self.hass.async_add_executor_job(scan, self.ext_dir)

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"inst": self.inst, "kept": self.kept}, 2)

    # ---- Prüfen
    def check(self, meta: dict[str, Any]) -> tuple[bool, str, list[str]]:
        """(darf installiert werden, Grund, Hinweise)"""
        if meta["api"] > API_VERSION:
            return False, f"Braucht eine neuere Addon-Schnittstelle (API {meta['api']}). Bitte Strom & Wärme aktualisieren.", []
        if meta["core_min"] and vkey(self.core_ver) < vkey(meta["core_min"]):
            return False, f"Braucht Strom & Wärme {meta['core_min']} oder neuer (installiert: {self.core_ver}).", []
        if meta["sponsor"]:
            spn = self.hass.data.get(DOMAIN, {}).get("sponsor")
            if spn is not None and not spn.snapshot().get("active"):
                return False, "Nur für Sponsoren.", []
        hints = []
        for dom in meta["needs"]["domains"]:
            if not any(s.startswith(dom + ".") for s in self.hass.states.async_entity_ids(dom)):
                hints.append(meta["needs"]["text"] or f"Noch keine Entität vom Typ {dom} gefunden.")
        return True, "", hints

    # ---- Laden / Entladen
    async def _import(self, meta: dict[str, Any]) -> Any:
        if meta["src"] == "bundled":
            name = f"{__package__}.addons.{meta['id']}"

            def _imp() -> Any:
                if name in sys.modules:
                    for k in [k for k in sys.modules if k == name or k.startswith(name + ".")]:
                        sys.modules.pop(k, None)
                return importlib.import_module(name)
        else:
            name = f"strom_waerme_addon_{meta['id']}"

            def _imp() -> Any:
                for k in [k for k in sys.modules if k == name or k.startswith(name + ".")]:
                    sys.modules.pop(k, None)
                spec = importlib.util.spec_from_file_location(name, os.path.join(meta["path"], "__init__.py"), submodule_search_locations=[meta["path"]])
                if spec is None or spec.loader is None:
                    raise AddonError("Addon lässt sich nicht laden")
                mod = importlib.util.module_from_spec(spec)
                sys.modules[name] = mod
                spec.loader.exec_module(mod)
                return mod
        return await self.hass.async_add_executor_job(_imp)

    async def _static(self, meta: dict[str, Any]) -> None:
        done = self.hass.data.setdefault(f"{DOMAIN}_addon_static", set())
        www = os.path.join(meta["path"], "www")
        key = (meta["id"], www)
        if key in done or not os.path.isdir(www):
            return
        try:
            await self.hass.http.async_register_static_paths([StaticPathConfig(f"{URL_PREFIX}/{meta['id']}", www, False)])
        except RuntimeError:  # schon registriert (z. B. nach Neuinstallation)
            pass
        done.add(key)

    async def _load(self, aid: str) -> bool:
        meta = self.avail.get(aid)
        if meta is None:
            self.err[aid] = "Dateien des Addons fehlen"
            return False
        ok, why, _ = self.check(meta)
        if not ok:
            self.err[aid] = why
            return False
        core = AddonCore(self.hass, meta)
        try:
            mod = await self._import(meta)
            cls = getattr(mod, "Addon", None)
            if not (isinstance(cls, type) and issubclass(cls, SWAddon)):
                raise AddonError("Addon hat keine Klasse Addon")
            inst = cls(core)
            await inst.async_setup()
            await self._static(meta)
        except Exception as e:  # noqa: BLE001 - ein Addon darf den Kern nie mitreißen
            core.release()
            self.err[aid] = f"Start fehlgeschlagen: {e}"[:200]
            _LOGGER.exception("Addon %s konnte nicht starten", aid)
            diag_log(self.hass, "error", f"Addon {meta['name']}: Start fehlgeschlagen ({e})")
            return False
        self.live[aid] = (core, inst)
        self.err.pop(aid, None)
        return True

    async def _unload(self, aid: str) -> None:
        x = self.live.pop(aid, None)
        if x is None:
            return
        core, inst = x
        try:
            await inst.async_unload()
        except Exception:  # noqa: BLE001
            _LOGGER.exception("Addon %s: Fehler beim Entladen", aid)
        core.release()

    # ---- Aktionen
    async def async_act(self, act: str, aid: str, keep: bool = True) -> None:
        if act == "rescan":
            await self.async_rescan()
            return
        meta = self.avail.get(aid)
        if act == "install":
            if meta is None:
                raise AddonError("Addon nicht gefunden")
            ok, why, _ = self.check(meta)
            if not ok:
                raise AddonError(why)
            self.inst[aid] = {"v": meta["version"], "b": meta["build"], "src": meta["src"], "ts": int(time.time()), "paused": False}
            self.kept = [k for k in self.kept if k != aid]
            self._save()
            if not await self._load(aid):
                raise AddonError(self.err.get(aid, "Start fehlgeschlagen"))
            diag_log(self.hass, "info", f"Addon {meta['name']} installiert (v{meta['version']})")
        elif act == "uninstall":
            if aid not in self.inst:
                raise AddonError("Addon ist nicht installiert")
            x = self.live.get(aid)
            await self._unload(aid)
            core = x[0] if x else AddonCore(self.hass, meta or {"id": aid, "n": 0, "name": aid})
            if x:
                try:
                    await x[1].async_remove(keep)
                except Exception:  # noqa: BLE001
                    _LOGGER.exception("Addon %s: Fehler beim Deinstallieren", aid)
            if not keep:
                if not core._stores:  # noqa: SLF001 - nicht geladen: Speicher trotzdem finden
                    core.store()
                await core.async_remove_stores()
            self.inst.pop(aid, None)
            self.err.pop(aid, None)
            self.kept = [k for k in self.kept if k != aid] + ([aid] if keep else [])
            self._save()
            diag_log(self.hass, "info", f"Addon {(meta or {}).get('name', aid)} deinstalliert ({'Daten behalten' if keep else 'Daten gelöscht'})")
        elif act in ("pause", "resume", "retry"):
            if aid not in self.inst:
                raise AddonError("Addon ist nicht installiert")
            if act == "pause":
                await self._unload(aid)
                self.inst[aid]["paused"] = True
            else:
                self.inst[aid]["paused"] = False
                self._errs.pop(aid, None)
                await self._unload(aid)
                await self.async_rescan()
                if meta := self.avail.get(aid):
                    self.inst[aid].update(v=meta["version"], b=meta["build"], src=meta["src"])
                if not await self._load(aid):
                    self._save()
                    raise AddonError(self.err.get(aid, "Start fehlgeschlagen"))
            self._save()
        else:
            raise AddonError("Unbekannte Aktion")

    async def async_call(self, aid: str, cmd: str, data: dict[str, Any], admin: bool) -> Any:
        x = self.live.get(aid)
        if x is None:
            raise AddonError("Addon ist nicht aktiv")
        try:
            return await x[0].async_call(cmd, data, admin)
        except AddonError:
            raise
        except Exception as e:  # noqa: BLE001
            _LOGGER.exception("Addon %s: Befehl %s fehlgeschlagen", aid, cmd)
            now = time.time()
            l = [t for t in self._errs.get(aid, []) if now - t < ERR_WINDOW] + [now]
            self._errs[aid] = l
            if len(l) >= ERR_MAX:
                await self._unload(aid)
                self.inst[aid]["paused"] = True
                self.err[aid] = "Wegen wiederholter Fehler pausiert"
                self._save()
                diag_log(self.hass, "error", f"Addon {aid}: wegen wiederholter Fehler pausiert")
            raise AddonError(f"Fehler im Addon: {e}"[:160]) from e

    # ---- Für die Oberfläche
    def snapshot(self) -> dict[str, Any]:
        rows = []
        for aid in sorted(set(self.avail) | set(self.inst), key=lambda k: (self.avail.get(k, {}).get("n", 99), k)):
            m = self.avail.get(aid)
            st = self.inst.get(aid)
            live = self.live.get(aid)
            ok, why, hints = self.check(m) if m else (False, "Dateien des Addons fehlen", [])
            status = "off" if not st else "paused" if st.get("paused") else "on" if live else "error"
            summ: dict[str, Any] = {}
            if live:
                try:
                    summ = live[1].summary() or {}
                except Exception:  # noqa: BLE001
                    summ = {}
            row = {k: v for k, v in (m or {"id": aid, "name": aid}).items() if k not in ("path",)}
            row.update(
                status=status, installed=bool(st), can=ok, why=why, hints=hints, err=self.err.get(aid, ""),
                kept=aid in self.kept, since=(st or {}).get("ts", 0), summary=summ,
                update=bool(st and m and (vkey(m["version"]), m["build"]) > (vkey(st.get("v")), int(st.get("b") or 0))),
                js=f"{URL_PREFIX}/{aid}/panel.js?v={(m or {}).get('js_mtime', 0)}" if live and (m or {}).get("js_mtime") else "",
            )
            rows.append(row)
        return {"api": API_VERSION, "core": self.core_ver, "ext_dir": EXT_DIRNAME, "addons": rows}


def _mgr(hass: HomeAssistant) -> AddonManager | None:
    return hass.data.get(DOMAIN, {}).get("addons")


@websocket_api.websocket_command({vol.Required("type"): "fenster_heizung/addons_get"})
@websocket_api.async_response
async def ws_addons_get(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = _mgr(hass)
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Addon-Verwaltung ist noch nicht bereit")
        return
    connection.send_result(msg["id"], mgr.snapshot())


@websocket_api.websocket_command({
    vol.Required("type"): "fenster_heizung/addons_act",
    vol.Required("act"): vol.In(["install", "uninstall", "pause", "resume", "retry", "rescan"]),
    vol.Optional("addon", default=""): str, vol.Optional("keep", default=True): bool,
})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_addons_act(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = _mgr(hass)
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Addon-Verwaltung ist noch nicht bereit")
        return
    try:
        await mgr.async_act(msg["act"], msg["addon"], msg["keep"])
    except AddonError as e:
        connection.send_error(msg["id"], "addon", str(e))
        return
    connection.send_result(msg["id"], mgr.snapshot())


@websocket_api.websocket_command({
    vol.Required("type"): "fenster_heizung/addon_call", vol.Required("addon"): str, vol.Required("cmd"): str, vol.Optional("data", default={}): dict,
})
@websocket_api.async_response
async def ws_addon_call(hass: HomeAssistant, connection, msg: dict) -> None:
    mgr = _mgr(hass)
    if mgr is None:
        connection.send_error(msg["id"], "not_ready", "Addon-Verwaltung ist noch nicht bereit")
        return
    try:
        res = await mgr.async_call(msg["addon"], msg["cmd"], msg["data"], bool(connection.user and connection.user.is_admin))
    except AddonError as e:
        connection.send_error(msg["id"], "addon", str(e))
        return
    connection.send_result(msg["id"], res)


def async_register_addon_api(hass: HomeAssistant) -> None:
    for c in (ws_addons_get, ws_addons_act, ws_addon_call):
        websocket_api.async_register_command(hass, c)
