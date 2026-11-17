# Modul 17 Müllabfuhr

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
