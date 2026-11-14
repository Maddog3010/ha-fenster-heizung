"""Modul 20 Abrechnungen: Home-Assistant-Teil des Addons.

Speichert Verträge und Zähler (eigener Speicher mit Sicherung), meldet sich als Preis-Anbieter am Preisdienst des Kerns an,
gibt die Zähler-Sensoren ans Messwerk und spiegelt den festen Vertragspreis in die Haus-Werte, damit alle Module mit ihm rechnen.
Gerechnet wird ausschließlich in logic.py.
"""
from __future__ import annotations

import logging
import secrets
from datetime import datetime, timedelta
from typing import Any

from homeassistant.util import dt as dt_util

from custom_components.fenster_heizung.addon_api import AddonError, SWAddon
from custom_components.fenster_heizung.const import DOMAIN

from . import logic as L

_LOGGER = logging.getLogger(__name__)

WHY = {"strom_bezug": "Zählerstand Strom Bezug", "strom_einsp": "Zählerstand Strom Einspeisung", "gas": "Zählerstand Gas (m³)", "wasser": "Zählerstand Wasser", "garten": "Unterzähler Garten"}


def _now() -> datetime:
    return dt_util.now().replace(tzinfo=None)


class Addon(SWAddon):
    async def async_setup(self) -> None:
        self.store = self.core.store(L.SCHEMA)
        self.data = L.clean_data(await self.store.async_load())
        self._day = _now().date().isoformat()
        for c in ("get", "contract", "contract_del", "meter", "meter_del", "check", "read", "read_del", "swap", "opts"):
            self.core.cmd(c, getattr(self, f"_c_{c}"))
        self.core.provide("preis_anbieter", self)
        self.core.every(300, self._tick)
        await self._mirror()

    async def async_unload(self) -> None:
        self._save(0)

    def _save(self, delay: float = 3) -> None:
        self.store.async_delay_save(lambda: self.data, delay)

    # ---- Preis-Anbieter für den Preisdienst des Kerns
    def _dyn_ct(self, when: datetime) -> float | None:
        tb = self.hass.data.get(DOMAIN, {}).get("tibber")
        try:
            return tb.current_ct(when) if tb is not None and tb.connected else None
        except Exception:  # noqa: BLE001
            return None

    def preis(self, sparte: str, when: datetime, mit_grundpreis: bool = False) -> dict[str, Any] | None:
        dyn = self._dyn_ct(when) if sparte == "strom" else None
        return L.preis(self.data, sparte, when.date(), mit_grundpreis, dyn)

    # ---- Haus-Werte: fester Vertragspreis für alle Module (Konzept F, Entscheidung 4)
    async def _mirror(self) -> list[str]:
        """Strompreis und Einspeisevergütung aus dem Vertrag in die Haus-Werte schreiben. Der Stand davor wird gemerkt und beim Ausschalten zurückgegeben."""
        haus = self.hass.data.get(DOMAIN, {}).get("haus")
        if haus is None:
            return []
        cur = dict((getattr(haus, "data", None) or {}).get("price") or {})
        today = _now().date()
        want: dict[str, Any] = {}
        if self.data["opts"]["mirror"]:
            s = L.active_contract(self.data["contracts"], "strom", today)
            u = L.unit_price(s, today) if s else None
            if u and not u["dyn"] and u["ct"] is not None:
                want.update(price=round(min(100.0, u["ct"]), 2), price_mode="fix")
            e = L.active_contract(self.data["contracts"], "einspeisung", today)
            u = L.unit_price(e, today) if e else None
            if u and u["ct"] is not None:
                want.update(feed=round(min(100.0, u["ct"]), 2), feed_mode="fix")
        prev = self.data.get("haus_prev") or {}
        # Was nicht mehr gespiegelt wird, bekommt seinen alten Wert zurück
        back = {k: v for k, v in prev.items() if k not in want and cur.get(k) != v}
        for k in list(prev):
            if k not in want:
                prev.pop(k)
        for k in want:
            prev.setdefault(k, cur.get(k))
        self.data["haus_prev"] = prev or None
        diff = {k: v for k, v in {**back, **want}.items() if cur.get(k) != v}
        if not diff:
            return []
        try:
            await haus.async_set({"price": diff})
        except Exception:  # noqa: BLE001 - Haus-Werte sind ein Zusatz, das Addon läuft auch ohne
            _LOGGER.exception("Modul 20: Haus-Werte konnten nicht aktualisiert werden")
            return []
        self._save()
        return sorted(diff)

    def managed(self) -> dict[str, bool]:
        p = self.data.get("haus_prev") or {}
        return {"price": "price" in p, "feed": "feed" in p}

    # ---- Tagesstand der Zähler mit Sensor (0 Uhr) und Preiswechsel am Stichtag
    def _sensor_val(self, eid: str) -> float | None:
        st = self.hass.states.get(eid) if eid else None
        try:
            v = float(st.state) if st is not None else None
        except ValueError:
            return None
        return v if v is not None and v == v and v >= 0 else None

    async def _tick(self, _now_: Any = None) -> None:
        now = _now()
        day = now.date().isoformat()
        if day == self._day:
            return
        self._day = day
        ts = datetime.combine(now.date(), datetime.min.time())
        n = 0
        for m in self.data["meters"]:
            v = self._sensor_val(m["sensor"])
            if v is None:
                continue
            if L.check_reading(m, v, ts, now)["level"] == "bad":
                self.core.log("warn", f"Tagesstand von {m['name']} nicht gespeichert: {v} passt nicht zum Verlauf", m["sensor"])
                continue
            L.add_reading(m, L.clean_reading({"t": ts.isoformat(), "v": v, "src": "sensor"}))
            n += 1
        if n:
            self._save()
        await self._mirror()  # Preisperiode kann heute wechseln

    # ---- Ansicht für die Seite
    def _view(self) -> dict[str, Any]:
        now = _now()
        today = now.date()
        mets = {m["id"]: m for m in self.data["meters"]}
        cards: dict[str, Any] = {}
        for sp in L.SPARTEN:
            c = L.active_contract(self.data["contracts"], sp, today)
            if c is None:
                cards[sp] = None
                continue
            dyn = self._dyn_ct(dt_util.now()) if sp == "strom" else None
            u = L.unit_price(c, today, dyn)
            start = L.billing_start(c, today)
            ms = [mets[i] for i in c["meters"] if i in mets]
            k = L.cost(c, ms, start, today + timedelta(days=1), dyn) if ms else None
            cards[sp] = {"id": c["id"], "u": u, "eff": L.eff_price(c, today, self.data["opts"]["verbrauch"][sp], dyn), "start": start.isoformat(), "cost": k, "term": L.term(c, today)}
        meters = []
        for m in self.data["meters"]:
            last = m["readings"][-1] if m["readings"] else None
            live = self._sensor_val(m["sensor"])
            meters.append({**{k: v for k, v in m.items() if k != "readings"}, "n": len(m["readings"]), "last": last, "live": live, "rate": L.rate(m),
                           "expect": L.expect(m, now), "rows": L.daily(m)[-40:][::-1], "used": [c["id"] for c in self.data["contracts"] if m["id"] in c["meters"]]})
        contracts = [{**c, "changes": L.price_changes(c), "term": L.term(c, today), "u": L.unit_price(c, today, self._dyn_ct(dt_util.now()) if c["sparte"] == "strom" else None),
                      "eff": L.eff_price(c, today, self.data["opts"]["verbrauch"][c["sparte"]], self._dyn_ct(dt_util.now()) if c["sparte"] == "strom" else None),
                      "aktiv": (L.active_contract(self.data["contracts"], c["sparte"], today) or {}).get("id") == c["id"]} for c in self.data["contracts"]]
        haus = self.hass.data.get(DOMAIN, {}).get("haus")
        return {"now": now.isoformat(timespec="minutes"), "today": today.isoformat(), "opts": self.data["opts"], "cards": cards, "contracts": contracts, "meters": meters,
                "events": L.events(self.data, today), "managed": self.managed(), "haus": dict((getattr(haus, "data", None) or {}).get("price") or {}),
                "tibber": self._dyn_ct(dt_util.now()) is not None}

    def _need_admin(self, admin: bool) -> None:
        if not admin:
            raise AddonError("Nur Administratoren können Verträge und Zähler ändern.")

    def _meter(self, mid: Any) -> dict[str, Any]:
        m = next((x for x in self.data["meters"] if x["id"] == mid), None)
        if m is None:
            raise AddonError("Zähler nicht gefunden.")
        return m

    def _new_id(self, pre: str) -> str:
        have = {x["id"] for x in self.data["contracts"] + self.data["meters"]}
        while True:
            i = pre + secrets.token_hex(3)
            if i not in have:
                return i

    # ---- Befehle
    async def _c_get(self, data: dict[str, Any], admin: bool) -> Any:
        return self._view()

    async def _c_contract(self, data: dict[str, Any], admin: bool) -> Any:
        self._need_admin(admin)
        raw = dict(data.get("contract") or {})
        if not raw.get("id"):
            raw["id"] = self._new_id("c")
        c = L.clean_contract(raw)
        if c is None:
            raise AddonError("Der Vertrag ist unvollständig (Sparte fehlt).")
        if not c["periods"]:
            raise AddonError("Bitte mindestens einen Preis mit „gültig ab“ angeben.")
        ids = {m["id"] for m in self.data["meters"]}
        c["meters"] = [m for m in c["meters"] if m in ids]
        cs = self.data["contracts"]
        i = next((k for k, x in enumerate(cs) if x["id"] == c["id"]), None)
        if i is None:
            if len(cs) >= 24:
                raise AddonError("Mehr als 24 Verträge sind nicht möglich.")
            cs.append(c)
        else:
            cs[i] = c
        self._save()
        ch = await self._mirror()
        return {**self._view(), "saved": c["id"], "mirrored": ch}

    async def _c_contract_del(self, data: dict[str, Any], admin: bool) -> Any:
        self._need_admin(admin)
        n = len(self.data["contracts"])
        self.data["contracts"] = [c for c in self.data["contracts"] if c["id"] != data.get("id")]
        if len(self.data["contracts"]) == n:
            raise AddonError("Vertrag nicht gefunden.")
        self._save()
        await self._mirror()
        return self._view()

    async def _c_meter(self, data: dict[str, Any], admin: bool) -> Any:
        self._need_admin(admin)
        raw = dict(data.get("meter") or {})
        old = next((x for x in self.data["meters"] if x["id"] == raw.get("id")), None)
        if not raw.get("id"):
            raw["id"] = self._new_id("m")
        raw["readings"] = old["readings"] if old else []
        m = L.clean_meter(raw)
        if m is None:
            raise AddonError("Bitte die Art des Zählers wählen.")
        if old:
            self.data["meters"][self.data["meters"].index(old)] = m
        else:
            if len(self.data["meters"]) >= 16:
                raise AddonError("Mehr als 16 Zähler sind nicht möglich.")
            self.data["meters"].append(m)
            sp = L.ARTEN[m["art"]][0]  # neuen Zähler gleich dem laufenden Vertrag der Sparte zuordnen
            c = L.active_contract(self.data["contracts"], sp, _now().date())
            if c is not None and m["id"] not in c["meters"]:
                c["meters"].append(m["id"])
        self._save()
        return {**self._view(), "saved": m["id"]}

    async def _c_meter_del(self, data: dict[str, Any], admin: bool) -> Any:
        self._need_admin(admin)
        m = self._meter(data.get("id"))
        self.data["meters"].remove(m)
        for c in self.data["contracts"]:
            c["meters"] = [x for x in c["meters"] if x != m["id"]]
        self._save()
        return self._view()

    def _parse(self, data: dict[str, Any]) -> tuple[dict[str, Any], float, datetime]:
        m = self._meter(data.get("id"))
        try:
            v = float(data.get("v"))
        except (TypeError, ValueError) as e:
            raise AddonError("Bitte einen Zählerstand als Zahl eingeben.") from e
        ts = L.parse_ts(data.get("t")) or _now().replace(second=0, microsecond=0)
        if v < 0:
            raise AddonError("Ein Zählerstand kann nicht negativ sein.")
        return m, v, ts

    async def _c_check(self, data: dict[str, Any], admin: bool) -> Any:
        """Prüfung beim Tippen, ohne zu speichern."""
        m, v, ts = self._parse(data)
        return L.check_reading(m, v, ts, _now())

    async def _c_read(self, data: dict[str, Any], admin: bool) -> Any:
        """Ablesung speichern. Ablesen dürfen alle Nutzer, Warnungen brauchen eine Bestätigung (force)."""
        m, v, ts = self._parse(data)
        chk = L.check_reading(m, v, ts, _now())
        if chk["level"] == "bad" or (chk["level"] == "warn" and not data.get("force")):
            return {"check": chk, "saved": False}
        from custom_components.fenster_heizung.verlauf import WHO
        r = L.clean_reading({"t": ts.isoformat(), "v": v, "src": data.get("src") if data.get("src") in ("manuell", "nfc", "foto", "rechnung") else "manuell", "who": WHO.get(""), "note": data.get("note")})
        L.add_reading(m, r)
        self._save()
        return {**self._view(), "check": chk, "saved": True}

    async def _c_read_del(self, data: dict[str, Any], admin: bool) -> Any:
        self._need_admin(admin)
        m = self._meter(data.get("id"))
        n = len(m["readings"])
        m["readings"] = [r for r in m["readings"] if r["t"] != data.get("t")]
        if len(m["readings"]) == n:
            raise AddonError("Ablesung nicht gefunden.")
        self._save()
        return self._view()

    async def _c_swap(self, data: dict[str, Any], admin: bool) -> Any:
        """Zählerwechsel: Endstand des alten und Anfangsstand des neuen Zählers, neue Nummer und Eichfrist."""
        self._need_admin(admin)
        m = self._meter(data.get("id"))
        ts = L.parse_ts(data.get("t")) or _now().replace(second=0, microsecond=0)
        try:
            end, start = float(data.get("end")), float(data.get("start") or 0)
        except (TypeError, ValueError) as e:
            raise AddonError("Bitte Endstand und Anfangsstand als Zahl eingeben.") from e
        if m["readings"] and (ts.isoformat(timespec="minutes") <= m["readings"][-1]["t"]):
            raise AddonError("Der Wechsel muss nach der letzten Ablesung liegen.")
        chk = L.check_reading(m, end, ts, _now())
        if chk["level"] == "bad":
            raise AddonError(f"Endstand: {chk['msg']}")
        L.add_reading(m, L.clean_reading({"t": ts.isoformat(), "v": end, "src": "manuell", "note": "Endstand vor Zählerwechsel"}))
        L.add_reading(m, L.clean_reading({"t": (ts + timedelta(minutes=1)).isoformat(), "v": start, "src": "start", "start": True, "note": "Anfangsstand neuer Zähler"}))
        if data.get("nr") is not None:
            m["nr"] = L._t(data.get("nr"), 30)  # noqa: SLF001
        if data.get("eich"):
            m["eich"] = int(L._f(data.get("eich"), 0, 2100, 0))  # noqa: SLF001
        self._save()
        return self._view()

    async def _c_opts(self, data: dict[str, Any], admin: bool) -> Any:
        self._need_admin(admin)
        o = data.get("opts") if isinstance(data.get("opts"), dict) else {}
        cur = self.data["opts"]
        merged = {"mirror": o.get("mirror", cur["mirror"]), "verbrauch": {**cur["verbrauch"], **(o.get("verbrauch") if isinstance(o.get("verbrauch"), dict) else {})}}
        self.data["opts"] = L.clean_data({"opts": merged})["opts"]
        self._save()
        ch = await self._mirror()
        return {**self._view(), "mirrored": ch}

    # ---- Messwerk, Start, Einstellungen
    def messwerk(self) -> list[dict[str, Any]]:
        return [{"id": m["id"], "name": f"Zähler · {m['name']}", "eid": m["sensor"], "why": WHY[m["art"]], "group": "strom" if m["art"].startswith("strom") else "wasser", "unit": m["unit"], "tab": "meter"} for m in self.data["meters"] if m["sensor"]]

    def summary(self) -> dict[str, Any]:
        today = _now().date()
        nc = sum(1 for c in self.data["contracts"] if not c["ende"] or c["ende"] >= today.isoformat())
        nm = len(self.data["meters"])
        hints = [{"i": "clock", "t": e["t"], "s": f"in {e['tage']} Tagen · {e['s']}" if e["tage"] > 0 else f"heute · {e['s']}", "c": "wa"} for e in L.events(self.data, today) if e["k"] == "frist" and e["tage"] <= 30][:2]
        sub = f"{nc} {'Vertrag' if nc == 1 else 'Verträge'} · {nm} Zähler" if nc or nm else "Noch nichts angelegt"
        return {"tile": {"sub": sub, "c": ""}, "hints": hints, "info": sub, "managed": self.managed()}

    async def async_remove(self, keep: bool) -> None:
        """Beim Deinstallieren bleibt der zuletzt gültige Preis in den Haus-Werten stehen (Konzept W6) – nichts zurückdrehen."""
