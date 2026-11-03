  /* ================= Modul 1: Luftentfeuchter (Schritt 1: Gerät und Regelung) =================
     Regelung im Backend (entfeuchter.py). Hier: Anzeige auf der Raumkarte des Standorts mit „Warum?“, Standortwahl
     über Raumkacheln, Einstellungen in Reitern ohne Aufklappmenüs, Zahlen mit Minus und Plus. */
  _lf() {
    const D = this._lfD;
    if ((!D || Date.now() - D.ts > 20000) && !this._lfBusy && this._hass) {
      this._lfBusy = true;
      this._hass.callWS({ type: "fenster_heizung/lf_get" }).then((r) => { this._lfD = { ...(r || {}), ts: Date.now() }; this._lfBusy = false; this._render(); if (this._modal && /^lf/.test(this._modal.type)) this._renderModal(); })
        .catch(() => { this._lfD = { cfg: { devs: [] }, live: {}, rooms: [], ts: Date.now(), err: true }; this._lfBusy = false; });
    }
    return D || null;
  }
  _lfDev() { const D = this._lf(); return D && D.cfg && D.cfg.devs && D.cfg.devs[0] && D.cfg.devs[0].ent ? D.cfg.devs[0] : null; }
  async _lfCmd(cmd, arg = "") {
    try { const r = await this._hass.callWS({ type: "fenster_heizung/lf_cmd", cmd, arg }); this._lfD = { ...r, ts: Date.now() }; this._render(); if (this._modal && /^lf/.test(this._modal.type)) this._renderModal(); }
    catch (e) { this._toast("Entfeuchter: " + ((e && e.message) || "Befehl fehlgeschlagen")); }
  }
  _lfState(L) {
    if (!L || !L.code) return ["off", "–"];
    if (L.on == null) return ["off", "nicht erreichbar"];
    if (L.running) return ["run", "läuft"];
    if (L.on) return ["run", "an"];
    return { full: ["warn", "Tank voll"], window: ["wait", "pausiert"], vent: ["wait", "lüften"], day_off: ["off", "heute aus"], no_hum: ["warn", "aus"], no_loc: ["off", "aus"] }[L.code] || ["off", "aus"];
  }
  _lfSince(ts) { if (!ts) return ""; const m = Math.max(0, Math.round((Date.now() / 1000 - ts) / 60)); return m < 60 ? `seit ${m} Min.` : `seit ${Math.floor(m / 60)} h ${m % 60} min`; }
  /* Kasten auf der Raumkarte des Standorts (Heizungsraum oder Messraum) */
  _lfBox(rid) {
    const D = this._lf(), dev = this._lfDev(); if (!D || !dev || D.loc !== rid) return "";
    const L = D.live || {}, [k, t] = this._lfState(L), adm = this._admin();
    const tank = L.fill != null ? `Tank ${Math.min(100, Math.round(L.fill * 100))} %` : L.full ? "Tank voll" : "";
    const sub = [L.on ? this._lfSince(L.since) : "", tank, L.today_min ? `heute ${hmin(L.today_min)}` : ""].filter(Boolean).join(" · ");
    return `<div class="lfbox ${k}"><div class="lfh"><span class="lfi">${ic("fan", 18)}</span><div class="lft"><b>${esc(dev.name)} <em class="lfhere">hier</em></b><span>${esc(sub || (dev.kind === "watch" ? "nur beobachten" : "Modul 1 regelt"))}</span></div><span class="lfst">${esc(t)}</span>${adm ? `<button class="ibtn" data-act="lfxset" aria-label="Entfeuchter einstellen">${ic("sliders", 16)}</button>` : ""}</div>
      ${L.fill != null ? `<div class="lfbar"><i style="width:${Math.min(100, Math.round(L.fill * 100))}%"></i></div>` : ""}
      <div class="lfwhy"><b>Warum?</b> ${esc((L.why || []).join(" "))}${L.hint ? `<br><span class="lfhint">${esc(L.hint)}</span>` : ""}</div>
      <div class="lfbtns"><button class="btn2" data-act="lfxloc">${ic("pin", 15)} Standort ändern</button>${D.off_day ? `<button class="btn2" data-act="lfxon">${ic("check", 15)} Wieder regeln</button>` : `<button class="btn2" data-act="lfxoff">${ic("close", 15)} Heute aus</button>`}${L.full || (L.fill != null && L.fill > 0.05) ? `<button class="btn2" data-act="lfxtank">${ic("drop", 15)} Tank geleert</button>` : ""}</div></div>`;
  }
  /* Ohne Standort: Karte mit Raumkacheln oben bei den Räumen */
  _lfLocCard() {
    const D = this._lf(), dev = this._lfDev(); if (!D || !dev) return "";
    if (D.loc && (D.rooms || []).some((r) => r.id === D.loc)) return "";
    return `<div class="card lfloc"><div class="lfh"><span class="lfi">${ic("fan", 18)}</span><div class="lft"><b>Wo steht der ${esc(dev.name)}?</b><span>${D.off_day ? "Heute nicht in Betrieb." : "Ohne Standort bleibt er aus. Tippe auf den Raum."}</span></div></div>${this._lfTiles(D)}</div>`;
  }
  _lfTiles(D) {
    const R = D.rooms || [], dev = (D.cfg.devs || [])[0] || {};
    if (!R.length) return `<div class="mut sm">Kein Raum mit Luftfeuchte-Sensor gefunden. Wähle in den Raumeinstellungen einen Luftfeuchte-Sensor oder lege einen Messraum an.</div>`;
    return `<div class="lftiles">${R.map((r) => `<button class="lftile ${D.loc === r.id ? "sel" : ""}" data-act="lfxpick" data-k="${esc(r.id)}"><b>${esc(r.name)}${D.loc === r.id ? ic("check", 15) : ""}</b><span class="${r.hum != null && r.hum > (dev.hi || 60) ? "amber" : ""}">Luftfeuchte ${r.hum != null ? num(r.hum, 0) + " %" : "–"}${r.ms ? " · Messraum" : ""}</span></button>`).join("")}</div>
      <div class="lfbtns"><button class="btn2" data-act="${D.off_day ? "lfxon" : "lfxoff"}">${D.off_day ? "Heute wieder in Betrieb" : "Heute nicht in Betrieb"}</button></div>`;
  }
  _lfLocModal() {
    const D = this._lf() || { rooms: [], cfg: { devs: [] } }, dev = (D.cfg.devs || [])[0] || { name: "Luftentfeuchter" };
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Wo steht der ${esc(dev.name)}?</b><span>Modul 1 regelt mit Luftfeuchte und Fenstern dieses Raums</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      ${this._lfTiles(D)}<div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  /* Einstellungen: Reiter Gerät, Zielwerte, Standort */
  _lfSetOpen() {
    const D = this._lf(), d0 = (D && D.cfg && D.cfg.devs && D.cfg.devs[0]) || null;
    this._pkId = null;
    this._modal = { type: "lfset", tab: d0 && d0.ent ? "ziel" : "geraet", draft: { id: "d1", name: "Luftentfeuchter", kind: "entity", ent: "", power: "", run_w: 20, tank: "", cap_l: 0, lph: 0, hi: 60, lo: 55, hi_away: 65, minrun: 15, lock: 10, vent: false, ...(d0 || {}) } };
    this._renderModal();
  }
  _lfSetModal() {
    const M = this._modal, d = M.draft, st = this._hass.states, ks = Object.keys(st), D = this._lf() || {};
    const tabs = [["geraet", "Gerät"], ["ziel", "Zielwerte"], ["ort", "Standort"]];
    const step = (k, unit, s, lo, hi, dec = 0) => `<div class="lfstep"><button class="ibtn" data-act="lfxstep" data-k="${k}" data-d="${-s}" data-lo="${lo}" data-hi="${hi}" aria-label="weniger">${ic("minus", 16)}</button><b>${num(d[k], dec)}<small> ${unit}</small></b><button class="ibtn" data-act="lfxstep" data-k="${k}" data-d="${s}" data-lo="${lo}" data-hi="${hi}" aria-label="mehr">${ic("plus", 16)}</button></div>`;
    const row = (l, h, ctl) => `<div class="of"><div class="ol"><b>${l}</b>${h ? `<small>${h}</small>` : ""}</div><div class="oc">${ctl}</div></div>`;
    const seg = (k, opts) => `<div class="seg">${opts.map(([v, l]) => `<button class="${d[k] === v ? "sel" : ""}" data-act="lfxseg" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`;
    let body = "";
    if (M.tab === "geraet") {
      const dom = d.kind === "plug" ? ["switch."] : ["humidifier.", "switch.", "fan.", "input_boolean."];
      const devs = ks.filter((e) => dom.some((p) => e.startsWith(p)));
      const pw = ks.filter((e) => e.startsWith("sensor.") && (st[e].attributes.device_class === "power" || /^k?W$/.test(st[e].attributes.unit_of_measurement || "")));
      const tk = ks.filter((e) => (e.startsWith("binary_sensor.") || e.startsWith("sensor.")) && /tank|wasser|water|bucket|voll|full/i.test(e + " " + (st[e].attributes.friendly_name || "")));
      body = `<div class="lsec">${ic("fan", 15)}Art des Geräts</div>
        <div class="lfkind">${[["entity", "Eigene Entität", "Smarter Entfeuchter in Home Assistant (humidifier, Schalter)."], ["plug", "Schaltsteckdose", "Normaler Entfeuchter an einer Steckdose, am Gerät auf Dauerbetrieb."], ["watch", "Nur beobachten", "Gerät mit eigenem Hygrostat. Modul 1 zeigt an, schaltet aber nicht."]].map(([v, l, h]) => `<button class="${d.kind === v ? "sel" : ""}" data-act="lfxseg" data-k="kind" data-v="${v}"><b>${l}</b><span>${h}</span></button>`).join("")}</div>
        <div class="lsec">${ic("pencil", 15)}Name</div><input class="otxt" type="text" maxlength="30" data-f="lfxname" value="${esc(d.name)}" aria-label="Name des Entfeuchters">
        <div class="lsec">${ic("bolt", 15)}Gerät und Sensoren</div>
        ${row(d.kind === "plug" ? "Schaltsteckdose" : "Entfeuchter", d.kind === "plug" ? "switch.*" : "humidifier.*, Schalter oder Lüfter", this._wzSel(devs, d.ent, "lfxe", `data-k="ent"`, "– Gerät wählen –", /entfeucht|dehumid|humid|trockn/i))}
        ${row("Leistung", "optional, zeigt ob er wirklich läuft", this._wzSel(pw, d.power, "lfxe", `data-k="power"`, "– keine –", /entfeucht|dehumid|steckdose|plug/i))}
        ${d.power ? row("Läuft ab", "darunter gilt er als aus", step("run_w", "W", 5, 1, 500)) : ""}
        ${row("Wassertank-Sensor", "optional, meldet „voll“", this._wzSel(tk, d.tank, "lfxe", `data-k="tank"`, "– keiner –", /tank|voll|full/i))}
        ${!d.tank ? `<div class="mut sm" style="margin:6px 0 2px">Ohne Tank-Sensor schätzt Modul 1 die Füllung aus der Laufzeit. 0 = keine Schätzung.</div>${row("Tankinhalt", "", step("cap_l", "l", 0.5, 0, 50, 1))}${row("Entfeuchtung", "pro Stunde Betrieb", step("lph", "l/h", 0.05, 0, 10, 2))}` : ""}
        ${d.kind === "plug" ? `<div class="gst">${ic("info", 15)}<div>Das Gerät muss auf Dauerbetrieb stehen und nach einer Stromunterbrechung von selbst wieder anlaufen. Bitte am Gerät prüfen. Die Steckdose muss für die Leistung des Geräts ausgelegt sein.</div></div>` : ""}`;
    } else if (M.tab === "ziel") {
      body = `<div class="lsec">${ic("drop", 15)}Zielfeuchte</div>
        ${row("Einschalten über", "Obergrenze", step("hi", "%", 1, 35, 90))}
        ${row("Ausschalten bei", "Untergrenze", step("lo", "%", 1, 30, 85))}
        ${row("Bei Abwesenheit oder Urlaub", "Einschalten über (nur Schutz vor Schimmel)", step("hi_away", "%", 1, 35, 95))}
        <div class="lsec">${ic("clock", 15)}Gegen ständiges Schalten</div>
        ${row("Mindestlaufzeit", "", step("minrun", "Min.", 5, 0, 120))}
        ${row("Sperrzeit nach dem Ausschalten", "", step("lock", "Min.", 5, 0, 120))}
        <div class="lsec">${ic("windy", 15)}Lüften vor Entfeuchten</div>
        <div class="mut sm" style="margin:-2px 0 6px">Ist die Luft draußen trockener, bleibt der Entfeuchter aus und Modul 1 empfiehlt Lüften. Im Winter ist das oft der Fall, deshalb ab Werk aus.</div>
        ${seg("vent", [[false, "Aus"], [true, "Ein"]])}
        <div class="gst">${ic("window", 15)}<div>Bei offenem Fenster im Raum des Standorts bleibt der Entfeuchter immer aus.</div></div>`;
    } else {
      body = `<div class="mut sm" style="margin:4px 0 8px">Der Standort gilt, bis du ihn änderst. Die tägliche Bestätigung kommt in einem späteren Schritt.</div>${this._lfTiles(D)}`;
    }
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Luftentfeuchter</b><span>Modul 1 · gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="seg lftabs">${tabs.map(([k, l]) => `<button class="${M.tab === k ? "sel" : ""}" data-act="lfxtab" data-k="${k}">${l}</button>`).join("")}</div>
      ${body}${M.err ? `<div class="gst on">${ic("alert", 15)}<div>${esc(M.err)}</div></div>` : ""}
      <div class="foot2">${d.ent ? `<button class="btn2" data-act="lfxdel">Entfernen</button>` : `<button class="btn2" data-act="close">Abbrechen</button>`}<button class="btn2 pri" data-act="lfxsave">Speichern</button></div></div>`;
  }
  _lfChange(t) {
    const M = this._modal; if (!M || M.type !== "lfset") return false;
    if (t.dataset.f === "lfxname") { M.draft.name = t.value; return true; }
    if (t.dataset.f === "lfxe") { M.draft[t.dataset.k] = t.value || ""; return true; }
    return false;
  }
  async _lfSave(devs) {
    try { const r = await this._hass.callWS({ type: "fenster_heizung/lf_set", cfg: { devs } }); this._lfD = { ...r, ts: Date.now() }; this._modal = null; this._renderModal(); this._render(); this._toast(devs.length ? "Entfeuchter gespeichert" : "Entfeuchter entfernt"); }
    catch (e) { this._toast("Speichern fehlgeschlagen"); }
  }
  _lfAct(a, b) {
    const M = this._modal;
    if (a === "lfxset") { this._lfSetOpen(); return; }
    if (a === "lfxloc") { this._modal = { type: "lfloc" }; this._renderModal(); return; }
    if (a === "lfxpick") { this._lfCmd("loc", b.dataset.k); if (M && M.type === "lfloc") { this._modal = null; this._renderModal(); } return; }
    if (a === "lfxoff") { this._lfCmd("off_today"); return; }
    if (a === "lfxon") { this._lfCmd("on_today"); return; }
    if (a === "lfxtank") { this._lfCmd("tank_empty"); this._toast("Tank als geleert vermerkt"); return; }
    if (!M || M.type !== "lfset") return;
    const d = M.draft;
    if (a === "lfxtab") { M.tab = b.dataset.k; this._pkId = null; this._renderModal(); }
    else if (a === "lfxseg") { const v = b.dataset.v; d[b.dataset.k] = v === "true" ? true : v === "false" ? false : v; if (b.dataset.k === "kind" && v === "plug" && d.ent && !d.ent.startsWith("switch.")) d.ent = ""; this._renderModal(); }
    else if (a === "lfxstep") { const k = b.dataset.k, s = parseFloat(b.dataset.d); d[k] = Math.round(Math.min(parseFloat(b.dataset.hi), Math.max(parseFloat(b.dataset.lo), (Number(d[k]) || 0) + s)) * 100) / 100; this._renderModal(); }
    else if (a === "lfxdel") { this._lfSave([]); }
    else if (a === "lfxsave") {
      M.err = !d.ent ? "Bitte das Gerät wählen (Reiter „Gerät“)." : d.lo >= d.hi ? "Die Untergrenze muss unter der Obergrenze liegen." : "";
      if (M.err) { this._renderModal(); return; }
      this._lfSave([{ ...d, name: String(d.name || "").trim() || "Luftentfeuchter" }]);
    }
  }
