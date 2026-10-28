  /* Labs: experimentelle Funktionen. Ein/Aus und Werte stehen im Layout (layout.labs), gelten für alle Nutzer.
     Eingeschaltet erscheinen sie als Karte mit Labs-Zeichen im passenden Modul, ausgeschaltet sind sie dort komplett weg. */
  _labCfg() { const l = (this._cfg && this._cfg.layout && this._cfg.layout.labs) || {}; return { on: Array.isArray(l.on) ? l.on : [], icon: l.icon !== false, tab: l.tab !== false, cfg: l.cfg && typeof l.cfg === "object" ? l.cfg : {} }; }
  _labOn(id) { return this._labCfg().on.includes(id); }
  _labV(k) { const d = { lx_diff: 0.5, ae_cons: 12, ae_share: 60, wl_wind: 6, lf_days: 14 }, v = this._labCfg().cfg[k]; return typeof v === "number" && isFinite(v) ? v : d[k]; }
  _labSet(patch) { const c = this._labCfg(); this._cfg.layout.labs = { on: c.on, icon: c.icon, tab: c.tab, cfg: c.cfg, ...patch }; this._saveLayout(); this._render(); if (this._modal) this._renderModal(); }
  _labPill(t = "Labs") { return `<em class="labp">${ic("flask", 11)}${t}</em>`; }
  /* Katalog: nur Funktionen, die etwas anzeigen */
  _labCat() {
    return [
      { id: "lx", mid: "fh", mod: "Modul 1", mn: "Fenster & Heizung", n: "Bester Lüftungszeitpunkt", st: "Test", i: "windy", soon: false,
        d: "Vergleicht Innen- und Außenluft und sagt, wann Stoßlüften gegen Feuchte und Schimmel am meisten bringt.",
        feats: ["Pro Raum: lohnt Lüften jetzt oder ist die Luft draußen feuchter?", "Zusammenfassung oben in Modul 1: in wie vielen Räumen Lüften sich lohnt", "Auf Wunsch eigene Schwelle für den Unterschied der absoluten Feuchte"],
        how: ["Aus Temperatur und Luftfeuchte wird die absolute Feuchte (g/m³) innen und außen berechnet.", "Ist es draußen um mehr als die eingestellte Schwelle trockener, lohnt Lüften.", "Die Außenwerte kommen aus der Wetter-Entität oder dem Außensensor aus den Einstellungen."],
        needs: () => [["Räume mit Luftfeuchte-Sensor und Thermostat", this._collect().some((r) => this._airData(r))], ["Außenwerte (Wetter-Entität oder Außensensor)", this._out().t != null]],
        f: [["lx_diff", "Unterschied der Feuchte", "Ab diesem Unterschied (g/m³) lohnt Lüften", "g/m³", 0.5, 4, 0.5]] },
      { id: "ae", mid: "en", mod: "Modul 3", mn: "Energie", n: "Autarkie-Prognose", st: "Test", i: "energy", soon: false,
        d: "Zeigt, wie viel Prozent deines Tagesverbrauchs heute voraussichtlich aus Solarstrom kommen.",
        feats: ["Voraussichtlicher Autarkie-Anteil für heute", "Nutzt die Prognose aus Modul 16"],
        how: ["Solarertrag der Prognose mal Anteil, den das Haus direkt nutzt, geteilt durch den Tagesverbrauch.", "Der Tagesverbrauch kommt aus dem gewählten Zeitraum von Modul 3 (7 oder 30 Tage), sonst aus deiner Angabe.", "Das ist eine grobe Schätzung. Sie ersetzt keine Messung."],
        needs: () => [["Modul 16 ist an und liefert eine Prognose", !!(this._mdState().on.sp && this._sp().found)], ["Modul 3 ist eingerichtet", this._enOn()]],
        f: [["ae_cons", "Täglicher Verbrauch", "Wird genutzt, wenn Modul 3 noch keinen Verlauf hat", "kWh", 3, 60, 1], ["ae_share", "Direkt genutzter Anteil", "Wie viel vom Solarstrom das Haus selbst nutzt", "%", 20, 95, 5]] },
      { id: "wl", mid: "wx", mod: "Modul 9", mn: "Wetter & Warnungen", n: "Wäsche-Wetter", st: "Test", i: "sun", soon: false,
        d: "Sagt, ob Wäsche heute draußen trocknet: Regen, Wind und Luftfeuchte auf einen Blick.",
        feats: ["Ampel: gut, geht so oder eher nicht", "Die drei Werte dahinter: Luftfeuchte, Wind, Niederschlag", "Eigene Mindest-Windstärke einstellbar"],
        how: ["Regen, Schnee, Hagel und Gewitter in der Wetter-Entität bedeuten „eher nicht“.", "Bis 75 % Luftfeuchte und ab der Mindest-Windstärke ist es „gut“, bis 85 % „geht so“.", "Die Werte kommen aus deiner Wetter-Entität (Modul 9 → Datenquellen)."],
        needs: () => [["Eine Wetter-Entität", Object.keys(this._hass.states).some((k) => k.startsWith("weather."))]],
        f: [["wl_wind", "Mindest-Wind", "Ab dieser Windstärke trocknet Wäsche gut", "km/h", 0, 25, 1]] },
      { id: "lf", mid: "sp", mod: "Modul 16", mn: "Solar-Prognose", n: "Lernfaktor für die Prognose", st: "Früh", i: "chart", soon: false,
        d: "Korrigiert die Prognose um die gelernte Abweichung deiner Anlage, zum Beispiel durch Verschattung.",
        feats: ["Gelernter Faktor aus Prognose gegen tatsächlichen Ertrag", "Korrigierte Prognose für heute", "Zeigt, wie viele Tage in den Faktor eingeflossen sind"],
        how: ["Aus den letzten Tagen: Summe des Ertrags geteilt durch Summe der Prognose.", "Der Faktor wird auf 0,5 bis 1,5 begrenzt. Er braucht mindestens 3 Tage Verlauf.", "Die korrigierte Prognose ist nur eine Anzeige. Andere Module nutzen weiter die Originalprognose."],
        needs: () => [["Modul 16 ist an und liefert eine Prognose", !!(this._mdState().on.sp && this._sp().found)], ["Ertragssensor in Modul 16 gewählt", !!this._sp().has_act]],
        f: [["lf_days", "Tage für den Faktor", "So viele Tage fließen in die Berechnung ein", "Tage", 3, 30, 1]] },
      { id: "st", mid: "en", mod: "Modul 3", mn: "Energie", n: "Spartipp der Woche", st: "Idee", i: "tools", soon: true,
        d: "Kurzer Hinweis, welches Gerät oder welche Uhrzeit den meisten Netzstrom kostet, mit Vorschlag.",
        feats: ["Größter Netzbezug der Woche", "Konkreter Vorschlag mit geschätzter Ersparnis"], how: ["Noch in Vorbereitung."], needs: () => [], f: [] },
    ];
  }
  _labMods() { return [...new Set(this._labCat().map((x) => x.mid))]; }
  _labCount(mid) { return this._labCat().filter((x) => this._labOn(x.id) && (!mid || x.mid === mid)).length; }
  _labBtn() {
    if (!this._admin() || !this._labCfg().icon) return "";
    const n = this._labCount();
    return `<button class="pillbtn sto lab" data-act="labopen" aria-label="Labs: experimentelle Funktionen" title="Labs">${ic("flask", 17)}${n ? `<i class="sdot ldot">${n}</i>` : ""}</button>`;
  }
  _labHdr(mid) { const n = this._labCount(mid); return n ? `<em class="labp">${ic("flask", 11)}${n} ${n === 1 ? "Lab" : "Labs"} aktiv</em>` : ""; }
  _labTab() {
    if (!this._admin() || !this._labCfg().tab) return "";
    const n = this._labCount();
    return `<button class="mtab labt" data-act="labopen" aria-label="Labs: experimentelle Funktionen">${ic("flask", 20)}<span><small>Experimentell</small><b>Labs</b></span>${n ? `<i class="sdot ldot">${n}</i>` : ""}</button>`;
  }
  /* Kennzeichnung im Modul */
  _labCard(x, body) {
    return `<div class="card labc"><em class="labp tr">${ic("flask", 11)}Labs</em><h2>${ic(x.i, 18)}${esc(x.n)}</h2>${body}<div class="labfoot"><span class="risk s">Nur Anzeige</span><span class="mut sm">Experimentell, kann sich ändern.</span>${this._admin() ? `<button class="lnk" data-act="labdet" data-k="${x.id}">Info</button>` : ""}</div></div>`;
  }
  _labField(label, hint, ctrl) { return `<div class="vrow labf"><span>${label} ${this._labPill()}${hint ? `<small class="mut" style="display:block">${hint}</small>` : ""}</span>${ctrl}</div>`; }
  _labStep(f, adm) {
    const [k, , , unit, lo, hi, st] = f, v = this._labV(k), t = (s) => `data-act="labstep" data-k="${k}" data-s="${s}" data-lo="${lo}" data-hi="${hi}" ${adm ? "" : "disabled"}`;
    return `<div class="step" style="flex:none"><button ${t(-st)} aria-label="weniger">${ic("minus", 18)}</button><b>${num(v, st < 1 ? 1 : 0)} ${unit}</b><button ${t(st)} aria-label="mehr">${ic("plus", 18)}</button></div>`;
  }
  /* Felder einer Funktion in den Einstellungen des Moduls (nur wenn die Funktion an ist) */
  _labFields(mid) {
    const adm = this._admin();
    return this._labCat().filter((x) => x.mid === mid && this._labOn(x.id) && x.f.length).map((x) => x.f.map((f) => this._labField(`${esc(x.n)}: ${esc(f[1])}`, esc(f[2]), this._labStep(f, adm))).join("")).join("");
  }
  /* Karten oben in der Seite des Moduls */
  _labCards(mid) {
    return this._labCat().filter((x) => x.mid === mid && this._labOn(x.id) && !x.soon).map((x) => {
      let body = ""; try { body = this["_lab_" + x.id](); } catch (e) { body = `<div class="mut sm">Diese Funktion kann gerade nichts anzeigen.</div>`; }
      return this._labCard(x, body);
    }).join("");
  }
  _labTile(t, v, s, c = "") { return `<div class="luroom ${c}"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${s}</span></div>`; }
  _lab_lx() {
    const rooms = this._collect(), th = this._labV("lx_diff"), o = this._out(), rows = [];
    rooms.forEach((r) => { const a = this._airData(r); if (!a || o.t == null || o.rh == null) return; const d = absH(a.t, a.rh) - absH(o.t, o.rh); rows.push({ r, a, d, ok: d >= th }); });
    if (!rows.length) return `<div class="mut sm">Es fehlen Räume mit Luftfeuchte-Sensor oder die Außenwerte. Sensoren wählst du in den Raumeinstellungen.</div>`;
    const n = rows.filter((x) => x.ok).length;
    return `<div style="font-size:1.05rem;margin:2px 0 10px"><b>${n ? `Jetzt lüften lohnt in ${n} von ${rows.length} ${rows.length === 1 ? "Raum" : "Räumen"}` : "Jetzt lohnt Lüften nirgends"}</b><span class="mut sm" style="display:block">${n ? "Draußen ist die Luft trockener als drinnen." : "Draußen ist die Luft gerade genauso feucht oder feuchter."} Draußen ${num(o.t, 1)} °C, ${num(o.rh)} % Luftfeuchte.</span></div>
      <div class="lugrid">${rows.map((x) => this._labTile(esc(x.r.name), x.ok ? "Lüften lohnt" : "Warten", `${x.ok ? "Trockener draußen um " : "Feuchter draußen um "}${num(Math.abs(x.d), 1)} g/m³`, x.ok ? "green" : "amber")).join("")}</div>`;
  }
  _lab_ae() {
    this._spLoad(); const S = this._sp();
    if (!S.found) return `<div class="mut sm">Braucht Modul 16 mit einer Prognose. Richte dort Forecast.Solar oder einen Prognose-Sensor ein.</div>`;
    let cons = this._labV("ae_cons"), src = "deine Angabe";
    try { const s = this._enSum(); const rg = this._enState().range, n = rg === "week" ? 7 : rg === "month" ? 30 : 0; if (s && !s.empty && n && s.house > 0) { cons = s.house / n; src = `Verbrauchsmuster der letzten ${n} Tage`; } } catch (e) { /* Angabe nutzen */ }
    const share = this._labV("ae_share") / 100, pc = Math.min(100, Math.round(S.today * share / Math.max(cons, 0.1) * 100));
    return `<div class="lugrid">${this._labTile("Heute voraussichtlich", pc + " %", "aus Solar gedeckt")}${this._labTile("Prognose Solar", num(S.today, 1) + " kWh", "Modul 16")}${this._labTile("Tagesverbrauch", num(cons, 1) + " kWh", src)}</div>
      <div class="mut sm" style="margin-top:8px">Grobe Schätzung: ${Math.round(share * 100)} % des Solarstroms nutzt das Haus direkt. Für ein genaueres Muster stelle in Modul 3 den Zeitraum auf 7 oder 30 Tage.</div>`;
  }
  _lab_wl() {
    const w = Object.entries(this._hass.states).find(([k]) => k.startsWith("weather."));
    if (!w) return `<div class="mut sm">Es gibt keine Wetter-Entität in Home Assistant.</div>`;
    const a = w[1].attributes || {}, rh = a.humidity != null ? Number(a.humidity) : null, wind = a.wind_speed != null ? Number(a.wind_speed) : null, wet = ["rainy", "pouring", "lightning-rainy", "lightning", "snowy", "snowy-rainy", "hail"].includes(w[1].state), mw = this._labV("wl_wind");
    let lvl = 0; if (wet || (rh != null && rh > 85)) lvl = 2; else if ((rh != null && rh > 75) || (wind != null && wind < mw)) lvl = 1;
    const T = [["Gut", "Wäsche trocknet draußen gut.", "green"], ["Geht so", "Trocknet, aber langsamer.", "amber"], ["Eher nicht", wet ? "Es regnet oder ist nass." : "Zu feucht zum Trocknen.", "red"]][lvl];
    return `<div class="lugrid">${this._labTile("Wäsche draußen", T[0], T[1], T[2])}${this._labTile("Luftfeuchte", rh != null ? num(rh) + " %" : "–", "bis 75 % gut")}${this._labTile("Wind", wind != null ? num(wind, 0) + " km/h" : "–", `ab ${num(mw, 0)} km/h gut`)}${this._labTile("Niederschlag", wet ? "Ja" : "Nein", esc(w[1].state))}</div>`;
  }
  _lab_lf() {
    this._spLoad(); const S = this._sp();
    if (!S.found) return `<div class="mut sm">Braucht Modul 16 mit einer Prognose.</div>`;
    const days = (S.hist || []).filter((x) => x.f > 0 && x.a != null).slice(-this._labV("lf_days"));
    if (days.length < 3) return `<div class="mut sm">Noch zu wenig Verlauf: ${days.length} von mindestens 3 Tagen mit Prognose und Ertrag. Wähle in Modul 16 einen Ertragssensor, dann lernt die Funktion mit.</div>`;
    const f = Math.min(1.5, Math.max(0.5, days.reduce((s, x) => s + x.a, 0) / days.reduce((s, x) => s + x.f, 0)));
    return `<div class="lugrid">${this._labTile("Gelernter Faktor", num(f, 2), `aus ${days.length} Tagen`)}${this._labTile("Prognose heute", num(S.today, 1) + " kWh", "Original")}${this._labTile("Korrigiert", num(S.today * f, 1) + " kWh", f < 1 ? "Anlage liefert weniger als die Prognose" : f > 1 ? "Anlage liefert mehr als die Prognose" : "Prognose passt", f < 1 ? "amber" : "green")}</div>`;
  }
  /* Seite „Labs“ (Karten wie im Store) */
  _lab0() { if (!this._labS) this._labS = { c: "all" }; return this._labS; }
  _labCardEl(x) {
    const on = this._labOn(x.id), adm = this._admin();
    return `<div class="labk ${on ? "on" : ""} ${x.soon ? "soon" : ""}"><div class="labkt"><span class="ico">${ic(x.i, 22)}</span>${x.soon ? `<em class="risk">Bald</em>` : `<button class="sw ${on ? "on" : ""}" data-act="labtog" data-k="${x.id}" aria-pressed="${on}" aria-label="${esc(x.n)} ${on ? "ausschalten" : "einschalten"}" ${adm ? "" : "disabled"}></button>`}</div>
      <button class="labkb" data-act="labdet" data-k="${x.id}"><b>${esc(x.n)}</b><span>${esc(x.d)}</span><span class="labtg"><em class="mod">${esc(x.mod)}</em><em class="risk s">Nur Anzeige</em><em class="risk">${esc(x.st)}</em></span></button></div>`;
  }
  _labRender() {
    const sr = this.shadowRoot, mainEl = sr.getElementById("main"), st = this._lab0(), cat = this._labCat(), n = this._labCount();
    const chips = [["all", `Alle (${cat.length})`], ["on", `Eingeschaltet (${n})`], ...this._labMods().map((m) => [m, cat.find((x) => x.mid === m).mod])];
    const vis = cat.filter((x) => st.c === "all" || (st.c === "on" ? this._labOn(x.id) : x.mid === st.c));
    mainEl.innerHTML = `
      <div class="bar${this._narrow ? " nar" : ""}">${this._narrow ? `<button class="ib0" data-act="menu" aria-label="Menü">${ic("menu", 24)}</button>` : ""}
        <div class="brand"><img class="blogo" src="${LOGO_URL}" alt="MADDOG3010" draggable="false"><div><em class="pn">${esc(PRODUCT)}</em><b>Labs</b><span><em class="tag">Experimentelle Funktionen</em>${this._ver ? `<em class="ver">Version ${esc(this._ver)}</em>` : ""}</span></div></div>
        <button class="pillbtn" data-act="labset" aria-label="Labs anzeigen">${ic("sliders", 16)}<span class="bl">Anzeige</span></button>
        <button class="pillbtn" data-act="laboff" ${n ? "" : "disabled"}>${ic("close", 16)}<span class="bl">Alle Labs aus</span></button>
        <button class="pillbtn pri" data-act="labback">${ic("check", 16)}<span class="bl">Fertig</span></button></div>
      <div class="wrap"><div class="sxw stow">
        <div class="labban">${ic("flask", 22)}<div><b>Labs sind Experimente</b>Sie funktionieren schon, sind aber noch nicht überall erprobt. Eingeschaltet erscheinen sie im passenden Modul mit dem Zeichen <em class="labp">${ic("flask", 11)}Labs</em>. Ausgeschaltet sind sie dort wieder weg.</div></div>
        <div class="stoch">${chips.map(([k, t]) => `<button class="${st.c === k ? "on" : ""}" data-act="labc" data-k="${k}" aria-pressed="${st.c === k}">${esc(t)}</button>`).join("")}</div>
        ${vis.length ? `<div class="stog">${vis.map((x) => this._labCardEl(x)).join("")}</div>` : `<div class="card empty">${ic("flask", 30)}<div style="margin-top:8px">Noch nichts eingeschaltet.</div></div>`}
        <div class="mut sm" style="margin:14px 2px">Ideen und Fehler gern auf <a href="https://github.com/Maddog3010/ha-fenster-heizung/issues" target="_blank" rel="noopener">GitHub</a> melden. Eine Funktion kann sich ändern, später fest eingebaut werden oder wieder entfallen.</div></div></div>`;
  }
  /* Infoseite einer Funktion */
  _labModal(id) {
    const x = this._labCat().find((y) => y.id === id); if (!x) return "";
    const on = this._labOn(id), adm = this._admin(), nd = x.needs();
    return `<div class="ov" data-act="close"></div><div class="sheet wide stosh" role="dialog" aria-modal="true">
      <div class="stohd"><span class="stoi big labi">${ic(x.i, 38)}</span><div><b>${esc(x.n)}</b><small>Labs · ${esc(x.mod)} ${esc(x.mn)}</small><div class="stoact">${x.soon ? `<span class="risk">In Vorbereitung</span>` : `<button class="btn2 pri" data-act="labtog" data-k="${x.id}" ${adm ? "" : "disabled"}>${on ? "Ausschalten" : "Einschalten"}</button>${on ? `<span class="stos ok">● Eingeschaltet</span>` : ""}`}</div></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="mut sm" style="margin:0 0 8px">${esc(x.d)}</div>
      <div class="stofa"><div><b>${esc(x.mod)}</b><small>wird angezeigt in</small></div><div><b>Nur Anzeige</b><small>Art</small></div><div><b>${esc(x.st)}</b><small>Stand</small></div></div>
      <div class="lsec">${ic("check", 15)}Was du bekommst</div><ul class="stoul">${x.feats.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      ${x.soon ? "" : `<div class="lsec">${ic("tools", 15)}So wird gerechnet</div>${x.how.map((t, n) => `<div class="stost"><b>${n + 1}</b><span>${esc(t)}</span></div>`).join("")}`}
      ${nd.length ? `<div class="lsec">${ic("info", 15)}Voraussetzungen</div><ul class="stoul">${nd.map(([t, ok]) => `<li>${ok ? "✓" : "✗"} ${esc(t)}</li>`).join("")}</ul>` : ""}
      ${x.f.length ? `<div class="lsec">${ic("sliders", 15)}Einstellungen dieser Funktion</div>${x.f.map((f) => this._labField(esc(f[1]), esc(f[2]), this._labStep(f, adm))).join("")}` : ""}
      <div class="stowarn">${ic("alert", 16)}<span>Labs sind Experimente. Diese Funktion zeigt nur etwas an und schaltet nichts. Ausgeschaltet verschwindet sie aus ${esc(x.mod)}, die Einstellungen bleiben gespeichert.</span></div>
      <div class="foot2" style="margin-top:12px"><a class="btn2" href="https://github.com/Maddog3010/ha-fenster-heizung/issues" target="_blank" rel="noopener">Rückmeldung geben</a><button class="btn2" data-act="close">Schließen</button></div></div>`;
  }
  _labSetModal() {
    const t = this._labCfg();
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Labs anzeigen</b><span>gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="mut sm" style="margin:0 0 8px">Die Labs-Seite bleibt immer unter Einstellungen → Allgemein erreichbar. Hier schaltest du die zusätzlichen Zugänge einzeln ein oder aus.</div>
      <div class="ltog"><span><b>Labs-Symbol im Kopf</b><br><small class="mut">Kolben-Symbol neben dem Store, mit Zähler für eingeschaltete Labs</small></span><button class="sw ${t.icon ? "on" : ""}" data-act="labtz" data-k="icon" aria-pressed="${t.icon}" aria-label="Labs-Symbol im Kopf"></button></div>
      <div class="ltog"><span><b>Tab „Labs“ in der Modul-Leiste</b><br><small class="mut">Am Ende der Leiste, neben dem Store</small></span><button class="sw ${t.tab ? "on" : ""}" data-act="labtz" data-k="tab" aria-pressed="${t.tab}" aria-label="Tab Labs in der Modul-Leiste"></button></div>
      <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _labAct(a, b) {
    const k = b.dataset.k;
    if (a === "labopen") { this._labOpen = true; this._igOpen = false; this._stOpen = false; this._modal = null; this._renderModal(); this._render(); }
    else if (a === "labback") { this._labOpen = false; this._render(); }
    else if (a === "labc") { this._lab0().c = k; this._render(); }
    else if (a === "labdet") { this._modal = { type: "labdet", id: k }; this._renderModal(); }
    else if (a === "labset") { this._modal = { type: "labset" }; this._renderModal(); }
    else if (a === "labtz") { const c = this._labCfg(); this._labSet({ [k]: !c[k] }); }
    else if (a === "labtog") { const c = this._labCfg(), x = this._labCat().find((y) => y.id === k); if (!x || x.soon) return; this._labSet({ on: c.on.includes(k) ? c.on.filter((y) => y !== k) : [...c.on, k] }); }
    else if (a === "laboff") { this._labSet({ on: [] }); this._toast("Alle Labs sind aus"); }
    else if (a === "labstep") { const c = this._labCfg(), v = Math.min(Number(b.dataset.hi), Math.max(Number(b.dataset.lo), Math.round((this._labV(k) + Number(b.dataset.s)) * 100) / 100)); this._labSet({ cfg: { ...c.cfg, [k]: v } }); }
  }
