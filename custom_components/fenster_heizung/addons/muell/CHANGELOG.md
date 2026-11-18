# Modul 17 Müllabfuhr

## [1.0.0] Build 1 - 2026-11-18 · Stabil
- **Echte Entitäten** im Gerät „Strom & Wärme · Müllabfuhr“ (umbenennbar, mit Verlauf): nächste Abholung, Tage je Abfallart, Vorrat, „Tonne rausstellen“ und „Tonne reinholen“ als Binärsensoren; Entitäts-IDs wie bisher. Braucht Integration 2026.11.4b6, ältere Versionen bekommen weiter einfache Zustände
- Doku: eigener Abschnitt „Modul 17 im Detail“ im README mit allen Funktionen, Sensoren und dem Ereignis
- Stufe **Stabil**

## [0.9.0] Build 1 - 2026-11-18 · Vorabversion
- **Jahresübersicht:** je Abfallart geplant, vorbei, draußen, ausgelassen und ohne Angabe, Anteil markierter Abholungen; ab dem zweiten Jahr mit Vorjahr
- **Sensoren und Ereignis für Home Assistant:** nächste Abholung, Tage bis zur Abholung je Abfallart, „Tonne rausstellen“, „Tonne reinholen“ und Vorrat; Ereignis `strom_waerme_muell` bei Erinnerung, draußen, ausgelassen, reinholen, drin, Vorwarnung und Vorrat
- **Vorrat Säcke:** zählt bei jeder Abholung herunter, meldet sich rechtzeitig, „+ Rolle“
- **Labs · Automatisch erkennen:** Sensor an der Tonne oder am Stellplatz markiert „draußen“ und „wieder drin“ von selbst
- **Startseite:** Hinweise für „Reinholen“ (mit „Wieder drin“), Sondertermine, Urlaub und Vorrat
- Stufe **Vorabversion**

## [0.8.0] Build 1 - 2026-11-18 · Beta
- **Wer ist dran?** Personen im Wechsel (je Abholung oder jede Woche), die Erinnerung geht an die Person, die dran ist, mit eigenem Benachrichtigungsdienst; ist sie nicht zu Hause, an die nächste; Tauschen mit einem Tipp
- **Diesmal nicht:** Leerung auslassen – keine Erinnerung, kein Licht, zählt nicht als Leerung; „Doch abholen“ nimmt es zurück
- **Verlauf:** jede Abholung mit draußen oder ausgelassen, wann, wie (Tipp, Tag, Meldung) und wer
- **Kosten:** wählbar, ob jeder Termin zählt oder nur Tonnen, die wirklich draußen standen; ausgelassene Leerungen werden gezeigt
- **Urlaub:** Abholungen im Urlaub aus Modul 1 stehen unter Hinweise und kommen am Vorabend der Abreise als Meldung
- **Wetter:** bei Sturm wahlweise erst am Morgen erinnern, Hinweis bei Hitze für die Biotonne

## [0.6.0] Build 1 - 2026-11-18 · Beta
- **Knöpfe in der Meldung:** „Steht draußen“, „Später“ und „Wieder drin“ direkt in der Meldung der Home-Assistant-App; eine neue Meldung ersetzt die alte
- **Erinnerung am Morgen** des Abholtags, nur wenn die Tonne noch nicht draußen steht
- **Tonne reinholen:** nach der Abholung Zustand „reinholen“ (Kachel, Szene, Banner mit „Alle wieder drin“) und eine Meldung zur gewählten Uhrzeit
- **Tags & Karten:** neue Aktion „Tonne ist wieder drin“
- **Licht:** Helligkeit wählbar, bei mehreren Tonnen wechselnde Farbe, danach wieder wie vorher (an mit Farbe und Helligkeit oder aus)
- **Wandtablet:** große Karte auf der Startseite, wenn etwas raus oder rein muss, mit einem Knopf
- **Handy:** kompaktere Szene; zu breite Seite durch die 14-Tage-Leiste behoben

## [0.5.0] Build 1 - 2026-11-17 · Beta
- **Neue Optik:** Straßen-Szene als Banner – fällige Tonnen stehen leuchtend am Bordstein (Orange = muss raus, Türkis = steht draußen), die übrigen ruhen am Haus, am Abholtag fährt der Müllwagen vor; Tag und Nacht, Knopf „Alle stehen draußen“, Hinweise auf Sondertermine
- **Kacheln 2.0:** ruhige Kacheln mit großem Bild, Zustand als Wort und Farbe (raus, heute raus, morgen, bald, ok, steht draußen, kein Termin) und Ring bis zur Abholung
- **Die nächsten 14 Tage** als Leiste, Tag antippen zeigt die Abholung
- **Kalender neu:** Farbleisten statt Punkten, Blättern durch die Monate, Jahresansicht mit allen 12 Monaten und Legende, verschobene Abholungen gestrichelt
- **Leerzustand** mit Szene und drei Schritten zur Einrichtung
- **Darstellung:** „Optik wie bisher“ und Bewegung Aus / Dezent / Voll (Bewegung reduziert, wenn das Gerät es wünscht)
- Stufe **Beta**

## [0.3.0] Build 1 - 2026-11-17
- **Freie Abfallarten:** bis zu 10 statt vier fester Tonnen, jede mit Name, Bild, Farbe, Erkennungswörtern, Abholzeit und Erinnerung
- **Vorlagen:** Glas, Grünschnitt, Sperrmüll, Schadstoffmobil, Weihnachtsbaum oder eine eigene Art
- **Sondertermine:** Vorwarnung 2, 3, 5 Tage oder 1 Woche vorher, als Nachricht und unter „Hinweise“
- **Bis zu drei Kalender** werden zusammengeführt, ohne Auswahl alle Kalender von waste_collection_schedule
- **HD-Bilder je Abfallart:** Tonne, Sack, Container, Grünschnitt, Sperrmüll, Schadstoffmobil, Weihnachtsbaum
- Deine vier Tonnen werden beim Update einmalig übernommen (Wörter, Ein/Aus, „steht draußen“), die alten Einstellungen bleiben zusätzlich gespeichert
- Erkennung: das längste passende Wort gewinnt („Weihnachtsbaum“ vor „Baum“)

## [0.2.0] Build 1 - 2026-11-17
- **Nicht erkannt:** Termine aus dem Kalender, die zu keiner Abfallart passen, werden angezeigt und mit einem Tipp zugeordnet, neu angelegt oder ignoriert
- **Später erinnern** übersteht einen Neustart von Home Assistant, Dauer wählbar (30 Min. bis 3 Std.)
- **Termine zwischengespeichert:** nach einem Neustart sofort da, auch wenn der Kalender noch nicht antwortet (mit Hinweis); nach einer Änderung der Erkennung sofort neu abgerufen
- **Abholzeit je Abfallart** statt fest 12 Uhr
- **Morgen-Briefing** (Sponsor Max): Baustein „Müll“ liefert wieder heute, morgen und Sondertermine
- **Tags & Karten:** „Tonne ist draußen“ kennt alle Abfallarten
- Uhrzeit als Stunde/Minute-Felder statt Auswahlrad (kein Absturz in der Mac-App)
- Eigene Tests (tests/test_muell.py)

## [0.1.0] Build 1 - 2026-11-04
- **Jetzt als Addon**: unter Einstellungen › Addons installieren, pausieren und deinstallieren, Updates aus dem Katalog
- Wer das Lab „Müllabfuhr“ an hatte, bekommt das Addon beim Update automatisch, alle Einstellungen bleiben erhalten
