"""Tests für Modul 8 (Wallbox) ohne Home Assistant.

Ausführen: python3 -m pytest tests  oder  python3 tests/test_wallbox.py
Geprüft werden die reinen Rechenfunktionen: Regelung, Phasen, Hausanschluss-Schutz, Ladeplan, Statistik,
Datenmodell je Fahrzeug mit Übernahme und der Adapter für Wallboxen über Home Assistant.
"""
from __future__ import annotations

import asyncio
import importlib.util
import pathlib
import sys
from datetime import datetime, timedelta, timezone

ROOT = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung"


def _mod(name: str):
    key = f"fh_{name}"
    if key in sys.modules:
        return sys.modules[key]
    spec = importlib.util.spec_from_file_location(key, ROOT / f"{name}.py")
    m = importlib.util.module_from_spec(spec)
    sys.modules[key] = m
    spec.loader.exec_module(m)
    return m


C = _mod("wallbox_calc")
P = _mod("wallbox_plan")
A = _mod("wallbox_adapter")
TZ = timezone(timedelta(hours=1))
NOW = datetime(2026, 11, 13, 12, 0, tzinfo=TZ)


def cfg(**kw):
    return C.clean_wb({"enabled": True, **kw})


def mem():
    return {"above_since": None, "below_since": None, "ph_change_ts": None, "ph_set": None, "chg_ts": None, "done_since": None}


# ---- Regelung
def test_off_mode_never_charges():
    w = C.decide(cfg(mode="off"), {"car": 2, "surplus_w": 9000}, mem(), 0, NOW)
    assert w["frc"] == 1 and w["state"] == "aus"


def test_pv_waits_for_on_delay_then_charges():
    c, m = cfg(mode="pv", onMin=1, ph="3"), mem()
    w = C.decide(c, {"car": 3, "surplus_w": 6000, "cur_ph": None}, m, 1000, NOW)
    assert w["frc"] == 1 and w["state"] == "wartet"
    w = C.decide(c, {"car": 3, "surplus_w": 6000, "cur_ph": None}, m, 1061, NOW)
    assert w["frc"] == 2 and w["amp"] == 8 and w["psm"] == 2


def test_pv_stops_after_off_delay():
    c, m = cfg(mode="pv", offMin=3, ph="1"), mem()
    w = C.decide(c, {"car": 2, "surplus_w": 300, "cur_ph": 1}, m, 1000, NOW)
    assert w["frc"] == 2 and w["amp"] == c["minA"]
    w = C.decide(c, {"car": 2, "surplus_w": 300, "cur_ph": 1}, m, 1181, NOW)
    assert w["frc"] == 1


def test_limit_reached_stops():
    w = C.decide(cfg(mode="now", limit=80), {"car": 2, "soc": 81}, mem(), 0, NOW)
    assert w["state"] == "limit" and w["frc"] == 1


def test_minpv_keeps_minimum_current():
    w = C.decide(cfg(mode="minpv"), {"car": 2, "surplus_w": 0}, mem(), 0, NOW)
    assert w["frc"] == 2 and w["amp"] == 6


def test_battery_first_blocks_surplus():
    w = C.decide(cfg(mode="pv", onMin=0), {"car": 3, "surplus_w": 8000, "bat_ok": False}, mem(), 0, NOW)
    assert w["frc"] == 1 and "Hausbatterie" in w["reason"]


def test_phases_auto_hysteresis():
    c = cfg(ph="auto", minA=6)
    need3 = 230 * 3 * 6
    assert C.phases_for(c, need3 * 1.05, None) == 1
    assert C.phases_for(c, need3 * 1.15, None) == 3
    assert C.phases_for(c, need3 * 0.97, 3) == 3
    assert C.phases_for(c, need3 * 0.9, 3) == 1


def test_commands_only_changes():
    assert C.commands({"frc": 2, "amp": 10, "psm": 2}, {"frc": 2, "amp": 10, "psm": 2}) == {}
    assert C.commands({"frc": 2, "amp": 12, "psm": 2}, {"frc": 2, "amp": 10, "psm": 1}) == {"amp": 12, "psm": 2}
    assert C.commands({"frc": 1, "amp": 6, "psm": 2}, {"frc": 2, "amp": 10, "psm": 2}) == {"frc": 1}


def test_guard_limit():
    r = C.guard_limit({"maxA": 35}, grid_import_w=230 * 3 * 30 + 230 * 3 * 10, wb_w=230 * 3 * 10, phases=3)
    assert r["house_a"] == 30.0 and r["wb_a"] == 10.0 and r["allowed_a"] == 5


def test_max_current_up_to_32a():
    c = C.clean_wb({"minA": 6, "maxA": 32})
    assert c["maxA"] == 32
    assert C.clean_wb({"maxA": 40})["maxA"] == 32


# ---- Ladeplan
def slots(n=36):
    out = []
    for i in range(n):
        t = NOW + timedelta(hours=i)
        h = t.hour
        pv = max(0.0, 5 - abs(h - 13)) if 8 <= h <= 17 else 0.0
        out.append({"t": t, "h": 1.0, "pv": pv, "price": 30.0 if 17 <= h <= 20 else 20.0 if 1 <= h <= 5 else 26.0, "level": None, "est": False})
    return out


def test_plan_sun_first_then_cheap():
    o = {"strat": "mix", "target": 80, "soc": 40, "cap": 50, "until": "07:00", "pmax": 11.0, "minkw": 1.4, "rank": "price"}
    R = P.plan_calc(slots(), NOW, o)
    assert abs(R["need"] - 20.0) < 1e-6
    assert abs(sum(R["sel"].values()) - 20.0) < 1e-6
    assert R["plan"]["cost"] <= R["imm"]["cost"]
    assert R["left"] == 0


def test_plan_mix_prefers_partly_sunny_hour_for_small_need():
    """Wenig Bedarf: eine Stunde mit etwas Sonne ist günstiger als die billigste Nachtstunde ohne Sonne."""
    sl = [{"t": NOW + timedelta(hours=i), "h": 1.0, "pv": 4.3 if i == 0 else 0.0, "price": 25.8 if i == 0 else 30.0 if i < 10 else 12.9, "level": None, "est": False} for i in range(20)]
    o = {"strat": "mix", "target": 80, "soc": 62, "cap": 43.2, "until": "07:00", "pmax": 11.0, "minkw": 1.4, "rank": "price"}
    R = P.plan_calc(sl, NOW, o)
    assert list(R["sel"]) == [0] and R["plan"]["cost"] <= R["imm"]["cost"] + 1e-9


def test_plan_only_sun_leaves_rest():
    o = {"strat": "sun", "target": 100, "soc": 0, "cap": 77, "until": "07:00", "pmax": 11.0, "minkw": 1.4, "rank": "price"}
    R = P.plan_calc(slots(), NOW, o)
    assert R["left"] > 0
    assert all(slots()[i]["pv"] >= 1.4 for i in R["sel"])


def test_plan_mode_goal_reached():
    o = {"strat": "mix", "target": 50, "soc": 60, "cap": 50, "until": "07:00", "pmax": 11.0, "minkw": 1.4, "rank": "price"}
    R = P.plan_calc(slots(), NOW, o)
    assert P.plan_mode(slots(), R, NOW, o)["state"] == "fertig"


def test_add_energy_splits_sun_and_grid():
    st = P.clean_stats(None)
    P.add_energy(st, NOW, 3600, 6000, 4000, 30.0, "Dolphin")
    d = st["days"][NOW.date().isoformat()]
    assert abs(d["pv"] - 4.0) < 1e-6 and abs(d["grid"] - 2.0) < 1e-6 and abs(d["cost"] - 0.6) < 1e-6


def test_estimate_soc_with_losses():
    st = P.clean_stats(None)
    P.est_set(st, "v1", 40, NOW)
    P.est_add(st, "v1", 10.0, 50.0)  # 10 kWh × 90 % / 50 kWh = 18 %
    assert abs(st["est"]["v1"]["soc"] - 58.0) < 1e-6
    P.est_add(st, "v1", 100.0, 50.0)
    assert st["est"]["v1"]["soc"] == 100.0
    assert P.clean_stats(st)["est"]["v1"]["soc"] == 100.0


def test_km_per_vehicle_without_jump():
    st = P.clean_stats({"odo": 18000})
    P.add_km(st, NOW, 18010, "v1", "Dolphin")       # Übernahme des alten Kilometerstands
    P.add_km(st, NOW, 52000, "v2", "Golf")          # anderes Auto: kein Sprung
    P.add_km(st, NOW, 52025, "v2", "Golf")
    d = st["days"][NOW.date().isoformat()]
    assert d["km"] == 35 and d["veh"]["Dolphin"]["km"] == 10 and d["veh"]["Golf"]["km"] == 25


def test_session_close_returns_session_with_card():
    st = P.clean_stats(None)
    P.session_tick(st, NOW, True, 7000)
    P.add_energy(st, NOW, 3600, 7000, 7000, 30.0, "Dolphin", "Karte Tobias")
    assert P.session_tick(st, NOW + timedelta(minutes=1), False, 0) is None
    done = P.session_tick(st, NOW + timedelta(minutes=5), False, 0)
    assert done["card"] == "Karte Tobias" and abs(done["kwh"] - 7.0) < 1e-6 and st["sessions"][0] is done


def test_home_battery_is_not_surplus_for_the_car():
    assert C.surplus_adj(5000, 0, 3000, True, False) == 2000       # Akku gibt 3 kW ab: nur 2 kW echter Überschuss
    assert C.surplus_adj(5000, 0, 3000, False, False) == 5000
    assert C.surplus_adj(1000, 2500, 0, True, True) == 3500        # Auto zuerst: was der Akku lädt, darf ins Auto
    assert C.surplus_adj(None, 0, 0, True, False) is None
    assert C.bat_split("one", "charge", -1200, None, None) == (0, 1200)
    assert C.bat_split("one", "discharge", -1200, None, None) == (1200, 0)
    assert C.bat_split("two", "charge", None, 800, 0) == (800, 0)


def test_dimming_14a():
    assert C.dim_amp(4.2, 3) == 6 and C.dim_amp(4.2, 1) == 18 and C.dim_amp(11, 3) == 15


# ---- Fahrzeuge (Schema 2)
LEGACY = {"brand": "BYD", "model": "Dolphin Surf", "body": "kompakt", "color": "white", "ent": {"soc": "sensor.dolphin_soc", "odo": "sensor.dolphin_km", "range": "", "plug": "binary_sensor.plug"}}


def test_migrate_creates_vehicle_with_same_mode():
    c, txt = C.migrate_v2(C.clean_wb({"mode": "minpv", "limit": 90, "pvSrc": "forecast"}), LEGACY)
    v = c["vehicles"][0]
    assert v["name"] == "BYD Dolphin Surf" and v["mode"] == "minpv" and v["limit"] == 90
    assert v["ent"]["soc"] == "sensor.dolphin_soc" and v["body"] == "kompakt" and v["color"] == "white"
    assert c["defVeh"] == v["id"] and c["vs"] == 2 and c["pvSrc"] == "auto" and "angelegt" in txt


def test_migrate_fills_first_vehicle_without_changing_card_logic():
    raw = C.clean_wb({"vehicles": [{"id": "a1", "name": "Golf", "ids": [3]}, {"id": "b2", "name": "Zoe", "ids": [4]}]})
    c, txt = C.migrate_v2(raw, LEGACY)
    assert c["vehicles"][0]["ent"]["soc"] == "sensor.dolphin_soc" and c["vehicles"][1]["ent"]["soc"] == ""
    assert c["defVeh"] == "" and "übernommen" in txt


def test_migrate_without_legacy_only_bumps_schema():
    c, txt = C.migrate_v2(C.clean_wb({}), {})
    assert c["vs"] == 2 and c["vehicles"] == [] and txt == ""


def test_resolve_who_default_vehicle_and_lock():
    c = C.clean_wb({"vehicles": [{"id": "v1", "name": "Dolphin", "ids": [1], "mode": "pv"}], "defVeh": "v1"})
    w = C.resolve_who(c, None)
    assert w["id"] == "v1" and w["card"] is None and w["auto"]
    assert C.resolve_who({**c, "lock": True}, None) is None
    assert C.resolve_who(c, 7)["kind"] == "guest"


def test_vehicle_fields_are_cleaned():
    v = C.clean_vehicles([{"id": "v1", "name": "<b>X</b>", "cap": "43,2", "body": "rakete", "ent": {"soc": "sensor.x", "odo": "kein sensor"}}])[0]
    assert v["name"] == "bX/b" and v["cap"] == 43.2 and v["body"] == "limousine" and v["ent"] == {"soc": "sensor.x", "odo": "", "range": ""}


# ---- Wallbox über Home Assistant
def test_wbx_ready():
    assert not C.wbx_ready(C.clean_wb({}))
    assert C.wbx_ready(C.clean_wb({"ip": "192.168.1.45"}))
    assert C.wbx_ready(C.clean_wb({"wbx": {"kind": "ha", "ent": {"switch": "switch.easee_laden"}}}))
    assert not C.wbx_ready(C.clean_wb({"wbx": {"kind": "ha", "ent": {"power": "sensor.p"}}}))


def test_status_texts():
    cases = {"disconnected": 1, "awaiting_start": 3, "charging": 2, "completed": 4, "ready_to_charge": 3, "Available": 1, "SuspendedEV": 3,
             "Finishing": 4, "Laden": 2, "Nicht angesteckt": 1, "Fully charged": 4, "error": 5, "Pending": None}
    for t, want in cases.items():
        assert A.car_from_text(t) == want, t


def test_derive_car_from_plug_and_power():
    assert A.derive_car(None, False, 0, True) == 1
    assert A.derive_car(None, True, 0, False) == 3
    assert A.derive_car(None, True, 7000, True) == 2
    assert A.derive_car("ready_to_charge", True, 5000, True) == 2


def test_phase_options():
    assert A.phase_option(["1-phasig", "3-phasig", "Automatisch"], 1) == "1-phasig"
    assert A.phase_option(["Single phase", "Three phase"], 3) == "Three phase"
    assert A.phase_option(["Auto"], 3) is None


def test_guess_roles_easee_like():
    ents = [
        {"eid": "switch.easee_is_enabled", "name": "Easee Laden aktiviert", "unit": "", "dc": "", "num": False},
        {"eid": "switch.easee_smart_charging", "name": "Easee Smart Charging", "unit": "", "dc": "", "num": False},
        {"eid": "number.easee_dynamic_charger_limit", "name": "Easee Dynamisches Ladelimit", "unit": "A", "dc": "current", "num": True},
        {"eid": "sensor.easee_power", "name": "Easee Leistung", "unit": "kW", "dc": "power", "num": True},
        {"eid": "sensor.easee_status", "name": "Easee Status", "unit": "", "dc": "enum", "num": False},
        {"eid": "sensor.easee_session_energy", "name": "Easee Energie Ladevorgang", "unit": "kWh", "dc": "energy", "num": True},
        {"eid": "sensor.easee_lifetime_energy", "name": "Easee Gesamtenergie", "unit": "kWh", "dc": "energy", "num": True},
    ]
    g = A.guess_roles(ents)
    assert g["switch"] == "switch.easee_is_enabled"
    assert g["current"] == "number.easee_dynamic_charger_limit"
    assert g["power"] == "sensor.easee_power"
    assert g["status"] == "sensor.easee_status"
    assert g["energy"] == "sensor.easee_session_energy" and g["total"] == "sensor.easee_lifetime_energy"


def test_ha_view_reads_states():
    wbx = C.clean_wbx({"kind": "ha", "plat": "easee", "ph": 3, "ent": {"switch": "switch.a", "current": "number.b"}})
    st = {"switch": ("on", {}), "current": ("10.0", {}), "power": ("6.9", {"unit_of_measurement": "kW"}), "status": ("charging", {}),
          "plug": None, "phase": None, "energy": ("4.2", {"unit_of_measurement": "kWh"}), "total": None}
    r = A.ha_view(st, wbx)
    assert r["info"]["car"] == 2 and r["info"]["power"] == 6900 and r["info"]["phases"] == 3 and r["info"]["session_wh"] == 4200
    assert r["cur"] == {"frc": 2, "amp": 10, "psm": 2} and r["info"]["ctrl"] and r["info"]["type"] == "Easee"


def test_manual_change_grace_for_ha():
    last = {"frc": 2, "amp": 10}
    assert not A.manual_change(last, {"frc": 1, "amp": 10}, "ha", set_ts=1000, now_ts=1030)
    assert A.manual_change(last, {"frc": 1, "amp": 10}, "ha", set_ts=1000, now_ts=1200)
    assert not A.manual_change(last, {"frc": 2, "amp": 10.4}, "ha", set_ts=0, now_ts=1200)
    assert A.manual_change(last, {"frc": 1, "amp": 10}, "goe", set_ts=1000, now_ts=1001)


class _St:
    def __init__(self, state, attrs=None):
        self.state, self.attributes = state, attrs or {}


class _Hass:
    def __init__(self, states):
        self.calls = []
        hs = self

        class S:
            def get(self, e):
                return states.get(e)

        class Svc:
            async def async_call(self, d, s, data, blocking=False):
                hs.calls.append((d, s, data))

        self.states, self.services = S(), Svc()


def test_ha_adapter_commands():
    hass = _Hass({"switch.w": _St("off"), "number.i": _St("6", {"min": 6, "max": 16}), "select.p": _St("1-phasig", {"options": ["1-phasig", "3-phasig"]})})
    ad = A.HaAdapter(hass, C.clean_wbx({"kind": "ha", "ent": {"switch": "switch.w", "current": "number.i", "phase": "select.p"}}))
    asyncio.run(ad.set({"frc": 2, "amp": 20, "psm": 2}, 16))
    assert ("select", "select_option", {"entity_id": "select.p", "option": "3-phasig"}) in hass.calls
    assert ("number", "set_value", {"entity_id": "number.i", "value": 16.0}) in hass.calls  # auf das Maximum der Entität begrenzt
    assert hass.calls[-1] == ("switch", "turn_on", {"entity_id": "switch.w"})
    hass.calls.clear()
    asyncio.run(ad.set({"frc": 1}, 16))
    assert hass.calls == [("switch", "turn_off", {"entity_id": "switch.w"})]


def test_ha_adapter_without_switch_cannot_stop():
    hass = _Hass({"number.i": _St("6")})
    ad = A.HaAdapter(hass, C.clean_wbx({"kind": "ha", "ent": {"current": "number.i"}}))
    try:
        asyncio.run(ad.set({"frc": 1}, 16))
        raise AssertionError("hätte einen Fehler melden müssen")
    except A.WallboxError:
        pass


if __name__ == "__main__":
    n = 0
    for k, f in list(globals().items()):
        if k.startswith("test_") and callable(f):
            f()
            n += 1
    print(f"{n} Tests bestanden")


def test_session_edit_moves_day_values_and_keeps_orig():
    empty_stats, session_edit, clean_stats = P.empty_stats, P.session_edit, P.clean_stats
    st = empty_stats()
    st["days"]["2026-11-02"] = {"pv": 6.0, "grid": 4.0, "cost": 1.2, "full": 3.0, "km": 0.0, "veh": {"Auto A": {"kwh": 10.0, "cost": 1.2}}}
    st["sessions"] = [{"start": "2026-11-02T11:10:00", "min": 60, "veh": "Auto A", "kwh": 10.0, "pv": 6.0, "cost": 1.2}]
    now = datetime(2026, 11, 13, 18, 0)
    s = session_edit(st, "2026-11-02T11:10:00", {"veh": "Auto B", "kwh": 5.0, "note": "Dienstfahrt", "biz": True}, now)
    assert s["veh"] == "Auto B" and s["kwh"] == 5.0 and s["orig"] == 10.0 and s["biz"] and s["note"] == "Dienstfahrt"
    d = st["days"]["2026-11-02"]
    assert "Auto A" not in d["veh"] and abs(d["veh"]["Auto B"]["kwh"] - 5.0) < 1e-6
    assert abs(d["pv"] - 3.0) < 1e-6 and abs(d["grid"] - 2.0) < 1e-6 and abs(d["cost"] - 0.6) < 1e-6
    # zurück auf die gemessene Menge: Kennzeichen „orig“ verschwindet
    s = session_edit(st, "2026-11-02T11:10:00", {"kwh": 10.0}, now)
    assert "orig" not in s and s["edit"]
    assert clean_stats(st)["sessions"][0]["note"] == "Dienstfahrt"
    assert session_edit(st, "2026-11-02T11:10:00", {"delete": True}, now) == {"deleted": "2026-11-02T11:10:00"}
    assert st["sessions"] == [] and st["days"]["2026-11-02"]["pv"] < 1e-6
    assert session_edit(st, "x", {"kwh": 1}, now) is None


def test_session_edit_logs_changes_and_ignores_rounding():
    st = P.empty_stats()
    st["days"]["2026-11-11"] = {"pv": 0.03, "grid": 0.164, "cost": 0.11, "full": 0.06, "km": 0.0, "veh": {"Unbekannt": {"kwh": 0.194, "cost": 0.11}}}
    st["sessions"] = [{"start": "2026-11-11T18:25:00", "min": 3, "veh": "Unbekannt", "kwh": 0.194, "pv": 0.03, "cost": 0.11}]
    s = P.session_edit(st, "2026-11-11T18:25:00", {"veh": "BYD", "kwh": 0.19, "card": "", "note": "", "biz": False}, NOW)
    assert "orig" not in s  # 0,194 → 0,19 ist nur Rundung
    assert s["chg"][-1]["x"] == ["Fahrzeug: Unbekannt → BYD"]
    assert "Unbekannt" not in st["days"]["2026-11-11"]["veh"] and st["days"]["2026-11-11"]["veh"]["BYD"]["kwh"] > 0.19
    s = P.session_edit(st, "2026-11-11T18:25:00", {"veh": "BYD", "note": "Gast", "biz": True}, NOW)
    assert s["chg"][-1]["x"] == ["Notiz: „Gast“", "als dienstlich markiert"] and len(s["chg"]) == 2
    n = len(s["chg"]); P.session_edit(st, "2026-11-11T18:25:00", {"veh": "BYD", "note": "Gast", "biz": True}, NOW)
    assert len(s["chg"]) == n  # nichts geändert, kein Eintrag
    # alte Daten mit falschem „orig“ werden beim Laden bereinigt
    raw = {"sessions": [{"start": "2026-11-11T18:25:00", "veh": "BYD", "kwh": 0.19, "orig": 0.194}]}
    assert "orig" not in P.clean_stats(raw)["sessions"][0]


def test_assign_unknown_and_running_session_retro():
    st = P.empty_stats()
    st["days"]["2026-11-09"] = {"pv": 0, "grid": 9.2, "cost": 3.89, "full": 3.89, "km": 0.0, "veh": {"Unbekannt": {"kwh": 9.2, "cost": 3.89}, "BYD": {"kwh": 1.0, "cost": 0.3}}}
    st["sessions"] = [{"start": "2026-11-09T21:30:00", "min": 7, "veh": "Unbekannt", "kwh": 0.6, "pv": 0, "cost": 0.29}]
    r = P.assign_unknown(st, "2026-11-01", "2026-11-30", "BYD", NOW)
    assert r["n"] == 1 and abs(r["kwh"] - 9.2) < 1e-6
    v = st["days"]["2026-11-09"]["veh"]
    assert "Unbekannt" not in v and abs(v["BYD"]["kwh"] - 10.2) < 1e-6 and st["sessions"][0]["veh"] == "BYD"
    # Fahrzeug wird erst während der Ladung erkannt → Anfang der Ladung wird nachträglich zugeordnet
    st = P.empty_stats(); t = NOW
    P.session_tick(st, t, True, 7000)
    P.add_energy(st, t, 600, 7000, 0, 30, "Unbekannt")
    P.add_energy(st, t + timedelta(minutes=10), 600, 7000, 0, 30, "BYD")
    v = st["days"][t.date().isoformat()]["veh"]
    assert "Unbekannt" not in v and abs(v["BYD"]["kwh"] - 2 * 7000 * 600 / 3.6e6) < 1e-6


def test_fertig_nach_eigenem_stopp_startet_wieder():
    """go-e meldet car=4 auch, wenn die Regelung selbst gestoppt hat. Das darf das Laden nicht für immer beenden."""
    c = cfg(mode="pv", limit=100, onMin=0)
    m = mem()
    t = 10_000.0
    # lädt mit Überschuss
    o = C.decide(c, {"car": C.CAR_CHARGING, "surplus_w": 4000, "soc": 40, "bat_ok": True, "cur_ph": 1}, m, t, NOW)
    assert o["frc"] == 2
    # Hausakku zuerst: Regelung stoppt
    o = C.decide(c, {"car": C.CAR_CHARGING, "surplus_w": 4000, "soc": 41, "bat_ok": False, "cur_ph": 1}, m, t + 10, NOW)
    for i in range(2, 80):
        o = C.decide(c, {"car": C.CAR_CHARGING if o["frc"] == 2 else C.CAR_DONE, "surplus_w": 4000, "soc": 42, "bat_ok": False, "cur_ph": 1}, m, t + 10 * i, NOW)
    assert o["frc"] == 1 and o["state"] != "fertig"
    # Akku ist voll genug, Überschuss da, Wallbox meldet weiter „fertig“ (weil wir gestoppt haben): es muss wieder starten
    o = C.decide(c, {"car": C.CAR_DONE, "surplus_w": 3390, "soc": 42, "bat_ok": True}, m, t + 2000, NOW)
    assert o["frc"] == 2 and o["state"] == "pv", o


def test_fertig_gilt_nur_am_ziel_oder_ohne_ladestand():
    c = cfg(mode="pv", limit=80, onMin=0)
    # Auto hört von selbst auf, Ladestand am Ziel -> fertig
    m = mem()
    C.decide(c, {"car": C.CAR_CHARGING, "surplus_w": 4000, "soc": 78, "bat_ok": True, "cur_ph": 1}, m, 1000.0, NOW)
    o = C.decide(c, {"car": C.CAR_DONE, "surplus_w": 4000, "soc": 78, "bat_ok": True}, m, 1500.0, NOW)
    assert o["state"] == "fertig" and o["frc"] == 1
    # ohne Ladestand-Sensor: dem Auto glauben, wenn es von selbst aufgehört hat
    m = mem()
    C.decide(c, {"car": C.CAR_CHARGING, "surplus_w": 4000, "soc": None, "bat_ok": True, "cur_ph": 1}, m, 1000.0, NOW)
    o = C.decide(c, {"car": C.CAR_DONE, "surplus_w": 4000, "soc": None, "bat_ok": True}, m, 1500.0, NOW)
    assert o["state"] == "fertig"
    # Auto hört bei 42 % von selbst auf, Ziel 80 %: Laden bleibt freigegeben, mit Hinweis
    m = mem()
    C.decide(c, {"car": C.CAR_CHARGING, "surplus_w": 4000, "soc": 42, "bat_ok": True, "cur_ph": 1}, m, 1000.0, NOW)
    o = C.decide(c, {"car": C.CAR_DONE, "surplus_w": 4000, "soc": 42, "bat_ok": True}, m, 1500.0, NOW)
    assert o["frc"] == 2 and "von selbst aufgehört" in o["reason"] and not o.get("pause")
    # nach einem Neustart von Home Assistant (kein Gedächtnis): nicht „fertig“, sondern laden
    o = C.decide(c, {"car": C.CAR_DONE, "surplus_w": 4000, "soc": None, "bat_ok": True}, mem(), 99.0, NOW)
    assert o["frc"] == 2
