# Changelog

Alle wichtigen Änderungen an „Strom & Wärme“. Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

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
