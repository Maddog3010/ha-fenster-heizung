<img src="custom_components/fenster_heizung/brand/icon.png" width="96" alt="Fenster &amp; Heizung">

# Fenster & Heizung

Home-Assistant-Integration (HACS): Pausiert Heizungsthermostate, solange Fenster offen sind, führt einen Heizplan aus, kennt Anwesenheit und Urlaub und bringt ein eigenes Dashboard mit Tagesberichten pro Raum mit. Aktuelle Version: **2.4.0**.

## Inhalt
- [Dashboard](#dashboard)
- [Räume und Gruppen](#räume-und-gruppen)
- [Bericht pro Raum](#bericht-pro-raum)
- [Heizplan](#heizplan)
- [„Warum?“ pro Raum](#warum-pro-raum)
- [Anwesenheit und Urlaub](#anwesenheit-und-urlaub)
- [Brennstoff und Ersparnis](#brennstoff-und-ersparnis)
- [Einrichtung und Einstellungen](#einrichtung-und-einstellungen)
- [Entitäten](#entitäten)
- [Installation über HACS](#installation-über-hacs)
- [Update und Hinweise](#update-und-hinweise)
- [Neue Version veröffentlichen](#neue-version-veröffentlichen)

## Dashboard
Die Integration legt den Eintrag „Fenster & Heizung“ in der Seitenleiste an. Das Dashboard füllt sich automatisch mit allen eingerichteten Räumen. Oben steht der Titel „Modul 1 – Fenster & Heizung“ mit der installierten Versionsnummer; in der Kopfkarte sitzt das MADDOG3010-Logo (`frontend/logo.png`, austauschbar).

<img src="docs/vorschau_handy_dunkel.png" width="240" alt="Dashboard auf dem Handy, dunkel"> <img src="docs/vorschau_handy_hell.png" width="240" alt="Dashboard auf dem Handy, hell">

![Dashboard auf dem Desktop](docs/vorschau_desktop.png)

- Kopfkarte mit der heute gesparten Menge (je nach Brennstoff) und Kacheln für Heute, Monat, Jahr und Gesamt
- Balkendiagramm der Pausenzeit der letzten 14 Tage, nach Räumen gestapelt
- Raumkarten mit Status, Fenster, Heizung, Heizplan und 7-Tage-Verlauf
- Karte „Anwesenheit & Urlaub“
- Hell und Dunkel folgen dem Design von Home Assistant, das Layout passt sich Handy und Desktop an

### Anpassen (nur Administratoren)
Mit dem Stift oben rechts lassen sich die Bereiche und die Raumkarten an den Griffen verschieben. Ein Tipp auf das Raumsymbol öffnet die Auswahl mit 16 Symbolen. Die Anordnung wird gespeichert und gilt für alle Nutzer.

<img src="docs/vorschau_verschieben.png" width="240" alt="Verschieben"> <img src="docs/vorschau_symbole.png" width="240" alt="Symbolauswahl">

## Räume und Gruppen
Räume lassen sich zu Gruppen (Zonen) zusammenfassen, zum Beispiel „Obergeschoss“ und „Erdgeschoss“.

![Gruppen im Dashboard](docs/vorschau_gruppen.png)

- Jede Gruppe hat eine Kopfzeile mit Symbol, Name, Zusammenfassung (Anzahl Räume, pausierte Räume, Pausenzeit, gesparte Menge) und einem gemeinsamen Schalter für die Fensterregelung aller Räume der Gruppe.
- Mit dem Pfeil klappst du eine Gruppe ein. Dann bleiben nur kleine Chips mit Raumname und Temperatur sichtbar. Der Zustand wird pro Browser gemerkt.
- Im Anpassen-Modus legst du Gruppen an, benennst sie, wählst eines von fünf Symbolen und die Räume. Ein Raum gehört immer nur zu einer Gruppe, nicht zugeordnete Räume erscheinen unter „Weitere Räume“. Die Reihenfolge der Gruppen änderst du mit den Pfeiltasten.
- Höchstens 12 Gruppen. Gespeichert wird für alle Nutzer gemeinsam.

<img src="docs/vorschau_gruppe_bearbeiten.png" width="480" alt="Gruppe bearbeiten">

## Bericht pro Raum
Der Knopf „Bericht“ auf jeder Raumkarte öffnet einen Tagesbericht.

<img src="docs/vorschau_bericht_handy.png" width="240" alt="Bericht auf dem Handy"> <img src="docs/vorschau_bericht.png" width="480" alt="Bericht auf dem Desktop">

- 7-Tage-Leiste zum Umschalten des Tages (heute ist markiert)
- Kacheln: Ø Temperatur mit Minimum und Maximum, Pausenzeit mit eingesparter Energie, Anzahl und Dauer der Fensteröffnungen
- Verlaufsdiagramm: Temperatur, Ziel des Thermostats (gestrichelt), Pausenzeiten als Band, Fenster-Markierungen; beim Darüberfahren oder Tippen erscheint ein Tooltip mit Uhrzeit, Temperatur, Ziel und Fensterstatus
- Balken „Heizung aktiv / pausiert wegen Fenster“ über den Tag
- Ereignisliste: Solltemperatur-Änderungen, Fenster geöffnet/geschlossen, Heizung pausiert/fortgesetzt

Die Daten stammen aus dem Verlauf von Home Assistant (Thermostate, Fenstersensoren und Betriebszustand). Für volle 7 Tage muss der Recorder mindestens so lange aufbewahren (Standard: 10 Tage). Ältere Tage zeigen eine Meldung statt Daten.

## Heizplan
Pro Raum gibt es einen Heizplan aus Schaltpunkten: Tage, Uhrzeit und Temperatur. Bearbeitet wird er im Dashboard über den Stift am Raum (nur Administratoren).

<img src="docs/vorschau_heizplan.png" width="240" alt="Heizplan bearbeiten">

- Pro Schaltpunkt wählst du mehrere Tage, die Uhrzeit und die Temperatur. Kürzel: „Mo–Fr“, „Sa–So“, „Alle Tage“.
- Zu jedem Schaltpunkt wird die Zieltemperatur an die Thermostate gesendet. Ausgeschaltete Thermostate schaltet der Plan je nach Einstellung ein: „Nein“, „Heizen“ oder „Automatik“. Andere Modi (z. B. cool) bleiben unberührt.
- Dazwischen bleibt eine manuelle Änderung bis zum nächsten Schaltpunkt bestehen.
- Während ein Fenster die Heizung pausiert, greift der Plan nicht. Nach dem Schließen gilt die Temperatur, die dann laut Plan dran ist.
- Steht der eigene Heizungs-Sensor auf „Heizung aus“, wird der Plan nicht ausgeführt.
- Der Schalter „Heizplan aktiv“ und der Sensor „Heizplan Solltemperatur“ (mit nächster Änderung als Attribut) lassen sich in Automationen verwenden.

## „Warum?“ pro Raum
Der Knopf „Warum?“ auf jeder Raumkarte erklärt den aktuellen Zustand: welches Fenster seit wann offen ist, ob die Verzögerung erreicht ist und wann die Heizung pausiert, Sperrzeit, Außentemperatur, Heizplan und Abwesenheit.

<img src="docs/vorschau_warum.png" width="480" alt="Warum-Anzeige">

## Anwesenheit und Urlaub
Eine Karte im Dashboard stellt alle Räume gemeinsam um: **Zu Hause**, **Abwesend** oder **Urlaub**. Zwei getrennte Knöpfe öffnen je einen Dialog:

- **Urlaub planen:** Von, Bis und Vorheizen am Rückkehrtag. Danach schaltet der Zustand von selbst auf „Zu Hause“.
- **Einstellungen:** Absenktemperatur für Abwesenheit und Urlaub sowie die automatische Erkennung (Personen, Wartezeit). Speichern ändert den aktuellen Modus nicht.

<img src="docs/vorschau_anwesenheit.png" width="480" alt="Anwesenheit und Urlaub"> <img src="docs/vorschau_urlaub_planen.png" width="240" alt="Urlaub planen"> <img src="docs/vorschau_einstellungen.png" width="240" alt="Einstellungen">

- Bei Abwesenheit und Urlaub werden Thermostate im Modus `heat` oder `auto` auf die Absenktemperatur gestellt, der Heizplan ruht.
- Bei der Rückkehr gilt wieder der Heizplan, ohne Plan werden die vorherigen Temperaturen wiederhergestellt.
- Automatisch abwesend, wenn alle gewählten Personen eine einstellbare Zeit unterwegs sind.

## Brennstoff und Ersparnis
Die Integration schätzt, wie viel Heizenergie durch die Pausen gespart wurde, und rechnet sie in die Menge deines Brennstoffs um. Den Brennstoff wählst du pro Raum.

| Brennstoff | Einheit | Standard: kWh pro Einheit |
|---|---|---|
| Erdgas | m³ | 10 |
| Heizöl | l | 10 |
| Flüssiggas | l | 6,6 |
| Pellets | kg | 4,8 |
| Wärmepumpe / Strom | kWh | 1 (mit JAZ/COP, Standard 3,5) |

- „Energie pro Einheit (kWh)“ ist je Brennstoff vorbelegt und anpassbar. Leer oder 0 bedeutet Standardwert.
- Bei Wärmepumpe/Strom wird die Wärme durch die JAZ/COP geteilt, um den Stromverbrauch zu erhalten.
- Beschriftungen, Einheiten und der Hinweistext im Dashboard folgen dem Brennstoff („Heizöl gespart“, „l“ statt „m³“). Bei gemischten Brennstoffen zeigt das Dashboard die Ersparnis als kWh Heizenergie.
- Die Ersparnis ist eine grobe Schätzung, die echte liegt etwas darunter. Die Heizleistung ist fest einstellbar oder wird aus Raumfläche, Heizlast und Außentemperatur berechnet.

## Einrichtung und Einstellungen
Jeder Raum wird als eigener Eintrag über das Menü eingerichtet: Einstellungen → Geräte & Dienste → Integration hinzufügen.

- Fenstersensoren und Thermostate frei wählbar
- Thermostat ausschalten oder auf Absenktemperatur stellen, mit Verzögerung nach Öffnen und Schließen
- Sperrzeit (z. B. nachts) und Außentemperatur-Bedingung
- Erinnerung bei langem Lüften: Aktion per Auswahlmenü, eigener Titel und Text mit den Platzhaltern `{raum}`, `{minuten}`, `{fenster}`
- Eigener Heizungs-Sensor wählbar (z. B. climate, Schalter, Sommer-Modus): steht er auf „Heizung aus“, wird nicht geregelt und nur die Fenstermeldung bleibt aktiv
- Brennstoff, Energie pro Einheit, JAZ/COP, Heizleistung, Raumfläche, Heizlast und Auslegungstemperatur für die Ersparnis

## Entitäten
Pro Raum:

| Entität | Beschreibung |
|---|---|
| Schalter „Fensterregelung aktiv“ | Regelung ein/aus |
| Schalter „Heizplan aktiv“ | Heizplan ein/aus |
| Sensor „Heizung pausiert“ (heute, Monat, Jahr, gesamt) | Minuten; Attribute: `gespart_menge`, `einheit`, `brennstoff`, `gespartes_gas_kwh`, bei Erdgas zusätzlich `gespartes_gas_m3` |
| Sensor „Betriebszustand“ | Regelung aktiv, Heizung pausiert, Heizung aus (nur Fenstermeldung) oder Regelung deaktiviert |
| Sensor „Heizplan Solltemperatur“ | aktuelle Vorgabe des Plans, nächste Änderung als Attribut |

## Installation über HACS
1. HACS → drei Punkte → **Benutzerdefinierte Repositories**
2. URL dieses Repos eintragen, Kategorie **Integration**
3. „Fenster & Heizung“ installieren und Home Assistant neu starten
4. Einstellungen → Geräte & Dienste → Integration hinzufügen → „Fenster & Heizung“

## Update und Hinweise
- Nach einem Update Home Assistant neu starten und die Seite einmal neu laden (Strg+F5), damit das neue Dashboard geladen wird.
- Der bisherige Wert „Energie pro m³ Gas“ bleibt für Erdgas erhalten.
- Der Bericht braucht Verlaufsdaten im Recorder, siehe [Bericht pro Raum](#bericht-pro-raum).

## Neue Version veröffentlichen
1. `version` in `custom_components/fenster_heizung/manifest.json` erhöhen
2. Auf GitHub ein **Release** mit passendem Tag erstellen (z. B. `v2.4.0`)
3. HACS zeigt das Update an

## Unterstützen
Gefällt dir die Integration? Über [GitHub Sponsors](https://github.com/sponsors/maddog3010) kannst du die Weiterentwicklung unterstützen. Danke!

## Änderungen
Alle Versionen siehe [CHANGELOG.md](CHANGELOG.md).
