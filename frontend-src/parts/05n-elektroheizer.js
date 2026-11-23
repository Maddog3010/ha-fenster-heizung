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
      d: { room: r ? r.id : "", entity: "", name: "", tpl: "oel", steps: [800, 1200, 2000], txt: "", target: z != null && isFinite(z) ? Math.round(z * 2) / 2 : 21, thermo: "off", auto: "on", prio: 5, from: "", to: "", more: false } };
    this._renderModal();
    try { this._ehD = await this._hass.callWS({ type: "fenster_heizung/heizer_get" }); } catch (_) { this._ehD = null; }
    if (this._modal && this._modal.type === "ehwiz") this._renderModal();
  }
  _ehSteps(d) { return d.tpl === "own" ? String(d.txt || "").split(/[^0-9]+/).map(Number).filter((w) => w >= 50 && w <= 10000).slice(0, 8).sort((a, b) => a - b) : d.steps; }
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
      body = `<h3 class="wzt">Welches Gerät?</h3><div class="mut sm" style="margin:-4px 0 8px">Ein Schalter (z. B. die Steckdose des Heizers) oder ein Klima-Gerät. Modul 1 schaltet es nur bei genug PV-Überschuss ein.</div>
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
      body = `<h3 class="wzt">Wie viel Leistung?</h3><div class="mut sm" style="margin:-4px 0 8px">Nach der Leistung entscheidet Modul 1, ob der Überschuss reicht. Hat der Heizer Stufen, wird bei mehr Überschuss höher geschaltet.</div>
        <div class="lfkind">${S.EH_TPL.map(([k, l, w, i]) => `<button class="${d.tpl === k ? "sel" : ""}" data-act="ehxtpl" data-k="${k}"><b>${ic(i, 14)} ${l}</b><span>${w.length > 1 ? w.map((x) => num(x, 0)).join(" · ") + " W" : `eine Stufe, ${num(w[0], 0)} W`}</span></button>`).join("")}
        <button class="${d.tpl === "own" ? "sel" : ""}" data-act="ehxtpl" data-k="own"><b>${ic("pencil", 14)} Eigene Werte</b><span>Leistung laut Typenschild, Stufen mit Komma trennen</span></button></div>
        ${d.tpl === "own" ? `<div class="lsec">${ic("bolt", 15)}Leistungsstufen in Watt</div><input class="otxt" type="text" inputmode="numeric" data-f="ehxtxt" value="${esc(d.txt)}" placeholder="z. B. 800, 1200, 1800 oder 1500" aria-label="Leistungsstufen in Watt">` : ""}
        ${W.length ? `<div class="stpv" style="margin-top:10px">${W.map((w, i) => `<span><b>${i + 1}</b>${wfmt(w)}</span>`).join("")}</div>` : `<div class="mut sm" style="margin-top:8px">Mindestens eine Leistung zwischen 50 und 10 000 W eingeben.</div>`}
        ${cl ? `<div class="gst">${ic("info", 15)}${pm.length ? `Klima-Gerät mit ${pm.length} Voreinstellungen: Die Stufen werden ihnen automatisch zugeordnet, ändern kannst du das in den Raumeinstellungen.` : "Klima-Gerät ohne Voreinstellungen: Modul 1 schaltet nur ein und aus (höchste Stufe)."}</div>` : W.length > 1 ? `<div class="gst">${ic("info", 15)}Eine Steckdose kennt nur Ein und Aus: Modul 1 rechnet mit der höchsten Stufe. Stell den Heizer am Gerät auf diese Stufe.</div>` : ""}`;
    } else {
      if (!d.name) d.name = this._wzName(d.entity) || "Elektroheizer";
      ok = !!d.name.trim() && (!d.from === !d.to);
      body = `<h3 class="wzt">${M.edit ? "Regeln" : "Fast fertig"}</h3>
        <div class="lsec">${ic("pencil", 15)}Name</div><input class="otxt" type="text" maxlength="40" data-f="ehxname" value="${esc(d.name)}" aria-label="Name des Heizers">
        <div class="ehsum"><span>${ic("bolt", 15)}<b>${esc(this._wzName(d.entity))}</b></span><span>${ic("home", 15)}<b>${esc(room ? room.name : "–")}</b></span><span>${ic("flame", 15)}<b>${W.map((w) => num(w, 0)).join(" · ")} W</b></span></div>
        ${row("Heizen bis", "Der Heizer schaltet ab, sobald der Raum so warm ist.", step("target", "°C", 0.5, 10, 30, 1))}
        ${row("Thermostate, solange er heizt", "Ausschalten: Die Heizkörper des Raums ruhen, danach regeln sie wieder.", seg("thermo", [["off", "Ausschalten"], ["on", "Weiterlaufen"]]))}
        ${W.length > 1 && d.entity.startsWith("climate.") ? row("Stufen regeln", "Automatisch: höhere Stufe bei mehr Überschuss.", seg("auto", [["on", "Automatisch"], ["off", "Fest"]])) : ""}
        <button class="lnk" data-act="ehxmore" style="margin:8px 0 4px">${ic("chev", 14)} ${d.more ? "Weniger" : "Mehr Einstellungen (Priorität, Zeitfenster)"}</button>
        ${d.more ? row("Priorität", "1 wird zuerst versorgt, wenn der Überschuss nicht für alle reicht.", step("prio", "", 1, 1, 9)) + row("Erlaubt ab", "Optional. Leer = ganztägig.", tin("from", "Erlaubt ab")) + row("Erlaubt bis", "", tin("to", "Erlaubt bis")) + (d.from || d.to ? `<button class="lnk" data-act="ehxnotime">Zeitfenster entfernen</button>` : "") : ""}
        <div class="gst on">${ic("sun", 15)}${this._pvNow() != null ? `Heizt nur mit PV-Überschuss. Gerade frei: ${wfmt(Math.max(0, this._pvNow()))}${this._pvNow() >= Math.min(...W) ? " – er könnte gleich starten." : "."}` : "Heizt nur mit PV-Überschuss. Den Netz-Sensor wählst du unter Haus › Energiequellen."}</div>`;
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
    if (f === "ehxe") { d.entity = t.value || ""; d.name = ""; this._renderModal(); return true; }
    if (f === "ehxname") { d.name = t.value; return true; }
    if (f === "ehxtxt") { d.txt = t.value; this._renderModal(); return true; }
    if (f === "ehxt") { if (/^\d\d:\d\d$/.test(t.value)) d[t.dataset.k] = t.value; this._renderModal(); return true; }
    return false;
  }
  _ehAct(a, b) {
    if (a === "ehxnew") { this._ehOpen(b.dataset.id || ""); return; }
    if (this._ehAct3(a, b)) return;
    const M = this._modal; if (!M || M.type !== "ehwiz") return;
    const d = M.d, steps = this._ehStepList(M), pos = steps.indexOf(M.step);
    M.err = "";
    if (a === "ehxcancel") { this._pkId = null; this._modal = M.back; this._renderModal(); return; }
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
    this._renderModal();
  }
  async _ehSave() {
    const M = this._modal, d = M.d, W = this._ehSteps(d); if (M.busy) return;
    M.busy = true; this._renderModal();
    const heater = { room: d.room, entity: d.entity, name: d.name.trim(), steps: W, watt: Math.max(...W), target: d.target, thermo: d.thermo, auto: d.auto, prio: d.prio, from: d.from || null, to: d.to || null };
    if (M.edit) { delete heater.room; delete heater.entity; }
    try {
      const r = M.edit ? await this._hass.callWS({ type: "fenster_heizung/heizer_update", id: M.edit, heater }) : await this._hass.callWS({ type: "fenster_heizung/heizer_add", heater });
      if (M.edit) { this._ehD = r; this._modal = M.back; this._renderModal(); this._render(); this._toast(`„${heater.name}“ gespeichert`); return; }
      this._ehD = r; this._modal = M.back && (M.back.type === "fh" || M.back.type === "ehlist") ? M.back : null;  /* Raumdialog nicht zurückholen: sein Entwurf kennt den Heizer noch nicht */ this._renderModal(); this._render();
      this._toast(`„${heater.name}“ eingerichtet – heizt mit PV-Überschuss`);
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
    const txt = n === 1 ? `${esc(this._ehName(hs[0]))} · ${esc(hs[0].name)} · nur mit PV-Überschuss` : n ? `${n} Geräte: ${esc(hs.map((r) => this._ehName(r)).join(", "))}` : "Heizer mit PV-Überschuss einbinden";
    return `<button class="sxrow" data-act="ehxlist"><span class="sxi">${ic("bolt", 20)}</span><span class="sxt"><b>Elektroheizer</b><small>${txt}</small></span><em class="sxc ${n ? "ok" : ""}">${n ? "Eingerichtet" : "Neu"}</em><span class="sxg">${ic("chev", 16)}</span></button>`;
  }
  _ehListModal() {
    const M = this._modal, rooms = this._ehRooms(), hs = rooms.filter((r) => r.htr).sort((a, b) => ((a.htr.prio || 5) - (b.htr.prio || 5)) || a.name.localeCompare(b.name, "de")), adm = this._admin();
    const rows = hs.map((r) => { const h = r.htr, on = h.status === "pv", ps = this._ehPaused(r), st = stepsOf(h); return `<button class="sxrow" data-act="rkhtr" data-id="${esc(r.id)}"><span class="sxi">${ic("bolt", 20)}</span><span class="sxt"><b>${esc(this._ehName(r))}</b><small>${esc(r.name)} · ${st.length > 1 ? `${st.length} Stufen bis ${wfmt(Math.max(...st))}` : wfmt(h.watt)}</small></span><em class="sxc ${on ? "ok" : ps ? "off" : ""}">${ps ? "pausiert" : on ? "☀ " + wfmt(h.watt_now) : "wartet"}</em><span class="sxg">${ic("chev", 16)}</span></button>`; }).join("");
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>${M.back ? `<button class="lnk ehbk" data-act="ehxlback" aria-label="Zurück">‹</button>` : ""}Elektroheizer</b><span>Modul 1 · Geräte · ${hs.length ? `${hs.length} ${hs.length === 1 ? "Heizer" : "Heizer"}` : "noch keiner eingerichtet"}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("bolt", 15)}Deine Heizer</div>
      <div class="fhs"><div class="sxl">${rows || `<div class="mut sm" style="padding:12px 14px">Noch kein Elektroheizer eingerichtet.</div>`}</div>
      ${adm && rooms.some((r) => !r.htr) ? `<div style="padding:0 12px 12px"><button class="btn2 pri" data-act="ehxnew" style="width:100%">${ic("plus", 16)} Elektroheizer hinzufügen</button></div>` : ""}</div>
      ${this._ehPvRules()}
      <div class="foot2">${M.back ? `<button class="btn2" data-act="ehxlback">Zurück</button>` : ""}<button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  /* PV-Regeln für alle Heizer (bis Build 2 im Reiter „Elektroheizer“) */
  _ehPvRules() {
    const pv = this._pv(), pvn = this._pvNow(), rp = this._rate("price"), rf = this._rate("feed");
    const n = (k, l, u, h, lo, hi, st) => `<div class="of"><div class="ol"><b>${l}</b><span>${h}</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="gpvn" data-k="${k}" value="${pv[k]}" min="${lo}" max="${hi}" step="${st}"><i>${u}</i></span></div></div>`;
    return `<div class="lsec">${ic("sun", 15)}PV-Regeln für alle Heizer</div><div class="fhs open fhst"><div class="sxrow stinfo"><span class="sxi">${ic("bolt", 20)}</span><span class="sxt"><b>PV-Überschuss für Elektroheizer${this._stHelpBtn("general.pv.reserve")}</b><small>${pv.sensor ? (pvn != null ? `${wfmt(pvn)} Überschuss, ${wfmt(this._htrTotal())} an Heizer verteilt.` : "Sensor gewählt, noch kein Wert.") : "Noch kein Sensor für die Einspeisung gewählt."}</small></span><em class="sxc ${pv.sensor ? "ok" : ""}">${pv.sensor ? "Eingerichtet" : "Offen"}</em></div><div class="fhb">
      <div class="mut sm" style="margin:2px 0 4px">Elektroheizer heizen nur bei genug Überschuss. Diese Regeln gelten für alle Heizer.</div>
      <div class="hslk">${this._hsLink("en", `Netz ${pv.sensor ? esc(this._wzName(pv.sensor)) + (pv.sign === "import" ? " (Bezug positiv)" : " (Einspeisung positiv)") : "noch nicht gewählt"}${pv.soc_sensor ? " · Ladestand " + esc(this._wzName(pv.soc_sensor)) : ""}`)}</div>
      ${n("reserve", "Reserve", "W", "Bleibt zusätzlich zur Heizerleistung übrig.", 0, 2000, 50)}${n("delay", "Einschalten nach", "Min.", "So lange muss der Überschuss anliegen.", 0, 30, 1)}${n("minrun", "Mindestlaufzeit", "Min.", "Kürzer läuft ein Heizer nicht an einem Stück.", 0, 120, 5)}
      ${pv.soc_sensor ? n("soc_min", "Heizer erst ab", "%", "Die Batterie wird zuerst geladen.", 0, 100, 5) : ""}
      <div class="gst ${pvn != null ? "on" : ""}">${ic(pvn != null ? "bolt" : "info", 15)}${pvn != null ? `Aktuell ${wfmt(pvn)} Überschuss, ${wfmt(this._htrTotal())} an Heizer verteilt.` : "Noch kein Sensor gewählt."}</div></div></div>
      <div class="hslk">${this._hsLink("pr", `Bezug ${num(rp, 2)} ct/kWh, Einspeisung ${num(rf, 2)} ct/kWh`)}</div>`;
  }
  /* Geräte-Blatt eines Heizers (Raumkarte, Liste) */
  _ehDevSheet(r) {
    const adm = this._admin(), h = r.htr, on = h && h.status === "pv", ps = this._ehPaused(r), e = this._ehOf(r.id), st = h ? stepsOf(h) : [];
    if (!h) return "";
    const it = (act, icon, t, sub, cls = "") => `<button class="rk2mi ${cls}" data-act="${act}" data-id="${esc(r.id)}">${ic(icon, 20)}<span><b>${t}</b><small>${sub}</small></span>${ic("chev", 16)}</button>`;
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>${esc(this._ehName(r))}</b><span>${esc(r.name)} · ${esc((h.entity || "").split(".")[0] === "climate" ? "Klima-Gerät" : "Schalter")}${ps ? " · pausiert" : ""}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="rk2sht">${this._gx("heater", 64, { stage: on ? Math.min(3, h.stufe || 2) : 0, on })}</div>${this._htrBox(r)}
      ${adm ? `<div class="rk2menu" style="margin-top:10px">
        ${it("ehxedit", "pencil", "Bearbeiten", `Name, Leistung${st.length > 1 ? ` (${st.length} Stufen)` : ""}, Heizen bis, Zeitfenster`)}
        ${it("ehxmove", "home", "In anderen Raum stellen", "Statistik und Einstellungen ziehen mit")}
        ${it("ehxpause", ps ? "play" : "pause", ps ? "Fortsetzen" : "Pausieren", ps ? "Heizt wieder mit PV-Überschuss" : "Bleibt eingerichtet, heizt nicht")}
        ${it("hrep", "chart", "Bericht", "Überschuss, Stufen und Raumtemperatur eines Tages")}</div>` : ""}
      ${e ? "" : `<div class="mut sm" style="margin:8px 0 0">Wird geladen …</div>`}
      <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _ehEditOpen(room) {
    const r = this._ehRooms().find((x) => x.id === room), e = this._ehOf(room); if (!r || !r.htr || !e) { this._toast("Heizer wird noch geladen"); this._ehLoad(); return; }
    const S = this.constructor, st = (e.steps && e.steps.length ? e.steps : [e.watt || 1500]), T = S.EH_TPL.find((x) => x[2].join() === st.join());
    this._pkId = null;
    this._modal = { type: "ehwiz", step: 3, fixed: true, edit: e.id, back: this._modal, busy: false, err: "",
      d: { room, entity: e.entity, name: e.name, tpl: T ? T[0] : "own", steps: T ? T[2] : st, txt: st.join(", "), target: Number(e.target) || 21, thermo: e.thermo === "on" ? "on" : "off", auto: e.auto === "off" ? "off" : "on", prio: Number(e.prio) || 5, from: (e.from || "").slice(0, 5), to: (e.to || "").slice(0, 5), more: !!(e.from || Number(e.prio) !== 5) } };
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
      this._ehCall({ type: "fenster_heizung/heizer_update", id: e.id, heater: { paused: pause } }, pause ? `„${e.name}“ pausiert` : `„${e.name}“ heizt wieder mit PV-Überschuss`).then(() => this._renderModal());
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
      this._hass.callWS({ type: "fenster_heizung/heizer_update", id: e.id, heater: { room: M.to, target: M.target } })
        .then((r) => { this._ehD = r; this._modal = null; this._renderModal(); this._render(); this._toast(`„${e.name}“ steht jetzt in ${to.name}`); })
        .catch((err) => { M.busy = false; M.err = (err && err.message) || "Umstellen fehlgeschlagen"; this._renderModal(); });
      return true;
    }
    this._renderModal(); return true;
  }
