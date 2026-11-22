  /* ================= Modul 0 Build 7: Baukasten 2.0 – genau statt ungefähr =================
     Raster in Zentimetern (5/10/25/50 cm), Wände rasten auf 15°-Schritte ein, Maße beim Bearbeiten im Plan.
     Türen und Fenster sitzen auf Wänden in jedem Winkel (auch schräg), sind frei drehbar, haben eine Breite und eine Art
     (Drehtür, Doppeltür, Schiebetür, Pendeltür, Falttür, Terrassentür, Garagentor · Fenster, bodentief, Dachfenster, mit Rollladen).
     Abstand zur Ecke wird angezeigt, beim Verschieben eines Raums wandern seine Türen und Fenster mit.
     Plan-Check (Räume ohne Tür, Fenster neben der Wand, Überlappungen, ohne Namen/Bereich, kein Ausgang) mit Beheben per Tipp.
     Maßstab messen: zwei Punkte im Plan (z. B. auf dem Bauplan-Foto) und die echte Länge eingeben. Etage kopieren. Tastatur am PC. */
  _grGridCm() { let v = 25; try { v = Number(localStorage.getItem("fh_gr_grid")) || 25; } catch (_) { /* privater Modus */ } return [5, 10, 25, 50].includes(v) ? v : 25; }
  _grStep() { return Math.max(1, (this._grGridCm() * this._sfScale()) / 100); }
  _grHw(i, sc) { return ((i.b || (i.t === "f" ? 90 : i.t === "a" ? 400 : 80)) / 100) * (sc || this._sfScale()) / 2; }
  _grM(px, sc) { return num(px / (sc || this._sfScale()), 2) + " m"; }
  /* Alle Wandstücke einer Etage: Raumkanten (ohne gestrichelte Räume) und freie Wände */
  _grSegs(fl, P) {
    const segs = [];
    (P || this._sfPl()).items.filter((i) => i.fl === fl).forEach((i) => {
      if (i.t === "r" && !i.ds) { const Q = this._sfRP(i); Q.forEach((p, k) => { const q = Q[(k + 1) % Q.length]; segs.push([p[0], p[1], q[0], q[1], i.id]); }); }
      else if (i.t === "w") segs.push([i.x, i.y, i.x2, i.y2, i.id]);
    });
    return segs;
  }
  _grOnSeg(s, x, y) { const [x1, y1, x2, y2] = s, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy); if (L < 1) return null; const t = Math.max(0, Math.min(L, ((x - x1) * dx + (y - y1) * dy) / L)); return { t, L, d: Math.hypot(x1 + (dx * t) / L - x, y1 + (dy * t) / L - y) }; }
  /* Wo sitzt eine Tür / ein Fenster? Wand, Abstand zu beiden Ecken (in Plan-Punkten) */
  _grOpenInfo(it, P) {
    let best = null;
    this._grSegs(it.fl, P).forEach((s) => { const o = this._grOnSeg(s, it.x, it.y); if (o && o.d <= 3 && o.L > 8 && (!best || o.d < best.d)) best = { ...o, seg: s }; });
    if (!best) return null;
    const hw = this._grHw(it, (P || this._sfPl()).scale || 40);
    return { ...best, a: best.t - hw, b: best.L - best.t - hw };
  }
  /* ---- Zeichnen: Türen und Fenster in allen Arten (für _grDraw) */
  _grOpenSvg(i, T, WI, fill, sc, st) {
    const x = i.x, y = i.y, h = this._grHw(i, sc), rot = i.r ? `rotate(${i.r} ${x} ${y})` : "", mir = i.mh || i.mv ? ` translate(${x} ${y}) scale(${i.mh ? -1 : 1} ${i.mv ? -1 : 1}) translate(${-x} ${-y})` : "";
    if (i.t === "d") {
      const gap = `<rect x="${x - h}" y="${y - 9}" width="${2 * h}" height="18" fill="${fill}"/>`, jamb = `<path d="M${x - h} ${y - 9}v18M${x + h} ${y - 9}v18" stroke="${WI}" stroke-width="3"/>`;
      if (i.dg) return `<g transform="${rot}">${gap}${jamb}</g>`;
      const lc = i.ex === 1 ? T.accent : T.leaf, arc = (d) => `<path d="${d}" fill="none" stroke="${T.arc}" stroke-width="1.3" stroke-dasharray="4 3"/>`, leaf = (d, c, w) => `<path d="${d}" stroke="${c || lc}" stroke-width="${w || 2.6}" stroke-linecap="round" fill="none"/>`;
      let s = "";
      switch (i.dk) {
        case "doppel": s = leaf(`M${x - h} ${y}V${y - h}M${x + h} ${y}V${y - h}`) + arc(`M${x} ${y}A${h} ${h} 0 0 0 ${x - h} ${y - h}M${x} ${y}A${h} ${h} 0 0 1 ${x + h} ${y - h}`); break;
        case "schiebe": s = `<rect x="${x - h}" y="${y - 5}" width="${h * 1.15}" height="3" fill="${lc}"/><rect x="${x - h * 0.15}" y="${y + 2}" width="${h * 1.15}" height="3" fill="${lc}"/>` + arc(`M${x - h * 0.5} ${y - 13}H${x + h * 0.5}M${x + h * 0.5 - 4} ${y - 16}l4 3l-4 3`); break;
        case "pendel": s = leaf(`M${x - h} ${y - 2 * h}V${y + 2 * h}`, null, 2.2) + arc(`M${x + h} ${y}A${2 * h} ${2 * h} 0 0 0 ${x - h} ${y - 2 * h}M${x + h} ${y}A${2 * h} ${2 * h} 0 0 1 ${x - h} ${y + 2 * h}`); break;
        case "falt": s = leaf(`M${x - h} ${y}L${x - h / 2} ${y - h * 0.55}L${x} ${y}L${x + h / 2} ${y - h * 0.55}L${x + h} ${y}`, null, 2.2); break;
        case "garage": s = `<path d="M${x - h} ${y}H${x + h}" stroke="${lc}" stroke-width="4" stroke-dasharray="7 4"/>` + `<rect x="${x - h}" y="${y - h * 1.3}" width="${2 * h}" height="${h * 1.3}" fill="none" stroke="${T.arc}" stroke-width="1.2" stroke-dasharray="5 4"/>`; break;
        case "glas": s = leaf(`M${x - h} ${y}V${y - 2 * h}`, T.glass, 4) + leaf(`M${x - h + 2.5} ${y - 2}V${y - 2 * h + 2}`, T.frame, 1) + arc(`M${x + h} ${y}A${2 * h} ${2 * h} 0 0 0 ${x - h} ${y - 2 * h}`); break;
        default: s = leaf(`M${x - h} ${y}V${y - 2 * h}`) + arc(`M${x + h} ${y}A${2 * h} ${2 * h} 0 0 0 ${x - h} ${y - 2 * h}`);
      }
      const exA = i.ex === 1 ? `<path d="M${x - 6} ${y + 16}l6 6l6-6" fill="none" stroke="${T.accent}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>` : "";
      return `<g transform="${rot}${mir}">${gap}${s}${exA}</g>`;
    }
    const open = !!(i.e && st && st[i.e] && st[i.e].state === "on"), c = open ? T.open : T.glass, ttl = `<title>${{ boden: "Fenster bodentief", dach: "Dachfenster", rollo: "Fenster mit Rollladen" }[i.fk] || "Fenster"}${i.e ? ` · ${esc(this._wzName(i.e))} · ${open ? "offen" : "zu"}` : ""}</title>`;
    if (i.fk === "dach") return `<g transform="${rot}">${ttl}<rect x="${x - h}" y="${y - h * 0.7}" width="${2 * h}" height="${h * 1.4}" fill="${c}" fill-opacity=".18" stroke="${T.frame}" stroke-width="1.6" stroke-dasharray="6 3"/><path d="M${x - h} ${y - h * 0.7}L${x + h} ${y + h * 0.7}M${x + h} ${y - h * 0.7}L${x - h} ${y + h * 0.7}" stroke="${c}" stroke-width="1" opacity=".7"/></g>`;
    const frame = `<rect x="${x - h}" y="${y - 6}" width="${2 * h}" height="12" fill="${T.bg}"/><rect x="${x - h}" y="${y - 6}" width="${2 * h}" height="12" fill="none" stroke="${T.frame}" stroke-width="1.6"/>`;
    const glass = i.fk === "boden" ? `<path d="M${x - h} ${y - 2}H${x + h}M${x - h} ${y + 2}H${x + h}" stroke="${c}" stroke-width="2.2"/><path d="M${x - h + 3} ${y + 9}h${2 * h - 6}" stroke="${T.frame}" stroke-width="1" stroke-dasharray="2 2"/>` : `<path d="M${x - h} ${y}H${x + h}" stroke="${c}" stroke-width="3"/>`;
    const rollo = i.fk === "rollo" ? `<rect x="${x - h}" y="${y - 12}" width="${2 * h}" height="4" rx="1" fill="${T.sub}" opacity=".85"/>` : "";
    return `<g transform="${rot}">${ttl}${frame}${glass}${rollo}${open ? `<path d="M${x - h + 2} ${y - 6}L${x - h + 14} ${y - 20}" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>` : ""}</g>`;
  }
  /* ---- Eigenschaften für Türen und Fenster */
  _grOpenProps(sel) {
    const isD = sel.t === "d", b = sel.b || (isD ? 80 : 90), sc = this._sfScale(), inf = this._grOpenInfo(sel);
    const K = isD ? [["", "Drehtür"], ["doppel", "Doppeltür"], ["schiebe", "Schiebetür"], ["pendel", "Pendeltür"], ["falt", "Falttür"], ["glas", "Terrassentür"], ["garage", "Garagentor"]] : [["", "Fenster"], ["boden", "bodentief"], ["dach", "Dachfenster"], ["rollo", "mit Rollladen"]];
    const cur = isD ? sel.dk || "" : sel.fk || "";
    const kinds = isD && sel.dg ? "" : `<div class="sffld"><label>${isD ? "Bauart" : "Art des Fensters"}</label><div class="grseg">${K.map(([k, t]) => `<button class="${cur === k ? "on" : ""}" data-act="grxok" data-v="${k}">${t}</button>`).join("")}</div></div>`;
    const where = sel.fk === "dach" ? `<div class="grwall ok">${ic("info", 14)}<span>Dachfenster liegen in der Dachfläche, nicht auf einer Wand.</span></div>`
      : inf ? `<div class="grwall ok">${ic("check", 14)}<span>Auf der Wand · Abstand zur Ecke <b>${num(Math.max(0, inf.a) / sc, 2)} m</b> und <b>${num(Math.max(0, inf.b) / sc, 2)} m</b> · Wand ${num(inf.L / sc, 2)} m</span></div>`
      : `<div class="grwall">${ic("alert", 14)}<span>Liegt nicht auf einer Wand.</span><button class="grb" data-act="grxosnap">An Wand einrasten</button></div>`;
    return `${kinds}
      <div class="vrow" style="margin:6px 0"><span>Breite</span><div class="step" style="flex:none"><button data-act="grxob" data-s="-5" aria-label="schmaler">${ic("minus", 16)}</button><b>${num(b / 100, 2)} m</b><button data-act="grxob" data-s="5" aria-label="breiter">${ic("plus", 16)}</button></div></div>
      <div class="vrow" style="margin:6px 0"><span>Winkel</span><div class="step" style="flex:none"><button data-act="grxor" data-s="-15" aria-label="15 Grad zurück">${ic("minus", 16)}</button><input class="grang" type="number" min="0" max="359" step="1" data-f="grxang" value="${sel.r || 0}" aria-label="Winkel in Grad"><button data-act="grxor" data-s="15" aria-label="15 Grad weiter">${ic("plus", 16)}</button></div></div>
      <div class="grseg" style="margin:2px 0 8px"><button data-act="grxor" data-s="90">↻ 90°</button><button data-act="grxor" data-s="180">Umdrehen</button></div>${where}`;
  }
  /* ---- Maße im Plan beim Bearbeiten (über allem, nicht anklickbar) */
  _grPill(x, y, t, warn) { const w = t.length * 6.3 + 14; return `<rect x="${x - w / 2}" y="${y - 9}" width="${w}" height="18" rx="9" fill="#0b1220" stroke="${warn ? "#f59e0b" : "#2dd4bf"}" opacity=".95"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="${warn ? "#fcd34d" : "#5eead4"}">${esc(t)}</text>`; }
  _grEdOver(fl) {
    const ed = this._sfEd; if (!ed) return "";
    const P = ed.plan, sc = this._sfScale(), it = P.items.find((i) => i.id === ed.sel && i.fl === fl); let d = "";
    const line = (x1, y1, x2, y2) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#2dd4bf" stroke-width="1.2"/><circle cx="${x1}" cy="${y1}" r="2.2" fill="#2dd4bf"/><circle cx="${x2}" cy="${y2}" r="2.2" fill="#2dd4bf"/>`;
    if (it && it.t === "w") { const L = Math.hypot(it.x2 - it.x, it.y2 - it.y); let a = Math.round((Math.atan2(it.y2 - it.y, it.x2 - it.x) * 180) / Math.PI); a = ((a % 180) + 180) % 180; d += this._grPill((it.x + it.x2) / 2, (it.y + it.y2) / 2 - 16, `${num(L / sc, 2)} m${a % 90 ? ` · ${a}°` : ""}`); }
    if (it && (it.t === "r" || it.t === "s") && !it.pts) { d += line(it.x, it.y - 14, it.x + it.w, it.y - 14) + this._grPill(it.x + it.w / 2, it.y - 14, this._grM(it.w, sc)) + line(it.x - 14, it.y, it.x - 14, it.y + it.h) + this._grPill(it.x - 14, it.y + it.h / 2, this._grM(it.h, sc)); }
    if (it && ["d", "f", "a"].includes(it.t) && it.fk !== "dach") {
      const inf = this._grOpenInfo(it);
      if (inf) {
        const [x1, y1, x2, y2] = inf.seg, ux = (x2 - x1) / inf.L, uy = (y2 - y1) / inf.L, o = 20, nx = -uy * o, ny = ux * o, hw = this._grHw(it, sc);
        const P0 = [x1 + nx, y1 + ny], E1 = [x1 + ux * (inf.t - hw) + nx, y1 + uy * (inf.t - hw) + ny], E2 = [x1 + ux * (inf.t + hw) + nx, y1 + uy * (inf.t + hw) + ny], P1 = [x2 + nx, y2 + ny];
        if (inf.a > 1) d += line(P0[0], P0[1], E1[0], E1[1]) + this._grPill((P0[0] + E1[0]) / 2, (P0[1] + E1[1]) / 2, this._grM(inf.a, sc));
        if (inf.b > 1) d += line(E2[0], E2[1], P1[0], P1[1]) + this._grPill((E2[0] + P1[0]) / 2, (E2[1] + P1[1]) / 2, this._grM(inf.b, sc));
      } else d += this._grPill(it.x, it.y - 26, "nicht auf der Wand", true);
    }
    if (ed.cal) {
      const p = ed.cal.p;
      p.forEach((q) => { d += `<circle cx="${q[0]}" cy="${q[1]}" r="9" fill="none" stroke="#f59e0b" stroke-width="2"/><path d="M${q[0] - 13} ${q[1]}h26M${q[0]} ${q[1] - 13}v26" stroke="#f59e0b" stroke-width="1.4"/>`; });
      if (p.length === 2) d += `<path d="M${p[0][0]} ${p[0][1]}L${p[1][0]} ${p[1][1]}" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6 4"/>` + this._grPill((p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2 - 14, `${Math.round(Math.hypot(p[1][0] - p[0][0], p[1][1] - p[0][1]))} Punkte`, true);
    }
    return d ? `<g class="grover" pointer-events="none">${d}</g>` : "";
  }
  /* Räume verschieben: Türen und Fenster auf ihren Kanten wandern mit */
  _grAttached(rm, P) {
    if (!rm || rm.t !== "r") return [];
    const Q = this._sfRP(rm), segs = Q.map((p, k) => [p[0], p[1], Q[(k + 1) % Q.length][0], Q[(k + 1) % Q.length][1]]);
    return P.items.filter((i) => i.fl === rm.fl && ["d", "f", "a"].includes(i.t) && segs.some((s) => { const o = this._grOnSeg(s, i.x, i.y); return o && o.d <= 3; })).map((i) => ({ id: i.id, x: i.x, y: i.y }));
  }
  /* ---- Plan-Check */
  _grCheck(P) {
    const out = [], ok = [], sc = P && P.scale > 0 ? P.scale : 40; if (!P || !(P.items || []).length) return { list: out, ok, n: 0, fix: 0 };
    const fls = P.floors && P.floors.length ? P.floors : [{ id: "eg", n: "EG" }], multi = fls.length > 1, its = P.items, nm = (fl) => (multi ? ((fls.find((f) => f.id === fl) || {}).n || "") + " · " : "");
    const inner = (r) => !r.ds && this._grKind(r).k !== "aussen";
    let noDoor = 0, noName = 0, noArea = 0, offWall = 0, ovl = 0;
    fls.forEach((f) => {
      const here = its.filter((i) => i.fl === f.id), rs = here.filter((i) => i.t === "r"), ops = here.filter((i) => i.t === "d"), segsOf = (r) => { const Q = this._sfRP(r); return Q.map((p, k) => [p[0], p[1], Q[(k + 1) % Q.length][0], Q[(k + 1) % Q.length][1]]); };
      rs.filter(inner).forEach((r) => {
        const S = segsOf(r), has = ops.some((d) => S.some((s) => { const o = this._grOnSeg(s, d.x, d.y); return o && o.d <= 4; })) || here.some((s) => s.t === "s" && this._sfInRoom(r, s.x + (s.w || 0) / 2, s.y + (s.h || 0) / 2));
        if (!has) { noDoor++; out.push({ l: "w", t: `${nm(f.id)}${r.n || "Raum ohne Namen"} hat keine Tür`, s: "Ohne Tür kann Modul 11 keinen Fluchtweg aus diesem Raum zeigen.", fx: "show", id: r.id }); }
      });
      here.filter((i) => (i.t === "d" || i.t === "f") && i.fk !== "dach").forEach((i) => {
        if (this._grOpenInfo(i, P)) return;
        let best = 1e9; this._grSegs(f.id, P).forEach((s) => { const o = this._grOnSeg(s, i.x, i.y); if (o) best = Math.min(best, o.d); });
        offWall++; const near = best <= 30;
        out.push({ l: "w", t: `${nm(f.id)}${i.t === "d" ? (i.dg ? "Durchgang" : "Tür") : "Fenster"} liegt nicht auf einer Wand`, s: best < 1e8 ? `${num(best / sc * 100, 0)} cm daneben${near ? " – Einrasten setzt es auf die Wand" : ""}` : "Auf dieser Etage gibt es keine Wand", fx: near ? "snap" : "show", id: i.id });
      });
      const rr = rs.filter((r) => inner(r) && !r.pts);
      for (let a = 0; a < rr.length; a++) for (let b = a + 1; b < rr.length; b++) {
        const A = rr[a], B = rr[b], ix = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x), iy = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y), m2 = ix > 0 && iy > 0 ? (ix * iy) / (sc * sc) : 0;
        if (m2 >= 0.1) { ovl++; out.push({ l: "i", t: `${nm(f.id)}${A.n || "Raum"} und ${B.n || "Raum"} überlappen`, s: `um ${num(m2, 1)} m² – Fläche und Wärmekarte stimmen dann nicht ganz`, fx: "show", id: B.id }); }
      }
      rs.forEach((r) => {
        if (!r.n) { noName++; out.push({ l: "i", t: `${nm(f.id)}Raum ohne Namen`, s: "Der Name erscheint im Plan und in allen Modulen.", fx: "show", id: r.id }); }
        else if (inner(r) && this._grArea && !this._grArea(r) && this._grRooms()[r.id] !== "-") { noArea++; out.push({ l: "i", t: `${nm(f.id)}${r.n} ohne Bereich in Home Assistant`, s: "Mit Bereich findet Modul 18 die Lampen und Modul 0 die Bewegungsmelder des Raums.", fx: "area", id: r.id }); }
      });
    });
    const hasEx = its.some((i) => (i.t === "d" || i.t === "s") && i.ex === 1), hasD = its.some((i) => i.t === "d");
    if (!hasEx && hasD) out.push({ l: "w", t: "Kein Ausgang markiert", s: "Markiere die Haustür als „Außentür“ – Modul 11 braucht sie für den Fluchtweg.", fx: "exit", id: (its.find((i) => i.t === "d" && !i.dg) || {}).id || "" });
    if (!noDoor) ok.push("Alle Räume haben eine Tür"); if (!offWall) ok.push("Türen und Fenster sitzen auf Wänden"); if (hasEx) ok.push("Ausgang vorhanden");
    if (!noName) ok.push("Alle Räume haben einen Namen"); if (!ovl) ok.push("Keine Überlappungen"); ok.push(`Maßstab: 1 m = ${sc} Punkte · Plan ${num(800 / sc, 1)} m breit`);
    return { list: out, ok, n: out.length, fix: out.filter((x) => x.fx === "snap").length };
  }
  _grChkModal() {
    const ed = this._sfEd, P = ed ? ed.plan : this._grRaw(), C = this._grCheck(P), col = { w: "#f59e0b", i: "#60a5fa" };
    const btn = { snap: "Einrasten", show: "Zeigen", area: "Zuordnen", exit: "Zeigen" };
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Plan-Check</b><span>${C.n ? `${C.n} ${C.n === 1 ? "Hinweis" : "Hinweise"}` : "Alles in Ordnung"}${ed ? " · im Baukasten, noch nicht gespeichert" : ""}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="grck">${C.list.map((x) => `<div class="grckr"><i style="background:${col[x.l]}"></i><span><b>${esc(x.t)}</b><small>${esc(x.s)}</small></span>${this._admin() ? `<button class="grb" data-act="grxfix" data-k="${x.fx}" data-v="${esc(x.id)}">${btn[x.fx]}</button>` : ""}</div>`).join("")}
      ${C.ok.map((t) => `<div class="grckr ok"><i style="background:#34d399"></i><span><b>${esc(t)}</b></span></div>`).join("")}</div>
      <div class="foot2" style="margin-top:12px">${C.fix > 1 && this._admin() ? `<button class="btn2 pri" data-act="grxfix" data-k="all">Alle ${C.fix} einrasten</button>` : ""}<button class="btn2" data-act="close">Schließen</button></div></div>`;
  }
  _grChkChip(P) { const C = this._grCheck(P); return `<button class="grchk${C.n ? " w" : ""}" data-act="grxchk" title="Plan prüfen">${ic(C.n ? "alert" : "check", 14)} Plan-Check${C.n ? ` · ${C.n}` : ""}</button>`; }
  _grCalModal() {
    const ed = this._sfEd, p = ed && ed.cal ? ed.cal.p : []; if (p.length < 2) return `<div class="ov" data-act="close"></div>`;
    const px = Math.hypot(p[1][0] - p[0][0], p[1][1] - p[0][1]), sc = this._sfScale();
    return `<div class="ov" data-act="grxcalx"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Maßstab messen</b><span>Strecke im Plan: ${Math.round(px)} Punkte · jetzt ${num(px / sc, 2)} m</span></div><button class="ibtn" data-act="grxcalx" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="mut sm" style="margin:0 0 10px">Wie lang ist diese Strecke in Wirklichkeit? Zum Beispiel eine Wand aus dem Bauplan. Danach stimmen alle Maße, Flächen und Reichweiten.</div>
      <div class="sffld"><label>Echte Länge in Metern</label><input class="osel" type="number" min="0.5" max="100" step="0.01" data-f="grxcall" value="${num(px / sc, 2).replace(",", ".")}" inputmode="decimal"></div>
      <div class="foot2" style="margin-top:12px"><button class="btn2" data-act="grxcalx">Abbrechen</button><button class="btn2 pri" data-act="grxcalok">Maßstab übernehmen</button></div></div>`;
  }
  /* Kasten in „Etage & Plan“: Raster, Maßstab messen, Etage kopieren */
  _grB7Box() {
    const g = this._grGridCm(), ed = this._sfEd;
    return `<div class="sffld"><label>Raster beim Ziehen</label><div class="grseg">${[5, 10, 25, 50].map((c) => `<button class="${g === c ? "on" : ""}" data-act="grxgrid" data-k="${c}">${c} cm</button>`).join("")}</div></div>
      <div class="sffld"><label>Maßstab messen</label><div class="mut sm" style="margin-bottom:6px">Zwei Punkte im Plan antippen (z. B. Anfang und Ende einer Wand auf dem Bauplan-Foto) und die echte Länge eingeben.</div><button class="btn2" data-act="grxcal" style="flex:none">${ic("ruler", 15)} ${ed && ed.cal ? "Messen läuft …" : "Strecke messen"}</button></div>
      <div class="sffld"><label>Etage kopieren</label><div class="mut sm" style="margin-bottom:6px">Räume, Wände, Türen, Fenster und Treppen dieser Etage als neue Etage – z. B. OG wie EG.</div><button class="btn2" data-act="grxflcp" style="flex:none" ${ed && ed.plan.floors.length >= 6 ? "disabled" : ""}>Etage kopieren</button></div>`;
  }
  _grB7Act(a, b) {
    const k = b && b.dataset ? b.dataset.k : "", v = b && b.dataset ? b.dataset.v : "", ed = this._sfEd;
    if (this._grB7bAct && this._grB7bAct(a, b)) return true;
    if (a === "grxchk") { this._modal = { type: "grxchk" }; this._renderModal(); return true; }
    if (a === "grxfix") {
      if (!this._admin()) return true;
      if (k === "area" && !ed) { this._modal = null; this._renderModal(); this._grTab = "raeume"; this._render(); return true; }
      if (!ed) { this._grEdit("gr", ""); if (!this._sfEd) return true; }
      const E = this._sfEd, P = E.plan, it = P.items.find((i) => i.id === v);
      if (k === "area") { this._modal = null; this._renderModal(); if (E) { this._toast("Erst speichern, dann im Reiter „Räume“ zuordnen"); } return true; }
      this._sfSnap();
      const snap = (i) => { const sn = this._sfSnapOpen(i.fl, i.x, i.y, 30, i); if (sn) { i.x = sn.x; i.y = sn.y; i.r = sn.r; return true; } return false; };
      if (k === "all") { const C = this._grCheck(P); let n = 0; C.list.filter((x) => x.fx === "snap").forEach((x) => { const q = P.items.find((i) => i.id === x.id); if (q && snap(q)) n++; }); this._toast(`${n} eingerastet · mit „Speichern“ übernehmen`); }
      else if (it) { if (k === "snap") snap(it); this._sfFlId = it.fl; E.sel = it.id; E.tool = "select"; E.multi = []; if (k === "exit") this._toast("Tür wählen und „Außentür“ setzen"); }
      this._modal = null; this._renderModal(); this._render(); return true;
    }
    if (a === "grxgrid") { const c = Number(k) || ({ 5: 10, 10: 25, 25: 50, 50: 5 })[this._grGridCm()]; try { localStorage.setItem("fh_gr_grid", String(c)); } catch (_) { /* egal */ } this._render(); return true; }
    if (!ed) return false;
    const P = ed.plan, cur = P.items.find((x) => x.id === ed.sel);
    if (a === "grxcal") { ed.cal = ed.cal ? null : { p: [] }; ed.sel = ""; ed.tool = "select"; if (ed.cal) this._toast("Tippe auf den Anfang der Strecke"); this._render(); return true; }
    if (a === "grxcalx") { ed.cal = null; this._modal = null; this._renderModal(); this._render(); return true; }
    if (a === "grxcalok") {
      const inp = this.shadowRoot && this.shadowRoot.querySelector('[data-f="grxcall"]'), m = Number(String((inp && inp.value) || this._grCalM || "").replace(",", ".")), p = ed.cal ? ed.cal.p : [];
      if (!(m > 0.3) || p.length < 2) { this._toast("Bitte eine Länge in Metern eingeben"); return true; }
      const sc = Math.max(10, Math.min(120, Math.round(Math.hypot(p[1][0] - p[0][0], p[1][1] - p[0][1]) / m)));
      this._sfSnap(); P.scale = sc; ed.cal = null; this._modal = null; this._renderModal(); this._render();
      this._toast(`Maßstab: 1 m = ${sc} Punkte · Plan ${num(800 / sc, 1)} m breit`); return true;
    }
    if (a === "grxflcp") {
      if (P.floors.length >= 6) return true;
      this._sfSnap(); const fl = this._sfFl(), src = P.floors.find((f) => f.id === fl) || { n: "Etage" }, id = "f" + Date.now().toString(36).slice(-6), uid = () => "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const nm = ["OG", "DG", "Keller", "UG", "Anbau"].find((n) => !P.floors.some((f) => f.n === n)) || `${src.n} 2`.slice(0, 16);
      P.floors.push({ id, n: nm }); P.items.filter((i) => i.fl === fl && ["r", "w", "d", "f", "s", "x"].includes(i.t)).forEach((i) => { const c = JSON.parse(JSON.stringify(i)); c.id = uid(); c.fl = id; if (c.t === "f") c.e = ""; P.items.push(c); });
      this._sfFlId = id; ed.sel = ""; this._render(); this._toast(`„${src.n}“ kopiert als „${nm}“ · Namen und Lampen passt du hier an`); return true;
    }
    if (a === "grxor" && cur && cur.t === "s") { this._sfSnap(); cur.r = ((cur.r || 0) + 90) % 360; this._render(); return true; }
    if (!cur || !["d", "f", "a"].includes(cur.t)) return false;
    if (a === "grxok") { this._sfSnap(); if (cur.t === "d") { if (v) cur.dk = v; else delete cur.dk; } else { if (v) cur.fk = v; else delete cur.fk; } this._render(); return true; }
    if (a === "grxob") { this._sfSnap(); cur.b = Math.max(40, Math.min(cur.t === "a" ? 800 : 600, (cur.b || (cur.t === "d" ? 80 : cur.t === "a" ? 400 : 90)) + Number(b.dataset.s || 0))); this._render(); return true; }
    if (a === "grxor") { this._sfSnap(); const s = Number(b.dataset.s || 0); cur.r = ((((cur.r || 0) + s) % 360) + 360) % 360; if (Math.abs(s) === 15) cur.r = Math.round(cur.r / 15) * 15 % 360; this._render(); return true; }
    if (a === "grxosnap") { this._sfSnap(); const sn = this._sfSnapOpen(cur.fl, cur.x, cur.y, 60, cur); if (sn) { cur.x = sn.x; cur.y = sn.y; cur.r = sn.r; } else this._toast("Keine Wand in der Nähe"); this._render(); return true; }
    return false;
  }
  _grB7Change(t) {
    const f = t.dataset ? t.dataset.f : "", ed = this._sfEd;
    if (f === "grxcall") { this._grCalM = t.value; return true; }
    if (f === "grxang" && ed) { const cur = ed.plan.items.find((x) => x.id === ed.sel); if (cur) { this._sfSnap(); cur.r = ((Math.round(Number(t.value) || 0) % 360) + 360) % 360; this._render(); } return true; }
    return false;
  }
  /* Tastatur am PC: Pfeile verschieben (Umschalt = 4 Schritte), Entf löscht, Strg+Z / Strg+Y, Esc hebt die Auswahl auf */
  _grKeyBind() {
    if (this._grKeyOn) return; this._grKeyOn = true;
    window.addEventListener("keydown", (e) => {
      const ed = this._sfEd; if (!ed || !this.isConnected || this._modal) return;
      const tg = e.composedPath ? e.composedPath()[0] : e.target; if (tg && (/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName || "") || tg.isContentEditable)) return;
      const P = ed.plan, ids = ed.multi && ed.multi.length ? ed.multi : ed.sel ? [ed.sel] : [], K = e.key, mod = e.ctrlKey || e.metaKey;
      if (mod && (K === "z" || K === "Z")) { e.preventDefault(); this._sfxP2(e.shiftKey ? "sfxredo" : "sfxundo", { dataset: {} }); return; }
      if (mod && (K === "y" || K === "Y")) { e.preventDefault(); this._sfxP2("sfxredo", { dataset: {} }); return; }
      if (K === "Escape") { if (ed.cal) ed.cal = null; else { ed.sel = ""; ed.multi = []; ed.tool = "select"; } this._render(); return; }
      if ((K === "Delete" || K === "Backspace") && ids.length) { e.preventDefault(); this._sfSnap(); const s = new Set(ids); P.items = P.items.filter((i) => !s.has(i.id)); ed.sel = ""; ed.multi = []; this._render(); return; }
      const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[K];
      if (dir && ids.length) {
        e.preventDefault(); const now = Date.now(); if (!this._grKeyT || now - this._grKeyT > 900) this._sfSnap(); this._grKeyT = now;
        const st = this._grStep() * (e.shiftKey ? 4 : 1), dx = Math.round(dir[0] * st), dy = Math.round(dir[1] * st), mv = new Set(ids);
        ids.forEach((id) => { const it = P.items.find((i) => i.id === id); this._grAttached(it, P).forEach((q) => mv.add(q.id)); });
        P.items.forEach((i) => { if (!mv.has(i.id)) return; i.x += dx; i.y += dy; if (i.pts) i.pts = i.pts.map((q) => [q[0] + dx, q[1] + dy]); if (i.t === "w") { i.x2 += dx; i.y2 += dy; } });
        this._render();
      }
    });
  }
