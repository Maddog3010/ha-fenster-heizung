"""Reine Rechenlogik für Elektroheizer: PV-Überschuss und Zusatzheizung bei Frost (ohne Home-Assistant-Importe)."""
from __future__ import annotations

import re
from typing import Any

MAX_STAGES = 8
_PRESET_GUESS = re.compile(r"^[A-Za-z]*\d+$")

STATUS_PV = "pv"
STATUS_WAIT = "wartet"
STATUS_WARM = "warm"
STATUS_WINDOW = "fenster"
STATUS_TIME = "zeit"
STATUS_OFF = "aus"
STATUS_SOC = "soc"

# Zusatzheizung bei Frost (Netzstrom)
STATUS_FROST = "frost"  # heizt zu
FROST_WAIT = "frost_wartet"  # Heizkörper bekommt zuerst Zeit
FROST_WARM = "frost_warm"
FROST_MILD = "frost_mild"  # draußen nicht kalt genug
FROST_PAUSE = "frost_pause"
FROST_LIMIT = "frost_limit"  # Tageslimit
FROST_SENSOR = "frost_sensor"  # Raumsensor ohne Werte
FROST_OUT = "frost_aussen"  # keine Außentemperatur
FROST_PRICE = "frost_preis"  # Strom über der Preisgrenze (Modul 14)
FROST_GRID = "frost_netz"  # Netzleistung aller Heizer erreicht
FROST_AWAY = "frost_abwesend"
FROST_HEATOFF = "frost_heizaus"  # Sommermodus oder „Heizung aus“
FROST_CONFIRM = "frost_ok"  # Sicherheitsabfrage fehlt

FROST_START_GAP = 0.5  # Start erst so weit unter dem Ziel
FROST_OUT_HYST = 1.0  # Ende erst so weit über der Frostgrenze
FROST_PAUSE_S = 900  # Pause nach der längsten Laufzeit am Stück


def parse_steps(raw: Any) -> list[int]:
    """Leistungsstufen aus Text („800, 1200, 1800“) oder Liste; sortiert, ohne Doppelte."""
    if raw in (None, ""):
        return []
    parts = re.split(r"[;,\s]+", raw) if isinstance(raw, str) else list(raw) if isinstance(raw, (list, tuple)) else []
    out: list[int] = []
    for p in parts:
        try:
            v = int(round(float(p)))
        except (TypeError, ValueError):
            continue
        if 50 <= v <= 10000 and v not in out:
            out.append(v)
    return sorted(out)[:MAX_STAGES]


def guess_presets(preset_modes: list[str] | None, count: int) -> list[str]:
    """Voreinstellungen wie H1, H2, H3 oder 1, 2, 3 der Reihe nach den Stufen zuordnen."""
    cand = [p for p in (preset_modes or []) if isinstance(p, str) and _PRESET_GUESS.match(p)]
    cand.sort(key=lambda p: int(re.sub(r"\D", "", p) or 0))
    return cand[:count]


def grid_to_export(value: float, sign: str) -> float:
    """Leistung am Netzanschluss in Watt; positiv = Einspeisung."""
    return -value if sign == "import" else value


def available_surplus(export_w: float, heater_w_running: float) -> float:
    """Überschuss, der für alle Heizer zur Verfügung steht (laufende Heizer werden zurückgerechnet)."""
    return max(0.0, export_w + heater_w_running)


def wanted_stage(steps: list[int], remaining: float, reserve: float, auto: bool = True) -> int:
    """Höchste Stufe, die in den freien Überschuss passt (Stufe + Reserve). 0 = aus."""
    if not steps:
        return 0
    if not auto:
        return len(steps) if steps[-1] + reserve <= remaining else 0
    stage = 0
    for i, w in enumerate(steps):
        if w + reserve <= remaining:
            stage = i + 1
    return stage


def allocate(heaters: list[dict[str, Any]], available: float, reserve: float) -> dict[str, int]:
    """Überschuss nach Priorität verteilen.

    Jeder Eintrag: id, prio, steps, auto, cur (aktuelle Stufe), blocked (True = darf nicht heizen).
    Ein Heizer verbraucht den größeren Wert aus seiner aktuellen und seiner gewünschten Stufe,
    damit sich Heizer mit niedrigerer Priorität nicht den Überschuss nehmen, den er gleich braucht.
    """
    remaining = float(available)
    out: dict[str, int] = {}
    for h in sorted(heaters, key=lambda x: (x["prio"], str(x["id"]))):
        steps = h["steps"]
        if h.get("blocked"):
            out[h["id"]] = 0
            remaining -= steps[h["cur"] - 1] if h.get("cur") and h["cur"] <= len(steps) else 0
            continue
        want = wanted_stage(steps, remaining, reserve, h.get("auto", True))
        out[h["id"]] = want
        use = max(want, h.get("cur") or 0)
        remaining -= steps[use - 1] if 0 < use <= len(steps) else 0
    return out


def step_decision(
    cur: int,
    desired: int,
    pending: tuple[int, float] | None,
    now: float,
    started: float | None,
    delay_s: float,
    minrun_s: float,
    force: bool = False,
) -> tuple[int, tuple[int, float] | None]:
    """Stufenwechsel mit Verzögerung. Rückgabe: neue Stufe und der Wartezustand (Zielstufe, seit wann).

    - Hochschalten (auch Start) erst, wenn die höhere Stufe `delay_s` lang möglich war.
    - Zurückschalten auf eine niedrigere Stufe nach 60 s.
    - Ausschalten nach höchstens 120 s und frühestens nach der Mindestlaufzeit.
    - `force` (Fenster offen, Raum warm, Batterie, Zeitfenster, Schalter aus) schaltet sofort ab.
    """
    if force:
        return 0, None
    if desired == cur:
        return cur, None
    if pending is None or pending[0] != desired:
        pending = (desired, now)
    waited = now - pending[1]
    if desired > cur:
        need = delay_s
    elif desired > 0:
        need = 60.0
    else:
        need = min(delay_s, 120.0)
        if started is not None and now - started < minrun_s:
            return cur, pending
    if waited >= need:
        return desired, None
    return cur, pending


def pv_share(heater_w: dict[str, float], export_w: float) -> dict[str, float]:
    """Anteil jedes Heizers, der aus PV-Überschuss gedeckt war (Watt). Netzbezug wird anteilig abgezogen."""
    total = sum(heater_w.values())
    if total <= 0:
        return {k: 0.0 for k in heater_w}
    pv = max(0.0, total - max(0.0, -export_w))
    return {k: pv * w / total for k, w in heater_w.items()}


def time_allowed(start: str | None, end: str | None, now_hms: str) -> bool:
    """Zeitfenster (HH:MM:SS) mit Übergang über Mitternacht; ohne Angabe immer erlaubt."""
    if not start or not end or start == end:
        return True
    if start < end:
        return start <= now_hms < end
    return now_hms >= start or now_hms < end


def warm_state(temp: float | None, target: float, was_warm: bool) -> bool:
    """Raum warm genug? Wieder anheizen erst 0,5 K unter dem Ziel (gegen Flackern)."""
    if temp is None:
        return False
    if temp >= target:
        return True
    return was_warm and temp > target - 0.5


def soc_allows(soc: float | None, minimum: float, running: bool) -> bool:
    """Batterie-Schwelle: ohne Sensor oder Schwelle 0 immer erlaubt; laufend 5 Prozentpunkte Spielraum."""
    if soc is None or minimum <= 0:
        return True
    return soc >= minimum - (5.0 if running else 0.0)


def frost_state() -> dict[str, float | None]:
    """Merker der Frostregel: kalt seit, läuft seit, Pause bis."""
    return {"cold": None, "run": None, "pause": None}


def frost_step(
    f: dict[str, Any],
    st: dict[str, float | None],
    now: float,
    *,
    outdoor: float | None,
    temp: float | None,
    blocked: str | None,
    price_high: bool,
    minrun_s: float,
    day_s: float,
) -> tuple[str, bool, float | None]:
    """Soll bei Frost zugeheizt werden? Ändert `st` und liefert (Status, an, Restzeit in Sekunden).

    f: out (Frostgrenze), target, wait, max_run, max_day (Zeiten in Sekunden).
    - Sperren (Fenster, Abwesenheit, Sensor, Tageslimit …) schalten sofort ab.
    - Ziel erreicht, mild oder zu teuer beenden den Lauf erst nach der Mindestlaufzeit.
    """
    stop = blocked or (FROST_SENSOR if temp is None else None) or (FROST_OUT if outdoor is None else None)
    if stop is None and day_s >= f["max_day"]:
        stop = FROST_LIMIT
    if stop:
        st["cold"] = st["run"] = None
        return stop, False, None
    run = st.get("run")
    if run is not None:
        ran = now - run
        if ran >= f["max_run"]:
            st["run"] = None
            st["pause"] = now + FROST_PAUSE_S
            return FROST_PAUSE, False, float(FROST_PAUSE_S)
        reason = None
        if temp >= f["target"]:
            reason = FROST_WARM
        elif outdoor >= f["out"] + FROST_OUT_HYST:
            reason = FROST_MILD
        elif price_high:
            reason = FROST_PRICE
        if reason and ran >= minrun_s:
            st["run"] = None
            if reason != FROST_PRICE:  # wegen des Preises gestoppt: der Raum bleibt „kalt seit“
                st["cold"] = None
            return reason, False, None
        return STATUS_FROST, True, None
    pause = st.get("pause")
    if pause is not None and now < pause:
        return FROST_PAUSE, False, pause - now
    st["pause"] = None
    if outdoor >= f["out"]:
        st["cold"] = None
        return FROST_MILD, False, None
    if temp > f["target"] - FROST_START_GAP:
        st["cold"] = None
        return FROST_WARM, False, None
    if st.get("cold") is None:
        st["cold"] = now
    rest = f["wait"] - (now - st["cold"])
    if rest > 0:
        return FROST_WAIT, False, rest
    if price_high:
        return FROST_PRICE, False, None
    st["run"] = now
    return STATUS_FROST, True, None


def frost_grid(heaters: list[dict[str, Any]], limit_w: float) -> dict[Any, int]:
    """Netzleistung aller Frost-Heizer begrenzen. Priorität entscheidet; passt die Wunschstufe nicht, eine niedrigere.

    Jeder Eintrag: id, prio, steps, want (gewünschte Stufe).
    """
    remaining = float(limit_w)
    out: dict[Any, int] = {}
    for h in sorted(heaters, key=lambda x: (x["prio"], str(x["id"]))):
        stage = h["want"]
        while stage > 0 and h["steps"][stage - 1] > remaining:
            stage -= 1
        if stage > 0:
            remaining -= h["steps"][stage - 1]
        out[h["id"]] = stage
    return out
