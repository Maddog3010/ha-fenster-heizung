# Dashboard-Quellen

`custom_components/fenster_heizung/frontend/panel.js` wird aus den Dateien in `parts/` gebaut.
Bearbeite die Teile, nicht `panel.js` selbst, und baue danach neu:

```
python3 frontend-src/build.py          # baut panel.js
python3 frontend-src/build.py --check  # prüft, ob panel.js aktuell ist
```

Die Teile sind nummeriert und werden in dieser Reihenfolge ohne Änderung aneinandergehängt.
Das Ergebnis ist byte-gleich zur bisherigen Einzeldatei (Zwischenschritt, ohne TypeScript oder Lit).

| Teil | Inhalt |
|---|---|
| 01-symbole | Symbole, Raumsymbole, Farben |
| 02-konstanten | Konstanten, Module, Vorlagen |
| 03-stile | CSS |
| 03b-stile-raumkarte | CSS der Raumkarte 2.0 (Modul 1) |
| 04-kern | Grundgerüst der Komponente, Hilfsfunktionen |
| 05-modul1-fenster-heizung | Modul 1: Räume, Kopfkarte, Heizung, PV-Heizer |
| 05b-messraum, 05c-entfeuchter | Modul 1: Messraum, Luftentfeuchter |
| 05e-raumkarte | Modul 1: Raumkarte 2.0 – Raumbilder (7 Typen + Messraum), Temperatur-Ring, Heizplan-Band, Fenster-Uhr, Menü „⋯“ |
| 05d-grafik | Gemeinsame Grafik-Bibliothek: HD-Symbolsatz (41 Symbole, inkl. Haus-Bilder für Modul 19), Herkunfts-Ring, Prozentzeile, „noch ~ Min.“, Zuordnung alter Symbole |
| 05f-haus-szene, 05g-grundriss, 05h-zeitleiste | Modul 1: Haus-Szene, Grundriss & Bewegung, „Warum?“ als Zeitleiste |
| 05i-modul3-optik, 05j-modul3-fluss, 05k-modul3-szene, 05m-modul3-diagramme | Modul 3 Neue Optik: Stufe 1 (Kacheln 2.0, Doppelring, Preis-Skala), Stufe 2 (Energiefluss HD, Hinweise mit Bild und Knopf), Stufe 3 (Energie-Szene im Banner, Mini-Szene Startseite), Stufe 4 (Preisband, gespiegelte Balken, Solar-Kalender, Kosten-Treppe, Sparschwein, Verteilungs-Ring) |
| 05l-szenen-stile | Sponsor-Extra W7: Haus-Stile und Himmel-Themen für die Szenen in Modul 1 und 3 |
| 06-ereignisse-raumoptionen | Ereignisse, Aktionen, Raumeinstellungen |
| 07-assistent-diagnose | Einrichtungsassistent, Diagnose, Berichte |
| 08-module-einstellungen-personen | Modul-System, Einstellungen, Personen & Standort |
| 09-store-integrationen | Store, Herstellerprofile, Integrationen |
| 10a-modul8-laden, 10b-modul8-planung, 10c-modul8-statistik | Modul 8: Heute, Schnellstart, Statusleiste, Einrichtungs-Check · Ladeplan (zeichnet den Plan aus dem Backend) · Ladestatistik |
| 10d-modul8-fahrzeuge, 10e-modul8-wallbox | Modul 8: Fahrzeuge mit eigenen Sensoren und Aussehen, Karten, Fahrzeug ohne Karte, Auto-Szene · Wallbox-Karte, Laderegelung, Einstellungen |
| 11-modul4-geraetestrom | Modul 4 (Gerätestrom) |
| 12-beta-module | Beta-Module (Prognose, Wartung, Batterie, Tarif, Sicherheit, Pool, Wetter, Garten, Rollläden, Wärmepumpe, Lüftung) |
| 12e-sponsor, 12f-lounge | Sponsor-Schlüssel und Verwaltung, Sponsor-Lounge mit „Sponsor werden“, Sponsor Max (Morgen-Briefing, Jahres-Poster) |
| 12w-katalog | Einstellungs-Katalog, Suche, Änderungsverlauf, Hilfe, Prüfregeln |
| 12x-messwerk | Messwerk: alle Sensoren, genutzt in, Prüfung |
| 12y-sensorsuche | Sensorsuche S1 Vorschläge, S2 Nach Raum, S4 Filter, Zuordnen im Messwerk |
| 12h-fluss, 12h2-fluss-optik, 12h3-fluss-strom | Modul 19 Hausfluss: Brett, Leuchtlinien, Herkunfts-Ring, Anordnen (v0.7) · Lichtband-Banner, Themen, Handy-Ansichten, Tablet-Wand (v0.8) · Strom-Reiter, Vorlagen, Gruppen-Kachel, Tageswerte (v0.9) |
| 12v-wetter-optik | Modul 9 Neue Optik: Wetter-Szene als Banner, Warnkacheln 2.0, Stufenfarben (v0.7) · 48-Stunden-Zeitleiste, Ablaufkarten, Verstanden/Aussetzen (v0.8) |
| 12s-solar | Modul 16 Neue Optik: Sonnenbogen-Banner, Kacheln 2.0, Prognose und Ertrag je Stunde, beste Zeit mit Geräten, Verlauf |
| 12s2-solar-v1 | Modul 16 v1.0: Anlagen einzeln, Startkachel, Tablet-Wand, Einrichtungs-Check, Sensoren, Vorschlag Ertragssensor |
| 13-modul2-warmwasser-modul3-energie | Modul-Seiten, Modul 2 und Modul 3 |
| 14-registrierung | Registrierung der Komponente |
