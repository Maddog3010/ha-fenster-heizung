"""Gleich benannte Methoden in zwei Teilen von frontend-src/parts überschreiben sich in der Klasse still –
der spätere Teil gewinnt. So rief „Warum?“ (Modul 1) das Laden der Wartung (Modul 15) auf (2026.11.4.4).
Dieser Test verhindert das: jeder Methodenname darf nur einmal vorkommen."""
from __future__ import annotations

import collections
import pathlib
import re

PARTS = pathlib.Path(__file__).resolve().parents[1] / "frontend-src" / "parts"
DEF = re.compile(r"^  (?:async )?(_?[A-Za-z0-9_$]+)\([^)]*\) \{")
SKIP = {"if", "for", "while", "switch", "catch", "constructor"}


def test_no_duplicate_methods():
    seen: dict[str, list[str]] = collections.defaultdict(list)
    for f in sorted(PARTS.glob("*.js")):
        for i, line in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
            m = DEF.match(line)
            if m and m.group(1) not in SKIP:
                seen[m.group(1)].append(f"{f.name}:{i}")
    dups = {k: v for k, v in seen.items() if len(v) > 1}
    assert not dups, f"Methoden doppelt definiert: {dups}"
