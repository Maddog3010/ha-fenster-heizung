  /* ================= Einstellungen › Module (2026.11.4.3b4): alle Module an einer Stelle =================
     Ersetzt das frühere Fenster „Module“ (Store-Knopf und „Module verwalten“). Zeile = Einstellungen des Moduls,
     Schalter rechts = ein/aus (nur Admins). Ausschalten löscht nichts und lässt sich im Hinweis zurücknehmen. */
  _mdsProblems() {
    const dead = this._stDead(), out = {};
    for (const id of Object.keys(dead)) out[id] = `${dead[id].length === 1 ? "1 Sensor ohne Wert" : dead[id].length + " Sensoren ohne Wert"}`;
    const s = this._mdState();
    if (s.on.ww && !this._stDone("ww") && !out.ww) out.ww = "Noch nicht eingerichtet";
    if (this._enOn() && !this._stDone("en") && !out.en) out.en = "Noch nicht eingerichtet";
    return out;
  }
  _mdsStage(m) { return m.beta ? (modSt(m) === "stabil" ? "st" : "bt") : "st"; }
  _mdsRow(o) {
    const adm = this._admin();
    /* Handy: statt Beschreibung nur „Modul N · Status“ (Klassen mdsd/mdsst, umgeschaltet per CSS) */
    const st = `<span class="mdsst">${esc(o.tag.split(" · ")[0])}${o.status ? " · " + esc(o.status) : ""}</span>`;
    const head = `<span class="sxi${o.off ? " mdsoff" : ""}">${ic(o.icon, 20)}</span><span class="sxt"><b>${esc(o.name)} <i class="stmn mdsd">${esc(o.tag)}</i></b><small><span class="mdsd">${o.sub}</span>${st}</small></span>${o.chip || ""}`;
    const main = o.act && !o.off ? `<button class="sxrow mdsb" data-act="${o.act}"${o.k ? ` data-k="${esc(o.k)}"` : ""}>${head}<span class="sxg">${ic("chev", 16)}</span></button>`
      : `<div class="sxrow mdsb mdsx">${head}</div>`;
    const tog = o.tog && adm ? `<span class="mdsep"></span><button class="sw ${o.on ? "on" : ""}" data-act="mdtog" data-k="${esc(o.id)}" aria-pressed="${!!o.on}" aria-label="${esc(o.tag)} ${o.on ? "ausschalten" : "einschalten"}"></button>`
      : o.tog === false ? `<span class="mdsep"></span><span class="mdsnt"></span>` : "";
    return `<div class="mdsr${o.off ? " off" : ""}">${main}${tog}</div>`;
  }
  _mdsPage(card) {
    const s = this._mdState(), adm = this._admin(), prob = this._mdsProblems(), F = this._mdsF || "";
    const chipOf = (m, id) => prob[id] ? `<em class="sxc er">${esc(prob[id])}</em>` : m && m.sponsor && m.beta ? `<em class="sxc sp">${ic("heart", 11)}Sponsor</em><em class="sxc ${STG[modSt(m)].c}">${STG[modSt(m)].t}</em>`
      : m && m.beta ? `<em class="sxc ${STG[modSt(m)].c}">${STG[modSt(m)].t}</em>` : id === "fh" ? `<em class="sxc">Grundmodul</em>` : this._stDone(id) ? `<em class="sxc ok">${esc(id === "gs" || id === "fh" ? this._stDone(id) : "Eingerichtet")}</em>` : `<em class="sxc wa">Offen</em>`;
    const statusOf = (m, id) => prob[id] || (m && m.beta ? STG[modSt(m)].t : id === "fh" ? "Grundmodul" : this._stDone(id) || "Offen");
    const keep = (stage, id) => !F || (F === "pr" ? !!prob[id] : F === stage);
    /* Modul 0 steht nicht in MODS */
    const gr = { n: 0, id: "gr", icon: "home", name: "Haus & Grundriss", on: s.on.gr !== false, stage: "bt", sub: "Ein Bauplan für alle Module", chip: `<em class="sxc ${STG.dev ? STG.dev.c : ""}">${STG.dev ? STG.dev.t : "In Entwicklung"}</em>`, status: "In Entwicklung" };
    const list = [gr, ...MODS.map((m) => ({ n: m.n, id: m.id, m, icon: m.icon, name: m.name, on: this._stIsOn(m), stage: this._mdsStage(m), sub: esc((MOD_SET[m.id] || {}).txt || m.tag || ""), chip: chipOf(m, m.id), status: statusOf(m, m.id), act: (MOD_SET[m.id] || {}).act }))];
    gr.act = "mdgo"; gr.k = "gr";
    const ads = this._adMods().map((m) => ({ n: m.n, id: m.id, icon: m.icon, name: m.name, on: true, stage: STG[m.stage] && m.stage !== "stabil" ? "bt" : "st", sub: esc((this._adDef(m.aid) || {}).settingsTxt || m.tag || ""), chip: `<em class="sxc ${STG[m.stage] ? STG[m.stage].c : ""}">Addon</em>`, status: "Addon", act: "adxset", k: m.aid, ver: m.ad && m.ad.version, addon: true }));
    const onL = list.filter((x) => x.on).concat(ads).sort((a, b) => a.n - b.n), offL = list.filter((x) => !x.on);
    const rowOf = (x) => this._mdsRow({ id: x.id, icon: x.icon, name: x.name, tag: `Modul ${x.n}${x.ver ? " · v" + x.ver : MV[x.id] ? " · v" + MV[x.id].v : ""}`, sub: x.sub, status: x.status, chip: x.chip,
      act: x.act, k: x.k, on: x.on, off: !x.on, tog: x.addon ? undefined : x.id === "fh" ? false : true });
    const onShow = onL.filter((x) => keep(x.stage, x.id)), offShow = offL.filter((x) => keep(x.stage, x.id));
    const nPr = Object.keys(prob).length, core = MODS.filter((m) => !m.beta && this._stIsOn(m)), done = core.filter((m) => this._stDone(m.id)).length;
    const seg = [["", "Alle"], ["st", "Stabil"], ["bt", "Beta & Entwicklung"], ["pr", `Probleme${nPr ? " " + nPr : ""}`]].map(([k, t]) => `<button class="${F === k ? "sel" : ""}" data-act="mdsf" data-k="${k}" aria-pressed="${F === k}">${t}</button>`).join("");
    const offC = this._stOffC ?? !!this._narrow, extC = this._mdsExtC ?? !!this._narrow, E = this._mdsE || {};
    const extRows = s.ext.map((x) => `<div class="mdsr"><div class="sxrow mdsb mdsx"><span class="sxi">${ic("puzzle", 20)}</span><span class="sxt"><b>${esc(x.name)}</b><small><code>${esc(x.url)}</code></small></span></div>${adm ? `<button class="ibtn" data-act="mdextdel" data-k="${x.id}" aria-label="${esc(x.name)} entfernen">${ic("trash", 17)}</button><span class="mdsep"></span><button class="sw ${x.on ? "on" : ""}" data-act="mdtog" data-k="${x.id}" aria-pressed="${!!x.on}" aria-label="${esc(x.name)} ein- oder ausschalten"></button>` : ""}</div>`).join("");
    const info = `<div class="minfo"><b>So ist es aufgebaut</b><ul><li>Jedes Modul meldet sich mit <b>ID, Name, Symbol und einer Seite</b> (JavaScript-Datei) an.</li><li>Es bekommt Zugriff auf Räume, PV-Überschuss, Benachrichtigungen und die Gerätediagnose.</li><li>Was ein Modul speichert, bleibt in seinem eigenen Bereich. Ausschalten löscht nichts.</li><li>Module werden einzeln über den Marketplace (bis Home Assistant 2026.10: HACS) installiert und haben eigene Versionen.</li></ul></div>`;
    return `<div class="sxsum"><div><b>${onL.length}</b><span>an</span></div><div><b>${offL.length}</b><span>aus</span></div><div><b>${done} / ${core.length}</b><span>eingerichtet</span></div><div><b>${s.ext.length}</b><span>${s.ext.length === 1 ? "eigenes Modul" : "eigene Module"}</span></div></div>
      <div class="seg mdsseg" role="group" aria-label="Module filtern">${seg}</div>
      ${onShow.length ? card(onShow.map(rowOf).join(""), `Eingeschaltet <small>· ${onShow.length}${adm && !this._narrow ? " · Zeile = Einstellungen · Schalter = an/aus" : ""}</small>`) : F ? `<div class="card sxl stcard"><div class="mut sm" style="padding:14px">${F === "pr" ? "Keine Probleme – alle eingeschalteten Module sind eingerichtet und ihre Sensoren liefern." : "In diesem Filter ist kein Modul eingeschaltet."}</div></div>` : ""}
      ${offShow.length ? `<div class="card sxl stcard"><button class="stch sttg" data-act="mdstoff" aria-expanded="${!offC}">Ausgeschaltet <small>· ${offShow.length} · nichts wird gelöscht</small><span class="stgo">${offC ? "Anzeigen ▾" : "Einklappen ▴"}</span></button>${offC ? "" : offShow.map(rowOf).join("")}</div>` : ""}
      ${adm || s.ext.length ? `<div class="card sxl stcard"><button class="stch sttg" data-act="mdsext" aria-expanded="${!extC}">Eigene Module <small>· ${s.ext.length ? s.ext.length : "per Adresse einbinden"}</small><span class="stgo">${extC ? "Anzeigen ▾" : "Einklappen ▴"}</span></button>
        ${extC ? "" : `${extRows}${adm ? `<div class="mdsadd"><div class="murl"><input class="otxt" data-f="mdurl" placeholder="/local/mein-modul.js" value="${esc(E.url || "")}" autocomplete="off" spellcheck="false" aria-label="Adresse der Moduldatei"><button class="btn2 pri" data-act="mdextadd">Hinzufügen</button></div>
          ${E.err ? `<div class="gst on">${ic("alert", 15)}${esc(E.err)}</div>` : ""}
          <div class="mdsft"><button class="btn2" data-act="mdhacs">${ic("download", 16)} Im ${this._storeName()} suchen</button><button class="lnk" data-act="mdinfo" aria-expanded="${!!this._mdsInfo}">${ic("info", 15)}Wie funktionieren Module?</button></div>
          ${this._mdsInfo ? info : ""}</div>` : ""}`}</div>` : ""}`;
  }
  /* Nach dem Ausschalten: Hinweis mit „Rückgängig“ (kein Nachfragen – Ausschalten löscht nichts) */
  _mdsUndo(id) {
    const t = this.shadowRoot.getElementById("toast"); if (!t) return;
    const m = MODS.find((x) => x.id === id), x = (this._mdState().ext || []).find((e) => e.id === id);
    const nm = m ? `Modul ${m.n} ${m.short || m.name}` : x ? x.name : id === "gr" ? "Modul 0" : "Modul";
    t.innerHTML = `<div class="toast ehundo"><span>${esc(nm)} ausgeschaltet</span><button data-act="mdtog" data-k="${esc(id)}">Rückgängig</button></div>`; clearTimeout(this._tt);
    this._tt = setTimeout(() => (t.innerHTML = ""), 5000);
  }
