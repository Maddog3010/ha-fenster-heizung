# Modul 18 Licht & Lampen

## [0.7.0] Build 7 - 2026-11-22
- **Mini-Grundriss im Lampen-Fenster:** Platz per Tipp setzen oder versetzen, Etage wechseln, „Aus dem Plan nehmen“ – ohne in den Baukasten zu wechseln
- Der Raum der Lampe ist im Mini-Plan markiert; steht sie woanders, gibt es „Raum … übernehmen“. Lampen ohne jeden Raum bekommen ihn aus dem Platz
- Gespeichert wird zusammen mit der Lampe in Modul 0; die Art wandert mit in den Plan (neu: „Tisch“ auch im Plan)
- Leere Lichtkarte: „Grundriss zeichnen“ führt in den Baukasten von Modul 0

## [0.6.1] - 2026-11-22
- „Im Plan platzieren“ öffnet den Baukasten in Modul 0 (ab 2026.11.4b52) mit dem Werkzeug „Lampe“ und kehrt danach zu Modul 18 zurück – auch ohne Modul 11
- Im Baukasten stehen mit „Meine Lampen“ nur deine Lampen mit deinem Namen

## [0.6.0] Build 6 - 2026-11-22
- **Reiter „Lampen“**: „Meine Lampen“ – nur hinzugefügte Lampen (auch Gruppen) mit eigenem Namen, Raum (Räume aus Modul 0 oder Bereiche), Art und „bei Alle aus mitschalten“
- „Lampe hinzufügen“ mit Suche, Filtern, Mehrfachauswahl und **Testen** (Lampe blinkt kurz)
- Umstiegs-Frage: „Alle übernehmen“, „Selbst auswählen“ oder „Später“; Hinweis auf neue Lampen mit „Hinzufügen“/„Ausblenden“
- Letzter abgelehnter Befehl wird je Lampe gemerkt und in der Liste gezeigt
- Mit „Meine Lampen“ entfällt der Raum aus der Position im Plan; Einstellungen: „Welche Lampen?“

## [0.5.2] - 2026-11-22
- Zuordnung Fläche → Bereich steht ab Modul 0 Build 2 in der Raumliste von Modul 0 (wird einmalig übernommen, „Fläche zuordnen“ schreibt dorthin)

## [0.5.1] - 2026-11-22
- Flächen mit Bereich ohne Lampen gelten als zugeordnet („keine Lampen“)
- Noch nicht platzierte Lampen klar als eigene Punkte, verständliche Fehlermeldung beim Schalten

## [0.5.0] Build 5 - 2026-11-22
- **Lampen im Grundriss**: Werkzeug „Lampe“ im Baukasten von Modul 11, Lichtkegel am echten Platz
- Raum aus der Position für Lampen ohne Bereich, Plakette „offline“, „… Lampen nicht im Plan“ öffnet den Baukasten

## [0.4.0] Build 4 - 2026-11-22
- **Grundriss als Lichtkarte**: dritte Ansicht mit Flächen in der Lichtfarbe, Lampenpunkten, Etagen und Plaketten
- Fläche antippen = Raum schalten, Punkt antippen = Lampe, lang drücken = Detail
- Zuordnung Fläche → Bereich automatisch über den Namen oder von Hand; „Nicht im Grundriss“ als Schalter

## [0.3.0] Build 3 - 2026-11-22
- **Neue Optik**: Haus-Szene im Banner (Etagen aus Home Assistant, Fenster in Lichtfarbe), Kacheln 2.0, Szenenleiste, Raumkarten 2.0 mit Lichtschein in echter Farbe, Ansicht „Liste“, Lampen-Detail mit Ring und Weißton-Leiste
- Einstellungen → Darstellung: Optik „Neu“ oder „Wie bisher“, Ansicht Räume oder Liste

## [0.2.0] Build 2 - 2026-11-22
- **Technik**: „an seit“ übersteht einen Neustart, Brennstunden je Lampe und Tag (90 Tage), Räume schalten über passende Lichtgruppen
- Sensoren Lampen an, Licht heute, Längste an; eigener Speicher mit Kopie der bisherigen Einstellungen; 10 Tests

## [0.1.0] Build 1 - 2026-11-04
- **Jetzt als Addon**: unter Einstellungen › Addons installieren, pausieren und deinstallieren, Updates aus dem Katalog
- Wer das Lab „Licht & Lampen“ an hatte, bekommt das Addon beim Update automatisch, alle Einstellungen bleiben erhalten
