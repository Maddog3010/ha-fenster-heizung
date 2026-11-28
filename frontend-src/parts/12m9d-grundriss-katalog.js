  /* ================= Modul 0 · v0.15 Katalog und Werkzeuge =================
     E2  ein Katalog mit Suche, „Zuletzt genutzt“, Favoriten ★ und Kategorien (statt getrennter Listen). Gilt im Werkzeug „Möbel“ und beim Ändern.
         Zuletzt und Favoriten merkt sich jeder Browser (localStorage).
     E5  Spiegeln an der Achse der Auswahl, E6 Ausrichten & Verteilen für mehrere ausgewählte Gegenstände. */
  _grKatLs(k) { try { const a = JSON.parse(localStorage.getItem(k) || "[]"); return Array.isArray(a) ? a.filter((x) => typeof x === "string") : []; } catch (_) { return []; } }
  _grKatSv(k, a) { try { localStorage.setItem(k, JSON.stringify(a)); } catch (_) { /* privater Modus */ } }
  _grRecAdd(id) { if (!id) return; this._grKatSv("fh_gr_rec", [id, ...this._grKatLs("fh_gr_rec").filter((x) => x !== id)].slice(0, 8)); }
  _grMobCat(cur, act, onlyOut) {
    const K = this._grMK(), rec = this._grKatLs("fh_gr_rec"), fav = this._grKatLs("fh_gr_fav"), ct = this._grCT || "";
    const gs = Object.entries(K.G).filter(([g]) => onlyOut == null || this._grOUT.has(g) === onlyOut), okG = new Set(gs.map(([g]) => g));
    const pool = K.L.filter((x) => okG.has(x[2]));
    let list = pool; if (ct === "rec") list = rec.map((id) => pool.find((x) => x[0] === id)).filter(Boolean); else if (ct === "fav") list = pool.filter((x) => fav.includes(x[0])); else if (ct) list = pool.filter((x) => x[2] === ct);
    const chip = (k, t) => `<button class="${ct === k ? "on" : ""}" data-act="grxcat" data-v="${k}" aria-pressed="${ct === k}">${t}</button>`;
    const cm = (v) => (v >= 100 ? `${num(v / 100, v % 100 ? 2 : 0)} m` : `${v} cm`);
    const rows = list.map((x) => `<div class="pkrow grkr${cur === x[0] ? " cur" : ""}" data-s="${esc((x[1] + " " + K.G[x[2]][0]).toLowerCase())}"><button class="grkb" data-act="${act}" data-v="${x[0]}"><b><span style="color:${K.G[x[2]][1]}">●</span> ${esc(x[1])}</b><small>${esc(K.G[x[2]][0])} · ${cm(x[3])} × ${cm(x[4])}</small></button><button class="grks${fav.includes(x[0]) ? " on" : ""}" data-act="grxfav" data-v="${x[0]}" aria-pressed="${fav.includes(x[0])}" aria-label="Favorit">${fav.includes(x[0]) ? "★" : "☆"}</button></div>`).join("");
    const empty = ct === "rec" ? "Noch nichts benutzt." : ct === "fav" ? "Noch keine Favoriten – tippe auf ☆." : "Nichts gefunden.";
    return `<style>.grkc{margin:0}.grkr{padding:2px 4px;gap:4px}.grkr .grkb{flex:1;min-width:0;display:flex;flex-direction:column;align-items:flex-start;background:none;border:0;color:inherit;font:inherit;text-align:left;padding:6px 4px;cursor:pointer}.grkr .grkb b{font-weight:650}.grkr .grkb small{margin-top:0}.grks{flex:none;border:0;background:none;color:var(--mut);font-size:1.15rem;min-width:36px;min-height:36px;cursor:pointer}.grks.on{color:#fbbf24}.grkl{max-height:240px;overflow:auto;margin-top:6px}
      .grkq{width:100%;box-sizing:border-box;border:1px solid var(--line);border-radius:10px;padding:8px 10px;background:none;color:inherit;font:inherit}</style>
      <div class="pkbox grkc"><input class="grkq" data-f="enq" type="search" placeholder="Suchen: Sofa, Pool, Zaun …" aria-label="Katalog durchsuchen" autocomplete="off"><div class="grseg" style="margin:8px 0 0">${chip("", "Alle")}${chip("rec", "Zuletzt")}${chip("fav", "★")}${gs.map(([g, [gn]]) => chip(g, esc(gn))).join("")}</div>
      <div class="grkl">${rows}<div class="mut sm pkno" ${list.length ? "hidden" : ""} style="padding:8px">${empty}</div></div><div class="mut sm" style="margin-top:6px">${K.L.length} Gegenstände</div></div>`;
  }
  /* Rahmen eines Elements (Wand: beide Enden; sonst x, y, w, h) */
  _grKatBox(i) { if (i.t === "w") return { x0: Math.min(i.x, i.x2), x1: Math.max(i.x, i.x2), y0: Math.min(i.y, i.y2), y1: Math.max(i.y, i.y2) }; return { x0: i.x, x1: i.x + (i.w || 0), y0: i.y, y1: i.y + (i.h || 0) }; }
  _grKatSel() { const ed = this._sfEd; return ed ? ed.plan.items.filter((x) => (ed.multi || []).includes(x.id)) : []; }
  _grKatBtns() {
    const n = this._grKatSel().filter((i) => ["o", "g", "h"].includes(i.t)).length, d = n < 2 ? " disabled" : "", b = (a, v, t, ti) => `<button class="btn2" data-act="${a}" data-v="${v}" title="${ti}"${a === "grxal" ? d : ""}>${t}</button>`;
    return `<div class="sfbtn" style="margin-top:8px">${b("grxmir", "h", "↔ Spiegeln", "Links ↔ rechts an der Mitte der Auswahl")}${b("grxmir", "v", "↕ Spiegeln", "Oben ↔ unten an der Mitte der Auswahl")}</div>
      <div class="mut sm" style="margin:8px 0 4px">Ausrichten${n < 2 ? " (mindestens 2 Möbel, Geräte oder Technik)" : ""}</div>
      <div class="grseg">${b("grxal", "l", "⇤ links", "Bündig links")}${b("grxal", "cx", "↔ Mitte", "Waagerecht mittig")}${b("grxal", "r", "⇥ rechts", "Bündig rechts")}${b("grxal", "t", "⤒ oben", "Bündig oben")}${b("grxal", "cy", "↕ Mitte", "Senkrecht mittig")}${b("grxal", "b", "⤓ unten", "Bündig unten")}${b("grxal", "dx", "⇹ gleich verteilt", "Gleiche Abstände waagerecht")}${b("grxal", "dy", "⇳ gleich verteilt", "Gleiche Abstände senkrecht")}</div>`;
  }
  _grKatAct(a, b) {
    const v = b && b.dataset ? b.dataset.v : "";
    if (a === "grxcat") { this._grCT = v; this._render(); return true; }
    if (a === "grxfav") { const f = this._grKatLs("fh_gr_fav"); this._grKatSv("fh_gr_fav", f.includes(v) ? f.filter((x) => x !== v) : [...f, v]); this._render(); return true; }
    if (a === "grxorots") { const ed0 = this._sfEd, cur = ed0 && ed0.plan.items.find((x) => x.id === ed0.sel); if (cur) { this._sfSnap(); cur.r = Number(v) % 360; this._render(); } return true; }
    const ed = this._sfEd; if (!ed || (a !== "grxmir" && a !== "grxal")) return false;
    const sel = this._grKatSel(); if (!sel.length) return true;
    if (a === "grxmir") {
      const ok = sel.filter((i) => !(i.t === "r" && i.pts) && !["d", "f", "s"].includes(i.t)); if (!ok.length) { this._toast("Diese Elemente lassen sich nicht spiegeln"); return true; }
      const bx = ok.map((i) => this._grKatBox(i)), x0 = Math.min(...bx.map((q) => q.x0)), x1 = Math.max(...bx.map((q) => q.x1)), y0 = Math.min(...bx.map((q) => q.y0)), y1 = Math.max(...bx.map((q) => q.y1));
      this._sfSnap();
      ok.forEach((i) => {
        if (v === "h") { if (i.t === "w") { i.x = x0 + x1 - i.x; i.x2 = x0 + x1 - i.x2; } else i.x = Math.round(x0 + x1 - i.x - (i.w || 0)); }
        else if (i.t === "w") { i.y = y0 + y1 - i.y; i.y2 = y0 + y1 - i.y2; } else i.y = Math.round(y0 + y1 - i.y - (i.h || 0));
        if (typeof i.r === "number" && i.r) i.r = ((360 - i.r) % 360 + 360) % 360;
      });
      this._render(); this._toast(`${ok.length} ${ok.length === 1 ? "Element" : "Elemente"} gespiegelt`); return true;
    }
    const it = sel.filter((i) => ["o", "g", "h"].includes(i.t)); if (it.length < 2) return true;
    this._sfSnap();
    const bx = (i) => this._grKatBox(i), L = it.map(bx), minX = Math.min(...L.map((q) => q.x0)), maxX = Math.max(...L.map((q) => q.x1)), minY = Math.min(...L.map((q) => q.y0)), maxY = Math.max(...L.map((q) => q.y1));
    if (v === "dx" || v === "dy") {
      if (it.length < 3) { this._toast("Zum Verteilen braucht es mindestens 3 Elemente"); return true; }
      const hx = v === "dx", ord = it.slice().sort((p, q) => (hx ? bx(p).x0 - bx(q).x0 : bx(p).y0 - bx(q).y0)), size = ord.reduce((s, i) => s + (hx ? i.w || 0 : i.h || 0), 0), gap = ((hx ? maxX - minX : maxY - minY) - size) / (ord.length - 1);
      let pos = hx ? minX : minY; ord.forEach((i) => { if (hx) { i.x = Math.round(pos); pos += (i.w || 0) + gap; } else { i.y = Math.round(pos); pos += (i.h || 0) + gap; } });
    } else it.forEach((i) => {
      if (v === "l") i.x = minX; else if (v === "r") i.x = Math.round(maxX - (i.w || 0)); else if (v === "cx") i.x = Math.round((minX + maxX) / 2 - (i.w || 0) / 2);
      else if (v === "t") i.y = minY; else if (v === "b") i.y = Math.round(maxY - (i.h || 0)); else if (v === "cy") i.y = Math.round((minY + maxY) / 2 - (i.h || 0) / 2);
    });
    this._render(); return true;
  }
