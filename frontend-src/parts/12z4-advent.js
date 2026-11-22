  /* ================= Adventskalender (Weihnachts-Theme Build 2) =================
     Varianten A (Raster, 24 Türchen) und B (Kranz, kompakt), Türchen öffnen, nachholen, Rückblick, Inhalte mit echten Werten,
     Schneefall. Stand und Inhalte kommen vom Backend (fenster_heizung/advent_get), Werte füllt das Dashboard selbst ein. */
  static ADV_ORDER = [7, 15, 2, 21, 11, 4, 18, 1, 13, 9, 22, 6, 16, 3, 20, 10, 14, 19, 5, 12, 17, 23, 8];
  async _advLoad() { try { this._advD = await this._hass.callWS({ type: "fenster_heizung/advent_get" }); } catch (_) { this._advD = null; } }
  _advCfg() { return { variante: "A", stand: "gemeinsam", schnee: "aus", notify: { on: false, zeit: "07:00", dienst: "" }, ...((this._advD && this._advD.cfg) || {}) }; }
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
    const s = this._sai(); if (!s.vis || !s.mv || this._advCfg().schnee !== "leicht") return "";
    let seed = 7; const R = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    return `<div class="saiS" aria-hidden="true">${Array.from({ length: 26 }, () => `<i style="left:${(R() * 100).toFixed(1)}%;--s:${(2 + R() * 3.5).toFixed(1)}px;--d:${(7 + R() * 7).toFixed(1)}s;--w:${(R() * 40 - 20).toFixed(0)}px;animation-delay:-${(R() * 14).toFixed(1)}s"></i>`).join("")}</div>`;
  }
  /* Karte auf der Startseite: A = Raster, B = Kranz kompakt */
  _advCard() {
    if (!this._advOn()) return "";
    const d = this._advD, c = this._advCfg(), h = this._advToday(), rb = (d.tueren || []).some((t) => t.st === "rueckblick");
    const head = `<h2>${ic("tree", 18)}Adventskalender<span class="hzrt">${d.offen} von 24 geöffnet</span></h2>`;
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
        <h3>${esc(t.titel)}</h3><p>${esc(this._advFill(t))}</p>
        <div class="advDb">${mod ? `<button class="btn2 pri" data-act="advxmod" data-k="${mod.id}">Zu ${esc(mod.short || mod.name)}</button>` : ""}<button class="btn2" data-act="advxkal">Zum Kalender</button></div></div>`);
    }
    const sub = `${d.offen} von 24 geöffnet${d.stand === "benutzer" || this._advCfg().stand === "benutzer" ? " · dein Stand" : ""}${d.sim ? " · Simulation " + esc(d.heute.split("-").reverse().join(".")) : ""}`;
    return shell(m.peek ? "Alle Türchen (Entwickler)" : "Adventskalender", sub, `${m.peek ? `<div class="mut sm" style="margin-bottom:8px">Vorschau ohne Öffnen – nichts wird gespeichert.</div>` : ""}${this._advGrid(!!m.peek)}`);
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
    const seg = (k, opts) => `<div class="seg" style="margin:4px 0 8px">${opts.map(([v, l]) => `<button class="${c[k] === v ? "sel" : ""}" data-act="advxset" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`;
    const times = []; for (let h = 5; h <= 21; h++) for (const mm of ["00", "30"]) times.push(`${String(h).padStart(2, "0")}:${mm}`);
    return `<div class="lsec">${ic("schedule", 15)}Adventskalender</div>
      <div class="mut sm">Darstellung auf der Startseite</div>${seg("variante", [["A", "Raster (24 Türchen)"], ["B", "Kranz (kompakt)"]])}
      <div class="mut sm">Stand</div>${seg("stand", [["gemeinsam", "Gemeinsam"], ["benutzer", "Pro Benutzer"]])}
      <div class="mut sm">Schneefall in den Kopfkarten</div>${seg("schnee", [["aus", "Aus"], ["leicht", "Leicht"]])}
      <div class="ltog"><span>Benachrichtigung „Türchen ist da“</span><button class="sw ${c.notify.on ? "on" : ""}" data-act="advxnot" aria-pressed="${c.notify.on}" aria-label="Benachrichtigung"></button></div>
      ${c.notify.on ? `<div class="saiRow"><select data-f="advnzeit">${times.map((t) => `<option ${t === c.notify.zeit ? "selected" : ""}>${t}</option>`).join("")}</select>
        <select data-f="advndienst"><option value="">Gerät wählen …</option>${N.map((k) => `<option value="notify.${esc(k)}" ${c.notify.dienst === "notify." + k ? "selected" : ""}>${esc(k)}</option>`).join("")}</select></div>
        ${!c.notify.dienst ? `<div class="mut sm">Wähle ein Gerät (Companion-App), sonst kommt keine Mitteilung.</div>` : ""}` : ""}
      ${d.dev ? `<div class="saiDev"><div class="hd"><span>${ic("flask", 15)} Kalender testen</span><span class="tag">Entwickler</span></div>
        <div class="saiRow"><button class="btn2" data-act="advxpeek">Alle Türchen ansehen</button><button class="btn2" data-act="advxreset">Kalender zurücksetzen</button></div>
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
    else if (a === "advxpeek") { this._modal = { type: "advent", peek: true }; this._renderModal(); }
    else if (a === "advxreset") {
      this._hass.callWS({ type: "fenster_heizung/advent_reset" }).then((r) => { this._advD = r; this._toast("Kalender zurückgesetzt"); this._render(); this._renderModal(); })
        .catch(() => this._toast("Nur mit Entwickler-Zugang"));
    }
  }
