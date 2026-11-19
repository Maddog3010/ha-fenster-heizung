#!/usr/bin/env bash
# Installiert den Statistik-Server in einem Debian-/Ubuntu-Container (als root ausführen, im Ordner statistik-server).
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo "Bitte als root ausführen."; exit 1; }
command -v python3 >/dev/null || { echo "python3 fehlt: apt install -y python3"; exit 1; }
here="$(cd "$(dirname "$0")" && pwd)"

id stats >/dev/null 2>&1 || useradd --system --home /var/lib/stats --shell /usr/sbin/nologin stats
install -d -o root -g root -m 755 /opt/stats
install -d -o stats -g stats -m 750 /var/lib/stats
install -d -o root -g stats -m 750 /etc/stats
install -m 644 "$here/server.py" /opt/stats/server.py
install -m 644 "$here/stats.service" /etc/systemd/system/stats.service
if [ ! -f /etc/stats/stats.env ]; then
  install -m 640 -o root -g stats "$here/stats.env.example" /etc/stats/stats.env
  echo "Neue Einstellungen angelegt: /etc/stats/stats.env  (DASH_HOST und DASH_PASS_HASH eintragen)"
fi
systemctl daemon-reload
echo
echo "Nächste Schritte:"
echo "  1. Passwort-Hash erzeugen:   python3 /opt/stats/server.py hash"
echo "  2. In /etc/stats/stats.env eintragen: DASH_HOST (LAN-IP) und DASH_PASS_HASH"
echo "  3. Starten:                  systemctl enable --now stats && systemctl status stats"
