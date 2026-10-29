  _setCollapsed(set) { try { localStorage.setItem("fh_collapsed", JSON.stringify([...set])); } catch (_) { /* Speicher gesperrt */ } }
  _updBanner() {
    const u = this._upd, g = this._gen || {};
    if (!this._admin() || !u || g.updates === false || !vgt(u.latest, this._ver)) return "";
    try { if (localStorage.getItem("fh_upd_skip") === u.latest) return ""; } catch (_) { /* egal */ }
    return `<div class="upd">${ic("bell", 22)}<div><b>Neue Version ${esc(u.latest)} verfügbar</b><span>Installiert ist ${esc(this._ver)}${u.date ? " · veröffentlicht am " + esc(new Date(u.date + "T12:00:00").toLocaleDateString("de-DE")) : ""}</span>${this._spnLine()}</div><button class="lnk" data-act="news">Das ist neu</button><button class="ibtn" data-act="updx" aria-label="Ausblenden">${ic("close", 18)}</button></div>`;
  }
  _view() { try { return localStorage.getItem("fh_view") === "compact" ? "compact" : "detail"; } catch (_) { return "detail"; } }
  _viewBar() {
    const v = this._view();
    return `<div class="vbar"><button class="myb ${this._my().on ? "on" : ""}" data-act="my">${ic("user", 15)}Meine Ansicht</button><div class="vseg" role="group" aria-label="Ansicht der Raumkarten">${[["compact", "list", "Kompakt"], ["detail", "grid", "Detail"]].map(([k, i, l]) => `<button class="${v === k ? "sel" : ""}" data-act="view" data-k="${k}" aria-pressed="${v === k}">${ic(i, 16)}${l}</button>`).join("")}</div></div>`;
  }
  _rv(r) { return this._view() === "compact" ? this._row(r) : this._room(r); }
  _head() { return this._view() === "compact" ? `<div class="chead ${this._edit ? "ed" : ""}">${this._edit ? "<span></span>" : ""}<span></span><span>Raum</span><span>Fenster</span><span>Heizung</span><span>Heizplan</span><span>Pausiert</span><span></span><span></span></div>` : ""; }
  _row(r) {
    const h = this._hass, m = MODE[r.mode] || MODE.regelung_aus, edit = this._edit, adm = this._admin();
    const wins = (r.windows || []).map((e) => h.states[e]).filter(Boolean), open = wins.filter((w) => ["on", "open"].includes(w.state));
    const th = (r.thermos || []).map((e) => h.states[e]).filter(Boolean), t0 = th[0], cur = t0?.attributes.current_temperature, tgt = t0?.attributes.temperature;
    const hv = t0 ? (t0.state === "off" ? "aus" : t0.state === "heat" ? "heizt" : t0.state === "auto" ? "Automatik" : t0.state) : "–";
    const d = r.sc.day || { min: 0, gas: 0, kwh: 0 };
    const p0 = this._cfg.plans[r.id] || { enabled: false, entries: [] }, pts = points(p0.entries), now = nowMin(), today = Math.floor(now / 1440);
    const planOn = (r.planOn ?? p0.enabled) && !this._away() && !this._sum().active;
    const plan = pts.length
      ? `<b>${num(at(pts, now), 1)} °C jetzt</b><span ${planOn ? "" : 'style="opacity:.5"'}>${barRow(pts, today, now)}</span>`
      : `<b style="color:var(--mut);font-weight:500">kein Plan</b>`;
    const icon = edit
      ? `<button class="rico" style="${rcStyle(r.color)}" data-act="icon" data-id="${esc(r.id)}" aria-label="Symbol ändern">${ico(this._icon(r), 28)}<span class="pen">${ic("pencil", 11)}</span></button>`
      : `<div class="rico" style="${rcStyle(r.color)}">${ico(this._icon(r), 28)}</div>`;
    return `<div class="card crow ${edit ? "ed" : ""}${this._ph(r).c}"${this._ph(r).s} data-sort="room" data-id="${esc(r.id)}">
      ${edit ? `<span class="grip" data-handle title="Verschieben">${ic("grip", 18)}</span>` : ""}${icon}
      <div class="rn"><b>${esc(r.name)}</b><span class="pill ${m.c}">${m.t}</span>${this._airChip(r)}${this._htrChip(r)}${this._devChip(r)}</div>
      <div class="cells">
        <div class="cell w1 win ${open.length ? "amber" : ""}"><b>${ic(open.length ? "windowOpen" : "window", 15)}${open.length ? `${open.length} von ${wins.length} offen` : "geschlossen"}</b>${esc(open.length ? open.map((w) => w.attributes.friendly_name || w.entity_id).join(", ") : wins.length + (wins.length === 1 ? " Fenster" : " Fenster"))}</div>
        <div class="cell w2"><b>${cur != null ? num(cur, 1) + " °C" : hv}</b>${t0 ? (cur != null && tgt != null ? `Ziel ${num(tgt, 1)} · ` : "") + hv : "kein Thermostat"}</div>
        <div class="cell plan2">${plan}</div>
        <div class="cell w4"><b>${num(d.min)} Min.</b>~${num(d.gas, 2)} ${unitOf(FUELS[r.fuel || "erdgas"])}</div>
      </div>
      <div class="acts">${adm ? `<button class="ibtn" data-act="opt" data-id="${esc(r.id)}" aria-label="Raumeinstellungen">${ic("sliders", 16)}</button>` : ""}<button class="ibtn" data-act="why" data-id="${esc(r.id)}" aria-label="Warum?">${ic("info", 16)}</button><button class="ibtn" data-act="rep" data-id="${esc(r.id)}" aria-label="Bericht">${ic("chart", 16)}</button>${adm ? `<button class="ibtn" data-act="plan" data-id="${esc(r.id)}" aria-label="Heizplan bearbeiten">${ic("pencil", 16)}</button>` : ""}</div>
      <button class="sw ${r.on ? "on" : ""}" data-act="sw" data-sw="${esc(r.sw)}" aria-label="Fensterregelung umschalten" aria-pressed="${!!r.on}"></button></div>`;
  }
  _groupsHtml(rooms) {
    const groups = (this._cfg.layout.groups || []).filter((g) => g && g.name), edit = this._edit, adm = this._admin();
    const roomBtn = adm ? `<button class="gadd" data-act="oadd">${ic("plus", 18)}Raum hinzufügen</button>` : "";
    const addBtn = (edit && adm ? `<button class="gadd" data-act="gadd">${ic("plus", 18)}Gruppe hinzufügen</button>` : "") + roomBtn;
    if (!groups.length) return this._viewBar() + this._head() + `<div class="rooms ${this._view() === "compact" ? "list" : ""}" data-sort-container="room">${rooms.map((r) => this._rv(r)).join("")}</div>${addBtn}`;
    const used = new Set(groups.flatMap((g) => g.rooms || [])), rest = rooms.filter((r) => !used.has(r.id)), col = this._collapsed();
    const list = groups.map((g) => ({ ...g, members: rooms.filter((r) => (g.rooms || []).includes(r.id)) }));
    if (rest.length) list.push({ id: "_rest", name: "Weitere Räume", icon: "home", members: rest, fixed: true });
    const dot = { green: "#34d399", amber: "#f59e0b", slate: "#7dd3fc", gray: "#94a3b8" };
    const html = list.map((g, gi) => {
      const m = g.members, paused = m.filter((r) => r.mode === "heizung_pausiert").length, min = m.reduce((a, r) => a + (r.sc.day?.min || 0), 0);
      const fs = new Set(m.map((r) => r.fuel || "erdgas")), amount = fs.size === 1 ? `${num(m.reduce((a, r) => a + (r.sc.day?.gas || 0), 0), 2)} ${FUELS[[...fs][0]].label}` : `${num(m.reduce((a, r) => a + (r.sc.day?.kwh || 0), 0), 1)} kWh Wärme`;
      const allOn = m.length > 0 && m.every((r) => r.on), closed = col.has(g.id);
      const stat = m.length ? `${m.length} ${m.length === 1 ? "Raum" : "Räume"} · ${paused ? paused + " pausiert" : "alle aktiv"} · ${num(min)} Min. · ${amount}` : "Noch keine Räume";
      const mv = edit && adm && !g.fixed ? `<button class="gmv up" data-act="gmv" data-g="${esc(g.id)}" data-dir="-1" ${gi === 0 ? "disabled" : ""} aria-label="Gruppe nach oben">${ic("chev", 16)}</button><button class="gmv" data-act="gmv" data-g="${esc(g.id)}" data-dir="1" ${gi >= groups.length - 1 ? "disabled" : ""} aria-label="Gruppe nach unten">${ic("chev", 16)}</button><button class="gedit" data-act="gedit" data-g="${esc(g.id)}" aria-label="Gruppe bearbeiten">${ic("pencil", 16)}</button>` : "";
      const body = !m.length ? "" : closed
        ? `<div class="gmini">${m.map((r) => { const t = (r.thermos || []).map((e) => this._hass.states[e]).filter(Boolean)[0]?.attributes.current_temperature; return `<span class="gm" style="--c:${dot[(MODE[r.mode] || MODE.regelung_aus).c]}"><i></i>${esc(r.name)}${t != null ? `<small>${num(t, 1)} °C</small>` : ""}</span>`; }).join("")}</div>`
        : `<div class="rooms ${this._view() === "compact" ? "list" : ""}" data-sort-container="room">${m.map((r) => this._rv(r)).join("")}</div>`;
      return `<section class="grp ${closed ? "col" : ""}" data-gid="${esc(g.id)}"><div class="gh">
        <span class="gico">${ic(g.icon || "layers", 20)}</span><div class="gn"><b>${esc(g.name)}</b><span>${stat}</span></div>${mv}
        ${m.some((r) => r.sw) ? `<div class="gsw"><span>Fensterregelung</span><button class="sw ${allOn ? "on" : ""}" data-act="gsw" data-g="${esc(g.id)}" aria-label="Fensterregelung der Gruppe ${esc(g.name)} umschalten" aria-pressed="${allOn}"></button></div>` : ""}
        <button class="gtog" data-act="gtog" data-g="${esc(g.id)}" aria-label="Gruppe ein- oder ausklappen" aria-expanded="${!closed}">${ic("chev", 18)}</button></div>${body}</section>`;
    }).join("");
    return this._viewBar() + this._head() + html + addBtn;
  }
  _gActions(a, b) {
    const L = this._cfg.layout; L.groups = L.groups || [];
    if (a === "gtog") { const c = this._collapsed(), id = b.dataset.g; c.has(id) ? c.delete(id) : c.add(id); this._setCollapsed(c); this._render(); }
    else if (a === "gsw") {
      const rooms = this._collect(), g = L.groups.find((x) => x.id === b.dataset.g);
      const ids = g ? g.rooms : rooms.filter((r) => !L.groups.some((x) => x.rooms.includes(r.id))).map((r) => r.id);
      const mem = rooms.filter((r) => ids.includes(r.id) && r.sw), all = mem.every((r) => r.on);
      if (mem.length) this._hass.callService("switch", all ? "turn_off" : "turn_on", { entity_id: mem.map((r) => r.sw) });
    }
    else if (a === "gmv") {
      const i = L.groups.findIndex((x) => x.id === b.dataset.g), j = i + +b.dataset.dir;
      if (i >= 0 && L.groups[j]) { [L.groups[i], L.groups[j]] = [L.groups[j], L.groups[i]]; this._saveLayout(); this._render(); }
    }
    else if (a === "gedit" || a === "gadd") {
      const g = a === "gedit" ? L.groups.find((x) => x.id === b.dataset.g) : null;
      this._modal = { type: "grp", draft: g ? { ...g, rooms: [...g.rooms] } : { id: "g" + Date.now().toString(36).slice(-8), name: "", icon: GROUP_ICONS[0], rooms: [], isNew: true } };
      this._renderModal();
    }
    else if (a === "gpick") { const d = this._modal.draft, id = b.dataset.r; d.rooms = d.rooms.includes(id) ? d.rooms.filter((x) => x !== id) : [...d.rooms, id]; this._renderModal(); }
    else if (a === "gicon") { this._modal.draft.icon = b.dataset.k; this._renderModal(); }
    else if (a === "gsave") {
      const d = this._modal.draft; d.name = (d.name || "").trim();
      if (!d.name) { this._toast("Bitte einen Namen eingeben"); return; }
      L.groups.forEach((x) => (x.rooms = x.rooms.filter((r) => !d.rooms.includes(r))));
      const i = L.groups.findIndex((x) => x.id === d.id), { isNew, ...clean } = d;
      if (i >= 0) L.groups[i] = clean; else L.groups.push(clean);
      this._saveLayout(); this._modal = null; this._renderModal(); this._render();
    }
    else if (a === "gdel") { L.groups = L.groups.filter((x) => x.id !== this._modal.draft.id); this._saveLayout(); this._modal = null; this._renderModal(); this._render(); }
  }

  /* ---------------- Bericht ---------------- */
  _repDays(n = 14) {
    const out = [];
    for (let i = n - 1; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); out.push({ iso: this._isoDay(-i), d, today: i === 0 }); }
    return out;
  }
  _hrOpen(id) { this._modal = { type: "hrep", id, day: this._isoDay(0), loading: true }; this._hrLoad(this._modal); this._renderModal(); }
  async _hrLoad(m) {
    const r = this._collect(true).find((x) => x.id === m.id); if (!r || !r.htr) return;
    const [y, mo, d] = m.day.split("-").map(Number), start = new Date(y, mo - 1, d), end = new Date(Math.min(+new Date(y, mo - 1, d + 1), Date.now()));
    const h = r.htr, p = this._pv(), ids = [h.leistung_sensor || h.entity, p.sensor, (r.thermos || [])[0]].filter(Boolean);
    m.loading = true; m.data = null; m.error = null; const tok = (this._hrTok = (this._hrTok || 0) + 1); m.tok = tok;
    try {
      const res = await this._hass.callWS({ type: "history/history_during_period", start_time: start.toISOString(), end_time: end.toISOString(), entity_ids: ids, include_start_time_state: true, significant_changes_only: false, minimal_response: false, no_attributes: false });
      if (m.tok !== tok) return;
      m.data = this._hrBuild(r, res || {}, start, end);
    } catch (e) { if (m.tok !== tok) return; m.error = "Der Verlauf konnte nicht aus Home Assistant geladen werden."; }
    m.loading = false; if (this._modal === m) this._renderModal();
  }
  _hrBuild(r, res, start, end) {
    const h = r.htr, p = this._pv(), t0 = +start / 1000, last = Math.min(1435, Math.floor((+end - +start) / 60000));
    const ser = (eid) => { let a = {}; return ((res && res[eid]) || []).map((x) => { if (x.a) a = x.a; return { t: ((x.lu ?? x.lc ?? t0) - t0) / 60, s: x.s, a }; }); };
    const at = (list, m) => { let v = null; for (const x of list) { if (x.t <= m) v = x; else break; } return v; };
    const hs = ser(h.leistung_sensor || h.entity), ps = ser(p.sensor), ts = ser((r.thermos || [])[0]), pts = [];
    for (let m = 0; m <= last; m += 5) {
      const hv = at(hs, m); let heat = 0;
      if (hv) { if (h.leistung_sensor) { heat = parseFloat(hv.s); if (!isFinite(heat)) heat = 0; } else if (["on", "heat", "auto", "heat_cool"].includes(hv.s)) { const stp = stepsOf(h), pi = (h.presets || []).indexOf(hv.a && hv.a.preset_mode); heat = pi >= 0 && stp[pi] ? stp[pi] : stp[0] || Number(h.watt) || 0; } else heat = 0; }
      const pv = at(ps, m); let ex = pv ? parseFloat(pv.s) : 0; if (!isFinite(ex)) ex = 0; if (p.sign === "import") ex = -ex;
      const tv = at(ts, m), temp = tv && tv.a && tv.a.current_temperature != null ? Number(tv.a.current_temperature) : null;
      pts.push({ t: m, heat, pv: Math.max(0, ex) + heat, temp });
    }
    let kwh = 0, pvk = 0, mins = 0; const ev = []; let prev = 0;
    for (const q of pts) {
      kwh += (q.heat * 5) / 60000; pvk += (Math.min(q.heat, q.pv) * 5) / 60000; if (q.heat > 0) mins += 5;
      if (q.heat > 0 && prev === 0) ev.push({ t: q.t, c: "#34d399", x: "Heizer an", y: `Überschuss ${wfmt(q.pv)}${stepsOf(h).length > 1 ? " · Stufe " + (stepsOf(h).indexOf(q.heat) + 1) : ""}${h.thermo_aus ? " · Thermostat aus" : ""}` });
      if (q.heat === 0 && prev > 0) ev.push({ t: q.t, c: "#94a3b8", x: "Heizer aus", y: q.temp != null && q.temp >= (Number(h.ziel) || 99) - 0.3 ? `Zieltemperatur ${num(h.ziel, 1)} °C erreicht` : "Überschuss zu gering" }); if (h.thermo_aus && q.heat === 0 && prev > 0) ev[ev.length - 1].y += " · Thermostat regelt wieder";
      if (q.heat > 0 && prev > 0 && q.heat !== prev) ev.push({ t: q.t, c: q.heat > prev ? "#fbbf24" : "#fb923c", x: q.heat > prev ? "Stufe erhöht" : "Stufe verringert", y: `${wfmt(prev)} → ${wfmt(q.heat)} bei ${wfmt(q.pv)} Überschuss` });
      prev = q.heat;
    }
    return { steps: stepsOf(h), pts, kwh, pvk, mins, ev, hasT: pts.some((q) => q.temp != null) };
  }
  _hrChart(d) {
    const cw = this.clientWidth || 390, avail = cw >= 720 ? Math.min(780, cw * 0.94) : cw, W = Math.max(300, Math.min(748, Math.floor(avail - 32))), H = W < 500 ? 240 : 280, L = 42, R = d.hasT ? 34 : 10, T = 12, B = 26, iw = W - L - R, ih = H - T - B;
    const wmax = Math.max(1000, Math.ceil(Math.max(...d.pts.map((q) => Math.max(q.pv, q.heat))) / 1000) * 1000);
    const tv = d.pts.map((q) => q.temp).filter((v) => v != null), tlo = tv.length ? Math.floor(Math.min(...tv) - 1) : 0, thi = tv.length ? Math.ceil(Math.max(...tv) + 1) : 1;
    const x = (m) => L + (iw * m) / 1440, y = (w) => T + ih * (1 - w / wmax), yt = (t) => T + ih * (1 - (t - tlo) / (thi - tlo));
    this._hrGeo = { W, x, L, iw };
    let s = `<svg class="hchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="PV-Überschuss und Heizerleistung">`;
    for (let i = 0; i <= 4; i++) { const w = (wmax * i) / 4; s += `<line x1="${L}" x2="${W - R}" y1="${y(w)}" y2="${y(w)}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${L - 6}" y="${y(w) + 4}" text-anchor="end" font-size="10.5" fill="var(--mut)">${w >= 1000 ? num(w / 1000, 1) + " kW" : w + " W"}</text>`; }
    for (const hh of [0, 6, 12, 18, 24]) s += `<line x1="${x(hh * 60)}" x2="${x(hh * 60)}" y1="${T}" y2="${T + ih}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${x(hh * 60)}" y="${H - 8}" text-anchor="${hh === 0 ? "start" : hh === 24 ? "end" : "middle"}" font-size="10.5" fill="var(--mut)">${String(hh).padStart(2, "0")}:00</text>`;
    const a = d.pts[0], z = d.pts[d.pts.length - 1], dx = x(5) - x(0);
    for (const w of d.steps || []) if (w <= wmax) s += `<line x1="${L}" x2="${W - R}" y1="${y(w)}" y2="${y(w)}" stroke="var(--teal)" stroke-width="1" stroke-dasharray="2 3" opacity=".55"/>`;
    s += `<path d="${d.pts.map((q, i) => `${i ? "L" : "M"}${x(q.t).toFixed(1)} ${y(q.pv).toFixed(1)}`).join(" ")} L${x(z.t)} ${T + ih} L${x(a.t)} ${T + ih} Z" fill="#fbbf24" opacity=".2"/><path d="${d.pts.map((q, i) => `${i ? "L" : "M"}${x(q.t).toFixed(1)} ${y(q.pv).toFixed(1)}`).join(" ")}" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linejoin="round"/>`;
    for (const q of d.pts) if (q.heat > 0) s += `<rect x="${x(q.t).toFixed(1)}" y="${y(q.heat).toFixed(1)}" width="${(dx + 0.6).toFixed(1)}" height="${(T + ih - y(q.heat)).toFixed(1)}" fill="var(--teal)" opacity=".62"/>`;
    if (tv.length) {
      s += `<path d="${d.pts.filter((q) => q.temp != null).map((q, i) => `${i ? "L" : "M"}${x(q.t).toFixed(1)} ${yt(q.temp).toFixed(1)}`).join(" ")}" fill="none" stroke="#7dd3fc" stroke-width="1.8" stroke-dasharray="5 4"/>`;
      for (let t = Math.ceil(tlo / 2) * 2; t <= thi; t += 2) s += `<text x="${W - R + 5}" y="${yt(t) + 4}" font-size="10.5" fill="#7dd3fc">${t}°</text>`;
    }
    s += `<line id="hxl" x1="0" x2="0" y1="${T}" y2="${T + ih}" stroke="var(--mut)" opacity=".7"/></svg>`;
    return s;
  }
  _hrHover(min) {
    const d = this._hrData; if (!d || !d.pts.length || !this._hrGeo) return;
    const sr = this.shadowRoot, p = d.pts.reduce((a, q) => (Math.abs(q.t - min) < Math.abs(a.t - min) ? q : a), d.pts[0]), xl = sr.getElementById("hxl"), out = sr.getElementById("hxr");
    if (xl) { xl.setAttribute("x1", this._hrGeo.x(p.t)); xl.setAttribute("x2", this._hrGeo.x(p.t)); }
    if (out) out.innerHTML = `<b>${String(Math.floor(p.t / 60)).padStart(2, "0")}:${String(p.t % 60).padStart(2, "0")} Uhr</b><span><i style="background:#fbbf24"></i>Überschuss ${wfmt(p.pv)}</span><span><i style="background:var(--teal)"></i>Heizer ${p.heat > 0 ? wfmt(p.heat) : "aus"}</span>${p.temp != null ? `<span><i style="background:#7dd3fc"></i>${num(p.temp, 1)} °C</span>` : ""}`;
  }
  _hrBody(r, m) {
    const h = r.htr; if (!h) return `<div class="mut">Für diesen Raum ist kein Elektroheizer eingerichtet.</div>`;
    const p = this._pv(), vk = h.verlauf || {}, today = this._isoDay(0), days = Array.from({ length: 7 }, (_, i) => this._isoDay(i - 6));
    const kw = (iso) => (iso === today ? Number(h.heute_kwh) || 0 : vk[iso] ? Number(vk[iso][0]) || 0 : 0), mx = Math.max(0.1, ...days.map(kw));
    const chips = days.map((iso) => `<button class="hrd ${iso === m.day ? "sel" : ""}" data-act="hrday" data-d="${iso}" aria-label="${iso}"><span>${new Date(iso + "T12:00:00").toLocaleDateString("de-DE", { weekday: "short" }).slice(0, 2)}</span><i><b style="height:${Math.max(5, (kw(iso) / mx) * 100)}%"></b></i><em>${num(kw(iso), 1)}</em></button>`).join("");
    let body = "";
    if (m.loading) body = `<div class="mut" style="padding:34px 0;text-align:center">Lädt …</div>`;
    else if (m.error) body = `<div class="mut" style="padding:24px 0">${esc(m.error)}</div>`;
    else if (m.data) {
      const d = m.data; this._hrData = d;
      const share = d.kwh > 0 ? Math.round((d.pvk / d.kwh) * 100) : 0, gain = (d.pvk * Math.max(0, this._price() - this._feed())) / 100;
      body = `<div class="hrt"><div style="--a:var(--teal)"><span>${ic("clock", 15)}Laufzeit</span><b>${hmin(d.mins)}</b></div><div style="--a:#fbbf24"><span>${ic("bolt", 15)}Energie</span><b>${num(d.kwh, 1)} <small>kWh</small></b></div><div style="--a:#34d399"><span>${ic("sun", 15)}aus PV</span><b>${share} <small>%</small></b></div><div style="--a:#a78bfa"><span>${ic("flame", 15)}Vorteil</span><b>${num(gain, 2)} <small>€</small></b></div></div>
        <div class="hlg"><span><i style="background:#fbbf24"></i>PV-Überschuss</span><span><i style="background:var(--teal)"></i>Heizer (gestrichelt: Stufen)</span>${d.hasT ? `<span><i style="background:#7dd3fc"></i>Raumtemperatur</span>` : ""}</div>
        <div class="hcw">${this._hrChart(d)}</div><div class="hxr" id="hxr"></div>
        <div class="lsec" style="margin-top:14px">Ereignisse</div>${d.ev.length ? d.ev.map((e) => `<div class="hre"><em>${String(Math.floor(e.t / 60)).padStart(2, "0")}:${String(e.t % 60).padStart(2, "0")}</em><i style="background:${e.c}"></i><div><b>${e.x}</b><span>${e.y}</span></div></div>`).join("") : `<div class="mut sm">An diesem Tag hat der Heizer nicht geheizt.</div>`}
        <div class="mut sm" style="margin-top:10px">Vorteil = PV-Strom statt Netzbezug (${num(this._price(), 2)} ct/kWh${p.price_mode === "entity" && p.price_sensor ? ", aktuell" : ""}) abzüglich entgangener Einspeisevergütung (${num(this._feed(), 2)} ct/kWh${p.feed_mode === "entity" && p.feed_sensor ? ", aktuell" : ""}).</div>`;
    }
    return `<div class="hrds">${chips}</div>${body}`;
  }
  _hrAllBody() {
    const rs = this._htrRooms(), p = this._pv(), today = this._isoDay(0), days = Array.from({ length: 7 }, (_, i) => this._isoDay(i - 6));
    const kw = (r, iso) => (iso === today ? Number(r.htr.heute_kwh) || 0 : r.htr.verlauf && r.htr.verlauf[iso] ? Number(r.htr.verlauf[iso][0]) || 0 : 0);
    const pvd = (r, iso) => (iso === today ? Number(r.htr.heute_pv_kwh) || 0 : r.htr.verlauf && r.htr.verlauf[iso] ? Number(r.htr.verlauf[iso][1]) || 0 : 0);
    const tot = days.map((iso) => rs.reduce((a, r) => a + kw(r, iso), 0)), mx = Math.max(0.1, ...tot);
    const sum = tot.reduce((a, b) => a + b, 0), pvs = days.reduce((a, iso) => a + rs.reduce((b, r) => b + pvd(r, iso), 0), 0), gain = (pvs * Math.max(0, this._price() - this._feed())) / 100;
    const cols = days.map((iso, i) => `<div class="hac"><em>${num(tot[i], 1)}</em><div class="hab">${rs.map((r) => `<b style="height:${(kw(r, iso) / mx) * 100}%;background:${r.color}" title="${esc(r.name)} ${num(kw(r, iso), 1)} kWh"></b>`).join("")}</div><span>${new Date(iso + "T12:00:00").toLocaleDateString("de-DE", { weekday: "short" }).slice(0, 2)}</span></div>`).join("");
    return `<div class="hrt"><div style="--a:#fbbf24"><span>${ic("bolt", 15)}Energie, 7 Tage</span><b>${num(sum, 1)} <small>kWh</small></b></div><div style="--a:#34d399"><span>${ic("sun", 15)}aus PV</span><b>${sum > 0 ? Math.round((pvs / sum) * 100) : 0} <small>%</small></b></div><div style="--a:#a78bfa"><span>${ic("flame", 15)}Vorteil</span><b>${num(gain, 2)} <small>€</small></b></div><div style="--a:var(--teal)"><span>${ic("clock", 15)}Heizer</span><b>${rs.length}</b></div></div>
      <div class="hac-w">${cols}</div><div class="hlg">${rs.map((r) => `<span><i style="background:${r.color}"></i>${esc(r.name)}</span>`).join("")}</div>
      <div class="lsec" style="margin-top:12px">Pro Raum</div>${rs.map((r) => { const k = days.reduce((a, iso) => a + kw(r, iso), 0), pk = days.reduce((a, iso) => a + pvd(r, iso), 0); return `<div class="hre"><i style="background:${r.color}"></i><div style="flex:1"><b>${esc(r.name)}</b><span>${wfmt(r.htr.watt)} · Ziel ${num(r.htr.ziel, 1)} °C</span></div><div style="text-align:right"><b>${num(k, 1)} kWh</b><span>${k > 0 ? Math.round((pk / k) * 100) : 0} % PV</span></div></div>`; }).join("")}`;
  }
  _repOpen(id) { this._modal = { type: "rep", id, day: this._isoDay(0), keepScroll: 99999 }; this._repLoad(this._modal); this._renderModal(); }
  async _repLoad(m) {
    const r = this._collect().find((x) => x.id === m.id); if (!r) return;
    const day = m.day, [y, mo, d] = day.split("-").map(Number), start = new Date(y, mo - 1, d), nextDay = new Date(y, mo - 1, d + 1), end = new Date(Math.min(+nextDay, Date.now()));
    this._repCache = this._repCache || new Map();
    const key = m.id + "|" + day, hit = this._repCache.get(key);
    if (hit && (day !== this._isoDay(0) ? true : Date.now() - hit.at < 60000)) { m.data = hit.data; m.error = null; m.loading = false; return; }
    const tok = (this._repTok = (this._repTok || 0) + 1);
    m.loading = true; m.data = null; m.error = null; m.tok = tok;
    const ids = [...(r.thermos || []), ...(r.windows || []), ...(r.modeEid ? [r.modeEid] : [])];
    try {
      const res = await this._hass.callWS({ type: "history/history_during_period", start_time: start.toISOString(), end_time: end.toISOString(), entity_ids: ids, include_start_time_state: true, significant_changes_only: false, minimal_response: false, no_attributes: false });
      if (m.tok !== tok) return;
      m.data = this._repBuild(r, res || {}, start, end);
      this._repCache.set(key, { at: Date.now(), data: m.data });
    } catch (e) {
      if (m.tok !== tok) return;
      m.error = "Der Verlauf konnte nicht aus Home Assistant geladen werden.";
    }
    m.loading = false;
    if (this._modal === m) this._renderModal();
  }
  _repBuild(r, res, start, end) {
    const t0 = +start / 1000, endMin = Math.max(5, Math.floor((+end - +start) / 60000));
    const ser = (eid) => { let a = {}; return (res[eid] || []).map((x) => { if (x.a) a = x.a; return { t: Math.max(0, ((x.lu ?? x.lc ?? t0) - t0) / 60), s: x.s, a }; }); };
    const at = (list, t) => { let v = null; for (const x of list) { if (x.t <= t) v = x; else break; } return v; };
    const th = (r.thermos || []).map(ser), wins = (r.windows || []).map((e) => ({ e, list: ser(e), name: this._hass.states[e]?.attributes.friendly_name || "Fenster" })), mode = r.modeEid ? ser(r.modeEid) : [];
    const num2 = (v) => (typeof v === "number" ? v : Number(v)), ok = (v) => v != null && v !== "" && Number.isFinite(num2(v));
    const pts = []; let lastTemp = null;
    for (let m = 0; m <= endMin; m += 5) {
      const ts = th.map((l) => at(l, m)).filter(Boolean), cs = ts.map((x) => x.a.current_temperature).filter(ok).map(num2);
      if (cs.length) lastTemp = cs.reduce((a, b) => a + b, 0) / cs.length;
      const md = at(mode, m), paused = !!md && md.s === "heizung_pausiert";
      const tg = ts.filter((x) => x.s !== "off" && x.s !== "unavailable").map((x) => x.a.temperature).filter(ok).map(num2);
      const w = wins.find((x) => at(x.list, m)?.s === "on");
      if (lastTemp != null) pts.push({ t: m, temp: Math.round(lastTemp * 10) / 10, tgt: !paused && tg.length ? tg.reduce((a, b) => a + b, 0) / tg.length : null, paused, open: w ? w.name : null });
    }
    const intervals = (list, on) => { const out = []; let cur = null; for (const x of list) { if (on(x)) { if (!cur) cur = [x.t, endMin]; } else if (cur) { cur[1] = x.t; out.push(cur); cur = null; } } if (cur) out.push(cur); return out; };
    const pauses = intervals(mode, (x) => x.s === "heizung_pausiert").filter(([a, b]) => b > a);
    const opens = []; wins.forEach((w) => intervals(w.list, (x) => x.s === "on").forEach(([a, b]) => b > a && opens.push({ s: a, e: b, name: w.name })));
    opens.sort((a, b) => a.s - b.s);
    const hh = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(Math.floor(m) % 60).padStart(2, "0")}`, ev = [];
    for (const o of opens) {
      ev.push({ t: o.s, c: "#60a5fa", x: `${o.name} geöffnet`, y: "Offenes Fenster erkannt" });
      if (o.e < endMin || !(Date.now() - +end < 90000)) ev.push({ t: o.e, c: "#60a5fa", x: `${o.name} geschlossen`, y: `${Math.round(o.e - o.s)} Min. offen` });
    }
    for (const [a, b] of pauses) { ev.push({ t: a, c: "#f59e0b", x: "Heizung pausiert", y: "wegen offenem Fenster" }); if (b < endMin) ev.push({ t: b, c: "#34d399", x: "Heizung wieder aktiv", y: "Fenster geschlossen" }); }
    let prev = null;
    for (const p of pts) { if (p.tgt != null) { if (prev != null && Math.abs(p.tgt - prev) >= 0.25) ev.push({ t: p.t, c: "var(--teal)", x: `Solltemperatur ${num(p.tgt, 1)} °C`, y: "Heizplan oder Änderung am Thermostat" }); prev = p.tgt; } }
    ev.sort((a, b) => a.t - b.t).forEach((e) => (e.h = hh(e.t)));
    const temps = pts.map((p) => p.temp), pm = pauses.reduce((a, [x, y]) => a + (y - x), 0), openMin = opens.reduce((a, o) => a + (o.e - o.s), 0);
    return { pts, pauses, opens, ev, end: endMin, pm, openMin, kwh: pm / 60 * (r.kw || 0), apk: r.apk || 0.1, fuel: r.fuel || "erdgas",
      avg: temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : 0, min: temps.length ? Math.min(...temps) : 0, max: temps.length ? Math.max(...temps) : 0 };
  }
  _repHover(min) {
    const d = this._repData; if (!d || !d.pts.length) return;
    const sr = this.shadowRoot, g = this._repGeo, p = d.pts.reduce((a, q) => (Math.abs(q.t - min) < Math.abs(a.t - min) ? q : a), d.pts[0]);
    const x = g.x(p.t), y = g.y(p.temp), xl = sr.getElementById("rxl"), c = sr.getElementById("rxc"), tip = sr.getElementById("rtip");
    if (xl) { xl.setAttribute("x1", x); xl.setAttribute("x2", x); }
    if (c) { c.setAttribute("cx", x); c.setAttribute("cy", y); }
    if (!tip) return;
    const hh = `${String(Math.floor(p.t / 60)).padStart(2, "0")}:${String(p.t % 60).padStart(2, "0")}`;
    tip.style.left = Math.min(Math.max(x / g.W * 100, 17), 83) + "%";
    tip.innerHTML = `${hh} Uhr<b>${num(p.temp, 1)} °C</b><div class="st" style="--c:${p.paused ? "#f59e0b" : "#34d399"}"><i></i>${p.paused ? "Heizung pausiert" : p.tgt != null ? "Ziel " + num(p.tgt, 1) + " °C" : "Thermostat aus"}</div>${p.open ? `<div class="wo">${esc(p.open)} offen</div>` : ""}`;
  }
  _repChart(d) {
    const cw = this.clientWidth || 390, avail = cw >= 720 ? Math.min(780, cw * 0.94) : cw, W = Math.max(300, Math.min(748, Math.floor(avail - 32))), H = W < 500 ? 250 : 300, L = 34, R = 10, T = 12, B = 26;
    const iw = W - L - R, ih = H - T - B, vals = d.pts.flatMap((p) => (p.tgt != null ? [p.temp, p.tgt] : [p.temp]));
    let lo = Math.floor(Math.min(...vals) - 1), hi = Math.ceil(Math.max(...vals) + 1); if (hi - lo < 6) { lo -= 2; hi += 2; }
    const x = (m) => L + iw * m / 1440, y = (v) => T + ih * (1 - (v - lo) / (hi - lo));
    this._repGeo = { W, x, y, L, iw };
    let s = `<svg class="rchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Temperaturverlauf"><defs><linearGradient id="rag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--teal)" stop-opacity=".34"/><stop offset="1" stop-color="var(--teal)" stop-opacity="0"/></linearGradient></defs>`;
    for (let v = Math.ceil(lo / 2) * 2; v <= hi; v += 2) s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="var(--mut)">${v}°</text>`;
    for (const h of [0, 6, 12, 18, 24]) s += `<line x1="${x(h * 60)}" x2="${x(h * 60)}" y1="${T}" y2="${T + ih}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${x(h * 60)}" y="${H - 8}" text-anchor="${h === 0 ? "start" : h === 24 ? "end" : "middle"}" font-size="11" fill="var(--mut)">${String(h).padStart(2, "0")}:00</text>`;
    for (const [a, b] of d.pauses) s += `<rect x="${x(a)}" y="${T}" width="${Math.max(2, x(b) - x(a))}" height="${ih}" fill="#f59e0b" opacity=".16"/>`;
    let tp = "", open = false, py = null;
    for (const p of d.pts) {
      if (p.tgt == null) { open = false; py = null; continue; }
      if (!open) { tp += `M${x(p.t).toFixed(1)} ${y(p.tgt).toFixed(1)} `; open = true; }
      else { if (py !== p.tgt) tp += `L${x(p.t).toFixed(1)} ${y(py).toFixed(1)} `; tp += `L${x(p.t).toFixed(1)} ${y(p.tgt).toFixed(1)} `; }
      py = p.tgt;
    }
    if (tp) s += `<path d="${tp}" fill="none" stroke="#7dd3fc" stroke-width="1.8" stroke-dasharray="5 4" opacity=".9"/>`;
    const line = d.pts.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)} ${y(p.temp).toFixed(1)}`).join(" "), last = d.pts[d.pts.length - 1];
    s += `<path d="${line} L${x(last.t)} ${T + ih} L${x(d.pts[0].t)} ${T + ih} Z" fill="url(#rag)"/><path d="${line}" fill="none" stroke="var(--teal)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`;
    for (const o of d.opens) { const p = d.pts.find((q) => q.t >= o.s) || last; s += `<circle cx="${x(o.s)}" cy="${y(p.temp)}" r="5" fill="var(--card)" stroke="#60a5fa" stroke-width="2.4"/>`; }
    s += `<line id="rxl" x1="0" x2="0" y1="${T}" y2="${T + ih}" stroke="var(--mut)" opacity=".7"/><circle id="rxc" r="5.5" cx="0" cy="0" fill="var(--card)" stroke="var(--teal)" stroke-width="2.4"/></svg>`;
    return s;
  }
  _repBody(r, m) {
    const days = this._repDays(), idx = days.findIndex((x) => x.iso === m.day), d = m.data;
    const head = `<div class="rdays">${days.map((x) => `<button class="rd ${x.iso === m.day ? "sel" : ""} ${x.today ? "today" : ""}" data-act="repday" data-d="${x.iso}" aria-label="${x.d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}"><small>${"SMDMDFS"[x.d.getDay()]}</small><b>${x.d.getDate()}</b></button>`).join("")}</div>`;
    const nav = `<div class="rnav"><button class="lnk" data-act="repnav" data-s="-1" ${idx <= 0 ? "disabled style=\"opacity:.4\"" : ""}>‹ Vorheriger Tag</button><button class="lnk" data-act="repnav" data-s="1" ${idx >= days.length - 1 ? "disabled style=\"opacity:.4\"" : ""}>Nächster Tag ›</button></div>`;
    this._repData = null;
    if (m.loading) return head + `<div class="rmsg">Verlauf wird geladen …</div>` + nav;
    if (m.error) return head + `<div class="rmsg">${esc(m.error)}</div>` + nav;
    if (!d || !d.pts.length) return head + `<div class="rmsg">Für diesen Tag liegen keine Verlaufsdaten vor.<br><span class="sm">Der Bericht nutzt den Verlauf (Recorder) von Home Assistant. Er reicht so weit zurück, wie dort Daten aufbewahrt werden.</span></div>` + nav;
    this._repData = d;
    const F = FUELS[d.fuel] || FUELS.erdgas, bar = []; let prev = null;
    for (const p of d.pts) { const k = p.paused ? "p" : "a"; if (prev && prev.k === k) prev.n += 5; else bar.push((prev = { k, n: 5 })); }
    return head + `<div class="rtiles">
        <div class="tile" style="--a:var(--teal)"><div class="t">${ic("thermo", 15)}Ø Temperatur</div><div class="v">${num(d.avg, 1)}<small>°C</small></div><div class="g">${num(d.min, 1)} – ${num(d.max, 1)} °C</div></div>
        <div class="tile" style="--a:#f59e0b"><div class="t">${ic("radiator", 15)}Pausiert</div><div class="v">${num(d.pm)}<small>Min.</small></div><div class="g">${ic("flame", 13)}~${num(d.kwh * d.apk, 2)} ${F.label.split(" ")[0]}</div></div>
        <div class="tile" style="--a:#60a5fa"><div class="t">${ic("windowOpen", 15)}Fenster offen</div><div class="v">${d.opens.length}<small>×</small></div><div class="g">${num(d.openMin)} Min. gesamt</div></div>
      </div>
      <div class="rleg"><span style="--c:var(--teal)"><i></i>Temperatur</span><span style="--c:#7dd3fc"><i class="d"></i>Ziel (Thermostat)</span><span style="--c:#f59e0b"><i class="b"></i>Heizung pausiert</span><span style="--c:#60a5fa"><i class="o"></i>Fenster geöffnet</span></div>
      <div class="rwrap" id="rwrap">${this._repChart(d)}<div class="rtip" id="rtip"></div></div>
      <div class="rbar" aria-hidden="true">${bar.map((b) => `<i style="width:${b.n / 1440 * 100}%;background:${b.k === "p" ? "#f59e0b" : "#34d399"}"></i>`).join("")}</div>
      <div class="rleg" style="margin:6px 0 0"><span style="--c:#34d399"><i class="b" style="background:#34d399"></i>Heizung aktiv</span><span style="--c:#f59e0b"><i class="b" style="background:#f59e0b"></i>pausiert wegen Fenster</span></div>
      <div class="mut sm" style="margin:14px 0 2px"><b style="color:var(--primary-text-color)">Ereignisse</b></div>
      <div class="rev">${d.ev.length ? d.ev.map((e) => `<div style="--c:${e.c}"><time>${e.h}</time><i></i><span>${esc(e.x)}<small>${esc(e.y)}</small></span></div>`).join("") : `<div style="--c:var(--line)"><time></time><i></i><span>Keine Ereignisse an diesem Tag</span></div>`}</div>` + nav;
  }

  _isoDay(add = 0) { const d = new Date(); d.setDate(d.getDate() + add); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
  _savePresence() {
    this._hass.callWS({ type: "fenster_heizung/set_presence", presence: this._cfg.presence })
      .then((r) => { this._cfg.presence = r; this._render(); })
      .catch(() => this._toast("Anwesenheit konnte nicht gespeichert werden"));
  }
  _presenceCard() {
    const p = this._pres(), h = this._hass, adm = this._admin();
    const persons = this._ortPersons().filter((x) => !p.persons.length || p.persons.includes(x.id)), zn = this._ort().own ? this._ort().zone : null;
    const days = p.to ? Math.max(0, Math.ceil((new Date(p.to + "T23:59:59") - new Date()) / 864e5)) : 0;
    const stat = p.mode === "vacation" && p.effective === "home"
      ? `<b>Urlaub geplant:</b> ${this._fmtD(p.from)} bis ${this._fmtD(p.to)} · Absenkung ${num(p.temp, 1)} °C`
      : p.mode === "vacation"
        ? `<b>Urlaub bis ${this._fmtD(p.to)}</b> (noch ${days} Tage) · Absenkung ${num(p.temp, 1)} °C${p.preheat ? ` · Vorheizen am Rückkehrtag ab ${p.preheat_time} Uhr` : ""}`
        : p.mode === "away" ? `<b>Abwesend:</b> Räume auf ${num(p.temp, 1)} °C abgesenkt. ${p.origin === "auto" ? "Bei Rückkehr einer Person" : "Nach dem Umschalten auf „Zu Hause“"} gilt wieder der Heizplan.`
        : `<b>Zu Hause:</b> Alle Heizpläne laufen normal.${p.auto ? " Automatisch abwesend, wenn alle Personen " + p.away_after + " Min. unterwegs sind." : ""}`;
    return `<div class="card pres"><h2>${ic("home", 18)}Anwesenheit &amp; Urlaub</h2>
      <div class="seg3">${[["home", "home", "Zu Hause"], ["away", "door", "Abwesend"], ["vacation", "suitcase", "Urlaub"]].map(([k, i, l]) => `<button class="${p.mode === k ? "sel" : ""}" data-act="pm" data-k="${k}" ${adm ? "" : "disabled"}>${ic(i, 22)}${l}</button>`).join("")}</div>
      <div class="pstat">${stat}</div>
      ${persons.length ? `<div class="pers">${persons.map((s) => `<span class="per ${s.home ? "home" : ""}"><i></i>${esc(s.name)} · ${s.unavailable && !s.tr.length ? "keine Ortung" : s.home ? "zu Hause" : s.dist != null ? "unterwegs, " + this._ortFmtD(s.dist) : "unterwegs"}</span>`).join("")}</div>${zn ? `<div class="mut sm" style="margin-top:6px">Home-Zone ${zn.r} m · ${persons.filter((x) => x.home).length} von ${persons.length} zu Hause</div>` : ""}` : ""}
      ${adm ? `<div class="plnk"><button class="lnk" data-act="vac">${ic("suitcase", 16)}Urlaub planen</button><button class="lnk" data-act="pset">${ic("sliders", 16)}Einstellungen</button><button class="lnk" data-act="ortopen">${ic("pin", 16)}Personen &amp; Standort</button></div>` : ""}</div>`;
  }

  _planBox(r) {
    const p0 = this._cfg.plans[r.id] || { enabled: false, entries: [] }, p = { ...p0, enabled: r.planOn ?? p0.enabled }, pts = points(p.entries), adm = this._admin();
    const btn = adm ? `<button class="ibtn" data-act="plan" data-id="${esc(r.id)}" aria-label="Heizplan bearbeiten">${ic("pencil", 17)}</button>` : "";
    if (!pts.length) return `<div class="plan"><div class="ph"><span class="pt">${ic("plan", 18)}Heizplan</span><span class="pill gray">nicht eingerichtet</span></div>${adm ? `<button class="lnk" data-act="plan" data-id="${esc(r.id)}">${ic("plus", 16)}Heizplan einrichten</button>` : ""}</div>`;
    const now = nowMin(), today = Math.floor(now / 1440), cur = at(pts, now), nx = nextPt(pts, now), nw = nx.w % 10080, nd = Math.floor(nw / 1440);
    const when = nd === today && nx.w > now ? "heute" : nd === (today + 1) % 7 ? "morgen" : DAYS[nd];
    return `<div class="plan ${p.enabled && !this._away() && !this._sum().active ? "" : "off"}"><div class="ph"><span class="pt">${ic("plan", 18)}Heizplan</span><span class="pill ${p.enabled ? "green" : "gray"}">${p.enabled ? "aktiv" : "aus"}</span>${btn}</div>
      <div class="pnow">Jetzt <b>${num(cur, 1)} °C</b> · ab ${when} ${fmtT(nw % 1440)} Uhr <b>${num(nx.t, 1)} °C</b></div>${bar(pts, today, now)}</div>`;
  }

  _ph(r) { const u = (this._cfg.layout.photos || {})[r.id]; return u ? { c: " hph", s: ` style="--ph:url('${esc(u)}')"` } : { c: "", s: "" }; }
  _out() {
    const c = this._wxCfg(), st = this._hass.states, wid = c.entity && st[c.entity] ? c.entity : Object.keys(st).find((k) => k.startsWith("weather."));
    const w = wid ? st[wid] : null, o = c.outdoor ? st[c.outdoor] : null;
    const ov = o && isFinite(parseFloat(o.state)) ? parseFloat(o.state) : null, wv = w && w.attributes.temperature != null ? Number(w.attributes.temperature) : null;
    return { t: ov ?? wv, rh: w && w.attributes.humidity != null ? Number(w.attributes.humidity) : null, w: w ? w.state : null };
  }
  _sum() {
    const g = (this._gen || {}).summer || { mode: "auto", temp: 18, days: 3 }, o = this._out();
    const on = this._st && typeof this._st.summer === "boolean" ? this._st.summer : g.mode === "on" || (g.mode === "auto" && o.t != null && o.t >= Number(g.temp));
    return { ...g, active: on, out: o.t };
  }
  _wxAdj(r) {
    const g = (this._gen || {}).wxadj;
    if (!g || !g.on || (r && r.wxOff) || this._away() || this._sum().active) return null;
    if (this._st && this._st.delta !== undefined) { const d = Number(this._st.delta) || 0; return d ? { d, fr: d > 0, why: this._st.why || "" } : null; }
    const o = this._out(); if (o.t == null) return null;
    if (o.t <= g.frost) return { d: Number(g.up), fr: true, why: `Frost, ${num(o.t, 1)} °C draußen` };
    const sun = o.w === "sunny";
    if (o.t >= g.mild || (sun && o.t >= g.mild - 5)) return { d: -Number(g.down), fr: false, why: `${sun ? "Sonne" : "mild"}, ${num(o.t, 1)} °C draußen` };
    return null;
  }
  _wxaNote(r) {
    const a = this._wxAdj(r); if (!a || !a.d) return "";
    return `<div class="pnote wxa ${a.fr ? "fr" : ""}">${ic(a.fr ? "snow" : "sun", 16)}Wetter-Anpassung: Ziel ${a.d > 0 ? "+" : "−"}${num(Math.abs(a.d), 1)} °C (${a.why})</div>`;
  }
  _learnFor(id) {
    if (this._learn[id] !== undefined) return this._learn[id];
    this._learn[id] = null;
    this._hass.callWS({ type: "fenster_heizung/get_learning", entry_id: id }).then((d) => { this._learn[id] = d || false; if (this._modal && this._modal.type === "rep" && this._modal.id === id) this._renderModal(); }).catch(() => { this._learn[id] = false; });
    return null;
  }
  _learnBox(r) {
    const d = this._learnFor(r.id);
    if (d === null) return "";
    if (!d) return `<div class="learn"><div class="lt">${ic("clock", 16)}Aufheizzeit</div><div class="mut sm">Noch nicht genug Daten. Nach ein paar Aufheizphasen erscheint hier die gelernte Zeit.</div></div>`;
    const fmt = (h) => { const m = Math.round(h * 60); return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")} Min.` : `${m} Min.`; };
    const t = fmt(4 / d.rate), mx = Math.max(...d.bands.map((b) => b.min_per_k));
    return `<div class="learn"><div class="lt">${ic("clock", 16)}Aufheizzeit<em>gelernt aus ${d.days} Tagen · ${d.samples} Aufheizphasen</em></div>
      <div class="lbig"><b>${t}</b><span>von 17 auf 21 °C, etwa ${num(d.rate, 1)} K pro Stunde</span></div>
      ${d.bands.map((b) => `<div class="lrow"><span>${esc(b.label)}</span><div class="lbar"><i style="width:${Math.round((b.min_per_k / mx) * 100)}%"></i></div><b>${b.min_per_k} Min./K</b><small>${b.n}×</small></div>`).join("")}
      <div class="lhint">${ic("info", 14)}Tipp: Lege Heizplan-Einträge etwa ${t} früher, damit der Raum pünktlich warm ist. Bei Frost dauert es länger.</div></div>`;
  }
  _airData(r) {
    const h = this._hass, he = !r.airOff && r.humEid && h.states[r.humEid]; if (!he) return null;
    const rh = parseFloat(he.state), t0 = (r.thermos || []).map((e) => h.states[e]).filter(Boolean)[0], t = t0 && t0.attributes.current_temperature;
    if (!isFinite(rh) || t == null) return null;
    const o = this._out(), c = airCalc(Number(t), rh, o.t, o.rh);
    const open = (r.windows || []).map((e) => h.states[e]).filter((w) => w && ["on", "open"].includes(w.state));
    const since = open.length ? Math.min(...open.map((w) => new Date(w.last_changed || Date.now()).getTime())) : 0;
    return { rh, t: Number(t), ...c, o, open: open.length, since, need: ventMin(o.t) };
  }
  _airMsg(a) {
    if (a.open) { const c = cdown(a.since, a.need); return `<div class="airmsg ${c.left <= 0 ? "done" : "green"}" data-since="${a.since}" data-need="${a.need}">${ic("windy", 16)}<div><b>Lüften läuft</b> · <span data-cd>${c.txt}</span><div class="pr"><i data-bar style="width:${c.pct}%"></i></div></div></div>`; }
    const dry = a.dry ? "" : " Draußen ist die Luft gerade feuchter, Lüften bringt wenig. Besser etwas wärmer heizen oder entfeuchten.";
    if (a.lvl === 2) return `<div class="airmsg red">${ic("alert", 16)}<div><b>Schimmelgefahr an kalten Wänden</b> (ca. ${num(a.rs)} % Wandfeuchte). ${a.dry ? `Jetzt ca. ${a.need} Min. stoßlüften und Möbel von Außenwänden abrücken.` : dry.trim()}</div></div>`;
    if (a.lvl === 1 || a.rh >= 60) return `<div class="airmsg amber">${ic("drop", 16)}<div><b>Luft ist feucht</b>${a.dry ? `: bald ca. ${a.need} Min. stoßlüften.` : "."}${a.dry ? "" : dry}</div></div>`;
    return `<div class="airmsg green">${ic("check", 16)}<div><b>Raumluft in Ordnung</b>, kein Lüftungsbedarf.</div></div>`;
  }
  _airBox(r) {
    const a = this._airData(r); if (!a) return this._airLiteBox(r);
    const [ml, mc] = MOLD[a.lvl], hc = a.rh >= 70 ? "red" : a.rh >= 60 ? "amber" : "green";
    return `<div class="air"><div class="ac ${hc}"><div class="t">${ic("drop", 13)}Luftfeuchte</div><div class="v">${num(a.rh)} %</div><div class="gauge"><i style="width:${Math.min(100, a.rh)}%"></i></div></div>
      <div class="ac slate"><div class="t">${ic("thermo", 13)}Taupunkt</div><div class="v">${num(a.td, 1)} °C</div><div class="s">Wand ${num(a.ts, 1)} °C</div></div>
      <div class="ac ${mc}"><div class="t">${ic("alert", 13)}Schimmel</div><div class="v">${ml}</div><div class="s">${num(a.rs)} % Wand</div></div></div>${this._airMsg(a)}`;
  }
  _rate(k) {
    const p = this._pv();
    if (p[k + "_mode"] === "entity" && p[k + "_sensor"]) {
      const s = this._hass.states[p[k + "_sensor"]], v = s ? parseFloat(String(s.state).replace(",", ".")) : NaN;
      if (isFinite(v) && v >= 0) {
        const u = String((s.attributes || {}).unit_of_measurement || "").toLowerCase();
        return /ct|cent/.test(u) ? v : /€|eur/.test(u) || v < 5 ? v * 100 : v;
      }
    }
    return Number(p[k]) || 0;
  }
  _price() { return this._rate("price"); }
  _feed() { return this._rate("feed"); }
  _pv() { return { ...PVDEF, ...((this._gen || {}).pv || {}) }; }
  _htrRooms() { return this._collect(true).filter((r) => r.htr).sort((a, b) => (a.htr.prio || 9) - (b.htr.prio || 9)); }
  _htrTotal() { return this._htrRooms().reduce((a, r) => a + (Number(r.htr.watt_now) || 0), 0); }
  _pvNow() {
    const p = this._pv(), st = p.sensor && this._hass.states[p.sensor]; if (!st) return null;
    let v = parseFloat(st.state); if (!isFinite(v)) return null;
    if (st.attributes.unit_of_measurement === "kW") v *= 1000;
    if (p.sign === "import") v = -v;
    return Math.max(0, v) + this._htrTotal();   // Leistung der Heizer wird hinzugerechnet
  }
  _soc() { const p = this._pv(), st = p.soc_sensor && this._hass.states[p.soc_sensor], v = st && parseFloat(st.state); return isFinite(v) ? v : null; }
  _pvChip() { if (!this._htrRooms().length) return ""; const w = this._pvNow(); return w == null ? "" : `<span class="chip">${ic("bolt", 16)}PV-Überschuss ${wfmt(w)}</span>`; }
  _htrBox(r) {
    const h = r.htr; if (!h) return "";
    const [lab, c] = HTR[h.status] || HTR.aus, on = h.status === "pv", share = h.heute_kwh > 0 ? Math.round((h.heute_pv_kwh / h.heute_kwh) * 100) : null;
    return `<div class="htr ${c}"><div class="htrh"><span class="htri">${ic("bolt", 18)}</span><div class="htrt"><b>Elektroheizer</b><span>${on ? (stepsOf(h).length > 1 ? `Stufe ${h.stufe} von ${stepsOf(h).length} · ` : "Heizt mit PV-Überschuss · ") + wfmt(h.watt_now) : lab}</span></div>
      <button class="why" data-act="hrep" data-id="${esc(r.id)}" aria-label="Heizer-Bericht">${ic("chart", 13)}Bericht</button>${r.htrSw ? `<button class="sw ${r.htrOn ? "on" : ""}" data-act="sw" data-sw="${esc(r.htrSw)}" aria-pressed="${!!r.htrOn}" aria-label="Elektroheizer ein oder aus"></button>` : ""}</div>
      ${this._stepBar(h)}<div class="htrm"><span>${num(h.heute_kwh, 1)} kWh heute${share != null ? ` · ${share} % PV` : ""}</span><span>${hmin(h.heute_min)} Laufzeit</span><span>Ziel ${num(h.ziel, 1)} °C</span></div>${h.thermo_aus ? (on ? `<div class="htrn">${ic("check", 13)}Thermostat ist aus, solange der Heizer läuft</div>` : `<div class="htrn mut">${ic("clock", 13)}Thermostat regelt, bis der Heizer startet</div>`) : ""}</div>`;
  }
  _presetRows(d, st, row) {
    const e = st[d.htr_entity]; if (!d.htr_entity || !d.htr_entity.startsWith("climate.") || !e) return "";
    const pm = (e.attributes.preset_modes || []).filter((x) => x !== "none"), steps = parseSteps(d.htr_steps).length ? parseSteps(d.htr_steps) : [Number(d.htr_watt) || 0];
    const guess = pm.filter((x) => /^[A-Za-z]*\d+$/.test(x)), cur = (i) => (d.htr_presets && d.htr_presets[i]) || guess[i] || "";
    return `<div class="lsec" style="margin-top:6px">${ic("sliders", 15)}Stufen am Gerät</div>
      <div class="mut sm" style="margin:0 0 6px">Einschalten: Modus Heizen mit der gewählten Voreinstellung. Ausschalten: Modus Aus. Beim Stufenwechsel ändert sich nur die Voreinstellung.</div>
      ${steps.map((w, i) => row(`Stufe ${i + 1} · ${wfmt(w)}`, "", `<select class="osel" data-f="hpre" data-i="${i}"><option value="">– keine –</option>${pm.map((x) => `<option ${cur(i) === x ? "selected" : ""}>${esc(x)}</option>`).join("")}</select>`)).join("")}
      ${row("Zieltemperatur am Gerät", "Das Gerät hat ein eigenes Thermostat (aktuell " + num(e.attributes.temperature, 0) + " °C). Es würde sonst vorzeitig abschalten.", this._seg2(d, "htr_devtemp", [["max", "Auf " + num(e.attributes.max_temp || 35) + " °C"], ["keep", "Unverändert"]]))}`;
  }
  _seg2(d, k, opts) { return `<div class="seg oseg">${opts.map(([v, l]) => `<button class="${d[k] === v ? "sel" : ""}" data-act="oset" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`; }
  _stepScale(h) {
    const st = stepsOf(h), p = this._pv(); let av = this._pvNow(); if (av != null) av = Math.max(0, av - this._htrRooms().filter((x) => x.htr !== h && (x.htr.prio || 9) < (h.prio || 9)).reduce((a, x) => a + (Number(x.htr.watt_now) || 0), 0)); if (av == null || h.status === "warm" || h.status === "aus" || h.status === "zeit") return "";
    const th = st.map((w) => w + p.reserve), max = Math.max(av, th[th.length - 1]) * 1.05, pc = (w) => Math.min(100, (w / max) * 100);
    const i = h.status === "pv" ? (h.stufe || 1) - 1 : -1, auto = h.auto !== "off";
    const up = i >= 0 && th[i + 1] != null ? th[i + 1] : null, hint = !auto ? `Feste Vorgabe: läuft nur auf der höchsten Stufe, ab ${wfmt(th[th.length - 1])}.` : i < 0 ? "" : `Regelt automatisch: ${up != null ? `ab ${wfmt(up)} Stufe ${i + 2}, ` : "höchste Stufe erreicht, "}unter ${wfmt(th[i])} ${i > 0 ? "Stufe " + i : "aus"}.`;
    return `<div class="stsc" aria-label="Überschuss im Verhältnis zu den Stufen"><div class="stbar"><i style="width:${pc(av)}%"></i>${th.map((w, k) => `<u style="left:${pc(w)}%" class="${av >= w ? "ok" : ""}"><b>${k + 1}</b></u>`).join("")}</div><div class="stlb"><span>Für diesen Heizer frei: ${wfmt(av)}</span></div></div>${hint ? `<div class="htrn">${ic("bolt", 13)}${hint}</div>` : ""}`;
  }
  _stepBar(h) {
    const st = stepsOf(h), p = this._pv();
    return `${st.length > 1 ? `<div class="stp">${st.map((w, i) => `<span class="${h.status === "pv" && h.stufe === i + 1 ? "on" : ""}"><b>${i + 1}</b>${wfmt(w)}${h.presets && h.presets[i] ? `<small>${esc(h.presets[i])}</small>` : ""}</span>`).join("")}</div>` : ""}${this._stepScale(h)}${h.status === "wartet" ? `<div class="htrn mut">${ic("bolt", 13)}Startet ab ${wfmt(st[0] + p.reserve)} Überschuss (Stufe 1 plus ${wfmt(p.reserve)} Reserve)</div>` : ""}`;
  }
  _htrChip(r) {
    const h = r.htr; if (!h) return "";
    const [lab, c] = HTR[h.status] || HTR.aus;
    return `<span class="achip ${c}">${ic("bolt", 12)}${h.status === "pv" ? (stepsOf(h).length > 1 ? "Stufe " + h.stufe + " · " : "PV-Heizer ") + wfmt(h.watt_now) : lab}</span>`;
  }
  _pvBlock() {
    const rs = this._htrRooms(); if (!rs.length) return "";
    const p = this._pv(), w = this._pvNow(), tot = this._htrTotal(), soc = this._soc();
    const kwh = rs.reduce((a, r) => a + (Number(r.htr.heute_kwh) || 0), 0), pvk = rs.reduce((a, r) => a + (Number(r.htr.heute_pv_kwh) || 0), 0);
    const share = kwh > 0 ? Math.round((pvk / kwh) * 100) : 0, gain = (pvk * Math.max(0, this._price() - this._feed())) / 100, cap = Math.max(w ?? 0, tot, 1);
    const seg = rs.filter((r) => r.htr.watt_now > 0).map((r) => `<i style="width:${(r.htr.watt_now / cap) * 100}%;background:${r.color}" title="${esc(r.name)} ${wfmt(r.htr.watt_now)}"></i>`).join("");
    return `<div class="card pvb"><div class="pvh"><span class="pt">${ic("bolt", 18)}PV-Heizer</span><button class="lnk" data-act="hrepall">${ic("chart", 15)}Bericht</button></div>
      ${w == null ? `<div class="mut sm">Noch kein PV-Sensor gewählt. Das stellst du unter „Allgemein“ ein.</div>` : `<div class="pvbig"><b>${wfmt(w)}</b><span>PV-Überschuss${soc != null ? ` · Batterie ${num(soc)} %${p.soc_min ? ` (ab ${num(p.soc_min)} % für Heizer)` : ""}` : ""}</span></div>
      <div class="pvbar">${seg}</div><div class="pvlg"><span>${wfmt(tot)} an Heizer verteilt</span><span>${wfmt(Math.max(0, w - tot))} frei</span></div>`}
      <div class="pvrows">${rs.map((r) => { const h = r.htr, [lab, c] = HTR[h.status] || HTR.aus; return `<div class="pvr"><i style="background:${r.color}"></i><b>${esc(r.name)}</b><span class="pill ${c}">${lab}</span><em>${h.watt_now > 0 ? (stepsOf(h).length > 1 ? `St. ${h.stufe}/${stepsOf(h).length} · ` : "") + wfmt(h.watt_now) : "bis " + wfmt(stepsOf(h).slice(-1)[0])}</em></div>`; }).join("")}</div>
      <div class="pvt"><div><b>${num(kwh, 1)} kWh</b><span>Heizer heute</span></div><div><b>${share} %</b><span>aus PV-Überschuss</span></div><div><b>≈ ${num(gain, 2)} €</b><span>Vorteil heute</span></div></div></div>`;
  }
  _airLite(r) {
    if (r.airOff || r.humEid) return null;
    const h = this._hass, t0 = (r.thermos || []).map((e) => h.states[e]).filter(Boolean)[0], t = t0 && t0.attributes.current_temperature;
    if (t == null) return null;
    const o = this._out(), ts = o.t == null ? Number(t) - 4 : o.t + 0.7 * (Number(t) - o.t), crit = Math.min(100, (80 * esat(Number(t))) / esat(ts));
    const wins = (r.windows || []).map((e) => h.states[e]).filter(Boolean), open = wins.filter((w) => ["on", "open"].includes(w.state));
    const since = open.length ? Math.min(...open.map((w) => new Date(w.last_changed || Date.now()).getTime())) : 0;
    const last = open.length ? Date.now() : (r.lastAir || this._airHistFor(r) || 0);
    const hrs = last ? (Date.now() - last) / 3600000 : null, every = r.airEvery == null ? 8 : r.airEvery;
    return { t: Number(t), ts, crit, open: open.length, since, need: ventMin(o.t), hrs, every, due: every > 0 && hrs != null && hrs >= every, estimated: o.t == null };
  }
  _airHistFor(r) {
    const hist = (this._airHist = this._airHist || {}), c = hist[r.id];
    if (c !== undefined) return c;   // gefunden (ms) oder 0 = nichts im Verlauf
    hist[r.id] = 0;
    const ids = r.windows || []; if (!ids.length) return 0;
    const end = new Date(), start = new Date(+end - 9 * 864e5);
    this._hass.callWS({ type: "history/history_during_period", start_time: start.toISOString(), end_time: end.toISOString(), entity_ids: ids, include_start_time_state: true, significant_changes_only: false, minimal_response: true, no_attributes: true }).then((res) => {
      let best = 0;
      for (const id of ids) { let prev = null; for (const x of (res && res[id]) || []) { const on = ["on", "open"].includes(x.s); const t = (x.lu ?? x.lc ?? 0) * 1000; if (prev && !on && t > best) best = t; prev = on; } }
      hist[r.id] = best; if (best) this._render();
    }).catch(() => {});
    return 0;
  }
  _ago(h) { return h == null ? "unbekannt" : h < 1 ? (h * 60 < 2 ? "gerade eben" : `vor ${Math.round(h * 60)} Min.`) : h < 48 ? `vor ${Math.round(h)} Std.` : `vor ${Math.round(h / 24)} Tagen`; }
  _airLiteBox(r) {
    const a = this._airLite(r); if (!a) return "";
    const cc = a.crit < 60 ? "amber" : "slate", adm = this._admin();
    let msg;
    if (a.open) { const c = cdown(a.since, a.need); msg = `<div class="airmsg ${c.left <= 0 ? "done" : "green"}" data-since="${a.since}" data-need="${a.need}">${ic("windy", 16)}<div><b>Lüften läuft</b> · <span data-cd>${c.txt}</span><div class="pr"><i data-bar style="width:${c.pct}%"></i></div></div></div>`; }
    else if (a.due) msg = `<div class="airmsg amber">${ic("windy", 16)}<div><b>Länger nicht gelüftet</b> (${this._ago(a.hrs)}). Jetzt ca. ${a.need} Min. stoßlüften.</div></div>`;
    else if (a.crit < 60) msg = `<div class="airmsg amber">${ic("alert", 16)}<div><b>Kalte Wände:</b> halte die Luftfeuchte unter ${num(Math.floor(a.crit))} %. Ohne Sensor kann die Karte sie nicht messen.</div></div>`;
    else msg = `<div class="airmsg green">${ic("check", 16)}<div><b>Kein Lüftungsbedarf erkannt</b>, zuletzt gelüftet ${this._ago(a.hrs)}</div></div>`;
    return `<div class="air"><div class="ac ${a.due ? "amber" : "green"}"><div class="t">${ic("windy", 13)}Gelüftet</div><div class="v">${a.open ? "jetzt" : a.hrs == null ? "unbekannt" : this._ago(a.hrs).replace("vor ", "")}</div><div class="s">${a.every > 0 ? `Erinnern: ${a.every}&nbsp;Std.` : "ohne Erinnerung"}</div></div>
      <div class="ac slate"><div class="t">${ic("thermo", 13)}Wand</div><div class="v">${num(a.ts, 1)}&nbsp;°C</div><div class="s">${a.estimated ? "grob geschätzt" : "Außenwand"}</div></div>
      <div class="ac ${cc}"><div class="t">${ic("drop", 13)}Kritisch ab</div><div class="v">${a.crit >= 90 ? "&gt;&nbsp;90" : num(Math.floor(a.crit))}&nbsp;%</div><div class="s">an der Wand</div></div></div>${msg}
      ${adm ? `<button class="lnk" data-act="airsetup" data-id="${esc(r.id)}">${ic("drop", 15)}Luftfeuchte-Sensor wählen für genaue Warnung</button>` : ""}`;
  }
  _airLiteChip(r) {
    const a = this._airLite(r); if (!a) return "";
    if (a.open) { const c = cdown(a.since, a.need); return `<span class="achip green" data-since="${a.since}" data-need="${a.need}">${ic("windy", 12)}<span data-cd>${c.txt}</span></span>`; }
    return `<span class="achip ${a.due ? "amber" : "slate"}">${ic("windy", 12)}Gelüftet ${this._ago(a.hrs)}</span>`;
  }
  _airChip(r) {
    const a = this._airData(r); if (!a) return this._airLiteChip(r);
    if (a.open) { const c = cdown(a.since, a.need); return `<span class="achip green" data-since="${a.since}" data-need="${a.need}">${ic("windy", 12)}<span data-cd>${c.txt}</span></span>`; }
    const [ml, mc] = MOLD[a.lvl]; return `<span class="achip ${mc}">${ic("drop", 12)}${num(a.rh)} % · Schimmel ${ml}</span>`;
  }
  _acc() { const a = this._cfg.layout.accent; return HEX.test(a || "") ? a : DEF_ACC; }
  _applyLook() { const a = this._acc(); this.style.setProperty("--teal", a); this.style.setProperty("--on-acc", onColor(a)); }
  /* ---------------- Kopfkarten-Hintergrund ---------------- */
  _heroCfg() { const h = this._cfg.layout.hero || {}; return { mode: ["time", "season", "weather"].includes(h.mode) ? h.mode : "standard", own: h.own && typeof h.own === "object" ? h.own : {} }; }
  _sunPhase() {
    const s = (this._hass.states || {})["sun.sun"];
    if (s) { const el = Number(s.attributes.elevation); if (isFinite(el)) return el < -4 ? "night" : el <= 8 ? (s.attributes.rising ? "sunrise" : "sunset") : "day"; return s.state === "below_horizon" ? "night" : "day"; }
    const d = new Date(), h = d.getHours() + d.getMinutes() / 60; return h < 5.5 || h >= 21 ? "night" : h < 8 ? "sunrise" : h < 18 ? "day" : "sunset";
  }
  _season() {
    const m = new Date().getMonth(), lat = this._hass.config && Number(this._hass.config.latitude), n = m >= 2 && m <= 4 ? 0 : m >= 5 && m <= 7 ? 1 : m >= 8 && m <= 10 ? 2 : 3, order = ["spring", "summer", "autumn", "winter"];
    return order[isFinite(lat) && lat < 0 ? (n + 2) % 4 : n];
  }
  _wxSlot() {
    const c = this._wxCfg(), st = this._hass.states, wid = c.entity && st[c.entity] ? c.entity : Object.keys(st).find((k) => k.startsWith("weather.")), night = this._sunPhase() === "night";
    if (!wid) return night ? "clear-night" : "sunny";
    const map = { sunny: "sunny", "clear-night": "clear-night", partlycloudy: "partlycloudy", cloudy: "cloudy", rainy: "rainy", pouring: "pouring", snowy: "snowy", "snowy-rainy": "snowy", hail: "snowy", fog: "fog", lightning: "lightning", "lightning-rainy": "lightning", windy: "cloudy", "windy-variant": "cloudy", exceptional: "cloudy" };
    let k = map[st[wid].state] || "cloudy"; if (k === "sunny" && night) k = "clear-night"; if (k === "clear-night" && !night) k = "sunny"; return k;
  }
  _heroSlot(mode) { return mode === "time" ? this._sunPhase() : mode === "season" ? this._season() : this._wxSlot(); }
  _heroBg() {
    const c = this._heroCfg(); if (c.mode === "standard") return "";
    const slot = this._heroSlot(c.mode), own = c.own[c.mode + ":" + slot];
    return own && /^data:image\//.test(own) ? `<div class="hbg hph" style="background-image:url('${esc(own)}')"></div>` : this._heroSvg(c.mode, slot, "h", this._sunPhase() === "night");
  }
  _heroSvg(mode, slot, p, night) {
    night = !!night && mode === "weather" && slot !== "clear-night";
    let seed = 11; const R = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296, f = (n) => Math.round(n * 10) / 10;
    const mix = (hex, t) => { const a = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)), b = [5, 10, 28]; return "#" + a.map((v, i) => Math.round(v * (1 - t) + b[i] * t).toString(16).padStart(2, "0")).join(""); };
    const grad = (st) => `<defs><linearGradient id="${p}g" x1="0" y1="0" x2="0" y2="1">${st.map(([o, col]) => `<stop offset="${o}" stop-color="${night ? mix(col, 0.62) : col}"/>`).join("")}</linearGradient></defs><rect width="400" height="200" fill="url(#${p}g)"/>`;
    const stars = (n) => Array.from({ length: n }, () => `<circle cx="${f(R() * 400)}" cy="${f(R() * 115)}" r="${f(0.5 + R() * 1)}" fill="#fff" opacity="${f(0.35 + R() * 0.6)}"/>`).join("");
    const hills = (c1, c2, y = 150) => `<path d="M0 ${y}C60 ${y - 30} 120 ${y - 24} 190 ${y - 8}S330 ${y - 34} 400 ${y - 12}V200H0Z" fill="${c1}"/><path d="M0 ${y + 22}C80 ${y + 4} 150 ${y + 12} 230 ${y + 20}S350 ${y + 6} 400 ${y + 16}V200H0Z" fill="${c2}"/>`;
    const sun = (x, y, r, col, glow) => `<circle cx="${x}" cy="${y}" r="${r * 2.6}" fill="${glow}" opacity=".18"/><circle cx="${x}" cy="${y}" r="${r * 1.7}" fill="${glow}" opacity=".3"/><circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`;
    const moon = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r * 2.4}" fill="#cfd8ff" opacity=".12"/><mask id="${p}m"><rect width="400" height="200" fill="#fff"/><circle cx="${x + r * 0.5}" cy="${y - r * 0.25}" r="${r * 0.92}" fill="#000"/></mask><circle cx="${x}" cy="${y}" r="${r}" fill="#f4f1d8" mask="url(#${p}m)"/>`;
    const cloud = (x, y, s, op, col) => `<g opacity="${op}" fill="${col}" transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="36" ry="12"/><ellipse cx="-17" cy="-9" rx="19" ry="13"/><ellipse cx="11" cy="-14" rx="23" ry="16"/></g>`;
    const rain = (n, len, op) => Array.from({ length: n }, () => { const x = f(R() * 420), y = f(R() * 190); return `<path d="M${x} ${y}l-4 ${len}" stroke="#cfe6ff" stroke-width="1.2" opacity="${op}" stroke-linecap="round"/>`; }).join("");
    const snow = (n, c) => Array.from({ length: n }, () => `<circle cx="${f(R() * 400)}" cy="${f(R() * 190)}" r="${f(0.8 + R() * 1.9)}" fill="${c || "#fff"}" opacity="${f(0.5 + R() * 0.5)}"/>`).join("");
    const fog = () => [40, 78, 112, 146].map((y, i) => `<rect x="${i % 2 ? -30 : 20}" y="${y}" width="420" height="22" rx="11" fill="#e8eef2" opacity="${f(0.16 + i * 0.05)}"/>`).join("");
    const leaves = (n) => Array.from({ length: n }, () => `<ellipse cx="${f(R() * 400)}" cy="${f(R() * 190)}" rx="${f(3 + R() * 3)}" ry="${f(1.8 + R() * 1.6)}" fill="${["#e0451f", "#f08a1f", "#f4c430", "#b5471d"][Math.floor(R() * 4)]}" opacity=".85" transform="rotate(${Math.round(R() * 180)} ${f(R() * 400)} ${f(R() * 190)})"/>`).join("");
    const petals = (n) => Array.from({ length: n }, () => `<circle cx="${f(R() * 400)}" cy="${f(R() * 190)}" r="${f(1.6 + R() * 2)}" fill="${["#ffd1e3", "#fff", "#ffb6d2"][Math.floor(R() * 3)]}" opacity=".85"/>`).join("");
    const bolt = (x, y) => `<polygon points="${x},${y} ${x - 14},${y + 34} ${x - 3},${y + 34} ${x - 10},${y + 62} ${x + 16},${y + 24} ${x + 4},${y + 24} ${x + 12},${y}" fill="#fff6b0" opacity=".95"/><polygon points="${x},${y} ${x - 14},${y + 34} ${x - 3},${y + 34} ${x - 10},${y + 62} ${x + 16},${y + 24} ${x + 4},${y + 24} ${x + 12},${y}" fill="#fff6b0" opacity=".25" transform="scale(1.4)" transform-origin="${x} ${y}"/>`;
    const cl = (op, col, pts) => pts.map(([x, y, s]) => cloud(x, y, s, op, col)).join("");
    let b = "";
    if (mode === "time") {
      if (slot === "night") b = grad([[0, "#050a1c"], [0.6, "#14214a"], [1, "#2a2f66"]]) + stars(70) + moon(310, 48, 18) + hills("#0a1230", "#070d24", 160);
      else if (slot === "sunrise") b = grad([[0, "#27255e"], [0.45, "#8a4a86"], [0.75, "#f08a6a"], [1, "#fbd38a"]]) + sun(300, 152, 22, "#fff3c0", "#ffd27a") + hills("#3a2a52", "#241a3c", 152);
      else if (slot === "sunset") b = grad([[0, "#1c2a60"], [0.4, "#75397c"], [0.75, "#e5604b"], [1, "#fbab5c"]]) + sun(110, 152, 24, "#ffe2a0", "#ff9f5a") + hills("#3b2447", "#241634", 152);
      else b = grad([[0, "#1a5aa6"], [0.6, "#3f9ad6"], [1, "#9ad8f0"]]) + sun(320, 44, 20, "#fff7c2", "#fff1a0") + cl(0.7, "#fff", [[90, 56, 1.1], [210, 92, 0.8]]) + hills("#2f7d6a", "#1f5f55", 160);
    } else if (mode === "season") {
      if (slot === "spring") b = grad([[0, "#1b6a7a"], [0.55, "#6fbf9a"], [1, "#d6efb0"]]) + sun(330, 40, 14, "#fffbd0", "#fff2a0") + hills("#4f9a5a", "#3a7d49", 152) + petals(34);
      else if (slot === "summer") b = grad([[0, "#0d5f9a"], [0.5, "#29a8c8"], [1, "#fbe9a0"]]) + sun(318, 42, 24, "#fff4b0", "#ffe27a") + cl(0.55, "#fff", [[100, 60, 0.9]]) + hills("#e1b84a", "#c79a2e", 155);
      else if (slot === "autumn") b = grad([[0, "#2c1a14"], [0.5, "#8e4520"], [1, "#e6903a"]]) + sun(290, 78, 15, "#ffd9a0", "#ff9f5a") + hills("#4b2412", "#33180d", 155) + leaves(34);
      else b = grad([[0, "#0a2240"], [0.55, "#2c5d8c"], [1, "#a9cbe3"]]) + snow(74) + hills("#e8f1f8", "#cfe0ee", 158);
    } else {
      const day = !night;
      if (slot === "clear-night") b = grad([[0, "#050a1c"], [0.6, "#14214a"], [1, "#2a2f66"]]) + stars(70) + moon(310, 48, 18) + hills("#0a1230", "#070d24", 160);
      else if (slot === "sunny") b = grad([[0, "#1a5aa6"], [0.6, "#3f9ad6"], [1, "#9ad8f0"]]) + sun(320, 44, 20, "#fff7c2", "#fff1a0") + hills("#2f7d6a", "#1f5f55", 160);
      else if (slot === "partlycloudy") b = grad([[0, "#2a649f"], [0.6, "#5aa0d0"], [1, "#a9d6ea"]]) + sun(320, 48, 18, "#fff7c2", "#fff1a0") + cl(0.85, "#fff", [[110, 64, 1.2], [250, 96, 1], [330, 74, 0.8]]) + hills("#2f7d6a", "#1f5f55", 162);
      else if (slot === "cloudy") b = grad([[0, "#46566a"], [0.6, "#6f8196"], [1, "#a2b2c2"]]) + cl(0.85, "#d6dee6", [[80, 52, 1.3], [200, 86, 1.5], [320, 56, 1.2], [140, 120, 1.1]]) + hills("#44566a", "#34455a", 166);
      else if (slot === "rainy") b = grad([[0, "#2b3a4f"], [0.6, "#4b5f78"], [1, "#7288a0"]]) + cl(0.9, "#8b9bb0", [[80, 46, 1.4], [210, 70, 1.6], [330, 48, 1.3]]) + rain(60, 14, 0.55) + hills("#2c3b50", "#1f2d40", 168);
      else if (slot === "pouring") b = grad([[0, "#1b2638"], [0.6, "#35465d"], [1, "#586d86"]]) + cl(0.95, "#6f8096", [[70, 44, 1.5], [200, 64, 1.7], [330, 44, 1.4]]) + rain(140, 18, 0.6) + hills("#1d2a3c", "#142030", 170);
      else if (slot === "snowy") b = grad([[0, "#415a74"], [0.6, "#7f9bb5"], [1, "#c4d6e4"]]) + cl(0.8, "#e4ecf3", [[90, 48, 1.3], [250, 74, 1.4]]) + snow(80) + hills("#eef4f9", "#d6e4ef", 164);
      else if (slot === "fog") b = grad([[0, "#5c6b78"], [0.6, "#8a98a4"], [1, "#b9c4cc"]]) + hills("#6f7f8c", "#5f6f7c", 150) + fog();
      else b = grad([[0, "#1c2233"], [0.6, "#323a55"], [1, "#4f5a78"]]) + cl(0.95, "#59627f", [[80, 46, 1.5], [220, 66, 1.7], [330, 44, 1.3]]) + rain(70, 14, 0.4) + bolt(250, 70) + hills("#171d2e", "#101626", 170);
      void day;
    }
    return `<svg class="hbg" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${b}</svg>`;
  }
  _heroPick(inp) {
    const file = inp.files && inp.files[0], key = this._heroTarget; if (!file || !key) return;
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const w = Math.min(900, img.width), h = Math.round(img.height * w / img.width), c = document.createElement("canvas"); c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url);
      let q = 0.72, d = c.toDataURL("image/jpeg", q);
      while (d.length > 150000 && q > 0.3) { q -= 0.08; d = c.toDataURL("image/jpeg", q); }
      if (d.length > 190000) { this._toast("Bild ist zu groß"); return; }
      const hc = this._heroCfg(), own = { ...hc.own, [key]: d };
      if (Object.keys(own).length > 12) { this._toast("Höchstens 12 eigene Hintergründe"); return; }
      this._cfg.layout.hero = { mode: hc.mode, own }; this._saveLayout(); this._render(); this._renderModal();
    };
    img.onerror = () => this._toast("Bild konnte nicht gelesen werden");
    img.src = url;
  }
  _heroLook() {
    const c = this._heroCfg(), slots = HERO_SLOTS[c.mode] || [], act = c.mode === "standard" ? "" : this._heroSlot(c.mode);
    const info = { standard: "Die gewohnte Kopfkarte.", time: "Der Hintergrund folgt dem Sonnenstand (Sonne „sun.sun“, sonst die Uhrzeit): Nacht, Sonnenaufgang, Tag und Sonnenuntergang.", season: "Der Hintergrund folgt der Jahreszeit (meteorologisch, auf der Südhalbkugel umgekehrt).", weather: "Der Hintergrund zeigt das aktuelle Wetter, nachts dunkler. Das Wetter kommt von der Wetter-Entität oben." }[c.mode];
    return `<div class="lsec">${ic("image", 15)}Kopfkarten-Hintergrund</div>
      <div class="seg" style="margin-top:6px">${HERO_MODES.map(([k, l]) => `<button class="${c.mode === k ? "sel" : ""}" data-act="hmode" data-k="${k}">${l}</button>`).join("")}</div>
      <div class="mut sm" style="margin:0 0 8px">${info}</div>
      ${slots.length ? `<div class="hsl">${slots.map(([k, l], i) => { const own = c.own[c.mode + ":" + k], key = c.mode + ":" + k; return `<div class="hsc ${act === k ? "on" : ""}"><div class="hth">${own ? `<div class="hbg hph" style="background-image:url('${esc(own)}')"></div>` : this._heroSvg(c.mode, k, "t" + i, false)}${act === k ? `<em>jetzt</em>` : ""}</div><b>${l}</b><div class="hac"><button class="lnk" data-act="hup" data-k="${key}">${own ? "Ersetzen" : "Eigenes Foto"}</button>${own ? `<button class="lnk dng" data-act="hdel" data-k="${key}">${ic("trash", 13)}</button>` : ""}</div></div>`; }).join("")}</div><input type="file" accept="image/*" data-f="hfile" hidden>
      <div class="mut sm" style="margin:6px 0 8px">Mit „Eigenes Foto“ ersetzt du den Hintergrund für diesen Fall. Das Foto wird verkleinert (ca. 900 px) und für alle Nutzer gespeichert. Höchstens 12 Fotos.</div>` : ""}`;
  }
  _wxCfg() { const w = this._cfg.layout.wx || {}; return { on: w.on !== false, entity: w.entity || "", outdoor: w.outdoor || "" }; }
  _wx() {
    const c = this._wxCfg(); if (!c.on) return "";
    const st = this._hass.states, wid = c.entity && st[c.entity] ? c.entity : Object.keys(st).find((k) => k.startsWith("weather."));
    const w = wid ? st[wid] : null, o = c.outdoor ? st[c.outdoor] : null;
    const ov = o && isFinite(parseFloat(o.state)) ? parseFloat(o.state) : null, wv = w && w.attributes.temperature != null ? Number(w.attributes.temperature) : null;
    const temp = ov ?? wv; if (temp == null && !w) return "";
    const [ico, lab] = w ? (WX[w.state] || ["cloud", w.state]) : ["thermo", "Außentemperatur"];
    const a = w ? w.attributes : {}, unit = (o && o.attributes.unit_of_measurement) || a.temperature_unit || "°C";
    const det = [a.humidity != null ? `${num(Math.round(a.humidity))} % Luftfeuchte` : "", a.wind_speed != null ? `Wind ${num(Math.round(a.wind_speed))} ${a.wind_speed_unit || "km/h"}` : ""].filter(Boolean).join(" · ");
    return `<div class="wx"><span class="wxi">${ic(ico, 28)}</span><div><div class="wxt">${temp != null ? num(temp, 1) : "–"}<small>${esc(unit)} draußen</small></div><div class="wxc">${esc(lab)}</div>${det ? `<div class="wxd">${esc(det)}</div>` : ""}</div></div>`;
  }
  _saveGen() {
    this._hass.callWS({ type: "fenster_heizung/set_general", general: this._gen }).then((r) => {
      if (r && r.general) { this._gen = { ...this._gen, ...r.general }; this._st = r.status || null; this._render(); if (this._modal && (this._modal.type === "gen" || this._modal.type === "fh")) this._renderModal(); }
    }).catch(() => this._toast("Einstellung konnte nicht gespeichert werden"));
  }
  _pollGen() {
    this._hass.callWS({ type: "fenster_heizung/get_general" }).then((r) => {
      if (!r || this._dragging || (this._modal && (this._modal.type === "gen" || this._modal.type === "fh"))) return;
      this._st = r.status || null; this._gen = { ...this._gen, ...(r.general || {}) }; this._render();
    }).catch(() => {});
  }
  async _backup() {
    const rooms = {}, list = this._collect(true);
    for (const r of list) { try { const o = await this._hass.callWS({ type: "fenster_heizung/get_options", entry_id: r.id }); rooms[r.id] = { name: r.name, options: o.options }; } catch (_) { rooms[r.id] = { name: r.name }; } }
    const data = { app: "fenster_heizung", format: 1, version: this._ver, created: new Date().toISOString(), layout: this._cfg.layout, plans: this._cfg.plans, presence: this._cfg.presence, general: this._gen, modules: this._mdBackup().modules, wasser: this._mdBackup().ww, rooms };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })), a = document.createElement("a");
    a.href = url; a.download = `fenster-heizung-sicherung-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
    this._toast(`Sicherung gespeichert (${list.length} ${list.length === 1 ? "Raum" : "Räume"})`);
  }
  async _restore() {
    const d = this._modal && this._modal.restore; if (!d) return;
    let res = null;
    try { res = await this._hass.callWS({ type: "fenster_heizung/restore", data: d }); } catch (e) { this._toast((e && e.message) || "Wiederherstellen fehlgeschlagen"); return; }
    this._modal = null; this._renderModal(); this._learn = {}; await this._load();
    const miss = res && res.missing ? ` · ${res.missing} ${res.missing === 1 ? "Raum" : "Räume"} nicht gefunden` : "";
    this._toast(`Sicherung wiederhergestellt${miss}`);
  }
  _genChange(t) {
    const f = t.dataset && t.dataset.f;
    if (f === "ebk") return this._ebkChange(t);
    if (f === "gwxn") { const v = Number(t.value); this._gen.wxadj = { ...this._gen.wxadj, [t.dataset.k]: isFinite(v) ? v : 0 }; this._saveGen(); this._render(); this._renderModal(); return true; }
    if (f === "gpvs" || f === "gpvb") { this._gen.pv = { ...this._pv(), [f === "gpvs" ? "sensor" : "soc_sensor"]: t.value }; this._saveGen(); this._render(); this._renderModal(); return true; }
    if (f === "gpvp") { this._gen.pv = { ...this._pv(), [t.dataset.p + "_sensor"]: t.value }; this._saveGen(); this._render(); this._renderModal(); return true; }
    if (f === "gpvn") { const v = Number(t.value); this._gen.pv = { ...this._pv(), [t.dataset.k]: isFinite(v) ? Math.min(100, Math.max(0, Math.round(v * 100) / 100)) : 0 }; this._saveGen(); this._render(); this._renderModal(); return true; }
    if (f === "gth") { const v = Math.min(35, Math.max(5, Number(t.value) || 18)); this._gen.summer = { ...this._gen.summer, temp: v }; this._saveGen(); this._render(); this._renderModal(); return true; }
    if (f === "rsfile") {
      const file = t.files && t.files[0]; if (!file) return true;
      file.text().then((txt) => {
        let d; try { d = JSON.parse(txt); } catch (_) { d = null; }
        if (!d || d.app !== "fenster_heizung" || !d.rooms) { this._toast("Das ist keine gültige Sicherung"); return; }
        this._modal = { type: "gen", restore: d }; this._renderModal();
      });
      t.value = ""; return true;
    }
    return false;
  }
  _lookChange(t) {
    if (this._genChange(t)) return;
    const f = t.dataset && t.dataset.f, L = this._cfg.layout, m = this._modal;
    if (!f) return false;
    if (f === "rfile") { this._photoPick(t); return true; }
    if (f === "hfile") { this._heroPick(t); t.value = ""; return true; }
    if (f === "lacc" && HEX.test(t.value)) L.accent = t.value;
    else if (f === "rcolc" && m && HEX.test(t.value)) L.colors = { ...(L.colors || {}), [m.id]: t.value };
    else if (f === "lwxe") L.wx = { ...(L.wx || {}), entity: t.value };
    else if (f === "lwxo") L.wx = { ...(L.wx || {}), outdoor: t.value };
    else return false;
    this._saveLayout(); this._render(); this._renderModal(); return true;
  }
  _photoPick(inp) {
    const file = inp.files && inp.files[0], m = this._modal; if (!file || !m) return;
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const w = Math.min(560, img.width), h = Math.round(img.height * w / img.width), c = document.createElement("canvas"); c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url);
      let q = 0.72, d = c.toDataURL("image/jpeg", q);
      while (d.length > 110000 && q > 0.3) { q -= 0.08; d = c.toDataURL("image/jpeg", q); }
      if (d.length > 140000) { this._toast("Bild ist zu groß"); return; }
      this._cfg.layout.photos = { ...(this._cfg.layout.photos || {}), [m.id]: d };
      this._saveLayout(); this._render(); this._renderModal();
    };
    img.onerror = () => this._toast("Bild konnte nicht gelesen werden");
    img.src = url;
  }
  _room(r) {
    const h = this._hass, m = MODE[r.mode] || MODE.regelung_aus, edit = this._edit;
    const wins = (r.windows || []).map((e) => h.states[e]).filter(Boolean), open = wins.filter((w) => ["on", "open"].includes(w.state));
    const wc = open.length ? "amber" : "green", winName = (w) => w.attributes.friendly_name || w.entity_id;
    const th = (r.thermos || []).map((e) => h.states[e]).filter(Boolean), t0 = th[0], cur = t0?.attributes.current_temperature, tgt = t0?.attributes.temperature;
    const hv = t0 ? (t0.state === "off" ? "aus" : t0.state === "heat" ? "heizt" : t0.state === "auto" ? "Automatik" : t0.state) : "–";
    const hc = !t0 ? "gray" : t0.state === "off" ? "slate" : "green";
    const d = r.sc.day || { min: 0, gas: 0, kwh: 0 };
    const icon = edit
      ? `<button class="rico" style="${rcStyle(r.color)}" data-act="icon" data-id="${esc(r.id)}" aria-label="Symbol ändern">${ico(this._icon(r), 32)}<span class="pen">${ic("pencil", 11)}</span></button>`
      : `<div class="rico" style="${rcStyle(r.color)}">${ico(this._icon(r), 32)}</div>`;
    return `<div class="card room${this._ph(r).c}"${this._ph(r).s} data-m="${m.c}" data-sort="room" data-id="${esc(r.id)}"><div class="rh">
      ${edit ? `<span class="grip" data-handle title="Verschieben">${ic("grip", 18)}</span>` : ""}${icon}
      <div class="rn"><b>${esc(r.name)}</b><div class="pl"><span class="pill ${m.c}">${m.t}</span><button class="why" data-act="why" data-id="${esc(r.id)}" aria-label="Warum?">${ic("info", 13)}Warum?</button><button class="why" data-act="rep" data-id="${esc(r.id)}" aria-label="Bericht">${ic("chart", 13)}Bericht</button>${this._devChip(r)}</div></div>
      ${this._admin() ? `<button class="ibtn gear" data-act="opt" data-id="${esc(r.id)}" aria-label="Raumeinstellungen">${ic("sliders", 17)}</button>` : ""}
      <button class="sw ${r.on ? "on" : ""}" data-act="sw" data-sw="${esc(r.sw)}" aria-label="Fensterregelung umschalten" aria-pressed="${!!r.on}"></button></div>
      <div class="two">
        <div class="box ${wc}"><div class="t">${ic(open.length ? "windowOpen" : "window", 18)}Fenster</div>
          <div class="v">${open.length ? `${open.length} von ${wins.length} offen` : "alle geschlossen"}</div>
          <div class="s">${esc(open.length ? open.map(winName).join(", ") : wins.map(winName).join(", ") || "–")}</div></div>
        <div class="box ${hc}"><div class="t">${ic("radiator", 18)}Heizung</div>
          <div class="v">${cur != null ? num(cur, 1) + " °C" : hv}</div>
          <div class="s">${t0 ? (cur != null && tgt != null ? `Ziel ${num(tgt, 1)} °C · ` : "") + hv : "kein Thermostat"}${th.length > 1 ? ` (+${th.length - 1})` : ""}</div></div>
      </div>
      ${this._planBox(r)}${this._wxaNote(r)}${this._away() ? `<div class="pnote">${ic("suitcase", 16)}${this._pres().effective === "vacation" || this._pres().mode === "vacation" ? "Urlaubsmodus" : "Abwesend"}: Absenkung auf ${num(this._pres().temp, 1)} °C, der Heizplan ruht.</div>` : this._sum().active ? `<div class="pnote">${ic("sun", 16)}Sommermodus: Der Heizplan ruht, die Fenstermeldung bleibt aktiv.</div>` : ""}
      ${this._htrBox(r)}${this._airBox(r)}
      <div class="foot"><div class="a"><b>${num(d.min)} Min. pausiert</b><span>${r.pauses || 0}× heute · ~${num(d.gas, 2)} ${FUELS[r.fuel || "erdgas"].label} · ${num(r.kw, 2)} kW</span></div>${this._spark(r)}</div></div>`;
  }

  /* Die Modulleiste behält beim Neuzeichnen ihre Scrollposition. Beim Wechsel des Moduls wird das gewählte Tab in die Mitte geholt. */
  _render() {
    if (this._press || (this._hold && Date.now() < this._hold)) { this._prPend = true; return; }
    const sr0 = this.shadowRoot, ae0 = sr0 && sr0.activeElement;
    /* Läuft gerade eine Eingabe (Uhrzeit, Zahl, Text), wird die Seite nicht neu aufgebaut. Home Assistant meldet laufend neue Werte, das würde das Feld mitten im Tippen wegwerfen. Nach dem Verlassen des Feldes wird nachgezogen. */
    if (ae0 && ae0.tagName === "INPUT" && ["time", "date", "number", "text"].includes(ae0.type) && !ae0.classList.contains("stoq") && sr0.getElementById("main") && sr0.getElementById("main").contains(ae0)) {
      if (this._inHook !== ae0) { this._inHook = ae0; ae0.addEventListener("blur", () => { this._inHook = null; setTimeout(() => this._render(), 0); }, { once: true }); }
      return;
    }
    const bar = sr0 && sr0.querySelector(".mbar"), x = bar ? bar.scrollLeft : null, id = this._mdActive();
    const keep = {}; if (sr0) sr0.querySelectorAll("img[data-keep]").forEach((i) => { keep[i.getAttribute("src")] = i; });  /* Bilder behalten, sonst flackern sie bei jedem Neuaufbau */
    try { this._render0(); if (sr0) sr0.querySelectorAll("img[data-keep]").forEach((i) => { const o = keep[i.getAttribute("src")]; if (o && o !== i) i.replaceWith(o); }); } catch (err) { console.error("fenster_heizung render", err); if (this._toast && Date.now() - (this._errT || 0) > 4000) { this._errT = Date.now(); this._toast("Anzeigefehler: " + (err && err.message || err)); } return; }
    const nb = sr0 && sr0.querySelector(".mbar"); if (!nb) { this._mbId = id; return; }
    if (this._mbId !== id || x == null) {
      const t = nb.querySelector(".mtab.sel"); if (t) nb.scrollLeft = Math.max(0, t.offsetLeft - (nb.clientWidth - t.offsetWidth) / 2);
    } else nb.scrollLeft = x;
    this._mbId = id;
  }
  _render0() {
    if (!this._hass || this._dragging) return;
    const sr = this.shadowRoot;
    if (!this._built) { this._build(); }
    const bg = getComputedStyle(this).backgroundColor.match(/\d+/g) || [15, 20, 25];
    this.style.colorScheme = (0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2]) < 140 ? "dark" : "light";
    this._applyLook();
    if (this._tmOn()) { this._tmRender(); return; }
    if (this._igOpen && this._admin()) { this._igRender(); return; }
    if (this._ortOpen && this._admin()) { this._ortRender(); return; }
    if (this._labOpen && this._admin()) { this._labRender(); return; }
    if (this._stOpen && this._admin()) { this._stRender(); return; }
    if (this._mdActive() !== "fh") { this._mdRender(); return; }
    const rooms = this._collect(), edit = this._edit, adm = this._admin();
    const sum = (sc, k) => rooms.reduce((a, r) => a + (r.sc[sc]?.[k] || 0), 0);
    const paused = rooms.filter((r) => r.mode === "heizung_pausiert").length;
    const fset = new Set(rooms.map((r) => r.fuel || "erdgas")), F = fset.size === 1 ? FUELS[[...fset][0]] : MIXED, mixed = fset.size > 1;
    const amt = (sc) => (mixed ? sum(sc, "kwh") : sum(sc, "gas"));
    const dateStr = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
    const tiles = [["day", "today", "Heute", "var(--teal)"], ["month", "month", "Monat", "#60a5fa"], ["year", "year", "Jahr", "#a78bfa"], ["total", "total", "Gesamt", "#f472b6"]];
    const content = {
      hero: () => `<div class="card hero mh a-fh${this._heroCfg().mode !== "standard" ? " hs" : ""}">${this._heroBg()}${this._modLogo("fh")}
        <div class="lbl">${ic("flame", 16)}Heute ${F.short} gespart (geschätzt)</div>
        <div class="big">${num(amt("day"), 2)}<small>${F.label}</small></div><div class="sub">${esc(dateStr)}</div>${this._wx()}
        <div class="chips">${this._sum().active ? `<span class="chip sum">${ic("sun", 16)}Sommermodus${this._sum().out != null ? ` · ${num(this._sum().out, 1)} °C draußen` : ""}</span>` : ""}${(() => { const a = this._wxAdj(); return a && a.d ? `<span class="chip">${ic(a.fr ? "snow" : "partly", 16)}Wetter-Anpassung ${a.d > 0 ? "+" : "−"}${num(Math.abs(a.d), 1)} °C</span>` : ""; })()}${this._pvChip()}<span class="chip">${ic("clock", 16)}${num(sum("day", "min"))} Min. pausiert</span>
          <span class="chip">${ic("radiator", 16)}${paused} von ${rooms.length} ${rooms.length === 1 ? "Raum" : "Räumen"} pausiert</span>
          <span class="chip">${ic("thermo", 16)}${num(sum("day", "kwh"), 1)} kWh Wärme</span></div></div>`,
      presence: () => this._presenceCard(),
      pv: () => this._pvBlock(),
      tiles: () => `<div class="tiles">${tiles.map(([sc, ico, lab, col]) => `<div class="tile" style="--a:${col}">
        <div class="t">${ic(ico, 17)}${lab}</div><div class="v">${num(sum(sc, "min"))}<small>Min.</small></div>
        <div class="g">${ic("flame", 14)}${num(amt(sc), 2)} ${unitOf(F)}</div></div>`).join("")}</div>`,
      chart: () => `<div class="card"><h2>${ic("clock", 18)}Pausenzeit pro Tag · letzte 14 Tage</h2>${this._chart(rooms)}
        <div class="legend">${[...rooms].sort((a, b) => a.ci - b.ci).map((r) => `<span><i style="background:${r.color}"></i>${esc(r.name)}</span>`).join("")}</div></div>`,
      rooms: () => this._groupsHtml(rooms),
    };
    // Reihenfolge der Räume im Diagramm = Reihenfolge der Farben, deshalb nach Farbe
    const chartRooms = [...rooms].sort((a, b) => a.ci - b.ci);
    content.chart = () => `<div class="card"><h2>${ic("clock", 18)}Pausenzeit pro Tag · letzte 14 Tage</h2>${this._chart(chartRooms)}
        <div class="legend">${chartRooms.map((r) => `<span><i style="background:${r.color}"></i>${esc(r.name)}</span>`).join("")}</div></div>`;
    const blocks = rooms.length ? this._blockOrder().map((id) => (!content[id]() && !edit ? "" : `<section class="blk ${edit ? "editing" : ""}" data-sort="block" data-id="${id}">
        ${edit ? `<div class="etag"><span class="grip" data-handle title="Verschieben">${ic("grip", 18)}</span>${BLOCKS[id]}</div>` : ""}${content[id]()}</section>`)).join("")
      : `<div class="card empty">Noch keine Räume eingerichtet.<br>${adm ? `<button class="btn2 pri" data-act="wz" style="margin-top:14px;flex:none;padding:12px 22px">${ic("tools", 16)} Einrichtungsassistent starten</button>` : "Ein Administrator kann die Einrichtung starten."}</div>`;
    sr.getElementById("main").innerHTML = `
      <div class="bar${this._narrow ? " nar" : ""}">${this._narrow ? `<button class="ib0" data-act="menu" aria-label="Menü">${ic("menu", 24)}</button>` : ""}
        <div class="brand"><img class="blogo" src="${LOGO_URL}" alt="MADDOG3010" draggable="false"><div><em class="pn">${esc(PRODUCT)}</em><b><i class="mn">Modul 1 – </i>Fenster &amp; Heizung</b><span>${this._mvChip("fh")}<em class="tag">Smarte Fenster- und Heizungssteuerung</em>${this._ver ? `<em class="ver">Paket ${esc(this._ver)}</em>` : ""}</span></div></div>
        ${this._tmBtn()}${this._spnBtn()}${this._labBtn()}${this._stoBtn()}${adm ? `<button class="pillbtn" data-act="mdst" aria-label="Einstellungen">${ic("sliders", 16)}<span class="bl">Einstellungen</span></button>` : ""}${adm ? (edit ? `<button class="pillbtn pri" data-act="done">${ic("check", 16)}<span class="bl">Fertig</span></button>` : `<button class="pillbtn" data-act="edit">${ic("pencil", 16)}<span class="bl">Anpassen</span></button>`) : ""}</div>
      ${this._mdBar()}<div class="wrap">${edit ? "" : this._mvPop("fh")}${edit ? `<div class="banner">${ic("grip", 18)}<div>Ziehe Karten und Bereiche an den Griffen, um sie zu verschieben. Tippe auf ein Raumsymbol, um Symbol, Farbe und Foto zu ändern. Unter „Darstellung“ stellst du Akzentfarbe und Wetter ein.</div></div>` : ""}
        ${!edit ? this._updBanner() : ""}${!edit ? this._tmHint() : ""}${!edit ? this._labCards("fh") : ""}${blocks}${rooms.length ? `<div class="note">${mixed ? "Bei gemischten Brennstoffen wird die Ersparnis als Heizenergie in kWh gezeigt. Sie ist eine grobe Schätzung." : "Die " + F.noun + " ist eine grobe Schätzung. Die echte Ersparnis liegt etwas darunter."}</div>` : ""}</div>`;
  }

