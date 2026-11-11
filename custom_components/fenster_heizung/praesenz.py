"""Präsenzmelder je Raum (Modul 1, Konzept „Präsenzmelder“).

„Mensch im Raum = heizen auf … °C“. Ein Präsenz- oder Bewegungsmelder (binary_sensor mit
occupancy/presence/motion oder ein sensor mit Personenzahl) hebt das Ziel des Raums an:

- Modus „Mindestens“ (Standard): Ziel = höher von Heizplan und Wohlfühltemperatur.
  „Genau“: Ziel = Wohlfühltemperatur, auch wenn der Heizplan mehr vorsieht.
- Verzögerung beim Kommen (Standard 2 Min.) und beim Gehen (Standard 15 Min.), damit kurzes
  Durchlaufen oder ein stiller Moment am Schreibtisch nichts umschaltet.
- Leerlauf-Absenkung (Standard aus): Ist der Raum länger leer (Standard 60 Min.), wird das
  Heizplan-Ziel um ein paar Kelvin gesenkt.
- Bei Abwesenheit oder Urlaub ignoriert (Standard), im Sommermodus ohne Wirkung.
- Ausgeschaltete Thermostate werden nur eingeschaltet, wenn „Thermostat einschalten“ an ist.
- Ohne Heizplan merkt sich der Raum die Solltemperaturen beim Kommen und stellt sie beim Gehen zurück.

Bei offenem Fenster, „Heizung aus“ oder laufendem Elektroheizer wird wie beim Heizplan nichts gesetzt.
"""
from __future__ import annotations

from datetime import timedelta
from typing import Any

from homeassistant.core import callback
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.util import dt as dt_util

from .const import CONF_THERMOSTATS, HEATING_MODES, PR_KEYS  # noqa: F401
PR_DEF = {"pr_on": "off", "pr_entity": None, "pr_temp": 21.0, "pr_mode": "min", "pr_on_delay": 2, "pr_off_delay": 15, "pr_idle": 0.0, "pr_idle_after": 60, "pr_in_away": "off", "pr_turn_on": "off"}
ON_STATES = ("on", "home", "detected", "occupied", "present", "true", "motion", "anwesend")


def clean_presence(raw: dict[str, Any], out: dict[str, Any], opt_entity, num) -> None:
    """Einstellungen des Präsenzmelders prüfen (Teil von clean_options)."""
    out["pr_on"] = "on" if raw.get("pr_on") == "on" else "off"
    out["pr_entity"] = opt_entity(raw, "pr_entity", ("binary_sensor", "sensor", "input_boolean"))
    for key, lo, hi in (("pr_temp", 5, 30), ("pr_on_delay", 0, 60), ("pr_off_delay", 0, 240), ("pr_idle", 0, 5), ("pr_idle_after", 5, 480)):
        v = raw.get(key)
        try:
            v = float(v) if v not in (None, "") else PR_DEF[key]
        except (TypeError, ValueError):
            raise ValueError(f"Präsenzmelder: {key} ist keine Zahl") from None
        if not lo <= v <= hi:
            raise ValueError(f"Präsenzmelder: erlaubt sind {lo} bis {hi}")
        out[key] = round(v * 2) / 2 if key in ("pr_temp", "pr_idle") else int(v)
    out["pr_mode"] = "exact" if raw.get("pr_mode") == "exact" else "min"
    out["pr_in_away"] = "on" if raw.get("pr_in_away") == "on" else "off"
    out["pr_turn_on"] = "on" if raw.get("pr_turn_on") == "on" else "off"
    if out["pr_on"] == "on" and not out["pr_entity"]:
        raise ValueError("Präsenzmelder: Melder wählen")


class RoomPresence:
    def __init__(self, ctrl) -> None:
        self.ctrl = ctrl
        self.hass = ctrl.hass
        self.present = False
        self.raw: bool | None = None
        self.raw_since = None
        self.since = None  # letzter bestätigter Wechsel
        self.last_seen = None
        self.saved: dict[str, float] = {}
        self._unsub = None
        self._seen_saved = None

    # --- Einstellungen -------------------------------------------------------
    def c(self, key: str) -> Any:
        v = self.ctrl.cfg.get(key)
        return PR_DEF[key] if v is None else v

    @property
    def on(self) -> bool:
        return self.c("pr_on") == "on" and bool(self.c("pr_entity"))

    # --- Speichern (übersteht einen Neustart von Home Assistant) ---------------
    def data(self) -> dict[str, Any]:
        iso = lambda t: t.isoformat() if t else None  # noqa: E731
        return {"present": self.present, "since": iso(self.since), "last_seen": iso(self.last_seen), "saved": self.saved}

    def load(self, raw: Any) -> None:
        if not isinstance(raw, dict):
            return
        p = lambda v: dt_util.parse_datetime(v) if isinstance(v, str) else None  # noqa: E731
        self._loaded = {"present": bool(raw.get("present")), "since": p(raw.get("since")), "last_seen": p(raw.get("last_seen"))}
        if isinstance(raw.get("saved"), dict):
            self.saved = {k: float(v) for k, v in raw["saved"].items() if isinstance(v, (int, float))}

    # --- Melder lesen --------------------------------------------------------
    def _read(self) -> bool | None:
        st = self.hass.states.get(self.c("pr_entity") or "")
        if st is None or st.state in ("unknown", "unavailable", ""):
            return None
        s = str(st.state).lower()
        try:
            return float(s) > 0
        except ValueError:
            return s in ON_STATES

    def start(self) -> None:
        if not self.on:
            return
        now, old = dt_util.now(), getattr(self, "_loaded", None) or {}
        self.raw = self._read()
        self.raw_since = now - timedelta(minutes=600)  # beim Start sofort gültig
        self.present = bool(self.raw)
        self.last_seen = old.get("last_seen")
        # Zustand wie vor dem Neustart: „seit …“ und „leer seit …“ laufen weiter
        self.since = old.get("since") if old.get("since") and old.get("present") == self.present else now
        if self.present:
            self.last_seen = now
        self._unsub = async_track_state_change_event(self.hass, [self.c("pr_entity")], self._changed)

    def stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None

    @callback
    def _changed(self, _event) -> None:
        self.hass.async_create_task(self.step())

    async def step(self) -> None:
        """Melder auswerten (bei jeder Änderung und jede Minute). Wechsel mit Verzögerung bestätigen."""
        if not self.on:
            return
        now, raw = dt_util.now(), self._read()
        if raw is None:
            return  # Melder meldet nichts: Zustand halten
        if raw != self.raw:
            self.raw, self.raw_since = raw, now
        if raw:
            self.last_seen = now
        mins = (now - self.raw_since).total_seconds() / 60 if self.raw_since else 999
        changed = False
        if raw and not self.present and mins >= float(self.c("pr_on_delay")):
            self.present, self.since, changed = True, now, True
            if not self.ctrl._plan_enabled() and self.ctrl.away_temp is None:
                self.saved = {}
                for eid in self.ctrl.cfg[CONF_THERMOSTATS]:
                    st = self.hass.states.get(eid)
                    val = st.attributes.get("temperature") if st else None
                    if st is not None and st.state in HEATING_MODES and isinstance(val, (int, float)):
                        self.saved[eid] = float(val)
        elif not raw and self.present and mins >= float(self.c("pr_off_delay")):
            self.present, self.since, changed = False, now, True
        idle_due = self.idle_active
        if changed or idle_due != getattr(self, "_idle_was", False):
            self._idle_was = idle_due
            self.ctrl._plan_key = None
            if changed and not self.present and self.saved and self.ctrl._current_target() is None:
                if not self.ctrl.active and not self.ctrl._heating_off():
                    for eid, value in self.saved.items():
                        st = self.hass.states.get(eid)
                        if st is not None and st.state in HEATING_MODES:
                            await self.ctrl._call("set_temperature", eid, temperature=value)
                self.saved = {}
            await self.ctrl._plan_apply_if_due(force=True)
            await self.ctrl._save()
            self.ctrl._signal()
        elif raw and (self._seen_saved is None or (now - self._seen_saved).total_seconds() > 600):
            self._seen_saved = now  # „zuletzt gesehen“ höchstens alle 10 Min. sichern
            await self.ctrl._save()

    # --- Wirkung auf das Ziel ------------------------------------------------
    @property
    def idle_active(self) -> bool:
        if not self.on or self.present or float(self.c("pr_idle")) <= 0:
            return False
        ref = self.last_seen or self.since
        return ref is not None and (dt_util.now() - ref).total_seconds() / 60 >= float(self.c("pr_idle_after"))

    def blocked(self) -> str | None:
        if not self.on:
            return "aus"
        if self.ctrl.away_temp is not None and self.c("pr_in_away") != "on":
            return "abwesend"
        mgr = self.ctrl._general()
        if mgr is not None and mgr.summer:
            return "sommer"
        return None

    def adjust(self, base):
        """Ziel aus Heizplan/Abwesenheit (key, temp, turn_on) mit Präsenz verrechnen."""
        if self.blocked():
            return base
        t = float(self.c("pr_temp"))
        turn = self.c("pr_turn_on") == "on"
        if self.present:
            if base is None:
                return (f"pr:{t:g}", t, turn)
            key, temp, turn_on = base
            new = max(temp, t) if self.c("pr_mode") == "min" else t
            return (f"{key}|pr:{new:g}", new, turn_on or turn) if new != temp else base
        if base is not None and self.idle_active and self.ctrl.away_temp is None:
            key, temp, turn_on = base
            new = max(5.0, temp - float(self.c("pr_idle")))
            return (f"{key}|idle:{new:g}", new, turn_on)
        return base

    def attrs(self) -> dict[str, Any] | None:
        if not self.on:
            return None
        b = self.blocked()
        return {
            "melder": self.c("pr_entity"),
            "anwesend": self.present,
            "roh": self.raw,
            "seit": self.since.isoformat() if self.since else None,
            "zuletzt": self.last_seen.isoformat() if self.last_seen else None,
            "temp": float(self.c("pr_temp")),
            "modus": self.c("pr_mode"),
            "leerlauf": self.idle_active,
            "leerlauf_k": float(self.c("pr_idle")),
            "gesperrt": b,
            "verz_an": self.c("pr_on_delay"),
            "verz_aus": self.c("pr_off_delay"),
        }

    def reasons(self, add) -> None:
        if not self.on:
            return
        b, t = self.blocked(), float(self.c("pr_temp"))
        deg = lambda v: f"{v:.1f} °C".replace(".", ",")  # noqa: E731
        if b == "abwesend":
            add("info", "Präsenzmelder ruht: Abwesenheit oder Urlaub hat Vorrang")
        elif b == "sommer":
            add("info", "Präsenzmelder ruht im Sommermodus")
        elif self.present:
            add("ok", f"Jemand im Raum: {'mindestens' if self.c('pr_mode') == 'min' else 'genau'} {deg(t)}")
        elif self.raw and not self.present:
            add("info", f"Bewegung erkannt, nach {self.c('pr_on_delay')} Min. gilt der Raum als belegt")
        elif self.idle_active:
            add("info", f"Raum länger leer: Ziel {float(self.c('pr_idle')):g} K abgesenkt".replace(".", ","))
        else:
            add("info", "Präsenzmelder: niemand im Raum")
