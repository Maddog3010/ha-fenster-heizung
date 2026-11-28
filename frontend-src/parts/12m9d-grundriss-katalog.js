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
    const SYN = { sofa: "couch polster", sessel: "fernsehsessel lesesessel", doppelbett: "bett ehebett", einzelbett: "bett", kuehlschrank: "fridge", herd: "kochfeld backofen", wc: "toilette klo", badewanne: "wanne", dusche: "brause", pool: "schwimmbecken", trampolin: "huepfen", tisch: "esstisch", esstisch: "tisch", schrank: "kleiderschrank", schreibtisch: "arbeitstisch buero" };
    const st = (this._hass && this._hass.states) || {};
    /* Kacheln wie im Konzept (E2): Bild von oben, Name, Größe in cm; ★ oben rechts */
    const PG = this._grPaged && this._grPaged(), pp = PG ? this._grPerPage() : 0, pg = Math.min(this._grPg || 0, Math.max(0, Math.ceil(list.length / (pp || 1)) - 1));
    const rows = list.map((x, n) => {
      const w = x[3] * 0.4, h = x[4] * 0.4, pd = Math.max(w, h) * 0.06 + 2, th = (() => { try { return this._grMobSvg({ ok: x[0], x: 0, y: 0, w, h, r: 0 }, null, false, st); } catch (_) { return ""; } })();
      return `<div class="pkrow grkt${cur === x[0] ? " cur" : ""}"${pp && (n < pg * pp || n >= (pg + 1) * pp) ? " hidden" : ""} data-s="${esc((x[1] + " " + K.G[x[2]][0] + " " + (SYN[x[0]] || "")).toLowerCase())}"><button class="grkb" data-act="${act}" data-v="${x[0]}"><svg class="grkth" viewBox="${-pd} ${-pd} ${w + pd * 2} ${h + pd * 2}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${th}</svg><b>${esc(x[1])}</b><small>${x[3]}×${x[4]} cm</small></button><button class="grks${fav.includes(x[0]) ? " on" : ""}" data-act="grxfav" data-v="${x[0]}" aria-pressed="${fav.includes(x[0])}" aria-label="Favorit">${fav.includes(x[0]) ? "★" : "☆"}</button></div>`;
    }).join("");
    const empty = ct === "rec" ? "Noch nichts benutzt." : ct === "fav" ? "Noch keine Favoriten – tippe auf ☆." : "Nichts gefunden.";
    return `${this._grKatCss()}
      <div class="pkbox grkc"${pp ? ` data-pp="${pp}"` : ""}><input class="grkq" data-f="enq" type="search" placeholder="Suchen: Sofa, Pool, Zaun …" aria-label="Katalog durchsuchen" autocomplete="off"><div class="grkcs">${chip("", "Alle")}${chip("rec", "Zuletzt")}${chip("fav", "★")}${gs.map(([g, [gn]]) => chip(g, esc(gn))).join("")}</div>
      <div class="grkl">${rows}<div class="mut sm pkno" ${list.length ? "hidden" : ""} style="padding:8px">${empty}</div></div>${pp ? `<div class="grkpg"><button data-act="grxpg" data-v="-1" aria-label="Vorherige Seite">‹</button><span class="grkpl">${pg + 1} / ${Math.max(1, Math.ceil(list.length / pp))}</span><button data-act="grxpg" data-v="1" aria-label="Nächste Seite">›</button></div>` : `<div class="mut sm" style="margin-top:6px">${K.L.length} Gegenstände</div>`}</div>`;
  }
  _grKatCss() {
    return `<style>.grkc{margin:0}.grkl{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:8px;max-height:min(58vh,460px);overflow:auto;margin-top:8px;padding:2px}.grkl .pkno{grid-column:1/-1}
      .grkt{position:relative;border-radius:14px;background:color-mix(in srgb,var(--primary-text-color) 5%,transparent);border:1px solid color-mix(in srgb,var(--primary-text-color) 8%,transparent);display:block}.grkt[hidden]{display:none}.grkt.cur{border-color:var(--teal,#2dd4bf)}
      .grkt .grkb{display:flex;flex-direction:column;align-items:flex-start;width:100%;box-sizing:border-box;background:none;border:0;color:inherit;font:inherit;text-align:left;padding:8px 8px 7px;cursor:pointer}.grkt .grkb b{font-size:.82rem;font-weight:650;margin-top:4px}.grkt .grkb small{font-size:.7rem;color:var(--mut)}
      .grkth{width:100%;height:54px;display:block;background:#0e1626;border-radius:9px}.grkt .grks{position:absolute;top:4px;right:4px;border:0;background:none;color:color-mix(in srgb,var(--primary-text-color) 35%,transparent);font-size:1rem;min-width:30px;min-height:30px;cursor:pointer;padding:0}.grkt .grks.on{color:#fbbf24}
      .grkcs{display:flex;gap:6px;overflow-x:auto;margin:8px 0 0;padding-bottom:4px;scrollbar-width:none}.grkcs button{flex:none;border:0;border-radius:999px;padding:7px 13px;background:color-mix(in srgb,var(--primary-text-color) 8%,transparent);color:inherit;font:inherit;font-size:.84rem;cursor:pointer}.grkcs button.on{background:var(--teal,#2dd4bf);color:#042f2e;font-weight:650}
      .grkq{width:100%;box-sizing:border-box;border:1px solid var(--line);border-radius:10px;padding:8px 10px;background:none;color:inherit;font:inherit}</style>`;
  }
  /* Seitenweise statt scrollen (neue Optik, Tablet/Desktop quer): so viele Kacheln, wie in die Spalte passen */
  _grPaged() { return !!(this._grLookNew && this._grLookNew() && (window.innerWidth || 0) > 900 && (window.innerHeight || 0) > 520); }
  _grPerPage() { const rows = Math.max(2, Math.floor(((window.innerHeight || 700) - 330) / 100)); return rows * 2; }
  /* Passt der Inhalt eines Reiters nicht in die Spalte, wird er verkleinert statt gescrollt (bis 62 %) */
  _grFit(root) {
    const b = root && root.querySelector && root.querySelector(".grfs .grrtb"), f = b && b.querySelector(".grfit"); if (!f) return;
    f.style.zoom = ""; const H = f.offsetHeight, A = b.clientHeight; if (!H || !A || H <= A) return;
    f.style.zoom = String(Math.max(0.62, Math.floor((A / H) * 100) / 100));
  }
  _grKatApply(root) {
    const box = root && root.querySelector && root.querySelector(".grkc[data-pp]"); if (!box) return;
    const pp = Number(box.dataset.pp) || 8, qi = box.querySelector(".grkq"), q = ((qi && qi.value) || "").trim().toLowerCase();
    const all = [...box.querySelectorAll(".grkt")], m = all.filter((t) => !q || t.dataset.s.includes(q)), N = Math.max(1, Math.ceil(m.length / pp));
    const pg = Math.min(this._grPg || 0, N - 1); this._grPg = pg;
    all.forEach((t) => { t.hidden = true; }); m.slice(pg * pp, (pg + 1) * pp).forEach((t) => { t.hidden = false; });
    const l = box.querySelector(".grkpl"); if (l) l.textContent = m.length ? `${pg + 1} / ${N}` : "–";
    const bs = box.querySelectorAll(".grkpg button"); if (bs[0]) bs[0].disabled = pg <= 0; if (bs[1]) bs[1].disabled = pg >= N - 1;
    const z = box.querySelector(".pkno"); if (z) z.hidden = m.length > 0;
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
    if (this._grFloorAct && this._grFloorAct(a, b)) return true;
    if (this._grMassAct && this._grMassAct(a, b)) return true;
    if (a === "grxtcat") { this._grTCT = v; this._grPg = 0; this._render(); return true; }
    if (a === "grxcat") { this._grCT = v; this._grPg = 0; this._render(); return true; }
    if (a === "grxpg") { this._grPg = Math.max(0, (this._grPg || 0) + Number(v)); this._grKatApply(this.shadowRoot); this._grFit(this.shadowRoot); return true; }
    if (a === "grxfly") { this._grFly = this._grFly === v ? "" : v; this._render(); return true; }
    if (a === "grxep") { this._grEP = v; this._render(); return true; }
    if (a === "grxrt") { this._grRT = v; this._render(); return true; }
    if (a === "grxfav") { const f = this._grKatLs("fh_gr_fav"); this._grKatSv("fh_gr_fav", f.includes(v) ? f.filter((x) => x !== v) : [...f, v]); this._render(); return true; }
    if (a === "grxlock") { const e0 = this._sfEd, c0 = e0 && e0.plan.items.find((x) => x.id === e0.sel); if (c0) { this._sfSnap(); if (c0.lk) delete c0.lk; else c0.lk = 1; this._render(); } return true; }
    if (a === "grxfc") { const ed0 = this._sfEd, cur = ed0 && ed0.plan.items.find((x) => x.id === ed0.sel); if (cur) { this._sfSnap(); if (Number(v) > 0) cur.fc = Number(v); else delete cur.fc; this._render(); } return true; }
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
