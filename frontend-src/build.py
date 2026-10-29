#!/usr/bin/env python3
"""Baut das Dashboard (panel.js) aus den Quelldateien in frontend-src/parts.

  python3 frontend-src/build.py          baut custom_components/fenster_heizung/frontend/panel.js
  python3 frontend-src/build.py --check  prüft nur, ob panel.js zu den Quelldateien passt (für CI)

Die Teile werden in der Reihenfolge ihres Dateinamens (01-, 02-, ...) ohne Zusatz aneinandergehängt.
Vorher wird frontend-src/parts/02b-releases.js aus CHANGELOG.md erzeugt (letzte stabile Versionen für
Einstellungen → System → Versionen). Diese Datei nicht von Hand ändern.
"""
import json, pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT.parent / "custom_components" / "fenster_heizung" / "frontend" / "panel.js"

CHANGELOG = ROOT.parent / "CHANGELOG.md"
REL_PART = ROOT / "parts" / "02b-releases.js"
REL_MAX = 8  # so viele stabile Versionen werden mitgeliefert (angezeigt werden 5)


def _short(txt: str, n: int = 140) -> str:
    txt = re.sub(r"\s+", " ", txt).strip()
    return txt if len(txt) <= n else txt[: n - 1].rsplit(" ", 1)[0] + " …"


def releases() -> list[dict]:
    """Stabile Versionen (ohne b1, b2 …) mit kurzen Änderungspunkten aus CHANGELOG.md."""
    out: list[dict] = []
    text = CHANGELOG.read_text(encoding="utf-8")
    for sec in re.split(r"^## ", text, flags=re.M)[1:]:
        m = re.match(r"\[([^\]]+)\]\s*-\s*(\d{4}-\d{2}-\d{2})", sec)
        if not m or "b" in m.group(1):
            continue
        items, chips, fix = [], [], False
        for line in sec.splitlines():
            if line.startswith("### "):
                fix = line[4:].strip().lower().startswith("behoben")
                continue
            if not line.startswith("- "):  # nur Hauptpunkte, keine Unterpunkte
                continue
            body = line[2:].strip()
            b = re.match(r"\*\*(.+?)\*\*", body)
            t = b.group(1) if b else re.split(r"(?<=[.!?])\s", body, maxsplit=1)[0]
            t = re.sub(r"[*_`]", "", t).strip()
            c = re.match(r"(Modul \d+)[^(:]*\((v[\d.]+(?: Build \d+)?)\):\s*(.*)", t)
            if c:
                chip = f"{c.group(1)} · {c.group(2)}"
                if chip not in chips:
                    chips.append(chip)
                t = c.group(3)
            t = t.rstrip(":.").strip()
            if t and not t.lower().startswith("modulversionen"):
                items.append(_short(("Behoben: " if fix else "") + t[0].upper() + t[1:]))
        if items:
            out.append({"v": m.group(1), "d": m.group(2), "t": items[:3], "c": chips[:3]})
        if len(out) >= REL_MAX:
            break
    return out


def rel_part() -> bytes:
    data = json.dumps(releases(), ensure_ascii=False, separators=(",", ":"))
    return ("/* Automatisch aus CHANGELOG.md erzeugt (frontend-src/build.py). Nicht von Hand ändern. */\n"
            f"const REL = {data};\n").encode("utf-8")


def build() -> bytes:
    rp = rel_part()
    if "--check" not in sys.argv:
        REL_PART.write_bytes(rp)
    elif not REL_PART.exists() or REL_PART.read_bytes() != rp:
        sys.exit("02b-releases.js passt nicht zu CHANGELOG.md. Bitte build.py ausführen.")
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
