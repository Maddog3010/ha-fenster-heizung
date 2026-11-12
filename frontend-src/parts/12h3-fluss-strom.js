  /* ================= Modul 19 v0.9 – Strom-Reiter in neuer Optik (Konzept E) und Ideen W2, W3, W4, W7 =================
     E1 Lichtsäulen: Hausverbrauch je Stunde (Tag) bzw. je Tag/Monat, gestapelt nach Herkunft Solar, Akku, Netz, Sonstige.
     E2 Verbraucher mit Solar-Anteil. Rechnung aus der Langzeitstatistik der Kachel-Entitäten (Stunden-Mittelwerte der
        Leistung, im Jahr Tages-Mittelwerte), gleiche Regeln wie das Fluss-Bild: Einspeisung und Akku-Laden zuerst vom Solar.
     Zeitraum Tag · Woche · Monat · Jahr mit ‹ › wie in Modul 3. Kein Sankey (gefiel nicht). */
  _efP() { if (!this._efPr) { let r = "day"; try { r = localStorage.getItem("fh_ef_rng") || "day"; } catch (_) { /* egal */ } this._efPr = { range: ["day", "week", "month", "year"].includes(r) ? r : "day", off: 0 }; } return this._efPr; }
  _efPer(P) {
    const now = new Date(), o = P.off, y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
    let s, e, n, u;
    if (P.range === "week") { const wd = (now.getDay() + 6) % 7; s = new Date(y, m, d - wd + 7 * o); e = new Date(y, m, d - wd + 7 * o + 7); n = 7; u = "d"; }
    else if (P.range === "month") { s = new Date(y, m + o, 1); e = new Date(y, m + o + 1, 1); n = new Date(y, m + o + 1, 0).getDate(); u = "d"; }
    else if (P.range === "year") { s = new Date(y + o, 0, 1); e = new Date(y + o + 1, 0, 1); n = 12; u = "m"; }
    else { s = new Date(y, m, d + o); e = new Date(y, m, d + o + 1); n = 24; u = "h"; }
    return { s, e, end: new Date(Math.min(+e, +now)), n, u, cur: o === 0 };
  }
  _efPLbl(P, R) {
    const f = (dt, o) => dt.toLocaleDateString("de-DE", o);
    if (P.range === "day") return P.off === 0 ? "Heute" : P.off === -1 ? "Gestern" : f(R.s, { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
    if (P.range === "week") { const l = new Date(+R.e - 864e5); return `${f(R.s, { day: "2-digit", month: "2-digit" })} – ${f(l, { day: "2-digit", month: "2-digit" })}`; }
    if (P.range === "month") return f(R.s, { month: "long", year: "numeric" });
    return String(R.s.getFullYear());
  }
  /* Alle Leistungs-Entitäten, die das Fluss-Bild nutzt (inkl. Gruppen-Kacheln) */
  _efxPowIds(nodes) {
    const ids = new Set();
    nodes.forEach((n) => { if (n.flow === "split") { if (n.power_to_node) ids.add(n.power_to_node); if (n.power_to_house) ids.add(n.power_to_house); } else if ((n.group || []).length) n.group.forEach((e) => ids.add(e)); else { const p = this._efxPid(n); if (p) ids.add(p); } });
    return [...ids];
  }
  _efxStatLoad(P, force) {
    const c = this._efxCfg(), nodes = Object.keys(EF_POS).filter((p) => c.nodes[p] && c.nodes[p].on).map((p) => ({ p, n: c.nodes[p] })), ids = this._efxPowIds(nodes.map((x) => x.n)), R = this._efPer(P);
    const key = P.range + ":" + P.off + ":" + ids.join(",");
    const cache = (this._efSt = this._efSt || {});
    if (!ids.length) return null;
    const h = cache[key]; if (h && !force && (!R.cur || Date.now() - h.ts < 3e5)) return h;
    if (this._efStBusy === key) return h || null;
    this._efStBusy = key;
    const per = P.range === "year" ? "day" : "hour";
    this._hass.callWS({ type: "recorder/statistics_during_period", start_time: R.s.toISOString(), end_time: R.end.toISOString(), statistic_ids: ids, period: per, types: ["mean"] })
      .then((r) => { cache[key] = { ts: Date.now(), ...this._efxStatCalc(nodes, r || {}, R, per, P) }; })
      .catch(() => { cache[key] = { ts: Date.now(), err: true, bars: [], cons: [], tot: null }; })
      .finally(() => { if (this._efStBusy === key) this._efStBusy = null; if (this._mdActive() === "ef") this._render(); });
    return h || null;
  }
  _efxStatCalc(nodes, r, R, per, P) {
    const step = per === "day" ? 24 : 1, ts = (x) => (typeof x.start === "number" ? x.start : Date.parse(x.start));
    const kf = (id) => (/^kW$/i.test(((this._hass.states[id] || {}).attributes || {}).unit_of_measurement || "") ? 1000 : 1);
    const map = {}; Object.entries(r).forEach(([id, l]) => { const k = kf(id); (l || []).forEach((x) => { if (!isFinite(x.mean)) return; (map[ts(x)] = map[ts(x)] || {})[id] = x.mean * k; }); });
    const val = (t, id) => (map[t] && isFinite(map[t][id]) ? map[t][id] : 0);
    const nodeW = (n, t) => {
      if (n.flow === "split") return Math.abs(val(t, n.power_to_node)) - Math.abs(val(t, n.power_to_house));
      if ((n.group || []).length) return n.group.reduce((a, e) => a + Math.abs(val(t, e)), 0);
      const v = val(t, this._efxPid(n)); return n.flow === "supply" ? -Math.abs(v) : n.flow === "consume" ? Math.abs(v) : n.invert ? -v : v;
    };
    const bucket = (t) => { const d = new Date(t); return P.range === "day" ? d.getHours() : P.range === "year" ? d.getMonth() : Math.floor((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(R.s.getFullYear(), R.s.getMonth(), R.s.getDate())) / 864e5 + .5); };
    const bars = Array.from({ length: R.n }, () => ({ pv: 0, bat: 0, net: 0, oth: 0, use: 0 })), cons = {}, tot = { pv: 0, bat: 0, net: 0, oth: 0, use: 0, gen: 0, exp: 0 };
    Object.keys(map).map(Number).sort((a, b) => a - b).forEach((t) => {
      const m = { pv: 0, bat: 0, net: 0, oth: 0 }; let out = 0, gen = 0, exp = 0;
      nodes.forEach(({ n }) => { if (n.flow === "consume") return; const w = nodeW(n, t), k = this._efxKind(n); if (w < 0) m[k] += -w; else { out += w; if (k === "net") exp += w; } if (k === "pv") gen += Math.abs(w); });
      const take = Math.min(m.pv, out); m.pv -= take; out -= take; if (out > 0) m.oth = Math.max(0, m.oth - out);
      const use = m.pv + m.bat + m.net + m.oth, b = bars[bucket(t)], kwh = step / 1000; if (!b) return;
      ["pv", "bat", "net", "oth"].forEach((k) => { b[k] += m[k] * kwh; tot[k] += m[k] * kwh; }); b.use += use * kwh; tot.use += use * kwh; tot.gen += gen * kwh; tot.exp += exp * kwh;
      const fpv = use > 0 ? m.pv / use : 0;
      nodes.forEach(({ p, n }) => { if (n.flow !== "consume") return; const w = Math.max(0, nodeW(n, t)) * kwh, o = (cons[p] = cons[p] || { kwh: 0, pv: 0 }); o.kwh += w; o.pv += w * fpv; });
    });
    return { bars, cons, tot, any: Object.keys(map).length > 0 };
  }
  _efStrom(narrow) {
    const P = this._efP(), R = this._efPer(P), c = this._efxCfg(), H = this._efxStatLoad(P), RG = [["day", "Tag"], ["week", "Woche"], ["month", "Monat"], ["year", "Jahr"]];
    const nav = `<div class="efpn"><div class="seg oseg">${RG.map(([k, l]) => `<button class="${P.range === k ? "sel" : ""}" data-act="efxrng" data-k="${k}">${l}</button>`).join("")}</div><div class="efpnv"><button class="ibtn" data-act="efxoff" data-k="-1" aria-label="Zurück">‹</button><b>${esc(this._efPLbl(P, R))}</b><button class="ibtn" data-act="efxoff" data-k="1" ${P.off >= 0 ? "disabled" : ""} aria-label="Weiter">›</button></div></div>`;
    if (!this._efxPowIds(Object.values(c.nodes).filter((n) => n.on)).length) return `${nav}<div class="card empty">${ic("energy", 34)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Keine Leistungssensoren</div>Der Strom-Reiter rechnet mit den Leistungssensoren deiner Kacheln. Lege sie unter „Einrichten“ fest.</div>`;
    if (!H) return `${nav}<div class="card empty">Verlauf wird geladen …</div>`;
    if (H.err || !H.any) return `${nav}<div class="card empty">${ic("info", 30)}<div style="margin:8px 0 2px;font-weight:700;color:var(--primary-text-color)">Keine Langzeitstatistik</div>Für diesen Zeitraum liefert Home Assistant keine Werte. Die Sensoren brauchen eine „state_class“ (measurement), damit sie in der Langzeitstatistik landen.</div>`;
    const T = H.tot, f1 = (v) => v.toLocaleString("de-DE", { maximumFractionDigits: v >= 100 ? 0 : 1 }), pc = (a, b) => (b > 0 ? Math.round(a / b * 100) : 0);
    const sel = this._efSel != null && this._efSel < H.bars.length ? this._efSel : null;
    const sum = `<div class="efsum">${[["Verbrauch", f1(T.use) + " kWh", "#2dd4bf"], ["aus Solar", pc(T.pv, T.use) + " %", "#fbbf24"], ["Autarkie", (T.use > 0 ? 100 - pc(T.net, T.use) : 0) + " %", "#4ade80"], ["Solar erzeugt", f1(T.gen) + " kWh", "#fbbf24"]].map(([l, v, col]) => `<div><small>${l}</small><b style="color:${col}">${v}</b></div>`).join("")}</div>`;
    /* E1 Lichtsäulen */
    const mx = Math.max(.001, ...H.bars.map((b) => b.use)), lab = (i) => (P.range === "day" ? i : P.range === "year" ? ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i] : P.range === "week" ? ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"][i] : i + 1);
    const tick = (i) => (P.range === "day" ? i % 6 === 0 : P.range === "month" ? i % 5 === 0 : true);
    const cols = H.bars.map((b, i) => `<button class="efsc${sel === i ? " sel" : ""}" data-act="efxsel" data-k="${i}" aria-label="${esc(String(lab(i)))}: ${f1(b.use)} kWh"><span class="efsb" style="height:${(b.use / mx * 100).toFixed(1)}%">${EF_MIX.map(([k, , col]) => (b[k] > 0 && b.use > 0 ? `<i style="height:${(b[k] / b.use * 100).toFixed(2)}%;background:${col}"></i>` : "")).reverse().join("")}</span><small>${tick(i) ? lab(i) : ""}</small></button>`).join("");
    const sb = sel != null ? H.bars[sel] : null;
    const det = sb ? `<div class="efsd"><b>${esc(P.range === "day" ? `${sel}–${sel + 1} Uhr` : P.range === "year" ? new Date(R.s.getFullYear(), sel, 1).toLocaleDateString("de-DE", { month: "long" }) : new Date(R.s.getFullYear(), R.s.getMonth(), R.s.getDate() + sel).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" }))}</b> · ${f1(sb.use)} kWh${EF_MIX.filter(([k]) => sb[k] > 0.0005).map(([k, l, col]) => ` · <span style="color:${col}">${pc(sb[k], sb.use)} % ${l}</span>`).join("")}</div>` : `<div class="efsd mut">Tippe auf eine Säule für die Werte</div>`;
    const e1 = `<div class="card efsec1"><div class="efh2">${ic("chart", 16)}Herkunft ${P.range === "day" ? "pro Stunde" : P.range === "year" ? "pro Monat" : "pro Tag"}</div><div class="efcols n${H.bars.length > 24 ? "m" : ""}">${cols}</div><div class="efleg2">${EF_MIX.map(([, l, col]) => `<span><i style="background:${col}"></i>${l}</span>`).join("")}<span class="mut">Höhe = Hausverbrauch</span></div>${det}</div>`;
    /* E2 Verbraucher mit Solar-Anteil */
    const list = Object.entries(H.cons).map(([p, o]) => ({ p, n: c.nodes[p], ...o })).filter((x) => x.n).sort((a, b) => b.kwh - a.kwh);
    const e2 = `<div class="card"><div class="efh2">${ic("energy", 16)}Verbraucher mit Solar-Anteil</div>${list.length ? list.map((x) => { const col = x.n.color || EF_POS[x.p][3], s = pc(x.pv, x.kwh); return `<div class="efsv" style="--c:${col}"><span class="efq sm"><span class="efqi">${this._efxImgN(x.n, { on: x.kwh > 0 })}</span></span><span class="efsvt"><b>${esc(x.n.name)}</b><span class="efsvb"><i style="width:${s}%"></i></span></span><span class="efsvv"><b>${f1(x.kwh)} kWh</b><small>${s} % Solar</small></span></div>`; }).join("") : `<div class="mut sm">Keine Verbraucher-Kacheln mit Leistungssensor.</div>`}</div>`;
    return `${nav}${sum}<div class="efsgrid${narrow ? " nar" : ""}">${e1}<div class="efsside">${e2}${this._efxCost(T)}</div></div>`;
  }
  /* ---------------- W4 Tageswerte-Leiste unter dem Brett ---------------- */
  _efxToday() {
    if (this._efxCfg().today === false) return "";
    const H = this._efxStatLoad({ range: "day", off: 0 }); if (!H || H.err || !H.any) return "";
    const T = H.tot, f1 = (v) => v.toLocaleString("de-DE", { maximumFractionDigits: 1 });
    return `<div class="eftd"><b>heute</b><span><i style="background:#fbbf24"></i>${f1(T.gen)} kWh Solar</span><span><i style="background:#2dd4bf"></i>${f1(T.use)} kWh Verbrauch</span><span><i style="background:#4ade80"></i>${T.use > 0 ? Math.round(100 - T.net / T.use * 100) : 0} % Autarkie</span>${T.exp > 0.05 ? `<span><i style="background:#a78bfa"></i>${f1(T.exp)} kWh eingespeist</span>` : ""}</div>`;
  }
  /* ---------------- W2 Vorlagen ---------------- */
  _efxTpl(id) {
    const mk = (p, o) => ({ ...this._efxBlank(p), ...o });
    const T = {
      efh: { top_1: { name: "Solar Dach", image: "hd:pvRoof", flow: "supply", color: "#facc15" }, left_1: { name: "Netz", image: "hd:grid", flow: "split", color: "#f87171" }, left_3: { name: "Akku", image: "hd:battery", flow: "both", color: "#a78bfa" }, right_1: { name: "Warmwasser", image: "hd:boiler", flow: "consume", color: "#38bdf8" }, bottom: { name: "Waschmaschine", image: "hd:washer", flow: "consume", color: "#f97316" } },
      flat: { top_1: { name: "Balkon", image: "hd:balcony", flow: "supply", color: "#fbbf24" }, left_1: { name: "Netz", image: "hd:grid", flow: "split", color: "#f87171" }, right_1: { name: "Kühlschrank", image: "hd:fridge", flow: "consume", color: "#38bdf8" }, right_3: { name: "PC", image: "hd:pc", flow: "consume", color: "#2dd4bf" }, bottom: { name: "Steckdose", image: "hd:plug", flow: "consume", color: "#f97316" } },
      ev: { top_1: { name: "Solar Dach", image: "hd:pvRoof", flow: "supply", color: "#facc15" }, left_1: { name: "Netz", image: "hd:grid", flow: "split", color: "#f87171" }, left_3: { name: "Akku", image: "hd:battery", flow: "both", color: "#a78bfa" }, right_1: { name: "Wallbox", image: "hd:wallbox", flow: "consume", color: "#22d3ee" }, right_3: { name: "Auto", image: "hd:car", flow: "consume", color: "#f472b6", run_w: 100 } },
    }[id];
    if (!T) return;
    const c = this._efxClone(); let n = 0;
    Object.entries(T).forEach(([p, o]) => { if (!c.nodes[p]) { c.nodes[p] = mk(p, o); n++; } });
    if (!c.hub.image || c.hub.image === "🏠") c.hub.image = id === "flat" ? "hd:flat" : "hd:house";
    this._efxPut(c).then(() => { this._toast(n ? `${n} ${n === 1 ? "Kachel" : "Kacheln"} angelegt – jetzt Sensoren zuordnen` : "Alle Plätze der Vorlage sind schon belegt"); this._modal = { type: "efxmgr" }; this._renderModal(); this._render(); });
  }
  _efxTplHtml(adm) {
    return `<div class="eftpl">${EF_TPL.map(([k, g, l, d]) => `<button class="eftpb" data-act="efxtpl" data-k="${k}" ${adm ? "" : "disabled"}>${this._gx(g, 40, { on: true })}<span><b>${l}</b><small>${d}</small></span></button>`).join("")}</div>`;
  }
  /* ---------------- W3 Gruppen-Kachel: Mitglieder anzeigen ---------------- */
  _efxGrpModal() {
    const m = this._modal, n = this._efxCfg().nodes[m.pos]; if (!n) return "";
    const rows = (n.group || []).map((e) => { const w = Math.abs(this._efxToW(e)); return `<button class="vrow efgm" data-act="efxmore" data-e="${esc(e)}"><span>${esc(this._wzName(e))}<small class="mut" style="display:block">${esc(e)}</small></span><b>${isNaN(w) ? "–" : this._efxFmtW(w)}</b></button>`; }).join("");
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>${esc(n.name)}</b><span>Gruppe · ${(n.group || []).length} Geräte · zusammen ${this._efxFmtW(Math.abs(this._efxNodeW(n)))}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>${rows}</div>`;
  }
  /* ---------------- W7 Sponsor-Abzeichen im Banner ---------------- */
  _efxBadge() { const s = this._spnS(); return s.active && (!s.prefs || s.prefs.badge !== false) ? `<span class="efspb" title="Modul 19 ist ein Extra für Sponsoren">${ic("heart", 12)}${s.tier === "max" ? "Sponsor Max" : "Sponsor"}</span>` : ""; }
