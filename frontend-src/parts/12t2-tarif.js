  /* ================= Modul 14: Stromtarif · v0.6 Tarif-Dienst (Backend tarif.py) · v0.7 neue Optik · v0.9 Tarif-Check, Woche, Daten prüfen ================= */
  /* Daten: tarif_get einmal, danach Push über tarif_sub (neue Viertelstunde, Preise für morgen). Rückfall: Abruf jede Minute. */
  _tfLoad(force) {
    if (!this._hass) return;
    this._tfSub();
    if (this._tfBusy || (!force && this._tfD && Date.now() - this._tfD.ts < (this._tfUnsub ? 300000 : 60000))) return;
    this._tfBusy = true;
    this._hass.callWS({ type: "fenster_heizung/tarif_get" }).then((r) => { this._tfD = { d: r || {}, ts: Date.now() }; }).catch(() => { this._tfD = { d: { error: true }, ts: Date.now() }; })
      .finally(() => { this._tfBusy = false; this._tfRedraw(); });
  }
  _tfSub() {
    const c = this._hass && this._hass.connection;
    if (this._tfUnsub || this._tfSubTry || !c || !c.subscribeMessage) return;
    this._tfSubTry = true;
    c.subscribeMessage((m) => { const old = (this._tfD && this._tfD.d) || {}; this._tfD = { d: { ...old, ...m, found: old.found }, ts: Date.now() }; this._tfRedraw(); }, { type: "fenster_heizung/tarif_sub" })
      .then((u) => { this._tfUnsub = u; }).catch(() => { this._tfSubTry = false; });
  }
  _tfRedraw() {
    if (this._modal && this._modal.type === "tfset") this._renderModal();
    if ((this._mdActive && this._mdActive() === "dt" && !this._stOpen) || this._tfWantR) { this._tfWantR = false; this._render(); }
  }
  _tf() { const d = (this._tfD && this._tfD.d) || {}; return { series: [], found: [], ...d, cfg: { src: "auto", sensor: "", boerse: "auto", add: 18.6, vat: 19, down: 3, up: 4, res: "q", win_h: 3, ...(d.cfg || {}), nne: { on: false, ht_from: 17, ht_to: 20, ht_ct: 6.1, nt_from: 0, nt_to: 6, nt_ct: -4.2, ...((d.cfg || {}).nne || {}) }, devs: { ...((d.cfg || {}).devs || {}) }, alarm: this._tfAlarmCfg((d.cfg || {}).alarm) }, now: d.now || {}, devs: d.devs || [], alarm: d.alarm || {}, alog: d.alog || [] }; }
  _tfAlarmCfg(a = {}) { const x = a || {}; return { to: x.to || [], below: { on: false, ct: 20, ...(x.below || {}) }, above: { on: false, ct: 40, ...(x.above || {}) }, neg: { on: true, ...(x.neg || {}) }, tomorrow: { on: false, ...(x.tomorrow || {}) }, lead: x.lead || 0, quiet: { on: true, from: 22, to: 7, ...(x.quiet || {}) } }; }
  _tfHm(ts) { return ts == null ? "–" : new Date(ts * 1000).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }); }
  _tfDayKey(ts) { const d = new Date(ts * 1000); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }
  _tfIsTomorrow(ts) { const t = new Date(); t.setHours(24, 0, 0, 0); return ts * 1000 >= t.getTime(); }
  _tfWhen(ts) { return (this._tfIsTomorrow(ts) ? "morgen " : "") + this._tfHm(ts); }
  _tfLv(ct, avg, C) { if (ct == null || avg == null) return ""; if (ct < 0) return "neg"; if (ct <= avg - C.down) return "cheap"; if (ct >= avg + C.up) return "dear"; return "normal"; }
  _tfCol(lv) { return ({ cheap: "#22c55e", normal: "#f59e0b", dear: "#ef4444", neg: "#3b82f6" })[lv] || "#64748b"; }
  _tfName(lv) { return ({ cheap: "Günstig", normal: "Normal", dear: "Teuer", neg: "Negativ" })[lv] || "–"; }
  _tfCt(v, d = 1) { return v == null || !isFinite(v) ? "–" : num(v, d); }
  /* Tagesschnitt je Kalendertag (gewichtet), damit morgen nach seinem eigenen Schnitt gefärbt wird */
  _tfAvgs(ser) { const m = {}; ser.forEach((x) => { const k = this._tfDayKey(x.s); (m[k] = m[k] || [0, 0]); m[k][0] += x.ct * x.d; m[k][1] += x.d; }); return Object.fromEntries(Object.entries(m).map(([k, [a, w]]) => [k, a / w])); }
  _tfHourly(ser) { const by = new Map(); ser.forEach((x) => { const k = Math.floor(x.s / 3600) * 3600; if (!by.has(k)) by.set(k, []); by.get(k).push(x.ct); }); return [...by.entries()].map(([s, v]) => ({ s, d: 3600, ct: v.reduce((a, b) => a + b, 0) / v.length })); }
  /* Sonne aus Modul 16 (Stunde → kWh) als Zeitpunkte */
  _tfSun() {
    if (!this._mdState().on.sp) return null;
    if (!this._spD) { this._spLoad(); return null; }
    let C; try { C = this._spCalc(); } catch (_) { return null; }
    const d0 = new Date(); d0.setHours(0, 0, 0, 0); const t0 = d0.getTime() / 1000, d1 = new Date(d0); d1.setDate(d1.getDate() + 1); const t1 = d1.getTime() / 1000;
    const pts = [...(C.rows || []).map(([h, v]) => [t0 + h * 3600, v]), ...(C.tm || []).map(([h, v]) => [t1 + h * 3600, v])].filter((p) => isFinite(p[1]));
    return pts.some((p) => p[1] > 0.01) ? pts : null;
  }
  /* B1/B3 · Preisband: Balken je Viertelstunde/Stunde in Stufenfarbe, Jetzt-Linie, Schnitt gestrichelt, bestes Fenster umrandet, morgen hinterlegt */
  _tfBand(S, o = {}) {
    let ser = (S.series || []).filter((x) => x.ct != null && isFinite(x.ct));
    if (o.res === "h" && ser.length && ser[0].d < 3600) ser = this._tfHourly(ser);
    const avgs = this._tfAvgs(S.series || []);
    if (o.from != null) ser = ser.filter((x) => x.s + x.d > o.from);
    if (o.to != null) ser = ser.filter((x) => x.s < o.to);
    if (ser.length < 2) return "";
    const C = S.cfg, t0 = ser[0].s, t1 = ser[ser.length - 1].s + ser[ser.length - 1].d, span = t1 - t0, X = (t) => ((t - t0) / span) * 100;
    const vals = ser.map((x) => x.ct), mx = Math.max(...vals), mn = Math.min(...vals), neg = mn < 0;
    const lo = neg ? Math.min(mn * 1.15, -(mx - mn) * 0.16) : Math.max(0, mn - Math.max(2, (mx - mn) * 0.45)), hi = mx + Math.max(1, (mx - mn) * 0.12), H = 100, Y = (v) => H - ((v - lo) / (hi - lo)) * H, base = neg ? Y(0) : H;
    const gap = ser.length > 120 ? 0.12 : ser.length > 60 ? 0.2 : 0.35, now = Date.now() / 1000;
    const bars = ser.map((x) => { const l = X(x.s), w = Math.max(0.05, X(x.s + x.d) - l - gap), lv = this._tfLv(x.ct, avgs[this._tfDayKey(x.s)], C), y = Y(x.ct), past = x.s + x.d <= now;
      return `<rect x="${l.toFixed(3)}" y="${Math.min(y, base).toFixed(2)}" width="${w.toFixed(3)}" height="${Math.max(0.6, Math.abs(base - y)).toFixed(2)}" fill="${this._tfCol(lv)}"${past ? ' opacity=".38"' : ""}><title>${this._tfWhen(x.s)} · ${this._tfCt(x.ct)} ct/kWh · ${this._tfName(lv)}</title></rect>`; }).join("");
    const tm = new Date(); tm.setHours(24, 0, 0, 0); const tms = tm.getTime() / 1000;
    const shade = tms > t0 && tms < t1 ? `<rect x="${X(tms).toFixed(3)}" y="0" width="${(100 - X(tms)).toFixed(3)}" height="${H}" class="tfmo"/>` : "";
    let sun = "";
    const SP = o.sun ? this._tfSun() : null;
    if (SP) { const smx = Math.max(...SP.map((p) => p[1])), pts = SP.filter((p) => p[0] + 3600 > t0 && p[0] < t1).map((p) => [Math.max(0, Math.min(100, X(p[0] + 1800))), H - (p[1] / smx) * H * 0.62]);
      if (pts.length > 2) sun = `<path d="M${pts[0][0].toFixed(2)} ${H}${pts.map((p) => `L${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join("")}L${pts[pts.length - 1][0].toFixed(2)} ${H}Z" class="tfsun"/>`; }
    const avgT = S.today && S.today.avg != null ? S.today.avg : null, ya = avgT != null && avgT > lo && avgT < hi ? Y(avgT) : null;
    const B = o.best && o.best.e > t0 && o.best.s < t1 ? o.best : null;
    const nowL = now > t0 && now < t1 ? X(now) : null;
    const html = [];
    if (shade) html.push(`<span class="tfl mo" style="left:calc(${X(tms).toFixed(2)}% + 6px)">morgen</span>`);
    if (ya != null) html.push(`<span class="tfl av" style="top:${ya.toFixed(1)}%">Ø ${this._tfCt(avgT)} ct</span>`);
    if (nowL != null) html.push(`<span class="tfl nw" style="left:${nowL.toFixed(2)}%">jetzt</span>`);
    if (B && o.bestLbl !== false) html.push(`<span class="tfl bw${neg ? " up" : ""}" style="left:${((X(Math.max(B.s, t0)) + X(Math.min(B.e, t1))) / 2).toFixed(2)}%">günstigste ${S.cfg.win_h} Std.</span>`);
    const ticks = [], step = span > 30 * 3600 ? 6 : span > 14 * 3600 ? 3 : 2;
    for (let t = Math.ceil(t0 / 3600) * 3600; t < t1; t += 3600) { const h = new Date(t * 1000).getHours(); if (h % step === 0 && !(nowL != null && Math.abs(X(t) - nowL) < 2.5)) ticks.push(`<span style="left:${X(t).toFixed(2)}%">${String(h).padStart(2, "0")}</span>`); }
    return `<div class="tfband ${o.cls || ""}" style="--bh:${o.h || 150}px"><div class="tfplot"><svg viewBox="0 0 100 ${H}" preserveAspectRatio="none" aria-hidden="true">${shade}${sun}${bars}
        ${neg ? `<line x1="0" x2="100" y1="${base.toFixed(2)}" y2="${base.toFixed(2)}" class="tfzero"/>` : ""}${ya != null ? `<line x1="0" x2="100" y1="${ya.toFixed(2)}" y2="${ya.toFixed(2)}" class="tfavg"/>` : ""}
        ${B ? `<rect x="${X(Math.max(B.s, t0)).toFixed(3)}" y="2" width="${(X(Math.min(B.e, t1)) - X(Math.max(B.s, t0))).toFixed(3)}" height="${H - 2}" rx="1.2" class="tfbest"/>` : ""}
        ${nowL != null ? `<line x1="${nowL.toFixed(3)}" x2="${nowL.toFixed(3)}" y1="0" y2="${H}" class="tfnow"/>` : ""}</svg>${html.join("")}</div>
      ${o.axis === false ? "" : `<div class="tfax">${ticks.join("")}</div>`}</div>`;
  }
  _tfBest(S) { const b = S.best, bm = S.best_tomorrow; return bm && b && bm.avg < b.avg - 0.05 ? bm : b || bm; }
  _tfBanner(S) {
    const C = S.cfg, N = S.now, lv = N.lv || "normal", col = this._tfCol(lv), T = S.today || {}, M = S.tomorrow, best = this._tfBest(S), mv = MV.dt;
    const parts = [];
    if (N.until) { const nxt = (S.series || []).find((x) => x.s === N.until); parts.push(`${this._tfName(lv).toLowerCase()} bis ${this._tfWhen(N.until)}${nxt ? `, danach ${this._tfCt(nxt.ct)} ct` : ""}`); }
    else parts.push(this._tfName(lv).toLowerCase() + " bis zum Ende der bekannten Preise");
    if (best) parts.push(`günstigste ${C.win_h} Std. ${this._tfIsTomorrow(best.s) ? "morgen " : "ab "}${this._tfHm(best.s)}–${this._tfHm(best.e)} Uhr`);
    const d = N.ct != null && T.avg != null ? N.ct - T.avg : null;
    const chips = [`<span class="tflvp" style="--lc:${col}">${this._tfName(lv)}${d != null ? ` · ${d >= 0 ? "+" : "−"}${this._tfCt(Math.abs(d))} ct ${d >= 0 ? "über" : "unter"} Ø` : ""}</span>`];
    chips.push(`<span class="chip">${M ? `Morgen Ø ${this._tfCt(M.avg)} ct` : "Morgen ab ca. 13 Uhr"}</span>`);
    if (S.neg) chips.push(`<span class="chip tfneg">${ic("energy", 13)}Negativ ab ${this._tfWhen(S.neg.s)}</span>`);
    else if (M) chips.push(`<span class="chip">tiefster Preis morgen ${this._tfCt(M.min)} ct</span>`);
    const end = (S.series || []).length ? S.series[S.series.length - 1].s + S.series[S.series.length - 1].d : null;
    const band = this._tfBand(S, { from: Date.now() / 1000 - 2 * 3600, to: end, best, h: 132, cls: "tfbn" });
    return `<div class="card tfbnr" style="--lc:${col}"><div class="tfbt"><div class="tfbl">${ic("chart", 15)}Strompreis jetzt · ${esc(S.src_name || "–")}</div>
        <div class="tfbb">${this._tfCt(N.ct)}<small>ct/kWh</small></div><div class="tfbs">${esc(parts.join(" · "))}</div><div class="tfbc">${chips.join("")}</div></div>
      <div class="tfbi">${band}${mv ? `<span class="mlv">v${esc(mv.v)} · Build ${mv.b}</span>` : ""}</div></div>`;
  }
  /* B2 · Kacheln 2.0: ruhig, Zustandspunkt, kein farbiger Rahmen */
  _tfTiles(S) {
    const C = S.cfg, N = S.now, T = S.today || {}, M = S.tomorrow, best = this._tfBest(S);
    const tile = (icon, name, val, unit, sub, lv) => { const c = lv ? this._tfCol(lv) : "#2dd4bf"; return `<div class="wxtl" style="--tc:${c}"><div class="wxth"><span class="wxti">${ic(icon, 20)}</span><i class="wxdot" aria-hidden="true"></i></div>
      <div class="wxtn">${name}</div><div class="wxtv">${val}${unit ? `<small>${unit}</small>` : ""}</div><div class="wxts">${sub}</div></div>`; };
    const lvH = this._tfLv(N.next_h, T.avg, C), up = N.next_h != null && N.ct != null ? N.next_h - N.ct : null;
    const out = [
      tile("bolt", "Jetzt", this._tfCt(N.ct), "ct", `${this._tfName(N.lv).toLowerCase()}${N.until ? " · bis " + this._tfWhen(N.until) : ""}`, N.lv),
      tile("up", "Nächste Stunde", this._tfCt(N.next_h), "ct", up == null ? "–" : Math.abs(up) < 0.3 ? "→ etwa gleich" : up > 0 ? "↗ wird teurer" : "↘ wird günstiger", lvH),
      tile("clock", "Bestes Fenster", best ? this._tfHm(best.s) : "–", best ? "Uhr" : "", best ? `${this._tfIsTomorrow(best.s) ? "morgen" : "heute"} · Ø ${this._tfCt(best.avg)} ct` : "Zu wenig Preise", best ? this._tfLv(best.avg, T.avg, C) || "cheap" : ""),
      M ? tile("today", "Morgen", this._tfCt(M.avg), "ct Ø", T.avg != null ? `${M.avg <= T.avg ? "−" : "+"}${this._tfCt(Math.abs(M.avg - T.avg))} ct zu heute` : `${this._tfCt(M.min)} bis ${this._tfCt(M.max)} ct`, T.avg != null && M.avg <= T.avg ? "cheap" : "normal")
        : tile("today", "Morgen", "–", "", "noch nicht veröffentlicht · ab ca. 13 Uhr", ""),
      S.saved_m && S.saved_m.n ? tile("chart", "Gespart im Monat", `${S.saved_m.save >= 0 ? "" : "−"}${num(Math.abs(S.saved_m.save), 2)}`, "€", `${S.saved_m.save >= 0 ? "gegenüber Festpreis" : "mehr als mit Festpreis"} · ${num(S.saved_m.kwh, 0)} kWh${S.saved_m.est ? " · teils geschätzt" : ""}`, S.saved_m.save >= 0 ? "cheap" : "dear")
        : S.neg ? tile("energy", "Negativer Preis", this._tfWhen(S.neg.s).replace("morgen ", ""), "Uhr", `${this._tfIsTomorrow(S.neg.s) ? "morgen" : "heute"} · bis ${this._tfCt(S.neg.min)} ct`, "neg")
        : tile("alert", "Teuerste Zeit", S.dear ? this._tfHm(S.dear.s) : "–", S.dear ? "Uhr" : "", S.dear ? `${this._tfIsTomorrow(S.dear.s) ? "morgen" : "heute"} · ${this._tfCt(S.dear.ct)} ct` : "–", S.dear ? "dear" : "")];
    return `<div class="wxtiles tftiles">${out.join("")}</div>`;
  }
  /* B3 · Heute und morgen in einem Band */
  _tfDays(S) {
    const res = this._tfView || S.cfg.res || "q", q = (S.series || []).some((x) => x.d < 3600), sun = !!this._tfSun(), wk = (S.week || []).length >= 2;
    const d0 = new Date(); d0.setHours(0, 0, 0, 0); const end = (S.series || []).length ? S.series[S.series.length - 1].s + S.series[S.series.length - 1].d : null;
    const leg = [["cheap", "günstig"], ["normal", "normal"], ["dear", "teuer"], ["neg", "negativ"]].map(([k, t]) => `<span><i style="background:${this._tfCol(k)}"></i>${t}</span>`).join("") + (sun ? `<span><i class="sn"></i>Sonne (Modul 16)</span>` : "");
    const M = S.tomorrow, T = S.today;
    return `<div class="card"><div class="wxtlh"><h2>${ic("chart", 18)}Heute und morgen</h2>${q || wk ? `<div class="seg wxseg">${q ? `<button class="${res === "q" ? "sel" : ""}" data-act="tfxview" data-k="q">15 Min.</button>` : ""}<button class="${res === "h" ? "sel" : ""}" data-act="tfxview" data-k="h">Stunden</button>${wk ? `<button class="${res === "w" ? "sel" : ""}" data-act="tfxview" data-k="w">Woche</button>` : ""}</div>` : ""}</div>
      ${res === "w" && wk ? this._tfWeek(S) : this._tfBand(S, { from: d0.getTime() / 1000, to: end, res, best: S.best_tomorrow || S.best, sun: true, h: 190 })}
      <div class="tfleg">${leg}</div>
      <div class="tfdays"><div><span class="mut">Heute</span><b>Ø ${this._tfCt(T && T.avg)} ct</b><small>${T ? `${this._tfCt(T.min)} bis ${this._tfCt(T.max)} ct · ${num(T.hours, 0)} Std.` : "–"}</small></div>
        <div><span class="mut">Morgen</span><b>${M ? `Ø ${this._tfCt(M.avg)} ct` : "noch offen"}</b><small>${M ? `${this._tfCt(M.min)} bis ${this._tfCt(M.max)} ct${M.neg ? ` · ${M.neg} × negativ` : ""}` : "Die Börse veröffentlicht gegen 13 Uhr, der Dienst holt sie dann von selbst."}</small></div></div></div>`;
  }
  /* Günstigste Zeiten ab jetzt (je eine Stunde, ohne Überschneidung) */
  _tfSlots(S) {
    const N = S.now, sl = S.slots || [], T = S.today || {}, mx = Math.max(1, ...sl.map((x) => Math.abs(x.avg)), N.ct || 0);
    if (!sl.length) return "";
    const rows = sl.map((x, i) => { const sv = N.ct != null ? N.ct - x.avg : null, lv = this._tfLv(x.avg, T.avg, S.cfg) || "cheap";
      return `<div class="tfsl"><span class="tfrk">${i + 1}</span><div class="tfst"><b>${this._tfIsTomorrow(x.s) ? "Morgen " : ""}${this._tfHm(x.s)}–${this._tfHm(x.e)} Uhr</b><small>${sv != null && sv > 0.05 ? `${this._tfCt(sv)} ct günstiger als jetzt` : "etwa wie jetzt"}</small></div>
        <div class="tfsb"><i style="width:${Math.max(6, (Math.abs(x.avg) / mx) * 100).toFixed(0)}%;background:${this._tfCol(lv)}"></i></div><b class="tfsv">${this._tfCt(x.avg)}<small> ct</small></b></div>`; }).join("");
    return `<div class="card"><h2>${ic("clock", 18)}Günstigste Stunden ab jetzt</h2>${rows}<div class="gst" style="margin-top:6px">Je eine Stunde, ohne Überschneidung – zum Waschen, Spülen, Laden oder Heizen.</div></div>`;
  }
  _tfSrcCard(S) {
    const C = S.cfg, res = (S.series || []).some((x) => x.d < 3600) ? "15 Minuten" : (S.series || []).length > 2 ? "Stunden" : "–";
    const row = (k, v) => `<div><span class="mut">${k}</span><b>${v}</b></div>`;
    return `<div class="card"><h2>${ic("sliders", 18)}Woher die Preise kommen</h2><div class="spsrc">
      ${row("Quelle", esc(S.src_name || "–") + (C.src === "auto" ? " · automatisch" : ""))}${row("Auflösung", res)}
      ${row("Preis", S.boerse ? `Endpreis aus Börsenpreis + ${this._tfCt(C.add, 2)} ct, ${num(C.vat, 0)} % MwSt.` : S.src === "tibber" ? "Endpreis von Tibber" : "wie geliefert")}
      ${row("Gespeicherte Tage", `${S.hist_days || 0} von 400`)}${C.nne.on ? row("Netzentgelt", `zeitvariabel · ${C.nne.ht_from}–${C.nne.ht_to} Uhr +${this._tfCt(C.nne.ht_ct)} ct`) : ""}
      ${S.note ? `<div class="spsrcw">${ic("alert", 14)}${esc(S.note)}</div>` : ""}</div></div>`;
  }
  _dtPage() {
    this._tfLoad();
    const S = this._tf(), adm = this._hass.user && this._hass.user.is_admin;
    if (!this._tfD) return `<div class="card empty">${ic("chart", 30)}<div style="margin-top:8px">Preise werden geladen …</div></div>`;
    if (S.error || !S.src) return `${this._betaBox("Modul 14 holt die Preise jetzt selbst – direkt von Tibber oder aus einem Preis-Sensor.")}<div class="card empty">${ic("chart", 30)}
      <div style="margin-top:8px"><b>Noch keine Strompreise.</b><br>Verbinde Tibber unter Einstellungen → Integrationen oder wähle einen Preis-Sensor mit Preisliste (Tibber, Nord Pool, EPEX Spot, aWATTar, Octopus …). Ohne beides gilt der Festpreis aus den Haus-Werten.</div>
      ${adm ? `<button class="btn2 pri" style="margin-top:12px" data-act="tfxopen">${ic("sliders", 16)} Quelle wählen</button>` : ""}</div>`;
    if (S.src === "fix") return `${this._betaBox("Mit einem Festpreis gibt es keine günstigen Zeiten. Verbinde Tibber oder wähle einen Preis-Sensor.")}
      <div class="card"><h2>${ic("bolt", 18)}Festpreis</h2><div class="wxtiles tftiles"><div class="wxtl" style="--tc:#2dd4bf"><div class="wxtn">Arbeitspreis</div><div class="wxtv">${this._tfCt(S.now.ct)}<small>ct/kWh</small></div><div class="wxts">aus den Haus-Werten</div></div></div>
      ${adm ? `<button class="btn2" style="margin-top:12px" data-act="tfxopen">${ic("sliders", 16)} Quelle wählen</button>` : ""}</div>${this._tfSrcCard(S)}`;
    return `${this._tfBanner(S)}${this._tfTiles(S)}${this._betaBox("Neu in v0.9: „Lohnt sich dein Tarif?“, Wochenansicht und „Daten prüfen“ in den Einstellungen.")}
      ${this._tfDevCard(S)}${this._tfDays(S)}${this._tfCheckCard(S)}<div class="wxcols">${this._tfSlots(S)}${this._tfAlarmCard(S)}</div>${this._tfSrcCard(S)}`;
  }
  /* Startseite: Preis, Stufe, Mini-Band der nächsten 12 Stunden */
  _tfStartK(K) {
    this._tfLoad(); if (!this._tfD) this._tfWantR = true;
    const S = this._tf(); if (!this._tfD || S.error || !S.src || S.now.ct == null) return null;
    const N = S.now, now = Date.now() / 1000, sl = (S.slots || [])[0];
    K.v = this._tfCt(N.ct); K.u = "ct"; K.l1 = `${this._tfName(N.lv).toLowerCase()}${N.until ? " bis " + this._tfHm(N.until) : ""}`;
    if (S.src !== "fix" && sl) K.l2 = N.lv === "cheap" || N.lv === "neg" ? "jetzt günstig" : `günstig ab ${this._tfWhen(sl.s)}`;
    K.z = N.lv === "dear" ? "hint" : N.lv === "neg" ? "act" : "ok";
    if (S.src !== "fix") K.gr = this._tfBand(S, { from: now - 1800, to: now + 12 * 3600, res: "h", h: 40, axis: false, bestLbl: false, cls: "tfmini" }).replace(/<span class="tfl[^>]*>[^<]*<\/span>/g, "");
    return K;
  }
  /* ================= v0.8 · C1 Bestes Fenster je Gerät ================= */
  _tfDur(sec) { const m = Math.round(sec / 300) * 5, h = Math.floor(m / 60); return h ? `${h} Std.${m % 60 ? ` ${String(m % 60).padStart(2, "0")} Min.` : ""}` : `${m} Min.`; }
  _tfDevCard(S) {
    const all = S.devs || [], adm = this._hass.user && this._hass.user.is_admin;
    if (!this._mdState().on.gs) return "";
    if (!all.length) return `<div class="card"><h2>${ic("clock", 18)}Bestes Fenster je Gerät</h2><div class="mut sm">Lege in Modul 4 Geräte mit Leistungsmessung an (Waschmaschine, Trockner, Spülmaschine …). Nach zwei Läufen kennt Modul 14 die Laufzeit und schlägt die günstigste Startzeit vor.</div></div>`;
    const on = all.filter((x) => x.on), rows = on.map((d) => {
      const T = GS_TYP[d.typ] || {}, w = d.w, lv = w ? this._tfLv(w.avg, (S.today || {}).avg, S.cfg) || "cheap" : "";
      const sub = w ? `${this._tfDur(d.dur)} (gelernt, ${d.n} Läufe)${d.curve ? " · Kurve" : ""} · ${w.sun >= 10 ? `${w.sun} % Sonne + Preis` : "Preis"}${d.by != null ? ` · fertig bis ${d.by} Uhr` : ""}${d.from != null ? ` · ab ${d.from} Uhr` : ""}`
        : d.running ? "läuft gerade" : d.n < 2 ? `Noch zu wenig Läufe (${d.n} von 2) – Modul 4 lernt die Laufzeit` : "Kein passendes Fenster in den bekannten Preisen";
      const when = w ? (w.now ? "jetzt" : `${this._tfIsTomorrow(w.s) ? "morgen " : "heute "}${this._tfHm(w.s)}`) : "–";
      const det = w ? `Ø ${this._tfCt(w.avg)} ct${w.save >= 0.01 ? ` · −${num(w.save, 2)} € gg. jetzt` : w.now ? " · jetzt am günstigsten" : ""}` : "";
      const btn = !w || !adm ? "" : w.now ? `<span class="tfbadge ok">Jetzt starten</span>` : d.rem ? `<button class="tfbadge on" data-act="tfxrem" data-k="${esc(d.id)}" title="Erinnerung löschen">${ic("bell", 13)}${this._tfHm(d.rem)}</button>` : `<button class="tfbadge" data-act="tfxrem" data-k="${esc(d.id)}">Erinnern</button>`;
      return `<div class="tfdev ${w ? "" : "off"}" style="--lc:${this._tfCol(lv)}"><span class="tfdi">${ic(T.i || "plug", 20)}</span><div class="tfdn"><b>${esc(d.name)}</b><small>${esc(sub)}</small></div>
        <div class="tfdw"><b>${when}</b><small>${det}</small></div>${btn}</div>`; }).join("");
    const offN = all.length - on.length;
    return `<div class="card"><div class="wxtlh"><h2>${ic("clock", 18)}Bestes Fenster je Gerät</h2>${adm ? `<button class="ibtn" data-act="tfxopen" data-k="w" aria-label="Geräte wählen">${ic("sliders", 16)}</button>` : ""}</div>
      ${rows || `<div class="mut sm">Kein Gerät gewählt.</div>`}
      <div class="gst" style="margin-top:8px">Laufzeit und Verbrauch gelernt aus Modul 4, bewertet mit Preis × Verbrauchsverlauf${S.cfg.sun ? "; erwartete Sonne zählt mit dem Einspeisepreis" : ""}. „Erinnern“ meldet sich zur Startzeit.${offN ? ` ${offN} ${offN === 1 ? "Gerät" : "Geräte"} ohne Fenster (z. B. Kühlschrank) – in den Einstellungen wählbar.` : ""}</div></div>`;
  }
  /* ================= v0.8 · C2 Preisalarm ================= */
  _tfAlarmCard(S) {
    const A = S.cfg.alarm, V = S.alarm || {}, adm = this._hass.user && this._hass.user.is_admin;
    const per = (p) => p ? `${this._tfIsTomorrow(p.s) ? "morgen " : p.s * 1000 <= Date.now() ? "jetzt bis " : "heute "}${p.s * 1000 <= Date.now() ? "" : this._tfHm(p.s) + "–"}${this._tfHm(p.e)}` : "nicht in Sicht";
    const sw = (k, on) => adm ? `<button class="sw ${on ? "on" : ""}" data-act="tfxal" data-k="${k}" aria-pressed="${!!on}" aria-label="Alarm ${k}"></button>` : "";
    const row = (k, icon, col, name, chip) => `<div class="tfal"><span class="tfai" style="color:${col}${icon === "down" ? ";transform:rotate(180deg)" : ""}">${ic(icon === "down" ? "up" : icon, 17)}</span><b>${name}</b>${chip ? `<span class="chip">${esc(chip)}</span>` : ""}${sw(k, A[k].on)}</div>`;
    const tgt = (V.targets || []).length, log = (S.alog || []).slice(0, 3);
    return `<div class="card"><div class="wxtlh"><h2>${ic("bell", 18)}Preisalarm</h2>${adm ? `<button class="ibtn" data-act="tfxopen" data-k="w" aria-label="Preisalarm einstellen">${ic("sliders", 16)}</button>` : ""}</div>
      ${row("below", "down", "#22c55e", `Unter ${this._tfCt(A.below.ct, A.below.ct % 1 ? 1 : 0)} ct`, per(V.below))}
      ${row("neg", "energy", "#3b82f6", "Negativer Preis", per(V.neg))}
      ${row("above", "up", "#ef4444", `Über ${this._tfCt(A.above.ct, A.above.ct % 1 ? 1 : 0)} ct`, per(V.above))}
      ${row("tomorrow", "today", "#2dd4bf", "Preise für morgen da", V.tomorrow ? "heute schon da" : "ab ca. 13 Uhr · mit Kurzfassung")}
      <div class="gst" style="margin-top:6px">${tgt ? `Meldung an ${V.targets.map(esc).join(", ")}` : "Noch kein Meldedienst gewählt"} · je Zeitraum höchstens einmal${A.quiet.on ? ` · Ruhe ${A.quiet.from}–${A.quiet.to} Uhr` : ""}${A.lead ? ` · ${A.lead} Min. vorher` : ""}.</div>
      ${log.length ? `<div class="tflog">${log.map((x) => `<div><small>${new Date(x.t * 1000).toLocaleString("de-DE", { weekday: "short", hour: "2-digit", minute: "2-digit" })}</small><span><b>${esc(x.title)}</b> ${esc(x.msg)}</span></div>`).join("")}</div>` : ""}</div>`;
  }
  _tfModalW(S, step, chip, sw) {
    const C = S.cfg, A = C.alarm, H = this._hass;
    const svc = [...new Set([...Object.keys(((H.services || {}).notify) || {}).filter((n) => !["send_message", "reload", "persistent_notification"].includes(n)).sort().map((n) => "notify." + n), ...A.to])];
    const sw2 = (act, k, on, l) => sw(act, on, l).replace(`data-act="${act}"`, `data-act="${act}" data-k="${k}"`);
    const hc = (act, k, v, cur, t) => `<button class="gsch ${cur === v ? "sel" : ""}" data-act="${act}" data-k="${esc(k)}" data-v="${v == null ? "" : v}">${t}</button>`;
    const devs = (S.devs || []).map((d) => { const T = GS_TYP[d.typ] || {};
      return `<div class="rfv"><div class="vrow" style="margin:0"><span>${ic(T.i || "plug", 16)} <b>${esc(d.name)}</b><small class="mut" style="display:block">${d.n ? `${d.n} ${d.n === 1 ? "Lauf" : "Läufe"} gelernt` : "noch keine Läufe"}${d.dur ? ` · ${this._tfDur(d.dur)}` : ""}</small></span>${sw2("tfxdev", d.id, d.on, "Fenster für " + d.name)}</div>
        ${d.on ? `<div class="mut sm" style="margin:6px 0 4px">Fertig bis</div><div class="gschips">${[null, 7, 12, 16, 18, 20, 22].map((v) => hc("tfxby", d.id, v, d.by ?? null, v == null ? "egal" : v + " Uhr")).join("")}</div>
        <div class="mut sm" style="margin:6px 0 4px">Frühestens ab</div><div class="gschips">${[null, 6, 7, 8, 9].map((v) => hc("tfxfrom", d.id, v, d.from ?? null, v == null ? "jederzeit" : v + " Uhr")).join("")}</div>` : ""}</div>`; }).join("");
    return `<div class="lsec">${ic("clock", 15)}Bestes Fenster je Gerät</div>
      <div class="mut sm" style="margin:0 0 6px">Geräte aus Modul 4. Laufzeit (Median der letzten Läufe), Energie je Lauf und Verbrauchsverlauf werden gelernt. „Fertig bis“ zum Beispiel, wenn die Wäsche abends trocken sein soll; „frühestens ab“ gegen nächtliches Schleudern.</div>
      ${devs || `<div class="mut sm">Noch keine Geräte in Modul 4.</div>`}
      <div class="vrow"><span>Sonne einrechnen<small class="mut" style="display:block">Erwartete Solarerzeugung aus Modul 16 bzw. Modul 4 (vorsichtig: die Hälfte). Eigener Strom zählt mit dem Einspeisepreis aus den Haus-Werten.</small></span>${sw("tfxsun", C.sun, "Sonne einrechnen")}</div>
      <div class="lsec" style="margin-top:12px">${ic("bell", 15)}Preisalarm</div>
      <div class="vrow"><span>Unter einer Grenze</span>${A.below.on ? step("a_below", A.below.ct, "ct", 1, this._tfCt(A.below.ct, 0)) : ""}${sw2("tfxal", "below", A.below.on, "Unter einer Grenze")}</div>
      <div class="vrow"><span>Über einer Grenze</span>${A.above.on ? step("a_above", A.above.ct, "ct", 1, this._tfCt(A.above.ct, 0)) : ""}${sw2("tfxal", "above", A.above.on, "Über einer Grenze")}</div>
      <div class="vrow"><span>Negativer Preis<small class="mut" style="display:block">Gute Zeit für Akku, Auto und große Verbraucher.</small></span>${sw2("tfxal", "neg", A.neg.on, "Negativer Preis")}</div>
      <div class="vrow"><span>Preise für morgen da<small class="mut" style="display:block">Einmal am Tag mit Ø, Spanne und günstigsten Stunden.</small></span>${sw2("tfxal", "tomorrow", A.tomorrow.on, "Preise für morgen")}</div>
      <div class="mut sm" style="margin:8px 0 4px">Melden</div><div class="gschips">${[[0, "zu Beginn"], [15, "15 Min. vorher"], [30, "30 Min. vorher"], [60, "1 Std. vorher"]].map(([v, t]) => chip("tfxlead", String(v), t, A.lead === v)).join("")}</div>
      <div class="vrow"><span>Ruhezeit<small class="mut" style="display:block">Keine Meldungen in dieser Zeit; ein noch laufender Zeitraum wird danach gemeldet.</small></span>${A.quiet.on ? `<span class="tfnn">${step("q_from", A.quiet.from, "Uhr", 1)}${step("q_to", A.quiet.to, "Uhr", 1)}</span>` : ""}${sw("tfxqon", A.quiet.on, "Ruhezeit")}</div>
      <div class="mut sm" style="margin:8px 0 4px">Meldung an</div>
      ${svc.length ? `<div class="gschips">${svc.map((n) => chip("tfxns", n, esc(n), A.to.includes(n))).join("")}</div>` : `<div class="mut sm">Kein Benachrichtigungsdienst (notify.*) gefunden.</div>`}
      <div class="mut sm" style="margin:4px 0 6px">${A.to.length ? "" : "Ohne Auswahl gelten die Meldedienste aus Modul 4. "}Jede Meldung löst auch das Ereignis <code>fenster_heizung_tarif</code> aus.</div>
      <button class="btn2" data-act="tfxtest" style="flex:none">${ic("bell", 15)} Test senden</button>`;
  }
  /* ---------- Einstellungen (Reiter Quelle · Preis & Stufen · Fenster & Alarm) ---------- */
  _tfSave(cfg) {
    if (!(this._tfD && this._tfD.d && this._tfD.d.cfg)) { this._toast("Noch nicht geladen, bitte kurz warten und nochmal versuchen"); return; }
    this._tfD = { d: { ...this._tf(), cfg }, ts: Date.now() };
    clearTimeout(this._tfT);
    this._tfT = setTimeout(() => {
      this._tfT = null;
      this._hass.callWS({ type: "fenster_heizung/tarif_set", cfg: this._tf().cfg }).then((r) => { this._tfD = { d: r || {}, ts: Date.now() }; this._tfRedraw(); this._render(); })
        .catch(() => this._toast("Die Einstellung konnte nicht gespeichert werden"));
    }, 500);
    this._render(); this._renderModal();
  }
  _tfPatch(fn) { const c = JSON.parse(JSON.stringify(this._tf().cfg)); fn(c); this._tfSave(c); }
  _tfAct(a, b) {
    const k = b.dataset.k, s = Number(b.dataset.s), S0 = this._tf();
    if (a === "tfxopen") { if (k) this._tfTab = k; this._tfLoad(true); this._modal = { type: "tfset" }; this._renderModal(); return; }
    if (a === "tfxview") { this._tfView = k; this._render(); return; }
    if (a === "tfxtab") { this._tfTab = k; this._renderModal(); return; }
    if (a === "tfxsrc") { this._tfPatch((c) => { c.src = k; }); return; }
    if (a === "tfxsens") { this._tfPatch((c) => { c.sensor = c.sensor === k ? "" : k; if (k && c.src === "auto") c.src = "sensor"; }); return; }
    if (a === "tfxbo") { this._tfPatch((c) => { c.boerse = k; }); return; }
    if (a === "tfxres") { this._tfPatch((c) => { c.res = k; }); this._tfView = k; return; }
    if (a === "tfxnne") { this._tfPatch((c) => { c.nne.on = !c.nne.on; }); return; }
    if (a === "tfxrem") { const on = !(this._tf().devs || []).find((x) => x.id === k && x.rem); this._hass.callWS({ type: "fenster_heizung/tarif_remind", dev: k, on }).then((r) => { if (r.snap) this._tfD = { d: { ...this._tf(), ...r.snap }, ts: Date.now() }; this._toast(r.ok ? (on ? `Erinnerung um ${this._tfHm(r.ts)} Uhr gestellt` : "Erinnerung gelöscht") : r.msg || "Das hat nicht geklappt"); this._render(); }).catch(() => this._toast("Das hat nicht geklappt")); return; }
    if (a === "tfxal") { this._tfPatch((c) => { c.alarm[k].on = !c.alarm[k].on; }); return; }
    if (a === "tfxns") { this._tfPatch((c) => { const t = c.alarm.to; c.alarm.to = t.includes(k) ? t.filter((x) => x !== k) : [...t, k]; }); return; }
    if (a === "tfxlead") { this._tfPatch((c) => { c.alarm.lead = Number(k); }); return; }
    if (a === "tfxqon") { this._tfPatch((c) => { c.alarm.quiet.on = !c.alarm.quiet.on; }); return; }
    if (a === "tfxsun") { this._tfPatch((c) => { c.sun = !c.sun; }); return; }
    if (a === "tfxdev") { const D = (this._tf().devs || []).find((x) => x.id === k); this._tfPatch((c) => { const o = c.devs[k] || {}; c.devs[k] = { ...o, on: !(D ? D.on : o.on) }; }); return; }
    if (a === "tfxby" || a === "tfxfrom") { const v = b.dataset.v === "" ? null : Number(b.dataset.v), D = (this._tf().devs || []).find((x) => x.id === k); this._tfPatch((c) => { const o = c.devs[k] || { on: D ? D.on : true }; c.devs[k] = { on: o.on !== false, by: o.by ?? null, from: o.from ?? null, [a === "tfxby" ? "by" : "from"]: v }; }); return; }
    if (a === "tfxtest") { this._hass.callWS({ type: "fenster_heizung/tarif_test" }).then((r) => this._toast(r && r.sent ? `Test an ${r.sent} ${r.sent === 1 ? "Dienst" : "Diensten"} gesendet` : "Kein Benachrichtigungsdienst gewählt")).catch(() => this._toast("Test fehlgeschlagen")); return; }
    if (a === "tfxck" || a === "tfxckp") { const C = this._tfCk || {}, per = a === "tfxck" ? k : C.per || "m"; let ref = C.ref || "";
      if (a === "tfxckp") { const st = Number(k); if (per === "y") ref = String(Number(ref.slice(0, 4)) + st); else { const d = new Date(Number(ref.slice(0, 4)), Number(ref.slice(5, 7)) - 1 + st, 1); ref = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; } }
      else ref = per === "y" ? (ref || "").slice(0, 4) : (C.per === "y" ? "" : ref);
      this._tfCkLoad(per, ref); return; }
    if (a === "tfxcmpreset") { this._tfPatch((c) => { c.cmp = { ...(c.cmp || {}), ct: null }; }); this._tfCk = null; return; }
    if (a === "tfxstep") {
      const R = { add: [0, 60, 2], vat: [0, 30, 1], down: [0.5, 20, 1], up: [0.5, 20, 1], win_h: [1, 8, 0], ht_ct: [-30, 30, 2], nt_ct: [-30, 30, 2], ht_from: [0, 23, 0], ht_to: [1, 24, 0], nt_from: [0, 23, 0], nt_to: [1, 24, 0], a_below: [-20, 100, 1], a_above: [0, 150, 1], q_from: [0, 23, 0], q_to: [0, 23, 0], c_ct: [1, 100, 2], c_base: [-50, 50, 2] }[k];
      if (!R) return;
      this._tfPatch((c) => {
        let o = c, f = k;
        if (k.startsWith("ht_") || k.startsWith("nt_")) o = c.nne;
        else if (k.startsWith("a_")) { o = c.alarm[k.slice(2)]; f = "ct"; }
        else if (k.startsWith("q_")) { o = c.alarm.quiet; f = k.slice(2); }
        else if (k.startsWith("c_")) { c.cmp = { ct: null, base: 0, ...(c.cmp || {}) }; o = c.cmp; f = k.slice(2); if (o.ct == null && f === "ct") o.ct = (this._tfCk && this._tfCk.d && this._tfCk.d.cmp_ct) || S0.now.ct || 30; }
        o[f] = Math.round(Math.max(R[0], Math.min(R[1], (Number(o[f]) || 0) + s)) * 10 ** R[2]) / 10 ** R[2];
      });
    }
  }
  /* ================= v0.9 · A7 „Lohnt sich dein Tarif?“ · A3 Woche · A9 Daten prüfen · A10 Hinweis auf der Startseite ================= */
  _tfCkLoad(per, ref) {
    if (!this._hass) return;
    this._tfCk = { ...(this._tfCk || {}), per: per || "m", ref: ref || "", busy: true };
    this._hass.callWS({ type: "fenster_heizung/tarif_check", per: per || "m", ref: ref || "" }).then((r) => { this._tfCk = { per: r.per, ref: r.ref, d: r, ts: Date.now() }; })
      .catch(() => { this._tfCk = { per: per || "m", ref: ref || "", d: { error: true }, ts: Date.now() }; }).finally(() => { this._tfWantR = true; this._tfRedraw(); this._render(); });
  }
  _tfCheckCard(S) {
    const K = this._tfCk;
    if (!K || (!K.d && !K.busy) || (K.d && Date.now() - (K.ts || 0) > 600000 && !K.busy)) { if (!K || !K.busy) this._tfCkLoad(K ? K.per : "m", K ? K.ref : ""); }
    const R = (K && K.d) || null, per = (K && K.per) || "m";
    const head = `<div class="wxtlh"><h2>${ic("chart", 18)}Lohnt sich dein Tarif?</h2><div class="seg wxseg"><button class="${per === "m" ? "sel" : ""}" data-act="tfxck" data-k="m">Monat</button><button class="${per === "y" ? "sel" : ""}" data-act="tfxck" data-k="y">Jahr</button></div></div>`;
    if (!R) return `<div class="card">${head}<div class="mut sm">Wird gerechnet …</div></div>`;
    if (R.error) return `<div class="card">${head}<div class="mut sm">Der Tarif-Check ist gerade nicht verfügbar.</div></div>`;
    const MONL = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    const nav = `<div class="tfckn"><button class="ibtn" data-act="tfxckp" data-k="-1" aria-label="zurück">‹</button><b>${esc(R.title)}</b><button class="ibtn" data-act="tfxckp" data-k="1" aria-label="weiter">›</button></div>`;
    if (!R.n) {
      const why = !R.eb ? "Dafür braucht es das Haus-Energiebuch (Einstellungen → Haus → Energiequellen mit Netz-Sensor)." : !R.first ? "Die Preis-Historie ist noch leer – sie füllt sich ab heute jeden Tag." : `Für diesen Zeitraum gibt es keine Preise oder keinen Verbrauch. Preise sind gespeichert seit ${new Date(R.first).toLocaleDateString("de-DE")}.`;
      return `<div class="card">${head}${nav}<div class="mut sm" style="margin-top:6px">${why}</div></div>`;
    }
    const sv = R.save, tile = (l, v, s, c) => `<div class="tfckt"><span class="mut">${l}</span><b${c ? ` style="color:${c}"` : ""}>${v}</b><small>${s}</small></div>`;
    const tiles = `<div class="tfcks">${tile(`Bezahlt (${esc(S.src_name || "dynamisch")})`, `${num(R.paid, 2)} €`, `Ø ${this._tfCt(R.ct)} ct/kWh · ${num(R.kwh, 0)} kWh`)}
      ${tile("Mit Festpreis wäre", `${num(R.fix, 2)} €`, `${this._tfCt(R.cmp_ct, 2)} ct/kWh${R.cmp_own ? "" : " laut Haus-Werten"}${R.base ? ` · ${R.base > 0 ? "+" : "−"}${num(Math.abs(R.base), 2)} € Grundgebühr` : ""}`)}
      ${tile(sv >= 0 ? "Ersparnis" : "Mehrkosten", `${sv >= 0 ? "+" : "−"}${num(Math.abs(sv), 2)} €`, R.fix > 0 ? `${num(Math.abs(sv) / R.fix * 100, 0)} % ${sv >= 0 ? "günstiger" : "teurer"}` : "", sv >= 0 ? "#22c55e" : "#ef4444")}</div>`;
    const rows = per === "y" ? (R.months || []).map((m) => ({ l: MONL[Number(m.m.slice(5, 7)) - 1].slice(0, 3), ct: m.ct, t: `${MONL[Number(m.m.slice(5, 7)) - 1]}: ${num(m.paid, 2)} € statt ${num(m.fix, 2)} € · Ø ${this._tfCt(m.ct)} ct${m.est ? ` · ${m.est} Tage geschätzt` : ""}`, est: m.est >= m.n, lv: m.save >= 0 ? "cheap" : "dear" }))
      : (R.days || []).map((d) => ({ l: String(Number(d.d.slice(8, 10))), ct: d.ct, t: `${new Date(d.d).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "numeric" })}: ${num(d.kwh, 1)} kWh · Ø ${this._tfCt(d.ct)} ct · ${num(d.paid, 2)} €${d.est ? " · geschätzt" : ""}`, est: d.est, lv: d.lv }));
    const n = per === "y" ? 12 : Math.max(28, rows.length), mx = Math.max(R.cmp_ct, ...rows.map((r) => r.ct || 0)) * 1.12, fy = 100 - (R.cmp_ct / mx) * 100;
    const bars = rows.map((r) => `<div class="tfckb${r.est ? " est" : ""}" title="${esc(r.t)}"><i style="height:${Math.max(2, ((r.ct || 0) / mx) * 100).toFixed(1)}%;background:${this._tfCol(r.lv || "normal")}"></i><small>${r.l}</small></div>`).join("");
    const chart = `<div class="tfckc" style="--n:${n}"><div class="tfckf" style="top:${fy.toFixed(1)}%"><span>Festpreis ${this._tfCt(R.cmp_ct)} ct</span></div>${bars}</div>`;
    const note = [per === "y" ? "Balken: dein Ø Preis je Monat, grün = günstiger als Festpreis." : "Balken: dein Ø Preis je Tag (nach Verbrauch gewichtet), Farbe = Preisstufe.", R.est ? `${R.est} ${R.est === 1 ? "Tag" : "Tage"} aus Tageswerten geschätzt (blass)${R.hours_from ? `, Stundenwerte ab ${new Date(R.hours_from).toLocaleDateString("de-DE")}` : ""}.` : "", "Gerechnet mit deinem Netzbezug aus dem Haus-Energiebuch, ohne Solarstrom und Akku."].filter(Boolean).join(" ");
    return `<div class="card">${head}${nav}${tiles}${chart}<div class="gst" style="margin-top:8px">${esc(note)}${this._admin() ? ` <button class="lnk" data-act="tfxopen" data-k="p">Vergleichspreis ändern</button>` : ""}</div></div>`;
  }
  _tfCmpSet(C, step) {
    const cm = C.cmp || { ct: null, base: 0 }, cur = (this._tfCk && this._tfCk.d && this._tfCk.d.cmp_ct) || null;
    return `<div class="lsec" style="margin-top:12px">${ic("chart", 15)}Tarif-Check: Vergleich mit Festpreis</div>
      <div class="mut sm" style="margin:0 0 6px">„Lohnt sich dein Tarif?“ rechnet deinen Netzbezug einmal mit den dynamischen Preisen und einmal mit diesem Festpreis.</div>
      <div class="vrow"><span>Vergleichs-Festpreis<small class="mut" style="display:block">${cm.ct == null ? "Aus Haus › Preise &amp; Tarif" + (cur ? ` (${this._tfCt(cur, 2)} ct)` : "") + ". Mit +/− eigenen Wert setzen, z. B. das Angebot deines alten Anbieters." : `Eigener Wert · <button class="lnk" data-act="tfxcmpreset">Haus-Werte nehmen</button>`}</small></span>${step("c_ct", cm.ct == null ? cur || 30 : cm.ct, "ct", 0.5, this._tfCt(cm.ct == null ? cur : cm.ct, 2))}</div>
      <div class="vrow"><span>Grundgebühr-Unterschied je Monat<small class="mut" style="display:block">Positiv, wenn der Festpreis-Vertrag eine höhere Grundgebühr hat. Wird anteilig für die Tage mit Daten gerechnet.</small></span>${step("c_base", cm.base || 0, "€", 0.5, num(cm.base || 0, 2))}</div>`;
  }
  _tfWeek(S) {
    const W = S.week || [], C = S.cfg, td = new Date(), today = `${td.getFullYear()}-${String(td.getMonth() + 1).padStart(2, "0")}-${String(td.getDate()).padStart(2, "0")}`;
    const all = W.flatMap((d) => [d.min, d.max]), lo = Math.min(0, ...all), hi = Math.max(...all) * 1.08, Y = (v) => 100 - ((v - lo) / (hi - lo)) * 100;
    const cols = W.map((d) => { const lv = d.neg ? "neg" : this._tfLv(d.avg, W.reduce((a, x) => a + x.avg, 0) / W.length, C) || "normal", dt = new Date(d.d + "T12:00:00");
      return `<div class="tfwk${d.tomorrow ? " tm" : ""}" title="${esc(dt.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" }))}: Ø ${this._tfCt(d.avg)} ct · ${this._tfCt(d.min)} bis ${this._tfCt(d.max)} ct${d.neg ? ` · ${d.neg} × negativ` : ""}">
        <div class="tfwkp"><span class="tfwkr" style="top:${Y(d.max).toFixed(1)}%;bottom:${(100 - Y(d.min)).toFixed(1)}%"></span>${d.neg ? `<span class="tfwkn" style="top:${Y(d.min).toFixed(1)}%"></span>` : ""}<span class="tfwka" style="top:${Y(d.avg).toFixed(1)}%;--c:${this._tfCol(lv)}"></span><em style="top:${Y(d.avg).toFixed(1)}%">${this._tfCt(d.avg, 0)}</em></div>
        <small>${d.tomorrow ? "morgen" : d.d === today ? "heute" : dt.toLocaleDateString("de-DE", { weekday: "short" })}</small></div>`; }).join("");
    return `<div class="tfwkc">${cols}</div><div class="mut sm" style="margin-top:6px">Punkt: Tagesschnitt in Stufenfarbe · Säule: günstigste bis teuerste Zeit · blau: negative Preise. Aus der eigenen Preis-Historie.</div>`;
  }
  _tfDataCheck(S) {
    const L = S.datacheck || [];
    if (!L.length) return "";
    const col = { ok: "#22c55e", warn: "#f59e0b", bad: "#ef4444" }, bad = L.filter((x) => x.st !== "ok").length;
    return `<div class="lsec" style="margin-top:12px">${ic("check", 15)}Daten prüfen<span class="mut sm" style="margin-left:auto;font-weight:500">${bad ? `${bad} ${bad === 1 ? "Hinweis" : "Hinweise"}` : "alles in Ordnung"}</span></div>
      ${L.map((x) => `<div class="wck"><span class="wcki" style="color:${col[x.st] || col.warn}">${ic(x.st === "ok" ? "check" : "info", 16)}</span><span class="wckt"><b>${esc(x.t)}</b><small class="mut">${esc(x.v)}</small></span></div>`).join("")}`;
  }
  /* A10: Hinweis auf der Startseite, sobald negative Preise bekannt sind („Später“ und „Ansehen“ kommen von der Hinweise-Zentrale) */
  _tfHint() {
    this._tfLoad();
    const S = this._tf();
    if (!this._tfD || S.error || !S.neg || S.src === "fix") return null;
    const ser = (S.series || []).filter((x) => x.s + x.d > Date.now() / 1000), i0 = ser.findIndex((x) => x.s === S.neg.s);
    let e = S.neg.s; for (let i = Math.max(0, i0); i < ser.length && ser[i].ct < 0; i++) e = ser[i].s + ser[i].d;
    const tm = this._tfIsTomorrow(S.neg.s), now = S.neg.s * 1000 <= Date.now();
    return { k: `tf:neg:${S.neg.s}`, i: "energy", hd: "pvRoof", mod: "dt", src: "Modul 14", c: "in", r: tm ? "morgen" : now ? "jetzt" : "heute",
      t: `${now ? "Jetzt" : tm ? "Morgen" : "Heute"} ${now ? "bis " + this._tfHm(e) : this._tfHm(S.neg.s) + "–" + this._tfHm(e)} negative Strompreise`, s: `bis ${this._tfCt(S.neg.min)} ct/kWh · gut für Auto, Akku und große Verbraucher` };
  }
  _tfModal() {
    const S = this._tf(), C = S.cfg, tab = ["p", "w"].includes(this._tfTab) ? this._tfTab : "q";
    const step = (k, val, unit, d, fmt) => `<div class="step" style="flex:none"><button data-act="tfxstep" data-k="${k}" data-s="-${d}" aria-label="weniger">${ic("minus", 18)}</button><b>${fmt != null ? fmt : val} ${unit}</b><button data-act="tfxstep" data-k="${k}" data-s="${d}" aria-label="mehr">${ic("plus", 18)}</button></div>`;
    const chip = (act, k, t, on) => `<button class="gsch ${on ? "sel" : ""}" data-act="${act}" data-k="${esc(k)}" aria-pressed="${!!on}">${t}</button>`;
    const sw = (act, on, label) => `<button class="sw ${on ? "on" : ""}" data-act="${act}" aria-pressed="${!!on}" aria-label="${label}"></button>`;
    const found = S.found || [], sens = found.filter((f) => f.id !== "tibber"), tib = found.find((f) => f.id === "tibber");
    const body = tab === "w" ? this._tfModalW(S, step, chip, sw) : tab === "q" ? `<div class="lsec">${ic("chart", 15)}Preisquelle</div>
      <div class="mut sm" style="margin:0 0 6px">Fällt die gewählte Quelle aus, springt die nächste ein: Tibber → Preis-Sensor → Festpreis aus den Haus-Werten. Gerade aktiv: <b>${esc(S.src_name || "–")}</b>.</div>
      <div class="gschips">${[["auto", "Automatisch"], ["tibber", "Tibber direkt"], ["sensor", "Preis-Sensor"], ["fix", "Festpreis"]].map(([k, t]) => chip("tfxsrc", k, t, C.src === k)).join("")}</div>
      <div class="vrow"><span>Tibber direkt<small class="mut" style="display:block">${tib ? `Verbunden · ${esc(tib.res)}` : "Nicht verbunden. Einrichten unter Einstellungen → Integrationen → Tibber."}</small></span>${tib ? `<span class="tfok">${ic("check", 16)}</span>` : ""}</div>
      <div class="lsec" style="margin-top:12px">${ic("sliders", 15)}Preis-Sensoren mit Zeitreihe</div>
      ${sens.length ? `<div class="gschips">${sens.map((f) => chip("tfxsens", f.id, `${esc(f.name)} <small>· ${esc(f.res)}</small>`, C.sensor === f.id)).join("")}</div><div class="mut sm" style="margin:4px 0 6px">${C.sensor ? `Gewählt: ${esc(C.sensor)}` : "Ohne Auswahl gilt der Preis-Sensor aus den Haus-Werten oder aus Modul 1."}</div>`
        : `<div class="mut sm">Kein Sensor mit Preisliste gefunden (Attribute wie <code>raw_today</code>, <code>prices_today</code>, <code>data</code>, <code>rates</code>).</div>`}
      <div class="lsec" style="margin-top:12px">${ic("clock", 15)}Anzeige</div>
      <div class="vrow"><span>Auflösung im Band<small class="mut" style="display:block">Gespeichert wird immer die feinste Auflösung der Quelle.</small></span><div class="gschips" style="flex:none">${chip("tfxres", "q", "15 Min.", C.res === "q")}${chip("tfxres", "h", "Stunden", C.res === "h")}</div></div>
      <div class="vrow"><span>Länge „Bestes Fenster“</span>${step("win_h", C.win_h, "Std.", 1)}</div>
      ${this._tfDataCheck(S)}`
      : `<div class="lsec">${ic("bolt", 15)}Stufen</div>
      <div class="mut sm" style="margin:0 0 6px">Gemessen am Schnitt des jeweiligen Tages. So wirkt ein ruhiger Tag nicht plötzlich „teuer“.</div>
      <div class="vrow"><span>Günstig ab<small class="mut" style="display:block">so viel unter dem Tagesschnitt</small></span>${step("down", C.down, "ct", 0.5, this._tfCt(C.down))}</div>
      <div class="vrow"><span>Teuer ab<small class="mut" style="display:block">so viel über dem Tagesschnitt · unter 0 ct gilt immer „negativ“</small></span>${step("up", C.up, "ct", 0.5, this._tfCt(C.up))}</div>
      <div class="lsec" style="margin-top:12px">${ic("chart", 15)}Endpreis für Börsenpreise</div>
      <div class="mut sm" style="margin:0 0 6px">Nord Pool, EPEX Spot und aWATTar liefern nur den Börsenpreis. Für den echten Preis kommen Netzentgelt, Umlagen, Abgaben, Aufschlag und MwSt. dazu. Tibber liefert schon den Endpreis.</div>
      <div class="gschips">${[["auto", "Automatisch erkennen"], ["on", "Immer rechnen"], ["off", "Nie rechnen"]].map(([k, t]) => chip("tfxbo", k, t, C.boerse === k)).join("")}</div>
      <div class="vrow"><span>Aufschläge netto<small class="mut" style="display:block">Netzentgelt, Umlagen, Stromsteuer, Konzessionsabgabe, Aufschlag des Anbieters</small></span>${step("add", C.add, "ct", 0.1, this._tfCt(C.add, 2))}</div>
      <div class="vrow"><span>Mehrwertsteuer</span>${step("vat", C.vat, "%", 1, num(C.vat, 0))}</div>
      <div class="mut sm">Beispiel: 10 ct Börse → ${this._tfCt((10 + C.add) * (1 + C.vat / 100))} ct/kWh.</div>
      <div class="lsec" style="margin-top:12px">${ic("clock", 15)}Zeitvariables Netzentgelt (§ 14a, Modul 3)</div>
      <div class="vrow"><span>Hoch- und Niedertarif-Zeiten<small class="mut" style="display:block">Nur wenn dein Netzbetreiber das anbietet und du es gewählt hast.</small></span>${sw("tfxnne", C.nne.on, "Zeitvariables Netzentgelt")}</div>
      ${C.nne.on ? `<div class="vrow"><span>Hochtarif</span><span class="tfnn">${step("ht_from", C.nne.ht_from, "Uhr", 1)}${step("ht_to", C.nne.ht_to, "Uhr", 1)}${step("ht_ct", C.nne.ht_ct, "ct", 0.1, this._tfCt(C.nne.ht_ct, 2))}</span></div>
        <div class="vrow"><span>Niedertarif</span><span class="tfnn">${step("nt_from", C.nne.nt_from, "Uhr", 1)}${step("nt_to", C.nne.nt_to, "Uhr", 1)}${step("nt_ct", C.nne.nt_ct, "ct", 0.1, this._tfCt(C.nne.nt_ct, 2))}</span></div>` : ""}
      ${this._tfCmpSet(C, step)}`;
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Stromtarif</b><span>Einstellungen · gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="seg wxtabs">${[["q", "Quelle"], ["p", "Preis &amp; Stufen"], ["w", "Fenster &amp; Alarm"]].map(([k, t]) => `<button class="${tab === k ? "sel" : ""}" data-act="tfxtab" data-k="${k}">${t}</button>`).join("")}</div>
      ${this._tfD ? body : `<div class="mut">Lade …</div>`}
      <div class="mut sm" style="margin-top:12px">Sensoren für eigene Automationen: Gerät „Strom &amp; Wärme · Stromtarif“ (Preis jetzt, Stufe, nächste günstige Zeit, günstigstes Fenster, Ø heute und morgen) und das Ereignis <code>fenster_heizung_tarif</code>.</div></div>`;
  }
