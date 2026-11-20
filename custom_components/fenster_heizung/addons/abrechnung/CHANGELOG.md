# Modul 20 Abrechnungen

## 1.5 Build 1 – 2026-11-20 (Stabil)
- **Einspeisung mit Abschlägen:** Beim Einspeisevertrag lässt sich eintragen, was der Netzbetreiber monatlich (oder je Quartal) überweist – auch je Abrechnungsjahr und einzelne Monate wie bei Gas und Strom. Modul 20 rechnet hoch, ob mit der Abrechnung eine **Nachzahlung an dich** oder eine **Rückzahlung** kommt (mit Bandbreite). Einspeise-Karte mit „Abschläge erhalten“ und Balken „ausgezahlt“, Ring im Banner, Ergebnis in der großen Zahl, eigenes Register in Abschläge (erhalten statt bezahlt, Zahlung buchen, 0 € = nicht gekommen) und Sensor „Ergebnis Einspeisung“.
- **Balkonkraftwerk am selben Zähler:** Im Einspeisevertrag unter „Anlagen an diesem Zähler“ Hauptanlage und Balkonkraftwerk mit Modulleistung eintragen und wählen, wie der Netzbetreiber rechnet: **Mischsatz nach Leistung** (§ 24 Abs. 3 EEG, Verhältnis der installierten Modulleistung, Balkonkraftwerk meist unentgeltlich = 0 ct; Beispiel der Bundesnetzagentur 8 kWp + 1 kWp: 8,96 statt 10,08 ct) oder **fester Abzug in kWh je Jahr** laut Abrechnung. Vertrag, Karte, Jahreskurve und Hochrechnung rechnen damit.
- Einspeisung: Jahreskurve und Monatswerte heißen „Vergütung“ statt „Kosten“.
- **Jeden Monat anders:** Überweist der Netzbetreiber wechselnde Beträge, im Einspeisevertrag „jeden Monat anders“ wählen und je Monat den Eingang eintragen (oder in Abschläge mit dem Stift buchen). Künftige Monate schätzt Modul 20: Vergütung des Monats × bisherige Auszahlungsquote (Eingänge ÷ Vergütung bis zum letzten Eingang); die Schätzung steht als „geschätzt“ in der Liste.

## 1.4 Build 1 – 2026-11-20 (Stabil)
- **Abschläge je Abrechnungsjahr wie in Modul 3:** Im Vertrag (Bearbeiten) je Abrechnungsjahr ein Betrag (leer = wie davor) und „Einzelne Monate anpassen“ mit allen zwölf Monaten (0 = ausgefallen). Jahresbeträge werden zum Abschlagsplan ab Jahresbeginn, einzelne Monate zu gebuchten Zahlungen am Fälligkeitstag.
- **Brennwert bis 40 kWh/m³** (vorher 15) – Flüssiggas liegt bei etwa 25–28.
- **Übernahme aus Modul 3 berichtigt:** Grundpreis „pro Jahr“ unter 40 € gilt als Monatswert (wurde durch 12 geteilt), Brennwert über 15 wird übernommen, einzelne abweichende Abschlags-Monate werden übernommen. Schon übernommene Gasverträge werden beim Start einmal berichtigt (Werte aus Modul 3 von vor der Übernahme), im Protokoll steht, was geändert wurde.
- Datumsfelder im Vertrag werden beim Neuzeichnen nicht mehr verstümmelt („undefined.undefined.…“)

## 1.3 Build 1 – 2026-11-20 (Stabil)
- **Gas-Hochrechnung wetterbereinigt:** Mit dem Außenfühler aus Modul 9 (Tagesmittel aus der Langzeitstatistik) vergleicht Modul 20 die Gradtage der letzten bis zu 120 Tage mit dem Klimanormal (DWD 1991–2020, Heizgrenze 15 °C). War es kälter als normal, wird der gemessene Verbrauch für die Hochrechnung heruntergerechnet, bei wärmerem Wetter hoch – nur der Heizanteil, die Sommer-Grundlast (Warmwasser) bleibt. Die Gas-Karte zeigt „wetterbereinigt“, unter „Warum?“ steht, wie viel kälter oder wärmer es war. Ohne genug Tageswerte oder im Sommer bleibt alles wie bisher.
- **Müllabfuhr (Modul 17):** Neue Karte in der Übersicht – Grundgebühr (in den Einstellungen von Modul 20 eintragen), Restmüll-Leerungen bisher und im Jahr, Zusatzleerungen über die inklusiven hinaus × Gebühr aus Modul 17, „Müll im Jahr“. Dazu ein Chip im Banner und der Sensor sensor.strom_waerme_abrechnung_kosten_muell. Ohne „Leerungen zählen“ in Modul 17 zählt nur die Grundgebühr.
- **Wofür der Strom (Modul 4):** Neue Karte in der Übersicht – Strom je Gerät im laufenden Abrechnungszeitraum mit kWh, Sonnenanteil, Kosten und Anteil am gemessenen Verbrauch, dazu „übriges Haus“.

## 1.2 Build 1 – 2026-11-20 (Stabil)
- **Aus den Modulen übernehmen:** Ein Dialog sammelt, was die anderen Module schon wissen, und legt es mit einem Tipp an – Stromzähler Bezug und Einspeisung aus Modul 3 (Haus → Energiequellen) mit Sensor und bis zu 36 Monatsständen aus der Statistik, Stromvertrag (Tibber dynamisch aus Modul 14 oder Festpreis aus den Haus-Werten), Einspeisevergütung aus den Haus-Werten, Gasvertrag und Gaszähler aus Modul 3 und Elektroautos aus Modul 8 (Akku, Kilometer-Sensor, Ladungen gleich verknüpft). Jeder Punkt lässt sich abwählen; Verträge werden mit den Zählern verknüpft. Knopf im Banner (mit Anzahl), in Verträge, auf leeren Karten, bei leeren Zählern und Fahrzeugen.
- Leere Spartenkarten: Knöpfe untereinander statt gequetscht nebeneinander

## 1.1 Build 1 – 2026-11-20 (Stabil)
- **Gas aus Modul 3 übernehmen:** Hat Modul 3 einen Gaszähler und Modul 20 noch keinen Gasvertrag, legt ein Tipp Vertrag und Zähler an – Preisliste (brutto/netto, MwSt, Grundpreis je Monat), Abrechnungsjahr, Brennwert und Zustandszahl, Abschlag mit Abbuchungstag, abweichende Abschläge früherer Jahre als Abschlagsplan. Der Zähler bekommt den Sensor aus Modul 3 und bis zu 36 Monatsstände aus der Langzeitstatistik von Home Assistant (Zählertausch wird erkannt). Vorher zeigt ein Dialog, was übernommen wird. Knopf in Verträge, auf der leeren Gas-Karte und bei „Vertrag hinzufügen“.

## 1.0 Build 1 – 2026-11-20 (Stabil)
Modul 20 ist fertig: alle Stufen aus dem Konzept sind drin.
- Stufe „Stabil“, die Fußzeile zeigt die Stufe aus dem Steckbrief
- „So geht es weiter“ entfällt; die Anleitung (PDF, 11 Seiten, docs/Anleitung_Modul20_Abrechnungen.pdf) ist über die Fußzeile erreichbar
- Helle Ansicht durchgesehen: alle sieben Register lesbar
- **Einstellungen in den Haupt-Einstellungen:** Einstellungen → Module → Abrechnungen öffnet die Einstellungen direkt dort, ohne zu Modul 20 zu wechseln (lädt die Daten bei Bedarf nach). Neu geordnet in „Preise und Anbindung“ (Vertragspreis an die Module, Sensoren, Vergleichspreis, Solarstrom), „Mitteilungen und Erinnerungen“, „Hochrechnung und Rechnungsprüfung“ und „Daten“ mit Sprung zu Verträgen, Zählern, Fahrtkosten und Vorräten
- Knöpfe im Vertragskopf („Tarif vergleichen“, „Bearbeiten“) brechen nicht mehr um

## 0.9 Build 1 – 2026-11-19 (Beta)
Fünfte Stufe aus dem Konzept: „Feinschliff“.
- **Sensoren in Home Assistant** (sensor.strom_waerme_abrechnung_…, Gerät „Strom & Wärme · Abrechnungen“): Strompreis, Gaspreis (je kWh und je m³), Wasserpreis und Einspeisevergütung in €/kWh bzw. €/m³ – passend fürs Energie-Dashboard („Entität mit dem aktuellen Preis“). Dazu erwartetes Ergebnis gesamt und je Sparte (mit Bandbreite und empfohlenem Abschlag als Merkmale), nächster Termin, Fahrtkosten je Fahrzeug (€ je 100 km) und Vorrat je Lager (Bestand, reicht bis, bestellen bis). In den Einstellungen abschaltbar.
- Dynamischer Strom: Der Preis-Sensor zeigt den Preis der aktuellen Stunde inkl. Aufschlag (so rechnet das Energie-Dashboard stundengenau richtig), der Ø 30 Tage steht als Merkmal dabei.
- **Karte „Home Assistant & Energie-Dashboard“** in der Übersicht: welcher Sensor wofür, und ob das Energie-Dashboard ihn schon nutzt (nur lesen, Modul 20 ändert dort nichts).
- **Tarifwechsel-Rechner** (Sponsor Max): Angebot mit Arbeits- und Grundpreis, Bonus und Laufzeit gegen den laufenden Strom- oder Gasvertrag – mit deinem Jahresverbrauch aus der Hochrechnung, Jahr 1 mit Bonus, ab Jahr 2 ohne, Gleichstand-Arbeitspreis und „kündigen bis“. Alles andere in Modul 20 bleibt frei.
- Weniger Bewegung, wenn das Gerät „Bewegung reduzieren“ eingestellt hat.

## 0.7 Build 1 – 2026-11-19 (Beta)
Vierte Stufe aus dem Konzept: „Anbindung Module“ – die anderen Module rechnen mit deinen Verträgen.
- **Dynamischer Stromvertrag:** Hauptwert ist jetzt der Ø-Preis der letzten 30 Tage (dein Netzbezug je Stunde aus dem Energiebuch × Tibber-Stundenpreis + Aufschlag), „jetzt“ steht klein daneben. Effektivpreis, Banner und Preisdienst-Karte rechnen mit dem Durchschnitt; ein Hinweis nennt die Quelle. Ohne Energiebuch gilt vorerst der Preis der aktuellen Stunde. Modul 8 lädt weiter nach dem Stundenpreis.
- **Modul 3 · Gaszähler:** Arbeits- und Grundpreis (brutto, je Jahr), Preisänderungen, Brennwert, Zustandszahl, Beginn des Abrechnungsjahrs und Abschlag kommen aus dem Gasvertrag. Modul 3 zeigt „Verwaltet in Modul 20“ statt der Eingabefelder. Ausschalten oder Vertrag löschen gibt die alten Werte zurück.
- **Modul 8 · Wallbox → Fahrtkosten:** Ein Elektroauto oder Plug-in-Hybrid lässt sich mit seinem Fahrzeug aus Modul 8 verknüpfen. Jede Ladung zuhause erscheint dann automatisch als „Laden zuhause“ mit Menge, Solaranteil und Kosten (Netzanteil zum Preis aus Modul 8). Von Hand erfasste Ladungen zuhause zählen ab der ersten übernommenen Ladung nicht mehr doppelt.
- Neue Einstellung „Solarstrom beim Laden zuhause“: kostenlos, entgangene Einspeisevergütung (Standard) oder Bezugspreis
- Preisdienst-Karte mit „Angebunden“: Haus-Werte, Modul 3 und Modul 8 mit Status auf einen Blick

## 0.5 Build 3 – 2026-11-19 (Beta)
- Alle Sensor-Auswahlen in Modul 20 arbeiten jetzt wie beim Zähler: gewählter Sensor oben, Suche beim Tippen, Vorschläge mit Begründung, „Nicht geeignet“ mit Grund.
- **Kilometerstand beim Fahrzeug:** Vorgeschlagen werden nur Gesamt-Kilometerstände des eigenen Fahrzeugs (Name oder Marke im Sensor, Wert passt zum letzten eingetragenen Kilometerstand). Nicht geeignet: Reichweite, Monats-, Tages- und Fahrtenzähler, Sensoren eines anderen Fahrzeugs oder einer anderen Marke, Ladepunkt (evcc) bei Verbrennern. Meilen werden in km umgerechnet.
- **Füllstand beim Vorrat:** Vorgeschlagen werden Füllstände mit passender Art (Heizöl, Pellets, Salz …) und Wert passend zum Bestand. Nicht geeignet: Akku- und Ladestände, Luftfeuchte, Geräte- und Tageswerte.

## 0.5 Build 2 – 2026-11-19 (Beta)
- Neue Auswahl für den Sensor eines Zählers: Vorschläge mit Begründung statt einer langen Liste aller Sensoren mit kWh. Vorgeschlagen werden nur fortlaufende Zählerstände (zählt weiter, passende Einheit, Richtung Bezug oder Einspeisung, Wert passt zum letzten Ablesestand). Tageszähler, Prognosen, Momentanwerte, Erzeugung der Solaranlage und Zähler einzelner Geräte stehen getrennt unter „Nicht geeignet“ – mit Grund.
- Suche über Name, Entitäts-ID, Gerät und Hersteller, filtert beim Tippen
- Warnung, wenn der gewählte Sensor nicht passt oder nicht mehr existiert
- Sensoren in Wh, MWh oder Litern werden beim Tagesstand in kWh bzw. m³ umgerechnet

## 0.5 Build 1 – 2026-11-18 (Beta)
Dritte Stufe aus dem Konzept: „Rechnungen“ – Modul 20 ist jetzt Beta.
- Register „Rechnungen“: Rechnung je Vertrag mit Zeitraum, Zählerständen, Menge, Betrag, angerechneten Abschlägen, Ergebnis und neuem Abschlag; Beleg als PDF oder Foto (bis 3 MB, Fotos werden verkleinert, gespeichert unter /config/strom_waerme/belege)
- Rechnungsprüfung in fünf Punkten: Verbrauch gegen eigene Messung (Toleranz einstellbar), Gas-Umrechnung, Preise laut Vertrag (Preiswechsel tagesgenau nach eigenem Verbrauch verteilt, Gartenwasser ohne Abwasser), geschätzter Endstand gegen eigene Ablesung, alle Abschläge angerechnet
- Aus der Rechnung übernehmen: Brennwert und Zustandszahl, neuer Abschlag ab dem nächsten Termin, Zählerstände – nur was noch nicht bekannt ist
- Register „Fahrtkosten“: Fahrzeuge (Elektro, Benzin, Diesel, Autogas, Plug-in-Hybrid) mit Tanken, Laden zuhause, Laden unterwegs, Kilometerstand und Fixkosten; € je 100 km, Verbrauch (Volltank zu Volltank), Vollkosten je km, Anteil zuhause/unterwegs, Literpreis-Verlauf, Vergleich und Fahrt-Rechner; Laden zuhause mit dem Vertragspreis vorbelegt
- Register „Vorräte“: Heizöl, Pellets, Flüssiggas, Brennholz, Briketts und Betriebsmittel (Salz, Poolchemie, AdBlue, Filter); Bestand aus Einkäufen, Entnahmen, Zählungen oder Füllstand-Sensor; gleitender Durchschnittspreis (Startbestand zum Preis des ersten Einkaufs), Wärmepreis je kWh, Reichweite und „bestellen bis“ (Mindestbestand minus Lieferzeit)
- Mitteilungen ans Handy (Einstellungen → Modul 20): Erinnerung am Stichtag für Zähler ohne Sensor mit Link direkt in die Eingabe, Mindestbestand erreicht (auf Wunsch auch als Eintrag in einer To-do-Liste)
- Tags & Karten: „Zählerstand erfassen“ und „Tankbeleg erfassen“ (Mitteilung mit Link in die Eingabe), „Vorrat: 1 entnommen“ (sofort gebucht)
- Als Nächstes: Ablesung am Stichtag (antippen öffnet die Eingabe), Vorräte nachkaufen oder bestellen; Startseite zeigt Hinweise zu Vorräten
- Einstellungen → Modul 20: Mitteilungen, Stichtag, Toleranz, To-do-Liste, Jahresverbrauch je Sparte

## 0.3 Build 1 – 2026-11-18 (In Entwicklung)
Zweite Stufe aus dem Konzept: „Übersicht & Prognose“.
- Banner mit der einen Antwort: „+7 € voraussichtlich zurück“ (Summe aller Sparten mit Abschlag) mit Bandbreite, rechts die Abrechnungs-Szene mit einem Ring je Sparte (Abschläge ÷ Hochrechnung)
- Hochrechnung bis zum Ende des Abrechnungszeitraums (Jahr, Quartal oder Monat): bisher gemessen, Rest nach Monatsprofil (eigenes Vorjahr, sonst Standardprofil je Sparte), Jahresverbrauch aus dem Verlauf; Bandbreite je nach Datenlage 8–25 %; ohne Ablesungen aus dem eingestellten Jahresverbrauch
- Spartenkarten 2.0: Kosten bisher, Abschläge gezahlt, Hochrechnung, Abschläge bis Ende, Deckungsbalken, Ampel in Worten; monatlich abgerechnete Tarife mit Ø Preis inkl. Grundpreis
- Jahreskurve: Kosten gemessen gegen gezahlte Abschläge, Hochrechnung gestrichelt mit Bandbreite, Monat antippen zeigt die Werte
- Neues Register „Abschläge“: Abschlag gegen Kosten je Monat bzw. Quartal, Empfehlung mit Begründung (auf ganze Euro aufgerundet, damit der Zeitraum bei ± 0 € endet), alle Abschläge im Zeitraum, „Abschlag ändern“ (gültig ab), „Zahlung buchen“ (0 € = ausgefallen, an anderen Tagen Sonderzahlung)
- Sind alle Abschläge bezahlt: erwartetes Ergebnis und Vorschlag für das nächste Jahr
- Dynamisch oder fest: eigener Netzbezug je Stunde (Haus-Energiebuch) × Börsenpreis der Stunde (Tibber-Verlauf) gegen einen festen Vergleichspreis, letzte 30 Tage; der Ø Preis fließt in Kosten und Hochrechnung des dynamischen Vertrags
- „Als Nächstes“ zeigt den nächsten Abschlag, die Startseiten-Kachel das erwartete Ergebnis
- Korrigiert: Handy-Ansicht war zu breit, kleine Knöpfe in Listen hatten zu viel Abstand

## 0.1 Build 1 – 2026-11-14 (In Entwicklung)
Erste Stufe aus dem Konzept „Modul 20 – Abrechnungen“: das Grundgerüst.
- Verträge für Strom, Gas, Wasser & Abwasser und Einspeisung mit Preisperioden (gültig ab), brutto oder netto, Grundpreis, Messstelle, Bonus, Laufzeit und Fristen
- Wasser-Gebühren: Frischwasser, Abwasser, Niederschlagswasser, Zählergebühr
- Gas-Umrechnung m³ → kWh (Brennwert × Zustandszahl)
- Zähler mit Ablesungen von Hand, Prüfung gegen den Verlauf (Rückwärtslauf, Zahlendreher, ungewöhnlicher Verbrauch), Zählerwechsel, Überlauf
- Zähler mit Sensor speichern täglich um 0 Uhr einen Stand
- Preisdienst: der Vertragspreis geht an die anderen Module (Haus-Werte)
- Übersicht mit Kosten im laufenden Abrechnungsjahr (gemessen), „Als Nächstes“ mit Fristen und Preisänderungen
