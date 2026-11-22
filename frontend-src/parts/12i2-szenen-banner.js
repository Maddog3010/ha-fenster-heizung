  /* ================= Szenen-Banner für die restlichen Module (Build 1: Baustein, Modul 2, Modul 15) =================
     Gleicher Aufbau wie das einheitliche Banner (Titel, große Zahl, Zusatzzeile, Chips), rechts statt des Logo-Felds ein
     Bild mit echten Werten, das zur Kartenfarbe ausläuft. Bewegung folgt Anpassen → Animationen und „Bewegung reduzieren“,
     Bilder außerhalb des Bildschirms halten an (data-an). Schalter „Banner wie bisher“: layout.sb.old. */
  _sbOn() { return !((this._cfg.layout.sb || {}).old); }
  _sbAnim() { return this._rkCfg ? this._rkCfg().anim : "dezent"; }
  /* Laufende Bewegung über den Neuaufbau retten: Phase aus der Uhrzeit statt Neustart bei jedem Zeichnen */
  _sbPh(sec) { return `animation-delay:-${((Date.now() / 1000) % sec).toFixed(2)}s`; }
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
    </svg>`;
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
    return `<div class="sbwa"><div class="sbcal${over ? " bad" : ""}"><b>${MON[dd.getMonth()]}</b><em>${dd.getDate()}</em><small>${esc(nx ? nx.name : "Noch keine Termine")}</small></div>${rings ? `<div class="sbrgs">${rings}</div>` : ""}</div>`;
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
    return `<svg viewBox="0 0 320 200" preserveAspectRatio="xMaxYMid meet">${air}<polygon points="106,62 212,16 318,62" fill="rgba(255,255,255,.1)"/><rect x="110" y="62" width="202" height="124" rx="4" fill="rgba(3,20,26,.45)"/>${cells}${fan}</svg>`;
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
      <polygon points="120,142 196,112 272,142" fill="#8b3a2b"/><rect x="126" y="142" width="140" height="58" fill="#e9e1d3"/>${win}</svg>`;
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
      <polygon points="272,52 296,34 320,52" fill="rgba(255,255,255,.18)"/></svg>`;
  }
