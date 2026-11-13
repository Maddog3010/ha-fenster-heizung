  /* Ladestatistik: Balkendiagramm pro Tag, Anteil Sonne/Netz, Kosten */
  _wbStT() { return this._wbTab === "veh" && this._evNew() ? "veh" : this._wbTab === "stat" ? "stat" : this._wbTab === "plan" ? "plan" : this._wbTab === "set" ? "set" : "laden"; }
  _wbTabs() {
    const t = this._wbStT(), b = (k, l, i) => `<button class="${t === k ? "sel" : ""}" data-act="wbtab" data-k="${k}" aria-pressed="${t === k}">${ic(i, 16)}${l}</button>`;
    return `<div class="wbtabs" role="tablist">${b("laden", "Laden", "energy")}${b("plan", "Planung", "sun")}${b("stat", "Ladestatistik", "chart")}${b("set", "Einstellungen", "sliders")}</div>`;
  }
  _wbStatLoad(force) {
    if (!this._hass || this._wbStBusy) return;
    if (!force && this._wbStD && Date.now() - this._wbStD.ts < 30000) return;
    this._wbStBusy = true;
    this._hass.callWS({ type: "fenster_heizung/wb_stats" }).then((r) => { this._wbStD = { data: r || {}, ts: Date.now() }; }).catch(() => { this._wbStD = { data: { error: true }, ts: Date.now() }; })
      .finally(() => { this._wbStBusy = false; if (this._wbStT() === "stat" && this._wbVisible()) this._render(); });
  }
  _wbStS() { const n = new Date(); return this._wbStV || (this._wbStV = { per: "m", y: n.getFullYear(), m: n.getMonth(), what: "e", by: "src" }); }
  _wbStat() {
    this._wbStatLoad();
    const S = this._wbStS(), D = (this._wbStD && this._wbStD.data) || null;
    if (!D) return `<div class="card empty">${ic("chart", 30)}<div class="sm" style="margin-top:8px">Ladestatistik wird geladen …</div></div>`;
    if (D.error) return `<div class="card empty">${ic("chart", 30)}<div class="sm" style="margin-top:8px">Die Ladestatistik konnte nicht geladen werden.</div></div>`;
    const days = D.days || [], pad = (v) => String(v).padStart(2, "0"), MON = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    const kosten = S.what === "k", byV = S.by === "veh";
    let slots = [], lab = (s) => s.l;
    if (S.per === "m") { const n = new Date(S.y, S.m + 1, 0).getDate(); for (let i = 1; i <= n; i++) slots.push({ k: `${S.y}-${pad(S.m + 1)}-${pad(i)}`, l: String(i) }); }
    else if (S.per === "y") for (let i = 0; i < 12; i++) slots.push({ k: `${S.y}-${pad(i + 1)}`, l: MON[i].slice(0, 3) });
    else { const ys = [...new Set(days.map((r) => r.d.slice(0, 4)))].sort(); (ys.length ? ys : [String(S.y)]).forEach((y) => slots.push({ k: y, l: y })); }
    const klen = S.per === "m" ? 10 : S.per === "y" ? 7 : 4, ix = Object.fromEntries(slots.map((s, i) => [s.k, i]));
    const vehs = []; days.forEach((r) => Object.keys(r.veh || {}).forEach((n) => { if (!vehs.includes(n)) vehs.push(n); }));
    const PAL = ["#2dd4bf", "#f59e0b", "#a78bfa", "#60a5fa", "#f472b6", "#a3e635"], SRC = ["#2dd4bf", "#f59e0b"];
    const series = byV ? vehs.map((n, i) => ({ id: n, name: n, col: PAL[i % PAL.length] })) : kosten ? [{ id: "grid", name: "Netzkosten", col: "#f59e0b" }] : [{ id: "pv", name: "Sonne", col: SRC[0] }, { id: "grid", name: "Netz", col: SRC[1] }];
    slots.forEach((s) => { s.v = series.map(() => 0); });
    let tot = { kwh: 0, pv: 0, grid: 0, cost: 0, full: 0, km: 0 };
    days.forEach((r) => { const i = ix[r.d.slice(0, klen)]; if (i == null) return; tot.pv += r.pv; tot.grid += r.grid; tot.cost += r.cost; tot.full += r.full || 0; tot.km += r.km || 0; tot.kwh += r.pv + r.grid;
      series.forEach((se, j) => { slots[i].v[j] += byV ? ((r.veh || {})[se.id] ? (kosten ? r.veh[se.id].cost : r.veh[se.id].kwh) : 0) : se.id === "pv" ? r.pv : kosten ? r.cost : r.grid; }); });
    const mx = Math.max(...slots.map((s) => s.v.reduce((a, b) => a + b, 0)), 0.1), step = enStep(mx), top = Math.ceil(mx / step) * step, W = 640, Hh = 210, pl = 34, pb = 22, n = slots.length, bw = (W - pl) / n, bar = Math.min(bw * 0.66, 30);
    const unit = kosten ? "€" : "kWh"; let grid = "", bars = "";
    for (let v = 0; v <= top + 1e-9; v += step) { const y = Hh - pb - (v / top) * (Hh - pb - 8); grid += `<line x1="${pl}" x2="${W}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${pl - 6}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--mut)">${num(v, step < 1 ? 1 : 0)}</text>`; }
    slots.forEach((s, i) => { let y = Hh - pb; const x = pl + i * bw + (bw - bar) / 2; s.v.forEach((v, j) => { const h = (v / top) * (Hh - pb - 8); if (h > 0.4) { y -= h; bars += `<rect x="${x}" y="${y}" width="${bar}" height="${h}" fill="${series[j].col}" rx="2"><title>${esc(series[j].name)} ${num(v, 2)} ${unit}</title></rect>`; } });
      if (n <= 14 || i % 2 === 0 || S.per === "m" && (i + 1) % 5 === 0 || i === n - 1) bars += `<text x="${x + bar / 2}" y="${Hh - 6}" text-anchor="middle" font-size="11" fill="var(--mut)">${esc(lab(s))}</text>`; });
    const share = tot.kwh > 0 ? tot.pv / tot.kwh * 100 : 0, ppk = tot.kwh > 0 ? tot.cost / tot.kwh : 0, fullGrid = tot.full > 0 ? tot.full : null, saved = fullGrid != null ? Math.max(0, fullGrid - tot.cost) : null;
    const chip = (act, k, t, on) => `<button class="gsch ${on ? "sel" : ""}" data-act="${act}" data-k="${k}" aria-pressed="${on}">${t}</button>`;
    const title = S.per === "m" ? `${MON[S.m]} ${S.y}` : S.per === "y" ? String(S.y) : "Gesamt";
    const nav = S.per === "all" ? "" : `<div class="wbnav"><button data-act="wbnav" data-k="-1" aria-label="Zurück">‹</button><b>${title}</b><button data-act="wbnav" data-k="1" aria-label="Weiter">›</button></div>`;
    const tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    const ses = (D.sessions || []).filter((r) => S.per === "all" ? true : S.per === "y" ? r.start.slice(0, 4) === String(S.y) : r.start.slice(0, 7) === `${S.y}-${pad(S.m + 1)}`).slice(0, 8);
    const fd = (iso) => { const t = new Date(iso); return t.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }) + " " + t.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }); };
    return `<div class="card"><h2>${ic("chart", 18)}Ladestatistik</h2>
      <div class="wbsh"><div class="gschips">${[["m", "Monat"], ["y", "Jahr"], ["all", "Gesamt"]].map(([k, t]) => chip("wbsper", k, t, S.per === k)).join("")}</div>${nav}</div>
      <div class="wbsh"><div class="gschips">${chip("wbswhat", "e", "Energie", !kosten)}${chip("wbswhat", "k", "Kosten", kosten)}</div><div class="gschips">${chip("wbsby", "src", "Sonne / Netz", !byV)}${vehs.length ? chip("wbsby", "veh", "Fahrzeug", byV) : ""}</div></div>
      <div class="wbst"><b>${kosten ? "Ladekosten" : "Geladene Energie"}</b> <span class="mut">${kosten ? num(tot.cost, 2) + " € gesamt" : num(tot.kwh, 1) + " kWh gesamt"} · ${num(share, 0)} % Sonne</span></div>
      <div class="wbsc"><svg viewBox="0 0 ${W} ${Hh}" width="100%" role="img" aria-label="${kosten ? "Ladekosten in Euro" : "Geladene Energie in kWh"} pro ${S.per === "m" ? "Tag" : S.per === "y" ? "Monat" : "Jahr"}">${grid}${bars}</svg></div>
      <div class="gsleg" style="margin-top:6px">${series.map((se) => `<span><i style="background:${se.col}"></i>${esc(se.name)} <b>${byV ? "" : num(se.id === "pv" ? tot.pv : kosten ? tot.cost : tot.grid, kosten ? 2 : 1) + " " + unit}</b></span>`).join("")}<span class="mut">${unit} pro ${S.per === "m" ? "Tag" : S.per === "y" ? "Monat" : "Jahr"}</span></div>
      <div class="lugrid" style="margin-top:12px">${tile("Geladen", num(tot.kwh, 1) + " kWh", `${num(tot.pv, 1)} kWh Sonne · ${num(tot.grid, 1)} kWh Netz`)}${tile("Sonnenanteil", num(share, 0) + " %", "der geladenen Energie")}${tile("Kosten", num(tot.cost, 2) + " €", "nur Netzstrom")}${tile("Ø Preis", tot.kwh > 0 ? num(ppk * 100, 1) + " ct/kWh" : "–", fullGrid != null ? `Ersparnis ${num(saved, 2)} € durch Sonne` : "Preis aus Modul 1")}${tile("Ø Verbrauch", tot.km > 0 ? num(tot.kwh / tot.km * 100, 1) + " kWh/100 km" : "–", tot.km > 0 ? `${num(tot.km, 0)} km laut Kilometerstand` : "braucht den Kilometerstand-Sensor")}${tile("CO₂ gespart", num(tot.pv * 0.38, 0) + " kg", "Sonne statt Netz-Mix (0,38 kg/kWh)")}</div>
      <div class="foot2" style="margin-top:10px"><button class="btn2" data-act="wbcsv">${ic("check", 16)} Als CSV exportieren</button></div>
      <div class="mut sm" style="margin:10px 0 0">Sonne = Überschuss und Hausbatterie, Netz = Bezug vom Netzanschluss. Die Aufteilung wird alle 10 Sekunden aus Ladeleistung und Netzbezug berechnet. Kosten = Netzstrom × Preis zum Zeitpunkt des Ladens.</div></div>
      <div class="card"><h2>${ic("clock", 18)}Letzte Ladevorgänge</h2>${ses.length ? `<div class="wbses">${ses.map((r) => `<div class="wbse"><div><b>${esc(r.veh || "Unbekannt")}</b><span class="mut sm">${fd(r.start)} · ${num(r.min / 60, 1)} h</span></div><div class="wbsb"><i style="width:${r.kwh > 0 ? r.pv / r.kwh * 100 : 0}%"></i></div><div class="wbsv"><b>${num(r.kwh, 1)} kWh</b><span class="mut sm">${num(r.kwh > 0 ? r.pv / r.kwh * 100 : 0, 0)} % Sonne · ${num(r.cost, 2)} €</span></div></div>`).join("")}</div>` : `<div class="mut sm">In diesem Zeitraum gab es keine Ladevorgänge.</div>`}</div>`;
  }
  _wbStAct(a, b) {
    const S = this._wbStS(), k = b.dataset.k;
    if (a === "wbtab") this._wbTab = k;
    else if (a === "wbsec") { this._wbSecO = { ...this._wbSecS(), [k]: !this._wbSecS()[k] }; this._wbSecSave(); }
    else if (a === "wbsecall") { this._wbSecO = Object.fromEntries(["wb", "reg", "veh", "bat", "dim", "grd", "ntf", "look"].map((x) => [x, k === "1"])); this._wbSecSave(); }
    else if (a === "wbgo" && k === "veh" && this._evNew()) this._wbTab = "veh";
    else if (a === "wbgo") { this._wbTab = "set"; this._wbSecO = { ...this._wbSecS(), [k]: true }; this._wbSecSave(); }
    else if (a === "wbplan") this._wbSave({ planStrat: k });
    else if (a === "wbsrc") { this._wbSave({ planSrc: k }); }
    else if (a === "wbpv") { this._wbSave({ pvSrc: k }); }
    else if (a === "wbsper") S.per = k;
    else if (a === "wbswhat") S.what = k;
    else if (a === "wbsby") S.by = k;
    else if (a === "wbnav") { const d = Number(k); if (S.per === "m") { let m = S.m + d, y = S.y; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } S.m = m; S.y = y; } else S.y += d; }
    this._render();
  }
