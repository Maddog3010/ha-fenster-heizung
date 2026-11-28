  /* ================= Modul 0 · Handy-Ansicht (2026.11.4.1, Vorschlag D) =================
     Build 2: Status-Leiste je Raum. Auf dem Handy stehen Temperatur, Geräte (mit Zustand), Melder und Lampen nicht mehr frei
     verstreut im Raum, sondern in einer Leiste oben im Raum: links die Temperatur, rechts die Symbole. Schmale Räume bekommen
     eine zweite Zeile. Raumname und Fläche suchen sich darunter einen freien Platz (siehe _grLabels).
     Build 4: Sonderfälle – passt die Leiste nicht, werden die Symbole zu Punkten; sind es zu viele, endet die Leiste mit „+2“.
     Antippen des Raums öffnet wie bisher das Raum-Blatt mit allen Werten. Alle Größen in Bildschirm-Pixeln (upx = Plan-Einheiten je Pixel). */
  _grStrip(P, fl, rs, items, o, T, vb) {
    const S = o.strip || {}, upx = Math.max(vb.w / Math.max(200, S.pw || 340), vb.h / Math.max(200, S.ph || 520)), st = this._hass.states, hell = o.style === "hell" || o.style === "karte";
    const L = o.layers || {}, skip = new Set(), boxes = [];
    const inRoom = (r, x, y) => (this._sfInRoom ? this._sfInRoom(r, x, y) : x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h);
    const kinds = new Map(rs.map((r) => [r.id, this._grKind(r)])), order = rs.filter((r) => !(kinds.get(r.id).k === "aussen" || r.ds)).concat(rs.filter((r) => kinds.get(r.id).k === "aussen" || r.ds));
    const roomOf = (x, y) => order.find((r) => inRoom(r, x, y)) || null;
    const per = new Map(rs.map((r) => [r.id, []])), add = (r, e) => { if (r) per.get(r.id).push(e); };
    /* Temperatur aus Modul 1 */
    let all = []; try { all = this._gpAll ? this._gpAll(this._collect ? this._collect(true) : []) : []; } catch (_) { all = []; }
    if (o.now) rs.forEach((r) => { const m = this._gpMatch ? this._gpMatch(r, all) : null, s = m && !m.ms && this._rkState ? this._rkState(m) : null; if (s && s.cur != null) add(r, { k: "t", s, name: m.name, o: 0 }); });
    /* Geräte (mit Zustand), Melder, Lampen */
    if (L.gt && this._grDevList) { const D = this._grDevList(); (P.items || []).filter((i) => i.t === "g").forEach((i) => { const p = this._grDevPos(i, P, D); if (p.fl !== fl) return; const r = roomOf(p.x, p.y); if (r) add(r, { k: "g", i, inf: p.inf, moved: p.moved, o: 1 }); }); }
    if (L.sf) items.filter((i) => i.t === "m").forEach((i) => add(roomOf(i.x, i.y), { k: "m", i, o: 2 }));
    if (L.licht) items.filter((i) => i.t === "l" && i.e).forEach((i) => add(roomOf(i.x, i.y), { k: "l", i, o: 3 }));
    const H = 16 * upx, G = 3 * upx, FS = 10.5 * upx, tw = (t, f) => [...String(t)].length * f * 0.6;
    const devTxt = (e) => (e.inf ? String(e.inf.txt || (e.inf.on ? "an" : "aus")) : "offline").slice(0, 12);
    /* Breite je Element und Stufe: 0 = normal, 1 = Temperatur kompakt, 2 = Symbole als Punkte, 3 = auch die Temperatur als Farbpunkt */
    const wOf = (e, lv) => {
      if (e.k === "t" && lv >= 3) return 8 * upx;
      if (e.k === "t") return lv ? tw(`${num(e.s.cur, 1)}°`, FS * 0.9) + 8 * upx : tw(`${num(e.s.cur, 1)}°`, FS) + 17 * upx;
      if (e.k === "more") return tw(`+${e.n}`, FS * 0.9) + 10 * upx;
      if (lv >= 2) return 8 * upx;
      if (e.k === "g") return H + tw(devTxt(e), 9.5 * upx) + 9 * upx;
      return H;
    };
    let svg = "";
    rs.forEach((r) => {
      const els = per.get(r.id).sort((a, b) => a.o - b.o); if (!els.length) return;
      const pad = 8 + 3 * upx, maxH = Math.max(H, Math.min(r.h - 2 * pad - 16 * upx, 2 * H + G));   /* darunter bleibt Platz für den Namen */
      /* Packen: Zeile 1 = Temperatur links, Symbole rechts; weitere Zeilen links. Gibt null zurück, wenn es nicht passt. */
      const pack = (aw, lv, rowsMax, over) => {
        const rows = [[]]; let x = 0;
        for (let n = 0; n < els.length; n++) {
          const e = els[n], w = wOf(e, lv);
          if (w > aw) return null;
          if (x && x + G + w > aw) { if (rows.length >= rowsMax) { if (!over) return null; const rest = els.length - n, last = rows[rows.length - 1]; let more = { k: "more", n: rest }; while (last.length > (last[0] && last[0].e.k === "t" ? 1 : 0) && last.reduce((a, q) => a + q.w + G, 0) + wOf(more, lv) > aw) { last.pop(); more = { k: "more", n: more.n + 1 }; } last.push({ e: more, w: wOf(more, lv) }); break; } rows.push([]); x = 0; }
          rows[rows.length - 1].push({ e, w }); x += (x ? G : 0) + w;
        }
        const h = rows.length * (lv >= 2 ? 10 * upx : H) + (rows.length - 1) * G; return h <= maxH + 0.1 ? { rows, h, lv } : null;
      };
      let lay = null, ox = 0, oy = 0;
      for (const f of [1, 0.8, 0.62]) {
        const aw = (r.w - 2 * pad) * f; if (aw < 10 * upx) continue;
        lay = pack(aw, 0, 2, false) || pack(aw, 1, 2, false) || pack(aw, 0, 2, true) || pack(aw, 1, 2, true) || pack(aw, 2, 2, true) || pack(aw, 2, 1, true) || pack(aw, 3, 2, true) || pack(aw, 3, 1, true);
        if (!lay) continue;
        if (lay.lv === 3 && f < 1) { lay = null; continue; }
        const wid = Math.max(...lay.rows.map((rw) => rw.reduce((a, q) => a + q.w, 0) + G * (rw.length - 1))), ok = (x, y) => [[x, y], [x + wid, y], [x, y + lay.h], [x + wid, y + lay.h], [x + wid / 2, y + lay.h / 2]].every((p) => inRoom(r, p[0], p[1]));
        let hit = null; for (let dy = 0; dy <= r.h / 2 && !hit; dy += 6 * upx) for (let dx = 0; dx <= r.w - wid - 2 * pad && !hit; dx += 6 * upx) if (ok(r.x + pad + dx, r.y + pad + dy)) hit = [r.x + pad + dx, r.y + pad + dy];
        if (hit) { [ox, oy] = hit; lay.aw = Math.min(aw, r.x + r.w - pad - ox); lay.wid = wid; break; }
        lay = null;
      }
      if (!lay) return;   /* passt gar nicht: Symbole bleiben an ihrer Stelle im Plan */
      const rh = lay.lv >= 2 ? 10 * upx : H;
      lay.rows.forEach((rw, ri) => {
        const y = oy + ri * (rh + G), first = ri === 0 && rw[0] && rw[0].e.k === "t";
        let x = ox, tail = first ? ox + lay.aw - rw.slice(1).reduce((a, q) => a + q.w, 0) - G * Math.max(0, rw.length - 2) : 0;
        rw.forEach((q, n) => {
          let px = x; if (first && n > 0) { px = tail; tail += q.w + G; } else x += q.w + G;
          svg += this._grStripEl(q.e, px, y, q.w, rh, lay.lv, upx, T, hell, st);
          if (q.e.i) skip.add(q.e.i);
        });
      });
      boxes.push([ox, oy, ox + Math.max(lay.wid, lay.rows[0] && lay.rows[0][0] && lay.rows[0][0].e.k === "t" && lay.rows[0].length > 1 ? lay.aw : 0), oy + lay.h]);
      els.forEach((e) => { if (e.i) skip.add(e.i); });   /* auch die unter „+2“ zusammengefassten */
    });
    return { svg: `<g pointer-events="none" class="grstrip">${svg}</g>`, boxes, skip, upx };
  }
  /* Ein Element der Status-Leiste: Temperatur, Gerät mit Zustand, Melder, Lampe, „+2“ – kompakt (lv) als Punkt */
  _grStripEl(e, x, y, w, h, lv, upx, T, hell, st) {
    const bg = hell ? "#ffffff" : "#0b1220", cy = y + h / 2;
    if (e.k === "t") {
      const s = e.s, t = `${num(s.cur, 1)}°`, col = s.k === "aus" ? "#64748b" : this._rkCol(s.cur, 17, 22), fs = (lv ? 9.5 : 10.5) * upx;
      if (lv >= 3) return `<g><title>${esc(e.name)} · ${t}</title><circle cx="${x + w / 2}" cy="${cy}" r="${3.8 * upx}" fill="${col}" stroke="#fff" stroke-width="${0.8 * upx}"/></g>`;   /* sehr kleiner Raum: Temperatur als Farbpunkt, Wert im Raum-Blatt */
      return `<g><title>${esc(e.name)} · ${t}${s.ziel != null ? ` · Ziel ${num(s.ziel, 1)}°` : ""}${s.heating ? " · heizt" : ""}</title><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${col}"${s.heating ? ` stroke="#fb923c" stroke-width="${1.6 * upx}"` : ""}/>${lv ? "" : `<circle cx="${x + 7 * upx}" cy="${cy}" r="${2.4 * upx}" fill="#fff" opacity=".85"/>`}<text x="${lv ? x + w / 2 : x + 12 * upx}" y="${cy + fs * 0.36}" font-size="${fs}" font-weight="800" fill="#111"${lv ? ' text-anchor="middle"' : ""}>${t}</text></g>`;
    }
    if (e.k === "more") { const fs = 9.5 * upx; return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${bg}" stroke="${T.sub}" stroke-width="${upx}"/><text x="${x + w / 2}" y="${cy + fs * 0.36}" text-anchor="middle" font-size="${fs}" font-weight="800" fill="${T.text}">+${e.n}</text></g>`; }
    if (e.k === "m") {
      const al = !!(e.i.e && st[e.i.e] && st[e.i.e].state === "on"), c = al ? "#ef4444" : "#f87171", ttl = `<title>${esc(e.i.e ? this._wzName(e.i.e) : "Melder")}${al ? " · Alarm" : ""}</title>`;
      if (lv >= 2) return `<g>${ttl}<circle cx="${x + w / 2}" cy="${cy}" r="${3.5 * upx}" fill="${c}"/></g>`;
      return `<g>${ttl}<circle cx="${x + h / 2}" cy="${cy}" r="${h / 2 - 0.8 * upx}" fill="${al ? "#7f1d1d" : hell ? "#fff" : "#111827"}" stroke="${c}" stroke-width="${1.5 * upx}"/><g transform="translate(${x + h / 2 - 5.5 * upx} ${cy - 5.5 * upx}) scale(${(11 * upx) / 24})" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${ICONS.shield}</g></g>`;
    }
    if (e.k === "l") {
      const s2 = st[e.i.e], on = !!(s2 && s2.state === "on"), c = on && this._liLampHex ? this._liLampHex(e.i.e) : "#64748b", ttl = `<title>${esc(this._wzName(e.i.e))} · ${on ? "an" : s2 && s2.state === "unavailable" ? "offline" : "aus"}</title>`;
      if (lv >= 2) return `<g>${ttl}<circle cx="${x + w / 2}" cy="${cy}" r="${3.5 * upx}" fill="${c}"/></g>`;
      return `<g>${ttl}${on ? `<circle cx="${x + h / 2}" cy="${cy}" r="${h / 2}" fill="${c}" opacity=".3"/>` : ""}<circle cx="${x + h / 2}" cy="${cy}" r="${h * 0.3}" fill="${c}" stroke="${on ? "#fff" : T.sub}" stroke-width="${1.2 * upx}"/></g>`;
    }
    /* Gerät: Symbol + Zustand („läuft“, „800 W“, „aus“) */
    const ent = e.i.gk === "entf", c = ent ? "#38bdf8" : "#f97316", on = !!(e.inf && e.inf.on), txt = e.inf ? String(e.inf.txt || (on ? "an" : "aus")).slice(0, 12) : "offline";
    const ttl = `<title>${ent ? "Luftentfeuchter" : "Heizer"}${e.inf ? ` · ${esc(e.inf.name)}` : ""} · ${esc(txt)}${e.moved ? " · Standort aus Modul 1" : ""}</title>`;
    if (lv >= 2) return `<g>${ttl}<circle cx="${x + w / 2}" cy="${cy}" r="${3.5 * upx}" fill="${on ? c : "none"}" stroke="${c}" stroke-width="${1.4 * upx}"/></g>`;
    const ix = x + h / 2, k = upx * 0.95;
    const icon = ent ? `<path d="M${ix} ${cy - 5.5 * k}c${2.6 * k} ${3.4 * k} ${4 * k} ${5 * k} ${4 * k} ${7 * k}a${4 * k} ${4 * k} 0 0 1 ${-8 * k} 0c0 ${-2 * k} ${1.4 * k} ${-3.6 * k} ${4 * k} ${-7 * k}z" fill="${on ? c : "none"}" stroke="${c}" stroke-width="${1.3 * upx}"/>`
      : `<path d="M${ix - 4 * k} ${cy + 4 * k}V${cy - 4 * k}M${ix - 1.3 * k} ${cy + 4 * k}V${cy - 4 * k}M${ix + 1.3 * k} ${cy + 4 * k}V${cy - 4 * k}M${ix + 4 * k} ${cy + 4 * k}V${cy - 4 * k}M${ix - 5.2 * k} ${cy + 4 * k}H${ix + 5.2 * k}" stroke="${c}" stroke-width="${1.4 * upx}" stroke-linecap="round"/>`;
    const fs = 9.5 * upx;
    return `<g>${ttl}<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${5 * upx}" fill="${bg}" stroke="${c}" stroke-width="${(on ? 1.6 : 1) * upx}"${e.moved ? ` stroke-dasharray="${3 * upx} ${2 * upx}"` : ""}/>${icon}<text x="${x + h + 1 * upx}" y="${cy + fs * 0.36}" font-size="${fs}" font-weight="700" fill="${on ? c : T.sub}">${esc(txt)}</text></g>`;
  }
