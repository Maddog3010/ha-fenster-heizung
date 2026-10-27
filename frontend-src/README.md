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
| 04-kern | Grundgerüst der Komponente, Hilfsfunktionen |
| 05-modul1-fenster-heizung | Modul 1: Räume, Kopfkarte, Heizung, PV-Heizer |
| 06-ereignisse-raumoptionen | Ereignisse, Aktionen, Raumeinstellungen |
| 07-assistent-diagnose | Einrichtungsassistent, Diagnose, Berichte |
| 08-module-einstellungen-personen | Modul-System, Einstellungen, Personen & Standort |
| 09-store-integrationen | Store, Herstellerprofile, Integrationen |
| 10-modul8-wallbox | Modul 8: Wallbox und Laderegelung |
| 11-modul4-geraetestrom-elektroauto | Modul 4 und Elektroauto-Ansicht |
| 12-beta-module | Beta-Module (Prognose, Wartung, Batterie, Tarif, Sicherheit, Pool, Wetter, Garten, Rollläden, Wärmepumpe, Lüftung) |
| 13-modul2-warmwasser-modul3-energie | Modul-Seiten, Modul 2 und Modul 3 |
| 14-registrierung | Registrierung der Komponente |
