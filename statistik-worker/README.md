# Statistik-Worker (Cloudflare) – Versions-Statistik für „Strom & Wärme“

Alternative zum Proxmox-Server in `../statistik-server/`: gleiche Schnittstelle (`POST /v1/ping`, `POST /v1/forget`),
gleiche Auswertung, aber auf Cloudflare Workers + D1. Das Dashboard liegt auf `dash.stromwaerme.dev` hinter Cloudflare Access;
der Worker prüft das Access-Token zusätzlich selbst (RS256, Aussteller, AUD, Ablauf) und sperrt ohne gültige Konfiguration.

Einrichtung: siehe `Anleitung_Statistik-Cloudflare-Worker.pdf`. Kurz:

    npx wrangler login
    npx wrangler d1 create stats          # database_id in wrangler.toml eintragen
    npx wrangler d1 execute stats --remote --file=schema.sql
    npx wrangler deploy                   # danach Access-Anwendung für dash.… anlegen, TEAM_DOMAIN/POLICY_AUD eintragen, erneut deploy

Tests: `node --no-warnings test/test.js && node --no-warnings test/test_fehler.js && node --no-warnings test/test_build6.js && node --no-warnings test/test_build8.js && node --no-warnings test/test_build9.js && node --no-warnings test/test_build10.js && node --no-warnings test/test_build11.js && node --no-warnings test/test_build12.js` (Node ≥ 22.5, nutzt `node:sqlite` als D1-Ersatz).

## Fehler-Statistik (ab 2026.11.4.3b1)

Eingang `POST /v1/errors` (Bericht mit höchstens 50 bereinigten Programmfehlern, max. 64 KB, 1 pro Kennung und Stunde) und
`POST /v1/errors/forget` (alle Berichte einer Kennung löschen). Dashboard: Reiter **Fehler** auf `dash.…/fehler` – gleiche Fehler
sind eine Zeile (Fingerabdruck), sortiert nach betroffenen Installationen, Filter nach Zeitraum, Modul und Quelle; Detail unter
`/fehler/<fp>` mit Status (offen, in Arbeit, behoben in …, ignorieren), Issue-Nummer und „GitHub-Issue anlegen“ (Repo aus `GITHUB_REPO`). Status-Änderungen nur per POST aus dem eigenen Dashboard (gleiche Herkunft) und hinter Access. Berichte werden nach 90 Tagen gelöscht. **Nach dem Update einmal ausführen:**

    npx wrangler d1 execute stats --remote --file=schema.sql
    npx wrangler deploy

## Build 5 (Dashboard): neu in Version, Wochenblick, Release-Marken, Nachzügler

Nur der Worker ändert sich – keine neue Tabelle, kein Update der Integration nötig:

    npx wrangler deploy

- **Diese Woche** (oben auf beiden Reitern): neue Fehler, „wieder da“, diese Woche behoben, seit über 14 Tagen „in Arbeit“. Keine Benachrichtigung.
- **Neu in Version** (Reiter Fehler): jeder Fehler zeigt „seit 11.4.3b3“, Filter `?ver=<Version>` zeigt, was eine Version neu mitgebracht hat.
- **Release-Marken**: orange Linien im Wochenverlauf und im Fehler-Verlauf am ersten Tag einer Version (stabile immer, dazu die neuesten Betas).
- **Nachzügler mit bekanntem Fehler** (Reiter Versionen): aktive Installationen auf einer Version ab dem ersten Auftreten und vor „behoben in …“.
- Korrektur der Versions-Reihenfolge: Korrektur-Betas (2026.11.4.3b1) sortieren jetzt nach 2026.11.4.2 statt davor – „neueste Version“ und der Wochenverlauf stimmen damit auch bei Korrektur-Betas (auch im Python-Server).

## Build 6: Release-Reife, Fehler je Modul, Home-Assistant-Versionen (ab 2026.11.5b1)

Worker **und** Datenbank-Erweiterung – in dieser Reihenfolge, **bevor** die Beta 2026.11.5b1 veröffentlicht wird:

    npx wrangler d1 execute stats --remote --file=migrate-build6.sql
    npx wrangler deploy

(Neue Datenbanken: `schema.sql` enthält schon alles.) Ältere Integrationen senden unverändert weiter.

- **Tages-Meldung** `POST /v1/errors` mit Schema 2: auch mit `errors: []` („0 Fehler“), dazu `mods` (Kurzzeichen der aktiven Module). Neue Tabelle `err_days` (eine Zeile je Tag und Kennung, nach 90 Tagen gelöscht, bei „Meine Daten löschen“ mit entfernt).
- **Release-Reife** (Reiter Fehler, oben): je Version Installationen, davon mit Fehler, Quote, neue Fehler, Tage live, Tage ohne neuen Fehler und eine Ampel. Regeln (`REIFE` in `src/fehler.js`): *bereit/gut* ab 3 Tagen live, 5 Installationen, ohne neuen offenen Fehler und mit einer Quote nicht höher als die letzte stabile Version; *abwarten* bei zu wenig Tagen/Installationen, einem neuen Fehler „in Arbeit“ oder höherer Quote; *nicht freigeben* (Beta) bzw. *Hotfix prüfen* (stabil) bei einem neuen offenen Fehler oder „wieder da“; *abgelöst*, *älter*, *Update empfehlen* für ältere Versionen. Die Ampel der neuesten Beta steht auch im Wochenblick. Eine Quote gibt es erst für Versionen mit Tages-Meldung (ab 2026.11.5b1).
- **Fehler je Modul** (Reiter Fehler, unten): betroffene Installationen ÷ Installationen mit Modul an (30 Tage). Modul 1 und Kernbereiche zählen als „immer an“.
- **Home Assistant** (Reiter Versionen): Versions-Ping Schema 3 mit `ha` („2026.11“, ohne Patch-Stufe), Verteilung aller aktiven Installationen mit „diese oder neuer“ und der Zeile „x % auf … oder neuer“ (ab 95 %).

Tests: zusätzlich `node --no-warnings test/test_build6.js`.

## Build 7: Rückmeldung an den Nutzer (ab 2026.11.5b2)

Nur der Worker – keine Datenbank-Änderung:

    npx wrangler deploy

`POST /v1/errors` mit Schema 3 enthält `known` (Fingerabdrücke schon gesendeter Fehler, höchstens 200). Die Antwort bringt
`status` = `{ "<fp>": { "s": "offen" | "arbeit" | "behoben", "fx": "<Version>" } }` – nur für Fehler aus dem Bericht und aus `known`,
nur für vorhandene Gruppen. „ignorieren“ wird nicht gemeldet, „behoben“ ohne Version zählt als „offen“. Ältere Integrationen
(Schema 1 und 2) bekommen die Antwort wie bisher ohne `status`. Die Integration zeigt den Status im Fehlerprotokoll und
„Zum Update“, wenn die installierte Version älter als „behoben in …“ ist.

## Build 8: Fehler zusammenführen

Nur der Worker und eine neue, kleine Tabelle – kein Update der Integration:

    npx wrangler d1 execute stats --remote --file=migrate-build8.sql
    npx wrangler deploy

(Mehrfach ausführen schadet nicht. Ohne die Tabelle läuft alles wie bisher, nur Zusammenführen geht dann nicht.)

- Detailseite eines Fehlers: **„Mit … zusammenführen“** – Vorschläge mit gleicher Stelle im Code (★), gleicher Art und gleichem Modul zuerst. Der Fehler wird Teil des gewählten: Zahlen, Verlauf, Versionen, Release-Reife, Fehler je Modul und der Status laufen danach dort. Seine eigene Seite leitet weiter.
- Auf der Seite des Haupt-Fehlers stehen die zusammengeführten Fehler mit **„Trennen“**. Getrennt hat jeder Fehler wieder seine eigenen Zahlen und seinen alten Status.
- Gespeichert wird nur „Fingerabdruck B gehört zu A“ (`err_merge`); die Berichte selbst bleiben unverändert. Neue Berichte mit B landen automatisch bei A. Die Rückmeldung an Nutzer (Build 7) meldet für B den Status von A.
- Kein Zusammenführen mit sich selbst oder im Kreis. Verweise auf gelöschte Fehler räumt der Worker selbst auf.

Tests: zusätzlich `node --no-warnings test/test_build8.js`.

## Build 9: Dashboard-Version, Release-Bericht, fehlerfreie Tage, Home Assistant × Version

Nur der Worker – keine Datenbank-Änderung, kein Update der Integration:

    npx wrangler deploy

- **Dashboard-Version im Banner** („Dashboard Build 9 · 24.11.2026“) und unter `GET https://stats.stromwaerme.dev/health` → `{"ok":true,"build":9,"date":"2026-11-24"}`. Bei jedem neuen Build `DASH` in `src/worker.js` hochzählen. So lässt sich nach `wrangler deploy` prüfen, ob der neue Stand läuft.
- **Release-Bericht** `/version/<Version>`: Installationen und Anteil, Fehlerquote mit Vergleich zur Vorversion und zur letzten stabilen, fehlerfreie Tage, Ampel, „Neu in dieser Version“, „In dieser Version behoben“, Verbreitung pro Tag mit Release-Marke, Home-Assistant-Versionen. Verlinkt aus „Versionen aktuell“, Release-Reife, Wochenblick und HA × Version.
- **Fehlerfreie Tage**: Nutzungstage (Tag + Kennung) ohne Fehler ÷ Nutzungstage, nur ab Tages-Meldungen. Neue Spalte in der Release-Reife. Die Ampel bleibt auf „abwarten“, wenn eine Version mehr als 0,5 Prozentpunkte schlechter ist als die letzte stabile.
- **Home Assistant × Version** (Reiter Fehler): Fehlerquote je HA-Version (ohne Patch) und den vier neuesten Versionen, Feld erst ab 3 Installationen.

Tests: zusätzlich `node --no-warnings test/test_build9.js`.

## Build 10: Langzeit-Verlauf, Verloren nach Update, Treue, Export als CSV

Worker und eine neue Tabelle – kein Update der Integration:

    npx wrangler d1 execute stats --remote --file=migrate-build10.sql
    npx wrangler deploy

(Mehrfach ausführen schadet nicht. Ohne die Tabelle läuft alles, der Langzeit-Verlauf zeigt dann einen Hinweis.)

- **Langzeit-Verlauf** (Reiter Versionen, unten): Tabelle `snap` mit einer Zeile pro Tag – aktive Installationen (30 und 7 Tage), Beta, neueste Version und Anteil, Installationen mit Fehler-Zustimmung, Fehlerquote, fehlerfreie Tage. Keine Kennungen, 2 Jahre aufbewahrt. Geschrieben beim nächtlichen Aufräumen und beim Öffnen der Startseite. Beim ersten Mal werden die vergangenen Tage aus `daily` nachgerechnet (nur aktive Installationen und Beta, Quelle „nachgerechnet“).
- **Verloren nach Update**: je Version die Installationen, die nach dem Wechsel auf diese Version höchstens noch 6 Tage gemeldet haben und seit mindestens 7 Tagen still sind. Updates jünger als 7 Tage zählen noch nicht, ein Wechsel auf eine ältere Version ist kein Update.
- **Treue neuer Installationen**: Kohorten nach der Woche des ersten Tages, Anteil noch aktiv nach 1, 4 und 8 Wochen.
- **Export als CSV** unter `/export/<name>.csv` (nur hinter Access): `versionen`, `reife`, `fehler` (30 Tage), `verlauf`, `verloren`, `treue`, `module`, `ha`. Semikolon, Dezimalkomma, UTF-8 mit BOM – öffnet sich direkt in Excel.
- Banner: Dashboard Build 10.

Tests: zusätzlich `node --no-warnings test/test_build10.js`.

## Build 11: Modul-Nutzung im Verlauf

Worker und eine neue Spalte – kein Update der Integration:

    npx wrangler d1 execute stats --remote --file=migrate-build11.sql
    npx wrangler deploy

(Nur einmal nötig. Ohne die Spalte nimmt der Worker Meldungen weiter an und speichert die Module dann einfach nicht in der Tagesliste.)

- Jede Versions-Meldung speichert die Module jetzt auch in `daily.modules`.
- **Modul-Nutzung im Verlauf** (Reiter Versionen): je Modul der Anteil der Installationen mit Modul an – jetzt, Veränderung gegenüber vor 4 Wochen (Prozentpunkte) und Kurve über 12 Wochen. Je Installation und Woche zählt die letzte Meldung. Module, die in 12 Wochen nirgends an waren, stehen in einer Zeile. Export: `/export/modulverlauf.csv`.
- Banner: Dashboard Build 11.

Tests: zusätzlich `node --no-warnings test/test_build11.js`.

## Build 12: Fehler nach Gerät und Aufrufkette (ab 2026.11.5b3)

Worker und zwei neue Spalten, dazu die Beta 2026.11.5b3 der Integration:

    npx wrangler d1 execute stats --remote --file=migrate-build12.sql
    npx wrangler deploy

(Zuerst ausrollen, dann die Beta veröffentlichen. Ohne die Spalten nimmt der Worker Berichte weiter an und speichert Gerät und Kette nicht.)

- Fehlerbericht Schema 4: je Fehler optional `dev` (Gerätearten `handy`, `tablet`, `pc`, `app`) und `chain` (2–3 Stellen im Format `datei.py:Zeile funktion`, keine absoluten Pfade, kein `..`).
- Gespeichert in `err_hits.dev` (je Tag und Installation) und `err_groups.chain` (letzte gemeldete Kette; ein Bericht ohne Kette überschreibt sie nicht).
- Detailseite: „Stelle“ zeigt die Kette mit „aufgerufen von“, neue Zeile „Gerät“ mit Installationen je Geräteart und dem Hinweis „nur Handy“, wenn alle betroffenen Installationen dieselbe Geräteart melden.
- Banner: Dashboard Build 12.

Tests: zusätzlich `node --no-warnings test/test_build12.js`.
