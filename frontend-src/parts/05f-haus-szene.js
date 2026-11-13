  /* ================= Modul 1 · Haus-Szene in der Kopfkarte (Konzept „Neue Optik“, Teil A1/A2) =================
     Das Haus zeigt die eigenen Räume im Schnitt, nach Etagen (Gruppen). Farbe = Zustand, Zahl = Ist-Temperatur.
     Offenes Fenster klappt auf, heizende Räume zeigen Wärmewellen. Im Keller die Wärmequelle nach Brennstoff
     (Öltank, Gastherme, Pellets, Wärmepumpe), auf dem Dach PV, wenn ein PV-Sensor gewählt ist.
     Himmel nach Tageszeit (sun.sun) und Wetter (Wetterquelle aus Haus-Werte / Darstellung).
     Antippen eines Raums springt zur Raumkarte. Einstellungen: layout.hs = { off, wx } (Darstellung). */
  _hsCfg() { const h = this._cfg.layout.hs || {}; return { on: this._rkOn() && !h.off, wx: h.wx !== false }; }
  /* Etagen aus den Gruppen: Namen mit Dach/OG oben, EG Mitte, Keller/UG unten; ohne Gruppen höchstens 4 Räume je Etage */
  _hsFloors(rooms) {
    const groups = (this._cfg.layout.groups || []).filter((g) => g && g.name), rank = (n, i) => {
      n = n.toLowerCase();
      return /dach|spitz/.test(n) ? 40 : /\bog\b|ober|1\. ?og|obergeschoss/.test(n) ? 30 : /\beg\b|erd|parterre/.test(n) ? 20 : /keller|\bug\b|\bkg\b|souterrain/.test(n) ? 10 : 25 - i * .01;
    };
    let floors;
    if (groups.length) {
      const used = new Set(groups.flatMap((g) => g.rooms || []));
      floors = groups.map((g, i) => ({ n: g.name, r: rooms.filter((x) => (g.rooms || []).includes(x.id)), k: rank(g.name, i) })).filter((f) => f.r.length);
      const rest = rooms.filter((x) => !used.has(x.id)); if (rest.length) floors.push({ n: "Weitere", r: rest, k: 15 });
      floors.sort((a, b) => b.k - a.k);
    } else {
      const per = rooms.length <= 4 ? 4 : rooms.length <= 6 ? 3 : 4; floors = [];
      for (let i = 0; i < rooms.length; i += per) floors.push({ n: "", r: rooms.slice(i, i + per) });
      floors.reverse();
    }
    return floors.slice(0, 3);
  }
  _hsSky() {
    const st = this._hass.states, sun = st["sun.sun"], o = this._out(), c = this._hsCfg();
    const elev = sun && sun.attributes.elevation != null ? Number(sun.attributes.elevation) : null, h = new Date().getHours();
    const night = sun ? sun.state === "below_horizon" : h < 7 || h >= 19, rising = sun ? !!sun.attributes.rising : h < 12;
    const tod = !c.wx ? "day" : night ? "night" : elev != null && elev < 8 ? (rising ? "morning" : "evening") : "day";
    const w = c.wx ? o.w || "" : "", frost = c.wx && o.t != null && o.t <= 0;
    return { tod, w, frost, snow: /snow|hail/.test(w) || (frost && /snow/.test(w)), rain: /rain|pouring|lightning/.test(w), cloud: /cloud|partly|fog|rain|pouring|snow|lightning/.test(w), fog: w === "fog", storm: /lightning|windy|exceptional/.test(w), t: o.t };
  }
  /* Himmel nach Tageszeit und Wetter (gemeinsam mit der Energie-Szene in Modul 3). Erwartet die Verläufe q("sk") und q("sun"). */
  _hsSkyDraw(sky, q) {
    const night = sky.tod === "night", grey = sky.cloud && !night;
    let d = `<rect width="360" height="200" fill="url(#${q("sk")})"/>`;
    d += this._hsAurora(sky);
    if (night) d += [[24, 18], [64, 40], [108, 12], [150, 30], [232, 14], [276, 54], [204, 42], [344, 70], [20, 70], [330, 12]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 ? .9 : 1.4}" fill="#fff" opacity="${i % 2 ? .6 : .95}"/>`).join("") +
      `<circle cx="320" cy="32" r="22" fill="#fef3c7" opacity=".12"/><circle cx="320" cy="32" r="11" fill="#fef3c7"/><circle cx="324" cy="28" r="10" fill="${grey ? "#93a7bf" : "#1b2750"}"/>`;
    else if (!grey || sky.w === "partlycloudy") { const sx = sky.tod === "morning" ? 34 : sky.tod === "evening" ? 326 : 314, sy = sky.tod === "day" ? 32 : 60;
      d += `<circle cx="${sx}" cy="${sy}" r="30" fill="url(#${q("sun")})"/><circle cx="${sx}" cy="${sy}" r="11" fill="#fde047"/>` + (sky.tod === "day" && !grey ? `<path d="M120 30 q3 -3 6 0 q3 -3 6 0 M140 22 q2.4 -2.4 4.8 0 q2.4 -2.4 4.8 0" fill="none" stroke="#334155" stroke-width="1.1" stroke-linecap="round" opacity=".6"/>` : ""); }
    const cloud = (x, y, sc, c = "#fff", o = .92) => `<g transform="translate(${x} ${y}) scale(${sc})" opacity="${o}"><ellipse cx="18" cy="14" rx="18" ry="9" fill="${c}"/><ellipse cx="34" cy="9" rx="14" ry="10" fill="${c}"/><ellipse cx="50" cy="15" rx="13" ry="8" fill="${c}"/><rect x="6" y="14" width="52" height="9" rx="4.5" fill="${c}"/></g>`;
    if (sky.cloud) d += `<g class="hscl">${cloud(30, 30, .9, night ? "#475569" : "#fff")}${cloud(196, 18, .7, night ? "#3f4b5e" : "#fff", .85)}${cloud(286, 50, .65, night ? "#475569" : "#f8fafc")}${grey ? cloud(110, 6, .8, "#cbd5e1", .9) : ""}</g>`;
    if (sky.rain) d += `<g class="hsrn">${Array.from({ length: 30 }, (_, i) => `<path d="M${(i * 37) % 360} ${(i * 23) % 130} l-3 9" stroke="#93c5fd" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>`).join("")}</g>`;
    if (sky.snow) d += `<g class="hssn">${Array.from({ length: 34 }, (_, i) => `<circle cx="${(i * 41) % 360}" cy="${(i * 29) % 150}" r="${i % 3 ? 1.5 : 2.2}" fill="#fff" opacity=".9"/>`).join("")}</g>`;
    return d;
  }
  /* Kleine Möbel-Silhouette je Raumtyp (unten im Raum), Breite ca. 24, Höhe ca. 14 */
  _hsFur(type, x, y, sc) {
    const P = {
      wohnen: `<rect x="0" y="-9" width="24" height="9" rx="3"/><rect x="2" y="-14" width="20" height="6" rx="3"/><rect x="-1" y="-11" width="4" height="11" rx="2"/><rect x="21" y="-11" width="4" height="11" rx="2"/>`,
      schlafen: `<rect x="0" y="-14" width="4" height="14" rx="1"/><rect x="0" y="-7" width="26" height="5" rx="2"/><rect x="5" y="-10" width="7" height="3" rx="1.5"/><rect x="24" y="-9" width="2" height="9"/>`,
      bad: `<path d="M0 -8 h26 v2 q0 6 -6 6 h-14 q-6 0 -6 -6z"/><path d="M22 -8 v-5 h-3" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
      kind: `<rect x="8" y="-9" width="18" height="6" rx="2"/><rect x="8" y="-3" width="2" height="3"/><rect x="24" y="-3" width="2" height="3"/><rect x="0" y="-6" width="5" height="6"/><rect x="1" y="-11" width="4" height="5"/>`,
      kueche: `<rect x="0" y="-10" width="26" height="10"/><rect x="-1" y="-11" width="28" height="2"/><path d="M8 -20 h10 l-2 5 h-6z"/>`,
      buero: `<rect x="0" y="-10" width="24" height="2"/><rect x="1" y="-8" width="2" height="8"/><rect x="21" y="-8" width="2" height="8"/><rect x="8" y="-18" width="11" height="7" rx="1"/><rect x="12" y="-11" width="3" height="1.5"/>`,
      flur: `<rect x="6" y="-20" width="18" height="20" rx="1"/><path d="M15 -20 v20" stroke="currentColor" stroke-width=".8" opacity=".5"/><circle cx="2" cy="-16" r="1.2"/><path d="M2 -15 l-2 8 h4z"/>`,
      esszimmer: `<rect x="2" y="-9" width="22" height="2"/><rect x="4" y="-7" width="2" height="7"/><rect x="20" y="-7" width="2" height="7"/><path d="M-2 -12 v12 M28 -12 v12" stroke="currentColor" stroke-width="1.6"/>`,
      wintergarten: `<path d="M8 0 h8 l-1 -6 h-6z"/><path d="M12 -6 q-8 -4 -7 -12 q5 4 7 12 q1 -10 7 -12 q1 8 -7 12"/>`,
      hwr: `<rect x="0" y="-14" width="12" height="14" rx="1.5"/><rect x="14" y="-14" width="12" height="14" rx="1.5"/><circle cx="6" cy="-6" r="3.5" fill="#fff" opacity=".35"/><circle cx="20" cy="-6" r="3.5" fill="#fff" opacity=".35"/>`,
      werkstatt: `<rect x="0" y="-10" width="26" height="2.5"/><rect x="1" y="-8" width="2" height="8"/><rect x="23" y="-8" width="2" height="8"/><rect x="16" y="-15" width="8" height="5" rx="1"/>`,
      fitness: `<rect x="4" y="-8" width="18" height="2.5"/><rect x="6" y="-6" width="2" height="6"/><rect x="18" y="-6" width="2" height="6"/><rect x="0" y="-13" width="26" height="1.6"/><rect x="0" y="-15" width="3" height="6"/><rect x="23" y="-15" width="3" height="6"/>`,
      dachboden: `<rect x="0" y="-8" width="10" height="8"/><rect x="11" y="-6" width="8" height="6"/><rect x="4" y="-14" width="8" height="6"/>`,
      garage: `<path d="M0 -4 q0 -4 4 -5 l4 -1 q3 -5 9 -5 h4 q4 0 7 5 l2 1 q2 1 2 4 v2 h-32z"/><circle cx="7" cy="-1" r="2.6"/><circle cx="24" cy="-1" r="2.6"/>`,
    };
    const p = P[type] || P[type === "carport" ? "garage" : "wohnen"];
    return `<g transform="translate(${x} ${y}) scale(${sc})" fill="currentColor">${p}</g>`;
  }
  _hsSvg(rooms) {
    const NR = this._narrow || (this.clientWidth || 999) < 600;
    const fl = this._hsFloors(rooms), sky = this._hsSky(), u = "hs" + (this.constructor._gxN = ((this.constructor._gxN || 0) + 1) % 1e6) + "_", q = (n) => u + n;
    const S = rooms.map((r) => ({ r, s: this._rkState(r) })), byId = Object.fromEntries(S.map((x) => [x.r.id, x.s]));
    const anyHeat = S.some((x) => x.s.heating), fset = new Set(rooms.map((r) => r.fuel || "erdgas")), fuel = fset.size === 1 ? [...fset][0] : "erdgas";
    const pvOn = this._pvNow() != null, pvW = pvOn ? this._pvNow() : 0, night = sky.tod === "night";
    const SK = this._hsSkyCols(sky.tod), HC = this._hsHouseCols(night);
    const grey = sky.cloud && !night, wh = sky.frost || sky.snow;
    const lg = (id, st, x2 = 0, y2 = 1) => `<linearGradient id="${q(id)}" x1="0" y1="0" x2="${x2}" y2="${y2}">${st.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ""}/>`).join("")}</linearGradient>`;
    let d = `<defs>${lg("sk", [[0, grey && !this._hsx().S.c ? "#93a7bf" : SK[0]], [1, grey && !this._hsx().S.c ? "#dde5ee" : SK[1]]])}${lg("rf", [[0, HC.roof[0]], [1, HC.roof[1]]])}${lg("rf2", [[0, "#000", .0], [1, "#000", .28]])}
      ${lg("wl", this._hsx().house === "klassisch" && night ? [[0, "#5b5146"], [1, "#433b33"]] : [[0, HC.wall[0]], [1, HC.wall[1]]], 1, 0)}${lg("hw", [[0, "#f97316", .9], [1, "#f97316", 0]], 0, 1)}
      ${lg("gr", night ? [[0, wh ? "#c7d0dc" : "#1c3a28"], [1, wh ? "#9aa6b5" : "#132a1c"]] : [[0, wh ? "#ffffff" : "#5fd27e"], [1, wh ? "#dfe7f0" : "#2f9e57"]])}
      ${lg("so", night ? [[0, "#2a211b"], [1, "#16110d"]] : [[0, "#7a5a40"], [1, "#4e3826"]])}${lg("kl", [[0, "#9ca3af"], [1, "#6b7280"]])}
      ${lg("gl", night ? [[0, "#fde68a"], [1, "#f59e0b"]] : [[0, "#e0f2fe"], [1, "#7dd3fc"]], .6, 1)}
      <radialGradient id="${q("sun")}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff7c2"/><stop offset=".55" stop-color="#fde68a"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></radialGradient>
      <pattern id="${q("tl")}" width="10" height="6" patternUnits="userSpaceOnUse"><path d="M0 5.5 h10 M5 0 v5.5" stroke="#5b1a17" stroke-width=".7" opacity=".55"/></pattern>
      <pattern id="${q("br")}" width="8" height="4" patternUnits="userSpaceOnUse"><path d="M0 3.6 h8 M4 0 v3.6" stroke="#5b1a17" stroke-width=".5" opacity=".6"/></pattern></defs>`;
    d += this._hsSkyDraw(sky, q);
    /* Garten: Baum, Büsche, Zaun, Laterne */
    const X0 = 76, X1 = 284, top = 72, bot = 160, n = Math.max(1, fl.length), fh = (bot - top) / n;
    d += `<rect x="-2" y="158" width="364" height="10" fill="url(#${q("gr")})"/>`;
    d += `<rect x="30" y="118" width="6" height="42" rx="2" fill="${night ? "#3b2a1c" : "#7c4a24"}"/>` + [[33, 104, 20], [22, 116, 14], [46, 114, 14], [33, 92, 13]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${wh ? (night ? "#9fb0c2" : "#e9eef5") : night ? "#1d4a2c" : "#2f9e57"}"/>`).join("") +
      (wh ? "" : `<circle cx="27" cy="100" r="6" fill="${night ? "#255a36" : "#4ade80"}" opacity=".7"/>`);
    d += [[60, 156, 9], [298, 156, 8], [312, 157, 6]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .7}" fill="${wh ? "#eef3f8" : night ? "#1d4a2c" : "#22a35a"}"/>`).join("");
    d += `<g opacity=".9">${[318, 330, 342, 354].map((x) => `<rect x="${x}" y="142" width="3" height="18" fill="${night ? "#64748b" : "#f8fafc"}"/>`).join("")}<rect x="314" y="146" width="46" height="2.4" fill="${night ? "#64748b" : "#f8fafc"}"/><rect x="314" y="153" width="46" height="2.4" fill="${night ? "#64748b" : "#f8fafc"}"/></g>`;
    d += `<rect x="302" y="122" width="2.4" height="38" fill="#334155"/><rect x="298" y="116" width="10" height="7" rx="2" fill="#334155"/><rect x="300" y="118" width="6" height="4" rx="1" fill="${night ? "#fde68a" : "#cbd5e1"}"/>${night ? `<circle cx="303" cy="120" r="12" fill="#fde68a" opacity=".22"/>` : ""}`;
    /* Erdreich mit Keller */
    d += `<rect y="166" width="360" height="34" fill="url(#${q("so")})"/>` + Array.from({ length: 16 }, (_, i) => `<ellipse cx="${(i * 53 + 11) % 360}" cy="${172 + (i * 7) % 24}" rx="${1.6 + (i % 3)}" ry="1.2" fill="#000" opacity=".18"/>`).join("");
    d += `<rect x="${X0 + 6}" y="166" width="${X1 - X0 - 12}" height="30" fill="url(#${q("kl")})"/><rect x="${X0 + 10}" y="168" width="${X1 - X0 - 20}" height="26" fill="${night ? "#2b3038" : "#d6d3cd"}"/><rect x="${X0 + 10}" y="190" width="${X1 - X0 - 20}" height="4" fill="#8b8680"/>`;
    /* Hauswand (Schnitt): außen Putz, Dämmung, Geschossdecken */
    d += `<rect x="${X0 - 6}" y="${top}" width="${X1 - X0 + 12}" height="${bot - top}" fill="url(#${q("wl")})"/><rect x="${X0 - 3}" y="${top}" width="3" height="${bot - top}" fill="#fde68a" opacity=".55"/><rect x="${X1}" y="${top}" width="3" height="${bot - top}" fill="#fde68a" opacity=".55"/>`;
    d += `<rect x="${X0 - 8}" y="${bot - 2}" width="${X1 - X0 + 16}" height="8" fill="#9ca3af"/>`;
    /* Dach: Ziegel, Traufe, Dachrinne, First, Dachfenster, Schornstein, PV */
    const RL = X0 - 22, RR = X1 + 22, RT = 16;
    d += `<path d="M${RL} ${top + 2} L180 ${RT} L${RR} ${top + 2} Z" fill="url(#${q("rf")})"/><path d="M${RL} ${top + 2} L180 ${RT} L${RR} ${top + 2} Z" fill="url(#${q("tl")})"/><path d="M180 ${RT} L${RR} ${top + 2} L180 ${top + 2}Z" fill="url(#${q("rf2")})"/>`;
    d += `<path d="M${RL - 2} ${top + 3} L180 ${RT - 2} L${RR + 2} ${top + 3}" fill="none" stroke="#4a1210" stroke-width="3" stroke-linejoin="round"/><rect x="${RL}" y="${top + 2}" width="${RR - RL}" height="4" fill="#3f3f46"/><rect x="${RL - 2}" y="${top + 5}" width="${RR - RL + 4}" height="2.4" rx="1.2" fill="#a1a1aa"/>`;
    if (wh) d += `<path d="M${RL + 2} ${top} L180 ${RT + 1} L${RR - 2} ${top} L${RR - 12} ${top - 3} L180 ${RT + 6} L${RL + 12} ${top - 3}Z" fill="#f8fafc"/>`;
    d += `<g transform="translate(128 46) rotate(${(-Math.atan2(top - RT, 180 - RL) * 180 / Math.PI).toFixed(1)})"><rect x="0" y="0" width="16" height="11" rx="1" fill="#475569"/><rect x="1.5" y="1.5" width="13" height="8" fill="url(#${q("gl")})"/></g>`;
    d += `<rect x="240" y="24" width="14" height="30" fill="#8b2b22"/><rect x="240" y="24" width="14" height="30" fill="url(#${q("br")})"/><rect x="238" y="21" width="18" height="4" rx="1" fill="#57534e"/>` +
      (anyHeat ? `<g class="hssm">${[0, 1, 2].map((i) => `<circle class="hssm${i}" cx="${247 + i * 3}" cy="${15 - i * 6}" r="${3.5 + i * 2}" fill="#e2e8f0" opacity=".55"/>`).join("")}</g>` : "");
    if (pvOn) {
      /* Solarfeld frontal auf der rechten Dachfläche (wie Startseite und Modul 3): unten 4, darüber 3 Module, links vom Schornstein */
      const glow = pvW > 50 && !night, w = 15.5, h = 9.5;
      const cells = [[186, 58.5], [203, 58.5], [220, 58.5], [237, 58.5], [177, 47.5], [194, 47.5], [211, 47.5]];
      const pan = (x, y) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx=".9" fill="${glow ? "#2563eb" : "#1e3a8a"}" stroke="${night ? "#64748b" : "#e2e8f0"}" stroke-width=".8"/><path d="M${x + w / 2} ${y} v${h} M${x} ${y + h / 2} h${w}" stroke="#93c5fd" stroke-width=".45" opacity=".7"/>` +
        (glow ? `<path d="M${x + 1.8} ${y + 1.8} h3.5" stroke="#fff" stroke-width="1.1" stroke-linecap="round" opacity=".7"/>` : "") + (wh ? `<rect x="${x - .4}" y="${y - .9}" width="${w + .8}" height="2.8" rx="1.3" fill="#f8fafc"/>` : "");
      d += `<g><rect x="184.6" y="57" width="69.4" height="12.5" rx="1.3" fill="#0f172a" opacity=".3"/><rect x="175.6" y="46" width="52.4" height="12.5" rx="1.3" fill="#0f172a" opacity=".3"/>${cells.map(([x, y]) => pan(x, y)).join("")}` +
        `${glow ? `<g class="hzpvg" opacity="0">${cells.map(([x, y]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx=".9" fill="#fff"/>`).join("")}</g>` : ""}</g>`;
    }

    /* Räume je Etage */
    fl.forEach((f, fi) => {
      const y = top + fi * fh, many = f.r.length > 6, cw = (X1 - X0) / f.r.length;
      f.r.forEach((r, i) => {
        const s = byId[r.id], x = X0 + i * cw, c = s.col, t = s.cur, fs = Math.min(NR ? 11.5 : 9.5, fh * .24, cw * .19), nm = this._hsName(r), avail = cw - 9;
        let fs2 = Math.min(NR ? 10 : 8.5, fh * .2, cw * .17); if (nm.length * fs2 * .57 > avail) fs2 = Math.max(NR ? 7 : 6.2, avail / (nm.length * .57));
        const mx = Math.max(3, Math.floor(avail / (fs2 * .57))), label = many ? "" : esc(nm.length > mx ? nm.slice(0, mx - 1) + "…" : nm), ty = r.id.startsWith("ms_") ? "mess" : this._rkType(r);
        d += `<g class="hsr" data-act="hsgo" data-id="${esc(r.id)}" style="cursor:pointer"><title>${esc(r.name)} · ${esc(s.lab)}${t != null ? " · " + num(t, 1) + " °C" : ""}</title>
          <rect x="${x + 1}" y="${y + 1}" width="${cw - 2}" height="${fh - 2}" fill="${night ? "#3a3f4a" : "#f6efe2"}"/><rect x="${x + 1}" y="${y + 1}" width="${cw - 2}" height="${fh - 2}" fill="${c}" opacity="${s.k === "aus" ? .14 : night ? .34 : .3}"/>
          <rect x="${x + 1}" y="${y + fh - 5}" width="${cw - 2}" height="3" fill="${night ? "#5b4636" : "#c8a27a"}"/>`;
        if (!many) {
          d += `<circle cx="${x + cw / 2}" cy="${y + 6}" r="${Math.min(9, cw * .2)}" fill="${c}" opacity="${s.k === "aus" ? 0 : .2}"/><path d="M${x + cw / 2} ${y + 1} v3" stroke="#64748b" stroke-width=".8"/><path d="M${x + cw / 2 - 3} ${y + 6} h6 l-1 -2 h-4z" fill="${s.k === "aus" ? "#94a3b8" : c}"/>`;
          d += `<g style="color:${night ? "#0f172a" : "#334155"}" opacity=".42">${this._hsFur(ty, x + cw - 6 - 26 * Math.min(1, fh / 34, cw / 46), y + fh - 5, Math.min(1, fh / 34, cw / 46))}</g>`;
          const wx = x + cw - 14, wy = y + fs2 + 8, op = s.open.length || s.tilt.length;
          d += `<rect x="${wx - 1}" y="${wy - 1}" width="12" height="15" rx="1" fill="#f8fafc"/><rect x="${wx}" y="${wy}" width="10" height="13" fill="url(#${q("gl")})"/><path d="M${wx + 5} ${wy} v13 M${wx} ${wy + 6.5} h10" stroke="#f8fafc" stroke-width=".9"/><rect x="${wx - 2}" y="${wy + 13}" width="14" height="2" rx="1" fill="#cbd5e1"/>` +
            (op ? `<path d="M${wx + 10} ${wy} l5 2 v11 l-5 1z" fill="#e0f2fe" stroke="#f8fafc" stroke-width="1"/><path class="hsaw" d="M${wx - 2} ${wy + 7} q-4 -3 -8 0 t-8 0" fill="none" stroke="#60a5fa" stroke-width="1.6" stroke-linecap="round"/>` : "");
          if (s.here) { const px = x + cw * .64, py = y + fh - 5, ps = Math.min(1.25, fh / 32); d += `<g transform="translate(${px} ${py}) scale(${ps})"><circle cx="0" cy="-17" r="3.8" fill="#fcd9b6" stroke="#fff" stroke-width=".8"/><path d="M-5.5 -2 q0 -10.5 5.5 -10.5 q5.5 0 5.5 10.5z" fill="${c}" stroke="#fff" stroke-width=".8"/><rect x="-4" y="-2" width="3" height="2" fill="#334155"/><rect x="1" y="-2" width="3" height="2" fill="#334155"/></g>`; }
          if (s.heating) d += `<g class="hshw">${[0, 1].map((k) => `<path class="hshw${k}" d="M${x + 6 + k * 6} ${y + fh - 7} q-2 -3 0 -6 q2 -3 0 -6" fill="none" stroke="url(#${q("hw")})" stroke-width="1.8" stroke-linecap="round"/>`).join("")}</g>`;
          const tt = t != null ? num(t, 1) + "°" : "–", pw = tt.length * fs * .58 + 7;
          d += `<text x="${x + 5}" y="${y + 6 + fs2 + 3}" font-size="${fs2}" font-weight="650" fill="${night ? "#e2e8f0" : "#1f2933"}" font-family="system-ui,sans-serif">${label}</text>` +
            `<rect x="${x + 4}" y="${y + fh - 9 - fs - 2}" width="${pw}" height="${fs + 5}" rx="${(fs + 5) / 2}" fill="#fff" opacity=".85"/><circle cx="${x + 4 + pw}" cy="${y + fh - 9 - fs / 2 + .5}" r="2.6" fill="${c}"/>` +
            `<text x="${x + 8}" y="${y + fh - 9.5}" font-size="${fs}" font-weight="750" fill="#0f172a" font-family="system-ui,sans-serif">${tt}</text>`;
        }
        d += `</g>`;
        if (i) d += `<rect x="${x - 1}" y="${y}" width="2" height="${fh}" fill="${night ? "#6b6258" : "#d8c9ae"}"/>`;
      });
      d += `<rect x="${X0 - 3}" y="${y + fh - 1.5}" width="${X1 - X0 + 6}" height="3" fill="#9ca3af"/>`;
    });
    if (!fl.length) d += `<text x="180" y="${(top + bot) / 2 + 4}" text-anchor="middle" font-size="11" fill="#64748b" font-family="system-ui,sans-serif">noch keine Räume</text>`;
    /* Keller: Wärmequelle und Leitungen */
    const kx = X0 + 18, ky = 172, on = anyHeat;
    const src = {
      heizoel: () => `<rect x="${kx}" y="${ky + 2}" width="40" height="18" rx="8" fill="#94a3b8"/><rect x="${kx + 4}" y="${ky + 5}" width="32" height="3" rx="1.5" fill="#cbd5e1"/><rect x="${kx + 6}" y="${ky + 11}" width="${28 * .6}" height="5" rx="2" fill="#a16207" opacity=".75"/><text x="${kx + 20}" y="${ky + 25}" text-anchor="middle" font-size="5.5" fill="#e5e7eb" font-family="system-ui,sans-serif">Öltank</text>`,
      pellets: () => `<path d="M${kx} ${ky + 1} h38 l-8 19 h-22z" fill="#a16207"/><text x="${kx + 19}" y="${ky + 12}" text-anchor="middle" font-size="5.5" fill="#fff" font-family="system-ui,sans-serif">Pellets</text>`,
      fluessiggas: () => `<rect x="${kx}" y="${ky + 4}" width="40" height="15" rx="7.5" fill="#e2e8f0"/><text x="${kx + 20}" y="${ky + 14}" text-anchor="middle" font-size="5.5" fill="#334155" font-family="system-ui,sans-serif">Gas</text>`,
      strom: () => `<rect x="${kx}" y="${ky + 1}" width="34" height="20" rx="3" fill="#e2e8f0"/><circle cx="${kx + 13}" cy="${ky + 11}" r="7" fill="#94a3b8"/><circle cx="${kx + 13}" cy="${ky + 11}" r="2.5" fill="#475569"/>`,
      erdgas: () => `<path d="M${kx + 4} ${ky + 20} v-8 h10" fill="none" stroke="#facc15" stroke-width="2"/><rect x="${kx}" y="${ky + 14}" width="10" height="7" rx="1" fill="#facc15"/>`,
    }[fuel] || (() => "");
    d += src() + `<rect x="${kx + 50}" y="${ky - 2}" width="22" height="24" rx="3" fill="#f1f5f9" stroke="#94a3b8" stroke-width=".6"/><rect x="${kx + 54}" y="${ky + 2}" width="14" height="5" rx="1" fill="#0f2a2e"/><circle cx="${kx + 57}" cy="${ky + 4.5}" r="1" fill="${on ? "#fb923c" : "#5eead4"}"/><circle cx="${kx + 61}" cy="${ky + 15}" r="4.5" fill="${on ? "#fb923c" : "#64748b"}"/>` +
      (on ? `<path class="hsfl" d="M${kx + 61} ${ky + 18} q-3 -4 0 -8 q3 4 0 8z" fill="#fde047"/>` : "");
    const pc = on ? "#fb923c" : "#94a3b8", px = X0 + 3.5;
    d += `<path d="M${kx + 72} ${ky + 4} H${X1 + 1} V${top + 4}" fill="none" stroke="${pc}" stroke-width="1.8" opacity=".9"/><path d="M${kx + 72} ${ky + 9} H${X1 + 3.5} V${top + 4}" fill="none" stroke="${on ? "#60a5fa" : "#94a3b8"}" stroke-width="1.4" opacity=".75"/>` +
      fl.map((f, fi) => `<path d="M${X1 + 1} ${top + fi * fh + fh - 8} h-5" stroke="${pc}" stroke-width="1.6"/>`).join("");
    return { svg: `<svg viewBox="${NR ? "46 6 268 194" : "0 0 360 200"}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Haus-Szene">${d}</svg>`, key: [NR ? "n" : "w", this._hsx().house, this._hsx().sky, JSON.stringify(this._cfg.layout.short || {}), sky.tod, sky.w, sky.frost ? 1 : 0, pvOn ? (pvW > 50 ? 2 : 1) : 0, fuel, anyHeat ? 1 : 0, this._rkCfg().anim, fl.map((f) => f.r.map((r) => { const s = byId[r.id]; return r.id + ":" + s.k + (s.cur != null ? num(s.cur, 1) : "") + (s.heating ? "h" : "") + (s.here ? "p" : "") + (s.open.length || s.tilt.length ? "o" : "") + this._rkType(r); }).join(",")).join("/")].join("|") };
  }
  /* Name in der Szene: eigener Kurzname, sonst ohne „-zimmer“/„-raum“ (Kinderzimmer → Kinder, Wohnzimmer → Wohnen) */
  _hsName(r) {
    const own = ((this._cfg.layout.short || {})[r.id] || "").trim(); if (own) return own;
    const n = String(r.name || "").trim(), lc = n.toLowerCase();
    const M = { wohnzimmer: "Wohnen", schlafzimmer: "Schlafen", kinderzimmer: "Kinder", badezimmer: "Bad", arbeitszimmer: "Arbeiten", esszimmer: "Essen", gästezimmer: "Gäste", ankleidezimmer: "Ankleide", hauswirtschaftsraum: "HWR", wohnküche: "Küche", spielzimmer: "Spielen", jugendzimmer: "Jugend" };
    if (M[lc]) return M[lc];
    if (n.length > 8) { const m = n.match(/^(.{3,}?)(zimmer|raum)$/i); if (m) return m[1].replace(/[-\s]$/, ""); }
    return n;
  }
  _hsScene(rooms) {
    if (!this._hsCfg().on) return "";
    const x = this._hsSvg(rooms);
    return `<div class="hs2" data-kk="${esc("hs|" + x.key)}" data-an="${this._rkCfg().anim}">${x.svg}</div>`;
  }
  _hsGo(id) {
    /* Achtung: „CSS“ ist hier unser Stylesheet (const CSS), nicht das CSS-Objekt des Browsers – daher window.CSS, mit Ersatz für ältere WebViews */
    const q = (window.CSS && typeof window.CSS.escape === "function") ? window.CSS.escape(id) : String(id).replace(/["\\]/g, "\\$&");
    const sr = this.shadowRoot, el = sr.querySelector(`.room[data-id="${q}"], .crow[data-id="${q}"]`);
    if (!el) { const g = (this._cfg.layout.groups || []).find((x) => (x.rooms || []).includes(id)), c = this._collapsed(); if (g && c.has(g.id)) { c.delete(g.id); this._setCollapsed(c); this._render(); setTimeout(() => this._hsGo(id), 60); } return; }
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.remove("hsflash"); void el.offsetWidth; el.classList.add("hsflash");
  }
  _hsLook() {
    if (!this._rkOn()) return "";
    const c = this._hsCfg(), h = this._cfg.layout.hs || {};
    return `<div class="lsec">${ic("home", 15)}Kopfkarte in Modul 1</div>
      <div class="ltog"><span>Haus-Szene<small class="mut" style="display:block">Deine Räume im Haus-Schnitt nach Etagen (Gruppen). Aus: das Modul-Logo wie bisher.</small></span><button class="sw ${!h.off ? "on" : ""}" data-act="hsoff" aria-pressed="${!h.off}" aria-label="Haus-Szene"></button></div>
      ${!h.off ? `<div class="ltog"><span>Tageszeit und Wetter<small class="mut" style="display:block">Himmel nach Sonnenstand und Wetterquelle, Schnee bei Frost.</small></span><button class="sw ${c.wx ? "on" : ""}" data-act="hswx" aria-pressed="${c.wx}" aria-label="Tageszeit und Wetter"></button></div>${this._hsxLook()}` : ""}`;
  }
  _hsAct(a, b) {
    const L = this._cfg.layout;
    if (a === "hsgo") { this._hsGo(b.dataset.id); return true; }
    if (this._hsxAct(a, b)) return true;
    if (a === "hsoff") L.hs = { ...(L.hs || {}), off: !(L.hs || {}).off };
    else if (a === "hswx") L.hs = { ...(L.hs || {}), wx: !this._hsCfg().wx };
    else return false;
    this._saveLayout(); this._render(); this._renderModal(); return true;
  }
