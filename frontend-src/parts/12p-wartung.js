  /* ================= Modul 15: Termine (ab v0.2 Build 2) und Konzept zum Durchklicken ================= */
  _waTab() {
    let t = this._waT; if (!t) { try { t = localStorage.getItem("fh_wa_tab"); } catch (_) { /* privater Modus */ } }
    return WA_TABS.some((x) => x[0] === t) ? t : "t";
  }
  _waSel(k) { const s = (this._waP || {})[k], n = WA_PINS[k].pins.length; return Number.isInteger(s) && s >= 0 && s < n ? s : 0; }
  _waShot(k) {
    const d = WA_PINS[k], sel = this._waSel(k), cur = d.pins[sel];
    const pins = d.pins.map((p, i) => `<button class="gapin${i === sel ? " on" : ""}" style="left:${p[0]}%;top:${p[1]}%" data-act="waxpin" data-k="${k}" data-i="${i}" aria-label="${esc(p[2])}" aria-pressed="${i === sel}">${i + 1}</button>`).join("");
    const rows = d.pins.map((p, i) => i === sel ? "" : `<button class="garow" data-act="waxpin" data-k="${k}" data-i="${i}"><span class="gan">${i + 1}</span>${esc(p[2])}</button>`).join("");
    return `<div class="card" style="padding:12px 16px"><b>${esc(d.t)}</b><div class="mut sm">${esc(d.alt)}</div></div>
      <div class="gamain"><div class="gashot"><img data-keep="1" src="${GA_IMG}${d.img}${this._ver ? "?v=" + encodeURIComponent(this._ver) : ""}" alt="${esc(d.alt)}" loading="lazy" decoding="async">${pins}<span class="gatip">Tippe auf eine Zahl</span></div>
      <div class="galist"><div class="card gacur"><div class="gah"><span class="gan">${sel + 1}</span><b>${esc(cur[2])}</b></div><p>${esc(cur[3])}</p></div>${rows}</div></div>`;
  }
  _waPage() {
    const t = this._waTab();
    const tabs = `<div class="sftabs gatabs" role="tablist">${WA_TABS.map(([k, l]) => `<button class="${k === t ? "on" : ""}" role="tab" aria-selected="${k === t}" data-act="waxtab" data-k="${k}">${l}</button>`).join("")}</div>`;
    if (t === "t") return `${tabs}${this._wtPage()}`;
    const body = t !== "fp" ? this._waShot(t) : `<div class="gast">${WA_STEPS.map(([n, tt, d], i) => `<div class="s"><b><span class="gastg ${i < WA_DONE ? "d" : "s"}">${/^\d+$/.test(n) ? "Build " + n : n}</span>${tt}</b><span class="d">${d}</span></div>`).join("")}</div>
      <div class="card"><h2>${ic("puzzle", 18)}Weitere Ideen</h2><div class="gschips">${WA_IDEAS.map((x) => `<span class="chip">${esc(x)}</span>`).join("")}</div></div>
      <div class="card"><h2>${ic("info", 18)}Noch offen</h2><ul style="margin:6px 0 0;padding-left:20px;line-height:1.6">${WA_OPEN.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
    return `${tabs}<div style="display:grid;gap:12px">${body}</div>
      <div class="gasoon" style="margin-top:12px">${ic("clock", 22)}<div><b>Coming soon …</b><br><span class="mut">Dieses Modul ist in Entwicklung. Unter „Termine“ legst du schon echte Termine an. Die übrigen Reiter zeigen, wie es weitergeht – die Termine in den Bildern sind Beispiele. Erinnerungen aufs Handy kommen mit Build 5.</span></div></div>`;
  }
  _waAct(a, b) {
    if (a.startsWith("waxt") && a !== "waxtab") { this._wtAct(a, b); return; }
    if (a === "waxtab") { this._waT = b.dataset.k; try { localStorage.setItem("fh_wa_tab", this._waT); } catch (_) { /* privater Modus */ } this._render(); }
    else if (a === "waxpin") { this._waP = { ...(this._waP || {}), [b.dataset.k]: +b.dataset.i }; this._render(); }
  }

  /* ---- Termine (echte Daten aus wartung.py) ---- */
  _wtLoad(force) {
    if (!this._hass || this._wtBusy) return;
    if (!force && this._wtD && Date.now() - this._wtD.ts < 15000) return;
    this._wtBusy = true;
    this._hass.callWS({ type: "fenster_heizung/wt_get" }).then((r) => { this._wtD = { d: r || {}, ts: Date.now() }; })
      .catch(() => { this._wtD = { d: { ...((this._wtD && this._wtD.d) || {}), error: true }, ts: Date.now() - 10000 }; })
      .finally(() => { this._wtBusy = false; if (this._mdActive && this._mdActive() === "wa") this._render(); });
  }
  _wt() { return (this._wtD && this._wtD.d) || {}; }
  _wtDay(iso) { if (!iso) return "–"; const [y, m, d] = String(iso).split("-"); return `${d}.${m}.${y}`; }
  _wtEvery(t) { const n = +t.every || 1, u = t.unit in { d: 1, w: 1, m: 1, y: 1 } ? t.unit : "m"; return n === 1 ? { d: "jeden Tag", w: "jede Woche", m: "jeden Monat", y: "jedes Jahr" }[u] : `alle ${n} ${{ d: "Tage", w: "Wochen", m: "Monate", y: "Jahre" }[u]}`; }
  _wtWhen(t) {
    const d = t.days;
    if (t.st === "off") return "pausiert";
    if (t.st === "new") return "noch kein Datum";
    if (d === 0) return "heute fällig";
    if (d === 1) return "morgen";
    if (d > 1) return d > 60 ? `am ${this._wtDay(t.due)}` : `in ${d} Tagen`;
    return d === -1 ? "seit gestern fällig" : `seit ${-d} Tagen fällig`;
  }
  _wtPct(t) {
    if (!t.due || !t.last) return t.st === "new" ? 0 : 100;
    const a = new Date(t.last + "T12:00:00").getTime(), b = new Date(t.due + "T12:00:00").getTime(), n = Date.now();
    return Math.max(0, Math.min(100, Math.round(((n - a) / Math.max(1, b - a)) * 100)));
  }
  _wtPage() {
    this._wtLoad();
    const D = this._wt(), S = D.sum || {}, T = D.tasks || [], adm = this._admin(), today = D.today || "";
    if (!this._wtD) return `<div class="card"><span class="mut">Termine werden geladen …</span></div>`;
    if (D.error && !D.tasks) return `<div class="card"><b>Termine nicht geladen</b><div class="mut sm">Modul 15 antwortet nicht. Nach einem Update bitte Home Assistant neu starten.</div></div>`;
    const yr = (today || "").slice(0, 4) || new Date().getFullYear();
    const kpi = `<div class="wtk"><div class="r"><small>Fällig</small><b>${(S.over || 0) + (S.due || 0)}</b></div><div class="a"><small>Bald</small><b>${S.soon || 0}</b></div><div class="g"><small>Im Plan</small><b>${S.ok || 0}</b></div><div class="l"><small>Erledigt ${yr}</small><b>${S.done_year || 0}</b></div></div>`;
    const ed = this._wtEd ? this._wtEditor() : "";
    const bar = `<div class="wtbar"><span class="mut sm">${T.length ? `${T.length} ${T.length === 1 ? "Termin" : "Termine"}${S.next ? ` · als Nächstes: ${esc(S.next.name)} ${esc(this._wtWhen(S.next))}` : ""}` : ""}</span>${adm && !this._wtEd && T.length < (D.max || 100) ? `<button class="btn2" data-act="waxtnew">${ic("plus", 16)} Neuer Termin</button>` : ""}</div>`;
    if (!T.length && !this._wtEd) return `<div style="display:grid;gap:12px">${kpi}<div class="card wtempty">${ic("tools", 30)}<b style="display:block;margin-top:6px">Noch keine Termine</b><p>Lege Wartungen mit einem Abstand an, zum Beispiel „Heizungswartung jedes Jahr“. Ein Tipp auf „Erledigt“ setzt das Datum, der nächste Termin rechnet sich von selbst.</p>${adm ? `<button class="btn2" style="flex:none;padding:10px 18px" data-act="waxtnew">${ic("plus", 16)} Ersten Termin anlegen</button>` : `<span class="mut sm">Anlegen können nur Administratoren.</span>`}</div></div>`;
    const lbl = { ok: "im Plan", soon: "bald", due: "fällig", over: "überfällig", new: "offen", off: "pausiert" };
    const col = { ok: "#2dd4bf", soon: "#fbbf24", due: "#f87171", over: "#f87171", new: "#a78bfa", off: "#8e99ae" };
    const rows = T.map((t) => {
      const h = (t.hist || [])[(t.hist || []).length - 1], undo = adm && h && h.d === today && "prev" in h;
      const sub = [t.area, this._wtEvery(t), t.last ? `zuletzt ${this._wtDay(t.last)}` : "", t.pro ? "Fachbetrieb" : ""].filter(Boolean).map(esc).join(" · ");
      const btns = adm ? `<div class="wtbtns">${undo ? `<button class="wtun" data-act="waxtundo" data-id="${esc(t.id)}">Rückgängig</button>` : ""}${t.st !== "off" && !undo ? `<button class="wtok" data-act="waxtdone" data-id="${esc(t.id)}" aria-label="${esc(t.name)} erledigt">${ic("check", 15)} Erledigt</button>` : ""}<button data-act="waxtedit" data-id="${esc(t.id)}" aria-label="${esc(t.name)} bearbeiten">${ic("pencil", 15)}</button></div>` : "";
      return `<div class="wtr ${t.st}"><div class="wtring" style="--p:${this._wtPct(t)};--c:${col[t.st] || col.ok}"><span>${ic(t.icon || "tools", 18)}</span></div>
        <div class="t"><b>${esc(t.name)}</b><small>${sub}</small><span class="wtst ${t.st}">${lbl[t.st] || ""}${t.st !== "new" && t.st !== "off" ? " · " + esc(this._wtWhen(t)) : ""}</span></div>${btns}</div>`;
    }).join("");
    return `<div style="display:grid;gap:12px">${kpi}${bar}${ed}<div class="wtl">${rows}</div>
      ${S.cost_year ? `<div class="mut sm">Kosten ${yr}: ${num(S.cost_year, 2)} € (aus den Erledigt-Einträgen)</div>` : ""}</div>`;
  }
  _wtTpl() { return [["Schornsteinfeger", 1, "y", "flame", "Heizung"], ["Heizungswartung", 1, "y", "flame", "Heizung"], ["Rauchmelder prüfen", 1, "y", "shield", "Sicherheit"], ["Lüftungsfilter", 6, "m", "fan", "Lüftung"], ["Dunstabzug-Filter", 3, "m", "pot", "Küche"], ["Wasserfilter", 6, "m", "drop", "Wasser"], ["Regenrinne reinigen", 1, "y", "roof", "Haus"], ["Klimaanlage Filter", 3, "m", "fan", "Klima"], ["Wärmepumpe Service", 1, "y", "heatpump", "Heizung"], ["Saugroboter Bürsten", 2, "m", "robot", "Geräte"]]; }
  _wtEditor() {
    const E = this._wtEd, isNew = !E.id, u = E.unit || "m";
    const icons = ["tools", "flame", "fan", "drop", "shield", "heatpump", "boiler", "home", "roof", "plant", "car", "robot", "energy", "sun", "wave", "lamp", "laundry", "pot"];
    const fld = (l, h) => `<div><label>${l}</label>${h}</div>`;
    const inp = (k, type = "text", extra = "") => `<input class="osel" type="${type}" data-f="wtf" data-k="${k}" value="${esc(E[k] == null ? "" : String(E[k]))}" ${extra}>`;
    const tpl = isNew ? `<div><label>Vorlage (füllt die Felder, alles änderbar)</label><div class="wttpl">${this._wtTpl().map((x, i) => `<button data-act="waxttpl" data-i="${i}">${esc(x[0])}</button>`).join("")}</div></div>` : "";
    const ask = this._wtDelAsk === E.id;
    return `<div class="card wted"><h2 style="margin:0">${ic(isNew ? "plus" : "pencil", 18)}${isNew ? "Neuer Termin" : "Termin bearbeiten"}</h2>${tpl}
      <div class="row">${fld("Name", inp("name", "text", 'maxlength="40" placeholder="zum Beispiel Heizungswartung"'))}${fld("Anlage oder Bereich", inp("area", "text", 'maxlength="30" placeholder="zum Beispiel Heizung"'))}</div>
      <div class="row">${fld("Abstand", `<div class="inl">${inp("every", "number", 'min="1" max="3650" inputmode="numeric"')}<select class="osel" data-f="wtf" data-k="unit">${[["d", "Tage"], ["w", "Wochen"], ["m", "Monate"], ["y", "Jahre"]].map(([k, l]) => `<option value="${k}"${k === u ? " selected" : ""}>${l}</option>`).join("")}</select></div>`)}${fld("Vorwarnung (Tage vorher „bald“)", inp("lead", "number", 'min="0" max="90" inputmode="numeric"'))}</div>
      <div class="row">${fld("Zuletzt erledigt", inp("last", "date", `max="${esc(this._wt().today || "")}"`))}${fld("Erster Termin (wenn noch nie erledigt)", inp("first", "date"))}</div>
      ${fld("Symbol", `<div class="wtic">${icons.map((k) => `<button class="${(E.icon || "tools") === k ? "on" : ""}" data-act="waxticon" data-k="${k}" aria-label="${k}">${ic(k, 18)}</button>`).join("")}</div>`)}
      ${fld("Notiz", inp("note", "text", 'maxlength="200" placeholder="zum Beispiel Filtertyp oder Telefonnummer"'))}
      <label class="ck"><input type="checkbox" data-f="wtf" data-k="pro"${E.pro ? " checked" : ""}> Macht ein Fachbetrieb</label>
      <label class="ck"><input type="checkbox" data-f="wtf" data-k="off"${E.off ? " checked" : ""}> Pausiert (keine Ampel, zählt nicht mit)</label>
      <div class="wtacts"><button class="btn2" data-act="waxtsave" style="background:#2dd4bf;color:#06201c;border-color:#2dd4bf">${ic("check", 16)} Speichern</button><button class="btn2" data-act="waxtcancel">Abbrechen</button>${isNew ? "" : `<button class="btn2 wtdel" data-act="waxtdel">${ic("trash", 16)} ${ask ? "Wirklich löschen?" : "Löschen"}</button>`}</div></div>`;
  }
  _wtIn(t) { if (!this._wtEd) return; const k = t.dataset.k; this._wtEd[k] = t.type === "checkbox" ? t.checked : t.value; }
  _wtCall(msg, ok) {
    if (this._wtSending) return; this._wtSending = true;
    this._hass.callWS(msg).then((r) => {
      if (r && r.tasks) this._wtD = { d: r, ts: Date.now() };
      if (r && r.ok === false) this._toast({ name: "Bitte einen Namen eingeben", full: "Es sind schon 100 Termine angelegt", future: "Das Datum liegt in der Zukunft", unknown: "Den Termin gibt es nicht mehr", nothing: "Nichts zum Zurücknehmen" }[r.err] || "Hat nicht geklappt");
      else if (ok) ok(r);
    }).catch((e) => this._toast("Nicht gespeichert: " + ((e && e.message) || e))).finally(() => { this._wtSending = false; this._render(); });
  }
  _wtAct(a, b) {
    const id = b.dataset.id || "", T = this._wt().tasks || [];
    if (a === "waxtnew") { this._wtEd = { name: "", area: "", every: 12, unit: "m", lead: 7, last: "", first: "", icon: "tools", note: "", pro: false, off: false }; this._wtDelAsk = null; this._render(); }
    else if (a === "waxtedit") { const t = T.find((x) => x.id === id); if (t) { const { hist, st, due, days, created, ...rest } = t; this._wtEd = { ...rest }; this._wtDelAsk = null; this._render(); } }
    else if (a === "waxtcancel") { this._wtEd = null; this._wtDelAsk = null; this._render(); }
    else if (a === "waxttpl") { const x = this._wtTpl()[+b.dataset.i]; if (x && this._wtEd) { Object.assign(this._wtEd, { name: x[0], every: x[1], unit: x[2], icon: x[3], area: x[4] }); this._render(); } }
    else if (a === "waxticon") { if (this._wtEd) { this._wtEd.icon = b.dataset.k; this._render(); } }
    else if (a === "waxtsave") {
      const E = { ...this._wtEd }; if (!String(E.name || "").trim()) { this._toast("Bitte einen Namen eingeben"); return; }
      E.every = +E.every || 1; E.lead = E.lead === "" ? 7 : +E.lead;
      this._wtCall({ type: "fenster_heizung/wt_save", task: E }, (r) => { const t = (r.tasks || []).find((x) => x.id === r.id); this._wtEd = null; this._toast(t && t.due ? `Gespeichert – nächster Termin ${this._wtDay(t.due)}` : "Gespeichert"); });
    }
    else if (a === "waxtdel") {
      if (!this._wtEd || !this._wtEd.id) return;
      if (this._wtDelAsk !== this._wtEd.id) { this._wtDelAsk = this._wtEd.id; this._render(); return; }
      const tid = this._wtEd.id; this._wtCall({ type: "fenster_heizung/wt_act", act: "del", tid }, () => { this._wtEd = null; this._wtDelAsk = null; this._toast("Termin gelöscht"); });
    }
    else if (a === "waxtdone") this._wtCall({ type: "fenster_heizung/wt_act", act: "done", tid: id }, (r) => { const t = (r.tasks || []).find((x) => x.id === id); this._toast(t && t.due ? `Erledigt – nächster Termin ${this._wtDay(t.due)}` : "Erledigt"); });
    else if (a === "waxtundo") this._wtCall({ type: "fenster_heizung/wt_act", act: "undo", tid: id }, () => this._toast("Zurückgenommen"));
  }
