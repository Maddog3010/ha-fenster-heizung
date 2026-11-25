  /* ================= Tablet-Modus · Stufe 3: Modul 3 Energie-Übersicht ohne Scrollen =================
     Reiter Jetzt (Fluss, vier Tageswerte, Autarkie), Verlauf (ein Diagramm, vier Vergleichswerte) und Kosten
     (Treppe und „Wohin der Strom ging“). Hinweise, Gas und Sparschwein öffnen als Fenster. */
  _tm2None(icon, title, sub = "") { return `<div class="card empty tm2none">${ic(icon, 44)}<div>${title}</div>${sub ? `<small>${sub}</small>` : ""}</div>`; }
  /* „Jetzt“ und Ruhebild zeigen immer heute. Der Zeitraum von „Verlauf“ und „Kosten“ bleibt dabei gemerkt. */
  _tm2EnRange(today) {
    const E = this._enState();
    if (today) { if (!this._tm2EnKeep) this._tm2EnKeep = { range: E.range, off: E.off || 0 }; E.range = "day"; E.off = 0; }
    else if (this._tm2EnKeep) { Object.assign(E, this._tm2EnKeep); this._tm2EnKeep = null; }
  }
  _tm2Kwh(v) { return v == null ? "–" : num(v, v >= 100 ? 0 : v >= 10 ? 1 : 2); }
  _tm2Tile4(label, value, unit, sub, color) { return `<div class="tm2sum" style="--a:${color}"><span>${label}</span><b>${value}${unit ? ` <small>${unit}</small>` : ""}</b><em>${sub || "&nbsp;"}</em></div>`; }
  _tm2Ring(pct, color = "#2dd4bf") {
    const r = 42, C = 2 * Math.PI * r, p = Math.max(0, Math.min(100, pct || 0));
    return `<svg class="tm2ring" viewBox="0 0 100 100" role="img" aria-label="${pct == null ? "unbekannt" : `${Math.round(p)} Prozent`}"><circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--line)" stroke-width="10"/>${p > 0 ? `<circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${(p / 100 * C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 50 50)"/>` : ""}<text x="50" y="57" text-anchor="middle" font-size="22" font-weight="800" fill="currentColor">${pct == null ? "–" : `${Math.round(p)} %`}</text></svg>`;
  }
  /* Summen des gewählten Zeitraums und was sie in Euro bedeuten */
  _tm2EnVals() {
    const sum = this._enSum(), ok = !!(sum && !sum.empty), price = this._price(), feed = this._feed();
    const self = ok ? Math.max(0, sum.pv - sum.exp) : null, aut = ok && sum.house > 0 ? Math.round(Math.min(100, Math.max(0, (1 - sum.imp / sum.house) * 100))) : null;
    const evq = ok && sum.pv > 0 ? Math.round(Math.min(100, self / sum.pv * 100)) : null;
    const buy = ok ? sum.imp * price / 100 : 0, sell = ok ? sum.exp * feed / 100 : 0, saved = ok ? self * price / 100 : 0;
    return { sum, ok, price, feed, self, aut, evq, buy, sell, saved, net: sell + saved - buy };
  }
  /* Verbrauch von heute, den Modul 1, 2 und 8 kennen */
  _tm2EnUse() {
    const rooms = this._htrRooms(), heat = rooms.reduce((a, r) => a + (Number(r.htr.heute_kwh) || 0), 0), heatPv = rooms.reduce((a, r) => a + (Number(r.htr.heute_pv_kwh) || 0), 0);
    const ws = this._mdState().ww, ww = ws.ent.rod ? (this._wwMinutesOn(ws.ent.rod) || 0) / 60 * ws.pv.watt / 1000 : 0;
    const cd = this._m3Car() ? this._m3CarDay() || { kwh: 0 } : null;
    return { heat, heatPv, ww, car: cd ? cd.kwh : null };
  }
  _tm2En() {
    if (!this._enConfigured()) return this._tm2None("energy", "Die Energie-Übersicht ist noch nicht eingerichtet.", "Die Sensoren wählst du in der normalen Ansicht.");
    const tab = this._tm2Tab("en");
    this._tm2EnRange(tab === "now");
    this._enLoad(); if (this._enState().ent.pv && this._mdState().ww.ent.rod) this._wwLoad();
    this._enTipBind();
    if (this._enTipX != null) Promise.resolve().then(() => this._enTipShow());
    if (tab === "now") { const n = this._enNow(); return n ? this._tm2EnNow(n) : this._tm2None("alert", "Keine Messwerte", "Solar- oder Netz-Sensor liefern gerade keinen Wert."); }
    return `${this._tm2EnBar()}${tab === "hist" ? this._tm2EnHist() : this._tm2EnCost()}`;
  }
  _tm2EnNow(n) {
    const V = this._tm2EnVals(), F = this._m3FlowOn() ? this._m3Flow(n) : null, big = this._m3Has("ef") ? `<button class="tm2mini" data-act="mdgo" data-k="ef">${ic("energy", 16)}Hausfluss</button>` : "";
    const gas = this._gasOn() ? `<button class="tm2mini" data-act="tm2x" data-k="en" data-s="gas">${ic("flame", 16)}Gas</button>` : "";
    const s = V.sum || {}, kw = (x) => this._tm2Kwh(V.ok ? x : null);
    const tiles = [
      this._tm2Tile4("Solar heute", kw(s.pv), "kWh", V.evq != null ? `${V.evq} % selbst genutzt` : "", "#fbbf24"),
      this._tm2Tile4("Netzbezug", kw(s.imp), "kWh", V.ok ? `${num(V.buy, 2)} € Kosten` : "", "#f87171"),
      this._tm2Tile4("Einspeisung", kw(s.exp), "kWh", V.ok ? `${num(V.sell, 2)} € Vergütung` : "", "#34d399"),
      this._tm2Tile4("Verbrauch", kw(s.house), "kWh", V.ok ? "heute im Haus" : "wird geladen", "#2dd4bf")].join("");
    return `<div class="tm2enn"><div class="card tm2cc tm2flc"><div class="tm2sh"><span>${ic("sun", 18)}Energiefluss jetzt</span><span class="tm2shr">${gas}<button class="tm2mini" data-act="tm2x" data-k="en" data-s="tips">${ic("info", 16)}Hinweise</button>${big}</span></div>
      <div class="tm2flow">${F ? `${F.svg}${F.det}` : this._enFlow(n)}</div></div>
      <div class="tm2ens"><div class="tm2sums two">${tiles}</div><div class="card tm2aut">${this._tm2Ring(V.aut)}<div><b>Autarkie heute</b><small>${V.ok && s.house > 0 ? `${this._tm2Kwh(Math.max(0, s.house - s.imp))} von ${this._tm2Kwh(s.house)} kWh ohne Netzbezug` : "wird berechnet"}</small>${V.ok ? `<em>+${num(V.saved, 2)} € gespart durch Solar</em>` : ""}</div></div></div></div>`;
  }
  _tm2EnBar() {
    const E = this._enState(), P = this._enPer();
    return `<div class="tm2bar"><div class="tm2seg" role="group" aria-label="Zeitraum">${[["day", "Tag"], ["week", "Woche"], ["month", "Monat"], ["year", "Jahr"]].map(([k, l]) => `<button class="${E.range === k ? "sel" : ""}" data-act="enrange" data-k="${k}" aria-pressed="${E.range === k}">${l}</button>`).join("")}</div>
      <div class="tm2per"><button data-act="enoff" data-k="-1" aria-label="Zurück">${ic("back", 20)}</button><b>${esc(this._enLabel(P, true))}</b><button class="nx" data-act="enoff" data-k="1" aria-label="Weiter" ${P.cur ? "disabled" : ""}>${ic("back", 20)}</button></div></div>`;
  }
  _tm2EnHist() {
    const V = this._tm2EnVals(), prev = this._enPrevSum(), cl = this._enCmpLbl(), on = this._enState().cmp !== "off" && !!prev && V.ok, s = V.sum || {};
    const cmp = (cur, old) => { if (!on || old == null || old < 0.05) return ""; const d = Math.round((cur - old) / old * 100); return isFinite(d) ? `${d > 0 ? "▲" : d < 0 ? "▼" : "="} ${Math.abs(d)} % ${cl}` : ""; };
    const pa = on && prev.house > 0 ? Math.round(Math.min(100, Math.max(0, (1 - prev.imp / prev.house) * 100))) : null;
    const kw = (x) => this._tm2Kwh(V.ok ? x : null);
    const tiles = [
      this._tm2Tile4("Solar", kw(s.pv), "kWh", V.ok && prev ? cmp(s.pv, prev.pv) : "", "#fbbf24"),
      this._tm2Tile4("Netzbezug", kw(s.imp), "kWh", V.ok && prev ? cmp(s.imp, prev.imp) : "", "#f87171"),
      this._tm2Tile4("Verbrauch", kw(s.house), "kWh", V.ok && prev ? cmp(s.house, prev.house) : "", "#2dd4bf"),
      this._tm2Tile4("Autarkie", V.aut == null ? "–" : V.aut, "%", pa != null && V.aut != null ? `${V.aut >= pa ? "▲" : "▼"} ${Math.abs(V.aut - pa)} Punkte ${cl}` : "", "#a78bfa")].join("");
    const E = this._enState(), title = E.range === "day" ? "Leistung (kW)" : E.range === "year" ? (this._m3On() && this._m3CalOn ? "Solar-Kalender" : "Energie pro Monat (kWh)") : "Energie pro Tag (kWh)";
    return `<div class="tm2stat tm2enh"><div class="card tm2cc"><div class="tm2sh"><span>${ic("chart", 18)}${title}</span></div><div class="tm2ch" data-tm2ch="en"></div></div><div class="tm2side4">${tiles}</div></div>`;
  }
  /* Diagramm aus der normalen Ansicht, in der Größe seines Platzes. Antippen zeigt die Werte, geblättert wird oben. */
  _tm2EnChart(box, w, h) {
    const k = w < 600 ? 1 : 1.15, note = this._enState().range === "day" ? "" : this._enNote();
    let used = 36;
    for (let i = 0; i < 4; i++) {
      this._enDim = { w: Math.round(w / k), h: Math.max(130, Math.round((h - used) / k)) };
      box.innerHTML = `${this._enChart().replace(/ data-act="enpick" data-k="\d+"/g, "").replace(/<div class="mut sm"[^>]*>Ein Tipp[^<]*<\/div>/, "")}${/gst on/.test(note) ? note : ""}`;
      const over = box.scrollHeight - h; if (over <= 0) break; used += over + 2;
    }
    this._enDim = null;
  }
  _tm2EnCost() {
    const V = this._tm2EnVals(), P = this._enPer(), today = this._enState().range === "day" && P.cur;
    if (!V.ok) return `<div class="card empty tm2none">${ic("total", 44)}<div>${V.sum ? "Für diesen Zeitraum gibt es keine Daten." : "Werte werden geladen …"}</div></div>`;
    const rm = this._collect(), dayK = rm.reduce((a, r) => a + (r.sc.day?.kwh || 0), 0), monK = rm.reduce((a, r) => a + (r.sc.month?.kwh || 0), 0);
    const water = this._m3On() ? this._m3Water(V.buy, V.sell, V.saved, V.net) : this._enWater(V.buy, V.sell, V.saved, V.net);
    const row = (g, label, value, sub, color) => `<div class="tm2use" style="--a:${color}">${g ? this._gx(g, 34, { on: true, lvl: 70 }) : ""}<span><b>${label}</b><small>${sub}</small></span><strong>${value}</strong></div>`;
    let right;
    if (today) {
      const U = this._tm2EnUse(), rest = Math.max(0, V.sum.house - U.heat - U.ww - (U.car || 0)), tot = Math.max(0.01, U.heat + U.ww + (U.car || 0) + rest);
      const it = [["radiator", "Heizung (Raumheizer)", U.heat, "#f97316", U.heat > 0 ? `${Math.round(U.heatPv / U.heat * 100)} % Solar · ` : ""], ["boiler", "Warmwasser (Heizstab)", U.ww, "#38bdf8", "geschätzt · "], ...(U.car != null ? [["car", "Auto (Modul 8)", U.car, "#22d3ee", ""]] : []), ["house", "Haushalt und Rest", rest, "#2dd4bf", ""]];
      right = `<div class="tm2sh"><span>${ic("layers", 18)}Wohin der Strom heute ging</span></div><div class="tm2dist">${it.map(([, , v, c]) => (v > 0 ? `<i style="width:${(v / tot * 100).toFixed(1)}%;background:${c}"></i>` : "")).join("")}</div>
        <div class="tm2uses">${it.map(([g, l, v, c, x]) => row(g, l, `${num(v, 1)} kWh`, `${x}${Math.round(v / tot * 100)} % vom Verbrauch`, c)).join("")}</div>`;
    } else {
      right = `<div class="tm2sh"><span>${ic("layers", 18)}Im Zeitraum</span></div><div class="tm2uses">${[
        row("house", "Verbrauch", `${this._tm2Kwh(V.sum.house)} kWh`, `ohne Solar ${num(V.sum.house * V.price / 100, 2)} €`, "#2dd4bf"),
        row("pvRoof", "Vorteil durch Solar", `${num(V.sell + V.saved, 2)} €`, V.evq != null ? `${V.evq} % selbst genutzt` : "", "#fbbf24"),
        row("grid", "Autarkie", V.aut == null ? "–" : `${V.aut} %`, `${this._tm2Kwh(V.sum.imp)} kWh aus dem Netz`, "#a78bfa")].join("")}</div>
        <small class="tm2note">Die Aufteilung auf Heizung und Warmwasser gibt es nur für heute.</small>`;
    }
    const pig = this._m3On() ? `<button class="tm2mini" data-act="tm2x" data-k="en" data-s="pig">${ic("total", 16)}Sparschwein</button>` : "";
    return `<div class="tm2cost"><div class="card tm2cc"><div class="tm2sh"><span>${ic("total", 18)}Kosten und Vorteil</span>${pig}</div><div class="tm2water">${water}</div>
      <small class="tm2note">${num(V.price, 1)} ct/kWh Bezug · ${num(V.feed, 1)} ct/kWh Einspeisung${rm.length ? ` · Wärme gespart: ${num(dayK, 1)} kWh heute, ${num(monK, 1)} kWh im Monat` : ""}</small></div><div class="card tm2cc">${right}</div></div>`;
  }
  /* Fenster: Hinweise, Gas, Sparschwein */
  _tm2EnModal(m) {
    const T = { tips: "Hinweise", gas: "Gas", pig: "Sparschwein" }[m.s] || "Energie"; let body = "";
    if (m.s === "gas") body = this._gasCard();
    else if (m.s === "pig") body = this._m3Pig();
    else { const n = this._enNow(), ws = this._mdState().ww; body = n ? this._m3Tips(n, { heat: this._htrTotal(), ww: this._wwIsOn(ws.ent.rod) ? ws.pv.watt : 0, car: this._m3Car() }) : `<div class="mut">Gerade fehlen Messwerte.</div>`; }
    return `<div class="ov" data-act="close"></div><div class="sheet wide tm2rm" role="dialog" aria-modal="true"><div class="sh"><div><b>${T}</b><span>Energie-Übersicht</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>${body}</div>`;
  }
