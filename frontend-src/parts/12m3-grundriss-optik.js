  /* ================= Modul 0 · Grundriss-Optik (v0.5) =================
     Detaillierte Darstellung des Plans: Wände mit Stärke (Außenwände kräftiger als Innenwände), Böden je Raumart (Parkett, Fliesen,
     Teppich, Pflaster draußen), Türen mit Türblatt und Schwenkbogen, Fenster mit Rahmen und Glas (offen = gelb, aus dem Kontakt),
     Treppen mit Stufen und Laufrichtung, Raumnamen mit Symbol und Fläche in m², Maßketten, Nordpfeil und Maßstab. Drei Stile:
     „Modern“ (dunkel), „Bauplan“ (blau mit weißen Linien) und „Hell“ (Papier). Stil und „Maße“ merkt sich der Browser. */
  _grStyle() { let s = this._grSty; if (!s) { try { s = localStorage.getItem("fh_gr_style"); } catch (_) { /* privater Modus */ } } return ["modern", "bauplan", "hell", "karte"].includes(s) ? s : "modern"; }
  _grDimsOn() { if (this._grDim == null) { try { this._grDim = localStorage.getItem("fh_gr_dims") === "1"; } catch (_) { this._grDim = false; } } return this._grDim; }
  _grTheme(s) {
    return {
      modern: { bg: "#0d1524", grid: "#ffffff0d", gridDot: true, wall: "#d7dee8", wallIn: "#b9c3d1", shadow: true, text: "#f1f5f9", sub: "#94a3b8", leaf: "#e2e8f0", arc: "#64748b", glass: "#7dd3fc", frame: "#e2e8f0", open: "#fbbf24", dim: "#64748b", stair: "#94a3b8", accent: "#2dd4bf",
        fl: { holz: ["#33291f", "#3f3226", "#2c241b"], fliese: ["#1c2633", "#2a3747"], teppich: ["#262a3a", "#2f3448"], aussen: ["#18241f", "#22322a"], technik: ["#22262d", "#2c3139"] } },
      bauplan: { bg: "#0a3566", grid: "#ffffff12", gridDot: false, wall: "url(#U_hatchW)", wallIn: "url(#U_hatchW)", wallStroke: "#e0f2fe", shadow: false, text: "#ffffff", sub: "#bae6fd", leaf: "#ffffff", arc: "#93c5fd", glass: "#bae6fd", frame: "#ffffff", open: "#fde047", dim: "#bae6fd", stair: "#e0f2fe", accent: "#fde047",
        fl: { holz: ["#0a3566", "#ffffff10", "#0a3566"], fliese: ["#0a3566", "#ffffff14"], teppich: ["#0a3566", "#ffffff0a"], aussen: ["#0a3566", "#ffffff12"], technik: ["#0a3566", "#ffffff0d"] } },
      karte: { bg: "#f2efe9", grid: "#00000000", gridDot: false, wall: "#8a8175", wallIn: "#9c9387", shadow: false, text: "#33312e", sub: "#6e6a63", leaf: "#6b645a", arc: "#b3aa9c", glass: "#7cb9e8", frame: "#6b645a", open: "#c2410c", dim: "#6e6a63", stair: "#8a8175", accent: "#0d9488",
        fl: { holz: ["#ebe1d3", "#e0d4c2", "#e6dbcb"], fliese: ["#efe9de", "#ddd4c4"], teppich: ["#ece3d8", "#dfd3c4"], aussen: ["#cfe8b8", "#b9d99f"], technik: ["#ddd8cf", "#cdc6ba"] } },
      hell: { bg: "#f7f4ee", grid: "#00000009", gridDot: false, wall: "#1f2430", wallIn: "#3b4252", shadow: true, text: "#111827", sub: "#6b7280", leaf: "#111827", arc: "#9ca3af", glass: "#38bdf8", frame: "#111827", open: "#d97706", dim: "#6b7280", stair: "#4b5563", accent: "#0d9488",
        fl: { holz: ["#ead9bf", "#dcc6a4", "#e3cfb1"], fliese: ["#e8edf2", "#cfd7e0"], teppich: ["#ece7f4", "#e0d9ee"], aussen: ["#e4e9dc", "#cfd9c3"], technik: ["#e7e7e4", "#d5d5d0"] } },
    }[s];
  }
  /* Raumart aus Name oder Bereich: Boden und Symbol */
  _grKind(r) {
    const a = this._grArea ? this._grArea(r) : null, n = `${r.n || ""} ${a ? a.name || "" : ""}`.toLowerCase();
    const K = [
      [/terrasse|balkon|garten|loggia|einfahrt|hof|carport/, "aussen", "tree"], [/garage/, "aussen", "car"],
      [/bad|dusche|wc|toilette|gäste-wc|gaeste/, "fliese", /wc|toilette/.test(n) ? "toilet" : "bath"], [/küche|kueche|koch/, "fliese", "pot"],
      [/hwr|hauswirtschaft|wasch|technik|heiz|keller|abstell|vorrat|speis/, "technik", /wasch/.test(n) ? "laundry" : /heiz|technik/.test(n) ? "flame" : "package"],
      [/schlaf|eltern/, "holz", "bed"], [/kind|baby/, "holz", "baby"], [/büro|buero|arbeit|office/, "holz", "desk"], [/gäste|gast/, "holz", "bed"],
      [/wohn|lounge|tv/, "holz", "sofa"], [/ess/, "holz", "dining"], [/flur|diele|eingang|gang|treppenhaus/, "fliese", "door"], [/ankleide|garderobe/, "teppich", "wardrobe"],
    ];
    const hit = K.find(([rx]) => rx.test(n));
    return hit ? { k: hit[1], i: hit[2] } : { k: "teppich", i: "home" };
  }
  /* Raumnamen (Build 10 neu): Schrift passt sich der Raumbreite an (kleiner, sonst zweizeilig oder gekürzt), die Plakette liegt ganz im Raum
     und meidet Melder, Lampen, Türen, Treppen, Geräte, Technik und die Temperatur-Marke. Ohne Platz: zuerst ohne Symbol, dann ohne Fläche. */
  /* 2026.11.4.1 Build 1 (Handy-Ansicht): Die Plakette bleibt immer im Raum. Findet sie keinen freien Platz, wird sie nicht mehr
     in die Mitte „geworfen“, sondern im Raum verkleinert und gekürzt – Symbole dürfen dann überdeckt werden, die Wand nie.
     Jede Zeile wird so gekürzt, dass sie in die Raumbreite passt. Mit o.upx (Handy, Status-Leiste) rechnet die Schrift in Bildschirm-Pixeln. */
  _grLabels(rs, items, o, T, kinds, NF, sc, f1, q) {
    let d = "";
    const skip = o.skip || null;
    const obsAll = items.filter((i) => ["l", "m", "d", "s", "g", "h", "f"].includes(i.t) && !(skip && skip.has(i))).map((i) => (i.t === "s" ? [i.x, i.y, i.x + (i.w || 60), i.y + (i.h || 90)] : i.t === "d" || i.t === "f" ? [i.x - 14, i.y - 14, i.x + 14, i.y + 14] : [i.x - 12 * q, i.y - 12 * q, i.x + 12 * q, i.y + 12 * q]));
    const tw = (t, f) => [...String(t)].length * f * 0.6;
    rs.forEach((r) => {
      const inR = (x, y) => !this._sfInRoom || this._sfInRoom(r, x, y), k = kinds.get(r.id), m2 = this._grAreaM2(r, sc), [cx0, cy0] = this._grCen(r);
      const nm = r.n || (this._grArea && this._grArea(r) ? this._grArea(r).name : "Raum"), chip = (this._grChipAt || {})[r.id];
      const obs = obsAll.concat(chip ? [chip] : [], o.obs || []);   /* Temperatur-Marke (und was der Aufrufer freihalten will) */
      const U = o.upx || 0, maxW = Math.max(U ? 24 * U : 30, r.w - (U ? 10 * U : 18));
      const base = U ? 11.5 * U : Math.max(9, Math.min(15, r.w / 9)) * (o.narrow ? 1.25 : 1), minF = U ? 8.5 * U : 7.5 * (o.narrow ? 1.15 : 1);
      const fitL = (ls, f) => ls.map((x) => { if (tw(x, f) <= maxW - 15) return x; const n = Math.max(2, Math.floor((maxW - 16) / (f * 0.6)) - 1); return [...x].slice(0, n).join("") + "…"; });
      let fz = Math.min(base, (maxW - 16) / Math.max(1, [...nm].length * 0.6)), lines = [nm];
      if (fz < minF) {   /* zweizeilig an Leerzeichen, Bindestrich oder „s“-Fuge, sonst kürzen */
        /* 2026.11.4.1: Wortfugen statt Wortmitte – „Sport-/zimmer“, „Ankleide-/zimmer“ (vorher „Sportz/immer“) */
        const sp = nm.search(/[ \-\u2010]/), fu = sp > 0 ? -1 : (nm.match(/^(.{2,}?)(zimmer|raum|räume|kammer|keller|küche|bad|büro|flur|diele|garage|boden|stube|ecke|platz|terrasse|balkon|garten|werkstatt|schlafen|wohnen|essen)$/i) || [])[1];
        const cut = sp > 0 ? sp : fu ? fu.length : Math.ceil(nm.length / 2), a1 = sp > 0 ? nm.slice(0, cut + (nm[cut] === "-" ? 1 : 0)).trim() : nm.slice(0, cut) + "-", a2 = nm.slice(cut + (sp > 0 && nm[cut] === "-" ? 1 : 0)).trim();
        lines = a2 ? [a1, a2] : [nm]; fz = Math.min(base, (maxW - 16) / Math.max(1, Math.max(...lines.map((x) => [...x].length)) * 0.6));
        if (fz < minF) { fz = minF; const n = Math.max(3, Math.floor((maxW - 16) / (fz * 0.6)) - 1); lines = lines.map((x) => ([...x].length > n ? [...x].slice(0, n).join("") + "…" : x)); }
      }
      const area = o.sub ? String(o.sub(r) || "") : m2 >= 0.5 ? `${f1(m2)} m²` : "", dim = o.sub ? "" : o.dims && !(r.pts && r.pts.length >= 3) ? ` · ${f1(r.w / sc)} × ${f1(r.h / sc)} m` : "";
      const variants = [{ ico: true, ar: true, s: 1 }, { ico: false, ar: true, s: 1 }, { ico: false, ar: true, s: 0.85 }, { ico: false, ar: true, s: 0.72 }, { ico: false, ar: false, s: 0.85 }];
      const fz0 = fz;
      let pick = null;
      for (const v of variants) {
        fz = Math.max(minF * 0.9, fz0 * v.s);
        const ls = fitL(lines, fz), sub = v.ar && tw(area + dim, fz * 0.78) <= maxW - 12 ? area + dim : v.ar && tw(area, fz * 0.78) <= maxW - 12 ? area : "";
        const w = Math.min(maxW, Math.max(...ls.map((x) => tw(x, fz)), tw(sub, fz * 0.78)) + 16), lh = fz * 1.2, h = ls.length * lh + (sub ? fz * 1.05 : 0) + 8, ih = v.ico && !(Math.min(r.w, r.h) < (U ? 70 * U : 80)) && ICONS[k.i] ? (U ? 16 * U : 22 * NF) : 0;
        if (v.ico && !ih) continue;
        const fits = (x, y) => { const x0 = x - w / 2, x1 = x + w / 2, y0 = y - h / 2 - ih, y1 = y + h / 2; return [[x0, y0], [x1, y0], [x0, y1], [x1, y1], [x, y0], [x, y1], [x0, y], [x1, y]].every((p) => inR(p[0], p[1])) && !obs.some((b) => b[0] < x1 + 2 && b[2] > x0 - 2 && b[1] < y1 + 2 && b[3] > y0 - 2); };
        const cand = [];
        for (let gy = 0; gy <= 8; gy++) for (let gx = 0; gx <= 8; gx++) { const x = r.x + (r.w * (gx + 0.5)) / 9, y = r.y + (r.h * (gy + 0.5)) / 9; cand.push([x, y, Math.hypot(x - cx0, (y - cy0) * 1.3)]); }
        cand.sort((A, B) => A[2] - B[2]);
        const hit = cand.find(([x, y]) => fits(x, y));
        if (hit) { pick = { x: hit[0], y: hit[1], w, h, lh, sub, ih, ls }; break; }
      }
      if (!pick) {   /* Kein freier Platz: im Raum bleiben, Symbole notfalls überdecken (vorher: Raummitte, auch über die Wand hinaus) */
        const inside = (x, y, w, h) => { const x0 = x - w / 2, x1 = x + w / 2, y0 = y - h / 2, y1 = y + h / 2; return [[x0, y0], [x1, y0], [x0, y1], [x1, y1], [x, y0], [x, y1]].every((p) => inR(p[0], p[1])); };
        for (const [s2, strict] of [[1, 1], [0.85, 1], [0.72, 1], [0.6, 1], [0.85, 0], [0.72, 0], [0.6, 0]]) {   /* erst ohne Symbole zu überdecken, dann notfalls darüber */
          fz = Math.max(minF * 0.8, fz0 * s2); const ls = fitL(lines, fz), lh = fz * 1.2, w = Math.min(maxW, Math.max(...ls.map((x) => tw(x, fz))) + 12), h = ls.length * lh + 6;
          const cand = []; for (let gy = 0; gy <= 8; gy++) for (let gx = 0; gx <= 8; gx++) { const x = r.x + (r.w * (gx + 0.5)) / 9, y = r.y + (r.h * (gy + 0.5)) / 9; cand.push([x, y, Math.hypot(x - cx0, (y - cy0) * 1.3) + (obs.some((b) => b[0] < x + w / 2 && b[2] > x - w / 2 && b[1] < y + h / 2 && b[3] > y - h / 2) ? 1e4 : 0)]); }
          cand.sort((A, B) => A[2] - B[2]); const hit = cand.find(([x, y, sc2]) => inside(x, y, w, h) && (!strict || sc2 < 1e4));
          if (hit) { pick = { x: hit[0], y: hit[1], w, h, lh, sub: "", ih: 0, ls }; break; }
        }
        if (!pick) { fz = Math.max(minF * 0.75, Math.min(fz0, (r.h - 6) / 1.25)); const ls = fitL([lines.join(" ")], fz), lh = fz * 1.2; pick = { x: cx0, y: cy0, w: Math.min(maxW, tw(ls[0], fz) + 10), h: lh + 4, lh, sub: "", ih: 0, ls }; }
      }
      const { x, y, w, h, lh, sub, ih, ls: lines2 } = pick, top = y - h / 2; lines = lines2;
      const isz = U ? 14 * U : 20 * NF, ico = ih ? `<g transform="translate(${x - isz / 2} ${top - ih}) scale(${isz / 24})" fill="none" stroke="${T.sub}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[k.i]}</g>` : "";
      const plate = o.style === "modern" ? `<rect x="${x - w / 2}" y="${top}" width="${w}" height="${h}" rx="${Math.min(10, fz * 0.6)}" fill="#0b1220" opacity=".55"/>` : "";
      d += `<g pointer-events="none">${ico}${plate}${lines.map((t, n) => `<text x="${x}" y="${top + 4 + lh * (n + 0.8)}" text-anchor="middle" font-size="${fz}" font-weight="700" fill="${T.text}">${esc(t)}</text>`).join("")}${sub ? `<text x="${x}" y="${top + 4 + lh * lines.length + fz * 0.8}" text-anchor="middle" font-size="${fz * 0.78}" font-weight="${o.subCol && o.subCol(r) ? 700 : 400}" fill="${(o.subCol && o.subCol(r)) || T.sub}">${esc(sub)}</text>` : ""}</g>`;   /* o.sub/o.subCol: eigene zweite Zeile, z. B. Lichtkarte „75 % · 2 von 3 an“ */
    });
    return d;
  }
  _grPoly(r) { return r.pts && r.pts.length >= 3 ? r.pts : [[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]]; }
  _grAreaM2(r, sc) { const p = this._grPoly(r); let s = 0; p.forEach((a, i) => { const b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; }); return Math.abs(s) / 2 / (sc * sc); }
  _grCen(r) { if (!(r.pts && r.pts.length >= 3)) return [r.x + r.w / 2, r.y + r.h / 2]; const n = r.pts.length; return [r.pts.reduce((a, p) => a + p[0], 0) / n, r.pts.reduce((a, p) => a + p[1], 0) / n]; }
  /* Der ganze Plan einer Etage als SVG. o: { style, dims, layers: {licht, sf}, narrow } → { vb, svg }
     Ab Build 6 auch als Unterlage für Baukasten, Wärmekarte und Modul 11: labels (Raumnamen), windows, doors, stairs, deco (Nordpfeil/Maßstab),
     cover (Fläche, die der Hintergrund mindestens abdeckt), click (Räume antippbar → Raum-Blatt), now (Ebene „Jetzt“), bgImg. */
  _grDraw(P, fl, o) {
    const T = this._grTheme(o.style), items = (P.items || []).filter((i) => i.fl === fl), rs = items.filter((i) => i.t === "r"), sc = P.scale > 0 ? P.scale : 40;
    const u = "gd" + (this.constructor._gdN = ((this.constructor._gdN || 0) + 1) % 1e6) + "_", st = this._hass.states, NF = o.narrow ? 1.6 : 1, f1 = (v) => v.toLocaleString("de-DE", { maximumFractionDigits: 1 });
    const pathOf = (r) => "M" + this._grPoly(r).map((p) => p[0] + " " + p[1]).join("L") + "Z";
    const bxl = [...rs, ...items.filter((i) => i.t === "o" && i.w)], bx = bxl.length ? bxl.reduce((a, i) => ({ x0: Math.min(a.x0, i.x), y0: Math.min(a.y0, i.y), x1: Math.max(a.x1, i.x + i.w), y1: Math.max(a.y1, i.y + i.h) }), { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 }) : { x0: 0, y0: 0, x1: 800, y1: 480 };
    o = { labels: true, windows: true, doors: true, stairs: true, deco: true, bgImg: true, ...o };
    const pad = (o.dims ? 70 : 40) + (o.layers && o.layers.sun ? 34 : 0),   /* Sonne: Platz für das Symbol außen */ vb = { x: bx.x0 - pad, y: bx.y0 - pad, w: bx.x1 - bx.x0 + pad * 2, h: bx.y1 - bx.y0 + pad * 2 + 34 };
    const W = (T.wall || "").replace("U_", u), WI = (T.wallIn || "").replace("U_", u), kinds = new Map(rs.map((r) => [r.id, this._grKind(r)]));
    /* Muster: Böden in Plan-Einheiten (40 = 1 m) */
    const F = T.fl;
    const FM = {};   /* v0.16 A4: Böden mit eigenem Belag – Muster nur für benutzte Beläge */
    if (this._grFmKey) rs.forEach((r) => this._grFmKey(r, kinds.get(r.id).k, FM));
    let d = `<defs>
      <pattern id="${u}holz" width="180" height="40" patternUnits="userSpaceOnUse"><rect width="180" height="40" fill="${F.holz[0]}"/><rect y="10" width="180" height="10" fill="${F.holz[2]}"/><rect y="30" width="180" height="10" fill="${F.holz[2]}"/><path d="M0 10H180M0 20H180M0 30H180M0 40H180M40 0V10M130 0V10M85 10V20M175 10V20M20 20V30M110 20V30M65 30V40M155 30V40" stroke="${F.holz[1]}" stroke-width="1"/></pattern>
      <pattern id="${u}fliese" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="${F.fliese[0]}"/><path d="M0 0.5H24M0.5 0V24" stroke="${F.fliese[1]}" stroke-width="1.2"/></pattern>
      <pattern id="${u}teppich" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="${F.teppich[0]}"/><circle cx="5" cy="5" r="1" fill="${F.teppich[1]}"/></pattern>
      <pattern id="${u}aussen" width="40" height="20" patternUnits="userSpaceOnUse"><rect width="40" height="20" fill="${F.aussen[0]}"/><path d="M0 0.5H40M0 10.5H40M20.5 0V10M0.5 10V20M40 10V20" stroke="${F.aussen[1]}" stroke-width="1.4"/></pattern>
      <pattern id="${u}technik" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" fill="${F.technik[0]}"/><path d="M0 0.5H16" stroke="${F.technik[1]}" stroke-width="1"/></pattern>
      ${this._grFmPats ? this._grFmPats(u, FM, T, o) : ""}
      <pattern id="${u}hatchW" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="${T.wallStroke ? "#0a3566" : T.bg}"/><path d="M0 0V6" stroke="${T.wallStroke || T.wall}" stroke-width="2.2"/></pattern>
      ${T.gridDot ? `<pattern id="${u}grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="${T.grid}"/></pattern>` : `<pattern id="${u}grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="${T.grid}" stroke-width="1"/></pattern>`}
      <filter id="${u}sh" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="${(o.style === "hell" || o.style === "karte") ? 3 : 6}" stdDeviation="${(o.style === "hell" || o.style === "karte") ? 4 : 8}" flood-color="#000" flood-opacity="${(o.style === "hell" || o.style === "karte") ? 0.18 : 0.55}"/></filter>
      <marker id="${u}ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 1L9 5L0 9z" fill="${T.stair}"/></marker>
    </defs>
    ${o.bare ? "" : `<rect x="${vb.x}" y="${vb.y}" width="${vb.w}" height="${vb.h}" fill="${T.bg}"/>${o.cover ? `<rect x="${o.cover.x}" y="${o.cover.y}" width="${o.cover.w}" height="${o.cover.h}" fill="${T.bg}"/>` : ""}<rect x="${Math.min(vb.x, o.cover ? o.cover.x : vb.x)}" y="${Math.min(vb.y, o.cover ? o.cover.y : vb.y)}" width="${Math.max(vb.w, o.cover ? o.cover.w + 400 : 0)}" height="${Math.max(vb.h, o.cover ? o.cover.h + 400 : 0)}" fill="url(#${u}grid)"/>`}`;   /* bare: ohne Hintergrund */
    const bg = (P.bg || {})[fl]; if (bg && o.bgImg) d += `<image href="${esc(bg)}" x="${bx.x0}" y="${bx.y0}" width="${bx.x1 - bx.x0}" height="${bx.y1 - bx.y0}" opacity=".22" preserveAspectRatio="xMidYMid meet"/>`;
    const out = rs.filter((r) => kinds.get(r.id).k === "aussen" || r.ds), ins = rs.filter((r) => !out.includes(r));
    if (this._grMobLayer) d += this._grMobLayer(P, fl, T, o, "aussen", st);   /* Build 10: Grundstück, Rasen, Wege, Pool … unter den Räumen */
    /* 1) Außenflächen: Pflaster, gestrichelter Rand */
    out.forEach((r) => { d += `<path d="${pathOf(r)}" fill="url(#${u}${this._grFmKey ? this._grFmKey(r, kinds.get(r.id).k, FM) : kinds.get(r.id).k})" stroke="${T.sub}" stroke-width="2" stroke-dasharray="8 6" opacity=".9"/>`; });
    /* 2) Wände: dicke Kontur aller Innenräume (wird zur Außenwand), darüber Böden mit dünner Kontur (Innenwand). Gemeinsame Kanten bleiben dünn. */
    d += `<g${T.shadow ? ` filter="url(#${u}sh)"` : ""}>${ins.map((r) => `<path d="${pathOf(r)}" fill="${o.style === "bauplan" ? "#0a3566" : T.wallIn.startsWith("url") ? T.bg : T.wallIn}" stroke="${W}" stroke-width="16" stroke-linejoin="miter"/>`).join("")}</g>`;
    d += ins.map((r) => `<path d="${pathOf(r)}" fill="url(#${u}${this._grFmKey ? this._grFmKey(r, kinds.get(r.id).k, FM) : kinds.get(r.id).k})" stroke="${WI}" stroke-width="6" stroke-linejoin="miter"${o.click ? ` data-act="grxroom" data-k="${esc(r.id)}" style="cursor:pointer"` : ""}/>`).join("");
    if (o.click) out.forEach((r) => { d += `<path d="${pathOf(r)}" fill="transparent" data-act="grxroom" data-k="${esc(r.id)}" style="cursor:pointer"/>`; });
    /* 3) Freie Wände */
    items.filter((i) => i.t === "w").forEach((w) => { d += `<line x1="${w.x}" y1="${w.y}" x2="${w.x2}" y2="${w.y2}" stroke="${WI}" stroke-width="7" stroke-linecap="square"/>`; });
    if (this._grMobLayer && (!o.layers || o.layers.mo)) d += this._grMobLayer(P, fl, T, o, "innen", st);   /* Build 10: Möbel */
    if (o.layers && o.layers.sun && this._grSunSvg) { const SG = this._grSunSvg(P, fl, T, u, ins, bx); this._grSunLast = SG; d += SG.svg; }   /* Build 10: Sonnenlicht */
    /* 4) Türen, Durchgänge, Fenster, Treppen, Text */
    const floorAtR = (i) => { const an = ((i.r || 0) * Math.PI) / 180, nx = -Math.sin(an) * 10, ny = Math.cos(an) * 10, inR = (q, x, y) => (this._sfInRoom ? this._sfInRoom(q, x, y) : x > q.x && x < q.x + q.w && y > q.y && y < q.y + q.h); const r = ins.find((q) => inR(q, i.x + nx, i.y + ny) || inR(q, i.x - nx, i.y - ny)); return r ? `url(#${u}${kinds.get(r.id).k})` : T.bg; };
    items.forEach((i) => {
      const rot = i.r ? `rotate(${i.r} ${i.x} ${i.y})` : "", mir = i.mh || i.mv ? ` translate(${i.x} ${i.y}) scale(${i.mh ? -1 : 1} ${i.mv ? -1 : 1}) translate(${-i.x} ${-i.y})` : "";
      if ((i.t === "d" && o.doors) || (i.t === "f" && o.windows)) d += this._grOpenSvg(i, T, WI, i.t === "d" ? floorAtR(i) : T.bg, P.scale > 0 ? P.scale : 40, st, P, (o.style === "hell" || o.style === "karte"));   /* Build 7: alle Arten, jede Breite, jeder Winkel */
      else if (i.t === "s" && o.stairs) d += this._grStairSvg ? this._grStairSvg(i, T, u) : "";   /* Build 7: Treppenarten */
      else if (i.t === "a" && o.doors && this._grAwnSvg) d += this._grAwnSvg(i, T, P.scale > 0 ? P.scale : 40, st, u);   /* Build 7: Markise */
      else if (i.t === "x") d += `<text x="${i.x}" y="${i.y}" font-size="${12 * NF}" font-style="italic" fill="${T.sub}">${esc(i.n || "")}</text>`;
    });
    /* 5) Raumnamen und „Jetzt“ – vor den Lampen und Meldern, damit diese immer sichtbar oben liegen (Build 10) */
    const q = o.narrow ? 1.4 : 1;
    /* 2026.11.4.1: Handy – Status-Leiste je Raum (Temperatur, Geräte, Melder, Lampen); die Symbole erscheinen dann nur dort */
    const SP = o.strip && this._grStrip ? this._grStrip(P, fl, rs, items, o, T, vb) : null;
    if (SP) o = { ...o, upx: SP.upx, skip: SP.skip, obs: (o.obs || []).concat(SP.boxes) };
    if (o.layers && o.layers.ht && this._grRadObs) { const RO = this._grRadObs(P, fl, sc); if (RO.length) o = { ...o, obs: (o.obs || []).concat(RO) }; }   /* Raumnamen nicht unter die Heizkörper-Temperatur legen */
    this._grChipAt = {}; const nowSvg = o.now ? this._grNow(P, fl, rs, SP ? { ...o, noChip: true } : o, T) : "";   /* merkt sich, wo Temperatur-Marken sitzen */
    if (o.labels) d += this._grLabels(rs, items, o, T, kinds, NF, sc, f1, q);
    d += nowSvg;
    /* 6) Ebenen: Lampen (Modul 18) und Melder (Modul 11) */
    if (o.layers.licht) items.filter((i) => i.t === "l" && i.e && !(SP && SP.skip.has(i))).forEach((i, n) => {
      const s2 = st[i.e], on = !!(s2 && s2.state === "on"), c = on && this._liLampHex ? this._liLampHex(i.e) : "#64748b", g = `${u}lg${n}`;
      d += `<g><title>${esc(this._wzName(i.e))} · ${on ? "an" : s2 && s2.state === "unavailable" ? "offline" : "aus"}</title>${on ? `<radialGradient id="${g}"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient><circle cx="${i.x}" cy="${i.y}" r="${46 * q}" fill="url(#${g})"/>` : ""}
        ${i.k === "streifen" ? `<rect x="${i.x - 22 * q}" y="${i.y - 3.5 * q}" width="${44 * q}" height="${7 * q}" rx="${3.5 * q}" fill="${c}" stroke="${on ? "#fff" : T.sub}" stroke-width="1.4"${i.r ? ` transform="rotate(${i.r} ${i.x} ${i.y})"` : ""}/>` : `<circle cx="${i.x}" cy="${i.y}" r="${(i.k === "spot" ? 5 : 8) * q}" fill="${c}" stroke="${on ? "#fff" : T.sub}" stroke-width="1.8"/>`}</g>`;
    });
    if ((o.layers.ht || o.layers.nf) && this._grTechSvg) d += this._grTechSvg(P, fl, T, q, u, (o.style === "hell" || o.style === "karte"), o.layers.ht ? "" : "notfall");   /* Build 9: Haustechnik, Notfall-Punkte */
    if (o.layers.gt && this._grDevSvg) d += this._grDevSvg(P, fl, T, q, u, (o.style === "hell" || o.style === "karte"), SP ? SP.skip : null);   /* Build 7: mobile Heizer und Entfeuchter */
    if (o.layers.sf) items.filter((i) => i.t === "m" && !(SP && SP.skip.has(i))).forEach((i) => {
      const s2 = i.e && st[i.e], al = !!(s2 && s2.state === "on");
      d += `<g><title>${esc(i.e ? this._wzName(i.e) : "Melder")}${al ? " · Alarm" : ""}</title><circle cx="${i.x}" cy="${i.y}" r="${10 * q}" fill="${(o.style === "hell" || o.style === "karte") ? "#fff" : "#111827"}" stroke="${al ? "#ef4444" : "#f87171"}" stroke-width="2"/><g transform="translate(${i.x - 6 * q} ${i.y - 6 * q}) scale(${(12 * q) / 24})" fill="none" stroke="${al ? "#ef4444" : "#f87171"}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${ICONS.shield}</g></g>`;
    });
    if (SP) d += SP.svg;
    /* 7) Maßketten außen, Nordpfeil und Maßstab */
    if (o.dims && rs.length) {
      const y = bx.y0 - 38, x = bx.x0 - 38, wm = (bx.x1 - bx.x0) / sc, hm = (bx.y1 - bx.y0) / sc, tick = (x1, y1) => `<path d="M${x1 - 5} ${y1 + 5}L${x1 + 5} ${y1 - 5}" stroke="${T.dim}" stroke-width="1.6"/>`;
      d += `<g font-size="${12 * NF}" fill="${T.dim}"><path d="M${bx.x0} ${y}H${bx.x1}M${bx.x0} ${y - 8}V${bx.y0 - 12}M${bx.x1} ${y - 8}V${bx.y0 - 12}" stroke="${T.dim}" stroke-width="1"/>${tick(bx.x0, y)}${tick(bx.x1, y)}<text x="${(bx.x0 + bx.x1) / 2}" y="${y - 6}" text-anchor="middle">${f1(wm)} m</text>
        <path d="M${x} ${bx.y0}V${bx.y1}M${x - 8} ${bx.y0}H${bx.x0 - 12}M${x - 8} ${bx.y1}H${bx.x0 - 12}" stroke="${T.dim}" stroke-width="1"/>${tick(x, bx.y0)}${tick(x, bx.y1)}<text x="${x - 6}" y="${(bx.y0 + bx.y1) / 2}" text-anchor="middle" transform="rotate(-90 ${x - 6} ${(bx.y0 + bx.y1) / 2})">${f1(hm)} m</text></g>`;
    }
    const sbM = (bx.x1 - bx.x0) / sc > 12 ? 5 : 2, sx = bx.x1 - sbM * sc, sy = bx.y1 + 30;
    if (o.deco) d += `<g fill="${T.dim}" font-size="${11 * NF}"><rect x="${sx}" y="${sy}" width="${sbM * sc / 2}" height="5" fill="${T.dim}"/><rect x="${sx + sbM * sc / 2}" y="${sy}" width="${sbM * sc / 2}" height="5" fill="none" stroke="${T.dim}"/><text x="${sx}" y="${sy - 5}">0</text><text x="${bx.x1}" y="${sy - 5}" text-anchor="end">${sbM} m</text>
      <g transform="translate(${bx.x0 + 10} ${sy - 2}) rotate(${P.north || 0})"><path d="M0 -14L6 4L0 0L-6 4Z" fill="${T.text}"/><text x="12" y="2" font-weight="700" fill="${T.text}">N</text></g></g>`;
    return { vb, svg: d };
  }
