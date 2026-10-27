<img src="custom_components/fenster_heizung/brand/icon.png" width="96" alt="Fenster &amp; Heizung">

# Fenster & Heizung

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-%E2%9D%A4-ea4aaa?logo=github-sponsors&logoColor=white)](https://github.com/sponsors/maddog3010)

Home-Assistant-Integration (HACS): Pausiert Heizungsthermostate, solange Fenster offen sind, führt einen Heizplan aus, kennt Anwesenheit und Urlaub und bringt ein eigenes Dashboard mit Tagesberichten pro Raum mit. Aktuelle Version: **2.9.1**.

## Inhalt
- [Dashboard](#dashboard)
- [Räume und Gruppen](#räume-und-gruppen)
- [Bericht pro Raum](#bericht-pro-raum)
- [Heizplan](#heizplan)
- [Raumeinstellungen im Dashboard](#raumeinstellungen-im-dashboard)
- [Darstellung: Farben, Symbole, Fotos, Wetter](#darstellung-farben-symbole-fotos-wetter)
- [„Warum?“ pro Raum](#warum-pro-raum)
- [Raumluft: Lüften und Schimmel](#raumluft-lüften-und-schimmel)
- [Elektroheizer mit PV-Überschuss](#elektroheizer-mit-pv-überschuss)
- [Module](#module)
- [Modul 2: Warmwasser und Zirkulation](#modul-2-warmwasser-und-zirkulation)
- [Modul 3: Energie-Übersicht](#modul-3-energie-übersicht)
- [Entitäten auswählen](#entitäten-auswählen)
- [Gerätediagnose](#gerätediagnose)
- [Einrichtungsassistent](#einrichtungsassistent)
- [Wetter-Anpassung und Sommermodus](#wetter-anpassung-und-sommermodus)
- [Sichern und Wiederherstellen](#sichern-und-wiederherstellen)
- [Meine Ansicht](#meine-ansicht)
- [Update-Hinweis](#update-hinweis)
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

- Kopfkarte mit der heute gesparten Menge (je nach Brennstoff), Außentemperatur und Wetter sowie Kacheln für Heute, Monat, Jahr und Gesamt
- Balkendiagramm der Pausenzeit der letzten 14 Tage, nach Räumen gestapelt
- Raumkarten mit Status, Fenster, Heizung, Heizplan und 7-Tage-Verlauf, umschaltbar zwischen **Detail** und **Kompakt**
- Karte „Anwesenheit & Urlaub“
- Hell und Dunkel folgen dem Design von Home Assistant, das Layout passt sich Handy und Desktop an

### Anpassen (nur Administratoren)
Mit dem Stift oben rechts lassen sich die Bereiche und die Raumkarten an den Griffen verschieben. Ein Tipp auf das Raumsymbol öffnet die Auswahl mit 16 Symbolen. Die Anordnung wird gespeichert und gilt für alle Nutzer.

<img src="docs/vorschau_verschieben.png" width="240" alt="Verschieben"> <img src="docs/vorschau_symbole.png" width="240" alt="Symbolauswahl">

### Ansicht: Detail oder Kompakt
Oben im Raumbereich schaltest du zwischen „Detail“ (Karten) und „Kompakt“ (eine Zeile pro Raum) um. Die Kompaktansicht ist praktisch bei vielen Räumen, etwa sechs auf dem Tablet: Raumname, Fenster, Ist- und Zieltemperatur, Heizplan und Pausenzeit stehen in einer Zeile, Knöpfe für Bericht, „Warum?“, Heizplan und Einstellungen sitzen rechts. Die Auswahl wird pro Browser gemerkt.

<img src="docs/vorschau_kompakt_handy.png" width="240" alt="Kompaktansicht auf dem Handy"> <img src="docs/vorschau_kompakt.png" width="480" alt="Kompaktansicht auf dem Desktop">

![Detailansicht](docs/vorschau_detail.png)

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

Ganz oben zeigt der Bericht die **gelernte Aufheizzeit**: Die Integration erkennt jede Aufheizphase (mindestens 1 K unter dem Ziel bis zum Erreichen) und merkt sich die Minuten pro Kelvin, getrennt nach Frost, kühl und mild. Ab drei Phasen erscheint die Zeit von 17 auf 21 °C mit einem Tipp, Heizplan-Einträge entsprechend früher zu legen. Phasen mit offenem Fenster oder geänderter Zieltemperatur zählen nicht.

<img src="docs/vorschau_bericht_aufheiz.png" width="480" alt="Gelernte Aufheizzeit im Bericht">

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

**Wochenansicht:** Im Editor zeigen sieben Balken untereinander alle Wochentage auf einen Blick, jeweils mit den Temperaturstufen über 24 Stunden. Der Tag, den du gerade bearbeitest, ist hervorgehoben, die übrigen sind abgedunkelt. Ein Tipp auf einen Balken wählt den Tag.

<img src="docs/vorschau_woche_handy.png" width="240" alt="Wochenansicht auf dem Handy"> <img src="docs/vorschau_woche.png" width="480" alt="Wochenansicht auf dem Desktop">

- Pro Schaltpunkt wählst du mehrere Tage, die Uhrzeit und die Temperatur. Kürzel: „Mo–Fr“, „Sa–So“, „Alle Tage“.
- Zu jedem Schaltpunkt wird die Zieltemperatur an die Thermostate gesendet. Ausgeschaltete Thermostate schaltet der Plan je nach Einstellung ein: „Nein“, „Heizen“ oder „Automatik“. Andere Modi (z. B. cool) bleiben unberührt.
- Dazwischen bleibt eine manuelle Änderung bis zum nächsten Schaltpunkt bestehen.
- Während ein Fenster die Heizung pausiert, greift der Plan nicht. Nach dem Schließen gilt die Temperatur, die dann laut Plan dran ist.
- Steht der eigene Heizungs-Sensor auf „Heizung aus“, wird der Plan nicht ausgeführt.
- Der Schalter „Heizplan aktiv“ und der Sensor „Heizplan Solltemperatur“ (mit nächster Änderung als Attribut) lassen sich in Automationen verwenden.

## Raumeinstellungen im Dashboard
Das Zahnrad auf jeder Raumkarte (nur Administratoren) öffnet die Einrichtung des Raums direkt im Dashboard, ohne Umweg über die Home-Assistant-Einstellungen. Fünf aufklappbare Abschnitte:

- **Geräte:** Fenstersensoren und Thermostate (als Chips hinzufügen und entfernen)
- **Regelung:** Verzögerungen, Aktion (ausschalten oder Absenktemperatur), Absenktemperatur, Heizungs-Sensor
- **Bedingungen:** Sperrzeit und Außentemperatur
- **Erinnerung:** Benachrichtigungsdienste (mehrere möglich), Titel, Text, Wartezeit
- **Energie:** Brennstoff, Energie pro Einheit, JAZ/COP, Heizleistung, Fläche, Heizlast, Auslegungstemperatur

<img src="docs/vorschau_raumeinstellungen_handy.png" width="240" alt="Raumeinstellungen auf dem Handy"> <img src="docs/vorschau_raumeinstellungen.png" width="480" alt="Raumeinstellungen auf dem Desktop">

Eingaben werden vor dem Speichern geprüft; Fehler erscheinen direkt im Dialog. Nach dem Speichern lädt die Integration den Raum neu. „Raum hinzufügen“ und „Raum entfernen“ öffnen die Integrationsseite von Home Assistant, dort werden Einträge angelegt und gelöscht.

<img src="docs/vorschau_raumeinstellungen_bedingungen.png" width="480" alt="Bedingungen">

## Darstellung: Farben, Symbole, Fotos, Wetter
Alles hier stellt ein Administrator im Dashboard ein (Stift „Anpassen“) und gilt für alle Nutzer.

### Akzentfarbe
Unter **Darstellung** wählst du die Akzentfarbe aus 8 Farben oder über „Eigene“. Sie färbt Kopfkarte, Knöpfe, Schalter, Links und Diagramme. Die Textfarbe auf Knöpfen passt sich automatisch an, damit sie lesbar bleibt.

<img src="docs/vorschau_darstellung.png" width="480" alt="Darstellung: Akzentfarbe und Wetter">

### Raumfarben, Symbole und Foto
Im Anpassen-Modus öffnet ein Tipp auf das Raumsymbol den Dialog „Raum anpassen“:

- **Symbol:** 39 farbige Symbole in fünf Gruppen (Wohnen, Küche & Haushalt, Schlafen & Bad, Arbeit & Hobby, Haus & Außen). Die Namen stehen als Tooltip an den Symbolen. „Symbol automatisch nach Raumname“ erkennt Begriffe wie Ankleide, Keller, Garage, Dusche oder Fitness.
- **Farbe:** 12 Farben, „Eigene“ oder „Automatisch“. Die Raumfarbe rahmt das Symbol und gilt im Pausen-Diagramm und in der Legende.
- **Foto:** Optionales Raumfoto als abgedunkelter Kartenhintergrund, in Detail- und Kompaktansicht. Das Bild wird im Browser auf etwa 560 px verkleinert und höchstens ca. 110 KB groß gespeichert. Höchstens 12 Fotos.

<img src="docs/vorschau_symbole.png" width="480" alt="Symbolauswahl"> <img src="docs/vorschau_symbole_handy.png" width="240" alt="Symbolauswahl auf dem Handy">

<img src="docs/vorschau_raum_anpassen.png" width="480" alt="Raum anpassen mit Foto">

![Raumkarten mit Foto und Raumfarben](docs/vorschau_fotos.png)

<img src="docs/vorschau_fotos_handy.png" width="240" alt="Fotos auf dem Handy"> <img src="docs/vorschau_fotos_kompakt.png" width="480" alt="Kompaktansicht mit Foto">

### Kopfkarten-Hintergrund
Unter **Darstellung** bekommt die Kopfkarte einen Hintergrund. Wahl zwischen **Standard**, **Tageszeit** (Nacht, Sonnenaufgang, Tag, Sonnenuntergang), **Jahreszeit** (Frühling bis Winter) und **Wetter** (sonnig, bewölkt, Regen, Starkregen, Schnee, Nebel, Gewitter, klare Nacht).

- Die Tageszeit kommt von `sun.sun` (Sonnenhöhe), ohne Sonnen-Entität von der Uhr. Die Jahreszeit folgt dem Monat, auf der Südhalbkugel umgekehrt. Das Wetter kommt aus der gewählten Wetter-Entität, nachts etwas abgedunkelt.
- Jede Szene lässt sich durch ein **eigenes Foto** ersetzen (höchstens 12, im Browser verkleinert). Das Foto wird abgedunkelt, damit die Schrift lesbar bleibt.

<img src="docs/vorschau_kopf_hintergruende.png" width="480" alt="Kopfkarten-Hintergrund wählen"> <img src="docs/vorschau_kopf_wetter.png" width="480" alt="Kopfkarte bei Regen in der Nacht">

<img src="docs/vorschau_kopf_tageszeit.png" width="480" alt="Kopfkarte bei Sonnenuntergang">

### Außentemperatur und Wetter
Die Kopfkarte zeigt unter dem Datum Wettersymbol, Außentemperatur, Zustand sowie Luftfeuchte und Wind, soweit deine Wetter-Entität sie liefert.

- Die Wetter-Entität wird automatisch gefunden (erste `weather.*`). Unter **Darstellung** wählst du eine andere.
- Optional nimmst du einen eigenen Außentemperatur-Sensor, sonst gilt die Temperatur des Wetterdienstes.
- Mit dem Schalter lässt sich die Anzeige ausblenden.

<img src="docs/vorschau_wetter_handy.png" width="240" alt="Wetter auf dem Handy"> <img src="docs/vorschau_wetter.png" width="480" alt="Wetter in der Kopfkarte">

## Raumluft: Lüften und Schimmel
Hat ein Raum einen Luftfeuchte-Sensor, zeigt die Karte **Luftfeuchte**, **Taupunkt** und **Schimmelrisiko** (gering, erhöht, hoch) mit einer Empfehlung.

- Der Sensor wird unter **Raumeinstellungen › Raumluft** gewählt. Dort lassen sich die Hinweise auch abschalten.
- Das Schimmelrisiko beruht auf der Luftfeuchte an der kalten Wandoberfläche (Außenwand). Die Rechnung nutzt Raumtemperatur, Außentemperatur und Luftfeuchte. Es ist eine Schätzung, kein Messwert.
- Die Empfehlung nennt die Dauer zum Stoßlüften, abhängig von der Außentemperatur. Ist die Außenluft feuchter als die Raumluft, rät die Karte vom Lüften ab.
- Bei offenem Fenster läuft ein **Countdown** mit Fortschrittsbalken. Danach heißt es „genug gelüftet, Fenster schließen“.
- In der Kompaktliste steht ein kleiner Chip unter dem Raumnamen.

<img src="docs/vorschau_handy_luft.png" width="240" alt="Raumluft auf dem Handy"> <img src="docs/vorschau_luft_detail.png" width="480" alt="Raumluft auf den Karten">

### Ohne Luftfeuchte-Sensor
Auch ohne Sensor bleibt die Karte nützlich. Sie zeigt dann:

- **Gelüftet vor X Std.** und eine Erinnerung, wenn länger nicht gelüftet wurde (Standard 8 Std., einstellbar unter **Raumeinstellungen › Raumluft**, 0 = aus). Den Zeitpunkt des letzten Schließens speichert die Integration selbst. Er bleibt nach einem Neustart erhalten. Nur beim allerersten Start liest das Dashboard ihn einmalig aus dem Verlauf (Recorder, bis zu 9 Tage).
- **Wandtemperatur** der Außenwand (geschätzt aus Raum- und Außentemperatur) und **kritische Feuchte**: ab dieser Luftfeuchte droht Schimmel an der Wand. Bei kalten Wänden steht dazu ein Hinweis, die Luftfeuchte niedrig zu halten.
- Die **Lüftungsempfehlung mit Countdown** bei offenem Fenster.
- Einen Link, der direkt zur Sensor-Auswahl führt.

Luftfeuchte, Taupunkt und das Schimmelrisiko (gering, erhöht, hoch) brauchen einen Sensor.

<img src="docs/vorschau_handy_ohne.png" width="240" alt="Raumluft ohne Sensor auf dem Handy"> <img src="docs/vorschau_ohne_gemischt.png" width="480" alt="Karten mit und ohne Sensor">

## Elektroheizer mit PV-Überschuss
In jedem Raum kann ein elektrischer Heizer (Heizlüfter, Infrarot, Klima-Heizgerät) eingerichtet werden. Er heizt nur, wenn genug PV-Überschuss da ist. Einschalten kannst du ihn in den Raumeinstellungen unter „Elektroheizer“ (nur Administratoren). Der Block „PV-Heizer“ im Dashboard erscheint nur, solange mindestens ein Heizer eingeschaltet ist.

![PV-Heizer im Dashboard](docs/vorschau_pv_block.png)

**Einrichtung**
1. Unter **Allgemein → PV-Überschuss für Elektroheizer** den Sensor für die Netzeinspeisung wählen. Er muss die Leistung am Netzanschluss in W oder kW liefern. Mit der Auswahl „Einspeisung positiv“ oder „Netzbezug positiv“ stellst du das Vorzeichen passend ein.
2. Dort außerdem Reserve, Einschaltverzögerung, Mindestlaufzeit, optional den Batterie-Ladestand sowie den Strompreis und die Einspeisevergütung einstellen. Der Strompreis lässt sich als Festpreis (mit zwei Nachkommastellen, z. B. 31,87 ct/kWh) eintragen oder aus einer Entität lesen, etwa einem dynamischen Stromtarif. Sensoren in €/kWh und ct/kWh werden erkannt; fällt der Sensor aus, gilt der Festpreis.
3. In den Raumeinstellungen unter **Elektroheizer** den Heizer einschalten und das Gerät wählen.

<img src="docs/vorschau_pv_allgemein.png" width="480" alt="PV-Einstellungen unter Allgemein"> <img src="docs/vorschau_pv_einstellung.png" width="480" alt="Elektroheizer in den Raumeinstellungen">

**So wird geregelt**
- Verfügbarer Überschuss = Einspeisung plus die Leistung der laufenden Heizer. Die Heizer verdrängen sich also nicht selbst.
- Ein Heizer läuft auf der höchsten Stufe, deren Leistung plus Reserve in den freien Überschuss passt. Bei mehreren Heizern gilt die Priorität: 1 wird zuerst versorgt.
- Hochschalten (auch der Start) erst, wenn die höhere Stufe die eingestellte Verzögerung lang möglich war. Zurückschalten auf eine niedrigere Stufe nach etwa einer Minute. Ausschalten frühestens nach der Mindestlaufzeit.
- Sofort aus: Fenster auf, Raum warm genug („Heizen bis“, danach erst 0,5 K darunter wieder an), außerhalb des erlaubten Zeitfensters, Schalter „Elektroheizer aktiv“ aus, Batterie unter der Schwelle (laufend 5 Prozentpunkte Spielraum).
- Fällt der Sensor aus, gilt der Überschuss als 0. Ist das Gerät nicht erreichbar, wird nichts geschaltet.

**Leistungsstufen**
Hat der Heizer Stufen, trägst du sie als Liste ein, zum Beispiel `800, 1200, 1800`. Die Karte zeigt die aktuelle Stufe, die Schwellen und den für diesen Heizer freien Überschuss. Mit „Stufen regeln: Automatisch“ geht der Heizer bei mehr Überschuss eine Stufe hoch und bei weniger wieder herunter. „Fest“ bedeutet: nur die höchste Stufe.

![Stufen bei 950 W, 1,5 kW und 2,4 kW Überschuss](docs/vorschau_pv_stufen.png)

**Klima-Geräte mit Voreinstellungen**
Ist das Gerät ein `climate`, ordnest du jeder Stufe eine Voreinstellung zu (zum Beispiel H1, H2, H3). Sie werden vorbelegt, wenn die Namen auf Zahlen enden. Einschalten setzt den Modus Heizen und die Voreinstellung, ausschalten den Modus Aus. Beim Stufenwechsel ändert sich nur die Voreinstellung. Die Zieltemperatur am Gerät wird auf Wunsch auf das Maximum gesetzt und danach zurückgestellt, damit das eigene Thermostat des Geräts nicht vorzeitig abschaltet. Das Gerät darf nicht zugleich Heizungsthermostat eines Raums sein.

<img src="docs/vorschau_pv_geraet.png" width="480" alt="Stufen am Gerät zuordnen">

**Thermostate**
„Thermostat während des Heizers: Ausschalten“ ist der Standard. Die Thermostate des Raums werden abgestellt, solange der Heizer läuft, und danach mit ihren vorherigen Werten wieder eingeschaltet. Der Heizplan ruht in dieser Zeit und wird danach nachgezogen.

<img src="docs/vorschau_pv_karte.png" width="480" alt="Heizer-Karte im Raum"> <img src="docs/vorschau_pv_handy.png" width="240" alt="Heizer-Karte auf dem Handy">

**Bericht**
Der Knopf „Bericht“ an der Heizer-Karte zeigt pro Tag Laufzeit, Energie, den Anteil aus PV und den Vorteil in Euro (PV-Strom statt Netzbezug, abzüglich entgangener Einspeisevergütung). Das Diagramm zeigt Überschuss, Heizerleistung, die Stufen als gestrichelte Linien und die Raumtemperatur. Dazu kommt eine Liste der Ereignisse. Der Gesamtbericht im Block „PV-Heizer“ zeigt alle Heizer über 7 Tage.

<img src="docs/vorschau_pv_bericht.png" width="480" alt="Heizer-Bericht"> <img src="docs/vorschau_pv_alle.png" width="480" alt="Gesamtbericht aller Heizer">

Hinweise: Die Energie wird aus der Nennleistung der Stufe berechnet, nicht gemessen. Der PV-Anteil ergibt sich aus der Netzeinspeisung. Der Heizer wird ausschließlich von dieser Integration geschaltet. Schaltest du ihn von Hand, übernimmt die Regelung innerhalb von etwa 30 Sekunden wieder.

## Module
Das Dashboard besteht aus **Modulen**. Unter dem Titel zeigt eine Leiste „Modul 1 Fenster & Heizung“, „Modul 2 Warmwasser“, „Modul 3 Energie“ und „+ Module“. Modul 1 ist das Grundmodul und immer aktiv.

- **Module verwalten** (Tipp auf „+ Module“, nur Administratoren): Modul 2, Modul 3 und eigene Module lassen sich ein- und ausschalten. Ausschalten löscht keine Einstellungen.
- **Weitere Module hinzufügen:** über HACS suchen oder die Adresse einer Moduldatei eintragen (`/local/…js`, `/hacsfiles/…js` oder `https://…js`). Die Adresse wird geprüft, höchstens 12 eigene Module.
- Geplant sind Rollläden und Beschattung, Lüftung und Wärmepumpe. Sie erscheinen in der Verwaltung als „Geplant“.
- Ein Modul meldet sich mit ID, Name, Symbol und einer Seite an. **Die Moduldatei wird in dieser Version noch nicht geladen:** ein hinzugefügtes eigenes Modul erscheint in der Leiste mit seinem Namen und der Adresse, die Seite bleibt vorerst ein Platzhalter. Die Schnittstelle dafür ist in Vorbereitung.

<img src="docs/vorschau_modul_leiste.png" width="720" alt="Modul-Leiste"> <img src="docs/vorschau_modul_verwaltung.png" width="360" alt="Module verwalten">

## Modul 2: Warmwasser und Zirkulation
Zeigt den Speicher, steuert Erzeuger, Heizstab und Zirkulationspumpe nach Zeitplan und führt den Legionellenschutz aus. Das Modul schaltet **nur die Geräte, die du auswählst**. Ohne Auswahl tut es nichts.

<img src="docs/vorschau_modul_warmwasser.png" width="720" alt="Modul Warmwasser">

### Einrichten
**Einstellungen** (Knopf oben rechts im Modul): Speicherinhalt, Soll-Temperatur und Absenktemperatur, bis zu drei Temperatursensoren (oben, Mitte, unten), den Wärmeerzeuger (Schalter, `water_heater` oder `climate`), optional einen Heizstab für PV-Überschuss, die Zirkulationspumpe (Schalter), einen Rücklaufsensor und einen Auslöser für „Bei Bedarf“. Mindestens ein Speichersensor oder die Pumpe genügt für den Start.

<img src="docs/vorschau_modul_einrichten.png" width="240" alt="Modul einrichten"> <img src="docs/vorschau_modul_einstellungen.png" width="240" alt="Einstellungen">

### Was die Seite zeigt
- Kopfkarte mit Temperaturen oben, Mitte und unten, Status (Bereit, Heizt auf, Unter Soll, Zu heiß, Abwesend) und einer Schätzung, für wie viele Duschen das Wasser reicht (50 Liter Mischwasser mit 38 °C).
- Kacheln für Erzeuger- und Pumpenlaufzeit der letzten 24 Stunden, Rücklauf und letzten Legionellenschutz.
- Verlaufsdiagramm der letzten 24 Stunden mit Soll-Linie sowie Balken für Erzeuger und Pumpe.
- Ein Zustandsblock meldet nicht erreichbare Sensoren, einen zu heißen oder zu kalten Speicher, einen zu warmen Rücklauf bei laufender Pumpe und überfälligen Legionellenschutz.

### Zeitplan (Warmwasser)
Pro Zeitfenster eine Soll-Temperatur, getrennt für Montag bis Freitag und das Wochenende. Außerhalb der Fenster gilt die Absenktemperatur. Der Erzeuger schaltet ein, wenn der Speicher oben 3 K unter Soll liegt, und aus, sobald das Soll erreicht ist. Ab 65 °C schaltet das Modul Erzeuger und Heizstab immer ab (Verbrühschutz). Bei einem `water_heater` oder `climate` setzt es stattdessen die Solltemperatur.

<img src="docs/vorschau_modul_zeitplan.png" width="240" alt="Zeitplan bearbeiten">

### Zirkulation
- **Zeitplan:** Die Pumpe läuft in den eingestellten Zeiten.
- **Bei Bedarf:** Der Auslöser (Taster, Bewegungsmelder, Durchflusssensor) startet die Pumpe für die eingestellte Nachlaufzeit. Sind Zeiten eingetragen, gilt das nur in diesen Zeiten.
- **Intervall:** In den Zeiten läuft die Pumpe alle X Minuten für Y Minuten.
- **Aus.**
- **Rücklauf-Grenze:** Ab dieser Temperatur stoppt die Pumpe und startet erst 2 K darunter wieder. Das spart Energie, weil das Wasser in der Leitung schon warm ist.
- Die Knöpfe **Einmal aufheizen** (auf die Schutztemperatur, höchstens 3 Stunden), **Zirkulation 5 Min.** und **Abwesend** (Absenktemperatur, Pumpe aus) wirken sofort.

### Legionellenschutz
Einmal pro Woche (Wochentag und Uhrzeit wählbar) heizt das Modul den Speicher auf die Schutztemperatur (Standard 60 °C) und hält sie 20 Minuten. Gezählt wird, wenn der **kälteste** Sensor die Temperatur erreicht. Schafft der Speicher das in sechs Stunden nicht, bricht der Lauf ab und das Fehlerprotokoll bekommt eine Warnung. Ein verpasster Termin läuft am selben Tag nach. Das Ergebnis steht im Modul, die Läufe im Fehlerprotokoll der Gerätediagnose.

### PV-Überschuss
Mit einem Heizstab-Schalter lädt das Modul den Speicher bei Überschuss bis zur eingestellten Höchsttemperatur (Standard 62 °C). Der Heizstab geht an, wenn der Überschuss die eingestellte Schwelle erreicht, und aus, wenn mehr als 100 W aus dem Netz kommen. Mindestens 5 Minuten an und 3 Minuten aus. Sensor, Vorzeichen und Batterie-Grenze kommen aus den PV-Einstellungen unter Allgemein. **Der Warmwasser-Heizstab hat Vorrang vor den Raumheizern**, weil diese den dann verbleibenden Überschuss sehen. Die Leistung des Heizstabs trägst du im Modul ein.

## Modul 3: Energie-Übersicht
<img src="docs/vorschau_modul_energie.png" width="720" alt="Modul Energie-Übersicht">

Heizung, Strom und PV auf einer Seite. Das Modul liest nur Sensoren, es schaltet nichts. Es erscheint in der Modul-Leiste, sobald es eingerichtet ist (Zahnrad „Einstellungen“ oder Karte „Energie-Übersicht einrichten“).

- **Kopfkarte:** Hausverbrauch jetzt, Anteil aus Solar, Chips für Solar, Netz und Batterie.
- **Zeitraum:** Heute, 7 Tage, 30 Tage.
- **Kacheln:** Solar (mit Eigenverbrauch), Netzbezug (Kosten), Einspeisung (Vergütung), Verbrauch (Autarkie).
- **Energiefluss:** animierte Grafik mit Solar, Netz, Haus, Batterie, Heizung und Warmwasser.
- **Verlauf:** Leistungskurve für heute, Balken pro Tag für 7 und 30 Tage.
- **Verteilung** („Wohin der Strom heute geht“, nur Heute): Warmwasser ist aus der Laufzeit des Heizstabs aus Modul 2 geschätzt.
- **Kosten und Vorteil:** Bezug, Einspeisevergütung, gesparter Bezug durch Eigenverbrauch, Bilanz. Preise kommen aus Modul 1 › Allgemein.
- **Heizung:** durch die Fensterregelung gesparte Wärme, Elektroheizer mit Solaranteil, Warmwassertemperatur, Sprungtasten zu Modul 1 und 2.

**Einrichten:** Leistungssensoren (Watt oder kW) für Solar und Netz (wahlweise wie in Modul 1) sind nötig, Hausverbrauch und Batterie sind optional. Fehlt der Hausverbrauch, wird er berechnet. Das Vorzeichen von Netz und Batterie stellst du ein. Für 7 und 30 Tage wählst du drei Energiezähler (kWh): Solar-Ertrag, Netzbezug und Einspeisung. Sie müssen in Home Assistant als Langzeitstatistik geführt werden (Zähler mit `state_class: total_increasing`). Die Einstellungen werden im Backend gespeichert und mit gesichert; nur der gewählte Zeitraum bleibt pro Gerät im Browser.

## Entitäten auswählen
<img src="docs/vorschau_entitaeten_auswahl.png" width="360" alt="Entitäten-Auswahl"> <img src="docs/vorschau_energie_einstellungen.png" width="360" alt="Energie-Einstellungen">

Überall im Dashboard (Einrichtungsassistent, Allgemein, Raumoptionen, Modul 2 und 3) ersetzt eine Suchauswahl die einfachen Listen: Das Feld zeigt Name, Entity-ID und aktuellen Wert. Ein Tipp öffnet die Liste mit Suchfeld (Name oder Entity-ID), passende Entitäten stehen oben mit „Passt“, jede Zeile zeigt den aktuellen Wert. „– keiner –“ leert das Feld.

## Gerätediagnose
Unter **Allgemein → Diagnose öffnen** zeigt die Gerätediagnose, ob alle Geräte der Regelung melden. Oben steht eine Gesamtanzeige („Alles in Ordnung“, Warnungen oder Fehler) mit dem Knopf „Erneut prüfen“. Es gibt fünf Reiter:

- **Status:** Pro Raum die Fenstersensoren, Thermostate, Luftfeuchte-Sensoren und Elektroheizer, dazu PV-Sensor, Batterie, Strompreis, Einspeisevergütung und Benachrichtigungsdienste. Fehler: nicht erreichbar oder gelöscht. Warnungen: über 24 Stunden keine Meldung, Thermostat ohne Raumtemperatur, Fenster über 12 Stunden offen, Sensor ohne Zahlenwert, Dienst nicht gefunden.
- **Gemeldet:** Alle Geräte nach letzter Meldung sortiert, die ältesten oben, mit Filter „Nur auffällige“.
- **Ventile:** Pro Thermostat Batterie, Ist- und Zieltemperatur, letzte Meldung und letzter Befehl. Die Integration prüft zwei Minuten nach jedem Befehl (Zieltemperatur oder Betriebsart), ob das Ventil ihn übernommen hat. Sonst steht dort „Reagiert nicht auf Befehle“.
- **Fenster:** Pro Fensterkontakt Zustand, letzter Wechsel, letzte Meldung und Batterie. Gemeldet werden: nicht erreichbar, Batterie leer oder schwach, „seit Tagen unverändert“ (einstellbar, Standard 7 Tage) und „keine Meldung“ seit über 3 Tagen.
- **Protokoll:** Fehlgeschlagene Schaltvorgänge, nicht erreichbare Geräte, Ventile, die nicht reagieren, und Benachrichtigungen. Die letzten 200 Einträge bleiben über Neustarts erhalten. „Kopieren“ legt sie für Fehlerberichte in die Zwischenablage, „Leeren“ löscht sie.

**Batterie:** Die Integration liest sie aus dem Gerät, aus einem Batteriesensor desselben Geräts oder aus einem Binärsensor mit der Geräteklasse Batterie. Über „Quelle“ in jeder Karte wählst du eine andere Entität: einen Prozent-Sensor oder einen Binärsensor, der bei schwacher Batterie „an“ ist („Umgekehrt“ dreht das um), oder schaltest die Überwachung ab. Ab 20 % (einstellbar) gilt die Batterie als schwach, ab 10 % oder bei einem Binärsensor als leer.

**Benachrichtigung:** Im Reiter „Ventile“ wählst du einen Benachrichtigungsdienst. Alle fünf Minuten wird geprüft; jedes Problem wird höchstens einmal in 24 Stunden gemeldet und erst wieder, wenn es zwischenzeitlich gelöst war. In den Raumkarten erscheint bei einem Problem ein Hinweis wie „Batterie 12 %“, „Ventil offline“ oder „Kontakt unverändert“, ein Tipp darauf öffnet die Diagnose.

<img src="docs/vorschau_diagnose.png" width="480" alt="Gerätediagnose"> <img src="docs/vorschau_ventile.png" width="480" alt="Ventil-Diagnose">

## Einrichtungsassistent
Unter **Allgemein → Assistent starten** (bei noch fehlenden Räumen auch direkt im Dashboard) führt der Assistent in acht Schritten durch die Einrichtung. Jeder Schritt außer dem ersten lässt sich überspringen:

1. **Willkommen:** zeigt, was in deinem Home Assistant gefunden wurde.
2. **Räume:** Vorschläge aus den Bereichen von Home Assistant (Fenster- und Türsensoren plus Thermostate im selben Bereich) oder manuell. Bestehende Räume bleiben unverändert.
3. **Fenstermeldung:** Verzögerungen, Thermostat aus oder Absenken, Sommermodus.
4. **Heizung & Energie:** Brennstoff, Außentemperatur-Sensor, wetterabhängige Absenkung.
5. **Luftfeuchte:** Sensor je Raum.
6. **PV & Elektroheizer:** Einspeise-Sensor, Batterie, Strompreis und Einspeisevergütung (je als Festwert oder Entität), Heizer je Raum mit Leistungsstufen.
7. **Meldungen:** Benachrichtigungsdienst und Erinnerungszeit.
8. **Zusammenfassung:** Erst hier wird angelegt. Danach zeigt der Assistent pro Raum ein Häkchen oder den Fehler. Räume ohne Fenstersensor oder Thermostat werden übersprungen.

<img src="docs/vorschau_assistent.png" width="720" alt="Einrichtungsassistent">

## Wetter-Anpassung und Sommermodus
Beides stellst du unter **Allgemein** (Knopf oben rechts, nur Administratoren) ein.

### Wetterabhängige Absenkung
Bei Sonne oder milder Luft sinkt die Zieltemperatur des Heizplans, bei Frost steigt sie. Standardmäßig ist die Funktion **aus**.

- Du legst fest: „Mild ab“ (z. B. 12 °C), „absenken um“, „Frost bis“ (z. B. 0 °C) und „anheben um“ (in Kelvin). Bei Sonne gilt „mild“ schon 5 °C früher. Ein Spielraum von 1 K verhindert ständiges Umschalten.
- Gilt nur für den Heizplan, nicht für Abwesenheit oder Urlaub. Einzelne Räume lassen sich unter **Raumeinstellungen › Wetter-Anpassung** ausnehmen.
- Die Außentemperatur kommt aus dem Sensor oder der Wetter-Entität, die du unter **Darstellung** gewählt hast. Die Karten zeigen den Hinweis „Wetter-Anpassung: Ziel +1,0 °C (Frost, −3,0 °C draußen)“.

<img src="docs/vorschau_handy_kopf.png" width="240" alt="Wetter-Anpassung auf dem Handy"> <img src="docs/vorschau_dialog_wetter.png" width="480" alt="Einstellungen unter Allgemein">

### Sommermodus
Aus, Automatisch oder Immer an. Bei „Automatisch“ ruhen die Heizpläne, wenn die mittlere Außentemperatur der letzten 1, 3 oder 7 Tage die Schwelle (Standard 18 °C) erreicht. Die Fenstermeldung und alle Erinnerungen bleiben aktiv. Die Kopfkarte zeigt den Chip „Sommermodus“, die Pläne sind abgedimmt.

<img src="docs/vorschau_sommer_kopf.png" width="480" alt="Sommermodus in der Kopfkarte">

## Sichern und Wiederherstellen
Unter **Allgemein › Sichern & Wiederherstellen** speicherst du eine JSON-Datei mit allen Räumen und Raumeinstellungen, Heizplänen, Anwesenheit, Aussehen (Farben, Symbole, Fotos, Kopfkarten-Hintergründe, Gruppen), den allgemeinen Einstellungen sowie den Modulen samt den Einstellungen von Modul 2 und 3.

- „Sicherung einlesen“ zeigt zuerst eine Zusammenfassung. Erst „Wiederherstellen“ ersetzt die aktuellen Einstellungen.
- Räume werden anhand ihrer ID zugeordnet, sonst über einen eindeutigen Namen. Räume, die es nicht mehr gibt, werden übersprungen. Das Dashboard meldet, wie viele.
- Entitäten, die auf dem neuen System fehlen, führen dazu, dass der Raum seine bisherigen Einstellungen behält.

<img src="docs/vorschau_backup_import.png" width="480" alt="Sicherung einlesen">

## Meine Ansicht
Der Knopf **Meine Ansicht** links über den Raumkarten gilt nur für dich in diesem Browser. Du kannst Räume ein- und ausblenden, ihre Reihenfolge ändern und ganze Bereiche (Kopfkarte, Anwesenheit, Kennzahlen, Diagramm, Räume) ausblenden. Die gemeinsame Ansicht der anderen Nutzer bleibt unverändert. „Zurücksetzen“ stellt alles zurück.

<img src="docs/vorschau_meine_ansicht.png" width="480" alt="Meine Ansicht">

## Update-Hinweis
Administratoren sehen oben ein Banner, wenn auf GitHub eine neuere Version veröffentlicht wurde („Neue Version 2.7.0 verfügbar“). **Das ist neu** zeigt die Punkte aus der Release-Beschreibung (Aufzählungen mit `-` oder `*`), „In HACS öffnen“ führt zum Update, „Überspringen“ blendet die Version aus.

- Die Prüfung fragt höchstens einmal pro Stunde die öffentliche GitHub-Schnittstelle ab. Unter **Allgemein › Updates** lässt sie sich ausschalten.
- Schreibe in jedem Release kurze Aufzählungspunkte, dann erscheinen sie im Dashboard.

<img src="docs/vorschau_update_kopf.png" width="480" alt="Update-Hinweis"> <img src="docs/vorschau_update_neu.png" width="480" alt="Neu in dieser Version">

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
Jeder Raum wird als eigener Eintrag über das Menü eingerichtet: Einstellungen → Geräte & Dienste → Integration hinzufügen. Danach lassen sich alle Werte auch im Dashboard ändern, siehe [Raumeinstellungen im Dashboard](#raumeinstellungen-im-dashboard).

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
| Schalter „Elektroheizer aktiv“ | nur mit eingeschaltetem Elektroheizer: Heizer erlauben oder pausieren |
| Sensor „Heizung pausiert“ (heute, Monat, Jahr, gesamt) | Minuten; Attribute: `gespart_menge`, `einheit`, `brennstoff`, `gespartes_gas_kwh`, bei Erdgas zusätzlich `gespartes_gas_m3` |
| Sensor „Betriebszustand“ | Regelung aktiv, Heizung pausiert, Heizung aus (nur Fenstermeldung) oder Regelung deaktiviert; Attribute u. a. `zuletzt_gelueftet`, `luftfeuchte_sensor`, `heizer` (Status, Stufe, Leistung, Tageswerte) |
| Sensor „Heizplan Solltemperatur“ | aktuelle Vorgabe des Plans, nächste Änderung als Attribut; dazu `sommermodus` und `wetter_anpassung` |

## Installation über HACS
1. HACS → drei Punkte → **Benutzerdefinierte Repositories**
2. URL dieses Repos eintragen, Kategorie **Integration**
3. „Fenster & Heizung“ installieren und Home Assistant neu starten
4. Einstellungen → Geräte & Dienste → Integration hinzufügen → „Fenster & Heizung“

## Update und Hinweise
- Nach einem Update Home Assistant neu starten und die Seite einmal neu laden (Strg+F5), damit das neue Dashboard geladen wird.
- Der bisherige Wert „Energie pro m³ Gas“ bleibt für Erdgas erhalten.
- Die Raumeinstellungen im Dashboard nutzen die neuen WebSocket-Befehle `fenster_heizung/get_options` und `fenster_heizung/set_options` (nur Administratoren). Neue Werte werden wie in den Home-Assistant-Optionen gespeichert.
- Farben, Fotos, Symbole und die Wetteranzeige werden im gemeinsamen Layout gespeichert (WebSocket-Befehl `fenster_heizung/set_layout`, nur Administratoren). Das Backend prüft Farben, Foto-Format und -Größe sowie die Entitäten.
- Version 2.9.1: `set_modules` nimmt zusätzlich `on.en` (Modul 3 ein/aus) und `energy` (`ent` mit `pv`, `grid`, `house`, `bat`, `pve`, `imp`, `exp` als Sensor-IDs, `sign` und `bsign`) an; das Backend prüft sie. Sicherung und Wiederherstellung enthalten sie.
- Version 2.9.0 fügt die WebSocket-Befehle `get_modules`, `set_modules`, `set_wasser` und `wasser_cmd` hinzu (schreibend nur für Administratoren), liefert `modules` und `wasser` in `get_state` und kennt im Layout das Feld `hero`.
- Version 2.8.0 fügt die WebSocket-Befehle `get_diag` und `clear_diag` hinzu (Letzterer nur für Administratoren) und den Schlüssel `valve` in den allgemeinen Einstellungen (Batterie-Schwelle, Tage, Benachrichtigungsdienst, Batterie-Quellen).
- Version 2.6.0 fügt die WebSocket-Befehle `get_general`, `set_general`, `get_update`, `get_learning` und `restore` hinzu. Das Backend prüft alle Werte; Änderungen sind nur für Administratoren erlaubt.
- Neue Raumeinstellungen (`humidity_sensor`, `air_hint`, `air_every`, `weather_adj`) erscheinen nur im Dashboard. Beim Speichern im HA-Optionsdialog bleiben sie erhalten.
- Der Bericht braucht Verlaufsdaten im Recorder, siehe [Bericht pro Raum](#bericht-pro-raum).

## Neue Version veröffentlichen
1. `version` in `custom_components/fenster_heizung/manifest.json` erhöhen
2. Auf GitHub ein **Release** mit passendem Tag erstellen (z. B. `v2.6.1`) und kurze Aufzählungspunkte in die Beschreibung schreiben (sie erscheinen im Update-Hinweis)
3. HACS zeigt das Update an

## Unterstützen
Gefällt dir die Integration? Über [GitHub Sponsors](https://github.com/sponsors/maddog3010) kannst du die Weiterentwicklung unterstützen. Danke!

## Änderungen
Alle Versionen siehe [CHANGELOG.md](CHANGELOG.md).
