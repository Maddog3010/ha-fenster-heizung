  /* ================= Modul 4 v1.3 (Konzept „Neue Optik“, Stufe 2): Geräte-Seite und Handy-Übersicht =================
     C  Programm-Kurve: Leistung eines Laufs nach Herkunft (Solar, Batterie, Netz), Abschnitte nur als Hinweis
     C2 Durchlauf-Protokoll: die letzten Läufe, Antippen zeigt ihre Kurve · C3 Typischer Lauf aus den letzten 10 Läufen
     H1 Handy (unter 640 px): laufende Geräte oben als Karte, alle anderen als ruhige Zeilen, Antippen öffnet die Geräte-Seite.
     Die Kurven speichert das Backend ab v1.3 mit jedem Lauf (eine Messung pro Minute, die letzten 6 je Gerät). */
  _gsRunsLoad(did, force) {
    const C = (this._gsR = this._gsR || {}), c = C[did], dev = (((this._gsD || {}).devices) || []).find((x) => x.id === did), live = dev && dev.running;
    if (!force && c && (c.busy || Date.now() - c.ts < (live ? 60000 : 300000))) return;
    C[did] = { ...(c || {}), busy: true, ts: Date.now() };
    this._hass.callWS({ type: "fenster_heizung/gs_runs", dev: did }).then((r) => { C[did] = { ts: Date.now(), d: r }; }).catch(() => { C[did] = { ts: Date.now(), err: true }; }).finally(() => { if (this._gsDet === did) this._render(); });
  }
  _gsHm(t) { return new Date(t).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }); }
  _gsDur(s) { const x = Math.round((s || 0) / 60); return x >= 60 ? `${Math.floor(x / 60)} h ${String(x % 60).padStart(2, "0")} Min.` : `${x} Min.`; }
  _gsWhen(ts) {
    const d = new Date(ts), t0 = new Date(); t0.setHours(0, 0, 0, 0); const diff = Math.floor((t0 - new Date(d).setHours(0, 0, 0, 0)) / 864e5);
    return `${diff === 0 ? "Heute" : diff === 1 ? "Gestern" : diff < 7 ? ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][d.getDay()] : d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })} ${this._gsHm(d)}`;
  }
  /* Abschnitte aus Leistungssprüngen: hohe Blöcke = Heizen, bei Waschmaschinen ein steigender Schluss = Schleudern (nur Hinweis) */
  _gsPhases(cv, typ) {
    const W = cv.map((p) => p[1] + p[2] + p[3]), pk = Math.max(0, ...W), out = [];
    if (pk < 300 || cv.length < 6) return out;
    const hi = Math.max(800, pk * 0.55); let i = 0, n = 0;
    while (i < W.length) {
      if (W[i] >= hi) { let j = i; while (j + 1 < W.length && W[j + 1] >= hi * 0.8) j++; if (j - i >= 2) { n++; out.push({ a: i, b: j, t: typ === "trockner" ? (n === 1 ? "Trocknen" : `Trocknen ${n}`) : n === 1 ? "Aufheizen" : `Heizen ${n}` }); } i = j + 1; } else i++;
    }
    if (typ === "wasch") { const s = Math.floor(W.length * 0.85); const tail = W.slice(s); if (tail.length >= 2 && Math.max(...tail) >= 250 && Math.max(...tail) < hi && !out.some((o) => o.b >= s)) out.push({ a: s, b: W.length - 1, t: "Schleudern" }); }
    if (out.length && typ !== "trockner") { const gap = out[0].b + 2 < (out[1] ? out[1].a : W.length) - 2; if (gap && typ === "wasch") out.splice(1, 0, { a: out[0].b + 1, b: (out[1] ? out[1].a : W.length) - 1, t: "Waschen", soft: true }); }
    return out;
  }
  _gsCurve(cv, t0, typ) {
    if (!cv || cv.length < 2) return `<div class="s3learn">${ic("chart", 18)}<span>Für diesen Lauf gibt es noch keine Kurve. Modul 4 speichert sie ab Version 1.3 mit jedem Durchlauf.</span></div>`;
    const narrow = this.clientWidth > 0 && this.clientWidth < 640, Wd = narrow ? 420 : 980, H = narrow ? 200 : 260, pl = narrow ? 36 : 44, pb = 22, pt = 28, ih = H - pb - pt, T = cv[cv.length - 1][0] || 1, tot = cv.map((p) => p[1] + p[2] + p[3]), mx = Math.max(100, ...tot);
    const step = mx > 2000 ? 1000 : mx > 800 ? 500 : mx > 300 ? 100 : 50, top = Math.ceil(mx / step) * step, X = (s) => pl + (s / T) * (Wd - pl - 4), Y = (w) => pt + ih - (w / top) * ih;
    let g = ""; for (let v = 0; v <= top; v += step) g += `<line x1="${pl}" x2="${Wd}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${pl - 5}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--mut)">${v >= 1000 ? num(v / 1000, v % 1000 ? 1 : 0) + " kW" : v + " W"}</text>`;
    let bars = "";
    cv.forEach((p, i) => {
      const x0 = X(p[0]), x1 = i + 1 < cv.length ? X(cv[i + 1][0]) : x0 + (Wd - pl) / cv.length, w = Math.max(1, x1 - x0 + 0.4); let y = 0;
      [p[1], p[2], p[3]].forEach((v, k) => { if (v <= 0) return; bars += `<rect x="${x0.toFixed(1)}" y="${Y(y + v).toFixed(1)}" width="${w.toFixed(1)}" height="${(Y(y) - Y(y + v)).toFixed(1)}" fill="${GS_COL[k]}" opacity=".85"/>`; y += v; });
    });
    const line = cv.map((p, i) => `${i ? "L" : "M"}${X(p[0]).toFixed(1)} ${Y(tot[i]).toFixed(1)}`).join(" ");
    const ph = this._gsPhases(cv, typ).map((o) => { const x = (X(cv[o.a][0]) + X(cv[o.b][0])) / 2; return `<g transform="translate(${x.toFixed(1)} 12)"><rect x="-34" y="-9" width="68" height="17" rx="8.5" fill="var(--card, #1a2129)" stroke="var(--line)"/><text text-anchor="middle" y="4" font-size="9.5" font-weight="700" fill="var(--primary-text-color)">${esc(o.t)}</text></g>`; }).join("");
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => `<text x="${X(T * f).toFixed(1)}" y="${H - 6}" text-anchor="${f === 0 ? "start" : f === 1 ? "end" : "middle"}" font-size="10" fill="var(--mut)">${this._gsHm(t0 * 1000 + T * f * 1000)}</text>`).join("");
    return `<svg class="gscv" viewBox="0 0 ${Wd} ${H}" role="img" aria-label="Programm-Kurve nach Herkunft">${g}${bars}<path d="${line}" fill="none" stroke="#e6edf3" stroke-width="1.6" opacity=".9"/>${ph}${ticks}</svg>`;
  }
  _gsShareTiles(v) {
    const t = v[0] + v[1] + v[2];
    return `<div class="gsdt3">${GS_SRC.map((n, i) => `<div style="--c:${GS_COL[i]}"><small>${n}</small><b>${t > 0 ? num(v[i] / t * 100, 0) : "–"} %</b></div>`).join("")}</div>`;
  }
  /* ---- Geräte-Seite ---- */
  _gsDetPage(d) {
    this._gsRunsLoad(d.id);
    const C = (this._gsR || {})[d.id] || {}, Rd = C.d || {}, runs = Rd.runs || [], typ = Rd.typ, ty = this._gsTyp(d), run = d.running, Ri = this._gsRestInfo(d);
    const P = this._gsPer(), A = this._gsAgg([d.id], P).t, per = this._gsLabel(P);
    const selT = this._gsRunSel && this._gsRunSel.dev === d.id ? this._gsRunSel.t : null, sel = selT != null ? runs.find((r) => r.t === selT) : null;
    const shown = sel || (run && Rd.live ? { t: Rd.live.t, cv: Rd.live.cv, live: true, kwh: Rd.live.e.reduce((a, b) => a + b, 0), s: Rd.live.e[0], b: Rd.live.e[1], g: Rd.live.e[2] } : runs[0]);
    const v = run ? d.w : shown && shown.s != null ? [shown.s, shown.b, shown.g] : A.v, mix = { pv: v[0], bat: v[1], net: v[2] };
    const st = run ? `<span class="g2st run">läuft · ${wfmt(d.w[0] + d.w[1] + d.w[2])}</span>` : this._gsMode(d) === "done" ? `<span class="g2st done">${ic("check", 12)} fertig ${this._gsHm(d.last.ts)}</span>` : `<span class="g2st">bereit</span>`;
    const sub = run && Ri ? (Ri.learn ? `seit ${this._gsHm(d.since * 1000)} · lernt die Laufzeit (${Ri.n}/3)` : `seit ${this._gsHm(d.since * 1000)} · noch ~${Math.max(1, Math.round(Ri.rest / 60))} Min. · fertig ~${this._gsHm(Ri.end)}`) : `${esc(GS_TYP[ty].n)} · ${esc(per)}: ${num(A.kwh, 2)} kWh · ${num(A.c, 2)} €`;
    const head = `<div class="gsdh"><button class="lnk gsback" data-act="gsdetx">${ic("back", 16)} Gerätestrom</button></div>
      <div class="card gsdtop"><div class="gsdimg">${this._gxRing(this._gsHd(d), mix, 168, { on: run })}</div><div class="gsdinfo"><h2>${esc(d.name)}</h2><div>${st}</div><small>${sub}</small>${run && Ri && !Ri.learn ? `<div class="g2prog"><i style="width:${Math.round(Ri.p * 100)}%"></i></div>` : ""}
        <div class="gsdsl">${run ? "Gerade" : shown && shown.s != null ? (sel ? "Dieser Lauf" : "Letzter Lauf") : esc(per)}</div>${this._gsShareTiles(v)}</div></div>`;
    const sumLine = shown ? `${shown.live ? `seit ${this._gsHm(shown.t * 1000)}` : `${this._gsWhen(shown.t * 1000)}${shown.dur ? ` – ${this._gsHm((shown.t + shown.dur) * 1000)}` : ""}`} · ${shown.dur ? this._gsDur(shown.dur) + " · " : ""}${num(shown.kwh || 0, 2)} kWh${shown.c != null ? ` · ${num(shown.c, 2)} € Kosten` : ""}${shown.sv != null ? ` · ${num(shown.sv, 2)} € gespart` : ""}${shown.kwh && shown.s != null ? ` · ${num(shown.s / shown.kwh * 100, 0)} % Solar` : ""}` : "";
    const curve = `<div class="card gsdc"><h2>${ic("chart", 18)}${shown ? (shown.live ? "Dieser Lauf" : sel ? "Ausgewählter Lauf" : "Letzter Lauf") : "Programm-Kurve"}<span class="legend gsleg2">${GS_SRC.map((t, i) => `<span><i style="background:${GS_COL[i]}"></i>${t}</span>`).join("")}</span></h2>
      ${shown ? `<div class="mut sm" style="margin:-4px 0 6px">${sumLine}</div>${this._gsCurve(shown.cv, shown.t, ty)}<div class="lgnote2">Die Fläche zeigt die Herkunft des Stroms. Abschnitte wie „Aufheizen“ werden aus Leistungssprüngen erkannt und sind nur ein Hinweis.</div>` : `<div class="s3learn">${ic("chart", 18)}<span>${C.busy && !C.d ? "Lädt …" : "Noch kein Lauf aufgezeichnet. Nach dem nächsten Durchlauf steht hier seine Kurve."}</span></div>`}</div>`;
    const B = d.best, rem = d.remind && d.remind * 1000 > Date.now();
    const adv = run ? "" : B && B.ts * 1000 > Date.now() + 15 * 60000 ? `<div class="card g2adv gsdadv">${this._gx("pvRoof", 30)}<span>Nächster Lauf am besten ${B.day === "tomorrow" ? "morgen " : ""}ab ${this._gsHm(B.ts * 1000)}<small>~${num(B.pct, 0)} % Solar erwartet${typ ? ` · Dauer aus dem typischen Lauf (${this._gsDur(typ.dur)})` : ""}</small></span><button class="g2rem${rem ? " on" : ""}" data-act="gsrem" data-k="${esc(d.id)}" aria-pressed="${rem}">${rem ? `${ic("check", 14)} Erinnert` : `${ic("bell", 14)} Erinnern`}</button></div>`
      : d.advice ? `<div class="card g2adv gsdadv ${/^Jetzt/.test(d.advice) ? "go" : ""}">${this._gx("sun", 30)}<span>${esc(d.advice)}<small>Solardeckung jetzt ${num(d.cover, 0)} %</small></span></div>` : "";
    const verb = { wasch: "gewaschen", spuel: "gespült", trockner: "getrocknet" }[ty] || "gelaufen";
    const log = `<div class="card"><h2>${ic("clock", 18)}Durchlauf-Protokoll</h2>${runs.length ? runs.slice(0, 8).map((r) => { const t = r.kwh || 0, hs = r.s != null, m2 = hs ? { pv: r.s, bat: r.b, net: r.g } : { net: r.g, pv: Math.max(0, t - r.g) }, on = (sel && sel.t === r.t) || (!sel && !run && r === runs[0]);
        return `<button class="gsrun ${on ? "sel" : ""}" data-act="gsrunsel" data-k="${r.t}"><span class="gsrimg">${this._gxRing(this._gsHd(d), m2, 38)}</span><span class="gsrt"><b>${this._gsWhen(r.t * 1000)}${r.x ? ` <em class="gsx">mehr als sonst</em>` : ""}</b><small>${r.dur ? this._gsDur(r.dur) + " · " : ""}${num(t, 2)} kWh${r.cv ? "" : " · ohne Kurve"}</small></span><span class="gsrbar">${t > 0 ? (hs ? [r.s, r.b, r.g] : [t - r.g, 0, r.g]).map((x, i) => (x > 0 ? `<i style="flex:${x};background:${GS_COL[i]}"></i>` : "")).join("") : ""}</span><b class="gsrc">${num(r.c || 0, 2)} €</b></button>`; }).join("") + `<div class="lgnote2">Antippen zeigt die Kurve des Laufs.</div>`
      : `<div class="mut sm">${C.busy && !C.d ? "Lädt …" : "Noch keine Läufe gespeichert. Modul 4 merkt sie sich seit Version 2026.11.2b8."}</div>`}</div>`;
    const tl = `<div class="card"><h2>${ic("total", 18)}Typischer Lauf <span class="mut" style="font-weight:400;font-size:.8rem">gelernt</span></h2>${typ ? `<div class="gsdt3 big"><div><small>Ø Dauer</small><b>${this._gsDur(typ.dur)}</b></div><div><small>Ø Energie</small><b>${num(typ.kwh, 2)} kWh</b></div><div><small>Ø Kosten</small><b>${num(typ.c, 2)} €</b></div></div>
      <div class="lgnote2">Aus den letzten ${typ.n} Läufen. Daraus kommen „noch ~ Min.“ auf der Karte und das beste Startfenster.${typ.out ? ` ${typ.out} ${typ.out === 1 ? "Lauf brauchte" : "Läufe brauchten"} deutlich mehr (z. B. 90 °C) und ${typ.out === 1 ? "zählt" : "zählen"} nicht zum Durchschnitt.` : ""}</div>
      ${typ.has_split ? `<div class="gssun">${this._gx("pvRoof", 26)}<div>Mit Sonne ${verb}: <b>${typ.sun} von ${typ.of}</b> Läufen über 70 % Solar</div></div>` : ""}`
      : `<div class="s3learn">${ic("clock", 18)}<span>Lernt noch – ab 3 Läufen steht hier der typische Lauf.</span></div>`}</div>`;
    return `${head}${adv}${curve}<div class="enc"><div class="enco">${log}</div><div class="enco">${tl}</div></div>`;
  }
  /* ---- H1 Handy-Übersicht ---- */
  _gsPhone() { return !this._mpEdit() && this.clientWidth > 0 && this.clientWidth < 640; }
  _gsList(devs, P, tiles) {
    const per = this._gsLabel(P), runs = devs.filter((d) => d.running), rest = devs.filter((d) => !d.running).map((d) => ({ d, a: this._gsAgg([d.id], P).t })).sort((x, y) => y.a.c - x.a.c);
    const big = runs.map((d) => { const a = this._gsAgg([d.id], P).t, R = this._gsRestInfo(d); return `<button class="card gsbig" data-act="gsdet" data-k="${esc(d.id)}"><span class="gsrimg">${this._gxRing(this._gsHd(d), { pv: d.w[0], bat: d.w[1], net: d.w[2] }, 62, { on: true })}</span><span class="gsrt"><b>${esc(d.name)}</b><small class="run">${wfmt(d.w[0] + d.w[1] + d.w[2])}${R && !R.learn ? ` · noch ~${Math.max(1, Math.round(R.rest / 60))} Min.` : ""}</small></span><b class="gsrc">${num(a.c, 2)} €</b>${R && !R.learn ? `<span class="g2prog"><i style="width:${Math.round(R.p * 100)}%"></i></span>` : ""}</button>`; }).join("");
    const st = (d) => { const m = this._gsMode(d), B = d.best; return m === "done" ? `<small class="done">fertig ${this._gsHm(d.last.ts)}</small>` : this._gsTyp(d) === "kuehl" ? `<small class="ok">läuft dauernd</small>` : B && B.ts * 1000 > Date.now() ? `<small>bereit · ab ${this._gsHm(B.ts * 1000)} ☀</small>` : `<small>bereit</small>`; };
    const rows = rest.map(({ d, a }) => `<button class="gsrow2" data-act="gsdet" data-k="${esc(d.id)}"><span class="gsrimg">${this._gxRing(this._gsHd(d), a.v[0] + a.v[1] + a.v[2] > 0 ? { pv: a.v[0], bat: a.v[1], net: a.v[2] } : {}, 40)}</span><span class="gsrt"><b>${esc(d.name)}</b>${st(d)}</span><b class="gsrc">${num(a.c, 2)} €</b><span class="gschev">${ic("chev", 16)}</span></button>`).join("");
    return `${runs.length ? `<div class="lgh4">Läuft jetzt</div>${big}` : ""}<div class="lgh4">Alle Geräte · ${esc(per)}</div><div class="gslist">${rows || `<div class="mut sm">Alle Geräte laufen gerade.</div>`}</div><div class="gsltiles">${tiles}</div>`;
  }
  _gsDetAct(a, b) {
    const k = b.dataset.k;
    if (a === "gsdet") { this._gsDet = k; this._gsRunSel = null; this._gsRunsLoad(k, true); this._render(); const sc = this._scroller && this._scroller(); if (sc) sc.scrollTop = 0; return true; }
    if (a === "gsdetx") { this._gsDet = null; this._gsRunSel = null; this._render(); return true; }
    if (a === "gsrunsel") { const t = Number(k); this._gsRunSel = this._gsRunSel && this._gsRunSel.t === t ? null : { dev: this._gsDet, t }; this._render(); return true; }
    return false;
  }
