<p align="center">
  <img src="docs/banner.png" alt="Strom &amp; Wärme: Heizung, Strom und Haus in Home Assistant">
</p>

# Strom & Wärme

<p align="center">
  <a href="https://hacs.xyz"><img alt="HACS" src="https://img.shields.io/badge/HACS-Custom-41BDF5?logo=homeassistantcommunitystore&logoColor=white"></a>
  <a href="CHANGELOG.md"><img alt="Version" src="https://img.shields.io/badge/Version-3.0.7.1-2dd4bf"></a>
  <img alt="Home Assistant" src="https://img.shields.io/badge/Home%20Assistant-2024.11%2B-18bcf2">
  <a href="https://github.com/sponsors/Maddog3010"><img alt="Sponsor" src="https://img.shields.io/badge/Sponsor-%E2%9D%A4-ea4aaa?logo=github-sponsors&logoColor=white"></a>
</p>

**Ein Dashboard für Heizung, Strom und Haus in Home Assistant.** Es pausiert Heizkörper bei offenem Fenster, heizt nach Plan, nutzt PV-Überschuss für Elektroheizer, Warmwasser und das Auto, zeigt, woher der Strom deiner Geräte kommt, und warnt vor Unwetter und Rauch. Alles steht auf einer eigenen Seite in der Seitenleiste. Du schaltest nur die Module ein, die du brauchst.

> 💗 **Kostenlos, offen und ohne Werbung, und das bleibt so.** Wenn dir die Integration hilft, freue ich mich über dein [Sponsoring](#sponsor-werden).

<p align="center"><img src="docs/vorschau_desktop.png" width="640" alt="Dashboard auf dem Desktop"></p>

<p align="center">
  <a href="#installation">Installation</a> ·
  <a href="#die-module">Module</a> ·
  <a href="#so-bedienst-du-es">Bedienung</a> ·
  <a href="#labs">Labs</a> ·
  <a href="#sponsor-werden">Sponsor werden</a> ·
  <a href="#häufige-fragen">Fragen</a> ·
  <a href="CHANGELOG.md">Änderungen</a>
</p>

## Auf einen Blick

| Bereich | Was du bekommst |
|---|---|
| 🪟 **Fenster & Heizung** | Thermostate pausieren, wenn ein Fenster offen ist. Heizpläne, Anwesenheit, Urlaub, Berichte, Elektroheizer mit PV-Überschuss, Schimmelhinweise. |
| 🚿 **Warmwasser** | Speicher, Zeitplan, Zirkulation, Legionellenschutz, Heizstab bei Überschuss. |
| ⚡ **Energie und Gerätestrom** | Solar, Netz, Batterie, Kosten, Autarkie. Pro Gerät: woher kam der Strom und was hat der Lauf gekostet. |
| 🚗 **Elektroauto** | go-e Charger lokal regeln, nach Sonne, Strompreis und Abfahrtszeit laden, Ladestatistik. |
| 🌦️ **Wetter und Sicherheit** | Eigene Warnungen plus DWD, NINA und MeteoAlarm. Rauch-, Gas- und Wassermelder mit Grundriss und Wartung. |
| 🏠 **Startseite** | Ampel, Wetter, Personen, Alarm, Hinweise und Müllabfuhr auf einen Blick. |
| 📱 **Tablet-Modus** | Große Bedienflächen, Ruhemodus, PIN-Schutz und Display-Steuerung per Bewegungsmelder für Wandtablets. |
| 🧪 **Labs** | Neue Funktionen zum Ausprobieren, ab Werk aus. |
| 💾 **Sicherung** | Einstellungen als Datei sichern oder automatisch auf einen Homeserver legen. |

📖 **Bedienungsanleitung als PDF:** [öffnen](docs/Bedienungsanleitung.pdf) (97 Seiten mit Bildern und nummerierten Bilderklärungen, alle Module 1 bis 19, Datenstand 3.0.6.7, 29.10.2026). 📲 **Tags & Karten mit dem iPhone anlernen:** [Anleitung](docs/Anleitung_Tags_iPhone.pdf) (5 Seiten).

## Installation

**Voraussetzungen:** Home Assistant 2024.11 oder neuer und [HACS](https://hacs.xyz).

1. HACS öffnen, drei Punkte, **Benutzerdefinierte Repositories**.
2. Die Adresse dieses Repositories eintragen, Kategorie **Integration**.
3. „Strom & Wärme“ installieren und Home Assistant **neu starten**.
4. **Einstellungen → Geräte & Dienste → Integration hinzufügen → „Strom & Wärme“**. Pro Raum ein Eintrag, mit Fenstersensoren und Thermostaten.
5. In der Seitenleiste „Strom & Wärme“ öffnen. Der **Einrichtungsassistent** führt in acht Schritten durch Räume, Fenstermeldung, Heizung, Luftfeuchte, PV und Meldungen. Jeder Schritt außer dem ersten lässt sich überspringen.

Die Module 2 bis 4 sind ab Werk an, alle weiteren aus. Eingeschaltet und eingerichtet wird unter **Einstellungen**.

**Update:** über HACS aktualisieren, Home Assistant neu starten, Seite neu laden (Strg+F5). Deine Einstellungen bleiben erhalten. Von 2.x kommend: Gerätestrom ist Teil dieser Integration, die separate Integration „geraetestrom“ wird nicht mehr gebraucht.

## Die Module

### Stufen und Versionen

Jedes Modul trägt im Kopf eine Plakette wie „v1.0 · Build 1“ und eine Stufe. Ein Tipp auf die Plakette zeigt die Stufenleiste, den nächsten Schritt und die letzten Änderungen. Eine Tabelle aller Module steht unter **Einstellungen → System → Versionen**.

| Stufe | Version | Bedeutung |
|---|---|---|
| ⚪ **In Entwicklung** | 0.1 bis 0.4 | Konzept zum Durchklicken mit Beispielwerten. Das Modul steuert noch nichts, alles kann sich ändern. |
| 🟠 **Beta** | 0.5 bis 0.8 | Arbeitet mit echten Daten, zum Testen. Fehler sind möglich. |
| 🔵 **Vorabversion** | 0.9 | Fertig bis auf Feinschliff, Einstellungen bleiben erhalten. |
| 🟢 **Stabil** | ab 1.0 | Geprüft und für den Alltag gedacht. |

Eine neue Funktion hebt die Version um 0.1 und setzt den Build auf 1. Eine Fehlerbehebung erhöht den Build um 1.

### Übersicht

| Nr. | Modul | Stufe | Was es macht |
|---|---|---|---|
| 1 | **Fenster & Heizung** | Stabil 1.0 | Thermostate bei offenem Fenster pausieren, Heizpläne, Anwesenheit und Urlaub, Berichte, Elektroheizer mit PV-Überschuss, Schimmel- und Lüftungshinweise |
| 2 | **Warmwasser & Zirkulation** | Stabil 1.0 | Speicher, Zeitplan, Zirkulationspumpe, Legionellenschutz, Heizstab bei PV-Überschuss |
| 3 | **Energie** | Stabil 1.0 | Solar, Netz, Batterie und Hausverbrauch, Kosten und Autarkie, zweite Solaranlage |
| 4 | **Gerätestrom** | Stabil 1.0 | Pro Gerät Solar-, Batterie- und Netzanteil, Kosten, Ersparnis, Startempfehlung |
| 5 | Lüftung & Raumluft | In Entwicklung 0.1 | Konzept: Luftfeuchte und Lüftungshinweise je Raum, später KWL und CO₂. Reiter „Jetzt“ mit echten Werten |
| 6 | Rollläden & Beschattung | In Entwicklung 0.1 | Konzept: Sonnenstand, Beschattung, später Rollladensteuerung. Reiter „Jetzt“ mit echten Werten |
| 7 | Wärmepumpe | In Entwicklung 0.1 | Konzept: Laufzeit, Takten, Abtauen. Reiter „Jetzt“ mit echten Außenwerten |
| 8 | **Elektroauto & Wallbox** | Beta 0.5 | go-e Charger regeln (Sonne, Sonne + Netz, Voll, Ladeplan), Planung nach Strompreis und PV-Prognose, Ladestatistik |
| 9 | **Wetter & Warnungen** | Beta 0.5 | Sturm, Gewitter, Frost, Hitze und Starkregen mit Vorwarnung, amtliche Warnungen, Aktionen, Meldungen aufs Handy |
| 10 | Garten & Bewässerung | In Entwicklung 0.1 | Konzept: Regen, PV-Überschuss und Zisterne |
| 11 | **Rauch- & Sicherheitsmelder** | Beta 0.5 | Melder, Batterie, Grundriss-Baukasten, Wartung, Abfahrt-Prüfung, Ereignis-Zeitleiste |
| 12 | Pool & Sauna | In Entwicklung 0.1 | Konzept: Pumpe, Heizung und Sauna nach Überschuss und Preis, Sauna mit Sicherheit. Reiter „Jetzt“ |
| 13 | Batteriespeicher-Planung | In Entwicklung 0.1 | Konzept: Betriebsarten, Zeitplan, Ladestand-Grenzen, Netzladen nach Preis. Reiter „Jetzt“ mit echtem Ladestand |
| 14 | **Dynamischer Stromtarif** | Beta 0.5 | Stundenpreise, Preisverlauf, günstigste Zeiten |
| 15 | Wartung & Erinnerungen | In Entwicklung 0.1 | Konzept: Termine und Betriebsstunden, auf Wunsch mit den Daten aus Modul 11 |
| 16 | **Solar-Prognose** | Vorabversion 0.9 | Prognose heute und morgen, Stundenverlauf, Prognose gegen tatsächlichen Ertrag |
| 17 | Müllabfuhr | Lab 0.0.1 | Abholtermine, Tonnen-Ampel, Erinnerung am Vorabend. Erscheint nur bei eingeschaltetem Lab |
| 18 | Licht & Lampen | Lab 0.0.1 | Alle Lampen nach Räumen, schalten, dimmen, Lichtfarbe, Szenenknöpfe. Erscheint nur bei eingeschaltetem Lab |
| 19 | Hausfluss | Beta 0.5, nur Sponsoren | Dein Haus als Fluss-Bild mit Kacheln und animierten Flusslinien |
| – | Start | Stabil | Überblick nach dem Öffnen. Kein eigenes Modul, abschaltbar |

**Konzeptseiten (In Entwicklung):** Die Module 5, 6, 7, 10, 12, 13 und 15 zeigen Entwürfe zum Durchklicken. Reiter mit Bild, nummerierte Pins, die du antippst, ein Fahrplan in Stufen, weitere Ideen und offene Fragen. Alle Zahlen in den Bildern sind **erfundene Beispiele**, die Module schalten nichts. Wo es schon echte Werte gibt, stehen sie im Reiter „Jetzt“.

<p align="center">
  <img src="docs/vorschau_handy_modul1.png" width="200" alt="Modul 1 auf dem Handy">
  <img src="docs/vorschau_handy_modul2.png" width="200" alt="Modul 2 auf dem Handy">
  <img src="docs/vorschau_handy_modul3.png" width="200" alt="Modul 3 auf dem Handy">
  <img src="docs/vorschau_startseite_handy.png" width="200" alt="Startseite auf dem Handy">
</p>

### Die Module kurz erklärt

<details>
<summary><b>1 · Fenster & Heizung</b></summary>

<br>

- **Fensterregelung:** Ist ein Fenster länger als die eingestellte Zeit offen, pausiert die Heizung im Raum. Beim Schließen geht sie wieder an. Herstellerprofile helfen bei gängigen Thermostaten.
- **Heizplan:** Wochenplan je Raum mit Sommermodus und Wetter-Anpassung.
- **Anwesenheit und Urlaub:** Home-Zone, Personen und Urlaubsplanung senken die Temperatur automatisch.
- **Bericht pro Raum:** Heizzeit, Pausen, Ersparnis. Die Ersparnis ist eine Schätzung.
- **Elektroheizer mit PV-Überschuss:** schaltet Heizer stufenweise, wenn Solarstrom übrig ist. Die Energie wird aus der Nennleistung berechnet, nicht gemessen.
- **Raumluft:** Lüftungs- und Schimmelhinweise aus Luftfeuchte und Taupunkt.
- **Brennstoff und Ersparnis:** rechnet gesparte Wärme in kWh, m³ oder Liter um.

<p align="center"><img src="docs/vorschau_modul_fenster_heizung.png" width="560" alt="Modul 1"></p>
</details>

<details>
<summary><b>2 · Warmwasser & Zirkulation</b></summary>

<br>

Zeitplan mit Zieltemperaturen, Zirkulationspumpe, Legionellenschutz und Heizstab bei PV-Überschuss. Die Sicherheitsgrenze (zum Beispiel 65 °C im Speicher) hat immer Vorrang und ersetzt keinen Verbrühschutz.

<p align="center"><img src="docs/vorschau_modul_warmwasser.png" width="560" alt="Modul 2"></p>
</details>

<details>
<summary><b>3 · Energie und 4 · Gerätestrom</b></summary>

<br>

- **Energie:** Solar, Netz, Batterie und Hausverbrauch mit Kosten, Deckung und Autarkie, optional eine zweite Solaranlage.
- **Gerätestrom:** rechnet pro Lauf eines Geräts aus, wie viel aus Solar, Batterie und Netz kam, und was es gekostet hat. Die Aufteilung ist eine Näherung aus Messwerten im 20-Sekunden-Takt.

<p align="center"><img src="docs/vorschau_modul_energie.png" width="400" alt="Modul 3"> <img src="docs/vorschau_modul_geraetestrom.png" width="400" alt="Modul 4"></p>
</details>

<details>
<summary><b>8 · Elektroauto & Wallbox</b> (Beta)</summary>

<br>

go-e Charger lokal im Netzwerk. Betriebsarten: Sonne, Sonne mit Mindeststrom, Voll und Ladeplan. Der Ladeplan berücksichtigt Abfahrtszeit, Ziel-Ladestand, Strompreis und PV-Prognose. Dazu Ladestatistik und Fahrzeugliste.

<p align="center"><img src="docs/vorschau_modul_elektroauto.png" width="560" alt="Modul 8"></p>
</details>

<details>
<summary><b>9 · Wetter & Warnungen</b> (Beta)</summary>

<br>

Eigene Schwellen für Sturm, Gewitter, Frost, Hitze und Starkregen mit Vorwarnung, dazu amtliche Warnungen (DWD, NINA, MeteoAlarm). Aktionen und Meldungen aufs Handy sind einstellbar.

<p align="center"><img src="docs/vorschau_modul_wetter.png" width="560" alt="Modul 9"></p>
</details>

<details>
<summary><b>11 · Rauch- & Sicherheitsmelder</b> (Beta)</summary>

<br>

Vier Reiter: Übersicht, Grundriss, Wartung, Einstellungen.

- **Grundriss-Baukasten:** Räume, Wände, Türen, Fenster, Treppen und Texte zeichnen, Melder platzieren, mehrere Etagen, Hintergrundbild. Bei Alarm leuchtet der Raum.
- **Wartung:** Einbaudatum, Lebensdauer, Prüfintervall, Batterie-Prognose, Einkaufsliste und Jahresprotokoll.
- **Abfahrt-Prüfung:** zeigt offene Fenster, Türen und Geräte, wenn du das Haus verlässt. Kameras und Schlösser werden nur angezeigt.

<p align="center"><img src="docs/vorschau_modul_sicherheit.png" width="560" alt="Modul 11"></p>
</details>

<details>
<summary><b>14 · Stromtarif und 16 · Solar-Prognose</b></summary>

<br>

- **Dynamischer Stromtarif (Beta):** Stundenpreise, Preisverlauf und die günstigsten Zeiten, zum Beispiel aus Tibber.
- **Solar-Prognose (Vorabversion):** Prognose für heute und morgen, Stundenverlauf und Vergleich mit dem tatsächlichen Ertrag. Die Module 2, 3 und 8 nutzen sie.

<p align="center"><img src="docs/vorschau_modul_stromtarif.png" width="400" alt="Modul 14"> <img src="docs/vorschau_modul_prognose.png" width="400" alt="Modul 16"></p>
</details>

<details>
<summary><b>19 · Hausfluss</b> (Beta, nur für Sponsoren)</summary>

<br>

Das Haus in der Mitte, ringsum bis zu acht Kacheln für Solar, Netz, Akku, Auto und Verbraucher. Laufende Punkte zeigen Richtung und Stärke der Leistung. Eigene Namen, Farben, Symbole und Sensoren pro Kachel, mobil und am Desktop.
</details>

Die ausführliche Beschreibung jedes Moduls mit Bildern und Bilderklärungen steht in der [Bedienungsanleitung](docs/Bedienungsanleitung.pdf) (Installation, Oberfläche, jedes Modul einzeln, Tablet-Modus, Einstellungen, Labs, Sponsor, Sichern).

## So bedienst du es

<details>
<summary><b>Startseite</b></summary>

<br>

<p align="center"><img src="docs/vorschau_startseite.png" width="760" alt="Startseite"></p>

Der Tab **Start** steht ganz links. Ein Direktlink mit `?modul=<Kennung>` (zum Beispiel `?modul=mu`) öffnet stattdessen ein Modul. Unter **Einstellungen** stellst du die Startseite aus oder auf „Letztes Modul“.

- **Zuhause:** Ampel mit einer Kachel je aktivem Modul. Ein Tipp öffnet das Modul.
- **Wetter**, **Personen** (wer zu Hause ist, sonst die Entfernung) und **Alarm** (Zustand deiner Alarmanlage; Schalten ist ab Werk aus und wird immer bestätigt).
- **Hinweise:** Fenster zu lange offen, Probleme im Warmwasser, schwache Batterien, Müllabfuhr, Alarm.
- Karten ohne Datenquelle erscheinen nicht. Mit **Anpassen** verschiebst du Karten und blendest sie aus, die Anordnung gilt für alle Nutzer.
- **Start-Bubbles:** ein [Lab](#labs) mit bis zu acht runden Kurzinfos oben.

<p align="center"><img src="docs/vorschau_startseite_anpassen.png" width="520" alt="Anpassen"> <img src="docs/vorschau_startseite_bubbles.png" width="520" alt="Bubbles"></p>
</details>

<details>
<summary><b>Tablet-Modus</b></summary>

<br>

<p align="center"><img src="docs/vorschau_tablet.png" width="760" alt="Tablet-Modus"></p>

Für Tablets an der Wand oder auf dem Tisch: keine Tab-Leiste, große Knöpfe, Kopfzeile mit Uhr, untere Leiste mit den aktiven Modulen. Die Einstellungen gelten nur für das jeweilige Gerät.

- **Einschalten:** Knopf „Tablet-Modus“ im Kopf (ab 600 px Breite), Hinweis beim ersten Öffnen, Einstellung „Automatisch“ für Touchgeräte, oder Direktlink `?tablet=1` (in Fully Kiosk als Start-URL). `?tablet=0` schaltet ihn wieder aus.
- **PIN:** sechs Ziffern. Das Schloss oben rechts öffnet nach der PIN die Einstellungen. Nach fünf falschen Eingaben ist die Eingabe 60 Sekunden gesperrt. Die PIN schützt vor Versehen, nicht vor Fachleuten.
- **Fenster & Heizung:** Soll-Temperatur pro Raum mit großen −/+-Knöpfen. Bei offenem Fenster sind sie gesperrt.
- **Zurück zu Start** nach 2, 5 oder 15 Minuten ohne Berührung. **Ruhemodus** nach 5, 15 oder 30 Minuten mit dunkler Uhr, Wetter, Alarm und Personen. Eine Warnung weckt auf.
- **Bewegungsmelder und Display:** Bei Bewegung wird der Display-Schalter eingeschaltet (bei Fully der Schalter „Screen“), nach 10 oder 30 Minuten ohne Bewegung wieder aus.

| | Fully Kiosk (Android) | HA-App Android | HA-App iPad/iPhone |
|---|---|---|---|
| Ruhemodus, Aufwachen per Bewegung | ja | ja | ja |
| Display einschalten bei Bewegung | ja | ja | nein |
| Display ausschalten | ja | teilweise | nein |

<p align="center"><img src="docs/vorschau_tablet_pin.png" width="380" alt="PIN"> <img src="docs/vorschau_tablet_hoch.png" width="200" alt="Hochformat"> <img src="docs/vorschau_tablet_ruhe.png" width="380" alt="Ruhemodus"></p>
</details>

<details>
<summary><b>Einstellungen, Module und Store</b></summary>

<br>

<p align="center"><img src="docs/vorschau_einstellungen.png" width="440" alt="Einstellungen"> <img src="docs/vorschau_beta_module.png" width="440" alt="Module verwalten"></p>

Der Knopf **Einstellungen** oben rechts öffnet in jedem Modul dieselbe Seite:

- **Übersicht** mit aktiven Modulen, Räumen, Personen und Version
- **Allgemein:** Einrichtungsassistent, Store & Integrationen, Labs, Personen & Standort, Darstellung
- **Meine Module** und **Weitere Module:** eingeschaltete Module mit Stufe, ausgeschaltete als kleine Felder (ein Tipp schaltet ein)
- **System:** Sichern & Wiederherstellen, Diagnose, Versionen, Module verwalten

Unter **Module verwalten** schaltest du jedes Modul ein oder aus (Modul 1 ist immer an). Die Einstellung gilt für alle Nutzer. Der **Store** zeigt Dienste, die zu deinen Modulen passen (go-e, Tibber, Wetter, Melder, Thermostate), erkennt, was schon läuft, und führt durch die Einrichtung. Du öffnest ihn über das Store-Symbol im Kopf oder den Tab „Store“.
</details>

<details>
<summary><b>Sichern und Wiederherstellen</b></summary>

<br>

Unter **System → Sichern & Wiederherstellen** speicherst du eine JSON-Datei mit Räumen, Heizplänen, Anwesenheit, Aussehen, allgemeinen Einstellungen und den Einstellungen der Module. Beim Einlesen siehst du zuerst eine Zusammenfassung, erst „Wiederherstellen“ übernimmt etwas.

- **Automatisch auf einen Homeserver:** auf Wunsch nach WebDAV (Nextcloud, Synology, QNAP, FRITZ!NAS), auf eine SMB-Freigabe oder in einen Ordner, bei Änderung oder zu festen Zeiten.
- **Interne Kopien:** Vor Änderungen legt die Integration Kopien aller Einstellungen an. Fehlt eine Datei beim Start oder ist sie unlesbar, wird die Kopie zurückgeholt. Die Seite speichert erst, wenn die Daten vom Server geladen sind, damit keine Standardwerte etwas überschreiben.
</details>

<details>
<summary><b>Gerätediagnose, Entitäten und Update-Hinweis</b></summary>

<br>

- **Diagnose** (System → Diagnose): ob alle Geräte der Regelung melden, Ventile (Batterie, Befehle), Fenstersensoren und ein Protokoll fehlgeschlagener Schaltvorgänge, auf Wunsch mit Benachrichtigung.
- **Entitäten wählen:** Eine Suchauswahl zeigt Name, Entity-ID und Wert, passende stehen oben mit „Passt“.
- **Update-Hinweis:** Administratoren sehen ein Banner, wenn auf GitHub eine neuere Version erschienen ist (Prüfung höchstens einmal pro Stunde, abschaltbar).
- **Pro Raum** gibt es Schalter für Fensterregelung, Heizplan und Elektroheizer sowie Sensoren für pausierte Heizzeit (heute, Monat, Jahr, gesamt), Betriebszustand und Heizplan-Solltemperatur.
</details>

## Labs

Labs sind neue Funktionen, die schon arbeiten, aber noch nicht überall erprobt sind. Sie sind **ab Werk aus**. Du schaltest sie einzeln ein (Kolben-Symbol im Kopf, Tab „Labs“ oder Einstellungen → Allgemein → Labs). Jede Karte hat eine Infoseite mit Bildern, „Was du bekommst“, „So wird gerechnet“ und den Voraussetzungen, dazu „Alle Labs aus“ als Notausschalter. Im Modul erscheint ein Lab als Karte mit gestricheltem violettem Rand und dem Zeichen „Labs“. Ausgeschaltet verschwindet es wieder, die Werte bleiben gespeichert.

<p align="center"><img src="docs/vorschau_labs.png" width="460" alt="Labs-Seite"> <img src="docs/vorschau_labs_info.png" width="460" alt="Infoseite"></p>

**Zwei Arten:** *Nur Anzeige* (grün) zeigt etwas an. *Schaltet Geräte* (orange) greift ein, davor erscheint ein Bestätigungsfenster. Diese Labs laufen im Backend, auch bei geschlossenem Dashboard. **Fenster auf, Abwesend und Urlaub, die Sicherheitsgrenzen der Module und die Hausanschluss-Regeln haben immer Vorrang.** Fehlt ein Messwert, ändert ein Lab nichts. Beobachte die ersten Tage, ob alles wie gewünscht reagiert.

| Lab | Modul | Art | Was es macht |
|---|---|---|---|
| Bester Lüftungszeitpunkt | 1 | Anzeige | Pro Raum, ob Lüften jetzt lohnt (absolute Feuchte innen und außen) |
| Autarkie-Prognose | 3 | Anzeige | Wie viel Prozent des Tagesverbrauchs heute voraussichtlich aus Solar kommen |
| Spartipp der Woche | 3 | Anzeige | Gerät mit dem größten Netzbezug, beste Sonnenzeit, mögliche Ersparnis |
| Wäsche-Wetter | 9 | Anzeige | Ampel, ob Wäsche draußen trocknet |
| Lernfaktor für die Prognose | 16 | Anzeige | Gelernte Abweichung der Anlage und korrigierte Prognose für heute |
| Start-Bubbles | Start | Anzeige | Bis zu acht runde Kurzinfos oben auf der Startseite |
| Smart Vorheizen | 1 | Schaltet | Startet den Heizplan früher, wenn der Raum zu kalt ist (gelernte Aufheizzeit) |
| Duschzeiten lernen | 2 | Schaltet | Lernt typische Duschzeiten und heizt davor vor |
| Legionellenschutz nach Sonne | 2 | Schaltet | Legt den Schutz auf Tage mit guter Prognose |
| Ladeziel nach Kalender | 8 | Schaltet | Hebt das Ladeziel an, wenn ein langer Termin ansteht |
| Müllabfuhr | 17 | Schaltet | Schaltet Modul 17 frei: Abend-Erinnerung, Ansage, Licht in Tonnenfarbe |
| Licht & Lampen | 18 | Schaltet | Schaltet Modul 18 frei: Lampen nach Räumen, Szenenknöpfe, „Alle aus“ |
| Tags & Karten | übergreifend | Schaltet | RFID-Karten und NFC-Sticker lösen feste Aktionen aus, mit Personen- und Zeitfilter und Protokoll |

Neue Labs erscheinen für Sponsoren auf Wunsch zuerst als Vorabversion. Ideen und Fehler gern als [Issue auf GitHub](https://github.com/Maddog3010/ha-fenster-heizung/issues).

## Sponsor werden

„Strom & Wärme“ ist ein privates Projekt, das in meiner Freizeit entsteht. Es ist und bleibt **kostenlos und offen**. Wer die Arbeit unterstützt, hilft mir, Fehler zu beheben, neue Module zu bauen und alles mit echten Geräten zu testen.

Als Dank gibt es einen **Sponsor-Schlüssel** mit Extras, die schön, aber nie nötig sind. **Es wird nichts gesperrt, was ohne Schlüssel schon da war.**

| Extra | Was es macht |
|---|---|
| 💗 **Abzeichen** | Ein Herz mit „Sponsor“ im Kopf. Lässt sich ausblenden. |
| 🎨 **Farbverläufe** | „Meer“ und „Abend“ als Verlauf hinter dem Kopf. |
| 🕒 **Uhr-Stile** | „Dünn“, „Kräftig“ und „Digital“ für die Uhr im Ruhemodus. |
| 🧪 **Vorabversionen** | Neue Labs erscheinen für Sponsoren ein bis zwei Wochen früher. |
| 🌊 **Modul 19 „Hausfluss“** | Das Fluss-Bild deines Hauses, dauerhaft nur für Sponsoren. |

<p align="center">
  <img src="docs/vorschau_sponsor_gesperrt.png" width="440" alt="Sponsor-Bereich vor dem Einlösen">
  <img src="docs/vorschau_sponsor_bereich.png" width="440" alt="Sponsor-Bereich mit Schlüssel">
</p>

**So geht es:**
1. Auf [GitHub Sponsors](https://github.com/sponsors/Maddog3010) Sponsor werden.
2. Schick mir nach dem Sponsoring kurz eine E-Mail mit deinem GitHub-Namen an [00.verkauf_kompass@icloud.com](mailto:00.verkauf_kompass@icloud.com). Du bekommst deinen Schlüssel per E-Mail, gültig für ein Jahr.
3. Im Dashboard unter **Einstellungen → Sponsor-Bereich** (oder über das Herz im Kopf) den Schlüssel einfügen. Ein Administrator genügt, der Schlüssel gilt dann für alle Geräte und Benutzer.

Der Schlüssel trägt deinen Namen, ein Ablaufdatum und eine digitale Unterschrift (Ed25519), die die Integration selbst prüft. **Es gibt keinen Server und kein Konto, und es werden keine Daten von dir gesendet.** Läuft ein Schlüssel ab, gehen nur die Extras aus, deine Einstellungen bleiben gespeichert. Weil der Quellcode offen ist, ließe sich jede Sperre umgehen. Deshalb gibt es nur Zusätzliches als Extra und keine Funktion, die du zum Arbeiten brauchst.

## Wichtige Hinweise

- Die Integration schaltet **Heizungsthermostate, Elektroheizer, Heizstäbe, Pumpen und auf Wunsch die Wallbox**. Prüfe nach der Einrichtung, ob alles wie gewünscht reagiert, und beobachte die ersten Tage. Die Nutzung erfolgt auf eigene Verantwortung.
- Die Regelung von Warmwasser und Heizstab ersetzt keinen Verbrühschutz und keine Sicherheitseinrichtungen der Anlage. Beachte die Vorgaben deines Herstellers.
- Module der Stufen In Entwicklung, Beta und Vorabversion können sich ändern. Module „In Entwicklung“ zeigen nur Beispielwerte und schalten nichts. Labs sind Experimente und können sich ändern oder entfallen.
- Energie- und Kostenwerte, die Ersparnis, Dusch-Schätzungen und Prognosen sind **Schätzungen**.
- Sensoren müssen in Home Assistant aktuelle Werte liefern. Ohne Messwerte bleibt die Regelung zurückhaltend: Fällt der PV-Sensor aus, gilt der Überschuss als 0.
- Der Bericht braucht Verlaufsdaten im Recorder.
- „Strom & Wärme“ ist ein privates Projekt und steht in keiner Verbindung zu Home Assistant oder Nabu Casa.

## Häufige Fragen

**Kostet „Strom & Wärme“ etwas?**
Nein. Die Integration ist kostenlos und offen. Ein Sponsoring ist freiwillig.

**Brauche ich einen Sponsor-Schlüssel, um etwas zu nutzen?**
Nein. Alle Module außer Modul 19, alle Labs und der Tablet-Modus funktionieren ohne Schlüssel. Der Schlüssel bringt nur Extras, siehe [Sponsor werden](#sponsor-werden).

**Warum steuert mein Modul 12 (oder 5, 6, 7, 10, 13, 15) nichts?**
Diese Module sind „In Entwicklung“. Sie zeigen Konzepte zum Durchklicken mit Beispielwerten. Der Reiter „Jetzt“ zeigt, wo es schon geht, die echten Werte aus deinen Entitäten.

**Gehen meine Einstellungen bei einem Update verloren?**
Nein. Sie bleiben erhalten, und die Integration legt zusätzlich interne Kopien an. Eine Sicherung auf deinen Homeserver ist unter „Sichern & Wiederherstellen“ einstellbar.

**Werden Daten an einen Server geschickt?**
Der Sponsor-Schlüssel wird lokal geprüft. Einmal am Tag lädt die Integration die öffentliche Sperrliste von GitHub. Standortdaten werden nicht als Verlauf gespeichert. Für Wetter, Strompreis oder Tibber werden nur die Dienste angefragt, die du selbst einrichtest.

**Funktioniert der Tablet-Modus mit Fully Kiosk und der HA-App?**
Ja. Ruhemodus und Aufwachen per Bewegung gehen überall. Das Display per Bewegungsmelder einschalten geht mit Fully Kiosk und der Android-App, am iPad nicht.

**Wo melde ich Fehler und Wünsche?**
Als [Issue auf GitHub](https://github.com/Maddog3010/ha-fenster-heizung/issues). Hilfreich sind die Version, eine kurze Beschreibung und der Ausschnitt aus dem Protokoll der Gerätediagnose („Kopieren“).

## Für Entwickler

- Die technische Kennung bleibt `fenster_heizung` (Ordner, Entitäten, Speicher). Nur der Anzeigename ist „Strom & Wärme“.
- Das Dashboard `custom_components/fenster_heizung/frontend/panel.js` wird aus den Quelldateien in `frontend-src/parts` gebaut: `python3 frontend-src/build.py` (mit `--check` prüfen, ob die Datei aktuell ist).
- Die Module 5, 6, 7, 10, 12, 13 und 15 speichern im Backend nur den Schalter `on.<kürzel>` (Standard `false`).
- Die WebSocket-Befehle je Modul (`get_options`, `set_layout`, `wb_get`, `sp_get`, `sf_get`, `wx_get`, `mu_get`, `tm_*`, `ef_get` und weitere) stehen im Quelltext in `custom_components/fenster_heizung/`. Schreibende Befehle sind Administratoren vorbehalten.
- **Neue Version veröffentlichen:** `version` in `manifest.json` erhöhen, auf GitHub ein Release mit passendem Tag (zum Beispiel `v3.0.6.7`) erstellen und kurze Aufzählungspunkte in die Beschreibung schreiben. Sie erscheinen im Update-Hinweis des Dashboards.

---
<p align="center"><a href="https://github.com/sponsors/Maddog3010"><img src="docs/sponsor_banner.png" alt="Sponsor werden" width="70%"></a></p>
<p align="center"><sub>Made with ❤ by <b>MADDOG3010</b> · „Strom &amp; Wärme“ ist ein privates Projekt und steht in keiner Verbindung zu Home Assistant oder Nabu Casa.</sub></p>
