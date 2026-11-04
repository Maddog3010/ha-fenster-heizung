"""Addon-Verwaltung: Addons finden, installieren, laden, pausieren, aktualisieren und deinstallieren.

Ablage (Konzept A + B):
  A  mitgeliefert:  custom_components/fenster_heizung/addons/<id>/   kommt mit jeder Version der Integration
  B  extern:        <config>/strom_waerme_addons/<id>/                 übersteht HACS-Updates, kommt aus dem Katalog
                    (Repository Maddog3010/strom-waerme-addons, signiert, siehe addon_repo.py)
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

from . import addon_repo as R
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
CHECK_FIRST = 90      # Katalog 90 Sekunden nach dem Start prüfen ...
CHECK_EVERY = 86400   # ... und danach einmal am Tag
DL_TIMEOUT = 60
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
        if meta and meta["id"] == name:  # <id>.old und .neu_<id> fallen hier heraus
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
        self.remote: dict[str, dict[str, Any]] = {}  # Katalog aus GitHub
        self.cat: dict[str, Any] = {"ok": None, "err": "", "checked": 0, "ts": ""}
        self.olds: dict[str, str] = {}               # id → Version, die als <id>.old bereitliegt
        self.busy: dict[str, str] = {}               # id → was gerade passiert (für die Oberfläche)
        self._unsubs: list[Any] = []

    # ---- Start / Stopp
    async def async_start(self, core_ver: str) -> None:
        self.core_ver = core_ver
        d = await self._store.async_load()
        if isinstance(d, dict):
            self.inst = {k: v for k, v in (d.get("inst") or {}).items() if isinstance(v, dict) and _ID.match(k)}
            self.kept = [k for k in d.get("kept") or [] if isinstance(k, str)]
            self.remote = {k: v for k, v in (d.get("remote") or {}).items() if isinstance(v, dict) and _ID.match(k) and v.get("url", "").startswith(R.DL_PREFIX)}
            if isinstance(d.get("cat"), dict):
                self.cat.update({k: d["cat"][k] for k in ("ok", "err", "checked", "ts") if k in d["cat"]})
        await self.async_rescan()
        for aid, st in list(self.inst.items()):
            if not st.get("paused") and aid in self.avail:
                await self._load(aid)
        from homeassistant.helpers.event import async_call_later, async_track_time_interval
        from datetime import timedelta

        self._unsubs.append(async_call_later(self.hass, CHECK_FIRST, self._check_cb))
        self._unsubs.append(async_track_time_interval(self.hass, self._check_cb, timedelta(seconds=CHECK_EVERY)))

    async def async_stop(self) -> None:
        for u in self._unsubs:
            try:
                u()
            except Exception:  # noqa: BLE001
                pass
        self._unsubs.clear()
        for aid in list(self.live):
            await self._unload(aid)

    async def async_rescan(self) -> None:
        def _scan() -> tuple[dict[str, dict[str, Any]], dict[str, str]]:
            av = scan(self.ext_dir)
            olds = {}
            if os.path.isdir(self.ext_dir):
                for n in os.listdir(self.ext_dir):
                    if n.endswith(".old") and _ID.match(n[:-4]):
                        v = R.old_version(self.ext_dir, n[:-4])
                        if v:
                            olds[n[:-4]] = v
            return av, olds

        self.avail, self.olds = await self.hass.async_add_executor_job(_scan)

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"inst": self.inst, "kept": self.kept, "remote": self.remote, "cat": self.cat}, 2)

    # ---- Katalog aus GitHub
    async def _check_cb(self, _now: Any = None) -> None:
        try:
            await self.async_check()
        except Exception:  # noqa: BLE001 - ohne GitHub läuft alles weiter wie bisher
            _LOGGER.debug("Addon-Katalog: Prüfung fehlgeschlagen", exc_info=True)

    async def _get(self, url: str, limit: int) -> bytes:
        import aiohttp
        from homeassistant.helpers.aiohttp_client import async_get_clientsession

        sess = async_get_clientsession(self.hass)
        try:
            async with sess.get(url, timeout=aiohttp.ClientTimeout(total=DL_TIMEOUT)) as r:
                if r.status != 200:
                    raise R.RepoError(f"GitHub antwortet mit {r.status}")
                buf = bytearray()  # content.read(n) liefert nur, was gerade da ist: bis zum Ende lesen
                async for chunk in r.content.iter_chunked(65536):
                    buf.extend(chunk)
                    if len(buf) > limit:
                        break
                data = bytes(buf)
        except R.RepoError:
            raise
        except Exception as e:  # noqa: BLE001
            raise R.RepoError("GitHub ist nicht erreichbar") from e
        if len(data) > limit:
            raise R.RepoError("Datei ist zu groß")
        return data

    async def async_check(self) -> dict[str, Any]:
        """Katalog laden und Unterschrift prüfen. Bei Fehlern bleibt der letzte gültige Katalog stehen."""
        from .sponsor import PUBLIC_KEY

        self.cat["checked"] = int(time.time())
        try:
            raw = await self._get(R.CATALOG_URL, R.CATALOG_MAX)
            sig = (await self._get(R.SIG_URL, 400)).decode("ascii", "replace")
            c = R.parse_catalog(raw, sig, PUBLIC_KEY, clean_meta)
        except R.RepoError as e:
            self.cat.update(ok=False, err=str(e))
            self._save()
            return self.cat
        self.remote = c["addons"]
        self.cat.update(ok=True, err="", ts=c["ts"])
        self._save()
        return self.cat

    def _newer(self, a: dict[str, Any] | None, b: dict[str, Any] | None) -> bool:
        """Ist a neuer als b (Version, dann Build)?"""
        if not a:
            return False
        if not b:
            return True
        return (vkey(a.get("version") or a.get("v")), int(a.get("build") or a.get("b") or 0)) > (vkey(b.get("version") or b.get("v")), int(b.get("build") or b.get("b") or 0))

    async def _install_remote(self, aid: str) -> None:
        e = self.remote.get(aid)
        if not e:
            raise AddonError("Addon ist nicht im Katalog")
        ok, why, _ = self.check(e)
        if not ok:
            raise AddonError(why)
        try:
            self.busy[aid] = "Wird geladen"
            data = await self._get(e["url"], R.ZIP_MAX)
            self.busy[aid] = "Wird geprüft"
            R.check_zip(data, e)
            path = await self.hass.async_add_executor_job(R.extract, data, aid, self.ext_dir)

            def _meta() -> dict[str, Any] | None:
                with open(os.path.join(path, "addon.json"), encoding="utf-8") as fh:
                    return clean_meta(json.load(fh), path, "ext")

            m = await self.hass.async_add_executor_job(_meta)
            if not m or m["id"] != aid or m["version"] != e["version"] or m["build"] != e["build"]:
                raise R.RepoError("Inhalt passt nicht zum Katalog")
        except R.RepoError as err:
            self.busy.pop(aid, None)
            await self.hass.async_add_executor_job(lambda: __import__("shutil").rmtree(os.path.join(self.ext_dir, f".neu_{aid}"), ignore_errors=True))
            raise AddonError(str(err)) from err
        self.busy[aid] = "Wird installiert"
        await self._unload(aid)
        had = await self.hass.async_add_executor_job(R.swap_in, path, self.ext_dir, aid)
        await self.async_rescan()
        self.inst[aid] = {"v": e["version"], "b": e["build"], "src": "ext", "ts": int(time.time()), "paused": False}
        self.kept = [k for k in self.kept if k != aid]
        ok = await self._load(aid)
        self.busy.pop(aid, None)
        if not ok:
            why = self.err.get(aid, "Start fehlgeschlagen")
            if had:
                await self.hass.async_add_executor_job(R.roll_back, self.ext_dir, aid)
            else:
                await self.hass.async_add_executor_job(R.remove, self.ext_dir, aid)
            await self.async_rescan()
            if aid in self.avail and await self._load(aid):
                m = self.avail[aid]
                self.inst[aid].update(v=m["version"], b=m["build"], src=m["src"])
                self._save()
                raise AddonError(f"Die neue Version startete nicht ({why}). Die bisherige Version läuft wieder.")
            self.inst.pop(aid, None)
            self._save()
            raise AddonError(why)
        self._save()
        diag_log(self.hass, "info", f"Addon {e['name']} v{e['version']} Build {e['build']} aus dem Katalog installiert")

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
        key = (meta["id"], meta["src"])
        if key in done or not os.path.isdir(www):
            return
        try:
            await self.hass.http.async_register_static_paths([StaticPathConfig(f"{URL_PREFIX}/{meta['src']}/{meta['id']}", www, False)])
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
        if act == "check":
            await self.async_check()
            return
        if act in ("install", "update") and self._newer(self.remote.get(aid), meta):
            await self._install_remote(aid)
            return
        if act == "update":
            act = "retry"  # neuere mitgelieferte Version: nur neu laden
        if act == "rollback":
            if aid not in self.olds:
                raise AddonError("Keine frühere Version vorhanden")
            await self._unload(aid)
            await self.hass.async_add_executor_job(R.roll_back, self.ext_dir, aid)
            await self.async_rescan()
            m = self.avail.get(aid)
            if m and aid in self.inst:
                self.inst[aid].update(v=m["version"], b=m["build"], src=m["src"], paused=False)
            self._save()
            if not await self._load(aid):
                raise AddonError(self.err.get(aid, "Start fehlgeschlagen"))
            diag_log(self.hass, "info", f"Addon {aid}: zurück zu v{m['version'] if m else '?'}")
            return
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
            if (meta or {}).get("src") == "ext" or aid in self.olds:
                await self.hass.async_add_executor_job(R.remove, self.ext_dir, aid)
                await self.async_rescan()
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
        ids = set(self.avail) | set(self.inst) | set(self.remote)
        for aid in sorted(ids, key=lambda k: ((self.avail.get(k) or self.remote.get(k) or {}).get("n", 99), k)):
            m = self.avail.get(aid)
            rm = self.remote.get(aid)
            st = self.inst.get(aid)
            live = self.live.get(aid)
            base = m or rm
            ok, why, hints = self.check(base) if base else (False, "Dateien des Addons fehlen", [])
            status = "off" if not st else "paused" if st.get("paused") else "on" if live else "error"
            summ: dict[str, Any] = {}
            if live:
                try:
                    summ = live[1].summary() or {}
                except Exception:  # noqa: BLE001
                    summ = {}
            if not st and rm and self._newer(rm, m):  # nicht installiert: die neueste Version zeigen, die man bekommen würde
                base = rm
            row = {k: v for k, v in (base or {"id": aid, "name": aid}).items() if k not in ("path", "url", "sha256")}
            upd_r = bool(st and self._newer(rm, st))
            upd_l = bool(st and m and self._newer(m, st))
            row.update(
                status=status, installed=bool(st), can=ok, why=why, hints=hints, err=self.err.get(aid, ""),
                kept=aid in self.kept, since=(st or {}).get("ts", 0), summary=summ,
                cur=f"{st.get('v')} Build {st.get('b') or 1}" if st else "",
                update=upd_r or upd_l, upd_src="remote" if upd_r else "local" if upd_l else "",
                remote={"version": rm["version"], "build": rm["build"], "notes": rm.get("notes", []), "size": rm.get("dl_size", 0), "date": rm.get("date", ""), "stage": rm.get("stage")} if rm else None,
                src="remote" if base is rm else (m or {}).get("src") or "remote", old=self.olds.get(aid, ""), busy=self.busy.get(aid, ""),
                js=f"{URL_PREFIX}/{m['src']}/{aid}/panel.js?v={m.get('js_mtime', 0)}" if live and m and m.get("js_mtime") else "",
            )
            rows.append(row)
        return {"api": API_VERSION, "core": self.core_ver, "ext_dir": EXT_DIRNAME, "addons": rows,
                "cat": {**self.cat, "repo": R.REPO, "count": len(self.remote)}}


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
    vol.Required("act"): vol.In(["install", "update", "rollback", "check", "uninstall", "pause", "resume", "retry", "rescan"]),
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
