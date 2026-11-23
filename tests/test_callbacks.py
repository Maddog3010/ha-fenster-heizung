"""Gefunden von der Fehler-Statistik (2026.11.4.3b1): Eine normale (nicht async) Funktion, die an async_call_later,
async_track_* oder bus.async_listen übergeben wird, führt Home Assistant in einem Hilfs-Thread aus – ohne @callback.
Ruft sie dann async_dispatcher_send o. Ä. auf, gibt es „calls … from a thread other than the event loop“.
Dieser Test prüft den ganzen Code: jede solche Funktion braucht @callback oder muss async sein."""
from __future__ import annotations

import ast
import pathlib

BASE = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung"
TRACK = {"async_call_later", "async_track_time_interval", "async_track_point_in_time", "async_track_point_in_utc_time",
         "async_track_state_change_event", "async_track_time_change", "async_listen", "async_dispatcher_connect"}


def test_sync_handlers_have_callback():
    bad = []
    for f in BASE.rglob("*.py"):
        tree = ast.parse(f.read_text(encoding="utf-8"))
        defs: dict[str, list] = {}
        for n in ast.walk(tree):
            if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)):
                defs.setdefault(n.name, []).append(n)
        for n in ast.walk(tree):
            if not isinstance(n, ast.Call):
                continue
            fn = n.func.attr if isinstance(n.func, ast.Attribute) else getattr(n.func, "id", "")
            if fn not in TRACK:
                continue
            for a in n.args:
                name = a.attr if isinstance(a, ast.Attribute) else getattr(a, "id", None)
                for d in defs.get(name or "", []):
                    deco = {getattr(x, "id", None) or getattr(x, "attr", None) for x in d.decorator_list}
                    if isinstance(d, ast.FunctionDef) and name != "hass" and "callback" not in deco:
                        bad.append(f"{f.relative_to(BASE)}:{d.lineno} {name}() an {fn} ohne @callback")
    assert not bad, "\n".join(bad)
