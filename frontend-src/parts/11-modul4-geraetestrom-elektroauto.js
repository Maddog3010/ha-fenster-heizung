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
    else if (a === "gsadd") { if (G.devices.length < 8) { G.devices.push({ id: "g" + Date.now().toString(36), name: "", ent: "", thr: 20, end: 5 }); this._mdSave(); this._renderModal(); } }
    else if (a === "gsdel") { G.devices.splice(i, 1); this._pkId = null; this._mdSave(); this._renderModal(); }
    else if (a === "gsnot") { const n = new Set(G.notify); if (n.has(k)) n.delete(k); else n.add(k); G.notify = [...n]; this._mdSave(); this._renderModal(); }
    else if (a === "gsper") { this._gsRange = k; this._render(); }
    else if (a === "gsdev") { this._gsSel = k; this._render(); }
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
      <div class="mut sm" style="margin:2px 0 6px">Je Gerät ein Leistungssensor (Steckdose oder Zähler, in Watt). Ein Durchlauf beginnt über der Startschwelle und endet, wenn die Leistung die eingestellte Zeit darunter bleibt.</div>
      ${G.devices.map((d, i) => `<div class="gsdc"><div class="gsdh"><input class="otxt" type="text" maxlength="30" placeholder="Name, z. B. Waschmaschine" value="${esc(d.name)}" data-f="gsname" data-i="${i}" aria-label="Gerätename"><button class="ibtn" data-act="gsdel" data-i="${i}" aria-label="Gerät entfernen">${ic("trash", 17)}</button></div>
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
  _gsPage() {
    const adm = this._admin(), G = this._gsState();
    this._gsLoad();
    const D = this._gsD, eur = (v) => num(v, 2) + " €";
    if (!G.devices.length) return `<div class="card empty">${ic("laundry", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Noch kein Gerät eingerichtet</div>
      <div class="sm" style="max-width:480px;margin:0 auto 14px">Zeigt pro Gerät (Waschmaschine, Trockner, Spülmaschine …), woher der Strom kommt – Solar, Batterie oder Netz – und was er kostet. Dazu Ersparnis, Durchläufe und eine Startempfehlung.</div>
      <ul class="wwl"><li>${ic("sun", 16)}Anteile Solar, Batterie, Netz pro Gerät</li><li>${ic("chart", 16)}Kosten und Ersparnis: heute, Monat, Jahr, gesamt</li><li>${ic("bell", 16)}Meldung am Ende eines Durchlaufs</li></ul>
      ${adm ? `<button class="btn2 pri" data-act="gsset" style="margin-top:16px;flex:none;padding:12px 22px">${ic("tools", 16)} Gerät hinzufügen</button>` : "Ein Administrator kann das Modul einrichten."}</div>`;
    const warn = !this._gsReady() ? `<div class="banner">${ic("alert", 18)}<div><b>Solar- und Netz-Sensor fehlen.</b> Sie werden in Modul 3 – Energie-Übersicht gewählt. Bis dahin gilt der gesamte Strom als Netzstrom.${adm ? ` <button class="lnk" data-act="mdensetup">Modul 3 öffnen</button>` : ""}</div></div>` : "";
    if (!D) return `${warn}<div class="card empty">Lade Gerätestrom …</div>`;
    const devs = D.devices || [];
    const sum = (f) => devs.reduce((a, d) => a + (f(d) || 0), 0), cols = ["#e9a413", "#13a97b", "#6f78e8"], srcN = ["Solar", "Batterie", "Netz"];
    const per = [["Heute", "day", "today", "#2dd4bf"], ["Monat", "month", "month", "#60a5fa"], ["Jahr", "year", "year", "#a78bfa"], ["Gesamt", "total", "total", "#f472b6"]];
    const tiles = per.map(([t, k, ico, c]) => `<div class="card gstile" style="--c:${c}"><div class="gst"><span class="gsi">${ic(ico, 15)}</span>${t}</div><div class="gsv">${eur(sum((d) => d[k].saved))}</div><div class="mut sm">gespart · Kosten ${eur(sum((d) => d[k].cost))} · ${num(sum((d) => d[k].kwh), 1)} kWh</div></div>`).join("");
    const cards = devs.map((d) => {
      const run = d.running, base = run ? d.w : d.e, tot = base[0] + base[1] + base[2] || 1, adv = d.advice || "", ac = /^Jetzt/.test(adv) ? "green" : /^Teil/.test(adv) ? "amber" : "slate";
      return `<div class="card gsdev"><div class="gsh"><span class="gsi big">${ic("laundry", 20)}</span><b>${esc(d.name)}</b><span class="gsst ${run ? "on" : ""}">${run ? num(d.w[0] + d.w[1] + d.w[2], 0) + " W" : "Aus"}</span></div>
        <div class="gsbar" role="img" aria-label="Anteile Solar, Batterie, Netz">${base.map((v, i) => `<i style="width:${v / tot * 100}%;background:${cols[i]}"></i>`).join("")}</div>
        <div class="gsleg">${srcN.map((t, i) => `<span><i style="background:${cols[i]}"></i><em>${t}</em><b>${run ? num(d.w[i], 0) + " W" : num(d.e[i], 1) + " kWh"}</b></span>`).join("")}</div>
        <div class="gsrows"><div class="gsrow"><span class="mut">Heute</span><b>${eur(d.day.cost)} Kosten</b><em>${eur(d.day.saved)} gespart</em></div>
        <div class="gsrow"><span class="mut">Letzter Durchlauf</span><b>${d.last ? eur(d.last.cost) + " · " + num(d.last.kwh, 2) + " kWh" : "noch keiner"}</b><em>${d.last ? num(d.last.share, 0) + " % Eigenanteil" : ""}</em></div></div>
        ${adv ? `<div class="gsadv ${ac}">${ic("sun", 15)}${esc(adv)} <span class="mut">· Solardeckung ${num(d.cover, 0)} %</span></div>` : ""}</div>`; }).join("");
    return `${warn}<div class="card hero mh hr a-gs gshero">${this._modLogo("gs")}${(() => { const e0 = sum((d) => d.e[0] + d.e[1]), et = sum((d) => d.e[0] + d.e[1] + d.e[2]); return this._modRing(et > 0 ? Math.round(e0 / et * 100) : 0, "Eigenstrom"); })()}<div class="mut" style="opacity:.85">${ic("laundry", 16)} Heute gespart</div><div class="gsbig">${eur(sum((d) => d.day.saved))}</div><div style="opacity:.85">${num(sum((d) => d.day.runs))} ${sum((d) => d.day.runs) === 1 ? "Durchlauf" : "Durchläufe"} heute · ${num(sum((d) => d.day.kwh), 1)} kWh</div></div>
      <div class="gstiles">${tiles}</div><div class="gsgrid">${cards}</div>${this._gsChart(D, devs, cols, srcN)}`;
  }
  _gsChart(D, devs, cols, srcN) {
    const rg = this._gsRange || "7", sel = devs.some((d) => d.id === this._gsSel) ? this._gsSel : "", H = D.hist || {};
    const pick = sel ? [sel] : devs.map((d) => d.id), mon = rg === "12", n = rg === "30" ? 30 : rg === "7" ? 7 : 12;
    const today = new Date(); today.setHours(12, 0, 0, 0);
    const keyOf = (dt) => mon ? dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") : dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") + "-" + String(dt.getDate()).padStart(2, "0");
    const slots = []; for (let i = n - 1; i >= 0; i--) { const dt = new Date(today); if (mon) dt.setMonth(dt.getMonth() - i, 1); else dt.setDate(dt.getDate() - i); slots.push({ k: keyOf(dt), dt, v: [0, 0, 0], c: 0, s: 0 }); }
    const ix = Object.fromEntries(slots.map((s, i) => [s.k, i]));
    pick.forEach((id) => (H[id] || []).forEach((r) => { const i = ix[mon ? r.d.slice(0, 7) : r.d]; if (i == null) return; slots[i].v[0] += r.s; slots[i].v[1] += r.b; slots[i].v[2] += r.g; slots[i].c += r.cost; slots[i].s += r.saved; }));
    const mx = Math.max(...slots.map((s) => s.v[0] + s.v[1] + s.v[2]), 0.1), step = enStep(mx), top = Math.ceil(mx / step) * step, W = 640, Hh = 190, pl = 34, pb = 22, bw = (W - pl) / n, bar = Math.min(bw * 0.62, 34);
    const lab = (s) => mon ? s.dt.toLocaleDateString("de-DE", { month: "short" }) : n > 7 ? String(s.dt.getDate()) : s.dt.toLocaleDateString("de-DE", { weekday: "short" });
    let grid = "", bars = "";
    for (let v = 0; v <= top + 1e-9; v += step) { const y = Hh - pb - (v / top) * (Hh - pb - 8); grid += `<line x1="${pl}" x2="${W}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${pl - 6}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--mut)">${num(v, step < 1 ? 1 : 0)}</text>`; }
    slots.forEach((s, i) => { let y = Hh - pb; const x = pl + i * bw + (bw - bar) / 2; s.v.forEach((v, j) => { const h = (v / top) * (Hh - pb - 8); if (h > 0.4) { y -= h; bars += `<rect x="${x}" y="${y}" width="${bar}" height="${h}" fill="${cols[j]}" rx="3"><title>${srcN[j]} ${num(v, 2)} kWh</title></rect>`; } });
      bars += `<text x="${x + bar / 2}" y="${Hh - 6}" text-anchor="middle" font-size="11" fill="var(--mut)">${esc(lab(s))}</text>`; });
    const totE = slots.reduce((a, s) => a + s.v[0] + s.v[1] + s.v[2], 0), totS = slots.reduce((a, s) => a + s.s, 0), totC = slots.reduce((a, s) => a + s.c, 0);
    const chip = (act, k, t, on) => `<button class="gsch ${on ? "sel" : ""}" data-act="${act}" data-k="${k}" aria-pressed="${on}">${t}</button>`;
    return `<div class="card gsc"><h2>${ic("chart", 18)}Verlauf nach Quelle</h2>
      <div class="gschips">${[["7", "7 Tage"], ["30", "30 Tage"], ["12", "12 Monate"]].map(([k, t]) => chip("gsper", k, t, rg === k)).join("")}</div>
      <div class="gschips">${chip("gsdev", "", "Alle Geräte", !sel)}${devs.map((d) => chip("gsdev", esc(d.id), esc(d.name), sel === d.id)).join("")}</div>
      <svg viewBox="0 0 ${W} ${Hh}" width="100%" role="img" aria-label="Energie nach Quelle in kWh">${grid}${bars}</svg>
      <div class="gsleg" style="margin-top:6px">${srcN.map((t, i) => `<span><i style="background:${cols[i]}"></i>${t}</span>`).join("")}<span class="mut">kWh pro ${mon ? "Monat" : "Tag"}</span></div>
      <div class="mut sm" style="margin:8px 0 0">Zeitraum: ${num(totE, 1)} kWh · Kosten ${num(totC, 2)} € · gespart ${num(totS, 2)} €</div></div>`;
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
