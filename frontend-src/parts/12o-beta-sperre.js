  /* ================= Beta-Freigabe ab 2026.11.2: Testversionen für Sponsor Max sofort, für Sponsoren 3 Tage nach Erscheinen =================
     Ist eine Testversion (z. B. 2026.12.1b1) installiert und noch nicht freigegeben, zeigt das Panel statt der Module eine Seite mit dem
     Weg zurück zur letzten stabilen Version. Die Automatiken in Home Assistant laufen weiter, gesperrt ist nur die Oberfläche.
     Entwickler zählen als Max. Die Erscheinungszeit kommt von GitHub, sonst aus dem Stempel im Build (_rtcache.py, mit Prüfsumme). Fehlt beides, bleibt die Testversion für Sponsoren gesperrt.
     Gerechnet wird mit der Internetzeit (Date-Kopf von GitHub, sonst vom Versionsdienst von Home Assistant), nicht mit der Uhr von Rechner oder Home Assistant. */
  _blFreeAt() {   // Zeitpunkt, ab dem die installierte Testversion für Sponsoren frei ist (ms) oder 0, wenn unbekannt
    const t = Date.parse((this._blG || {}).cur_ts || ""); return Number.isFinite(t) ? t + BL_SPONSOR_DAYS * 864e5 : 0;
  }
  _blNow() {      // Internetzeit (vom Backend aus dem Date-Kopf von GitHub) plus monotone Browserzeit – die Uhr des Rechners zählt nicht
    const u = this._blG || {};
    if (u !== this._blU) { this._blU = u; this._blB = Number.isFinite(u.net_now) ? [u.net_now, performance.now()] : null; }
    return this._blB ? this._blB[0] + (performance.now() - this._blB[1]) : Date.now();
  }
  _blState() {    // "" = frei · "sp" = Sponsor, noch nicht frei · "none" = ohne Sponsoring
    if (!vbeta(this._ver) || !this._spnD || !this._blG || !this._blG.beta) return "";  // erst sperren, wenn Sponsor-Stand und Freigabe geladen sind
    if (this._lgMax()) return "";
    const s = this._spnS();
    if (s.active) { const f = this._blFreeAt(); return f && this._blNow() >= f ? "" : "sp"; }  // ohne Erscheinungszeit (Stempel fehlt oder verändert) bleibt gesperrt
    return "none";
  }
  _blOn() { return !!this._blState(); }
  _blStable() { const u = { ...(this._upd || {}), ...(this._blG || {}) }; return u.stable && !vbeta(u.stable) ? u.stable : ""; }
  _blWhen(t) { const d = new Date(t); return `${d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "numeric" })} um ${d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr`; }
  _blRender() {
    const sr = this.shadowRoot, main = sr.getElementById("main"); if (!main) return;
    const s = this._spnS(), v = this._ver, st = this._blStable(), adm = this._admin(), state = this._blState(), wasMax = s.tier === "max" && !s.active;
    const hacs = "/hacs/repository?owner=Maddog3010&repository=ha-fenster-heizung", f = this._blFreeAt();
    const left = f ? Math.max(0, f - this._blNow()) : 0, dd = Math.floor(left / 864e5), hh = Math.ceil((left % 864e5) / 36e5);
    const step = (n, t, sub) => `<div class="blstp"><em>${n}</em><span><b>${t}</b><small>${sub}</small></span></div>`;
    const sp = state === "sp";
    const head = sp ? "Diese Testversion ist bald für dich frei" : "Testversionen sind für Sponsoren";
    const txt = sp ? (f ? `Als Sponsor kannst du Testversionen 3 Tage nach Erscheinen nutzen. <b>${esc(v)}</b> ist für dich ab <b>${esc(this._blWhen(f))}</b> frei. Mit Sponsor Max sofort.`
        : `Als Sponsor kannst du Testversionen 3 Tage nach Erscheinen nutzen. Bei <b>${esc(v)}</b> lässt sich der Erscheinungstag nicht prüfen. Installiere die Testversion bitte neu über HACS oder wechsle zur stabilen Version. Mit Sponsor Max sofort.`)
      : `${wasMax ? "Dein Sponsor-Max-Schlüssel ist abgelaufen. " : ""}Testversionen aus dem Beta-Kanal kannst du mit <b>Sponsor Max sofort</b> und als <b>Sponsor 3 Tage nach Erscheinen</b> nutzen. Bitte wechsle bis dahin zur ${st ? `letzten stabilen Version <b>${esc(st)}</b>` : "letzten stabilen Version"}.`;
    main.innerHTML = `<div class="blwrap"><div class="blcard">
      <div class="blhead"><span class="blic">${ic("flask", 30)}</span><div><em class="lgchip bl">Testversion ${esc(v)}</em><h2>${head}</h2></div></div>
      <p>${txt}</p>
      ${sp && left ? `<div class="blcount"><div><b>${dd}</b><small>${dd === 1 ? "Tag" : "Tage"}</small></div><div><b>${hh}</b><small>${hh === 1 ? "Stunde" : "Stunden"}</small></div><span>bis zur Freigabe</span></div>` : ""}
      <div class="blok">${ic("check", 16)}<span>Heizung, Fenster-Automatik und alle Regeln laufen im Hintergrund normal weiter. Räume, Pläne und Einstellungen bleiben erhalten.</span></div>
      ${adm ? `<div class="blsteps">${step(1, "HACS öffnen", "Strom &amp; Wärme")}${step(2, `⋮ → Erneut herunterladen`, st ? `Version ${esc(st)} wählen` : "die oberste Version ohne „b“ wählen")}${step(3, "Home Assistant neu starten", "danach ist alles wieder frei")}</div>
      <div class="lgbtns"><a class="btn2 pri" href="${hacs}" target="_top" style="text-decoration:none">${ic("download", 16)} ${st ? `Zurück zu ${esc(st)}` : "In HACS öffnen"}</a><a class="btn2 lggold" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none">★ Sponsor Max · ab $3 im Monat</a></div>
      <div class="blfoot">${sp ? "" : `<a class="lnk" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none">♥ Sponsor werden</a> · `}<button class="lnk" data-act="spnkeydlg">Ich habe einen Schlüssel</button></div>`
      : `<div class="blok wa">${ic("info", 16)}<span>Bitte die Person mit Admin-Rechten in Home Assistant, zur stabilen Version zu wechseln.</span></div>`}
    </div></div>`;
  }
