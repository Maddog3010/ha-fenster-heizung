"""Tests für die Tagesschlüssel (Weihnachts-Theme Build 3, tagesschluessel.py) mit echter Ed25519-Signatur.

Ausführen: python3 -m pytest tests  oder  python3 tests/test_tagesschluessel.py
Geprüft: eigener Schlüssel gilt nur an seinem Tag, echte Schlüssel an falschen Tagen, selbst gebaute und gefälschte
Schlüssel, fremde Signatur, andere Installation, zurückgestellte Uhr, Entwickler-Testschlüssel, wer welche Stufe bekommt,
Hochstufen des Sponsor-Status und das Säubern der Code-Datei.
"""
from __future__ import annotations

import base64
import importlib.util
import pathlib
import sys
from datetime import date

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives import serialization as S

ROOT = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung"
spec = importlib.util.spec_from_file_location("fh_tagesschluessel", ROOT / "tagesschluessel.py")
T = importlib.util.module_from_spec(spec)
spec.loader.exec_module(T)

PRIV = Ed25519PrivateKey.generate()
FAKE = Ed25519PrivateKey.generate()
b64 = lambda b: base64.urlsafe_b64encode(b).rstrip(b"=").decode()
PRIV_STR = "FHPRIV1-" + b64(PRIV.private_bytes(S.Encoding.Raw, S.PrivateFormat.Raw, S.NoEncryption()))
PUB = b64(PRIV.public_key().public_bytes(S.Encoding.Raw, S.PublicFormat.Raw))
V = T.verifier(PUB)
CODES = T.signiere(PRIV_STR, 2026)
A, B = "install-a", "install-b"


def chk(key, heute, letztes=None, inst=A, codes=None, dev=False, echt=None):
    return T.pruefen(key, heute, letztes, inst, CODES if codes is None else codes, V, dev, echt)


def test_signing_gives_four_codes():
    assert sorted(CODES) == ["1206", "1213", "1220", "1224"] and T.clean_codes({"2026": CODES}) == {"2026": CODES}
    assert T.clean_codes({"2026": {"1207": CODES["1206"], "1206": "kurz"}, "x": {}}) == {}


def test_own_key_only_on_its_day():
    k6 = T.schluessel_fuer(A, date(2026, 12, 6), CODES["1206"])
    assert k6.startswith("SW26-1206-SPON-")
    assert chk(k6, date(2026, 12, 6)) == (True, "sponsor")
    assert chk(k6.lower(), date(2026, 12, 6)) == (True, "sponsor")  # Groß-/Kleinschreibung egal
    assert chk(k6, date(2026, 12, 7)) == (False, "Heute ist kein Schlüssel-Tag")
    assert chk(k6, date(2026, 12, 13)) == (False, "Schlüssel gilt nicht für heute")
    assert chk(k6, date(2027, 12, 6)) == (False, "Schlüssel gilt nicht für heute")
    k24 = T.schluessel_fuer(A, date(2026, 12, 24), CODES["1224"])
    assert chk(k24, date(2026, 12, 24)) == (True, "max")


def test_forged_and_foreign_keys():
    fake7 = b64(FAKE.sign(T.nachricht(2026, "1207", "SPON")))
    assert chk(f"SW26-1207-SPON-{T.bindung(A, fake7)}", date(2026, 12, 7), codes={**CODES, "1207": fake7})[1] == "Heute ist kein Schlüssel-Tag"
    assert chk(f"SW26-1213-SMAX-{T.bindung(A, CODES['1213'])}", date(2026, 12, 13)) == (False, "Falsche Stufe für heute")
    fake20 = b64(FAKE.sign(T.nachricht(2026, "1220", "SMAX")))
    assert chk(f"SW26-1220-SMAX-{T.bindung(A, fake20)}", date(2026, 12, 20), codes={**CODES, "1220": fake20}) == (False, "Signatur ungültig")
    k6 = T.schluessel_fuer(A, date(2026, 12, 6), CODES["1206"])
    assert chk(k6, date(2026, 12, 6), inst=B) == (False, "Gehört zu einer anderen Installation")
    assert chk(k6, date(2026, 12, 6), codes={}) == (False, "Kein Tages-Code vorhanden")
    assert chk("Unsinn", date(2026, 12, 6)) == (False, "Ungültiges Format")


def test_clock_guard_and_simulation():
    k6 = T.schluessel_fuer(A, date(2026, 12, 6), CODES["1206"])
    assert chk(k6, date(2026, 12, 6), letztes=date(2026, 12, 8)) == (False, "Systemzeit zurückgestellt")
    # Simulation (Entwickler): Kalenderdatum 6.12., echtes Datum 22.11. – Uhr-Schutz prüft das echte Datum
    assert chk(k6, date(2026, 12, 6), letztes=date(2026, 11, 22), echt=date(2026, 11, 22)) == (True, "sponsor")


def test_dev_test_keys():
    assert chk("SW26-XMAS-SMAX-T3R8-D5VX", date(2026, 11, 22)) == (False, "Testschlüssel nur mit Entwickler-Zugang")
    assert chk("SW26-XMAS-SMAX-T3R8-D5VX", date(2026, 11, 22), dev=True) == (True, "max")
    assert chk("sw26-xmas-spon-t7k4-q9m2", date(2026, 12, 9), dev=True) == (True, "sponsor")  # ohne Tage-Sperre
    assert chk("SW26-XMAS-SPON-T7K4-Q9M2", date(2027, 1, 7), dev=True) == (False, "Testschlüssel abgelaufen")


def test_who_gets_which_key():
    w = T.wer_bekommt
    assert w(date(2026, 12, 6), "") == "SPON" and w(date(2026, 12, 6), "sponsor") is None and w(date(2026, 12, 6), "max") is None
    assert w(date(2026, 12, 20), "") == "SMAX" and w(date(2026, 12, 20), "sponsor") == "SMAX" and w(date(2026, 12, 24), "max") is None
    assert w(date(2026, 12, 7), "") is None


def test_sponsor_upgrade():
    none = {"state": "none", "ok": False}
    st, on = T.tag_upgrade(none, False, "sponsor", "2026-12-06")
    assert on and st["tier"] == "sponsor" and st["source"] == "tag"
    sp = {"state": "ok", "ok": True, "tier": "sponsor"}
    assert T.tag_upgrade(sp, True, "max", "2026-12-20")[0]["tier"] == "max"
    mx = {"state": "ok", "ok": True, "tier": "max"}
    assert T.tag_upgrade(mx, True, "max", "2026-12-20")[0] is mx
    assert T.tag_upgrade(none, False, None, "2026-12-06") == (none, False)


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
            print("ok", name)
