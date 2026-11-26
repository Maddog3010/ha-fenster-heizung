  /* ================= Modul 1 · Elektroheizer 2.0 (Build 2 und 3): Assistent, Geräteliste, Geräte-Blatt =================
     Vier Schritte statt zwölf Felder: 1 Gerät · 2 Raum · 3 Leistung · 4 Fertig. Kommt man aus einem Raum (Raumkarte „⋯“,
     Raumeinstellungen), ist der Raum gesetzt und Schritt 2 entfällt. Speichern über fenster_heizung/heizer_add (heizer.py).
     Einstiege: Raumkarte „⋯“, Modul 1 · Einstellungen › Geräte › Elektroheizer, Grundriss (Gerät „Mobiler Heizer“), Raumeinstellungen.
     Build 3: Der eigene Reiter „Elektroheizer“ entfällt. Unter Modul 1 · Einstellungen › Geräte steht die Zeile „Elektroheizer“;
     sie öffnet die Liste (Modal „ehlist“) mit „+ hinzufügen“ und den PV-Regeln für alle Heizer. Jeder Heizer hat ein Geräte-Blatt
     (Modal „rkhtr“, auch von der Raumkarte) mit Bearbeiten (Assistent Schritt 3–4), Pausieren und „In anderen Raum stellen“ (Modal „ehmove“).
     Aktionen beginnen mit „ehx“, Eingabefelder mit data-f="ehx…". */
  static EH_TPL = [
    ["oel", "Ölradiator 2 000 W", [800, 1200, 2000], "flame"],
    ["luefter", "Heizlüfter 2 000 W", [1000, 2000], "fan"],
    ["ir", "Infrarot-Paneel", [600], "sun"],
    ["konv", "Konvektor 2 000 W", [750, 1250, 2000], "bolt"],
  ];
  static EH_HINT = /heiz|heater|radiator|lüfter|luefter|konvektor|infrarot|ofen|panel|steckdose|plug|outlet|socket/i;
  _ehRooms() { return this._collect(true); }
  _ehRoomTemp(r) { try { const s = this._rkState(r); return { cur: s.cur, ziel: s.ziel }; } catch (_) { return { cur: null, ziel: null }; } }
  async _ehOpen(room) {
    if (!this._admin()) { this._toast("Nur für Admins"); return; }
    const rooms = this._ehRooms(), r = room ? rooms.find((x) => x.id === room) : null;
    if (r && r.htr) { this._modal = { type: "rkhtr", id: r.id }; this._renderModal(); this._toast(`In „${r.name}“ ist schon ein Elektroheizer eingerichtet`); return; }
    if (!rooms.some((x) => !x.htr)) { this._toast("Alle Räume haben schon einen Elektroheizer"); return; }
    const back = this._modal && this._modal.type !== "ehwiz" ? this._modal : null, z = r ? this._ehRoomTemp(r).ziel : null;
    this._pkId = null;
    this._modal = { type: "ehwiz", step: 1, fixed: !!r, back, busy: false, err: "",
      d: { room: r ? r.id : "", entity: "", name: "", tpl: "oel", steps: [800, 1200, 2000], txt: "", target: z != null && isFinite(z) ? Math.round(z * 2) / 2 : 21, thermo: "off", auto: "on", prio: 5, from: "", to: "", more: false, ...this._ehFrostDraft({ mode: this._pv().sensor ? "pv" : "frost" }) } };
    this._renderModal();
    try { this._ehD = await this._hass.callWS({ type: "fenster_heizung/heizer_get" }); } catch (_) { this._ehD = null; }
    if (this._modal && this._modal.type === "ehwiz") this._renderModal();
  }
  _ehSteps(d) { if (d.tpl === "mess") return [...new Set((d.meas || []).map((w) => Math.round(w / 10) * 10))].filter((w) => w >= 50 && w <= 10000).sort((a, b) => a - b).slice(0, 8); return d.tpl === "own" ? String(d.txt || "").split(/[^0-9]+/).map(Number).filter((w) => w >= 50 && w <= 10000).slice(0, 8).sort((a, b) => a - b) : d.steps; }
  _ehCands() {
    const st = this._hass.states, rooms = this._ehRooms(), th = new Set(rooms.flatMap((r) => r.thermos || []));
    const used = new Map(((this._ehD && this._ehD.heaters) || []).map((h) => [h.entity, h.name]));
    rooms.forEach((r) => { if (r.htr && r.htr.entity && !used.has(r.htr.entity)) used.set(r.htr.entity, `Heizer in ${r.name}`); });
    const all = Object.keys(st).filter((e) => (e.startsWith("switch.") || e.startsWith("climate.")) && !e.startsWith("switch.fenster_heizung") && !(st[e].attributes || {}).funktion);
    return { free: all.filter((e) => !th.has(e) && !used.has(e)), th: all.filter((e) => th.has(e)).length, used };
  }
  _ehModal() {
    const M = this._modal, d = M.d, S = this.constructor, rooms = this._ehRooms(), st = this._hass.states;
    const steps = this._ehStepList(M), pos = steps.indexOf(M.step), last = pos === steps.length - 1;
    const room = rooms.find((x) => x.id === d.room), W = this._ehSteps(d);
    const row = (l, h, ctl) => `<div class="of"><div class="ol"><b>${l}</b>${h ? `<small>${h}</small>` : ""}</div><div class="oc">${ctl}</div></div>`;
    const seg = (k, opts) => `<div class="seg oseg">${opts.map(([v, l]) => `<button class="${d[k] === v ? "sel" : ""}" data-act="ehxseg" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`;
    const step = (k, unit, s, lo, hi, dec = 0) => `<div class="lfstep"><button class="ibtn" data-act="ehxstep" data-k="${k}" data-v="${-s}" data-lo="${lo}" data-hi="${hi}" aria-label="weniger">${ic("minus", 16)}</button><b>${num(d[k], dec)}<small> ${unit}</small></b><button class="ibtn" data-act="ehxstep" data-k="${k}" data-v="${s}" data-lo="${lo}" data-hi="${hi}" aria-label="mehr">${ic("plus", 16)}</button></div>`;
    const tin = (k, lbl) => `<span class="tin">${this._tIn(esc(d[k]), false, lbl)}<input type="hidden" data-f="ehxt" data-k="${k}" value="${esc(d[k])}" aria-label="${lbl}"></span>`;
    let body = "", ok = true;
    if (M.step === 1) {
      const C = this._ehCands(), sug = C.free.filter((e) => S.EH_HINT.test(e + " " + ((st[e].attributes || {}).friendly_name || ""))).slice(0, 4);
      ok = !!d.entity;
      body = `<h3 class="wzt">Welches Gerät?</h3><div class="mut sm" style="margin:-4px 0 8px">Ein Schalter (z. B. die Steckdose des Heizers) oder ein Klima-Gerät. Modul 1 schaltet es bei PV-Überschuss oder, wenn du das wählst, bei Frost ein.</div>
        ${sug.length ? `<div class="lsec">${ic("bolt", 15)}Passt wahrscheinlich</div><div class="lfkind">${sug.map((e) => `<button class="${d.entity === e ? "sel" : ""}" data-act="ehxent" data-k="${esc(e)}"><b>${esc(this._wzName(e))}</b><span>${esc(e)}${e.startsWith("climate.") ? ` · Klima-Gerät${((st[e].attributes || {}).preset_modes || []).length ? `, ${st[e].attributes.preset_modes.length} Voreinstellungen` : ""}` : " · Schalter"}</span></button>`).join("")}</div>` : ""}
        <div class="lsec">${ic("search", 15)}${sug.length ? "Oder ein anderes Gerät" : "Gerät wählen"}</div>
        ${this._wzSel(C.free, d.entity, "ehxe", `data-k="entity"`, "– Gerät wählen –", S.EH_HINT)}
        ${C.th || C.used.size ? `<div class="mut sm" style="margin:8px 0 0">${[C.th ? `${C.th} Thermostat${C.th === 1 ? "" : "e"} der Räume` : "", C.used.size ? `${C.used.size} schon eingerichtete${C.used.size === 1 ? "r" : ""} Heizer` : ""].filter(Boolean).join(" und ")} stehen nicht zur Wahl.</div>` : ""}`;
    } else if (M.step === 2) {
      ok = !!room && !room.htr;
      body = `<h3 class="wzt">In welchem Raum steht er?</h3><div class="mut sm" style="margin:-4px 0 8px">Gilt für „Heizen bis“ und die Thermostate dort. Mobile Heizer lassen sich später umstellen.</div>
        <div class="ehrooms">${rooms.map((r) => { const t = this._ehRoomTemp(r), dis = !!r.htr; return `<button class="ehroom${d.room === r.id ? " sel" : ""}" data-act="ehxroom" data-k="${esc(r.id)}" ${dis ? "disabled" : ""}>${this._rkMiniById(r.id)}<span><b>${esc(r.name)}</b><small>${dis ? "hat schon einen Heizer" : "kein Heizer"}</small></span>${t.cur != null ? `<em>${num(t.cur, 1)}°</em>` : ""}</button>`; }).join("")}</div>`;
    } else if (M.step === 3) {
      ok = W.length > 0;
      const cl = d.entity.startsWith("climate."), pm = cl ? ((st[d.entity] || {}).attributes || {}).preset_modes || [] : [];
      body = `<h3 class="wzt">Wie viel Leistung?</h3><div class="mut sm" style="margin:-4px 0 8px">Nach der Leistung entscheidet Modul 1, ob PV-Überschuss oder Netzgrenze reichen. Hat der Heizer Stufen, wird bei mehr Überschuss höher geschaltet.</div>
        <div class="lfkind">${S.EH_TPL.map(([k, l, w, i]) => `<button class="${d.tpl === k ? "sel" : ""}" data-act="ehxtpl" data-k="${k}"><b>${ic(i, 14)} ${l}</b><span>${w.length > 1 ? w.map((x) => num(x, 0)).join(" · ") + " W" : `eine Stufe, ${num(w[0], 0)} W`}</span></button>`).join("")}
        ${d.entity.startsWith("switch.") && !M.edit ? `<button class="${d.tpl === "mess" ? "sel" : ""}" data-act="ehxtpl" data-k="mess"><b>${ic("chart", 14)} Messen</b><span>Mit dem Leistungssensor der Steckdose, Stufe für Stufe (je 30 Sekunden)</span></button>` : ""}
        <button class="${d.tpl === "own" ? "sel" : ""}" data-act="ehxtpl" data-k="own"><b>${ic("pencil", 14)} Eigene Werte</b><span>Leistung laut Typenschild, Stufen mit Komma trennen</span></button></div>
        ${d.tpl === "mess" ? this._ehMeasBox(d) : ""}
        ${d.tpl === "own" ? `<div class="lsec">${ic("bolt", 15)}Leistungsstufen in Watt</div><input class="otxt" type="text" inputmode="numeric" data-f="ehxtxt" value="${esc(d.txt)}" placeholder="z. B. 800, 1200, 1800 oder 1500" aria-label="Leistungsstufen in Watt">` : ""}
        ${W.length ? `<div class="stpv" style="margin-top:10px">${W.map((w, i) => `<span><b>${i + 1}</b>${wfmt(w)}</span>`).join("")}</div>` : `<div class="mut sm" style="margin-top:8px">Mindestens eine Leistung zwischen 50 und 10 000 W eingeben.</div>`}
        ${cl ? `<div class="gst">${ic("info", 15)}${pm.length ? `Klima-Gerät mit ${pm.length} Voreinstellungen: Die Stufen werden ihnen automatisch zugeordnet, ändern kannst du das in den Raumeinstellungen.` : "Klima-Gerät ohne Voreinstellungen: Modul 1 schaltet nur ein und aus (höchste Stufe)."}</div>` : W.length > 1 ? `<div class="gst">${ic("info", 15)}Eine Steckdose kennt nur Ein und Aus: Modul 1 rechnet mit der höchsten Stufe. Stell den Heizer am Gerät auf diese Stufe.</div>` : ""}`;
    } else {
      if (!d.name) d.name = this._wzName(d.entity) || "Elektroheizer";
      const fr = d.mode !== "pv", pvm = d.mode !== "frost";
      ok = !!d.name.trim() && (!d.from === !d.to) && !(fr && room && !room.rtEid);
      body = `<h3 class="wzt">${M.edit ? "Regeln" : "Fast fertig"}</h3>
        <div class="lsec">${ic("pencil", 15)}Name</div><input class="otxt" type="text" maxlength="40" data-f="ehxname" value="${esc(d.name)}" aria-label="Name des Heizers">
        <div class="ehsum"><span>${ic("bolt", 15)}<b>${esc(this._wzName(d.entity))}</b></span><span>${ic("home", 15)}<b>${esc(room ? room.name : "–")}</b></span><span>${ic("flame", 15)}<b>${W.map((w) => num(w, 0)).join(" · ")} W</b></span></div>
        ${row("Wann soll er heizen?", this._pv().sensor ? "„Frost“ heizt auch mit Netzstrom zu, wenn der Raum zu kalt bleibt." : "Ohne PV-Sensor bleibt „PV-Überschuss“ ohne Wirkung. „Frost“ heizt mit Netzstrom.", seg("mode", [["pv", "PV-Überschuss"], ["frost", "Frost"], ["both", "Beides"]]))}
        ${pvm ? row("Heizen bis", fr ? "Gilt für PV-Überschuss." : "Der Heizer schaltet ab, sobald der Raum so warm ist.", step("target", "°C", 0.5, 10, 30, 1)) : ""}
        ${pvm ? row("Thermostate, solange er heizt", `Ausschalten: Die Heizkörper des Raums ruhen, danach regeln sie wieder.${fr ? " Bei Frost bleiben sie immer an." : ""}`, seg("thermo", [["off", "Ausschalten"], ["on", "Weiterlaufen"]])) : ""}
        ${pvm && W.length > 1 && d.entity.startsWith("climate.") ? row("Stufen regeln", "Automatisch: höhere Stufe bei mehr Überschuss.", seg("auto", [["on", "Automatisch"], ["off", "Fest"]])) : ""}
        ${fr ? this._ehFrostRows(d, room, W, row, step, tin) : ""}
        <button class="lnk" data-act="ehxmore" style="margin:8px 0 4px">${ic("chev", 14)} ${d.more ? "Weniger" : pvm ? "Mehr Einstellungen (Priorität, Zeitfenster)" : "Mehr Einstellungen (Priorität)"}</button>
        ${d.more ? row("Priorität", "1 wird zuerst versorgt, wenn Überschuss oder Netzgrenze nicht für alle reichen.", step("prio", "", 1, 1, 9)) + (pvm ? row(fr ? "PV erlaubt ab" : "Erlaubt ab", "Optional. Leer = ganztägig.", tin("from", "Erlaubt ab")) + row(fr ? "PV erlaubt bis" : "Erlaubt bis", "", tin("to", "Erlaubt bis")) + (d.from || d.to ? `<button class="lnk" data-act="ehxnotime">Zeitfenster entfernen</button>` : "") : "") : ""}
        ${!M.edit ? `<button class="btn2" data-act="ehxtest" style="width:100%;margin:8px 0 0" ${M.testUntil && M.testUntil > Date.now() ? "disabled" : ""}>${ic("play", 15)} ${M.testUntil && M.testUntil > Date.now() ? `Testlauf läuft noch ${Math.ceil((M.testUntil - Date.now()) / 1000)} s …` : "Testlauf (30 Sekunden ein)"}</button><div class="mut sm" style="margin:4px 0 0">Prüft, ob Modul 1 das Gerät schalten kann – unabhängig vom Überschuss. Danach ist es wieder wie vorher.</div>` : ""}
        <div class="gst on">${ic(pvm ? "sun" : "bolt", 15)}${!pvm ? "Heizt nur bei Frost, mit Netzstrom." : fr ? `Heizt mit PV-Überschuss. Bei Frost zusätzlich mit Netzstrom.${this._pv().sensor ? "" : " Den Netz-Sensor für PV wählst du unter Haus › Energiequellen."}` : this._pvNow() != null ? `Heizt nur mit PV-Überschuss. Gerade frei: ${wfmt(Math.max(0, this._pvNow()))}${this._pvNow() >= Math.min(...W) ? " – er könnte gleich starten." : "."}` : "Heizt nur mit PV-Überschuss. Den Netz-Sensor wählst du unter Haus › Energiequellen."}</div>`;
      if (M.confirm) return this._ehConfirmModal(M, room, Math.max(...W));
    }
    return `<div class="ov" data-act="ehxcancel"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Elektroheizer ${M.edit ? "bearbeiten" : "hinzufügen"}">
      <div class="sh"><div><b>Elektroheizer ${M.edit ? "bearbeiten" : "hinzufügen"}</b><span>Schritt ${pos + 1} von ${steps.length}${room && M.fixed ? " · " + esc(room.name) : ""}</span></div><button class="ibtn" data-act="ehxcancel" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="ehbar">${steps.map((s, i) => `<i class="${i <= pos ? "on" : ""}"></i>`).join("")}</div>
      ${body}${M.err ? `<div class="gbox" style="margin-top:10px">${esc(M.err)}</div>` : ""}
      <div class="foot2">${pos > 0 ? `<button class="btn2" data-act="ehxback">Zurück</button>` : `<button class="btn2" data-act="ehxcancel">Abbrechen</button>`}<button class="btn2 pri" data-act="${last ? "ehxsave" : "ehxnext"}" ${ok && !M.busy ? "" : "disabled"}>${last ? (M.busy ? "Speichert …" : "Speichern") : "Weiter"}</button></div></div>`;
  }
  _ehChange(t) {
    const M = this._modal; if (!M || M.type !== "ehwiz") return false;
    const f = t.dataset.f, d = M.d;
    if (f === "ehxpw") { d.pw = t.value || ""; this._renderModal(); return true; }
    if (f === "ehxe") { d.entity = t.value || ""; d.name = ""; this._renderModal(); return true; }
    if (f === "ehxname") { d.name = t.value; return true; }
    if (f === "ehxtxt") { d.txt = t.value; this._renderModal(); return true; }
    if (f === "ehxt") { if (/^\d\d:\d\d$/.test(t.value)) d[t.dataset.k] = t.value; this._renderModal(); return true; }
    return false;
  }
  _ehAct(a, b) {
    if (a === "ehxnew") { this._ehOpen(b.dataset.id || ""); return; }
    if (a === "ehxfrp") { this._gen.frost = { ...this._frost(), price_on: b.dataset.k === "on" }; this._saveGen(); this._renderModal(); return; }
    if (this._ehAct3(a, b) || this._ehAct4(a, b)) return;
    const M = this._modal; if (!M || M.type !== "ehwiz") return;
    const d = M.d, steps = this._ehStepList(M), pos = steps.indexOf(M.step);
    M.err = "";
    if (this._ehFrostAct(a, b)) return;
    if (a === "ehxcancel") { this._pkId = null; this._ehStopTick(); this._modal = M.back; this._renderModal(); return; }
    if (a === "ehxent") { d.entity = b.dataset.k; d.name = ""; }
    else if (a === "ehxroom") { d.room = b.dataset.k; if (!M.fixed) { const r = this._ehRooms().find((x) => x.id === d.room), z = r ? this._ehRoomTemp(r).ziel : null; if (z != null && isFinite(z)) d.target = Math.round(z * 2) / 2; } }
    else if (a === "ehxtpl") { d.tpl = b.dataset.k; const T = this.constructor.EH_TPL.find((x) => x[0] === d.tpl); if (T) d.steps = T[2]; }
    else if (a === "ehxseg") d[b.dataset.k] = b.dataset.v;
    else if (a === "ehxstep") { const k = b.dataset.k; d[k] = Math.round(Math.min(parseFloat(b.dataset.hi), Math.max(parseFloat(b.dataset.lo), (Number(d[k]) || 0) + parseFloat(b.dataset.v))) * 10) / 10; }
    else if (a === "ehxmore") d.more = !d.more;
    else if (a === "ehxnotime") { d.from = ""; d.to = ""; }
    else if (a === "ehxback") { this._pkId = null; M.step = steps[Math.max(0, pos - 1)]; }
    else if (a === "ehxnext") { this._pkId = null; M.step = steps[Math.min(steps.length - 1, pos + 1)]; const sh = this.shadowRoot.querySelector("#modal .sheet"); if (sh) sh.scrollTop = 0; }
    else if (a === "ehxsave") { this._ehSave(); return; }
    else if (a === "ehxmeas") { this._ehMeasure(); return; }
    else if (a === "ehxmdel") d.meas = (d.meas || []).filter((_, i) => i !== +b.dataset.i);
    else if (a === "ehxtest") { this._ehTestRun(d.entity, 30).then((r) => { if (r) { M.testUntil = Date.now() + 30000; this._ehTick(); } }); return; }
    this._renderModal();
  }
  async _ehSave() {
    const M = this._modal, d = M.d, W = this._ehSteps(d); if (M.busy) return;
    if (d.mode !== "pv" && !d.frost_ok) { M.confirm = [false, false, false]; this._renderModal(); const sh = this.shadowRoot.querySelector("#modal .sheet"); if (sh) sh.scrollTop = 0; return; }
    M.busy = true; this._renderModal();
    const heater = { room: d.room, entity: d.entity, name: d.name.trim(), steps: W, watt: Math.max(...W), target: d.target, thermo: d.thermo, auto: d.auto, prio: d.prio, from: d.from || null, to: d.to || null, ...this._ehFrostData(d) };
    if (M.edit) { delete heater.room; delete heater.entity; }
    try {
      const r = M.edit ? await this._hass.callWS({ type: "fenster_heizung/heizer_update", hid: M.edit, heater }) : await this._hass.callWS({ type: "fenster_heizung/heizer_add", heater });
      if (M.edit) { this._ehD = r; this._modal = M.back; this._renderModal(); this._render(); this._toast(`„${heater.name}“ gespeichert`); return; }
      this._ehD = r; this._modal = M.back && (M.back.type === "fh" || M.back.type === "ehlist") ? M.back : null;  /* Raumdialog nicht zurückholen: sein Entwurf kennt den Heizer noch nicht */ this._renderModal(); this._render();
      this._toast(`„${heater.name}“ eingerichtet – heizt ${this._ehModeText(heater.mode)}`);
    } catch (e) { M.busy = false; M.err = (e && e.message) || "Speichern fehlgeschlagen"; this._renderModal(); }
  }
  _ehStepList(M) { return M.edit ? [3, 4] : M.fixed ? [1, 3, 4] : [1, 2, 3, 4]; }
  /* ---------- Build 3: Geräteliste, Geräte-Blatt, Raum wechseln ---------- */
  async _ehLoad() {
    try { this._ehD = await this._hass.callWS({ type: "fenster_heizung/heizer_get" }); } catch (_) { return; }
    if (this._modal && ["ehlist", "rkhtr", "ehmove"].includes(this._modal.type)) this._renderModal();
  }
  _ehOf(room) { return ((this._ehD && this._ehD.heaters) || []).find((h) => h.room === room) || null; }
  _ehName(r) { const e = this._ehOf(r.id); return e ? e.name : this._wzName((r.htr || {}).entity) || "Elektroheizer"; }
  _ehPaused(r) { return !!r.htrSw && r.htrOn === false; }
  _ehListOpen(back) { this._pkId = null; this._modal = { type: "ehlist", back: back || null }; this._renderModal(); this._ehLoad(); }
  /* Zeile im Reiter „Geräte“ der Modul-1-Einstellungen */
  _ehGeraeteRow() {
    const hs = this._ehRooms().filter((r) => r.htr), n = hs.length;
    const txt = n === 1 ? `${esc(this._ehName(hs[0]))} · ${esc(hs[0].name)} · ${htrFrost(hs[0].htr) ? this._ehModeText(hs[0].htr.modus) : "nur mit PV-Überschuss"}` : n ? `${n} Geräte: ${esc(hs.map((r) => this._ehName(r)).join(", "))}` : "Heizer für PV-Überschuss oder Frost einbinden";
    return `<button class="sxrow" data-act="ehxlist"><span class="sxi">${ic("bolt", 20)}</span><span class="sxt"><b>Elektroheizer</b><small>${txt}</small></span><em class="sxc ${n ? "ok" : ""}">${n ? "Eingerichtet" : "Neu"}</em><span class="sxg">${ic("chev", 16)}</span></button>`;
  }
  _ehListModal() {
    const M = this._modal, rooms = this._ehRooms(), hs = rooms.filter((r) => r.htr).sort((a, b) => ((a.htr.prio || 5) - (b.htr.prio || 5)) || a.name.localeCompare(b.name, "de")), adm = this._admin();
    const rows = hs.map((r) => { const h = r.htr, on = htrOn(h), ps = this._ehPaused(r), st = stepsOf(h); return `<button class="sxrow" data-act="rkhtr" data-id="${esc(r.id)}"><span class="sxi">${ic("bolt", 20)}</span><span class="sxt"><b>${esc(this._ehName(r))}</b><small>${esc(r.name)} · ${st.length > 1 ? `${st.length} Stufen bis ${wfmt(Math.max(...st))}` : wfmt(h.watt)}${h.modus === "both" ? " · PV und Frost" : h.modus === "frost" ? " · Frost" : ""}</small></span><em class="sxc ${on ? "ok" : ps ? "off" : ""}">${ps ? "pausiert" : on ? (h.status === "frost" ? "❄ " : "☀ ") + wfmt(h.watt_now) : "wartet"}</em><span class="sxg">${ic("chev", 16)}</span></button>`; }).join("");
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>${M.back ? `<button class="lnk ehbk" data-act="ehxlback" aria-label="Zurück">‹</button>` : ""}Elektroheizer</b><span>Modul 1 · Geräte · ${hs.length ? `${hs.length} ${hs.length === 1 ? "Heizer" : "Heizer"}` : "noch keiner eingerichtet"}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("bolt", 15)}Deine Heizer</div>
      <div class="fhs"><div class="sxl">${rows || `<div class="mut sm" style="padding:12px 14px">Noch kein Elektroheizer eingerichtet.</div>`}</div>
      ${adm && rooms.some((r) => !r.htr) ? `<div style="padding:0 12px 12px"><button class="btn2 pri" data-act="ehxnew" style="width:100%">${ic("plus", 16)} Elektroheizer hinzufügen</button></div>` : ""}</div>
      ${this._ehTrashBlock()}
      ${this._ehFrostRules(hs)}
      ${this._ehPvRules()}
      <div class="foot2">${M.back ? `<button class="btn2" data-act="ehxlback">Zurück</button>` : ""}<button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  /* PV-Regeln für alle Heizer (bis Build 2 im Reiter „Elektroheizer“) */
  _ehPvRules() {
    const pv = this._pv(), pvn = this._pvNow(), rp = this._rate("price"), rf = this._rate("feed"), hts = this._ehRooms().filter((r) => r.htr), anyFr = hts.some((r) => htrFrost(r.htr));
    const prices = `<div class="hslk">${this._hsLink("pr", `Bezug ${num(rp, 2)} ct/kWh, Einspeisung ${num(rf, 2)} ct/kWh`)}</div>`;
    if (!pv.sensor && hts.length && hts.every((r) => r.htr.modus === "frost")) return `<div class="mut sm" style="margin:10px 0 0">Alle Heizer laufen nur bei Frost. Kommt eine PV-Anlage dazu, wählst du den Netz-Sensor hier:</div><div class="hslk">${this._hsLink("en", "Netz noch nicht gewählt")}</div>${prices}`;
    const n = (k, l, u, h, lo, hi, st) => `<div class="of"><div class="ol"><b>${l}</b><span>${h}</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="gpvn" data-k="${k}" value="${pv[k]}" min="${lo}" max="${hi}" step="${st}"><i>${u}</i></span></div></div>`;
    return `<div class="lsec">${ic("sun", 15)}PV-Regeln für alle Heizer</div><div class="fhs open fhst"><div class="sxrow stinfo"><span class="sxi">${ic("bolt", 20)}</span><span class="sxt"><b>PV-Überschuss für Elektroheizer${this._stHelpBtn("general.pv.reserve")}</b><small>${pv.sensor ? (pvn != null ? `${wfmt(pvn)} Überschuss, ${wfmt(this._htrTotal())} an Heizer verteilt.` : "Sensor gewählt, noch kein Wert.") : "Noch kein Sensor für die Einspeisung gewählt."}</small></span><em class="sxc ${pv.sensor ? "ok" : ""}">${pv.sensor ? "Eingerichtet" : "Offen"}</em></div><div class="fhb">
      <div class="mut sm" style="margin:2px 0 4px">${anyFr ? "Diese Regeln gelten für den Betrieb mit PV-Überschuss." : "Elektroheizer heizen nur bei genug Überschuss. Diese Regeln gelten für alle Heizer."}</div>
      <div class="hslk">${this._hsLink("en", `Netz ${pv.sensor ? esc(this._wzName(pv.sensor)) + (pv.sign === "import" ? " (Bezug positiv)" : " (Einspeisung positiv)") : "noch nicht gewählt"}${pv.soc_sensor ? " · Ladestand " + esc(this._wzName(pv.soc_sensor)) : ""}`)}</div>
      ${n("reserve", "Reserve", "W", "Bleibt zusätzlich zur Heizerleistung übrig.", 0, 2000, 50)}${n("delay", "Einschalten nach", "Min.", "So lange muss der Überschuss anliegen.", 0, 30, 1)}${anyFr ? "" : n("minrun", "Mindestlaufzeit", "Min.", "Kürzer läuft ein Heizer nicht an einem Stück.", 0, 120, 5)}
      ${pv.soc_sensor ? n("soc_min", "Heizer erst ab", "%", "Die Batterie wird zuerst geladen.", 0, 100, 5) : ""}
      <div class="gst ${pvn != null ? "on" : ""}">${ic(pvn != null ? "bolt" : "info", 15)}${pvn != null ? `Aktuell ${wfmt(pvn)} Überschuss, ${wfmt(this._htrTotal())} an Heizer verteilt.` : "Noch kein Sensor gewählt."}</div></div></div>
      ${prices}`;
  }
  /* Geräte-Blatt eines Heizers (Raumkarte, Liste) */
  _ehDevSheet(r) {
    const adm = this._admin(), h = r.htr, on = htrOn(h), ps = this._ehPaused(r), e = this._ehOf(r.id), st = h ? stepsOf(h) : [];
    if (!h) return "";
    const it = (act, icon, t, sub, cls = "") => `<button class="rk2mi ${cls}" data-act="${act}" data-id="${esc(r.id)}">${ic(icon, 20)}<span><b>${t}</b><small>${sub}</small></span>${ic("chev", 16)}</button>`;
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>${esc(this._ehName(r))}</b><span>${esc(r.name)} · ${esc((h.entity || "").split(".")[0] === "climate" ? "Klima-Gerät" : "Schalter")}${ps ? " · pausiert" : ""}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="rk2sht">${this._gx("heater", 64, { stage: on ? Math.min(3, h.stufe || 2) : 0, on })}</div>${this._htrBox(r)}
      ${adm ? `<div class="rk2menu" style="margin-top:10px">
        ${it("ehxedit", "pencil", "Bearbeiten", `Name, Leistung${st.length > 1 ? ` (${st.length} Stufen)` : ""}, ${htrFrost(h) ? "PV oder Frost, Regeln" : "Heizen bis, Zeitfenster"}`)}
        ${it("ehxmove", "home", "In anderen Raum stellen", "Statistik und Einstellungen ziehen mit")}
        ${it("ehxpause", ps ? "play" : "pause", ps ? "Fortsetzen" : "Pausieren", ps ? `Heizt wieder ${this._ehModeText(h.modus)}` : "Bleibt eingerichtet, heizt nicht")}
        ${it("ehxdel", "trash", "Heizer entfernen", "Gerät aus, Thermostate zurück, 30 Tage im Papierkorb", "dng")}
        ${it("hrep", "chart", "Bericht", "Überschuss, Stufen und Raumtemperatur eines Tages")}</div>` : ""}
      ${e ? "" : `<div class="mut sm" style="margin:8px 0 0">Wird geladen …</div>`}
      <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _ehEditOpen(room) {
    const r = this._ehRooms().find((x) => x.id === room), e = this._ehOf(room); if (!r || !r.htr || !e) { this._toast("Heizer wird noch geladen"); this._ehLoad(); return; }
    const S = this.constructor, st = (e.steps && e.steps.length ? e.steps : [e.watt || 1500]), T = S.EH_TPL.find((x) => x[2].join() === st.join());
    this._pkId = null;
    this._modal = { type: "ehwiz", step: 3, fixed: true, edit: e.id, back: this._modal, busy: false, err: "",
      d: { room, entity: e.entity, name: e.name, tpl: T ? T[0] : "own", steps: T ? T[2] : st, txt: st.join(", "), target: Number(e.target) || 21, thermo: e.thermo === "on" ? "on" : "off", auto: e.auto === "off" ? "off" : "on", prio: Number(e.prio) || 5, from: (e.from || "").slice(0, 5), to: (e.to || "").slice(0, 5), more: !!(e.from || Number(e.prio) !== 5), ...this._ehFrostDraft(e) } };
    this._renderModal();
  }
  _ehMoveModal() {
    const M = this._modal, rooms = this._ehRooms(), r = rooms.find((x) => x.id === M.id); if (!r || !r.htr) return "";
    const to = rooms.find((x) => x.id === M.to);
    return `<div class="ov" data-act="ehxmvno"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>In anderen Raum stellen</b><span>${esc(this._ehName(r))} steht in ${esc(r.name)}</span></div><button class="ibtn" data-act="ehxmvno" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="ehrooms">${rooms.map((x) => { const t = this._ehRoomTemp(x), here = x.id === r.id, dis = here || !!x.htr; return `<button class="ehroom${M.to === x.id ? " sel" : ""}" data-act="ehxmvto" data-k="${esc(x.id)}" ${dis ? "disabled" : ""}>${this._rkMiniById(x.id)}<span><b>${esc(x.name)}</b><small>${here ? "steht jetzt hier" : x.htr ? "hat schon einen Heizer" : "kein Heizer"}</small></span>${t.cur != null ? `<em>${num(t.cur, 1)}°</em>` : ""}</button>`; }).join("")}</div>
      ${to ? `<div class="of"><div class="ol"><b>Heizen bis</b><small>Vorschlag aus ${esc(to.name)}</small></div><div class="oc"><div class="lfstep"><button class="ibtn" data-act="ehxmvt" data-v="-0.5" aria-label="weniger">${ic("minus", 16)}</button><b>${num(M.target, 1)}<small> °C</small></b><button class="ibtn" data-act="ehxmvt" data-v="0.5" aria-label="mehr">${ic("plus", 16)}</button></div></div></div>
        <div class="gst on">${ic("info", 15)}${r.htr.thermo_aus ? `Thermostate in ${esc(r.name)} laufen wieder normal. In ${esc(to.name)} werden sie abgestellt, solange er heizt.` : `Die Thermostate laufen in beiden Räumen weiter.`} Der Schalter „Elektroheizer aktiv“ gehört danach zu ${esc(to.name)}.</div>` : `<div class="mut sm" style="margin:8px 0 0">Wähle den Raum, in dem der Heizer jetzt steht.</div>`}
      ${M.err ? `<div class="gbox" style="margin-top:10px">${esc(M.err)}</div>` : ""}
      <div class="foot2"><button class="btn2" data-act="ehxmvno">Abbrechen</button><button class="btn2 pri" data-act="ehxmvok" ${to && !M.busy ? "" : "disabled"}>${M.busy ? "Stellt um …" : "Umstellen"}</button></div></div>`;
  }
  async _ehCall(msg, ok) {
    try { this._ehD = await this._hass.callWS(msg); if (ok) this._toast(ok); return true; }
    catch (e) { this._toast((e && e.message) || "Nicht möglich"); return false; }
  }
  _ehAct3(a, b) {
    const M = this._modal, id = b.dataset.id || (M && M.id) || "";
    if (a === "ehxlist") { this._ehListOpen(M && M.type === "fh" ? M : null); return true; }
    if (a === "ehxlback") { this._modal = (M && M.back) || null; this._renderModal(); return true; }
    if (a === "ehxdev") { this._modal = { type: "rkhtr", id }; this._renderModal(); this._ehLoad(); return true; }
    if (a === "ehxedit") { this._ehEditOpen(id); return true; }
    if (a === "ehxmove") { this._modal = { type: "ehmove", id, to: "", target: 21, back: M, busy: false, err: "" }; this._renderModal(); return true; }
    if (a === "ehxpause") {
      const r = this._ehRooms().find((x) => x.id === id), e = this._ehOf(id); if (!r || !e) { this._ehLoad(); return true; }
      const pause = !this._ehPaused(r);
      this._ehCall({ type: "fenster_heizung/heizer_update", hid: e.id, heater: { paused: pause } }, pause ? `„${e.name}“ pausiert` : `„${e.name}“ heizt wieder ${this._ehModeText(e.mode)}`).then(() => this._renderModal());
      return true;
    }
    if (!M || M.type !== "ehmove") return false;
    M.err = "";
    if (a === "ehxmvno") { this._modal = M.back; this._renderModal(); return true; }
    if (a === "ehxmvto") { M.to = b.dataset.k; const t = this._ehRoomTemp(this._ehRooms().find((x) => x.id === M.to) || {}).ziel; M.target = t != null && isFinite(t) ? Math.round(t * 2) / 2 : Number((this._ehOf(M.id) || {}).target) || 21; }
    else if (a === "ehxmvt") M.target = Math.round(Math.min(30, Math.max(10, M.target + parseFloat(b.dataset.v))) * 10) / 10;
    else if (a === "ehxmvok") {
      const e = this._ehOf(M.id), to = this._ehRooms().find((x) => x.id === M.to); if (!e || !to || M.busy) return true;
      M.busy = true; this._renderModal();
      this._hass.callWS({ type: "fenster_heizung/heizer_update", hid: e.id, heater: { room: M.to, target: M.target } })
        .then((r) => { this._ehD = r; this._modal = null; this._renderModal(); this._render(); this._toast(`„${e.name}“ steht jetzt in ${to.name}`); })
        .catch((err) => { M.busy = false; M.err = (err && err.message) || "Umstellen fehlgeschlagen"; this._renderModal(); });
      return true;
    }
    this._renderModal(); return true;
  }
  /* ---------- Build 4: Leistung messen, Testlauf, Entfernen mit Rückgängig, Papierkorb ---------- */
  _ehPwSensors() {
    const st = this._hass.states;
    return Object.keys(st).filter((e) => e.startsWith("sensor.") && (st[e].attributes.device_class === "power" || /^k?W$/.test(st[e].attributes.unit_of_measurement || "")));
  }
  _ehW(eid) { const x = this._hass.states[eid]; if (!x) return null; const v = parseFloat(x.state); if (!isFinite(v)) return null; return x.attributes.unit_of_measurement === "kW" ? v * 1000 : v; }
  _ehMeasBox(d) {
    const M = this._modal, mz = M.meas, now = d.pw ? this._ehW(d.pw) : null, n = (d.meas || []).length;
    const base = (d.entity || "").replace(/^switch\./, "").replace(/_(schalter|switch|steckdose|plug|socket)$/, "");
    const hint = new RegExp(base.split("_").filter((x) => x.length > 3).join("|") || "steckdose|plug|leistung|power", "i");
    const pct = mz ? Math.min(100, Math.round(((Date.now() - mz.t0) / 30000) * 100)) : 0;
    return `<div class="lsec">${ic("chart", 15)}Leistungssensor der Steckdose</div>
      ${this._wzSel(this._ehPwSensors(), d.pw || "", "ehxpw", `data-k="pw"`, "– Sensor wählen –", hint)}
      ${d.pw ? `<div class="ehmeter${mz ? " run" : ""}"><i style="width:${mz ? pct : 0}%"></i><span>${now != null ? wfmt(Math.max(0, now)) : "kein Wert"}${mz ? ` · misst ${Math.max(0, 30 - Math.round((Date.now() - mz.t0) / 1000))} s` : ""}</span></div>
        <div class="mut sm" style="margin:0 0 6px">${n ? `Stell den Heizer am Gerät auf die nächste Stufe und miss erneut.` : `Stell den Heizer am Gerät auf die kleinste Stufe (oder seine einzige) und tippe „Messen“. Er läuft dafür 30 Sekunden.`}</div>
        ${n ? `<div class="stpv">${(d.meas || []).map((w, i) => `<span><b>${i + 1}</b>${wfmt(w)}<button class="ehx" data-act="ehxmdel" data-i="${i}" aria-label="Messung ${i + 1} entfernen">${ic("close", 12)}</button></span>`).join("")}</div>` : ""}
        <button class="btn2 ${n ? "" : "pri"}" data-act="ehxmeas" style="width:100%" ${mz || n >= 8 ? "disabled" : ""}>${ic("play", 15)} ${mz ? "Misst …" : n ? `Stufe ${n + 1} messen` : "Messen"}</button>` : `<div class="mut sm" style="margin:6px 0 0">Ohne Leistungssensor bitte „Vorlage“ oder „Eigene Werte“ nehmen.</div>`}`;
  }
  async _ehTestRun(entity, seconds) {
    try { await this._hass.callWS({ type: "fenster_heizung/heizer_test", entity, seconds }); return true; }
    catch (e) { this._toast((e && e.message) || "Testlauf nicht möglich"); return false; }
  }
  _ehTick() { clearInterval(this._ehT); this._ehT = setInterval(() => { const M = this._modal; if (!M || M.type !== "ehwiz") { this._ehStopTick(); return; } const busy = (M.meas) || (M.testUntil && M.testUntil > Date.now() - 1000); if (!busy) { this._ehStopTick(); } this._renderModal(); }, 1000); }
  _ehStopTick() { clearInterval(this._ehT); this._ehT = null; }
  async _ehMeasure() {
    const M = this._modal, d = M.d; if (!d.pw || M.meas) return;
    if (!(await this._ehTestRun(d.entity, 32))) return;
    M.meas = { t0: Date.now(), vals: [] }; this._ehTick();
    const sample = setInterval(() => {
      const cur = this._modal; if (!cur || cur !== M) { clearInterval(sample); return; }
      const v = this._ehW(d.pw), age = Date.now() - M.meas.t0;
      if (v != null && age > 8000) M.meas.vals.push(v);   /* die ersten Sekunden: Gerät heizt erst an */
      if (age >= 30000) {
        clearInterval(sample);
        const vs = M.meas.vals.filter((x) => x > 20).sort((a, b) => a - b), med = vs.length ? vs[Math.floor(vs.length / 2)] : null;
        M.meas = null;
        if (med == null) { M.err = "Keine Leistung gemessen. Ist der Heizer am Gerät eingeschaltet und der richtige Sensor gewählt?"; }
        else { d.meas = [...(d.meas || []), Math.round(med)]; this._toast(`Gemessen: ${wfmt(Math.round(med))}`); }
        this._renderModal();
      }
    }, 1000);
  }
  /* Entfernen */
  _ehDelModal() {
    const M = this._modal, r = this._ehRooms().find((x) => x.id === M.id), e = this._ehOf(M.id); if (!r || !r.htr) return "";
    const h = r.htr, kwh = Number(h.heute_kwh) || 0, days = Object.keys(h.verlauf || {}).length, line = (l, v) => `<div class="of"><div class="ol"><b>${l}</b></div><div class="oc"><b>${v}</b></div></div>`;
    return `<div class="ov" data-act="ehxdelno"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>${esc(this._ehName(r))} entfernen?</b><span>${esc(r.name)}</span></div><button class="ibtn" data-act="ehxdelno" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="mut sm" style="margin:0 0 6px">Das passiert:</div>
      ${line("Heizer", h.stufe > 0 ? "wird sofort ausgeschaltet" : "bleibt aus")}
      ${line(`Thermostate in ${esc(r.name)}`, h.thermo_aktiv ? "laufen wieder normal" : "unverändert")}
      ${line("Schalter „Elektroheizer aktiv“", "wird entfernt")}
      ${line("Gerät in Home Assistant", "bleibt")}
      ${e && e.autos ? `<div class="gbox" style="margin:8px 0">${ic("info", 14)} ${e.autos} ${e.autos === 1 ? "Automation nutzt" : "Automationen nutzen"} den Schalter „Elektroheizer aktiv“. Sie ${e.autos === 1 ? "findet" : "finden"} ihn danach nicht mehr.</div>` : ""}
      <div class="lsec">${ic("chart", 15)}Statistik${kwh || days ? ` (${num(kwh, 1)} kWh heute${days ? `, Verlauf ${days} Tage` : ""})` : ""}</div>
      <div class="seg oseg"><button class="${M.keep ? "sel" : ""}" data-act="ehxkeep" data-v="1">Behalten</button><button class="${!M.keep ? "sel" : ""}" data-act="ehxkeep" data-v="0">Löschen</button></div>
      <div class="mut sm" style="margin:6px 0 0">Der Heizer bleibt 30 Tage im Papierkorb (Modul 1 · Einstellungen › Geräte › Elektroheizer) und lässt sich dort wiederherstellen${M.keep ? " – mit Statistik" : ""}.</div>
      <div class="foot2"><button class="btn2" data-act="ehxdelno">Abbrechen</button><button class="btn2 dng" data-act="ehxdelok" ${M.busy || !e ? "disabled" : ""}>${M.busy ? "Entfernt …" : "Entfernen"}</button></div></div>`;
  }
  _ehUndoToast(msg, hid) {
    const t = this.shadowRoot.getElementById("toast"); if (!t) return;
    t.innerHTML = `<div class="toast ehundo"><span>${esc(msg)}</span><button data-act="ehxundo" data-k="${esc(hid)}">Rückgängig</button></div>`; clearTimeout(this._tt);
    this._tt = setTimeout(() => (t.innerHTML = ""), 10000);
  }
  /* Papierkorb in der Liste */
  _ehTrashBlock() {
    const T = (this._ehD && this._ehD.trash) || [], M = this._modal, adm = this._admin(); if (!T.length || !adm) return "";
    const left = (t) => Math.max(1, 30 - Math.floor((Date.now() / 1000 - (t.removed || 0)) / 86400)), why = { removed: "entfernt", off: "ausgeschaltet", migrated: "aus älterer Version", room_deleted: "Raum gelöscht" };
    return `<div class="lsec">${ic("trash", 15)}Zuletzt entfernt</div><div class="fhs">${T.map((t) => `<div class="ehtr"><span class="sxi">${ic("bolt", 18)}</span><span class="sxt"><b>${esc(t.name)}</b><small>${esc(t.room_name || "Raum unbekannt")} · ${why[t.reason] || "entfernt"} am ${new Date((t.removed || 0) * 1000).toLocaleDateString("de-DE")}${t.has_stats ? " · mit Statistik" : ""}</small></span><em class="sxc">noch ${left(t)} T.</em>
      <span class="ehtrb">${M.purge === t.id ? `<button class="btn2 sm" data-act="ehxpurgeno">Behalten</button><button class="btn2 sm dng" data-act="ehxpurgeok" data-k="${esc(t.id)}">Endgültig löschen</button>` : `<button class="btn2 sm" data-act="ehxpurge" data-k="${esc(t.id)}">Löschen</button><button class="btn2 sm pri" data-act="ehxrest" data-k="${esc(t.id)}">Wiederherstellen</button>`}</span></div>`).join("")}</div>`;
  }
  _ehRestModal() {
    const M = this._modal, t = ((this._ehD && this._ehD.trash) || []).find((x) => x.id === M.tid); if (!t) return "";
    const rooms = this._ehRooms();
    return `<div class="ov" data-act="ehxrestno"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Wohin mit ${esc(t.name)}?</b><span>${esc(t.room_name || "Der alte Raum")} ist nicht frei</span></div><button class="ibtn" data-act="ehxrestno" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="ehrooms">${rooms.map((x) => `<button class="ehroom${M.to === x.id ? " sel" : ""}" data-act="ehxrestto" data-k="${esc(x.id)}" ${x.htr ? "disabled" : ""}>${this._rkMiniById(x.id)}<span><b>${esc(x.name)}</b><small>${x.htr ? "hat schon einen Heizer" : "kein Heizer"}</small></span></button>`).join("")}</div>
      ${M.err ? `<div class="gbox" style="margin-top:10px">${esc(M.err)}</div>` : ""}
      <div class="foot2"><button class="btn2" data-act="ehxrestno">Abbrechen</button><button class="btn2 pri" data-act="ehxrestok" ${M.to && !M.busy ? "" : "disabled"}>Wiederherstellen</button></div></div>`;
  }
  async _ehRestore(tid, room) {
    try {
      this._ehD = await this._hass.callWS({ type: "fenster_heizung/heizer_restore", hid: tid, ...(room ? { room } : {}) });
      const h = (this._ehD.heaters || []).find((x) => x.id === tid);
      this._toast(`„${h ? h.name : "Heizer"}“ ist wieder da${h && h.room_name ? " in " + h.room_name : ""}`); return true;
    } catch (e) { this._toast((e && e.message) || "Wiederherstellen fehlgeschlagen"); return false; }
  }
  _ehAct4(a, b) {
    const M = this._modal;
    if (a === "ehxundo") { const t = this.shadowRoot.getElementById("toast"); if (t) t.innerHTML = ""; this._ehRestore(b.dataset.k).then(() => { this._render(); this._renderModal(); }); return true; }
    if (a === "ehxdel") { this._modal = { type: "ehdel", id: b.dataset.id || (M && M.id), keep: true, back: M && M.back, busy: false }; this._renderModal(); this._ehLoad(); return true; }
    if (a === "ehxrest") {
      const tid = b.dataset.k, t = ((this._ehD && this._ehD.trash) || []).find((x) => x.id === tid), r = t && this._ehRooms().find((x) => x.id === t.room);
      if (r && !r.htr) { this._ehRestore(tid).then(() => { this._render(); this._renderModal(); }); }
      else { this._modal = { type: "ehrest", tid, to: "", back: M, busy: false, err: "" }; this._renderModal(); }
      return true;
    }
    if (a === "ehxpurge") { if (M) { M.purge = b.dataset.k; this._renderModal(); } return true; }
    if (a === "ehxpurgeno") { if (M) { M.purge = ""; this._renderModal(); } return true; }
    if (a === "ehxpurgeok") { this._hass.callWS({ type: "fenster_heizung/heizer_purge", hid: b.dataset.k }).then((r) => { this._ehD = r; if (this._modal) this._modal.purge = ""; this._renderModal(); this._toast("Endgültig gelöscht"); }).catch(() => this._toast("Löschen fehlgeschlagen")); return true; }
    if (M && M.type === "ehrest") {
      if (a === "ehxrestno") { this._modal = M.back; this._renderModal(); return true; }
      if (a === "ehxrestto") { M.to = b.dataset.k; M.err = ""; this._renderModal(); return true; }
      if (a === "ehxrestok") { M.busy = true; this._renderModal(); this._ehRestore(M.tid, M.to).then((ok) => { if (ok) { this._modal = M.back; this._render(); } else M.busy = false; this._renderModal(); }); return true; }
    }
    if (M && M.type === "ehdel") {
      if (a === "ehxdelno") { this._modal = { type: "rkhtr", id: M.id, back: M.back }; this._renderModal(); return true; }
      if (a === "ehxkeep") { M.keep = b.dataset.v === "1"; this._renderModal(); return true; }
      if (a === "ehxdelok") {
        const e = this._ehOf(M.id); if (!e || M.busy) return true;
        M.busy = true; this._renderModal();
        this._hass.callWS({ type: "fenster_heizung/heizer_remove", hid: e.id, keep_stats: M.keep })
          .then((r) => { this._ehD = r; this._modal = M.back && M.back.type === "ehlist" ? M.back : null; this._renderModal(); this._render(); this._ehUndoToast(`„${e.name}“ entfernt`, e.id); })
          .catch((err) => { M.busy = false; this._renderModal(); this._toast((err && err.message) || "Entfernen fehlgeschlagen"); });
        return true;
      }
    }
    return false;
  }
