  /* ================= W7 · Sponsor-Extra: Haus-Stile und Himmel-Themen (Konzept Modul 3, W7 / Modul 1) =================
     Gilt für die Haus-Szene in Modul 1 und die Energie-Szene in Modul 3. Die Grund-Szene (Klassisch, Natürlich) bleibt für alle frei;
     die weiteren Stile und Themen gibt es mit aktivem Sponsor-Schlüssel. Ohne Sponsor wird immer die Grund-Szene gezeichnet.
     Einstellung: layout.hsx = { house: klassisch | modern | skandi | backstein | mediterran, sky: natur | pastell | nordlicht | golden } */
  static HS_HOUSE = {
    klassisch: { n: "Klassisch", wall: ["#f4ead8", "#e2d3b8"], side: ["#dcd6ca", "#c2baab"], roof: ["#c2564d", "#7a2420"] },
    modern: { n: "Modern", wall: ["#ffffff", "#e5e7eb"], side: ["#d1d5db", "#9ca3af"], roof: ["#4b5563", "#1f2937"] },
    skandi: { n: "Skandinavisch", wall: ["#c0392b", "#8e2a20"], side: ["#9b2c22", "#6d1f18"], roof: ["#374151", "#111827"] },
    backstein: { n: "Backstein", wall: ["#c2410c", "#7c2d12"], side: ["#9a3412", "#6b2410"], roof: ["#57534e", "#292524"] },
    mediterran: { n: "Mediterran", wall: ["#fef3c7", "#fde68a"], side: ["#f6d98b", "#e9c46a"], roof: ["#f97316", "#9a3412"] },
  };
  static HS_SKY = {
    natur: { n: "Natürlich", c: null },
    pastell: { n: "Pastell", c: { night: ["#312e81", "#6b21a8"], morning: ["#fbcfe8", "#e0e7ff"], evening: ["#f9a8d4", "#a5b4fc"], day: ["#a5b4fc", "#fbcfe8"] } },
    nordlicht: { n: "Nordlicht", c: { night: ["#020617", "#0c3b4a"], morning: ["#7dd3fc", "#e0f2fe"], evening: ["#0e7490", "#4c1d95"], day: ["#38bdf8", "#f0f9ff"] } },
    golden: { n: "Goldene Stunde", c: { night: ["#1e1b4b", "#7c2d12"], morning: ["#fb923c", "#fde68a"], evening: ["#ea580c", "#7e22ce"], day: ["#fdba74", "#fef3c7"] } },
  };
  _hsxOk() { return !!(this._spnS && this._spnS().active); }
  _hsx() {
    const x = this._cfg.layout.hsx || {}, K = this.constructor, ok = this._hsxOk();
    const house = ok && K.HS_HOUSE[x.house] ? x.house : "klassisch", sky = ok && K.HS_SKY[x.sky] ? x.sky : "natur";
    return { house, sky, H: K.HS_HOUSE[house], S: K.HS_SKY[sky] };
  }
  /* Farbe abdunkeln (Nacht): f = 0..1 */
  _hsDk(hex, f) { const n = parseInt(hex.slice(1), 16), c = (s) => Math.round(((n >> s) & 255) * f); return `#${((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1)}`; }
  _hsSkyCols(tod) {
    const S = this._hsx().S;
    return (S.c || { night: ["#0a1430", "#26325f"], morning: ["#f7b98a", "#cfe0f7"], evening: ["#f29a6a", "#5d4b8c"], day: ["#6fbcff", "#e2f3ff"] })[tod];
  }
  /* Wand, Seitenwand und Dach im gewählten Stil; nachts dunkler */
  _hsHouseCols(night) {
    const H = this._hsx().H, d = (a) => (night ? a.map((c) => this._hsDk(c, .58)) : a);
    return { wall: d(H.wall), side: d(H.side), roof: H.roof };
  }
  /* Nordlicht: grün-violette Bänder am Nachthimmel */
  _hsAurora(sky) {
    if (this._hsx().sky !== "nordlicht" || sky.tod !== "night") return "";
    return `<g class="hsau" opacity=".55"><path d="M-10 60 C60 20 120 70 190 34 S310 40 370 18" fill="none" stroke="#34d399" stroke-width="14" stroke-linecap="round" opacity=".55"/><path d="M-10 74 C70 44 140 86 210 52 S320 60 370 36" fill="none" stroke="#a78bfa" stroke-width="9" stroke-linecap="round" opacity=".45"/><path d="M20 48 C90 18 150 52 230 26" fill="none" stroke="#6ee7b7" stroke-width="4" stroke-linecap="round" opacity=".7"/></g>`;
  }
  _hsxLook() {
    const K = this.constructor, x = this._hsx(), ok = this._hsxOk();
    const row = (t, set, cur, act) => `<div class="hsxr"><b>${t}</b><div class="hsxc">${Object.entries(set).map(([k, v], i) => `<button class="hsxb${cur === k ? " sel" : ""}${!ok && i ? " lk" : ""}" data-act="${ok || !i ? act : "spnopen"}" data-k="${k}" aria-pressed="${cur === k}">${act === "hsxh" ? `<i style="background:linear-gradient(${v.roof[0]} 0 40%,${v.wall[0]} 40%)"></i>` : `<i style="background:linear-gradient(${(v.c || { day: ["#6fbcff", "#e2f3ff"] }).day.join(",")})"></i>`}${esc(v.n)}${!ok && i ? " 🔒" : ""}</button>`).join("")}</div></div>`;
    return `<div class="lsec">${ic("heart", 15)}Sponsor-Extra: Haus-Stil und Himmel</div>${row("Haus-Stil", K.HS_HOUSE, x.house, "hsxh")}${row("Himmel", K.HS_SKY, x.sky, "hsxs")}
      <div class="mut sm" style="margin:4px 0 0">${ok ? "Gilt für die Haus-Szene in Modul 1 und die Energie-Szene in Modul 3." : "Klassisch und Natürlich sind für alle. Weitere Stile gibt es für Sponsoren – tippe auf einen Stil mit Schloss."}</div>`;
  }
  _hsxAct(a, b) {
    if (a !== "hsxh" && a !== "hsxs") return false;
    const L = this._cfg.layout; L.hsx = { ...(L.hsx || {}), [a === "hsxh" ? "house" : "sky"]: b.dataset.k };
    this._saveLayout(); this._render(); this._renderModal(); return true;
  }
