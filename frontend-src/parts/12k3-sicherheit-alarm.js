  /* ================= Modul 11 · v0.8 „Alarm & Stufen“ (Konzept_Modul11_Neue-Optik Teil C, Empfehlungen 1–12) =================
     C1 · Alarm-Ansicht (Handy, Tablet-Wand, Panel) mit den Stufen, „Verstanden“ und Fehlalarm-Gründen. Der Alarm kommt von sicherheit.py, hier wird nur angezeigt.
     Ausgeschaltete Melder: Schalter im Detailblatt, Frage „Ausschalten?“ nach langer Funkstille, Einstellungen unter Alarm & Stufen.
     Fluchtweg: im Grundriss zeigt eine Linie vom alarmierenden Melder zur nächsten Tür (mit Hinweis „Plan prüfen“). */
  _sfDays(n) { return n === 1 ? "1 Tag" : `${n} Tagen`; }
  _sfFmtS(s) { s = Math.max(0, Math.round(s)); return s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : `0:${String(s).padStart(2, "0")}`; }
  _sfSecTxt(s) { return s < 60 ? `${s} s` : s % 60 === 0 ? `${s / 60} Min.` : `${Math.floor(s / 60)} Min. ${s % 60} s`; }
  /* ---- Hinweis-Karte: Melder wirkt ausgeschaltet */
  _sfAskCards(T) {
    const adm = this._admin();
    return (T.ask || []).map((x) => `<div class="sfhintc"><span class="sfhi">${ic("eyeOff", 18)}</span><div class="sfht"><b>${esc(x.name)} wirkt ausgeschaltet</b><small>${x.off_days ? `Seit ${this._sfDays(x.off_days)}` : "Seit längerer Zeit"} nicht erreichbar. Warnungen dazu pausieren?</small></div>${adm ? `<div class="sfhb"><button class="btn2" data-act="sfxwarn" data-k="${esc(x.id)}">Weiter warnen</button><button class="btn2 pri" data-act="sfxpause" data-k="${esc(x.id)}" data-d="0">Ausschalten</button></div>` : ""}</div>`).join("");
  }
  /* ---- Detailblatt: Ausgeschaltet und Fehlalarme */
  _sfPauseCard(x) {
    const p = x.paused, adm = this._admin(), id = esc(x.id), chip = (d, t) => `<button class="gsch" data-act="sfxpause" data-k="${id}" data-d="${d}">${t}</button>`;
    const until = p ? (p.until ? `bis ${this._sfDate(p.until)}` : "dauerhaft") : "";
    const body = p
      ? `<div class="mut sm">Keine Hinweise zu Erreichbarkeit, Batterie, Prüfung und Lebensdauer${p.auto ? " (von selbst ausgeschaltet nach langer Funkstille)" : ""}. <b>Löst er aus, kommt der Alarm trotzdem.</b>${x.off ? " Wird er wieder erreichbar, schaltet er sich selbst ein und meldet das einmal." : ""}</div>${adm ? `<div class="sfbtn" style="margin-top:8px"><button class="btn2 pri" data-act="sfxresume" data-k="${id}">Wieder einschalten</button></div>` : ""}`
      : `<div class="mut sm">Für einen Melder, den du abgebaut oder abgeschaltet hast. Dann kommen keine Warnungen mehr dazu, ein Alarm aber weiterhin.</div>${adm ? `<div class="gschips" style="margin-top:8px">${chip(7, "7 Tage")}${chip(30, "30 Tage")}${chip(0, "Dauerhaft")}</div>` : ""}`;
    return `<div class="card sfc" style="margin-top:10px"><h2>${ic("eyeOff", 18)}Ausgeschaltet<small class="mut">${esc(until)}</small></h2>${body}</div>`;
  }
  _sfFaCard(x) {
    if (!x.fa_n) return "";
    const why = [...new Set(x.fa_why || [])].join(", ");
    return `<div class="card sfc" style="margin-top:10px"><h2>${ic("info", 18)}Fehlalarme<small class="mut">${x.fa_n} in 90 Tagen</small></h2><div class="mut sm">${x.fa_n >= 3 ? `Dieser Melder löst oft aus${why ? " (" + esc(why) + ")" : ""}. Tipp: etwas weiter weg vom Herd oder Bad anbringen oder in der Küche einen Hitzemelder nehmen. ` : why ? `Zuletzt: ${esc(why)}. ` : ""}Das Modul verzögert einen Alarm nie von selbst.</div></div>`;
  }
  /* ---- Einstellungen: Alarm & Stufen, ausgeschaltete Melder, Durchsage, Kontakt */
  _sfStufenCard(T) {
    const C = T.C, G = C.stages, H = this._hass, sw = (act, k, on, label) => `<button class="sw ${on ? "on" : ""}" data-act="${act}" data-k="${k}" aria-pressed="${!!on}" aria-label="${label}"></button>`;
    const step = (k, s) => `<div class="step" style="flex:none"><button data-act="sfxstgs" data-k="${k}" data-s="-1" aria-label="früher">${ic("minus", 16)}</button><b>${this._sfSecTxt(s)}</b><button data-act="sfxstgs" data-k="${k}" data-s="1" aria-label="später">${ic("plus", 16)}</button></div>`;
    const row = (n, t, w, col, k, extra = "") => `<div class="sfstg"><span class="sfsn" style="background:${col}">${n}</span><span class="sfst2"><b>${t}</b><small class="mut">${w}</small></span>${k ? `${G[k].on ? step(k, G[k].sec) : ""}${sw("sfxstg", k, G[k].on, t)}` : `<span class="mut sm">immer an</span>`}</div>${extra}`;
    const ids = (p) => Object.keys(H.states).filter((e) => e.startsWith(p)).sort();
    const svc = [...new Set([...Object.keys((H.services || {}).notify || {}).filter((n) => !["send_message", "reload", "persistent_notification"].includes(n)).sort().map((n) => "notify." + n), ...(C.contact.to ? [C.contact.to] : [])])];
    const tts = G.s3.on ? `<div class="sffld sfsub"><label>Durchsage über Lautsprecher (optional)</label>${this._wzSel(ids("media_player."), C.tts.player, "sfxtts", 'data-k="player"', "– keiner –")}${C.tts.player ? this._wzSel(ids("tts."), C.tts.engine, "sfxtts", 'data-k="engine"', "– Sprachdienst wählen –") : ""}</div>` : "";
    const ct = G.s4.on ? `<div class="sffld sfsub"><label>Kontaktperson (zum Beispiel Nachbar)</label>${this._wzSel(svc, C.contact.to, "sfxcont", "", "– Mitteilungsdienst wählen –")}${C.contact.to ? "" : `<div class="mut sm">Ohne Auswahl geht die Meldung in Stufe 4 an niemanden.</div>`}</div>` : "";
    const oa = C.offask, chip = (k, t) => `<button class="gsch ${oa.mode === k ? "sel" : ""}" data-act="sfxoam" data-k="${k}" aria-pressed="${oa.mode === k}">${t}</button>`;
    return `<div class="card sfc" data-sec="alarm"><h2>${ic("alert", 18)}Alarm &amp; Stufen</h2>
      <div class="mut sm" style="margin:-4px 0 8px">Wenn niemand „Verstanden“ drückt, steigert sich der Alarm Stufe für Stufe. <b>Der erste Alarm wird nie verzögert</b>, Türen werden nie entriegelt.</div>
      ${row(1, "Melden", "sofort · Mitteilung (kritisch), eigene Aktionen, Protokoll", "#f59e0b", "")}
      ${row(2, "Haus vorbereiten", `nach ${this._sfSecTxt(G.s2.sec)} · Aktionen mit „Wann: Stufe 2“ (Licht, Rollläden, Lüftung aus)`, "#fb7185", "s2")}
      ${row(3, "Alle informieren", `nach ${this._sfSecTxt(G.s3.sec)} ohne „Verstanden“ · Mitteilung an alle, Durchsage`, "#ef4444", "s3", tts)}
      ${row(4, "Hilfe holen", `nach ${this._sfSecTxt(G.s4.sec)} · Kontaktperson, Hinweis 112, Wiederholung alle 2 Min.`, "#b91c1c", "s4", ct)}
      <button class="btn2" data-act="sfxopen" style="flex:none;width:100%;margin-top:10px">${ic("pencil", 15)} Aktionen den Stufen zuordnen</button>
      <div class="sfgrp" style="margin-top:14px">AUSGESCHALTETE MELDER</div>
      <div class="gschips">${chip("ask", "Nach Tagen fragen")}${chip("auto", "Selbst ausschalten")}${chip("never", "Immer warnen")}</div>
      ${oa.mode !== "never" ? `<div class="vrow"><span>Nach wie vielen Tagen ohne Meldung<small class="mut" style="display:block">Danach kommt einmal ${oa.mode === "auto" ? "der Hinweis, dass der Melder ausgeschaltet wurde" : "die Frage „Ausschalten?“"} statt täglicher Warnungen.</small></span><div class="step" style="flex:none"><button data-act="sfxoad" data-s="-1" aria-label="weniger">${ic("minus", 16)}</button><b>${this._sfDays(oa.days)}</b><button data-act="sfxoad" data-s="1" aria-label="mehr">${ic("plus", 16)}</button></div></div>` : `<div class="mut sm">Wie bisher: Warnung täglich, solange der Melder fehlt.</div>`}</div>`;
  }
  /* ---- Fluchtweg: nächste Tür auf derselben Etage (Luftlinie, Hinweis „Plan prüfen“) */
  _sfEscapeFor(it) {
    if (!it) return null;
    const route = this._sfEscRoute(it); if (!route) return null;
    const P = this._sfx().cfg.plan;
    return { m: it, d: route.exit, route, fl: (P.floors.find((f) => f.id === it.fl) || {}).n || "" };
  }
  _sfEscHint(x) {
    const it = x && this._sfx().cfg.plan.items.find((q) => q.t === "m" && q.e === x.id), e = this._sfEscapeFor(it);
    if (!e) return it ? `<div class="sfhint">${ic("info", 15)}<span>Fluchtweg: Im Grundriss ist auf dieser Etage keine Tür eingezeichnet. Mit einer Tür im Plan sucht das Modul den kürzesten Weg.</span></div>` : "";
    const r = e.route;
    return r.fallback ? `<div class="sfhint">${ic("door", 15)}<span><b>Plan prüfen:</b> Zur nächsten Tür (${esc(e.fl)}) fand das Modul keinen freien Weg und zeichnet eine Luftlinie. Sitzen die Türen auf den Wänden?</span></div>`
      : `<div class="sfhint sfhe">${ic("door", 15)}<span>${r.kind === "s" ? "Weg zur Treppe" : "Fluchtweg zur nächsten Außentür"} (${esc(e.fl)}), ca. ${num(r.m, 0)} m, grün eingezeichnet. <b>Plan prüfen:</b> Das Modul rechnet um die Wände im Plan herum, kennt aber keine Möbel${r.unsure ? " und weiß nicht sicher, ob diese Tür nach draußen führt" : ""}.</span></div>`;
  }
  /* ---- Alarm-Ansicht */
  _sfAlarmList() { const S = this._sfx(), L = S.det && !S.error ? S.det : this._sfxLocal(); return L.filter((x) => x.alarm && !x.ack); }
  _sfAlarmKey() { return !this._mdState || !this._mdState().on.sf ? "" : this._sfAlarmList().map((x) => x.id).sort().join(","); }
  _sfAlarmTick() {
    if (!this._hass || !this._mdState || !this._mdState().on.sf) return;
    const open = !!(this._modal && this._modal.type === "sfalarm");
    if (!open && this._pollN % 3 !== 0) return;
    if (this._sfxLocal().some((x) => x.alarm) && !this._sfxBusy && (!this._sfxD || Date.now() - this._sfxD.ts > 4000)) this._sfxLoad(true);
    const k = this._sfAlarmKey();
    if (k) {
      if (!open) { this._sfAlKey = k; if (this._tmSleep && this._tmWake) this._tmWake(); this._modal = { type: "sfalarm" }; this._renderModal(); }
      else if (k !== this._sfAlKey || this._pollN % 2 === 0) { this._sfAlKey = k; this._renderModal(); }
    } else { if (open) { this._modal = null; this._renderModal(); } this._sfAlKey = ""; }
  }
  _sfAlarmModal() {
    const S = this._sfx(), C = S.cfg, al = this._sfAlarmList();
    if (!al.length) return `<div class="ov"></div>`;
    const x = al[0], skew = this._sfxD && S.now ? S.now - this._sfxD.ts / 1000 : 0, el = x.t0 ? Math.max(0, Date.now() / 1000 + skew - x.t0) : 0, stg = x.stage || 1;
    const rows = [["Gemeldet", "Mitteilung gesendet", 1, 0]];
    [[2, "Haus vorbereitet", "Licht, Rollläden, Lüftung"], [3, "Alle informieren", "Mitteilung an alle, Durchsage"], [4, "Kontaktperson", "Mitteilung und Hinweis 112"]].forEach(([n, t, w]) => { const g = C.stages["s" + n]; if (g && g.on) rows.push([t, w, n, g.sec]); });
    let nxt = true;
    const steps = rows.map(([t, w, n, sec]) => {
      const done = stg >= n, cls = done ? "d" : nxt ? "n" : "", tm = done ? this._sfFmtS(sec) : nxt ? "in " + this._sfFmtS(sec - el) : "nach " + this._sfFmtS(sec);
      if (!done) nxt = false;
      return `<div class="${cls}"><i>${done ? "✓" : n}</i><span>${t}<small>${w}</small></span><em>${tm}</em></div>`;
    }).join("");
    const k = x.kind ? String(x.kind).replace(/melder$/i, "").toUpperCase() : "ALARM", where = [(this._sfPl().floors.find((f) => f.id === x.floor) || {}).n, x.room || x.area].filter(Boolean).join(" · ");
    const more = al.length > 1 ? `<div class="sfalm">${al.slice(1, 4).map((q) => `<span>${esc(q.name)}</span>`).join("")}</div>` : "", it = C.plan.items.find((q) => q.t === "m" && q.e === x.id), esc2 = this._sfEscapeFor(it);
    return `<div class="ov sfalov"></div><div class="sfal" role="alertdialog" aria-modal="true" aria-label="Alarm ${esc(x.name)}">
      <div class="sfalt"><span class="sfalp">ALARM · ${esc(k)}</span><b>${esc(x.name)}</b><small>${esc(where || x.kind)} · seit ${this._sfFmtS(el)}</small>${more}<div class="sfals">${steps}</div>
        ${esc2 ? `<div class="sfalf">${ic("door", 16)}<span>${esc2.route.fallback ? `Nächste Tür (${esc(esc2.fl)}): Luftlinie im Grundriss. Plan prüfen.` : `Fluchtweg ca. ${num(esc2.route.m, 0)} m im Grundriss grün eingezeichnet. Plan prüfen.`}</span></div>` : ""}</div>
      <div class="sfalr"><div class="sfali">${it && C.plan.items.some((q) => q.fl === it.fl && (q.t === "r" || q.t === "w")) ? `<svg class="sfpm" viewBox="0 0 800 480" role="img" aria-label="Grundriss mit Fluchtweg">${this._sfPlanInner(it.fl, false)}</svg>` : this._sfScene("alarm", S.det && !S.error ? S.det : this._sfxLocal())}</div>
        <button class="sfok" data-act="sfxack" data-k="${al.length > 1 ? "" : esc(x.id)}">${al.length > 1 ? "Alle verstanden" : "Verstanden"}</button>
        <div class="sffc"><button data-act="sfxack" data-k="${esc(x.id)}" data-why="Toast">Fehlalarm: Toast</button><button data-act="sfxack" data-k="${esc(x.id)}" data-why="Dampf">Dampf</button><button data-act="sfxack" data-k="${esc(x.id)}" data-why="Test">Test</button><a href="tel:112" class="sf112">${ic("alert", 15)} 112 anrufen</a><button data-act="sfxalgo">Grundriss</button></div></div></div>`;
  }
  /* ---- Sponsor-Extra: Sicherheitsbericht (Alarme, Fehlalarme, ausgeschaltete Melder, Batterie-Prognose der letzten 90 Tage) */
  _sfxBericht() {
    const T = this._sfStat(), { C, l, S } = T, P = C.proto, now = Date.now(), cut = now - 90 * 864e5, fl = (id) => (C.plan.floors.find((f) => f.id === id) || {}).n || "";
    const ev = (S.log || []).filter((x) => new Date(x.t).getTime() >= cut && (x.c === "alarm" || x.c === "ack" || /Verstanden|Fehlalarm|Ausgeschaltet|Eingeschaltet/.test(x.x)));
    const fa = l.reduce((n, x) => n + (x.fa_n || 0), 0), al = ev.filter((x) => /^Alarm:/.test(x.x)).length;
    const rows = l.map((x) => `<tr><td>${esc(x.name)}</td><td>${esc([fl(x.floor), x.room || x.area].filter(Boolean).join(" · ") || "–")}</td><td>${x.paused ? "ausgeschaltet" + (x.paused.until ? " bis " + esc(this._sfDate(x.paused.until)) : "") : x.alarm ? "ALARM" : x.off ? "nicht erreichbar" : x.bat != null && x.bat < C.bat.pct ? "Batterie schwach" : "in Ordnung"}</td><td>${x.bat != null ? num(x.bat, 0) + " %" : "–"}</td><td>${x.bat_days != null ? "~ " + esc(this._sfDur(x.bat_days)) : "–"}</td><td>${esc(this._sfDate(x.tested || (S.test || {}).last))}</td><td>${x.fa_n || 0}${x.fa_why && x.fa_why.length ? " (" + esc([...new Set(x.fa_why)].join(", ")) + ")" : ""}</td></tr>`).join("");
    const yr = new Date().getFullYear(), li = ev.slice(0, 40).map((x) => `<li>${esc(new Date(x.t).toLocaleDateString("de-DE"))} ${esc(new Date(x.t).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }))}: ${esc(x.x)}</li>`).join("");
    return `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Sicherheitsbericht ${yr}</title><style>body{font:14px/1.45 system-ui,sans-serif;margin:32px;color:#111}h1{font-size:22px;margin:0 0 4px}table{border-collapse:collapse;width:100%;margin:14px 0}th,td{border:1px solid #bbb;padding:6px 8px;text-align:left;font-size:12.5px}th{background:#eee}.k{display:flex;gap:28px;margin:10px 0;flex-wrap:wrap}.k div{background:#f3f4f6;border-radius:10px;padding:8px 14px}.k b{display:block;font-size:20px}small{color:#555}</style></head><body><h1>Sicherheitsbericht Rauch- und Sicherheitsmelder</h1><small>${esc(P.name) || "Haushalt"}${P.addr ? " · " + esc(P.addr) : ""} · Zeitraum: letzte 90 Tage · erstellt am ${new Date().toLocaleDateString("de-DE")} mit Strom &amp; Wärme</small>
      <div class="k"><div><b>${T.act.length}</b>Melder aktiv</div><div><b>${T.pa.length}</b>ausgeschaltet</div><div><b>${al}</b>Alarme</div><div><b>${fa}</b>Fehlalarme</div><div><b>${T.low.length}</b>Batterie schwach</div></div>
      <table><thead><tr><th>Melder</th><th>Ort</th><th>Zustand</th><th>Batterie</th><th>Prognose</th><th>Zuletzt geprüft</th><th>Fehlalarme (90 Tage)</th></tr></thead><tbody>${rows || `<tr><td colspan="7">Keine Melder</td></tr>`}</tbody></table>
      ${li ? `<b>Alarme, Quittierungen und Ausschalten</b><ul>${li}</ul>` : `<p>In den letzten 90 Tagen gab es keine Alarme.</p>`}
      <small>Dieser Bericht ersetzt kein Prüfprotokoll nach Norm. Das Modul ersetzt keine zertifizierten Rauchmelder.</small></body></html>`;
  }
  /* ---- PDF: Prüfprotokoll und Sicherheitsbericht als echte Datei (A4, Tabelle, Seitenzahl) mit dem PDF-Schreiber von Modul 8 */
  _sfxPdf(kind) {
    try {
      const T = this._sfStat(), { C, l, S } = T, P = C.proto, yr = new Date().getFullYear(), now = Date.now(), fl = (id) => (C.plan.floors.find((f) => f.id === id) || {}).n || "", ort = (x) => [fl(x.floor), x.room || x.area].filter(Boolean).join(" · ") || "–";
      const bat = (x) => (x.bat != null ? num(x.bat, 0) + " %" : "–"), when = (t) => this._sfDate(t || (S.test || {}).last);
      const bericht = kind === "bericht", cut = now - 90 * 864e5;
      const ev = bericht ? (S.log || []).filter((x) => new Date(x.t).getTime() >= cut && (x.c === "alarm" || /Verstanden|Fehlalarm|Ausgeschaltet|Eingeschaltet/.test(x.x))).slice(0, 40) : (S.log || []).filter((x) => new Date(x.t).getFullYear() === yr).slice(0, 20);
      const evl = ev.map((x) => `${new Date(x.t).toLocaleDateString("de-DE")}${bericht ? " " + new Date(x.t).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : ""}: ${x.x}`);
      let cols, rows, head;
      if (bericht) {
        const fa = l.reduce((n, x) => n + (x.fa_n || 0), 0), al = ev.filter((x) => /^Alarm:/.test(x.x)).length;
        head = [`${T.act.length} Melder aktiv · ${T.pa.length} ausgeschaltet · ${al} Alarme · ${fa} Fehlalarme · ${T.low.length} Batterie schwach`];
        cols = [["Melder", 40, 0, 115], ["Ort", 160, 0, 80], ["Zustand", 244, 0, 82], ["Batterie", 366, 1, 36], ["Prognose", 374, 0, 58], ["Geprüft", 436, 0, 56], ["Fehlalarme", 555, 1, 40]];
        rows = l.map((x) => [x.name, ort(x), x.paused ? "ausgeschaltet" : x.alarm ? "ALARM" : x.off ? "nicht erreichbar" : x.bat != null && x.bat < C.bat.pct ? "Batterie schwach" : "in Ordnung", bat(x), x.bat_days != null ? "~ " + this._sfDur(x.bat_days) : "–", when(x.tested), String(x.fa_n || 0)]);
      } else {
        head = [`Name: ${P.name || "______________________"}   Adresse: ${P.addr || "______________________"}`, `Geprüft von: ${P.who || "______________________"}`];
        cols = [["Melder", 40, 0, 120], ["Ort", 164, 0, 82], ["Eingebaut", 250, 0, 50], ["Tausch bis", 304, 0, 52], ["Geprüft", 360, 0, 56], ["Batterie", 462, 1, 40], ["Ergebnis", 470, 0, 85]];
        rows = l.map((x) => [x.name, ort(x), this._sfMon(x.inst) || "–", x.inst && x.life ? this._sfMon((+x.inst.slice(0, 4) + x.life) + x.inst.slice(4)) : "–", when(x.tested), bat(x), x.life_days != null && x.life_days < 0 ? "Tausch fällig" : x.bat != null && x.bat < C.bat.pct ? "Batterie schwach" : x.off ? "nicht erreichbar" : "in Ordnung"]);
      }
      const title = bericht ? "Sicherheitsbericht Rauch- und Sicherheitsmelder" : `Prüfprotokoll Rauch- und Sicherheitsmelder ${yr}`, today = new Date().toLocaleDateString("de-DE");
      const sub = bericht ? `${P.name || "Haushalt"}${P.addr ? " · " + P.addr : ""} · letzte 90 Tage · erstellt am ${today} mit Strom & Wärme` : `Erstellt am ${today} mit Strom & Wärme`;
      const pages = []; let ops = [], y = 0, pno = 0;
      const Tx = (x, yy, v, s, b, c) => ops.push({ t: "text", x, y: yy, v, s, b, c }), Tr = (xr, yy, v, s, b, c) => Tx(xr - this._pdfW(v, s, b), yy, v, s, b, c), Ln = (yy, c, w) => ops.push({ t: "line", x1: 40, x2: 555, y: yy, c, w });
      const hdr = () => {
        ops = []; pno++; y = 800;
        if (pno === 1) { Tx(40, y, title, 16, true); y -= 17; Tx(40, y, this._pdfFit(sub, 9, 515), 9, false, "0.33 0.33 0.33"); y -= 20; head.forEach((h) => { Tx(40, y, this._pdfFit(h, 10, 515), 10); y -= 15; }); y -= 8; } else { Tx(40, y, title + " (Fortsetzung)", 10, true); y -= 22; }
        ops.push({ t: "rect", x: 40, y: y - 5, w: 515, h: 17, c: "0.94 0.95 0.96" });
        cols.forEach(([t, x, r]) => (r ? Tr(x, y, t, 8.5, true) : Tx(x + (x === 40 ? 4 : 0), y, t, 8.5, true))); y -= 19;
      };
      const end = () => { Tx(40, 30, bericht ? "Dieser Bericht ersetzt kein Prüfprotokoll nach Norm. Das Modul ersetzt keine zertifizierten Rauchmelder." : "Strom & Wärme · Modul 11", 7.5, false, "0.45 0.45 0.45"); pages.push(ops); };
      hdr();
      rows.forEach((r) => {
        if (y < 70) { end(); hdr(); }
        cols.forEach(([, x, rr, w], i) => { const v = this._pdfFit(r[i], 8.5, w, false); if (rr) Tr(x, y, v, 8.5); else Tx(x + (x === 40 ? 4 : 0), y, v, 8.5, r[i] === "ALARM", r[i] === "ALARM" ? "0.8 0.1 0.1" : undefined); });
        Ln(y - 5); y -= 16;
      });
      if (!rows.length) { Tx(44, y, "Keine Melder", 9); y -= 16; }
      y -= 8;
      if (evl.length) { if (y < 90) { end(); hdr(); } Tx(40, y, bericht ? "Alarme, Quittierungen und Ausschalten" : `Ereignisse ${yr}`, 10, true); y -= 15; evl.forEach((t) => { if (y < 60) { end(); hdr(); } Tx(44, y, this._pdfFit("• " + t, 8.5, 508), 8.5); y -= 13; }); }
      else if (bericht) { Tx(40, y, "In den letzten 90 Tagen gab es keine Alarme.", 9.5); y -= 15; }
      if (!bericht) { if (y < 100) { end(); hdr(); } y -= 28; Ln(y, "0.2 0.2 0.2", 0.8); Tx(40, y - 11, "Datum", 8.5, false, "0.33 0.33 0.33"); ops.push({ t: "line", x1: 300, x2: 555, y, c: "0.2 0.2 0.2", w: 0.8 }); Tx(300, y - 11, "Unterschrift", 8.5, false, "0.33 0.33 0.33"); }
      end();
      pages.forEach((p, i) => p.push({ t: "text", x: 555 - this._pdfW(`Seite ${i + 1} von ${pages.length}`, 8), y: 30, v: `Seite ${i + 1} von ${pages.length}`, s: 8, c: "0.45 0.45 0.45" }));
      this._sfDeliver(this._pdfBytes(pages), `${bericht ? "Sicherheitsbericht" : "Pruefprotokoll-Melder"}-${yr}.pdf`, "application/pdf", bericht ? "Sicherheitsbericht" : "Prüfprotokoll Melder");
    } catch (e) { this._toast("PDF konnte nicht erstellt werden"); }
  }
  /* ---- Aktionen */
  _sfxAlarmAct(a, b) {
    const k = b.dataset.k, s = Number(b.dataset.s), ws = (msg, ok) => this._hass.callWS(msg).then((r) => { this._sfxD = { d: r || {}, ts: Date.now() }; this._render(); if (this._modal && ["sfdet", "sfset"].includes(this._modal.type)) this._renderModal(); if (ok) this._toast(ok); }).catch(() => this._toast("Das hat nicht geklappt"));
    if (a === "sfxbericht") { if (!this._spnS().active) { this._toast("Der Sicherheitsbericht ist ein Sponsor-Extra"); return true; } this._sfxPdf("bericht"); return true; }
    if (a === "sfxack") { ws({ type: "fenster_heizung/sf_ack", ent: k || undefined, why: b.dataset.why || undefined }, b.dataset.why ? "Verstanden, als Fehlalarm gemerkt" : "Verstanden"); if (this._modal && this._modal.type === "sfalarm") { this._sfxD = { d: { ...this._sfx(), det: (this._sfx().det || []).map((x) => (!k || x.id === k ? { ...x, ack: new Date().toISOString() } : x)) }, ts: Date.now() }; this._modal = null; this._renderModal(); } return true; }
    if (a === "sfxalgo") { this._modal = null; this._renderModal(); this._sfT = "pl"; try { localStorage.setItem("fh_sf_tab", "pl"); } catch (_) { /* privater Modus */ } this._render(); return true; }
    if (a === "sfxpause") { ws({ type: "fenster_heizung/sf_pause", ent: k, days: Number(b.dataset.d) || 0 }, "Melder ausgeschaltet"); return true; }
    if (a === "sfxresume" || a === "sfxwarn") { ws({ type: "fenster_heizung/sf_resume", ent: k, warn: a === "sfxwarn" }, a === "sfxwarn" ? "Du wirst weiter gewarnt" : "Melder wieder eingeschaltet"); return true; }
    if (a === "sfxstg") { this._sfxPatch((c) => { c.stages[k].on = !c.stages[k].on; }); return true; }
    if (a === "sfxstgs") { const m = { s2: [5, 120, 5], s3: [30, 900, 30], s4: [60, 1800, 60] }[k]; this._sfxPatch((c) => { c.stages[k].sec = Math.max(m[0], Math.min(m[1], c.stages[k].sec + s * m[2])); }); return true; }
    if (a === "sfxoam") { this._sfxPatch((c) => { c.offask.mode = k; }); return true; }
    if (a === "sfxoad") { this._sfxPatch((c) => { c.offask.days = Math.max(1, Math.min(60, c.offask.days + s)); }); return true; }
    return false;
  }
