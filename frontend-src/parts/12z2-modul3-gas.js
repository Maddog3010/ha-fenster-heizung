  /* ================= Modul 3 · Gaszähler (b35) =================
     Ein Zählerstand-Sensor (m³ oder kWh, Langzeitstatistik in Home Assistant). Gespeichert im Haus unter "gas" (für alle Nutzer).
     m³ werden mit Brennwert × Zustandszahl (steht auf der Gasrechnung) in kWh umgerechnet. Kosten = kWh × Arbeitspreis + Grundpreis anteilig. */
  _gasCfg() { return { ent: "", brw: 10.5, price: 12, grund: 0, ...(((this._haus || {}).gas) || {}) }; }
  _gasOn() { return !!this._gasCfg().ent; }
  _gasUnit() { const c = this._gasCfg(), s = this._hass.states[c.ent], u = ((s && s.attributes.unit_of_measurement) || "").replace("m3", "m³"); return /Wh$/i.test(u) ? "kwh" : "m3"; }
  _gasKwh(v) { return this._gasUnit() === "m3" ? v * this._gasCfg().brw : v; }
  _gasSave(patch) {
    if (!this._admin()) return;
    const g = { ...this._gasCfg(), ...patch };
    this._haus = { ...(this._haus || {}), gas: g }; this._gasH = null;
    this._hass.callWS({ type: "fenster_heizung/haus_set", haus: { gas: g } }).then((r) => { if (r && r.haus) this._haus = r.haus; }).catch(() => this._toast("Gas-Einstellung konnte nicht gespeichert werden"))
      .finally(() => { if (this._modal) this._renderModal(); this._render(); });
  }
  _gasSensors() {
    const st = this._hass.states;
    return Object.keys(st).filter((e) => { if (!e.startsWith("sensor.")) return false; const a = st[e].attributes || {}; return a.device_class === "gas" || /^(m³|m3|ft³|CCF)$/.test(a.unit_of_measurement || "") || (/gas/i.test(e + " " + (a.friendly_name || "")) && /^[kM]?Wh$/.test(a.unit_of_measurement || "")); });
  }
  _gasLoad() {
    const c = this._gasCfg(), E = this._enState(); if (!this._hass || !c.ent) return;
    const key = `${E.range}:${E.off || 0}:${c.ent}`, P = this._enPer();
    if (this._gasH && this._gasH.key === key && (!P.cur || Date.now() - this._gasH.ts < 3e5)) return;
    if (this._gasBusy === key) return; this._gasBusy = key;
    const per = E.range === "day" ? "hour" : E.range === "year" ? "month" : "day", V = this._enPer(-1), ve = new Date(Math.min(+V.e, +V.s + (+P.end - +P.s)));
    const q = (s, e) => this._hass.callWS({ type: "recorder/statistics_during_period", start_time: s.toISOString(), end_time: e.toISOString(), statistic_ids: [c.ent], period: per, types: ["change"], units: { volume: "m³", energy: "kWh" } }).then((r) => ((r || {})[c.ent] || []).map((x) => ({ t: typeof x.start === "number" ? x.start : Date.parse(x.start), v: Math.max(0, Number(x.change) || 0) })));
    Promise.all([q(P.s, P.end), q(V.s, ve).catch(() => null)]).then(([cur, prev]) => { this._gasH = { key, ts: Date.now(), per, cur, prev, s: +P.s }; })
      .catch(() => { this._gasH = { key, ts: Date.now() - 27e4, per, cur: null, prev: null, err: true }; })  /* in 30 s neu versuchen */
      .finally(() => { if (this._gasBusy === key) this._gasBusy = null; if (this._mdActive() === "en" && !this._dragging) this._render(); });
  }
  _gasCard() {
    if (!this._gasOn()) return "";
    this._gasLoad();
    const c = this._gasCfg(), H = this._gasH, E = this._enState(), P = this._enPer(), per = this._enLabel(P), st = this._hass.states[c.ent], m3 = this._gasUnit() === "m3";
    const head = `<h2>${ic("flame", 18)}Gas · ${esc(per)}${st ? `<span class="gasmr">Zähler ${num(parseFloat(st.state), m3 ? 1 : 0)} ${m3 ? "m³" : "kWh"}</span>` : ""}</h2>`;
    if (!H || H.key !== `${E.range}:${E.off || 0}:${c.ent}`) return `<div class="card gasc">${head}<div class="mut sm">Lade Gasverbrauch …</div></div>`;
    if (H.err || !H.cur) return `<div class="card gasc">${head}<div class="mut sm">Die Langzeitstatistik des Gaszählers konnte nicht geladen werden. Der Sensor braucht die Zustandsklasse „total_increasing“.</div></div>`;
    const sum = (l) => (l || []).reduce((a, x) => a + x.v, 0), raw = sum(H.cur), kwh = this._gasKwh(raw);
    const days = Math.max(1 / 24, (+P.end - +P.s) / 864e5), grund = (c.grund || 0) * days / 365, cost = kwh * c.price / 100 + grund;
    const pk = H.prev && H.prev.length ? this._gasKwh(sum(H.prev)) : null, cmpOn = E.cmp !== "off" && pk != null && pk > 0.05;
    const d = cmpOn ? Math.round((kwh - pk) / pk * 100) : null;
    const cmp = d != null && isFinite(d) ? `<span class="tcmp ${d === 0 ? "" : d > 0 ? "dn" : "up"}">${d > 0 ? "▲" : d < 0 ? "▼" : "="} ${Math.abs(d)} %</span> ${this._enCmpLbl()}` : "";
    const f = (v) => num(v, v >= 100 ? 0 : v >= 10 ? 1 : 2);
    /* Balken: Stunden (Tag), Tage (Woche/Monat), Monate (Jahr) */
    const n = E.range === "day" ? 24 : P.n, slot = (t) => { const x = new Date(t); return E.range === "day" ? x.getHours() : E.range === "year" ? x.getMonth() : Math.round((new Date(x.getFullYear(), x.getMonth(), x.getDate()) - P.s) / 864e5); };
    const b = Array(n).fill(0); H.cur.forEach((x) => { const i = slot(x.t); if (i >= 0 && i < n) b[i] += this._gasKwh(x.v); });
    const mx = Math.max(...b, 0.1), lbl = (i) => E.range === "day" ? (i % 6 === 0 ? `${i} Uhr` : "") : E.range === "year" ? ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i] : (n <= 7 ? ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"][i] : (i === 0 || (i + 1) % 5 === 0 ? String(i + 1) : ""));
    const bars = `<div class="gasbars" style="--n:${n}" role="img" aria-label="Gasverbrauch ${esc(per)}">${b.map((v, i) => `<div class="gasb" title="${f(v)} kWh"><i style="height:${Math.max(v > 0 ? 3 : 0, v / mx * 100).toFixed(1)}%"></i><span>${lbl(i)}</span></div>`).join("")}</div>`;
    const avg = E.range !== "day" && days >= 1 ? `<div><span>Ø pro Tag</span><b>${f(kwh / Math.min(days, P.n))} kWh</b></div>` : "";
    return `<div class="card gasc">${head}
      <div class="gask"><div class="gasv"><small>Verbrauch</small><b>${f(kwh)}<em>kWh</em></b><span>${m3 ? `${num(raw, raw >= 100 ? 0 : 2)} m³` : "&nbsp;"}</span></div>
        <div class="gasv"><small>Kosten</small><b>${num(cost, 2)}<em>€</em></b><span>${grund > 0 ? `inkl. ${num(grund, 2)} € Grundpreis` : "&nbsp;"}</span></div>
        <div class="gasv"><small>Vergleich</small><b class="gascmp">${cmp || "–"}</b><span>${pk != null ? `vorher ${f(pk)} kWh` : "&nbsp;"}</span></div></div>
      ${bars}
      <div class="enrows">${avg}<div><span>Arbeitspreis</span><b>${num(c.price, 2)} ct/kWh${m3 ? ` · ${num(c.brw, 2)} kWh/m³` : ""}</b></div></div>
      ${this._admin() ? `<div class="mut sm" style="margin:6px 0 0">Preise und Umrechnung unter <button class="lnk" data-act="mdensetup">Energiequellen → Gas</button>.</div>` : ""}</div>`;
  }
  _gasSetHtml() {
    const c = this._gasCfg(), m3 = !c.ent || this._gasUnit() === "m3";
    const inp = (k, v, l, u, step) => `<label class="gasin"><span>${l}</span><span class="gasinw"><input class="otxt" type="number" inputmode="decimal" step="${step}" min="0" value="${esc(String(v))}" data-f="engas" data-k="${k}" aria-label="${l}"><em>${u}</em></span></label>`;
    return `<div class="lsec">${ic("flame", 15)}Gas (optional)</div>
      <div class="mut sm" style="margin:2px 0 0">Gaszähler – Zählerstand in m³ oder kWh</div>${this._wzSel(this._gasSensors(), c.ent, "engas", `data-k="ent"`, "– kein Gaszähler –")}
      ${c.ent ? `<div class="gasins">${m3 ? inp("brw", c.brw, "Brennwert × Zustandszahl", "kWh/m³", "0.01") : ""}${inp("price", c.price, "Arbeitspreis", "ct/kWh", "0.01")}${inp("grund", c.grund, "Grundpreis", "€/Jahr", "1")}</div>
      <div class="gst">${ic("info", 15)}<span>${m3 ? "Brennwert und Zustandszahl stehen auf deiner Gasrechnung (meist zusammen etwa 10–11 kWh je m³). " : ""}Der Zähler muss als Langzeitstatistik geführt werden (Zustandsklasse „total_increasing“), z. B. ein Gas-Sensor aus dem Energie-Dashboard.</span></div>` : ""}`;
  }
  _gasChange(t) {
    const k = t.dataset.k;
    if (k === "ent") { this._gasSave({ ent: t.value || "" }); return true; }
    const v = parseFloat(String(t.value || "").replace(",", ".")); if (!isFinite(v) || v < 0) return true;
    this._gasSave({ [k]: k === "brw" ? Math.min(20, v) : k === "price" ? Math.min(100, v) : Math.min(2000, v) });
    return true;
  }
