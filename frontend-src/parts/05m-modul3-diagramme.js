  /* ================= Modul 3 · Neue Optik Stufe 4 (Konzept „Modul 3 – Neue Optik“): Diagramme & Kosten =================
     D1: Preisband unter der Tageskurve (Stundenpreise aus dem Preissensor, relativ zum Tagesdurchschnitt), Preis im Tooltip.
         Die gestrichelte Prognose aus Modul 16 gibt es schon seit v1.1.
     D2: Woche, Monat, Jahr gespiegelt: oben Solar (selbst genutzt + eingespeist), unten Netzbezug.
     D3: Jahr zusätzlich als Solar-Kalender (kWh pro Tag, bester Tag mit ★), ein Abruf der Langzeitstatistik je Jahr, gemerkt bis Mitternacht.
     E1: Kosten-Treppe mit Symbolen, Bilanz eingerahmt. E2: Sparschwein – Vorteil seit Beginn der Aufzeichnung bzw. Inbetriebnahme,
         mit freiwilligen Anschaffungskosten (layout.m3.cost, layout.m3.since = "JJJJ-MM").
     G1: „Wohin der Strom geht“ als Ring mit HD-Symbolen, Auto aus Modul 8, „Haushalt und Rest“ aufklappbar mit den Geräten aus Modul 4.
     Bewegung: Werte zählen beim Zeitraumwechsel kurz hoch (nur mit Animationen Dezent/Voll, nie bei „Bewegung reduzieren“). */
  /* ---- D1: Preisband ---- */
  /* Preisband als Teil der Tageskurve: Zeile direkt unter dem Kurvenbereich (y0), darunter die Uhrzeiten */
  _m3Band(L, iw, y0) {
    const P = this._m3Prices(); if (!P) return null;
    const n = P.v.length, lo = Math.min(...P.v), hi = Math.max(...P.v), cw = iw / n;
    const col = (v) => { const r = v <= P.avg ? -Math.min(1, (P.avg - v) / Math.max(.1, P.avg - lo)) : Math.min(1, (v - P.avg) / Math.max(.1, hi - P.avg)); return r < -.45 ? "#4ade80" : r < -.1 ? "#a3e635" : r < .15 ? "#facc15" : r < .5 ? "#fb923c" : "#f87171"; };
    const now = new Date(), ci = Math.floor((now.getHours() * 60 + now.getMinutes()) / P.step), cur = P.v[Math.min(n - 1, ci)], q = this._m3PriceAt(now.getHours() * 60 + now.getMinutes());
    const g = `<g class="m3band" aria-label="Strompreis heute">${P.v.map((v, i) => `<rect x="${(L + i * cw + .7).toFixed(1)}" y="${y0 + 5}" width="${Math.max(1, cw - 1.4).toFixed(1)}" height="14" rx="3" fill="${col(v)}" opacity="${i < ci ? .5 : 1}"><title>${String(Math.floor(i * P.step / 60)).padStart(2, "0")}:${String(Math.round(i * P.step % 60)).padStart(2, "0")} Uhr · ${num(v, 1)} ct</title></rect>`).join("")}${ci < n ? `<rect x="${(L + ci * cw - .5).toFixed(1)}" y="${y0 + 3}" width="${(cw + 1).toFixed(1)}" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/>` : ""}<text x="${L - 6}" y="${y0 + 16}" text-anchor="end" font-size="10" fill="currentColor" opacity=".6">ct</text></g>`;
    const l = `<div class="m3bandl"><span>Strom jetzt <b style="color:${q ? q.rel[1] : "inherit"}">${num(cur, 1)} ct${q ? " · " + q.rel[0] : ""}</b> · Schnitt heute ${num(P.avg, 1)} ct · billigste Stunde ${num(lo, 1)} ct</span><span class="m3bsc">günstig<i></i>teuer</span></div>`;
    return { g, l };
  }
  _m3PriceAt(min) { const P = this._m3Prices(); if (!P) return null; const v = P.v[Math.min(P.v.length - 1, Math.floor(min / P.step))]; return v == null ? null : { v, rel: v <= P.avg * .93 ? ["günstig", "#4ade80"] : v >= P.avg * 1.07 ? ["teuer", "#f87171"] : ["mittel", "#facc15"] }; }
  /* ---- D2: Balken gespiegelt ---- */
  _m3Bars(v, G) {
    const E = this._enState(), yr = E.range === "year", { Wd, Ht, L, R, T, ih } = G, hl = E.hl, op = (f) => (!hl || hl === f ? 1 : .25);
    const up = Math.max(.5, ...v.map((d) => d.pv)), dn = Math.max(0, ...v.map((d) => d.imp)), stp = enStep(up + dn), tU = Math.ceil(up / stp) * stp, tD = dn > 0 ? Math.ceil(dn / stp) * stp : 0;
    const Y = (x) => T + ((tU - x) / (tU + tD)) * ih, gw = (Wd - L - R) / v.length, bw = Math.max(3, Math.min(24, gw * .66));
    let s = ""; for (let x = -tD, c = 0; x <= tU && c < 14; x += stp, c++) s += `<line x1="${L}" x2="${Wd - R}" y1="${Y(x).toFixed(1)}" y2="${Y(x).toFixed(1)}" stroke="currentColor" opacity="${x === 0 ? .4 : .12}"/><text x="${L - 6}" y="${(Y(x) + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="currentColor" opacity=".6">${num(Math.abs(x), x % 1 ? 1 : 0)}</text>`;
    const rr = (x, y, w, h, c, o, top) => (h < .5 ? "" : `<path d="${top ? `M${x} ${y + h}V${y + Math.min(3, h)}q0 -3 3 -3h${w - 6}q3 0 3 3V${y + h}z` : `M${x} ${y}V${y + h - Math.min(3, h)}q0 3 3 3h${w - 6}q3 0 3 -3V${y}z`}" fill="${c}" opacity="${o}"/>`);
    v.forEach((d, i) => {
      const x = +(L + i * gw + (gw - bw) / 2).toFixed(1);
      if (d.fut) s += `<rect x="${x}" y="${(Y(0) - 1.5).toFixed(1)}" width="${bw.toFixed(1)}" height="3" rx="1.5" fill="currentColor" opacity=".15"/>`;
      else {
        const self = Math.max(0, d.pv - d.exp), y1 = Y(self), y2 = Y(self + d.exp);
        s += `<rect x="${x}" y="${y1.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0, Y(0) - y1).toFixed(1)}" fill="#fbbf24" opacity="${op("pv")}"/>` + rr(x, +y2.toFixed(1), +bw.toFixed(1), +(y1 - y2).toFixed(1), "#34d399", op("exp"), true);
        s += rr(x, +Y(0).toFixed(1), +bw.toFixed(1), +(Y(-d.imp) - Y(0)).toFixed(1), "#f87171", op("imp"), false);
        if (d.star) s += `<text x="${(x + bw / 2).toFixed(1)}" y="${(y2 - 4).toFixed(1)}" text-anchor="middle" font-size="11" fill="#fde047">★</text>`;
        s += `<rect class="enhit" x="${(L + i * gw).toFixed(1)}" y="${T}" width="${gw.toFixed(1)}" height="${ih}" fill="transparent" data-act="enpick" data-k="${i}"/>`;
      }
      const lab = yr ? d.d.toLocaleDateString("de-DE", { month: "short" }).replace(".", "") : E.range === "week" ? d.d.toLocaleDateString("de-DE", { weekday: "short" }).replace(".", "") : String(d.d.getDate());
      if (yr || E.range === "week" || i % 5 === 0 || i === v.length - 1) s += `<text x="${(L + i * gw + gw / 2).toFixed(1)}" y="${Ht - 8}" text-anchor="middle" font-size="11" fill="currentColor" opacity=".6">${lab}</text>`;
    });
    this._enTipD = { k: "bar", Wd, L, iw: Wd - L - R, gw, v };
    return `${yr ? this._m3CalSeg() : ""}<div class="enchw"><svg class="wwchart enchart" viewBox="0 0 ${Wd} ${Ht}" role="img" aria-label="Solar oben, Netzbezug unten"><text x="${L - 6}" y="${T - 10}" text-anchor="end" font-size="10" fill="currentColor" opacity=".6">kWh</text><text x="${Wd - R}" y="${T - 10}" text-anchor="end" font-size="11" font-weight="700" fill="#fbbf24">Solar ↑</text>${tD ? `<text x="${Wd - R}" y="${Ht - 22}" text-anchor="end" font-size="11" font-weight="700" fill="#f87171">Netzbezug ↓</text>` : ""}${s}<rect class="encur" x="0" y="${T}" width="0" height="${ih}" rx="4" fill="none" stroke="currentColor" opacity="0"/></svg><div class="entt" hidden></div></div>
      <div class="legend"><span><i style="background:#fbbf24"></i>Solar selbst genutzt</span><span><i style="background:#34d399"></i>eingespeist</span><span><i style="background:#f87171"></i>Netzbezug (nach unten)</span></div><div class="mut sm" style="margin:4px 0 0">Ein Tipp auf einen Balken öffnet ${yr ? "den Monat" : "den Tag"}.</div>`;
  }
  /* ---- D3: Solar-Kalender ---- */
  _m3CalSeg() { const c = !!this._m3CalOn; return `<div class="seg wwseg m3cseg" role="group" aria-label="Jahresansicht"><button class="${c ? "" : "sel"}" data-act="m3cal" data-k="0" aria-pressed="${!c}">Monate</button><button class="${c ? "sel" : ""}" data-act="m3cal" data-k="1" aria-pressed="${c}">Kalender</button></div>`; }
  _m3CalLoad(y) {
    const td = new Date().toDateString(), C = this._m3CalD;
    if (C && C.y === y && (C.day === td || y < new Date().getFullYear())) return C;
    if (this._m3CalBusy === y) return null; this._m3CalBusy = y;
    const src = this._enSrc(), list = [src.pv, src.pv2].filter(Boolean), s = new Date(y, 0, 1), e = new Date(Math.min(Date.now(), +new Date(y + 1, 0, 1)));
    const q = (t, ty) => { const ids = list.filter((x) => x.t === t).map((x) => x.id); return ids.length ? this._hass.callWS({ type: "recorder/statistics_during_period", start_time: s.toISOString(), end_time: e.toISOString(), statistic_ids: ids, period: "day", types: [ty] }) : Promise.resolve({}); };
    Promise.all([q("e", "change"), q("p", "mean")]).then(([re, rp]) => {
      const days = {};
      list.forEach((x) => (((x.t === "e" ? re : rp) || {})[x.id] || []).forEach((r) => {
        const d = new Date(typeof r.start === "number" ? r.start : Date.parse(r.start)), k = `${d.getMonth()}-${d.getDate()}`;
        const v = x.t === "e" ? r.change * x.k : r.mean * x.k * 24 / 1000; if (isFinite(v)) days[k] = (days[k] || 0) + Math.max(0, v);
      }));
      this._m3CalD = { y, day: td, days };
    }).catch(() => { this._m3CalD = { y, day: td, days: {}, err: true }; }).finally(() => { this._m3CalBusy = null; if (this._mdActive() === "en") this._render(); });
    return null;
  }
  _m3Cal() {
    const P = this._enPer(), y = P.s.getFullYear(), C = this._m3CalLoad(y), seg = this._m3CalSeg();
    if (!C) return `${seg}<div class="mut sm" style="padding:30px 0;text-align:center">Kalender wird geladen …</div>`;
    const vals = Object.values(C.days); if (!vals.length) return `${seg}<div class="mut sm" style="padding:30px 0;text-align:center">${C.err ? "Die Tageswerte konnten nicht geladen werden." : "Für dieses Jahr gibt es keine Tageswerte."}</div>`;
    const mx = Math.max(...vals), best = Object.entries(C.days).sort((a, b) => b[1] - a[1])[0], MN = "JFMAMJJASOND", today = new Date();
    const c = (v) => { const f = Math.min(1, v / mx); return `color-mix(in srgb,#fbbf24 ${Math.round(12 + f * 88)}%,#3a3320)`; };
    let g = "";
    for (let m = 0; m < 12; m++) {
      g += `<b>${MN[m]}</b>`;
      const dim = new Date(y, m + 1, 0).getDate();
      for (let d = 1; d <= 31; d++) {
        const k = `${m}-${d}`, v = C.days[k], fut = new Date(y, m, d) > today;
        if (d > dim) { g += `<i class="nx"></i>`; continue; }
        g += v == null || fut ? `<i class="em"></i>` : `<i style="background:${c(v)}" title="${d}.${m + 1}.: ${num(v, 1)} kWh" data-act="m3day" data-k="${y}-${m + 1}-${d}" role="button">${best[0] === k ? "★" : ""}</i>`;
      }
    }
    const [bm, bd] = best[0].split("-").map(Number), bdt = new Date(y, bm, bd).toLocaleDateString("de-DE", { day: "numeric", month: "long" });
    return `${seg}<div class="m3cal">${g}</div><div class="m3call"><span>wenig</span><i></i><span>viel · bester Tag ${bdt}: ${num(best[1], 1)} kWh ★</span></div><div class="mut sm" style="margin:4px 0 0">Ein Tipp auf einen Tag öffnet ihn. Summe ${num(vals.reduce((a, x) => a + x, 0), 0)} kWh Solar.</div>`;
  }
  /* ---- E1: Kosten-Treppe mit Symbolen ---- */
  _m3Water(buy, sell, saved, net) {
    const W = 460, H = 214, base = 104, mx = Math.max(.01, buy, sell + saved, Math.abs(net)), k = 74 / mx, bw = 76, eur = (v) => `${v >= 0 ? "+" : "−"}${num(Math.abs(v), 2)} €`;
    const it = [["Netzbezug", -buy, "#f87171", 0, "grid", 0], ["Einspeisung", sell, "#34d399", 0, "grid", 1], ["Selbst genutzt", saved, "#fbbf24", sell, "pvRoof", 0], ["Bilanz", net, "#2dd4bf", 0, "euro", 0]];
    let s = `<line x1="8" y1="${base}" x2="${W - 8}" y2="${base}" stroke="currentColor" opacity=".3" stroke-dasharray="4 4"/>`;
    it.forEach(([l, v, c, from, g, ex], i) => {
      const x = 16 + i * 112, y0 = base - from * k, h = Math.max(3, Math.abs(v) * k), y = v >= 0 ? y0 - h : y0, last = i === 3;
      s += last ? `<rect x="${x}" y="${(v >= 0 ? base - h : base).toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" rx="9" fill="${c}" fill-opacity="${v < 0 ? .12 : .16}" stroke="${v < 0 ? "#f87171" : c}" stroke-width="2.4"/><text x="${x + bw / 2}" y="${(v >= 0 ? base - h / 2 + 5 : base + h / 2 + 5).toFixed(1)}" text-anchor="middle" font-size="${h > 24 ? 15 : 12}" font-weight="800" fill="${v < 0 ? "#f87171" : c}">${h > 24 ? eur(v) : ""}</text>${h > 24 ? "" : `<text x="${x + bw / 2}" y="${(v >= 0 ? base - h - 6 : base + h + 15).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="800" fill="${c}">${eur(v)}</text>`}`
        : `<rect x="${x}" y="${y.toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" rx="7" fill="${c}"/><text x="${x + bw / 2}" y="${(v >= 0 ? y - 6 : y + h + 15).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="700" fill="${c}">${eur(v)}</text>`;
      s += this._gx(g, 26, {}).replace("<svg ", `<svg x="${x + 6}" y="${H - 32}" `) + (ex || g === "grid" ? `<circle cx="${x + 30}" cy="${H - 10}" r="5.5" fill="${ex ? "#34d399" : "#f87171"}"/><text x="${x + 30}" y="${H - 7.5}" text-anchor="middle" font-size="8" font-weight="800" fill="#fff">${ex ? "↑" : "↓"}</text>` : "") + `<text x="${x + 36}" y="${H - 15}" font-size="11.5" fill="currentColor" opacity=".75">${l}</text>`;
    });
    return `<svg class="enwf m3wf" viewBox="0 0 ${W} ${H}" role="img" aria-label="Kosten und Vorteil">${s}</svg>`;
  }
  /* ---- E2: Sparschwein ---- */
  _m3PigLoad() {
    const C = this._m3PigD, td = new Date().toDateString(), m = this._cfg.layout.m3 || {}, key = td + "|" + (m.since || "");
    if (C && C.key === key) return C; if (this._m3PigBusy) return null; this._m3PigBusy = true;
    const src = this._enSrc(), need = ["pv", "exp"].every((k) => src[k] && src[k].t === "e" && !src[k].sg);
    if (!need) { this._m3PigBusy = false; return (this._m3PigD = { key, need: true }); }
    const list = ["pv", "pv2", "exp"].map((k) => src[k] && src[k].t === "e" && !src[k].sg ? { f: k === "pv2" ? "pv" : k, ...src[k] } : null).filter(Boolean);
    const s0 = m.since && /^\d{4}-\d{2}$/.test(m.since) ? new Date(+m.since.slice(0, 4), +m.since.slice(5, 7) - 1, 1) : new Date(2010, 0, 1);
    this._hass.callWS({ type: "recorder/statistics_during_period", start_time: s0.toISOString(), end_time: new Date().toISOString(), statistic_ids: [...new Set(list.map((x) => x.id))], period: "month", types: ["change"] }).then((r) => {
      const t = { pv: 0, exp: 0 }; let first = null;
      list.forEach((x) => ((r || {})[x.id] || []).forEach((y) => { const v = y.change * x.k; if (!isFinite(v) || v <= 0) return; t[x.f] += v; const d = typeof y.start === "number" ? y.start : Date.parse(y.start); if (x.f === "pv" && (first == null || d < first)) first = d; }));
      this._m3PigD = { key, pv: t.pv, exp: t.exp, first };
    }).catch(() => { this._m3PigD = { key, err: true }; }).finally(() => { this._m3PigBusy = false; if (this._mdActive() === "en") this._render(); });
    return null;
  }
  _m3Pig() {
    const D = this._m3PigLoad(), m = this._cfg.layout.m3 || {}, cost = Number(m.cost) || 0, h = `<h2>${ic("total", 18)}Sparschwein · Vorteil durch Solar</h2>`;
    const pig = `<svg class="m3pig" viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="59" rx="20" ry="3" fill="#000" opacity=".2"/><ellipse cx="30" cy="38" rx="21" ry="16" fill="#f9a8d4"/><ellipse cx="26" cy="32" rx="12" ry="7" fill="#fff" opacity=".35"/><circle cx="50" cy="38" r="7" fill="#f472b6"/><circle cx="48.5" cy="37" r="1.3" fill="#831843"/><circle cx="52" cy="37" r="1.3" fill="#831843"/><circle cx="42" cy="31" r="1.8" fill="#1f2937"/><path d="M36 24 l4 -6 l3 7z" fill="#f472b6"/><rect x="16" y="50" width="6" height="7" rx="2" fill="#f472b6"/><rect x="34" y="50" width="6" height="7" rx="2" fill="#f472b6"/><path d="M9 36 q-5 -2 -3 -6" fill="none" stroke="#f472b6" stroke-width="2.2" stroke-linecap="round"/><rect x="24" y="21" width="10" height="2.4" rx="1.2" fill="#831843"/><circle cx="29" cy="12" r="7" fill="#fbbf24" stroke="#b45309" stroke-width="1.2"/><text x="29" y="15" text-anchor="middle" font-size="8" font-weight="800" fill="#92400e">€</text></svg>`;
    if (!D) return `<div class="card">${h}<div class="mut sm" style="padding:18px 0">Wird berechnet …</div></div>`;
    if (D.need) return `<div class="card">${h}<div class="m3pg">${pig}<div><b>Braucht Energiezähler</b><span class="mut sm">Für den Vorteil seit Beginn braucht es Zähler in kWh für Solar und Einspeisung (Haus → Energiequellen). Mit reinen Leistungssensoren geht es nicht über Jahre.</span></div></div></div>`;
    if (D.err) return `<div class="card">${h}<div class="mut sm">Die Langzeitstatistik konnte nicht geladen werden.</div></div>`;
    const price = this._price(), feed = this._feed(), adv = Math.max(0, D.pv - D.exp) * price / 100 + D.exp * feed / 100, pct = cost > 0 ? Math.min(100, adv / cost * 100) : null;
    const since = D.first ? new Date(D.first).toLocaleDateString("de-DE", { month: "long", year: "numeric" }) : "";
    return `<div class="card">${h}<div class="m3pg">${pig}<div><div class="m3pgv">${num(adv, 0)} €</div><span class="mut">Vorteil durch Solar ${m.since ? "seit Inbetriebnahme" : "seit Beginn der Aufzeichnung"}${since ? ` (${since})` : ""}</span></div></div>
      ${pct != null ? `<div class="m3pgb"><i style="width:${pct.toFixed(1)}%"></i></div><div class="m3pgl"><span>${num(pct, 0)} % der Anlage bezahlt</span><span>Ziel ${num(cost, 0)} €</span></div>` : `<div class="mut sm" style="margin:8px 0 0">${this._admin() ? "Trag unter Anpassen → Aussehen die Anschaffungskosten ein, dann siehst du, wie viel der Anlage schon bezahlt ist." : ""}</div>`}
      <div class="mut sm" style="margin:6px 0 0">${num(D.pv, 0)} kWh Solar, davon ${num(D.exp, 0)} kWh eingespeist. Gerechnet mit den heutigen Preisen (${num(price, 1)} ct Bezug, ${num(feed, 1)} ct Einspeisung).</div></div>`;
  }
  /* ---- G1: Ring „Wohin der Strom geht“ ---- */
  _m3Dist(houseK, heatK, heatPv, wwK, price) {
    const cd = this._m3Car() ? this._m3CarDay() || { kwh: 0, pv: 0 } : null, carK = cd ? cd.kwh : 0, restK = Math.max(0, houseK - heatK - wwK - carK), tot = Math.max(.01, heatK + wwK + carK + restK);
    const it = [["heat", "Heizung (Raumheizer)", heatK, "#f97316", "radiator", heatK > 0 ? Math.round(heatPv / heatK * 100) + " % Solar" : ""], ["ww", "Warmwasser (Heizstab)", wwK, "#38bdf8", "boiler", ""], ...(cd ? [["car", "Auto (Modul 8)", carK, "#22d3ee", "car", cd.kwh > 0 ? Math.round(cd.pv / cd.kwh * 100) + " % Solar" : ""]] : []), ["rest", "Haushalt und Rest", restK, "#2dd4bf", "fridge", ""]];
    const r = 46, C = 2 * Math.PI * r; let off = 0;
    const arcs = it.map(([, , v, c]) => { const f = v / tot; if (f <= 0) return ""; const len = Math.max(0, f * C - (f < 1 ? 2 : 0)), a = `<circle cx="60" cy="60" r="${r}" fill="none" stroke="${c}" stroke-width="16" stroke-dasharray="${len.toFixed(1)} ${C.toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}" transform="rotate(-90 60 60)"/>`; off += f * C; return a; }).join("");
    const gsOn = this._m3Has("gs"); let sub = "";
    if (this._m3RestOpen) {
      let devs = [];
      if (gsOn) { this._gsLoad(); const H = (this._gsD && this._gsD.hist) || {}, n = new Date(), td = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`; devs = (this._gsState().devices || []).map((d) => ({ n: d.name || "Gerät", g: this._gxAlt(d.img || d.icon || "") || "plug", v: (H[d.id] || []).filter((x) => x.d === td).reduce((a, x) => a + (x.s || 0) + (x.b || 0) + (x.g || 0), 0) })).filter((d) => d.v > .005).sort((a, b) => b.v - a.v); }
      const used = devs.reduce((a, d) => a + d.v, 0);
      sub = `<div class="m3dsub">${devs.map((d) => `<div>${this._gx(d.g, 22)}<b>${esc(d.n)}</b><span>${num(d.v, 2)} kWh</span></div>`).join("")}<div>${this._gx("plug", 22)}<b>Sonstiges</b><span>${num(Math.max(0, restK - used), 1)} kWh</span></div>${gsOn ? "" : `<em class="mut sm">Mit Modul 4 (Gerätestrom) erscheinen hier Waschmaschine, Trockner und Co. einzeln.</em>`}</div>`;
    }
    return `<div class="card"><h2>${ic("layers", 18)}Wohin der Strom heute geht</h2><div class="m3dist"><div class="m3dr"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--line)" stroke-width="16"/>${arcs}</svg><div><b>${num(tot, 1)}</b><span>kWh heute</span></div></div>
      <div class="m3dl">${it.map(([k, l, v, c, g, x]) => `<div class="m3di${k === "rest" ? " rest" : ""}" style="--c:${c}"${k === "rest" ? ` data-act="m3rest" role="button" tabindex="0" aria-expanded="${!!this._m3RestOpen}"` : ""}>${this._gx(g, 32, { on: v > 0 })}<div><small>${l}</small><b>${num(v, 1)} kWh · ${Math.round(v / tot * 100)} %${x ? ` · <em>${x}</em>` : ""}</b>${k === "rest" ? `<small class="m3dx">${gsOn ? "Geräte aus Modul 4" : "Aufschlüsseln"} ${this._m3RestOpen ? "▴" : "▾"}</small>` : ""}</div><span class="m3de">${num(v * price / 100, 2)} €</span></div>`).join("")}</div></div>${sub}
      <div class="mut sm" style="margin:8px 0 0">Warmwasser ist aus der Laufzeit des Heizstabs geschätzt. Der Rest ist Verbrauch minus Heizung, Warmwasser${cd ? " und Auto" : ""}.</div></div>`;
  }
  /* ---- Bewegung: Werte zählen beim Zeitraumwechsel hoch ---- */
  _m3Count() {
    if (!this._m3Cnt || Date.now() - this._m3Cnt > 1500 || this._rkCfg().anim === "aus") return;
    try { if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; } catch (_) { /* ohne matchMedia */ }
    this._m3Cnt = 0;
    requestAnimationFrame(() => this.shadowRoot.querySelectorAll(".m3tiles .v, .m3ring .rv b").forEach((el) => {
      const t = el.firstChild; if (!t || t.nodeType !== 3) return;
      const raw = t.textContent.trim(), dec = (raw.split(",")[1] || "").length, to = parseFloat(raw.replace(/\./g, "").replace(",", ".")); if (!isFinite(to) || to <= 0) return;
      const t0 = performance.now(), D = 650, step = (now) => { const f = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - f, 3); t.textContent = num(to * e, dec); if (f < 1) requestAnimationFrame(step); else t.textContent = raw; };
      requestAnimationFrame(step);
    }));
  }
  _m3PigLook() {
    if (!this._m3On()) return "";
    const m = this._cfg.layout.m3 || {};
    return `<div class="lsec">${ic("total", 15)}Sparschwein (freiwillig)</div>
      <div class="vrow"><span>Anschaffungskosten der Anlage<small class="mut" style="display:block">In Euro. Leer: nur „Vorteil seit Beginn der Aufzeichnung“.</small></span><input class="inp" style="width:110px" type="number" min="0" step="100" data-f="enm3cost" value="${m.cost ? esc(String(m.cost)) : ""}" placeholder="z. B. 3400"></div>
      <div class="vrow"><span>In Betrieb seit<small class="mut" style="display:block">Monat der Inbetriebnahme, z. B. 2024-03.</small></span><input class="inp" style="width:110px" type="month" data-f="enm3since" value="${esc(m.since || "")}"></div>`;
  }
