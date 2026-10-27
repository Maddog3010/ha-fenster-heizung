#!/usr/bin/env python3
"""Baut das Dashboard (panel.js) aus den Quelldateien in frontend-src/parts.

  python3 frontend-src/build.py          baut custom_components/fenster_heizung/frontend/panel.js
  python3 frontend-src/build.py --check  prüft nur, ob panel.js zu den Quelldateien passt (für CI)

Die Teile werden in der Reihenfolge ihres Dateinamens (01-, 02-, ...) ohne Zusatz aneinandergehängt.
"""
import pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT.parent / "custom_components" / "fenster_heizung" / "frontend" / "panel.js"

def build() -> bytes:
    parts = sorted((ROOT / "parts").glob("*.js"))
    if not parts:
        sys.exit("Keine Teile in frontend-src/parts gefunden")
    return b"".join(p.read_bytes() for p in parts)

def main() -> None:
    data = build()
    if "--check" in sys.argv:
        if not OUT.exists() or OUT.read_bytes() != data:
            sys.exit("panel.js passt nicht zu frontend-src/parts. Bitte build.py ausführen.")
        print("panel.js ist aktuell")
        return
    OUT.write_bytes(data)
    r = subprocess.run(["node", "--check", str(OUT)], capture_output=True, text=True)
    if r.returncode:
        sys.exit("Syntaxfehler in panel.js:\n" + r.stderr)
    print(f"panel.js gebaut ({len(data):,} Bytes aus {len(list((ROOT / 'parts').glob('*.js')))} Teilen)")

if __name__ == "__main__":
    main()
