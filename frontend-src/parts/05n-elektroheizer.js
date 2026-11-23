  /* ================= Modul 1 · Elektroheizer 2.0 (Build 2): Einrichtungs-Assistent =================
     Vier Schritte statt zwölf Felder: 1 Gerät · 2 Raum · 3 Leistung · 4 Fertig. Kommt man aus einem Raum (Raumkarte „⋯“,
     Raumeinstellungen), ist der Raum gesetzt und Schritt 2 entfällt. Speichern über fenster_heizung/heizer_add (heizer.py).
     Einstiege: Raumkarte „⋯“, Modul-1-Einstellungen (Reiter „Elektroheizer“), Grundriss (Gerät „Mobiler Heizer“), Raumeinstellungen.
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
    const steps = M.fixed ? [1, 3, 4] : [1, 2, 3, 4], pos = steps.indexOf(M.step), last = pos === steps.length - 1;
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
      body = `<h3 class="wzt">Fast fertig</h3>
        <div class="lsec">${ic("pencil", 15)}Name</div><input class="otxt" type="text" maxlength="40" data-f="ehxname" value="${esc(d.name)}" aria-label="Name des Heizers">
        <div class="ehsum"><span>${ic("bolt", 15)}<b>${esc(this._wzName(d.entity))}</b></span><span>${ic("home", 15)}<b>${esc(room ? room.name : "–")}</b></span><span>${ic("flame", 15)}<b>${W.map((w) => num(w, 0)).join(" · ")} W</b></span></div>
        ${row("Heizen bis", "Der Heizer schaltet ab, sobald der Raum so warm ist.", step("target", "°C", 0.5, 10, 30, 1))}
        ${row("Thermostate, solange er heizt", "Ausschalten: Die Heizkörper des Raums ruhen, danach regeln sie wieder.", seg("thermo", [["off", "Ausschalten"], ["on", "Weiterlaufen"]]))}
        ${W.length > 1 && d.entity.startsWith("climate.") ? row("Stufen regeln", "Automatisch: höhere Stufe bei mehr Überschuss.", seg("auto", [["on", "Automatisch"], ["off", "Fest"]])) : ""}
        <button class="lnk" data-act="ehxmore" style="margin:8px 0 4px">${ic("chev", 14)} ${d.more ? "Weniger" : "Mehr Einstellungen (Priorität, Zeitfenster)"}</button>
        ${d.more ? row("Priorität", "1 wird zuerst versorgt, wenn der Überschuss nicht für alle reicht.", step("prio", "", 1, 1, 9)) + row("Erlaubt ab", "Optional. Leer = ganztägig.", tin("from", "Erlaubt ab")) + row("Erlaubt bis", "", tin("to", "Erlaubt bis")) + (d.from || d.to ? `<button class="lnk" data-act="ehxnotime">Zeitfenster entfernen</button>` : "") : ""}
        <div class="gst on">${ic("sun", 15)}${this._pvNow() != null ? `Heizt nur mit PV-Überschuss. Gerade frei: ${wfmt(Math.max(0, this._pvNow()))}${this._pvNow() >= Math.min(...W) ? " – er könnte gleich starten." : "."}` : "Heizt nur mit PV-Überschuss. Den Netz-Sensor wählst du unter Haus › Energiequellen."}</div>`;
    }
    return `<div class="ov" data-act="ehxcancel"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Elektroheizer hinzufügen">
      <div class="sh"><div><b>Elektroheizer hinzufügen</b><span>Schritt ${pos + 1} von ${steps.length}${room && M.fixed ? " · " + esc(room.name) : ""}</span></div><button class="ibtn" data-act="ehxcancel" aria-label="Schließen">${ic("close", 20)}</button></div>
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
    const M = this._modal; if (!M || M.type !== "ehwiz") return;
    const d = M.d, steps = M.fixed ? [1, 3, 4] : [1, 2, 3, 4], pos = steps.indexOf(M.step);
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
    try {
      const r = await this._hass.callWS({ type: "fenster_heizung/heizer_add", heater });
      this._ehD = r; this._modal = M.back && M.back.type === "fh" ? M.back : null;  /* Raumdialog nicht zurückholen: sein Entwurf kennt den Heizer noch nicht */ this._renderModal(); this._render();
      this._toast(`„${heater.name}“ eingerichtet – heizt mit PV-Überschuss`);
    } catch (e) { M.busy = false; M.err = (e && e.message) || "Speichern fehlgeschlagen"; this._renderModal(); }
  }
  /* Kasten im Reiter „Elektroheizer“ der Modul-1-Einstellungen: eingerichtete Heizer und „+ hinzufügen“ */
  _ehListBlock() {
    const rooms = this._ehRooms(), hs = rooms.filter((r) => r.htr), adm = this._admin();
    const rows = hs.map((r) => { const h = r.htr, on = h.status === "pv"; return `<button class="sxrow" data-act="rkhtr" data-id="${esc(r.id)}"><span class="sxi">${ic("bolt", 20)}</span><span class="sxt"><b>${esc(this._wzName(h.entity))}</b><small>${esc(r.name)} · ${(h.stufen || []).length > 1 ? `${h.stufen.length} Stufen bis ${wfmt(Math.max(...h.stufen))}` : wfmt(h.watt)}</small></span><em class="sxc ${on ? "ok" : ""}">${on ? "☀ " + wfmt(h.watt_now) : "wartet"}</em><span class="sxg">${ic("chev", 16)}</span></button>`; }).join("");
    return `<div class="fhs"><div class="sxl">${rows || `<div class="mut sm" style="padding:12px 14px">Noch kein Elektroheizer eingerichtet.</div>`}</div>
      ${adm && rooms.some((r) => !r.htr) ? `<div style="padding:0 12px 12px"><button class="btn2 pri" data-act="ehxnew" style="width:100%">${ic("plus", 16)} Elektroheizer hinzufügen</button></div>` : ""}</div>`;
  }
