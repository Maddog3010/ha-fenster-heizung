"""Haus-Werte zentral (Konzept Einstellungen, Stufe 2).

Gemeinsame Werte, die mehrere Module nutzen, liegen an genau einer Stelle:
- Energiequellen: Solar, zweite Anlage, Netz mit Vorzeichen, Hausverbrauch, Batterie, Zähler
- Ladestand der Batterie
- Preise & Tarif: Bezugspreis und Einspeisevergütung (Festwert oder Sensor)
- Wetterquelle: Wetter-Entität, Außentemperatur, Wind und amtliche Warnungen

Die Module lesen ihre Werte weiter an den gewohnten Stellen (Modul 1 → Allgemein, Modul 3, Darstellung,
Modul 9). Diese Stellen sind ab jetzt nur noch ein Spiegel des Hauses: Der Haus-Speicher ist führend und
schreibt seine Werte dorthin. Ändert ein älteres Fenster (oder ein Browser mit alter Oberfläche) einen
dieser Werte an der alten Stelle, wird die Änderung ins Haus übernommen und an alle anderen Stellen verteilt.

Beim ersten Start werden die Werte einmalig aus Modul 1, Modul 3, der Darstellung und Modul 9
übernommen. Vorher wird von jedem betroffenen Speicher eine Sicherungskopie angelegt.

Der Speicher trägt eine Schema-Version ("v"). Spätere Updates wandeln alte Stände über UPGRADES gezielt
um, statt Standardwerte einzusetzen (B6).
"""
from __future__ import annotations

import copy
import logging
import re
from datetime import datetime
from typing import Any, Callable

from homeassistant.core import HomeAssistant

from .backup import SafeStore
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

SCHEMA = 1
EN_KEYS = ("pv", "grid", "house", "bat", "bchg", "bdis", "pve", "pv2", "pve2", "imp", "exp")
_SENSOR = re.compile(r"^sensor\.[a-z0-9_]{1,200}$")
_WEATHER = re.compile(r"^weather\.[a-z0-9_]{1,200}$")
_WARN = re.compile(r"^(sensor|binary_sensor)\.[a-z0-9_]{1,200}$")

# Wer nutzt was (für die Anzeige „Gilt für …“)
USED_BY = {
    "energy": [3, 4, 8, 13, 16, 19],
    "soc": [1, 3, 8, 13],
    "price": [1, 3, 4, 8, "Labs"],
    "wx": [1, 9, "Start", "Labs"],
}


def _s(v: Any, rx: re.Pattern = _SENSOR) -> str:
    v = str(v or "").strip().lower()
    return v if rx.match(v) else ""


def _n(v: Any, lo: float, hi: float, d: float) -> float:
    if isinstance(v, str):
        v = v.strip().replace(",", ".")
    try:
        x = float(v)
    except (TypeError, ValueError):
        return d
    if x != x or x in (float("inf"), float("-inf")):
        return d
    return round(min(max(x, lo), hi), 2)


def _name(v: Any) -> str:
    return re.sub(r"[<>\"'&]", "", str(v or "").strip())[:20]


def default() -> dict[str, Any]:
    return {
        "v": SCHEMA,
        "energy": {"ent": {k: "" for k in EN_KEYS}, "sign": "export", "bsign": "charge", "bmode": "one", "pvn": "", "pv2n": ""},
        "soc": "",
        "price": {"price": 32.0, "feed": 8.0, "price_mode": "fix", "price_sensor": "", "feed_mode": "fix", "feed_sensor": ""},
        "wx": {"entity": "", "outdoor": "", "wind": "", "official": ""},
        "mig": None,
    }


def clean(raw: Any) -> dict[str, Any]:
    """Haus-Werte prüfen. Ungültiges wird durch Standardwerte ersetzt."""
    d = default()
    r = raw if isinstance(raw, dict) else {}
    e = r.get("energy") if isinstance(r.get("energy"), dict) else {}
    ent = e.get("ent") if isinstance(e.get("ent"), dict) else {}
    d["energy"] = {
        "ent": {k: _s(ent.get(k)) for k in EN_KEYS},
        "sign": "import" if e.get("sign") == "import" else "export",
        "bsign": "discharge" if e.get("bsign") == "discharge" else "charge",
        "bmode": "two" if e.get("bmode") == "two" else "one",
        "pvn": _name(e.get("pvn")),
        "pv2n": _name(e.get("pv2n")),
    }
    d["soc"] = _s(r.get("soc"))
    p = r.get("price") if isinstance(r.get("price"), dict) else {}
    dp = d["price"]
    d["price"] = {
        "price": _n(p.get("price"), 0, 100, dp["price"]),
        "feed": _n(p.get("feed"), 0, 100, dp["feed"]),
        "price_mode": "entity" if p.get("price_mode") == "entity" else "fix",
        "price_sensor": _s(p.get("price_sensor")),
        "feed_mode": "entity" if p.get("feed_mode") == "entity" else "fix",
        "feed_sensor": _s(p.get("feed_sensor")),
    }
    w = r.get("wx") if isinstance(r.get("wx"), dict) else {}
    d["wx"] = {"entity": _s(w.get("entity"), _WEATHER), "outdoor": _s(w.get("outdoor")), "wind": _s(w.get("wind")), "official": _s(w.get("official"), _WARN)}
    mig = r.get("mig")
    if isinstance(mig, dict):
        d["mig"] = {
            "ts": str(mig.get("ts") or "")[:32],
            "ver": str(mig.get("ver") or "")[:24],
            "items": [str(x)[:160] for x in (mig.get("items") or [])[:30] if isinstance(x, str)],
            "conflicts": [str(x)[:200] for x in (mig.get("conflicts") or [])[:10] if isinstance(x, str)],
            "seen": bool(mig.get("seen")),
        }
    return d


# ---------------------------------------------------------------- Schema-Versionen (B6)
# Schlüssel = Version, von der aus umgewandelt wird. Beispiel für später:
#   UPGRADES[1] = lambda d: {**d, "price": {**d["price"], "grund": 0.0}}
UPGRADES: dict[int, Callable[[dict[str, Any]], dict[str, Any]]] = {}


def upgrade(raw: dict[str, Any]) -> tuple[dict[str, Any], bool]:
    """Gespeicherten Stand auf die aktuelle Schema-Version bringen. Gibt (Stand, geändert) zurück."""
    v = raw.get("v") if isinstance(raw.get("v"), int) else 1
    changed = False
    while v < SCHEMA:
        step = UPGRADES.get(v)
        if step is not None:
            raw = step(copy.deepcopy(raw))
        v += 1
        raw["v"] = v
        changed = True
    return raw, changed


# ---------------------------------------------------------------- Übernahme aus den alten Stellen
def migrate(general: dict[str, Any], energy: dict[str, Any], lwx: dict[str, Any], wcfg: dict[str, Any], names: Callable[[str], str] = str) -> dict[str, Any]:
    """Einmalige Übernahme. Modul 3 hat bei Energiequellen Vorrang, Modul 1 füllt Lücken."""
    h = default()
    pv = (general or {}).get("pv") or {}
    en = energy or {}
    ent = en.get("ent") or {}
    items: list[str] = []
    conflicts: list[str] = []

    h["energy"]["ent"] = {k: _s(ent.get(k)) for k in EN_KEYS}
    n3 = sum(1 for v in h["energy"]["ent"].values() if v)
    g1 = _s(pv.get("sensor"))
    g3 = h["energy"]["ent"]["grid"]
    s1 = "import" if pv.get("sign") == "import" else "export"
    s3 = en.get("sign") if en.get("sign") in ("export", "import") else ""
    if g3 and g1 and g1 != g3:
        conflicts.append(f"Netz-Sensor: Modul 3 nutzte {names(g3)}, Modul 1 {names(g1)}. Übernommen: {names(g3)} (Modul 3).")
    if not g3 and g1:
        h["energy"]["ent"]["grid"] = g1
        items.append(f"Netz-Sensor {names(g1)} aus Modul 1")
    if g3 and g1 == g3 and s3 and s3 != s1:
        conflicts.append("Vorzeichen Netz: Modul 1 und Modul 3 waren verschieden. Übernommen: Modul 3.")
    h["energy"]["sign"] = s3 or s1
    h["energy"]["bsign"] = "discharge" if en.get("bsign") == "discharge" else "charge"
    h["energy"]["bmode"] = "two" if en.get("bmode") == "two" else "one"
    h["energy"]["pvn"], h["energy"]["pv2n"] = _name(en.get("pvn")), _name(en.get("pv2n"))
    if n3:
        items.append(f"{n3} {'Energiequelle' if n3 == 1 else 'Energiequellen'} aus Modul 3")

    h["soc"] = _s(pv.get("soc_sensor"))
    if h["soc"]:
        items.append(f"Batterie-Ladestand {names(h['soc'])} aus Modul 1")

    h["price"] = clean({"price": {k: pv.get(k) for k in ("price", "feed", "price_mode", "price_sensor", "feed_mode", "feed_sensor")}})["price"]
    items.append(f"Bezugspreis {h['price']['price']:.2f} ct und Einspeisevergütung {h['price']['feed']:.2f} ct aus Modul 1".replace(".", ","))

    lwx = lwx or {}
    wcfg = wcfg or {}
    h["wx"] = {
        "entity": _s(lwx.get("entity"), _WEATHER),
        "outdoor": _s(lwx.get("outdoor")),
        "wind": _s(wcfg.get("wind")),
        "official": _s((wcfg.get("official") or {}).get("ent"), _WARN),
    }
    if h["wx"]["entity"] or h["wx"]["outdoor"]:
        items.append("Wetter und Außentemperatur aus der Darstellung")
    w9 = [t for t, v in (("Wind-Sensor", h["wx"]["wind"]), ("amtliche Warnungen", h["wx"]["official"])) if v]
    if w9:
        items.append(" und ".join(w9) + " aus Modul 9")
    h["mig"] = {"ts": datetime.now().isoformat(timespec="minutes"), "ver": "", "items": items, "conflicts": conflicts, "seen": False}
    return h


# ---------------------------------------------------------------- Spiegel (Haus → alte Stellen)
def to_general_pv(h: dict[str, Any], pv: dict[str, Any]) -> dict[str, Any]:
    out = dict(pv or {})
    out.update(h["price"])
    out["sensor"] = h["energy"]["ent"]["grid"]
    out["sign"] = h["energy"]["sign"]
    out["soc_sensor"] = h["soc"]
    return out


def to_energy(h: dict[str, Any]) -> dict[str, Any]:
    return copy.deepcopy(h["energy"])


def to_layout_wx(h: dict[str, Any], lwx: dict[str, Any]) -> dict[str, Any]:
    out = {k: v for k, v in (lwx or {}).items() if k not in ("entity", "outdoor")}
    for k in ("entity", "outdoor"):
        if h["wx"][k]:
            out[k] = h["wx"][k]
    return out


# ---------------------------------------------------------------- Übernehmen (alte Stelle → Haus)
def adopt_general(h: dict[str, Any], pv: dict[str, Any]) -> list[str]:
    """Felder, die ein älteres Fenster in Modul 1 geändert hat, ins Haus übernehmen."""
    pv = pv or {}
    ch: list[str] = []
    for k in ("price", "feed", "price_mode", "price_sensor", "feed_mode", "feed_sensor"):
        if k in pv:
            v = clean({"price": {**h["price"], k: pv[k]}})["price"][k]
            if v != h["price"][k]:
                h["price"][k] = v
                ch.append(k)
    if "sensor" in pv and _s(pv["sensor"]) != h["energy"]["ent"]["grid"]:
        h["energy"]["ent"]["grid"] = _s(pv["sensor"])
        ch.append("grid")
    if pv.get("sign") in ("export", "import") and pv["sign"] != h["energy"]["sign"]:
        h["energy"]["sign"] = pv["sign"]
        ch.append("sign")
    if "soc_sensor" in pv and _s(pv["soc_sensor"]) != h["soc"]:
        h["soc"] = _s(pv["soc_sensor"])
        ch.append("soc")
    return ch


def adopt_energy(h: dict[str, Any], en: dict[str, Any]) -> list[str]:
    en = en or {}
    ch: list[str] = []
    ent = en.get("ent") if isinstance(en.get("ent"), dict) else {}
    for k in EN_KEYS:
        if k in ent and _s(ent[k]) != h["energy"]["ent"][k]:
            if k == "grid" and not _s(ent[k]):
                continue  # „wie Modul 1“ aus einem alten Fenster: Netz bleibt
            h["energy"]["ent"][k] = _s(ent[k])
            ch.append(k)
    if en.get("sign") in ("export", "import") and en["sign"] != h["energy"]["sign"]:
        h["energy"]["sign"] = en["sign"]
        ch.append("sign")
    for k, ok in (("bsign", ("charge", "discharge")), ("bmode", ("one", "two"))):
        if en.get(k) in ok and en[k] != h["energy"][k]:
            h["energy"][k] = en[k]
            ch.append(k)
    for k in ("pvn", "pv2n"):
        if k in en and _name(en[k]) != h["energy"][k]:
            h["energy"][k] = _name(en[k])
            ch.append(k)
    return ch


def adopt_layout(h: dict[str, Any], lwx: dict[str, Any]) -> list[str]:
    lwx = lwx or {}
    ch: list[str] = []
    for k, rx in (("entity", _WEATHER), ("outdoor", _SENSOR)):
        v = _s(lwx.get(k), rx)
        if v != h["wx"][k]:
            h["wx"][k] = v
            ch.append(k)
    return ch


def adopt_wetter(h: dict[str, Any], cfg: dict[str, Any]) -> list[str]:
    cfg = cfg or {}
    ch: list[str] = []
    w = _s(cfg.get("wind"))
    o = _s((cfg.get("official") or {}).get("ent"), _WARN)
    if w != h["wx"]["wind"]:
        h["wx"]["wind"] = w
        ch.append("wind")
    if o != h["wx"]["official"]:
        h["wx"]["official"] = o
        ch.append("official")
    return ch


# ---------------------------------------------------------------- Manager
class HausManager:
    """Hält die Haus-Werte und verteilt sie an die Module."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store = SafeStore(hass, 1, f"{DOMAIN}_haus")
        self.data: dict[str, Any] = default()
        self.ready = False

    def _mgr(self, key: str) -> Any:
        return self.hass.data.get(DOMAIN, {}).get(key)

    def _name(self, eid: str) -> str:
        st = self.hass.states.get(eid)
        return str(st.attributes.get("friendly_name") or eid) if st else eid

    async def _layout(self) -> dict[str, Any]:
        from .api import _layout  # noqa: PLC0415 - api importiert viele Module
        return await _layout(self.hass)

    async def async_start(self, version: str = "") -> None:
        saved = await self._store.async_load()
        if isinstance(saved, dict) and saved.get("v"):
            saved, changed = upgrade(saved)
            self.data = clean(saved)
            if changed:
                await self._store.async_save(self.data)
        else:
            await self._migrate(version)
        self.ready = True
        await self.async_mirror()

    async def _migrate(self, version: str) -> None:
        from .backup import stores  # noqa: PLC0415

        # Vorher Sicherungskopien aller betroffenen Speicher (System → Sichern → Interne Kopien)
        for key in ("general", "wasser", "layout", "wetter"):
            st = stores(self.hass).get(f"{DOMAIN}_{key}")
            if st is not None:
                try:
                    st.snapshot_now()
                except Exception:  # noqa: BLE001 - Sicherung ist nur ein Zusatz
                    _LOGGER.exception("Haus: Sicherung von %s fehlgeschlagen", key)
        gen, wm, wx = self._mgr("general"), self._mgr("wasser"), self._mgr("wetter")
        layout = await self._layout()
        self.data = clean(migrate(
            gen.data if gen else {}, (wm.modules if wm else {}).get("energy") or {},
            layout.get("wx") or {}, wx.cfg if wx else {}, self._name,
        ))
        if self.data["mig"]:
            self.data["mig"]["ver"] = version
        await self._store.async_save(self.data)
        _LOGGER.info("Haus-Werte übernommen: %s", "; ".join(self.data["mig"]["items"] if self.data["mig"] else []))

    # ---- Verteilen
    async def async_mirror(self, skip: str = "") -> None:
        """Haus-Werte an die alten Stellen schreiben, damit alle Module sie dort finden."""
        h = self.data
        gen = self._mgr("general")
        if gen is not None and skip != "general":
            pv = to_general_pv(h, gen.data.get("pv") or {})
            if pv != gen.data.get("pv"):
                gen.data = {**gen.data, "pv": pv}
                await gen.async_persist()
        wm = self._mgr("wasser")
        if wm is not None and skip != "wasser":
            en = to_energy(h)
            if en != wm.modules.get("energy"):
                wm.modules = {**wm.modules, "energy": en}
                wm.persist()
        store = self.hass.data.get(DOMAIN, {})
        if "layout" in store and skip != "layout":
            lwx = to_layout_wx(h, store["layout"].get("wx") or {})
            if lwx != (store["layout"].get("wx") or {}):
                store["layout"] = {**store["layout"], "wx": lwx} if lwx else {k: v for k, v in store["layout"].items() if k != "wx"}
                await store["layout_store"].async_save(store["layout"])
        wx = self._mgr("wetter")
        if wx is not None and skip != "wetter":
            cfg = {**wx.cfg, "wind": h["wx"]["wind"], "official": {**(wx.cfg.get("official") or {}), "ent": h["wx"]["official"]}}
            if cfg != wx.cfg:
                wx.cfg = cfg
                wx.persist()

    async def _changed(self, source: str) -> None:
        await self._store.async_save(self.data)
        await self.async_mirror(skip=source)
        gen = self._mgr("general")
        if gen is not None:
            await gen.async_recalc()
        pv = self._mgr("pv")
        if pv is not None:
            self.hass.async_create_task(pv.async_evaluate())
        gsm = self._mgr("geraete")
        if gsm is not None:
            await gsm.async_config_changed()
        wx = self._mgr("wetter")
        if wx is not None and source != "wetter":
            wx._fc_ts = 0.0  # neue Wetter-Entität: Vorhersage neu holen
            await wx.async_config_changed()

    # ---- Oberfläche
    def snapshot(self) -> dict[str, Any]:
        return {**self.data, "used": USED_BY, "schema": SCHEMA}

    async def async_set(self, raw: Any) -> dict[str, Any]:
        """Haus-Werte aus der Oberfläche. Fehlende Bereiche behalten ihren Stand."""
        raw = raw if isinstance(raw, dict) else {}
        cur = copy.deepcopy(self.data)
        for k in ("energy", "price", "wx"):
            if isinstance(raw.get(k), dict):
                cur[k] = {**cur[k], **raw[k]}
                if k == "energy" and isinstance(raw[k].get("ent"), dict):
                    cur[k]["ent"] = {**self.data["energy"]["ent"], **raw[k]["ent"]}
        if "soc" in raw:
            cur["soc"] = raw["soc"]
        if raw.get("mig_seen") and cur.get("mig"):
            cur["mig"]["seen"] = True
        self.data = clean(cur)
        await self._changed("")
        return self.snapshot()

    async def async_adopt(self, source: str, value: Any) -> None:
        """Ein älteres Fenster hat einen Haus-Wert an seiner alten Stelle geändert."""
        if not self.ready:
            return
        fn = {"general": adopt_general, "wasser": adopt_energy, "layout": adopt_layout, "wetter": adopt_wetter}[source]
        if fn(self.data, value):
            self.data = clean(self.data)
            await self._changed(source)
        # Die Quelle bekommt die Haus-Werte zurück (z. B. Netz-Sensor aus Modul 1 auch in Modul 3)
        await self.async_mirror()
