  _mdBar() {
    const a = this._mdActive(), bad = this._wwProblems().some((p) => p[0] === "bad" || p[0] === "warn");
    return `<nav class="mbar" aria-label="Module">${this._mdList().map((m) => `<button class="mtab ${a === m.id ? "sel" : ""}" data-act="mdgo" data-k="${m.id}" aria-pressed="${a === m.id}">${ic(m.icon, 20)}<span><small>${m.n ? "Modul " + m.n : m.start ? "Übersicht" : "Eigenes Modul"}</small><b>${esc(m.short)}</b></span>${m.id === "ww" && bad ? `<i class="mdot" title="Hinweise vorhanden"></i>` : ""}${modSt(m) ? `<em class="${STG[modSt(m)].c}">${STG[modSt(m)].t}</em>` : ""}</button>`).join("")}${this._labTab()}${this._admin() && this._stoCfg().tab ? `<button class="mtab sto" data-act="igopen" aria-label="Store: Integrationen und Dienste">${ic("puzzle", 20)}<span><small>Entdecken</small><b>Store</b></span>${this._stoTodo() ? `<i class="sdot">${this._stoTodo()}</i>` : ""}</button>` : `<button class="mtab add" data-act="mdmgr" aria-label="Module verwalten">${ic("plus", 18)}<span><small>Erweitern</small><b>Module</b></span></button>`}</nav>`;
  }
  _mdRender() {
    const sr = this.shadowRoot, a = this._mdActive(), m = this._mdList().find((x) => x.id === a), adm = this._admin();
    let body = "", pills = "";
    if (a === "ww") { body = this._wwPage(); pills = adm ? `<button class="pillbtn" data-act="mdst" aria-label="Einstellungen">${ic("sliders", 16)}<span class="bl">Einstellungen</span></button>` : ""; this._wwLoad(); }
    else if (a === "gs") { body = this._gsPage(); pills = adm ? `<button class="pillbtn" data-act="mdst" aria-label="Einstellungen">${ic("sliders", 16)}<span class="bl">Einstellungen</span></button>` : ""; }
    else if (a === "st") { body = this._hzPage(); pills = adm ? `<button class="pillbtn" data-act="hzopen" aria-label="Einstellungen">${ic("sliders", 16)}<span class="bl">Einstellungen</span></button>${this._edit ? `<button class="pillbtn pri" data-act="done">${ic("check", 16)}<span class="bl">Fertig</span></button>` : `<button class="pillbtn" data-act="edit">${ic("pencil", 16)}<span class="bl">Anpassen</span></button>`}` : ""; }
    else if (a === "mu") { body = this._muPage(); pills = adm ? `<button class="pillbtn" data-act="muxopen" aria-label="Einstellungen">${ic("sliders", 16)}<span class="bl">Einstellungen</span></button>${this._edit ? `<button class="pillbtn pri" data-act="done">${ic("check", 16)}<span class="bl">Fertig</span></button>` : `<button class="pillbtn" data-act="edit">${ic("pencil", 16)}<span class="bl">Anpassen</span></button>`}` : ""; this._muLoad(); }
    else if (a === "li") { body = this._liPage(); pills = adm ? `<button class="pillbtn" data-act="lixopen" aria-label="Einstellungen">${ic("sliders", 16)}<span class="bl">Einstellungen</span></button>` : ""; }
    else if (a === "ef") { body = this._efPage(); pills = adm ? `<button class="pillbtn" data-act="efxopen" aria-label="Einrichten">${ic("sliders", 16)}<span class="bl">Einrichten</span></button>` : ""; }
    else if (m.beta) { body = this._betaPage(a); pills = adm ? `<button class="pillbtn" data-act="mdst" aria-label="Einstellungen">${ic("sliders", 16)}<span class="bl">Einstellungen</span></button>` : ""; }
    else if (a === "en") { body = this._enPage(); pills = adm ? `<button class="pillbtn" data-act="mdst" aria-label="Einstellungen">${ic("sliders", 16)}<span class="bl">Einstellungen</span></button>` : ""; }
    else body = `<div class="card empty">${ic("puzzle", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">${esc(m.name)}</div>Dieses Modul wird aus <code>${esc(m.ext.url)}</code> geladen.<br><span class="sm">Externe Module werden in einer späteren Version geladen.</span></div>`;
    if (a !== "ww" && a !== "en" && a !== "gs" && a !== "mu" && a !== "li" && a !== "st" && !m.beta && adm) pills = `<button class="pillbtn" data-act="mdst" aria-label="Einstellungen">${ic("sliders", 16)}<span class="bl">Einstellungen</span></button>`;
    sr.getElementById("main").innerHTML = `
      <div class="bar${this._narrow ? " nar" : ""}">${this._narrow ? `<button class="ib0" data-act="menu" aria-label="Menü">${ic("menu", 24)}</button>` : ""}
        <div class="brand"><img class="blogo" src="${LOGO_URL}" alt="MADDOG3010" draggable="false"><div><em class="pn">${esc(PRODUCT)}</em><b>${m.n ? `<i class="mn">Modul ${m.n} – </i>` : ""}${esc(m.name)}</b><span>${modSt(m) ? `<em class="${STG[modSt(m)].c}">${STG[modSt(m)].h}</em>` : ""}<em class="tag">${esc(m.tag)}</em>${this._labHdr(a)}${this._ver ? `<em class="ver">Version ${esc(this._ver)}</em>` : ""}</span></div></div>${this._tmBtn()}${this._spnBtn()}${this._stoBtn()}${pills}</div>
      ${this._mdBar()}<div class="wrap">${this._tmHint()}${this._labCards(a)}${body}</div>`;
  }
  _mdAct(a, b) {
    const s = this._mdState(), m = this._modal, k = b.dataset.k;
    if (a === "mdgo") { this._stOpen = false; this._edit = false; this._mdActiveSet(k); this._render(); }
    else if (a === "mdst") { this._stOpen = true; this._render(); }
    else if (a === "mdstx") { this._stOpen = false; this._render(); }
    else if (a === "mdmgr") { this._modal = { type: "mods" }; this._renderModal(); }
    else if (a === "mdsetup") { this._modal = { type: "wwset" }; this._renderModal(); }
    else if (a === "mdevset") { this._modal = { type: "evset" }; this._renderModal(); }
    else if (a === "mdgs") { this._modal = { type: "gsset" }; this._renderModal(); }
    else if (a === "mdbeta") { this._toast("Für dieses Modul gibt es in der Beta noch keine Einstellungen"); }
    else if (a === "mdensetup") { this._modal = { type: "enset" }; this._renderModal(); }
    else if (a === "mdtog") {
      if (MODS.some((x) => x.id === k && x.sponsor) && !this._spnS().active) { this._modal = { type: "spndlg", err: "" }; this._renderModal(); return; }
      if (k === "ww") s.on.ww = !s.on.ww; else if (k === "en") { s.on.en = !this._enOn(); this._enState().on = s.on.en; } else if (k === "gs") s.on.gs = s.on.gs === false; else if (MODS.some((m) => m.beta && m.id === k)) s.on[k] = s.on[k] !== true; else { const x = s.ext.find((e) => e.id === k); if (x) x.on = !x.on; }
      if (!this._mdList().some((x) => x.id === s.active)) this._mdActiveSet("fh");
      this._mdSave(); this._renderModal(); this._render();
    }
    else if (a === "mdextadd") {
      const inp = this.shadowRoot.querySelector('[data-f="mdurl"]'), url = (inp ? inp.value : "").trim();
      if (!/^(https:\/\/|\/local\/|\/hacsfiles\/).+\.js$/i.test(url)) { m.err = "Bitte die Adresse der Moduldatei eintragen, z. B. /local/mein-modul.js oder https://…/modul.js"; m.url = url; this._renderModal(); return; }
      const base = decodeURIComponent(url.split("/").pop().replace(/\.js$/i, "")).replace(/[-_.]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      s.ext.push({ id: "x" + Date.now().toString(36), name: base || "Eigenes Modul", url, on: true }); m.err = ""; m.url = ""; this._mdSave(); this._renderModal(); this._render(); this._toast("Modul hinzugefügt");
    }
    else if (a === "mdextdel") { s.ext = s.ext.filter((x) => x.id !== k); if (s.active === k) this._mdActiveSet("fh"); this._mdSave(); this._renderModal(); this._render(); }
    else if (a === "mdhacs") { this._modal = null; this._renderModal(); this._nav("/hacs"); }
    else if (a === "mdinfo") { m.info = !m.info; this._renderModal(); }
    else if (a.startsWith("ww")) this._wwAct(a, b);
    else if (a.startsWith("en")) this._enAct(a, b);
    else if (a.startsWith("gs")) this._gsAct(a, b);
    else if (a === "evbrand" || a === "evbody" || a === "evcol") { const V = this._evState(); if (a === "evbrand") V.brand = V.brand === b.dataset.k ? "" : b.dataset.k; else if (a === "evbody") V.body = b.dataset.k; else V.color = b.dataset.k; this._mdSave(); this._renderModal(); }
    else if (a === "evdone") { this._pkId = null; this._modal = null; this._renderModal(); this._render(); }
  }
  _mdChange(t) {
    const f = t.dataset.f, m = this._modal;
    if (f === "mdurl") { if (m) m.url = t.value; return true; }
    if (f.startsWith("ww")) return this._wwChange(t);
    if (f.startsWith("en")) return this._enChange(t);
    if (f.startsWith("gs")) return this._gsChange(t);
    if (f === "evmodel") { this._evState().model = String(t.value || "").replace(/[<>"'&]/g, "").slice(0, 30); this._mdSave(); return true; }
    if (f === "event") { this._evState().ent[t.dataset.k] = t.value; this._mdSave(); return true; }
    return false;
  }
  _mdModal() {
    const m = this._modal;
    if (m.type === "wwset") return this._wwSetModal();
    if (m.type === "wwsch") return this._wwSchModal();
    if (m.type === "enset") return this._enSetModal();
    if (m.type === "gsset") return this._gsSetModal();
    if (m.type === "evset") return this._evSetModal();
    const s = this._mdState(), W = s.ww, ok = this._wwConfigured();
    const row = (id, ico, name, sub, right) => `<div class="mrow"><span class="mi">${ic(ico, 22)}</span><div class="mt"><b>${esc(name)}</b><span>${sub}</span></div>${right}</div>`;
    const tog = (id, on) => `<button class="sw ${on ? "on" : ""}" data-act="mdtog" data-k="${id}" aria-pressed="${on}" aria-label="Modul ein- oder ausschalten"></button>`;
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Module</b><span>Funktionen erweitern, ohne dass sie sich stören</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("check", 15)}Installiert</div>
      ${row("fh", "windowOpen", "Modul 1 – Fenster & Heizung", "Fenster, Heizpläne, Elektroheizer, Berichte", `<span class="mbadge">Grundmodul</span>`)}
      ${row("ww", "boiler", "Modul 2 – Warmwasser & Zirkulation", ok ? "Eingerichtet" : "Noch nicht eingerichtet", `<span class="mact">${!ok && s.on.ww ? `<button class="btn2 pri" data-act="mdsetup">Einrichten</button>` : ""}${tog("ww", s.on.ww)}</span>`)}
      ${row("en", "energy", "Modul 3 – Energie-Übersicht", this._enConfigured() ? "Eingerichtet" : "Noch nicht eingerichtet", `<span class="mact">${!this._enConfigured() && this._enOn() ? `<button class="btn2 pri" data-act="mdensetup">Einrichten</button>` : ""}${tog("en", this._enOn())}</span>`)}
      ${s.ext.map((x) => row(x.id, "puzzle", x.name, `<code>${esc(x.url)}</code>`, `<span class="mact"><button class="ibtn" data-act="mdextdel" data-k="${x.id}" aria-label="Modul entfernen">${ic("trash", 17)}</button>${tog(x.id, x.on)}</span>`)).join("")}
      ${row("gs", "laundry", "Modul 4 – Gerätestrom", this._gsState().devices.length ? this._gsState().devices.length + (this._gsState().devices.length === 1 ? " Gerät" : " Geräte") : "Noch nicht eingerichtet", `<span class="mact">${tog("gs", s.on.gs !== false)}</span>`)}
      ${MODS.filter((x) => x.beta).map((x) => row(x.id, x.icon, `Modul ${x.n} – ${x.name}`, esc(x.tag) + " · " + { dev: "in Entwicklung", beta: "Beta", vorab: "Vorabversion" }[modSt(x)] + "", `<span class="mact">${x.sponsor ? `<span class="mbadge sp">${ic("heart", 11)}Nur Sponsoren</span>` : ""}<span class="mbadge ${STG[modSt(x)].c}">${STG[modSt(x)].t}</span>${tog(x.id, s.on[x.id] === true && (!x.sponsor || this._spnS().active))}</span>`)).join("")}
      ${MOD_SOON.length ? `<div class="lsec">${ic("clock", 15)}Geplant</div>
      ${MOD_SOON.map(([ico, n, t]) => row("", ico, n, t, `<span class="mbadge soon">Geplant</span>`)).join("")}` : ""}
      <div class="lsec">${ic("plus", 15)}Weiteres Modul hinzufügen</div>
      <div class="mut sm" style="margin:2px 0 8px">Module sind kleine Erweiterungen. Sie nutzen deine Räume, die PV-Einstellungen und die Meldungen mit und erscheinen hier als eigene Seite.</div>
      <div class="gbtns"><button class="btn2" data-act="mdhacs">${ic("download", 16)} Über HACS suchen</button></div>
      <div class="mut sm" style="margin:4px 0 0">Oder die Adresse einer Moduldatei eintragen</div>
      <div class="murl"><input class="otxt" data-f="mdurl" placeholder="/local/mein-modul.js" value="${esc(m.url || "")}" autocomplete="off" spellcheck="false"><button class="btn2 pri" data-act="mdextadd">Hinzufügen</button></div>
      ${m.err ? `<div class="gst on">${ic("alert", 15)}${esc(m.err)}</div>` : ""}
      <button class="lnk" data-act="mdinfo">${ic("info", 15)}Wie funktionieren Module?</button>
      ${m.info ? `<div class="minfo"><b>So ist es aufgebaut</b><ul><li>Jedes Modul meldet sich mit <b>ID, Name, Symbol und einer Seite</b> (JavaScript-Datei) an.</li><li>Es bekommt Zugriff auf Räume, PV-Überschuss, Benachrichtigungen und die Gerätediagnose.</li><li>Was ein Modul speichert, bleibt in seinem eigenen Bereich. Ausschalten löscht nichts.</li><li>Module werden einzeln über HACS installiert und haben eigene Versionen.</li></ul></div>` : ""}
      <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }

  /* ---- Warmwasser: Daten ---- */
  _wwV(e) { const s = e && this._hass.states[e], v = s ? parseFloat(String(s.state).replace(",", ".")) : NaN; return isFinite(v) ? v : null; }
  _wwIsOn(e) { const s = e && this._hass.states[e]; return !!s && WW_ON.includes(s.state); }
  _wwConfigured() { const e = this._mdState().ww.ent; return !!(e.top || e.mid || e.bot || e.pump); }
  _wwDay() { const w = this._mdState().ww; return w.day || (new Date().getDay() % 6 === 0 ? "we" : "wd"); }
  _wwTemps() { const e = this._mdState().ww.ent; return { top: this._wwV(e.top), mid: this._wwV(e.mid), bot: this._wwV(e.bot) }; }
  _wwNowSched() {
    const W = this._mdState().ww, d = new Date(), key = d.getDay() % 6 === 0 ? "we" : "wd", mi = d.getHours() * 60 + d.getMinutes();
    const hit = (W.heat[key] || []).find((x) => mi >= wwTm(x.from) && mi < wwTm(x.to));
    return hit ? hit.temp : W.heat.low;
  }
  _wwShowers(t) {
    const W = this._mdState().ww, th = [t.top, t.mid, t.bot].filter((v) => v != null); if (!th.length) return null;
    const part = W.size / th.length; let mixed = 0;
    th.forEach((v) => { if (v > 38) mixed += part * (v - 10) / 28; });
    return Math.floor(mixed / 50);
  }
  _wwWant() { const W = this._mdState().ww; return W.info && Number.isFinite(W.info.want) ? W.info.want : W.boost ? W.leg.temp : W.away ? W.heat.low : this._wwNowSched(); }
  _wwStatus() {
    const W = this._mdState().ww, t = this._wwTemps(), want = this._wwWant();
    if (t.top != null && t.top >= 65) return ["alert", "Zu heiß", "warn"];
    if (W.info && W.info.leg) return ["shield", "Legionellenschutz läuft", "warn"];
    if (W.boost) return ["flame", "Einmal-Aufheizen läuft", "warn"];
    if (W.away) return ["suitcase", "Abwesend – Sparmodus", "mut"];
    if (this._wwIsOn(W.ent.src) || this._wwIsOn(W.ent.rod)) return ["flame", `Heizt auf ${num(want, 0)} °C`, "warn"];
    if (t.top != null && t.top >= want - 3) return ["check", "Bereit", "ok"];
    if (t.top != null) return ["alert", `Unter Soll (${num(want, 0)} °C)`, "warn"];
    return ["info", "Kein Messwert", "mut"];
  }
  _wwProblems() {
    const W = this._mdState().ww, E = W.ent, out = [];
    if (!this._hass || !this._wwConfigured()) return [["mut", "info", "Modul nicht eingerichtet", "Wähle unter „Einstellungen“ die Sensoren und Schalter für Speicher und Pumpe."]];
    const nm = (e) => this._wzName(e);
    [["top", "Speicher oben"], ["mid", "Speicher Mitte"], ["bot", "Speicher unten"], ["ret", "Rücklauf"]].forEach(([k, l]) => {
      if (!E[k]) return; const st = this._hass.states[E[k]];
      if (!st || ["unavailable", "unknown"].includes(st.state)) out.push(["bad", "alert", `${l}: nicht erreichbar`, `${nm(E[k])} liefert keinen Wert. Die Regelung ist an dieser Stelle blind.`]);
    });
    const t = this._wwTemps(), want = this._wwNowSched();
    if (t.top != null && t.top >= 65) out.push(["warn", "alert", `Speicher sehr heiß (${num(t.top, 1)} °C)`, "Ab 60 °C am Zapfhahn droht Verbrühungsgefahr. Mischer oder Begrenzung prüfen."]);
    else if (t.top != null && t.top < Math.min(want, W.heat.low) - 5 && !W.away) out.push(["warn", "alert", `Speicher kühler als Soll (${num(t.top, 1)} °C)`, `Soll ist ${num(want, 0)} °C. Heizt der Erzeuger nicht an?`]);
    const rv = this._wwV(E.ret);
    if (E.pump && this._wwIsOn(E.pump) && rv != null && rv >= W.circ.ret_max + 5) out.push(["warn", "thermo", `Rücklauf sehr warm (${num(rv, 1)} °C)`, "Pumpe läuft, obwohl der Rücklauf warm ist. Schwerkraftbremse oder Pumpenschaltung prüfen."]);
    if (W.leg.on) { const d = this._wwLegDays(); if (d != null && d > 9) out.push(["warn", "shield", `Legionellenschutz überfällig (${d} Tage)`, "Die letzte Aufheizung auf Schutztemperatur ist länger als 9 Tage her."]); }
    return out.length ? out : [["ok", "check", "Alles in Ordnung", `Sensoren erreichbar, Speicher im Soll${E.pump ? ", Pumpe unauffällig" : ""}.`]];
  }
  _wwLegDays() { const l = this._mdState().ww.leg.last; return l ? Math.floor((Date.now() - new Date(l.ts).getTime()) / 864e5) : null; }

  /* ---- Warmwasser: Verlauf (24 h) ---- */
  _wwLoad(force) {
    const W = this._mdState().ww, E = W.ent, ids = [E.top, E.mid, E.bot, E.ret, E.pump, E.src, E.rod].filter(Boolean);
    if (!this._hass || !ids.length) return;
    if (!force && this._wwH && Date.now() - this._wwH.ts < 3e5) return;
    if (this._wwBusy) return; this._wwBusy = true;
    const end = new Date(), start = new Date(+end - 864e5);
    this._hass.callWS({ type: "history/history_during_period", start_time: start.toISOString(), end_time: end.toISOString(), entity_ids: ids, include_start_time_state: true, significant_changes_only: false, minimal_response: false, no_attributes: false })
      .then((res) => { this._wwH = { ts: Date.now(), start: +start, end: +end, res: res || {} }; })
      .catch(() => { this._wwH = { ts: Date.now(), start: +start, end: +end, res: {}, err: true }; })
      .finally(() => { this._wwBusy = false; if (this._mdActive() === "ww" && !this._dragging) this._render(); });
  }
  _wwSeries(eid) { const H = this._wwH; if (!H || !eid) return []; return ((H.res || {})[eid] || []).map((x) => ({ t: ((x.lu ?? x.lc ?? H.start / 1000) * 1000 - H.start) / 6e4, s: x.s })); }
  _wwMinutesOn(eid) {
    const ser = this._wwSeries(eid), H = this._wwH; if (!ser.length || !H) return null;
    const total = (H.end - H.start) / 6e4; let sum = 0;
    ser.forEach((x, i) => { const t0 = Math.max(0, x.t), t1 = i + 1 < ser.length ? ser[i + 1].t : total; if (WW_ON.includes(x.s)) sum += Math.max(0, t1 - t0); });
    return Math.round(sum);
  }
  /* Sollwert des Zeitplans zu einem Zeitpunkt (Wochentag, Uhrzeit), für die gestrichelte Ziel-Linie */
  _wwSchedAt(ts) {
    const W = this._mdState().ww, d = new Date(ts), key = d.getDay() % 6 === 0 ? "we" : "wd", mi = d.getHours() * 60 + d.getMinutes();
    const hit = (W.heat[key] || []).find((x) => mi >= wwTm(x.from) && mi < wwTm(x.to));
    return hit ? hit.temp : W.heat.low;
  }
  _wwAt(ser, m) { let v = null; for (const x of ser) { if (x.t <= m) v = x; else break; } return v; }
  _wwChart() {
    const W = this._mdState().ww, E = W.ent, H = this._wwH;
    if (!H) return `<div class="mut sm" style="padding:30px 0;text-align:center">Verlauf wird geladen …</div>`;
    const lines = [["top", "oben", E.top], ["mid", "Mitte", E.mid], ["bot", "unten", E.bot]].filter((x) => x[2]).map(([k, l, e]) => ({ k, l, ser: this._wwSeries(e).map((x) => ({ t: x.t, v: parseFloat(x.s) })).filter((x) => isFinite(x.v)) })).filter((x) => x.ser.length);
    if (!lines.length) return `<div class="mut sm" style="padding:30px 0;text-align:center">Für den Verlauf fehlen Messwerte der Speicher-Sensoren.</div>`;
    const cw = this.clientWidth || 390, avail = cw >= 720 ? Math.min(780, cw * 0.94) : cw, Wd = Math.max(300, Math.min(748, Math.floor(avail - 32))), Ht = Wd < 500 ? 250 : 300, L = 34, R = 10, T = 12, B = 26, iw = Wd - L - R, ih = Ht - T - B, total = (H.end - H.start) / 6e4;
    const all = lines.flatMap((x) => x.ser.map((p) => p.v)), lo = Math.floor((Math.min(...all, W.heat.low) - 3) / 5) * 5, hi = Math.ceil((Math.max(...all, W.target) + 3) / 5) * 5;
    const X = (m) => L + (Math.max(0, Math.min(total, m)) / total) * iw, Y = (v) => T + ih - ((v - lo) / (hi - lo)) * ih;
    const cols = { top: "#f97316", mid: "#fbbf24", bot: "#38bdf8" }, top = lines.find((x) => x.k === "top") || lines[0];
    const segs = (eid) => { const ser = this._wwSeries(eid), out = []; ser.forEach((x, i) => { if (!WW_ON.includes(x.s)) return; const t0 = Math.max(0, x.t), t1 = i + 1 < ser.length ? ser[i + 1].t : total; if (t1 > t0) out.push([t0, t1]); }); return out; };
    const gen = E.src || E.rod ? segs(E.src || E.rod) : [], pump = E.pump ? segs(E.pump) : [];
    this._wwGeo = { W: Wd, L, iw, total, X, Y, lines, top, gen, pump, hasGen: !!(E.src || E.rod), hasPump: !!E.pump };
    let s = `<svg class="wwc2" viewBox="0 0 ${Wd} ${Ht}" role="img" aria-label="Speichertemperaturen der letzten 24 Stunden"><defs><linearGradient id="wwag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${cols[top.k]}" stop-opacity=".22"/><stop offset="1" stop-color="${cols[top.k]}" stop-opacity="0"/></linearGradient></defs>`;
    for (let v = Math.ceil(lo / 10) * 10; v <= hi; v += 10) s += `<line x1="${L}" x2="${Wd - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="var(--mut)">${v}°</text>`;
    const first = Math.ceil(H.start / 36e5) * 36e5;
    for (let i = 0; i <= 24; i++) { const ts = first + i * 36e5, d = new Date(ts); if (d.getHours() % 6 || ts > H.end) continue; const m = (ts - H.start) / 6e4; s += `<line x1="${X(m)}" x2="${X(m)}" y1="${T}" y2="${T + ih}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${X(m)}" y="${Ht - 8}" text-anchor="middle" font-size="11" fill="var(--mut)">${String(d.getHours()).padStart(2, "0")}:00</text>`; }
    for (const [a, b] of gen) s += `<rect x="${X(a)}" y="${T}" width="${Math.max(2, X(b) - X(a))}" height="${ih}" fill="#f97316" opacity=".12"/>`;
    let tp = "", py = null;
    for (let m = 0; m <= total; m += 5) { const v = this._wwSchedAt(H.start + m * 6e4); if (py === null) tp += `M${X(m).toFixed(1)} ${Y(v).toFixed(1)} `; else if (v !== py) tp += `L${X(m).toFixed(1)} ${Y(py).toFixed(1)} L${X(m).toFixed(1)} ${Y(v).toFixed(1)} `; py = v; }
    tp += `L${X(total).toFixed(1)} ${Y(py).toFixed(1)}`;
    s += `<path d="${tp}" fill="none" stroke="#7dd3fc" stroke-width="1.8" stroke-dasharray="5 4" opacity=".9"/>`;
    /* Messwerte kommen oft im Sekundentakt und rauschen: zu 12-Minuten-Mittelwerten zusammenfassen und mit einer weichen Kurve zeichnen */
    const smooth = (ser) => {
      const bk = [], B = 12; let cur = null;
      for (const q of ser) { const i = Math.floor(q.t / B); if (!cur || cur.i !== i) { cur = { i, n: 0, t: 0, v: 0 }; bk.push(cur); } cur.n++; cur.t += q.t; cur.v += q.v; }
      const pts = bk.map((b) => ({ t: b.t / b.n, v: b.v / b.n }));
      if (pts.length) { pts[0] = { t: Math.max(0, ser[0].t), v: ser[0].v }; pts.push({ t: total, v: pts[pts.length - 1].v }); }
      return pts;
    };
    const path = (ser) => {
      const p = smooth(ser).map((q) => [X(q.t), Y(q.v)]); if (p.length < 2) return p.length ? `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}` : "";
      let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
      for (let i = 0; i < p.length - 1; i++) {
        const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c, lo = Math.min(b[1], c[1]), hi = Math.max(b[1], c[1]);
        const y1 = Math.min(hi, Math.max(lo, b[1] + (c[1] - a[1]) / 6)), y2 = Math.min(hi, Math.max(lo, c[1] - (e[1] - b[1]) / 6));
        d += ` C${(b[0] + (c[0] - a[0]) / 6).toFixed(1)} ${y1.toFixed(1)} ${(c[0] - (e[0] - b[0]) / 6).toFixed(1)} ${y2.toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`;
      }
      return d;
    };
    s += `<path d="${path(top.ser)} L${X(total)} ${T + ih} L${X(Math.max(0, top.ser[0].t))} ${T + ih} Z" fill="url(#wwag)"/>`;
    lines.slice().reverse().forEach((x) => { s += `<path d="${path(x.ser)}" fill="none" stroke="${cols[x.k]}" stroke-width="${x === top ? 2 : 1.7}" stroke-linejoin="round" stroke-linecap="round"/>`; });
    s += `<line id="wxl" x1="0" x2="0" y1="${T}" y2="${T + ih}" stroke="var(--mut)" opacity=".7" visibility="hidden"/><circle id="wxc" r="5.5" cx="0" cy="0" fill="var(--card)" stroke="${cols[top.k]}" stroke-width="2.4" visibility="hidden"/></svg>`;
    const bar = (segsOn, c) => { let x = 0, h = ""; segsOn.forEach(([a, b]) => { if (a > x) h += `<i style="width:${((a - x) / total * 100).toFixed(2)}%;background:transparent"></i>`; h += `<i style="width:${((b - Math.max(a, x)) / total * 100).toFixed(2)}%;background:${c}"></i>`; x = b; }); return `<div class="rbar" aria-hidden="true">${h}</div>`; };
    const leg = lines.map((x) => `<span style="--c:${cols[x.k]}"><i></i>${x.l}</span>`).join("") + `<span style="--c:#7dd3fc"><i class="d"></i>Soll (Zeitplan)</span>` + (E.src || E.rod ? `<span style="--c:#f97316"><i class="b"></i>Erzeuger an</span>` : "");
    return `<div class="rleg">${leg}</div><div class="rwrap" id="wwrap">${s}<div class="rtip" id="wtip" style="display:none"></div></div>
      ${E.pump ? `${bar(pump, "#2dd4bf")}<div class="rleg" style="margin:6px 0 0"><span style="--c:#2dd4bf"><i class="b" style="background:#2dd4bf"></i>Zirkulationspumpe an</span></div>` : ""}`;
  }
  _wwHover(m) {
    const g = this._wwGeo, sr = this.shadowRoot; if (!g) return;
    const xl = sr.getElementById("wxl"), c = sr.getElementById("wxc"), tip = sr.getElementById("wtip"), H = this._wwH; if (!tip || !H) return;
    const x = g.X(m), tv = this._wwAt(g.top.ser, m), vals = g.lines.map((l) => { const p = this._wwAt(l.ser, m); return [l, p ? p.v : null]; });
    if (xl) { xl.setAttribute("x1", x); xl.setAttribute("x2", x); xl.removeAttribute("visibility"); }
    if (c && tv) { c.setAttribute("cx", x); c.setAttribute("cy", g.Y(tv.v)); c.removeAttribute("visibility"); }
    const ts = H.start + m * 6e4, d = new Date(ts), hh = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`, nm = { top: "oben", mid: "Mitte", bot: "unten" }, sol = this._wwSchedAt(ts);
    const on = (arr) => arr.some(([a, b]) => m >= a && m < b), cc = { top: "#f97316", mid: "#fbbf24", bot: "#38bdf8" };
    tip.style.display = ""; tip.style.left = Math.min(Math.max(x / g.W * 100, 17), 83) + "%";
    tip.innerHTML = `${hh} Uhr<b>${vals[0][1] != null ? num(vals[0][1], 1) : "–"} °C</b>${vals.slice(1).map(([l, v]) => `<div class="st" style="--c:${cc[l.k]}"><i></i>${nm[l.k]} ${v != null ? num(v, 1) + " °C" : "–"}</div>`).join("")}<div class="st" style="--c:#7dd3fc"><i></i>Soll ${num(sol, 0)} °C</div>${g.hasGen ? `<div class="st" style="--c:${on(g.gen) ? "#f97316" : "var(--line)"}"><i></i>${on(g.gen) ? "Erzeuger an" : "Erzeuger aus"}</div>` : ""}${g.hasPump && on(g.pump) ? `<div class="st" style="--c:#2dd4bf"><i></i>Pumpe läuft</div>` : ""}`;
  }
  _wwTank(t) {
    const col = (v) => wwCol(v), top = t.top ?? t.mid ?? t.bot, mid = t.mid ?? top, bot = t.bot ?? mid, f = (v) => (v == null ? "–" : num(v, 1));
    return `<svg class="wwtank" viewBox="0 0 196 176" role="img" aria-label="Speicher">
      <defs><linearGradient id="wwg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col(top)}"/><stop offset=".5" stop-color="${col(mid)}"/><stop offset="1" stop-color="${col(bot)}"/></linearGradient></defs>
      <path d="M62 14V5M30 154v13" stroke="rgba(255,255,255,.7)" stroke-width="5" stroke-linecap="round"/>
      <rect x="12" y="14" width="76" height="140" rx="17" fill="url(#wwg)" stroke="rgba(255,255,255,.7)" stroke-width="2.5"/>
      <rect x="21" y="24" width="8" height="120" rx="4" fill="#fff" opacity=".22"/>
      <path d="M44 120c10 0 10-10 20-10s10 10 20 10" stroke="rgba(255,255,255,.55)" stroke-width="2" fill="none" stroke-linecap="round" opacity="0"/>
      ${(() => { const r = [[38, t.top, "oben"], [88, t.mid, "Mitte"], [138, t.bot, "unten"]].filter((x) => x[1] != null); return r.length === 1 ? [[88, r[0][1], r[0][2]]] : r; })().map(([y, v, l]) => `<circle cx="88" cy="${y}" r="4.5" fill="#fff" stroke="${col(v)}" stroke-width="2"/><path d="M93 ${y}h14" stroke="rgba(255,255,255,.5)"/><text x="112" y="${y - 1}" font-size="19" font-weight="700" fill="#fff">${f(v)}<tspan font-size="12" font-weight="500" opacity=".8"> °C</tspan></text><text x="112" y="${y + 14}" font-size="11" fill="#fff" opacity=".7">${l}</text>`).join("")}</svg>`;
  }

  /* ---- Warmwasser: Seite ---- */
  _wwBar(list, kind) {
    const W = this._mdState().ww, now = new Date(), nm = now.getHours() * 60 + now.getMinutes();
    const seg = (list || []).map((x) => { const a = wwTm(x.from), b = wwTm(x.to); return `<i class="seg1 ${kind}" style="left:${(a / 14.4).toFixed(2)}%;width:${(Math.max(0, b - a) / 14.4).toFixed(2)}%;${kind === "heat" ? `background:${wwCol(x.temp)}` : ""}" title="${x.from}–${x.to}">${kind === "heat" && b - a >= 120 ? `<em>${x.temp}°</em>` : ""}</i>`; }).join("");
    return `<div class="wwbar ${kind}" style="${kind === "heat" ? `--low:${wwCol(W.heat.low)}` : ""}">${seg}<u style="left:${(nm / 14.4).toFixed(2)}%" title="Jetzt"></u></div><div class="wwax"><span>0</span><span>6</span><span>12</span><span>18</span><span>24 Uhr</span></div>`;
  }
  _wwList(list, kind) { return (list || []).length ? (list || []).map((x) => `<span class="wwr">${x.from}–${x.to}${kind === "heat" ? ` · <b style="color:${wwCol(x.temp)}">${x.temp} °C</b>` : ""}</span>`).join("") : `<span class="mut sm">Keine Zeiten – ${kind === "heat" ? "es gilt immer die Absenktemperatur." : "die Pumpe bleibt aus."}</span>`; }
  _wwPage() {
    const W = this._mdState().ww, E = W.ent, adm = this._admin();
    if (!this._wwConfigured()) return `<div class="card empty wwe">${ic("boiler", 40)}<div class="t1">Warmwasser & Zirkulation einrichten</div>
      <div class="sm" style="max-width:460px;margin:0 auto 14px">Wähle deinen Speicher-Sensor, den Wärmeerzeuger und die Zirkulationspumpe. Danach siehst du Temperatur, Zeitpläne und Legionellenschutz auf einen Blick.</div>
      <ul class="wwl"><li>${ic("clock", 16)}Zeitpläne für Aufheizen und Zirkulation</li><li>${ic("bolt", 16)}Überschuss aus PV im Speicher nutzen</li><li>${ic("shield", 16)}Legionellenschutz mit Nachweis</li></ul>
      ${adm ? `<button class="btn2 pri" data-act="mdsetup" style="margin-top:16px;flex:none;padding:12px 22px">${ic("tools", 16)} Modul einrichten</button>` : "Ein Administrator kann das Modul einrichten."}</div>`;
    const t = this._wwTemps(), st = this._wwStatus(), sh = this._wwShowers(t), want = this._wwWant(), key = this._wwDay(), today = new Date().getDay() % 6 === 0 ? "we" : "wd";
    const pumpOn = this._wwIsOn(E.pump), rv = this._wwV(E.ret), legD = this._wwLegDays(), pvNow = this._pvNow(), srcMin = this._wwMinutesOn(E.src || E.rod), pumpMin = this._wwMinutesOn(E.pump);
    const circH = (W.circ[today] || []).reduce((a, x) => a + Math.max(0, wwTm(x.to) - wwTm(x.from)), 0) / 60;
    const probs = this._wwProblems(), hasGen = !!(E.src || E.rod), hasPump = !!E.pump;
    const hero = `<div class="card hero mh a-ww wwh">
      <div class="wwl1"><div class="lbl">${ic("drop", 16)}Warmwasser oben im Speicher</div>
      <div class="big">${t.top != null ? num(t.top, 1) : "–"}<small>°C</small></div><div class="sub">Soll ${num(want, 0)} °C · ${W.size} Liter</div></div>
      ${this._modLogo("ww")}
      <div class="chips"><span class="chip st ${st[2]}">${ic(st[0], 16)}${st[1]}</span>${sh != null ? `<span class="chip">${ic("shower", 16)}Reicht für ca. ${sh} ${sh === 1 ? "Dusche" : "Duschen"}</span>` : ""}${E.pump ? `<span class="chip">${ic("drop", 16)}Zirkulation ${pumpOn ? "läuft" : "aus"}</span>` : ""}${W.pv.on && pvNow != null ? `<span class="chip">${ic("bolt", 16)}PV-Überschuss ${wfmt(pvNow)}</span>` : ""}</div>
      ${adm ? `<div class="wwacts"><button class="wwa ${W.boost ? "on" : ""}" data-act="wwboost" ${hasGen || W.boost ? "" : "disabled"} title="${hasGen ? "" : "Kein Wärmeerzeuger gewählt"}">${ic("flame", 17)}<span>${W.boost ? "Aufheizen stoppen" : "Einmal aufheizen"}</span>${hasGen || W.boost ? "" : "<small>Kein Erzeuger gewählt</small>"}</button><button class="wwa ${W.circ5 ? "on" : ""}" data-act="wwcirc5" ${E.pump ? "" : "disabled"}>${ic("clock", 17)}<span>${W.circ5 ? "Zirkulation läuft 5 Min." : "Zirkulation 5 Min."}</span>${E.pump ? "" : "<small>Keine Pumpe gewählt</small>"}</button><button class="wwa ${W.away ? "on" : ""}" data-act="wwaway">${ic("suitcase", 17)}<span>${W.away ? "Abwesend: an" : "Abwesend"}</span></button></div>` : ""}</div>`;
    const tiles = `<div class="tiles">${[
      ["flame", "Erzeuger", srcMin == null ? "–" : srcMin, "Min.", "var(--amber)", hasGen ? "Aktive Zeit, letzte 24 Std." : "Kein Erzeuger gewählt"],
      ["drop", "Zirkulation", pumpMin == null ? "–" : pumpMin, "Min.", "var(--teal)", hasPump ? `Plan: ${num(circH, 1)} Std. pro Tag` : "Keine Pumpe gewählt"],
      ["thermo", "Rücklauf", rv == null ? "–" : num(rv, 1), "°C", "#60a5fa", E.ret ? `Pumpe stoppt ab ${W.circ.ret_max} °C` : "Kein Sensor gewählt"],
      ["shield", "Legionellenschutz", legD == null ? "–" : legD, legD === 1 ? "Tag her" : "Tage her", "#a78bfa", !hasGen ? "Kein Erzeuger gewählt" : W.leg.on ? `Nächster Lauf: ${DAYS[W.leg.day]} ${W.leg.time}` : "Ausgeschaltet"],
    ].map(([ico, lab, v, u, col, sub]) => `<div class="tile" style="--a:${col}"><div class="t"><span class="ti">${ic(ico, 16)}</span>${lab}</div><div class="v">${v}<small>${u}</small></div><div class="g">${sub}</div></div>`).join("")}</div>`;
    const chart = `<div class="card wwc"><h2>${ic("chart", 18)}Speicher · letzte 24 Stunden<button class="ibtn gear" style="margin-left:auto" data-act="wwreload" aria-label="Aktualisieren">${ic("clock", 16)}</button></h2>${this._wwChart()}</div>`;
    const dayTabs = (w) => `<div class="seg wwseg" role="group">${[["wd", "Montag–Freitag"], ["we", "Wochenende"]].map(([k, l]) => `<button class="${key === k ? "sel" : ""}" data-act="wwday" data-k="${k}" aria-pressed="${key === k}">${l}</button>`).join("")}</div>`;
    const heatC = `<div class="card"><h2>${ic("plan", 18)}Warmwasser-Zeitplan${adm ? `<button class="lnk" style="margin-left:auto" data-act="wwsch" data-k="heat">${ic("pencil", 15)}Bearbeiten</button>` : ""}</h2>${dayTabs()}
      ${hasGen ? "" : `<div class="wwempty">${ic("flame", 22)}<div><b>Noch kein Wärmeerzeuger gewählt</b><span>Der Zeitplan wird erst wirksam, wenn ein Erzeuger oder Heizstab gewählt ist. Bis dahin dient er nur der Anzeige.</span></div>${adm ? `<button class="lnk" data-act="mdsetup">Auswählen</button>` : ""}</div>`}
      <div class="${hasGen ? "" : "wwdim"}">${this._wwBar(W.heat[key], "heat")}<div class="wwrs">${this._wwList(W.heat[key], "heat")}</div></div>
      <div class="wwnote">${ic("moon", 15)}<span>Außerhalb der Zeiten hält der Speicher <b>${W.heat.low} °C</b>. ${W.pv.on ? "Bei PV-Überschuss heizt er bis " + W.pv.max + " °C." : ""}</span></div></div>`;
    const modes = [["plan", "Zeitplan"], ["demand", "Bei Bedarf"], ["interval", "Intervall"], ["off", "Aus"]];
    const cm = W.circ.mode;
    const circC = !hasPump ? `<div class="card"><h2>${ic("drop", 18)}Zirkulation</h2>
      <div class="wwempty big">${ic("drop", 30)}<div><b>Keine Zirkulationspumpe gewählt</b><span>Wähle in den Einstellungen den Schalter der Pumpe. Danach kannst du Zeitplan, Bedarf oder Intervall einstellen und siehst, wann sie läuft.</span></div>${adm ? `<button class="btn2 pri" data-act="mdsetup" style="flex:none;padding:10px 18px">Pumpe wählen</button>` : ""}</div></div>` : `<div class="card"><h2>${ic("drop", 18)}Zirkulation${E.pump ? `<span class="wwst ${pumpOn ? "on" : ""}">${pumpOn ? "Pumpe läuft" : "Pumpe aus"}</span>` : ""}</h2>
      <div class="seg wwseg" role="group">${modes.map(([k, l]) => `<button class="${cm === k ? "sel" : ""}" data-act="wwmode" data-k="${k}" aria-pressed="${cm === k}">${l}</button>`).join("")}</div>
      ${cm === "off" ? `<div class="mut sm">Die Pumpe bleibt aus. Warmes Wasser kommt am Hahn mit Wartezeit.</div>` : `
        ${cm === "demand" ? `<div class="wwhint">${ic("info", 16)}<span>Die Pumpe startet kurz, wenn <b>${E.trig ? esc(this._wzName(E.trig)) : "ein Auslöser"}</b> meldet, und läuft ${W.circ.run} Min. nach.${E.trig ? "" : " Wähle den Auslöser in den Einstellungen."} Mit Zeiten unten gilt das nur dann, ohne Zeiten immer.</span></div>` : ""}
        ${cm === "interval" ? `<div class="wwhint">${ic("info", 16)}<span>In den Zeiten unten läuft die Pumpe alle ${W.circ.every} Min. für ${W.circ.on} Min.</span></div>` : ""}
        ${cm === "plan" ? `<div class="wwhint">${ic("info", 16)}<span>Die Pumpe läuft in diesen Zeiten, solange der Rücklauf unter ${W.circ.ret_max} °C bleibt.</span></div>` : ""}
        ${dayTabs()}${this._wwBar(W.circ[key], "circ")}<div class="wwrs">${this._wwList(W.circ[key], "circ")}${adm ? `<button class="lnk" data-act="wwsch" data-k="circ">${ic("pencil", 15)}Zeiten</button>` : ""}</div>
        ${cm === "demand" ? this._wwNum("Nachlauf", "Wie lange die Pumpe nach dem Auslöser läuft.", "circ.run", W.circ.run, 1, 15, 1, "Min.", adm) : ""}
        ${cm === "interval" ? this._wwNum("Pumpe läuft", "", "circ.on", W.circ.on, 1, 15, 1, "Min.", adm) + this._wwNum("Alle", "", "circ.every", W.circ.every, 10, 120, 5, "Min.", adm) : ""}
        ${this._wwNum("Pumpe stoppt ab Rücklauf", "Spart Energie, weil schon warmes Wasser in der Leitung ist.", "circ.ret_max", W.circ.ret_max, 30, 60, 1, "°C", adm)}`}</div>`;
    const lg = W.leg;
    const legC = !hasGen ? `<div class="card"><h2>${ic("shield", 18)}Legionellenschutz</h2>
      <div class="wwempty big">${ic("shield", 30)}<div><b>Kein Wärmeerzeuger gewählt</b><span>Der Legionellenschutz heizt den Speicher regelmäßig auf die Schutztemperatur und hält sie. Dafür braucht er einen Wärmeerzeuger oder Heizstab.</span></div>${adm ? `<button class="btn2 pri" data-act="mdsetup" style="flex:none;padding:10px 18px">Erzeuger wählen</button>` : ""}</div></div>` : `<div class="card"><h2>${ic("shield", 18)}Legionellenschutz<button class="sw ${lg.on ? "on" : ""}" style="margin-left:auto" data-act="wwleg" aria-pressed="${lg.on}" aria-label="Legionellenschutz"></button></h2>
      ${lg.on ? `<div class="mut sm" style="margin:0 0 6px">Der Speicher wird regelmäßig auf Schutztemperatur gebracht und gehalten.</div>
        <div class="dchips">${DAYS.map((d, i) => `<button class="dc ${lg.day === i ? "sel" : ""}" data-act="wwlegday" data-k="${i}">${d}</button>`).join("")}</div>
        ${this._wwNumT("Uhrzeit", "Am besten nachts, wenn niemand duscht.", "leg.time", lg.time, adm)}${this._wwNum("Schutztemperatur", "", "leg.temp", lg.temp, 55, 65, 1, "°C", adm)}${this._wwNum("Halten für", "", "leg.hold", lg.hold, 10, 60, 5, "Min.", adm)}
        <div class="dgs ${!lg.last ? "" : lg.last.ok ? (legD > 9 ? "warn" : "ok") : "warn"}">${ic(!lg.last ? "info" : lg.last.ok ? "check" : "alert", 22)}<div><b>${lg.last ? `Letzte Aufheizung: ${new Date(lg.last.ts).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "numeric" })}, ${new Date(lg.last.ts).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr` : "Noch keine Aufheizung aufgezeichnet"}</b><span>${lg.last ? `${num(lg.last.max, 1)} °C erreicht, ${lg.last.held} Min. gehalten` : "Der erste Lauf folgt zum eingestellten Zeitpunkt."}</span></div><span></span></div>`
      : `<div class="gst on">${ic("alert", 15)}Aus. In Speichern über 400 Liter oder mit Zirkulation wird ein regelmäßiges Aufheizen empfohlen.</div>`}</div>`;
    const pv = W.pv;
    const pvC = !E.rod ? `<div class="card"><h2>${ic("bolt", 18)}PV-Überschuss nutzen</h2>
      <div class="wwempty big">${ic("bolt", 30)}<div><b>Kein Heizstab gewählt</b><span>Bei Überschuss aus der PV-Anlage kann ein Heizstab den Speicher über das Soll hinaus laden. Wähle dafür den Schalter des Heizstabs.</span></div>${adm ? `<button class="btn2 pri" data-act="mdsetup" style="flex:none;padding:10px 18px">Heizstab wählen</button>` : ""}</div></div>` : `<div class="card"><h2>${ic("bolt", 18)}PV-Überschuss nutzen<button class="sw ${pv.on ? "on" : ""}" style="margin-left:auto" data-act="wwpv" aria-pressed="${pv.on}" aria-label="PV-Überschuss"></button></h2>
      ${pv.on ? `<div class="mut sm" style="margin:0 0 6px">Der Speicher wird bei Überschuss über das Soll hinaus geladen. Sensor, Batterie-Grenze und Vorzeichen kommen aus Modul 1 → Allgemein. Der Heizstab hat Vorrang vor den Raumheizern.</div>
        ${this._wwNum("Ab Überschuss", "", "pv.min", pv.min, 300, 6000, 100, "W", adm)}${this._wwNum("Speicher bis maximal", "", "pv.max", pv.max, 50, 65, 1, "°C", adm)}${this._wwNum("Leistung Heizstab", "Damit erkennt das Modul, wann der Überschuss reicht.", "pv.watt", pv.watt, 300, 9000, 100, "W", adm)}
        <div class="gst ${E.rod ? "" : "on"}">${ic(E.rod ? "bolt" : "info", 15)}${E.rod ? (pvNow == null ? "Kein PV-Sensor gewählt." : pvNow >= pv.min ? `Aktuell ${wfmt(pvNow)} Überschuss – der Heizstab darf laufen.` : `Aktuell ${wfmt(pvNow)} Überschuss – zu wenig, Heizstab bleibt aus.`) : "Für PV-Heizung fehlt noch der Heizstab-Schalter in den Einstellungen."}</div>` : `<div class="mut sm">Aus.</div>`}</div>`;
    const dg = `<div class="card wwc"><h2>${ic("tools", 18)}Zustand</h2>${probs.map(([lv, ico, ti, tx]) => `<div class="dgs ${lv === "mut" ? "" : lv}">${ic(ico, 22)}<div><b>${esc(ti)}</b><span>${esc(tx)}</span></div><span></span></div>`).join("")}<div class="mut sm" style="margin:0">Hinweise erscheinen auch in der Gerätediagnose und als Meldung.</div></div>`;
    const o = (n, h) => h.replace('<div class="card', `<div style="order:${n}" class="card`);
    return `${hero}<div class="wwrow"><div class="card wwtkc"><h2>${ic("drop", 18)}Speicher</h2>${this._wwTank(t)}</div>${tiles}</div>${chart}<div class="enc"><div class="enco">${o(1, heatC)}${o(3, legC)}</div><div class="enco">${o(2, circC)}${o(4, pvC)}</div></div>${dg}<div class="note">Das Modul schaltet nur die gewählten Geräte. Bei Überschuss hat der Warmwasser-Heizstab Vorrang vor den Raumheizern.</div>`;
  }
  _wwNum(label, hint, path, val, lo, hi, step, unit, adm) {
    return `<div class="of"><div class="ol"><b>${label}</b>${hint ? `<span>${hint}</span>` : ""}</div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="wwnum" data-k="${path}" data-min="${lo}" data-max="${hi}" data-step="${step}" value="${val}" min="${lo}" max="${hi}" step="${step}" ${adm ? "" : "disabled"}><i>${unit}</i></span></div></div>`;
  }
  _wwNumT(label, hint, path, val, adm) {
    return `<div class="of"><div class="ol"><b>${label}</b>${hint ? `<span>${hint}</span>` : ""}</div><div class="oc"><span class="onum"><input type="time" data-f="wwnum" data-k="${path}" data-t="1" value="${val}" ${adm ? "" : "disabled"}></span></div></div>`;
  }
  _wwSet(path, v) { const W = this._mdState().ww, p = path.split("."); let o = W; for (let i = 0; i < p.length - 1; i++) o = o[p[i]]; o[p[p.length - 1]] = v; this._mdSave(); }
  _wwChange(t) {
    const f = t.dataset.f, W = this._mdState().ww;
    if (f === "wwnum") {
      let v = t.value;
      if (!t.dataset.t) { v = Number(String(v).replace(",", ".")); const lo = +t.dataset.min, hi = +t.dataset.max, st = +t.dataset.step || 1; v = isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v / st) * st)) : lo; }
      else if (!/^\d\d:\d\d$/.test(v)) v = "03:00";
      this._wwSet(t.dataset.k, v); this._render(); return true;
    }
    if (f === "wwent") { W.ent[t.dataset.k] = t.value; this._mdSave(); this._wwH = null; return true; }
    if (f === "wwsz") { const v = Number(String(t.value).replace(",", ".")); W[t.dataset.k] = isFinite(v) ? Math.min(+t.dataset.max, Math.max(+t.dataset.min, Math.round(v))) : W[t.dataset.k]; this._mdSave(); return true; }
    if (f === "wwsch") {
      const m = this._modal, list = W[m.kind][this._wwDay()], x = list[+t.dataset.i], k = t.dataset.k;
      if (k === "temp") { const v = Number(String(t.value).replace(",", ".")); x.temp = isFinite(v) ? Math.min(70, Math.max(30, Math.round(v))) : x.temp; }
      else { x[k] = /^\d\d:\d\d$/.test(t.value) ? t.value : x[k]; if (wwTm(x.to) <= wwTm(x.from)) { if (k === "from") x.to = wwFmt(Math.min(1439, wwTm(x.from) + 30)); else x.from = wwFmt(Math.max(0, wwTm(x.to) - 30)); } }
      this._mdSave(); this._renderModal(); return true;
    }
    return false;
  }
  _wwAct(a, b) {
    const W = this._mdState().ww, k = b.dataset.k, m = this._modal;
    if (a === "wwmode") { W.circ.mode = k; this._mdSave(); this._render(); }
    else if (a === "wwday") { W.day = k; this._mdSave(); this._render(); }
    else if (a === "wwboost" || a === "wwcirc5" || a === "wwaway") {
      const key = { wwboost: "boost", wwcirc5: "circ5", wwaway: "away" }[a], val = !W[key];
      this._hass.callWS({ type: "fenster_heizung/wasser_cmd", cmd: key, value: val }).then((r) => {
        this._mdT = null; this._mdApply(r); this._render();
        this._toast({ boost: val ? `Speicher wird einmal auf ${W.leg.temp} °C aufgeheizt` : "Aufheizen gestoppt", circ5: val ? "Pumpe läuft 5 Minuten" : "Pumpe gestoppt", away: val ? "Abwesend: Sparmodus an" : "Abwesend: aus" }[key]);
      }).catch(() => this._toast("Befehl konnte nicht gesendet werden"));
    }
    else if (a === "wwleg") { W.leg.on = !W.leg.on; this._mdSave(); this._render(); }
    else if (a === "wwlegday") { W.leg.day = +k; this._mdSave(); this._render(); }
    else if (a === "wwpv") { W.pv.on = !W.pv.on; this._mdSave(); this._render(); }
    else if (a === "wwreload") { this._wwH = null; this._wwLoad(true); this._mdPoll(); }
    else if (a === "wwsch") { this._modal = { type: "wwsch", kind: k }; this._renderModal(); }
    else if (a === "wwschadd") { const list = W[m.kind][this._wwDay()]; const last = list.length ? wwTm(list[list.length - 1].to) : 360; const from = Math.min(1380, last + 60); list.push({ from: wwFmt(from), to: wwFmt(Math.min(1439, from + 60)), temp: W.target }); this._mdSave(); this._renderModal(); }
    else if (a === "wwschdel") { W[m.kind][this._wwDay()].splice(+b.dataset.i, 1); this._mdSave(); this._renderModal(); }
    else if (a === "wwschcopy") { const from = this._wwDay(), to = from === "wd" ? "we" : "wd"; W[m.kind][to] = JSON.parse(JSON.stringify(W[m.kind][from])); this._mdSave(); this._toast(`Zeiten auf ${to === "wd" ? "Montag–Freitag" : "das Wochenende"} kopiert`); }
    else if (a === "wwschday") { W.day = k; this._mdSave(); this._renderModal(); }
    else if (a === "wwschdone" || a === "wwsetdone") { if (a === "wwschdone") { ["wd", "we"].forEach((d) => W[m.kind][d].sort((x, y) => wwTm(x.from) - wwTm(y.from))); } this._mdSave(); this._modal = null; this._renderModal(); this._render(); if (a === "wwsetdone") this._wwLoad(true); }
  }
  _wwSchModal() {
    const m = this._modal, W = this._mdState().ww, key = this._wwDay(), list = W[m.kind][key], heat = m.kind === "heat";
    return `<div class="ov" data-act="wwschdone"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>${heat ? "Warmwasser-Zeitplan" : "Zirkulationszeiten"}</b><span>${heat ? "Wann der Speicher auf Soll gehalten wird" : "Wann die Pumpe laufen darf"}</span></div><button class="ibtn" data-act="wwschdone" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="seg wwseg" role="group">${[["wd", "Montag–Freitag"], ["we", "Wochenende"]].map(([k, l]) => `<button class="${key === k ? "sel" : ""}" data-act="wwschday" data-k="${k}">${l}</button>`).join("")}</div>
      ${this._wwBar(list, m.kind)}
      ${list.length ? list.map((x, i) => `<div class="wsr"><input type="time" data-f="wwsch" data-i="${i}" data-k="from" value="${x.from}" aria-label="Von"><span>bis</span><input type="time" data-f="wwsch" data-i="${i}" data-k="to" value="${x.to}" aria-label="Bis">${heat ? `<span class="onum"><input type="number" inputmode="numeric" data-f="wwsch" data-i="${i}" data-k="temp" value="${x.temp}" min="30" max="70" aria-label="Temperatur"><i>°C</i></span>` : ""}<button class="ibtn" data-act="wwschdel" data-i="${i}" aria-label="Zeitfenster löschen">${ic("trash", 17)}</button></div>`).join("") : `<div class="mut sm" style="padding:10px 0">Noch keine Zeitfenster.</div>`}
      <div class="gbtns"><button class="btn2" data-act="wwschadd">${ic("plus", 16)} Zeitfenster</button><button class="btn2" data-act="wwschcopy">${ic("copy", 16)} Auf ${key === "wd" ? "Wochenende" : "Mo–Fr"} kopieren</button></div>
      ${heat ? `<div class="mut sm" style="margin:6px 0 0">Absenktemperatur außerhalb der Zeiten und Soll werden unter „Einstellungen“ festgelegt.</div>` : ""}
      <div class="foot2"><button class="btn2 pri" data-act="wwschdone">Fertig</button></div></div>`;
  }
  _wwSetModal() {
    const W = this._mdState().ww, E = W.ent, st = this._hass.states, ks = Object.keys(st);
    const temp = ks.filter((e) => e.startsWith("sensor.") && (st[e].attributes.device_class === "temperature" || /°C/.test(st[e].attributes.unit_of_measurement || "")));
    const gen = ks.filter((e) => /^(water_heater|switch|climate|input_boolean)\./.test(e)), sw = ks.filter((e) => /^(switch|input_boolean)\./.test(e)), trg = ks.filter((e) => /^(binary_sensor|button|input_button|event)\./.test(e));
    const sel = (k, opts) => this._wzSel(opts, E[k], "wwent", `data-k="${k}"`);
    const sz = (label, k, lo, hi, unit) => `<div class="of"><div class="ol"><b>${label}</b></div><div class="oc"><span class="onum"><input type="number" inputmode="numeric" data-f="wwsz" data-k="${k}" data-min="${lo}" data-max="${hi}" value="${W[k]}"><i>${unit}</i></span></div></div>`;
    const tz = (label, hint, path, val, lo, hi) => this._wwNum(label, hint, path, val, lo, hi, 1, "°C", true);
    return `<div class="ov" data-act="wwsetdone"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Warmwasser & Zirkulation</b><span>Einstellungen</span></div><button class="ibtn" data-act="wwsetdone" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("thermo", 15)}Speicher</div>
      ${sz("Inhalt", "size", 50, 1000, "Liter")}${tz("Soll-Temperatur", "Gilt in den Zeiten des Zeitplans.", "target", W.target, 40, 65)}${tz("Absenktemperatur", "Außerhalb der Zeiten und bei Abwesenheit.", "heat.low", W.heat.low, 30, 55)}
      <div class="mut sm" style="margin:8px 0 0">Temperatur oben</div>${sel("top", temp)}
      <div class="mut sm" style="margin:0">Temperatur Mitte (optional)</div>${sel("mid", temp)}
      <div class="mut sm" style="margin:0">Temperatur unten (optional)</div>${sel("bot", temp)}
      <div class="lsec">${ic("flame", 15)}Wärmeerzeuger</div>
      <div class="mut sm" style="margin:2px 0 0">Schalter oder Warmwasser-Gerät, das den Speicher heizt</div>${sel("src", gen)}
      <div class="mut sm" style="margin:0">Heizstab für PV-Überschuss (optional)</div>${sel("rod", sw)}
      <div class="lsec">${ic("drop", 15)}Zirkulation</div>
      <div class="mut sm" style="margin:2px 0 0">Zirkulationspumpe (Schalter)</div>${sel("pump", sw)}
      <div class="mut sm" style="margin:0">Rücklauf-Temperatur (optional)</div>${sel("ret", temp)}
      <div class="mut sm" style="margin:0">Auslöser für „Bei Bedarf“ (optional)</div>${sel("trig", trg)}
      <div class="gst">${ic("info", 15)}Das Modul schaltet nur die hier gewählten Geräte. Sensoren und Schalter bleiben in Home Assistant unverändert.</div>
      <div class="foot2"><button class="btn2 pri" data-act="wwsetdone">Fertig</button></div></div>`;
  }

  /* ================= Modul 3: Energie-Übersicht ================= */
  _enState() {
    if (!this._ens) {
      let s = {}; try { s = JSON.parse(localStorage.getItem("fh_energy") || "{}") || {}; } catch (_) { /* Speicher gesperrt */ }
      const d = JSON.parse(JSON.stringify(EN_DEF));
      this._ens = { ...d, range: ["day", "week", "month"].includes(s.range) ? s.range : "day", ent: { ...d.ent, ...(s.ent || {}) }, sign: s.sign || "", bsign: s.bsign || "charge", bmode: s.bmode === "two" ? "two" : "one", pvn: "", pv2n: "" };
    }
    return this._ens;
  }
  _enSave(cfg) { try { localStorage.setItem("fh_energy", JSON.stringify({ range: this._ens.range })); } catch (_) { /* Speicher gesperrt */ } if (cfg && this._admin()) this._mdSave(); }
  _enOn() { return this._enState().on !== false; }
  _enGrid() { const E = this._enState(), p = this._pv(); return { ent: E.ent.grid || p.sensor || "", sign: E.sign || p.sign || "export" }; }
  _enConfigured() { return !!(this._enState().ent.pv && this._enGrid().ent); }
  _enW(eid) {
    const st = eid && this._hass.states[eid]; if (!st) return null;
    let v = parseFloat(String(st.state).replace(",", ".")); if (!isFinite(v)) return null;
    if ((st.attributes || {}).unit_of_measurement === "kW") v *= 1000;
    return v;
  }
  /* Solar-Leistung: Wechselrichter melden nachts oft „nicht verfügbar“ (= 0 W); negative Kleinstwerte werden auf 0 gesetzt */
  _enPv1(id) {
    const st = id && this._hass.states[id]; if (!st) return null;
    if (["unavailable", "unknown", ""].includes(String(st.state))) return 0;
    const v = this._enW(id); return v == null ? 0 : Math.max(0, v);
  }
  /* zweite Solaranlage (zum Beispiel Balkonkraftwerk) wird addiert; fehlt sie, zählt nur die erste */
  _enPvW() { const p = this._enPvParts(); return p ? p.a + p.b : null; }
  _enPvParts() {
    const E = this._enState(), a = this._enPv1(E.ent.pv); if (a == null) return null;
    const b = E.ent.pv2 ? this._enPv1(E.ent.pv2) : null; return { a, b: b == null ? 0 : b, has2: !!E.ent.pv2 && b != null };
  }
  /* Eine Anlage liefert seit 10 Minuten nichts, obwohl die andere Strom erzeugt: Name(n) der ausgefallenen Anlage */
  _enOut(n) {
    const z = this._enZero = this._enZero || {}, lim = this._enOutMs ?? 6e5, nm = this._enPvNames(), out = [];
    [["a", n.pva, n.pvb, 0], ["b", n.pvb, n.pva, 1]].forEach(([k, me, other, i]) => {
      if (n.pvb == null || me == null || other == null || !(other >= 400 && me < 5)) { delete z[k]; return; }
      z[k] = z[k] || Date.now(); if (Date.now() - z[k] >= lim) out.push(nm[i]);
    });
    return out;
  }
  _enPvNames() { const E = this._enState(); return [E.pvn || "Solar", E.pv2n || "Balkon"]; }
  _enNow() {
    const E = this._enState(), g = this._enGrid(), pv = this._enPvW(), gr = this._enW(g.ent), b = this._enBatW();
    if (pv == null || gr == null) return null;
    const exp = g.sign === "import" ? -gr : gr, bc = b == null ? 0 : b;
    const house = E.ent.house && this._enW(E.ent.house) != null ? this._enW(E.ent.house) : Math.max(0, pv - exp - bc);
    const e = Math.max(0, exp), imp = Math.max(0, -exp), c = Math.max(0, bc), dis = Math.max(0, -bc);
    const pp = this._enPvParts(); return { pv, pva: pp ? pp.a : pv, pvb: pp && pp.has2 ? pp.b : null, exp: e, imp, house, bc: c, dis, pv2h: Math.min(house, Math.max(0, pv - e - c)), pv2b: c, b2h: dis, g2h: imp, soc: this._soc(), hasBat: b != null };
  }
  /* Batterie-Leistung, Laden positiv: ein Sensor mit Vorzeichen oder zwei Sensoren (Laden / Entladen) */
  _enBatIds() { const E = this._enState(); return E.bmode === "two" ? [E.ent.bchg, E.ent.bdis].filter(Boolean) : [E.ent.bat].filter(Boolean); }
  _enBatW() {
    const E = this._enState();
    if (E.bmode === "two") { const c = E.ent.bchg ? this._enW(E.ent.bchg) : null, d = E.ent.bdis ? this._enW(E.ent.bdis) : null; return c == null && d == null ? null : Math.max(0, c || 0) - Math.max(0, d || 0); }
    const b = this._enW(E.ent.bat); return b == null ? null : E.bsign === "discharge" ? -b : b;
  }
  _enBatAt(sb, at, m) {
    const E = this._enState(); if (E.bmode === "two") { const v = sb.map((l) => at(l, m)); if (v.every((x) => x == null)) return null; const c = E.ent.bchg ? v[0] : 0, d = E.ent.bdis ? v[E.ent.bchg ? 1 : 0] : 0; return Math.max(0, c || 0) - Math.max(0, d || 0); }
    const b = at(sb[0], m); return b == null ? null : E.bsign === "discharge" ? -b : b;
  }
  /* ---- Verlauf laden ---- */
  _enLoad(force) {
    const E = this._enState(), g = this._enGrid();
    if (!this._hass || !this._enConfigured()) return;
    const key = E.range;
    if (!force && this._enH && this._enH.range === key && Date.now() - this._enH.ts < 3e5) return;
    if (this._enBusy) return; this._enBusy = true;
    const end = new Date(), n = key === "week" ? 7 : key === "month" ? 30 : 1, start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - (n - 1));
    const done = (res, err) => ({ range: key, ts: Date.now(), start: +start, end: +end, res: res || {}, err: !!err });
    let p;
    if (key === "day") {
      const ids = [E.ent.pv, E.ent.pv2, g.ent, E.ent.house, ...this._enBatIds()].filter(Boolean);
      p = this._hass.callWS({ type: "history/history_during_period", start_time: start.toISOString(), end_time: end.toISOString(), entity_ids: ids, include_start_time_state: true, significant_changes_only: false, minimal_response: false, no_attributes: false });
    } else {
      const src = this._enSrc(), all = Object.values(src).filter(Boolean), q = (t, per, ty) => { const ids = [...new Set(all.filter((x) => x.t === t).map((x) => x.id))]; return ids.length ? this._hass.callWS({ type: "recorder/statistics_during_period", start_time: start.toISOString(), end_time: end.toISOString(), statistic_ids: ids, period: per, types: [ty] }) : Promise.resolve({}); };
      p = Promise.all([q("e", "day", "change"), q("p", "hour", "mean")]).then(([e, w]) => ({ e, w }));
    }
    p.then((r) => { this._enH = done(r); }).catch(() => { this._enH = done({}, true); })
      .finally(() => { this._enBusy = false; if (this._mdActive() === "en" && !this._dragging) this._render(); });
  }
  _enSer(eid, zero) {
    const H = this._enH; if (!H || !eid) return [];
    let k = 1; const raw = (H.res || {})[eid] || [];
    for (const x of raw) { if (x.a && x.a.unit_of_measurement) { if (x.a.unit_of_measurement === "kW") k = 1000; break; } }
    return raw.map((x) => ({ t: ((x.lu ?? x.lc ?? H.start / 1000) * 1000 - H.start) / 6e4, v: isFinite(parseFloat(x.s)) ? parseFloat(String(x.s).replace(",", ".")) * k : zero ? 0 : NaN })).filter((x) => isFinite(x.v));
  }
  _enSamples() {
    const H = this._enH, E = this._enState(), g = this._enGrid(); if (!H || H.range !== "day") return null;
    const sp = this._enSer(E.ent.pv, true), sp2 = E.ent.pv2 ? this._enSer(E.ent.pv2, true) : null, sg = this._enSer(g.ent), sh = E.ent.house ? this._enSer(E.ent.house) : null, sb = this._enBatIds().length ? this._enBatIds().map((x) => this._enSer(x)) : null;
    const at = (l, m) => { let v = null; for (const x of l) { if (x.t <= m) v = x.v; else break; } return v; };
    const total = Math.floor((H.end - H.start) / 6e4), out = [];
    for (let m = 0; m <= total; m += 5) {
      const pv = Math.max(0, at(sp, m) ?? 0) + (sp2 ? Math.max(0, at(sp2, m) ?? 0) : 0), gr = at(sg, m); if (gr == null && !sp.length) continue;
      const exp = gr == null ? 0 : g.sign === "import" ? -gr : gr, bb = sb ? this._enBatAt(sb, at, m) : null, bc = bb == null ? 0 : bb;
      const house = sh && at(sh, m) != null ? at(sh, m) : Math.max(0, pv - exp - bc);
      out.push({ t: m, pv: Math.max(0, pv), pvb: sp2 ? Math.max(0, at(sp2, m) ?? 0) : 0, exp: Math.max(0, exp), imp: Math.max(0, -exp), house });
    }
    return out;
  }
  _enSum() {
    const E = this._enState(), H = this._enH; if (!H || H.range !== E.range) return null;
    if (E.range === "day") {
      const s = this._enSamples(); if (!s || !s.length) return { empty: true };
      const k = (f) => s.reduce((a, x) => a + x[f], 0) * 5 / 60 / 1000;
      return { pv: k("pv"), pvb: k("pvb"), exp: k("exp"), imp: k("imp"), house: k("house") };
    }
    const days = this._enDays(); if (!days.some((d) => d.pv || d.imp || d.exp)) return { empty: true, nocnt: !Object.values(this._enSrc()).some(Boolean) };
    const pv = days.reduce((a, d) => a + d.pv, 0), imp = days.reduce((a, d) => a + d.imp, 0), exp = days.reduce((a, d) => a + d.exp, 0);
    return { pv, pvb: days.reduce((a, d) => a + (d.pvb || 0), 0), exp, imp, house: Math.max(0, pv - exp + imp) };
  }
  /* Quelle je Größe: Energiezähler (Wh/kWh/MWh) oder Leistungssensor (W/kW/MW). Leer = aus den Leistungssensoren oben. */
  _enKind(eid) {
    const u = (((this._hass.states[eid] || {}).attributes || {}).unit_of_measurement || "").trim();
    if (u in EN_UNIT_E) return { t: "e", k: EN_UNIT_E[u] };
    if (u in EN_UNIT_P) return { t: "p", k: EN_UNIT_P[u] };
    return null;
  }
  _enSrc() {
    const E = this._enState(), g = this._enGrid(), out = {}, mk = (id, part) => { const k = id && this._enKind(id); return k ? { id, ...k, part } : null; };
    out.pv = mk(E.ent.pve || E.ent.pv, "pv");
    if (E.ent.pv2) { out.pv2 = mk(E.ent.pve2 || E.ent.pv2, "pv"); if (out.pv2) out.pv2.f = "pv"; }
    out.imp = E.ent.imp ? mk(E.ent.imp, "imp") : mk(g.ent, "imp");
    out.exp = E.ent.exp ? mk(E.ent.exp, "exp") : mk(g.ent, "exp");
    if (out.imp && !E.ent.imp) out.imp.sg = g.sign;
    if (out.exp && !E.ent.exp) out.exp.sg = g.sign;
    return out;
  }
  _enNote() {
    const src = this._enSrc(), miss = !Object.values(src).some(Boolean), der = Object.values(src).some((x) => x && x.t === "p");
    if (miss) return `<div class="gst on">${ic("info", 15)}Für 7 und 30 Tage fehlt ein Sensor. Wähle in den Einstellungen Energiezähler (Wh, kWh) oder lass sie leer, dann wird aus den Leistungssensoren gerechnet.</div>`;
    if (this._enH && this._enH.err) return `<div class="gst on">${ic("alert", 15)}Der Verlauf konnte nicht geladen werden. Ist der Recorder in Home Assistant aktiv?</div>`;
    const sm = this._enSum(); if (sm && sm.empty) return `<div class="gst on">${ic("info", 15)}Für die gewählten Sensoren gibt es keine Langzeitstatistik. Zähler brauchen <code>state_class: total_increasing</code>, Leistungssensoren <code>state_class: measurement</code>.</div>`;
    return der ? `<div class="gst">${ic("info", 15)}Teilweise aus Leistungs-Mittelwerten (Stundenwerte) berechnet. Mit Energiezählern (Wh, kWh) wird es genauer.</div>` : "";
  }
  _enDays() {
    const H = this._enH, n = H.range === "week" ? 7 : 30, out = [], src = this._enSrc(), R = H.res || {};
    const d0 = new Date(H.start), di = (ts) => { const d = new Date(ts); return Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - d0) / 864e5); };
    for (let i = 0; i < n; i++) out.push({ d: new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + i, 12), pv: 0, pvb: 0, imp: 0, exp: 0 });
    out.derived = false;
    Object.entries(src).forEach(([f0, s]) => {
      if (!s) return; const f = s.f || f0;
      if (s.t === "e") (R.e && R.e[s.id] || []).forEach((x) => { const i = di(x.start); if (out[i] && isFinite(x.change)) { const v = Math.max(0, x.change * s.k); out[i][f] += v; if (f0 === "pv2") out[i].pvb += v; } });
      else {
        out.derived = true;
        (R.w && R.w[s.id] || []).forEach((x) => {
          const i = di(x.start); if (!out[i] || !isFinite(x.mean)) return;
          let w = x.mean * s.k; if (s.sg) w = s.part === "exp" ? (s.sg === "import" ? -w : w) : (s.sg === "import" ? w : -w);
          out[i][f] += Math.max(0, w) / 1000; if (f0 === "pv2") out[i].pvb += Math.max(0, w) / 1000;
        });
      }
    });
    return out;
  }
  /* ---- Darstellung ---- */
  _enFlow(n) {
    const E = this._enState(), kw = (w) => (w >= 1000 ? num(w / 1000, 2) + " kW" : Math.round(w) + " W");
    const ln = (d, w, col, lab, lx, ly) => `<path class="fl ${w >= 20 ? "on" : ""}" d="${d}" stroke="${col}" style="stroke-width:${(2 + Math.min(6, w / 700)).toFixed(1)}px"/>${w >= 20 ? `<text x="${lx}" y="${ly}" class="fll" fill="${col}">${lab || kw(w)}</text>` : ""}`;
    const node = (x, y, ico, col, t1, t2, side) => `<circle cx="${x}" cy="${y}" r="29" fill="color-mix(in srgb,${col} 16%,var(--card))" stroke="${col}" stroke-width="2.2"/>${ic(ico, 26).replace("<svg ", `<svg x="${x - 13}" y="${y - 13}" style="color:${col}" `)}${side ? `<text x="${x + 40}" y="${y - 2}" class="fln" style="text-anchor:start">${t1}</text><text x="${x + 40}" y="${y + 13}" class="fls" style="text-anchor:start">${t2}</text>` : `<text x="${x}" y="${y + 47}" class="fln">${t1}</text><text x="${x}" y="${y + 61}" class="fls">${t2}</text>`}`;
    const heat = this._htrTotal(), ww = this._wwIsOn(this._mdState().ww.ent.rod) ? this._mdState().ww.pv.watt : 0;
    const col = { pv: "#fbbf24", grid: "#60a5fa", exp: "#34d399", bat: "#a78bfa", house: "#2dd4bf" };
    return `<svg class="enflow" viewBox="0 0 400 312" role="img" aria-label="Energiefluss">
      ${ln("M200 70V120", n.pv2h, col.pv, "", 226, 112)}${ln("M226 62C310 72 340 92 340 118", n.pv2b, col.pv, "", 322, 86)}${ln("M174 62C90 72 60 92 60 118", n.exp, col.exp, "", 78, 86)}
      ${ln("M90 150H170", n.g2h, col.grid, "", 130, 142)}${ln("M310 150H230", n.b2h, col.bat, "", 270, 142)}
      ${ln("M192 216L150 262", Math.min(heat, n.house), col.house, "", 128, 240)}${ln("M208 216L250 262", Math.min(ww, n.house), col.house, "", 272, 240)}
      ${node(200, 38, "sun", col.pv, "Solar", kw(n.pv), true)}
      ${node(60, 150, "bolt", n.exp > 20 ? col.exp : col.grid, n.exp > 20 ? "Einspeisung" : "Netz", n.exp > 20 ? kw(n.exp) : n.imp > 20 ? "Bezug " + kw(n.imp) : "0 W")}
      ${node(200, 150, "home", col.house, "Haus", kw(n.house))}
      ${n.hasBat ? node(340, 150, "energy", col.bat, n.soc != null ? Math.round(n.soc) + " %" : "Batterie", n.bc > 20 ? "lädt " + kw(n.bc) : n.dis > 20 ? "entlädt " + kw(n.dis) : "ruht") : ""}
      <g transform="translate(150,282)"><rect x="-44" y="-18" width="88" height="34" rx="12" fill="var(--card)" stroke="var(--line)"/><text x="0" y="-3" class="fln">Heizung</text><text x="0" y="11" class="fls">${kw(heat)}</text></g>
      <g transform="translate(250,282)"><rect x="-44" y="-18" width="88" height="34" rx="12" fill="var(--card)" stroke="var(--line)"/><text x="0" y="-3" class="fln">Warmwasser</text><text x="0" y="11" class="fls">${ww ? kw(ww) : "0 W"}</text></g></svg>`;
  }
  _enChart() {
    const E = this._enState(), H = this._enH;
    if (!H || H.range !== E.range) return `<div class="mut sm" style="padding:30px 0;text-align:center">Verlauf wird geladen …</div>`;
    const Wd = 640, Ht = 214, L = 40, R = 8, T = 24, B = 28, iw = Wd - L - R, ih = Ht - T - B;
    if (E.range === "day") {
      const s = this._enSamples(); if (!s || !s.length) return `<div class="mut sm" style="padding:30px 0;text-align:center">Keine Verlaufsdaten für heute.</div>`;
      const mx = Math.max(500, ...s.map((x) => Math.max(x.pv, x.house, x.imp))), sk = Math.max(1, enStep(mx / 1000)) * 1000, top = Math.ceil(mx / sk) * sk, X = (m) => L + (m / 1440) * iw, Y = (w) => T + ih - (w / top) * ih;
      const area = (f, c) => `<path d="M${X(s[0].t)} ${Y(0)}${s.map((x) => `L${X(x.t).toFixed(1)} ${Y(x[f]).toFixed(1)}`).join("")}L${X(s[s.length - 1].t)} ${Y(0)}Z" fill="${c}" opacity=".28"/>`;
      const line = (f, c, w = 2) => `<path d="${s.map((x, i) => `${i ? "L" : "M"}${X(x.t).toFixed(1)} ${Y(x[f]).toFixed(1)}`).join("")}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round"/>`;
      let g = ""; for (let w = 0, c = 0; w <= top && c < 12; w += sk, c++) g += `<line x1="${L}" x2="${Wd - R}" y1="${Y(w)}" y2="${Y(w)}" stroke="currentColor" opacity=".13"/><text x="${L - 6}" y="${Y(w) + 4}" text-anchor="end" font-size="11" fill="currentColor" opacity=".6">${w / 1000}</text>`;
      for (const h of [0, 6, 12, 18, 24]) g += `<text x="${X(h * 60)}" y="${Ht - 8}" text-anchor="${h === 0 ? "start" : h === 24 ? "end" : "middle"}" font-size="11" fill="currentColor" opacity=".6">${String(h).padStart(2, "0")}:00</text>`;
      return `<svg class="wwchart" viewBox="0 0 ${Wd} ${Ht}" role="img" aria-label="Leistung heute"><text x="${L - 6}" y="${T - 10}" text-anchor="end" font-size="10" fill="currentColor" opacity=".6">kW</text>${g}${area("pv", "#fbbf24")}${area("imp", "#f87171")}${line("pv", "#fbbf24")}${E.ent.pv2 && s.some((x) => x.pvb > 0) ? line("pvb", "#fb923c", 1.5) : ""}${line("house", "#38bdf8")}</svg>
        <div class="legend"><span><i style="background:#fbbf24"></i>${E.ent.pv2 ? "Solar gesamt" : "Solar"}</span>${E.ent.pv2 && s.some((x) => x.pvb > 0) ? `<span><i style="background:#fb923c"></i>${esc(this._enPvNames()[1])}</span>` : ""}<span><i style="background:#38bdf8"></i>Verbrauch</span><span><i style="background:#f87171"></i>Netzbezug</span></div>`;
    }
    const days = this._enDays(), mx = Math.max(1, ...days.flatMap((d) => [d.pv, d.imp, d.exp])), stp = enStep(mx), top = Math.ceil(mx / stp) * stp, gw = iw / days.length, bw = Math.max(2, Math.min(9, gw / 3.6)), Y = (v) => T + ih - (v / top) * ih;
    let s = ""; for (let v = 0, c = 0; v <= top && c < 12; v += stp, c++) s += `<line x1="${L}" x2="${Wd - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="currentColor" opacity=".13"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="currentColor" opacity=".6">${num(v, v % 1 ? 1 : 0)}</text>`;
    days.forEach((d, i) => {
      const x0 = L + i * gw + gw / 2 - bw * 1.5;
      [[d.pv, "#fbbf24"], [d.imp, "#f87171"], [d.exp, "#34d399"]].forEach(([v, c], k) => { s += `<rect x="${(x0 + k * (bw + 1)).toFixed(1)}" y="${Y(v).toFixed(1)}" width="${bw}" height="${Math.max(0, Y(0) - Y(v)).toFixed(1)}" rx="1.5" fill="${c}"/>`; });
      if (days.length <= 7 || i % 5 === 0 || i === days.length - 1) s += `<text x="${L + i * gw + gw / 2}" y="${Ht - 8}" text-anchor="middle" font-size="11" fill="currentColor" opacity="${i === days.length - 1 ? 1 : .6}">${i === days.length - 1 ? "heute" : d.d.toLocaleDateString("de-DE", { day: "numeric", month: "numeric" })}</text>`;
    });
    return `<svg class="wwchart" viewBox="0 0 ${Wd} ${Ht}" role="img" aria-label="Energie pro Tag"><text x="${L - 6}" y="${T - 10}" text-anchor="end" font-size="10" fill="currentColor" opacity=".6">kWh</text>${s}</svg>
      <div class="legend"><span><i style="background:#fbbf24"></i>Solar</span><span><i style="background:#f87171"></i>Netzbezug</span><span><i style="background:#34d399"></i>Einspeisung</span></div>`;
  }
  _enPage() {
    const E = this._enState(), adm = this._admin();
    if (!this._enConfigured()) return `<div class="card empty wwe">${ic("energy", 40)}<div class="t1">Energie-Übersicht einrichten</div>
      <div class="sm" style="max-width:480px;margin:0 auto 14px">Wähle den Sensor für die Solar-Leistung. Der Netz-Sensor kommt aus den PV-Einstellungen in Modul 1, du kannst ihn hier ändern. Danach siehst du Fluss, Verlauf, Kosten und Heizung auf einer Seite.</div>
      <ul class="wwl"><li>${ic("sun", 16)}Energiefluss in Echtzeit</li><li>${ic("chart", 16)}Verlauf: heute, 7 und 30 Tage</li><li>${ic("flame", 16)}Heizung und Warmwasser im Verhältnis</li></ul>
      ${adm ? `<button class="btn2 pri" data-act="mdensetup" style="margin-top:16px;flex:none;padding:12px 22px">${ic("tools", 16)} Modul einrichten</button>` : "Ein Administrator kann das Modul einrichten."}</div>`;
    this._enLoad(); if (this._enState().ent.pv && this._mdState().ww.ent.rod) this._wwLoad();
    const n = this._enNow(), sum = this._enSum(), range = E.range, price = this._price(), feed = this._feed();
    if (!n) return `<div class="card empty">${ic("alert", 32)}<div style="margin:8px 0 4px;font-weight:700;color:var(--primary-text-color)">Keine Messwerte</div>Solar- oder Netz-Sensor liefern gerade keinen Wert.${adm ? `<br><button class="lnk" data-act="mdensetup" style="margin-top:10px">${ic("sliders", 15)}Einstellungen</button>` : ""}</div>`;
    const heat = this._htrTotal(), ww = this._wwIsOn(this._mdState().ww.ent.rod) ? this._mdState().ww.pv.watt : 0, rest = Math.max(0, n.house - heat - ww);
    const self = sum && !sum.empty ? Math.max(0, sum.pv - sum.exp) : null, autarky = sum && !sum.empty && sum.house > 0 ? Math.round(Math.min(100, Math.max(0, (1 - sum.imp / sum.house) * 100))) : null, evq = sum && !sum.empty && sum.pv > 0 ? Math.round(Math.min(100, (self / sum.pv) * 100)) : null;
    const covered = n.house > 0 ? Math.round(Math.min(100, (n.pv2h + n.b2h) / n.house * 100)) : 100;
    const hero = `<div class="card hero mh hr a-en enh">${this._modLogo("en")}${this._modRing(covered, "gedeckt")}<div class="lbl">${ic("home", 16)}Hausverbrauch jetzt</div><div class="big">${n.house >= 1000 ? num(n.house / 1000, 2) : Math.round(n.house)}<small>${n.house >= 1000 ? "kW" : "W"}</small></div><div class="sub">${covered} % aus Solar${n.b2h > 20 ? " und Batterie" : ""} gedeckt</div>
      <div class="chips"><span class="chip">${ic("sun", 16)}Solar ${wfmt(n.pv)}</span>${n.pvb != null && n.pvb >= 1 ? `<span class="chip">${ic("sun", 16)}davon ${esc(this._enPvNames()[1])} ${wfmt(n.pvb)}</span>` : ""}<span class="chip st ${n.exp > 20 ? "ok" : n.imp > 20 ? "warn" : ""}">${ic("bolt", 16)}${n.exp > 20 ? "Einspeisung " + wfmt(n.exp) : n.imp > 20 ? "Netzbezug " + wfmt(n.imp) : "Netz ausgeglichen"}</span>${n.hasBat ? `<span class="chip">${ic("energy", 16)}Batterie ${n.soc != null ? Math.round(n.soc) + " %" : ""}${n.bc > 20 ? " lädt" : n.dis > 20 ? " entlädt" : ""}</span>` : ""}${autarky != null && range === "day" ? `<span class="chip st ok">${ic("check", 16)}Autarkie heute ${autarky} %</span>` : ""}</div></div>`;
    const tabs = `<div class="seg wwseg enseg" role="group">${[["day", "Heute"], ["week", "7 Tage"], ["month", "30 Tage"]].map(([k, l]) => `<button class="${range === k ? "sel" : ""}" data-act="enrange" data-k="${k}" aria-pressed="${range === k}">${l}</button>`).join("")}</div>`;
    const kwh = (v) => (v == null ? "–" : num(v, v >= 100 ? 0 : v >= 10 ? 1 : 2));
    const eur = (kwhv, ct) => (kwhv == null ? null : (kwhv * ct) / 100);
    const tiles = `<div class="tiles">${[
      ["sun", "Solar", sum && !sum.empty ? kwh(sum.pv) : "–", "kWh", "#fbbf24", (sum && !sum.empty && sum.pvb > 0.005 ? `davon ${esc(this._enPvNames()[1])} ${kwh(sum.pvb)} kWh · ` : "") + (evq != null ? `${evq} % selbst genutzt` : sum && sum.nocnt ? "Sensor fehlt" : "Keine Daten")],
      ["bolt", "Netzbezug", sum && !sum.empty ? kwh(sum.imp) : "–", "kWh", "#f87171", sum && !sum.empty ? `${num(eur(sum.imp, price), 2)} € Kosten` : "Keine Daten"],
      ["upload", "Einspeisung", sum && !sum.empty ? kwh(sum.exp) : "–", "kWh", "#34d399", sum && !sum.empty ? `${num(eur(sum.exp, feed), 2)} € Vergütung` : "Keine Daten"],
      ["home", "Verbrauch", sum && !sum.empty ? kwh(sum.house) : "–", "kWh", "#2dd4bf", autarky != null ? `${autarky} % Autarkie` : "Keine Daten"],
    ].map(([ico, lab, v, u, c, sub], i) => { const pc = sum && !sum.empty ? [evq, sum.house > 0 ? sum.imp / sum.house * 100 : 0, sum.pv > 0 ? sum.exp / sum.pv * 100 : 0, autarky][i] : null; return `<div class="tile" style="--a:${c}"><div class="t"><span class="ti">${ic(ico, 16)}</span>${lab}</div><div class="v">${v}<small>${u}</small></div><div class="g">${sub}</div>${pc != null ? `<div class="tbar"><i style="width:${Math.max(2, Math.min(100, pc)).toFixed(0)}%"></i></div>` : ""}</div>`; }).join("")}</div>`;
    const flow = `<div class="card"><h2>${ic("sun", 18)}Energiefluss jetzt</h2>${this._enFlow(n)}</div>`;
    const chart = `<div class="card"><h2>${ic("chart", 18)}${range === "day" ? "Leistung heute" : range === "week" ? "Energie pro Tag · 7 Tage" : "Energie pro Tag · 30 Tage"}<button class="ibtn gear" style="margin-left:auto" data-act="enreload" aria-label="Aktualisieren">${ic("clock", 16)}</button></h2>${this._enChart()}${range === "day" ? "" : this._enNote()}</div>`;
    // Verteilung (nur heute)
    const rooms = this._htrRooms(), heatK = rooms.reduce((a, r) => a + (Number(r.htr.heute_kwh) || 0), 0), heatPv = rooms.reduce((a, r) => a + (Number(r.htr.heute_pv_kwh) || 0), 0);
    const ws = this._mdState().ww, wwK = ws.ent.rod ? (this._wwMinutesOn(ws.ent.rod) || 0) / 60 * ws.pv.watt / 1000 : 0;
    let dist = "";
    if (range === "day" && sum && !sum.empty) {
      const restK = Math.max(0, sum.house - heatK - wwK), tot = Math.max(0.01, heatK + wwK + restK), items = [["Heizung (Raumheizer)", heatK, "#f97316", "flame"], ["Warmwasser (Heizstab)", wwK, "#38bdf8", "drop"], ["Haushalt und Rest", restK, "#2dd4bf", "home"]];
      dist = `<div class="card"><h2>${ic("layers", 18)}Wohin der Strom heute geht</h2>
        <div class="pvbar endist">${items.map(([, v, c]) => `<i style="width:${(v / tot * 100).toFixed(1)}%;background:${c}"></i>`).join("")}</div>
        ${items.map(([l, v, c, ico]) => `<div class="endr"><span class="endot" style="background:${c}"></span><b>${l}</b><span>${num(v / tot * 100, 0)} %</span><span>${num(v, 1)} kWh</span><span>${num(eur(v, price), 2)} €</span></div>`).join("")}
        <div class="mut sm" style="margin:8px 0 0">Warmwasser ist aus der Laufzeit des Heizstabs geschätzt. Der Rest ist Verbrauch minus Heizung und Warmwasser.</div></div>`;
    }
    // Kosten
    let cost = "";
    if (sum && !sum.empty) {
      const buy = eur(sum.imp, price), sell = eur(sum.exp, feed), saved = eur(self, price), net = sell + saved - buy;
      cost = `<div class="card"><h2>${ic("total", 18)}Kosten und Vorteil · ${range === "day" ? "heute" : range === "week" ? "7 Tage" : "30 Tage"}</h2>
        <div class="enrows"><div><span>Strom aus dem Netz</span><b class="neg">−${num(buy, 2)} €</b></div><div><span>Einspeisevergütung</span><b class="pos">+${num(sell, 2)} €</b></div><div><span>Selbst genutzter Solarstrom <em>(Bezug gespart)</em></span><b class="pos">+${num(saved, 2)} €</b></div><div class="sum"><span>Vorteil durch Solar</span><b class="pos">${num(sell + saved, 2)} €</b></div><div class="sum"><span>Bilanz</span><b class="${net >= 0 ? "pos" : "neg"}">${net >= 0 ? "+" : "−"}${num(Math.abs(net), 2)} €</b></div></div>
        <div class="mut sm" style="margin:8px 0 0">Preise aus Modul 1 → Allgemein: ${num(price, 1)} ct/kWh Bezug, ${num(feed, 1)} ct/kWh Einspeisung.</div></div>`;
    }
    // Heizung
    const rm = this._collect(), dayK = rm.reduce((a, r) => a + (r.sc.day?.kwh || 0), 0), monK = rm.reduce((a, r) => a + (r.sc.month?.kwh || 0), 0);
    const heatC = `<div class="card"><h2>${ic("radiator", 18)}Heizung</h2><div class="enrows">
      <div><span>Wärme gespart durch Fensterregelung heute</span><b>${num(dayK, 1)} kWh</b></div><div><span>… in diesem Monat</span><b>${num(monK, 1)} kWh</b></div>
      ${rooms.length ? `<div><span>Elektroheizer heute</span><b>${num(heatK, 1)} kWh${heatK > 0 ? ` · ${Math.round(heatPv / heatK * 100)} % Solar` : ""}</b></div>` : ""}
      ${ws.ent.rod || ws.ent.pump ? `<div><span>Warmwasser</span><b>${this._wwTemps().top != null ? num(this._wwTemps().top, 1) + " °C oben" : "–"}</b></div>` : ""}</div>
      <div class="gbtns" style="margin-bottom:0"><button class="btn2" data-act="mdgo" data-k="fh">${ic("windowOpen", 16)} Modul 1</button>${this._mdList().some((m) => m.id === "ww") ? `<button class="btn2" data-act="mdgo" data-k="ww">${ic("boiler", 16)} Modul 2</button>` : ""}</div></div>`;
    // Hinweise
    const tips = [];
    const freeW = n.exp;
    if (freeW >= 500) tips.push(["sun", `${wfmt(freeW)} Solar-Überschuss gehen gerade ins Netz.`, rooms.length || ws.ent.rod ? "Heizer oder Warmwasser könnten mehr davon nutzen, wenn sie nicht ausgelastet oder aus sind." : "Ein Elektroheizer oder Heizstab würde den Überschuss selbst nutzen."]);
    if (n.imp >= 1500) tips.push(["alert", `Hoher Netzbezug: ${wfmt(n.imp)}.`, `Gerade laufen Heizung ${wfmt(heat)} und Warmwasser ${wfmt(ww)}. Der Rest (${wfmt(rest)}) ist Haushalt.`]);
    if (heatK > 0) tips.push(["flame", `${Math.round(heatPv / heatK * 100)} % der Heizer-Energie heute kam aus Solar.`, ""]);
    if (n.hasBat && n.soc != null && n.soc < 20 && n.pv < 200) tips.push(["energy", `Batterie nur noch bei ${Math.round(n.soc)} %.`, "Nachts und ohne Sonne kommt der Strom wieder aus dem Netz."]);
    this._enOut(n).forEach((nm) => tips.push(["alert!", `${esc(nm)} liefert nichts.`, "Die andere Anlage erzeugt Strom. Ist der Wechselrichter ausgesteckt, aus oder ohne Verbindung?"]));
    if (!tips.length) tips.push(["check", "Alles ruhig.", "Kein Überschuss, kein hoher Netzbezug."]);
    const tipC = `<div class="card"><h2>${ic("info", 18)}Hinweise</h2>${tips.map(([ico, t, s]) => `<div class="dgs ${ico.endsWith("!") ? "warn" : "ok"}" style="grid-template-columns:28px 1fr">${ic(ico.replace("!", ""), 22)}<div><b>${t}</b>${s ? `<span>${s}</span>` : ""}</div></div>`).join("")}</div>`;
    const o = (n, h) => h.replace('<div class="card', `<div style="order:${n}" class="card`);
    return `${hero}${tabs}${tiles}<div class="enc"><div class="enco">${o(1, flow)}${dist ? o(3, dist) : ""}${o(6, tipC)}</div><div class="enco">${o(2, chart)}${cost ? o(4, cost) : ""}${o(5, heatC)}</div></div>`;
  }
  _enAct(a, b) {
    const E = this._enState(), k = b.dataset.k;
    if (a === "enrange") { E.range = k; this._enSave(); this._render(); }
    else if (a === "enreload") { this._enH = null; this._enLoad(true); this._render(); }
    else if (a === "ensdone") { this._pkId = null; this._modal = null; this._renderModal(); this._enH = null; this._render(); }
    else if (a === "enssign") { E.sign = k; this._enSave(true); this._renderModal(); }
    else if (a === "ensbm") { E.bmode = k === "two" ? "two" : "one"; this._pkId = null; this._enH = null; this._enSave(true); this._renderModal(); }
    else if (a === "ensbs") { E.bsign = k; this._enSave(true); this._renderModal(); }
  }
  _enChange(t) {
    const f = t.dataset.f, E = this._enState();
    if (f === "enent") { E.ent[t.dataset.k] = t.value; this._enSave(true); return true; }
    if (f === "enname") { E[t.dataset.k] = String(t.value || "").replace(/[<>"'&]/g, "").slice(0, 20); this._enSave(true); this._render(); return true; }
    return false;
  }
  _enSetModal() {
    const E = this._enState(), st = this._hass.states, ks = Object.keys(st), p = this._pv();
    const pw = ks.filter((e) => e.startsWith("sensor.") && (st[e].attributes.device_class === "power" || /^k?W$/.test(st[e].attributes.unit_of_measurement || "")));
    const en = ks.filter((e) => e.startsWith("sensor.") && (["energy", "power"].includes(st[e].attributes.device_class) || /^[kM]?Wh?$/.test(st[e].attributes.unit_of_measurement || "")));
    const sel = (k, o, none) => this._wzSel(o, E.ent[k], "enent", `data-k="${k}"`, none || "– keiner –");
    return `<div class="ov" data-act="ensdone"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Energie-Übersicht</b><span>Einstellungen</span></div><button class="ibtn" data-act="ensdone" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("sun", 15)}Leistung (Watt)</div>
      <div class="mut sm" style="margin:2px 0 0">Solar-Leistung</div>${sel("pv", pw)}
      <div class="mut sm" style="margin:0">Zweite Solaranlage, z. B. Balkonkraftwerk (optional, wird addiert)</div>${sel("pv2", pw)}
      ${E.ent.pv2 ? `<div class="mut sm" style="margin:0">Namen der Anlagen (für die Anzeige)</div><div class="enn"><input class="otxt" type="text" maxlength="20" placeholder="Solar" value="${esc(E.pvn || "")}" data-f="enname" data-k="pvn" aria-label="Name der ersten Anlage"><input class="otxt" type="text" maxlength="20" placeholder="Balkon" value="${esc(E.pv2n || "")}" data-f="enname" data-k="pv2n" aria-label="Name der zweiten Anlage"></div>` : ""}
      <div class="mut sm" style="margin:0">Netz${p.sensor ? ` (leer = ${esc(this._wzName(p.sensor))} aus Modul 1)` : ""}</div>${sel("grid", pw, p.sensor ? "– wie Modul 1 –" : "– keiner –")}
      <div class="seg">${[["", "Wie Modul 1"], ["export", "Einspeisung positiv"], ["import", "Bezug positiv"]].map(([k, l]) => `<button class="${(E.sign || "") === k ? "sel" : ""}" data-act="enssign" data-k="${k}">${l}</button>`).join("")}</div>
      <div class="mut sm" style="margin:0">Hausverbrauch (optional, sonst berechnet)</div>${sel("house", pw)}
      <div class="mut sm" style="margin:0">Batterie-Leistung (optional)</div>
      <div class="seg">${[["one", "Ein Sensor"], ["two", "Zwei Sensoren (Laden / Entladen)"]].map(([k, l]) => `<button class="${E.bmode === k ? "sel" : ""}" data-act="ensbm" data-k="${k}">${l}</button>`).join("")}</div>
      ${E.bmode === "two" ? `<div class="mut sm" style="margin:0">Batterie lädt (Watt, positiver Wert)</div>${sel("bchg", pw)}<div class="mut sm" style="margin:0">Batterie entlädt (Watt, positiver Wert)</div>${sel("bdis", pw)}` : `${sel("bat", pw)}${E.ent.bat ? `<div class="seg">${[["charge", "Laden positiv"], ["discharge", "Entladen positiv"]].map(([k, l]) => `<button class="${E.bsign === k ? "sel" : ""}" data-act="ensbs" data-k="${k}">${l}</button>`).join("")}</div>` : ""}`}
      <div class="lsec">${ic("chart", 15)}Tagessummen für 7 und 30 Tage</div>
      <div class="mut sm" style="margin:2px 0 6px">Energiezähler (Wh, kWh, MWh) sind am genauesten. Leistungssensoren (W, kW) gehen auch. Leer lassen: es wird aus Solar und Netz oben berechnet.</div>
      <div class="mut sm" style="margin:2px 0 0">Solar-Ertrag gesamt</div>${sel("pve", en)}
      ${E.ent.pv2 ? `<div class="mut sm" style="margin:0">Ertrag ${esc(this._enPvNames()[1])} gesamt</div>${sel("pve2", en)}` : ""}
      <div class="mut sm" style="margin:0">Netzbezug gesamt</div>${sel("imp", en)}
      <div class="mut sm" style="margin:0">Einspeisung gesamt</div>${sel("exp", en)}
      <div class="gst">${ic("info", 15)}Batterie-Ladestand, Strompreis und Einspeisevergütung kommen aus Modul 1 → Allgemein. Zähler müssen als Langzeitstatistik in Home Assistant geführt werden.</div>
      ${this._labFields("en")}
      <div class="foot2"><button class="btn2 pri" data-act="ensdone">Fertig</button></div></div>`;
  }
}
