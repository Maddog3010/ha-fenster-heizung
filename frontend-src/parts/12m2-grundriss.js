  /* ================= Modul 0 · Haus & Grundriss (Build 1) =================
     Der Grundriss gehört ab jetzt dem Kern (Speicher fenster_heizung_grundriss, WebSocket gr_get) statt Modul 11. Beim ersten Start wird er
     aus Modul 11 übernommen. Modul 0 zeigt den Plan mit allen Ebenen (Melder aus Modul 11, Lampen aus Modul 18). Modul 1 (Wärmekarte) und
     Modul 18 (Lichtkarte) lesen über _grPlan(). Bearbeitet wird in Build 1 noch im Baukasten von Modul 11 (zieht in Build 3 um). */
  _grS0() { return (this._grS = this._grS || { d: null, ts: 0, busy: false, err: false }); }
  _grLoad(force) {
    const S = this._grS0(), age = Date.now() - S.ts;
    if (!this._hass || S.busy || (!force && S.d && age < 60000) || (!force && S.err && age < 10000)) return;
    S.busy = true;
    this._hass.callWS({ type: "fenster_heizung/gr_get" }).then((r) => { S.d = r || null; S.err = false; })
      .catch(() => { S.err = true; })
      .finally(() => { S.busy = false; S.ts = Date.now(); const a = this._mdActive && this._mdActive(); if (a === "gr" || a === "li" || (a === "fh" && this._view && this._view() === "plan")) this._render(); });
  }
  /* Plan für alle Module: null = lädt, { error: true } = nicht erreichbar, sonst der Plan */
  _grPlan() { this._grLoad(); const S = this._grS0(); return S.d ? S.d.plan : S.err ? { error: true } : null; }
  _grRaw() { const S = this._grS0(); return S.d && S.d.plan ? S.d.plan : null; }
  _grDirty() { if (this._grS) { this._grS.ts = 0; this._grS.d = this._grS.d && { ...this._grS.d }; } this._grLoad(true); }
  _grFloors(P) { return P && P.floors && P.floors.length ? P.floors : [{ id: "eg", n: "EG" }]; }
  /* Banner: Haus im Schnitt, eine Reihe je Etage (oben die höchste), Zellen = Räume der Etage */
  _grHouse(P) {
    const fls = this._grFloors(P).slice().reverse().slice(0, 3), W = 200, X0 = 24, H0 = 46, rowH = Math.max(22, Math.min(34, 90 / fls.length)), H = fls.length * rowH;
    let s = `<svg class="grhs" viewBox="0 0 248 ${H0 + H + 14}" aria-hidden="true"><polygon points="${X0 - 8},${H0} ${X0 + W / 2},${H0 - 34} ${X0 + W + 8},${H0}" fill="#13233a" stroke="var(--teal,#2dd4bf)" stroke-width="2" stroke-linejoin="round"/><rect x="${X0}" y="${H0}" width="${W}" height="${H}" fill="#0f1b2d" stroke="var(--teal,#2dd4bf)" stroke-width="2"/>`;
    fls.forEach((f, i) => {
      const y = H0 + i * rowH, rs = (P.items || []).filter((x) => x.t === "r" && x.fl === f.id).slice(0, 6), n = Math.max(1, rs.length), cw = W / n;
      if (i) s += `<line x1="${X0}" y1="${y}" x2="${X0 + W}" y2="${y}" stroke="#1e3350" stroke-width="2"/>`;
      rs.forEach((r, j) => { const x = X0 + j * cw; if (j) s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + rowH}" stroke="#1e3350" stroke-width="2"/>`; s += `<rect x="${x + 3}" y="${y + 3}" width="${cw - 6}" height="${rowH - 6}" rx="3" fill="#2dd4bf" fill-opacity="${(0.12 + 0.08 * (j % 3)).toFixed(2)}" stroke="#2dd4bf" stroke-opacity=".35"><title>${esc(r.n || "Raum")}</title></rect>`; });
      s += `<text x="${X0 - 4}" y="${y + rowH / 2 + 3}" text-anchor="end" font-size="8" fill="#7f95ad">${esc(String(f.n || "").slice(0, 4))}</text>`;
    });
    return s + `<rect x="0" y="${H0 + H}" width="248" height="14" fill="#06101a" opacity=".55"/></svg>`;
  }
  _grLy() { return (this._grLys = this._grLys || { sf: true, licht: true }); }
  _grPage() {
    const S = this._grS0(), P = this._grPlan(), adm = this._admin(), sfOn = this._mdList().some((m) => m.id === "sf");
    const css = `<style>.grh{position:relative;overflow:hidden;display:flex;align-items:center;gap:18px;padding:16px 18px;border-radius:18px;margin-bottom:14px;color:#e2e8f0;background:radial-gradient(120% 140% at 90% 0%,#0e7490 0%,transparent 55%),linear-gradient(135deg,#0f3d3a,#0b1a2c 70%)}
      .grh svg.grhs{width:min(40%,220px);flex:none;height:auto}.grh .k{font-size:.68rem;font-weight:800;letter-spacing:.11em;text-transform:uppercase;color:#5eead4}.grh .b{font-size:1.5rem;font-weight:750;color:#fff;margin:2px 0}.grh .s{color:#a5b8cc;font-size:.86rem}
      .grh .v{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}.grh .v button{border:1px solid #ffffff2e;background:#ffffff0f;color:inherit;border-radius:999px;padding:6px 13px;font:inherit;font-size:.8rem;font-weight:650;cursor:pointer}.grh .v button.pri{background:var(--teal);border-color:var(--teal);color:var(--on-acc,#042f2e)}
      .grt{display:flex;gap:8px;margin:0 0 12px;flex-wrap:wrap}.grt button{border:1px solid color-mix(in srgb,var(--primary-text-color) 14%,transparent);background:var(--card);color:var(--primary-text-color);border-radius:999px;padding:8px 16px;font:inherit;font-weight:650}.grt button.on{border-color:var(--teal);color:var(--teal);box-shadow:inset 0 0 0 1px var(--teal)}.grt button:disabled{opacity:.45}.grt small{font-weight:500;opacity:.8}
      .grl{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}.grl button{display:inline-flex;gap:6px;align-items:center;border:0;border-radius:999px;padding:5px 11px;font:inherit;font-size:.78rem;background:color-mix(in srgb,var(--primary-text-color) 7%,transparent);color:var(--mut);cursor:pointer}.grl button.on{background:color-mix(in srgb,var(--teal) 16%,transparent);color:var(--teal)}.grl i{width:9px;height:9px;border-radius:50%;display:inline-block}
      .grv{border-radius:14px;overflow:hidden;background:color-mix(in srgb,#020617 55%,var(--card,#111a2b))}.grv svg{display:block;width:100%;height:auto;max-height:66vh}.grv text{font-family:inherit}
      .grinfo{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));margin-top:12px}.grinfo .card{margin:0}.grinfo b{display:block}.grinfo small{color:var(--mut)}
      @media (max-width:560px){.grh{flex-direction:column;align-items:flex-start}.grh svg.grhs{width:100%;max-width:240px}}</style>`;
    if (!P) return css + `<div class="card empty">${ic("home", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Grundriss wird geladen …</div></div>`;
    if (P.error) return css + `<div class="card empty">${ic("home", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Grundriss gerade nicht erreichbar</div>Meist direkt nach einem Neustart von Home Assistant. Es wird gleich von selbst erneut versucht.</div>`;
    const D = S.d || {}, st = D.stats || {}, meta = D.meta || {}, users = D.users || [], items = P.items || [], fls = this._grFloors(P);
    const UN = { fh: "Modul 1", sf: "Modul 11", li: "Modul 18" }, uTxt = users.map((u) => UN[u] || u).join(", ").replace(/, ([^,]*)$/, " und $1");
    const edit = adm ? (sfOn ? `<button data-act="gpedit">${ic("pencil", 14)} Bearbeiten</button>` : `<button data-act="grxsfon" title="Der Baukasten liegt bis Build 3 in Modul 11">${ic("pencil", 14)} Bearbeiten</button>`) : "";
    const hero = `<div class="grh">${this._grHouse(P)}<div style="flex:1;min-width:0"><div class="k">Modul 0 · Haus &amp; Grundriss</div><div class="b">${st.rooms ? `${fls.length} ${fls.length === 1 ? "Etage" : "Etagen"} · ${st.rooms} ${st.rooms === 1 ? "Raum" : "Räume"}` : "Noch kein Grundriss"}</div>
      <div class="s">${st.rooms ? `${st.layers ? `${st.layers.sf || 0} Melder · ${st.layers.licht || 0} Lampen im Plan · ` : ""}genutzt von ${esc(uTxt)}` : "Einmal zeichnen, in allen Modulen nutzen"}</div><div class="v"><button class="pri" data-act="grxtab" data-k="plan">Plan ansehen</button>${edit}</div></div></div>`;
    const tabs = `<div class="grt"><button class="on">Plan</button><button disabled title="kommt in Build 2">Räume <small>· Build 2</small></button><button disabled title="kommt in Build 3">Ebenen <small>· Build 3</small></button><button disabled title="kommt in Build 4">Sichern &amp; Einlesen <small>· Build 4</small></button></div>`;
    if (!items.some((i) => i.t === "r")) return css + hero + tabs + `<div class="card empty">${ic("home", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Noch kein Grundriss</div>Zeichne Räume, Wände, Türen und Fenster einmal – Modul 1 (Wärmekarte), Modul 11 (Melder) und Modul 18 (Lichtkarte) nutzen ihn dann mit.<div style="margin-top:12px">${adm ? (sfOn ? `<button class="btn2 pri" data-act="gpedit">${ic("pencil", 16)} Grundriss zeichnen</button>` : `<button class="btn2 pri" data-act="grxsfon">${ic("pencil", 16)} Grundriss zeichnen</button>`) : ""}</div></div>`;
    const fl = fls.some((f) => f.id === this._grFl) ? this._grFl : fls[0].id, ly = this._grLy(), here = items.filter((i) => i.fl === fl);
    const rs = here.filter((i) => i.t === "r"), B = rs.reduce((a, i) => ({ x0: Math.min(a.x0, i.x), y0: Math.min(a.y0, i.y), x1: Math.max(a.x1, i.x + i.w), y1: Math.max(a.y1, i.y + i.h) }), { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 });
    if (!rs.length) Object.assign(B, { x0: 0, y0: 0, x1: 800, y1: 480 });
    const NF = this._narrow || (this.clientWidth || 999) < 600 ? 2 : 1, u = "gr" + (this.constructor._grN = ((this.constructor._grN || 0) + 1) % 1e6) + "_", st2 = this._hass.states;
    const path = (i) => (i.pts && i.pts.length >= 3 ? "M" + i.pts.map((p) => p[0] + " " + p[1]).join("L") + "Z" : `M${i.x + 3} ${i.y + 3}h${i.w - 6}v${i.h - 6}h${-(i.w - 6)}Z`);
    let d = `<defs><pattern id="${u}dot" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.1" fill="var(--primary-text-color)" opacity=".13"/></pattern></defs><rect x="${B.x0 - 400}" y="${B.y0 - 400}" width="${B.x1 - B.x0 + 800}" height="${B.y1 - B.y0 + 800}" fill="url(#${u}dot)"/>`;
    const bg = (P.bg || {})[fl]; if (bg) d += `<image href="${esc(bg)}" x="${B.x0}" y="${B.y0}" width="${B.x1 - B.x0}" height="${B.y1 - B.y0}" opacity=".25" preserveAspectRatio="xMidYMid meet"/>`;
    rs.forEach((i) => { d += `<path d="${path(i)}" fill="color-mix(in srgb,var(--card,#111a2b) 88%,#000)" stroke="var(--line,#334155)" stroke-width="2"/>`; });
    here.forEach((i) => {
      const a = i.r ? ` transform="rotate(${i.r} ${i.x} ${i.y})"` : "";
      if (i.t === "w") d += `<path d="M${i.x} ${i.y}L${i.x2} ${i.y2}" stroke="color-mix(in srgb,var(--primary-text-color) 55%,transparent)" stroke-width="5" stroke-linecap="round"/>`;
      else if (i.t === "d") d += `<rect x="${i.x - 15}" y="${i.y - 4}" width="30" height="8" rx="2" fill="color-mix(in srgb,#020617 55%,var(--card,#111a2b))"${a}/>`;
      else if (i.t === "f") d += `<rect x="${i.x - 17}" y="${i.y - 3.5}" width="34" height="7" rx="2.5" fill="#bfdbfe" fill-opacity=".55" stroke="#60a5fa"${a}/>`;
      else if (i.t === "s") d += `<g${a}><rect x="${i.x}" y="${i.y}" width="${i.w || 60}" height="${i.h || 90}" fill="none" stroke="var(--line,#334155)" stroke-width="1.5"/>${Array.from({ length: 6 }, (_, k) => `<line x1="${i.x}" y1="${i.y + (k + 1) * (i.h || 90) / 7}" x2="${i.x + (i.w || 60)}" y2="${i.y + (k + 1) * (i.h || 90) / 7}" stroke="var(--line,#334155)"/>`).join("")}</g>`;
      else if (i.t === "x") d += `<text x="${i.x}" y="${i.y}" font-size="${13 * NF}" fill="var(--mut)">${esc(i.n || "")}</text>`;
    });
    rs.forEach((i) => { const fz = Math.min(14 * NF, i.w * 0.1); d += `<text x="${i.x + 12}" y="${i.y + 12 + fz}" font-size="${fz}" font-weight="700" fill="var(--primary-text-color)" pointer-events="none">${esc(i.n || "Raum")}</text>`; });
    /* Ebenen: Lampen (Modul 18, nur mit Addon) und Melder (Modul 11) */
    const q = NF > 1 ? 1.4 : 1;
    if (ly.licht && this._liOn && this._liOn()) here.filter((i) => i.t === "l" && i.e).forEach((i) => {
      const s2 = st2[i.e], on = !!(s2 && s2.state === "on"), c = on && this._liLampHex ? this._liLampHex(i.e) : "#475569";
      d += `<g><title>${esc(this._wzName(i.e))} · ${on ? "an" : s2 && s2.state === "unavailable" ? "offline" : "aus"}</title>${on ? `<circle cx="${i.x}" cy="${i.y}" r="${22 * q}" fill="${c}" opacity=".3"/>` : ""}${i.k === "streifen" ? `<rect x="${i.x - 22 * q}" y="${i.y - 4 * q}" width="${44 * q}" height="${8 * q}" rx="${4 * q}" fill="${c}" stroke="${on ? "#fff" : "#94a3b8"}" stroke-width="1.6"${i.r ? ` transform="rotate(${i.r} ${i.x} ${i.y})"` : ""}/>` : `<circle cx="${i.x}" cy="${i.y}" r="${(i.k === "spot" ? 6 : 9) * q}" fill="${c}" stroke="${on ? "#fff" : "#94a3b8"}" stroke-width="2"/>`}</g>`;
    });
    if (ly.sf) here.filter((i) => i.t === "m").forEach((i) => {
      const s2 = i.e && st2[i.e], al = !!(s2 && s2.state === "on");
      d += `<g><title>${esc(i.e ? this._wzName(i.e) : "Melder")}${al ? " · Alarm" : ""}</title><circle cx="${i.x}" cy="${i.y}" r="${11 * q}" fill="#1f2937" stroke="${al ? "#ef4444" : "#f87171"}" stroke-width="2"/><circle cx="${i.x}" cy="${i.y}" r="${4 * q}" fill="${al ? "#ef4444" : "#f87171"}"/></g>`;
    });
    const nL = items.filter((i) => i.t === "l").length, nM = items.filter((i) => i.t === "m").length, liOn = !!(this._liOn && this._liOn());
    const bar = fls.length > 1 ? `<span class="sffl">${fls.map((f) => `<button class="${f.id === fl ? "on" : ""}" data-act="grxfl" data-k="${esc(f.id)}">${esc(f.n)}</button>`).join("")}</span>` : "";
    const lyr = `<div class="grl">${liOn || nL ? `<button class="${ly.licht && liOn ? "on" : ""}" data-act="grxly" data-k="licht" ${liOn ? "" : "disabled title=\"Addon „licht“ ist aus\""}><i style="background:#ffb36b"></i>Lampen · Modul 18 (${nL})</button>` : ""}<button class="${ly.sf ? "on" : ""}" data-act="grxly" data-k="sf"><i style="background:#f87171"></i>Melder · Modul 11 (${nM})</button><span class="mut sm" style="align-self:center">Ebene antippen = ein- und ausblenden</span></div>`;
    const card = `<div class="card"><h2>${ic("home", 18)}Grundriss<span class="sfhr">${bar}${edit ? edit.replace("<button", '<button class="sfed"') : ""}</span></h2>${lyr}
      <div class="grv"><svg viewBox="${B.x0 - 16} ${B.y0 - 16} ${B.x1 - B.x0 + 32} ${B.y1 - B.y0 + 32}" role="img" aria-label="Grundriss ${esc((fls.find((f) => f.id === fl) || {}).n || "")}">${d}</svg></div></div>`;
    const since = meta.since ? new Date(meta.since).toLocaleDateString("de-DE") : "", until = meta.copy_until ? new Date(meta.copy_until).toLocaleDateString("de-DE") : "";
    const info = `<div class="grinfo">
      <div class="card"><b>${ic("users", 15)} Genutzt von</b><small>${esc(uTxt)}. Einmal gezeichnet, überall derselbe Plan.</small></div>
      <div class="card"><b>${ic("shield", 15)} Umzug aus Modul 11</b><small>${since ? `Am ${since} übernommen${meta.src === "sf" ? " aus Modul 11" : ""}. Die Kopie vom alten Stand wird bis ${until} aufgehoben.` : "Der Plan liegt jetzt im Kern von Strom &amp; Wärme."}</small></div>
      <div class="card"><b>${ic("pencil", 15)} Bearbeiten</b><small>Bis Build 3 im Baukasten von Modul 11. Gespeichert wird hier in Modul 0, alle Module sehen die Änderung sofort.</small></div></div>`;
    return css + hero + tabs + card + info;
  }
  _grAct(a, b) {
    const k = b && b.dataset ? b.dataset.k : "";
    if (a === "grxfl") { this._grFl = k; this._render(); return true; }
    if (a === "grxly") { const L = this._grLy(); if (k in L) { L[k] = !L[k]; this._render(); } return true; }
    if (a === "grxtab") { this._render(); return true; }
    if (a === "grxsfon") { this._toast("Der Baukasten liegt bis Build 3 noch in Modul 11. Schalte Modul 11 unter Einstellungen → Module ein."); return true; }
    return false;
  }
