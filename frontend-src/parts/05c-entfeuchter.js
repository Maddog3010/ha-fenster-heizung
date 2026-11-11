  /* ================= Modul 1: Luftentfeuchter =================
     Schritt 1 Gerät und Regelung, Schritt 2 tägliche Standortbestätigung, Schritt 3 „Hierher stellen“ und mehrere Geräte,
     Schritt 4 Vorziehen bei PV-Überschuss oder günstigem Strom, Statistik und Meldungen, Schritt 5 NFC-Tag am Stellplatz. Regelung im Backend (entfeuchter.py).
     Oberfläche ohne Aufklappmenüs: Kacheln, Tasten, Zahlen mit Minus und Plus. Geräte-ID in data-d. */
  _lf() {
    const D = this._lfD;
    if ((!D || Date.now() - D.ts > 20000) && !this._lfBusy && this._hass) {
      this._lfBusy = true;
      this._hass.callWS({ type: "fenster_heizung/lf_get" }).then((r) => { this._lfD = { ...(r || {}), ts: Date.now() }; this._lfBusy = false; this._render(); const ae = this.shadowRoot && this.shadowRoot.activeElement; if (this._modal && /^lf/.test(this._modal.type) && !(ae && ae.tagName === "INPUT")) this._renderModal(); })
        .catch(() => { this._lfD = { cfg: { devs: [] }, devs: {}, rooms: [], ts: Date.now(), err: true }; this._lfBusy = false; });
    }
    return D || null;
  }
  /* Eingerichtete Geräte mit ihrem Zustand: [{ ...Einstellungen, S: { loc, off_day, live, ask, hist, stats } }] */
  _lfDevs() { const D = this._lf(); if (!D || !D.cfg) return []; return (D.cfg.devs || []).filter((d) => d.ent).map((d) => ({ ...d, S: (D.devs || {})[d.id] || { live: {}, ask: {}, hist: [], stats: {} } })); }
  _lfDev(id) { const L = this._lfDevs(); return id ? L.find((d) => d.id === id) || null : L[0] || null; }
  async _lfCmd(cmd, arg = "", dev = "") {
    try { const r = await this._hass.callWS({ type: "fenster_heizung/lf_cmd", cmd, arg, dev }); this._lfD = { ...r, ts: Date.now() }; this._render(); if (this._modal && /^lf/.test(this._modal.type)) this._renderModal(); return r; }
    catch (e) { this._toast("Entfeuchter: " + ((e && e.message) || "Befehl fehlgeschlagen")); return null; }
  }
  _lfState(L) {
    if (!L || !L.code) return ["off", "–"];
    if (L.on == null) return ["off", "nicht erreichbar"];
    if (L.running) return ["run", "läuft"];
    if (L.on) return ["run", "an"];
    return { full: ["warn", "Tank voll"], window: ["wait", "pausiert"], vent: ["wait", "lüften"], day_off: ["off", "heute aus"], pause: ["warn", "pausiert"], no_hum: ["warn", "aus"], no_loc: ["off", "aus"] }[L.code] || ["off", "aus"];
  }
  _lfSince(ts) { if (!ts) return ""; const m = Math.max(0, Math.round((Date.now() / 1000 - ts) / 60)); return m < 60 ? `seit ${m} Min.` : `seit ${Math.floor(m / 60)} h ${m % 60} min`; }
  _lfRoomName(id) { const r = ((this._lf() || {}).rooms || []).find((x) => x.id === id); return r ? r.name : ""; }
  _lfEur(v) { return (Number(v) || 0).toLocaleString("de-DE", { style: "currency", currency: "EUR" }); }
  /* Auf der Raumkarte: Kasten für jedes Gerät, das hier steht, und „Hierher stellen“ für die anderen (Schritt 3) */
  _lfBox(rid) {
    const L = this._lfDevs(); if (!L.length) return "";
    return L.filter((d) => d.S.loc === rid).map((d) => this._lfBox1(d)).join("") + this._lfMove(rid);
  }
  /* „Entfeuchter hierher stellen“ für Geräte, die woanders stehen (auch in der Raumkarte 2.0) */
  _lfMove(rid) {
    const D = this._lf(), L = this._lfDevs(); if (!D || !L.length) return "";
    const canHere = (D.rooms || []).some((r) => r.id === rid), away = canHere ? L.filter((d) => d.S.loc !== rid) : [], where = (d) => (d.S.loc ? `steht in ${this._lfRoomName(d.S.loc) || "einem anderen Raum"}` : "noch kein Standort");
    if (!away.length) return "";
    if (L.length === 1) { const d = away[0]; return `<button class="lfmove" data-act="lfxmove" data-d="${esc(d.id)}" data-k="${esc(rid)}">${ic("fan", 15)}<span><b>Entfeuchter hierher stellen</b><small>${esc(where(d))}</small></span></button>`; }
    return `<div class="lfmove lfmany">${ic("fan", 15)}<span><b>Entfeuchter hierher stellen</b><span class="lfmb">${away.map((d) => `<button class="btn2" data-act="lfxmove" data-d="${esc(d.id)}" data-k="${esc(rid)}" title="${esc(where(d))}">${esc(d.name)}<small>${esc(where(d))}</small></button>`).join("")}</span></span></div>`;
  }
  _lfBox1(d) {
    const S = d.S, L = S.live || {}, [k, t] = this._lfState(L), adm = this._admin();
    const tank = L.fill != null ? `Tank ${Math.min(100, Math.round(L.fill * 100))} %` : L.full ? "Tank voll" : "";
    const sub = [L.on ? this._lfSince(L.since) : "", tank, L.today_min ? `heute ${hmin(L.today_min)}` : ""].filter(Boolean).join(" · ");
    const A = S.ask || {}, conf = !A.phase || A.phase === "off" ? "" : `<div class="lfconf ${A.conf ? "ok" : "open"}">${ic(A.conf ? "check" : "pin", 13)}${esc(A.conf ? (A.how === "auto" ? "Standort heute wie gestern übernommen" : A.how === "nfc" ? "Standort heute per NFC-Tag bestätigt" : "Standort heute bestätigt") : A.phase === "wait" ? "Standort gilt wie gestern, die Abfrage kommt später" : "Standort heute noch nicht bestätigt")}<button class="lnk" data-act="lfxhist" data-d="${esc(d.id)}">Verlauf</button></div>`;
    const boost = (L.boost ? `<em class="lfboost">${ic(L.boost === "pv" ? "sun" : "bolt", 12)}${L.boost === "pv" ? "PV" : "günstig"}</em>` : "") + (L.night ? `<em class="lfboost lfnight">${ic("moon", 12)}Nacht${L.quiet_on ? " · leise" : ""}</em>` : "");
    const msgs = (L.msgs || []).filter((m) => m[0] !== "noloc" || !A.conf).map((m) => `<div class="lfmsg">${ic("alert", 13)}${esc(m[1])}</div>`).join("");
    return `<div class="lfbox ${k}"><div class="lfh"><span class="lfi">${ic("fan", 18)}</span><div class="lft"><b>${esc(d.name)} <em class="lfhere">hier</em>${boost}</b><span>${esc(sub || (d.kind === "watch" ? "nur beobachten" : "Modul 1 regelt"))}</span></div><span class="lfst">${esc(t)}</span>${adm ? `<button class="ibtn" data-act="lfxset" data-d="${esc(d.id)}" aria-label="Entfeuchter einstellen">${ic("sliders", 16)}</button>` : ""}</div>
      ${L.fill != null ? `<div class="lfbar"><i style="width:${Math.min(100, Math.round(L.fill * 100))}%"></i></div>` : ""}
      <div class="lfwhy"><b>Warum?</b> ${esc((L.why || []).join(" "))}${L.hint ? `<br><span class="lfhint">${esc(L.hint)}</span>` : ""}</div>${msgs}${conf}
      <div class="lfbtns"><button class="btn2" data-act="lfxloc" data-d="${esc(d.id)}">${ic("pin", 15)} Standort ändern</button>${S.off_day ? `<button class="btn2" data-act="lfxon" data-d="${esc(d.id)}">${ic("check", 15)} Wieder regeln</button>` : `<button class="btn2" data-act="lfxoff" data-d="${esc(d.id)}">${ic("close", 15)} Heute aus</button>`}<button class="btn2" data-act="lfxstat" data-d="${esc(d.id)}">${ic("chart", 15)} Statistik</button>${L.full || (L.fill != null && L.fill > 0.05) ? `<button class="btn2" data-act="lfxtank" data-d="${esc(d.id)}">${ic("drop", 15)} Tank geleert</button>` : ""}${(L.msgs || []).some((m) => m[0] === "filter") ? `<button class="btn2" data-act="lfxfilt" data-d="${esc(d.id)}">${ic("check", 15)} Filter gereinigt</button>` : ""}</div></div>`;
  }
  /* Standort-Karte (Schritt 2): je Gerät ohne Standort oder ab der Uhrzeit der Abfrage, bis der Tag bestätigt ist */
  _lfLocCard() { return this._lfDevs().map((d) => this._lfLocCard1(d)).join(""); }
  _lfLocCard1(dev) {
    const D = this._lf(), S = dev.S, R = D.rooms || [], A = S.ask || {}, hasLoc = S.loc && R.some((r) => r.id === S.loc), due = A.phase === "open" || A.phase === "missed";
    this._lfPick = this._lfPick || {};
    if (hasLoc && !due) { delete this._lfPick[dev.id]; return ""; }
    const offer = R.filter((r) => !(A.offer || []).length || A.offer.includes(r.id)), list = offer.length ? offer : R, pk = this._lfPick[dev.id];
    const pick = list.some((r) => r.id === pk) ? pk : hasLoc && list.some((r) => r.id === S.loc) ? S.loc : (list.find((r) => r.id === A.yest) || list[0] || {}).id;
    const pn = (R.find((r) => r.id === pick) || {}).name || "";
    const day = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
    const state = A.how === "pause" ? `<span class="lfst2 warn">Pausiert, bis du den Standort bestätigst.</span>` : A.how === "hint" ? `<span class="lfst2 warn">Noch nicht bestätigt. Er läuft wie gestern.</span>` : S.off_day ? `<span class="lfst2">Heute nicht in Betrieb.</span>` : !hasLoc ? `<span class="lfst2">Ohne Standort bleibt er aus.</span>` : "";
    const tiles = list.length ? `<div class="lftiles">${list.map((r) => { const others = this._lfDevs().filter((o) => o.id !== dev.id && o.S.loc === r.id); return `<button class="lftile ${pick === r.id ? "sel" : ""}" data-act="lfxsel" data-d="${esc(dev.id)}" data-k="${esc(r.id)}" aria-pressed="${pick === r.id}">${this._rkMiniById(r.id, "lft")}<b>${esc(r.name)}${pick === r.id ? `<i class="lfok">${ic("check", 13)}</i>` : ""}</b><span class="${r.hum != null && r.hum > (dev.hi || 60) ? "amber" : ""}">Luftfeuchte ${r.hum != null ? num(r.hum, 0) + " %" : "–"}</span>${others.length ? `<span class="lfoth">${esc(others.map((o) => o.name).join(", "))} steht hier</span>` : ""}</button>`; }).join("")}</div>`
      : `<div class="mut sm">Kein Raum mit Luftfeuchte-Sensor gefunden. Wähle in den Raumeinstellungen einen Luftfeuchte-Sensor oder lege einen Messraum an.</div>`;
    return `<div class="card lfloc"><div class="lfh"><span class="lfi">${ic("fan", 18)}</span><div class="lft"><b>Wo steht der ${esc(dev.name)} heute?</b><span>${esc(day)}</span></div></div>
      ${tiles}<div class="lfmeta">${A.yest_name ? `Gestern: <b>${esc(A.yest_name)}</b>` : "Gestern: noch kein Eintrag"}${state}</div>
      <div class="lfbtns lfbig">${pick ? `<button class="btn2 pri" data-act="lfxconf" data-d="${esc(dev.id)}" data-k="${esc(pick)}">${ic("check", 16)} Bestätigen: ${esc(pn)}</button>` : ""}<button class="btn2" data-act="lfxoff" data-d="${esc(dev.id)}">Heute nicht in Betrieb</button><button class="btn2" data-act="lfxhist" data-d="${esc(dev.id)}">Verlauf ansehen</button></div></div>`;
  }
  _lfDevChips(cur, act) { const L = this._lfDevs(); return L.length > 1 ? `<div class="lfchips" style="margin:0 0 8px">${L.map((d) => `<button class="${d.id === cur ? "sel" : ""}" data-act="${act}" data-d="${esc(d.id)}">${esc(d.name)}</button>`).join("")}</div>` : ""; }
  /* Standortverlauf der letzten 14 Tage */
  _lfHistModal() {
    const dev = this._lfDev(this._modal.d) || { name: "Luftentfeuchter", S: { hist: [] } }, H = dev.S.hist || [];
    const how = { ok: ["ok", "bestätigt"], nfc: ["ok", "per NFC-Tag bestätigt"], auto: ["", "wie gestern übernommen"], pause: ["warn", "ohne Antwort pausiert"], hint: ["warn", "ohne Antwort, lief wie gestern"], "": ["", "nicht bestätigt"] };
    const cnt = {}; H.forEach((x) => { if (x.l) cnt[x.name || x.l] = (cnt[x.name || x.l] || 0) + 1; });
    const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]);
    const rows = H.map((x, i) => { const d = new Date(x.d + "T12:00:00"), lbl = i === 0 ? "Heute" : i === 1 ? "Gestern" : d.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" }), hw = how[x.h] || how[""];
      return `<div class="lfhr"><span class="lfhd">${esc(lbl)}</span><b class="${x.l === "off" ? "mut" : ""}">${x.l ? esc(x.name || "Raum gelöscht") : `<span class="mut">kein Eintrag</span>`}</b><span class="lfhh ${hw[0]}">${x.l ? esc(hw[1]) : ""}</span><span class="lfhm">${x.min ? hmin(x.min) : ""}</span></div>`; }).join("");
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Standortverlauf</b><span>${esc(dev.name)} · letzte 14 Tage</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      ${this._lfDevChips(dev.id, "lfxhist")}
      ${top.length ? `<div class="lsec">${ic("chart", 15)}Tage pro Raum</div>${this._lfDays(top)}` : ""}
      <div class="lsec">${ic("today", 15)}Tag für Tag</div><div class="lfhist">${rows}</div>
      <div class="foot2"><button class="btn2" data-act="lfxstat" data-d="${esc(dev.id)}">${ic("chart", 15)} Statistik</button><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _lfDays(top) { const mx = Math.max(1, ...top.map((x) => x[1])); return `<div class="lfdays">${top.map(([n, c]) => `<div><span>${esc(n)}</span><i style="width:${(c / mx) * 100}%" class="${n === "nicht in Betrieb" ? "off" : ""}"></i><b>${c} ${c === 1 ? "Tag" : "Tage"}</b></div>`).join("")}</div>`; }
  /* Statistik (Schritt 4): Laufzeit, Strom, Kosten, entfeuchtete Menge, Tage pro Raum */
  _lfStatModal() {
    const M = this._modal, dev = this._lfDev(M.d) || { name: "Luftentfeuchter", S: { stats: {} }, lph: 0 }, per = M.per || "month", T = (dev.S.stats || {})[per] || { min: 0, kwh: 0, eur: 0, lit: 0, rooms: [] };
    const P = [["day", "Heute"], ["week", "7 Tage"], ["month", "Monat"], ["year", "Jahr"]];
    const lbl = { day: "heute", week: "in den letzten 7 Tagen", month: new Date().toLocaleDateString("de-DE", { month: "long" }), year: String(new Date().getFullYear()) }[per];
    const tile = (c, t, v, s) => `<div class="lfstt ${c}"><span>${t}</span><b>${v}</b>${s ? `<small>${s}</small>` : ""}</div>`;
    const src = dev.power ? "gemessen" : dev.watt ? `geschätzt mit ${num(dev.watt, 0)} W` : "ohne Leistung";
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Statistik</b><span>${esc(dev.name)} · ${esc(lbl)}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      ${this._lfDevChips(dev.id, "lfxstat")}
      <div class="seg">${P.map(([k, l]) => `<button class="${per === k ? "sel" : ""}" data-act="lfxper" data-k="${k}">${l}</button>`).join("")}</div>
      <div class="lfstg">${tile("t", "Laufzeit", T.min >= 60 ? `${num(T.min / 60, T.min >= 600 ? 0 : 1)} h` : `${num(T.min, 0)} Min.`, "")}${tile("y", "Strom", `${num(T.kwh, T.kwh >= 10 ? 0 : 1)} kWh`, src)}${tile("o", "Kosten", this._lfEur(T.eur), "zum jeweiligen Strompreis")}${tile("b", "Entfeuchtet", dev.lph ? `ca. ${num(T.lit, T.lit >= 10 ? 0 : 1)} l` : "–", dev.lph ? `mit ${num(dev.lph, 2)} l pro Stunde` : "Liter pro Stunde unter „Gerät“ eintragen")}</div>
      <div class="lsec">${ic("home", 15)}Tage pro Raum</div>
      ${(T.rooms || []).length ? this._lfDays(T.rooms) : `<div class="mut sm">Noch keine Tage in diesem Zeitraum.</div>`}
      <div class="mut sm" style="margin:10px 0 0">Kosten mit dem Strompreis aus Einstellungen → Haus → Preise &amp; Tarif zum Zeitpunkt des Betriebs. Die Menge ist eine Schätzung.</div>
      <div class="foot2"><button class="btn2" data-act="lfxhist" data-d="${esc(dev.id)}">${ic("today", 15)} Standortverlauf</button><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _lfTiles(dev) {
    const D = this._lf() || {}, R = D.rooms || [];
    if (!R.length) return `<div class="mut sm">Kein Raum mit Luftfeuchte-Sensor gefunden. Wähle in den Raumeinstellungen einen Luftfeuchte-Sensor oder lege einen Messraum an.</div>`;
    const S = (dev && dev.S) || {};
    return `<div class="lftiles">${R.map((r) => `<button class="lftile ${S.loc === r.id ? "sel" : ""}" data-act="lfxpick" data-d="${esc(dev.id)}" data-k="${esc(r.id)}">${this._rkMiniById(r.id, "lft")}<b>${esc(r.name)}${S.loc === r.id ? ic("check", 15) : ""}</b><span class="${r.hum != null && r.hum > (dev.hi || 60) ? "amber" : ""}">Luftfeuchte ${r.hum != null ? num(r.hum, 0) + " %" : "–"}${r.ms ? " · Messraum" : ""}</span></button>`).join("")}</div>
      <div class="lfbtns"><button class="btn2" data-act="${S.off_day ? "lfxon" : "lfxoff"}" data-d="${esc(dev.id)}">${S.off_day ? "Heute wieder in Betrieb" : "Heute nicht in Betrieb"}</button></div>`;
  }
  _lfLocModal() {
    const dev = this._lfDev(this._modal.d); if (!dev) return "";
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Wo steht der ${esc(dev.name)}?</b><span>Modul 1 regelt mit Luftfeuchte und Fenstern dieses Raums</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      ${this._lfTiles(dev)}<div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  /* Geräteliste (Schritt 3: bis zu vier Geräte) */
  _lfListOpen() { const D = this._lf(), all = (D && D.cfg && D.cfg.devs) || []; if (!all.length) { this._lfSetOpen(null); return; } this._modal = { type: "lflist" }; this._renderModal(); }
  _lfListModal() {
    const D = this._lf() || {}, all = (D.cfg && D.cfg.devs) || [], mx = D.max || 4;
    const rows = all.map((d) => { const S = (D.devs || {})[d.id] || {}, [k, t] = this._lfState(S.live || {}); return `<button class="sxrow" data-act="lfxset" data-d="${esc(d.id)}"><span class="sxi">${ic("fan", 20)}</span><span class="sxt"><b>${esc(d.name)}</b><small>${esc([S.loc ? this._lfRoomName(S.loc) : "kein Standort", d.kind === "plug" ? "Schaltsteckdose" : d.kind === "watch" ? "nur beobachten" : "eigene Entität", `ein über ${num(d.hi, 0)} %`].filter(Boolean).join(" · "))}</small></span><em class="sxc ${k === "run" ? "ok" : k === "warn" ? "wa" : ""}">${esc(t)}</em><span class="sxg">${ic("chev", 16)}</span></button>`; }).join("");
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Luftentfeuchter</b><span>Modul 1 · ${all.length} von ${mx} Geräten</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="sxl">${rows}</div>
      ${all.length < mx ? `<button class="btn2" data-act="lfxnew" style="width:100%;margin-top:10px">${ic("plus", 16)} Gerät hinzufügen</button>` : `<div class="mut sm">Höchstzahl erreicht: ${mx} Geräte.</div>`}
      <div class="mut sm" style="margin:10px 0 0">Jedes Gerät hat einen eigenen Standort, eine eigene Abfrage und eigene Zielwerte. Umziehen geht auch direkt auf der Raumkarte mit „hierher stellen“.</div>
      <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  /* Einstellungen eines Geräts: Reiter Gerät, Ziel, Standort, Strom, Meldungen */
  _lfSetOpen(id) {
    const D = this._lf(), all = (D && D.cfg && D.cfg.devs) || [], d0 = id ? all.find((x) => x.id === id) : null;
    const nid = d0 ? d0.id : (() => { for (let n = 1; n < 50; n++) if (!all.some((x) => x.id === "d" + n)) return "d" + n; return "d9"; })();
    const DEF = { id: nid, name: all.length && !d0 ? `Luftentfeuchter ${all.length + 1}` : "Luftentfeuchter", kind: "entity", ent: "", power: "", run_w: 20, tank: "", cap_l: 0, lph: 0, hi: 60, lo: 55, hi_away: 65, night: false, n_from: "22:00", n_to: "07:00", n_mode: "hi", hi_night: 70, n_quiet: true, n_msg: true, minrun: 15, lock: 10, vent: false, watt: 250, boost: "off", boost_hi: 57, cheap_ct: 25, pv_min: 300, high_h: 4, filter_h: 0 };
    this._pkId = null;
    this._modal = { type: "lfset", isNew: !d0, back: all.length > 0, tab: d0 && d0.ent ? "ziel" : "geraet", draft: { ...DEF, ...(d0 || {}), ask: { on: true, time: "08:00", home_only: true, until: "12:00", miss: "same", rooms: [], push: [], ...((d0 && d0.ask) || {}) }, msg: { full: true, high: true, noloc: true, filter: true, ...((d0 && d0.msg) || {}) } } };
    this._renderModal();
  }
  _lfSetModal() {
    const M = this._modal, d = M.draft, st = this._hass.states, ks = Object.keys(st), D = this._lf() || {}, S = ((D.devs || {})[d.id]) || {}, L = S.live || {};
    const tabs = [["geraet", "Gerät"], ["ziel", "Ziel"], ["nacht", "Nacht"], ["ort", "Standort"], ["strom", "Strom"], ["msg", "Meldungen"]];
    const step = (k, unit, s, lo, hi, dec = 0) => `<div class="lfstep"><button class="ibtn" data-act="lfxstep" data-k="${k}" data-v="${-s}" data-lo="${lo}" data-hi="${hi}" aria-label="weniger">${ic("minus", 16)}</button><b>${num(d[k], dec)}<small> ${unit}</small></b><button class="ibtn" data-act="lfxstep" data-k="${k}" data-v="${s}" data-lo="${lo}" data-hi="${hi}" aria-label="mehr">${ic("plus", 16)}</button></div>`;
    const row = (l, h, ctl) => `<div class="of"><div class="ol"><b>${l}</b>${h ? `<small>${h}</small>` : ""}</div><div class="oc">${ctl}</div></div>`;
    const seg = (k, opts) => `<div class="seg">${opts.map(([v, l]) => `<button class="${d[k] === v ? "sel" : ""}" data-act="lfxseg" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`;
    const chips = (arr, sel, act, lbl) => `<div class="lfchips">${arr.map((v) => `<button class="${sel.includes(v) ? "sel" : ""}" data-act="${act}" data-k="${esc(v)}" aria-pressed="${sel.includes(v)}">${esc(lbl(v))}</button>`).join("")}</div>`;
    let body = "";
    if (M.tab === "geraet") {
      const dom = d.kind === "plug" ? ["switch."] : ["humidifier.", "switch.", "fan.", "input_boolean."];
      const used = ((D.cfg || {}).devs || []).filter((x) => x.id !== d.id).map((x) => x.ent);
      const devs = ks.filter((e) => dom.some((p) => e.startsWith(p)) && !used.includes(e));
      const pw = ks.filter((e) => e.startsWith("sensor.") && (st[e].attributes.device_class === "power" || /^k?W$/.test(st[e].attributes.unit_of_measurement || "")));
      const tk = ks.filter((e) => (e.startsWith("binary_sensor.") || e.startsWith("sensor.")) && /tank|wasser|water|bucket|voll|full/i.test(e + " " + (st[e].attributes.friendly_name || "")));
      body = `<div class="lsec">${ic("fan", 15)}Art des Geräts</div>
        <div class="lfkind">${[["entity", "Eigene Entität", "Smarter Entfeuchter in Home Assistant (humidifier, Schalter)."], ["plug", "Schaltsteckdose", "Normaler Entfeuchter an einer Steckdose, am Gerät auf Dauerbetrieb."], ["watch", "Nur beobachten", "Gerät mit eigenem Hygrostat. Modul 1 zeigt an, schaltet aber nicht."]].map(([v, l, h]) => `<button class="${d.kind === v ? "sel" : ""}" data-act="lfxseg" data-k="kind" data-v="${v}"><b>${l}</b><span>${h}</span></button>`).join("")}</div>
        <div class="lsec">${ic("pencil", 15)}Name</div><input class="otxt" type="text" maxlength="30" data-f="lfxname" value="${esc(d.name)}" aria-label="Name des Entfeuchters">
        <div class="lsec">${ic("bolt", 15)}Gerät und Sensoren</div>
        ${row(d.kind === "plug" ? "Schaltsteckdose" : "Entfeuchter", d.kind === "plug" ? "switch.*" : "humidifier.*, Schalter oder Lüfter", this._wzSel(devs, d.ent, "lfxe", `data-k="ent"`, "– Gerät wählen –", /entfeucht|dehumid|humid|trockn/i))}
        ${row("Leistung", "optional, zeigt ob er wirklich läuft, misst den Strom", this._wzSel(pw, d.power, "lfxe", `data-k="power"`, "– keine –", /entfeucht|dehumid|steckdose|plug/i))}
        ${d.power ? row("Läuft ab", "darunter gilt er als aus", step("run_w", "W", 5, 1, 500)) : row("Nennleistung", "für Strom und Kosten ohne Messung", step("watt", "W", 10, 0, 3000))}
        ${row("Wassertank-Sensor", "optional, meldet „voll“", this._wzSel(tk, d.tank, "lfxe", `data-k="tank"`, "– keiner –", /tank|voll|full/i))}
        ${row("Entfeuchtung", "Liter pro Stunde Betrieb, für Menge und Tankschätzung", step("lph", "l/h", 0.05, 0, 10, 2))}
        ${!d.tank ? row("Tankinhalt", "Schätzung ohne Tank-Sensor, 0 = aus", step("cap_l", "l", 0.5, 0, 50, 1)) : ""}
        ${d.kind === "plug" ? `<div class="gst">${ic("info", 15)}<div>Das Gerät muss auf Dauerbetrieb stehen und nach einer Stromunterbrechung von selbst wieder anlaufen. Bitte am Gerät prüfen. Die Steckdose muss für die Leistung des Geräts ausgelegt sein.</div></div>` : ""}`;
    } else if (M.tab === "ziel") {
      body = `<div class="lsec">${ic("drop", 15)}Zielfeuchte</div>
        ${row("Einschalten über", "Obergrenze, gilt immer", step("hi", "%", 1, 35, 90))}
        ${row("Ausschalten bei", "Untergrenze", step("lo", "%", 1, 30, 85))}
        ${row("Bei Abwesenheit oder Urlaub", "Einschalten über (nur Schutz vor Schimmel)", step("hi_away", "%", 1, 35, 95))}
        <div class="lsec">${ic("clock", 15)}Gegen ständiges Schalten</div>
        ${row("Mindestlaufzeit", "", step("minrun", "Min.", 5, 0, 120))}
        ${row("Sperrzeit nach dem Ausschalten", "", step("lock", "Min.", 5, 0, 120))}
        <div class="lsec">${ic("windy", 15)}Lüften vor Entfeuchten</div>
        <div class="mut sm" style="margin:-2px 0 6px">Ist die Luft draußen trockener, bleibt der Entfeuchter aus und Modul 1 empfiehlt Lüften. Im Winter ist das oft der Fall, deshalb ab Werk aus.</div>
        ${seg("vent", [[false, "Aus"], [true, "Ein"]])}
        <div class="gst">${ic("window", 15)}<div>Bei offenem Fenster im Raum des Standorts bleibt der Entfeuchter immer aus.</div></div>`;
    } else if (M.tab === "nacht") {
      const tin = (k, lbl) => `<span class="tin">${this._tIn(esc(d[k]), false, lbl)}<input type="hidden" data-f="lfxnt" data-k="${k}" value="${esc(d[k])}" aria-label="${lbl}"></span>`;
      const ent = this._hass.states[d.ent], modes = ent && d.ent.startsWith("humidifier.") ? (ent.attributes.available_modes || []) : [];
      const qm = modes.find((m) => /sleep|night|quiet|silent|schlaf|nacht|leise|ruhe/i.test(m)) || "";
      body = `<div class="lsec">${ic("moon", 15)}Nachtmodus</div>
        <div class="mut sm" style="margin:-2px 0 6px">Nachts ist ein Entfeuchter laut. Im Nachtmodus läuft er nur bei hoher Feuchte oder bleibt ganz aus. Die Obergrenze für Schimmelschutz bei Abwesenheit gilt weiter.</div>
        ${seg("night", [[false, "Aus"], [true, "Ein"]])}
        ${d.night ? `${row("Nacht von", "", tin("n_from", "Nachtmodus ab"))}${row("bis", "", tin("n_to", "Nachtmodus bis"))}
        <div class="lsec">${ic("drop", 15)}Nachts</div>
        ${seg("n_mode", [["hi", "Nur bei hoher Feuchte"], ["off", "Ganz aus"]])}
        ${d.n_mode === "hi" ? row("Einschalten über", "am Tag " + num(d.hi, 0) + " %", step("hi_night", "%", 1, Math.max(40, d.hi), 95)) : `<div class="gst on">${ic("info", 15)}<div>Der Entfeuchter bleibt nachts aus, auch bei hoher Feuchte. Läuft er gerade, schaltet er zu Beginn der Nacht ab.</div></div>`}
        <div class="mut sm" style="margin:6px 0 0">Vorziehen bei PV-Überschuss oder günstigem Strom ist nachts aus.</div>
        <div class="lsec">${ic("fan", 15)}Leise-Modus des Geräts</div>
        ${qm ? `<div class="mut sm" style="margin:-2px 0 6px">Dein Gerät hat den Modus „${esc(qm)}“. Modul 1 schaltet ihn nachts ein und morgens den vorherigen Modus zurück.</div>${seg("n_quiet", [[true, "Ein"], [false, "Aus"]])}`
          : `<div class="mut sm" style="margin:-2px 0 6px">${d.kind === "plug" ? "Bei einer Schaltsteckdose gibt es keinen Leise-Modus." : "Dein Gerät meldet keinen Schlaf- oder Leise-Modus. Wenn es einen hat, erscheint er hier, sobald Home Assistant ihn anbietet."}</div>`}
        <div class="lsec">${ic("bell", 15)}Meldungen nachts</div>
        ${seg("n_msg", [[true, "Bis zum Morgen zurückhalten"], [false, "Sofort senden"]])}` : ""}`;
    } else if (M.tab === "ort") {
      const a = d.ask, R = D.rooms || [], svc = Object.keys((this._hass.services || {}).notify || {}).filter((n) => !["send_message", "persistent_notification", "reload"].includes(n)).sort((x, y) => Number(y.startsWith("mobile_app")) - Number(x.startsWith("mobile_app")) || x.localeCompare(y)).map((n) => "notify." + n);
      const pushAll = [...new Set([...svc, ...a.push])];
      const aseg = (k, opts) => `<div class="seg">${opts.map(([v, l]) => `<button class="${a[k] === v ? "sel" : ""}" data-act="lfxaseg" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`;
      body = `<div class="lsec">${ic("today", 15)}Tägliche Standortabfrage</div>
        <div class="mut sm" style="margin:-2px 0 6px">Einmal am Tag wird bestätigt, in welchem Raum der Entfeuchter steht. Bis dahin gilt der Raum von gestern.</div>
        ${aseg("on", [[true, "Ein"], [false, "Aus"]])}
        ${a.on ? `${row("Uhrzeit der Abfrage", "Ab dann erscheint die Standort-Karte", `<span class="tin">${this._tIn(esc(a.time), false, `Uhrzeit der Abfrage`)}<input type="hidden" data-f="lfxt" data-k="time" value="${esc(a.time)}" aria-label="Uhrzeit der Abfrage"></span>`)}
        <div class="mut sm" style="margin:8px 0 4px">Abfrage am Handy nur, wenn jemand zu Hause ist</div>${aseg("home_only", [[true, "Ja"], [false, "Nein"]])}
        ${row("Ohne Antwort bis", "Danach gilt die Wahl darunter", `<span class="tin">${this._tIn(esc(a.until), false, `Frist für die Antwort`)}<input type="hidden" data-f="lfxt" data-k="until" value="${esc(a.until)}" aria-label="Frist für die Antwort"></span>`)}
        ${aseg("miss", [["same", "Wie gestern"], ["pause", "Pausieren"], ["hint", "Nur Hinweis"]])}
        <div class="mut sm" style="margin:4px 0 0">${{ same: "Der Raum von gestern wird für heute übernommen.", pause: "Der Entfeuchter bleibt aus, bis jemand den Standort bestätigt.", hint: "Er läuft wie gestern weiter, die Karte erinnert weiter." }[a.miss]}</div>
        <div class="lsec">${ic("home", 15)}Räume zur Auswahl (je ein Antippen)</div>
        ${R.length ? chips(R.map((r) => r.id), a.rooms.length ? a.rooms : R.map((r) => r.id), "lfxroom", (v) => (R.find((r) => r.id === v) || {}).name || v) : `<div class="mut sm">Kein Raum mit Luftfeuchte-Sensor gefunden.</div>`}
        <div class="mut sm" style="margin:2px 0 0">Alle markiert = alle Räume mit Luftfeuchte-Sensor, auch neue.</div>` : ""}
        <div class="lsec">${ic("bell", 15)}Handys</div>
        <div class="mut sm" style="margin:-2px 0 6px">Bekommen die tägliche Abfrage mit Tasten für bis zu drei Räume und die Meldungen dieses Geräts. Ein Tipp auf die Nachricht öffnet das Dashboard.</div>
        ${pushAll.length ? chips(pushAll, a.push, "lfxpush", (v) => v.replace(/^notify\.(mobile_app_)?/, "").replace(/_/g, " ")) : `<div class="mut sm">Kein Benachrichtigungsdienst gefunden. Mit der Home-Assistant-App am Handy gibt es „mobile_app“-Dienste.</div>`}
        ${a.push.length && !M.isNew ? `<button class="lnk" data-act="lfxtest" data-d="${esc(d.id)}" style="margin:6px 0 0">${ic("bell", 14)} Jetzt eine Test-Abfrage senden</button>` : ""}
        ${M.isNew ? `<div class="lsec">${ic("tablet", 15)}NFC-Tag am Stellplatz</div><div class="mut sm" style="margin:-2px 0 6px">Je Raum lässt sich ein NFC-Tag anlernen: Handy dranhalten, und der Entfeuchter steht dort. Erst das Gerät speichern, dann erscheinen hier die Räume zum Anlernen.</div>` : this._lfNfc(d)}
        ${!M.isNew ? `<div class="lsec">${ic("pin", 15)}Standort jetzt</div>${this._lfTiles({ ...d, S })}` : ""}`;
    } else if (M.tab === "strom") {
      const now = [L.price != null ? `Strompreis jetzt ${num(L.price, 1)} ct/kWh` : "kein Strompreis", L.pv_w != null ? `Überschuss jetzt ${wfmt(Math.max(0, L.pv_w))}` : "kein Netz-Sensor"].join(" · ");
      body = `<div class="lsec">${ic("sun", 15)}Vorziehen bei günstigem Strom</div>
        <div class="mut sm" style="margin:-2px 0 6px">Bei PV-Überschuss oder günstigem Strom startet der Entfeuchter schon früher und trocknet vor. Die Obergrenze gilt immer, auch ohne günstigen Strom.</div>
        ${seg("boost", [["off", "Aus"], ["pv", "PV"], ["cheap", "Günstig"], ["both", "Beides"]])}
        ${d.boost !== "off" ? `${row("Dann einschalten schon über", `zwischen Untergrenze ${num(d.lo, 0)} % und Obergrenze ${num(d.hi, 0)} %`, step("boost_hi", "%", 1, d.lo + 1, d.hi))}
        ${d.boost === "pv" || d.boost === "both" ? row("Überschuss mindestens", "Einspeisung ins Netz, sein eigener Verbrauch zählt mit", step("pv_min", "W", 50, 0, 5000)) : ""}
        ${d.boost === "cheap" || d.boost === "both" ? row("Günstig bis", "Strompreis höchstens", step("cheap_ct", "ct/kWh", 0.5, 0, 100, 1)) : ""}` : ""}
        <div class="gst">${ic("info", 15)}<div>${esc(now)}<br><span class="mut">Netz-Sensor und Strompreis kommen aus Einstellungen → Haus (Energiequellen, Preise &amp; Tarif). Sie zählen auch für Strom und Kosten in der Statistik.</span></div></div>`;
    } else {
      const K = [["full", "Tank voll"], ["high", "Feuchte bleibt zu hoch"], ["noloc", "Standort fehlt"], ["filter", "Filter reinigen"]];
      body = `<div class="lsec">${ic("bell", 15)}Meldungen</div>
        <div class="mut sm" style="margin:-2px 0 6px">Erscheinen auf der Raumkarte und gehen an die Handys aus dem Reiter „Standort“${d.ask.push.length ? ` (${d.ask.push.length})` : ", dort ist noch keins gewählt"}. Jede Meldung kommt einmal je Anlass.</div>
        ${chips(K.map((k) => k[0]), K.filter((k) => d.msg[k[0]]).map((k) => k[0]), "lfxmsg", (v) => K.find((k) => k[0] === v)[1])}
        ${row("Zu hoch, wenn nach", "so vielen Stunden Betrieb die Feuchte noch über der Obergrenze liegt", step("high_h", "Std.", 1, 1, 48))}
        ${row("Filter reinigen nach", `Betriebsstunden, 0 = aus${S.live && S.live.filter_h != null ? ` · jetzt ${num(S.live.filter_h, 0)} Std.` : ""}`, step("filter_h", "Std.", 50, 0, 5000))}
        ${!M.isNew && d.filter_h ? `<button class="lnk" data-act="lfxfilt" data-d="${esc(d.id)}" style="margin:6px 0 0">${ic("check", 14)} Filter gereinigt, Zähler auf 0</button>` : ""}
        <div class="gst">${ic("info", 15)}<div>Für eigene Automationen gibt es das Ereignis <b>fenster_heizung_entfeuchter</b> mit type start, stop, tank_full oder location, dazu Gerät, Name und Raum.</div></div>`;
    }
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh">${M.back ? `<button class="ibtn" data-act="lfxlist" aria-label="Zurück zur Geräteliste">${ic("back", 20)}</button>` : ""}<div style="flex:1"><b>${esc(d.name || "Luftentfeuchter")}</b><span>${M.isNew ? "Neues Gerät" : "Modul 1 · Luftentfeuchter"} · gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="seg lftabs">${tabs.map(([k, l]) => `<button class="${M.tab === k ? "sel" : ""}" data-act="lfxtab" data-k="${k}">${l}</button>`).join("")}</div>
      ${body}${M.err ? `<div class="gst on">${ic("alert", 15)}<div>${esc(M.err)}</div></div>` : ""}
      ${M.del ? `<div class="gbox"><b>„${esc(d.name)}“ entfernen?</b>Statistik und Verlauf dieses Geräts werden gelöscht. Das Gerät selbst bleibt in Home Assistant.</div><div class="foot2"><button class="btn2" data-act="lfxdelno">Abbrechen</button><button class="btn2" style="color:#f87171" data-act="lfxdelok">Entfernen</button></div>`
      : `<div class="foot2">${!M.isNew ? `<button class="btn2" data-act="lfxdel">Entfernen</button>` : `<button class="btn2" data-act="close">Abbrechen</button>`}<button class="btn2 pri" data-act="lfxsave">Speichern</button></div>`}</div>`;
  }
  /* Schritt 5: NFC-Tag am Stellplatz. Die Tags gehören zu „Tags & Karten“ (Aktion „Entfeuchter steht hier“, Gerät|Raum).
     Hier nur die passende Ansicht je Raum: anlernen mit fester Aktion, entfernen, Verwaltung öffnen. */
  _lfNfc(d) {
    this._tgxLoad();
    const T = this._tgxD, R = (this._lf() || {}).rooms || [];
    const head = `<div class="lsec">${ic("tablet", 15)}NFC-Tag am Stellplatz</div>
      <div class="mut sm" style="margin:-2px 0 6px">Klebe an jeden Stellplatz ein NFC-Tag. Hältst du das Handy daran, steht ${esc(d.name)} dort und der Standort gilt für heute als bestätigt. Die Tags gehören zu Einstellungen → Haus → Tags &amp; Karten, dort gelten auch Personen, Zeitfenster und Protokoll.</div>`;
    if (!T) return head + `<div class="mut sm">Tags werden geladen …</div>`;
    const tags = Object.entries((T.cfg || {}).tags || {}), L = T.learn || {}, mine = this._lfNfcRoom && this._lfNfcRoom.d === d.id ? this._lfNfcRoom.r : "";
    const tagFor = (dv, rm) => tags.find(([, t]) => t.act && t.act.k === "lf_here" && t.act.arg === `${dv}|${rm}`);
    const others = this._lfDevs().filter((x) => x.id !== d.id);
    if (L.active) { clearTimeout(this._lfNfcT); this._lfNfcT = setTimeout(() => this._lfNfcPoll(), 1500); }
    const F = L.found && mine && L.found.created ? L.found : null;
    const rows = R.map((r) => {
      const own = tagFor(d.id, r.id), other = others.map((o) => [o, tagFor(o.id, r.id)]).find((x) => x[1]), learning = L.active && mine === r.id;
      const lastScan = own && T.last && T.last[own[0]] ? ` · zuletzt ${this._tgxWhen(T.last[own[0]].ts)}` : "";
      const stat = learning ? `<b class="lfnl">Jetzt das Handy an das Tag halten … noch ${L.left} s</b>` : own ? `${esc(own[1].name)}${own[1].on ? "" : " · ausgeschaltet"}<span class="mut">${esc(lastScan)}</span>` : other ? `<span class="mut">Tag für ${esc(other[0].name)} vorhanden</span>` : `<span class="mut">kein Tag</span>`;
      const btns = learning ? `<button class="btn2" data-act="lfxnfcstop">Abbrechen</button>` : `${own ? `<button class="btn2" data-act="lfxnfcdel" data-k="${esc(own[0])}" aria-label="Tag für ${esc(r.name)} entfernen">${ic("trash", 15)}</button>` : ""}<button class="btn2 ${own ? "" : "pri"}" data-act="lfxnfc" data-d="${esc(d.id)}" data-k="${esc(r.id)}" ${L.active ? "disabled" : ""}>${own ? "Neu anlernen" : "Tag anlernen"}</button>`;
      return `<div class="lfnr ${learning ? "on" : ""} ${own ? "set" : ""}"><span class="lfni">${ic(own ? "check" : "pin", 15)}</span><div><b>${esc(r.name)}</b><small>${stat}</small></div><span class="lfnb">${btns}</span></div>`;
    }).join("");
    return head + `${F ? `<div class="gst">${ic("check", 15)}<div>Tag für <b>${esc(this._lfRoomName(mine))}</b> angelernt.${F.was ? `<br><span class="lfhint">Das Tag war vorher „${esc(F.was)}“ und ist jetzt für den Entfeuchter umgestellt.</span>` : ""}</div></div>` : ""}
      ${R.length ? `<div class="lfnl0">${rows}</div>` : `<div class="mut sm">Kein Raum mit Luftfeuchte-Sensor gefunden.</div>`}
      <div class="mut sm" style="margin:6px 0 0">Tag neu? In der Home-Assistant-App unter Einstellungen → Tags ein Tag hinzufügen und beschreiben. <a class="lnk" href="https://github.com/Maddog3010/ha-fenster-heizung/blob/main/docs/Anleitung_Tags_iPhone.pdf" target="_blank" rel="noopener">Anleitung fürs iPhone</a></div>
      <button class="lnk" data-act="tgxopen" style="margin:6px 0 0">${ic("nfc", 14)} Alle Tags &amp; Karten verwalten</button>`;
  }
  _lfNfcPoll() {
    if (!this._hass) return;
    this._hass.callWS({ type: "fenster_heizung/tg_get" }).then((r) => { this._tgxD = r; this._tgxTs = Date.now(); if (this._modal && this._modal.type === "lfset" && this._modal.tab === "ort") this._renderModal(); }).catch(() => {});
  }
  _lfChange(t) {
    const M = this._modal; if (!M || M.type !== "lfset") return false;
    if (t.dataset.f === "lfxname") { M.draft.name = t.value; return true; }
    if (t.dataset.f === "lfxe") { M.draft[t.dataset.k] = t.value || ""; return true; }
    if (t.dataset.f === "lfxnt") { if (/^\d\d:\d\d$/.test(t.value)) M.draft[t.dataset.k] = t.value; return true; }
    if (t.dataset.f === "lfxt") { if (/^\d\d:\d\d$/.test(t.value)) M.draft.ask[t.dataset.k] = t.value; return true; }
    return false;
  }
  async _lfSave(devs, msg) {
    try { const r = await this._hass.callWS({ type: "fenster_heizung/lf_set", cfg: { devs } }); this._lfD = { ...r, ts: Date.now() }; this._modal = devs.length > 1 ? { type: "lflist" } : null; this._renderModal(); this._render(); this._toast(msg); }
    catch (e) { this._toast("Speichern fehlgeschlagen"); }
  }
  _lfAct(a, b) {
    const M = this._modal, did = b.dataset.d || "";
    if (a === "lfxset") { did ? this._lfSetOpen(did) : this._lfListOpen(); return; }
    if (a === "lfxlist") { this._lfListOpen(); return; }
    if (a === "lfxnew") { this._lfSetOpen(null); return; }
    if (a === "lfxloc") { this._modal = { type: "lfloc", d: did }; this._renderModal(); return; }
    if (a === "lfxpick") { this._lfCmd("loc", b.dataset.k, did); if (M && M.type === "lfloc") { this._modal = null; this._renderModal(); } return; }
    if (a === "lfxmove") { this._lfCmd("loc", b.dataset.k, did).then((r) => { if (r) this._toast(`${(this._lfDev(did) || {}).name || "Entfeuchter"} steht jetzt in ${this._lfRoomName(b.dataset.k)}`); }); return; }
    if (a === "lfxoff") { this._lfCmd("off_today", "", did); return; }
    if (a === "lfxon") { this._lfCmd("on_today", "", did); return; }
    if (a === "lfxsel") { (this._lfPick = this._lfPick || {})[did] = b.dataset.k; this._render(); return; }
    if (a === "lfxconf") { if (this._lfPick) delete this._lfPick[did]; this._lfCmd("loc", b.dataset.k, did); this._toast("Standort für heute bestätigt"); return; }
    if (a === "lfxhist") { this._modal = { type: "lfhist", d: did }; this._renderModal(); return; }
    if (a === "lfxstat") { this._modal = { type: "lfstat", d: did, per: (M && M.type === "lfstat" && M.per) || "month" }; this._renderModal(); return; }
    if (a === "lfxper") { if (M && M.type === "lfstat") { M.per = b.dataset.k; this._renderModal(); } return; }
    if (a === "lfxtest") { this._lfCmd("ask_test", "", did).then((r) => this._toast(r && r.test_sent ? `Test-Abfrage an ${r.test_sent} ${r.test_sent === 1 ? "Handy" : "Handys"} gesendet` : "Nicht gesendet: erst speichern, dann testen")); return; }
    if (a === "lfxtank") { this._lfCmd("tank_empty", "", did); this._toast("Tank als geleert vermerkt"); return; }
    if (a === "lfxnfc") { const dv = this._lfDev(did) || ((((this._lf() || {}).cfg || {}).devs || []).find((x) => x.id === did)) || { name: "Entfeuchter" }; this._lfNfcRoom = { d: did, r: b.dataset.k };
      this._hass.callWS({ type: "fenster_heizung/tg_act", act: "learn", preset: { name: `${dv.name} · ${this._lfRoomName(b.dataset.k)}`.slice(0, 40), act: { k: "lf_here", arg: `${did}|${b.dataset.k}` } } }).then((r) => { this._tgxD = r; this._tgxTs = Date.now(); this._renderModal(); }).catch(() => this._toast("Anlernen nicht möglich")); return; }
    if (a === "lfxnfcstop") { clearTimeout(this._lfNfcT); this._lfNfcRoom = null; this._tgxCall("stop").then(() => this._renderModal()); return; }
    if (a === "lfxnfcdel") { if (!this._tgxD) return; const c = this._tgxCfgNow(); delete c.tags[b.dataset.k]; this._tgxPut(c).then(() => { this._renderModal(); this._toast("NFC-Tag entfernt"); }); return; }
    if (a === "lfxfilt") { this._lfCmd("filter_reset", "", did); this._toast("Filter als gereinigt vermerkt"); return; }
    if (!M || M.type !== "lfset") return;
    const d = M.draft, all = ((this._lf() || {}).cfg || {}).devs || [];
    if (a === "lfxtab") { M.tab = b.dataset.k; this._pkId = null; this._renderModal(); }
    else if (a === "lfxseg") { const v = b.dataset.v; d[b.dataset.k] = v === "true" ? true : v === "false" ? false : v; if (b.dataset.k === "kind" && v === "plug" && d.ent && !d.ent.startsWith("switch.")) d.ent = ""; this._renderModal(); }
    else if (a === "lfxaseg") { const v = b.dataset.v; d.ask[b.dataset.k] = v === "true" ? true : v === "false" ? false : v; this._renderModal(); }
    else if (a === "lfxroom") { const allr = ((this._lf() || {}).rooms || []).map((r) => r.id), cur = d.ask.rooms.length ? [...d.ask.rooms] : [...allr], k = b.dataset.k, i = cur.indexOf(k); if (i >= 0) cur.splice(i, 1); else cur.push(k); d.ask.rooms = cur.length === allr.length || !cur.length ? [] : cur; this._renderModal(); }
    else if (a === "lfxpush") { const k = b.dataset.k, cur = [...d.ask.push], i = cur.indexOf(k); if (i >= 0) cur.splice(i, 1); else cur.push(k); d.ask.push = cur; this._renderModal(); }
    else if (a === "lfxmsg") { d.msg[b.dataset.k] = !d.msg[b.dataset.k]; this._renderModal(); }
    else if (a === "lfxstep") { const k = b.dataset.k, s = parseFloat(b.dataset.v); d[k] = Math.round(Math.min(parseFloat(b.dataset.hi), Math.max(parseFloat(b.dataset.lo), (Number(d[k]) || 0) + s)) * 100) / 100; this._renderModal(); }
    else if (a === "lfxdel") { M.del = true; this._renderModal(); }
    else if (a === "lfxdelno") { M.del = false; this._renderModal(); }
    else if (a === "lfxdelok") { this._lfSave(all.filter((x) => x.id !== d.id), "Entfeuchter entfernt"); }
    else if (a === "lfxsave") {
      M.err = !d.ent ? "Bitte das Gerät wählen (Reiter „Gerät“)." : d.lo >= d.hi ? "Die Untergrenze muss unter der Obergrenze liegen." : "";
      if (M.err) { M.tab = !d.ent ? "geraet" : M.tab; this._renderModal(); return; }
      const rec = { ...d, name: String(d.name || "").trim() || "Luftentfeuchter" }, i = all.findIndex((x) => x.id === d.id);
      const list = i >= 0 ? all.map((x) => (x.id === d.id ? rec : x)) : [...all, rec];
      this._lfSave(list, i >= 0 ? "Entfeuchter gespeichert" : `„${rec.name}“ hinzugefügt`);
    }
  }
