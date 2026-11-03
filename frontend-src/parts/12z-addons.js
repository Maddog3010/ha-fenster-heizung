  /* ================= Addons (Addon-Schnittstelle API 1) =================
     Ein Addon bringt seinen Python-Teil und seine Seite (www/panel.js) selbst mit. Der Kern lädt die Liste aus
     fenster_heizung/addons_get, lädt die Seite eines aktiven Addons per import() nach und gibt ihr die Bausteine
     des Kerns (Symbole, Texte, Aufruf des Backends). Die Seite eines Addons ist ein ES-Modul:
       export default (api) => ({ page(p, m), tile(p, s), act(p, a, el), change(p, el), modal(p, type), icons, art, css })
     Aktionen eines Addons heißen data-act="adxa" data-ad="<id>" data-a="<aktion>". */
  _adState() { return (this._ad && this._ad.d) || { addons: [] }; }
  _adLoad(force) {
    if (!this._hass || this._adBusy) return;
    if (!force && this._ad && Date.now() - this._ad.ts < 30000) return;
    this._adBusy = true;
    this._hass.callWS({ type: "fenster_heizung/addons_get" }).then((r) => { this._ad = { d: r || { addons: [] }, ts: Date.now() }; this._adImport(); })
      .catch(() => { this._ad = { d: { addons: [], error: true }, ts: Date.now() }; })
      .finally(() => { this._adBusy = false; this._render(); if (this._modal && String(this._modal.type).startsWith("ad")) this._renderModal(); });
  }
  _adApi() {
    return { v: 1, ic, esc, num, ICONS, MOD_ART, STG,
      call: (id, cmd, data) => this._hass.callWS({ type: "fenster_heizung/addon_call", addon: id, cmd, data: data || {} }) };
  }
  _adImport() {
    this._adDefs = this._adDefs || {}; this._adJs = this._adJs || {};
    this._adState().addons.filter((a) => a.status === "on" && a.js).forEach((a) => {
      if (this._adJs[a.id] === a.js) return;
      this._adJs[a.id] = a.js;
      import(a.js).then((mod) => {
        const def = (mod.default || mod)(this._adApi()) || {};
        Object.assign(ICONS, def.icons || {}); if (def.art) MOD_ART[a.id] = def.art;
        this._adDefs[a.id] = def; this._render(); if (this._modal) this._renderModal();
      }).catch((e) => { this._adDefs[a.id] = { err: String(e && e.message || e) }; this._render(); });
    });
  }
  _adMods() {
    return this._adState().addons.filter((a) => a.status === "on").map((a) => ({ id: a.id, n: a.n, name: a.name, short: a.short || a.name, icon: ICONS[a.icon] ? a.icon : "puzzle", tag: a.tag, addon: true, beta: a.stage !== "stabil", stage: a.stage, ad: a }));
  }
  _adDef(id) { return (this._adDefs || {})[id]; }
  _adPage(m) {
    const d = this._adDef(m.id);
    if (!d) return `<div class="card empty">${ic("puzzle", 36)}<div style="margin:10px 0 4px;font-weight:700">${esc(m.name)}</div>Seite des Addons wird geladen …</div>`;
    if (d.err) return `<div class="card empty">${ic("alert", 36)}<div style="margin:10px 0 4px;font-weight:700">${esc(m.name)}</div>Die Seite des Addons ließ sich nicht laden.<br><span class="sm">${esc(d.err)}</span></div>`;
    try { return (d.css ? `<style>${d.css}</style>` : "") + d.page(this, m); } catch (e) { return `<div class="card empty">${ic("alert", 36)}<div style="margin:10px 0 4px;font-weight:700">Fehler in der Seite des Addons</div><span class="sm">${esc(e.message)}</span></div>`; }
  }
  _adTile(m) { const s = (m.ad && m.ad.summary && m.ad.summary.tile) || {}; return { sub: esc(s.sub || ""), c: s.c || "" }; }
  _adHints() { return this._adState().addons.filter((a) => a.status === "on").flatMap((a) => ((a.summary || {}).hints || []).map((h) => ({ i: ICONS[h.i] ? h.i : "info", t: esc(h.t), s: esc(h.s || ""), r: h.c === "bad" ? "jetzt" : "", c: h.c || "", mod: a.id }))); }
  _adModal() {
    const m = this._modal, A = this._adState().addons.find((x) => x.id === m.id);
    if (m.type === "adx" || !A) { const d = this._adDef(m.id); return d && d.modal ? d.modal(this, m) : ""; }
    const hd = (t, s) => `<div class="sh"><div><b>${t}</b><span>${s}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>`;
    const kb = (b) => b >= 1e6 ? `${num(b / 1e6, 1)} MB` : `${Math.max(1, Math.round(b / 1000))} kB`;
    if (m.type === "adinst") {
      return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">${hd(`Modul ${A.n} · ${esc(A.name)}`, `Addon · v${esc(A.version)} Build ${A.build} · ${STG[A.stage] ? STG[A.stage].t : ""}`)}
        <div class="adhero">${ic(ICONS[A.icon] ? A.icon : "puzzle", 34)}<div><b>${esc(A.tag)}</b><span>${esc(A.desc)}</span></div></div>
        <div class="lsec">${ic("info", 15)}Steckbrief</div>
        <div class="adkv"><span>Ablage</span><b>${A.src === "ext" ? `Eigener Ordner (${esc(this._adState().ext_dir || "")})` : "Mitgeliefert in der Integration"}</b><span>Größe</span><b>${kb(A.size || 0)}</b><span>Braucht</span><b>Strom &amp; Wärme ${esc(A.core_min || "–")} · Addon-API ${A.api}</b><span>Unterstützt</span><b>${(A.optional || []).map(esc).join(", ") || "–"}</b><span>Internet</span><b>${(A.network || []).length ? A.network.map(esc).join(", ") : "keine Verbindung nach außen"}</b></div>
        ${(A.hints || []).map((h) => `<div class="gst">${ic("info", 15)}<span>${esc(h)} Du kannst das Addon trotzdem schon installieren.</span></div>`).join("")}
        ${A.can ? "" : `<div class="gst bad">${ic("alert", 15)}<span>${esc(A.why)}</span></div>`}
        ${A.kept ? `<div class="gst">${ic("check", 15)}<span>Deine Daten von der letzten Installation sind noch da und werden übernommen.</span></div>` : ""}
        <div class="gst">${ic("shield", 15)}<span>Ein Addon läuft mit denselben Rechten wie die Integration. Mitgelieferte Addons kommen direkt von Maddog3010.</span></div>
        <div class="gbtns"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="adxdo" data-k="${A.id}" ${A.can && !this._adWork ? "" : "disabled"}>${this._adWork ? "Wird installiert …" : "Installieren"}</button></div></div>`;
    }
    if (m.type === "addel") {
      const keep = m.keep !== false;
      return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">${hd(`${esc(A.name)} deinstallieren?`, `Modul ${A.n} · Addon`)}
        <div class="lsec">${ic("info", 15)}Was passiert</div>
        <div class="wxl"><div class="wxr"><span class="wxi">${ic("stop", 18)}</span><div class="wxm"><div class="wxt"><b>Das Addon stoppt</b></div><small>Hintergrund-Logik, Seite und Kachel auf Start und Tablet verschwinden. Laufende Reinigungen fahren weiter.</small></div></div>
          <div class="wxr"><span class="wxi">${ic("layers", 18)}</span><div class="wxm"><div class="wxt"><b>Dateien bleiben in der Integration</b></div><small>Mitgelieferte Addons kannst du jederzeit wieder installieren.</small></div></div></div>
        <div class="lsec">${ic("sliders", 15)}Deine Daten</div>
        <button class="adopt ${keep ? "sel" : ""}" data-act="adxkeep" data-k="1"><i></i><span><b>Behalten</b><small>Räume, Ziele und Verlauf. Bei erneuter Installation wieder da.</small></span></button>
        <button class="adopt ${keep ? "" : "sel"}" data-act="adxkeep" data-k="0"><i></i><span><b>Auch löschen</b><small>Die Sicherung im Ablagefach bleibt, bis sie überschrieben wird.</small></span></button>
        <div class="gbtns"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri dng" data-act="adxrm" data-k="${A.id}" ${this._adWork ? "disabled" : ""}>${this._adWork ? "Wird entfernt …" : "Deinstallieren"}</button></div></div>`;
    }
    return "";
  }
  /* Einstellungen › Addons */
  _adSetPage(card) {
    this._adLoad();
    const S = this._adState(), L = S.addons || [], tab = this._adTab || "inst", kb = (b) => b >= 1e6 ? `${num(b / 1e6, 1)} MB` : `${Math.max(1, Math.round(b / 1000))} kB`;
    const inst = L.filter((a) => a.installed), cat = L.filter((a) => !a.installed), upd = L.filter((a) => a.update);
    const stc = (a) => a.status === "on" ? (a.update ? `<em class="sxc wa">Update v${esc(a.version)}</em>` : `<em class="sxc ok">aktiv</em>`) : a.status === "paused" ? `<em class="sxc off">pausiert</em>` : a.status === "error" ? `<em class="sxc er">Fehler</em>` : "";
    const row = (a) => `<div class="adrow ${a.status}"><div class="adtop"><span class="sxi">${ic(ICONS[a.icon] ? a.icon : "puzzle", 22)}</span><span class="sxt"><b>Modul ${a.n} · ${esc(a.name)}</b><small>v${esc(a.version)} Build ${a.build} · ${STG[a.stage] ? STG[a.stage].t : ""} · ${a.src === "ext" ? "aus eigenem Ordner" : "mitgeliefert"}${a.status === "on" && a.summary && a.summary.info ? " · " + esc(a.summary.info) : ""}</small></span>${a.installed ? stc(a) : a.sponsor ? `<em class="sxc sp">Sponsor</em>` : ""}</div>
      ${a.err && a.status !== "on" ? `<div class="gst bad">${ic("alert", 15)}<span>${esc(a.err)}</span></div>` : ""}
      ${!a.installed ? `<p class="adds">${esc(a.desc || a.tag)}</p>` : ""}
      <div class="adbtn">${a.installed ? `${a.status === "on" ? `<button class="gsch sel" data-act="adxopen" data-k="${a.id}">Öffnen</button>` : ""}${a.status === "error" ? `<button class="gsch sel" data-act="adxretry" data-k="${a.id}">Erneut versuchen</button>` : ""}${a.update ? `<button class="gsch" data-act="adxretry" data-k="${a.id}">Aktualisieren</button>` : ""}${a.status === "paused" ? `<button class="gsch sel" data-act="adxresume" data-k="${a.id}">Fortsetzen</button>` : a.status === "on" ? `<button class="gsch" data-act="adxpause" data-k="${a.id}">Pausieren</button>` : ""}<button class="gsch" data-act="adxdel" data-k="${a.id}">Deinstallieren</button>`
        : `<button class="gsch sel" data-act="adxinst" data-k="${a.id}">${ic("download", 14)} Installieren</button>${a.kept ? `<span class="mut sm">Daten von früher vorhanden</span>` : ""}`}</div></div>`;
    const seg = `<div class="seg adseg"><button class="${tab === "inst" ? "sel" : ""}" data-act="adxtab" data-k="inst">Installiert ${inst.length}</button><button class="${tab === "cat" ? "sel" : ""}" data-act="adxtab" data-k="cat">Katalog ${cat.length}</button><button class="${tab === "upd" ? "sel" : ""}" data-act="adxtab" data-k="upd">Updates ${upd.length}</button></div>`;
    const list = tab === "cat" ? cat : tab === "upd" ? upd : inst;
    const empty = tab === "inst" ? `Noch kein Addon installiert. Im Katalog findest du ${cat.length === 1 ? "ein Addon" : cat.length + " Addons"}.` : tab === "upd" ? "Alle Addons sind aktuell." : "Alle verfügbaren Addons sind installiert.";
    const total = inst.reduce((s, a) => s + (a.size || 0), 0);
    return `${seg}${card(list.length ? list.map(row).join("") : `<div class="mut sm" style="padding:14px">${S.error ? "Die Addon-Verwaltung antwortet nicht. Ist die Integration aktuell?" : this._ad ? empty : "Lädt …"}</div>`)}
      <div class="stleg">${ic("info", 14)} Addons sind Module mit eigener Version, die du hier installierst und wieder entfernst. Mitgelieferte Addons liegen in der Integration (Ordner <code>addons/</code>), weitere kommen später aus <code>Maddog3010/strom-waerme-addons</code>. Addon-API ${S.api || 1} · Kern ${esc(S.core || this._ver || "")} · ${inst.length} installiert · ${kb(total)}</div>`;
  }
  _adxAct(a, b) {
    const k = b.dataset.k;
    const run = (act, id, keep, ok) => {
      this._adWork = true; this._renderModal();
      this._hass.callWS({ type: "fenster_heizung/addons_act", act, addon: id, keep: keep !== false }).then((r) => { this._ad = { d: r, ts: Date.now() }; this._adImport(); if (ok) ok(); })
        .catch((e) => this._toast((e && e.message) || "Das hat nicht geklappt"))
        .finally(() => { this._adWork = false; this._render(); this._renderModal(); });
    };
    if (a === "adxtab") { this._adTab = k; this._render(); }
    else if (a === "adxinst") { this._modal = { type: "adinst", id: k }; this._renderModal(); }
    else if (a === "adxdo") run("install", k, true, () => { this._modal = null; this._toast("Installiert. Das Modul steht jetzt in der Leiste."); this._adTab = "inst"; });
    else if (a === "adxdel") { this._modal = { type: "addel", id: k, keep: true }; this._renderModal(); }
    else if (a === "adxkeep") { this._modal.keep = k === "1"; this._renderModal(); }
    else if (a === "adxrm") { const keep = this._modal.keep !== false; run("uninstall", k, keep, () => { this._modal = null; delete (this._adJs || {})[k]; this._toast(keep ? "Deinstalliert, deine Daten bleiben erhalten" : "Deinstalliert und Daten gelöscht"); }); }
    else if (a === "adxpause") run("pause", k, true, () => this._toast("Pausiert"));
    else if (a === "adxresume" || a === "adxretry") { delete (this._adJs || {})[k]; run(a === "adxresume" ? "resume" : "retry", k, true, () => this._toast("Läuft wieder")); }
    else if (a === "adxopen") { this._stOpen = false; this._mdActiveSet(k); this._render(); }
    else if (a === "adxa") { const d = this._adDef(b.dataset.ad); if (d && d.act) d.act(this, b.dataset.a, b); }
  }
  _adxChange(t) { const d = this._adDef(t.dataset.ad); if (d && d.change) { d.change(this, t); return true; } return false; }
