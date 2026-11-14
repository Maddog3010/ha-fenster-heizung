"""Tests für den Rechenkern von Modul 20 Abrechnungen (addons/abrechnung/logic.py) – ohne Home Assistant."""
from __future__ import annotations

import importlib.util
import pathlib
import sys
from datetime import date, datetime

P = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung" / "addons" / "abrechnung" / "logic.py"
spec = importlib.util.spec_from_file_location("fh_abr_logic", P)
L = importlib.util.module_from_spec(spec)
sys.modules["fh_abr_logic"] = L
spec.loader.exec_module(L)


def gas(**kw):
    return L.clean_contract({"id": "c1", "sparte": "gas", "anbieter": "Stadtwerke", "tarif": "Erdgas Fix 24", "beginn": "2026-04-01", "erst": "2027-03-31", "verl": 1, "frist": 4,
                             "bonus": 60, "abr": "04-01", "brennwert": 11.214, "zustand": 0.9636, "meters": ["m1"],
                             "periods": [{"ab": "2026-04-01", "ap": 9.87, "gp": 14.90, "mess": 2.50}, {"ab": "2027-01-01", "ap": 10.49, "gp": 14.90, "mess": 2.50}], **kw})


def meter(reads, **kw):
    return L.clean_meter({"id": "m1", "art": "gas", "name": "Gaszähler", "dec": 2, "digits": 5, "readings": [{"t": t, "v": v, **x} for t, v, *r in reads for x in [r[0] if r else {}]], **kw})


def test_clean_rejects_bad_input():
    assert L.clean_contract({"id": "x!", "sparte": "gas"}) is None
    assert L.clean_contract({"id": "c1", "sparte": "oel"}) is None
    assert L.clean_meter({"id": "m1", "art": "strom"}) is None
    c = L.clean_contract({"id": "c1", "sparte": "strom", "anbieter": "<b>Tibber</b>", "periods": [{"ab": "kaputt"}, {"ab": "2026-01-01", "ap": "32,5", "mode": "dyn"}]})
    assert c["anbieter"] == "bTibber/b" and len(c["periods"]) == 1 and c["periods"][0]["ap"] == 32.5 and c["periods"][0]["mode"] == "dyn"
    d = L.clean_data({"contracts": [{"id": "c1", "sparte": "gas", "meters": ["weg"]}], "meters": "kaputt"})
    assert d["contracts"][0]["meters"] == [] and d["opts"]["mirror"] is True


def test_period_and_price_change():
    c = gas()
    assert L.period_at(c, date(2026, 12, 31))["ap"] == 9.87
    assert L.period_at(c, date(2027, 1, 1))["ap"] == 10.49
    assert L.period_at(c, date(2020, 1, 1))["ap"] == 9.87  # vor der ersten Periode: die erste
    ch = L.price_changes(c)
    assert ch[0]["pct"] is None and ch[1]["pct"] == 6.3


def test_netto_becomes_brutto_and_gas_factor():
    c = L.clean_contract({"id": "c1", "sparte": "gas", "brennwert": 11.214, "zustand": 0.9636, "periods": [{"ab": "2026-01-01", "ap": 10.0, "gp": 10.0, "brutto": False, "ust": 19}]})
    u = L.unit_price(c, date(2026, 6, 1))
    assert u["ct"] == 11.9 and u["grund"] == 11.9
    assert abs(u["ct_m3"] - 11.9 * 11.214 * 0.9636) < 0.001


def test_effective_price_with_bonus_first_year():
    c = gas()
    # 9,87 ct + (17,40 € × 12 – 60 € Bonus) / 14.000 kWh
    assert L.eff_price(c, date(2026, 6, 1), 14000) == round(9.87 + (17.40 * 12 - 60) * 100 / 14000, 3)
    # im zweiten Jahr ohne Bonus, neuer Preis
    assert L.eff_price(c, date(2027, 6, 1), 14000) == round(10.49 + 17.40 * 12 * 100 / 14000, 3)


def test_water_fees():
    c = L.clean_contract({"id": "w1", "sparte": "wasser", "periods": [{"ab": "2026-01-01", "frisch": 2.0, "abw": 2.86, "nieder": 0.9, "flaeche": 120, "zg": 4.0, "brutto": False, "ust": 7}]})
    u = L.unit_price(c, date(2026, 5, 1))
    assert u["unit"] == "m³" and abs(u["ct"] - (2.14 + 2.86) * 100) < 1e-6 and abs(u["grund"] - 4.28) < 1e-6 and u["jahr"] == 108.0


def test_preis_for_core_and_dynamic():
    d = L.clean_data({"contracts": [gas(), {"id": "s1", "sparte": "strom", "periods": [{"ab": "2026-01-01", "mode": "dyn", "auf": 18.5, "gp": 5.99}]}]})
    assert L.preis(d, "gas", date(2026, 6, 1))["ct"] == 9.87
    assert L.preis(d, "wasser", date(2026, 6, 1)) is None
    assert L.preis(d, "strom", date(2026, 6, 1)) is None  # dynamisch ohne Börsenpreis: nächste Quelle
    assert L.preis(d, "strom", date(2026, 6, 1), dyn_ct=9.5)["ct"] == 28.0
    assert L.preis(d, "gas", date(2025, 1, 1)) is None  # vor Vertragsbeginn


def test_contract_change_picks_latest():
    a = L.clean_contract({"id": "a1", "sparte": "strom", "beginn": "2025-01-01", "ende": "2026-03-31", "periods": [{"ab": "2025-01-01", "ap": 40}]})
    b = L.clean_contract({"id": "b1", "sparte": "strom", "beginn": "2026-04-01", "periods": [{"ab": "2026-04-01", "ap": 30}]})
    assert L.active_contract([a, b], "strom", date(2026, 3, 31))["id"] == "a1"
    assert L.active_contract([a, b], "strom", date(2026, 4, 1))["id"] == "b1"


def test_term_and_rollover():
    c = gas()
    t = L.term(c, date(2026, 11, 14))
    assert t["ende"] == "2027-03-31" and t["kuendigen_bis"] == "2027-03-03" and t["tage"] == 109 and not t["verlaengert"]
    t = L.term(c, date(2027, 4, 10))  # nicht gekündigt: verlängert sich monatlich
    assert t["ende"] == "2027-04-30" and t["verlaengert"]
    assert L.add_months(date(2026, 1, 31), 1) == date(2026, 2, 28)
    assert L.billing_start(c, date(2026, 11, 14)) == date(2026, 4, 1)
    assert L.billing_start(gas(beginn="2026-06-15"), date(2026, 11, 14)) == date(2026, 6, 15)


def test_events_sorted():
    d = L.clean_data({"contracts": [gas(garantie="2027-01-31")], "meters": [{"id": "m1", "art": "wasser", "eich": 2026}]})
    ev = L.events(d, date(2026, 11, 14))
    assert [e["k"] for e in ev] == ["eich", "preis", "garantie", "frist"]
    assert "+6,3 %" in ev[1]["s"] and "Sonderkündigung" in ev[1]["s"]


def test_usage_interpolates_and_handles_swap_and_overflow():
    m = meter([("2026-04-01T00:00", 100.0), ("2026-04-11T00:00", 120.0), ("2026-04-21T00:00", 150.0)])
    u = L.usage(m, datetime(2026, 4, 6), datetime(2026, 4, 16))
    assert abs(u["v"] - (10 + 15)) < 1e-6 and u["est"]
    assert not L.usage(m, datetime(2026, 4, 1), datetime(2026, 4, 21))["est"]
    # Zählerwechsel: Endstand 150, neuer Zähler beginnt bei 0
    m = meter([("2026-04-01T00:00", 100.0), ("2026-04-21T00:00", 150.0), ("2026-04-21T00:01", 0.0, {"start": True, "src": "start"}), ("2026-05-01T00:00", 30.0)])
    assert abs(L.usage(m, datetime(2026, 4, 1), datetime(2026, 5, 1))["v"] - 80) < 0.01
    # Überlauf bei 5 Stellen
    m = meter([("2026-04-01T00:00", 99990.0), ("2026-04-11T00:00", 15.0)])
    assert abs(L.usage(m, datetime(2026, 4, 1), datetime(2026, 4, 11))["v"] - 25) < 1e-6
    # Zeitraum beginnt vor der ersten Ablesung
    u = L.usage(meter([("2026-04-10T00:00", 5.0), ("2026-04-20T00:00", 25.0)]), datetime(2026, 4, 1), datetime(2026, 4, 20))
    assert u["v"] == 20 and u["kurz"]


def test_check_reading():
    now = datetime(2026, 11, 14, 12, 0)
    m = meter([("2026-10-01T08:00", 18223.10), ("2026-10-31T08:00", 18349.40)])  # 4,21 m³ je Tag
    assert L.check_reading(m, 18400.0, datetime(2026, 11, 12, 8, 0), now)["level"] == "ok"
    r = L.check_reading(m, 18300.0, datetime(2026, 11, 12, 8, 0), now)
    assert r["level"] == "bad" and "Kleiner als der letzte Stand" in r["msg"]
    r = L.check_reading(m, 18940.0, datetime(2026, 11, 12, 8, 0), now)  # 18.400 gemeint, 4 und 9 … hier: zu hoch
    assert r["level"] == "warn"
    r = L.check_reading(m, 18490.0, datetime(2026, 11, 2, 8, 0), now)  # erwartet ~18.358, 18.409 → Dreher von 0 und 9? prüft nur „ungewöhnlich hoch“
    assert r["level"] == "warn" and r["expect"] is not None
    assert L.check_reading(m, 1.0, datetime(2026, 12, 1), now)["level"] == "bad"  # Zukunft
    assert L.check_reading(m, 123456.0, datetime(2026, 11, 12), now)["level"] == "bad"  # zu viele Stellen
    assert L.check_reading(m, 18300.0, datetime(2026, 10, 20, 8, 0), now)["level"] == "ok"  # nachgetragen zwischen zwei Ständen
    assert L.check_reading(m, 18400.0, datetime(2026, 10, 20, 8, 0), now)["level"] == "bad"  # größer als der spätere Stand
    assert L.check_reading(meter([]), 5.0, datetime(2026, 11, 1), now)["level"] == "ok"
    # Zahlendreher: 18.349 -> erwartet 18.391, getippt 18.931
    r = L.check_reading(m, 18931.0, datetime(2026, 11, 10, 8, 0), now)
    assert r["level"] == "warn" and "vertauscht" in r["msg"] and "18.391" in r["msg"]


def test_cost_across_price_change():
    c = gas()
    m = meter([("2026-12-22T00:00", 1000.0), ("2027-01-11T00:00", 1100.0)])  # 5 m³ je Tag
    k = L.cost(c, [m], date(2026, 12, 22), date(2027, 1, 11))
    f = 11.214 * 0.9636
    arbeit = 50 * f * 9.87 / 100 + 50 * f * 10.49 / 100
    grund = 17.40 * 12 * 20 / 365
    assert k["arbeit"] == round(arbeit, 2) and k["grund"] == round(grund, 2) and k["eur"] == round(arbeit + grund, 2)
    assert abs(k["menge"] - 100 * f) < 0.01 and k["est"] and k["gemessen"]


def test_cost_water_with_garden_meter():
    c = L.clean_contract({"id": "w1", "sparte": "wasser", "periods": [{"ab": "2026-01-01", "frisch": 2.14, "abw": 2.86, "zg": 0}]})
    haus = L.clean_meter({"id": "m1", "art": "wasser", "readings": [{"t": "2026-06-01T00:00", "v": 100}, {"t": "2026-07-01T00:00", "v": 130}]})
    garten = L.clean_meter({"id": "m2", "art": "garten", "readings": [{"t": "2026-06-01T00:00", "v": 0}, {"t": "2026-07-01T00:00", "v": 18}]})
    k = L.cost(c, [haus, garten], date(2026, 6, 1), date(2026, 7, 1))
    assert k["eur"] == round(30 * 2.14 + 12 * 2.86, 2)  # Gartenwasser ohne Abwassergebühr
    assert L.cost(c, [haus], date(2026, 6, 1), date(2026, 7, 1))["eur"] == round(30 * 5.0, 2)


def test_thin_keeps_manual_readings():
    reads = [{"t": f"2024-{1 + i // 28 % 12:02d}-{1 + i % 28:02d}T00:00", "v": i, "src": "sensor"} for i in range(300)]
    reads += [{"t": f"2026-01-01T{i // 60:02d}:{i % 60:02d}", "v": 1000 + i, "src": "sensor" if i % 2 else "manuell"} for i in range(700)]
    out = L.thin(sorted(reads, key=lambda r: r["t"]))
    assert len(out) <= L.KEEP_READ and sum(1 for r in out if r["src"] == "manuell") == 350
