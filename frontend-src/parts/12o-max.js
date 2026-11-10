  /* ================= Sponsor Max 2 und 3 in der Lounge (Konzept Sponsor Max) =================
     Max 2: Woche voraus (M5), Wächter (M4), Was-wäre-wenn (M2). Max 3: Autopilot I (M1, Vorschläge / mit Bestätigung),
     Heizplan-Assistent (M6), Beta-Kanal 30 Tage (M11). Alles rechnet in Home Assistant bzw. im Browser; nichts wird gesendet. */
  _mxLoad(force) {
    if (!this._hass || this._mxBusy) return;
    if (!force && this._mxTs && Date.now() - this._mxTs < 120000) return;
    this._mxBusy = true; this._mxTs = Date.now();
    Promise.all([this._hass.callWS({ type: "fenster_heizung/wa_get", week: true }).catch(() => null), this._hass.callWS({ type: "fenster_heizung/ap_get" }).catch(() => null)])
      .then(([w, a]) => { this._mxW = w; this._mxA = a; })
      .finally(() => { this._mxBusy = false; if (this._loOpen) this._render(); if (this._modal && String(this._modal.type).startsWith("mx")) this._renderModal(); });
    if (!this._mxRel) this._mxRelLoad();
  }
  /* Beta-Kanal: Testversionen (Pre-Releases) von GitHub, öffentlich und ohne Konto */
  _mxRelLoad() {
    this._mxRel = { busy: true };
    fetch("https://api.github.com/repos/Maddog3010/ha-fenster-heizung/releases?per_page=10", { headers: { Accept: "application/vnd.github+json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((L) => { const pre = (Array.isArray(L) ? L : []).filter((x) => x.prerelease && !x.draft); this._mxRel = { pre: pre.slice(0, 3).map((x) => ({ tag: x.tag_name, ts: x.published_at, url: x.html_url })) }; })
      .catch(() => { this._mxRel = { err: true }; })
      .finally(() => { if (this._loOpen) this._render(); });
  }
  _mxD(ts) { try { return new Date(ts).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }); } catch (_) { return ""; } }
  /* ---- Karten ---- */
  _mxWeek() {
    const W = (this._mxW || {}).week;
    const head = `<h4>Woche voraus</h4>`;
    if (!this._mxW) return `<div class="lgt mxw" style="--c:#38bdf8">${head}<div class="mut sm">Lädt …</div></div>`;
    if (!W || !W.days || !W.days.length) return `<div class="lgt mxw" style="--c:#38bdf8">${head}<div class="mut sm">Kein Wetterbericht gefunden. Woche voraus braucht eine Wetter-Entität in Home Assistant.</div></div>`;
    const mx = Math.max(1, ...W.days.map((d) => d.kwh || 0));
    const cell = (d) => { const w = WX[d.cond] || ["cloud", d.cond || ""]; return `<div class="mxd">
      <b>${esc(d.dn)}</b><span class="mxi" title="${esc(w[1])}">${ic(w[0], 22)}</span>
      <small>${d.hi != null ? `${num(d.hi, 0)}°` : ""}${d.lo != null ? ` / ${num(d.lo, 0)}°` : ""}</small>
      <div class="mxbar" title="Sonne"><i style="height:${d.kwh != null ? Math.max(4, Math.round(d.kwh / mx * 100)) : 0}%"></i></div>
      <em>${d.kwh != null ? `${d.est ? "≈" : ""}${num(d.kwh, d.kwh >= 10 ? 0 : 1)} kWh` : "–"}</em>
      ${d.price ? `<span class="mxp ${d.price === "günstig" ? "lo" : d.price === "teuer" ? "hi" : ""}">${esc(d.price)}</span>` : `<span class="mxp none">–</span>`}
      ${d.heat ? `<span class="mxht ${d.heat}">${ic("flame", 11)}${esc(d.heat)}</span>` : ""}</div>`; };
    return `<div class="lgt mxw" style="--c:#38bdf8">${head}<div class="mxdays">${W.days.map(cell).join("")}</div>
      ${(W.tips || []).length ? `<div class="mxtips">${W.tips.map((t) => `<span>${ic("check", 13)}${esc(t)}</span>`).join("")}</div>` : ""}
      <div class="lgnote2">${W.src && W.src.sun ? "Sonne heute und morgen aus Modul 16, danach geschätzt aus der Bewölkung (≈)" : "Sonne geschätzt aus der Bewölkung (≈), bezogen auf deinen besten Tag"}${W.src && W.src.price ? " · Preise aus Tibber, soweit schon bekannt" : ""}. Heizbedarf aus der Außentemperatur.</div></div>`;
  }
  _mxWa() {
    const S = this._mxW, adm = this._admin();
    const head = `<div class="s3h">${this._gx("thermo", 30, { on: true, lvl: 80 })}<span><b>Wächter</b><small>meldet, was ungewöhnlich viel braucht oder weniger liefert</small></span>${adm ? `<button class="ibtn" data-act="mxwaset" aria-label="Wächter einstellen">${ic("sliders", 16)}</button>` : ""}</div>`;
    if (!S) return `<div class="lgt" style="--c:#f87171">${head}<div class="mut sm">Lädt …</div></div>`;
    if (S.cfg && !S.cfg.on) return `<div class="lgt" style="--c:#f87171">${head}<div class="lgnote2">Ausgeschaltet. Über ${ic("sliders", 12)} wieder einschalten.</div></div>`;
    const F = S.found || [], icon = { dev: "plug", pv: "pvRoof", inv: "bolt", win: "windowOpen" };
    return `<div class="lgt" style="--c:#f87171">${head}${F.length ? F.map((f) => `<div class="s3tip" style="--c:${f.kind === "win" ? "#38bdf8" : f.kind === "dev" ? "#f87171" : "#fbbf24"}">${this._gx(icon[f.kind] || "bolt", 26, { on: true, lvl: 70 })}<span>${esc(f.t)}</span>${adm ? `<button class="lgopen gy" data-act="mxign" data-k="${esc(f.k)}" title="7 Tage nicht mehr melden">7 Tage ignorieren</button>` : ""}</div>`).join("")
      : `<div class="s3learn">${ic("check", 18)}<span>Alles normal. Der Wächter vergleicht jedes Gerät mit den letzten 4 gleichen Wochentagen, die PV mit der Prognose und achtet nachts auf offene Fenster.</span></div>`}
      <div class="lgnote2">Prüft jeden Morgen um 6:05 den Vortag, Wechselrichter und Fenster laufend · feste Regeln, keine KI</div></div>`;
  }
  _mxSimCard() {
    return `<div class="lgt" style="--c:#a78bfa"><div class="s3h">${this._gx("battery", 30, { on: true, lvl: 60 })}<span><b>Was wäre, wenn …</b><small>größerer Akku, mehr PV – mit deinem echten Jahr gerechnet</small></span></div>
      <div class="mxq">${[["battery", "Größerer Akku"], ["pvRoof", "Mehr PV / Balkon"]].map(([k, t]) => `<span>${this._gx(k, 22, { on: true, lvl: 70 })}${t}</span>`).join("")}<span class="soon">Tibber · Wärmepumpe · Dämmung <em class="lgsoon">bald</em></span></div>
      <div class="lgbtns"><button class="btn2 lgpk" data-act="mxsim">Rechner öffnen</button></div>
      <div class="lgnote2">Stunde für Stunde aus der Langzeitstatistik von Home Assistant (Modul 3). Immer eine Schätzung, keine Kaufberatung.</div></div>`;
  }
  _mxAp() {
    const A = this._mxA, adm = this._admin(), c = (A && A.cfg) || { stage: "suggest" };
    const head = `<div class="s3h">${this._gx("house", 30, { on: true, lvl: 80 })}<span><b>Haus-Autopilot</b><small>Geräte, Auto und Warmwasser gemeinsam für die nächsten 24 Stunden</small></span>${adm ? `<button class="ibtn" data-act="mxapset" aria-label="Autopilot einstellen">${ic("sliders", 16)}</button>` : ""}</div>`;
    if (!A) return `<div class="lgt mxap" style="--c:#2dd4bf">${head}<div class="mut sm">Lädt …</div></div>`;
    const seg = `<div class="seg mxseg">${[["off", "Aus"], ["suggest", "Nur Vorschläge"], ["confirm", "Mit Bestätigung"]].map(([k, l]) => `<button class="${c.stage === k ? "sel" : ""}" data-act="mxstage" data-k="${k}" ${adm ? "" : "disabled"}>${l}</button>`).join("")}<button disabled title="kommt mit Max 4">Automatisch · Max 4</button></div>`;
    const P = A.props || [], st = { new: "", done: "erledigt", no: "abgelehnt", seen: "gesehen", fail: "ging nicht" }, ico = { dev: "washer", car: "car", ww: "boiler" };
    const rows = c.stage === "off" ? `<div class="lgnote2">Aus. Der Autopilot plant nichts und meldet nichts.</div>` : P.length ? P.map((p) => `<div class="mxprop ${p.state}">${this._gx(ico[p.kind] || "bolt", 28, { on: true, lvl: 70 })}<span><b>${esc(p.t)}</b>${c.stage === "confirm" && p.act ? `<small>→ ${esc(p.act)}</small>` : ""}</span>
        ${p.state === "new" && adm ? (c.stage === "confirm" ? `<span class="mxyn"><button class="lgopen" data-act="mxyes" data-k="${esc(p.id)}">Ja</button><button class="lgopen gy" data-act="mxno" data-k="${esc(p.id)}">Nein</button></span>` : `<button class="lgopen gy" data-act="mxno" data-k="${esc(p.id)}">Ausblenden</button>`) : `<em class="mxst">${st[p.state] || ""}</em>`}</div>`).join("")
      : `<div class="s3learn">${ic("check", 18)}<span>Gerade gibt es nichts vorzuschlagen. Der Autopilot plant alle 15 Minuten neu.</span></div>`;
    return `<div class="lgt mxap" style="--c:#2dd4bf">${head}${seg}${rows}
      ${c.stage !== "off" && adm ? `<div class="lgbtns"><button class="btn2 mxstop" data-act="mxstop">${ic("stop", 15)} Not-Aus</button><span class="lgnote2" style="margin:0">nimmt alles zurück, was der Autopilot angestoßen hat</span></div>` : ""}
      <div class="lgnote2">Fenster offen, Abwesend und Urlaub haben immer Vorrang. Grenzen der Module bleiben, wie sie sind.</div></div>`;
  }
  _mxHp() {
    const A = this._mxA, adm = this._admin(), H = (A && A.heat) || [], U = (A && A.undo) || [];
    const head = `<div class="s3h">${this._gx("radiator", 30, { on: true, lvl: 80 })}<span><b>Heizplan-Assistent</b><small>Vorschläge aus der gelernten Aufheizzeit je Raum</small></span></div>`;
    if (!A) return `<div class="lgt" style="--c:#fb923c">${head}<div class="mut sm">Lädt …</div></div>`;
    return `<div class="lgt" style="--c:#fb923c">${head}${H.length ? H.map((s) => `<div class="mxprop"><span class="mxk ${s.kind}">${ic(s.kind === "down" ? "moon" : "flame", 16)}</span><span><b>${esc(s.t)}</b>${s.save ? `<small>${esc(s.save)}</small>` : ""}</span>${adm ? `<span class="mxyn"><button class="lgopen" data-act="mxhp" data-k="${esc(s.id)}">Übernehmen</button><button class="lgopen gy" data-act="mxhpno" data-k="${esc(s.id)}" aria-label="Nicht übernehmen">${ic("close", 12)}</button></span>` : ""}</div>`).join("")
      : `<div class="s3learn">${ic("clock", 18)}<span>Keine Vorschläge. Dafür braucht ein Raum einen Heizplan und mindestens 3 gelernte Aufheizphasen.</span></div>`}
      ${U.map((u) => `<div class="mxundo">${ic("check", 13)}<span>Übernommen: ${esc(u.t)}</span>${adm ? `<button class="lnk" data-act="mxhpundo" data-k="${esc(u.room)}">Rückgängig</button>` : ""}</div>`).join("")}</div>`;
  }
  _mxBeta() {
    const R = this._mxRel || {}, v = this._ver || "", pre = (R.pre || [])[0];
    const diag = encodeURIComponent(`**Version:** ${v}\n**Home Assistant:** ${(this._hass && this._hass.config && this._hass.config.version) || "?"}\n**Module an:** ${Object.entries(this._mdState().on || {}).filter(([, x]) => x).map(([k]) => k).join(", ")}\n**Browser:** ${navigator.userAgent.replace(/\(.*?\)/g, "").trim().slice(0, 80)}\n\n**Was ist passiert?**\n\n**Was hast du erwartet?**\n`);
    return `<div class="lgt" style="--c:#818cf8"><div class="s3h"><span class="mxk big">${ic("flask", 18)}</span><span><b>Beta-Kanal</b><small>Vorabversionen 30 statt 14 Tage früher</small></span></div>
      ${pre ? `<div class="mxprop"><span class="mxk">${ic("flask", 16)}</span><span><b>Testversion ${esc(pre.tag)}</b><small>vom ${esc(this._mxD(pre.ts))}${pre.tag === v ? " · installiert" : v ? ` · du hast ${esc(v)}` : ""}</small></span><a class="lgopen" href="${esc(pre.url)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none">Was ist neu</a></div>` : `<div class="mut sm">${R.busy ? "Lädt …" : R.err ? "GitHub gerade nicht erreichbar." : "Gerade gibt es keine Testversion."}</div>`}
      <div class="lgbtns"><a class="btn2" href="/hacs/repository?owner=Maddog3010&repository=ha-fenster-heizung" target="_top" style="text-decoration:none">${ic("download", 15)} In HACS öffnen</a><a class="btn2" href="https://github.com/Maddog3010/ha-fenster-heizung/issues/new?title=${encodeURIComponent("Rückmeldung " + v)}&body=${diag}" target="_blank" rel="noopener noreferrer" style="text-decoration:none">${ic("mail", 15)} Rückmeldung</a></div>
      <div class="lgnote2">In HACS: ⋮ → Erneut herunterladen → Version wählen. Zurück zur stabilen Version genauso. Die Rückmeldung enthält nur Version, Module und Browser – keine Namen, keine Sensoren.</div></div>`;
  }
  _mxSection() {
    return `<div class="lgh4 mxh">★ Sponsor Max</div><div class="mxweek">${this._mxWeek()}</div>
      <div class="lg2 s3row">${this._mxAp()}${this._mxWa()}</div><div class="lg3">${this._mxHp()}${this._mxSimCard()}${this._mxBeta()}</div>`;
  }
  /* ---- Was-wäre-wenn: Stundenwerte der letzten 12 Monate und Durchlauf ---- */
  async _mxSimLoad() {
    const M = this._modal; if (!M || M.type !== "mxsim") return;
    if (this._mxSimD) return;
    M.busy = true; this._renderModal();
    try {
      const src = this._enSrc ? this._enSrc() : {}, pick = ["pv", "pv2", "imp", "exp"].map((k) => [k, src[k]]).filter((x) => x[1]);
      if (!pick.find((x) => x[0] === "imp") || !pick.find((x) => x[0] === "exp")) throw new Error("nosrc");
      const e = new Date(); e.setMinutes(0, 0, 0); const s = new Date(e.getTime() - 365 * 864e5);
      const q = (ids, ty) => (ids.length ? this._hass.callWS({ type: "recorder/statistics_during_period", start_time: s.toISOString(), end_time: e.toISOString(), statistic_ids: [...new Set(ids)], period: "hour", types: [ty] }) : Promise.resolve({}));
      const [re, rp] = await Promise.all([q(pick.filter((x) => x[1].t === "e").map((x) => x[1].id), "change"), q(pick.filter((x) => x[1].t === "p").map((x) => x[1].id), "mean")]);
      const H = new Map();
      for (const [k, x] of pick) {
        const kk = k === "pv2" ? "pv" : k;
        for (const r of (x.t === "e" ? re : rp)[x.id] || []) {
          const t = typeof r.start === "number" ? r.start : Date.parse(r.start); let v;
          if (x.t === "e") v = Math.max(r.change || 0, 0) * x.k;
          else { let w = (r.mean || 0) * x.k; if (x.sg) w = k === "exp" ? (x.sg === "import" ? -w : w) : (x.sg === "import" ? w : -w); v = Math.max(w, 0) / 1000; }
          const o = H.get(t) || { t, pv: 0, imp: 0, exp: 0 }; o[kk] += v; H.set(t, o);
        }
      }
      const rows = [...H.values()].sort((a, b) => a.t - b.t);
      if (rows.length < 24 * 14) throw new Error("short");
      const peak = Math.max(...rows.map((r) => r.pv));
      this._mxSimD = { rows, months: new Set(rows.map((r) => new Date(r.t).getFullYear() * 12 + new Date(r.t).getMonth())).size, kwp: Math.max(0.5, Math.round(peak / 0.8 * 10) / 10) };
      M.kwp = M.kwp || this._mxSimD.kwp;
    } catch (err) { M.err = err && err.message === "short" ? "Für den Rechner fehlen noch Daten: mindestens 14 Tage Langzeitstatistik." : "Für den Rechner braucht Modul 3 Netzbezug und Einspeisung (Zähler in kWh oder ein Netz-Sensor)."; }
    M.busy = false; this._renderModal();
  }
  _mxSim(D, bat, pvw, kwp) {
    const price = (this._price() || 0) / 100, feed = (this._feed() || 0) / 100, f = kwp > 0 ? pvw / 1000 / kwp : 0, P = Math.max(0.5, bat * 0.5);
    let soc = 0, i0 = 0, e0 = 0, i1 = 0, e1 = 0, pv = 0; const mon = {};
    for (const r of D.rows) {
      let imp = r.imp, exp = r.exp; i0 += imp; e0 += exp; pv += r.pv;
      const add = r.pv * f, use = Math.min(add, imp); imp -= use; exp += add - use;
      if (bat > 0) { const ch = Math.min(exp, (bat - soc) / 0.95, P); soc += ch * 0.95; exp -= ch; const dis = Math.min(imp, soc * 0.95, P); soc -= dis / 0.95; imp -= dis; }
      i1 += imp; e1 += exp;
      const d = new Date(r.t), k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; const m = mon[k] || (mon[k] = 0); mon[k] = m + (r.imp - imp) * price - (r.exp - exp) * feed;
    }
    const scale = D.rows.length < 8000 ? 8760 / D.rows.length : 1, house = pv + i0 - e0;
    return { eur: ((i0 - i1) * price - (e0 - e1) * feed) * scale, dImp: (i0 - i1) * scale, dExp: (e0 - e1) * scale, a0: house > 0 ? (1 - i0 / house) * 100 : null, a1: house > 0 ? (1 - i1 / house) * 100 : null, mon, scale, price, feed };
  }
  _mxSimModal() {
    const M = this._modal, D = this._mxSimD, close = `<button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button>`;
    const stp = (k, t, unit, s, lo, hi, dec = 0) => `<div class="vrow"><span>${t}</span><span class="lgstep"><button class="ibtn" data-act="mxsv" data-k="${k}" data-s="${-s}" data-lo="${lo}" data-hi="${hi}" aria-label="weniger">${ic("minus", 16)}</button><b>${num(M[k], dec)} ${unit}</b><button class="ibtn" data-act="mxsv" data-k="${k}" data-s="${s}" data-lo="${lo}" data-hi="${hi}" aria-label="mehr">${ic("plus", 16)}</button></span></div>`;
    let body = "";
    if (M.err) body = `<div class="gst on">${ic("info", 15)}<span>${esc(M.err)}</span></div>`;
    else if (!D) body = `<div class="mut sm">${ic("chart", 15)} Lädt die Stundenwerte der letzten 12 Monate …</div>`;
    else {
      const R = this._mxSim(D, M.bat, M.pvw, M.kwp), yrs = M.cost > 0 && R.eur > 1 ? M.cost / R.eur : null, mk = Object.keys(R.mon).sort(), mmax = Math.max(1, ...mk.map((k) => Math.abs(R.mon[k])));
      body = `${stp("bat", "Akku zusätzlich", "kWh", 1, 0, 30)}${stp("pvw", "PV zusätzlich", "W", 100, 0, 10000)}${stp("kwp", "Deine PV heute (geschätzt)", "kWp", 0.5, 0.5, 40, 1)}${stp("cost", "Anschaffung", "€", 100, 0, 30000)}
        <div class="mxres"><div><b class="pos">${num(R.eur, 0)} €</b><small>pro Jahr gespart</small></div><div><b>${R.a0 != null ? `${num(R.a0, 0)} → ${num(R.a1, 0)} %` : "–"}</b><small>Autarkie</small></div><div><b>−${num(R.dImp, 0)} kWh</b><small>Netzbezug</small></div><div><b>${R.dExp >= 0 ? "−" : "+"}${num(Math.abs(R.dExp), 0)} kWh</b><small>Einspeisung</small></div></div>
        ${yrs ? `<div class="mxpay">${ic("check", 15)} Bezahlt nach ca. <b>${num(yrs, yrs < 10 ? 1 : 0)} Jahren</b></div>` : ""}
        <div class="mxmon">${mk.map((k) => `<div title="${esc(k)}: ${num(R.mon[k], 0)} €"><i style="height:${Math.max(2, Math.round(Math.abs(R.mon[k]) / mmax * 100))}%"></i><small>${["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][+k.slice(5) - 1]}</small></div>`).join("")}</div>
        <div class="lgnote2">${D.months < 12 ? `Nur ${D.months} Monate Daten – auf ein Jahr hochgerechnet. ` : ""}Strompreis ${num(R.price * 100, 1)} ct, Einspeisung ${num(R.feed * 100, 1)} ct (Modul 1 → Allgemein). Akku mit 90 % Wirkungsgrad und halber Kapazität pro Stunde; zusätzliche PV wie deine heutige Anlage verteilt. Schätzung, keine Kaufberatung.</div>`;
    }
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true"><div class="sh"><div><b>Was wäre, wenn …</b><span>★ Sponsor Max · mit deinem echten Jahr</span></div>${close}</div>${body}
      <div class="gbtns" style="margin-top:12px"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _mxSetModal() {
    const M = this._modal, adm = this._admin(), close = `<button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button>`;
    const svc = Object.keys((this._hass.services || {}).notify || {}).filter((n) => !["send_message", "persistent_notification", "reload"].includes(n)).sort().map((n) => "notify." + n);
    const sw = (act, on, k = "") => `<button class="sw ${on ? "on" : ""}" data-act="${act}" ${k ? `data-k="${k}"` : ""} aria-pressed="${!!on}" ${adm ? "" : "disabled"}></button>`;
    const row = (t, sub, ctl) => `<div class="vrow"><span>${t}${sub ? `<small class="mut" style="display:block">${sub}</small>` : ""}</span>${ctl}</div>`;
    const chips = (sel, act) => svc.length ? `<div class="gschips">${[...new Set([...svc, ...sel])].map((n) => `<button class="gsch ${sel.includes(n) ? "sel" : ""}" data-act="${act}" data-k="${esc(n)}">${esc(n.replace(/^notify\.(mobile_app_)?/, ""))}</button>`).join("")}</div>` : `<div class="mut sm">Keine Benachrichtigungsdienste gefunden.</div>`;
    let body = "", t = "";
    if (M.type === "mxwaset") {
      const c = (this._mxW && this._mxW.cfg) || { on: true, rules: {}, notify: [] }; t = "Wächter";
      body = row("Wächter an", "", sw("mxwaon", c.on)) + `<div class="lsec">Regeln</div>`
        + row("Geräte brauchen mehr als sonst", "Modul 4, ab +30 % gegen die letzten 4 gleichen Wochentage", sw("mxwarule", c.rules.dev, "dev"))
        + row("PV weniger als die Prognose", "Modul 16, ab −30 % bei mindestens 3 kWh Prognose", sw("mxwarule", c.rules.pv, "pv"))
        + row("Wechselrichter still", "30 Min. keine PV-Leistung, obwohl die Sonne hoch steht", sw("mxwarule", c.rules.inv, "inv"))
        + row("Fenster nachts offen", "0–5 Uhr, über 1 Stunde, draußen unter 10 °C", sw("mxwarule", c.rules.win, "win"))
        + `<div class="lsec">Meldung aufs Handy</div>${chips(c.notify || [], "mxwanot")}<div class="mut sm" style="margin-top:4px">Die Funde stehen auch im Morgen-Briefing.</div>`;
    } else {
      const c = (this._mxA && this._mxA.cfg) || { parts: {}, notify: [] }; t = "Haus-Autopilot";
      body = `<div class="lsec">Was er planen darf</div>`
        + row("Geräte (Modul 4)", "Startzeit im besten Sonnenfenster, Bestätigung = Erinnerung", sw("mxappart", c.parts.dev, "dev"))
        + row("Auto (Modul 8)", "Heute nur mit Sonne laden, Bestätigung = Schnellstart „Sonne“", sw("mxappart", c.parts.car, "car"))
        + row("Warmwasser (Modul 2)", "PV-Überschuss nutzen an sonnigen Tagen", sw("mxappart", c.parts.ww, "ww"))
        + `<div class="gst">${ic("info", 15)}<span>Akku (Modul 13) kommt dazu, sobald Modul 13 fertig ist.</span></div>`
        + `<div class="lsec">Vorschläge aufs Handy</div>${chips(c.notify || [], "mxapnot")}<div class="mut sm" style="margin-top:4px">Bei „Mit Bestätigung“ mit den Tasten „Ja, machen“ und „Nein“.</div>`;
    }
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true"><div class="sh"><div><b>${t}</b><span>★ Sponsor Max</span></div>${close}</div>${body}<div class="gbtns" style="margin-top:12px"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _mxModal() { return this._modal.type === "mxsim" ? this._mxSimModal() : this._mxSetModal(); }
  /* ---- Aktionen ---- */
  _mxWaSet(patch) { this._hass.callWS({ type: "fenster_heizung/wa_set", cfg: patch }).then((r) => { this._mxW = { ...(this._mxW || {}), ...r }; this._render(); if (this._modal) this._renderModal(); }).catch((e) => this._toast((e && e.message) || "Das ging nicht")); }
  _mxApAct(act, extra = {}) { return this._hass.callWS({ type: "fenster_heizung/ap_act", act, ...extra }).then((r) => { this._mxA = r; this._render(); if (this._modal) this._renderModal(); return r; }).catch((e) => { this._toast((e && e.message) || "Das ging nicht"); return null; }); }
  _mxAct(a, b) {
    const k = b.dataset.k;
    if (a === "mxsim") { this._modal = { type: "mxsim", bat: 5, pvw: 800, kwp: (this._mxSimD && this._mxSimD.kwp) || 0, cost: 0 }; this._renderModal(); this._mxSimLoad(); return true; }
    if (a === "mxsv") { const M = this._modal; M[k] = Math.round(Math.min(+b.dataset.hi, Math.max(+b.dataset.lo, (+M[k] || 0) + +b.dataset.s)) * 10) / 10; this._renderModal(); return true; }
    if (a === "mxwaset" || a === "mxapset") { this._modal = { type: a }; this._renderModal(); return true; }
    if (a === "mxign") { this._mxWaSet({ ign: k }); this._toast("7 Tage nicht mehr melden"); return true; }
    const W = (this._mxW && this._mxW.cfg) || {}, C = (this._mxA && this._mxA.cfg) || {};
    if (a === "mxwaon") { this._mxWaSet({ on: !W.on }); return true; }
    if (a === "mxwarule") { this._mxWaSet({ rules: { ...(W.rules || {}), [k]: !(W.rules || {})[k] } }); return true; }
    if (a === "mxwanot") { const s = new Set(W.notify || []); s.has(k) ? s.delete(k) : s.add(k); this._mxWaSet({ notify: [...s] }); return true; }
    if (a === "mxstage") { this._mxApAct("set", { cfg: { stage: k } }); return true; }
    if (a === "mxappart") { this._mxApAct("set", { cfg: { parts: { ...(C.parts || {}), [k]: !(C.parts || {})[k] } } }); return true; }
    if (a === "mxapnot") { const s = new Set(C.notify || []); s.has(k) ? s.delete(k) : s.add(k); this._mxApAct("set", { cfg: { notify: [...s] } }); return true; }
    if (a === "mxyes" || a === "mxno") { this._mxApAct(a === "mxyes" ? "yes" : "no", { ref: k }); return true; }
    if (a === "mxstop") { this._mxApAct("stop").then((r) => r && this._toast("Autopilot aus – alles zurückgenommen")); return true; }
    if (a === "mxhp") { this._mxApAct("hp", { ref: k }).then((r) => r && this._toast(r.res && r.res.ok ? "Heizplan geändert" : (r.res && r.res.msg) || "Das ging nicht")); return true; }
    if (a === "mxhpno") { this._mxApAct("hpno", { ref: k }); return true; }
    if (a === "mxhpundo") { this._mxApAct("hpundo", { ref: k }).then((r) => r && this._toast("Heizplan wiederhergestellt")); return true; }
    return false;
  }
