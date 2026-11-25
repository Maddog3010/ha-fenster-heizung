  /* ================= Tablet-Modus · Stufe 3: Modul 4 Gerätestrom ohne Scrollen =================
     Reiter Geräte (Wand mit Hinweis oder Knopf je Gerät), Startfenster (Prognose und bestes Fenster je Gerät) und
     Statistik. Antippen eines Geräts öffnet das Gerätefenster mit Programm-Kurve. Erinnern braucht keine PIN. */
  _tm2GsDevs() { return this._mpDevs(((this._gsD || {}).devices) || []); }
  _tm2Gs() {
    if (!this._gsState().devices.length) return this._tm2None("laundry", "Noch kein Gerät eingerichtet.", "Geräte legst du in der normalen Ansicht an.");
    this._gsLoad(); this._gsTipBind();
    const D = this._gsD;
    if (!D || D.err) return this._tm2None("laundry", D && D.err ? "Verbindung zu Home Assistant wird wiederhergestellt …" : "Gerätestrom wird geladen …");
    const devs = this._tm2GsDevs(), tab = this._tm2Tab("gs"), warn = this._gsReady() ? "" : `<div class="tm2warn">${ic("alert", 18)}Solar- und Netz-Sensor fehlen (Modul 3). Bis dahin gilt alles als Netzstrom.</div>`;
    if (!devs.length) return this._tm2None("laundry", "Alle Geräte sind ausgeblendet.");
    return `${warn}${tab === "win" ? this._tm2GsWin(devs) : tab === "stats" ? this._tm2GsStats(devs) : this._tm2GsWall(devs)}`;
  }
  _tm2GsFuture(d) { return d.best && d.best.ts * 1000 > Date.now() + 15 * 60000 ? d.best : null; }
  _tm2GsRem(d, cls = "tm2dvb") {
    const B = d.best, rem = d.remind && d.remind * 1000 > Date.now();
    return `<button class="${cls}${rem ? " on" : ""}" data-act="gsrem" data-k="${esc(d.id)}" aria-pressed="${!!rem}">${ic(rem ? "check" : "bell", 18)}<span>${rem ? "Erinnert" : "Erinnern"} · ${B.day === "tomorrow" ? "morgen " : ""}${this._gsHm(B.ts * 1000)}</span></button>`;
  }
  _tm2GsWall(devs) {
    const cap = this._tm2RoomCap(), rk = (d) => (d.running ? 0 : this._gsMode(d) === "done" ? 1 : 2);
    const sorted = devs.map((d, i) => ({ d, i })).sort((a, b) => rk(a.d) - rk(b.d) || a.i - b.i).map((x) => x.d), p = this._tm2Page("gs", sorted.length, cap.n);
    const day = this._gsDayP(), T = this._gsAgg(devs.map((d) => d.id), day).t;
    const idle = devs.filter((d) => !d.running && this._gsTyp(d) !== "kuehl"), now = Math.max(0, ...idle.map((d) => d.cover || 0)), next = idle.map((d) => this._tm2GsFuture(d)).filter(Boolean).sort((a, b) => a.ts - b.ts)[0];
    const chip = !idle.length ? "" : now >= 70 ? `<span class="tm2chip go">${ic("sun", 18)}Jetzt starten lohnt sich: bis ${num(now, 0)} % Solar</span>` : next ? `<span class="tm2chip">${ic("clock", 18)}Nächstes gutes Fenster ${next.day === "tomorrow" ? "morgen " : ""}ab ${this._gsHm(next.ts * 1000)}</span>` : "";
    const tile = (d) => {
      const a = this._gsAgg([d.id], day).t, m = this._gsMode(d), run = m === "run", base = run ? d.w : a.v, tot = base[0] + base[1] + base[2], R = this._gsRestInfo(d), ty = this._gsTyp(d), cold = ty === "kuehl";
      const st = run ? `läuft${R && !R.learn ? ` · noch ${Math.max(1, Math.round(R.rest / 60))} Min.` : ""}` : m === "done" ? `fertig ${this._gsHm(d.last.ts)}` : cold ? "läuft dauernd" : "bereit";
      const foot = run ? (R && !R.learn ? `<span class="tm2dvf"><span class="g2prog"><i style="width:${Math.round(R.p * 100)}%"></i></span></span>` : `<span class="tm2dvf">lernt die Laufzeit${R ? ` (${R.n}/3)` : ""}</span>`)
        : m === "done" && ["wasch", "trockner", "spuel"].includes(ty) ? `<span class="tm2dvf done">${ic("check", 18)}Fertig – ausräumen</span>`
        : !cold && this._tm2GsFuture(d) ? this._tm2GsRem(d) : `<span class="tm2dvf${!cold && /^Jetzt/.test(d.advice || "") ? " go" : ""}">${cold ? `${num(a.kwh, 2)} kWh heute` : d.advice ? `${esc(d.advice)} · ${num(d.cover, 0)} % Solar` : "&nbsp;"}</span>`;
      return `<div class="tm2dv k-${m}"><button class="tm2dvm" data-act="tm2x" data-k="gs" data-id="${esc(d.id)}" aria-label="${esc(d.name)}: Gerätefenster öffnen">
        <span class="tm2dvh">${this._gxRing(this._gsHd(d), tot > 0 ? { pv: base[0], bat: base[1], net: base[2] } : {}, 64, { on: run })}<span><b>${esc(d.name)}</b><small>${st}</small></span></span>
        <span class="tm2dvv">${run ? wfmt(tot) : `${num(a.c, 2)} €`}<small>${run ? "jetzt" : "heute"}</small></span>
        <span class="tm2dvs" aria-hidden="true">${tot > 0 ? base.map((x, i) => (x > 0 ? `<i style="flex:${x};background:${GS_COL[i]}"></i>` : "")).join("") : ""}</span></button>${foot}</div>`;
    };
    const r = p.pages > 1 ? cap.r : Math.max(1, Math.ceil(sorted.length / cap.c));
    return `<div class="tm2gsh">${this._gx("pvRoof", 30)}<span>Heute gespart <b>${num(T.sv, 2)} €</b></span><small>${T.own != null ? `${num(T.own, 0)} % eigener Strom` : "noch kein Verbrauch"}</small><span class="tm2legend">${GS_SRC.map((t, i) => `<i style="background:${GS_COL[i]}"></i>${t}`).join(" ")}</span>${chip}</div>
      <div class="tm2swb" data-sw="gs"><div class="tm2dvs-grid r${r}" style="--c:${cap.c};--r:${r}">${sorted.slice(p.from, p.to).map(tile).join("")}</div>${this._tm2Pager("gs", p, "Geräte")}</div>`;
  }
  _tm2GsWin(devs) {
    const rows = devs.filter((d) => !d.running && d.best && this._gsTyp(d) !== "kuehl").map((d) => ({ d, W: this._gsWinData(d) })).filter((x) => x.W).sort((a, b) => a.W.s - b.W.s);
    const land = this._tm2Land(), H = window.innerHeight, per = land ? (H < 640 ? 2 : H < 760 ? 3 : H < 1000 ? 5 : 7) : H < 1000 ? 4 : 6;
    if (!rows.length) {
      const idle = devs.filter((d) => !d.running && d.advice && this._gsTyp(d) !== "kuehl"), q = this._tm2Page("gswin", idle.length, per);
      return `<div class="card tm2cc tm2gsw" data-sw="gswin"><div class="tm2sh"><span>${ic("clock", 18)}Startfenster</span></div>${idle.length ? `<div class="tm2rows">${idle.slice(q.from, q.to).map((d) => `<div class="tm2wr plain">${this._gx(this._gsHd(d), 34, { on: true, lvl: 80 })}<b>${esc(d.name)}</b><span>${esc(d.advice)}</span><strong>${num(d.cover, 0)} %</strong></div>`).join("")}</div>${this._tm2Pager("gswin", q, "Geräte")}<small class="tm2note">Zeitfenster erscheinen, sobald es eine Solar-Prognose gibt (Modul 16 oder sieben Tage Verlauf).</small>` : `<div class="tm2none"><div>Gerade gibt es kein Gerät, für das sich ein Fenster lohnt.</div></div>`}</div>`;
    }
    const p = this._tm2Page("gswin", rows.length, per), top = [...rows].sort((a, b) => b.d.best.pct - a.d.best.pct || a.W.s - b.W.s)[0], F = top.W;
    const pos = (W, t) => Math.max(0, Math.min(100, (t - W.x0) / (W.x1 - W.x0) * 100));
    return `<div class="card tm2cc tm2gsf"><div class="tm2sh"><span>${ic("sun", 18)}Solar ${F.tomorrow ? "morgen" : "heute"} · ${F.src === "avg7" ? "Mittel der letzten 7 Tage" : "Prognose"}</span><span class="tm2chip go">${ic("clock", 16)}Beste Zeit ${this._gsHm(F.s * 1000)}–${this._gsHm(F.e * 1000)}</span></div><div class="tm2ch" data-tm2ch="gsfc" data-id="${esc(top.d.id)}"></div></div>
      <div class="card tm2cc tm2gsw" data-sw="gswin"><div class="tm2rows">${rows.slice(p.from, p.to).map(({ d, W }) => `<div class="tm2wr"><button class="tm2wn" data-act="tm2x" data-k="gs" data-id="${esc(d.id)}">${this._gx(this._gsHd(d), 34, { on: true, lvl: 80 })}<b>${esc(d.name)}</b></button><span class="tm2wt" aria-hidden="true"><i style="left:${pos(W, W.s).toFixed(1)}%;width:${Math.max(2, pos(W, W.e) - pos(W, W.s)).toFixed(1)}%"></i></span><span class="tm2wz">${W.tomorrow ? "morgen " : ""}${this._gsHm(W.s * 1000)}–${this._gsHm(W.e * 1000)}</span><strong>${num(d.best.pct, 0)} %</strong>${this._tm2GsFuture(d) ? this._tm2GsRem(d, "tm2wb") : `<span class="tm2wb off">jetzt</span>`}</div>`).join("")}</div>${this._tm2Pager("gswin", p, "Geräte")}</div>`;
  }
  /* Solar-Prognose von 6 bis 22 Uhr mit dem besten Fenster */
  _tm2GsForecast(id, w, h) {
    const d = this._tm2GsDevs().find((x) => x.id === id), W = d && this._gsWinData(d); if (!W) return "";
    const pl = 38, pt = 10, pb = 22, ih = Math.max(20, h - pt - pb), mx = Math.max(300, ...W.fc.map((x) => x[1]));
    const X = (t) => pl + (Math.min(W.x1, Math.max(W.x0, t)) - W.x0) / (W.x1 - W.x0) * (w - pl - 6), Y = (v) => pt + ih - v / mx * ih;
    const pts = W.fc.map((x) => `${X(x[0] + 1800).toFixed(1)} ${Y(x[1]).toFixed(1)}`);
    let g = ""; const step = enStep(mx / 1000); for (let v = 0; v <= mx / 1000 + 1e-9; v += step) g += `<line x1="${pl}" x2="${w}" y1="${Y(v * 1000).toFixed(1)}" y2="${Y(v * 1000).toFixed(1)}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${pl - 6}" y="${(Y(v * 1000) + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="var(--mut)">${num(v, step < 1 ? 1 : 0)}</text>`;
    const ticks = [6, 9, 12, 15, 18, 21].map((hr) => `<text x="${X(W.x0 + (hr - 6) * 3600).toFixed(1)}" y="${h - 6}" text-anchor="middle" font-size="11" fill="var(--mut)">${hr}:00</text>`).join("");
    const now = Date.now() / 1000, nx = !W.tomorrow && now > W.x0 && now < W.x1 ? X(now) : null;
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Solar-Prognose in kW">${g}<rect x="${X(W.s).toFixed(1)}" y="${pt}" width="${Math.max(6, X(W.e) - X(W.s)).toFixed(1)}" height="${ih}" rx="8" fill="#2dd4bf" fill-opacity=".16" stroke="#2dd4bf" stroke-dasharray="5 4"/>${pts.length ? `<path d="M${X(W.x0).toFixed(1)} ${Y(0).toFixed(1)}L${pts.join("L")}L${X(W.x1).toFixed(1)} ${Y(0).toFixed(1)}Z" fill="#fbbf24" fill-opacity=".18"/><path d="M${pts.join("L")}" fill="none" stroke="#fbbf24" stroke-width="2.5"/>` : ""}${nx != null ? `<line x1="${nx.toFixed(1)}" x2="${nx.toFixed(1)}" y1="${pt}" y2="${Y(0).toFixed(1)}" stroke="currentColor" opacity=".7"/>` : ""}${ticks}</svg>`;
  }
  _tm2GsStats(devs) {
    const P = this._gsPer(), ids = devs.map((d) => d.id), T = this._gsAgg(ids, P).t, V = this._gsPrev(ids, P), cl = { day: "zum Vortag", week: "zur Vorwoche", month: "zum Vormonat", year: "zum Vorjahr" }[P.rg];
    const cmp = (cur, old, alt) => { if (!V || old == null || old < 0.005) return alt; const d = Math.round((cur - old) / old * 100); return isFinite(d) ? `${d > 0 ? "▲" : d < 0 ? "▼" : "="} ${Math.abs(d)} % ${cl}` : alt; };
    const tiles = [
      this._tm2Tile4("Gespart", `${num(T.sv, 2)} €`, "", cmp(T.sv, V && V.sv, "mit eigenem Strom"), "#34d399"),
      this._tm2Tile4("Kosten", `${num(T.c, 2)} €`, "", cmp(T.c, V && V.c, T.n ? `Ø ${num(T.c / T.n, 2)} € je Lauf` : "kein Durchlauf"), "#f87171"),
      this._tm2Tile4("Verbrauch", num(T.kwh, T.kwh >= 100 ? 0 : 1), "kWh", T.own != null ? `${num(T.own, 0)} % eigener Strom` : "keine Daten", "#2dd4bf"),
      this._tm2Tile4("Durchläufe", num(T.n), "", cmp(T.n, V && V.n, "&nbsp;"), "#a78bfa")].join("");
    const bar = `<div class="tm2bar"><div class="tm2seg" role="group" aria-label="Zeitraum">${[["day", "Tag"], ["week", "Woche"], ["month", "Monat"], ["year", "Jahr"]].map(([k, l]) => `<button class="${P.rg === k ? "sel" : ""}" data-act="gsrange" data-k="${k}" aria-pressed="${P.rg === k}">${l}</button>`).join("")}</div>
      <div class="tm2per"><button data-act="gsoff" data-k="-1" aria-label="Zurück">${ic("back", 20)}</button><b>${esc(this._gsLabel(P))}</b><button class="nx" data-act="gsoff" data-k="1" aria-label="Weiter" ${P.cur ? "disabled" : ""}>${ic("back", 20)}</button></div></div>`;
    return `${bar}<div class="tm2sums">${tiles}</div><div class="tm2stat tm2gss"><div class="card tm2cc"><div class="tm2sh"><span>${ic("chart", 18)}${P.rg === "day" ? "Woher der Strom kam" : "Verlauf nach Quelle (kWh)"}</span><span class="tm2legend">${GS_SRC.map((t, i) => `<i style="background:${GS_COL[i]}"></i>${t}`).join(" ")}</span></div><div class="tm2ch" data-tm2ch="gs"></div></div>${this._tm2GsSide(devs, P)}</div>`;
  }
  /* Rechte Spalte: Monatsziel (oder Jahresrückblick) und die Geräte mit der größten Ersparnis */
  _tm2GsSide(devs, P) {
    const G = this._gsState(), short = window.innerHeight < 760 || !this._tm2Land();
    if (P.rg === "year" && P.cur) {
      const R = this._gsYearRows(devs).slice(0, short ? 2 : 4);
      if (R.length) return `<div class="card tm2cc tm2gsx"><div class="tm2sh"><span>${ic("today", 18)}Dein Jahr</span><button class="tm2mini" data-act="gsyshare">Als Bild teilen</button></div>${R.map((r) => `<div class="tm2use">${this._gx(this._gsHd(r.d), 32, { on: true, lvl: 80 })}<span><b>${num(r.sun)} von ${num(r.n)} mit Sonne</b><small>${esc(r.d.name)}</small></span><strong>${num(r.sv, 2)} €</strong></div>`).join("")}</div>`;
    }
    let goal = "";
    if (G.goal > 0) { const M = this._gsAgg(devs.map((d) => d.id), this._gsMonthP()).t, f = Math.min(100, M.sv / G.goal * 100); goal = `<div class="tm2goal">${this._tm2Ring(f)}<small>Monatsziel mit Sonne<br>${num(M.sv, 2)} € von ${num(G.goal, 0)} €</small></div>`; }
    const top = devs.map((d) => ({ d, t: this._gsAgg([d.id], P).t })).filter((x) => x.t.sv > 0.004).sort((a, b) => b.t.sv - a.t.sv).slice(0, goal && short ? 2 : 3);
    return `<div class="card tm2cc tm2gsx">${goal}<div class="tm2sh"><span>${ic("total", 18)}Größte Ersparnis</span></div>${top.length ? top.map(({ d, t }) => `<button class="tm2use" data-act="tm2x" data-k="gs" data-id="${esc(d.id)}">${this._gx(this._gsHd(d), 30, { on: true, lvl: 80 })}<span><b>${esc(d.name)}</b></span><strong>${num(t.sv, 2)} €</strong></button>`).join("") : `<small class="tm2note">Noch nichts gespart in diesem Zeitraum.</small>`}</div>`;
  }
  _tm2GsChart(box, w, h) {
    const P = this._gsPer(), devs = this._tm2GsDevs();
    if (P.rg === "day") {
      const all = devs.map((d) => ({ d, t: this._gsAgg([d.id], P).t })).filter((x) => x.t.kwh > 0.004).sort((a, b) => b.t.kwh - a.t.kwh), n = Math.max(1, Math.floor(h / 46)), rows = all.slice(0, n), mx = Math.max(0.01, ...rows.map((r) => r.t.kwh));
      if (!rows.length) { box.innerHTML = `<small class="tm2note">An diesem Tag hat noch kein Gerät Strom gebraucht.</small>`; return; }
      box.innerHTML = `<div class="tm2dayr" style="--n:${n}">${rows.map(({ d, t }) => `<button data-act="tm2x" data-k="gs" data-id="${esc(d.id)}">${this._gx(this._gsHd(d), 28, { on: true, lvl: 80 })}<b>${esc(d.name)}</b><span><span style="width:${(t.kwh / mx * 100).toFixed(1)}%">${t.v.map((v, i) => (v > 0 ? `<i style="flex:${v};background:${GS_COL[i]}"></i>` : "")).join("")}</span></span><em>${num(t.kwh, 2)} kWh</em></button>`).join("")}</div>`;
      return;
    }
    const k = w < 600 ? 1 : 1.15;
    let used = 0;
    for (let i = 0; i < 4; i++) {
      this._gsDim = { w: Math.round(w / k), h: Math.max(80, Math.round((h - used) / k)) };
      const tmp = document.createElement("div"), keep = this._gsSel; this._gsSel = ""; tmp.innerHTML = this._gsChart(this._gsD, devs, P); this._gsSel = keep; this._gsDim = null;
      const ch = tmp.querySelector(".enchw"); box.innerHTML = ""; if (!ch) return;
      ch.querySelectorAll("[data-act='gspick']").forEach((e) => e.removeAttribute("data-act"));
      box.appendChild(ch);
      const over = box.scrollHeight - h; if (over <= 0) break; used += over + 2;
    }
  }
  /* Gerätefenster: Werte, Programm-Kurve, letzte Läufe */
  _tm2GsModal(m) {
    const close = `<button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button>`, d = this._tm2GsDevs().find((x) => x.id === m.id);
    if (!d) return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Gerät</b></div>${close}</div><div class="mut">Gerätedaten werden geladen …</div></div>`;
    this._gsRunsLoad(d.id);
    const C = (this._gsR || {})[d.id] || {}, Rd = C.d || {}, runs = Rd.runs || [], typ = Rd.typ, ty = this._gsTyp(d), run = d.running, R = this._gsRestInfo(d), day = this._gsAgg([d.id], this._gsDayP()).t;
    const sel = m.run != null ? runs.find((r) => r.t === m.run) : null;
    const shown = sel || (run && Rd.live ? { t: Rd.live.t, cv: Rd.live.cv, live: true, kwh: Rd.live.e.reduce((a, b) => a + b, 0) } : runs[0]);
    const v = run ? d.w : day.v, mix = { pv: v[0], bat: v[1], net: v[2] };
    const st = run ? `läuft · ${wfmt(d.w[0] + d.w[1] + d.w[2])}${R && !R.learn ? ` · noch ${Math.max(1, Math.round(R.rest / 60))} Min., fertig ~${this._gsHm(R.end)}` : ""}` : this._gsMode(d) === "done" ? `fertig ${this._gsHm(d.last.ts)}` : `${esc(GS_TYP[ty].n)} · bereit`;
    const kpi = (l, val, sub, c) => `<div class="tm2kpi" style="--a:${c}"><span>${l}</span><b>${val}</b><small>${sub}</small></div>`;
    const kpis = `<div class="tm2kpis four">${kpi("Kosten heute", `${num(day.c, 2)} €`, `${num(day.kwh, 2)} kWh`, "#f87171")}${kpi("Gespart heute", `${num(day.sv, 2)} €`, `${num(day.n)} ${day.n === 1 ? "Lauf" : "Läufe"}`, "#34d399")}${kpi("Letzter Lauf", d.last ? `${num(d.last.kwh, 2)} kWh` : "–", d.last ? `${num(d.last.share, 0)} % eigener Strom` : "noch keiner", "#fbbf24")}${kpi("Typischer Lauf", typ ? this._gsDur(typ.dur) : "–", typ ? `${num(typ.kwh, 2)} kWh · ${num(typ.c, 2)} €` : "lernt ab 3 Läufen", "#a78bfa")}</div>`;
    const sum = shown ? `${shown.live ? `seit ${this._gsHm(shown.t * 1000)}` : this._gsWhen(shown.t * 1000)}${shown.dur ? ` · ${this._gsDur(shown.dur)}` : ""} · ${num(shown.kwh || 0, 2)} kWh${shown.c != null ? ` · ${num(shown.c, 2)} €` : ""}` : "";
    const curve = shown ? `<div class="tm2sh"><span>${ic("chart", 18)}${shown.live ? "Dieser Lauf" : sel ? "Ausgewählter Lauf" : "Letzter Lauf"} <em>${sum}</em></span><span class="tm2legend">${GS_SRC.map((t, i) => `<i style="background:${GS_COL[i]}"></i>${t}`).join(" ")}</span></div><div class="tm2cv">${this._gsCurve(shown.cv, shown.t, ty)}</div>`
      : `<div class="mut tm2cv">${C.busy && !C.d ? "Lädt …" : "Noch kein Lauf aufgezeichnet. Nach dem nächsten Durchlauf steht hier seine Kurve."}</div>`;
    const chips = runs.length > 1 ? `<div class="tm2runs">${runs.slice(0, 4).map((r) => { const on = shown && shown.t === r.t; return `<button class="${on ? "sel" : ""}" data-act="tm2run" data-k="${r.t}" aria-pressed="${!!on}"><b>${this._gsWhen(r.t * 1000)}</b><small>${num(r.kwh || 0, 2)} kWh · ${num(r.c || 0, 2)} €</small></button>`; }).join("")}</div>` : "";
    const rem = !run && ty !== "kuehl" && this._tm2GsFuture(d) ? `<div class="tm2adv">${this._gx("sun", 28)}<span>Am besten ${d.best.day === "tomorrow" ? "morgen " : ""}ab ${this._gsHm(d.best.ts * 1000)} starten<small>~${num(d.best.pct, 0)} % Solar erwartet</small></span>${this._tm2GsRem(d, "tm2wb")}</div>`
      : !run && d.advice && ty !== "kuehl" ? `<div class="tm2adv">${this._gx("sun", 28)}<span>${esc(d.advice)}<small>Solardeckung jetzt ${num(d.cover, 0)} %</small></span></div>` : "";
    return `<div class="ov" data-act="close"></div><div class="sheet wide tm2rm" role="dialog" aria-modal="true"><div class="sh"><span class="tm2gsi">${this._gxRing(this._gsHd(d), mix, 56, { on: run })}</span><div><b>${esc(d.name)}</b><span>${st}</span></div>${close}</div>${kpis}${curve}${chips}${rem}${this._gsStandby(d)}</div>`;
  }
