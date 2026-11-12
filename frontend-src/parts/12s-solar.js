  /* ================= Modul 16 Solar-Prognose · Neue Optik Stufe 1 (v0.9 Build 3, Konzept_Modul16_Neue-Optik A, B, C, G) =================
     A  Sonnenbogen-Banner: Bogen über die Sonnenstunden, Sonne an der aktuellen Stelle, Prognose als Fläche, gefüllt der erzeugte Teil,
        „vor / hinter Plan“ statt Prozent vom ganzen Tag. Nachts: Mond und die Kurve für morgen.
     B  Kacheln 2.0 mit HD-Bildern und Ring (Heute erwartet, Heute bisher, Morgen, Treffsicherheit, Noch zu erwarten, Beste Zeit).
     C  Tageskurve: Prognose (gestrichelt) und Ertrag je Stunde (aus der Langzeitstatistik des Ertragssensors), beste Zeit mit Geräten
        aus Modul 4, 8 und 2, Preisband aus dem Stundenpreis. Farben: Prognose Bernstein, Ertrag Solar-Gelb.
     G  Handy und Hell. „Ansicht wie bisher“ in den Einstellungen holt die alte Seite zurück. */
  _spNew() { return this._sp().cfg.look !== "classic"; }
  /* Ertrag je Stunde (heute) aus der Langzeitstatistik des Ertragssensors – Änderung je Stunde, alle 5 Min. neu */
  _spActH() {
    const B = this._sp().act_h; if (Array.isArray(B) && B.length) return Object.fromEntries(B);   /* Stufe 2: Stundenwerte kommen aus dem Backend */
    const id = this._sp().cfg.act, st = id && this._hass.states[id]; if (!st) return null;
    const c = this._spAh; if (c && c.id === id && Date.now() - c.ts < 3e5) return c.h;
    if (this._spAhBusy) return c ? c.h : null;
    this._spAhBusy = true;
    const s = new Date(); s.setHours(0, 0, 0, 0);
    const k = { Wh: .001, kWh: 1, MWh: 1000 }[String(st.attributes.unit_of_measurement || "kWh").trim()] || 1;
    this._hass.callWS({ type: "recorder/statistics_during_period", start_time: s.toISOString(), end_time: new Date().toISOString(), statistic_ids: [id], period: "hour", types: ["change"] })
      .then((r) => { const h = {}; ((r || {})[id] || []).forEach((x) => { const t = new Date(typeof x.start === "number" ? x.start : Date.parse(x.start)); if (isFinite(x.change)) h[t.getHours()] = Math.max(0, x.change * k); }); this._spAh = { id, ts: Date.now(), h: Object.keys(h).length ? h : null }; })
      .catch(() => { this._spAh = { id, ts: Date.now(), h: null }; })
      .finally(() => { this._spAhBusy = false; if (this._spVisible()) this._render(); });
    return c ? c.h : null;
  }
  /* Kennzahlen für Banner und Kacheln */
  _spCalc() {
    /* Stufe 3 (E1): Ist eine Korrektur gelernt, zeigen Banner, Kacheln und Kurve die korrigierte Prognose (Faktor cf).
       Die Treffsicherheit misst weiter die gelieferte Prognose der Quelle. */
    const S = this._sp(), cf = S.corr != null && S.corr > 0 ? S.corr : 1, sc = (L) => (L || []).map(([h, v]) => [h, v * cf]);
    const now = new Date(), nh = now.getHours() + now.getMinutes() / 60, rows = sc(S.hours), byh = Object.fromEntries(rows), tm = sc(S.hours_tm);
    const raw = S.today_f != null ? S.today_f : S.today, base = raw * cf, k = S.today > 0 ? raw / S.today : 1;   /* Messlatte = Morgen-Stand der Prognose */
    let plan = 0, rest = 0;
    rows.forEach(([h, v]) => { const f = Math.max(0, Math.min(1, nh - h)); plan += v * f; rest += v * (1 - f); });
    plan *= k;
    if (Array.isArray(S.hours_f) && S.hours_f.length) { plan = 0; S.hours_f.forEach(([h, v]) => { plan += v * cf * Math.max(0, Math.min(1, nh - h)); }); }  /* Stufe 2: Messlatte ist die Kurve von heute früh */
    const prod = rows.filter((r) => r[1] > 0.01), H0 = prod.length ? prod[0][0] : 7, H1 = prod.length ? prod[prod.length - 1][0] + 1 : 17;
    const night = nh >= H1 || (S.got != null && rest < .05 && nh > 12);
    const hist = (S.hist || []).filter((x) => x.f > 0 && x.a != null), acc = hist.length ? Math.max(0, Math.round(100 - hist.reduce((a, x) => a + Math.min(100, Math.abs(x.a - x.f) / x.f * 100), 0) / hist.length)) : null;
    return { S, cf, raw, tmr: S.tomorrow * cf, byh, rows, tm, base, plan, rest, H0, H1, nh, night, acc, nAcc: hist.length, vor: S.got != null ? S.got - plan : null };
  }
  /* Stufe 2: woher die Prognose kommt, wann zuletzt abgerufen, Stand des Speichers */
  _spSrcInfo() {
    const S = this._sp(); if (!this._spD || S.error) return "";
    const via = { energy: "über die Energie-Schnittstelle von Home Assistant", service: "über den Dienst von Forecast.Solar (Rückfall)", sensor: "aus dem eigenen Sensor" }[S.via] || "noch nicht abgerufen";
    const t = S.fetched ? new Date(S.fetched * 1000).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "";
    return `<div class="spsrc"><div><span class="mut">Prognose</span><b>${esc(via)}</b></div><div><span class="mut">Zuletzt abgerufen</span><b>${t ? t + " Uhr · alle 30 Min." : "–"}</b></div>
      <div><span class="mut">Ertrag je Stunde</span><b>${S.act_h ? "aus der Langzeitstatistik" : S.has_act ? "keine Statistik (Sensor ohne state_class?)" : "kein Ertragssensor"}</b></div><div><span class="mut">Gespeicherte Tage</span><b>${S.days != null ? S.days : "–"} von 400</b></div>
      ${S.fetch_err ? `<div class="spsrcw">${ic("alert", 14)}${esc(S.fetch_err)}</div>` : ""}</div>`;
  }
  _spF(v, d = 1) { return v == null || !isFinite(v) ? "–" : num(v, d); }
  /* ---------------- A · Sonnenbogen-Banner ---------------- */
  _spBanner() {
    const S = this._sp();
    if (!this._spD || S.error || !S.found) return this._modHero("sp", { icon: "sun", lbl: "Solar-Prognose", big: "–", sub: S && S.error ? "Prognose nicht geladen" : "Noch keine Prognose" });
    const C = this._spCalc(), f1 = (v) => this._spF(v), night = C.night;
    const vor = C.vor, vt = vor == null ? "" : Math.abs(vor) < .1 ? "genau im Plan" : vor > 0 ? `+${f1(vor)} kWh vor Plan` : `${f1(-vor)} kWh hinter Plan`, vc = vor == null ? "" : vor >= -.1 ? "g" : "w";
    const pc = C.base > 0 && S.got != null ? Math.min(100, Math.round(S.got / C.base * 100)) : 0;
    const dp = S.today > 0 ? Math.round((S.tomorrow - S.today) / S.today * 100) : null;
    const chips = night ? [`Heute ${f1(S.got != null ? S.got : C.base)} kWh ${S.got != null ? "erzeugt" : "erwartet"}`, C.acc != null ? `Treffsicherheit ${C.acc} %` : ""]
      : [`Noch ${f1(C.rest)} kWh bis ${C.H1} Uhr`, `Morgen ${f1(C.tmr)} kWh${dp == null ? "" : ` · ${dp > 0 ? "+" : ""}${dp} %`}`, C.acc != null ? `Treffsicherheit ${C.acc} %` : ""];
    const left = night
      ? `<div class="lbl">${ic("moon", 15)}Nach Sonnenuntergang · morgen erwartet</div><div class="big">${f1(C.tmr)}<small>kWh</small></div><div class="spsub">${S.best && S.best_day === "tomorrow" ? `Beste Zeit ${S.best.from}–${S.best.to} Uhr · ${f1(S.best.kwh * C.cf)} kWh` : dp == null ? "" : dp >= 0 ? `${dp} % mehr als heute` : `${-dp} % weniger als heute`}</div>`
      : `<div class="lbl">${ic("sun", 15)}Solar heute erwartet</div><div class="big">${f1(C.base)}<small>kWh</small></div>
        ${S.got != null ? `<div class="spbar"><i style="width:${pc}%"></i></div><div class="spsub">bisher <b>${f1(S.got)} kWh</b> · ${pc} %${vt ? ` · <span class="${vc}">${vt}</span>` : ""}</div>` : `<div class="spsub">Kein Ertragssensor – unter Einstellungen wählen, dann siehst du „vor / hinter Plan“.</div>`}`;
    return `<div class="card hero mh a-sp spban${night ? " nt" : ""}">${this._spBow(C, night)}<div class="spbl">${left}<div class="chips">${(this._tmOn && this._tmOn() ? [] : chips).filter(Boolean).map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div></div></div>`;
  }
  /* Sonnenbogen: Breite 560 × 210, Bogen über die Sonnenstunden, Fläche = Prognose, gefüllt = Ertrag bis jetzt */
  _spBow(C, night) {
    const W = 560, H = 210, x0 = 40, x1 = W - 40, base = H - 34, top = 70, r = (x1 - x0) / 2, cx = (x0 + x1) / 2, ry = r * .62;
    const rows = night ? C.tm : C.rows, P = rows.filter((x) => x[1] > .01), h0 = P.length ? P[0][0] : 7, h1 = P.length ? P[P.length - 1][0] + 1 : 17, span = Math.max(1, h1 - h0);
    const mx = Math.max(.3, ...rows.map((x) => x[1])) * 1.05, X = (h) => x0 + (h - h0) / span * (x1 - x0), Y = (v) => base - v / mx * (base - top);
    const pts = (data, upto) => { const o = [[X(h0), base]]; for (let h = h0; h < h1; h++) { if (upto != null && h > upto) break; o.push([X(h + .5), Y(data[h] || 0)]); } return o; };
    const smooth = (p) => { let s = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`; for (let i = 0; i < p.length - 1; i++) { const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], d = p[i + 2] || c; s += ` C${(b[0] + (c[0] - a[0]) / 6).toFixed(1)},${(b[1] + (c[1] - a[1]) / 6).toFixed(1)} ${(c[0] - (d[0] - b[0]) / 6).toFixed(1)},${(c[1] - (d[1] - b[1]) / 6).toFixed(1)} ${c[0].toFixed(1)},${c[1].toFixed(1)}`; } return s; };
    const fcD = Object.fromEntries(rows), fp = pts(fcD); fp.push([X(h1), base]);
    const fLine = smooth(fp), fArea = fLine + ` L${x0},${base} Z`;
    let act = "";
    if (!night) {
      const A = this._spActH(), nh = Math.min(C.nh, h1), last = Math.floor(nh - .001);
      let ap;
      if (A) { ap = pts(A, last); ap.push([X(nh), Y(A[last] || 0)]); }
      else if (C.S.got != null && C.plan > 0) { const k = C.S.got / C.plan; const d = {}; Object.keys(fcD).forEach((h) => { d[h] = fcD[h] * k; }); ap = pts(d, last); ap.push([X(nh), Y((fcD[last] || 0) * k)]); }   /* ohne Statistik: Prognose-Form, auf den Ertrag skaliert */
      if (ap && ap.length > 2) { const l = smooth(ap); act = `<path d="${l} L${ap[ap.length - 1][0].toFixed(1)},${base} L${x0},${base} Z" fill="url(#spgA)"/><path d="${l}" fill="none" stroke="#fde047" stroke-width="3" stroke-linecap="round"/>`; }
    }
    const t = night ? .5 : Math.max(0, Math.min(1, (C.nh - h0) / span)), ang = Math.PI * (1 - t), sx = cx + r * Math.cos(ang), sy = base - ry * Math.sin(ang);
    const sun = night ? `<circle cx="${sx.toFixed(1)}" cy="${(sy - 6).toFixed(1)}" r="15" fill="#e2e8f0"/><circle cx="${(sx + 7).toFixed(1)}" cy="${(sy - 11).toFixed(1)}" r="13" fill="#0b1426"/>`
      : `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="42" fill="url(#spgS)"/>${this._gx("sun", 54, { on: true }).replace("<svg ", `<svg x="${(sx - 27).toFixed(1)}" y="${(sy - 27).toFixed(1)}" `)}`;
    const nowx = X(Math.min(C.nh, h1)), id = "sp" + (this.constructor._gxN = ((this.constructor._gxN || 0) + 1) % 1e6);
    const stars = night ? Array.from({ length: 18 }, (_, i) => `<circle cx="${(i * 97 + 31) % W}" cy="${(i * 53 + 11) % 120}" r="${i % 4 ? .8 : 1.3}" fill="#fff" opacity="${.25 + (i % 3) * .2}"/>`).join("") : "";
    return `<svg class="spbow" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMaxYMid meet" aria-hidden="true"><defs>
      <linearGradient id="spgF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f59e0b" stop-opacity=".42"/><stop offset="1" stop-color="#f59e0b" stop-opacity=".04"/></linearGradient>
      <linearGradient id="spgA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#facc15" stop-opacity=".95"/><stop offset="1" stop-color="#f59e0b" stop-opacity=".35"/></linearGradient>
      <radialGradient id="spgS"><stop offset="0" stop-color="#fde047" stop-opacity=".55"/><stop offset="1" stop-color="#fde047" stop-opacity="0"/></radialGradient></defs>${stars}
      <path d="M${x0},${base} A${r},${ry} 0 0 1 ${x1},${base}" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="2" stroke-dasharray="3 7"/>
      <path d="${fArea}" fill="url(#spgF)"/><path d="${fLine}" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5 5" opacity=".9"/>${act}
      ${night ? "" : `<line x1="${nowx.toFixed(1)}" y1="${top - 8}" x2="${nowx.toFixed(1)}" y2="${base}" stroke="#fff" stroke-opacity=".45" stroke-dasharray="2 4"/>`}
      <line x1="${x0 - 20}" y1="${base}" x2="${x1 + 20}" y2="${base}" stroke="rgba(255,255,255,.22)"/>${sun}
      <text x="${x0}" y="${base + 22}" class="spt">${h0} Uhr</text><text x="${x1}" y="${base + 22}" class="spt" text-anchor="end">${h1} Uhr</text></svg>`;
  }
  /* ---------------- B · Kacheln 2.0 ---------------- */
  _spTile(o) {
    const C2 = 2 * Math.PI * 30, ring = o.ring != null ? `<svg viewBox="0 0 72 72" class="sptr" aria-hidden="true"><circle cx="36" cy="36" r="30"/><circle cx="36" cy="36" r="30" stroke-dasharray="${(C2 * Math.max(0, Math.min(1, o.ring))).toFixed(1)} ${C2.toFixed(1)}"/></svg>` : "";
    return `<div class="sptile${o.dim ? " dim" : ""}" style="--c:${o.c}">${o.badge ? `<span class="spbd">${esc(o.badge)}</span>` : ""}<div class="spti">${ring}<span>${this._gx(o.g, 44, o.go || { on: true })}</span></div>
      <div class="sptl">${esc(o.l)}</div><div class="sptv">${o.v}<small>${esc(o.u || "")}</small></div><div class="spts">${o.s || ""}</div></div>`;
  }
  _spTiles(C) {
    const S = C.S, f1 = (v) => this._spF(v), dp = S.today > 0 ? Math.round((S.tomorrow - S.today) / S.today * 100) : null, vor = C.vor;
    const T = [
      { g: "forecast", c: "#f59e0b", l: "Heute erwartet", v: f1(C.base), u: "kWh", badge: C.cf !== 1 ? "korrigiert" : "",
        s: C.cf !== 1 ? `geliefert ${f1(C.raw)} · gelernt ×${num(C.cf, 2)} aus ${S.corr_n} Tagen` : S.today_f != null && Math.abs(S.today - S.today_f) >= .3 ? `Prognose von heute früh · aktuell ${f1(S.today)}` : S.corr_raw == null && S.corr_n != null && S.corr_n < 7 ? `Prognose von heute früh · Korrektur lernt (${S.corr_n}/7 Tage)` : "Prognose von heute früh" },
      C.night && S.got != null ? { g: "pvRoof", c: "#facc15", l: "Heute erzeugt", v: f1(S.got), u: "kWh", ring: C.base > 0 ? S.got / C.base : null, s: `${C.base > 0 ? Math.round(S.got / C.base * 100) : 0} % der Prognose von heute früh` } :
      { g: "pvRoof", c: "#facc15", l: "Heute bisher", v: f1(S.got), u: S.got != null ? "kWh" : "", ring: S.got != null && C.base > 0 ? S.got / C.base : null, dim: S.got == null,
        s: S.got == null ? (S.has_act ? "Sensor liefert keinen Wert" : "Kein Ertragssensor gewählt") : `${vor >= -.1 ? `<span class="g">${Math.abs(vor) < .1 ? "genau im Plan" : "+" + f1(vor) + " kWh vor Plan"}</span>` : `<span class="w">${f1(-vor)} kWh hinter Plan</span>`} · ${C.base > 0 ? Math.round(S.got / C.base * 100) : 0} % des Tages` },
      { g: "sun", c: "#38bdf8", l: "Morgen", v: f1(C.tmr), u: "kWh", badge: dp == null ? "" : dp >= 15 ? "sonniger" : dp <= -15 ? "trüber" : "ähnlich", s: dp == null ? "" : dp === 0 ? "wie heute" : dp < 0 ? `${-dp} % weniger als heute` : `${dp} % mehr als heute` },
      { g: "forecast", c: "#4ade80", l: "Treffsicherheit", v: C.acc != null ? String(C.acc) : "–", u: C.acc != null ? "%" : "", ring: C.acc != null ? C.acc / 100 : null, dim: C.acc == null, badge: C.acc == null ? "" : C.acc >= 85 ? "gut" : C.acc >= 70 ? "mittel" : "ungenau",
        s: C.acc == null ? "Braucht Ertragssensor und einige Tage" : `${C.nAcc} ${C.nAcc === 1 ? "Tag" : "Tage"} · Ertrag im Mittel ${S.dev == null ? "–" : (S.dev >= 0 ? f1(S.dev) + " % über" : f1(-S.dev) + " % unter")} der Prognose` },
    ];
    if (!C.night) T.push({ g: "balcony", c: "#facc15", l: "Noch zu erwarten", v: f1(C.rest), u: "kWh", s: `bis etwa ${C.H1} Uhr` });
    if (S.best) T.push({ g: this._spDevs()[0] ? this._spDevs()[0].g : "sun", c: "#4ade80", l: S.best_day === "today" ? "Beste Zeit heute" : "Beste Zeit morgen", v: `${S.best.from}–${S.best.to}`, u: "Uhr", s: `${f1(S.best.kwh * C.cf)} kWh · gut für Waschen und Laden` });
    return `<div class="sptiles">${T.map((o) => this._spTile(o)).join("")}</div>`;
  }
  /* Geräte, die sich in der besten Zeit lohnen (nur Module, die an sind) */
  _spDevs() {
    const out = [], seen = new Set();
    if (this._m3Has("gs")) (this._gsState().devices || []).forEach((d) => { const g = this._gxAlt(d.typ || "") || ""; if (["washer", "dryer", "dishwasher"].includes(g) && !seen.has(g)) { seen.add(g); out.push({ g, n: d.name || GS_TYP[d.typ]?.n || "Gerät", m: "gs", ml: "Modul 4" }); } });
    if (this._m3Has("ev")) out.push({ g: "car", n: (this._mdState().ev || {}).model || "Auto laden", m: "ev", ml: "Modul 8" });
    if (this._m3Has("ww")) out.push({ g: "boiler", n: "Heizstab", m: "ww", ml: "Modul 2" });
    return out.slice(0, 4);
  }
  /* ---------------- C · Tageskurve ---------------- */
  _spChart(C, day) {
    const S = C.S, rows = day === "today" ? C.rows : C.tm; if (!rows.length) return `<div class="mut" style="padding:16px 0">Für diesen Tag gibt es keine Stundenwerte.</div>`;
    const nar = (this.clientWidth || 1000) < 640, W = nar ? 380 : 720, H = nar ? 236 : 250, x0 = nar ? 26 : 34, x1 = W - 8, y0 = 18, y1 = nar ? 178 : 190, P = rows.filter((x) => x[1] > .01), h0 = Math.max(0, (P.length ? P[0][0] : 6) - 1), h1 = Math.min(24, (P.length ? P[P.length - 1][0] + 1 : 19) + 1), span = h1 - h0;
    const A = day === "today" ? this._spActH() : null, fc = Object.fromEntries(rows), mx = Math.max(.5, ...rows.map((x) => x[1]), ...(A ? Object.values(A) : [0])) * 1.12;
    const X = (h) => x0 + (h - h0) / span * (x1 - x0), Y = (v) => y1 - v / mx * (y1 - y0);
    const smooth = (p) => { let s = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`; for (let i = 0; i < p.length - 1; i++) { const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], d = p[i + 2] || c; s += ` C${(b[0] + (c[0] - a[0]) / 6).toFixed(1)},${(b[1] + (c[1] - a[1]) / 6).toFixed(1)} ${(c[0] - (d[0] - b[0]) / 6).toFixed(1)},${(c[1] - (d[1] - b[1]) / 6).toFixed(1)} ${c[0].toFixed(1)},${c[1].toFixed(1)}`; } return s; };
    const fp = []; for (let h = h0; h < h1; h++) fp.push([X(h + .5), Y(fc[h] || 0)]);
    const fl = smooth(fp), step = mx > 3 ? 1 : mx > 1.5 ? .5 : .25;
    let grid = ""; for (let v = 0; v <= mx; v += step) grid += `<line x1="${x0}" x2="${x1}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="spgl"/><text x="${x0 - 6}" y="${(Y(v) + 3.5).toFixed(1)}" class="spax" text-anchor="end">${num(v, step < 1 ? 1 : 0)}</text>`;
    let xs = ""; for (let h = h0; h < h1; h++) if ((h - h0) % (nar ? 3 : 2) === 0) xs += `<text x="${X(h + .5).toFixed(1)}" y="${y1 + 16}" class="spax" text-anchor="middle">${h}</text>`;
    const nh = C.nh, nowH = Math.floor(nh);
    let ah = "";
    if (A) { const ap = []; for (let h = h0; h <= Math.min(nowH, h1 - 1); h++) ap.push([X(h + .5), Y(A[h] || 0)]); if (ap.length > 1) { const l = smooth(ap); ah = `<path d="${l} L${ap[ap.length - 1][0].toFixed(1)},${y1} L${ap[0][0].toFixed(1)},${y1} Z" class="spaa"/><path d="${l}" class="spal"/><circle cx="${ap[ap.length - 1][0].toFixed(1)}" cy="${ap[ap.length - 1][1].toFixed(1)}" r="4.5" fill="#fff"/>`; } }
    const bd = S.best && ((day === "today" && S.best_day === "today") || (day === "tomorrow" && S.best_day === "tomorrow")) ? S.best : null, devs = this._spDevs();
    const best = bd ? `<rect x="${X(bd.from).toFixed(1)}" y="${y0}" width="${(X(bd.to) - X(bd.from)).toFixed(1)}" height="${y1 - y0}" class="spbz"/><rect x="${X(bd.from).toFixed(1)}" y="${y0}" width="${(X(bd.to) - X(bd.from)).toFixed(1)}" height="3" fill="#4ade80"/>` : "";
    /* Beschriftung und Geräte über den Kurven, mit Hintergrund, damit nichts verdeckt wird */
    const bw = bd ? Math.max(nar ? 96 : 118, devs.slice(0, 3).length * 28 + 12) : 0, bx = bd ? (X(bd.from) + X(bd.to)) / 2 - bw / 2 : 0;
    const bestTop = bd ? `<rect x="${bx.toFixed(1)}" y="${y0 + 5}" width="${bw}" height="${devs.length ? 50 : 22}" rx="9" class="spbbg"/><text x="${(bx + bw / 2).toFixed(1)}" y="${y0 + 20}" class="spbt" text-anchor="middle">${nar ? "Beste Zeit" : `Beste Zeit · ${this._spF(bd.kwh * C.cf)} kWh`}</text>
      ${devs.slice(0, 3).map((d, i, L) => this._gx(d.g, 24, { on: true }).replace("<svg ", `<svg x="${(bx + bw / 2 - L.length * 14 + i * 28 + 2).toFixed(1)}" y="${y0 + 27}" `)).join("")}` : "";
    const now = day === "today" && nh > h0 && nh < h1 ? `<line x1="${X(nh).toFixed(1)}" x2="${X(nh).toFixed(1)}" y1="${y0}" y2="${y1}" class="spnow"/><text x="${(X(nh) + 4).toFixed(1)}" y="${y1 - 6}" class="spax">jetzt</text>` : "";
    const Pr = day === "today" && this._m3Prices ? this._m3Prices() : null;
    const band = Pr ? (() => { let s = ""; for (let h = h0; h < h1; h++) { const v = Pr.v[Math.min(Pr.v.length - 1, Math.floor(h * 60 / Pr.step))]; if (v == null) continue; const r = v / Pr.avg, c = r <= .9 ? "#4ade80" : r <= .97 ? "#a3e635" : r <= 1.03 ? "#facc15" : r <= 1.1 ? "#fb923c" : "#f87171"; s += `<rect x="${(X(h) + 1).toFixed(1)}" y="${y1 + 26}" width="${(X(h + 1) - X(h) - 2).toFixed(1)}" height="8" rx="2" fill="${c}" opacity=".85"><title>${h} Uhr · ${num(v, 1)} ct</title></rect>`; } return s; })() : "";
    const sel = this._spH != null && fc[this._spH] != null ? this._spH : null;
    const hit = rows.map(([h]) => `<rect x="${X(h).toFixed(1)}" y="${y0}" width="${(X(h + 1) - X(h)).toFixed(1)}" height="${y1 - y0}" fill="transparent" data-act="spxh" data-k="${h}" style="cursor:pointer"><title>${h}:00 Uhr</title></rect>`).join("");
    const selm = sel != null ? `<rect x="${X(sel).toFixed(1)}" y="${y0}" width="${(X(sel + 1) - X(sel)).toFixed(1)}" height="${y1 - y0}" fill="rgba(255,255,255,.06)"/>` : "";
    const svg = `<svg class="spch${nar ? " nar" : ""}" viewBox="0 0 ${W} ${H - (band ? 0 : 30)}" role="img" aria-label="Prognose und Ertrag je Stunde">${grid}${best}${selm}<path d="${fl} L${fp[fp.length - 1][0].toFixed(1)},${y1} L${fp[0][0].toFixed(1)},${y1} Z" class="spfa"/><path d="${fl}" class="spfl"/>${ah}${now}${bestTop}${xs}${band}${hit}</svg>`;
    const det = sel != null ? `<div class="spdet"><b>${sel}–${sel + 1} Uhr</b> · Prognose ${num(fc[sel], 2)} kWh${A && A[sel] != null && sel <= nowH ? ` · Ertrag ${num(A[sel], 2)} kWh · <span class="${A[sel] >= fc[sel] ? "g" : "w"}">${A[sel] >= fc[sel] ? "+" : "−"}${num(Math.abs(A[sel] - fc[sel]), 2)} kWh</span>` : ""}${Pr ? ` · Strom ${num(Pr.v[Math.min(Pr.v.length - 1, Math.floor(sel * 60 / Pr.step))], 1)} ct` : ""}</div>` : `<div class="spdet mut">Tippe auf eine Stunde für die Werte</div>`;
    const leg = `<div class="spleg"><span><i class="lf"></i>Prognose${C.cf !== 1 ? ` (korrigiert ×${num(C.cf, 2)})` : ""}</span>${day === "today" ? `<span><i class="la"></i>Ertrag${A ? "" : " (braucht Langzeitstatistik)"}</span>` : ""}${bd ? `<span><i class="lb"></i>Beste Zeit</span>` : ""}${band ? `<span><i class="lp"></i>Strompreis günstig → teuer</span>` : ""}</div>`;
        const inWin = day === "today" && bd && nh >= bd.from && nh < bd.to, over = day === "today" && bd && nh >= bd.to;
    const rec = bd && devs.length && !over ? `<div class="sprec">${ic("clock", 16)}<span>${inWin ? `<b class="g">Jetzt</b> bis ${bd.to} Uhr` : `<b>${day === "tomorrow" ? "Morgen " : ""}${bd.from}–${bd.to} Uhr</b>`} lohnt sich für</span>${devs.map((d) => `<button class="sprb" data-act="mdgo" data-k="${d.m}" title="${esc(d.ml)} öffnen">${this._gx(d.g, 24, { on: true })}<span>${esc(d.n)}<small>${inWin ? "jetzt starten" : `Start ${bd.from}:00`}</small></span></button>`).join("")}</div>` : "";
    return svg + det + leg + rec;
  }
  /* ---------------- D1/D2 · Wie gut war die Prognose? (Stufe 3) ---------------- */
  _spHist(C) {
    const S = C.S, DAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"], n = [7, 14, 30].includes(this._spHn) ? this._spHn : 7, mode = this._spHm === "cal" ? "cal" : "bars";
    const all = (S.hist30 && S.hist30.length ? S.hist30 : S.hist || []), H = all.slice(-n), dv = (x) => (x.a != null && x.f > 0 ? Math.round((x.a - x.f) / x.f * 100) : null), cl = (d) => (d == null ? "" : Math.abs(d) <= 10 ? "g" : Math.abs(d) <= 20 ? "y" : "r");
    const ctl = `<div class="sphctl"><div class="seg oseg">${[7, 14, 30].map((k) => `<button class="${n === k ? "sel" : ""}" data-act="spxhn" data-k="${k}">${k} Tage</button>`).join("")}</div><div class="seg oseg">${[["bars", "Säulen"], ["cal", "Kalender"]].map(([k, l]) => `<button class="${mode === k ? "sel" : ""}" data-act="spxhm" data-k="${k}">${l}</button>`).join("")}</div></div>`;
    if (!H.length) return ctl + `<div class="mut" style="padding:12px 0">Noch keine abgeschlossenen Tage gespeichert.</div>`;
    const sel = H.find((x) => x.d === this._spDs);
    let body;
    if (mode === "bars") {
      const list = [...H.map((x) => ({ ...x, l: n > 14 ? new Date(x.d + "T12:00:00").getDate() + "." : DAYS[new Date(x.d + "T12:00:00").getDay()] })), ...(n === 7 ? [{ d: "", l: "Heute", f: C.raw, a: C.S.got, now: true }] : [])];
      const mx = Math.max(1, ...list.map((x) => Math.max(x.f || 0, x.a || 0)));
      body = `<div class="sphist${n > 14 ? " dense" : ""}">${list.map((x) => { const d = x.now ? null : dv(x);
        return `<button class="sphc${x.now ? " now" : ""}${sel && sel.d === x.d ? " sel" : ""}" ${x.now ? "" : `data-act="spxds" data-k="${x.d}"`} aria-label="${esc(x.l)}: Prognose ${num(x.f, 1)}, Ertrag ${x.a != null ? num(x.a, 1) : "–"} kWh"><span class="sphd ${cl(d)}">${d == null ? (x.now ? "läuft" : "") : (d > 0 ? "+" : "") + d + (n > 14 ? "" : " %")}</span><div class="sphb"><i class="f" style="height:${(x.f / mx * 100).toFixed(1)}%"></i>${x.a != null ? `<i class="a" style="height:${(x.a / mx * 100).toFixed(1)}%"></i>` : ""}</div><small>${x.l}</small>${n > 14 ? "" : `<em>${x.a != null ? num(x.a, 1) : "–"}</em>`}</button>`; }).join("")}</div>
        <div class="spleg"><span><i class="lf"></i>Prognose (Morgen-Stand, wie geliefert)</span><span><i class="la"></i>Ertrag</span><span>±10 % grün · ±20 % gelb · darüber rot</span></div>`;
    } else {
      /* D2 Kalender: Wochen untereinander, Mo–So, ein Kästchen je Tag */
      const byd = Object.fromEntries(H.map((x) => [x.d, x])), last = new Date(), first = new Date(); first.setDate(last.getDate() - n);
      const st = new Date(first); st.setDate(st.getDate() - ((st.getDay() + 6) % 7));
      let cells = ""; for (let t = new Date(st); t <= last; t.setDate(t.getDate() + 1)) { const k = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`, x = byd[k], d = x ? dv(x) : null;
        cells += x ? `<button class="spcd ${cl(d) || "n"}${sel && sel.d === k ? " sel" : ""}" data-act="spxds" data-k="${k}" title="${t.toLocaleDateString("de-DE")}: ${d == null ? "ohne Ertrag" : (d > 0 ? "+" : "") + d + " %"}"><b>${t.getDate()}</b><small>${d == null ? "–" : (d > 0 ? "+" : "") + d}</small></button>` : `<span class="spcd e"><b>${t.getDate()}</b></span>`; }
      body = `<div class="spcal">${["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((w) => `<i>${w}</i>`).join("")}${cells}</div><div class="spleg"><span><i style="background:#4ade80"></i>getroffen (±10 %)</span><span><i style="background:#facc15"></i>knapp (±20 %)</span><span><i style="background:#f87171"></i>deutlich daneben</span></div>`;
    }
    return ctl + body + (sel ? this._spDay1(sel) : `<div class="spdet mut">Tippe auf einen Tag für Details</div>`);
  }
  /* Ein Tag im Detail: Kurve Prognose (Morgen-Stand) gegen Ertrag je Stunde, wenn gespeichert (Stufe 2: 30 Tage) */
  _spDay1(x) {
    const d = x.a != null && x.f > 0 ? Math.round((x.a - x.f) / x.f * 100) : null, dt = new Date(x.d + "T12:00:00").toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
    const head = `<b>${esc(dt)}</b> · Prognose ${num(x.f, 1)} kWh · Ertrag ${x.a != null ? num(x.a, 1) + " kWh" : "–"}${d != null ? ` · <span class="${Math.abs(d) <= 10 ? "g" : "w"}">${d > 0 ? "+" : ""}${d} %</span>` : ""}`;
    if (!(x.fh && x.fh.length)) return `<div class="spdet">${head}<div class="mut sm">Für diesen Tag ist keine Stundenkurve gespeichert (erst ab Build 4).</div></div>`;
    const W = 520, Hh = 120, f = Object.fromEntries(x.fh), a = Object.fromEntries(x.ah || []), hs = Object.keys(f).map(Number), h0 = Math.min(...hs), h1 = Math.max(...hs) + 1, mx = Math.max(.3, ...Object.values(f), ...Object.values(a)) * 1.1;
    const X = (h) => 10 + (h - h0) / (h1 - h0) * (W - 20), Y = (v) => Hh - 16 - v / mx * (Hh - 26);
    const line = (o, close) => { const p = []; for (let h = h0; h < h1; h++) p.push(`${X(h + .5).toFixed(1)},${Y(o[h] || 0).toFixed(1)}`); return close ? `M${X(h0 + .5).toFixed(1)},${Hh - 16} L${p.join(" L")} L${X(h1 - .5).toFixed(1)},${Hh - 16} Z` : `M${p.join(" L")}`; };
    return `<div class="spdet">${head}<svg viewBox="0 0 ${W} ${Hh}" class="spd1"><path d="${line(f, true)}" class="spfa"/><path d="${line(f)}" class="spfl"/>${Object.keys(a).length ? `<path d="${line(a, true)}" class="spaa"/><path d="${line(a)}" class="spal"/>` : ""}${Array.from({ length: h1 - h0 }, (_, i) => h0 + i).filter((h) => h % 3 === 0).map((h) => `<text x="${X(h + .5).toFixed(1)}" y="${Hh - 2}" class="spax" text-anchor="middle">${h}</text>`).join("")}</svg></div>`;
  }
  /* E5: Ertrag deutlich unter der Prognose – Schnee auf den Modulen oder Anlage gestört? */
  _spLow(C) {
    const L = C.S.low; if (!L || C.night) return "";
    const out = this._haus && this._haus.wx && this._haus.wx.outdoor && this._hass.states[this._haus.wx.outdoor], t = out ? parseFloat(out.state) : NaN, snow = isFinite(t) && t <= 2;
    const ae = C.S.cfg.act;
    return `<div class="card splow">${this._gx("pvRoof", 44, { on: false })}<div><b>${snow ? "Schnee auf den Modulen?" : "Anlage liefert deutlich weniger als erwartet"}</b><span>${L.from}–${L.to} Uhr nur ${num(L.a, 1)} kWh statt ${num(L.f * C.cf, 1)} kWh (${L.pct} %).${snow ? ` Draußen ${num(t, 1)} °C – vermutlich liegt Schnee auf den Modulen.` : " Ist der Wechselrichter in Ordnung, oder zieht nur eine dichte Wolkendecke durch?"}</span></div>
      <div class="splowb">${ae ? `<button class="btn2" data-act="spxmore" data-k="${esc(ae)}">Ertrag prüfen</button>` : ""}${this._m3Has("en") ? `<button class="btn2" data-act="mdgo" data-k="en">Modul 3</button>` : ""}</div></div>`;
  }
  /* ---------------- Seite ---------------- */
  _spPage2() {
    const S = this._sp(), adm = this._admin(), vab = "";   /* v1.0: stabil, ohne Vorab-Hinweis */
    if (!this._spD) return `<div class="card empty">${ic("sun", 36)}<div style="margin-top:8px">Lade Prognose …</div></div>`;
    if (S.error) return `<div class="card empty">${ic("alert", 36)}<div style="margin-top:8px">Die Prognose konnte nicht geladen werden.</div></div>`;
    if (!S.found) return `<div class="card empty">${this._gx("forecast", 64, { on: true })}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Noch keine Prognose da</div>Wähle in den Einstellungen die Quelle. Am einfachsten geht es mit der Integration Forecast.Solar.${adm ? `<div style="margin-top:12px"><button class="btn2" data-act="spxopen">${ic("sliders", 16)}Einstellungen öffnen</button></div>` : ""}</div>${vab}`;
    const C = this._spCalc(), day = this._spDay === "tomorrow" || (this._spDay == null && C.night) ? "tomorrow" : "today";
    if (this._tmOn && this._tmOn()) return this._spWall(C);   /* E7: Tablet-Wand */
    const seg = `<div class="spseg"><button class="${day === "today" ? "on" : ""}" data-act="spxday" data-k="today">Heute</button><button class="${day === "tomorrow" ? "on" : ""}" data-act="spxday" data-k="tomorrow">Morgen</button><span class="mut sm">kWh je Stunde</span></div>`;
    return `<div class="spx${this.style.colorScheme === "light" ? " lt" : ""}">${this._spDupBox()}${this._spLow(C)}${this._spTiles(C)}
      <div class="card spcard"><h2>${ic("chart", 18)}Prognose und Ertrag über den Tag</h2>${seg}${this._spChart(C, day)}</div>
      ${this._spSites(C)}
      <div class="card spcard"><h2>${ic("chart", 18)}Wie gut war die Prognose?</h2>${this._spHist(C)}<div class="mut sm" style="margin-top:6px">Quelle: ${esc(S.src || "–")}${(S.sites || []).length ? " · " + S.sites.map(esc).join(", ") : ""}</div></div></div>`;
  }
