  /* ================= Modul 1 · Grundriss als Wärmekarte (Konzept „Neue Optik“, Teil E1 mit W3) =================
     Dritte Ansicht neben Kompakt und Detail. Der Grundriss kommt aus dem Baukasten von Modul 11 (einmal gezeichnet,
     in Modul 1 und 11 genutzt). Räume als Fläche nach Temperaturskala, Fenster als hellblaue Striche (offen = aufgeklappt),
     Heizkörper als Balken (orange = heizt), Hinweis-Plaketten (W3) für Batterie, offline, Frost, Schimmel, Raumsensor.
     Zuordnung Grundriss-Raum → Modul-1-Raum automatisch über den Namen, sonst von Hand (layout.gmap = { Plan-ID: Raum-ID }). */
  _gpPlan() {
    if (!this._sfxD && !this._gpBusy && this._hass) {
      this._gpBusy = true;
      this._hass.callWS({ type: "fenster_heizung/sf_get" }).then((r) => { this._sfxD = { d: r || {}, ts: Date.now() }; }).catch(() => { this._sfxD = { d: { error: true }, ts: Date.now() }; }).finally(() => { this._gpBusy = false; this._render(); });
    }
    return this._sfxD ? this._sfx().cfg.plan : null;
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
    const any = (P.items || []).some((i) => i.t === "r");
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
    let d = `<defs><pattern id="${u}un" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v10" stroke="var(--line)" stroke-width="3"/></pattern>
      <linearGradient id="${u}hw" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f97316" stop-opacity=".9"/><stop offset="1" stop-color="#f97316" stop-opacity="0"/></linearGradient></defs>`;
    if (P.bg && P.bg[fl]) d += `<image href="${P.bg[fl]}" x="0" y="0" width="800" height="480" preserveAspectRatio="xMidYMid meet" opacity=".25"></image>`;
    /* Räume: Fläche, Heizkörper, Text */
    const label = [];
    rs.forEach((i) => {
      const r = i.t === "r" ? this._gpMatch(i, rooms) : null, s = r ? S[r.id] : null, col = s ? this._rkCol(s.cur, lo, hi) : null;
      const fill = s ? (s.k === "aus" ? "color-mix(in srgb,var(--primary-text-color) 8%,transparent)" : col) : `url(#${u}un)`;
      d += `<g class="gpr${r ? " on" : ""}" ${r ? `data-act="rkmenu" data-id="${esc(r.id)}"` : adm && i.t === "r" ? `data-act="gpmap" data-k="${esc(i.id)}"` : ""}><title>${esc(i.n || "Raum")}${s ? " · " + esc(s.lab) : r ? "" : " · nicht zugeordnet"}</title>
        <rect x="${i.x}" y="${i.y}" width="${i.w}" height="${i.h}" rx="3" style="fill:${fill}" opacity="${s ? (s.k === "aus" ? 1 : .72) : 1}"/>
        ${s && s.k !== "aus" ? `<rect x="${i.x}" y="${i.y}" width="${i.w}" height="${i.h}" rx="3" fill="none" stroke="${s.col}" stroke-width="3" opacity=".9"/>` : ""}`;
      if (s && s.t0 && i.t === "r") {
        const bw = Math.min(70, i.w * .45), bx = i.x + i.w - bw - 14, by = i.y + i.h - 14, heat = s.heating;
        d += `<rect x="${bx}" y="${by}" width="${bw}" height="6" rx="3" fill="${heat ? "#fb923c" : s.k === "pause" ? "#f59e0b" : "#94a3b8"}"/>` +
          (heat ? `<g class="gphw">${[0, 1, 2].map((k) => `<path class="gphw${k}" d="M${bx + bw * (.2 + k * .3)} ${by - 2} q-3 -4 0 -8 q3 -4 0 -8" fill="none" stroke="url(#${u}hw)" stroke-width="2.4" stroke-linecap="round"/>`).join("")}</g>` : "");
      }
      d += `</g>`;
      label.push({ i, r, s });
    });
    /* Wände, Türen, Fenster (so viele Fenster eines Raums offen gezeichnet, wie Kontakte offen melden) */
    const used = new Map();
    items.forEach((i) => {
      const a = i.r ? ` transform="rotate(${i.r} ${i.x} ${i.y})"` : "";
      if (i.t === "w") d += `<path d="M${i.x} ${i.y}L${i.x2} ${i.y2}" class="gpw"/>`;
      else if (i.t === "d") d += `<g${a}><rect x="${i.x - 15}" y="${i.y - 3.5}" width="30" height="7" style="fill:var(--card)"/><path d="M${i.x - 15} ${i.y}a15 15 0 0 1 15 -15" fill="none" style="stroke:var(--mut)" stroke-width="1.5"/></g>`;
      else if (i.t === "f") {
        const lr = label.find((x) => x.s && x.i.t === "r" && inside(x.i, i.x, i.y)), k0 = lr ? used.get(lr.i.id) || 0 : 0;
        if (lr) used.set(lr.i.id, k0 + 1);
        const op = lr && k0 < lr.s.open.length + lr.s.tilt.length;
        d += `<g${a}><rect x="${i.x - 17}" y="${i.y - 3.5}" width="34" height="7" fill="${op ? "#3b82f6" : "#93c5fd"}"/>${op ? `<path d="M${i.x - 17} ${i.y - 3.5} l${lr.s.open.length ? 26 : 8} -${lr.s.open.length ? 14 : 8}" stroke="#3b82f6" stroke-width="3" stroke-linecap="round"/><g class="gpaw"><path d="M${i.x - 8} ${i.y + 10} q6 4 12 0 t12 0" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round"/></g>` : ""}</g>`;
      } else if (i.t === "x") d += `<text x="${i.x}" y="${i.y}" class="gptx">${esc(i.n || "")}</text>`;
    });
    /* Beschriftung und Plaketten (W3) */
    label.forEach(({ i, r, s }) => {
      const NF = this._narrow || (this.clientWidth || 999) < 600 ? 1.7 : 1, big = Math.min(26 * NF, i.h * .3, i.w * .22), small = Math.min(13 * NF, Math.max(10, big * .5), i.w * .09);
      d += `<g class="gplb" pointer-events="none"><text x="${i.x + 10}" y="${i.y + 10 + small}" font-size="${small}" class="gpn">${esc(i.n || (r ? r.name : ""))}</text>`;
      if (s) {
        d += `<text x="${i.x + 10}" y="${i.y + 14 + small + big}" font-size="${big}" class="gpt">${s.cur != null ? num(s.cur, 1) + "°" : "–"}</text>` +
          `<text x="${i.x + 10}" y="${i.y + 20 + small + big + small}" font-size="${small * .92}" class="gps" style="fill:${s.col}">${esc(s.lab)}</text>`;
        if (s.here) { const px = i.x + i.w - 34, py = i.y + i.h - 40; d += `<g transform="translate(${px} ${py})"><circle cx="0" cy="0" r="14" fill="${s.col}" opacity=".9"/><circle cx="0" cy="-4" r="4" fill="#fff"/><path d="M-7 8 q0 -8 7 -8 q7 0 7 8z" fill="#fff"/></g>`; }
        const b = this._gpBadges(r, s);
        b.forEach((x, k) => { const fz = 11 * NF, w = x.t.length * fz * .56 + fz * 2, bx = i.x + i.w - w - 6, by = i.y + 6 + k * (fz * 2); d += `<g><rect x="${bx}" y="${by}" width="${w}" height="${fz * 1.65}" rx="${fz * .82}" fill="${x.c}"/><text x="${bx + fz * .8}" y="${by + fz * 1.2}" font-size="${fz}" font-weight="700" fill="#fff">${esc(x.t)}</text></g>`; });
      } else if (i.t === "r") d += `<text x="${i.x + 10}" y="${i.y + 16 + small * 2}" font-size="${small * .9}" class="gps">${adm ? "Antippen zum Zuordnen" : "nicht zugeordnet"}</text>`;
      d += `</g>`;
    });
    const sc = [lo - 3, lo, (lo + hi) / 2, hi, hi + 2];
    const legend = `<div class="gplg"><span class="gpsc"><i style="background:linear-gradient(90deg,${sc.map((t) => this._rkCol(t, lo, hi)).join(",")})"></i><small>${num(lo - 3, 0)} °C</small><small>${num(hi + 2, 0)} °C</small></span>
      <span><i class="gpk" style="background:#93c5fd"></i>Fenster</span><span><i class="gpk" style="background:#3b82f6"></i>offen</span><span><i class="gpk" style="background:#fb923c"></i>Heizkörper heizt</span><span><i class="gpk un"></i>nicht zugeordnet</span>${rooms.some((r) => r.pres) ? `<span><i class="gpk" style="width:10px;height:10px;border-radius:50%;background:var(--teal)"></i>jemand da</span>` : ""}</div>`;
    const bar = fls.length > 1 ? `<span class="sffl">${fls.map((f) => `<button class="${f.id === fl ? "on" : ""}" data-act="gpfl" data-k="${esc(f.id)}">${esc(f.n)}</button>`).join("")}</span>` : "";
    const B = rs.length ? rs.reduce((a, i) => ({ x0: Math.min(a.x0, i.x), y0: Math.min(a.y0, i.y), x1: Math.max(a.x1, i.x + i.w), y1: Math.max(a.y1, i.y + i.h) }), { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 }) : { x0: 0, y0: 0, x1: 800, y1: 480 };
    const vb = `${B.x0 - 20} ${B.y0 - 20} ${B.x1 - B.x0 + 40} ${B.y1 - B.y0 + 40}`;
    return `<div class="card gpc"><h2>${ic("home", 18)}Grundriss<span class="sfhr">${bar}${adm && this._mdList().some((m) => m.id === "sf") ? `<button class="sfed" data-act="gpedit">${ic("pencil", 14)} Bearbeiten</button>` : ""}</span></h2>
      <div class="gpv" data-an="${an}"><svg viewBox="${vb}" role="img" aria-label="Grundriss mit Raumtemperaturen">${d}</svg></div>${legend}
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
