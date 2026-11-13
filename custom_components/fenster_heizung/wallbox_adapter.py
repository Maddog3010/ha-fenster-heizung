"""Modul 8: Wallbox-Adapter.

Die Regelung spricht intern „go-e-Sprache“ (frc 0/1/2 = neutral/aus/an, amp = Ladestrom in A, psm 1/2 = 1 oder 3 Phasen,
car 1–4 = frei/lädt/wartet/fertig). Ein Adapter übersetzt das für eine bestimmte Wallbox:

* GoeAdapter – go-e Charger direkt über die lokale HTTP-API v2 (wie bisher)
* HaAdapter  – jede Wallbox, die in Home Assistant eine Integration hat: Schalter (Laden an/aus), Ladestrom (number),
               Leistung, Status, Stecker, Phasen (select), Energie. Fehlt der Schalter, wird nur angezeigt.

Die reinen Hilfsfunktionen (Status-Text deuten, Phasen-Option finden, Entitäten vorschlagen) kommen ohne Home Assistant aus.
"""
from __future__ import annotations

import re
import time
from typing import Any

VOLT = 230.0
CAR_TEXT = {0: "Unbekannt", 1: "Nicht angesteckt", 2: "Lädt", 3: "Wartet aufs Auto", 4: "Fertig geladen", 5: "Fehler"}
SET_GRACE_S = 90  # so lange nach einem eigenen Befehl gilt eine Abweichung nicht als „von Hand umgestellt“ (Integrationen melden verzögert)

# Bekannte Wallbox-Integrationen (Plattform → Anzeigename). Andere werden über ihre Entitäten erkannt.
KNOWN = {
    "easee": "Easee", "zaptec": "Zaptec", "wallbox": "Wallbox (Pulsar, Commander, Copper)", "keba": "KEBA KeContact",
    "alfen_wallbox": "Alfen Eve", "openwbmqtt": "openWB", "openwb2mqtt": "openWB 2", "ocpp": "OCPP-Wallbox",
    "goecharger_api2": "go-e (über Home Assistant)", "goecharger": "go-e (über Home Assistant)", "v2c": "V2C Trydan",
    "peblar": "Peblar", "nrgkick": "NRGkick", "smartevse": "SmartEVSE", "heidelberg_energy_control": "Heidelberg Energy Control",
    "tesla_wall_connector": "Tesla Wall Connector", "evcc_intg": "evcc (Ladepunkt)", "webasto_unite": "Webasto Unite", "abl_emh": "ABL eMH",
}
ROLE_DOMAINS = {
    "switch": ("switch", "input_boolean"), "current": ("number", "input_number"), "power": ("sensor",), "status": ("sensor",),
    "plug": ("binary_sensor", "sensor"), "phase": ("select",), "energy": ("sensor",), "total": ("sensor",),
}
ROLE_RX = {
    "switch": re.compile(r"charg|lade|laden|enable|freigabe|pause|resume|start|is_enabled|ev_?charg", re.I),
    "current": re.compile(r"current|strom|amp|limit|max", re.I),
    "power": re.compile(r"power|leistung|charg|lade", re.I),
    "status": re.compile(r"status|state|zustand|op_?mode|charger_op|mode", re.I),
    "plug": re.compile(r"plug|cable|kabel|connect|stecker|vehicle|car", re.I),
    "phase": re.compile(r"phase", re.I),
    "energy": re.compile(r"session|sitzung|ladevorgang|charged|added|current_session|last", re.I),
    "total": re.compile(r"total|lifetime|gesamt|meter|counter|zähler", re.I),
}
WALLBOXISH = re.compile(r"wallbox|charger|lade|evse|charge_?point|ladepunkt|loadpoint|ev_", re.I)

_CHARGING = re.compile(r"^(laden|ladend|in_?progress|active|charge)$|charging|l(ä|a)dt\b", re.I)
_DONE = re.compile(r"complet|finish|fertig|\bfull|voll\b|vollgeladen|\bdone\b|\bend(ed)?\b", re.I)
_WAIT = re.compile(r"connected|awaiting|ready|paus|suspend|wait|bereit|angesteckt|plugged|preparing|occupied|scheduled|b1|b2|c1", re.I)
_IDLE = re.compile(r"disconnect|^available$|idle|^frei$|unplugged|not_?connected|no_?(car|vehicle)|standby|nicht angesteckt", re.I)
_ERR = re.compile(r"error|fault|fehler|offline|unavailable", re.I)


class WallboxError(Exception):
    """Wallbox nicht erreichbar oder Befehl abgelehnt."""


# ---- reine Hilfsfunktionen
def car_from_text(text: Any) -> int | None:
    """Status-Text einer Integration in go-e-Zustand: 1 frei, 2 lädt, 3 wartet, 4 fertig, 5 Fehler. None = unbekannt."""
    t = str(text or "").strip().lower()
    if not t or t in ("unknown", "none"):
        return None
    if _ERR.search(t):
        return 5
    if _DONE.search(t):
        return 4
    if _IDLE.search(t) and not _CHARGING.search(t):
        return 1
    if _CHARGING.search(t):
        return 2
    if _WAIT.search(t):
        return 3
    return None


def derive_car(status_txt: Any, plug: bool | None, power_w: float | None, switch_on: bool | None) -> int | None:
    """Zustand aus Status-Text, sonst aus Stecker und Leistung."""
    c = car_from_text(status_txt) if status_txt not in (None, "") else None
    if c is not None and c != 5:
        if c in (3, 4) and (power_w or 0) >= 100:
            return 2  # manche Integrationen melden „bereit“, obwohl schon Strom fließt
        return c
    if plug is False:
        return 1
    if (power_w or 0) >= 100:
        return 2
    if plug is True:
        return 3
    return c


def phase_option(options: list[Any], ph: int) -> str | None:
    """Option eines Phasen-Auswahlfelds für 1 oder 3 Phasen finden (z. B. „1-phasig“, „3 Phasen“, „single“, „three“)."""
    want = {1: re.compile(r"(^|\D)1(\D|$)|single|ein|one|mono", re.I), 3: re.compile(r"(^|\D)3(\D|$)|three|drei|tri|multi", re.I)}[1 if ph == 1 else 3]
    for o in options or []:
        if want.search(str(o)):
            return str(o)
    return None


def phases_from_option(text: Any) -> int | None:
    t = str(text or "")
    if phase_option([t], 1):
        return 1
    if phase_option([t], 3):
        return 3
    return None


def to_watts(state: Any, unit: Any) -> float | None:
    try:
        v = float(str(state).replace(",", "."))
    except (TypeError, ValueError):
        return None
    u = str(unit or "").strip()
    return v * 1000 if u == "kW" else v * 1e6 if u == "MW" else v


def to_wh(state: Any, unit: Any) -> float | None:
    try:
        v = float(str(state).replace(",", "."))
    except (TypeError, ValueError):
        return None
    u = str(unit or "").strip()
    return v * 1000 if u == "kWh" else v * 1e6 if u == "MWh" else v


def guess_roles(ents: list[dict[str, Any]]) -> dict[str, str]:
    """Vorschläge je Rolle aus den Entitäten einer Integration.

    ents: [{eid, name, unit, dc (device_class), num (Zustand ist eine Zahl), opts (Optionen eines select)}]
    """
    out: dict[str, str] = {}
    used: set[str] = set()

    def score(role: str, e: dict[str, Any]) -> int:
        dom = e["eid"].split(".")[0]
        if dom not in ROLE_DOMAINS[role]:
            return -1
        txt = f"{e['eid']} {e.get('name') or ''}"
        unit, dc, num = str(e.get("unit") or ""), str(e.get("dc") or ""), bool(e.get("num"))
        s = 3 if ROLE_RX[role].search(txt) else 0
        if role == "switch":
            s += 0 if s else -1
            if re.search(r"light|licht|(^|[_\s.])led([_\s.]|$)|lock|sperre|smart|(^|[_\s.])eco([_\s.]|$)|auto_?update|charge_?now|update", txt, re.I):
                s -= 2
        elif role == "current":
            s += 3 if unit == "A" else 0
            if not s:
                return -1
        elif role == "power":
            if not (dc == "power" or unit in ("W", "kW")):
                return -1
            s += 2
            if re.search(r"house|haus|grid|netz|solar|pv", txt, re.I):
                s -= 3
        elif role == "status":
            if num or unit:
                return -1
        elif role == "plug":
            s += 2 if dc in ("plug", "connectivity") else 0
            s -= 3 if re.search(r"lock|verriegel|sperr", txt, re.I) else 0
            if not s:
                return -1
        elif role == "phase":
            if not any(phase_option(e.get("opts") or [], p) for p in (1, 3)):
                return -1
            s += 3
        elif role in ("energy", "total"):
            if not (dc == "energy" or unit in ("Wh", "kWh", "MWh")):
                return -1
            s += 1
        return s

    for role in ("switch", "current", "power", "phase", "plug", "status", "energy", "total"):
        best = max(((score(role, e), e["eid"]) for e in ents if e["eid"] not in used), default=(-1, ""))
        if best[0] >= (1 if role in ("power", "energy", "total") else 3):
            out[role] = best[1]
            used.add(best[1])
    return out


def ha_view(st: dict[str, Any], wbx: dict[str, Any]) -> dict[str, Any]:
    """Status aus den Home-Assistant-Zuständen. st: {Rolle: (state, attributes) oder None}."""
    def val(role: str) -> tuple[Any, dict[str, Any]] | None:
        x = st.get(role)
        return x if x and str(x[0]) not in ("unavailable", "unknown") else None

    sw, cur, pw, stt, plug, ph, en, tot = (val(r) for r in ("switch", "current", "power", "status", "plug", "phase", "energy", "total"))
    power = to_watts(pw[0], pw[1].get("unit_of_measurement")) if pw else None
    sw_on = (str(sw[0]).lower() == "on") if sw else None
    plug_on = (str(plug[0]).lower() in ("on", "true", "connected", "plugged", "yes")) if plug else None
    try:
        amp = float(str(cur[0]).replace(",", ".")) if cur else None
    except ValueError:
        amp = None
    phs = phases_from_option(ph[0]) if ph else None
    phs = phs or (1 if wbx.get("ph") == 1 else 3)
    car = derive_car(stt[0] if stt else None, plug_on, power, sw_on)
    info = {
        "car": car, "car_text": str(stt[0]) if stt and car is None else CAR_TEXT.get(car, "–") if car is not None else "–",
        "amp": int(round(amp)) if amp is not None else None, "power": max(power, 0.0) if power is not None else None,
        "cur": round(power / (VOLT * phs), 1) if power else 0.0 if power is not None else None, "phases": phs if (power or 0) >= 100 else None,
        "session_wh": to_wh(en[0], en[1].get("unit_of_measurement")) if en else None, "total_wh": to_wh(tot[0], tot[1].get("unit_of_measurement")) if tot else None,
        "fw": None, "serial": None, "type": KNOWN.get(wbx.get("plat") or "", "Wallbox über Home Assistant"), "name": wbx.get("name") or None,
        "err": None, "trx": None, "cards": [], "ctrl": bool((wbx.get("ent") or {}).get("switch")), "kind": "ha",
    }
    frc = (2 if sw_on else 1) if sw_on is not None else (2 if (amp or 0) > 0 else 1)
    cur_set = {"frc": frc, "amp": int(round(amp)) if amp is not None else None, "psm": 1 if phs == 1 else 2}
    return {"info": info, "cur": cur_set}


# ---- Adapter
class GoeAdapter:
    kind = "goe"
    rfid = True

    def __init__(self, client: Any, summarize: Any) -> None:
        self._cl, self._sum = client, summarize

    async def read(self) -> dict[str, Any]:
        st = await self._cl.status()
        info = self._sum(st)
        info.update(ctrl=True, kind="goe")
        return {"info": info, "cur": {"frc": st.get("frc"), "amp": st.get("amp"), "psm": st.get("psm")}}

    async def set(self, cmd: dict[str, int], max_a: int) -> None:
        await self._cl.set(cmd)


class HaAdapter:
    """Wallbox über ihre Home-Assistant-Entitäten. hass wird nur für states und services gebraucht."""
    kind = "ha"
    rfid = False

    def __init__(self, hass: Any, wbx: dict[str, Any]) -> None:
        self.hass, self.wbx, self.ent = hass, wbx, wbx.get("ent") or {}

    def _state(self, role: str) -> tuple[Any, dict[str, Any]] | None:
        eid = self.ent.get(role)
        s = self.hass.states.get(eid) if eid else None
        return (s.state, dict(s.attributes)) if s is not None else None

    async def read(self) -> dict[str, Any]:
        main = [r for r in ("switch", "current") if self.ent.get(r)]
        if not main:
            raise WallboxError("Keine Schalter- oder Ladestrom-Entität gewählt")
        st = {r: self._state(r) for r in ("switch", "current", "power", "status", "plug", "phase", "energy", "total")}
        if all(st[r] is None or str(st[r][0]) in ("unavailable", "unknown") for r in main):
            raise WallboxError(f"{self.ent[main[0]]} ist nicht verfügbar")
        return ha_view(st, self.wbx)

    async def _call(self, domain: str, service: str, data: dict[str, Any]) -> None:
        try:
            await self.hass.services.async_call(domain, service, data, blocking=True)
        except Exception as err:  # noqa: BLE001 - Fehler der fremden Integration nur melden
            raise WallboxError(f"{domain}.{service}: {err}") from err

    async def set(self, cmd: dict[str, int], max_a: int) -> None:
        sw, cur, ph = self.ent.get("switch"), self.ent.get("current"), self.ent.get("phase")
        if "psm" in cmd and ph:
            s = self.hass.states.get(ph)
            opt = phase_option(list((s.attributes.get("options") if s is not None else None) or []), 1 if cmd["psm"] == 1 else 3)
            if opt and (s is None or s.state != opt):
                await self._call("select", "select_option", {"entity_id": ph, "option": opt})
        amp = cmd.get("amp")
        if cmd.get("frc") == 0 and cur:
            amp = max_a  # „neutral“: Wallbox wieder frei mit vollem Strom
        if amp is not None and cur:
            s = self.hass.states.get(cur)
            lo = float((s.attributes.get("min") if s is not None else None) or 0)
            hi = float((s.attributes.get("max") if s is not None else None) or 63)
            await self._call(cur.split(".")[0], "set_value", {"entity_id": cur, "value": min(max(float(amp), lo), hi)})
        if "frc" in cmd:
            if not sw:
                if cmd["frc"] == 1:
                    raise WallboxError("Ohne Schalter-Entität kann die Ladung nicht gestoppt werden")
                return
            await self._call(sw.split(".")[0], "turn_off" if cmd["frc"] == 1 else "turn_on", {"entity_id": sw})


def manual_change(last_set: dict[str, int], cur: dict[str, Any], kind: str, set_ts: float, now_ts: float | None = None) -> bool:
    """Hat jemand die Wallbox von Hand umgestellt? Bei Home-Assistant-Wallboxen erst nach einer Schonzeit (Werte kommen verzögert)."""
    now_ts = time.time() if now_ts is None else now_ts
    if kind == "ha" and now_ts - set_ts < SET_GRACE_S:
        return False
    for k, v in last_set.items():
        c = cur.get(k)
        if c is None:
            continue
        if kind == "ha" and k == "amp" and abs(float(c) - float(v)) < 1:
            continue
        if c != v and (k == "frc" or cur.get("frc") == 2):
            return True
    return False
