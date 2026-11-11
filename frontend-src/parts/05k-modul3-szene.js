  /* ================= Modul 3 · Neue Optik Stufe 3 (Konzept „Modul 3 – Neue Optik“): Energie-Szene =================
     A1: Das Modul-Logo im Banner wird zur Szene: dein Haus mit Dach-PV, Balkonkraftwerk, Batterie (Füllstand, unter 20 % rot),
     Strommast (Linie grün bei Einspeisung, rot bei Bezug) und Auto an der Wallbox (nur wenn Modul 8 an ist).
     Werte stehen direkt am Gerät. Antippen führt hin: Batterie → Modul 13, Auto → Modul 8, Solar → Modul 16,
     Strommast → Modul 14 – ist das Modul aus, ist das Teil nur Anzeige.
     A2: Die Szene folgt den echten Flüssen; Himmel und Wetter wie in Modul 1 (_hsSky/_hsSkyDraw).
     Bei vergangenen Zeiträumen oder Woche/Monat/Jahr zeigt sie die Summe (dicke Linie = viel Energie) mit „Σ“.
     I: Am Handy ein flacher Streifen ohne Werte an den Geräten; auf der Startseite eine Mini-Szene in „Energie jetzt“.
     Einstellungen (Anpassen → Aussehen): layout.m3 = { scene: false → Banner wie bisher, tags: false → keine Werte, car: false → Auto aus } */
  _m3Sc() { const m = this._cfg.layout.m3 || {}; return { on: this._m3On() && m.scene !== false, tags: m.tags !== false, car: m.car !== false }; }
  /* Werte für die Szene: live (jetzt) oder Summe im Zeitraum (Σ) */
  _m3ScVals(n) {
    const E = this._enState(), P = this._enPer(), live = E.range === "day" && P.cur, c = this._m3Sc(), car = c.car ? this._m3Car() : null;
    if (live) return { live: true, pv: n.pva, pvb: n.pvb, has2: n.pvb != null, exp: n.exp, imp: n.imp, bc: n.bc, dis: n.dis, hasBat: n.hasBat, soc: n.soc, car: car ? car.w : null, hasCar: !!car };
    const s = this._enSum(); if (!s || s.empty) return null;
    let bc = 0, dis = 0; if (n.hasBat && this._enH && this._enH.res) { const t = this._enBk().reduce((a, y) => ({ c: a.c + y.bchg, d: a.d + y.bdis }), { c: 0, d: 0 }); bc = t.c; dis = t.d; }
    return { live: false, pv: Math.max(0, s.pv - (s.pvb || 0)), pvb: s.pvb || 0, has2: n.pvb != null, exp: s.exp, imp: s.imp, bc, dis, hasBat: n.hasBat, soc: n.soc, car: null, hasCar: !!car };
  }
  _m3ScSvg(n, o = {}) {
    const V = this._m3ScVals(n); if (!V) return null;
    const sky = this._hsSky(), night = sky.tod === "night", grey = sky.cloud && !night, wh = sky.frost || sky.snow, u = "m3s" + (this.constructor._gxN = ((this.constructor._gxN || 0) + 1) % 1e6) + "_", q = (x) => u + x;
    const L = V.live, fmt = (v) => (L ? (v >= 1000 ? num(v / 1000, 1) + " kW" : Math.round(v) + " W") : num(v, v >= 100 ? 0 : 1) + " kWh"), act = (v) => v >= (L ? 20 : .05);
    const mx = L ? 1 : Math.max(.1, V.pv + V.pvb, V.exp, V.imp, V.bc, V.dis), sw = (v) => (L ? 1.6 + Math.min(4.2, v / 900) : 1.6 + 4.2 * Math.min(1, v / mx)).toFixed(1);
    const SK = this._hsSkyCols(sky.tod), HC = this._hsHouseCols(night), kl = this._hsx().house === "klassisch";
    const lg = (id, st, x2 = 0, y2 = 1) => `<linearGradient id="${q(id)}" x1="0" y1="0" x2="${x2}" y2="${y2}">${st.map(([p, c, a]) => `<stop offset="${p}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ""}/>`).join("")}</linearGradient>`;
    const surplus = L ? V.exp > 50 : V.exp > .2, pvOn = act(V.pv);
    let d = `<defs>${lg("sk", [[0, grey && !this._hsx().S.c ? "#93a7bf" : SK[0]], [1, grey && !this._hsx().S.c ? "#dde5ee" : SK[1]]])}
      <radialGradient id="${q("sun")}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff7c2"/><stop offset=".55" stop-color="#fde68a"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></radialGradient>
      ${lg("gr", night ? [[0, wh ? "#c7d0dc" : "#1c3a28"], [1, wh ? "#9aa6b5" : "#0f2418"]] : [[0, wh ? "#ffffff" : "#5fd27e"], [1, wh ? "#dfe7f0" : "#27864a"]])}
      ${lg("fw", kl ? (night ? [[0, "#e5dccb"], [1, "#b9ae99"]] : [[0, "#fbfaf7"], [1, "#e7e2d8"]]) : [[0, HC.wall[0]], [1, HC.wall[1]]], 1, 0)}${lg("sw", kl ? (night ? [[0, "#a59c8c"], [1, "#857c6e"]] : [[0, "#dcd6ca"], [1, "#c2baab"]]) : [[0, HC.side[0]], [1, HC.side[1]]], 1, 0)}
      ${lg("rf", kl ? [[0, "#b4473f"], [1, "#7a2420"]] : [[0, HC.roof[0]], [1, HC.roof[1]]])}${lg("pv", surplus && !night ? [[0, "#93c5fd"], [.5, "#3b82f6"], [1, "#1e40af"]] : [[0, "#475f8a"], [1, "#1e2c4d"]], 1, 1)}
      ${lg("gl", night ? [[0, "#fde68a"], [1, "#f59e0b"]] : [[0, "#e0f2fe"], [1, "#7dd3fc"]], .6, 1)}${lg("bt", [[0, "#f8fafc"], [1, "#cbd5e1"]], 1, 0)}
      ${lg("car", [[0, "#5eead4"], [1, "#0f766e"]])}<filter id="${q("b")}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4"/></filter></defs>`;
    d += this._hsSkyDraw(sky, q);
    d += `<rect x="-2" y="156" width="364" height="46" fill="url(#${q("gr")})"/>` + [[36, 156, 10], [120, 157, 7], [354, 157, 9]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .6}" fill="${wh ? "#eef3f8" : night ? "#1d4a2c" : "#22a35a"}"/>`).join("");
    /* Fluss-Linie: graue Spur, aktiv farbig mit Leuchtsaum und laufenden Punkten (Richtung = Pfad) */
    const K = [], dsp = (v) => (!L ? "2.00" : v < 600 ? "2.40" : v < 2500 ? "1.60" : "0.90");
    const ln = (dd, v, c) => (K.push(act(v) ? dsp(v) : 0), "") + `<path d="${dd}" fill="none" stroke="rgba(15,23,42,.35)" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="2 3"/>` + (act(v) ? `<path d="${dd}" fill="none" stroke="${c}" stroke-width="${(+sw(v) + 4).toFixed(1)}" opacity=".45" filter="url(#${q("b")})"/><path d="${dd}" fill="none" stroke="${c}" stroke-width="${sw(v)}" stroke-linecap="round"/><path class="m3dt" d="${dd}" style="stroke-width:${Math.max(2, sw(v) * .6).toFixed(1)}px;animation-duration:${dsp(v)}s"/>` : "");
    const go = (k) => { const m = { bat: "bt", car: "ev", pv: "sp", grid: "dt" }[k]; return o.tap !== false && m && this._m3Has(m) ? ` data-act="mdgo" data-k="${m}" role="button" tabindex="0" class="m3tap"` : ""; };
    /* Strommast rechts hinten */
    const mc = night ? "#94a3b8" : "#475569";
    d += `<g${go("grid")}><path d="M322 160 L334 58 L346 160 M325 136 H343 M327 112 H341 M330 88 H338 M322 160 L341 112 M346 160 L327 112 M327 112 L338 88 M341 112 L330 88" fill="none" stroke="${mc}" stroke-width="1.6" stroke-linejoin="round"/><path d="M318 72 H350 M322 84 H346" stroke="${mc}" stroke-width="1.8"/>${[318, 350, 322, 346].map((x, i) => `<circle cx="${x}" cy="${i < 2 ? 72 : 84}" r="1.5" fill="${mc}"/>`).join("")}<rect x="314" y="54" width="40" height="110" fill="transparent"/></g>`;
    /* Haus: Giebelseite vorn, Seitenwand und Dachfläche mit PV rechts */
    const win = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.4" fill="url(#${q("gl")})" stroke="#64748b" stroke-width=".7"/><path d="M${x + w / 2} ${y} v${h} M${x} ${y + h / 2} h${w}" stroke="#94a3b8" stroke-width=".5" opacity=".7"/>`;
    d += `<polygon points="206,98 262,92 262,158 206,160" fill="url(#${q("sw")})"/><polygon points="136,98 206,98 206,160 136,160" fill="url(#${q("fw")})"/><polygon points="132,100 171,58 210,100" fill="url(#${q("fw")})"/>
      <polygon points="171,58 228,52 266,94 210,100" fill="url(#${q("rf")})"/><path d="M130 101 L171 56 L212 101" fill="none" stroke="${HC.roof[1]}" stroke-width="3" stroke-linejoin="round"/>
      ${win(146, 112, 18, 16)}${win(178, 112, 18, 16)}<rect x="162" y="136" width="15" height="24" rx="1.5" fill="#7c3f1d"/><circle cx="174" cy="149" r=".9" fill="#fde68a"/>${win(216, 108, 14, 14)}${win(240, 106, 14, 14)}${win(216, 132, 14, 14)}${win(240, 131, 14, 14)}
      <rect x="164" y="80" width="14" height="12" rx="1" fill="url(#${q("gl")})" stroke="#64748b" stroke-width=".6"/>`;
    /* PV-Feld auf der Dachfläche (bilinear zwischen den vier Ecken) */
    const P = (s, t) => { const A = [182, 58.5], B = [222, 54], C = [255, 89], D = [215, 93.5], x = A[0] + (B[0] - A[0]) * s + (D[0] - A[0]) * t + (A[0] - B[0] + C[0] - D[0]) * s * t, y = A[1] + (B[1] - A[1]) * s + (D[1] - A[1]) * t + (A[1] - B[1] + C[1] - D[1]) * s * t; return `${x.toFixed(1)},${y.toFixed(1)}`; };
    let pv = ""; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const s0 = i / 3 + .015, s1 = (i + 1) / 3 - .015, t0 = j / 3 + .02, t1 = (j + 1) / 3 - .02; pv += `<polygon points="${P(s0, t0)} ${P(s1, t0)} ${P(s1, t1)} ${P(s0, t1)}" fill="url(#${q("pv")})" stroke="#cbd5e1" stroke-width=".5"/>`; }
    d += `<g${go("pv")}>${pv}${surplus && !night ? `<polygon class="m3gls" points="${P(.05, .1)} ${P(.3, .1)} ${P(.18, .9)} ${P(0, .9)}" fill="#fff" opacity=".28"/>` : ""}</g>`;
    /* Balkonkraftwerk am Geländer links */
    if (V.has2) d += `<g><rect x="106" y="118" width="32" height="3" rx="1" fill="#94a3b8"/><path d="M108 106 H136 M108 106 V118 M115 106 V118 M122 106 V118 M129 106 V118 M136 106 V118" stroke="#64748b" stroke-width="1.1"/><polygon points="107,96 135,96 137,110 105,110" fill="url(#${q("pv")})" stroke="#cbd5e1" stroke-width=".6"/><path d="M121 96 V110 M106 103 H136" stroke="#cbd5e1" stroke-width=".4"/></g>`;
    /* Batterie-Speicher links */
    if (V.hasBat) {
      const lv = Math.max(0, Math.min(100, V.soc != null ? V.soc : 60)), red = V.soc != null && V.soc < 20, h = 30 * lv / 100;
      d += `<g${go("bat")}><rect x="66" y="118" width="26" height="42" rx="5" fill="url(#${q("bt")})" stroke="#94a3b8" stroke-width=".8"/><rect x="71" y="124" width="16" height="30" rx="2.5" fill="#1e1b4b"/><rect x="71" y="${(154 - h).toFixed(1)}" width="16" height="${h.toFixed(1)}" rx="2.5" fill="${red ? "#ef4444" : "#8b5cf6"}"/>
        ${V.soc != null ? `<text x="79" y="141" text-anchor="middle" font-size="6.6" font-weight="800" fill="#fff" font-family="system-ui,sans-serif">${Math.round(V.soc)}%</text>` : ""}${L && V.bc > 20 ? `<path class="m3bz" d="M80 112 l-3 5 h3 l-2 5 l5 -6 h-3 l2 -4z" fill="#fde047"/>` : ""}</g>`;
    }
    /* Wallbox an der Seitenwand und Auto rechts */
    if (V.hasCar) {
      const chg = L && V.car > 20;
      d += `<g${go("car")}><rect x="266" y="128" width="4" height="31" rx="1" fill="#94a3b8"/><rect x="263" y="120" width="10" height="15" rx="2.5" fill="#f8fafc" stroke="#94a3b8" stroke-width=".6"/><circle cx="268" cy="125" r="1.7" fill="${chg ? "#22d3ee" : "#64748b"}"/>
        <g transform="translate(14 0)"><path d="M270 152 q2 -12 14 -13 l10 -7 h20 l10 7 q8 1 9 8 v6 h-63z" fill="url(#${q("car")})"/><path d="M286 139 l8 -6 h9 v6z M305 133 h8 l7 6 h-15z" fill="url(#${q("gl")})"/>
        <circle cx="285" cy="153" r="6" fill="#1f2937"/><circle cx="285" cy="153" r="2.6" fill="#9ca3af"/><circle cx="315" cy="153" r="6" fill="#1f2937"/><circle cx="315" cy="153" r="2.6" fill="#9ca3af"/>
        ${chg ? `<path class="m3bz" d="M300 120 l-3 6 h3 l-2 6 l6 -7 h-3 l2 -5z" fill="#fde047"/>` : ""}</g></g>`;
    }
    /* Flüsse */
    const col = { pv: "#fbbf24", exp: "#34d399", imp: "#f87171", bat: "#a78bfa", car: "#22d3ee" };
    d += ln("M235 90 V126", V.pv, col.pv);
    if (V.has2) d += ln("M138 104 H146", V.pvb, col.pv);
    if (V.hasBat) d += V.dis > V.bc ? ln("M92 138 H136", V.dis, col.bat) : ln("M136 138 H92", V.bc, col.bat);
    d += V.exp >= V.imp ? ln("M262 94 C284 80 304 72 320 72", V.exp, col.exp) : ln("M320 72 C304 72 284 80 262 94", V.imp, col.imp);
    if (V.hasCar) d += ln("M262 150 H266", V.car || 0, col.car) + ln("M273 128 C282 128 286 136 288 142", V.car || 0, col.car);
    /* Werte am Gerät */
    const tag = (x, y, t1, t2, c, anchor = "start") => { const w = Math.max(t1.length * 3.6, t2.length * 4.6) + 10, x0 = anchor === "end" ? x - w : x; return `<g class="m3tg"><rect x="${x0.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="21" rx="4.5" fill="rgba(15,23,42,.8)" stroke="${c}" stroke-width=".9"/><text x="${(x0 + 5).toFixed(1)}" y="${y + 8}" font-size="6.2" fill="#e2e8f0" font-family="system-ui,sans-serif">${esc(t1)}</text><text x="${(x0 + 5).toFixed(1)}" y="${y + 17.4}" font-size="8" font-weight="800" fill="${c}" font-family="system-ui,sans-serif">${t2}</text></g>`; };
    const nm = this._enPvNames();
    if (o.tags !== false) {
      d += tag(172, 24, nm[0], fmt(V.pv), col.pv);
      const ex = V.exp >= V.imp; d += tag(314, 32, "Netz", act(ex ? V.exp : V.imp) ? (ex ? "↑ " : "↓ ") + fmt(ex ? V.exp : V.imp) : "0 W", ex ? col.exp : col.imp, "end");
      if (V.has2) d += tag(102, 70, nm[1], fmt(V.pvb), col.pv, "end");
      if (V.hasBat) d += tag(54, 158, "Batterie", L ? (V.bc > 20 ? "lädt " + fmt(V.bc) : V.dis > 20 ? "gibt " + fmt(V.dis) : V.soc != null && V.soc < 20 ? "leer · " + Math.round(V.soc) + " %" : "ruht") : "↑" + fmt(V.bc) + " ↓" + fmt(V.dis), V.soc != null && V.soc < 20 ? col.imp : col.bat);
      if (V.hasCar && L) d += tag(292, 158, V.car > 20 ? "Auto lädt" : "Auto", V.car > 20 ? fmt(V.car) : "lädt nicht", col.car);
    }
    if (!L) d += `<g><circle cx="20" cy="20" r="11" fill="rgba(15,23,42,.75)" stroke="#fff" stroke-width=".8"/><text x="20" y="24.5" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" font-family="system-ui,sans-serif">Σ</text></g>`;
    const key = [o.vb || "", this._hsx().house, this._hsx().sky, sky.tod, sky.w, sky.frost ? 1 : 0, L ? 1 : 0, ...K, V.has2 ? 1 : 0, V.hasBat ? 1 : 0, V.hasCar ? 1 : 0, L && V.bc > 20 ? 1 : 0, L && V.car > 20 ? 1 : 0, surplus ? 1 : 0, V.exp >= V.imp ? 1 : 0, V.dis > V.bc ? 1 : 0, V.soc != null && V.soc < 20 ? 1 : 0, o.tags !== false ? 1 : 0, this._rkCfg().anim].join("|");
    return { svg: `<svg viewBox="${o.vb || "0 0 360 200"}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Energie-Szene: ${esc(this._m3ScSay(V))}">${d}</svg>`, key, V };
  }
  /* Ein Satz, was gerade passiert (Bedienungshilfen, Konzept W1) */
  _m3ScSay(V) {
    if (!V.live) return "Summe im gewählten Zeitraum";
    const p = [];
    if (V.pv + (V.pvb || 0) > 20) p.push("Sonne liefert " + wfmt(V.pv + (V.pvb || 0)));
    if (V.bc > 20) p.push("Batterie lädt"); else if (V.dis > 20) p.push("Batterie versorgt das Haus");
    if (V.car > 20) p.push("Auto lädt");
    p.push(V.exp > 20 ? wfmt(V.exp) + " gehen ins Netz" : V.imp > 20 ? wfmt(V.imp) + " kommen aus dem Netz" : "Netz ausgeglichen");
    return p.join(", ");
  }
  _m3Scene(n) {
    const c = this._m3Sc(); if (!c.on) return "";
    const NR = this._narrow || (this.clientWidth || 999) < 600, vb = NR ? "0 44 360 128" : "", x = this._m3ScSvg(n, { tags: c.tags && !NR, vb });
    if (!x) return "";
    return `<div class="m3ss" data-kk="${esc("m3s|" + x.key)}" data-ks="1" data-an="${this._rkCfg().anim}">${x.svg}</div>`;
  }
  /* Startseite: Mini-Szene ohne Werte in „Energie jetzt“ */
  _m3ScMini(n) {
    if (!this._m3Sc().on) return "";
    const x = this._m3ScSvg(n, { tags: false, tap: false, vb: "0 40 360 130" }); if (!x || !x.V.live) return "";
    return `<div class="m3ss m3mini" data-kk="${esc("m3m|" + x.key)}" data-ks="1" data-an="${this._rkCfg().anim}">${x.svg}</div>`;
  }
  _m3ScLook() {
    if (!this._m3On()) return "";
    const c = this._m3Sc(), sw = (on, act, t, s) => `<div class="vrow"><span>${t}<small class="mut" style="display:block">${s}</small></span><button class="sw ${on ? "on" : ""}" data-act="${act}" aria-pressed="${on}" aria-label="${t}"></button></div>`;
    return sw(c.on, "m3scene", "Energie-Szene im Banner", "Dein Haus mit Solar, Batterie, Netz und Auto statt Modul-Logo. Aus: Banner wie bisher.") +
      (c.on ? this._hsxLook() + sw(c.tags, "m3tags", "Werte an den Geräten", "Leistung direkt an Solar, Netz, Balkon, Batterie und Auto (am Handy immer ohne).") + (this._m3Has("ev") ? sw(c.car, "m3car", "Auto zeigen", "Auto und Wallbox aus Modul 8 in Szene und Energiefluss.") : "") : "");
  }
