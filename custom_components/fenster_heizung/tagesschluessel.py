"""Weihnachts-Theme Build 3: persönliche Tagesschlüssel im Adventskalender.

An vier Tagen (06.12., 13.12. Sponsor · 20.12., 24.12. Sponsor Max) bekommt, wer die Stufe nicht hat, einen Schlüssel,
mit dem die Sponsor-Funktionen genau einen Kalendertag lang laufen. Ein Schlüssel sieht so aus:

    SW26-1206-SPON-IWN6-IUO2    Jahr · Tag (MMTT) · Stufe (SPON/SMAX) · Bindung an die Installation

Geprüft wird in dieser Reihenfolge:
  1. Uhr nicht zurückgestellt (das höchste je gesehene Datum wird gespeichert)
  2. heute ist ein Schlüssel-Tag
  3. Jahr und Tag im Schlüssel = heute
  4. Stufe passt zum Tag
  5. Tages-Code mit Ed25519 signiert – geprüft mit demselben öffentlichen Schlüssel wie die Sponsor-Schlüssel
  6. Bindung passt zur eigenen Installations-ID von Home Assistant

Die Tages-Codes signiert nur der Entwickler (privater Schlüssel im Sponsor-Bereich). Sie dürfen öffentlich sein (Datei
advent_codes.json im Repository), weil jeder nur an seinem Tag und nur zusammen mit der eigenen Installation gilt.
Ehrliche Grenze: Wer den Code der Integration selbst ändert, kann jede lokale Prüfung entfernen – nachgebaute Schlüssel
für andere Tage oder Stufen sind ohne den privaten Schlüssel aber nicht möglich.

Entwickler-Testschlüssel (nur mit Entwickler-Zugang, bis 06.01.2027, ohne Tage-Sperre): siehe DEV_KEYS.
Die reine Logik hier braucht kein Home Assistant und ist in tests/test_tagesschluessel.py geprüft.
"""
from __future__ import annotations

import base64
import hashlib
from datetime import date
from typing import Any, Callable

SCHLUESSEL_TAGE = {(12, 6): "SPON", (12, 13): "SPON", (12, 20): "SMAX", (12, 24): "SMAX"}
STUFE = {"SPON": "sponsor", "SMAX": "max"}
DEV_KEYS = {"SW26-XMAS-SPON-T7K4-Q9M2": "SPON", "SW26-XMAS-SMAX-T3R8-D5VX": "SMAX"}
DEV_BIS = date(2027, 1, 6)


def _b64e(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()


def _b64d(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def mmtt(d: date) -> str:
    return f"{d.month:02d}{d.day:02d}"


def nachricht(jahr: int, tag: str, stufe: str) -> bytes:
    """Was der Entwickler signiert: „SW26|1206|SPON“."""
    return f"SW{jahr % 100:02d}|{tag}|{stufe}".encode()


def stufe_am(d: date) -> str | None:
    return SCHLUESSEL_TAGE.get((d.month, d.day))


def bindung(install_id: str, code: str) -> str:
    h = base64.b32encode(hashlib.sha256(f"{install_id}|{code}".encode()).digest()).decode()[:8]
    return f"{h[:4]}-{h[4:]}"


def schluessel_fuer(install_id: str, d: date, code: str) -> str | None:
    st = stufe_am(d)
    return f"SW{d.year % 100:02d}-{mmtt(d)}-{st}-{bindung(install_id, code)}" if st and code else None


def wer_bekommt(d: date, tier: str) -> str | None:
    """Welche Stufe bekommt ein Nutzer mit Stufe tier ('' · sponsor · max) heute als Schlüssel? None = keinen."""
    st = stufe_am(d)
    if st is None or tier == "max":
        return None
    if tier == "sponsor":
        return st if st == "SMAX" else None  # Sponsoren testen an Tag 20 und 24 die Stufe Max
    return st


def pruefen(key: Any, heute: date, letztes: date | None, install_id: str, codes: dict[str, str],
            verify: Callable[[bytes, bytes], bool], dev: bool = False, echt: date | None = None) -> tuple[bool, str]:
    """(True, 'sponsor'|'max') oder (False, Grund). heute = Kalenderdatum (bei Simulation das simulierte), echt = echtes Datum."""
    k = str(key or "").strip().upper()
    echt = echt or heute
    if k in DEV_KEYS:
        if not dev:
            return False, "Testschlüssel nur mit Entwickler-Zugang"
        return (True, STUFE[DEV_KEYS[k]]) if echt <= DEV_BIS else (False, "Testschlüssel abgelaufen")
    if letztes is not None and echt < letztes:
        return False, "Systemzeit zurückgestellt"
    st_heute = stufe_am(heute)
    if st_heute is None:
        return False, "Heute ist kein Schlüssel-Tag"
    teile = k.split("-")
    if len(teile) != 5:
        return False, "Ungültiges Format"
    jahr, tag, stufe, b1, b2 = teile
    if jahr != f"SW{heute.year % 100:02d}" or tag != mmtt(heute):
        return False, "Schlüssel gilt nicht für heute"
    if stufe != st_heute:
        return False, "Falsche Stufe für heute"
    code = codes.get(tag)
    if not code:
        return False, "Kein Tages-Code vorhanden"
    try:
        ok = verify(_b64d(code), nachricht(heute.year, tag, stufe))
    except Exception:  # noqa: BLE001 - kaputter Code = ungültig
        ok = False
    if not ok:
        return False, "Signatur ungültig"
    if f"{b1}-{b2}" != bindung(install_id, code):
        return False, "Gehört zu einer anderen Installation"
    return True, STUFE[stufe]


def verifier(public_b64: str) -> Callable[[bytes, bytes], bool]:
    from cryptography.exceptions import InvalidSignature
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

    pub = Ed25519PublicKey.from_public_bytes(_b64d(public_b64))

    def _v(sig: bytes, msg: bytes) -> bool:
        try:
            pub.verify(sig, msg)
            return True
        except InvalidSignature:
            return False

    return _v


def signiere(priv: str, jahr: int, prefix: str = "FHPRIV1-") -> dict[str, str]:
    """Nur für den Entwickler: die vier Tages-Codes eines Jahres mit dem privaten Schlüssel signieren."""
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

    k = Ed25519PrivateKey.from_private_bytes(_b64d(priv.strip()[len(prefix):]))
    return {f"{m:02d}{d:02d}": _b64e(k.sign(nachricht(jahr, f"{m:02d}{d:02d}", st))) for (m, d), st in SCHLUESSEL_TAGE.items()}


def clean_codes(raw: Any) -> dict[str, dict[str, str]]:
    """{"2026": {"1206": "…"}} – nur gültige Jahre, Tage und Längen."""
    out: dict[str, dict[str, str]] = {}
    if isinstance(raw, dict):
        for j, tage in raw.items():
            if str(j).isdigit() and len(str(j)) == 4 and isinstance(tage, dict):
                t = {str(k): str(v) for k, v in tage.items() if str(k) in {f"{m:02d}{d:02d}" for (m, d) in SCHLUESSEL_TAGE} and isinstance(v, str) and 40 <= len(v) <= 100}
                if t:
                    out[str(j)] = t
    return out


def tag_upgrade(st: dict[str, Any], active: bool, tag_stufe: str | None, heute: str) -> tuple[dict[str, Any], bool]:
    """Sponsor-Status mit einem heute gültigen Tagesschlüssel: ohne Stufe → Tag-Stufe, Sponsor + Max-Tag → Max."""
    if not tag_stufe:
        return st, active
    if not active or (st.get("tier") == "sponsor" and tag_stufe == "max"):
        return {"state": "tag", "ok": True, "name": "Sponsor-Tag", "bis": heute, "days": 0, "tier": tag_stufe, "source": "tag"}, True
    return st, active
