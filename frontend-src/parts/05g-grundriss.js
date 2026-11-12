  /* ================= Modul 1 · Grundriss als Wärmekarte (Konzept „Neue Optik“, Teil E1 mit W3) =================
     Dritte Ansicht neben Kompakt und Detail. Der Grundriss kommt aus dem Baukasten von Modul 11 (einmal gezeichnet,
     in Modul 1 und 11 genutzt). Räume als Fläche nach Temperaturskala, Fenster als hellblaue Striche (offen = aufgeklappt),
     Heizkörper als Balken (orange = heizt), Hinweis-Plaketten (W3) für Batterie, offline, Frost, Schimmel, Raumsensor.
     Zuordnung Grundriss-Raum → Modul-1-Raum automatisch über den Namen, sonst von Hand (layout.gmap = { Plan-ID: Raum-ID }). */
  /* Grundriss aus Modul 11 laden. Bisher nur ein einziges Mal: War Home Assistant beim ersten Abruf noch nicht fertig gestartet
     (Modul 11 startet spät) oder wurde der Grundriss danach – auch auf einem anderen Gerät – gezeichnet, blieb Modul 1 bei
     „Noch kein Grundriss“, bis der Browser neu geladen wurde. Jetzt: nach einem Fehler nach 10 s erneut, sonst jede Minute im Hintergrund. */
  _gpPlan() {
    const D = this._sfxD, err = !!(D && D.d && D.d.error), age = D ? Date.now() - D.ts : Infinity;
    if (this._hass && !this._gpBusy && !this._sfxBusy && (!D || (err && age > 10000) || age > 60000)) {
      this._gpBusy = true;
      this._hass.callWS({ type: "fenster_heizung/sf_get" }).then((r) => { this._sfxD = { d: r || {}, ts: Date.now() }; }).catch(() => { this._sfxD = { d: { ...((this._sfxD && !this._sfxD.d.error && this._sfxD.d) || {}), error: true }, ts: Date.now() }; })
        .finally(() => { this._gpBusy = false; if (this._mdActive() === "fh" && this._view && this._view() === "plan") this._render(); });
    }
    if (!D) return null;
    return D.d && D.d.cfg ? this._sfx().cfg.plan : err ? { error: true } : this._sfx().cfg.plan;
  }
  _gpNorm(s) { return String(s || "").toLowerCase().replace(/zimmer|raum|[^a-zäöüß0-9]/g, ""); }
  /* Plan-Raum → Modul-1-Raum */
  _gpMatch(item, rooms) {
    const gm = this._cfg.layout.gmap || {};
    if (gm[item.id] === "-") return null;
    if (gm[item.id]) return rooms.find((r) => r.id === gm[item.id]) || null;
    const n = this._gpNorm(item.n); if (!n) return null;
    return rooms.find((r) => this._gpNorm(r.name) === n) || rooms.find((r) => { const m = this._gpNorm(r.name); return m.length > 2 && (m.includes(n) || n.includes(m)); }) || null;
  }
  _gpView(rooms) {
    const P = this._gpPlan(), adm = this._admin();
    if (!P) return `<div class="card gpc"><div class="mut sm">Grundriss wird geladen …</div></div>`;
    if (P.error) return `<div class="card gpc gpempty">${this._gpEmptyArt()}<b>Grundriss gerade nicht erreichbar</b><span>Modul 11 antwortet noch nicht – meist direkt nach einem Neustart von Home Assistant. Es wird gleich von selbst erneut versucht.</span></div>`;
    const any = (P.items || []).some((i) => i.t === "r");
    if (!any && (P.items || []).some((i) => i.t === "w")) {
      return `<div class="card gpc gpempty">${this._gpEmptyArt()}<b>Im Grundriss sind noch keine Räume</b><span>Der Grundriss aus Modul 11 besteht bisher nur aus Wänden. Modul 1 färbt <b>Räume</b>: Zeichne sie im Baukasten mit dem Werkzeug „Raum“ über die Wände und gib ihnen einen Namen – dann erscheinen sie hier mit Temperatur.</span>
        ${adm && this._mdList().some((m) => m.id === "sf") ? `<button class="btn2 pri" data-act="gpedit">${ic("pencil", 16)} Räume einzeichnen</button>` : ""}</div>`;
    }
    if (!any) {
      const sf = this._mdList().some((m) => m.id === "sf");
      return `<div class="card gpc gpempty">${this._gpEmptyArt()}<b>Noch kein Grundriss</b><span>Den Grundriss zeichnest du einmal mit dem Baukasten aus Modul 11 (Rauch- &amp; Sicherheitsmelder): Räume, Wände, Türen und Fenster. Modul 1 färbt die Räume dann nach Temperatur.</span>
        ${adm ? (sf ? `<button class="btn2 pri" data-act="gpedit">${ic("pencil", 16)} Grundriss zeichnen</button>` : `<span class="mut sm">Schalte dafür unter Einstellungen → Module das Modul 11 ein.</span>`) : ""}</div>`;
    }
    const fls = P.floors || [], fl = fls.some((f) => f.id === this._gpFl) ? this._gpFl : (fls.find((f) => (P.items || []).some((i) => i.fl === f.id && i.t === "r")) || fls[0]).id;
    const items = P.items.filter((i) => i.fl === fl), rs = items.filter((i) => i.t === "r" || i.t === "s");
    const S = Object.fromEntries(rooms.map((r) => [r.id, this._rkState(r)])), temps = rooms.flatMap((r) => S[r.id].pts.map((p) => p.t)), lo = temps.length ? Math.min(...temps) : 17, hi = temps.length ? Math.max(...temps) : 21;
    const inside = (r, x, y, tol = 8) => x >= r.x - tol && x <= r.x + r.w + tol && y >= r.y - tol && y <= r.y + r.h + tol;
    const an = this._rkCfg().anim, u = "gp" + (this.constructor._gxN = ((this.constructor._gxN || 0) + 1) % 1e6) + "_";
    /* Neue Optik (2026.11.3b8): Räume als dunkle Kacheln mit Licht in der Temperaturfarbe, Status-Plakette wie in der Detail-Ansicht,
       HD-Heizkörper mit Wärme, Fenster mit Glas, Punktraster als Bauplan-Hintergrund. */
    const NF = this._narrow || (this.clientWidth || 999) < 600 ? 1.7 : 1, gap = 3;
    let d = `<defs><pattern id="${u}un" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v10" stroke="var(--line)" stroke-width="3"/></pattern>
      <pattern id="${u}dot" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.1" fill="var(--primary-text-color)" opacity=".13"/></pattern>
      <linearGradient id="${u}hw" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f97316" stop-opacity=".9"/><stop offset="1" stop-color="#f97316" stop-opacity="0"/></linearGradient>
      <filter id="${u}sh" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity=".35"/></filter></defs>
      <rect x="-2000" y="-2000" width="5000" height="5000" fill="url(#${u}dot)"/>`;
    if (P.bg && P.bg[fl]) d += `<image href="${P.bg[fl]}" x="0" y="0" width="800" height="480" preserveAspectRatio="xMidYMid meet" opacity=".25"></image>`;
    /* Räume: Kachel, Licht, Rand, Heizkörper */
    const label = [];
    rs.forEach((i, ix) => {
      const r = i.t === "r" ? this._gpMatch(i, rooms) : null, s = r ? S[r.id] : null, col = s ? (s.k === "aus" ? "#64748b" : this._rkCol(s.cur, lo, hi)) : null;
      const x = i.x + gap, y = i.y + gap, w = Math.max(4, i.w - 2 * gap), h = Math.max(4, i.h - 2 * gap), rx = Math.min(14, w / 6, h / 6), gid = `${u}r${ix}`;
      d += `<g class="gpr${r ? " on" : ""}${s ? " k-" + s.k : ""}" ${r ? `data-act="rkmenu" data-id="${esc(r.id)}"` : adm && i.t === "r" ? `data-act="gpmap" data-k="${esc(i.id)}"` : ""}><title>${esc(i.n || "Raum")}${s ? " · " + esc(s.lab) : r ? "" : " · nicht zugeordnet"}</title>`;
      if (s) {
        d += `<radialGradient id="${gid}" cx="0" cy="0" r="1.25" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="${col}" stop-opacity="${s.k === "aus" ? .18 : .62}"/><stop offset=".65" stop-color="${col}" stop-opacity="${s.k === "aus" ? .06 : .2}"/><stop offset="1" stop-color="${col}" stop-opacity=".08"/></radialGradient>
          <rect class="gpbase" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" filter="url(#${u}sh)"/>
          <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#${gid})"/>
          <rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" rx="${rx - 1}" fill="none" stroke="${col}" stroke-width="2" stroke-opacity=".85"/>`;
        if (s.heating) d += `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" rx="${rx - 1}" fill="none" stroke="#fb923c" stroke-width="5" stroke-opacity=".28" class="gpglow"/>`;
        if (s.t0 && i.t === "r" && w > 70 && h > 60) {
          const rs2 = Math.min(40 * NF, w * .26, h * .34), gx2 = x + w - rs2 - 8, gy2 = y + h - rs2 - 6;
          d += this._gx("radiator", rs2, { on: s.heating }).replace('<svg class="gx" ', `<svg class="gx gprad${s.heating ? " hot" : ""}" x="${gx2.toFixed(1)}" y="${gy2.toFixed(1)}" `);
          if (s.heating) d += `<g class="gphw">${[0, 1, 2].map((k) => `<path class="gphw${k}" d="M${(gx2 + rs2 * (.25 + k * .25)).toFixed(1)} ${(gy2 + rs2 * .2).toFixed(1)} q-3 -5 0 -10 q3 -5 0 -10" fill="none" stroke="url(#${u}hw)" stroke-width="2.6" stroke-linecap="round"/>`).join("")}</g>`;
        }
      } else d += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" class="gpbase un"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#${u}un)" opacity=".7"/>
          <rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" rx="${rx - 1}" fill="none" stroke="var(--line)" stroke-width="2" stroke-dasharray="6 5"/>`;
      d += `</g>`;
      label.push({ i, r, s, x, y, w, h });
    });
    /* Wände, Türen, Fenster (so viele Fenster eines Raums offen gezeichnet, wie Kontakte offen melden) */
    const used = new Map();
    items.forEach((i) => {
      const a = i.r ? ` transform="rotate(${i.r} ${i.x} ${i.y})"` : "";
      if (i.t === "w") d += `<path d="M${i.x} ${i.y}L${i.x2} ${i.y2}" class="gpw"/>`;
      else if (i.t === "d") d += `<g${a} class="gpdo"><rect x="${i.x - 15}" y="${i.y - 4}" width="30" height="8" rx="2" class="gpgapr"/><path d="M${i.x - 15} ${i.y}a15 15 0 0 1 15 -15" fill="none" stroke-width="1.5" stroke-dasharray="3 3"/><path d="M${i.x - 15} ${i.y}v-15" stroke-width="2" stroke-linecap="round"/></g>`;
      else if (i.t === "f") {
        const lr = label.find((x) => x.s && x.i.t === "r" && inside(x.i, i.x, i.y)), k0 = lr ? used.get(lr.i.id) || 0 : 0;
        if (lr) used.set(lr.i.id, k0 + 1);
        const op = lr && k0 < lr.s.open.length + lr.s.tilt.length, full = op && lr.s.open.length;
        d += `<g${a} class="gpfe${op ? " op" : ""}">${op ? `<rect x="${i.x - 22}" y="${i.y - 9}" width="44" height="18" rx="9" fill="#3b82f6" opacity=".25" class="gpaw"/>` : ""}
          <rect x="${i.x - 17}" y="${i.y - 4}" width="34" height="8" rx="2.5" fill="${op ? "#3b82f6" : "#bfdbfe"}" stroke="${op ? "#1d4ed8" : "#60a5fa"}" stroke-width="1.2"/><path d="M${i.x} ${i.y - 3}v6" stroke="${op ? "#dbeafe" : "#60a5fa"}" stroke-width="1.2"/>
          ${op ? `<path d="M${i.x - 17} ${i.y - 4} l${full ? 24 : 9} -${full ? 13 : 8}" stroke="#60a5fa" stroke-width="3.2" stroke-linecap="round"/>` : ""}</g>`;
      } else if (i.t === "x") d += `<text x="${i.x}" y="${i.y}" class="gptx">${esc(i.n || "")}</text>`;
    });
    /* Beschriftung, Status-Plakette und Hinweis-Plaketten (W3) */
    label.forEach(({ i, r, s, x, y, w, h }) => {
      const big = Math.min(30 * NF, h * .3, w * .24), small = Math.min(13.5 * NF, Math.max(10, big * .48), w * .095), pad = Math.max(8, Math.min(14, w * .05));
      d += `<g class="gplb" pointer-events="none"><text x="${x + pad}" y="${y + pad + small}" font-size="${small}" class="gpn">${esc(i.n || (r ? r.name : ""))}</text>`;
      if (s) {
        const ty = y + pad + small + 6 + big;
        d += `<text x="${x + pad}" y="${ty}" font-size="${big}" class="gpt">${s.cur != null ? num(s.cur, 1) + "°" : "–"}</text>`;
        if (s.ziel != null && h > big + small * 3.2) d += `<text x="${x + pad}" y="${ty + small * 1.35}" font-size="${small * .9}" class="gpz">Ziel ${num(s.ziel, 1)}°${s.hum != null && w > 150 ? ` · ${num(s.hum, 0)} %` : ""}</text>`;
        /* Status-Plakette unten links (wie die Plakette der Raumkarte), in schmalen Räumen nur der Punkt */
        const fz = small * .86, pw = s.lab.length * fz * .54 + fz * 2.2, ph = fz * 1.9, room = w - pad * 2 - (s.t0 && w > 70 && h > 60 ? Math.min(40 * NF, w * .26, h * .34) + 6 : 0);
        const zb = ty + (s.ziel != null && h > big + small * 3.2 ? small * 1.35 : 0) + 6, py = y + h - ph - pad * .8, px = x + pad, nb = this._gpBadges(r, s).length;
        if (py >= zb && pw <= room) d += `<g class="gppl"><rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="${ph / 2}"/><circle cx="${px + fz * .95}" cy="${py + ph / 2}" r="${fz * .34}" fill="${s.col}"/><text x="${px + fz * 1.6}" y="${py + ph / 2 + fz * .36}" font-size="${fz}">${esc(s.lab)}</text></g>`;
        else if (py >= zb) d += `<circle cx="${px + fz * .5}" cy="${py + ph / 2}" r="${fz * .42}" fill="${s.col}" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>`;
        else if (!nb) d += `<circle cx="${x + w - pad - fz * .4}" cy="${y + pad + small * .62}" r="${fz * .42}" fill="${s.col}" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>`;   /* zu flach: Punkt oben rechts */
        if (s.here) { const ps = Math.min(30 * NF, w * .2), px = x + w - ps - 8; d += `<g transform="translate(${(px + ps / 2).toFixed(1)} ${(y + h / 2).toFixed(1)})"><circle r="${(ps / 2).toFixed(1)}" fill="${s.col}" opacity=".95"/><circle cy="${(-ps * .13).toFixed(1)}" r="${(ps * .15).toFixed(1)}" fill="#fff"/><path d="M${(-ps * .24).toFixed(1)} ${(ps * .27).toFixed(1)} q0 -${(ps * .27).toFixed(1)} ${(ps * .24).toFixed(1)} -${(ps * .27).toFixed(1)} q${(ps * .24).toFixed(1)} 0 ${(ps * .24).toFixed(1)} ${(ps * .27).toFixed(1)}z" fill="#fff"/></g>`; }
        const b = this._gpBadges(r, s);
        b.forEach((q, k) => { const fz2 = 11 * NF, bw = q.t.length * fz2 * .56 + fz2 * 1.8, bx = x + w - bw - 8, by = y + 8 + k * (fz2 * 2); d += `<g><rect x="${bx}" y="${by}" width="${bw}" height="${fz2 * 1.65}" rx="${fz2 * .82}" fill="${q.c}"/><text x="${bx + fz2 * .9}" y="${by + fz2 * 1.18}" font-size="${fz2}" font-weight="700" fill="#fff">${esc(q.t)}</text></g>`; });
      } else if (i.t === "r") d += `<text x="${x + pad}" y="${y + pad + small * 2.4}" font-size="${small * .9}" class="gps">${adm ? "Antippen zum Zuordnen" : "nicht zugeordnet"}</text>`;
      d += `</g>`;
    });
    /* Kopfzeile: kurze Zusammenfassung des Stockwerks */
    const mine = label.filter((x) => x.s), tv = mine.map((x) => x.s.cur).filter((t) => t != null), nOpen = mine.filter((x) => x.s.anyOpen).length, nHeat = mine.filter((x) => x.s.heating).length, nHere = mine.filter((x) => x.s.here).length;
    const sum = `<div class="gpsum"><span>${ic("thermo", 14)}Ø <b>${tv.length ? num(tv.reduce((a, t) => a + t, 0) / tv.length, 1) + " °C" : "–"}</b></span>
      <span class="${nHeat ? "h" : ""}">${ic("flame", 14)}<b>${nHeat}</b> ${nHeat === 1 ? "heizt" : "heizen"}</span><span class="${nOpen ? "o" : ""}">${ic("windowOpen", 14)}<b>${nOpen}</b> Fenster offen</span>${rooms.some((r) => r.pres) ? `<span>${ic("user", 14)}<b>${nHere}</b> mit jemandem</span>` : ""}
      ${label.some((x) => x.i.t === "r" && !x.r) ? `<span class="u">${label.filter((x) => x.i.t === "r" && !x.r).length} nicht zugeordnet</span>` : ""}</div>`;
    const sc = [lo - 3, lo, (lo + hi) / 2, hi, hi + 2];
    const legend = `<div class="gplg"><span class="gpsc"><i style="background:linear-gradient(90deg,${sc.map((t) => this._rkCol(t, lo, hi)).join(",")})"></i><small>${num(lo - 3, 0)} °C</small><small>${num(hi + 2, 0)} °C</small></span>
      <span><i class="gpk" style="background:#bfdbfe;border:1px solid #60a5fa"></i>Fenster</span><span><i class="gpk" style="background:#3b82f6"></i>offen</span><span><i class="gpk" style="background:#fb923c"></i>heizt</span><span><i class="gpk un"></i>nicht zugeordnet</span>${rooms.some((r) => r.pres) ? `<span><i class="gpk" style="width:10px;height:10px;border-radius:50%;background:var(--teal)"></i>jemand da</span>` : ""}</div>`;
    const bar = fls.length > 1 ? `<span class="sffl">${fls.map((f) => `<button class="${f.id === fl ? "on" : ""}" data-act="gpfl" data-k="${esc(f.id)}">${esc(f.n)}</button>`).join("")}</span>` : "";
    const B = rs.length ? rs.reduce((a, i) => ({ x0: Math.min(a.x0, i.x), y0: Math.min(a.y0, i.y), x1: Math.max(a.x1, i.x + i.w), y1: Math.max(a.y1, i.y + i.h) }), { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 }) : { x0: 0, y0: 0, x1: 800, y1: 480 };
    const vb = `${B.x0 - 20} ${B.y0 - 20} ${B.x1 - B.x0 + 40} ${B.y1 - B.y0 + 40}`;
    return `<div class="card gpc"><h2>${ic("home", 18)}Grundriss<span class="sfhr">${bar}${adm && this._mdList().some((m) => m.id === "sf") ? `<button class="sfed" data-act="gpedit">${ic("pencil", 14)} Bearbeiten</button>` : ""}</span></h2>
      ${sum}<div class="gpv" data-an="${an}"><svg viewBox="${vb}" role="img" aria-label="Grundriss mit Raumtemperaturen">${d}</svg></div>${legend}
      <div class="mut sm gpnote">Antippen eines Raums öffnet seine Aktionen. Gezeichnet wird der Grundriss in Modul 11 und dort auch für die Melder genutzt.</div></div>`;
  }
  /* W3: Plaketten je Raum (höchstens zwei) */
  _gpBadges(r, s) {
    const out = [], a = this._airData(r);
    if (s.cur != null && s.cur < 8) out.push({ t: "Frost", c: "#dc2626" });
    if (a && a.lvl === 2) out.push({ t: "Schimmel", c: "#dc2626" });
    for (const e of r.thermos || []) { const i = this._vInfo(e); if (i.lvl === "ok") continue; const l = ((i.lines[0] || [])[1]) || ""; out.push({ t: /Batterie/.test(l) ? "Batterie" : /Nicht erreichbar/.test(l) ? "offline" : "Ventil", c: i.lvl === "bad" ? "#dc2626" : "#d97706" }); break; }
    for (const e of r.windows || []) { const i = this._wInfo(e); if (i.lvl === "ok") continue; const l = ((i.lines[0] || [])[1]) || ""; out.push({ t: /Batterie/.test(l) ? "Kontakt-Batterie" : "Kontakt", c: i.lvl === "bad" ? "#dc2626" : "#d97706" }); break; }
    if (s.rt.fail || s.rt.missing) out.push({ t: "Raumsensor", c: "#d97706" });
    return out.slice(0, 2);
  }
  _gpEmptyArt() {
    return `<svg viewBox="0 0 220 120" width="220" height="120" aria-hidden="true"><rect x="10" y="10" width="200" height="100" rx="6" fill="none" stroke="var(--line)" stroke-width="4"/><path d="M110 10v60M10 70h140" stroke="var(--line)" stroke-width="4"/>
      <rect x="16" y="16" width="90" height="50" rx="3" fill="#2dd4bf" opacity=".35"/><rect x="114" y="16" width="90" height="88" rx="3" fill="#fb923c" opacity=".35"/><rect x="16" y="74" width="90" height="30" rx="3" fill="#60a5fa" opacity=".35"/>
      <rect x="40" y="6" width="34" height="7" fill="#93c5fd"/><rect x="150" y="6" width="34" height="7" fill="#93c5fd"/><rect x="140" y="92" width="40" height="6" rx="3" fill="#fb923c"/></svg>`;
  }
  _gpMapModal(m) {
    const P = this._gpPlan(), it = P && P.items.find((i) => i.id === m.k); if (!it) return "";
    const rooms = this._collect(true), cur = (this._cfg.layout.gmap || {})[it.id] || "";
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Raum zuordnen</b><span>Grundriss: ${esc(it.n || "ohne Namen")}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="mut sm" style="margin:0 0 10px">Welcher Raum aus Modul 1 liegt hier? Danach färbt sich die Fläche nach seiner Temperatur.</div>
      <div class="lftiles">${rooms.map((r) => `<button class="lftile ${cur === r.id ? "sel" : ""}" data-act="gpset" data-k="${esc(it.id)}" data-id="${esc(r.id)}">${this._rkMiniById(r.id, "lft")}<b>${esc(r.name)}</b></button>`).join("")}</div>
      <div class="foot2"><button class="btn2" data-act="gpset" data-k="${esc(it.id)}" data-id="-">Kein Raum aus Modul 1</button>${cur ? `<button class="btn2" data-act="gpset" data-k="${esc(it.id)}" data-id="">Automatisch</button>` : ""}<button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _gpAct(a, b) {
    if (a === "gpfl") { this._gpFl = b.dataset.k; this._render(); return true; }
    if (a === "gpmap") { this._modal = { type: "gpmap", k: b.dataset.k }; this._renderModal(); return true; }
    if (a === "gpset") { const g = { ...(this._cfg.layout.gmap || {}) }; if (b.dataset.id) g[b.dataset.k] = b.dataset.id; else delete g[b.dataset.k]; this._cfg.layout.gmap = g; this._saveLayout(); this._modal = null; this._renderModal(); this._render(); return true; }
    if (a === "gpedit") { this._modal = null; this._renderModal(); this._sfT = "pl"; this._mdActiveSet("sf"); this._sfxLoad(true); setTimeout(() => { if (this._sfxD && this._sfxD.d && this._sfxD.d.cfg) this._act("sfxedit", b); }, 400); this._render(); return true; }
    return false;
  }
