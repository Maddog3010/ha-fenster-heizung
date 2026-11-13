  /* ================= Mit GitHub freischalten (Konzept Sponsor-Freischaltung, Stufe 2) =================
     Der Sponsor meldet sich per GitHub-Gerätecode an, die Integration erkennt Stufe und Laufzeit selbst (sponsor_github.py).
     Der Schlüssel bleibt als zweiter Weg (Geschenke, Tester, ohne GitHub-Anmeldung). */
  _ghS() { return (this._spnS().gh) || { ready: false, linked: false, flow: null, eval: { ok: false } }; }
  _ghOpen() { this._modal = { type: "spngh" }; this._renderModal(); this._ghWatch(); }
  /* Während der Anmeldung alle 3 s den Stand holen, bis bestätigt, abgelehnt oder abgelaufen */
  _ghWatch() {
    clearInterval(this._ghT);
    this._ghT = setInterval(() => {
      const f = this._ghS().flow, open = this._modal && this._modal.type === "spngh";
      if (!open || !f || !["wait", "check"].includes(f.state)) { clearInterval(this._ghT); this._ghT = null; if (!open) return; }
      this._spnLoad().then(() => { this._spnApply(); if (this._modal && this._modal.type === "spngh") this._renderModal(); if (this._loOpen) this._render(); });
    }, 3000);
  }
  _ghCall(act, then) {
    this._ghBusy = act; if (this._modal) this._renderModal();
    this._hass.callWS({ type: "fenster_heizung/spn_gh", act }).then((r) => { const { result, ...s } = r || {}; this._spnD = s; this._spnApply(); this._ghBusy = ""; if (then) then(result || {}); this._renderModal(); this._render(); })
      .catch((e) => { this._ghBusy = ""; this._renderModal(); this._toast("Das ging nicht: " + ((e && e.message) || "")); });
  }
  _ghAct(a, b) {
    if (a === "spngh") { this._ghOpen(); return; }
    if (a === "spnghgo") { this._ghCall("start", (r) => { if (!r.ok) this._ghErr = r.error === "net" ? "GitHub ist gerade nicht erreichbar. Bitte später noch einmal." : r.error === "not_ready" ? "Die Anmeldung mit GitHub ist noch nicht eingerichtet." : "GitHub hat keinen Code geliefert."; else { this._ghErr = ""; this._ghWatch(); } }); return; }
    if (a === "spnghcancel") { this._ghCall("cancel"); return; }
    if (a === "spnghcheck") { this._ghCall("check", (r) => this._toast(r.ok ? (r.found ? "Geprüft – alles aktuell" : "Kein aktives Sponsoring gefunden") : r.error === "token" ? "Anmeldung abgelaufen – bitte neu anmelden" : "GitHub nicht erreichbar – der letzte Stand gilt weiter")); return; }
    if (a === "spnghout") { this._ghCall("logout", () => this._toast("Von GitHub abgemeldet")); return; }
    if (a === "spnghcode") { this._clip(String((this._ghS().flow || {}).user_code || ""), "Code kopiert"); return; }
    if (a === "spnghkey") { clearInterval(this._ghT); this._modal = { type: "spndlg", err: "" }; this._renderModal(); }
  }
  _ghTierTxt(t) { return t === "max" ? "★ Sponsor Max" : "♥ Sponsor"; }
  _ghAgo(ts) { if (!ts) return "noch nie"; const m = Math.round((Date.now() / 1000 - ts) / 60); return m < 2 ? "gerade eben" : m < 60 ? `vor ${m} Min.` : m < 1440 ? `vor ${Math.round(m / 60)} Std.` : `vor ${Math.round(m / 1440)} ${Math.round(m / 1440) === 1 ? "Tag" : "Tagen"}`; }
  /* „gültig“-Text für GitHub-Freischaltungen: monatlich ohne Datum, einmalig mit Datum */
  _ghValid(E) {
    if (!E || !E.ok) return "";
    if (E.state === "ending") return `Sponsoring beendet · Extras noch bis ${esc(this._spnDate(E.bis))}`;
    if (E.monthly) return "aktiv, solange dein Sponsoring läuft";
    return `gültig bis ${esc(this._spnDate(E.bis))}${E.max_ended ? " (Max endete am " + esc(this._spnDate(E.max_ended)) + ")" : ""}`;
  }
  _ghModal(close) {
    const G = this._ghS(), f = G.flow, E = G.eval || {}, busy = this._ghBusy, url = this._spnS().url;
    const wrap = (sub, body) => `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>${ic("heart", 17)} Mit GitHub freischalten</b><span>${sub}</span></div>${close}</div>${body}</div>`;
    const keyLink = `<div class="ghalt"><button class="lnk" data-act="spnghkey">Ich habe einen Schlüssel</button></div>`;
    if (!G.ready) return wrap("Sponsor-Lounge", `<div class="ghinfo">${ic("info", 18)}<span>Die Anmeldung mit GitHub wird gerade eingerichtet. Bis dahin klappt die Freischaltung mit einem Schlüssel.</span></div>
      <div class="gbtns" style="margin-top:12px"><button class="btn2 pri" data-act="spnghkey">${ic("key", 16)} Schlüssel eingeben</button></div>`);
    /* Anmeldung läuft */
    if (f && ["wait", "check"].includes(f.state)) {
      const left = Math.max(0, Math.round(f.until - Date.now() / 1000)), mm = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
      return wrap("Schritt 2 von 3 · Code bestätigen", `<div class="ghcodebox"><small>Öffne auf einem beliebigen Gerät</small>
        <a class="ghuri" href="${esc(f.uri)}" target="_blank" rel="noopener noreferrer">${esc(f.uri.replace(/^https?:\/\//, ""))}</a>
        <small>und gib diesen Code ein:</small><div class="ghcode" aria-label="Code">${esc(f.user_code)}</div>
        <div class="gbtns ghc"><button class="btn2" data-act="spnghcode">${ic("copy", 16)} Code kopieren</button><a class="btn2 pri" href="${esc(f.uri)}" target="_blank" rel="noopener noreferrer" data-act="spnghcode" style="text-decoration:none">${ic("link", 16)} GitHub öffnen</a></div>
        <div class="ghwait">${f.state === "check" ? `<span class="ghspin"></span>Bestätigt – prüfe dein Sponsoring …` : `<span class="ghspin"></span>Warte auf Bestätigung … noch ${mm}`}</div></div>
        <div class="ghsteps"><span class="dn">1 Code holen</span><span class="cur">2 Auf GitHub bestätigen</span><span>3 Fertig</span></div>
        <div class="gbtns" style="margin-top:10px"><button class="btn2" data-act="spnghcancel">Abbrechen</button></div>`);
    }
    /* Ergebnis der Anmeldung oder bestehende Verbindung */
    if (G.linked) {
      const ok = !!E.ok, nf = !G.found || E.state === "notfound";
      const head = ok ? `<div class="ghres ok">${ic("check", 26)}<div><b>Freigeschaltet</b><span>Danke für deine Unterstützung!</span></div></div>`
        : nf ? `<div class="ghres wa">${ic("info", 26)}<div><b>Kein Sponsoring gefunden</b><span>Für <b>@${esc(G.login)}</b> gibt es auf GitHub kein Sponsoring für Maddog3010.</span></div></div>`
        : `<div class="ghres wa">${ic("clock", 26)}<div><b>${E.state === "stale" ? "Prüfung ausstehend" : E.state === "ended" ? "Sponsoring beendet" : "Abgelaufen"}</b><span>${E.state === "stale" ? "GitHub war länger nicht erreichbar. Tippe auf „Jetzt prüfen“." : "Die Extras sind wieder gesperrt. Mit einem neuen Sponsoring sind sie sofort zurück – Einstellungen bleiben erhalten."}</span></div></div>`;
      const row = (k, v, cls = "") => `<div class="ghrow"><span>${k}</span><b class="${cls}">${v}</b></div>`;
      const rows = `<div class="ghrows">${row("GitHub", "@" + esc(G.login))}${G.found ? row("Stufe auf GitHub", esc(G.tier_name || "–")) : ""}${ok ? row("Freigeschaltet als", this._ghTierTxt(E.tier), E.tier === "max" ? "gd" : "pk") : ""}
        ${G.found ? row("Art", G.one_time ? "einmalig" + (E.since ? " · am " + esc(this._spnDate(E.since)) : "") : "monatlich" + (E.since ? " · seit " + esc(this._spnDate(E.since)) : "")) : ""}${ok ? row("Gültig", E.state === "ending" ? "noch bis " + esc(this._spnDate(E.bis)) : E.monthly ? "solange dein Sponsoring läuft" : "bis " + esc(this._spnDate(E.bis))) : ""}
        ${row("Zuletzt geprüft", this._ghAgo(G.last_try) + (G.err === "net" ? " · offline" : G.err === "token" ? " · Anmeldung abgelaufen" : ""), G.err ? "wa" : "")}${E.tier === "max" && ok ? row("Beta-Versionen", "sofort", "okc") : ok ? row("Beta-Versionen", "3 Tage nach Erscheinen") : ""}</div>`;
      const btns = ok ? `<button class="btn2 pri" data-act="close">${ic("heart", 16)} Zur Lounge</button><button class="btn2" data-act="spnghcheck" ${busy ? "disabled" : ""}>${ic("refresh", 16)} ${busy === "check" ? "Prüfe …" : "Jetzt prüfen"}</button>`
        : `<a class="btn2 spnb pri" href="${esc(url)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none">${ic("heart", 16)} Sponsor werden</a><button class="btn2" data-act="spnghcheck" ${busy ? "disabled" : ""}>${ic("refresh", 16)} ${busy === "check" ? "Prüfe …" : "Nochmal prüfen"}</button>`;
      return wrap(ok ? "Schritt 3 von 3 · Fertig" : "Sponsor-Lounge", `${head}${rows}<div class="gbtns" style="margin-top:12px">${btns}</div>
        <div class="ghalt"><button class="lnk" data-act="spnghout">${nf ? "Anderes GitHub-Konto" : "Von GitHub abmelden"}</button><span>·</span><button class="lnk" data-act="spnghkey">Ich habe einen Schlüssel</button></div>
        <div class="mut sm ghfine">Geprüft wird einmal am Tag. Das Token liegt nur in deinem Home Assistant und kann nur lesen, ob du sponserst – nicht in Sicherungen, widerrufbar unter GitHub → Settings → Applications.</div>`);
    }
    /* Start */
    const why = f && ["denied", "expired", "error"].includes(f.state) ? (f.state === "denied" ? "Die Anmeldung wurde auf GitHub abgelehnt." : f.state === "expired" ? "Der Code ist abgelaufen. Hol dir einfach einen neuen." : "Das hat nicht geklappt. Bitte noch einmal.") : this._ghErr || "";
    return wrap("Schritt 1 von 3", `<div class="ghhero"><div class="ghlogo">${ic("heart", 26)}</div><div><b>Du sponserst Strom &amp; Wärme?</b><span>Melde dich einmal mit GitHub an – deine Stufe wird automatisch erkannt. Ohne Mail, ohne Warten.</span></div></div>
      <div class="ghsteps"><span class="cur">1 Code holen</span><span>2 Auf GitHub bestätigen</span><span>3 Fertig</span></div>
      <div class="ghlist"><div>${ic("check", 15)}<span><b>Sofort</b> – Extras sind nach der Bestätigung frei</span></div><div>${ic("check", 15)}<span><b>Automatisch</b> – Wechsel zu Max, Verlängerung und Ende erkennt die Integration selbst</span></div><div>${ic("lock", 15)}<span><b>Nur lesen</b> – GitHub zeigt nur, ob du sponserst. Kein Zugriff auf Repos oder Mails</span></div></div>
      <div class="tmerr" role="alert">${esc(why)}</div>
      <div class="gbtns" style="margin-top:6px"><button class="btn2 spnb pri" data-act="spnghgo" ${busy ? "disabled" : ""}>${ic("key", 16)} ${busy === "start" ? "Hole Code …" : "Code anfordern"}</button></div>${keyLink}`);
  }
  /* Verwaltung: Stand der GitHub-Freischaltung und Zuordnung der Stufen (Datei sponsor_gesperrt.json im Repo) */
  _ghAdm() {
    const G = this._ghS(), A = this._spnA || {};
    let rev = []; try { rev = JSON.parse(A.revoked_json || "{}").gesperrt || []; } catch (_) { /* leer */ }
    const json = JSON.stringify({ gesperrt: rev, github_stufen: { max: G.stufen && G.stufen.length ? G.stufen : ["$3 a month", "$10 one time"] } });
    return `<div class="lsec" style="margin-top:16px">${ic("link", 15)}Freischaltung über GitHub</div>
      <div class="vrow"><span>Anmeldung mit GitHub<small class="mut" style="display:block">${G.ready ? "eingerichtet – Sponsoren schalten sich selbst frei" : "noch keine Client-ID der OAuth-App im Code (sponsor_github.py)"}</small></span><em class="sxc ${G.ready ? "ok" : "wa"}">${G.ready ? "Aktiv" : "Fehlt"}</em></div>
      <div class="vrow"><span>Stufen für ★ Max<small class="mut" style="display:block">Name der GitHub-Stufe, alle anderen als ♥ Sponsor. Freie Beträge: monatlich ab $3, einmalig ab $10 = Max</small></span><span class="ghtiers">${(G.stufen || []).map((n) => `<em class="lgchip gd">${esc(n)}</em>`).join("")}</span></div>
      <div class="mut sm" style="margin:6px 0">Ändern ohne neue Version: diese Zeile als <b>sponsor_gesperrt.json</b> ins Repo legen (Namen anpassen). Die Integration lädt sie einmal am Tag.</div>
      <div class="spnkeybox" style="color:#9be7c4">${esc(json)}</div>
      <div class="gbtns" style="margin-top:8px"><button class="btn2" data-act="spnjson2" data-j="${esc(json)}">${ic("copy", 16)} Zeile kopieren</button></div>`;
  }
