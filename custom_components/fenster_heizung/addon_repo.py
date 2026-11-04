"""Addon-Katalog aus GitHub (Phase 2, Ablage B).

Der Katalog liegt im Repository Maddog3010/strom-waerme-addons:
  catalog.json   Liste aller Addons mit Version, Download-Adresse, Größe und SHA-256 der ZIP-Datei
  catalog.sig    Ed25519-Unterschrift über die genauen Bytes von catalog.json (base64url)
Unterschrieben wird mit demselben Entwickler-Schlüssel wie die Sponsor-Schlüssel. Die Integration prüft mit dem
öffentlichen Schlüssel aus sponsor.py. Ohne gültige Unterschrift wird nichts angeboten und nichts geladen.

Eine ZIP-Datei enthält genau einen Ordner <id>/ mit addon.json, __init__.py und www/. Beim Entpacken werden absolute
Pfade, „..“, Links und alles außerhalb von <id>/ abgelehnt.
"""
from __future__ import annotations

import hashlib
import io
import json
import os
import re
import shutil
import stat
import zipfile
from typing import Any

REPO = "Maddog3010/strom-waerme-addons"
CATALOG_URL = f"https://raw.githubusercontent.com/{REPO}/main/catalog.json"
SIG_URL = f"https://raw.githubusercontent.com/{REPO}/main/catalog.sig"
DL_PREFIX = f"https://github.com/{REPO}/releases/download/"
CATALOG_MAX = 256 * 1024
ZIP_MAX = 8 * 1024 * 1024
UNZIP_MAX = 24 * 1024 * 1024
FILES_MAX = 400
_SHA = re.compile(r"^[0-9a-f]{64}$")
_ID = re.compile(r"^[a-z][a-z0-9_]{1,30}$")


class RepoError(Exception):
    """Fehler, den die Oberfläche anzeigen darf."""


def _b64d(s: str) -> bytes:
    import base64

    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def verify(raw: bytes, sig: str, public_key: str) -> bool:
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

    try:
        Ed25519PublicKey.from_public_bytes(_b64d(public_key)).verify(_b64d(sig.strip()), raw)
        return True
    except Exception:  # noqa: BLE001 - jede Abweichung heißt ungültig
        return False


def clean_entry(x: Any, clean_meta) -> dict[str, Any] | None:
    """Ein Eintrag aus catalog.json → Steckbrief plus Download-Angaben, oder None."""
    if not isinstance(x, dict):
        return None
    m = clean_meta(x, "", "remote")
    if not m:
        return None
    url, sha = str(x.get("url") or ""), str(x.get("sha256") or "").lower()
    try:
        size = int(x.get("size") or 0)
    except (TypeError, ValueError):
        return None
    if not url.startswith(DL_PREFIX) or not url.endswith(".zip") or ".." in url or not _SHA.match(sha) or not 0 < size <= ZIP_MAX:
        return None
    notes = [str(n)[:160] for n in x.get("notes") or [] if isinstance(n, str)][:8]
    m.update(url=url, sha256=sha, dl_size=size, notes=notes, date=str(x.get("date") or "")[:10])
    return m


def parse_catalog(raw: bytes, sig: str, public_key: str, clean_meta) -> dict[str, Any]:
    if len(raw) > CATALOG_MAX:
        raise RepoError("Katalog ist zu groß")
    if not verify(raw, sig, public_key):
        raise RepoError("Unterschrift des Katalogs ist ungültig")
    try:
        d = json.loads(raw.decode("utf-8"))
    except (ValueError, UnicodeDecodeError) as e:
        raise RepoError("Katalog ist nicht lesbar") from e
    if not isinstance(d, dict) or int(d.get("v") or 0) != 1:
        raise RepoError("Unbekanntes Katalog-Format")
    out: dict[str, dict[str, Any]] = {}
    for x in d.get("addons") or []:
        e = clean_entry(x, clean_meta)
        if e and e["id"] not in out:
            out[e["id"]] = e
    return {"ts": str(d.get("ts") or "")[:25], "addons": out}


def check_zip(data: bytes, entry: dict[str, Any]) -> None:
    if len(data) != entry["dl_size"] or len(data) > ZIP_MAX:
        raise RepoError("Größe der Datei stimmt nicht mit dem Katalog überein")
    if hashlib.sha256(data).hexdigest() != entry["sha256"]:
        raise RepoError("Prüfsumme stimmt nicht, die Datei wurde nicht installiert")


def extract(data: bytes, aid: str, dest_root: str) -> str:
    """Entpackt nach <dest_root>/.neu_<aid>/<aid> und gibt diesen Pfad zurück (läuft im Executor)."""
    if not _ID.match(aid):
        raise RepoError("Ungültige Kennung")
    tmp = os.path.join(dest_root, f".neu_{aid}")
    shutil.rmtree(tmp, ignore_errors=True)
    os.makedirs(tmp, exist_ok=True)
    total = 0
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as z:
            infos = z.infolist()
            if len(infos) > FILES_MAX:
                raise RepoError("Zu viele Dateien im Addon")
            for i in infos:
                name = i.filename.replace("\\", "/")
                parts = [p for p in name.split("/") if p]
                if not parts or name.startswith("/") or ".." in parts or ":" in parts[0] or parts[0] != aid:
                    raise RepoError(f"Unerlaubter Pfad im Addon: {name[:60]}")
                if stat.S_ISLNK(i.external_attr >> 16):
                    raise RepoError("Links sind im Addon nicht erlaubt")
                total += i.file_size
                if total > UNZIP_MAX:
                    raise RepoError("Addon ist entpackt zu groß")
                target = os.path.join(tmp, *parts)
                if not os.path.realpath(target).startswith(os.path.realpath(tmp) + os.sep):
                    raise RepoError("Unerlaubter Pfad im Addon")
                if name.endswith("/"):
                    os.makedirs(target, exist_ok=True)
                    continue
                os.makedirs(os.path.dirname(target), exist_ok=True)
                with z.open(i) as src, open(target, "wb") as out:
                    shutil.copyfileobj(src, out)
    except zipfile.BadZipFile as e:
        shutil.rmtree(tmp, ignore_errors=True)
        raise RepoError("Die Datei ist kein gültiges Addon") from e
    except Exception:
        shutil.rmtree(tmp, ignore_errors=True)
        raise
    path = os.path.join(tmp, aid)
    meta_f = os.path.join(path, "addon.json")
    if not os.path.isfile(meta_f) or not os.path.isfile(os.path.join(path, "__init__.py")):
        shutil.rmtree(tmp, ignore_errors=True)
        raise RepoError("Im Addon fehlen addon.json oder __init__.py")
    return path


def swap_in(new_path: str, dest_root: str, aid: str) -> bool:
    """Neue Version an ihren Platz, die bisherige als <aid>.old behalten. True, wenn es eine bisherige gab."""
    cur = os.path.join(dest_root, aid)
    old = os.path.join(dest_root, f"{aid}.old")
    had = os.path.isdir(cur)
    if had:
        shutil.rmtree(old, ignore_errors=True)
        os.replace(cur, old)
    os.replace(new_path, cur)
    shutil.rmtree(os.path.dirname(new_path), ignore_errors=True)
    return had


def roll_back(dest_root: str, aid: str) -> bool:
    """<aid>.old wieder aktiv machen, die neuere Version wird verworfen."""
    cur = os.path.join(dest_root, aid)
    old = os.path.join(dest_root, f"{aid}.old")
    if not os.path.isdir(old):
        return False
    shutil.rmtree(cur, ignore_errors=True)
    os.replace(old, cur)
    return True


def old_version(dest_root: str, aid: str) -> str:
    f = os.path.join(dest_root, f"{aid}.old", "addon.json")
    try:
        with open(f, encoding="utf-8") as fh:
            d = json.load(fh)
        return f"{d.get('version', '')} Build {int(d.get('build') or 1)}"
    except (OSError, ValueError, TypeError):
        return ""


def remove(dest_root: str, aid: str) -> None:
    for p in (aid, f"{aid}.old", f".neu_{aid}"):
        shutil.rmtree(os.path.join(dest_root, p), ignore_errors=True)
