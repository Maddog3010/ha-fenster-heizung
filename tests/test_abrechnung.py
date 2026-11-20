"""Tests für den Rechenkern von Modul 20 Abrechnungen (addons/abrechnung/logic.py) – ohne Home Assistant."""
from __future__ import annotations

import importlib.util
import math
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


# --------------------------------------------------------------------------- v0.3 Übersicht & Prognose
def gas_meter_year():
    """Gaszähler mit Monatsständen vom 01.04.2026 bis 12.11.2026 (Verbrauch nach Standardprofil, 1.300 m³ im Jahr)."""
    prof = L.PROFIL["gas"]
    reads, v, d = [], 18000.0, date(2026, 4, 1)
    while d <= date(2026, 11, 1):
        reads.append((f"{d.isoformat()}T00:00", round(v, 3)))
        v += 1300 * prof[d.month - 1]
        d = L.add_months(d, 1)
    reads.append(("2026-11-13T00:00", round(v - 1300 * prof[10] + 1300 * prof[10] * 12 / 30, 3)))
    return meter(reads)


def test_bounds_year_quarter_month():
    c = gas()
    assert L.bounds(c, date(2026, 11, 13)) == (date(2026, 4, 1), date(2027, 4, 1))
    assert L.bounds({**c, "abr": "01-01", "beginn": "2020-01-01"}, date(2026, 11, 13)) == (date(2026, 1, 1), date(2027, 1, 1))
    assert L.bounds({**c, "zahl": "monat"}, date(2026, 11, 13)) == (date(2026, 11, 1), date(2026, 12, 1))
    assert L.bounds({**c, "zahl": "quartal"}, date(2026, 11, 13)) == (date(2026, 10, 1), date(2027, 1, 1))
    # Vertrag endet vorher: Zeitraum endet mit dem Vertrag
    assert L.bounds({**c, "ende": "2026-12-31"}, date(2026, 11, 13))[1] == date(2027, 1, 1)


def test_schedule_plan_change_and_bookings():
    c = gas(abschlag={"betrag": 95, "rhythmus": "monat", "tag": 1},
            abplan=[{"ab": "2026-10-15", "betrag": 110, "rhythmus": "monat", "tag": 1}],
            zahlungen=[{"d": "2026-07-01", "betrag": 0, "note": "ausgefallen"}, {"d": "2026-08-20", "betrag": 50}])
    s = L.schedule(c, date(2026, 4, 1), date(2027, 4, 1))
    by = {x["d"]: x for x in s}
    assert len([x for x in s if x["src"] != "extra"]) == 12
    assert by["2026-04-01"]["betrag"] == 95 and by["2026-10-01"]["betrag"] == 95 and by["2026-11-01"]["betrag"] == 110
    assert by["2026-07-01"]["src"] == "gebucht" and by["2026-07-01"]["betrag"] == 0 and by["2026-07-01"]["plan"] == 95
    assert by["2026-08-20"]["src"] == "extra" and by["2026-08-20"]["betrag"] == 50
    # Quartal: nur jeden dritten Monat ab Beginn des Zeitraums
    w = L.clean_contract({"id": "c2", "sparte": "wasser", "abr": "01-01", "abschlag": {"betrag": 96, "rhythmus": "quartal", "tag": 15}, "periods": [{"ab": "2026-01-01", "frisch": 2}]})
    q = L.schedule(w, date(2026, 1, 1), date(2027, 1, 1))
    assert [x["d"] for x in q] == ["2026-01-15", "2026-04-15", "2026-07-15", "2026-10-15"]
    assert L.schedule(L.clean_contract({"id": "e1", "sparte": "einspeisung", "periods": [{"ab": "2026-01-01", "ap": 8}]}), date(2026, 1, 1), date(2027, 1, 1)) == []


def test_forecast_measured_matches_profile_and_result():
    c = gas(abschlag={"betrag": 137, "rhythmus": "monat", "tag": 1}, bonus=0)
    m = gas_meter_year()
    f = L.forecast(c, [m], date(2026, 11, 13), 14000)
    assert f["gemessen"] and f["basis"] == "zaehler" and f["profil"] == "standard"
    # Jahresverbrauch aus dem Verlauf ≈ 1.300 m³ × Faktor
    assert abs(f["jahr_v"] - 1300 * L.gas_factor(c)) / (1300 * L.gas_factor(c)) < 0.05
    assert f["ab_total"] == 137 * 12 and f["gezahlt"] == 137 * 8
    assert f["ergebnis"] == round(f["ab_total"] - f["total"], 2)
    assert f["lo"] < f["total"] < f["hi"] and f["erg_lo"] < f["ergebnis"] < f["erg_hi"]
    ms = f["monate"]
    assert len(ms) == 12 and ms[0]["m"] == "2026-04" and ms[-1]["m"] == "2027-03"
    assert abs(ms[-1]["cum_k"] - f["total"]) < 1.0 and ms[-1]["cum_z"] == f["ab_total"]
    assert ms[3]["gemessen"] and not ms[9]["gemessen"]
    # Preiswechsel am 01.01.2027 (+6,3 %) steht in den Gründen
    assert any("01.01.2027" in g for g in f["gruende"])


def test_forecast_without_meter_uses_annual_value():
    c = gas(abschlag={"betrag": 120, "rhythmus": "monat", "tag": 1}, meters=[])
    f = L.forecast(c, [], date(2026, 11, 13), 14000)
    assert not f["gemessen"] and f["basis"] == "jahresverbrauch" and f["pct"] == 20
    assert abs(f["menge"] - 14000) < 1  # ganzes Jahr ≈ eingestellter Jahresverbrauch in kWh
    assert f["geschaetzt"]


def test_recommendation_rounds_up_and_hides_small_diff():
    c = gas(abschlag={"betrag": 95, "rhythmus": "monat", "tag": 1}, bonus=0)
    f = L.forecast(c, [gas_meter_year()], date(2026, 11, 13), 14000)
    e = f["empf"]
    assert e["n"] == 4 and e["ab"] == "2026-12-01" and e["alt"] == 95
    assert e["neu"] == math.ceil((f["total"] - f["gezahlt"]) / 4) and e["show"]
    f2 = {**f, "total": f["gezahlt"] + 95 * 4 + 1}
    assert not L.recommend(c, f2, date(2026, 11, 13))["show"]


def test_monthly_billing_has_no_result_but_average_price():
    s = L.clean_contract({"id": "s1", "sparte": "strom", "zahl": "monat", "abr": "01-01", "beginn": "2026-01-01", "meters": ["m2"],
                          "periods": [{"ab": "2026-01-01", "mode": "dyn", "auf": 2.0, "gp": 12.0}]})
    m = L.clean_meter({"id": "m2", "art": "strom_bezug", "readings": [{"t": "2026-11-01T00:00", "v": 1000}, {"t": "2026-11-13T00:00", "v": 1120}]})
    f = L.forecast(s, [m], date(2026, 11, 13), 3500, dyn_ct=26.0)
    assert f["start"] == "2026-11-01" and f["ende"] == "2026-12-01" and "ergebnis" not in f and f["empf"] is None
    assert f["avg_ct"] > 28.0  # Arbeitspreis 28 ct + Grundpreis-Anteil


def test_dyn_compare_profile_and_fixed_price():
    base = 1_700_000_000 // 3600 * 3600
    hours = [(base + i * 3600, 1.0 if i % 24 < 6 else 0.5) for i in range(24 * 30)]
    prices = {base + i * 3600: (20.0 if i % 24 < 6 else 30.0) for i in range(24 * 30)}
    r = L.dyn_compare(hours, prices, 2.0, 12.0, {"ap": 32.0, "gp": 12.0})
    assert r["abdeckung"] == 100 and r["guenstig"] == 40  # 6 × 1,0 kWh von 15 kWh je Tag
    assert 22 < r["avg_ct"] < 32 - 0.01 and r["avg_ct"] < r["mittel_ct"]
    assert r["diff"] > 0 and abs(r["diff_monat"] - r["diff"]) < 2
    assert L.dyn_compare([], prices, 2.0, 12.0, None) is None
    assert "fix" not in L.dyn_compare(hours, prices, 2.0, 12.0, None)


def test_events_include_next_payment():
    c = gas(abschlag={"betrag": 95, "rhythmus": "monat", "tag": 1})
    ev = L.events({"contracts": [c], "meters": []}, date(2026, 11, 20))
    assert any(e["k"] == "abschlag" and e["d"] == "2026-12-01" and "95,00 €" in e["s"] for e in ev)


def test_old_data_upgrades():
    d = L.clean_data({"v": 1, "contracts": [{"id": "c1", "sparte": "gas", "periods": [{"ab": "2026-01-01", "ap": 9}]}], "opts": {"vgl": {"ap": "32,5", "gp": 12}}})
    assert d["v"] == L.SCHEMA and d["contracts"][0]["abplan"] == [] and d["contracts"][0]["zahlungen"] == []
    assert d["opts"]["vgl"]["ap"] == 32.5
    assert L.clean_data({"opts": {"vgl": {"ap": ""}}})["opts"]["vgl"] is None


def test_recommendation_when_everything_is_paid():
    w = L.clean_contract({"id": "c2", "sparte": "wasser", "abr": "01-01", "beginn": "2020-01-01", "abschlag": {"betrag": 185, "rhythmus": "quartal", "tag": 15},
                          "periods": [{"ab": "2026-01-01", "frisch": 2.05, "abw": 2.8, "brutto": False, "ust": 7}]})
    f = L.forecast(w, [], date(2026, 11, 18), 130)
    e = f["empf"]
    assert e["neu"] is None and not e["show"] and e["n"] == 0
    assert e["next"] == math.ceil(f["total"] / 4) and e["rhythmus"] == "quartal"


# --------------------------------------------------------------------------- v0.5 Rechnungen, Fahrtkosten, Vorräte
def test_invoice_check_all_ok_and_deviation():
    c = gas(abschlag={"betrag": 137, "rhythmus": "monat", "tag": 1}, bonus=0, abr="04-01", beginn="2025-04-01", erst="2026-03-31",
            periods=[{"ab": "2025-04-01", "ap": 9.87, "gp": 14.90, "mess": 2.50}, {"ab": "2026-01-01", "ap": 10.49, "gp": 14.90, "mess": 2.50}])
    m = meter([("2025-04-01T00:00", 17000.0), ("2025-10-01T00:00", 17400.0), ("2026-04-01T00:00", 18296.0)])
    menge_kwh = round(1296 * 11.214 * 0.9636)
    inv = L.clean_invoice({"id": "r1", "von": "2025-04-01", "bis": "2026-03-31", "anfang": 17000, "ende": 18296, "menge": menge_kwh, "betrag": 0, "angerechnet": 137 * 12, "brennwert": 11.214, "zustand": 0.9636})
    exp = L.expected_cost(c, [m], inv)
    inv["betrag"] = exp
    chk = {x["k"]: x for x in L.check_invoice(c, [m], inv)}
    assert chk["menge"]["lv"] == "ok" and chk["umr"]["lv"] == "ok" and chk["preis"]["lv"] == "ok" and chk["ab"]["lv"] == "ok"
    assert chk["ende"]["lv"] == "ok"
    assert inv["ergebnis"] == round(137 * 12 - 0, 2)  # Ergebnis aus clean_invoice (Betrag 0 beim Säubern)
    # Abweichungen: 3 % mehr Verbrauch, 20 € zu viel, ein Abschlag fehlt
    bad = {**inv, "ende": 18296 + 39, "betrag": exp + 20, "angerechnet": 137 * 11}
    chk = {x["k"]: x for x in L.check_invoice(c, [m], bad)}
    assert chk["menge"]["lv"] == "warn" and chk["preis"]["lv"] == "warn" and chk["ab"]["lv"] == "warn" and chk["ende"]["lv"] == "warn"


def test_expected_cost_splits_price_change_by_own_usage():
    c = gas(bonus=0, periods=[{"ab": "2026-04-01", "ap": 10.0, "gp": 0}, {"ab": "2026-10-01", "ap": 20.0, "gp": 0}])
    m = meter([("2026-04-01T00:00", 0.0), ("2026-10-01T00:00", 100.0), ("2027-04-01T00:00", 400.0)])
    inv = L.clean_invoice({"id": "r1", "von": "2026-04-01", "bis": "2027-03-31", "menge": 4000, "betrag": 1})
    # 1/4 der Menge im Sommer zu 10 ct, 3/4 im Winter zu 20 ct
    assert L.expected_cost(c, [m], inv) == round(1000 * 0.10 + 3000 * 0.20, 2)


def car(antrieb="benzin", ent=(), **kw):
    return L.clean_vehicle({"id": "v1", "name": "Golf", "antrieb": antrieb, "fix": {"vers": 365, "steuer": 0}, "eintraege": [{"id": f"e{i}", **e} for i, e in enumerate(ent)], **kw})


def test_vehicle_fuel_full_to_full_and_costs():
    v = car(ent=[{"t": "2026-10-01T10:00", "art": "tanken", "menge": 40, "preis": 1.7, "km": 10000, "voll": True},
                 {"t": "2026-10-15T10:00", "art": "tanken", "menge": 20, "betrag": 34.0, "km": 10300, "voll": False},
                 {"t": "2026-10-30T10:00", "art": "tanken", "menge": 22, "preis": 1.7, "km": 10650, "voll": True}])
    assert v["eintraege"][0]["betrag"] == 68.0 and v["eintraege"][1]["preis"] == 1.7
    st = L.vehicle_stats(v, date(2026, 10, 1), date(2026, 11, 1), datetime(2026, 11, 18))
    assert st["l100"] == round(42 / 650 * 100, 2) and st["km"] == 650
    assert st["eur"] == round(68 + 34 + 37.4, 2) and st["e100"] == round(st["eur"] / 650 * 100, 2)
    assert st["fix"] == round(365 * 31 / 365, 2) and st["voll_ct"] == round((st["eur"] + st["fix"]) / 650 * 100, 2)


def test_vehicle_electric_share_home_and_road():
    v = car("elektro", ent=[{"t": "2026-11-01T08:00", "art": "km", "km": 20000}, {"t": "2026-11-05T22:00", "art": "laden_haus", "menge": 30, "preis": 0.12},
                            {"t": "2026-11-10T12:00", "art": "laden_weg", "menge": 10, "preis": 0.59}])
    st = L.vehicle_stats(v, date(2026, 11, 1), date(2026, 12, 1), datetime(2026, 11, 18, 12), sensor_km=20250)
    assert st["km"] == 250 and st["kwh"] == 40 and st["kwh100"] == 16.0 and st["anteil"] == {"laden_haus": 75, "laden_weg": 25}
    assert st["e100"] == round((3.6 + 5.9) / 250 * 100, 2)


def test_stock_moving_average_range_and_order_date():
    it = L.clean_item({"id": "p1", "art": "pellets", "lager": 5, "min": 1, "liefer": 14, "buchungen": [
        {"id": "b1", "t": "2026-06-01T10:00", "art": "kauf", "menge": 3, "betrag": 870},
        {"id": "b2", "t": "2026-09-01T10:00", "art": "kauf", "menge": 1, "betrag": 300},
        {"id": "b3", "t": "2026-10-01T10:00", "art": "zaehlung", "menge": 3.4},
        {"id": "b4", "t": "2026-11-15T10:00", "art": "entnahme", "menge": 0.6}]})
    st = L.stock(it, date(2026, 11, 18))
    assert st["avg"] == round((870 + 300) / 4, 4) and st["bestand"] == 2.8 and st["wert"] == round(2.8 * 292.5, 2)
    assert st["rate"] and abs(st["reicht_tage"] - 2.8 / st["rate"]) <= 1 and st["fuell"] == 56
    assert st["bestellen_bis"] < st["reicht_bis"] and not st["unter_min"]
    assert st["ct_kwh"] == round(292.5 / 4800 * 100, 2)
    assert st["kosten_jahr"] == round(1.2 * 292.5, 2)


def test_v3_data_cleaning():
    d = L.clean_data({"fahrzeuge": [{"id": "v1", "antrieb": "rakete"}, {"id": "!!"}], "vorraete": [{"id": "s1", "art": "oel"}, {"id": "s2", "art": "gold"}],
                      "opts": {"notify": ["notify.mobile_app_iphone", "light.x"], "todo": "todo.einkauf"}})
    assert d["v"] == 3 and len(d["fahrzeuge"]) == 1 and d["fahrzeuge"][0]["antrieb"] == "benzin" and [x["art"] for x in d["vorraete"]] == ["oel"]
    assert d["opts"]["notify"] == ["notify.mobile_app_iphone"] and d["opts"]["todo"] == "todo.einkauf" and d["opts"]["remind"] == {"on": True, "tage": 0}
    assert L.clean_invoice({"id": "r1", "von": "2026-05-01", "bis": "2026-04-01"}) is None


def test_stock_start_without_price_uses_first_purchase():
    it = L.clean_item({"id": "o1", "art": "oel", "lager": 3000, "buchungen": [
        {"id": "b1", "t": "2025-11-01T10:00", "art": "zaehlung", "menge": 900}, {"id": "b2", "t": "2026-06-12T10:00", "art": "kauf", "menge": 2000, "betrag": 1798}]})
    assert L.stock(it, date(2026, 11, 18))["avg"] == 0.899


def test_invoice_learn_skips_what_is_already_known():
    c = gas(abplan=[{"ab": "2026-10-01", "betrag": 135, "tag": 1}])
    m = meter([("2025-04-01T09:00", 16754.0), ("2026-04-01T08:00", 18050.0)])
    inv = L.clean_invoice({"id": "r1", "von": "2025-04-01", "bis": "2026-03-31", "datum": "2026-04-14", "anfang": 16754, "ende": 18050, "betrag": 1500, "neu_abschlag": 125})
    v = L.invoice_view(c, [m], inv, 2.0, date(2026, 11, 18), None)
    assert [x["k"] for x in v["learn"]] == []  # Abschlag später geändert, Zählerstände schon da, Brennwert gleich


# ---------------------------------------------------------------- v0.7: Anbindung der Module
def test_gas_mirror_for_modul3():
    c = gas(abschlag={"betrag": 95, "rhythmus": "monat", "tag": 15})
    g = L.gas_mirror(c, date(2026, 11, 19))
    assert g["price"] == 9.87 and g["grund"] == round((14.90 + 2.50) * 12, 2) and g["gunit"] == "y" and g["netto"] is False
    assert g["hw"] == 11.214 and g["zz"] == 0.9636 and g["start"] == 4 and g["abschlag"] == 95 and g["absday"] == 15 and g["years"] == {}
    assert [p["ab"] for p in g["prices"]] == ["2026-04-01", "2027-01-01"] and g["prices"][1]["price"] == 10.49
    q = L.gas_mirror(gas(abschlag={"betrag": 300, "rhythmus": "quartal", "tag": 1}), date(2026, 11, 19))
    assert q["abschlag"] == 100  # Quartal → je Monat ein Drittel


def test_m8_sessions_become_home_charging():
    ses = [{"start": "2026-11-18T22:00:00+01:00", "min": 180, "veh": "BYD", "kwh": 20.0, "pv": 5.0, "cost": 4.5},
           {"start": "2026-11-17T12:00:00+01:00", "min": 60, "veh": "Zoe", "kwh": 8.0, "pv": 8.0, "cost": 0.0},
           {"start": "2026-11-19T08:00:00+01:00", "min": 0, "veh": "BYD", "kwh": 3.0, "pv": 0, "cost": 1.0, "running": True}]
    e = L.m8_entries(ses, "BYD", 8.0)
    assert len(e) == 1 and e[0]["art"] == "laden_haus" and e[0]["src"] == "modul8" and e[0]["solar"] == 25.0
    assert e[0]["betrag"] == round(4.5 + 5 * 0.08, 2) and e[0]["menge"] == 20.0 and math.isclose(e[0]["preis"], e[0]["betrag"] / 20, rel_tol=1e-3)
    assert L.m8_entries(ses, "BYD", 0.0)[0]["betrag"] == 4.5
    manual = [L.clean_entry({"id": "e1", "t": "2026-11-01T10:00", "art": "laden_haus", "menge": 10, "preis": 0.3}),
              L.clean_entry({"id": "e2", "t": "2026-11-19T07:00", "art": "laden_haus", "menge": 10, "preis": 0.3}),
              L.clean_entry({"id": "e3", "t": "2026-11-19T07:30", "art": "laden_weg", "menge": 30, "preis": 0.59})]
    m = L.merge_m8(manual, e)
    assert [x["id"] for x in m] == ["e1", e[0]["id"], "e3"]  # e2 nach der ersten Modul-8-Ladung zählt nicht doppelt
    assert L.merge_m8(manual, []) == manual
    v = L.clean_vehicle({"id": "v1", "name": "BYD", "antrieb": "elektro", "m8": "BYD", "eintraege": []})
    assert v["m8"] == "BYD"
    st = L.vehicle_stats({**v, "eintraege": m}, date(2026, 11, 1), date(2026, 12, 1), datetime(2026, 11, 19, 12, 0))
    assert st["by"]["laden_haus"]["menge"] == 30.0 and st["by"]["laden_weg"]["n"] == 1


def test_gas_prev_survives_clean():
    d = L.clean_data({"gas_prev": {"price": 12.0, "years": {}}})
    assert d["gas_prev"] == {"price": 12.0, "years": {}}
    assert L.clean_data({})["gas_prev"] is None


# ---------------------------------------------------------------- v0.9: Sensoren und Tarifwechsel-Rechner
def test_ha_values_prices_and_result():
    view = {"contracts": [{"id": "s1", "anbieter": "Tibber", "tarif": "dynamisch"}, {"id": "c1", "anbieter": "Stadtwerke", "tarif": "Fix"}],
            "cards": {"strom": {"id": "s1", "u": {"ct": 24.02, "jetzt": 31.5, "dyn": True, "grund": 12.66, "src": "30d", "ab": "2025-02-01"},
                                "fc": {"ergebnis": -12.5, "total": 900, "erg_lo": -40, "erg_hi": 10, "empf": {"neu": 80}}},
                      "gas": {"id": "c1", "u": {"ct": 9.87, "ct_m3": 106.65, "dyn": False, "grund": 17.4, "ab": "2026-04-01"}, "fc": None},
                      "wasser": None, "einspeisung": None},
            "sum": {"ergebnis": 89.0, "lo": 24, "hi": 154, "teile": ["strom", "gas"]},
            "events": [{"d": "2026-12-01", "t": "Abschlag Gas", "s": "137 €", "tage": 12}],
            "fahrzeuge": [{"id": "vbyd", "name": "BYD", "jahr": {"e100": 3.33, "voll_ct": 16.9, "km": 4520}, "d30": {}}],
            "vorraete": [{"id": "pel", "name": "Pellets", "unit": "t", "min": 1, "st": {"bestand": 2.5, "reicht_bis": "2027-03-01", "unter_min": False, "wert": 900, "avg": 360}}]}
    v = L.ha_values(view)
    S = v["sensor"]
    assert S["preis_strom"]["value"] == 0.315 and S["preis_strom"]["unit"] == "EUR/kWh" and S["preis_strom"]["attrs"]["durchschnitt_30_tage"] == 0.2402
    assert S["preis_gas"]["value"] == 0.0987 and S["preis_gas_m3"]["unit"] == "EUR/m³" and S["preis_gas_m3"]["value"] == 1.0665
    assert S["ergebnis"]["value"] == 89.0 and S["ergebnis_strom"]["value"] == -12.5 and "ergebnis_gas" not in S
    assert S["naechster_termin"]["value"] == "2026-12-01" and S["fahrtkosten_vbyd"]["value"] == 3.33 and S["vorrat_pel"]["value"] == 2.5
    assert set(v["keys"]) == set(S) and "preis_wasser" not in S


def test_switch_calc():
    c = gas()
    o = L.clean_offer({"ap": "8,90", "gp": 15, "bonus": 100, "laufzeit": 12})
    r = L.switch_calc(c, 14000, o, date(2026, 11, 19))
    assert r["aktuell"] == round(14000 * 0.0987 + (14.90 + 2.50) * 12, 2) and r["jahr2"] == round(14000 * 0.089 + 180, 2) and r["jahr1"] == round(r["jahr2"] - 100, 2)
    assert r["urteil"] == "lohnt" and r["spart2"] > 0 and r["kuendigen_bis"] == "2027-03-03"
    assert math.isclose(L.switch_calc(c, 14000, {**o, "ap": r["gleich_ap"], "bonus": 0}, date(2026, 11, 19))["spart2"], 0, abs_tol=1.0)
    assert L.switch_calc(c, 14000, {**o, "ap": 10.2, "bonus": 150}, date(2026, 11, 19))["urteil"] == "bonus"
    assert L.clean_offer({"ap": 0}) is None
    assert L.clean_data({})["opts"]["sensoren"] is True


# ---------------------------------------------------------------- 1.1: Gas aus Modul 3 übernehmen
def test_from_modul3():
    g = {"ent": "sensor.gas", "price": 11.0, "grund": 180.0, "gunit": "y", "netto": False, "mwst": 19, "hw": 11.2, "zz": 0.96, "start": 4, "abschlag": 120, "absday": 5,
         "prices": [{"ab": "2025-04-01", "price": 12.0}, {"ab": "2026-01-01", "price": 10.5, "grund": 192.0}],
         "years": {"2025": {"abs": 130, "absm": {"3": 0}}, "2026": {"abs": 120, "hw": 11.4, "zz": 0.95}}}
    reads = L.stats_readings([(datetime(2025, 5, 1), 1000.0), (datetime(2025, 6, 1), 1050.5), (datetime(2025, 7, 1), 1080.0)])
    r = L.from_modul3(g, date(2026, 11, 20), "c3", "m3", reads, True)
    c, m = r["contract"], r["meter"]
    assert c["sparte"] == "gas" and c["abr"] == "04-01" and c["beginn"] == "2025-04-01" and c["meters"] == ["m3"]
    assert [(p["ab"], p["ap"], round(p["gp"], 2)) for p in c["periods"]] == [("2025-04-01", 12.0, 15.0), ("2026-01-01", 10.5, 16.0)]
    assert c["brennwert"] == 11.4 and c["zustand"] == 0.95 and c["abschlag"] == {"betrag": 120.0, "rhythmus": "monat", "tag": 5}
    assert [(x["ab"], x["betrag"]) for x in c["abplan"]] == [("2025-04-01", 130.0), ("2026-04-01", 120.0)]
    assert m["sensor"] == "sensor.gas" and len(m["readings"]) == 3 and m["readings"][0]["src"] == "sensor"
    assert r["monate_abweichend"] == [] and c["zahlungen"] == [{"d": "2025-07-05", "betrag": 0.0, "note": "Monat abweichend (Modul 3)"}]
    assert L.unit_price(c, date(2026, 11, 20))["ct"] == 10.5
    n = L.from_modul3({**g, "netto": True, "hw": 0, "zz": 0, "years": {}, "brw": 10.4}, date(2026, 11, 20), "c4", "m4", [], False)
    assert n["contract"]["periods"][0]["brutto"] is False and n["contract"]["brennwert"] == 10.4 and n["contract"]["zustand"] == 1.0 and n["meter"]["sensor"] == ""
    assert L.unit_price(n["contract"], date(2026, 11, 20))["ct"] == round(10.5 * 1.19, 4)


def test_stats_readings_meter_swap():
    r = L.stats_readings([(datetime(2025, 1, 1), 500.0), (datetime(2025, 2, 1), 520.0), (datetime(2025, 3, 1), 3.0), (datetime(2025, 4, 1), 40.0)])
    assert [x["v"] for x in r] == [3.0, 40.0]
    assert L.stats_readings([(datetime(2025, 1, 1), 1500.0)], 0.001)[0]["v"] == 1.5


# ---------------------------------------------------------------- 1.2: aus den Modulen übernehmen
def test_import_from_modules():
    t = date(2026, 11, 20)
    s = L.strom_from_haus("cs1", t, True, 32.0, ["mb1"])
    assert s["sparte"] == "strom" and s["periods"][0]["mode"] == "dyn" and s["periods"][0]["auf"] == 0 and s["zahl"] == "monat" and s["anbieter"] == "Tibber" and s["meters"] == ["mb1"]
    f = L.strom_from_haus("cs2", t, False, 32.5, [])
    assert f["periods"][0]["mode"] == "fix" and f["periods"][0]["ap"] == 32.5 and L.unit_price(f, t)["ct"] == 32.5 and f["beginn"] == "2026-01-01"
    e = L.einsp_from_haus("ce1", t, 8.11, ["me1"])
    assert e["sparte"] == "einspeisung" and L.unit_price(e, t)["ct"] == 8.11 and e["periods"][0]["ust"] == 0
    v = L.car_from_m8("vab", {"name": "BYD", "brand": "BYD", "model": "Dolphin Surf", "cap": 43.2, "ent": {"odo": "sensor.byd_km", "soc": "sensor.byd_soc"}})
    assert v["name"] == "BYD" and v["antrieb"] == "elektro" and v["akku"] == 43.2 and v["sensor"] == "sensor.byd_km" and v["m8"] == "BYD"
    assert L.stats_readings([(datetime(2026, 1, 1), 28000000.0)], L.UNIT_F["Wh"])[0]["v"] == 28000.0


# ---------------------------------------------------------------- 1.3: genauer rechnen
def test_weather_factor_and_forecast():
    from datetime import timedelta as TD
    a, b = date(2026, 7, 1), date(2026, 11, 20)
    norm = {(a + TD(days=i)).isoformat(): L.NORM_T[(a + TD(days=i)).month - 1] for i in range((b - a).days)}
    cold = {k: v - 2.0 for k, v in norm.items()}
    assert L.weather_factor(norm, a, b)["faktor"] == 1.0
    w = L.weather_factor(cold, a, b)
    assert w["faktor"] < 1 and w["abw"] > 0
    assert L.weather_factor({k: v for i, (k, v) in enumerate(cold.items()) if i % 3 == 0}, a, b) is None  # zu wenige Tage
    m = meter([("2026-04-01T09:00", 18050.0), ("2026-09-01T09:00", 18200.0), ("2026-11-19T09:00", 18560.0)])
    c = gas(abschlag={"betrag": 120, "rhythmus": "monat", "tag": 1})
    t = date(2026, 11, 20)
    f0, f1 = L.forecast(c, [m], t, 14000), L.forecast(c, [m], t, 14000, None, cold)
    assert "wetter" not in f0 and f1["wetter"]["abw"] > 0 and f1["total"] < f0["total"]
    assert any("kälter als normal" in g for g in f1["gruende"])


def test_device_split():
    days = {"2026-11-01": {"d1": [1.0, 0.0, 2.0, 0.6, 0.1, 1], "d2": [0.0, 0.0, 0.5, 0.15, 0, 1]}, "2026-11-02": {"d1": [0.0, 0.0, 1.0, 0.3, 0, 1]},
            "2026-10-31": {"d1": [5.0, 0, 5.0, 1.0, 0, 1]}, "2026-11-03": {"weg": [9, 9, 9, 9, 0, 1]}}
    r = L.device_split(days, {"d1": "Waschmaschine", "d2": "Trockner"}, date(2026, 11, 1), date(2026, 12, 1), 40.0)
    assert [(x["name"], x["kwh"], x["eur"]) for x in r["rows"]] == [("Waschmaschine", 4.0, 0.9), ("Trockner", 0.5, 0.15)]
    assert r["rows"][0]["pct"] == 10.0 and r["haus"] == 35.5 and r["pct"] == 11
    assert L.device_split(days, {"d1": "W"}, date(2026, 11, 1), date(2026, 12, 1), None)["haus"] is None


def test_muell_costs():
    info = {"year": 2026, "total": 26, "done": 23, "incl": 13, "fee": 6.5}
    m = L.muell_costs(info, 180.0)
    assert m["extra_bisher"] == 65.0 and m["extra_jahr"] == 84.5 and m["jahr"] == 264.5 and m["frei"] == 0 and m["extra_n"] == 13
    assert L.muell_costs(None, 0) is None
    g = L.muell_costs(None, 150.0)
    assert g["jahr"] == 150.0 and g["zaehlt"] is False
    v = L.ha_values({"cards": {}, "contracts": [], "muell": m})
    assert v["sensor"]["kosten_muell"]["value"] == 264.5
    assert L.clean_data({"opts": {"muell": {"grund": "180,50"}}})["opts"]["muell"]["grund"] == 180.5



def test_m3_fixes():
    g = {"ent": "sensor.gas", "price": 14.07, "grund": 11.70, "gunit": "y", "netto": True, "mwst": 19, "hw": 25.9, "zz": 0.9509, "start": 4, "abschlag": 0, "absday": 16,
         "prices": [], "years": {"2026": {"abs": 120, "absm": {"0": 140}}}}
    r = L.from_modul3(g, date(2026, 11, 20), "c1", "m1", [], True)
    c = r["contract"]
    assert c["brennwert"] == 25.9 and c["periods"][0]["gp"] == 11.7 and c["zahlungen"][0] == {"d": "2026-04-16", "betrag": 140.0, "note": "Monat abweichend (Modul 3)"}
    # schon mit b31/b32 übernommen: Brennwert 15, Grundpreis /12, ohne Monate
    old = L.clean_contract({**c, "brennwert": 15.0, "zahlungen": [], "periods": [{**c["periods"][0], "gp": 0.975}, {**c["periods"][0], "ab": "2026-01-01", "gp": 11.7}]})
    done = L.fix_m3_import(old, g)
    assert old["brennwert"] == 25.9 and [p["gp"] for p in old["periods"]] == [11.7, 11.7] and len(old["zahlungen"]) == 1 and len(done) == 3
    assert L.fix_m3_import(old, g) == []  # zweimal ändert nichts
    assert L.from_modul3({**g, "grund": 168.0}, date(2026, 11, 20), "c2", "m2", [], True)["contract"]["periods"][0]["gp"] == 14.0


def test_einspeisung_abschlag():
    c = L.clean_contract({"id": "ce", "sparte": "einspeisung", "beginn": "2024-01-01", "abr": "01-01", "meters": ["me"], "abschlag": {"betrag": 25, "rhythmus": "monat", "tag": 15},
                          "periods": [{"ab": "2024-01-01", "ap": 8.11, "ust": 0}], "zahlungen": [{"d": "2026-06-15", "betrag": 0}]})
    m = L.clean_meter({"id": "me", "art": "strom_einsp", "readings": [{"t": "2026-01-01T00:00", "v": 9480.0}, {"t": "2026-06-01T00:00", "v": 10790.0}, {"t": "2026-11-18T00:00", "v": 12906.0}]})
    f = L.forecast(c, [m], date(2026, 11, 20), 4200)
    plan = [x for x in f["abschlaege"]]
    assert len(plan) == 12 and plan[5]["betrag"] == 0 and f["ab_total"] == 275.0
    assert f["ergebnis"] == round(f["total"] - 275.0, 2) and f["ergebnis"] > 0 and f["deckung"] is not None
    assert f["erg_lo"] <= f["ergebnis"] <= f["erg_hi"]
    v = L.ha_values({"cards": {"einspeisung": {"id": "ce", "u": L.unit_price(c, date(2026, 11, 20)), "fc": f}}, "contracts": [c]})
    assert v["sensor"]["ergebnis_einspeisung"]["value"] == f["ergebnis"]


def test_einspeisung_wechselnd():
    pays = [{"d": f"2026-{m:02d}-15", "betrag": b} for m, b in [(1, 5.2), (2, 9.8), (3, 17.4), (4, 26.0), (5, 33.1), (6, 38.5), (7, 37.0), (8, 30.2), (9, 21.6), (10, 12.4), (11, 6.1)]]
    c = L.clean_contract({"id": "ce", "sparte": "einspeisung", "beginn": "2024-01-01", "abr": "01-01", "meters": ["me"], "abschlag": {"betrag": 0, "rhythmus": "var", "tag": 15},
                          "periods": [{"ab": "2024-01-01", "ap": 8.11, "ust": 0}], "zahlungen": pays})
    assert c["abschlag"]["rhythmus"] == "var"
    m = L.clean_meter({"id": "me", "art": "strom_einsp", "readings": [{"t": "2026-01-01T00:00", "v": 9480.0}, {"t": "2026-06-01T00:00", "v": 10790.0}, {"t": "2026-11-18T00:00", "v": 12906.0}]})
    f = L.forecast(c, [m], date(2026, 11, 20), 4200)
    est = [x for x in f["abschlaege"] if x["src"] == "schaetz"]
    assert len(est) == 1 and est[0]["d"] == "2026-12-15" and est[0]["betrag"] > 0 and "geschätzt" in est[0]["note"]
    assert f["gezahlt"] == round(sum(p["betrag"] for p in pays), 2) and f["ergebnis"] == round(f["total"] - f["ab_total"], 2)
    assert L.clean_contract({"id": "cx", "sparte": "gas", "abschlag": {"rhythmus": "var"}, "periods": [{"ab": "2026-01-01", "ap": 9}]})["abschlag"]["rhythmus"] == "monat"


def test_mischsatz_balkonkraftwerk():
    base = {"id": "ce", "sparte": "einspeisung", "beginn": "2024-01-01", "periods": [{"ab": "2024-01-01", "ap": 10.08, "ust": 0}]}
    c = L.clean_contract({**base, "anlagen": {"kwp": 8, "weitere": [{"name": "Balkon", "kwp": 1, "ct": 0}]}})
    u = L.unit_price(c, date(2026, 11, 20))
    assert u["ct"] == round(8 / 9 * 10.08, 4) and u["mix"]["satz"] == 10.08 and u["mix"]["anteil"] == 88.9  # Beispiel der Bundesnetzagentur: ≈ 8,96 ct
    v1 = L.unit_price(L.clean_contract({**base, "anlagen": {"kwp": 8, "weitere": [{"kwp": 1, "ct": 8.11}]}}), date(2026, 11, 20))
    assert round(v1["ct"], 2) == 9.86
    assert "mix" not in L.unit_price(L.clean_contract({**base, "anlagen": {"kwp": 0, "weitere": [{"kwp": 1}]}}), date(2026, 11, 20))
    assert "anlagen" not in L.clean_contract({**base, "sparte": "strom", "anlagen": {"kwp": 8}})


def test_fester_kwh_abzug():
    c = L.clean_contract({"id": "ce", "sparte": "einspeisung", "beginn": "2024-01-01", "abr": "01-01", "meters": ["me"], "periods": [{"ab": "2024-01-01", "ap": 8.11, "ust": 0}],
                          "anlagen": {"kwp": 9.8, "modus": "kwh", "abzug_kwh": 164, "weitere": [{"name": "Balkonkraftwerk", "kwp": 0.9, "ct": 0}]}})
    assert L.unit_price(c, date(2026, 11, 20))["ct"] == 8.11  # kein Mischsatz
    m = L.clean_meter({"id": "me", "art": "strom_einsp", "readings": [{"t": "2026-01-01T00:00", "v": 9480.0}, {"t": "2026-11-18T00:00", "v": 12906.0}]})
    f = L.forecast(c, [m], date(2026, 11, 20), 4200)
    f0 = L.forecast({**c, "anlagen": {**c["anlagen"], "abzug_kwh": 0}}, [m], date(2026, 11, 20), 4200)
    assert f["abzug"]["kwh"] == 164.0 and f["abzug"]["eur"] == round(164 * 8.11 / 100, 2)
    assert round(f0["total"] - f["total"], 2) == f["abzug"]["eur"] and f["bisher"] < f0["bisher"]
