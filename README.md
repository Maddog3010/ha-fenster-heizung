# Fenster & Heizung

Home-Assistant-Integration: Pausiert Heizungsthermostate, solange Fenster offen sind.

## Funktionen
- Pro Raum ein Eintrag; Fenstersensoren und Thermostate per Menü wählbar
- Thermostat ausschalten oder auf Absenktemperatur stellen
- Verzögerung nach Öffnen und nach Schließen
- Sperrzeit (z. B. nachts) und Außentemperatur-Bedingung
- Erinnerung per Benachrichtigung, wenn ein Fenster zu lange offen ist (mehrere Dienste möglich)
- Sensor „Heizung pausiert heute“ (Minuten pro Tag, plus Anzahl der Pausen)
- Sensor „Betriebszustand“: Regelung aktiv, Heizung pausiert, Heizung aus (nur Fenstermeldung) oder Regelung deaktiviert
- Eigener Heizungs-Sensor wählbar (z. B. climate, Schalter, Sommer-Modus): steht er auf „Heizung aus“, wird nicht geregelt und nur die Fenstermeldung bleibt aktiv
- Geregelt werden nur Thermostate im Modus `heat` oder `auto`; steht ein Thermostat auf `off`, bleibt nur die Fenstermeldung aktiv
- Schalter „Fensterregelung aktiv“ pro Raum

## Installation über HACS
1. HACS → drei Punkte → **Benutzerdefinierte Repositories**
2. URL dieses Repos eintragen, Kategorie **Integration**
3. „Fenster & Heizung“ installieren und Home Assistant neu starten
4. Einstellungen → Geräte & Dienste → Integration hinzufügen → „Fenster & Heizung“
