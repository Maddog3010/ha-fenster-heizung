![Fenster & Heizung](custom_components/fenster_heizung/brand/icon.png)



# Fenster & Heizung

Home-Assistant-Integration: Pausiert Heizungsthermostate, solange Fenster offen sind.

## Dashboard
Die Integration bringt ein eigenes Dashboard in der Seitenleiste mit.

![Dashboard auf dem Handy, dunkel](docs/vorschau_handy_dunkel.png) ![Dashboard auf dem Handy, hell](docs/vorschau_handy_hell.png)



![Dashboard auf dem Desktop](docs/vorschau_desktop.png)

## Funktionen
- Eigenes Dashboard in der Seitenleiste (Hell/Dunkel, Handy und Desktop)
- Pro Raum ein Eintrag; Fenstersensoren und Thermostate per Menü wählbar
- Thermostat ausschalten oder auf Absenktemperatur stellen
- Verzögerung nach Öffnen und nach Schließen
- Sperrzeit (z. B. nachts) und Außentemperatur-Bedingung
- Erinnerung per Benachrichtigung, wenn ein Fenster zu lange offen ist: Aktionen per Auswahlmenü, eigener Titel und Text mit Platzhaltern `{raum}`, `{minuten}`, `{fenster}`
- Sensoren „Heizung pausiert“ für heute, Monat, Jahr und gesamt (Minuten) mit geschätztem gespartem Gas (m³ und kWh) als Attribut; optional aus Raumfläche, Heizlast und Außentemperatur berechnet
- Sensor „Betriebszustand“: Regelung aktiv, Heizung pausiert, Heizung aus (nur Fenstermeldung) oder Regelung deaktiviert
- Eigener Heizungs-Sensor wählbar (z. B. climate, Schalter, Sommer-Modus): steht er auf „Heizung aus“, wird nicht geregelt und nur die Fenstermeldung bleibt aktiv
- Geregelt werden nur Thermostate im Modus `heat` oder `auto`; steht ein Thermostat auf `off`, bleibt nur die Fenstermeldung aktiv
- Schalter „Fensterregelung aktiv“ pro Raum

## Installation über HACS
1. HACS → drei Punkte → **Benutzerdefinierte Repositories**
2. URL dieses Repos eintragen, Kategorie **Integration**
3. „Fenster & Heizung“ installieren und Home Assistant neu starten
4. Einstellungen → Geräte & Dienste → Integration hinzufügen → „Fenster & Heizung“

## Änderungen
Alle Versionen siehe [CHANGELOG.md](CHANGELOG.md).
