"""Thermostat lehnt einen Befehl ab (2026.11.4.8): zwei weitere Versuche, keine Meldung als Programmfehler."""
from __future__ import annotations

import ast
import asyncio
import pathlib
from typing import Any

ROOT = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung"
NAMES = ("_call", "_cmd_mark", "_call_rejected", "_retry_clear")


class HomeAssistantError(Exception):
    pass


class ServiceValidationError(HomeAssistantError):
    pass


class _Log:
    def __init__(self):
        self.lines = []

    def warning(self, msg, *a):
        self.lines.append(("warning", msg % a))

    def exception(self, msg, *a):
        self.lines.append(("exception", msg % a))


def _build():
    """Nur die vier Methoden aus __init__.py laden – ohne Home Assistant."""
    tree = ast.parse((ROOT / "__init__.py").read_text(encoding="utf-8"))
    cls = next(n for n in tree.body if isinstance(n, ast.ClassDef) and n.name == "WindowController")
    body = [n for n in cls.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)) and n.name in NAMES]
    assert len(body) == len(NAMES)
    mod = ast.Module(body=[ast.ImportFrom(module="__future__", names=[ast.alias(name="annotations")], level=0),
                           ast.ClassDef(name="C", bases=[], keywords=[], body=body, decorator_list=[], type_params=[])], type_ignores=[])
    log, diag, timers = _Log(), [], []

    def later(_hass, wait, cb):
        t = {"wait": wait, "cb": cb, "off": False}
        timers.append(t)
        return lambda: t.update(off=True)

    env: dict[str, Any] = {
        "Any": Any, "CMD_RETRY": (10, 60), "_LOGGER": log, "ServiceValidationError": ServiceValidationError,
        "geraetefehler": lambda e: isinstance(e, (HomeAssistantError, TimeoutError, OSError)),
        "diag_log": lambda _h, _l, msg, **k: diag.append(msg), "diag_expect": lambda *a, **k: None, "async_call_later": later,
    }
    exec(compile(ast.fix_missing_locations(mod), "init_teil", "exec"), env)  # noqa: S102
    return env["C"], log, diag, timers


class _State:
    def __init__(self, state, temperature=21):
        self.state, self.attributes = state, {"temperature": temperature}


def _room(errors):
    C, log, diag, timers = _build()
    states, calls = {"climate.bad": _State("heat")}, []

    async def service(dom, name, data, blocking=False):
        calls.append((name, data))
        if errors:
            e = errors.pop(0)
            if e is not None:
                raise e

    c = C()
    c.hass = type("H", (), {})()
    c.hass.states = states
    c.hass.services = type("S", (), {"async_call": staticmethod(service)})()
    c.entry = type("E", (), {"title": "Bad"})()
    c._retry, c.off = {}, False
    c._heating_off = lambda: c.off
    return c, log, diag, timers, states, calls


def _off(c):
    asyncio.run(c._call("set_hvac_mode", "climate.bad", hvac_mode="off"))


def _fire(t):
    assert not t["off"]
    asyncio.run(t["cb"](None))


ERR = HomeAssistantError("Unable to communicate with the device")


def test_rejected_command_is_retried_and_not_a_program_error():
    c, log, diag, timers, _s, calls = _room([ERR, None])
    _off(c)
    assert [t["wait"] for t in timers] == [10]
    _fire(timers[0])
    assert len(calls) == 2 and not c._retry and not diag
    assert [k for k, _ in log.lines] == ["warning"]


def test_gives_up_after_three_attempts_with_one_diagnosis_entry():
    c, log, diag, timers, _s, calls = _room([ERR, ERR, ERR])
    _off(c)
    _fire(timers[0])
    _fire(timers[1])
    assert len(calls) == 3 and [t["wait"] for t in timers] == [10, 60]
    assert len(diag) == 1 and "3 Versuchen" in diag[0]
    assert all(k == "warning" for k, _ in log.lines)


def test_no_retry_when_device_was_changed_meanwhile_or_heating_is_off():
    c, _l, _d, timers, states, calls = _room([ERR])
    _off(c)
    states["climate.bad"] = _State("auto")
    _fire(timers[0])
    assert len(calls) == 1
    c, _l, _d, timers, _s, calls = _room([ERR])
    _off(c)
    c.off = True
    _fire(timers[0])
    assert len(calls) == 1


def test_unreachable_device_counts_as_attempt():
    c, _l, diag, timers, states, calls = _room([ERR])
    _off(c)
    states["climate.bad"] = _State("unavailable")
    _fire(timers[0])
    _fire(timers[1])
    assert len(calls) == 1 and len(diag) == 1


def test_newer_command_and_clear_cancel_pending_retry():
    c, _l, _d, timers, _s, calls = _room([ERR, None])
    _off(c)
    asyncio.run(c._call("set_hvac_mode", "climate.bad", hvac_mode="heat"))
    assert timers[0]["off"] and not c._retry and len(calls) == 2
    c, _l, _d, timers, _s, _c = _room([ERR])
    _off(c)
    c._retry_clear()
    assert timers[0]["off"] and not c._retry


def test_program_errors_are_still_logged_as_errors():
    for err in (KeyError("x"), ServiceValidationError("falscher Wert")):
        c, log, diag, timers, _s, _c = _room([err])
        _off(c)
        assert not timers and [k for k, _ in log.lines] == ["exception"] and len(diag) == 1


def test_restore_suppress_release_and_stop_clear_pending_retries():
    src = (ROOT / "__init__.py").read_text(encoding="utf-8")
    for name in ("_restore", "_suppress", "_release", "async_stop"):
        part = src.split(f"async def {name}(self", 1)[1].split("\n    async def ", 1)[0].split("\n    def ", 1)[0]
        assert "self._retry_clear()" in part, name
