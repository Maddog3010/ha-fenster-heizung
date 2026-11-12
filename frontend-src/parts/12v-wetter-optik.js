  /* ================= Modul 9 · Neue Optik Stufe 1 (v0.7, Konzept_Modul9_Wetter-Warnungen Teil D) =================
     D1 · Wetter-Szene als Banner: dasselbe Haus wie Startseite und Modul 1, Himmel nach Tageszeit und Wetter (_hsSky).
          Die Warnungen zeigen sich in der Szene: Baum neigt sich und Windstreifen bei Sturm, Blitz bei Gewitter, Hagelkörner,
          Eis und Schnee bei Frost und Glätte, Hitzeflimmern. Rollläden unten und Markise eingefahren, wenn eine Aktion das getan hat.
     D3 · Warnkacheln 2.0: eine Kachel je Warnung, Wert groß, Bogen gegen die Grenze, Zustandspunkt, ruhige Kacheln ohne Rahmenfarbe.
     Stufenfarben wie beim DWD: 1 gelb, 2 orange, 3 rot, 4 violett. */
  static WX_LV = { 0: ["#2dd4bf", "Ruhig"], 1: ["#facc15", "Wetterwarnung"], 2: ["#fb923c", "Markantes Wetter"], 3: ["#ef4444", "Unwetter"], 4: ["#a855f7", "Extremes Unwetter"] };
  _wxLvCol(lv) { return (this.constructor.WX_LV[Math.max(0, Math.min(4, lv || 0))] || this.constructor.WX_LV[0])[0]; }
  _wxLvName(lv) { return (this.constructor.WX_LV[Math.max(0, Math.min(4, lv || 0))] || this.constructor.WX_LV[0])[1]; }
  /* Szene: o = { storm, thunder, hail, rain, frost, ice, heat, shut (Rollläden unten), awning: null | "out" | "in", lv } */
  _wxScSvg(o = {}) {
    const sky0 = this._hsSky(), u = "wx" + (this.constructor._gxN = ((this.constructor._gxN || 0) + 1) % 1e6) + "_", q = (n) => u + n;
    const sky = { ...sky0, rain: sky0.rain || o.rain || o.thunder || o.hail, cloud: sky0.cloud || o.storm || o.thunder || o.hail || o.rain, snow: sky0.snow || (o.frost && /snow/.test(sky0.w)) };
    if (o.heat && sky.tod === "day") sky.cloud = false;
    const night = sky.tod === "night", dark = o.thunder || o.hail || (o.storm && o.lv >= 3), wh = o.frost || o.ice || sky.snow;
    const SK = this._hsSkyCols(sky.tod), HC = this._hsHouseCols(night || dark), X = this._hsx();
    const s0 = dark ? (night ? "#0b1020" : "#2b3446") : o.heat && !night ? "#f59e0b" : sky.cloud && !night && !X.S.c ? "#8fa3bb" : SK[0];
    const s1 = dark ? (night ? "#1e2638" : "#5b6578") : o.heat && !night ? "#fde68a" : sky.cloud && !night && !X.S.c ? "#d5dee9" : SK[1];
    const lg = (id, s, x2 = 0, y2 = 1) => `<linearGradient id="${q(id)}" x1="0" y1="0" x2="${x2}" y2="${y2}">${s.map(([f, c, a]) => `<stop offset="${f}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ""}/>`).join("")}</linearGradient>`;
    const g0 = wh ? (night ? "#c7d0dc" : "#f8fafc") : o.heat ? "#a3b35a" : night || dark ? "#1f4a2d" : "#5fd27e", g1 = wh ? (night ? "#94a3b8" : "#dbe5ef") : o.heat ? "#7c8a3c" : night || dark ? "#13301d" : "#2f9e57";
    let d = `<defs>${lg("sk", [[0, s0], [1, s1]])}${lg("rf", [[0, HC.roof[0]], [1, HC.roof[1]]])}${lg("wl", [[0, HC.wall[0]], [1, HC.wall[1]]], 1, 0)}${lg("gr", [[0, g0], [1, g1]])}
      ${lg("gl", night || dark ? [[0, "#fde68a"], [1, "#f59e0b"]] : [[0, "#e0f2fe"], [1, "#7dd3fc"]], .6, 1)}
      <radialGradient id="${q("sun")}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff7c2"/><stop offset=".55" stop-color="#fde68a"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></radialGradient>
      <pattern id="${q("tl")}" width="10" height="6" patternUnits="userSpaceOnUse"><path d="M0 5.5 h10 M5 0 v5.5" stroke="#000" stroke-width=".7" opacity=".22"/></pattern></defs>`;
    /* Himmel wie in Modul 1 und 3; bei Unwetter dunkler, bei Hitze große Sonne */
    d += dark ? `<rect width="360" height="200" fill="url(#${q("sk")})"/>` : this._hsSkyDraw({ ...sky, rain: false, snow: false }, q);
    const cloud = (x, y, sc, c, op = .95) => `<g transform="translate(${x} ${y}) scale(${sc})" opacity="${op}"><ellipse cx="18" cy="14" rx="18" ry="9" fill="${c}"/><ellipse cx="34" cy="9" rx="14" ry="10" fill="${c}"/><ellipse cx="50" cy="15" rx="13" ry="8" fill="${c}"/><rect x="6" y="14" width="52" height="9" rx="4.5" fill="${c}"/></g>`;
    if (dark) d += `<g class="hscl">${cloud(-6, 8, 1.3, "#3b4557")}${cloud(120, -2, 1.5, "#2f3747")}${cloud(250, 10, 1.3, "#3b4557")}${cloud(60, 26, 1, "#4b5568", .9)}</g>`;
    if (o.heat && !night) d += `<circle cx="314" cy="34" r="46" fill="url(#${q("sun")})"/><circle cx="314" cy="34" r="17" fill="#fde047"/>`;
    if (o.thunder) d += `<g class="wxlt"><path d="M172 40 l-14 34 h12 l-9 30 l26 -40 h-13 l10 -24z" fill="#fde047" stroke="#a16207" stroke-width=".6"/><rect width="360" height="200" fill="#fde047" opacity=".06"/></g>`;
    /* Boden */
    d += `<rect x="-2" y="150" width="364" height="52" fill="url(#${q("gr")})"/><path d="M-2 150 h364" stroke="#000" opacity=".08"/>`;
    if (o.ice) d += `<path d="M-2 152 h364" stroke="#bae6fd" stroke-width="3" opacity=".8"/><g opacity=".7">${[30, 80, 120, 330].map((x) => `<ellipse cx="${x}" cy="168" rx="16" ry="3" fill="#e0f2fe"/>`).join("")}</g>`;
    /* Baum: neigt sich bei Sturm */
    const lean = o.storm ? (o.lv >= 3 ? -18 : -10) : o.thunder ? -6 : 0, crown = wh ? (night ? "#9fb0c2" : "#eef3f8") : o.heat ? "#9a8a3a" : night || dark ? "#1f4d30" : "#2fa35c";
    d += `<g class="${o.storm ? "wxtree" : ""}" style="transform-origin:148px 152px;transform:rotate(${lean}deg)"><rect x="146" y="114" width="5" height="38" rx="2" fill="${night || dark ? "#3b2a1c" : "#7c4a24"}"/>${[[148, 100, 17], [138, 112, 12], [159, 110, 12], [148, 88, 11]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${crown}"/>`).join("")}</g>`;
    d += [[176, 149, 8], [334, 150, 6]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .65}" fill="${wh ? "#eef3f8" : night || dark ? "#1d4a2c" : "#22a35a"}"/>`).join("");
    /* Haus */
    const L = 196, R = 304, T = 98, B = 150, P = 250, PT = 50, lit = night || dark;
    d += `<rect x="${L}" y="${T}" width="${R - L}" height="${B - T}" fill="url(#${q("wl")})"/><rect x="276" y="56" width="11" height="26" fill="#8b2b22"/><rect x="274" y="53" width="15" height="4" rx="1" fill="#57534e"/>`;
    d += `<path d="M${L - 14} ${T + 1} L${P} ${PT} L${R + 14} ${T + 1}Z" fill="url(#${q("rf")})"/><path d="M${L - 14} ${T + 1} L${P} ${PT} L${R + 14} ${T + 1}Z" fill="url(#${q("tl")})"/><path d="M${P} ${PT} L${R + 14} ${T + 1} L${P} ${T + 1}Z" fill="#000" opacity=".16"/>`;
    d += `<path d="M${L - 16} ${T + 2} L${P} ${PT - 2} L${R + 16} ${T + 2}" fill="none" stroke="#3f1510" stroke-width="3" stroke-linejoin="round"/>`;
    if (wh) d += `<path d="M${L - 12} ${T - 1} L${P} ${PT + 1} L${R + 12} ${T - 1} L${R} ${T - 4} L${P} ${PT + 6} L${L} ${T - 4}Z" fill="#f8fafc"/>`;
    if (o.ice) d += [0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${L - 8 + i * 20} ${T + 3} l2 ${6 + (i % 3) * 3} l2 ${-(6 + (i % 3) * 3)}z" fill="#e0f2fe" opacity=".9"/>`).join("");
    if (this._pvNow() != null) {
      const pan = (x, y) => `<rect x="${x}" y="${y}" width="13" height="8.6" rx=".8" fill="#1e3a8a" stroke="${night ? "#64748b" : "#e2e8f0"}" stroke-width=".8"/><path d="M${x + 6.5} ${y} v8.6 M${x} ${y + 4.3} h13" stroke="#93c5fd" stroke-width=".4" opacity=".7"/>` + (wh ? `<rect x="${x - .4}" y="${y - .8}" width="13.8" height="2.6" rx="1.2" fill="#f8fafc"/>` : "");
      d += [[205, 86.4], [219.5, 86.4], [234, 86.4], [219.5, 76.6], [234, 76.6]].map(([x, y]) => pan(x, y)).join("");
    }
    const win = (x, y, w2 = 18, h2 = 14) => `<rect x="${x - 1.5}" y="${y - 1.5}" width="${w2 + 3}" height="${h2 + 3}" rx="1.5" fill="#f8fafc"/><rect x="${x}" y="${y}" width="${w2}" height="${h2}" fill="url(#${q("gl")})"/>` +
      (o.shut ? `<rect x="${x}" y="${y}" width="${w2}" height="${h2}" fill="#64748b"/>${Array.from({ length: Math.floor(h2 / 3) }, (_, i) => `<path d="M${x} ${y + 2 + i * 3} h${w2}" stroke="#475569" stroke-width=".8"/>`).join("")}` : `<path d="M${x + w2 / 2} ${y} v${h2} M${x} ${y + h2 / 2} h${w2}" stroke="#f8fafc" stroke-width="1"/>`);
    d += win(206, 106) + win(276, 106) + win(206, 128) + win(271.5, 129.5, 21, 13);
    d += `<rect x="241" y="122" width="18" height="28" rx="1.5" fill="${lit ? "#5b3a1f" : "#7c4a24"}"/><circle cx="255" cy="137" r="1.3" fill="#fde68a"/><rect x="${L - 4}" y="${B - 2}" width="${R - L + 8}" height="5" fill="#9ca3af"/>`;
    /* Markise rechts am Haus: ausgefahren oder eingefahren */
    if (o.awning === "out") d += `<path d="M${R} 120 l30 9 v4 h-30z" fill="#e85d4a"/><path d="M${R} 124 l30 9" stroke="#fff" stroke-width="1.6" opacity=".8"/><path d="M${R + 30} 133 v16" stroke="#64748b" stroke-width="1.2"/>`;
    else if (o.awning === "in") d += `<rect x="${R}" y="117" width="9" height="6" rx="1.5" fill="#e85d4a" stroke="#7f1d1d" stroke-width=".5"/>`;
    /* Wetter vorne: Wind, Regen, Hagel, Schnee, Hitze */
    if (o.storm) d += `<g class="wxwd" opacity=".75">${[[8, 60], [40, 92], [70, 128], [190, 40], [300, 76], [250, 168]].map(([x, y], i) => `<path d="M${x} ${y} q${18 + i * 2} -7 ${38 + i * 3} 0 t${38 + i * 3} 0" fill="none" stroke="#e2e8f0" stroke-width="1.4" stroke-linecap="round"/>`).join("")}</g>`;
    if (sky.rain && !o.hail) d += `<g class="hsrn">${Array.from({ length: o.lv >= 2 ? 44 : 28 }, (_, i) => `<path d="M${(i * 37) % 360} ${(i * 23) % 150} l${o.storm ? -7 : -3} 9" stroke="#93c5fd" stroke-width="1.5" stroke-linecap="round" opacity=".75"/>`).join("")}</g>`;
    if (o.hail) d += `<g class="hssn">${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 41) % 360}" cy="${(i * 29) % 160}" r="${i % 3 ? 1.8 : 2.6}" fill="#f1f5f9" stroke="#94a3b8" stroke-width=".5"/>`).join("")}</g>`;
    if (sky.snow && !o.hail) d += `<g class="hssn">${Array.from({ length: 34 }, (_, i) => `<circle cx="${(i * 41) % 360}" cy="${(i * 29) % 150}" r="${i % 3 ? 1.5 : 2.2}" fill="#fff" opacity=".9"/>`).join("")}</g>`;
    if (o.heat) d += `<g class="wxhz" opacity=".6">${[60, 80, 330].map((x) => `<path d="M${x} 168 q4 -6 0 -12 q-4 -6 0 -12" fill="none" stroke="#fff" stroke-width="1.4"/>`).join("")}</g>`;
    return `<svg viewBox="0 18 360 174" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Wetter-Szene" class="wxsc">${d}</svg>`;
  }
  /* Was die Szene zeigt, aus Warnungen und Aktionen */
  _wxScState(S, W, lv) {
    const C = S.cfg, st = this._hass.states, R = (S.state && S.state.acts) || {}, run = Object.fromEntries(Object.entries(R).filter(([, v]) => v && v.state === "run")), a = (k) => !!(W[k] && W[k].a);
    const O = (S.state && S.state.officials) || [], cur = O.filter((x) => !x.vorab && !x.kommt), has = (art) => cur.some((x) => x.art === art);
    const covers = (C.acts || []).filter((x) => String(x.ent).startsWith("cover."));
    const aw = covers.find((x) => /markise|awning/i.test(x.ent + " " + this._wzName(x.ent))) || null;
    const awSt = aw && st[aw.ent] ? st[aw.ent].state : "";
    const awning = !aw ? null : run[aw.id] && aw.do === "close" ? "in" : ["closed", "closing"].includes(awSt) ? "in" : "out";
    const shut = covers.some((x) => x !== aw && run[x.id] && x.do === "close") || covers.some((x) => x !== aw && st[x.ent] && st[x.ent].state === "closed");
    const fw = W.frost || {};
    return { storm: a("storm") || has("storm"), thunder: a("thunder") || has("thunder"), hail: a("hail") || has("hail"), rain: a("rain") || has("rain"),
      frost: (a("frost") && fw.kind !== "ice") || has("frost"), ice: a("frost") && fw.kind === "ice", heat: a("heat") || has("heat"), shut, awning, lv };
  }
  /* D1 · Banner */
  _wxBanner(x) {
    const { S, W, head, sub, lv, tone } = x, col = this._wxLvCol(lv), sc = this._wxScState(S, W, lv), C = S.cfg, run = Object.fromEntries(Object.entries((S.state && S.state.acts) || {}).filter(([, v]) => v && v.state === "run"));
    const done = (C.acts || []).filter((a) => run[a.id]).map((a) => `${this._wzName(a.ent)} ${({ close: "zu", open: "offen", on: "an", off: "aus", run: "ausgeführt" })[a.do] || ""}`.trim());
    const open = (S.open || []).length && (lv > 0 || tone === "soon") ? [`${S.open.length} ${S.open.length === 1 ? "Fenster" : "Fenster"} offen`] : [];
    const chips = [...done.slice(0, 2), ...(done.length > 2 ? [`+${done.length - 2} Aktionen`] : []), ...open];
    const pill = `<span class="wxlvp" style="--wc:${col}">${lv ? `Stufe ${lv} · ${this._wxLvName(lv)}` : tone === "soon" ? "Vorwarnung" : "Ruhig"}</span>`;
    const anim = this._rkCfg ? this._rkCfg().anim : "dezent", mv = MV.wx;
    return `<div class="card wxbn ${lv ? "on" : tone}" style="--wc:${tone === "soon" && !lv ? "#facc15" : col}">
      <div class="wxbt"><div class="wxbl">${ic("shield", 15)}Wetter &amp; Warnungen</div><div class="wxbb">${esc(head)}</div><div class="wxbs">${esc(sub)}</div><div class="wxbc">${pill}${chips.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div></div>
      <div class="wxbi" data-an="${anim}">${this._wxScSvg(sc)}${mv ? `<span class="mlv">v${esc(mv.v)} · Build ${mv.b}</span>` : ""}</div></div>`;
  }
  /* D3 · Warnkacheln 2.0 */
  _wxArc(frac, mark, col) {
    const R = 26, cx = 32, cy = 32, pt = (f) => { const a = Math.PI * (1 - Math.max(0, Math.min(1, f))); return [cx + R * Math.cos(a), cy - R * Math.sin(a)]; };
    const [x0, y0] = pt(0), [x1, y1] = pt(1), [xf, yf] = pt(Math.max(.02, frac)), [xm, ym] = pt(mark);
    return `<svg class="wxarc" viewBox="0 0 64 38" aria-hidden="true"><path d="M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}" class="ab"/><path d="M${x0} ${y0} A${R} ${R} 0 0 1 ${xf.toFixed(1)} ${yf.toFixed(1)}" stroke="${col}" class="af"/><circle cx="${xm.toFixed(1)}" cy="${ym.toFixed(1)}" r="3" class="am"/></svg>`;
  }
  _wxTiles(x) {
    const { S, W, C, NM, ICO, d, hm, live } = x, now = (live && S.state.now) || {};
    const tile = (k) => {
      const c = C.warn[k] || {}, w = W[k] || {}, on = !!c.on, a = on && w.a, lv = a ? Math.max(1, w.lv || 1) : 0, ah = on && !a && w.ahead;
      let val = "", unit = "", frac = null, mark = 0, line = "";
      if (k === "storm") { const v = w.v != null ? w.v : d.mx > 0 ? d.mx : null; if (v != null) { val = num(v, 0); unit = "km/h"; const m = (c.kmh3 || 90) * 1.15; frac = v / m; mark = c.kmh / m; } line = `Stufe 1 ab ${c.kmh} · Stufe 3 ab ${c.kmh3}`; }
      else if (k === "rain") { const v = w.v; if (v != null && isFinite(v)) { val = num(v, 1); unit = "mm/h"; const m = (c.mm3 || 25) * 1.15; frac = v / m; mark = (c.mm || 10) / m; } line = `ab ${c.mm} mm/h${now.rain_src === "forecast" ? " · Vorhersage" : ""}`; }
      else if (k === "frost") { const v = w.v != null ? w.v : d.o.t; if (v != null) { val = num(v, 1); unit = "°C"; frac = (c.temp + 10 - v) / 15; mark = 10 / 15; } line = `Frost ab ${c.temp} °C${c.ice ? ` · Glätte bis ${c.ice_temp} °C` : ""}`; }
      else if (k === "heat") { const v = w.v != null ? w.v : d.o.t; if (v != null) { val = num(v, 1); unit = "°C"; frac = (v - (c.temp - 15)) / 20; mark = 15 / 20; } line = `ab ${c.temp} °C`; }
      else { val = a ? "aktiv" : ah ? "ab " + hm(w.ahead) : "–"; line = k === "hail" ? "Wenn Hagel gemeldet wird" : "Wenn Gewitter gemeldet wird"; }
      const tone = !on ? "off" : a ? "hot" : ah ? "soon" : "ok", col = !on ? "#64748b" : a ? this._wxLvCol(lv) : ah ? "#fb923c" : "#2dd4bf";
      const status = !on ? "" : a ? `Stufe ${lv} · seit ${w.since ? hm(w.since) : "jetzt"}` : ah ? (val && !/^ab /.test(val) ? `ab ${hm(w.ahead)}` : "Erwartet") + (w.ahead_lv ? ` · Stufe ${w.ahead_lv}` : "") : "Ruhig";
      const name = a && k === "frost" && w.kind === "ice" ? "Glätte" : NM[k];
      return `<div class="wxtl ${tone}" style="--tc:${col}"><div class="wxth"><span class="wxti">${ic(ICO[k], 20)}</span>${on && frac != null ? this._wxArc(frac, mark, col) : ""}<i class="wxdot" aria-hidden="true"></i></div>
        <div class="wxtn">${esc(name)}</div><div class="wxtv">${on ? esc(val || "–") : "Aus"}${on && unit && val ? `<small>${unit}</small>` : ""}</div>${status ? `<div class="wxts">${esc(status)}</div>` : ""}${on ? `<div class="wxtg">${esc(line)}</div>` : ""}</div>`;
    };
    return `<div class="wxtiles">${Object.keys(NM).map(tile).join("")}</div>`;
  }
  /* ================= Modul 9 · Stufe 3 (v0.8): Zeitleiste, Ablaufkarten, Quittieren und Aussetzen ================= */
  /* C1 · 48-Stunden-Zeitleiste: eine Zeile je Warnart, Bänder in Stufenfarbe, amtliche oben, „Jetzt“-Linie, Morgen hinterlegt */
  _wxTimeline(S, NM, hm) {
    const T = S.tl || {}, ts = T.t || [];
    if (ts.length < 2) return `<div class="wxnote">${ic("info", 15)}Keine Stundenvorhersage von der Wetter-Entität. Die Zeitleiste braucht sie.</div>`;
    const t0 = new Date(ts[0]).getTime() - 30 * 60e3, span = ts.length * 3600e3, P = (t) => Math.max(0, Math.min(100, ((t - t0) / span) * 100));
    const band = (a, b, lv, title, cls = "") => { const l = P(a), r = P(b); return r - l < .4 ? "" : `<i class="wxbd ${cls}" style="left:${l.toFixed(2)}%;width:${(r - l).toFixed(2)}%;--bc:${this._wxLvCol(lv)}" title="${esc(title)}"></i>`; };
    const rows = [];
    const off = (T.off || []).filter((x) => x.von || x.bis);
    if (off.length) rows.push(["Amtlich", "shield", off.map((x) => band(x.von ? new Date(x.von).getTime() : t0, x.bis ? new Date(x.bis).getTime() : t0 + span, x.stufe, `${x.titel} · Stufe ${x.stufe} · ${x.quelle}${x.vorab ? " · Vorab" : ""}`, x.vorab ? "vorab" : "")).join("") + (off.length === 1 || off.every((x) => x.titel === off[0].titel) ? `<em class="wxbt2" style="left:${P(off[0].von ? new Date(off[0].von).getTime() : t0).toFixed(1)}%">${esc(off[0].titel)}</em>` : "")]);
    const ICO = { storm: "fan", thunder: "bolt", hail: "snow", frost: "thermo", heat: "sun", rain: "drop" };
    Object.keys(NM).forEach((k) => {
      const L = (T.own || {})[k]; if (!L) return; let out = "", i = 0;
      while (i < L.length) { if (!L[i]) { i++; continue; } let j = i; while (j + 1 < L.length && L[j + 1] === L[i]) j++; const a = new Date(ts[i]).getTime() - 30 * 60e3, b = new Date(ts[j]).getTime() + 30 * 60e3; out += band(a, b, L[i], `${NM[k]} · Stufe ${L[i]} · ${hm(ts[i])}–${hm(new Date(b).toISOString())} Uhr`); i = j + 1; }
      rows.push([NM[k], ICO[k], out]);
    });
    const now = P(Date.now()), mid = new Date(new Date(ts[0]).getTime()); mid.setHours(24, 0, 0, 0); const m0 = P(mid.getTime()), m1 = P(mid.getTime() + 864e5);
    const ticks = []; for (let h = 0; h < ts.length; h += 6) ticks.push(`<span style="left:${P(new Date(ts[h]).getTime()).toFixed(2)}%">${hm(ts[h]).slice(0, 2)}</span>`);
    return `<div class="wxtlw"><div class="wxtlx"><div></div><div class="wxtk">${ticks.join("")}</div></div>
      ${rows.map(([n, i, b]) => `<div class="wxtlx"><div class="wxtln">${ic(i, 14)}<span>${esc(n)}</span></div><div class="wxtlr">${m0 < 100 ? `<b class="wxtm" style="left:${m0.toFixed(2)}%;width:${(Math.min(100, m1) - m0).toFixed(2)}%"></b>` : ""}${b}<u class="wxnow2" style="left:${now.toFixed(2)}%"></u></div></div>`).join("")}
      <div class="wxtlx"><div></div><div class="wxtlf"><span style="left:${now.toFixed(2)}%">Jetzt</span>${m0 < 96 ? `<span style="left:${m0.toFixed(2)}%" class="mo">Morgen</span>` : ""}</div></div></div>
      ${rows.some((r) => r[2]) ? "" : `<div class="wxnote">${ic("check", 15)}In den nächsten ${Math.round(ts.length)} Stunden ist keine Warnung zu erwarten.</div>`}`;
  }
  /* Ablaufkarte je Aktion: Auslöser → Gerät → Zustand, darunter Bedingungen */
  _wxFlow(x, st = {}, W, NM, hm) {
    const verb = ({ close: String(x.ent).startsWith("cover.") && /markise|awning/i.test(x.ent + this._wzName(x.ent)) ? "einfahren" : "schließen", open: "öffnen", on: "einschalten", off: "ausschalten", run: "ausführen" })[x.do] || x.do;
    const act = W[x.warn] && W[x.warn].a, S = st.state || "";
    const [cls, txt] = S === "run" ? ["done", `erledigt ${hm(st.at)}`] : S === "undo" ? ["done", `zurück um ${hm(st.until)}`] : S === "wait" ? ["wait", st.why || "wartet"] : S === "pause" ? ["wait", "ausgesetzt"] : S === "blocked" ? ["hot", st.why || "blockiert"] : S === "err" ? ["hot", st.why || "Fehler"] : act ? ["wait", "wartet"] : ["idle", "bereit"];
    const conds = [x.min > 1 && `ab Stufe ${x.min}`, x.when && x.when !== "always" && ({ away: "nur abwesend", home: "nur wenn jemand da ist", day: "nur tagsüber", night: "nur nachts" })[x.when], x.delay && `${x.delay} Min. Verzögerung`, x.guard && `Aussperrschutz: ${this._wzName(x.guard)}`, x.undo && x.do !== "run" && "danach zurück"].filter(Boolean);
    return `<div class="wxflow ${cls}"><div class="wxfr"><span class="wxft">${ic({ storm: "fan", thunder: "bolt", hail: "snow", frost: "thermo", heat: "sun", rain: "drop" }[x.warn], 14)}${esc(NM[x.warn])}</span><span class="wxfa">→</span><span class="wxfs">${ic(String(x.ent).startsWith("cover.") ? "blinds" : "bolt", 16)}<b>${esc(this._wzName(x.ent))}</b> ${verb}</span><span class="wxfst ${cls}">${esc(txt)}</span></div>${conds.length ? `<div class="wxfc">${conds.map((c) => `<span>${esc(c)}</span>`).join("")}</div>` : ""}</div>`;
  }
  /* Bedienleiste unter dem Banner: Verstanden, Alles schließen, Aussetzen */
  _wxBar(S, hm) {
    const st = S.state || {}, C = S.cfg, adm = this._admin(), covers = (C.acts || []).some((x) => String(x.ent).startsWith("cover.") && x.do === "close");
    if (!st.any && !st.pause) return "";
    const b = [];
    if (st.any) b.push(st.acked ? `<span class="wxok">${ic("check", 16)}Quittiert</span>` : `<button class="pillbtn pri" data-act="wxsack">${ic("check", 16)}Verstanden</button>`);
    if (adm && st.any && covers) b.push(`<button class="pillbtn" data-act="wxsclose">${ic("blinds", 16)}Alles schließen</button>`);
    if (adm && (C.acts || []).length) b.push(st.pause ? `<button class="pillbtn" data-act="wxspause" data-k="0">${ic("play", 16)}Aussetzen beenden <small>bis ${hm(st.pause)}</small></button>` : st.any ? `<button class="pillbtn" data-act="wxspause" data-k="120">${ic("pause", 16)}Aktionen 2 Std. aussetzen</button>` : "");
    return `<div class="wxbar">${b.filter(Boolean).join("")}</div>`;
  }
  /* ================= Modul 9 · Stufe 4 (v0.9): Vorsorge, Verlauf, Tablet-Alarm ================= */
  _wxVor(S, hm) {
    const L = S.vor || [], adm = this._admin();
    if (!L.length) return "";
    const ico = { battery: "energy", car: "car", sun: "sun", window: "window", snow: "snow" };
    return `<div class="card wxvor"><h2>${ic("shield", 18)}Vorsorge <small class="mut">was du jetzt tun kannst</small></h2><div class="wxvl">${L.map((x) => `<div class="wxvi ${x.done ? "done" : ""}"><span class="wxvic">${ic(ico[x.icon] || "info", 20)}</span><div class="wxvm"><b>${esc(x.title)}</b><small>${esc(x.text)}</small></div>
      ${x.done ? `<span class="wxfst done">${ic("check", 14)} erledigt ${hm(x.done)}</span>` : x.btn && adm ? `<button class="pillbtn pri" data-act="wxsvor" data-k="${esc(x.id)}">${esc(x.btn)}</button>` : x.auto ? `<span class="wxfst wait">automatisch</span>` : ""}</div>`).join("")}</div></div>`;
  }
  /* B7 · Verlauf mit Filter (90 Tage) */
  _wxLog(S, hm) {
    const F = { all: ["Alle", null], warn: ["Warnungen", ["warn", "off", "ahead", "src"]], act: ["Aktionen", ["act", "ack"]], msg: ["Fenster & Meldungen", ["win", "msg"]] };
    const f = F[this._wxLogF] ? this._wxLogF : "all", n = this._wxLogN || 12, all = (S.log || []).filter((x) => !F[f][1] || F[f][1].includes(x.k || "")), lg = all.slice(0, n);
    const dd = (iso) => { const t = new Date(iso), td = new Date(), y = new Date(td.getTime() - 864e5); return t.toDateString() === td.toDateString() ? hm(iso) : t.toDateString() === y.toDateString() ? "gestern " + hm(iso) : t.toLocaleDateString("de-DE", { day: "numeric", month: "numeric" }) + " " + hm(iso); };
    const K = { warn: "alert", off: "shield", ahead: "clock", src: "info", act: "blinds", ack: "check", win: "window", msg: "bell" };
    return `<div class="card"><h2>${ic("clock", 18)}Verlauf <small class="mut">90 Tage</small></h2><div class="gschips wxlf">${Object.entries(F).map(([k, [t]]) => `<button class="gsch ${f === k ? "sel" : ""}" data-act="wxslog" data-k="${k}">${t}</button>`).join("")}</div>
      ${lg.length ? `<div class="wxlog">${lg.map((x) => `<div><time>${dd(x.t)}</time><span>${x.k && K[x.k] ? ic(K[x.k], 14) : ""}${esc(x.x)}</span></div>`).join("")}</div>` : `<div class="wxnote">${ic("info", 15)}Noch keine Einträge.</div>`}
      ${all.length > n ? `<button class="lnk" data-act="wxslogmore">${ic("chev", 14)}Mehr anzeigen (${all.length - n} weitere)</button>` : ""}</div>`;
  }
  /* C9 · Tablet-Alarm: ab der eingestellten Stufe weckt die Warnung das Wandtablet und zeigt eine Vollbild-Karte */
  _wxAlarmKey() {
    const S = this._wxs(), st = S.state || {}, lim = S.cfg.tab_lv == null ? 3 : S.cfg.tab_lv, lv = S.level || 0;
    return !this._wxsD || S.error || !lim || lv < lim || st.acked ? "" : `${lv}|${(S.warnings || []).filter((x) => !x.vorab).map((x) => x.titel).join(",")}`;
  }
  _wxAlarmModal() {
    const S = this._wxs(), C = S.cfg, W = (S.state && S.state.warn) || {}, lv = S.level || 0, col = this._wxLvCol(lv), cur = (S.warnings || []).filter((x) => !x.vorab && !x.kommt);
    const top = cur.sort((a, b) => b.stufe - a.stufe)[0] || { titel: "Unwetter", quelle: "", bis: "" }, hm = (iso) => { const t = new Date(iso); return String(t.getHours()).padStart(2, "0") + ":" + String(t.getMinutes()).padStart(2, "0"); };
    const run = (S.state && S.state.acts) || {}, done = (C.acts || []).filter((a) => run[a.id] && run[a.id].state === "run").map((a) => [`${this._wzName(a.ent)} ${({ close: "geschlossen", open: "geöffnet", on: "an", off: "aus", run: "ausgeführt" })[a.do] || ""}`, true]);
    const bad = (C.acts || []).filter((a) => run[a.id] && ["blocked", "err"].includes(run[a.id].state)).map((a) => [`${this._wzName(a.ent)}: ${run[a.id].why || "nicht gefahren"}`, false]), open = (S.open || []).map((n) => [`Fenster ${n} offen`, false]);
    const covers = (C.acts || []).some((x) => String(x.ent).startsWith("cover.") && x.do === "close");
    return `<div class="ov wxalov"></div><div class="wxal" role="alertdialog" aria-modal="true" style="--wc:${col}"><div class="wxalsc">${this._wxScSvg(this._wxScState(S, W, lv)).replace('viewBox="0 18 360 174"', 'viewBox="132 26 196 172"')}</div>
      <div class="wxalt"><span class="wxlvp big" style="--wc:${col}">${esc(this._wxLvName(lv).toUpperCase())} · STUFE ${lv}</span><b>${esc(top.titel)}</b><small>${top.bis ? "bis " + hm(top.bis) + " Uhr · " : ""}${esc(top.quelle === "eigen" ? "eigene Messung" : top.quelle)}</small>
      ${cur.length > 1 ? `<div class="wxalm">${cur.slice(1, 4).map((x) => `<span>${esc(x.titel)} · Stufe ${x.stufe}</span>`).join("")}</div>` : ""}
      <div class="wxalc">${[...done, ...bad, ...open].slice(0, 6).map(([t, ok]) => `<div class="${ok ? "ok" : "no"}">${ic(ok ? "check" : "alert", 18)}${esc(t)}</div>`).join("")}</div>
      <div class="wxalb"><button class="btn2" data-act="wxsack">${ic("check", 18)} Verstanden</button>${covers && this._admin() ? `<button class="btn2 pri" data-act="wxsclose">${ic("blinds", 18)} Alles schließen</button>` : ""}</div></div></div>`;
  }
  _wxAlarmTick() {
    if (!this._hass || !this._mdState().on.wx) return;
    if (!this._wxsBusy && (!this._wxsD || Date.now() - this._wxsD.ts > 30000)) this._wxsLoad(true);
    const k = this._wxAlarmKey(), isOpen = this._modal && this._modal.type === "wxalarm";
    if (k && k !== this._wxAlKey && !this._modal) { this._wxAlKey = k; if (this._tmSleep) this._tmWake(); this._modal = { type: "wxalarm" }; this._renderModal(); return; }
    if (!k && isOpen) { this._modal = null; this._renderModal(); }
    if (!k) this._wxAlKey = "";
  }
  /* Einstellungen: Vorsorge (Reiter Aktionen) und Tablet (Reiter Meldungen) */
  _wxsVorSet(C, step, sw) {
    const v = C.vor || {}, st = this._hass.states, chip = (act, k, t, on) => `<button class="gsch ${on ? "sel" : ""}" data-act="${act}" data-k="${k}" aria-pressed="${!!on}">${t}</button>`;
    const akkuOpts = Object.keys(st).filter((e) => /^(script|switch|input_boolean|button|input_button|scene)\./.test(e));
    const covers = Object.keys(st).filter((e) => e.startsWith("cover.")).sort();
    return `<div class="lsec" style="margin-top:14px">${ic("shield", 15)}Vorsorge bei Unwetter, Hitze und Frost</div>
      <div class="vrow"><span>Vorsorge-Vorschläge<small class="mut" style="display:block">Zeigt im Modul, was du vor einer Warnung tun kannst, mit Knopf. Blickt so viele Stunden voraus.</small></span>${v.on !== false ? step("wxsvorh", "", "", v.hours || 12, "Std.", 3) : ""}${sw("wxsvoron", "", v.on !== false, "Vorsorge")}</div>
      ${v.on !== false ? `<div class="wxsub">
        <div class="vrow"><span>Hausakku voll halten<small class="mut" style="display:block">Ab Unwetter Stufe 3, solange der Akku unter 95 % ist (Ladestand aus Haus › Energiequellen). Optional ein Skript oder Schalter, der Netzladen startet.</small></span>${sw("wxsvorx", "akku", v.akku !== false, "Akku")}</div>
        ${v.akku !== false ? `${this._wzSel(akkuOpts, v.akku_ent || "", "wxsvorakku", "", "– nur Hinweis, nichts schalten –", /netz|lade|akku|batter|zendure|charge/i)}${v.akku_ent ? `<div class="vrow"><span>Automatisch ausführen<small class="mut" style="display:block">Ohne Knopfdruck, einmal je Unwetter.</small></span>${sw("wxsvorx", "akku_auto", !!v.akku_auto, "Automatisch")}</div>` : ""}` : ""}
        <div class="vrow"><span>Auto vorladen<small class="mut" style="display:block">Ab Unwetter Stufe 3, wenn das Auto (Modul 8) unter diesem Ladestand ist. „Jetzt laden“ startet den Schnellstart bis zum Ziel.</small></span>${v.car !== false ? step("wxsvorcar", "", "", v.car_min || 50, "%", 5) : ""}${sw("wxsvorx", "car", v.car !== false, "Auto")}</div>
        ${v.car !== false ? `<div class="vrow"><span>Automatisch laden<small class="mut" style="display:block">Nur wenn das Auto angesteckt ist.</small></span>${sw("wxsvorx", "car_auto", !!v.car_auto, "Automatisch")}</div>` : ""}
        <div class="vrow"><span>Hitzeschutz<small class="mut" style="display:block">Bei Hitze tagsüber Rollläden schließen, abends lüften, sobald es draußen kühler als 24 °C ist.</small></span>${sw("wxsvorx", "heat", v.heat !== false, "Hitzeschutz")}</div>
        ${v.heat !== false ? `<div class="mut sm" style="margin:2px 0 4px">Rollläden auf der Sonnenseite</div><div class="gschips">${covers.length ? covers.map((c) => chip("wxsvorcov", esc(c), esc(this._wzName(c)), (v.heat_covers || []).includes(c))).join("") : `<span class="mut sm">Keine Rollläden gefunden.</span>`}</div>${(v.heat_covers || []).length ? `<div class="vrow"><span>Tagsüber automatisch schließen</span>${sw("wxsvorx", "heat_auto", !!v.heat_auto, "Automatisch")}</div>` : ""}` : ""}
        <div class="vrow"><span>Frost-Hinweis<small class="mut" style="display:block">Außenwasserhahn, Gartenleitungen, Pflanzen und Autoscheibe.</small></span>${sw("wxsvorx", "frost", v.frost !== false, "Frost")}</div></div>` : ""}`;
  }
  _wxsTabSet(C, chip) {
    const lv = C.tab_lv == null ? 3 : C.tab_lv;
    return `<div class="lsec" style="margin-top:14px">${ic("tablet", 15)}Wandtablet</div>
      <div class="mut sm" style="margin:0 0 6px">Im Tablet-Modus weckt eine Warnung ab dieser Stufe das Display (bei „Warnungen wecken auf“) und zeigt eine Vollbild-Karte mit „Verstanden“.</div>
      <div class="gschips">${[[0, "Aus"], [1, "ab Stufe 1"], [2, "ab Stufe 2"], [3, "ab Stufe 3"], [4, "nur Stufe 4"]].map(([k, t]) => chip("wxstablv", k, t, lv === k)).join("")}</div>`;
  }
