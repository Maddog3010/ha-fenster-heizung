  /* ================= Modul 3 · Gaszähler (b35/b36) =================
     Ein Zählerstand-Sensor (m³ oder kWh, Langzeitstatistik in Home Assistant). Gespeichert im Haus unter "gas" (für alle Nutzer).
     m³ werden mit Brennwert × Zustandszahl (steht auf der Gasrechnung) in kWh umgerechnet.
     Abrechnungsjahr ab Monat „start“ (z. B. April bis März). Arbeits- und Grundpreis je Abrechnungsjahr (years["2025"] = ab Start 2025),
     sonst die Standardpreise. Kosten = kWh × Arbeitspreis des jeweiligen Abrechnungsjahrs + Grundpreis tageweise. */
  _gasCfg() { const g = { ent: "", brw: 10.5, price: 12, grund: 0, start: 1, abschlag: 0, ...(((this._haus || {}).gas) || {}) }; g.years = g.years || {}; return g; }
  _gasOn() { return !!this._gasCfg().ent; }
  _gasUnit() { const c = this._gasCfg(), s = this._hass.states[c.ent], u = ((s && s.attributes.unit_of_measurement) || "").replace("m3", "m³"); return /Wh$/i.test(u) ? "kwh" : "m3"; }
  _gasKwh(v) { return this._gasUnit() === "m3" ? v * this._gasCfg().brw : v; }
  /* Abrechnungsjahr eines Zeitpunkts: Jahr, in dem es begonnen hat */
  _gasBy(t) { const d = new Date(t), sm = this._gasCfg().start - 1; return d.getMonth() >= sm ? d.getFullYear() : d.getFullYear() - 1; }
  _gasByS(y) { return new Date(y, this._gasCfg().start - 1, 1); }
  _gasByLbl(y) { const c = this._gasCfg(); return c.start === 1 ? String(y) : `${String(c.start).padStart(2, "0")}/${y} – ${String(c.start - 1).padStart(2, "0")}/${y + 1}`; }
  _gasPrice(y) { const c = this._gasCfg(), o = c.years[String(y)] || {}; return { price: o.price != null ? o.price : c.price, grund: o.grund != null ? o.grund : c.grund }; }
  /* Grundpreis für [s, e) – tageweise, je Abrechnungsjahr mit dessen Preis */
  _gasGrund(s, e) {
    let t = +s, sum = 0;
    while (t < +e) { const y = this._gasBy(t), ys = +this._gasByS(y), ye = +this._gasByS(y + 1), nx = Math.min(+e, ye); sum += this._gasPrice(y).grund * (nx - t) / (ye - ys); t = nx; }
    return sum;
  }
  _gasCost(list) { return (list || []).reduce((a, x) => a + this._gasKwh(x.v) * this._gasPrice(this._gasBy(x.t)).price / 100, 0); }
  /* Zeitraum: wie Modul 3, nur „Jahr“ ist das Abrechnungsjahr */
  _gasPer(shift = 0) {
    const E = this._enState(), P = this._enPer(shift);
    if (E.range !== "year" || this._gasCfg().start === 1) return P;
    const now = new Date(), o = (E.off || 0) + shift, y = this._gasBy(now) + o, s = this._gasByS(y), e = this._gasByS(y + 1);
    return { s, e, end: new Date(Math.min(+e, +now)), n: 12, u: "m", off: o, cur: o === 0, by: y };
  }
  _gasSave(patch) {
    if (!this._admin()) return;
    const g = { ...this._gasCfg(), ...patch };
    this._haus = { ...(this._haus || {}), gas: g }; this._gasH = null; this._gasB = null;
    this._hass.callWS({ type: "fenster_heizung/haus_set", haus: { gas: g } }).then((r) => { if (r && r.haus) this._haus = r.haus; }).catch(() => this._toast("Gas-Einstellung konnte nicht gespeichert werden"))
      .finally(() => { if (this._modal) this._renderModal(); this._render(); });
  }
  _gasSensors() {
    const st = this._hass.states;
    return Object.keys(st).filter((e) => { if (!e.startsWith("sensor.")) return false; const a = st[e].attributes || {}; return a.device_class === "gas" || /^(m³|m3|ft³|CCF)$/.test(a.unit_of_measurement || "") || (/gas/i.test(e + " " + (a.friendly_name || "")) && /^[kM]?Wh$/.test(a.unit_of_measurement || "")); });
  }
  _gasQ(s, e, per) {
    const c = this._gasCfg();
    return this._hass.callWS({ type: "recorder/statistics_during_period", start_time: s.toISOString(), end_time: e.toISOString(), statistic_ids: [c.ent], period: per, types: ["change"], units: { volume: "m³", energy: "kWh" } })
      .then((r) => ((r || {})[c.ent] || []).map((x) => ({ t: typeof x.start === "number" ? x.start : Date.parse(x.start), v: Math.max(0, Number(x.change) || 0) })));
  }
  _gasKey() { const c = this._gasCfg(), E = this._enState(); return `${E.range}:${E.off || 0}:${c.ent}:${c.start}`; }
  _gasLoad() {
    const c = this._gasCfg(), E = this._enState(); if (!this._hass || !c.ent) return;
    const P = this._gasPer(), key = this._gasKey();
    if (!(this._gasH && this._gasH.key === key && (!P.cur || Date.now() - this._gasH.ts < 3e5)) && this._gasBusy !== key) {
      this._gasBusy = key;
      const per = E.range === "day" ? "hour" : E.range === "year" ? "month" : "day", V = this._gasPer(-1), ve = new Date(Math.min(+V.e, +V.s + (+P.end - +P.s)));
      Promise.all([this._gasQ(P.s, P.end, per), this._gasQ(V.s, ve, per).catch(() => null)]).then(([cur, prev]) => { this._gasH = { key, ts: Date.now(), per, cur, prev }; })
        .catch(() => { this._gasH = { key, ts: Date.now() - 27e4, per, cur: null, prev: null, err: true }; })  /* in 30 s neu versuchen */
        .finally(() => { if (this._gasBusy === key) this._gasBusy = null; if (this._mdActive() === "en" && !this._dragging) this._render(); });
    }
    /* Laufendes Abrechnungsjahr und das davor (für die Hochrechnung), monatlich */
    const by = this._gasBy(Date.now()), bk = `${c.ent}:${c.start}:${by}`;
    if (!(this._gasB && this._gasB.key === bk && Date.now() - this._gasB.ts < 6e5) && this._gasBBusy !== bk) {
      this._gasBBusy = bk;
      this._gasQ(this._gasByS(by - 1), new Date(), "month").then((l) => { this._gasB = { key: bk, ts: Date.now(), by, list: l }; })
        .catch(() => { this._gasB = { key: bk, ts: Date.now() - 57e4, by, list: null }; })
        .finally(() => { if (this._gasBBusy === bk) this._gasBBusy = null; if (this._mdActive() === "en" && !this._dragging) this._render(); });
    }
  }
  /* Seit Abrechnungsbeginn: Verbrauch, Kosten, Abschläge und Hochrechnung mit dem Verlauf des Vorjahrs */
  _gasBill() {
    const c = this._gasCfg(), B = this._gasB; if (!B || !B.list) return "";
    const now = new Date(), y = B.by, s = this._gasByS(y), e = this._gasByS(y + 1), pr = this._gasPrice(y);
    const cur = B.list.filter((x) => x.t >= +s), old = B.list.filter((x) => x.t < +s), f = (v) => num(v, v >= 100 ? 0 : 1);
    const kwh = cur.reduce((a, x) => a + this._gasKwh(x.v), 0), cost = this._gasCost(cur) + this._gasGrund(s, now);
    const mon = (now.getFullYear() - s.getFullYear()) * 12 + now.getMonth() - s.getMonth() + 1, paid = (c.abschlag || 0) * mon;
    /* Rest des Jahres: gleiche Monate des Vorjahrs zum aktuellen Preis (laufender Monat anteilig) */
    let est = null;
    if (old.length >= 6) {
      const mi = (t) => { const d = new Date(t); return (d.getFullYear() - s.getFullYear() + 1) * 12 + d.getMonth() - s.getMonth(); };  /* Monat 0–11 im Vorjahr */
      const ld = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(), part = 1 - (now.getDate() - 1 + now.getHours() / 24) / ld;
      let rest = 0; old.forEach((x) => { const i = mi(x.t); if (i > mon - 1) rest += this._gasKwh(x.v); else if (i === mon - 1) rest += this._gasKwh(x.v) * part; });
      est = { kwh: kwh + rest, cost: cost + rest * pr.price / 100 + this._gasGrund(now, e) };
    }
    const tot = (c.abschlag || 0) * 12, diff = est && tot ? tot - est.cost : null, bal = paid - cost;
    return `<div class="gasbill"><div class="gasbh">${ic("clock", 15)}<b>Seit Abrechnungsbeginn</b><span>${esc(this._gasByLbl(y))}</span></div>
      <div class="enrows"><div><span>Verbraucht</span><b>${f(kwh)} kWh · ${num(cost, 2)} €</b></div>
      ${c.abschlag ? `<div><span>Abschläge bezahlt (${mon} × ${num(c.abschlag, 2)} €)</span><b>${num(paid, 2)} €</b></div><div><span>Stand heute</span><b class="${bal >= 0 ? "pos" : "neg"}">${bal >= 0 ? "+" : "−"}${num(Math.abs(bal), 2)} €</b></div>` : ""}
      ${est ? `<div><span>Hochrechnung ganzes Jahr</span><b>${f(est.kwh)} kWh · ${num(est.cost, 2)} €</b></div>` : ""}
      ${diff != null ? `<div><span>Voraussichtlich bei der Abrechnung</span><b class="${diff >= 0 ? "pos" : "neg"}">${diff >= 0 ? "Guthaben" : "Nachzahlung"} ${num(Math.abs(diff), 2)} €</b></div>` : ""}</div>
      ${est ? `<div class="mut sm" style="margin:4px 0 0">Hochrechnung: restliche Monate wie im Vorjahr, zum Preis des laufenden Abrechnungsjahrs.</div>` : ""}</div>`;
  }
  _gasCard() {
    if (!this._gasOn()) return "";
    this._gasLoad();
    const c = this._gasCfg(), H = this._gasH, E = this._enState(), P = this._gasPer(), st = this._hass.states[c.ent], m3 = this._gasUnit() === "m3";
    const per = P.by != null ? `Abrechnungsjahr ${this._gasByLbl(P.by)}` : this._enLabel(this._enPer());
    const head = `<h2>${ic("flame", 18)}Gas · ${esc(per)}${st ? `<span class="gasmr">Zähler ${num(parseFloat(st.state), m3 ? 1 : 0)} ${m3 ? "m³" : "kWh"}</span>` : ""}</h2>`;
    if (!H || H.key !== this._gasKey()) return `<div class="card gasc">${head}<div class="mut sm">Lade Gasverbrauch …</div></div>`;
    if (H.err || !H.cur) return `<div class="card gasc">${head}<div class="mut sm">Die Langzeitstatistik des Gaszählers konnte nicht geladen werden. Der Sensor braucht die Zustandsklasse „total_increasing“.</div></div>`;
    const sum = (l) => (l || []).reduce((a, x) => a + x.v, 0), raw = sum(H.cur), kwh = this._gasKwh(raw);
    const days = Math.max(1 / 24, (+P.end - +P.s) / 864e5), grund = this._gasGrund(P.s, P.end), cost = this._gasCost(H.cur) + grund;
    const pk = H.prev && H.prev.length ? this._gasKwh(sum(H.prev)) : null, cmpOn = E.cmp !== "off" && pk != null && pk > 0.05;
    const d = cmpOn ? Math.round((kwh - pk) / pk * 100) : null, cl = P.by != null ? "zum Vorjahr" : this._enCmpLbl();
    const cmp = d != null && isFinite(d) ? `<span class="tcmp ${d === 0 ? "" : d > 0 ? "dn" : "up"}">${d > 0 ? "▲" : d < 0 ? "▼" : "="} ${Math.abs(d)} %</span> ${cl}` : "";
    const f = (v) => num(v, v >= 100 ? 0 : v >= 10 ? 1 : 2);
    /* Balken: Stunden (Tag), Tage (Woche/Monat), Monate (Jahr bzw. Abrechnungsjahr) */
    const MN = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"], n = E.range === "day" ? 24 : P.n;
    const slot = (t) => { const x = new Date(t); return E.range === "day" ? x.getHours() : E.range === "year" ? (x.getFullYear() - P.s.getFullYear()) * 12 + x.getMonth() - P.s.getMonth() : Math.round((new Date(x.getFullYear(), x.getMonth(), x.getDate()) - P.s) / 864e5); };
    const b = Array(n).fill(0); H.cur.forEach((x) => { const i = slot(x.t); if (i >= 0 && i < n) b[i] += this._gasKwh(x.v); });
    const mx = Math.max(...b, 0.1), lbl = (i) => E.range === "day" ? (i % 6 === 0 ? `${i} Uhr` : "") : E.range === "year" ? MN[(P.s.getMonth() + i) % 12] : (n <= 7 ? ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"][i] : (i === 0 || (i + 1) % 5 === 0 ? String(i + 1) : ""));
    const bars = `<div class="gasbars" style="--n:${n}" role="img" aria-label="Gasverbrauch ${esc(per)}">${b.map((v, i) => `<div class="gasb" title="${f(v)} kWh"><i style="height:${Math.max(v > 0 ? 3 : 0, v / mx * 100).toFixed(1)}%"></i><span>${lbl(i)}</span></div>`).join("")}</div>`;
    const avg = E.range !== "day" && days >= 1 ? `<div><span>Ø pro Tag</span><b>${f(kwh / days)} kWh</b></div>` : "";
    const ys = [...new Set([this._gasBy(P.s), this._gasBy(Math.max(+P.s, +P.end - 1))])], prs = ys.map((y) => this._gasPrice(y));
    const prTxt = ys.length > 1 && prs[0].price !== prs[1].price ? `${num(prs[0].price, 2)} → ${num(prs[1].price, 2)} ct/kWh` : `${num(prs[prs.length - 1].price, 2)} ct/kWh`;
    return `<div class="card gasc">${head}
      <div class="gask"><div class="gasv"><small>Verbrauch</small><b>${f(kwh)}<em>kWh</em></b><span>${m3 ? `${num(raw, raw >= 100 ? 0 : 2)} m³` : "&nbsp;"}</span></div>
        <div class="gasv"><small>Kosten</small><b>${num(cost, 2)}<em>€</em></b><span>${grund > 0 ? `inkl. ${num(grund, 2)} € Grundpreis` : "&nbsp;"}</span></div>
        <div class="gasv"><small>Vergleich</small><b class="gascmp">${cmp || "–"}</b><span>${pk != null ? `vorher ${f(pk)} kWh` : "&nbsp;"}</span></div></div>
      ${bars}
      <div class="enrows">${avg}<div><span>Arbeitspreis</span><b>${prTxt}${m3 ? ` · ${num(c.brw, 2)} kWh/m³` : ""}</b></div></div>
      ${this._gasBill()}
      ${this._admin() ? `<div class="mut sm" style="margin:6px 0 0">Preise, Abschlag und Abrechnungsjahr unter <button class="lnk" data-act="mdensetup">Energiequellen → Gas</button>.</div>` : ""}</div>`;
  }
  _gasSetHtml() {
    const c = this._gasCfg(), m3 = !c.ent || this._gasUnit() === "m3";
    const inp = (k, v, l, u, step, y) => `<label class="gasin"><span>${l}</span><span class="gasinw"><input class="otxt" type="number" inputmode="decimal" step="${step}" min="0" value="${v == null ? "" : esc(String(v))}"${y != null ? ` placeholder="${esc(String(k === "price" ? c.price : c.grund))}" data-y="${y}"` : ""} data-f="engas" data-k="${k}" aria-label="${l}${y != null ? " " + y : ""}"><em>${u}</em></span></label>`;
    const MON = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    const cy = this._gasBy(Date.now()), yrs = [cy, cy - 1, cy - 2, ...Object.keys(c.years).map(Number)].filter((y, i, a) => a.indexOf(y) === i).sort((a, b) => b - a);
    return `<div class="lsec">${ic("flame", 15)}Gas (optional)</div>
      <div class="mut sm" style="margin:2px 0 0">Gaszähler – Zählerstand in m³ oder kWh</div>${this._wzSel(this._gasSensors(), c.ent, "engas", `data-k="ent"`, "– kein Gaszähler –")}
      ${c.ent ? `<div class="gasins">${m3 ? inp("brw", c.brw, "Brennwert × Zustandszahl", "kWh/m³", "0.01") : ""}
        <label class="gasin"><span>Abrechnungsjahr beginnt im</span><select class="otxt" data-f="engas" data-k="start" aria-label="Abrechnungsjahr beginnt im">${MON.map((m, i) => `<option value="${i + 1}"${c.start === i + 1 ? " selected" : ""}>${m}</option>`).join("")}</select></label>
        ${inp("abschlag", c.abschlag || null, "Abschlag (optional)", "€/Monat", "0.01")}</div>
      <div class="mut sm" style="margin:10px 0 2px"><b>Preise je Abrechnungsjahr</b> – leere Felder nutzen den Standardpreis</div>
      <div class="gasyrs"><div class="gasyr std">${inp("price", c.price, "Standard · Arbeitspreis", "ct/kWh", "0.01")}${inp("grund", c.grund, "Grundpreis", "€/Jahr", "1")}</div>
        ${yrs.map((y) => { const o = c.years[String(y)] || {}; return `<div class="gasyr">${inp("price", o.price, `${this._gasByLbl(y)}${y === cy ? " (läuft)" : ""}`, "ct/kWh", "0.01", y)}${inp("grund", o.grund, "Grundpreis", "€/Jahr", "1", y)}</div>`; }).join("")}</div>
      <div class="gst">${ic("info", 15)}<span>${m3 ? "Brennwert und Zustandszahl stehen auf deiner Gasrechnung (Erdgas meist etwa 10–11 kWh je m³, Flüssiggas etwa 25–28 kWh je m³). " : ""}Jede Stunde und jeder Tag wird mit dem Preis des Abrechnungsjahrs gerechnet, in das er fällt. Der Zähler muss als Langzeitstatistik geführt werden (Zustandsklasse „total_increasing“), z. B. ein Gas-Sensor aus dem Energie-Dashboard.</span></div>` : ""}`;
  }
  _gasChange(t) {
    const k = t.dataset.k, c = this._gasCfg();
    if (k === "ent") { this._gasSave({ ent: t.value || "" }); return true; }
    if (k === "start") { this._gasSave({ start: Math.min(12, Math.max(1, parseInt(t.value, 10) || 1)) }); return true; }
    const s = String(t.value || "").trim().replace(",", "."), v = parseFloat(s), lim = { brw: 40, price: 100, grund: 2000, abschlag: 2000 }[k] || 100;
    if (t.dataset.y) {  /* Preis eines Abrechnungsjahrs; leer = Standard */
      const y = t.dataset.y, yrs = JSON.parse(JSON.stringify(c.years)), o = { ...(yrs[y] || {}) };
      if (s === "" || !isFinite(v) || v < 0) delete o[k]; else o[k] = Math.min(lim, v);
      if (Object.keys(o).length) yrs[y] = o; else delete yrs[y];
      this._gasSave({ years: yrs }); return true;
    }
    if (k === "abschlag" && s === "") { this._gasSave({ abschlag: 0 }); return true; }
    if (!isFinite(v) || v < 0) return true;
    this._gasSave({ [k]: Math.min(lim, v) });
    return true;
  }
