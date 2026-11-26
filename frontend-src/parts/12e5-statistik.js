  /* ================= Versions-Statistik (freiwillig, anonym) =================
     Popup einmalig nach dem Update (nur Administratoren, nicht im Tablet-Modus) und Seite Einstellungen → System → Versions-Statistik.
     Gesendet wird höchstens 1× pro Tag: zufällige Kennung, Versionsnummer, Kanal, die Kurzzeichen der eingeschalteten Module und die HA-Version ohne Patch-Stufe (stats.py). Ohne „Ja“ wird nichts gesendet. */
  _stsS() { return this._stsD || { ok: false, asked: true, on: false, version: "", channel: "stable", id: "", last_ok: 0, last_try: 0, next: 0, err: "", url_dev: "", payload: null }; }
  _stsWS(act, extra = {}) {
    return this._hass.callWS({ type: "fenster_heizung/stats", act, ...extra }).then((r) => { this._stsD = r; return r; });
  }
  /* beim Start: Stand laden und – falls noch nie gefragt – das Popup zeigen, sobald nichts anderes offen ist */
  _stsInit() {
    this._stsWS("get").then((r) => { if (r && !r.asked) this._stsTry(0); }).catch(() => { /* Statistik ist optional */ });
  }
  _stsTry(n) {
    const S = this._stsS();
    if (S.asked || n > 12) return;
    const busy = this._modal || this._blOn() || this._tmOn();
    if (this._tmOn()) return;  // an der Wandtafel nicht fragen; es kommt beim nächsten Öffnen am Handy oder Computer
    if (busy) { setTimeout(() => this._stsTry(n + 1), 15000); return; }
    setTimeout(() => { if (!this._modal && !this._stsS().asked) { this._askShown = true; this._modal = { type: "sts", mode: "ask", first: true }; this._renderModal(); } }, n ? 0 : 2500);
  }
  _stsWhen(ts, next) {
    if (!ts) return next ? "gleich" : "noch nicht";
    const d = new Date(ts * 1000), now = new Date(), p = (x) => String(x).padStart(2, "0"), hm = `${p(d.getHours())}:${p(d.getMinutes())}`;
    const day = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime(), diff = Math.round((day(d) - day(now)) / 864e5);
    if (next && ts * 1000 <= Date.now()) return "gleich";
    if (diff === 0) return next ? "heute" : `heute, ${hm}`;
    if (diff === 1) return "morgen";
    if (diff === -1) return `gestern, ${hm}`;
    return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${next ? "" : ", " + hm}`;
  }
  /* Zeile in Einstellungen → System */
  _stsRow(row) {
    const S = this._stsS();
    return row("chart", "Versions-Statistik", S.on ? "Sendet 1× pro Tag anonym die Versionsnummer" : "Aus · freiwillig, nur Versionsnummer", "stsopen", "", `<em class="sxc ${S.on ? "ok" : "off"}">${S.on ? "An" : "Aus"}</em>`);
  }
  _stsModal() {
    const S = this._stsS(), m = this._modal, x = `<button class="ibtn" data-act="${m.mode === "ask" ? "stsno" : "close"}" aria-label="Schließen">${ic("close", 20)}</button>`;
    const link = `<a class="stslk" href="https://github.com/Maddog3010/ha-fenster-heizung#versions-statistik-und-datenschutz" target="_blank" rel="noopener noreferrer">Datenschutz</a>`;
    const wrap = (title, sub, body, ov) => `<div class="ov" data-act="${ov}"></div><div class="sheet stssh" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sh"><div><b>${title}</b>${sub ? `<span>${sub}</span>` : ""}</div>${x}</div>${body}</div>`;
    if (m.mode === "data") {
      const P = S.payload, json = P ? JSON.stringify(P, null, 2) : "";
      return wrap("Gesendete Daten", S.on ? "Genau das wird gesendet" : "So sieht die Meldung aus (Beispiel-Kennung)",
        `<pre class="stsjs" aria-label="Meldung">${esc(json)}</pre>
         <div class="mut sm" style="margin:2px 0 10px">Das ist alles. Keine IP-Adresse, kein Name, keine Räume, Geräte oder Sensorwerte. Gesendet wird höchstens 1× pro Tag${S.on ? "" : ", und erst nach deinem „Ja“"}.</div>
         <div class="gbtns"><button class="btn2" data-act="stscopy">Kopieren</button><button class="btn2 pri" data-act="stsback">Schließen</button></div>`, "stsback");
    }
    if (m.mode === "del") {
      return wrap("Daten auf dem Server löschen?", "", `<div class="stsbox">Der Server vergisst deine Kennung, hier wird sie gelöscht und die Statistik schaltet sich aus. Du kannst sie später jederzeit neu einschalten (mit neuer Kennung).</div>
        <div class="gbtns"><button class="btn2" data-act="stsback">Abbrechen</button><button class="btn2 stsdan" data-act="stsdelok">Löschen und ausschalten</button></div>`, "stsback");
    }
    if (m.mode === "ask") {
      return wrap(`${ic("chart", 18)} Hilf mit, Strom &amp; Wärme besser zu machen`, "",
        `<p class="stsp">Darf die Integration anonym mitteilen, welche Version du nutzt und welche Module eingeschaltet sind? Es werden <b>nur diese Angaben</b> erhoben – sonst nichts.</p>
         <div class="stsbox"><b class="stsh">Das wird gesendet (höchstens 1× pro Tag)</b>
           <ul><li>Zufällige Kennung (ohne Bezug zu dir oder Home Assistant)</li><li>Versionsnummer, z. B. ${esc(S.version || "2026.11.4")}</li><li>Kanal: Stabil oder Beta</li><li>Welche Module an sind, nur als Kurzzeichen (z. B. ww, en, gs)</li><li>Home-Assistant-Version ohne Patch-Stufe, z. B. 2026.11</li></ul></div>
         <div class="mut sm">Nicht gesendet: Name, Standort, Räume, Geräte, Sensorwerte, eigene Erweiterungen. Deine IP-Adresse wird nicht gespeichert.</div>
         <div class="stslks"><button class="lnk" data-act="stsdata">Gesendete Daten ansehen</button><span>·</span>${link}</div>
         <div class="gbtns"><button class="btn2 pri" data-act="stsyes">Ja, teilnehmen</button><button class="btn2" data-act="stsno">Nein danke</button></div>
         <div class="mut sm" style="text-align:center;margin:2px 0 0">Jederzeit änderbar: Einstellungen → System → Versions-Statistik</div>`, "stsno");
    }
    /* Seite „Versions-Statistik“ */
    const sw = `<button class="sw ${S.on ? "on" : ""}" data-act="${S.on ? "stsoff" : "stsask"}" role="switch" aria-checked="${S.on}" aria-label="Versions-Statistik"></button>`;
    const when = (t, n) => this._stsWhen(t, n);
    const fail = S.on && S.last_try > S.last_ok && S.err;
    const body = S.on ? `<div class="stsrows"><div><span>Zuletzt gesendet</span><b class="${S.last_ok ? "stsok" : ""}">${esc(when(S.last_ok))}${S.last_ok ? " ✓" : ""}</b></div>
         <div><span>Nächste Meldung</span><b>${esc(when(S.next, true))}</b></div>
         <div><span>Version · Kanal</span><b>${esc(S.version)} · ${S.channel === "beta" ? "Beta" : "Stabil"}</b></div>
         <div><span>Aktive Module</span><b>${esc(((S.payload && S.payload.modules) || []).join(", ") || "–")}</b></div>
         <div><span>Kennung</span><b>${esc(S.id)}</b></div></div>
       <div class="gbtns"><button class="btn2 pri" data-act="stsdata">Gesendete Daten ansehen</button></div>
       <div class="gbtns"><button class="btn2" data-act="stssend"${m.busy ? " disabled" : ""}>${m.busy ? "Sendet …" : "Jetzt senden"}</button><button class="btn2" data-act="stsreset">Kennung zurücksetzen</button></div>
       <div class="gbtns"><button class="btn2 stsdan" data-act="stsdel">Meine Daten auf dem Server löschen</button></div>
       ${fail ? `<div class="stsnote">Der Server war zuletzt nicht erreichbar. Das ist kein Fehler: Die Integration läuft normal weiter und versucht es am nächsten Tag erneut.</div>` : `<div class="stsnote">Ist der Server nicht erreichbar, passiert nichts: Die Integration läuft normal weiter und versucht es am nächsten Tag erneut.</div>`}`
      : `<div class="stsbox">Du hilfst, Strom &amp; Wärme besser zu machen, wenn du die Statistik einschaltest. Du kannst das jederzeit ändern.</div>
       <div class="gbtns"><button class="btn2 pri" data-act="stsask">Einschalten und Erklärung ansehen</button></div>`;
    return wrap("Versions-Statistik", "Einstellungen › System",
      `<div class="vrow"><span><b>Versions-Statistik</b><small class="mut" style="display:block">${S.on ? "Sendet höchstens 1× pro Tag anonym deine Versionsnummer, welche Module an sind und die Home-Assistant-Version (ohne Patch-Stufe). Sonst nichts." : "Aus. Es wird nichts gesendet und es gibt keine Kennung."}</small></span>${sw}</div>
       ${body}<div class="stslks"><button class="lnk" data-act="stsdata">Was wird gesendet?</button><span>·</span>${link}</div>`, "close");
  }
  _stsAct(a, b) {
    const m = this._modal, S = this._stsS(), fail = () => this._toast("Das ging nicht");
    if (a === "stsopen") { this._modal = { type: "sts", mode: "main" }; this._renderModal(); this._stsWS("get").then(() => { if (this._modal && this._modal.type === "sts") this._renderModal(); }).catch(() => {}); return; }
    if (a === "stsurl") { const el = this.shadowRoot.querySelector('[data-f="stsurl"]'); this._stsWS("opts", { url_dev: String((el && el.value) || "").trim() }).then(() => { this._renderModal(); this._toast("Gespeichert"); }).catch(fail); return; }
    if (!m || m.type !== "sts") return;
    const done = () => { this._modal = null; this._renderModal(); this._render(); };
    if (a === "stsyes") this._stsWS("answer", { on: true }).then(() => { this._toast("Danke fürs Mitmachen"); done(); }).catch(fail);
    else if (a === "stsno") this._stsWS("answer", { on: false }).then(() => { this._modal = null; this._renderModal(); this._render(); }).catch(() => { this._modal = null; this._renderModal(); });
    else if (a === "stsask") { m.mode = "ask"; m.from = "main"; this._renderModal(); }
    else if (a === "stsoff") this._stsWS("answer", { on: false }).then(() => { m.mode = "main"; this._renderModal(); this._render(); this._toast("Statistik ausgeschaltet"); }).catch(fail);
    else if (a === "stsdata") { m.back = m.mode; m.mode = "data"; this._renderModal(); }
    else if (a === "stsback") { m.mode = m.back || "main"; m.back = ""; this._renderModal(); }
    else if (a === "stscopy") this._clip(JSON.stringify(S.payload, null, 2), "Kopiert");
    else if (a === "stssend") { m.busy = true; this._renderModal(); this._stsWS("send").then((r) => { m.busy = false; this._renderModal(); this._toast(r.sent ? "Gesendet" : "Server nicht erreichbar – neuer Versuch folgt"); }).catch(() => { m.busy = false; this._renderModal(); fail(); }); }
    else if (a === "stsreset") this._stsWS("reset").then(() => { this._renderModal(); this._toast("Neue Kennung erzeugt"); }).catch(fail);
    else if (a === "stsdel") { m.mode = "del"; this._renderModal(); }
    else if (a === "stsdelok") this._stsWS("forget").then((r) => { m.mode = "main"; this._renderModal(); this._render(); this._toast(r.forgotten ? "Gelöscht, Statistik aus" : "Hier gelöscht, Server nicht erreichbar"); }).catch(fail);
  }
