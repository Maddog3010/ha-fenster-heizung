  /* ================= Modul 1 · Raumkarte 2.0 (Konzept „Neue Optik“, Teil B, D und G3) =================
     Bild oben, Zahl in der Mitte, Rest im Menü „⋯“. Raumbilder als Vektorgrafik (7 Raumtypen + Messraum),
     der Zustand ist als Licht, Fenster und Heizkörper im Bild zu sehen. Eigene Fotos haben Vorrang.
     Einstellungen: layout.rk = { old: Raumkarten wie bisher, anim: aus | dezent | voll }, layout.rtype = { Raum-ID: Raumtyp }.
     Gegen Flackern (K4): Das Raumbild trägt data-kk (Raum, Typ, Zustand, Tag/Nacht). Ändert sich nur die Temperatur,
     bleibt das alte Bild im DOM stehen (siehe _render), Bewegungen laufen ohne Sprung weiter. */
  static RK_TYPES = [["wohnen", "Wohnzimmer"], ["schlafen", "Schlafzimmer"], ["bad", "Bad"], ["kind", "Kinderzimmer"], ["kueche", "Küche"], ["buero", "Büro"], ["flur", "Flur / Ankleide"], ["esszimmer", "Esszimmer"], ["wintergarten", "Wintergarten"], ["hwr", "Keller / Hauswirtschaft"], ["werkstatt", "Werkstatt / Hobby"], ["fitness", "Fitness"], ["dachboden", "Dachboden"], ["garage", "Garage"], ["carport", "Carport / Außen"]];
  static RK_COL = { heizt: "#fb923c", ok: "#2dd4bf", offen: "#60a5fa", gekippt: "#60a5fa", pause: "#f59e0b", nacht: "#a78bfa", hoff: "#94a3b8", aus: "#94a3b8" };
  /* Animationen: eine Einstellung für alle Module (Aus · Dezent · Voll); im Tablet-Modus eigene Stufe, Standard „Aus“ */
  _rkCfg() { const k = this._cfg.layout.rk || {}, A = ["aus", "dezent", "voll"], norm = A.includes(k.anim) ? k.anim : "dezent", tab = A.includes(k.tanim) ? k.tanim : "aus", tm = !!(this._tmOn && this._tmOn()); return { old: !!k.old || this._gxCfg().classic, anim: tm ? tab : norm, norm, tab, tm }; }
  _animLook() {
    const c = this._rkCfg(), seg = (cur, act) => `<div class="seg oseg">${[["aus", "Aus"], ["dezent", "Dezent"], ["voll", "Voll"]].map(([k, l]) => `<button class="${cur === k ? "sel" : ""}" data-act="${act}" data-k="${k}">${l}</button>`).join("")}</div>`;
    return `<div class="ltog rkan"><span>Animationen<small class="mut" style="display:block">Gilt für alle Module: Raumbilder, Szenen, Energiefluss. „Bewegung reduzieren“ am Gerät wird immer beachtet. Nicht sichtbare Bilder halten an.</small></span>${seg(c.norm, "rkanim")}</div>
      <div class="ltog rkan"><span>Animationen im Tablet-Modus<small class="mut" style="display:block">Für Wand-Tablets. Standard: Aus.</small></span>${seg(c.tab, "rktanim")}</div>`;
  }
  _rkOn() { return !this._rkCfg().old; }
  _rkTypeAuto(r) {
    const n = String(r.name || "").toLowerCase();
    const R = [[/carport|unterstand|terrass|au(ß|ss)en|garten|balkon|vordach/, "carport"], [/garage/, "garage"], [/dachboden|spitzboden|speicher|dachgeschoss/, "dachboden"],
      [/keller|hwr|hauswirt|wasch|abstell|vorrat|heizungsraum|technik/, "hwr"], [/werkstatt|werkraum|hobby|bastel/, "werkstatt"], [/fitness|sport|gym|trainings/, "fitness"],
      [/wintergarten/, "wintergarten"], [/esszimmer|essbereich|essecke|speisezimmer/, "esszimmer"],
      [/ankleid|garderob|flur|diele|eingang|trepp/, "flur"], [/kind|baby|spiel|jugend|'s zimmer|s zimmer$/, "kind"],
      [/bad|dusch|\bwc\b|toilett|wanne|sauna/, "bad"], [/k[üu]e?che|kitchen|koch/, "kueche"], [/schlaf|g[äa]st|bedroom/, "schlafen"],
      [/b[üu]e?ro|arbeit|office|studio|bibliothek|computer/, "buero"], [/wohn|stube|living|kamin|tv|kino|lounge/, "wohnen"]];
    for (const [re, k] of R) if (re.test(n)) return k;
    if (r.nameOnly) return null;
    const I = { bed: "schlafen", suitcase: "schlafen", baby: "kind", blocks: "kind", bath: "bad", shower: "bad", toilet: "bad", pot: "kueche", dining: "esszimmer", fridge: "kueche", wine: "kueche",
      desk: "buero", tools: "werkstatt", music: "buero", door: "flur", hanger: "flur", stairs: "flur", crate: "hwr", laundry: "hwr", sofa: "wohnen", fireplace: "wohnen", tv: "wohnen",
      dumbbell: "fitness", roof: "dachboden", car: "garage", tree: "carport", balcony: "carport", sun: "wintergarten", radiator: "hwr", wave: "bad" };
    return I[(this._cfg.layout.icons || {})[r.id]] || "wohnen";
  }
  _rkType(r) { const t = (this._cfg.layout.rtype || {})[r.id]; return this.constructor.RK_TYPES.some((x) => x[0] === t) ? t : this._rkTypeAuto(r); }
  _rkTypeName(k) { return (this.constructor.RK_TYPES.find((x) => x[0] === k) || [k, k])[1]; }
  /* Temperaturskala (Konzept Seite 3): kühl = blau, angenehm = türkis, warm = orange. lo/hi aus den eigenen Heizplan-Temperaturen. */
  _rkCol(t, lo = 17, hi = 21) {
    if (t == null || !isFinite(t)) return "#64748b";
    if (hi - lo < 1) lo = hi - 3;
    const S = [[lo - 3, [59, 130, 246]], [lo, [56, 189, 248]], [hi - 0.3, [45, 212, 191]], [hi + 1.5, [251, 191, 36]], [hi + 3.5, [249, 115, 22]]];
    if (t <= S[0][0]) return `rgb(${S[0][1]})`;
    for (let i = 0; i < S.length - 1; i++) {
      const [a, ca] = S[i], [b, cb] = S[i + 1];
      if (t <= b) { const k = (t - a) / (b - a); return `rgb(${ca.map((v, j) => Math.round(v + (cb[j] - v) * k)).join(",")})`; }
    }
    return `rgb(${S[S.length - 1][1]})`;
  }
  _rkWin(st) {
    const s = String(st && st.state || "").toLowerCase();
    return ["tilted", "tilt", "gekippt", "kipp", "vented"].includes(s) ? "tilt" : ["on", "open", "opened", "offen", "true"].includes(s) ? "open" : "closed";
  }
  /* Alles, was Bild, Ring und Zeilen brauchen, an einer Stelle */
  _rkState(r) {
    const h = this._hass, C = this.constructor.RK_COL;
    const wins = (r.windows || []).map((e) => h.states[e]).filter(Boolean), ws = wins.map((w) => ({ w, k: this._rkWin(w) }));
    const open = ws.filter((x) => x.k === "open"), tilt = ws.filter((x) => x.k === "tilt"), anyOpen = open.length + tilt.length;
    const since = anyOpen ? Math.min(...[...open, ...tilt].map((x) => new Date(x.w.last_changed || Date.now()).getTime())) : 0;
    const th = (r.thermos || []).map((e) => h.states[e]).filter(Boolean), t0 = th[0], rt = this._rt(r, "show"), cur = rt.t;
    const g = r.reg, ziel = g && g.ziel != null ? Number(g.ziel) : t0 && t0.attributes.temperature != null ? Number(t0.attributes.temperature) : null;
    const p0 = this._cfg.plans[r.id] || { enabled: false, entries: [] }, pts = points(p0.entries), now = nowMin(), today = Math.floor(now / 1440);
    const away = this._away(), summer = this._sum().active, planOn = !!((r.planOn ?? p0.enabled) && !away && !summer);
    const temps = pts.map((p) => p.t), lo = temps.length ? Math.min(...temps) : 17, hi = temps.length ? Math.max(...temps) : 21;
    const curPlan = pts.length ? at(pts, now) : null;
    const act = t0 ? t0.attributes.hvac_action : null, thOff = !t0 || t0.state === "off";
    const heating = !thOff && r.mode !== "heizung_pausiert" && !anyOpen && (act ? act === "heating" : cur != null && ziel != null && cur < ziel - 0.3);
    const prOn = !!(r.pres && r.pres.anwesend && !r.pres.gesperrt);
    const lowered = !prOn && (away || (planOn && curPlan != null && hi - lo >= 1 && curPlan <= lo + 0.05));
    const sun = h.states["sun.sun"], night = sun ? sun.state === "below_horizon" : (new Date().getHours() < 7 || new Date().getHours() >= 19);
    const mins = since ? Math.max(0, Math.round((Date.now() - since) / 60000)) : 0, pv = this._pres();
    let k, lab;
    if (r.mode === "regelung_aus") { k = "aus"; lab = "Regelung aus"; }
    else if (open.length) { k = "offen"; lab = `Fenster offen · ${mins} Min.`; }
    else if (tilt.length) { k = "gekippt"; lab = `Fenster gekippt · ${mins} Min.`; }
    else if (r.mode === "heizung_pausiert") { k = "pause"; lab = "Pausiert"; }
    else if (r.mode === "nur_fenstermeldung") { k = "hoff"; lab = "Heizung aus"; }
    else if (heating) { k = "heizt"; lab = "Heizt"; }
    else if (lowered) { k = "nacht"; lab = away ? (pv.effective === "vacation" || pv.mode === "vacation" ? "Urlaub" : "Abwesend") : night ? "Nachtabsenkung" : "Absenkung"; }
    else { k = "ok"; lab = ziel != null && cur != null && cur >= ziel - 0.3 ? "Ziel erreicht" : "Regelung aktiv"; }
    const hum = r.humEid && h.states[r.humEid] ? parseFloat(h.states[r.humEid].state) : null;
    const htr = r.htr || null, lfs = this._lfDevs().filter((d) => d.S.loc === r.id), pres = r.pres || null, here = !!(pres && pres.anwesend);
    if (here && k === "heizt") lab = "Heizt · jemand da";
    else if (here && k === "ok") lab = "Jemand da";
    return { k, lab, col: C[k], htr, lfs, pres, here, wins, open, tilt, anyOpen, since, mins, t0, th, thOff, rt, cur, ziel, act, heating, pts, now, today, planOn, lo, hi, curPlan, night, away, summer, hum: isFinite(hum) ? hum : null };
  }

  /* ---------- Raumbild (Vektor) ---------- */
  _rkArt(type, s, o = {}) {
    const u = "rk" + (this.constructor._gxN = ((this.constructor._gxN || 0) + 1) % 1e6) + "_", q = (n) => u + n;
    const col = s.col, k = s.k, night = s.night, heat = k === "heizt", warm = heat || (s.t0 && s.act === "heating" && !s.anyOpen && k !== "pause");
    const winK = s.open.length ? "open" : s.tilt.length ? "tilt" : "closed", mess = type === "mess" || !!o.ms, outd = type === "carport", norad = type === "garage" || outd;
    const lg = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${q(id)}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([of, c, a]) => `<stop offset="${of}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ""}/>`).join("")}</linearGradient>`;
    const W = "var(--rk-w)", F = "var(--rk-f)", T = "var(--rk-t)";
    /* Lampe je Raumtyp: [x, y] des Lichts */
    const LP = { wohnen: [300, 52], schlafen: [142, 80], bad: [230, 18], kind: [258, 34], kueche: [250, 56], buero: [282, 64], flur: [165, 28], mess: [240, 30], esszimmer: [220, 40], wintergarten: [250, 30], hwr: [180, 22], werkstatt: [230, 30], fitness: [260, 26], dachboden: [200, 40], garage: [170, 18], carport: [36, 56] }[type] || [260, 40];
    const glowA = { heizt: .5, ok: .34, offen: .4, gekippt: .32, pause: .34, nacht: .42, hoff: .2, aus: 0 }[k] ?? .3;
    let d = `<defs>${lg("sky", night ? [[0, "#0b1530"], [1, "#1e2a52"]] : [[0, "#9fd3ff"], [1, "#e6f4ff"]])}
      <radialGradient id="${q("gl")}" cx="${(LP[0] + 60) / 440}" cy="${LP[1] / 150}" r=".5"><stop offset="0" stop-color="${col}" stop-opacity="${glowA}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>
      ${lg("rad", warm ? [[0, "#fed7aa"], [.5, "#fb923c"], [1, "#c2410c"]] : [[0, "#ffffff"], [1, "#cbd5e1"]], 1, 0)}
      ${lg("wood", [[0, "#c08552"], [1, "#7c4a24"]])}${lg("fl", [[0, "var(--rk-f)"], [1, "var(--rk-f2)"]])}
      ${lg("hw", [[0, "#f97316", .9], [1, "#f97316", 0]])}${lg("scr", [[0, "#0ea5e9"], [1, "#0369a1"]])}</defs>`;
    /* Raum: Wand, Boden, Sockelleiste */
    d += `<rect x="-60" width="440" height="150" style="fill:${W}"/><rect x="-60" y="112" width="440" height="38" fill="url(#${q("fl")})"/><rect x="-60" y="110" width="440" height="3" style="fill:${T}"/>`;
    d += [-20, 40, 100, 160, 220, 280, 340].map((x) => `<path d="M${x} 113 L${x - 16 + (x - 160) * .25} 150" style="stroke:${T}" stroke-width=".8" opacity=".35"/>`).join("");
    if (outd) {
      const frost = this._out().t != null && this._out().t <= 0;
      d += `<rect x="-60" width="440" height="112" fill="url(#${q("sky")})"/>` + (night ? `<circle cx="300" cy="22" r="8" fill="#fef3c7"/><circle cx="303" cy="19" r="7" fill="#1a2547"/>${[[120, 14], [180, 30], [250, 10], [330, 40], [200, 8]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1" fill="#fff" opacity=".8"/>`).join("")}` : `<circle cx="300" cy="22" r="9" fill="#fde68a"/><path d="M150 26 q8 -10 17 -3 q8 -8 16 1 q7 -1 8 6 h-41z" fill="#fff" opacity=".85"/>`) +
        `<path d="M-60 96 q60 -12 120 -2 q70 -12 140 0 q80 -12 180 0 V112 H-60z" fill="${night ? "#1f3b2c" : "#4ade80"}" opacity=".7"/><rect x="-60" y="104" width="440" height="8" fill="${night ? "#1d3328" : "#22c55e"}" opacity=".6"/>` +
        `<rect x="-60" y="112" width="440" height="38" fill="${night ? "#2b3138" : "#9ca3af"}"/>${[118, 126, 134, 142].map((y) => `<path d="M-60 ${y} H380" stroke="#6b7280" stroke-width=".7" opacity=".6"/>`).join("")}` +
        `<rect x="-60" y="10" width="110" height="102" fill="${night ? "#4b4038" : "#e7d8c3"}"/><rect x="-60" y="4" width="116" height="8" fill="#7f1d1d"/><rect x="6" y="52" width="26" height="60" rx="2" fill="#7c4a24"/><circle cx="27" cy="83" r="1.6" fill="#fde68a"/>` +
        `<rect x="66" y="16" width="270" height="7" fill="#8a5a2b"/><rect x="66" y="12" width="270" height="4" fill="#5b3a1e"/>${frost ? `<rect x="64" y="8" width="274" height="5" rx="2.5" fill="#f8fafc"/>` : ""}` +
        [76, 200, 324].map((x) => `<rect x="${x}" y="23" width="6" height="94" fill="url(#${q("wood")})"/>`).join("") + `<ellipse cx="200" cy="128" rx="96" ry="6" fill="#000" opacity=".2"/>`;
    }
    /* Fenster */
    if (!outd) {
    const wx = 28, wy = 20, ww = 70, wh = 64, mid = wx + ww / 2;
    d += `<rect x="${wx - 4}" y="${wy - 4}" width="${ww + 8}" height="${wh + 8}" rx="4" fill="#e2e8f0" stroke="#64748b" stroke-opacity=".45"/><rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="url(#${q("sky")})"/>`;
    d += night ? `<circle cx="${wx + 52}" cy="${wy + 16}" r="7" fill="#fef3c7"/><circle cx="${wx + 55}" cy="${wy + 13}" r="6" fill="#1a2547"/>${[[10, 10], [22, 26], [40, 8], [14, 44], [58, 40]].map(([x, y]) => `<circle cx="${wx + x}" cy="${wy + y}" r=".9" fill="#fff" opacity=".85"/>`).join("")}`
      : `<circle cx="${wx + 52}" cy="${wy + 16}" r="7" fill="#fde68a" opacity=".9"/><path d="M${wx + 8} ${wy + 40} q6 -8 13 -2 q6 -6 12 1 q5 -1 6 5 h-31z" fill="#fff" opacity=".9"/><path d="M${wx} ${wy + wh} l18 -16 l14 10 l20 -18 l18 24z" fill="#86c5a0" opacity=".55"/>`;
    d += `<rect x="${wx}" y="${wy}" width="${ww / 2}" height="${wh}" fill="none" stroke="#f8fafc" stroke-width="3"/><path d="M${wx + 4} ${wy + 30} L${wx + 22} ${wy + 6}" stroke="#fff" stroke-width="3" opacity=".25"/>`;
    if (winK === "closed") d += `<rect x="${mid}" y="${wy}" width="${ww / 2}" height="${wh}" fill="none" stroke="#f8fafc" stroke-width="3"/><rect x="${mid + 4}" y="${wy + wh / 2 - 4}" width="2.2" height="8" rx="1" fill="#64748b"/>`;
    else if (winK === "open") d += `<path d="M${mid} ${wy - 1} L${mid + 30} ${wy + 9} L${mid + 30} ${wy + wh - 3} L${mid} ${wy + wh + 1}z" fill="#e0f2fe" fill-opacity=".35" stroke="#f8fafc" stroke-width="3" stroke-linejoin="round"/><rect x="${mid + 25}" y="${wy + wh / 2}" width="2.2" height="8" rx="1" fill="#64748b"/>`;
    else d += `<path d="M${mid + 7} ${wy + 6} L${mid + ww / 2 + 7} ${wy + 6} L${mid + ww / 2} ${wy + wh} L${mid} ${wy + wh}z" fill="#e0f2fe" fill-opacity=".3" stroke="#f8fafc" stroke-width="3" stroke-linejoin="round"/><path d="M${mid} ${wy} L${mid + 7} ${wy + 6} M${mid + ww / 2} ${wy} L${mid + ww / 2 + 7} ${wy + 6}" stroke="#94a3b8" stroke-width="1.4"/>`;
    d += `<rect x="${wx - 7}" y="${wy + wh + 3}" width="${ww + 14}" height="4" rx="2" fill="#cbd5e1"/>`;
    if (winK !== "closed") d += `<g class="aw">${[0, 1, 2].slice(0, winK === "open" ? 3 : 2).map((i) => `<path class="aw${i}" d="M${mid + 14} ${wy + 18 + i * 14} q10 -5 20 0 t20 0" fill="none" stroke="#7dd3fc" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>`).join("")}</g>`;
    }
    /* Heizkörper (Messraum: Sensor statt Heizkörper; Garage und Carport ohne) */
    if (!mess && !norad) {
      const rx = 32, ry = 92;
      d += `<rect x="${rx}" y="${ry}" width="62" height="3.5" rx="1.7" fill="${warm ? "#ea580c" : "#94a3b8"}"/>` + [0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${rx + 1 + i * 8.6}" y="${ry + 1}" width="6.4" height="17" rx="3" fill="url(#${q("rad")})"/>`).join("") +
        `<circle cx="${rx + 66}" cy="${ry + 12}" r="3.6" fill="${k === "pause" ? "#f59e0b" : warm ? "#fbbf24" : "#64748b"}" stroke="#fff" stroke-width="1.2"/>`;
      if (warm) d += `<g class="hw">${[0, 1, 2].map((i) => `<path class="hw${i}" d="M${rx + 12 + i * 19} ${ry - 3} q-4 -5 0 -10 q4 -5 0 -10" fill="none" stroke="url(#${q("hw")})" stroke-width="2.6" stroke-linecap="round"/>`).join("")}</g>`;
    }
    /* Möbel je Raumtyp */
    const lamp = (x, y, sh = 1) => `<g class="lg"><circle cx="${x}" cy="${y}" r="${16 * sh}" fill="${col}" opacity="${k === "aus" ? 0 : .22}"/></g>`;
    const plant = (x, y, s2 = 1) => `<path d="M${x - 6 * s2} ${y} h${12 * s2} l-2 ${12 * s2} h${-8 * s2}z" fill="#b45309"/><path d="M${x} ${y} q-12 -8 -9 -20 q7 6 9 20 q2 -16 11 -20 q2 12 -11 20 q-2 -12 -1 -24 q6 10 1 24" fill="#22c55e"/>`;
    const frame = (x, y, w2, h2) => `<rect x="${x}" y="${y}" width="${w2}" height="${h2}" rx="2" fill="#f8fafc" opacity=".9"/><rect x="${x + 3}" y="${y + 3}" width="${w2 - 6}" height="${h2 - 6}" fill="#bfdbfe"/><path d="M${x + 3} ${y + h2 - 3} l${w2 * .3} ${-h2 * .45} l${w2 * .2} ${h2 * .25} l${w2 * .2} ${-h2 * .3} l${w2 * .3 - 6} ${h2 * .5}z" fill="#60a5fa"/><circle cx="${x + w2 * .72}" cy="${y + h2 * .32}" r="${h2 * .1}" fill="#fde68a"/>`;
    const car = (x, y, c = "#2563eb") => `<ellipse cx="${x + 80}" cy="${y + 36}" rx="84" ry="4" fill="#000" opacity=".25"/><path d="M${x} ${y + 26} q0 -12 12 -14 l20 -3 q14 -14 34 -16 h34 q18 1 30 14 l18 4 q12 3 12 15 v8 h-160z" fill="${c}"/>` +
      `<path d="M${x + 38} ${y + 8} q12 -11 28 -12 h12 v13z M${x + 84} ${y - 4} h8 q14 1 24 13 h-32z" fill="#bfdbfe" opacity=".9"/><rect x="${x}" y="${y + 24}" width="160" height="3" fill="#000" opacity=".15"/>` +
      [x + 34, x + 128].map((cx) => `<circle cx="${cx}" cy="${y + 34}" r="11" fill="#1f2937"/><circle cx="${cx}" cy="${y + 34}" r="5" fill="#cbd5e1"/>`).join("") + `<rect x="${x + 152}" y="${y + 18}" width="7" height="4" rx="2" fill="#fde68a"/><rect x="${x + 1}" y="${y + 18}" width="5" height="4" rx="2" fill="#f87171"/>`;
    const F1 = {
      wohnen: () => frame(160, 24, 56, 36) + `<ellipse cx="215" cy="134" rx="92" ry="8" style="fill:${T}" opacity=".5"/>` +
        `<rect x="140" y="76" width="148" height="28" rx="10" fill="#4f6d8a"/><rect x="148" y="80" width="64" height="22" rx="8" fill="#6b8bab"/><rect x="216" y="80" width="64" height="22" rx="8" fill="#6b8bab"/>` +
        `<rect x="132" y="96" width="164" height="22" rx="8" fill="#5b7a99"/><rect x="128" y="88" width="16" height="32" rx="7" fill="#4a6683"/><rect x="284" y="88" width="16" height="32" rx="7" fill="#4a6683"/>` +
        `<rect x="152" y="86" width="18" height="15" rx="5" fill="#f59e0b"/><rect x="258" y="86" width="18" height="15" rx="5" fill="#2dd4bf"/><rect x="140" y="119" width="4" height="7" fill="#334155"/><rect x="284" y="119" width="4" height="7" fill="#334155"/>` +
        lamp(300, 52) + `<path d="M300 58 v62 M292 122 h16" stroke="#94a3b8" stroke-width="2.4"/><path d="M290 40 h20 l5 16 h-30z" fill="${k === "aus" ? "#cbd5e1" : col}" opacity=".95"/>` + plant(116, 108, .8),
      schlafen: () => frame(214, 22, 50, 32) + `<rect x="168" y="66" width="132" height="44" rx="8" fill="url(#${q("wood")})"/><rect x="164" y="98" width="140" height="18" rx="6" fill="#f1f5f9"/>` +
        `<path d="M206 94 h96 v26 h-96z" fill="#6366f1"/><path d="M206 94 h96 v6 h-96z" fill="#818cf8"/><rect x="172" y="88" width="30" height="12" rx="6" fill="#ffffff"/><rect x="170" y="116" width="5" height="10" fill="#5b3a1e"/><rect x="295" y="116" width="5" height="10" fill="#5b3a1e"/>` +
        `<rect x="126" y="96" width="32" height="28" rx="3" fill="url(#${q("wood")})"/><path d="M130 110 h24" stroke="#5b3a1e" stroke-width="1.2"/>` + lamp(142, 80, .9) + `<path d="M142 84 v12" stroke="#94a3b8" stroke-width="2"/><path d="M133 72 h18 l3 12 h-24z" fill="${k === "aus" ? "#cbd5e1" : col}"/>`,
      bad: () => `<g opacity=".5">${[64, 76, 88, 100].map((y) => `<path d="M118 ${y} H320" style="stroke:${T}" stroke-width=".9"/>`).join("")}${[130, 150, 170, 190, 210, 230, 250, 270, 290, 310].map((x) => `<path d="M${x} 58 V110" style="stroke:${T}" stroke-width=".9"/>`).join("")}</g>` +
        `<rect x="118" y="58" width="202" height="2" style="fill:${T}"/><ellipse cx="230" cy="40" rx="20" ry="16" fill="#e2e8f0"/><ellipse cx="230" cy="40" rx="16.5" ry="12.5" fill="#bfdbfe"/><path d="M220 34 l10 -6" stroke="#fff" stroke-width="2" opacity=".6"/>` +
        lamp(230, 18, .9) + `<rect x="218" y="14" width="24" height="5" rx="2.5" fill="${k === "aus" ? "#cbd5e1" : col}"/>` +
        `<path d="M160 92 h140 v10 q0 22 -24 22 h-92 q-24 0 -24 -22z" fill="#f8fafc" stroke="#94a3b8" stroke-opacity=".6"/><rect x="156" y="88" width="148" height="7" rx="3.5" fill="#e2e8f0"/><path d="M164 95 h132" stroke="#7dd3fc" stroke-width="3" opacity=".8"/>` +
        `<path d="M290 88 v-16 q0 -6 -6 -6 h-6" fill="none" stroke="#94a3b8" stroke-width="3"/><rect x="172" y="122" width="5" height="6" fill="#94a3b8"/><rect x="284" y="122" width="5" height="6" fill="#94a3b8"/>` +
        `<path d="M128 66 h18" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/><rect x="130" y="66" width="14" height="30" rx="2" fill="#2dd4bf"/><path d="M130 88 h14" stroke="#fff" stroke-width="2" opacity=".6"/>`,
      kind: () => `<path d="M112 12 q100 18 208 0" fill="none" stroke="#94a3b8" stroke-width="1"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const x = 124 + i * 25, y = 14 + Math.sin((i + .5) / 8 * Math.PI) * 9; return `<path d="M${x} ${y} l7 0 l-3.5 9z" fill="${["#f472b6", "#fbbf24", "#60a5fa", "#34d399"][i % 4]}"/>`; }).join("") +
        `<rect x="140" y="34" width="34" height="44" rx="3" fill="#1e293b" opacity=".85"/><path d="M157 42 q8 8 6 22 h-12 q-2 -14 6 -22z" fill="#f8fafc"/><circle cx="157" cy="54" r="3" fill="#60a5fa"/><path d="M151 64 l-4 6 h6z M163 64 l4 6 h-6z" fill="#f87171"/><path d="M155 70 l2 5 l2 -5z" fill="#fbbf24"/><circle cx="146" cy="40" r="1" fill="#fff"/><circle cx="168" cy="72" r="1" fill="#fff"/>` +
        `<rect x="196" y="78" width="104" height="36" rx="6" fill="#fbcfe8"/><rect x="200" y="96" width="98" height="18" rx="5" fill="#f8fafc"/><path d="M226 92 h72 v24 h-72z" fill="#f472b6"/>${[232, 246, 260, 274, 288].map((x) => `<rect x="${x}" y="92" width="6" height="24" fill="#fbbf24" opacity=".8"/>`).join("")}<rect x="204" y="88" width="20" height="10" rx="5" fill="#fff"/><rect x="200" y="114" width="4" height="10" fill="#9d174d"/><rect x="292" y="114" width="4" height="10" fill="#9d174d"/>` +
        `<rect x="132" y="106" width="18" height="18" rx="2" fill="#60a5fa"/><rect x="152" y="106" width="18" height="18" rx="2" fill="#fbbf24"/><rect x="142" y="88" width="18" height="18" rx="2" fill="#f87171"/><text x="141" y="119" font-size="11" font-weight="700" fill="#fff" text-anchor="middle" font-family="system-ui,sans-serif">A</text><text x="161" y="119" font-size="11" font-weight="700" fill="#fff" text-anchor="middle" font-family="system-ui,sans-serif">B</text><text x="151" y="101" font-size="11" font-weight="700" fill="#fff" text-anchor="middle" font-family="system-ui,sans-serif">C</text>` +
        lamp(258, 34, .8) + `<circle cx="258" cy="40" r="8" fill="${k === "aus" ? "#cbd5e1" : col}"/><path d="M258 18 v14" stroke="#94a3b8" stroke-width="1.5"/>`,
      kueche: () => `<g opacity=".45">${[64, 76].map((y) => `<path d="M118 ${y} H320" style="stroke:${T}" stroke-width=".9"/>`).join("")}${[140, 164, 188, 212, 236, 260, 284, 308].map((x) => `<path d="M${x} 56 V88" style="stroke:${T}" stroke-width=".9"/>`).join("")}</g>` +
        `<rect x="196" y="14" width="124" height="38" rx="3" fill="#f1f5f9" stroke="#94a3b8" stroke-opacity=".5"/>${[196, 238, 280].map((x) => `<rect x="${x + 2}" y="16" width="38" height="34" rx="2" fill="#e2e8f0"/><rect x="${x + 18}" y="42" width="8" height="2.4" rx="1" fill="#64748b"/>`).join("")}` +
        lamp(250, 56, 1.1) + `<rect x="200" y="52" width="116" height="3" fill="${k === "aus" ? "#cbd5e1" : col}"/>` +
        `<path d="M140 28 h48 l-6 18 h-36z" fill="#94a3b8"/><rect x="160" y="8" width="8" height="22" fill="#94a3b8"/>` +
        `<rect x="118" y="88" width="202" height="6" rx="2" fill="#475569"/><rect x="118" y="94" width="202" height="30" fill="#f1f5f9" stroke="#94a3b8" stroke-opacity=".5"/>${[118, 162, 206, 250].map((x) => `<rect x="${x + 2}" y="96" width="40" height="26" rx="2" fill="#e2e8f0"/><rect x="${x + 16}" y="99" width="12" height="2.4" rx="1" fill="#64748b"/>`).join("")}` +
        `<rect x="142" y="84" width="44" height="4" rx="1" fill="#1f2937"/><path d="M150 70 h28 v12 q0 4 -4 4 h-20 q-4 0 -4 -4z" fill="#ef4444"/><rect x="146" y="68" width="36" height="4" rx="2" fill="#b91c1c"/>` +
        plant(300, 76, .55),
      buero: () => `<rect x="126" y="22" width="52" height="4" fill="url(#${q("wood")})"/><rect x="126" y="48" width="52" height="4" fill="url(#${q("wood")})"/>${[["#ef4444", 8, 18], ["#3b82f6", 6, 20], ["#fbbf24", 7, 16], ["#10b981", 5, 19], ["#a78bfa", 7, 17]].map(([c, w2, h2], i, a) => { const x = 130 + a.slice(0, i).reduce((s2, z) => s2 + z[1] + 1.5, 0); return `<rect x="${x}" y="${22 - h2}" width="${w2}" height="${h2}" fill="${c}"/>`; }).join("")}${[["#0ea5e9", 9, 16], ["#f97316", 6, 18], ["#64748b", 8, 14]].map(([c, w2, h2], i) => `<rect x="${132 + i * 11}" y="${48 - h2}" width="${w2}" height="${h2}" fill="${c}"/>`).join("")}` +
        `<rect x="150" y="86" width="150" height="6" rx="2" fill="url(#${q("wood")})"/><rect x="156" y="92" width="5" height="34" fill="#5b3a1e"/><rect x="290" y="92" width="5" height="34" fill="#5b3a1e"/>` +
        `<rect x="202" y="50" width="62" height="34" rx="3" fill="#1f2937"/><rect x="205" y="53" width="56" height="27" rx="1.5" fill="url(#${q("scr")})" opacity="${k === "aus" ? .4 : 1}"/><path d="M209 74 l9 -7 l8 4 l9 -10 l10 6 l12 -8" fill="none" stroke="#a7f3d0" stroke-width="1.6"/><rect x="230" y="84" width="6" height="3" fill="#475569"/>` +
        `<path d="M212 104 h40" stroke="#334155" stroke-width="6" stroke-linecap="round"/><rect x="216" y="80" width="32" height="24" rx="6" fill="#334155"/><path d="M232 106 v14 M220 124 h24" stroke="#475569" stroke-width="3" stroke-linecap="round"/>` +
        lamp(282, 64, .9) + `<path d="M276 86 l6 -16 l-8 -6" fill="none" stroke="#94a3b8" stroke-width="2.4"/><path d="M266 58 l14 -4 l2 10z" fill="${k === "aus" ? "#cbd5e1" : col}"/>` + plant(124, 112, .7),
      flur: () => `<rect x="204" y="22" width="96" height="98" rx="3" fill="url(#${q("wood")})"/><path d="M252 24 v94" stroke="#5b3a1e" stroke-width="1.6"/><rect x="244" y="64" width="2.6" height="12" rx="1" fill="#fde68a"/><rect x="258" y="64" width="2.6" height="12" rx="1" fill="#fde68a"/><rect x="208" y="118" width="6" height="7" fill="#5b3a1e"/><rect x="290" y="118" width="6" height="7" fill="#5b3a1e"/>` +
        `<rect x="124" y="40" width="64" height="5" rx="2" fill="url(#${q("wood")})"/>${[136, 156, 176].map((x) => `<circle cx="${x}" cy="47" r="2.2" fill="#94a3b8"/>`).join("")}` +
        `<path d="M136 48 l-10 10 l2 36 h16 l2 -36z" fill="#0ea5e9"/><path d="M156 48 l-9 8 l1 30 h16 l1 -30z" fill="#f59e0b"/><path d="M176 48 q-6 4 -5 12 l-2 18 h14 l-1 -18 q1 -8 -6 -12z" fill="#a78bfa"/>` +
        `<rect x="124" y="104" width="66" height="6" rx="2" fill="url(#${q("wood")})"/><rect x="128" y="110" width="4" height="14" fill="#5b3a1e"/><rect x="182" y="110" width="4" height="14" fill="#5b3a1e"/><path d="M136 124 h14 q2 -6 -4 -6 h-10z M154 124 h14 q2 -6 -4 -6 h-10z" fill="#1f2937"/>` +
        lamp(165, 28, .9) + `<path d="M165 0 v20" stroke="#94a3b8" stroke-width="1.5"/><path d="M155 30 q10 -14 20 0z" fill="${k === "aus" ? "#cbd5e1" : col}"/>`,
      esszimmer: () => frame(250, 26, 46, 30) + lamp(220, 40, 1.1) + `<path d="M220 0 v30" stroke="#94a3b8" stroke-width="1.5"/><path d="M204 40 q16 -16 32 0z" fill="${k === "aus" ? "#cbd5e1" : col}"/>` +
        [150, 196, 242].map((x) => `<path d="M${x} 66 h20 v30" fill="none" stroke="#7c4a24" stroke-width="4" stroke-linecap="round"/>`).join("") +
        `<rect x="140" y="90" width="150" height="6" rx="2" fill="url(#${q("wood")})"/><rect x="148" y="96" width="5" height="28" fill="#5b3a1e"/><rect x="278" y="96" width="5" height="28" fill="#5b3a1e"/>` +
        `<ellipse cx="180" cy="89" rx="10" ry="2.5" fill="#f8fafc"/><ellipse cx="236" cy="89" rx="10" ry="2.5" fill="#f8fafc"/><rect x="204" y="78" width="6" height="11" rx="2" fill="#e2e8f0"/><path d="M216 84 q4 -8 8 0z" fill="#22c55e"/>` + plant(304, 112, .7),
      wintergarten: () => `<rect x="112" y="6" width="214" height="104" fill="url(#${q("sky")})" opacity=".85"/>${[112, 166, 220, 274, 326].map((x) => `<rect x="${x - 2}" y="6" width="4" height="104" fill="#f8fafc"/>`).join("")}<rect x="110" y="56" width="218" height="3" fill="#f8fafc"/><rect x="110" y="4" width="218" height="4" fill="#f8fafc"/>` +
        `<path d="M118 104 q30 -14 60 -6 q30 -12 60 -2" fill="#4ade80" opacity=".5"/>` + plant(140, 104, 1.4) + plant(300, 106, 1.2) +
        `<path d="M200 90 q0 -24 22 -24 q22 0 22 24 v14 h-44z" fill="#d6a76c"/><path d="M204 92 q18 -8 36 0 v10 h-36z" fill="#f1f5f9"/><rect x="204" y="104" width="4" height="18" fill="#a16207"/><rect x="236" y="104" width="4" height="18" fill="#a16207"/>` +
        `<ellipse cx="270" cy="112" rx="14" ry="3" fill="#a16207"/><rect x="268" y="112" width="4" height="12" fill="#a16207"/>` + lamp(250, 30, .8),
      hwr: () => `<rect x="130" y="32" width="130" height="4" fill="url(#${q("wood")})"/>${[[136, "#60a5fa"], [168, "#f59e0b"], [200, "#a3e635"], [232, "#f472b6"]].map(([x, c]) => `<rect x="${x}" y="16" width="24" height="16" rx="2" fill="${c}" opacity=".85"/>`).join("")}` +
        lamp(180, 22, .9) + `<rect x="170" y="0" width="20" height="5" fill="${k === "aus" ? "#cbd5e1" : col}"/>` +
        [[150, "#f1f5f9"], [204, "#e2e8f0"]].map(([x, c]) => `<rect x="${x}" y="70" width="48" height="52" rx="5" fill="${c}" stroke="#94a3b8" stroke-opacity=".6"/><rect x="${x}" y="70" width="48" height="9" rx="4" fill="#cbd5e1"/><circle cx="${x + 24}" cy="${100}" r="14" fill="#94a3b8"/><circle cx="${x + 24}" cy="100" r="10" fill="#bae6fd"/><circle cx="${x + 40}" cy="74.5" r="1.8" fill="#22c55e"/>`).join("") +
        `<path d="M266 102 h36 l-4 20 h-28z" fill="#d6a76c"/><path d="M270 100 q14 -10 28 0" fill="#f472b6"/>`,
      werkstatt: () => `<rect x="134" y="20" width="150" height="58" rx="3" fill="#a16207" opacity=".55"/>${Array.from({ length: 6 }, (_, i) => Array.from({ length: 14 }, (_, j) => `<circle cx="${142 + j * 10.5}" cy="${27 + i * 9}" r=".9" fill="#422006" opacity=".6"/>`).join("")).join("")}` +
        `<path d="M150 30 v28" stroke="#64748b" stroke-width="3"/><rect x="144" y="27" width="12" height="7" rx="1.5" fill="#475569"/><path d="M178 30 l10 26" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/><circle cx="177" cy="29" r="4" fill="none" stroke="#94a3b8" stroke-width="2.5"/>` +
        `<path d="M206 32 v24" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/><path d="M230 32 v22" stroke="#f59e0b" stroke-width="3"/><rect x="226" y="52" width="8" height="12" rx="2" fill="#1f2937"/><path d="M256 30 h18 v8 h-18z" fill="#64748b"/>` +
        `<rect x="134" y="84" width="170" height="8" rx="2" fill="url(#${q("wood")})"/><rect x="140" y="92" width="6" height="32" fill="#5b3a1e"/><rect x="292" y="92" width="6" height="32" fill="#5b3a1e"/><rect x="146" y="108" width="146" height="4" fill="#7c4a24"/>` +
        `<rect x="250" y="68" width="34" height="16" rx="3" fill="#dc2626"/><rect x="262" y="64" width="10" height="5" rx="2" fill="none" stroke="#7f1d1d" stroke-width="2"/><rect x="160" y="74" width="20" height="10" fill="#475569"/>` + lamp(230, 30, .7),
      fitness: () => `<rect x="230" y="20" width="72" height="62" rx="3" fill="#bfdbfe" opacity=".45" stroke="#f8fafc" stroke-width="3"/>` + lamp(260, 26, .8) +
        `<rect x="128" y="96" width="50" height="4" rx="2" fill="#475569"/>${[134, 150, 166].map((x, i) => `<rect x="${x}" y="${88 - i * 2}" width="12" height="${8 + i * 2}" rx="2" fill="#334155"/><circle cx="${x + 6}" cy="${86 - i * 2}" r="${4 + i}" fill="#1f2937"/>`).join("")}<rect x="132" y="100" width="4" height="22" fill="#475569"/><rect x="170" y="100" width="4" height="22" fill="#475569"/>` +
        `<path d="M190 126 l90 -4 l6 6 l-92 4z" fill="#a855f7" opacity=".85"/><rect x="208" y="92" width="62" height="7" rx="3" fill="#1f2937"/><rect x="214" y="99" width="4" height="22" fill="#475569"/><rect x="260" y="99" width="4" height="22" fill="#475569"/>` +
        `<circle cx="300" cy="114" r="9" fill="#1f2937"/><path d="M294 106 q6 -9 12 0" fill="none" stroke="#1f2937" stroke-width="3.5"/>`,
      dachboden: () => `<path d="M140 0 L340 0 L340 110 Z" style="fill:${T}" opacity=".55"/>${[180, 230, 280].map((x) => `<path d="M${x} 0 L340 ${(340 - x) * .55}" stroke="url(#${q("wood")})" stroke-width="7"/>`).join("")}<path d="M140 0 L340 110" stroke="#7c4a24" stroke-width="8"/>` +
        `<rect x="146" y="92" width="34" height="28" rx="2" fill="#d6a76c"/><path d="M146 100 h34" stroke="#a16207" stroke-width="1.5"/><rect x="178" y="102" width="26" height="18" rx="2" fill="#c08552"/>` +
        `<path d="M222 98 h56 q4 0 4 4 v20 h-64 v-20 q0 -4 4 -4z" fill="#7c4a24"/><path d="M220 98 q30 -16 64 0" fill="#92400e"/><rect x="246" y="102" width="12" height="6" rx="1" fill="#fbbf24"/>` +
        lamp(200, 40, .8) + `<path d="M200 0 v34" stroke="#94a3b8" stroke-width="1.2"/><circle cx="200" cy="38" r="4.5" fill="${k === "aus" ? "#cbd5e1" : col}"/>`,
      garage: () => `<rect x="166" y="14" width="146" height="98" rx="2" fill="#cbd5e1"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="170" y="${18 + i * 15.5}" width="138" height="13" rx="1.5" fill="#e2e8f0"/>`).join("")}<rect x="166" y="10" width="146" height="5" fill="#94a3b8"/>` +
        lamp(170, 18, .9) + `<rect x="160" y="2" width="20" height="5" fill="${k === "aus" ? "#cbd5e1" : col}"/>` +
        `<rect x="112" y="40" width="4" height="70" fill="#64748b"/><rect x="112" y="60" width="40" height="3" fill="#94a3b8"/><rect x="116" y="50" width="12" height="10" fill="#f59e0b"/><rect x="132" y="52" width="16" height="8" fill="#60a5fa"/>` + car(150, 84, "#2563eb"),
      carport: () => car(118, 84, "#dc2626") + lamp(36, 56, .9) + `<rect x="30" y="52" width="12" height="8" rx="2" fill="${k === "aus" ? "#cbd5e1" : col}"/>`,
      mess: () => `<rect x="128" y="64" width="64" height="5" rx="2" fill="url(#${q("wood")})"/><rect x="134" y="44" width="18" height="20" rx="2" fill="#d6a76c"/><rect x="156" y="50" width="26" height="14" rx="2" fill="#c08552"/>` +
        lamp(240, 30, .8) + `<rect x="206" y="30" width="68" height="54" rx="10" fill="#f8fafc"/><rect x="214" y="38" width="52" height="30" rx="5" fill="#0f2a2e"/><text x="240" y="54" text-anchor="middle" font-size="12" font-weight="700" fill="#5eead4" font-family="system-ui,sans-serif">${o.mt || "--°"}</text><text x="240" y="64" text-anchor="middle" font-size="7.5" fill="#7dd3fc" font-family="system-ui,sans-serif">${o.mh || ""}</text><circle cx="240" cy="76" r="2.5" fill="${col}"/>` +
        `<rect x="128" y="88" width="190" height="34" rx="3" fill="#94a3b8" opacity=".55"/><path d="M128 104 h190" stroke="#64748b" stroke-width="1.2"/>` + plant(110, 108, .7),
    };
    d += (F1[type] || F1.wohnen)();
    /* Geräte im Raum: Elektroheizer an der Wand neben dem Fenster, Luftentfeuchter in der Ecke links */
    if (s.htr && !mess) {
      const on = s.htr.status === "pv" && (Number(s.htr.watt_now) || 0) > 0, hx = 100, hy = 58;
      d += `<rect x="${hx + 1}" y="${hy + 2}" width="36" height="24" rx="5" fill="#000" opacity=".18"/><rect x="${hx}" y="${hy}" width="36" height="24" rx="5" fill="#e2e8f0" stroke="#94a3b8" stroke-opacity=".7"/>` +
        [0, 1, 2, 3, 4].map((i) => `<rect x="${hx + 5 + i * 5.6}" y="${hy + 5}" width="3.2" height="14" rx="1.6" fill="${on ? "#fb923c" : "#94a3b8"}"/>`).join("") +
        `<circle cx="${hx + 32}" cy="${hy + 3.6}" r="1.8" fill="${on ? "#fbbf24" : "#64748b"}"/>` +
        (on ? `<rect x="${hx - 6}" y="${hy - 6}" width="48" height="36" rx="12" fill="#fb923c" opacity=".18"/><g class="hw">${[0, 1].map((i) => `<path class="hw${i}" d="M${hx + 11 + i * 14} ${hy - 2} q-3 -4 0 -8 q3 -4 0 -8" fill="none" stroke="url(#${q("hw")})" stroke-width="2.2" stroke-linecap="round"/>`).join("")}</g>` +
          `<circle cx="${hx + 38}" cy="${hy - 4}" r="6" fill="#fbbf24"/><path d="M${hx + 38} ${hy - 13}v3M${hx + 38} ${hy + 2}v3M${hx + 29} ${hy - 4}h3M${hx + 44} ${hy - 4}h3" stroke="#fbbf24" stroke-width="1.6" stroke-linecap="round"/>` : "");
    }
    if ((s.lfs || []).length) {
      const L = s.lfs[0].S.live || {}, run = !!(L.running || (L.on && !L.has_pw)), fill = L.fill != null ? Math.max(0, Math.min(1, L.fill)) : null, lx = -2, ly = 80, lc = L.full || L.code === "full" ? "#f59e0b" : run ? "#22d3ee" : "#64748b";
      d += `<ellipse cx="${lx + 13}" cy="${ly + 37}" rx="15" ry="2.6" fill="#000" opacity=".25"/><rect x="${lx}" y="${ly}" width="26" height="36" rx="5" fill="#f1f5f9" stroke="#94a3b8" stroke-opacity=".7"/>` +
        [4, 7, 10].map((y) => `<rect x="${lx + 5}" y="${ly + y}" width="16" height="1.4" rx=".7" fill="#94a3b8"/>`).join("") +
        `<rect x="${lx + 5}" y="${ly + 17}" width="16" height="15" rx="2.5" fill="#dbeafe" stroke="#93c5fd" stroke-width=".8"/>` +
        (fill != null ? `<rect x="${lx + 5.5}" y="${ly + 31.5 - fill * 14}" width="15" height="${fill * 14}" rx="2" fill="${fill > .85 ? "#f59e0b" : "#38bdf8"}"/>` : "") +
        `<circle cx="${lx + 21}" cy="${ly + 14}" r="1.6" fill="${lc}"/>` +
        (run ? `<g class="aw">${[0, 1].map((i) => `<path class="aw${i}" d="M${lx + 6 + i * 8} ${ly - 3} q3 -4 0 -7 q-3 -3 0 -7" fill="none" stroke="#67e8f9" stroke-width="1.8" stroke-linecap="round" opacity=".85"/>`).join("")}</g>` : "");
    }
    if (o.ms && type !== "mess") d += `<g transform="translate(${outd ? 88 : 0} ${outd ? 16 : 0})"><rect x="100" y="24" width="30" height="24" rx="5" fill="#f8fafc" stroke="#94a3b8" stroke-opacity=".6"/><rect x="103" y="27" width="24" height="14" rx="2.5" fill="#0f2a2e"/><text x="115" y="36.5" text-anchor="middle" font-size="7.5" font-weight="700" fill="#5eead4" font-family="system-ui,sans-serif">${o.mt || "--°"}</text><circle cx="115" cy="44.5" r="1.6" fill="${col}"/></g>`;
    /* Präsenz: Person im Raum */
    if (s.here && !outd) d += `<g transform="translate(${type === "flur" || type === "garage" ? 140 : 106} 74)"><ellipse cx="9" cy="46" rx="11" ry="2.6" fill="#000" opacity=".25"/><circle cx="9" cy="6" r="6" fill="#fcd9b6"/><path d="M3 4 q6 -8 12 0 q-2 -3 -6 -3 q-4 0 -6 3z" fill="#7c4a24"/><path d="M0 26 q0 -12 9 -12 q9 0 9 12 v6 h-18z" fill="${col}"/><rect x="2" y="31" width="6" height="14" rx="2.5" fill="#334155"/><rect x="10" y="31" width="6" height="14" rx="2.5" fill="#334155"/></g>`;
    /* Licht in Zustandsfarbe, Nacht etwas dunkler, aus = ohne Licht */
    d += `<rect class="rkgl" x="-60" width="440" height="150" fill="url(#${q("gl")})"/>`;
    return `<svg class="rk2svg" viewBox="-60 0 440 150" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${d}</svg>`;
  }
  /* Bildbereich: eigenes Foto (Vorrang) oder Raumbild. Der Schlüssel entscheidet, ob neu gezeichnet wird. */
  _rkPic(r, s, mini = false) {
    const ph = (this._cfg.layout.photos || {})[r.id], type = this._rkType(r), an = this._rkCfg().anim;
    const key = [mini ? "m" : "c", r.id, type, s.k, s.open.length ? "o" : s.tilt.length ? "t" : "c", s.night ? 1 : 0, s.heating || (s.act === "heating") ? 1 : 0, an, ph ? ph.length + ph.slice(-12) : "", type === "carport" && this._out().t != null && this._out().t <= 0 ? "fr" : "", s.htr ? s.htr.status + (s.htr.status === "pv" && s.htr.watt_now > 0 ? "1" : "0") : "", (s.lfs || []).map((d) => { const L = d.S.live || {}; return (L.running || (L.on && !L.has_pw) ? "r" : "s") + (L.full ? "f" : "") + (L.fill != null ? Math.round(L.fill * 10) : ""); }).join(","), s.here ? "p" : ""].join("|");
    const cls = `rk2art${s.k === "aus" ? " gr" : ""}${mini ? " mini" : ""}${s.night ? " nt" : ""}`;
    if (ph) return `<div class="${cls} ph" data-kk="${esc(key)}" data-an="${an}" style="background-image:url('${esc(ph)}');--c:${s.col}"><i class="rkv"></i></div>`;
    return `<div class="${cls}" data-kk="${esc(key)}" data-an="${an}" style="--c:${s.col}">${this._rkArt(type, s)}</div>`;
  }

  /* ---------- Ring, Zeilen, Heizplan-Band ---------- */
  _rkRing(s) {
    const R = 36, C = 2 * Math.PI * R, A = .75, a0 = 135, fr = (t) => Math.max(0, Math.min(1, (t - 12) / 14));
    const cur = s.cur, col = this._rkCol(cur, s.lo, s.hi), len = cur == null ? 0 : fr(cur) * A * C;
    const zt = s.ziel != null ? fr(s.ziel) : null, ang = zt != null ? (a0 + zt * 270) * Math.PI / 180 : 0;
    const big = cur != null ? num(cur, 1) + "°" : "–", sm = s.rt.sensor && s.rt.th != null ? `Therm. ${num(s.rt.th, 1)}°` : s.ziel != null ? `Ziel ${num(s.ziel, 1)}°` : "";
    const warn = s.rt.sensor && s.rt.diff != null && Math.abs(s.rt.diff) > 1.5;
    return `<div class="rk2ring${warn ? " wn" : ""}" title="${warn ? "Thermostat weicht mehr als 1,5 K vom Raum ab" : ""}"><svg viewBox="0 0 88 88" width="88" height="88" aria-hidden="true">
      <circle cx="44" cy="44" r="${R}" fill="none" stroke="var(--line)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(A * C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(${a0} 44 44)"/>
      ${len ? `<circle cx="44" cy="44" r="${R}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${len.toFixed(1)} ${C.toFixed(1)}" transform="rotate(${a0} 44 44)"/>` : ""}
      ${zt != null ? `<circle cx="${(44 + R * Math.cos(ang)).toFixed(1)}" cy="${(44 + R * Math.sin(ang)).toFixed(1)}" r="4.6" fill="var(--primary-text-color,#fff)" stroke="var(--card)" stroke-width="2"/>` : ""}</svg>
      <div class="rk2rv"><b>${big}</b>${sm ? `<small>${sm}</small>` : ""}${s.rt.sensor && s.ziel != null ? `<small>Ziel ${num(s.ziel, 1)}°</small>` : ""}</div>${warn ? `<i class="rk2rw">!</i>` : ""}</div>`;
  }
  _rkClock(s) {
    const need = ventMin(this._out().t), R = 12, C = 2 * Math.PI * R, f = Math.min(1, s.mins / need), c = s.mins > need * 2 ? "#ef4444" : s.mins >= need ? "#f59e0b" : "#60a5fa";
    return `<svg class="rk2clk" viewBox="0 0 30 30" width="30" height="30" data-rkw="${s.since}" data-need="${need}" aria-hidden="true"><circle cx="15" cy="15" r="${R}" fill="none" stroke="var(--line)" stroke-width="3"/><circle data-arc cx="15" cy="15" r="${R}" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-dasharray="${(f * C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 15 15)"/><text data-min x="15" y="19" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor">${s.mins}′</text></svg>`;
  }
  /* Fenster-Uhr: läuft jede Sekunde mit (aus _tick) */
  _rkTick() {
    this.shadowRoot.querySelectorAll("svg[data-rkw]").forEach((el) => {
      const since = +el.dataset.rkw, need = +el.dataset.need || 10, mins = Math.max(0, Math.floor((Date.now() - since) / 60000)), R = 12, C = 2 * Math.PI * R, f = Math.min(1, mins / need);
      const a = el.querySelector("[data-arc]"), t = el.querySelector("[data-min]");
      if (a) { a.setAttribute("stroke-dasharray", `${(f * C).toFixed(1)} ${C.toFixed(1)}`); a.setAttribute("stroke", mins > need * 2 ? "#ef4444" : mins >= need ? "#f59e0b" : "#60a5fa"); }
      if (t && t.textContent !== mins + "′") t.textContent = mins + "′";
    });
  }
  _rkLines(r, s) {
    const nm = (w) => w.attributes.friendly_name || w.entity_id, tm = (ms) => new Date(ms).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    const line = (icon, lab, val, sub, cls = "") => `<div class="rk2l ${cls}"><span class="rk2i">${icon}</span><span class="rk2t"><small>${lab}</small><b>${val}</b>${sub ? `<em>${sub}</em>` : ""}</span></div>`;
    let win;
    if (!s.wins.length) win = line(this._gx("window", 30), "Fenster", "kein Kontakt", "");
    else if (s.anyOpen) {
      const list = [...s.open, ...s.tilt], what = s.open.length ? "offen" : "gekippt";
      win = line(this._rkClock(s), "Fenster", `${what} · seit ${tm(s.since)}`, esc(list.map((x) => nm(x.w)).join(", ")), "t-bl");
    } else win = line(this._gx("window", 30), "Fenster", "geschlossen", s.wins.length > 1 ? `${s.wins.length} Kontakte` : esc(nm(s.wins[0])));
    let hv, hs = "";
    const nx = s.pts.length && s.planOn ? nextPt(s.pts, s.now) : null, nxt = nx ? `ab ${nx.w % 10080 >= s.today * 1440 && nx.w < (s.today + 1) * 1440 ? "" : "morgen "}${fmtT(nx.w % 1440)} ${num(nx.t, 1)}°` : "";
    if (!s.t0) hv = "kein Thermostat";
    else if (s.k === "pause" || (s.anyOpen && r.mode === "heizung_pausiert")) { hv = "pausiert"; const me = r.modeEid && this._hass.states[r.modeEid]; hs = me ? `seit ${tm(new Date(me.last_changed).getTime())}` : ""; }
    else if (s.thOff) { hv = "aus"; hs = r.mode === "nur_fenstermeldung" ? "nur Fenstermeldung" : ""; }
    else if (s.heating) { hv = s.ziel != null ? `heizt auf ${num(s.ziel, 1)}°` : "heizt"; hs = nx ? `bis ${fmtT(nx.w % 1440)}` : ""; }
    else if (s.ziel != null && s.cur != null && s.cur >= s.ziel - 0.3) { hv = `Ziel ${num(s.ziel, 1)}° erreicht`; hs = nxt; }
    else { hv = s.ziel != null ? `Ziel ${num(s.ziel, 1)}°` : "regelt"; hs = nxt; }
    if (s.th.length > 1) hs = (hs ? hs + " · " : "") + `${s.th.length} Thermostate`;
    const heat = line(this._gx(s.heating ? "radiator" : "thermostat", 30, { on: s.heating, t: s.ziel != null ? num(s.ziel, 0) + "°" : "–" }), "Heizung", hv, hs, s.heating ? "t-or" : s.k === "pause" ? "t-am" : "");
    let third = "";
    if (s.pres) {
      const P = s.pres, ago = (iso) => { const m = iso ? Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000)) : null; return m == null ? "" : m < 60 ? `${m} Min.` : `${Math.floor(m / 60)} Std. ${m % 60} Min.`; };
      const val = P.anwesend ? "jemand da" : P.roh ? "Bewegung erkannt" : "niemand", blk = P.gesperrt === "abwesend" ? "ruht bei Abwesenheit" : P.gesperrt === "sommer" ? "ruht im Sommermodus" : "";
      const sub = blk || (P.anwesend ? `${P.modus === "exact" ? "genau" : "mind."} ${num(P.temp, 1)}° · seit ${ago(P.seit)}` : P.roh ? `belegt nach ${P.verz_an} Min.` : P.leerlauf ? `leer seit ${ago(P.zuletzt)} · −${num(P.leerlauf_k, 1)} K` : P.zuletzt ? `zuletzt vor ${ago(P.zuletzt)}` : "");
      third += line(this._gx("presence", 30, { on: !!P.anwesend }), "Präsenz", val, sub, P.anwesend && !blk ? "t-pr" : "");
    }
    if (s.hum != null) { const a = this._airData(r), [ml, mc] = a ? MOLD[a.lvl] : ["", ""]; third = line(this._gx("humidity", 30), "Luftfeuchte", `${num(s.hum)} %`, a ? `Schimmel ${ml}` : "", mc === "red" ? "t-rd" : mc === "amber" ? "t-am" : ""); }
    return win + heat + third;
  }
  _rkBand(r, s) {
    const adm = this._admin(), id = esc(r.id);
    if (!s.pts.length) return adm ? `<button class="rk2pl none" data-act="plan" data-id="${id}">${ic("plus", 15)}Heizplan einrichten</button>` : "";
    const segs0 = segs(s.pts, s.today), t0 = s.today * 1440, nm = s.now % 1440;
    const cuts = s.pts.filter((p) => p.w > s.now && p.w < t0 + 1440).filter((p, i, a) => (i ? a[i - 1].t : s.curPlan) !== p.t).slice(0, 2);
    const cap = !s.planOn ? (s.away ? "Heizplan ruht · Abwesenheit" : s.summer ? "Heizplan ruht · Sommermodus" : "Heizplan aus") : `Jetzt <b>${num(s.curPlan, 1)}°</b>${cuts.map((p) => ` · ab ${fmtT(p.w % 1440)} <b>${num(p.t, 1)}°</b>`).join("")}${r.htr ? ` · <span class="nw"><span class="sun">☀</span> PV-Heizer</span>` : ""}${s.pres && s.pres.anwesend && !s.pres.gesperrt ? ` · <span class="nw pr">● ${s.pres.modus === "exact" ? "genau" : "mind."} ${num(s.pres.temp, 1)}°</span>` : ""}`;
    const inner = `<div class="rk2bd${s.planOn ? "" : " off"}">${segs0.map((g) => `<i style="flex:${g.e - g.s};background:${this._rkCol(g.t, s.lo, s.hi)}" title="${fmtT(g.s)}–${fmtT(g.e % 1440 || 1440)} · ${num(g.t, 1)} °C"></i>`).join("")}<b style="left:${(nm / 14.4).toFixed(2)}%"></b></div>
      <div class="tla"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div><div class="rk2pc">${ic("plan", 14)}<span>${cap}</span></div>`;
    return adm ? `<button class="rk2pl" data-act="plan" data-id="${id}" aria-label="Heizplan bearbeiten">${inner}</button>` : `<div class="rk2pl">${inner}</div>`;
  }
  /* Hinweis-Plaketten (W3) auf dem Bild: Gerät, Schimmel, Frost, Raumsensor */
  _rkBadges(r, s) {
    const out = [], a = this._airData(r);
    if (s.cur != null && s.cur < 8) out.push(`<span class="achip red">${ic("snow", 12)}Frostgefahr</span>`);
    if (s.rt.fail || s.rt.missing) out.push(`<span class="achip amber">${ic("thermo", 12)}Raumsensor fehlt</span>`);
    const dv = this._devChip(r); if (dv) out.push(dv);
    return out.length ? `<div class="rk2bg">${out.slice(0, 2).join("")}</div>` : "";
  }

  /* ---------- Karte ---------- */
  _room2(r) {
    const s = this._rkState(r), edit = this._edit, adm = this._admin(), m = MODE[r.mode] || MODE.regelung_aus, id = esc(r.id);
    const d = r.sc.day || { min: 0, gas: 0, kwh: 0 }, F = FUELS[r.fuel || "erdgas"];
    const chip = `<span class="rk2st" style="--c:${s.col}">${s.k === "pause" ? `<i class="ps">❚❚</i>` : "<i></i>"}${esc(s.lab)}</span>`;
    const pic = this._rkPic(r, s);
    const top = `<div class="rk2top">${edit ? `<button class="rk2eb" data-act="icon" data-id="${id}" aria-label="Raumbild, Symbol, Farbe und Foto ändern">${pic}<span class="rk2pen">${ic("pencil", 14)}Raumbild</span></button>` : pic}
      <div class="rk2ov">${edit ? `<span class="grip" data-handle title="Verschieben">${ic("grip", 18)}</span>` : ""}${chip}<span class="rk2sp"></span>${r.sw ? `<span class="rk2swb"><button class="sw ${r.on ? "on" : ""}" data-act="sw" data-sw="${esc(r.sw)}" aria-label="Fensterregelung umschalten" aria-pressed="${!!r.on}"></button></span>` : ""}</div>
      <div class="rk2nm"><b>${esc(r.name)}</b></div>${edit ? "" : this._rkBadges(r, s)}</div>`;
    const notes = `${this._wxaNote(r)}${this._away() ? `<div class="pnote">${ic("suitcase", 16)}${this._pres().effective === "vacation" || this._pres().mode === "vacation" ? "Urlaubsmodus" : "Abwesend"}: Absenkung auf ${num(this._pres().temp, 1)} °C, der Heizplan ruht.</div>` : this._sum().active ? `<div class="pnote">${ic("sun", 16)}Sommermodus: Der Heizplan ruht, die Fenstermeldung bleibt aktiv.</div>` : ""}`;
    /* Raumluft nur, wenn es etwas zu tun gibt; die Werte stehen schon in der Zeile Luftfeuchte */
    const a = this._airData(r), al = !a && this._airLite(r);
    const air = a ? (a.open ? "" : a.lvl >= 1 || a.rh >= 60 ? this._airMsg(a) : "") : al && al.due && !al.open ? `<div class="airmsg amber">${ic("windy", 16)}<div><b>Länger nicht gelüftet</b> (${this._ago(al.hrs)}). Jetzt ca. ${al.need} Min. stoßlüften.</div></div>` : "";
    const need = ventMin(this._out().t);
    const foot = s.anyOpen
      ? (() => { const c = cdown(s.since, need); return `<div class="rk2fl${c.left <= 0 ? " done" : ""}" data-since="${s.since}" data-need="${need}">${ic("windy", 15)}<span><i class="pre">Lüften empfohlen: </i><b data-cd>${c.txt}</b></span></div>`; })()
      : `<div class="rk2fl">${ic("clock", 15)}<span>${d.min ? `Heute <b>${num(d.min)} Min.</b> pausiert · ~${num(d.gas, 2)} ${unitOf(F)}` : "Heute nicht pausiert"}${r.pauses ? ` · ${r.pauses}×` : ""}</span></div>`;
    return `<div class="card room rk2 rk-${s.k}${edit ? " ed" : ""}" data-m="${m.c}" data-sort="room" data-id="${id}" style="--c:${s.col}">${top}
      <div class="rk2mid">${this._rkRing(s)}<div class="rk2ls">${this._rkLines(r, s)}</div></div>
      ${this._rkBand(r, s)}${notes}${this._rkDevs(r, s)}${air}${this._lfMove(r.id)}
      <div class="rk2ft">${foot}<button class="rk2more" data-act="rkmenu" data-id="${id}" aria-label="Weitere Aktionen für ${esc(r.name)}">⋯</button></div></div>`;
  }
  /* Kompakt-Ansicht (G3): Mini-Bild statt Raumsymbol */
  _rkMini(r) { return `<div class="rk2mini">${this._rkPic(r, this._rkState(r), true)}</div>`; }
  /* Menü „⋯“ */
  _rkMenu(m) {
    const ms = this._msList().find((x) => x.id === m.id);
    if (ms) {
      const id = esc(ms.id), it = (act, icon, t, sub) => `<button class="rk2mi" data-act="${act}" data-id="${id}">${ic(icon, 20)}<span><b>${t}</b><small>${sub}</small></span>${ic("chev", 16)}</button>`;
      return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>${esc(ms.name)}</b><span>Messraum · ${esc(this._rkMsType(ms) === "mess" ? "Raumbild Messraum" : this._rkTypeName(this._rkMsType(ms)))}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="rk2menu">${it("msxedit", "sliders", "Messraum einstellen", "Sensoren, Wunschbereich, Taupunkt, Schimmel")}${it("icon", "palette", "Raumbild & Farbe", "Raumbild, Symbol, Farbe, eigenes Foto")}</div></div>`;
    }
    const r = this._collect().find((x) => x.id === m.id); if (!r) return "";
    const adm = this._admin(), id = esc(r.id), s = this._rkState(r);
    const it = (act, icon, t, sub) => `<button class="rk2mi" data-act="${act}" data-id="${id}">${ic(icon, 20)}<span><b>${t}</b><small>${sub}</small></span>${ic("chev", 16)}</button>`;
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>${esc(r.name)}</b><span><i class="rk2dot" style="background:${s.col}"></i>${esc(s.lab)} · ${esc(this._rkTypeName(this._rkType(r)))}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="rk2menu">${it("why", "info", "Warum?", "Was die Regelung gerade tut und weshalb")}${it("rep", "chart", "Bericht", "Temperatur, Fenster und Pausen eines Tages")}
      ${r.htr ? it("rkhtr", "bolt", "Elektroheizer", "Stufen, Laufzeit, Bericht") + it("hrep", "chart", "Heizer-Bericht", "Elektroheizer mit PV-Überschuss") : ""}
      ${s.lfs.map((d) => `<button class="rk2mi" data-act="lfrk" data-id="${id}" data-d="${esc(d.id)}">${ic("fan", 20)}<span><b>${esc(d.name)}</b><small>Luftentfeuchter · Standort, Tank, Statistik</small></span>${ic("chev", 16)}</button>`).join("")}
      ${adm ? it("plan", "plan", "Heizplan bearbeiten", s.pts.length ? "Zeiten und Temperaturen" : "Noch kein Heizplan") : ""}
      ${adm ? it("opt", "sliders", "Raumeinstellungen", "Fenster, Thermostate, Sensoren, Regelung") : ""}
      ${adm ? it("icon", "palette", "Raumbild & Farbe", "Raumtyp, Symbol, Farbe, eigenes Foto") : ""}</div></div>`;
  }
  /* Raumtyp im Fenster „Raum anpassen“ */
  _rkTypePick(r) {
    if (!this._rkOn()) return "";
    const ms = this._msList().find((x) => x.id === r.id);
    if (ms) {
      const cur = (this._cfg.layout.rtype || {})[ms.id] || "", s = this._rkMsS(ms), o = { ms: true, mt: "20,5°", mh: "55 %" };
      return `<div class="lsec">Raumbild</div><div class="rk2tp">
        <button class="${!cur ? "sel" : ""}" data-act="rktype" data-k=""><span class="rk2art sm">${this._rkArt(this._rkMsAuto(ms), s, o)}</span><b>Automatisch</b><small>${esc(this._rkMsAuto(ms) === "mess" ? "Messraum" : this._rkTypeName(this._rkMsAuto(ms)))}</small></button>
        <button class="${cur === "mess" ? "sel" : ""}" data-act="rktype" data-k="mess"><span class="rk2art sm">${this._rkArt("mess", s, o)}</span><b>Messraum</b></button>
        ${this.constructor.RK_TYPES.map(([k, n]) => `<button class="${cur === k ? "sel" : ""}" data-act="rktype" data-k="${k}"><span class="rk2art sm">${this._rkArt(k, s, o)}</span><b>${n}</b></button>`).join("")}</div>
        <div class="mut sm" style="margin:0 0 8px">Messräume zeigen statt des Heizkörpers den Sensor an der Wand (beim Carport an der Stütze). Der Raumtyp wird aus dem Namen vorgeschlagen. Ein eigenes Foto (unten) hat Vorrang vor dem Raumbild.</div>`;
    }
    const cur = (this._cfg.layout.rtype || {})[r.id] || "", auto = this._rkTypeAuto(r), s = { ...this._rkState(r), k: "ok", col: "#2dd4bf", open: [], tilt: [], anyOpen: 0, heating: false, act: null, night: false };
    return `<div class="lsec">Raumbild</div><div class="rk2tp">
      <button class="${!cur ? "sel" : ""}" data-act="rktype" data-k=""><span class="rk2art sm">${this._rkArt(auto, s)}</span><b>Automatisch</b><small>${esc(this._rkTypeName(auto))}</small></button>
      ${this.constructor.RK_TYPES.map(([k, n]) => `<button class="${cur === k ? "sel" : ""}" data-act="rktype" data-k="${k}"><span class="rk2art sm">${this._rkArt(k, s)}</span><b>${n}</b></button>`).join("")}</div>
      <div class="mut sm" style="margin:0 0 8px">Der Raumtyp wird aus dem Namen vorgeschlagen. Ein eigenes Foto (unten) hat Vorrang vor dem Raumbild.</div>`;
  }
  /* Darstellung: Raumkarten */
  _rkLook() {
    const c = this._rkCfg();
    return `<div class="lsec">${ic("grid", 15)}Raumkarten in Modul 1</div>
      <div class="ltog"><span>Raumkarten wie bisher<small class="mut" style="display:block">An: Karten aus v1.7 mit Symbol und Kästen statt Raumbild und Ring</small></span><button class="sw ${c.old ? "on" : ""}" data-act="rkold" aria-pressed="${c.old}" aria-label="Raumkarten wie bisher"></button></div>
      ${c.old ? "" : this._animLook()}`;
  }
  /* ---------- Elektroheizer und Luftentfeuchter (Raumkarte 2.0) ----------
     Auf der Karte je Gerät eine Kachel mit HD-Bild, Zustand und Balken (Stufen bzw. Tank). Antippen öffnet das Gerät
     mit allen Werten und Tasten wie bisher (Warum?, Standort, Heute aus, Statistik, Tank geleert, Bericht). */
  _rkDevs(r, s) {
    const out = [];
    if (s.htr) out.push(this._rkHtrTile(r, s.htr));
    s.lfs.forEach((d) => out.push(this._rkLfTile(r, d)));
    return out.length ? `<div class="rk2dvs">${out.join("")}</div>` : "";
  }
  _rkHtrTile(r, h) {
    const [lab] = HTR[h.status] || HTR.aus, st = stepsOf(h), on = h.status === "pv" && (Number(h.watt_now) || 0) > 0;
    const tone = { pv: "#fb923c", wartet: "#f59e0b", soc: "#f59e0b", fenster: "#60a5fa", warm: "#2dd4bf" }[h.status] || "#94a3b8";
    const share = h.heute_kwh > 0 ? Math.round((h.heute_pv_kwh / h.heute_kwh) * 100) : null;
    const val = on ? (st.length > 1 ? `Stufe ${h.stufe} · ${wfmt(h.watt_now)}` : wfmt(h.watt_now)) : lab;
    const sub = [on ? "mit PV-Überschuss" : h.status === "wartet" && st.length ? `ab ${wfmt(st[0] + this._pv().reserve)} Überschuss` : "", h.heute_kwh > 0 ? `${num(h.heute_kwh, 1)} kWh heute${share != null ? ` · ${share} % PV` : ""}` : ""].filter(Boolean).join(" · ");
    const bar = st.length > 1 ? `<div class="rk2stp">${st.map((w, i) => `<i class="${on && h.stufe >= i + 1 ? "on" : ""}" title="Stufe ${i + 1} · ${wfmt(w)}"></i>`).join("")}</div>` : "";
    return `<div class="rk2dv${on ? " run" : ""}" style="--c:${tone}"><button class="rk2dvb" data-act="rkhtr" data-id="${esc(r.id)}" aria-label="Elektroheizer öffnen">
      <span class="rk2dvi">${this._gx("heater", 38, { stage: on ? Math.min(3, h.stufe || 2) : 0, on })}</span><span class="rk2dvt"><small>Elektroheizer${on ? ` <i class="sun">☀</i>` : ""}</small><b>${esc(val)}</b>${sub ? `<em>${esc(sub)}</em>` : ""}${bar}</span></button>
      ${r.htrSw ? `<button class="sw ${r.htrOn ? "on" : ""}" data-act="sw" data-sw="${esc(r.htrSw)}" aria-pressed="${!!r.htrOn}" aria-label="Elektroheizer ein oder aus"></button>` : ""}</div>`;
  }
  _rkLfTile(r, d) {
    const S = d.S, L = S.live || {}, [k, t] = this._lfState(L), A = S.ask || {};
    const tone = { run: "#22d3ee", warn: "#f59e0b", wait: "#60a5fa" }[k] || "#94a3b8", fill = L.fill != null ? Math.min(100, Math.round(L.fill * 100)) : null;
    const tag = L.boost === "pv" || (L.pv_only && L.running && L.pv_ok) ? " · ☀ PV" : L.pv_only && L.code === "safe" && L.running ? " · Schimmelschutz" : L.boost ? " · günstig" : L.night ? ` · Nacht${L.quiet_on ? ", leise" : ""}` : "";
    const open = A.phase && A.phase !== "off" && !A.conf, n = (L.msgs || []).filter((m) => m[0] !== "noloc" || !A.conf).length;
    const sub = open ? "Standort heute noch nicht bestätigt" : [fill != null ? `Tank ${fill} %` : L.full ? "Tank voll" : "", L.on ? this._lfSince(L.since) : "", L.today_min ? `heute ${hmin(L.today_min)}` : ""].filter(Boolean).join(" · ") || (d.kind === "watch" ? "nur beobachten" : "Modul 1 regelt");
    return `<div class="rk2dv${k === "run" ? " run" : ""}" style="--c:${tone}"><button class="rk2dvb" data-act="lfrk" data-id="${esc(r.id)}" data-d="${esc(d.id)}" aria-label="${esc(d.name)} öffnen">
      <span class="rk2dvi">${this._gx("dehumid", 38, { lvl: fill != null ? fill : L.full ? 100 : 30, on: k === "run" })}</span><span class="rk2dvt"><small>${esc(d.name)}</small><b>${esc(t + tag)}</b><em class="${open ? "am" : ""}">${esc(sub)}</em>${fill != null ? `<span class="rk2tank"><i style="width:${fill}%;${fill > 85 ? "background:#f59e0b" : ""}"></i></span>` : ""}</span>
      ${n ? `<span class="rk2dvn" title="Hinweise">${n}</span>` : ""}</button></div>`;
  }
  _rkDevSheet(m) {
    const r = this._collect().find((x) => x.id === m.id) || this._msList().find((x) => x.id === m.id); if (!r) return "";
    if (m.type === "rkhtr") return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Elektroheizer</b><span>${esc(r.name)}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="rk2sht">${this._gx("heater", 64, { stage: r.htr && r.htr.status === "pv" ? Math.min(3, r.htr.stufe || 2) : 0, on: r.htr && r.htr.status === "pv" })}</div>${this._htrBox(r)}
      <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
    const d = this._lfDev(m.d); if (!d) return "";
    const L = d.S.live || {};
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>${esc(d.name)}</b><span>Luftentfeuchter · ${esc(r.name)}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="rk2sht">${this._gx("dehumid", 64, { lvl: L.fill != null ? Math.round(L.fill * 100) : L.full ? 100 : 30, on: !!(L.running || (L.on && !L.has_pw)) })}</div>${this._lfBox1(d)}
      <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  /* Mini-Raumbild für eine Raum-ID (Raum oder Messraum), z. B. in der Entfeuchter-Standortkarte und im PV-Heizer-Block */
  _rkMiniById(id, cls = "") {
    if (!this._rkOn()) return "";
    const r = this._collect(true).find((x) => x.id === id);
    if (r) return `<span class="rk2mini ${cls}">${this._rkPic(r, this._rkState(r), true)}</span>`;
    const m = this._msList().find((x) => x.id === id); if (!m) return "";
    const ph = (this._cfg.layout.photos || {})[m.id];
    return `<span class="rk2mini ${cls}">${ph ? `<span class="rk2art ph mini" style="background-image:url('${esc(ph)}')"></span>` : `<span class="rk2art mini">${this._rkArt(this._rkMsType(m), this._rkMsS(m), { ms: true })}</span>`}</span>`;
  }
  _rkMsType(m) { const t = (this._cfg.layout.rtype || {})[m.id]; return t === "mess" ? "mess" : this.constructor.RK_TYPES.some((x) => x[0] === t) ? t : this._rkMsAuto(m); }
  /* Messraum ohne eigene Wahl: Raumtyp aus dem Namen (z. B. „Carport“, „Keller“, „Garage“), sonst das Messraum-Bild */
  _rkMsAuto(m) { return this._rkTypeAuto({ id: m.id, name: m.name, nameOnly: true }) || "mess"; }
  _rkMsS(m, col = "#2dd4bf") { return { k: "ok", col, open: [], tilt: [], anyOpen: 0, act: null, heating: false, t0: null, night: this._hass.states["sun.sun"] ? this._hass.states["sun.sun"].state === "below_horizon" : false, lfs: this._lfDevs().filter((d) => d.S.loc === m.id) }; }
  /* Messraum als Raumkarte 2.0: Bild mit Sensor, Ring für die Temperatur, Zeilen für Luftfeuchte, Taupunkt, Min/Max */
  _msCard2(m, T, Hm, mm, none, note, ntone, batLow) {
    const edit = this._edit, adm = this._admin(), id = esc(m.id), okv = (x) => x && x.st !== "none" && x.st !== "bad";
    const tv = okv(T) ? T.v : null, hv = okv(Hm) ? Hm.v : null;
    let k = "ok", lab = "Im Wohlfühlbereich", col = "#2dd4bf";
    if (none || (tv == null && hv == null)) { k = "aus"; lab = "Keine Daten"; col = "#94a3b8"; }
    else if (hv != null && hv > m.h_hi) { k = "feucht"; lab = "Zu feucht"; col = "#f59e0b"; }
    else if (tv != null && tv < m.t_lo) { k = "kalt"; lab = "Zu kalt"; col = "#60a5fa"; }
    else if (tv != null && tv > m.t_hi) { k = "warm"; lab = "Zu warm"; col = "#fb923c"; }
    else if (hv != null && hv < m.h_lo) { k = "trocken"; lab = "Zu trocken"; col = "#f59e0b"; }
    const s = this._rkMsS(m, col), ph = (this._cfg.layout.photos || {})[m.id], an = this._rkCfg().anim;
    const mt = tv != null ? num(tv, 1) + "°" : "--°", mh = hv != null ? num(hv) + " %" : "", mty = this._rkMsType(m);
    const key = ["ms", m.id, mty, mty === "carport" && this._out().t != null && this._out().t <= 0 ? "fr" : "", k, mt, mh, s.night ? 1 : 0, an, ph ? ph.length : "", s.lfs.map((d) => { const L = d.S.live || {}; return (L.running || (L.on && !L.has_pw) ? "r" : "s") + (L.fill != null ? Math.round(L.fill * 10) : ""); }).join(",")].join("|");
    const pic = ph ? `<div class="rk2art ph${s.night ? " nt" : ""}" data-kk="${esc(key)}" data-an="${an}" style="background-image:url('${esc(ph)}');--c:${col}"><i class="rkv"></i></div>`
      : `<div class="rk2art${k === "aus" ? " gr" : ""}${s.night ? " nt" : ""}" data-kk="${esc(key)}" data-an="${an}" style="--c:${col}">${this._rkArt(mty, s, { mt, mh, ms: true })}</div>`;
    const top = `<div class="rk2top">${edit ? `<button class="rk2eb" data-act="icon" data-id="${id}" aria-label="Raumbild, Farbe und Foto ändern">${pic}<span class="rk2pen">${ic("pencil", 14)}Raumbild</span></button>` : pic}
      <div class="rk2ov"><span class="rk2st" style="--c:${col}"><i></i>${esc(lab)}</span><span class="rk2sp"></span><span class="rk2tag">Messraum</span></div>
      <div class="rk2nm"><b>${esc(m.name)}</b></div>${batLow && !edit ? `<div class="rk2bg"><span class="achip amber">${ic("bolt", 12)}Batterie leer</span></div>` : ""}</div>`;
    const ring = this._rkRing({ cur: tv, lo: m.t_lo, hi: m.t_hi, ziel: null, rt: { sensor: false } }).replace("</b>", `</b><small>${num(m.t_lo, 0)}–${num(m.t_hi, 0)} °C</small>`);
    const line = (icon, l, v, sub, cls = "") => `<div class="rk2l ${cls}"><span class="rk2i">${icon}</span><span class="rk2t"><small>${l}</small><b>${v}</b>${sub ? `<em>${sub}</em>` : ""}</span></div>`;
    let lines = "";
    if (Hm) { const a = tv != null && hv != null ? airCalc(tv, hv, this._out().t, this._out().rh) : null, [ml, mc] = a ? MOLD[a.lvl] : ["", ""];
      lines += line(this._gx("humidity", 30), "Luftfeuchte", hv != null ? `${num(hv)} %` : Hm.st === "bad" ? "unplausibel" : "keine Daten", [mm && mm.h ? `${num(mm.h[0])}–${num(mm.h[1])} % heute` : `${num(m.h_lo, 0)}–${num(m.h_hi, 0)} % gewünscht`, a && m.mold ? `Schimmel ${ml}` : ""].filter(Boolean).join(" · "), hv != null && hv > m.h_hi ? "t-am" : mc === "red" ? "t-rd" : "");
      if (a && m.dew) lines += line(this._gx("thermo", 30), "Taupunkt", `${num(a.td, 1)} °C`, `Wand ca. ${num(a.ts, 1)} °C`); }
    if (T && (mm && mm.t || !Hm)) lines += line(this._gx("thermostat", 30, { t: tv != null ? num(tv, 0) + "°" : "–" }), "Temperatur heute", mm && mm.t ? `${num(mm.t[0], 1)} – ${num(mm.t[1], 1)} °C` : tv != null ? `${num(tv, 1)} °C` : "keine Daten", mm && mm.t ? "Min – Max" : "", tv != null && tv < m.t_lo ? "t-bl" : "");
    const tiles = s.lfs.length ? `<div class="rk2dvs">${s.lfs.map((d) => this._rkLfTile(m, d)).join("")}</div>` : "";
    return `<div class="card room rk2 msr2" data-id="${id}" style="--c:${col}">${top}
      <div class="rk2mid">${T ? ring : ""}<div class="rk2ls">${lines}</div></div>${tiles}${this._lfMove(m.id)}
      <div class="rk2ft"><div class="rk2fl ${ntone === "amber" ? "warn" : ""}">${ic(ntone ? "alert" : "check", 15)}<span>${esc(note)}</span></div>${adm ? `<button class="rk2more" data-act="rkmenu" data-id="${id}" aria-label="Weitere Aktionen für ${esc(m.name)}">⋯</button>` : ""}</div></div>`;
  }
  /* Heizplan-Band in klein (Kompakt-Liste) */
  _rkBandMini(s) {
    if (!s.pts.length) return "";
    const nm = s.now % 1440;
    return `<div class="rk2bd sm${s.planOn ? "" : " off"}">${segs(s.pts, s.today).map((g) => `<i style="flex:${g.e - g.s};background:${this._rkCol(g.t, s.lo, s.hi)}"></i>`).join("")}<b style="left:${(nm / 14.4).toFixed(2)}%"></b></div>`;
  }
  /* Präsenz als Chip (Kompakt-Liste) */
  _rkPrChip(r) {
    const P = r.pres; if (!P) return "";
    const m = (iso) => (iso ? Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000)) : null), f = (n) => (n == null ? "" : n < 60 ? `${n} Min.` : `${Math.floor(n / 60)} Std.`);
    if (P.gesperrt === "abwesend" || P.gesperrt === "sommer") return `<span class="achip slate">${ic("user", 12)}Präsenz ruht</span>`;
    if (P.anwesend) return `<span class="achip prc">${ic("user", 12)}jemand da · ${P.modus === "exact" ? "" : "mind. "}${num(P.temp, 1)}°</span>`;
    if (P.roh) return `<span class="achip slate">${ic("user", 12)}Bewegung erkannt</span>`;
    return `<span class="achip ${P.leerlauf ? "amber" : "slate"}">${ic("user", 12)}leer${P.zuletzt ? " seit " + f(m(P.zuletzt)) : ""}${P.leerlauf ? ` · −${num(P.leerlauf_k, 1)} K` : ""}</span>`;
  }
  _rkAct(a, b) {
    const L = this._cfg.layout;
    if (a === "rkmenu") { this._modal = { type: "rkmenu", id: b.dataset.id }; this._renderModal(); return true; }
    if (a === "rkhtr") { this._modal = { type: "rkhtr", id: b.dataset.id }; this._renderModal(); return true; }
    if (a === "rktype") { const t = { ...(L.rtype || {}) }; if (b.dataset.k) t[this._modal.id] = b.dataset.k; else delete t[this._modal.id]; L.rtype = t; }
    else if (a === "rkold") L.rk = { ...(L.rk || {}), old: !this._rkCfg().old };
    else if (a === "rkanim") L.rk = { ...(L.rk || {}), anim: b.dataset.k };
    else if (a === "rktanim") L.rk = { ...(L.rk || {}), tanim: b.dataset.k };
    else return false;
    this._saveLayout(); this._render(); this._renderModal(); return true;
  }
