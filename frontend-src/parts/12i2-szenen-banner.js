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
