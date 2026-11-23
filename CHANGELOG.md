# Changelog

Alle wichtigen Änderungen an „Strom & Wärme“. Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

## [2026.11.5b1] - 2026-11-23

**Modul 8 · Elektroauto & Wallbox** 1.0.1 – Kilometer je Tag ohne Sprünge.

### Behoben
- **Ein Tag mit viel zu vielen Kilometern:** Lieferte der Kilometerstand-Sensor ein paar Tage keinen Wert (Auto schläft, Hersteller-Cloud offline), wurde die ganze Strecke auf den Tag gebucht, an dem der Wert zurückkam (z. B. 836 km an einem Tag). Jetzt wird sie gleichmäßig auf die Tage seit der letzten Messung verteilt. Sprünge über 1.500 km pro Tag (falscher Wert, Tachotausch) werden nicht mehr gezählt.

### Neu
- **Kilometerstände nachtragen** (Statistik › Kilometer & Verbrauch, nur Admins): echte Stände eingeben, z. B. „28.10. 13155 / 29.10. 13218 / …“. Zwischen zwei Ständen wird die Strecke auf die Tage verteilt, die bisher gezählten Kilometer des Fahrzeugs in diesem Zeitraum werden ersetzt. Ladungen bleiben unverändert. Funktioniert mit und ohne Kilometer-Sensor.

### Wichtig beim Update
- Falsche Tage aus der Zeit vor dem Update korrigierst du einmalig mit „Kilometerstände nachtragen“. Danach stimmen auch „Ø pro Tag“, „am meisten“ und die Jahres-Hochrechnung.
- Liefert ein Sensor statt „nicht verfügbar“ tagelang den alten Wert weiter, kann Modul 8 die Lücke nicht erkennen – dann hilft ebenfalls „Kilometerstände nachtragen“.

## [2026.11.4] - 2026-11-23

Vierte stabile Version im November: **Ein Bauplan für dein ganzes Haus.** Das neue Modul 0 wird der gemeinsame Grundriss aller Module, Modul 18 zeigt das Licht darin, ab dem 1. Dezember kommt das Weihnachts-Theme mit Adventskalender, Modul 1 bekommt den neuen Elektroheizer, und **Modul 8 Elektroauto & Wallbox** sowie **Modul 11 Rauch- & Sicherheitsmelder** sind stabil (1.0). Die Version enthält alles aus den Testversionen 2026.11.4b1 bis 2026.11.4b59. README und Bedienungsanleitung sind an diese Version angepasst (Kapitel 24 „Neu in Version 2026.11.4“).

### Neu
- **Modul 0 · Haus & Grundriss (neu, Beta v0.10):** der gemeinsame Bauplan für Modul 1 (Wärmekarte), Modul 11 (Melder) und Modul 18 (Lichtkarte). Baukasten 2.0 mit Türen und Fenstern in allen Arten (auch schräg), Treppenarten, Möbeln, Außenbereich, Markise, mobilen Geräten, Haustechnik und Notfall-Punkten; Sonnenlicht, Ebene „Jetzt“ mit Raum-Sensoren, Raum-Blatt, Bereiche anlegen, Zoom, Vollbild, Export und Dashboard-Karte, Sichern & Einlesen mit Verlauf. Der Grundriss aus Modul 11 zieht beim ersten Start automatisch um.
- **Modul 18 · Licht & Lampen (Addon v0.9):** Lichtkarte im Grundriss von Modul 0 mit der echten Lampenfarbe, Lampen selbst anlegen und Räumen zuordnen (Reiter „Lampen“), Lampen im Plan, Regeln für Bewegung, Alle weg, Alarm und Abends.
- **Weihnachts-Theme & Adventskalender:** automatisch vom 1. bis 27. Dezember in allen Modulen – Lichterkette, Adventskranz nach Adventssonntag, Countdown bis Heiligabend, Adventskalender in mehreren Varianten mit Tagesinhalten und Tagesschlüsseln für Sponsor und Sponsor Max (nur am jeweiligen Tag gültig). Einstellungen unter Einstellungen → Darstellung → Weihnachts-Theme.
- **Szenen-Banner für alle Module:** Lüftung, Rollläden, Wärmepumpe, Garten, Pool & Sauna, Batteriespeicher und Wartung haben jetzt ein eigenes Banner; die Handy-Ansicht der Banner ist korrigiert.
- **Modul 1 (v1.9) · Elektroheizer 2.0:** Einrichtungs-Assistent in vier Schritten (Gerät mit Vorschlägen, Raum, Leistung per Vorlage oder **Messen** mit dem Leistungssensor, Regeln) mit Testlauf. Heizer stehen unter Modul 1 · Einstellungen › Geräte (der Reiter „Elektroheizer“ entfällt) – mit Bearbeiten, Pausieren, **In anderen Raum stellen**, **Entfernen** mit Rückgängig und Papierkorb (30 Tage).
- **Modul 8 · Elektroauto & Wallbox – Stabil 1.0:** „Wer lädt gerade?“ von Hand umstellen, Gastfahrzeug auch beim Bearbeiten, Modus beim Anstecken je Fahrzeug, Sonnenanteil von Hand ändern, Befehls-Rückmeldung, Diagnose und erweiterter Einrichtungs-Check.
- **Modul 11 · Rauch- & Sicherheitsmelder – Stabil 1.0:** neue Optik ohne Aufklappmenüs und Popups, Alarm mit Stufen und „Verstanden“, ausgeschaltete Melder, Warnmeldungen ohne Vollbild-Alarm, Test am Melder wird erkannt und eingetragen, Grundriss 2.0 mit frei geformten Räumen, Ausgängen und Durchgängen, Diagnose und Anleitung.
- **Modul 14 · Dynamischer Stromtarif (v0.9):** Tarif-Dienst für heute und morgen, Preisband-Banner, Fenster je Gerät, Preisalarm, „Lohnt sich dein Tarif?“.
- **Modul 15 · Wartung & Erinnerungen (v0.2):** echte Termine statt Beispielbilder.
- **Modul 17 · Müllabfuhr (Addon) – Stabil 1.0** und **Modul 20 · Abrechnungen (Addon) – Stabil 1.6:** Reinholen, Sondertermine und Morgen-Briefing; Abrechnungen mit Übersicht & Prognose, Rechnungen, Anbindung an die Module, Einspeisung mit Abschlägen, Balkonkraftwerk, Grund- und Einmalgebühren, Tarifwechsel-Rechner.
- **Modul 9 · Wetter & Warnungen – Stabil 1.0:** DWD-Wetterkarte mit Warnungen und Regenradar, Rückblick, Änderungsverlauf mit Rückgängig.
- **Versions-Statistik** (freiwillig, anonym): Abfrage beim ersten Start nach dem Update, Seite unter Einstellungen → System → Versions-Statistik.

### Geändert
- **Marketplace statt HACS:** Ab Home Assistant 2026.11 ist HACS als Marketplace eingebaut. Strom & Wärme spricht dann überall vom Marketplace – Update-Hinweis, Beta-Sperre, Sponsor Max, Versionen, Store-Anleitungen – und öffnet die Seite von Strom & Wärme über „Im Marketplace öffnen“. Mit Home Assistant 2026.10 oder älter bleibt alles bei HACS. README und Anleitung beschreiben die Installation über **Einstellungen → Marketplace → Über Link hinzufügen**.
- Einstellungs-Knopf oben rechts öffnet in jedem Modul (auch bei Addons und auf der Startseite) die passenden Einstellungen.
- Modul 1: Raumeinstellungen zeigen beim Elektroheizer nur noch eine Kurzinfo; Entfernen räumt auf (Schalter „Elektroheizer aktiv“ bleibt nicht als „nicht verfügbar“ stehen).

### Behoben
- Modul 8: Ladelimit wurde ohne erkannte Karte überfahren; nachts geladene Ladungen zeigten 1–2 % Sonne.
- Modul 9: Wetterkarte zeigte keine Warnfarben und flackerte.
- Modul 11: PDF-Knöpfe in der App, roter Alarm beim Zurückwechseln in die App, Anzeigefehler auf dem Tablet.
- Modul 1: Die PV-Reserve ließ sich im Dashboard nicht über 100 W einstellen.

### Wichtig beim Update
- Update im Marketplace (Einstellungen → Marketplace oder Einstellungen → Updates; bis Home Assistant 2026.10 in HACS), danach Home Assistant neu starten und die Seite neu laden, in der App die App ganz schließen und neu öffnen. Deine Einstellungen bleiben erhalten.
- Bestehende Elektroheizer werden beim ersten Start in die neue Geräteliste übernommen, die Raum-Einstellungen bleiben unverändert. Nach „In anderen Raum stellen“ ist der Schalter „Elektroheizer aktiv“ eine neue Entität im neuen Raum – Automationen bitte anpassen.
- Der Grundriss liegt jetzt in Modul 0. Wer von 2026.11.3 kommt: Der Plan aus Modul 11 wird automatisch übernommen, eine Umzugs-Kopie bleibt 90 Tage erhalten.
- Das Weihnachts-Theme startet von selbst am 1. Dezember; abschalten unter Einstellungen → Darstellung → Weihnachts-Theme.

## [2026.11.4b59] - 2026-11-23

**Modul 1 · Fenster & Heizung** v1.9 Build 9 – Elektroheizer 2.0 (Build 1 bis 4): einfach hinzufügen und sauber entfernen.

### Neu
- **Einrichtungs-Assistent für Elektroheizer** in vier Schritten statt zwölf Feldern:
  - Gerät: Vorschläge nach Name (Heizer, Radiator, Lüfter, Steckdose …), dazu Suche über alle Schalter und Klima-Geräte. Thermostate der Räume und schon eingerichtete Heizer stehen nicht zur Wahl.
  - Raum: Räume als Kacheln mit Raumbild und Temperatur; Räume mit Heizer sind gesperrt. Kommt man aus einem Raum, entfällt der Schritt.
  - Leistung: Vorlagen (Ölradiator, Heizlüfter, Infrarot-Paneel, Konvektor) oder eigene Werte, mit Hinweis für Steckdosen und Klima-Geräte.
  - Fertig: Name, „Heizen bis“ (Vorschlag aus dem Raum), Thermostate, Stufen regeln; Priorität und Zeitfenster unter „Mehr Einstellungen“; Hinweis zum aktuellen Überschuss.
- **Einstiege:** Raumkarte „⋯“ › Elektroheizer hinzufügen, Modul 1 · Einstellungen › Geräte › Elektroheizer („+ Elektroheizer hinzufügen“), Raumeinstellungen und Grundriss (Gerät „Mobiler Heizer“ › Jetzt einrichten).
- **Elektroheizer unter „Geräte“:** Modul 1 · Einstellungen hat nur noch die Reiter „Regeln“ und „Geräte“. Unter „Geräte“ steht der Elektroheizer ganz oben (wie der Luftentfeuchter); dahinter die Liste aller Heizer mit Status und die PV-Regeln für alle Heizer (Reserve, Einschalten nach, Mindestlaufzeit, Ladestand).
- **Geräte-Blatt je Heizer** (Raumkarte, Liste): Status und Bericht wie bisher, dazu
  - Bearbeiten: Name, Leistung, „Heizen bis“, Thermostate, Priorität und Zeitfenster im Assistenten (Schritte Leistung und Regeln)
  - Pausieren / Fortsetzen: bleibt eingerichtet, heizt nicht (gleich wie der Schalter „Elektroheizer aktiv“)
  - In anderen Raum stellen: Raum als Kachel, „Heizen bis“ mit Vorschlag aus dem neuen Raum. Im alten Raum wird der Heizer ausgeschaltet und die Thermostate laufen wieder; Statistik, Verlauf und Pausen-Stellung ziehen mit. Der Schalter „Elektroheizer aktiv“ gehört danach zum neuen Raum (neue Entität).
- **Geräteliste der Elektroheizer:** Jeder Heizer ist jetzt ein eigenes Gerät mit fester ID, Namen und Raum (eigener Speicher, mit automatischen Sicherungskopien). Grundlage für Einrichtungs-Assistent, Reiter „Geräte“, Raum wechseln und Papierkorb in den nächsten Builds.
- **Automatische Übernahme:** Beim ersten Start wird jeder Raum mit eingeschaltetem Elektroheizer in die Liste übernommen. Räume mit ausgeschaltetem Heizer, aber eingetragenem Gerät landen im Papierkorb (30 Tage). Die Raum-Einstellungen werden dabei nicht verändert.
- **Heizer entfernen** im Geräte-Blatt: Ein Dialog zeigt vorher, was passiert (Heizer aus, Thermostate zurück, Schalter weg, Gerät bleibt in Home Assistant) und wie viele Automationen den Schalter nutzen. Statistik behalten oder löschen. Danach 10 Sekunden „Rückgängig“.
- **Papierkorb** („Zuletzt entfernt“ unter Geräte › Elektroheizer): 30 Tage wiederherstellen – mit gleichem Namen, Einstellungen und (falls behalten) Statistik. Ist der alte Raum belegt oder gelöscht, fragt Modul 1 nach einem Raum. Endgültig löschen mit Bestätigung.
- **Leistung messen** im Assistenten (Steckdosen mit Leistungssensor): Heizer am Gerät auf eine Stufe stellen, „Messen“ – Modul 1 schaltet 30 Sekunden ein und nimmt den Mittelwert ohne die Anlaufsekunden. Stufe für Stufe, bis zu 8 Stufen.
- **Testlauf** im letzten Schritt des Assistenten: Gerät 30 Sekunden ein, unabhängig vom Überschuss, danach wie vorher.
- **Websocket-Befehle** `heizer_get`, `heizer_add`, `heizer_update`, `heizer_remove`, `heizer_restore`, `heizer_purge`, `heizer_test` (alles außer Lesen nur für Admins).

### Geändert
- **Entfernen räumt auf:** Der Heizer wird ausgeschaltet (bei Klima-Geräten die alte Solltemperatur zurück), abgestellte Thermostate laufen wieder, die Heizer-Felder des Raums werden zurückgesetzt und der Schalter „Elektroheizer aktiv“ verschwindet aus Home Assistant statt als „nicht verfügbar“ stehen zu bleiben. Die Statistik wandert auf Wunsch mit in den Papierkorb.
- Ausschalten im Raum-Dialog wie bisher legt den Heizer in den Papierkorb; wieder einschalten mit demselben Gerät holt ihn mit gleicher ID und gleichem Namen zurück.
- Ein neuer Heizer im Raum beginnt mit leerer Statistik.
- Raumeinstellungen zeigen beim Elektroheizer nur noch eine Kurzinfo mit „Heizer öffnen“ (bei Klima-Geräten weiter die Zuordnung der Voreinstellungen) bzw. „Elektroheizer hinzufügen“.
- Alte Links und die Einstellungssuche (Reserve, Einschalten nach, Mindestlaufzeit, Ladestand) führen zu Geräte › Elektroheizer.

### Behoben
- PV-Regeln: Die Reserve ließ sich im Dashboard nicht über 100 W einstellen (Eingabe wurde auf 100 begrenzt); jetzt bis 2000 W wie vorgesehen.

### Hinweis
- Wird ein Heizer in einen anderen Raum gestellt oder aus dem Papierkorb in einen anderen Raum geholt, ist der Schalter „Elektroheizer aktiv“ eine neue Entität im neuen Raum – Automationen bitte anpassen.

## [2026.11.4b58] - 2026-11-22

**Modul 0 · Haus & Grundriss** v0.10.1 – Korrektur und Aufräumen.

### Behoben
- Die Werkzeugleiste im Baukasten (Handy/iPad) springt nach dem Wischen nicht mehr an den Anfang zurück, wenn Home Assistant neue Werte meldet. Gilt auch für die Ebenen- und Etagen-Knöpfe.

### Entfernt
- Puppenhaus: Umschalter „Plan · Puppenhaus“ und die schräge Ansicht im Banner sind weg; im Banner steht wieder das Haus-Symbol. Pläne und Daten bleiben unverändert.

## [2026.11.4b57] - 2026-11-22

**Modul 18 · Licht & Lampen** (Addon v0.9.0 Build 11) – die Lichtkarte nutzt jetzt den Grundriss von Modul 0.

### Neu
- **Lichtkarte in der Optik von Modul 0:** gleicher Zeichner wie in Modul 0, 1 und 11 – Böden, Wände, Türen, Fenster, Treppen, Möbel, Stil wie in Modul 0. Licht in echter Farbe, Räume ohne Licht abgedunkelt, Lampen mit Schein.
- Raumnamen wie in Modul 0 (bleiben im Raum, verdecken keine Lampen) mit Licht-Zustand als zweite Zeile.
- Zoom und Vollbild auch in der Lichtkarte.

### Geändert
- Die Lichtkarte ist nur noch eine Ansicht: Bearbeiten, Lampen platzieren und Räume zuordnen passiert in Modul 0 (Knöpfe führen dorthin).
- Modul 0: Raumnamen können eine eigene zweite Zeile tragen; die Zoom-Leiste kennt ihre Etage (für Ansichten außerhalb von Modul 0).

## [2026.11.4b56] - 2026-11-22

**Modul 0 · Haus & Grundriss** v0.10 Build 10 – Puppenhaus, Sonnenlicht, Möbel und Außenbereich.

### Neu
- **Puppenhaus:** Im Plan von Modul 0 neben „Plan“ der Knopf „Puppenhaus“ – alle Etagen schräg übereinander, Wände leicht hochgezogen, mit Böden, Möbeln, Türen, Fenstern und Lampen. Eine Etage antippen klappt sie flach. Das Puppenhaus ist auch das Bild im Banner von Modul 0.
- **Sonnenlicht:** Neue Ebene „Sonne“. Aus dem Sonnenstand (sun.sun oder aus dem Standort berechnet) und der Nordrichtung des Plans fallen Lichtflächen durch die Fenster auf den Boden. Leiste mit Uhrzeit, Himmelsrichtung, Höhe der Sonne und „Sonne in: Wohnzimmer …“, dazu ein Tageszeit-Regler (5–22 Uhr) und „Jetzt“.
- **Nordrichtung** unter „Etage & Plan“ in 15°-Schritten; der Nordpfeil im Plan dreht mit.
- **Möbel** (Werkzeug „Möbel“): Doppel- und Einzelbett, Sofa, Sessel, Esstisch mit Stühlen, Couchtisch, Schreibtisch, Schrank, Regal, Kommode, TV-Board, Küchenzeile, Kochinsel, Kühlschrank, Waschmaschine, Badewanne, Dusche, WC, Waschbecken – mit Normgröße, Breite und Tiefe in 10-cm-Schritten, drehbar. Eigene Ebene „Möbel“.
- **Außenbereich** mit 42 Teilen in drei Gruppen:
  - Garten & Pflanzen: Rasen, Beet, Hochbeet, Baum, Obstbaum, Busch, Hecke, Gartenteich, Gewächshaus, Kompost, Regentonne, Bewässerungszone, Wasserhahn außen, Mähroboter
  - Spielen & Freizeit: Spielturm mit Rutsche, Schaukel, Sandkasten, Trampolin, Pool, Whirlpool, Gartensauna, Gartentisch, Liegestuhl, Sonnenschirm, Grill, Feuerstelle
  - Wege, Bauten & Technik: Weg/Einfahrt, Trittsteine, Holzterrasse, Zaun, Tor, Gartenhaus, Garage, Carport, PV-Anlage, Zisterne, Mülltonnen, Fahrradständer, Auto, Gartenlampe
- Viele Gartenteile lassen sich mit einer Entität verbinden und zeigen ihren Zustand: Pool, Whirlpool, Sauna, Teich und Gewächshaus mit Temperatur, Bewässerungszone wird blau mit Sprühbögen, solange sie läuft, Gartenlampe leuchtet, Garage/Tor „offen/zu“, Mähroboter „mäht“, Regentonne und Zisterne mit Füllstand.
- **Grundstück:** „Grundstück anlegen“ unter „Etage & Plan“ erzeugt die Etage „Außen“. Das Haus erscheint dort als Umriss mit „Haus · EG“ – antippen öffnet die Etage. Im Puppenhaus liegt das Grundstück unter dem Haus.
- Der Baukasten wächst mit: Was über 800 × 480 hinausragt (z. B. der Garten), bleibt sichtbar und bearbeitbar.

### Behoben
- **Raumnamen** blieben bei kleinen oder schmalen Räumen (besonders auf Handy und iPad) nicht im Raum und lagen über Meldern. Die Beschriftung passt jetzt ihre Schrift der Raumbreite an, bricht lange Namen um oder kürzt sie, bleibt ganz im Raum und weicht Meldern, Lampen, Türen, Fenstern, Treppen, Geräten, Technik und der Temperatur-Marke aus. Melder, Lampen und Geräte liegen immer über den Namen.
- Die Temperatur-Marke („Jetzt“) sitzt auch bei schrägen und L-förmigen Räumen im Raum.
- Auf dem Handy liegt die Zoom-Leiste über dem Plan statt darauf.

### Geändert
- Banner: „2 Etagen + Grundstück“, das Grundstück zählt nicht als Etage.
- Zustände im Plan kennen jetzt auch Rollo/Tor („offen 70 %“), Mähroboter, Personen-Tracker und Kalender.

## [2026.11.4b55] - 2026-11-22

Zwei Builds für **Modul 0 · Haus & Grundriss** (jetzt v0.9): Build 8 – Zoom, Vollbild, Export und Dashboard-Karte; Build 9 – Haustechnik und Notfall-Punkte, Raum-Sensoren, Bereiche anlegen.

### Teil 1 · Build 8 – Zoom, Export, Dashboard-Karte

#### Neu
- **Zoom und Verschieben:** Im Plan von Modul 0 unten rechts − / % / +. Am PC Strg + Mausrad (zoomt dorthin, wo die Maus steht), auf Tablet und Handy mit zwei Fingern. Vergrößert lässt sich der Plan mit dem Finger oder der Maus verschieben; ein Tipp auf die Prozentzahl zeigt wieder den ganzen Plan.
- **Vollbild** (⤢) für Tablets an der Wand – im Vollbild zoomt auch das Mausrad ohne Strg. Esc oder ✕ beendet es.
- **Raum-Fokus:** „◎ Heranzoomen“ im Raum-Blatt zoomt auf den Raum.
- **Export (⇩):** als **PDF** (A4 quer, auf Wunsch alle Etagen, je Seite mit Titel, Anzahl der Räume, Wohnfläche, Datum und Maßstab), als **PNG** in hoher Auflösung oder als **SVG**. Stil und Ebenen wie im Plan, Maße wählbar. Am Handy und Tablet über „Teilen“.
- **Dashboard-Karte „Grundriss (Strom & Wärme)“** – `type: custom:sw-grundriss-card`. Im Karten-Dialog auswählbar und ohne YAML einstellbar: Titel, Etage (oder Umschalter), Stil (Modern, Bauplan, Hell), Ebenen (Jetzt, Lampen, Melder, Geräte) und was beim Antippen eines Raums passiert (Raum-Blatt mit Temperatur und Lampen zum Schalten, Modul 0 öffnen oder nichts). Zoom mit zwei Fingern oder Strg + Mausrad, Doppeltipp zeigt wieder alles. Die Karte ist klein und lädt den Zeichner erst, wenn sie wirklich im Dashboard steht. Beispiel zum Kopieren unter Modul 0 → Einstellungen.

#### Geändert
- Der PDF-Schreiber kann jetzt Bilder und Querformat (wird für den Grundriss genutzt).

### Teil 2 · Build 9 – Haustechnik, Raum-Sensoren, Bereiche

#### Neu
- **Werkzeug „Technik“** im Baukasten mit 34 Teilen in sechs Gruppen:
  - Heizen & Klima: Heizkörper, Thermostat, Klimagerät, Lüftung, Kamin/Ofen, Therme, Wärmepumpe, Warmwasserspeicher
  - Strom: Steckdose, Schalter/Taster, Zähler, Wechselrichter, Batteriespeicher, Wallbox
  - Sensoren: Temperatur/Feuchte, Bewegungsmelder, Tür-/Fensterkontakt, Wassermelder, Luftqualität, Helligkeit
  - Netz & Medien: WLAN-Zugangspunkt, Zigbee/Thread-Router, Kamera, Klingel, Lautsprecher, TV
  - Notfall: Haupthahn Wasser, Haupthahn Gas, Sicherungskasten, Feuerlöscher, Notausgang, Sammelpunkt, Erste Hilfe
  - Notiz mit eigenem Text („Wasserrohr in der Wand“)
- Jedes Teil lässt sich mit einer passenden Entität verbinden (Vorschläge aus dem Bereich des Raums zuerst) und zeigt dann seinen **Zustand im Plan**: Heizkörper „21,4° → 22,0°“, Steckdose „an“, Wassermelder „NASS“ in Rot, Bewegung mit Puls, Haupthahn „offen“.
- **Bewegungsmelder und Kamera** mit Erfassungskegel (Reichweite, Blickwinkel, Richtung), **WLAN** und Router mit Reichweite.
- **Notfall-Punkte** sind rote Dreiecke und erscheinen auch im Grundriss von **Modul 11** – bei einem Alarm sieht man sofort Haupthahn, Sicherungen und Feuerlöscher.
- Neue Ebene „Technik“ im Plan von Modul 0.
- **Raum-Sensoren in Home Assistant** (Modul 0 → Einstellungen, auf Wunsch): je Raum `sensor.strom_waerme_raum_<raum>_flaeche`, `…_temperatur` (Mittel der Temperatursensoren im Bereich), `…_lampen_an`, `binary_sensor.strom_waerme_raum_<raum>_fenster_offen` und `…_belegt` (Bewegung/Präsenz), dazu `sensor.strom_waerme_haus_wohnflaeche`. Für Automationen je Raum, Sprachassistenten und Kennzahlen. Aktualisiert sich bei jeder Änderung im Bereich.
- **Bereiche anlegen** (Reiter „Räume“): Räume ohne Bereich bekommen mit einem Tipp einen neuen Bereich in Home Assistant und werden gleich zugeordnet – auf Wunsch mit den Etagen (EG, OG …). Bestehende Bereiche mit gleichem Namen werden nur zugeordnet.

## [2026.11.4b54] - 2026-11-22

Zwei Builds für **Modul 0 · Haus & Grundriss** (jetzt v0.7): Build 6 – eine Optik überall, neuer Baukasten, Ebene „Jetzt“, Raum-Blatt; Build 7 – Baukasten 2.0, Türen und Fenster schräg und in allen Arten, Treppenarten, mobile Geräte, Markise, Plan-Check.

### Teil 1 · Build 6 – eine Optik überall

**Modul 0 · Haus & Grundriss** v0.6 Build 6 – eine Optik überall, neuer Baukasten, Ebene „Jetzt“ und Raum-Blatt.

#### Neu
- **Eine Optik überall:** Die Wärmekarte (Modul 1), der Plan in Modul 11 und der Baukasten zeichnen den Grundriss jetzt mit derselben Optik wie Modul 0 (Wände, Böden, Türen, Fenster, Treppen). Die Module legen nur noch ihre eigenen Dinge darüber – Temperaturfarben, Melder, Lampen.
- **Neuer Baukasten:** Leiste oben (Etage, Rückgängig/Wiederholen, Mehrfach, Stil, Speichern), schmale Werkzeugleiste links, Eigenschaften rechts neben dem Plan. Auf dem Handy liegen die Werkzeuge unter dem Plan.
- **Ablage zum Ziehen:** Lampen und Melder ohne Platz liegen unter dem Plan und lassen sich direkt an ihre Stelle ziehen (oder wie bisher antippen).
- **Ebene „Jetzt“:** Im Plan von Modul 0 zeigt jeder Raum seine Temperatur, Räume mit Bewegung leuchten kurz auf.
- **Raum-Blatt:** Ein Raum im Plan antippen öffnet ein Blatt mit Temperatur, Fenster, Bewegung, Meldern und Lampen (direkt schaltbar) und Sprüngen zu Wärmekarte, Lichtkarte, Modul 11 und Bearbeiten.

#### Geändert
- Breite und Tiefe eines Raums stehen im Baukasten in Metern mit Fläche in m².
- „Etage & Plan“ (Name, Maßstab, Hintergrundbild) ist in den Eigenschaften zusammengeklappt.

### Teil 2 · Build 7 – Baukasten 2.0

**Modul 0 · Haus & Grundriss** v0.7 Build 7 – Baukasten 2.0: genau statt ungefähr, Türen und Fenster schräg und in allen Arten, Plan-Check.

#### Neu
- **Raster in Zentimetern:** 5, 10, 25 oder 50 cm (oben in der Leiste oder unter „Etage & Plan“). Alles rastet beim Ziehen darauf ein.
- **Schräge Wände:** Wände rasten beim Zeichnen auf 15°-Schritte ein (also auch 45°). Beim Bearbeiten stehen Länge und Winkel im Plan, bei Räumen Breite und Tiefe.
- **Türen und Fenster in jedem Winkel:** Sie setzen sich auf jede Wand – auch auf schräge Wände und Raumkanten – übernehmen deren Winkel und gleiten entlang der Wand. Winkel frei einstellbar (±15°, 90°, Umdrehen oder in Grad eingeben).
- **Breite** jeder Tür und jedes Fensters (in 5-cm-Schritten).
- **Arten:** Drehtür, Doppeltür, Schiebetür, Pendeltür, Falttür, Terrassentür (Glas), Garagentor · Fenster, bodentief, Dachfenster, mit Rollladen. Jede Art hat ihr eigenes Planzeichen – in Modul 0, im Baukasten und in Modul 11.
- **Abstand zur Ecke:** Bei einer gewählten Tür oder einem Fenster stehen die Abstände zu beiden Ecken im Plan und in den Eigenschaften. Liegt sie neben der Wand, gibt es „An Wand einrasten“.
- **Türen und Fenster wandern mit:** Verschiebt man einen Raum, kommen seine Türen und Fenster mit.
- **Plan-Check:** prüft Räume ohne Tür, Türen und Fenster neben der Wand, überlappende Räume, Räume ohne Namen oder ohne Bereich in Home Assistant und einen fehlenden Ausgang. Viele Punkte lassen sich mit einem Tipp beheben („Einrasten“, „Zeigen“, „Zuordnen“). Zu finden am Plan in Modul 0 und als „Prüfen“ im Baukasten.
- **Maßstab messen:** zwei Punkte im Plan antippen (z. B. eine Wand auf dem Bauplan-Foto), echte Länge eingeben – fertig.
- **Etage kopieren:** Räume, Wände, Türen, Fenster und Treppen als neue Etage (z. B. OG wie EG).
- **Tastatur am PC:** Pfeiltasten verschieben (mit Umschalt 4 Schritte), Entf löscht, Strg+Z / Strg+Y, Esc hebt die Auswahl auf.
- **Treppenarten:** gerade, L-Treppe, U-Treppe (halbgewendelt), Wendeltreppe und Dachbodentreppe (Bodenluke) – jede mit eigenem Planzeichen und Laufrichtung, drehbar in 90°-Schritten.
- **Mobile Geräte aus Modul 1:** Elektroheizer (je Raum) und Luftentfeuchter lassen sich als „Gerät“ in den Plan setzen oder aus der Ablage ziehen. Im Plan leuchten sie, wenn sie laufen (Heizer mit Leistung in W). Ein Entfeuchter **folgt seinem Standort aus Modul 1** („Hierher stellen“, NFC) – oder bleibt „fest hier“. Eigene Ebene „Geräte“ im Plan von Modul 0, auch in der Wärmekarte sichtbar und im Raum-Blatt aufgeführt.
- **Markise:** an der Wand mit Breite und Ausfall, Seite wählbar. Mit einer Rollo-Entität (cover) zeigt der Plan, wie weit sie ausgefahren ist („Markise 70 %“).
- Raumnamen weichen Treppen und Geräten aus.

#### Geändert
- Türen und Fenster dürfen jetzt jeden Winkel haben (bisher nur 0/90/180/270°); gespeichert werden zusätzlich Breite und Art.

## [2026.11.4b53] - 2026-11-22

Zweites Paket rund um Grundriss und Licht: **Modul 18 · Licht & Lampen** v0.8 (Addon `licht` 0.8.0) bekommt den Platz im Lampen-Fenster und **Regeln** (Bewegung, Alle weg, Alarm, Abends). **Modul 0 · Haus & Grundriss** v0.5 bekommt Sichern & Einlesen mit Verlauf und eine neue, detaillierte Grundriss-Optik in drei Stilen.

### Teil 1 · Modul 18 Build 7 – Platz im Lampen-Fenster

**Modul 18 · Licht & Lampen** v0.7 Build 7 – Platz der Lampe direkt im Lampen-Fenster. Addon `licht` 0.7.0.

#### Neu
- **Mini-Grundriss in „Lampe bearbeiten“:** Tippen setzt die Lampe an diese Stelle, nochmal tippen versetzt sie. Bei mehreren Etagen wechselst du oben die Etage (● zeigt, wo sie steht). „Aus dem Plan nehmen“ entfernt den Platz.
- Der Raum der Lampe ist im Plan farbig markiert. Steht die Lampe in einem anderen Raum, gibt es „Raum „Küche“ übernehmen“. Hat die Lampe noch gar keinen Raum, übernimmt sie ihn aus dem Platz.
- Der Platz wird mit „Speichern“ zusammen mit der Lampe in Modul 0 geschrieben. Die gewählte Art (z. B. „Streifen“) wandert in den Plan mit.

#### Geändert
- Lampen-Art **„Tisch“** gibt es jetzt auch im Plan und im Baukasten.
- Leere Lichtkarte: „Grundriss zeichnen“ führt in den Baukasten von Modul 0 statt zu Modul 11.

#### Technik
- `sicherheit.LAMP_K` um `tisch` erweitert, Test ergänzt. Addon: `_lixMini`, `_lixMiniBind` (Tipp → Plan-Koordinaten über `getScreenCTM`), `_lixSavePos` (nur bei Änderung, über `_grSavePlan`).

### Teil 2 · Modul 0 Build 4 – Sichern & Einlesen

**Modul 0 · Haus & Grundriss** v0.4 Build 4 – Sichern & Einlesen.

#### Neu
- **Reiter „Sichern & Einlesen“** (nur Administratoren).
- **Als Datei sichern:** eine JSON-Datei mit Etagen, Räumen, Bauteilen, Meldern, Lampen und Raumliste. Hintergrundbilder lassen sich mitnehmen oder weglassen, die Größe steht dabei.
- **Datei einlesen** mit Vorschau „jetzt → danach“ für Etagen, Räume, Bauteile, Melder, Lampen und Bilder. Du wählst:
  - **Plan ersetzen**, auf Wunsch mit der Raumliste aus der Datei
  - **Als weitere Etagen hinzufügen** (höchstens 6 Etagen; doppelte Namen bekommen „(neu)“)
  Ältere Dateien aus dem Baukasten von Modul 11 werden erkannt.
- **Verlauf:** Vor jedem Speichern, Einlesen oder Wiederherstellen legt Modul 0 den vorherigen Stand ab (die letzten 15, ohne Hintergrundbilder). Jeder Eintrag zeigt, wann und worüber er gespeichert wurde und was ihn ersetzt hat. Mit „Wiederherstellen“ kommt der Stand zurück, die Bilder bleiben wie sie sind.
- **Umzugs-Kopie aus Modul 11:** Solange sie aufgehoben wird (90 Tage), steht sie im Verlauf und lässt sich wiederherstellen.

#### Geändert
- „Plan sichern“ im Baukasten schreibt jetzt dasselbe Format wie Modul 0, inklusive Raumliste.

#### Technik
- `grundriss.py`: `_push_hist`, `hist_list`, `restore`. Der Verlauf liegt im eigenen Speicher `fenster_heizung_grundriss_verlauf`.
- Neue WS-Befehle `gr_hist` und `gr_restore` (nur Administratoren). `gr_set` nimmt `src: "import"` an.
- 2 neue Tests (Verlauf, Wiederherstellen samt Bildern und Modul 11, Obergrenze, Umzugs-Kopie). Alle 331 Tests laufen durch.

### Teil 3 · Modul 18 Build 8 – Regeln

**Modul 18 · Licht & Lampen** v0.8 Build 8 – Regeln: das Licht reagiert von selbst. Addon `licht` 0.8.0.

#### Neu
- **Reiter „Regeln“** mit vier Arten:
  - **Bewegung → Licht:** Ein Bewegungs- oder Präsenzmelder schaltet die Lampen eines Raums an, wahlweise nur wenn es dunkel ist (Sonne unter dem Horizont). Dazu gibt es eine eigene Helligkeit und gedimmt nachts (22–6 Uhr). Nach 1 bis 30 Min. ohne Bewegung geht das Licht wieder aus, auf Wunsch nie.
  - **Alle weg → Alle aus:** Ist keine Person mehr zu Hause, gehen nach einer Wartezeit alle Lampen aus. Lampen ohne „Bei Alle aus mitschalten“ bleiben an.
  - **Alarm → Licht an:** Löst ein Melder in Modul 11 aus, gehen die Lampen auf 100 %. Nach dem Alarm gehen die Lampen, die vorher aus waren, auf Wunsch wieder aus.
  - **Abends → Licht an:** an zum Sonnenuntergang (30 Min. vorher bis 30 Min. danach), aus um 22, 23 oder 0 Uhr, bei Sonnenaufgang oder nie.
- **Vorschläge für dein Haus:** Räume mit Bewegungsmelder und Lampen, Personen, Modul 11 und Außenlampen werden als fertige Regel vorgeschlagen.
- **Jede Regel als Satz**, z. B. „Bewegung im Flur → 2 Lampen an, wenn dunkel, aus nach 5 Min. ohne Bewegung“. Der Status zeigt „aktiv“, „hat 2 Lampen an“ oder einen Hinweis wie „Keine Personen in Home Assistant“. Jede Regel lässt sich einzeln an- und ausschalten und testen.
- **Pausieren** aller Regeln für 1 Std., 3 Std., bis morgen früh oder eine Woche, z. B. bei Gästen.
- **Zuletzt:** Protokoll der letzten 40 Schaltungen mit Uhrzeit, es übersteht Neustarts.

#### Wichtig
- Die Regeln laufen im Python-Teil, also auch ohne offenes Dashboard.
- Ausgeschaltet wird nur, was eine Regel selbst angemacht hat. Wer eine Lampe von Hand einschaltet oder ausschaltet, übernimmt sie.
- Fehler beim Schalten landen im Protokoll und an der Lampe.

#### Technik
- `licht/logic.py`: `clean_rules`, `motion_step`, `away_step`, `sun_step`, `is_dark`, `rule_text`.
- `manager.py` hört auf Melder, Personen und das Ereignis `fenster_heizung_sicherheit` (alarm/ende). Dazu kommt ein Takt alle 20 s für Ausschalt-Zeiten, Wartezeiten und Sonnenzeiten.
- Neue Aktionen `rule_test` und `rules_pause` (nur Administratoren).
- 4 neue Tests (Prüfen der Regeln, Bewegung, Alle weg / Abends, Python-Teil mit Bewegung, Pause, Alle weg, Alarm und Neustart), alle 335 Tests grün.

### Teil 4 · Modul 0 v0.5 – neue Grundriss-Optik

**Modul 0 · Haus & Grundriss** v0.5 – neue, detaillierte Optik des Grundrisses.

#### Neu
- **Wände mit Stärke:** Außenwände sind kräftig, Innenwände schmaler, mit leichtem Schatten. Freie Wände aus dem Baukasten werden passend dazu gezeichnet.
- **Böden je Raumart**, erkannt am Namen oder Bereich:
  - Parkett in Wohn-, Schlaf-, Kinder- und Arbeitszimmern
  - Fliesen in Bad, WC, Küche und Flur
  - Pflaster auf Terrasse, Balkon und in der Garage, mit gestricheltem Rand
  - Schraffur in Technik-, Abstell- und Kellerräumen
  - Teppich sonst
- **Türen** mit Öffnung in der Wand, Türblatt und Schwenkbogen. Außentüren sind farbig und tragen einen Pfeil, Durchgänge zeigen nur die Laibung.
- **Fenster** mit Rahmen und Glas. Ist ein Fensterkontakt zugeordnet, wird ein offenes Fenster gelb und aufgeklappt gezeigt.
- **Treppen** mit Stufen und Pfeil in Laufrichtung.
- **Raumbeschriftung** mit Symbol (Sofa, Bett, Topf, Badewanne …), Name und Fläche in m². Die Beschriftung sucht sich einen freien Platz und weicht Lampen, Meldern und Türen aus, auch in L-förmigen Räumen.
- **Maße** zum Einschalten: Maßketten für Breite und Tiefe der Etage und Raummaße wie „7 × 5,5 m“.
- **Nordpfeil und Maßstab** (2 m oder 5 m).
- **Drei Stile:**
  - „Modern“ (dunkel)
  - „Bauplan“ (blau mit weißen, schraffierten Wänden)
  - „Hell“ (Papier mit schwarzen Wänden)
  Stil und Maße merkt sich der Browser.
- Leuchtende Lampen haben einen weichen Lichtschein in ihrer Farbe. Melder tragen ihr Schild-Symbol.

#### Technik
- Neuer Teil `12m3-grundriss-optik.js` mit `_grDraw(Plan, Etage, Optionen)`, `_grKind`, `_grAreaM2` und `_grTheme`. Der Reiter „Plan“ in Modul 0 nutzt ihn. Baukasten, Wärmekarte und Lichtkarte bleiben unverändert.

## [2026.11.4b52] - 2026-11-22

Großes Paket rund um den Grundriss: **Modul 0 · Haus & Grundriss** (neu, v0.3 Build 3) wird der zentrale Bauplan für alle Module samt Baukasten, und **Modul 18 · Licht & Lampen** (v0.6, Addon `licht` 0.6.1) bekommt den Reiter „Lampen“ zum Selbstverwalten sowie Korrekturen an der Lichtkarte.

### Teil 1 · Modul 18 – Korrekturen Lichtkarte

**Modul 18 · Licht & Lampen** v0.5.1 – Korrekturen an der Lichtkarte nach dem ersten Test auf echtem Grundriss.

#### Behoben
- **„… Flächen nicht zugeordnet“ war viel zu hoch:** Räume, deren Bereich in Home Assistant keine Lampen hat (z. B. Bad, Flur, Abstellkammer), galten als nicht zugeordnet und waren schraffiert. Jetzt sind sie zugeordnet und zeigen „keine Lampen“. Gezählt und schraffiert werden nur Flächen ohne passenden Bereich.
- **Punkte und Lampen im Plan waren nicht zu unterscheiden:** Lampen, die noch keinen Platz im Plan haben, erscheinen jetzt kleiner mit gestricheltem Ring unten links („noch nicht platziert“, auch in der Legende). Lampen im Plan stehen an ihrem Platz.
- **Fehlermeldung beim Schalten:** Lehnt die Integration einen Befehl ab (z. B. Overkiz „No such command : on … (ogp:Light)“), erscheint eine Meldung mit dem Namen der Lampe statt der technischen Meldung von Home Assistant. Auch beim Schalten ganzer Räume kommt der Fehler jetzt auf der Seite an.
- **Gleiche Lampennamen im Baukasten** (z. B. zweimal „H70D1“) zeigen zusätzlich die Entitäts-ID.
- „Nicht im Grundriss“ heißt für Lampen ohne Bereich jetzt „Ohne Bereich · 2 Lampen“, die Namen stehen im Hinweis.

### Teil 2 · Modul 0 Build 1 – neues Modul Haus & Grundriss

**Modul 0 · Haus & Grundriss** v0.1 Build 1 – neues Modul aus dem Konzept „Lampen selbst verwalten & Modul 0 · Haus & Grundriss“: der Grundriss gehört ab jetzt dem Kern statt Modul 11.

#### Neu
- **Modul 0 in der Leiste** direkt nach „Start“ und vor Modul 1, mit Version und Stufe „In Entwicklung“. Es ist standardmäßig an.
- **Banner:** Haus im Schnitt mit den Etagen und Räumen aus dem Plan, „2 Etagen · 9 Räume“, Zahl der Melder und Lampen im Plan, welche Module den Plan nutzen.
- **Reiter „Plan“:** Grundriss mit Etagen-Umschalter, Bauplan (Räume auch in freier Form, Wände, Türen, Fenster, Treppen, Texte, Hintergrundbild) und zwei **Ebenen** zum Ein- und Ausblenden: Melder (Modul 11) und Lampen (Modul 18, eingeschaltete in ihrer Farbe). Räume, Ebenen und Sichern & Einlesen sind als kommende Reiter zu sehen (Build 2 bis 4).
- **Umzug aus Modul 11:** Beim ersten Start übernimmt Modul 0 den Plan aus Modul 11 mit Meldern und Lampen. Die Kopie vom alten Stand wird 90 Tage aufgehoben. Leere Pläne werden nicht übernommen.
- **Modul 1 (Wärmekarte) und Modul 18 (Lichtkarte)** lesen den Plan jetzt aus Modul 0.
- **Bearbeiten** geht bis Build 3 noch im Baukasten von Modul 11. Gespeichert wird in Modul 0, alle Module sehen die Änderung sofort.

#### Technik
- Neu: `grundriss.py` (`GrundrissManager`, Speicher `fenster_heizung_grundriss` Schema 1, Umzugs-Kopie `fenster_heizung_grundriss_umzug`), WebSocket `gr_get` (lesen dürfen alle). Das Modul startet vor Modul 11.
- `sicherheit.py`: liest den Plan aus Modul 0, wenn es dort einen gibt, sonst einmaliger Umzug. `sf_set` mit Plan schreibt nach Modul 0. Der eigene Plan-Speicher bleibt als zusätzliche Kopie, `sf_get` liefert weiter den Plan.
- Modul-Schalter `gr` (Standard an). Frontend-Teil `12m2-grundriss.js`, `_gpPlan()` nutzt `gr_get`, das Addon „licht“ liest platzierte Lampen über `_grRaw()`.
- 6 neue Tests (`test_grundriss.py`): Umzug mit Ebenen und Kopie, leerer Plan, Vorrang von Modul 0, Baukasten schreibt in Modul 0, Zahlen und Nutzer, Aufräumen der Kopie nach 90 Tagen.

### Teil 3 · Modul 0 Build 2 – Raumliste und Einstellungen

**Modul 0 · Haus & Grundriss** v0.2 Build 2 – Raumliste und Einstellungen.

#### Neu
- **Reiter „Räume“:** eine Liste für alle Module mit den Spalten Raum im Plan (mit Etage), **Bereich in Home Assistant**, **Raum in Modul 1** und **genutzt von** (M1, M11 mit Zahl der Melder, M18 Licht). Ohne Auswahl ordnet der Name zu („automatisch“). Fehlende Bereiche sind gelb, ihre Zahl steht am Reiter. Am Handy wird jede Zeile zur Karte.
- **„Bereich zuordnen“:** Bereiche aus Home Assistant, „Kein Bereich“ und „Automatisch“. Gilt für alle Module, die nach Bereichen arbeiten.
- **Raum in Modul 1** wird direkt hier geändert (dasselbe Fenster wie in der Wärmekarte).
- **Reiter „Einstellungen“** (Administratoren): Modul 0 ein/aus mit **Rückfrage**, die die Module nennt, die den Plan nutzen. Dazu Umzug und Kopie, zuletzt geändert, Speicherort. Ausschalten blendet nur die Seite aus, der Plan bleibt in Modul 1, 11 und 18 sichtbar.
- **Einstellungen → Module:** Modul 0 steht jetzt vor Modul 1 und hat einen eigenen Schalter (mit derselben Rückfrage).

#### Geändert
- **Modul 18:** Die Zuordnung Fläche → Bereich (bisher `pmap` im Addon) steht jetzt in der Raumliste von Modul 0. Sie wird beim Start einmalig übernommen, Einträge in Modul 0 haben Vorrang. „Fläche zuordnen“ in der Lichtkarte schreibt in die Raumliste. Addon `licht` 0.5.2.

#### Behoben
- Einstellungen → Module zeigte bei stabilen Modulen „· undefined“ statt „· stabil“.

#### Technik
- `grundriss.py`: `rooms` (Plan-Raum → Bereich oder „-“), `set_rooms`, `merge_pmap` (einmalig, vermerkt in `meta.pmap`). Neuer WebSocket `gr_set` (nur Administratoren). `gr_get` liefert `rooms`.
- Die Spalte „Raum in Modul 1“ bleibt im Layout (`gmap`) und wird nur von hier aus bearbeitet. Ein Umzug in die Raumliste ist für später vorgesehen.
- 1 neuer Test (Raumliste setzen, zurücksetzen, Übernahme aus Modul 18, Neustart), alle Tests grün.

### Teil 4 · Modul 18 Build 6 – Reiter „Lampen“

**Modul 18 · Licht & Lampen** v0.6 Build 6 – Reiter „Lampen“ aus dem Konzept „Lampen selbst verwalten“. Addon `licht` 0.6.0.

#### Neu
- **Reiter „Übersicht | Lampen“** oben in Modul 18. Unter „Lampen“ steht **„Meine Lampen“**, nach Räumen gruppiert. Jede Lampe zeigt Art, „✓ im Plan“ oder „Platz fehlt“, ihren Zustand und den letzten Fehler. Die Kopfzeile zählt Lampen, Räume, fehlende Plätze und Fehler.
- **Lampe hinzufügen:** Suche, Filter „Noch nicht hinzugefügt / Alle / Gruppen“, Fähigkeiten je Lampe („dimmbar · Farbe“, „nur an/aus“) und **Testen**, damit die Lampe kurz blinkt. Bei einer Lampe geht es weiter zum Einrichten. Mehrere Lampen werden mit einem Vorschlag hinzugefügt (Art aus dem Namen, Raum aus Home Assistant).
- **Lampe bearbeiten:** eigener Name, Raum (zuerst die Räume aus Modul 0, dann weitere Bereiche, oder „Wie in Home Assistant“), Art, „Bei Alle aus mitschalten“, Platz im Grundriss, Testen, Entfernen.
- **Umstieg:** Beim ersten Öffnen fragt Modul 18 „Alle übernehmen“, „Selbst auswählen“ oder „Später“. „Alle übernehmen“ übernimmt Namen, Bereiche und einmalig den Raum aus der Position im Plan.
- **Neue Lampen** in Home Assistant erscheinen nur als Hinweis mit „Hinzufügen“ und „Ausblenden“. Die Zahl steht am Reiter.
- **Einstellungen:** „Welche Lampen?“ mit „Meine Lampen“ oder „Automatisch“ (wie bisher).

#### Geändert
- Mit „Meine Lampen“ zeigen Übersicht, Haus-Szene, Lichtkarte, Kacheln und das Banner nur deine Lampen, mit deinem Namen und Raum. Der Raum aus der Position im Plan entfällt dann.
- „Alle aus“ lässt Lampen mit ausgeschaltetem „Bei Alle aus mitschalten“ an.
- Einzelne Lampen schaltet jetzt der Python-Teil. Ein abgelehnter Befehl (z. B. Overkiz „No such command“) wird an der Lampe gemerkt und beim nächsten Erfolg gelöscht.

#### Technik
- `licht/logic.py`: `clean_lamps`, `guess_kind`, `clean_ignored`. `manager.py` speichert `lamps`, `mode`, `ignored` und hält `errs`. Neue Aktion `act {a:"test"}` (Blinken mit `flash`, sonst zweimal umschalten).
- Neue Tests für Lampenliste, Art-Vorschlag, Modus „mine“ und Fehler je Lampe, alle Tests grün.

### Teil 5 · Modul 0 Build 3 – Baukasten zieht nach Modul 0

**Modul 0 · Haus & Grundriss** v0.3 Build 3 – der Baukasten zieht aus Modul 11 nach Modul 0.

#### Neu
- **Baukasten in Modul 0:** „Bearbeiten“ im Banner und „Grundriss zeichnen“ öffnen den Baukasten direkt in Modul 0. Oben steht ein Streifen „Grundriss bearbeiten“ mit den aktiven Ebenen (Bauplan, Melder, Lampen).
- **„Bearbeiten“ aus jedem Modul:** Modul 1 (Wärmekarte), Modul 11 (Grundriss) und Modul 18 („Im Plan platzieren“) führen in den Baukasten von Modul 0. Nach Speichern oder Abbrechen geht es zurück („Grundriss gespeichert – zurück in Modul 11 · Sicherheit“), und „← Zurück zu …“ steht im Streifen.
- **Ohne Modul 11:** Den Grundriss kannst du jetzt auch zeichnen, wenn Modul 11 aus ist. Dann fehlen nur die Melder-Werkzeuge.
- **Reiter „Ebenen“:** Bauplan, Melder (Modul 11), Lampen (Modul 18) und Wärme (Modul 1). Jede Ebene zeigt ihre Zahlen, z. B. Elemente im Plan, „noch ohne Platz“ und Räume mit Raum aus Modul 1. „Melder setzen“ und „Lampen setzen“ öffnen den Baukasten mit dem passenden Werkzeug. Die Sichtbarkeit lässt sich je Ebene umschalten. Ebenen ausgeschalteter Module bleiben gespeichert.
- **Modul 0 aus:** Dann fragt „Bearbeiten“, ob Modul 0 eingeschaltet werden soll.

#### Geändert
- Modul 11 schreibt den Plan nicht mehr mit seinen Einstellungen. Der Plan wird nur noch im Baukasten gespeichert (`gr_set`), Modul 11 übernimmt Änderungen sofort.
- Im Baukasten stehen bei „Noch nicht platzierte Lampen“ mit „Meine Lampen“ aus Modul 18 nur deine Lampen mit deinem Namen. Addon `licht` 0.6.1.

#### Technik
- `gr_set` nimmt `plan` an (nur Administratoren, gespeichert mit `by: "gr"`). `sicherheit.py` hört über `listen()` auf Modul 0 und zieht seine Kopie nach, ohne zurückzuschreiben.
- Frontend: `_grEdit(von, Werkzeug)`, `_grSavePlan`, `_grEditDone`, `_grLayersView`. Der Baukasten selbst (`_sfPlan`) bleibt gemeinsam genutzt und kennt jetzt `host: "gr"`.
- 1 neuer Test (Speichern in Modul 0, Modul 11 zieht nach, Abmelden beim Stoppen), alle Tests grün.

## [2026.11.4b51] - 2026-11-22

**Modul 18 · Licht & Lampen** v0.5 Build 5 (mit Build 4) – Grundriss I und II aus dem Konzept „Modul 18 · Licht & Lampen“ (Teil B1–B7): Grundriss als Lichtkarte und Lampen im Plan.

### Neu · Build 4 – Grundriss als Lichtkarte
- **Dritte Ansicht „Grundriss“ als Lichtkarte** (Umschalter im Banner: Räume · Liste · Grundriss). Der Grundriss kommt aus dem Baukasten von Modul 11 – einmal gezeichnet, in Modul 1, 11 und 18 genutzt. Freie Raumformen werden mitgezeichnet.
- **Räume leuchten in der Mischfarbe ihrer Lampen**, die Stärke folgt der Helligkeit. Darauf Name, Prozent, „3 von 4 an“ und die Plakette „seit … “, wenn Licht lange brennt.
- **Lampenpunkte** je Raum in ihrer echten Farbe (grau = aus, gestrichelt = offline).
- **Bedienen im Plan:** Fläche antippen schaltet den Raum (über die passende Lichtgruppe), Punkt antippen schaltet die Lampe, **lang drücken** (am Computer Rechtsklick) öffnet das Lampen-Detail.
- **Etagen-Umschalter** mit der Zahl heller Räume je Etage. Geöffnet wird die erste Etage mit Licht.
- **Zuordnung Fläche → Bereich** automatisch über den Namen. „… Flächen nicht zugeordnet“ springt zur nächsten freien Fläche, dort wählt ein Administrator den Bereich oder „Kein Bereich“. Gilt nur für Modul 18.
- **„Nicht im Grundriss“:** Räume mit Lampen ohne Fläche stehen als Schalter unter dem Plan.
- Ohne Grundriss: Hinweis mit „Grundriss zeichnen“ (öffnet den Baukasten von Modul 11).

### Neu · Build 5 – Lampen im Grundriss
- **Lampen im Baukasten:** Modul 11 hat das neue Werkzeug **„Lampe“** (Gruppe „Licht (Modul 18)“, nur mit dem Addon sichtbar). Antippen auf dem Plan setzt eine freie Lampe aus dem Raum unter dem Finger. Die Liste „Noch nicht platzierte Lampen“ setzt sie direkt in ihren Raum. Einstellbar sind Entität und Art (Decke, Steh, Spot, Streifen, Außen); Streifen erscheinen als Balken und lassen sich drehen.
- **Lichtkarte mit echten Plätzen:** Platzierte Lampen leuchten an ihrem Platz, mit Lichtkegel in ihrer Farbe und Größe nach Helligkeit, begrenzt auf ihren Raum. Antippen schaltet die Lampe, lang drücken öffnet das Detail. Lampen ohne Platz bleiben als Punkte im Raum.
- **Raum aus der Position:** Hat eine Lampe keinen Bereich in Home Assistant, gehört sie zum Raum, in dem sie im Plan steht – in allen Ansichten (Räume, Liste, Grundriss, Haus-Szene). Der Bereich aus Home Assistant hat Vorrang.
- **Plakette „offline“** auf der Raumfläche, wenn eine Lampe nicht erreichbar ist.
- **„… Lampen nicht im Plan“** in der Kopfzeile (über alle Etagen) öffnet den Baukasten mit dem Werkzeug „Lampe“.
- Im Baukasten und in der Grundriss-Ansicht von Modul 11 leuchten eingeschaltete Lampen in ihrer Farbe.

### Technik
- Addon `licht`: Ansicht `plan`, Zuordnung `pmap` im Addon-Speicher, `set` nimmt `pmap` an (nur Administratoren).
- Kern: Fenster des Addons werden über das Präfix `lix` geöffnet statt über eine feste Liste.
- 2 neue Tests für die Zuordnung (prüfen, setzen, zurücksetzen, über Neustart).
- `sicherheit.py`: neuer Element-Typ `l` (Felder `e` nur `light.*`, `k` Art), `MAX_ITEMS` 300 → 400. Ohne Addon bleiben Lampen gespeichert, aber unsichtbar. Plan sichern und einlesen nimmt Lampen mit.
- Addon `licht` 0.5.0 Build 5 (`core_min` 2026.11.4b51). Der Baukasten nutzt `_liLampHex`, `_liRoomOfLamp` und `_liFreeLampAt` des Addons.
- Neuer Test für Lampen im Plan (`test_sicherheit.py`), alle Tests grün.

## [2026.11.4b50] - 2026-11-22

**Weihnachts-Theme in allen Modulen** (Vorschau „Handy-Banner korrigieren & Weihnachten überall“, Teil 2).

### Neu
- **Ebene 1 – jede Kopfkarte:** Vom 01.12. bis 27.12. (bzw. bei „Immer an“) bekommt jedes Modul-Banner die **Lichterkette** (Farbset aus den Einstellungen), **Schnee** (wenn eingeschaltet) und den **Kranz-Chip** mit Countdown – ein Tipp darauf öffnet den Adventskalender. Gilt für alle Module und auch für die Addons (Müll, Licht, Saugroboter, Abrechnung). Startseite und Modul 1 behalten ihre eigene Deko.
- **Ebene 2 – Details in den Bildern:** Nikolausmütze auf dem Warmwasserspeicher, Schnee und Lichterkette am Giebel (Lüftung), Schneedach und Kranz (Rollläden, nachts mit Lichtern), Schneehaube auf der Wärmepumpe, Tannenbaum mit Stern und Schneemann im Garten, Lichterkette und Schnee an der Saunahütte, Geschenkschleife um den Akku, Stern am Kalenderblatt (Wartung).
- Alles folgt „Saison-Theme“ (Aus · Nur Akzente), Anpassen → Animationen und „Bewegung reduzieren“. Lichter und Schnee beginnen beim Neuzeichnen nicht von vorn.

### Technik
- `_saiDeco` hängt die Deko nach jedem Zeichnen an `#main .card.hero.mh` (ohne eigene Deko), `_sbX` schaltet die Bild-Details. Test `test_szenen_banner.py` prüft die Details mit und ohne Theme.
- Im Browser geprüft: alle Szenen-Banner breit und am Handy (390 px) mit „Immer an“ und Schnee.

## [2026.11.4b49] - 2026-11-22

**Neue Banner** – Handy-Ansicht korrigiert (Vorschau „Handy-Banner korrigieren & Weihnachten überall“, Teil 1).

### Behoben
- **Banner am Handy nicht mehr verdeckt:** Bisher lag das Bild bei schmalen Bildschirmen halb durchsichtig hinter dem ganzen Text – bei Lüftung liefen Raum-Namen und Werte durch die Schrift, bei Rollläden saß das Haus unter den Chips. Jetzt steht das Bild unter 600 px Breite als **eigener Streifen über dem Text** und läuft nach unten in die Kartenfarbe aus. Gilt für alle acht Szenen-Banner (Warmwasser, Lüftung, Rollläden, Wärmepumpe, Garten, Pool & Sauna, Batterie, Wartung). Die Versions-Plakette steht neben der Titelzeile.
- iPad und Computer bleiben unverändert (Bild rechts).

## [2026.11.4b48] - 2026-11-22

**Neue Banner** Build 3 – Garten, Pool & Sauna, Batteriespeicher (Schritt 3 von 3). Damit haben alle Module ein Szenen-Banner.

### Neu
- **Modul 10 · Garten & Bewässerung** (v0.1 Build 2): **Beet mit dem aktuellen Wetter** – Sonne, Wolken, Regen oder Schnee aus der Wetterquelle, bei Frost blasse Blätter. Große Zahl das Wetter („Sonnig“, „Regen“), dazu Hinweise „Heute nicht gießen“, „Abends gießen“ (ab 25 °C und trocken) oder „Frost – Außenleitungen entleeren“.
- **Modul 12 · Pool & Sauna** (v0.1 Build 2): **Pool mit Wellen und Saunahütte**, Sonne bei PV-Überschuss, bei Kälte kühles Wasser. Große Zahl die Außentemperatur, dazu PV-Überschuss und Strompreis, „Gut für Pumpe und Heizung“ ab 1 kW Überschuss.
- **Modul 13 · Batteriespeicher** (v0.1 Build 2): **Akku mit Füllstand** (grün, unter 30 % gelb), PV-Dach mit Fluss zum Akku bei Überschuss. Große Zahl der Ladestand, dazu Untergrenze aus Modul 1 und „Nah an der Untergrenze“.

### Technik
- Ohne Sensor zeigt jedes Banner „–“ mit Hinweis. Wasser- und Saunatemperatur sowie die Lade-/Entladeleistung folgen, wenn die Module eigene Sensoren bekommen.
- Neuer Test `tests/test_szenen_banner.py` (läuft mit Node): alle neuen Banner ohne Sensor, große Zahlen und Hinweise mit Werten, Sonne an der richtigen Seite, keine leeren Werte in den Bildern.

## [2026.11.4b47] - 2026-11-22

**Neue Banner** Build 2 – Lüftung, Rollläden und Wärmepumpe (Schritt 2 von 3).

### Neu
- **Modul 5 · Lüftung & Raumluft** (v0.1 Build 2): **Haus-Schnitt** mit bis zu vier Räumen in der Farbe ihrer Luftfeuchte (grün unter 60 %, gelb unter 70 %, rot ab 70 %), Lüfter und Luftströme. Große Zahl „Luft gut“ oder der feuchteste Raum („Bad 74 %“) mit Schimmelrisiko und Taupunkt, dazu Ø-Luftfeuchte und offene Fenster. Werte wie im Reiter „Jetzt“.
- **Modul 6 · Rollläden & Beschattung** (v0.1 Build 2): **Fassade mit Sonnenbogen** – die Sonne steht dort, wo sie wirklich ist (Richtung und Höhe aus `sun.sun`), nachts Mond, Sterne und Licht in den Fenstern. Große Zahl Richtung und Höhe („Süd · 22°“) oder „Nacht“ mit Sonnenaufgang; Hinweis „Beschattung sinnvoll“ bei hoher Sonne aus Süden ab 20 °C, „Frost – Rollläden zu lassen“ bei Frost.
- **Modul 7 · Wärmepumpe** (v0.1 Build 2): **Außengerät** mit drehendem Lüfter, Thermometer und Vor-/Rücklauf, bei Frost Reif und Schnee. Große Zahl Außentemperatur, Hinweis „Abtauen wird wahrscheinlicher“ zwischen −8 und 7 °C bei feuchter Luft.
- Chips in Ampelfarben (gut, Hinweis, Warnung) für alle neuen Banner. „Coming soon …“ steht nur noch unten in der Seite.

### Technik
- Ohne Sensor zeigt jedes Banner „–“ mit Hinweis, was fehlt (keine erfundenen Werte). Der geschätzte COP aus der Vorschau entfällt, bis echte Werte der Anlage da sind.
- Im Browser geprüft: alle drei Module in zwei Zuständen (Luft gut / Bad zu feucht, Tag / Nacht, Frost / mild), breit und am Handy.

## [2026.11.4b46] - 2026-11-22

**Neue Banner** Build 1 – Szenen-Banner für die restlichen Module (Vorschau „Neue Banner für die restlichen 8 Module“), Schritt 1 von 3.

### Neu
- **Modul 2 · Warmwasser & Zirkulation** (v1.1 Build 2): Banner mit dem **Speicher im Schnitt** – Füllung in den Farben der Temperatur (oben heiß, unten kalt), Temperatur oben und unten, Zirkulation als laufende Leitung mit Dusche, Flamme beim Aufheizen, PV-Dach bei Überschuss. Die Knöpfe „Einmal aufheizen“, „Zirkulation 5 Min.“ und „Abwesend“ bleiben im Banner.
- **Modul 15 · Wartung & Erinnerungen** (v0.2 Build 3): Banner mit einem **Kalenderblatt** für den nächsten Termin (rot, wenn er fällig ist) und **Ampel-Ringen** für die vier wichtigsten Termine – der Ring zeigt, wie weit der Abstand schon abgelaufen ist.
- **Gemeinsamer Banner-Baustein** für die nächsten Module: Bild rechts, das zur Kartenfarbe ausläuft, Versions-Plakette unten rechts, am Handy halb durchsichtig hinter dem Text. Bewegung folgt Anpassen → Animationen (Aus · Dezent · Voll) und „Bewegung reduzieren“, Bilder außerhalb des Bildschirms halten an, laufende Bewegung beginnt beim Neuzeichnen nicht von vorn.
- **Einstellungen → Darstellung → „Banner wie bisher“:** zurück zum Logo-Feld (auch über „Einstellung suchen“).

### Technik
- Neue Dashboard-Teile `03i-stile-szenen-banner` und `12i2-szenen-banner`. `_modHero` nimmt ein Bild über `scene` an; Module ohne Bild bleiben unverändert.
- Im Browser geprüft: breite Ansicht und Handy (400 px), Speicher warm und kalt, Wartung mit überfälligem Termin.

## [2026.11.4b45] - 2026-11-22

**Weihnachts-Theme** Build 3 – Sponsor-Varianten, Tagesschlüssel und Modul-Details (Konzept „Weihnachts-Theme & Adventskalender“, Build 3 von 3).

### Neu
- **Variante C · Sterne** (Sponsor): ein Stern für jedes Türchen, das am eigenen Tag geöffnet wird – Nachholen geht trotzdem.
- **Variante D · Hausfluss-Dorf** (Sponsor Max): jedes Türchen schmückt das Dorf weiter – Lichter am Dach, Fenster, Schneemann (6), Schlitten (13), Baum (20), Stern (24).
- **Farbsets** Klassisch, Eis-Blau und Gold für Lichterkette und Dorf, **Schneefall Mittel und Stark** (Sponsor).
- **Persönliche Tagesschlüssel:** Wer kein Sponsor ist, findet an Tag 6 und 13 einen Sponsor- und an Tag 20 und 24 einen Sponsor-Max-Tagesschlüssel; Sponsoren testen an Tag 20 und 24 die Stufe Max. „Jetzt aktivieren“ im Türchen oder von Hand unter Darstellung → Weihnachts-Theme. Der Schlüssel gilt **nur an seinem Tag**, nur auf der eigenen Installation und schaltet bis 23:59 alle Funktionen der Stufe frei. Banner „Sponsor-Tag aktiv · noch … h“, am nächsten Tag ein Danke-Hinweis.
- **Schutz:** An allen anderen Tagen wird jeder Tagesschlüssel abgelehnt. Die Tages-Codes sind mit dem Entwickler-Schlüssel signiert (Ed25519, derselbe öffentliche Schlüssel wie bei den Sponsor-Schlüsseln) – nachgebaute Schlüssel für andere Tage oder Stufen sind ohne privaten Schlüssel nicht möglich. Eine zurückgestellte Uhr wird erkannt.
- **Sponsor-Bonus** an Tag 6, 13 und 20 (Eis-Blau, Schneefall Stark, Gold zum Ausprobieren), an Tag 24 für Sponsor Max ein **Jahresrückblick**.
- **Modul 11:** Kerzen-Erinnerung „Kerzen aus?“ an Adventssonntagen und Heiligabend, wenn alle das Haus verlassen (über das Gerät der Kalender-Benachrichtigung, abschaltbar).
- **Modul 18:** Chip „3 von 5 Weihnachtslichtern an“ auf der Startseite für Lampen und Schalter mit dem Label `weihnachten`.
- **Entwickler:** „Tages-Codes signieren“ (die vier Codes für `advent_codes.json`), Testschlüssel `SW26-XMAS-SPON-T7K4-Q9M2` und `SW26-XMAS-SMAX-T3R8-D5VX` (nur mit Entwickler-Zugang, bis 06.01.2027, ohne Tage-Sperre).

### Technik
- Neue Datei `tagesschluessel.py` (Prüfung in 6 Schritten, Signieren, ohne Home Assistant testbar), `advent_codes.json` im Repository (wird alle 6 Stunden geladen; die Signatur prüft jeden Code selbst). `sponsor.py`: `base_tier()` und Hochstufen mit gültigem Tagesschlüssel.
- WebSocket `fenster_heizung/advent_key` (aktivieren, danke) und `advent_sign` (nur Entwickler). Speicher `fenster_heizung_advent` um Tagesschlüssel, Uhr-Schutz und Codes erweitert (Schema 1, alte Daten bleiben gültig).
- 10 neue Tests (Tagesschlüssel mit echter Signatur: eigener Tag, falsche Tage, Fälschungen, andere Installation, Uhr, Testschlüssel, wer was bekommt, Hochstufen; Kalender: Aktivieren mit Ablauf und Danke, Regeln je Stufe, Sterne und neue Optionen).

### Noch offen
- Die Tagesschlüssel brauchen die vier signierten Tages-Codes für 2026 in `advent_codes.json` (Entwickler → „Tages-Codes signieren“). Bis dahin zeigt das Türchen „Der Tages-Code für heute ist noch nicht da“.
- Optik-Details für Modul 1 (Backofen-Wärme), Modul 8 (Schlitten) und Modul 19 (Schneedach) sowie das PDF zum Jahresrückblick folgen später.

## [2026.11.4b44] - 2026-11-22

**Weihnachts-Theme** – Einstellungen leichter zu finden.

### Geändert
- **Einstellungen → Darstellung → Weihnachts-Theme** ist jetzt eine eigene Zeile mit Status („Startet am 01.12.“, „Aktiv · 2. Advent · noch 16 Tage“) und öffnet ein eigenes Fenster mit Theme, Adventskalender und – mit Entwickler-Zugang – „Datum simulieren“ und „Kalender testen“. Vorher lag alles ganz unten im Fenster „Darstellung“; dort steht jetzt nur noch ein Link.
- **Einstellung suchen** findet „Weihnachts-Theme“, „Adventskalender“ und „Datum simulieren“ (auch mit „Weihnachten“, „Advent“, „Schnee“, „Türchen“).

## [2026.11.4b43] - 2026-11-22

**Weihnachts-Theme** Build 2 – der Adventskalender (Konzept „Weihnachts-Theme & Adventskalender“, Build 2 von 3).

### Neu
- **Adventskalender auf der Startseite** in zwei Varianten: **A · Raster** mit allen 24 Türchen (Türchen 24 doppelt breit) oder **B · Kranz** kompakt mit dem heutigen Türchen und „Alle 24“. Auch der Kranz-Chip in Modul 1 öffnet den Kalender.
- **24 Türchen** mit Spartipps, Statistiken, Rätseln, Deko und Funktionen. Wo möglich mit **deinen echten Werten** – Heizpause und gesparte Wärme im Monat und im Jahr, wärmster und feuchtester Raum, offene Fenster, Lampen heute (Modul 18), PV jetzt, Ladestand des Autos, Zustand der Rauchmelder, Sonnenauf- und -untergang. Fehlen Werte (z. B. keine PV), zeigt das Türchen einen passenden Text – keins bleibt leer. Knopf „Zu Modul …“, wo es passt.
- **Türchen-Zustände:** offen ✓, **heute** (rot), **nachholen** (goldener Rand, verpasste Türchen lassen sich öffnen), **noch zu** (mit „Noch 2 Tage – Geduld!“). Ab 28.12. nur noch zum Nachlesen, ab 7.1. ausgeblendet.
- **Stand gemeinsam oder pro Benutzer** von Home Assistant.
- **Schneefall** (Aus · Leicht) in den Kopfkarten der Startseite und von Modul 1 – höchstens 26 Flocken, nur CSS, aus bei „Bewegung reduzieren“ und ohne Animationen.
- **Benachrichtigung „Türchen ist da“** zur gewählten Uhrzeit an ein Gerät der Companion-App (Standard: aus).
- **Dienst** `fenster_heizung.advent_tuer_oeffnen` (z. B. per NFC-Tag, ohne Tag das heutige) und **Ereignis** `strom_waerme_advent_geoeffnet` (tag, typ, titel, jahr, benutzer) für eigene Automationen.
- **Sensor** `sensor.strom_waerme_advent_tuerchen` (geöffnete Türchen, Attribut `heute_verfuegbar`).
- **Entwickler:** „Alle Türchen ansehen“ (Vorschau ohne Öffnen), „Kalender zurücksetzen“ (auch als Dienst `advent_zuruecksetzen`). Mit „Datum simulieren“ geöffnete Türchen werden nicht gespeichert.
- Einstellungen unter Darstellung → Weihnachts-Theme → Adventskalender.

### Technik
- Neue Dateien `advent.py` (Logik ohne Home Assistant testbar, Speicher `fenster_heizung_advent`, Schema 1) und `advent/2026.yaml` (Inhalte; neues Jahr = neue Datei, fehlt sie, gilt die letzte). WebSocket `fenster_heizung/advent_get`, `advent_open`, `advent_set` (nur Administratoren), `advent_reset` (nur Entwickler).
- Dashboard: neuer Teil `12z4-advent`, Stile in `03h-stile-saison`.
- 7 neue Tests (Türchen-Zustände an allen Grenzen, Inhaltsdatei vollständig mit gültigen Platzhaltern, Ersatz-Datei, Grenzen der Einstellungen, Öffnen und Nachholen mit Neustart und Ereignis, Stand pro Benutzer, Simulation nur im Arbeitsspeicher, Zurücksetzen, Zähler).

## [2026.11.4b42] - 2026-11-22

**Weihnachts-Theme** Build 1 – erster Schritt aus dem Konzept „Weihnachts-Theme & Adventskalender“ (Build 1 → 3, Release 2026.12.0): Saison-Erkennung und Theme-Grundlage.

### Neu
- **Weihnachtszeit von selbst:** Vom **01.12. bis 27.12.** zeigt Modul 1 jedes Jahr das Weihnachts-Theme, am 28.12. ist es wieder weg – ohne Neustart, der Wechsel kommt um Mitternacht. Vier Phasen: **Advent** (1.–23.), **Heiligabend** (24.), **Feiertage** (25.–26.), **Ausklang** (27.).
- **Adventskranz und Countdown** auf der Startseite und als erster Chip der Kopfkarte von Modul 1: Die Kerzen zählen nach den Adventssonntagen mit (jedes Jahr neu berechnet, 2028 ist der 4. Advent Heiligabend), dazu „noch 18 Tage“ bis Heiligabend, an den Feiertagen ein Gruß.
- **Lichterkette** oben an der Kopfkarte der Startseite und von Modul 1, Farben je Phase (an Heiligabend golden). Die Lichter blinken sanft, folgen Anpassen → Animationen und „Bewegung reduzieren“.
- **Weihnachtliche Raum-Symbole** an den Raumkarten (Wohnzimmer 🎄, Küche 🍪, Kinderzimmer ⛄, Esszimmer 🕯️, Schlafzimmer 🌙, an Heiligabend ⭐).
- **Einstellungen → Darstellung → Weihnachts-Theme:** Automatisch (Standard), Immer an, Aus oder Nur Akzente (ohne Bewegung), dazu Schalter für Lichterkette, Countdown und Raum-Symbole. Bei „Aus“ sieht alles aus wie bisher.
- **Datum simulieren** (nur mit Entwickler-Zugang): Schnellwahl für alle Phasenwechsel (30.11. 23:59, 1.12., 6.12., 20.12., 24.12., 25.12., 27.12., 28.12.) oder ein eigenes Datum, Dauer 15 Minuten bis 8 Stunden. Die Simulation verschiebt nur das Theme im Dashboard – Heizpläne, Statistiken, Automationen und die Entitäten bleiben bei der echten Zeit. Sie endet von selbst oder mit dem nächsten Neustart.
- **Vier Entitäten** (Gerät „Strom & Wärme · Saison“, immer echtes Datum): `binary_sensor.strom_waerme_weihnachtszeit`, `sensor.strom_waerme_saison_phase` (mit Adventssonntagen als Attribut), `sensor.strom_waerme_advent_kerzen` und `sensor.strom_waerme_tage_bis_heiligabend`.

### Technik
- Neue Dateien `saison.py` (Logik ohne Home Assistant testbar, Manager mit eigenem Speicher `fenster_heizung_saison`, Schema 1; die Simulation liegt nur im Arbeitsspeicher) und `saison_ent.py`. WebSocket-Befehle `fenster_heizung/saison_get`, `saison_set` (nur Administratoren) und `saison_sim` (nur Administratoren mit Entwickler-Zugang).
- Dashboard: neue Teile `03h-stile-saison` und `12z3-saison`. Die Logik im Dashboard ist für 2026–2035 Tag für Tag mit `saison.py` abgeglichen. Das Theme-Datum rechnet das Dashboard selbst, geprüft wird jede Sekunde, gezeichnet nur bei einer Änderung.
- 6 neue Tests (Adventssonntage 2026–2059, alle Phasengrenzen, Kerzen und Countdown mit Schaltjahr, Einstellungen, Speichern und Laden, Simulation nur fürs Theme mit Ablauf und Grenzen).

## [2026.11.4b41] - 2026-11-22

**Modul 18 · Licht & Lampen** v0.3 Build 3 (enthält Build 2) – die ersten beiden Schritte aus dem Konzept „Modul 18 · Licht & Lampen“ (v0.1 Build 1 → 1.0): Technik und neue Optik.

### Neu
- **Build 2 · Technik:** Der Python-Teil des Addons merkt sich, **seit wann jede Lampe an ist** – auch über einen Neustart von Home Assistant. Vorher stand danach jede Lampe auf „seit 0 Min.“, „Längste an“ und „Licht lange an“ waren falsch. Kurze Lücken (bis 30 Min.) zählen als „war an“.
- **Brennstunden** je Lampe und Tag (90 Tage), Kachel „Licht heute“ mit den letzten 7 Tagen, „Heute an“ im Lampen-Detail.
- **Lichtgruppen:** Räume, „Alle aus“ und die Raumhelligkeit schalten über eine Lichtgruppe, deren Lampen genau passen (Gruppen-Helfer, Hue-Räume, Zigbee-Gruppen). Alle Lampen reagieren gleichzeitig, weniger Funkverkehr. Gruppen werden nicht doppelt gezählt.
- **Drei Sensoren** (Gerät „Strom & Wärme · Licht“): `sensor.strom_waerme_licht_lampen_an`, `…_licht_heute` (Std.) und `…_laengste_an` (Min., mit Lampe und Zeitpunkt).
- **Build 3 · Neue Optik:** **Haus-Szene im Banner** mit einer Reihe je Etage aus Home Assistant, die Fenster leuchten in der Lichtfarbe der Räume, Tag und Nacht nach dem Sonnenstand. **Kacheln 2.0** (Lampen an, Licht heute, Längste an, Hinweise), **Szenenleiste**, **Raumkarten 2.0** mit Lichtschein in der echten Mischfarbe der Lampen, großer Prozentzahl, Lampen als Chips mit Farbpunkt und Plakette „brennt seit …“.
- **Ansicht „Liste“:** eine Zeile je Lampe mit „an seit“ bzw. „heute … Std. an“, umschaltbar im Banner.
- **Lampen-Detail 2.0:** Helligkeitsring in der Lichtfarbe, Weißton-Leiste mit Markierung des aktuellen Werts, die gewählte Farbe ist markiert.
- **Einstellungen → Darstellung:** Optik „Neu“ oder „Wie bisher“ (Seite von Build 1), Ansicht Räume oder Liste. Bewegung folgt Anpassen → Animationen (Aus · Dezent · Voll), „Bewegung reduzieren“ wird beachtet.

### Technik
- Neue Dateien `addons/licht/logic.py` (Farbe, Gruppen, Brennstunden, ohne Home Assistant testbar) und `addons/licht/manager.py` mit eigenem Speicher (`fenster_heizung_addon_licht`, Schema 1). Befehle `get`, `set` (nur Administratoren) und `act` über `addon_call`.
- Szenen, ausgeblendete Räume und „Licht lange an“ bleiben im Layout (`layout.li`), weil Tags und Messwerk sie dort lesen. Beim ersten Öffnen durch einen Administrator legt das Addon eine Kopie davon in seinem Speicher ab.
- Neu im Kern: `licht_ent.py` (Sensoren entstehen erst mit dem Addon), Banner nutzt `_liHero()` des Addons.
- 10 neue Tests für Modul 18 (Farben, Gruppen, Mitternacht und Zeitumstellung, Neustart mit kurzer und langer Lücke, Aufräumen, Python-Teil mit Rechten).

## [2026.11.4b40] - 2026-11-21

**Modul 15 · Wartung & Erinnerungen** v0.2 Build 2 – erster Schritt aus dem Konzept „Modul 15 · Wartung & Erinnerungen“ (0.1 Build 1 → 1.0): echte Termine statt nur Beispielbilder.

### Neu
- **Reiter „Termine“** (neue Startseite von Modul 15): eigene Wartungstermine anlegen, bearbeiten und löschen. Je Termin Name, Anlage oder Bereich, Abstand (Tage, Wochen, Monate oder Jahre), Vorwarnung, zuletzt erledigt, erster Termin (wenn noch nie erledigt), Symbol, Notiz, „Macht ein Fachbetrieb“ und „Pausiert“. Bis zu 100 Termine.
- **Vorlagen** beim Anlegen: Schornsteinfeger, Heizungswartung, Rauchmelder prüfen, Lüftungsfilter, Dunstabzug-Filter, Wasserfilter, Regenrinne, Klimaanlage, Wärmepumpe Service, Saugroboter Bürsten – füllen die Felder, alles bleibt änderbar.
- **Erledigt mit einem Tipp:** setzt das Datum auf heute, der nächste Termin rechnet sich aus dem Abstand (31.01. + 1 Monat = Monatsende). Am selben Tag lässt sich das mit **„Rückgängig“** zurücknehmen.
- **Ampel:** im Plan, bald (in der Vorwarnzeit), fällig (ab dem Termin, 3 Tage Kulanz), überfällig; dazu ein Fortschrittsring je Termin und Kennzahlen (fällig, bald, im Plan, erledigt dieses Jahr). Das Banner zeigt, wie viele Termine fällig sind und was als Nächstes kommt.
- **Diagnose:** Modul 15 in den Diagnosedaten von Home Assistant – Abstände, Daten und Ampel, ohne Namen, Notizen und Kosten.

### Geändert
- Der Reiter „Fahrplan“ zeigt den neuen Weg in Builds bis 1.0 (Fälligkeits-Engine, Entitäten, Erinnerungen, andere Module, neue Optik, Vorschläge und Heft, Testwoche). Die übrigen Konzept-Reiter bleiben als Vorschau.

### Technik
- Neue Datei `wartung.py` mit eigenem Speicher (`fenster_heizung_wartung`, Schema 1, automatische Sicherungskopien), neue WebSocket-Befehle `fenster_heizung/wt_get`, `wt_save` und `wt_act` (done, undo, del; Ändern nur für Administratoren).
- 8 neue Tests für Modul 15 (Abstände mit Monatsende und Schaltjahr, Ampel mit Vorwarnung und Kulanz, Eingaben prüfen, Anlegen/Ändern/Löschen mit Neustart, Erledigt mit Nachtrag und Rückgängig, kaputte Einträge, Reihenfolge, Diagnose ohne Namen).

## [2026.11.4b39] - 2026-11-21

**Modul 11 · Rauch- & Sicherheitsmelder** v0.9 Build 11 und Build 12 – Lücken auf dem Weg zu 1.0 geschlossen und Testwoche (Konzept „Modul 11 · Version 1.0“). Ab hier kommen bis 1.0 keine neuen Funktionen mehr dazu.

### Neu
- **Quellen-Wächter:** Fallen alle Melder einer Quelle gleichzeitig aus (ab 3 Meldern, zum Beispiel X-Sense-Cloud, Zigbee-Stick oder Z-Wave), kommt **eine** Meldung „Melder-Quelle ausgefallen“ statt einer je Melder. Die Übersicht zeigt dazu die Karte „Quelle ausgefallen“, das Protokoll und das Ereignis `fenster_heizung_sicherheit` (art `quelle_aus` bzw. `quelle_da`) nennen die Quelle. Kommt die Quelle zurück, gibt es einmal „Melder-Quelle wieder da“. Die Frage „Ausschalten?“ nach langer Funkstille wird für diese Melder nicht gestellt. Einstellungen → Batterie → „Quellen-Wächter“, standardmäßig an.
- **Wochen-Selbsttest:** Sonntags ab 18 Uhr prüft Modul 11, ob alle Melder erreichbar sind, die Batterien gut und Prüfung und Austausch im Plan. Nur Anzeige, das Modul schaltet nichts. Eine Mitteilung kommt nur bei Hinweisen, das Ergebnis steht immer im Protokoll und unter „Als Nächstes“. Mit „Jetzt prüfen“ unter Einstellungen → Prüfung sofort. Fällt der Test in die Ruhezeit, kommt die Mitteilung danach. Ausgeschaltete Melder zählen nicht.
- **Zwei neue Sensoren** (Gerät „Strom & Wärme · Rauch- & Sicherheitsmelder“): **Melder nicht erreichbar** (Anzahl, Namen und ausgefallene Quellen als Attribute) und **Letzter Alarm** (Zeitpunkt, Melder, Name und Raum als Attribute).
- **Dienste für eigene Automationen:** `fenster_heizung.sicherheit_quittieren` (wie „Verstanden“, optional nur ein Melder und eine Fehlalarm-Ursache), `fenster_heizung.melder_geprueft` (Prüfung eintragen, ein Melder oder alle) und `fenster_heizung.sicherheit_selbsttest` (Selbsttest sofort). Das Ereignis meldet zusätzlich `selbsttest`.
- **Meldungen:** neuer Schalter „Wochen-Selbsttest (nur bei Hinweisen)“.
- **Diagnose:** Modul 11 erscheint in den Diagnosedaten von Home Assistant (Geräte & Dienste → Strom & Wärme → Diagnose herunterladen) – Melder mit Zustand und Prognose, Stufen, Quellen-Wächter, Selbsttest, Fehlalarme, Einstellungen und die letzten 50 Ereignisse. Ohne Benachrichtigungsdienste, Kontaktperson, Name und Adresse, Lautsprecher und Hintergrundbild.
- **Anleitung_Modul11_Sicherheit.pdf** im Ordner docs (6 Seiten), README verlinkt.

### Geändert
- Modul 11 trägt in der Modul-Liste jetzt das Abzeichen **Vorabversion** statt „Beta“ (seit v0.9 Build 1 so vorgesehen).

### Behoben
- **Stufe 2 bis 4 trafen bei Meldern mit eigener Melderart die falschen Aktionen.** Wer die Art eines Melders von Hand gesetzt oder einen Melder ohne Geräteklasse hinzugefügt hat, bekam in Stufe 1 die richtigen Aktionen, ab Stufe 2 wurde er aber als „Sicherheitsmelder“ gelesen – Aktionen für zum Beispiel „Hitzemelder“ liefen dann nicht. Alle Stufen nutzen jetzt dieselbe Melderart.
- **Ein kurzer Fehlalarm galt als Prüfung.** Ein Alarm unter 2 Minuten wurde immer als Test per Testknopf eingetragen, auch wenn er als Fehlalarm quittiert war (Toast, Dampf). Jetzt zählt er dann nicht als Prüfung.
- **Alarm-Mitteilungen blieben auf den Handys stehen, wenn der Alarm von selbst endete.** Sie verschwinden jetzt auch dann, nicht nur nach „Verstanden“.
- **Die Kontaktperson erfuhr nicht, dass sich jemand kümmert.** War Stufe 4 erreicht, bekommt sie nach „Verstanden“ die Nachricht „Erledigt – jemand kümmert sich“ (mit Ursache, falls angegeben), endet der Alarm ohne Quittung eine Entwarnung. Ihre Alarm-Mitteilung wird entfernt.

### Technik
- 13 neue Tests für Modul 11 (Quellen-Wächter: Ausfall, Mindestzahl, ausgeschaltete Melder, Rückkehr, Einzelwarnung unterdrückt; Selbsttest: Zeitpunkt, einmal je Sonntag, Hinweise, Ruhezeit; letzter Alarm; Einstellungen) und für die Fehler aus der Testwoche (Melderart in den Stufen, Fehlalarm kein Test, Kontaktperson und Mitteilungen, Selbsttest in der Ruhezeit, Diagnose ohne persönliche Daten).
- Neuer WebSocket-Befehl `fenster_heizung/sf_selftest`, neue Datei `services.yaml`.

## [2026.11.4b38] - 2026-11-21

**Modul 14 · Dynamischer Stromtarif** v0.9 Build 1 – Vorabversion auf dem Weg zu 1.0 (letzter Schritt aus dem Konzept „Neue Optik & Technik bis v1.0“).

### Neu
- **„Lohnt sich dein Tarif?“** – neue Karte in Modul 14 für einen Monat oder ein Jahr (zum Blättern): **bezahlt** = dein Netzbezug je Stunde aus dem Haus-Energiebuch × Preis dieser Stunde aus der Preis-Historie, **wäre gewesen** = dieselben kWh × Vergleichs-Festpreis, dazu die **Ersparnis** in € und %. Balken je Tag (Ø Preis in Stufenfarbe) bzw. je Monat, Festpreis als Linie. Tage ohne Stundenwerte (älter als 62 Tage) werden mit Tages-kWh × Tagesschnitt geschätzt und blass gezeigt. Gerechnet wird mit dem Netzbezug, ohne Solarstrom und Akku.
- **Vergleichs-Festpreis** unter Einstellungen → Modul 14 → Preis & Stufen → „Tarif-Check“: Standard ist der Festpreis aus Haus › Preise & Tarif, eigener Wert (z. B. Angebot des alten Anbieters) und Grundgebühr-Unterschied je Monat möglich.
- **Kachel „Gespart im Monat“** und **Sensor „Ersparnis Monat“** (Gerät „Strom & Wärme · Stromtarif“, € mit bezahltem Betrag, kWh, Tagen und geschätzten Tagen als Attribute).
- **Wochenansicht** im Band „Heute und morgen“ (Umschalter 15 Min. · Stunden · Woche): letzte Tage, heute und morgen mit Tagesschnitt, günstigster und teuerster Zeit und negativen Preisen – aus der eigenen Preis-Historie.
- **Daten prüfen** im Reiter Quelle: Quelle mit Ersatzquelle, Auflösung, Preise für morgen, Lücken, Preis-Historie und Stundenwerte des Haus-Energiebuchs, jeweils grün, gelb oder rot.
- **Startseite:** Hinweis, sobald negative Strompreise für heute oder morgen bekannt sind, mit „Ansehen“ und „Später“.
- **Diagnose:** Modul 14 in den Diagnosedaten von Home Assistant (ohne Meldedienste).
- **Anleitung_Modul14_Stromtarif.pdf** im Ordner docs, README und Vorschaubild aktualisiert.

### Geändert
- Modul 14 trägt die Stufe **Vorabversion** (v0.9). Der Hinweis „Kommt mit v0.9“ am Seitenende entfällt.

### Behoben
- **Versions-Statistik: Nach einer Antwort im Popup und einem Neustart wurde nichts mehr gesendet.** Beim Start fehlte ein Import (`_ID_RE`), das Laden der gespeicherten Zustimmung brach mit einem Fehler ab – je nach Ablauf auch der Start der Integration an dieser Stelle. Seit 2026.11.4b27.

### Technik
- 10 neue Tests für Modul 14 (Tarif-Check stundengenau, geschätzte Tage und Grundgebühr, fehlende Preise und Stunden, Zeitumstellung, Monate, Woche, Lücken, Vergleichspreis, Dienst mit Daten prüfen und Diagnose), 1 Test für den Start der Versions-Statistik.
- Neuer WebSocket-Befehl `fenster_heizung/tarif_check` (per m/y, ref JJJJ-MM bzw. JJJJ).

## [2026.11.4b37] - 2026-11-21

**Modul 8 · Elektroauto & Wallbox** v0.9 Build 10 – Release-Kandidat für Version 1.0 (Stabil).

### Neu
- **Modus beim Anstecken:** Je Fahrzeug (und für das Gastfahrzeug) unter Fahrzeuge → „Beim Anstecken“: **Wie zuletzt**, **Sonne**, **Sonne + Netz** oder **Voll**. Jede neue Ladung startet mit diesem Modus, egal was zuletzt gewählt war – wer abends einmal auf „Voll“ stellt, lädt beim nächsten Anstecken wieder mit Sonne. Umstellen während der Ladung gilt bis zum Abstecken. Wird die Karte erst nach dem Anstecken angelegt oder „Wer lädt gerade?“ von Hand gewählt, greift die Einstellung, sobald klar ist, wer lädt. Ein Neustart von Home Assistant mit angestecktem Auto setzt den Modus nicht zurück. Ladeplan, Abfahrt aus dem Kalender und Schnellstart haben weiter Vorrang. Im Register „Laden“ steht ein Hinweis, das Protokoll nennt den vorherigen Modus. Vorhandene Fahrzeuge stehen auf „Wie zuletzt“ – es ändert sich nichts, bis du etwas anderes wählst.
- **Befehls-Rückmeldung:** Nach jedem Befehl prüft Modul 8, ob die Wallbox ihn übernommen hat, und sendet sonst erneut. Kommt ein Befehl nach drei Versuchen nicht an, steht das im Protokoll und es kommt eine Meldung („Wallbox reagiert nicht“, abschaltbar unter Meldungen). Wichtig vor allem bei „Laden aus“ am Ladelimit.
- **Veralteter Ladestand aus der Auto-Cloud:** Meldet sich der Ladestand-Sensor länger nicht (Standard 45 Minuten, einstellbar beim Fahrzeug unter „Ladestand gilt als veraltet nach“, 0 = aus) und lädt das Auto, rechnet Modul 8 mit dem letzten Wert plus der seither geladenen Energie weiter. Für das Ladelimit zählt der höhere Wert – lieber etwas früher stoppen als überladen.
- **Diagnose:** Modul 8 erscheint in den Diagnosedaten von Home Assistant (Geräte & Dienste → Strom & Wärme → Diagnose herunterladen) – Zustand, Einstellungen, Befehle und die letzten 50 Entscheidungen, ohne Adresse der Wallbox, Kartennamen, Personen, Kalender und Benachrichtigungsdienste.
- **Einrichtungs-Check erweitert:** Befehle an die Wallbox (heute übernommen / nicht angekommen), veralteter Ladestand mit Schätzung, Hausanschluss-Schutz (empfohlen bei 11- und 22-kW-Wallboxen) und das Ergebnis der Datenprüfung der Ladestatistik beim Start.
- **„Warum gerade so?“ bleibt erhalten:** Die letzten 200 Entscheidungen überstehen einen Neustart. „Mehr anzeigen“ zeigt bis zu 50, mit Filter Befehle, Fehler und Karten.

### Behoben
- **Modul 8: Ein nicht angekommener Befehl galt als „von Hand umgestellt“.** Kam z. B. „Laden aus“ am Ladelimit nicht bei der Wallbox an, hielt die Regelung das für eine Umstellung in der App und pausierte 30 Minuten – das Auto lud weiter. Jetzt zählt eine Abweichung erst als Handumstellung, wenn der letzte Befehl bestätigt wurde.

### Technik
- Regel-Simulator: 21 neue Tests spielen ganze Ladeabläufe mit einer nachgebauten go-e durch (Modus beim Anstecken, Befehls-Rückmeldung, veralteter Ladestand, offene Zugangskontrolle aus Build 8, Abstecken, Protokoll, Diagnose, Sichern und Wiederherstellen).

## [2026.11.4b36] - 2026-11-20

### Neu
- **Modul 8 (v0.9 Build 9): „Wer lädt gerade?“** – im Register „Laden“ unter „Wie soll geladen werden?“ lässt sich von Hand umstellen: **Automatisch** (Karte bzw. Fahrzeug „ohne Karte“), eines deiner Fahrzeuge oder **Gastfahrzeug**. Die Auswahl gilt bis zum Abstecken (sie darf auch vor dem Anstecken gesetzt werden) und zählt auch ohne Karte – „Nur mit Karte“ wartet dann nicht. Für das Gastfahrzeug gelten dessen Modus und Limit (Einstellungen → Fahrzeuge), die Ladung erscheint in der Statistik als „Gastfahrzeug“ und der Ladestand des eigenen Autos wird dafür nicht benutzt.
- **Gastfahrzeug auch beim Bearbeiten von Ladungen** – einzeln und bei „Fahrzeug ändern“ für mehrere Ladungen.

## [2026.11.4b35] - 2026-11-20

**Modul 20 · Abrechnungen** (Addon) v1.6 Build 1 – Grundgebühren und einmalige Gebühren.

### Neu
- **Grundgebühr für Wasser und Abwasser getrennt:** Im Preis von Wasser & Abwasser gibt es jetzt „Grundgebühr Wasser“ (Zählergebühr, mit Umsatzsteuer) und „Grundgebühr Abwasser“ (ohne Umsatzsteuer). Die bisherige Zählergebühr bleibt als Grundgebühr Wasser erhalten.
- **Grundgebühren pro Monat oder pro Jahr:** Im Preisdialog umschaltbar – für Wasser/Abwasser sowie Grundpreis und Messstellenbetrieb bei Strom und Gas. Beim Umschalten werden eingetragene Werte umgerechnet; die Vertragsansicht zeigt Jahresbetrag und Monatswert.
- **Einmalige Gebühren:** Im Vertrag unter „Einmalige Gebühren“ Datum, Betrag und Bezeichnung eintragen (z. B. Zählerwechsel, Mahngebühr; negativ = Gutschrift). Sie fließen am Datum in Kosten bisher, Hochrechnung, Guthaben/Nachzahlung, Monatskurve und Rechnungsprüfung ein und stehen auf der Karte („davon Zählerwechsel“), in der Vertragsansicht und in der Begründung. Bei der Einspeisung mindern sie die Vergütung.

## [2026.11.4b34] - 2026-11-20

**Modul 20 · Abrechnungen** (Addon) v1.5 Build 1 – Einspeisung mit Abschlägen und Balkonkraftwerk.

### Neu
- **Einspeisung mit Abschlägen:** Beim Einspeisevertrag lässt sich eintragen, was der Netzbetreiber überweist – fester Betrag monatlich, je Quartal oder **jeden Monat anders**. Bei wechselnden Beträgen trägst du je Monat den Eingang ein; künftige Monate schätzt Modul 20 aus der Vergütung des Monats und der bisherigen Auszahlungsquote. Daraus die Hochrechnung, ob mit der Abrechnung eine **Nachzahlung an dich** oder eine **Rückzahlung** kommt (mit Bandbreite) – auf der Einspeise-Karte, im Banner (Ring „ausgezahlt“, große Zahl), im Register Abschläge (erhalten statt bezahlt) und im Sensor „Ergebnis Einspeisung“.
- **Balkonkraftwerk am selben Zähler:** Im Einspeisevertrag unter „Anlagen an diesem Zähler“ Hauptanlage und Balkonkraftwerk mit Modulleistung eintragen und wählen, wie der Netzbetreiber rechnet: **Mischsatz nach Leistung** (§ 24 Abs. 3 EEG, Verhältnis der installierten Modulleistung, Steckersolargerät meist unentgeltlich) oder **fester Abzug in kWh je Jahr** laut Abrechnung. Vertrag, Karte, Jahreskurve und Hochrechnung rechnen damit.

### Behoben
- Einspeisung: Jahreskurve und Monatswerte heißen „Vergütung“ statt „Kosten“.

## [2026.11.4b33] - 2026-11-20

**Modul 20 · Abrechnungen** (Addon) v1.4 Build 1.

### Neu
- **Abschläge je Abrechnungsjahr wie in Modul 3:** Im Vertrag (Bearbeiten) je Abrechnungsjahr ein Betrag in €/Monat (leer = wie davor) und „Einzelne Monate anpassen“ mit allen zwölf Monaten (0 = ausgefallen). Hochrechnung, Empfehlung und Register Abschläge rechnen damit.
- **Brennwert bis 40 kWh/m³** (vorher 15) – für Flüssiggas (gasförmig etwa 25–28 kWh/m³).

### Behoben
- **Übernahme aus Modul 3:** Ein Grundpreis „pro Jahr“ unter 40 € wurde durch 12 geteilt – er gilt jetzt als Monatswert. Ein Brennwert über 15 wurde abgeschnitten, einzelne abweichende Abschlags-Monate fehlten. Schon übernommene Gasverträge werden beim Start einmal berichtigt (mit den Werten aus Modul 3 von vor der Übernahme); im Protokoll steht, was geändert wurde. Selbst korrigierte Grundpreise bleiben.
- **Datumsfelder im Vertrag:** Nach dem Auf- oder Zuklappen im Bearbeiten-Dialog konnte ein Datum zu „undefined.undefined.…“ werden und das Speichern scheiterte.

## [2026.11.4b32] - 2026-11-20

**Modul 20 · Abrechnungen** (Addon) v1.3 Build 1 – Daten aus den anderen Modulen. **Modul 17 · Müllabfuhr** 1.0.0 Build 2.

### Neu
- **Aus den Modulen übernehmen:** Ein Dialog sammelt, was die anderen Module schon wissen, und legt es mit einem Tipp an – Stromzähler Bezug und Einspeisung aus Modul 3 (Haus → Energiequellen) mit Sensor und bis zu 36 Monatsständen aus der Langzeitstatistik, Stromvertrag (Tibber dynamisch aus Modul 14 oder Festpreis aus den Haus-Werten), Einspeisevergütung aus den Haus-Werten, Gasvertrag und Gaszähler aus Modul 3 und Elektroautos aus Modul 8 (Akku, Kilometer-Sensor, Ladungen gleich verknüpft). Jeder Punkt lässt sich abwählen, Verträge werden mit den Zählern verknüpft. Knopf im Banner (mit Anzahl), in Verträge, auf leeren Karten und bei leeren Zählern und Fahrzeugen.
- **Gas-Hochrechnung wetterbereinigt (Modul 9):** Mit den Tagesmitteln des Außenfühlers vergleicht Modul 20 die Heizgradtage der letzten bis zu 120 Tage mit dem Klimanormal (DWD 1991–2020, Heizgrenze 15 °C). War es kälter als normal, wird der gemessene Verbrauch für die Hochrechnung heruntergerechnet, bei wärmerem Wetter hoch – nur der Heizanteil, die Grundlast für Warmwasser bleibt. Die Gas-Karte zeigt „wetterbereinigt“, unter „Warum?“ steht die Abweichung.
- **Wofür der Strom (Modul 4):** Neue Karte mit dem Strom je Gerät im laufenden Abrechnungszeitraum – kWh, Sonnenanteil, Kosten, Anteil am gemessenen Verbrauch und „übriges Haus“.
- **Müllabfuhr (Modul 17):** Neue Karte mit Grundgebühr (in den Einstellungen von Modul 20), Restmüll-Leerungen bisher und im Jahr, Zusatzleerungen × Gebühr aus Modul 17 und „Müll im Jahr“. Chip im Banner und Sensor `sensor.strom_waerme_abrechnung_kosten_muell`. Modul 17 gibt die Zahlen weiter, wenn „Leerungen zählen“ an ist.

### Geändert
- Modul 20: Knöpfe auf leeren Spartenkarten stehen untereinander.

### Hinweis
- Monatsstände, Außentemperatur und Gaszähler kommen aus der Langzeitstatistik von Home Assistant. Sensoren ohne Statistik (state_class) liefern keine Vergangenheit – dann geht es mit den Tagesständen ab heute weiter.

## [2026.11.4b31] - 2026-11-20

**Modul 20 · Abrechnungen** (Addon) v1.1 Build 1.

### Neu
- **Gas aus Modul 3 übernehmen:** Hat Modul 3 einen Gaszähler und Modul 20 noch keinen Gasvertrag, legt ein Tipp Vertrag und Zähler an – Arbeits- und Grundpreis mit allen Preisänderungen (brutto/netto und MwSt wie eingetragen, Grundpreis je Jahr wird auf den Monat umgerechnet), Abrechnungsjahr, Brennwert und Zustandszahl, Abschlag mit Abbuchungstag und abweichende Abschläge früherer Jahre. Der Zähler bekommt den Sensor aus Modul 3 und bis zu 36 Monatsstände aus der Langzeitstatistik von Home Assistant, damit stimmt die Hochrechnung sofort. Ein Dialog zeigt vorher, was übernommen wird. Knopf in Verträge, auf der leeren Gas-Karte der Übersicht und bei „Vertrag hinzufügen“.
- Danach rechnet Modul 3 mit dem Vertrag aus Modul 20 („Verwaltet in Modul 20“). „Vertragspreis an die Module geben“ aus stellt die alten Werte in Modul 3 wieder her.

### Hinweis
- Anbieter, Vertragsnummer, Laufzeit und Kündigungsfrist kennt Modul 3 nicht – nach der Übernahme unter „Bearbeiten“ eintragen. Einzeln abweichende Abschlags-Monate werden nicht übernommen. Ein Gassensor in kWh wird nicht als Zähler übernommen (Modul 20 braucht m³).

## [2026.11.4b30] - 2026-11-20

### Behoben
- **Einstellungs-Knopf oben rechts:** öffnet jetzt in jedem Modul die Haupt-Einstellungen. Bei Addons (zum Beispiel Modul 20 Abrechnungen, Modul 21 Saugroboter) und auf der Startseite öffnete er bisher nur die eigenen Einstellungen. Die bleiben erreichbar über Einstellungen → Module (Addons) bzw. Einstellungen → Darstellung → Startseite, bei Modul 20 auch über „Einstellungen“ in der Fußzeile.

## [2026.11.4b29] - 2026-11-20

**Modul 20 · Abrechnungen** (Addon) **v1.0 – Stabil.** Alle Stufen aus dem Konzept sind drin.

### Neu
- **Modul 20 ist stabil (v1.0).** Die Fußzeile zeigt die Stufe und verlinkt die neue **Anleitung** ([PDF, 11 Seiten](docs/Anleitung_Modul20_Abrechnungen.pdf)): Einrichten in vier Schritten, jedes Register, Sensoren und Energie-Dashboard, Einstellungen und häufige Fragen.
- **Einstellungen in den Haupt-Einstellungen:** Einstellungen → Module → Abrechnungen öffnet die Einstellungen direkt dort, ohne zu Modul 20 zu wechseln. Neu geordnet in „Preise und Anbindung“ (Vertragspreis an die Module, Sensoren, Vergleichspreis, Solarstrom), „Mitteilungen und Erinnerungen“, „Hochrechnung und Rechnungsprüfung“ und „Daten“ mit Sprung zu Verträgen, Zählern, Fahrtkosten und Vorräten.
- **Addons, die mit der Integration kommen** (Müllabfuhr, Licht, Abrechnungen …): Nach einem Update übernimmt der Addon-Store die neue Version beim Start selbst, statt „Update verfügbar“ anzuzeigen, obwohl sie schon läuft. Im Diagnose-Protokoll steht „… mit der Integration von v0.9 auf v1.0 aktualisiert“.

### Geändert
- Modul 20: „So geht es weiter“ entfällt; die Übersicht stapelt „Dynamisch oder fest?“ und „Home Assistant & Energie-Dashboard“ rechts.
- README: Modul 20 als Stabil 1.0 mit Link zur Anleitung.

### Behoben
- Modul 20: Knöpfe im Vertragskopf („Tarif vergleichen“, „Bearbeiten“) brechen nicht mehr um.

## [2026.11.4b28] - 2026-11-19

**Modul 20 · Abrechnungen** (Addon) v0.9 Build 1: „Feinschliff“ – Sensoren, Energie-Dashboard, Tarifwechsel-Rechner.

### Neu
- **Sensoren in Home Assistant** (Gerät „Strom & Wärme · Abrechnungen“, `sensor.strom_waerme_abrechnung_…`): Strompreis, Gaspreis (je kWh und je m³), Wasserpreis und Einspeisevergütung in €/kWh bzw. €/m³ – direkt fürs Energie-Dashboard („Entität mit dem aktuellen Preis verwenden“). Dazu erwartetes Ergebnis gesamt und je Sparte (Bandbreite und empfohlener Abschlag als Merkmale), nächster Termin, Fahrtkosten je Fahrzeug (€ je 100 km) und Vorrat je Lager (Bestand, reicht bis, bestellen bis). In den Einstellungen von Modul 20 abschaltbar.
- Dynamischer Strom: Der Preis-Sensor zeigt den Preis der aktuellen Stunde inkl. Aufschlag, damit das Energie-Dashboard stundengenau rechnet; der Ø 30 Tage steht als Merkmal dabei.
- **Karte „Home Assistant & Energie-Dashboard“** in der Übersicht: welcher Sensor wofür und ob das Energie-Dashboard ihn schon nutzt (nur lesen, Modul 20 ändert dort nichts).
- **Tarifwechsel-Rechner** (Sponsor Max): Angebot mit Arbeits- und Grundpreis, Bonus und Laufzeit gegen den laufenden Strom- oder Gasvertrag – mit deinem Jahresverbrauch aus der Hochrechnung, Jahr 1 mit Bonus, ab Jahr 2 ohne, Gleichstand-Arbeitspreis und „kündigen bis“. Alles andere in Modul 20 bleibt frei.
- Weniger Bewegung in Modul 20, wenn das Gerät „Bewegung reduzieren“ eingestellt hat.

### Hinweis
- Die neuen Sensoren erscheinen nach einem Neustart von Home Assistant.

## [2026.11.4b27] - 2026-11-19

**Versions-Statistik** (freiwillig, anonym): Popup beim ersten Start nach dem Update und Seite unter Einstellungen → System → Versions-Statistik.

### Neu
- **Popup mit Zustimmung:** Erscheint einmalig für Administratoren (nicht im Tablet-Modus). „Ja, teilnehmen“ und „Nein danke“ sind gleichwertig, Schließen zählt als „Nein“. Bis zum „Ja“ wird nichts gesendet und es gibt keine Kennung.
- **Nur diese Angaben:** Gesendet wird höchstens 1× pro Tag eine zufällige Kennung, die Versionsnummer, der Kanal (Stabil oder Beta) und welche Module eingeschaltet sind (nur Kurzzeichen wie `ww`, `en`, `gs`; eigene Erweiterungen nie). Eine gemeinsame Zustimmung gilt für alles. Nicht gesendet werden Name, Standort, Räume, Geräte, Sensorwerte, IP-Adresse (wird nicht gespeichert) und die Home-Assistant-Instanz-ID.
- **Einstellungen → System → Versions-Statistik:** Schalter, Stand (zuletzt gesendet, nächste Meldung), „Gesendete Daten ansehen“ mit der echten Meldung, „Jetzt senden“, „Kennung zurücksetzen“ und „Meine Daten auf dem Server löschen“. Ausschalten bittet den Server, die Kennung zu vergessen, und löscht sie hier.
- **Fehler bleiben still:** Ist der Server nicht erreichbar, läuft die Integration normal weiter und versucht es am nächsten Tag erneut.
- **Auswertung der Module:** Das Dashboard zeigt, wie viele Installationen welches Modul eingeschaltet haben.

## [2026.11.4b26] - 2026-11-19

**Modul 20 · Abrechnungen** (Addon) v0.7 Build 1: „Anbindung Module“ – die anderen Module rechnen mit deinen Verträgen.

### Neu
- **Dynamischer Stromvertrag mit Ø-Preis:** Hauptwert ist jetzt der Durchschnitt der letzten 30 Tage (dein Netzbezug je Stunde aus dem Energiebuch × Tibber-Stundenpreis + Aufschlag), „jetzt“ steht klein daneben. Effektivpreis, Banner und Preisdienst rechnen mit dem Durchschnitt, ein Hinweis nennt die Quelle. Ohne Energiebuch gilt vorerst der Preis der aktuellen Stunde. Modul 8 lädt weiter nach dem Stundenpreis.
- **Modul 3 · Gaszähler rechnet mit dem Gasvertrag:** Arbeits- und Grundpreis, Preisänderungen, Brennwert, Zustandszahl, Abrechnungsjahr und Abschlag kommen aus Modul 20; Modul 3 zeigt „Verwaltet in Modul 20“. Ausschalten oder Vertrag löschen stellt die alten Werte wieder her.
- **Modul 8 · Wallbox → Fahrtkosten:** Elektroauto oder Plug-in-Hybrid mit seinem Fahrzeug aus Modul 8 verknüpfen – jede Ladung zuhause erscheint automatisch mit Menge, Solaranteil und Kosten. Von Hand erfasste Ladungen zuhause zählen ab dann nicht doppelt.
- Einstellung „Solarstrom beim Laden zuhause“: kostenlos, entgangene Einspeisevergütung (Standard) oder Bezugspreis.
- Preisdienst-Karte „Angebunden“: Haus-Werte, Modul 3 und Modul 8 mit Status.

### Behoben
- **Modul 4 · Gerätedetail:** Der Ring um das Gerätebild ragte in Text und Kachel darunter (eine Regel der Geräteliste in den Einstellungen galt auch hier). Auf dem Handy steht der Ring jetzt zentriert über dem Namen.
- **Modul 4 · Programm-Kurve:** Lange Wartezeit am Anfang (Startverzögerung, Bereitschaft) wird ausgeblendet und darunter genannt, statt das Programm an den rechten Rand zu drängen. Abschnitts-Schilder („Aufheizen“, „Heizen 2“ …) überlappen nicht mehr.


## [2026.11.4b25] - 2026-11-19

**Modul 20 · Abrechnungen** (Addon) v0.5 Build 3: alle Sensor-Auswahlen wie beim Zähler.

### Neu
- **Kilometerstand beim Fahrzeug:** Vorschläge nur mit Gesamt-Kilometerständen des eigenen Fahrzeugs (Name oder Marke im Sensor, Wert passt zum letzten eingetragenen Kilometerstand). Unter „Nicht geeignet“ mit Grund: Reichweite, Monats-, Tages- und Fahrtenzähler, Sensoren eines anderen Fahrzeugs oder einer anderen Marke, der evcc-Ladepunkt bei Verbrennern. Ohne passenden Sensor kommt die Strecke wie bisher aus den Einträgen.
- **Füllstand beim Vorrat:** Vorschläge mit passender Art (Heizöl, Pellets, Salz …) und Abgleich mit dem Bestand. Unter „Nicht geeignet“: Akku- und Ladestände, Luftfeuchte, Geräte- und Tageswerte.
- Überall: gewählter Sensor oben mit Prüfung, Suche beim Tippen, Vorschläge mit Begründung.

### Behoben
- Kilometerstand-Sensoren in Meilen werden in km umgerechnet.

## [2026.11.4b24] - 2026-11-19

**Modul 20 · Abrechnungen** (Addon) v0.5 Build 2: neue Auswahl für den Sensor eines Zählers.

### Neu
- **Vorschläge statt langer Liste:** Beim Zähler stehen oben höchstens drei passende Sensoren mit aktuellem Wert und Begründung („passt zu deinem Stand 28.666 kWh“, „zählt fortlaufend“, „Bezug“). Vorgeschlagen werden nur fortlaufende Zählerstände mit der Einheit des Zählers und der richtigen Richtung (Bezug oder Einspeisung); am stärksten zählt, dass der Wert zu deinem letzten Ablesestand passt.
- **„Nicht geeignet“ mit Grund:** Tageszähler (setzen sich zurück), Prognosen, Momentanwerte, Erzeugung der Solaranlage, Einspeisung statt Bezug und Zähler einzelner Geräte (Schalter, Steckdose, Wallbox …) stehen eingeklappt darunter. Wählbar bleiben sie, dann mit Warnung.
- **Suche** über Name, Entitäts-ID, Gerät und Hersteller, filtert schon beim Tippen.
- **Gewählter Sensor oben** mit Prüfung: Hinweis, wenn er nicht passt oder in Home Assistant nicht mehr existiert; „Von Hand“ setzt ihn zurück.
- Addons können jetzt Tastatureingaben direkt verarbeiten (Suche ohne Neuzeichnen).

### Behoben
- **Zähler mit Sensor in Wh, MWh oder Litern:** Der tägliche Stand wird jetzt in kWh bzw. m³ umgerechnet, statt 1000-fach falsch gespeichert zu werden.

## [2026.11.4b23] - 2026-11-19

### Behoben
- **Modul 8 (v0.9 Build 8): Ladelimit wurde überfahren, das Auto lud bis 100 %.** Mit „Nur mit erkannter Karte regeln“ hat Strom & Wärme ohne erkannte Karte nichts an der Wallbox verändert. Ist in der go-e-App die Zugangskontrolle aber „Offen“, lädt die go-e auch ohne Karte – dann lief die Ladung ungeregelt bis 100 %, obwohl z. B. 65 % eingestellt waren. Jetzt liest Modul 8 die Zugangskontrolle der go-e mit: Ist sie offen oder lädt das Auto bereits ohne Karte, wird trotzdem geregelt – mit dem Fahrzeug „ohne Karte“ und dessen Ladelimit und Modus. Ein Hinweis im Register „Laden“ erklärt das; damit wirklich nur mit Karte geladen wird, die Zugangskontrolle in der go-e-App auf „Authentifizierung erforderlich“ stellen. Mit Kartenpflicht bleibt alles wie bisher.
- **Modul 8: Nachts geladene Ladungen zeigten 1–2 % Sonne.** Als Sonne zählte bisher der Überschuss am Netz-Sensor – nachts kam der aus dem Hausakku oder aus kleinen Messabweichungen zwischen Netz-Sensor und Wallbox. Jetzt zählt als Sonne höchstens, was die Solaranlage gerade erzeugt (Solar-Sensor aus den Haus-Werten, eine oder zwei Anlagen); ohne Solar-Sensor nach Sonnenuntergang nichts. Strom aus dem Hausakku zählt damit nicht mehr als Sonne.

### Neu
- **Modul 8: Sonnenanteil einer Ladung von Hand ändern** (Ladung bearbeiten → „Sonnenanteil“, mit Knopf „0 %“). Tageswerte und Kosten werden angepasst, die Änderung steht im Verlauf der Ladung – so lassen sich ältere Nachtladungen korrigieren.

## [2026.11.4b22] - 2026-11-18

**Modul 20 · Abrechnungen** (Addon) v0.3 „Übersicht & Prognose“ und v0.5 „Rechnungen“ – Modul 20 ist jetzt Beta.

### Neu
- **Banner mit der einen Antwort:** „+89 € voraussichtlich zurück“ über alle Sparten mit Abschlag, mit Bandbreite; rechts die Abrechnungs-Szene mit einem Ring je Sparte (wie viel die Abschläge decken).
- **Hochrechnung** bis zum Ende des Abrechnungszeitraums (Jahr, Quartal oder Monat): bisher gemessen, der Rest nach Monatsprofil (eigenes Vorjahr, sonst Standardprofil je Sparte), Preiswechsel und Bonus eingerechnet; ohne Ablesungen aus dem eingestellten Jahresverbrauch.
- **Spartenkarten 2.0** mit Deckungsbalken und Ergebnis in Worten, **Jahreskurve** Kosten gegen Abschläge mit Bandbreite (Monat antippen zeigt die Werte).
- **Register „Abschläge“:** Abschlag gegen Kosten je Monat bzw. Quartal, Empfehlung mit Begründung (aufgerundet auf ganze Euro, damit der Zeitraum bei ± 0 € endet), „Abschlag ändern“ ab einem Datum, „Zahlung buchen“ (0 € = ausgefallen, sonst Sonderzahlung); sind alle bezahlt, ein Vorschlag fürs nächste Jahr.
- **Dynamisch oder fest?** Netzbezug je Stunde (Haus-Energiebuch) × Tibber-Stundenpreis der letzten 30 Tage gegen einen festen Vergleichspreis; der eigene Ø Preis fließt in Kosten und Hochrechnung des dynamischen Vertrags.
- **Register „Rechnungen“:** Rechnung mit Beleg (PDF oder Foto, bis 3 MB, lokal unter /config/strom_waerme/belege), Prüfung in fünf Punkten (Verbrauch gegen eigene Messung, Gas-Umrechnung, Preise laut Vertrag, geschätzter Endstand, Abschläge), Brennwert, neuen Abschlag und Zählerstände übernehmen.
- **Register „Fahrtkosten“:** Elektroautos und Verbrenner mit Tanken, Laden zuhause/unterwegs, Kilometerstand und Fixkosten; € je 100 km, Verbrauch (Volltank zu Volltank), Vollkosten je km, Vergleich und Fahrt-Rechner.
- **Register „Vorräte“:** Heizöl, Pellets, Flüssiggas, Brennholz und Betriebsmittel; Bestand mit gleitendem Durchschnittspreis, Wärmepreis je kWh, Reichweite und „bestellen bis“.
- **Mitteilungen** (Einstellungen → Modul 20): Erinnerung am Stichtag mit Link direkt in die Eingabe, Mindestbestand erreicht (auf Wunsch als Eintrag in einer To-do-Liste).
- **Tags & Karten:** neue Aktionen „Zählerstand erfassen“, „Tankbeleg erfassen“ und „Vorrat: 1 entnommen“ (Modul 20).
- Direktlinks mit `?modul=` öffnen jetzt auch Addon-Module, die erst nach dem Kern geladen werden.

### Behoben
- Modul 20: Handy-Ansicht war zu breit, kleine Knöpfe in Listen hatten zu viel Abstand.

## [2026.11.4b21] - 2026-11-18

**Modul 11 · Rauch- & Sicherheitsmelder** v0.9 Build 10: „Anpassen“ in der Übersicht, Ereignisse kompakt.

### Neu
- **Anpassen:** Die Übersicht hat jetzt wie die anderen Module den Knopf „Anpassen“. Die Karten Kennzahlen, Abfahrt-Prüfung, Letzte 30 Tage, Ereignisse, Als Nächstes und Melder lassen sich am Griff verschieben und mit dem Auge ausblenden. „Zurücksetzen“ stellt die Standardanordnung wieder her.
- **Ereignisse kompakt:** Jedes Ereignis steht in einer Zeile mit Uhrzeit am Rand (heute nur die Zeit, sonst Datum und Zeit). Sichtbar sind die letzten 6, „Mehr anzeigen“ klappt bis zu 40 in einer scrollbaren Liste auf, „Weniger anzeigen“ räumt wieder auf.

### Behoben
- **Ereignisse zeigen Namen statt Entitäten-IDs:** „Geprüft: Rauchmelder 6“ statt „Geprüft: binary_sensor.rauchmelder_6_rauch“. Neue Einträge speichern den Namen, ältere werden beim Anzeigen umgewandelt.

## [2026.11.4b20] - 2026-11-18

**Modul 11 · Rauch- & Sicherheitsmelder** v0.9 Build 9: Durchgänge und Räume ohne eigene Wand im Grundriss.

### Neu
- **Durchgang:** Neues Werkzeug „Durchgang“ neben der Tür. Es öffnet die Wand ohne Türblatt, etwa zwischen Flur und Treppe oder zur Küche. Eine vorhandene Tür lässt sich im Bearbeiten-Feld zwischen „Tür“ und „Durchgang“ umstellen. Für den Fluchtweg ist ein Durchgang eine offene Lücke.
- **Raumrand gestrichelt:** Im Feld „Raum“ macht „Rand nur gestrichelt“ den Raum zur reinen Fläche mit Namen. Die Wände zeichnest du dann nur mit dem Wand-Werkzeug, es gibt keine doppelten Linien mehr. Ein gestrichelter Raum sperrt den Fluchtweg nicht, nur die gezeichneten Wände tun das. „Alle Räume der Etage“ stellt alle Räume der Etage auf einmal um.

## [2026.11.4b19] - 2026-11-18

**Modul 11 · Rauch- & Sicherheitsmelder** v0.9 Build 8: Ausgänge im Grundriss selbst markieren.

### Neu
- **Ausgang markieren:** Im Bearbeiten-Feld einer Tür gibt es „Innentür“ und „Außentür“, bei einer Treppe „Kein Ausgang“ und „Ausgang nach unten“. Sobald auf einer Etage etwas markiert ist, zählen nur noch die markierten Ausgänge für den Fluchtweg. Damit gilt im Obergeschoss die Treppe nach unten als Ausgang.
- **Türöffnung spiegeln:** Bei einer Tür gibt es „Öffnung spiegeln (innen/außen)“ und „Angel spiegeln (links/rechts)“. Der Bogen der Öffnung lässt sich so auf jede Seite und jede Angel stellen.
- **Kachel „Fluchtweg“:** zeigt die markierten Ausgänge, zum Beispiel „1 Außentür · 1 Treppe“. Ist nichts markiert, steht dort „kein Ausgang markiert“.

### Geändert
- **Ohne Markierung** gilt wie bisher die Raum-Erkennung. Ein nicht gezeichneter Flur lässt dabei jede Zimmertür wie eine Außentür aussehen. Das Markieren löst das genau.

## [2026.11.4b18] - 2026-11-18

**Modul 11 · Rauch- & Sicherheitsmelder** v0.9 Build 7: Test am Melder wird automatisch eingetragen.

### Behoben
- **Wartung:** Modul 11 trägt eine Prüfung jetzt selbst ein, auf zwei Wegen. Erstens, wenn die Test-Entität des Melders (zum Beispiel „Rauchmelder 3 Gerätetest“) ausgelöst wird, auch über „Test auslösen“ in der App oder per Automation. Zweitens, wenn der Melder auf „an“ geht und nach höchstens 2 Minuten wieder auf „aus“, also bei Druck auf den Testknopf am Gerät selbst. Beides wird direkt an der Zustandsänderung erkannt, ein Test zählt nur einmal. Im Jahresband erscheint der Haken, „zuletzt geprüft“ wird aktualisiert, und das Protokoll zeigt „Test erkannt und eingetragen“. Nach dem Update Home Assistant neu starten.

## [2026.11.4b17] - 2026-11-18

**Modul 11 · Rauch- & Sicherheitsmelder** v0.9 Build 6: Test am Melder wird erkannt.

### Behoben
- **Wartung:** Drückt man den Testknopf am Melder, wird das Ende des Alarms jetzt sofort erkannt. Dauert der Alarm höchstens 2 Minuten, trägt Modul 11 die Prüfung selbst ein (Haken im Jahresband, „zuletzt geprüft“, Eintrag im Protokoll). Vorher wurde das Ende erst beim nächsten Minutentakt bemerkt, und ein kurzer Test blieb ohne Haken. Nach dem Update Home Assistant neu starten.

## [2026.11.4b16] - 2026-11-18

**Modul 11 · Rauch- & Sicherheitsmelder** v0.9 Build 5: Räume im Grundriss sind nicht mehr nur Rechtecke.

### Neu
- **Raumformen:** Im Feld „Raum“ gibt es Kacheln für Rechteck, L-, T-, U-Form und Frei. Eine Form lässt sich danach über Breite und Höhe skalieren und um 90° drehen.
- **Ecken bearbeiten:** Beim gewählten Raum lassen sich alle Ecken ziehen. Ein „+“ auf einer Kante fügt eine Ecke hinzu (bis 16). Tippt man eine Ecke an, stellt man x und y genau ein oder löscht sie (mindestens 3 bleiben).
- **Fluchtweg, Abdeckung und Melder-Zuordnung** nutzen die echte Raumform: Wände folgen den Ecken, ein Melder zählt nur im Raum, wenn er wirklich darin liegt, Türen zum Außenbereich werden korrekt erkannt, und Türen rasten auch an schrägen Kanten ein.

### Behoben
- **Zurück aus einer anderen App:** Die Daten von Modul 11 verschwanden zunächst. Beim Zurückkehren lädt das Modul jetzt sofort neu, behält bis dahin den letzten Stand und versucht es bei einem Verbindungsfehler automatisch noch einmal.

### Geändert
- **Melder-Seite:** Die Liste „Ausgeblendet“ ist entfernt. Melder hinzufügen geht über das Suchfeld „+ Melder (Binärsensor) hinzufügen“.

### Hinweis
- Bestehende Pläne bleiben unverändert, Räume ohne Eckpunkte sind weiter Rechtecke. Die Form wird sauber geprüft gespeichert (Eckpunkte ganzzahlig, 3 bis 16, mit Fläche).

## [2026.11.4b15] - 2026-11-18

**Modul 11 · Rauch- & Sicherheitsmelder** v0.9 Build 4: zwei Anzeigefehler auf dem Tablet.

### Behoben
- **Grundriss bearbeiten:** Das Feld eines gewählten Raums, einer Wand oder eines Melders war auseinandergezogen (Name, Breite, Höhe und Raum-Auswahl nebeneinander, Knöpfe am Rand abgeschnitten). Ursache war ein doppelt vergebener Stilname der neuen Auswahl-Seite. Das Feld steht wieder sauber untereinander.
- **Batterie-Verlauf:** Das Wort „heute“ wurde bei vollem Akku oben abgeschnitten, und die Grafik hatte viel leeren Platz. Oben ist jetzt Rand, und die Höchstbreite ist kleiner.

## [2026.11.4b14] - 2026-11-18

**Modul 11 · Rauch- & Sicherheitsmelder** v0.9 Build 3: Melder-Seite auf großen Bildschirmen.

### Behoben
- **Batterie-Verlauf zu groß und Schrift verdeckt:** Auf Tablet und Rechner wurde der Verlauf über die volle Breite gezogen, die Beschriftung wuchs mit und überdeckte die Linie. Die Grafik hat jetzt eine feste Höchstbreite. Dabei fiel auf, dass eine neue Stilregel der Melder-Seite die Linienfarbe des Verlaufs überschrieben hatte; auch das ist behoben.
- **Eingebaut am:** Das Datum öffnete das Monatsrad des Geräts, das beim Antippen wieder verschwand. Jetzt steht direkt auf der Seite eine kleine Kalender-Karte: Jahr mit Pfeilen, darunter die zwölf Monate zum Antippen, dazu „Datum entfernen“. Zukünftige Monate sind gesperrt.

## [2026.11.4b13] - 2026-11-18

**Modul 11 · Rauch- & Sicherheitsmelder** v0.9 Build 2: **neue Menüstruktur ohne Aufklappmenüs und Popups**.

### Geändert
- **Neuer Reiter „Melder“:** Alle Melder nach Etage gruppiert, mit Status, Batterie-Balken und Zeile zum Hinzufügen. Ausgeblendete Melder stehen darunter und lassen sich wieder einblenden.
- **Melder-Seite statt Fenster:** Ein Melder öffnet jetzt eine eigene Seite mit „Zurück“ (Zustandsring, Batterieverlauf, Prüfung, Bearbeiten). Art, Etage, Batterie-Typ, Austausch und Prüfintervall wählst du mit Kacheln und Chips statt Auswahlmenüs.
- **Einstellungen mit Bereichs-Reitern:** Melder, Alarm, Aktionen, Batterie, Prüfung, Meldungen, Abfahrt und Aussehen. Es ist immer nur ein Bereich sichtbar. Das frühere Einstellungs-Fenster entfällt (außer im Modus „Karten wie bisher“).
- **Geräte-Auswahl als Seite:** Aktion, Batterie-Sensor, Test-Knopf, Außentemperatur, Lautsprecher und weitere Auswahlen öffnen eine Seite mit Suche statt eines Aufklappmenüs. Neue Aktionen gelten standardmäßig für jeden Alarm.
- **Grundriss:** Melder und Raum-Verknüpfung im Bearbeiten-Modus nutzen dieselbe Auswahl-Seite bzw. Chips.
- Werte wie Erinnerung, Batterie-Grenze und Frost-Grenze stellst du mit Chips ein.

## [2026.11.4b12] - 2026-11-18

**Modul 11 · Rauch- & Sicherheitsmelder** steigt auf **v0.9** (Vorabversion): Einstellungen und Auswahlmenüs in der neuen Optik.

### Geändert
- **Einstellungsfenster:** Jeder Abschnitt (Welche Melder, Bei Alarm, Batterie und Erreichbarkeit, Prüf-Erinnerung, Benachrichtigung, Senden an) ist jetzt eine Karte mit Icon, wie in den Reitern. „Test senden“ und „Fertig“ bleiben beim Scrollen unten sichtbar.
- **Auswahlmenüs:** Alle Auswahlfelder im Modul (Art, Etage, Batterie-Typ, Austausch nach, Prüfen alle, Melder im Grundriss) haben ein einheitliches Aussehen mit Pfeil, abgerundeten Ecken und türkisem Fokusrand. Auswahl-Chips und Aktions-Karten sind runder.

## [2026.11.4b11] - 2026-11-18

Testversion für **Modul 11 · Rauch- & Sicherheitsmelder** (v0.8, Build 5): **roter Alarm beim Zurückwechseln in die App**.

### Behoben
- **Alarm-Bild blitzt beim App-Wechsel auf:** Direkt nach dem Zurückkehren in die App, noch bevor das Modul seine Melderliste vom Server hatte, las das Panel die Melder selbst aus den Rohdaten und zeigte dabei auch Warndienst-Sensoren („… Warnung 1/2“) als Alarm. Jetzt gibt es in dieser kurzen Phase gar keinen Alarm aus Rohdaten; die Ersatzliste (nur bei Serverfehler) lässt Warndienste und ausgeschlossene Sensoren ebenfalls aus.

## [2026.11.4b10] - 2026-11-18

Testversion für **Modul 11 · Rauch- & Sicherheitsmelder** (v0.8, Build 4): **Warnmeldungen lösen keinen Vollbild-Alarm mehr aus**.

### Behoben
- **Alarm-Bild beim Wechsel zurück in die App:** Beim Zurückkehren aus einer anderen App blitzte kurz der rote Alarm auf („… Warnung 1“, Sicherheitsmelder). Ursache: ein Warndienst-Sensor (z. B. NINA) wurde als Melder behandelt. Warndienste zählen jetzt nie als Melder, auch nicht, wenn sie früher von Hand hinzugefügt wurden. Zusätzlich werden Sensoren, deren Name nach „Warnung“/„Unwetter“ klingt, automatisch ausgelassen.

## [2026.11.4b9] - 2026-11-18

Testversion für **Modul 11 · Rauch- & Sicherheitsmelder** (v0.8, Build 3): **PDF-Knöpfe in der App behoben** und **Grundriss 2.0**.

### Neu
- **Fluchtweg über die Wände des Plans:** Das Modul sucht den kürzesten Weg vom Melder durch Türen zur nächsten Außentür und zeichnet ihn samt Länge in Metern ein (auch im Alarmfenster). Ohne Außentür oder ohne freien Weg gibt es einen Hinweis.
- **Maßstab:** Breite des Plans in Metern einstellbar (10/15/20/30 m); Reichweiten und Wegstrecken stimmen damit.
- **Abdeckung & Plan-Prüfung:** Kacheln zeigen Räume mit/ohne Melder und Melder ohne freien Fluchtweg.
- **Melder-Halos** und Raumtönung nach Zustand, Melderliste neben dem Plan.
- **Bearbeiten:** Rückgängig/Wiederholen, Mehrfachauswahl (gemeinsam verschieben, duplizieren, löschen), Einrasten an Wänden und Türen, Raum-Verknüpfung.

### Behoben
- **Abfahrt-Prüfung:** Die Anwesenheit zeigte „2 von 3 zu Hause“, obwohl niemand da war. Sie zählt jetzt wie Modul 6 (erkannter Standort, nur zählende Personen; bei „Abwesend“/„Urlaub“ alle unterwegs).
- **Modul 11 · Wartung → Nachweis:** „PDF erstellen“, „Als Datei laden“ und „Sicherheitsbericht“ taten in der Home-Assistant-App auf dem Handy nichts, weil dort weder Drucken noch ein Download aus dem Panel möglich ist. Das Prüfprotokoll und der Sicherheitsbericht sind jetzt **echte PDF-Dateien** (A4, Tabelle, Seitenzahl, Unterschriftszeile beim Prüfprotokoll). Auf Handy und Tablet öffnet sich das Teilen-Menü (Dateien, Drucken, Mail, Nachrichten), am Rechner startet ein Download. „Als Datei laden“ liefert weiter die HTML-Seite auf demselben Weg.

## [2026.11.4b8] - 2026-11-18

Testversion für **Modul 11 · Rauch- & Sicherheitsmelder** (v0.8, Build 2): **alle vier Reiter in der neuen Optik**.

### Geändert
- **Modul 11 · Übersicht:** Neue Verteilung ohne Lücke: links Abfahrt-Prüfung und Ereignisse, rechts „Letzte 30 Tage“ und die neue Karte **„Als Nächstes“** (Batterie, Prüfung, Tausch, nach Dringlichkeit). Karten haben ein Symbol-Kästchen im Kopf.
- **Modul 11 · Grundriss:** Drei Kennzahl-Kacheln (Melder der Etage, Abdeckung der Räume, Fluchtweg), Legende der Farben und rechts eine **Melderliste der Etage** mit Status. Antippen zeigt die Details; bei Alarm steht die Alarm-Karte oben.
- **Modul 11 · Wartung:** Vier Kennzahlen oben (nächste Prüfung, Tausch fällig, Batterie bald, Einkauf). Die Lebensdauer steht als **Karten nebeneinander** statt als lange Liste, die Einkaufsliste darunter.
- **Modul 11 · Einstellungen:** Neue **Sprungleiste** (Melder, Alarm & Stufen, Abfahrt, Allgemein, Aussehen). „Alarm & Stufen“ steht jetzt rechts oben unter der Melder-Auswahl, „Aussehen“ am Ende. Schaltet man „Karten wie bisher“ ein, bleibt die alte Anordnung.

## [2026.11.4b7] - 2026-11-18

Testversion für **Modul 11 · Rauch- & Sicherheitsmelder** (v0.8, Beta): **Ausgeschaltete Melder** und **Alarm mit Stufen und „Verstanden“**.

### Neu
- **Modul 11 · Ausgeschaltete Melder:** Ein Melder, den du abgebaut oder abgeschaltet hast, löst keine Warnungen mehr aus (Nicht erreichbar, Batterie, Prüfung, Lebensdauer). Im Detailblatt gibt es den Schalter **Ausgeschaltet** für 7 Tage, 30 Tage oder dauerhaft, der Melder erscheint grau und zählt nicht bei den Kennzahlen. **Löst er trotzdem aus, kommt der Alarm immer.** Wird ein so ausgeschalteter Melder wieder erreichbar, schaltet er sich selbst ein und meldet das einmal.
  - **Frage nach langer Funkstille:** Meldet sich ein Melder 7 Tage nicht (einstellbar 1 bis 60), kommt einmal „Wirkt ausgeschaltet. Ausschalten?“ als Karte oben und als Mitteilung, statt täglich „Nicht erreichbar“. Unter Einstellungen → Alarm & Stufen lässt sich das auf „Selbst ausschalten“ oder „Immer warnen“ (wie bisher) stellen.
- **Modul 11 · Alarm mit Stufen und „Verstanden“:** Wenn niemand reagiert, steigert sich der Alarm. **Der erste Alarm wird nie verzögert.**
  - **Stufe 1 Melden** (sofort): kritische Mitteilung mit Knopf „Verstanden“ direkt in der Mitteilung, eigene Aktionen, Protokoll.
  - **Stufe 2 Haus vorbereiten** (nach 10 s, an): Aktionen mit „Wann: Stufe 2“, zum Beispiel Licht an, Rollläden auf, Lüftung aus.
  - **Stufe 3 Alle informieren** (nach 60 s, aus): Mitteilung an alle und Durchsage über einen Lautsprecher (Sprachdienst wählbar).
  - **Stufe 4 Hilfe holen** (nach 5 Min., aus): Mitteilung an eine Kontaktperson mit Knopf „112 anrufen“, Wiederholung alle 2 Minuten bis „Verstanden“.
  - **Alarm-Ansicht** auf Handy, Tablet-Wand und im Panel: großer Knopf „Verstanden“, die Stufen mit Zeit, **Fehlalarm-Gründe** (Toast, Dampf, Test) und „112 anrufen“. Das Wandtablet wird geweckt.
  - **Fehlalarm-Hilfe:** Löst ein Melder oft aus, steht im Detailblatt ein Tipp (versetzen oder Hitzemelder). Das Modul verzögert nie von selbst.
  - **Fluchtweg:** Im Grundriss zeigt eine grüne Linie vom alarmierenden Melder zur nächsten Tür auf der Etage, mit dem Hinweis „Plan prüfen“.
- **Modul 11 · Behoben:** Warndienste wie NINA oder DWD (Binärsensoren der Klasse „Sicherheit“) wurden als Melder erkannt und lösten einen Alarm auf der Startseite aus. Sie werden jetzt übersprungen. Der Alarm auf der Startseite nennt zudem die echte Melderart statt immer „Rauchmelder“.
- **Modul 11 · Sicherheitsbericht (Sponsor-Extra):** Eine Seite für die letzten 90 Tage mit Kennzahlen, jedem Melder (Zustand, Batterie, Prognose, Prüfung, Fehlalarme) und den Alarmen mit Quittierung, zum Drucken oder als PDF (Wartung → Nachweis).
- **Modul 11 · Sensoren und Ereignis für eigene Automationen** (Gerät „Strom & Wärme · Rauch- & Sicherheitsmelder“): Sicherheit Status (ruhig, hinweis, alarm), Sicherheit Alarme, Melder Batterie (niedrigste), Melder nächste Prüfung. Das Ereignis `fenster_heizung_sicherheit` meldet `art` (alarm, stufe, verstanden, ende, offline), `melder`, `name` und `raum`.

### Geändert
- Aktionen für den Alarm haben das Feld „Wann“ (Sofort oder Stufe 2 bis 4). Bestehende Aktionen laufen weiter sofort.
- Die Wiederholung „Alarm läuft noch“ endet mit „Verstanden“.
- Der Speicher von Modul 11 hat jetzt die Schema-Version 3 (Stufen, Ausgeschaltet, Fehlalarme). Ältere Stände werden ohne Verlust übernommen.
- Neue Tests für Ausgeschaltet, Stufen, „Verstanden“ und die Sensoren. Die Tests von Modul 11 stören die anderen Testdateien nicht mehr.

## [2026.11.4b6] - 2026-11-18

### Neu
- **Modul 17 · Müllabfuhr ist stabil (v1.0, Addon).** Vier Stufen auf einmal:
  - **v0.6 Erinnern:** **Knöpfe in der Meldung** der Home-Assistant-App („Steht draußen“, „Später“, „Wieder drin“), **Erinnerung am Morgen** des Abholtags (nur wenn die Tonne noch nicht draußen steht), **Tonne reinholen** nach der Abholung mit Meldung, Licht mit wählbarer Helligkeit, wechselnder Farbe bei mehreren Tonnen und danach **wieder wie vorher**, große Karte auf dem **Wandtablet**.
  - **v0.8 Haushalt:** **Wer ist dran?** (Personen im Wechsel je Abholung oder Woche, Meldung an die Person, die dran und zu Hause ist, Tauschen mit einem Tipp), **Diesmal nicht** (Leerung auslassen), **Verlauf** je Abholung (wann, wie, wer), **Kosten** wahlweise nur für Tonnen, die draußen standen, Hinweis vor dem **Urlaub** (Modul 1), bei **Sturm** wahlweise erst morgens erinnern (Modul 9), Hitze-Tipp für die Biotonne.
  - **v0.9:** **Jahresübersicht** je Abfallart, **Vorrat Säcke** mit Meldung, **Labs „Automatisch erkennen“** (Sensor an der Tonne oder am Stellplatz), Ereignis `strom_waerme_muell`.
  - **v1.0:** **Echte Entitäten** im Gerät „Strom & Wärme · Müllabfuhr“: nächste Abholung, Tage je Abfallart, Vorrat, Binärsensoren „Tonne rausstellen“ und „Tonne reinholen“ (Entitäts-IDs `…strom_waerme_muell_…` wie bisher).
- **Startseite:** Hinweise für „Reinholen“ (mit „Wieder drin“), Sondertermine, Urlaub und Vorrat.
- **Tags & Karten:** neue Aktion „Tonne ist wieder drin“; Scans landen als „per Tag“ im Verlauf.
- README: Abschnitt „Modul 17 im Detail“.

### Geändert
- Neue Plattform **binary_sensor** für die Integration. Nach dem Update Home Assistant einmal neu starten.

### Behoben
- Modul 17 auf dem Handy: Die 14-Tage-Leiste machte die Seite zu breit, Banner und Knopf wurden abgeschnitten.

## [2026.11.4b5] - 2026-11-17

Testversion für **Modul 11 · Rauch- & Sicherheitsmelder** (v0.7, Beta): Stufe 1 (Technik) und Stufe 2 (Neue Optik) aus dem Konzept. Alarme, Aktionen und Einstellungen arbeiten wie bisher.

### Neu
- **Modul 11 · Neue Optik (v0.7):**
  - **Haus-Szene im Banner:** das Haus im Schnitt mit jedem Melder an seinem Platz (Etage nach deinem Grundriss). Der Zustand steht als Farbe am Melder, bei Alarm mit Rauch und Ringen im Raum.
  - **Fünf Kennzahl-Kacheln** (Alarme, Batterien, Erreichbar, Prüfung, Lebensdauer) statt der Text-Ampel und eine **Zeitleiste der letzten 30 Tage** mit Alarmen, Batterie, Ausfällen und Prüfungen.
  - **Melder-Karten 2.0** ohne Farbbalken und Rahmen: HD-Symbol mit LED, Wort für den Zustand, Batterie-Ring. Ein Tipp öffnet das **Detailblatt** mit Batterie-Verlauf und Prognose, „Geprüft“ und „Batterie getauscht“.
  - **Wartung:** Jahresband mit Prüfungen und Batterietausch je Melder, Batterie-Prognose, Nachweis als Jahresprotokoll.
  - Die große Beta-Box ist eine schmale Zeile, die sich wegtippen lässt und mit einer neuen Version wiederkommt.
  - **Schalter „Karten wie bisher“** unter Einstellungen → Modul 11 bringt die Darstellung von v0.5 zurück.
- **Modul 11 · Batterie-Prognose (v0.6):** Gerade durch den Verlauf seit dem letzten Tausch (ein Sprung nach oben um 20 Punkte gilt als Tausch). Dazu eine **frühe Erinnerung**, wenn die Schwelle „Batterie schwach“ innerhalb des Vorlaufs erreicht wird.

### Geändert
- **Modul 11 · Technik (v0.6):** Fällt ein Melder aus oder kommt zurück, wird sofort geprüft statt beim nächsten Takt (Takt jetzt 60 s). Die Zuordnung Gerät → Batterie und Testknopf wird nur noch bei Änderung im Entitäten-Register neu gelesen. **Grundriss und Hintergrundbild** liegen in einem eigenen Speicher (mit Sicherung, auch in der Sicherung auf den Heim-Server), der Speicher hat eine Schema-Version; beim ersten Start übernimmt Modul 11 den Plan einmalig und legt vorher eine Kopie an. Neue Tests für Modul 11.
## [2026.11.4b4] - 2026-11-17

### Neu
- **Modul 17 · Müllabfuhr v0.5 (Addon, jetzt Beta).** Drei Stufen aus dem Konzept auf einmal:
  - **v0.2 Fundament:** Liste **„Nicht erkannt“** für Kalendertermine ohne Abfallart (zuordnen, als neue Art anlegen oder ignorieren), **„Später erinnern“** übersteht einen Neustart (Dauer 30 Min. bis 3 Std.), **Termine zwischengespeichert** (nach einem Neustart sofort da, Hinweis, wenn der Kalender nicht antwortet), **Abholzeit je Abfallart** statt fest 12 Uhr, Uhrzeit als Stunde/Minute-Felder (kein Absturz in der Mac-App), eigene Tests.
  - **v0.3 Freie Abfallarten:** bis zu **10 Abfallarten** mit Name, Bild, Farbe, Erkennungswörtern, Abholzeit und Erinnerung, **Vorlagen** Glas, Grünschnitt, Sperrmüll, Schadstoffmobil, Weihnachtsbaum oder eigene, **Vorwarnung für Sondertermine** (2, 3, 5 Tage oder 1 Woche vorher), **bis zu drei Kalender**, neue Bilder je Abfallart. Die vier bisherigen Tonnen werden beim Update einmalig übernommen, die alten Einstellungen bleiben zusätzlich gespeichert.
  - **v0.5 Neue Optik:** **Straßen-Szene** als Banner (fällige Tonnen am Bordstein, Müllwagen am Abholtag, Tag und Nacht, „Alle stehen draußen“), **Kacheln 2.0** mit Ring bis zur Abholung, **14-Tage-Leiste**, **Kalender** mit Farbleisten, Blättern und **Jahresansicht**, Leerzustand mit drei Schritten, Schalter **„Optik wie bisher“** und Bewegung Aus / Dezent / Voll.
- **Morgen-Briefing (Sponsor Max):** Der Baustein „Müll“ meldet wieder heute, morgen und Sondertermine.
- **Tags & Karten:** „Tonne ist draußen“ kennt alle Abfallarten aus Modul 17.

### Geändert
- Modul 17 kann ein eigenes Banner mitbringen (für die Straßen-Szene). Ältere Addon-Versionen zeigen weiter das bisherige Banner.

## [2026.11.4b3] - 2026-11-17

### Behoben
- **Modul 9 · Wetterkarte ohne Warnfarben:** Die Karte blieb grün, obwohl der DWD Warnungen hatte. Die Fläche der Landkreise lag über den Warnungen und dem Regenradar und deckte sie zu. Jetzt liegen die Ebenen wie im Beispiel des DWD: Hintergrund, Landkreise, darüber Warnungen bzw. Radar.

## [2026.11.4b2] - 2026-11-17

### Behoben
- **Modul 9 · Wetterkarte flackerte:** Das Kartenbild wurde bei jedem Neuaufbau der Seite (alle paar Sekunden, z. B. bei neuen Sensorwerten) neu angelegt und neu geladen. Jetzt bleibt das Bild stehen und wird nur alle 5 Minuten erneuert; bis der neue Stand geladen ist, bleibt der alte sichtbar.

## [2026.11.4b1] - 2026-11-17

### Neu
- **Modul 9 · Wetter & Warnungen ist stabil (v1.0).**
  - **Wetterkarte des Deutschen Wetterdienstes:** neue Karte im Modul mit **Warnungen** (Warnstufen der Gemeinden, Kreisgrenzen) oder **Regenradar** (Niederschlagsradar, alle 5 Minuten neu) rund um dein Zuhause, das als Punkt eingezeichnet ist. Ausschnitt **Umgebung**, **Region** oder **Deutschland**, Legende mit den Stufenfarben, Stand und Quelle, Link zur Warnkarte auf dwd.de. Das Bild lädt dein Browser direkt bei maps.dwd.de (Web-Mercator, nicht verzerrt). Liegt dein Zuhause außerhalb Deutschlands, gibt es einen Hinweis. Ein- und ausschaltbar mit Standard-Ansicht unter Einstellungen → Modul 9 → Warnungen → Wetterkarte.
  - **Rückblick:** letzte 30 Tage (mit Tagesleiste in Stufenfarben) und laufendes Jahr – Sturm-, Gewitter-, Hagel-, Frost/Glätte- und Hitzetage, Tage mit amtlicher Warnung, ausgelöste Aktionen, stärkste Böe, kältester und wärmster Wert, Regenmenge (mit Regenmesser). Gezählt wird ab dem Update.
  - **Verlauf nach Tagen** gruppiert (Heute, Gestern, Wochentag).
- **Modul 14 · Stromtarif v0.6 – Tarif-Dienst.** Ein neuer Hintergrund-Dienst hält die Strompreise **heute und morgen** als Zeitreihe:
  - **Quellen** in einstellbarer Reihenfolge: **Tibber direkt** (Einstellungen → Integrationen) → Preis-Sensor (Tibber, Nord Pool, EPEX Spot, aWATTar, Octopus, Energi Data Service – Formate und Einheiten werden erkannt) → Festpreis aus den Haus-Werten. Fällt eine Quelle aus, springt die nächste ein.
  - **Viertelstunden** werden gespeichert, Stunden nur zur Anzeige gemittelt; **23- und 25-Stunden-Tage** (Zeitumstellung) stimmen.
  - **Endpreis** für reine Börsenpreise (Aufschläge + MwSt.), optional **zeitvariables Netzentgelt** (§ 14a).
  - Stufen günstig / normal / teuer / negativ nach dem **Tagesschnitt**, bestes Fenster ab jetzt, günstigste Stunden, **Preis-Historie** 400 Tage.
  - **Push statt Abfrage:** neue Preise und eine neue Viertelstunde kommen von selbst ins Dashboard. Der Preisdienst für die anderen Module nutzt die Zeitreihe.
- **Modul 14 · Stromtarif v0.7 – Neue Optik.** Preisband-Banner (Preis jetzt, Stufe, „bis wann“, Band bis zum Ende der bekannten Preise mit Jetzt-Linie, Schnitt und bestem Fenster), Kacheln 2.0 (Jetzt, Nächste Stunde, Bestes Fenster, Morgen, Teuerste Zeit bzw. Negativ), **Heute und morgen** als ein Band mit Umschalter 15 Min./Stunden und Sonne aus Modul 16, günstigste Stunden ab jetzt, Herkunft der Preise, neue Einstellungen (Quelle · Preis & Stufen) und Startseiten-Kachel mit Mini-Band. Die drei Platzhalter entfallen.
- **Modul 14 · Stromtarif v0.8 – Fenster je Gerät und Preisalarm.**
  - **Bestes Fenster je Gerät** für die Geräte aus Modul 4: Laufzeit (Median der letzten Läufe), Energie je Lauf und Verbrauchsverlauf werden gelernt; bewertet wird Preis × Verbrauch, erwartete Sonne zählt mit dem Einspeisepreis. Angezeigt werden Startzeit, Ø Preis und Ersparnis gegenüber „jetzt starten“; je Gerät „fertig bis“ und „frühestens ab“. **Erinnern** meldet sich zur Startzeit. Kühlschrank & Co. sind von Haus aus aus.
  - **Preisalarm:** unter einer Grenze, über einer Grenze, negativer Preis, Preise für morgen da – je Zeitraum höchstens einmal, auf Wunsch 15/30/60 Min. vorher, mit Ruhezeit (Standard 22–7 Uhr) und Test-Knopf. Ohne eigene Auswahl gelten die Meldedienste aus Modul 4. Die letzten Meldungen stehen in der Karte.
  - **Sensoren** (Gerät „Strom & Wärme · Stromtarif“): Strompreis jetzt, Stufe, nächste günstige Zeit, günstigstes Fenster, Ø heute und Ø morgen – dazu das Ereignis `fenster_heizung_tarif` für eigene Automationen.
  - Einstellungen mit drittem Reiter **Fenster & Alarm**.
- **Schneller warnen:** Neue Werte von Wetter-Entität, Windsensor, Regenmesser oder Außentemperatur lösen die Prüfung sofort aus (höchstens alle 15 Sekunden) statt erst nach bis zu einer Minute. Die Minuten-Prüfung bleibt als Rückfall.
- **Änderungsverlauf mit Rückgängig** auch für die Einstellungen von Modul 9 (Einstellungen → Verlauf); das Messwerk zeigt Regenmesser, Aussperrschutz-Kontakte und Vorsorge-Geräte mit „genutzt in Modul 9“.

### Geändert
- Modul 9 speichert nur noch, wenn sich etwas geändert hat (bisher jede Minute) – schont z. B. die SD-Karte.
- Die Liste der amtlichen Warn-Entitäten wird 10 Minuten gemerkt statt jede Minute neu gesucht; nach einer Änderung der Einstellungen sofort neu.
- Der Kasten „Vorabversion“ entfällt, Modul 9 trägt die Stufe **Stabil**.

### Technik
- 3 neue Tests (Rückblick, Speichern nur bei Änderung, schneller warnen), insgesamt 33 für Modul 9.
- 11 neue Tests für Modul 14 (Formate, Einheiten, Zeitumstellung, Endpreis, Netzentgelt, Stufen, beste Fenster, Ersatzquelle, Historie, Gerätefenster mit Kurve und Sonne, Preisalarm mit Vorlauf, Ruhezeit und Erinnerung).

### Korrigiert
- Im Eintrag zu 2026.11.3 stand fälschlich, Modul 14 habe schon Preisdienst, neue Optik, Fenster je Gerät und Preisalarm. Diese Teile kommen erst jetzt mit v0.6 bis v0.8.

## [2026.11.3.1] - 2026-11-17

Kleine Korrektur zu 2026.11.3: Chat und E-Mail wandern in den Kopf, die runden Symbole für Store und Labs entfallen, der E-Mail-Knopf funktioniert auch in der App.

### Geändert
- **Kopf, Chat und E-Mail:** Statt der Leiste unter jeder Seite stehen die Knöpfe 💬 und ✉️ jetzt klein oben im Kopf, neben „Sponsor“. Ein Zähler zeigt neue Chat-Nachrichten.
- **Kopf, Store und Labs:** Die runden Symbole für Store und Labs im Kopf entfallen. Store und Labs bleiben als Tabs in der Modul-Leiste.

### Behoben
- **E-Mail-Knopf:** Der Knopf blieb in der App und in manchen Browsern ohne Wirkung. Er kopiert jetzt die Adresse support@stromwaerme.dev und öffnet zusätzlich das Mail-Programm mit Betreff und Version.

## [2026.11.3] - 2026-11-17

Dritte stabile Version im November: Haus-Szenen in Modul 1, 3 und auf der Startseite, ein komplett neues Modul 8 für das Elektroauto, Modul 3 mit Gaszähler, Modul 19 und Modul 16 stabil, Support-Chat direkt im Dashboard und Freischaltung mit GitHub. Sie enthält alles aus den Testversionen 2026.11.3b1 bis 2026.11.3b42 und die Kontakt-Leiste. README und Bedienungsanleitung sind an diese Version angepasst (Kapitel 23 „Neu in Version 2026.11.3“).

### Neu
- **Startseite, Neue Optik:** Haus-Kopf als Szene, Kacheln 2.0 mit Zustandsfarben und HD-Symbolen, Hinweise-Zentrale mit „Später“, Wetter, Personen und Alarm neu, Tablet-Wandansicht, Bewegung (Aus · Dezent · Voll), Vorlagen und Schnellaktionen.
- **Modul 1 (v1.8):** Raumkarte 2.0 (Bild oben, Zahl in der Mitte, Rest im Menü „⋯“), Haus-Szene im Kopf mit deinen Räumen nach Etagen, Grundriss als Wärmekarte aus dem Baukasten von Modul 11, acht neue Raumbilder (u. a. Carport und Garage), „Warum?“ als Zeitleiste, Präsenzmelder je Raum, Messräume innen oder außen, Luftentfeuchter „Nur mit PV-Überschuss“.
- **Modul 3 (v1.6):** Energie-Szene im Banner, Energiefluss mit HD-Plaketten, Hinweise mit Bild und Aktion, neue Diagramme und Kosten-Treppe, **Gaszähler** mit Karte für Tag, Woche, Monat und Jahr, Abrechnungsjahr, Preisliste mit „gültig ab“ und Abschlag, Einstellungen in Reitern.
- **Modul 8 Elektroauto & Wallbox (v0.9, Vorabversion):** Carport-Szene, Überschuss-Balken mit Start und Stopp in Restzeit, Überschuss-Vorschau, Abfahrt aus dem Kalender je Fahrzeug, Strompreis im Banner, Tablet-Wandansicht, **Ladestatistik** mit Kilometern und Verbrauch, Änderungen je Ladung, Ladungen zusammenführen, mehrere Ladungen auf einmal ändern, Kosten ändern, **Import aus der go-e-App**, Ladenachweis als PDF, andere Wallboxen über Home Assistant.
- **Modul 9 (v0.9) Wetter & Warnungen:** alle DWD-Warnungen mit Stufen, Wetter-Szene als Banner, Zeitleiste, Vorsorge für Akku, Auto, Hitze und Frost.
- **Modul 16 Solar-Prognose (stabil, v1.0):** neue Optik mit Sonnenbogen, korrigierte Prognose, Treffsicherheit und Tipps.
- **Modul 20 Abrechnungen** (Addon, In Entwicklung): erste Stufe, Installation unter Entdecken → Store → Addons.
- **Modul 19 Hausfluss (stabil, v1.1):** Strom-Reiter mit „Woher kam der Strom?“ für Tag, Woche, Monat und Jahr, Haus mit Herkunfts-Ring, Themen, Tablet-Wand, bis zu vier Kacheln links und rechts und zwei unten, hellere Kacheln.
- **Haus-Energiebuch:** zählt alle 20 Sekunden, woher der Strom im ganzen Haus kommt und wohin er geht; Modul 19 und weitere Module nutzen es.
- **Modul 4 Gerätestrom:** Geräte-Menü in den Einstellungen als aufklappbare Karten, 13 neue Gerätetypen mit HD-Bildern.
- **Support-Chat im Dashboard:** wie WhatsApp, mit Bildern, Mitteilung aufs Handy, Anzeige der Abwesenheit. Sponsor Max wird bevorzugt beantwortet.
- **Kontakt-Leiste:** Auf der Startseite und unter jedem Modul stehen die Knöpfe „💬 Chat“ und „✉️ E-Mail“. Die Adresse ist support@stromwaerme.dev (auch für den Sponsor-Schlüssel per Mail).
- **Sponsor:** Freischalten mit GitHub direkt im Panel, Stufen nach Name der GitHub-Stufe, „Auf Max hochstufen“ in „Sponsoren verwalten“.
- **Addons:** installierte Addons erscheinen in den Modulversionen mit Stufe, Version und Update-Link.

### Geändert
- **Updates** gehören zu „Versionen & Updates“ (Einstellungen → System), automatische Sicherungen sind kompakt gruppiert.
- **Modul 3 Gas:** Preise stehen nur in der Preisliste, der Grundpreis lässt sich pro Monat oder pro Jahr eingeben.
- **Modul 19:** hellere Kacheln mit feinem Rand, bis zu 5 Quellen nebeneinander in der Handy-Ansicht, Verbraucher bleiben darunter.
- **Sponsor-Mail:** Der Sponsor-Schlüssel wird an support@stromwaerme.dev geschrieben.

### Behoben
- Modul 8: Eine laufende Ladung ging beim Neustart von Home Assistant verloren, die Ladung zeigte dann zu wenig. Sie bleibt jetzt erhalten, Energie, die in keiner Ladung steht, wird beim Bearbeiten zuerst der Ladung zugerechnet (Tageswerte bleiben), und die Tagesansicht weist darauf hin.
- Modul 8: Ladung startete nach einem Stopp nicht neu, nach einem Phasenwechsel stand eine neue Ladung in der Statistik, nach dem Zurückwechseln in die App standen kurz alle Werte auf 0, ältere Ladungen fehlten nach dem go-e-Import.
- Modul 3 und alle Szenen: Flüsse liefen nur beim Scrollen, der Autarkie-Ring flackerte, Reiter in „Energiequellen“ ließen sich nicht antippen.
- Modul 1: Grundriss aus Modul 11 erschien nicht, Antippen eines Raums brachte einen Fehler auf iPhone und App, Geräte der Integration wurden als Räume gezählt, Entfeuchter zeigte „läuft“ im Standby.
- Modul 4: nach dem Wechsel aus einer anderen App standen kurz alle Werte auf 0.
- Modul 16: Die Prognose war bei mehreren Diensten für dieselben Module zu hoch.
- Sponsor: Nach dem Ausschalten des Entwickler-Zugangs gab es keinen Weg zurück, Beta-Sperre mit Zugang zur Verwaltung.

### Wichtig beim Update
- Nach dem Update Home Assistant neu starten und die Seite neu laden, in der App die App ganz schließen und neu öffnen. Deine Einstellungen bleiben erhalten.
- Das Haus-Energiebuch beginnt beim Update zu zählen; Auswertungen daraus füllen sich mit der Zeit.
- Wer die neue Optik nicht möchte: In den jeweiligen Modulen unter Anpassen → Aussehen auf „wie bisher“ stellen.

## [2026.11.3b42] - 2026-11-15

### Behoben
- **Modul 8 · Statistik: Ladung zeigte nach einem Neustart zu wenig.** Eine laufende Ladung geht beim Neustart von Home Assistant nicht mehr verloren. Vorher blieben die Tageswerte richtig, die Ladung in der Liste zeigte aber nur den Rest nach dem Neustart.
- **Menge einer Ladung ändern:** Energie, die der Tag schon zählt, aber in keiner Ladung steht, wird zuerst dieser Ladung zugerechnet. Die Tageswerte oben bleiben dabei gleich. Erst darüber hinaus ändert sich auch der Tag.
- In der Tagesansicht weist ein Hinweis auf kWh hin, die in keiner Ladung stehen.

## [2026.11.3b41] - 2026-11-15

### Neu
- **Modul 19 · Hausfluss: mehr Plätze.** Links und rechts sind jetzt je **vier** Kacheln möglich (neu: „Links 4“ und „Rechts 4“), unten **zwei** („Unten 1“ und „Unten 2“). Bei vier Seitenreihen sitzt das Haus mittig zwischen der zweiten und dritten Reihe.
- Wer die neuen Plätze nicht nutzt, sieht das Bild wie bisher. Unter „Anordnen“ erscheinen alle zwölf Plätze zum Verschieben.
- **Handy-Ansicht „Fluss“:** bis zu **5 Quellen** nebeneinander (vorher 4), mit etwas kleineren Kreisen. Lange Namen werden mit Trennstrich am Zeilenende umgebrochen. Verbraucher bleiben darunter.

## [2026.11.3b40] - 2026-11-15

### Geändert
- **Modul 3 · Gas: Preise nur noch an einer Stelle.** Arbeits- und Grundpreis stehen ausschließlich in der Preisliste: erste Zeile „Von Anfang an“, danach jede Preisänderung mit „Gültig ab“. Standardwerte und Abrechnungsjahre enthalten nur noch Brennwert, Zustandszahl, MwSt und Abschläge.
- Bisherige Preise je Abrechnungsjahr werden automatisch in die Preisliste übernommen (gültig ab Beginn des jeweiligen Abrechnungsjahrs).
- **Grundpreis pro Monat oder pro Jahr** eingeben – umschaltbar über der Preisliste.

## [2026.11.3b39] - 2026-11-15

### Neu
- **Modul 3 · Gas: Preise mit „gültig ab“.** Arbeits- und Grundpreis stehen jetzt in einer Preisliste mit Datum (z. B. ab 01.07.2025 und ab 01.01.2026) – unabhängig vom Abrechnungsjahr. Jede Stunde bzw. jeder Tag kostet den Preis, der an diesem Tag galt; der Grundpreis wird tageweise am Datum geteilt. Ein leerer Grundpreis bleibt wie zuvor. Vor dem ersten Datum gilt der Standardpreis.
- Die Abrechnungsjahre enthalten nur noch Brennwert, Zustandszahl, MwSt und Abschläge. Bereits eingetragene Jahrespreise gelten weiter und werden als „alt“ angezeigt.
- Jahresansicht und „Seit Abrechnungsbeginn“ rechnen jetzt tageweise, damit ein Preiswechsel mitten im Monat genau getroffen wird. Die Hochrechnung nutzt für künftige Tage den dann gültigen Preis – auch bereits angekündigte.

## [2026.11.3b38] - 2026-11-15

### Behoben
- **Modul 3: Die Reiter Zähler, Gas und Anzeige in „Energiequellen“ ließen sich nicht antippen.** Die Aktion für den Reiterwechsel fehlte.

## [2026.11.3b37] - 2026-11-15

### Neu
- **Modul 3 · Gas: wie auf der Gasrechnung.**
  - **Brennwert und Zustandszahl** getrennt eintragen (z. B. 28,106 × 0,95090), auch je Abrechnungsjahr. Der Faktor wird daraus berechnet; ohne beide Werte gilt wie bisher ein direkt eingetragener Faktor.
  - **Preise ohne MwSt:** Arbeits- und Grundpreis lassen sich netto eingeben, mit MwSt-Satz (auch je Abrechnungsjahr). Angezeigt wird immer mit MwSt.
  - **Abschläge je Abrechnungsjahr** und für **einzelne Monate abweichend** (z. B. 95 € im April, danach 105 €), dazu der **Tag der Abbuchung**. „Seit Abrechnungsbeginn“ zählt nur Abschläge, die schon abgebucht sind, und zeigt die Summe fürs ganze Jahr.
- **Modul 3: Einstellungen in Reitern.** „Energiequellen“ ist jetzt aufgeteilt in **Strom** (Leistung, Batterie, Vorzeichen), **Zähler** (Tagessummen), **Gas** und **Anzeige**; im Reiter steht, wie viele Sensoren gewählt sind. Im Reiter Gas sind die Abrechnungsjahre eingeklappt (das laufende offen) und zeigen zugeklappt ihre Preise. Der Link in der Gas-Karte öffnet direkt den Reiter Gas.

## [2026.11.3b36] - 2026-11-15

### Neu
- **Modul 3 · Gas: Abrechnungsjahr.** Einstellbar, in welchem Monat dein Abrechnungsjahr beginnt (z. B. April). Die Ansicht „Jahr“ der Gas-Karte zeigt dann April bis März.
- **Modul 3 · Gas: Preise je Abrechnungsjahr.** Arbeits- und Grundpreis lassen sich für jedes Abrechnungsjahr eintragen; leere Felder nutzen den Standardpreis. Jede Stunde und jeder Tag wird mit dem Preis des Abrechnungsjahrs gerechnet, in das er fällt – auch wenn ein Zeitraum über den Wechsel geht.
- **Modul 3 · Gas: „Seit Abrechnungsbeginn“.** Verbrauch und Kosten im laufenden Abrechnungsjahr, mit optionalem monatlichem Abschlag: bezahlte Abschläge, Stand heute und – sobald ein Vorjahr da ist – eine Hochrechnung fürs ganze Jahr mit voraussichtlichem Guthaben oder Nachzahlung.

### Behoben
- **Modul 3 · Gas: „Brennwert × Zustandszahl“ war auf 20 kWh/m³ begrenzt.** Für Flüssiggas (gasförmig etwa 25–28 kWh/m³) reichte das nicht. Jetzt sind Werte bis 40 möglich, der Hinweis nennt beide Gasarten.

## [2026.11.3b35] - 2026-11-15

### Neu
- **Modul 3: Gaszähler.** Unter Energiequellen → „Gas (optional)“ wählst du den Zählerstand-Sensor (m³ oder kWh). Modul 3 zeigt dann eine eigene Karte „Gas“ für Tag, Woche, Monat und Jahr:
  - Verbrauch in kWh (bei m³-Zählern zusätzlich in m³), umgerechnet mit Brennwert × Zustandszahl von der Gasrechnung.
  - Kosten aus Arbeitspreis (ct/kWh) und anteiligem Grundpreis (€/Jahr).
  - Vergleich zur Vorperiode, Balken je Stunde, Tag oder Monat, Ø pro Tag und aktueller Zählerstand.
  - Die Karte lässt sich über „Anpassen“ verschieben oder ausblenden. Die Einstellung gilt für alle Nutzer und ist in der Sicherung enthalten.

### Geändert
- **Modul 19: Kacheln heller.** Statt fast schwarzer Flächen haben die Kacheln jetzt einen hellen Glas-Hintergrund mit feinem Rand, durch den das Thema (Sternenhimmel, Nachtglas …) leicht durchscheint. Ausgeschaltete Kacheln sind gut lesbar und die Bilder kräftiger, eingeschaltete leuchten in der Farbe des Geräts. Das helle Design bleibt unverändert.
- **Modul 8: „Aus go-e importieren“ erscheint nur noch, wenn im Store ein go-e Charger verbunden ist.** Ohne Wallbox oder mit einer Wallbox über Home Assistant ist der Link ausgeblendet. Bereits importierte Ladungen bleiben unverändert.

## [2026.11.3b34] - 2026-11-15

### Geändert
- **Modul 4: Geräte-Menü in den Einstellungen neu.** Jedes Gerät ist eine aufklappbare Karte mit HD-Bild (grün hinterlegt, wenn es gerade läuft), Name, Typ, Sensor und aktueller Leistung. Aufgeklappt:
  - **Typ-Wähler mit HD-Bildern** in Gruppen: Waschen & Pflege, Küche, Kühlen, Haus & Klima, Technik & Freizeit, Sonstiges.
  - **Live-Wert** des Sensors mit Hinweis, ob er über der Startschwelle liegt.
  - **Empfohlene Werte** für Startschwelle und Ende je Gerätetyp, mit „Übernehmen“.
  - Neue Geräte öffnen sich gleich mit dem Typ-Wähler.

### Neu
- **13 neue Gerätetypen mit eigenen HD-Bildern:** Küchenmaschine (z. B. Thermomix), Kochstation mit Rührarm (z. B. Cookit), Mikrowelle, Kaffeemaschine, Wasserkocher, Heißluftfritteuse, Gefriergerät, Saugroboter & Sauger, Bügeleisen, Klimagerät, Heizlüfter, E-Bike-Akku, Aquarium. Die Bilder sind eigene, neutrale Zeichnungen ohne Markenzeichen. Am Namen erkennt Modul 4 den Typ automatisch (z. B. „Thermomix TM7“ → Küchenmaschine, „Bosch Cookit“ → Kochstation).

### Behoben
- **Modul 4: Nach dem Wechsel aus einer anderen App standen kurz alle Werte auf 0.** Die Verbindung zu Home Assistant ist in diesem Moment noch nicht wieder da; die fehlgeschlagene Abfrage hat die Geräte durch eine leere Liste ersetzt, und erst 15 s später kam der nächste Versuch. Jetzt bleibt der letzte Stand stehen, Modul 4 lädt sofort nach der Rückkehr bzw. sobald die Verbindung wieder steht neu und versucht es bei einem Fehler nach 3 s erneut. Dasselbe gilt für Modul 19 und das Morgen-Briefing.

## [2026.11.3b33] - 2026-11-14

### Behoben
- **Modul 8: „Gastfahrzeug“ unter „Fahrzeuge & Karten“, obwohl alle Ladungen beim richtigen Fahrzeug stehen.** Beim erneuten go-e-Import kamen fehlende Ladungen mit dem jetzt gewählten Fahrzeug zurück in die Liste, ihre Energie stand in den Tageswerten aber noch beim Fahrzeug vom ersten Import (meist „Gastfahrzeug“). Jetzt gleicht Modul 8 die Fahrzeug-Werte jedes Tages an die Ladungen dieses Tages an – einmal beim Start (repariert vorhandene Daten) und nach jedem Import. Umgebucht wird nur, wenn die Ladungen eines Fahrzeugs mehr Energie zeigen, als der Tag ihm zuschreibt; Tage ohne Ladungen in der Liste bleiben unverändert.

## [2026.11.3b32] - 2026-11-14

### Behoben
- **Modul 8: Nach dem go-e-Import fehlten ältere Ladungen (z. B. März bis Juli) unter „Ladungen“.** Modul 8 hielt nur die letzten 100 Ladungen – beim Import vieler älterer Ladungen fielen die ältesten wieder aus der Liste, ihre Energie stand aber schon in den Tageswerten. Jetzt bleiben bis zu 2000 Ladungen, „Alle anzeigen“ zeigt wirklich alle des Zeitraums.
- **Fehlende Ladungen zurückholen:** Die CSV einfach noch einmal importieren. Ladungen, die schon einmal übernommen wurden, aber aus der Liste gefallen sind, erscheinen als „zurück in die Liste“ und werden eingetragen, **ohne** die Tageswerte doppelt zu zählen. Ab jetzt merkt sich Modul 8 jede importierte go-e-Ladung, damit nichts doppelt zählt.

### Neu
- **Modul 8: Kosten einer Ladung ändern.** Beim Bearbeiten einer Ladung die Kachel „Kosten“ antippen und den Betrag in € eintragen – z. B. was wirklich bezahlt wurde, 0 € für kostenloses Laden beim Arbeitgeber oder ein Betrag auch bei 100 % Sonne. Tages- und Fahrzeugkosten werden mitgeführt, die Änderung steht im Änderungsverlauf, in der Liste erscheint „Kosten geändert“. Ändert man danach die Menge, bleiben die gesetzten Kosten.
- **Modul 8: Mehrere Ladungen auf einmal.** Unter „Ladungen“ → „Auswählen“: Ladungen antippen (oder „Alle im Zeitraum“) und dann **löschen** oder **einem Fahrzeug zuordnen**. Tageswerte und „Fahrzeuge & Karten“ werden mitgeführt.
- **Modul 8: Alle gespeicherten Ladungen löschen** (unten in „Ladungen“): entweder nur die Liste leeren (Tageswerte, Summen und km bleiben) oder alles zur geladenen Energie löschen – für einen sauberen Neustart vor einem neuen go-e-Import (km und Temperaturen bleiben). Mit Rückfrage.
- **Modul 8: „Fahrzeug ändern“ je Karte** unter „Fahrzeuge & Karten“ → „Je Karte“: alle Ladungen der Karte im Zeitraum auf einmal umbuchen – z. B. „Sandra“ von „Gastfahrzeug“ auf „BYD“.
- **go-e-Import: Karten ohne Fahrzeug.** Sind Karten keinem Fahrzeug zugeordnet (sonst landen ihre Ladungen beim „Gastfahrzeug“), zeigt die Vorschau sie oben an – Fahrzeug je Karte direkt wählen.
- Gelöschte importierte Ladungen werden aus dem Import-Gedächtnis entfernt und lassen sich später wieder importieren.

## [2026.11.3b31] - 2026-11-14

### Neu
- **Modul 8: Ladungen aus go-e importieren.** In der Ladestatistik unter „Ladungen“ → „Aus go-e importieren“ die CSV aus der go-e-App wählen (Laden → Einzelheiten → Energie pro Benutzer → Download CSV).
  - **Vorschau vor dem Übernehmen:** je Ladung „Neu“, „schon da“ oder „Menge anders“, mit Karte → Fahrzeug (Zuordnung wie in Modul 8 eingestellt).
  - **Keine doppelten Ladungen:** Ladungen, die Modul 8 schon kennt (gleicher Start ±20 Minuten oder innerhalb der Ladung), werden erkannt. Weicht die Menge ab, kann sie auf Wunsch an den Zähler von go-e angeglichen werden – steht im Änderungsverlauf der Ladung.
  - **Sonne geschätzt:** Die CSV kennt den Sonnenanteil nicht. Er wird aus der Herkunft des Hausstroms in den Stunden der Ladung geschätzt (Haus-Energiebuch, sonst Statistik der Energiequellen), Ladung ab Start über die „Ladezeit“. In der Liste steht „≈ … % Sonne“ und das Schild „go-e“.
  - **Kosten mit den damaligen Preisen:** je Stunde der Ladung nur für den Netzanteil – aus dem Vertrag (Modul 20), von Tibber (vergangene Stundenpreise über die Tibber-Schnittstelle), aus der Langzeitstatistik des Preis-Sensors oder der Festpreis. Fehlt alles, der heutige Preis. Die Vorschau zeigt je Ladung Kosten, mittleren Preis und Quelle; die Quelle steht auch im Änderungsverlauf. Neue Ladungen zählen am Starttag.
  - Die Datei wird nur im Browser gelesen; die Spalte „Link“ (enthält einen Zugang zu go-e) wird verworfen.

## [2026.11.3b30] - 2026-11-14

### Neu
- **Haus-Energiebuch für weitere Module.** Was das Energiebuch vollständig gezählt hat (alle 20 Sekunden), nutzen jetzt auch:
  - **Modul 3 (Energie-Übersicht):** Tag, Woche, Monat und Jahr – Solar, zweite Anlage, Bezug, Einspeisung und Akku je Stunde/Tag/Monat aus dem Energiebuch, davor wie bisher aus der Langzeitstatistik. Ein Hinweis zeigt, woher die Zahlen kommen. Auch der Vergleich mit der Vorperiode nutzt es.
  - **Morgen-Briefing (Sponsor Max):** neuer Baustein „🏠 Gestern im Haus“ – Verbrauch, Solaranteil, Autarkie und Einspeisung von gestern. Der Abend-Rückblick nennt dasselbe für heute, zusammen mit dem Gesparten aus Modul 4. Bestehende Briefings: Baustein einmal einschalten.
  - **Monatsbericht:** Solar und Autarkie aus dem Energiebuch, wenn es den ganzen Monat gezählt hat.
  - **Jahres-Poster:** neue Felder „Solar erzeugt“ und „Autarkie“ (mit „seit …“, solange das Energiebuch noch nicht das ganze Jahr kennt).
- Energiebuch zählt jetzt auch die zweite Anlage (z. B. Balkonkraftwerk) getrennt mit.

## [2026.11.3b29] - 2026-11-14

### Neu
- **Haus-Energiebuch.** Die Integration zählt jetzt selbst alle 20 Sekunden mit, woher der Strom im ganzen Haus kommt und wohin er geht: Solar direkt, Akku entladen, Netzbezug, Einspeisung, Akku geladen, PV-Erzeugung sowie Solar → Akku, Solar → Netz und Netz → Akku. Grundlage sind die Sensoren unter Einstellungen → Haus → Energiequellen (Solar, zweite Anlage, Netz mit Vorzeichen, Akku). Gespeichert werden Stundenwerte für 62 Tage und Tageswerte für 800 Tage, mit automatischer Sicherung wie alle Speicher.
- **Modul 19, Strom-Reiter nutzt das Energiebuch:** Säulen, Summen, „Woher kam der Strom?“ und Kosten kommen für jede Stunde bzw. jeden Tag aus dem Energiebuch, sobald es für den ganzen Abschnitt Werte hat. Davor wird wie unten beschrieben aus der Statistik gerechnet. Unter den Säulen steht, woher die Zahlen kommen.

### Behoben
- **Modul 19, Strom-Reiter: Tagsüber stand fast nur „Solar“, obwohl auch Akku und Netz gebraucht wurden.** Gerechnet wurde mit Stundenmitteln – innerhalb einer Stunde glichen sich kurze Spitzen (Auto lädt über der PV-Leistung → Akku/Netz) und Überschuss (danach Einspeisung) gegenseitig aus. Jetzt:
  - **Tag und Woche in 5-Minuten-Schritten**, solange Home Assistant die 5-Minuten-Statistik noch hat (etwa die letzten 10 Tage). Ältere Zeiträume, Monat und Jahr weiter mit Stundenmitteln; unter den Säulen steht, wie gerechnet wurde.
  - **Getrennte Sensoren für Bezug und Einspeisung** (Netz-Kachel mit zwei Leistungen) werden nicht mehr miteinander verrechnet, sondern beide Richtungen einzeln gezählt.
  - Gilt für Säulen, Summen, „Woher kam der Strom?“, Kosten und die eigene Rechnung der Verbraucher.

## [2026.11.3b28] - 2026-11-14

### Neu
- **Support-Chat: Bilder.** Mit dem Bild-Knopf ein Foto oder Bildschirmfoto anhängen (wird im Browser auf höchstens 1280 px verkleinert, Vorschau vor dem Senden). In Telegram kommt es als Foto an; antwortet der Entwickler mit einem Bild, erscheint es im Chat. Antippen vergrößert. Gespeichert werden die letzten 40 Bilder.
- **Support-Chat: Mitteilung aufs Handy.** Über die Glocke im Chat: „Meldung in Home Assistant“ ein/aus und „Mitteilung aufs Handy“ über die Home-Assistant-App (Gerät wählen, Test-Mitteilung). Antippen der Mitteilung öffnet direkt den Chat.
- **Support-Chat: Abwesenheit.** Schreibt der Entwickler in Telegram `/weg bis Montag`, steht oben im Chat „Gerade abwesend: bis Montag – deine Nachricht kommt trotzdem an“. `/da` schaltet es aus.
- **Telegram: `/offen`.** Listet alle noch nicht beantworteten Unterhaltungen – Sponsor Max zuerst, dann Sponsoren, dann Nutzer, jeweils mit Wartezeit. Auf jede dieser Nachrichten kann direkt geantwortet werden. `/hilfe` zeigt alle Befehle; nach erneutem Aufruf von `/setup` erscheinen sie auch im Befehls-Menü des Bots.
- Neue `support-worker/worker.js` – muss bei Cloudflare unter „Edit code“ ersetzt werden.

### Geändert
- **Modul 19, Strom-Reiter: „Verbraucher mit Solar-Anteil“ genauer und klarer.**
  - Jede Zeile zeigt jetzt „13 kWh verbraucht · davon 13 kWh Solar · 100 %“ – vorher war nicht zu erkennen, dass die Zahl der ganze Verbrauch des Geräts ist und nicht nur der Solaranteil.
  - **kWh-Zähler bevorzugt:** Hängt an der Kachel ein Energiezähler (Wh/kWh, state_class total/total_increasing) als Wert-Entität, rechnet Modul 19 mit dessen Zuwachs je Stunde statt mit dem Leistungssensor. Ein Schildchen zeigt „Zähler“ oder „aus Leistung“.
  - **Verbunden mit Modul 4 und Modul 8:** Ist ein Verbraucher in Modul 4 (Gerätestrom) oder die Wallbox in Modul 8 eingerichtet, kommen die Werte direkt von dort – Modul 4 rechnet alle 20 Sekunden und teilt in Solar, Akku und Netz, Modul 8 nimmt die Ladestatistik inkl. Korrekturen. Der Balken zeigt dann drei Farben, rechts „Solar · Akku · Netz“ in kWh. Zuordnung automatisch über denselben Sensor (Wallbox auch am Namen oder Auto-Bild), von Hand unter Kachel bearbeiten → „Werte im Strom-Reiter“. Das Schildchen „Modul 4 ›“ bzw. „Modul 8 ›“ öffnet das Modul. Für Zeiträume vor der Einrichtung dort rechnet Modul 19 selbst.
  - **Laufende Stunde:** Bisher fehlte bei „Heute“ immer die aktuelle Stunde (Home Assistant legt die Langzeitstatistik erst nach Stundenende an). Jetzt wird sie aus der 5-Minuten-Statistik dazugerechnet – auch bei Säulen, Summen und Kosten. Aktualisiert wird alle 2 Minuten.

## [2026.11.3b27] - 2026-11-14

### Neu
- **Support-Chat ist eingerichtet.** Die Adresse des Support-Vermittlers steht jetzt fest in der Integration – der Chat funktioniert damit bei allen (Sponsor Max bevorzugt). Der Hinweis „wird gerade eingerichtet“ entfällt.

## [2026.11.3b26] - 2026-11-14

### Neu
- **Support-Chat – wie WhatsApp, direkt im Dashboard, für alle.** Im Sponsor-Bereich bzw. in der Sponsor-Lounge gibt es die Karte „Support-Chat“, in der Lounge zusätzlich oben den Knopf „Support“.
  - Chatfenster mit Sprechblasen, Uhrzeit, Tagestrennern und Haken (✓ gesendet, ✓✓ gelesen), Vorschlägen für die erste Nachricht und „Erneut senden“, falls eine Nachricht nicht rausging. Enter sendet am Rechner, Umschalt+Enter macht eine neue Zeile.
  - **Sponsor Max ist „★ Bevorzugt“:** Max-Nachrichten kommen beim Entwickler mit eigener Kennzeichnung an und zuerst dran. Sponsoren sind mit ♥ markiert, alle anderen als „Nutzer“.
  - **Diagnose anhängen (📎):** Version, Home-Assistant-Version, eingeschaltete Module und die letzten Fehlermeldungen von Strom & Wärme. Vor dem Senden lässt sich genau ansehen, was mitgeht.
  - **Datenschutz-Hinweis** vor der ersten Nachricht: Die Nachrichten laufen über einen kleinen Vermittler (Cloudflare) an Telegram. Mit dem Papierkorb wird der Verlauf hier und beim Vermittler gelöscht.
  - Neue Antworten: Zähler an der Karte, Punkt am Sponsor-Knopf im Kopf und eine Meldung in Home Assistant. Bei offenem Chat kommen Antworten nach etwa 20 Sekunden, sonst prüft die Integration alle 15 Minuten.
- **Support-Vermittler** im Ordner `support-worker/` (Cloudflare Worker mit Anleitung, bebildert in `docs/Anleitung_Support-Chat.pdf`): erkennt bei jeder Nachricht Sponsor und Sponsor Max (Schlüssel inkl. Sperrliste oder GitHub), begrenzt die Menge (Sponsoren 30 pro Stunde, ohne Sponsoring 10 pro Stunde und 30 pro Tag) und gibt Antworten aus Telegram weiter. Unter „Sponsoren verwalten“ lässt sich eine Test-Adresse eintragen, die nur beim Entwickler gilt. Bis die feste Adresse in der Integration steht, zeigt der Chat „wird gerade eingerichtet“.

## [2026.11.3b25] - 2026-11-14

### Neu
- **Sponsoren verwalten: „Auf Max hochstufen“.** Bestehende Sponsoren lassen sich jetzt direkt am Eintrag für 3 Monate auf Sponsor Max hochstufen – über „⋯“ am Sponsor → „Auf Max hochstufen“.
  - Vorher zeigt eine Zeitleiste, was passiert: ★ Max ab heute für 3 Monate, danach automatisch wieder ♥ Sponsor bis zum bisherigen Ende. Das Sponsor-Jahr wird nie kürzer; läuft es vor dem Ende von Max ab, rückt es auf das Ende von Max.
  - Der Eintrag bleibt derselbe (keine doppelten Sponsoren in der Liste) und bekommt einen neuen Schlüssel. „Nachricht kopieren“ legt einen passenden Text zur Hochstufung in die Zwischenablage. Bis der neue Schlüssel eingelöst ist, gilt der alte weiter als Sponsor.
  - In der Liste steht bei Max-Sponsoren jetzt auch „danach Sponsor bis …“ und „hochgestuft am …“.

### Geändert
- **Sponsoren verwalten: Max vorbei, Sponsor-Jahr läuft noch.** Solche Einträge erschienen bisher als „Abgelaufen“, obwohl der Schlüssel noch als Sponsor gilt. Jetzt zeigen sie „Aktiv“ mit „gültig bis“ zum Ende des Sponsor-Jahres und „Max endete am …“; sie zählen nicht mehr bei „★ Max“. „Verlängern“ verlängert dann das Sponsor-Jahr (nicht Max), und sie lassen sich erneut auf Max hochstufen. Auch die Meldung „Sponsor-Schlüssel laufen bald ab“ nennt hier die richtige Stufe und das richtige Datum.

## [2026.11.3b24] - 2026-11-14

### Behoben
- **Modul 8: Nach dem Zurückwechseln in die Home-Assistant-App waren „Laden“ und „Statistik“ eine Weile leer (0 kWh, keine Werte).** Beim Zurückkommen verbindet sich die App neu; die erste Abfrage scheiterte und ersetzte die Werte durch einen leeren Stand – die Statistik fragte erst nach 30 Sekunden wieder. Jetzt bleibt der letzte Stand stehen, Modul 8 fragt sofort beim Zurückkommen und bei einem Fehlschlag nach 1,5 Sekunden erneut; „keine Antwort“ erscheint erst nach drei Fehlversuchen. Baut die App die Seite ganz neu auf, zeigt Modul 8 sofort den letzten Stand und bleibt im zuletzt gewählten Register.

### Geändert
- **Modul 8 (v0.9 Build 6): Carport-Szene näher an der Wirklichkeit.**
  - Der Sonnenstrom fliegt nicht mehr als Bogen durch die Luft: Er läuft im **Kabelkanal am Carport-Träger** zu einem **Wechselrichter an der Hauswand** und von dort in die Wallbox. Der Wechselrichter zeigt mit grüner Lampe, wenn Sonne fließt.
  - Lädt das Auto (auch) mit Netzstrom, kommt der Strom sichtbar **aus dem Haus** in die Wallbox (orange). Bei gemischtem Laden laufen beide Wege.
  - **Ladekabel und Stecker:** Das Kabel liegt jetzt **vor** dem Auto, führt hinter dem Hinterrad vom Boden nach oben und endet in einem **Typ-2-Stecker** in der geöffneten Ladeklappe (Griff leuchtet beim Laden). Vorher verschwand es hinter der Karosserie, der Stecker saß als Klotz auf dem Radlauf.
- **Modul 8: „Heute“ übersichtlicher.** Statt eines ganzen Tages (0–24 Uhr) mit vielen schmalen Streifen:
  - Kennzahlen oben: geladen, Sonnenanteil, Kosten und – falls vorhanden – geplante kWh.
  - Die Zeitleiste zeigt nur den Ausschnitt um die Ladungen und jetzt (mindestens 6 Stunden), mit Stundenlinien und „jetzt“-Marke.
  - Ladungen als beschriftete Balken (kWh und Sonnenanteil, Sonne/Netz als Anteil im Balken), geplante Fenster in einer eigenen Zeile.
  - Darunter eine kurze Liste der Ladungen mit Uhrzeit, Dauer, kWh, Sonne und Kosten. Teile einer Ladung, die vor b23 getrennt gezählt wurden, erscheinen hier als eine.

## [2026.11.3b23] - 2026-11-14

### Behoben
- **Modul 8 (v0.9 Build 5): Nach einem Phasenwechsel stand in der Ladestatistik eine neue Ladung.** Eine Ladung wurde nach 3 Minuten ohne Strom abgeschlossen – nach dem Umschalten der Phasen pausiert das Auto aber oft länger, ebenso bei Wolken im Modus „Sonne“ oder wenn der Ladeplan wartet. Jetzt reicht eine Ladung vom ersten Strom **bis zum Abstecken**; Pausen dazwischen gehören dazu. Meldet eine Wallbox über Home Assistant keinen Stecker oder Status, gilt eine Pause bis 10 Minuten als dieselbe Ladung. Auch das Ereignis „Ladung beendet“ kommt jetzt erst beim Abstecken.
- **Modul 8: Der Ladenachweis wurde als .html gespeichert statt als PDF.** Bisher öffnete „Drucken / als PDF sichern“ ein Fenster zum Drucken; in den Apps von Home Assistant (iPhone, iPad, Mac) geht das nicht, dann kam eine HTML-Datei. Jetzt erstellt Modul 8 selbst eine echte **PDF-Datei** (A4, Tabelle mit Kopf auf jeder Seite, Summe, Hinweis auf geänderte Mengen, Seitenzahlen) und speichert sie direkt – Knopf „Als PDF speichern“.

### Neu
- **Getrennte Ladungen zusammenführen:** Beim Bearbeiten einer Ladung erscheint „Gehört zur Ladung davor?“, wenn direkt davor (höchstens 12 Stunden) eine Ladung desselben Fahrzeugs liegt. „Zusammenführen“ vereint beide zu einer Ladung – kWh, Sonne, Kosten, Dauer, Karte und Notiz; die Tageswerte bleiben unverändert. Steht im Änderungsverlauf der Ladung.

## [2026.11.3b22] - 2026-11-14

### Neu
- **Modul 8 · Elektroauto & Wallbox (v0.9 Build 4): Überschuss-Balken** im Register „Laden“ unter dem Ladeband.
  - Der Balken reicht von 0 bis zur eingestellten Höchstleistung (z. B. 16 A × 3 Phasen = 11,0 kW) und zeigt die Bereiche „zu wenig“, „1 Phase · 6–16 A“ und „3 Phasen · 6–16 A“ – passend zu Ladestrom, Phasen und Startschwelle, die gerade gelten (auch je Fahrzeug und bei Wallboxen ohne Phasenumschaltung).
  - Türkis ist der genaue Überschuss, ein Strich die Ladeleistung jetzt. Lädt das Auto mit mehr, als die Sonne liefert, ist der Netz-Anteil orange gestreift, mit Kosten pro Stunde.
  - Darunter: wofür der Überschuss reicht („14 A · 1 Phase“) und was bis zur nächsten Stufe fehlt („noch 0,90 kW bis 3 Phasen“, „fehlt 0,55 kW bis zum Start“).
- **Start und Stopp sichtbar:** Wartet die Regelung, ob der Überschuss bleibt, steht im Balken „Startet in ca. 40 s“; reicht er nicht mehr, „Stoppt in ca. 2:10 Min.“ – jeweils mit Fortschrittsanzeige. Ohne genug Überschuss: „Wartet auf Sonne. Start ab 1,4 kW“.
- **Überschuss-Vorschau** unter dem Balken: erwarteter Überschuss für den Rest des Tages aus der PV-Prognose (Modul 16 oder Forecast.Solar, minus Grundverbrauch), je Stunde eingefärbt nach „zu wenig“, „1 Phase“, „3 Phasen“ – mit Satz wie „Ab ca. 13:00 für 3 Phasen. Bis ca. 18:00 reicht es.“
- **Abfahrt aus dem Kalender je Fahrzeug** (Planung → Abfahrtszeit pro Fahrzeug): Kalender wählen, optional ein Stichwort im Titel (z. B. „Auto“), wie lange vor Terminbeginn losgefahren wird, Ziel-Ladestand und Mindestdauer des Termins. Steht in den nächsten 36 Stunden ein passender Termin an, plant Modul 8 die Ladung bis zur Abfahrt – auch ohne eigene Abfahrt und auch, wenn die Planung sonst aus ist. Kommt die normale Abfahrt früher, gilt sie zuerst. Im Ladeplan steht, welcher Termin gerade zählt; „Warum gerade so?“ nennt ihn. Ganztägige Termine zählen nicht.
  - Das Lab **„Ladeziel nach Kalender“ ist damit fest eingebaut** und aus den Labs verschwunden. War es an, werden Kalender, Ziel bei langem Termin und Mindestdauer einmalig an alle Fahrzeuge übernommen.
- **Tablet-Wandansicht „Laden“:** Im Tablet-Modus zeigt Modul 8 Carport-Banner mit Strompreis, Ladeband, Überschuss-Balken mit Vorschau und große Knöpfe für Modus (Aus, Sonne, Sonne + Netz, Voll) und Schnellstart (1 Stunde voll, Bis zum Ziel, Heute nur Sonne, Stopp). „Alle Details“ öffnet die normale Seite, „Zur Wandansicht“ führt zurück. Hochkant untereinander, quer nebeneinander.
- **Kilometer & Verbrauch in der Statistik** (Tag/Woche/Monat/Jahr wie bisher):
  - Kacheln: gefahrene km mit Vergleich, echter Verbrauch in kWh/100 km (geladen, mit Ladeverlusten), **Sonnen-Kilometer** (Strecke mit eigener Sonne), Ø km pro Tag mit dem stärksten Tag.
  - Kilometer je Tag bzw. je Monat als Balken, gefärbt nach Sonne und Netz der Ladungen in diesem Abschnitt; Antippen öffnet den Tag oder Monat.
  - **Verbrauch nach Außentemperatur** (letzte 12 Monate, vier Bereiche) mit „1 kWh ≈ … km“, „1 % Akku ≈ … km“ und dem Mehrverbrauch bei Kälte. Die Außentemperatur wird ab jetzt je Tag mitgeschrieben.
  - **Jahreskilometer** mit Hochrechnung und Vorjahr; je Fahrzeug optional eine Grenze (z. B. Leasing) und der Monat, in dem das Jahr beginnt – mit „auf Kurs“, „knapp“ oder „zu viel“ und den km pro Woche, die noch bleiben.
  - **Kilometerstand von Hand** für Fahrzeuge ohne Sensor: Die Strecke seit dem letzten Eintrag wird gleichmäßig auf die Tage dazwischen verteilt.
  - „Fahrzeuge & Karten“ zeigt zusätzlich km und kWh/100 km je Fahrzeug.
- **Strompreis als Chip im Banner von Modul 8**, z. B. „27,4 ct/kWh · normal“. Farbe nach Stufe (Tibber: im Vergleich zum Tagesdurchschnitt; „günstig laden“, wenn die eigene Preisgrenze greift). Ohne dynamischen Preis der Festpreis aus Vertrag oder Haus-Werten.

## [2026.11.3b21] - 2026-11-14

### Behoben
- **Modul 3 (v1.6 Build 4): Der Autarkie-Ring im Banner flackerte von links nach rechts** (seit b20, vor allem auf dem iPad quer). Die Breite der Haus-Szene wurde laufend nachgemessen; der Ring rückte dadurch, der Text brach anders um, das Banner wurde höher, die Szene breiter – und der Ring sprang zurück. Gemessen wird jetzt wieder nur beim Neuaufbau, das Drehen des iPads baut das Layout trotzdem neu auf.

## [2026.11.3b20] - 2026-11-14

### Neu
- **Modul 20 · Abrechnungen (Addon, v0.1 Build 1, In Entwicklung):** erste Stufe „Grundgerüst“ aus dem Konzept. Installieren unter Entdecken → Store → Addons.
  - **Verträge** für Strom, Gas, Wasser & Abwasser und Einspeisung: Anbieter, Laufzeit, Kündigungsfrist, Preisgarantie, Bonus, Abschlag. Vorlagen (Fixpreis, Tibber dynamisch, Grundversorgung, Gas, Gemeinde Wasser, EEG) füllen nur die Felder vor.
  - **Preisperioden** mit „gültig ab“: Arbeitspreis, Grundpreis, Messstelle, CO₂-Anteil, Umsatzsteuer, Eingabe brutto oder netto. Preisverlauf mit Änderung in Prozent; angekündigte Erhöhungen mit Hinweis auf das Sonderkündigungsrecht.
  - **Wasser-Gebühren:** Frischwasser, Abwasser, Niederschlagswasser nach Fläche, Zählergebühr; ein Gartenzähler zählt ohne Abwasser.
  - **Gas:** Umrechnung m³ → kWh mit Brennwert und Zustandszahl. **Effektiver Preis** inklusive Grundpreis beim eigenen Jahresverbrauch.
  - **Zähler & Ablesungen:** Rollenzählwerk, Stand von Hand erfassen mit Prüfung gegen den Verlauf (kleiner als der letzte Stand, Ziffern vertauscht, ungewöhnlich hoher Verbrauch, Zählerüberlauf), Zähler tauschen. Zähler mit Sensor speichern täglich um 0 Uhr einen Stand. Ablesen dürfen alle Nutzer, ändern nur Administratoren.
  - **Übersicht:** je Sparte Preis, Verbrauch und Kosten im laufenden Abrechnungsjahr (tagesgenau über Preiswechsel), „Als Nächstes“ mit Kündigungsfristen, Preisgarantie-Ende, Preisänderungen und Eichfristen.
  - **Preisdienst im Kern:** eine Stelle für den Preis je Sparte – erst Modul 20, dann Tibber, dann Haus-Werte. Der feste Strompreis und die Einspeisevergütung aus dem Vertrag werden in die Haus-Werte gespiegelt (abschaltbar, der Stand davor kommt zurück); dort steht „Verwaltet in Modul 20“.
  - Zähler-Sensoren erscheinen im Messwerk; eigener Speicher mit automatischer Sicherung. Noch nicht enthalten: Hochrechnung und Abschlagsplan (v0.3), Rechnungen, Fahrtkosten, Vorräte (v0.5).

### Behoben
- **Modul 8 (v0.9 Build 3): Laden startete nach einem Stopp nicht wieder.** Die go-e meldet „fertig“ auch dann, wenn die Regelung selbst gestoppt hat (zu wenig Sonne, „Hausbatterie zuerst“). Das wurde als „Auto ist voll“ gewertet – danach blieb es bei „Das Auto meldet fertig geladen“, trotz Überschuss. Jetzt gilt „fertig“ nur, wenn das Auto bei freigegebenem Laden von selbst aufgehört hat **und** der Ladestand am Ziel ist (oder unbekannt). Sonst wird weiter geregelt, bis das eingestellte Limit erreicht ist. Hört das Auto unter dem Ziel von selbst auf, bleibt das Laden freigegeben und der Grund steht in „Warum gerade so?“.
- **Modul 8:** Das Etikett „Ziel 100 %“ über dem Ladeband ragte rechts aus der Karte.
- **Modul 3 (v1.6 Build 3) und alle Szenen: Flüsse blieben stehen und liefen nur beim Scrollen weiter.** Bei jedem neuen Wert aus Home Assistant wird die Seite neu aufgebaut; dabei begann die Bewegung jedes Mal von vorn (auf dem iPad hielt sie sogar an). Bei häufigen Werten sah das wie Stillstand aus – beim Scrollen pausiert der Neuaufbau, deshalb liefen sie dann. Jetzt wird der Stand jeder Bewegung über den Neuaufbau gerettet; Flüsse, Wolken und Lichter laufen gleichmäßig durch. Zusätzlich prüft das Dashboard jede Sekunde, ob ein angehaltenes Bild eigentlich sichtbar ist.
- **Drehen des iPads oder Ändern der Fensterbreite** baute das Layout nicht mehr neu auf (zwei Teile teilten sich denselben Größen-Beobachter).

## [2026.11.3b19] - 2026-11-13

### Behoben
- **Modul 1 · Haus-Szene:** Antippen eines Raums brachte auf dem iPhone und in der App den Fehler „hsgo: CSS.escape is not a function“. Der Raum wird jetzt wieder angesprungen und kurz hervorgehoben.
- **Modul 1:** Die Geräte „Strom & Wärme · Wetter & Warnungen“ und „Strom & Wärme · Elektroauto & Wallbox“ wurden als Räume gezählt (zwei leere Räume „Strom & W…“ in der Haus-Szene, „0 von 8 Räumen“). Geräte der Module zählen nicht mehr als Raum.
- **Fehlende Symbole:** „Änderungen“ (Ladestatistik), Standby (Gerätestrom) und der Lern-Hinweis des Energie-Coachs zeigten statt ihres Symbols eine Tür.
- **Hinter den Kulissen:** Das Stylesheet hieß intern wie ein Werkzeug des Browsers (Ursache des Haus-Szene-Fehlers) und ist umbenannt. Eine doppelte, nie genutzte Seite „Wartung“ ist entfernt. Die Homeserver-Sicherung liest die Versionsnummer nicht mehr im Event-Loop (vermeidet die Warnung „blocking call“ im Log). Ungenutzte Importe aufgeräumt.

### Geändert
- **Updates gehören jetzt zu „Versionen & Updates“** (Einstellungen → System): Stand der Installation, „Jetzt prüfen“, „Was ist neu?“ und der Schalter „Auf neue Versionen hinweisen“ stehen ganz oben. Liegt ein Update bereit, zeigt die Zeile in den Einstellungen „Update“. Unter „Sichern & Wiederherstellen“ steht nur noch das Sichern.
- **Automatische Sicherungen kompakt:** zugeklappt nur eine Zeile („20 Bereiche gesichert · neueste Kopie …“). Aufgeklappt gruppiert nach Räumen, Modulen, Addons und System, je Bereich eine Zeile; die Stände zum Wiederherstellen erscheinen erst nach Antippen.
- Räume heißen in der Liste wie der Raum (statt „Raum“), Addons mit ihrem Namen (statt „addons“). Gelöschte Räume stehen als „Raum (gelöscht)“.

### Neu
- **Modul 19 · Hausfluss (v1.1 Build 1): „Woher kam der Strom?“** im Strom-Reiter, für Tag, Woche, Monat und Jahr.
  - Anteile am Hausverbrauch als Balken: Solar direkt, Akku, Netz und Sonstige, je mit kWh und Prozent; mehrere Solaranlagen oder Akkus einzeln.
  - Akku: entladen und geladen, mit Anteil aus Solar. Netz: Bezug (auch was davon in den Akku ging), Einspeisung und Saldo.
  - Kennzahlen „Unabhängig vom Netz“ und „Eigenverbrauch Solar“.
  - „Wohin ging der Solarstrom?“: ins Haus, in den Akku, eingespeist.
- **Addons in den Modulversionen:** „Modul- und Addon-Versionen“ zeigt installierte Addons mit Stufe, Version, Build, Status (pausiert, Fehler) und einem Link zum verfügbaren Update.

## [2026.11.3b18] - 2026-11-13

### Behoben
- **Modul 8 · Ladestatistik (v0.9 Build 2):** Wird einer Ladung ein anderes Fahrzeug zugeordnet, wandern kWh und Kosten jetzt auch unter „Fahrzeuge & Karten“ mit. Vorher blieb dort „Unbekannt“ stehen.
- Wird das Fahrzeug erst während einer Ladung erkannt, zählt der Anfang dieser Ladung nicht mehr als „Unbekannt“.
- „geändert“ erschien schon, wenn die Menge nur gerundet gespeichert wurde (z. B. 0,194 → 0,19 kWh). Die Menge zählt jetzt nur als geändert, wenn du sie wirklich änderst; solche falschen Markierungen werden beim Start bereinigt.

### Neu
- **Änderungen je Ladung:** Im Fenster „Ladung bearbeiten“ steht jetzt, was wann geändert wurde (Fahrzeug, Menge, Karte, Notiz, dienstlich). In der Liste: „bearbeitet“ bei jeder Änderung, „Menge geändert“ nur bei geänderter Menge.
- **„Unbekannt“ zuordnen:** Unter „Fahrzeuge & Karten“ ordnet „Zuordnen“ alle Energie ohne erkanntes Fahrzeug im angezeigten Zeitraum einem Fahrzeug zu – mit Eintrag bei jeder betroffenen Ladung.

## [2026.11.3b17] - 2026-11-13

### Neu
- **Modul 8 · Elektroauto & Wallbox (v0.9 Build 1): Vorabversion** – vierte Stufe aus dem Konzept „Modul 8 – Neue Optik“. Das Modul trägt jetzt die Stufe „Vorabversion“.
  - **Hausakku nicht ins Auto entladen** (Standard an): Was der Hausakku gerade abgibt, zählt nicht mehr als Überschuss. Vorher konnte das Auto im Modus „Sonne“ den Hausakku leer laden, weil dabei keine Einspeisung gemessen wurde. Braucht den Akku-Sensor unter Einstellungen → Haus.
  - **Auto vor dem Hausakku** (wahlweise): Was der Hausakku gerade aus Sonne lädt, darf zuerst ins Auto. Schließt „Hausbatterie zuerst laden“ aus.
  - **§ 14a EnWG – Dimmen durch den Netzbetreiber:** Signal (Steuerbox, Binärsensor oder Schalter) wählen; ist es an, lädt die Wallbox höchstens mit der eingestellten Leistung (Standard 4,2 kW). Steht in der Satz-Zeile und in „Warum gerade so?“.
  - **Anwesenheit:** Je Fahrzeug lässt sich wählen, wer es meistens fährt. Ist die Person weg, zeigen Banner und Satz-Zeile „unterwegs mit …“ statt „nicht angesteckt“.
  - **Ladenachweis:** Im Register Statistik „Ladenachweis“ – Ladungen eines Monats je Fahrzeug oder Karte mit Erstattungssatz (ct/kWh), als CSV oder zum Drucken bzw. als PDF sichern. Dafür liefert die Statistik jetzt alle gespeicherten Ladungen (bis 100) statt 30.
  - **Ladungen bearbeiten:** In der Ladestatistik eine Ladung antippen – Fahrzeug zuordnen, Menge korrigieren, Karte, „dienstlich“ und Notiz setzen oder die Ladung löschen. Tages- und Fahrzeugwerte rechnen mit. Eine von Hand geänderte Menge wird mit „geändert“ markiert; der gemessene Wert bleibt erhalten und steht im Ladenachweis (dort auch Filter „Nur dienstlich“). Nur für Administratoren.
  - **Startseite:** Kachel und Bubble „E-Auto“ nutzen jetzt die Werte aus Modul 8 – auch den geschätzten Ladestand und die Ladeleistung der Wallbox – und zeigen „lädt … · → 80 % ca. 17:40“.
  - **Robuster:** Meldet der Netz-Sensor drei Minuten lang keinen neuen Wert, wird mit Sonne nicht mehr erhöht (Hinweis in der Satz-Zeile). Antwortet die Wallbox fünf Minuten nicht, fragt Modul 8 nur noch alle 30 Sekunden statt alle 10.
  - Hinweis auf NFC-Tags für den Schnellstart (Einstellungen → Haus → Tags & Karten); Vorsorge bei Unwetter für das Auto gibt es bereits in Modul 9.

## [2026.11.3b16] - 2026-11-13

### Neu
- **Modul 8 · Elektroauto & Wallbox (v0.8 Build 1): Planung & Statistik** – dritte Stufe aus dem Konzept „Modul 8 – Neue Optik“.
  - **Ladeplan als ein Band:** Sonne als Fläche (aus Modul 16), Strompreis als farbiger Streifen (grün günstig → rot teuer), geplante Ladefenster als Rahmen mit kWh, Abfahrt als rote Linie, die Zeit danach ausgegraut, „jetzt“ und „morgen“ markiert. Darunter ein Satz („So wird geladen: morgen 05:00–06:00 zum günstigen Preis …“) und Kacheln für Geplant, Sonne, Kosten und Ersparnis.
  - **Statistik wie Modul 3 und 4:** Tag, Woche, Monat und Jahr mit Blättern; Kacheln Geladen, Sonnenanteil, Kosten, **Pro 100 km** und Gespart, jeweils mit ▲▼ gegenüber dem gleichen Zeitraum davor. Balken antippen öffnet den Tag bzw. Monat. Dazu Ladungen mit Fahrzeug und Karte, Fahrzeuge im Vergleich (mit €/100 km) und Summen je Karte.
  - **Geschätzter Ladestand (Beta):** Für Autos ohne Ladestand-Sensor gibst du unter „Aussehen & Sensoren“ einmal den Ladestand ein, danach rechnet Modul 8 beim Laden weiter (geladene kWh × 90 % ÷ Akkugröße). Angezeigt mit „≈“ und „geschätzt“; nach dem Abstecken als unsicher markiert. Damit funktionieren Ladelimit, Ladeband und Ladeplan auch ohne Sensor im Auto.
  - **Kilometer je Fahrzeug:** Der Kilometerstand wird je Fahrzeug fortgeschrieben – ein Wechsel zwischen zwei Autos ergibt keinen Sprung mehr.
  - **Sensoren für eigene Automationen** (Gerät „Strom & Wärme · Elektroauto & Wallbox“): Ladestand Elektroauto, Elektroauto fertig um, Nächster Ladestart, Sonnenanteil der Ladung.
  - **Ereignis `fenster_heizung_ladung_beendet`** mit Fahrzeug, Karte, kWh, Sonnenanteil, Kosten und Dauer – zum Beispiel für eine eigene Meldung aufs Handy.
- **Modul 8 · Elektroauto & Wallbox (v0.7 Build 2): Neue Optik** – zweite Stufe aus dem Konzept „Modul 8 – Neue Optik“ (Teil A). Abschaltbar unter Modul 8 → Einstellungen → Darstellung „Wie bisher“.
  - **Carport-Szene als Banner:** Hauswand mit Wallbox, Carport mit flach aufliegenden Modulen und das Auto in Form und Farbe des Fahrzeugs. Beim Laden leuchtet die Linie Sonne → Wallbox → Auto (gelb mit Sonne, orange mit Netz) und das Kabel. Nachts dunkler Himmel mit Mond. Groß: Ladestand → Ziel, darunter „fertig ca. …“.
  - **Autos realistischer (Build 2):** Alle vier Formen (Limousine, Kompakt, Kombi, SUV) neu gezeichnet – Proportionen wie echte Autos, Radläufe mit Spalt, Aero-Felgen, LED-Tagfahrlicht und Rücklicht, Schulterlinie und Lackspiegelung, Ladeklappe am hinteren Kotflügel, an der das Kabel steckt; SUV mit dunkler Radlauf-Verkleidung. Weiterhin allgemein gehalten, ohne Logos und keinem echten Modell nachgebaut. Gilt für Banner, Fahrzeugliste und „Aussehen & Sensoren“.
  - **Satz-Zeile** statt Chip-Leiste: „Alles läuft. Dolphin Surf lädt mit Sonne …“ – Hinweise mit Sprung zur Lösung bleiben.
  - **Ladeband jetzt → Ziel** mit Abfahrtszeit, „noch … kWh“, „fertig ca.“ und Limit.
  - **Kacheln 2.0** mit HD-Symbolen: Ladestand, Ladeleistung mit Herkunfts-Ring (Sonne/Netz), diese Ladung mit heute, Reichweite. Kein Wert steht mehr doppelt.
  - **Modus-Karten** mit Symbol und Wirkung in einem Satz, Regelung an/aus und Schnellstart im selben Block.
  - **Heute als Zeitleiste** (wann mit Sonne, wann mit Netz geladen wurde, was noch geplant ist) und **„Warum gerade so?“** mit Uhrzeit, Entscheidung und Grund.
  - **Register neu:** Laden · Planung · Statistik · **Fahrzeuge** · Einstellungen, mit HD-Symbolen.
  - Handy: Text oben, Szene unten im Banner, Kacheln und Modus-Karten 2 × 2. Helle Ansicht und Tablet-Modus (ohne Chips im Banner) angepasst.
  - Das Protokoll der Regelung ist lesbarer („Laden an, 6 A“ statt „frc=an, amp=6 A“).
- **Modul 8 · Elektroauto & Wallbox (v0.6 Build 1): Technik –** erste Stufe aus dem Konzept „Modul 8 – Neue Optik“ (Technik). Optisch ändert sich noch wenig, die Grundlage für die neue Optik steht.
  - **Andere Wallboxen über Home Assistant (Beta):** Neuer Eintrag „Andere Wallbox“ im Store. Die Integration sucht Wallbox-Integrationen in Home Assistant (z. B. Easee, Zaptec, Wallbox, KEBA, Alfen, openWB, OCPP) und schlägt die Entitäten vor: Laden an/aus, Ladestrom, Leistung, Status, Stecker, Phasen, Energie. „Werte lesen“ prüft die Auswahl vor dem Speichern. Danach regelt Modul 8 diese Wallbox genauso wie die go-e (Sonne, Sonne + Netz, Voll, Ladeplan, Hausanschluss-Schutz). Ohne Schalter-Entität wird nur angezeigt. Die go-e bleibt direkt im Heimnetz angebunden.
  - **Sensoren und Aussehen je Fahrzeug:** Jedes Fahrzeug hat jetzt eigenen Ladestand-, Kilometer- und Reichweiten-Sensor, eigene Akkugröße, Marke, Modell, Form und Farbe („Aussehen & Sensoren“ am Fahrzeug). Lädt das zweite Auto, zeigt und plant Modul 8 mit dessen Ladestand.
  - **Fahrzeug ohne Karte:** Für Wallboxen ohne Kartenleser (und optional bei der go-e) gilt ein fest gewähltes Fahrzeug.
  - **Übernahme:** Beim ersten Start werden die bisherigen Fahrzeug-Sensoren und das Aussehen einmalig zum ersten Fahrzeug übernommen – gibt es noch keins, wird es mit dem bisherigen Modus und Limit angelegt. An der Regelung ändert sich dadurch nichts.
  - **Ein Ladeplan:** Die Planung zeigt jetzt genau den Plan, nach dem das Backend die Wallbox regelt. Die zweite Rechnung im Browser ist weg (sie konnte abweichen, z. B. rechnete sie bei fest 1 Phase trotzdem mit 3 Phasen).
  - **Quellen zentral:** Netz-Sensor, Hausakku und Preis-Sensor kommen aus den Haus-Werten (Einstellungen → Haus). PV-Prognose „Automatisch“: aus Modul 16 (mit dessen Anlagen-Auswahl und Korrektur), sonst Forecast.Solar direkt.
  - **Ladeplan „Sonne zuerst, dann günstig“ genauer:** Braucht das Auto weniger als eine volle Stunde Ladung, zählt der Sonnenanteil jetzt für die wirklich benötigte Leistung. Vorher wurde z. B. nachts zum günstigsten Preis geplant, obwohl Laden jetzt mit halber Sonne billiger war.
  - Ladestrom jetzt bis 32 A (22-kW-Wallboxen).
  - Messwerk zeigt die Sensoren je Fahrzeug und die Entitäten der Wallbox mit „genutzt in“.

### Technik
- Modul 8 im Dashboard-Quelltext in eigene Teile aufgeteilt (`10a-laden`, `10b-planung`, `10c-statistik`, `10d-fahrzeuge`, `10e-wallbox`).
- Neuer `wallbox_adapter.py` (go-e und Home-Assistant-Wallboxen) und 32 Tests für Regelung, Phasen, Hausanschluss-Schutz, Ladeplan, Statistik, Übernahme und Adapter (`tests/test_wallbox.py`).

## [2026.11.3b15] - 2026-11-13

### Behoben
- **Entwickler-Zugang zum Testen aus – kein Weg zurück:** War der Entwickler-Zugang ausgeschaltet und eine Testversion installiert, zeigte das Panel nur die Beta-Sperre ohne Zugang zu „Sponsoren verwalten“. Die Sperre und das Schlüssel-Fenster zeigen jetzt für den Entwickler „Entwickler-Zugang wieder einschalten“ und „Sponsoren verwalten“. Die Beta-Sperre bietet außerdem „Schon Sponsor? Freischalten“ (Anmeldung mit GitHub).
- **GitHub-Anmeldung besser platziert:** eigene, gut sichtbare Karte „Du sponserst schon? – Mit GitHub freischalten“ direkt unter dem Kopf des Sponsor-Bereichs und „Schon Sponsor?“ direkt unter dem Text der Beta-Sperre. Die doppelten kleinen Knöpfe (oben rechts, im Kopf, in der Fußzeile) sind weg.

## [2026.11.3b14] - 2026-11-13

### Neu
- **Sponsor · Mit GitHub freischalten** (Konzept Sponsor-Freischaltung, Stufe 2): Sponsoren schalten sich direkt im Panel frei – „Schon Sponsor? Freischalten“ in der Lounge, Code auf github.com/login/device bestätigen, fertig. Kein Schlüssel per Mail mehr nötig.
  - Die Integration fragt GitHub mit dem Token des Sponsors (nur `read:user`), ob und mit welcher Stufe er Maddog3010 sponsert. Kein eigener Server, kein Client-Secret (OAuth-App „Strom & Wärme“ mit Device Flow).
  - **Stufen:** $1 im Monat und $5 einmalig = ♥ Sponsor, $3 im Monat und $10 einmalig = ★ Sponsor Max. Freie Beträge nach Höhe (monatlich ab $3, einmalig ab $10 = Max). Die Zuordnung steht zusätzlich in `sponsor_gesperrt.json` (`github_stufen`) und lässt sich ohne neue Version ändern.
  - **Laufzeit:** monatlich, solange das Sponsoring läuft (danach 7 Tage Kulanz); einmalig Sponsor 1 Jahr, einmalig Max 3 Monate und danach bis 1 Jahr wieder Sponsor. Das Datum der Zahlung wird beim ersten Abruf gespeichert, weil GitHub Einmal-Zahlungen nur etwa 30 Tage meldet.
  - Prüfung einmal am Tag und mit „Jetzt prüfen“; ohne Internet gilt der letzte Stand 14 Tage. Wechsel zu Max, Verlängerung und Ende werden automatisch erkannt.
  - Schlüssel bleiben als zweiter Weg (Geschenke, Tester). Hat jemand beides, gilt die höhere Stufe.
  - Lounge, Einstellungen und Beta-Sperre zeigen die Dollar-Stufen statt „3 Monate für 9 €“. In „Sponsoren verwalten“ neuer Abschnitt „Freischaltung über GitHub“.
  - Das Token liegt nur im Sponsor-Speicher von Home Assistant (nicht in den Server-Sicherungen) und kann unter GitHub → Settings → Applications widerrufen werden.

### Behoben
- **Kopf am Handy:** „Strom & Wärme“ bricht nicht mehr in zwei Zeilen um, der Modulname ist wieder lesbar (statt „Fenster …“) und die Modulversion zeigt am Handy nur „v1.8“ statt abgeschnitten „v1.8 · Build“. Knöpfe und Logo im Kopf sind dafür etwas kompakter.

## [2026.11.3b12] - 2026-11-12

### Behoben
- **Modul 16 · Prognose zu hoch bei mehreren Diensten (v1.0 Build 2):** Bisher wurden alle gefundenen Solar-Prognosen addiert. Stehen für dieselben Module mehrere Dienste in Home Assistant – zum Beispiel Forecast.Solar, Solcast und Open-Meteo – war die Summe zwei- bis dreimal so hoch (Beispiel: Anlagen einzeln morgen 21,9 + 17,1 + 8,5 = 47,5 kWh statt rund 20 kWh).
  - **Anlagen wählen:** Einstellungen → Modul 16 → Prognose-Quelle listet jetzt alle gefundenen Anlagen nach Dienst mit heute und morgen. Jede lässt sich einzeln an- und abwählen, dazu Knöpfe „Nur Forecast.Solar“, „Nur Solcast“ usw.
  - **Ohne eigene Wahl** gilt, was im **Energie-Dashboard** von Home Assistant als Solar-Prognose eingetragen ist. Ist dort nichts eingetragen, werden wie bisher alle addiert – bei mehreren Diensten mit **Warnung** oben auf der Seite („Prognose vermutlich doppelt gezählt“, mit Knöpfen) und im Einrichtungs-Check.
  - Eine neue Auswahl wird aus den schon abgerufenen Werten berechnet, ohne neuen Abruf. Die Prognose von heute wird neu festgehalten, und die **Korrektur lernt ab diesem Tag neu** – die alten Tage wurden mit der zu hohen Summe verglichen (daher der gelernte Faktor ×0,83).
  - „Anlagen einzeln“ zeigt bei mehreren Diensten den Dienst je Anlage und im Kopf heute und morgen.
- Modul 16: Fehler in „Anlagen einzeln“ behoben, der die Seite mit mehreren Diensten nicht laden ließ.
- **Startseite · Schrift über den Kachelrand:** Die Stufen-Plakette („In Entwicklung“, „Vorab“, „Beta“) neben „Modul 10“ lief bei schmalen Kacheln über den Rand und unter den Statuspunkt. Sie bricht jetzt in die nächste Zeile um und heißt auf der Kachel kurz „Entwicklung“ bzw. „Vorab“ (der volle Name steht im Tooltip). Lange Modulnamen werden mit Silbentrennung umbrochen („Wärme-pumpe“), und der Name hält mehr Abstand zum Statuspunkt.
- **Startseite · Kachel Prognose:** zeigt eine Zahl wie die anderen Kacheln („44,7 kWh · morgen erwartet“, tagsüber „11,2 kWh · von 17,8 kWh heute“ mit Ring) statt eines Satzes in großer Schrift, der über die Kachel lief.

## [2026.11.3b11] - 2026-11-12

### Neu
- **Modul 9 · Wetter & Warnungen v0.6 (Stufe 1 der Fertigstellung)** nach Konzept_Modul9_Wetter-Warnungen:
  - **Alle amtlichen Warnungen:** Beim Deutschen Wetterdienst werden jetzt alle gleichzeitigen Warnungen gelesen (bisher nur die erste), jeweils mit Stufe, Beginn, Ende, Beschreibung, Hinweis und Gebiet. NINA und MeteoAlarm mit Gültigkeit, Absender und Gebiet; Hochwasser- und Bevölkerungsschutz-Meldungen werden erkannt. Abgelaufene Warnungen fallen weg, doppelte (z. B. DWD und NINA mit derselben Warnung) werden zusammengefasst. Eigene Karte „Amtliche Warnungen“ im Modul.
  - **Vorabinformationen des DWD** werden nicht mehr ausgefiltert, sondern als „Vorab“ gezeigt und wie eine Vorwarnung gemeldet (abschaltbar). Die DWD-Vorabwarnstufe wird jetzt auch mit deutschen Entitätsnamen („…_vorwarnstufe“) sicher erkannt. Ist eine Warn-Entität gewählt, kommen die anderen Entitäten derselben Integration automatisch dazu.
  - **Stufen 1–4 wie beim DWD** für eigene Warnungen: Sturm mit zwei Grenzen (Stufe 1 ab 60, Stufe 3 ab 90 km/h, dazwischen Stufe 2, darüber + 30 km/h Stufe 4), Gewitter Stufe 2, Hagel Stufe 3, Starkregen Stufe 1–3, Hitze Stufe 1–2. Eine Stufe steigt sofort (Sturm nach zwei Messungen) und sinkt erst nach zehn Minuten unter der Grenze. Meldung, wenn eine Warnung eine Stufe höher geht.
  - **Hagel ist eine eigene Warnung** (bisher zusammen mit Gewitter), damit Aktionen anders sein können.
  - **Starkregen in mm pro Stunde** (Stufe 1 ab 10, Stufe 3 ab 25 mm/h, einstellbar) aus einem optionalen Regenmesser oder der Niederschlagsmenge der Vorhersage. Ohne Menge zählt „Starkregen“ der Wetter-Entität wie bisher.
  - **Frost & Glätte:** Glätte bis 1 °C (einstellbar) bei Nässe – Regen, Schnee, Nebel oder ab 90 % Luftfeuchte.
  - **Wetterquelle wird geprüft:** Ist die Wetter-Entität nicht verfügbar oder seit 90 Minuten ohne neuen Wert, zeigt das Modul einen Hinweis mit Weg zur Wetterquelle und meldet es einmal (abschaltbar).
  - **Vorhersage 48 Stunden** statt 24 im Zwischenspeicher, mit Niederschlag und Luftfeuchte. Die Karte „Nächste Stunden“ bleibt bei 12 Stunden.
  - **Einheitliches Warnmodell** (Art, Quelle, Stufe, von, bis, Titel, Text, Vorab) im Backend, `wx_get` liefert zusätzlich `warnings`, `state.officials` und `state.stale`. Grundlage für die neue Optik in v0.7.
  - Bis zu 16 Aktionen (bisher 12), Verlauf mit 60 Einträgen (bisher 40).
- **Modul 9 · Neue Optik Stufe 1 (v0.7):**
  - **Wetter-Szene als Banner:** dasselbe Haus wie auf der Startseite und in Modul 1, Himmel nach Tageszeit und Wetter. Die Warnung ist im Bild zu sehen: Baum neigt sich und Windstreifen bei Sturm, Blitz bei Gewitter, Hagelkörner, Schnee und Eiszapfen bei Frost und Glätte, große Sonne und Flimmern bei Hitze, dunkler Himmel ab Stufe 3. Rollläden sind unten und die Markise eingefahren, wenn eine Aktion das getan hat. Bewegung folgt der Einstellung „Animationen“ (Aus · Dezent · Voll).
  - **Stufenfarben wie beim DWD** (1 gelb, 2 orange, 3 rot, 4 violett) als Streifen und Stufen-Pille im Banner. Die höchste Warnung bestimmt Farbe und Text; ist eine amtliche Warnung höher als die eigene Messung, steht sie vorne.
  - **Warnkacheln 2.0** statt der Liste „Warnstufen“: eine ruhige Kachel je Warnung mit Symbol, Zustandspunkt, Wert groß, Bogen gegen die Grenze, Stufe und Grenzen.
  - **Aufteilung:** Banner, Eigene Warnungen, daneben Amtliche Warnungen und Nächste Stunden, darunter Aktionen und Protokoll. Am Handy steht die Szene oben, der Text darunter, Kacheln im 2er-Raster.
- **Modul 9 · Zeitleiste und Aktionen 2.0 (v0.8):**
  - **48-Stunden-Zeitleiste:** eine Zeile je Warnart, Bänder in Stufenfarbe, amtliche Warnungen oben (Vorabinformationen gestreift), „Jetzt“-Linie, der nächste Tag hinterlegt. Umschalter „Zeitleiste | Wind“, die bisherige Windkurve mit Sturmgrenze bleibt unter „Wind“.
  - **Aktionen als Ablaufkarten** („Was passiert“): Auslöser → Gerät → Zustand (erledigt, zurück um …, wartet mit Grund, ausgesetzt, nicht gefahren), darunter die Bedingungen.
  - **Aktions-Planer:** je Aktion **ab Stufe** (1–4), **nur wenn** (immer, abwesend, jemand zu Hause, tagsüber, nachts) und **Verzögerung** (0–60 Min.). Aktionen laufen in der Reihenfolge der Liste (nach oben schieben) und warten, bis Stufe, Verzögerung und Bedingung passen. Steigt eine Warnung, laufen Aktionen der neuen Stufe nach.
  - **Aussperrschutz:** Für Rollläden kann ein Tür- oder Fensterkontakt gewählt werden. Ist er offen, fährt der Rollladen nicht zu, es kommt eine Meldung, und er fährt, sobald zu ist.
  - **Verstanden, Alles schließen, Aussetzen** als Knöpfe unter dem Banner: Quittieren stoppt Wiederholungen bis zur nächsten Stufe; „Alles schließen“ schließt alle Rollläden und Markisen aus den Aktionen sofort (mit Aussperrschutz); Aktionen lassen sich für 2 Stunden aussetzen.
  - **Knöpfe in der Handy-Meldung** (Home-Assistant-App): „Verstanden“, „Alles schließen“, „Aktionen 2 Std. aussetzen“. Optional **kritische Mitteilung ab Stufe 3** (kommt auch bei „Nicht stören“).
  - **Fenster-Erinnerung 2.0:** wiederholt sich alle 15 Minuten, bis das Fenster zu ist oder quittiert wurde (abschaltbar).
  - **Einstellungen → Modul 9 mit Reitern** Warnungen · Aktionen · Meldungen.
  - Neue WebSocket-Befehle `wx_ack`, `wx_pause` und `wx_close`; `wx_get` liefert zusätzlich `tl` (Zeitleiste) sowie `state.pause`, `state.acked` und den Zustand jeder Aktion.
- **Modul 9 · Erweiterungen (v0.9, jetzt Vorabversion):**
  - **Vorsorge** als eigene Karte mit Knopf („was du jetzt tun kannst“), blickt 3–24 Stunden voraus:
    - **Hausakku voll halten** ab Unwetter Stufe 3, solange der Akku unter 95 % ist (Ladestand aus Haus › Energiequellen); optional ein Skript, Schalter oder Knopf, der Netzladen startet, auf Wunsch automatisch einmal je Unwetter.
    - **Auto vorladen** (Modul 8): ist das Auto unter dem eingestellten Ladestand (Standard 50 %), startet „Jetzt laden“ den Schnellstart bis zum Ziel; auf Wunsch automatisch, wenn angesteckt.
    - **Auto unterstellen** bei Hagel, **Hitzeschutz** (tagsüber gewählte Rollläden schließen, abends lüften, sobald es draußen unter 24 °C ist) und **Frost-Hinweis** (Außenwasserhahn, Leitungen, Pflanzen, Scheibe).
  - **Alarm auf dem Wandtablet:** ab der eingestellten Stufe (Standard 3) weckt eine Warnung das Tablet mit „Warnungen wecken auf“ (auch über Fully/Bildschirm-Schalter) und zeigt eine Vollbild-Karte mit Szene, Stufe, erledigten und offenen Punkten sowie „Verstanden“ und „Alles schließen“.
  - **Startseite:** Hinweise zeigen eigene Warnungen mit Stufe, jede amtliche Warnung einzeln (aktuell als Warnung, „Bald“ und „Vorab“ als Hinweis) und offene Vorsorge-Punkte; die Wetter-Kachel nennt die Stufe. Doppeltes „Amtliche Warnung: Amtliche Warnung …“ behoben.
  - **Sensoren für Automationen:** neues Gerät „Strom & Wärme · Wetter & Warnungen“ mit **Warnstufe** (0–4, alle Warnungen als Attribut) und je einer Stufe für Sturm, Gewitter, Hagel, Starkregen, Frost & Glätte und Hitze.
  - **Ereignis `fenster_heizung_wetter_warnung`** bei Beginn, Stufenwechsel, Ende, amtlicher Warnung, Quittung und Vorsorge (Felder `typ`, `art`, `name`, `stufe`, `quelle` …).
  - **Verlauf statt Protokoll:** 90 Tage mit Filter (Alle, Warnungen, Aktionen, Fenster & Meldungen) und „Mehr anzeigen“.
  - Neuer WebSocket-Befehl `wx_vor`; `wx_get` liefert zusätzlich `vor` und `level`.

### Geändert
- **Einmalige Übernahme alter Einstellungen** von Modul 9: Hagel wird so eingeschaltet wie bisher Gewitter, Aktionen und Fenster-Erinnerung für Gewitter gelten auch für Hagel, Sturm Stufe 3 = bisherige Grenze + 30 km/h. Der Stand davor wird vorher automatisch gesichert (Einstellungen → System → Sichern & Wiederherstellen).

### Technik
- 29 neue Tests für Modul 9 (`tests/test_wetter.py`): Stufen, Hysterese, Glätte, Starkregen, DWD mit mehreren Warnungen und Vorabinformation, NINA, MeteoAlarm, Zusammenfassen, Übernahme alter Einstellungen, veraltete Quelle und der Ablauf im Manager.

## [2026.11.3b10] - 2026-11-12

### Neu
- **Startseite · Neue Optik Stufe 1** nach Konzept_Startseite_Neue-Optik:
  - **Gesamt-Ampel oben:** sagt zuerst, ob alles in Ordnung ist – drei Stufen „Alles in Ordnung“ (türkis), „2 Hinweise“ (bernstein) und „Warnung: …“ (rot) mit den ersten Hinweisen darunter. Antippen springt zu den Hinweisen. Als Warnung zählen jetzt auch Frost, Sturm, Gewitter, Hitze, Starkregen und amtliche Warnungen aus Modul 9 sowie ausgelöste oder nicht erreichbare Melder aus Modul 11. Infos wie die Müllabfuhr lassen die Ampel grün.
  - **Zustandsfarben wie in Modul 1:** Türkis gut, Blau Info, Orange aktiv (heizt, lädt, Licht an), Bernstein Hinweis, Rot Warnung, Grau aus – an Kacheln, Hinweisen und Bubbles, hell und dunkel.
  - **Kacheln mit HD-Symbolen** aus der gemeinsamen Grafik-Bibliothek, Zustand als Punkt oben rechts und ruhiger Rand. Fenster & Heizung zeigt, wie viele Räume heizen, das E-Auto „lädt“, Wetter die aktive Warnung.
  - **Zehn neue HD-Symbole** (Wetter, Lüftung, Rollläden, Garten, Rauchmelder, Wartung, Mülltonne, Saugroboter, Alarm, Personen), damit alle Module auf der Startseite dieselbe Bildsprache haben.
  - **Bubbles neu (Lab):** rund mit Ring in Zustandsfarbe; bei Batterie, E-Auto und Personen zeigt der Ring den Anteil.
- **Startseite · Neue Optik Stufe 2:**
  - **Kacheln 2.0:** Jede Kachel zeigt die wichtigste Zahl groß – Fenster & Heizung „2 heizen“ (sonst Ø Raumtemperatur), Warmwasser °C, Energie Anteil aus Sonne, Gerätestrom das laufende Gerät mit „noch ~ Min.“, E-Auto Ladestand, Wetter Temperatur, Melder, Müllabfuhr „Morgen“, Licht „3 an“, Akku, Strompreis. Rechts ein **Ring** (Anteile) oder ein **Mini-Verlauf** der letzten 24 Stunden aus der Home-Assistant-Historie (einmal je 10 Minuten abgerufen). Darunter der Zustand in Worten.
  - **Fünf Zustände** je Kachel: gut, aktiv, Hinweis, Warnung (z. B. Fühler oder Thermostat offline, Auto nicht erreichbar) und aus (entsättigt). Die Farbe blendet bei einem Wechsel weich über.
  - **Kachelgröße S, M, L** (Einstellungen → Startseite → Darstellung): S nur die Zahl, M Zahl mit Ring oder Verlauf, L mit großem Verlauf. Im Tablet-Modus größer.
  - **Hinweise-Zentrale:** sortiert nach Warnung, Hinweis, Info; an jedem Hinweis Bild, Quelle und Zeit („Modul 1 · seit 24 Min.“), Knöpfe **Ansehen** und **Später** (in 1 Stunde, heute Abend, morgen früh – gilt für das jeweilige Gerät, Alarme lassen sich nicht verschieben). Müllabfuhr mit **Erledigt**. Ab vier Hinweisen „+N weitere“. Ein Hinweis verschwindet von selbst, sobald die Ursache weg ist. Verschobene Hinweise zählen nicht in der Gesamt-Ampel; „Wieder zeigen“ holt sie zurück.
- **Startseite · Neue Optik Stufe 3:**
  - **Haus-Kopf:** das ganze Haus als Szene mit Himmel nach Tageszeit (sun.sun) und Wetter (Haus-Werte), derselbe Himmel wie in Modul 1 und 3. PV-Module glänzen bei Überschuss, bei Frost oder Schnee liegt Schnee auf dem Dach, der Schornstein raucht, wenn geheizt wird, ein offenes Fenster klappt auf, bei Abwesenheit sind die Rollläden unten, das Auto aus Modul 8 steht daneben (mit Blitz beim Laden). Darüber Begrüßung, Gesamt-Ampel, Chips (Draußen, PV, wer zu Hause ist, Alarm) und eine Tageszeile (gespartes Heizöl/Gas heute, Anteil aus Sonne). Haus-Stile und Himmel-Themen für Sponsoren wie in Modul 1. Am Handy steht die Szene oben, der Text darunter.
  - **Wetter als Szene:** Himmel mit Temperatur, Warnungen aus Modul 9 färben die Karte, vier Tage Vorhersage, **Frost heute Nacht** aus der Stundenvorhersage (auch als Hinweis), mit Lab „Wäsche-Wetter“ eine Zeile dazu.
  - **Personen mit Zustandsring** (türkis zu Hause, blau unterwegs), Entfernung und **„kommt in ~ Min.“**, geschätzt aus der kleiner werdenden Entfernung; ab 20 Minuten oben „… kommt gleich“ (mit Lab „Smart Vorheizen“: „Heizung wird vorbereitet“).
  - **Alarm:** großes Schild mit Zustand; ist Schalten erlaubt, **gedrückt halten** (1,2 Sekunden) und danach wie bisher bestätigen. Ab Werk weiter aus.
  - **Tablet-Wandansicht:** Gesamt-Ampel groß oben, aus drei Metern lesbar; das Ruhebild zeigt die Haus-Szene unter Uhr und Ampel.
  - Einstellungen → Startseite → Darstellung → **Kopfbereich**: Szene, Ampel (nur die Zeile) oder Einfach (wie bisher).
- **Startseite · Neue Optik Stufe 4:**
  - **Bewegung Aus / Dezent / Voll** (Einstellungen → Startseite → Darstellung). Dezent (Standard): Warnpunkt pulsiert, die große Zahl einer Kachel zählt bei Änderung weich nach, Ringe füllen sich neu, Zustandswechsel blendet über. Voll: zusätzlich ziehende Wolken, Regen, Schnee, Rauch und Glanz der PV-Module in der Haus-Szene. Im Tablet-Modus eigene Stufe, ab Werk aus. „Bewegung reduzieren“ des Geräts gilt immer.
  - **Vorlagen** Familie, Technik und Minimal stellen Kopfbereich, Kachelgröße, Karten und Bubbles in einem Schritt um, mit **Rückgängig**.
  - **Kacheln wählen:** Kacheln der Startseite (und des Tablets) ein- und ausblenden und sortieren, das Modul bleibt dabei eingeschaltet.
  - **Schnellaktionen:** dieselben festen Aktionen wie bei Tags & Karten als Knöpfe unter dem Kopf (z. B. Alle Räume auf „Abwesend“, Warmwasser einmal aufheizen, Schnellstart Wallbox, Melder geprüft, Tonne ist draußen, Entfeuchter heute aus). Ab Werk aus; der Admin wählt bis zu acht. Aktionen, die das ganze Haus oder die Sicherheit betreffen, werden immer bestätigt. Auch Nutzer ohne Admin-Rechte können sie auslösen, aber nur aus dieser Liste (prüft das Backend); jede Auslösung steht im Protokoll von Tags & Karten. **Langes Drücken auf eine Kachel** zeigt die Schnellaktionen dieses Moduls.
  - **Leerzustand:** Ist kein Modul aktiv oder sind alle Kacheln ausgeblendet, zeigt „Zuhause“ ein Bild mit Knopf „Modul hinzufügen“ bzw. „Kacheln wählen“.
  - Einstellungen → Startseite → **Darstellung**: „Neue Optik“ oder „Wie bisher“. Reihenfolge, ausgeblendete Karten und Direktlinks bleiben unverändert.

### Technik
- Neue Schnittstellen `fenster_heizung/tg_quick_set` (Admin) und `fenster_heizung/tg_quick` für die Schnellaktionen; die Liste liegt bei Tags & Karten (`quick`, höchstens 8, nur feste Aktionen).

### Geändert
- **Modul 1 · Haus-Szene (v1.8 Build 8):** Die Solarmodule liegen jetzt gerade auf der Dachfläche (unten vier, darüber drei, links vom Schornstein) statt als schräge Leiste über der Dachkante – wie im Haus-Kopf der Startseite und in der Energie-Szene von Modul 3. Bei Überschuss hellblau mit sanftem Glanz, bei Frost mit Schneerand.
- Tablet-Modus: Wetterwarnungen und Melder offline wecken das Display nicht, ein Rauchalarm weiterhin.

## [2026.11.3b9] - 2026-11-12

### Neu
- **Modul 1 · Messräume im Grundriss (v1.8 Build 7):** Messräume lassen sich jetzt einer Fläche im Grundriss zuordnen – automatisch über den Namen, beim Antippen einer freien Fläche („Raum zuordnen“ zeigt jetzt auch die Messräume) oder in den Raumeinstellungen des Messraums unter **„Im Grundriss“**. Ein Messraum hat genau eine Fläche; „nicht im Grundriss“ hebt auch die Zuordnung über den Namen auf. Im Grundriss zeigt die Fläche Temperatur, Luftfeuchte und den Zustand („Zu feucht“, „Batterie“), statt des Heizkörpers ein Thermometer. Antippen öffnet die Einstellungen des Messraums.
- **Messräume innen oder außen:** In den Raumeinstellungen „Wo misst der Sensor?“ – **Innen** wie bisher mit Wohlfühlbereich und Schimmelhinweis, **Außen** (Terrasse, Garten, Carport) ohne Wohlfühlbereich und Schimmel, dafür mit Hinweis **Frost** (ab 0 °C) und **Glätte möglich** (bis 3 °C bei mindestens 85 % Luftfeuchte). Die Raumkarte trägt „Außen“, der Ring zeigt −10 bis 30 °C. Im Grundriss wird ein Außen-Messraum als Außenfläche mit gestricheltem Rand und Wetterbild gezeichnet (bei Frost eine Schneeflocke). Ein Knopf übernimmt den Sensor als **Außentemperatur des Hauses** (Einstellungen → Haus → Wetter), die auch Sommerbetrieb, Schimmelhinweise und Lüften nutzen.
- Grundriss-Kopfzeile: **„Außen“** mit Temperatur, Luftfeuchte und Frost-Hinweis (vom Außen-Messraum, sonst von der Außentemperatur des Hauses); der Durchschnitt heißt jetzt „Ø innen“ und lässt Außenflächen weg.

### Geändert
- Grundriss: **„nicht zugeordnet“ zählt jetzt über alle Geschosse** und nennt sie („3 nicht zugeordnet · EG 1, OG 2“). Flächen, bei denen bewusst „Kein Raum aus Modul 1“ gewählt ist, zählen nicht mit. Antippen (Admin) wechselt zum passenden Geschoss und öffnet „Raum zuordnen“ für die nächste freie Fläche.
- Grundriss: In schmalen Räumen wird der Name gekürzt, wenn rechts oben eine Hinweis-Plakette steht, und eine zu breite Plakette wird zum Punkt mit „!“.

## [2026.11.3b8] - 2026-11-12

### Neu
- **Modul 16 Solar-Prognose ist stabil (v1.0 Build 1)** – Stufe 4 aus Konzept_Modul16_Neue-Optik:
  - **Anlagen einzeln:** Bei zwei oder mehr Anlagen (zum Beispiel zwei Dächer bei Forecast.Solar oder Dach und Balkon) zeigt eine Karte jede Anlage mit Tageswert, Anteil, kleiner Tageskurve und dem Wert für morgen. Gleiche Namen werden durchnummeriert.
  - **Sensoren für Automationen:** neues Gerät „Strom & Wärme · Solar-Prognose“ mit fünf Sensoren – Prognose heute, morgen, Rest heute, heute korrigiert (in kWh) und **Beginn der besten Zeit** (Zeitstempel). Die Werte kommen aus dem Zwischenspeicher, es gibt keine zusätzlichen Abrufe. Die Sensoren erscheinen nach einem Neustart von Home Assistant.
  - **Startseite:** Die Kachel „Prognose“ zeigt einen kleinen Sonnenbogen mit der Sonne an der aktuellen Stelle (nachts den Mond) und „11,2 von 17,8 kWh“, abends den Wert für morgen. Bei Schnee oder Störung färbt sie sich gelb.
  - **Tablet:** eigene Wandansicht mit vier großen Zahlen (heute erwartet, bisher, noch zu erwarten, morgen) und der Tageskurve, ohne Verlauf und Kalender.
  - **Ertragssensor vorschlagen:** Ist im Energie-Dashboard ein Solarertrag eingetragen und in Modul 16 noch keiner gewählt, schlagen die Einstellungen ihn mit einem Knopf vor (als Gesamtzähler).
  - **Einrichtungs-Check** oben in den Einstellungen: Prognose kommt an, Abruf aktuell, Ertragssensor und Einheit, Ertrag je Stunde, Korrektur gelernt, Sensoren vorhanden – jeweils mit Hinweis, was fehlt. Darunter die fünf Sensoren mit Wert, Antippen öffnet die Details.
  - Der Hinweis „Vorabversion“ entfällt.

### Geändert
- **Modul 1 · Grundriss in der neuen Optik (v1.8 Build 6):** Die Räume sind jetzt dunkle Kacheln mit Licht in der Temperaturfarbe statt voller Farbflächen, mit Abstand zueinander und runden Ecken – wie die Raumkarten der Detail-Ansicht. Unter der Temperatur steht das Ziel (und die Luftfeuchte, wenn Platz ist), unten die **Status-Plakette** mit Punkt („Ziel erreicht“, „Heizt“, „Fenster offen · 7 Min.“). Der Statustext war vorher in der Raumfarbe kaum lesbar. Heizkörper als HD-Bild, beim Heizen orange mit aufsteigender Wärme und leicht pulsierendem Rand. Fenster mit Glas und Sprosse, offen kräftig blau mit aufgeklapptem Flügel. Hintergrund als Punktraster wie ein Bauplan, darüber eine Zusammenfassung: Durchschnitt, wie viele Räume heizen, offene Fenster, nicht zugeordnete Räume. In kleinen Räumen (Handy) bleibt nur der farbige Punkt.
- **Lab „Lernfaktor für die Prognose“** ist entfallen: Die korrigierte Prognose ist seit dieser Version fest in Modul 16 eingebaut (Einstellungen → Modul 16 → Korrigierte Prognose) und rechnet robuster (Median statt Summe, ab 7 Tagen).

### Technik
- Tests für die Rechenfunktionen von Modul 16 unter `tests/test_solar.py` (laufen ohne Home Assistant: `python3 -m pytest tests`).
- **Modul 16 · Stufe 3 Treffsicherheit & Tipps (v0.9 Build 5):**
  - **Korrigierte Prognose:** Modul 16 lernt aus den letzten 14 Tagen mit Ertrag, wie stark deine Anlage von der gelieferten Prognose abweicht (Median Ertrag/Prognose, ab 7 Tagen, begrenzt auf ×0,6 bis ×1,4 – ein einzelner Schneetag verzieht den Faktor nicht). Banner, Kacheln und Kurve zeigen dann die korrigierte Prognose, „Heute erwartet“ trägt die Plakette „korrigiert“ und nennt den gelieferten Wert und den Faktor. Die Treffsicherheit misst weiter die Prognose, wie die Quelle sie liefert. Abschaltbar unter Einstellungen → Modul 16 → Korrigierte Prognose.
  - **Wie gut war die Prognose?** 7, 14 oder 30 Tage als Säulen mit Abweichung je Tag oder als **Treffer-Kalender** (grün ±10 %, gelb ±20 %, rot darüber). Antippen eines Tages zeigt ihn als **Kurve**: Prognose vom Morgen gegen den Ertrag je Stunde (für die Tage, an denen Stundenwerte gespeichert sind).
  - **Empfehlungen mit Startzeit:** In der besten Zeit stehen die Geräte mit „Start 11:00“; läuft das Fenster gerade, heißt es „Jetzt bis 14 Uhr“ und „jetzt starten“. Ist die beste Zeit für heute vorbei, verschwindet der Hinweis.
  - **Schnee und Störung:** Liefert die Anlage in den letzten beiden vollen Stunden weniger als 30 % der Prognose, obwohl mindestens 0,4 kWh erwartet waren, erscheint oben ein Hinweis – bei Außentemperatur bis 2 °C (aus Einstellungen → Haus → Wetter) als „Schnee auf den Modulen?“, sonst „Anlage liefert deutlich weniger als erwartet“, mit Knöpfen „Ertrag prüfen“ und „Modul 3“.

## [2026.11.3b7] - 2026-11-12

### Neu
- **Modul 16 · Neue Optik Stufe 1 (v0.9 Build 3)** nach Konzept_Modul16_Neue-Optik:
  - **Sonnenbogen-Banner:** Der Bogen spannt sich über die Sonnenstunden, die Sonne steht an der aktuellen Stelle. Darunter die Prognose als Fläche (gestrichelt), gefüllt der heute schon erzeugte Teil. Unter der großen Zahl „bisher … kWh“ mit **„vor Plan“ / „hinter Plan“** – verglichen mit dem, was bis jetzt laut Prognose zu erwarten war, nicht mit dem ganzen Tag. Chips: noch zu erwarten, morgen, Treffsicherheit. Nach Sonnenuntergang: Mond und Sterne, die Kurve und der Wert für morgen.
  - **Kacheln 2.0** mit HD-Bildern: Heute erwartet (Prognose von heute früh), Heute bisher (Ring, vor/hinter Plan), Morgen (sonniger/ähnlich/trüber), **Treffsicherheit** (100 % minus mittlere Abweichung je Tag, mit Ring), Noch zu erwarten, Beste Zeit.
  - **Prognose und Ertrag in einer Kurve:** Prognose je Stunde gestrichelt, der tatsächliche Ertrag je Stunde gefüllt (aus der Langzeitstatistik des Ertragssensors), Markierung „jetzt“. Die **beste Zeit** grün hinterlegt mit den Geräten, die sich lohnen (Waschmaschine, Trockner, Spülmaschine aus Modul 4, das Auto aus Modul 8, der Heizstab aus Modul 2) und Knöpfen ins jeweilige Modul. Mit Stundenpreis-Sensor zusätzlich das **Preisband**. Antippen einer Stunde zeigt Prognose, Ertrag, Abweichung und Strompreis.
  - **Prognose gegen tatsächlich:** jeder Tag mit Ertrag in kWh und Abweichung in Prozent (grün ±10 %, gelb ±20 %, sonst rot).
  - Farben wie in Modul 3 und 19: Prognose Bernstein, Ertrag Solar-Gelb. Handy: flaches Banner, Kacheln 2 × 2, eigene Kurve. Hell: weiße Kacheln ohne Licht hinter dem Bild.
  - Einstellungen → Modul 16 → **Ansicht: „Wie bisher“** zeigt die alte Seite.
- **Modul 16 · Stufe 2 Technik (v0.9 Build 4):**
  - **Prognose-Quelle „Automatisch“:** über die Energie-Schnittstelle von Home Assistant – dieselbe, die das Energie-Dashboard nutzt. Damit funktionieren neben **Forecast.Solar** auch **Solcast** und **Open-Meteo Solar Forecast** (HACS) und jede andere Integration mit Solar-Prognose; mehrere Anlagen werden addiert. Klappt das nicht, greift wie bisher der Dienst von Forecast.Solar.
  - **Eigener Sensor** versteht jetzt auch das Solcast-Format (`detailedForecast` / `detailedHourly`, kW je Zeitraum) zusätzlich zu `wh_period`.
  - **Ertrag je Stunde** liest das Backend aus der Langzeitstatistik des Ertragssensors (heute live, abgeschlossene Tage werden gespeichert) – die Kurve braucht dafür keinen Browser-Abruf mehr.
  - **Messlatte:** Ab 4 Uhr wird die ganze Stundenkurve der Prognose festgehalten; „vor / hinter Plan“ rechnet gegen diese Kurve.
  - **Speicher mit Schema-Version:** 400 Tage Tageswerte, 30 Tage Stundenkurven; der bisherige Verlauf wird beim ersten Start übernommen.
  - **Abruf nur im Hintergrund**, höchstens alle 30 Minuten (ohne Daten alle 5 Minuten ein neuer Versuch) – Forecast.Solar erlaubt kostenlos nur wenige Abrufe pro Stunde. Die Seite liest den Zwischenspeicher.
  - In den Einstellungen sichtbar: woher die Prognose kommt, wann sie zuletzt abgerufen wurde, ob der Ertrag je Stunde aus der Statistik kommt und wie viele Tage gespeichert sind.

### Behoben
- **Modul 1 · Grundriss erschien nicht, obwohl er in Modul 11 gezeichnet ist.** Modul 1 hat den Grundriss nur ein einziges Mal geladen. War Home Assistant dabei noch nicht ganz gestartet (Modul 11 startet spät) – typisch auf dem Wand-Tablet oder in der App, die nach einem Neustart offen bleibt –, blieb die Ansicht bei „Noch kein Grundriss“, bis der Browser neu geladen wurde. Ebenso, wenn der Grundriss erst danach (auch auf einem anderen Gerät) gezeichnet wurde. Jetzt wird nach einem Fehler nach 10 Sekunden erneut geladen und sonst jede Minute im Hintergrund aktualisiert. Solange Modul 11 nicht antwortet, steht „Grundriss gerade nicht erreichbar“ statt „Noch kein Grundriss“.
- Besteht der Grundriss in Modul 11 nur aus **Wänden ohne Räume**, erklärt Modul 1 jetzt, dass Räume mit dem Werkzeug „Raum“ eingezeichnet werden müssen (mit Knopf zum Baukasten) – vorher hieß es auch hier „Noch kein Grundriss“.

## [2026.11.3b6] - 2026-11-12

### Neu
- **Modul 19 Hausfluss ist stabil (v1.0).** Weiterhin ein Extra nur für Sponsoren. Einstellungen und Kacheln bleiben bei Updates erhalten, neue Funktionen kommen nur dazu.
  - **Schnellstart aus den Haus-Werten:** Ein Tipp legt Solar, zweite Anlage (z. B. Balkonkraftwerk), Netz und Akku mit den Sensoren aus Einstellungen → Haus → Energiequellen an – samt Vorzeichen, Tageswerten und Ladestand-Ring. Belegte Plätze bleiben unverändert. Im Leerzustand und unter Einrichten.
  - **Einrichtungs-Prüfung** oben unter Einrichten: fehlende, umbenannte oder „nicht verfügbare“ Leistungssensoren, Einheit nicht W/kW, Sensor ohne state_class (dann bleibt der Strom-Reiter leer), Solar mit negativen Werten, Verbraucher mit negativer Leistung, fehlende Quelle sowie ein rechnerisch negativer Hausverbrauch (verdrehtes Vorzeichen bei Netz oder Akku). Antippen öffnet die betroffene Kachel.
  - **Kosten im Strom-Reiter:** Netzbezug, Einspeisevergütung, Ersparnis durch eigenen Solarstrom und der Vorteil durch Solar und Akku im gewählten Zeitraum – mit den Preisen aus Einstellungen → Haus → Preise (bei einem Preis-Sensor mit dem aktuellen Preis). Im Tablet-Modus zusätzlich **Vorteil heute** in der Seitenspalte.
  - **Bild teilen:** Knopf „Bild“ über dem Fluss-Bild speichert es als PNG mit Hausverbrauch, Herkunft, Datum und dem Hinweis „gemacht mit Strom & Wärme“ – auf iPhone und iPad direkt über das Teilen-Menü.
  - **Fire-Tablet schonen:** Im Tablet-Modus zeichnet der Hausfluss nur noch alle 5 Sekunden neu.
  - **Feinschliff der Optik:** Das Haus steht ohne Kasten als freier Herkunfts-Ring in der Mitte, der Hausverbrauch steht im Ring, der Tageswert als kleine Plakette schräg darüber; alle Linien enden genau am Ring (auch im Tablet-Modus). Kacheln ruhiger: Farbe nur als zarter Verlauf von oben und Licht hinter dem Bild statt kräftiger Tönung, ruhende Kacheln deutlich gedämpft. Der Hauptwert jeder Kachel ist größer und fetter, Nebenwerte zurückhaltender. Handy: Verbraucher-Liste als ruhige Karten statt Pillen mit Farbkante, Lichtbänder im Banner laufen nicht mehr hinter der großen Zahl, Knöpfe brechen nicht mehr um. Laufende Punkte mit leichtem Schein.

## [2026.11.3b5] - 2026-11-11

### Neu
- **Modul 19 · Neue Optik Stufe 2 (v0.7): Linien & Haus.**
  - **Leuchtlinien:** Die Stärke folgt der Leistung (dünn bei wenigen Watt, kräftig bei Kilowatt), aktive Linien haben einen Leuchtsaum, helle Punkte laufen in Flussrichtung. Ruhende Wege bleiben als feine gestrichelte Spur, damit das Bild seine Form behält. Neu unter Einrichten → Linien: **Einfarbig** (Standard) oder **Verlauf** von der Kachelfarbe zur Hausfarbe. Die Bewegung folgt der Einstellung „Animationen“ (Aus: ohne Punkte, Voll: Leuchtsaum pulsiert), im Tablet-Modus wie dort eingestellt.
  - **Haus mit Herkunfts-Ring:** Ein Ring um das Haus zeigt, woher der Hausverbrauch gerade kommt – Solar (gelb), Akku (violett), Netz (rot), Sonstige (grau). Berechnet aus den Kacheln mit „Liefert“ und „Beides“, erkannt am Bild oder Namen; Einspeisung und Akku-Laden werden zuerst vom Solarstrom abgezogen. Der Ring gleitet bei neuen Werten. Abschaltbar unter Haus bearbeiten → Herkunfts-Ring.
  - **Haus-Bild wählbar:** Haus, Haus mit Garage, Wohnung, Bungalow oder ein eigenes Foto (rund zugeschnitten). Die Fenster leuchten abends (nach Sonnenstand). Das Haus-Emoji 🏠 wird einmalig auf das HD-Haus umgestellt, mit „Alte Symbole behalten“ bleibt es.
  - **Bilder mit Zustand:** je Kachel „Läuft ab … W“ (Standard 10 W) für Trommel, Lampe und Co. und ein **Ladestand-Ring** um das Bild (automatisch aus dem ersten Wert in %, wählbar oder aus).
  - **Status-Punkt:** optional aus einer frei wählbaren Entität (z. B. Status der Waschmaschine): grün läuft, gelb wartet, rot Störung.
  - **Keine Daten:** Meldet der Leistungssensor „nicht verfügbar“, wird die Kachel grau mit rotem Punkt und „–“ statt einer leeren oder falschen Anzeige.
- **Modul 19 · Neue Optik Stufe 3 (v0.8): Banner & Themen.**
  - **Lichtband-Banner:** Links fließen die Quellen als Lichtbänder ins Haus, rechts gehen die Verbraucher ab – Farben aus deinen Kacheln, Breite nach Leistung. Das Haus trägt den Herkunfts-Ring, unter der großen Zahl zeigt ein Balken, wie viel gerade aus Solar, Akku und Netz kommt. Das Banner zeichnet nur alle 10 s neu (kein Flackern), abends dunkler mit Sternen. Unter Einrichten → Aussehen → Banner: **Lichtband** (Standard) oder **Einheitlich** wie in den anderen Modulen.
  - **Themen für das Fluss-Bild:** Nachtglas (Standard, türkiser Schimmer hinter dem Haus), Blaupause (Raster wie ein Bauplan), Sternenhimmel, Haus im Garten (Himmel und Wiese).
  - **Kachelform:** Kachel (Standard) oder **Rund** – nur Bild mit oberem und unterem Wert.
  - **Hell:** weiße Kacheln mit feinem Rand und farbiger Linie oben, kein Licht hinter dem Bild, kräftigere Linien.
  - **Handy neu** (unter 640 px Breite): **Fluss-Spalte** (Standard) – Quellen oben, Haus mit Ring in der Mitte, Verbraucher als Liste, ruhende hinter „+ N weitere“ – oder **Kachel-Raster** mit Haus-Karte oben und zwei Spalten ruhiger Kacheln mit Richtungspfeil. Das Brett gibt es weiter. Standard unter Einrichten → Aussehen → Handy-Ansicht, auf dem Handy pro Gerät mit „Ansicht“ umschaltbar.
  - **Tablet-Modus:** Wand-Ansicht ohne Banner. Quer: breite Kacheln (Bild links, Wert groß rechts) und rechts eine Spalte mit Herkunft jetzt und Überblick (Solar jetzt, Haus jetzt, Autarkie jetzt, Solar heute, Verbrauch heute, Akku). Hoch: das Brett oben, vier Werte als Felder darunter. Das Brett passt sich so an, dass es über dem Dock Platz hat. **Ruhebild** bei geöffnetem Hausfluss: Sternenhimmel mit Uhrzeit, Haus mit Herkunfts-Ring und Hausverbrauch, ohne Bewegung.
- **Modul 19 · Neue Optik Stufe 4 (v0.9): Hausfluss wird Vorabversion.** Weiterhin nur für Sponsoren.
  - **Strom-Reiter** (bisher Platzhalter): Tag · Woche · Monat · Jahr mit ‹ › wie in Modul 3. Oben Verbrauch, Anteil aus Solar, Autarkie und erzeugter Solarstrom. **Lichtsäulen:** Hausverbrauch pro Stunde (Tag), pro Tag (Woche, Monat) bzw. pro Monat (Jahr), gestapelt nach Herkunft Solar, Akku, Netz, Sonstige – Antippen zeigt die Werte. **Verbraucher mit Solar-Anteil:** jede Verbraucher-Kachel mit kWh im Zeitraum und wie viel davon aus Solar kam. Gerechnet wird aus der Langzeitstatistik der Leistungssensoren deiner Kacheln (Stunden-Mittelwerte, im Jahr Tageswerte), nach denselben Regeln wie der Herkunfts-Ring. Bewusst kein Sankey.
  - **Animationen „Voll“:** Waschmaschine, Trockner und Spülmaschine wackeln beim Laufen, die Lampe leuchtet, Solar strahlt, Heizgeräte glühen, Auto, Wallbox und Akku pulsieren beim Laden, Sterne funkeln im Banner und im Thema Sternenhimmel. „Dezent“ und „Aus“ wie bisher, „Bewegung reduzieren“ wird beachtet.
  - **Kacheln ziehen (W1):** Knopf „Anordnen“ über dem Fluss-Bild (Tablet und Desktop, nur Admins): Kachel mit Maus oder Finger auf einen freien Platz ziehen oder auf eine andere Kachel (tauscht). Alternativ antippen und dann den Ziel-Platz antippen.
  - **Vorlagen (W2):** „Einfamilienhaus mit PV und Akku“, „Wohnung mit Balkonkraftwerk“, „Mit E-Auto“ – ein Tipp legt passende Kacheln mit HD-Bildern auf freie Plätze, danach nur noch Sensoren zuordnen. Unter Einrichten → Vorlagen und beim ersten Start.
  - **Gruppen-Kachel (W3):** mehrere Leistungssensoren (z. B. alle Kühlschränke) als eine Kachel mit Summe; „×3“ am Bild öffnet die einzelnen Geräte mit ihren Werten.
  - **Tageswerte-Leiste (W4):** schmale Zeile unter dem Fluss-Bild – heute Solar, Verbrauch, Autarkie und Einspeisung. Abschaltbar unter Einrichten → Aussehen.
  - **Sponsor-Abzeichen (W7):** kleines „♥ Sponsor“ bzw. „Sponsor Max“ oben rechts im Lichtband-Banner (folgt der Einstellung „Abzeichen“ im Sponsor-Bereich).
## [2026.11.3b4] - 2026-11-11

### Behoben
- **Karten ohne Lücken:** Die Karten in Modul 1 bis 4 liegen jetzt wie Mauersteine. Ist eine Karte niedriger als ihre Nachbarin (zum Beispiel „Kosten und Vorteil“ neben dem Energiefluss), rutscht die nächste Karte in die Lücke darunter. Gilt auch nach dem Verschieben unter „Anpassen“; die Reihenfolge bleibt erhalten.
- **Modul 3 · Kosten und Vorteil:** Die Treppe passt ihre Höhe an die Werte an. Bei hohem Netzbezug (großer Minus-Balken) wurden der Betrag und die Beschriftung „Netzbezug“ verdeckt – jetzt ist unter dem tiefsten Balken immer Platz für den Betrag, die Symbolzeile steht darunter.
- **Modul 3 · Energie-Szene im Banner:** Das Bild behält jetzt sein Seitenverhältnis und wird nicht mehr oben und unten abgeschnitten (auf dem iPad fehlten Teile der Beschriftung bei Solar, Batterie und Auto). Die Werte an den Geräten sind größer, lange Namen wie „Photovoltaikanlage“ werden gekürzt, kein Schild ragt über den Bildrand. Ring und Text richten sich nach der tatsächlichen Bildbreite.
- **Modul 3 · Doppelring im Banner:** Innen stehen nur noch der Prozentwert und „Autarkie heute“ bzw. „gedeckt jetzt“ in größerer Schrift. Der Eigenverbrauch („☀ 46 % selbst genutzt“) steht als eigenes Schild unter dem Ring statt gequetscht im inneren Kreis; am Handy kurz „☀ 46 % selbst“ über dem Ring.

## [2026.11.3b3] - 2026-11-11

### Neu
- **Modul 1 · Luftentfeuchter „Nur mit PV-Überschuss“:** neue Betriebsart im Reiter Strom (bisher nur „Vorziehen“, bei dem die Obergrenze immer auch ohne Sonne gilt). Der Entfeuchter startet nur, wenn die Feuchte über der eingestellten Schwelle liegt **und** genug Solarstrom ins Netz fließt (sein eigener Verbrauch zählt mit). Start erst, wenn der Überschuss **2 Min.** anhält, Aus erst nach **5 Min.** ohne Überschuss – kurze Wolken schalten nicht. Er läuft bis zur Untergrenze, solange die Sonne reicht. **Schimmelschutz** (Standard ab 70 %): darüber läuft er auch ohne Überschuss. Optional zählt die **Ladeleistung der Hausbatterie** ab einem Ladestand (z. B. 90 %) als Überschuss. Anzeige „wartet auf Sonne“, „läuft · ☀ PV“, „Schimmelschutz“, „Warum?“ nennt Überschuss in Watt und die Wartezeit. Mindestlaufzeit und Sperrzeit gelten weiter.
- **Modul 3 · Neue Optik Stufe 2 (v1.4): Energiefluss HD.** Geräte als HD-Plaketten mit Leuchtring statt Kreisen mit Linien-Symbol (gleiche Symbole wie im Hausfluss, Modul 19). Das Balkonkraftwerk ist ein eigener kleiner Knoten, der in Solar fließt. Die Batterie zeigt ihren Füllstand im Symbol, unter 20 % rot. Das **Auto** erscheint als dritter Verbraucher neben Heizung und Warmwasser, wenn Modul 8 an ist (Ladeleistung aus dem Fahrzeug-Sensor oder der Wallbox). Linienstärke = Leistung, aktive Flüsse mit Leuchtsaum und laufenden Punkten (Tempo nach Leistung, folgt der Einstellung „Animationen“), inaktive Wege bleiben als feine graue Spur. **Antippen** eines Geräts zeigt die Werte im Zeitraum (kWh, Anteil Solar, Batterie geladen/entladen) mit Knopf zum passenden Modul. Für Sponsoren mit Modul 19: Knopf „Großansicht“.
- **Modul 3 · Hinweise mit Bild und Aktion:** jeder Hinweis mit HD-Symbol, Farbleiste und Knopf zum passenden Modul (nur wenn es an ist). Neu: **günstigster Strom des Tages** aus den Stundenpreisen des Preissensors (Tibber u. a.), bei Überschuss der Tipp zum ausgeschalteten Heizstab oder zum Auto, „Prüfen“ bei einer ausgefallenen Solaranlage.
- Schalter **„Energiefluss wie bisher“** unter Anpassen → Aussehen in Modul 3.
- **Modul 3 · Neue Optik Stufe 3 (v1.5): Energie-Szene im Banner.** Statt des Modul-Logos zeigt der Banner dein Haus: Solar auf dem Dach, Balkonkraftwerk am Geländer, Batterie mit Füllstand (unter 20 % rot, Blitz beim Laden), Strommast mit Linie grün bei Einspeisung und rot bei Bezug, Auto an der Wallbox (nur mit Modul 8). Werte stehen direkt am Gerät. Die Szene folgt den echten Flüssen: Linienstärke nach Leistung, laufende Punkte in Flussrichtung, Panels heller bei Überschuss. **Himmel und Wetter** wie in der Haus-Szene von Modul 1 (Sonnenstand, Wolken, Regen, Schnee, Nacht mit beleuchteten Fenstern). Bei **Woche, Monat, Jahr** oder vergangenen Tagen zeigt sie die **Summe** im Zeitraum, gekennzeichnet mit „Σ“. **Antippen führt hin:** Batterie → Modul 13, Auto → Modul 8, Solar → Modul 16, Strommast → Modul 14 (nur wenn das Modul an ist).
- **Handy:** die Szene als flacher Streifen über den Werten, ohne Beschriftung an den Geräten. **Startseite:** „Energie jetzt“ bekommt die Mini-Szene und eine Kachel „Haus“ mit dem Anteil aus Solar.
- Neue Schalter unter Anpassen → Aussehen in Modul 3: **„Energie-Szene im Banner“** (aus = Banner wie bisher), **„Werte an den Geräten“**, **„Auto zeigen“**.
- **Modul 3 · Neue Optik Stufe 4 (v1.6): Diagramme & Kosten.**
  - **Preisband** unter der Tageskurve: Stundenpreise aus dem Preissensor (Tibber u. a.) von günstig (grün) bis teuer (rot), relativ zum Tagesdurchschnitt; der Preis steht auch im Tooltip. Ohne Stundenpreise ausgeblendet.
  - **Woche, Monat, Jahr gespiegelt:** oben Solar (selbst genutzt + eingespeist), unten Netzbezug; der beste Tag bzw. Monat bekommt einen ★.
  - **Solar-Kalender:** im Jahr umschaltbar „Monate | Kalender“ – jeder Tag als Kästchen nach kWh, bester Tag mit ★, Tipp öffnet den Tag. Ein Abruf der Langzeitstatistik je Jahr, gemerkt bis Mitternacht.
  - **Kosten-Treppe** mit Symbolen (Netzbezug, Einspeisung, Selbst genutzt), Bilanz als eingerahmte Summe.
  - **Sparschwein** (neue Karte): Vorteil durch Solar seit Beginn der Aufzeichnung bzw. seit Inbetriebnahme. Mit freiwilligen **Anschaffungskosten** unter Anpassen → Aussehen zeigt ein Balken, wie viel der Anlage bezahlt ist. Braucht Energiezähler (kWh) für Solar und Einspeisung; gerechnet mit den heutigen Preisen.
  - **„Wohin der Strom heute geht“ als Ring** mit HD-Symbolen; das Auto aus Modul 8 als eigenes Ziel; „Haushalt und Rest“ lässt sich aufklappen und zeigt die Geräte aus Modul 4, der Rest bleibt „Sonstiges“.
  - **Bewegung:** Kacheln und Ring zählen beim Zeitraumwechsel kurz hoch (nicht bei Animationen „Aus“ oder „Bewegung reduzieren“).
- **Sponsor-Extra W7: Haus-Stile und Himmel-Themen** für die Haus-Szene in Modul 1 und die Energie-Szene in Modul 3: Haus-Stil Klassisch, Modern, Skandinavisch, Backstein, Mediterran; Himmel Natürlich, Pastell, Nordlicht (mit Polarlicht in der Nacht), Goldene Stunde. Klassisch und Natürlich bleiben für alle; die weiteren Stile mit aktivem Sponsor-Schlüssel. Einstellung unter Anpassen → Aussehen in Modul 1 und Modul 3.
- **Ruhige Animationen (Konzept K3/H2):** Energiefluss und Energie-Szene werden bei neuen Messwerten nicht mehr neu aufgebaut – Zahlen, Linienstärken und Füllstand werden im bestehenden Bild angepasst, die laufenden Punkte springen nicht mehr zurück. Neu gebaut wird nur, wenn sich die Lage ändert (z. B. Einspeisung → Bezug). Das Tempo der Punkte hat dafür drei Stufen.
- **Bewegung nur, wenn sichtbar:** Raumbilder, Haus-Szene, Energie-Szene und Energiefluss halten an, sobald sie aus dem Bild gescrollt sind.
- **Animationen im Tablet-Modus:** eigene Stufe, Standard **Aus** (Konzept: Wand-Tablets ohne Bewegung). Beide Einstellungen unter Anpassen → Aussehen in Modul 1 und Modul 3.

## [2026.11.3b2] - 2026-11-11

### Neu
- **Modul 3 (v1.3): Neue Optik Stufe 1 – Symbole & Kacheln** (Konzept „Modul 3 – Neue Optik“):
  - **Kacheln 2.0:** HD-Symbole statt Linien-Icons (Solar Dach mit kleinem Balkon-Symbol, wenn das Balkonkraftwerk liefert; Strommast mit rotem ↓ für Netzbezug und grünem ↑ für Einspeisung; Haus für den Verbrauch), leichter Farbschleier in Kachelfarbe, Verlauf als Fläche mit Farbverlauf und weißem Punkt „jetzt“, Achse 0–12–24 Uhr. Ausgewählte Kachel mit vollem Rahmen, hebt wie bisher die Kurve im Diagramm hervor.
  - **Vergleich als Plakette** oben rechts: grün = besser (mehr Solar, weniger Bezug und Verbrauch), rot = schlechter, grau = neutral (Einspeisung).
  - **Doppelring im Banner:** außen Autarkie (türkis), innen Eigenverbrauch (gelb, „☀ 48 % selbst“). Antippen schaltet wie bisher zwischen „Autarkie im Zeitraum“ und „gedeckt jetzt“ (dann innen der Eigenverbrauch jetzt).
  - **Preis-Skala:** „Strom jetzt 24,1 ct“ mit Plakette günstig, mittel oder teuer – relativ zum Tagesdurchschnitt, nicht zu festen Cent-Werten – und einer Skala mit Punkt. Braucht einen Preissensor mit Tageswerten (z. B. Tibber mit min/max/avg oder „today“), bei festem Preis ohne Skala.
  - **Kacheln wie bisher:** Schalter unter Einstellungen → Modul 3 → Anzeige.
- **Modul 1 (v1.8 Build 2): Raumbild für Messräume wählbar.** Unter „Raumbild &amp; Farbe“ gibt es jetzt auch für Messräume die Auswahl: das Messraum-Bild (Standard) oder einer der sieben Raumtypen (Wohnzimmer, Schlafzimmer, Bad, Kinderzimmer, Küche, Büro, Flur / Ankleide). Statt des Heizkörpers hängt dann der Sensor mit der aktuellen Temperatur an der Wand. Das gewählte Bild gilt auch in der Entfeuchter-Standortkarte und als Mini-Bild.
- **Haus-Szene in der Kopfkarte** (Konzept Teil A1/A2): Statt des Modul-Logos zeigt die Kopfkarte dein Haus im Schnitt mit den eigenen Räumen nach Etagen (aus den Gruppen; Namen mit OG/Dach oben, EG darunter, ohne Gruppen bis zu vier Räume je Etage, höchstens drei Etagen). Farbe = Zustand wie auf der Raumkarte, Zahl = Ist-Temperatur, offene Fenster klappen auf, heizende Räume zeigen Wärmewellen, der Schornstein raucht. Im Keller die Wärmequelle nach Brennstoff (Öltank, Pellets, Flüssiggas, Wärmepumpe oder Therme) mit Flamme, wenn geheizt wird; auf dem Dach PV-Module, wenn ein PV-Sensor gewählt ist – sie leuchten bei Überschuss. Der Himmel folgt Sonnenstand und Wetter: Morgen, Tag, Abend, Nacht mit Mond und Sternen, Wolken, Regen, Schnee und bei Frost Schnee auf Dach und Wiese. Antippen eines Raums springt zu seiner Karte (auch in eingeklappten Gruppen). Einstellungen → Darstellung → „Haus-Szene“ und „Tageszeit und Wetter“; aus = Modul-Logo wie bisher. Am Handy steht die Szene oben in der Kopfkarte. Detailliert gezeichnet: Ziegeldach mit Traufe, Dachrinne, First und Dachfenster, gemauerter Schornstein, Hauswand im Schnitt mit Dämmung und Geschossdecken, je Raum Deckenlampe in Zustandsfarbe, Holzboden, Fenster mit Sprossen und Bank sowie eine kleine Möbel-Silhouette nach Raumtyp, Temperatur als Plakette. Davor Garten mit Baum, Büschen, Zaun und Laterne (nachts an), darunter das Erdreich mit Kellerraum, Heizkessel und Vor- und Rücklauf in der Wand. Raumnamen werden in der Szene sinnvoll gekürzt (Kinderzimmer → Kinder, Wohnzimmer → Wohnen, Schlafzimmer → Schlafen, Ankleidezimmer → Ankleide), die Schrift passt sich der Breite an, und unter „Raumbild &amp; Farbe“ lässt sich ein eigener Kurzname (bis 12 Zeichen) eintragen. Am Handy zeigt die Szene das Haus größer (Garten seitlich angeschnitten) mit größerer Schrift.
- **Präsenzmelder je Raum** („Mensch im Raum = heizen auf … °C“): neuer Abschnitt in den Raumeinstellungen. Melder wählen (Präsenz-, Bewegungsmelder oder Sensor mit Personenzahl), Temperatur bei Anwesenheit und wie sie gilt: **Mindestens** (Standard, der Heizplan darf mehr vorsehen) oder **Genau**. Verzögerung „belegt nach“ (Standard 2 Min.) und „leer nach“ (Standard 15 Min.). **Leerlauf-Absenkung** (Standard aus): länger leer = Heizplan-Ziel um ein paar Kelvin gesenkt. Bei Abwesenheit, Urlaub und im Sommermodus ruht der Melder (umschaltbar), ausgeschaltete Thermostate bleiben aus (umschaltbar). Ohne Heizplan merkt sich der Raum die Solltemperaturen und stellt sie beim Gehen zurück. Fenster offen, „Heizung aus“ und laufender Elektroheizer haben wie beim Heizplan Vorrang. Anzeige: Zeile „Präsenz“ auf der Raumkarte (jemand da · seit …, Bewegung erkannt, leer seit … · −1,5 K), Person im Raumbild, in der Haus-Szene und im Grundriss, Zustand „Heizt · jemand da“, Hinweis im Heizplan-Band und Gründe unter „Warum?“. In der Kompakt-Liste als Chip (jemand da · mind. 21,0°, Bewegung erkannt, leer seit … · −1,5 K, ruht). „Seit …“ und „leer seit …“ werden gespeichert und laufen nach einem Neustart von Home Assistant weiter.
- **„Warum?“ als Zeitleiste** (Konzept D3): oben der Verlauf der letzten 12 Stunden aus Home Assistant (Fenster geöffnet/gekippt/geschlossen, Heizung pausiert/läuft wieder, Präsenz, Heizplan-Schaltpunkte), dann „jetzt“ mit Zustand und Temperatur, darunter was geplant ist (Lüften empfohlen bis … bzw. „Genug gelüftet“, Fortsetzen nach dem Schließen, nächster Heizplan-Punkt, Rückkehr bei Leerstand). Die bisherigen Gründe stehen darunter.
- **Grundriss als Wärmekarte** (Konzept Teil E1 mit W3): dritte Ansicht „Grundriss“ neben Kompakt und Detail. Der Grundriss kommt aus dem Baukasten von Modul 11 – einmal gezeichnet, in Modul 1 und 11 genutzt, mit Etagen-Umschalter. Räume als Fläche nach Temperaturskala, Zustand und Ist-Temperatur, Fenster als hellblaue Striche (offen oder gekippt = aufgeklappt mit Luftstrom, so viele wie Kontakte offen melden), Heizkörper als Balken (orange mit Wärmewellen = heizt, bernstein = pausiert), **Hinweis-Plaketten (W3)** für Frost, Schimmel, Batterie, offline, Kontakt und fehlenden Raumsensor. Räume werden über den Namen zugeordnet, sonst per Antippen („Raum zuordnen“, mit Mini-Raumbildern). Antippen eines Raums öffnet sein Menü „⋯“. Ohne Grundriss erklärt die Ansicht, wie man ihn in Modul 11 zeichnet (mit Knopf „Grundriss zeichnen“). Bewegung folgt der Einstellung Aus · Dezent · Voll.
- **Acht neue Raumbilder:** Esszimmer, Wintergarten, Keller / Hauswirtschaft (Waschmaschine und Trockner), Werkstatt / Hobby, Fitness, Dachboden, Garage (mit Auto und Sektionaltor) und **Carport / Außen** – eine Außen-Szene mit Himmel, Hauswand, Carport-Dach und Auto, bei Frost mit Schnee auf dem Dach, nachts mit Mond und Sternen. Garage und Carport haben keinen Heizkörper, beim Carport hängt der Sensor an der Stütze. Insgesamt 15 Raumbilder plus Messraum.
- **Raumtyp aus dem Namen** jetzt auch für die neuen Bilder (z. B. „Carport“, „Garage“, „Keller“, „Hauswirtschaftsraum“, „Dachboden“, „Werkstatt“, „Esszimmer“) und für Messräume: Ein Messraum „Carport“ zeigt automatisch das Carport-Bild, ohne passenden Namen bleibt das Messraum-Bild.
- **Menü „⋯“ im Messraum** mit „Messraum einstellen“ und „Raumbild &amp; Farbe“ – das Raumbild lässt sich so auch ohne „Anpassen“ ändern.

### Behoben
- **Modul 1 · Luftentfeuchter lief scheinbar immer:** War der Schalter (z. B. Steckdose) an, zeigte die Karte „an“ in Laufen-Farbe mit Luftstrom, auch wenn der Strom unter der Schwelle „läuft ab … W“ lag (z. B. 1,3 W bei „ab 6 W“). Jetzt heißt das **„Standby“**: kein Luftstrom, keine Laufzeit, und „Warum?“ erklärt „Steckdose an, das Gerät läuft aber nicht: 1,3 W, gezählt wird erst ab 6 W“. Leistungssensoren in kW werden für die Schwelle in W umgerechnet.
- **Modul 1 · Luftentfeuchter, Logik geprüft:**
  - **„Läuft nicht an“:** Ist das Gerät seit 15 Minuten eingeschaltet und soll laufen, zieht aber keinen Strom, zeigt die Karte „läuft nicht an“ mit Erklärung (startet nach dem Einschalten der Steckdose nicht von selbst, höhere Zielfeuchte am Gerät – oder, wenn es schon lief: Tank voll, Schwimmer ausgelöst) und schickt einmal am Tag eine Meldung (abschaltbar unter Meldungen).
  - **Entfeuchter als humidifier-Entität** ohne Leistungsmessung: „läuft“ kommt jetzt aus der Geräte-Aktion (drying/idle) statt nur aus dem Schalter.
  - **„seit …“ stimmt auch bei Schalten von Hand** oder durch das Gerät selbst; vorher blieb die Zeit des letzten Schaltens durch Modul 1 stehen. Mindestlaufzeit und Sperrzeit zählen ebenfalls ab dem echten Schaltzeitpunkt.
  - **Zielfeuchte am Gerät:** Neues Feld unter Gerät für Entfeuchter mit eigener Zielfeuchte (number, input_number, select oder humidifier). Solange Modul 1 den Entfeuchter laufen lassen will, stellt es die Zielfeuchte am Gerät auf das **Minimum** des Geräts (oder wahlweise auf die **Untergrenze** von Modul 1 als Rückfall, falls Modul 1 ausfällt). So hört das Gerät nicht früher auf als gewollt und steht nicht im Standby, während die Steckdose an ist. Gestellt wird höchstens alle 5 Minuten, „Warum?“ nennt den alten und neuen Wert.
  - **Tank-Sensor:** Meldet er nach „voll“ wieder leer, wird „Tank voll“ zurückgesetzt. Vorher kam die nächste Tank-voll-Meldung erst nach Antippen von „Tank geleert“.

## [2026.11.3b1] - 2026-11-11

Erste Testversion für 2026.11.3: Die Raumkarte 2.0 aus dem Konzept „Neue Optik für Modul 1“ (Teil B, D und G3).

### Neu
- **Modul 1 (v1.8): Raumkarte 2.0** – Bild oben, Zahl in der Mitte, Rest im Menü „⋯“.
  - **Raumbild** für sieben Raumtypen (Wohnzimmer, Schlafzimmer, Bad, Kinderzimmer, Küche, Büro, Flur / Ankleide). Licht, Fenster und Heizkörper zeigen den Zustand: heizt (orange, Wärmewellen), Ziel erreicht (türkis), Fenster offen oder gekippt (blau, Luft zieht herein), pausiert (bernstein), Absenkung (violett), Regelung aus (entsättigt). Nachts mit Mond und Sternen im Fenster.
  - **Raumtyp** wird aus dem Raumnamen (oder dem gewählten Symbol) vorgeschlagen und ist unter „Raumbild &amp; Farbe“ änderbar. Eigene Fotos bleiben erhalten und haben Vorrang, darüber liegt die Zustandsfarbe als Lichtschleier.
  - **Temperatur-Ring:** Ist-Wert groß, Punkt = Ziel, Farbe nach einer Temperaturskala aus den eigenen Heizplan-Temperaturen. Mit Raumsensor stehen Raum und Thermostat im Ring, bei mehr als 1,5 K Abweichung erscheint ein Hinweis.
  - **Heizplan-Band** mit Temperaturfarben, Strich für jetzt und den nächsten Schaltpunkten („Jetzt 18,0° · ab 06:00 22,5°“). Antippen öffnet den Heizplan.
  - **Fenster-Uhr:** Bei offenem oder gekipptem Fenster füllt sich ein Ring bis zur empfohlenen Lüftdauer (nach Außentemperatur), danach bernstein, beim Doppelten rot. Unten läuft „Lüften empfohlen: noch … Min.“ mit.
  - **Gekippt ≠ offen:** Meldet ein Fenstersensor „tilted“ oder „gekippt“ (z. B. Drehgriff-Sensoren), zeigt die Karte „gekippt“. Die Regelung behandelt das Fenster wie bisher.
  - **Hinweis-Plaketten** auf dem Bild statt Textzeilen: Batterie schwach, Gerät offline, Frostgefahr, Raumsensor fehlt.
  - **Menü „⋯“** mit Warum?, Bericht, Heizer-Bericht, Heizplan, Raumeinstellungen und Raumbild &amp; Farbe – weniger Knöpfe auf der Karte (besser auf Tablet und iPad).
  - **Elektroheizer und Luftentfeuchter** passend zur neuen Karte: Beide stehen im Raumbild (Heizer an der Wand mit glühenden Rippen und Sonne bei PV-Überschuss, Entfeuchter in der Ecke mit Tankanzeige und Luftstrom, wenn er läuft). Statt der großen Kästen gibt es je Gerät eine Kachel mit HD-Bild, Zustand und Balken – Stufen beim Heizer, Tank beim Entfeuchter, dazu „☀ PV“, „günstig“ oder „Nacht“, offene Standort-Bestätigung und Zahl der Hinweise. Antippen öffnet das Gerät mit allen Werten und Tasten wie bisher (Warum?, Standort ändern, Heute aus, Statistik, Tank geleert, Bericht). Der Schalter des Heizers bleibt direkt auf der Kachel, „Entfeuchter hierher stellen“ bleibt auf der Karte. Beide Geräte stehen auch im Menü „⋯“.
  - **Kompakt-Ansicht** mit Mini-Raumbild statt Raumsymbol, Messräume mit eigenem Bild (Sensor statt Heizkörper).
  - **Messräume** als Raumkarte 2.0: Bild mit Sensor (zeigt Temperatur und Luftfeuchte), Zustand „Im Wohlfühlbereich“, „Zu feucht“, „Zu kalt“ …, Ring für die Temperatur mit Wunschbereich, Zeilen für Luftfeuchte, Taupunkt und Min/Max heute, Entfeuchter als Kachel.
  - **Kompakt-Liste** in der neuen Optik: Fenster-Uhr bei offenem oder gekipptem Fenster, Zustandspunkt und Temperatur in der Farbe der Temperaturskala, Heizplan-Band mit Temperaturfarben.
  - **Gruppen:** Im Kopf zeigt ein kleiner Haus-Streifen den Zustand jedes Raums, eingeklappte Gruppen zeigen Mini-Raumbilder mit Temperatur und Zustand.
  - **Entfeuchter-Standortkarte** („Wo steht der Entfeuchter heute?“) und Standortwahl mit Mini-Raumbildern zum Antippen.
  - **PV-Heizer-Block** mit HD-Heizer, Mini-Raumbildern und Stufen-Balken je Raum.
  - **Leerzustand** „Noch keine Räume“ mit Raumbild.
  - **Bewegung** Aus · Dezent · Voll (Einstellungen → Darstellung), Standard Dezent. „Bewegung reduzieren“ am Gerät wird immer beachtet.

### Geändert
- Raumbilder werden nur neu gezeichnet, wenn sich der Zustand ändert – nicht bei jeder neuen Temperatur. So flackert nichts und die Bewegung läuft ohne Sprung weiter.
- Helle Ansicht: Raumbilder mit etwas dunkleren Wänden und Konturen an weißen Möbeln, das Licht wird nicht mehr überstrahlt.
- Raumluft auf der Karte nur noch, wenn es etwas zu tun gibt; die Luftfeuchte steht als eigene Zeile neben dem Ring.

### Wichtig beim Update
- Wer die bisherigen Karten möchte: Einstellungen → Darstellung → **Raumkarten wie bisher**.
- Nach dem Update Home Assistant neu starten und die Seite neu laden. Einstellungen, Räume und Fotos bleiben erhalten.

## [2026.11.2] - 2026-11-10

Zweite stabile Version im November: die neue Optik, ein komplett neues Modul 4 und die Sponsor-Lounge 2.0 mit Sponsor Max. Sie enthält alles aus den Testversionen 2026.11.2b1 bis 2026.11.2b14. Die Bedienungsanleitung ist komplett neu (Kapitel 23 „Neu in Version 2026.11.2“).

### Neu
- **Neue Optik:** HD-Bildsatz mit 38 Symbolen für Modul 1, 3, 4 und 19, gleich gut lesbar in hell und dunkel, mit Herkunfts-Ring und Prozentzeile. Alles abschaltbar mit „wie bisher“.
- **Modul 4 Gerätestrom (v1.5):** Geräte-Szene im Banner mit leuchtenden Kabeln nach Herkunft, Gerätekarten 2.0 mit Restzeit „noch ~ Min.“ und Startempfehlung mit „Erinnern“, Geräte-Seite mit Programm-Kurve, Durchlauf-Protokoll und typischem Lauf, bestes Startfenster als Bild mit Preisband, Startfenster aller Geräte, Standby in W und € im Jahr, Monatsziel, „Dein Jahr“ als Bild zum Teilen, Tablet-Wand, Bewegung (Aus · Dezent · Voll) und eine ruhige Liste am Handy.
- **Modul 19 Hausfluss (v0.6):** 24 HD-Bilder, die den Zustand zeigen, ruhige Kacheln, „Alte Symbole behalten“.
- **Anpassen in Modul 2, 3 und 4:** Karten verschieben und ausblenden wie in Modul 1, in Modul 4 auch die Geräte.
- **Modul 1 (v1.7):** Nachtmodus für den Luftentfeuchter (eigene Nachtzeit, nur bei hoher Feuchte oder ganz aus, Leise-Modus, Meldungen erst morgens) und „Zurückholen“ für fehlende Messräume.
- **Sensorsuche:** Suchfeld über allen Reitern, im Filter alle Räume und Integrationen.
- **Sponsor-Lounge 2.0:** eigene Seite mit Energie-Coach (jeden Montag drei Tipps mit Euro-Betrag), Monatsbericht „Dein Haus im Monat“ als Bild und Wunsch des Monats mit Live-Abstimmung auf GitHub.
- **Sponsor Max (3 Monate für 9 €):** Morgen-Briefing, Jahres-Poster, Woche voraus, Wächter, Was wäre wenn …, Haus-Autopilot I, Heizplan-Assistent und Beta-Kanal.

### Geändert
- **Beta-Freigabe:** Testversionen nach 2026.11.2 sind mit Sponsor Max sofort und als Sponsor 3 Tage nach Erscheinen nutzbar. Ist eine Testversion noch nicht freigegeben, zeigt das Panel statt der Module den Weg zurück zur letzten stabilen Version (als Sponsor mit Countdown bis zur Freigabe). Gerechnet wird mit der Internetzeit (von GitHub, sonst vom Versionsdienst von Home Assistant), nicht mit der Uhr des Rechners. Die Erscheinungszeit steckt zusätzlich geschützt im Build, falls GitHub nicht erreichbar ist. Heizung, Fenster-Automatik und alle Regeln laufen im Hintergrund weiter. Stabile Versionen sind für alle frei.
- **Modul 8:** Akkukapazität mit einer Nachkommastelle.
- **Sponsor-Bereich:** Die Danke-Liste ist entfernt.
- **Modul-Versionen** fortgeführt: Modul 1 1.7, Modul 2 1.1, Modul 3 1.2, Modul 4 1.5, Modul 8 0.5 Build 3, Modul 19 0.6 Build 3.

### Behoben
- Modul 1: Messräume verschwanden, wenn das Dashboard die Einstellungen nicht laden konnte. Das Backend behält jetzt fehlende Teile bei.
- Modul 1: Standort und Abwesenheits-Temperatur fielen auf die Grundwerte zurück.
- Modul 4: „Erinnern“ meldete immer „Das hat nicht geklappt“.
- Modul 8: Nach einer Phasenumschaltung endete die Ladung, weil die Wallbox kurz „fertig“ meldete.
- Modul 19: eigene mdi-Symbole mit „Mdi:“ (iPhone) wurden ignoriert.
- Einstellungen → Darstellung: Die Zeile „Startseite“ verschwand, wenn „Startseite verwenden“ aus war.
- Einstellungen → Verlauf: „Rückgängig“ traf nicht den gewählten Eintrag.

### Wichtig beim Update
- Nach dem Update Home Assistant neu starten und die Seite neu laden. Deine Einstellungen bleiben erhalten.
- Modul 4 merkt sich ab dieser Version Laufzeiten, Kurven, Standby und Jahreszähler. „noch ~ Min.“ erscheint je Gerät nach 3 neuen Läufen, Standby nach einigen Stunden.
- Wer die alte Optik möchte: Einstellungen → Modul 4 → Darstellung → Karten wie bisher, Einstellungen → Modul 19 → Alte Symbole behalten.

## [2026.11.2b14] - 2026-11-10

### Geändert
- **Sponsor-Bereich:** Die Danke-Liste ist entfernt – in der Lounge (Schalter „In der Danke-Liste nennen“), in „Sponsoren verwalten“ (Knopf „Danke-Liste kopieren“, Häkchen beim Anlegen und Sperren) und im Backend.
- **Sponsor Max:** Hinweis „3 Monate für 9 €“ auf „Sponsor werden“, in der Lounge, beim Anlegen eines Max-Sponsors und in der vorbereiteten Mail.
- **Beta-Versionen ab 2026.11.2:** Hinweis im Beta-Kanal („sofort mit Sponsor Max installierbar“), auf „Sponsor werden“ (Sponsor: 3 Tage nach Erscheinen, Max: sofort) und in der Lounge für Sponsoren.

## [2026.11.2b13] - 2026-11-10

### Neu
- **Modul 4 v1.5 – Stufe 4 der neuen Optik:**
  - **Geräte-Szene im Banner:** die drei wichtigsten Geräte (laufende, heute fertige, dann die mit den meisten Läufen; Kühlgeräte nicht) hängen an einer Stromleiste – gelb bei Solar, violett bei Batterie, rot bei Netz. Laufende Geräte bekommen ein leuchtendes Kabel und ihre Leistung als Plakette, fertige „fertig 12:27“, bereite „ab 11:30 ☀“. Links der Herkunfts-Ring; Antippen schaltet zwischen „heute“ und dem gewählten Zeitraum. In den Einstellungen abschaltbar (dann der bisherige Banner).
  - **Tablet-Modus:** quer eine Geräte-Wand mit sechs großen Kacheln (laufende zuerst, mehr Geräte mit ‹ ›), hoch die Liste. Ein gerade fertiges Gerät leuchtet 15 Minuten türkis. Antippen öffnet die Geräte-Seite.
  - **Bewegung** (nur Modul 4): Aus · Dezent · Voll – Kabel fließen, Fortschritt gleitet, bei „Voll“ leuchten Kabel und Plaketten. Im Tablet-Modus immer aus.
  - **W2 Standby** auf der Geräte-Seite: „Standby 1,8 W · 4,73 € im Jahr“ (gleitend über etwa 7 Tage gemessen, ab einigen Stunden Daten).
  - **W4 Monatsziel** „€ mit Sonne gespart“ als Fortschritt im Banner (Einstellungen, 0 = aus).
  - **W7 Dein Jahr:** „Mit Sonne gewaschen: 19 von 24“ je Gerät als Karte (unter „Anpassen“ verschiebbar) und als Bild zum Teilen. Gezählt wird ab Modul 4 v1.3, das laufende Jahr wird aus den gespeicherten Läufen vorbelegt.

## [2026.11.2b12] - 2026-11-10

### Neu
- **Modul 4 v1.4 – Stufe 3 der neuen Optik (ohne Rangliste):**
  - **Bestes Startfenster als Bild** auf der Geräte-Seite: Solarprognose als Fläche (6–22 Uhr), das beste Fenster so lang wie ein typischer Lauf mit dem Gerätebild, „jetzt“-Linie und Preisband von günstig bis teuer. Knöpfe „Um 11:30 erinnern“ und „Jetzt starten wäre 41 % Solar“, darunter die Quellen.
  - **Startfenster aller Geräte** auf einen Blick als eigene Karte (unter „Anpassen“ verschieb- und ausblendbar); Antippen öffnet das Gerät.
  - Bei gleichem Solar-Anteil (innerhalb von 3 %) gewinnt jetzt das günstigere Fenster (Tibber).
  - Ohne Modul 16 nutzt Modul 4 das Mittel der letzten 7 Tage aus deinem PV-Sensor (wird ab jetzt je Stunde gemerkt); ohne Tibber fällt das Preisband weg.
  - „Woher der Strom kam“ (Tag) zeigt die HD-Gerätebilder.

### Behoben
- **Sponsor-Lounge:** Das Symbol in den Einstellungs-Knöpfen von Haus-Autopilot und Wächter war zu groß und ragte aus dem Knopf. „Automatisch (Max 4)“ bricht nicht mehr um.

## [2026.11.2b11] - 2026-11-10

### Neu
- **Modul 4 v1.3 – Stufe 2 der neuen Optik (Konzept Modul 4):**
  - **Geräte-Seite** beim Antippen eines Geräts: großes Bild mit Herkunfts-Ring, Zustand mit „noch ~ Min.“, Anteile Solar/Batterie/Netz, Empfehlung mit „Erinnern“.
  - **Programm-Kurve** des laufenden oder letzten Laufs: Leistung je Minute, die Fläche nach Herkunft gefärbt; Abschnitte wie „Aufheizen“, „Heizen 2“, „Schleudern“ werden aus Leistungssprüngen erkannt (nur Hinweis). Kurven speichert Modul 4 ab dieser Version mit jedem Lauf (die letzten 6 je Gerät).
  - **Durchlauf-Protokoll** mit Anteils-Balken und Kosten, Antippen zeigt die Kurve des Laufs; Ausreißer („mehr als sonst“) sind markiert.
  - **Typischer Lauf** aus den letzten 10 Läufen: Ø Dauer, Ø Energie, Ø Kosten und „Mit Sonne gewaschen: 7 von 10 Läufen“. Ausreißer zählen nicht zum Durchschnitt.
  - **Handy (unter 640 px):** laufende Geräte oben als Karte mit Fortschritt, alle anderen als ruhige Zeilen (nach Kosten), Kennzahlen unter der Liste. Im Anpassen-Modus bleiben die Karten.

### Geändert
- **Modul-Versionen fortgeführt** (Einstellungen → Module, mit Änderungsliste): Modul 1 Fenster & Heizung 1.7 (Entfeuchter-Nachtmodus, Messräume), Modul 2 Warmwasser 1.1 (Anpassen), Modul 3 Energie 1.2 (Anpassen), Modul 4 Gerätestrom 1.3 (Anpassen, Läufe für den Coach, Geräte-Seite), Modul 8 Wallbox 0.5 Build 3 (Pause nach Phasenwechsel, Akku mit Nachkommastelle), Modul 19 Hausfluss 0.6 Build 3 (mdi-Symbol).

## [2026.11.2b10] - 2026-11-10

### Neu
- **Sponsor Max 2 – Woche voraus:** 7 Tage mit Sonne (heute und morgen aus Modul 16, danach aus der Bewölkung geschätzt), Wetter, Preisniveau (Tibber, soweit bekannt) und Heizbedarf, dazu Empfehlungen: bester Waschtag, Auto am Sonnentag laden, Akku vor trüben Tagen voll halten. Der beste Tag steht auch im Morgen-Briefing.
- **Sponsor Max 2 – Wächter:** vergleicht jedes Gerät aus Modul 4 mit den letzten 4 gleichen Wochentagen (ab +30 %, mit Euro), die PV mit der Prognose (ab −30 %), meldet einen stillen Wechselrichter bei Sonne und nachts offene Fenster. „7 Tage ignorieren“, Meldung aufs Handy, Funde auch im Morgen-Briefing.
- **Sponsor Max 2 – Was wäre, wenn …:** Rechner mit den Stundenwerten der letzten 12 Monate aus der Langzeitstatistik: größerer Akku und mehr PV – Ersparnis pro Jahr, Autarkie vorher/nachher, Netzbezug, Einspeisung, Monatsvergleich und „bezahlt nach ca. … Jahren“. Immer als Schätzung gekennzeichnet. Tibber, Wärmepumpe und Dämmung folgen.
- **Sponsor Max 3 – Haus-Autopilot I:** plant alle 15 Minuten die nächsten 24 Stunden für Geräte (bestes Sonnenfenster), Auto (heute nur Sonne statt Netz) und Warmwasser (PV-Überschuss nutzen). Stufen „Aus“, „Nur Vorschläge“ und „Mit Bestätigung“ (Ja/Nein in der Lounge oder am Handy). Not-Aus nimmt alles zurück. Abwesend und Urlaub haben Vorrang. „Automatisch“ kommt mit Max 4.
- **Sponsor Max 3 – Heizplan-Assistent:** aus der gelernten Aufheizzeit je Raum Vorschläge zum früheren Absenken (mit Ersparnis in Liter) oder früheren Aufheizen (Komfort). „Übernehmen“ ändert den Heizplan, „Rückgängig“ stellt ihn wieder her.
- **Sponsor Max 3 – Beta-Kanal:** Vorabversionen 30 statt 14 Tage früher (Sponsoren 14 Tage), neueste Testversion mit „In HACS öffnen“ und Rückmelde-Knopf mit Diagnose-Angaben (nur Version, Module, Browser).
- **Anpassen in Modul 2, 3 und 4:** wie in Modul 1 und auf der Startseite – Karten am Griff verschieben, mit dem Auge ausblenden, „Zurücksetzen“. In Modul 4 lassen sich zusätzlich die Geräte sortieren und ausblenden. Kopf und Zeitraum bleiben oben. Gespeichert für alle Nutzer, in Sicherungen enthalten.
- **Modul 1 Entfeuchter – Nachtmodus:** eigene Nachtzeit (z. B. 22–7 Uhr), nachts nur bei hoher Feuchte (eigene Grenze) oder ganz aus, kein Vorziehen bei PV oder günstigem Strom, Leise-/Schlafmodus des Geräts (wenn vorhanden) und Meldungen bis zum Morgen zurückhalten.
- **Sensorsuche:** Suchfeld über allen Reitern (Name, Entitäts-ID, Raum, Gerät, Hersteller). Im Filter werden alle Räume und Integrationen angezeigt, nicht nur die ersten 14 im Alphabet.
- **Modul 8:** Akkukapazität mit einer Nachkommastelle (z. B. 77,4 kWh), Eingabe direkt oder in 0,1er-Schritten.

### Behoben
- **Einstellungen → Darstellung:** Die Zeile „Startseite“ verschwand, sobald „Startseite verwenden“ aus war – damit ließ sie sich nicht mehr einschalten.
- **Modul 8 Phasenumschaltung:** Nach dem Umschalten (z. B. von 3 auf 1 Phase) meldet die Wallbox kurz „fertig“ (0 W). Das galt als „fertig geladen“, die Ladung wurde beendet. Jetzt gilt „fertig“ 5 Minuten nach dem Umschalten und 2 Minuten direkt nach dem Laden nur als Pause; die Phasen bleiben dabei, wie sie sind. Anzeige „kurze Pause“; „Ladeziel erreicht“ und das Ende des Schnellstarts erst, wenn das Auto wirklich fertig ist.
- **Modul 19 eigenes mdi-Symbol:** „Mdi:…“ mit großem Anfangsbuchstaben (iPhone) oder mit „_“ wurde still ignoriert, das alte Symbol blieb. Jetzt wird es vereinheitlicht (mdi:solar-panel), sonst gibt es einen Hinweis.

## [2026.11.2b9] - 2026-11-07

### Neu
- **Wunsch des Monats live:** Die Lounge zählt die 👍 an den Kommentaren der Abstimmung direkt auf GitHub (öffentlich, ohne Konto, höchstens einmal pro Stunde). Klappt das nicht, gelten die Zahlen aus `docs/wunsch.json`. Erste Abstimmung: Issue #7 (November 2026).

## [2026.11.2b8] - 2026-11-07

Testversion: Sponsor-Bereich 2.0, Stufe S3 – Energie-Coach, Monatsbericht und Wunsch des Monats.

### Neu
- **Energie-Coach (Sponsor):** jeden Montag um 6 Uhr bis zu drei Tipps aus den letzten 7 Tagen – feste Regeln, keine KI: Gerät lief mehrmals abends oder nachts aus dem Netz (mit Euro-Betrag, nur mit Solar), Fenster mehrmals länger als 20 Minuten offen (aus dem Verlauf von Home Assistant), Akku an mehreren Tagen schon vor 15 Uhr voll. Modul 4 merkt sich dafür ab jetzt die letzten Läufe mit Startzeit; in der ersten Woche zeigt der Coach „sammelt noch“.
- **Monatsbericht (Sponsor):** „Dein Haus im Oktober“ mit Haus-Szene, kWh Solar, Autarkie, gespartem Heizöl und Ersparnis durch eigenen Strom – aus der Statistik von Modul 3, den Tageswerten von Modul 1 und Modul 4. Als Bild teilen (Teilen-Menü am iPhone/iPad) oder speichern; Vormonate abrufbar. Werte ohne Daten fallen weg.
- **Wunsch des Monats:** Stand der Abstimmung aus `docs/wunsch.json` im Repo (nur lesend), „Auf GitHub abstimmen“ für Sponsoren, „Vorschlagen“ für Max.
- Coach und Monatsbericht stehen in der Lounge unter „Deine Extras“ mit Schalter und unter „Neu für dich“; auf „Sponsor werden“ tragen sie jetzt „NEU“.

## [2026.11.2b7] - 2026-11-07

### Behoben
- **Modul 1 Messräume verschwunden:** Konnte das Dashboard beim Öffnen die Einstellungen nicht laden (zum Beispiel während Home Assistant neu startet oder die App aus dem Hintergrund kommt), lief es mit leeren Standardwerten weiter. Die nächste Änderung am Aussehen (zum Beispiel ein Lab-Schalter) speicherte dann diese leeren Werte – die Messräume waren weg. Jetzt wird erst gespeichert, wenn die Einstellungen wirklich geladen sind; das Laden wird automatisch wiederholt.
- **Zusätzlicher Schutz im Backend:** Fehlt im gesendeten Layout ein Teil ganz (zum Beispiel die Messräume), bleibt der gespeicherte Stand erhalten.

### Neu
- **Messräume zurückholen:** Fehlen Messräume, die noch in der automatischen Sicherung stehen, zeigt Modul 1 einen Hinweis mit „Zurückholen“ – mit Symbol, Farbe und Foto, ohne Neustart. Alles andere bleibt, wie es ist.

## [2026.11.2b6] - 2026-11-06

### Behoben
- **Sponsor-Lounge:** „Licht & Lampen“ stand noch als Vorabversion unter „Neu für dich“ und der Schalter tat nichts. Licht ist inzwischen ein Addon (Einstellungen → Addons) und erscheint dort nicht mehr; auch die Zahl der Vorabversionen in der Begrüßung stimmt jetzt.

## [2026.11.2b5] - 2026-11-06

Testversion: Sponsor-Lounge und „Sponsor werden“ genauer nach dem Konzept Sponsor-Bereich 2.0.

### Geändert
- **Sponsor-Lounge:** oben „♥ Sponsor seit …“ und „Schlüssel gültig bis …“, große Begrüßung „Danke, dass du Strom & Wärme trägst.“ mit Haus-Szene, daneben „Neu für dich – vor allen anderen“ mit HD-Bildern und Schalter oder „Öffnen“. Darunter drei Spalten: Deine Extras (Schalterliste), Wunsch des Monats (Abstimmung folgt mit Stufe S3, bis dahin per Mail) und Dein Abzeichen.
- **Abzeichen:** zur Wahl Herz, Sonne, Schneeflocke und – für Max – goldener Stern; neuer Schalter „In der Danke-Liste (README) nennen“ (bereitet die Mail vor).
- **Sponsor werden:** Seite heißt „Sponsor-Bereich“ mit „Ich habe schon einen Schlüssel“ oben, Begrüßung mit Szene, „Das hat Strom & Wärme bei dir schon geschafft“ mit HD-Bildern, „So wirst du Sponsor“ in drei Spalten und acht Extras als Kacheln mit NEU, ★ MAX oder BALD.
- Was noch nicht gebaut ist (Energie-Coach, Monatsbericht, Wohnklima-Zeugnis, Heizkosten je Raum, Wand-Tablet-Extras, Wunsch des Monats), steht ehrlich mit „bald“ da.

## [2026.11.2b4] - 2026-11-06

Testversion: Sponsor-Lounge (Stufe S1), zwei Stufen mit Verwaltung (Stufe S2) und Sponsor Max 1. Alles, was frei ist, bleibt frei.

### Neu
- **Sponsor-Lounge:** eine eigene Seite statt des Dialogs, wie bisher über das Herz im Kopf, die Startseite und die Einstellungen. Mit Schlüssel: Begrüßung mit „seit“ und Gültigkeit, „Neu für dich“ mit den Vorabversionen und dem Datum, ab dem sie für alle kommen, alle Extras an einer Stelle zum Ein- und Ausschalten, Abzeichen und Name im Kopf. Ohne Schlüssel: „Sponsor werden“ mit dem, was die Integration dir schon gebracht hat (nur aus deinen Daten, ausblendbar), drei Schritten und den Extras als Kacheln mit Beispiel. Schlüssel, „Sponsoren verwalten“ und Entwickler-Zugang stehen unauffällig ganz unten.
- **Zwei Stufen:** ♥ Sponsor (Schlüssel 1 Jahr) und ★ Sponsor Max (nur monatlich, Schlüssel 3 Monate). Läuft Max ab, gilt bis zum Ende des Sponsor-Jahres automatisch wieder „Sponsor“. Bisherige Schlüssel gelten weiter als „Sponsor“.
- **Sponsor Max 1:** goldener Stern im Kopf, **Morgen-Briefing** (eine Meldung am Morgen zur gewählten Uhrzeit mit Sonne, günstigster Strom-Stunde, bester Startzeit der Geräte, Auto, Heizung und Fenster und Auffälligkeiten aus der Diagnose; Bausteine einzeln wählbar, optional Abend-Rückblick, „Probe senden“) und **Jahres-Poster** (dein Jahr aus Modul 1 und Gerätestrom, als Bild speichern oder in A3 drucken; Vorschau schon vor Dezember).
- **Verwaltung (nur für dich):** Stufe pro Schlüssel, Max-Schlüssel 14 Tage und Sponsor-Schlüssel 30 Tage vor Ablauf markiert, „Verlängern“ erzeugt Folgeschlüssel und Mail-Text, auf Wunsch einmal am Tag eine Meldung in Home Assistant, wenn Schlüssel bald ablaufen.

### Wichtig beim Update
- Home Assistant neu starten und die Seite neu laden.
- Das Morgen-Briefing ist ab Werk aus. Einschalten: Sponsor-Lounge → Deine Extras → Morgen-Briefing → Einstellen, dann einen Meldedienst wählen.

## [2026.11.2b3] - 2026-11-06

Testversion für 2026.11.2: Fehlerkorrekturen.

### Behoben
- Modul 4 (v1.2 Build 2): „Erinnern“ meldete immer „Das hat nicht geklappt“. Die Erinnerung wird jetzt gesetzt und kommt zur Startzeit über die Meldedienste von Modul 4.
- Einstellungen → Verlauf: „Rückgängig“ traf nicht den gewählten Eintrag.

### Neu
- **Sponsor-Bereich: Entwickler-Zugang zum Testen ausschalten.** Nur mit Entwickler-Schlüssel sichtbar: unter Sponsor-Bereich → Sponsoren verwalten → „Zum Testen“ der Schalter „Entwickler-Zugang aktiv“. Aus: Extras, Vorabversionen und Module nur für Sponsoren (z. B. Modul 19) sind gesperrt, so wie ohne Sponsoring. Die Verwaltung bleibt erreichbar, dort schaltest du ihn wieder ein. Der Zustand bleibt nach einem Neustart erhalten.

### Geändert
- Modul 19 (v0.6 Build 2): Aktive Kacheln heben sich deutlicher von ruhenden ab – kräftigeres Licht hinter dem Bild, Linie oben und leichter Schein. Ruhende Kacheln sind matter.

### Wichtig beim Update
- Home Assistant neu starten und die Seite neu laden.

## [2026.11.2b2] - 2026-11-06

Testversion für 2026.11.2 (Woche 1, Teil 2): die neue Optik in Modul 4 und Modul 19.

### Neu
- **Modul 4 Gerätestrom (v1.2 Build 1): Gerätekarten 2.0.** Jedes Gerät mit HD-Bild und Herkunfts-Ring (Solar, Batterie, Netz), darunter die Prozentzeile. Zustand „läuft“ (grün), „fertig“ mit Uhrzeit (türkis) oder „bereit“ (grau). Läuft ein Gerät, steht „noch ~ Min. · fertig ~ Uhr“ mit Fortschritt dabei, sobald es 3 Läufe gelernt hat (Median der letzten 10). Drei Felder für Kosten, Ersparnis und letzten Lauf. Startempfehlung „Am besten ab … starten“ nach der Solarprognose mit Knopf **Erinnern**: zur Startzeit kommt eine Meldung über die Meldedienste von Modul 4.
- **Modul 19 Hausfluss (v0.6 Build 1):** 24 HD-Bilder im Bildkatalog (Solar Dach, Balkon, Stromnetz, Akku, Wallbox, Auto, Haus, Warmwasser, Heizkörper, Wärmepumpe, Elektroheizer, Waschmaschine, Trockner, Spülmaschine, Kühlschrank, Herd / Küche, Pool / Pumpe, Licht, PC / Server, Steckdose, Entfeuchter, Prognose, Strompreis, Kosten). Die Bilder zeigen den Zustand aus den Werten der Kachel: Waschmaschine mit Wasser in der Trommel, sobald sie über 10 W zieht, Lampe leuchtet, Akku mit Füllstand aus dem %-Wert, Spülmaschine mit Tropfen.
- **Modul 4:** Karten mit Haken bei „fertig“, gelber Linie, wenn jetzt ein guter Startzeitpunkt ist, und roter Linie bei „keine Daten“.

### Geändert
- Modul 4: Prozentzeile statt Balken. Unter Einstellungen → Modul 4 → Darstellung holt **Karten wie bisher** die alten Karten zurück.
- Modul 19: ruhige Kacheln ohne farbigen Rahmen, die Farbe leuchtet nur hinter dem Bild und als feine Linie oben. Aktive Kacheln sind heller.

### Behoben
- Modul 1: Standort-Einstellungen (Home-Zone, Personen mit ihren Standortquellen) und die Temperatur bei Abwesenheit und Urlaub konnten auf die Grundwerte (16 °C, keine Home-Zone, keine Personen) zurückfallen. Das passierte, wenn „Zu Hause“, „Abwesend“ oder „Urlaub“ getippt wurde, bevor das Dashboard die Anwesenheit fertig geladen hatte. Jetzt werden nur noch die geänderten Werte gespeichert, alles andere bleibt. Solange die Anwesenheit lädt, speichert das Dashboard nichts und zeigt einen Hinweis.

### Wichtig beim Update
- Home Assistant neu starten und die Seite neu laden.
- Modul 1: Waren Standort oder Abwesenheits-Temperatur bei dir verstellt, unter Einstellungen → System → Sichern & Wiederherstellen eine Sicherung von vorher wählen und nur „Anwesenheit“ wiederherstellen (oder die Werte neu eintragen).
- Modul 4: Die Laufzeiten werden ab dieser Version gemerkt. „noch ~ Min.“ erscheint je Gerät nach 3 neuen Läufen, vorher steht „lernt die Laufzeit“.
- Modul 4: Die Startzeit der Empfehlung kommt aus Forecast.Solar (oder dem Prognose-Sensor aus Modul 16). Ohne Prognose bleibt die bisherige Empfehlung.
- Modul 19: Kacheln mit eingebauten Symbolen bekommen einmalig die neuen HD-Bilder, das Original wird gemerkt. Wer die alten möchte: Einstellungen → Modul 19 → **Alte Symbole behalten**. Emojis, mdi-Symbole und eigene Bilder bleiben unverändert.

## [2026.11.2b1] - 2026-11-06

Testversion für 2026.11.2 (Woche 1 der Roadmap). Im Dashboard ändert sich noch nichts sichtbar.

### Neu
- **Gemeinsame Grafik-Bibliothek (intern):** Ein HD-Symbolsatz mit 38 Symbolen für Modul 1, 3, 4 und 19 (Heizen & Raum, Energie, Geräte), gleich gut lesbar in hell und dunkel. Dazu Bausteine für den Herkunfts-Ring am Gerätebild, die Prozentzeile Solar/Batterie/Netz und die Restzeit „noch ~ Min.“ (erst ab drei gelernten Läufen). Alte Bild- und Symbolnamen lassen sich automatisch den neuen Symbolen zuordnen. Die Module nutzen die Bibliothek ab den nächsten Testversionen. Schalter „Neue Optik“ („wie bisher“) und „Modul 19: Alte Symbole behalten“ sind vorbereitet.

## [2026.11.1] - 2026-11-05

Erste stabile Version im neuen Versionsschema. Sie enthält alles aus den Testversionen 2026.1029.0b1 bis 2026.11.1b16. Die Bedienungsanleitung hat dazu das neue Kapitel 29 „Neu in Version 2026.11.1“.

### Neu
- **Einstellungen neu gedacht:** Bereiche statt einer langen Seite, gemeinsame Werte für alle Module zentral unter **Haus**, Suche nach Einstellungen und Sensoren, Änderungsverlauf mit Rückgängig, Prüfung mit „Beheben“ und Hilfe „?“ an jeder Stelle.
- **Messwerk und neue Sensorsuche:** Alle Sensoren aller Module an einer Stelle mit „genutzt in“, Live-Wert und Zustand, Zuordnen und Tauschen direkt dort. Bei jeder Sensorauswahl gibt es Vorschläge mit Begründung, eine Auswahl nach Raum und Filter statt langer Listen.
- **Addons:** Module lassen sich unter Einstellungen → Addons installieren, aktualisieren, pausieren und deinstallieren, aus dem signierten Katalog Maddog3010/strom-waerme-addons, mit Rücksprung auf die frühere Version. Müllabfuhr (Modul 17) und Licht & Lampen (Modul 18) sind jetzt Addons, neu ist Modul 21 Saugroboter (in Entwicklung).
- **Modul 1 Fenster & Heizung (v1.6 Build 1):** Messräume nur mit Temperatur und Luftfeuchte, Luftentfeuchter mit Regelung nach der Raumfeuchte, täglicher Standortbestätigung (Karte, Handy, NFC-Tag), „hierher stellen“, bis zu vier Geräten, Vorziehen bei PV-Überschuss oder günstigem Strom, Statistik und Meldungen. Dazu Regelung mit dem Raumsensor (Offset-Ausgleich, „Aus bei Ziel“, Regelung im Detail).
- **Modul 3 Energie (v1.1 Build 1):** Tag, Woche, Monat und Jahr mit Blättern, Bilanz in Euro, Autarkie-Ring, Kacheln mit Vergleich zur Vorperiode, Kosten als Treppe, Diagramme zum Antippen.
- **Modul 4 Gerätestrom (v1.1 Build 2):** Gerätetypen mit passenden Startwerten, Gerätekarten mit Laufzeit und Verlaufslinie, bis zu 15 Geräte statt 8.
- **Versionen:** Unter Einstellungen → System → Versionen stehen die letzten fünf Updates mit ihren Änderungen, die Modulversionen und eine Erklärung der Versionsnummer.

### Geändert
- **Neue Versionsnummern nach Jahr, Monat und Release** (2026.11.1, 2026.11.2 …). Testversionen tragen die Nummer des kommenden Updates mit b1, b2 … Der Update-Hinweis im Dashboard versteht alle bisherigen Schemata.
- **„Tags & Karten“ ist fest eingebaut** (Einstellungen → Haus → Tags & Karten) und kein Lab mehr. Neue Aktionen: Entfeuchter steht hier, Entfeuchter heute aus, Wassertank geleert und Melder geprüft (Modul 11).
- Uhrzeiten werden überall in zwei Feldern für Stunde und Minute eingegeben.
- Die Sicherung enthält jetzt auch Haus-Werte, Messräume, Luftentfeuchter, Messwerk und Tags.

### Behoben
- Die Mac-App von Home Assistant stürzte ab, wenn man auf ein Uhrzeit-Feld tippte.
- Modul 1: Nach dem automatischen „Abwesend“ schaltete die Anwesenheit nicht mehr zuverlässig auf „Zu Hause“ zurück.
- Modul 1: Personen mit eigenen Standortquellen wurden über die Personen-Entität fälschlich als „Zu Hause“ gezählt.
- Auswahlfelder klappten von selbst zu, wenn Home Assistant neue Werte meldete.

### Wichtig beim Update
- Nach dem Update Home Assistant neu starten und die Seite neu laden (Strg+F5, in der App ganz schließen und neu öffnen). Deine Einstellungen bleiben erhalten.
- Beim ersten Start werden gemeinsame Werte (Energiequellen, Preise, Wetterquelle) einmalig nach Einstellungen → Haus übernommen. Vorher wird automatisch gesichert. Unter Einstellungen → Haus zeigt „Was wurde übernommen?“ alles im Einzelnen.
- Wer die Labs „Müllabfuhr“ oder „Licht & Lampen“ an hatte, bekommt sie als Addon mit allen Einstellungen. Angelernte Tags aus „Tags & Karten“ bleiben erhalten.
- Wer eine Testversion von Ende Oktober nutzt (2026.1029.0b1 bis 2026.1030.0b5): HACS hält diese Nummern für neuer. Einmal in HACS über die drei Punkte „Neu herunterladen“ wählen und 2026.11.1 installieren.

## [2026.11.1b16] - 2026-11-04

Testversion (Beta): „Tags & Karten“ ist fest eingebaut.

### Geändert
- **„Tags & Karten“ ist kein Lab mehr, sondern fest eingebaut.** Du findest es unter Einstellungen → Haus → Tags & Karten und in der Einstellungs-Suche. Angelernte Tags, Rückmeldung und Protokoll bleiben erhalten. Tags werden jetzt immer ausgeführt, auch wenn das Lab vorher aus war. Der Sponsor-Vorlauf des Labs entfällt.
- **Luftentfeuchter: Die NFC-Tags am Stellplatz gehören jetzt zu „Tags & Karten“**, als Aktion „Entfeuchter steht hier“. Angelernt wird weiter bequem beim Entfeuchter unter Gerät → Standort. Für diese Tags gelten damit auch Personen, Zeitfenster, Rückmeldung und Protokoll. Ein Tag, das schon eine andere Aktion hatte, wird beim Anlernen umgestellt, mit Hinweis. Bereits beim Entfeuchter angelernte Tags werden beim Update übernommen.

### Neu
- **Neue Tag-Aktionen:**
  - Modul 1 · Luftentfeuchter: „Entfeuchter steht hier“ (Gerät und Raum), „Entfeuchter heute aus“ und „Wassertank geleert“ – zum Beispiel ein Sticker direkt am Gerät für den Tank.
  - Modul 11 · Sicherheit: „Melder geprüft“ für einen bestimmten Melder oder alle. Ein Sticker neben dem Melder, nach dem Test kurz scannen, und die Prüfung steht im Jahresprotokoll.
- Hinweise im Tag-Editor, wenn das zugehörige Modul aus ist oder Müllabfuhr und Licht nicht als Addon installiert sind.

## [2026.11.1b15] - 2026-11-04

Testversion (Beta) mit einer wichtigen Korrektur für die Mac-App.

### Behoben
- **Die Mac-App von Home Assistant stürzte ab, wenn man auf ein Uhrzeit-Feld tippte**, zum Beispiel beim Luftentfeuchter auf „Uhrzeit der Abfrage“. Das Auswahlrad für Uhrzeiten wird in der Mac-App (iPad-App auf dem Mac) nicht unterstützt. Alle Uhrzeiten werden jetzt in zwei kleinen Feldern für Stunde und Minute eingegeben („08 : 00“). Das gilt in allen Apps und Browsern für Luftentfeuchter, Heizplan, Raumeinstellungen, Urlaub (Vorheizen), Modul 2 Warmwasser, Modul 8 Wallbox, Modul 11 Ruhezeiten und Tags & Karten. Werte außerhalb des Bereichs werden begrenzt (z. B. 75 Minuten → 59).
- **Luftentfeuchter: Der Bereich „NFC-Tag am Stellplatz“ im Reiter „Standort“ ist jetzt immer zu sehen.** Bei einem noch nicht gespeicherten Gerät steht dort ein Hinweis, dass Tags nach dem Speichern angelernt werden.

## [2026.11.1b14] - 2026-11-04

Testversion (Beta) mit Schritt 3, 4 und 5 (NFC) des Luftentfeuchters in Modul 1.

### Neu
- **Modul 1 (v1.5): Luftentfeuchter – Schnellumzug und mehrere Geräte.**
  - **„Hierher stellen“** auf jeder Raumkarte mit Luftfeuchte-Sensor, auch bei Messräumen. Ein Tipp setzt den Standort um, der Tag gilt damit als bestätigt.
  - **Bis zu vier Geräte**, jedes mit eigenem Standort, eigener täglicher Abfrage, eigenen Zielwerten und eigener Statistik. Einstellungen → Modul 1 → Luftentfeuchter zeigt die Geräteliste mit „Gerät hinzufügen“.
- **Modul 1: Luftentfeuchter – Strom und Statistik.**
  - **Vorziehen bei PV-Überschuss oder günstigem Strom** (Reiter „Strom“): Der Entfeuchter startet dann schon über einer niedrigeren Schwelle (Standard 57 %) und trocknet vor. Die Obergrenze gilt immer. Überschuss aus dem Netz-Sensor, Strompreis aus Einstellungen → Haus.
  - **Statistik** für Heute, 7 Tage, Monat und Jahr: Laufzeit, Strom (gemessen oder mit der Nennleistung geschätzt), Kosten zum jeweiligen Strompreis, entfeuchtete Menge (Liter pro Stunde) und Tage pro Raum.
  - **Meldungen** auf der Raumkarte und an die Handys des Geräts: Tank voll, Feuchte bleibt trotz Betrieb zu hoch (nach einstellbaren Stunden), Standort fehlt, Filter reinigen nach Betriebsstunden (mit „Filter gereinigt“). Jede Meldung kommt einmal je Anlass.
  - **Ereignis `fenster_heizung_entfeuchter`** bei Start, Stopp, Tank voll und Standortwechsel für eigene Automationen.
- **Modul 1: Luftentfeuchter – NFC-Tag am Stellplatz.** Je Raum lässt sich ein NFC-Tag anlernen (Einstellungen → Modul 1 → Luftentfeuchter → Gerät → Reiter „Standort“). Hältst du das Handy mit der Home-Assistant-App daran, steht das Gerät dort und der Standort gilt für heute als bestätigt, im Verlauf als „per NFC-Tag bestätigt“. Ein Tag gehört genau einem Gerät und Raum. Funktioniert auch ohne das Lab „Tags & Karten“. Ist ein Tag dort schon mit einer Aktion belegt, kommt ein Hinweis.

### Geändert
- Die bisherigen Daten des Entfeuchters (Standort, Verlauf, Laufzeit) werden beim Update übernommen.
- Benachrichtigungen enthalten jetzt die Geräte-ID in den Tasten. Ältere Benachrichtigungen funktionieren weiter.

## [2026.11.1b13] - 2026-11-04

Testversion (Beta) mit Schritt 2 des Luftentfeuchters in Modul 1.

### Neu
- **Modul 1 (v1.4): Luftentfeuchter – tägliche Standortbestätigung.** Einmal am Tag wird bestätigt, in welchem Raum der Entfeuchter steht. Bis zur Antwort gilt der Raum von gestern.
  - **Standort-Karte:** Ab der eingestellten Uhrzeit (Standard 8:00) erscheint in Modul 1 „Wo steht der Luftentfeuchter heute?“ mit Kacheln der Räume und ihrer Luftfeuchte. Der Raum von gestern ist vorgewählt. Dazu „Bestätigen: …“, „Heute nicht in Betrieb“ und „Verlauf ansehen“.
  - **Erinnerung am Handy:** Benachrichtigung über die Home-Assistant-App mit Tasten für bis zu drei Räume (zuerst der von gestern, dann die meistgenutzten). Ein Tipp auf eine Taste bestätigt den Standort, ein Tipp auf die Nachricht öffnet das Dashboard. Auf Wunsch nur, wenn jemand zu Hause ist. Mit Test-Abfrage in den Einstellungen.
  - **Ohne Antwort** bis zur eingestellten Uhrzeit (Standard 12:00): „Wie gestern“ (Raum von gestern wird übernommen), „Pausieren“ (Entfeuchter bleibt aus, bis jemand bestätigt) oder „Nur Hinweis“ (läuft wie gestern, die Karte erinnert weiter).
  - **Standortverlauf:** Raum und Art der Bestätigung je Tag, Laufzeit des Tages und Tage pro Raum der letzten 14 Tage.
  - **Raumkarte:** Der Entfeuchter-Kasten zeigt, ob der Standort heute bestätigt ist, mit Link zum Verlauf.
  - **Einstellungen:** Reiter „Standort“ mit Uhrzeit, „nur wenn jemand zu Hause ist“, Frist und Verhalten ohne Antwort, Räumen zur Auswahl und Handys, alles ohne Aufklappmenüs. Zwischendurch ändern geht jederzeit, die Regelung folgt sofort.

## [2026.11.1b12] - 2026-11-04

Testversion (Beta) mit Phase 3 des Addon-Konzepts: Müllabfuhr und Licht sind jetzt Addons.

### Neu
- **Modul 17 Müllabfuhr (v0.1.0 Build 1) als Addon:** Abholtermine, Tonnen-Ampel, Erinnerung, Ansage, Licht und Kosten wie bisher, jetzt unter Einstellungen → Addons installierbar, pausierbar und über den Katalog aktualisierbar.
- **Modul 18 Licht & Lampen (v0.1.0 Build 1) als Addon:** Lampen nach Räumen, Szenenknöpfe und Hinweis bei langem Licht wie bisher.
- **Automatischer Umzug:** Wer das Lab „Müllabfuhr“ oder „Licht & Lampen“ an hatte, bekommt das Addon beim ersten Start einmal automatisch, das Lab wird ausgeschaltet. Alle Einstellungen bleiben erhalten.

### Geändert
- Müllabfuhr und Licht stehen nicht mehr unter Labs, sondern unter Einstellungen → Addons. Das Dashboard ist dadurch rund 38 kB kleiner.
- Addons können Module mitbringen, die vorher im Kern lagen, samt ihrem bisherigen Speicher.

## [2026.11.1b11] - 2026-11-04

Testversion (Beta): Addons sind jetzt Teil der Einstellungen.

### Neu
- **Addons in den Einstellungen:** Unter Module stehen aktive Addons neben den anderen Modulen, unter Addons hat jede Zeile den Knopf „Einstellungen“.
- **Suche findet Einstellungen von Addons** und öffnet gleich den passenden Reiter.
- **Messwerk zeigt die Sensoren der Addons** mit „genutzt in“ und dem Weg zur Einstellung. Jedes Addon meldet seine Sensoren selbst.
- **Modul 21 Saugroboter (v0.1.2 Build 1):** Einstellungen in den Haupteinstellungen, Suche nach Roboter, Räumen und Meldungen, Roboter-Sensoren im Messwerk.

### Behoben
- Die Einstellungen eines Addons waren außerhalb seiner Seite ohne Gestaltung.

## [2026.11.1b10] - 2026-11-04

Testversion (Beta) mit zwei Fehlerbehebungen für Addons aus dem Katalog.

### Behoben
- **Installieren aus dem Katalog brach mit „Die Größe der Datei stimmt nicht mit dem Katalog überein“ ab.** Beim Herunterladen wurde nur der erste Datenblock gelesen. Jetzt wird die Datei vollständig geladen und danach wie bisher auf Größe und Prüfsumme geprüft.
- **Der Reiter Katalog zeigte bei nicht installierten Addons die mitgelieferte Version** statt der neueren aus dem Katalog. Jetzt steht dort die Version, die du beim Installieren bekommst, mit „aus dem Katalog“.

## [2026.11.1b9] - 2026-11-04

Testversion (Beta) mit einer Fehlerbehebung in Modul 1.

### Behoben
- **Modul 1 Fenster & Heizung (v1.3 Build 2): Anwesenheit schaltet wieder auf „Zu Hause“ zurück.** Nach dem automatischen „Abwesend“ machte jede gespeicherte Einstellung (Absenk-Temperatur, Personen, Standort) daraus ein „Abwesend von Hand“, das nie mehr von selbst zurückging. Einstellungen ändern den Modus jetzt nicht mehr.
- **Von Hand „Abwesend“** endet, sobald danach jemand nach Hause kommt. **Von Hand „Zu Hause“**, obwohl niemand da ist, wechselt erst nach der eingestellten Wartezeit wieder auf abwesend.
- Das Dashboard lädt die Anwesenheit jede Minute nach. Ein lange offenes Fenster zeigt keinen veralteten Stand mehr und kann ihn beim Speichern nicht zurückschreiben.

## [2026.11.1b8] - 2026-11-04

Testversion (Beta): Addons kommen jetzt aus einem signierten Katalog auf GitHub.

### Neu
- **Addon-Katalog** Maddog3010/strom-waerme-addons: Die Integration prüft ihn beim Start und einmal am Tag, unter Einstellungen → Addons auch mit „Jetzt prüfen“. Ohne gültige Unterschrift wird nichts angeboten.
- **Updates für Addons unabhängig von der Integration:** Reiter Updates mit „Was ist neu“, Größe und Prüfung. Vor dem Entpacken werden Unterschrift, Größe und SHA-256 der Datei geprüft.
- **Rücksprung:** Die bisherige Version bleibt liegen. Startet eine neue nicht, läuft automatisch wieder die alte, von Hand mit „Zurück zu …“.
- **Addons direkt aus dem Katalog installieren**, auch wenn sie nicht in der Integration mitgeliefert sind. Sie liegen in config/strom_waerme_addons und überstehen HACS-Updates.
- **Übersicht der Einstellungen:** Hinweis auf verfügbare Addon-Updates und auf Addons, die nicht laufen.

### Geändert
- Ohne Internet laufen installierte Addons weiter, der letzte gültige Katalog bleibt stehen.

## [2026.11.1b7] - 2026-11-03

Testversion (Beta) mit dem neuen Addon-System und dem ersten Addon, Modul 21 Saugroboter.

### Neu
- **Addons:** Module lassen sich unter **Einstellungen → Addons** installieren, pausieren, fortsetzen und deinstallieren, ohne Home Assistant neu zu starten. Reiter Installiert, Katalog und Updates, Steckbrief vor dem Installieren (Ablage, Größe, benötigte Version, Internet). Beim Deinstallieren wählst du, ob deine Daten bleiben. Ein fehlerhaftes Addon stört den Rest nicht und wird nach wiederholten Fehlern pausiert.
- **Ablage der Addons:** mitgeliefert im Ordner `addons/` der Integration oder in einem eigenen Ordner `strom_waerme_addons` in der Konfiguration, der HACS-Updates übersteht. Das Laden aus einem eigenen GitHub-Repository folgt.
- **Modul 21 Saugroboter (v0.1.0 Build 1):** erstes Addon, in Entwicklung. Roboter-Karte mit Fortschritt, Akku, Raum, Zeit und Fläche, Start/Pause, Zur Station, Finden.
- **Modul 21 Saugroboter (v0.1.0 Build 1):** Raum-Kacheln mit „zuletzt gereinigt“ und Ampel, Räume antippen und reinigen lassen oder alle fälligen auf einmal. Räume über die Bereichs-Zuordnung von Home Assistant (ab 2026.3) oder bei Roborock über den Namen.
- **Modul 21 Saugroboter (v0.1.0 Build 1):** Karte des Roboters, Woche mit allen Fahrten der letzten 7 Tage (auch aus der App des Herstellers), Verschleißteile, Kachel und Hinweise auf Start und Tablet, Meldung wenn der Roboter Hilfe braucht.

## [2026.11.1b6] - 2026-11-03

Testversion (Beta) mit der neuen Sensorsuche im Messwerk (S1, S2, S4) und Zuordnen direkt im Messwerk.

### Neu
- **Sensorsuche ohne lange Liste**, überall wo ein Sensor gewählt wird (Haus, Raumeinstellungen, Module, Messwerk), in drei Reitern:
  - **Vorschläge (S1):** die drei besten Treffer als Karten mit Live-Wert, Trefferquote und Begründung („im Bereich Bad · Name passt · %“). Ein Tipp auf „Passt“ übernimmt. Sensoren, die schon für etwas anderes genutzt werden oder am Heizkörper messen, rutschen nach unten.
  - **Nach Raum (S2):** Bereiche aus Home Assistant als Kacheln (der passende Raum ist markiert), dann die Geräte mit Hersteller, dann ihre Werte.
  - **Filter (S4):** Einheit, Raum und Integration als Chips antippen, die Liste wird mit jedem Tipp kürzer.
- **Messwerk: Zuordnen und Tauschen direkt im Messwerk** für Haus-Werte (Energiequellen, Ladestand, Preise, Wetter, Außentemperatur, Wind), Raumeinstellungen in Modul 1 (Fenster und Thermostate auch hinzufügen), Modul 2, Modul 4 und Modul 8. Gilt sofort für alle Module, die den Sensor nutzen, mit Verlauf und Rückgängig.
- **Offene Aufgaben im Messwerk:** fehlen wichtige Haus-Sensoren (Solar, Netz, Batterie, Ladestand, Außentemperatur, Zähler), stehen sie mit „Zuordnen“ in der Liste.

### Geändert
- Das Suchfeld in der Sensor-Auswahl entfällt. Nach Namen suchen geht weiter über die Suche oben in den Einstellungen.

## [2026.11.1b5] - 2026-11-03

Testversion (Beta) mit dem Messwerk, Stufe M1: alle Sensoren der Module 1–19 an einer Stelle.

### Neu
- **Einstellungen → Messwerk.** Jeder Sensor, der irgendwo in der Integration eingestellt ist, erscheint hier einmal mit seiner Aufgabe („Netzleistung“, „Fenster · Bad“, „Speicher oben“), Live-Wert, Zustand und den Nummern der Module, die ihn nutzen. Gesammelt wird aus Haus, Räumen, Messräumen, Thermostat-Batterien, Modul 2, 4, 8, 9, 11, 16, 17, 18, 19, Luftentfeuchter, Tags, Tablet-Modus und Personen.
- **Genutzt in:** Ein Tipp auf einen Sensor zeigt, in welchen Modulen er wofür verwendet wird (ausgeschaltete Module grau), wann er zuletzt einen Wert geliefert hat und wo er eingestellt wird, mit Sprung dorthin.
- **Gruppen und Filter:** Strom, Klima, Fenster & Türen, Wetter, Wasser & Wärme, Geräte, Fahrzeug, Sicherheit, Alltag, Personen. „Probleme“ zeigt nur Sensoren ohne Wert, mit falscher Einheit oder die in Home Assistant fehlen.
- **Hinweise des Messwerks:** zum Beispiel ein eigener Außensensor in einem Raum, der vom Haus abweicht, oder ein Sensor, von dem viele Module abhängen.
- **Prüfung in der Übersicht** meldet Sensorprobleme jetzt einmal je Sensor für alle Module statt je Modul.
- **Suche** findet auch Sensoren nach Name oder Entity-ID („tibber“ zeigt Netzleistung und Strompreis mit ihren Modulen).
- Eigener Speicher mit Schema-Version, der sich merkt, wann ein Sensor zuletzt geliefert hat. Ist in den Sicherungen enthalten.

### Hinweis
- In M1 liest das Messwerk nur. Eingestellt wird weiter an der angezeigten Stelle. Zuordnen und Tauschen direkt im Messwerk folgen mit M2 und M3.

## [2026.11.1b4] - 2026-11-03

Testversion (Beta) mit Stufe 3 des neuen Aufbaus der Einstellungen: Katalog, Suche, Verlauf mit Rückgängig, erweiterte Prüfung, Hilfe an der Stelle und Modul 1 mit Reitern.

### Neu
- **Suche in den Einstellungen.** Oben über den Bereichen (am Handy über der Liste). „Preis“ findet Bezugspreis, Einspeisevergütung und Stundenpreis-Sensor mit Pfad und aktuellem Wert, ein Tipp springt zur Stelle. Gesucht wird auch nach Stichworten wie „Tibber“, „Akku“ oder „Balkon“.
- **Änderungsverlauf mit Rückgängig.** Jede Änderung an allgemeinen Einstellungen, Haus-Werten, Modulen und Modul 2 wird mit Benutzer und Zeit gemerkt (die letzten 50). Unter System → Änderungsverlauf lässt sich jede Zeile einzeln mit ↶ zurücknehmen. Die Übersicht zeigt die letzten drei Änderungen.
- **„Gespeichert · Rückgängig“** erscheint nach jeder Änderung für 10 Sekunden.
- **Prüfung mit Regeln:** Zusätzlich zu Sensoren ohne Wert prüft die Übersicht jetzt, ob die Einheit passt (Leistung in W oder kW, Ladestand in %, Preis in ct oder €, Außentemperatur in °C) und ob das Vorzeichen des Netzes plausibel ist. Jeder Hinweis hat „Beheben“ und springt zur passenden Einstellung.
- **Hilfe an der Stelle:** „?“ an vielen Einstellungen erklärt kurz, was sie bewirkt, zeigt den aktuellen Wert und führt zur Einstellung oder zur Bedienungsanleitung.
- **Einstellungs-Katalog:** Alle wichtigen Einstellungen sind einmal beschrieben (Name, Bereich, Ebene, Einheit, Hilfe, Prüfregel). Daraus entstehen Suche, Hilfe, die Namen im Verlauf und die Prüfung.

### Geändert
- **Modul 1 · Einstellungen mit Reitern** statt Abschnitten zum Aufklappen: Regeln (Sommermodus, wetterabhängige Absenkung), Elektroheizer und Geräte (Luftentfeuchter, Ventile & Batterien), dazu Labs, wenn eingeschaltet. Die anderen Module folgen nach und nach.
- Hinweise der Prüfung, die etwas zu tun haben, heißen jetzt „Beheben“ statt „Öffnen“.

## [2026.11.1b3] - 2026-11-03

Testversion (Beta) mit Stufe 2 des neuen Aufbaus der Einstellungen: gemeinsame Werte liegen zentral im Haus.

### Neu
- **Haus-Werte zentral.** Energiequellen (Solar, zweite Anlage, Netz mit Vorzeichen, Hausverbrauch, Batterie, Zähler), Batterie-Ladestand, Preise & Tarif (Bezugspreis und Einspeisevergütung, Festwert oder Sensor) und Wetterquelle (Wetter, Außentemperatur, Wind, amtliche Warnungen) haben einen eigenen Speicher „Haus“. Alle Module lesen sie von dort.
- **Einstellungen → Haus** mit eigenen Seiten für Energiequellen, Preise & Tarif und Wetterquelle: jeder Sensor mit Live-Wert, „Gilt für Modul …“, Prüfung von Vorzeichen und fehlenden Werten, „Bearbeiten“.
- **Einmalige Übernahme** beim ersten Start aus Modul 1, Modul 3, der Darstellung und Modul 9. Vorher wird von jedem betroffenen Bereich automatisch eine interne Sicherungskopie angelegt. Haben Modul 1 und Modul 3 verschiedene Netz-Sensoren genutzt, gilt Modul 3, und die Übersicht weist darauf hin. „Was wurde übernommen?“ zeigt alles im Einzelnen.
- **Schema-Versionen:** Der Haus-Speicher trägt eine Versionsnummer. Spätere Updates wandeln alte Stände gezielt um, statt Standardwerte einzusetzen.

### Geändert
- Modul 1 (PV-Überschuss, Strompreis), Modul 3, die Darstellung und Modul 9 zeigen an diesen Stellen einen Verweis „🏠 Haus“ statt eigener Auswahl. Netz-Sensor und Vorzeichen sind für Modul 1 und Modul 3 jetzt immer gleich.
- Ältere Fenster und Browser mit alter Oberfläche dürfen die Werte weiter an der alten Stelle ändern: Die Änderung wird ins Haus übernommen und an alle Module verteilt.
- Die Datei-Sicherung enthält die Haus-Werte. Ältere Sicherungen werden wie bisher eingelesen und ins Haus übernommen.

### Behoben
- Die Prüfung erkannte einen Strompreis-Sensor ohne Wert nicht, und Modul 3 zeigte den aktuellen Strompreis im Banner nicht an.

## [2026.11.1b2] - 2026-11-03

Testversion (Beta) mit dem neuen Messraum und dem Luftentfeuchter in Modul 1.

### Neu
- **Modul 1 (v1.3): Messraum.** Ein Raum nur zum Messen, ohne Thermostat und ohne Fenstersensor, zum Beispiel für Keller, Dachboden, Gästezimmer oder Vorratsraum. Er zeigt nur Temperatur und Luftfeuchte und steuert nichts. Ein Sensor genügt.
  - **Anlegen:** In Modul 1 unten „Raum hinzufügen“ → „Nur Messwerte“: Name, Temperatursensor, Luftfeuchte-Sensor und optional ein Batterie-Sensor. Es werden nur passende Sensoren vorgeschlagen. Ist ein Sensor schon in einem anderen Raum eingetragen, kommt nur ein Hinweis. Heizungsräume legst du wie bisher über Geräte & Dienste oder den Einrichtungsassistenten an.
  - **Vorschläge:** Bereiche in Home Assistant mit Temperatur- oder Feuchtesensor, aber ohne Thermostat, erscheinen im Dialog und im Einrichtungsassistenten mit „Als Messraum hinzufügen“.
  - **Anzeige:** eigene, kleinere Karte unter den Heizungsräumen. Grün im Wohlfühlbereich (Standard 18 bis 24 °C und 40 bis 60 %), blau zu kalt, gelb zu warm, zu feucht oder zu trocken. Min und Max von heute aus dem Verlauf von Home Assistant. „Keine Daten“ mit gestricheltem Rahmen, wenn der Sensor ausfällt; graue Zahl mit „vor X Std.“, wenn er sich länger nicht meldet (Standard 60 Min.). Unplausible Werte werden nicht gezeigt. Taupunkt und Schimmelhinweis lassen sich einzeln zuschalten.
  - **Raumeinstellungen** über das Zahnrad: Sensoren, Anzeige, Wohlfühlbereich, Sensor-Alter, Löschen. Symbol, Farbe und Foto wie bei Heizungsräumen.
  - Die Kopfkarte zeigt die Zahl der Messräume. Messräume sind in den Sicherungen enthalten.
- **Modul 1: Luftentfeuchter (Schritt 1: Gerät und Regelung).** Ein mobiler Entfeuchter wird mit der Luftfeuchte und den Fenstern des Raums geregelt, in dem er gerade steht. Einrichten unter Einstellungen → Modul 1 → Luftentfeuchter, in Reitern ohne Aufklappmenüs und mit Zahlen über Minus und Plus.
  - **Gerät:** eigene Entität (z. B. humidifier), Schaltsteckdose oder „nur beobachten“ für Geräte mit eigenem Hygrostat. Optional Leistung (zeigt, ob er wirklich läuft) und Wassertank-Sensor. Ohne Tank-Sensor schätzt Modul 1 die Füllung aus Laufzeit, Tankinhalt und Liter pro Stunde.
  - **Regelung:** ein über der Obergrenze (Standard 60 %), aus bei der Untergrenze (55 %). Bei Abwesenheit oder Urlaub gilt eine höhere Obergrenze (65 %). Mindestlaufzeit und Sperrzeit verhindern ständiges Schalten. Aus bei offenem Fenster, vollem Tank, fehlender Raumfeuchte oder unbekanntem Standort. Optional „Lüften vor Entfeuchten“, wenn die Luft draußen trockener ist (ab Werk aus).
  - **Raumkarte:** Im Raum des Standorts erscheint ein türkiser Kasten mit Status, Laufzeit, Tankstand und „Warum?“, dazu „Standort ändern“, „Heute aus“ und „Tank geleert“. Als Standort sind alle Räume mit Luftfeuchte-Sensor wählbar, auch Messräume.
  - **Standort:** Ohne Standort zeigt Modul 1 eine Karte „Wo steht der Luftentfeuchter?“ mit Kacheln aller Räume und ihrer Feuchte. Der Standort gilt, bis du ihn änderst, und wird je Tag gespeichert. Die tägliche Bestätigung folgt in einem späteren Schritt.
  - Standort setzen, „Heute aus“ und „Tank geleert“ dürfen alle im Haushalt, die Einstellungen nur Administratoren. Der Entfeuchter ist in den Sicherungen enthalten.

### Geändert
- „Raum hinzufügen“ in Modul 1 fragt zuerst nach der Art des Raums. „Mit Heizung und Fenster“ führt wie bisher zu Geräte & Dienste.

## [2026.11.1b1] - 2026-11-03

Testversion (Beta) für das erste stabile Update im November (2026.11.1): neue Versionsnummern, eine Korrektur bei den Personen und mehr Geräte in Modul 4.

### Behoben
- **Personen & Standort: Eine Person blieb „Zu Hause“, obwohl ihr gewähltes Gerät „Unterwegs“ meldete.** Bisher wurde zusätzlich immer die Personen-Entität von Home Assistant ausgewertet. Meldete sie noch „home“ – etwa über einen weiteren dort hinterlegten Tracker oder eine alte Position –, blieb die Person zu Hause, und das automatische Abwesend schaltete nicht. Jetzt gilt: Sind für eine Person eigene Standortquellen (Geräte oder WLAN-/Router-Erkennung) gewählt, zählen nur diese. Entfernung und Kartenpunkt kommen dann vom gewählten Gerät. Personen ohne eigene Quelle verhalten sich wie bisher.

### Geändert
- **Neue Versionsnummern: Jahr.Monat.Release.** Stabile Updates heißen jetzt `2026.11.1`, `2026.11.2` …, mit jedem Monat beginnt der Zähler wieder bei 1 (`2026.12.1`, `2027.1.1`). Testversionen tragen die Nummer des Updates, das sie vorbereiten, mit b1, b2 … (`2026.11.2b1` → `2026.11.2`). So sortieren Home Assistant und HACS stabile Versionen und Testversionen immer richtig. Update-Hinweis und das Fenster „Versionen“ verstehen alle bisherigen Schemata.
- **Wichtig für die Testversionen `2026.1029.0b1` bis `2026.1030.0b5`:** HACS hält diese Nummern für neuer als `2026.11.x` und bietet das Update nicht von selbst an. Einmal in HACS über die drei Punkte **Neu herunterladen** die gewünschte Version wählen, danach laufen Updates wieder normal.
- **Modul 4: bis zu 15 statt 8 Geräte.** Der Knopf „Gerät hinzufügen“ zeigt, wie viele schon eingerichtet sind.

## [2026.1030.0b5] - 2026-10-30

Testversion (Beta) mit besserer Regelung in Modul 1.

### Neu
- **Modul 1: Thermostate regeln mit dem Raumsensor (je Raum, Standard aus).** Ein Thermostat misst direkt am Heizkörper und schließt deshalb oft zu früh oder zu spät. Unter Raumeinstellungen → Raumtemperatur-Sensor gibt es zwei neue Schalter:
  - **Offset-Ausgleich:** Das Soll wird um den geglätteten Unterschied zwischen Thermostat und Raum verschoben (höchstens ±3 K, frühestens alle 10 Minuten). Wirkt mit Heizplan oder Abwesenheit. Wurde die Temperatur am Gerät von Hand geändert, pausiert der Ausgleich bis zum nächsten Schaltpunkt.
  - **Aus bei Ziel:** Erreicht der Raum das Ziel, gehen die Thermostate aus (Geräte ohne Aus-Zustand wie Homematic IP, Shelly oder Danfoss: kleinste Temperatur). 0,5 K darunter heizen sie wieder. Fällt der Sensor aus, regeln sie sofort wieder selbst.
- **Modul 1: Regelung im Detail** im Fenster „Warum?“: Ziel, Raumtemperatur und je Thermostat Soll, Messwert, Unterschied, Ventilstellung (falls das Gerät sie meldet) und der aktuelle Ausgleich. Mit Tipp, wenn ein Thermostat deutlich falsch misst.

### Geändert
- Die Raumkarte zeigt „Ziel erreicht: Thermostate aus“ bzw. „wird ausgeglichen“ beim Hinweis zum Unterschied.
- Bei offenem Fenster, „Heizung aus“ oder laufendem Elektroheizer verändert die neue Regelung nichts.

## [2026.1030.0b4] - 2026-10-30

Testversion (Beta).

### Behoben
- **Modul 17, 18 und 19: Der Knopf „Einstellungen“ öffnet jetzt die Haupteinstellungen** wie in allen anderen Modulen. Bisher öffnete er nur das Fenster des Moduls. Die Einstellungen der Module erreichst du über Einstellungen → Module.
- **Modul 19:** Der Knopf im Kopf heißt jetzt „Einstellungen“ statt „Einrichten“.
- Einstellungen → Erweiterungen zeigt „1 Lab“ statt „1 Labs“. Modul 17 und 18 zeigen in der Modulliste ihre Version.

## [2026.1030.0b3] - 2026-10-30

Testversion (Beta) mit dem neuen Aufbau der Einstellungen (Stufe 1).

### Neu
- **Einstellungen nach Bereichen:** Übersicht, Haus, Module, Darstellung, Dieses Gerät, Erweiterungen, System und Sponsor. Am Desktop und Tablet quer stehen die Bereiche links und der Inhalt rechts, auf dem Handy öffnet jeder Bereich eine eigene Seite mit „‹ Einstellungen“.
- **Übersicht mit Prüfung:** Kennzahlen (aktive Module, Einrichtungsstand, Räume und Personen, letzte Sicherung auf den Homeserver) und eine Prüfung, die Sensoren ohne Wert, noch nicht eingerichtete Module, eine fehlgeschlagene oder alte Homeserver-Sicherung, neue Versionen und Testversionen meldet. Jeder Hinweis öffnet direkt die passende Einstellung.
- **Haus:** Räume, Personen & Standort, Energiequellen, Preise & Tarif und Wetterquelle an einer Stelle. Energiequellen, Preise und Wetterquelle öffnen vorerst noch die Einstellungen von Modul 3, Modul 1 und Modul 9.
- **Dieses Gerät:** zeigt, was nur in diesem Browser gespeichert ist (Tablet-Modus, Zeitraum in Modul 3 und 4, Ansicht der Raumkarten).
- **Markierung** „für alle“ und „nur dieses Gerät“ an den Einstellungen.

### Geändert
- **Module:** Status je Modul zeigt jetzt auch Sensoren ohne Wert. Ausgeschaltete Module stehen als kleines, einklappbares Raster darunter.
- Store, Labs und „Module verwalten“ stehen unter „Erweiterungen“, Sichern, Diagnose und Versionen unter „System“.
- Die bisherigen Einstellungsfenster der Module bleiben unverändert.

## [2026.1030.0b2] - 2026-10-30

Testversion (Beta) mit Modul 4 v1.1.

### Neu
- **Modul 4 Gerätestrom (v1.1 Build 1): Zeitraum Tag, Woche, Monat und Jahr** nach Kalender wie in Modul 3, mit ‹ › zum Blättern. Statt „7 Tage, 30 Tage, 12 Monate“.
- **Banner für den Zeitraum:** gespart, Durchläufe, Energie und Kosten, Ring „eigener Strom“. Chips für laufende und heute fertige Geräte.
- **Kacheln** Gespart, Kosten (mit Ø je Durchlauf), Energie und Eigener Strom, mit Vergleich zur Vorperiode, gleich lang wie der bisher vergangene Teil.
- **Gerätetypen mit Symbol** (Waschmaschine, Trockner, Spülmaschine, Kühlgerät, Küche, Pool, Computer, Fernseher, Werkstatt, Gerät). Der Typ wird aus dem Namen erraten und lässt sich in den Einstellungen ändern, dabei werden passende Startwerte gesetzt.
- **Gerätekarten:** Laufzeit bei laufenden Geräten, Werte für den gewählten Zeitraum mit Zahl der Läufe, Datum des letzten Durchlaufs, kleine Verlaufslinie. Ein Tipp auf den Kopf der Karte filtert das Diagramm.
- **Diagramm zum Antippen:** Tag als Balken je Gerät, Woche, Monat und Jahr als gestapelte Balken mit Werten unter Finger oder Maus, ein Tipp auf einen Balken öffnet den Tag oder Monat.

### Geändert
- **Farben wie in Modul 3:** Solar gelb, Batterie violett, Netz rot.
- Die Tageswerte enthalten jetzt die Zahl der Durchläufe, und die Seite kennt den Startzeitpunkt laufender Geräte.

## [2026.1030.0b1] - 2026-10-30

Testversion (Beta) mit Modul 3 v1.1.

### Neu
- **Modul 3 Energie (v1.1 Build 1): Zeitraum Tag, Woche, Monat und Jahr.** Nach Kalender statt „7 und 30 Tage“. Mit ‹ › blätterst du zu gestern, zur Vorwoche, zum Vormonat oder Vorjahr, „Heute“ springt zurück. Tage älter als die Recorder-Historie kommen als Stundenwerte aus der Langzeitstatistik.
- **Banner mit Bilanz.** Neue Zeile mit Solar, Verbrauch und Bilanz in Euro für den gewählten Zeitraum. Der Ring zeigt die Autarkie, ein Tipp schaltet auf „gedeckt jetzt“ um. Mit Preissensor zusätzlich der aktuelle Strompreis.
- **Kacheln mit Verlauf und Vergleich.** Kleine Verlaufslinie je Kachel und Vergleich zur Vorperiode, gleich lang wie der bisher vergangene Teil. Ein Tipp auf eine Kachel hebt die passende Fläche im Diagramm hervor.
- **Diagramm zum Antippen.** Tag: Solar, aus Batterie, aus dem Netz und Verbrauch, dazu die Prognose aus Modul 16, wenn es eingeschaltet ist. Woche, Monat, Jahr: gestapelte Balken, Einspeisung nach unten. Tippen oder Überfahren zeigt die Werte, ein Tipp auf einen Balken öffnet den Tag oder Monat.
- **Kosten als Treppe** von Netzkosten über Vergütung und gesparten Bezug zur Bilanz, dazu „Ohne Solar hättest du gezahlt“.
- **Vorzeichen prüfen** in den Einstellungen: zeigt live, wie Netz und Batterie gerade gelesen werden, und warnt, wenn es nicht zusammenpasst. Geändert wird nur mit „Umdrehen“.
- **Anzeige-Einstellungen** (pro Gerät): Ring Autarkie oder gedeckt, Vergleich an oder aus.

### Geändert
- Leistungssensoren werden für Woche, Monat und Jahr immer aus Stunden-Mittelwerten gerechnet. „Wohin der Strom geht“ bleibt bei „Heute“, weil Heizer und Heizstab nur Tageswerte liefern.

## [2026.1029.0b1] - 2026-10-29

Erste Testversion mit dem neuen Versionsschema. Sie erscheint in HACS nur, wenn für dieses Repository Beta-Versionen eingeschaltet sind.

### Neu
- **Neues Versionsschema Jahr.MonatTag.Zähler.** Statt 3.0.7.6 heißt die Version jetzt zum Beispiel 2026.1029.0: erschienen am 29. Oktober 2026, erstes Update des Tages. Kommt am selben Tag noch ein Update, steigt der Zähler (2026.1029.1). Ab Januar ohne führende Null, der 5. Januar 2027 ist 2027.105.0.
- **Beta-Kanal.** Testversionen enden auf b1, b2 … und werden auf GitHub als Pre-Release veröffentlicht. HACS bietet sie nur an, wenn Beta-Versionen eingeschaltet sind. Die stabile Version des Tages liegt immer über ihren Testversionen (2026.1029.0b1 < 2026.1029.0).
- **Einstellungen → System → Versionen neu.** Die letzten 5 stabilen Versionen stehen offen mit Datum, kurzem Änderungstext und den geänderten Modulen. Testversionen erscheinen dort nicht. Ist eine Beta installiert, weist ein kurzer Hinweis oben darauf hin.
- **Modulversionen im eigenen Fenster.** Die bisherige Übersicht (Tabelle, Aufstieg, Stufen) öffnet sich über „Modulversionen“ und bleibt unverändert, mit Zurück zu „Versionen“.
- **Erklärung der Hauptversion** unten im Fenster „Versionen“.

### Geändert
- **Versionshinweis in der Kopfzeile.** Überall einheitlich „Version 2026.1029.0“, bei einer Testversion „Beta 2026.1029.0b1“ in Gelb. Ein Tipp darauf öffnet „Versionen“.
- **Update-Hinweis** versteht das neue Schema. Wer eine Beta nutzt, bekommt auch neuere Betas angezeigt, alle anderen nur stabile Versionen. Hinweis: Installationen bis 3.0.7.6 erkennen das neue Schema im eigenen Update-Hinweis noch nicht. HACS zeigt das Update trotzdem an.
- Die Änderungstexte für „Versionen“ werden beim Bauen aus dieser Datei übernommen (frontend-src/build.py).

## [3.0.7.7] - 2026-10-29

Brücken-Version zum neuen Versionsschema (Zweig release-3.0.7.7). Gleicher Stand wie 3.0.7.6, nur Update-Prüfung und Hinweis sind neu.

### Geändert
- **Update-Prüfung versteht das neue Versionsschema**, Testversionen werden im Update-Hinweis nicht angezeigt.
- **Einmaliger Hinweis** auf die neuen Versionsnummern für Administratoren.

## [3.0.7.6] - 2026-10-29

### Geändert
- **Modul 19 Hausfluss (v0.5 Build 6): Der Fluss in den Linien richtet sich nach der Leistung.** Bei wenigen Watt laufen wenige, langsame, kleine Punkte, bei mehreren Kilowatt viele, schnelle und etwas größere. So siehst du auf einen Blick, wie stark die Energie fließt. Bei neuen Werten bleibt der Fluss im Takt.

## [3.0.7.5] - 2026-10-29

### Geändert
- **Modul 19 Hausfluss (v0.5 Build 5): Handy-Ansicht, obere Kacheln mittig.** Sind beide oberen Kacheln belegt, stehen sie nebeneinander mittig über dem Haus statt links und rechts außen.

## [3.0.7.4] - 2026-10-29

### Geändert
- **Modul 19 Hausfluss (v0.5 Build 4): Der Fluss in den Linien läuft durchgängig.** Pro Linie wandern drei Punkte hintereinander, und beim Neuzeichnen durch neue Werte springen sie nicht mehr zurück an den Anfang.
- **Kein Punkt mehr oben links im Fluss-Bild.** Die wandernden Punkte sind erst sichtbar, wenn sie auf ihrer Linie laufen.
- **Handy-Ansicht wie auf Tablet und Desktop:** Haus mittig zwischen Solar und Batterie, einzelne obere Kachel zentriert, Linien wie im Vorbild, Kacheln etwas flacher und mit mehr Abstand zum Haus.

## [3.0.7.3] - 2026-10-29

### Behoben
- **Modul 19 Hausfluss (v0.5 Build 3): Die Jetzt-Ansicht flackerte**, sobald Werte hinterlegt waren und sich änderten. Kachelgröße und Linien wurden bei jedem Neuzeichnen kurz zurückgesetzt und erst danach neu berechnet. Beides bleibt jetzt erhalten.

## [3.0.7.2] - 2026-10-29

### Geändert
- **Modul 19 Hausfluss (v0.5 Build 2): Fluss-Bild passt sich dem Bildschirm an.** Auf Tablet und Desktop richtet sich die Kachelgröße nach der Höhe unter dem Banner, sodass das ganze Bild auf den Bildschirm passt. Neue Einstellung „Größe“ (Auto, Klein, Mittel, Groß), pro Gerät gespeichert. Das Banner bleibt oben, das Haus steht mittig zwischen Solar und Batterie, einzelne obere Kacheln werden zentriert, die Linien verlaufen wie im Vorbild (gerade nach oben und unten, als S-Kurve zu den Seitenkacheln). Auf dem Handy bleibt alles wie bisher.
- **Umschalter „Jetzt | Strom“** unter dem Banner. „Strom“ ist noch ein Platzhalter, die Seiten folgen in den nächsten Builds. Ein Tipp auf das Haus öffnet „Strom“.

## [3.0.7.1] - 2026-10-29

### Behoben
- **Tablet-Modus: Display ging bei Bewegung nicht an.** Meldete der Display-Schalter (Fully „Screen“) schon „an“, obwohl Bildschirmschoner oder Dimmen das Display dunkel hielten, wurde nichts gesendet. „An“ wird jetzt bei jeder Bewegung gesendet.

## [3.0.7.0] - 2026-10-29

### Behoben
- **Auswahlfelder klappten sofort wieder zu.** Home Assistant meldet laufend neue Werte, dabei wurde die Seite neu aufgebaut und ein geöffnetes Auswahlfeld verschwand, zum Beispiel „Art“ bei den Meldern in Modul 11. Ein geöffnetes Auswahlfeld bleibt jetzt stehen, die Seite wird erst nach der Auswahl oder dem Verlassen aktualisiert. Das gilt überall, wo es Auswahlfelder gibt: Modul 1 (Raumeinstellungen, Heizerstufen), Modul 9 (Wetter-Zuordnung), Modul 11 (Melder, Lebensdauer, Prüfintervall), Solar-Prognose und die Labs mit Kalenderauswahl.
- Modulversionen: Modul 1 v1.1 Build 2, Modul 9, Modul 11 und Solar-Prognose je Build 2.

## [3.0.6.9] - 2026-10-29

### Neu
- **Modul 1 (v1.1): Optionaler Raumtemperatur-Sensor je Raum.** Der Thermostat misst am Heizkörper und liegt im Betrieb oft 1 bis 4 K über dem Raum. Mit einem zweiten Sensor im Raum zeigt die Raumkarte den Raumwert groß und den Thermostat klein, samt Hinweis wie „Thermostat 1,7 K wärmer als der Raum“. Der Bericht zeichnet zwei Linien (Raum, Thermostat).
- Unter „Verwenden für“ lässt sich je Raum einstellen, wofür der Sensor gilt: Anzeige, Aufheizzeit lernen, Taupunkt und Schimmelrisiko, Elektroheizer „warm genug“.
- Der Thermostat regelt unverändert. Fällt der Sensor aus oder meldet einen unplausiblen Wert (außerhalb −20 bis 50 °C), gilt automatisch wieder der Thermostat, die Karte weist darauf hin. °F und K werden umgerechnet.
- Gerätediagnose: Der Raumsensor erscheint als Rolle „Raumtemperatur“.

## [3.0.6.8] - 2026-10-29

### Behoben
- **„Kopieren nicht möglich“ im Sponsor-Bereich** (Schlüssel kopieren, Nachricht kopieren, Listen kopieren). Die Zwischenablage des Browsers steht nur bei einer sicheren Verbindung (https) und in manchen App-Ansichten zur Verfügung. Jetzt gibt es einen Ersatzweg, der auch bei einer http-Adresse oder in der App funktioniert. Dasselbe gilt für „Protokoll kopieren“ (Diagnose), „Link kopieren“ (Tablet-Modus) und „Liste kopieren“ (Modul 11).

## [3.0.6.7] - 2026-10-29

### Neu
- **Labs: Beispielbilder.** Die Detailseiten der Labs zeigen jetzt echte Ausschnitte aus dem Panel, damit du siehst, was dich erwartet.
- **Konzeptseiten zum Durchklicken** für die Module 5 (Lüftung), 6 (Rollläden), 7 (Wärmepumpe), 10, 12 (Pool & Sauna), 13 (Batteriespeicher) und 15 (Wartung). Sie arbeiten wie die Seite von Modul 10: Reiter mit Bild, nummerierte Pins, Fahrplan, weitere Ideen und offene Fragen. Wo es schon echte Werte gab, steht sie im Reiter „Jetzt“. Alle Beispielwerte in den Bildern sind erfunden, die Module steuern noch nichts.

## [3.0.6.6] - 2026-10-29

### Geändert
- **Versionen als Dialog.** Unter Einstellungen → System steht ganz unten die Zeile „Versionen“. Sie öffnet wie „Sichern & Wiederherstellen“ einen Dialog mit der Tabelle aller Module, dem Ablauf des Aufstiegs und den Stufen.
- **Modul 17 (Müllabfuhr) und Modul 18 (Licht)** stehen jetzt auch in der Tabelle. Labs starten bei v0.0.1 Build 1.
- **Version und Build im Modul-Icon:** Die Kachel im Banner jedes Moduls zeigt unten zum Beispiel „v1.0 · Build 1“.

## [3.0.6.5] - 2026-10-29

### Neu
- **Version und Build für jedes Modul.** Im Kopf jedes Moduls steht eine Plakette wie „v1.0 · Build 1“. Ein Tipp öffnet die Stufe des Moduls, die Stufenleiste, den nächsten Schritt und die letzten Änderungen. Die Paketversion steht klein dahinter.
- **Einstellungen → Versionen:** Tabelle aller Module mit Stufe, Version, Build und Datum. Dazu die Karte „So läuft der Aufstieg“ und die Erklärung der Stufen In Entwicklung (0.1 bis 0.4), Beta (0.5 bis 0.8), Vorabversion (0.9) und Stabil (ab 1.0).
- **Nur am Computer:** In der Modulleiste steht die Version hinter dem Modulnamen, und ein „neu“-Badge zeigt Module, die sich im letzten Update geändert haben.
- **Zählregeln:** Neue Funktion hebt die Version um 0.1 und setzt den Build auf 1. Eine Fehlerbehebung erhöht den Build um 1. Beim Aufstieg springt die Version auf den Start der nächsten Stufe, der Build beginnt wieder bei 1.

## [3.0.6.4] - 2026-10-29

### Behoben
- **Die Bilder in Modul 10 flackerten** (Reiter Ansicht, Baukasten und Handy). Home Assistant meldet laufend neue Werte, dabei wurde die Seite neu aufgebaut und die Bilder jedes Mal neu geladen. Jetzt bleiben die Bilder beim Neuaufbau stehen.

## [3.0.6.3] - 2026-10-29

### Geändert
- **Modul 10 „Garten & Bewässerung“ zeigt nur noch das Konzept zum Durchklicken.** Reiter Ansicht, Baukasten, Handy, Technik und Fahrplan mit Bildern und Text; ein Tipp auf die Zahlen im Bild erklärt die Stelle. Dazu die Hinweise „In Entwicklung“ und „Coming soon …“. Bewässern kann das Modul noch nicht. Neue Bilder (ca. 220 KB) unter frontend/img.

## [3.0.6.2] - 2026-10-29

### Neu
- **Automatische Sicherung auf einen Homeserver:** Unter „Sichern & Wiederherstellen“ lädt die Integration ihre Einstellungen auf Wunsch automatisch auf einen WebDAV-Server (Nextcloud, Synology, QNAP, FRITZ!NAS …), eine SMB-Freigabe oder in einen Ordner (zum Beispiel unter /media). Zeitpunkt: bei Änderung (mit Wartezeit, höchstens einmal pro Stunde), täglich oder sonntags. Aufbewahrung 7, 14 oder 30 Tage, ältere Dateien werden auf dem Server gelöscht. Mit „Verbindung testen“ und „Jetzt sichern“. Wählbar: Einstellungen, Räume und Heizpläne, Statistik, Grundriss-Bild. Die Datei lässt sich mit „Sicherung einlesen“ zurückspielen. Sponsor-Schlüssel, Tibber-Token und Passwörter sind nie enthalten. Für SMB lädt Home Assistant beim ersten Mal das Paket smbprotocol nach.

### Behoben
- **Einstellungen von Modul 2, 3 und 4 waren plötzlich weg.** Ein Browser, der seine Daten noch nicht vom Server geladen hatte (oder eine alte, zwischengespeicherte Version der Seite), konnte leere Standardwerte speichern und damit die vorhandenen Einstellungen überschreiben. Jetzt speichert die Seite erst, wenn die Daten geladen sind, und der Server behält fehlende Bereiche bei.
- **Gleiche Absicherung in allen Modulen:** Wallbox (Modul 8), Solar-Prognose, Wetter, Müllabfuhr und Sicherheit speichern nur noch, wenn ihr Stand vom Server geladen ist. Schlägt das Laden fehl (zum Beispiel direkt nach einem Neustart von Home Assistant), werden keine Standardwerte mehr gespeichert. Fehlende Felder einer alten Browser-Version behalten ihren Stand.
- **Automatische Sicherungen für alle Module:** Die Integration legt vor Änderungen Kopien aller ihrer Einstellungen an (sofort, wenn ein Stand plötzlich viel weniger Inhalt hat, sonst höchstens alle 6 Stunden; die 3 neuesten und die inhaltsreichste bleiben). Fehlt eine Datei beim Start oder ist sie unlesbar, wird die Kopie geladen. Unter „Sichern & Wiederherstellen“ steht neu die Liste „Automatische Sicherungen“, aus der du einen früheren Stand wiederherstellen kannst (wirkt nach Neuladen der Integration oder Neustart von Home Assistant).

## [3.0.6.1] - 2026-10-28

### Geändert
- **Modul 11:** Bei Alarm und bei Hinweisen zeigt das Banner ein Schild mit Ausrufezeichen statt des Hakens. Der Haken bleibt, wenn alles in Ordnung ist.

## [3.0.6.0] - 2026-10-28

### Neu
- **Modul 11 (Rauch- & Sicherheitsmelder) ist jetzt Beta und komplett überarbeitet:**
  - Vier Reiter: Übersicht, Grundriss, Wartung, Einstellungen.
  - **Grundriss-Baukasten:** Räume, Wände, Türen, Fenster, Treppen und Texte frei zeichnen, Melder platzieren, mehrere Etagen, Hintergrundbild möglich. Bei Alarm leuchtet der Raum.
  - **Wartung:** Einbaudatum, Lebensdauer, Prüfintervall je Melder, Batterie-Prognose, Einkaufsliste, Jahresprotokoll zum Drucken oder Speichern.
  - **Melder und Batterie in den Einstellungen:** Name, Art, Etage, Raum, Batterie-Sensor und -Typ, Testknopf, Einbau, Lebensdauer. Melder lassen sich auch von Hand hinzufügen.
  - **Abfahrt-Prüfung:** zeigt offene Fenster, Türen und Geräte, meldet beim Verlassen des Hauses, mit Anwesenheit und Frost-Hinweis. Kameras und Schlösser werden nur angezeigt.
  - **Ereignis-Zeitleiste, Ruhezeit und Erinnerung** vor Ablauf der Lebensdauer.

## [3.0.5.6] - 2026-10-28

### Neu
- **Sponsor-Hinweis:** Im Sponsor-Bereich steht jetzt, dass man sich nach dem Sponsoring kurz per E-Mail melden soll, um den Schlüssel zu bekommen. Ein Tipp auf die Adresse öffnet das Mailprogramm mit ausgefülltem Betreff. Dasselbe steht in der README.

## [3.0.5.5] - 2026-10-28
### Neu
- **Banner auch bei Lüftung (5), Rollläden (6), Wärmepumpe (7), Müllabfuhr (17) und Licht (18),** im gleichen Format wie die anderen Module.
- **Modul 17 und 18 stehen unter „Meine Module“** in den Einstellungen (mit Abzeichen „Lab“) und zählen bei „Module aktiv“ mit.
### Geändert
- **Reihenfolge:** Modulleiste und Liste in den Einstellungen sind nach Modulnummer sortiert (16, 17, 18, 19).
- **Der Banner steht in jedem Modul ganz oben,** auch wenn davor Labs-Karten oder Hinweise stehen (Modul 1 und Start ausgenommen).

## [3.0.5.4] - 2026-10-28
### Neu
- **Einheitliche Banner in allen Modulen:** Text links, rechts ein Logo-Feld mit dem Symbol des Moduls (reine Symbole, ohne Schrift), je Modul in eigener Farbe. Neu sind Banner bei Elektroauto, Garten, Pool & Sauna, Batteriespeicher, Stromtarif, Wartung und Solar-Prognose. Sicherheit, Wetter und Hausfluss haben dasselbe Format.
  - Modul 2: Der Speicher-Tank steht als eigene Kachel „Speicher“ unter dem Banner.
  - Energie und Gerätestrom: Die Ringe (Deckung, Eigenstrom) bleiben im Banner, neben dem Logo.
- **Labs:** Modul 19 „Hausfluss“ steht jetzt auch in den Labs, in einem eigenen Abschnitt „Nur für Sponsoren“ mit rosa Abzeichen. Auch in Einstellungen und Modulverwaltung steht ein Abzeichen „Nur Sponsoren“. Der Schalter öffnet ohne Schlüssel den Sponsor-Dialog.
### Verbessert
- **Scrollen auf iPad und Handy:** Beim Wischen und Ausrollen wird die Seite nicht mehr neu aufgebaut (das hielt das Ausrollen an). Die Modulleiste rastet nicht mehr ein, das ruckelte.

### Behoben
- Die Einstellungen ließen sich nicht öffnen, wenn das Lab „Tags & Karten“ an war (Fehler „Can't find variable adm“, seit 3.0.4).
- Knöpfe verlieren Tipps nicht mehr, wenn Home Assistant gerade einen Wert meldet (3.0.5.1).
- Fehlermeldung statt stiller Knöpfe, wenn eine Aktion oder das Zeichnen der Seite fehlschlägt (3.0.5.2).

## [3.0.5.3] - 2026-10-28

### Behoben
- **Einstellungen ließen sich nicht öffnen**, sobald das Lab „Tags & Karten“ eingeschaltet war (Fehler „Can't find variable adm“, seit 3.0.4). Ohne dieses Lab trat der Fehler nicht auf.

## [3.0.5.2] - 2026-10-28
### Geändert
- **Fehlersuche für Knöpfe, die nicht reagieren:** Wirft eine Aktion oder das Zeichnen der Seite einen Fehler, erscheint jetzt eine Meldung mit dem Fehlertext (und einer Zeile in der Konsole), statt dass nichts passiert.

## [3.0.5.1] - 2026-10-28

### Behoben
- **Knöpfe reagierten nicht (Einstellungen, Anpassen und weitere):** Meldet Home Assistant laufend neue Werte, wurde die Seite mitten im Tippen neu aufgebaut, und der Tipp ging verloren. Solange ein Finger oder die Maus auf einem Knopf liegt, wird die Seite jetzt nicht neu gezeichnet und erst danach aktualisiert.

## [3.0.5] - 2026-10-28
### Neu
- **Modul 19 „Hausfluss“ (Beta, dauerhaft nur für Sponsoren):** Dein Haus als Fluss-Bild im Dashboard, native Neuentwicklung nach der Karte „Energiefluss“. Das Haus sitzt in der Mitte, ringsum bis zu acht Kacheln (oben 2, links 3, rechts 3, unten 1) für Solar, Netz, Akku, Auto und Verbraucher.
  - **Flusslinien mit laufenden Punkten:** Richtung und Stärke folgen der Leistung der Kachel. Pro Kachel: Verbrauch, Erzeugung, beides oder geteilt, Leistung umkehrbar, eigene Sensoren für „zum Haus“ und „aus dem Haus“.
  - **Haus-Kachel:** Gesamtverbrauch aus Zufluss minus Abfluss oder „Rest“ (ohne Verbraucher-Kacheln), bis zu vier Chips.
  - **Bilder:** eingebaute Symbole, mdi:, Emojis, /local/ oder https. Farben, Namen und Zusatzzeilen pro Kachel.
  - **Mobil:** kleinere Kacheln mit gut lesbarer Schrift, gleiches Fluss-Bild wie am Desktop, Haus in der Mitte.
  - Nur Sensoren (`sensor.`, `number.`, `input_number.`, `counter.`) sind erlaubt. Einrichten über Modul-Verwaltung und „Einrichten“ auf der Seite. Neue Befehle `ef_get`, `ef_set`, Speicher `fenster_heizung_hausfluss`.

## [3.0.4] - 2026-10-28
### Neu
- **Lab „Tags & Karten“ (Vorabversion bis 11.11.):** RFID-Karten und NFC-Sticker lösen feste Aktionen aus. Anlernen: „Tag anlernen“ tippen, Karte an einen Leser halten (Handy mit NFC, ESPHome PN532/RC522 oder jeder Leser, der in Home Assistant Tags meldet), Aktion wählen.
  - **Feste Aktionsliste, keine freien Dienstaufrufe:** Anwesenheit (Zu Hause, Abwesend, Urlaub 1 bis 21 Tage, „Person ist zu Hause/unterwegs“), Fensterregelung und Heizplan an/aus, Warmwasser (Boost, Zirkulation, Abwesend), Elektroauto (1 Stunde, bis Ziel, mit Sonne, Stopp), Müll („Tonne ist draußen“), Licht (Gute Nacht, Ankommen, Gemütlich, Alle aus).
  - **Sicherheit:** keine Alarm- und keine Türaktionen, weil sich Karten kopieren lassen. Nur Admins richten Tags ein. Doppelte Scans innerhalb von 3 Sekunden zählen einmal.
  - **Pro Tag:** nur für bestimmte Personen (erkannt am Handy-Nutzer), Zeitfenster (auch über Mitternacht), Rückmeldung per Handy-Nachricht, Ansage oder blinkendem Licht. Protokoll der letzten 30 Scans, unbekannte Tags lassen sich zuordnen oder verwerfen.
  - „Person ist zu Hause/unterwegs“ gilt für die automatische Abwesenheit höchstens 12 Stunden.
  - Neue Befehle `tg_get`, `tg_set`, `tg_act`, neuer Speicher `fenster_heizung_tags`. Zugang über Labs → Tags verwalten und Einstellungen → Allgemein.

## [3.0.3.1] - 2026-10-28

### Behoben
- **„Sponsor anlegen“ ging nie** (Meldung „Das ging nicht“, auch Verlängern, Sperren und Entfernen): Das Feld für die Sponsor-Nummer hieß `id` und kollidierte mit der Nachrichten-Kennung von Home Assistant, die Anfrage wurde abgelehnt. Es heißt jetzt `sid`.
- **Entwickler-Zugang:** Wer den privaten Schlüssel in Home Assistant hinterlegt hat, hat jetzt automatisch alle Sponsor-Extras und sieht die Vorabversionen, ohne einen eigenen Schlüssel. Der Dialog zeigt „Entwickler-Zugang“.

## [3.0.3] - 2026-10-28
### Neu
- **Vorabversionen:** Neue Labs können ein Datum „für alle ab“ tragen. Bis dahin sehen sie nur Sponsoren mit eingeschaltetem Schalter „Vorabversionen zuerst“ (ab Werk aus), mit rosa Marke „Vorab bis TT.MM.“ und einem eigenen Abschnitt auf der Labs-Seite. Alle anderen sehen einen Hinweis mit der Zahl der Vorabversionen und „Sponsor werden“. Standard-Vorlauf: 14 Tage.
- **Modul 18 „Licht & Lampen“ (Lab, Vorabversion bis 11.11.):** Alle Lampen nach Räumen aus den Bereichen von Home Assistant, schalten, Helligkeit, Weißton und Lichtfarbe, Szenenknöpfe Gute Nacht, Ankommen und Gemütlich (mit eigenen Szenen oder Skripten verknüpfbar), „Alle aus“ mit Rückfrage, Hinweis „Licht lange an“ (1, 2 oder 4 Stunden, nicht bei aktivem Bewegungs- oder Anwesenheitssensor im Raum), Räume ausblendbar. Auch im Tablet-Modus und als Kachel auf der Startseite. Keine Automatik, geschaltet wird nur auf Fingertipp. Neuer Layout-Schlüssel `li`, Lab-Kennung `li`.
- **Lab „Spartipp der Woche“ (Vorabversion bis 11.11.):** Gerät mit dem größten Netzbezug der letzten 7 Tage (Modul 4), beste Sonnenzeit aus Modul 16 und mögliche Ersparnis pro Woche als Obergrenze. Nur Anzeige.

### Behoben
- **Solar-Prognose (Modul 16) und die Labs „Autarkie-Prognose“ und „Lernfaktor“ gingen kaputt**, sobald der Sponsor-Bereich geladen war: Der Sponsor-Code überschrieb intern die Funktion `_sp`. Seit 3.0.2.13 betroffen. Neuer Test prüft, dass kein Teil des Dashboards eine Methode überschreibt.

## [3.0.2.14] - 2026-10-28
### Geändert
- **README komplett neu:** neues Kopfbild, Sponsor-Banner ganz oben und am Ende, Kurzüberblick, einklappbare Abschnitte für Bedienung und alle Module, eigener Abschnitt „Sponsor werden“ mit Bildern und neue Häufige Fragen. Der Inhalt der Module bleibt unverändert.
- Sponsor-Dialog: Der Zugang zur Verwaltung ist jetzt ein unauffälliger Text „Entwickler-Zugang“ am Ende des Dialogs.

## [3.0.2.13] - 2026-10-28
### Neu
- **Sponsor-Bereich:** Link zu GitHub Sponsors im Kopf, als Karte auf der Startseite (60 Tage ausblendbar), als Zeile im Update-Hinweis und in den Einstellungen. Mit einem Sponsor-Schlüssel gibt es ein Abzeichen, Farbverläufe für den Kopf („Meer“, „Abend“), Uhr-Stile für den Ruhemodus („Dünn“, „Kräftig“, „Digital“) und Vorabversionen (Labs mit Kennzeichen `early`). Nichts, was bisher frei war, wird gesperrt.
  - Schlüssel mit Ed25519-Unterschrift, geprüft in `sponsor.py` ohne Server. Format `FH1-…`, mit Name, Stufe, Ablaufdatum und Nummer.
  - **Verwaltung** für den Entwickler (nur mit dem privaten Schlüssel): Sponsoren anlegen, Schlüssel kopieren, um ein Jahr verlängern, sperren, Danke-Liste kopieren, Hinweis 30 Tage vor Ablauf.
  - Sperrliste `sponsor_gesperrt.json` im Repo, wird einmal am Tag geladen.
  - Neuer Speicher `fenster_heizung_sponsor`, neue Befehle `spn_get`, `spn_redeem`, `spn_clear`, `spn_prefs`, `spn_admin_get`, `spn_admin_setup`, `spn_admin_act`.

## [3.0.2.12] - 2026-10-28
### Neu
- **Tablet-Modus:** eigene Oberfläche für Tablets mit großen Bedienflächen, unterer Knopfleiste, Größen für 8 bis 13 Zoll im Hoch- und Querformat und ausgeblendeter normaler Ansicht. Einschalten über den Knopf „Tablet-Modus“ im Kopf, den Hinweis beim ersten Öffnen oder den Direktlink `?tablet=1` (zum Beispiel als Start-URL in Fully Kiosk).
  - **PIN-Schutz** (sechs Stellen) für die Einstellungen und das Beenden, Sperre nach fünf Fehlversuchen, Zurücksetzen durch Administratoren.
  - **Ruhemodus** mit dunkler Uhr, „Zurück zu Start“ nach Inaktivität, Aufwecken per Berührung, Bewegung oder Warnung.
  - **Bewegungsmelder:** schaltet das Display über einen Schalter (Fully) oder einen Benachrichtigungsbefehl (HA-App Android) ein und nach einer Zeit ohne Bewegung wieder aus. Läuft im Home Assistant und braucht die Seite nicht.
  - Heizung mit −/+-Knöpfen pro Raum, Start mit Bubbles, Kacheln und Hinweisen.
  - Neuer Speicher `fenster_heizung_tablets`, neue Befehle `tm_get`, `tm_hello`, `tm_set`, `tm_check`, `tm_pin`, `tm_reset`, `tm_del`.

## [3.0.2.11] - 2026-10-28
### Neu
- **Startseite:** neuer Tab „Start“ (Kennung `st`) ganz links, erscheint beim Öffnen des Dashboards zuerst. Ein Direktlink mit `?modul=<Kennung>` öffnet weiter das jeweilige Modul. In den Einstellungen abschaltbar oder auf „Letztes Modul“ umstellbar.
  - Karten: Zuhause (Ampel und Modul-Kacheln), Wetter (mit Stundenwerten über `weather.get_forecasts`), Personen, Hinweise, Alarm, Energie und Müllabfuhr. Karten ohne Datenquelle erscheinen nicht.
  - **Anpassen** wie in Modul 1 und 17: Karten verschieben und ausblenden (`layout.start` mit `order` und `hidden`), gilt für alle Nutzer.
  - **Alarm** zeigt den Zustand einer `alarm_control_panel`-Entität. Schalten (Unscharf, Abwesend, Zu Hause) ist ab Werk aus, braucht den Schalter „Alarm schalten erlauben“ und wird immer bestätigt, bei Code-Anlagen mit Code. Nur Administratoren.
  - Hinweise sammeln Fenster zu lange offen, Probleme im Warmwasser, schwache Batterien, die nächste Müllabholung und einen ausgelösten Alarm.
- **Lab „Start-Bubbles“** (`sb`, Art „Nur Anzeige“, ab Werk aus): bis zu acht runde Kurzinfos oben auf der Startseite. Inhalt und Reihenfolge wählbar aus Wetter, Personen, Alarm, Solar, Batterie, E-Auto, offene Fenster, nächste Müllabfuhr, Warmwasser, Strompreis und Hinweise. Warnfarben und „Antippen öffnet Karte oder Modul“ einstellbar. Ausgeschaltet ist die Reihe weg.
### Geändert
- `api.py`: `layout.start` wird geprüft (Blöcke, Bubbles, Alarm-Entität); `LAB_IDS` um `sb` erweitert.
- README: neuer Abschnitt „Startseite“.

## [3.0.2.10] - 2026-10-28
### Neu
- **Modul 17: Müllabfuhr (Lab)** (neue Datei `muell.py`, WS-Befehle `mu_get`, `mu_set`, `mu_act`, `mu_test`), ab Werk aus und mit Bestätigung vor dem Einschalten (Art „Schaltet Geräte“):
  - Termine aus einem Kalender von Home Assistant, zum Beispiel von waste_collection_schedule. Tonnen Restmüll, Bio, Papier und Gelber Sack werden über Wörter im Titel erkannt (einstellbar).
  - Seite mit Tonnen-Ampel zum Abhaken, nächsten Abholungen, Monatskalender, Hinweisen (Verschiebung, Sturm, Frost), Erinnerung, Ansage, Licht und Kosten.
  - Erinnerung am Vorabend zur eingestellten Uhrzeit: Nachricht aufs Handy, Ansage über einen Lautsprecher und Licht in der Farbe der Tonne. Einmal pro Tag, nur für Tonnen, die noch nicht draußen stehen, mit „Später erinnern“.
  - **Anpassen** wie in Modul 1: Karten verschieben und ausblenden (`layout.mu` mit `order` und `hidden`), gilt für alle Nutzer.
  - Das Modul, die Meldungen und der Store-Eintrag „Abfallkalender“ (mit Filter „Haus“) gibt es nur, solange das Lab eingeschaltet ist.
### Geändert
- Labs-Infoseite kann einen eigenen Hinweis zum Ausschalten zeigen.
- README: neuer Abschnitt zu Modul 17.

## [3.0.2.9] - 2026-10-28
### Neu
- **Vier Labs, die Geräte schalten** (neue Datei `labs.py`, WS-Befehl `labs_get`), ab Werk aus und mit Bestätigung vor dem Einschalten:
  - **Smart Vorheizen (Modul 1):** Der Heizplan startet früher, wenn der Raum zum Schaltpunkt kälter ist als das Ziel. Vorlauf aus der gelernten Aufheizzeit, begrenzt durch „Aufheizen um“ und „Höchstens vorziehen“.
  - **Duschzeiten lernen (Modul 2):** Erkennt Entnahmen aus dem Abkühlen des Speichers, lernt typische Zeiten für Werktage und Wochenende (halbe Stunden, ab der Hälfte der Tage) und heizt nach dem Lernzeitraum vor diesen Zeiten vor. Die Daten bleiben 30 Tage gespeichert.
  - **Legionellenschutz nach Sonne (Modul 2):** Am geplanten Tag entscheidet die Prognose aus Modul 16, ob der Lauf bleibt oder auf den nächsten sonnigeren Tag rückt (höchstens die eingestellten Tage, überfällig nach 9 Tagen läuft er sofort).
  - **Ladeziel nach Kalender (Modul 8):** Ein langer Termin in den nächsten 36 Stunden hebt den Ziel-Ladestand des Ladeplans an. Es wird nur das Ziel geändert.
- Auf der Labs-Seite Filter nach Art („Nur Anzeige“, „Schaltet Geräte“), Karten im Modul mit Lernstand und Entscheidung, Einstellungen je Lab in der Infoseite.
### Geändert
- README neu geschrieben, mit eigenem Abschnitt für Labs, die Geräte schalten.

## [3.0.2.8] - 2026-10-28
### Geändert
- **Einstellungen aufgeräumt:** Die Zeilen „Store anzeigen“ und „Labs anzeigen“ sind entfallen. Symbol und Tab blendest du jetzt über den Knopf **Anzeige** auf der Store-Seite bzw. der Labs-Seite ein oder aus. Bei „Store & Integrationen“ steht kein Statusfeld („go-e verbunden“) mehr, bei „Labs“ bleibt die Anzahl eingeschalteter Labs.

## [3.0.2.7] - 2026-10-28
### Neu
- **Labs (experimentelle Funktionen):** Eigene Seite mit Karten, Schalter, Filter nach Modul und einer Infoseite je Funktion (Was du bekommst, So wird gerechnet, Voraussetzungen, Einstellungen). Erreichbar über ein **Kolben-Symbol im Kopf** (mit Zähler), einen **Tab „Labs“** in der Modul-Leiste und Einstellungen → Allgemein → „Labs“. Symbol und Tab lassen sich unter „Labs anzeigen“ einzeln ausblenden. Die Auswahl gilt für alle Nutzer.
- Eingeschaltete Labs erscheinen als Karte mit gestricheltem violettem Rand, dem Zeichen „Labs“ und dem Hinweis „Nur Anzeige“ im passenden Modul, ihre Einstellungsfelder sind violett markiert. Ausgeschaltet sind sie dort komplett weg, die Werte bleiben gespeichert. Das Modul zeigt im Kopf „n Labs aktiv“.
- **Erste Labs, alle nur Anzeige:** Bester Lüftungszeitpunkt (Modul 1, Innen- gegen Außenluft je Raum), Autarkie-Prognose (Modul 3), Wäsche-Wetter (Modul 9), Lernfaktor für die Prognose (Modul 16). „Spartipp der Woche“ ist als „Bald“ angekündigt.
- Das Backend prüft die Labs-Einstellungen (`layout.labs`: `on`, `icon`, `tab`, `cfg`).
### Geändert
- README neu geschrieben, mit Abschnitt zu Labs.

## [3.0.2.6] - 2026-10-28

### Behoben
- **Zeitfelder verschwanden beim Eingeben** (zum Beispiel „Bis“ und „Abfahrt“ in Modul 8, Register „Planung“): Home Assistant meldet laufend neue Werte, und das Dashboard baute die Seite dabei mitten im Tippen neu auf. Solange ein Zeit-, Zahlen- oder Textfeld im Fokus ist, wird die Seite jetzt nicht neu gezeichnet, nach dem Verlassen des Feldes zieht sie nach. Das gilt im ganzen Dashboard, die Suche im Store ist ausgenommen.
### Geändert
- README komplett neu geschrieben, der versehentlich gelöschte Abschnitt zu Modul 1 ist wieder da.

## [3.0.2.5] - 2026-10-28
### Neu
- **Modul 16 „Solar-Prognose“ (Vorabversion):** Ertrag heute und morgen aus Forecast.Solar (mehrere Anlagen werden addiert) oder einem eigenen Sensor mit `wh_period`, Stundenverlauf, beste Zeit für Verbraucher und Vergleich der Tagesprognose mit dem tatsächlichen Ertrag (Abweichung in Prozent). Die Prognose des Tages wird morgens festgehalten, der Verlauf bleibt 60 Tage gespeichert. Einstellungen: Quelle, Ertragssensor (Tageswert oder Gesamtzähler, Übernahme aus Modul 3). Neue Datei `solar.py`, WS-Befehle `sp_get` und `sp_set`.
- **Kennzeichnung der Module in vier Stufen:** Stabil (grün), Beta (orange), Vorabversion (blau), In Entwicklung (grau). Sichtbar im Kopfteil, am Desktop zusätzlich am Tab, dazu in der Modulliste der Einstellungen und im Hinweiskasten der Seite. Am Handy steht die Kennzeichnung nur im Kopfteil, die Tabs bleiben schmal.
### Geändert
- Modul 11 und 16 sind „Vorabversion“, Modul 8, 9 und 14 „Beta“, die übrigen Beta-Module „In Entwicklung“ (Beispielseiten), Modul 1 bis 4 „Stabil“.

## [3.0.2.4] - 2026-10-27
### Geändert
- **Zuordnung für Wetter und Warnungen** (Wetter, Wind, Außentemperatur, amtliche Warnung) und die **Auswahl der Benachrichtigungsdienste** stehen jetzt in den Einstellungen von Modul 9 (Einstellungen → Modul 9) statt im Store. Der Store zeigt nur noch die Dienste und ihre Detailseiten.

## [3.0.2.3] - 2026-10-27
### Neu
- **Intern:** Das Dashboard (`panel.js`) wird jetzt aus 14 Quelldateien in `frontend-src/parts` gebaut (`python3 frontend-src/build.py`), das Ergebnis ist byte-gleich zur bisherigen Datei. Für Nutzer ändert sich nichts.
- **Herstellerprofile für Thermostate (Modul 1):** tado°, Homematic IP, AVM FRITZ!DECT, Shelly TRV, Aqara E1 und Danfoss Ally werden automatisch erkannt. Im Store gibt es die Kategorie „Heizung“ mit Detailseiten und den Besonderheiten je Hersteller, in den Raumeinstellungen steht unter „Fenster & Thermostate“ der erkannte Hersteller mit Hinweisen. Die Regelung beachtet zwei Besonderheiten: Geräte ohne echtes Aus (Homematic IP, Shelly TRV, Danfoss Ally) gehen bei „Thermostat aus“ auf die kleinste Temperatur des Geräts, und Zeitplan-Geräte (tado°, Homematic IP, FRITZ!) schalten nach dem Lüften wieder auf Automatik, statt die alte Temperatur als manuelle Übersteuerung zu setzen. Alle anderen Geräte verhalten sich wie bisher.
- **Neuer Store für Integrationen:** Die Integrationen-Seite ist jetzt ein Store mit Suche, Kategorien (Strom & Tarife, Elektroauto, Wetter, Sicherheit), Highlight-Banner sowie den Bereichen „Verbunden“ und „Entdecken“. Tippt man eine Karte an, öffnet sich eine Detailseite mit Kurzfakten, „Was du bekommst“, „So geht es“ und Hinweisen. Erreichbar über ein **Store-Symbol im Kopf** (mit Zähler für fehlende Dienste), einen **Tab „Store“** in der Modul-Leiste und weiterhin über Einstellungen → Allgemein. Symbol und Tab lassen sich unter Einstellungen → Allgemein → „Store anzeigen“ einzeln ausblenden.
- **Einstellungen neu gegliedert:** Oben eine Übersicht (aktive Module, Räume, Personen, Version), dann **Allgemein** (Einrichtungsassistent, Integrationen, Personen & Standort, Darstellung), **Meine Module** (nur eingeschaltete, mit Status), **Weitere Module** (ausgeschaltete als kleine Felder, ein Tipp schaltet ein) und **System** (Sichern & Wiederherstellen, Diagnose, Module verwalten).
- **Modul 8, neues Aussehen:** Register-Leiste über die volle Breite (am Handy mit Icons über den Texten), Fahrzeugkarte mit größerem Titel und Schein beim Laden oder Angesteckt-Sein, vier Kacheln mit Icon neben der Fahrzeugkarte, Heute und Wallbox links, Schnellstart und Entscheidungen rechts ohne Lücken, Karten mit Icon-Titel und runderen Ecken.
- **Modul 2, neues Aussehen:** Größere Temperatur und Speicher in der Kopfkarte mit Glas-Chips und abgerundeten Aktionstasten, Kennzahlen mit Icon-Plättchen (am Handy zu zweit), Karten mit Icon-Titel, Zeitplan und Legionellenschutz links, Zirkulation und PV-Überschuss rechts ohne Lücken, am Handy in sinnvoller Reihenfolge.
- **Modul 4, neues Aussehen:** Kopfkarte mit Ring für den Eigenstrom-Anteil (Solar und Batterie) über alle Geräte, Zeitraum-Kacheln mit Icon und Farblinie (am Handy zu zweit), Gerätekarten mit Icon, Statuspunkt, dickem Quellen-Balken, drei großen Zahlen für Solar, Batterie und Netz, Feldern für Heute und Letzter Durchlauf sowie Startempfehlung als Fußstreifen, Verlauf mit Icon-Titel und abgerundeten Balken.
- **Modul 3, neues Aussehen:** Kopfkarte mit Ring für den Deckungsanteil, Kennzahlen mit Icon und Balken (selbst genutzt, Bezug, Einspeisung, Autarkie), zwei lückenlose Spalten, Karten mit Icon-Titel, hervorgehobene Bilanz, größerer Energiefluss und volle Breite für den Zeitraum-Umschalter. Am Handy stehen die Karten in sinnvoller Reihenfolge.
- **Modul 1, neues Aussehen:** Kopfkarte mit Glas-Chips, Raumkarten mit farbigem Statusstreifen und aufgeräumter Kopfzeile, Heizung und Fenster als geteilte Leiste, Anwesenheit als durchgehender Umschalter, klarere Kacheln für Luftfeuchte, Taupunkt und Schimmel. Karten einer Reihe sind gleich hoch.
- **Modul 11 „Rauch- & Sicherheitsmelder“ (Beta) ist fertig** und läuft im Hintergrund, auch bei geschlossenem Dashboard:
  - **Erkennung:** alle Melder mit Geräteklasse Rauch, CO, Gas, Wasser, Hitze oder Sicherheit, mit Raum, Batteriestand und Testknopf, egal von welchem Hersteller.
  - **Alarm:** sofortige Meldung aufs Handy, deine Aktionen (Licht, Schalter, Ventil, Rollladen, Skript, Szene) einmal ausgelöst, Erinnerung alle 10 Minuten (einstellbar), Meldung bei Ende.
  - **Batterie** (Standard unter 20 %), **Erreichbarkeit** (Standard nach 60 Minuten) und **Prüf-Erinnerung** (alle 1, 3, 6 oder 12 Monate, Knopf „Geprüft“), jeweils mit Sperrzeit gegen Dauermeldungen.
  - **Neues Aussehen:** Statusfläche (ruhig, Hinweise, Alarm), Kacheln, Melderkarten mit Statusstreifen, Prüfung und Protokoll.
  - **Integrationen:** neue Karte für Melder-Dienste mit X-Sense (über die inoffizielle Community-Integration per HACS, wird automatisch erkannt), Zigbee, Zigbee2MQTT, Homematic IP und weitere, mit Anleitung.
- **Modul 9 „Wetter & Warnungen“ (Beta) ist fertig** und läuft im Hintergrund, auch bei geschlossenem Dashboard:
  - **Neues Aussehen:** Oben ein Satz zur Lage (keine Warnung, Vorwarnung, aktiv) mit der **Windkurve der nächsten 12 Stunden** gegen die Sturmgrenze, Warnstunden getönt. Darunter **Warnstufen als Pegel** (Messwert gegen Grenze, amtliche Warnung mit Stufe 1 bis 4), **Aktionen und Erinnerungen** als Liste und ein **Protokoll** als Zeitleiste.
  - **Warnungen:** Sturm (Grenzwert 30 bis 120 km/h), Gewitter und Hagel, Frost, Hitze und Starkregen, einzeln schaltbar. Beginn nach zwei Messungen in Folge, Ende erst nach zehn Minuten unter der Grenze (mit Spielraum), damit Böen nicht ständig umschalten.
  - **Wind** aus einer Wetterstation oder aus der Wetter-Entität (Böen inklusive). Einheiten m/s, mph und Knoten werden in km/h umgerechnet.
  - **Vorwarnung** bis 12 Stunden im Voraus aus der Stundenvorhersage, Karte „Nächste Stunden“.
  - **Amtliche Warnung** von DWD, NINA und MeteoAlarm als eigene Kachel, mit Meldung aufs Handy.
  - **Aktionen** bei Warnungen: Rollläden und Markisen, Schalter, Lichter, Skripte und Szenen, einmal pro Warnung, optional mit „Danach zurück“ 15 Minuten nach Ende.
  - **Fenster-Erinnerung** für offene Fenster aus Modul 1, **Benachrichtigung** über `notify.*` (Beginn, Ende, Vorwarnung) mit Testmeldung, **Protokoll** der letzten Ereignisse.
  - Die **Einstellungen** von Modul 9 öffnest du über **Einstellungen → Modul 9** (der große Knopf auf der Seite entfällt, wie bei den anderen Modulen).
  - Neue WebSocket-Befehle `wx_get`, `wx_set` und `wx_test`.
- **Modul 1, Einstellungen neu geordnet:** Unter **Einstellungen → Modul 1** stehen vier aufklappbare Bereiche mit Kurzstatus: **Sommermodus**, **Wetterabhängige Absenkung**, **PV-Überschuss für Elektroheizer** und neu getrennt davon **Strompreis und Einspeisevergütung**. Jeder Bereich zeigt in der Zeile, was gerade eingestellt ist. Welche Bereiche offen sind, wird im Browser gemerkt. **Sichern & Wiederherstellen** und Updates haben ihren eigenen Eintrag unter Einstellungen → Allgemein, Diagnose und Einrichtungsassistent stehen dort schon als eigene Zeilen (vorher doppelt im Dialog).
- **Integrationen → Wetter und Warnungen:** Passende Dienste mit Status (DWD, NINA, MeteoAlarm, Met.no, OpenWeatherMap, Open-Meteo, AccuWeather, Pirate Weather, Tomorrow.io, Ecowitt, Netatmo, WeatherFlow Tempest) und „Einrichten“-Knopf. Eingerichtetes wird automatisch genutzt, bei mehreren Quellen gibt es eine Zuordnung für Wetter, Wind, Außentemperatur und amtliche Warnung sowie die Auswahl der Benachrichtigungsdienste.
- **Modul 8 (Beta), Register „Laden“:**
  - **Heute:** Geladene Energie, Sonnenanteil, Kosten und aktuelle Leistung mit Anteil Sonne und Netz.
  - **Schnellstart:** 1 Stunde voll, bis zum Ziel voll oder heute nur Sonne. Einmalig, ohne Modus und Planung zu ändern; endet von selbst, beim Abstecken oder mit „Stopp“.
  - **Hausanschluss-Schutz:** Die Wallbox wird gedrosselt oder pausiert, wenn Haus und Wallbox zusammen den eingestellten Höchststrom pro Phase überschreiten würden. Der Hausstrom wird aus dem Netzbezug geschätzt. Standardmäßig aus.
  - **Benachrichtigungen** über `notify.*`-Dienste: Ladung gestartet, Ziel erreicht, Ladeplan reicht nicht, Wallbox nicht erreichbar, Auto steckt lange ohne Ladung.
  - **Karten zuordnen:** Jede Karte der Wallbox lässt sich per Antippen einem Fahrzeug zuordnen. Ein Fahrzeug kann mehrere Karten haben (zum Beispiel eine pro Person), eine Karte gehört zu einem Fahrzeug. Das Fahrzeug aus den Elektroauto-Einstellungen lässt sich mit einem Tipp übernehmen.
- **Planung:** **Abfahrtszeit pro Fahrzeug** mit eigenem Ziel-Ladestand, eigener Uhrzeit und eigenen Tagen. Die gewählten Tage gelten jetzt auch in der Planung nach Preis und Sonne.
- **Ladestatistik:** Kacheln **Ø Verbrauch** (aus dem Kilometerstand) und **CO₂ gespart**, Export als **CSV**. Pro Tag werden gefahrene Kilometer mitgezählt, wenn ein Kilometerstand-Sensor eingestellt ist.
- **Modul 8 neu geordnet:**
  - Vier Register: **Laden** (nur Alltag), **Planung**, **Ladestatistik** und neu **Einstellungen**.
  - **Einstellungen** mit **Einrichtungs-Check** und sechs aufklappbaren Bereichen (Wallbox und Verbindung, Laderegelung, Fahrzeuge und Karten, Hausbatterie und Strompreis, Hausanschluss-Schutz, Benachrichtigungen). Jede Zeile zeigt den aktuellen Stand, ein „!“ markiert Bereiche, die Aufmerksamkeit brauchen. Welche Bereiche offen sind, wird im Browser gemerkt.
  - **Verbindung testen** direkt in den Einstellungen.
  - **Statusleiste** über allen Registern mit Zustand, Modus, Fahrzeug und Leistung sowie Hinweisen mit Sprung zur Lösung (keine Verbindung, von Hand umgestellt mit Restzeit, wartet auf Karte, Netz-Sensor fehlt).
  - **Standard-Abfahrt** im Register „Planung“ (vorher „Ladeplan“ unter „Laden“). Ziel, Uhrzeit und Tage sind immer sichtbar, der Schalter heißt „Spätestens mit Netzstrom nachladen“.
  - Die **Modus-Tasten** gelten für das erkannte Fahrzeug (vorher änderten sie immer den Standardmodus, obwohl der Modus des Fahrzeugs galt). Darunter steht, für wen sie gelten.
  - „Letzte Entscheidungen“ zeigt zuerst 4 Einträge.
- Neuer WebSocket-Befehl `wb_quick`, `wb_get` und `wb_set` kennen `quick`, `guard`, `notify` und `dep`.

### Behoben
- **Modul 8, Ladeplanung:** Beim Ändern der Uhrzeit (z. B. von 7 auf 5 Uhr) am Mac/Safari wurde das Zeitfeld nach jeder einzelnen Ziffer neu aufgebaut und eine unvollständige Zeit gespeichert. Jetzt wird nur eine vollständige, gültige Uhrzeit gespeichert und das Feld erst nach der Eingabe aktualisiert.
- **Sommermodus:** Die Tasten „Aus“, „Automatisch“ und „Immer an“ reagierten nicht (der Name der Aktion wurde fälschlich dem Modul Gerätestrom zugeordnet).
- **Integrationen:** Aufklappbare Bereiche („Weitere Dienste“, „Lokale Schnittstelle einschalten“) und die Auswahlfelder (Wetter, Wind, Außentemperatur, Amtliche Warnung) schlossen sich sofort wieder, weil sich die Seite automatisch neu zeichnete. Offene Bereiche bleiben jetzt offen, und eine geöffnete Auswahl wird nicht mehr unterbrochen.
- **Modul 8, Fehlerbehebung:**
  - „Heute“ zeigte zwischen 0 und 2 Uhr die Werte des Vortags (die Oberfläche rechnete mit der UTC-Zeit statt mit der Ortszeit).
  - Der Schnellstart wird beendet, wenn die Laderegelung ausgeschaltet wird, und lässt sich nur bei aktiver Regelung starten.
  - Die Messung des Hausanschluss-Schutzes veraltete nicht mehr, wenn die Regelung nicht rechnet.
  - Wird gleichzeitig eine Einstellung gespeichert und ein Schnellstart gestartet, geht die Einstellung nicht mehr verloren.
  - Die Statusleiste und der Einrichtungs-Check warnen nicht mehr kurz nach dem Einschalten, bevor die Regelung zum ersten Mal gerechnet hat.
  - Gespeicherte Benachrichtigungsdienste, die es nicht mehr gibt, bleiben sichtbar („nicht gefunden“) und lassen sich abwählen.
  - Die Planung weist darauf hin, wenn das Ziel auf einen Wochentag fällt, für den keine Abfahrt gilt.
- **Fahrzeuge & Karten:** Die Auswahl der Karten funktionierte nicht, weil sich das Dropdown beim automatischen Aktualisieren der Seite wieder schloss. Karten werden jetzt als Chips ausgewählt.

## [3.0.1] - 2026-10-27
### Neu
- **Personen & Standort** unter Einstellungen → Allgemein:
  - Standort der Personen über die Home-Assistant-Integration „Apple iCloud“ (Akku, Genauigkeit, letzte Meldung werden angezeigt).
  - Einstellungen pro Person: Name, mehrere Standortquellen, WLAN-/Router-Quelle, Zählregel für „Automatisch abwesend“, Genauigkeitsgrenze.
  - **Home-Zone per Karte** (OpenStreetMap): verschieben, zoomen, Radius 30 bis 1000 m, Übernahme der Position von Home Assistant oder einer Person.
  - Hinweise zum iPhone direkt auf der Seite.
- **Anwesenheit & Urlaub** nutzt die Zone und die Quellen: Eine Person gilt als zu Hause, wenn ihr genauer Standort in der Zone liegt oder eine Quelle „zu Hause“ meldet. Die Karte zeigt Entfernung und „x von y zu Hause“.
- Zone und Personen sind in Sichern & Wiederherstellen enthalten. Es wird kein Standortverlauf gespeichert.
- **go-e Charger direkt verbinden** unter Einstellungen → Allgemein → **Integrationen** (lokale HTTP-API v2, ohne Cloud), mit Verbindungstest.
- **Laderegelung in Modul 8** (Beta), angelehnt an evcc: Modi Aus, Sonne, Sonne + Netz und Voll, Ladestrom 6 bis 16 A, Start- und Stopp-Verzögerung, automatische Umschaltung zwischen 1 und 3 Phasen, Ladelimit, Ladeplan mit Ziel-Ladestand und Uhrzeit, Hausbatterie zuerst, Netzladen nur bei günstigem Preis und eine Liste der letzten Entscheidungen.
  - Die Regelung ist standardmäßig **aus** und stellt die Wallbox beim Ausschalten wieder auf „neutral“. Bei Eingriffen von Hand pausiert sie 30 Minuten. Es sind nur Adressen im lokalen Netz erlaubt.
  - **Fahrzeuge & Karten** (wie bei evcc): Fahrzeug wird an der RFID-Karte erkannt, die in der go-e-App hinterlegt ist. Pro Fahrzeug Modus und Ladelimit, Gastfahrzeug für unbekannte Karten, „Nur mit erkannter Karte regeln“ und Zurücksetzen nach dem Abstecken. Die Sperre selbst kommt von der Kartenpflicht in der go-e-App.
  - **Planung nach Strompreis und Sonne** (neues Register „Planung“ in Modul 8): günstigste Ladefenster bis zum Ziel-Ladestand, Strategien „Sonne zuerst, dann günstig“, „Nur Sonne“ und „Günstigster Preis“, Diagramm mit PV-Überschuss und Strompreis, Kacheln für Energie, Sonnenanteil, Kosten und Ersparnis. Der Schalter „Planung aktiv“ macht daraus eine **echte Steuerung**: Die Wallbox lädt nur in den geplanten Fenstern. Reicht die Sonne nicht, lädt der Ladeplan rechtzeitig mit Netzstrom nach.
  - **Tibber** unter Einstellungen → Integrationen → Stromtarife (Zugriffstoken, Verbindungstest, mehrere Zuhause) mit drei Varianten der Preisauflösung: Stundenmittel, Viertelstunden und Preisstufen.
  - **PV-Prognose mit Forecast.Solar:** Die Integration wird erkannt (mehrere Dachflächen werden addiert) und über `forecast_solar.get_forecast` gelesen. Ein einstellbarer Grundverbrauch wird vom Überschuss abgezogen.
  - **Ladestatistik** (neues Register in Modul 8): Balkendiagramm pro Tag, Monat oder Jahr für Energie und Kosten, aufgeteilt nach Sonne / Netz oder nach Fahrzeug, mit Kacheln und den letzten Ladevorgängen. Gerechnet wird alle 10 Sekunden aus Ladeleistung, Netzanschluss und Preis, gespeichert bis zu 800 Tage.
  - Die Modi der Laderegelung heißen jetzt **Aus, Sonne, Sonne + Netz und Voll**.

### Behoben
- **Handy-Ansicht:** Einstellungen oder Seitenleiste öffneten sich teils von selbst, zum Beispiel direkt nach dem Öffnen der Integration oder beim Wischen. Schaltflächen reagieren jetzt nur noch, wenn der Finger auch auf ihnen aufgesetzt wurde (Geisterklicks werden ignoriert), und Wischen auf der Modulleiste öffnet nicht mehr die Seitenleiste von Home Assistant.
- **Modulleiste:** Sie springt beim Aktualisieren nicht mehr an den Anfang zurück, rastet beim Wischen sauber ein und zeigt das gewählte Modul in der Mitte.
### Geändert
- Die Erkennung von Abwesenheit berücksichtigt nur Personen, die als „zählend“ markiert sind.

## [3.0.0] - 2026-10-27
Große Version: Gerätestrom als eigenes Modul, zwölf Beta-Module und eine neue Modulreihenfolge. Das Dashboard hat jetzt 16 Module.
### Neu
- **Modul 4: Gerätestrom** (kein Beta): eigener Rechenkern in „Strom & Wärme“, die separate Integration „geraetestrom“ wird nicht mehr gebraucht.
  - Bis zu 8 Geräte mit Leistungssensor, Schwelle und Endzeit. Aufteilung der Leistung auf Solar, Batterie und Netz aus den Sensoren von Modul 3, Preise aus Modul 1.
  - Kosten und Ersparnis je Lauf, Heute/Monat/Jahr/Gesamt, letzter Durchlauf, Empfehlung (Jetzt starten, Teilweise Solar, Besser warten), Verlaufsgrafik für 7 Tage, 30 Tage und 12 Monate.
  - Ereignis `geraetestrom_run_finished` und Meldung über wählbare `notify`-Dienste am Ende eines Laufs. Daten werden bis zu 800 Tage gespeichert.
- **Neue Modulreihenfolge:** 1 Fenster & Heizung, 2 Warmwasser, 3 Energie, 4 Gerätestrom, 5 bis 16 Beta-Module.
- **Zwölf Beta-Module**, standardmäßig aus und deutlich als „Beta“ gekennzeichnet. Einschalten unter Einstellungen → Module verwalten:
  - 5 Lüftung & Raumluft, 6 Rollläden & Beschattung, 7 Wärmepumpe, 8 Elektroauto & Wallbox
  - 9 **Wetter & Warnungen:** Unwetter-, Sturm- und Frostwarnung aus der Wetter-Entität
  - 10 **Garten & Bewässerung:** Regen, PV-Überschuss, Zisterne
  - 11 **Rauch- & Sicherheitsmelder:** Melder, Batteriestände und Alarme
  - 12 **Pool & Sauna:** Überschuss, Strompreis, Außentemperatur
  - 13 **Batteriespeicher-Planung:** Betriebsarten und Ladestand, mit Beispiel-Zeitplan
  - 14 **Dynamischer Stromtarif:** Stundenpreise, Preisverlauf, günstigste drei Stunden
  - 15 **Wartung & Erinnerungen:** Beispiel-Termine und -Betriebsstunden
  - 16 **Solar-Prognose:** Beispielwerte für Prognose und Ertrag
  - Was noch nicht geht, steht auf der jeweiligen Seite als „In Entwicklung“. Diese Module schalten nichts.
- **Elektroauto & Wallbox:** farbige Grafik mit Wallbox; das Ladekabel erscheint nur bei angestecktem Stecker und ist beim Laden animiert. Ladestand, Reichweite, Kilometerstand und Ladeleistung. Auswahl von Marke (Mercedes-Benz, Audi, VW, BYD, BMW, Andere), Modell, Karosserie und Farbe. Keine Markenlogos, keine Nachbildung echter Modelle.
- **README komplett neu**, neuer Werbebanner.

### Behoben
- **Einstellungsseite öffnete sich von selbst:** Beim Öffnen der Integration und beim Wechsel zwischen Modulen erschien ungewollt die Einstellungsseite. Ursache war eine gemeinsam genutzte Variable für Betriebsstatus und Seitenanzeige. Die Seite öffnet sich jetzt nur noch über den Knopf „Einstellungen“ und schließt mit „Fertig“.
### Noch nicht übernommen aus der alten Integration „geraetestrom“
- Zähler und Verlauf der alten Integration, HA-Sensoren für das Energie-Dashboard, Energiefluss-Grafik und Anordnung per Ziehen. Die Auswertung beginnt neu.
### Hinweise
- Update von 2.x ohne Änderung an bestehenden Einstellungen. Nach dem Update Home Assistant neu starten und die Seite neu laden (Strg+F5).
- Auf GitHub den Tag `v3.0.0` setzen.

## [2.9.2.5] - 2026-10-27
Die Integration heißt jetzt „Strom & Wärme“. Dazu eine zentrale Einstellungsseite, ein neuer Kopf und eine neue README.
### Neu
- **Neuer Name „Strom & Wärme“:** in HACS, Seitenleiste, Hinweisen und Dokumentation. Die Domain `fenster_heizung` bleibt gleich, bestehende Installationen laufen weiter.
- **Kopfzeile in jedem Modul:** Logo und Produktname stehen oben, darunter der Modulname. Das Logo wurde aus der Karte in Modul 1 in den Kopf verschoben.
- **Zentrale Einstellungsseite:** Der Knopf „Einstellungen“ oben rechts öffnet in jedem Modul dieselbe Seite. Sie listet alle Module mit Status, dazu Einrichtungsassistent, Darstellung, Sichern & Wiederherstellen, Diagnose und Modulverwaltung. Künftige Module erscheinen dort automatisch. Die einzelnen Knöpfe „Allgemein“, „Darstellung“ und „Einstellungen“ je Modul entfallen, „Anpassen“ bleibt in Modul 1.
- **README komplett neu**, mit Banner und aktuellen Bildern.
- Hinweis: Auf GitHub den Tag `v2.9.2.5` setzen.

## [2.9.2.4] - 2026-10-27
Modul 2: Darstellung ohne Geräte, glattere Speicher-Linien und ein Fehler beim Legionellenschutz.

### Behoben
- **Legionellenschutz ohne Erzeuger:** Er startete trotzdem jede Woche einen Lauf und meldete danach „abgebrochen“. Jetzt läuft er nur, wenn ein Wärmeerzeuger oder Heizstab gewählt ist.
- **Speicher-Diagramm:** Messwerte im Sekundentakt ließen die Linien fransig aussehen. Sie werden jetzt zu 12-Minuten-Mittelwerten zusammengefasst und weich gezeichnet, etwas dünner. Das Hover-Fenster zeigt weiter die echten Werte.
### Neu
- **Modul 2 ohne Geräte:** Fehlt der Wärmeerzeuger, die Pumpe oder der Heizstab, sagen das die Karten jetzt:
  - Warmwasser-Zeitplan: Hinweis „Noch kein Wärmeerzeuger gewählt“, der Plan ist abgedunkelt.
  - Zirkulation, Legionellenschutz, PV-Überschuss: statt unwirksamer Einstellungen ein Hinweis mit Knopf zur Auswahl.
  - „Einmal aufheizen“ und „Zirkulation 5 Min.“ sind abgedunkelt mit Grund.
  - Kacheln und Zustand nennen, was fehlt.
- Hinweis: Auf GitHub den Tag `v2.9.2.4` setzen.

## [2.9.2.3] - 2026-10-27
Fehlerbehebungen (Modul 1 und 2), eine neue Verlaufsgrafik in Modul 2 und die zweite Solaranlage in Modul 3.

### Behoben
- **Modul 1, Elektroheizer:** Wird er in den Einstellungen abgeschaltet, schaltet Modul 1 das Gerät aus und stellt die Thermostate des Raums wieder her. Vorher blieben sie aus. Auch beim Abschalten der Option „Thermostate abstellen“ kommen sie sofort zurück.
- **Modul 1, Update-Hinweis:** Maßgeblich ist jetzt die höchste Version unter allen Releases und Tags. Ein Tag wie `v2.9.2.3` wurde vorher übersehen, wenn schon ein älteres Release existierte.
- **Modul 2, Erzeuger:** Thermostat oder Wasserbereiter als Erzeuger: Zustand aus der Solltemperatur mit Hysterese, Verstellen von außen wird nach 10 Minuten korrigiert.
- **Modul 2, Sicherheit:** Meldet der obere Sensor 65 °C oder mehr, wird der Erzeuger abgeschaltet. Schutz- und PV-Temperatur höchstens 65 °C.
- **Modul 2, Aufräumen:** Wird das Modul ausgeschaltet oder ein Gerät abgewählt, schalten sich Heizstab und Pumpe, die das Modul eingeschaltet hat, wieder aus.
- **Modul 2, Anzeige:** „Legionellenschutz läuft“ im Status, die gewünschte Temperatur stimmt mit der Regelung überein, Eingabefelder mit Grenzen 55–65 und 50–65 °C.
- **Speicher-Kachel:** Fehlt ein Temperatursensor, wird er nicht mehr mit dem Wert von „Mitte“ vorgetäuscht.
### Neu
- **Modul 3, zweite Solaranlage** (zum Beispiel Balkonkraftwerk): zweiter Leistungssensor und optional zweiter Ertragszähler. Beide Anlagen werden addiert (Energiefluss, Kopfkarte, Verlauf, Tagessummen, 7 und 30 Tage, Autarkie, Kosten). Meldet eine Anlage „nicht verfügbar", zählt sie als 0 W.
  - Die Kopfkarte zeigt „davon Balkon …“, die Solar-Kachel zeigt den Anteil der zweiten Anlage.
  - Beide Anlagen lassen sich benennen (zum Beispiel „Dach“ und „Balkon“).
  - Im Tagesverlauf erscheint die zweite Anlage als dünne Linie.
  - Hinweis „… liefert nichts“, wenn eine Anlage seit 10 Minuten unter 5 W liegt, während die andere mindestens 400 W liefert.
- **Modul 2, Verlauf der letzten 24 Stunden** im Stil der Berichte aus Modul 1: Legende, gestrichelte Hilfslinien, Soll-Stufen aus dem Zeitplan, Erzeuger-Zeiten, Pumpenbalken und Hover-Anzeige.
### Hinweis
- Auf GitHub den Tag `v2.9.2.3` setzen, damit die Update-Prüfung die Version findet.

## [2.9.2.2] - 2026-10-27
Nur Fehlerbehebungen in Modul 3.

### Behoben
- **Nachts „Keine Messwerte“:** Meldet der Solar-Sensor „nicht verfügbar“ oder „unbekannt“ (Wechselrichter nachts), gilt das jetzt als 0 W. Im Tagesverlauf blieb sonst der letzte Abendwert stehen und täuschte Solarstrom über die Nacht vor.
- **Negative Solarwerte** (zum Beispiel −3 W) werden auf 0 gesetzt.
- **Sommerzeit-Umstellung:** Bei 7 und 30 Tagen, aus Leistung gerechnet, landete die letzte Stunde eines Umstelltags am Folgetag. Zuordnung und Datumsbeschriftung folgen jetzt dem lokalen Kalendertag.
- **Tagesdiagramm:** Die Achse hat höchstens fünf runde Schritte statt einer Linie pro kW.
- **Kleine kWh-Werte:** unter 10 kWh zwei Nachkommastellen (0,03 statt 0,0).
- **Netz im Energiefluss:** „Einspeisung“ erscheint erst ab 20 W, wie bei den Linien.
- **Hinweise:** Fehlt die Langzeitstatistik der gewählten Sensoren oder schlägt das Laden fehl, steht jetzt der Grund unter dem Diagramm.

## [2.9.2.1] - 2026-10-27
### Neu
- **Modul 3, Batterie-Leistung:** Neben einem Sensor mit Vorzeichen lassen sich jetzt **zwei Sensoren** wählen, einen für Laden und einen für Entladen (jeweils positive Werte, einer von beiden reicht). Gilt für Energiefluss, Kopfkarte, Verlauf und Hinweise.
### Technik
- `energy` im Backend kennt `ent.bchg`, `ent.bdis` und `bmode`. Versionsnummern mit vier Teilen (2.9.2.1) werden bei der Update-Prüfung richtig verglichen.

## [2.9.2] - 2026-10-27

### Behoben
- **Modul 3, 7 und 30 Tage:** Energiezähler in Wh (oder MWh) wurden wie kWh gerechnet, die Summen waren dadurch um den Faktor 1000 falsch. Einheiten (Wh, kWh, MWh) werden jetzt umgerechnet.
- **Diagramm „Energie pro Tag“:** Bei sehr großen Werten zeichnete die Achse tausende Linien. Die Achse hat jetzt höchstens fünf runde Schritte (1, 2, 5 × 10ⁿ) und eine feste Obergrenze.
### Neu
- Für 7 und 30 Tage lassen sich auch **Leistungssensoren** (W, kW) wählen. Die Summen werden aus den Stunden-Mittelwerten berechnet. Bleiben die Felder leer, wird aus den Sensoren für Solar und Netz oben gerechnet; ein Hinweis unter dem Diagramm zeigt das an. Fehlt jeder Sensor, steht „Sensor fehlt“ statt falscher Zahlen.

## [2.9.1] - 2026-10-27
### Neu
- **Modul 3: Energie-Übersicht** (Heizung, Strom und PV auf einer Seite): Kopfkarte mit Hausverbrauch und Solar-Anteil, Zeitraum Heute / 7 Tage / 30 Tage, Kacheln, animierter Energiefluss mit Batterie, Heizung und Warmwasser, Leistungskurve und Tagesbalken, Verteilung, Kosten und Vorteil mit den Preisen aus Modul 1, Heizungskarte (Wärme gespart, Elektroheizer, Warmwasser) und Hinweise. Einstellungen für Solar, Netz (mit Vorzeichen), Haus, Batterie und drei Energiezähler.
- **Entitäten-Auswahl mit Suche** im ganzen Dashboard (Assistent, Allgemein, Raumoptionen, Modul 2 und 3): Name, Entity-ID und aktueller Wert, Suchfeld, passende Vorschläge zuerst.
### Technik
- `set_modules` kennt `on.en` und `energy` (geprüfte Sensor-IDs, Vorzeichen). Die Einstellungen von Modul 3 liegen im Backend statt im Browser und sind in der Sicherung enthalten. Bestehende Browser-Einstellungen aus der Vorschau werden einmalig übernommen.
- Neue Prüffunktion `clean_energy` in `wasser.py`.

## [2.9.0] - 2026-10-27
### Neu
- **Module:** Das Dashboard bekommt eine Modul-Leiste und eine Modulverwaltung („+ Module“). Modul 2 und eigene Module lassen sich ein- und ausschalten, weitere Module über HACS oder die Adresse einer Moduldatei hinzufügen. Platzhalter für geplante Module. Eigene Moduldateien werden noch nicht geladen, ihre Seite ist ein Platzhalter.
- **Modul 2: Warmwasser und Zirkulation:** Speicher-Ansicht mit Verlauf, Zeitplan für Erzeuger und Pumpe (Mo–Fr / Wochenende), Zirkulation nach Zeitplan, Bei Bedarf, Intervall oder aus, Rücklauf-Grenze, Legionellenschutz mit Nachweis, Heizstab bei PV-Überschuss (Vorrang vor den Raumheizern), „Einmal aufheizen“, „Zirkulation 5 Min.“, „Abwesend“, Zustandsblock mit Hinweisen und Duschen-Schätzung. Verbrühschutz ab 65 °C.
- **Kopfkarten-Hintergründe** nach Tageszeit, Jahreszeit oder Wetter, auf Wunsch mit eigenen Fotos (höchstens 12).
- Die Sicherung enthält jetzt Kopfkarten-Hintergründe, Module und die Einstellungen von Modul 2.

### Behoben
- **Ansichts-Umschalter:** „Meine Ansicht“ und „Kompakt / Detail“ wurden seit 2.8.0 auf einen schmalen Streifen gestaucht, weil der Batterie-Balken der Ventil-Diagnose denselben Klassennamen hatte. Beide haben jetzt eigene Namen.
### Technik
- Neues Modul `wasser.py` (Rechenlogik und `WasserManager`, Takt 30 Sekunden, Speicher `fenster_heizung_wasser`). Neue WebSocket-Befehle `get_modules`, `set_modules`, `set_wasser`, `wasser_cmd` (Schreibbefehle nur für Administratoren); `get_state` liefert `modules` und `wasser` mit.
- Das Layout hat das neue Feld `hero` (`mode`, `own` mit bis zu 12 Bildern, je höchstens 300 000 Zeichen). Eigene Module: Adresse muss auf `.js` enden und mit `https://`, `/local/` oder `/hacsfiles/` beginnen.
- Das Modul schaltet nur ausgewählte Geräte und tut nichts, solange kein Speichersensor und keine Pumpe gewählt ist. Fehler beim Schalten landen im Fehlerprotokoll.

## [2.8.0] - 2026-10-27
### Neu
- **Einrichtungsassistent** in acht Schritten (Räume, Fenstermeldung, Heizung & Energie, Luftfeuchte, PV & Elektroheizer, Meldungen, Zusammenfassung). Räume werden aus den Bereichen von Home Assistant vorgeschlagen. Der Assistent startet unter Allgemein oder direkt im leeren Dashboard.
- **Gerätediagnose** unter Allgemein: Status aller Geräte und Dienste, „Zuletzt gemeldet“, Fehlerprotokoll (letzte 200 Einträge, kopierbar), Gesamtanzeige mit „Erneut prüfen“.
- **Ventil-Diagnose:** Batterie, letzte Meldung und Prüfung, ob das Ventil Befehle übernimmt („reagiert nicht“).
- **Fensterkontakt-Diagnose:** nicht erreichbar, Batterie leer oder schwach, seit Tagen unverändert (Standard 7 Tage), keine Meldung, lange offen.
- **Batterie-Quelle** wählbar: Prozent-Sensor, Binärsensor (optional umgekehrt) oder keine Überwachung, automatisch erkannt aus Gerät, Geräte-Sensoren oder Geräteklasse „Batterie“.
- **Benachrichtigung bei Geräteproblemen** über einen wählbaren Dienst, höchstens einmal pro Problem und 24 Stunden. Hinweise in den Raumkarten öffnen die Diagnose.
- **Strompreis und Einspeisevergütung** wahlweise als Festwert oder aus einer Entität (€/kWh oder ct/kWh, Rückfall auf den Festwert); Festwerte erlauben zwei Nachkommastellen, auch mit Komma.
### Geändert
- Die drei Raumluft-Kacheln „Gelüftet“, „Wand“ und „Kritisch ab“ (und Luftfeuchte, Taupunkt, Schimmel) stehen immer nebeneinander. „über 90 %“ heißt jetzt „> 90 %“.
### Technik
- Neues Modul `diag.py` mit Fehlerprotokoll, Befehlsprüfung und Problem-Benachrichtigung; neue WebSocket-Befehle `get_diag` und `clear_diag` (nur Administratoren). Das Protokoll liegt im Speicher `fenster_heizung_diag`.
- Allgemeine Einstellungen haben die neuen Schlüssel `valve` (`warn`, `days`, `notify`, `batsrc`) sowie `price_mode`, `price_sensor`, `feed_mode`, `feed_sensor` im Block `pv`. Zahlen mit Komma werden akzeptiert.
- Fehler beim Schalten von Thermostaten und Heizern, bei Benachrichtigungen und der PV-Auswertung landen zusätzlich im Protokoll.

## [2.7.0] - 2026-10-26
### Neu
- **Elektroheizer mit PV-Überschuss:** In jedem Raum kann ein Elektroheizer eingerichtet werden. Er heizt nur, wenn genug Überschuss ins Netz ginge. Der Überschuss wird nach Priorität auf mehrere Heizer verteilt.
- **Leistungsstufen** (z. B. 800, 1200, 1800 W) werden automatisch hoch- und heruntergeschaltet, je nach Überschuss. Alternativ nur die höchste Stufe. Die Raumkarte zeigt die aktuelle Stufe, die Schwellen und den freien Überschuss.
- **Klima-Geräte mit Voreinstellungen** (z. B. H1, H2, H3): Jede Stufe bekommt eine Voreinstellung. Die Zieltemperatur am Gerät wird auf Wunsch hochgesetzt und danach zurückgestellt.
- **Thermostate aus**, solange der Heizer läuft (Standard), danach mit den alten Werten wieder an.
- Einschaltverzögerung, Mindestlaufzeit, Reserve, Batterie-Schwelle und Zeitfenster. Sofort aus bei offenem Fenster oder wenn der Raum warm genug ist.
- **Heizer-Bericht** pro Raum (Tagesauswahl, Laufzeit, Energie, PV-Anteil, Vorteil in Euro, Diagramm, Ereignisse) und ein Gesamtbericht über 7 Tage.
- Neuer Block **PV-Heizer** im Dashboard (nur sichtbar, wenn ein Heizer eingeschaltet ist) und ein Chip „PV-Überschuss“ in der Kopfkarte.
- Neue Einstellungen unter **Allgemein → PV-Überschuss für Elektroheizer**.

### Behoben
- **„Jetzt prüfen“** fragt jetzt wirklich bei GitHub nach (vorher zeigte der Knopf nur den zwischengespeicherten Stand vom Start). Gibt es noch kein veröffentlichtes Release, wird der höchste Versions-Tag verwendet. Schlägt die Abfrage fehl, steht der Grund im Hinweis. Der Zwischenspeicher gilt nur noch eine Stunde.
- Raumluft-Karten ohne Sensor: Texte wie „Außenwand ca.“, „Kritisch ab“ und „über 90 %“ wurden auf schmalen Karten abgeschnitten. Die Felder brechen jetzt um, „Außenwand ca.“ heißt nur noch „Außenwand“. Geprüft bei Breiten von 320 bis 1400 Pixel mit und ohne Sensor.
### Technik
- Neue Module `pvlogic.py` (reine Rechenlogik) und `heater.py` (Heizer pro Raum, Verteilung alle 30 Sekunden). Neuer Schalter „Elektroheizer aktiv“ pro Raum mit eingeschaltetem Heizer.
- Neue Raumoptionen `htr_*`; der HA-Optionsdialog behält sie beim Speichern. Neue Layout-ID `pv`. Allgemeine Einstellungen haben den Schlüssel `pv`. Der Betriebszustands-Sensor hat das Attribut `heizer`.
- Der Heizer-Zustand (gemerkte Thermostate, Tageswerte, letzte 14 Tage) wird pro Raum gespeichert und übersteht Neustarts.
- Wird ein Raum mit laufendem Heizer entfernt, bleiben dessen Thermostate ausgeschaltet. Vorher den Heizer ausschalten.

## [2.6.1] - 2026-10-26
### Neu
- **Raumluft ohne Luftfeuchte-Sensor:** „Gelüftet vor X Std.“ mit Erinnerung (einstellbar, Standard 8 Std.), geschätzte Wandtemperatur, „kritische Feuchte“ ab der Schimmelgefahr an der Wand droht, Lüftungsempfehlung mit Countdown und ein Link zur Sensor-Auswahl.
- Der **Zeitpunkt des letzten Lüftens** wird pro Raum gespeichert und übersteht Neustarts. Fehlt er (erster Start), liest das Dashboard ihn aus dem Verlauf.

### Behoben
- Raumeinstellungen: Luftfeuchte-Sensor, Lüftungshinweise und Wetter-Anpassung wurden beim Öffnen des Dialogs nicht eingelesen. Beim Speichern ging ein gewählter Luftfeuchte-Sensor deshalb wieder verloren.
### Technik
- Neue Raumoption `air_every` (0–48 Stunden). Neue Attribute `zuletzt_gelueftet` und `lueften_nach_h` am Betriebszustands-Sensor.

## [2.6.0] - 2026-10-26
### Neu
- **Raumluft:** Luftfeuchte, Taupunkt und Schimmelrisiko pro Raum mit Lüftungsempfehlung (Dauer nach Außentemperatur) und Countdown bei offenem Fenster. Der Luftfeuchte-Sensor wird in den Raumeinstellungen gewählt.
- **Lernende Aufheizzeit** im Bericht pro Raum (Minuten pro Kelvin, getrennt nach Außentemperatur) mit Tipp für den Heizplan.
- **Wetterabhängige Absenkung:** Bei Sonne oder Milde sinkt die Zieltemperatur des Heizplans, bei Frost steigt sie. Grenzwerte einstellbar, pro Raum ausnehmbar, standardmäßig aus.
- **Sommermodus:** Heizpläne ruhen automatisch, wenn die mittlere Außentemperatur die Schwelle erreicht (oder immer, oder nie). Fenstermeldung und Erinnerungen bleiben aktiv.
- **Sichern und Wiederherstellen** aller Einstellungen als Datei, mit Zusammenfassung vor dem Einspielen.
- **Meine Ansicht:** eigene Raumauswahl, Reihenfolge und Bereiche pro Browser.
- **Update-Hinweis** im Dashboard mit „Das ist neu“ aus der GitHub-Release-Beschreibung, abschaltbar.
- Neuer Dialog **Allgemein** (Knopf oben rechts) für Sommermodus, Wetter-Anpassung, Sicherung und Updates.
### Technik
- Neues Modul `general.py` (Einstellungen, Sommermodus, Wetter-Anpassung, Update-Abfrage). Neue WebSocket-Befehle `get_general`, `set_general`, `get_update`, `get_learning`, `restore`.
- Der Regler lernt Aufheizphasen jede Minute und speichert bis zu 80 Messwerte (45 Tage).
- Neue Raumoptionen `humidity_sensor`, `air_hint`, `weather_adj`; der HA-Optionsdialog behält sie beim Speichern. Der Betriebszustands-Sensor hat die Attribute `luftfeuchte_sensor`, `lueftungshinweise`, `wetter_anpassung`.
- Der Update-Hinweis fragt `api.github.com` (höchstens alle 6 Stunden, nur wenn aktiviert).

## [2.5.1] - 2026-10-26
### Neu
- **Akzentfarbe wählbar** (8 Farben oder eigene) unter „Anpassen › Darstellung“. Sie färbt Kopfkarte, Knöpfe, Schalter, Links und Diagramme.
- **Eigene Raumfarben:** 12 Farben, eigene Farbe oder automatisch. Gilt auch im Pausen-Diagramm.
- **Optionales Raumfoto als Kartenhintergrund** (Detail- und Kompaktansicht). Das Bild wird verkleinert gespeichert, höchstens 12 Fotos.
- **Außentemperatur und Wetter in der Kopfkarte** mit Zustand, Luftfeuchte und Wind. Wetter-Entität und Außentemperatur-Sensor wählbar, abschaltbar.
- **Neue Symbolauswahl:** 39 realistisch farbige Symbole in fünf Gruppen, ohne Beschriftung (Tooltip), auch auf den Raumkarten und in der Kompaktliste. Die automatische Zuordnung nach Raumname erkennt mehr Begriffe.
### Geändert
- Dialog „Symbol wählen“ heißt jetzt „Raum anpassen“ (Symbol, Farbe, Foto) und bleibt nach der Auswahl offen.
### Technik
- `set_layout` speichert zusätzlich `accent`, `colors`, `photos` und `wx`. Das Backend prüft Farben (`#rrggbb`), Foto-Format (JPEG/PNG/WebP als Data-URL, höchstens 150.000 Zeichen) und Entitäten (`weather.*`, `sensor.*`). Die Liste der erlaubten Symbole wurde auf 39 erweitert.

## [2.5.0] - 2026-10-26
### Neu
- **Wochenansicht im Heizplan-Editor.** Alle sieben Tage erscheinen als Balken untereinander; der gerade bearbeitete Tag ist hervorgehoben, die anderen sind abgedunkelt. Ein Tipp auf einen Balken wählt den Tag.
- **Kompakt / Detail.** Ein Umschalter im Raumbereich wechselt zwischen Raumkarten und einer Listenansicht mit einer Zeile pro Raum (praktisch bei vielen Räumen auf dem Tablet). Die Auswahl wird pro Browser gemerkt.
- **Raumeinstellungen im Dashboard.** Das Zahnrad am Raum öffnet einen Dialog mit den Abschnitten Geräte, Regelung, Bedingungen, Erinnerung und Energie. Eingaben werden geprüft und gespeichert; der Raum lädt danach neu. „Raum hinzufügen“ und „Raum entfernen“ führen zur Integrationsseite von Home Assistant.
### Technik
- Neue WebSocket-Befehle `fenster_heizung/get_options` und `fenster_heizung/set_options` (nur Administratoren) mit Prüfung in `options.py`.

## [2.4.0] - 2026-10-26
### Neu
- **Bericht pro Raum.** Auf jeder Raumkarte öffnet „Bericht“ einen Tagesbericht mit 7-Tage-Leiste, Kacheln (Ø Temperatur, Pausenzeit mit Energie, Fensteröffnungen), Verlaufsdiagramm (Temperatur, Ziel des Thermostats, Pausenzeiten, Fenster-Markierungen, Tooltip beim Darüberfahren), Balken „Heizung aktiv / pausiert wegen Fenster“ und Ereignisliste. Die Daten stammen aus dem Verlauf von Home Assistant; für volle 7 Tage muss der Recorder mindestens so lange aufbewahren (Standard: 10 Tage).
- **Brennstoff wählbar:** Erdgas (m³, 10 kWh), Heizöl (l, 10 kWh), Flüssiggas (l, 6,6 kWh), Pellets (kg, 4,8 kWh) oder Wärmepumpe/Strom (kWh, mit JAZ/COP). „Energie pro Einheit (kWh)“ ersetzt „Energie pro m³ Gas“ und ist je Brennstoff vorbelegt. Beschriftungen, Einheiten und der Hinweistext im Dashboard folgen dem Brennstoff; bei gemischten Brennstoffen wird die Ersparnis in kWh Heizenergie gezeigt.
- **Gruppen und Zonen:** Räume lassen sich zu Gruppen (z. B. Obergeschoss) zusammenfassen – mit Kopfzeile, gemeinsamer Fensterregelung, Ein-/Ausklappen sowie Bearbeiten-Dialog (Name, Symbol, Räume, Reihenfolge).
### Hinweise
- Der bisherige Wert „Energie pro m³ Gas“ bleibt für Erdgas erhalten. Das Attribut `gespartes_gas_m3` gibt es weiterhin (nur bei Erdgas); neu sind `gespart_menge`, `einheit` und `brennstoff`.

## [2.2.3] - 2026-10-26
### Geändert
- **„Urlaub planen“ und „Einstellungen“ sind getrennt.** In der Karte „Anwesenheit & Urlaub“ gibt es jetzt zwei Knöpfe mit je eigenem Dialog:
  - **Urlaub planen:** nur Von, Bis und Vorheizen am Rückkehrtag.
  - **Einstellungen:** Absenktemperatur für Abwesenheit und Urlaub sowie die automatische Erkennung (Personen, Wartezeit). Speichern ändert den aktuellen Modus nicht.

## [2.2.2] - 2026-10-26
### Geändert
- **Neuer Kopf im Stil der übrigen Module:** Titel „Modul 1 – Fenster & Heizung“ ohne durchgehenden Balken, direkt auf dem Seitenhintergrund und bündig mit der Kopfkarte (wie Modul 3), darunter klein „Smarte Fenster- und Heizungssteuerung · Version x.y.z“. Die Versionsnummer wird aus der installierten Integration gelesen und passt sich bei jedem Update an. Auf schmalen Handys steht nur die Version unter dem Titel.
- **Logo** (MADDOG3010) als rundes Abzeichen unten rechts in der Kopfkarte. Die Grafik liegt unter `frontend/logo.png` und kann dort ausgetauscht werden.

## [2.2.1] - 2026-10-26
### Neu
- **„Warum?“ auf jeder Raumkarte.** Der Knopf neben dem Status öffnet eine Liste mit den Gründen für den aktuellen Zustand, zum Beispiel:
  - welches Fenster seit wann offen ist
  - ob die Verzögerung erreicht ist und seit wann die Heizung pausiert, sonst in wie vielen Minuten sie pausiert
  - ob Sperrzeit oder Außentemperatur das Pausieren verhindern, mit der aktuellen Außentemperatur und der Schwelle
  - ob der Schalter „Fensterregelung“ aus ist oder die Thermostate ausgeschaltet sind
  - Abwesenheit oder Urlaub und der aktuelle Heizplan mit der nächsten Änderung
- Die Liste aktualisiert sich bei geöffnetem Dialog von selbst.
- Neues Attribut `grund` am Sensor „Betriebszustand“ (wird nicht in der Datenbank aufgezeichnet), damit die Gründe auch in Automationen und Karten verwendet werden können.

## [2.2.0] - 2026-10-25
### Neu
- **Anwesenheit und Urlaub** für alle Räume, mit den Zuständen „Zu Hause“, „Abwesend“ und „Urlaub“ in einer neuen Karte im Dashboard.
- Bei „Abwesend“ und „Urlaub“ werden die Thermostate im Modus `heat` oder `auto` auf die Absenktemperatur gestellt. Ausgeschaltete Thermostate werden nicht eingeschaltet. Der Heizplan ruht in dieser Zeit.
- **Rückkehr:** Mit aktivem Heizplan gilt sofort wieder die Plantemperatur. Ohne Heizplan werden die vorherigen Solltemperaturen wiederhergestellt.
- **Urlaub planen:** Von und Bis, Absenktemperatur und optional das Vorheizen am Bis-Tag. Der Urlaub beginnt um 0 Uhr des Von-Tags. Mit Vorheizen gilt am Bis-Tag ab der eingestellten Uhrzeit wieder der Heizplan, ohne Vorheizen ab dem Tag danach. Danach springt der Zustand von selbst auf „Zu Hause“.
- **Automatisch abwesend:** Sind alle gewählten Personen (oder alle `person`-Entitäten) für die eingestellte Zeit unterwegs (15 bis 120 Minuten), wird „Abwesend“ gesetzt. Kommt eine Person nach Hause, geht es zurück auf „Zu Hause“. Ein von Hand gesetztes „Abwesend“ bleibt bestehen.
- Die Fensterregelung arbeitet weiter: Nach einer Fensterpause bleibt die Absenkung erhalten.
- Die Absenkung übersteht einen Neustart von Home Assistant.
- Raumkarten zeigen bei Abwesenheit oder Urlaub den Hinweis „Absenkung auf X °C, der Heizplan ruht“.
- Neuer WebSocket-Befehl `fenster_heizung/set_presence` (nur Administratoren), `get_state` liefert jetzt auch `presence`.
- Das Dashboard bekommt dafür den verschiebbaren Bereich „Anwesenheit“.

### Hinweis
- Ändern kann die Anwesenheit nur ein Administrator.

## [2.1.0] - 2026-10-25
### Neu
- **Der Heizplan kann ausgeschaltete Thermostate einschalten.** Im Plan-Editor wählst du „Nein“, „Heizen“ (heat) oder „Automatik“ (auto). Unterstützt ein Thermostat den gewählten Modus nicht, wird der andere Heizmodus genommen. Thermostate in anderen Modi, zum Beispiel cool, bleiben unberührt. Ist der eigene Heizungs-Sensor auf „Heizung aus“, ruht der Plan weiterhin.
- Tage im Heizplan bequemer wählen: Pro Schaltpunkt lassen sich mehrere Tage antippen, dazu gibt es die Kürzel „Mo–Fr“, „Sa–So“ und „Alle Tage“ sowie „Kopie“ zum Duplizieren eines Schaltpunkts.
- Die Beschriftung im Editor ist klarer: „Gilt an (mehrere Tage möglich)“ bei jedem Schaltpunkt und „Vorschau für Tag“ bei der Tagesvorschau.
- Neues Attribut `mode` im Heizplan (WebSocket `set_plan` und `get_state`).

### Hinweis
- Standard für bestehende und neue Pläne ist „Heizen“. Wer das nicht möchte, stellt im Editor „Nein“ ein.

## [2.0.1] - 2026-10-25

### Behoben
- Der Schalter „Heizplan aktiv“ sprang beim Einschalten ohne Meldung wieder aus, wenn noch kein Schaltpunkt eingerichtet war. Jetzt erscheint der Hinweis „Noch kein Heizplan eingerichtet“.

## [2.0.0] - 2026-10-24
### Neu
- **Heizplan** pro Raum: Schaltpunkte mit Tagen, Uhrzeit und Temperatur (5 bis 30 °C in 0,5-Grad-Schritten). Zu jedem Schaltpunkt werden die Thermostate im Modus `heat` oder `auto` auf die Zieltemperatur gestellt. Manuelle Änderungen bleiben bis zum nächsten Schaltpunkt bestehen.
- Der Heizplan arbeitet mit der Fensterregelung zusammen: Während eine Pause läuft, wird nichts gesetzt. Nach dem Schließen gilt die Temperatur, die laut Plan dann dran ist. Bei „Heizung aus“ (eigener Heizungs-Sensor) ruht der Plan.
- Heizplan im Dashboard bearbeiten: Tagesbalken mit Temperaturfarben, Vorschau je Wochentag, Schaltpunkte hinzufügen und löschen, Standardvorlage.
- Neue Entitäten pro Raum: Schalter **Heizplan aktiv** und Sensor **Heizplan Solltemperatur** (Attribute: `naechste_aenderung`, `naechste_temperatur`).
- **Dashboard anpassen** (nur Administratoren): Bereiche und Raumkarten per Ziehen verschieben, Anordnung wird für alle gespeichert.
- **Raumsymbole** aus 16 Symbolen wählbar.
- Neue Kopfzeile mit Logo und dem Namen „Fenster & Heizung“.
- Neue WebSocket-Befehle für das Dashboard: `fenster_heizung/get_state`, `set_layout` und `set_plan` (die beiden letzten nur für Administratoren).

### Hinweis
- Die Integration hängt zusätzlich von der Komponente `websocket_api` ab (bei jeder Installation vorhanden).
- Der Schalter „Fensterregelung aktiv“ hat jetzt das Attribut `funktion`, damit das Dashboard ihn vom Heizplan-Schalter unterscheiden kann.

## [1.5.2] - 2026-10-24

### Behoben
- Dashboard auf dem iPhone: Über der Titelzeile stand ein großer leerer Streifen, weil der Abstand zur Statusleiste doppelt gerechnet wurde.
- Dashboard auf dem Handy: Die Illustration überdeckte die Chips in der Kopfkarte. Sie ist jetzt kleiner und bleibt oben rechts.
- „0 von 1 Räumen“ heißt jetzt „0 von 1 Raum“.
- Ohne Pausen zeigt das Diagramm den Hinweis „Noch keine Pausen in den letzten 14 Tagen“.

## [1.5.1] - 2026-10-24

### Behoben
- Dashboard: Die Illustration in der Kopfkarte wurde auf dem Desktop unten abgeschnitten und bleibt jetzt immer vollständig sichtbar.
- Dashboard: Das Diagramm „Pausenzeit pro Tag“ wird in seiner echten Breite gezeichnet. Auf dem Desktop war die Schrift zu groß, auf dem Handy zu klein. Auf schmalen Bildschirmen steht die Beschriftung der Tage seltener, damit nichts überlappt.

## [1.5.0] - 2026-10-24
### Neu
- **Eigenes Dashboard** als Eintrag „Fenster & Heizung“ in der Seitenleiste. Es füllt sich automatisch mit allen eingerichteten Räumen, ohne Konfiguration und ohne Erweiterungen aus HACS.
- Kopfkarte mit Illustration und dem heute gesparten Gas, Kacheln für Heute, Monat, Jahr und Gesamt.
- Balkendiagramm der Pausenzeit der letzten 14 Tage, nach Räumen gestapelt.
- Raumkarten mit Raumsymbol, Status, Schalter „Fensterregelung“, Fenster- und Heizungskachel, Pausenzeit heute und 7-Tage-Verlauf.
- Hell und Dunkel folgen dem Design von Home Assistant; die Ansicht passt sich Handy, Tablet und Desktop an.
- Neue Attribute für das Dashboard: `zeitraum` und `verlauf` an den Pausen-Sensoren, `fenster` am Betriebszustand. Das Attribut `verlauf` wird nicht in der Datenbank aufgezeichnet.

### Hinweis
- Die Integration hängt jetzt von den Home-Assistant-Komponenten `frontend`, `http` und `panel_custom` ab (sind bei jeder Installation vorhanden).
- Der Seitenleisten-Eintrag verschwindet, sobald der letzte Raum entfernt wird.

## [1.4.2.2] - 2026-10-24
### Geändert
- Das Feld für die feste Gasleistung heißt jetzt „Feste Gasleistung des Raums (kW, nur ohne Raumfläche)“. Die Beschreibung erklärt, dass es nur gilt, wenn die Raumfläche 0 ist, und für ältere Tage vor Version 1.4.2.

## [1.4.2.1] - 2026-10-24
### Neu
- **Eigener Nachrichtentext** für die Erinnerung bei langem Lüften, wie das Feld „Nachricht“ bei den Aktionen in den Entwicklerwerkzeugen (mehrzeilig möglich).
- **Optionaler Titel** der Benachrichtigung.
- Platzhalter in Text und Titel: `{raum}`, `{minuten}` und `{fenster}` (Namen der offenen Fenster). Unbekannte Platzhalter bleiben unverändert stehen.

### Geändert
- Ohne eigenen Text gilt wie bisher: „Fenster in {raum} ist seit {minuten} Minuten offen.“

## [1.4.2] - 2026-10-24
### Neu
- **Genauere Raumberechnung** für das gesparte Gas: Mit Angabe von Raumfläche (m²), spezifischer Heizlast (W/m²) und Auslegungs-Außentemperatur wird die Heizleistung aus der Außentemperatur berechnet und während der Pause minütlich aufsummiert. Bei warmem Wetter sinkt die Ersparnis entsprechend. Ohne Außentemperatursensor wird pauschal mit halber Auslegungsleistung gerechnet.
- Neues Attribut am Sensor „heute“: `aktuelle_leistung_kw` und `berechnung`.
- **Benachrichtigungs-Aktionen per Auswahlmenü**: Die verfügbaren notify-Aktionen stehen wie in den Entwicklerwerkzeugen zur Auswahl (mehrere möglich, Suche und eigene Eingabe erlaubt).

### Geändert
- Ist die Raumfläche 0 (Standard), gilt weiterhin die feste Leistung in kW wie bisher.
- Ältere Einträge mit Komma-Text bei den Benachrichtigungsdiensten werden automatisch in die Auswahl übernommen.

## [1.4.1] - 2026-10-24
### Geändert
- „Energie pro m³ Gas“ lässt sich jetzt von 1 bis 40 kWh/m³ einstellen (bisher 5 bis 15), damit auch Flüssiggas (Propan, etwa 26 kWh/m³) möglich ist.

## [1.4.0] - 2026-10-24
### Neu
- Neue Sensoren pro Raum: **Heizung pausiert im Monat**, **im Jahr** und **gesamt** (Minuten), zusätzlich zu „heute“.
- Alle vier Pausen-Sensoren zeigen das grob geschätzte gesparte Gas als Attribute `gespartes_gas_m3` und `gespartes_gas_kwh`.
- Neue Einstellungen: **Gasleistung des Raums (kW)** und **Energie pro m³ Gas (kWh/m³)** für die Schätzung.
- Der Verlauf der letzten 400 Tage wird gespeichert; Pausen über Mitternacht werden auf beide Tage aufgeteilt.

### Hinweis
- Monat und Jahr beginnen mit dem Update bei 0. Bereits gespeicherte Daten bleiben erhalten.

## [1.3.0] - 2026-10-24
### Neu
- **Eigener Heizungs-Sensor** wählbar (climate, Schalter, Eingabe-Schalter, Binärsensor, Sensor, Auswahl). Hat er einen der eingestellten Zustände für „Heizung aus“, wird nicht geregelt und nur die Fenstermeldung bleibt aktiv.
- Neues Attribut `heizung_quelle` am Betriebszustand.
- Endet die Heizung während einer Pause, wird die Pause beendet, ohne die Thermostate zurückzustellen.

## [1.2.0] - 2026-10-24
### Neu
- Sensor **Heizung pausiert heute** (Minuten, Anzahl der Pausen, Beginn einer laufenden Pause).
- Sensor **Betriebszustand**: Regelung aktiv, Heizung pausiert, Heizung aus (nur Fenstermeldung) oder Regelung deaktiviert.

### Geändert
- Geregelt werden nur noch Thermostate im Modus `heat` oder `auto`. Alle anderen Modi bleiben unberührt.
- Das Speicherformat wurde erweitert; Daten aus 1.1.x werden übernommen.

## [1.1.2] - 2026-10-24
### Neu
- Icon für die Integration im Ordner `brand` (`icon.png`, `icon@2x.png`), angezeigt ab Home Assistant 2026.3.
- Repository-Struktur für HACS mit `hacs.json`, README und automatischer Prüfung.

## [1.1.1] - 2026-10-24
### Neu
- Mehrere Benachrichtigungsdienste möglich, getrennt durch Komma. Schlägt einer fehl, werden die anderen trotzdem versendet.

## [1.1.0] - 2026-10-24
### Neu
- **Sperrzeit** (von/bis, auch über Mitternacht): In dieser Zeit wird nichts abgeschaltet. Bei offenem Fenster wird alle 5 Minuten erneut geprüft.
- **Außentemperatur-Bedingung**: Optionaler Sensor und Schwelle, geregelt wird nur bei kälterem Wetter.
- **Erinnerung bei langem Lüften** über einen Benachrichtigungsdienst, einmal pro Öffnen.
- Optionale Felder lassen sich in den Einstellungen wieder leeren.

## [1.0.0] - 2026-10-24
### Erste Version
- Einrichtung pro Raum über das Menü: Fenstersensoren und Heizungsthermostate frei wählbar.
- Verzögerung nach Öffnen und nach Schließen.
- Aktion bei offenem Fenster: Thermostat ausschalten oder auf Absenktemperatur stellen.
- Zurückstellen von Modus und Solltemperatur nach dem Schließen. Der gemerkte Zustand überlebt einen Neustart.
- Schalter „Fensterregelung aktiv“ pro Raum.
- Deutsche und englische Oberfläche.

[2.2.1]: https://github.com/Maddog3010/ha-fenster-heizung/releases/tag/v2.2.1
[2.2.0]: https://github.com/Maddog3010/ha-fenster-heizung/releases/tag/v2.2.0
[2.1.0]: https://github.com/Maddog3010/ha-fenster-heizung/releases/tag/v2.1.0
[2.0.1]: https://github.com/Maddog3010/ha-fenster-heizung/releases/tag/v2.0.1
[2.0.0]: https://github.com/Maddog3010/ha-fenster-heizung/releases/tag/v2.0.0
[1.5.2]: https://github.com/Maddog3010/ha-fenster-heizung/releases/tag/v1.5.2
[1.5.1]: https://github.com/Maddog3010/ha-fenster-heizung/releases/tag/v1.5.1
[1.5.0]: https://github.com/Maddog3010/ha-fenster-heizung/releases/tag/v1.5.0
[1.4.2.2]: https://github.com/Maddog3010/ha-fenster-heizung/releases/tag/v1.4.2.2
[1.4.2.1]: https://github.com/Maddog3010/ha-fenster-heizung/releases/tag/v1.4.2.1
[1.4.2]: https://github.com/Maddog3010/ha-fenster-heizung/releases/tag/v1.4.2
[1.4.1]: https://github.com/Maddog3010/ha-fenster-heizung/releases/tag/v1.4.1
[1.4.0]: https://github.com/Maddog3010/ha-fenster-heizung/releases/tag/v1.4.0
[1.3.0]: https://github.com/Maddog3010/ha-fenster-heizung/releases/tag/v1.3.0
[1.2.0]: https://github.com/Maddog3010/ha-fenster-heizung/releases/tag/v1.2.0
[1.1.2]: https://github.com/Maddog3010/ha-fenster-heizung/releases/tag/v1.1.2
[1.1.1]: https://github.com/Maddog3010/ha-fenster-heizung/releases/tag/v1.1.1
[1.1.0]: https://github.com/Maddog3010/ha-fenster-heizung/releases/tag/v1.1.0
[1.0.0]: https://github.com/Maddog3010/ha-fenster-heizung/releases/tag/v1.0.0
