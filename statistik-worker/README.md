# Statistik-Worker (Cloudflare) – Versions-Statistik für „Strom & Wärme“

Alternative zum Proxmox-Server in `../statistik-server/`: gleiche Schnittstelle (`POST /v1/ping`, `POST /v1/forget`),
gleiche Auswertung, aber auf Cloudflare Workers + D1. Das Dashboard liegt auf `dash.stromwaerme.dev` hinter Cloudflare Access;
der Worker prüft das Access-Token zusätzlich selbst (RS256, Aussteller, AUD, Ablauf) und sperrt ohne gültige Konfiguration.

Einrichtung: siehe `Anleitung_Statistik-Cloudflare-Worker.pdf`. Kurz:

    npx wrangler login
    npx wrangler d1 create stats          # database_id in wrangler.toml eintragen
    npx wrangler d1 execute stats --remote --file=schema.sql
    npx wrangler deploy                   # danach Access-Anwendung für dash.… anlegen, TEAM_DOMAIN/POLICY_AUD eintragen, erneut deploy

Tests: `node --no-warnings test/test.js` (Node ≥ 22.5, nutzt `node:sqlite` als D1-Ersatz).
