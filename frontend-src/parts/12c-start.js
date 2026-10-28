  /* Startseite: der Überblick über das Zuhause. Erscheint nach dem Laden des Dashboards zuerst (abschaltbar).
     Blöcke: Zuhause, Wetter, Personen, Hinweise, Alarm, Energie, Müllabfuhr. Anordnung und Sichtbarkeit stehen in layout.start.
     Lab „Start-Bubbles“ (sb): runde Kurzinfos ganz oben, Auswahl in layout.start.bub. Alles nur Anzeige, nur der Alarm kann (optional) schalten. */
  _hzCfg() {
    const l = (this._cfg && this._cfg.layout && this._cfg.layout.start) || {}, b = l.bub || {}, known = Object.keys(HZ_NAMES), o = (Array.isArray(l.order) ? l.order : []).filter((x) => known.includes(x));
    return {
      on: l.on !== false, open: l.open === "last" ? "last" : "start", greet: l.greet !== false, alarm: typeof l.alarm === "string" ? l.alarm : "", ctl: l.ctl === true,
      order: [...o, ...known.filter((x) => !o.includes(x))], hidden: (Array.isArray(l.hidden) ? l.hidden : []).filter((x) => known.includes(x)),
      bub: { ids: (Array.isArray(b.ids) ? b.ids : HZ_BUB_DEF).filter((x) => HZ_BUBS.includes(x)).slice(0, 8), warn: b.warn !== false, tap: b.tap === "module" ? "module" : "block" },
    };
  }
  _hzOn() { return this._hzCfg().on; }
  _hzSave(patch) {
    const raw = (this._cfg.layout.start && typeof this._cfg.layout.start === "object") ? this._cfg.layout.start : {};
    this._cfg.layout.start = { ...raw, ...patch }; this._saveLayout(); this._render();
    if (this._modal && ["hzset", "hzbub"].includes(this._modal.type)) this._renderModal();
  }
  _hzGreet() {
    const c = this._hzCfg(), d = new Date(), h = d.getHours(), hi = h < 5 ? "Gute Nacht" : h < 11 ? "Guten Morgen" : h < 17 ? "Guten Tag" : "Guten Abend";
    const nm = c.greet && this._hass && this._hass.user && this._hass.user.name ? String(this._hass.user.name).trim().split(/\s+/)[0] : "";
    return `${nm ? `${hi}, ${esc(nm)}` : hi} · ${d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}`;
  }
  _hzSince(iso) { const m = Math.max(0, Math.round((Date.now() - new Date(iso || Date.now()).getTime()) / 60000)); return m < 60 ? `${m} Min.` : m < 1440 ? `${Math.floor(m / 60)} Std.` : `${Math.floor(m / 1440)} Tg.`; }
  /* Offene Fenster je Raum */
  _hzWin() {
    const st = this._hass.states, out = [];
    this._collect().forEach((r) => {
      const open = (r.windows || []).map((e) => st[e]).filter((w) => w && ["on", "open"].includes(w.state));
      if (open.length) out.push({ name: r.name, n: open.length, since: Math.min(...open.map((w) => new Date(w.last_changed || Date.now()).getTime())) });
    });
    return out;
  }
  _hzMu() { return this._labOn("mm") ? (this._mu().bins || []) : []; }
  _hzHints() {
    const H = this._hass, st = H.states, out = [], o = this._out();
    this._hzWin().forEach((w) => { const m = Math.round((Date.now() - w.since) / 60000); if (m >= 15) out.push({ i: "windowOpen", t: `${esc(w.name)}: Fenster seit ${this._hzSince(new Date(w.since).toISOString())} offen`, s: o.t != null ? `Außen ${num(o.t, 0)} °C` : "", r: "jetzt", c: "wa", mod: "fh" }); });
    if (this._mdState().on.ww && this._wwConfigured()) this._wwProblems().filter((p) => p[0] === "bad" || p[0] === "warn").slice(0, 2).forEach((p) => out.push({ i: "drop", t: esc(p[2]), s: esc(p[3]), r: "", c: p[0] === "bad" ? "bad" : "wa", mod: "ww" }));
    const due = this._hzMu().filter((x) => ["out", "today", "soon"].includes(x.state));
    if (due.length) out.push({ i: "trash", t: `${due.some((x) => x.state === "today") ? "Heute" : "Morgen"}: ${due.map((x) => esc(x.name)).join(", ")}`, s: "Abholung, Tonne rausstellen", r: due.some((x) => x.state === "today") ? "heute" : "morgen", c: "wa", mod: "mu" });
    const al = this._hzAlarmEnt(); if (al && st[al] && st[al].state === "triggered") out.push({ i: "shield", t: "Alarm ausgelöst", s: esc(this._wzName(al)), r: "jetzt", c: "bad", blk: "alarm" });
    let nb = 0;
    Object.keys(st).forEach((e) => {
      if (nb >= 3) return; const s = st[e], a = s.attributes || {};
      if (e.startsWith("binary_sensor.") && a.device_class === "battery" && s.state === "on") { nb++; out.push({ i: "alert", t: `Batterie schwach: ${esc(a.friendly_name || e)}`, s: "Batterie wechseln", r: "", c: "wa" }); }
      else if (e.startsWith("sensor.") && a.device_class === "battery" && isFinite(parseFloat(s.state)) && parseFloat(s.state) <= 15) { nb++; out.push({ i: "alert", t: `Batterie schwach: ${esc(a.friendly_name || e)}`, s: `${num(parseFloat(s.state), 0)} %`, r: "", c: "wa" }); }
    });
    try { const sp = this._spnS(); if (this._admin() && sp.soon) out.push({ i: "heart", t: sp.soon === 1 ? "Ein Sponsor-Schlüssel läuft bald ab" : `${sp.soon} Sponsor-Schlüssel laufen bald ab`, s: "Unter Einstellungen, Sponsor-Bereich verlängern", r: "bald", c: "wa" }); } catch (_) { /* egal */ }
    const rank = { bad: 0, wa: 1 }; return out.sort((a, b) => (rank[a.c] ?? 2) - (rank[b.c] ?? 2));
  }
  /* Kachel je aktives Modul */
  _hzTile(m) {
    const st = this._hass.states; let sub = "", c = "";
    if (m.id === "fh") { const n = this._hzWin().reduce((s, w) => s + w.n, 0); sub = n ? `${n} ${n === 1 ? "Fenster" : "Fenster"} offen` : "Alle Fenster zu"; c = n ? "wa" : ""; }
    else if (m.id === "ww") { const E = this._mdState().ww.ent || {}, t = E.top && st[E.top], v = t ? parseFloat(t.state) : NaN, bad = this._wwConfigured() && this._wwProblems().some((p) => p[0] === "bad" || p[0] === "warn"); sub = isFinite(v) ? `${num(v, 0)} °C` : "Nicht eingerichtet"; c = bad ? "wa" : isFinite(v) ? "" : "mut"; }
    else if (m.id === "en") { const N = this._enOn() ? this._enNow() : null; sub = N ? `${num(N.pv / 1000, 1)} kW PV` : "Nicht eingerichtet"; c = N ? "" : "mut"; }
    else if (m.id === "gs") { const n = this._gsState().devices.length; sub = n ? `${n} ${n === 1 ? "Gerät" : "Geräte"}` : "Keine Geräte"; c = n ? "" : "mut"; }
    else if (m.id === "ev") { const e = (this._evState().ent || {}).soc, v = e && st[e] ? parseFloat(st[e].state) : NaN; sub = isFinite(v) ? `${num(v, 0)} %` : "Nicht eingerichtet"; c = isFinite(v) ? "" : "mut"; }
    else if (m.id === "mu") { const x = this._hzMu().filter((b) => b.next).sort((a, b) => a.days - b.days)[0]; sub = x ? `${esc(x.name)} ${this._muWhen(x.days)}` : "Keine Termine"; c = x && x.days <= 1 ? "wa" : x ? "" : "mut"; this._muLoad(); }
    else { sub = modSt(m) && STG[modSt(m)] ? STG[modSt(m)].t : ""; c = "mut"; }
    return `<button class="hzt ${c}" data-act="hzgo" data-k="${m.id}"><span class="hti">${ic(m.icon, 22)}</span><b>${esc(m.short)}</b><small>${sub}</small></button>`;
  }
  _hzZuhause(hints) {
    const mods = this._mdList().filter((m) => m.id !== "st"), n = hints.length, bad = hints.some((h) => h.c === "bad");
    const head = n ? (bad ? "Es gibt etwas zu tun" : "Fast alles in Ordnung") : "Alles in Ordnung", hc = bad ? "bad" : n ? "" : "ok";
    return `<div class="card"><h2>${ic("home", 18)}Zuhause</h2><div class="hzhead ${hc}">${head}</div><div class="hzsub">${n ? `${n} ${n === 1 ? "Hinweis braucht" : "Hinweise brauchen"} Aufmerksamkeit. ` : ""}Tippe auf eine Kachel, um das Modul zu öffnen.</div><div class="hzgrid">${mods.map((m) => this._hzTile(m)).join("")}</div></div>`;
  }
  /* Wetter */
  _hzWxId() { const c = this._wxCfg(), st = this._hass.states; return c.entity && st[c.entity] ? c.entity : Object.keys(st).find((k) => k.startsWith("weather.")); }
  _hzFc(wid) {
    const d = this._hzFcD; if (d && d.id === wid && Date.now() - d.ts < 900000) return d.list;
    if (this._hzFcBusy || !this._hass) return d && d.id === wid ? d.list : [];
    this._hzFcBusy = true;
    this._hass.callWS({ type: "call_service", domain: "weather", service: "get_forecasts", service_data: { type: "hourly" }, target: { entity_id: wid }, return_response: true })
      .then((r) => { const f = r && r.response && r.response[wid] && r.response[wid].forecast; this._hzFcD = { id: wid, ts: Date.now(), list: Array.isArray(f) ? f : [] }; })
      .catch(() => { this._hzFcD = { id: wid, ts: Date.now(), list: [] }; })
      .finally(() => { this._hzFcBusy = false; if (this._mdActive() === "st" && !this._dragging && !this._modal) this._render(); });
    return d && d.id === wid ? d.list : [];
  }
  _hzWetter() {
    const wid = this._hzWxId(); if (!wid) return "";
    const w = this._hass.states[wid], a = w.attributes || {}, o = this._out(), k = WX[w.state] || ["cloud", w.state || ""];
    const fc = this._hzFc(wid).filter((x) => new Date(x.datetime).getTime() > Date.now()).filter((_, i) => i % 3 === 2).slice(0, 4);
    const bits = [a.humidity != null ? `Luftfeuchte ${num(a.humidity, 0)} %` : "", a.wind_speed != null ? `Wind ${num(a.wind_speed, 0)} ${a.wind_speed_unit || "km/h"}` : ""].filter(Boolean).join(" · ");
    return `<div class="card"><h2>${ic("cloud", 18)}Wetter<span class="hzrt">${esc(a.friendly_name || wid)}</span></h2>
      <div class="hzwx"><span class="hzwi">${ic(k[0], 44)}</span><div><div class="hzbig">${o.t != null ? num(o.t, 1) : "–"}<small> °C</small></div><div class="hzsub" style="margin:2px 0 0">${esc(k[1])}${bits ? ` · ${bits}` : ""}</div></div></div>
      ${fc.length ? `<div class="hzfc">${fc.map((x) => `<div><small>${new Date(x.datetime).getHours()} Uhr</small><b>${x.temperature != null ? num(x.temperature, 0) + "°" : "–"}</b>${ic((WX[x.condition] || ["cloud"])[0], 18)}</div>`).join("")}</div>` : ""}</div>`;
  }
  /* Personen */
  _hzPersonen() {
    const P = this._ortPersons().filter((p) => p.count); if (!P.length) return "";
    const st = this._hass.states, nh = P.filter((p) => p.home).length;
    const dist = (d) => (d >= 1000 ? `${num(d / 1000, d < 10000 ? 1 : 0)} km` : `${num(d, 0)} m`);
    return `<div class="card"><h2>${ic("users", 18)}Personen<span class="hzrt">${nh} von ${P.length} zu Hause</span></h2><div class="hzl">${P.map((p) => {
      const s = st[p.id] || {}, pic = (s.attributes || {}).entity_picture, since = s.last_changed ? new Date(s.last_changed).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "";
      const sub = p.unavailable ? "Kein Standort" : p.home ? `Zu Hause${since ? ` seit ${since}` : ""}` : p.dist != null ? `Unterwegs, ${dist(p.dist)} entfernt` : (p.state && p.state !== "not_home" ? esc(p.state) : "Unterwegs");
      return `<div class="hzr"><span class="hzav ${p.home ? "home" : ""}" style="--c:${p.col};${pic ? `background-image:url('${esc(pic)}');` : ""}">${pic ? "" : esc(p.name.slice(0, 1).toUpperCase())}<u></u></span><div class="hzrx"><b>${esc(p.name)}</b><small>${sub}</small></div><span class="hzrr ${p.home ? "ok" : ""}">${p.home ? "zu Hause" : "unterwegs"}</span></div>`;
    }).join("")}</div></div>`;
  }
  /* Alarm */
  _hzAlarmEnt() { const c = this._hzCfg(), st = this._hass.states; return c.alarm && st[c.alarm] ? c.alarm : Object.keys(st).find((k) => k.startsWith("alarm_control_panel.")) || ""; }
  _hzAlarmTxt(s) { return { disarmed: ["Unscharf", "ok"], armed_home: ["Scharf, zu Hause", "ok"], armed_away: ["Scharf, abwesend", "ok"], armed_night: ["Scharf, Nacht", "ok"], armed_vacation: ["Scharf, Urlaub", "ok"], armed_custom_bypass: ["Scharf, angepasst", "ok"], arming: ["Wird scharf geschaltet …", "wa"], pending: ["Verzögerung läuft", "wa"], disarming: ["Wird unscharf geschaltet …", "wa"], triggered: ["AUSGELÖST", "bad"] }[s] || ["Nicht verfügbar", "mut"]; }
  _hzAlarm() {
    const e = this._hzAlarmEnt(); if (!e) return ""; const s = this._hass.states[e], [txt, cl] = this._hzAlarmTxt(s.state), c = this._hzCfg(), ctl = c.ctl && this._admin();
    const since = s.last_changed ? new Date(s.last_changed).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "";
    const btn = (k, t, ico, on) => `<button class="hzt ${on ? "sel" : ""}" data-act="hzalarm" data-k="${k}"><span class="hti">${ic(ico, 20)}</span><b>${t}</b>${on ? "<small>aktiv</small>" : ""}</button>`;
    return `<div class="card"><h2>${ic("shield", 18)}Alarm<span class="hzrt">${esc(this._wzName(e))}</span></h2><div class="hzhead ${cl === "ok" ? "ok" : cl === "bad" ? "bad" : ""}" style="font-size:1.25rem">${txt}</div><div class="hzsub">${since ? `Seit ${since} Uhr` : ""}</div>
      ${ctl ? `<div class="hzgrid">${btn("disarm", "Unscharf", "shield", s.state === "disarmed")}${btn("away", "Abwesend", "door", s.state === "armed_away")}${btn("home", "Zu Hause", "home", s.state === "armed_home")}</div><div class="hzsub" style="margin:8px 0 0">Schalten nur mit Bestätigung${(s.attributes || {}).code_format ? " und Code" : ""}.</div>` : ""}</div>`;
  }
  _hzHinweise(hints) {
    return `<div class="card"><h2>${ic("info", 18)}Hinweise<span class="hzrt">alle Module</span></h2>${hints.length ? `<div class="hzl">${hints.slice(0, 6).map((h) => `<${h.mod || h.blk ? `button data-act="hzgo" data-k="${h.mod || ""}" data-b="${h.blk || ""}"` : "div"} class="hzr ${h.c || ""}"><span class="hzri">${ic(h.i, 22)}</span><span class="hzrx"><b>${h.t}</b>${h.s ? `<small>${h.s}</small>` : ""}</span>${h.r ? `<span class="hzrr ${h.c || ""}">${h.r}</span>` : ""}</${h.mod || h.blk ? "button" : "div"}>`).join("")}</div>` : `<div class="mut sm">Keine Hinweise. Fenster, Batterien, Warmwasser und Termine sind in Ordnung.</div>`}</div>`;
  }
  _hzEnergie() {
    if (!this._enOn()) return ""; const N = this._enNow(); if (!N) return "";
    const net = N.exp > 0 ? this._labTile("Netz", `${num(N.exp / 1000, 1)} kW`, "Einspeisung", "green") : this._labTile("Netz", `${num(N.imp / 1000, 1)} kW`, N.imp > 0 ? "Bezug" : "ausgeglichen", N.imp > 0 ? "amber" : "");
    return `<div class="card hzgo" data-act="hzgo" data-k="en" role="button" tabindex="0"><h2>${ic("energy", 18)}Energie jetzt<span class="hzrt">Modul 3</span></h2><div class="lugrid">${this._labTile("Solar", `${num(N.pv / 1000, 1)} kW`, `Haus ${num(N.house / 1000, 1)} kW`)}${N.soc != null ? this._labTile("Batterie", `${num(N.soc, 0)} %`, N.bc > 0 ? `lädt mit ${num(N.bc / 1000, 1)} kW` : N.dis > 0 ? `entlädt mit ${num(N.dis / 1000, 1)} kW` : "ruht") : ""}${net}</div></div>`;
  }
  _hzMuell() {
    if (!this._labOn("mm")) return ""; this._muLoad(); const S = this._mu(), rows = (S.bins || []).filter((x) => x.next); if (!S.on || !rows.length) return "";
    const lbl = { out: "raus!", today: "heute", soon: "morgen", ok: "ok", done: "draußen", none: "–" };
    return `<div class="card"><h2>${ic("trash", 18)}Müllabfuhr<span class="hzrt">Modul 17</span></h2><div class="mugrid">${(S.bins || []).map((x) => { const tap = ["out", "today", "soon"].includes(x.state) ? "muxdone" : x.state === "done" ? "muxundo" : ""; return `<${tap ? `button data-act="${tap}" data-k="${x.k}"` : "div"} class="mubin ${x.state}"><i class="bin" style="background:${x.color}"></i><b>${esc(x.name)}</b><small>${x.next ? (x.days <= 1 ? lbl[x.state] : this._muWhen(x.days)) : "–"}</small></${tap ? "button" : "div"}>`; }).join("")}</div></div>`;
  }
  /* Bubbles (Lab) */
  _hzBubDef(id) {
    const st = this._hass.states, o = () => this._out();
    if (id === "wetter") { const wid = this._hzWxId(), w = wid && st[wid]; if (!w) return null; const t = o().t; return { i: (WX[w.state] || ["cloud"])[0], b: t != null ? `${num(t, 0)} °C` : "–", s: "Wetter", blk: "wetter" }; }
    if (id === "personen") { const P = this._ortPersons().filter((p) => p.count); if (!P.length) return null; const n = P.filter((p) => p.home).length; return { i: "users", b: `${n} zu Hause`, s: "Personen", c: n ? "ok" : "", blk: "personen" }; }
    if (id === "alarm") { const e = this._hzAlarmEnt(); if (!e) return null; const [t, c] = this._hzAlarmTxt(st[e].state); return { i: "shield", b: t.replace(/, .*/, ""), s: "Alarm", c: c === "ok" ? "ok" : c === "bad" ? "bad" : c === "wa" ? "wa" : "", blk: "alarm" }; }
    if (id === "solar" || id === "batterie") { if (!this._enOn()) return null; const N = this._enNow(); if (!N) return null; return id === "solar" ? { i: "sun", b: `${num(N.pv / 1000, 1)} kW`, s: "Solar", mod: "en", blk: "energie" } : N.soc != null ? { i: "bolt", b: `${num(N.soc, 0)} %`, s: "Batterie", mod: "en", blk: "energie" } : null; }
    if (id === "auto") { const E = this._evState().ent || {}, v = E.soc && st[E.soc] ? parseFloat(st[E.soc].state) : NaN; if (!isFinite(v)) return null; const ch = E.charging && st[E.charging] && ["on", "charging"].includes(st[E.charging].state); return { i: "car", b: `${num(v, 0)} %`, s: ch ? "lädt" : "E-Auto", c: ch ? "ok" : "", mod: "ev" }; }
    if (id === "fenster") { const n = this._hzWin().reduce((s, w) => s + w.n, 0); return { i: "windowOpen", b: n ? `${n} offen` : "alle zu", s: "Fenster", c: n ? "wa" : "ok", mod: "fh" }; }
    if (id === "muell") { if (!this._labOn("mm")) return null; this._muLoad(); const x = this._hzMu().filter((b) => b.next).sort((a, b) => a.days - b.days)[0]; return x ? { i: "trash", b: x.days === 0 ? "Heute" : x.days === 1 ? "Morgen" : `in ${x.days} Tg.`, s: x.name, c: x.days <= 1 ? "wa" : "", mod: "mu", blk: "muell" } : null; }
    if (id === "warmwasser") { if (!this._mdState().on.ww) return null; const E = this._mdState().ww.ent || {}, v = E.top && st[E.top] ? parseFloat(st[E.top].state) : NaN; return isFinite(v) ? { i: "drop", b: `${num(v, 0)} °C`, s: "Warmwasser", mod: "ww" } : null; }
    if (id === "preis") { if (!this._enOn()) return null; const p = this._price(); return p ? { i: "chart", b: `${num(p, 1)} ct`, s: "Strompreis", mod: "en" } : null; }
    if (id === "hinweise") { const n = this._hzHints().length; return { i: "info", b: n ? `${n} ${n === 1 ? "Hinweis" : "Hinweise"}` : "keine", s: "Hinweise", c: n ? "wa" : "ok", blk: "hinweise" }; }
    return null;
  }
  _hzBubs() {
    const c = this._hzCfg().bub, items = c.ids.map((id) => ({ id, ...(this._hzBubDef(id) || {}) })).filter((x) => x.i);
    return items.length ? `<div class="hzbubs" role="list">${items.map((x) => `<button class="hzb ${c.warn ? x.c || "" : ""}" role="listitem" data-act="hzbub" data-k="${x.id}"><i>${ic(x.i, 16)}</i><span><b>${esc(x.b)}</b><small>${esc(x.s)}</small></span></button>`).join("")}</div>` : `<div class="mut sm">Keine Bubble hat gerade Daten. Wähle andere unter „Inhalt wählen“.</div>`;
  }
  /* Seite */
  _hzPage() {
    const adm = this._admin(), edit = this._edit && adm, c = this._hzCfg(), hints = this._hzHints();
    const B = { zuhause: this._hzZuhause(hints), wetter: this._hzWetter(), personen: this._hzPersonen(), hinweise: this._hzHinweise(hints), alarm: this._hzAlarm(), energie: this._hzEnergie(), muell: this._hzMuell() };
    const eb = edit ? `<div class="banner">${ic("grip", 18)}<div>Ziehe die Karten an den Griffen, um sie zu verschieben. Mit dem Auge blendest du eine Karte aus. <button class="lnk" data-act="hzreset">Zurücksetzen</button></div></div>` : "";
    const bub = this._labOn("sb") ? (edit ? `<div class="hzbe"><div class="etag">${ic("layers", 16)}Bubbles (Lab)<button class="eyeb" data-act="hzbubopen">${ic("sliders", 16)}<span>Inhalt wählen</span></button></div>${this._hzBubs()}</div>` : this._hzBubs()) : "";
    const blocks = c.order.filter((id) => B[id] && (edit || !c.hidden.includes(id))).map((id) => {
      const hid = c.hidden.includes(id);
      return `<section class="blk mub ${HZ_WIDE.includes(id) ? "wide" : ""} ${edit ? "editing" : ""} ${hid ? "hid" : ""}" data-sort="hzblk" data-id="${id}">
      ${edit ? `<div class="etag"><span class="grip" data-handle title="Verschieben">${ic("grip", 18)}</span>${HZ_NAMES[id]}<button class="eyeb" data-act="hzhide" data-k="${id}" aria-pressed="${!hid}" aria-label="${HZ_NAMES[id]} ${hid ? "einblenden" : "ausblenden"}" title="${hid ? "Einblenden" : "Ausblenden"}">${ic(hid ? "eyeOff" : "eye", 18)}<span>${hid ? "Ausgeblendet" : "Sichtbar"}</span></button></div>` : ""}${B[id]}</section>`;
    }).join("");
    return `${bub}${eb}${this._spnCard()}<div class="mublks">${blocks || `<div class="card empty">${ic("home", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Noch nichts zu zeigen</div>Richte ein Modul ein oder blende Karten über „Anpassen“ wieder ein.</div>`}</div>`;
  }
  _hzAct(a, b) {
    const k = b.dataset.k;
    if (a === "hzgo") {
      if (k && this._mdList().some((m) => m.id === k)) { this._stOpen = false; this._edit = false; this._mdActiveSet(k); this._render(); }
      else if (b.dataset.b) this._hzScroll(b.dataset.b);
      return;
    }
    if (a === "hzbub") {
      const d = this._hzBubDef(k) || {}, tap = this._hzCfg().bub.tap, el = d.blk && this.shadowRoot.querySelector(`[data-sort="hzblk"][data-id="${d.blk}"]`);
      if (tap === "block" && el && !el.classList.contains("hid")) this._hzScroll(d.blk);
      else if (d.mod && this._mdList().some((m) => m.id === d.mod)) { this._edit = false; this._mdActiveSet(d.mod); this._render(); }
      else if (d.blk) this._hzScroll(d.blk);
      return;
    }
    if (a === "hzopen") { this._modal = { type: "hzset" }; this._renderModal(); return; }
    if (a === "hzbubopen") { this._modal = { type: "hzbub" }; this._renderModal(); return; }
    if (a === "hzback") { this._modal = { type: "hzset" }; this._renderModal(); return; }
    if (a === "hzhide") { const h = this._hzCfg().hidden; this._hzSave({ hidden: h.includes(k) ? h.filter((x) => x !== k) : [...h, k] }); return; }
    if (a === "hzreset") { this._hzSave({ order: Object.keys(HZ_NAMES), hidden: [] }); this._toast("Anordnung zurückgesetzt"); return; }
    if (a === "hzsw") { const c = this._hzCfg(); if (k === "on") this._hzSave({ on: !c.on }); else if (k === "greet") this._hzSave({ greet: !c.greet }); else if (k === "ctl") this._hzSave({ ctl: !c.ctl }); else if (k === "warn") this._hzSave({ bub: { ...c.bub, warn: !c.bub.warn } }); return; }
    if (a === "hzopenm") { this._hzSave({ open: k === "last" ? "last" : "start" }); return; }
    if (a === "hztap") { const c = this._hzCfg(); this._hzSave({ bub: { ...c.bub, tap: k === "module" ? "module" : "block" } }); return; }
    if (a === "hzbt") { const c = this._hzCfg(), ids = c.bub.ids.slice(); if (ids.includes(k)) ids.splice(ids.indexOf(k), 1); else if (ids.length < 8) ids.push(k); else { this._toast("Mehr als 8 Bubbles sind nicht möglich"); return; } this._hzSave({ bub: { ...c.bub, ids } }); return; }
    if (a === "hzbm") { const c = this._hzCfg(), ids = c.bub.ids.slice(), i = ids.indexOf(k), j = i + (b.dataset.d === "up" ? -1 : 1); if (i < 0 || j < 0 || j >= ids.length) return; [ids[i], ids[j]] = [ids[j], ids[i]]; this._hzSave({ bub: { ...c.bub, ids } }); return; }
    if (a === "hzalarm") { const e = this._hzAlarmEnt(); if (!e || !this._hzCfg().ctl || !this._admin()) return; this._modal = { type: "hzpin", mode: k }; this._renderModal(); return; }
    if (a === "hzpinok") {
      const m = this._modal, e = this._hzAlarmEnt(); if (!m || !e) return; const inp = this.shadowRoot.querySelector(".hzpin"), code = inp ? inp.value.trim() : "";
      const svc = { disarm: "alarm_disarm", away: "alarm_arm_away", home: "alarm_arm_home" }[m.mode]; if (!svc) return;
      this._modal = null; this._renderModal();
      this._hass.callService("alarm_control_panel", svc, { entity_id: e, ...(code ? { code } : {}) }).then(() => this._toast("Alarm wird geschaltet")).catch(() => this._toast("Das hat nicht geklappt. Stimmt der Code?"));
      return;
    }
  }
  _hzScroll(id) {
    const el = this.shadowRoot.querySelector(`[data-sort="hzblk"][data-id="${id}"]`); if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" }); el.classList.add("hzflash"); setTimeout(() => el.classList.remove("hzflash"), 1300);
  }
  _hzChange(t) {
    if (t.dataset.f === "hzsel") { this._hzSave({ alarm: t.value || "" }); return true; }
    return false;
  }
  _hzModal() {
    const m = this._modal, c = this._hzCfg(), adm = this._admin(), st = this._hass.states;
    const sw = (k, on, label) => `<button class="sw ${on ? "on" : ""}" data-act="hzsw" data-k="${k}" aria-pressed="${!!on}" aria-label="${esc(label)}" ${adm ? "" : "disabled"}></button>`;
    const chip = (act, k, t, on) => `<button class="gsch ${on ? "sel" : ""}" data-act="${act}" data-k="${k}" aria-pressed="${!!on}" ${adm ? "" : "disabled"}>${t}</button>`;
    if (m.type === "hzpin") {
      const e = this._hzAlarmEnt(), need = e && (st[e].attributes || {}).code_format, T = { disarm: "unscharf schalten", away: "auf „Abwesend“ schalten", home: "auf „Zu Hause“ schalten" }[m.mode] || "schalten";
      return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Alarm ${T}?</b><span>${esc(e ? this._wzName(e) : "")}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="gst on">${ic("alert", 15)}<span>Das schaltet deine Alarmanlage in Home Assistant.</span></div>
        ${need ? `<div class="vrow"><span>Code</span><input class="osel hzpin" type="password" inputmode="${need === "number" ? "numeric" : "text"}" autocomplete="off" style="width:50%;margin:0" aria-label="Alarm-Code"></div>` : ""}
        <div class="gbtns" style="margin-top:12px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="hzpinok">${ic("check", 16)} ${m.mode === "disarm" ? "Unscharf schalten" : "Scharf schalten"}</button></div></div>`;
    }
    if (m.type === "hzbub") {
      const sel = c.bub.ids, rest = HZ_BUBS.filter((x) => !sel.includes(x));
      const row = (id, on, i) => `<div class="hzo ${on ? "on" : ""}"><button class="hzck ${on ? "on" : ""}" data-act="hzbt" data-k="${id}" aria-pressed="${on}" aria-label="${esc(HZ_BUB_N[id][0])}" ${adm ? "" : "disabled"}>${on ? ic("check", 14) : ""}</button><span class="hzoi">${ic(HZ_BUB_N[id][2], 18)}</span><span class="hzot"><b>${HZ_BUB_N[id][0]}</b><small>${HZ_BUB_N[id][1]}</small></span>${on && adm ? `<button class="ibtn" data-act="hzbm" data-d="up" data-k="${id}" aria-label="Nach oben" ${i === 0 ? "disabled" : ""}>${ic("up", 16)}</button><button class="ibtn dn" data-act="hzbm" data-d="down" data-k="${id}" aria-label="Nach unten" ${i === sel.length - 1 ? "disabled" : ""}>${ic("up", 16)}</button>` : ""}</div>`;
      return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true"><div class="sh"><div><b>Bubbles wählen</b><span>Lab „Start-Bubbles“ · gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="mut sm" style="margin:0 0 8px">Bis zu 8 möglich, ${sel.length} gewählt. Die Reihenfolge änderst du mit den Pfeilen. Bubbles ohne Daten werden ausgelassen.</div>
        ${sel.map((id, i) => row(id, true, i)).join("")}${rest.map((id) => row(id, false, -1)).join("")}
        <div class="vrow"><span>Warnfarben<small class="mut" style="display:block">Gelb bei Hinweis, Rot bei Alarm</small></span>${sw("warn", c.bub.warn, "Warnfarben")}</div>
        <div class="vrow"><span>Antippen öffnet</span><span class="gschs">${chip("hztap", "block", "Karte", c.bub.tap === "block")}${chip("hztap", "module", "Modul", c.bub.tap === "module")}</span></div>
        <div class="gbtns" style="margin-top:10px"><button class="btn2 pri" data-act="hzback">${ic("check", 16)} Fertig</button></div></div>`;
    }
    const alarms = Object.keys(st).filter((e) => e.startsWith("alarm_control_panel."));
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true"><div class="sh"><div><b>Startseite</b><span>Gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="vrow"><span>Startseite verwenden<small class="mut" style="display:block">Aus: das Dashboard öffnet wie bisher das zuletzt benutzte Modul.</small></span>${sw("on", c.on, "Startseite verwenden")}</div>
      <div class="vrow"><span>Beim Öffnen zeigen<small class="mut" style="display:block">Gilt, wenn du das Dashboard in Home Assistant neu öffnest. Ein Direktlink mit <code>?modul=</code> öffnet sein Modul.</small></span><span class="gschs">${chip("hzopenm", "start", "Start", c.open === "start")}${chip("hzopenm", "last", "Letztes Modul", c.open === "last")}</span></div>
      <div class="vrow"><span>Begrüßung mit Namen<small class="mut" style="display:block">Vorname des angemeldeten Benutzers.</small></span>${sw("greet", c.greet, "Begrüßung mit Namen")}</div>
      <div class="lsec" style="margin-top:12px">${ic("shield", 15)}Alarm</div>
      ${alarms.length ? this._wzSel(alarms, c.alarm, "hzsel", "", "– automatisch –") : `<div class="mut sm">Keine Alarmanlage in Home Assistant gefunden. Der Block bleibt dann weg.</div>`}
      <div class="vrow"><span>Alarm schalten erlauben<small class="mut" style="display:block">Zeigt Knöpfe für Unscharf, Abwesend und Zu Hause. Jedes Schalten wird bestätigt. Das schaltet echte Geräte.</small></span>${sw("ctl", c.ctl, "Alarm schalten erlauben")}</div>
      ${this._labOn("sb") ? `<div class="gbtns" style="margin-top:12px"><button class="btn2" data-act="hzbubopen">${ic("layers", 16)} Bubbles wählen</button></div>` : `<div class="gst">${ic("info", 15)}<span>Runde Kurzinfos oben gibt es im Lab „Start-Bubbles“ unter Labs.</span></div>`}
      <div class="gbtns" style="margin-top:10px"><button class="btn2" data-act="hzreset">Anordnung zurücksetzen</button></div></div>`;
  }
