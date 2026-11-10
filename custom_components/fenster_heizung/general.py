"""Allgemeine Einstellungen: Sommermodus, Wetter-Anpassung, Update-Hinweis."""
from __future__ import annotations

import logging
import re
import time
from datetime import timedelta
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .backup import SafeStore
from .const import DOMAIN, GITHUB_REPO, UPDATE_CACHE_SECONDS

_LOGGER = logging.getLogger(__name__)

SUMMER_MODES = ("off", "auto", "on")
DEFAULTS: dict[str, Any] = {
    "updates": True,
    "summer": {"mode": "auto", "temp": 18.0, "days": 3},
    "wxadj": {"on": False, "mild": 12.0, "down": 1.0, "frost": 0.0, "up": 1.0},
    "pv": {"sensor": "", "sign": "export", "reserve": 200, "delay": 3, "minrun": 10,
           "soc_sensor": "", "soc_min": 80, "price": 32.0, "feed": 8.0,
           "price_mode": "fix", "price_sensor": "",
           "feed_mode": "fix", "feed_sensor": ""},
    "valve": {"warn": 20, "days": 7, "notify": "", "batsrc": {}},
}
_ENTITY = re.compile(r"^sensor\.[a-z0-9_]+$")
_NOTIFY = re.compile(r"^notify\.[a-z0-9_]+$")
_BATSRC = re.compile(r"^(sensor|binary_sensor)\.[a-z0-9_]+$")
_DEVICE = re.compile(r"^(climate|binary_sensor)\.[a-z0-9_]+$")


def _sensor(val: Any) -> str:
    return val if isinstance(val, str) and _ENTITY.match(val) else ""


def _number(val: Any, lo: float, hi: float, default: float, decimals: int = 1) -> float:
    if isinstance(val, str):
        val = val.strip().replace(",", ".")
    try:
        v = float(val)
    except (TypeError, ValueError):
        return default
    if v != v or v in (float("inf"), float("-inf")):
        return default
    return round(min(max(v, lo), hi), decimals)


def _batsrc(raw: Any) -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    if not isinstance(raw, dict):
        return out
    for key, val in list(raw.items())[:300]:
        if not (isinstance(key, str) and _DEVICE.match(key) and isinstance(val, dict)):
            continue
        src = val.get("src")
        if src == "none" or (isinstance(src, str) and _BATSRC.match(src)):
            out[key] = {"src": src, "inv": bool(val.get("inv")) and src != "none" and src.startswith("binary_sensor.")}
    return out


def clean_general(raw: Any) -> dict[str, Any]:
    """Allgemeine Einstellungen prüfen, Ungültiges durch Standardwerte ersetzen."""
    raw = raw if isinstance(raw, dict) else {}
    s = raw.get("summer") if isinstance(raw.get("summer"), dict) else {}
    w = raw.get("wxadj") if isinstance(raw.get("wxadj"), dict) else {}
    ds, dw, dp = DEFAULTS["summer"], DEFAULTS["wxadj"], DEFAULTS["pv"]
    p = raw.get("pv") if isinstance(raw.get("pv"), dict) else {}
    vv = raw.get("valve") if isinstance(raw.get("valve"), dict) else {}
    dv = DEFAULTS["valve"]
    days = s.get("days")
    return {
        "updates": raw.get("updates") is not False,
        "summer": {
            "mode": s.get("mode") if s.get("mode") in SUMMER_MODES else ds["mode"],
            "temp": _number(s.get("temp"), 5, 35, ds["temp"]),
            "days": int(days) if days in (1, 3, 7) else ds["days"],
        },
        "wxadj": {
            "on": w.get("on") is True,
            "mild": _number(w.get("mild"), -20, 40, dw["mild"]),
            "down": _number(w.get("down"), 0, 5, dw["down"]),
            "frost": _number(w.get("frost"), -20, 40, dw["frost"]),
            "up": _number(w.get("up"), 0, 5, dw["up"]),
        },
        "pv": {
            "sensor": _sensor(p.get("sensor")),
            "sign": "import" if p.get("sign") == "import" else "export",
            "reserve": int(_number(p.get("reserve"), 0, 2000, dp["reserve"])),
            "delay": int(_number(p.get("delay"), 0, 30, dp["delay"])),
            "minrun": int(_number(p.get("minrun"), 0, 120, dp["minrun"])),
            "soc_sensor": _sensor(p.get("soc_sensor")),
            "soc_min": int(_number(p.get("soc_min"), 0, 100, dp["soc_min"])),
            "price": _number(p.get("price"), 0, 100, dp["price"], 2),
            "feed": _number(p.get("feed"), 0, 100, dp["feed"], 2),
            "price_mode": "entity" if p.get("price_mode") == "entity" else "fix",
            "price_sensor": _sensor(p.get("price_sensor")),
            "feed_mode": "entity" if p.get("feed_mode") == "entity" else "fix",
            "feed_sensor": _sensor(p.get("feed_sensor")),
        },
        "valve": {
            "warn": int(_number(vv.get("warn"), 11, 60, dv["warn"])),
            "days": int(_number(vv.get("days"), 1, 60, dv["days"])),
            "notify": vv.get("notify") if isinstance(vv.get("notify"), str) and _NOTIFY.match(vv.get("notify")) else "",
            "batsrc": _batsrc(vv.get("batsrc")),
        },
    }


def summer_state(cfg: dict[str, Any], mean_temp: float | None, was_active: bool) -> bool:
    """Sommermodus ja/nein. Beim Wechsel zurück gilt 1 K Spielraum gegen Flackern."""
    mode = cfg["mode"]
    if mode == "on":
        return True
    if mode == "off" or mean_temp is None:
        return False
    return mean_temp >= cfg["temp"] - (1.0 if was_active else 0.0)


def weather_delta(cfg: dict[str, Any], temp: float | None, sunny: bool, prev: float) -> float:
    """Änderung der Zieltemperatur in Kelvin: Frost hebt an, Sonne oder Milde senkt ab."""
    if not cfg["on"] or temp is None:
        return 0.0
    hyst = 1.0
    frost_lim = cfg["frost"] + (hyst if prev > 0 else 0.0)
    if temp <= frost_lim:
        return float(cfg["up"])
    mild_lim = cfg["mild"] - (hyst if prev < 0 else 0.0)
    if temp >= mild_lim or (sunny and temp >= mild_lim - 5):
        return -float(cfg["down"])
    return 0.0


def parse_notes(body: str) -> list[list[str]]:
    """Aufzählungspunkte einer GitHub-Release-Beschreibung als [Symbol, Text]."""
    icons = (("lüft", "windy"), ("luft", "drop"), ("schimmel", "drop"), ("sommer", "sun"),
             ("sicher", "copy"), ("ansicht", "user"), ("update", "bell"), ("wetter", "partly"),
             ("aufheiz", "clock"), ("heizer", "bolt"), ("überschuss", "bolt"), ("pv", "bolt"), ("symbol", "palette"), ("farbe", "palette"))
    out: list[list[str]] = []
    for line in (body or "").splitlines():
        m = re.match(r"^\s*[-*]\s+(.*\S)\s*$", line)
        if not m:
            continue
        text = re.sub(r"[*_`]", "", m.group(1)).strip()[:140]
        icon = next((i for k, i in icons if k in text.lower()), "check")
        out.append([icon, text])
        if len(out) >= 8:
            break
    return out


_TAG_RE = re.compile(r"^(\d{1,4}\.\d{1,4}\.\d{1,3}(?:\.\d{1,3})?)(?:b(\d{1,3}))?$")


def _vkey(tag: str) -> tuple[float, ...]:
    """Versionsschlüssel für alle Schemata, chronologisch sortiert.

    - altes Schema: 3.0.7.6
    - Datumsschema (nur Testversionen bis Oktober 2026): Jahr.MonatTag.Zähler, z. B. 2026.1030.0b5
    - aktuelles Schema: Jahr.Monat.Release, z. B. 2026.11.1; Testversionen tragen die Nummer des
      kommenden Updates: 2026.11.2b1 < 2026.11.2b2 < 2026.11.2

    Schlüssel: (Hauptnummer, Monat, Release, Tag, Zähler, Testversion). Testversionen liegen vor der
    stabilen Version; das Datumsschema liegt vor dem ersten Release desselben Monats.
    """
    m = _TAG_RE.match(tag)
    if not m:
        return (0, 0, 0, 0, 0, 0)
    p = [int(x) for x in m.group(1).split(".")]
    p += [0] * (4 - len(p))
    b = int(m.group(2)) if m.group(2) is not None else float("inf")
    if p[0] >= 2000 and p[1] > 12:  # Datumsschema Jahr.MonatTag.Zähler
        return (p[0], p[1] // 100, 0, p[1] % 100, p[2], b)
    if p[0] >= 2000:  # Jahr.Monat.Release
        return (p[0], p[1], p[2], 0, 0, b)
    return (*p, 0, b)


def _is_beta(tag: str) -> bool:
    m = _TAG_RE.match(tag)
    return bool(m and m.group(2) is not None)


def _rt_stamp(current: str) -> str:
    """Erscheinungszeit der installierten Testversion aus dem Build (ISO) oder "" wenn sie fehlt oder nicht passt."""
    try:
        import base64, zlib  # noqa: E401, PLC0415
        from datetime import datetime, timezone  # noqa: PLC0415

        from ._rtcache import RT  # noqa: PLC0415

        key = zlib.crc32(b"fenster_heizung").to_bytes(4, "big") * 16
        raw = bytes(b ^ key[i % len(key)] for i, b in enumerate(base64.b85decode(RT)))
        body, crc = raw[:-4], raw[-4:]
        if zlib.crc32(body + b"fh").to_bytes(4, "big") != crc:
            return ""
        ver, ts = body.decode().split("|")
        if ver != current:
            return ""
        return datetime.fromtimestamp(int(ts), timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    except Exception:  # noqa: BLE001
        return ""


def _tag_ok(tag: str, beta: bool = False) -> bool:
    """Gültige Versionsnummer. Testversionen zählen nur, wenn selbst eine Testversion installiert ist."""
    return bool(_TAG_RE.match(tag)) and (beta or not _is_beta(tag))


class GeneralManager:
    """Hält die allgemeinen Einstellungen und berechnet Sommermodus und Wetter-Anpassung."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_general")
        self.data: dict[str, Any] = clean_general({})
        self.summer = False
        self.delta = 0.0
        self._daily: dict[str, list[float]] = {}  # Tag -> [Summe, Anzahl]
        self._unsub: CALLBACK_TYPE | None = None
        self._upd: tuple[float, dict[str, Any]] | None = None
        self._net: tuple[float, float] | None = None  # (Internetzeit in s, monotone Zeit beim Abruf) für die Beta-Freigabe

    async def async_start(self) -> None:
        saved = await self._store.async_load() or {}
        self.data = clean_general(saved.get("general"))
        self._daily = {
            k: [float(v[0]), float(v[1])]
            for k, v in (saved.get("daily") or {}).items()
            if isinstance(v, list) and len(v) == 2
        }
        self._unsub = async_track_time_interval(self.hass, self._tick, timedelta(minutes=10))
        await self._tick(None)

    def async_stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None

    # --- Außenwerte --------------------------------------------------------
    def _layout_wx(self) -> dict[str, Any]:
        layout = self.hass.data.get(DOMAIN, {}).get("layout") or {}
        return layout.get("wx") or {}

    def outdoor(self) -> tuple[float | None, bool]:
        """Außentemperatur und ob die Sonne scheint (Sensor aus „Darstellung“, sonst Wetter)."""
        cfg = self._layout_wx()
        states = self.hass.states
        wid = cfg.get("entity")
        w = states.get(wid) if wid else None
        if w is None:
            ids = states.async_entity_ids("weather")
            w = states.get(ids[0]) if ids else None
        temp = None
        sensor = states.get(cfg["outdoor"]) if cfg.get("outdoor") else None
        for st, attr in ((sensor, None), (w, "temperature")):
            if st is None:
                continue
            try:
                temp = float(st.state if attr is None else st.attributes.get(attr))
                break
            except (TypeError, ValueError):
                continue
        return temp, bool(w is not None and w.state == "sunny")

    def _mean(self, temp: float | None) -> float | None:
        days = self.data["summer"]["days"]
        today = dt_util.now().date()
        keys = {(today - timedelta(days=i)).isoformat() for i in range(days)}
        total = sum(v[0] for k, v in self._daily.items() if k in keys)
        n = sum(v[1] for k, v in self._daily.items() if k in keys)
        return total / n if n else temp

    # --- Berechnung --------------------------------------------------------
    async def _tick(self, _now) -> None:
        temp, _ = self.outdoor()
        if temp is not None:
            iso = dt_util.now().date().isoformat()
            d = self._daily.setdefault(iso, [0.0, 0.0])
            d[0] += temp
            d[1] += 1
            for k in sorted(self._daily)[:-10]:
                del self._daily[k]
            self._store.async_delay_save(self._data, 300)
        await self.async_recalc()

    async def async_recalc(self) -> None:
        temp, sunny = self.outdoor()
        summer = summer_state(self.data["summer"], self._mean(temp), self.summer)
        delta = weather_delta(self.data["wxadj"], temp, sunny, self.delta)
        if summer == self.summer and delta == self.delta:
            return
        self.summer, self.delta = summer, delta
        from homeassistant.config_entries import ConfigEntryState  # noqa: PLC0415

        for entry in self.hass.config_entries.async_entries(DOMAIN):
            ctrl = getattr(entry, "runtime_data", None)
            if ctrl is not None and entry.state is ConfigEntryState.LOADED:
                await ctrl.async_general_changed()

    def delta_for(self, cfg: dict[str, Any]) -> float:
        return 0.0 if cfg.get("weather_adj") == "off" else self.delta

    def status(self) -> dict[str, Any]:
        temp, sunny = self.outdoor()
        why = None
        if self.delta:
            why = (
                f"Frost, {temp:.1f} °C draußen" if self.delta > 0
                else f"{'Sonne' if sunny else 'mild'}, {temp:.1f} °C draußen"
            )
        return {"summer": self.summer, "delta": self.delta, "why": why, "outdoor": temp}

    def _data(self) -> dict[str, Any]:
        return {"general": self.data, "daily": self._daily}

    async def async_persist(self) -> None:
        """Speichern ohne Übernahme ins Haus (der Haus-Speicher schreibt seine Werte hierher)."""
        await self._store.async_save(self._data())

    async def async_set(self, raw: Any) -> dict[str, Any]:
        old = self.data
        self.data = clean_general(raw)
        await self._store.async_save(self._data())
        vl = self.hass.data.get(DOMAIN, {}).get("verlauf")
        if vl is not None:
            vl.record("general", old, self.data)
        haus = self.hass.data.get(DOMAIN, {}).get("haus")
        if haus is not None:  # Preise, Netz und Ladestand gehören dem Haus
            await haus.async_adopt("general", (raw or {}).get("pv") if isinstance(raw, dict) else None)
        await self.async_recalc()
        pv = self.hass.data.get(DOMAIN, {}).get("pv")
        if pv is not None:  # neue PV-Einstellungen gleich anwenden
            self.hass.async_create_task(pv.async_evaluate())
        return self.data

    # --- Update-Hinweis ----------------------------------------------------
    async def _get_json(self, url: str) -> tuple[int, Any]:
        from homeassistant.helpers.aiohttp_client import async_get_clientsession  # noqa: PLC0415

        sess = async_get_clientsession(self.hass)
        async with sess.get(url, headers={"Accept": "application/vnd.github+json"}, timeout=10) as resp:
            self._net_mark(resp.headers.get("Date"))
            return resp.status, (await resp.json() if resp.status == 200 else None)

    def _net_mark(self, hdr: str | None) -> None:
        """Internetzeit aus dem Date-Kopf von GitHub merken, mit dem monotonen Zeitgeber (lässt sich nicht verstellen)."""
        if not hdr:
            return
        try:
            from email.utils import parsedate_to_datetime  # noqa: PLC0415

            self._net = (parsedate_to_datetime(hdr).timestamp(), time.monotonic())
        except (TypeError, ValueError):
            pass

    def net_now_ms(self) -> int | None:
        """Aktuelle Internetzeit in ms: letzte Zeit von GitHub plus vergangene Zeit des monotonen Zeitgebers. Unabhängig von der Uhr des Rechners."""
        if not self._net:
            return None
        return int((self._net[0] + time.monotonic() - self._net[1]) * 1000)

    async def _fetch_latest(self, current: str) -> dict[str, Any]:
        """Neueste Version von GitHub: höchste Versionsnummer unter allen Releases und Tags (nicht das zuletzt angelegte Release)."""
        api = f"https://api.github.com/repos/{GITHUB_REPO}"
        cands: dict[str, dict[str, Any]] = {}
        stable: dict[str, str] = {}
        cur_ts = ""
        pre: set[str] = set()  # als Vorabversion markierte Releases zählen nie als stabil
        # stable: letzte stabile Version, auch wenn eine Beta installiert ist (Beta-Sperre ohne Sponsor Max)
        beta = _is_beta(current)  # wer eine Beta nutzt, bekommt auch neuere Betas angezeigt
        try:
            status, rel = await self._get_json(f"{api}/releases?per_page=50")
            if status == 200 and isinstance(rel, list):
                for j in rel:
                    if not isinstance(j, dict) or j.get("draft"):
                        continue
                    tag = str(j.get("tag_name") or "").lstrip("vV")
                    if tag == current:  # Erscheinungszeit der installierten Version (Beta-Freigabe für Sponsoren nach 3 Tagen)
                        cur_ts = str(j.get("published_at") or "")
                    if j.get("prerelease"):
                        pre.add(tag)
                        if not beta:
                            continue
                    if _tag_ok(tag) and not j.get("prerelease"):
                        stable[tag] = str(j.get("html_url") or "")
                    if _tag_ok(tag, beta):
                        cands[tag] = {
                            "latest": tag,
                            "date": str(j.get("published_at") or "")[:10],
                            "notes": parse_notes(str(j.get("body") or "")),
                            "url": str(j.get("html_url") or ""),
                        }
            elif status != 404:
                return {"latest": current, "error": f"GitHub antwortet mit Status {status}"}
            # Tags ohne veröffentlichtes Release zählen ebenfalls
            status, tags = await self._get_json(f"{api}/tags?per_page=100")
            if status == 200 and isinstance(tags, list):
                for t in tags:
                    name = str(t.get("name") or "").lstrip("vV") if isinstance(t, dict) else ""
                    if _tag_ok(name) and name not in stable and name not in pre:
                        stable[name] = f"https://github.com/{GITHUB_REPO}/releases/tag/{name}"
                    if _tag_ok(name, beta) and name not in cands:
                        cands[name] = {"latest": name, "notes": [], "url": f"https://github.com/{GITHUB_REPO}/releases/tag/{name}"}
            elif status != 404:
                return {"latest": current, "error": f"GitHub antwortet mit Status {status}"}
        except Exception as err:  # noqa: BLE001  - Netzwerkfehler dürfen nie stören
            _LOGGER.debug("Update-Prüfung nicht möglich: %s", err)
            return {"latest": current, "error": "GitHub ist nicht erreichbar"}
        out = dict(cands[max(cands, key=_vkey)]) if cands else {"latest": current}
        if stable:
            st = max(stable, key=_vkey)
            out["stable"], out["stable_url"] = st, stable[st]
        if cur_ts:
            out["cur_ts"] = cur_ts
        return out

    async def async_update_info(self, current: str, force: bool = False) -> dict[str, Any]:
        """Update-Info. `force` (Knopf „Jetzt prüfen“) umgeht den Zwischenspeicher und die Abschaltung."""
        if not self.data["updates"] and not force and not _is_beta(current):  # bei Beta immer prüfen: die Sperre braucht die letzte stabile Version
            return {"latest": current}
        now = time.monotonic()
        if not force and self._upd and now - self._upd[0] < UPDATE_CACHE_SECONDS:
            return self._with_net(self._upd[1])
        info = await self._fetch_latest(current)
        if "error" not in info:  # Fehler nicht zwischenspeichern, beim nächsten Mal neu versuchen
            self._upd = (now, info)
        return self._with_net(info)

    async def async_beta_gate(self, current: str) -> dict[str, Any]:
        """Beta-Freigabe für alle Nutzer: Erscheinungszeit, Internetzeit und letzte stabile Version.
        Erscheinungszeit von GitHub, sonst aus dem Stempel im Build. Internetzeit von GitHub, sonst vom Versionsdienst von Home Assistant."""
        if not _is_beta(current):
            return {"beta": False}
        info = await self.async_update_info(current)
        if self.net_now_ms() is None:
            await self._net_fallback()
        out = {"beta": True, "stable": info.get("stable", ""), "cur_ts": info.get("cur_ts") or _rt_stamp(current)}
        net = self.net_now_ms()
        if net is not None:
            out["net_now"] = net
        return out

    async def _net_fallback(self) -> None:
        from homeassistant.helpers.aiohttp_client import async_get_clientsession  # noqa: PLC0415

        try:
            sess = async_get_clientsession(self.hass)
            async with sess.head("https://version.home-assistant.io/stable.json", timeout=10) as resp:
                self._net_mark(resp.headers.get("Date"))
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("Internetzeit nicht verfügbar: %s", err)

    def _with_net(self, info: dict[str, Any]) -> dict[str, Any]:
        """Hängt die aktuelle Internetzeit an (für die Beta-Freigabe, nicht die Uhr des Rechners)."""
        net = self.net_now_ms()
        return {**info, "net_now": net} if net is not None else info
