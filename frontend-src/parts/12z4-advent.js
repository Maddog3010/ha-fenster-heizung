  /* ================= Adventskalender (Weihnachts-Theme Build 2) =================
     Varianten A (Raster, 24 Türchen) und B (Kranz, kompakt), Türchen öffnen, nachholen, Rückblick, Inhalte mit echten Werten,
     Schneefall. Stand und Inhalte kommen vom Backend (fenster_heizung/advent_get), Werte füllt das Dashboard selbst ein. */
  static ADV_ORDER = [7, 15, 2, 21, 11, 4, 18, 1, 13, 9, 22, 6, 16, 3, 20, 10, 14, 19, 5, 12, 17, 23, 8];
  async _advLoad() { try { this._advD = await this._hass.callWS({ type: "fenster_heizung/advent_get" }); } catch (_) { this._advD = null; } }
  _advCfg() { return { variante: "A", stand: "gemeinsam", schnee: "aus", farbset: "klassisch", kerzen: true, notify: { on: false, zeit: "07:00", dienst: "" }, ...((this._advD && this._advD.cfg) || {}) }; }
  /* Build 3: Stufe (mit Tagesschlüssel) und was davon erlaubt ist */
  _advTier() { const s = this._spnS ? this._spnS() : null; return s && s.active ? (s.tier || "sponsor") : ""; }
  _advEff() {
    const c = this._advCfg(), t = this._advTier(), sp = t === "sponsor" || t === "max", mx = t === "max";
    return { ...c, variante: c.variante === "C" && !sp ? "A" : c.variante === "D" && !mx ? "A" : c.variante,
      schnee: ["mittel", "stark"].includes(c.schnee) && !sp ? "leicht" : c.schnee, farbset: c.farbset !== "klassisch" && !sp ? "klassisch" : (c.farbset || "klassisch") };
  }
  _advOn() { const d = this._advD; return !!(d && d.sichtbar && d.haben_inhalt && this._saiCfg().modus !== "aus"); }
  _advToday() { const d = this._advD; return d ? (d.tueren || []).find((t) => t.st === "heute") : null; }
  /* Werte aus dem eigenen System; null = nicht vorhanden → Türchen zeigt den normalen Text */
  _advTk(tk) { for (const [eid, e] of Object.entries(this._hass.entities || {})) if (e.platform === "fenster_heizung" && e.translation_key === tk && this._hass.states[eid]) return eid; return null; }
  _advSrc(n) {
    const st = this._hass.states; let R = []; try { R = this._collect0(); } catch (_) { R = []; }
    const fv = (e) => { const v = e && st[e] ? parseFloat(st[e].state) : NaN; return isFinite(v) ? v : null; };
    if (n === "heiz_monat" || n === "heiz_jahr") {
      const sc = n === "heiz_monat" ? "month" : "year", min = R.reduce((a, r) => a + ((r.sc[sc] || {}).min || 0), 0), kwh = R.reduce((a, r) => a + ((r.sc[sc] || {}).kwh || 0), 0);
      return min > 0 || kwh > 0 ? { min: num(Math.round(min)), kwh: num(kwh, 1) } : null;
    }
    if (n === "licht_heute") { const v = fv("sensor.strom_waerme_licht_licht_heute"); return v ? { std: num(v, 1) } : null; }
    if (n === "pv_jetzt") { const N = this._enOn && this._enOn() ? this._enNow() : null; return N && N.pv > 50 ? { kw: num(N.pv / 1000, 2) } : null; }
    if (n === "raum_waermster" || n === "feuchte") {
      const key = n === "feuchte" ? "humEid" : "rtEid"; let best = null;
      R.forEach((r) => { const v = fv(r[key]); if (v != null && (!best || v > best.v)) best = { v, raum: r.name }; });
      return !best ? null : n === "feuchte" ? { raum: best.raum, rh: num(Math.round(best.v)) } : { raum: best.raum, t: num(best.v, 1) };
    }
    if (n === "fenster_offen") { const W = [...new Set(R.flatMap((r) => r.windows || []))].filter((e) => st[e]); return W.length ? { n: num(W.filter((e) => st[e].state === "on").length) } : null; }
    if (n === "ev_soc") { const v = fv(this._advTk("ev_soc")); return v != null ? { soc: num(Math.round(v)) } : null; }
    if (n === "melder") {
      const e = this._advTk("sf_status"), b = fv(this._advTk("sf_bat_min")); if (!e || b == null) return null;
      return { status: { ruhig: "alles ruhig", hinweis: "es gibt Hinweise", alarm: "ALARM" }[st[e].state] || st[e].state, bat: num(Math.round(b)) };
    }
    if (n === "sonne") {
      const s = st["sun.sun"]; if (!s) return null;
      const t = (x) => { const d = x ? new Date(x) : null; return d && !isNaN(d) ? d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : null; };
      const a = t(s.attributes.next_rising), u = t(s.attributes.next_setting); return a && u ? { auf: a, unter: u } : null;
    }
    return null;
  }
  _advFill(t) {
    if (t.daten && t.mit_daten) {
      const v = this._advSrc(t.daten);
      if (v) { let miss = false; const out = t.mit_daten.replace(/\{([a-z]+)\}/g, (_, k) => (v[k] != null ? String(v[k]) : (miss = true, ""))); if (!miss) return out; }
    }
    return t.text || "";
  }
  /* Schneefall: höchstens 26 Flocken, nur CSS, aus bei „Bewegung reduzieren“ und ohne Animationen */
  _saiSnow() {
    const s = this._sai(), n = { leicht: 26, mittel: 40, stark: 60 }[this._advEff().schnee]; if (!s.vis || !s.mv || !n) return "";
    let seed = 7; const R = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const t0 = (Date.now() / 1000) % 14;
    return `<div class="saiS" aria-hidden="true">${Array.from({ length: n }, () => `<i style="left:${(R() * 100).toFixed(1)}%;--s:${(2 + R() * 3.5).toFixed(1)}px;--d:${(7 + R() * 7).toFixed(1)}s;--w:${(R() * 40 - 20).toFixed(0)}px;animation-delay:-${(R() * 14 + t0).toFixed(1)}s"></i>`).join("")}</div>`;
  }
  /* Karte auf der Startseite: A = Raster, B = Kranz kompakt */
  _advBanner() {
    const d = this._advD; if (!d) return "";
    if (d.tag) {
      const end = new Date(d.tag.bis), ms = Math.max(0, end - this._saiNow()), h = Math.floor(ms / 36e5), m = Math.floor(ms % 36e5 / 6e4);
      return `<div class="advTag"><b>${d.tag.stufe === "max" ? "★ Sponsor-Max-Tag aktiv" : "⭐ Sponsor-Tag aktiv"}</b><span>noch ${h} h ${m} min</span></div>`;
    }
    if (d.danke) return `<div class="advDanke"><span><b>Danke fürs Ausprobieren!</b> Der Sponsor-Tag ist vorbei. Deine Einstellungen sind gespeichert und kommen zurück, sobald du Sponsor wirst.</span><span class="advDb"><button class="btn2 pri" data-act="spnopen">Sponsor werden</button><button class="btn2" data-act="advxdanke">OK</button></span></div>`;
    return "";
  }
  _advCard() {
    if (!this._advOn()) return "";
    const d = this._advD, c = this._advEff(), h = this._advToday(), rb = (d.tueren || []).some((t) => t.st === "rueckblick");
    const head = `<h2>${ic("tree", 18)}Adventskalender<span class="hzrt">${d.offen} von 24 geöffnet</span></h2>${this._advBanner()}`;
    if (c.variante === "C") return `<div class="card advC">${head}${this._advStars()}</div>`;
    if (c.variante === "D") return `<div class="card advC">${head}${this._advDorf()}</div>`;
    if (c.variante === "B") {
      const s = this._sai();
      return `<div class="card advC advB">${head}<div class="advBk">${this._saiKranz(s.kz, 120)}<div><b>${h ? `Türchen ${h.tag} wartet` : rb ? "Zum Nachlesen" : "Alle Türchen offen"}</b><small>${esc(this._saiText(s))}</small>
        <div class="advBb">${h ? `<button class="door2 today" data-act="advxopen" data-k="${h.tag}">${h.tag}</button>` : ""}<button class="btn2" data-act="advxkal">Alle 24</button></div></div></div></div>`;
    }
    return `<div class="card advC">${head}${this._advGrid(false)}</div>`;
  }
  _advGrid(peek) {
    const d = this._advD, T = {}; (d.tueren || []).forEach((t) => { T[t.tag] = t; });
    const cell = (n) => {
      const t = T[n] || { st: "gesperrt" }, cls = { offen: "o", heute: "today", nachholen: "late", gesperrt: "lock", rueckblick: "rb" }[t.st] || "lock";
      return `<button class="door2 ${cls}${n === 24 ? " big" : ""}" data-act="advxopen" data-k="${n}"${peek ? ` data-p="1"` : ""} aria-label="Türchen ${n}${t.st === "gesperrt" ? " (noch zu)" : ""}">${t.st === "offen" ? `<small>✓</small>${n}` : n}${t.st === "nachholen" ? `<span class="advRe" aria-hidden="true">↺</span>` : ""}</button>`;
    };
    const cells = this.constructor.ADV_ORDER.map(cell); cells.splice(10, 0, cell(24));
    return `<div class="advG">${cells.join("")}</div><div class="advLg"><span><i class="door2 o"></i>offen</span><span><i class="door2 today"></i>heute</span><span><i class="door2 late"></i>nachholen</span><span><i class="door2 lock"></i>noch zu</span></div>`;
  }
  _advModal() {
    const m = this._modal, d = this._advD;
    const shell = (title, sub, body) => `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>${title}</b><span>${sub}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>${body}</div>`;
    if (!d) return shell("Adventskalender", "lädt …", `<div class="mut" style="padding:20px">Einen Moment …</div>`);
    if (m.door) {
      const t = m.door, TY = { tipp: "Spartipp", statistik: "Statistik", deko: "Deko", funktion: "Funktion", raetsel: "Rätsel", besonders: "Besonders" };
      const mod = t.modul && this._mdList().some((x) => x.id === t.modul) ? this._mdList().find((x) => x.id === t.modul) : null;
      return shell(`Türchen ${t.tag}`, `${esc(TY[t.typ] || "")}${d.sim ? " · Simulation" : ""}`, `<div class="advD${m.anim ? " pop" : ""}"><div class="advDi" aria-hidden="true">${esc(t.icon || "🎁")}</div><span class="advTy t-${esc(t.typ)}">${esc(TY[t.typ] || "")}</span>
        <h3>${esc(t.titel)}</h3><p>${esc(this._advFill(t))}</p>${this._advDoorExtra(t.tag)}
        <div class="advDb">${mod ? `<button class="btn2 pri" data-act="advxmod" data-k="${mod.id}">Zu ${esc(mod.short || mod.name)}</button>` : ""}<button class="btn2" data-act="advxkal">Zum Kalender</button></div></div>`);
    }
    const sub = `${d.offen} von 24 geöffnet${d.stand === "benutzer" || this._advCfg().stand === "benutzer" ? " · dein Stand" : ""}${d.sim ? " · Simulation " + esc(d.heute.split("-").reverse().join(".")) : ""}`;
    if (m.codes) return shell("Tages-Codes " + esc(m.codes.jahr), "Entwickler · für advent_codes.json", `<div class="mut sm">Diese vier Codes gehören in die Datei <b>advent_codes.json</b> im Repository (oder schick sie mir). Sie sind öffentlich unbedenklich: Jeder gilt nur an seinem Tag und nur zusammen mit der eigenen Installation.</div>
      <textarea class="advCode" readonly rows="8">${esc(JSON.stringify({ [m.codes.jahr]: m.codes.codes }, null, 2))}</textarea><div class="advDb"><button class="btn2 pri" data-act="advxcopy">Kopieren</button><button class="btn2" data-act="close">Fertig</button></div>`);
    return shell(m.peek ? "Alle Türchen (Entwickler)" : "Adventskalender", sub, `${this._advBanner()}${m.peek ? `<div class="mut sm" style="margin-bottom:8px">Vorschau ohne Öffnen – nichts wird gespeichert.</div>` : ""}${this._advGrid(!!m.peek)}`);
  }
  /* Türchen 6/13/20/24: Tagesschlüssel (ohne die Stufe) oder Sponsor-Bonus */
  _advDoorExtra(tag) {
    const d = this._advD, row = d && (d.tueren || []).find((t) => t.tag === tag); if (!row) return "";
    let out = "";
    if (row.key) {
      const k = row.key, nm = k.stufe === "max" ? "Sponsor-Max" : "Sponsor";
      out += k.fehlt ? `<div class="advKey"><b>🔑 Dein ${nm}-Tag</b><small>Der Tages-Code für heute ist noch nicht da – schau später noch einmal vorbei.</small></div>`
        : k.aktiv ? `<div class="advKey on"><b>✓ ${nm}-Tag ist aktiv</b><small>Alle ${nm}-Funktionen bis heute 23:59.</small></div>`
        : `<div class="advKey"><b>🔑 Dein ${nm}-Tag!</b><small>Heute kannst du alle ${nm}-Funktionen ausprobieren – nur auf diesem System, bis 23:59.</small><code>${esc(k.text)}</code><span class="advDb"><button class="btn2 pri" data-act="advxkey" data-k="${esc(k.text)}">Jetzt aktivieren</button><button class="btn2" data-act="close">Später heute</button></span></div>`;
    }
    const t = d.tier !== undefined ? d.tier : this._advTier(), B = { 6: ["farbset", "eis", "Farbset „Eis-Blau“"], 13: ["schnee", "stark", "Schneefall „Stark“"], 20: ["farbset", "gold", "Farbset „Gold“"] };
    if (row.st === "offen" || row.st === "heute" || row.st === "rueckblick") {
      if (B[tag] && (t === "sponsor" || t === "max")) out += `<div class="advBon"><b>⭐ Sponsor-Bonus</b><small>${B[tag][2]} – passend zum ${tag === 6 ? "Nikolaus" : tag === 13 ? "3. Advent" : "4. Advent"}.</small>${this._admin() ? `<button class="btn2" data-act="advxbon" data-k="${B[tag][0]}" data-v="${B[tag][1]}">Ausprobieren</button>` : ""}</div>`;
      if (tag === 24 && this._advTier() === "max") { const v = this._advSrc("heiz_jahr"); let R = []; try { R = this._collect0(); } catch (_) { R = []; }
        out += `<div class="advBon"><b>★ Dein Jahresrückblick</b><small>${v ? `${v.min} Minuten Heizpause bei offenem Fenster, rund ${v.kwh} kWh Wärme gespart, ${R.length} ${R.length === 1 ? "Raum" : "Räume"} im Blick.` : "Strom & Wärme hat dich das ganze Jahr begleitet."} Danke für deine Unterstützung!</small></div>`; }
    }
    return out;
  }
  _advStars() {
    const d = this._advD, S = new Set(d.sterne || []), T = {}; (d.tueren || []).forEach((t) => { T[t.tag] = t; });
    const h = this._advToday();
    return `<div class="advSt"><b>⭐ ${S.size} ${S.size === 1 ? "Stern" : "Sterne"}</b><small>Ein Stern für jedes Türchen, das du an seinem Tag öffnest. Nachholen geht trotzdem.</small></div>
      <div class="advSg">${Array.from({ length: 24 }, (_, i) => { const n = i + 1, t = T[n] || {}, cls = S.has(n) ? "st" : t.st === "heute" ? "today" : t.st === "offen" ? "o" : t.st === "nachholen" ? "late" : "lock";
        return `<button class="door2 ${cls}" data-act="advxopen" data-k="${n}" aria-label="Türchen ${n}">${S.has(n) ? "⭐" : n}</button>`; }).join("")}</div>
      ${h ? `<div class="advDb" style="justify-content:flex-start;margin-top:10px"><button class="btn2 pri" data-act="advxopen" data-k="${h.tag}">Türchen ${h.tag} öffnen</button></div>` : ""}`;
  }
  _advDorf() {
    const d = this._advD, n = d.offen || 0, h = this._advToday(), C = this._advLightCols();
    let L = ""; for (let i = 0; i < 24; i++) { const t = i / 23, x = 70 + t * 100, y = t < 0.5 ? 95 - t * 80 : 55 + (t - 0.5) * 80; L += `<circle cx="${x.toFixed(1)}" cy="${(y - 2).toFixed(1)}" r="2.8" fill="${i < n ? C[i % C.length] : "#3a3f4b"}"${i < n ? ` class="advLi" style="--i:${i}"` : ""}/>`; }
    const snowman = n >= 6 ? `<g transform="translate(196 132)"><circle r="9" fill="#f2f6f5"/><circle cy="-13" r="6" fill="#f2f6f5"/><circle cx="-2" cy="-14" r=".9" fill="#222"/><circle cx="2" cy="-14" r=".9" fill="#222"/><path d="M0 -12 l4 1 -4 1z" fill="#f08a1f"/></g>` : "";
    const sled = n >= 13 ? `<g transform="translate(28 140)"><path d="M0 0h26l4-6" stroke="#e05a6b" stroke-width="2" fill="none"/><rect x="3" y="-9" width="18" height="7" rx="2" fill="#e05a6b"/><rect x="8" y="-15" width="8" height="6" fill="#3fa37a"/></g>` : "";
    const tree = `<polygon points="58,148 46,148 52,${n >= 20 ? 118 : 124}" fill="#2d7a5c"/>${n >= 20 ? `<circle cx="50" cy="138" r="1.6" fill="#f4d58d"/><circle cx="54" cy="131" r="1.6" fill="#e05a6b"/><circle cx="51" cy="125" r="1.6" fill="#8cc8f5"/>` : ""}`;
    const star = n >= 24 ? `<polygon points="120,40 123,48 131,48 125,53 127,61 120,56 113,61 115,53 109,48 117,48" fill="#f4d58d"/>` : "";
    return `<div class="advDorf"><svg viewBox="0 0 240 165" role="img" aria-label="${n} von 24 Lichtern an"><rect width="240" height="165" rx="12" fill="#0b1626"/>
      <g fill="#fff" opacity=".7"><circle cx="20" cy="15" r="1"/><circle cx="60" cy="30" r="1.2"/><circle cx="200" cy="20" r="1"/><circle cx="160" cy="36" r="1"/><circle cx="225" cy="55" r="1"/></g>
      <ellipse cx="120" cy="165" rx="150" ry="22" fill="#e9f1f3"/>
      <polygon points="12,118 32,98 52,118" fill="#f2f6f5"/><rect x="15" y="118" width="34" height="26" fill="#3a3f4b"/><rect x="25" y="125" width="9" height="9" fill="${n >= 3 ? "#f4d58d" : "#2a2f3a"}"/>
      <polygon points="188,116 210,94 232,116" fill="#f2f6f5"/><rect x="191" y="116" width="38" height="28" fill="#3a3f4b"/><rect x="197" y="123" width="9" height="9" fill="${n >= 9 ? "#f4d58d" : "#2a2f3a"}"/><rect x="213" y="123" width="9" height="9" fill="${n >= 16 ? "#f4d58d" : "#2a2f3a"}"/>
      <polygon points="70,95 120,55 170,95" fill="#f2f6f5"/><rect x="78" y="95" width="84" height="52" fill="#46505e"/>
      <rect x="88" y="104" width="16" height="16" fill="${n >= 1 ? "#f4d58d" : "#2a2f3a"}"/><rect x="136" y="104" width="16" height="16" fill="${n >= 12 ? "#f4d58d" : "#2a2f3a"}"/><rect x="112" y="120" width="16" height="27" fill="#e05a6b"/>
      ${L}${tree}${snowman}${sled}${star}<text x="120" y="22" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">${n} von 24 Lichtern an</text></svg>
      <div class="advDb" style="justify-content:flex-start">${h ? `<button class="btn2 pri" data-act="advxopen" data-k="${h.tag}">Türchen ${h.tag} öffnen</button>` : ""}<button class="btn2" data-act="advxkal">Alle 24</button></div>
      <div class="mut sm">Jedes Türchen schmückt das Dorf weiter: Fenster, Schneemann (6), Schlitten (13), Baum (20), Stern (24).</div></div>`;
  }
  _advLightCols() { return { eis: ["#8cc8f5", "#e8f4ff", "#6fb6e8", "#c9e6ff"], gold: ["#f4d58d", "#ffe9a8", "#d9a94a", "#fff3c0"] }[this._advEff ? this._advEff().farbset : "klassisch"] || ["#e05a6b", "#f4d58d", "#3fa37a", "#8cc8f5", "#c9a6f5"]; }
  /* Modul 18: Lampen mit dem Label „weihnachten“ */
  _advXmasLights() {
    const st = this._hass.states, L = Object.entries(this._hass.entities || {}).filter(([eid, e]) => (e.labels || []).includes("weihnachten") && /^(light|switch)\./.test(eid) && st[eid]);
    return L.length ? { n: L.length, on: L.filter(([eid]) => st[eid].state === "on").length } : null;
  }
  async _advKey(key) {
    try {
      const r = await this._hass.callWS({ type: "fenster_heizung/advent_key", act: "aktivieren", key });
      if (r.kal) this._advD = r.kal;
      if (!r.ok) { this._toast(r.err || "Schlüssel ungültig"); this._renderModal(); return; }
      try { await this._spnLoad(); this._spnApply(); } catch (_) { /* egal */ }
      this._toast(r.stufe === "max" ? "★ Sponsor-Max-Tag aktiv – viel Spaß!" : "⭐ Sponsor-Tag aktiv – viel Spaß!"); this._render(); this._renderModal();
    } catch (_) { this._toast("Schlüssel konnte nicht geprüft werden"); }
  }
  _advOpenDoor(tag, peek) {
    const d = this._advD; if (!d) return;
    const row = (d.tueren || []).find((t) => t.tag === tag);
    if (peek && row && row.t) { this._modal = { type: "advent", door: row.t, peek: true }; this._renderModal(); return; }
    if (row && row.st === "gesperrt") { const n = tag - (+String(d.heute).slice(8, 10) || 0); this._toast(String(d.heute).slice(5, 7) === "12" && n > 0 ? `Noch ${n} ${n === 1 ? "Tag" : "Tage"} – Geduld!` : "Dieses Türchen ist noch zu"); return; }
    this._hass.callWS({ type: "fenster_heizung/advent_open", tag }).then((r) => {
      if (r.kal) this._advD = r.kal;
      if (!r.ok) { this._toast(r.err === "gesperrt" ? "Dieses Türchen ist noch zu" : "Türchen nicht gefunden"); return; }
      this._modal = { type: "advent", door: r.t, anim: !!r.neu && this._sai().mv }; this._renderModal(); this._render();
    }).catch(() => this._toast("Türchen konnte nicht geöffnet werden"));
  }
  _advSave(cfg) {
    this._hass.callWS({ type: "fenster_heizung/advent_set", cfg }).then((r) => { this._advD = r; this._render(); this._renderModal(); })
      .catch(() => this._toast("Einstellung konnte nicht gespeichert werden"));
  }
  /* Abschnitt in Darstellung → Weihnachts-Theme */
  _advLook() {
    if (!this._advD) return "";
    const c = this._advCfg(), d = this._advD, N = Object.keys((this._hass.services || {}).notify || {}).filter((k) => k !== "persistent_notification" && k !== "send_message").sort();
    const t = this._advTier(), sp = t === "sponsor" || t === "max", mx = t === "max";
    const seg = (k, opts) => `<div class="seg" style="margin:4px 0 8px">${opts.map(([v, l]) => `<button class="${c[k] === v ? "sel" : ""}" data-act="advxset" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`;
    const times = []; for (let h = 5; h <= 21; h++) for (const mm of ["00", "30"]) times.push(`${String(h).padStart(2, "0")}:${mm}`);
    return `<div class="lsec">${ic("schedule", 15)}Adventskalender</div>
      <div class="mut sm">Darstellung auf der Startseite</div>${seg("variante", [["A", "Raster"], ["B", "Kranz"], ["C", `Sterne${sp ? "" : " 🔒"}`], ["D", `Dorf${mx ? "" : " 🔒"}`]])}
      ${(c.variante === "C" && !sp) || (c.variante === "D" && !mx) ? `<div class="mut sm" style="margin:-4px 0 8px">Gewählt, aber ${c.variante === "C" ? "Sponsor" : "Sponsor Max"} nötig – bis dahin siehst du das Raster.</div>` : ""}
      <div class="mut sm">Farben der Lichterkette</div>${seg("farbset", [["klassisch", "Klassisch"], ["eis", `Eis-Blau${sp ? "" : " 🔒"}`], ["gold", `Gold${sp ? "" : " 🔒"}`]])}
      <div class="mut sm">Stand</div>${seg("stand", [["gemeinsam", "Gemeinsam"], ["benutzer", "Pro Benutzer"]])}
      <div class="mut sm">Schneefall in den Kopfkarten</div>${seg("schnee", [["aus", "Aus"], ["leicht", "Leicht"], ["mittel", `Mittel${sp ? "" : " 🔒"}`], ["stark", `Stark${sp ? "" : " 🔒"}`]])}
      <div class="ltog"><span>Benachrichtigung „Türchen ist da“</span><button class="sw ${c.notify.on ? "on" : ""}" data-act="advxnot" aria-pressed="${c.notify.on}" aria-label="Benachrichtigung"></button></div>
      ${c.notify.on ? `<div class="saiRow"><select data-f="advnzeit">${times.map((t) => `<option ${t === c.notify.zeit ? "selected" : ""}>${t}</option>`).join("")}</select>
        <select data-f="advndienst"><option value="">Gerät wählen …</option>${N.map((k) => `<option value="notify.${esc(k)}" ${c.notify.dienst === "notify." + k ? "selected" : ""}>${esc(k)}</option>`).join("")}</select></div>
        ${!c.notify.dienst ? `<div class="mut sm">Wähle ein Gerät (Companion-App), sonst kommt keine Mitteilung.</div>` : ""}` : ""}
      ${c.notify.on && c.notify.dienst ? `<div class="ltog"><span>Kerzen-Erinnerung an Adventssonntagen<br><small class="mut">wenn alle das Haus verlassen (Modul 11)</small></span><button class="sw ${c.kerzen ? "on" : ""}" data-act="advxkerz" aria-pressed="${c.kerzen}" aria-label="Kerzen-Erinnerung"></button></div>` : ""}
      <div class="mut sm" style="margin-top:6px">Tagesschlüssel eingeben</div>
      <div class="saiRow"><input data-f="advkey" placeholder="SW26-1206-SPON-…" style="width:220px;text-transform:uppercase"><button class="btn2" data-act="advxkeyin">Einlösen</button></div>
      ${d.dev ? `<div class="saiDev"><div class="hd"><span>${ic("flask", 15)} Kalender testen</span><span class="tag">Entwickler</span></div>
        <div class="saiRow"><button class="btn2" data-act="advxpeek">Alle Türchen ansehen</button><button class="btn2" data-act="advxreset">Kalender zurücksetzen</button><button class="btn2" data-act="advxsign">Tages-Codes signieren</button></div>
        <div class="mut sm">Echte Tagesschlüssel siehst du als Entwickler nur mit „Entwickler-Zugang zum Testen aus“ (Sponsor-Lounge). Testschlüssel: SW26-XMAS-SPON-T7K4-Q9M2 · SW26-XMAS-SMAX-T3R8-D5VX</div>
        <div class="mut sm">Mit „Datum simulieren“ geöffnete Türchen werden nicht gespeichert und sind nach der Simulation wieder zu.</div></div>` : ""}`;
  }
  _advInput(t) {
    if (!t.dataset) return false;
    const c = this._advCfg();
    if (t.dataset.f === "advnzeit") { this._advSave({ notify: { ...c.notify, zeit: t.value } }); return true; }
    if (t.dataset.f === "advndienst") { this._advSave({ notify: { ...c.notify, dienst: t.value } }); return true; }
    return false;
  }
  _advAct(a, b) {
    const k = b.dataset.k;
    if (a === "advxkal") { this._modal = { type: "advent" }; this._renderModal(); }
    else if (a === "advxopen") this._advOpenDoor(+k, b.dataset.p === "1" || !!(this._modal && this._modal.peek));
    else if (a === "advxmod") { this._modal = null; this._renderModal(); this._stOpen = false; this._edit = false; this._mdActiveSet(k); this._render(); }
    else if (a === "advxset") this._advSave({ [k]: b.dataset.v });
    else if (a === "advxnot") { const c = this._advCfg(); this._advSave({ notify: { ...c.notify, on: !c.notify.on } }); }
    else if (a === "advxkey") this._advKey(k);
    else if (a === "advxkeyin") { const i = this.shadowRoot.querySelector('[data-f="advkey"]'); if (i && i.value.trim()) this._advKey(i.value.trim()); }
    else if (a === "advxdanke") this._hass.callWS({ type: "fenster_heizung/advent_key", act: "danke" }).then((r) => { this._advD = r.kal; this._render(); }).catch(() => {});
    else if (a === "advxbon") { this._advSave({ [k]: b.dataset.v }); this._toast("Ausprobiert – zurückstellen unter Darstellung → Weihnachts-Theme"); }
    else if (a === "advxkerz") this._advSave({ kerzen: !this._advCfg().kerzen });
    else if (a === "advxsign") this._hass.callWS({ type: "fenster_heizung/advent_sign" }).then((r) => { this._modal = { type: "advent", codes: r }; this._renderModal(); }).catch(() => this._toast("Nur mit Entwickler-Zugang"));
    else if (a === "advxcopy") { const ta = this.shadowRoot.querySelector(".advCode"); if (ta) { ta.select(); try { navigator.clipboard.writeText(ta.value).then(() => this._toast("Kopiert"), () => { document.execCommand("copy"); this._toast("Kopiert"); }); } catch (_) { document.execCommand("copy"); this._toast("Kopiert"); } } }
    else if (a === "advxpeek") { this._modal = { type: "advent", peek: true }; this._renderModal(); }
    else if (a === "advxreset") {
      this._hass.callWS({ type: "fenster_heizung/advent_reset" }).then((r) => { this._advD = r; this._toast("Kalender zurückgesetzt"); this._render(); this._renderModal(); })
        .catch(() => this._toast("Nur mit Entwickler-Zugang"));
    }
  }
