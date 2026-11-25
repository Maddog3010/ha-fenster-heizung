  /* ================= Tablet-Modus · Stufe 2: gemeinsames für Modulseiten ohne Scrollen =================
     Reiter in der Kopfzeile, Inhalt füllt genau die Resthöhe. Modul 1 (hier), 2 (12d4), 3 (12d5), 4 (12d6) und 19 (12d7).
     Anzeigen geht immer. Einstellungen ändern fragt nach der PIN, wenn das Tablet eine hat (2 Minuten frei). */
  static TM2_TABS = { fh: [["rooms", "Räume"], ["stats", "Statistik"]], ww: [["now", "Jetzt"], ["times", "Zeiten"], ["hist", "Verlauf"]],
    en: [["now", "Jetzt"], ["hist", "Verlauf"], ["cost", "Kosten"]], gs: [["dev", "Geräte"], ["win", "Startfenster"], ["stats", "Statistik"]], ef: [["now", "Jetzt"], ["strom", "Strom"]] };
  _tm2Fit(v) { return v === "st" || (!!this.constructor.TM2_TABS[v] && this._mdList().some((m) => m.id === v)); }
  _tm2Tab(v) { const T = this.constructor.TM2_TABS[v], cur = (this._tm2T || {})[v]; return T.some((t) => t[0] === cur) ? cur : T[0][0]; }
  _tm2Tabs(v) {
    if (!this._tm2Ready(v)) return "";
    const cur = this._tm2Tab(v);
    return `<div class="tm2tabs" role="tablist">${this.constructor.TM2_TABS[v].map(([k, l]) => `<button role="tab" class="${cur === k ? "sel" : ""}" aria-selected="${cur === k}" data-act="tm2tab" data-v="${v}" data-k="${k}">${l}</button>`).join("")}</div>`;
  }
  /* Reiter erst zeigen, wenn das Modul eingerichtet ist */
  _tm2Ready(v) {
    if (v === "fh") return !!(this._collect().length || this._msList().length);
    if (v === "ww") return this._wwConfigured();
    if (v === "en") return this._enConfigured();
    if (v === "gs") return !!this._gsState().devices.length;
    return !!this._efxD && this._efxSp() && !!this._tm2EfNodes().length;
  }
  _tm2ModBody(v) { return v === "fh" ? this._tm2Fh() : v === "ww" ? this._tm2Ww() : v === "en" ? this._tm2En() : v === "gs" ? this._tm2Gs() : this._tm2Ef(); }
  _tm2ModStatus(v) {
    if (v === "ww") return this._wwConfigured() ? this._wwStatus()[1] : "Noch nicht eingerichtet";
    if (v === "en") {
      if (!this._enConfigured()) return "Noch nicht eingerichtet";
      const n = this._enNow(); if (!n) return "Keine Messwerte";
      const flow = n.imp > 50 ? `${wfmt(n.imp)} aus dem Netz` : n.exp > 50 ? `${wfmt(n.exp)} ins Netz` : "";
      return [n.house > 20 ? `${Math.round(Math.min(100, Math.max(0, (n.pv2h || 0) / n.house * 100)))} % aus Solar` : "", flow].filter(Boolean).join(" · ") || "Gerade fließt kaum Strom";
    }
    if (v === "gs") {
      if (!this._gsState().devices.length) return "Noch keine Geräte";
      const l = this._tm2GsDevs(), run = l.filter((d) => d.running).length, done = l.filter((d) => this._gsMode(d) === "done").length;
      return !this._gsD ? "Wird geladen" : [run ? `${run} ${run === 1 ? "Gerät läuft" : "Geräte laufen"}` : "Kein Gerät läuft", done ? `${done} fertig` : ""].filter(Boolean).join(" · ");
    }
    if (v === "ef") {
      if (!this._tm2Ready("ef")) return "Für Sponsoren";
      const c = this._efxCfg(), list = this._tm2EfNodes(), nodes = list.map((p) => c.nodes[p]), calc = this._efxCalc(nodes);
      const bat = this._efxItems(list).find((x) => x.kind === "bat"), soc = bat ? this._efxState(bat.n, bat.w).lvl : null;   /* Akkustand: stand bisher in der Seitenspalte */
      return `Haus ${this._efxFmtW(c.hub.calc === "rest" ? calc.rest : calc.total)} · ${esc(this._efxMixTxt(this._efxMix(nodes)))}${soc != null ? ` · Akku ${Math.round(soc)} %` : ""}`;
    }
    const rooms = this._collect(); if (!rooms.length) return "Noch keine Räume";
    const open = rooms.reduce((a, r) => a + this._rkState(r).anyOpen, 0), paused = rooms.filter((r) => r.mode === "heizung_pausiert");
    return [open ? `${open} Fenster offen` : "Alle Fenster zu", paused.length === 1 ? `${esc(paused[0].name)} pausiert` : paused.length ? `${paused.length} Räume pausiert` : ""].filter(Boolean).join(" · ");
  }
  /* Diagramme erst zeichnen, wenn die Größe ihres Platzes feststeht */
  _tm2Charts() {
    const sr = this.shadowRoot;
    sr.querySelectorAll("[data-tm2ch]").forEach((box) => {
      const kind = box.dataset.tm2ch, w = box.clientWidth; let h = box.clientHeight; if (!w || !h) return;
      if (kind === "ww") {
        let used = this._mdState().ww.ent.pump ? 78 : 30;
        for (let i = 0; i < 3; i++) { box.innerHTML = this._wwChart({ w, h: h - used }); const over = box.scrollHeight - h; if (over <= 0) break; used += over; }
      } else if (kind === "en") this._tm2EnChart(box, w, h);
      else if (kind === "gs") this._tm2GsChart(box, w, h);
      else if (kind === "gsfc") box.innerHTML = this._tm2GsForecast(box.dataset.id, w, h);
      else {
        const rooms = (kind === "fhroom" ? this._collect().filter((r) => r.id === box.dataset.id) : [...this._collect()].sort((a, b) => a.ci - b.ci));
        box.innerHTML = this._chart(rooms, { w, h });
      }
    });
  }
  /* Änderung hinter der PIN: gleich ausführen, wenn keine PIN gesetzt oder gerade entsperrt */
  _tm2Locked() { return !!this._tmMe().has_pin && !(this._tm2Unl && Date.now() < this._tm2Unl); }
  _tm2Guard(fn) {
    if (!this._tm2Locked()) { fn(); return; }
    this._tm2Back = this._modal; this._tmPinThen = fn;
    this._modal = { type: "tmpin", mode: "unlock", buf: "", first: "", err: "" }; this._renderModal();
  }
  /* ---------- Modul 1 · Fenster & Heizung ---------- */
  _tm2Fh() {
    if (!this._collect().length && !this._msList().length) return `<div class="card empty tm2none">${ic("radiator", 44)}<div>Noch keine Räume eingerichtet.</div><small>Räume legst du in der normalen Ansicht an.</small></div>`;
    return this._tm2Tab("fh") === "stats" ? this._tm2FhStats() : this._tm2FhRooms();
  }
  _tm2Fuel(rooms) {
    const set = new Set(rooms.map((r) => r.fuel || "erdgas")), F = set.size === 1 ? FUELS[[...set][0]] : MIXED, mixed = set.size > 1;
    return { F, amt: (sc, l = rooms) => l.reduce((a, r) => a + (r.sc[sc]?.[mixed ? "kwh" : "gas"] || 0), 0) };
  }
  _tm2FhTop(rooms) {
    const p = this._pres(), adm = this._admin(), o = this._out(), F = this._tm2Fuel(rooms), open = rooms.reduce((a, r) => a + this._rkState(r).anyOpen, 0), pv = this._htrRooms().length ? this._pvNow() : null, sum = this._sum();
    const seg = [["home", "home", "Zu Hause"], ["away", "door", "Abwesend"], ["vacation", "suitcase", "Urlaub"]].map(([k, i, l]) => `<button class="${p.mode === k ? "sel" : ""}" data-act="${k === "vacation" && p.mode === "vacation" ? "vac" : "pm"}" data-k="${k}" aria-pressed="${p.mode === k}" ${adm ? "" : "disabled"}>${ic(i, 20)}<span>${l}</span></button>`).join("");
    const chip = (i, t, c = "", attr = "") => (attr ? `<button class="tm2chip ${c}" ${attr}>${ic(i, 18)}${t}</button>` : `<span class="tm2chip ${c}">${ic(i, 18)}${t}</span>`);
    const away = this._away() ? chip("suitcase", `Absenkung auf ${num(p.temp, 1)} °C`, "wa") : p.mode === "vacation" ? chip("suitcase", `Urlaub ab ${this._fmtD(p.from)}`) : sum.active ? chip("sun", "Sommermodus") : "";
    const loc = this._lfDevs().filter((d) => this._lfLocCard1(d)).map((d) => chip("fan", `${esc(d.name)}: Wo steht er?`, "wa", `data-act="lfxloc" data-d="${esc(d.id)}"`)).join("");
    return `<div class="tm2top"><div class="tm2pres" role="group" aria-label="Anwesenheit">${seg}</div><div class="tm2chips">${loc}${away}${o.t != null ? chip("partly", `${num(o.t, 1)} °C außen`) : ""}${open ? chip("windowOpen", `${open} offen`, "wa") : ""}${pv != null ? chip("bolt", `${wfmt(pv)} Überschuss`) : ""}${rooms.length ? chip("flame", `${num(F.amt("day"), 2)} ${unitOf(F.F)} gespart`) : ""}</div></div>`;
  }
  _tm2RoomCap() {
    const size = this._tmC().size, W = window.innerWidth, H = window.innerHeight;
    if (this._tm2Land()) { const c = size === "xl" ? (W >= 1500 ? 4 : 3) : size === "large" || W < 1150 ? 3 : 4, r = H >= 1000 ? 3 : size === "xl" && H < 760 ? 1 : H < 560 ? 1 : 2; return { c, r, n: c * r }; }
    const c = W >= 1100 ? 3 : 2, r = size === "xl" ? (H >= 1150 ? 3 : 2) : H >= 1150 ? 4 : H >= 880 ? 3 : 2; return { c, r, n: c * r };
  }
  /* Zieltemperatur eines Raums, mit der gerade angetippten Änderung */
  _tm2Tgt(r) {
    const th = (r.thermos || []).map((e) => this._hass.states[e]).filter(Boolean), A = (th[0] && th[0].attributes) || {}, o = (this._tmTgt || {})[r.id];
    const t = o && Date.now() < o.until ? o.v : parseFloat(A.temperature);
    return { t: isFinite(t) ? t : null, can: !!th.length && isFinite(t) && r.mode !== "heizung_pausiert", th: th.length };
  }
  _tm2PM(r, g, cls = "") {
    const id = esc(r.id);
    return `<div class="tm2pm ${cls}"><button data-act="tmt" data-id="${id}" data-d="-1" ${g.can ? "" : "disabled"} aria-label="${esc(r.name)} kälter">${ic("minus", 28)}</button><button data-act="tmt" data-id="${id}" data-d="1" ${g.can ? "" : "disabled"} aria-label="${esc(r.name)} wärmer">${ic("plus", 28)}</button></div>`;
  }
  _tm2RoomTile(r) {
    const s = this._rkState(r), g = this._tm2Tgt(r), off = r.mode === "regelung_aus", id = esc(r.id);
    const facts = [s.cur != null ? `Ist ${num(s.cur, 1)} °C` : "", s.hum != null ? `${num(s.hum)} % Feuchte` : ""].filter(Boolean).join(" · ") || "Kein Messwert";
    const badge = `${s.htr && s.htr.status === "pv" ? `<i class="b" title="Elektroheizer läuft">${ic("bolt", 14)}</i>` : ""}${s.lfs.length ? `<i class="b" title="Entfeuchter steht hier">${ic("fan", 14)}</i>` : ""}`;
    return `<div class="tm2room k-${s.k}" style="--c:${s.col}"><button class="tm2ri" data-act="tm2room" data-id="${id}" aria-label="${esc(r.name)} öffnen">
      <span class="tm2rn"><span class="hti">${ic(s.anyOpen ? "windowOpen" : this._icon(r), 24)}</span><span><b>${esc(r.name)}</b><small>${esc(s.lab)}</small></span>${badge}</span>
      <span class="tm2rv">${g.t != null && !off ? num(g.t, 1) : "–"}<small>°C</small></span><span class="tm2rf">${facts}</span></button>${this._tm2PM(r, g)}</div>`;
  }
  _tm2MsTile(m) {
    const T = m.temp ? this._msVal(m.temp, "t", m.stale) : null, Hm = m.hum ? this._msVal(m.hum, "h", m.stale) : null, ok = (x) => x && x.st !== "none" && x.st !== "bad";
    return `<div class="tm2room ms"><div class="tm2ri"><span class="tm2rn"><span class="hti">${ic("thermo", 24)}</span><span><b>${esc(m.name)}</b><small>Messraum</small></span></span>
      <span class="tm2rv">${ok(T) ? num(T.v, 1) : "–"}<small>°C</small></span><span class="tm2rf">${ok(Hm) ? `${num(Hm.v)} % Feuchte` : "nur Anzeige"}</span></div></div>`;
  }
  _tm2FhRooms() {
    const rooms = this._collect(), ms = this._msList(), list = [...rooms.map((r) => ({ r })), ...ms.map((m) => ({ m }))], cap = this._tm2RoomCap(), p = this._tm2Page("rooms", list.length, cap.n);
    const cols = p.pages > 1 ? cap.c : Math.min(cap.c, Math.max(2, Math.ceil(list.length / cap.r))), rows = p.pages > 1 ? cap.r : Math.max(1, Math.ceil(list.length / cols));
    return `${this._tm2FhTop(rooms)}<div class="tm2swb" data-sw="rooms"><div class="tm2rooms r${rows}" style="--c:${cols};--r:${rows}">${list.slice(p.from, p.to).map((x) => (x.r ? this._tm2RoomTile(x.r) : this._tm2MsTile(x.m))).join("")}</div>${this._tm2Pager("rooms", p, "Räume")}</div>`;
  }
  _tm2Sums(rooms) {
    const F = this._tm2Fuel(rooms);
    return `<div class="tm2sums">${[["day", "today", "Heute", "var(--teal)"], ["month", "month", "Monat", "#60a5fa"], ["year", "year", "Jahr", "#a78bfa"], ["total", "total", "Gesamt", "#f472b6"]].map(([sc, i, l, c]) => `<div class="tm2sum" style="--a:${c}"><span>${ic(i, 18)}${l}</span><b>${num(rooms.reduce((a, r) => a + (r.sc[sc]?.min || 0), 0))}<small> Min.</small></b><em>${num(F.amt(sc), 2)} ${unitOf(F.F)} gespart</em></div>`).join("")}</div>`;
  }
  _tm2FhStats() {
    const rooms = this._collect(); if (!rooms.length) return `<div class="card empty tm2none">${ic("chart", 44)}<div>Noch keine Räume mit Heizung.</div></div>`;
    const H = window.innerHeight, per = this._tm2Land() ? (H >= 1000 ? 9 : H >= 760 ? 6 : H >= 640 ? 5 : 3) : H >= 1150 ? 5 : H >= 880 ? 3 : 2;
    const list = [...rooms].sort((a, b) => (b.sc.day?.min || 0) - (a.sc.day?.min || 0)), p = this._tm2Page("fhstat", list.length, per);
    const hs = this._htrRooms(), kwh = hs.reduce((a, r) => a + (Number(r.htr.heute_kwh) || 0), 0), pvk = hs.reduce((a, r) => a + (Number(r.htr.heute_pv_kwh) || 0), 0);
    const htr = hs.length ? `<div class="tm2htr">${ic("bolt", 22)}<span><b>PV-Heizer heute: ${num(kwh, 1)} kWh</b><small>${kwh > 0 ? Math.round((pvk / kwh) * 100) : 0} % aus Überschuss · jetzt ${wfmt(this._htrTotal())}</small></span></div>` : "";
    const row = (r) => `<button class="tm2sr" data-act="rep" data-id="${esc(r.id)}" aria-label="Bericht ${esc(r.name)}"><i style="background:${r.color}"></i><span><b>${esc(r.name)}</b><small>${num(r.sc.day?.min || 0)} Min. · ${r.pauses || 0}× · ${num(r.sc.day?.gas || 0, 2)} ${unitOf(FUELS[r.fuel || "erdgas"])}</small></span>${ic("chev", 18)}</button>`;
    return `${this._tm2Sums(rooms)}<div class="tm2stat"><div class="card tm2cc"><h2>${ic("clock", 18)}Pausenzeit pro Tag · 14 Tage</h2><div class="tm2ch" data-tm2ch="fh"></div></div>
      <section class="card tm2sl" data-sw="fhstat" style="--n:${per}"><h2>${ic("chart", 18)}Heute je Raum</h2><div class="tm2srs">${list.slice(p.from, p.to).map(row).join("")}</div>${this._tm2Pager("fhstat", p, "")}${htr}</section></div>`;
  }
  /* ---------- Raumfenster ---------- */
  _tm2Dial(s, g, off) {
    const lo = 5, hi = 30, f = g.t != null && !off ? Math.min(1, Math.max(0, (g.t - lo) / (hi - lo))) : 0, R = 84, C = 2 * Math.PI * R, A = 0.75 * C;
    return `<div class="tm2dial"><svg viewBox="0 0 200 200" aria-hidden="true"><g transform="rotate(135 100 100)"><circle cx="100" cy="100" r="${R}" fill="none" stroke="var(--line)" stroke-width="15" stroke-linecap="round" stroke-dasharray="${A} ${C}"/>${f ? `<circle cx="100" cy="100" r="${R}" fill="none" stroke="${s.col}" stroke-width="15" stroke-linecap="round" stroke-dasharray="${(A * f).toFixed(1)} ${C}"/>` : ""}</g></svg><div><b>${g.t != null && !off ? num(g.t, 1) + "°" : "–"}</b><span>Ziel</span></div></div>`;
  }
  _tm2RoomModal(m) {
    const r = this._collect().find((x) => x.id === m.id); if (!r) return "";
    const s = this._rkState(r), g = this._tm2Tgt(r), off = r.mode === "regelung_aus", id = esc(r.id), adm = this._admin(), lock = this._tm2Locked() ? ic("lock", 14) : "";
    const dev = `${this._htrBox(r)}${this._lfBox(r.id)}`, air = this._airBox(r) || "", hasDev = !!(dev || air);
    const tabs = [["ctl", "Regeln"], ...(hasDev ? [["dev", dev ? "Geräte & Luft" : "Raumluft"]] : []), ["stat", "Statistik"]], tab = tabs.some((t) => t[0] === m.tab) ? m.tab : "ctl";
    let body = "";
    if (tab === "dev") body = `<div class="tm2dev">${dev ? `<div>${dev}</div>` : ""}${air ? `<div>${air}</div>` : ""}</div>`;
    else if (tab === "stat") body = `${this._tm2Sums([r])}<div class="tm2ch tm2rch" data-tm2ch="fhroom" data-id="${id}"></div><button class="btn2 tm2wide" data-act="rep" data-id="${id}">${ic("chart", 18)} Tagesbericht mit Verlauf</button>`;
    else {
      const min = s.anyOpen ? s.mins : r.sc.day?.min || 0;
      const kpi = (l, v, sub, c) => `<div class="tm2kpi" style="--a:${c}"><span>${l}</span><b>${v}</b><small>${sub}</small></div>`;
      const p0 = this._cfg.plans[r.id] || { enabled: false, entries: [] }, pts = s.pts, now = nowMin(), nx = pts.length ? nextPt(pts, now) : null;
      const plan = pts.length ? `${bar(pts, s.today, now)}<div class="pnow">${s.planOn ? "Jetzt" : (r.planOn ?? p0.enabled) ? "Ruht gerade. Plan" : "Aus. Plan"} <b>${num(at(pts, now), 1)} °C</b> · ab ${fmtT((nx.w % 10080) % 1440)} Uhr <b>${num(nx.t, 1)} °C</b></div>` : `<div class="pnow">Noch kein Heizplan eingerichtet.</div>`;
      const L = this._zlLoad(r), tm = (ms) => new Date(ms).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
      const ev = L.ev == null ? `<div class="tm2ev mut">Verlauf wird geladen …</div>` : L.ev.length ? [...L.ev].reverse().slice(0, window.innerHeight < 700 ? 1 : 3).map((e) => `<div class="tm2ev"><time>${tm(e.t)}</time><span>${esc(e.x)}</span></div>`).join("") : `<div class="tm2ev mut">In den letzten 12 Stunden ist nichts passiert.</div>`;
      const note = this._away() ? `Abwesend: Absenkung auf ${num(this._pres().temp, 1)} °C, der Heizplan ruht.` : s.summer ? "Sommermodus: Der Heizplan ruht." : "";
      body = `<div class="tm2ctl"><div class="tm2cl">${this._tm2Dial(s, g, off)}${this._tm2PM(r, g, "big")}${r.sw ? `<div class="tm2swr"><span>Fensterregelung ${lock}</span><button class="sw ${r.on ? "on" : ""}" data-act="tm2g" data-g="sw" data-sw="${esc(r.sw)}" aria-pressed="${!!r.on}" aria-label="Fensterregelung umschalten"></button></div>` : ""}</div>
        <div class="tm2cr"><div class="tm2kpis">${kpi("Ist", s.cur != null ? `${num(s.cur, 1)} °C` : "–", s.rt.sensor ? "Raumsensor" : "Thermostat", "var(--amber)")}${s.hum != null ? kpi("Feuchte", `${num(s.hum)} %`, s.hum >= 60 ? "erhöht" : s.hum < 35 ? "trocken" : "gut", "#60a5fa") : kpi("Fenster", s.anyOpen ? `${s.anyOpen} offen` : s.wins.length ? "zu" : "–", s.wins.length ? `${s.wins.length} Kontakt${s.wins.length === 1 ? "" : "e"}` : "kein Kontakt", "#60a5fa")}${kpi(s.anyOpen ? "Offen seit" : "Pausiert", `${num(min)} Min.`, s.anyOpen ? `seit ${tm(s.since)}` : `heute, ${r.pauses || 0}×`, "#a78bfa")}</div>
        ${note ? `<div class="pnote">${ic("info", 16)}${note}</div>` : ""}
        <div class="tm2sec"><div class="tm2sh"><span>${ic("plan", 17)}Heizplan heute</span>${adm ? `<button class="tm2mini" data-act="tm2g" data-g="plan" data-id="${id}">${lock || ic("pencil", 15)} Ändern</button>` : ""}</div>${plan}</div>
        <div class="tm2sec tm2whys"><div class="tm2sh"><span>${ic("info", 17)}Warum?</span><button class="tm2mini" data-act="why" data-id="${id}">Alle Gründe</button></div>${ev}</div></div></div>`;
    }
    return `<div class="ov" data-act="close"></div><div class="sheet wide tm2rm" role="dialog" aria-modal="true"><div class="sh"><span class="hti" style="color:${s.col}">${ic(this._icon(r), 30)}</span><div><b>${esc(r.name)}</b><span style="color:${s.col}">${esc(s.lab)}</span></div><div class="tm2tabs">${tabs.map(([k, l]) => `<button class="${tab === k ? "sel" : ""}" data-act="tm2rtab" data-k="${k}">${l}</button>`).join("")}</div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 22)}</button></div>${body}</div>`;
  }
