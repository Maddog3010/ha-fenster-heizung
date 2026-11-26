"""Fehler durch eine unvollständige oder unpassende Eingabe (ohne Home-Assistant-Importe)."""
from __future__ import annotations


class EingabeFehler(ValueError):
    """Hinweis an den Nutzer, kein Programmfehler: Das Dashboard zeigt die Meldung, das Fehlerprotokoll zählt sie nicht."""
