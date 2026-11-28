  /* D3 „Wo ist …?“: Suche im Plan nach Technik, Möbeln, Lampen, Meldern und Räumen. Tippen zoomt hin und markiert kurz (v0.18) */
  _grFindName(i, P) {
    try {
      if (i.t === "h") return this._grTk(i).n + (i.n ? " " + i.n : ""); if (i.t === "o") return (this._grMk(i).n || "Gegenstand") + (i.n ? " " + i.n : "");
      if (i.t === "r") return i.n || ""; if (i.t === "l") return "Lampe " + (i.n || ""); if (i.t === "m") return "Melder " + (i.n || "");
      if (i.t === "g") return "Gerät " + (i.n || ""); if (i.t === "f") return "Fenster " + (i.n || ""); if (i.t === "d") return "Tür " + (i.n || "");
    } catch (_) { /* unbekannte Art */ }
    return "";
  }
  _grFindHits(q) {
    const P = this._grRaw(); if (!P || P.error) return [];
    const T = String(q || "").toLowerCase().split(/\s+/).filter(Boolean); if (!T.length) return [];
    const I = P.items || [], rooms = I.filter((r) => r.t === "r"), fln = (id) => ((P.floors || []).find((f) => f.id === id) || {}).n || id;
    const out = [];
    I.forEach((i) => {
      const nm = this._grFindName(i, P).trim(); if (!nm) return;
      const cx = i.x + (i.w || 0) / 2, cy = i.y + (i.h || 0) / 2, rm = i.t === "r" ? null : rooms.find((r) => r.fl === i.fl && this._grInRoom(r, cx, cy));
      const hay = `${nm} ${rm ? rm.n || "" : ""} ${fln(i.fl)}`.toLowerCase();
      if (T.every((t) => hay.includes(t))) out.push({ i, nm: nm.replace(/\s+/g, " "), rm: rm ? rm.n : "", fl: fln(i.fl) });
    });
    return out.slice(0, 8);
  }
  _grFindRes(q) {
    const H = this._grFindHits(q); if (!String(q || "").trim()) return "";
    return H.length ? H.map((h) => `<button data-act="grxfind" data-v="${esc(h.i.id)}">${esc(h.nm)}<small>${esc([h.rm, h.fl].filter(Boolean).join(" · "))}</small></button>`).join("") : `<span class="mut sm">Nichts gefunden.</span>`;
  }
  _grFindBox() {
    return `<div class="grfind"><input class="grkq" data-f="gfind" type="search" placeholder="Wo ist …? z. B. Sicherungskasten, Haupthahn, Steckdose Büro" aria-label="Im Plan suchen" autocomplete="off" value="${esc(this._grFindQ || "")}"><div class="grfr">${this._grFindRes(this._grFindQ)}</div></div>`;
  }
  _grFindGo(id) {
    const P = this._grRaw(), it = P && (P.items || []).find((i) => i.id === id); if (!it) return;
    this._grFl = it.fl;
    if (it.t === "r") this._grFocus(id);
    else { const G = this._grDraw(P, it.fl, { style: this._grStyle(), dims: this._grDimsOn(), layers: {} }), vb = G.vb; this._grZoomTo(it.fl, Math.min(3, Math.max(2, 400 / Math.max(60, it.w || 0, it.h || 0))), it.x + (it.w || 0) / 2, it.y + (it.h || 0) / 2); void vb; }
    this._grMark = { id, fl: it.fl, x: it.x + (it.w || 0) / 2, y: it.y + (it.h || 0) / 2, t: Date.now() };
    clearTimeout(this._grMarkT); this._grMarkT = setTimeout(() => { this._grMark = null; this._render(); }, 9000);
    this._render();
  }
  _grMarkDraw(sr) {
    const m = this._grMark; if (!m || !sr) return; const svg = sr.querySelector(`svg.grzsvg[data-fl="${m.fl}"]`); if (!svg || svg.querySelector(".grmk")) return;
    svg.insertAdjacentHTML("beforeend", `<g class="grmk" pointer-events="none"><circle cx="${m.x}" cy="${m.y}" r="26" fill="#2dd4bf" fill-opacity=".14" stroke="#2dd4bf" stroke-width="3"><animate attributeName="r" values="20;42;20" dur="1.6s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values="1;.2;1" dur="1.6s" repeatCount="indefinite"/></circle><circle cx="${m.x}" cy="${m.y}" r="5" fill="#2dd4bf"/></g>`);
  }
