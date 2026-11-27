  /* ================= Tablet-Modus · Stufe 4: Modul 8 E-Auto ohne Scrollen =================
     Reiter Laden (Carport, Überschuss, Modus, Schnellstart), Planung (Plan für 24 Stunden und vier Werte) und Statistik.
     Laden und Schnellstart gehen wie bisher ohne PIN. Fahrzeuge, Wallbox und Ladungen öffnen nach der PIN die ganze Seite. */
  _tm2Shows(id) { return !!(this._tmOn && this._tmOn() && this._tm2On() && !this._tmSleep && this._tmV() === id); }
  /* Ganze Modulseite (mit Scrollen) wieder schließen, sobald man das Modul verlässt – danach gilt wieder die PIN */
  _tm2FullOff() { if (this._tm2On()) { this._evWallFull = false; this._tm2AbExit(); } }
  _tm2EvLine(d, N) {
    if (!N.wbOn) return d.charging ? `Lädt${d.power != null ? ` mit ${num(d.power / 1000, 1)} kW` : ""}` : d.plugged ? "Angesteckt" : d.range != null ? `Reichweite ${num(d.range, 0)} km` : "Nicht angesteckt";
    if (!N.sn.ok) return this._wbD ? "Wallbox nicht erreichbar" : "Wird geladen";
    if (d.charging) return `Lädt${N.sun != null ? (N.sun >= 50 ? " mit Sonne" : " mit Netzstrom") : ""}${d.power != null ? ` · ${num(d.power / 1000, 1)} kW` : ""}${N.doneT ? ` · fertig ca. ${N.doneT}` : ""}`;
    if (d.plugged) return N.soc != null && N.soc >= N.goal ? "Angesteckt · Ziel erreicht" : `Angesteckt · ${!N.c.enabled ? "Regelung aus" : N.w.state === "wartet" ? "wartet auf Sonne" : N.w.state === "plan_wartet" ? "wartet auf das Ladefenster" : "lädt gerade nicht"}`;
    const away = this._evAway(d.veh);
    return away && !away.home ? `Unterwegs mit ${away.name}${away.zone ? ` · ${away.zone}` : ""}` : "Nicht angesteckt";
  }
  _tm2Ev() {
    const d = this._evData();
    if (!d.any) return this._tm2None("car", "Noch kein Fahrzeug eingerichtet.", "Fahrzeug und Wallbox richtest du in der normalen Ansicht ein.");
    if (!this._wbOn()) return this._tm2EvPlain(d);
    this._wbLoad();
    const t = this._tm2Tab("ev");
    return t === "plan" ? this._tm2EvPlan(d) : t === "stat" ? this._tm2EvStat() : this._tm2EvCharge(d);
  }
  /* Carport mit Ladestand unten links. Die Zeichnung entsteht erst, wenn die Größe ihres Platzes feststeht (_tm2Charts) */
  _tm2EvScene(d, N, over = "") {
    const soc = N.soc != null ? `${d.est ? "≈ " : ""}${num(N.soc, 0)} %` : "";
    const name = d.veh ? d.veh.name : this._evTitle(d.veh);
    const sub = !N.wbOn || d.charging ? this._tm2EvLine(d, N) : [d.plugged ? "Angesteckt" : this._tm2EvLine(d, N), N.c.enabled ? `Modus ${N.modeN}` : "Regelung aus"].join(" · ");
    return `<div class="tm2evsc${N.night ? " nt" : ""}"><div class="tm2ch tm2evpic" data-tm2ch="evsc"></div>
      <div class="tm2evbadge"><b>${soc || esc(name)}</b><small>${esc(sub)}</small>${soc ? `<small class="d">${esc(name)}${d.range != null ? ` · ${num(d.range, 0)} km` : ""}</small>` : ""}</div>${over}</div>`;
  }
  _tm2EvDraw(box, w, h) {
    const d = this._evData(), N = this._evNow(d);
    let W = Math.round(290 * w / h), H = 290, s = 0.94;
    if (W < 760) { W = 760; H = Math.round(760 * h / w); s = 1; }
    if (H === 290) s = Math.min(s, (W - 150) / 710);   /* Wandkasten bleibt rechts neben dem Ladestand, das Auto ganz im Bild */
    const sx = H > 290 ? 25 : Math.min(Math.round(W - 710 * s - 5), Math.max(250, Math.round((W - 710 * s) / 2)));
    box.innerHTML = this._evCarport(d, N, W, H, { sfx: "t2", sx, s }).replace('class="evsc"', 'class="evsc tm2evsvg"');
  }
  _tm2EvWarn(d, N) {
    const sn = N.sn, H = this._wbHints ? this._wbHints() : [];
    if (!sn.ok) return this._wbD ? "Wallbox nicht erreichbar. Prüfe Strom und WLAN der Wallbox." : "";
    if (sn.dimmed) return `§ 14a: Der Netzbetreiber dimmt gerade auf ${num((N.c.dim || {}).kw || 4.2, 1)} kW.`;
    if (sn.stale) return "Der Netz-Sensor meldet seit Minuten keinen neuen Wert.";
    return H.length ? String(H[0][0]).replace(/<[^>]*>/g, "") : "";
  }
  _tm2EvSur(d, N) {
    const sn = N.sn, w = sn.want || {}, e = sn.eff || sn.cfg || {}, adm = this._admin(), c = N.c;
    if (!c.enabled) return `<div class="card tm2sur"><div class="tm2sh"><span>${ic("sun", 18)}PV-Überschuss</span>${adm ? `<button class="tm2mini" data-act="tm2g" data-g="wbsw" data-k="wbon">${ic("lock", 16)}Laderegelung einschalten</button>` : ""}</div><small class="mut">Die Laderegelung ist aus. Die Wallbox lädt nach ihren eigenen Einstellungen.</small></div>`;
    if (w.surplus_w == null) return `<div class="card tm2sur"><div class="tm2sh"><span>${ic("sun", 18)}PV-Überschuss</span></div><small class="mut">Kein Wert. Dafür braucht es den Netz-Sensor (Modul 3).</small></div>`;
    const minA = e.minA || 6, maxA = e.maxA || 16, ph = String(e.ph || "auto"), V = 230, startW = e.startW || 1400;
    const start = ph !== "3" ? Math.max(startW, minA * V) : Math.max(startW, minA * V * 3), full = maxA * V * (ph !== "1" ? 3 : 1);
    const sp = Math.max(0, w.surplus_w), ch = d.charging && d.power != null ? Math.max(0, d.power) : 0, grid = Math.max(0, ch - sp);
    const top = Math.min(full, Math.max(start * 2, sp * 1.15, ch * 1.1)), pc = (x) => Math.max(0, Math.min(100, x / top * 100)), kw = (x) => num(x / 1000, x % 1000 === 0 ? 1 : 2);
    const t = w.timer, mm = (s) => (s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} Min.` : `${s} s`);
    const txt = t && t.left > 0 ? (t.k === "start" ? `startet in ca. ${mm(t.left)}` : `stoppt in ca. ${mm(t.left)}`)
      : ch > 0 ? `lädt mit ${kw(ch)} kW${grid > 50 ? ` · davon ${kw(grid)} kW aus dem Netz` : ""}` : sp < start ? `es fehlen ${kw(start - sp)} kW` : "reicht für den Start";
    return `<div class="card tm2sur"><div class="tm2sh"><span>${ic("sun", 18)}PV-Überschuss</span><em>jetzt ${kw(sp)} kW – ${txt}</em></div>
      <div class="tm2surb" role="img" aria-label="Überschuss ${kw(sp)} kW, Start ab ${kw(start)} kW"><i class="s" style="width:${pc(Math.min(sp, top))}%"></i>${grid > 50 ? `<i class="g" style="left:${pc(sp)}%;width:${Math.max(0, pc(ch) - pc(sp))}%"></i>` : ""}<span style="left:${pc(start)}%"></span></div>
      <div class="tm2surx"><span>0</span><span style="left:${pc(start)}%" class="m">Start ab ${kw(start)} kW</span><span>${kw(top)} kW</span></div></div>`;
  }
  _tm2EvCharge(d) {
    const N = this._evNow(d), c = N.c, sn = N.sn, adm = this._admin(), q = sn.quick && sn.quick.k;
    const M = [["off", "Aus", "plug"], ["pv", "Sonne", "sun"], ["minpv", "Sonne + Netz", "grid"], ["now", "Voll", "bolt"]];
    const Q = [["h1", "1 Stunde voll", "bolt"], ["goal", "Bis zum Ziel", "battery"], ["sun", "Heute nur Sonne", "sun"]];
    const can = adm && c.enabled && !c.planOn, vs = c.vehicles || [], warn = this._tm2EvWarn(d, N), price = this._evPriceChip();
    const who = vs.length > 1 || sn.who_set ? `<button class="tm2mini" data-act="tm2x" data-k="ev" data-id="who">${ic("car", 16)}${esc(sn.who_set === "guest" ? "Gastfahrzeug" : sn.who && sn.who.kind === "guest" ? "Gast lädt" : d.veh ? d.veh.name : "Wer lädt?")}</button>` : "";
    const over = `${warn ? `<div class="tm2evw">${ic("alert", 18)}<span>${esc(warn)}</span></div>` : ""}<div class="tm2evtr">${price}${who}${adm ? `<button class="tm2mini" data-act="tm2g" data-g="tm2evfull" data-k="set" aria-label="Fahrzeuge und Wallbox">${ic("lock", 16)}Fahrzeuge &amp; Wallbox</button>` : ""}</div>`;
    const modes = `<div class="tm2evm">${M.map(([k, t, g]) => `<button class="${N.mode === k ? "sel" : ""}" data-act="wbmode" data-k="${k}" aria-pressed="${N.mode === k}" ${can ? "" : "disabled"}>${this._gx(g, 40, { on: N.mode === k ? 1 : 0 })}<b>${t}</b></button>`).join("")}</div>`;
    const min = sn.quick && sn.quick.until ? Math.max(1, Math.ceil((sn.quick.until * 1000 - Date.now()) / 6e4)) : 0;
    const quick = q ? `<div class="tm2evq on">${this._gx("bolt", 30, { on: 1 })}<span><b>Schnellstart läuft: ${esc((Q.find((x) => x[0] === q) || ["", ""])[1])}</b><small>${q === "h1" ? `noch ${min} Minuten` : q === "goal" ? "bis zum Ladelimit oder zum Abstecken" : "bis Mitternacht, nur mit Überschuss"}</small></span><button class="stop" data-act="wbxq" data-k="" ${adm ? "" : "disabled"}>Stopp</button></div>`
      : `<div class="tm2evq">${Q.map(([k, t, g]) => `<button data-act="wbxq" data-k="${k}" ${adm && c.enabled ? "" : "disabled"}>${this._gx(g, 28)}<b>${t}</b></button>`).join("")}</div>`;
    const why = c.planOn ? "Die Planung steuert gerade die Wallbox" : "";
    return `${this._tm2EvScene(d, N, over)}${this._tm2EvSur(d, N)}
      <div class="tm2lbl">Wie soll geladen werden?${why ? `<em>${why}</em>` : ""}</div>${modes}
      <div class="tm2lbl">Schnellstart</div>${quick}`;
  }
  /* Ohne Wallbox: Carport und vier Werte des Fahrzeugs */
  _tm2EvPlain(d) {
    const N = this._evNow(d);
    const tiles = [
      this._tm2Tile4("Ladestand", N.soc != null ? num(N.soc, 0) : "–", N.soc != null ? "%" : "", N.soc != null ? (d.est ? "geschätzt" : "laut Fahrzeug") : "kein Sensor", "#34d399"),
      this._tm2Tile4("Reichweite", d.range != null ? num(d.range, 0) : "–", d.range != null ? "km" : "", d.range != null ? "laut Fahrzeug" : "kein Sensor", "#60a5fa"),
      this._tm2Tile4("Kilometerstand", d.odo != null ? num(d.odo, 0) : "–", d.odo != null ? "km" : "", d.odo != null ? "gesamt" : "kein Sensor", "#a78bfa"),
      this._tm2Tile4("Ladeleistung", d.power != null ? num(d.power / 1000, 1) : "–", d.power != null ? "kW" : "", esc(this._tm2EvLine(d, N)), "#fbbf24")].join("");
    return `${this._tm2EvScene(d, N)}<div class="tm2sums">${tiles}</div>`;
  }
  /* ---------- Planung ---------- */
  _tm2EvHours() {
    const F = (this._wbFcD && this._wbFcD.data) || {}, H = F.hours || [], PL = F.plan || {}, SL = (F.slot_min || 60) / 60, sel = PL.sel || {};
    const h0 = new Date(); h0.setMinutes(0, 0, 0);
    const bins = Array.from({ length: 24 }, (_, i) => ({ t: new Date(h0.getTime() + i * 36e5), sun: 0, net: 0 }));
    H.forEach((x, i) => {
      const e = Number(sel[i]) || 0; if (!e) return;
      const k = Math.floor((new Date(x.t).getTime() - h0.getTime()) / 36e5); if (k < 0 || k > 23) return;
      const kw = e / SL, share = kw > 0 ? Math.max(0, Math.min(1, (x.pv || 0) / kw)) : 0;
      bins[k].sun += e * share; bins[k].net += e * (1 - share);
    });
    return bins;
  }
  _tm2EvPlanChart(box, w, h) {
    const bins = this._tm2EvHours(), PL = ((this._wbFcD && this._wbFcD.data) || {}).plan || {};
    const mx = Math.max(1, ...bins.map((b) => b.sun + b.net)) * 1.15, step = enStep(mx), top = Math.ceil(mx / step) * step;
    const x0 = 40, x1 = w - 6, y0 = 22, y1 = h - 22, bw = (x1 - x0) / 24, bar = Math.max(4, Math.min(30, bw * 0.66)), Y = (v) => y1 - v / top * (y1 - y0);
    let g = `<text x="${x0 - 8}" y="12" class="tm2ax" text-anchor="end">kWh</text>`;
    for (let v = 0; v <= top + 1e-9; v += step) g += `<line x1="${x0}" x2="${x1}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="tm2gl"/><text x="${x0 - 8}" y="${(Y(v) + 4).toFixed(1)}" class="tm2ax" text-anchor="end">${num(v, step < 1 ? 1 : 0)}</text>`;
    const every = bw < 24 ? 6 : 3;
    const bars = bins.map((b, i) => {
      const x = x0 + i * bw + (bw - bar) / 2, tot = b.sun + b.net, hr = b.t.getHours();
      const r = (from, to, col) => (to - from > 0.01 ? `<rect x="${x.toFixed(1)}" y="${Y(to).toFixed(1)}" width="${bar.toFixed(1)}" height="${Math.max(2, Y(from) - Y(to)).toFixed(1)}" rx="4" fill="${col}"><title>${hr} Uhr · ${num(tot, 1)} kWh</title></rect>` : "");
      return r(0, b.sun, "#fbbf24") + r(b.sun, tot, "#2dd4bf") + (hr % every === 0 ? `<text x="${(x0 + i * bw + bw / 2).toFixed(1)}" y="${h - 5}" class="tm2ax" text-anchor="middle">${String(hr).padStart(2, "0")}</text>` : "");
    }).join("");
    const dl = PL.deadline ? new Date(PL.deadline) : null, k = dl ? (dl.getTime() - bins[0].t.getTime()) / 36e5 : -1, dx = k > 0 && k < 24 ? x0 + k * bw : null;
    const dep = dx != null ? `<line x1="${dx.toFixed(1)}" x2="${dx.toFixed(1)}" y1="${y0 - 6}" y2="${y1}" class="tm2dl"/><text x="${(dx + (dx > w - 120 ? -6 : 6)).toFixed(1)}" y="${y0 + 6}" class="tm2ax b" text-anchor="${dx > w - 120 ? "end" : "start"}">Abfahrt ${dl.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</text>` : "";
    box.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Geplante Ladung je Stunde, Sonne und günstiges Netz">${g}${bars}${dep}</svg>`;
  }
  _tm2EvPlan(d) {
    this._wbFcLoad();
    const F = this._wbFcD && this._wbFcD.data, c = this._wb(), adm = this._admin();
    if (!F) return this._tm2None("clock", "Vorhersage wird geladen …");
    const PL = F.plan || { ok: false }, H = F.hours || [];
    if (F.error || !H.length) return this._tm2None("sun", "Keine Vorhersage verfügbar.", "Für den Plan braucht es Stundenpreise und eine PV-Prognose.");
    const edit = adm ? `<button class="tm2mini" data-act="tm2g" data-g="tm2evfull" data-k="plan">${ic("lock", 16)}Planung ändern</button>` : "";
    const strat = { mix: "Sonne zuerst, dann günstig", sun: "nur Sonne", price: "günstigste Stunden" }[PL.strat || c.planStrat || "mix"] || "";
    if (!PL.ok) return `<div class="card tm2cc tm2evpl"><div class="tm2sh"><span>${ic("plan", 18)}Ladeplan</span>${edit}</div><div class="tm2none">${ic("car", 40)}<div>${PL.why === "soc" ? `Für einen Plan fehlt der Ladestand${PL.veh ? ` von ${esc(PL.veh)}` : ""}.` : "Der Plan wird berechnet …"}</div></div></div>`;
    const sh = PL.plan.kwh > 0 ? PL.plan.pv / PL.plan.kwh * 100 : 0, none = PL.need <= 0.05;
    const note = PL.day_ok === false ? "An diesem Tag gilt keine Abfahrt" : c.planOn ? "Planung steuert die Wallbox" : PL.cal ? "Planung steuert für den Termin" : "Plan wird nur angezeigt";
    const tiles = [
      this._tm2Tile4("Bis zum Ziel", num(PL.plan.kwh, 1), "kWh", none ? "Ziel schon erreicht" : PL.left > 0.05 ? `${num(PL.left, 1)} kWh fehlen im Plan` : `von ${num(PL.soc, 0)} auf ${PL.target} %`, "#34d399"),
      this._tm2Tile4("Abfahrt", esc(PL.until || c.planTime || "–"), "", PL.cal ? "aus dem Kalender" : PL.own ? `${esc(PL.veh)}` : "eingestellt", "#60a5fa"),
      this._tm2Tile4("Davon Sonne", num(PL.plan.pv, 1), "kWh", `${num(sh, 0)} %`, "#fbbf24"),
      this._tm2Tile4("Kosten", `ca. ${num(PL.plan.cost, 2)} €`, "", strat, "#f87171")].join("");
    return `<div class="card tm2cc tm2evpl"><div class="tm2sh"><span>${ic("plan", 18)}Plan für die nächsten 24 Stunden</span><span class="tm2shr"><span class="tm2legend"><i style="background:#fbbf24"></i>Sonne <i style="background:#2dd4bf"></i>günstiges Netz</span>${edit}</span></div>
      <small class="tm2note">${esc(note)}${PL.veh ? ` · ${esc(PL.veh)}` : ""}</small><div class="tm2ch" data-tm2ch="evplan"></div></div><div class="tm2sums">${tiles}</div>`;
  }
  /* ---------- Statistik ---------- */
  _tm2EvSlots(D, S, R) {
    const days = D.days || [], MON = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"], out = [];
    if (S.per === "y") for (let m = 0; m < 12; m++) { const a = new Date(R.d0.getFullYear(), m, 1), x = this._evAgg(days, a, new Date(R.d0.getFullYear(), m + 1, 1)); out.push({ l: MON[m], pv: x.pv, grid: x.grid, go: a, per: "m" }); }
    else if (S.per === "d") (D.sessions || []).filter((x) => { const t = new Date(x.start); return t >= R.d0 && t < R.d1; }).reverse().forEach((x) => out.push({ l: new Date(x.start).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }), pv: x.pv, grid: x.kwh - x.pv }));
    else for (let t = new Date(R.d0); t < R.d1; t = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1)) { const x = this._evAgg(days, t, new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1)); out.push({ l: S.per === "w" ? ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][t.getDay()] : String(t.getDate()), pv: x.pv, grid: x.grid, go: new Date(t), per: "d" }); }
    return out;
  }
  _tm2EvStatChart(box, w, h) {
    const D = (this._wbStD && this._wbStD.data) || {}, S = this._evSt(), R = this._evRange(S.per, S.at), slots = this._tm2EvSlots(D, S, R);
    if (!slots.some((s) => s.pv + s.grid > 0.05)) { box.innerHTML = `<div class="tm2none">${ic("car", 40)}<div>In diesem Zeitraum wurde nicht geladen.</div></div>`; return; }
    const mx = Math.max(1, ...slots.map((s) => s.pv + s.grid)) * 1.1, step = enStep(mx), top = Math.ceil(mx / step) * step;
    const x0 = 40, x1 = w - 6, y0 = 18, y1 = h - 22, bw = (x1 - x0) / slots.length, bar = Math.max(4, Math.min(46, bw * 0.66)), Y = (v) => y1 - v / top * (y1 - y0);
    let g = `<text x="${x0 - 8}" y="11" class="tm2ax" text-anchor="end">kWh</text>`;
    for (let v = 0; v <= top + 1e-9; v += step) g += `<line x1="${x0}" x2="${x1}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="tm2gl"/><text x="${x0 - 8}" y="${(Y(v) + 4).toFixed(1)}" class="tm2ax" text-anchor="end">${num(v, step < 1 ? 1 : 0)}</text>`;
    const every = Math.max(1, Math.ceil(26 / bw));
    const bars = slots.map((s, i) => {
      const x = x0 + i * bw + (bw - bar) / 2, tot = s.pv + s.grid;
      const r = (from, to, col) => (to - from > 0.01 ? `<rect x="${x.toFixed(1)}" y="${Y(to).toFixed(1)}" width="${bar.toFixed(1)}" height="${Math.max(2, Y(from) - Y(to)).toFixed(1)}" rx="4" fill="${col}"/>` : "");
      return `<g ${s.go ? `data-act="wbvgo" data-k="${s.go.getTime()}" data-p="${s.per}" style="cursor:pointer"` : ""}><title>${esc(s.l)}: ${num(tot, 1)} kWh</title><rect x="${(x0 + i * bw).toFixed(1)}" y="${y0}" width="${bw.toFixed(1)}" height="${y1 - y0}" fill="transparent"/>${r(0, s.pv, "#2dd4bf")}${r(s.pv, tot, "#f59e0b")}${i % every === 0 ? `<text x="${(x + bar / 2).toFixed(1)}" y="${h - 5}" class="tm2ax" text-anchor="middle">${esc(s.l)}</text>` : ""}</g>`;
    }).join("");
    box.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Geladene Energie, Sonne und Netz">${g}${bars}</svg>`;
  }
  _tm2EvStat() {
    this._wbStatLoad();
    const D = this._wbStD && this._wbStD.data, adm = this._admin();
    if (!D || D.error) return this._tm2None("chart", D ? "Die Statistik konnte gerade nicht geladen werden." : "Statistik wird geladen …");
    const S = this._evSt(), R = this._evRange(S.per, S.at), days = D.days || [], T = this._evAgg(days, R.d0, R.d1), run = R.d1 > new Date();
    const MONL = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"], fd = (t) => t.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
    const title = S.per === "d" ? R.d0.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "long" }) : S.per === "w" ? `${fd(R.d0)} – ${fd(new Date(R.d1 - 864e5))}` : S.per === "m" ? `${MONL[R.d0.getMonth()]} ${R.d0.getFullYear()}` : String(R.d0.getFullYear());
    const ses = (D.sessions || []).filter((x) => { const t = new Date(x.start); return t >= R.d0 && t < R.d1; });
    const sh = T.kwh > 0 ? T.pv / T.kwh * 100 : 0, d100 = T.km > 0 ? T.cost / T.km * 100 : null;
    const tiles = [
      this._tm2Tile4("Geladen", num(T.kwh, 1), "kWh", `${ses.length} ${ses.length === 1 ? "Ladung" : "Ladungen"} · ${num(sh, 0)} % Sonne`, "#2dd4bf"),
      this._tm2Tile4("Kosten", `${num(T.cost, 2)} €`, "", "nur Netzstrom", "#f87171"),
      this._tm2Tile4("Kilometer", T.km > 0 ? num(T.km, 0) : "–", T.km > 0 ? "km" : "", d100 != null ? `${num(d100, 2)} € je 100 km` : "braucht den Kilometerstand", "#60a5fa"),
      this._tm2Tile4("Gespart", `${num(Math.max(0, T.full - T.cost), 2)} €`, "", "gegenüber nur Netzstrom", "#34d399")].join("");
    const seg = [["d", "Tag"], ["w", "Woche"], ["m", "Monat"], ["y", "Jahr"]].map(([k, l]) => `<button class="${S.per === k ? "sel" : ""}" data-act="wbvper" data-k="${k}" aria-pressed="${S.per === k}">${l}</button>`).join("");
    const per = this._tm2Land() ? (window.innerHeight < 700 ? 3 : window.innerHeight < 760 ? 5 : 8) : window.innerHeight < 1100 ? 2 : 4, p = this._tm2Page("evses", ses.length, per);
    const rows = ses.slice(p.from, p.to).map((x) => { const t = new Date(x.start), s2 = x.kwh > 0 ? x.pv / x.kwh * 100 : 0;
      return `<div class="tm2ses"><span><b>${t.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}</b><small>${t.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}${x.running ? " · läuft" : ""}</small></span><span class="n"><b>${esc(x.veh || "Unbekannt")}</b><small>${num(s2, 0)} % Sonne</small></span><span class="v"><b>${num(x.kwh, 1)} kWh</b><small>${x.cost != null ? `${num(x.cost, 2)} €` : "&nbsp;"}</small></span></div>`; }).join("");
    return `<div class="tm2bar"><div class="tm2seg">${seg}</div><div class="tm2per"><button data-act="wbvnav" data-k="-1" aria-label="Zurück">${ic("back", 20)}</button><b>${esc(title)}</b><button class="nx" data-act="wbvnav" data-k="1" aria-label="Weiter" ${run ? "disabled" : ""}>${ic("back", 20)}</button></div></div>
      <div class="tm2sums">${tiles}</div>
      <div class="tm2stat"><div class="card tm2cc"><div class="tm2sh"><span>${ic("chart", 18)}${S.per === "d" ? "Ladungen an diesem Tag" : S.per === "y" ? "Geladen je Monat" : "Geladen je Tag"}</span><span class="tm2legend"><i style="background:#2dd4bf"></i>Sonne <i style="background:#f59e0b"></i>Netz</span></div><div class="tm2ch" data-tm2ch="evst"></div></div>
        <div class="card tm2cc tm2sesc" data-sw="evses"><div class="tm2sh"><span>${ic("list", 18)}Ladungen</span>${adm ? `<button class="tm2mini" data-act="tm2g" data-g="tm2evfull" data-k="stat">${ic("lock", 16)}Bearbeiten</button>` : ""}</div>
          ${rows ? `<div class="tm2sesl">${rows}</div>${this._tm2Pager("evses", p, "")}` : `<div class="mut tm2nox">Keine Ladungen in diesem Zeitraum.</div>`}</div></div>`;
  }
  /* „Wer lädt gerade?“ als Fenster */
  _tm2EvModal() {
    const d = this._evData(), N = this._evNow(d), row = this._evWhoRow(N);
    return `<div class="ov" data-act="close"></div><div class="sheet tm2rm" role="dialog" aria-modal="true"><div class="sh"><div><b>Wer lädt gerade?</b><small>${esc(this._wbName())}</small></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>${row || `<div class="mut">Kein Fahrzeug eingerichtet.</div>`}</div>`;
  }
