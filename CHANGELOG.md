# Changelog

Alle wichtigen Änderungen an „Strom & Wärme“. Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

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
