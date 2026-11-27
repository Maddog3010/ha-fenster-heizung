  /* ================= Tablet-Modus · Stufe 6: Abrechnungen (Modul 20) ohne Scrollen (2026.11.5b14) =================
     Reiter Sparten (je Vertrag eine Karte mit Hochrechnung, Abschlag und Fortschritt; unten, was zu tun ist), Zähler (großer Ziffernblock
     mit sofortiger Prüfung) und Abschläge (Empfehlung je Sparte, Kosten gegen gezahlte Abschläge als Kurve).
     Beträge stehen erst nach dem Antippen von „Beträge zeigen“ da (2 Minuten). Zählerstände eintragen geht ohne PIN,
     Verträge, Rechnungen, Fahrtkosten und Vorräte öffnen nach der PIN die ganze Seite des Moduls. Die Daten holt die Seite selbst über das Addon. */
  static TM2_AB_SP = { strom: ["Strom", "energy", "#fbbf24", "kWh"], gas: ["Gas", "flame", "#fb923c", "kWh"], wasser: ["Wasser", "drop", "#38bdf8", "m³"], einspeisung: ["Einspeisung", "sun", "#34d399", "kWh"] };
  _tm2AbOn() { return this._adOn("abrechnung"); }
  _tm2AbS() { return this._tm2AbSt || (this._tm2AbSt = { d: null, ts: 0, err: "" }); }
  _tm2AbLoad(force) {
    if (!this._hass || this._tm2AbBusy || !this._tm2AbOn()) return;
    const S = this._tm2AbS();
    if (!force && S.d && Date.now() - S.ts < 60000) return;
    if (!force && !S.d && S.err && Date.now() - S.ts < 15000) return;
    this._tm2AbBusy = true;
    this._adApi().call("abrechnung", "get", {}).then((d) => { S.d = d; S.ts = Date.now(); S.err = ""; }).catch((e) => { S.err = (e && e.message) || "Keine Antwort"; S.ts = Date.now(); })
      .finally(() => { this._tm2AbBusy = false; if (this._tm2Shows("abrechnung")) this._render(); });
  }
  _tm2AbReady() { return this._tm2AbOn() && !!this._tm2AbS().d; }
  _tm2AbAmt() { return Date.now() < (this._tm2AbRev || 0); }
  _tm2AbEur(v, dec = 0) { return v == null ? "–" : this._tm2AbAmt() ? `${num(v, dec)} €` : "••• €"; }
  _tm2AbStatus() {
    if (!this._tm2AbOn()) return "Addon aus";
    this._tm2AbLoad();
    const S = this._tm2AbS(); if (!S.d) return S.err ? "Nicht geladen" : "Wird geladen";
    const C = S.d.cards || {}, ks = Object.keys(C).filter((k) => C[k]);
    if (!ks.length) return "Noch keine Verträge";
    const K = this.constructor.TM2_AB_SP, bad = ks.filter((k) => C[k].fc && C[k].fc.ergebnis != null && C[k].fc.ergebnis < 0).map((k) => (K[k] || [k])[0]);
    return `${ks.length} ${ks.length === 1 ? "Vertrag" : "Verträge"} · ${bad.length ? `Nachzahlung droht: ${bad.join(", ")}` : "Hochrechnung im Plan"}`;
  }
  _tm2Ab() {
    if (!this._tm2AbOn()) return this._tm2None("chart", "Das Abrechnungs-Addon ist aus.");
    this._tm2AbLoad();
    const S = this._tm2AbS();
    if (!S.d) return this._tm2None(S.err ? "alert" : "chart", S.err ? "Abrechnungen konnten nicht geladen werden." : "Abrechnungen werden geladen …", S.err ? esc(S.err) : "");
    const t = this._tm2Tab("abrechnung");
    return t === "rd" ? this._tm2AbRd(S.d) : t === "pay" ? this._tm2AbPay(S.d) : this._tm2AbSp(S.d);
  }
  /* Was zu tun ist: Fristen, Preisänderungen, Abschläge und Zähler, die lange nicht abgelesen wurden */
  _tm2AbTodo(d) {
    const out = (d.events || []).map((e) => ({ t: e.t, s: `${e.s ? e.s + " · " : ""}${e.tage === 0 ? "heute" : e.tage === 1 ? "morgen" : `in ${e.tage} Tagen`}`, w: e.c === "wa", n: e.tage }));
    (d.meters || []).filter((m) => !m.sensor && (m.used || []).length && m.last).forEach((m) => {
      const days = Math.floor((Date.now() - new Date(m.last.t).getTime()) / 864e5);
      if (isFinite(days) && days >= 40) out.push({ t: `${m.name} ablesen`, s: `zuletzt vor ${days} Tagen`, w: days >= 70, n: -days });
    });
    return out.sort((a, b) => (b.w - a.w) || (a.n - b.n));
  }
  _tm2AbBar(d, canShow) {
    return `<div class="tm2abbar"><button class="tm2mini" data-act="tm2abrev">${ic(this._tm2AbAmt() ? "eyeOff" : "eye", 16)}${this._tm2AbAmt() ? "Beträge verbergen" : "Beträge zeigen"}</button>${canShow ? `<button class="tm2mini" data-act="tm2g" data-g="tm2abfull" data-k="on">${ic(this._tmMe().has_pin ? "lock" : "more", 16)}Mehr im Modul</button>` : ""}</div>`;
  }
  /* Kleine Kurve ohne Zahlen: Kosten (Farbe der Sparte) gegen gezahlte Abschläge (weiß) über das Abrechnungsjahr */
  _tm2AbSpark(f, col) {
    const M = f && f.monate; if (!M || M.length < 2) return `<div class="tm2abs"></div>`;
    const top = Math.max(1, ...M.map((x) => Math.max(x.cum_k || 0, x.cum_z || 0))) * 1.15, X = (i) => (300 * i) / (M.length - 1), Y = (v) => 100 - (92 * v) / top;
    const pts = (key) => M.map((x, i) => `${X(i).toFixed(1)},${Y(x[key] || 0).toFixed(1)}`).join(" "), id = `tm2g${String(col).replace(/\W/g, "")}`;
    return `<div class="tm2abs" aria-hidden="true"><svg viewBox="0 0 300 100" preserveAspectRatio="none"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".38"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>
      <line x1="0" y1="99" x2="300" y2="99" stroke="rgba(127,127,127,.35)" stroke-width="1" vector-effect="non-scaling-stroke"/>
      <polygon points="0,100 ${pts("cum_k")} 300,100" fill="url(#${id})"/>
      <polyline points="${pts("cum_z")}" fill="none" stroke="rgba(230,237,243,.7)" stroke-width="2" stroke-dasharray="5 5" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
      <polyline points="${pts("cum_k")}" fill="none" stroke="${col}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg></div>`;
  }
  _tm2AbSp(d) {
    const K = this.constructor.TM2_AB_SP, land = this._tm2Land(), C = d.cards || {}, list = Object.keys(K).filter((k) => C[k]);
    if (!list.length) return `<div class="card empty tm2none">${ic("chart", 44)}<div>Noch keine Verträge.</div><small>Verträge und Zähler legst du im Modul am Handy oder Rechner an.</small>${this._tm2AbBar(d, this._admin())}</div>`;
    const CT = Object.fromEntries((d.contracts || []).map((c) => [c.id, c]));
    const card = (k) => {
      const c = C[k], f = c.fc, [name, ico, col, unit] = K[k], ct = CT[c.id] || {}, sub = [ct.anbieter, ct.tarif].filter(Boolean).join(" · ");
      let cap = "Noch keine Hochrechnung", big = "–", tone = "";
      if (f) {
        if (f.ergebnis != null) { const pos = f.ergebnis >= 0; cap = k === "einspeisung" ? (pos ? "Gutschrift erwartet" : "Rückzahlung droht") : pos ? "Guthaben erwartet" : "Nachzahlung droht"; big = this._tm2AbEur(Math.abs(f.ergebnis)); tone = pos ? "ok" : "bad"; }
        else { cap = k === "einspeisung" ? "Vergütung bis Jahresende" : "Kosten bis Jahresende"; big = this._tm2AbEur(f.total); }
      }
      const pc = f && f.total > 0 ? Math.min(100, Math.round(((f.bisher || 0) / f.total) * 100)) : 0, pz = f && f.total > 0 ? Math.min(100, Math.round(((f.gezahlt || 0) / f.total) * 100)) : 0;
      const E = f && f.empf, ab = E && E.show && E.neu ? `<em class="rec">${ic("up", 15)}Abschlag auf ${this._tm2AbEur(E.neu)} ändern<small>statt ${this._tm2AbEur(E.alt)}</small></em>` : E && E.alt ? `<em>Abschlag ${this._tm2AbEur(E.alt)}</em>` : f && f.zahl === "monat" ? `<em>monatlich abgerechnet</em>` : `<em>&nbsp;</em>`;
      const px = c.u && c.u.ct != null && unit === "kWh" ? `${num(c.u.ct, 1)} ct/kWh` : "";
      return `<div class="tm2abc ${tone}" style="--a:${col}"><div class="tm2abh"><span class="i">${ic(ico, 22)}</span><span class="t"><b>${name}</b><small>${esc(sub) || "&nbsp;"}</small></span></div>
        ${this._tm2AbSpark(f, col)}<div class="tm2abk"><small>${cap}</small><b>${big}</b></div>
        <div class="tm2abp" role="img" aria-label="Kosten bisher ${pc} Prozent, Abschläge gezahlt ${pz} Prozent"><i class="k" style="width:${pc}%"></i><i class="z" style="left:${pz}%"></i></div>
        <div class="tm2abl"><span>bisher ${this._tm2AbEur(f ? f.bisher : null)}</span><span>${f ? `Abschläge ${this._tm2AbEur(f.gezahlt)}` : ""}</span></div>${ab}<small class="tm2abx">${esc([f ? `Jahr bis ${this._wtDay(f.ende)}` : "", px].filter(Boolean).join(" · "))}</small></div>`;
    };
    const todo = this._tm2AbTodo(d).slice(0, land ? 3 : 2);
    const td = `<div class="card tm2cc tm2abt"><div class="tm2sh"><span>${ic("check", 18)}Was zu tun ist</span>${this._tm2AbBar(d, this._admin())}</div>${todo.length ? `<div class="tm2abtl">${todo.map((x) => `<div class="${x.w ? "w" : ""}"><b>${esc(x.t)}</b><small>${esc(x.s)}</small></div>`).join("")}</div>` : `<div class="tm2note" style="margin:6px 0 2px">Gerade ist nichts zu tun.</div>`}</div>`;
    const cols = land ? list.length : 2;
    return `<div class="tm2ab"><div class="tm2abg" style="--c:${Math.max(1, cols)}">${list.map(card).join("")}</div>${td}</div>`;
  }
  /* Zähler ablesen: großer Ziffernblock, Prüfung gegen den Verlauf noch vor dem Speichern */
  _tm2AbNum(s) { if (!s || s === ",") return null; const n = parseFloat(String(s).replace(",", ".")); return isFinite(n) ? n : null; }
  _tm2AbCheck() {
    const K = this._tm2AbK; if (!K) return;
    clearTimeout(K.t); const v = this._tm2AbNum(K.v), id = K.mid, val = K.v; if (v == null) { K.chk = null; return; }
    K.t = setTimeout(() => this._adApi().call("abrechnung", "check", { id, v }).then((r) => { if (K.mid === id && K.v === val) { K.chk = r; if (this._tm2Shows("abrechnung")) this._render(); } }).catch(() => { /* ohne Prüfung bleibt Speichern gesperrt */ }), 350);
  }
  _tm2AbRd(d) {
    const ms = d.meters || [], land = this._tm2Land();
    if (!ms.length) return `<div class="card empty tm2none">${ic("gauge", 44)}<div>Noch keine Zähler.</div><small>Zähler legst du im Modul am Handy oder Rechner an.</small></div>`;
    const K = this._tm2AbK || (this._tm2AbK = { mid: "", v: "", chk: null, busy: false });
    if (!ms.some((m) => m.id === K.mid)) { K.mid = ms[0].id; K.v = ""; K.chk = null; }
    const m = ms.find((x) => x.id === K.mid), dec = Math.max(0, m.dec | 0), f = (v) => (v == null ? "–" : num(v, dec));
    const lt = m.last ? new Date(m.last.t) : null, when = lt && isFinite(lt) ? `${lt.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })} ${lt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr` : "";
    const chips = `<div class="tm2abms">${ms.map((x) => `<button class="${x.id === K.mid ? "sel" : ""}" data-act="tm2abm" data-k="${esc(x.id)}" aria-pressed="${x.id === K.mid}"><b>${esc(x.name)}</b><small>${x.last ? `${num(x.last.v, Math.max(0, x.dec | 0))} ${esc(x.unit)}` : "kein Stand"}</small></button>`).join("")}</div>`;
    const info = `<div class="card tm2cc tm2abi"><div class="tm2sh"><span>${ic("gauge", 18)}${esc(m.name)}</span>${m.sensor ? `<em>automatisch</em>` : ""}</div>
      <div class="tm2abkv"><div><small>Letzter Stand</small><b>${f(m.last && m.last.v)} <small>${esc(m.unit)}</small></b><small>${esc(when) || "noch nie abgelesen"}</small></div>
      ${m.expect != null ? `<div><small>Erwartet jetzt</small><b>${f(m.expect)} <small>${esc(m.unit)}</small></b><small>nach deinem Verbrauch</small></div>` : ""}
      ${m.rate != null ? `<div><small>Verbrauch je Tag</small><b>${num(m.rate, m.rate < 10 ? 1 : 0)} <small>${esc(m.unit)}</small></b><small>Durchschnitt der letzten Wochen</small></div>` : ""}
      ${lt && isFinite(lt) ? `<div><small>Zuletzt abgelesen</small><b>vor ${Math.max(0, Math.floor((Date.now() - lt.getTime()) / 864e5))} <small>Tagen</small></b><small>${m.last && m.last.src === "sensor" ? "automatisch" : "von Hand"}</small></div>` : ""}
      ${m.sensor && m.live != null ? `<div><small>Aktuell (Sensor)</small><b>${f(m.live)} <small>${esc(m.unit)}</small></b><small>wird automatisch gespeichert</small></div>` : ""}
      ${m.nr ? `<div><small>Zählernummer</small><b class="nr">${esc(m.nr)}</b></div>` : ""}</div></div>`;
    const v = this._tm2AbNum(K.v), chk = K.chk, lvl = chk ? chk.level : "";
    const msg = v == null ? "Stand eintippen, die Prüfung läuft von selbst." : chk ? chk.msg : "Wird geprüft …";
    const can = v != null && chk && lvl !== "bad" && !K.busy, key = (k, l, cls = "") => `<button class="tm2abkey ${cls}" data-act="tm2abk" data-k="${k}" ${k === "," && dec < 1 ? "disabled" : ""} aria-label="${k === "bk" ? "Zeichen löschen" : k === "clr" ? "Alles löschen" : l}">${l}</button>`;
    const pad = `<div class="card tm2cc tm2abpad"><div class="tm2abd ${lvl}"><b>${esc(K.v || "–")}</b><span>${esc(m.unit)}</span></div><div class="tm2abmsg ${lvl}">${ic(lvl === "bad" ? "alert" : lvl === "warn" ? "info" : lvl === "ok" ? "check" : "clock", 18)}<span>${esc(msg)}</span></div>
      <div class="tm2abkeys">${["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((k) => key(k, k)).join("")}${key(",", ",")}${key("0", "0")}${key("bk", ic("back", 24), "fn")}</div>
      <div class="tm2abgo"><button class="btn2" data-act="tm2abk" data-k="clr" ${K.v ? "" : "disabled"}>Leeren</button><button class="btn2 pri" data-act="tm2absave" ${can ? "" : "disabled"}>${ic("check", 20)}${lvl === "warn" ? "Trotzdem speichern" : K.busy ? "Speichert …" : "Speichern"}</button></div></div>`;
    return `<div class="tm2abr">${chips}<div class="tm2abrb${land ? "" : " port"}">${info}${pad}</div></div>`;
  }
  /* Abschläge: Empfehlung je Sparte, rechts Kosten gegen gezahlte Abschläge */
  _tm2AbPay(d) {
    const K = this.constructor.TM2_AB_SP, C = d.cards || {}, list = Object.keys(K).filter((k) => C[k] && C[k].fc), land = this._tm2Land();
    if (!list.length) return `<div class="card empty tm2none">${ic("chart", 44)}<div>Noch keine Hochrechnung.</div><small>Sobald ein Vertrag mit Zähler oder Jahresverbrauch da ist, zeigt diese Seite die Abschläge.</small></div>`;
    const sel = list.includes(this._tm2AbSel) ? this._tm2AbSel : list[0];
    const row = (k) => {
      const [name, ico, col] = K[k], f = C[k].fc, E = f.empf, on = k === sel;
      const rec = f.zahl === "monat" ? `<em>monatlich abgerechnet</em>` : E && E.show && E.neu ? `<em class="rec">Empfehlung ${this._tm2AbEur(E.neu)}${E.ab ? `<small>ab ${this._wtDay(E.ab)}</small>` : ""}</em>` : E && E.next ? `<em>fürs nächste Jahr ${this._tm2AbEur(E.next)}</em>` : `<em class="ok">${ic("check", 14)}passt</em>`;
      return `<button class="tm2abrw${on ? " sel" : ""}" data-act="tm2absel" data-k="${k}" style="--a:${col}" aria-pressed="${on}"><span class="i">${ic(ico, 20)}</span><span class="t"><b>${name}</b><small>${f.deckung != null ? `${f.deckung} % gedeckt` : "ohne Abschlag"}</small></span><span class="v"><b>${E && E.alt ? this._tm2AbEur(E.alt) : "–"}</b><small>Abschlag</small></span>${rec}</button>`;
    };
    const [sn, , sc] = K[sel];
    return `<div class="tm2abpy${land ? "" : " port"}"><div class="tm2abrs">${list.map(row).join("")}</div><div class="card tm2cc tm2abch"><div class="tm2sh"><span>${ic("chart", 18)}Kosten gegen Abschläge · ${sn}</span><span class="tm2legend"><i style="background:#f59e0b"></i>Kosten<i style="background:${sc === "#60a5fa" ? "#a78bfa" : "#60a5fa"}"></i>Abschläge</span></div>
      <div class="tm2abcb" data-tm2ch="abpay" data-k="${sel}"></div><small class="tm2note">${this._tm2AbAmt() ? "Kosten hochgerechnet bis zum Ende des Abrechnungsjahrs" : "Beträge sind verborgen – oben links „Beträge zeigen“ im Reiter Sparten"}</small></div></div>`;
  }
  _tm2AbChart(box, w, h) {
    const K = this.constructor.TM2_AB_SP, d = this._tm2AbS().d, sel = box.dataset.k, c = d && d.cards && d.cards[sel], M = c && c.fc && c.fc.monate;
    if (!M || M.length < 2) { box.innerHTML = ""; return; }
    const amt = this._tm2AbAmt(), padL = amt ? 58 : 14, padR = 14, padT = 14, padB = 26, pw = w - padL - padR, ph = h - padT - padB, n = M.length;
    const top = Math.max(1, ...M.map((x) => Math.max(x.cum_k || 0, x.cum_z || 0))) * 1.08, X = (i) => padL + (pw * i) / (n - 1), Y = (v) => padT + ph - (ph * v) / top;
    const line = (key, col, dash) => `<polyline points="${M.map((x, i) => `${X(i).toFixed(1)},${Y(x[key] || 0).toFixed(1)}`).join(" ")}" fill="none" stroke="${col}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
    const todayM = (d.today || "").slice(0, 7), ti = M.findIndex((x) => x.m === todayM), ticks = [0, 0.5, 1].map((q) => { const v = top * q; return `<line x1="${padL}" x2="${w - padR}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="tm2abgl"/>${amt ? `<text x="${padL - 8}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end" class="tm2abax">${num(v, 0)} €</text>` : ""}`; }).join("");
    const xs = M.map((x, i) => (n <= 13 || i % 2 === 0 ? `<text x="${X(i).toFixed(1)}" y="${h - 6}" text-anchor="middle" class="tm2abax">${esc(String(x.l || "").slice(0, 3))}</text>` : "")).join("");
    const now = ti >= 0 ? `<line x1="${X(ti).toFixed(1)}" x2="${X(ti).toFixed(1)}" y1="${padT}" y2="${padT + ph}" class="tm2abnow"/><text x="${X(ti).toFixed(1)}" y="${padT - 3}" text-anchor="middle" class="tm2abax">heute</text>` : "";
    box.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Kosten und Abschläge im Abrechnungsjahr">${ticks}${now}${line("cum_k", "#f59e0b")}${line("cum_z", (K[sel] || [])[2] === "#60a5fa" ? "#a78bfa" : "#60a5fa", "")}${xs}</svg>`;
  }
  _tm2AbAct(a, b) {
    const k = b.dataset.k, S = this._tm2AbS();
    if (a === "tm2abrev") { const on = this._tm2AbAmt(); this._tm2AbRev = on ? 0 : Date.now() + 120000; clearTimeout(this._tm2AbRt); if (!on) this._tm2AbRt = setTimeout(() => { if (this._tm2Shows("abrechnung")) this._render(); }, 120500); this._render(); return true; }
    if (a === "tm2absel") { this._tm2AbSel = k; this._render(); return true; }
    if (a === "tm2abm") { const K = this._tm2AbK || (this._tm2AbK = { mid: "", v: "", chk: null, busy: false }); K.mid = k; K.v = ""; K.chk = null; this._render(); return true; }
    if (a === "tm2abk") {
      const K = this._tm2AbK; if (!K || K.busy) return true;
      const m = ((S.d && S.d.meters) || []).find((x) => x.id === K.mid); if (!m) return true;
      let v = K.v; const dec = Math.max(0, m.dec | 0), dig = Math.max(3, m.digits | 0);
      if (k === "bk") v = v.slice(0, -1); else if (k === "clr") v = "";
      else if (k === ",") { if (dec > 0 && v && !v.includes(",")) v += ","; }
      else if (v.includes(",")) { if (v.split(",")[1].length < dec) v += k; }
      else if (v === "0") v = k; else if (v.length < dig) v += k;
      K.v = v; K.chk = null; this._tm2AbCheck(); this._render(); return true;
    }
    if (a === "tm2absave") {
      const K = this._tm2AbK, v = K && this._tm2AbNum(K.v); if (!K || v == null || K.busy) return true;
      K.busy = true; this._render();
      this._adApi().call("abrechnung", "read", { id: K.mid, v, src: "manuell", force: !!(K.chk && K.chk.level === "warn") }).then((r) => {
        K.busy = false;
        if (r && r.saved) { if (r.cards) { S.d = r; S.ts = Date.now(); } K.v = ""; K.chk = null; this._toast("Zählerstand gespeichert"); }
        else { K.chk = (r && r.check) || K.chk; this._toast((K.chk && K.chk.msg) || "Nicht gespeichert"); }
        this._render();
      }).catch((e) => { K.busy = false; this._toast((e && e.message) || "Nicht gespeichert"); this._render(); });
      return true;
    }
    /* Ganze Seite des Moduls (Verträge, Rechnungen, Fahrtkosten, Vorräte): kommt über tm2g, also erst nach der PIN */
    if (a === "tm2abfull") {
      const s = this._mdState();
      if (k === "on") { this._tm2AbFull = true; this._tm2AbPrev = s.active; s.active = "abrechnung"; } else this._tm2AbExit();
      this._tmHomed = false; this._render(); return true;
    }
    return false;
  }
  _tm2AbExit() {
    if (!this._tm2AbFull) return;
    this._tm2AbFull = false; const s = this._mdState(); if (s.active === "abrechnung") s.active = this._tm2AbPrev || "fh";
  }
