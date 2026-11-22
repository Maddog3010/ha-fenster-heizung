"""Modul 18 Licht & Lampen – Addon (früher Lab „Licht & Lampen“ im Kern).

Ab v0.2 Build 2 mit Hintergrund-Teil (manager.py): Einschaltzeiten über einen Neustart, Brennstunden, Lichtgruppen,
Sensoren. Szenen, ausgeblendete Räume und „Licht lange an“ liegen weiter im Layout unter „li“.
"""
from .manager import Addon

__all__ = ["Addon"]
