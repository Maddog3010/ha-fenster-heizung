# Support-Vermittler für den Support-Chat

Der Support-Chat im Dashboard (Sponsor-Bereich bzw. Sponsor-Lounge → Support) schickt Nachrichten über diesen kleinen
Vermittler an deinen Telegram-Bot. Der Chat ist für alle da, Sponsor Max ist als „bevorzugt“ markiert.
Du antwortest in Telegram, die Antwort erscheint beim Nutzer im Chat.

```
Dashboard → Integration → Vermittler (Cloudflare Worker) → Telegram-Bot → deine Telegram-App
                                         ↑                                   │
                                         └──── Antwort (Wischen → Antworten) ┘
```

Kosten: keine (Cloudflare Workers und KV im kostenlosen Tarif reichen weit).
Der Bot-Token liegt nur im Worker, nie in der Integration.

## Einmal einrichten (ca. 15 Minuten)

### 1. Telegram-Bot anlegen
1. In Telegram **@BotFather** öffnen und `/newbot` schicken.
2. Namen wählen, z. B. `Strom & Wärme Support`, und einen Benutzernamen, der auf `bot` endet.
3. BotFather schickt den **Token** (sieht aus wie `123456:ABC…`). Gut aufheben, nicht weitergeben.

### 2. Cloudflare-Konto und KV-Speicher
1. Auf <https://dash.cloudflare.com> kostenlos registrieren.
2. Links **Storage & Databases → KV** → **Create namespace**, Name: `strom-waerme-support`.

### 3. Worker anlegen
1. Links **Compute → Workers & Pages** → **Create** → **Create Worker**, Name z. B. `strom-waerme-support` → **Deploy**.
2. **Edit code**: den gesamten Inhalt von `worker.js` aus diesem Ordner einfügen → **Deploy**.
3. Im Worker **Settings → Bindings → Add → KV namespace**: Variable name `CHAT`, Namespace `strom-waerme-support`.
4. **Settings → Variables and Secrets → Add**:
   - `BOT_TOKEN` (Typ *Secret*): der Token aus Schritt 1
   - `TG_SECRET` (Typ *Secret*): ein langes, beliebiges Passwort (z. B. 40 zufällige Zeichen)
   - `ADMIN_CHAT_ID` (Typ *Text*): erst einmal `0`, kommt in Schritt 5
5. Die Adresse des Workers notieren, z. B. `https://strom-waerme-support.DEINNAME.workers.dev`.

### 4. Telegram mit dem Worker verbinden
Im Browser öffnen (mit deinem `TG_SECRET`):

```
https://strom-waerme-support.DEINNAME.workers.dev/setup?key=DEIN_TG_SECRET
```

Es erscheint „Webhook gesetzt“ und der Name deines Bots.

### 5. Deine Chat-ID eintragen
1. In Telegram deinem Bot `/start` schicken. Er antwortet mit **Deine Chat-ID: …**.
2. Im Worker `ADMIN_CHAT_ID` auf diese Zahl ändern → speichern.
3. Ab jetzt nimmt der Bot nur noch von dir Antworten an.

### 6. Adresse in die Integration
Die Worker-Adresse gibst du Claude. Sie kommt fest in `support.py` (`SUPPORT_URL`), damit der Chat bei allen
Nutzern funktioniert. Zum Testen vorher geht sie auch nur bei dir: Sponsoren verwalten → Support-Chat → Test-Adresse.

## So antwortest du
- Jede Nachricht kommt mit Kopf: **⭐ SPONSOR MAX · bevorzugt**, **♥ Sponsor** oder **💬 Nutzer (ohne Sponsoring)**, Name, Kurznummer der Installation
  (z. B. `#3fa1`) und wie geprüft wurde (Schlüssel #0002 oder GitHub).
- Angehängte Diagnosen kommen als Datei `diagnose-xxxx.json` direkt darunter.
- **Antworten:** Auf die Nachricht wischen (oder lange drücken → Antworten) und schreiben. Der Bot setzt ein 👍,
  wenn die Antwort abgelegt ist. Beim Nutzer erscheint sie spätestens nach 15 Minuten, bei offenem Chat nach 20 Sekunden.
- Schreibst du ohne „Antworten“, erinnert dich der Bot daran – er weiß sonst nicht, an wen die Nachricht geht.
- Auf deine eigene Antwort kannst du ebenfalls antworten, sie geht an dieselbe Person.

## Was geprüft und gespeichert wird
- Der Chat steht allen offen. Bei jeder Nachricht wird geprüft, ob ein Sponsoring besteht: gültiger Sponsor-Schlüssel
  (gleicher öffentlicher Schlüssel wie in der Integration, Sperrliste `sponsor_gesperrt.json` wird beachtet) oder
  GitHub-Anmeldung (der Worker fragt GitHub selbst). Max wird genauso erkannt wie in der Integration und als
  „bevorzugt“ markiert. Ohne Sponsoring kommt die Nachricht als „Nutzer“ an.
- Mengen-Grenze je Installation: Sponsoren 30 Nachrichten pro Stunde, ohne Sponsoring 10 pro Stunde und 30 pro Tag.
- Im KV-Speicher: Installations-Nummer mit Prüfwert des Geheimnisses, Name, Stufe und der Verlauf (höchstens
  200 Nachrichten). Alles läuft nach 180 Tagen ohne neue Nachricht von selbst ab. „Verlauf löschen“ im Chat löscht sofort.
