<p align="center">
  <img src="docs/banner.png" alt="Strom &amp; Wärme Version 3.0 – 16 Module für Heizung, Strom und Haus in Home Assistant">
</p>

# Strom & Wärme

[![HACS](https://img.shields.io/badge/HACS-Custom-41BDF5?logo=homeassistantcommunitystore&logoColor=white)](https://hacs.xyz)
[![Version](https://img.shields.io/badge/Version-3.0.2.5-2dd4bf)](CHANGELOG.md)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-%E2%9D%A4-ea4aaa?logo=github-sponsors&logoColor=white)](https://github.com/sponsors/Maddog3010)

**Eine Integration für Home Assistant, die Heizung, Fenster, Warmwasser, Solarstrom und Geräte zusammenbringt.** Sie pausiert Heizkörper, wenn ein Fenster offen ist, heizt nach Plan, nutzt PV-Überschuss für Elektroheizer und Warmwasser, zeigt, woher der Strom deiner Geräte kommt, und stellt alles in einem eigenen Dashboard in der Seitenleiste dar.

> ### 🌦️ Neu in Version 3.0.2.3: Modul 9 Wetter & Warnungen
> **Modul 9 (Beta) ist fertig:** Warnungen für Sturm, Gewitter, Frost, Hitze und Starkregen mit **Vorwarnung**, **amtliche Warnungen** von DWD, NINA und MeteoAlarm, **Aktionen** (Rollläden, Markisen, Schalter, Skripte), **Fenster-Erinnerung** und **Benachrichtigung** aufs Handy. Im **Store** (Kategorie „Wetter“) siehst du die passenden Dienste mit Status. Was eingerichtet ist, wird automatisch genutzt. Details im Abschnitt [Modul 9](#modul-9-wetter--warnungen). Die Einstellungen von **Modul 1** sind neu geordnet (vier aufklappbare Bereiche unter **Einstellungen → Modul 1**), und die Tasten des Sommermodus funktionieren wieder.
>
> ### ⚡ Außerdem in 3.0.2.3: Wallbox noch komfortabler
> **Modul 8 ist neu geordnet:** Das Register „Laden“ zeigt nur noch den Alltag, alle Einstellungen stehen im neuen Register „Einstellungen“ mit Einrichtungs-Check und aufklappbaren Bereichen. Dazu gibt es eine **Statusleiste** mit Hinweisen. In **Modul 8** gibt es jetzt eine Tageskarte **Heute**, einen **Schnellstart** (1 Stunde voll, bis zum Ziel voll, heute nur Sonne), den **Hausanschluss-Schutz**, **Benachrichtigungen** aufs Handy und eine **Abfahrtszeit pro Fahrzeug**. RFID-Karten ordnest du per Antippen den Fahrzeugen zu (mehrere Karten pro Fahrzeug sind möglich), die Auswahl der Karten funktioniert jetzt zuverlässig. Die Ladestatistik zeigt zusätzlich Ø Verbrauch und gespartes CO₂ und lässt sich als CSV exportieren. Alle Details stehen im [Changelog](CHANGELOG.md).
>
> ### 🔌 Version 3.0.1: Laderegelung für den go-e Charger
> Unter **Einstellungen → Allgemein → Integrationen** verbindest du den go-e Charger direkt über das lokale Netzwerk, auf Wunsch auch Tibber für die Strompreise. In **Modul 8** regelst du dann das Laden nach PV-Überschuss (Sonne, Sonne + Netz, Voll, Ladeplan), planst es nach Strompreis und PV-Prognose und siehst die **Ladestatistik** mit Sonnenanteil und Kosten. Die Regelung ist standardmäßig aus.
>
> ### 📍 Personen & Standort (ebenfalls 3.0.1)
> Neue Seite unter **Einstellungen → Allgemein → Personen & Standort**: Standort der Personen über **Apple iCloud**, eigene **Home-Zone auf der Karte** und Einstellungen pro Person. „Anwesenheit & Urlaub“ nutzt beides. Mehr dazu im Abschnitt [Anwesenheit und Urlaub](#anwesenheit-und-urlaub).
>
> ### 🎉 Version 3.0.0
> Das Dashboard hat jetzt **16 Module**. Neu ist **Modul 4: Gerätestrom** (fertig, kein Beta). Dazu kommen **zwölf Beta-Module** (5 bis 16) mit eigenen Seiten für Lüftung, Rollläden, Wärmepumpe, Elektroauto, Wetter, Garten, Sicherheitsmelder, Pool und Sauna, Batteriespeicher, Stromtarif, Wartung und Solar-Prognose.
> **Alle Beta-Module sind standardmäßig aus.** Du schaltest sie unter **Einstellungen → Module verwalten** ein, wenn du sie ausprobieren willst. Alle Änderungen stehen im [Changelog](CHANGELOG.md).
>
> **Update von 2.x:** über HACS aktualisieren, Home Assistant neu starten, Seite neu laden (Strg+F5). Deine Einstellungen bleiben erhalten. Gerätestrom ist jetzt Teil dieser Integration, die separate Integration „geraetestrom“ wird nicht mehr gebraucht.

## Die Module auf einen Blick

**Kennzeichnung:** Jedes Modul trägt im Kopfteil (am Desktop zusätzlich am Tab) eine Stufe:
- **Stabil** (grün): fertig und im Alltag erprobt (Module 1 bis 4).
- **Beta** (orange): funktioniert, wird gerade getestet.
- **Vorabversion** (blau): arbeitet schon mit echten Daten, ist aber noch nicht endgültig. Aussehen und Einstellungen können sich ändern.
- **In Entwicklung** (grau): Beispielseite mit Beispielwerten, das Modul steuert noch nichts.

| Nr. | Modul | Stand | Was es macht |
|---|---|---|---|
| 1 | **Fenster & Heizung** | Stabil | Thermostate bei offenem Fenster pausieren, Heizpläne, Anwesenheit und Urlaub, Berichte, Elektroheizer mit PV-Überschuss, Schimmel- und Lüftungshinweise, Diagnose |
| 2 | **Warmwasser & Zirkulation** | Stabil | Speicher, Zeitplan, Zirkulationspumpe, Legionellenschutz, Heizstab bei PV-Überschuss |
| 3 | **Energie** | Stabil | Solar, Netz, Batterie und Hausverbrauch, Kosten und Autarkie, zweite Solaranlage |
| 4 | **Gerätestrom** | Stabil, neu | Pro Gerät Solar-, Batterie- und Netzanteil, Kosten, Ersparnis, Startempfehlung |
| 5 | Lüftung & Raumluft | In Entwicklung | Luftfeuchte und Lüftungshinweise je Raum, später KWL und CO₂ |
| 6 | Rollläden & Beschattung | In Entwicklung | Sonnenstand und Außenwerte, später Rollladensteuerung |
| 7 | Wärmepumpe | In Entwicklung | Außenbedingungen, später Laufzeit, Takten und Abtauen |
| 8 | Elektroauto & Wallbox | Beta | Auto mit Wallbox, Ladestand, Reichweite, Kilometerstand, Laderegelung für den go-e Charger (Sonne, Sonne + Netz, Voll, Ladeplan), Planung nach Strompreis (Tibber) und PV-Prognose (Forecast.Solar), Ladestatistik |
| 9 | Wetter & Warnungen | Beta, neu | Sturm-, Gewitter-, Frost-, Hitze- und Starkregenwarnung mit Vorwarnung, amtliche Warnungen (DWD, NINA), Aktionen, Fenster-Erinnerung und Meldungen aufs Handy |
| 10 | Garten & Bewässerung | In Entwicklung | Regen, PV-Überschuss und Zisterne |
| 11 | Rauch- & Sicherheitsmelder | Vorabversion | Melder, Batteriestände und Alarme im Überblick |
| 12 | Pool & Sauna | In Entwicklung | Überschuss, Strompreis und Außentemperatur |
| 13 | Batteriespeicher-Planung | In Entwicklung | Betriebsarten, Ladestand-Grenzen, Zeitplan (Vorschau) |
| 14 | Dynamischer Stromtarif | Beta | Stundenpreise, Preisverlauf, günstigste Zeiten |
| 15 | Wartung & Erinnerungen | In Entwicklung | Termine und Betriebsstunden (Vorschau mit Beispielen) |
| 16 | Solar-Prognose | Vorabversion, neu | Prognose heute und morgen (Forecast.Solar oder eigener Sensor), stündlicher Verlauf, Prognose gegen tatsächlichen Ertrag, beste Zeit für Verbraucher | Brennstoff | Einheit | Standard: kWh pro Einheit |
|---|---|---|
| Erdgas | m³ | 10 |
| Heizöl | l | 10 |
| Flüssiggas | l | 6,6 |
| Pellets | kg | 4,8 |
| Wärmepumpe / Strom | kWh | 1 (mit JAZ/COP, Standard 3,5) |

## Modul 2: Warmwasser & Zirkulation
Zeigt den Speicher, steuert Erzeuger, Heizstab und Zirkulationspumpe nach Zeitplan und führt den Legionellenschutz aus. **Das Modul schaltet nur Geräte, die du auswählst.** Fehlt eines, sagt die Seite das an der passenden Stelle.

<p align="center"><img src="docs/vorschau_modul_warmwasser.png" width="720" alt="Modul 2: Warmwasser"></p>

**Einrichten** (Zahnrad oben rechts): Speichergröße, Soll- und Absenktemperatur, bis zu drei Temperatursensoren (oben, Mitte, unten), den Wärmeerzeuger (Schalter, `water_heater` oder `climate`), optional einen Heizstab für PV-Überschuss, die Zirkulationspumpe, einen Rücklaufsensor und einen Auslöser für „Bei Bedarf“. Ein Speichersensor genügt für den Start.

- **Übersicht:** Temperaturen, Status (Bereit, Heizt auf, Unter Soll, Zu heiß, Abwesend), eine Schätzung, für wie viele Duschen das Wasser reicht, Kacheln für Laufzeiten, Rücklauf und letzten Legionellenschutz, dazu ein Verlauf der letzten 24 Stunden.
- **Zeitplan:** Soll-Temperatur pro Zeitfenster, getrennt für Montag bis Freitag und das Wochenende. Der Erzeuger schaltet ein, wenn der Speicher oben 3 K unter Soll liegt, und aus, sobald das Soll erreicht ist. **Ab 65 °C schaltet das Modul Erzeuger und Heizstab immer ab** (Verbrühschutz).
- **Zirkulation:** nach Zeitplan, bei Bedarf (Taster, Bewegungsmelder oder Durchflusssensor), im Intervall oder aus. Eine Rücklauf-Grenze stoppt die Pumpe, wenn das Wasser in der Leitung schon warm ist.
- **Schnellknöpfe:** „Einmal aufheizen“ (auf die Schutztemperatur, höchstens 3 Stunden), „Zirkulation 5 Min.“ und „Abwesend“ (Absenktemperatur, Pumpe aus).
- **Legionellenschutz:** einmal pro Woche auf die Schutztemperatur (Standard 60 °C) und 20 Minuten halten, gemessen am kältesten Sensor. Er läuft nur mit gewähltem Erzeuger oder Heizstab. Schafft der Speicher es in sechs Stunden nicht, bricht der Lauf ab und das Fehlerprotokoll bekommt eine Warnung.
- **PV-Überschuss:** Mit einem Heizstab-Schalter lädt das Modul den Speicher bei Überschuss bis zur eingestellten Höchsttemperatur (Standard 62 °C). **Der Warmwasser-Heizstab hat Vorrang vor den Raumheizern.**

## Modul 3: Energie
Heizung, Strom und PV auf einer Seite. Das Modul **liest nur Sensoren und schaltet nichts**.

<p align="center"><img src="docs/vorschau_modul_energie.png" width="720" alt="Modul 3: Energie"></p>

- **Kopfkarte:** Hausverbrauch jetzt, Anteil aus Solar, Chips für Solar, Netz und Batterie
- **Zeitraum:** Heute, 7 Tage, 30 Tage
- **Kacheln:** Solar (mit Eigenverbrauch), Netzbezug (Kosten), Einspeisung (Vergütung), Verbrauch (Autarkie)
- **Energiefluss:** Grafik mit Solar, Netz, Haus, Batterie, Heizung und Warmwasser
- **Verlauf:** Leistungskurve für heute, Balken pro Tag für 7 und 30 Tage
- **Verteilung, Kosten und Vorteil, Heizung** und **Hinweise** (zum Beispiel hoher Netzbezug oder Solarüberschuss, der ins Netz geht)

<details>
<summary><b>Einrichten und zweite Solaranlage</b></summary>

- **Pflicht:** Leistungssensoren (Watt oder kW) für Solar und Netz. Das Netz kann wie in Modul 1 gewählt sein. Hausverbrauch und Batterie sind optional; fehlt der Hausverbrauch, wird er berechnet. Meldet der Solar-Sensor „nicht verfügbar“ (Wechselrichter nachts), zählt das als 0 W.
- **Zweite Solaranlage** (zum Beispiel Balkonkraftwerk): zweiter Leistungssensor und optional zweiter Ertragszähler. Beide Anlagen werden addiert. Du kannst beide benennen. Die Kopfkarte und die Solar-Kachel zeigen den Anteil der zweiten Anlage, der Tagesverlauf eine dünne Linie. Liefert eine Anlage seit 10 Minuten unter 5 W, während die andere mindestens 400 W liefert, erscheint der Hinweis „… liefert nichts“.
- **Batterie:** ein Sensor mit Vorzeichen (Laden oder Entladen positiv) oder zwei Sensoren (einer für „lädt“, einer für „entlädt“, jeweils positiv).
- **7 und 30 Tage:** Am genauesten sind Energiezähler (Wh, kWh, MWh, Langzeitstatistik mit `state_class: total_increasing`). Leistungssensoren gehen auch, dann wird aus Stunden-Mittelwerten gerechnet. Leer lassen: es wird aus Solar und Netz oben gerechnet.
- Die Einstellungen werden im Backend gespeichert und mit gesichert. Strompreis und Einspeisevergütung kommen aus Modul 1 → Allgemein.

<img src="docs/vorschau_energie_einstellungen.png" width="360" alt="Energie-Einstellungen">
</details>

## Modul 4: Gerätestrom
Zeigt für jedes Gerät, **woher der Strom kam** (Solar, Batterie oder Netz), was der Lauf kostete und was du durch eigenen Strom gespart hast. Das Modul **liest nur Sensoren und schaltet nichts**. Es rechnet selbst in „Strom & Wärme“. Die frühere Integration „geraetestrom“ wird nicht mehr gebraucht.

<p align="center"><img src="docs/vorschau_modul_geraetestrom.png" width="720" alt="Modul 4: Gerätestrom"></p>

**Einrichten** (Einstellungen → Modul 4): bis zu 8 Geräte mit je einem **Leistungssensor** (Watt oder kW), einer **Schwelle** (ab wie vielen Watt ein Lauf gilt) und einer **Endzeit** (so viele Minuten unter der Schwelle beenden den Lauf). Dazu optional Batteriekosten (ct/kWh), ein Prognose-Sensor und Benachrichtigungsdienste.

- **Quellen:** Die Aufteilung nutzt die Sensoren aus **Modul 3** (Solar, Netz, Batterie) und die Preise aus **Modul 1 → Allgemein**. Solar fürs Haus = Erzeugung minus Batterie-Laden minus Einspeisung. Die Geräteleistung wird anteilig auf Solar, Batterie und Netz verteilt.
- **Kosten und Ersparnis:** Netzstrom kostet den Strompreis. Solarstrom spart Strompreis minus Einspeisevergütung. Batteriestrom spart Strompreis minus Batteriekosten.
- **Karten:** pro Gerät Leistung nach Quelle, Heute, letzter Durchlauf und eine Empfehlung: **Jetzt starten** (ab 70 % Solardeckung), **Teilweise Solar** (ab 30 %) oder **Besser warten**.
- **Verlauf:** gestapelte Balken nach Quelle für 7 Tage, 30 Tage und 12 Monate, auf Wunsch je Gerät. Die Daten bleiben bis zu 800 Tage gespeichert.
- **Ende eines Laufs:** Das Ereignis `geraetestrom_run_finished` wird ausgelöst, und gewählte `notify`-Dienste melden zum Beispiel „Waschmaschine fertig: 0,90 kWh · 0,12 € · 78 % eigener Strom (gespart: 0,42 €)“.

<img src="docs/vorschau_geraetestrom_einstellungen.png" width="480" alt="Gerätestrom einrichten">

*Hinweis:* Zähler der alten Integration werden nicht übernommen, die Auswertung beginnt neu. Die Home-Assistant-Sensoren für das Energie-Dashboard, die Energiefluss-Grafik und die Anordnung per Ziehen gibt es in der neuen Version noch nicht.


## Beta-Module 5 bis 16
Diese zwölf Module sind **Beta-Versionen**. Sie sind noch in Entwicklung, Funktionen können sich ändern oder fehlen. Jede Seite trägt die Kennzeichnung „Beta“ und nennt unten, was noch folgt („In Entwicklung“). Alle Beta-Module sind **standardmäßig aus**, lesen nur Werte aus Home Assistant und **schalten nichts**. Wer ein Modul einschaltet, sieht es sofort in der Modulleiste. Rückmeldungen gern als [Issue auf GitHub](https://github.com/Maddog3010/ha-fenster-heizung/issues).

### Modul 5: Lüftung & Raumluft
<p align="center"><img src="docs/vorschau_modul_lueftung.png" width="560" alt="Modul 5: Lüftung &amp; Raumluft"></p>
Zeigt pro Raum Luftfeuchte, Taupunkt und Lüftungshinweise aus den Räumen von Modul 1. Räume ohne Luftfeuchte-Sensor sind als solche markiert. **Geplant:** KWL (Lüftungsanlage) steuern und CO₂-Werte auswerten.

### Modul 6: Rollläden & Beschattung
<p align="center"><img src="docs/vorschau_modul_rolllaeden.png" width="560" alt="Modul 6: Rollläden &amp; Beschattung"></p>
Zeigt Sonnenhöhe und Himmelsrichtung aus der Sonnen-Entität von Home Assistant sowie Außentemperatur und Luftfeuchte. **Geplant:** Rollläden nach Zeitplan und Sonnenstand steuern, Hitzeschutz im Sommer, Sonnenwärme im Winter nutzen.

### Modul 7: Wärmepumpe
<p align="center"><img src="docs/vorschau_modul_waermepumpe.png" width="560" alt="Modul 7: Wärmepumpe"></p>
Zeigt die Außenbedingungen und ob Abtauen wahrscheinlicher wird (unter etwa 7 °C). **Geplant:** Laufzeit und Takten erkennen, Vorlauf, Rücklauf und Leistungszahl (COP), Abtauzyklen zählen.

### Modul 8: Elektroauto & Wallbox
<p align="center"><img src="docs/vorschau_modul_elektroauto.png" width="720" alt="Modul 8: Elektroauto"></p>

- **Auswahl:** Marke (Mercedes-Benz, Audi, VW, BYD, BMW oder Andere), Modellname, Karosserie (Limousine, SUV, Kombi, Kompakt) und eine von sechs Farben. Die Grafik ist eine eigene Zeichnung. **Es werden keine Markenlogos und keine Nachbildungen echter Modelle verwendet**, die Marke steht nur als Text.
- **Wallbox** immer sichtbar. Das **Ladekabel** erscheint nur, wenn der Stecker steckt, und verschwindet beim Abstecken. **Beim Laden** läuft eine Animation am Kabel, die Wallbox zeigt die Leistung.
- **Kacheln:** Ladestand, Reichweite, Kilometerstand und Ladeleistung.
- **Sensoren** (alle optional, wählbar in den Einstellungen): Ladestand, Kilometerstand, Reichweite, „Stecker steckt“, Ladeleistung, „lädt“.
- **Laderegelung für den go-e Charger (neu in 3.0.1):** Die Wallbox wird direkt über die lokale HTTP-API v2 gelesen und geregelt, ohne Cloud. Die Verbindung richtest du unter **Einstellungen → Allgemein → Integrationen** ein (IP-Adresse, „Verbindung testen“). In der go-e-App muss unter Einstellungen → Verbindung → API-Einstellungen die lokale HTTP-API eingeschaltet sein.

<p align="center"><img src="docs/vorschau_wallbox_regelung.png" width="620" alt="Laderegelung der Wallbox"></p>

  - **Fahrzeuge & Karten (wie bei evcc):** Die Regelung erkennt das Fahrzeug an der RFID-Karte, die an der Wallbox angelegt wird. Du trägst keine Kartennummern ein, sondern tippst die Karten an, die in der go-e-App schon hinterlegt sind (Kartenname). **Seit 3.0.2.3** gibt es dafür den Block **„Karten zuordnen“**: Jede Karte hat eine Zeile mit allen Fahrzeugen als Auswahl-Chips, ein Tipp ordnet sie zu oder löst sie wieder. Ein Fahrzeug kann **beliebig viele Karten** haben (zum Beispiel eine pro Person für dasselbe Auto), eine Karte gehört aber zu genau einem Fahrzeug. Die gerade erkannte Karte ist mit „Aktiv“ markiert, Karten ohne Fahrzeug gelten als Gast. Ist in den Elektroauto-Einstellungen eine Marke und ein Modell hinterlegt, legst du das Fahrzeug mit einem Tipp an. Pro Fahrzeug stellst du Modus und Ladelimit ein, ein Gastfahrzeug gilt für unbekannte Karten. Die Ladestatistik zählt weiter getrennt pro Karte und Fahrzeug.
  - **„Nur mit erkannter Karte regeln“:** Ohne Karte verändert Strom & Wärme nichts an der Wallbox. Die eigentliche Sperre kommt von der Kartenpflicht (Authentifizierung) in der go-e-App.
  - **„Nach dem Abstecken zurücksetzen“:** Die Wallbox wird auf „neutral“ gestellt und die Erkennung vergessen. Sie gilt nur für eine Ladung.
<p align="center"><img src="docs/vorschau_wallbox_fahrzeuge.png" width="620" alt="Fahrzeuge und Karten"></p>

  - **Schalter „Laderegelung aktiv“:** Standardmäßig **aus**. Solange er aus ist, verändert Strom & Wärme nichts an der Wallbox. Beim Ausschalten stellt die Regelung die Wallbox wieder auf „neutral“.
  - **Modi** wie bei evcc: **Aus**, **Sonne** (nur mit Überschuss), **Sonne + Netz** (immer Mindeststrom, mehr bei Überschuss) und **Voll** (Höchststrom).
  - **Regelung:** Ladestrom 6 bis 16 A in 1-A-Schritten, Start ab einem Überschuss nach einer Wartezeit, Stopp nach einer Wartezeit (gegen Wolken), automatische Umschaltung zwischen 1 und 3 Phasen (höchstens alle 10 Minuten), Ladelimit in Prozent.
  - **Überschuss:** Einspeisung am Netzanschluss (Netz-Sensor aus Modul 3 oder 1) plus die Leistung, die die Wallbox selbst zieht. Die Regelung läuft alle 10 Sekunden.
  - **Ladeplan:** Ziel-Ladestand bis zu einer Uhrzeit (täglich, Mo–Fr oder Wochenende). Reicht die Sonne nicht, startet die Wallbox spätestens zur berechneten Zeit mit Netzstrom. Braucht den Ladestand-Sensor des Fahrzeugs und die Akkukapazität.
  - **Hausbatterie zuerst** (mit Mindest-Ladestand) und **Netzstrom nur bei günstigem Preis** (mit Preis-Sensor aus Modul 1).
  - **Sicherheit:** Es sind nur Adressen im lokalen Netz erlaubt. Stellst du die Wallbox in der go-e-App von Hand um, pausiert die Regelung 30 Minuten. Fehlt der Überschuss-Wert, wird im Modus „Sonne“ nicht geladen. Ist die Wallbox nicht erreichbar, kann nichts umgestellt werden, sie bleibt im letzten Zustand, und die Meldung steht in der Liste. Die letzten Entscheidungen stehen mit Begründung in der Liste.
  - **Erster Test:** Regelung erst mit Modus „Voll“ und 6 A ausprobieren und in der go-e-App beobachten, danach „Sonne“.
  - Unterstützt wird der **go-e Charger Gemini** (und andere Geräte mit lokaler API v2). Die Befehle stammen aus der [offiziellen go-e-API-Dokumentation](https://github.com/goecharger/go-eCharger-API-v2/blob/main/apikeys-en.md).

  - **Tibber (neu in 3.0.1):** Unter **Einstellungen → Allgemein → Integrationen → Stromtarife** verbindest du Tibber mit deinem persönlichen Zugriffstoken (developer.tibber.com), ohne zusätzliche Integration. Es werden nur Strompreise von heute und morgen abgerufen, keine Verbrauchsdaten. Der Token wird nur in Home Assistant gespeichert und nur an api.tibber.com gesendet.
<p align="center"><img src="docs/vorschau_integration_tibber.png" width="620" alt="Tibber verbinden"></p>

    - **Preisauflösung:** „Stundenmittel“ (empfohlen, ein Preis pro Stunde), „Viertelstunden“ (die genauen 15-Minuten-Preise; kennt die Tibber-Schnittstelle sie nicht, werden automatisch Stundenwerte genommen) oder „Preisstufen“ (nur Tibbers Einstufung von sehr günstig bis teuer, die Kosten in der Statistik bleiben mit den echten Preisen berechnet).
  - **Register in Modul 8 (neu geordnet in 3.0.2.3):** „Laden“, „Planung“, „Ladestatistik“ und „Einstellungen“.
<p align="center"><img src="docs/vorschau_wallbox_laden.png" width="620" alt="Modul 8, Register Laden"></p>

    - **Laden (Alltag):** Auto-Grafik, Heute, Wallbox mit Modus und Status, Schnellstart und die letzten Entscheidungen. Die Modus-Tasten gelten für das **erkannte Fahrzeug**, darunter steht, für wen („Gilt für BYD Seal U“). Ohne erkannte Karte gilt der Standardmodus oder der Gastmodus.
    - **Statusleiste** über allen Registern: Zustand (Regelung aktiv, aus, pausiert, nicht erreichbar), Modus, erkanntes Fahrzeug, Leistung und ein laufender Schnellstart. Hinweise wie „Von Hand umgestellt, pausiert noch 12 Min.“ oder „Es fehlt ein Netz-Sensor für den Überschuss“ erscheinen darunter, mit einem Link zur Lösung.
    - **Planung:** Plan nach Preis und Sonne, **Standard-Abfahrt** (Ziel-Ladestand, Uhrzeit, Tage und „Spätestens mit Netzstrom nachladen“), Abfahrtszeit pro Fahrzeug, geplante Ladefenster und Quellen der Vorhersage.
    - **Einstellungen:** Oben ein **Einrichtungs-Check** (Wallbox, Ladestand-Sensor, Netz-Sensor, Fahrzeug, Karten, optional Strompreis und PV-Prognose) mit Links zur Lösung. Darunter sechs aufklappbare Bereiche mit einer Zusammenfassung in der Zeile: Wallbox und Verbindung (mit **Verbindung testen**), Laderegelung (Ladestrom, Phasen, Start und Stopp, Fahrzeug), Fahrzeuge und Karten, Hausbatterie und Strompreis, Hausanschluss-Schutz und Benachrichtigungen. Ein orangefarbenes „!“ markiert Bereiche, die Aufmerksamkeit brauchen. „Alle öffnen“ und „Alle schließen“ gibt es auch, welche offen sind, merkt sich die Seite.
<p align="center"><img src="docs/vorschau_wallbox_einstellungen.png" width="620" alt="Modul 8, Register Einstellungen"></p>

  - **Planung nach Strompreis und Sonne (neu in 3.0.1):**
<p align="center"><img src="docs/vorschau_wallbox_planung.png" width="620" alt="Ladeplanung nach Preis und Sonne"></p>

    - Das Diagramm zeigt die nächsten rund 30 Stunden: PV-Überschuss (türkis), Strompreis (orange), geplante Ladung (markiert) und die Uhrzeit, bis zu der das Auto geladen sein soll. Ziel-Ladestand, Uhrzeit und Akkukapazität kommen aus dem Ladeplan unter „Laden“.
    - **Strategien:** „Sonne zuerst, dann günstig“ (niedrigste effektive Kosten aus PV-Anteil und Preis), „Nur Sonne“ (nur Stunden mit genug Überschuss) und „Günstigster Preis“.
    - **Schalter „Planung aktiv“:** Aus = nur Anzeige. An = **echte Steuerung**: Die Wallbox lädt nur in den geplanten Fenstern (in Sonnenstunden nach Überschuss, in günstigen Netzstunden mit voller Leistung) und wird dazwischen pausiert. Der Modus unter „Laden“ ist dann gesperrt. Ein Fahrzeug mit dem Modus „Aus“ bleibt aus. Die Laderegelung muss an sein, der Ladestand des Fahrzeugs muss bekannt sein.
    - **Sicherheit:** Reicht die Sonne nicht bis zur Uhrzeit, startet die Ladung spätestens zur berechneten Zeit mit Netzstrom. Das Ladelimit und „fertig geladen“ gelten weiter.
    - **Quellen der Vorhersage:** Strompreis von **Tibber** oder aus einem Preis-Sensor (Modul 1). PV-Prognose von **Forecast.Solar**: Die Integration in Home Assistant wird erkannt (mehrere Dachflächen werden addiert) und über die Aktion `forecast_solar.get_forecast` gelesen. Vom Hausverbrauch wird ein einstellbarer **Grundverbrauch** (Vorgabe 0,4 kW) abgezogen.
  - **Ladestatistik (neu in 3.0.1):**
<p align="center"><img src="docs/vorschau_wallbox_statistik.png" width="620" alt="Ladestatistik"></p>

    - Balkendiagramm pro Tag (Monat), pro Monat (Jahr) oder pro Jahr (Gesamt), wahlweise **Energie** oder **Kosten**, aufgeteilt nach **Sonne / Netz** oder nach **Fahrzeug**. Dazu Kacheln mit Geladen, Sonnenanteil, Kosten, Ø Preis und Ersparnis sowie die letzten Ladevorgänge.
    - **Neu in 3.0.2.3:** Kachel **Ø Verbrauch** (kWh pro 100 km, aus dem Kilometerstand-Sensor des Elektroautos, ohne Sensor wird sie als „–“ angezeigt) und **CO₂ gespart** (Sonne statt Netz-Mix, gerechnet mit 0,38 kg je kWh). Der Knopf **CSV** lädt die Tage und Ladevorgänge als Tabelle für Excel herunter (Semikolon, deutsche Zahlen).
    - **So wird gerechnet:** Alle 10 Sekunden wird die Ladeleistung aufgeteilt. Als Sonne zählt der Anteil, der aus dem Überschuss am Netzanschluss gedeckt wird (Einspeisung plus Wallbox-Leistung, also auch die Hausbatterie), der Rest kommt aus dem Netz. Die Kosten sind der Netzanteil mal dem Preis zum Zeitpunkt des Ladens (Tibber oder Preis-Sensor aus Modul 1, ohne Preis 0 €). Gespeichert wird pro Tag, Fahrzeug und Ladevorgang bis zu 800 Tage, es wird kein Verlauf deiner Position oder Verbrauchsdaten gespeichert. Gezählt wird auch bei ausgeschalteter Regelung.

  - **Neu in 3.0.2.3: Heute, Schnellstart, Hausanschluss-Schutz und Benachrichtigungen** (Heute und Schnellstart im Register „Laden“, Schutz und Benachrichtigungen im Register „Einstellungen“):
<p align="center"><img src="docs/vorschau_wallbox_zusatz.png" width="620" alt="Heute, Schnellstart, Hausanschluss-Schutz und Benachrichtigungen"></p>

    - **Heute:** Geladene Energie, Sonnenanteil, Kosten und die aktuelle Leistung mit dem Anteil Sonne und Netz.
    - **Schnellstart:** Einmalig **1 Stunde voll**, **Bis zum Ziel voll** (bis zum Ladelimit oder Abstecken) oder **Heute nur Sonne** (bis Mitternacht). Er ändert weder Modus noch Planung, endet von selbst, beim Abstecken oder mit „Stopp“ und gilt nur bei einem erkannten Fahrzeug, wenn „Nur mit erkannter Karte regeln“ an ist.
    - **Hausanschluss-Schutz:** Du gibst den Höchststrom pro Phase an (Wert deiner Hauptsicherung oder niedriger). Die Wallbox wird gedrosselt oder pausiert, wenn Haus und Wallbox zusammen die Grenze überschreiten würden, nie das Haus. Der Hausstrom wird aus dem Netzbezug des Zählers (Modul 3 oder Photovoltaik-Einstellung) geschätzt, gleichmäßig auf drei Phasen verteilt. Bei Einspeisung wird nicht gedrosselt. Standardmäßig aus.
    - **Benachrichtigungen:** Meldungen über die Home-Assistant-App (`notify.*`-Dienste, mehrere möglich) bei **Ladung gestartet**, **Ziel erreicht**, **Ladeplan reicht nicht** (Netzstrom nötig), **Wallbox nicht erreichbar** (nach einer Minute) und **Auto steckt lange ohne Ladung** (nach 12 Stunden, standardmäßig aus). Jede Meldung kommt pro Ladung nur einmal.
  - **Neu in 3.0.2.3: Abfahrtszeit pro Fahrzeug** im Register „Planung“: Jedes Fahrzeug kann sein eigenes Ziel-Ladestand, seine eigene Uhrzeit und eigene Tage (täglich, Mo–Fr, Wochenende) haben. Es gilt das Fahrzeug, das an der Karte erkannt wird. Ohne eigene Abfahrt sowie bei Gästen gilt der Ladeplan unter „Laden“. Liegt das Ziel an einem Tag, der nicht gewählt ist, wird nicht nach Plan geladen, es gilt der normale Modus. Dadurch wirken die Tage jetzt auch in der Planung nach Preis und Sonne.

<img src="docs/vorschau_elektroauto_einstellungen.png" width="480" alt="Elektroauto einrichten">

### Modul 9: Wetter & Warnungen
<p align="center"><img src="docs/vorschau_modul_wetter.png" width="560" alt="Modul 9: Wetter &amp; Warnungen"></p>

Neu in 3.0.2.3: Das Modul läuft jetzt im Hintergrund von Home Assistant, auch wenn das Dashboard geschlossen ist. Eigene Grenzwerte sind keine amtlichen Warnungen, deshalb kann zusätzlich eine amtliche Warnung angezeigt werden.

- **Warnlage jetzt:** Fünf eigene Warnungen, jede einzeln ein- und ausschaltbar: **Sturm** (ab 30 bis 120 km/h, Standard 60), **Gewitter und Hagel**, **Frost** (−10 bis 5 °C), **Hitze** (20 bis 45 °C, standardmäßig aus) und **Starkregen** (standardmäßig aus). Eine Warnung beginnt nach zwei Messungen in Folge (glättet Böen) und endet erst, wenn der Wert zehn Minuten lang deutlich unter der Grenze liegt.
- **Wind:** aus einer eigenen Wetterstation (m/s, mph, Knoten werden in km/h umgerechnet) oder aus der Wetter-Entität, dort auch die Böen.
- **Vorwarnung:** Aus der Stundenvorhersage der Wetter-Entität (`weather.get_forecasts`) bis zu 12 Stunden im Voraus. Die Karte „Nächste Stunden“ markiert Stunden mit erwarteter Warnung orange. Nicht jeder Wetterdienst liefert eine Stundenvorhersage, dann entfällt sie.
- **Amtliche Warnung:** Ist **DWD**, **NINA** oder **MeteoAlarm** in Home Assistant eingerichtet, erscheint die höchste aktuelle Warnung als eigene Kachel und wird gemeldet.
- **Aktionen:** Bei einer Warnung schaltet das Modul, was du auswählst: Rollläden und Markisen (schließen oder öffnen), Schalter, Skripte und Szenen. Eine Aktion läuft einmal beim Beginn. Alle Einstellungen öffnest du über **Einstellungen → Modul 9**. Optional „Danach zurück“: 15 Minuten nach Ende der Warnung wird der vorige Zustand wiederhergestellt, außer eine andere aktive Warnung braucht das Gerät noch.
- **Fenster-Erinnerung:** Meldet bei den gewählten Warnungen (Standard Sturm, Gewitter, Starkregen) offene Fenster aus Modul 1, einmal pro Fenster und Warnung.
- **Benachrichtigung:** Über `notify.*`-Dienste für Beginn, Ende und Vorwarnung, mit „Test senden“. Vorwarnung und amtliche Warnungen werden höchstens einmal pro Stunde je Art gemeldet.
- **Protokoll:** Die letzten Ereignisse (Beginn, Ende, ausgelöste Aktionen, Erinnerungen).

<p align="center"><img src="docs/vorschau_wetter_einstellungen.png" width="460" alt="Modul 9: Einstellungen"></p>

**Quellen und Zuordnung** stellst du unter **Einstellungen → Modul 9** im Abschnitt „Datenquellen“ ein. Die passenden Dienste mit Status stehen im **Store** in der Kategorie „Wetter“:

- Im Store stehen: **Deutscher Wetterdienst (DWD)**, **NINA**, MeteoAlarm, **Met.no**, OpenWeatherMap, Open-Meteo, AccuWeather, Pirate Weather, Tomorrow.io sowie die Wetterstationen Ecowitt, Netatmo und WeatherFlow Tempest. Nicht eingerichtete Dienste lassen sich über „Einrichten“ in Home Assistant hinzufügen.
- Was eingerichtet ist, wird **automatisch erkannt und genutzt**. Bei mehreren Quellen wählst du in den Modul-9-Einstellungen Wetter, Wind, Außentemperatur und amtliche Warnung selbst. Die Wetter-Entität und die Außentemperatur gelten auch für die Wetter-Anzeige im Dashboard.
- Die Benachrichtigungsdienste wählst du im selben Fenster im Bereich „Benachrichtigung“.

**Beta-Hinweis:** Die Vorhersage und die Erkennung der DWD-, NINA- und MeteoAlarm-Entitäten sind noch nicht auf allen Systemen geprüft. Rückmeldungen auf GitHub sind willkommen.

### Modul 10: Garten & Bewässerung
<p align="center"><img src="docs/vorschau_modul_garten.png" width="560" alt="Modul 10: Garten &amp; Bewässerung"></p>

Zeigt, ob es regnet (aus der Wetter-Entität), den aktuellen PV-Überschuss (aus Modul 1) und einen Platz für den Zisternen-Füllstand. **Geplant:** Regenprognose, Zisterne mit Umschalten auf Leitungswasser, Bewässerung bei PV-Überschuss, Zeitplan pro Zone.

### Store (Integrationen)
Der Store zeigt Dienste, die zu deinen Modulen passen (go-e, Tibber, Wetter und Warnungen, Melder), erkennt, was in Home Assistant schon läuft, und führt durch die Einrichtung. Er öffnet über das Store-Symbol im Kopf, den Tab „Store“ in der Modul-Leiste oder Einstellungen → Allgemein. Symbol und Tab kannst du unter „Store anzeigen“ einzeln ausblenden.

### Herstellerprofile (Thermostate)
Strom & Wärme erkennt Thermostate von tado°, Homematic IP, AVM FRITZ!DECT, Shelly TRV, Aqara E1 und Danfoss Ally automatisch. Im Store (Kategorie „Heizung“) und in den Raumeinstellungen stehen die Besonderheiten je Hersteller. Geräte ohne echtes Aus (Homematic IP, Shelly TRV, Danfoss Ally) gehen bei „Thermostat aus“ auf die kleinste Temperatur, Zeitplan-Geräte (tado°, Homematic IP, FRITZ!) schalten nach dem Lüften wieder auf Automatik. Die Hinweise stammen aus Herstellerangaben und Community-Erfahrungen, bitte am eigenen Gerät prüfen.

### Modul 11: Rauch- & Sicherheitsmelder
<p align="center"><img src="docs/vorschau_modul_sicherheit.png" width="560" alt="Modul 11: Rauch- &amp; Sicherheitsmelder"></p>

Findet automatisch alle `binary_sensor` mit der Geräteklasse **Rauch, CO, Gas, Wasser, Hitze oder Sicherheit**, mit Raum, Batteriestand und Testknopf. Bei Alarm kommt sofort eine Meldung aufs Handy, deine Aktionen laufen einmal (Licht, Schalter, Ventil, Rollladen, Skript, Szene), auf Wunsch gibt es Erinnerungen und eine Meldung bei Ende. Dazu Warnung bei schwacher Batterie (Standard unter 20 %), bei nicht erreichbaren Meldern (Standard 60 Minuten) und eine Prüf-Erinnerung (1, 3, 6 oder 12 Monate, Knopf „Geprüft“). Alles läuft im Hintergrund, auch bei geschlossenem Dashboard.

**X-Sense:** Es gibt keine offizielle Home-Assistant-Integration. Mit einer inoffiziellen Community-Integration per HACS (z. B. [Jarnsen/ha-xsense-component_test](https://github.com/Jarnsen/ha-xsense-component_test)) werden die Melder automatisch erkannt. Das läuft über die Cloud und kann nach Home-Assistant-Updates ausfallen. Die Melder alarmieren auch ohne Home Assistant weiter. Die Anleitung steht unter Integrationen.

**Wichtig:** Das Modul ersetzt keine Alarmanlage und keinen Rauchmelder mit eigener Sirene.

### Modul 12: Pool & Sauna
<p align="center"><img src="docs/vorschau_modul_pool.png" width="560" alt="Modul 12: Pool &amp; Sauna"></p>
Zeigt PV-Überschuss und Strompreis aus Modul 1 sowie die Außentemperatur. **Geplant:** Poolpumpe nach Sonne und Überschuss, Pool-Heizung (Wärmepumpe oder Heizstab), Sauna nach Wunschzeit, Kosten und Solaranteil.

### Modul 13: Batteriespeicher-Planung
<p align="center"><img src="docs/vorschau_modul_batterie.png" width="560" alt="Modul 13: Batteriespeicher-Planung"></p>

Zeigt Ladestand und Untergrenze (aus den PV-Einstellungen von Modul 1), den Überschuss und die vier Betriebsarten **PV laden, Halten, Haus aus Batterie, Netzladen**. Der **Zeitplan-Balken ist ein Beispiel** und beschriftet. Es wird nichts an der Batterie geschaltet. **Geplant:** Ladestand-Grenzen je Betriebsart, echter Zeitplan nach Uhrzeit und Wochentag, Netzladen nach Preis (mit Modul 14).

### Modul 14: Dynamischer Stromtarif
<p align="center"><img src="docs/vorschau_modul_stromtarif.png" width="560" alt="Modul 14: Dynamischer Stromtarif"></p>

Liest die **Stundenpreise** aus dem Preis-Sensor, den du in Modul 1 unter „Strompreis“ gewählt hast. Der Sensor muss die Preisliste für heute als Attribut `raw_today`, `prices_today`, `today` oder `prices` liefern (24 Stunden- oder 96 Viertelstunden-Werte, in Euro oder Cent). Die Seite zeigt Preis jetzt, Tagesschnitt, nächste Stunde, einen **Preisverlauf** (grün günstig, rot teuer) und die **günstigsten drei Stunden** zum Laden und Waschen. Ohne Preisliste erscheint ein Hinweis. **Geplant:** Vorschläge für günstige Fenster, Preisalarm, Preise für morgen.

### Modul 15: Wartung & Erinnerungen
<p align="center"><img src="docs/vorschau_modul_wartung.png" width="560" alt="Modul 15: Wartung &amp; Erinnerungen"></p>
Zeigt, wie die Seite aussehen soll: Termine wie Schornsteinfeger, Lüftungsfilter und Heizungswartung mit Restzeit sowie Betriebsstunden mit Fortschritt bis zur nächsten Wartung. **Alle Einträge sind Beispiele.** **Geplant:** eigene Termine mit „Erledigt“-Knopf, Erinnerung aufs Handy, Betriebsstunden aus Sensoren.

### Modul 16: Solar-Prognose (Vorabversion)
<p align="center"><img src="docs/vorschau_modul_prognose.png" width="560" alt="Modul 16: Solar-Prognose"></p>
Zeigt den erwarteten Ertrag für heute und morgen, den bisherigen Ertrag des Tages, einen Stundenverlauf (Heute oder Morgen), die ergiebigste Zeit für Verbraucher und einen Vergleich von Prognose gegen tatsächlichen Ertrag der letzten Tage mit der Abweichung in Prozent.
- **Quelle:** Forecast.Solar (mehrere Anlagen werden addiert) oder ein eigener Sensor mit dem Attribut `wh_period`.
- **Ertrag:** ein Energie-Sensor, entweder nur für den Tag oder als Gesamtzähler. Der Sensor aus Modul 3 lässt sich mit einem Klick übernehmen.
- **Ehrlicher Vergleich:** Die Prognose des Tages wird morgens festgehalten, der Verlauf bleibt 60 Tage gespeichert. Das Modul läuft im Hintergrund und schaltet nichts.
Einrichtung: Einstellungen → Modul 16.

## Allgemeines

### Entitäten auswählen
Überall im Dashboard ersetzt eine Suchauswahl die einfachen Listen. Sie zeigt Name, Entity-ID und aktuellen Wert, passende Entitäten stehen oben mit „Passt“.

### Gerätediagnose
Unter **Allgemein → Diagnose öffnen** siehst du, ob alle Geräte der Regelung melden: Status, zuletzt gemeldet, Ventile (Batterie und ob sie Befehle übernehmen), Fenstersensoren und ein Protokoll fehlgeschlagener Schaltvorgänge. Auf Wunsch kommt eine Benachrichtigung bei Problemen, höchstens einmal in 24 Stunden je Problem.

<p><img src="docs/vorschau_diagnose.png" width="480" alt="Gerätediagnose"> <img src="docs/vorschau_ventile.png" width="480" alt="Ventile"></p>

### Sichern und Wiederherstellen
Unter **Allgemein → Sichern & Wiederherstellen** speicherst du eine JSON-Datei mit Räumen, Heizplänen, Anwesenheit (mit Home-Zone und Personen), Aussehen, allgemeinen Einstellungen und den Einstellungen der Module 2 bis 4 und 8. Beim Einlesen siehst du zuerst eine Zusammenfassung, erst „Wiederherstellen“ ersetzt die aktuellen Einstellungen.

### Update-Hinweis
Administratoren sehen oben ein Banner, wenn auf GitHub eine neuere Version veröffentlicht wurde. Maßgeblich ist die höchste Version unter allen Releases und Tags, auch mit vier Teilen (zum Beispiel `3.0.1` oder `2.9.2.5`). Die Prüfung fragt höchstens einmal pro Stunde ab und lässt sich unter **Allgemein → Updates** ausschalten.

## Entitäten
Pro Raum:

| Entität | Beschreibung |
|---|---|
| Schalter „Fensterregelung aktiv“ | Regelung ein/aus |
| Schalter „Heizplan aktiv“ | Heizplan ein/aus |
| Schalter „Elektroheizer aktiv“ | nur mit eingeschaltetem Elektroheizer: Heizer erlauben oder pausieren |
| Sensor „Heizung pausiert“ (heute, Monat, Jahr, gesamt) | Minuten; Attribute: `gespart_menge`, `einheit`, `brennstoff`, `gespartes_gas_kwh`, bei Erdgas zusätzlich `gespartes_gas_m3` |
| Sensor „Betriebszustand“ | Regelung aktiv, Heizung pausiert, Heizung aus (nur Fenstermeldung) oder Regelung deaktiviert; Attribute u. a. `zuletzt_gelueftet`, `luftfeuchte_sensor`, `heizer` |
| Sensor „Heizplan Solltemperatur“ | aktuelle Vorgabe des Plans, nächste Änderung als Attribut; dazu `sommermodus` und `wetter_anpassung` |

## Hinweise für Entwickler
<details>
<summary><b>WebSocket-Befehle und Änderungen an der Schnittstelle</b></summary>

- Die technische Kennung der Integration bleibt `fenster_heizung` (Ordner, Entitäten, Speicher). Nur der Anzeigename ist „Strom & Wärme“.
- Modul 16: `fenster_heizung/sp_get` (Prognose, Verlauf, Vergleich) und `sp_set` (`cfg` mit `src`, `fc_sensor`, `act`, `mode`, nur Administratoren).
- Modul 9: `fenster_heizung/wx_get` (Einstellungen, Warnlage, Vorhersage, offene Fenster, Protokoll), `wx_set` (`cfg`, nur Administratoren) und `wx_test` (Testmeldung, gibt `sent` zurück).
- Raumeinstellungen im Dashboard: `fenster_heizung/get_options` und `fenster_heizung/set_options` (nur Administratoren). Layout (Farben, Fotos, Symbole, Wetteranzeige): `fenster_heizung/set_layout`. Allgemeines und Sicherung: `get_general`, `set_general`, `get_update`, `get_learning`, `restore`. Diagnose: `get_diag`, `clear_diag`. Module: `get_modules`, `set_modules`, `set_wasser`, `wasser_cmd`. Das Backend prüft alle Werte, Änderungen sind nur für Administratoren erlaubt.
- Version 3.0.2.3: `fenster_heizung/wb_quick` (`kind` = `h1`, `goal`, `sun` oder leer zum Stoppen, nur Administratoren). `wb_get` liefert zusätzlich `quick` (`k`, `until`) und `guard` (`house_a`, `wb_a`, `total_a`, `max_a`, `allowed_a`, `limited`). `wb_set` kennt zusätzlich `guard` (`on`, `maxA` 10 bis 63), `notify` (`start`, `goal`, `plan`, `off`, `long`, `to` mit `notify.*`-Diensten) und pro Fahrzeug `dep` (`on`, `soc`, `time`, `days`). `wb_stats` liefert pro Tag zusätzlich `km`.
- Version 3.0.1: Statistik und Planung: `fenster_heizung/wb_stats` (Tage und Ladevorgänge), `wb_forecast` (Stundenraster mit `pv`, `price`, `level`, `slot_min`, `fs`), Tibber: `tb_get`, `tb_test` mit `token`, `tb_set` mit `token`, `home`, `res` (`h`, `q`, `lvl`). Die Einstellungen der Wallbox haben dafür `planOn`, `planStrat`, `planSrc`, `pvSrc`, `baseW`.
- Version 3.0.1: Wallbox: `fenster_heizung/wb_get` (Status, Einstellungen, Entscheidungen), `wb_set` mit `cfg` (`ip`, `enabled`, `mode` = off/pv/minpv/now, `minA`, `maxA`, `ph`, `startW`, `onMin`, `offMin`, `limit`, `plan`, `planSoc`, `planTime`, `planDays`, `cap`, `batOn`, `batSoc`, `priceOn`, `priceMax`, `lock`, `reset`, `vehicles` mit `id`, `name`, `ids` (Kartennummern), `mode`, `limit`, `guest` mit `mode`, `limit`); `wb_get` liefert zusätzlich `info.cards` und `who` (erkanntes Fahrzeug) und `wb_test` mit `ip`.
- Version 3.0.1: `fenster_heizung/set_presence` kennt zusätzlich `zone` (`lat`, `lon`, `r` in Metern, 30 bis 1000) und `people` (je `person.*`: `label`, `trackers`, `wifi`, `count`, `acc`).
- Version 3.0.0: `get_modules` und `set_modules` kennen zusätzlich `on.ev`, `gs` (`devices` mit `id`, `name`, `ent`, `thr`, `end`, dazu `bat_cost`, `forecast`, `notify`) und `ev` (`brand`, `model`, `body`, `color`, `ent`). `fenster_heizung/gs_get` liefert die Auswertung von Modul 4. Ereignis `geraetestrom_run_finished` mit `device`, `kwh`, `cost`, `saved`, `share`. Die Beta-Module 9 bis 16 (`wx`, `ga`, `sf`, `pl`, `bt`, `dt`, `wa`, `sp`) speichern im Backend nur den Schalter `on.<kürzel>`, standardmäßig `false`. Die Module 5 bis 7 haben noch keine Einstellungen im Backend.
- Version 2.9.2.3: `energy` kennt zusätzlich `ent.pv2`, `ent.pve2` (zweite Solaranlage) sowie die Anzeigenamen `pvn` und `pv2n`.
- Version 2.9.2.1: `energy` kennt zusätzlich `ent.bchg`, `ent.bdis` und `bmode` (`one` oder `two`). Versions-Tags dürfen vier Teile haben.
- Version 2.9.1: `set_modules` nimmt `on.en` und `energy` (`ent` mit `pv`, `grid`, `house`, `bat`, `pve`, `imp`, `exp`, `sign`, `bsign`) an.
- Neue Raumeinstellungen (`humidity_sensor`, `air_hint`, `air_every`, `weather_adj`) erscheinen nur im Dashboard und bleiben beim Speichern im HA-Optionsdialog erhalten.
- Der Bericht braucht Verlaufsdaten im Recorder.

**Neue Version veröffentlichen:** `version` in `custom_components/fenster_heizung/manifest.json` erhöhen, auf GitHub ein Release mit passendem Tag (zum Beispiel `v3.0.1`) erstellen und kurze Aufzählungspunkte in die Beschreibung schreiben. Sie erscheinen im Update-Hinweis des Dashboards. HACS zeigt das Update an.
</details>

## Wichtige Hinweise
- Die Integration schaltet **Heizungsthermostate, Elektroheizer, Heizstäbe und Pumpen**. Prüfe nach der Einrichtung, ob alles wie gewünscht reagiert, und beobachte die ersten Tage. Die Nutzung erfolgt auf eigene Verantwortung.
- Die Regelung von Warmwasser und Heizstab ersetzt keinen Verbrühschutz und keine Sicherheitseinrichtungen der Anlage. Beachte die Vorgaben deines Herstellers.
- **Beta-Module** (5 bis 16) sind unfertig und können sich ändern.
- Energie- und Kostenwerte, die Ersparnis und die Dusch-Schätzung sind **Schätzungen**. Die Energie der Elektroheizer wird aus der Nennleistung berechnet, nicht gemessen. Gerätestrom rechnet aus Messwerten im 20-Sekunden-Takt, die Aufteilung auf Solar, Batterie und Netz ist eine Näherung.
- Sensoren müssen in Home Assistant aktuelle Werte liefern. Ohne Messwerte bleibt die Regelung zurückhaltend: Fällt der PV-Sensor aus, gilt der Überschuss als 0.
- „Strom & Wärme“ ist ein privates Projekt und steht in keiner Verbindung zu Home Assistant oder Nabu Casa.

## Unterstützen
Gefällt dir die Integration? Über [GitHub Sponsors](https://github.com/sponsors/Maddog3010) kannst du die Weiterentwicklung unterstützen. Danke!

Fehler und Wünsche gern als [Issue auf GitHub](https://github.com/Maddog3010/ha-fenster-heizung/issues) melden. Hilfreich sind die Version, eine kurze Beschreibung und der Ausschnitt aus dem Protokoll der Gerätediagnose („Kopieren“).

## Änderungen
Alle Versionen siehe [CHANGELOG.md](CHANGELOG.md).

---
<p align="center"><sub>Made with ❤ by <b>MADDOG3010</b></sub></p>
