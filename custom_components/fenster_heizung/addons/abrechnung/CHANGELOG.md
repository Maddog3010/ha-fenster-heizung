# Modul 20 Abrechnungen

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
