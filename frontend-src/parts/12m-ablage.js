  /* ================= Automatische Sicherung auf einen Homeserver (WebDAV, SMB, Ordner) ================= */
  _ebkHtml(m) {
    if (!this._admin()) return "";
    const c = m.ebk, head = `<div class="lsec">${ic("upload", 15)}Auf einen Homeserver sichern</div>`;
    if (!c) return head + `<div class="mut sm">${m.ebkErr ? "Nicht verfügbar" : "Wird geladen …"}</div>`;
    const fd = (t) => { const d = new Date(t); return isNaN(d) ? "?" : d.toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); };
    const sw = (k, on, l, sub) => `<div class="ltog"><span>${l}${sub ? `<small class="mut" style="display:block">${sub}</small>` : ""}</span><button class="sw ${on ? "on" : ""}" data-act="ebktog" data-k="${k}" aria-pressed="${!!on}" aria-label="${esc(l)}"></button></div>`;
    const seg = (k, opts) => `<div class="seg oseg">${opts.map(([v, l]) => `<button class="${String(c[k]) === String(v) ? "sel" : ""}" data-act="ebkset" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`;
    const inp = (k, l, ph, type) => `<div class="mut sm" style="margin:8px 0 3px">${l}</div><input class="otxt" type="${type || "text"}" data-f="ebk" data-k="${k}" maxlength="300" value="${type === "password" ? "" : esc(c[k] || "")}" placeholder="${esc(ph || "")}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="${esc(l)}">`;
    const L = c.last || {}, kb = (n) => Math.max(1, Math.round((n || 0) / 1024)) + " KB";
    const login = c.kind === "folder" ? "" : inp("user", "Benutzer", "") + inp("pw", "Passwort", c.pw_set ? "gespeichert, zum Ändern neu eingeben" : "", "password") + `<div class="mut sm" style="margin:4px 0 0">Das Passwort liegt nur in deinem Home Assistant und ist nie in den Sicherungen enthalten.</div>`;
    const where = c.kind === "webdav" ? inp("url", "Adresse", "https://nas.local:5006/ha-sicherung") + sw("verify", c.verify !== false, "Zertifikat prüfen", "Bei selbst signierten Zertifikaten ausschalten")
      : c.kind === "smb" ? inp("host", "Server", "nas.local oder 192.168.1.20") + inp("share", "Freigabe", "z. B. sicherung") + inp("path", "Unterordner (optional)", "ha/strom-waerme")
        : inp("folder", "Ordner in Home Assistant", "/media/sicherung") + `<div class="mut sm" style="margin:4px 0 0">Zum Beispiel eine als Netzwerkspeicher eingebundene Freigabe unter /media oder /share.</div>`;
    return `${head}<div class="mut sm" style="margin:2px 0 6px">Lädt die Einstellungen automatisch als Datei auf deinen Server. Zurückspielen mit „Sicherung einlesen“.</div>
      ${sw("on", c.on, "Ablage ein")}
      ${c.on ? `<div class="mut sm" style="margin:4px 0 3px">Ziel</div>${seg("kind", [["webdav", "WebDAV"], ["smb", "SMB"], ["folder", "Ordner"]])}
      ${where}${login}
      <div class="mut sm" style="margin:10px 0 3px">Zeitpunkt</div>${seg("when", [["change", "Bei Änderung"], ["daily", "Täglich"], ["weekly", "Sonntags"]])}
      ${c.when === "change" ? `<div class="mut sm" style="margin:4px 0 0">Nach einer Änderung mit etwas Wartezeit, höchstens einmal pro Stunde.</div>` : inp("time", "Uhrzeit", "03:30", "time")}
      <div class="mut sm" style="margin:10px 0 3px">Aufbewahren</div>${seg("keep", [[7, "7 Tage"], [14, "14 Tage"], [30, "30 Tage"]])}
      <div class="mut sm" style="margin:10px 0 0">Was wird gesichert</div>
      ${sw("inc.settings", c.inc.settings, "Einstellungen aller Module")}${sw("inc.rooms", c.inc.rooms, "Räume und Heizpläne")}${sw("inc.stats", c.inc.stats, "Statistik und Verlauf")}${sw("inc.bg", c.inc.bg, "Grundriss-Hintergrundbild (Modul 11)")}
      <div class="mut sm" style="margin:2px 0 8px">Nie enthalten: Sponsor-Schlüssel, Tibber-Token und Passwörter.</div>
      <div class="gbtns"><button class="btn2" data-act="ebktest"${m.ebkBusy ? " disabled" : ""}>Verbindung testen</button><button class="btn2 pri" data-act="ebkrun"${m.ebkBusy ? " disabled" : ""}>${m.ebkBusy ? "Bitte warten …" : "Jetzt sichern"}</button></div>
      ${m.ebkMsg ? `<div class="gbox" style="margin-top:8px"><b>${m.ebkMsg.ok ? "Hat geklappt" : "Hat nicht geklappt"}</b>${esc(m.ebkMsg.msg)}</div>` : ""}
      ${L.ts ? `<div class="gst">${ic(L.ok ? "check" : "info", 15)}${L.ok ? `Letzte Sicherung ${esc(fd(L.ts))} · ${L.count || 0} Dateien · ${kb(L.size)}` : `Letzter Versuch ${esc(fd(L.ts))}: ${esc(L.msg || "fehlgeschlagen")}`}</div>` : ""}
      ${L.ok && (L.files || []).length ? `<div class="mut sm" style="margin:4px 0 0">Auf dem Server: ${L.files.slice(0, 5).map((f) => `${esc(f.n.replace(/^fh-sicherung-|\.json$/g, ""))} (${kb(f.s)})`).join(", ")}</div>` : ""}` : ""}`;
  }
  _ebkSave(redraw) {
    const m = this._modal; if (!m || m.type !== "gen" || !m.ebk) return;
    clearTimeout(this._ebkT);
    const go = () => {
      const c = this._modal && this._modal.ebk; if (!c) return;
      const cfg = { ...c, pw: (this._modal.ebkPw || "") }; delete cfg.last; delete cfg.pw_set;
      this._hass.callWS({ type: "fenster_heizung/ebk_set", cfg }).then((r) => { if (this._modal && this._modal.type === "gen" && r && r.cfg) { this._modal.ebk = { ...r.cfg, last: this._modal.ebk.last || r.cfg.last }; this._modal.ebkPw = ""; if (redraw) this._renderModal(); } })
        .catch(() => this._toast("Die Einstellung konnte nicht gespeichert werden"));
    };
    if (redraw) { this._renderModal(); go(); } else this._ebkT = setTimeout(go, 400);
  }
  _ebkChange(t) {
    const m = this._modal, c = m && m.ebk, k = t.dataset.k; if (!c || !k) return true;
    if (k === "pw") { m.ebkPw = t.value; if (t.value) c.pw_set = true; } else c[k] = t.value;
    this._ebkSave(false); return true;
  }
  _ebkAct(a, b) {
    const m = this._modal, c = m && m.ebk; if (!c) return;
    const k = b.dataset.k;
    if (a === "ebktog") { if (k.startsWith("inc.")) c.inc = { ...c.inc, [k.slice(4)]: !c.inc[k.slice(4)] }; else c[k] = !(c[k] !== false && c[k]); this._ebkSave(true); }
    else if (a === "ebkset") { c[k] = k === "keep" ? +b.dataset.v : b.dataset.v; m.ebkMsg = null; this._ebkSave(true); }
    else if (a === "ebktest" || a === "ebkrun") {
      if (m.ebkBusy) return;
      const run = a === "ebkrun"; m.ebkBusy = true; m.ebkMsg = null; this._renderModal();
      const cfg = { ...c, pw: m.ebkPw || "" }; delete cfg.last; delete cfg.pw_set;
      const done = (msg, last) => { if (this._modal !== m) return; m.ebkBusy = false; m.ebkMsg = msg; if (last) c.last = last; this._renderModal(); };
      const pre = run ? this._hass.callWS({ type: "fenster_heizung/ebk_set", cfg }).then((r) => { m.ebkPw = ""; if (r && r.cfg) Object.assign(c, r.cfg, { last: c.last }); }) : Promise.resolve();
      pre.then(() => this._hass.callWS(run ? { type: "fenster_heizung/ebk_run" } : { type: "fenster_heizung/ebk_test", cfg }))
        .then((r) => { if (run) done({ ok: !!(r.res && r.res.ok), msg: (r.res && r.res.msg) || "" }, r.res); else done({ ok: !!r.ok, msg: r.msg || "" }); })
        .catch(() => done({ ok: false, msg: "Keine Antwort von Home Assistant" }));
    }
  }
