  /* ================= Sponsor-Bereich (3.0.2.13) =================
     Die Integration bleibt kostenlos. Mit einem Sponsor-Schlüssel gibt es Schönes obendrauf: Abzeichen, Farbverläufe,
     Uhr-Stile und Vorabversionen. Der Schlüssel wird im Backend geprüft (sponsor.py). Wer den privaten Schlüssel
     eingetragen hat, sieht zusätzlich die Verwaltung der Sponsoren. */
  async _spnLoad() {
    try { this._spnD = await this._hass.callWS({ type: "fenster_heizung/spn_get" }); } catch (_) { this._spnD = null; }
  }
  _spnS() { return this._spnD || { url: "https://github.com/sponsors/Maddog3010", state: "none", active: false, name: "", bis: "", prefs: { badge: true, grad: "none", clock: "standard", early: false }, saved_prefs: { badge: true, grad: "none", clock: "standard", early: false }, manage: false }; }
  _spnP() { return this._spnS().prefs; }
  _spnEarly() { const s = this._spnS(); return !!(s.active && s.prefs.early); }
  _spnDate(d) { try { return new Date(d + "T12:00:00").toLocaleDateString("de-DE"); } catch (_) { return d; } }
  /* Aussehen: Verlauf im Kopf (Klasse am Panel, das CSS steht in den Stilen) */
  _spnApply() {
    const g = this._spnP().grad, cl = this.classList;
    ["meer", "abend"].forEach((k) => cl.toggle("spg-" + k, g === k));
  }
  _spnEarlyClock() { const s = this._spnS(); return s.active && s.prefs.clock !== "standard" ? "ck-" + s.prefs.clock : ""; }
  _spnBtn() {
    const s = this._spnS(), adm = this._admin();
    if (s.active && s.prefs.badge) { const gold = s.tier === "max" && s.prefs.badge_style !== "heart", lab = s.prefs.name_head && s.name && s.state !== "dev" ? "Hallo " + s.name.split(" ")[0] : gold ? "Max" : "Sponsor";
      return `<button class="pillbtn spnb on ${gold ? "gold" : ""}" data-act="spnopen" aria-label="Sponsor-Lounge" title="${esc(s.name ? "Danke, " + s.name : "Sponsor")}">${gold ? `<span class="spnstar">★</span>` : s.prefs.badge_style === "sun" ? `<span class="spnstar sun">☀</span>` : s.prefs.badge_style === "snow" ? `<span class="spnstar snow">❄</span>` : ic("heart", 15)}<span class="bl">${esc(lab)}</span></button>`; }
    if (!adm) return "";
    return `<button class="pillbtn spnb" data-act="spnopen" aria-label="Sponsor-Lounge" title="Sponsor werden oder Schlüssel eingeben">${ic("heart", 15)}<span class="bl">Sponsor</span></button>`;
  }
  /* B: Karte auf der Startseite, nur für Administratoren ohne Schlüssel, 60 Tage ausblendbar */
  _spnCard() {
    if (!this._admin() || this._edit || this._spnS().active) return "";
    try { const t = +localStorage.getItem("fh_spn_hide") || 0; if (Date.now() - t < 60 * 86400000) return ""; } catch (_) { /* egal */ }
    return `<div class="spnc"><span class="spnbig">${ic("heart", 24)}</span><div class="spnt"><b>Gefällt dir die Integration?</b><span>Sie ist kostenlos und offen. Wenn du magst, unterstütze die Entwicklung auf GitHub.</span></div><a class="pillbtn spnb pri" href="${esc(this._spnS().url)}" target="_blank" rel="noopener noreferrer">${ic("heart", 15)}Sponsor werden</a><button class="ibtn" data-act="spnhide" aria-label="Ausblenden">${ic("close", 18)}</button></div>`;
  }
  /* C: Zeile im Update-Hinweis */
  _spnLine() { return this._spnS().active ? "" : `<span class="spnl">${ic("heart", 12)} Hobbyprojekt. <a href="${esc(this._spnS().url)}" target="_blank" rel="noopener noreferrer">Unterstützen</a></span>`; }
  /* D: Zeile in den Einstellungen */
  _spnRow() {
    const s = this._spnS(), chip = s.active ? `<em class="sxc ok">${esc(s.name || "Aktiv")}</em>` : s.state === "expired" ? `<em class="sxc wa">Abgelaufen</em>` : `<em class="sxc">Schlüssel</em>`;
    return `<button class="sxrow" data-act="spnopen"><span class="sxi">${ic("heart", 20)}</span><span class="sxt"><b>Sponsor-Lounge</b><small>Schlüssel eingeben, Extras einstellen</small></span>${chip}</button>`;
  }
  _spnAct(a, b) {
    const k = b.dataset.k;
    if (a === "spnopen") { this._loOpen = true; this._labOpen = false; this._igOpen = false; this._stOpen = false; this._modal = null; this._renderModal(); this._render(); this._spnLoad().then(() => this._render()); }
    else if (a === "spnkeydlg") { this._modal = { type: "spndlg", err: "" }; this._renderModal(); }
    else if (a === "spnhide") { try { localStorage.setItem("fh_spn_hide", String(Date.now())); } catch (_) { /* egal */ } this._render(); this._toast("Hinweis ausgeblendet"); }
    else if (a === "spnred") {
      const el = this.shadowRoot.querySelector('[data-f="spnkey"]'), key = el ? String(el.value || "").trim() : "";
      if (!key) { this._modal.err = "Bitte den Schlüssel einfügen."; this._renderModal(); return; }
      this._spnRedeem(key);
    }
    else if (a === "spndev") {
      const off = b.dataset.k === "off";
      this._hass.callWS({ type: "fenster_heizung/spn_admin_act", act: "devoff", on: off }).then((r) => { const { ok, ...s } = r || {}; this._spnD = s; this._spnApply(); this._renderModal(); this._render(); this._toast(off ? "Entwickler-Zugang aus – du siehst alles wie ohne Sponsoring" : "Entwickler-Zugang wieder an"); }).catch((e) => this._toast("Das ging nicht: " + ((e && e.message) || "")));
    }
    else if (a === "spnclr") { this._hass.callWS({ type: "fenster_heizung/spn_clear" }).then((r) => { this._spnD = r; this._spnApply(); this._renderModal(); this._render(); this._toast("Schlüssel entfernt"); }).catch(() => this._toast("Das ging nicht")); }
    else if (a === "spnbadge") this._spnPref({ badge: !this._spnS().saved_prefs.badge });
    else if (a === "spnearly") this._spnPref({ early: !this._spnS().saved_prefs.early });
    else if (a === "spngrad") this._spnPref({ grad: k });
    else if (a === "spnclk") this._spnPref({ clock: k });
    else if (a === "spnadm") { this._modal = { type: "spnadm", view: "list" }; this._renderModal(); this._spnAdminLoad(); }
    else if (a === "spnback") { this._modal = null; this._renderModal(); this._render(); }
    else if (a === "spnlist") { this._modal = { type: "spnadm", view: "list" }; this._renderModal(); }
    else if (a === "spnnew") { this._modal = { type: "spnadm", view: "new", err: "", stufe: "sponsor" }; this._renderModal(); }
    else if (a === "spnstufe") { const q = (f) => this.shadowRoot.querySelector(`[data-f="${f}"]`); this._modal.keep = { name: String((q("spnname") || {}).value || ""), note: String((q("spnnote") || {}).value || "") }; this._modal.stufe = k === "max" ? "max" : "sponsor"; this._renderModal(); }
    else if (a === "spnsoon") { this._spnAdm({ act: "notifysoon", on: !this._spnS().notify_soon }, () => { this._spnLoad().then(() => this._renderModal()); }); }
    else if (a === "spncreate") {
      const q = (f) => this.shadowRoot.querySelector(`[data-f="${f}"]`), name = String((q("spnname") || {}).value || "").trim();
      if (!name) { this._modal.err = "Bitte einen Namen eingeben."; this._renderModal(); return; }
      this._spnAdm({ act: "create", stufe: this._modal.stufe === "max" ? "max" : "sponsor", name, bis: String((q("spnbis") || {}).value || ""), note: String((q("spnnote") || {}).value || "") }, (r) => {
        if (!r.ok) { this._modal.err = r.error === "date" ? "Das Datum ist ungültig." : "Das ging nicht."; this._renderModal(); return; }
        this._modal = { type: "spnadm", view: "done", id: r.id, key: r.key }; this._renderModal();
      });
    }
    else if (a === "spnext") { this._spnAdm({ act: "extend", sid: k }, (r) => { if (!r.ok) { this._toast("Das ging nicht"); return; } this._modal = { type: "spnadm", view: "done", id: r.id, key: r.key }; this._renderModal(); }); }
    else if (a === "spnkey") { const s = ((this._spnA || {}).items || []).find((x) => x.id === k); if (s) { this._modal = { type: "spnadm", view: "done", id: s.id, key: s.key }; this._renderModal(); } }
    else if (a === "spnrevq") { this._modal = { type: "spnadm", view: "revoke", id: k }; this._renderModal(); }
    else if (a === "spnrev") { this._spnAdm({ act: "revoke", sid: k }, () => { this._modal = { type: "spnadm", view: "list" }; this._renderModal(); this._toast("Gesperrt. Jetzt noch die Liste im Repo ändern."); }); }
    else if (a === "spnunrev") { this._spnAdm({ act: "unrevoke", sid: k }, () => { this._renderModal(); this._toast("Sperre aufgehoben. Die Liste im Repo muss auch angepasst werden."); }); }
    else if (a === "spndel") { this._spnAdm({ act: "remove", sid: k }, () => { this._modal = { type: "spnadm", view: "list" }; this._renderModal(); }); }
    else if (a === "spnmine") { this._spnRedeem(this._modal.key, true); }
    else if (a === "spncopy") this._spnCopy(this._modal.key, "Schlüssel kopiert");
    else if (a === "spnmsg") {
      const s = ((this._spnA || {}).items || []).find((x) => x.id === this._modal.id) || {};
      this._spnCopy(`Hallo ${s.name || ""},\n\ndanke für deine Unterstützung! Hier ist dein ${s.stufe === "max" ? "Sponsor-Max-" : "Sponsor-"}Schlüssel für Strom & Wärme (gültig bis ${this._spnDate(s.bis || "")}${s.stufe === "max" ? ", danach gilt er bis " + this._spnDate(s.sb || "") + " weiter als Sponsor" : ""}):\n\n${this._modal.key}\n\nEinlösen: Einstellungen > Sponsor-Bereich > Schlüssel einfügen.`, "Nachricht kopiert");
    }
    else if (a === "spnjson2") this._spnCopy(b.dataset.j || "{}", "Liste kopiert");
    else if (a === "spnjson") this._spnCopy(((this._spnA || {}).revoked_json || "{}"), "Liste kopiert");
    else if (a === "spnsetup") {
      const el = this.shadowRoot.querySelector('[data-f="spnpriv"]'), v = el ? String(el.value || "").trim() : "";
      this._hass.callWS({ type: "fenster_heizung/spn_admin_setup", priv: v }).then((r) => { if (!r.ok) { this._modal.err = "Das ist nicht der richtige private Schlüssel."; this._renderModal(); return; } this._spnA = r; this._spnLoad().then(() => { this._modal = { type: "spnadm", view: "list" }; this._renderModal(); this._render(); }); }).catch(() => this._toast("Das ging nicht"));
    }
    else if (a === "spnforget") { this._spnAdm({ act: "forget" }, () => { this._spnLoad().then(() => { this._modal = null; this._renderModal(); this._render(); }); }); }
  }
  _spnCopy(t, ok) { this._clip(t, ok); }
  /* Kopieren: moderne Zwischenablage, sonst Ersatzweg (HTTP-Adresse, App-Ansicht, ältere Browser) */
  _clip(t, ok) {
    const done = () => this._toast(ok);
    const fb = () => {
      try {
        const ta = document.createElement("textarea"); ta.value = t; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
        document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, t.length);
        const r = document.execCommand("copy"); ta.remove();
        if (r) done(); else this._toast("Kopieren nicht möglich. Bitte den Text von Hand markieren und kopieren");
      } catch (_) { this._toast("Kopieren nicht möglich. Bitte den Text von Hand markieren und kopieren"); }
    };
    try { if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(done, fb); else fb(); } catch (_) { fb(); }
  }
  _spnRedeem(key, mine) {
    this._hass.callWS({ type: "fenster_heizung/spn_redeem", key }).then((r) => {
      const st = (r.result || {}).state;
      this._spnD = r; this._spnApply(); this._render();
      if (st === "ok") { this._modal = null; this._renderModal(); this._loOpen = true; this._render(); this._toast(mine ? "Bei dir eingelöst" : "Danke für deine Unterstützung!"); return; }
      if (!this._modal || this._modal.type !== "spndlg") { this._modal = { type: "spndlg", err: "" }; }
      this._modal.err = st === "expired" ? "Dieser Schlüssel ist abgelaufen." : st === "revoked" ? "Dieser Schlüssel wurde gesperrt." : "Der Schlüssel ist nicht gültig. Bitte vollständig einfügen, ohne Leerzeichen am Ende.";
      this._renderModal();
    }).catch(() => this._toast("Das ging nicht"));
  }
  _spnPref(patch) {
    const old = this._spnS().saved_prefs; if (this._spnD) this._spnD.saved_prefs = { ...old, ...patch }; if (this._spnD && this._spnD.active) this._spnD.prefs = { ...old, ...patch };
    this._spnApply(); this._renderModal(); this._render();
    this._hass.callWS({ type: "fenster_heizung/spn_prefs", prefs: patch }).then((r) => { this._spnD = r; this._spnApply(); this._renderModal(); this._render(); }).catch(() => this._toast("Das ging nicht"));
  }
  _spnAdminLoad() { this._hass.callWS({ type: "fenster_heizung/spn_admin_get" }).then((r) => { this._spnA = r; if (this._modal && this._modal.type === "spnadm") this._renderModal(); }).catch(() => this._toast("Das ging nicht")); }
  _spnAdm(msg, then) { this._hass.callWS({ type: "fenster_heizung/spn_admin_act", ...msg }).then((r) => { this._spnA = { ...this._spnA, ...r }; this._spnLoad().then(() => { then(r); this._render(); }); }).catch(() => this._toast("Das ging nicht")); }
  _spnModal() {
    const m = this._modal, close = `<button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button>`;
    return m.type === "spnadm" ? this._spnAdmModal(close) : this._spnDlg(close);
  }
  /* Dialog nur noch für den Schlüssel (Konzept Sponsor-Bereich 2.0, E1). Alles andere steht in der Lounge (12f-lounge.js). */
  _spnDlg(close) {
    const s = this._spnS(), m = this._modal, adm = this._admin();
    const st = s.state === "dev" ? "Entwickler-Zugang – kein Schlüssel nötig" : s.active ? `${s.tier === "max" ? "★ Sponsor Max" : "♥ Sponsor"}${s.name ? " · " + esc(s.name) : ""} · gültig bis ${esc(this._spnDate(s.bis))}` : s.state === "expired" ? `Abgelaufen am ${esc(this._spnDate(s.bis))}` : s.state === "revoked" ? "Gesperrt" : "Noch kein Schlüssel";
    const body = adm ? `<div class="gst">${ic(s.active ? "check" : "key", 15)}<span>${st}</span></div>
        <div class="lsec" style="margin-top:12px">${ic("key", 15)}${s.active ? "Neuen Schlüssel einlösen" : "Sponsor-Schlüssel"}</div><div class="mut sm" style="margin:0 0 6px">Du bekommst ihn nach dem Sponsoring per E-Mail. Einfach vollständig einfügen.</div>
        <textarea class="osel spnta" data-f="spnkey" rows="3" placeholder="FH1-…" spellcheck="false" aria-label="Sponsor-Schlüssel"></textarea>
        <div class="tmerr" role="alert">${esc(m.err || "")}</div>
        <div class="gbtns" style="margin-top:8px"><button class="btn2 spnb pri" data-act="spnred">${ic("heart", 16)} Schlüssel einlösen</button>${s.active && s.state !== "dev" ? `<button class="btn2" data-act="spnclr">Schlüssel entfernen</button>` : ""}</div>`
      : `<div class="mut sm">Den Schlüssel trägt ein Administrator ein.</div>`;
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>${ic("key", 17)} Schlüssel</b><span>Sponsor-Lounge</span></div>${close}</div>${body}</div>`;
  }
  _spnAdmModal(close) {
    const m = this._modal, A = this._spnA, head = (t, s, back) => `<div class="sh"><div><b>${t}</b><span>${s}</span></div>${back ? `<button class="ibtn" data-act="${back}" aria-label="Zurück">${ic("back", 20)}</button>` : ""}${close}</div>`;
    const wrap = (h, b) => `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">${h}${b}</div>`;
    if (!A) return wrap(head("Sponsoren verwalten", "Lädt …", ""), `<div class="mut sm">Einen Moment …</div>`);
    if (A.setup) {
      return wrap(head("Verwaltung einrichten", "Nur für den Entwickler", "spnback"), `<div class="mut sm" style="margin:0 0 8px">Füge hier den privaten Schlüssel ein (beginnt mit FHPRIV1-). Er bleibt in diesem Home Assistant, auch in dessen Sicherungen. Gib ihn nie weiter.</div>
        <textarea class="osel spnta" data-f="spnpriv" rows="2" placeholder="FHPRIV1-…" spellcheck="false" aria-label="Privater Schlüssel"></textarea><div class="tmerr" role="alert">${esc(m.err || "")}</div>
        <div class="gbtns" style="margin-top:8px"><button class="btn2 pri" data-act="spnsetup">${ic("key", 16)} Einrichten</button></div>`);
    }
    const item = (s) => {
      const st = { ok: ["g", "Aktiv"], soon: ["a", s.days === 0 ? "Heute" : `Noch ${s.days} ${s.days === 1 ? "Tag" : "Tage"}`], expired: ["x", "Abgelaufen"], revoked: ["r", "Gesperrt"] }[s.state];
      const mx = s.stufe === "max";
      const act = s.state === "revoked" ? `<button class="spnmini" data-act="spnunrev" data-k="${s.id}">${ic("eye", 14)}Sperre aufheben</button>` : s.state === "ok" && !mx ? `<button class="spnmini" data-act="spnkey" data-k="${s.id}">${ic("copy", 14)}Schlüssel</button>` : `<button class="spnmini ${mx ? "gold" : ""}" data-act="spnext" data-k="${s.id}">${ic("clock", 14)}Verlängern</button>`;
      return `<div class="spnrow"><span class="spna ${mx ? "gold" : ""} ${s.state === "expired" || s.state === "revoked" ? "off" : ""}">${mx ? "★" : esc((s.name || "?")[0].toUpperCase())}</span><span class="spnn"><b>${esc(s.name)}${mx ? ` <em class="spntier">★ Max</em>` : ""}</b><small>${s.state === "revoked" ? "gesperrt" + (s.revoked_at ? " am " + esc(this._spnDate(s.revoked_at)) : "") : (s.since ? "seit " + esc(this._spnDate(s.since)) + " · " : "") + "gültig bis " + esc(this._spnDate(s.bis))}${s.note ? " · " + esc(s.note) : ""}</small></span><em class="spns ${st[0]}">${st[1]}</em>${act}<button class="ibtn spnmore" data-act="spnrevq" data-k="${s.id}" aria-label="Sperren oder löschen">${ic("more", 18)}</button></div>`;
    };
    if (m.view === "new") {
      const mx = m.stufe === "max", kp = m.keep || {}, d = new Date(); if (mx) d.setMonth(d.getMonth() + 3); else d.setFullYear(d.getFullYear() + 1); const def = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return wrap(head("Neuer Sponsor", "Stufe und drei Angaben", "spnlist"), `<div class="of"><div class="ol"><b>Stufe</b><span>Max kostet 9 € für 3 Monate. Läuft Max ab, gilt bis zum Ende des Sponsor-Jahres automatisch wieder „Sponsor“.</span></div></div>
        <div class="gschs" style="margin:0 0 10px"><button class="gsch ${mx ? "" : "sel"}" data-act="spnstufe" data-k="sponsor" aria-pressed="${!mx}">${ic("heart", 13)} Sponsor · 1 Jahr</button><button class="gsch spng ${mx ? "sel" : ""}" data-act="spnstufe" data-k="max" aria-pressed="${mx}">★ Max · 3 Monate für 9 €</button></div>
        <div class="of"><div class="ol"><b>Name</b><span>Erscheint im Abzeichen</span></div></div><input class="osel" data-f="spnname" maxlength="40" placeholder="z. B. Anna K." aria-label="Name" value="${esc(kp.name || "")}" style="width:100%;margin:0 0 8px">
        <div class="of"><div class="ol"><b>Gültig bis</b><span>Vorgabe: ${mx ? "drei Monate" : "ein Jahr"} ab heute</span></div></div><input class="osel" type="date" data-f="spnbis" value="${def}" aria-label="Gültig bis" style="width:100%;margin:0 0 8px">
        <div class="of"><div class="ol"><b>Notiz (nur für dich)</b></div></div><input class="osel" data-f="spnnote" maxlength="120" placeholder="z. B. GitHub: annak" aria-label="Notiz" value="${esc(kp.note || "")}" style="width:100%;margin:0 0 8px">
        <div class="tmerr" role="alert">${esc(m.err || "")}</div><div class="gbtns" style="margin-top:8px"><button class="btn2 pri" data-act="spncreate">${ic("key", 16)} Schlüssel erzeugen</button></div>`);
    }
    if (m.view === "done") {
      const s = A.items.find((x) => x.id === m.id) || {};
      return wrap(head("Schlüssel", `${esc(s.name || "")}, gültig bis ${esc(this._spnDate(s.bis || ""))}`, "spnlist"), `<div class="spnkeybox">${esc(m.key)}</div>
        <div class="gbtns" style="margin-top:10px"><button class="btn2 pri" data-act="spncopy">${ic("copy", 16)} Kopieren</button><button class="btn2" data-act="spnmsg">${ic("link", 16)} Nachricht kopieren</button></div>
        <div class="gbtns" style="margin-top:8px"><button class="btn2" data-act="spnmine">${ic("heart", 16)} Bei mir einlösen</button></div>
        <div class="mut sm" style="margin-top:8px">„Nachricht kopieren“ legt einen Text mit dem Schlüssel und einer kurzen Anleitung in die Zwischenablage.</div>`);
    }
    if (m.view === "revoke") {
      const s = A.items.find((x) => x.id === m.id); if (!s) return wrap(head("Sponsor", "", "spnlist"), "");
      let ids = []; try { ids = JSON.parse(A.revoked_json).gesperrt || []; } catch (_) { /* leer */ } if (!ids.includes(s.id)) ids = [...ids, s.id].sort();
      const json = JSON.stringify({ gesperrt: ids });
      return wrap(head(`${esc(s.name)}`, "Sperren oder entfernen", "spnlist"), `<div class="mut sm" style="margin:0 0 8px">Beim Sperren wird der Schlüssel hier als gesperrt markiert. Damit er auch beim Sponsor aufhört zu gelten, muss die Sperrliste im Repo aktualisiert werden. Die Datei heißt <b>sponsor_gesperrt.json</b>. Bis dahin gilt der Schlüssel, spätestens bis zum Ablaufdatum.</div>
        <div class="spnkeybox" style="color:#9be7c4">${esc(json)}</div>
        <div class="gbtns" style="margin-top:10px"><button class="btn2" data-act="spnjson2" data-j="${esc(json)}">${ic("copy", 16)} Liste kopieren</button><button class="btn2 pri" data-act="spnrev" data-k="${s.id}" ${s.state === "revoked" ? "disabled" : ""}>${ic("lock", 16)} Sperren</button></div>
        <div class="gbtns" style="margin-top:10px"><button class="btn2" data-act="spndel" data-k="${s.id}">${ic("trash", 16)} Aus der Liste löschen</button></div>`);
    }
    const c = A.count || {};
    return wrap(head("Sponsoren verwalten", "Nur für dich sichtbar", "spnback"), `<div class="spnsum"><div><small>Aktiv</small><b>${(c.ok || 0) + (c.soon || 0)}</b></div><div><small>★ Max</small><b class="gd">${c.max || 0}</b></div><div><small>Laufen bald ab</small><b class="${c.soon ? "wa" : ""}">${c.soon || 0}</b></div><div><small>Abgelaufen oder gesperrt</small><b>${(c.expired || 0) + (c.revoked || 0)}</b></div></div>
      ${A.items.length ? A.items.map(item).join("") : `<div class="mut sm" style="margin:10px 0">Noch keine Sponsoren. Lege den ersten an.</div>`}
      <div class="vrow" style="margin-top:10px"><span>Meldung, wenn ein Schlüssel bald abläuft<small class="mut" style="display:block">Einmal am Tag in Home Assistant: Max 14 Tage, Sponsor 30 Tage vorher</small></span><button class="sw ${this._spnS().notify_soon ? "on" : ""}" data-act="spnsoon" aria-pressed="${!!this._spnS().notify_soon}" aria-label="Meldung bei Ablauf"></button></div>
      <div class="gbtns" style="margin-top:12px"><button class="btn2 pri" data-act="spnnew">${ic("heart", 16)} Neuer Sponsor</button></div>
      <div class="mut sm" style="margin-top:10px">Namen, Daten und Notizen bleiben in deinem Home Assistant. Das Dashboard weist dich ${30} Tage vor Ablauf darauf hin.</div>
      <div class="lsec" style="margin-top:16px">${ic("flask", 15)}Zum Testen</div>
      <div class="vrow"><span>Entwickler-Zugang aktiv<small class="mut" style="display:block">Aus: Extras, Vorabversionen und Module nur für Sponsoren sind gesperrt – so wie ohne Sponsoring. Diese Verwaltung bleibt erreichbar.</small></span><button class="sw ${this._spnS().dev_off ? "" : "on"}" data-act="spndev" data-k="${this._spnS().dev_off ? "on" : "off"}" aria-pressed="${!this._spnS().dev_off}" aria-label="Entwickler-Zugang aktiv"></button></div>
      <div class="gbtns" style="margin-top:10px"><button class="btn2" data-act="spnforget" style="font-size:.8rem">Verwaltung ausschalten</button></div>`);
  }
