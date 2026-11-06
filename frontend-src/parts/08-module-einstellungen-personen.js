  /* ================= Module (Modul 2: Warmwasser & Zirkulation, weitere Module) ================= */
  _mdState() {
    if (!this._mds) {
      let act = "fh"; try { act = localStorage.getItem("fh_mod_active") || "fh"; } catch (_) { /* Speicher gesperrt */ }
      this._mds = { active: act, on: { ww: true, en: true, gs: true, lu: false, rb: false, wp: false, ev: false, wx: false, ga: false, sf: false, pl: false, bt: false, dt: false, wa: false, sp: false, ef: false }, ext: [], ww: JSON.parse(JSON.stringify(WW_DEF)), loaded: false };
    }
    return this._mds;
  }
  _mdApply(r) {
    const s = this._mdState();
    if (r && r.modules) {
      s.on = { ww: true, en: true, gs: true, lu: false, rb: false, wp: false, ev: false, wx: false, ga: false, sf: false, pl: false, bt: false, dt: false, wa: false, sp: false, ...(r.modules.on || {}) }; s.ext = Array.isArray(r.modules.ext) ? r.modules.ext : [];
      if (r.modules.gs) this._mdState().gs = r.modules.gs;
      if (r.modules.ev) { const ev = this._mdState().ev = { brand: "", model: "", body: "limousine", color: "blue", ...r.modules.ev }; ev.ent = { soc: "", odo: "", range: "", plug: "", power: "", charging: "", ...(r.modules.ev.ent || {}) }; }
      const en = r.modules.energy, E = this._enState(); E.on = s.on.en !== false;
      if (en) {
        const has = Object.values(en.ent || {}).some(Boolean); let mig = false; try { mig = localStorage.getItem("fh_energy_mig") === "1"; } catch (_) { /* Speicher gesperrt */ }
        if (has || mig) { E.ent = { ...E.ent, ...(en.ent || {}) }; E.sign = en.sign || ""; E.bsign = en.bsign || "charge"; E.bmode = en.bmode === "two" ? "two" : "one"; E.pvn = en.pvn || ""; E.pv2n = en.pv2n || ""; }
        else if (Object.values(E.ent).some(Boolean) && this._admin()) { try { localStorage.setItem("fh_energy_mig", "1"); } catch (_) { /* Speicher gesperrt */ } this._mdSave(); }
        else { try { localStorage.setItem("fh_energy_mig", "1"); } catch (_) { /* Speicher gesperrt */ } }
      }
    }
    const w = r && r.wasser; if (!w) return;
    const d = JSON.parse(JSON.stringify(WW_DEF)), c = w.ww || {}, st = w.status || {}, keep = { day: s.ww.day };
    s.ww = { ...d, ...c, ent: { ...d.ent, ...(c.ent || {}) }, heat: { ...d.heat, ...(c.heat || {}) }, circ: { ...d.circ, ...(c.circ || {}) }, leg: { ...d.leg, ...(c.leg || {}), last: st.leg_last || null }, pv: { ...d.pv, ...(c.pv || {}) }, boost: !!st.boost, circ5: !!st.circ5, away: !!st.away, info: { want: st.want, leg: !!st.leg_running }, ...keep };
    s.loaded = true;
  }
  _mdBackup() { const W = this._mdState().ww, ww = JSON.parse(JSON.stringify(W)); ["boost", "circ5", "away", "day", "info"].forEach((k) => delete ww[k]); delete ww.leg.last; const E = this._enState(); return { modules: { on: this._mdState().on, ext: this._mdState().ext, gs: this._gsState(), ev: this._evState(), energy: { ent: E.ent, sign: E.sign || "", bsign: E.bsign, bmode: E.bmode === "two" ? "two" : "one", pvn: E.pvn || "", pv2n: E.pv2n || "" } }, ww }; }
  _mdSave() {
    clearTimeout(this._mdT);
    this._mdT = setTimeout(() => {
      this._mdT = null;
      if (!this._hass) return;
      /* Noch nicht vom Server geladen: nicht speichern, sonst würden leere Standardwerte die Einstellungen überschreiben */
      if (!this._mdState().loaded) { this._toast("Einstellungen werden noch geladen, bitte gleich nochmal versuchen"); this._mdPoll(); return; }
      const b = this._mdBackup();
      this._hass.callWS({ type: "fenster_heizung/set_modules", modules: b.modules })
        .then(() => this._hass.callWS({ type: "fenster_heizung/set_wasser", ww: b.ww }))
        .then((r) => { this._mdPoll(r); this._pollGen(); this._hsPoll(); this._stSaved(); })
        .catch(() => this._toast("Modul-Einstellung konnte nicht gespeichert werden"));
    }, 500);
  }
  _mdPoll(r) {
    if (!this._hass) return;
    const apply = (x) => { if (!x || this._dragging || (this._modal && ["wwset", "wwsch", "mods", "enset", "gsset", "evset"].includes(this._modal.type)) || this._mdT) return; this._mdApply(x); this._render(); };
    if (r) { apply(r); return; }
    this._hass.callWS({ type: "fenster_heizung/get_modules" }).then(apply).catch(() => {});
  }
  _mdActiveSet(id) { const s = this._mdState(); s.active = id; this._loOpen = false; try { localStorage.setItem("fh_mod_active", id); } catch (_) { /* Speicher gesperrt */ } }
  _mdList() {
    const s = this._mdState(), home = this._hzOn() ? [{ ...MOD_HOME, tag: this._hzGreet() }] : [];
    const rest = [MODS[0], ...(s.on.ww ? [MODS[1]] : []), ...(this._enOn() ? [MODS[2]] : []), ...(s.on.gs !== false ? [MODS[3]] : []), ...MODS.filter((m) => m.beta && s.on[m.id] === true && (!m.sponsor || this._spnS().active)), ...this._adMods()];
    rest.sort((a, b) => a.n - b.n);
    return [...home, ...rest, ...s.ext.filter((x) => x.on).map((x) => ({ id: x.id, n: 0, name: x.name, short: x.name, icon: "puzzle", tag: "Externes Modul", ext: x }))];
  }
  _mdActive() {
    const s = this._mdState();
    if (!this._hzDec && this._cfgReady) {
      this._hzDec = true; let q = ""; try { q = new URLSearchParams(location.search).get("modul") || ""; } catch (_) { /* kein Zugriff */ }
      if (q && this._mdList().some((m) => m.id === q)) s.active = q;
      else if (this._hzOn() && this._hzCfg().open === "start") s.active = "st";
    }
    return this._mdList().some((m) => m.id === s.active) ? s.active : this._hzOn() ? "st" : "fh";
  }
  _stDone(id) {
    if (id === "fh") { const n = this._collect().length; return n ? n + (n === 1 ? " Raum" : " Räume") : ""; }
    if (id === "gs") { const n = this._gsState().devices.length; return n ? n + (n === 1 ? " Gerät" : " Geräte") : ""; }
    const E = id === "ww" ? (this._mdState().ww.ent || {}) : (this._enState().ent || {});
    return Object.values(E).some((v) => v) ? "Eingerichtet" : "";
  }
  _fhOpenSet() {
    if (!this._fhOpen) { let a = null; try { a = JSON.parse(localStorage.getItem("fh-open") || "null"); } catch (_) {} this._fhOpen = new Set(Array.isArray(a) ? a : [this._pv().sensor ? "sum" : "pv"]); }
    return this._fhOpen;
  }
  /* ---------------- Einstellungen (Stufe 1): Bereiche, Übersicht mit Prüfung, zwei Spalten / Unterseiten ---------------- */
  _stIsOn(m) { const s = this._mdState(); return m.id === "fh" || (m.id === "ww" ? s.on.ww : m.beta ? s.on[m.id] === true && (!m.sponsor || this._spnS().active) : m.id === "gs" ? s.on.gs !== false : this._enOn()); }
  /* Sensoren je Modul, die gerade keinen Wert liefern (Solar ist nachts oft „nicht verfügbar“ und zählt nicht) */
  _stDead() {
    const st = (this._hass && this._hass.states) || {}, s = this._mdState(), out = {}, bad = (id) => !st[id] || ["unavailable", "unknown"].includes(String(st[id].state));
    const add = (k, ids) => { const l = [...new Set(ids.filter((x) => typeof x === "string" && /^[a-z_]+\.[a-z0-9_]+$/.test(x) && bad(x)))]; if (l.length) out[k] = l; };
    const p = this._pv() || {};
    add("fh", [p.sensor, p.soc_sensor, p.price_mode === "entity" ? p.price_sensor : "", p.feed_mode === "entity" ? p.feed_sensor : ""]);
    if (s.on.ww) add("ww", Object.values(s.ww.ent || {}));
    if (this._enOn()) { const E = this._enState().ent || {}; add("en", Object.entries(E).filter(([k]) => !["pv", "pv2", "pve", "pve2"].includes(k)).map(([, v]) => v)); }
    if (s.on.gs !== false) add("gs", (this._gsState().devices || []).map((d) => d.ent));
    return out;
  }
  _stChecks() {
    const out = [], dead = this._stDead(), act = MODS.filter((m) => this._stIsOn(m)), mn = (id) => MODS.find((m) => m.id === id) || { n: "", name: id };
    if (this._mwD) this._mwChecks().forEach((x) => out.push(x)); else Object.entries(dead).forEach(([id, l]) => out.push(["wn", `Modul ${mn(id).n}: ${l.length === 1 ? "1 Sensor liefert" : l.length + " Sensoren liefern"} keinen Wert`, l.slice(0, 2).map((x) => esc(this._wzName(x))).join(", ") + (l.length > 2 ? " …" : "") + " · nicht verfügbar", MOD_SET[id] ? MOD_SET[id].act : "mdmgr"]));
    act.filter((m) => !m.beta && !this._stDone(m.id)).forEach((m) => out.push(["wn", `Modul ${m.n} ${m.name} ist noch nicht eingerichtet`, esc(MOD_SET[m.id].txt), MOD_SET[m.id].act]));
    const eb = this._stEbk && this._stEbk.cfg;
    if (eb && eb.on && eb.last && eb.last.ok === false) out.push(["wn", "Sicherung auf den Homeserver fehlgeschlagen", esc(eb.last.msg || ""), "gen"]);
    else if (eb && eb.on && eb.last && eb.last.t && Date.now() / 1000 - eb.last.t > 8 * 86400) out.push(["wn", "Letzte Sicherung auf den Homeserver ist älter als eine Woche", "", "gen"]);
    const u = this._upd;
    if (u && this._ver && vgt(u.latest, this._ver)) out.push(["in", `Neue Version ${esc(u.latest)} verfügbar`, `Installiert ist ${esc(this._ver)}`, "mver"]);
    if (vbeta(this._ver)) out.push(["in", `Testversion installiert: ${esc(this._ver)}`, "Änderungen unter System → Versionen", "mver"]);
    const mig = this._haus && this._haus.mig;
    if (mig && mig.conflicts && mig.conflicts.length && !mig.seen) out.push(["wn", "Haus-Werte: bitte einmal prüfen", esc(mig.conflicts[0]), "mdhsmig"]);
    else if (mig && !mig.seen) out.push(["in", "Gemeinsame Werte liegen jetzt im Haus", "Energiequellen, Preise, Ladestand und Wetterquelle an einer Stelle", "mdhsmig"]);
    (this._adState().addons || []).filter((a) => a.update).forEach((a) => out.push(["in", `Update für Addon ${esc(a.name)}: v${esc(a.upd_src === "remote" && a.remote ? a.remote.version : a.version)}`, esc(((a.remote || {}).notes || [])[0] || "Einstellungen › Addons › Updates"), "adxgo"]));
    (this._adState().addons || []).filter((a) => a.status === "error").forEach((a) => out.push(["wn", `Addon ${esc(a.name)} läuft nicht`, esc(a.err || ""), "adxgo"]));
    this._stRules().forEach((x) => out.push(x));
    if (!out.some((x) => x[0] === "wn")) out.unshift(["ok", "Alles eingerichtet", "Alle gewählten Sensoren liefern Werte, Einheiten und Vorzeichen passen", ""]);
    return out;
  }
  _stRender() {
    const sr = this.shadowRoot, s = this._mdState(), adm = this._admin(), wide = (this.clientWidth || window.innerWidth) >= 760;
    if (adm && !this._stEbk && this._hass) { this._stEbk = { cfg: null }; this._hass.callWS({ type: "fenster_heizung/ebk_get" }).then((r) => { this._stEbk = r || { cfg: null }; if (this._stOpen) this._render(); }).catch(() => {}); }
    const row = (icn, ttl, txt, act, k, extra) => `<button class="sxrow" data-act="${act}"${k ? ` data-k="${k}"` : ""}><span class="sxi">${ic(icn, 20)}</span><span class="sxt"><b>${ttl}</b><small>${txt}</small></span>${extra || ""}<span class="sxg">${ic("chev", 16)}</span></button>`;
    const lv = (k) => k === "all" ? `<em class="stlv l1" title="Gilt für alle Benutzer und Geräte">🏠 für alle</em>` : `<em class="stlv l3" title="Nur in diesem Browser gespeichert">📱 nur dieses Gerät</em>`;
    const act = MODS.filter((m) => this._stIsOn(m)), off = MODS.filter((m) => !this._stIsOn(m)), dead = this._stDead();
    const labM = [];  // Müllabfuhr und Licht sind seit Phase 3 Addons und stehen mit den anderen Addons in der Liste
    const chk = this._stChecks(), nWarn = chk.filter((x) => x[0] === "wn").length;
    const core = act.filter((m) => !m.beta), done = core.filter((m) => this._stDone(m.id)).length + (this._enConfigured() ? 0 : 0);
    const P = this._ortPersons(), eb = this._stEbk && this._stEbk.cfg, lt = eb && eb.on && eb.last && eb.last.t ? new Date(eb.last.t * 1000) : null;
    const ltTxt = lt ? (lt.toDateString() === new Date().toDateString() ? "heute " : lt.toDateString() === new Date(Date.now() - 864e5).toDateString() ? "gestern " : lt.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }) + " ") + lt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : eb && eb.on ? "noch keine" : "nur intern";
    const modChip = (m) => { if (dead[m.id]) return `<em class="sxc er">${dead[m.id].length === 1 ? "1 Sensor ohne Wert" : dead[m.id].length + " Sensoren ohne Wert"}</em>`; if (m.beta) return `<em class="sxc ${STG[modSt(m)].c}">${STG[modSt(m)].t}</em>`; const d = this._stDone(m.id); return d ? `<em class="sxc ok">${esc(d)}</em>` : `<em class="sxc wa">Offen</em>`; };
    const AREAS = [
      ["ov", "info", "Übersicht", `${done} von ${core.length} eingerichtet${nWarn ? " · " + nWarn + (nWarn === 1 ? " Hinweis" : " Hinweise") : ""}`, nWarn ? `<em class="sxc wa">${nWarn}</em>` : ""],
      ["mw", "gauge", "Messwerk", this._mwD ? `${this._mwD.stats.sensors} Sensoren · ${this._mwD.stats.bad ? this._mwD.stats.bad + " mit Problem" : "alle liefern"}` : "Alle Sensoren aller Module", this._mwD && this._mwD.stats.bad ? `<em class="sxc wa">${this._mwD.stats.bad}</em>` : ""],
      ["hs", "home", "Haus", "Räume, Personen, Energie, Preise", ""],
      ["md", "puzzle", "Module", `${act.length} an · ${off.length} aus`, ""],
      ["lk", "palette", "Darstellung", "Farben, Wetter, Raumsymbole", ""],
      ["dv", "tablet", "Dieses Gerät", "Tablet-Modus, Zeiträume, Ansicht", ""],
      ["ad", "package", "Addons", (() => { const L = this._adState().addons || [], n = L.filter((a) => a.installed).length; return `${n} installiert · ${L.length - n} im Katalog`; })(), (() => { const L = this._adState().addons || [], u = L.filter((a) => a.update).length, e = L.filter((a) => a.status === "error").length; return e ? `<em class="sxc er">${e}</em>` : u ? `<em class="sxc wa">${u}</em>` : ""; })()],
      ["ex", "flask", "Erweiterungen", "Store, Labs, eigene Module", this._labCount() ? `<em class="sxc ok">${this._labCount()} ${this._labCount() === 1 ? "Lab" : "Labs"}</em>` : ""],
      ["sy", "shield", "System", "Sichern, Diagnose, Versionen", ""],
      ["sp", "heart", "Sponsor", "Schlüssel und Extras", ""]];
    const area = AREAS.some((a) => a[0] === this._stA) ? this._stA : wide ? "ov" : "";
    const card = (body, ttl) => `<div class="card sxl stcard">${ttl ? `<div class="stch">${ttl}</div>` : ""}${body}</div>`;
    const page = {
      ov: () => `<div class="sxsum"><div><b>${act.length}</b><span>${act.length === 1 ? "Modul aktiv" : "Module aktiv"}</span></div><div><b>${done} / ${core.length}</b><span>Einrichtung erledigt</span></div><div><b>${this._collect().length}</b><span>Räume · ${P.length} ${P.length === 1 ? "Person" : "Personen"}</span></div><div><b>${esc(ltTxt)}</b><span>Sicherung Homeserver</span></div></div>
        ${card(chk.map(([l, t, sub, a, k]) => `<${a ? `button class="stck" data-act="${a}"${k ? ` data-k="${esc(k)}"` : ""}` : 'div class="stck"'}><span class="stdot ${l}"></span><span class="sxt"><b>${t}</b>${sub ? `<small>${sub}</small>` : ""}</span>${a ? `<span class="stgo">${l === "wn" ? "Beheben" : "Öffnen"} ${ic("chev", 14)}</span>` : ""}</${a ? "button" : "div"}>`).join(""), `Prüfung <small>· gerade eben</small>`)}
        ${card(`${this._stLogRows(this._stLog || [], 3)}${(this._stLog || []).length > 3 ? `<button class="stck" data-act="mdstlog"><span class="sxt"><b>Alle ${this._stLog.length} Änderungen anzeigen</b></span><span class="stgo">Verlauf ${ic("chev", 14)}</span></button>` : ""}`, `Letzte Änderungen <small>· mit Rückgängig</small>`)}
        ${card(`${row("total", `Preise &amp; Tarif ${lv("all")}`, `${num(this._price(), 1)} ct Bezug · ${num(this._feed(), 1)} ct Einspeisung · Haus`, "mdsts", "pr")}
          ${row("sun", `Energiequellen ${lv("all")}`, "Solar, Netz, Batterie, Ladestand · Haus", "mdsts", "en", this._enConfigured() ? `<em class="sxc ok">Eingerichtet</em>` : `<em class="sxc wa">Offen</em>`)}
          ${row("sliders", "Sichern &amp; Wiederherstellen", "Datei und Homeserver", "gen")}`, "Häufig gebraucht")}`,
      hs: () => this._hsPage(row, card, lv),
      mw: () => this._mwPage(card),
      md: () => `${card(act.map((m) => [m.n, row(m.icon, `${esc(m.name)} <i class="stmn">Modul ${m.n}${MV[m.id] ? " · v" + esc(MV[m.id].v) : ""}</i>`, esc(MOD_SET[m.id].txt), MOD_SET[m.id].act, "", modChip(m))]).concat(labM.filter((x) => this._labOn(x[1])).map(([m, , a, t]) => [m.n, row(m.icon, `${esc(m.name)} <i class="stmn">Modul ${m.n}${MV[m.id] ? " · v" + esc(MV[m.id].v) : ""}</i>`, esc(t), a, "", `<em class="sxc lab">Lab</em>`)])).concat(this._adMods().map((m) => [m.n, row(m.icon, `${esc(m.name)} <i class="stmn">Modul ${m.n} · v${esc(m.ad.version)}</i>`, esc((this._adDef(m.aid) || {}).settingsTxt || m.tag), "adxset", m.aid, `<em class="sxc ${STG[m.stage] ? STG[m.stage].c : ""}">Addon</em>`)])).sort((x, y) => x[0] - y[0]).map((x) => x[1]).join("") + s.ext.map((x) => row("puzzle", `${esc(x.name)} <i class="stmn">Eigenes Modul</i>`, esc(x.url), "mdmgr", "", `<em class="sxc ${x.on ? "ok" : "off"}">${x.on ? "An" : "Aus"}</em>`)).join(""), `Eingeschaltet <small>· ${act.length}</small>`)}
        ${off.length ? `<div class="card sxl stcard"><button class="stch sttg" data-act="mdstoff" aria-expanded="${!this._stOffC}">Ausgeschaltet <small>· ${off.length} · ein Tipp schaltet ein</small><span class="stgo">${this._stOffC ? "Anzeigen ▾" : "Einklappen ▴"}</span></button>
          ${this._stOffC ? "" : `<div class="stmini">${off.map((m) => `<button class="stmb" data-act="mdtog" data-k="${m.id}" title="${esc(m.name)} einschalten">${ic(m.icon, 16)}<span class="stmt"><b>${esc(m.short)}</b><small>Modul ${m.n}${m.sponsor ? " · Sponsor" : m.beta && modSt(m) ? " · " + STG[modSt(m)].t : ""}</small></span></button>`).join("")}</div>`}</div>` : ""}`,
      lk: () => card(`${row("palette", "Darstellung", "Akzentfarbe, Wetter, Raumsymbole", "look")}${this._hzOn() ? row("home", "Startseite", "Karten, Bubbles und Begrüßung", "hzopen") : ""}`),
      dv: () => `${card(`${row("tablet", `Tablet-Modus ${lv("dev")}`, `${this._tmOn() ? "An" : "Aus"} · PIN, Ruhemodus, Display`, "tmopen")}
          <div class="sxrow stinfo"><span class="sxi">${ic("month", 20)}</span><span class="sxt"><b>Zeitraum Modul 3 und 4 ${lv("dev")}</b><small>Wird in diesem Browser gemerkt, wenn du ihn im Modul wechselst</small></span></div>
          <div class="sxrow stinfo"><span class="sxi">${ic("grid", 20)}</span><span class="sxt"><b>Ansicht der Raumkarten ${lv("dev")}</b><small>${this._view() === "compact" ? "Kompakt" : "Detail"} · umschalten in Modul 1</small></span></div>`)}<div class="stleg">${lv("dev")} Diese Einstellungen gelten nur für diesen Browser und sind nicht in der Sicherung.</div>`,
      ex: () => card(`${row("puzzle", "Store &amp; Integrationen", "Dienste und Geräte entdecken, verbinden und verwalten", "igopen")}
          ${row("flask", "Labs", "Experimentelle Funktionen ansehen und einschalten", "labopen", "", `<em class="sxc ${this._labCount() ? "ok" : "off"}">${this._labCount() ? this._labCount() + " an" : "Aus"}</em>`)}
          ${row("layers", "Module verwalten", "Module ein- und ausschalten, eigene Module hinzufügen", "mdmgr")}`),
      sy: () => card(`${row("sliders", "Sichern &amp; Wiederherstellen", "Einstellungen als Datei sichern, Homeserver, interne Kopien", "gen", "", `<em class="sxc ${lt ? "ok" : ""}">${esc(ltTxt)}</em>`)}
          ${row("clock", "Änderungsverlauf", "Wer hat wann was geändert, jede Änderung einzeln zurücknehmen", "mdstlog", "", (this._stLog || []).length ? `<em class="sxc">${this._stLog.length}</em>` : "")}
          ${row("shield", "Diagnose", "Ventile, Fenster und Verbindung prüfen", "diag")}
          ${row("layers", "Versionen", "Letzte Updates mit Änderungen, Modulversionen und Versionsschema", "mver")}`),
      sp: () => card(this._spnRow()),
      ad: () => this._adSetPage(card),
    };
    const A = AREAS.find((a) => a[0] === area);
    const nav = `<nav class="stnav" aria-label="Bereiche der Einstellungen">${AREAS.map(([k, i, t, sub, ch]) => wide
      ? `<button class="stni ${k === area ? "sel" : ""}" data-act="mdsta" data-k="${k}" aria-current="${k === area}"><span class="sxi">${ic(i, 18)}</span><b>${t}</b>${ch}</button>`
      : `<button class="sxrow" data-act="mdsta" data-k="${k}"><span class="sxi">${ic(i, 20)}</span><span class="sxt"><b>${t}</b><small>${sub}</small></span>${ch}<span class="sxg">${ic("chev", 16)}</span></button>`).join("")}</nav>`;
    const SUB = { en: "Energiequellen", pr: "Preise &amp; Tarif", wx: "Wetterquelle" }, sub = area === "hs" && SUB[this._stS] ? this._stS : "";
    const head = A ? sub ? `<div class="sthd"><button class="lnk stbk" data-act="mdsts" data-k="">‹ Haus</button><h2>${SUB[sub]}</h2></div>` : `<div class="sthd">${!wide ? `<button class="lnk stbk" data-act="mdsta" data-k="">‹ Einstellungen</button>` : `<div class="mut sm" style="margin:0">Einstellungen</div>`}<h2>${A[2]}</h2></div>` : "";
    /* Suche: Treffer und normaler Inhalt stehen nebeneinander im DOM, beim Tippen wird nur umgeschaltet (das Eingabefeld bleibt erhalten). */
    const q = !!this._stQ, res = `<div id="stres">${q ? this._stResHtml(wide) : ""}</div>`, sbox = this._stSearchBox(), wrapB = (x) => `<div id="stbody"${q ? " hidden" : ""}>${x}</div>`;
    const body = wide ? `<div class="stlay"><div class="stside">${sbox}${nav}</div><div class="stmain">${res}${wrapB(head + page[area]())}</div></div>`
      : !A || q ? `${sbox}${res}${wrapB(`<div class="card sxl stcard">${nav}</div>`)}` : `${head}${page[area]()}`;
    if (!this._stLogTs || Date.now() - this._stLogTs > 30000) { this._stLogTs = Date.now(); this._stLogLoad(); }
    this._mwLoad();
    const ae = sr.activeElement, foc = ae && ae.dataset && ae.dataset.f === "stq" ? [ae.selectionStart, ae.selectionEnd] : null;
    sr.getElementById("main").innerHTML = `
      <div class="bar${this._narrow ? " nar" : ""}">${this._narrow ? `<button class="ib0" data-act="menu" aria-label="Menü">${ic("menu", 24)}</button>` : ""}
        <div class="brand"><img class="blogo" src="${LOGO_URL}" alt="MADDOG3010" draggable="false"><div><em class="pn">${esc(PRODUCT)}</em><b>Einstellungen</b><span><em class="tag">Alle Bereiche an einem Ort</em>${this._verTag()}</span></div></div>
        <button class="pillbtn pri" data-act="mdstx">${ic("check", 16)}<span class="bl">Fertig</span></button></div>
      <div class="wrap"><div class="sxw stw">${body}</div></div>`;
    if (foc) { const i = sr.querySelector('[data-f="stq"]'); if (i) { i.focus(); try { i.setSelectionRange(foc[0], foc[1]); } catch (_) { /* Suchfeld */ } } }
  }
  /* ---------------- Haus (Stufe 2): gemeinsame Werte an einer Stelle. Der Haus-Speicher im Backend ist führend und verteilt die Werte an die Module. ---------------- */
  _hsPoll() {
    if (!this._hass) return;
    clearTimeout(this._hsT);
    this._hsT = setTimeout(() => this._hass.callWS({ type: "fenster_heizung/haus_get" }).then((r) => { this._haus = (r && r.haus) || null; if (this._stOpen) this._render(); if (this._modal && this._modal.type === "hsmig") this._renderModal(); }).catch(() => {}), 400);
  }
  _hsUsed(k) {
    const u = ((this._haus && this._haus.used) || {})[k] || { energy: [3, 4, 8, 13, 16, 19], soc: [1, 3, 8, 13], price: [1, 3, 4, 8, "Labs"], wx: [1, 9, "Start", "Labs"] }[k] || [];
    const n = u.filter((x) => typeof x === "number"), o = u.filter((x) => typeof x !== "number");
    const l = [...(n.length ? [`Modul ${n.join(", ")}`] : []), ...o];
    return l.join(", ").replace(/, ([^,]*)$/, " und $1");
  }
  _hsVal(id, sign) {
    const s = id && this._hass.states[id];
    if (!id) return "";
    if (!s || ["unavailable", "unknown"].includes(String(s.state))) return `<em class="hsv bad">kein Wert</em>`;
    const u = (s.attributes || {}).unit_of_measurement || "", v = parseFloat(s.state);
    const txt = isFinite(v) ? `${sign && v > 0 ? "+" : v < 0 ? "−" : ""}${num(Math.abs(v), Math.abs(v) >= 100 || u === "%" ? 0 : 1)}${u ? " " + u : ""}` : esc(s.state);
    return `<em class="hsv">${txt} ${ic("check", 12)}</em>`;
  }
  _hsRow(icn, ttl, id, note, sign, empty, cid) {
    return `<div class="sxrow stinfo hsr"><span class="sxi">${ic(icn, 20)}</span><span class="sxt"><b>${ttl}${cid ? this._stHelpBtn(cid) : ""}</b><small>${id ? esc(id) + (note ? " · " + note : "") : esc(empty || "nicht gewählt")}</small></span>${this._hsVal(id, sign)}</div>`;
  }
  _hsEnCheck() {
    const E = this._enState(), g = this._enGrid(), st = this._hass.states, ids = [E.ent.pv, E.ent.pv2, g.ent, E.ent.house, E.ent.bat, E.ent.bchg, E.ent.bdis, this._pv().soc_sensor].filter(Boolean);
    const dead = ids.filter((x) => !st[x] || ["unavailable", "unknown"].includes(String(st[x].state)) && !(x === E.ent.pv || x === E.ent.pv2));
    if (!E.ent.pv || !g.ent) return ["wn", "Solar und Netz fehlen noch", "Ohne diese beiden Sensoren rechnen Modul 3, 4 und 8 nicht."];
    if (dead.length) return ["wn", dead.length === 1 ? "1 Sensor liefert keinen Wert" : `${dead.length} Sensoren liefern keinen Wert`, dead.map((x) => esc(this._wzName(x))).join(", ")];
    const pv = this._enPvW(), gr = this._enW(g.ent), b = this._enBatW();
    if (pv != null && gr != null) { const exp = g.sign === "import" ? -gr : gr, house = pv - exp - (b || 0); if (house < -80 || (pv < 30 && exp > 80)) return ["wn", "Vorzeichen prüfen: Netz", "Der Hausverbrauch wäre gerade negativ. Unter „Bearbeiten“ prüfen und umdrehen."]; }
    return ["ok", "Vorzeichen geprüft · alle Sensoren liefern Werte", ""];
  }
  _hsPage(row, card, lv) {
    const s = this._mdState(), sub = this._stS || "", adm = this._admin(), E = this._enState(), g = this._enGrid(), p = this._pv(), L = this._wxCfg(), st = this._hass.states;
    const use = (k) => `<div class="hsuse">Gilt für ${this._hsUsed(k)} · ${lv("all")}</div>`, edit = (act, t) => adm ? `<div class="gbtns hsed"><button class="btn2 pri" data-act="${act}">${ic("pencil", 15)} ${t || "Bearbeiten"}</button></div>` : `<div class="mut sm">Ändern können nur Administratoren.</div>`;
    const mig = this._haus && this._haus.mig, banner = mig && !mig.seen ? `<div class="card stcard hsmig ${mig.conflicts && mig.conflicts.length ? "warn" : ""}"><div class="hsmh">${ic("home", 18)}<b>Gemeinsame Werte liegen jetzt im Haus</b></div>
      <div class="mut sm">Energiequellen, Ladestand, Preise und Wetterquelle wurden einmalig aus Modul 1, Modul 3, der Darstellung und Modul 9 übernommen. Alle Module lesen sie ab jetzt von hier. Vorher wurde automatisch gesichert.</div>
      ${mig.conflicts && mig.conflicts.length ? `<div class="enchk warn" style="margin:8px 0 0"><b>${ic("alert", 16)}Bitte einmal prüfen</b><span>${mig.conflicts.map(esc).join("<br>")}</span></div>` : ""}
      <div class="gbtns" style="margin-top:8px"><button class="btn2" data-act="mdhsmig">Was wurde übernommen?</button>${adm ? `<button class="btn2 pri" data-act="mdhsseen">Verstanden</button>` : ""}</div></div>` : "";
    if (sub === "en") {
      const ck = this._hsEnCheck(), nm = this._enPvNames(), cnt = ["pve", "pve2", "imp", "exp"].filter((k) => E.ent[k]).length;
      return `${use("energy")}${card(`${this._hsRow("sun", esc(nm[0]), E.ent.pv, "", false, "", "haus.energy.ent.pv")}
        ${E.ent.pv2 ? this._hsRow("sun", `Zweite Anlage „${esc(nm[1])}“`, E.ent.pv2, "", false) : ""}
        ${this._hsRow("bolt", "Netz", g.ent, g.sign === "import" ? "Bezug positiv" : "Einspeisung positiv", true, "", "haus.energy.ent.grid")}
        ${E.bmode === "two" ? this._hsRow("energy", "Batterie lädt", E.ent.bchg, "", false) + this._hsRow("energy", "Batterie entlädt", E.ent.bdis, "", false) : this._hsRow("energy", "Batterie", E.ent.bat, E.bsign === "discharge" ? "Entladen positiv" : "Laden positiv", true, "keine Batterie")}
        ${this._hsRow("energy", "Ladestand", p.soc_sensor, "", false, "kein Ladestand", "general.pv.soc_sensor")}
        ${this._hsRow("home", "Hausverbrauch", E.ent.house, "", false, "wird aus Solar, Netz und Batterie berechnet", "haus.energy.ent.house")}
        <div class="sxrow stinfo"><span class="sxi">${ic("chart", 20)}</span><span class="sxt"><b>Zähler für Tagessummen</b><small>${cnt ? `${cnt} ${cnt === 1 ? "Zähler" : "Zähler"} gewählt` : "keine, Woche, Monat und Jahr werden aus der Leistung berechnet"}</small></span></div>`)}
        <div class="stck hsck ${ck[0]}"><span class="stdot ${ck[0]}"></span><span class="sxt"><b>${ck[1]}</b>${ck[2] ? `<small>${ck[2]}</small>` : ""}</span></div>
        ${edit("mdhsen")}`;
    }
    if (sub === "pr") {
      const src = (k) => p[k + "_mode"] === "entity" && p[k + "_sensor"] ? `Sensor ${esc(this._wzName(p[k + "_sensor"]))}${Number(p[k]) ? ` · Ersatzwert ${num(p[k], 2)} ct` : ""}` : "Festwert";
      return `${use("price")}${card(`<div class="sxrow stinfo hsr"><span class="sxi">${ic("total", 20)}</span><span class="sxt"><b>Bezugspreis${this._stHelpBtn("general.pv.price")}</b><small>${src("price")}</small></span><em class="hsv">${num(this._rate("price"), 2)} ct/kWh</em></div>
        <div class="sxrow stinfo hsr"><span class="sxi">${ic("sun", 20)}</span><span class="sxt"><b>Einspeisevergütung${this._stHelpBtn("general.pv.feed")}</b><small>${src("feed")}</small></span><em class="hsv">${num(this._rate("feed"), 2)} ct/kWh</em></div>
        ${s.on.dt ? row("chart", "Stundenpreise", "Börsenpreise und günstigste Fenster · Modul 14", "mdbeta") : ""}`)}
        ${edit("mdhspr")}`;
    }
    if (sub === "wx") {
      this._wxsLoad(); const W = this._wxs().cfg, wl = Object.keys(st).filter((k) => k.startsWith("weather.")), auto = (x) => x ? `automatisch: ${esc(this._wzName(x))}` : "keine gefunden";
      const wv = (id) => { const w = id && st[id]; return w ? `<em class="hsv">${esc((WX[w.state] || ["", w.state])[1])}${w.attributes.temperature != null ? " · " + num(w.attributes.temperature, 1) + " °C" : ""} ${ic("check", 12)}</em>` : ""; };
      return `${use("wx")}${card(`<div class="sxrow stinfo hsr"><span class="sxi">${ic("partly", 20)}</span><span class="sxt"><b>Wetter${this._stHelpBtn("layout.wx.entity")}</b><small>${L.entity ? esc(L.entity) : auto(wl[0])}</small></span>${wv(L.entity || wl[0])}</div>
        ${this._hsRow("thermo", "Außentemperatur", L.outdoor, "", false, "aus der Wetter-Entität")}
        ${this._hsRow("fan", "Wind", W.wind, "", false, "aus der Wetter-Entität")}
        <div class="sxrow stinfo hsr"><span class="sxi">${ic("shield", 20)}</span><span class="sxt"><b>Amtliche Warnungen</b><small>${!W.official.on ? "nicht verwenden" : W.official.ent ? esc(W.official.ent) : "automatisch (DWD, NINA)"}</small></span>${W.official.ent ? this._hsVal(W.official.ent) : ""}</div>`)}
        <div class="mut sm" style="margin:-4px 2px 12px">Die Anzeige im Dashboard (an oder aus) stellst du unter Darstellung ein, Grenzwerte und Aktionen in Modul 9.</div>
        ${edit("mdhswx")}`;
    }
    const pr = `${num(this._rate("price"), 1)} ct Bezug · ${num(this._rate("feed"), 1)} ct Einspeisung`;
    const wxt = L.entity ? this._wzName(L.entity) : "automatisch";
    return `${banner}${card(`${row("tools", "Räume", `${this._collect().length} Räume · Einrichtungsassistent`, "wz")}
        ${row("users", "Personen &amp; Standort", "Personen, iCloud-Standort und Home-Zone auf der Karte", "ortopen", "", this._ortChip())}
        ${row("nfc", "Tags &amp; Karten", "RFID-Karten und NFC-Sticker anlernen, auch für den Luftentfeuchter", "tgxopen")}`, "Bewohner und Räume")}
      ${card(`${row("sun", "Energiequellen", `Solar, Netz, Batterie, Ladestand · für ${this._hsUsed("energy")}`, "mdsts", "en", this._hsEnCheck()[0] === "ok" ? `<em class="sxc ok">OK</em>` : `<em class="sxc wa">${this._enConfigured() ? "Prüfen" : "Offen"}</em>`)}
        ${row("total", "Preise &amp; Tarif", `${pr}`, "mdsts", "pr", `<em class="sxc ok">${p.price_mode === "entity" && p.price_sensor ? "Sensor" : "Festwert"}</em>`)}
        ${row("partly", "Wetterquelle", `Wetter ${esc(wxt)}${L.outdoor ? " · Außensensor" : ""}`, "mdsts", "wx")}`, "Gemeinsame Werte")}
      <div class="stleg">${lv("all")} Alles hier gilt für alle Benutzer und Geräte. Jeder Wert steht nur hier, die Module lesen ihn von hier.</div>`;
  }
  /* Verweis an den alten Stellen: der Wert liegt jetzt im Haus */
  _hsLink(k, txt) {
    const t = { en: "Haus › Energiequellen", pr: "Haus › Preise &amp; Tarif", wx: "Haus › Wetterquelle" }[k];
    return `<button class="sxrow hslink" data-act="mdhsgo" data-k="${k}"><span class="sxi">${ic("home", 20)}</span><span class="sxt"><b>${t}</b><small>${txt} · gilt für alle Module</small></span><em class="stlv l1">🏠 Haus</em><span class="sxg">${ic("chev", 16)}</span></button>`;
  }
  _hsPrModal() {
    const pv = this._pv();
    const body = [["price", "Bezugspreis (Netzbezug)", "Festpreis", "Preis pro kWh aus dem Netz."], ["feed", "Einspeisevergütung", "Festvergütung", "Vergütung pro eingespeister kWh."]].map(([k, l, fl, h]) => { const ent = pv[k + "_mode"] === "entity", sn = pv[k + "_sensor"]; return `<div class="lsec">${ic(k === "price" ? "total" : "sun", 15)}${l}</div>
        <div class="seg">${[["fix", "Festwert"], ["entity", "Sensor"]].map(([m, t]) => `<button class="${(ent ? "entity" : "fix") === m ? "sel" : ""}" data-act="gpvpm" data-p="${k}" data-k="${m}">${t}</button>`).join("")}</div>
        ${ent ? `${this._wzSel(Object.keys(this._hass.states).filter((e) => e.startsWith("sensor.") && (this._hass.states[e].attributes.device_class === "monetary" || (/(kwh|wh)$/i.test(this._hass.states[e].attributes.unit_of_measurement || "") && /€|eur|ct|cent/i.test(this._hass.states[e].attributes.unit_of_measurement || "")) || e === sn)), sn, "gpvp", `data-p="${k}"`, "– keiner –", /preis|price|tarif|tibber|awattar|strom/i)}
        <div class="of"><div class="ol"><b>Ersatzwert</b><span>${sn ? `Aktuell ${num(this._rate(k), 2)} ct/kWh. Gilt, falls der Sensor ausfällt.` : "Gilt, solange kein Sensor gewählt ist."}</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="gpvn" data-k="${k}" value="${pv[k]}" min="0" max="100" step="0.01"><i>ct/kWh</i></span></div></div>` : `<div class="of"><div class="ol"><b>${fl}</b><span>${h}</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="gpvn" data-k="${k}" value="${pv[k]}" min="0" max="100" step="0.01"><i>ct/kWh</i></span></div></div>`}`; }).join("");
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Haus › Preise &amp; Tarif</b><span>Gilt für ${this._hsUsed("price")} · für alle</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      ${body}
      <div class="gst">${ic("info", 15)}<span>Sensor in ct/kWh oder €/kWh, zum Beispiel von Tibber. Wird sofort in allen Modulen verwendet.</span></div>
      <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _hsWxModal() {
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Haus › Wetterquelle</b><span>Gilt für ${this._hsUsed("wx")} · für alle</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      ${this._wxsAssign()}
      <div class="gst">${ic("info", 15)}<span>Weitere Dienste für Wetter und Warnungen findest du im <button class="lnk" data-act="wxsgoig">Store</button>.</span></div>
      <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _hsMigModal() {
    const m = (this._haus && this._haus.mig) || { items: [], conflicts: [] }, d = m.ts ? new Date(m.ts) : null;
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Übernahme ins Haus</b><span>${d && isFinite(d) ? d.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" }) : ""}${m.ver ? " · Version " + esc(m.ver) : ""}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="mut sm" style="margin:2px 0 6px">Beim ersten Start mit dieser Version wurden die gemeinsamen Werte einmalig an ihren alten Stellen gelesen und im Haus gespeichert. Es ging nichts verloren: Die Module finden ihre Werte weiter, und vorher wurde von allen betroffenen Bereichen eine Sicherungskopie angelegt (System → Sichern &amp; Wiederherstellen → Interne Kopien).</div>
      <div class="lsec">${ic("check", 15)}Übernommen</div>
      <ul class="news">${(m.items || []).map((t) => `<li>${ic("check", 16)}<span>${esc(t)}</span></li>`).join("") || `<li>${ic("info", 16)}<span>Es war noch nichts eingerichtet.</span></li>`}</ul>
      ${(m.conflicts || []).length ? `<div class="lsec">${ic("alert", 15)}Bitte prüfen</div>${m.conflicts.map((t) => `<div class="enchk warn"><span>${esc(t)}</span></div>`).join("")}<div class="gbtns"><button class="btn2" data-act="mdhsgoen">Energiequellen öffnen</button></div>` : ""}
      <div class="lsec">${ic("info", 15)}Wo stelle ich das jetzt ein?</div>
      <ul class="news"><li>${ic("sun", 16)}<span>Solar, Netz, Batterie, Ladestand: Einstellungen → Haus → Energiequellen (bisher Modul 3 und Modul 1 → PV-Überschuss)</span></li><li>${ic("total", 16)}<span>Bezugspreis und Einspeisevergütung: Haus → Preise &amp; Tarif (bisher Modul 1 → Allgemein)</span></li><li>${ic("partly", 16)}<span>Wetter, Außentemperatur, Wind, amtliche Warnungen: Haus → Wetterquelle (bisher Darstellung und Modul 9)</span></li></ul>
      <div class="foot2">${this._admin() && !m.seen ? `<button class="btn2" data-act="close">Später</button><button class="btn2 pri" data-act="mdhsseen">Verstanden</button>` : `<button class="btn2 pri" data-act="close">Fertig</button>`}</div></div>`;
  }
  /* ---------------- Personen & Standort: iCloud-Ortung, Personen-Einstellungen, Home-Zone auf der Karte ---------------- */
  _ort() {
    if (!this._ortS) {
      const h = this._hass, hz = h && h.states["zone.home"], hc = (h && h.config) || {};
      this._ortS = { zdef: { lat: Number(hz ? hz.attributes.latitude : hc.latitude) || 51.1657, lon: Number(hz ? hz.attributes.longitude : hc.longitude) || 10.4515, r: Math.round(Number(hz && hz.attributes.radius) || 150) }, draft: null, map: null };
    }
    const pr = this._cfg.presence || {};
    this._ortS.zone = pr.zone || this._ortS.zdef; this._ortS.per = pr.people || {}; this._ortS.own = !!pr.zone;
    return this._ortS;
  }
  _ortZone() { return this._ort().zone; }
  _ortDist(lat, lon) {
    const z = this._ortZone(), R = 6371000, rad = (x) => (x * Math.PI) / 180, dl = rad(lat - z.lat), dn = rad(lon - z.lon);
    const a = Math.sin(dl / 2) ** 2 + Math.cos(rad(z.lat)) * Math.cos(rad(lat)) * Math.sin(dn / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }
  _ortFmtD(m) { return m == null ? "–" : m < 1000 ? `${Math.round(m / 10) * 10} m` : `${num(m / 1000, m < 10000 ? 1 : 0)} km`; }
  _ortAgo(iso) { const t = iso ? new Date(iso).getTime() : NaN; if (!isFinite(t)) return ""; const m = Math.max(0, Math.round((Date.now() - t) / 60000)); return m < 1 ? "gerade eben" : m < 60 ? `vor ${m} Min.` : m < 1440 ? `vor ${Math.round(m / 60)} Std.` : `vor ${Math.round(m / 1440)} Tagen`; }
  _ortTracker(id) {
    const h = this._hass, s = h.states[id]; if (!s) return { id, name: id, missing: true };
    const a = s.attributes || {}, reg = (h.entities || {})[id], cloud = (reg && reg.platform === "icloud") || /icloud/i.test(id) || a.source_type === "gps" && /iphone|ipad|apple/i.test(String(a.friendly_name || id));
    const bat = a.battery_level ?? a.battery;
    return { id, name: a.friendly_name || id, state: s.state, icloud: !!cloud, bat: bat != null && isFinite(Number(bat)) ? Number(bat) : null, acc: a.gps_accuracy != null ? Number(a.gps_accuracy) : null, lat: a.latitude != null ? Number(a.latitude) : null, lon: a.longitude != null ? Number(a.longitude) : null, seen: this._ortAgo(s.last_updated || s.last_changed), ts: new Date(s.last_updated || s.last_changed || 0).getTime() || 0 };
  }
  _ortPersons() {
    const h = this._hass, st = h.states, o = this._ort(), COL = ["#14b8a6", "#6366f1", "#f59e0b", "#ec4899", "#22c55e", "#0ea5e9"];
    return Object.keys(st).filter((e) => e.startsWith("person.")).map((id, i) => {
      const s = st[id], a = s.attributes || {}, cfg = o.per[id] || {};
      const trackers = cfg.trackers ? cfg.trackers.slice() : [...new Set([...(a.device_trackers || []), ...(a.source ? [a.source] : [])])].filter((x) => x.startsWith("device_tracker."));
      const tr = trackers.map((t) => this._ortTracker(t)), acc = cfg.acc ?? 100;
      /* Eigene Quellen gewählt: nur diese zählen (wie im Backend). Die Personen-Entität kann über weitere Tracker oder eine alte Position noch „home“ melden. */
      const own = !!((cfg.trackers && cfg.trackers.length) || cfg.wifi);
      const live = tr.filter((x) => !x.missing && x.state !== "unknown" && x.state !== "unavailable");
      const good = live.filter((x) => x.lat != null && acc >= (x.acc ?? 0)).sort((x, y) => (y.ts || 0) - (x.ts || 0));
      const zin = (q) => o.own && q.lat != null && acc >= (q.acc ?? 0) && this._ortDist(q.lat, q.lon) <= o.zone.r;
      const wst = cfg.wifi ? (st[cfg.wifi] || {}).state : null, wifiHome = wst === "home" || wst === "on";
      let lat = null, lon = null;
      if (own) { if (good[0]) { lat = good[0].lat; lon = good[0].lon; } }
      else { lat = a.latitude != null ? Number(a.latitude) : null; lon = a.longitude != null ? Number(a.longitude) : null; if (lat == null && good[0]) { lat = good[0].lat; lon = good[0].lon; } }
      const dist = lat != null ? this._ortDist(lat, lon) : null;
      const home = own
        ? live.some((x) => x.state === "home" || zin(x)) || wifiHome
        : s.state === "home" || (o.own && dist != null && dist <= o.zone.r && (a.gps_accuracy == null || acc >= Number(a.gps_accuracy))) || live.some((x) => x.state === "home");
      const unavailable = own ? !live.length && !(wst && wst !== "unknown" && wst !== "unavailable") : s.state === "unavailable" || s.state === "unknown";
      return { id, name: cfg.label || a.friendly_name || id, state: own ? (home ? "home" : (good[0] || live[0] || {}).state || s.state) : s.state, col: COL[i % COL.length], tr, lat, lon, dist, home, count: cfg.count !== false, acc, wifi: cfg.wifi || "", noSrc: !tr.length && !cfg.wifi, unavailable };
    });
  }
  _ortChip() {
    const P = this._ortPersons(), n = P.filter((x) => !x.noSrc).length;
    return P.length ? `<em class="sxc ${n === P.length ? "ok" : ""}">${n} von ${P.length} mit Ortung</em>` : `<em class="sxc">Offen</em>`;
  }
  /* Karte: eigene Kachelberechnung (OpenStreetMap), ohne Zusatzbibliothek */
  _ortPx(lat, lon, z) { const n = 256 * 2 ** z, sn = Math.sin((lat * Math.PI) / 180); return [((lon + 180) / 360) * n, (0.5 - Math.log((1 + sn) / (1 - sn)) / (4 * Math.PI)) * n]; }
  _ortLL(x, y, z) { const n = 256 * 2 ** z, lon = (x / n) * 360 - 180, lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI; return [lat, lon]; }
  _ortMapInner(c, z, zone, dots, showZone = true) {
    const [cx, cy] = this._ortPx(c.lat, c.lon, z), n = 2 ** z, tx0 = Math.floor(cx / 256), ty0 = Math.floor(cy / 256);
    let t = "";
    for (let dy = -2; dy <= 2; dy++) for (let dx = -3; dx <= 3; dx++) {
      const tx = tx0 + dx, ty = ty0 + dy; if (ty < 0 || ty >= n) continue;
      const X = ((tx % n) + n) % n;
      t += `<img class="otile" alt="" draggable="false" src="https://tile.openstreetmap.org/${z}/${X}/${ty}.png" style="left:calc(50% + ${Math.round(tx * 256 - cx)}px);top:calc(50% + ${Math.round(ty * 256 - cy)}px)">`;
    }
    const mpp = (156543.03392 * Math.cos((c.lat * Math.PI) / 180)) / 2 ** z, rp = Math.max(6, zone.r / mpp);
    const d = dots.map((p) => { const [px, py] = this._ortPx(p.lat, p.lon, z); return `<div class="odot" style="left:calc(50% + ${Math.round(px - cx)}px);top:calc(50% + ${Math.round(py - cy)}px);background:${p.col}" title="${esc(p.name)}">${esc(p.name.slice(0, 1).toUpperCase())}</div>`; }).join("");
    return `<div class="otiles">${t}</div>${showZone ? `<div class="ozone" style="width:${rp * 2}px;height:${rp * 2}px;left:calc(50% + ${Math.round(this._ortPx(zone.lat, zone.lon, z)[0] - cx)}px);top:calc(50% + ${Math.round(this._ortPx(zone.lat, zone.lon, z)[1] - cy)}px)"></div>` : ""}${d}`;
  }
  _ortZoomFor(r) { const lat = this._ortZone().lat; for (let z = 18; z >= 12; z--) { if (r / ((156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** z) <= 70) return z; } return 12; }
  _ortRender() {
    const sr = this.shadowRoot, o = this._ort(), P = this._ortPersons(), z = o.zone, adm = this._admin();
    const withSrc = P.filter((x) => x.dist != null && x.lat != null), inZ = P.filter((x) => x.home).length;
    const cloud = P.flatMap((x) => x.tr).filter((x) => x.icloud), clouds = [...new Set(cloud.map((x) => x.id))].length;
    const pres = this._pres();
    const per = P.map((x) => {
      const t0 = x.tr[0], st = x.unavailable ? ["off", "Nicht erreichbar"] : x.home ? ["home", "Zu Hause"] : x.dist != null ? ["away", `Unterwegs · ${this._ortFmtD(x.dist)}`] : ["off", "Keine Ortung"];
      const src = x.tr.length ? x.tr.map((q) => `${q.icloud ? "iCloud" : "Gerät"}${q.bat != null ? ` · Akku ${Math.round(q.bat)} %` : ""}${q.seen ? ` · ${q.seen}` : ""}`).slice(0, 1).join("") : x.wifi ? "Nur WLAN-Erkennung" : "Noch keine Quelle gewählt";
      return `<div class="oper"><span class="oav" style="background:${x.col}">${esc(x.name.slice(0, 1).toUpperCase())}</span><div class="opi"><b>${esc(x.name)}</b><small>${esc(t0 ? t0.name + " · " : "")}${esc(src)}</small><small>${x.count ? "Zählt für automatisches Abwesend" : "Zählt nicht für automatisches Abwesend"}</small></div><span class="ost ${st[0]}">${esc(st[1])}</span><button class="ibtn" data-act="ortper" data-k="${esc(x.id)}" aria-label="${esc(x.name)} bearbeiten">${ic("pencil", 17)}</button></div>`;
    }).join("");
    sr.getElementById("main").innerHTML = `
      <div class="bar${this._narrow ? " nar" : ""}">${this._narrow ? `<button class="ib0" data-act="menu" aria-label="Menü">${ic("menu", 24)}</button>` : ""}
        <div class="brand"><img class="blogo" src="${LOGO_URL}" alt="MADDOG3010" draggable="false"><div><em class="pn">${esc(PRODUCT)}</em><b>Personen &amp; Standort</b><span><em class="tag">Wer ist zu Hause und wo ist das Zuhause</em>${this._verTag()}</span></div></div>
        <button class="pillbtn pri" data-act="ortback">${ic("check", 16)}<span class="bl">Fertig</span></button></div>
      <div class="wrap"><div class="sxw">
        <div class="card ocard"><h2>${ic("pin", 18)}Standort-Quelle</h2>
          <div class="oper" style="padding-top:0"><span class="oav" style="background:#64748b">${ic("cloud", 22)}</span><div class="opi"><b>Apple iCloud (Wo ist?)</b><small>${clouds ? `${clouds} iCloud-Gerät${clouds > 1 ? "e" : ""} gefunden. Der Standort kommt von der Home-Assistant-Integration „Apple iCloud“.` : "Noch kein iCloud-Gerät gefunden. Richte zuerst die Home-Assistant-Integration „Apple iCloud“ ein."}</small></div><span class="ost ${clouds ? "home" : "off"}">${clouds ? "Verbunden" : "Nicht eingerichtet"}</span></div>
          <details class="ohint"><summary>iPhone: Das muss stimmen</summary><ol>
            <li><b>Wo ist? und Standortdienste an.</b> Auf dem iPhone: Einstellungen → Apple-Account → Wo ist? → „Mein iPhone suchen“ an. Dazu Datenschutz &amp; Sicherheit → Ortungsdienste an.</li>
            <li><b>Zwei-Faktor-Anmeldung.</b> Home Assistant fragt beim Einrichten einen sechsstelligen Code ab, der auf einem vertrauenswürdigen Apple-Gerät erscheint. Apple beendet die Sitzung gelegentlich, dann musst du dich in Home Assistant erneut anmelden.</li>
            <li><b>Jede Person mit eigener Apple-ID</b> bekommt in Home Assistant einen eigenen Eintrag „Apple iCloud“. Die Geräte stammen aus dem jeweils angemeldeten Konto.</li>
            <li><b>Die Aktualisierung ist nicht sekundengenau.</b> Die Integration fragt in einem wechselnden Takt ab, abhängig von Zone, Entfernung und Akkustand. Der Stromsparmodus des iPhones kann Standortmeldungen zusätzlich verzögern.</li>
            <li><b>Zusätzlich das WLAN nutzen.</b> Als zweite Quelle bei der Person ist ein Router- oder Ping-Gerät sehr zuverlässig, wenn das Handy im Haus ist. Die Person gilt als zu Hause, sobald eine Quelle „zu Hause“ meldet.</li>
            <li><b>Datenschutz.</b> „Strom &amp; Wärme“ nutzt nur „zu Hause“ oder „unterwegs“ und die Entfernung zur Home-Zone. Es wird kein Standortverlauf gespeichert.</li></ol></details></div>
        <div class="card ocard"><h2>${ic("home", 18)}Home-Zone</h2>
          <div class="omap sm" id="omap-main">${this._ortMapInner(z, this._ortZoomFor(Math.max(z.r, ...withSrc.map((x) => Math.min(x.dist, 2000)).concat([0])) * 0.9 || z.r), z, withSrc)}<div class="opin">${ic("pin", 34)}</div><span class="oatt">© OpenStreetMap-Mitwirkende</span></div>
          <div class="ocoord"><span>Radius <b>${z.r} m</b></span><span>Breite <b>${num(z.lat, 5)}</b></span><span>Länge <b>${num(z.lon, 5)}</b></span><span>In der Zone <b>${inZ} von ${P.length}</b></span></div>
          <div class="mut sm" style="margin:8px 0 0">Die Zone gilt für „Anwesenheit &amp; Urlaub“ und für die automatische Erkennung. Eine Person zählt als zu Hause, wenn ihr Standort in der Zone liegt oder Home Assistant „zu Hause“ meldet.${o.own ? "" : " Noch keine eigene Zone festgelegt: Es gilt vorerst die Zone von Home Assistant."}</div>
          ${adm ? `<div class="plnk"><button class="lnk" data-act="ortzone">${ic("pencil", 16)}Home-Zone auf der Karte festlegen</button></div>` : ""}</div>
        <div class="card ocard"><h2>${ic("users", 18)}Personen im Haushalt</h2>${per || `<div class="mut">Keine Personen gefunden. Lege sie in Home Assistant unter Einstellungen → Personen an.</div>`}
          <div class="mut sm" style="margin-top:8px">${pres.auto ? `Der Haushalt wird abwesend, wenn alle zählenden Personen ${pres.away_after} Min. nicht zu Hause sind.` : "Die automatische Erkennung ist aus (Anwesenheit &amp; Urlaub → Einstellungen)."}</div></div>
      </div></div>`;
  }
  _ortPerModal() {
    const d = this._ort().draft, h = this._hass, p = this._ortPersons().find((x) => x.id === d.id) || { name: d.id }, all = Object.keys(h.states).filter((e) => e.startsWith("device_tracker.")).filter((e) => !d.trackers.includes(e)).sort((a, b) => Number(this._ortTracker(b).icloud) - Number(this._ortTracker(a).icloud));
    const wifi = Object.keys(h.states).filter((e) => e.startsWith("device_tracker.") || e.startsWith("binary_sensor.")).sort();
    const tr = d.trackers.map((id) => { const q = this._ortTracker(id); return `<div class="otr"><span class="oav" style="width:36px;height:36px;background:#64748b">${ic("user", 18)}</span><div class="opi"><b>${esc(q.name)} ${q.icloud ? `<span class="ocp">iCloud</span>` : ""}</b><small>${q.missing ? "Entität nicht gefunden" : [q.state === "home" ? "Zu Hause" : q.state === "not_home" ? "Unterwegs" : q.state, q.bat != null ? `Akku ${Math.round(q.bat)} %` : "", q.acc != null ? `Genauigkeit ${Math.round(q.acc)} m` : "", q.seen].filter(Boolean).join(" · ")}</small></div><button class="ibtn" data-act="ortrm" data-k="${esc(id)}" aria-label="Quelle entfernen">${ic("trash", 17)}</button></div>`; }).join("");
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>${esc(p.name)}</b><span>${esc(d.id)}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("user", 15)}Name</div>
      <input class="osel" type="text" data-f="ortlabel" maxlength="30" value="${esc(d.label)}" placeholder="${esc((h.states[d.id].attributes || {}).friendly_name || d.id)}">
      <div class="lsec">${ic("pin", 15)}Standortquellen</div>
      ${tr || `<div class="mut sm">Noch keine Quelle. Wähle das iPhone aus der Liste.</div>`}
      <select class="osel" data-f="ortadd" aria-label="Gerät hinzufügen"><option value="">+ Gerät hinzufügen …</option>${all.map((e) => { const q = this._ortTracker(e); return `<option value="${esc(e)}">${q.icloud ? "iCloud · " : ""}${esc(q.name)} (${esc(e)})</option>`; }).join("")}</select>
      <div class="mut sm">iCloud-Geräte stehen oben. Mehrere Quellen: Die Person ist zu Hause, sobald eine davon „zu Hause“ meldet.</div>
      <div class="lsec">${ic("shield", 15)}WLAN- oder Router-Erkennung (optional)</div>
      <select class="osel" data-f="ortwifi" aria-label="WLAN-Erkennung"><option value="">Keine</option>${wifi.map((e) => `<option value="${esc(e)}" ${d.wifi === e ? "selected" : ""}>${esc((h.states[e].attributes || {}).friendly_name || e)} (${esc(e)})</option>`).join("")}</select>
      <div class="lsec">${ic("sliders", 15)}Regeln</div>
      <div class="vrow"><span>Zählt für automatisches Abwesend</span><button class="sw ${d.count ? "on" : ""}" data-act="ortcount" aria-pressed="${d.count}" aria-label="Zählt für Abwesenheit"></button></div>
      <div class="vrow"><span>Ungenaue Standorte ignorieren ab</span><div class="step"><button data-act="ortacc" data-k="-50" aria-label="weniger">${ic("minus", 18)}</button><b>${d.acc} m</b><button data-act="ortacc" data-k="50" aria-label="mehr">${ic("plus", 18)}</button></div></div>
      <div class="mut sm">Meldet das iPhone eine schlechtere Genauigkeit, wird die Position nicht für die Home-Zone benutzt.</div>
      <div class="foot2" style="margin-top:14px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="ortpsave">Speichern</button></div></div>`;
  }
  _ortZoneModal() {
    const o = this._ort(), m = o.map, P = this._ortPersons().filter((x) => x.lat != null), h = this._hass, hc = h.config || {};
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Home-Zone</b><span>Karte verschieben, der Pin zeigt dein Zuhause</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="omap" id="omap-edit">${this._ortMapInner(m, m.z, { lat: m.lat, lon: m.lon, r: m.r }, P)}<div class="opin">${ic("pin", 34)}</div><div class="ozb"><button data-act="ortz" data-k="1" aria-label="Vergrößern">+</button><button data-act="ortz" data-k="-1" aria-label="Verkleinern">−</button></div><span class="oatt">© OpenStreetMap-Mitwirkende</span></div>
      <div class="ocoord"><span>Breite <b id="olat">${num(m.lat, 5)}</b></span><span>Länge <b id="olon">${num(m.lon, 5)}</b></span></div>
      <div class="vrow" style="margin-top:8px"><span>Radius</span><b id="orv">${m.r} m</b></div>
      <input class="orng" type="range" min="30" max="1000" step="10" value="${m.r}" data-f="ortr" aria-label="Radius der Home-Zone">
      <div class="plnk"><button class="lnk" data-act="ortha">${ic("home", 16)}Standort von Home Assistant übernehmen</button><button class="lnk" data-act="ortme">${ic("pin", 16)}Position einer Person übernehmen</button></div>
      <div class="mut sm" style="margin:6px 0 0">Tipp: Ein Radius von 100 bis 200 m ist für iCloud sinnvoll, weil die Position des iPhones einige Meter abweichen kann. Zu klein, und die Person gilt am Gartentor schon als unterwegs.${hc.latitude ? "" : ""}</div>
      <div class="foot2" style="margin-top:14px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="ortzsave">Zone speichern</button></div></div>`;
  }
  _ortBind() {
    const box = this.shadowRoot.getElementById("modal"), el = box && box.querySelector("#omap-edit"); if (!el || el._ob) return; el._ob = true;
    let drag = null, raf = 0;
    const redraw = () => { raf = 0; const o = this._ort(), m = o.map; const inner = el.querySelector(".otiles"); const html = this._ortMapInner(m, m.z, { lat: m.lat, lon: m.lon, r: m.r }, this._ortPersons().filter((x) => x.lat != null)); const tmp = document.createElement("div"); tmp.innerHTML = html; el.querySelectorAll(".otiles,.ozone,.odot").forEach((n) => n.remove()); [...tmp.children].reverse().forEach((n) => el.insertBefore(n, el.firstChild)); const la = box.querySelector("#olat"), lo = box.querySelector("#olon"); if (la) la.textContent = num(m.lat, 5); if (lo) lo.textContent = num(m.lon, 5); };
    el.addEventListener("pointerdown", (e) => { if (e.target.closest(".ozb")) return; drag = { x: e.clientX, y: e.clientY }; try { el.setPointerCapture(e.pointerId); } catch (_) {} });
    el.addEventListener("pointermove", (e) => { if (!drag) return; const m = this._ort().map, [cx, cy] = this._ortPx(m.lat, m.lon, m.z), [la, lo] = this._ortLL(cx - (e.clientX - drag.x), cy - (e.clientY - drag.y), m.z); drag = { x: e.clientX, y: e.clientY }; m.lat = Math.max(-80, Math.min(80, la)); m.lon = lo; if (!raf) raf = requestAnimationFrame(redraw); });
    const rg = box.querySelector("[data-f=ortr]"); if (rg) rg.addEventListener("input", () => { const m = this._ort().map; m.r = Number(rg.value); const v = box.querySelector("#orv"); if (v) v.textContent = `${m.r} m`; if (!raf) raf = requestAnimationFrame(redraw); });
    const end = () => { drag = null; }; el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
    el.addEventListener("wheel", (e) => { e.preventDefault(); this._ortAct("ortz", { dataset: { k: e.deltaY < 0 ? "1" : "-1" } }); }, { passive: false });
  }
  _ortAct(a, b) {
    const o = this._ort(), k = b.dataset ? b.dataset.k : "";
    if (a === "ortopen") { this._ortOpen = true; this._render(); }
    else if (a === "ortback") { this._ortOpen = false; this._render(); }
    else if (a === "ortper") { const x = this._ortPersons().find((q) => q.id === k); if (!x) return; o.draft = { id: k, label: (o.per[k] || {}).label || "", trackers: x.tr.map((q) => q.id), wifi: x.wifi, count: x.count, acc: x.acc }; this._modal = { type: "ortper" }; this._renderModal(); }
    else if (a === "ortrm") { o.draft.trackers = o.draft.trackers.filter((e) => e !== k); this._renderModal(); }
    else if (a === "ortcount") { o.draft.count = !o.draft.count; this._renderModal(); }
    else if (a === "ortacc") { o.draft.acc = Math.max(20, Math.min(500, o.draft.acc + Number(k))); this._renderModal(); }
    else if (a === "ortpsave") { const d = o.draft; if (!this._presSend({ keep_mode: true, people: { ...((this._cfg.presence || {}).people || {}), ...o.per, [d.id]: { label: d.label.trim(), trackers: d.trackers, wifi: d.wifi, count: d.count, acc: d.acc } } })) return; this._modal = null; this._renderModal(); this._render(); this._toast("Person gespeichert"); }
    else if (a === "ortzone") { const z = o.zone; o.map = { lat: z.lat, lon: z.lon, r: z.r, z: this._ortZoomFor(z.r) }; this._modal = { type: "ortzone" }; this._renderModal(); }
    else if (a === "ortz") { const m = o.map; m.z = Math.max(5, Math.min(19, m.z + Number(k))); this._renderModal(); }
    else if (a === "ortha") { const hz = this._hass.states["zone.home"], hc = this._hass.config || {}; const la = Number(hz ? hz.attributes.latitude : hc.latitude), lo = Number(hz ? hz.attributes.longitude : hc.longitude); if (isFinite(la) && isFinite(lo)) { o.map.lat = la; o.map.lon = lo; this._renderModal(); } }
    else if (a === "ortme") { const x = this._ortPersons().find((q) => q.lat != null); if (x) { o.map.lat = x.lat; o.map.lon = x.lon; this._renderModal(); this._toast(`Position von ${x.name} übernommen`); } else this._toast("Keine Position verfügbar"); }
    else if (a === "ortzsave") { const m = o.map; if (!this._presSend({ keep_mode: true, zone: { lat: Math.round(m.lat * 1e6) / 1e6, lon: Math.round(m.lon * 1e6) / 1e6, r: m.r } })) return; this._modal = null; this._renderModal(); this._render(); this._toast("Home-Zone gespeichert"); }
  }
  _ortChange(t) {
    const o = this._ort(), f = t.dataset.f;
    if (f === "ortlabel") { o.draft.label = t.value; return true; }
    if (f === "ortadd") { if (t.value && !o.draft.trackers.includes(t.value)) { o.draft.trackers.push(t.value); this._renderModal(); } return true; }
    if (f === "ortwifi") { o.draft.wifi = t.value; return true; }
    if (f === "ortr") { o.map.r = Number(t.value); return true; }
    return false;
  }
  /* Integrationen: Wallbox (go-e Charger) direkt über die lokale HTTP-API verbinden. Die Daten liegen im Backend (wb_get, wb_set, wb_test). */
