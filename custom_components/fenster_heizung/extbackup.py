"""Automatische Sicherung auf einen Homeserver (WebDAV, SMB-Freigabe oder Ordner).

Die Datei hat das Format der manuellen Sicherung („Sicherung speichern“) und enthält zusätzlich die Rohdaten
aller Speicher der Integration. Sponsor-Schlüssel, Tibber-Token und die Zugangsdaten dieser Ablage sind nie dabei.
"""
from __future__ import annotations

import asyncio
import json
import logging
import re
import time
import xml.etree.ElementTree as ET
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any
from urllib.parse import quote, unquote, urlparse

from homeassistant.core import HomeAssistant
from homeassistant.helpers.event import async_call_later, async_track_time_change
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .backup import stores as safe_stores
from .const import BACKUP_FORMAT, DOMAIN

_LOGGER = logging.getLogger(__name__)

KINDS = ("webdav", "smb", "folder")
WHENS = ("change", "daily", "weekly")
KEEPS = (7, 14, 30)
NAME_RE = re.compile(r"^fh-sicherung-(\d{4}-\d{2}-\d{2})\.json$")
# Speicher ohne Sponsor-Schlüssel und Zugangsdaten; Statistik getrennt schaltbar
SKIP = {"sponsor", "tibber", "extbak"}
STATS = {"wallbox_stats", "geraete", "labs", "diag"}
NOISE = STATS | {"wasser"}  # ändern sich laufend: lösen „bei Änderung“ nicht aus
SMB_REQ = "smbprotocol==1.15.0"
MIN_GAP_S = 3600
DEBOUNCE_S = 300


class ExtError(Exception):
    pass


def default_cfg() -> dict[str, Any]:
    return {"on": False, "kind": "webdav", "url": "", "host": "", "share": "", "path": "", "folder": "", "user": "", "pw": "",
            "verify": True, "when": "daily", "time": "03:30", "keep": 14,
            "inc": {"settings": True, "rooms": True, "stats": True, "bg": True}, "last": {}}


def _s(v: Any, n: int) -> str:
    return v.strip()[:n] if isinstance(v, str) else ""


def _path(v: Any, n: int = 200) -> str:
    p = _s(v, n).replace("\\", "/")
    parts = [x for x in p.split("/") if x and x not in (".", "..")]
    return "/".join(parts)


def clean_cfg(raw: Any, old: dict[str, Any] | None = None) -> dict[str, Any]:
    raw = raw if isinstance(raw, dict) else {}
    d = default_cfg()
    old = old or d
    url = _s(raw.get("url"), 300)
    if url and not re.match(r"^https?://[^\s/]+", url, re.I):
        url = ""
    host = _s(raw.get("host"), 100)
    if not re.match(r"^[A-Za-z0-9._:\[\]-]{1,100}$", host):
        host = ""
    share = re.sub(r'[\\/:*?"<>|]', "", _s(raw.get("share"), 80))
    folder = _s(raw.get("folder"), 200).replace("\\", "/")
    if not folder.startswith("/") or ".." in folder.split("/"):
        folder = ""
    t = _s(raw.get("time"), 5)
    inc = raw.get("inc") if isinstance(raw.get("inc"), dict) else {}
    pw = raw.get("pw")
    pw = pw[:200] if isinstance(pw, str) and pw else (old.get("pw", "") if not raw.get("clear_pw") else "")
    last = old.get("last") if isinstance(old.get("last"), dict) else {}
    return {
        "on": bool(raw.get("on", False)),
        "kind": raw.get("kind") if raw.get("kind") in KINDS else "webdav",
        "url": url.rstrip("/"), "host": host, "share": share, "path": _path(raw.get("path")), "folder": folder.rstrip("/") if folder != "/" else folder,
        "user": _s(raw.get("user"), 100), "pw": pw, "verify": bool(raw.get("verify", True)),
        "when": raw.get("when") if raw.get("when") in WHENS else "daily",
        "time": t if re.fullmatch(r"([01]\d|2[0-3]):[0-5]\d", t) else "03:30",
        "keep": raw.get("keep") if raw.get("keep") in KEEPS else 14,
        "inc": {k: bool(inc.get(k, d["inc"][k])) for k in d["inc"]},
        "last": last,
    }


def public(cfg: dict[str, Any]) -> dict[str, Any]:
    out = {k: v for k, v in cfg.items() if k != "pw"}
    out["pw_set"] = bool(cfg.get("pw"))
    return out


def configured(cfg: dict[str, Any]) -> str:
    """Leer, wenn alles da ist, sonst der fehlende Teil als Text."""
    k = cfg["kind"]
    if k == "webdav" and not cfg["url"]:
        return "Adresse fehlt"
    if k == "smb" and not (cfg["host"] and cfg["share"]):
        return "Server und Freigabe fehlen"
    if k == "folder" and not cfg["folder"]:
        return "Ordner fehlt"
    return ""


# --------------------------------------------------------------------------- Ziele
class DavTarget:
    def __init__(self, hass: HomeAssistant, cfg: dict[str, Any]) -> None:
        self.hass, self.cfg = hass, cfg

    async def _req(self, method: str, name: str = "", **kw: Any) -> tuple[int, bytes]:
        import aiohttp
        from homeassistant.helpers.aiohttp_client import async_get_clientsession
        url = self.cfg["url"] + "/" + (quote(name) if name else "")
        sess = async_get_clientsession(self.hass, verify_ssl=self.cfg["verify"])
        auth = aiohttp.BasicAuth(self.cfg["user"], self.cfg["pw"]) if self.cfg["user"] else None
        try:
            async with sess.request(method, url, auth=auth, timeout=aiohttp.ClientTimeout(total=60), **kw) as r:
                return r.status, await r.read()
        except aiohttp.ClientSSLError as e:
            raise ExtError("Zertifikat nicht vertrauenswürdig (Prüfung in den Einstellungen ausschalten)") from e
        except (aiohttp.ClientError, asyncio.TimeoutError, OSError) as e:
            raise ExtError(f"Server nicht erreichbar ({type(e).__name__})") from e

    @staticmethod
    def _chk(st: int) -> None:
        if st in (401, 403):
            raise ExtError("Anmeldung abgelehnt (Benutzer oder Passwort)")
        if st >= 400:
            raise ExtError(f"Server antwortet mit Fehler {st}")

    async def _mkdirs(self) -> None:
        import aiohttp
        from homeassistant.helpers.aiohttp_client import async_get_clientsession
        u = urlparse(self.cfg["url"])
        segs = [s for s in u.path.split("/") if s]
        sess = async_get_clientsession(self.hass, verify_ssl=self.cfg["verify"])
        auth = aiohttp.BasicAuth(self.cfg["user"], self.cfg["pw"]) if self.cfg["user"] else None
        cur = f"{u.scheme}://{u.netloc}"
        for s in segs:
            cur += "/" + s
            async with sess.request("MKCOL", cur + "/", auth=auth, timeout=aiohttp.ClientTimeout(total=30)) as r:
                if r.status in (401, 403):
                    raise ExtError("Anmeldung abgelehnt (Benutzer oder Passwort)")

    async def put(self, name: str, data: bytes) -> None:
        st, _ = await self._req("PUT", name, data=data)
        if st in (404, 409):
            await self._mkdirs()
            st, _ = await self._req("PUT", name, data=data)
        self._chk(st)

    async def list(self) -> list[tuple[str, int]]:
        st, body = await self._req("PROPFIND", "", headers={"Depth": "1"})
        self._chk(st)
        out: list[tuple[str, int]] = []
        try:
            root = ET.fromstring(body)
        except ET.ParseError:
            return out
        for resp in root.iter():
            if not resp.tag.endswith("}response") and resp.tag != "response":
                continue
            href, size = "", 0
            for e in resp.iter():
                if e.tag.endswith("href") and e.text and not href:
                    href = e.text
                elif e.tag.endswith("getcontentlength") and e.text:
                    try:
                        size = int(e.text)
                    except ValueError:
                        pass
            nm = unquote(href).rstrip("/").split("/")[-1]
            if nm:
                out.append((nm, size))
        return out

    async def delete(self, name: str) -> None:
        st, _ = await self._req("DELETE", name)
        if st not in (404,):
            self._chk(st)


class DirTarget:
    def __init__(self, hass: HomeAssistant, cfg: dict[str, Any]) -> None:
        self.hass, self.cfg = hass, cfg

    def _dir(self) -> Path:
        p = self.cfg["folder"]
        if not self.hass.config.is_allowed_path(p):
            raise ExtError("Dieser Ordner ist für Home Assistant nicht freigegeben (allowlist_external_dirs), zum Beispiel /media oder /share nutzen")
        return Path(p)

    async def put(self, name: str, data: bytes) -> None:
        d = self._dir()

        def job() -> None:
            d.mkdir(parents=True, exist_ok=True)
            tmp = d / (name + ".tmp")
            tmp.write_bytes(data)
            tmp.replace(d / name)
        try:
            await self.hass.async_add_executor_job(job)
        except OSError as e:
            raise ExtError(f"Ordner nicht beschreibbar ({e.strerror or type(e).__name__})") from e

    async def list(self) -> list[tuple[str, int]]:
        d = self._dir()

        def job() -> list[tuple[str, int]]:
            return [(p.name, p.stat().st_size) for p in d.iterdir() if p.is_file()] if d.is_dir() else []
        try:
            return await self.hass.async_add_executor_job(job)
        except OSError as e:
            raise ExtError(f"Ordner nicht lesbar ({e.strerror or type(e).__name__})") from e

    async def delete(self, name: str) -> None:
        d = self._dir()
        await self.hass.async_add_executor_job(lambda: (d / name).unlink(missing_ok=True))


class SmbTarget:
    def __init__(self, hass: HomeAssistant, cfg: dict[str, Any]) -> None:
        self.hass, self.cfg = hass, cfg
        self._mod: Any = None

    async def _lib(self) -> Any:
        if self._mod is not None:
            return self._mod
        try:
            import smbclient  # noqa: F401
        except ImportError:
            try:
                from homeassistant.requirements import async_process_requirements
                await async_process_requirements(self.hass, DOMAIN, [SMB_REQ])
            except Exception as e:  # noqa: BLE001
                raise ExtError("Das Paket für SMB konnte nicht installiert werden (Internetzugang von Home Assistant nötig)") from e
        import smbclient
        self._mod = smbclient
        return smbclient

    def _base(self) -> str:
        c = self.cfg
        b = "\\\\" + c["host"] + "\\" + c["share"]
        return b + ("\\" + c["path"].replace("/", "\\") if c["path"] else "")

    async def _run(self, fn: Any) -> Any:
        smb = await self._lib()
        c = self.cfg

        def job() -> Any:
            try:
                smb.register_session(c["host"], username=c["user"] or None, password=c["pw"] or None, connection_timeout=15)
                return fn(smb, self._base())
            except ExtError:
                raise
            except Exception as e:  # noqa: BLE001 - smbprotocol wirft viele Typen
                m = str(e).lower()
                if "logon" in m or "denied" in m or "password" in m or "STATUS_ACCESS" in str(e):
                    raise ExtError("Anmeldung abgelehnt (Benutzer, Passwort oder Rechte)") from e
                if "bad network name" in m or "not found" in m:
                    raise ExtError("Freigabe oder Ordner nicht gefunden") from e
                raise ExtError(f"SMB-Fehler ({type(e).__name__})") from e
        return await self.hass.async_add_executor_job(job)

    async def put(self, name: str, data: bytes) -> None:
        def fn(smb: Any, base: str) -> None:
            if self.cfg["path"]:
                smb.makedirs(base, exist_ok=True)
            with smb.open_file(base + "\\" + name, mode="wb") as f:
                f.write(data)
        await self._run(fn)

    async def list(self) -> list[tuple[str, int]]:
        def fn(smb: Any, base: str) -> list[tuple[str, int]]:
            return [(e.name, e.stat().st_size) for e in smb.scandir(base) if e.is_file()]
        return await self._run(fn)

    async def delete(self, name: str) -> None:
        def fn(smb: Any, base: str) -> None:
            try:
                smb.remove(base + "\\" + name)
            except FileNotFoundError:
                pass
        await self._run(fn)


def target(hass: HomeAssistant, cfg: dict[str, Any]) -> Any:
    return {"webdav": DavTarget, "smb": SmbTarget, "folder": DirTarget}[cfg["kind"]](hass, cfg)


# --------------------------------------------------------------------------- Inhalt
def _store_key(full: str) -> str:
    return full[len(DOMAIN) + 1:] if full.startswith(DOMAIN + "_") else full


def _without_bg(key: str, data: Any) -> Any:
    if key == "sicherheit" and isinstance(data, dict):
        cfg = data.get("cfg")
        if isinstance(cfg, dict) and isinstance(cfg.get("plan"), dict) and cfg["plan"].get("bg"):
            data = {**data, "cfg": {**cfg, "plan": {**cfg["plan"], "bg": ""}}}
    return data


async def build_payload(hass: HomeAssistant, inc: dict[str, bool], version: str = "") -> dict[str, Any]:
    from .api import _current_options, _layout
    store = hass.data.get(DOMAIN, {})
    out: dict[str, Any] = {"app": DOMAIN, "format": BACKUP_FORMAT, "version": version, "created": dt_util.now().isoformat(timespec="seconds"), "auto": True, "rooms": {}}
    entries = hass.config_entries.async_entries(DOMAIN)
    if inc.get("rooms", True):
        out["layout"] = await _layout(hass)
        plans, rooms = {}, {}
        for e in entries:
            ctrl = getattr(e, "runtime_data", None)
            rooms[e.entry_id] = {"name": e.title, "options": _current_options(e)}
            if ctrl is not None:
                try:
                    plans[e.entry_id] = ctrl.plan_dict()
                except Exception:  # noqa: BLE001
                    pass
        out["rooms"], out["plans"] = rooms, plans
    if inc.get("settings", True):
        pm, gm, wm = store.get("presence"), store.get("general"), store.get("wasser")
        if pm is not None:
            out["presence"] = pm.data
        if gm is not None:
            out["general"] = gm._data()
        if wm is not None:
            out["modules"], out["wasser"] = wm.modules, wm.cfg
    raw: dict[str, Any] = {}
    for full, st in safe_stores(hass).items():
        key = _store_key(full)
        if key in SKIP:
            continue
        is_stat = key in STATS or len(key) > 20      # Raum-Speicher (Entry-ID) enthalten den Verlauf
        if (is_stat and not inc.get("stats", True)) or (not is_stat and not inc.get("settings", True) and not inc.get("rooms", True)):
            continue
        cur = st.current()
        if cur is None:
            continue
        raw[key] = cur if inc.get("bg", True) else _without_bg(key, cur)
    if raw:
        out["stores"] = raw
    return out


# --------------------------------------------------------------------------- Manager
class ExtBackup:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = Store(hass, 1, f"{DOMAIN}_extbak")   # bewusst kein SafeStore: enthält das Passwort
        self.cfg = default_cfg()
        self._unsub_t: Any = None
        self._unsub_p: Any = None
        self._busy = asyncio.Lock()
        self._version = ""

    async def async_start(self) -> None:
        self.cfg = clean_cfg(await self._store.async_load(), None)
        try:
            self._version = json.loads((Path(__file__).parent / "manifest.json").read_text()).get("version", "")
        except (OSError, ValueError):
            self._version = ""
        self._arm()
        last = (self.cfg.get("last") or {}).get("t", 0)
        if self.cfg["on"] and self.cfg["when"] != "change" and time.time() - last > 26 * 3600 * (7 if self.cfg["when"] == "weekly" else 1):
            self._unsub_p = async_call_later(self.hass, 180, self._poke_cb)

    def async_stop(self) -> None:
        for a in ("_unsub_t", "_unsub_p"):
            u = getattr(self, a)
            if u:
                u()
                setattr(self, a, None)

    def _save(self) -> None:
        self._store.async_delay_save(lambda: self.cfg, 2)

    def _arm(self) -> None:
        if self._unsub_t:
            self._unsub_t()
            self._unsub_t = None
        c = self.cfg
        if c["on"] and c["when"] in ("daily", "weekly") and not configured(c):
            h, m = (int(x) for x in c["time"].split(":"))
            self._unsub_t = async_track_time_change(self.hass, self._tick, hour=h, minute=m, second=0)

    async def _tick(self, now: datetime) -> None:
        if self.cfg["when"] == "weekly" and now.weekday() != 6:
            return
        await self.run()

    async def _poke_cb(self, _now: Any) -> None:
        self._unsub_p = None
        await self.run()

    def poke(self, key: str = "") -> None:
        """Ein Speicher hat sich geändert: „bei Änderung“ lädt nach einer Ruhezeit hoch (höchstens einmal pro Stunde)."""
        c = self.cfg
        if not c["on"] or c["when"] != "change" or configured(c) or _store_key(key) in NOISE or _store_key(key) in SKIP:
            return
        if self._unsub_p:
            self._unsub_p()
        wait = max(DEBOUNCE_S, MIN_GAP_S - (time.time() - (c.get("last") or {}).get("t", 0)))
        self._unsub_p = async_call_later(self.hass, wait, self._poke_cb)

    # ---- API
    async def async_set(self, raw: Any) -> dict[str, Any]:
        keep_last = self.cfg.get("last")
        self.cfg = clean_cfg(raw, self.cfg)
        self.cfg["last"] = keep_last if isinstance(keep_last, dict) else {}
        self._save()
        self._arm()
        return public(self.cfg)

    async def async_test(self, raw: Any = None) -> dict[str, Any]:
        cfg = clean_cfg(raw, self.cfg) if isinstance(raw, dict) else self.cfg
        miss = configured(cfg)
        if miss:
            return {"ok": False, "msg": miss}
        try:
            t = target(self.hass, cfg)
            await t.put("fh-test.txt", b"Strom und Waerme: Verbindungstest")
            await t.delete("fh-test.txt")
        except ExtError as e:
            return {"ok": False, "msg": str(e)}
        except Exception as e:  # noqa: BLE001
            _LOGGER.exception("Verbindungstest der Ablage fehlgeschlagen")
            return {"ok": False, "msg": f"Unerwarteter Fehler ({type(e).__name__})"}
        return {"ok": True, "msg": "Verbindung funktioniert, Testdatei geschrieben und wieder gelöscht"}

    async def run(self) -> dict[str, Any]:
        async with self._busy:
            c = self.cfg
            miss = configured(c)
            res: dict[str, Any] = {"t": time.time(), "ts": dt_util.now().isoformat(timespec="seconds")}
            if miss:
                res.update(ok=False, msg=miss)
            else:
                try:
                    payload = await build_payload(self.hass, c["inc"], self._version)
                    data = json.dumps(payload, ensure_ascii=False, default=str).encode("utf-8")
                    name = f"fh-sicherung-{dt_util.now().date().isoformat()}.json"
                    t = target(self.hass, c)
                    await t.put(name, data)
                    files = await t.list()
                    cutoff = dt_util.now().date() - timedelta(days=c["keep"])
                    for nm, _sz in files:
                        m = NAME_RE.match(nm)
                        if m and date.fromisoformat(m.group(1)) < cutoff:
                            await t.delete(nm)
                    files = [(n, s) for n, s in await t.list() if NAME_RE.match(n)]
                    files.sort(reverse=True)
                    res.update(ok=True, msg="Sicherung hochgeladen", size=len(data), name=name, files=[{"n": n, "s": s} for n, s in files[:10]], count=len(files))
                except ExtError as e:
                    res.update(ok=False, msg=str(e))
                except Exception as e:  # noqa: BLE001
                    _LOGGER.exception("Sicherung auf die Ablage fehlgeschlagen")
                    res.update(ok=False, msg=f"Unerwarteter Fehler ({type(e).__name__})")
            c["last"] = res
            self._save()
            return res
