"""Modul 20 Abrechnungen: Home-Assistant-Teil des Addons.

Speichert Verträge und Zähler (eigener Speicher mit Sicherung), meldet sich als Preis-Anbieter am Preisdienst des Kerns an,
gibt die Zähler-Sensoren ans Messwerk und spiegelt den festen Vertragspreis in die Haus-Werte, damit alle Module mit ihm rechnen.
Gerechnet wird ausschließlich in logic.py.
"""
from __future__ import annotations

import base64
import logging
import os
import re
import secrets
import time
from datetime import datetime, timedelta
from typing import Any

from homeassistant.util import dt as dt_util

from custom_components.fenster_heizung.addon_api import AddonError, SWAddon
from custom_components.fenster_heizung.const import DOMAIN, PANEL_URL

from . import logic as L

_LOGGER = logging.getLogger(__name__)

BELEG_MAX = 3_000_000  # Byte; die Websocket-Nachricht von Home Assistant darf höchstens 4 MB groß sein (Base64 + 33 %)
BELEG_EXT = {"application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/heic": "heic", "image/webp": "webp"}
WHY = {"strom_bezug": "Zählerstand Strom Bezug", "strom_einsp": "Zählerstand Strom Einspeisung", "gas": "Zählerstand Gas (m³)", "wasser": "Zählerstand Wasser", "garten": "Unterzähler Garten"}


def _now() -> datetime:
    return dt_util.now().replace(tzinfo=None)


class Addon(SWAddon):
    async def async_setup(self) -> None:
        self.store = self.core.store(1)  # Speicher-Version bleibt 1, die Datenstufe steht in data["v"] (clean_data stellt um)
        self.data = L.clean_data(await self.store.async_load())
        self._day = _now().date().isoformat()
        self._dyn: dict[str, Any] = {"t": 0.0, "res": None, "busy": False}
        for c in ("get", "contract", "contract_del", "meter", "meter_del", "check", "read", "read_del", "swap", "opts", "abplan", "pay", "pay_del", "vgl",
                  "inv", "inv_del", "inv_learn", "beleg_get", "car", "car_del", "entry", "entry_del", "item", "item_del", "book", "book_del"):
            self.core.cmd(c, getattr(self, f"_c_{c}"))
        self.core.provide("preis_anbieter", self)
        self.core.provide("abrechnung", self)  # für Tags & Karten (Zählerstand, Tankbeleg, Vorrat entnommen)
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

    def _dyn_avg(self) -> float | None:
        """Für Kosten und Hochrechnung eines dynamischen Vertrags: Ø Börsenpreis der letzten 30 Tage, gewichtet mit dem eigenen Bezug
        (ohne Aufschlag – den rechnet logic.py dazu). Ohne Vergleichsdaten der Preis der aktuellen Stunde wie bisher."""
        r = self._dyn.get("res")
        if r and r.get("abdeckung", 0) >= 70:
            return r["avg_ct"] - r.get("auf", 0.0)
        return self._dyn_ct(dt_util.now())

    async def _dyn_refresh(self) -> None:
        """Stundenvergleich dynamisch/fest: Netzbezug je Stunde aus dem Haus-Energiebuch, Börsenpreise je Stunde aus dem Tibber-Verlauf.
        Höchstens alle 6 Stunden, nur mit dynamischem Stromvertrag. Ohne Energiebuch oder Tibber bleibt der Vergleich leer."""
        st = self.hass.data.get(DOMAIN, {})
        today = _now().date()
        c = L.active_contract(self.data["contracts"], "strom", today)
        p = L.period_at(c, today) if c else None
        tb, eb = st.get("tibber"), st.get("ebuch")
        if self._dyn["busy"] or not p or p.get("mode") != "dyn" or tb is None or eb is None or not getattr(tb, "connected", False):
            if not (p and p.get("mode") == "dyn"):
                self._dyn.update(t=time.time(), res=None)
            return
        if time.time() - self._dyn["t"] < 6 * 3600 and self._dyn["res"] is not None:
            return
        self._dyn["busy"] = True
        try:
            d0 = today - timedelta(days=30)
            q = eb.query(d0.isoformat(), today.isoformat(), "hour")
            i = list(q.get("fields") or []).index("imp")
            hours: list[tuple[int, float]] = []
            for row in q.get("rows") or []:
                # Energiebuch zählt nach Ortszeit (Tag + Stunde), Tibber nach Zeitstempel: beides auf die volle Stunde in Sekunden
                ts = datetime.fromisoformat(f"{row['d']}T{int(row['h']):02d}:00").replace(tzinfo=dt_util.DEFAULT_TIME_ZONE).timestamp()
                hours.append((int(ts) // 3600 * 3600, float(row["v"][i])))
            prices = await tb.async_history(dt_util.start_of_local_day(datetime.combine(d0, datetime.min.time())), dt_util.start_of_local_day(datetime.combine(today, datetime.min.time())))
            u = L.unit_price(c, today, 0.0) or {}
            auf = (u.get("ct") or 0.0)  # mit Börsenpreis 0 bleibt genau der Aufschlag (brutto) übrig
            res = L.dyn_compare(hours, prices, auf, u.get("grund", 0.0), self.data["opts"].get("vgl"))
            if res:
                res["auf"] = round(auf, 4)
                res["von"] = d0.isoformat()
            self._dyn.update(t=time.time(), res=res)
        except Exception:  # noqa: BLE001 - der Vergleich ist ein Zusatz
            _LOGGER.debug("Modul 20: Vergleich dynamisch/fest nicht möglich", exc_info=True)
            self._dyn.update(t=time.time())
        finally:
            self._dyn["busy"] = False

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
        n += self._stock_from_sensors(now)
        if n:
            self._save()
        await self._mirror()  # Preisperiode kann heute wechseln
        await self._dyn_refresh()
        await self._remind(now)

    # ---- Ansicht für die Seite
    def _view(self) -> dict[str, Any]:
        now = _now()
        today = now.date()
        mets = {m["id"]: m for m in self.data["meters"]}
        cards: dict[str, Any] = {}
        if self._dyn["res"] is None and time.time() - self._dyn["t"] > 600:
            self.hass.async_create_task(self._dyn_refresh())
        for sp in L.SPARTEN:
            c = L.active_contract(self.data["contracts"], sp, today)
            if c is None:
                cards[sp] = None
                continue
            dyn = self._dyn_ct(dt_util.now()) if sp == "strom" else None
            avg = self._dyn_avg() if sp == "strom" else None
            u = L.unit_price(c, today, dyn)
            start = L.billing_start(c, today)
            ms = [mets[i] for i in c["meters"] if i in mets]
            k = L.cost(c, ms, start, today + timedelta(days=1), avg) if ms else None
            try:
                fc = L.forecast(c, ms, today, self.data["opts"]["verbrauch"][sp], avg)
            except Exception:  # noqa: BLE001 - eine fehlerhafte Hochrechnung darf die Seite nicht sperren
                _LOGGER.exception("Modul 20: Hochrechnung %s", sp)
                fc = None
            cards[sp] = {"id": c["id"], "u": u, "eff": L.eff_price(c, today, self.data["opts"]["verbrauch"][sp], dyn), "start": start.isoformat(), "cost": k, "term": L.term(c, today), "fc": fc}
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
        tol = self.data["opts"]["tol"]
        invs = []
        for c in self.data["contracts"]:
            ms = [mets[i] for i in c["meters"] if i in mets]
            fc = (cards.get(c["sparte"]) or {}).get("fc") if (cards.get(c["sparte"]) or {}).get("id") == c["id"] else None
            for r in c["rechnungen"]:
                try:
                    invs.append(L.invoice_view(c, ms, r, tol, today, fc))
                except Exception:  # noqa: BLE001
                    _LOGGER.exception("Modul 20: Rechnungsprüfung %s", r["id"])
        invs.sort(key=lambda x: x["bis"], reverse=True)
        cars = []
        for v in self.data["fahrzeuge"]:
            skm = self._sensor_val(v["sensor"])
            y0 = today.replace(month=1, day=1)
            cars.append({**{k: x for k, x in v.items() if k != "eintraege"}, "eintraege": v["eintraege"][-60:][::-1], "n": len(v["eintraege"]), "km_live": skm,
                         "monat": L.vehicle_stats(v, today.replace(day=1), L.add_months(today.replace(day=1), 1), now, skm),
                         "jahr": L.vehicle_stats(v, y0, y0.replace(year=y0.year + 1), now, skm),
                         "d30": L.vehicle_stats(v, today - timedelta(days=90), today + timedelta(days=1), now, skm)})
        home_ct = (L.preis(self.data, "strom", today, False, self._dyn_avg()) or {}).get("ct")
        items = [{**{k: x for k, x in it.items() if k != "buchungen"}, "buchungen": it["buchungen"][-40:][::-1], "st": L.stock(it, today), "live": self._sensor_val(it["sensor"])} for it in self.data["vorraete"]]
        return {"now": now.isoformat(timespec="minutes"), "rechnungen": invs, "fahrzeuge": cars, "vorraete": items, "home_ct": home_ct,
                "notify_svc": sorted(n for n in (self.hass.services.async_services().get("notify") or {}) if n not in ("notify", "persistent_notification"))[:30] if hasattr(self.hass.services, "async_services") else [],
                "todos": sorted(s.entity_id for s in self.hass.states.async_all("todo"))[:20] if hasattr(self.hass.states, "async_all") else [], "today": today.isoformat(), "opts": self.data["opts"], "cards": cards, "contracts": contracts, "meters": meters,
                "events": L.events(self.data, today), "managed": self.managed(), "haus": dict((getattr(haus, "data", None) or {}).get("price") or {}),
                "tibber": self._dyn_ct(dt_util.now()) is not None, "dyncmp": self._dyn.get("res"), "sum": self._sum(cards),
                "ebuch": DOMAIN in self.hass.data and "ebuch" in self.hass.data[DOMAIN]}

    @staticmethod
    def _sum(cards: dict[str, Any]) -> dict[str, Any]:
        """Banner: erwartetes Ergebnis über alle Sparten mit Abschlag (+ Guthaben, – Nachzahlung) und die Gutschrift der Einspeisung."""
        parts = [(sp, X["fc"]) for sp, X in cards.items() if X and X.get("fc") and X["fc"].get("ergebnis") is not None]
        e = cards.get("einspeisung")
        return {"ergebnis": round(sum(f["ergebnis"] for _, f in parts), 2) if parts else None, "lo": round(sum(f["erg_lo"] for _, f in parts), 2) if parts else None,
                "hi": round(sum(f["erg_hi"] for _, f in parts), 2) if parts else None, "teile": [sp for sp, _ in parts],
                "einspeisung": e["fc"]["total"] if e and e.get("fc") else None}

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
        merged = {**cur, **{k: o[k] for k in ("mirror", "notify", "remind", "tol", "todo", "solar") if k in o},
                  "verbrauch": {**cur["verbrauch"], **(o.get("verbrauch") if isinstance(o.get("verbrauch"), dict) else {})}}
        self.data["opts"] = L.clean_data({"opts": merged})["opts"]
        self._save()
        ch = await self._mirror()
        return {**self._view(), "mirrored": ch}

    def _contract(self, cid: Any) -> dict[str, Any]:
        c = next((x for x in self.data["contracts"] if x["id"] == cid), None)
        if c is None:
            raise AddonError("Vertrag nicht gefunden.")
        return c

    async def _c_abplan(self, data: dict[str, Any], admin: bool) -> Any:
        """Abschlag ändern: neuer Betrag ab einem Tag (Rhythmus, Fälligkeitstag). del=True entfernt die Änderung an diesem Tag."""
        self._need_admin(admin)
        c = self._contract(data.get("id"))
        ab = L.parse_date(data.get("ab"))
        if ab is None:
            raise AddonError("Bitte „gültig ab“ als Datum angeben.")
        rest = [x for x in c["abplan"] if x["ab"] != ab.isoformat()]
        if not data.get("del"):
            rest.append({"ab": ab.isoformat(), "betrag": data.get("betrag"), "rhythmus": data.get("rhythmus") or c["abschlag"]["rhythmus"], "tag": data.get("tag") or c["abschlag"]["tag"], "note": data.get("note")})
        c["abplan"] = L.clean_abplan(rest)
        cur = L.abschlag_at(c, _now().date())
        c["abschlag"] = {"betrag": cur["betrag"], "rhythmus": cur["rhythmus"], "tag": cur["tag"]}  # der heute gültige Abschlag steht auch im Vertrag
        self._save()
        return self._view()

    async def _c_pay(self, data: dict[str, Any], admin: bool) -> Any:
        """Zahlung buchen: am Tag eines geplanten Abschlags ersetzt sie ihn (0 € = ausgefallen), sonst Sonderzahlung."""
        self._need_admin(admin)
        c = self._contract(data.get("id"))
        if not L.parse_date(data.get("d")):
            raise AddonError("Bitte das Datum der Zahlung angeben.")
        try:
            float(data.get("betrag"))
        except (TypeError, ValueError) as e:
            raise AddonError("Bitte den Betrag als Zahl eingeben.") from e
        c["zahlungen"] = L.clean_pays([x for x in c["zahlungen"] if x["d"] != str(data.get("d"))[:10]] + [{"d": data.get("d"), "betrag": data.get("betrag"), "note": data.get("note")}])
        self._save()
        return self._view()

    async def _c_pay_del(self, data: dict[str, Any], admin: bool) -> Any:
        self._need_admin(admin)
        c = self._contract(data.get("id"))
        n = len(c["zahlungen"])
        c["zahlungen"] = [x for x in c["zahlungen"] if x["d"] != data.get("d")]
        if len(c["zahlungen"]) == n:
            raise AddonError("Buchung nicht gefunden.")
        self._save()
        return self._view()

    async def _c_vgl(self, data: dict[str, Any], admin: bool) -> Any:
        """Fester Vergleichspreis für den dynamischen Stromvertrag (leer = kein Vergleich)."""
        self._need_admin(admin)
        self.data["opts"]["vgl"] = L.clean_data({"opts": {"vgl": data.get("vgl") or {}}})["opts"]["vgl"]
        self._save()
        self._dyn["t"] = 0.0
        await self._dyn_refresh()
        return self._view()

    # ---- v0.5 Rechnungen und Belege
    def _beleg_dir(self) -> str:
        return self.hass.config.path("strom_waerme", "belege")

    async def _beleg_put(self, cid: str, iid: str, raw: dict[str, Any]) -> dict[str, Any]:
        typ = str(raw.get("type") or "")
        ext = BELEG_EXT.get(typ)
        if ext is None:
            raise AddonError("Als Beleg gehen PDF, JPG, PNG, HEIC oder WebP.")
        try:
            blob = base64.b64decode(str(raw.get("data") or ""), validate=True)
        except (ValueError, TypeError) as e:
            raise AddonError("Der Beleg ließ sich nicht lesen.") from e
        if not blob or len(blob) > BELEG_MAX:
            raise AddonError("Der Beleg ist größer als 3 MB. Fotos werden vorher verkleinert, bei PDF bitte eine kleinere Datei wählen.")
        name = f"{cid}_{iid}.{ext}"
        folder = self._beleg_dir()

        def _write() -> None:
            os.makedirs(folder, exist_ok=True)
            for old in os.listdir(folder):  # alter Beleg derselben Rechnung mit anderer Endung
                if old.startswith(f"{cid}_{iid}.") and old != name:
                    os.remove(os.path.join(folder, old))
            with open(os.path.join(folder, name), "wb") as fh:
                fh.write(blob)
        await self.hass.async_add_executor_job(_write)
        return {"name": L._t(raw.get("name"), 80) or name, "file": name, "size": len(blob), "type": typ}  # noqa: SLF001

    async def _beleg_del(self, b: dict[str, Any] | None) -> None:
        if not b or not b.get("file"):
            return
        path = os.path.join(self._beleg_dir(), b["file"])
        await self.hass.async_add_executor_job(lambda: os.path.exists(path) and os.remove(path))

    def _inv(self, cid: Any, iid: Any) -> tuple[dict[str, Any], dict[str, Any]]:
        c = self._contract(cid)
        r = next((x for x in c["rechnungen"] if x["id"] == iid), None)
        if r is None:
            raise AddonError("Rechnung nicht gefunden.")
        return c, r

    async def _c_inv(self, data: dict[str, Any], admin: bool) -> Any:
        """Rechnung anlegen oder ändern, optional mit neuem Beleg (Base64)."""
        self._need_admin(admin)
        c = self._contract(data.get("cid"))
        raw = dict(data.get("inv") or {})
        old = next((x for x in c["rechnungen"] if x["id"] == raw.get("id")), None)
        if not raw.get("id"):
            raw["id"] = "r" + secrets.token_hex(3)
        raw["beleg"] = old["beleg"] if old else None
        raw["gelernt"] = old["gelernt"] if old else False
        r = L.clean_invoice(raw)
        if r is None:
            raise AddonError("Bitte den Zeitraum der Rechnung angeben (von und bis).")
        if isinstance(data.get("beleg"), dict) and data["beleg"].get("data"):
            await self._beleg_del(r["beleg"])
            r["beleg"] = await self._beleg_put(c["id"], r["id"], data["beleg"])
        elif data.get("beleg_del"):
            await self._beleg_del(r["beleg"])
            r["beleg"] = None
        c["rechnungen"] = sorted([x for x in c["rechnungen"] if x["id"] != r["id"]] + [r], key=lambda x: x["bis"])[-30:]
        self._save()
        return {**self._view(), "saved": r["id"]}

    async def _c_inv_del(self, data: dict[str, Any], admin: bool) -> Any:
        self._need_admin(admin)
        c, r = self._inv(data.get("cid"), data.get("id"))
        await self._beleg_del(r["beleg"])
        c["rechnungen"].remove(r)
        self._save()
        return self._view()

    async def _c_inv_learn(self, data: dict[str, Any], admin: bool) -> Any:
        """Aus der Rechnung lernen: Brennwert/Zustandszahl, neuer Abschlag ab dem nächsten Termin, Zählerstände als Ablesung (Quelle Rechnung)."""
        self._need_admin(admin)
        c, r = self._inv(data.get("cid"), data.get("id"))
        keys = set(data.get("keys") or [])
        today = _now().date()
        done = []
        if "bw" in keys and c["sparte"] == "gas" and r["brennwert"]:
            c["brennwert"], c["zustand"] = r["brennwert"], r["zustand"] or c["zustand"]
            done.append("Brennwert")
        if "ab" in keys and r["neu_abschlag"]:
            cur = L.abschlag_at(c, today)
            nx = next((x for x in L.schedule(c, today + timedelta(days=1), L.add_months(today, 4)) if x["src"] == "plan"), None)
            ab = nx["d"] if nx else L.add_months(today.replace(day=1), 1).replace(day=cur["tag"]).isoformat()
            c["abplan"] = L.clean_abplan([x for x in c["abplan"] if x["ab"] != ab] + [{"ab": ab, "betrag": r["neu_abschlag"], "rhythmus": cur["rhythmus"], "tag": cur["tag"], "note": "laut Rechnung"}])
            done.append("Abschlag")
        if "st" in keys:
            mets = [m for m in self.data["meters"] if m["id"] in c["meters"] and m["art"] != "garten"]
            if len(mets) == 1:
                m = mets[0]
                for d, v in ((r["von"], r["anfang"]), (L.parse_date(r["bis"]) + timedelta(days=1), r["ende"])):
                    if v is None:
                        continue
                    ts = L._day0(L.parse_date(d))  # noqa: SLF001
                    near = any(abs((L.parse_ts(x["t"]) - ts).total_seconds()) < 86400 for x in m["readings"])
                    if not near and L.check_reading(m, v, ts, _now())["level"] != "bad":
                        L.add_reading(m, L.clean_reading({"t": ts.isoformat(), "v": v, "src": "rechnung", "note": "laut Rechnung"}))
                done.append("Zählerstände")
        r["gelernt"] = True
        self._save()
        return {**self._view(), "done": done}

    async def _c_beleg_get(self, data: dict[str, Any], admin: bool) -> Any:
        _, r = self._inv(data.get("cid"), data.get("id"))
        b = r["beleg"]
        if not b:
            raise AddonError("Zu dieser Rechnung gibt es keinen Beleg.")
        path = os.path.join(self._beleg_dir(), b["file"])

        def _read() -> bytes | None:
            if not os.path.exists(path):
                return None
            with open(path, "rb") as fh:
                return fh.read()
        blob = await self.hass.async_add_executor_job(_read)
        if blob is None:
            raise AddonError("Die Datei des Belegs fehlt (Ordner strom_waerme/belege).")
        return {"name": b["name"], "type": b["type"], "data": base64.b64encode(blob).decode()}

    # ---- v0.5 Fahrtkosten
    def _car(self, vid: Any) -> dict[str, Any]:
        v = next((x for x in self.data["fahrzeuge"] if x["id"] == vid), None)
        if v is None:
            raise AddonError("Fahrzeug nicht gefunden.")
        return v

    async def _c_car(self, data: dict[str, Any], admin: bool) -> Any:
        self._need_admin(admin)
        raw = dict(data.get("car") or {})
        old = next((x for x in self.data["fahrzeuge"] if x["id"] == raw.get("id")), None)
        if not raw.get("id"):
            raw["id"] = "v" + secrets.token_hex(3)
        raw["eintraege"] = old["eintraege"] if old else []
        v = L.clean_vehicle(raw)
        if old:
            self.data["fahrzeuge"][self.data["fahrzeuge"].index(old)] = v
        else:
            if len(self.data["fahrzeuge"]) >= 8:
                raise AddonError("Mehr als 8 Fahrzeuge sind nicht möglich.")
            self.data["fahrzeuge"].append(v)
        self._save()
        return {**self._view(), "saved": v["id"]}

    async def _c_car_del(self, data: dict[str, Any], admin: bool) -> Any:
        self._need_admin(admin)
        self.data["fahrzeuge"].remove(self._car(data.get("id")))
        self._save()
        return self._view()

    async def _c_entry(self, data: dict[str, Any], admin: bool) -> Any:
        """Tanken, Laden (zuhause/unterwegs), Kilometerstand oder Fixkosten. Erfassen dürfen alle, ändern nur Administratoren."""
        v = self._car(data.get("vid"))
        raw = dict(data.get("entry") or {})
        if raw.get("id") and not admin:
            raise AddonError("Nur Administratoren können Einträge ändern.")
        if not raw.get("id"):
            raw["id"] = "e" + secrets.token_hex(3)
        e = L.clean_entry(raw)
        if e is None:
            raise AddonError("Bitte Art und Datum angeben.")
        if e["art"] in ("tanken", "laden_haus", "laden_weg") and (e["menge"] is None or e["betrag"] is None):
            raise AddonError("Bitte zwei von drei Werten eingeben: Menge, Preis, Betrag.")
        if e["art"] == "km" and not e["km"]:
            raise AddonError("Bitte den Kilometerstand eingeben.")
        prev = [x for x in v["eintraege"] if x["km"] and x["t"] < e["t"] and x["id"] != e["id"]]
        if e["km"] and prev and e["km"] < prev[-1]["km"]:
            raise AddonError(f"Der Kilometerstand ist kleiner als am {L._de(prev[-1]['t'])} ({int(prev[-1]['km'])} km).")  # noqa: SLF001
        v["eintraege"] = sorted([x for x in v["eintraege"] if x["id"] != e["id"]] + [e], key=lambda x: x["t"])[-600:]
        self._save()
        return {**self._view(), "saved": e["id"]}

    async def _c_entry_del(self, data: dict[str, Any], admin: bool) -> Any:
        self._need_admin(admin)
        v = self._car(data.get("vid"))
        v["eintraege"] = [x for x in v["eintraege"] if x["id"] != data.get("id")]
        self._save()
        return self._view()

    # ---- v0.5 Vorräte
    def _item(self, iid: Any) -> dict[str, Any]:
        it = next((x for x in self.data["vorraete"] if x["id"] == iid), None)
        if it is None:
            raise AddonError("Vorrat nicht gefunden.")
        return it

    async def _c_item(self, data: dict[str, Any], admin: bool) -> Any:
        self._need_admin(admin)
        raw = dict(data.get("item") or {})
        old = next((x for x in self.data["vorraete"] if x["id"] == raw.get("id")), None)
        if not raw.get("id"):
            raw["id"] = "s" + secrets.token_hex(3)
        raw["buchungen"] = old["buchungen"] if old else []
        it = L.clean_item(raw)
        if it is None:
            raise AddonError("Bitte die Art des Vorrats wählen.")
        if not old and data.get("start") not in (None, ""):
            it["buchungen"].append({"id": "b" + secrets.token_hex(3), "t": _now().isoformat(timespec="minutes"), "art": "zaehlung", "menge": L._f(data.get("start"), 0, 1e6, 0.0), "betrag": 0.0, "liefer": "", "note": "Startbestand", "src": "manuell"})  # noqa: SLF001
        if old:
            self.data["vorraete"][self.data["vorraete"].index(old)] = it
        else:
            if len(self.data["vorraete"]) >= 30:
                raise AddonError("Mehr als 30 Vorräte sind nicht möglich.")
            self.data["vorraete"].append(it)
        self._save()
        return {**self._view(), "saved": it["id"]}

    async def _c_item_del(self, data: dict[str, Any], admin: bool) -> Any:
        self._need_admin(admin)
        self.data["vorraete"].remove(self._item(data.get("id")))
        self._save()
        return self._view()

    def _book(self, it: dict[str, Any], art: str, menge: float, betrag: float = 0.0, liefer: str = "", note: str = "", src: str = "manuell") -> None:
        it["buchungen"] = sorted(it["buchungen"] + [{"id": "b" + secrets.token_hex(3), "t": _now().isoformat(timespec="minutes"), "art": art, "menge": menge, "betrag": betrag,
                                                     "liefer": liefer, "note": note, "src": src}], key=lambda x: x["t"])[-500:]

    async def _c_book(self, data: dict[str, Any], admin: bool) -> Any:
        """Einkauf (Bestand steigt, Durchschnittspreis neu), Entnahme oder Zählung. Entnehmen und zählen dürfen alle."""
        it = self._item(data.get("id"))
        art = data.get("art")
        if art not in L.BUCH_ART:
            raise AddonError("Unbekannte Buchung.")
        if art == "kauf" and not admin:
            raise AddonError("Nur Administratoren können Einkäufe buchen.")
        try:
            menge = float(str(data.get("menge")).replace(",", "."))
        except (TypeError, ValueError) as e:
            raise AddonError("Bitte die Menge als Zahl eingeben.") from e
        if menge < 0 or (art != "zaehlung" and menge == 0):
            raise AddonError("Die Menge muss größer als 0 sein.")
        betrag = L._f(data.get("betrag"), 0, 1e6, 0.0) if art == "kauf" else 0.0  # noqa: SLF001
        if art == "kauf" and betrag <= 0:
            raise AddonError("Bitte den Betrag des Einkaufs eingeben.")
        t = L.parse_ts(data.get("t"))
        self._book(it, art, menge, betrag, L._t(data.get("liefer"), 40), L._t(data.get("note"), 60), "liste" if data.get("src") == "liste" else "manuell")  # noqa: SLF001
        if t:
            it["buchungen"][-1]["t"] = t.isoformat(timespec="minutes")
            it["buchungen"].sort(key=lambda x: x["t"])
        self._save()
        return self._view()

    async def _c_book_del(self, data: dict[str, Any], admin: bool) -> Any:
        self._need_admin(admin)
        it = self._item(data.get("id"))
        it["buchungen"] = [x for x in it["buchungen"] if x["id"] != data.get("bid")]
        self._save()
        return self._view()

    def _stock_from_sensors(self, now: datetime) -> int:
        """Vorräte mit Füllstand-Sensor: einmal am Tag eine Zählung, wenn sich der Bestand geändert hat (Liter oder % × Lagergröße)."""
        n = 0
        for it in self.data["vorraete"]:
            v = self._sensor_val(it["sensor"])
            if v is None:
                continue
            if it["pct"] and it["lager"]:
                v = it["lager"] * min(100.0, v) / 100
            cur = L.stock(it, now.date())["bestand"]
            if abs(v - cur) >= max(0.001, (it["lager"] or 1) * 0.002):
                self._book(it, "zaehlung", round(v, 3), note="Füllstand-Sensor", src="sensor")
                n += 1
        return n

    # ---- v0.5 Erinnerungen: Stichtag, Mindestbestand
    async def _push(self, title: str, msg: str, url: str, key: str) -> int:
        to = self.data["opts"]["notify"]
        n = 0
        for svc in to:
            name = svc.split(".", 1)[1]
            if not self.hass.services.has_service("notify", name):
                continue
            try:
                await self.hass.services.async_call("notify", name, {"title": title, "message": msg, "data": {"tag": f"fh_abr_{key}", "url": url, "clickAction": url}}, blocking=False)
                n += 1
            except Exception:  # noqa: BLE001
                self.core.log("warn", f"Meldung an {svc} fehlgeschlagen")
        return n

    def _url(self, **q: str) -> str:
        return f"/{PANEL_URL}?modul=abrechnung" + "".join(f"&{k}={v}" for k, v in q.items())

    async def _remind(self, now: datetime) -> None:
        today = now.date()
        sent = self.data["sent"]
        o = self.data["opts"]
        if o["remind"]["on"]:
            for c in self.data["contracts"]:
                if c["sparte"] == "einspeisung" or c.get("zahl") == "monat" or (c["ende"] and c["ende"] < today.isoformat()):
                    continue
                _, e = L.bounds(c, today)
                stich = e - timedelta(days=1)
                if (stich - today).days != o["remind"]["tage"]:
                    continue
                for mid in c["meters"]:
                    m = next((x for x in self.data["meters"] if x["id"] == mid), None)
                    key = f"st_{mid}_{stich.isoformat()}"
                    if m is None or m["sensor"] or key in sent:
                        continue
                    when = "heute" if o["remind"]["tage"] == 0 else f"am {stich.strftime('%d.%m.')}"
                    await self._push(f"Zählerstand {m['name']}", f"Stichtag {when}: Bitte den Zähler ablesen – ein Tipp öffnet die Eingabe.", self._url(abr="read", m=mid), key)
                    sent[key] = today.isoformat()
        for it in self.data["vorraete"]:
            st = L.stock(it, today)
            key = f"min_{it['id']}"
            if st["unter_min"] and key not in sent:
                await self._push(f"{it['name']} nachkaufen", f"Bestand {L._n(st['bestand'], 1)} {it['unit']} – Mindestbestand {L._n(it['min'], 1)} {it['unit']}.", self._url(abr="stock", s=it["id"]), key)  # noqa: SLF001
                if o["todo"] and self.hass.states.get(o["todo"]) is not None:
                    try:
                        await self.hass.services.async_call("todo", "add_item", {"entity_id": o["todo"], "item": f"{it['name']} (Strom & Wärme)"}, blocking=False)
                    except Exception:  # noqa: BLE001
                        self.core.log("warn", f"To-do-Liste {o['todo']}: Eintrag nicht möglich")
                sent[key] = today.isoformat()
            elif not st["unter_min"] and key in sent:
                sent.pop(key)  # wieder aufgefüllt: beim nächsten Unterschreiten erneut melden
        if len(sent) > 200:
            for k in sorted(sent, key=lambda k: sent[k])[:-200]:
                sent.pop(k)
        self._save()

    # ---- v0.5 Tags & Karten
    def tag_lists(self) -> dict[str, list[dict[str, str]]]:
        return {"meters": [{"id": m["id"], "name": m["name"]} for m in self.data["meters"]], "cars": [{"id": v["id"], "name": v["name"]} for v in self.data["fahrzeuge"]],
                "items": [{"id": i["id"], "name": i["name"]} for i in self.data["vorraete"]]}

    async def async_tag(self, kind: str, arg: str, who: str = "") -> tuple[bool, str]:
        """Aktion eines NFC-Tags: Zählerstand oder Tankbeleg erfassen (Handy-Mitteilung mit Link direkt in die Eingabe), Vorrat entnommen (sofort gebucht)."""
        if kind == "read":
            m = next((x for x in self.data["meters"] if x["id"] == arg), None)
            if m is None:
                return False, "Den Zähler gibt es nicht mehr"
            n = await self._push(f"Zählerstand {m['name']}", "Tippen, um den Stand einzugeben.", self._url(abr="read", m=arg, src="nfc"), f"nfc_{arg}")
            return (True, "Eingabe ans Handy geschickt") if n else (False, "Kein Handy für Modul 20 eingetragen (Einstellungen → Modul 20)")
        if kind == "fuel":
            v = next((x for x in self.data["fahrzeuge"] if x["id"] == arg), None)
            if v is None:
                return False, "Das Fahrzeug gibt es nicht mehr"
            n = await self._push(f"Tankbeleg {v['name']}", "Tippen, um Liter, Preis und Kilometerstand einzugeben.", self._url(abr="fuel", v=arg), f"nfc_{arg}")
            return (True, "Eingabe ans Handy geschickt") if n else (False, "Kein Handy für Modul 20 eingetragen (Einstellungen → Modul 20)")
        if kind == "take":
            it = next((x for x in self.data["vorraete"] if x["id"] == arg), None)
            if it is None:
                return False, "Den Vorrat gibt es nicht mehr"
            if L.stock(it, _now().date())["bestand"] < 1:
                return False, f"{it['name']}: kein Bestand mehr"
            self._book(it, "entnahme", 1.0, note=f"per Tag{' · ' + who if who else ''}", src="nfc")
            self._save()
            await self._remind(_now())
            return True, f"{it['name']}: 1 {it['unit']} entnommen"
        return False, "Unbekannte Aktion"

    # ---- Messwerk, Start, Einstellungen
    def messwerk(self) -> list[dict[str, Any]]:
        return [{"id": m["id"], "name": f"Zähler · {m['name']}", "eid": m["sensor"], "why": WHY[m["art"]], "group": "strom" if m["art"].startswith("strom") else "wasser", "unit": m["unit"], "tab": "meter"} for m in self.data["meters"] if m["sensor"]]

    def summary(self) -> dict[str, Any]:
        today = _now().date()
        nc = sum(1 for c in self.data["contracts"] if not c["ende"] or c["ende"] >= today.isoformat())
        nm = len(self.data["meters"])
        hints = [{"i": "clock", "t": e["t"], "s": f"in {e['tage']} Tagen · {e['s']}" if e["tage"] > 0 else f"heute · {e['s']}", "c": "wa"} for e in L.events(self.data, today) if e["k"] == "frist" and e["tage"] <= 30][:2]
        for it in self.data["vorraete"]:
            st = L.stock(it, today)
            if st["unter_min"] or (st.get("bestellen_bis") and st["bestellen_bis"] <= (today + timedelta(days=7)).isoformat()):
                hints.append({"i": "package", "t": f"{it['name']} nachkaufen", "s": f"Bestand {L._n(st['bestand'], 1)} {it['unit']}" + (f" · reicht bis {L._de(st['reicht_bis'])}" if st.get("reicht_bis") else ""), "c": "wa"})  # noqa: SLF001
        sub = f"{nc} {'Vertrag' if nc == 1 else 'Verträge'} · {nm} Zähler" if nc or nm else "Noch nichts angelegt"
        c = ""
        try:
            mets = {m["id"]: m for m in self.data["meters"]}
            erg = []
            for sp in ("strom", "gas", "wasser"):
                k = L.active_contract(self.data["contracts"], sp, today)
                if k:
                    f = L.forecast(k, [mets[i] for i in k["meters"] if i in mets], today, self.data["opts"]["verbrauch"][sp], self._dyn_avg() if sp == "strom" else None)
                    if f.get("ergebnis") is not None:
                        erg.append(f["ergebnis"])
            if erg:
                x = round(sum(erg))
                sub = f"{'+' if x >= 0 else '−'}{abs(x)} € {'voraussichtlich zurück' if x >= 0 else 'Nachzahlung erwartet'}"
                c = "ok" if x >= 0 else "wa"
        except Exception:  # noqa: BLE001
            _LOGGER.debug("Modul 20: Kurzfassung ohne Hochrechnung", exc_info=True)
        return {"tile": {"sub": sub, "c": c}, "hints": hints, "info": sub, "managed": self.managed()}

    async def async_remove(self, keep: bool) -> None:
        """Beim Deinstallieren bleibt der zuletzt gültige Preis in den Haus-Werten stehen (Konzept W6) – nichts zurückdrehen."""
