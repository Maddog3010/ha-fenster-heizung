"""Tests für die Sponsor-Max-Extras (mx_logic.py, 2026.11.4.4b4) ohne Home Assistant.

Ausführen: python3 -m pytest tests  oder  python3 tests/test_mx_extras.py
Geprüft werden die Notentabellen (Temperatur/Feuchte, Lüften, Schimmel), Taupunkt und Schimmelrisiko, Raum- und Hausnote,
fehlende Sensoren („ohne Note“), zu wenige Tage, Tipps, Ventilöffnung, Fenster-Verlust (Rechenbeispiel aus der
Vorschau), Verteilung der Heizkosten auf den Zähler und die Trennung gemessen/geschätzt.
"""
from __future__ import annotations

import importlib.util
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung"
_spec = importlib.util.spec_from_file_location("mx_logic", ROOT / "mx_logic.py")
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)


def _day(**kw):
    d = L.empty_wk()
    d.update(n=288, **kw)
    return d


def test_pct_grade_table():
    assert [L.pct_grade(p) for p in (0.95, 0.9, 0.85, 0.7, 0.55, 0.35, 0.1)] == [1, 1, 2, 3, 4, 5, 6]


def test_risk_grade_table():
    assert [L.risk_grade(h) for h in (0, 1, 2, 5, 12, 20, 30)] == [1, 2, 2, 3, 4, 5, 6]


def test_air_grade_table():
    assert L.air_grade(3, 0) == 1
    assert L.air_grade(1.5, 2) == 2
    assert L.air_grade(1, 8) == 3
    assert L.air_grade(0.5, 15) == 4
    assert L.air_grade(0.5, 30) == 5
    assert L.air_grade(0, 0) == 6
    assert L.air_grade(3, 45) == 6


def test_dewpoint_and_risk():
    assert abs(L.dewpoint(20, 50) - 9.3) < 0.2
    assert L.is_risk(20, 75)  # über 70 %
    assert not L.is_risk(21, 45)
    assert L.is_risk(18, 65, wall_off=6)  # kalte Wand: Taupunkt zu nah
    assert not L.is_risk(None, None)


def test_sample_counts():
    d = L.empty_wk()
    lim = L.limits(None)
    L.add_sample(d, t=21.2, target=21.0, rh=50, lim=lim, has_win=True, win_open=False)
    L.add_sample(d, t=19.0, target=21.0, rh=75, lim=lim, has_win=True, win_open=False)
    L.add_sample(d, t=15.0, target=21.0, rh=50, lim=lim, has_win=True, win_open=True)  # Fenster offen: Temperatur zählt nicht
    assert (d["n"], d["tn"], d["to"], d["hn"], d["ho"], d["rk"]) == (3, 2, 1, 3, 2, 1)
    assert d["w"] and d["h"]


def test_close_window():
    d = L.empty_wk()
    L.close_window(d, 10, 10)
    L.close_window(d, 2, 2)
    L.close_window(d, 90, 90)
    assert d["st"] == 1 and d["kp"] == 60


def test_room_grade_double_mold_and_missing():
    sub = {"temperatur": 1, "feuchte": 3, "lueften": 4, "schimmel": 5}
    assert L.room_grade(sub) == 3.6  # (1+3+4+2·5)/5
    assert L.room_grade({"temperatur": 2, "feuchte": None, "lueften": None, "schimmel": None}) == 2.0
    assert L.room_grade({k: None for k in L.FACH}) is None


def test_subjects_without_window_sensor():
    tot, n = L.sum_days([_day(tn=200, to=190, hn=288, ho=200, rk=0, w=False, h=True)] * 7)
    sub = L.subjects(tot, n)
    assert sub["lueften"] is None and sub["temperatur"] == 1 and sub["feuchte"] == 3 and sub["schimmel"] == 1


def test_too_few_days_and_short_days():
    _tot, n = L.sum_days([_day(), _day(), L.empty_wk() | {"n": 10}])
    assert n == 2  # Tag mit 10 Proben zählt nicht
    assert L.MIN_DAYS["week"] == 5 and L.MIN_DAYS["month"] == 20


def test_house_grade():
    assert L.house_grade([(1.0, 30), (4.0, 10)]) == 1.8
    assert L.house_grade([(1.0, 30), (4.0, 0)]) == 2.5  # eine Fläche fehlt: gleich gewichtet
    assert L.house_grade([(None, 10)]) is None


def test_word_and_tip():
    assert L.word(2.2) == "gut" and L.word(4.0) == "ausreichend" and L.word(None) == ""
    tot = _day(kp=14 * 60)
    t = L.tip("Bad", {"temperatur": 1, "feuchte": 3, "lueften": 5, "schimmel": 4}, tot, 7, win_eur=3.9)
    assert t.startswith("Bad: Fenster war ca. 14 h gekippt") and "3,90 €" in t
    assert "Luftentfeuchter" in L.tip("Bad", {"temperatur": 1, "feuchte": 3, "lueften": 2, "schimmel": 5}, tot, 7, dehum=True)
    assert L.tip("Küche", {"temperatur": 1, "feuchte": 2, "lueften": 2, "schimmel": 1}, tot, 7) == ""


def test_valve():
    assert L.valve("heat", {"valve_position": 60}) == 0.6
    assert L.valve("heat", {"pi_heating_demand": 0.25}) == 0.25
    assert L.valve("heat", {"hvac_action": "heating"}) == 1.0
    assert L.valve("heat", {"hvac_action": "idle"}) == 0.0
    assert L.valve("heat", {"current_temperature": 19, "temperature": 21}) == 1.0
    assert L.valve("off", {}) == 0.0


def test_window_loss_example_from_preview():
    # Vorschau Build 3: 1 h gekippt, 20 m², 21 °C innen / 1 °C außen → ca. 0,68 kWh
    q = L.window_kwh(L.ach("tilt", 60), 20, 2.5, 21, 1, 1)
    assert abs(q - 0.68) < 0.005
    assert L.ach("", 10) == 10.0 and L.ach("", 30) == 2.0


def test_costs_follow_meter_and_split():
    days = {
        "2026-11-20": {
            "a": {"ix": 3.0, "ce": 0.4, "ek": 0, "ee": 0, "em": False, "wk": 0, "we": 0, "wm": 0},
            "b": {"ix": 1.0, "ce": 0.1, "ek": 1.0, "ee": 0.30, "em": True, "wk": 0.5, "we": 0.05, "wm": 60},
            "_": {"mk": 20.0, "me": 4.0},
        }
    }
    r = L.period_costs(days)
    assert r["a"]["eur"] == 3.0 and r["b"]["eur"] == 1.3  # 4 € Zähler nach 75 % / 25 %, plus Heizer
    assert round(r["a"]["eur"] + r["b"]["eur"] - r["b"]["elec"], 2) == 4.0  # Summe = Zähler
    assert r["b"]["meas"] == 0.3 and r["b"]["est"] == 1.0 and r["b"]["win"] == 0.05


def test_costs_without_meter_use_estimate():
    r = L.period_costs({"d": {"a": {"ix": 3.0, "ce": 0.4, "we": 0.9, "wm": 30}}})
    assert r["a"]["eur"] == 0.4 and r["a"]["win"] == 0.4  # Fenster-Kosten nie mehr als die Raumkosten


def test_window_cost_in_heater_only_room():
    # Raum nur mit Elektroheizer: Fenster-Kosten dürfen nicht auf 0 fallen, aber nie über den Raumkosten liegen
    r = L.period_costs({"d": {"b": {"ix": 0.0, "ce": 0.0, "ee": 0.5, "em": True, "we": 0.2, "wm": 30}}})
    assert r["b"]["eur"] == 0.5 and r["b"]["win"] == 0.2


def test_what_if():
    assert L.what_if(29.1) == 1.75


def test_limits_clamped():
    lim = L.limits({"td": 9, "hlo": 70, "hhi": 50, "wall": "x"})
    assert lim["td"] == 3.0 and lim["hhi"] > lim["hlo"] and lim["wall"] == L.DEF_LIMITS["wall"]


if __name__ == "__main__":
    for k, f in list(globals().items()):
        if k.startswith("test_"):
            f()
    print("ok")
