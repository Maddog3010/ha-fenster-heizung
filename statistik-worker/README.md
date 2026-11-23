# Statistik-Worker (Cloudflare) – Versions-Statistik für „Strom & Wärme“

Alternative zum Proxmox-Server in `../statistik-server/`: gleiche Schnittstelle (`POST /v1/ping`, `POST /v1/forget`),
gleiche Auswertung, aber auf Cloudflare Workers + D1. Das Dashboard liegt auf `dash.stromwaerme.dev` hinter Cloudflare Access;
der Worker prüft das Access-Token zusätzlich selbst (RS256, Aussteller, AUD, Ablauf) und sperrt ohne gültige Konfiguration.

Einrichtung: siehe `Anleitung_Statistik-Cloudflare-Worker.pdf`. Kurz:

    npx wrangler login
    npx wrangler d1 create stats          # database_id in wrangler.toml eintragen
    npx wrangler d1 execute stats --remote --file=schema.sql
    npx wrangler deploy                   # danach Access-Anwendung für dash.… anlegen, TEAM_DOMAIN/POLICY_AUD eintragen, erneut deploy

Tests: `node --no-warnings test/test.js && node --no-warnings test/test_fehler.js` (Node ≥ 22.5, nutzt `node:sqlite` als D1-Ersatz).

## Fehler-Statistik (ab 2026.11.5b3)

Eingang `POST /v1/errors` (Bericht mit höchstens 50 bereinigten Programmfehlern, max. 64 KB, 1 pro Kennung und Stunde) und
`POST /v1/errors/forget` (alle Berichte einer Kennung löschen). Dashboard: Reiter **Fehler** auf `dash.…/fehler` – gleiche Fehler
sind eine Zeile (Fingerabdruck), sortiert nach betroffenen Installationen, Filter nach Zeitraum, Modul und Quelle; Detail unter
`/fehler/<fp>` mit Status (offen, in Arbeit, behoben in …, ignorieren), Issue-Nummer und „GitHub-Issue anlegen“ (Repo aus `GITHUB_REPO`). Status-Änderungen nur per POST aus dem eigenen Dashboard (gleiche Herkunft) und hinter Access. Berichte werden nach 90 Tagen gelöscht. **Nach dem Update einmal ausführen:**

    npx wrangler d1 execute stats --remote --file=schema.sql
    npx wrangler deploy
