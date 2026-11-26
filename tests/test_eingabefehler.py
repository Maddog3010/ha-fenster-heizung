"""Hinweise zur Eingabe sind keine Programmfehler (z. B. Raum ohne Thermostat speichern).

Das Backend antwortet mit „invalid_input“, das Fehlerprotokoll zählt das nicht, und der Raum-Dialog zeigt gleich,
was fehlt, ohne den Befehl abzuschicken. Schema-Fehler („invalid_format“) werden weiter gemeldet.
"""
from __future__ import annotations

import ast
import importlib.util
import pathlib
import shutil
import subprocess
import sys
import types

import pytest

ROOT = pathlib.Path(__file__).resolve().parents[1]
PKG = ROOT / "custom_components" / "fenster_heizung"
PARTS = ROOT / "frontend-src" / "parts"
NODE = shutil.which("node")


def _load(*names):
    """Module des Pakets laden, ohne __init__.py (das braucht Home Assistant)."""
    old = {k: v for k, v in sys.modules.items() if k == "fhein" or k.startswith("fhein.")}
    pkg = types.ModuleType("fhein")
    pkg.__path__ = [str(PKG)]
    sys.modules["fhein"] = pkg
    try:
        out = []
        for n in names:
            spec = importlib.util.spec_from_file_location(f"fhein.{n}", PKG / f"{n}.py")
            mod = importlib.util.module_from_spec(spec)
            sys.modules[f"fhein.{n}"] = mod
            spec.loader.exec_module(mod)
            out.append(mod)
        return out
    finally:
        for k in [k for k in sys.modules if k == "fhein" or k.startswith("fhein.")]:
            sys.modules.pop(k)
        sys.modules.update(old)


@pytest.mark.parametrize(("raw", "text"), [
    ({"window_sensors": ["binary_sensor.f"], "thermostats": []}, "Heizungsthermostate: mindestens eine Entität wählen"),
    ({"window_sensors": [], "thermostats": ["climate.t"]}, "Fenstersensoren: mindestens eine Entität wählen"),
])
def test_missing_entity_is_an_input_hint(raw, text):
    eingabe, _const, _pv, options = _load("eingabe", "const", "pvlogic", "options")
    with pytest.raises(ValueError) as err:
        options.clean_options(raw)
    assert type(err.value).__name__ == "EingabeFehler" and str(err.value) == text


def test_input_checks_never_raise_plain_value_error():
    for name in ("options.py", "praesenz.py", "heizer.py"):
        assert "raise ValueError(" not in (PKG / name).read_text(encoding="utf-8"), name


def test_backend_code_for_input_hints():
    tree = ast.parse((PKG / "api.py").read_text(encoding="utf-8"))
    fn = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == "_eingabe_code")

    class EingabeFehler(ValueError):
        pass

    ns = {"EingabeFehler": EingabeFehler}
    exec(compile("from __future__ import annotations\n" + ast.unparse(fn), "api", "exec"), ns)  # noqa: S102
    assert ns["_eingabe_code"](EingabeFehler("x")) == "invalid_input"
    assert ns["_eingabe_code"](ValueError("x")) == "invalid_format"   # unerwarteter Fehler bleibt sichtbar
    assert ns["_eingabe_code"](TypeError("x")) == "invalid_format"


LOG_JS = r"""
const fs = require("fs");
const C = eval(`(class { ${fs.readFileSync(process.argv[1], "utf8")} })`);
const a = new C(), got = []; a._errSend = (p) => got.push(p.kind);
for (const code of ["invalid_input", "invalid_format", "not_found", "unknown_error"]) a._errCmd({ type: "fenster_heizung/set_options" }, { code, message: "x" });
console.log(JSON.stringify(got));
"""


@pytest.mark.skipif(NODE is None, reason="node fehlt")
def test_log_skips_input_hints():
    out = subprocess.run([NODE, "-e", LOG_JS, str(PARTS / "12e6-fehlerprotokoll.js")], capture_output=True, text=True, timeout=60, check=True).stdout.strip()
    assert out == '["invalid_format","unknown_error"]', out


SAVE_JS = r"""
const fs = require("fs");
const src = fs.readFileSync(process.argv[1], "utf8");
const start = src.indexOf("  async _optAct("), end = src.indexOf("  _optBody(", start);
const C = eval(`(class { ${src.slice(start, end)} })`);
(async () => {
  const res = [];
  for (const [w, t] of [[["binary_sensor.f"], []], [[], []], [["binary_sensor.f"], ["climate.t"]]]) {
    const a = new C(), sent = [], toast = []; let scrolled = 0;
    a._modal = { type: "opt", id: "r", draft: { window_sensors: w, thermostats: t }, open: new Set(["ctl"]), busy: false };
    a._renderModal = () => {}; a._toast = (x) => toast.push(x); a._hass = { callWS: async (m) => { sent.push(m.type); } };
    a.shadowRoot = { querySelector: () => ({ scrollIntoView: () => scrolled++ }) };
    globalThis.setTimeout = () => 0;
    const m = a._modal; await a._optAct("osave", { dataset: {} });
    res.push({ sent: sent.length, dev: m.open.has("dev"), scrolled, toast: toast[0] });
  }
  console.log(JSON.stringify(res));
})();
"""


@pytest.mark.skipif(NODE is None, reason="node fehlt")
def test_dialog_shows_what_is_missing_instead_of_saving():
    out = subprocess.run([NODE, "-e", SAVE_JS, str(PARTS / "06-ereignisse-raumoptionen.js")], capture_output=True, text=True, timeout=60, check=True).stdout.strip()
    assert out == ('[{"sent":0,"dev":true,"scrolled":1,"toast":"Bitte noch ein Thermostat wählen"},'
                   '{"sent":0,"dev":true,"scrolled":1,"toast":"Bitte noch einen Fenstersensor und ein Thermostat wählen"},'
                   '{"sent":1,"dev":false,"scrolled":0,"toast":"Einstellungen gespeichert"}]'), out
