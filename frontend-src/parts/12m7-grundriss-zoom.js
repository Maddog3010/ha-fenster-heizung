  /* ================= Modul 0 Build 8: Zoom, Vollbild, Raum-Fokus, Export =================
     Plan in Modul 0: Zoom mit + / − / Mausrad (mit Strg oder im Vollbild) / zwei Fingern, Verschieben durch Ziehen, Vollbild für Tablets.
     Raum-Fokus aus dem Raum-Blatt („Heranzoomen“). Export als PNG, SVG oder PDF (A4 quer, eine Seite je Etage, mit Titel, Datum,
     Fläche und Legende). Die Dashboard-Karte custom:sw-grundriss-card (frontend/grundriss-card.js) nutzt denselben Zeichner. */
  _grZ(fl) { const z = this._grZm; return z && z.fl === fl ? z : { fl, s: 1, cx: null, cy: null }; }
  _grVB(vb, fl) {
    const z = this._grZ(fl); if (z.s <= 1.001) return vb;
    const w = vb.w / z.s, h = vb.h / z.s, cx = Math.max(vb.x + w / 2, Math.min(vb.x + vb.w - w / 2, z.cx == null ? vb.x + vb.w / 2 : z.cx)), cy = Math.max(vb.y + h / 2, Math.min(vb.y + vb.h - h / 2, z.cy == null ? vb.y + vb.h / 2 : z.cy));
    return { x: cx - w / 2, y: cy - h / 2, w, h };
  }
  _grZoomBar(fl, opt) {   /* opt.noExp: ohne Export (z. B. Lichtkarte in Modul 18) */
    const z = this._grZ(fl), F = ` data-fl="${esc(fl)}"`, b = (k, t, l, on) => `<button class="${on ? "on" : ""}" data-act="grxz" data-k="${k}"${F} title="${l}" aria-label="${l}">${t}</button>`;
    return `<div class="grzb">${b("out", "−", "Verkleinern")}<button data-act="grxz" data-k="reset"${F} title="Ganzer Plan">${Math.round(z.s * 100)} %</button>${b("in", "+", "Vergrößern")}<i></i>${b("full", this._grFull ? "✕" : "⤢", this._grFull ? "Vollbild beenden" : "Vollbild", this._grFull)}${opt && opt.noExp ? "" : b("exp", "⇩", "Exportieren")}</div>`;
  }
  _grLiCap() { return 1; }   /* Kennzeichen für das Licht-Addon: Lichtkarte kann den Zeichner von Modul 0 nutzen (ab 2026.11.4b57) */
  _grZoomTo(fl, s, cx, cy) { this._grZm = { fl, s: Math.max(1, Math.min(8, s)), cx, cy }; }
  /* Raum-Fokus: Raum füllt den Plan */
  _grFocus(id) {
    const P = this._grRaw(), r = P && (P.items || []).find((i) => i.id === id); if (!r) return;
    this._grFl = r.fl; const G = this._grDraw(P, r.fl, { style: this._grStyle(), dims: this._grDimsOn(), layers: {} }), vb = G.vb, pad = 50;
    const s = Math.min(vb.w / (r.w + pad * 2), vb.h / (r.h + pad * 2)); this._grZoomTo(r.fl, s, r.x + r.w / 2, r.y + r.h / 2);
  }
  _grZoomBind(sr) {
    if (this._grZB) return; this._grZB = true;
    const ptrs = new Map(); let st = null;
    const svgOf = (e) => e.target && e.target.closest && e.target.closest("svg.grzsvg");
    const apply = (svg, fl) => { const vb = svg.dataset.vb.split(" ").map(Number), v = this._grVB({ x: vb[0], y: vb[1], w: vb[2], h: vb[3] }, fl); svg.setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`); svg.classList.toggle("zm", this._grZ(fl).s > 1.001); const lb = sr.querySelector('.grzb [data-k="reset"]'); if (lb) lb.textContent = Math.round(this._grZ(fl).s * 100) + " %"; };
    const toPlan = (svg, cx, cy) => { const b = svg.getBoundingClientRect(), v = svg.viewBox.baseVal; return [v.x + ((cx - b.left) / b.width) * v.width, v.y + ((cy - b.top) / b.height) * v.height]; };
    sr.addEventListener("pointerdown", (e) => {
      const svg = svgOf(e); if (!svg) return; const fl = svg.dataset.fl;
      ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      const z = this._grZ(fl), v = svg.viewBox.baseVal;
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; st = { pinch: true, d0: Math.hypot(a[0] - b[0], a[1] - b[1]), s0: z.s, mid: toPlan(svg, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2), svg, fl, moved: true }; }
      else st = { x: e.clientX, y: e.clientY, cx: v.x + v.width / 2, cy: v.y + v.height / 2, s: z.s, svg, fl, moved: false, sc: v.width / svg.getBoundingClientRect().width };
    }, true);
    window.addEventListener("pointermove", (e) => {
      if (!st || !ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      if (st.pinch && ptrs.size >= 2) { const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); this._grZoomTo(st.fl, st.s0 * (d / Math.max(20, st.d0)), st.mid[0], st.mid[1]); apply(st.svg, st.fl); this._dragging = true; e.preventDefault(); return; }
      if (st.pinch || st.s <= 1.001) return;
      const dx = e.clientX - st.x, dy = e.clientY - st.y; if (!st.moved && Math.hypot(dx, dy) < 6) return;
      st.moved = true; this._dragging = true; e.preventDefault();
      this._grZoomTo(st.fl, st.s, st.cx - dx * st.sc, st.cy - dy * st.sc); apply(st.svg, st.fl);
    }, { passive: false });
    const up = (e) => { ptrs.delete(e.pointerId); if (!ptrs.size && st) { if (st.moved) this._grZMoved = Date.now(); st = null; this._dragging = false; } };
    window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
    sr.addEventListener("click", (e) => { if (this._grZMoved && Date.now() - this._grZMoved < 350 && svgOf(e)) { e.stopPropagation(); e.preventDefault(); } }, true);
    sr.addEventListener("wheel", (e) => {
      const svg = svgOf(e); if (!svg || !(e.ctrlKey || e.metaKey || this._grFull)) return;
      e.preventDefault(); const fl = svg.dataset.fl, z = this._grZ(fl), [px, py] = toPlan(svg, e.clientX, e.clientY), f = Math.exp(-e.deltaY * 0.0025), s = Math.max(1, Math.min(8, z.s * f));
      const v = svg.viewBox.baseVal, cx = v.x + v.width / 2, cy = v.y + v.height / 2;   /* Punkt unter der Maus bleibt stehen */
      this._grZoomTo(fl, s, px + (cx - px) * (z.s / s), py + (cy - py) * (z.s / s)); apply(svg, fl);
    }, { passive: false });
    window.addEventListener("keydown", (e) => { if (e.key === "Escape" && this._grFull && !this._modal) { this._grFull = false; this._render(); } });
  }
  /* ---- Export */
  _grExOpt() { return (this._grEx = this._grEx || { f: "pdf", all: true, dims: true }); }
  _grExModal() {
    const o = this._grExOpt(), P = this._grRaw(), n = P ? this._grFloors(P).length : 1, seg = (k, opts) => `<div class="grseg">${opts.map(([v, t]) => `<button class="${String(o[k]) === String(v) ? "on" : ""}" data-act="grxexo" data-k="${k}" data-v="${v}">${t}</button>`).join("")}</div>`;
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Grundriss exportieren</b><span>Stil „${{ modern: "Modern", bauplan: "Bauplan", hell: "Hell", karte: "Karte" }[this._grStyle()]}“ · Ebenen wie im Plan</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="sffld"><label>Format</label>${seg("f", [["pdf", "PDF (A4 quer)"], ["png", "PNG-Bild"], ["svg", "SVG (Vektor)"]])}<small class="mut" style="display:block;margin-top:4px">${{ pdf: "Zum Drucken, für Handwerker oder Versicherung – mit Titel, Datum, Fläche und Legende.", png: "Bild in hoher Auflösung, z. B. für Nachrichten.", svg: "Vektorgrafik zum Weiterbearbeiten." }[o.f]}</small></div>
      ${o.f === "pdf" && n > 1 ? `<div class="sffld"><label>Etagen</label>${seg("all", [[true, `Alle ${n} Etagen`], [false, "Nur diese Etage"]])}</div>` : ""}
      <div class="sffld"><label>Maße</label>${seg("dims", [[true, "Mit Maßen"], [false, "Ohne"]])}</div>
      <div class="foot2" style="margin-top:12px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="grxexgo">${ic("download", 15)} Exportieren</button></div></div>`;
  }
  _grExSvg(P, fl, o) {
    const sty = this._grStyle(), T = this._grTheme(sty), ly = this._grLy(), li = !!(this._liOn && this._liOn());
    const G = this._grDraw(P, fl, { style: sty, dims: o.dims, narrow: false, now: false, layers: { licht: ly.licht && li, sf: ly.sf, gt: ly.gt !== false } }), vb = G.vb, top = o.head ? 56 : 0, bot = o.head ? 30 : 0;
    const fn = ((P.floors || []).find((f) => f.id === fl) || {}).n || "", rs = (P.items || []).filter((i) => i.t === "r" && i.fl === fl), m2 = rs.filter((r) => !r.ds && this._grKind(r).k !== "aussen").reduce((s, r) => s + this._grAreaM2(r, P.scale > 0 ? P.scale : 40), 0);
    const head = o.head ? `<rect x="${vb.x}" y="${vb.y - top}" width="${vb.w}" height="${vb.h + top + bot}" fill="${T.bg}"/><text x="${vb.x + 20}" y="${vb.y - top + 30}" font-size="22" font-weight="800" fill="${T.text}">Grundriss ${esc(fn)}</text><text x="${vb.x + 20}" y="${vb.y - top + 50}" font-size="12" fill="${T.sub}">${rs.length} Räume · ${num(m2, 1)} m² Wohnfläche · ${new Date().toLocaleDateString("de-DE")}</text><text x="${vb.x + vb.w - 20}" y="${vb.y + vb.h + 20}" text-anchor="end" font-size="10" fill="${T.sub}">Strom &amp; Wärme · Modul 0 · Haus &amp; Grundriss</text>` : "";
    const w = vb.w, h = vb.h + top + bot;
    return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.x} ${vb.y - top} ${w} ${h}" width="${Math.round(w)}" height="${Math.round(h)}" font-family="Helvetica, Arial, sans-serif">${head}${G.svg}</svg>`, w, h, fn, n: rs.length, m2, bg: T.bg };
  }
  _grRaster(X, px, mime, q) {
    return new Promise((ok, no) => {
      const img = new Image(), url = URL.createObjectURL(new Blob([X.svg], { type: "image/svg+xml" }));
      img.onload = () => { try { const sc = px / X.w, cv = document.createElement("canvas"); cv.width = Math.round(X.w * sc); cv.height = Math.round(X.h * sc); const c = cv.getContext("2d"); c.fillStyle = X.bg; c.fillRect(0, 0, cv.width, cv.height); c.drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url); ok({ cv, data: cv.toDataURL(mime, q) }); } catch (e) { no(e); } };
      img.onerror = () => { URL.revokeObjectURL(url); no(new Error("svg")); };
      img.src = url;
    });
  }
  async _grExport() {
    const o = this._grExOpt(), P = this._grRaw(); if (!P) return;
    const fls = this._grFloors(P), cur = fls.some((f) => f.id === this._grFl) ? this._grFl : fls[0].id, day = new Date().toISOString().slice(0, 10);
    this._toast("Export wird erstellt …");
    try {
      if (o.f === "svg") { const X = this._grExSvg(P, cur, { dims: o.dims, head: true }); this._sfDeliver(X.svg, `Grundriss-${X.fn || "Plan"}-${day}.svg`, "image/svg+xml", "Grundriss"); return; }
      if (o.f === "png") { const X = this._grExSvg(P, cur, { dims: o.dims, head: true }), R = await this._grRaster(X, 2400, "image/png"); const bin = atob(R.data.split(",")[1]), b = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i); this._sfDeliver(b, `Grundriss-${X.fn || "Plan"}-${day}.png`, "image/png", "Grundriss"); return; }
      const list = o.all ? fls.map((f) => f.id) : [cur], pages = [];
      for (const fl of list) {
        const X = this._grExSvg(P, fl, { dims: o.dims, head: false }), R = await this._grRaster(X, 2000, "image/jpeg", 0.9), jpg = atob(R.data.split(",")[1]);
        const W = 842, H = 595, m = 28, top = 62, bw = W - m * 2, bh = H - top - 40, k = Math.min(bw / R.cv.width, bh / R.cv.height), iw = R.cv.width * k, ih = R.cv.height * k;
        const ops = [{ t: "text", x: m, y: H - 40, v: `Grundriss ${X.fn}`, s: 16, b: true }, { t: "text", x: m, y: H - 56, v: `${X.n} Räume · ${num(X.m2, 1)} m² Wohnfläche · Stand ${new Date().toLocaleDateString("de-DE")}`, s: 9, c: "0.33 0.33 0.33" },
          { t: "img", x: m + (bw - iw) / 2, y: 40 + (bh - ih) / 2, w: iw, h: ih, iw: R.cv.width, ih: R.cv.height, jpg },
          { t: "line", x1: m, x2: W - m, y: 30, c: "0.8 0.8 0.8", w: 0.5 }, { t: "text", x: m, y: 18, v: "Strom & Wärme · Modul 0 · Haus & Grundriss · Maßstab 1 m = " + (P.scale > 0 ? P.scale : 40) + " Punkte", s: 7.5, c: "0.45 0.45 0.45" }];
        ops.box = [W, H]; pages.push(ops);
      }
      pages.forEach((p, i) => p.push({ t: "text", x: 842 - 28 - this._pdfW(`Seite ${i + 1} von ${pages.length}`, 8), y: 18, v: `Seite ${i + 1} von ${pages.length}`, s: 8, c: "0.45 0.45 0.45" }));
      this._sfDeliver(this._pdfBytes(pages), `Grundriss-${day}.pdf`, "application/pdf", "Grundriss");
    } catch (e) { this._toast("Export hat nicht geklappt"); }
  }
  _grB8Act(a, b) {
    const k = b && b.dataset ? b.dataset.k : "", v = b && b.dataset ? b.dataset.v : "";
    if (a === "grxz") {
      const P = this._grRaw(); if (!P) return true; const fls = this._grFloors(P), want = b && b.dataset && b.dataset.fl, fl = want && fls.some((f) => f.id === want) ? want : fls.some((f) => f.id === this._grFl) ? this._grFl : fls[0].id, z = this._grZ(fl);
      if (k === "in" || k === "out") this._grZoomTo(fl, z.s * (k === "in" ? 1.4 : 1 / 1.4), z.cx, z.cy);
      else if (k === "reset") this._grZm = null;
      else if (k === "full") this._grFull = !this._grFull;
      else if (k === "exp") { this._modal = { type: "grxexp" }; this._renderModal(); return true; }
      this._render(); return true;
    }
    if (a === "grxfocus") { this._grFocus(k); this._modal = null; this._renderModal(); this._render(); return true; }
    if (a === "grxexo") { const o = this._grExOpt(); o[k] = v === "true" ? true : v === "false" ? false : v; this._renderModal(); return true; }
    if (a === "grxcopy") { try { navigator.clipboard.writeText(this._grCardYaml()).then(() => this._toast("Kopiert"), () => this._toast("Kopieren nicht möglich")); } catch (_) { this._toast("Kopieren nicht möglich"); } return true; }
    if (a === "grxexgo") { this._modal = null; this._renderModal(); this._grExport(); return true; }
    return false;
  }
  /* Dashboard-Karte: Hinweis mit Beispiel zum Kopieren (Reiter Einstellungen) */
  _grCardYaml() { return "type: custom:sw-grundriss-card\ntitel: Unser Haus\netage: EG\nstil: modern\nebenen:\n  - jetzt\n  - licht\n  - melder\n  - geraete\ntippen: raum"; }
  _grCardInfo() {
    return `<div class="card"><h2>${ic("grid", 18)}Grundriss im Dashboard</h2>
      <div class="mut sm" style="margin-bottom:8px">Den Plan gibt es auch als Karte für deine Dashboards – z. B. auf dem Tablet an der Wand. Dashboard bearbeiten → Karte hinzufügen → „Grundriss (Strom &amp; Wärme)“, oder als YAML:</div>
      <pre class="grpre">${esc(this._grCardYaml())}</pre>
      <div class="grseg" style="margin-top:8px"><button data-act="grxcopy">Kopieren</button></div>
      <div class="mut sm" style="margin-top:8px"><b>etage</b>: Name oder Kürzel (ohne = Umschalter) · <b>stil</b>: modern, bauplan, hell, karte · <b>ebenen</b>: jetzt, licht, melder, geraete · <b>tippen</b>: raum (Raum-Blatt), modul0 (öffnet Modul 0) oder nichts. Zoomen mit zwei Fingern, Doppeltipp setzt zurück.</div></div>`;
  }
