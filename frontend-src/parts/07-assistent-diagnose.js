  _bakHtml(m) {
    if (!this._admin()) return "";
    const fd = (t) => { const d = new Date(t); return isNaN(d) ? "?" : d.toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); };
    const q = m.bakAsk, L = m.baks;
    let h = `<div class="lsec">${ic("download", 15)}Automatische Sicherungen</div><div class="mut sm" style="margin:2px 0 6px">Vor Änderungen legt die Integration Kopien ihrer Einstellungen an. Sind Einstellungen verschwunden, kannst du hier einen früheren Stand wiederherstellen.</div>`;
    if (q) return h + `<div class="gbox"><b>${esc(q.n)}</b>Stand vom ${esc(q.t)} wiederherstellen?<br><span class="mut">Das ersetzt den aktuellen Stand, sobald du die Integration neu lädst oder Home Assistant neu startest.</span></div><div class="foot2"><button class="btn2" data-act="bakno">Abbrechen</button><button class="btn2 pri" data-act="bakyes">Wiederherstellen</button></div>`;
    if (!L) return h + `<div class="mut sm">Wird geladen …</div>`;
    if (!L.length) return h + `<div class="mut sm">Noch keine Sicherungen vorhanden. Sie entstehen automatisch bei Änderungen.</div>`;
    return h + L.map((x) => `<div class="gst" style="flex-wrap:wrap;gap:6px">${esc(x.name)}<span style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap">${x.snaps.map((s) => `<button class="btn2" data-act="bakgo" data-k="${esc(x.key)}" data-i="${s.i}" data-n="${esc(x.name)}" data-t="${esc(fd(s.ts))}">${esc(fd(s.ts))}</button>`).join("")}</span></div>`).join("");
  }
  async _savePlan() {
    const m = this._modal, entries = m.draft.entries.filter((e) => e.days.length);
    entries.sort((a, b) => Math.min(...a.days) - Math.min(...b.days) || toMin(a.time) - toMin(b.time));
    const plan = { enabled: m.draft.enabled && entries.length > 0, entries };
    try {
      await this._hass.callWS({ type: "fenster_heizung/set_plan", entry_id: m.id, enabled: plan.enabled, entries, mode: m.draft.mode });
      this._cfg.plans[m.id] = { ...plan, mode: m.draft.mode }; this._modal = null; this._renderModal(); this._render(); this._toast("Heizplan gespeichert");
    } catch (e) { this._toast("Heizplan konnte nicht gespeichert werden"); }
  }

  /* ---------------- Einrichtungsassistent ---------------- */
  _wzOpen() {
    const pv = { ...PVDEF, ...(this._gen.pv || {}) }, sm = this._gen.summer || {};
    this._modal = { type: "wiz", step: 0, busy: false, done: null, draft: { rooms: [], open_delay: 60, close_delay: 30, action: "off", setback_temp: 12, summer: sm.mode || "auto", fuel: "erdgas", outdoor: "", wx: !!(this._gen.wxadj || {}).on, pvon: !!pv.sensor, pv, notify: "", notify_after: 0 } };
    this._renderModal();
  }
  _wzFind() {
    const H = this._hass, st = H.states || {}, ids = Object.keys(st), dc = (e) => (st[e].attributes || {}).device_class || "";
    const area = (e) => { const en = (H.entities || {})[e]; if (!en) return ""; if (en.area_id) return en.area_id; const dv = en.device_id && (H.devices || {})[en.device_id]; return (dv && dv.area_id) || ""; };
    const win = ids.filter((e) => e.startsWith("binary_sensor.") && ["window", "door", "opening", "garage_door"].includes(dc(e))), cl = ids.filter((e) => e.startsWith("climate.") && !((H.entities || {})[e] || {}).platform?.includes?.("fenster_heizung"));
    const hum = ids.filter((e) => e.startsWith("sensor.") && dc(e) === "humidity"), tmp = ids.filter((e) => e.startsWith("sensor.") && dc(e) === "temperature");
    const sw = ids.filter((e) => e.startsWith("switch.") || e.startsWith("climate.") || e.startsWith("input_boolean."));
    const notify = Object.keys(((H.services || {}).notify) || {}).filter((n) => !["send_message", "reload", "persistent_notification"].includes(n)).map((n) => "notify." + n).sort();
    const have = new Set(this._collect().map((r) => (r.name || "").toLowerCase())), groups = {};
    for (const e of [...win, ...cl]) { const a = area(e); if (a) (groups[a] = groups[a] || { w: [], c: [] })[e.startsWith("climate.") ? "c" : "w"].push(e); }
    const sug = Object.entries(groups).filter(([, g]) => g.w.length && g.c.length).map(([a, g]) => ({ name: ((H.areas || {})[a] || {}).name || a, windows: g.w, thermos: g.c })).filter((s) => !have.has(s.name.toLowerCase()));
    return { win, cl, hum, tmp, sw, notify, sug };
  }
  _wzName(e) { const s = this._hass.states[e]; return (s && s.attributes.friendly_name) || e; }
  _wzSel(opts, cur, f, extra = "", none = "– keiner –", hint = null) {
    const st = this._hass.states, id = f + "|" + extra, open = this._pkId === id, meta = { f };
    extra.replace(/data-([a-z]+)="([^"]*)"/g, (_, a, v) => { meta[a] = v.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"); });
    (this._pkReg = this._pkReg || {})[id] = meta;
    const h = hint || PK_HINT[meta.k] || null, val = (e) => { const x = st[e]; return x ? `${esc(x.state)}${x.attributes.unit_of_measurement ? " " + esc(x.attributes.unit_of_measurement) : ""}` : "nicht verfügbar"; };
    const btn = `<button class="pkbtn ${cur ? "set" : ""}" data-act="pkopen" data-pid="${esc(id)}" aria-expanded="${open}"><span class="pkt">${cur ? `<b>${esc(this._wzName(cur))}</b><small>${esc(cur)} · ${val(cur)}</small>` : `<span class="mut">${esc(none)}</span>`}</span>${ic(open ? "close" : "pencil", 16)}</button>`;
    if (!open) return btn;
    const all = [...new Set([...opts, ...(cur && !opts.includes(cur) ? [cur] : [])])], sc = (e) => (h && (h.test(e) || h.test(this._wzName(e))) ? 0 : 1);
    all.sort((a, b) => sc(a) - sc(b) || this._wzName(a).localeCompare(this._wzName(b), "de"));
    return btn + `<div class="pkbox"><input class="pksearch" data-f="enq" type="search" placeholder="Suchen: Name oder Entity-ID" autocomplete="off">
      <div class="pklist">${/add$/.test(f) ? "" : `<button class="pkrow pkclr" data-act="pkpick" data-pid="${esc(id)}" data-v="" data-s="">${esc(none)}</button>`}
      ${all.map((e) => `<button class="pkrow ${e === cur ? "cur" : ""}" data-act="pkpick" data-pid="${esc(id)}" data-v="${esc(e)}" data-s="${esc((this._wzName(e) + " " + e).toLowerCase())}"><span><b>${esc(this._wzName(e))}</b><small>${esc(e)}</small></span><span class="pkv">${h && sc(e) === 0 ? "<i>Passt</i>" : ""}${val(e)}</span></button>`).join("")}
      <div class="pkno" hidden>Keine passende Entität gefunden.</div></div></div>`;
  }
  _wzRate(d, k, label, F) {
    const p = d.pv, ent = p[k + "_mode"] === "entity", sn = p[k + "_sensor"], opts = Object.keys(this._hass.states).filter((e) => e.startsWith("sensor.") && (this._hass.states[e].attributes.device_class === "monetary" || (/(kwh|wh)$/i.test(this._hass.states[e].attributes.unit_of_measurement || "") && /€|eur|ct|cent/i.test(this._hass.states[e].attributes.unit_of_measurement || ""))));
    return `<div class="mut sm" style="margin:8px 0 0">${label}</div>
      <div class="seg">${[["fix", "Festwert"], ["entity", "Entität"]].map(([m, t]) => `<button class="${(ent ? "entity" : "fix") === m ? "sel" : ""}" data-act="wzrm" data-p="${k}" data-k="${m}">${t}</button>`).join("")}</div>
      ${ent ? this._wzSel(opts, sn, "wzv", `data-k="pv.${k}_sensor"`) : `<div class="of"><div class="ol"><b>${F}</b></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="wzv" data-num="1" data-k="pv.${k}" value="${p[k]}" min="0" max="100" step="0.01"><i>ct/kWh</i></span></div></div>`}`;
  }
  _wzSet(path, val) { const d = this._modal.draft, ks = path.split("."); let o = d; for (const k of ks.slice(0, -1)) o = o[k]; o[ks[ks.length - 1]] = val; }
  _wzChange(t) {
    const m = this._modal, f = t.dataset.f; if (!m || m.type !== "wiz") return false;
    if (f === "wzv") { let v = t.value; if (t.dataset.num) { v = Number(String(v).replace(",", ".")); v = isFinite(v) ? Math.max(0, Math.round(v * 100) / 100) : 0; } this._wzSet(t.dataset.k, v); this._renderModal(); return true; }
    if (f === "wzr") { m.draft.rooms[+t.dataset.i][t.dataset.k] = t.value; if (t.dataset.k === "heater") this._renderModal(); return true; }
    if (f === "wzadd") { const r = m.draft.rooms[+t.dataset.i], k = t.dataset.k; if (t.value && !r[k].includes(t.value)) r[k].push(t.value); this._renderModal(); return true; }
    return false;
  }
  _wzAct(a, b) {
    const m = this._modal, d = m.draft, i = +b.dataset.i, F = this._wzFind();
    if (a === "wznext") { m.step = Math.min(WZ_STEPS.length - 1, m.step + 1); }
    else if (a === "wzback") { m.step = Math.max(0, m.step - 1); }
    else if (a === "wzgo") { m.step = +b.dataset.k; }
    else if (a === "wzsug") { const s = F.sug[i]; if (s && !d.rooms.some((r) => r.name === s.name)) d.rooms.push({ name: s.name, windows: [...s.windows], thermos: [...s.thermos], hum: "", heater: "", steps: "" }); }
    else if (a === "wzsugall") { for (const s of F.sug) if (!d.rooms.some((r) => r.name === s.name)) d.rooms.push({ name: s.name, windows: [...s.windows], thermos: [...s.thermos], hum: "", heater: "", steps: "" }); }
    else if (a === "wzroom") { d.rooms.push({ name: "", windows: [], thermos: [], hum: "", heater: "", steps: "" }); }
    else if (a === "wzdel") { d.rooms.splice(i, 1); }
    else if (a === "wzrm") { if (b.dataset.e) { const r = d.rooms[i]; r[b.dataset.k] = r[b.dataset.k].filter((x) => x !== b.dataset.e); } else d.pv[b.dataset.p + "_mode"] = b.dataset.k; }
    else if (a === "wzact") { d.action = b.dataset.k; }
    else if (a === "wzsum") { d.summer = b.dataset.k; }
    else if (a === "wzpvon") { d.pvon = !d.pvon; }
    else if (a === "wzsign") { d.pv.sign = b.dataset.k; }
    else if (a === "wzwx") { d.wx = !d.wx; }
    else if (a === "wzapply") { this._wzApply(); return; }
    else if (a === "wzclose") { this._modal = null; this._renderModal(); this._load(); return; }
    this._renderModal();
  }
  _wzValid(d) { return d.rooms.filter((r) => r.name.trim() && r.windows.length && r.thermos.length); }
  async _wzApply() {
    const m = this._modal, d = m.draft, rooms = this._wzValid(d), out = []; m.busy = true; m.step = WZ_STEPS.length - 1; this._renderModal();
    const H = this._hass, steps = (s) => String(s || "").split(/[,;\s]+/).map(Number).filter((n) => n > 0);
    for (const r of rooms) {
      try {
        const fl = await H.callApi("POST", "config/config_entries/flow", { handler: "fenster_heizung", show_advanced_options: false });
        const res = await H.callApi("POST", "config/config_entries/flow/" + fl.flow_id, { name: r.name.trim(), window_sensors: r.windows, thermostats: r.thermos, open_delay: d.open_delay, close_delay: d.close_delay, action: d.action, setback_temp: d.setback_temp, fuel: d.fuel, ...(d.outdoor ? { outdoor_sensor: d.outdoor } : {}), ...(d.notify ? { notify_service: [d.notify], notify_after: d.notify_after } : {}) });
        if (res.type !== "create_entry") throw new Error(res.reason || "Abbruch");
        const id = typeof res.result === "string" ? res.result : res.result && res.result.entry_id, extra = {};
        if (id && r.hum) extra.humidity_sensor = r.hum;
        if (id && d.pvon && r.heater) Object.assign(extra, { htr_on: "on", htr_entity: r.heater, ...(steps(r.steps).length ? { htr_steps: steps(r.steps).join(", ") } : {}) });
        if (id && Object.keys(extra).length) { const o = await H.callWS({ type: "fenster_heizung/get_options", entry_id: id }); await H.callWS({ type: "fenster_heizung/set_options", entry_id: id, options: { ...((o && o.options) || {}), ...extra } }); }
        out.push([r.name, true, ""]);
      } catch (e) { out.push([r.name, false, (e && (e.message || e.body?.message)) || "Fehler"]); }
    }
    try {
      const pv = d.pvon ? d.pv : { ...this._pv(), sensor: "" };
      this._gen = { ...this._gen, summer: { ...this._gen.summer, mode: d.summer }, wxadj: { ...this._gen.wxadj, on: d.wx }, pv: { ...this._pv(), ...pv } };
      await this._saveGen();
    } catch (_) { out.push(["Allgemeine Einstellungen", false, "nicht gespeichert"]); }
    m.busy = false; m.done = out; this._renderModal();
  }
  _wzBody(m) {
    const d = m.draft, F = this._wzFind(), s = m.step, ex = this._collect();
    const chips = (r, i, k, list) => `<div class="wzch">${list.map((e) => `<span class="wzc">${esc(this._wzName(e))}<button data-act="wzrm" data-i="${i}" data-k="${k}" data-e="${esc(e)}" aria-label="Entfernen">${ic("close", 12)}</button></span>`).join("")}</div>`;
    const num = (label, hint, key, unit, lo, hi, st) => `<div class="of"><div class="ol"><b>${label}</b>${hint ? `<span>${hint}</span>` : ""}</div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="wzv" data-num="1" data-k="${key}" value="${key.split(".").reduce((o, k) => o[k], d)}" min="${lo}" max="${hi}" step="${st}"><i>${unit}</i></span></div></div>`;
    if (m.done) return `<div class="wzhero ok">${ic("check", 34)}</div><h3 class="wzt">Einrichtung abgeschlossen</h3>
      ${m.done.map(([n, ok, err]) => `<div class="wzres ${ok ? "ok" : "bad"}">${ic(ok ? "check" : "alert", 16)}<b>${esc(n)}</b><span>${ok ? "eingerichtet" : esc(err)}</span></div>`).join("") || `<div class="mut">Es wurden keine neuen Räume angelegt.</div>`}
      <div class="mut sm" style="margin-top:10px">Heizpläne, Anwesenheit und Darstellung stellst du danach im Dashboard ein. Diesen Assistenten findest du jederzeit unter „Allgemein“.</div>`;
    if (s === 0) return `<div class="wzhero">${ic("windowOpen", 34)}</div><h3 class="wzt">Willkommen</h3>
      <div class="mut" style="margin-bottom:10px">In wenigen Schritten richtest du Räume, Fenstermeldung, Heizung und optional PV-Elektroheizer ein. Du kannst jeden Schritt überspringen und später alles ändern.</div>
      <div class="gbox"><b>Das hat der Assistent gefunden</b>${F.cl.length} Thermostate · ${F.win.length} Fenster- und Türsensoren · ${F.hum.length} Luftfeuchte-Sensoren${F.sug.length ? `<br>${F.sug.length} Räume lassen sich aus deinen Bereichen vorschlagen.` : ""}</div>
      <div class="mut sm">${ex.length ? `Bereits eingerichtet: ${ex.length} ${ex.length === 1 ? "Raum" : "Räume"}. Sie bleiben unverändert.` : "Es ist noch kein Raum eingerichtet."}</div>`;
    if (s === 1) return `<h3 class="wzt">Räume</h3><div class="mut sm" style="margin-bottom:8px">Ein Raum braucht mindestens einen Fenstersensor und ein Thermostat.</div>
      ${ex.length ? `<div class="wzex">${ex.map((r) => `<span class="wzc ok">${ic("check", 12)}${esc(r.name)}</span>`).join("")}</div>` : ""}
      ${F.sug.length ? `<div class="lsec">${ic("home", 15)}Vorschläge aus deinen Bereichen</div>${F.sug.map((x, i) => { const on = d.rooms.some((r) => r.name === x.name); return `<div class="wzs"><div><b>${esc(x.name)}</b><span>${x.windows.length} Fenster · ${x.thermos.length} Thermostat${x.thermos.length > 1 ? "e" : ""}</span></div><button class="btn2 ${on ? "" : "pri"}" ${on ? "disabled" : ""} data-act="wzsug" data-i="${i}">${on ? "Hinzugefügt" : "Übernehmen"}</button></div>`; }).join("")}${F.sug.some((x) => !d.rooms.some((r) => r.name === x.name)) ? `<button class="lnk" data-act="wzsugall">Alle Vorschläge übernehmen</button>` : ""}` : ""}
      <div class="lsec">${ic("plus", 15)}Neue Räume</div>
      ${d.rooms.map((r, i) => `<div class="wzr ${r.name.trim() && r.windows.length && r.thermos.length ? "" : "inc"}"><div class="wzrh"><input class="otxt" data-f="wzr" data-i="${i}" data-k="name" value="${esc(r.name)}" placeholder="Raumname"><button class="ibtn" data-act="wzdel" data-i="${i}" aria-label="Raum entfernen">${ic("trash", 18)}</button></div>
        <div class="mut sm">Fenster- und Türsensoren</div>${chips(r, i, "windows", r.windows)}${this._wzSel(F.win.filter((e) => !r.windows.includes(e)), "", "wzadd", `data-i="${i}" data-k="windows"`, "+ Sensor hinzufügen")}
        <div class="mut sm">Thermostate</div>${chips(r, i, "thermos", r.thermos)}${this._wzSel(F.cl.filter((e) => !r.thermos.includes(e)), "", "wzadd", `data-i="${i}" data-k="thermos"`, "+ Thermostat hinzufügen")}</div>`).join("")}
      <button class="btn2" data-act="wzroom" style="width:100%">${ic("plus", 16)} Raum manuell hinzufügen</button>`;
    if (s === 2) return `<h3 class="wzt">Fenstermeldung</h3><div class="mut sm" style="margin-bottom:6px">Gilt für alle neuen Räume. Pro Raum änderst du es später in den Einstellungen.</div>
      ${num("Fenster offen nach", "So lange muss es offen sein, bevor geheizt wird.", "open_delay", "s", 0, 3600, 5)}${num("Fenster zu nach", "Wartezeit, bevor wieder geheizt wird.", "close_delay", "s", 0, 3600, 5)}
      <div class="mut sm" style="margin:8px 0 0">Bei offenem Fenster</div><div class="seg">${[["off", "Thermostat aus"], ["setback", "Absenken"]].map(([k, l]) => `<button class="${d.action === k ? "sel" : ""}" data-act="wzact" data-k="${k}">${l}</button>`).join("")}</div>
      ${d.action === "setback" ? num("Absenktemperatur", "", "setback_temp", "°C", 5, 25, 0.5) : ""}
      <div class="mut sm" style="margin:8px 0 0">Sommermodus</div><div class="seg">${[["off", "Aus"], ["auto", "Automatisch"], ["on", "Immer an"]].map(([k, l]) => `<button class="${d.summer === k ? "sel" : ""}" data-act="wzsum" data-k="${k}">${l}</button>`).join("")}</div>`;
    if (s === 3) return `<h3 class="wzt">Heizung &amp; Energie</h3><div class="mut sm" style="margin-bottom:6px">Für die Ersparnis im Dashboard.</div>
      <div class="mut sm">Brennstoff</div><select class="lsel" data-f="wzv" data-k="fuel">${Object.entries({ erdgas: "Erdgas", heizoel: "Heizöl", fluessiggas: "Flüssiggas", pellets: "Pellets", strom: "Strom / Wärmepumpe" }).map(([v, l]) => `<option value="${v}" ${d.fuel === v ? "selected" : ""}>${l}</option>`).join("")}</select>
      <div class="mut sm">Außentemperatur-Sensor (optional)</div>${this._wzSel(F.tmp, d.outdoor, "wzv", `data-k="outdoor"`)}
      <div class="of"><div class="ol"><b>Wetterabhängige Absenkung</b><span>Bei Sonne oder Milde sinkt die Zieltemperatur, bei Frost steigt sie.</span></div><div class="oc"><button class="sw ${d.wx ? "on" : ""}" data-act="wzwx" aria-pressed="${d.wx}"></button></div></div>`;
    if (s === 4) return `<h3 class="wzt">Luftfeuchte</h3><div class="mut sm" style="margin-bottom:8px">Optional. Mit einem Sensor je Raum warnt das Dashboard genauer vor Schimmel.</div>
      ${d.rooms.length ? d.rooms.map((r, i) => `<div class="mut sm" style="margin:6px 0 0">${esc(r.name || "Raum " + (i + 1))}</div>${this._wzSel(F.hum, r.hum, "wzr", `data-i="${i}" data-k="hum"`)}`).join("") : `<div class="mut">Für neue Räume. Bestehende Räume stellst du in deren Einstellungen ein.</div>`}`;
    if (s === 5) return `<h3 class="wzt">PV &amp; Elektroheizer</h3><div class="of"><div class="ol"><b>Elektroheizer mit PV-Überschuss</b><span>Heizen nur, wenn Strom übrig ist.</span></div><div class="oc"><button class="sw ${d.pvon ? "on" : ""}" data-act="wzpvon" aria-pressed="${d.pvon}"></button></div></div>
      ${d.pvon ? `<div class="mut sm">Sensor für die Einspeisung ins Netz</div>${this._wzSel(Object.keys(this._hass.states).filter((e) => e.startsWith("sensor.") && (this._hass.states[e].attributes.device_class === "power" || /^k?W$/.test(this._hass.states[e].attributes.unit_of_measurement || ""))), d.pv.sensor, "wzv", `data-k="pv.sensor"`)}
        <div class="seg">${[["export", "Einspeisung positiv"], ["import", "Netzbezug positiv"]].map(([k, l]) => `<button class="${d.pv.sign === k ? "sel" : ""}" data-act="wzsign" data-k="${k}">${l}</button>`).join("")}</div>
        <div class="mut sm">Batterie-Ladestand (optional)</div>${this._wzSel(Object.keys(this._hass.states).filter((e) => e.startsWith("sensor.") && (this._hass.states[e].attributes.device_class === "battery" || this._hass.states[e].attributes.unit_of_measurement === "%")), d.pv.soc_sensor, "wzv", `data-k="pv.soc_sensor"`)}
        ${this._wzRate(d, "price", "Strompreis (Netzbezug)", "Festpreis")}${this._wzRate(d, "feed", "Einspeisevergütung", "Festvergütung")}
        <div class="lsec">${ic("radiator", 15)}Heizer in neuen Räumen</div>
        ${d.rooms.length ? d.rooms.map((r, i) => `<div class="mut sm" style="margin:6px 0 0">${esc(r.name || "Raum " + (i + 1))}</div>${this._wzSel(F.sw, r.heater, "wzr", `data-i="${i}" data-k="heater"`, "– kein Elektroheizer –")}${r.heater ? `<div class="of"><div class="ol"><b>Leistungsstufen</b><span>In Watt, z. B. 800, 1200, 1800.</span></div><div class="oc"><input class="otxt" data-f="wzr" data-i="${i}" data-k="steps" value="${esc(r.steps)}" placeholder="800, 1200, 1800"></div></div>` : ""}`).join("") : `<div class="mut">Heizer in bestehenden Räumen richtest du in deren Einstellungen ein.</div>`}` : ""}`;
    if (s === 6) return `<h3 class="wzt">Meldungen</h3><div class="mut sm" style="margin-bottom:8px">Optional. Eine Erinnerung, wenn ein Fenster zu lange offen steht.</div>
      <div class="mut sm">Benachrichtigen über</div><select class="lsel" data-f="wzv" data-k="notify"><option value="">– keine –</option>${F.notify.map((n) => `<option value="${esc(n)}" ${d.notify === n ? "selected" : ""}>${esc(n)}</option>`).join("")}</select>
      ${d.notify ? num("Erinnern nach", "Minuten, die das Fenster offen steht.", "notify_after", "Min.", 0, 240, 1) : ""}`;
    const ok = this._wzValid(d), bad = d.rooms.length - ok.length;
    const heat = d.pvon ? ok.filter((r) => r.heater).length : 0;
    return `<h3 class="wzt">Zusammenfassung</h3>
      <div class="wzsum"><div><em>${ic("home", 16)}</em><b>${ok.length} neue ${ok.length === 1 ? "Raum" : "Räume"}</b><span>${ok.map((r) => esc(r.name)).join(", ") || "keine"}${bad ? ` · ${bad} unvollständig, wird übersprungen` : ""}</span></div>
      <div><em>${ic("window", 16)}</em><b>Fenstermeldung</b><span>offen nach ${d.open_delay} s, zu nach ${d.close_delay} s · ${d.action === "off" ? "Thermostat aus" : "Absenken auf " + num2(d.setback_temp) + " °C"}</span></div>
      <div><em>${ic("sun", 16)}</em><b>Sommermodus</b><span>${{ off: "Aus", auto: "Automatisch", on: "Immer an" }[d.summer]}</span></div>
      <div><em>${ic("flame", 16)}</em><b>Heizung</b><span>${esc(d.fuel)}${d.outdoor ? " · Außensensor gewählt" : ""}${d.wx ? " · Wetter-Absenkung an" : ""}</span></div>
      <div><em>${ic("bolt", 16)}</em><b>PV-Überschuss</b><span>${d.pvon ? `${d.pv.sensor ? "Sensor gewählt" : "kein Sensor"} · ${heat} Elektroheizer` : "nicht eingerichtet"}</span></div>
      <div><em>${ic("bell", 16)}</em><b>Meldungen</b><span>${d.notify ? esc(d.notify) + ", nach " + d.notify_after + " Min." : "aus"}</span></div></div>
      <div class="mut sm" style="margin-top:8px">Bestehende Räume bleiben unverändert.</div>`;
  }
  _wzModal() {
    const m = this._modal, s = m.step, n = WZ_STEPS.length, last = s === n - 1;
    return `<div class="ov" data-act="${m.done ? "wzclose" : "close"}"></div><div class="sheet wide wz" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Einrichtungsassistent</b><span>${m.done ? "Fertig" : `Schritt ${s + 1} von ${n} · ${WZ_STEPS[s]}`}</span></div><button class="ibtn" data-act="${m.done ? "wzclose" : "close"}" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="wzp">${WZ_STEPS.map((t, i) => `<i class="${i <= s ? "on" : ""}" ${m.done ? "" : `data-act="wzgo" data-k="${i}" title="${t}"`}></i>`).join("")}</div>
      <div class="wzb">${this._wzBody(m)}</div>
      <div class="foot2 wzf">${m.done ? `<button class="btn2 pri" data-act="wzclose">Fertig</button>` : `${s > 0 ? `<button class="btn2" data-act="wzback">Zurück</button>` : ""}${last ? `<button class="btn2 pri" data-act="wzapply" ${m.busy ? "disabled" : ""}>${m.busy ? "Richte ein …" : "Einrichtung anwenden"}</button>` : `<button class="btn2 pri" data-act="wznext">${s === 0 ? "Los geht’s" : "Weiter"}</button>`}`}</div>
      ${!m.done && s > 0 && !last ? `<button class="lnk wzskip" data-act="wznext">Diesen Schritt überspringen</button>` : ""}</div>`;
  }
  /* ---------------- Heizkörperventil-Diagnose ---------------- */
  _vcfg() { return { warn: 20, days: 7, notify: "", ...((this._gen || {}).valve || {}) }; }
  _vBattery(eid) {
    const H = this._hass, st = H.states || {}, s = st[eid]; if (!s) return null;
    const ov = (this._vcfg().batsrc || {})[eid];
    if (ov) {
      if (ov.src === "none") return null;
      const bs = st[ov.src], nm = bs && bs.attributes.friendly_name;
      if (!bs || bs.state === "unavailable" || bs.state === "unknown") return { pct: null, low: false, unknown: true, manual: true, src: ov.src, name: nm };
      if (ov.src.startsWith("binary_sensor.")) return { pct: null, low: (bs.state === "on") !== !!ov.inv, manual: true, bin: true, src: ov.src, name: nm };
      const n = parseFloat(String(bs.state).replace(",", ".")); return isFinite(n) ? { pct: Math.round(n), manual: true, src: ov.src, name: nm } : { pct: null, low: false, unknown: true, manual: true, src: ov.src, name: nm };
    }
    const a = s.attributes || {}, num0 = (v) => { const n = parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : null; };
    for (const k of ["battery_level", "battery"]) if (a[k] != null && num0(a[k]) != null) return { pct: Math.round(num0(a[k])), src: "Attribut" };
    if (a.battery_low === true) return { pct: null, low: true, bin: true, src: "Attribut" };
    const dv = (H.entities || {})[eid] && H.entities[eid].device_id; if (!dv) return null;
    for (const [e, en] of Object.entries(H.entities || {})) {
      if (en.device_id !== dv || !st[e]) continue; const dc = (st[e].attributes || {}).device_class;
      if (e.startsWith("sensor.") && dc === "battery" && num0(st[e].state) != null) return { pct: Math.round(num0(st[e].state)), src: e, name: st[e].attributes.friendly_name };
      if (e.startsWith("binary_sensor.") && dc === "battery") return { pct: null, low: st[e].state === "on", bin: true, src: e, name: st[e].attributes.friendly_name };
    }
    return null;
  }
  _batCands(eid) {
    const H = this._hass, st = H.states || {}, dv = ((H.entities || {})[eid] || {}).device_id, out = [];
    for (const e of Object.keys(st)) { const dc = (st[e].attributes || {}).device_class; if ((e.startsWith("sensor.") && dc === "battery") || (e.startsWith("binary_sensor.") && ["battery", "battery_charging"].includes(dc)) || (e.startsWith("binary_sensor.") && /batt|akku/i.test(e + " " + (st[e].attributes.friendly_name || "")))) out.push(e); }
    const same = (e) => dv && ((H.entities || {})[e] || {}).device_id === dv;
    return out.sort((a, b) => same(b) - same(a) || a.localeCompare(b));
  }
  _batRow(eid, b) {
    const cfg = this._vcfg(), ov = (cfg.batsrc || {})[eid], pc = b && b.pct != null ? Math.max(0, Math.min(100, b.pct)) : null, bc = b && (b.low || (pc != null && pc <= 10)) ? "bad" : b && pc != null && pc <= cfg.warn ? "warn" : "ok";
    const open = this._modal && this._modal.bat === eid;
    const val = !b ? `<span class="mut">${ov && ov.src === "none" ? "ohne Batterie-Überwachung" : "kein Batteriewert gefunden"}</span>` : b.unknown ? `<b class="vwarn">Batteriesensor meldet nichts</b>` : pc != null ? `<div class="batbar ${bc}"><i style="width:${pc}%"></i></div><b>${pc} %</b>` : `<b class="${b.low ? "vbad" : ""}">${b.low ? "leer / schwach" : "in Ordnung"}</b>`;
    const src = b && b.src ? `<span class="vsrc">${b.manual ? "Quelle: " : "erkannt: "}${esc(b.name || b.src)}${b.bin ? " (Binärsensor)" : ""}</span>` : "";
    let ed = "";
    if (open) {
      const c = this._batCands(eid), cur = ov ? ov.src : "", isBin = cur.startsWith("binary_sensor."), nm = (e) => esc((this._hass.states[e] || { attributes: {} }).attributes.friendly_name || e);
      const sens = c.filter((e) => e.startsWith("sensor.")), bins = c.filter((e) => e.startsWith("binary_sensor."));
      ed = `<div class="vbe"><select class="lsel" data-f="vbat" data-e="${esc(eid)}"><option value="">Automatisch erkennen</option><option value="none" ${cur === "none" ? "selected" : ""}>Keine Batterie-Überwachung</option>
        ${sens.length ? `<optgroup label="Prozent-Sensor">${sens.map((e) => `<option value="${esc(e)}" ${cur === e ? "selected" : ""}>${nm(e)}</option>`).join("")}</optgroup>` : ""}
        ${bins.length ? `<optgroup label="Binärsensor (an = Batterie schwach)">${bins.map((e) => `<option value="${esc(e)}" ${cur === e ? "selected" : ""}>${nm(e)}</option>`).join("")}</optgroup>` : ""}
        ${cur && !c.includes(cur) && cur !== "none" ? `<option value="${esc(cur)}" selected>${esc(cur)}</option>` : ""}</select>
        ${isBin ? `<label class="vinv"><input type="checkbox" data-f="vbatinv" data-e="${esc(eid)}" ${ov.inv ? "checked" : ""}> Umgekehrt: „an“ bedeutet Batterie in Ordnung</label>` : ""}
        ${!c.length ? `<div class="mut sm">Es wurde kein Batterie-Sensor gefunden. Ein Binärsensor, der bei schwacher Batterie „an“ ist, reicht.</div>` : ""}</div>`;
    }
    return `<div class="vb"><span class="vl">Batterie</span>${val}<button class="lnk vch" data-act="dgbat" data-e="${esc(eid)}">${open ? "Fertig" : "Quelle"}</button></div>${src ? `<div class="vb vbs">${src}</div>` : ""}${ed}`;
  }
  _vInfo(eid, rv) {
    const s = (this._hass.states || {})[eid], cfg = this._vcfg(), now = Date.now();
    if (!s) return { lvl: "bad", msg: "Entität existiert nicht mehr", bat: null, lines: [] };
    const a = s.attributes || {}, at = Date.parse(s.last_updated || ""), age = isFinite(at) ? now - at : null, bat = this._vBattery(eid), out = [];
    let lvl = "ok";
    const up = (l) => { if (l === "bad" || (l === "warn" && lvl === "ok")) lvl = l; };
    if (s.state === "unavailable") { up("bad"); out.push(["bad", "Nicht erreichbar", "Das Ventil meldet sich nicht. Funkverbindung oder Batterie prüfen."]); }
    else {
      if (age != null && age > 6 * 36e5 && s.state !== "off") { up("warn"); out.push(["warn", `Keine Meldung seit ${this._dgAgo(age).replace("vor ", "")}`, "Das Ventil sendet keine neuen Werte."]); }
      if (rv && rv.ok === false && rv.expect != null) { up("bad"); out.push(["bad", "Reagiert nicht auf Befehle", `Ziel ${num(rv.expect, 1)} °C gesendet ${this._dgAgo(now - Date.parse(rv.cmd_at))}, das Ventil meldet ${rv.actual != null ? "als Ziel " + num(rv.actual, 1) + " °C" : "keinen Zielwert"}.`]); }
    }
    if (bat && bat.unknown) { up("warn"); out.push(["warn", "Batteriesensor meldet nichts", "Der gewählte Batterie-Sensor ist nicht erreichbar. Quelle prüfen."]); }
    if (bat) { if (bat.low || (bat.pct != null && bat.pct <= 10)) { up("bad"); out.push(["bad", bat.pct != null ? `Batterie fast leer (${bat.pct} %)` : "Batterie leer", "Jetzt wechseln, sonst bleibt das Ventil stehen."]); } else if (bat.pct != null && bat.pct <= cfg.warn) { up("warn"); out.push(["warn", `Batterie schwach (${bat.pct} %)`, "Bald wechseln."]); } }
    return { lvl, bat, age, s, lines: out, cur: a.current_temperature, tgt: a.temperature, act: a.hvac_action, rv };
  }
  _valveChip(r) {
    let w = null;
    for (const e of r.thermos || []) { const i = this._vInfo(e); if (i.lvl === "ok") continue; const l = i.lines[0] || []; if (!w || (i.lvl === "bad" && w[0] !== "bad")) w = [i.lvl, l[1] || l[0] || "Ventil prüfen", l[0] || ""]; }
    if (!w) return "";
    const short = /Batterie/.test(w[2]) ? w[2].replace("Batterie ", "Batterie ").replace(/ \((\d+) %\)/, " $1 %") : /Nicht erreichbar/.test(w[2]) ? "Ventil offline" : /Reagiert/.test(w[2]) ? "Ventil reagiert nicht" : "Ventil prüfen";
    return `<button class="achip ${w[0] === "bad" ? "red" : "amber"}" data-act="diag" data-k="valve" aria-label="Ventil-Diagnose öffnen">${ic("thermo", 12)}${esc(short)}</button>`;
  }
  _wInfo(eid) {
    const s = (this._hass.states || {})[eid], cfg = this._vcfg(), now = Date.now(), out = [];
    if (!s) return { lvl: "bad", lines: [["bad", "Entität existiert nicht mehr", "Der Sensor wurde gelöscht oder umbenannt."]], bat: null, s: null };
    const ch = Date.parse(s.last_changed || ""), up = Date.parse(s.last_updated || ""), ageC = isFinite(ch) ? now - ch : null, ageU = isFinite(up) ? now - up : null, bat = this._vBattery(eid), days = cfg.days || 7;
    let lvl = "ok"; const u = (l) => { if (l === "bad" || (l === "warn" && lvl === "ok")) lvl = l; };
    if (s.state === "unavailable") { u("bad"); out.push(["bad", "Nicht erreichbar", "Der Sensor meldet sich nicht. Batterie und Funkverbindung prüfen."]); }
    else {
      if (s.state === "on" && ageC != null && ageC > 12 * 36e5) { u("warn"); out.push(["warn", `Seit ${this._dgAgo(ageC).replace("vor ", "")} offen`, "Fenster wirklich offen? Sonst hängt der Sensor."]); }
      else if (ageC != null && ageC > days * 864e5) { u("warn"); out.push(["warn", `Seit ${Math.floor(ageC / 864e5)} Tagen unverändert`, "Normal, wenn das Fenster nie geöffnet wird. Sonst Sensor prüfen."]); }
      if (ageU != null && ageU > 3 * 864e5 && ageC != null && ageU < ageC) { u("warn"); out.push(["warn", `Keine Meldung seit ${Math.floor(ageU / 864e5)} Tagen`, "Auch Batterie- und Signalwerte kommen nicht mehr an."]); }
    }
    if (bat && bat.unknown) { u("warn"); out.push(["warn", "Batteriesensor meldet nichts", "Der gewählte Batterie-Sensor ist nicht erreichbar. Quelle prüfen."]); }
    if (bat) { if (bat.low || (bat.pct != null && bat.pct <= 10)) { u("bad"); out.push(["bad", bat.pct != null ? `Batterie fast leer (${bat.pct} %)` : "Batterie leer", "Jetzt wechseln, sonst erkennt die Regelung offene Fenster nicht mehr."]); } else if (bat.pct != null && bat.pct <= cfg.warn) { u("warn"); out.push(["warn", `Batterie schwach (${bat.pct} %)`, "Bald wechseln."]); } }
    return { lvl, bat, s, ageC, ageU, lines: out };
  }
  _dgWindows(m) {
    const cfg = this._vcfg(), list = []; for (const r of this._collect()) for (const e of r.windows || []) list.push({ r, e, i: this._wInfo(e) });
    const bad = list.filter((x) => x.i.lvl === "bad").length, warn = list.filter((x) => x.i.lvl === "warn").length, rk = { bad: 0, warn: 1, ok: 2 };
    const hdr = !list.length ? `<div class="mut" style="padding:16px 0">Noch keine Fensterkontakte eingerichtet.</div>` : `<div class="mut sm" style="margin:2px 0 10px">${bad ? `${bad} Kontakt${bad > 1 ? "e brauchen" : " braucht"} Aufmerksamkeit.` : warn ? `${warn} Hinweis${warn > 1 ? "e" : ""}.` : "Alle Fensterkontakte melden und haben genug Batterie."}</div>`;
    const cards = list.sort((a, b) => rk[a.i.lvl] - rk[b.i.lvl]).map(({ r, e, i }) => {
      const b = i.bat, pc = b && b.pct != null ? Math.max(0, Math.min(100, b.pct)) : null, bc = b && (b.low || (pc != null && pc <= 10)) ? "bad" : b && pc != null && pc <= cfg.warn ? "warn" : "ok", nm = i.s ? i.s.attributes.friendly_name || e : e;
      const st = !i.s ? "–" : i.s.state === "unavailable" ? "nicht erreichbar" : i.s.state === "on" ? "offen" : "zu";
      return `<div class="vc ${i.lvl}"><div class="vh"><i class="dgd ${i.lvl}"></i><div><b>${esc(nm)}</b><span>${esc(r.name)}</span></div><em>${i.lvl === "ok" ? "In Ordnung" : i.lvl === "warn" ? "Hinweis" : "Problem"}</em></div>
        <div class="vb"><span class="vl">Zustand</span><b>${st}</b></div>
        <div class="vb"><span class="vl">Zuletzt geändert</span><b>${i.ageC != null ? this._dgAgo(i.ageC) : "–"}</b></div>
        <div class="vb"><span class="vl">Letzte Meldung</span><b>${i.ageU != null ? this._dgAgo(i.ageU) : "–"}</b></div>
        ${this._batRow(e, i.bat)}
        ${i.lines.map(([l, t, h]) => `<div class="vm ${l}">${ic(l === "bad" ? "alert" : "info", 15)}<div><b>${esc(t)}</b><span>${esc(h)}</span></div></div>`).join("")}</div>`;
    }).join("");
    const set = `<div class="lsec" style="margin-top:14px">${ic("window", 15)}Wann auffällig?</div>
      <div class="of"><div class="ol"><b>Unverändert ab</b><span>Tage ohne Wechsel zwischen offen und zu.</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="vdays" value="${cfg.days || 7}" min="1" max="60" step="1"><i>Tage</i></span></div></div>
      <div class="mut sm" style="margin-top:4px">Batterie-Schwelle und Benachrichtigung stellst du im Reiter „Ventile“ ein. Sie gelten auch für die Fensterkontakte.</div>`;
    return hdr + cards + set;
  }
  _devChip(r) {
    let w = null;
    for (const e of r.thermos || []) { const i = this._vInfo(e); if (i.lvl === "ok") continue; const l = i.lines[0] || []; if (!w || (i.lvl === "bad" && w[0] !== "bad")) w = [i.lvl, l[1] || "", "valve", "Ventil"]; }
    for (const e of r.windows || []) { const i = this._wInfo(e); if (i.lvl === "ok") continue; const l = i.lines[0] || []; if (!w || (i.lvl === "bad" && w[0] !== "bad")) w = [i.lvl, l[1] || "", "win", "Kontakt"]; }
    if (!w) return "";
    const t = w[1], k = w[3], short = /Batterie/.test(t) ? `${k === "Ventil" ? "Batterie" : "Kontakt-Batterie"}${(t.match(/\((\d+) %\)/) || [])[1] ? " " + t.match(/\((\d+) %\)/)[1] + " %" : " leer"}` : /Nicht erreichbar/.test(t) ? `${k} offline` : /Reagiert/.test(t) ? "Ventil reagiert nicht" : /unverändert/.test(t) ? "Kontakt unverändert" : /offen/.test(t) ? "Fenster lange offen" : `${k} prüfen`;
    return `<button class="achip ${w[0] === "bad" ? "red" : "amber"}" data-act="diag" data-k="${w[2]}" aria-label="Diagnose öffnen">${ic(w[2] === "win" ? "window" : "thermo", 12)}${esc(short)}</button>`;
  }
  _dgValves(m) {
    const rooms = this._collect(), cfg = this._vcfg(), rvs = (m.data && m.data.valves) || [], rvf = (e) => rvs.find((v) => v.entity === e);
    const list = []; for (const r of rooms) for (const e of r.thermos || []) list.push({ r, e, i: this._vInfo(e, rvf(e)) });
    const bad = list.filter((x) => x.i.lvl === "bad").length, warn = list.filter((x) => x.i.lvl === "warn").length;
    const hdr = !list.length ? `<div class="mut" style="padding:16px 0">Noch keine Thermostate eingerichtet.</div>` : `<div class="mut sm" style="margin:2px 0 10px">${bad ? `${bad} Ventil${bad > 1 ? "e brauchen" : " braucht"} Aufmerksamkeit.` : warn ? `${warn} Warnung${warn > 1 ? "en" : ""}.` : "Alle Ventile reagieren und haben genug Batterie."}</div>`;
    const cards = list.sort((a, b) => ({ bad: 0, warn: 1, ok: 2 }[a.i.lvl] - { bad: 0, warn: 1, ok: 2 }[b.i.lvl])).map(({ r, e, i }) => {
      const b = i.bat, pc = b && b.pct != null ? Math.max(0, Math.min(100, b.pct)) : null, bc = b && (b.low || (pc != null && pc <= 10)) ? "bad" : b && pc != null && pc <= cfg.warn ? "warn" : "ok";
      const nm = i.s ? i.s.attributes.friendly_name || e : e, rv = i.rv;
      return `<div class="vc ${i.lvl}"><div class="vh"><i class="dgd ${i.lvl}"></i><div><b>${esc(nm)}</b><span>${esc(r.name)}</span></div><em>${i.lvl === "ok" ? "In Ordnung" : i.lvl === "warn" ? "Warnung" : "Problem"}</em></div>
        ${this._batRow(e, i.bat)}
        <div class="vb"><span class="vl">Ventil</span><b>${i.cur != null ? `Ist ${num(i.cur, 1)} °C` : "keine Temperatur"}${i.tgt != null ? ` · Ziel ${num(i.tgt, 1)} °C` : ""}${i.act ? ` · ${{ heating: "heizt", idle: "ruht", off: "aus" }[i.act] || i.act}` : ""}</b></div>
        <div class="vb"><span class="vl">Letzte Meldung</span><b>${i.age != null ? this._dgAgo(i.age) : "–"}</b></div>
        ${rv ? `<div class="vb"><span class="vl">Letzter Befehl</span><b>${this._dgAgo(Date.now() - Date.parse(rv.cmd_at))}: ${rv.expect != null ? "Ziel " + num(rv.expect, 1) + " °C" : "Modus " + esc(rv.mode || "")} ${rv.ok === false ? "nicht übernommen" : rv.ok ? "übernommen" : "wird geprüft"}</b></div>` : ""}
        ${i.lines.map(([l, t, h]) => `<div class="vm ${l}">${ic(l === "bad" ? "alert" : "info", 15)}<div><b>${esc(t)}</b><span>${esc(h)}</span></div></div>`).join("")}</div>`;
    }).join("");
    const notify = ((this._hass.services || {}).notify) ? Object.keys(this._hass.services.notify).filter((n) => !["send_message", "reload", "persistent_notification"].includes(n)).map((n) => "notify." + n).sort() : [];
    const set = `<div class="lsec" style="margin-top:14px">${ic("bell", 15)}Benachrichtigung bei Problemen</div>
      <div class="mut sm" style="margin:2px 0 4px">Du bekommst eine Meldung, wenn ein Ventil ausfällt, nicht reagiert oder die Batterie schwach ist. Pro Problem höchstens einmal am Tag.</div>
      <div class="mut sm">Benachrichtigen über</div><select class="lsel" data-f="vnotify"><option value="">– keine –</option>${[...new Set([...notify, ...(cfg.notify ? [cfg.notify] : [])])].map((n) => `<option value="${esc(n)}" ${cfg.notify === n ? "selected" : ""}>${esc(n)}</option>`).join("")}</select>
      <div class="of"><div class="ol"><b>Batterie schwach ab</b><span>Unter 10 % gilt sie als fast leer.</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="vwarn" value="${cfg.warn}" min="11" max="60" step="1"><i>%</i></span></div></div>`;
    return hdr + cards + set;
  }
  /* ---------------- Gerätediagnose ---------------- */
  async _dgOpen(tab) {
    this._modal = { type: "diag", tab: tab || "status", only: false, data: null, loading: true, at: null };
    this._renderModal(); await this._dgLoad();
  }
  async _dgLoad() {
    const m = this._modal; if (!m || m.type !== "diag") return; m.loading = true; this._renderModal();
    try { m.data = await this._hass.callWS({ type: "fenster_heizung/get_diag" }); m.error = ""; } catch (e) { m.data = m.data || { devices: [], notify: [], log: [] }; m.error = "Die Diagnose konnte nicht vom Server geladen werden."; }
    m.at = new Date(); m.loading = false; if (this._modal === m) this._renderModal();
  }
  _dgAgo(ms) { const s = Math.max(0, Math.round(ms / 1000)); if (s < 45) return "gerade eben"; const mi = Math.round(s / 60); if (mi < 60) return `vor ${mi} Min.`; const h = Math.round(mi / 60); if (h < 48) return `vor ${h} Std.`; return `vor ${Math.round(h / 24)} Tagen`; }
  _dgRows(data) {
    const st = this._hass.states || {}, now = Date.now(), R = DG_ROLES, rows = [];
    for (const d of data.devices || []) {
      const s = st[d.entity], dom = String(d.entity).split(".")[0], at = s ? Date.parse(s.last_updated || s.last_changed || "") : NaN, age = isFinite(at) ? now - at : null, name = s ? s.attributes.friendly_name || d.entity : d.entity;
      let lvl = "ok", msg = "OK", val = "";
      if (!s) { lvl = "bad"; msg = "Entität existiert nicht mehr"; }
      else if (s.state === "unavailable") { lvl = "bad"; msg = "Nicht erreichbar"; val = "nicht erreichbar"; }
      else if (s.state === "unknown") { lvl = "warn"; msg = "Wert unbekannt"; val = "unbekannt"; }
      else {
        val = dom === "climate" ? (s.attributes.current_temperature != null ? `${num(s.attributes.current_temperature, 1)} °C` : s.state) : dom === "binary_sensor" ? (s.state === "on" ? "offen" : "zu") : `${s.state}${s.attributes.unit_of_measurement ? " " + s.attributes.unit_of_measurement : ""}`;
        if (dom === "climate" && s.attributes.current_temperature == null) { lvl = "warn"; msg = "Meldet keine Raumtemperatur"; }
        else if (["sensor"].includes(dom) && age != null && age > 864e5) { lvl = "warn"; msg = `Seit ${this._dgAgo(age).replace("vor ", "")} keine Meldung`; }
        else if (d.role === "window" && s.state === "on" && age != null && age > 12 * 36e5) { lvl = "warn"; msg = `Seit ${this._dgAgo(age).replace("vor ", "")} offen. Sensor hängt?`; }
        else if (["pv", "soc", "price", "feed", "power"].includes(d.role) && !isFinite(parseFloat(String(s.state).replace(",", ".")))) { lvl = "warn"; msg = "Kein Zahlenwert"; }
      }
      rows.push({ room: d.room || "Allgemein", role: R[d.role] || d.role, entity: d.entity, name, val, age, lvl, msg });
    }
    for (const n of data.notify || []) { const [dm, sv] = String(n.service).split("."), ok = !!((this._hass.services || {})[dm] || {})[sv]; rows.push({ room: n.room || "Allgemein", role: "Benachrichtigung", entity: n.service, name: n.service, val: ok ? "vorhanden" : "fehlt", age: null, lvl: ok ? "ok" : "warn", msg: ok ? "Dienst verfügbar" : "Dienst nicht gefunden" }); }
    return rows;
  }
  _dgBody(m) {
    if (!m.data) return `<div class="mut" style="padding:34px 0;text-align:center">Lädt …</div>`;
    const wp = this._collect().reduce((a, r) => a + (r.windows || []).filter((e) => this._wInfo(e).lvl !== "ok").length, 0), vp = this._collect().reduce((a, r) => a + (r.thermos || []).filter((e) => this._vInfo(e, ((m.data.valves || []).find((v) => v.entity === e))).lvl !== "ok").length, 0), rows = this._dgRows(m.data), vx = this._collect().flatMap((r) => [...(r.thermos || []).map((e) => [e, this._vInfo(e, (m.data.valves || []).find((v) => v.entity === e))]), ...(r.windows || []).map((e) => [e, this._wInfo(e)])]).filter(([e, i]) => i.lvl !== "ok" && !rows.some((r) => r.entity === e && r.lvl !== "ok")), bad = rows.filter((r) => r.lvl === "bad").length + vx.filter(([, i]) => i.lvl === "bad").length, warn = rows.filter((r) => r.lvl === "warn").length + vx.filter(([, i]) => i.lvl === "warn").length, lg = m.data.log || [];
    const sum = bad ? ["bad", "alert", `${bad} ${bad === 1 ? "Fehler" : "Fehler"}${warn ? ` und ${warn} ${warn === 1 ? "Warnung" : "Warnungen"}` : ""}`, "Diese Geräte melden nicht. Die Regelung kann dadurch eingeschränkt sein."] : warn ? ["warn", "info", `${warn} ${warn === 1 ? "Warnung" : "Warnungen"}`, "Läuft, aber ein Gerät fällt auf."] : ["ok", "check", "Alles in Ordnung", `${rows.length} Geräte und Dienste geprüft, Ventile und Batterien eingeschlossen.`];
    const head = `<div class="dgs ${sum[0]}">${ic(sum[1], 22)}<div><b>${sum[2]}</b><span>${sum[3]}${m.at ? ` Geprüft um ${m.at.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}.` : ""}</span></div><button class="btn2" data-act="dgre" ${m.loading ? "disabled" : ""}>${m.loading ? "Prüfe …" : "Erneut prüfen"}</button></div>${m.error ? `<div class="gst">${ic("alert", 15)}${esc(m.error)}</div>` : ""}`;
    const tabs = `<div class="seg">${[["status", "Status"], ["sens", "Gemeldet"], ["valve", `Ventile${vp ? " (" + vp + ")" : ""}`], ["win", `Fenster${wp ? " (" + wp + ")" : ""}`], ["log", `Protokoll${lg.length ? " (" + lg.length + ")" : ""}`]].map(([k, l]) => `<button class="${m.tab === k ? "sel" : ""}" data-act="dgtab" data-k="${k}">${l}</button>`).join("")}</div>`;
    const dot = (l) => `<i class="dgd ${l}" aria-hidden="true"></i>`, rank = { bad: 0, warn: 1, ok: 2 };
    let body = "";
    if (m.tab === "status") {
      const by = {}; for (const r of rows) (by[r.room] = by[r.room] || []).push(r);
      body = Object.entries(by).sort((a, b) => (a[0] === "Allgemein") - (b[0] === "Allgemein") || a[0].localeCompare(b[0], "de")).map(([room, list]) => { const w = list.reduce((a, r) => (rank[r.lvl] < rank[a] ? r.lvl : a), "ok"); return `<div class="dgr"><div class="dgh">${dot(w)}<b>${esc(room)}</b><span>${w === "ok" ? "in Ordnung" : list.filter((r) => r.lvl !== "ok").length + " auffällig"}</span></div>${list.map((r) => `<div class="dgl ${r.lvl}">${dot(r.lvl)}<div><b>${esc(r.role)}</b><span>${esc(r.name)}</span></div><em>${esc(r.msg)}</em></div>`).join("")}</div>`; }).join("") || `<div class="mut">Noch keine Geräte eingerichtet.</div>`;
    } else if (m.tab === "valve") { body = this._dgValves(m);
    } else if (m.tab === "win") { body = this._dgWindows(m);
    } else if (m.tab === "sens") {
      const list = rows.filter((r) => r.entity.includes(".") && !r.entity.startsWith("notify.")).filter((r) => !m.only || r.lvl !== "ok").sort((a, b) => (b.age == null ? 1e15 : b.age) - (a.age == null ? 1e15 : a.age) || rank[a.lvl] - rank[b.lvl]);
      body = `<div class="dgf"><button class="chipb ${m.only ? "" : "sel"}" data-act="dgonly" data-k="0">Alle</button><button class="chipb ${m.only ? "sel" : ""}" data-act="dgonly" data-k="1">Nur auffällige</button></div>` + (list.map((r) => `<div class="dgt ${r.lvl}">${dot(r.lvl)}<div class="dgn"><b>${esc(r.name)}</b><span>${esc(r.room)} · ${esc(r.role)}</span></div><div class="dgv"><b>${esc(r.val || "–")}</b><span>${r.age == null ? "–" : this._dgAgo(r.age)}</span></div></div>`).join("") || `<div class="mut" style="padding:16px 0">Nichts Auffälliges.</div>`);
    } else {
      body = lg.length ? `<div class="dgf"><button class="chipb" data-act="dgcopy">${ic("copy", 14)} Kopieren</button><button class="chipb" data-act="dgclr">${ic("trash", 14)} Leeren</button></div>` + lg.map((e) => `<div class="dgg ${e.level}">${dot(e.level === "error" ? "bad" : e.level === "warning" ? "warn" : "ok")}<div><b>${esc(e.msg)}</b><span>${esc(e.room || "Allgemein")}</span></div><em>${new Date(e.t).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</em></div>`).join("") : `<div class="dgempty">${ic("check", 26)}<b>Keine Fehler protokolliert</b><span>Hier erscheinen fehlgeschlagene Schaltvorgänge, nicht erreichbare Geräte und Meldungen der Heizer-Steuerung.</span></div>`;
    }
    return head + tabs + `<div class="dgb">${body}</div>`;
  }
  _dgModal() {
    const m = this._modal;
    return `<div class="ov" data-act="close"></div><div class="sheet wide dg" role="dialog" aria-modal="true"><div class="sh"><div><b>Gerätediagnose</b><span>Sensoren, Thermostate, Heizer und Fehler</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>${this._dgBody(m)}<div class="foot2" style="margin-top:12px"><button class="btn2 pri" data-act="close">Schließen</button></div></div>`;
  }
  _dgAct(a, b) {
    const m = this._modal;
    if (a === "dgtab") m.tab = b.dataset.k;
    else if (a === "dgonly") m.only = b.dataset.k === "1";
    else if (a === "dgbat") m.bat = m.bat === b.dataset.e ? null : b.dataset.e;
    else if (a === "dgre") { this._dgLoad(); return; }
    else if (a === "dgclr") { this._hass.callWS({ type: "fenster_heizung/clear_diag" }).then(() => { m.data.log = []; this._renderModal(); }).catch(() => this._toast("Protokoll konnte nicht geleert werden")); return; }
    else if (a === "dgcopy") { const t = (m.data.log || []).map((e) => `${e.t} [${e.level}] ${e.room || "Allgemein"}: ${e.msg}`).join("\n"); try { navigator.clipboard.writeText(t).then(() => this._toast("Protokoll kopiert")); } catch (_) { this._toast("Kopieren nicht möglich"); } return; }
    this._renderModal();
  }
  _renderModal() {
    const box = this.shadowRoot.getElementById("modal"), m = this._modal;
    const old = box.querySelector(".sheet"), top = old ? old.scrollTop : 0;
    if (!m) { box.innerHTML = ""; return; }
    const r = this._collect().find((x) => x.id === m.id) || { name: "" };
    if (m.type === "diag") { box.innerHTML = this._dgModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (m.type === "wbon") { box.innerHTML = this._wbOnModal(); return; }
    if (m.type === "sfset") { box.innerHTML = this._sfxModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (m.type === "spset") { box.innerHTML = this._spModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (["spndlg", "spnadm"].includes(m.type)) { box.innerHTML = this._spnModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (["tmpin", "tmset", "tmnorm", "tmmore"].includes(m.type)) { box.innerHTML = this._tmModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (["hzset", "hzbub", "hzpin"].includes(m.type)) { box.innerHTML = this._hzModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (["efxmgr", "efxedit"].includes(m.type)) { box.innerHTML = this._efxModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (["tgxmgr", "tgxedit", "tgxfb"].includes(m.type)) { box.innerHTML = this._tgxModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (["lixset", "lixdet", "lixoff"].includes(m.type)) { box.innerHTML = this._lixModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (m.type === "muset") { box.innerHTML = this._muxModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (m.type === "wxset") { box.innerHTML = this._wxsModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (m.type === "igtb") { box.innerHTML = this._igTbModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (m.type === "stodet") { box.innerHTML = this._stoModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (m.type === "labdet") { box.innerHTML = this._labModal(m.id); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (m.type === "labok") { box.innerHTML = this._labOkModal(m.id); return; }
    if (m.type === "labset") { box.innerHTML = this._labSetModal(); return; }
    if (m.type === "stoset") { box.innerHTML = this._stoSetModal(); return; }
    if (m.type === "iggoe") { box.innerHTML = this._igGoeModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (m.type === "ortper" || m.type === "ortzone") { box.innerHTML = m.type === "ortper" ? this._ortPerModal() : this._ortZoneModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; this._ortBind(); return; }
    if (m.type === "mods" || m.type === "wwset" || m.type === "wwsch" || m.type === "enset" || m.type === "gsset" || m.type === "evset") { box.innerHTML = this._mdModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (m.type === "wiz") { box.innerHTML = this._wzModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = m.keepTop ? top : 0; m.keepTop = true; return; }
    if (m.type === "icon") {
      const cur = this._icon(r), L = this._cfg.layout, cc = (L.colors || {})[m.id], ph = (L.photos || {})[m.id];
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Raum anpassen</b><span>${esc(r.name)}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="lsec">Symbol</div>
        ${ICON_GROUPS.map(([g, list]) => `<div class="igt">${g}</div><div class="igrid">${list.map(([k, l]) => `<button class="${k === cur ? "sel" : ""}" data-act="pick" data-k="${k}" title="${l}" aria-label="${l}">${ic2(k, 36)}</button>`).join("")}</div>`).join("")}
        <button class="lnk" data-act="preset">Symbol automatisch nach Raumname</button>
        <div class="lsec">Farbe</div>
        <div class="swatches"><button class="sw2 auto ${!cc ? "sel" : ""}" data-act="rcol" data-k="" aria-label="Automatisch" title="Automatisch"></button>${ROOM_COLORS.map((c) => `<button class="sw2 ${cc === c ? "sel" : ""}" style="background:${c}" data-act="rcol" data-k="${c}" aria-label="${c}"></button>`).join("")}<label class="cpick"><input type="color" data-f="rcolc" value="${HEX.test(cc || "") ? cc : (HEX.test(r.color || "") ? r.color : DEF_ACC)}">Eigene</label></div>
        <div class="lsec">Foto als Kartenhintergrund</div>
        <div class="phbox"><div class="pth" ${ph ? `style="background-image:url('${esc(ph)}')"` : ""}>${ph ? "" : ic("image", 22)}</div>
          <div class="pbs"><input type="file" accept="image/*" data-f="rfile" hidden><button class="lnk" data-act="rphoto">${ph ? "Foto ersetzen" : "Foto auswählen"}</button>${ph ? `<button class="lnk dng" data-act="rphotodel">Foto entfernen</button>` : ""}</div></div>
        <div class="mut sm" style="margin:0 0 8px">Das Foto wird verkleinert (ca. 560 px) und für alle Nutzer gespeichert. Höchstens 12 Fotos.</div>
        <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
    } else if (m.type === "fh") {
      const g = this._gen, sm = g.summer, S = this._sum(), wa = g.wxadj, wadj = this._wxAdj(), pv = this._pv();
      const sumInfo = S.active ? `Aktiv${S.out != null ? `: ${num(S.out, 1)} °C draußen` : ""}. Der Heizplan ruht, die Fenstermeldung bleibt.` : sm.mode === "off" ? "Aus. Der Heizplan läuft wie gewohnt." : `Inaktiv${S.out != null ? `: ${num(S.out, 1)} °C draußen, Schwelle ${num(sm.temp, 1)} °C` : ""}.`;
      const open = this._fhOpenSet(), pvn = this._pvNow(), rp = this._rate("price"), rf = this._rate("feed"), dn = (n) => (n === 1 ? "1 Tag" : n + " Tage");
      const sec = (id, ico, ttl, txt, chip, tone, body) => `<div class="fhs ${open.has(id) ? "open" : ""}"><button class="sxrow" data-act="fhsec" data-k="${id}" aria-expanded="${open.has(id)}"><span class="sxi">${ic(ico, 20)}</span><span class="sxt"><b>${ttl}</b><small>${txt}</small></span><em class="sxc ${tone}">${chip}</em><span class="sxg">${ic("chev", 16)}</span></button>${open.has(id) ? `<div class="fhb">${body}</div>` : ""}</div>`;
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Modul 1 · Einstellungen</b><span>Fenster &amp; Heizung, gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        ${sec("sum", "sun", "Sommermodus", sm.mode === "off" ? "Die Heizpläne laufen wie gewohnt." : sm.mode === "on" ? "Die Heizpläne ruhen." : `Automatisch ab ${num(sm.temp, 1)} °C, Mittel über ${dn(sm.days)}.`, S.active ? "Aktiv" : sm.mode === "off" ? "Aus" : "Bereit", S.active ? "ok" : "off", `
        <div class="mut sm" style="margin:10px 0 8px">Wenn es draußen warm genug ist, ruhen die Heizpläne. Die Fenstermeldung und alle Erinnerungen bleiben aktiv.</div>
        <div class="seg">${[["off", "Aus"], ["auto", "Automatisch"], ["on", "Immer an"]].map(([k, l]) => `<button class="${sm.mode === k ? "sel" : ""}" data-act="gsum" data-k="${k}">${l}</button>`).join("")}</div>
        ${sm.mode === "auto" ? `<div class="of"><div class="ol"><b>Ab einer Außentemperatur von</b><span>Mittel der letzten Tage, Sensor siehe Darstellung.</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="gth" value="${sm.temp}" min="5" max="35" step="0.5"><i>°C</i></span></div></div>
        <div class="of"><div class="ol"><b>Gemittelt über</b></div><div class="oc"><div class="seg oseg">${[1, 3, 7].map((d) => `<button class="${sm.days === d ? "sel" : ""}" data-act="gdays" data-k="${d}">${d === 1 ? "1 Tag" : d + " Tage"}</button>`).join("")}</div></div></div>` : ""}
        <div class="gst ${S.active ? "on" : ""}">${ic(S.active ? "sun" : "info", 15)}${sumInfo}</div>`)}
        ${sec("wx", "partly", "Wetterabhängige Absenkung", wa.on ? `Mild ab ${num(wa.mild, 0)} °C um ${num(wa.down, 1)} K senken, bei Frost bis ${num(wa.frost, 0)} °C um ${num(wa.up, 1)} K anheben.` : "Die Zieltemperatur bleibt wie im Heizplan.", !wa.on ? "Aus" : wadj && wadj.d ? "Aktiv" : "An", wa.on ? "ok" : "off", `
        <div class="mut sm" style="margin:2px 0 4px">Bei Sonne oder milder Luft sinkt die Zieltemperatur, bei Frost steigt sie. Gilt für alle Räume, die du nicht ausnimmst.</div>
        <div class="ltog"><span>Zieltemperatur nach Wetter anpassen</span><button class="sw ${wa.on ? "on" : ""}" data-act="gwx" aria-pressed="${wa.on}" aria-label="Wetter-Anpassung"></button></div>
        ${wa.on ? [["mild", "Mild ab", "°C", "Bei Sonne schon ab 5 °C weniger."], ["down", "Dann absenken um", "K", ""], ["frost", "Frost bis", "°C", ""], ["up", "Dann anheben um", "K", ""]].map(([k, l, u, h]) => `<div class="of"><div class="ol"><b>${l}</b>${h ? `<span>${h}</span>` : ""}</div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="gwxn" data-k="${k}" value="${wa[k]}" min="${k === "mild" || k === "frost" ? -20 : 0}" max="${k === "mild" || k === "frost" ? 40 : 5}" step="0.5"><i>${u}</i></span></div></div>`).join("") : ""}
        <div class="gst ${wadj && wadj.d ? "on" : ""}">${ic(wadj && wadj.d ? (wadj.fr ? "snow" : "sun") : "info", 15)}${!wa.on ? "Aus." : wadj && wadj.d ? `Aktiv: ${wadj.d > 0 ? "+" : "−"}${num(Math.abs(wadj.d), 1)} °C (${wadj.why}).` : "Gerade keine Anpassung nötig."}</div>`)}
        ${sec("pv", "bolt", "PV-Überschuss für Elektroheizer", pv.sensor ? (pvn != null ? `${wfmt(pvn)} Überschuss, ${wfmt(this._htrTotal())} an Heizer verteilt.` : "Sensor gewählt, noch kein Wert.") : "Noch kein Sensor für die Einspeisung gewählt.", pv.sensor ? "Eingerichtet" : "Offen", pv.sensor ? "ok" : "", `
        <div class="mut sm" style="margin:2px 0 4px">Elektroheizer in den Räumen heizen nur bei genug Überschuss. Sie schaltest du in den Raumeinstellungen ein.</div>
        <div class="mut sm" style="margin:0">Sensor für die Einspeisung ins Netz</div>${this._wzSel(Object.keys(this._hass.states).filter((k) => k.startsWith("sensor.") && (this._hass.states[k].attributes.device_class === "power" || /^k?W$/.test(this._hass.states[k].attributes.unit_of_measurement || ""))), pv.sensor, "gpvs", "", "– keiner –", PK_HINT.grid)}
        <div class="seg">${[["export", "Einspeisung positiv"], ["import", "Netzbezug positiv"]].map(([k, l]) => `<button class="${pv.sign === k ? "sel" : ""}" data-act="gpvsign" data-k="${k}">${l}</button>`).join("")}</div>
        ${[["reserve", "Reserve", "W", "Bleibt zusätzlich zur Heizerleistung übrig.", 0, 2000, 50], ["delay", "Einschalten nach", "Min.", "So lange muss der Überschuss anliegen.", 0, 30, 1], ["minrun", "Mindestlaufzeit", "Min.", "Kürzer läuft ein Heizer nicht an einem Stück.", 0, 120, 5]].map(([k, l, u, h, lo, hi, st]) => `<div class="of"><div class="ol"><b>${l}</b><span>${h}</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="gpvn" data-k="${k}" value="${pv[k]}" min="${lo}" max="${hi}" step="${st}"><i>${u}</i></span></div></div>`).join("")}
        <div class="mut sm" style="margin:6px 0 0">Batterie-Ladestand (optional)</div>${this._wzSel(Object.keys(this._hass.states).filter((k) => k.startsWith("sensor.") && (this._hass.states[k].attributes.device_class === "battery" || this._hass.states[k].attributes.unit_of_measurement === "%")), pv.soc_sensor, "gpvb", "", "– keiner –", PK_HINT.bat)}
        ${pv.soc_sensor ? `<div class="of"><div class="ol"><b>Heizer erst ab</b><span>Die Batterie wird zuerst geladen.</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="gpvn" data-k="soc_min" value="${pv.soc_min}" min="0" max="100" step="5"><i>%</i></span></div></div>` : ""}
        <div class="gst ${this._pvNow() != null ? "on" : ""}">${ic(this._pvNow() != null ? "bolt" : "info", 15)}${this._pvNow() != null ? `Aktuell ${wfmt(this._pvNow())} Überschuss, ${wfmt(this._htrTotal())} an Heizer verteilt.` : "Noch kein Sensor gewählt."}</div>`)}
        ${sec("pr", "chart", "Strompreis und Einspeisevergütung", `Netzbezug ${num(rp, 2)} ct/kWh, Einspeisung ${num(rf, 2)} ct/kWh. Grundlage für den Vorteil im Bericht.`, rp > 0 || rf > 0 ? "Eingerichtet" : "Offen", rp > 0 || rf > 0 ? "ok" : "", `
        ${[["price", "Strompreis (Netzbezug)", "Festpreis", "Preis pro kWh aus dem Netz."], ["feed", "Einspeisevergütung", "Festvergütung", "Vergütung pro eingespeister kWh."]].map(([k, l, fl, h]) => { const ent = pv[k + "_mode"] === "entity", sn = pv[k + "_sensor"]; return `<div class="mut sm" style="margin:6px 0 0">${l}${k === "price" ? " für den Vorteil im Bericht" : ""}</div>
        <div class="seg">${[["fix", "Festwert"], ["entity", "Entität"]].map(([m, t]) => `<button class="${(ent ? "entity" : "fix") === m ? "sel" : ""}" data-act="gpvpm" data-p="${k}" data-k="${m}">${t}</button>`).join("")}</div>
        ${ent ? `${this._wzSel(Object.keys(this._hass.states).filter((e) => e.startsWith("sensor.") && (this._hass.states[e].attributes.device_class === "monetary" || (/(kwh|wh)$/i.test(this._hass.states[e].attributes.unit_of_measurement || "") && /€|eur|ct|cent/i.test(this._hass.states[e].attributes.unit_of_measurement || "")) || e === sn)), sn, "gpvp", `data-p="${k}"`, "– keiner –", /preis|price|tarif|tibber|awattar|strom/i)}
        <div class="mut sm" style="margin:2px 0 0">${sn ? `Aktuell ${num(this._rate(k), 2)} ct/kWh${Number(pv[k]) ? ` (${fl} ${num(pv[k], 2)} ct/kWh, falls der Sensor ausfällt)` : ""}` : `Ohne Sensor gilt der ${fl}.`}</div>` : `<div class="of"><div class="ol"><b>${fl}</b><span>${h}</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="gpvn" data-k="${k}" value="${pv[k]}" min="0" max="100" step="0.01"><i>ct/kWh</i></span></div></div>`}`; }).join("")}`)}
        <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
    } else if (m.type === "gen") {
      const g = this._gen, rs = m.restore, u = this._upd;
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Sichern &amp; Wiederherstellen</b><span>gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="mut sm" style="margin:2px 0 4px">Eine Datei mit allen Räumen, Einstellungen, Heizplänen, Anwesenheit und dem Aussehen des Dashboards.</div>
        ${rs ? `<div class="gbox"><b>Sicherung gefunden</b>${esc(new Date(rs.created).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" }))} · Version ${esc(rs.version || "?")}<br>${Object.keys(rs.rooms).length} Räume · ${Object.values(rs.plans || {}).filter((p) => p && p.entries && p.entries.length).length} Heizpläne · Aussehen · Anwesenheit<br><span class="mut">Das ersetzt die aktuellen Einstellungen.</span></div>
          <div class="foot2"><button class="btn2" data-act="rsno">Abbrechen</button><button class="btn2 pri" data-act="rsgo">Wiederherstellen</button></div>`
        : `<div class="gbtns"><button class="btn2" data-act="bk">${ic("download", 16)}Sicherung speichern</button><button class="btn2" data-act="rs">${ic("upload", 16)}Sicherung einlesen</button></div><input type="file" accept="application/json,.json" data-f="rsfile" hidden>`}
        ${rs ? "" : this._ebkHtml(m)}
        ${rs ? "" : this._bakHtml(m)}
        <div class="lsec">${ic("bell", 15)}Updates</div>
        <div class="ltog"><span>Auf neue Versionen hinweisen</span><button class="sw ${g.updates !== false ? "on" : ""}" data-act="gupd" aria-pressed="${g.updates !== false}" aria-label="Update-Hinweise"></button></div>
        <div class="gst">${ic("info", 15)}Installiert ${esc(this._ver || "–")}${u ? ` · neueste ${esc(u.latest)}` : ""}<button class="lnk" data-act="chk" style="margin-left:auto">Jetzt prüfen</button></div>
        <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
    } else if (m.type === "news") {
      const u = this._upd || { latest: "", notes: [] };
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Neu in Version ${esc(u.latest)}</b><span>${u.date ? "veröffentlicht am " + esc(new Date(u.date + "T12:00:00").toLocaleDateString("de-DE")) : ""}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <ul class="news">${(u.notes || []).map(([i, t]) => `<li>${ic(i, 18)}<span>${esc(t)}</span></li>`).join("")}</ul>
        <div class="mut sm" style="margin:10px 0">Aktualisieren kannst du in HACS. Danach Home Assistant neu starten.</div>
        <div class="foot2"><button class="btn2" data-act="skipv">Überspringen</button><button class="btn2 pri" data-act="hacs">In HACS öffnen</button></div></div>`;
    } else if (m.type === "my") {
      const my = this._my(), all = this._collect(true), ids = all.map((r) => r.id);
      const ord = my.order.length ? [...my.order.filter((i) => ids.includes(i)), ...ids.filter((i) => !my.order.includes(i))] : ids, byId = Object.fromEntries(all.map((r) => [r.id, r]));
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Meine Ansicht</b><span>nur für dich, andere Nutzer sehen die gemeinsame Ansicht</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="ltog"><span>Eigene Ansicht verwenden</span><button class="sw ${my.on ? "on" : ""}" data-act="mytog" aria-pressed="${my.on}" aria-label="Eigene Ansicht"></button></div>
        <div class="lsec">${ic("home", 15)}Räume</div>
        ${ord.map((id, i) => `<div class="myrow ${my.hidden.includes(id) ? "off" : ""}"><button class="sw ${my.hidden.includes(id) ? "" : "on"}" data-act="myvis" data-id="${esc(id)}" aria-label="Raum anzeigen"></button><span>${esc(byId[id].name)}</span>
          <button class="ibtn" data-act="mymv" data-id="${esc(id)}" data-d="-1" ${i === 0 ? "disabled" : ""} aria-label="Nach oben">${ic("up", 16)}</button><button class="ibtn" data-act="mymv" data-id="${esc(id)}" data-d="1" ${i === ord.length - 1 ? "disabled" : ""} aria-label="Nach unten">${ic("chev", 16)}</button></div>`).join("")}
        <div class="lsec">${ic("grid", 15)}Bereiche</div>
        ${Object.entries(BLOCKS).map(([k, l]) => `<div class="myrow"><button class="sw ${my.hb.includes(k) ? "" : "on"}" data-act="myblk" data-id="${k}" aria-label="${l} anzeigen"></button><span>${l}</span></div>`).join("")}
        <div class="foot2" style="margin-top:12px"><button class="btn2" data-act="myreset">Zurücksetzen</button><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
    } else if (m.type === "hrep") {
      const rr = this._collect(true).find((x) => x.id === m.id) || { name: "", htr: null };
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Heizer-Bericht</b><span>${esc(rr.name)} · ${m.day.split("-").reverse().join(".")}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        ${this._hrBody(rr, m)}</div>`;
      if (m.data && !m.loading) this._hrHover(Math.min(13 * 60, m.data.pts[m.data.pts.length - 1].t));
    } else if (m.type === "hrepall") {
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Heizer-Bericht</b><span>alle Räume · letzte 7 Tage</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        ${this._hrAllBody()}</div>`;
    } else if (m.type === "look") {
      const S = this._hass.states, a = this._acc(), w = this._wxCfg(), nm = (k) => S[k].attributes.friendly_name || k;
      const wl = Object.keys(S).filter((k) => k.startsWith("weather.")), sl = Object.keys(S).filter((k) => k.startsWith("sensor.") && (S[k].attributes.device_class === "temperature" || /°[CF]/.test(S[k].attributes.unit_of_measurement || "")));
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Darstellung</b><span>gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="lsec">${ic("palette", 15)}Akzentfarbe</div>
        <div class="swatches">${ACCENTS.map((c) => `<button class="sw2 ${a === c ? "sel" : ""}" style="background:${c}" data-act="lacc" data-k="${c}" aria-label="${c}"></button>`).join("")}<label class="cpick"><input type="color" data-f="lacc" value="${a}">Eigene</label></div>
        ${this._heroLook()}
        <div class="lsec">${ic("sun", 15)}Wetter in der Kopfkarte</div>
        <div class="ltog"><span>Außentemperatur und Wetter anzeigen</span><button class="sw ${w.on ? "on" : ""}" data-act="lwx" aria-pressed="${w.on}" aria-label="Wetter anzeigen"></button></div>
        ${w.on ? `<div class="mut sm" style="margin:0">Wetter-Entität</div>${this._wzSel(wl, w.entity, "lwxe", "", "Automatisch" + (wl[0] ? ` (${nm(wl[0])})` : ""), /wetter|weather|dwd|home/i)}
        <div class="mut sm" style="margin:0">Außentemperatur-Sensor</div>${this._wzSel(sl, w.outdoor, "lwxo", "", "Vom Wetterdienst übernehmen", PK_HINT.outdoor)}` : ""}
        <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
    } else if (m.type === "opt") {
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Raumeinstellungen</b><span>${esc(m.name || r.name)} · gilt nach dem Speichern</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="osecs">${this._optBody(m)}</div>
        <div class="olinks"><button class="lnk" data-act="ohost">${ic("sliders", 15)}In den Home-Assistant-Einstellungen öffnen</button><button class="lnk dng" data-act="odel">${ic("trash", 15)}Raum entfernen</button></div>
        <div class="foot2"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="osave" ${m.busy ? "disabled" : ""}>${m.busy ? "Speichert …" : "Speichern"}</button></div></div>`;
    } else if (m.type === "rep") {
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Bericht</b><span>${esc(r.name)} · ${m.day.split("-").reverse().join(".")}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        ${this._learnBox(r)}${this._repBody(r, m)}</div>`;
      const dd = box.querySelector(".rdays"); if (dd) dd.scrollLeft = m.keepScroll ?? 99999;
      if (this._repData) { const ev = this._repData.ev.find((e) => e.c === "#60a5fa"), last = this._repData.pts[this._repData.pts.length - 1].t; this._repHover(ev ? ev.t + 2 : Math.min(12 * 60, last)); }
    } else if (m.type === "grp") {
      const d = m.draft, rooms = this._collect(), owner = (id) => (this._cfg.layout.groups || []).find((g) => g.id !== d.id && (g.rooms || []).includes(id));
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>${d.isNew ? "Neue Gruppe" : "Gruppe bearbeiten"}</b><span>Räume zusammenfassen</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="mut sm" style="margin:0">Name</div><input class="gname" data-f="gname" value="${esc(d.name)}" placeholder="z. B. Obergeschoss" maxlength="30">
        <div class="mut sm" style="margin:0">Symbol</div><div class="gicons">${GROUP_ICONS.map((k) => `<button class="${d.icon === k ? "sel" : ""}" data-act="gicon" data-k="${k}" aria-label="${k}">${ic(k, 22)}</button>`).join("")}</div>
        <div class="mut sm" style="margin:0">Räume in dieser Gruppe</div>
        <div class="dchips">${rooms.map((r) => { const o = owner(r.id); return `<button class="dc ${d.rooms.includes(r.id) ? "sel" : ""}" data-act="gpick" data-r="${esc(r.id)}">${esc(r.name)}${o && !d.rooms.includes(r.id) ? ` <small style="opacity:.7">· ${esc(o.name)}</small>` : ""}</button>`; }).join("")}</div>
        <div class="mut sm" style="margin:0 0 12px">Ein Raum gehört immer nur zu einer Gruppe. Nicht zugeordnete Räume stehen unter „Weitere Räume“.</div>
        <div class="foot2">${d.isNew ? "" : `<button class="btn2 del" data-act="gdel" aria-label="Gruppe löschen">${ic("trash", 17)}</button>`}<button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="gsave">Speichern</button></div></div>`;
    } else if (m.type === "why") {
      const mm = MODE[r.mode] || MODE.regelung_aus;
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>${r.mode === "heizung_pausiert" ? "Warum pausiert die Heizung?" : "Warum „" + mm.t + "“?"}</b><span>${esc(r.name)}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="why-l">${(r.why || []).map((w) => `<div class="wl ${w.s}"><i></i><span>${esc(w.t)}</span></div>`).join("") || `<div class="mut">Keine Angaben vorhanden.</div>`}</div>
        <div class="foot2"><button class="btn2" data-act="close">Schließen</button></div></div>`;
    } else if (m.type === "vac") {
      const d = m.draft;
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Urlaub planen</b><span>Alle Räume · Absenkung ${num(d.temp, 1)} °C</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="vrow"><span>Von</span><input type="date" value="${d.from}" data-f="vfrom"></div>
        <div class="vrow"><span>Bis</span><input type="date" value="${d.to}" data-f="vto" min="${d.from}"></div>
        <div class="vrow"><span>Am Rückkehrtag vorheizen</span><button class="sw ${d.preheat ? "on" : ""}" data-act="vpre" aria-pressed="${d.preheat}"></button></div>
        ${d.preheat ? `<div class="vrow"><span>Vorheizen ab</span><input type="time" value="${d.preheat_time}" data-f="vtime" style="background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:8px;font:inherit"></div>` : ""}
        <div class="mut sm" style="margin:2px 0 0">${d.preheat ? `Am Bis-Tag gilt ab ${d.preheat_time} Uhr wieder der Heizplan.` : "Der Heizplan gilt wieder ab dem Tag nach dem Bis-Datum."}</div>
        <div class="mut sm" style="margin:10px 0 0">Die Absenktemperatur und die automatische Erkennung stellst du unter „Einstellungen“ ein.</div>
        <div class="foot2" style="margin-top:14px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="vsave">Urlaub starten</button></div></div>`;
    } else if (m.type === "pset") {
      const d = m.draft, persons = Object.keys(this._hass.states).filter((e) => e.startsWith("person."));
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Einstellungen</b><span>Anwesenheit &amp; Urlaub</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="mut sm" style="margin:0 0 4px">Absenkung</div>
        <div class="vrow"><span>Temperatur bei Abwesenheit und Urlaub</span><div class="step"><button data-act="vtm" aria-label="kälter">${ic("minus", 18)}</button><b style="color:${heat(d.temp)}">${num(d.temp, 1)} °C</b><button data-act="vtp" aria-label="wärmer">${ic("plus", 18)}</button></div></div>
        <div class="mut sm" style="margin:14px 0 4px">Automatisch erkennen</div>
        <div class="vrow"><span>Abwesend, wenn niemand zu Hause ist</span><button class="sw ${d.auto ? "on" : ""}" data-act="vauto" aria-pressed="${d.auto}"></button></div>
        ${d.auto ? `<div class="dchips">${persons.map((e) => `<button class="dc ${d.persons.includes(e) ? "sel" : ""}" data-act="vper" data-e="${esc(e)}">${esc(this._hass.states[e].attributes.friendly_name || e)}</button>`).join("")}</div>
        <div class="vrow"><span>Nach</span><div class="step"><button data-act="vawm" aria-label="weniger">${ic("minus", 18)}</button><b>${d.away_after} Min.</b><button data-act="vawp" aria-label="mehr">${ic("plus", 18)}</button></div></div>` : ""}
        <div class="foot2" style="margin-top:14px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="psetsave">Speichern</button></div></div>`;
    } else {
      const d = m.draft, pts = points(d.entries), today = Math.floor(nowMin() / 1440);
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Heizplan</b><span>${esc(r.name)}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="row"><span>Heizplan aktiv</span><button class="sw ${d.enabled ? "on" : ""}" data-act="penable" aria-label="Heizplan aktiv" aria-pressed="${d.enabled}"></button></div>
        <div class="mut sm" style="margin:0 0 6px">Beim Planstart ausgeschaltete Thermostate einschalten</div>
        <div class="seg">${[["keep", "Nein"], ["heat", "Heizen"], ["auto", "Automatik"]].map(([k, l]) => `<button class="${d.mode === k ? "sel" : ""}" data-act="pmode" data-k="${k}">${l}</button>`).join("")}</div>
        <div class="mut sm" style="margin:0 0 4px">Woche · Tag antippen, um dessen Schaltpunkte zu markieren</div>
        ${pts.length ? `<div class="wax"><span></span><div><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div><span></span></div>
        <div class="week">${DAYS.map((x, k) => { const sg = segs(pts, k), lo = Math.min(...sg.map((q) => q.t)), hi = Math.max(...sg.map((q) => q.t)); return `<button class="wd ${m.day === k ? "sel" : ""} ${k === today ? "today" : ""}" data-act="pday" data-d="${k}" aria-pressed="${m.day === k}" aria-label="${DAYS_LONG[k]}"><span>${x}</span>${barRow(pts, k, k === today ? nowMin() : null)}<em>${lo === hi ? num(lo, 1) + "°" : num(lo, 1) + "–" + num(hi, 1) + "°"}</em></button>`; }).join("")}</div>` : `<div class="mut">Noch keine Schaltpunkte.</div>`}
        <div class="mut sm">Farbe = Temperatur</div>
        ${d.entries.map((e, i) => `<div class="sp ${m.day != null && !e.days.includes(m.day) ? "dim" : ""}"><div class="sp1">
          <input type="time" value="${e.time}" data-i="${i}" data-f="time" aria-label="Uhrzeit">
          <div class="step"><button data-act="tmin" data-i="${i}" aria-label="kälter">${ic("minus", 18)}</button><b style="color:${heat(e.temp)}">${num(e.temp, 1)} °C</b><button data-act="tplus" data-i="${i}" aria-label="wärmer">${ic("plus", 18)}</button></div>
          <button class="ibtn" data-act="pdel" data-i="${i}" aria-label="Schaltpunkt löschen">${ic("trash", 17)}</button></div>
          <div class="mut sm" style="margin:2px 0 2px">Gilt an (mehrere Tage möglich)</div>
          <div class="dchips sm">${DAYS.map((x, k) => `<button class="dc ${e.days.includes(k) ? "sel" : ""}" data-act="pdc" data-i="${i}" data-d="${k}">${x}</button>`).join("")}</div>
          <div class="quick"><button class="lnk" data-act="pdq" data-i="${i}" data-q="wk">Mo–Fr</button><button class="lnk" data-act="pdq" data-i="${i}" data-q="we">Sa–So</button><button class="lnk" data-act="pdq" data-i="${i}" data-q="all">Alle Tage</button><button class="lnk" data-act="pdup" data-i="${i}">${ic("copy", 14)}Kopie</button></div></div>`).join("")}
        <div class="btns"><button class="lnk" data-act="padd">${ic("plus", 16)}Schaltpunkt</button><button class="lnk" data-act="ptpl">Vorlage laden</button></div>
        <div class="foot2"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="psave">Speichern</button></div></div>`;
    }
    const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top;
  }

  /* ---------------- Verschieben per Ziehen ---------------- */
  _scroller() {
    let n = this;
    while (n) {
      if (n instanceof HTMLElement) { const s = getComputedStyle(n); if (/(auto|scroll)/.test(s.overflowY) && n.scrollHeight > n.clientHeight + 2) return n; }
      n = n.parentElement || (n.getRootNode && n.getRootNode().host);
    }
    return document.scrollingElement;
  }
  _dragStart(e, h) {
    if (e.button !== undefined && e.button > 0) return;
    const item = h.closest("[data-sort]"); if (!item) return;
    e.preventDefault();
    const rc = item.getBoundingClientRect(), ghost = item.cloneNode(true);
    ghost.classList.add("ghost"); ghost.removeAttribute("data-sort");
    Object.assign(ghost.style, { left: rc.left + "px", top: rc.top + "px", width: rc.width + "px", height: rc.height + "px", overflow: "hidden" });
    this.shadowRoot.appendChild(ghost); item.classList.add("dragging");
    this._drag = { item, container: item.parentElement, group: item.dataset.sort, ghost, dx: e.clientX - rc.left, dy: e.clientY - rc.top, x: e.clientX, y: e.clientY, t: null, after: false };
    this._dragging = true;
    try { h.setPointerCapture(e.pointerId); } catch (_) { /* egal */ }
    this._mv = (ev) => { ev.preventDefault(); const d = this._drag; d.x = ev.clientX; d.y = ev.clientY; d.ghost.style.left = d.x - d.dx + "px"; d.ghost.style.top = d.y - d.dy + "px"; this._retarget(); };
    this._up = () => this._dragEnd(true);
    this._cancel = () => this._dragEnd(false);
    window.addEventListener("pointermove", this._mv, { passive: false });
    window.addEventListener("pointerup", this._up);
    window.addEventListener("pointercancel", this._cancel);
    const loop = () => {
      if (!this._dragging) return;
      const d = this._drag, sc = this._scroller();
      if (sc) { if (d.y < 110) sc.scrollTop -= (110 - d.y) / 5; else if (d.y > innerHeight - 110) sc.scrollTop += (d.y - (innerHeight - 110)) / 5; }
      this._retarget(); this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
    this._retarget();
  }
  _retarget() {
    const d = this._drag; if (!d) return;
    const sibs = [...d.container.children].filter((c) => c !== d.item && c.dataset.sort === d.group);
    sibs.forEach((s) => s.classList.remove("drop-before", "drop-after"));
    let best = null, bd = 1e9;
    for (const s of sibs) {
      const r = s.getBoundingClientRect();
      if (d.x >= r.left && d.x <= r.right && d.y >= r.top && d.y <= r.bottom) { best = s; break; }
      const dist = Math.hypot(d.x - (r.left + r.width / 2), d.y - (r.top + r.height / 2));
      if (dist < bd) { bd = dist; best = s; }
    }
    d.t = best; if (!best) return;
    const r = best.getBoundingClientRect(), cols = getComputedStyle(d.container).gridTemplateColumns.split(" ").length;
    const sameRow = Math.abs(r.top + r.height / 2 - d.y) < r.height / 2;
    d.after = (d.group === "room" || d.group === "mublk" || d.group === "hzblk") && cols > 1 && sameRow ? d.x > r.left + r.width / 2 : d.y > r.top + r.height / 2;
    best.classList.add(d.after ? "drop-after" : "drop-before");
  }
  _dragEnd(commit) {
    const d = this._drag; if (!d) return;
    window.removeEventListener("pointermove", this._mv); window.removeEventListener("pointerup", this._up); window.removeEventListener("pointercancel", this._cancel);
    cancelAnimationFrame(this._raf); d.ghost.remove(); d.item.classList.remove("dragging");
    [...d.container.children].forEach((s) => s.classList.remove("drop-before", "drop-after"));
    if (commit && d.t) {
      d.after ? d.t.after(d.item) : d.t.before(d.item);
      const ids = [...d.container.children].filter((c) => c.dataset.sort === d.group).map((c) => c.dataset.id);
      if (d.group === "room") {
        const all = this._collect().map((r) => r.id), slots = all.map((id, i) => (ids.includes(id) ? i : -1)).filter((i) => i >= 0);
        slots.forEach((pos, k) => (all[pos] = ids[k])); this._cfg.layout.rooms = all;
      } else if (d.group === "mublk") this._cfg.layout.mu = { ...(this._cfg.layout.mu || {}), order: ids };
      else if (d.group === "hzblk") { const h = this._hzCfg(); this._cfg.layout.start = { ...(this._cfg.layout.start || {}), order: [...ids, ...h.order.filter((x) => !ids.includes(x))] }; }
      else this._cfg.layout.blocks = ids;
      this._saveLayout();
    }
    this._drag = null; this._dragging = false; this._render();
  }

