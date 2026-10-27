# Changelog

Alle wichtigen Änderungen an „Fenster & Heizung“. Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

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

[2.2.1]: https://github.com/maddog3010/ha-fenster-heizung/releases/tag/v2.2.1
[2.2.0]: https://github.com/maddog3010/ha-fenster-heizung/releases/tag/v2.2.0
[2.1.0]: https://github.com/maddog3010/ha-fenster-heizung/releases/tag/v2.1.0
[2.0.1]: https://github.com/maddog3010/ha-fenster-heizung/releases/tag/v2.0.1
[2.0.0]: https://github.com/maddog3010/ha-fenster-heizung/releases/tag/v2.0.0
[1.5.2]: https://github.com/maddog3010/ha-fenster-heizung/releases/tag/v1.5.2
[1.5.1]: https://github.com/maddog3010/ha-fenster-heizung/releases/tag/v1.5.1
[1.5.0]: https://github.com/maddog3010/ha-fenster-heizung/releases/tag/v1.5.0
[1.4.2.2]: https://github.com/maddog3010/ha-fenster-heizung/releases/tag/v1.4.2.2
[1.4.2.1]: https://github.com/maddog3010/ha-fenster-heizung/releases/tag/v1.4.2.1
[1.4.2]: https://github.com/maddog3010/ha-fenster-heizung/releases/tag/v1.4.2
[1.4.1]: https://github.com/maddog3010/ha-fenster-heizung/releases/tag/v1.4.1
[1.4.0]: https://github.com/maddog3010/ha-fenster-heizung/releases/tag/v1.4.0
[1.3.0]: https://github.com/maddog3010/ha-fenster-heizung/releases/tag/v1.3.0
[1.2.0]: https://github.com/maddog3010/ha-fenster-heizung/releases/tag/v1.2.0
[1.1.2]: https://github.com/maddog3010/ha-fenster-heizung/releases/tag/v1.1.2
[1.1.1]: https://github.com/maddog3010/ha-fenster-heizung/releases/tag/v1.1.1
[1.1.0]: https://github.com/maddog3010/ha-fenster-heizung/releases/tag/v1.1.0
[1.0.0]: https://github.com/maddog3010/ha-fenster-heizung/releases/tag/v1.0.0
