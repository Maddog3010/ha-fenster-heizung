  /* ================= Tablet-Modus · Neuer Aufbau, Stufe 1 (Konzept „Tabletmodus neu“) =================
     Ein Modul, eine Seite. Quer: Modulleiste links, hochkant: unten. Schlanke Kopfzeile mit einem Zustandssatz.
     Die Startseite passt ohne Scrollen auf einen Bildschirm: Haus-Kopf, Bubbles, Modulkacheln, Hinweise.
     Mehr Kacheln oder Hinweise = weitere Seiten (Pfeile und Wischen). „Groß“ zeigt weniger Kacheln.
     Die Modulseiten bekommen ihre Aufteilung in den nächsten Stufen und scrollen bis dahin wie bisher.
     Je Tablet gespeichert: cfg.look = "new" | "classic" (wie bisher), cfg.rail = bis zu 4 Module in der Leiste. */
  _tm2On() { return this._tmC().look !== "classic"; }
  _tm2Land() { return window.innerWidth >= 900 && window.innerWidth > window.innerHeight; }
  static TM2_N = { fh: "Heizung", ww: "Wasser", en: "Energie", gs: "Geräte", ev: "E-Auto", wx: "Wetter", sf: "Melder", dt: "Tarif", wa: "Wartung", sp: "Prognose", mu: "Müll", li: "Licht", ef: "Hausfluss", gr: "Grundriss", abrechnung: "Abrechnung", saugroboter: "Sauger" };
  _tm2Name(x) { return this.constructor.TM2_N[x.id] || x.name; }
  /* Die bis zu vier Module der Leiste: eigene Wahl, sonst Modul 1–4, aufgefüllt mit den nächsten eingeschalteten */
  _tm2Rail(items) {
    const rest = items.filter((x) => x.id !== "st"), by = (id) => rest.find((x) => x.id === id), pick = (this._tmC().rail || []).map(by).filter(Boolean);
    if (pick.length) return pick.slice(0, 4);
    const r = ["fh", "ww", "en", "gs"].map(by).filter(Boolean);
    rest.forEach((x) => { if (r.length < 4 && !r.includes(x) && x.id !== "gr") r.push(x); });
    return r;
  }
  _tm2Nav(land) {
    const items = this._tmItems(), v = this._tmV(), cur = items.find((x) => x.id === v);
    let r = this._tm2Rail(items);
    /* Ein anderes Modul ist offen: es rückt auf den letzten Platz */
    if (cur && v !== "st" && !r.some((x) => x.id === v)) r = [...r.slice(0, 3), cur];
    const bad = this._wwProblems && this._mdState().on.ww && this._wwProblems().some((p) => p[0] === "bad" || p[0] === "warn");
    const btn = (x) => `<button class="tmdk ${v === x.id ? "sel" : ""}" data-act="tmgo" data-k="${x.id}" aria-pressed="${v === x.id}">${ic(x.icon, 28)}<span>${esc(this._tm2Name(x))}</span>${x.id === "ww" && bad ? `<i class="tmdot"></i>` : ""}</button>`;
    const list = [items[0], ...r].map(btn).join("") + `<button class="tmdk" data-act="tmmore">${ic("grid", 28)}<span>Mehr</span></button>`;
    return land ? `<nav class="tm2rail" aria-label="Module"><img class="blogo" src="${LOGO_URL}" alt="" draggable="false"><div class="tm2rl">${list}</div>${this._tm2Lock()}</nav>` : `<nav class="tmdock tm2dock" aria-label="Module">${list}</nav>`;
  }
  _tm2Lock() { const me = this._tmMe(); return `<button class="tmgear" data-act="tmlock" aria-label="${me.has_pin ? "Einstellungen (PIN)" : "Einstellungen"}">${ic(me.has_pin ? "lock" : "sliders", 22)}</button>`; }
  /* Zustandssatz für die Kopfzeile einer Modulseite */
  _tm2Status(m) {
    if (!m) return "";
    try {
      const K = this._hzK(m);
      if (K && K.z !== "off" && K.l1) return K.u === "%" && K.v != null ? `${esc(String(K.v))} % ${K.l1}` : [K.v != null && !K.tx ? `${esc(String(K.v))}${K.u ? ` ${esc(K.u)}` : ""}` : "", K.l1].filter(Boolean).join(" · ");
    } catch (_) { /* Modul noch nicht geladen */ }
    return esc(m.tag || "");
  }
  _tm2Render(v, m) {
    const sr = this.shadowRoot, c = this._tmC(), land = this._tm2Land(), fit = this._tm2Fit(v), mod = fit && v !== "st";
    if (v !== "en") this._tm2EnRange(false);   /* gemerkten Zeitraum der Energie-Übersicht zurückgeben */
    const zoom = { auto: 1, large: 1.15, xl: 1.3 }[c.size] || 1;
    let title, sub;
    if (v === "st") {   /* gleich gezählt wie in der Gesamt-Ampel auf dem Haus-Kopf */
      const L = this._hzLevel(this._hzNew() ? this._hzVis(this._hzHints()) : this._hzHints()); title = this._hzGreet().split(" · ")[0];
      sub = [L.n ? `${L.n} ${L.n === 1 ? "Hinweis" : "Hinweise"}` : "", L.info ? `${L.info} ${L.info === 1 ? "Info" : "Infos"}` : ""].filter(Boolean).join(" · ") || "Alles in Ordnung";
    }
    else { title = esc(m ? m.name : ""); sub = mod ? this._tm2ModStatus(v) : this._tm2Status(m); }
    const tabs = mod ? this._tm2Tabs(v) : "";
    const x = sr.querySelector(".tmbody"), keep = x && this._tmVOld === v ? x.scrollTop : 0; this._tmVOld = v;
    const d = new Date(), nav = this._tm2Nav(land);
    sr.getElementById("main").innerHTML = `<div class="tmw tm2 ${land ? "land" : "port"}${land && window.innerHeight < 700 ? " short" : ""} sz-${esc(c.size)}">${land ? nav : ""}<div class="tm2main">
      <header class="tmh tm2h">${land ? "" : `<img class="blogo" src="${LOGO_URL}" alt="" draggable="false">`}<div class="tmht"><b>${title}</b><span>${sub}</span></div>${land ? tabs : ""}
      <div class="tmclk"><span data-tmclk>${d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</span><small data-tmdate>${d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}</small></div>${land ? "" : this._tm2Lock()}</header>
      ${land || !tabs ? "" : `<div class="tm2tr">${tabs}</div>`}
      <div class="tmbody${fit ? " tm2fit" : ""}${mod ? ` tm2mod tm2-${v}` : ""}"${fit ? "" : ` style="zoom:${zoom}"`}>${mod ? this._tm2ModBody(v) : `${v === "ev" && this._evWallFull ? `<button class="btn2 evwback" data-act="wbwall" data-k="">${ic("back", 18)}Zurück zur Tablet-Seite</button>` : ""}${this._tmBody(v)}`}</div></div>${land ? "" : nav}</div>`;
    const nb = sr.querySelector(".tmbody"); if (nb && keep && !fit) nb.scrollTop = keep;
    this._tm2Bind();
    if (mod) { this._tm2Charts(); if (this._modal && (this._modal.type === "tm2room" || this._modal.type === "tm2x")) this._renderModal(); }
  }
  /* Wie viel auf eine Seite passt: Kacheln (Spalten × Zeilen) und Hinweise */
  _tm2Cap() {
    const size = this._tmC().size, land = this._tm2Land(), W = window.innerWidth, H = window.innerHeight;
    let t = size === "xl" ? 4 : size === "large" ? 6 : 8, h = size === "xl" ? 2 : 3;
    if (land) { if (W < 1150 || H < 720) t = Math.min(t, 6); if (H < 640) { t = Math.min(t, 4); h = 2; } }
    else { if (H < 1150 || W < 700) { t = Math.min(t, 6); h = Math.min(h, 2); } if (W < 600 || H < 900) { t = Math.min(t, 4); h = Math.min(h, 2); } }
    const cols = land ? (t === 8 ? 4 : t === 6 ? 3 : 2) : 2;
    return { t, h, cols, rows: Math.ceil(t / cols) };
  }
  /* Seitenblättern: key = Bereich, n = Einträge, per = je Seite */
  _tm2Page(key, n, per) {
    const P = this._tmPg || (this._tmPg = {}), pages = Math.max(1, Math.ceil(n / per)), i = Math.min(Math.max(0, P[key] || 0), pages - 1);
    P[key] = i; return { i, pages, from: i * per, to: Math.min(n, i * per + per), n };
  }
  _tm2Pager(key, p, label) {
    if (p.pages < 2) return "";
    return `<div class="tm2pg"><button data-act="tm2pg" data-k="${key}" data-d="-1" ${p.i ? "" : "disabled"} aria-label="Vorherige Seite">${ic("back", 22)}</button><span class="tm2dots" aria-label="Seite ${p.i + 1} von ${p.pages}">${Array.from({ length: p.pages }, (_, i) => `<i class="${i === p.i ? "on" : ""}"></i>`).join("")}</span><button data-act="tm2pg" data-k="${key}" data-d="1" ${p.i < p.pages - 1 ? "" : "disabled"} aria-label="Nächste Seite">${ic("chev", 22)}</button>${label ? `<small>${label} ${p.from + 1}–${p.to} von ${p.n}</small>` : ""}</div>`;
  }
  /* ---------- Startseite ---------- */
  /* Haus-Szene ganz zeigen statt beschneiden; Himmel und Boden laufen dabei bis an die Ränder weiter */
  _tm2Wide(svg, align) {
    return svg.replace('preserveAspectRatio="xMidYMid slice"', `preserveAspectRatio="${align} meet"`)
      .replace('<rect width="360" height="200"', '<rect x="-3000" width="6400" height="200"').replace('<rect x="-2" y="150" width="364"', '<rect x="-3000" y="150" width="6400"').replace('M-2 150 h364', 'M-3000 150 h6400');
  }
  _tm2Scene(hints) {
    const L = this._hzLevel(hints); let svg = "", bg = "";
    if (this._hzNew()) {
      try {
        /* Ausschnitt ab Dachhöhe, rechtsbündig und ganz sichtbar; der Himmel läuft als Verlauf weiter */
        svg = this._tm2Wide(this._hzScSvg({ vb: "100 34 262 166" }), "xMaxYMax");
        bg = String(this._hzScBg || "").replace(/81%/g, `${((150 - 34) / 166 * 100).toFixed(1)}%`);
      } catch (_) { svg = ""; }
    }
    const day = this._hzDayLine ? this._hzDayLine() : "";
    return `<div class="tm2sc${svg ? "" : " plain"} z-${L.z}"${bg ? ` style="background:${bg}"` : ""}>${svg}<div class="tm2amp"><i aria-hidden="true"></i><div><b>${esc(L.t)}</b><small>${esc(L.s)}</small>${day ? `<small class="d">${esc(day)}</small>` : ""}</div></div></div>`;
  }
  _tm2Bubbles() {
    if (!this._labOn("sb")) return "";
    const c = this._hzCfg().bub, hd = { wetter: "weather", personen: "people", alarm: "shield", solar: "pvRoof", batterie: "battery", auto: "car", fenster: "windowOpen", muell: "bin", warmwasser: "boiler", preis: "price" };
    const items = c.ids.map((id) => { const d = this._hzBubDef(id); return d && d.i ? this._hzBubX({ id, ...d }) : null; }).filter(Boolean);
    if (!items.length) return "";
    return `<div class="tm2bubs" style="--n:${items.length}">${items.map((x) => `<button class="tm2b ${c.warn ? "z-" + this._hzZ(x.c || "") : ""}" data-act="tmbub" data-k="${x.id}" aria-label="${esc(x.s)}: ${esc(x.b)}">${this._hzNew() && hd[x.id] ? this._gx(hd[x.id], 30, x.o || {}) : ic(x.i, 22)}<span><b>${esc(x.b)}</b><small>${esc(x.s)}</small></span></button>`).join("")}</div>`;
  }
  _tm2Tile(m) {
    let K = { z: "off", v: null, u: "", l1: "", o: {} };
    try { K = this._hzK(m) || K; } catch (_) { /* Modul noch nicht geladen */ }
    const hd = K.hd || (this._hzNew() ? this._hzHdFor(m) : "");
    const pic = this._hzNew() && K.pic ? K.pic : hd && this._hzNew() ? this._gx(hd, 52, K.o || {}) : ic(m.icon, 40);
    const val = K.v == null || K.z === "off" ? "" : `${esc(String(K.v))}${K.u ? ` ${esc(K.u)}` : ""}`;
    const line = K.u === "%" && val && K.l1 ? `${val} ${K.l1}` : [val, K.l1].filter(Boolean).join(" · ");
    const stg = modSt(m) && modSt(m) !== "stabil" && STG[modSt(m)] ? `<em>${({ dev: "Entwicklung", vorab: "Vorab" })[modSt(m)] || STG[modSt(m)].t}</em>` : "";
    return `<button class="tm2t z-${K.z}" data-act="tmgo" data-k="${m.id}" aria-label="${esc(m.short)}: ${esc(this.constructor.HZ_ZT[K.z] || "")}"><span class="tm2tp">${pic}</span><b>${esc(m.short)}</b><small>${line}</small>${stg}</button>`;
  }
  _tm2Hint(h) {
    const HD = { fh: "windowOpen", ww: "boiler", mu: "bin", wx: "weather", sf: "smoke", ev: "car", gs: "plug", en: "pvRoof" };
    const hd = h.hd || (h.i === "alert" && /Batterie/.test(h.t) ? "smoke" : HD[h.mod] || (h.blk === "alarm" ? "shield" : ""));
    const pic = hd && this._hzNew() ? this._gx(hd, 40, { alarm: !!h.alarm, frost: !!h.frost, k: h.c === "bad" ? "bad" : "ok" }) : ic(ICONS[h.i] ? h.i : "info", 24);
    /* Müllabfuhr: derselbe Knopf wie auf der bisherigen Wandkarte */
    let act = "";
    if (h.mod === "mu" && this._muOn() && (h.k === "mu" || h.k === "mu:back")) {
      const back = h.k === "mu:back", ok = back || this._hzMu().some((x) => ["out", "today"].includes(x.state));
      if (ok) act = `<button class="tm2hb" data-act="${back ? "muxinall" : "muxdoneall"}">${ic("check", 18)}<span>${back ? "Wieder drin" : "Steht draußen"}</span></button>`;
    }
    const tag = h.mod ? "button" : "div";
    return `<div class="tm2h1 z-${this._hzZ(h.c || "in")}"><${tag} class="tm2hm"${h.mod ? ` data-act="tmgo" data-k="${h.mod}"` : ""}><span class="tm2hp">${pic}</span><span class="tm2hx"><b>${h.t}</b>${h.s ? `<small>${h.s}</small>` : ""}</span></${tag}>${act}</div>`;
  }
  _tm2Start() {
    const nw = this._hzNew(), all = this._hzHints(), vis = nw ? this._hzVis(all) : all, cap = this._tm2Cap();
    const mods = nw ? this._hzMods(false) : this._mdList().filter((x) => x.id !== "st");
    if (mods.some((x) => x.id === "mu") && this._muOn()) this._muLoad();
    const strip = this._mqStrip ? this._mqStrip() : "";          /* Sponsor Max: Räume und Schnellaktionen auf dem Wandtablet */
    const qa = nw && this._hzQaRow ? this._hzQaRow(true) : "";
    const pt = this._tm2Page("tiles", mods.length, cap.t), ph = this._tm2Page("hints", vis.length, cap.h), hid = all.length - vis.length;
    /* Passen alle Module auf eine Seite, nutzen sie den Platz ganz */
    const cols = pt.pages > 1 ? cap.cols : Math.min(cap.cols, Math.max(2, Math.ceil(mods.length / (this._tm2Land() ? 2 : cap.rows)))), rows = pt.pages > 1 ? cap.rows : Math.max(1, Math.ceil(mods.length / cols));
    const tiles = mods.length ? `<div class="tm2grid" style="--c:${cols};--r:${rows}">${mods.slice(pt.from, pt.to).map((x) => this._tm2Tile(x)).join("")}</div>` : `<div class="card empty">Keine Kacheln ausgewählt.</div>`;
    const hints = vis.length ? vis.slice(ph.from, ph.to).map((h) => this._tm2Hint(h)).join("") : `<div class="tm2ok">${nw ? this._gx("shield", 56, { k: "ok" }) : ic("check", 40)}<b>Keine offenen Hinweise</b></div>`;
    const later = hid ? `<button class="tm2later" data-act="hzlaterclr">${ic("clock", 16)}${hid} auf später · wieder zeigen</button>` : "";
    return this._hzWrap(`${strip || this._tm2Scene(vis)}${qa}${this._tm2Bubbles()}<div class="tm2low${vis.length ? "" : " nohint"}">
      <section class="tm2col" data-sw="tiles">${tiles}${this._tm2Pager("tiles", pt, "Module")}</section>
      <section class="tm2side" data-sw="hints" style="--h:${cap.h}"><div class="tm2hl">${hints}</div>${later}${this._tm2Pager("hints", ph, "")}</section></div>`);
  }
  /* ---------- „Mehr“: alle Module ---------- */
  _tm2More() {
    const items = this._tmItems().filter((x) => x.id !== "st"), L = this._mdList(), rail = this._tm2Rail(this._tmItems()).map((x) => x.id), land = this._tm2Land();
    const per = land ? (window.innerHeight < 720 ? 12 : 16) : window.innerHeight < 1000 ? 8 : 12, p = this._tm2Page("more", items.length, per);
    const card = (x) => {
      const m = L.find((y) => y.id === x.id) || {}, hd = this._hzNew() ? this._hzHdFor(m) : "", num0 = m.n || m.num0;
      return `<button class="tm2m ${this._tmV() === x.id ? "sel" : ""} ${rail.includes(x.id) ? "inr" : ""}" data-act="tmgomore" data-k="${x.id}">${hd ? this._gx(hd, 46, {}) : ic(x.icon, 32)}<span><b>${esc(m.short || x.name)}</b><small>${num0 ? `Modul ${m.n}` : "Modul"}${rail.includes(x.id) ? " · in der Leiste" : ""}</small></span></button>`;
    };
    return `<div class="ov" data-act="close"></div><div class="sheet wide tm2all" role="dialog" aria-modal="true"><div class="sh"><div><b>Alle Module</b><span>Antippen zum Öffnen</span></div><button class="btn2 tm2ed" data-act="tmlock">${ic(this._tmMe().has_pin ? "lock" : "sliders", 18)} Leiste anpassen</button><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div data-sw="more"><div class="tm2mg">${items.slice(p.from, p.to).map(card).join("")}</div>${this._tm2Pager("more", p, "Module")}</div></div>`;
  }
  /* Ruhebild: bis zu drei Hinweise unter der Uhr (Konzept: Variante B als Ruhebild) */
  _tm2RestHints() {
    if (!this._tm2On() || !this._hzNew()) return "";
    const H = this._hzVis(this._hzHints()).slice(0, 3);
    return H.length ? `<div class="tm2rh">${H.map((h) => `<div class="z-${this._hzZ(h.c || "in")}"><i></i><span><b>${h.t}</b>${h.s ? `<small>${h.s}</small>` : ""}</span></div>`).join("")}</div>` : "";
  }
  /* ---------- Bedienung ---------- */
  _tm2Turn(key, d) {
    const P = this._tmPg || (this._tmPg = {}); P[key] = Math.max(0, (P[key] || 0) + d); this._tmLast = Date.now(); this._tmHomed = false;
    if (key === "more") this._renderModal(); else this._render();
  }
  /* Wischen nach links oder rechts blättert, wie die Pfeile */
  _tm2Bind() {
    if (this._tm2Bound) return; this._tm2Bound = true;
    const sr = this.shadowRoot;
    sr.addEventListener("pointerdown", (e) => { this._tm2Sw = false; const a = e.target.closest && e.target.closest("[data-sw]"); this._tm2P = a ? { k: a.dataset.sw, x: e.clientX, y: e.clientY, t: Date.now() } : null; }, true);
    sr.addEventListener("pointercancel", () => { this._tm2P = null; }, true);
    sr.addEventListener("pointerup", (e) => {
      const s = this._tm2P; this._tm2P = null; if (!s || !this._tmOn() || this._tmSleep) return;
      const dx = e.clientX - s.x, dy = e.clientY - s.y;
      if (Math.abs(dx) < 60 || Math.abs(dx) < 1.5 * Math.abs(dy) || Date.now() - s.t > 900) return;
      this._tm2Sw = true; setTimeout(() => this._tm2Turn(s.k, dx < 0 ? 1 : -1), 0);
    }, true);
    /* Der Klick, der auf eine Wischgeste folgt, öffnet nichts */
    sr.addEventListener("click", (e) => { if (this._tm2Sw && e.detail !== 0) { this._tm2Sw = false; e.stopPropagation(); e.preventDefault(); } }, true);
  }
  _tm2Act(a, b) {
    const k = b.dataset.k;
    if (a === "tm2pg") { this._tm2Turn(k, +b.dataset.d); return true; }
    if (a === "tm2tab") { (this._tm2T = this._tm2T || {})[b.dataset.v] = k; this._tmHomed = false; this._render(); return true; }
    if (a === "tm2room") { this._modal = { type: "tm2room", id: b.dataset.id, tab: "ctl" }; this._renderModal(); return true; }
    if (a === "tm2rtab") { if (this._modal && this._modal.type === "tm2room") { this._modal.tab = k; this._renderModal(); } return true; }
    if (a === "tm2x") { this._modal = { type: "tm2x", k, s: b.dataset.s || "", id: b.dataset.id || "" }; this._renderModal(); return true; }
    if (a === "tm2run") { if (this._modal && this._modal.type === "tm2x") { this._modal.run = +k; this._renderModal(); } return true; }
    if (a === "tm2rest") { this._tmSave({ rest: k }); return true; }
    if (a === "tm2tfday") { this._tm2TfDay = k; this._tmHomed = false; this._render(); return true; }
    if (a === "tm2spgs") { (this._tm2T = this._tm2T || {}).gs = "win"; this._tmView = "gs"; this._tmHomed = false; this._render(); return true; }
    /* Modul 8: ganze Seite zum Bearbeiten (kommt über tm2g, also erst nach der PIN) */
    if (a === "tm2evfull") { this._evWallFull = true; this._wbTab = k === "set" && this._evNew() ? "veh" : k; this._tmHomed = false; this._render(); return true; }
    if (a === "tm2prob") { this._modal = { type: "tm2prob" }; this._renderModal(); return true; }
    if (a === "tm2ww") { this._modal = { type: "tm2ww", kind: k }; this._renderModal(); return true; }
    /* Ändern erst nach der PIN: data-g ist die eigentliche Aktion */
    if (a === "tm2g") { const d = { ...b.dataset }, g = d.g; this._tm2Guard(() => (g === "tm2ww" ? this._tm2Act(g, { dataset: d }) : this._act(g, { dataset: d }))); return true; }
    if (a === "tm2look") { this._tmSave({ look: k === "classic" ? "classic" : "new" }); return true; }
    if (a === "tm2rail") {
      const cur = this._tm2Rail(this._tmItems()).map((x) => x.id), next = cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k];
      if (next.length > 4) { this._toast("In die Leiste passen vier Module. Erst eines abwählen."); return true; }
      if (!next.length) { this._toast("Mindestens ein Modul bleibt in der Leiste."); return true; }
      this._tmSave({ rail: next }); return true;
    }
    return false;
  }
