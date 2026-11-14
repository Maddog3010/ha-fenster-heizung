  /* ================= Modul 8 · Neue Optik (v0.7, Konzept „Modul 8 – Neue Optik“, Teil A) =================
     A1 Carport-Szene als Banner · A2 Satz-Zeile · A3 Ladeband jetzt → Ziel · A4 Kacheln 2.0 · A5 Modus-Karten
     A6 Heute als Zeitleiste · A7 „Warum gerade so?“ · A8 Handy · A9 Hell · A10 Register „Fahrzeuge“.
     Schalter: Einstellungen → Darstellung „Wie bisher“ (cfg.look) und der globale Schalter der Grafik-Bibliothek. */
  _evNew() { return this._wb().look !== "classic" && !this._gxCfg().classic; }
  /* Elektroauto in HD: Proportionen wie echte Autos, Radläufe, Felgen, Licht und Spiegelungen. Rückgabe: { svg, port } – port = Ladeklappe für das Kabel */
  _evCarHD(body, color, o = {}) {
    const S = EV_HD[body] || EV_HD.limousine, C = EV_COLORS[color] || EV_COLORS.blue, u = "hd" + String(o.uid || "x").replace(/[^a-z0-9]/gi, "");
    const { x0, x1, wr, wf, R, BOT, belt, roof, peak, cx, cowl, nose } = S, G = 253, WY = G - R, AR = R + 5, f = (n) => n.toFixed(1);
    const dx = Math.sqrt(AR * AR - (BOT - WY) * (BOT - WY)), light = color === "white" || color === "silver";
    const aTop = cx - 56; // oberes Ende der Frontscheibe
    const bodyP = `M${x0 + 14} ${BOT} C${x0 + 4} ${BOT} ${x0} ${BOT - 6} ${x0} ${BOT - 18} L${x0} ${S.tail + 18} ${S.rear(S)}
      C${peak + 40} ${roof} ${aTop - 20} ${roof + 2} ${aTop} ${roof + 6} C${aTop + 26} ${roof + 12} ${cx - 22} ${cowl - 10} ${cx} ${cowl}
      C${cx + 40} ${cowl + 3} ${x1 - 46} ${nose - 4} ${x1 - 14} ${nose} C${x1 - 4} ${nose + 2} ${x1} ${nose + 10} ${x1} ${nose + 20}
      L${x1} ${BOT - 16} C${x1} ${BOT - 5} ${x1 - 5} ${BOT} ${x1 - 16} ${BOT}
      L${f(wf + dx)} ${BOT} A${AR} ${AR} 0 1 0 ${f(wf - dx)} ${BOT} L${f(wr + dx)} ${BOT} A${AR} ${AR} 0 1 0 ${f(wr - dx)} ${BOT} Z`;
    // Fenster: von der Fensterlinie bis knapp unters Dach
    const sedan = body === "limousine", gx0 = sedan ? x0 + 74 : x0 + 20, rb = belt - 4;
    const glass = (sedan
      ? `M${gx0} ${rb} C${gx0 + 30} ${rb - 16} ${peak - 70} ${roof + 7} ${peak} ${roof + 6}`
      : `M${gx0} ${rb} C${gx0 + 6} ${rb - 20} ${x0 + S.hd - 6} ${roof + S.drop + 12} ${x0 + S.hd + 6} ${roof + S.drop + 7} C${x0 + S.hd + 50} ${roof + S.drop + 2} ${peak - 50} ${roof + 6} ${peak} ${roof + 6}`)
      + ` C${peak + 40} ${roof + 6} ${aTop - 22} ${roof + 8} ${aTop - 4} ${roof + 12} C${aTop + 20} ${roof + 18} ${cx - 28} ${belt - 8} ${cx - 12} ${belt} Z`;
    const pB = Math.round((wr + wf) / 2 + 14), pC = sedan ? null : Math.round(x0 + S.hd + (body === "kompakt" ? 22 : 44));
    const doorF = Math.round(wf - AR - 8), doorR = Math.round(wr + AR + 4), port = [Math.round(wr + 2), belt + 18];
    const yb = (belt - roof) / (BOT - roof); // Anteil der Fensterlinie an der Höhe (für die Lackverläufe)
    const wheel = (cx0) => {
      const rr = R * 0.7, sp = Array.from({ length: 10 }, (_, k) => { const a = (k * 36) * Math.PI / 180, a2 = a + 0.2;
        return `<path d="M${f(cx0 + Math.cos(a) * 7)} ${f(WY + Math.sin(a) * 7)} L${f(cx0 + Math.cos(a) * (rr - 2))} ${f(WY + Math.sin(a) * (rr - 2))} L${f(cx0 + Math.cos(a2) * (rr - 2))} ${f(WY + Math.sin(a2) * (rr - 2))} Z" fill="${k % 2 ? "#aab3bf" : "url(#" + u + "rim)"}"/>`; }).join("");
      return `<g><circle cx="${cx0}" cy="${WY}" r="${R}" fill="#121418"/><circle cx="${cx0}" cy="${WY}" r="${R - 2.5}" fill="none" stroke="#23272e" stroke-width="2.4"/>
        <circle cx="${cx0}" cy="${WY}" r="${f(rr + 1.5)}" fill="#2b3038"/><circle cx="${cx0}" cy="${WY}" r="${f(rr - 1)}" fill="#171a20"/>
        <circle cx="${cx0 + 6}" cy="${WY + 3}" r="${f(rr * 0.62)}" fill="#3a3f47"/><path d="M${cx0 + 2} ${f(WY - rr * 0.55)} a${f(rr * 0.4)} ${f(rr * 0.4)} 0 0 1 ${f(rr * 0.5)} ${f(rr * 0.3)}" fill="none" stroke="#c62828" stroke-width="4" opacity=".8"/>${sp}
        <circle cx="${cx0}" cy="${WY}" r="${f(rr)}" fill="none" stroke="url(#${u}rim)" stroke-width="2"/><circle cx="${cx0}" cy="${WY}" r="7" fill="url(#${u}rim)"/><circle cx="${cx0}" cy="${WY}" r="3.2" fill="#2b313b"/>
        <path d="M${f(cx0 - R + 4)} ${WY - 6} A${R - 3} ${R - 3} 0 0 1 ${cx0 - 4} ${f(WY - R + 4)}" fill="none" stroke="#fff" stroke-width="1.4" opacity=".12"/></g>`;
    };
    const shoulder = `M${x0 + 8} ${belt + 12} C${x0 + 120} ${belt + 9} ${x1 - 160} ${belt + 8} ${x1 - 16} ${nose + 8}`;
    const lowCrease = `M${wr + AR + 10} ${BOT - 26} C${wr + 120} ${BOT - 30} ${wf - 120} ${BOT - 30} ${wf - AR - 10} ${BOT - 27}`;
    return { port, svg: `<defs>
      <linearGradient id="${u}p" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${C[1]}"/><stop offset="${f(yb * 0.9)}" stop-color="${C[2]}"/><stop offset="${f(yb + 0.08)}" stop-color="${C[1]}"/><stop offset="${f(yb + 0.16)}" stop-color="${C[2]}"/>
        <stop offset=".72" stop-color="${C[3]}"/><stop offset=".86" stop-color="${C[2]}"/><stop offset="1" stop-color="${C[4]}"/></linearGradient>
      <linearGradient id="${u}g" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#4b6075"/><stop offset=".4" stop-color="#1c2836"/><stop offset="1" stop-color="#090e15"/></linearGradient>
      <linearGradient id="${u}rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3f5f8"/><stop offset=".55" stop-color="#9ca5b2"/><stop offset="1" stop-color="#d9dee5"/></linearGradient>
      <linearGradient id="${u}x" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset=".12" stop-color="#000" stop-opacity="0"/><stop offset=".85" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
      <clipPath id="${u}b"><path d="${bodyP}"/></clipPath><clipPath id="${u}gc"><path d="${glass}"/></clipPath>
      <filter id="${u}bl" x="-10%" y="-80%" width="120%" height="260%"><feGaussianBlur stdDeviation="4"/></filter><filter id="${u}gw" x="-50%" y="-300%" width="200%" height="700%"><feGaussianBlur stdDeviation="2.4"/></filter></defs>
      <ellipse cx="${(x0 + x1) / 2}" cy="${G}" rx="${(x1 - x0) / 1.9}" ry="7" fill="#000" opacity=".45" filter="url(#${u}bl)"/>
      <ellipse cx="${wr}" cy="${G - 0.5}" rx="${R * 0.85}" ry="3" fill="#000" opacity=".6"/><ellipse cx="${wf}" cy="${G - 0.5}" rx="${R * 0.85}" ry="3" fill="#000" opacity=".6"/>
      <circle cx="${wr}" cy="${WY}" r="${AR - 0.5}" fill="#07080b"/><circle cx="${wf}" cy="${WY}" r="${AR - 0.5}" fill="#07080b"/>
      <path d="${bodyP}" fill="url(#${u}p)"/>
      <g clip-path="url(#${u}b)">
        <rect x="${x0}" y="${roof - 6}" width="${x1 - x0}" height="${BOT - roof + 8}" fill="url(#${u}x)"/>
        <path d="${shoulder}" fill="none" stroke="#fff" stroke-width="1.8" opacity="${light ? .75 : .45}"/><path d="${shoulder}" fill="none" stroke="#000" stroke-width="1.6" opacity=".18" transform="translate(0 2)"/>
        <path d="${lowCrease}" fill="none" stroke="#fff" stroke-width="1.4" opacity="${light ? .5 : .22}"/>
        <path d="M${x0} ${BOT - 11} L${x1} ${BOT - 11} L${x1} ${BOT + 2} L${x0} ${BOT + 2} Z" fill="#14171c"/><path d="M${x0} ${BOT - 11.5} L${x1} ${BOT - 11.5}" stroke="#fff" stroke-width="1" opacity=".14"/>
        ${S.clad ? `<circle cx="${wr}" cy="${WY}" r="${AR + 4}" fill="none" stroke="#1a1d22" stroke-width="9"/><circle cx="${wf}" cy="${WY}" r="${AR + 4}" fill="none" stroke="#1a1d22" stroke-width="9"/><path d="M${x0} ${BOT - 18} L${x1} ${BOT - 18}" stroke="#1a1d22" stroke-width="14"/>` : ""}
        <circle cx="${wr}" cy="${WY}" r="${AR + 3}" fill="none" stroke="#000" stroke-width="4" opacity=".22"/><circle cx="${wf}" cy="${WY}" r="${AR + 3}" fill="none" stroke="#000" stroke-width="4" opacity=".22"/>
        <g stroke="${C[4]}" stroke-width="1.2" fill="none" opacity="${light ? .5 : .75}"><path d="M${doorF} ${belt - 1} C${doorF + 3} ${belt + 30} ${doorF + 1} ${BOT - 26} ${doorF - 4} ${BOT - 11}"/><path d="M${pB} ${belt - 2} L${pB - 2} ${BOT - 11}"/><path d="M${doorR} ${belt - 1} C${doorR - 2} ${belt + 30} ${doorR} ${BOT - 26} ${doorR + 3} ${BOT - 11}"/></g>
        <rect x="${pB - 50}" y="${belt + 14}" width="20" height="3.2" rx="1.6" fill="#000" opacity=".35"/><rect x="${pB + 30}" y="${belt + 14}" width="20" height="3.2" rx="1.6" fill="#000" opacity=".35"/>
        <rect x="${port[0] - 9}" y="${port[1] - 6}" width="18" height="12" rx="3.5" fill="none" stroke="${C[4]}" stroke-width="1" opacity=".75"/>
      </g>
      <path d="${glass}" fill="url(#${u}g)"/>
      <g clip-path="url(#${u}gc)"><path d="M${peak - 30} ${belt} L${peak + 10} ${roof} L${peak + 42} ${roof} L${peak + 2} ${belt} Z" fill="#fff" opacity=".12"/><path d="M${aTop + 6} ${belt} L${aTop + 30} ${roof} L${aTop + 40} ${roof} L${aTop + 16} ${belt} Z" fill="#fff" opacity=".08"/>
        <rect x="${pB - 3}" y="${roof}" width="6" height="${belt - roof + 4}" fill="#05070a"/>${pC ? `<rect x="${pC - 3}" y="${roof}" width="${body === "kompakt" ? 12 : 8}" height="${belt - roof + 4}" fill="#05070a"/>` : ""}
        <rect x="${x0}" y="${belt - 8}" width="${x1 - x0}" height="8" fill="#000" opacity=".25"/></g>
      <path d="${glass}" fill="none" stroke="#05070a" stroke-width="2.2"/><path d="${glass}" fill="none" stroke="#cbd5e1" stroke-width=".8" opacity=".35" transform="translate(0 -2)"/>
      <path d="M${cx - 8} ${belt} C${cx - 7} ${belt - 6} ${cx + 4} ${belt - 8} ${cx + 10} ${belt - 4} L${cx + 8} ${belt + 2} L${cx - 5} ${belt + 2} Z" fill="${C[3]}" stroke="#05070a" stroke-width=".9"/>
      <path d="M${x1 - 42} ${nose + 4} C${x1 - 24} ${nose + 4} ${x1 - 8} ${nose + 7} ${x1 - 2} ${nose + 12}" fill="none" stroke="#eef7ff" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M${x1 - 42} ${nose + 4} C${x1 - 24} ${nose + 4} ${x1 - 8} ${nose + 7} ${x1 - 2} ${nose + 12}" fill="none" stroke="#bfe3ff" stroke-width="6" stroke-linecap="round" opacity="${o.night ? .85 : .3}" filter="url(#${u}gw)"/>
      <path d="M${x1 - 30} ${BOT - 18} L${x1 - 4} ${BOT - 18}" stroke="#05070a" stroke-width="4" stroke-linecap="round" opacity=".7"/>
      <path d="M${x0 + 1} ${S.tail + 6} L${x0 + 34} ${S.tail + 3}" stroke="#c81e2c" stroke-width="3.4" stroke-linecap="round"/><path d="M${x0 + 1} ${S.tail + 6} L${x0 + 34} ${S.tail + 3}" stroke="#ff4d5e" stroke-width="7" stroke-linecap="round" opacity="${o.night ? .75 : .22}" filter="url(#${u}gw)"/>
      <path d="${bodyP}" fill="none" stroke="${C[4]}" stroke-width="1.2" opacity=".7"/>
      ${o.port !== false ? `<circle cx="${port[0]}" cy="${port[1]}" r="3" fill="${o.chg ? "#22e06b" : "#9aa5b1"}"/>` : ""}
      ${wheel(wr)}${wheel(wf)}` };
  }
  /* Zustand für Banner, Satz-Zeile, Band und Kacheln an einer Stelle */
  _evNow(d) {
    const sn = this._wbSnap(), c = sn.cfg, i = sn.info || {}, w = sn.want || {}, who = sn.who, v = d.veh, wbOn = this._wbOn(c);
    const dep = v && v.dep && v.dep.on ? v.dep : null, limit = who ? who.limit : v ? v.limit : c.limit;
    const goal = dep ? Math.min(dep.soc, limit) : limit, cap = (v && v.cap) || c.cap, soc = d.soc;
    const need = soc != null ? Math.max(0, (goal - soc) / 100 * cap) : null, pw = d.power != null ? d.power : 0;
    const sun = d.charging && pw > 0 && w.surplus_w != null ? Math.max(0, Math.min(100, w.surplus_w / pw * 100)) : null;
    let done = null;
    if (d.charging && pw > 500 && need != null && need > 0.05) { const t = new Date(Date.now() + need / (pw / 1000) * 36e5); if (t - Date.now() < 36 * 36e5) done = t; }
    const MN = { off: "Aus", pv: "Sonne", minpv: "Sonne + Netz", now: "Voll" }, wv = who && who.kind === "vehicle" ? c.vehicles.find((x) => x.id === who.id || x.name === who.name) : null;
    const mode = who ? (wv ? wv.mode : who.kind === "guest" ? c.guest.mode : c.mode) : c.mode;
    const tm = (t) => t.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    const card = !who ? "" : who.kind === "guest" ? `Gast · Karte ${who.card}` : who.auto ? (this._wbHa(c) ? "fest zugeordnet" : "ohne Karte") : who.card == null ? "" : `Karte ${esc(((i.cards || []).find((x) => x.i === who.card) || {}).n || String(who.card))}`;
    return { sn, c, i, w, who, v, wbOn, dep, limit, goal, cap, soc, need, pw, sun, done, doneT: done ? tm(done) : "", mode, modeN: MN[mode] || "–", MN, card, tm,
      night: ((this._hass.states["sun.sun"] || {}).state || "") === "below_horizon" };
  }
  /* A1: Carport mit Hauswand, Wallbox, flach aufliegenden Modulen und dem Auto in Form und Farbe des Fahrzeugs */
  _evCarport(d, N, W, H, o = {}) {
    const L = this._evLook(d.veh), u = "evb" + (o.sfx || ""), sx = o.sx != null ? o.sx : W - 690, s = o.s || 1, gy = H - 30, night = N.night;
    const line = d.charging ? (N.sun != null && N.sun < 50 ? "#fb923c" : "#fde047") : "", glow = d.charging ? "#22e06b" : d.plugged ? "#ffa51f" : "#9aa5b1";
    const pv = Array.from({ length: 12 }, (_, k) => `<rect x="${k * 46 + 4}" y="0" width="42" height="11" rx="1.5" fill="url(#${u}pv)" stroke="#9fb6d6" stroke-width=".6" opacity="${night ? .55 : 1}"/>`).join("");
    const car = this._evCarHD(L.body, L.color, { uid: u + "c", chg: d.charging, night }), ex = car.port[0] - 66, ey = car.port[1] + 22;
    const cab = `M104 206 C100 262 ${ex - 110} 262 ${ex - 52} ${ey + 34} C${ex - 28} ${ey + 22} ${ex - 10} ${ey + 8} ${ex - 2} ${ey + 1}`;
    return `<svg class="evsc" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMaxYMax slice" aria-hidden="true"><defs>
      <linearGradient id="${u}sky" x1="0" y1="0" x2="0" y2="1">${night ? `<stop offset="0" stop-color="#0b1530"/><stop offset=".7" stop-color="#1d2b4f"/><stop offset="1" stop-color="#2c3a5e"/>` : `<stop offset="0" stop-color="#3f86d6"/><stop offset=".65" stop-color="#a9d3f3"/><stop offset="1" stop-color="#e6f3fb"/>`}</linearGradient>
      <radialGradient id="${u}sun"><stop offset="0" stop-color="${night ? "#e0e7ff" : "#fff7c2"}"/><stop offset=".35" stop-color="${night ? "#c7d2fe" : "#fde68a"}" stop-opacity=".7"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></radialGradient>
      <linearGradient id="${u}pv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2d4a7a"/><stop offset=".5" stop-color="#1b3058"/><stop offset="1" stop-color="#365c94"/></linearGradient>
      <linearGradient id="${u}wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${night ? "#8d8679" : "#efe9df"}"/><stop offset="1" stop-color="${night ? "#7a7366" : "#d9d1c4"}"/></linearGradient>
      <linearGradient id="${u}road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a919c"/><stop offset="1" stop-color="#5b626d"/></linearGradient>
      <filter id="${u}gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter></defs>
      <rect width="${W}" height="${H}" fill="url(#${u}sky)"/>
      ${night ? `<g fill="#fff">${[[.55, .18], [.62, .3], [.7, .12], [.8, .24], [.9, .1], [.95, .32]].map(([a, b]) => `<circle cx="${W * a}" cy="${H * b}" r="1.3" opacity=".8"/>`).join("")}</g><circle cx="${W - 150}" cy="56" r="56" fill="url(#${u}sun)"/><circle cx="${W - 150}" cy="56" r="15" fill="#e0e7ff"/>`
        : `<circle cx="${W - 150}" cy="60" r="78" fill="url(#${u}sun)"/><circle cx="${W - 150}" cy="60" r="23" fill="#fde047"/><g fill="#fff" opacity=".85"><ellipse cx="${W - 420}" cy="54" rx="44" ry="11"/><ellipse cx="${W - 390}" cy="46" rx="28" ry="10"/></g>`}
      <ellipse cx="${W / 2}" cy="${gy + 4}" rx="${W}" ry="20" fill="${night ? "#2f4a3a" : "#6fae73"}" opacity=".6"/><rect y="${gy}" width="${W}" height="30" fill="url(#${u}road)" opacity="${night ? .7 : 1}"/>
      <g transform="translate(${sx} ${gy - 270 * s}) scale(${s})">
        <rect x="0" y="0" width="150" height="270" fill="url(#${u}wall)"/><rect x="0" y="0" width="150" height="10" fill="#b9b0a2"/>
        <rect x="22" y="40" width="58" height="70" rx="4" fill="${night ? "#fcd34d" : "#9cc7ea"}" stroke="#fff" stroke-width="4" opacity="${night ? .85 : 1}"/>
        <g transform="translate(76 120)"><rect width="56" height="86" rx="12" fill="#f8fafc" stroke="#b6bdc7"/><rect x="8" y="9" width="40" height="20" rx="6" fill="#0d141c"/>
          <text x="28" y="23" text-anchor="middle" font-size="10" font-weight="700" fill="${d.charging ? "#4ade80" : "#8da0b3"}">${d.charging && d.power != null ? num(d.power / 1000, 1) + " kW" : d.plugged ? "bereit" : "frei"}</text>
          <circle cx="28" cy="48" r="11" fill="none" stroke="${glow}" stroke-width="3.5"/>${d.charging ? `<circle cx="28" cy="48" r="11" fill="none" stroke="${glow}" stroke-width="5" opacity=".6" filter="url(#${u}gl)" class="evpulse"/>` : ""}</g>
        <g transform="translate(150 54)"><rect x="0" y="0" width="560" height="10" fill="#4b5563"/><g transform="translate(6 -11)">${pv}</g><rect x="540" y="10" width="10" height="206" fill="#6b7280"/></g>
        ${line ? `<path d="M300 50 C300 18 140 28 110 120" fill="none" stroke="${line}" stroke-width="10" opacity=".3" filter="url(#${u}gl)"/><path d="M300 50 C300 18 140 28 110 120" fill="none" stroke="${line}" stroke-width="4" stroke-dasharray="7 9" stroke-linecap="round" class="evflow"/>` : ""}
        ${d.plugged ? `<path d="${cab}" fill="none" stroke="#0b0e12" stroke-width="8" stroke-linecap="round"/>${d.charging ? `<path d="${cab}" fill="none" stroke="#22e06b" stroke-width="12" opacity=".35" filter="url(#${u}gl)"/><path d="${cab}" fill="none" stroke="#86efac" stroke-width="2.4" stroke-dasharray="5 11" stroke-linecap="round" class="evflow"/>` : ""}` : ""}
        <g transform="translate(-66 22)">${car.svg}</g>${d.plugged ? `<g transform="rotate(-40 ${ex} ${ey})"><rect x="${ex - 15}" y="${ey - 6}" width="18" height="12" rx="4" fill="#14181e" stroke="#2c333c"/></g>` : ""}
      </g></svg>`;
  }
  _evBanner() {
    const d = this._evData(), N = this._evNow(d), tab = this._tmOn && this._tmOn();
    if (!d.any) return this._modHero("ev", { icon: "car", lbl: "Elektroauto & Wallbox", big: "–", sub: "Noch kein Fahrzeug eingerichtet" });
    const name = d.veh ? d.veh.name : this._evTitle(d.veh), away = this._evAway(d.veh);
    const line = !N.wbOn && !d.plugged ? (d.range != null ? `Reichweite ${num(d.range, 0)} km` : "Fahrzeug")
      : d.charging ? `Lädt${N.sun != null ? (N.sun >= 50 ? " mit Sonne" : " mit Netzstrom") : ""}${d.power != null ? " · " + num(d.power / 1000, 1) + " kW" : ""}${N.doneT ? " · fertig ca. " + N.doneT + " Uhr" : ""}`
      : d.plugged ? (N.soc != null && N.soc >= N.goal ? "Angesteckt · Ziel erreicht" : `Angesteckt · ${N.w.state === "wartet" ? "wartet auf Sonne" : N.w.state === "plan_wartet" ? "wartet auf das Ladefenster" : "lädt gerade nicht"}`) : away && !away.home ? `Unterwegs mit ${away.name}${away.zone ? " · " + away.zone : ""}` : away ? "Zu Hause · nicht angesteckt" : "Nicht angesteckt";
    const chips = tab ? [this._evPriceChip()].filter(Boolean) : [N.wbOn && N.c.enabled ? `<span class="chip"><i class="evdot"></i>Modus ${esc(N.modeN)}</span>` : N.wbOn ? `<span class="chip">Regelung aus</span>` : "",
      N.sun != null ? `<span class="chip">${this._gx("sun", 16, { on: 1 })}${num(N.sun, 0)} % Sonne</span>` : "", this._evPriceChip(), d.range != null ? `<span class="chip">Reichweite ${num(d.range, 0)} km</span>` : "",
      N.sn.guard && N.sn.guard.limited ? `<span class="chip">Hausanschluss ${num(N.sn.guard.total_a, 0)} von ${N.sn.guard.max_a} A</span>` : ""].filter(Boolean);
    return `<div class="card hero mh a-ev evban${N.night ? " nt" : ""}">${this._evCarport(d, N, 1180, 290, { sfx: "d", sx: 1180 - 640, s: 0.9 }).replace('class="evsc"', 'class="evsc evd"')}${this._evCarport(d, N, 420, 170, { sfx: "m", sx: 40, s: 0.52 }).replace('class="evsc"', 'class="evsc evm"')}${this._modLogo("ev")}
      <div class="evbt"><div class="lbl">${this._gx("car", 18)}${esc(name)}${N.card ? " · " + esc(N.card) : ""}</div>
        <div class="big">${N.soc != null ? (d.est ? "≈" : "") + num(N.soc, 0) + "<small>%</small>" : "–"}${N.soc != null && N.goal > N.soc + 0.5 ? `<span class="evto">→ ${N.goal} %</span>` : ""}</div>
        <div class="sub">${esc(line)}</div>${chips.length ? `<div class="chips">${chips.join("")}</div>` : ""}</div></div>`;
  }
  /* A2: ein Satz, was gerade passiert – mit den Hinweisen der bisherigen Statusleiste */
  _evSay(d) {
    const N = this._evNow(d), s = N.sn, H = (this._wbHints ? this._wbHints() : []).filter((n) => n[1] !== "wb");
    let ico = "sun", cls = "ok", t = "";
    if (!N.wbOn) { ico = "wallbox"; cls = "off"; t = "<b>Keine Wallbox verbunden.</b> Verbinde sie im Store – go-e direkt oder jede andere Wallbox über Home Assistant."; }
    else if (!s.ok) { ico = "wallbox"; cls = "bad"; t = "<b>Wallbox nicht erreichbar.</b> Prüfe Strom und WLAN der Wallbox."; }
    else if (!N.c.enabled) { ico = "wallbox"; cls = "off"; t = "<b>Regelung aus.</b> Die Wallbox lädt nach ihren eigenen Einstellungen."; }
    else if (d.charging) { const sun = N.sun != null && N.sun >= 50; ico = sun ? "sun" : "grid"; t = `<b>Alles läuft.</b> ${esc(d.veh ? d.veh.name : "Das Auto")} lädt ${sun ? "mit Sonne" : "mit Netzstrom"}.${N.doneT ? ` Bei gleicher Leistung ist das Ziel um ca. ${N.doneT} Uhr erreicht.` : ""}`; }
    else if (d.plugged) { ico = "schedule"; cls = "info"; t = `<b>${N.soc != null && N.soc >= N.goal ? "Ziel erreicht." : "Angesteckt."}</b> ${esc(N.w.reason || "")}`; }
    else { const aw = this._evAway(d.veh); ico = "car"; cls = "off"; t = aw && !aw.home ? `<b>${esc(d.veh.name)} ist unterwegs</b> mit ${esc(aw.name)}${aw.zone ? " (" + esc(aw.zone) + ")" : ""}. Beim Ankommen gilt der Ladeplan.` : `<b>Kein Auto angesteckt.</b>${N.dep ? ` Nächste Abfahrt ${esc(N.dep.time)} Uhr, Ziel ${N.dep.soc} %.` : ""}`; }
    if (N.wbOn && s.dimmed) H.unshift([`§ 14a: Der Netzbetreiber dimmt gerade – die Wallbox lädt höchstens mit ${num((N.c.dim || {}).kw || 4.2, 1)} kW.`]);
    if (N.wbOn && s.stale) H.unshift(["Der Netz-Sensor meldet seit Minuten keinen neuen Wert. Bis dahin wird mit Sonne nicht mehr erhöht.", "", ""]);
    return `<div class="evsay ${cls}">${this._gx(ico, 30, { on: cls === "ok" ? 1 : 0 })}<span>${t}</span></div>${H.map((n) => `<div class="gst on" style="margin:0 0 10px">${ic("info", 15)}<span>${n[0]}${n[1] ? ` <button class="lnk" data-act="wbgo" data-k="${n[1]}">${n[2]}</button>` : ""}</span></div>`).join("")}`;
  }
  /* A3: Ladeband jetzt → Ziel */
  _evBand(d) {
    const N = this._evNow(d);
    if (N.soc == null) return d.veh && this._admin() ? `<div class="card evband"><div class="mut sm">Ohne Ladestand gibt es kein Ladeband, kein Ladelimit und keinen Ladeplan. <button class="lnk" data-act="wbrvedit" data-v="${esc(d.veh.id)}">Sensor wählen oder Ladestand eingeben</button></div></div>` : "";
    const s = Math.max(0, Math.min(100, N.soc)), g = Math.max(s, Math.min(100, N.goal)), lim = Math.min(100, N.limit);
    return `<div class="card evband"><div class="evbb" role="img" aria-label="Ladestand ${num(s, 0)} %, Ziel ${N.goal} %"><i class="f" style="width:${s}%"></i>${g > s ? `<i class="g${d.charging ? " run" : ""}" style="left:${s}%;width:${g - s}%"></i>` : ""}
      <span class="mk${g > 88 ? " r" : g < 12 ? " l" : ""}" style="left:${g}%"><b>Ziel ${N.goal} %${N.dep ? " · " + esc(N.dep.time) : ""}</b></span>${lim > g + 2 ? `<span class="mk lm" style="left:${lim}%"></span>` : ""}</div>
      ${d.est ? `<div class="mut sm" style="margin:6px 0 -2px">Geschätzt${d.est.stale ? " – seit dem Abstecken unsicher" : ""}. <button class="lnk" data-act="wbrvedit" data-v="${esc(d.veh.id)}">Ladestand eingeben</button></div>` : ""}
      <div class="evbl"><span><b>${d.est ? "≈ " : ""}${num(s, 0)} %</b> jetzt${d.range != null ? " · " + num(d.range, 0) + " km" : ""}</span><span>${N.need > 0.05 ? `noch <b>${num(N.need, 1)} kWh</b>${N.doneT ? " · fertig ca. " + N.doneT : ""}` : "Ziel erreicht"}</span><span class="evbr">Limit ${N.limit} %</span></div></div>`;
  }
  /* A4: Kacheln 2.0 – kein Wert doppelt, HD-Symbole, Herkunfts-Ring an der Ladeleistung */
  _evTiles(d) {
    const N = this._evNow(d), T = (this._wbStD && this._wbStD.data) || null, td = ((n) => `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`)(new Date()), r = T && (T.days || []).find((x) => x.d === td);
    if (N.wbOn) this._wbStatLoad();
    const k = (img, l, v, u, sub, st) => `<div class="evk ${st || ""}"><span class="evkd"></span><div class="evkh">${img}<span>${l}</span></div><div class="evkv">${v}${u ? `<small>${u}</small>` : ""}</div><div class="evks">${sub}</div></div>`;
    const ses = N.i.session_wh != null ? N.i.session_wh / 1000 : null, kwh = r ? r.pv + r.grid : 0, sh = kwh > 0 ? r.pv / kwh * 100 : 0;
    const mix = d.charging && N.sun != null ? { pv: N.sun / 100, net: 1 - N.sun / 100 } : { pv: 0, net: 0 };
    return `<div class="evks4">
      ${k(this._gx("battery", 38, { lvl: N.soc != null ? Math.round(N.soc) : 0 }), "Ladestand", N.soc != null ? num(N.soc, 0) : "–", N.soc != null ? "%" : "", N.soc == null ? (d.veh && this._admin() ? `<button class="lnk" data-act="wbrvedit" data-v="${esc(d.veh.id)}">Ladestand eingeben</button>` : "kein Sensor") : d.est ? "geschätzt" + (N.dep ? ` · Ziel ${N.goal} %` : "") : N.dep ? `Ziel ${N.goal} % bis ${esc(N.dep.time)}` : `Limit ${N.limit} %`, N.soc != null && N.soc < 20 ? "warn" : d.charging ? "on" : "")}
      ${k(d.charging ? this._gxRing("wallbox", mix, 44) : this._gx("wallbox", 38), "Ladeleistung", d.charging && d.power != null ? num(d.power / 1000, 1) : "0", "kW", d.charging ? [N.i.phases ? `${N.i.phases} ${N.i.phases === 1 ? "Phase" : "Phasen"}` : "", N.i.cur != null ? num(N.i.cur, 0) + " A" : "", N.sun != null ? num(N.sun, 0) + " % Sonne" : ""].filter(Boolean).join(" · ") : N.w.surplus_w != null ? `Überschuss ${wfmt(N.w.surplus_w)}` : d.plugged ? "angesteckt" : "nicht angesteckt", d.charging ? "on" : "")}
      ${k(this._gx("bolt", 38), N.wbOn ? "Diese Ladung" : "Ladung", ses != null ? num(ses, 1) : "–", ses != null ? "kWh" : "", N.wbOn && r ? `heute ${num(kwh, 1)} kWh · ${num(sh, 0)} % Sonne · ${num(r.cost, 2)} €` : N.wbOn ? "heute noch nichts geladen" : "braucht eine Wallbox", d.charging ? "on" : "")}
      ${k(this._gx("car", 38), "Reichweite", d.range != null ? num(d.range, 0) : "–", d.range != null ? "km" : "", d.odo != null ? `${num(d.odo, 0)} km gesamt` : "kein Sensor", "")}</div>`;
  }
  /* A5: Modus-Karten mit Wirkung in einem Satz, dazu Regelung an/aus und Schnellstart */
  _evModes(d) {
    const N = this._evNow(d), c = N.c, adm = this._admin(), X = this._wbxParts();
    const M = [["off", "Aus", "plug", "Wallbox lädt nicht"], ["pv", "Sonne", "sun", "Nur mit Überschuss"], ["minpv", "Sonne + Netz", "grid", "Mindeststrom, mehr bei Sonne"], ["now", "Voll", "bolt", "Sofort mit voller Leistung"]];
    const who = N.who, wv = who && who.kind === "vehicle" ? who.name : who && who.kind === "guest" ? "das Gastfahrzeug" : "";
    return `<div class="card evmc"><h2>${this._gx("wallbox", 24)}Wie soll geladen werden?<span class="evmr">${esc(this._wbName())}</span></h2>
      <div class="vrow"><span>Laderegelung<small class="mut" style="display:block">${c.enabled ? "Strom &amp; Wärme steuert Start, Ladestrom und Phasen." : "Aus: Es wird nichts an der Wallbox verändert."}</small></span><button class="sw ${c.enabled ? "on" : ""}" data-act="wbsw" data-k="wbon" aria-pressed="${c.enabled}" aria-label="Laderegelung" ${adm ? "" : "disabled"}></button></div>
      <div class="evmodes">${M.map(([k, t, g, s]) => `<button class="evmode ${N.mode === k ? "sel" : ""}" data-act="wbmode" data-k="${k}" aria-pressed="${N.mode === k}" ${adm && !c.planOn && c.enabled ? "" : "disabled"}>${this._gx(g, 34, { on: N.mode === k ? 1 : 0 })}<span><b>${t}</b><small>${s}</small></span></button>`).join("")}</div>
      <div class="mut sm" style="margin:8px 0 0">${c.planOn ? "Die <b>Planung</b> steuert gerade die Wallbox (Register „Planung“)." : wv ? `Gilt für <b>${esc(wv)}</b>${N.card ? " (" + N.card + ")" : ""}.` : "Gilt, solange kein Fahrzeug erkannt ist."}${c.enabled && N.w.reason ? ` ${esc(N.w.reason)}` : ""}</div>
      ${c.enabled ? `<div class="lsec" style="margin-top:12px">${ic("energy", 15)}Schnellstart</div>${X.quick}<div class="mut sm" style="margin-top:6px">Auch ohne App: NFC-Tag an der Wallbox mit „1 Stunde voll“, „Heute nur Sonne“ oder „Stopp“ – Einstellungen → Haus → Tags &amp; Karten.</div>` : ""}</div>`;
  }
  /* A6: Heute als Zeitleiste – wann mit Sonne, wann mit Netz geladen wurde, was noch geplant ist */
  _evToday() {
    this._wbStatLoad(); this._wbFcLoad();
    const T = (this._wbStD && this._wbStD.data) || {}, F = (this._wbFcD && this._wbFcD.data) || {}, now = new Date(), d0 = new Date(now); d0.setHours(0, 0, 0, 0);
    const pos = (t) => Math.max(0, Math.min(100, (t - d0) / 864e5 * 100)), today = (iso) => new Date(iso).toDateString() === now.toDateString();
    const seg = (T.sessions || []).filter((x) => today(x.start)).map((x) => { const a = new Date(x.start), b = x.running ? now : new Date(a.getTime() + (x.min || 1) * 6e4), sh = x.kwh > 0 ? x.pv / x.kwh : 0; return `<i class="s" style="left:${pos(a)}%;width:${Math.max(.6, pos(b) - pos(a))}%;background:linear-gradient(90deg,var(--teal) ${sh * 100}%,var(--amber) ${sh * 100}%)" title="${num(x.kwh, 1)} kWh · ${num(sh * 100, 0)} % Sonne"></i>`; }).join("");
    const P = F.plan || {}, H = F.hours || [], SL = (F.slot_min || 60) / 60;
    const plan = (P.wins || []).map((w) => { const a = H[w.s] && new Date(H[w.s].t), b = a && new Date(a.getTime() + (w.e - w.s) * SL * 36e5); return a && a.toDateString() === now.toDateString() && b > now ? `<i class="p" style="left:${pos(Math.max(a, now))}%;width:${pos(b) - pos(Math.max(a, now))}%"></i>` : ""; }).join("");
    const td = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`, r = (T.days || []).find((x) => x.d === td), kwh = r ? r.pv + r.grid : 0;
    return `<div class="card evday"><h2>${this._gx("schedule", 24)}Heute<span class="evmr">${num(kwh, 1)} kWh${kwh > 0 ? ` · ${num(r.pv / kwh * 100, 0)} % Sonne · ${num(r.cost, 2)} €` : ""}</span></h2>
      <div class="evtl">${seg}${plan}<i class="n" style="left:${pos(now)}%"></i></div>
      <div class="evtx">${[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => `<span>${h}</span>`).join("")}</div>
      <div class="gsleg" style="margin-top:6px"><span><i style="background:var(--teal)"></i>Sonne</span><span><i style="background:var(--amber)"></i>Netz</span><span><i style="background:transparent;outline:1.5px dashed var(--teal)"></i>geplant</span></div></div>`;
  }
  /* A7: „Warum gerade so?“ – Entscheidungen mit Grund, wie die Zeitleiste in Modul 1 */
  _evWhy() {
    const L = (this._wbSnap().log || []).slice(0, this._wbLogAll ? 12 : 5);
    const col = (x) => /nicht erreichbar|fehlgeschlagen|abgelehnt/i.test(x) ? "var(--red,#f87171)" : /Hausanschluss|gedrosselt|von Hand/i.test(x) ? "var(--amber)" : /Karte|erkannt|Fahrzeug/i.test(x) ? "#60a5fa" : /Schnellstart/i.test(x) ? "#a78bfa" : "var(--teal)";
    const tm = (iso) => { const t = new Date(iso); return isFinite(t) ? t.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : ""; };
    const split = (x) => { const m = String(x || "").match(/^(.+?[.:])\s+(.+)$/); return m ? [m[1].replace(/[.:]$/, ""), m[2]] : [String(x || ""), ""]; };
    return `<div class="card evwhy"><h2>${this._gx("meter", 24)}Warum gerade so?</h2>${L.length ? `<div class="evwl">${L.map((e) => { const [a, b] = split(e.x); return `<div style="--c:${col(e.x)}"><time>${tm(e.t)}</time><i></i><span><b>${esc(a)}</b>${b ? `<small>${esc(b)}</small>` : ""}</span></div>`; }).join("")}</div>${(this._wbSnap().log || []).length > 5 ? `<button class="lnk" data-act="wblog">${this._wbLogAll ? "Weniger" : "Mehr anzeigen"}</button>` : ""}` : `<div class="mut sm">Noch keine Entscheidungen. Sobald die Regelung läuft, steht hier, was sie tut und warum.</div>`}</div>`;
  }
  /* Register (A10) und Seite in der neuen Optik */
  _evTabsNew() {
    const t = this._wbStT(), b = (k, l, g) => `<button class="${t === k ? "sel" : ""}" data-act="wbtab" data-k="${k}" aria-pressed="${t === k}">${this._gx(g, 20, { on: t === k ? 1 : 0 })}<span>${l}</span></button>`;
    return `<div class="evtabs" role="tablist">${b("laden", "Laden", "bolt")}${b("plan", "Planung", "schedule")}${b("stat", "Statistik", "meter")}${b("veh", "Fahrzeuge", "car")}${b("set", "Einstellungen", "wrench")}</div>`;
  }
  _evPageNew(d) {
    const wbOn = this._wbOn(), t = this._wbStT(), box = this._betaBox("Die Darstellung nutzt die Sensoren, die du in den Einstellungen wählst.");
    if (!wbOn) return `${box}${this._evSay(d)}${this._evBand(d)}${this._evTiles(d)}${this._wbCard(d)}`;
    const back = this._tmOn && this._tmOn() && this._evWallFull ? `<button class="btn2 evwback" data-act="wbwall" data-k="">${ic("home", 18)}Zur Wandansicht</button>` : "";
    const head = `${back}${box}${this._evTabsNew()}${this._evSay(d)}`;
    if (t === "plan") return `${head}${this._evPlanNew(d)}`;
    if (t === "stat") return `${head}${this._evStatNew()}`;
    if (t === "veh") return `${head}${this._rfCard(false)}`;
    if (t === "set") return `${head}${this._wbCard(d, "set")}`;
    return `${head}${this._evBand(d)}${this._evSurplus(d)}${this._evTiles(d)}<div class="evcols"><div>${this._evModes(d)}${this._evToday()}</div><div>${this._evWhy()}</div></div>`;
  }
