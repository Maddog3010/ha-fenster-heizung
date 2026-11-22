  /* ================= Szenen-Banner für die restlichen Module (Build 1: Baustein, Modul 2, Modul 15) =================
     Gleicher Aufbau wie das einheitliche Banner (Titel, große Zahl, Zusatzzeile, Chips), rechts statt des Logo-Felds ein
     Bild mit echten Werten, das zur Kartenfarbe ausläuft. Bewegung folgt Anpassen → Animationen und „Bewegung reduzieren“,
     Bilder außerhalb des Bildschirms halten an (data-an). Schalter „Banner wie bisher“: layout.sb.old. */
  _sbOn() { return !((this._cfg.layout.sb || {}).old); }
  _sbAnim() { return this._rkCfg ? this._rkCfg().anim : "dezent"; }
  /* Laufende Bewegung über den Neuaufbau retten: Phase aus der Uhrzeit statt Neustart bei jedem Zeichnen */
  _sbPh(sec) { return `animation-delay:-${((Date.now() / 1000) % sec).toFixed(2)}s`; }
  /* Ebene 2 Weihnachten: kleine Details in den Bildern, nur wenn das Weihnachts-Theme sichtbar ist */
  _sbX() { try { return !!(this._sai && this._saiD && this._sai().vis); } catch (_) { return false; } }
  _sbXc() { return this._advLightCols ? this._advLightCols() : ["#e05a6b", "#f4d58d", "#3fa37a", "#8cc8f5", "#c9a6f5"]; }
  _sbXl(pts) { const C = this._sbXc(); return pts.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="${C[i % C.length]}"/>`).join(""); }
  /* Punkte entlang zweier Dachkanten (links unten → First → rechts unten) */
  _sbXroof(x1, y1, xf, yf, x2, n) { const P = []; for (let i = 0; i <= n; i++) { const t = i / n, x = t < 0.5 ? x1 + (xf - x1) * t * 2 : xf + (x2 - xf) * (t - 0.5) * 2, y = t < 0.5 ? y1 + (yf - y1) * t * 2 : yf + (y1 - yf) * (t - 0.5) * 2; P.push([x, y + 3]); } return P; }
  _sbArt(id, inner) {
    const mv = MV[id];
    return `<div class="sbart" data-an="${this._sbAnim()}" aria-hidden="true">${inner}</div>${mv ? `<span class="sbv">v${esc(mv.v)} · Build ${mv.b}</span>` : ""}`;
  }
  /* Darstellung: gemeinsamer Schalter für alle Szenen-Banner dieses Bausteins */
  _sbLook() {
    const old = !this._sbOn();
    return `<div class="lsec">${ic("image", 15)}Banner der Module</div>
      <div class="ltog"><span>Banner wie bisher<small class="mut" style="display:block">An: Logo-Feld statt Bild bei Warmwasser, Wartung und den Modulen in Entwicklung</small></span><button class="sw ${old ? "on" : ""}" data-act="sbxold" aria-pressed="${old}" aria-label="Banner wie bisher"></button></div>`;
  }
  _sbAct(a) {
    if (a === "sbxold") { this._cfg.layout.sb = { ...(this._cfg.layout.sb || {}), old: this._sbOn() }; this._saveLayout(); this._render(); this._renderModal(); }
  }

  /* ---------- Modul 2: Speicher im Schnitt ---------- */
  _sbWw(t, o) {
    const top = t.top, mid = t.mid, bot = t.bot, want = o.want || 55;
    const lo = bot != null ? bot : mid != null ? mid - 8 : top != null ? top - 20 : null;
    const fill = top == null ? 0.5 : Math.max(0.12, Math.min(1, (top - 20) / Math.max(10, want - 20)));
    const y0 = 22, h = 156, fh = Math.round((h - 8) * fill);
    const c1 = wwCol(top), c2 = wwCol(mid != null ? mid : top != null && lo != null ? (top + lo) / 2 : null), c3 = wwCol(lo);
    const pump = o.pump, heat = o.heat, pv = o.pv, mv = this._sbAnim() !== "aus";
    const drops = pump ? [0, 1, 2, 3].map((i) => `<line class="sbdrop" x1="${64 + i * 6}" y1="58" x2="${62 + i * 6}" y2="72" style="${this._sbPh(1.2)};animation-delay:-${(i * 0.3 + (Date.now() / 1000) % 1.2).toFixed(2)}s"/>`).join("") : "";
    return `<svg viewBox="0 0 320 200" preserveAspectRatio="xMaxYMid meet">
      <defs><linearGradient id="sbwwg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset=".55" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></linearGradient>
      <clipPath id="sbwwc"><rect x="174" y="${y0 + 4}" width="72" height="${h - 8}" rx="32"/></clipPath></defs>
      <path class="sbloop${pump && mv ? " run" : ""}" d="M172 ${y0 + 34} H96 V${y0 + h - 30} H172" style="${this._sbPh(1.6)}" opacity="${pump ? 1 : 0.3}"/>
      <g transform="translate(46 34)" opacity="${pump ? 1 : 0.55}"><path d="M0 0 h26 v8" stroke="#cfe6ff" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="30" cy="12" rx="12" ry="4" fill="#cfe6ff"/></g>${drops}
      <rect x="170" y="${y0}" width="80" height="${h}" rx="36" fill="#0b2232" stroke="rgba(207,230,255,.45)" stroke-width="3"/>
      <rect clip-path="url(#sbwwc)" x="170" y="${y0 + h - 4 - fh}" width="80" height="${fh}" fill="url(#sbwwg)"/>
      ${[0, 1, 2, 3, 4].map((i) => `<line x1="252" y1="${y0 + 22 + i * 28}" x2="260" y2="${y0 + 22 + i * 28}" stroke="rgba(207,230,255,.45)"/>`).join("")}
      <text x="266" y="${y0 + 26}" fill="#fff" font-size="15" font-weight="800">${top != null ? num(top, 0) + " °C" : "–"}</text>
      ${lo != null ? `<text x="266" y="${y0 + h - 12}" fill="rgba(207,230,255,.75)" font-size="12">${num(lo, 0)} °C</text>` : ""}
      ${heat ? `<g transform="translate(210 ${y0 + h + 4})" class="sbflame"><path d="M0 -14 C6 -8 8 -2 0 0 C-8 -2 -6 -8 0 -14Z" fill="#fb923c"/><path d="M0 -9 C3 -6 4 -2 0 0 C-4 -2 -3 -6 0 -9Z" fill="#fde68a"/></g>` : ""}
      <g opacity="${pv ? 1 : 0.22}"><circle cx="296" cy="${y0 + 4}" r="11" fill="#ffd36b"/><path d="M270 ${y0 + 54} l14 -18 h30 l-14 18z" fill="#2b5c9e" stroke="#9cc3ff55"/>${pv ? `<path class="sbpv${mv ? " run" : ""}" d="M290 ${y0 + 56} C292 ${y0 + 80} 270 ${y0 + 84} 252 ${y0 + 90}" style="${this._sbPh(1.4)}"/>` : ""}</g>
    ${this._sbX() ? `<g class="sbxm"><path d="M178 ${y0 + 12} Q212 ${y0 - 26} 244 ${y0 + 6} L246 ${y0 + 12} Z" fill="#e05a6b"/><rect x="172" y="${y0 + 6}" width="76" height="10" rx="5" fill="#fff"/><circle cx="244" cy="${y0 + 2}" r="5.5" fill="#fff"/></g>` : ""}</svg>`;
  }

  /* ---------- Modul 15: Kalenderblatt mit Ampel-Ringen ---------- */
  _sbWa(d) {
    const T = ((d && d.tasks) || []).filter((x) => x.st !== "off");
    const nx = T.find((x) => x.due), dd = nx ? new Date(nx.due + "T12:00:00") : new Date();
    const MON = ["JAN", "FEB", "MÄR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"];
    const per = (x) => (+x.every || 1) * ({ d: 1, w: 7, m: 30.44, y: 365.25 }[x.unit] || 30.44);
    const col = (st) => (st === "over" || st === "due" ? "#ef4444" : st === "soon" ? "#fbbf24" : st === "new" ? "#94a3b8" : "#34d399");
    const rings = T.slice(0, 4).map((x) => {
      const p = x.days == null ? 0 : Math.max(0.04, Math.min(1, 1 - x.days / per(x))), C = 2 * Math.PI * 21;
      return `<span class="sbrg" title="${esc(x.name)}"><svg viewBox="0 0 54 54"><circle cx="27" cy="27" r="21" fill="rgba(3,12,22,.45)" stroke="rgba(255,255,255,.14)" stroke-width="5"/><circle cx="27" cy="27" r="21" fill="none" stroke="${col(x.st)}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(C * p).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 27 27)"/></svg><i>${ic(x.icon || "tools", 18)}</i></span>`;
    }).join("");
    const over = nx && (nx.st === "over" || nx.st === "due");
    return `<div class="sbwa"><div class="sbcal${over ? " bad" : ""}">${this._sbX() ? `<span class="sbxstar sbxm" aria-hidden="true">★</span>` : ""}<b>${MON[dd.getMonth()]}</b><em>${dd.getDate()}</em><small>${esc(nx ? nx.name : "Noch keine Termine")}</small></div>${rings ? `<div class="sbrgs">${rings}</div>` : ""}</div>`;
  }

  /* ================= Build 2: Modul 5 Lüftung, Modul 6 Rollläden, Modul 7 Wärmepumpe ================= */
  /* Modul 5: Haus-Schnitt, jeder Raum in der Farbe seiner Luftfeuchte (Werte wie im Reiter „Jetzt“) */
  _sbLuData() {
    let R = []; try { R = this._collect(); } catch (_) { R = []; }
    const A = R.map((r) => ({ r, a: this._airData(r) })).filter((x) => x.a);
    const col = (v) => (v >= 70 ? "#ef4444" : v >= 60 ? "#f59e0b" : "#22a06b");
    const dev = "§dev|In Entwicklung";
    if (!A.length) return { big: "–", small: false, sub: R.length ? "Noch keine Luftfeuchte-Sensoren in den Räumen" : "Noch keine Räume eingerichtet", chips: [dev], scene: this._sbLuScene([], false) };
    const worst = [...A].sort((x, y) => y.a.rh - x.a.rh)[0], avg = A.reduce((s, x) => s + x.a.rh, 0) / A.length, wet = A.filter((x) => x.a.rh >= 70), open = A.reduce((s, x) => s + x.a.open, 0);
    const tdMax = Math.max(...A.map((x) => x.a.td));
    const show = [...A].sort((x, y) => y.a.rh - x.a.rh).slice(0, 4).map((x) => ({ n: x.r.name, v: Math.round(x.a.rh), c: col(x.a.rh) }));
    const bad = worst.a.rh >= 60;
    return {
      big: bad ? `${worst.r.name} ${num(Math.round(worst.a.rh))}` : "Luft gut", unit: bad ? "%" : "", small: !bad || worst.r.name.length > 10,
      sub: bad ? `${worst.a.rh >= 70 ? "Lüften – Schimmelrisiko " + MOLD[worst.a.lvl][0] : "Etwas feucht"} · Taupunkt ${num(worst.a.td, 1)} °C` : `${A.length} ${A.length === 1 ? "Raum" : "Räume"} · Ø ${num(Math.round(avg))} % Luftfeuchte · Schimmelrisiko gering`,
      chips: [wet.length ? `§bad|${wet.length} ${wet.length === 1 ? "Raum" : "Räume"} zu feucht` : bad ? "" : "Alle Räume im grünen Bereich", bad ? `Ø ${num(Math.round(avg))} % Luftfeuchte` : `Taupunkt max. ${num(tdMax, 1)} °C`, open ? `${open} ${open === 1 ? "Fenster" : "Fenster"} offen` : "Fenster zu", dev],
      scene: this._sbLuScene(show, true),
    };
  }
  _sbLuScene(rooms, on) {
    const mv = this._sbAnim() !== "aus", P = [[118, 70], [214, 70], [118, 128], [214, 128]];
    const cells = P.map(([x, y], i) => { const r = rooms[i]; return r ? `<rect x="${x}" y="${y}" width="90" height="50" rx="8" fill="${r.c}" opacity=".88"/><text x="${x + 8}" y="${y + 18}" fill="#fff" font-size="11" font-weight="700">${esc(r.n.length > 11 ? r.n.slice(0, 10) + "…" : r.n)}</text><text x="${x + 8}" y="${y + 40}" fill="#fff" font-size="16" font-weight="800">${r.v} %</text>` : `<rect x="${x}" y="${y}" width="90" height="50" rx="8" fill="rgba(255,255,255,.07)"/>`; }).join("");
    const air = on ? [0, 1, 2].map((i) => `<path class="sbair${mv ? " run" : ""}" d="M30 ${84 + i * 30} C 58 ${74 + i * 30} 74 ${96 + i * 30} 110 ${88 + i * 30}" style="${this._sbPh(1.8)}"/>`).join("") : "";
    const fan = `<g transform="translate(40 118)"><circle r="24" fill="rgba(3,20,26,.7)" stroke="rgba(189,240,255,.45)" stroke-width="2"/><g class="${on && mv ? "sbspin" : ""}" style="${this._sbPh(3)}">${[0, 120, 240].map((a) => `<ellipse rx="5.5" ry="14" fill="#bdf0ff" transform="rotate(${a}) translate(0 -9)"/>`).join("")}</g><circle r="3.5" fill="#0f2a33"/></g>`;
    return `<svg viewBox="0 0 320 200" preserveAspectRatio="xMaxYMid meet">${air}<polygon points="106,62 212,16 318,62" fill="rgba(255,255,255,.1)"/><rect x="110" y="62" width="202" height="124" rx="4" fill="rgba(3,20,26,.45)"/>${cells}${fan}${this._sbX() ? `<g class="sbxm"><polygon points="106,62 212,16 318,62 306,62 212,24 118,62" fill="#fff" opacity=".95"/>${this._sbXl(this._sbXroof(112, 62, 212, 18, 312, 14))}</g>` : ""}</svg>`;
  }

  /* Modul 6: Fassade mit Sonnenbogen (sun.sun), nachts Mond und Licht in den Fenstern */
  _sbRbData() {
    const s = this._hass.states["sun.sun"], o = this._out(), dev = "§dev|In Entwicklung";
    const tm = (x) => { const d = x ? new Date(x) : null; return d && !isNaN(d) ? d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : ""; };
    if (!s) return { big: "–", sub: "Keine Sonnen-Entität (sun.sun) gefunden", chips: [dev], scene: this._sbRbScene(null, null, false) };
    const el = Number(s.attributes.elevation), az = Number(s.attributes.azimuth), up = isFinite(el) ? el > 0 : s.state === "above_horizon";
    const di = isFinite(az) ? Math.round(az / 45) % 8 : -1, dir = di >= 0 ? ["Nord", "Nordost", "Ost", "Südost", "Süd", "Südwest", "West", "Nordwest"][di] : "", dirD = di >= 0 ? ["Norden", "Nordosten", "Osten", "Südosten", "Süden", "Südwesten", "Westen", "Nordwesten"][di] : "";
    const shade = up && el > 25 && az >= 120 && az <= 250 && o.t != null && o.t >= 20;
    return up
      ? { big: dir || "Tag", unit: isFinite(el) ? `· ${num(Math.round(el))}°` : "", sub: `Sonne steht im ${dirD || "Himmel"}${o.t != null ? ` · draußen ${num(o.t, 1)} °C` : ""}`,
          chips: [shade ? "Beschattung sinnvoll (Südseite)" : "", tm(s.attributes.next_setting) ? `Sonnenuntergang ${tm(s.attributes.next_setting)}` : "", dev], scene: this._sbRbScene(el, az, true) }
      : { big: "Nacht", sub: `Sonne unter dem Horizont${tm(s.attributes.next_rising) ? ` · Aufgang ${tm(s.attributes.next_rising)}` : ""}`,
          chips: [o.t != null ? `Draußen ${num(o.t, 1)} °C` : "", o.t != null && o.t <= 0 ? "Frost – Rollläden zu lassen" : "", dev], scene: this._sbRbScene(el, az, false) };
  }
  _sbRbScene(el, az, day) {
    const q = day ? "d" : "n", sky = day ? ["#3c8fd0", "#a9dcf3"] : ["#0b1630", "#1d2d55"];
    let sun = "";
    if (day && isFinite(az) && isFinite(el)) { const t = Math.max(0, Math.min(1, (az - 90) / 180)), x = 30 + 260 * t, y = 112 - Math.max(0, Math.min(1, el / 60)) * 92; sun = `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="20" fill="#ffd36b" opacity=".28"/><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="11" fill="#ffd36b"/>`; }
    const moon = day ? "" : `<circle cx="262" cy="34" r="11" fill="#f4f1d8"/><circle cx="268" cy="29" r="10" fill="${sky[0]}"/>${[[40, 30], [90, 18], [150, 40], [210, 22], [300, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#fff" opacity=".8"/>`).join("")}`;
    const win = [0, 1, 2].map((i) => { const x = 136 + i * 50; return `<rect x="${x}" y="156" width="34" height="34" fill="${day ? "#9ccfe8" : "#ffd98a"}"/>${day ? "" : `<rect x="${x}" y="156" width="34" height="${i === 1 ? 14 : 34}" fill="#6b7280"/>`}<rect x="${x}" y="156" width="34" height="34" fill="none" stroke="#fff" stroke-width="2"/>`; }).join("");
    return `<svg viewBox="0 0 320 200" preserveAspectRatio="xMaxYMid meet"><defs><linearGradient id="sbrbs${q}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient><linearGradient id="sbrbf${q}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".35" stop-color="#fff" stop-opacity="1"/></linearGradient><mask id="sbrbm${q}"><rect width="320" height="200" fill="url(#sbrbf${q})"/></mask></defs><rect width="320" height="200" fill="url(#sbrbs${q})" mask="url(#sbrbm${q})"/>
      <path d="M30 120 Q160 -64 290 120" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="2" stroke-dasharray="4 6"/>${sun}${moon}
      <polygon points="120,142 196,112 272,142" fill="#8b3a2b"/><rect x="126" y="142" width="140" height="58" fill="#e9e1d3"/>${win}${this._sbX() ? `<g class="sbxm"><polygon points="120,142 196,112 272,142 262,142 196,119 130,142" fill="#fff"/><circle cx="196" cy="131" r="6.5" fill="none" stroke="#2d7a5c" stroke-width="4"/><circle cx="196" cy="137" r="2" fill="#e05a6b"/>${day ? "" : this._sbXl(this._sbXroof(124, 142, 196, 113, 268, 10))}</g>` : ""}</svg>`;
  }
  /* Modul 7: Außengerät mit Thermometer, Reif und Schnee bei Frost */
  _sbWpData() {
    const o = this._out(), dev = "§dev|In Entwicklung";
    if (o.t == null) return { big: "–", sub: "Keine Außentemperatur – Wetterquelle unter Haus wählen", chips: [dev], scene: this._sbWpScene(null) };
    const abt = o.t > -8 && o.t < 7 && (o.rh == null || o.rh >= 70);
    return { big: num(o.t, 1), unit: "°C", sub: `Draußen${o.rh != null ? ` · Luftfeuchte ${num(Math.round(o.rh))} %` : ""}`,
      chips: [abt ? "§warn|Abtauen wird wahrscheinlicher" : "Kaum Abtau-Bedarf", o.t <= 0 ? "Frost" : "", dev], scene: this._sbWpScene(o.t) };
  }
  _sbWpScene(t) {
    const mv = this._sbAnim() !== "aus", frost = t != null && t <= 3, c = t == null ? "#94a3b8" : t < 7 ? "#60a5fa" : "#f59e0b";
    const lv = t == null ? 40 : Math.max(8, Math.min(86, (t + 15) * 2.4));
    let seed = 5; const R = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const snow = frost ? Array.from({ length: 22 }, () => `<circle class="${mv ? "sbsnow" : ""}" cx="${(R() * 320).toFixed(0)}" cy="${(R() * 190).toFixed(0)}" r="${(1 + R() * 1.6).toFixed(1)}" fill="#fff" opacity=".75" style="animation-delay:-${(R() * 6).toFixed(1)}s"/>`).join("") : "";
    const rime = frost ? [0, 1, 2, 3, 4].map((i) => `<path d="M${132 + i * 24} 70 l5 -8 l5 8" fill="#e0f2ff"/>`).join("") : "";
    return `<svg viewBox="0 0 320 200" preserveAspectRatio="xMaxYMid meet">${snow}
      <g transform="translate(70 40)"><rect x="-6" y="0" width="12" height="96" rx="6" fill="rgba(3,12,22,.6)" stroke="rgba(207,230,255,.45)"/><rect x="-3" y="${96 - lv}" width="6" height="${lv}" rx="3" fill="${c}"/><circle cy="106" r="12" fill="${c}"/><text x="18" y="12" fill="#fff" font-size="12" font-weight="700">${t != null ? num(t, 1) + " °C" : "–"}</text></g>
      <rect x="126" y="70" width="128" height="94" rx="10" fill="#d9dee5"/>${rime}
      <circle cx="176" cy="117" r="34" fill="#9aa3ad"/><g class="${mv ? "sbspin" : ""}" style="${this._sbPh(2.4)}">${[0, 60, 120].map((a) => `<ellipse cx="176" cy="117" rx="7" ry="27" fill="#6b7480" transform="rotate(${a} 176 117)"/>`).join("")}</g><circle cx="176" cy="117" r="5" fill="#4b5563"/>
      <rect x="222" y="86" width="22" height="62" rx="4" fill="#bfc6cf"/>
      <path d="M254 112 H286 V50" stroke="#f87171" stroke-width="5" fill="none"/><path d="M254 130 H300 V50" stroke="#60a5fa" stroke-width="5" fill="none"/>
      <polygon points="272,52 296,34 320,52" fill="rgba(255,255,255,.18)"/>${this._sbX() ? `<g class="sbxm"><rect x="122" y="63" width="136" height="11" rx="5.5" fill="#fff"/><circle cx="140" cy="76" r="3" fill="#fff"/><circle cx="232" cy="76" r="2.5" fill="#fff"/></g>` : ""}</svg>`;
  }

  /* ================= Build 3: Modul 10 Garten, Modul 12 Pool & Sauna, Modul 13 Batteriespeicher ================= */
  /* Modul 10: Beet mit dem aktuellen Wetter (Wetterquelle unter Haus) */
  _sbGaData() {
    const o = this._out(), dev = "§dev|In Entwicklung", w = o.w || "", wl = (WX[w] || [null, ""])[1];
    if (!w && o.t == null) return { big: "–", sub: "Keine Wetterquelle – unter Haus wählen", chips: [dev], scene: this._sbGaScene("", null) };
    const wet = /rain|pouring|lightning-rainy|snowy-rainy/.test(w), snow = w === "snowy", frost = o.t != null && o.t <= 0;
    const hot = !wet && o.t != null && o.t >= 25 && /sunny|partlycloudy|clear/.test(w);
    const hint = frost ? "§warn|Frost – Außenleitungen entleeren" : wet ? "§ok|Heute nicht gießen" : hot ? "§warn|Abends gießen" : o.t != null && o.t < 10 ? "Kaum Gießbedarf" : "";
    return { big: wl || "Wetter", small: (wl || "").length > 9, sub: `${o.t != null ? `Draußen ${num(o.t, 1)} °C` : ""}${o.rh != null ? ` · Luftfeuchte ${num(Math.round(o.rh))} %` : ""}`,
      chips: [hint, snow ? "Schnee" : "", dev], scene: this._sbGaScene(w, o.t) };
  }
  _sbGaScene(w, t) {
    const mv = this._sbAnim() !== "aus", wet = /rain|pouring|lightning/.test(w), snow = /snow/.test(w), cloud = wet || snow || /cloudy|fog/.test(w), night = w === "clear-night";
    const q = wet ? "r" : snow ? "s" : night ? "n" : cloud ? "c" : "d", sky = { r: ["#5b6b7d", "#8fa3b5"], s: ["#7f93a8", "#c9d6e2"], n: ["#0b1630", "#1d2d55"], c: ["#5d86ab", "#a9c4d8"], d: ["#3c8fd0", "#bfe6f5"] }[q];
    let seed = 3; const R = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const fall = wet || snow ? Array.from({ length: snow ? 22 : 16 }, () => { const x = 150 + R() * 150, y = 60 + R() * 60; return snow ? `<circle class="${mv ? "sbsnow" : ""}" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(1.2 + R() * 1.4).toFixed(1)}" fill="#fff" style="animation-delay:-${(R() * 6).toFixed(1)}s"/>` : `<line class="${mv ? "sbrain" : ""}" x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x - 4).toFixed(0)}" y2="${(y + 12).toFixed(0)}" stroke="#cfe6ff" stroke-width="2" stroke-linecap="round" style="animation-delay:-${(R() * 1).toFixed(2)}s"/>`; }).join("") : "";
    const sky2 = cloud ? `<g fill="${wet ? "#d6dee6" : "#eef3f7"}" opacity=".95"><ellipse cx="226" cy="46" rx="58" ry="20"/><ellipse cx="194" cy="38" rx="32" ry="22"/><ellipse cx="262" cy="36" rx="30" ry="18"/></g>` : night ? `<circle cx="282" cy="34" r="11" fill="#f4f1d8"/><circle cx="288" cy="29" r="10" fill="${sky[0]}"/>` : `<circle cx="282" cy="36" r="22" fill="#ffd36b" opacity=".3"/><circle cx="282" cy="36" r="14" fill="#ffd36b"/>`;
    const plants = Array.from({ length: 6 }, (_, i) => { const x = 128 + i * 32, h = 22 + (i % 3) * 9; return `<g transform="translate(${x} 168)"><path d="M0 0 V-${h}" stroke="#2d7a5c" stroke-width="3"/><ellipse cx="-7" cy="-${h * 0.55}" rx="8" ry="4.5" fill="${t != null && t <= 0 ? "#7fae9a" : "#3fa37a"}" transform="rotate(-30 -7 -${h * 0.55})"/><ellipse cx="7" cy="-${h * 0.85}" rx="8" ry="4.5" fill="${t != null && t <= 0 ? "#7fae9a" : "#3fa37a"}" transform="rotate(30 7 -${h * 0.85})"/>${i % 2 && !(t != null && t <= 0) ? `<circle cy="-${h + 4}" r="5" fill="#f472b6"/>` : ""}</g>`; }).join("");
    return `<svg viewBox="0 0 320 200" preserveAspectRatio="xMaxYMid meet"><defs><linearGradient id="sbgas${q}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient><linearGradient id="sbgaf${q}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".35" stop-color="#fff"/></linearGradient><mask id="sbgam${q}"><rect width="320" height="200" fill="url(#sbgaf${q})"/></mask></defs>
      <rect width="320" height="200" fill="url(#sbgas${q})" mask="url(#sbgam${q})"/>${sky2}${fall}
      <path d="M100 172 Q210 156 320 170 V200 H100Z" fill="${snow ? "#e9f1f3" : "#6b4a32"}"/><path d="M100 174 Q210 158 320 172" stroke="${snow ? "#fff" : "#3fa37a"}" stroke-width="5" fill="none"/>${plants}${this._sbX() ? `<g class="sbxm"><g transform="translate(110 172)"><polygon points="0,-46 -15,0 15,0" fill="#2d7a5c"/><circle cx="-5" cy="-12" r="2.2" fill="#f4d58d"/><circle cx="5" cy="-22" r="2.2" fill="#e05a6b"/><circle cx="-2" cy="-32" r="2.2" fill="#8cc8f5"/><polygon points="0,-54 2,-48 8,-48 3,-44 5,-38 0,-42 -5,-38 -3,-44 -8,-48 -2,-48" fill="#f4d58d"/></g><g transform="translate(304 164)"><circle r="10" fill="#fff"/><circle cy="-15" r="7" fill="#fff"/><circle cx="-2.4" cy="-16" r="1" fill="#222"/><circle cx="2.4" cy="-16" r="1" fill="#222"/><path d="M0 -14 l5 1.6 -5 1.6z" fill="#f08a1f"/></g></g>` : ""}</svg>`;
  }

  /* Modul 12: Pool mit Wellen und Saunahütte (Bedingungen wie „Bedingungen jetzt“) */
  _sbPlData() {
    const o = this._out(), pv = this._pvNow(), pr = this._price(), dev = "§dev|In Entwicklung";
    if (o.t == null && pv == null) return { big: "–", sub: "Noch keine Außentemperatur und kein PV-Sensor", chips: [dev], scene: this._sbPlScene(null, false) };
    return { big: o.t != null ? num(o.t, 1) : "–", unit: o.t != null ? "°C draußen" : "", sub: [pv != null ? `PV-Überschuss ${wfmt(pv)}` : "", pr ? `Strom ${num(pr, 1)} ct/kWh` : ""].filter(Boolean).join(" · ") || "Bedingungen jetzt",
      chips: [pv != null ? (pv >= 1000 ? "§ok|Gut für Pumpe und Heizung" : "Eher wenig PV") : "", o.t != null && o.t < 10 ? "Pool-Heizung lohnt kaum" : "", dev], scene: this._sbPlScene(o.t, pv != null && pv >= 300) };
  }
  _sbPlScene(t, sun) {
    const mv = this._sbAnim() !== "aus", cold = t != null && t < 5;
    const waves = [0, 1, 2, 3].map((i) => `<path class="${mv ? "sbwave" : ""}" d="M${150 + i * 34} 160 q8 -5 16 0 t16 0" stroke="#fff" stroke-opacity=".65" stroke-width="2" fill="none" style="${this._sbPh(2.6)}"/>`).join("");
    return `<svg viewBox="0 0 320 200" preserveAspectRatio="xMaxYMid meet"><defs><linearGradient id="sbplw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${cold ? "#7fb3c8" : "#4fd1e0"}"/><stop offset="1" stop-color="${cold ? "#3f6f86" : "#1b8fb0"}"/></linearGradient></defs>
      ${sun ? `<circle cx="160" cy="44" r="24" fill="#ffe27a" opacity=".3"/><circle cx="160" cy="44" r="15" fill="#ffe27a"/>` : `<g fill="rgba(255,255,255,.55)"><ellipse cx="170" cy="46" rx="40" ry="14"/><ellipse cx="150" cy="40" rx="22" ry="14"/></g>`}
      <rect x="128" y="138" width="152" height="8" rx="4" fill="#e9eef2"/><path d="M134 146 h140 l-12 40 h-116 z" fill="url(#sbplw)"/>${waves}
      ${t != null ? `<g transform="translate(204 128)"><rect x="-36" y="-14" width="72" height="24" rx="12" fill="rgba(11,34,51,.8)"/><text y="3" text-anchor="middle" fill="#fff" font-size="12.5" font-weight="800">${num(t, 1)} °C</text></g>` : ""}
      <polygon points="282,112 302,96 320,112" fill="#7a4b2a"/><rect x="286" y="112" width="34" height="66" fill="#a0673c"/><rect x="298" y="140" width="12" height="38" fill="#5a3a20"/>${this._sbX() ? `<g class="sbxm"><polygon points="280,112 302,94 320,110 320,113 302,100 286,112" fill="#fff"/>${this._sbXl(this._sbXroof(284, 112, 302, 96, 320, 8))}</g>` : ""}</svg>`;
  }

  /* Modul 13: Akku mit Füllstand und PV (Ladestand-Sensor und PV-Überschuss aus Modul 1) */
  _sbBtData() {
    const soc = this._soc(), pv = this._pvNow(), p = this._pv(), min = p.soc_sensor && p.soc_min != null ? p.soc_min : null, dev = "§dev|In Entwicklung";
    if (soc == null) return { big: "–", sub: "Noch kein Ladestand-Sensor gewählt (Modul 1 → PV)", chips: [dev], scene: this._sbBtScene(null, false) };
    const sun = pv != null && pv > 100 && soc < 99, low = min != null && soc < min + 10;
    return { big: num(Math.round(soc)), unit: "%", sub: soc >= 99 ? "Akku ist voll" : sun ? `PV-Überschuss ${wfmt(pv)} zum Laden verfügbar` : pv != null ? "Kein PV-Überschuss" : "Ladestand jetzt",
      chips: [sun ? "§ok|PV laden" : "", min != null ? `Untergrenze ${num(min, 0)} %` : "", low ? "§warn|Nah an der Untergrenze" : "", dev], scene: this._sbBtScene(soc, sun, pv) };
  }
  _sbBtScene(soc, sun, pv) {
    const mv = this._sbAnim() !== "aus", s = soc == null ? 0 : Math.max(0, Math.min(100, soc)), fill = Math.round(118 * s / 100), c = s >= 30 ? "#22a06b" : "#f59e0b";
    return `<svg viewBox="0 0 320 200" preserveAspectRatio="xMaxYMid meet">
      <g opacity="${sun ? 1 : 0.35}"><circle cx="138" cy="34" r="12" fill="#ffd36b"/><path d="M104 82 l14 -26 h48 l-14 26z" fill="#2b5c9e" stroke="#9cc3ff66"/></g>
      ${sun ? `<path class="sbpv${mv ? " run" : ""}" d="M146 84 C160 100 176 104 196 108" style="${this._sbPh(1.4)}"/>` : ""}
      <rect x="196" y="40" width="78" height="134" rx="14" fill="rgba(3,18,26,.65)" stroke="rgba(207,230,255,.5)" stroke-width="3"/><rect x="222" y="30" width="26" height="11" rx="3" fill="rgba(207,230,255,.5)"/>
      ${soc != null ? `<rect x="203" y="${167 - fill}" width="64" height="${fill}" rx="8" fill="${c}"/><text x="235" y="114" text-anchor="middle" fill="#fff" font-size="21" font-weight="800">${num(Math.round(s))} %</text>` : `<text x="235" y="114" text-anchor="middle" fill="#fff" font-size="21" font-weight="800">–</text>`}
      <polygon points="282,118 301,102 320,118" fill="rgba(255,255,255,.2)"/><rect x="286" y="118" width="30" height="40" fill="rgba(255,255,255,.12)"/><rect x="295" y="128" width="11" height="11" fill="#ffd98a"/>
      ${sun && pv != null ? `<g transform="translate(150 150)"><rect x="-38" y="-13" width="76" height="24" rx="12" fill="rgba(11,34,51,.8)"/><text y="3" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">${wfmt(pv)}</text></g>` : ""}${this._sbX() ? `<g class="sbxm"><rect x="198" y="136" width="74" height="9" fill="#e05a6b" opacity=".92"/><rect x="196" y="40" width="9" height="134" rx="4" fill="#e05a6b" opacity=".92"/><path d="M200 38 C182 22 178 42 200 38 C222 22 218 42 200 38Z" fill="#e05a6b"/><circle cx="200" cy="38" r="3.5" fill="#b91c1c"/></g>` : ""}</svg>`;
  }
