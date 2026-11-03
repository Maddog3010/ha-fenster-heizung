  /* ================= Sensorsuche ohne Aufklappmenü (Messwerk M2: S1 Vorschläge, S2 Nach Raum, S4 Filter) =================
     Ersetzt die lange Liste mit Suchfeld in jeder Sensor-Auswahl. Gewählt wird wie bisher über „pkpick“, alle Aufrufer bleiben gleich. */
  _pkSt() { return (this._pkS = this._pkS || { tab: "s1", area: "", dev: "", u: "", a: "", i: "", more: 0 }); }
  _pkArea(e) {
    const H = this._hass, en = (H.entities || {})[e] || {}, dv = en.device_id ? (H.devices || {})[en.device_id] || {} : {};
    const id = en.area_id || dv.area_id || "", ar = id && (H.areas || {})[id];
    return { id, name: ar ? ar.name || id : "", dev: en.device_id || "", devName: dv.name_by_user || dv.name || "", man: dv.manufacturer || "", plat: en.platform || "" };
  }
  /* Raum aus dem Zusammenhang: Raumeinstellungen, Messwerk-Aufgabe „… · Bad“, Messraum */
  _pkCtx() {
    const m = this._modal || {};
    if (m.type === "opt") return m.name || "";
    if (m.type === "mwpick") { const t = ((this._mwD || {}).tasks || []).find((x) => x.id === m.k); return t && t.n.includes(" · ") ? t.n.split(" · ").pop() : ""; }
    if (m.type === "msx" || m.type === "msedit") return (m.draft && m.draft.name) || "";
    return "";
  }
  _pkScore(e, h, ctx, cur) {
    const st = this._hass.states[e], A = this._pkArea(e), nm = this._stNorm(`${this._wzName(e)} ${e}`), c = this._stNorm(ctx), why = []; let s = 30;
    if (h && (h.test(e) || h.test(this._wzName(e)))) { s += 30; why.push("Name passt"); }
    if (c && A.name && this._stNorm(A.name) === c) { s += 32; why.push(`im Bereich ${A.name}`); }
    else if (c && nm.includes(c)) { s += 18; why.push(`„${ctx}“ im Namen`); }
    else if (A.name) why.push(A.name);
    if (st && !["unavailable", "unknown"].includes(String(st.state))) { s += 8; } else { s -= 25; why.push("liefert gerade nichts"); }
    const u = (st && st.attributes.unit_of_measurement) || ""; if (u) why.push(u);
    const dc = (st && st.attributes.device_class) || "";
    if (["temperature", "humidity"].includes(dc) && /thermostat|trv|ventil|heizkörper/i.test(`${this._wzName(e)} ${A.devName}`)) { s -= 14; why.push("misst am Heizkörper"); }
    const used = this._mwD && this._mwD.sensors && this._mwD.sensors[e];
    if (used && e !== cur) { s -= 22; why.push("schon für etwas anderes genutzt"); }
    if (e === cur) { s += 10; why.unshift("jetzt gewählt"); }
    return { e, s: Math.max(1, Math.min(98, s)), why };
  }
  _pkRow(e, pid, cur, extra) {
    const st = this._hass.states, x = st[e], v = x ? `${esc(x.state)}${x.attributes.unit_of_measurement ? " " + esc(x.attributes.unit_of_measurement) : ""}` : "nicht verfügbar";
    return `<button class="pkrow ${e === cur ? "cur" : ""}" data-act="pkpick" data-pid="${esc(pid)}" data-v="${esc(e)}"><span><b>${esc(this._wzName(e))}</b><small>${extra || esc(e)}</small></span><span class="pkv">${v}</span></button>`;
  }
  _pkFinder(pid, opts, cur, f, none, h) {
    const P = this._pkSt(), all = [...new Set([...opts, ...(cur && !opts.includes(cur) ? [cur] : [])])], ctx = this._pkCtx();
    if (f === "enent") { const k = (/data-k="([a-z0-9]+)"/.exec(pid) || [])[1]; h = { pv: /solar|pv|fronius|wechselrichter|inverter|sma|kostal|huawei/i, pv2: /balkon|zweite|mini|hyper_solar|bkw/i, bat: /batter|akku|speicher|hyper/i, bchg: /lad|charge/i, bdis: /entlad|discharge/i, house: /haus|verbrauch|load/i, pve: /ertrag|yield|solar.*energ/i, imp: /bezug|import/i, exp: /einspeis|export/i }[k] || h; }
    const tabs = [["s1", "Vorschläge"], ["s2", "Nach Raum"], ["s4", "Filter"]];
    const head = `<div class="seg pkseg">${tabs.map(([k, l]) => `<button class="${P.tab === k ? "sel" : ""}" data-act="pktab" data-k="${k}">${l}</button>`).join("")}</div>`;
    const clr = /add$/.test(f) ? "" : `<button class="pkrow pkclr" data-act="pkpick" data-pid="${esc(pid)}" data-v="">${esc(none)}</button>`;
    if (!all.length) return `<div class="pkbox">${head}<div class="pkno">Keine passende Entität in Home Assistant gefunden.</div></div>`;
    let body = "";
    if (P.tab === "s1") {
      const sc = all.map((e) => this._pkScore(e, h, ctx, cur)).sort((a, b) => b.s - a.s || this._wzName(a.e).localeCompare(this._wzName(b.e), "de"));
      const top = sc.slice(0, 3), rest = sc.length - top.length;
      body = top.map((x, i) => `<div class="pkcard ${i === 0 ? "best" : ""}"><div class="pkch"><span class="pkt"><b>${esc(this._wzName(x.e))}</b><small>${esc(x.e)}</small></span><span class="pkv">${(() => { const s = this._hass.states[x.e]; return s ? `${esc(s.state)}${s.attributes.unit_of_measurement ? " " + esc(s.attributes.unit_of_measurement) : ""}` : "–"; })()}</span></div>
        <div class="pkwhy"><em class="pkpct">${x.s} %</em>${esc(x.why.join(" · "))}</div>
        <div class="pkbt">${x.e === cur ? `<span class="mut sm">ist gewählt</span>` : `<button class="btn2 ${i === 0 ? "pri" : ""}" data-act="pkpick" data-pid="${esc(pid)}" data-v="${esc(x.e)}">Passt</button>`}</div></div>`).join("")
        + `<div class="pkmore">${rest > 0 ? `${rest} weitere passende · <button class="lnk" data-act="pktab" data-k="s2">Nach Raum suchen</button> · <button class="lnk" data-act="pktab" data-k="s4">Filtern</button>` : ""}</div>${clr}`;
    } else if (P.tab === "s2") {
      const by = {}; all.forEach((e) => { const A = this._pkArea(e), k = A.id || "_"; (by[k] = by[k] || { name: A.name || "Ohne Bereich", ents: [] }).ents.push(e); });
      const ctxId = Object.keys(by).find((k) => ctx && this._stNorm(by[k].name) === this._stNorm(ctx)) || "";
      const ar = P.area && by[P.area] ? P.area : "";
      if (!ar) {
        body = `<div class="pkq">Wo ist der Sensor?</div><div class="pktiles">${Object.entries(by).sort((a, b) => (b[0] === ctxId) - (a[0] === ctxId) || (a[0] === "_") - (b[0] === "_") || a[1].name.localeCompare(b[1].name, "de")).map(([k, g]) => `<button class="pktile ${k === ctxId ? "hint" : ""}" data-act="pkarea" data-k="${esc(k)}"><b>${esc(g.name)}</b><small>${g.ents.length} ${g.ents.length === 1 ? "passende" : "passende"}${k === ctxId ? " · dieser Raum" : ""}</small></button>`).join("")}</div>`;
      } else {
        const devs = {}; by[ar].ents.forEach((e) => { const A = this._pkArea(e), k = A.dev || "_"; (devs[k] = devs[k] || { name: A.devName || "Ohne Gerät", man: A.man, ents: [] }).ents.push(e); });
        body = `<div class="pkq"><button class="lnk" data-act="pkarea" data-k="">‹ Alle Räume</button> · <b>${esc(by[ar].name)}</b></div>` + Object.values(devs).map((d) => `<div class="pkdev"><div class="pkdh">${ic("tools", 14)}<b>${esc(d.name)}</b>${d.man ? `<small>${esc(d.man)}</small>` : ""}</div>${d.ents.map((e) => this._pkRow(e, pid, cur)).join("")}</div>`).join("");
      }
      body += clr;
    } else {
      const meta = all.map((e) => { const A = this._pkArea(e), s = this._hass.states[e]; return { e, u: (s && s.attributes.unit_of_measurement) || "", a: A.name || "Ohne Bereich", i: (A.man || (A.plat || "").replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase())) }; });
      const chips = (key, lab) => { const vals = [...new Set(meta.map((x) => x[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "de")); if (vals.length < 2) return ""; return `<div class="pkfl"><span>${lab}</span>${vals.slice(0, 14).map((v) => `<button class="pkchip ${P[key] === v ? "sel" : ""}" data-act="pkflt" data-k="${key}" data-v="${esc(v)}">${esc(v)}</button>`).join("")}</div>`; };
      const hit = meta.filter((x) => (!P.u || x.u === P.u) && (!P.a || x.a === P.a) && (!P.i || x.i === P.i)), lim = 12 + (P.more || 0);
      body = chips("u", "Einheit") + chips("a", "Raum") + chips("i", "Integration") + `<div class="pkcnt">${hit.length} ${hit.length === 1 ? "Treffer" : "Treffer"}${P.u || P.a || P.i ? ` · <button class="lnk" data-act="pkflt" data-k="" data-v="">Filter löschen</button>` : ""}</div>`
        + `<div class="pklist">${hit.slice(0, lim).map((x) => this._pkRow(x.e, pid, cur, `${esc(x.a)}${x.i ? " · " + esc(x.i) : ""}`)).join("")}</div>${hit.length > lim ? `<button class="lnk pkmorebtn" data-act="pkmore">${hit.length - lim} weitere zeigen</button>` : ""}${clr}`;
    }
    return `<div class="pkbox pkf">${head}${body}</div>`;
  }
  _pkAct(a, b) {
    const P = this._pkSt(), k = b.dataset.k;
    if (a === "pktab") { P.tab = k; P.more = 0; }
    else if (a === "pkarea") P.area = k || "";
    else if (a === "pkflt") { if (!k) { P.u = P.a = P.i = ""; } else P[k] = P[k] === b.dataset.v ? "" : b.dataset.v; P.more = 0; }
    else if (a === "pkmore") P.more = (P.more || 0) + 24;
    if (this._modal) this._renderModal(); else this._render();
  }
  /* ---- Messwerk: Sensor direkt zuordnen (geht über dieselben Wege wie die Fenster der Module, mit Prüfung und Verlauf) */
  _mwOpts(t) {
    const st = this._hass.states, ks = Object.keys(st), un = (e) => (st[e].attributes || {}).unit_of_measurement || "", dc = (e) => (st[e].attributes || {}).device_class || "";
    const sen = (fn) => ks.filter((e) => e.startsWith("sensor.") && fn(e)), id = t.id, key = id.split(".").pop();
    const P = { power: [sen((e) => dc(e) === "power" || /^k?W$/.test(un(e))), null], energy: [sen((e) => dc(e) === "energy" || /^[kM]?Wh$/.test(un(e))), null], pct: [sen((e) => dc(e) === "battery" || un(e) === "%"), PK_HINT.bat], temp: [sen((e) => dc(e) === "temperature" || /°[CF]/.test(un(e))), PK_HINT.outdoor], price: [sen((e) => dc(e) === "monetary" || /(ct|€|eur|cent)/i.test(un(e))), /preis|price|tarif|tibber|awattar/i] };
    if (id === "haus.energy.ent.grid") return [P.power[0], PK_HINT.grid];
    if (id === "haus.energy.ent.pv" || id === "haus.energy.ent.pv2") return [P.power[0], /solar|pv|fronius|wechselrichter|inverter|sma|kostal|huawei|balkon/i];
    if (id === "haus.energy.ent.bat" || id === "haus.energy.ent.bchg" || id === "haus.energy.ent.bdis") return [P.power[0], /batter|akku|speicher|zendure|hyper/i];
    if (id === "haus.energy.ent.house") return [P.power[0], /haus|verbrauch|house|load/i];
    if (/^haus\.energy\.ent\.(pve|pve2)$/.test(id)) return [P.energy[0], /solar|pv|ertrag|yield|produc/i];
    if (id === "haus.energy.ent.imp") return [P.energy[0], /bezug|import|consum/i];
    if (id === "haus.energy.ent.exp") return [P.energy[0], /einspeis|export|feed/i];
    if (id === "haus.soc") return [P.pct[0], /soc|ladestand|batter|akku/i];
    if (/^haus\.price\./.test(id)) return P.price;
    if (id === "haus.wx.entity") return [ks.filter((e) => e.startsWith("weather.")), /home|wetter|dwd|forecast/i];
    if (id === "haus.wx.outdoor") return P.temp;
    if (id === "haus.wx.wind") return [sen((e) => dc(e) === "wind_speed" || /^(km\/h|m\/s|mph|kn)$/i.test(un(e))), /wind/i];
    if (/^room\./.test(id)) {
      if (key === "window_sensors") return [ks.filter((e) => e.startsWith("binary_sensor.") && ["window", "door", "opening", "garage_door"].includes(dc(e))), /fenster|window|tür|door/i];
      if (key === "thermostats") return [ks.filter((e) => e.startsWith("climate.")), /thermostat|heiz|trv|ventil/i];
      if (key === "humidity_sensor") return [sen((e) => dc(e) === "humidity" || (un(e) === "%" && /feucht|humid/i.test(e))), /feucht|humid/i];
      if (key === "room_temp_sensor" || key === "outdoor_sensor") return P.temp;
      if (key === "heating_entity") return [ks.filter((e) => /^(climate|switch|water_heater|binary_sensor)\./.test(e)), /heiz|therme|boiler|kessel/i];
      if (key === "htr_entity") return [ks.filter((e) => /^(switch|climate)\./.test(e)), /heiz|heater|radiator/i];
    }
    if (/^gs\.d/.test(id)) return [P.power[0], new RegExp(this._stNorm(t.n.split(" · ").pop()).slice(0, 6) || "x", "i")];
    if (/^ev\./.test(id)) return { soc: P.pct, power: P.power, odo: [sen((e) => /km|mi/.test(un(e))), /km|odo|kilometer/i], range: [sen((e) => /km|mi/.test(un(e))), /range|reichweite/i], plug: [ks.filter((e) => e.startsWith("binary_sensor.")), /plug|stecker|kabel/i], charging: [ks.filter((e) => e.startsWith("binary_sensor.")), /charg|lad/i] }[key] || null;
    if (/^wasser\.ent\./.test(id)) return { top: P.temp, mid: P.temp, bot: P.temp, ret: P.temp, src: [ks.filter((e) => /^(switch|input_boolean|water_heater|climate)\./.test(e)), /therme|boiler|heiz|wasser/i], rod: [ks.filter((e) => /^(switch|input_boolean)\./.test(e)), /stab|rod|heiz/i], pump: [ks.filter((e) => /^(switch|input_boolean)\./.test(e)), /pump|zirk/i], trig: [ks.filter((e) => /^(binary_sensor|sensor|input_boolean)\./.test(e)), /bewegung|motion|zirk/i] }[key] || null;
    return null;
  }
  _mwCan(t) { return !!this._mwOpts(t) && this._admin(); }
  _mwMulti(t) { return /\.(window_sensors|thermostats)$/.test(t.id); }
  _mwPickModal() {
    const m = this._modal, t = ((this._mwD || {}).tasks || []).find((x) => x.id === m.k);
    if (!t) return `<div class="ov" data-act="close"></div><div class="sheet"><div class="mut">Nicht gefunden.</div></div>`;
    const [opts, h] = this._mwOpts(t) || [[], null], cur = m.add ? "" : m.e || t.ents[0] || "", pid = "mwset|" + `data-k="${t.id}"`;
    this._pkId = pid; (this._pkReg = this._pkReg || {})[pid] = { f: "mwset", k: t.id };
    const nm = new Set(t.uses.map((u) => u.m)).size;
    return `<div class="ov" data-act="mwpx"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>${m.add ? "Hinzufügen" : t.ents.length ? "Tauschen" : "Zuordnen"}: ${esc(t.n)}</b><span>Gilt danach für ${nm} ${nm === 1 ? "Modul" : "Module"} · ${esc(t.where)}</span></div><button class="ibtn" data-act="mwpx" aria-label="Schließen">${ic("close", 20)}</button></div>
      ${cur ? `<div class="gst">${ic("info", 15)}<span>Jetzt: <b>${esc(this._wzName(cur))}</b> · ${esc(this._mwVal(cur))}</span></div>` : ""}
      ${this._pkFinder(pid, opts, cur, "mwset", "– keiner –", h).replace('<button class="pkrow pkclr"', t.ents.length && !m.add ? '<button class="pkrow pkclr"' : '<button hidden class="pkrow pkclr"')}
      <div class="foot2"><button class="btn2" data-act="mwpx">Abbrechen</button></div></div>`;
  }
  async _mwAssign(tid, eid) {
    const t = ((this._mwD || {}).tasks || []).find((x) => x.id === tid), m = this._modal || {}; if (!t) return;
    const old = m.e || t.ents[0] || "", E = this._enState(), id = t.id, key = id.split(".").pop(), H = this._hass;
    try {
      if (/^haus\.energy\.ent\./.test(id)) { E.ent[key] = eid; if (key === "grid") this._gen.pv = { ...this._pv(), sensor: eid }; this._enSave(true); }
      else if (id === "haus.soc") { this._gen.pv = { ...this._pv(), soc_sensor: eid }; this._saveGen(); }
      else if (/^haus\.price\./.test(id)) { const k = key.replace("_sensor", ""); this._gen.pv = { ...this._pv(), [key]: eid, [k + "_mode"]: eid ? "entity" : "fix" }; this._saveGen(); }
      else if (id === "haus.wx.entity" || id === "haus.wx.outdoor") { this._cfg.layout.wx = { ...(this._cfg.layout.wx || {}), [key]: eid }; this._saveLayout(); }
      else if (id === "haus.wx.wind") { this._wxsLoad(true); setTimeout(() => this._wxsPatch((c) => { c.wind = eid; }), 600); }
      else if (/^room\./.test(id)) {
        const entry = id.split(".")[1], o = await H.callWS({ type: "fenster_heizung/get_options", entry_id: entry }), op = { ...((o && o.options) || {}) };
        if (this._mwMulti(t)) { const l = Array.isArray(op[key]) ? op[key].filter((x) => x !== old || m.add) : []; if (eid && !l.includes(eid)) l.push(eid); op[key] = l; } else op[key] = eid;
        await H.callWS({ type: "fenster_heizung/set_options", entry_id: entry, options: op });
      }
      else if (/^gs\./.test(id)) { const d = (this._gsState().devices || []).find((x) => "gs." + x.id === id); if (d) { d.ent = eid; this._mdSave(); } }
      else if (/^ev\./.test(id)) { this._evState().ent[key] = eid; this._mdSave(); }
      else if (/^wasser\.ent\./.test(id)) { this._mdState().ww.ent[key] = eid; this._mdSave(); }
      else { this._toast("Diese Aufgabe stellst du noch an ihrer Stelle ein"); return; }
    } catch (e) { this._toast((e && e.message) || "Konnte nicht zugeordnet werden"); return; }
    const nm = [...new Set(t.uses.map((u) => u.m))].sort((a, b) => a - b).map((x) => (x === 0 ? "A" : x)).join(", ");
    this._toast(eid ? `${this._wzName(eid)} gilt jetzt für ${t.n} · Modul ${nm}` : `${t.n}: Sensor entfernt`);
    this._pkId = null; this._pkS = null; this._modal = { type: "mwdet", k: tid }; this._renderModal();
    setTimeout(() => this._mwLoad(true), 1800);
  }
