  _betaBox(txt) { return `<div class="betabox">${ic("alert", 20)}<div><b>Beta-Version – dieses Modul ist noch in Entwicklung</b>Funktionen können sich ändern oder fehlen noch. ${txt} Rückmeldungen helfen: <a href="https://github.com/Maddog3010/ha-fenster-heizung/issues" target="_blank" rel="noopener">Fehler oder Wunsch melden</a>.</div></div>`; }
  _betaSoon(ico, t, d) { return `<div class="card lusoon">${ic(ico, 26)}<div><b>${t}</b><span class="mut">${d}</span></div><em class="beta">In Entwicklung</em></div>`; }
  _betaPage(id) { return id === "sp" ? this._spPage() : id === "wa" ? this._waPage() : id === "bt" ? this._btPage() : id === "dt" ? this._dtPage() : id === "sf" ? this._sfPage() : id === "pl" ? this._plPage() : id === "wx" ? this._wxPage() : id === "ga" ? this._gaPage() : id === "ev" ? this._evPage() : id === "rb" ? this._rbPage() : id === "wp" ? this._wpPage() : this._luPage(); }
  _spPage() {
    const tag = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"], now = new Date(), tdy = 14.2, tom = 9.6, got = 9.1;
    const hist = [[-6, 11.8, 12.4], [-5, 6.2, 5.1], [-4, 13.5, 14.1], [-3, 15.1, 13.8], [-2, 8.4, 9.0], [-1, 10.9, 10.2]];
    const mx = 16, bh = (v) => Math.round((v / mx) * 120), dev = hist.reduce((a, x) => a + (x[2] - x[1]), 0) / hist.reduce((a, x) => a + x[1], 0) * 100;
    const col = (d, f, a, today) => { const dn = new Date(now.getTime() + d * 864e5).getDay(); return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px"><div style="display:flex;align-items:flex-end;gap:3px;height:124px"><div title="Prognose ${num(f, 1)} kWh" style="width:16px;height:${bh(f)}px;border-radius:4px 4px 0 0;background:#f59e0b;opacity:.45"></div>${a != null ? `<div title="Tatsächlich ${num(a, 1)} kWh" style="width:16px;height:${bh(a)}px;border-radius:4px 4px 0 0;background:#f59e0b"></div>` : ""}</div><span class="mut" style="font-size:.72rem;${today ? "font-weight:700" : ""}">${today ? "Heute" : tag[dn]}</span></div>`; };
    const bars = hist.map((x) => col(x[0], x[1], x[2])).join("") + col(0, tdy, got, true) + col(1, tom, null);
    const tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    const pc = Math.round((got / tdy) * 100);
    return `${this._betaBox("Alle Werte sind Beispiele. Echte Prognose-Sensoren (zum Beispiel Forecast.Solar) wählst du später in den Einstellungen.")}
      <div class="card"><h2>${ic("sun", 18)}Ertrag heute und morgen (Beispiel)</h2><div class="lugrid">
        ${tile("Heute, Prognose", num(tdy, 1) + " kWh", "Gesamter Tag")}
        ${tile("Heute, bisher", num(got, 1) + " kWh", pc + " % der Tagesprognose")}
        ${tile("Morgen, Prognose", num(tom, 1) + " kWh", tom < tdy ? "Weniger als heute" : "Mehr als heute")}
        ${tile("Abweichung 6 Tage", (dev >= 0 ? "+" : "") + num(dev, 1) + " %", dev >= 0 ? "Ertrag über der Prognose" : "Ertrag unter der Prognose")}</div></div>
      <div class="card"><h2>${ic("chart", 18)}Prognose gegen tatsächlich (Beispiel)</h2>
        <div style="display:flex;gap:6px;margin-top:10px;align-items:flex-end">${bars}</div>
        <div class="gst" style="margin-top:10px;flex-wrap:wrap"><span style="display:inline-flex;align-items:center;gap:5px;margin-right:14px"><i style="width:10px;height:10px;border-radius:3px;background:#f59e0b;opacity:.45"></i>Prognose</span><span style="display:inline-flex;align-items:center;gap:5px"><i style="width:10px;height:10px;border-radius:3px;background:#f59e0b"></i>Tatsächlich</span><span style="margin-left:12px">kWh pro Tag</span></div></div>
      ${this._betaSoon("sun", "Prognose-Sensoren wählen", "Heute, morgen und stündlicher Verlauf aus Home Assistant")}
      ${this._betaSoon("chart", "Vergleich mit dem Ertrag", "Tatsächlicher Ertrag aus Modul 3, dazu Trefferquote über Wochen")}
      ${this._betaSoon("clock", "Beste Zeit für Verbraucher", "Hinweis, wann Waschen, Laden oder Bewässern am meisten Solarstrom nutzt")}`;
  }
  _waPage() {
    const day = 864e5, now = Date.now(), fmt = (d) => new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
    const items = [["Lüftungsfilter wechseln", "Alle 3 Monate", now + 12 * day, "fan"], ["Schornsteinfeger", "Jährliche Messung", now + 38 * day, "flame"], ["Heizungswartung", "Jährlich, Fachbetrieb", now + 120 * day, "tools"], ["Zisternenfilter reinigen", "Alle 6 Monate", now + 160 * day, "drop"]];
    const rest = (t) => Math.round((t - now) / day), tone = (d) => (d < 0 ? "#ef4444" : d <= 14 ? "#f59e0b" : "#22c55e");
    const row = (x) => { const d = rest(x[2]); return `<div class="luroom"><b>${ic(x[3], 16)} ${x[0]}</b><span style="color:${tone(d)};font-weight:700">${d < 0 ? `${-d} Tage überfällig` : d === 0 ? "Heute fällig" : `in ${d} Tagen`}</span><span class="mut">${x[1]} · ${fmt(x[2])}</span></div>`; };
    const hrs = [["Wärmepumpe", 4820, 5000], ["Zirkulationspumpe", 9340, 20000]];
    const hrow = (x) => { const pc = Math.min(100, Math.round((x[1] / x[2]) * 100)), c = pc >= 90 ? "#f59e0b" : "#22c55e"; return `<div class="luroom"><b>${ic("clock", 16)} ${x[0]}</b><span class="lv">${num(x[1], 0)} h</span><div style="height:8px;border-radius:5px;background:rgba(127,127,127,.25);overflow:hidden;margin:4px 0"><div style="width:${pc}%;height:100%;background:${c}"></div></div><span class="mut">Nächste Wartung bei ${num(x[2], 0)} h (${pc} %)</span></div>`; };
    const soon = items.filter((x) => rest(x[2]) <= 30).length, tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    return `${this._betaBox("Die Einträge sind Beispiele. Eigene Termine, Filter und Zähler richtest du später in den Einstellungen ein.")}
      <div class="card"><h2>${ic("tools", 18)}Überblick</h2><div class="gst" style="margin-bottom:10px">${ic("alert", 15)}${soon === 1 ? "1 Termin ist" : soon + " Termine sind"} in den nächsten 30 Tagen fällig.</div>
        <div class="lugrid">${tile("Fällig in 30 Tagen", String(soon), "Zum Beispiel Filter und Schornsteinfeger")}${tile("Überfällig", "0", "Nichts versäumt")}${tile("Termine gesamt", String(items.length), "Beispieleinträge")}</div></div>
      <div class="card"><h2>${ic("clock", 18)}Termine (Beispiel)</h2><div class="lugrid">${items.map(row).join("")}</div></div>
      <div class="card"><h2>${ic("tools", 18)}Betriebsstunden (Beispiel)</h2><div class="lugrid">${hrs.map(hrow).join("")}</div></div>
      ${this._betaSoon("plus", "Eigene Termine anlegen", "Name, Abstand und nächstes Datum, mit Erledigt-Knopf")}
      ${this._betaSoon("bell", "Erinnerung", "Aufs Handy, einige Tage vor dem Termin")}
      ${this._betaSoon("clock", "Betriebsstunden aus Sensoren", "Zähler aus Home Assistant lesen und Wartung bei Stundenzahl melden")}`;
  }
  _btPage() {
    const soc = this._soc(), p = this._pv(), pv = this._pvNow();
    const modes = [["sun", "PV laden", "Überschuss in die Batterie"], ["shield", "Halten", "Ladestand nicht verändern"], ["home", "Haus aus Batterie", "Verbrauch aus dem Speicher decken"], ["energy", "Netzladen", "Bei günstigem Strom aus dem Netz laden"]];
    const mc = modes.map((m, i) => `<div class="luroom ${i ? "off" : ""}"><b>${ic(m[0], 16)} ${m[1]}</b><span class="mut">${m[2]}</span></div>`).join("");
    const seg = [[0, 6, "#6366f1", "Netzladen"], [6, 10, "#64748b", "Halten"], [10, 16, "#f59e0b", "PV laden"], [16, 22, "#22c55e", "Haus aus Batterie"], [22, 24, "#64748b", "Halten"]];
    const bar = seg.map((x) => `<div title="${x[3]}" style="flex:${x[1] - x[0]};background:${x[2]};opacity:.85"></div>`).join("");
    const tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    return `${this._betaBox("Die Planung ist eine Vorschau mit Beispielwerten. Es wird nichts an der Batterie geschaltet.")}
      <div class="card"><h2>${ic("energy", 18)}Speicher jetzt</h2><div class="lugrid">
        ${tile("Ladestand", soc != null ? num(soc, 0) + " %" : "–", soc != null ? "Aus dem Sensor in Modul 1" : "Noch kein Ladestand-Sensor gewählt")}
        ${tile("PV-Überschuss", pv != null ? wfmt(pv) : "–", pv != null ? "Verfügbar zum Laden" : "Noch kein Sensor gewählt")}
        ${tile("Untergrenze", p.soc_min != null && p.soc_sensor ? num(p.soc_min, 0) + " %" : "–", "Heizer erst darüber (Modul 1)")}</div></div>
      <div class="card"><h2>${ic("sliders", 18)}Betriebsarten</h2><div class="lugrid">${mc}</div></div>
      <div class="card"><h2>${ic("clock", 18)}Beispiel-Zeitplan</h2>
        <div style="display:flex;height:26px;border-radius:8px;overflow:hidden;margin:8px 0 4px">${bar}</div>
        <div style="display:flex;justify-content:space-between" class="mut sm"><span>0 Uhr</span><span>6</span><span>12</span><span>18</span><span>24</span></div>
        <div class="gst" style="margin-top:10px;flex-wrap:wrap">${seg.map((x) => `<span style="display:inline-flex;align-items:center;gap:5px;margin-right:12px"><i style="width:10px;height:10px;border-radius:3px;background:${x[2]}"></i>${x[3]}</span>`).join("")}</div></div>
      ${this._betaSoon("sliders", "Ladestand-Grenzen", "Untere und obere Grenze je Betriebsart festlegen")}
      ${this._betaSoon("clock", "Zeitplan", "Betriebsart nach Uhrzeit und Wochentag wählen")}
      ${this._betaSoon("bolt", "Netzladen nach Preis", "Nur laden, wenn der Strom günstig ist (Modul 14)")}`;
  }
  _dtPrices() {
    const p = this._pv(), e = p.price_sensor && this._hass.states[p.price_sensor]; if (!e) return null;
    const a = e.attributes || {}, raw = a.raw_today || a.prices_today || a.today || a.prices;
    if (!Array.isArray(raw) || raw.length < 12) return null;
    const vals = raw.map((x) => Number(typeof x === "object" && x ? (x.value ?? x.price) : x));
    if (vals.some((v) => !isFinite(v))) return null;
    const f = vals.every((v) => Math.abs(v) < 5) ? 100 : 1, per = vals.length > 30 ? 4 : 1;
    const h = []; for (let i = 0; i < 24; i++) { let t = 0, n = 0; for (let k = 0; k < per; k++) { const v = vals[i * per + k]; if (v != null) { t += v; n++; } } h.push(n ? (t / n) * f : null); }
    return h.every((v) => v != null) ? h : null;
  }
  _dtPage() {
    const h = this._dtPrices(), now = new Date().getHours(), tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    let body = `<div class="card empty">${ic("chart", 30)}<div style="margin-top:8px">Noch keine Stundenpreise. Wähle in Modul 1 unter „Strompreis“ einen Sensor mit Preisliste (zum Beispiel Tibber, Awattar oder Nord Pool).</div></div>`;
    if (h) {
      const mn = Math.min(...h), mx = Math.max(...h), avg = h.reduce((a, b) => a + b, 0) / 24, span = Math.max(mx - mn, 0.01);
      const col = (v) => (v - mn) / span < 0.34 ? "#22c55e" : (v - mn) / span < 0.67 ? "#f59e0b" : "#ef4444";
      let bi = 0, bs = Infinity; for (let i = 0; i <= 21; i++) { const sm = h[i] + h[i + 1] + h[i + 2]; if (sm < bs) { bs = sm; bi = i; } }
      const bars = h.map((v, i) => `<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:3px" title="${i}:00 · ${num(v, 1)} ct/kWh"><div style="width:100%;height:${Math.round(12 + ((v - mn) / span) * 108)}px;border-radius:4px 4px 0 0;background:${col(v)};opacity:${i < now ? 0.4 : 0.95};${i === now ? "outline:2px solid var(--primary-text-color);outline-offset:1px" : ""}"></div><span class="mut" style="font-size:.62rem">${i % 3 === 0 ? i : ""}</span></div>`).join("");
      body = `<div class="card"><h2>${ic("chart", 18)}Preisverlauf heute</h2><div style="display:flex;align-items:flex-end;gap:2px;height:150px;margin-top:8px">${bars}</div>
        <div class="gst" style="margin-top:8px">Cent pro kWh, grün günstig, rot teuer. Der Rahmen zeigt die aktuelle Stunde.</div></div>
        <div class="card"><h2>${ic("clock", 18)}Günstigste Zeiten</h2><div class="lugrid">
          ${tile("Günstigste 3 Stunden", `${bi}–${bi + 3} Uhr`, `Ø ${num(bs / 3, 1)} ct/kWh · zum Laden und Waschen`)}
          ${tile("Günstigste Stunde", `${h.indexOf(mn)}:00 Uhr`, `${num(mn, 1)} ct/kWh`)}
          ${tile("Teuerste Stunde", `${h.indexOf(mx)}:00 Uhr`, `${num(mx, 1)} ct/kWh`)}</div></div>`;
      body = `<div class="card"><h2>${ic("bolt", 18)}Preis jetzt</h2><div class="lugrid">
          ${tile("Jetzt", num(h[now], 1) + " ct/kWh", h[now] <= avg ? "Unter dem Tagesschnitt" : "Über dem Tagesschnitt")}
          ${tile("Tagesschnitt", num(avg, 1) + " ct/kWh", `Spanne ${num(mn, 1)} bis ${num(mx, 1)} ct`)}
          ${tile("Nächste Stunde", num(h[(now + 1) % 24], 1) + " ct/kWh", h[(now + 1) % 24] < h[now] ? "Wird günstiger" : "Wird teurer")}</div></div>` + body;
    }
    return `${this._betaBox("Die Stundenpreise kommen aus dem Preis-Sensor, den du in Modul 1 gewählt hast.")}${body}
      ${this._betaSoon("clock", "Günstige Fenster", "Beste Zeit zum Laden, Waschen oder Heizen vorschlagen")}
      ${this._betaSoon("bell", "Preisalarm", "Melden, wenn der Preis unter oder über eine Grenze geht")}
      ${this._betaSoon("chart", "Morgen", "Preise des nächsten Tages, sobald sie veröffentlicht sind")}`;
  }
  /* Modul 11: Rauch- & Sicherheitsmelder (Alarme, Batterie, Erreichbarkeit, Prüf-Erinnerung, Aktionen und Meldungen laufen im Backend) */
  _sfxDef() { return { kinds: ["smoke", "co", "gas", "water", "heat", "safety"], excl: [], repeat: 10, bat: { on: true, pct: 20 }, off: { on: true, min: 60 }, test: { on: true, months: 6 }, acts: [], notify: { alarm: true, end: false, bat: true, off: true, test: true, to: [] } }; }
  _sfxNames() { return { smoke: "Rauch", co: "CO", gas: "Gas", water: "Wasser", heat: "Hitze", safety: "Sicherheit" }; }
  _sfxKind() { return { smoke: ["Rauchmelder", "flame"], co: ["CO-Melder", "alert"], gas: ["Gasmelder", "flame"], water: ["Wassermelder", "drop"], heat: ["Hitzemelder", "thermo"], safety: ["Sicherheitsmelder", "shield"] }; }
  _sfxLoad(force) {
    if (!this._hass || this._sfxBusy) return;
    if (!force && this._sfxD && Date.now() - this._sfxD.ts < 15000) return;
    this._sfxBusy = true;
    this._hass.callWS({ type: "fenster_heizung/sf_get" }).then((r) => { this._sfxD = { d: r || {}, ts: Date.now() }; }).catch(() => { this._sfxD = { d: { error: true }, ts: Date.now() }; })
      .finally(() => { this._sfxBusy = false; if (this._sfxVisible()) { this._render(); if (this._modal && this._modal.type === "sfset") this._renderModal(); } });
  }
  _sfxVisible() { return !!(this._modal && this._modal.type === "sfset") || (!!this._mdActive && this._mdActive() === "sf" && !this._stOpen); }
  _sfx() { const d = (this._sfxD && this._sfxD.d) || {}, df = this._sfxDef(), c = d.cfg || {}; return { ...d, cfg: { ...df, ...c, bat: { ...df.bat, ...(c.bat || {}) }, off: { ...df.off, ...(c.off || {}) }, test: { ...df.test, ...(c.test || {}) }, notify: { ...df.notify, ...(c.notify || {}) }, kinds: c.kinds || df.kinds, excl: c.excl || [], acts: c.acts || [] } }; }
  _sfxSave(cfg) {
    const s = this._sfx(); this._sfxD = { d: { ...s, cfg }, ts: Date.now() };
    clearTimeout(this._sfxT);
    this._sfxT = setTimeout(() => {
      this._sfxT = null;
      this._hass.callWS({ type: "fenster_heizung/sf_set", cfg: this._sfx().cfg }).then((r) => { this._sfxD = { d: r || {}, ts: Date.now() }; if (this._sfxVisible()) { this._render(); if (this._modal && this._modal.type === "sfset") this._renderModal(); } })
        .catch(() => this._toast("Die Einstellung konnte nicht gespeichert werden"));
    }, 500);
    this._render(); if (this._modal && this._modal.type === "sfset") this._renderModal();
  }
  _sfxPatch(fn) { const c = JSON.parse(JSON.stringify(this._sfx().cfg)); fn(c); this._sfxSave(c); }
  _sfxAct(a, b) {
    const k = b.dataset.k, i = Number(b.dataset.i), s = Number(b.dataset.s);
    if (a === "sfxopen") { this._sfxLoad(true); this._modal = { type: "sfset" }; this._renderModal(); return; }
    if (a === "sfxtest") { this._hass.callWS({ type: "fenster_heizung/sf_test" }).then((r) => this._toast(r && r.sent ? `Test an ${r.sent} ${r.sent === 1 ? "Dienst" : "Diensten"} gesendet` : "Kein Benachrichtigungsdienst gewählt")).catch(() => this._toast("Test fehlgeschlagen")); return; }
    if (a === "sfxtested") { this._hass.callWS({ type: "fenster_heizung/sf_tested" }).then((r) => { this._sfxD = { d: r || {}, ts: Date.now() }; this._render(); this._toast("Melder als geprüft eingetragen"); }).catch(() => this._toast("Das hat nicht geklappt")); return; }
    if (a === "sfxpress") { this._hass.callWS({ type: "fenster_heizung/sf_press", ent: k }).then((r) => { this._toast(r && r.ok ? "Test am Melder ausgelöst" : "Der Melder hat keinen Testknopf"); this._sfxLoad(true); }).catch(() => this._toast("Test fehlgeschlagen")); return; }
    if (a === "sfxgoig") { this._modal = null; this._renderModal(); this._sto = { q: "", c: "sicherheit" }; this._igOpen = true; this._render(); return; }
    this._sfxPatch((c) => {
      if (a === "sfxkind") c.kinds = c.kinds.includes(k) ? c.kinds.filter((x) => x !== k) : [...c.kinds, k];
      else if (a === "sfxexcl") c.excl = c.excl.includes(k) ? c.excl.filter((x) => x !== k) : [...c.excl, k];
      else if (a === "sfxrep") c.repeat = Math.min(60, Math.max(0, (Number(c.repeat) || 0) + s));
      else if (a === "sfxbat") c.bat.on = !c.bat.on;
      else if (a === "sfxbatp") c.bat.pct = Math.min(50, Math.max(5, (Number(c.bat.pct) || 20) + s));
      else if (a === "sfxoff") c.off.on = !c.off.on;
      else if (a === "sfxoffm") c.off.min = Number(k);
      else if (a === "sfxtst") c.test.on = !c.test.on;
      else if (a === "sfxtstm") c.test.months = Number(k);
      else if (a === "sfxn") c.notify[k] = !c.notify[k];
      else if (a === "sfxns") c.notify.to = c.notify.to.includes(k) ? c.notify.to.filter((x) => x !== k) : [...c.notify.to, k];
      else if (a === "sfxak") c.acts[i].kind = k;
      else if (a === "sfxad") c.acts[i].do = k;
      else if (a === "sfxrm") c.acts.splice(i, 1);
    });
  }
  _sfxChange(t) {
    const f = t.dataset.f, v = t.value || "";
    if (f === "sfxadd") { if (v) this._sfxPatch((c) => { if (c.acts.length < 12) c.acts.push({ id: "a" + Date.now().toString(36), kind: "smoke", ent: v, do: this._sfxDo(v)[0][0] }); }); return true; }
    if (f === "sfxent") { this._sfxPatch((c) => { const x = c.acts[Number(t.dataset.i)]; if (x && v) x.ent = v; }); return true; }
    return false;
  }
  /* Ohne Antwort vom Backend: Melder direkt aus den Zuständen lesen */
  _sfxDo(ent) { const d = String(ent).split(".")[0]; return d === "cover" ? [["open", "Öffnen"], ["close", "Schließen"]] : d === "script" || d === "scene" ? [["run", "Ausführen"]] : [["on", "Einschalten"], ["off", "Ausschalten"]]; }
  /* Ohne Antwort vom Backend: Melder direkt aus den Zuständen lesen */
  _sfxLocal() {
    const H = this._hass, E = H.entities || {}, K = { smoke: "smoke", carbon_monoxide: "co", gas: "gas", moisture: "water", heat: "heat", safety: "safety" }, KN = this._sfxKind();
    return Object.entries(H.states).filter(([id, e]) => id.startsWith("binary_sensor.") && K[(e.attributes || {}).device_class]).map(([id, e]) => {
      const a = e.attributes || {}, b = a.battery_level ?? a.battery, bv = b != null && isFinite(Number(b)) ? Number(b) : null, k = K[a.device_class];
      return { id, name: a.friendly_name || id, k, kind: KN[k][0], area: "", src: (E[id] || {}).platform || "", alarm: e.state === "on", off: e.state === "unavailable" || e.state === "unknown", bat: bv, test: "" };
    }).sort((x, y) => Number(y.alarm) - Number(x.alarm) || x.name.localeCompare(y.name, "de"));
  }
  _sfList() { const S = this._sfx(); return !S.error && S.det ? S.det : this._sfxLocal(); }
  _sfAgo(iso) { const t = iso ? new Date(iso).getTime() : NaN; if (!isFinite(t)) return ""; const m = Math.max(0, Math.round((Date.now() - t) / 60000)); return m < 1 ? "gerade eben" : m < 60 ? `vor ${m} Min.` : m < 1440 ? `vor ${Math.round(m / 60)} Std.` : `vor ${Math.round(m / 1440)} Tagen`; }
  _sfPage() {
    this._sfxLoad();
    const S = this._sfx(), C = S.cfg, adm = this._admin(), live = !S.error && !!S.det, l = this._sfList(), KN = this._sfxKind();
    const al = l.filter((x) => x.alarm), low = l.filter((x) => x.bat != null && x.bat < C.bat.pct), off = l.filter((x) => x.off), tst = S.test || {};
    const bad = al.length ? "alarm" : low.length || off.length || tst.due ? "warn" : "ok";
    const msg = !l.length ? ["Noch keine Melder gefunden", "Melder aus Home Assistant erscheinen hier automatisch, zum Beispiel von X-Sense, Zigbee, Z-Wave oder Homematic."]
      : al.length ? [`${al.length} ${al.length === 1 ? "Alarm" : "Alarme"} aktiv`, al.map((x) => x.name + (x.area ? " (" + x.area + ")" : "")).join(", ")]
        : bad === "warn" ? ["Alles ruhig, aber es gibt Hinweise", [low.length ? `${low.length} ${low.length === 1 ? "Batterie ist" : "Batterien sind"} schwach` : "", off.length ? `${off.length} nicht erreichbar` : "", tst.due ? "Prüfung fällig" : ""].filter(Boolean).join(" · ")]
          : ["Alles in Ordnung", `${l.length} ${l.length === 1 ? "Melder meldet" : "Melder melden"} keinen Alarm, alle erreichbar und mit guter Batterie`];
    const hero = `<div class="card hero sfh ${bad}"><div class="sfi">${ic(bad === "alarm" ? "alert" : bad === "warn" ? "info" : "shield", 56)}</div><div class="lbl">${ic("shield", 16)}Sicherheit im Haus</div><div class="big">${esc(msg[0])}</div><div class="sub">${esc(msg[1])}</div>
      <div class="chips"><span class="chip">${ic("shield", 16)}${l.length} ${l.length === 1 ? "Melder" : "Melder"}</span>${low.length ? `<span class="chip st warn">${ic("alert", 16)}${low.length} Batterie schwach</span>` : ""}${off.length ? `<span class="chip st warn">${ic("alert", 16)}${off.length} nicht erreichbar</span>` : ""}${tst.due ? `<span class="chip st warn">${ic("clock", 16)}Prüfung fällig</span>` : ""}${C.notify.to.length ? `<span class="chip">${ic("bell", 16)}Meldung an ${C.notify.to.length} ${C.notify.to.length === 1 ? "Dienst" : "Dienste"}</span>` : `<span class="chip">${ic("bell", 16)}Keine Meldung eingerichtet</span>`}</div></div>`;
    const tiles = `<div class="tiles">${[
      ["shield", "Melder", String(l.length), "", "#2dd4bf", "In Home Assistant gefunden"],
      ["alert", "Alarme", String(al.length), "", al.length ? "#ef4444" : "#34d399", al.length ? "Sofort prüfen" : "Keine aktiv"],
      ["energy", "Batterie schwach", String(low.length), "", low.length ? "#f59e0b" : "#34d399", low.length ? `Unter ${C.bat.pct} %` : `Alle über ${C.bat.pct} %`],
      ["info", "Nicht erreichbar", String(off.length), "", off.length ? "#f59e0b" : "#34d399", off.length ? "Prüfen" : "Alle melden sich"],
    ].map(([ico, lab, v, u, c, sub]) => `<div class="tile" style="--a:${c}"><div class="t"><span class="ti">${ic(ico, 16)}</span>${lab}</div><div class="v">${v}<small>${u}</small></div><div class="g">${sub}</div></div>`).join("")}</div>`;
    const card = (x) => { const st = x.alarm ? ["alarm", "ALARM"] : x.off ? ["off", "Nicht erreichbar"] : ["ok", "In Ordnung"], bt = x.bat != null ? Math.max(0, Math.min(100, x.bat)) : null, bc = bt == null ? "" : bt < C.bat.pct ? "#f87171" : bt < 40 ? "#f59e0b" : "#34d399";
      return `<div class="sfd ${st[0]}"><div class="sfdh"><span class="sfdi">${ic(KN[x.k][1], 20)}</span><div class="sfdt"><b>${esc(x.name)}</b><small>${esc(x.kind)}${x.area ? " · " + esc(x.area) : ""}${x.src === "xsense" ? " · X-Sense" : ""}</small></div><span class="sfs ${st[0]}">${st[1]}</span></div>
        <div class="sfb">${bt != null ? `<div class="sfbar"><i style="width:${bt}%;background:${bc}"></i></div><span>${ic("energy", 13)} Batterie ${num(bt, 0)} %${bt < C.bat.pct ? " · schwach" : ""}</span>` : `<span class="mut">Batterie unbekannt</span>`}${x.alarm && x.since ? `<span class="sfsince">seit ${esc(this._sfAgo(x.since))}</span>` : ""}${adm && x.test ? `<button class="lnk" data-act="sfxpress" data-k="${esc(x.id)}">${ic("bell", 14)}Testen</button>` : ""}</div></div>`; };
    const list = l.length ? `<div class="card sfc"><h2>${ic("bell", 18)}Melder<small class="mut">${l.length}</small></h2><div class="sfg">${l.map(card).join("")}</div></div>` : "";
    const E = this._hass.entities || {}, anyXs = !!(S.xs && S.xs.found) || Object.keys(E).some((k) => (E[k] || {}).platform === "xsense");
    const empty = !l.length ? `<div class="card sfc"><h2>${ic("puzzle", 18)}Melder verbinden</h2><div class="mut sm" style="margin:0 0 10px">Das Modul liest Melder mit der Geräteklasse Rauch, CO, Gas, Wasser, Hitze oder Sicherheit. ${anyXs ? "X-Sense ist verbunden, hat aber noch keine Melder geliefert." : "Für X-Sense, Zigbee, Z-Wave und Homematic gibt es unter Einstellungen → Integrationen eine Anleitung."}</div>${adm ? `<button class="btn2 pri" data-act="sfxgoig" style="flex:none;padding:10px 18px">${ic("puzzle", 16)} Integrationen öffnen</button>` : ""}</div>` : "";
    const testC = `<div class="card sfc"><h2>${ic("clock", 18)}Prüfung</h2>
      <div class="dgs ${tst.due ? "warn" : "ok"}">${ic(tst.due ? "alert" : "check", 22)}<div><b>${!C.test.on ? "Erinnerung ausgeschaltet" : tst.due ? "Prüfung fällig" : tst.last ? "Zuletzt geprüft " + esc(this._sfAgo(tst.last)) : "Noch nicht geprüft"}</b><span>${C.test.on ? `Alle ${C.test.months} ${C.test.months === 1 ? "Monat" : "Monate"} Testknopf an jedem Melder drücken. ${tst.last ? "" : "Die Frist läuft ab dem ersten Start des Moduls."}` : "Du bekommst keine Erinnerung an den Melder-Test."}</span></div><span></span></div>
      ${adm && l.length ? `<div class="foot2" style="margin-top:10px"><button class="btn2 pri" data-act="sfxtested">${ic("check", 16)} Geprüft</button></div>` : ""}</div>`;
    const log = (S.log || []).length ? `<div class="card sfc"><h2>${ic("list", 18)}Protokoll</h2><div class="wxlog">${S.log.slice(0, 8).map((x) => `<div><time>${new Date(x.t).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</time><span>${esc(x.x)}</span></div>`).join("")}</div></div>` : `<div class="card sfc"><h2>${ic("list", 18)}Protokoll</h2><div class="mut sm">Noch keine Ereignisse. Alarme, schwache Batterien und Prüfungen erscheinen hier.</div></div>`;
    return `${this._betaBox("Das Modul liest vorhandene Melder und meldet Alarme aufs Handy. Es ersetzt keine zertifizierten Rauchmelder oder Alarmanlage.")}${hero}${l.length ? tiles : ""}${empty}${list}<div class="enc"><div class="enco">${testC}</div><div class="enco">${log}</div></div>`;
  }
  _sfxModal() {
    const S = this._sfx(), C = S.cfg, H = this._hass, NM = this._sfxNames(), KN = this._sfxKind();
    const sw = (act, k, on, label) => `<button class="sw ${on ? "on" : ""}" data-act="${act}" data-k="${k}" aria-pressed="${!!on}" aria-label="${label}"></button>`;
    const step = (act, val, unit, s) => `<div class="step" style="flex:none"><button data-act="${act}" data-s="-${s}" aria-label="weniger">${ic("minus", 18)}</button><b>${val} ${unit}</b><button data-act="${act}" data-s="${s}" aria-label="mehr">${ic("plus", 18)}</button></div>`;
    const chip = (act, k, t, on, extra = "") => `<button class="gsch ${on ? "sel" : ""}" data-act="${act}" data-k="${k}" ${extra} aria-pressed="${!!on}">${t}</button>`;
    const actOpts = Object.keys(H.states).filter((e) => /^(light|switch|cover|input_boolean|script|scene)\./.test(e));
    const svc = [...new Set([...Object.keys(((H.services || {}).notify) || {}).filter((n) => !["send_message", "reload", "persistent_notification"].includes(n)).sort().map((n) => "notify." + n), ...C.notify.to])];
    const all = [...(S.det || []), ...(S.excl || []).filter((x) => !(S.det || []).some((d) => d.id === x.id)).map((x) => ({ id: x.id, name: x.name, k: "safety", kind: "ausgeschlossen", area: "" }))];
    const acts = C.acts.map((x, i) => `<div class="rfv"><div class="vrow" style="margin:0"><span><b>${esc(this._wzName(x.ent))}</b><small class="mut" style="display:block">${esc(x.ent)}</small></span><button class="ibtn" data-act="sfxrm" data-i="${i}" aria-label="Aktion entfernen">${ic("trash", 18)}</button></div>
      <div class="mut sm" style="margin:6px 0 4px">Bei</div><div class="gschips">${[["any", "Jedem Alarm"], ...Object.keys(NM).map((k) => [k, NM[k]])].map(([k, t]) => chip("sfxak", k, t, x.kind === k, `data-i="${i}"`)).join("")}</div>
      <div class="mut sm" style="margin:6px 0 4px">Dann</div><div class="gschips">${this._sfxDo(x.ent).map(([k, t]) => chip("sfxad", k, t, x.do === k, `data-i="${i}"`)).join("")}</div></div>`).join("");
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Rauch- &amp; Sicherheitsmelder</b><span>Einstellungen · gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("shield", 15)}Welche Melder</div>
      <div class="mut sm" style="margin:0 0 6px">Gelesen werden Melder mit passender Geräteklasse. Schalte Arten aus, die du nicht brauchst.</div>
      <div class="gschips">${Object.keys(NM).map((k) => chip("sfxkind", k, NM[k], C.kinds.includes(k))).join("")}</div>
      ${all.length ? `<details class="ohint"><summary>Einzelne Melder ausschließen (${C.excl.length})</summary>${all.map((d) => `<div class="vrow"><span>${esc(d.name)}<small class="mut" style="display:block">${esc(d.kind)}${d.area ? " · " + esc(d.area) : ""}</small></span>${sw("sfxexcl", esc(d.id), !C.excl.includes(d.id), d.name)}</div>`).join("")}<div class="mut sm">Ein Schalter aus bedeutet: wird nicht überwacht.</div></details>` : ""}
      <div class="gst">${ic("info", 15)}<span>X-Sense und andere Hersteller richtest du unter <button class="lnk" data-act="sfxgoig">Einstellungen → Integrationen</button> ein.</span></div>
      <div class="lsec" style="margin-top:12px">${ic("alert", 15)}Bei Alarm</div>
      <div class="vrow"><span>Erinnerung wiederholen<small class="mut" style="display:block">Solange der Alarm anhält, kommt alle paar Minuten eine Meldung. 0 = nur einmal.</small></span>${step("sfxrep", C.repeat, "Min.", 5)}</div>
      <div class="mut sm" style="margin:10px 0 6px">Aktionen: das Modul schaltet nur, was du hier auswählst, einmal pro Alarm. Gut sind Licht an, Rollläden öffnen (Fluchtweg), Wasserventil schließen oder eine Sirene per Skript.</div>
      ${acts}${C.acts.length < 12 ? this._wzSel(actOpts, "", "sfxadd", "", "+ Aktion hinzufügen", /licht|light|flur|ventil|sirene|rollo/i) : ""}
      <div class="lsec" style="margin-top:12px">${ic("energy", 15)}Batterie und Erreichbarkeit</div>
      <div class="vrow"><span>Schwache Batterie melden<small class="mut" style="display:block">Einmal pro Woche, solange sie unter der Grenze liegt.</small></span>${C.bat.on ? step("sfxbatp", C.bat.pct, "%", 5) : ""}${sw("sfxbat", "", C.bat.on, "Batterie")}</div>
      <div class="vrow"><span>Nicht erreichbar melden<small class="mut" style="display:block">Wenn sich ein Melder so lange nicht meldet. Einmal pro Tag.</small></span>${sw("sfxoff", "", C.off.on, "Erreichbarkeit")}</div>
      ${C.off.on ? `<div class="gschips">${[[15, "15 Min."], [60, "1 Std."], [180, "3 Std."], [720, "12 Std."], [1440, "1 Tag"]].map(([k, t]) => chip("sfxoffm", k, t, C.off.min === k)).join("")}</div>` : ""}
      <div class="lsec" style="margin-top:12px">${ic("clock", 15)}Prüf-Erinnerung</div>
      <div class="vrow"><span>Regelmäßig an den Test erinnern<small class="mut" style="display:block">Du drückst den Testknopf und tippst danach auf „Geprüft“.</small></span>${sw("sfxtst", "", C.test.on, "Prüf-Erinnerung")}</div>
      ${C.test.on ? `<div class="gschips">${[[1, "Monatlich"], [3, "Alle 3 Monate"], [6, "Alle 6 Monate"], [12, "Jährlich"]].map(([k, t]) => chip("sfxtstm", k, t, C.test.months === k)).join("")}</div>` : ""}
      <div class="lsec" style="margin-top:12px">${ic("bell", 15)}Benachrichtigung</div>
      ${[["alarm", "Alarm"], ["end", "Alarm beendet"], ["bat", "Batterie schwach"], ["off", "Nicht erreichbar"], ["test", "Prüfung fällig"]].map(([k, t]) => `<div class="vrow"><span>${t}</span>${sw("sfxn", k, C.notify[k], t)}</div>`).join("")}
      <div class="lsec" style="margin-top:8px">${ic("bell", 15)}Senden an</div>
      ${svc.length ? `<div class="gschips">${svc.map((n) => chip("sfxns", esc(n), esc(n), C.notify.to.includes(n))).join("")}</div>` : `<div class="mut sm">Es wurde kein Benachrichtigungsdienst (notify.*) gefunden. Die Mobile App von Home Assistant legt einen an.</div>`}
      <div class="foot2" style="margin-top:12px"><button class="btn2" data-act="sfxtest" ${C.notify.to.length ? "" : "disabled"}>${ic("bell", 16)} Test senden</button><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _plPage() {
    const pv = this._pvNow(), pr = this._price(), tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    const o = this._out();
    return `${this._betaBox("Überschuss und Strompreis kommen aus den PV-Einstellungen von Modul 1.")}
      <div class="card"><h2>${ic("wave", 18)}Bedingungen jetzt</h2><div class="lugrid">
        ${tile("PV-Überschuss", pv != null ? wfmt(pv) : "–", pv != null ? (pv >= 1000 ? "Gut für Pumpe und Heizung" : "Eher wenig") : "Noch kein Sensor gewählt")}
        ${tile("Strompreis", pr ? num(pr, 1) + " ct/kWh" : "–", pr ? "Aus Modul 1" : "Noch kein Preis gewählt")}
        ${tile("Außentemperatur", o.t != null ? num(o.t, 1) + " °C" : "–", o.t != null && o.t < 10 ? "Pool-Heizung lohnt kaum" : "Draußen")}</div></div>
      ${this._betaSoon("wave", "Poolpumpe", "Filterzeiten nach Sonne und Überschuss, Mindestlaufzeit pro Tag")}
      ${this._betaSoon("flame", "Pool-Heizung", "Wärmepumpe oder Heizstab bei Überschuss oder günstigem Strom")}
      ${this._betaSoon("thermo", "Sauna", "Aufheizen nach Wunschzeit, bevorzugt mit Solarstrom")}
      ${this._betaSoon("bolt", "Kosten & Solaranteil", "Was Pumpe und Heizung kosten und wie viel davon Solarstrom war")}`;
  }
  _wxWarn() {
    const st = this._hass.states, c = this._wxCfg(), wid = c.entity && st[c.entity] ? c.entity : Object.keys(st).find((k) => k.startsWith("weather."));
    const w = wid ? st[wid] : null, a = w ? w.attributes : {}, o = this._out();
    const wind = a.wind_speed != null ? Number(a.wind_speed) : null, gust = a.wind_gust_speed != null ? Number(a.wind_gust_speed) : null, mx = Math.max(isFinite(wind) ? wind : 0, isFinite(gust) ? gust : 0);
    const storm = ["lightning", "lightning-rainy", "hail"].includes(w ? w.state : ""), gale = mx >= 60, frost = o.t != null && o.t <= 0;
    return { w, o, wind, mx, storm, gale, frost };
  }
  /* Modul 9: Wetter & Warnungen (Regeln, Vorwarnung, Aktionen, Fenster-Erinnerung und Benachrichtigung laufen im Backend) */
  _wxsDef() { return { warn: { storm: { on: true, kmh: 60 }, thunder: { on: true }, frost: { on: true, temp: 0 }, heat: { on: false, temp: 30 }, rain: { on: false } }, wind: "", ahead: { on: true, hours: 3 }, official: { on: true, ent: "" }, acts: [], win: { on: false, warn: ["storm", "thunder", "rain"] }, notify: { start: true, end: false, ahead: true, to: [] } }; }
  _wxsLoad(force) {
    if (!this._hass || this._wxsBusy) return;
    if (!force && this._wxsD && Date.now() - this._wxsD.ts < 20000) return;
    this._wxsBusy = true;
    this._hass.callWS({ type: "fenster_heizung/wx_get" }).then((r) => { this._wxsD = { d: r || {}, ts: Date.now() }; }).catch(() => { this._wxsD = { d: { error: true }, ts: Date.now() }; })
      .finally(() => { this._wxsBusy = false; if (this._wxsVisible()) { this._render(); if (this._modal && this._modal.type === "wxset") this._renderModal(); } });
  }
  _wxsVisible() { return !!(this._modal && this._modal.type === "wxset") || (!!this._mdActive && this._mdActive() === "wx" && !this._stOpen); }
  _wxs() { const d = (this._wxsD && this._wxsD.d) || {}, df = this._wxsDef(), c = d.cfg || {}; return { ...d, cfg: { ...df, ...c, warn: Object.fromEntries(Object.keys(df.warn).map((k) => [k, { ...df.warn[k], ...((c.warn || {})[k] || {}) }])), ahead: { ...df.ahead, ...(c.ahead || {}) }, official: { ...df.official, ...(c.official || {}) }, win: { ...df.win, ...(c.win || {}) }, notify: { ...df.notify, ...(c.notify || {}) }, acts: c.acts || [] } }; }
  _wxsSave(cfg) {
    const s = this._wxs(); this._wxsD = { d: { ...s, cfg }, ts: Date.now() };
    clearTimeout(this._wxsT);
    this._wxsT = setTimeout(() => {
      this._wxsT = null;
      this._hass.callWS({ type: "fenster_heizung/wx_set", cfg: this._wxs().cfg }).then((r) => { this._wxsD = { d: r || {}, ts: Date.now() }; if (this._wxsVisible()) this._render(); })
        .catch(() => this._toast("Die Einstellung konnte nicht gespeichert werden"));
    }, 500);
    this._render(); if (this._modal && this._modal.type === "wxset") this._renderModal();
  }
  _wxsPatch(fn) { const c = JSON.parse(JSON.stringify(this._wxs().cfg)); fn(c); this._wxsSave(c); }
  _wxsAct(a, b) {
    const k = b.dataset.k, i = Number(b.dataset.i), s = Number(b.dataset.s);
    if (a === "wxsopen") { this._wxsLoad(true); this._modal = { type: "wxset" }; this._renderModal(); return; }
    if (a === "wxstest") { this._hass.callWS({ type: "fenster_heizung/wx_test" }).then((r) => this._toast(r && r.sent ? `Test an ${r.sent} ${r.sent === 1 ? "Dienst" : "Diensten"} gesendet` : "Kein Benachrichtigungsdienst gewählt")).catch(() => this._toast("Test fehlgeschlagen")); return; }
    if (a === "wxsgoig") { this._modal = null; this._renderModal(); this._sto = { q: "", c: "wetter" }; this._igOpen = true; this._render(); return; }
    if (a === "wxsweather") { this._cfg.layout.wx = { ...(this._cfg.layout.wx || {}), entity: k || "" }; this._saveLayout(); this._render(); return; }
    if (a === "wxsout") { this._cfg.layout.wx = { ...(this._cfg.layout.wx || {}), outdoor: k || "" }; this._saveLayout(); this._render(); return; }
    this._wxsPatch((c) => {
      if (a === "wxswindset") c.wind = k || "";
      else if (a === "wxsoff") c.official = k ? { on: true, ent: k } : { on: false, ent: "" };
      else if (a === "wxsw") c.warn[k].on = !c.warn[k].on;
      else if (a === "wxstep") { const w = c.warn[k], f = b.dataset.f, lim = { kmh: [30, 120, 5], temp: k === "heat" ? [20, 45, 1] : [-10, 5, 1] }[f]; w[f] = Math.min(lim[1], Math.max(lim[0], (Number(w[f]) || 0) + s)); }
      else if (a === "wxsahead") c.ahead.on = !c.ahead.on;
      else if (a === "wxsaheadh") c.ahead.hours = Math.min(12, Math.max(1, (Number(c.ahead.hours) || 3) + s));
      else if (a === "wxsn") c.notify[k] = !c.notify[k];
      else if (a === "wxsns") c.notify.to = c.notify.to.includes(k) ? c.notify.to.filter((x) => x !== k) : [...c.notify.to, k];
      else if (a === "wxsaw") c.acts[i].warn = k;
      else if (a === "wxsad") c.acts[i].do = k;
      else if (a === "wxsau") c.acts[i].undo = !c.acts[i].undo;
      else if (a === "wxsrm") c.acts.splice(i, 1);
      else if (a === "wxswin") c.win.on = !c.win.on;
      else if (a === "wxswinw") c.win.warn = c.win.warn.includes(k) ? c.win.warn.filter((x) => x !== k) : [...c.win.warn, k];
    });
  }
  _wxsChange(t) {
    const f = t.dataset.f, v = t.value || "";
    if (f.startsWith("wxssel") && t.blur) t.blur(); /* Auswahl schließen, damit die Seite neu gezeichnet wird */
    if (f === "wxswind") { this._wxsPatch((c) => { c.wind = v; }); return true; }
    if (f === "wxsadd") { if (v) this._wxsPatch((c) => { if (c.acts.length < 12) c.acts.push({ id: "a" + Date.now().toString(36), warn: "storm", ent: v, do: this._wxsDo(v)[0][0], undo: true }); }); return true; }
    if (f === "wxsselw") { this._cfg.layout.wx = { ...(this._cfg.layout.wx || {}), entity: v }; this._saveLayout(); this._render(); this._renderModal(); return true; }
    if (f === "wxsselout") { this._cfg.layout.wx = { ...(this._cfg.layout.wx || {}), outdoor: v }; this._saveLayout(); this._render(); this._renderModal(); return true; }
    if (f === "wxsselwind") { this._wxsPatch((c) => { c.wind = v; }); return true; }
    if (f === "wxsseloff") { this._wxsPatch((c) => { c.official = v === "__off" ? { on: false, ent: "" } : { on: true, ent: v }; }); return true; }
    if (f === "wxsent") { this._wxsPatch((c) => { const x = c.acts[Number(t.dataset.i)]; if (x && v) { x.ent = v; if (!this._wxsDo(v).some((d) => d[0] === x.do)) x.do = this._wxsDo(v)[0][0]; } }); return true; }
    return false;
  }
  _wxsDo(ent) {
    const d = String(ent).split(".")[0];
    return d === "cover" ? [["close", "Schließen"], ["open", "Öffnen"]] : d === "script" || d === "scene" ? [["run", "Ausführen"]] : [["on", "Einschalten"], ["off", "Ausschalten"]];
  }
  _wxsNames() { return { storm: "Sturm", thunder: "Gewitter & Hagel", frost: "Frost", heat: "Hitze", rain: "Starkregen" }; }
  _wxsLocal() {
    const d = this._wxWarn(), c = this._wxs().cfg.warn, st = d.w ? d.w.state : "";
    return { storm: { a: !!c.storm.on && d.mx >= c.storm.kmh, v: d.mx }, thunder: { a: !!c.thunder.on && ["lightning", "lightning-rainy", "hail"].includes(st), v: null }, frost: { a: !!c.frost.on && d.o.t != null && d.o.t <= c.frost.temp, v: d.o.t },
      heat: { a: !!c.heat.on && d.o.t != null && d.o.t >= c.heat.temp, v: d.o.t }, rain: { a: !!c.rain.on && st === "pouring", v: null } };
  }
  _wxPage() {
    this._wxsLoad(); const S = this._wxs(), C = S.cfg, adm = this._admin(), d = this._wxWarn(), NM = this._wxsNames(), live = !S.error && S.state, W = (live ? S.state.warn : this._wxsLocal()) || {};
    const hm = (iso) => { const t = new Date(iso); return String(t.getHours()).padStart(2, "0") + ":" + String(t.getMinutes()).padStart(2, "0"); };
    const ICO = { storm: "fan", thunder: "flame", frost: "thermo", heat: "sun", rain: "drop" }, KEYS = Object.keys(NM), on = (k) => !!C.warn[k].on;
    const act = KEYS.filter((k) => on(k) && (W[k] || {}).a), soon = KEYS.filter((k) => on(k) && !(W[k] || {}).a && (W[k] || {}).ahead);
    const O = (live && S.state.official) || {}, offOn = C.official.on && this._wxOffAny(), offHot = offOn && O.level > 0;
    const wx = d.w ? (WX[d.w.state] || ["cloud", d.w.state])[1] : "", wnd = isFinite(d.wind) ? d.wind : null;
    /* Kopf: ein Satz zur Lage, darunter die Werte von jetzt */
    const tone = act.length || offHot ? "hot" : soon.length ? "soon" : "ok";
    const head = act.length ? `${NM[act[0]]}${act.length > 1 ? ` und ${act.length - 1} weitere` : ""}` : offHot ? O.title : soon.length ? `${NM[soon[0]]} wird erwartet` : "Keine Warnung";
    const sub = act.length ? ((W[act[0]] || {}).since ? `Seit ${hm(W[act[0]].since)} Uhr${offHot ? " · " + O.title : ""}` : "Gerade aktiv") : offHot ? `${O.text || "Amtliche Warnung"}` : soon.length ? `Ab etwa ${hm(W[soon[0]].ahead)} Uhr, ${C.ahead.hours} ${C.ahead.hours === 1 ? "Stunde" : "Stunden"} Vorlauf` : "Alle Werte liegen unter den Grenzen.";
    const now = [wx && `<span>${ic((WX[d.w.state] || ["cloud"])[0], 16)}${wx}</span>`, d.o.t != null && `<span>${ic("thermo", 16)}${num(d.o.t, 1)} °C</span>`, wnd != null && `<span>${ic("fan", 16)}${num(wnd, 0)} km/h${d.mx > wnd ? `, Böen ${num(d.mx, 0)}` : ""}</span>`].filter(Boolean).join("");
    /* Kurve: Wind der nächsten Stunden gegen die Sturmgrenze, Warnstunden getönt */
    const fc = C.ahead.on ? (S.fc || []).slice(0, 12) : [], n = fc.length;
    let chart = "";
    if (n > 1) {
      const VW = 600, VH = 132, px = 8, top = 22, bot = 10, cw = (VW - 2 * px) / n, lim = on("storm") ? C.warn.storm.kmh : null, vals = fc.map((x) => (isFinite(x.wind) ? x.wind : 0)), ym = Math.max(lim ? lim * 1.3 : 0, ...vals, 20) * 1.08;
      const X = (i) => px + cw * (i + 0.5), Y = (v) => top + (VH - top - bot) * (1 - v / ym), line = vals.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join("");
      chart = `<div class="wxc"><svg viewBox="0 0 ${VW} ${VH}" role="img" aria-label="Windvorhersage der nächsten ${n} Stunden${lim ? " mit Sturmgrenze " + lim + " km/h" : ""}">
          ${fc.map((x, i) => ((x.w || []).length ? `<rect x="${(px + cw * i).toFixed(1)}" y="0" width="${cw.toFixed(1)}" height="${VH}" class="wxbad"/>` : "")).join("")}
          <path d="${line}L${X(n - 1).toFixed(1)} ${VH - bot}L${X(0).toFixed(1)} ${VH - bot}Z" class="wxar"/>
          ${lim ? `<line x1="${px}" x2="${VW - px}" y1="${Y(lim).toFixed(1)}" y2="${Y(lim).toFixed(1)}" class="wxlim"/><text x="${VW - px - 2}" y="${(Y(lim) - 6).toFixed(1)}" text-anchor="end" class="wxlt">Sturmgrenze ${lim} km/h</text>` : ""}
          <path d="${line}" class="wxln"/>${vals.map((v, i) => `<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="${(fc[i].w || []).length ? 3.6 : 2.4}" class="${(fc[i].w || []).length ? "wxdb" : "wxd"}"/>`).join("")}</svg>
        <div class="wxh" style="grid-template-columns:repeat(${n},1fr)">${fc.map((x) => `<div class="${(x.w || []).length ? "bad" : ""}" title="${(x.w || []).length ? x.w.map((k) => NM[k]).join(", ") : "Keine Warnung"}"><small>${hm(x.t).slice(0, 2)}</small>${ic((WX[x.cond] || ["cloud"])[0], 18)}<b>${isFinite(x.temp) ? num(x.temp, 0) + "°" : "–"}</b></div>`).join("")}</div></div>`;
    } else if (C.ahead.on) chart = `<div class="wxnote">${ic("info", 15)}Keine Stundenvorhersage von der Wetter-Entität. Die Vorwarnung braucht sie.</div>`;
    const hero = `<div class="card wxhero ${tone}"><div class="wxhead"><span class="wxdot" aria-hidden="true">${ic(tone === "ok" ? "check" : "alert", 22)}</span><div><b>${esc(head)}</b><small>${esc(sub)}</small></div></div>
      ${now ? `<div class="wxnow">${now}</div>` : ""}${chart}</div>`;
    /* Warnstufen: je ein Pegel gegen die eingestellte Grenze */
    const gauge = (k) => {
      const c = C.warn[k]; let v = null, fill = 0, mark = 0, val = "";
      if (k === "storm") { v = d.mx > 0 ? d.mx : wnd != null ? wnd : (S.fc || []).length && isFinite(S.fc[0].wind) ? S.fc[0].wind : null; if (v != null) { const m = c.kmh * 1.25; fill = v / m; mark = c.kmh / m; val = `${num(v, 0)} von ${c.kmh} km/h`; } }
      else if (k === "frost") { v = d.o.t; if (v != null) { fill = (c.temp + 10 - v) / 15; mark = 10 / 15; val = `${num(v, 1)} °C, Grenze ${c.temp} °C`; } }
      else if (k === "heat") { v = d.o.t; if (v != null) { fill = (v - (c.temp - 15)) / 20; mark = 15 / 20; val = `${num(v, 1)} °C, Grenze ${c.temp} °C`; } }
      return { has: v != null, fill: Math.max(0.02, Math.min(1, fill)), mark, val };
    };
    const row = (k) => {
      const w = W[k] || {}, o = on(k), a = o && w.a, ah = o && !a && w.ahead, g = gauge(k), st = !o ? "Aus" : a ? `Aktiv${w.since ? " seit " + hm(w.since) : ""}` : ah ? `Erwartet ab ${hm(w.ahead)}` : "Keine Warnung";
      const tx = k === "thunder" ? (a ? "Gewitter oder Hagel gemeldet" : "") : k === "rain" ? (a ? "Starkregen gemeldet" : "") : (g.has ? g.val : "Kein Messwert");
      return `<div class="wxr ${!o ? "off" : a ? "hot" : ah ? "soon" : ""}"><span class="wxi">${ic(ICO[k], 18)}</span><div class="wxm"><div class="wxt"><b>${NM[k]}</b><em>${st}</em></div>${g.has && o ? `<div class="wxg" role="img" aria-label="${esc(g.val)}"><i style="width:${(g.fill * 100).toFixed(0)}%"></i><u style="left:${(g.mark * 100).toFixed(0)}%"></u></div>` : ""}${o && tx ? `<small>${esc(tx)}</small>` : ""}</div></div>`;
    };
    const lv = Math.max(0, Math.min(4, O.level || 0));
    const offRow = offOn ? `<div class="wxr ${offHot ? "hot" : ""}"><span class="wxi">${ic("shield", 18)}</span><div class="wxm"><div class="wxt"><b>Amtliche Warnung</b><em>${offHot ? esc(String(O.title).replace(/^Amtliche Warnung:\s*/, "")) : "Keine Warnung"}</em></div><div class="wxp" role="img" aria-label="Stufe ${lv} von 4">${[1, 2, 3, 4].map((i) => `<i class="${i <= lv ? "on l" + lv : ""}"></i>`).join("")}</div><small>${offHot ? esc(O.text || "") : "Deutscher Wetterdienst, NINA oder MeteoAlarm"}</small></div></div>` : "";
    const lamp = KEYS.some(on) ? "" : `<div class="wxnote">${ic("info", 15)}Alle eigenen Warnungen sind aus. Einschalten unter Einstellungen → Modul 9.</div>`;
    const warn = `<div class="card"><h2>${ic("alert", 18)}Warnstufen</h2><div class="wxl">${KEYS.map(row).join("")}${offRow}</div>${lamp}</div>`;
    /* Aktionen und Erinnerungen */
    const A = C.acts, ST = (live && S.state.acts) || {}, wo = S.open || [];
    const arow = (x) => { const on2 = (W[x.warn] || {}).a, s = ST[x.id] || {}, dn = (this._wxsDo(x.ent).find((y) => y[0] === x.do) || [0, x.do])[1], run = s.state === "run"; return `<div class="wxr ${run ? "hot" : ""}"><span class="wxi">${ic(String(x.ent).startsWith("cover.") ? "blinds" : "bolt", 18)}</span><div class="wxm"><div class="wxt"><b>${esc(this._wzName(x.ent))}</b><em>${run ? "Ausgelöst" + (s.at ? " " + hm(s.at) : "") : on2 ? "Wartet" : "Bereit"}</em></div><small>Bei ${NM[x.warn]}: ${dn}${x.undo ? ", danach zurück" : ""}</small></div></div>`; };
    const info = (ico, t, txt, onn) => `<div class="wxr ${onn ? "" : "off"}"><span class="wxi">${ic(ico, 18)}</span><div class="wxm"><div class="wxt"><b>${t}</b><em>${onn ? "An" : "Aus"}</em></div><small>${txt}</small></div></div>`;
    const nTo = C.notify.to.length, nWhat = [C.notify.start && "Beginn", C.notify.end && "Ende", C.notify.ahead && C.ahead.on && "Vorwarnung"].filter(Boolean).join(", ");
    const acts = `<div class="card"><h2>${ic("blinds", 18)}Aktionen und Erinnerungen</h2><div class="wxl">
        ${A.map(arow).join("")}
        ${info("window", "Fenster-Erinnerung", C.win.on ? `Bei ${C.win.warn.map((k) => NM[k]).join(", ")}. ${wo.length ? "Jetzt offen: " + wo.map(esc).join(", ") + "." : "Zurzeit ist kein Fenster offen."}` : "Meldet offene Fenster bei Sturm, Gewitter oder Starkregen.", C.win.on)}
        ${info("bell", "Benachrichtigung", nTo ? `An ${nTo} ${nTo === 1 ? "Dienst" : "Dienste"}: ${nWhat || "nichts ausgewählt"}.` : "Noch kein Dienst gewählt (Einstellungen → Integrationen).", nTo > 0)}</div>
        ${A.length ? "" : `<div class="wxnote">${ic("info", 15)}Noch keine Aktion. Unter Einstellungen → Modul 9 legst du fest, was bei einer Warnung passiert, etwa Markise einfahren.</div>`}</div>`;
    const lg = (S.log || []).slice(0, 8), dd = (iso) => { const t = new Date(iso), td = new Date(); return t.toDateString() === td.toDateString() ? hm(iso) : t.toLocaleDateString("de-DE", { weekday: "short" }) + " " + hm(iso); };
    const log = lg.length ? `<div class="card"><h2>${ic("clock", 18)}Protokoll</h2><div class="wxlog">${lg.map((x) => `<div><time>${dd(x.t)}</time><span>${esc(x.x)}</span></div>`).join("")}</div></div>` : "";
    return `${this._betaBox("Die Warnungen werden im Hintergrund aus deiner Wetter-Entität oder Wetterstation berechnet, auch wenn das Dashboard geschlossen ist. Eigene Grenzwerte sind keine amtlichen Warnungen, diese kommen vom Deutschen Wetterdienst oder NINA, wenn eingerichtet.")}${hero}<div class="wxcols">${warn}${acts}</div>${log}`;
  }
  _wxsModal() {
    const S = this._wxs(), C = S.cfg, NM = this._wxsNames(), st = this._hass.states, H = this._hass;
    const step = (act, k, f, val, unit, min) => `<div class="step" style="flex:none"><button data-act="${act}" data-k="${k}" data-f="${f}" data-s="-${min}" aria-label="weniger">${ic("minus", 18)}</button><b>${val} ${unit}</b><button data-act="${act}" data-k="${k}" data-f="${f}" data-s="${min}" aria-label="mehr">${ic("plus", 18)}</button></div>`;
    const sw = (act, k, on, label) => `<button class="sw ${on ? "on" : ""}" data-act="${act}" data-k="${k}" aria-pressed="${!!on}" aria-label="${label}"></button>`;
    const WR = [["storm", "Sturm", "Ab dieser Windstärke oder Böe (km/h).", step("wxstep", "storm", "kmh", C.warn.storm.kmh, "km/h", 5)], ["thunder", "Gewitter und Hagel", "Wenn die Wetter-Entität Gewitter oder Hagel meldet.", ""], ["frost", "Frost", "Bei dieser Außentemperatur oder darunter.", step("wxstep", "frost", "temp", C.warn.frost.temp, "°C", 1)], ["heat", "Hitze", "Ab dieser Außentemperatur, zum Beispiel für Beschattung.", step("wxstep", "heat", "temp", C.warn.heat.temp, "°C", 1)], ["rain", "Starkregen", "Wenn die Wetter-Entität Starkregen meldet.", ""]];
    const windOpts = Object.keys(st).filter((e) => e.startsWith("sensor.") && (/(km\/h|m\/s|mph|kn)$/i.test(st[e].attributes.unit_of_measurement || "") || /wind/i.test(e)));
    const actOpts = Object.keys(st).filter((e) => /^(cover|switch|input_boolean|script|scene)\./.test(e));
    const svc = [...new Set([...Object.keys(((H.services || {}).notify) || {}).filter((n) => !["send_message", "reload", "persistent_notification"].includes(n)).sort().map((n) => "notify." + n), ...C.notify.to])];
    const chip = (act, k, t, on, extra = "") => `<button class="gsch ${on ? "sel" : ""}" data-act="${act}" data-k="${k}" ${extra} aria-pressed="${!!on}">${t}</button>`;
    const acts = C.acts.map((x, i) => `<div class="rfv"><div class="vrow" style="margin:0"><span><b>${esc(this._wzName(x.ent))}</b><small class="mut" style="display:block">${esc(x.ent)}</small></span><button class="ibtn" data-act="wxsrm" data-i="${i}" aria-label="Aktion entfernen">${ic("trash", 18)}</button></div>
      <div class="mut sm" style="margin:6px 0 4px">Bei</div><div class="gschips">${Object.keys(NM).map((k) => chip("wxsaw", k, NM[k], x.warn === k, `data-i="${i}"`)).join("")}</div>
      <div class="mut sm" style="margin:6px 0 4px">Dann</div><div class="gschips">${this._wxsDo(x.ent).map(([k, t]) => chip("wxsad", k, t, x.do === k, `data-i="${i}"`)).join("")}</div>
      ${["cover", "switch", "input_boolean"].includes(String(x.ent).split(".")[0]) ? `<div class="vrow"><span>Danach zurück<small class="mut" style="display:block">Eine Viertelstunde nach Ende der Warnung wird der vorige Zustand wiederhergestellt.</small></span>${sw("wxsau", "", x.undo, "Danach zurück").replace('data-k=""', `data-i="${i}"`)}</div>` : ""}</div>`).join("");
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Wetter &amp; Warnungen</b><span>Einstellungen · gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("alert", 15)}Warnstufen</div>
      ${WR.map(([k, t, h, ctl]) => `<div class="vrow"><span>${t}<small class="mut" style="display:block">${h}</small></span>${C.warn[k].on && ctl ? ctl : ""}${sw("wxsw", k, C.warn[k].on, t)}</div>`).join("")}
      <div class="lsec" style="margin-top:12px">${ic("sliders", 15)}Datenquellen</div>
      ${this._wxsAssign()}
      <div class="gst">${ic("info", 15)}<span>Weitere Dienste für Wetter und Warnungen findest du im <button class="lnk" data-act="wxsgoig">Store</button>.</span></div>
      <div class="lsec" style="margin-top:12px">${ic("clock", 15)}Vorwarnung</div>
      <div class="vrow"><span>Warnung vorab melden<small class="mut" style="display:block">Aus der Stundenprognose der Wetter-Entität. Gilt für Sturm, Gewitter, Frost, Hitze und Starkregen.</small></span>${C.ahead.on ? step("wxsaheadh", "", "", C.ahead.hours, C.ahead.hours === 1 ? "Std." : "Std.", 1) : ""}${sw("wxsahead", "", C.ahead.on, "Vorwarnung")}</div>
      <div class="lsec" style="margin-top:12px">${ic("blinds", 15)}Aktionen bei einer Warnung</div>
      <div class="mut sm" style="margin:0 0 6px">Das Modul schaltet nur, was du hier auswählst: Rollläden, Markisen, Schalter, Skripte und Szenen. Eine Aktion läuft einmal, wenn die Warnung beginnt.</div>
      ${acts}${C.acts.length < 12 ? this._wzSel(actOpts, "", "wxsadd", "", "+ Aktion hinzufügen", /cover|markise|rollo|rolllad/i) : ""}
      <div class="lsec" style="margin-top:12px">${ic("window", 15)}Fenster-Erinnerung</div>
      <div class="vrow"><span>Offene Fenster melden<small class="mut" style="display:block">Nutzt die Fenster-Kontakte deiner Räume aus Modul 1. Die Meldung kommt einmal pro Warnung.</small></span>${sw("wxswin", "", C.win.on, "Fenster-Erinnerung")}</div>
      ${C.win.on ? `<div class="gschips">${["storm", "thunder", "rain"].map((k) => chip("wxswinw", k, NM[k], C.win.warn.includes(k))).join("")}</div>` : ""}
      <div class="lsec" style="margin-top:12px">${ic("bell", 15)}Benachrichtigung</div>
      ${[["start", "Warnung beginnt"], ["ahead", "Vorwarnung"], ["end", "Warnung endet"]].map(([k, t]) => `<div class="vrow"><span>${t}</span>${sw("wxsn", k, C.notify[k], t)}</div>`).join("")}
      ${svc.length ? `<div class="gschips">${svc.map((n) => chip("wxsns", esc(n), esc(n), C.notify.to.includes(n))).join("")}</div>` : `<div class="mut sm">Es wurde kein Benachrichtigungsdienst (notify.*) gefunden. Die Mobile App von Home Assistant legt einen an.</div>`}
      <div class="mut sm" style="margin:2px 0 6px">${C.notify.to.length ? `Gesendet wird an: ${C.notify.to.map(esc).join(", ")}.` : "Es ist noch kein Benachrichtigungsdienst gewählt."}</div>
      <div class="foot2" style="margin-top:12px"><button class="btn2" data-act="wxstest" ${C.notify.to.length ? "" : "disabled"}>${ic("bell", 16)} Test senden</button><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _gaPage() {
    const st = this._hass.states, c = this._wxCfg(), wid = c.entity && st[c.entity] ? c.entity : Object.keys(st).find((k) => k.startsWith("weather."));
    const w = wid ? st[wid] : null, rainy = w && ["rainy", "pouring", "lightning-rainy", "snowy-rainy"].includes(w.state), pv = this._pvNow();
    const tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    return `${this._betaBox("Regen kommt aus deiner Wetter-Entität, der Überschuss aus den PV-Einstellungen von Modul 1.")}
      <div class="card"><h2>${ic("plant", 18)}Garten jetzt</h2><div class="lugrid">
        ${tile("Regen", w ? (rainy ? "Es regnet" : "Trocken") : "–", w ? (rainy ? "Bewässern nicht nötig" : "Kein Regen gemeldet") : "Keine Wetter-Entität gefunden")}
        ${tile("PV-Überschuss", pv != null ? wfmt(pv) : "–", pv != null ? (pv >= 500 ? "Genug zum Bewässern" : "Eher wenig") : "Noch kein Sensor gewählt")}
        ${tile("Zisterne", "–", "Füllstand-Sensor folgt")}</div></div>
      ${this._betaSoon("drop", "Regenprognose", "Bewässerung überspringen, wenn Regen erwartet wird")}
      ${this._betaSoon("tree", "Zisterne", "Füllstand anzeigen und auf Leitungswasser umschalten, wenn sie leer ist")}
      ${this._betaSoon("sun", "Bewässerung bei PV-Überschuss", "Pumpe oder Ventil starten, wenn genug Solarstrom übrig ist")}
      ${this._betaSoon("clock", "Zeitplan", "Bewässerungszeiten pro Zone mit Dauer und Wochentagen")}`;
  }
  _rbPage() {
    const h = this._hass, sun = h.states["sun.sun"], o = this._out(), el = sun ? Number(sun.attributes.elevation) : NaN, az = sun ? Number(sun.attributes.azimuth) : NaN;
    const dir = isFinite(az) ? ["Nord", "Nordost", "Ost", "Südost", "Süd", "Südwest", "West", "Nordwest"][Math.round(az / 45) % 8] : "";
    const tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    return `${this._betaBox("Der Sonnenstand kommt aus der Sonnen-Entität von Home Assistant.")}
      <div class="card"><h2>${ic("sun", 18)}Sonne &amp; Wetter jetzt</h2><div class="lugrid">
        ${tile("Sonnenhöhe", isFinite(el) ? num(el, 0) + " °" : "–", isFinite(el) ? (el > 0 ? "Sonne über dem Horizont" : "Sonne unter dem Horizont") : "Keine Sonnen-Entität gefunden")}
        ${tile("Richtung", dir || "–", isFinite(az) ? num(az, 0) + " °" : "")}
        ${tile("Draußen", o.t != null ? num(o.t, 1) + " °C" : "–", o.rh != null ? num(o.rh) + " % Luftfeuchte" : "")}</div></div>
      ${this._betaSoon("blinds", "Rollläden steuern", "Zeitpläne, Sonnenstand und Fenster-Stellung")}
      ${this._betaSoon("sun", "Hitzeschutz im Sommer", "Beschatten, wenn die Sonne aufs Fenster scheint")}
      ${this._betaSoon("thermo", "Wärme nutzen im Winter", "Rollläden öffnen, wenn die Sonne mitheizt, und nachts schließen")}`;
  }
  _wpPage() {
    const o = this._out(), tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    return `${this._betaBox("Entitäten der Wärmepumpe wählst du später in den Einstellungen des Moduls.")}
      <div class="card"><h2>${ic("thermo", 18)}Außenbedingungen</h2><div class="lugrid">
        ${tile("Außentemperatur", o.t != null ? num(o.t, 1) + " °C" : "–", o.t != null && o.t < 7 ? "Abtauen wird wahrscheinlicher" : "Kaum Abtau-Bedarf")}
        ${tile("Luftfeuchte", o.rh != null ? num(o.rh) + " %" : "–", "Draußen")}</div></div>
      ${this._betaSoon("heatpump", "Laufzeit & Takten", "Starts, Laufzeit am Stück und Taktung erkennen")}
      ${this._betaSoon("thermo", "Vorlauf, Rücklauf & Effizienz", "Temperaturen, Spreizung und Leistungszahl (COP)")}
      ${this._betaSoon("snow", "Abtauen", "Abtauzyklen zählen und auswerten")}`;
  }
  _luPage() {
    const rooms = this._collect(), adm = this._admin();
    const cards = rooms.map((r) => { const a = this._airData(r); if (!a) return `<div class="luroom off"><b>${esc(r.name)}</b><span class="mut">Kein Luftfeuchte-Sensor</span></div>`;
      const [ml, mc] = MOLD[a.lvl], hc = a.rh >= 70 ? "red" : a.rh >= 60 ? "amber" : "green";
      return `<div class="luroom ${mc}"><b>${esc(r.name)}</b><span class="lv ${hc}">${num(a.rh)} %</span><span class="mut">Taupunkt ${num(a.td, 1)} °C · Schimmel ${ml}</span></div>`; }).join("");
    const soon = (ico, t, d) => `<div class="card lusoon">${ic(ico, 26)}<div><b>${t}</b><span class="mut">${d}</span></div><em class="beta">In Entwicklung</em></div>`;
    return `<div class="betabox">${ic("alert", 20)}<div><b>Beta-Version – dieses Modul ist noch in Entwicklung</b>Funktionen können sich ändern oder fehlen noch. Die Raumluft-Übersicht nutzt die Luftfeuchte-Sensoren aus Modul 1. Rückmeldungen helfen: <a href="https://github.com/Maddog3010/ha-fenster-heizung/issues" target="_blank" rel="noopener">Fehler oder Wunsch melden</a>.</div></div>
      <div class="card"><h2>${ic("drop", 18)}Raumluft-Übersicht</h2>${rooms.length ? `<div class="lugrid">${cards}</div>` : `<div class="mut sm">Noch keine Räume eingerichtet.</div>`}
        <div class="mut sm" style="margin:10px 0 0">Luftfeuchte, Taupunkt und Schimmelrisiko je Raum. Sensoren wählst du in den Raumeinstellungen von Modul 1.</div></div>
      ${soon("fan", "Lüftungsanlage (KWL)", "Stufen, Bypass und Filterwechsel schalten und überwachen")}
      ${soon("windy", "CO₂ & Luftqualität", "CO₂-Sensoren auswerten und Lüften empfehlen")}`;
  }
