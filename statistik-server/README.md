# Statistik-Server für „Strom & Wärme“

Nimmt die freiwillige, anonyme **Versions-Statistik** der Integration an und zeigt sie dir in einem Dashboard.
Läuft ohne Zusatzpakete (nur Python 3) in einem kleinen Container auf deinem Proxmox.

**Zwei getrennte Wege, damit nur du die Auswertung siehst:**

| Weg | Wer | Wie |
|---|---|---|
| **Eingang** (Port 8081, nur `127.0.0.1`) | die Integrationen der Nutzer | über einen Cloudflare Tunnel; nimmt nur `POST /v1/ping` und `POST /v1/forget` an und gibt nie Daten heraus |
| **Dashboard** (Port 8443, nur LAN-IP) | nur du | Passwort; von unterwegs per WireGuard der Fritzbox. Kein Port am Router offen |

Gespeichert wird je Installation: zufällige Kennung, Version, Kanal, erster und letzter Tag. **Keine IP-Adressen, keine Protokolle.**
Kennungen ohne Meldung werden nach 180 Tagen gelöscht.

## 1. Container auf dem Proxmox anlegen

1. Proxmox → **Container erstellen**: Vorlage Debian 12, Name `stats`, *unprivilegiert*, 1 Kern, 512 MB RAM, 4 GB Platte.
2. Netzwerk: **feste IP** im Heimnetz (zum Beispiel `192.168.1.50/24`, Gateway = Fritzbox). Bei Optionen „Beim Booten starten“ einschalten.
3. Container starten, Konsole öffnen und `apt update && apt install -y python3 curl` ausführen.

## 2. Server installieren

Den Ordner `statistik-server` in den Container kopieren (zum Beispiel `scp -r statistik-server root@192.168.1.50:/root/`), dann im Container:

```bash
cd /root/statistik-server
./install.sh
python3 /opt/stats/server.py hash          # Passwort wählen (mindestens 10 Zeichen), die Zeile DASH_PASS_HASH=… kopieren
nano /etc/stats/stats.env                  # DASH_HOST (LAN-IP des Containers) und DASH_PASS_HASH eintragen
systemctl enable --now stats
systemctl status stats                     # „active (running)“
```

Test im Heimnetz: `http://192.168.1.50:8443` im Browser öffnen, anmelden (Benutzer `admin`). Ohne Daten steht überall „Noch keine Daten“.

*Optional HTTPS im Heimnetz* (selbst signiert; der Browser warnt einmal):

```bash
openssl req -x509 -newkey rsa:3072 -nodes -days 3650 -subj "/CN=stats" -keyout /etc/stats/key.pem -out /etc/stats/cert.pem
chgrp stats /etc/stats/key.pem /etc/stats/cert.pem && chmod 640 /etc/stats/key.pem
# in /etc/stats/stats.env: TLS_CERT=/etc/stats/cert.pem und TLS_KEY=/etc/stats/key.pem einkommentieren
systemctl restart stats
```

## 3. Cloudflare Tunnel (der Eingang für die Meldungen)

1. Im Cloudflare-Konto: **Zero Trust → Networks → Tunnels → Create a tunnel** (Typ *Cloudflared*), Name `stats`.
2. Die angezeigten Befehle für **Debian** im Container ausführen (installiert `cloudflared` und verbindet den Tunnel).
3. Reiter **Public Hostname** → hinzufügen: Subdomain `stats`, Domain `stromwaerme.dev`, Dienst **HTTP** `localhost:8081`.
4. Test von irgendwo: `curl https://stats.stromwaerme.dev/health` → `{"ok": true}`. Alles andere (zum Beispiel `/`) liefert 404.

Die Adresse `https://stats.stromwaerme.dev` ist in der Integration fest eingetragen (`stats.py`, `STATS_URL`).

## 4. Von unterwegs (WireGuard der Fritzbox)

Fritzbox → **Heimnetz → Netzwerk → … → WireGuard** (Fritz!OS 7.50 oder neuer): neue Verbindung für iPhone bzw. iMac anlegen, QR-Code oder Datei importieren.
Mit aktivem WireGuard erreichst du `http(s)://192.168.1.50:8443` auch außer Haus. **Kein Port-Forwarding am Router.**

## 5. Mit Home Assistant testen

Ohne Tunnel: in `/etc/stats/stats.env` kurz `INGEST_HOST=192.168.1.50` setzen, `systemctl restart stats`.
In der Integration: **Einstellungen → Sponsor → Verwaltung → Versions-Statistik → Test-Adresse** `http://192.168.1.50:8081` speichern,
dann **Einstellungen → System → Versions-Statistik → Einschalten** und **Jetzt senden**. Im Dashboard erscheint eine Installation.
Danach `INGEST_HOST` wieder auf `127.0.0.1` stellen, neu starten und die Test-Adresse in der Integration leeren.

## Betrieb

- **Sichern:** Die ganze Datenbank ist die Datei `/var/lib/stats/stats.db`. Proxmox-Backup (vzdump) des Containers genügt.
- **Aktualisieren:** neue `server.py` nach `/opt/stats/` kopieren, `systemctl restart stats`.
- **Löschen einer Kennung** (zum Beispiel auf Wunsch per E-Mail): `sqlite3` ist nicht nötig, die Nutzer können es selbst in der Integration (**Meine Daten auf dem Server löschen**).
- **Tests:** `python3 -m pytest tests/test_stats_server.py` im Repository.

## Hinweise zum Datenschutz

- Die Teilnahme ist freiwillig und wird in der Integration erklärt (Popup, README-Abschnitt „Versions-Statistik und Datenschutz“).
- Die Zahlen sind Untergrenzen (nur Teilnehmende zählen) und zeigen Trends, keine absolute Nutzerzahl.
- Cloudflare sieht als Tunnel-Anbieter technisch die Verbindung. Das gehört in den Datenschutztext (steht im README).
