  /* Hilfslinien beim Verschieben: rastet Kanten und Mitte an anderen Gegenständen der Etage ein (6 Einheiten) und zeigt eine Linie */
  _grGuides(P, it, fl) {
    const box = (i) => { const q = (i.r || 0) % 180 === 90 ? [i.h || 0, i.w || 0] : [i.w || 0, i.h || 0]; return i.t === "h" ? { x0: i.x, x1: i.x, y0: i.y, y1: i.y } : { x0: i.x, x1: i.x + q[0], y0: i.y, y1: i.y + q[1] }; };
    if (!it || ["w", "r", "d", "f", "a"].includes(it.t) || !(it.t === "h" || (it.w > 0 && it.h > 0))) return null;
    const me = box(it), T = 6, xs = [], ys = [];
    (P.items || []).filter((o) => o !== it && o.fl === fl && !["w", "r", "d", "f", "a"].includes(o.t) && (o.t === "h" || (o.w > 0 && o.h > 0))).forEach((o) => { const b = box(o); xs.push(b.x0, (b.x0 + b.x1) / 2, b.x1); ys.push(b.y0, (b.y0 + b.y1) / 2, b.y1); });
    const best = (mine, list) => { let r = null; mine.forEach((m) => list.forEach((l) => { const dd = l - m; if (Math.abs(dd) <= T && (!r || Math.abs(dd) < Math.abs(r.d))) r = { d: dd, at: l }; })); return r; };
    const bx = best([me.x0, (me.x0 + me.x1) / 2, me.x1], xs), by = best([me.y0, (me.y0 + me.y1) / 2, me.y1], ys), L = [];
    if (bx) { it.x += bx.d; L.push(["v", bx.at]); } if (by) { it.y += by.d; L.push(["h", by.at]); }
    return L.length ? L : null;
  }
  _grGuideDraw(svg, L) {
    if (!svg || !L) return; const vb = svg.viewBox && svg.viewBox.baseVal; if (!vb) return;
    const ln = L.map(([k, v]) => k === "v" ? `<line x1="${v}" y1="${vb.y}" x2="${v}" y2="${vb.y + vb.height}"/>` : `<line x1="${vb.x}" y1="${v}" x2="${vb.x + vb.width}" y2="${v}"/>`).join("");
    svg.insertAdjacentHTML("beforeend", `<g class="grgl" pointer-events="none" stroke="#2dd4bf" stroke-width="1.4" stroke-dasharray="6 5" opacity=".9">${ln}</g>`);
  }
