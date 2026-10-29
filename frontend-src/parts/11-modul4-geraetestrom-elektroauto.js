  _gsState() {
    const s = this._mdState();
    return s.gs || (s.gs = { devices: [], bat_cost: 0, forecast: "", notify: [] });
  }
  _gsReady() { return this._enConfigured(); }
  _gsLoad(force) {
    if (!this._hass || this._gsBusy) return;
    if (!force && this._gsD && Date.now() - this._gsD.ts < 15000) return;
    this._gsBusy = true;
    this._hass.callWS({ type: "fenster_heizung/gs_get" }).then((r) => { this._gsD = { ...(r || {}), ts: Date.now() }; }).catch(() => { this._gsD = { devices: [], hist: {}, err: true, ts: Date.now() }; })
      .finally(() => { this._gsBusy = false; if (this._mdActive() === "gs" && !this._modal && !this._stOpen) this._render(); });
  }
  _gsAct(a, b) {
    const G = this._gsState(), k = b.dataset.k, i = +b.dataset.i;
    if (a === "gsset") { this._modal = { type: "gsset" }; this._renderModal(); }
    else if (a === "gsdone") { this._pkId = null; this._modal = null; this._renderModal(); this._gsLoad(true); this._render(); }
    else if (a === "gsadd") { if (G.devices.length < 8) { G.devices.push({ id: "g" + Date.now().toString(36), name: "", ent: "", thr: 20, end: 5, typ: "" }); this._mdSave(); this._renderModal(); } }
    else if (a === "gsdel") { G.devices.splice(i, 1); this._pkId = null; this._mdSave(); this._renderModal(); }
    else if (a === "gsnot") { const n = new Set(G.notify); if (n.has(k)) n.delete(k); else n.add(k); G.notify = [...n]; this._mdSave(); this._renderModal(); }
    else if (a === "gsrange") { if (this._gsRg !== k) { this._gsRg = k; this._gsOff = 0; this._gsTipX = null; try { localStorage.setItem("fh_gs_range", k); } catch (_) { /* Speicher gesperrt */ } } this._render(); }
    else if (a === "gsoff") { const v = Number(k); this._gsOff = v === 0 ? 0 : Math.min(0, (this._gsOff || 0) + v); this._gsTipX = null; this._render(); }
    else if (a === "gspick") {
      const P = this._gsPer(), i = Number(k) || 0, now = new Date();
      if (P.u === "m") { this._gsRg = "month"; this._gsOff = (P.s.getFullYear() - now.getFullYear()) * 12 + i - now.getMonth(); }
      else { const d = new Date(P.s.getFullYear(), P.s.getMonth(), P.s.getDate() + i); this._gsRg = "day"; this._gsOff = Math.round((d - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5); }
      this._gsOff = Math.min(0, this._gsOff); this._gsTipX = null; this._render();
    }
    else if (a === "gsdev") { this._gsSel = this._gsSel === k ? "" : k; this._render(); }
    else if (a === "gstyp") { const d = G.devices[i]; if (d) { const old = GS_TYP[d.typ || this._gsTyp(d)], nw = GS_TYP[k]; if (old && d.thr === old.thr && d.end === old.end || d.thr === 20 && d.end === 5) { d.thr = nw.thr; d.end = nw.end; } d.typ = k; this._mdSave(); this._renderModal(); } }
  }
  _gsChange(t) {
    const f = t.dataset.f, G = this._gsState(), d = G.devices[+t.dataset.i];
    if (f === "gsent" && d) { d.ent = t.value; this._mdSave(); return true; }
    if (f === "gsname" && d) { d.name = String(t.value || "").replace(/[<>"'&]/g, "").slice(0, 30); this._mdSave(); return true; }
    if (f === "gsnum" && d) { const v = Math.max(1, Math.min(t.dataset.k === "thr" ? 500 : 120, Math.round(parseFloat(String(t.value).replace(",", ".")) || 1))); d[t.dataset.k] = v; this._mdSave(); return true; }
    if (f === "gsbat") { G.bat_cost = Math.max(0, Math.min(100, parseFloat(String(t.value).replace(",", ".")) || 0)); this._mdSave(); return true; }
    if (f === "gsfc") { G.forecast = t.value; this._mdSave(); return true; }
    return false;
  }
  _gsSetModal() {
    const G = this._gsState(), st = this._hass.states, ks = Object.keys(st), p = this._pv(), E = this._enState(), g = this._enGrid();
    const pw = ks.filter((e) => e.startsWith("sensor.") && (st[e].attributes.device_class === "power" || /^k?W$/.test(st[e].attributes.unit_of_measurement || "")));
    const nm = (e) => (e ? esc(this._wzName(e)) : "–");
    const svc = Object.keys((this._hass.services || {}).notify || {}).filter((n) => n !== "send_message").sort().map((n) => "notify." + n);
    const opts = [...svc, ...G.notify.filter((n) => !svc.includes(n))];
    const eur = (c) => num(c, 1) + " ct/kWh";
    return `<div class="ov" data-act="gsdone"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Gerätestrom</b><span>Einstellungen</span></div><button class="ibtn" data-act="gsdone" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("laundry", 15)}Geräte</div>
      <div class="mut sm" style="margin:2px 0 6px">Je Gerät ein Leistungssensor (Steckdose oder Zähler, in Watt). Ein Durchlauf beginnt über der Startschwelle und endet, wenn die Leistung die eingestellte Zeit darunter bleibt. Der Gerätetyp setzt Symbol und passende Startwerte.</div>
      ${G.devices.map((d, i) => `<div class="gsdc"><div class="gsdh"><input class="otxt" type="text" maxlength="30" placeholder="Name, z. B. Waschmaschine" value="${esc(d.name)}" data-f="gsname" data-i="${i}" aria-label="Gerätename"><button class="ibtn" data-act="gsdel" data-i="${i}" aria-label="Gerät entfernen">${ic("trash", 17)}</button></div>
        <div class="gstyp" role="group" aria-label="Gerätetyp">${Object.entries(GS_TYP).map(([k, t]) => `<button class="gsch ${this._gsTyp(d) === k ? "sel" : ""}" data-act="gstyp" data-i="${i}" data-k="${k}" aria-pressed="${this._gsTyp(d) === k}">${ic(t.i, 14)}${t.n}</button>`).join("")}</div>
        ${this._wzSel(pw, d.ent, "gsent", `data-i="${i}" data-k="ent"`, "– Leistungssensor wählen –", /wasch|trockn|sp(ü|u)l|geschirr|power|leistung/i)}
        <div class="gsnums"><label>Startschwelle<span class="onum"><input type="number" inputmode="numeric" data-f="gsnum" data-i="${i}" data-k="thr" value="${d.thr}" min="1" max="500"><u>W</u></span></label><label>Ende nach<span class="onum"><input type="number" inputmode="numeric" data-f="gsnum" data-i="${i}" data-k="end" value="${d.end}" min="1" max="120"><u>min</u></span></label></div></div>`).join("")}
      ${G.devices.length < 8 ? `<button class="btn2" data-act="gsadd" style="width:100%;flex:none">${ic("plus", 16)} Gerät hinzufügen</button>` : ""}
      <div class="lsec">${ic("sun", 15)}Quellen und Preise</div>
      <div class="gst ${this._gsReady() ? "" : "on"}">${ic(this._gsReady() ? "check" : "alert", 15)}<div>${this._gsReady() ? `Solar: <b>${nm(E.ent.pv)}</b>${E.ent.pv2 ? " + " + nm(E.ent.pv2) : ""} · Netz: <b>${nm(g.ent)}</b>${E.ent.bat || E.ent.bdis ? ` · Batterie: <b>${nm(E.ent.bat || E.ent.bdis)}</b>` : ""}<br><span class="mut">kommen aus Modul 3 – Energie-Übersicht.</span>` : "Solar- und Netz-Sensor fehlen. Sie werden einmal in Modul 3 – Energie-Übersicht gewählt und hier mitgenutzt."}</div></div>
      <div class="gst">${ic("info", 15)}<div>Bezugspreis <b>${eur(p.price)}</b>${p.price_mode === "entity" ? " (Sensor)" : ""}, Einspeisevergütung <b>${eur(p.feed)}</b>${p.feed_mode === "entity" ? " (Sensor)" : ""}<br><span class="mut">kommen aus Modul 1 → Allgemein → Photovoltaik.</span></div></div>
      <div class="gsq"><button class="btn2" data-act="mdensetup" style="flex:none">${ic("energy", 15)} Modul 3 öffnen</button></div>
      <div class="lsec">${ic("bolt", 15)}Batterie</div>
      <div class="of"><div class="ol"><b>Speicherkosten</b><span>Was eine kWh aus der Batterie kostet. 0 = Batteriestrom gilt als kostenlos.</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="gsbat" value="${G.bat_cost}" min="0" max="100" step="0.5"><u>ct/kWh</u></span></div></div>
      <div class="lsec">${ic("sun", 15)}Startempfehlung</div>
      <div class="mut sm" style="margin:2px 0 0">Prognose-Sensor in Watt (optional). Ohne Sensor zählt die aktuelle Solarleistung.</div>${this._wzSel(pw, G.forecast, "gsfc", "", "– keiner –", /prognose|forecast|solar|pv/i)}
      <div class="lsec">${ic("bell", 15)}Meldung am Ende eines Durchlaufs</div>
      ${opts.length ? `<div class="gschips">${opts.map((n) => `<button class="gsch ${G.notify.includes(n) ? "sel" : ""}" data-act="gsnot" data-k="${esc(n)}" aria-pressed="${G.notify.includes(n)}">${esc(n.replace("notify.", ""))}</button>`).join("")}</div>` : `<div class="mut sm">Keine Benachrichtigungsdienste gefunden.</div>`}
      <div class="mut sm" style="margin:6px 0 0">Zusätzlich wird das Ereignis <code>geraetestrom_run_finished</code> ausgelöst.</div>
      <div class="foot2"><button class="btn2 pri" data-act="gsdone">Fertig</button></div></div>`;
  }
  /* ---- Modul 4 v1.1: Zeitraum, Gerätetypen, einheitliche Farben ---- */
  _gsTyp(d) {
    if (d && GS_TYP[d.typ]) return d.typ;
    const n = String((d && d.name) || "").toLowerCase();
    return /wasch/.test(n) ? "wasch" : /trock/.test(n) ? "trockner" : /sp(ü|u)l|geschirr/.test(n) ? "spuel" : /k(ü|u)hl|gefrier/.test(n) ? "kuehl" : /ofen|herd|thermomix|koch|mikro/.test(n) ? "ofen" : /pool|pumpe/.test(n) ? "pool" : /pc|computer|rechner|server/.test(n) ? "pc" : /tv|fernseh/.test(n) ? "tv" : /werk|s(ä|a)ge|kompressor/.test(n) ? "werk" : "sonst";
  }
  _gsPer(shift = 0) {
    if (this._gsRg === undefined) { try { this._gsRg = localStorage.getItem("fh_gs_range") || "day"; } catch (_) { this._gsRg = "day"; } }
    const rg = GS_RANGES.includes(this._gsRg) ? this._gsRg : "day", o = (this._gsOff || 0) + shift, now = new Date(), y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
    let s, e, n, u;
    if (rg === "week") { const wd = (now.getDay() + 6) % 7; s = new Date(y, m, d - wd + 7 * o); e = new Date(y, m, d - wd + 7 * o + 7); n = 7; u = "d"; }
    else if (rg === "month") { s = new Date(y, m + o, 1); e = new Date(y, m + o + 1, 1); n = new Date(y, m + o + 1, 0).getDate(); u = "d"; }
    else if (rg === "year") { s = new Date(y + o, 0, 1); e = new Date(y + o + 1, 0, 1); n = 12; u = "m"; }
    else { s = new Date(y, m, d + o); e = new Date(y, m, d + o + 1); n = 1; u = "d"; }
    return { rg, s, e, n, u, off: o, cur: o === 0 };
  }
  _gsLabel(P) {
    const f = (dt, o) => dt.toLocaleDateString("de-DE", o);
    if (P.rg === "day") return P.off === 0 ? "Heute" : P.off === -1 ? "Gestern" : f(P.s, { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
    if (P.rg === "week") { const l = new Date(+P.e - 864e5), t = new Date(Date.UTC(P.s.getFullYear(), P.s.getMonth(), P.s.getDate() + 3)), w = Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7); return `KW ${w} · ${f(P.s, { day: "2-digit", month: "2-digit" })}–${f(l, { day: "2-digit", month: "2-digit" })}`; }
    if (P.rg === "month") return f(P.s, { month: "long", year: "numeric" });
    return String(P.s.getFullYear());
  }
  /* Summen je Abschnitt (Tag oder Monat) aus den Tageswerten von Modul 4; lim = nur die ersten lim Tage (Vergleich) */
  _gsAgg(ids, P, lim) {
    const H = (this._gsD && this._gsD.hist) || {}, key = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    const b = []; for (let i = 0; i < P.n; i++) b.push({ d: P.u === "m" ? new Date(P.s.getFullYear(), i, 15) : new Date(P.s.getFullYear(), P.s.getMonth(), P.s.getDate() + i, 12), v: [0, 0, 0], c: 0, sv: 0, n: 0 });
    const s0 = key(P.s), e0 = key(lim != null ? new Date(+P.s + lim * 864e5) : P.e);
    ids.forEach((id) => (H[id] || []).forEach((r) => {
      if (r.d < s0 || r.d >= e0) return;
      const i = P.u === "m" ? +r.d.slice(5, 7) - 1 : Math.round((new Date(r.d + "T12:00:00") - new Date(P.s.getFullYear(), P.s.getMonth(), P.s.getDate(), 12)) / 864e5);
      const x = b[i]; if (!x) return; x.v[0] += r.s; x.v[1] += r.b; x.v[2] += r.g; x.c += r.cost; x.sv += r.saved; x.n += r.n || 0;
    }));
    const t = b.reduce((a, x) => ({ v: [a.v[0] + x.v[0], a.v[1] + x.v[1], a.v[2] + x.v[2]], c: a.c + x.c, sv: a.sv + x.sv, n: a.n + x.n }), { v: [0, 0, 0], c: 0, sv: 0, n: 0 });
    t.kwh = t.v[0] + t.v[1] + t.v[2]; t.own = t.kwh > 0 ? (t.v[0] + t.v[1]) / t.kwh * 100 : null;
    return { b, t };
  }
  _gsPrev(ids, P) {
    if (P.rg === "day" && P.cur) return null;
    const V = this._gsPer(-1), el = P.cur ? Math.max(1, Math.ceil((Date.now() - P.s) / 864e5)) : null;
    return this._gsAgg(ids, V, el).t;
  }
  _gsSpark(id, P) {
    const Q = P.rg === "day" ? { ...this._gsPer(), rg: "week", s: new Date(P.s.getFullYear(), P.s.getMonth(), P.s.getDate() - 6), n: 7, u: "d" } : P;
    const b = this._gsAgg([id], Q).b, v = b.map((x) => x.v[0] + x.v[1] + x.v[2]), mx = Math.max(...v, 1e-6); if (v.filter((x) => x > 0).length < 2) return "";
    const X = (i) => (i / Math.max(1, v.length - 1)) * 100, d = v.map((y, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${(26 - y / mx * 22).toFixed(1)}`).join("");
    return `<svg class="gssp" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true"><path d="${d}L100 28L0 28Z" fill="#2dd4bf" opacity=".12"/><path d="${d}" fill="none" stroke="#2dd4bf" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg>`;
  }
  _gsPage() {
    const adm = this._admin(), G = this._gsState();
    this._gsLoad();
    const D = this._gsD, eur = (v) => num(v, 2) + " €";
    if (!G.devices.length) return `<div class="card empty">${ic("laundry", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Noch kein Gerät eingerichtet</div>
      <div class="sm" style="max-width:480px;margin:0 auto 14px">Zeigt pro Gerät (Waschmaschine, Trockner, Spülmaschine …), woher der Strom kommt – Solar, Batterie oder Netz – und was er kostet. Dazu Ersparnis, Durchläufe und eine Startempfehlung.</div>
      <ul class="wwl"><li>${ic("sun", 16)}Anteile Solar, Batterie, Netz pro Gerät</li><li>${ic("chart", 16)}Kosten und Ersparnis: Tag, Woche, Monat, Jahr</li><li>${ic("bell", 16)}Meldung am Ende eines Durchlaufs</li></ul>
      ${adm ? `<button class="btn2 pri" data-act="gsset" style="margin-top:16px;flex:none;padding:12px 22px">${ic("tools", 16)} Gerät hinzufügen</button>` : "Ein Administrator kann das Modul einrichten."}</div>`;
    const warn = !this._gsReady() ? `<div class="banner">${ic("alert", 18)}<div><b>Solar- und Netz-Sensor fehlen.</b> Sie werden in Modul 3 – Energie-Übersicht gewählt. Bis dahin gilt der gesamte Strom als Netzstrom.${adm ? ` <button class="lnk" data-act="mdensetup">Modul 3 öffnen</button>` : ""}</div></div>` : "";
    if (!D) return `${warn}<div class="card empty">Lade Gerätestrom …</div>`;
    this._gsTipBind();
    const devs = D.devices || [], ids = devs.map((d) => d.id), P = this._gsPer(), A = this._gsAgg(ids, P), T = A.t, V = this._gsPrev(ids, P), per = this._gsLabel(P);
    const cl = { day: "zum Vortag", week: "zur Vorwoche", month: "zum Vormonat", year: "zum Vorjahr" }[P.rg];
    const cmp = (cur, old, good) => { if (!V || old == null || old < 0.005) return ""; const d = Math.round((cur - old) / old * 100); if (!isFinite(d)) return ""; const c = d === 0 || good === "none" ? "" : (d > 0) === (good === "up") ? "up" : "dn"; return `<div class="g"><span class="tcmp ${c}">${d > 0 ? "▲" : d < 0 ? "▼" : "="} ${Math.abs(d)} %</span> ${cl}</div>`; };
    const today = new Date().toDateString(), hm = (ts) => new Date(ts).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    const chips = [...devs.filter((d) => d.running).map((d) => `<span class="chip">${ic(GS_TYP[this._gsTyp(d)].i, 16)}${esc(d.name)} läuft · ${wfmt(d.w[0] + d.w[1] + d.w[2])}</span>`),
      ...devs.filter((d) => !d.running && d.last && d.last.ts && new Date(d.last.ts).toDateString() === today).map((d) => `<span class="chip">${ic("check", 16)}${esc(d.name)} fertig ${hm(d.last.ts)}</span>`)].slice(0, 4).join("");
    const ring = this._modRing(T.own != null ? T.own : 0, "eigener Strom");
    const hero = `${warn}<div class="card hero mh hr a-gs gshero">${this._modLogo("gs")}${ring}<div class="mut" style="opacity:.85">${ic("laundry", 16)} ${esc(per)} gespart</div><div class="gsbig">${eur(T.sv)}</div>
      <div style="opacity:.85">${num(T.n)} ${T.n === 1 ? "Durchlauf" : "Durchläufe"} · ${num(T.kwh, 1)} kWh · Kosten ${eur(T.c)}</div>${chips ? `<div class="chips">${chips}</div>` : ""}</div>`;
    const nav = `<div class="ennav"><div class="seg wwseg enseg" role="group" aria-label="Zeitraum">${[["day", "Tag"], ["week", "Woche"], ["month", "Monat"], ["year", "Jahr"]].map(([k, l]) => `<button class="${P.rg === k ? "sel" : ""}" data-act="gsrange" data-k="${k}" aria-pressed="${P.rg === k}">${l}</button>`).join("")}</div>
      <div class="enper"><button class="ibtn" data-act="gsoff" data-k="-1" aria-label="Zurück">${ic("back", 18)}</button><b>${esc(per)}</b><button class="ibtn nx${P.cur ? " dis" : ""}" data-act="gsoff" data-k="1" aria-label="Weiter"${P.cur ? ' aria-disabled="true"' : ""}>${ic("back", 18)}</button>${P.cur ? "" : `<button class="lnk ennow" data-act="gsoff" data-k="0">Heute</button>`}</div></div>`;
    const tl = [["saved", "total", "Gespart", eur(T.sv), "#34d399", `${eur(T.c)} Kosten`, cmp(T.sv, V && V.sv, "up")], ["cost", "bolt", "Kosten", eur(T.c), "#f87171", T.n ? `Ø ${eur(T.c / T.n)} je Durchlauf` : "kein Durchlauf", cmp(T.c, V && V.c, "down")],
      ["kwh", "energy", "Energie", `${num(T.kwh, T.kwh >= 100 ? 0 : 1)}<small>kWh</small>`, "#2dd4bf", `${num(T.n)} ${T.n === 1 ? "Durchlauf" : "Durchläufe"}`, cmp(T.kwh, V && V.kwh, "none")], ["own", "sun", "Eigener Strom", T.own != null ? `${num(T.own, 0)}<small>%</small>` : "–", "#fbbf24", T.kwh ? `${num(T.v[0], 1)} kWh Solar · ${num(T.v[1], 1)} kWh Batterie` : "Keine Daten", V && V.own != null && T.own != null ? `<div class="g"><span class="tcmp ${T.own >= V.own ? "up" : "dn"}">${T.own >= V.own ? "▲" : "▼"} ${num(Math.abs(T.own - V.own), 0)} Punkte</span> ${cl}</div>` : ""]];
    const tiles = `<div class="tiles entiles">${tl.map(([k, ico, lab, v, c, sub, cm]) => `<div class="tile" style="--a:${c}"><div class="t"><span class="ti">${ic(ico, 16)}</span>${lab}</div><div class="v">${v}</div><div class="g">${sub}</div>${cm}</div>`).join("")}</div>`;
    const cards = devs.map((d) => {
      const a = this._gsAgg([d.id], P).t, run = d.running, base = run ? d.w : a.v, tot = base[0] + base[1] + base[2], ty = GS_TYP[this._gsTyp(d)], adv = d.advice || "", ac = /^Jetzt/.test(adv) ? "green" : /^Teil/.test(adv) ? "amber" : "slate";
      const since = run && d.since ? Math.max(0, Math.round((Date.now() / 1000 - d.since) / 60)) : null;
      return `<div class="card gsdev${this._gsSel === d.id ? " sel" : ""}"><button class="gsh gshb" data-act="gsdev" data-k="${esc(d.id)}" aria-pressed="${this._gsSel === d.id}"><span class="gsi big">${ic(ty.i, 20)}</span><span class="gsn"><b>${esc(d.name)}</b><small>${ty.n}</small></span><span class="gsst ${run ? "on" : ""}">${run ? `${wfmt(d.w[0] + d.w[1] + d.w[2])}${since != null ? ` · ${since >= 60 ? Math.floor(since / 60) + " h " + (since % 60) + " min" : since + " min"}` : ""}` : "Aus"}</span></button>
        <div class="gsbar" role="img" aria-label="Anteile Solar, Batterie, Netz">${tot > 0 ? base.map((v, i) => `<i style="width:${v / tot * 100}%;background:${GS_COL[i]}"></i>`).join("") : `<i style="width:100%;background:var(--line)"></i>`}</div>
        <div class="gsleg">${GS_SRC.map((t, i) => `<span><i style="background:${GS_COL[i]}"></i><em>${t}</em><b>${run ? wfmt(d.w[i]) : num(a.v[i], a.v[i] >= 10 ? 1 : 2) + " kWh"}</b></span>`).join("")}</div>
        <div class="gsrows"><div class="gsrow"><span class="mut">${esc(per)}</span><b>${eur(a.c)} Kosten</b><em>${eur(a.sv)} gespart · ${num(a.n)} ${a.n === 1 ? "Lauf" : "Läufe"}</em></div>
        <div class="gsrow"><span class="mut">Letzter Durchlauf</span><b>${d.last ? eur(d.last.cost) + " · " + num(d.last.kwh, 2) + " kWh" : "noch keiner"}</b><em>${d.last ? num(d.last.share, 0) + " % eigener Strom" + (d.last.ts ? " · " + new Date(d.last.ts).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }) + " " + hm(d.last.ts) : "") : ""}</em></div></div>
        ${this._gsSpark(d.id, P)}
        ${adv && !run ? `<div class="gsadv ${ac}">${ic("sun", 15)}${esc(adv)} <span class="mut">· Solardeckung jetzt ${num(d.cover, 0)} %</span></div>` : ""}</div>`; }).join("");
    if (this._gsTipX != null) Promise.resolve().then(() => this._gsTipShow());
    return `${hero}${nav}${tiles}<div class="gsgrid">${cards}</div>${this._gsChart(D, devs, P)}`;
  }
  _gsChart(D, devs, P) {
    const sel = devs.some((d) => d.id === this._gsSel) ? this._gsSel : "", pick = sel ? [sel] : devs.map((d) => d.id), W = 640, Hh = 210, pl = 40, pb = 24, pt = 14, ih = Hh - pb - pt;
    const chip = (k, t, on) => `<button class="gsch ${on ? "sel" : ""}" data-act="gsdev" data-k="${k}" aria-pressed="${on}">${t}</button>`;
    const chips = `<div class="gschips">${chip("", "Alle Geräte", !sel)}${devs.map((d) => chip(esc(d.id), esc(d.name), sel === d.id)).join("")}</div>`;
    const leg = `<div class="legend">${GS_SRC.map((t, i) => `<span><i style="background:${GS_COL[i]}"></i>${t}</span>`).join("")}</div>`;
    this._gsTipD = null;
    if (P.rg === "day") {
      const rows = devs.filter((d) => !sel || d.id === sel).map((d) => ({ d, t: this._gsAgg([d.id], P).t })).sort((a, b) => b.t.kwh - a.t.kwh), mx = Math.max(0.01, ...rows.map((r) => r.t.kwh));
      return `<div class="card gsc"><h2>${ic("chart", 18)}Woher der Strom kam · ${esc(this._gsLabel(P))}</h2>${chips}
        <div class="gshb2">${rows.map(({ d, t }) => `<div class="gshr"><span class="gshn">${ic(GS_TYP[this._gsTyp(d)].i, 15)}${esc(d.name)}</span><div class="gshbar"><div style="width:${(t.kwh / mx * 100).toFixed(1)}%">${t.v.map((v, i) => (v > 0 ? `<i style="flex:${v};background:${GS_COL[i]}"></i>` : "")).join("")}</div></div><span class="gshv">${num(t.kwh, 2)} kWh · ${num(t.c, 2)} €</span></div>`).join("")}</div>
        ${leg}<div class="mut sm" style="margin:6px 0 0">Woche, Monat und Jahr zeigen den Verlauf als Balken.</div></div>`;
    }
    const A = this._gsAgg(pick, P), now = Date.now(), b = A.b.map((x) => ({ ...x, fut: +x.d - (P.u === "m" ? 15 * 864e5 : 432e5) > now }));
    const mx = Math.max(...b.map((s) => s.v[0] + s.v[1] + s.v[2]), 0.1), step = enStep(mx), top = Math.ceil(mx / step) * step, gw = (W - pl) / b.length, bar = Math.max(3, Math.min(gw * 0.62, 34));
    const Y = (v) => pt + ih - (v / top) * ih;
    let s = ""; for (let v = 0, c = 0; v <= top + 1e-9 && c < 12; v += step, c++) s += `<line x1="${pl}" x2="${W}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${pl - 6}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="var(--mut)">${num(v, step < 1 ? 1 : 0)}</text>`;
    b.forEach((x, i) => {
      const bx = pl + i * gw + (gw - bar) / 2;
      if (x.fut) s += `<rect x="${bx.toFixed(1)}" y="${(Y(0) - 2).toFixed(1)}" width="${bar.toFixed(1)}" height="3" rx="1.5" fill="var(--line)"/>`;
      else { let y0 = 0; x.v.forEach((v, j) => { if (v <= 0) return; s += `<rect x="${bx.toFixed(1)}" y="${Y(y0 + v).toFixed(1)}" width="${bar.toFixed(1)}" height="${Math.max(0, Y(y0) - Y(y0 + v)).toFixed(1)}" fill="${GS_COL[j]}" rx="2"/>`; y0 += v; }); s += `<rect class="enhit" x="${(pl + i * gw).toFixed(1)}" y="${pt}" width="${gw.toFixed(1)}" height="${ih}" fill="transparent" data-act="gspick" data-k="${i}"/>`; }
      const lab = P.u === "m" ? x.d.toLocaleDateString("de-DE", { month: "short" }).replace(".", "") : P.rg === "week" ? x.d.toLocaleDateString("de-DE", { weekday: "short" }).replace(".", "") : String(x.d.getDate());
      if (P.u === "m" || P.rg === "week" || i % 5 === 0 || i === b.length - 1) s += `<text x="${(pl + i * gw + gw / 2).toFixed(1)}" y="${Hh - 6}" text-anchor="middle" font-size="11" fill="var(--mut)">${esc(lab)}</text>`;
    });
    this._gsTipD = { W, pl, gw, b, u: P.u };
    return `<div class="card gsc"><h2>${ic("chart", 18)}Verlauf nach Quelle · ${esc(this._gsLabel(P))}</h2>${chips}
      <div class="enchw"><svg class="gschart" viewBox="0 0 ${W} ${Hh}" width="100%" role="img" aria-label="Energie nach Quelle in kWh">${s}<rect class="encur" x="0" y="${pt}" width="0" height="${ih}" rx="4" fill="none" stroke="currentColor" opacity="0"/></svg><div class="entt" hidden></div></div>
      ${leg}<div class="mut sm" style="margin:6px 0 0">Zeitraum: ${num(A.t.kwh, 1)} kWh · Kosten ${num(A.t.c, 2)} € · gespart ${num(A.t.sv, 2)} € · ein Tipp auf einen Balken öffnet ${P.u === "m" ? "den Monat" : "den Tag"}.</div></div>`;
  }
  _gsTipBind() {
    if (this._gsTipOn) return; this._gsTipOn = true;
    const mv = (e) => { const svg = e.target && e.target.closest && e.target.closest(".gschart"); if (!svg) { if (this._gsTipX != null && e.type === "pointermove") { this._gsTipX = null; this._gsTipShow(); } return; } const r = svg.getBoundingClientRect(); this._gsTipX = (e.clientX - r.left) / r.width; this._gsTipT = Date.now(); this._gsTipShow(); };
    this.shadowRoot.addEventListener("pointermove", mv); this.shadowRoot.addEventListener("pointerdown", mv);
  }
  _gsTipShow() {
    const D = this._gsTipD, svg = this.shadowRoot.querySelector(".gschart"), w = svg && svg.parentElement; if (!w) return;
    const tt = w.querySelector(".entt"), cur = w.querySelector(".encur"), off = () => { tt.hidden = true; cur.setAttribute("opacity", "0"); };
    if (!D || this._gsTipX == null || Date.now() - (this._gsTipT || 0) > 8000) return off();
    const fx = this._gsTipX * D.W, i = Math.floor((fx - D.pl) / D.gw), x = D.b[i]; if (fx < D.pl || !x || x.fut) return off();
    const k = x.v[0] + x.v[1] + x.v[2];
    tt.innerHTML = `<b>${D.u === "m" ? x.d.toLocaleDateString("de-DE", { month: "long", year: "numeric" }) : x.d.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" })}</b>${GS_SRC.map((t, j) => `<span style="color:${GS_COL[j]}">${t} ${num(x.v[j], 2)} kWh</span>`).join("")}<span>Kosten ${num(x.c, 2)} € · gespart ${num(x.sv, 2)} €</span><span>${num(x.n)} ${x.n === 1 ? "Durchlauf" : "Durchläufe"}${k > 0 ? ` · ${num((x.v[0] + x.v[1]) / k * 100, 0)} % eigen` : ""}</span>`;
    tt.hidden = false; cur.setAttribute("x", (D.pl + i * D.gw).toFixed(1)); cur.setAttribute("width", D.gw.toFixed(1)); cur.setAttribute("opacity", ".5");
    const Wp = svg.getBoundingClientRect().width, px = (D.pl + i * D.gw + D.gw / 2) / D.W * Wp, tw = tt.offsetWidth || 180;
    tt.style.left = Math.max(0, Math.min(Wp - tw, px + (px + 14 + tw > Wp ? -tw - 14 : 14))) + "px";
  }
  /* Elektroauto & Wallbox (Beta) */
  _evState() { const s = this._mdState(); return s.ev || (s.ev = { brand: "", model: "", body: "limousine", color: "blue", ent: { soc: "", odo: "", range: "", plug: "", power: "", charging: "" } }); }
  _evNum(eid) { const st = eid && this._hass.states[eid]; if (!st) return null; const v = parseFloat(String(st.state).replace(",", ".")); return isFinite(v) ? (st.attributes.unit_of_measurement === "kW" ? v * 1000 : v) : null; }
  _evData() {
    const E = this._evState().ent, st = this._hass.states, S = (e) => (e && st[e] ? String(st[e].state).toLowerCase() : "");
    const power = this._evNum(E.power), soc = this._evNum(E.soc), odo = this._evNum(E.odo), range = this._evNum(E.range);
    const ON = /^(on|true|yes|connected|plugged|plugged_in|ev_connected|vehicle_connected|charging|ready|waiting|complete|finished|preparing|suspended)/, OFF = /^(off|false|no|disconnected|unplugged|not_connected|available|unavailable|unknown|none)/;
    const chg = E.charging ? ON.test(S(E.charging)) && !OFF.test(S(E.charging)) : power != null && power >= 100;
    const plug = E.plug ? ON.test(S(E.plug)) && !OFF.test(S(E.plug)) : chg;
    return { soc, odo, range, power, charging: plug && chg, plugged: plug || chg, any: Object.values(E).some(Boolean) };
  }
  _evScene(d) {
    const V = this._evState(), H = EV_SHAPES[V.body] || EV_SHAPES.limousine, C = EV_COLORS[V.color] || EV_COLORS.blue, [px, py] = H.port, [w1, w2] = H.wh;
    const led = d.charging ? "#22e06b" : d.plugged ? "#ffa51f" : "#9aa5b1", cab = `M112 207 C108 272 196 270 236 248 C${px - 38} ${py + 49} ${px - 14} ${py + 19} ${px} ${py}`;
    const wheel = (cx) => `<g><ellipse cx="${cx}" cy="250" rx="30" ry="3" fill="#000" opacity=".5"/><circle cx="${cx}" cy="217" r="33" fill="#0b0d11"/><circle cx="${cx}" cy="217" r="33" fill="none" stroke="#1d222b" stroke-width="3"/><circle cx="${cx}" cy="217" r="27" fill="none" stroke="#252b36" stroke-width="1.5"/>
        <circle cx="${cx}" cy="217" r="23" fill="url(#evrim)"/><circle cx="${cx}" cy="217" r="23" fill="none" stroke="#4b5563" stroke-width="1.2"/><circle cx="${cx}" cy="217" r="19" fill="#161a21"/>
        <circle cx="${cx}" cy="217" r="17" fill="none" stroke="#9aa3b1" stroke-width="1" opacity=".5"/><path d="M${cx - 15} 212 A16 16 0 0 1 ${cx - 4} 202" stroke="#d7141f" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>
        <g stroke="url(#evrim)" stroke-width="3" stroke-linecap="round">${Array.from({ length: 10 }, (_, k) => k * 36).map((ang) => `<line x1="${cx + 6 * Math.sin(ang * Math.PI / 180)}" y1="${217 - 6 * Math.cos(ang * Math.PI / 180)}" x2="${cx + 20 * Math.sin((ang + 8) * Math.PI / 180)}" y2="${217 - 20 * Math.cos((ang + 8) * Math.PI / 180)}"/>`).join("")}</g>
        <circle cx="${cx}" cy="217" r="7" fill="#2b313b"/><circle cx="${cx}" cy="217" r="3.2" fill="#b4bcc8"/><path d="M${cx - 24} 205 A26 26 0 0 1 ${cx + 6} 192" stroke="#fff" stroke-width="1.5" fill="none" opacity=".25"/></g>`;
    return `<svg class="evsvg" viewBox="0 0 760 290" role="img" aria-label="${d.charging ? "Fahrzeug lädt" : d.plugged ? "Ladekabel angesteckt" : "Ladekabel nicht angesteckt"}">
      <defs>
        <linearGradient id="evsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5aa7e6"/><stop offset=".62" stop-color="#bfe0f7"/><stop offset="1" stop-color="#eaf5fb"/></linearGradient>
        <radialGradient id="evsun" cx=".86" cy=".16" r=".45"><stop offset="0" stop-color="#fff7d1" stop-opacity=".95"/><stop offset=".35" stop-color="#fff2b0" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <linearGradient id="evpaint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C[1]}"/><stop offset=".45" stop-color="${C[2]}"/><stop offset="1" stop-color="${C[3]}"/></linearGradient>
        <linearGradient id="evglass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b3e52"/><stop offset=".5" stop-color="#16222f"/><stop offset="1" stop-color="#0a1018"/></linearGradient>
        <linearGradient id="evrim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e5e9ef"/><stop offset=".5" stop-color="#9aa3b1"/><stop offset="1" stop-color="#d7dce4"/></linearGradient>
        <linearGradient id="evwall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ece7df"/><stop offset="1" stop-color="#d6cfc4"/></linearGradient>
        <linearGradient id="evbox" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d9dde3"/></linearGradient>
        <linearGradient id="evroad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b7280"/><stop offset="1" stop-color="#4b5563"/></linearGradient>
        <clipPath id="evbody"><path d="${H.body}"/></clipPath><clipPath id="evgl"><path d="${H.glass}"/></clipPath><linearGradient id="evrefl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".35" stop-color="#000" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></linearGradient>
        <filter id="evblur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
        <filter id="evglow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.5"/></filter></defs>
      <rect width="760" height="290" rx="16" fill="url(#evsky)"/><rect width="760" height="290" rx="16" fill="url(#evsun)"/>
      <g opacity=".9" fill="#fff"><ellipse cx="260" cy="58" rx="46" ry="12" opacity=".85"/><ellipse cx="292" cy="50" rx="30" ry="11" opacity=".9"/><ellipse cx="520" cy="46" rx="38" ry="9" opacity=".75"/></g>
      <g filter="url(#evblur)" opacity=".55"><ellipse cx="300" cy="244" rx="120" ry="16" fill="#6f9a74"/><ellipse cx="480" cy="246" rx="150" ry="13" fill="#5d8a66"/><ellipse cx="680" cy="244" rx="110" ry="15" fill="#7aa57f"/></g>
      <rect y="248" width="760" height="42" fill="url(#evroad)"/><rect y="248" width="760" height="3" fill="#8b93a0"/><g stroke="#e5e7eb" stroke-width="3" opacity=".75"><path d="M250 276H330M440 276H520M630 276H710" stroke-linecap="round"/></g>
      <rect x="20" y="30" width="170" height="218" fill="url(#evwall)"/><rect x="20" y="30" width="170" height="10" fill="#bdb5a8"/><rect x="190" y="30" width="6" height="218" fill="#a69d8f" opacity=".6"/>
      <g stroke="#c8c0b3" stroke-width="1" opacity=".7">${[70, 110, 150, 190, 230].map((y) => `<line x1="20" y1="${y}" x2="190" y2="${y}"/>`).join("")}</g>
      <rect x="96" y="102" width="86" height="118" rx="18" fill="#000" opacity=".22" filter="url(#evblur)"/>
      <g><rect x="86" y="92" width="76" height="116" rx="16" fill="url(#evbox)" stroke="#aeb5bf" stroke-width="1.5"/>
        <rect x="86" y="92" width="76" height="116" rx="16" fill="none" stroke="#fff" stroke-width="1" opacity=".9"/>
        <rect x="96" y="102" width="56" height="26" rx="8" fill="#0d141c"/><text x="124" y="120" text-anchor="middle" font-size="12" font-weight="700" fill="${d.charging ? "#4ade80" : "#8da0b3"}">${d.charging && d.power != null ? num(d.power / 1000, 1) + " kW" : d.plugged ? "bereit" : "frei"}</text>
        <circle cx="124" cy="152" r="14" fill="#eef0f3" stroke="#c4cad2"/><circle cx="124" cy="152" r="11" fill="none" stroke="${led}" stroke-width="3.5"/><circle cx="124" cy="152" r="11" fill="none" stroke="${led}" stroke-width="3.5" filter="url(#evglow)" class="${d.charging ? "evpulse" : ""}" opacity=".8"/>
        <path d="M121 146 L126 146 L123 152 L127 152 L121 160 L123 154 L119 154 Z" fill="${led}"/>
        <rect x="108" y="190" width="32" height="14" rx="6" fill="#1a1f26"/><circle cx="124" cy="197" r="4" fill="#050709"/></g>
      <ellipse cx="490" cy="251" rx="215" ry="9" fill="#000" opacity=".45" filter="url(#evblur)"/>
      <g class="evcable ${d.plugged ? "on" : ""}">
        ${d.charging ? `<path d="${cab}" fill="none" stroke="#22e06b" stroke-width="12" stroke-linecap="round" opacity=".45" filter="url(#evglow)" class="evpulse"/>` : ""}
        <path d="${cab}" fill="none" stroke="#0b0e12" stroke-width="9" stroke-linecap="round"/><path d="${cab}" fill="none" stroke="#3a424d" stroke-width="2" stroke-linecap="round" transform="translate(-1.5 -2)"/>
        <path d="${cab}" fill="none" stroke="${d.charging ? "#a7f3c0" : "none"}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="5 13" class="${d.charging ? "evflow" : ""}"/>
        <g transform="rotate(-52 ${px} ${py})"><rect x="${px - 10}" y="${py - 8}" width="24" height="16" rx="6" fill="#14181e" stroke="#2c333c"/><rect x="${px + 10}" y="${py - 5}" width="6" height="10" rx="2" fill="#0b0e12"/><rect x="${px - 8}" y="${py - 6}" width="10" height="3" rx="1.5" fill="${led}" opacity=".9"/></g></g>
      <g>
        <path d="${H.body}" fill="url(#evpaint)"/>
        <g clip-path="url(#evbody)">
          <rect x="${H.rear - 4}" y="${H.gb}" width="420" height="40" fill="url(#evrefl)"/>
          <path d="M${H.rear} ${H.gt + 36} C420 ${H.gt + 28} 560 ${H.gt + 36} ${H.front} ${H.gt + 62}" stroke="#fff" stroke-width="3" fill="none" opacity=".38"/>
          <path d="M${H.rear} ${H.gb + 12} C420 ${H.gb + 8} 560 ${H.gb + 10} ${H.front} ${H.gb + 24}" stroke="${C[4]}" stroke-width="2.2" fill="none" opacity=".4"/>
          <path d="M${H.rear} ${H.gb + 14} C420 ${H.gb + 10} 560 ${H.gb + 12} ${H.front} ${H.gb + 26}" stroke="#fff" stroke-width="1" fill="none" opacity=".3"/>
          <path d="M${H.rear - 2} 224 L700 224 L700 240 L${H.rear - 2} 240 Z" fill="#10141b"/><path d="M${H.rear - 2} 224 L700 224" stroke="#fff" stroke-width="1" opacity=".18"/>
          <g stroke="${C[4]}" stroke-width="1.3" opacity=".65" fill="none">${H.seams.map((x, k) => `<path d="M${x} ${H.gb} C${x - 2} 190 ${x - 4} 210 ${x - 5} 224"/>`).join("")}</g>
          ${H.handles.map(([x, y]) => `<rect x="${x}" y="${y}" width="22" height="3.4" rx="1.7" fill="#0b0e12" opacity=".55"/><rect x="${x}" y="${y - 1}" width="22" height="1.6" rx=".8" fill="#fff" opacity=".4"/>`).join("")}
          <ellipse cx="${(H.rear + H.front) / 2}" cy="${H.gt - 6}" rx="${(H.front - H.rear) / 3.2}" ry="10" fill="#fff" opacity=".2"/></g>
        <path d="${H.glass}" fill="url(#evglass)"/>
        <g clip-path="url(#evgl)"><path d="M${H.gx[0] + 10} ${H.gb} L${H.gx[0] + 58} ${H.gt - 2} L${H.gx[0] + 84} ${H.gt - 2} L${H.gx[0] + 38} ${H.gb} Z" fill="#fff" opacity=".24"/><path d="M${H.pil + 24} ${H.gb} L${H.pil + 62} ${H.gt - 2} L${H.pil + 78} ${H.gt - 2} L${H.pil + 40} ${H.gb} Z" fill="#fff" opacity=".15"/><rect x="${H.gx[0]}" y="${H.gb - 12}" width="${H.gx[1] - H.gx[0]}" height="12" fill="#000" opacity=".25"/></g>
        <path d="M${H.pil - 3} ${H.gt - 2} L${H.pil + 1} ${H.gb + 1} L${H.pil + 5} ${H.gb + 1} L${H.pil + 3} ${H.gt - 2} Z" fill="${C[3]}" stroke="#05070a" stroke-width="1"/>
        <path d="${H.glass}" fill="none" stroke="#05070a" stroke-width="2.2" stroke-linejoin="round"/><path d="${H.glass.replace(/ Z$/, "")}" fill="none" stroke="#c9d3e3" stroke-width="1" opacity=".55" transform="translate(0 -2.6)"/>
        <path d="M${H.mir[0]} ${H.mir[1]} L${H.mir[0] + 14} ${H.mir[1]} C${H.mir[0] + 20} ${H.mir[1]} ${H.mir[0] + 22} ${H.mir[1] + 6} ${H.mir[0] + 16} ${H.mir[1] + 9} L${H.mir[0] - 2} ${H.mir[1] + 10} Z" fill="${C[2]}" stroke="${C[4]}"/>
        <path d="M${H.tl[0]} ${H.tl[1] - 9} L${H.tl[0] + 8} ${H.tl[1] - 11} L${H.tl[0] + 8} ${H.tl[1] + 9} L${H.tl[0]} ${H.tl[1] + 11} Z" fill="#d6192a"/><path d="M${H.tl[0]} ${H.tl[1] - 9} L${H.tl[0] + 8} ${H.tl[1] - 11} L${H.tl[0] + 8} ${H.tl[1] + 9} L${H.tl[0]} ${H.tl[1] + 11} Z" fill="#ff5a66" opacity=".55" filter="url(#evglow)"/>
        <path d="M${H.front - 34} ${H.ly - 2} C${H.front - 18} ${H.ly - 2} ${H.front - 6} ${H.ly + 2} ${H.front} ${H.ly + 8} L${H.front} ${H.ly + 13} C${H.front - 10} ${H.ly + 8} ${H.front - 22} ${H.ly + 6} ${H.front - 34} ${H.ly + 6} Z" fill="#f8fbff"/><path d="M${H.front - 34} ${H.ly - 2} L${H.front} ${H.ly + 10} L${H.front} ${H.ly + 14} Z" fill="#fff6c8" opacity=".6" filter="url(#evglow)"/>
        <path d="M${H.front - 6} ${H.ly + 22} L${H.front - 2} ${H.ly + 22} L${H.front - 2} ${H.ly + 40} L${H.front - 8} ${H.ly + 42} Z" fill="#0b0f16" opacity=".8"/>
        <path d="${H.body}" fill="none" stroke="${C[4]}" stroke-width="1.6"/>
        <circle cx="${px}" cy="${py}" r="7" fill="#0d1426" stroke="#8aa0c8" stroke-width="1.5"/><circle cx="${px}" cy="${py}" r="3.2" fill="${led}" class="${d.charging ? "evpulse" : ""}"/>
        <circle cx="${w1}" cy="217" r="41" fill="#07090d"/><circle cx="${w1}" cy="217" r="41" fill="none" stroke="${C[4]}" stroke-width="2"/><circle cx="${w2}" cy="217" r="41" fill="#07090d"/><circle cx="${w2}" cy="217" r="41" fill="none" stroke="${C[4]}" stroke-width="2"/>
        ${wheel(w1)}${wheel(w2)}</g>
      <g><rect x="562" y="30" width="162" height="40" rx="20" fill="#0f172a" opacity=".82"/>
        ${d.charging ? `<path d="M590 40 L580 52 H588 L585 62 L598 49 H590 Z" fill="#facc15"/>` : `<circle cx="588" cy="50" r="6" fill="${led}"/>`}
        <text x="642" y="57" text-anchor="middle" font-size="22" font-weight="800" fill="#fff">${d.soc != null ? num(d.soc, 0) + " %" : "–"}</text></g></svg>`;
  }
  _evPage() {
    const adm = this._admin(), d = this._evData();
    if (!d.any) return `${this._betaBox("Wähle in den Einstellungen die Sensoren deines Fahrzeugs und der Wallbox.")}
      <div class="card empty">${ic("car", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Noch kein Fahrzeug eingerichtet</div>
      <div class="sm" style="max-width:460px;margin:0 auto 14px">Zeigt Ladestand, Reichweite und Kilometerstand. Die Wallbox ist abgebildet, das Ladekabel erscheint beim Anstecken und leuchtet beim Laden.</div>
      ${adm ? `<button class="btn2 pri" data-act="mdevset" style="flex:none;padding:12px 22px">${ic("tools", 16)} Fahrzeug einrichten</button>` : "Ein Administrator kann das Modul einrichten."}</div>`;
    const stT = d.charging ? `Lädt${d.power != null ? " mit " + num(d.power / 1000, 1) + " kW" : ""}` : d.plugged ? "Angesteckt, lädt nicht" : "Nicht angesteckt";
    const tile = (ico, t, v, sub) => `<div class="luroom"><span class="mut lt"><span class="ti">${ic(ico, 15)}</span>${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    const bar = d.soc != null ? `<div class="gsbar" style="margin-top:6px" role="progressbar" aria-valuenow="${num(d.soc, 0)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.max(0, Math.min(100, d.soc))}%;background:${d.soc < 20 ? "#f87171" : "#34d399"}"></i></div>` : "";
    const wbOn = !!this._wbSnap().cfg.ip, wbTabs = wbOn ? this._wbTabs() + this._wbBar() : "";
    if (wbOn && this._wbStT() === "plan") return `${this._betaBox("Die Darstellung nutzt die Sensoren, die du in den Einstellungen wählst.")}${wbTabs}${this._wbPlan(d)}`;
    if (wbOn && this._wbStT() === "set") return `${this._betaBox("Die Darstellung nutzt die Sensoren, die du in den Einstellungen wählst.")}${wbTabs}${this._wbCard(d, "set")}`;
    if (wbOn && this._wbStT() === "stat") return `${this._betaBox("Die Darstellung nutzt die Sensoren, die du in den Einstellungen wählst.")}${wbTabs}${this._wbStat()}`;
    return `${this._betaBox("Die Darstellung nutzt die Sensoren, die du in den Einstellungen wählst.")}${wbTabs}
      <div class="evtop"><div class="card evcard ${d.charging ? "chg" : d.plugged ? "plg" : ""}"><div class="evhead"><b>${ic("car", 18)}${esc([this._evState().brand === "Andere" ? "" : this._evState().brand, this._evState().model].filter(Boolean).join(" ") || "Fahrzeug & Wallbox")}</b><span class="gsst ${d.charging ? "on" : ""}">${stT}</span></div>${this._evScene(d)}</div>
      <div class="lugrid">${tile("energy", "Ladestand", d.soc != null ? num(d.soc, 0) + " %" : "–", bar || "kein Sensor")}${tile("car", "Reichweite", d.range != null ? num(d.range, 0) + " km" : "–", d.range != null ? "laut Fahrzeug" : "kein Sensor")}${tile("total", "Kilometerstand", d.odo != null ? num(d.odo, 0) + " km" : "–", d.odo != null ? "gesamt" : "kein Sensor")}${tile("bolt", "Ladeleistung", d.power != null ? num(d.power / 1000, 1) + " kW" : "–", stT)}</div></div>
      <div class="mcols">${wbOn ? this._wbxToday(d) : ""}${this._wbCard(d)}</div>`;
  }
  _evSetModal() {
    const V = this._evState(), E = V.ent, st = this._hass.states, ks = Object.keys(st);
    const num_ = ks.filter((e) => e.startsWith("sensor.") && !isNaN(parseFloat(st[e].state)));
    const pw = ks.filter((e) => e.startsWith("sensor.") && (st[e].attributes.device_class === "power" || /^k?W$/.test(st[e].attributes.unit_of_measurement || "")));
    const bin = ks.filter((e) => e.startsWith("binary_sensor.") || e.startsWith("sensor.") || e.startsWith("switch."));
    const sel = (k, o, none, h) => this._wzSel(o, E[k], "event", `data-k="${k}"`, none || "– keiner –", h);
    return `<div class="ov" data-act="evdone"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Elektroauto &amp; Wallbox</b><span>Einstellungen · Beta</span></div><button class="ibtn" data-act="evdone" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("car", 15)}Dein Auto</div>
      <div class="mut sm" style="margin:2px 0 4px">Marke</div><div class="gschips">${EV_BRANDS.map((b) => `<button class="gsch ${V.brand === b ? "sel" : ""}" data-act="evbrand" data-k="${esc(b)}" aria-pressed="${V.brand === b}">${esc(b)}</button>`).join("")}</div>
      <div class="mut sm" style="margin:6px 0 4px">Modell (optional)</div><input class="otxt" type="text" maxlength="30" placeholder="z. B. Modellname" value="${esc(V.model)}" data-f="evmodel" aria-label="Modell">
      <div class="mut sm" style="margin:8px 0 4px">Form der Zeichnung</div><div class="gschips">${Object.entries(EV_BODIES).map(([k, t]) => `<button class="gsch ${V.body === k ? "sel" : ""}" data-act="evbody" data-k="${k}" aria-pressed="${V.body === k}">${t}</button>`).join("")}</div>
      <div class="mut sm" style="margin:6px 0 4px">Farbe</div><div class="gschips">${Object.entries(EV_COLORS).map(([k, c]) => `<button class="evsw ${V.color === k ? "sel" : ""}" data-act="evcol" data-k="${k}" style="--c:${c[2]};--c2:${c[1]}" aria-label="${c[0]}" aria-pressed="${V.color === k}" title="${c[0]}"></button>`).join("")}</div>
      <div class="gst">${ic("info", 15)}Marke und Modell erscheinen als Beschriftung. Die Zeichnung ist allgemein gehalten, ohne Logos und nicht dem Modell nachgebaut.</div>
      <div class="lsec">${ic("energy", 15)}Fahrzeug-Sensoren</div>
      <div class="mut sm" style="margin:2px 0 0">Ladestand (Prozent)</div>${sel("soc", num_, "", /soc|batter|ladestand|akku/i)}
      <div class="mut sm" style="margin:0">Kilometerstand</div>${sel("odo", num_, "", /odo|kilometer|km|mileage|stand/i)}
      <div class="mut sm" style="margin:0">Reichweite (optional)</div>${sel("range", num_, "", /reichweite|range/i)}
      <div class="lsec">${ic("bolt", 15)}Wallbox</div>
      <div class="mut sm" style="margin:2px 0 0">Ladekabel angesteckt (Sensor oder Status der Wallbox)</div>${sel("plug", bin, "", /plug|kabel|cable|connect|angesteckt|status/i)}
      <div class="mut sm" style="margin:0">Lädt gerade (optional, sonst aus der Ladeleistung)</div>${sel("charging", bin, "", /charging|l(ä|a)dt|lade/i)}
      <div class="mut sm" style="margin:0">Ladeleistung (Watt)</div>${sel("power", pw, "", /lade|charg|wallbox|power|leistung/i)}
      <div class="gst">${ic("info", 15)}Das Ladekabel erscheint, sobald „angesteckt“ meldet, und verschwindet beim Abstecken. Beim Laden leuchtet es und die Ladung läuft sichtbar.</div>
      <div class="foot2"><button class="btn2 pri" data-act="evdone">Fertig</button></div></div>`;
  }
