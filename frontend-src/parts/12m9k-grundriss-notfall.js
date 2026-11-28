  /* D4 Notfallplan als Aushang: je Etage eine Seite im Stil „Hell“ mit Ausgängen und Notfall-Punkten, zum Drucken oder als PDF sichern */
  _grNotfallHtml() {
    const P = this._grRaw(); if (!P || P.error) return "";
    const fls = this._grFloors(P).filter((f) => !f.ga), I = P.items || [], K = this._grTK();
    const pages = fls.map((f) => {
      const here = I.filter((i) => i.fl === f.id), pts = here.filter((i) => i.t === "h" && this._grTk(i).g === "notfall"), exits = here.filter((i) => (i.t === "d" || i.t === "s") && i.ex === 1);
      if (!here.some((i) => i.t === "r") && !pts.length) return "";
      let G; try { G = this._grDraw(P, f.id, { style: "hell", dims: false, layers: { nf: true } }); } catch (_) { return ""; }
      const vb = G.vb, rooms = here.filter((i) => i.t === "r"), inR = (i) => { const r = rooms.find((q) => this._grInRoom(q, i.x + (i.w || 0) / 2, i.y + (i.h || 0) / 2)); return r && r.n ? ` · ${esc(r.n)}` : ""; };
      const li = (arr, txt) => arr.length ? arr.map(txt).join("") : `<li class="mut">–</li>`;
      return `<section><h1>Notfallplan · ${esc(f.n)}</h1><div class="sub">${esc(this._cfg && this._cfg.title || "Zuhause")} · Stand ${new Date().toLocaleDateString("de-DE")}</div>
        <svg viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" width="100%">${G.svg || G.html || G.d || ""}</svg>
        <div class="cols"><div><h2>Ausgänge</h2><ul>${li(exits, (i) => `<li>${i.t === "s" ? "Treppe" : "Tür"}${inR(i)}</li>`)}</ul></div>
        <div><h2>Notfall-Punkte</h2><ul>${li(pts, (i) => `<li>${esc(this._grTk(i).n)}${inR(i)}</li>`)}</ul></div></div></section>`;
    }).filter(Boolean);
    void K; return pages.length ? `<!doctype html><meta charset="utf-8"><title>Notfallplan</title><style>@page{size:A4;margin:14mm}body{font:14px/1.4 Arial,sans-serif;color:#111;margin:0}section{page-break-after:always}section:last-child{page-break-after:auto}h1{margin:0;font-size:26px}h2{font-size:16px;margin:14px 0 4px}.sub{color:#555;margin-bottom:10px}svg{border:1px solid #ccc;border-radius:6px}.cols{display:grid;grid-template-columns:1fr 1fr;gap:20px}ul{margin:0;padding-left:18px}.mut{color:#888;list-style:none;margin-left:-18px}</style>${pages.join("")}` : "";
  }
  _grNotfallPrint() {
    const h = this._grNotfallHtml(); if (!h) { this._toast("Zum Drucken braucht der Plan mindestens einen Raum oder Notfall-Punkt."); return; }
    const f = document.createElement("iframe"); f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0"; document.body.appendChild(f);
    f.srcdoc = h; f.onload = () => { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (_) { this._toast("Drucken ist hier nicht möglich."); } setTimeout(() => f.remove(), 60000); };
  }
