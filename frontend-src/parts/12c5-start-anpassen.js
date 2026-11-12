  /* ================= Startseite · Neue Optik Stufe 4 (Konzept_Startseite_Neue-Optik, Teil E, G und W) =================
     G · Bewegung Aus / Dezent / Voll (Standard Dezent, im Tablet-Modus eigene Stufe, Standard Aus). „Bewegung reduzieren“ des Systems gilt immer.
         Dezent: Warnpunkt pulsiert, Kernzahl zählt weich nach, Ring der Bubbles füllt sich, Zustandswechsel blendet über.
         Voll: zusätzlich Wolken, Regen, Schnee, Rauch und Glanz der PV-Module in der Haus-Szene.
     W4 · Vorlagen Familie, Technik, Minimal (mit Rückgängig). E2 · Kacheln wählen und sortieren.
     E3 · Schnellaktionen: feste Aktionen wie bei Tags & Karten als Knöpfe; ab Werk aus; die Liste wählt der Admin (Backend prüft sie),
         Aktionen, die das ganze Haus oder die Sicherheit betreffen, werden immer bestätigt. Langes Drücken auf eine Kachel zeigt die Aktionen des Moduls.
     W1 · Leerzustand mit „Modul hinzufügen“.
     Einstellungen in layout.start: anim, tanim, tiles = { order, hidden }, qa (Schnellaktionen an). */
  _hzAnim() { const l = (this._cfg.layout.start || {}), A = ["aus", "dezent", "voll"], tm = !!(this._tmOn && this._tmOn()); return tm ? (A.includes(l.tanim) ? l.tanim : "aus") : A.includes(l.anim) ? l.anim : "dezent"; }
  _hzAnimCfg() { const l = (this._cfg.layout.start || {}), A = ["aus", "dezent", "voll"]; return { anim: A.includes(l.anim) ? l.anim : "dezent", tanim: A.includes(l.tanim) ? l.tanim : "aus" }; }
  _hzWrap(html) { return `<div class="hzpg" data-hzan="${this._hzAnim()}">${html}</div>`; }
  /* Nach dem Zeichnen: geänderte Zahlen weich nachzählen, geänderte Ringe neu füllen. Beim ersten Öffnen einmal alles. */
  _hzAnimRun() {
    const sr = this.shadowRoot, pg = sr && sr.querySelector(".hzpg"); if (!pg) { this._hzAV = null; return; }
    const an = pg.dataset.hzan, red = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches, first = !this._hzAV, M = this._hzAV || (this._hzAV = {});
    pg.querySelectorAll("[data-hzn]").forEach((el) => {
      const k = el.dataset.hzn, txt = el.firstChild && el.firstChild.nodeType === 3 ? el.firstChild.nodeValue : "", v = parseFloat(String(txt).replace(/\./g, "").replace(",", ".")), old = M[k];
      M[k] = v; if (an === "aus" || red || !isFinite(v) || first || old == null || old === v || !isFinite(old)) return;
      const dec = (String(txt).split(",")[1] || "").length, t0 = performance.now(), node = el.firstChild;
      const step = (t) => { const f = Math.min(1, (t - t0) / 700), e = 1 - Math.pow(1 - f, 3); node.nodeValue = num(old + (v - old) * e, dec); if (f < 1 && node.isConnected) requestAnimationFrame(step); else node.nodeValue = txt; };
      requestAnimationFrame(step);
    });
    pg.querySelectorAll("[data-hzr]").forEach((el) => {
      const k = "r:" + el.dataset.hzr, v = el.getAttribute("stroke-dasharray"), old = M[k]; M[k] = v;
      if (an === "aus" || red || (!first && old === v)) return;
      el.classList.remove("hzfill"); void el.getBoundingClientRect(); el.classList.add("hzfill");
    });
  }
  /* ---------- E2 · Kacheln wählen ---------- */
  _hzTiles() { const t = (this._cfg.layout.start || {}).tiles || {}; return { order: Array.isArray(t.order) ? t.order : [], hidden: Array.isArray(t.hidden) ? t.hidden : [] }; }
  _hzMods(all) {
    const T = this._hzTiles(), L = this._mdList().filter((m) => m.id !== "st"), o = T.order;
    const s = L.slice().sort((a, b) => { const i = o.indexOf(a.id), j = o.indexOf(b.id); return (i < 0 ? 999 + L.indexOf(a) : i) - (j < 0 ? 999 + L.indexOf(b) : j); });
    return all ? s : s.filter((m) => !T.hidden.includes(m.id));
  }
  _hzEmpty() {
    const adm = this._admin();
    return `<div class="hzemp">${this._gx("house", 64)}<div><b>Noch kein Modul aktiv</b><small>${this._mdList().some((m) => m.id !== "st") ? "Alle Kacheln sind ausgeblendet. Unter Startseite → Kacheln wählen holst du sie zurück." : "Schalte in den Einstellungen ein Modul ein, dann erscheint hier seine Kachel."}</small></div>${adm ? `<button class="btn2 pri" data-act="${this._mdList().some((m) => m.id !== "st") ? "hztiles" : "mdsta"}" data-k="md">${ic("plus", 16)} ${this._mdList().some((m) => m.id !== "st") ? "Kacheln wählen" : "Modul hinzufügen"}</button>` : ""}</div>`;
  }
  /* ---------- W4 · Vorlagen ---------- */
  static HZ_PRESETS = {
    familie: { n: "Familie", d: "Haus-Szene, Personen, Wetter und Müll oben, Energie ausgeblendet", i: "people", p: { head: "scene", ksize: "m", order: ["zuhause", "hinweise", "personen", "wetter", "muell", "alarm", "energie"], hidden: ["energie"], bub: ["wetter", "personen", "fenster", "muell", "hinweise"] } },
    technik: { n: "Technik", d: "Ampel-Zeile, große Kacheln mit Verlauf, Energie gleich nach den Kacheln", i: "meter", p: { head: "text", ksize: "l", order: ["zuhause", "energie", "hinweise", "wetter", "alarm", "personen", "muell"], hidden: [], bub: ["solar", "batterie", "preis", "auto", "warmwasser", "fenster"] } },
    minimal: { n: "Minimal", d: "Nur Ampel, kleine Kacheln und Hinweise", i: "shield", p: { head: "text", ksize: "s", order: ["zuhause", "hinweise", "wetter", "personen", "alarm", "energie", "muell"], hidden: ["wetter", "personen", "alarm", "energie", "muell"], bub: ["wetter", "hinweise"] } },
  };
  _hzPreset(k) {
    const P = this.constructor.HZ_PRESETS[k]; if (!P) return;
    const raw = this._cfg.layout.start || {}; this._hzUndo = JSON.parse(JSON.stringify(raw)); this._hzUndoN = P.n;
    const c = this._hzCfg();
    this._hzSave({ head: P.p.head, ksize: P.p.ksize, order: P.p.order, hidden: P.p.hidden, bub: { ...c.bub, ids: P.p.bub }, preset: k });
    this._toast(`Vorlage „${P.n}“ übernommen`);
  }
  /* ---------- E3 · Schnellaktionen ---------- */
  _hzQaOn() { return this._hzNew() && (this._cfg.layout.start || {}).qa === true; }
  _hzQa() { this._tgxLoad(); const D = this._tgxD; return D && D.cfg && Array.isArray(D.cfg.quick) ? D.cfg.quick : []; }
  _hzQaName(q) { return q.name || (this._tgxD ? this._tgxDesc(q.act) : q.act.k); }
  _hzQaGroup(q) { const D = this._tgxD, a = D && D.actions.find((x) => x.k === q.act.k); return a ? a.g : ""; }
  _hzQaRow(tm) {
    if (!this._hzQaOn()) return ""; const Q = this._hzQa(); if (!Q.length) return this._admin() ? `<div class="hzqa"><button class="hzqb add" data-act="hzqaset">${ic("plus", 16)}<span>Schnellaktionen wählen</span></button></div>` : "";
    return `<div class="hzqa${tm ? " tm" : ""}" role="toolbar" aria-label="Schnellaktionen">${Q.map((q, i) => `<button class="hzqb" data-act="hzqa" data-k="${i}">${ic(this._tgxIcon(q.act), tm ? 22 : 16)}<span>${esc(this._hzQaName(q))}</span></button>`).join("")}</div>`;
  }
  _hzQaRun(i) {
    const Q = this._hzQa(), q = Q[i]; if (!q) return;
    const need = (this._tgxD.confirm || []).includes(q.act.k);
    if (need) { this._modal = { type: "hzqaok", i }; this._renderModal(); return; }
    this._hzQaDo(i);
  }
  _hzQaDo(i) {
    this._hass.callWS({ type: "fenster_heizung/tg_quick", idx: Number(i) }).then((r) => { this._tgxD = r; this._tgxTs = Date.now(); const x = r.quick_res || {}; this._toast(x.msg || (x.ok ? "Ausgeführt" : "Das hat nicht geklappt")); this._render(); })
      .catch(() => this._toast("Das hat nicht geklappt"));
  }
  /* Auswahl für die Schnellaktionen: feste Aktionen ohne Zusatz, Urlaub 7 Tage, Melder alle, je Tonne und je Entfeuchter */
  _hzQaOptions() {
    const D = this._tgxD; if (!D) return [];
    const out = [];
    D.actions.forEach((a) => {
      if (this._tgxNeed(a.k)) return;
      if (!a.arg) out.push({ act: { k: a.k, arg: null }, g: a.g, gn: a.gn });
      else if (a.arg === "days") out.push({ act: { k: a.k, arg: 7 }, g: a.g, gn: a.gn });
      else if (a.arg === "det") out.push({ act: { k: a.k, arg: "" }, g: a.g, gn: a.gn });
      else if (a.arg === "bin") Object.keys(D.bins || {}).forEach((b) => out.push({ act: { k: a.k, arg: b }, g: a.g, gn: a.gn }));
      else if (a.arg === "lfdev") this._lfDevs().forEach((d) => out.push({ act: { k: a.k, arg: d.id }, g: a.g, gn: a.gn }));
    });
    return out;
  }
  _hzQaKey(act) { return `${act.k}|${act.arg == null ? "" : act.arg}`; }
  _hzQaModal() {
    const m = this._modal, adm = this._admin();
    if (m.type === "hzqaok") {
      const q = this._hzQa()[m.i]; if (!q) return "";
      return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>${esc(this._hzQaName(q))}?</b><span>Schnellaktion · wirkt sofort</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="gst on">${ic("alert", 15)}<span>Das schaltet echte Geräte oder ändert die Regelung im ganzen Haus.</span></div>
        <div class="gbtns" style="margin-top:12px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="hzqago" data-k="${m.i}">${ic("check", 16)} Ausführen</button></div></div>`;
    }
    if (m.type === "hzqm") {
      const mod = this._mdList().find((x) => x.id === m.k) || {}, G = { fh: ["fh", "lf", "pe"], ww: ["ww"], ev: ["ev"], sf: ["sf"], mu: ["mu"], li: ["li"] }[m.k] || [];
      const Q = this._hzQa().map((q, i) => ({ q, i })).filter((x) => G.includes(this._hzQaGroup(x.q)));
      return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>${esc(mod.name || "")}</b><span>Schnellaktionen</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        ${Q.map(({ q, i }) => `<button class="hzlo" data-act="hzqa" data-k="${i}">${ic(this._tgxIcon(q.act), 18)}<b>${esc(this._hzQaName(q))}</b>${(this._tgxD.confirm || []).includes(q.act.k) ? "<small>mit Bestätigung</small>" : ""}</button>`).join("")}
        <button class="hzlo" data-act="hzgo" data-k="${esc(m.k)}">${ic("chev", 16)}<b>Modul öffnen</b></button></div>`;
    }
    /* hzqaset: Auswahl (Admin) */
    const D = this._tgxD; if (!D) { this._tgxLoad(true); return `<div class="ov" data-act="close"></div><div class="sheet"><div class="mut sm">Lade Aktionen …</div></div>`; }
    const sel = this._hzQa(), keys = sel.map((q) => this._hzQaKey(q.act)), opts = this._hzQaOptions(), groups = [...new Set(opts.map((o) => o.gn))];
    const row = (o) => { const on = keys.includes(this._hzQaKey(o.act)); return `<div class="hzo ${on ? "on" : ""}"><button class="hzck ${on ? "on" : ""}" data-act="hzqat" data-k="${esc(JSON.stringify(o.act))}" aria-pressed="${on}" ${adm ? "" : "disabled"}>${on ? ic("check", 14) : ""}</button><span class="hzoi">${ic(this._tgxIcon(o.act), 18)}</span><span class="hzot"><b>${esc(this._tgxDesc(o.act))}</b>${(D.confirm || []).includes(o.act.k) ? "<small>wird immer bestätigt</small>" : ""}</span></div>`; };
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true"><div class="sh"><div><b>Schnellaktionen wählen</b><span>Bis zu 8 · gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="mut sm" style="margin:0 0 8px">Dieselben festen Aktionen wie bei Tags & Karten. ${sel.length} gewählt. Nur diese Liste kann auf der Startseite ausgelöst werden, auch von Nutzern ohne Admin-Rechte.</div>
      ${groups.map((g) => `<div class="lsec">${esc(g)}</div>${opts.filter((o) => o.gn === g).map(row).join("")}`).join("")}
      <div class="gbtns" style="margin-top:10px"><button class="btn2 pri" data-act="hzback">${ic("check", 16)} Fertig</button></div></div>`;
  }
  _hzQaToggle(actJson) {
    let act; try { act = JSON.parse(actJson); } catch (_) { return; }
    const cur = this._hzQa().map((q) => ({ name: q.name || "", act: q.act })), k = this._hzQaKey(act), i = cur.findIndex((q) => this._hzQaKey(q.act) === k);
    if (i >= 0) cur.splice(i, 1); else if (cur.length >= 8) { this._toast("Mehr als 8 Schnellaktionen sind nicht möglich"); return; } else cur.push({ name: "", act });
    this._hass.callWS({ type: "fenster_heizung/tg_quick_set", quick: cur }).then((r) => { this._tgxD = r; this._tgxTs = Date.now(); this._renderModal(); this._render(); }).catch(() => this._toast("Das hat nicht geklappt"));
  }
  /* ---------- Einstellungen ---------- */
  _hzTilesModal() {
    const adm = this._admin(), T = this._hzTiles(), all = this._hzMods(true), vis = all.filter((m) => !T.hidden.includes(m.id));
    const row = (m) => { const on = !T.hidden.includes(m.id), i = vis.indexOf(m); return `<div class="hzo ${on ? "on" : ""}"><button class="hzck ${on ? "on" : ""}" data-act="hztt" data-k="${m.id}" aria-pressed="${on}" aria-label="${esc(m.short)}" ${adm ? "" : "disabled"}>${on ? ic("check", 14) : ""}</button><span class="hzoi">${this._hzHdFor(m) ? this._gx(this._hzHdFor(m), 24) : ic(m.icon, 18)}</span><span class="hzot"><b>${esc(m.short)}</b><small>${m.n ? `Modul ${m.n}` : m.addon ? "Addon" : ""}</small></span>${on && adm ? `<button class="ibtn" data-act="hztm" data-d="up" data-k="${m.id}" aria-label="Nach vorn" ${i === 0 ? "disabled" : ""}>${ic("up", 16)}</button><button class="ibtn dn" data-act="hztm" data-d="down" data-k="${m.id}" aria-label="Nach hinten" ${i === vis.length - 1 ? "disabled" : ""}>${ic("up", 16)}</button>` : ""}</div>`; };
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true"><div class="sh"><div><b>Kacheln wählen</b><span>Startseite und Tablet · gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="mut sm" style="margin:0 0 8px">Haken blendet die Kachel ein oder aus, die Pfeile ändern die Reihenfolge. Das Modul selbst bleibt eingeschaltet.</div>
      ${vis.map(row).join("")}${all.filter((m) => T.hidden.includes(m.id)).map(row).join("")}
      <div class="gbtns" style="margin-top:10px"><button class="btn2" data-act="hztreset">Reihenfolge zurücksetzen</button><button class="btn2 pri" data-act="hzback">${ic("check", 16)} Fertig</button></div></div>`;
  }
  _hzLook4(chip) {
    const A = this._hzAnimCfg(), P = this.constructor.HZ_PRESETS, cur = (this._cfg.layout.start || {}).preset || "", qa = (this._cfg.layout.start || {}).qa === true, adm = this._admin();
    const lv = [["aus", "Aus"], ["dezent", "Dezent"], ["voll", "Voll"]];
    return `<div class="vrow"><span>Bewegung<small class="mut" style="display:block">Dezent: Warnpunkt pulsiert, Zahlen zählen weich nach, Ringe füllen sich. Voll: dazu Wolken, Regen, Schnee und Glanz in der Haus-Szene. „Bewegung reduzieren“ des Geräts gilt immer.</small></span><span class="gschs" style="flex-wrap:nowrap;flex:none">${lv.map(([k, t]) => chip("hzanim", k, t, A.anim === k)).join("")}</span></div>
      <div class="vrow"><span>Bewegung im Tablet-Modus<small class="mut" style="display:block">Ab Werk aus, schont das Fire-Tablet.</small></span><span class="gschs" style="flex-wrap:nowrap;flex:none">${lv.map(([k, t]) => chip("hztanim", k, t, A.tanim === k)).join("")}</span></div>
      <div class="gbtns" style="margin-top:6px"><button class="btn2" data-act="hztiles" ${adm ? "" : "disabled"}>${ic("layers", 16)} Kacheln wählen</button></div>
      <div class="lsec" style="margin-top:12px">${ic("layers", 15)}Vorlagen</div>
      <div class="hzpre">${Object.entries(P).map(([k, x]) => `<button class="hzpc ${cur === k ? "sel" : ""}" data-act="hzpreset" data-k="${k}" ${adm ? "" : "disabled"}>${this._gx(x.i, 34)}<b>${x.n}</b><small>${x.d}</small></button>`).join("")}</div>
      ${this._hzUndo ? `<div class="gst">${ic("info", 15)}<span>Vorlage „${esc(this._hzUndoN || "")}“ übernommen.</span><button class="lnk" data-act="hzundo">Rückgängig</button></div>` : ""}
      <div class="lsec" style="margin-top:12px">${ic("bolt", 15)}Schnellaktionen</div>
      <div class="vrow"><span>Schnellaktionen zeigen<small class="mut" style="display:block">Knöpfe mit festen Aktionen wie bei Tags & Karten (Abwesend, Warmwasser aufheizen, Wallbox, Melder geprüft …). Ab Werk aus. Langes Drücken auf eine Kachel zeigt die Aktionen des Moduls.</small></span><button class="sw ${qa ? "on" : ""}" data-act="hzqasw" aria-pressed="${qa}" aria-label="Schnellaktionen zeigen" ${adm ? "" : "disabled"}></button></div>
      ${qa ? `<div class="gbtns"><button class="btn2" data-act="hzqaset" ${adm ? "" : "disabled"}>${ic("sliders", 16)} Aktionen wählen (${this._hzQa().length})</button></div>` : ""}`;
  }
  _hzAct4(a, b) {
    const k = b.dataset.k;
    if (a === "hzanim" || a === "hztanim") { this._hzSave({ [a === "hzanim" ? "anim" : "tanim"]: ["aus", "dezent", "voll"].includes(k) ? k : "dezent" }); return true; }
    if (a === "hzpreset") { this._hzPreset(k); return true; }
    if (a === "hzundo") { if (this._hzUndo) { this._cfg.layout.start = this._hzUndo; this._hzUndo = null; this._saveLayout(); this._render(); this._renderModal(); this._toast("Vorlage zurückgenommen"); } return true; }
    if (a === "hztiles") { this._modal = { type: "hztiles" }; this._renderModal(); return true; }
    if (a === "hztt") { const T = this._hzTiles(), h = T.hidden.includes(k) ? T.hidden.filter((x) => x !== k) : [...T.hidden, k]; this._hzSave({ tiles: { ...T, hidden: h } }); return true; }
    if (a === "hztm") { const T = this._hzTiles(), ids = this._hzMods(true).map((m) => m.id).filter((x) => !T.hidden.includes(x)), i = ids.indexOf(k), j = i + (b.dataset.d === "up" ? -1 : 1); if (i < 0 || j < 0 || j >= ids.length) return true; [ids[i], ids[j]] = [ids[j], ids[i]]; this._hzSave({ tiles: { ...T, order: [...ids, ...T.hidden] } }); return true; }
    if (a === "hztreset") { this._hzSave({ tiles: { order: [], hidden: this._hzTiles().hidden } }); return true; }
    if (a === "hzqasw") { this._hzSave({ qa: !((this._cfg.layout.start || {}).qa === true) }); this._tgxLoad(true); return true; }
    if (a === "hzqaset") { this._tgxLoad(true); this._modal = { type: "hzqaset" }; this._renderModal(); return true; }
    if (a === "hzqat") { this._hzQaToggle(k); return true; }
    if (a === "hzqa") { if (this._modal && this._modal.type === "hzqm") { this._modal = null; this._renderModal(); } this._hzQaRun(Number(k)); return true; }
    if (a === "hzqago") { this._modal = null; this._renderModal(); this._hzQaDo(Number(k)); return true; }
    return false;
  }
  /* Langes Drücken auf eine Kachel: Schnellaktionen des Moduls (nur wenn es welche gibt) */
  _hzLpBind() {
    if (this._hzLpOn || !this.shadowRoot) return; this._hzLpOn = true;
    const sr = this.shadowRoot, stop = () => { if (this._hzLpT) { clearTimeout(this._hzLpT); this._hzLpT = null; } };
    sr.addEventListener("pointerdown", (ev) => {
      const t = ev.target.closest && ev.target.closest(".hzk[data-k]"); if (!t || !this._hzQaOn()) return; stop();
      const k = t.dataset.k, G = { fh: ["fh", "lf", "pe"], ww: ["ww"], ev: ["ev"], sf: ["sf"], mu: ["mu"], li: ["li"] }[k] || [];
      if (!this._hzQa().some((q) => G.includes(this._hzQaGroup(q)))) return;
      this._hzLpT = setTimeout(() => { this._hzLpT = null; this._hzLP = Date.now(); this._modal = { type: "hzqm", k }; this._renderModal(); }, 600);
    });
    ["pointerup", "pointercancel", "pointerleave", "pointermove"].forEach((t) => sr.addEventListener(t, (ev) => { if (t !== "pointermove" || (ev.movementX * ev.movementX + ev.movementY * ev.movementY) > 16) stop(); }, true));
  }
