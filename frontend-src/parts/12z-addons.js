  /* ================= Addons (Addon-Schnittstelle API 1) =================
     Ein Addon bringt seinen Python-Teil und seine Seite (www/panel.js) selbst mit. Der Kern lädt die Liste aus
     fenster_heizung/addons_get, lädt die Seite eines aktiven Addons per import() nach und gibt ihr die Bausteine
     des Kerns (Symbole, Texte, Aufruf des Backends). Die Seite eines Addons ist ein ES-Modul:
       export default (api) => ({ page(p, m), tile(p, s), act(p, a, el), change(p, el), modal(p, type), icons, art, css })
     Aktionen eines Addons heißen data-act="adxa" data-ad="<id>" data-a="<aktion>". */
  _adState() { return (this._ad && this._ad.d) || { addons: [] }; }
  _adOn(id) { return this._adState().addons.some((a) => a.id === id && a.status === "on"); }
  /* Phase 3: Müllabfuhr und Licht sind Addons. Ihre Methoden (_mu…, _li…) bringt das Addon als Mixin mit. */
  _muOn() { return this._adOn("muell") && typeof this._mu === "function"; }
  _liOn() { return this._adOn("licht") && typeof this._liPage === "function"; }
  _adLoad(force) {
    if (!this._hass || this._adBusy) return;
    if (!force && this._ad && Date.now() - this._ad.ts < 30000) return;
    this._adBusy = true;
    this._hass.callWS({ type: "fenster_heizung/addons_get" }).then((r) => { this._ad = { d: r || { addons: [] }, ts: Date.now() }; this._adImport(); })
      .catch(() => { this._ad = { d: { addons: [], error: true }, ts: Date.now() }; })
      .finally(() => { this._adBusy = false; this._render(); if (this._modal && String(this._modal.type).startsWith("ad")) this._renderModal(); });
  }
  _adApi() {
    return { v: 1, ic, esc, num, ico, ICONS, MOD_ART, STG,
      call: (id, cmd, data) => this._hass.callWS({ type: "fenster_heizung/addon_call", addon: id, cmd, data: data || {} }) };
  }
  _adImport() {
    this._adDefs = this._adDefs || {}; this._adJs = this._adJs || {};
    this._adState().addons.filter((a) => a.status === "on" && a.js).forEach((a) => {
      if (this._adJs[a.id] === a.js) return;
      this._adJs[a.id] = a.js;
      import(a.js).then((mod) => {
        const def = (mod.default || mod)(this._adApi()) || {};
        if (typeof def.mixin === "function") {  // Methoden des Addons an das Panel hängen (frühere Module des Kerns)
          const P = Object.getPrototypeOf(this);
          Object.getOwnPropertyNames(def.mixin.prototype).filter((n) => n !== "constructor").forEach((n) => { P[n] = def.mixin.prototype[n]; });
        }
        Object.assign(ICONS, def.icons || {}); if (def.art) MOD_ART[a.id] = def.art;
        this._adDefs[a.id] = def; this._render(); if (this._modal) this._renderModal();
      }).catch((e) => { this._adDefs[a.id] = { err: String(e && e.message || e) }; this._render(); });
    });
  }
  _adMods() {
    return this._adState().addons.filter((a) => a.status === "on").map((a) => ({ id: a.mid || a.id, aid: a.id, n: a.n, name: a.name, short: a.short || a.name, icon: ICONS[a.icon] ? a.icon : "puzzle", tag: a.tag, addon: true, beta: a.stage !== "stabil", stage: a.stage, ad: a }));
  }
  _adDef(id) { return (this._adDefs || {})[id]; }
  _adPage(m) {
    const d = this._adDef(m.aid || m.id);
    if (!d) return `<div class="card empty">${ic("puzzle", 36)}<div style="margin:10px 0 4px;font-weight:700">${esc(m.name)}</div>Seite des Addons wird geladen …</div>`;
    if (d.err) return `<div class="card empty">${ic("alert", 36)}<div style="margin:10px 0 4px;font-weight:700">${esc(m.name)}</div>Die Seite des Addons ließ sich nicht laden.<br><span class="sm">${esc(d.err)}</span></div>`;
    try { return (d.css ? `<style>${d.css}</style>` : "") + d.page(this, m); } catch (e) { return `<div class="card empty">${ic("alert", 36)}<div style="margin:10px 0 4px;font-weight:700">Fehler in der Seite des Addons</div><span class="sm">${esc(e.message)}</span></div>`; }
  }
  _adTile(m) { const s = (m.ad && m.ad.summary && m.ad.summary.tile) || {}; return { sub: esc(s.sub || ""), c: s.c || "" }; }
  _adHints() { return this._adState().addons.filter((a) => a.status === "on").flatMap((a) => ((a.summary || {}).hints || []).map((h) => ({ i: ICONS[h.i] ? h.i : "info", t: esc(h.t), s: esc(h.s || ""), r: h.c === "bad" ? "jetzt" : "", c: h.c || "", mod: a.mid || a.id }))); }
  _adModal() {
    const m = this._modal, A = this._adState().addons.find((x) => x.id === m.id);
    if (m.type === "adx" || !A) { const d = this._adDef(m.id); return d && d.modal ? (d.css ? `<style>${d.css}</style>` : "") + d.modal(this, m) : ""; }
    const hd = (t, s) => `<div class="sh"><div><b>${t}</b><span>${s}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>`;
    const kb = (b) => b >= 1e6 ? `${num(b / 1e6, 1)} MB` : `${Math.max(1, Math.round(b / 1000))} kB`;
    if (m.type === "adinst") {
      return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">${hd(`Modul ${A.n} · ${esc(A.name)}`, `Addon · v${esc(A.version)} Build ${A.build} · ${STG[A.stage] ? STG[A.stage].t : ""}`)}
        <div class="adhero">${ic(ICONS[A.icon] ? A.icon : "puzzle", 34)}<div><b>${esc(A.tag)}</b><span>${esc(A.desc)}</span></div></div>
        <div class="lsec">${ic("info", 15)}Steckbrief</div>
        <div class="adkv"><span>Quelle</span><b>${A.src === "remote" || (A.remote && A.upd_src === "remote") ? `Katalog auf GitHub (${esc((this._adState().cat || {}).repo || "")})` : A.src === "ext" ? "Aus dem Katalog, schon geladen" : "Mitgeliefert in der Integration"}</b><span>Ablage</span><b>${A.src === "bundled" ? "Ordner addons/ der Integration" : `config/${esc(this._adState().ext_dir || "")}/${esc(A.id)}`}</b><span>Größe</span><b>${kb(A.src === "remote" ? (A.dl_size || (A.remote || {}).size || 0) : A.size || 0)}${A.src === "remote" ? " zum Laden" : ""}</b>${A.src === "remote" ? `<span>Prüfung</span><b>Unterschrift des Katalogs ✓ · SHA-256 der Datei vor dem Entpacken</b>` : ""}<span>Braucht</span><b>Strom &amp; Wärme ${esc(A.core_min || "–")} · Addon-API ${A.api}</b><span>Unterstützt</span><b>${(A.optional || []).map(esc).join(", ") || "–"}</b><span>Internet</span><b>${(A.network || []).length ? A.network.map(esc).join(", ") : "keine Verbindung nach außen"}</b></div>
        ${(A.hints || []).map((h) => `<div class="gst">${ic("info", 15)}<span>${esc(h)} Du kannst das Addon trotzdem schon installieren.</span></div>`).join("")}
        ${A.can ? "" : `<div class="gst bad">${ic("alert", 15)}<span>${esc(A.why)}</span></div>`}
        ${A.kept ? `<div class="gst">${ic("check", 15)}<span>Deine Daten von der letzten Installation sind noch da und werden übernommen.</span></div>` : ""}
        <div class="gst">${ic("shield", 15)}<span>Ein Addon läuft mit denselben Rechten wie die Integration. Mitgelieferte Addons kommen direkt von Maddog3010.</span></div>
        <div class="gbtns"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="adxdo" data-k="${A.id}" ${A.can && !this._adWork ? "" : "disabled"}>${this._adWork ? (A.src === "remote" ? "Wird geladen und geprüft …" : "Wird installiert …") : "Installieren"}</button></div></div>`;
    }
    if (m.type === "adupd") {
      const R = A.remote || {}, loc = A.upd_src !== "remote";
      return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">${hd(`${esc(A.name)} aktualisieren`, `Modul ${A.n} · Addon`)}
        <div class="adver"><div><small>Installiert</small><b>v${esc(A.cur || A.version)}</b></div><span>${ic("chev", 18)}</span><div class="nw"><small>Neu</small><b>v${esc(loc ? A.version + " Build " + A.build : R.version + " Build " + R.build)}</b></div></div>
        ${!loc && (R.notes || []).length ? `<div class="lsec">${ic("list", 15)}Was ist neu${R.date ? ` <span class="mut sm">· ${esc(new Date(R.date + "T12:00:00").toLocaleDateString("de-DE"))}</span>` : ""}</div><ul class="adnotes">${R.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : ""}
        <div class="wxl"><div class="wxr"><span class="wxi">${ic("download", 18)}</span><div class="wxm"><div class="wxt"><b>${loc ? "Kommt mit der Integration" : `Laden aus dem Katalog · ${kb(R.size || 0)}`}</b></div><small>${loc ? "Die neuere Version liegt schon im Ordner addons/ und wird nur neu gestartet." : "Unterschrift des Katalogs und SHA-256 der Datei werden vor dem Entpacken geprüft."}</small></div></div>
          <div class="wxr"><span class="wxi">${ic("check", 18)}</span><div class="wxm"><div class="wxt"><b>Deine Daten bleiben</b></div><small>Räume, Ziele, Verlauf und Einstellungen werden übernommen.</small></div></div>
          ${loc ? "" : `<div class="wxr"><span class="wxi">${ic("back", 18)}</span><div class="wxm"><div class="wxt"><b>Rücksprung jederzeit</b></div><small>Die bisherige Version bleibt liegen. Startet die neue nicht, läuft sofort wieder die alte.</small></div></div>`}</div>
        <div class="gbtns"><button class="btn2" data-act="close">Später</button><button class="btn2 pri" data-act="adxupdo" data-k="${A.id}" ${this._adWork ? "disabled" : ""}>${this._adWork ? (loc ? "Wird neu gestartet …" : "Wird geladen und geprüft …") : "Jetzt aktualisieren"}</button></div></div>`;
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
    const nv = (a) => a.upd_src === "remote" && a.remote ? a.remote.version : a.version;
    const stc = (a) => a.busy ? `<em class="sxc wa">${esc(a.busy)} …</em>` : a.status === "on" ? (a.update ? `<em class="sxc wa">Update v${esc(nv(a))}</em>` : `<em class="sxc ok">aktiv</em>`) : a.status === "paused" ? `<em class="sxc off">pausiert</em>` : a.status === "error" ? `<em class="sxc er">Fehler</em>` : "";
    const row = (a) => `<div class="adrow ${a.status}"><div class="adtop"><span class="sxi">${ic(ICONS[a.icon] ? a.icon : "puzzle", 22)}</span><span class="sxt"><b>Modul ${a.n} · ${esc(a.name)}</b><small>v${esc(a.installed && a.cur ? a.cur : a.version + " Build " + a.build)} · ${STG[a.stage] ? STG[a.stage].t : ""} · ${a.src === "ext" ? "aus dem Katalog" : a.src === "remote" ? `aus dem Katalog · ${kb(a.dl_size || (a.remote || {}).size || 0)}` : "mitgeliefert"}${a.status === "on" && a.summary && a.summary.info ? " · " + esc(a.summary.info) : ""}${a.from_lab ? " · früher Lab, Einstellungen übernommen" : ""}</small></span>${a.installed ? stc(a) : a.sponsor ? `<em class="sxc sp">Sponsor</em>` : ""}</div>
      ${a.err && a.status !== "on" ? `<div class="gst bad">${ic("alert", 15)}<span>${esc(a.err)}</span></div>` : ""}
      ${!a.installed ? `<p class="adds">${esc(a.desc || a.tag)}</p>` : ""}${a.update && tab === "upd" && a.remote && (a.remote.notes || []).length ? `<ul class="adnotes adin">${a.remote.notes.slice(0, 4).map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : ""}
      <div class="adbtn">${a.installed ? `${a.status === "on" ? `<button class="gsch sel" data-act="adxopen" data-k="${a.id}">Öffnen</button>` : ""}${a.status === "on" && (this._adDef(a.id) || {}).settings ? `<button class="gsch" data-act="adxset" data-k="${a.id}">${ic("sliders", 14)} Einstellungen</button>` : ""}${a.status === "error" ? `<button class="gsch sel" data-act="adxretry" data-k="${a.id}">Erneut versuchen</button>` : ""}${a.update ? `<button class="gsch sel" data-act="adxupd" data-k="${a.id}">${ic("download", 14)} Aktualisieren auf v${esc(nv(a))}</button>` : ""}${a.old ? `<button class="gsch" data-act="adxold" data-k="${a.id}">${ic("back", 14)} Zurück zu v${esc(a.old)}</button>` : ""}${a.status === "paused" ? `<button class="gsch sel" data-act="adxresume" data-k="${a.id}">Fortsetzen</button>` : a.status === "on" ? `<button class="gsch" data-act="adxpause" data-k="${a.id}">Pausieren</button>` : ""}<button class="gsch" data-act="adxdel" data-k="${a.id}">Deinstallieren</button>`
        : `<button class="gsch sel" data-act="adxinst" data-k="${a.id}">${ic("download", 14)} Installieren</button>${a.kept ? `<span class="mut sm">Daten von früher vorhanden</span>` : ""}`}</div></div>`;
    const seg = `<div class="seg adseg"><button class="${tab === "inst" ? "sel" : ""}" data-act="adxtab" data-k="inst">Installiert ${inst.length}</button><button class="${tab === "cat" ? "sel" : ""}" data-act="adxtab" data-k="cat">Katalog ${cat.length}</button><button class="${tab === "upd" ? "sel" : ""}" data-act="adxtab" data-k="upd">Updates ${upd.length}</button></div>`;
    const list = tab === "cat" ? cat : tab === "upd" ? upd : inst;
    const empty = tab === "inst" ? `Noch kein Addon installiert. Im Katalog findest du ${cat.length === 1 ? "ein Addon" : cat.length + " Addons"}.` : tab === "upd" ? "Alle Addons sind aktuell." : "Alle verfügbaren Addons sind installiert.";
    const total = inst.reduce((s, a) => s + (a.size || 0), 0);
    const C = S.cat || {}, ck = C.checked ? new Date(C.checked * 1000) : null, ckT = ck ? (ck.toDateString() === new Date().toDateString() ? "heute " : ck.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }) + " ") + ck.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "noch nicht";
    const cat2 = card(`<div class="adcat ${C.ok === false ? "bad" : C.ok ? "ok" : ""}"><span class="sxi">${ic(C.ok === false ? "alert" : "shield", 20)}</span><span class="sxt"><b>Katalog ${esc(C.repo || "Maddog3010/strom-waerme-addons")}</b><small>${C.ok === false ? `${esc(C.err)}. Installierte Addons laufen weiter${C.count ? `, der letzte gültige Katalog (${C.count}) bleibt stehen` : ""}.` : C.ok ? `Unterschrift gültig · ${C.count} ${C.count === 1 ? "Addon" : "Addons"} · geprüft ${esc(ckT)} · Stand ${esc(String(C.ts || "").slice(0, 10).split("-").reverse().join("."))}` : "Wird beim Start und dann einmal am Tag geprüft"}</small></span><button class="gsch" data-act="adxcheck" ${this._adWork ? "disabled" : ""}>${ic("refresh", 14)} ${this._adWork === "check" ? "Prüft …" : "Jetzt prüfen"}</button></div>`);
    return `${seg}${card(list.length ? list.map(row).join("") : `<div class="mut sm" style="padding:14px">${S.error ? "Die Addon-Verwaltung antwortet nicht. Ist die Integration aktuell?" : this._ad ? empty : "Lädt …"}</div>`)}${cat2}
      <div class="stleg">${ic("info", 14)} Addons sind Module mit eigener Version, die du hier installierst und wieder entfernst. Mitgelieferte Addons liegen in der Integration (Ordner <code>addons/</code>). Addons aus dem Katalog liegen in <code>config/${esc(S.ext_dir || "strom_waerme_addons")}</code> und überstehen Updates der Integration. Addon-API ${S.api || 1} · Kern ${esc(S.core || this._ver || "")} · ${inst.length} installiert · ${kb(total)}</div>`;
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
    else if (a === "adxupd") { this._modal = { type: "adupd", id: k }; this._renderModal(); }
    else if (a === "adxupdo") run("update", k, true, () => { this._modal = null; delete (this._adJs || {})[k]; const A = this._adState().addons.find((x) => x.id === k); this._toast(A ? `Aktualisiert auf v${A.version}` : "Aktualisiert"); });
    else if (a === "adxold") { delete (this._adJs || {})[k]; run("rollback", k, true, () => { const A = this._adState().addons.find((x) => x.id === k); this._toast(A ? `Zurück auf v${A.version}` : "Zurück auf die frühere Version"); }); }
    else if (a === "adxcheck") { this._adWork = "check"; this._render(); this._hass.callWS({ type: "fenster_heizung/addons_act", act: "check" }).then((r) => { this._ad = { d: r, ts: Date.now() }; const C = r.cat || {}; this._toast(C.ok ? (r.addons.some((x) => x.update) ? "Update gefunden" : "Katalog geprüft, alles aktuell") : `Katalog: ${C.err || "nicht erreichbar"}`); }).catch(() => this._toast("Prüfung fehlgeschlagen")).finally(() => { this._adWork = false; this._render(); }); }
    else if (a === "adxgo") { this._stOpen = true; this._stA = "ad"; this._adTab = "upd"; this._render(); }
    else if (a === "adxset") { const d = this._adDef(k); if (!d || !d.act) { this._toast("Die Seite des Addons wird noch geladen"); return; } const t = b.dataset.t || ""; d.act(this, "settings", b); if (this._modal && this._modal.type === "adx") { if (t) this._modal.tab = t; this._renderModal(); } }
    else if (a === "adxopen") { const A = this._adState().addons.find((x) => x.id === k); this._stOpen = false; this._mdActiveSet((A && A.mid) || k); this._render(); }
    else if (a === "adxa") { const d = this._adDef(b.dataset.ad); if (d && d.act) d.act(this, b.dataset.a, b); }
  }
  /* Suche in den Einstellungen: jedes Addon bringt seine Einträge mit (def.search), sonst einen Eintrag fürs ganze Addon */
  _adCatAdd(C) {
    const extra = this._adMods().flatMap((m) => { const d = this._adDef(m.aid) || {}, P = `Module › Modul ${m.n}`;
      const L = Array.isArray(d.search) && d.search.length ? d.search : [{ id: "", t: `Modul ${m.n} ${m.name}`, k: `${m.short} ${m.tag}`, h: m.tag }];
      return L.map((x) => ({ id: `addon.${m.aid}${x.id ? "." + x.id : ""}`, t: x.t, p: x.p || P, k: `addon modul ${m.n} ${m.name} ${x.k || ""}`.toLowerCase(), go: ["adxset", m.aid], tab: x.tab || "", h: x.h || "", v: x.v ? () => { try { return x.v(this); } catch (_) { return ""; } } : undefined })); });
    return extra.length ? C.concat(extra) : C;
  }
  _adxChange(t) { const d = this._adDef(t.dataset.ad); if (d && d.change) { d.change(this, t); return true; } return false; }
