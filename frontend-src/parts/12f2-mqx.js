  /* ================= Sponsor-Max-Extras (Beta 2026.11.4.4b4) =================
     Build 1  „Deine Extras“: Schalter für Sponsor Max (Standard aus), Schloss „Sponsor Max“ für alle anderen, Einstellungsseiten.
     Build 2  Wohnklima-Zeugnis: Karte (Woche/Monat), Raum-Details mit Fächern, 8-Wochen-Verlauf und Tipp.
     Build 3  Heizkosten je Raum: Rangliste (Heute/Woche/Monat/Saison, € oder €/m²), Raum-Details, Fenster-offen-Kosten.
     Build 4  Wand-Tablet-Extras: Ruhe-Ansicht mit Räumen (gebundener Raum zuerst), Nacht, Schlafen, Einbrennschutz,
              Schnellaktionen, Alarm-Vollbild für Modul 11, Helligkeit über Fully Kiosk, Zustand an Home Assistant.
     Gerechnet wird im Home Assistant (mx_extras.py), hier wird nur angezeigt. Aktionen: mqx…, Felder: data-f="mqx…". */
  _mqLoad(force, scope) {
    if (!this._hass || this._mqBusy || (this._mqx && !force && Date.now() - (this._mqTs || 0) < 60000)) return;
    this._mqBusy = true;
    const sc = scope || this._mqScope || "month";
    this._hass.callWS({ type: "fenster_heizung/mx_get", scope: sc }).then((r) => { this._mqx = r; this._mqTs = Date.now(); this._mqScope = sc; })
      .catch(() => { this._mqx = this._mqx || { max: false, on: {}, err: true }; })
      .finally(() => { this._mqBusy = false; this._mqTs = Date.now(); /* auch bei Fehler: sonst lädt die Tablet-Leiste in einer Schleife */
        if (this._loOpen || (this._tmOn && this._tmOn())) this._render(); if (this._modal && String(this._modal.type).startsWith("mqx")) this._renderModal(); });
  }
  /* laufender Zeitraum, solange er noch keine Note hat: der letzte abgeschlossene */
  _mqZ(W, per) { const cur = per === "week" ? W.week : W.month, last = per === "week" ? W.last_week : W.last_month; return cur && cur.note == null && last && last.note != null ? { ...last, done: true } : cur; }
  _mqOn(k) { const s = this._mqx; return !!(s && s.on && s.on[k]); }
  _mqG(g) { return g == null ? "–" : num(g, 1); }
  _mqGc(g) { return g == null ? "mqq0" : "mqq" + Math.min(6, Math.max(1, Math.round(g))); }
  _mqEur(v) { return `${num(v || 0, 2)} €`; }
  _mqTr(t) { return t == null || Math.abs(t) < 0.05 ? "" : t > 0 ? `<span class="mqup">▲ ${num(t, 1)}</span>` : `<span class="mqdn">▼ ${num(-t, 1)}</span>`; }
  _mqNames() { return { wk: "Wohnklima-Zeugnis", hk: "Heizkosten je Raum", tb: "Wand-Tablet-Extras" }; }

  /* ---- Build 1: Zeilen in „Deine Extras“ ---- */
  _mqRows(mx, P, li, sw) {
    const N = this._mqNames();
    if (mx && !this._mqx) this._mqLoad();
    return ["wk", "hk", "tb"].map((k) => mx
      ? li(`<button class="mqnm" data-act="mqxset" data-k="${k}">${N[k]}</button><em class="mqnew">NEU</em>`, sw("mqxtog", !!P["mx_" + k], N[k], k))
      : li(`<span class="mut">${N[k]}</span>`, `<button class="mqlock" data-act="mqxinfo" data-k="${k}">🔒 Sponsor Max</button>`)).join("");
  }
  /* ---- Karten in der Lounge (nur Max, nur wenn an) ---- */
  _mqCards() {
    const S = this._mqx;
    if (!S || !S.max) return "";
    const c = [this._mqOn("wk") ? this._mqWkCard(S) : "", this._mqOn("hk") ? this._mqHkCard(S) : ""].filter(Boolean);
    return c.length ? `<div class="lg2 mqrow">${c.join("")}</div>` : "";
  }
  _mqWkCard(S) {
    const W = S.wk || {}, per = this._mqWkPer || "week", Z = this._mqZ(W, per);
    const seg = `<span class="gschs"><button class="gsch ${per === "week" ? "sel" : ""}" data-act="mqxper" data-k="week">Woche</button><button class="gsch ${per === "month" ? "sel" : ""}" data-act="mqxper" data-k="month">Monat</button></span>`;
    const head = `<div class="s3h">${this._gx("humidity", 34, { on: true, lvl: 80 })}<span><b>Wohnklima-Zeugnis</b><small>${Z ? esc(Z.label) + (Z.done ? " · abgeschlossen" : per === "week" ? " · laufend" : " · bis heute") : ""}</small></span></div><div style="margin:4px 0 2px">${seg}</div>`;
    if (!Z) return `<div class="lgt s3c" style="--c:#2dd4bf">${head}<div class="lgnote2">Lädt …</div></div>`;
    const rows = Z.rooms.map((r) => `<button class="mqli" data-act="mqxroom" data-k="${esc(r.id)}"><span>${esc(r.name)}${r.risk ? ` <i class="mqrisk" title="Schimmelrisiko">●</i>` : ""}</span><span>${this._mqTr(r.trend)}<b class="mqg ${this._mqGc(r.note)}">${this._mqG(r.note)}</b></span></button>`).join("");
    const none = Z.note == null ? `<div class="lgnote2">Noch kein Zeugnis: dafür braucht es mindestens ${Z.need} Tage mit Messwerten${per === "week" ? " in dieser Woche" : " im Monat"}. Gemessen wird alle 5 Minuten.</div>` : "";
    return `<div class="lgt s3c" style="--c:#2dd4bf">${head}
      <div class="mqtop"><b class="mqbig ${this._mqGc(Z.note)}">${this._mqG(Z.note)}</b><span><b>${esc((Z.wort || "").replace(/^./, (x) => x.toUpperCase())) || "–"}</b><small>Haus gesamt${this._mqTr(Z.trend) ? ` · ${this._mqTr(Z.trend)} zu ${per === "week" ? "Vorwoche" : "Vormonat"}` : ""}</small></span></div>
      ${none}<div class="mqlist">${rows}</div><div class="lgnote2"><i class="mqrisk">●</i> Schimmelrisiko · Raum antippen für Details</div></div>`;
  }
  _mqHkCard(S) {
    const H = S.hk || {}, u = this._mqUnit || "eur", sc = this._mqScope || "month";
    const seg = `<span class="gschs">${[["day", "Heute"], ["week", "Woche"], ["month", "Monat"], ["season", "Saison"]].map(([k, t]) => `<button class="gsch ${sc === k ? "sel" : ""}" data-act="mqxscope" data-k="${k}">${t}</button>`).join("")}</span>`;
    const head = `<div class="s3h">${this._gx("euro", 34, { on: true, lvl: 80 })}<span><b>Heizkosten je Raum</b><small>${H.meter ? "verteilt auf deinen Zähler" : "geschätzt aus Heizlast und Ventilen"}</small></span></div>`;
    const rooms = H.rooms || [], mx = Math.max(0.01, ...rooms.map((r) => u === "eur" ? r.eur : (r.eur_m2 || 0)));
    const val = (r) => u === "eur" ? `${r.meas > 0 && r.est === 0 ? "" : "ca. "}${this._mqEur(r.eur)}` : r.eur_m2 != null ? `${num(r.eur_m2, 2)} €/m²` : "–";
    const rows = rooms.map((r) => `<button class="mqli bar" data-act="mqxcost" data-k="${esc(r.id)}"><span>${esc(r.name)}${r.heater ? " ⚡" : ""}</span><b>${val(r)}</b><i><b style="width:${Math.round((u === "eur" ? r.eur : (r.eur_m2 || 0)) / mx * 100)}%;background:${r.heater ? "#a78bfa" : "#2dd4bf"}"></b></i></button>`).join("");
    return `<div class="lgt s3c" style="--c:#fbbf24">${head}<div style="margin:4px 0 8px">${seg}</div>
      <div class="mqtop"><b class="mqbig eur">${this._mqEur(H.eur)}</b><span><b>${sc === "day" ? "heute" : sc === "week" ? "diese Woche" : sc === "season" ? "Heizsaison" : "Monat bis heute"}</b><small>${H.meas > 0 ? `${this._mqEur(H.meas)} gemessen · ` : ""}ca. ${this._mqEur(H.est)} geschätzt${H.prognose ? ` · Prognose ca. ${num(H.prognose, 0)} €` : ""}</small></span></div>
      ${rooms.length ? `<div class="mqlist">${rows}</div>` : `<div class="lgnote2">Noch keine Werte. Gerechnet wird alle 5 Minuten für Räume mit Thermostat oder Elektroheizer.</div>`}
      ${H.win > 0 ? `<button class="mqwin" data-act="mqxwin">🪟 Fenster offen beim Heizen: <b>ca. ${this._mqEur(H.win)}</b> ›</button>` : ""}
      <div class="lgbtns"><span class="gschs"><button class="gsch ${u === "eur" ? "sel" : ""}" data-act="mqxunit" data-k="eur">€</button><button class="gsch ${u === "m2" ? "sel" : ""}" data-act="mqxunit" data-k="m2">€/m²</button></span><span class="mut sm">⚡ Elektroheizer</span></div></div>`;
  }

  /* ---- Aktionen ---- */
  _mqAct(a, b) {
    const k = b.dataset.k, S = this._mqx;
    if (this._mqTbAct(a, b)) return;
    if (a === "mqxtog") {
      if (!this._lgMax() && this._spnS().state !== "dev") return;
      const P = this._spnS().saved_prefs || {};
      this._spnPref({ ["mx_" + k]: !P["mx_" + k] });
      setTimeout(() => this._mqLoad(true), 1500);
      return;
    }
    if (a === "mqxinfo") { this._modal = { type: "mqxinfo", k }; this._renderModal(); return; }
    if (a === "mqxset") { this._modal = { type: "mqxset", k }; this._mqLoad(true); this._renderModal(); return; }
    if (a === "mqxper") { this._mqWkPer = k; this._render(); return; }
    if (a === "mqxscope") { this._mqLoad(true, k); return; }
    if (a === "mqxunit") { this._mqUnit = k; this._render(); return; }
    if (a === "mqxroom") { this._modal = { type: "mqxroom", k }; this._renderModal(); return; }
    if (a === "mqxcost") { this._modal = { type: "mqxcost", k }; this._renderModal(); return; }
    if (a === "mqxwin") { this._modal = { type: "mqxwin" }; this._renderModal(); return; }
    if (a === "mqxdemo") { this._hass.callWS({ type: "fenster_heizung/mx_demo" }).then((r) => { this._toast(`Beispielwerte für ${r.rooms} Räume eingespielt`); this._mqLoad(true); }).catch(() => this._toast("Nur mit Entwickler-Zugang")); return; }
    if (a === "mqxrun") { this._hass.callWS({ type: "fenster_heizung/mx_run", kind: k }).then((z) => this._toast(`Zeugnis ${z.label}: ${this._mqG(z.note)} – Ereignis gesendet`)).catch(() => this._toast("Das ging nicht")); return; }
    if (!S || !S.cfg) return;
    const C = JSON.parse(JSON.stringify(S.cfg));
    if (a === "mqxwk") { C.wk[k] = !C.wk[k]; return this._mqSave(C); }
    if (a === "mqxwinc") { C.hk.winc = !C.hk.winc; return this._mqSave(C); }
    if (a === "mqxfuel") { C.hk.fuel = k; C.hk.eff = null; return this._mqSave(C); }
    const tid = this._tmId(), T = (C.tb[tid] = { ...this._mqTbDef(), ...(C.tb[tid] || {}) });
    if (a === "mqxtbn") { T.night = k; return this._mqSaveTb(C, T); }
    if (a === "mqxtbc") { T.nc = k; return this._mqSaveTb(C, T); }
    if (a === "mqxtbs") { T[k] = !T[k]; return this._mqSaveTb(C, T); }
    if (a === "mqxtbx") { T.acts = T.acts.filter((x) => x !== k); return this._mqSaveTb(C, T); }
  }
  _mqChange(t) {
    const S = this._mqx, f = t.dataset.f;
    if (!S || !S.cfg || !f.startsWith("mqx")) return false;
    const C = JSON.parse(JSON.stringify(S.cfg)), nv = (v) => { const n = Number(String(v).replace(",", ".")); return String(v).trim() === "" || !isFinite(n) ? null : n; };
    if (f === "mqxlim") { const rid = t.dataset.k, L = (C.wk.lim[rid] = { ...{ td: 1, hlo: 40, hhi: 60, wall: 4 }, ...(C.wk.lim[rid] || {}) }); const v = nv(t.value); if (v != null) L[t.dataset.e] = v; this._mqSave(C); return true; }
    if (f === "mqxmeter") { C.hk.meter = t.value || ""; this._mqSave(C); return true; }
    if (f === "mqxprice") { C.hk.price = nv(t.value); this._mqSave(C); return true; }
    if (f === "mqxeff") { C.hk.eff = nv(t.value); this._mqSave(C); return true; }
    if (f === "mqxroomf" || f === "mqxroomh") { const rid = t.dataset.k, R = (C.hk.rooms[rid] = { f: null, h: 2.5, ...(C.hk.rooms[rid] || {}) }); R[f === "mqxroomf" ? "f" : "h"] = nv(t.value); this._mqSave(C); return true; }
    const tid = this._tmId(), T = (C.tb[tid] = { ...this._mqTbDef(), ...(C.tb[tid] || {}) });
    if (f === "mqxtbroom") { T.room = t.value || ""; this._mqSaveTb(C, T); return true; }
    if (f === "mqxtbe") { T[t.dataset.k] = t.value || ""; this._mqSaveTb(C, T); return true; }
    if (f === "mqxtbact") { if (t.value && !T.acts.includes(t.value) && T.acts.length < 4) T.acts.push(t.value); this._mqSaveTb(C, T); return true; }
    return false;
  }
  /* Tablet-Teil: wie die Tablet-Einstellungen auch ohne Admin-Rechte, mit PIN des Tablets */
  _mqSaveTb(C, T) {
    this._mqx = { ...this._mqx, cfg: C };
    if (this._modal) this._renderModal();
    this._hass.callWS({ type: "fenster_heizung/mx_tb_set", tid: this._tmId(), cfg: T, ...(this._tmPin ? { pin: this._tmPin } : {}) }).then((r) => { this._mqx = { ...this._mqx, cfg: r.cfg }; })
      .catch((e) => this._toast(e && e.code === "denied" ? "Erst mit der PIN des Tablets entsperren" : "Das ging nicht"));
  }
  _mqSave(C) {
    this._mqx = { ...this._mqx, cfg: C };
    if (this._modal) this._renderModal();
    this._hass.callWS({ type: "fenster_heizung/mx_set", cfg: C }).then((r) => { this._mqx = { ...this._mqx, cfg: r.cfg }; this._mqLoad(true); }).catch(() => this._toast("Das ging nicht"));
  }

  /* ---- Fenster ---- */
  _mqModal() {
    const m = this._modal, S = this._mqx || {}, adm = this._admin(), N = this._mqNames(), close = `<button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button>`;
    const wrap = (t, sub, body, wide = true) => `<div class="ov" data-act="close"></div><div class="sheet ${wide ? "wide" : ""}" role="dialog" aria-modal="true"><div class="sh"><div><b>${t}</b><span>${sub}</span></div>${close}</div>${body}</div>`;
    const row = (t, s, ctl) => `<div class="vrow"><span>${t}${s ? `<small class="mut" style="display:block">${s}</small>` : ""}</span>${ctl}</div>`;
    const sw = (act, on, k = "") => `<button class="sw ${on ? "on" : ""}" data-act="${act}" ${k ? `data-k="${k}"` : ""} aria-pressed="${!!on}" ${adm ? "" : "disabled"}></button>`;
    const seg = (act, cur, opts) => `<span class="gschs">${opts.map(([k, t]) => `<button class="gsch ${String(cur) === String(k) ? "sel" : ""}" data-act="${act}" data-k="${k}" ${adm ? "" : "disabled"}>${t}</button>`).join("")}</span>`;
    const inp = (f, v, extra = "", w = 64) => `<input class="osel mqin" type="text" inputmode="decimal" data-f="${f}" ${extra} value="${v == null ? "" : esc(String(v).replace(".", ","))}" style="width:${w}px;margin:0" ${adm ? "" : "disabled"}>`;
    if (m.type === "mqxinfo") {
      const X = { wk: ["humidity", "Schulnoten 1–6 für jeden Raum und das ganze Haus – jede Woche und jeden Monat, mit Tipp zum schlechtesten Fach."], hk: ["euro", "Welcher Raum wie viel Heizung kostet – Elektroheizer gemessen, Thermostate geschätzt, dazu die Kosten offener Fenster."], tb: ["tvset", "Ruhige Wand-Anzeige: wacht bei Bewegung auf, nachts dunkel, Alarm aus Modul 11 als Vollbild, Schnellaktionen."] }[m.k] || ["plug", ""];
      return wrap(N[m.k] || "Extra", "★ Sponsor Max", `<div class="lgexd">${this._gx(X[0], 96, { on: true, lvl: 80 })}<p>${X[1]}</p><p class="mut sm">Teil von <b class="lggd">Sponsor Max</b> zusammen mit ${Object.entries(N).filter(([k]) => k !== m.k).map(([, t]) => t).join(" und ")}.</p></div>
        <div class="gbtns" style="margin-top:12px"><a class="btn2 lggold" href="${esc(this._spnS().url)}" target="_blank" rel="noopener noreferrer" style="flex:none;text-decoration:none">★ Sponsor Max ansehen</a><button class="btn2" data-act="close">Schließen</button></div>`, false);
    }
    if (!S.cfg) return wrap(N[m.k] || "Sponsor-Max-Extras", "★ Sponsor Max", `<div class="mut sm">${S.err ? "Die Extras sind noch nicht bereit." : "Lädt …"}</div>`);
    const rooms = S.rooms || [], dev = !!S.dev, off = (k) => this._mqOn(k) ? "" : `<div class="gst">${ic("info", 15)}<span>Das Extra ist aus. Einstellungen werden schon gespeichert – eingeschaltet wird es in „Deine Extras“.</span></div>`;
    if (m.type === "mqxset" && m.k === "wk") {
      const C = S.cfg.wk;
      const lim = rooms.map((r) => { const L = { td: 1, hlo: 40, hhi: 60, wall: 4, ...(C.lim[r.id] || {}) }; return `<div class="vrow mqlim"><span><b>${esc(r.name)}</b><small class="mut" style="display:block">${r.mess ? "Messraum" : r.hum ? "mit Feuchte" : "ohne Feuchtesensor"}</small></span><span class="mqlimi">±${inp("mqxlim", L.td, `data-k="${esc(r.id)}" data-e="td"`, 44)}°C ${inp("mqxlim", L.hlo, `data-k="${esc(r.id)}" data-e="hlo"`, 44)}–${inp("mqxlim", L.hhi, `data-k="${esc(r.id)}" data-e="hhi"`, 44)} % Wand −${inp("mqxlim", L.wall, `data-k="${esc(r.id)}" data-e="wall"`, 40)} K</span></div>`; }).join("");
      return wrap("Wohnklima-Zeugnis", "★ Sponsor Max · Einstellungen", `${off("wk")}
        ${row("Notenskala", "fest", `<b class="mqteal">Schulnoten 1–6</b>`)}
        ${row("Wochenzeugnis", "Montag 0:05 Uhr für die Vorwoche", sw("mqxwk", C.week, "week"))}${row("Monatszeugnis", "am 1. um 0:10 Uhr", sw("mqxwk", C.month, "month"))}
        ${row("Im Morgen-Briefing", "Montags die Wochennote, sonst nur Auffälligkeiten", sw("mqxwk", C.brief, "brief"))}${row("Push-Nachricht", "über die Dienste des Morgen-Briefings", sw("mqxwk", C.push, "push"))}
        <div class="lsec" style="margin-top:12px">${ic("sliders", 15)}Grenzwerte je Raum</div><div class="mut sm" style="margin:0 0 6px">Temperatur-Abstand zum Heizplan, Wohlfühlbereich der Feuchte und Abschlag für die Wandtemperatur (Schimmelrisiko).</div>${lim || `<div class="mut sm">Noch keine Räume.</div>`}
        <div class="mut sm" style="margin-top:10px">Noten: ≥ 90 % der Zeit im Bereich = 1 · Schimmelrisiko zählt doppelt · fehlt ein Sensor, entfällt das Fach.</div>
        ${dev ? `<div class="lsec" style="margin-top:12px">${ic("flask", 15)}Testlabor</div><div class="gbtns"><button class="btn2" data-act="mqxdemo">35 Tage Beispielwerte</button><button class="btn2" data-act="mqxrun" data-k="week">Wochenzeugnis jetzt</button><button class="btn2" data-act="mqxrun" data-k="month">Monatszeugnis jetzt</button></div>` : ""}`);
    }
    if (m.type === "mqxset" && m.k === "hk") {
      const C = S.cfg.hk, st = this._hass.states, F = (S.hk_fuel || {}), fuel = C.fuel === "auto" ? (F.fuel || "erdgas") : C.fuel;
      const meters = Object.keys(st).filter((e) => e.startsWith("sensor.") && (st[e].attributes || {}).device_class === "energy");
      const hr = rooms.filter((r) => r.thermo || r.heater).map((r) => { const R = { f: null, h: 2.5, ...(C.rooms[r.id] || {}) }; return `<div class="vrow"><span><b>${esc(r.name)}</b><small class="mut" style="display:block">${r.heater ? "⚡ Elektroheizer" : ""}${r.heater && r.thermo ? " · " : ""}${r.thermo ? "Thermostat · geschätzt" : ""}</small></span><span class="mqlimi">Faktor ${inp("mqxroomf", R.f, `data-k="${esc(r.id)}" placeholder="1"`, 44)} Höhe ${inp("mqxroomh", R.h, `data-k="${esc(r.id)}"`, 44)} m</span></div>`; }).join("");
      const skip = rooms.filter((r) => !r.thermo && !r.heater).map((r) => esc(r.name));
      return wrap("Heizkosten je Raum", "★ Sponsor Max · Einstellungen", `${off("hk")}
        <div class="lsec">${ic("flame", 15)}Zentrale Heizung</div>
        ${row("Wärmequelle", C.fuel === "auto" ? `aus Modul 1: ${esc(fuel)}` : "", seg("mqxfuel", C.fuel, [["auto", "Auto"], ["erdgas", "Gas"], ["heizoel", "Öl"], ["pellets", "Pellets"], ["fern", "Fernwärme"], ["strom", "Wärmepumpe"]]))}
        ${fuel === "strom" ? row("Strompreis", "aus Modul 19 / Strompreis-Einstellungen", `<span class="mut">${num((S.hk_price || 0) * 100, 1)} ct/kWh</span>`) : row("Preis", "ct je kWh Brennstoff", inp("mqxprice", C.price, `placeholder="${{ erdgas: 12, fluessiggas: 14, heizoel: 11, pellets: 8, fern: 15 }[fuel] || 12}"`))}
        ${row(fuel === "strom" ? "Jahresarbeitszahl" : "Wirkungsgrad", fuel === "strom" ? "JAZ der Wärmepumpe" : "Gas 0,9 · Öl 0,85 · Fernwärme 1,0", inp("mqxeff", C.eff, `placeholder="${num(F.eff || 0.9, 2)}"`))}
        <div class="of"><div class="ol"><b>Gesamtzähler Heizung</b><span>kWh-Zähler von Gas, Öl oder Wärmepumpe. Mit Zähler ergibt die Summe aller Räume genau den Zähler.</span></div></div>${this._wzSel(meters, C.meter, "mqxmeter", "", "– kein Zähler (Schätzung) –")}
        ${row("Fenster-offen-Kosten", "Lüftungsverlust beim Heizen", sw("mqxwinc", C.winc))}
        <div class="lsec" style="margin-top:12px">${ic("home", 15)}Räume</div><div class="mut sm" style="margin:0 0 6px">Faktor für große oder kleine Heizkörper (1 = normal), Raumhöhe für die Fenster-Kosten.</div>${hr || `<div class="mut sm">Keine Räume mit Thermostat oder Elektroheizer.</div>`}
        ${skip.length ? `<div class="mut sm" style="margin-top:8px">Nicht gezeigt (ohne Thermostat und Heizer): ${skip.join(", ")}</div>` : ""}
        ${dev ? `<div class="lsec" style="margin-top:12px">${ic("flask", 15)}Testlabor</div><div class="gbtns"><button class="btn2" data-act="mqxdemo">35 Tage Beispielwerte</button></div>` : ""}`);
    }
    if (m.type === "mqxset" && m.k === "tb") {
      const tid = this._tmId(), T = { ...this._mqTbDef(), ...((S.cfg.tb || {})[tid] || {}) }, st = this._hass.states, tbOn = this._tmOn(), tadm = !(this._tmLocked && this._tmLocked());
      const sw = (act, on, k = "") => `<button class="sw ${on ? "on" : ""}" data-act="${act}" ${k ? `data-k="${k}"` : ""} aria-pressed="${!!on}" ${tadm ? "" : "disabled"}></button>`;
      const seg = (act, cur, opts) => `<span class="gschs">${opts.map(([k, t]) => `<button class="gsch ${String(cur) === String(k) ? "sel" : ""}" data-act="${act}" data-k="${k}" ${tadm ? "" : "disabled"}>${t}</button>`).join("")}</span>`;
      const R = this._collect(true), actOpts = Object.keys(st).filter((e) => /^(scene|script|switch|light|input_boolean|button)\./.test(e));
      const nums = Object.keys(st).filter((e) => (e.startsWith("number.") && /bright|hellig/i.test(e)) || e.startsWith("light.")), bats = Object.keys(st).filter((e) => e.startsWith("sensor.") && (st[e].attributes || {}).device_class === "battery"), sws = Object.keys(st).filter((e) => e.startsWith("switch."));
      const list = (S.tablets || []).map((t) => `<div class="vrow"><span><b>${esc(t.name)}${t.id === tid ? " (dieses)" : ""}</b><small class="mut" style="display:block">${{ wach: "wach", ruhe: "Ruhe", nacht: "Nacht", schlafen: "schläft", alarm: "ALARM", aus: "nicht verbunden" }[t.state] || t.state}${t.bat != null ? ` · Akku ${num(t.bat, 0)} %` : ""}</small></span></div>`).join("");
      return wrap("Wand-Tablet-Extras", "★ Sponsor Max · gilt für dieses Tablet", `${off("tb")}${tadm ? "" : `<div class="gst on">${ic("lock", 15)}<span>Die Einstellungen dieses Tablets sind mit einer PIN geschützt. <button class="lnk" data-act="tmunl">Mit PIN entsperren</button></span></div>`}
        ${tbOn ? "" : `<div class="gst">${ic("tablet", 15)}<span>Dieses Gerät ist noch nicht im Tablet-Modus. <button class="lnk" data-act="tmopen">Tablet-Modus einrichten</button></span></div>`}
        <div class="vrow"><span>Raum<small class="mut" style="display:block">steht als erste Kachel</small></span><select class="osel" data-f="mqxtbroom" style="width:46%;margin:0" ${tadm ? "" : "disabled"}><option value="">– keiner –</option>${R.map((r) => `<option value="${esc(r.id)}" ${r.id === T.room ? "selected" : ""}>${esc(r.name)}</option>`).join("")}</select></div>
        ${row("Nachtdimmung", "nur Uhr, gedimmt", seg("mqxtbn", T.night, [["off", "Aus"], ["22-6", "22–6 Uhr"], ["23-6", "23–6 Uhr"], ["sun", "Sonne"]]))}
        ${row("Uhrfarbe nachts", "", seg("mqxtbc", T.nc, [["red", "Rot"], ["teal", "Teal"]]))}
        ${row("Schlafen", "nachts nach 2 Min. ohne Bewegung ganz dunkel", sw("mqxtbs", T.dark, "dark"))}${row("Einbrennschutz", "Inhalt verschiebt sich alle 10 Min. leicht", sw("mqxtbs", T.shift, "shift"))}
        ${row("Alarm-Vollbild", "nur Rauch- & Sicherheitsmelder aus Modul 11", sw("mqxtbs", T.alarm, "alarm"))}
        <div class="lsec" style="margin-top:12px">${ic("grid", 15)}Schnellaktionen (bis zu 4)</div>
        <div class="gschs" style="flex-wrap:wrap;margin-bottom:6px">${T.acts.map((e) => `<button class="gsch sel" data-act="mqxtbx" data-k="${esc(e)}" ${tadm ? "" : "disabled"}>${esc(this._wzName(e))} ✕</button>`).join("") || `<span class="mut sm">Noch keine</span>`}</div>
        ${T.acts.length < 4 ? this._wzSel(actOpts, "", "mqxtbact", "", "+ Aktion hinzufügen") : ""}
        <div class="lsec" style="margin-top:12px">${ic("sun", 15)}Helligkeit &amp; Akku</div>
        <div class="mut sm" style="margin:0 0 6px">Ein normaler Browser darf die echte Helligkeit nicht ändern. Mit Fully Kiosk die Helligkeits-Entität wählen – sonst wird mit einer dunklen Ebene gedimmt.</div>
        <div class="of"><div class="ol"><b>Helligkeit</b><span>z. B. number.…_screen_brightness (Fully)</span></div></div>${this._wzSel(nums, T.bright, "mqxtbe", `data-k="bright"`, "– dunkle Ebene –")}
        <div class="of"><div class="ol"><b>Akku des Tablets</b></div></div>${this._wzSel(bats, T.bat, "mqxtbe", `data-k="bat"`, "– keiner –")}
        <div class="of"><div class="ol"><b>Ladesteckdose</b><span>lädt unter 30 %, aus über 80 %</span></div></div>${this._wzSel(sws, T.charge, "mqxtbe", `data-k="charge"`, "– keine –")}
        ${list ? `<div class="lsec" style="margin-top:12px">${ic("tablet", 15)}Alle Tablets</div>${list}<div class="mut sm">Für Automationen: binary_sensor.sw_tablet_…_wach, sensor.sw_tablet_…_zustand, button.sw_tablet_…_wecken</div>` : ""}`);
    }
    if (m.type === "mqxroom") {
      const per = this._mqWkPer || "week", Z = this._mqZ(S.wk || {}, per) || {}, r = (Z.rooms || []).find((x) => x.id === m.k);
      if (!r) return wrap("Wohnklima", "", `<div class="mut sm">Keine Daten.</div>`);
      const F = { temperatur: ["Temperatur", r.zeit_t != null ? `${r.zeit_t} % im Bereich` : ""], feuchte: ["Luftfeuchte", r.zeit_h != null ? `${r.zeit_h} % im Bereich` : ""], lueften: ["Lüften", `${r.stoss}× Stoßlüften · ${num(r.kipp_h, 0)} h gekippt`], schimmel: ["Schimmelrisiko ×2", `${num(r.risiko_h, 0)} h`] };
      const H = ((S.wk || {}).hist || {})[r.id] || [];
      const bars = H.map((g) => `<i class="${this._mqGc(g)}" style="height:${g == null ? 4 : Math.round((7 - g) / 6 * 100)}%"></i>`).join("");
      return wrap(`${esc(r.name)} · ${esc(Z.label || "")}`, "Wohnklima-Zeugnis", `<div class="mqtop"><b class="mqbig ${this._mqGc(r.note)}">${this._mqG(r.note)}</b><span><b>${esc((r.wort || "noch kein Zeugnis").replace(/^./, (x) => x.toUpperCase()))}</b><small>${r.tage} Tage mit Messwerten${r.trend != null ? ` · ${this._mqTr(r.trend)}` : ""}</small></span></div>
        ${Object.entries(F).map(([k, [t, sub]]) => { const g = (r.faecher || {})[k]; return `<div class="vrow"><span>${t}<small class="mut" style="display:block">${g == null ? "ohne Note – Sensor fehlt" : sub}</small></span><b class="mqg ${this._mqGc(g)}">${g == null ? "–" : g}</b></div>`; }).join("")}
        ${H.length ? `<div class="lsec" style="margin-top:12px">${ic("chart", 15)}Verlauf · 8 Wochen</div><div class="mqhist">${bars}</div><div class="mut sm">höher = bessere Note</div>` : ""}
        ${r.tipp ? `<div class="gst on" style="margin-top:10px">💡 <span>${esc(r.tipp)}</span></div>` : ""}`);
    }
    if (m.type === "mqxcost") {
      const H = S.hk || {}, r = (H.rooms || []).find((x) => x.id === m.k);
      if (!r) return wrap("Heizkosten", "", `<div class="mut sm">Keine Daten.</div>`);
      const D = (H.daily || []).map(([d, v]) => [d, v[r.id] || 0]), mx = Math.max(0.01, ...D.map((x) => x[1]));
      const bars = D.map(([d, v]) => { const we = [0, 6].includes(new Date(d + "T12:00:00").getDay()); return `<i class="${we ? "we" : ""}" title="${esc(d)}: ${this._mqEur(v)}" style="height:${Math.round(v / mx * 100)}%"></i>`; }).join("");
      return wrap(esc(r.name), `Heizkosten · ${esc(H.from || "")} bis ${esc(H.to || "")}`, `<div class="mqtop"><b class="mqbig eur">${r.est > 0 ? "ca. " : ""}${this._mqEur(r.eur)}</b><span><b>${r.share} % vom Haus</b><small>${r.eur_m2 != null ? `${num(r.eur_m2, 2)} €/m² · ` : ""}${r.meas > 0 ? `${this._mqEur(r.meas)} gemessen` : ""}${r.meas > 0 && r.est > 0 ? " · " : ""}${r.est > 0 ? `ca. ${this._mqEur(r.est)} geschätzt` : ""}</small></span></div>
        ${D.length > 1 ? `<div class="lsec" style="margin-top:10px">${ic("chart", 15)}Kosten je Tag</div><div class="mqhist cost">${bars}</div><div class="mut sm">hell = Wochenende · Ø ${this._mqEur(r.eur / Math.max(1, D.length))} pro Tag</div>` : ""}
        <div class="lsec" style="margin-top:10px">${ic("info", 15)}So gerechnet</div>
        ${row("Wärme (geschätzt)", "Heizlast × Ventilöffnung × Zeit", `<b>${num(r.kwh, 1)} kWh</b>`)}${r.elec > 0 ? row("Elektroheizer", r.meas > 0 ? "Energiezähler des Geräts" : "Leistung × Laufzeit", `<b>${this._mqEur(r.elec)}</b>`) : ""}
        ${row("Wärmequelle", H.meter ? "Anteil am Gesamtzähler" : "ohne Zähler: Schätzung", `<b>${esc({ erdgas: "Gas", fluessiggas: "Flüssiggas", heizoel: "Heizöl", pellets: "Pellets", fern: "Fernwärme", strom: "Wärmepumpe" }[(S.hk_fuel || {}).fuel] || "")}</b>`)}
        ${r.win > 0 ? row("davon Fenster offen", `${num(r.wm / 60, 0)} h beim Heizen`, `<b class="pkc">${this._mqEur(r.win)}</b>`) : ""}
        ${r.what_if > 0 ? `<div class="gst on" style="margin-top:10px">💡 <span>1 °C weniger spart hier ca. <b>${this._mqEur(r.what_if)}</b> im Zeitraum (Faustwert ca. 6 % je °C).</span></div>` : ""}`);
    }
    if (m.type === "mqxwin") {
      const H = S.hk || {}, L = (H.rooms || []).filter((r) => r.win > 0).sort((a, b) => b.win - a.win);
      return wrap("Fenster offen beim Heizen", `ca. ${this._mqEur(H.win)} im Zeitraum`, `${L.map((r) => row(esc(r.name), `${num(r.wm / 60, 0)} h offen beim Heizen`, `<b class="pkc">${this._mqEur(r.win)}</b>`)).join("")}
        <div class="mut sm" style="margin-top:8px">Stoßlüften kostet wenig – gekippte Fenster am meisten. Gerechnet mit Luftwechsel (offen 10/h, nach 20 Min. wie gekippt 2/h), Raumvolumen und Außentemperatur. Teil der Raumkosten, keine Extra-Summe.</div>`);
    }
    return wrap("Sponsor-Max-Extras", "", "");
  }

  /* ================= Build 4 · Wand-Tablet-Extras ================= */
  _mqTbDef() { return { room: "", night: "22-6", nc: "red", dark: false, shift: true, acts: [], alarm: true, bright: "", bat: "", charge: "" }; }
  _mqTbOn() { return this._tmOn() && this._mqOn("tb"); }
  _mqTbC() { const S = this._mqx; return { ...this._mqTbDef(), ...(((S && S.cfg && S.cfg.tb) || {})[this._tmId()] || {}) }; }
  _mqNight(T) {
    if (T.night === "off") return false;
    if (T.night === "sun") { const s = this._hass.states["sun.sun"]; return !!s && s.state === "below_horizon"; }
    const [a, b] = String(T.night).split("-").map(Number), h = new Date().getHours();
    return a > b ? h >= a || h < b : h >= a && h < b;
  }
  _mqAlarm() {
    if (!this._mqTbOn() || !this._mqTbC().alarm) return null;
    const e = this._advTk ? this._advTk("sf_status") : null, s = e ? this._hass.states[e] : null;
    if (!s || s.state !== "alarm") return null;
    const le = this._advTk("sf_letzter_alarm"), L = le ? (this._hass.states[le] || {}).attributes || {} : {};
    return { name: L.name || "Melder", raum: L.raum || "", since: le ? (this._hass.states[le] || {}).state : "" };
  }
  _mqState() {
    if (this._mqAlarm()) return "alarm";
    const T = this._mqTbC(), n = this._mqNight(T);
    if (!this._tmSleep) return "wach";
    if (n && T.dark && Date.now() - (this._mqSleepTs || Date.now()) > 120000) return "schlafen";
    return n ? "nacht" : "ruhe";
  }
  /* aus _tmTick: Zustand ermitteln, melden, Helligkeit, Alarm, Einbrennschutz */
  _mqTbTick() {
    if (Date.now() - (this._mqTs || 0) > 600000) this._mqLoad(true);  /* alle 10 Min.: Schalter, Einstellungen und Werte von anderen Geräten */
    if (!this._mqTbOn()) return;
    if (!this._mqWakeSub && this._hass.connection && this._hass.user && this._hass.user.is_admin) {
      this._mqWakeSub = true;
      this._hass.connection.subscribeEvents((ev) => { if (ev.data && ev.data.tid === this._tmId()) this._tmWake(); }, "fenster_heizung_mx_wake").catch(() => { this._mqWakeSub = false; });
    }
    if (this._tmSleep && !this._mqSleepTs) this._mqSleepTs = Date.now();
    if (!this._tmSleep) this._mqSleepTs = 0;
    const al = this._mqAlarm();
    if (al && !this._mqAl) { this._mqAl = true; this._mqMuteTs = 0; if (this._tmSleep) this._tmWake(); else this._render(); }
    if (!al && this._mqAl) { this._mqAl = false; this._mqBeep(false); this._render(); }
    if (al) this._mqBeep(Date.now() > (this._mqMuteTs || 0));
    const st = this._mqState();
    if (st !== this._mqSt || Date.now() - (this._mqStTs || 0) > (this._tmSleep ? 15000 : 60000)) {
      const changed = st !== this._mqSt; this._mqSt = st; this._mqStTs = Date.now();
      this._hass.callWS({ type: "fenster_heizung/mx_tb", tid: this._tmId(), state: st }).then((r) => {
        /* „Tablet wecken“ (Knopf-Entität): ohne Admin-Rechte gibt es kein Ereignis-Abo, darum kommt der Weckruf hier mit */
        if (r && r.wake && r.wake > (this._mqWk || 0)) { const first = this._mqWk === undefined; this._mqWk = r.wake; if (!first && this._tmSleep) this._tmWake(); }
      }).catch(() => { /* egal */ });
      if (changed) { this._mqBright(st); if (this._tmSleep) this._render(); }
    }
    if (this._mqTbC().shift && Date.now() - (this._mqShTs || 0) > 600000) {
      this._mqShTs = Date.now(); this._mqSh = [Math.round(Math.random() * 8 - 4), Math.round(Math.random() * 8 - 4)];
      const el = this.shadowRoot.querySelector(".mqrest"); if (el) el.style.transform = `translate(${this._mqSh[0]}px,${this._mqSh[1]}px)`;
    }
  }
  _mqBright(st) {
    const T = this._mqTbC(), e = T.bright, s = e ? this._hass.states[e] : null;
    if (!s) return;
    const pct = st === "wach" && this._mqNight(T) ? 30 : ({ wach: 100, alarm: 100, ruhe: 40, nacht: 5, schlafen: 0 }[st] ?? 100);
    if (e.startsWith("light.")) { this._hass.callService("light", pct ? "turn_on" : "turn_off", pct ? { entity_id: e, brightness_pct: pct } : { entity_id: e }).catch(() => { /* egal */ }); return; }
    const a = s.attributes || {}, lo = Number(a.min ?? 0), hi = Number(a.max ?? 255);
    this._hass.callService("number", "set_value", { entity_id: e, value: Math.round(lo + (hi - lo) * pct / 100) }).catch(() => { /* egal */ });
  }
  _mqBeep(on) {
    try {
      if (!on) { if (this._mqOsc) { this._mqOsc.stop(); this._mqOsc = null; } return; }
      if (this._mqOsc) return;
      const C = this._mqAc || (this._mqAc = new (window.AudioContext || window.webkitAudioContext)()), o = C.createOscillator(), g = C.createGain(), l = C.createOscillator(), lg = C.createGain();
      o.frequency.value = 3100; l.frequency.value = 2; lg.gain.value = 0.5; g.gain.value = 0.5; l.connect(lg); lg.connect(g.gain); o.connect(g); g.connect(C.destination); o.start(); l.start();
      this._mqOsc = { stop: () => { try { o.stop(); l.stop(); } catch (_) { /* egal */ } } };
    } catch (_) { /* ohne Ton */ }
  }
  _mqAlarmHtml(al) {
    const muted = Date.now() < (this._mqMuteTs || 0);
    return `<div class="mqalarm"><div class="mqai">🔥</div><b>RAUCHALARM</b><div class="mqar">${esc(al.name)}${al.raum ? ` · ${esc(al.raum)}` : ""}</div><div class="mut">Modul 11${al.since ? ` · seit ${esc(new Date(al.since).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }))}` : ""}</div>
      <button class="mqab" data-act="mqxmute">${muted ? "Ton ist stumm" : "Ton stumm 60 s"}</button><button class="mqab2" data-act="mqxplan">Melder im Plan zeigen</button>
      <div class="mqan">Volle Helligkeit · Ton nur am Tablet, der Melder bleibt laut. Verschwindet, wenn Modul 11 Entwarnung gibt.</div></div>`;
  }
  _mqTiles(n = 5) {
    const T = this._mqTbC(), S = this._mqx || {}, st = this._hass.states;
    let R = this._collect();
    const i = R.findIndex((r) => r.id === T.room); if (i > 0) R = [R[i], ...R.slice(0, i), ...R.slice(i + 1)];
    const tile = (r) => {
      const th = (r.thermos || []).map((e) => st[e]).filter(Boolean), cur = th.map((x) => parseFloat(x.attributes.current_temperature)).filter(isFinite);
      const rt = this._rt(r, "show"), t = rt.sensor ? rt.t : cur.length ? cur.reduce((a, b) => a + b, 0) / cur.length : NaN, h = r.humEid && st[r.humEid] ? parseFloat(st[r.humEid].state) : NaN;
      const open = r.mode === "heizung_pausiert" || (r.windows || []).some((e) => st[e] && ["on", "open"].includes(st[e].state)), heat = th.some((x) => x.attributes.hvac_action === "heating");
      return `<div class="mqtile ${r.id === T.room ? "own" : ""}"><small>${esc(r.name)}</small><b>${isFinite(t) ? num(t, 1) + "°" : "–"}</b>${isFinite(h) ? `<span class="${h > 70 ? "warn" : ""}">${num(h, 0)} %</span>` : ""}<em class="${open ? "pk" : heat ? "tl" : ""}">${open ? "🪟 offen" : heat ? "heizt" : ""}</em></div>`;
    };
    const extra = [];
    if (this._mqOn("hk") && S.hk && this._mqScope === "day") extra.push(`<div class="mqtile"><small>Heizung heute</small><b>${this._mqEur(S.hk.eur)}</b></div>`);
    return R.slice(0, Math.max(1, n - extra.length)).map(tile).join("") + extra.join("");
  }
  /* Ruhe / Nacht / Schlafen statt der normalen Ruhe-Uhr */
  _mqRest() {
    if (!this._mqTbOn()) return "";
    const T = this._mqTbC(), st = this._mqState(), now = new Date(), clk = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }), S = this._mqx || {};
    const sh = this._mqSh ? `style="transform:translate(${this._mqSh[0]}px,${this._mqSh[1]}px)"` : "";
    if (st === "schlafen") return `<div class="tmrest mqrest mqsleep" ${sh}></div>`;
    if (st === "nacht") {
      const open = this._collect().filter((r) => r.mode === "heizung_pausiert").map((r) => `${esc(r.name)} 🪟 offen`).slice(0, 2).join(" · ");
      return `<div class="tmrest mqrest mqnight ${T.nc}" ${sh}><div class="mqclk" data-tmclk>${clk}</div>${open ? `<div class="mqnh">${open}</div>` : ""}</div>`;
    }
    const Zw = S.wk ? this._mqZ(S.wk, "week") : null, wk = this._mqOn("wk") && Zw && Zw.note != null ? ` · Zeugnis ${this._mqG(Zw.note)}` : "";
    return `<div class="tmrest mqrest" ${sh}><div class="mqrh"><div><div class="mqclk" data-tmclk>${clk}</div><div class="tmrd" data-tmdate>${now.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}</div></div><div class="mqrs">${T.room ? `<em class="lgchip">📍 ${esc((this._collect(true).find((r) => r.id === T.room) || {}).name || "")}</em>` : ""}<small>${wk.replace(/^ · /, "")}</small></div></div>
      <div class="mqtiles">${this._mqTiles(5)}</div><div class="tmrw">Antippen zum Aufwecken</div></div>`;
  }
  /* Leiste oben auf der Startseite im Tablet-Modus: Räume (eigener zuerst) und Schnellaktionen */
  _mqStrip() {
    if (!this._mqTbOn()) return "";
    if (this._mqScope !== "day" && this._mqOn("hk") && !this._mqBusy && Date.now() - (this._mqTs || 0) > 300000) this._mqLoad(true, "day");
    const T = this._mqTbC(), st = this._hass.states;
    const acts = T.acts.map((e) => `<button class="mqqa" data-act="mqxqa" data-k="${esc(e)}">${ic(e.startsWith("scene.") ? "palette" : e.startsWith("script.") ? "play" : e.startsWith("light.") ? "lamp" : "plug", 18)}<span>${esc(this._wzName(e))}</span></button>`).join("");
    return `<div class="mqstrip"><div class="mqtiles">${this._mqTiles(5)}</div>${acts ? `<div class="mqqas">${acts}</div>` : ""}</div>`;
  }
  _mqTbAct(a, b) {
    if (a === "mqxmute") { this._mqMuteTs = Date.now() + 60000; this._mqBeep(false); this._render(); return true; }
    if (a === "mqxplan") { this._mqPlanTs = Date.now() + 120000; this._tmView = this._mdList().some((m) => m.id === "sf") ? "sf" : this._mdList().some((m) => m.id === "gr") ? "gr" : "st"; this._render(); return true; }
    if (a === "mqxqa") {
      const e = b.dataset.k, d = e.split(".")[0];
      const svc = d === "scene" ? ["scene", "turn_on"] : d === "script" ? ["script", "turn_on"] : d === "button" ? ["button", "press"] : [d === "input_boolean" ? "input_boolean" : d, "toggle"];
      this._hass.callService(svc[0], svc[1], { entity_id: e }).then(() => this._toast(`${this._wzName(e)} ✓`)).catch(() => this._toast("Das ging nicht"));
      return true;
    }
    return false;
  }
