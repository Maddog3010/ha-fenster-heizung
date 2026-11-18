  /* ================= Modul 11 · Grundriss 2.0 (2026.11.4b10) =================
     Ansicht: Reichweite der Melder als weicher Halo, Räume färben sich, im Alarm sucht das Modul den Weg zur nächsten Außentür um die Wände
     im Plan herum (Raster, kürzester Weg) und zeichnet ihn ein. Baukasten: Rückgängig und Wiederholen, Mehrfachauswahl, Türen und Fenster
     rasten an Wänden ein, Maßstab, Räume mit Räumen aus Modul 1 verknüpfen, Plan als Datei sichern und einlesen. Nur Anzeige, keine Steuerung. */
  _sfScale() { const s = this._sfPl().scale; return s > 0 ? s : 40; }
  _sfRangeM(it, d) { return it.rg > 0 ? it.rg : ({ smoke: 5, co: 6, gas: 4, water: 1.5, heat: 4, safety: 4 }[d ? d.k : "smoke"] || 4); }
  _sfMkState(d) { const C = this._sfx().cfg; return !d ? "n" : d.alarm ? "a" : d.paused ? "o" : d.off ? "o" : d.bat != null && d.bat < C.bat.pct ? "w" : "g"; }
  /* Raster des Plans (Zellen zu 10 Bildpunkten): Raumränder und Wände sperren, Türen öffnen eine Lücke */
  _sfGrid(fl) {
    const P = this._sfPl(), C = 10, W = 80, H = 48, B = new Uint8Array(W * H), items = P.items.filter((i) => i.fl === fl);
    const cell = (x, y) => { const cx = Math.floor(x / C), cy = Math.floor(y / C); return cx >= 0 && cx < W && cy >= 0 && cy < H ? cy * W + cx : -1; };
    const mark = (x, y, v) => { const k = cell(x, y); if (k >= 0) B[k] = v; };
    const line = (x1, y1, x2, y2) => { const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 4)); for (let k = 0; k <= n; k++) mark(x1 + ((x2 - x1) * k) / n, y1 + ((y2 - y1) * k) / n, 1); };
    items.forEach((i) => {
      if (i.t === "r" && !i.ds) { const Q = this._sfRP(i); Q.forEach((p, k) => { const q = Q[(k + 1) % Q.length]; line(p[0], p[1], q[0], q[1]); }); }
      else if (i.t === "w") line(i.x, i.y, i.x2, i.y2);
    });
    items.filter((i) => i.t === "d").forEach((i) => { for (let y = i.y - 17; y <= i.y + 17; y += 5) for (let x = i.x - 17; x <= i.x + 17; x += 5) if (Math.hypot(x - i.x, y - i.y) <= 17) mark(x, y, 0); });
    return { B, W, H, C, items, cell };
  }
  /* Türen, die nach draußen führen: eine Seite liegt in einem Raum, die andere nicht. Ohne Räume im Plan zählt jede Tür. */
  _sfExitsOf(fl) {
    const items = this._sfPl().items.filter((i) => i.fl === fl), rooms = items.filter((i) => i.t === "r"), doors = items.filter((i) => i.t === "d");
    const inR = (x, y) => rooms.some((r) => this._sfInRoom(r, x, y, 1));
    const clamp = (x, y) => [Math.max(2, Math.min(798, x)), Math.max(2, Math.min(478, y))];
    const sides = (d) => ((d.r || 0) % 180 === 0 ? [[d.x, d.y - 18], [d.x, d.y + 18]] : [[d.x - 18, d.y], [d.x + 18, d.y]]);
    const stairs = items.filter((i) => i.t === "s");
    if (doors.some((d) => d.ex === 0 || d.ex === 1) || stairs.some((s) => s.ex === 0 || s.ex === 1)) {  /* vom Nutzer markiert: nur diese Ausgänge zählen */
      const ex = doors.filter((d) => d.ex === 1).map((d) => ({ d, out: [d.x, d.y] })).concat(stairs.filter((s) => s.ex === 1).map((s) => ({ d: s, out: [s.x + s.w / 2, s.y + s.h / 2], s: true })));
      return { outdoor: ex, doors, rooms, any: ex.length > 0, explicit: true };
    }
    const out = doors.map((d) => { const [a, b] = sides(d), ia = inR(a[0], a[1]), ib = inR(b[0], b[1]); return { d, out: rooms.length ? (ia && !ib ? clamp(...b) : ib && !ia ? clamp(...a) : null) : clamp(d.x, d.y) }; }).filter((e) => e.out);
    return { outdoor: out, doors, rooms, any: out.length > 0 };
  }
  /* Kürzester Weg vom Melder zur nächsten Außentür (Dijkstra auf dem Raster), danach geglättet. Gibt null zurück, wenn es keine Tür gibt. */
  _sfEscRoute(it) {
    if (!it) return null;
    const G = this._sfGrid(it.fl), { B, W, H, C } = G, X = this._sfExitsOf(it.fl), items = G.items;
    const idx = (x, y) => y * W + x, cellOf = (x, y) => G.cell(x, y);
    let s0 = cellOf(it.x, it.y); if (s0 < 0) return null;
    if (B[s0]) { let found = -1; for (let r = 1; r <= 2 && found < 0; r++) for (let dy = -r; dy <= r && found < 0; dy++) for (let dx = -r; dx <= r; dx++) { const cx = (s0 % W) + dx, cy = Math.floor(s0 / W) + dy; if (cx >= 0 && cx < W && cy >= 0 && cy < H && !B[idx(cx, cy)]) { found = idx(cx, cy); break; } } if (found < 0) return this._sfEscLine(it, X); s0 = found; }
    const goals = new Map();
    X.outdoor.forEach((e) => { const c = cellOf(e.out[0], e.out[1]); if (c >= 0) goals.set(c, { d: e.d, p: { x: e.out[0], y: e.out[1] }, k: e.s ? "s" : "d" }); });
    let kind = "d";
    if (!goals.size) { /* keine Außentür: nächste Tür, sonst Treppe */
      X.doors.forEach((d) => { const c = cellOf(d.x, d.y); if (c >= 0) goals.set(c, { d, p: { x: d.x, y: d.y }, k: "d", unsure: true }); });
      if (!goals.size) { items.filter((i) => i.t === "s").forEach((s) => { for (let y = s.y + 5; y < s.y + s.h; y += 10) for (let x = s.x + 5; x < s.x + s.w; x += 10) { const c = cellOf(x, y); if (c >= 0) goals.set(c, { d: s, p: { x: s.x + s.w / 2, y: s.y + s.h / 2 }, k: "s" }); } }); kind = "s"; }
    }
    if (!goals.size) return null;
    const dist = new Float64Array(W * H).fill(1e9), prev = new Int32Array(W * H).fill(-1), heap = [[0, s0]];
    dist[s0] = 0;
    const push = (e) => { heap.push(e); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { let l = 2 * i + 1, r = l + 1, m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
    let hit = -1;
    while (heap.length) {
      const [dd, c] = pop(); if (dd > dist[c]) continue;
      if (goals.has(c)) { hit = c; break; }
      const cx = c % W, cy = Math.floor(c / W);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue; const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H || B[idx(nx, ny)]) continue;
        if (dx && dy && (B[idx(cx + dx, cy)] || B[idx(cx, cy + dy)])) continue;  /* nicht durch Ecken schneiden */
        const nd = dd + (dx && dy ? 14.14 : 10), n = idx(nx, ny); if (nd < dist[n]) { dist[n] = nd; prev[n] = c; push([nd, n]); }
      }
    }
    if (hit < 0) return this._sfEscLine(it, X);
    const raw = []; for (let c = hit; c >= 0; c = prev[c]) raw.push({ x: (c % W) * C + C / 2, y: Math.floor(c / W) * C + C / 2 }); raw.reverse();
    const g = goals.get(hit); raw[0] = { x: it.x, y: it.y }; raw[raw.length - 1] = g.p;
    const clear = (a, b) => { const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 3); for (let k = 1; k < n; k++) { const c = cellOf(a.x + ((b.x - a.x) * k) / n, a.y + ((b.y - a.y) * k) / n); if (c >= 0 && B[c]) return false; } return true; };
    const pts = [raw[0]]; let i = 0;
    while (i < raw.length - 1) { let j = raw.length - 1; while (j > i + 1 && !clear(raw[i], raw[j])) j--; pts.push(raw[j]); i = j; }
    let len = 0; for (let k = 1; k < pts.length; k++) len += Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y);
    return { pts, m: len / this._sfScale(), exit: g.d, kind: g.k === "s" ? "s" : kind, unsure: !!g.unsure, fallback: false };
  }
  _sfEscLine(it, X) {  /* kein freier Weg: Luftlinie zur nächsten Tür, damit wenigstens die Richtung stimmt */
    const doors = X.doors; if (!doors.length) return null;
    const d = [...doors].sort((a, b) => Math.hypot(a.x - it.x, a.y - it.y) - Math.hypot(b.x - it.x, b.y - it.y))[0];
    return { pts: [{ x: it.x, y: it.y }, { x: d.x, y: d.y }], m: Math.hypot(d.x - it.x, d.y - it.y) / this._sfScale(), exit: d, kind: "d", unsure: true, fallback: true };
  }
  /* Fluchtweg als SVG: gestrichelte Linie, Pfeil, Beschriftung */
  _sfEscSvg(e) {
    const r = e.route, p = r.pts, a = p[p.length - 2], b = p[p.length - 1], ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    const lab = r.fallback ? "Luftlinie · Plan prüfen" : r.kind === "s" ? `Treppe ca. ${num(r.m, 0)} m` : `Fluchtweg ca. ${num(r.m, 0)} m`, w = lab.length * 6.4 + 18, tx = Math.max(w / 2 + 4, Math.min(796 - w / 2, b.x)), ty = b.y + 40 > 470 ? b.y - 30 : b.y + 30;
    return `<path class="sfesc" d="M${p.map((q) => `${q.x.toFixed(0)} ${q.y.toFixed(0)}`).join("L")}"></path><g transform="translate(${b.x.toFixed(0)} ${b.y.toFixed(0)}) rotate(${ang.toFixed(0)})"><path class="sfesa" d="M-6 -9L9 0L-6 9z"></path></g><g><rect class="sfesb" x="${(tx - w / 2).toFixed(0)}" y="${(ty - 11).toFixed(0)}" width="${w.toFixed(0)}" height="22" rx="11"></rect><text class="sfest" x="${tx.toFixed(0)}" y="${(ty + 4).toFixed(0)}">${esc(lab)}</text></g>`;
  }
  /* Halos der Melder (Reichweite) */
  _sfHalos(items, dm) {
    const sc = this._sfScale(), col = { g: "#34d399", w: "#f59e0b", a: "#ef4444", o: "#94a3b8" };
    const defs = `<defs>${Object.keys(col).map((k) => `<radialGradient id="sfhg${k}"><stop offset="0" stop-color="${col[k]}" stop-opacity="${k === "a" ? ".5" : ".26"}"/><stop offset="1" stop-color="${col[k]}" stop-opacity="0"/></radialGradient>`).join("")}</defs>`;
    return defs + items.filter((i) => i.t === "m" && i.e && dm[i.e]).map((i) => { const d = dm[i.e], c = this._sfMkState(d); return c === "n" ? "" : `<circle class="sfhalo" cx="${i.x}" cy="${i.y}" r="${(this._sfRangeM(i, d) * sc).toFixed(0)}" fill="url(#sfhg${c})"></circle>`; }).join("");
  }
  /* Abdeckung: ein Raum gilt als abgedeckt, wenn ein Melder darin sitzt oder seine Reichweite die Raummitte erreicht */
  _sfCoverage(fl) {
    const P = this._sfPl(), dm = this._sfDetMap(), sc = this._sfScale(), rooms = P.items.filter((i) => i.fl === fl && i.t === "r"), mk = P.items.filter((i) => i.fl === fl && i.t === "m");
    const cov = (r) => { const [cx, cy] = this._sfRCen(r); return mk.some((m) => this._sfInRoom(r, m.x, m.y, -1) || Math.hypot(m.x - cx, m.y - cy) <= this._sfRangeM(m, m.e ? dm[m.e] : null) * sc); };
    return { rooms, covered: rooms.filter(cov), open: rooms.filter((r) => !cov(r)) };
  }
  /* Prüft jeden Melder der Etage: Gibt es einen freien Weg zu einer Außentür? */
  _sfEscCheck(fl) {
    const P = this._sfPl(), mk = P.items.filter((i) => i.fl === fl && i.t === "m"), X = this._sfExitsOf(fl);
    const bad = mk.filter((m) => { const r = this._sfEscRoute(m); return !r || r.fallback; });
    return { exits: X.outdoor.length, nd: X.outdoor.filter((e) => !e.s).length, ns: X.outdoor.filter((e) => e.s).length, explicit: !!X.explicit, doors: X.doors.length, markers: mk.length, bad };
  }
  /* Türen und Fenster rasten an der nächsten Wand oder Raumkante ein (nur waagerecht und senkrecht) */
  _sfSnapOpen(fl, x, y) {
    const items = this._sfPl().items.filter((i) => i.fl === fl), segs = [];
    items.forEach((i) => { if (i.t === "r" && !i.ds) { const Q = this._sfRP(i); Q.forEach((p, k) => { const q = Q[(k + 1) % Q.length]; segs.push([p[0], p[1], q[0], q[1]]); }); } else if (i.t === "w") segs.push([i.x, i.y, i.x2, i.y2]); });
    let best = null;
    segs.forEach(([x1, y1, x2, y2]) => {
      const hor = Math.abs(y1 - y2) < 1, ver = Math.abs(x1 - x2) < 1; if (!hor && !ver) return;
      const px = hor ? Math.max(Math.min(x1, x2), Math.min(Math.max(x1, x2), x)) : x1, py = ver ? Math.max(Math.min(y1, y2), Math.min(Math.max(y1, y2), y)) : y1, d = Math.hypot(px - x, py - y);
      if (d <= 18 && (!best || d < best.d)) best = { x: hor ? Math.round(px / 10) * 10 : px, y: ver ? Math.round(py / 10) * 10 : py, r: hor ? 0 : 90, d };
    });
    return best;
  }
  /* Rückgängig und Wiederholen (ohne Hintergrundbilder) */
  _sfSer() { const P = this._sfEd.plan; return JSON.stringify({ f: P.floors, i: P.items, s: P.scale || 40 }); }
  _sfSnap() { const ed = this._sfEd; if (!ed) return; ed.hist = ed.hist || []; ed.fut = []; const j = this._sfSer(); if (ed.hist[ed.hist.length - 1] !== j) { ed.hist.push(j); if (ed.hist.length > 60) ed.hist.shift(); } }
  _sfSnapTrim() { const ed = this._sfEd; if (ed && ed.hist && ed.hist.length && ed.hist[ed.hist.length - 1] === this._sfSer()) ed.hist.pop(); }
  _sfRestore(j) { const ed = this._sfEd, o = JSON.parse(j); ed.plan.floors = o.f; ed.plan.items = o.i; ed.plan.scale = o.s; if (!ed.plan.floors.some((f) => f.id === this._sfFlId)) this._sfFlId = ed.plan.floors[0].id; ed.sel = ""; ed.multi = []; }
  _sfRoomNames() { try { return [...new Set(this._collect0().map((r) => r.name).filter(Boolean))]; } catch (_) { return []; } }
  /* Aktionen und Eingaben des Baukastens, die neu sind */
  _sfxP2(a, b) {
    if (this._sfxR(a, b)) return true;
    const ed = this._sfEd; if (!ed) return false; const P = ed.plan, fl = this._sfFl(), k = b.dataset.k, cur = P.items.find((x) => x.id === ed.sel), uid = () => "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    if (a === "sfxundo") { if (ed.hist && ed.hist.length) { ed.fut = ed.fut || []; ed.fut.push(this._sfSer()); this._sfRestore(ed.hist.pop()); this._render(); } return true; }
    if (a === "sfxredo") { if (ed.fut && ed.fut.length) { ed.hist = ed.hist || []; ed.hist.push(this._sfSer()); this._sfRestore(ed.fut.pop()); this._render(); } return true; }
    if (a === "sfxmm") { ed.mm = !ed.mm; ed.multi = []; ed.sel = ""; ed.tool = "select"; this._render(); return true; }
    if (a === "sfxmclr") { ed.multi = []; this._render(); return true; }
    if (a === "sfxmdel") { this._sfSnap(); const s = new Set(ed.multi); P.items = P.items.filter((x) => !s.has(x.id)); ed.multi = []; this._render(); return true; }
    if (a === "sfxmdup") { this._sfSnap(); const ids = []; P.items.filter((x) => ed.multi.includes(x.id)).forEach((x) => { const c = { ...x, id: uid(), x: x.x + 20, y: x.y + 20 }; if (c.t === "w") { c.x2 += 20; c.y2 += 20; } if (c.t === "m") c.e = ""; P.items.push(c); ids.push(c.id); }); ed.multi = ids; this._render(); return true; }
    if (a === "sfxpscale") { this._sfSnap(); P.scale = Math.round(800 / Number(k)); this._render(); return true; }
    if (a === "sfxprg" && cur && cur.t === "m") { this._sfSnap(); const d = cur.e ? this._sfDetMap()[cur.e] : null, now = this._sfRangeM(cur, d); cur.rg = Math.max(1, Math.min(15, Math.round((now + Number(b.dataset.s) * 0.5) * 2) / 2)); this._render(); return true; }
    if (a === "sfxpexp") { this._sfDeliver(JSON.stringify({ app: "fenster_heizung", modul: "sicherheit", v: 1, plan: P }), `Grundriss-${new Date().toISOString().slice(0, 10)}.json`, "application/json", "Grundriss Modul 11"); return true; }
    return false;
  }
  _sfxP2Change(t) {
    const ed = this._sfEd, f = t.dataset.f, v = t.value || ""; if (!ed) return false; const P = ed.plan, cur = P.items.find((x) => x.id === ed.sel);
    if (f === "sfxplk" && cur && cur.t === "r") { this._sfSnap(); cur.lk = v; if (v && !cur.n) cur.n = v.slice(0, 30); this._render(); return true; }
    if (f === "sfxpimp") {
      const file = t.files && t.files[0]; if (!file) return true;
      const rd = new FileReader();
      rd.onload = () => {
        try {
          const o = JSON.parse(String(rd.result || "")), p = o && o.plan; if (!p || !Array.isArray(p.floors) || !p.floors.length || !Array.isArray(p.items)) throw new Error("form");
          const ids = new Set(p.floors.map((x) => x && x.id)), items = p.items.filter((i) => i && typeof i.id === "string" && ids.has(i.fl) && ["r", "w", "d", "f", "s", "x", "m"].includes(i.t)).slice(0, 300);
          this._sfSnap(); ed.plan.floors = p.floors.filter((x) => x && typeof x.id === "string").slice(0, 6).map((x) => ({ id: x.id, n: String(x.n || x.id).slice(0, 16) })); ed.plan.items = items; ed.plan.scale = Number(p.scale) > 0 ? Number(p.scale) : 40; if (p.bg && typeof p.bg === "object") ed.plan.bg = p.bg;
          this._sfFlId = ed.plan.floors[0].id; ed.sel = ""; ed.multi = []; this._render(); this._toast(`Plan eingelesen: ${items.length} Elemente. Mit „Speichern“ übernehmen.`);
        } catch (_) { this._toast("Die Datei ist kein Grundriss aus diesem Modul"); }
      };
      rd.readAsText(file); t.value = ""; return true;
    }
    return false;
  }
