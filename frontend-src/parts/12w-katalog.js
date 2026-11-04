  /* ================= Einstellungen Stufe 3: Katalog (B1), Suche (C1), Verlauf und Rückgängig (B4, C4), Prüfregeln (B10, C2), Hilfe an der Stelle (C11) ================= */
  /* Jede Einstellung ist hier einmal beschrieben. Daraus entstehen Suche, Hilfe, Verlauf (Namen der Werte) und Prüfung.
     id = Pfad wie im Backend-Verlauf (z. B. general.summer.temp), go = wie man hinkommt, tab = Reiter im Modulfenster. */
  _cat() {
    if (this._catC) return this._adCatAdd(this._catC);
    const onoff = (v) => (v ? "An" : "Aus"), ct = (v) => `${num(v, 2)} ct/kWh`, g = () => this._gen, pv = () => this._pv(), E = () => this._enState(), L = () => this._wxCfg(), nm = (e) => (e ? this._wzName(e) : "–");
    const H = "Haus", M1 = "Module › Modul 1", A = "all";
    const C = [
      // Haus
      { id: "haus.energy.ent.pv", t: "Solar-Leistung", p: `${H} › Energiequellen`, k: "pv photovoltaik sonne erzeugung wechselrichter fronius", go: ["mdsts", "en"], v: () => nm(E().ent.pv), u: /^k?W$/, h: "Leistungssensor der Solaranlage in Watt oder Kilowatt. Grundlage für Überschuss, Autarkie und Energiefluss." },
      { id: "haus.energy.ent.pv2", t: "Zweite Solaranlage", p: `${H} › Energiequellen`, k: "balkonkraftwerk balkon zweite anlage", go: ["mdsts", "en"], v: () => nm(E().ent.pv2), u: /^k?W$/, h: "Optional, zum Beispiel ein Balkonkraftwerk. Die Leistung wird zur ersten Anlage addiert." },
      { id: "haus.energy.ent.grid", t: "Netz-Sensor", p: `${H} › Energiequellen`, k: "netz einspeisung bezug zähler smartmeter tibber pulse shelly überschuss", go: ["mdsts", "en"], v: () => nm(this._enGrid().ent), u: /^k?W$/, h: "Ein Sensor für Einspeisung und Bezug. Das Vorzeichen legst du darunter fest. Modul 1 nutzt ihn auch für den PV-Überschuss der Elektroheizer." },
      { id: "haus.energy.sign", t: "Vorzeichen Netz", p: `${H} › Energiequellen`, k: "vorzeichen positiv negativ einspeisung bezug umdrehen", go: ["mdsts", "en"], v: () => (this._enGrid().sign === "import" ? "Bezug positiv" : "Einspeisung positiv"), h: "Ob dein Netz-Sensor Einspeisung oder Bezug als positiven Wert meldet. Die Prüfung unter Energiequellen zeigt, ob es passt." },
      { id: "haus.energy.ent.bat", t: "Batterie-Leistung", p: `${H} › Energiequellen`, k: "batterie speicher akku laden entladen zendure", go: ["mdsts", "en"], v: () => nm(E().ent.bat), u: /^k?W$/, h: "Leistung des Batteriespeichers. Ein Sensor mit Vorzeichen oder zwei Sensoren für Laden und Entladen." },
      { id: "general.pv.soc_sensor", t: "Batterie-Ladestand", p: `${H} › Energiequellen`, k: "ladestand soc prozent akku batterie", go: ["mdsts", "en"], v: () => nm(pv().soc_sensor), u: /^%$/, h: "Ladestand in Prozent. Elektroheizer in Modul 1 und der Heizstab in Modul 2 warten, bis die Batterie voll genug ist." },
      { id: "haus.energy.ent.house", t: "Hausverbrauch", p: `${H} › Energiequellen`, k: "verbrauch haus last", go: ["mdsts", "en"], v: () => nm(E().ent.house) === "–" ? "berechnet" : nm(E().ent.house), u: /^k?W$/, h: "Optional. Ohne eigenen Sensor wird der Verbrauch aus Solar, Netz und Batterie berechnet." },
      { id: "haus.energy.ent.imp", t: "Zähler für Tagessummen", p: `${H} › Energiequellen`, k: "zähler kwh energie statistik woche monat jahr netzbezug einspeisung ertrag", go: ["mdsts", "en"], v: () => `${["pve", "pve2", "imp", "exp"].filter((x) => E().ent[x]).length} gewählt`, h: "Energiezähler in kWh für Woche, Monat und Jahr in Modul 3 und 4. Sie müssen als Langzeitstatistik in Home Assistant geführt werden." },
      { id: "general.pv.price", t: "Bezugspreis", p: `${H} › Preise & Tarif`, k: "strompreis preis ct kosten tarif tibber netzbezug", go: ["mdsts", "pr"], v: () => ct(this._rate("price")), h: "Preis pro kWh aus dem Netz, als Festwert oder Sensor (zum Beispiel Tibber). Fällt der Sensor aus, gilt der Festwert." },
      { id: "general.pv.feed", t: "Einspeisevergütung", p: `${H} › Preise & Tarif`, k: "einspeisung vergütung preis ct", go: ["mdsts", "pr"], v: () => ct(this._rate("feed")), h: "Vergütung pro eingespeister kWh. Daraus rechnen Modul 1, 3, 4 und 8 den Vorteil von eigenem Strom." },
      { id: "general.pv.price_sensor", t: "Stundenpreis-Sensor", p: `${H} › Preise & Tarif`, k: "stundenpreis dynamisch börse sensor tibber awattar", go: ["mdsts", "pr"], v: () => (pv().price_mode === "entity" ? nm(pv().price_sensor) : "Festwert"), u: /(ct|€|eur|cent)/i, h: "Sensor mit dem aktuellen Strompreis in ct/kWh oder €/kWh." },
      { id: "layout.wx.entity", t: "Wetter-Entität", p: `${H} › Wetterquelle`, k: "wetter weather vorhersage dwd", go: ["mdsts", "wx"], v: () => (L().entity ? nm(L().entity) : "automatisch"), h: "Wetter für Kopfkarte, Sommermodus, wetterabhängige Absenkung und Modul 9." },
      { id: "layout.wx.outdoor", t: "Außentemperatur", p: `${H} › Wetterquelle`, k: "außentemperatur aussen draußen temperatur sensor", go: ["mdsts", "wx"], v: () => (L().outdoor ? nm(L().outdoor) : "aus der Wetter-Entität"), u: /°[CF]/, h: "Eigener Außensensor. Ohne ihn kommt die Temperatur aus der Wetter-Entität." },
      { id: "haus.wx.wind", t: "Wind-Sensor", p: `${H} › Wetterquelle`, k: "wind sturm böe km/h", go: ["mdsts", "wx"], v: () => nm((this._wxs().cfg || {}).wind), h: "Für die Sturmwarnung in Modul 9. Ohne Sensor gilt der Wind aus der Wetter-Entität." },
      { id: "haus.wx.official", t: "Amtliche Warnungen", p: `${H} › Wetterquelle`, k: "dwd nina unwetter warnung amtlich", go: ["mdsts", "wx"], h: "Warnungen des Deutschen Wetterdienstes oder von NINA für Modul 9." },
      { id: "presence", t: "Personen & Standort", p: H, k: "personen anwesenheit abwesend urlaub icloud handy standort home-zone zuhause karte", go: ["ortopen"], h: "Wer zu Hause ist und wo das Zuhause liegt. Steuert Abwesenheit und Urlaub in Modul 1 und Modul 2." },
      { id: "messwerk", t: "Messwerk", p: "Einstellungen", k: "sensoren sensor entität alle genutzt module ausfall messwerk", go: ["mdsta", "mw"], v: () => (this._mwD ? `${this._mwD.stats.sensors} Sensoren` : ""), h: "Alle Sensoren, die in einem Modul eingestellt sind, an einer Stelle. Zu jedem Sensor siehst du, in welchen Modulen er wofür genutzt wird und ob er liefert." },
      { id: "rooms", t: "Räume", p: H, k: "raum räume assistent thermostat fenster", go: ["wz"], v: () => `${this._collect().length}`, h: "Räume mit Thermostaten und Fenstern. Der Einrichtungsassistent ordnet sie zu." },
      // Modul 1
      { id: "general.summer.mode", t: "Sommermodus", p: `${M1} › Regeln`, k: "sommer heizplan pause warm", go: ["fhset"], tab: "rg", v: () => ({ off: "Aus", auto: "Automatisch", on: "Immer an" }[g().summer.mode]), h: "Wenn es draußen warm genug ist, ruhen die Heizpläne. Die Fenstermeldung bleibt aktiv." },
      { id: "general.summer.temp", t: "Sommermodus ab", p: `${M1} › Regeln`, k: "sommer schwelle außentemperatur", go: ["fhset"], tab: "rg", v: () => `${num(g().summer.temp, 1)} °C`, n: "°C", h: "Außentemperatur, gemittelt über die gewählten Tage, ab der der Sommermodus gilt." },
      { id: "general.summer.days", t: "Sommermodus gemittelt über", p: `${M1} › Regeln`, k: "sommer tage mittel", go: ["fhset"], tab: "rg", v: () => `${g().summer.days} Tage`, h: "Über wie viele Tage die Außentemperatur gemittelt wird." },
      { id: "general.wxadj.on", t: "Wetterabhängige Absenkung", p: `${M1} › Regeln`, k: "wetter absenkung sonne frost anheben mild", go: ["fhset"], tab: "rg", v: () => onoff(g().wxadj.on), h: "Bei Sonne oder milder Luft sinkt die Zieltemperatur, bei Frost steigt sie." },
      { id: "general.wxadj.down", t: "Absenkung bei mildem Wetter", p: `${M1} › Regeln`, k: "absenken kelvin mild", go: ["fhset"], tab: "rg", v: () => `${num(g().wxadj.down, 1)} K`, n: "K" },
      { id: "general.wxadj.up", t: "Anhebung bei Frost", p: `${M1} › Regeln`, k: "anheben frost kelvin", go: ["fhset"], tab: "rg", v: () => `${num(g().wxadj.up, 1)} K`, n: "K" },
      { id: "general.pv.reserve", t: "Reserve für Elektroheizer", p: `${M1} › Elektroheizer`, k: "elektroheizer reserve watt überschuss heizer", go: ["fhset"], tab: "pv", v: () => `${pv().reserve} W`, n: "W", h: "So viel Leistung bleibt zusätzlich zur Heizerleistung übrig, bevor ein Heizer einschaltet." },
      { id: "general.pv.delay", t: "Elektroheizer einschalten nach", p: `${M1} › Elektroheizer`, k: "verzögerung einschalten minuten heizer", go: ["fhset"], tab: "pv", v: () => `${pv().delay} Min.`, n: "Min." },
      { id: "general.pv.minrun", t: "Mindestlaufzeit Elektroheizer", p: `${M1} › Elektroheizer`, k: "mindestlaufzeit heizer minuten", go: ["fhset"], tab: "pv", v: () => `${pv().minrun} Min.`, n: "Min." },
      { id: "general.pv.soc_min", t: "Elektroheizer erst ab Ladestand", p: `${M1} › Elektroheizer`, k: "ladestand batterie heizer prozent", go: ["fhset"], tab: "pv", v: () => `${pv().soc_min} %`, n: "%", h: "Die Batterie wird zuerst bis zu diesem Ladestand geladen." },
      { id: "entfeuchter", t: "Luftentfeuchter", p: `${M1} › Geräte`, k: "entfeuchter luftfeuchte feucht schimmel keller", go: ["fhset"], tab: "gr", h: "Mobilen Entfeuchter einbinden und mit der Raumfeuchte regeln." },
      { id: "general.valve.warn", t: "Batterie schwach ab", p: `${M1} › Geräte`, k: "batterie thermostat ventil schwach warnung", go: ["diag"], v: () => `${(g().valve || {}).warn || 20} %`, n: "%", h: "Ab diesem Batteriestand meldet die Diagnose ein Thermostat als schwach." },
      { id: "general.valve.notify", t: "Meldung bei Ventil-Problemen", p: `${M1} › Geräte`, k: "benachrichtigung ventil problem meldung", go: ["diag"], h: "Benachrichtigungsdienst für ausgefallene Ventile und schwache Batterien." },
      // Darstellung, Gerät, Erweiterungen, System
      { id: "layout.accent", t: "Akzentfarbe", p: "Darstellung", k: "farbe akzent design theme", go: ["look"], h: "Farbe für Knöpfe und Markierungen. Gilt für alle." },
      { id: "layout.wx.on", t: "Wetter in der Kopfkarte", p: "Darstellung", k: "wetter anzeige kopfkarte", go: ["look"], v: () => onoff(L().on) },
      { id: "hz", t: "Startseite", p: "Darstellung", k: "startseite begrüßung karten bubbles", go: ["hzopen"] },
      { id: "tablet", t: "Tablet-Modus", p: "Dieses Gerät", k: "tablet fully kiosk pin wandtablet", lv: "dev", go: ["tmopen"], v: () => onoff(this._tmOn()), h: "Nur für diesen Browser: Vollbild für ein Wandtablet mit PIN und Ruhemodus." },
      { id: "store", t: "Store & Integrationen", p: "Erweiterungen", k: "store integration dienst tibber go-e forecast", go: ["igopen"] },
      { id: "labs", t: "Labs", p: "Erweiterungen", k: "labs experimentell test", go: ["labopen"] },
      { id: "mods", t: "Module verwalten", p: "Erweiterungen", k: "module ein aus eigenes modul", go: ["mdmgr"] },
      { id: "general.updates", t: "Update-Hinweise", p: "System › Sichern", k: "update version hinweis", go: ["gen"], v: () => onoff(g().updates !== false) },
      { id: "backup", t: "Sichern & Wiederherstellen", p: "System", k: "sicherung backup homeserver webdav smb wiederherstellen datei", go: ["gen"], h: "Einstellungen als Datei sichern, automatisch auf einen Homeserver kopieren oder interne Kopien zurückholen." },
      { id: "verlauf", t: "Änderungsverlauf", p: "System", k: "verlauf rückgängig änderung wer wann undo", go: ["mdstlog"], h: "Die letzten 50 Änderungen mit Benutzer und Zeit. Jede lässt sich einzeln zurücknehmen." },
      { id: "diag", t: "Diagnose", p: "System", k: "diagnose ventil thermostat batterie problem", go: ["diag"] },
      { id: "versions", t: "Versionen", p: "System", k: "version changelog beta modulversion", go: ["mver"] },
    ];
    MODS.forEach((m) => { const ms = MOD_SET[m.id]; if (ms) C.push({ id: `modules.on.${m.id}`, t: `Modul ${m.n} ${m.name}`, p: "Module", k: `modul ${m.short} ${ms.txt}`.toLowerCase(), go: [ms.act], v: () => (this._stIsOn(m) ? "An" : "Aus"), h: ms.txt }); });
    this._catC = C;
    return this._adCatAdd(C);
  }
  _catBy(path) {
    const C = this._cat(); let e = C.find((x) => x.id === path);
    if (!e) { const p = path.replace(/^haus\.price\./, "general.pv.").replace(/^haus\.soc$/, "general.pv.soc_sensor").replace(/^modules\.energy\./, "haus.energy.").replace(/^general\.pv\.sensor$/, "haus.energy.ent.grid").replace(/^general\.pv\.sign$/, "haus.energy.sign").replace(/^haus\.wx\.(entity|outdoor)$/, "layout.wx.$1"); e = C.find((x) => x.id === p); }
    return e || null;
  }
  _catLabel(path) {
    const e = this._catBy(path); if (e) return e.t;
    const m = /^modules\.on\.(\w+)$/.exec(path); if (m) { const x = MODS.find((y) => y.id === m[1]); if (x) return `Modul ${x.n} ${x.name}`; }
    const parts = path.split("."), A = { general: "Allgemeine Einstellungen", haus: "Haus", modules: "Module", ww: "Modul 2 Warmwasser" }[parts[0]] || parts[0];
    return parts.length > 1 ? `${A}: ${parts.slice(1).join(" › ")}` : A;
  }
  _stNorm(s) { return String(s || "").toLowerCase().replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss").replace(/&amp;/g, "&"); }
  _stFind(q) {
    const w = this._stNorm(q).split(/\s+/).filter(Boolean); if (!w.length) return [];
    return this._cat().map((e) => { const t = this._stNorm(e.t), all = `${t} ${this._stNorm(e.p)} ${this._stNorm(e.k)}`; if (!w.every((x) => all.includes(x))) return null; return [w.every((x) => t.includes(x)) ? (t.startsWith(w[0]) ? 0 : 1) : 2, e]; })
      .filter(Boolean).sort((a, b) => a[0] - b[0] || a[1].t.localeCompare(b[1].t, "de")).map((x) => x[1]).slice(0, 14);
  }
  _stVal(e) { try { return e.v ? e.v() : ""; } catch (_) { return ""; } }
  _stResults() {
    const q = this._stQ || "", r = this._stFind(q), mw = this._mwFind(q), lv = (k) => k === "dev" ? `<em class="stlv l3">📱</em>` : `<em class="stlv l1">🏠</em>`;
    const mwc = mw.length ? `<div class="card sxl stcard"><div class="stch">Sensoren im Messwerk <small>· ${mw.length}</small></div>${mw.map((t) => `<button class="sxrow" data-act="mdmwd" data-k="${esc(t.id)}"><span class="sxi">${ic(this._mwIcon(t.g), 18)}</span><span class="sxt"><b>${esc(t.n)}</b><small>${esc(t.ents.map((e) => this._wzName(e)).join(", "))}</small></span>${this._mwChips(t.uses)}<span class="sxg">${ic("chev", 16)}</span></button>`).join("")}</div>` : "";
    if (!r.length && mw.length) return mwc;
    if (!r.length) return `<div class="card stcard"><div class="stck"><span class="stdot in"></span><span class="sxt"><b>Nichts gefunden für „${esc(q)}“</b><small>Versuch es mit einem anderen Wort, zum Beispiel Preis, Batterie, Wetter oder Sommer.</small></span></div></div>`;
    return `<div class="card sxl stcard"><div class="stch">${r.length} ${r.length === 1 ? "Treffer" : "Treffer"} <small>· „${esc(q)}“</small></div>${r.map((e) => { const v = this._stVal(e); return `<div class="strs"><button class="sxrow" data-act="mdstgo" data-k="${esc(e.id)}"><span class="sxt"><b>${esc(e.t)} ${lv(e.lv)}</b><small>${esc(e.p)}</small></span>${v ? `<em class="hsv">${esc(v)}</em>` : ""}<span class="sxg">${ic("chev", 16)}</span></button>${e.h ? `<button class="sthq" data-act="mdsthelp" data-k="${esc(e.id)}" aria-label="Hilfe zu ${esc(e.t)}">?</button>` : ""}</div>`; }).join("")}</div>${mwc}`;
  }
  _stSearchBox() { return `<div class="stq">${ic("search", 16)}<input type="text" enterkeyhint="search" data-f="stq" placeholder="Einstellung suchen" value="${esc(this._stQ || "")}" autocomplete="off" aria-label="Einstellung suchen"><button class="sthx" data-act="mdstqx" aria-label="Suche löschen">${ic("close", 14)}</button></div>`; }
  _stResHtml(wide) { return `${wide ? `<div class="sthd"><div class="mut sm" style="margin:0">Einstellungen</div><h2>Suche</h2></div>` : ""}${this._stResults()}`; }
  _stInput(t) {
    this._stQ = t.value;
    const sr = this.shadowRoot, box = sr.getElementById("stres"), bd = sr.getElementById("stbody"), wide = (this.clientWidth || window.innerWidth) >= 760;
    if (!box) { this._render(); return; }
    box.innerHTML = this._stQ.trim() ? this._stResHtml(wide) : "";
    if (bd) bd.hidden = !!this._stQ.trim();
  }
  _stGo(id) {
    const e = this._cat().find((x) => x.id === id); if (!e) return;
    this._stQ = ""; const [a, k] = e.go;
    if (a === "mdsts") { this._stOpen = true; this._stA = "hs"; this._stS = k || ""; this._modal = null; this._renderModal(); this._render(); return; }
    if (a === "mdstlog") { this._render(); this._stLogOpen(); return; }
    if (a === "mdsta") { this._stOpen = true; this._stA = k; this._stS = ""; this._modal = null; this._renderModal(); this._render(); return; }
    this._render();
    const b = document.createElement("button"); b.dataset.k = k || ""; this._act(a, b);
    if (e.tab && this._modal) { this._modal.tab = e.tab; this._renderModal(); }
  }
  /* ---- Hilfe an der Stelle */
  _stHelpModal() {
    const e = this._cat().find((x) => x.id === (this._modal || {}).k) || { t: "Hilfe", p: "", h: "" }, v = this._stVal(e);
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>${esc(e.t)}</b><span>${esc(e.p)} · ${e.lv === "dev" ? "📱 nur dieses Gerät" : "🏠 für alle"}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      ${e.h ? `<div class="sthtx">${esc(e.h)}</div>` : ""}${v ? `<div class="gst">${ic("info", 15)}<span>Aktuell: <b>${esc(v)}</b></span></div>` : ""}
      <div class="foot2"><a class="btn2" href="https://github.com/Maddog3010/ha-fenster-heizung/blob/main/docs/Bedienungsanleitung.pdf" target="_blank" rel="noopener">${ic("book", 15)} Bedienungsanleitung</a><button class="btn2 pri" data-act="mdstgo" data-k="${esc(e.id)}">Zur Einstellung</button></div></div>`;
  }
  _stHelpBtn(id) { return this._cat().some((x) => x.id === id && x.h) ? `<button class="sthq" data-act="mdsthelp" data-k="${esc(id)}" aria-label="Hilfe">?</button>` : ""; }
  /* ---- Verlauf und Rückgängig */
  _stLogLoad(then) {
    if (!this._hass) return;
    this._hass.callWS({ type: "fenster_heizung/log_get" }).then((r) => { this._stLog = (r && r.log) || []; this._stLogTs = Date.now(); if (then) then(); else { if (this._stOpen) this._render(); if (this._modal && this._modal.type === "stlog") this._renderModal(); } }).catch(() => { this._stLog = this._stLog || []; });
  }
  _stLogOpen() { this._modal = { type: "stlog" }; this._renderModal(); this._stLogLoad(); }
  _stFmt(path, v) {
    if (v === null || v === undefined || v === "") return "–";
    if (typeof v === "boolean") return v ? "an" : "aus";
    if (typeof v === "number") { const e = this._catBy(path); return `${num(v, Number.isInteger(v) ? 0 : Number.isInteger(v * 10) ? 1 : 2)}${e && e.n ? " " + e.n : /price|feed/.test(path) ? " ct" : ""}`; }
    if (typeof v === "string") { if (/^[a-z_]+\.[a-z0-9_]+$/.test(v)) return this._wzName(v); return { off: "aus", auto: "automatisch", on: "an", export: "Einspeisung positiv", import: "Bezug positiv", entity: "Sensor", fix: "Festwert", charge: "Laden positiv", discharge: "Entladen positiv", one: "ein Sensor", two: "zwei Sensoren" }[v] || v; }
    if (Array.isArray(v)) return `${v.length} ${v.length === 1 ? "Eintrag" : "Einträge"}`;
    return "geändert";
  }
  _stWhen(t) {
    const d = new Date(t * 1000), now = new Date(), hm = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    if (d.toDateString() === now.toDateString()) return `heute ${hm}`;
    if (d.toDateString() === new Date(Date.now() - 864e5).toDateString()) return `gestern ${hm}`;
    return `${d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })} ${hm}`;
  }
  _stLogRows(list, max) {
    const adm = this._admin();
    return (list || []).slice(0, max || 50).map((e) => `<div class="stlr ${e.undone ? "done" : ""}"><span class="stlw">${esc(this._stWhen(e.t))}<small>${esc(e.who || "")}</small></span>
      <span class="sxt"><b>${esc(e.many ? `${e.many} Werte (${this._catLabel(e.path)})` : this._catLabel(e.path))}</b><small>${e.many ? "Sicherung eingelesen oder viele Werte auf einmal" : `${esc(this._stFmt(e.path, e.old))} → ${esc(this._stFmt(e.path, e.new))}`}${String(e.note || "").startsWith("undo:") ? " · Rücknahme" : ""}${e.undone ? " · zurückgenommen" : ""}</small></span>
      ${adm && e.undo && !e.undone ? `<button class="ibtn stlu" data-act="mdstundo" data-k="${e.id}" aria-label="Zurücknehmen" title="Zurücknehmen">↶</button>` : ""}</div>`).join("") || `<div class="stck"><span class="stdot in"></span><span class="sxt"><b>Noch keine Änderungen</b><small>Ab jetzt erscheint hier jede Änderung mit Benutzer und Zeit.</small></span></div>`;
  }
  _stLogModal() {
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Änderungsverlauf</b><span>Die letzten 50 Änderungen · gilt für alle</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="mut sm" style="margin:2px 0 8px">Jede Zeile lässt sich einzeln mit ↶ zurücknehmen. Das Zurücknehmen erscheint selbst im Verlauf. Nur dieses Gerät betreffende Einstellungen (📱) stehen nicht hier.</div>
      <div class="stlog">${this._stLog ? this._stLogRows(this._stLog) : `<div class="mut sm">Wird geladen …</div>`}</div>
      <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _stUndo(id) {
    this._hass.callWS({ type: "fenster_heizung/log_undo", id: Number(id) }).then((r) => {
      if (r && r.general) this._gen = { ...this._gen, ...r.general }; if (r) this._mdApply(r); if (r && r.haus) this._haus = r.haus; if (r && r.layout) this._cfg.layout = { ...this._cfg.layout, ...r.layout };
      this._stLog = (r && r.log) || this._stLog; this._toast("Zurückgenommen"); this._render(); if (this._modal) this._renderModal();
    }).catch((e) => this._toast((e && e.message) || "Konnte nicht zurückgenommen werden"));
  }
  /* Nach dem Speichern: „Gespeichert · Rückgängig“ für 10 Sekunden */
  _stSaved() {
    clearTimeout(this._stSvT);
    this._stSvT = setTimeout(() => this._stLogLoad(() => {
      const me = (this._hass.user || {}).name, e = (this._stLog || []).find((x) => x.undo && !x.undone && Date.now() / 1000 - x.t < 8 && (!me || x.who === me));
      if (this._stOpen) this._render();
      if (!e) return;
      const t = this.shadowRoot.getElementById("toast"); if (!t) return;
      t.innerHTML = `<div class="toast stun">${ic("check", 18)}<span>Gespeichert: ${esc(this._catLabel(e.path))} ${esc(this._stFmt(e.path, e.new))}</span><button class="lnk" data-act="mdstundo" data-k="${e.id}">Rückgängig</button></div>`;
      clearTimeout(this._tt); this._tt = setTimeout(() => (t.innerHTML = ""), 10000);
    }), 700);
  }
  /* ---- Prüfregeln aus dem Katalog: Sensor liefert, Einheit passt */
  _stRules() {
    const st = this._hass.states, out = [], E = this._enState(), p = this._pv(), L = this._wxCfg();
    const ent = { "haus.energy.ent.pv": E.ent.pv, "haus.energy.ent.pv2": E.ent.pv2, "haus.energy.ent.grid": this._enGrid().ent, "haus.energy.ent.bat": E.bmode === "two" ? "" : E.ent.bat, "haus.energy.ent.house": E.ent.house, "general.pv.soc_sensor": p.soc_sensor, "general.pv.price_sensor": p.price_mode === "entity" ? p.price_sensor : "", "layout.wx.outdoor": L.outdoor };
    Object.entries(ent).forEach(([id, eid]) => {
      const e = this._catBy(id), s = eid && st[eid]; if (!e || !e.u || !s) return;
      const un = (s.attributes || {}).unit_of_measurement || "";
      if (!e.u.test(un)) out.push(["wn", `Einheit passt nicht: ${e.t}`, `${esc(this._wzName(eid))} liefert „${esc(un || "ohne Einheit")}“, erwartet ${{ "%": "Prozent", "°": "°C" }[String(e.u).slice(2, 3)] || (String(e.u).includes("W") ? "W oder kW" : "ct/kWh oder €/kWh")}`, "mdstgo", id]);
    });
    const ck = this._enConfigured() ? this._hsEnCheck() : null;
    if (ck && ck[0] === "wn" && /Vorzeichen/.test(ck[1])) out.push(["wn", ck[1], ck[2], "mdsts", "en"]);
    return out;
  }
