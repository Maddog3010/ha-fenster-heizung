  /* Gerätestrom: eigene Berechnung im Backend (fenster_heizung/gs_get). Solar, Netz, Batterie kommen aus Modul 3, Preise aus Modul 1. */
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
    else if (a === "gsadd") { if (G.devices.length < GS_MAX) { G.devices.push({ id: "g" + Date.now().toString(36), name: "", ent: "", thr: 20, end: 5, typ: "" }); this._mdSave(); this._renderModal(); } }
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
    else if (a === "gsrem") {
      const d = ((this._gsD && this._gsD.devices) || []).find((x) => x.id === k), on = !(d && d.remind && d.remind * 1000 > Date.now());
      this._hass.callWS({ type: "fenster_heizung/gs_remind", dev: k, on }).then((r) => {
        if (r && r.devices) this._gsD = { ...r, ts: Date.now() };
        this._toast(!r || !r.ok ? (r && r.msg) || "Das hat nicht geklappt" : on ? `Erinnerung um ${new Date(r.ts * 1000).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr` : "Erinnerung gelöscht");
        this._render();
      }).catch((e) => this._toast("Erinnern: " + ((e && e.message) || "das hat nicht geklappt")));
    }
    else if (a === "gsold") { G.cards_old = !G.cards_old; this._mdSave(); this._renderModal(); }
    else if (this._gsDetAct && this._gsDetAct(a, b)) return;
    else if (this._gsSzAct && this._gsSzAct(a, b)) return;
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
      ${G.devices.length < GS_MAX ? `<button class="btn2" data-act="gsadd" style="width:100%;flex:none">${ic("plus", 16)} Gerät hinzufügen <span class="mut">(${G.devices.length} von ${GS_MAX})</span></button>` : `<div class="mut sm" style="text-align:center;margin:4px 0 8px">Höchstzahl erreicht: ${GS_MAX} von ${GS_MAX} Geräten.</div>`}
      <div class="lsec">${ic("sun", 15)}Quellen und Preise</div>
      <div class="gst ${this._gsReady() ? "" : "on"}">${ic(this._gsReady() ? "check" : "alert", 15)}<div>${this._gsReady() ? `Solar: <b>${nm(E.ent.pv)}</b>${E.ent.pv2 ? " + " + nm(E.ent.pv2) : ""} · Netz: <b>${nm(g.ent)}</b>${E.ent.bat || E.ent.bdis ? ` · Batterie: <b>${nm(E.ent.bat || E.ent.bdis)}</b>` : ""}<br><span class="mut">kommen aus Modul 3 – Energie-Übersicht.</span>` : "Solar- und Netz-Sensor fehlen. Sie werden einmal in Modul 3 – Energie-Übersicht gewählt und hier mitgenutzt."}</div></div>
      <div class="gst">${ic("info", 15)}<div>Bezugspreis <b>${eur(p.price)}</b>${p.price_mode === "entity" ? " (Sensor)" : ""}, Einspeisevergütung <b>${eur(p.feed)}</b>${p.feed_mode === "entity" ? " (Sensor)" : ""}<br><span class="mut">kommen aus Einstellungen → Haus → Preise &amp; Tarif.</span></div></div>
      <div class="gsq"><button class="btn2" data-act="mdensetup" style="flex:none">${ic("energy", 15)} Modul 3 öffnen</button></div>
      <div class="lsec">${ic("bolt", 15)}Batterie</div>
      <div class="of"><div class="ol"><b>Speicherkosten</b><span>Was eine kWh aus der Batterie kostet. 0 = Batteriestrom gilt als kostenlos.</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="gsbat" value="${G.bat_cost}" min="0" max="100" step="0.5"><u>ct/kWh</u></span></div></div>
      <div class="lsec">${ic("sun", 15)}Startempfehlung</div>
      <div class="mut sm" style="margin:2px 0 0">Prognose-Sensor in Watt (optional). Ohne Sensor zählt die aktuelle Solarleistung.</div>${this._wzSel(pw, G.forecast, "gsfc", "", "– keiner –", /prognose|forecast|solar|pv/i)}
      <div class="lsec">${ic("grid", 15)}Darstellung</div>
      <div class="vrow"><span>Karten wie bisher<small class="mut" style="display:block">An: Gerätekarten aus v1.1 mit Balken statt HD-Bild und Herkunfts-Ring</small></span><button class="sw ${G.cards_old ? "on" : ""}" data-act="gsold" aria-pressed="${!!G.cards_old}" aria-label="Karten wie bisher"></button></div>
      <div class="vrow"><span>Geräte-Szene im Banner<small class="mut" style="display:block">Aus: einheitlicher Banner wie in den anderen Modulen</small></span><button class="sw ${G.scene !== false ? "on" : ""}" data-act="gsscene" aria-pressed="${G.scene !== false}"></button></div>
      <div class="vrow"><span>Bewegung<small class="mut" style="display:block">Dezent: Fortschritt und Ring gleiten, Kabel fließen langsam. Voll: Kabel leuchten, Plaketten pulsieren. Im Tablet-Modus immer aus.</small></span><span class="gschs">${[["off", "Aus"], ["soft", "Dezent"], ["full", "Voll"]].map(([k, t]) => `<button class="gsch ${(G.anim || "soft") === k ? "sel" : ""}" data-act="gsanim" data-k="${k}">${t}</button>`).join("")}</span></div>
      <div class="vrow"><span>Monatsziel „mit Sonne gespart“<small class="mut" style="display:block">Fortschritt im Banner, 0 = aus</small></span><span class="lgstep"><button class="ibtn" data-act="gsgoal" data-k="-5" aria-label="weniger">${ic("minus", 16)}</button><b>${num(G.goal || 0, 0)} €</b><button class="ibtn" data-act="gsgoal" data-k="5" aria-label="mehr">${ic("plus", 16)}</button></span></div>
      <div class="lsec">${ic("bell", 15)}Meldung am Ende eines Durchlaufs und für „Erinnern“</div>
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
    if (this._gsDet) { const dd = (D.devices || []).find((x) => x.id === this._gsDet); if (dd) return `${warn}${this._gsDetPage(dd)}`; this._gsDet = null; }
    const devs = D.devices || [], ids = devs.map((d) => d.id), P = this._gsPer(), A = this._gsAgg(ids, P), T = A.t, V = this._gsPrev(ids, P), per = this._gsLabel(P);
    const cl = { day: "zum Vortag", week: "zur Vorwoche", month: "zum Vormonat", year: "zum Vorjahr" }[P.rg];
    const cmp = (cur, old, good) => { if (!V || old == null || old < 0.005) return ""; const d = Math.round((cur - old) / old * 100); if (!isFinite(d)) return ""; const c = d === 0 || good === "none" ? "" : (d > 0) === (good === "up") ? "up" : "dn"; return `<div class="g"><span class="tcmp ${c}">${d > 0 ? "▲" : d < 0 ? "▼" : "="} ${Math.abs(d)} %</span> ${cl}</div>`; };
    const today = new Date().toDateString(), hm = (ts) => new Date(ts).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    const chips = [...devs.filter((d) => d.running).map((d) => `<span class="chip">${ic(GS_TYP[this._gsTyp(d)].i, 16)}${esc(d.name)} läuft · ${wfmt(d.w[0] + d.w[1] + d.w[2])}</span>`),
      ...devs.filter((d) => !d.running && d.last && d.last.ts && new Date(d.last.ts).toDateString() === today).map((d) => `<span class="chip">${ic("check", 16)}${esc(d.name)} fertig ${hm(d.last.ts)}</span>`)].slice(0, 4).join("");
    const ring = this._modRing(T.own != null ? T.own : 0, "eigener Strom");
    const hero = `${warn}<div class="card hero mh hr a-gs gshero">${this._modLogo("gs")}${ring}<div class="mut" style="opacity:.85">${ic("laundry", 16)} ${esc(per)} gespart</div><div class="gsbig">${eur(T.sv)}</div>
      <div style="opacity:.85">${num(T.n)} ${T.n === 1 ? "Durchlauf" : "Durchläufe"} · ${num(T.kwh, 1)} kWh · Kosten ${eur(T.c)}</div>${chips ? `<div class="chips">${chips}</div>` : ""}</div>`;
    const heroX = G.scene !== false && this._gsNewCards() ? `${warn}${this._gsHeroScene(devs, P, chips)}` : hero;
    const nav = `<div class="ennav"><div class="seg wwseg enseg" role="group" aria-label="Zeitraum">${[["day", "Tag"], ["week", "Woche"], ["month", "Monat"], ["year", "Jahr"]].map(([k, l]) => `<button class="${P.rg === k ? "sel" : ""}" data-act="gsrange" data-k="${k}" aria-pressed="${P.rg === k}">${l}</button>`).join("")}</div>
      <div class="enper"><button class="ibtn" data-act="gsoff" data-k="-1" aria-label="Zurück">${ic("back", 18)}</button><b>${esc(per)}</b><button class="ibtn nx${P.cur ? " dis" : ""}" data-act="gsoff" data-k="1" aria-label="Weiter"${P.cur ? ' aria-disabled="true"' : ""}>${ic("back", 18)}</button>${P.cur ? "" : `<button class="lnk ennow" data-act="gsoff" data-k="0">Heute</button>`}</div></div>`;
    const tl = [["saved", "total", "Gespart", eur(T.sv), "#34d399", `${eur(T.c)} Kosten`, cmp(T.sv, V && V.sv, "up")], ["cost", "bolt", "Kosten", eur(T.c), "#f87171", T.n ? `Ø ${eur(T.c / T.n)} je Durchlauf` : "kein Durchlauf", cmp(T.c, V && V.c, "down")],
      ["kwh", "energy", "Energie", `${num(T.kwh, T.kwh >= 100 ? 0 : 1)}<small>kWh</small>`, "#2dd4bf", `${num(T.n)} ${T.n === 1 ? "Durchlauf" : "Durchläufe"}`, cmp(T.kwh, V && V.kwh, "none")], ["own", "sun", "Eigener Strom", T.own != null ? `${num(T.own, 0)}<small>%</small>` : "–", "#fbbf24", T.kwh ? `${num(T.v[0], 1)} kWh Solar · ${num(T.v[1], 1)} kWh Batterie` : "Keine Daten", V && V.own != null && T.own != null ? `<div class="g"><span class="tcmp ${T.own >= V.own ? "up" : "dn"}">${T.own >= V.own ? "▲" : "▼"} ${num(Math.abs(T.own - V.own), 0)} Punkte</span> ${cl}</div>` : ""]];
    const tiles = `<div class="tiles entiles">${tl.map(([k, ico, lab, v, c, sub, cm]) => `<div class="tile" style="--a:${c}"><div class="t"><span class="ti">${ic(ico, 16)}</span>${lab}</div><div class="v">${v}</div><div class="g">${sub}</div>${cm}</div>`).join("")}</div>`;
    const sdevs = this._mpDevs(devs);
    const cards = this._gsNewCards() ? sdevs.map((d) => this._mpDevWrap(d, this._gsCard2(d, this._gsAgg([d.id], P).t, per))).join("") : sdevs.map((d) => this._mpDevWrap(d, (() => {
      const a = this._gsAgg([d.id], P).t, run = d.running, base = run ? d.w : a.v, tot = base[0] + base[1] + base[2], ty = GS_TYP[this._gsTyp(d)], adv = d.advice || "", ac = /^Jetzt/.test(adv) ? "green" : /^Teil/.test(adv) ? "amber" : "slate";
      const since = run && d.since ? Math.max(0, Math.round((Date.now() / 1000 - d.since) / 60)) : null;
      return `<div class="card gsdev${this._gsSel === d.id ? " sel" : ""}"><button class="gsh gshb" data-act="gsdev" data-k="${esc(d.id)}" aria-pressed="${this._gsSel === d.id}"><span class="gsi big">${ic(ty.i, 20)}</span><span class="gsn"><b>${esc(d.name)}</b><small>${ty.n}</small></span><span class="gsst ${run ? "on" : ""}">${run ? `${wfmt(d.w[0] + d.w[1] + d.w[2])}${since != null ? ` · ${since >= 60 ? Math.floor(since / 60) + " h " + (since % 60) + " min" : since + " min"}` : ""}` : "Aus"}</span></button>
        <div class="gsbar" role="img" aria-label="Anteile Solar, Batterie, Netz">${tot > 0 ? base.map((v, i) => `<i style="width:${v / tot * 100}%;background:${GS_COL[i]}"></i>`).join("") : `<i style="width:100%;background:var(--line)"></i>`}</div>
        <div class="gsleg">${GS_SRC.map((t, i) => `<span><i style="background:${GS_COL[i]}"></i><em>${t}</em><b>${run ? wfmt(d.w[i]) : num(a.v[i], a.v[i] >= 10 ? 1 : 2) + " kWh"}</b></span>`).join("")}</div>
        <div class="gsrows"><div class="gsrow"><span class="mut">${esc(per)}</span><b>${eur(a.c)} Kosten</b><em>${eur(a.sv)} gespart · ${num(a.n)} ${a.n === 1 ? "Lauf" : "Läufe"}</em></div>
        <div class="gsrow"><span class="mut">Letzter Durchlauf</span><b>${d.last ? eur(d.last.cost) + " · " + num(d.last.kwh, 2) + " kWh" : "noch keiner"}</b><em>${d.last ? num(d.last.share, 0) + " % eigener Strom" + (d.last.ts ? " · " + new Date(d.last.ts).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }) + " " + hm(d.last.ts) : "") : ""}</em></div></div>
        ${this._gsSpark(d.id, P)}
        ${adv && !run ? `<div class="gsadv ${ac}">${ic("sun", 15)}${esc(adv)} <span class="mut">· Solardeckung jetzt ${num(d.cover, 0)} %</span></div>` : ""}</div>`; })())).join("");
    if (this._gsTipX != null) Promise.resolve().then(() => this._gsTipShow());
    if (this._tmOn && this._tmOn()) return `${warn}${this._gsWall(this._mpDevs(devs), P)}`;
    if (this._gsPhone()) return `${heroX}${nav}${this._gsList(this._mpDevs(devs), P, tiles)}`;
    return `${heroX}${nav}${this._mpWrap("gs", { kacheln: tiles, fenster: this._gsWinAll(this._mpDevs(devs)), geraete: `<div class="gsgrid">${cards}</div>`, verlauf: this._gsChart(D, devs, P), jahr: this._gsYearCard(this._mpDevs(devs)) })}`;
  }
  /* ---- Modul 4 v1.2: Gerätekarten 2.0 (HD-Bild mit Herkunfts-Ring, Prozentzeile, Restzeit ab 3 Läufen, drei Felder, Empfehlung mit „Erinnern“).
     Schalter „Karten wie bisher“ (G.cards_old) oder Neue Optik „wie bisher“ zeigt die Karten aus v1.1. */
  _gsNewCards() { return !this._gsState().cards_old && !this._gxCfg().classic; }
  _gsHd(d) { return this._gxAlt(this._gsTyp(d)) || "plug"; }
  /* Zustand der Karte: run (läuft, grün), done (heute fertig, türkis mit Uhrzeit), idle (bereit, grau) */
  _gsMode(d) {
    if (d.running) return "run";
    return d.last && d.last.ts && new Date(d.last.ts).toDateString() === new Date().toDateString() ? "done" : "idle";
  }
  /* Restzeit aus dem Median der letzten 10 Läufe (Backend: d.med in s, d.runs = gezählte Läufe); erst ab 3 Läufen */
  _gsRestInfo(d) {
    if (!d.running || !d.since) return null;
    const el = Math.max(0, Date.now() / 1000 - d.since), n = d.runs || 0;
    if (n < 3 || !(d.med > 0)) return { learn: true, n, el };
    const rest = Math.max(0, d.med - el), end = new Date((d.since + Math.max(d.med, el + 60)) * 1000);
    return { learn: false, n, el, rest, end, p: Math.min(1, el / d.med) };
  }
  _gsCard2(d, a, per) {
    const hm = (t) => new Date(t).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }), eur = (v) => num(v, 2) + " €";
    const m = this._gsMode(d), run = m === "run", ty = GS_TYP[this._gsTyp(d)], base = run ? d.w : a.v, tot = base[0] + base[1] + base[2];
    const mix = tot > 0 ? { pv: base[0], bat: base[1], net: base[2] } : {};
    const R = this._gsRestInfo(d), dur = (s) => { const x = Math.round(s / 60); return x >= 60 ? `${Math.floor(x / 60)} h ${x % 60} min` : `${x} min`; };
    const none = !run && tot <= 0 && !d.last, go = m === "idle" && !none && /^Jetzt/.test(d.advice || "");
    const pill = run ? `<span class="g2st run">läuft</span>` : m === "done" ? `<span class="g2st done">${ic("check", 12)} fertig ${hm(d.last.ts)}</span>` : none ? `<span class="g2st none">keine Daten</span>` : `<span class="g2st">bereit</span>`;
    const sub = run ? `${wfmt(d.w[0] + d.w[1] + d.w[2])}${R ? ` · seit ${dur(R.el)}` : ""}` : `${ty.n}${tot > 0 ? ` · ${num(a.kwh != null ? a.kwh : tot, 2)} kWh ${esc(per)}` : ""}`;
    const rest = !run || !R ? "" : R.learn ? `<div class="g2rest"><span class="gxrest learn">lernt die Laufzeit · ${R.n}/3 Läufe</span></div>`
      : `<div class="g2rest"><span class="gxrest">${R.rest < 90 ? "gleich fertig" : `noch ~${Math.round(R.rest / 60)} Min.`} · fertig ~ ${hm(R.end)} Uhr</span><div class="g2prog"><i style="width:${Math.round(R.p * 100)}%"></i></div></div>`;
    const f3 = [["Kosten", eur(a.c), esc(per)], ["Gespart", eur(a.sv), `${num(a.n)} ${a.n === 1 ? "Lauf" : "Läufe"}`],
      ["Letzter Lauf", d.last ? num(d.last.kwh, 2) + " kWh" : "–", d.last ? `${num(d.last.share, 0)} % eigen` : "noch keiner"]];
    const B = d.best, rem = d.remind && d.remind * 1000 > Date.now();
    const adv = run || !(B || d.advice) ? "" : B && B.ts * 1000 > Date.now() + 15 * 60000
      ? `<div class="g2adv">${this._gx("sun", 26)}<span>Am besten ${B.day === "tomorrow" ? "morgen " : ""}ab ${hm(B.ts * 1000)} starten<small>~${num(B.pct, 0)} % Solar erwartet</small></span><button class="g2rem${rem ? " on" : ""}" data-act="gsrem" data-k="${esc(d.id)}" aria-pressed="${rem}">${rem ? `${ic("check", 14)} Erinnert` : `${ic("bell", 14)} Erinnern`}</button></div>`
      : `<div class="g2adv ${/^Jetzt/.test(d.advice || "") ? "go" : ""}">${this._gx("sun", 26)}<span>${esc(d.advice || "")}<small>Solardeckung jetzt ${num(d.cover, 0)} %</small></span></div>`;
    return `<div class="card gsdev g2 g2-${none ? "none" : go ? "go" : m}${this._gsSel === d.id ? " sel" : ""}">
      <button class="g2h" data-act="gsdet" data-k="${esc(d.id)}" aria-label="${esc(d.name)}: Geräte-Seite öffnen"><span class="g2img">${this._gxRing(this._gsHd(d), mix, 76, { on: run })}${m === "done" ? `<i class="g2ok">${ic("check", 12)}</i>` : ""}</span>
        <span class="g2n"><b>${esc(d.name)}</b><span class="g2s">${pill}<small>${sub}</small></span></span></button>
      ${this._gxPct(mix).replace("noch keine Daten", "keine Daten")}${rest}
      <div class="g2f">${f3.map(([l, v, s]) => `<div><span>${l}</span><b>${v}</b><small>${s}</small></div>`).join("")}</div>
      ${this._gsSpark(d.id, this._gsPer())}${adv}</div>`;
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
        <div class="gshb2">${rows.map(({ d, t }) => `<div class="gshr"><span class="gshn">${this._gxCfg().classic ? ic(GS_TYP[this._gsTyp(d)].i, 15) : `<span class="gshi">${this._gx(this._gsHd(d), 24, { on: true, lvl: 80 })}</span>`}${esc(d.name)}</span><div class="gshbar"><div style="width:${(t.kwh / mx * 100).toFixed(1)}%">${t.v.map((v, i) => (v > 0 ? `<i style="flex:${v};background:${GS_COL[i]}"></i>` : "")).join("")}</div></div><span class="gshv">${num(t.kwh, 2)} kWh · ${num(t.c, 2)} €</span></div>`).join("")}</div>
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
