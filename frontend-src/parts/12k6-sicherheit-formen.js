  /* ================= Modul 11 · Raumformen: Räume sind Rechtecke oder haben freie Eckpunkte (pts) =================
     x, y, w, h bleiben bei freien Formen der umschließende Rahmen, damit Verschieben, Auswahl und Ränder weiter funktionieren. */
  _sfRP(i) { return i.pts && i.pts.length >= 3 ? i.pts : [[i.x, i.y], [i.x + i.w, i.y], [i.x + i.w, i.y + i.h], [i.x, i.y + i.h]]; }
  _sfRLab(i) { if (!i.pts) return [i.x + 10, i.y + 19]; const P = i.pts, t = P.reduce((m, p) => (p[1] < m[1] || (p[1] === m[1] && p[0] < m[0]) ? p : m), P[0]); return [t[0] + 10, t[1] + 19]; }
  _sfRPath(i) { return "M" + this._sfRP(i).map((p) => p[0] + " " + p[1]).join("L") + "Z"; }
  _sfInRoom(i, x, y, m = 0) {
    if (!(i.pts && i.pts.length >= 3)) return x > i.x + m && x < i.x + i.w - m && y > i.y + m && y < i.y + i.h - m;
    const P = i.pts; let c = false;
    for (let a = 0, b = P.length - 1; a < P.length; b = a++) if ((P[a][1] > y) !== (P[b][1] > y) && x < ((P[b][0] - P[a][0]) * (y - P[a][1])) / (P[b][1] - P[a][1]) + P[a][0]) c = !c;
    return c;
  }
  _sfRCen(i) {
    const P = this._sfRP(i); let A = 0, cx = 0, cy = 0;
    for (let k = 0; k < P.length; k++) { const [x1, y1] = P[k], [x2, y2] = P[(k + 1) % P.length], f = x1 * y2 - x2 * y1; A += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f; }
    return Math.abs(A) < 1 ? [i.x + i.w / 2, i.y + i.h / 2] : [cx / (3 * A), cy / (3 * A)];
  }
  _sfRSync(i) { if (!i.pts) return; const xs = i.pts.map((p) => p[0]), ys = i.pts.map((p) => p[1]); i.x = Math.min(...xs); i.y = Math.min(...ys); i.w = Math.max(...xs) - i.x; i.h = Math.max(...ys) - i.y; }
  _sfRShape(i, k) {
    const { x, y, w, h } = i, R = (v) => Math.round(v / 10) * 10, X = (f) => R(x + w * f), Y = (f) => R(y + h * f), E = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    const S = { rect: null, free: E, L: [[x, y], [X(0.55), y], [X(0.55), Y(0.45)], [x + w, Y(0.45)], [x + w, y + h], [x, y + h]], T: [[x, y], [x + w, y], [x + w, Y(0.35)], [X(0.7), Y(0.35)], [X(0.7), y + h], [X(0.3), y + h], [X(0.3), Y(0.35)], [x, Y(0.35)]], U: [[x, y], [X(0.3), y], [X(0.3), Y(0.6)], [X(0.7), Y(0.6)], [X(0.7), y], [x + w, y], [x + w, y + h], [x, y + h]] }[k];
    if (S) i.pts = S.map((p) => [p[0], p[1]]); else delete i.pts;
    this._sfRSync(i);
  }
  _sfRRot(i) { const P = this._sfRP(i), cx = i.x + i.w / 2, cy = i.y + i.h / 2, R = (v) => Math.round(v / 10) * 10; i.pts = P.map((p) => [R(cx - (p[1] - cy)), R(cy + (p[0] - cx))]); this._sfRSync(i); }
  _sfRResize(i, nw, nh) {
    if (!i.pts) { i.w = nw; i.h = nh; return; }
    const ow = Math.max(1, i.w), oh = Math.max(1, i.h), x0 = i.x, y0 = i.y;
    i.pts = i.pts.map((p) => [Math.round((x0 + ((p[0] - x0) * nw) / ow) / 10) * 10, Math.round((y0 + ((p[1] - y0) * nh) / oh) / 10) * 10]); this._sfRSync(i);
  }
  _sfRShift(i, dx, dy) { if (i.pts) i.pts = i.pts.map((p) => [p[0] + dx, p[1] + dy]); }
  /* Eckpunkt-Griffe und „+“ auf den Kanten für den gewählten Raum */
  _sfRHandles(i, vsel) {
    const P = this._sfRP(i), hd = (k, x, y, on) => `<g data-h="${k}"><circle class="sfhh" cx="${x}" cy="${y}" r="16"></circle><circle class="sfvt${on ? " on" : ""}" cx="${x}" cy="${y}" r="7"></circle></g>`;
    let o = P.map((p, k) => hd("v" + k, p[0], p[1], vsel === k)).join("");
    o += P.map((p, k) => { const q = P[(k + 1) % P.length], mx = Math.round((p[0] + q[0]) / 20) * 10, my = Math.round((p[1] + q[1]) / 20) * 10; return Math.hypot(q[0] - p[0], q[1] - p[1]) < 40 ? "" : `<g data-h="a${k}"><circle class="sfhh" cx="${mx}" cy="${my}" r="14"></circle><circle class="sfad" cx="${mx}" cy="${my}" r="6"></circle><path class="sfap2" d="M${mx - 3} ${my}h6M${mx} ${my - 3}v6"></path></g>`; }).join("");
    return o;
  }
  /* Aktionen im Bearbeiten-Modus */
  _sfxR(a, b) {
    const ed = this._sfEd; if (!ed) return false;
    const cur = ed.plan.items.find((x) => x.id === ed.sel); if (!cur || cur.t !== "r") return false;
    const k = b.dataset.k, s = Number(b.dataset.s);
    if (a === "sfxshape") { this._sfSnap(); this._sfRShape(cur, k); ed.vsel = -1; this._render(); return true; }
    if (a === "sfxrrot") { this._sfSnap(); this._sfRRot(cur); this._render(); return true; }
    if (a === "sfxvdel") { if (cur.pts && cur.pts.length > 3 && ed.vsel >= 0) { this._sfSnap(); cur.pts.splice(ed.vsel, 1); ed.vsel = -1; this._sfRSync(cur); this._render(); } return true; }
    if (a === "sfxvx" || a === "sfxvy") { if (cur.pts && ed.vsel >= 0 && cur.pts[ed.vsel]) { this._sfSnap(); cur.pts[ed.vsel][a === "sfxvx" ? 0 : 1] += s; this._sfRSync(cur); this._render(); } return true; }
    return false;
  }  /* ================= Modul 11 · Raumformen: Räume sind Rechtecke oder haben freie Eckpunkte (pts) =================
     x, y, w, h bleiben bei freien Formen der umschließende Rahmen, damit Verschieben, Auswahl und Ränder weiter funktionieren. */
  _sfRPanel(sel) {
    const ed = this._sfEd, kind = !sel.pts ? "rect" : "free";
    const sh = (k, n, d) => `<button data-act="sfxshape" data-k="${k}" class="${k === "rect" && kind === "rect" ? "on" : ""}"><svg viewBox="0 0 24 24"><path d="${d}"></path></svg>${n}</button>`;
    let o = `<div class="sfshp">${sh("rect", "Rechteck", "M4 5h16v14H4z")}${sh("L", "L-Form", "M4 4h9v7h7v9H4z")}${sh("T", "T-Form", "M4 4h16v6h-5v10H9V10H4z")}${sh("U", "U-Form", "M4 4h5v9h6V4h5v16H4z")}${sh("free", "Frei", "M5 6l8-2 6 6-3 9-9 1z")}</div>`;
    if (sel.pts) {
      o += `<button class="btn2" data-act="sfxrrot" style="flex:none;width:100%;margin:4px 0">Raum drehen (90°)</button>`;
      const v = ed && ed.vsel >= 0 && sel.pts[ed.vsel] ? sel.pts[ed.vsel] : null;
      if (v) o += `<div class="vrow" style="margin:6px 0"><span>Ecke ${ed.vsel + 1} · x</span><div class="step" style="flex:none"><button data-act="sfxvx" data-s="-10" aria-label="links">${ic("minus", 16)}</button><b>${v[0]}</b><button data-act="sfxvx" data-s="10" aria-label="rechts">${ic("plus", 16)}</button></div></div><div class="vrow" style="margin:6px 0"><span>Ecke ${ed.vsel + 1} · y</span><div class="step" style="flex:none"><button data-act="sfxvy" data-s="-10" aria-label="hoch">${ic("minus", 16)}</button><b>${v[1]}</b><button data-act="sfxvy" data-s="10" aria-label="runter">${ic("plus", 16)}</button></div></div><button class="btn2" data-act="sfxvdel" style="flex:none;width:100%;margin:4px 0"${sel.pts.length <= 3 ? " disabled" : ""}>Ecke löschen</button>`;
      else o += `<small class="mut" style="display:block;margin:4px 0">Ecken ziehen, „+“ auf einer Kante fügt eine Ecke hinzu. Ecke antippen für genaue Werte.</small>`;
    }
    return o;
  }
