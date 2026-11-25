  /* ================= Tablet-Modus · Stufe 2: Modul 2 · Warmwasser & Zirkulation =================
     Jetzt: Speicher groß, drei Knöpfe, vier Werte, Zeiten von heute. Zeiten: vier Felder. Verlauf: Kurve der letzten 24 Stunden. */
  _tm2Ww() {
    if (!this._wwConfigured()) return this._wwPage();
    this._wwLoad();
    const tab = this._tm2Tab("ww");
    return tab === "times" ? this._tm2WwTimes() : tab === "hist" ? this._tm2WwHist() : this._tm2WwNow();
  }
  _tm2WwBtns() {
    const W = this._mdState().ww, E = W.ent, hasGen = !!(E.src || E.rod);
    if (!this._admin()) return "";
    const b = (act, on, i, l, ok, why) => `<button class="tm2act ${on ? "on" : ""}" data-act="${act}" aria-pressed="${!!on}" ${ok ? "" : "disabled"}>${ic(i, 30)}<span><b>${l}</b>${ok ? "" : `<small>${why}</small>`}</span></button>`;
    return `<div class="tm2acts">${b("wwboost", W.boost, "flame", W.boost ? "Aufheizen stoppen" : "Einmal aufheizen", hasGen || W.boost, "Kein Erzeuger gewählt")}${b("wwcirc5", W.circ5, "drop", W.circ5 ? "Zirkulation läuft" : "Zirkulation 5 Min.", !!E.pump, "Keine Pumpe gewählt")}${b("wwaway", W.away, "suitcase", W.away ? "Abwesend: an" : "Abwesend", true, "")}</div>`;
  }
  _tm2WwNow() {
    const W = this._mdState().ww, E = W.ent, t = this._wwTemps(), st = this._wwStatus(), sh = this._wwShowers(t), want = this._wwWant(), pvNow = this._pvNow();
    const today = new Date().getDay() % 6 === 0 ? "we" : "wd", pumpOn = this._wwIsOn(E.pump), rv = this._wwV(E.ret), legD = this._wwLegDays(), srcMin = this._wwMinutesOn(E.src || E.rod), pumpMin = this._wwMinutesOn(E.pump), hasGen = !!(E.src || E.rod);
    const circH = (W.circ[today] || []).reduce((a, x) => a + Math.max(0, wwTm(x.to) - wwTm(x.from)), 0) / 60;
    const probs = this._wwProblems().filter((p) => p[0] === "bad" || p[0] === "warn");
    const warn = probs.length ? `<button class="tm2warn ${probs[0][0]}" data-act="tm2prob">${ic(probs[0][1], 22)}<span><b>${esc(probs[0][2])}</b></span><em>${probs.length > 1 ? `+${probs.length - 1}` : "Details"}</em></button>` : "";
    const tile = (i, l, v, u, sub, c) => `<div class="tm2val" style="--a:${c}"><span class="ti">${ic(i, 24)}</span><span><small>${l}</small><b>${v}<i>${u ? ` ${u}` : ""}</i></b><em>${sub}</em></span></div>`;
    const tiles = [
      tile("flame", "Erzeuger", srcMin == null ? "–" : srcMin, srcMin == null ? "" : "Min.", hasGen ? "letzte 24 Std." : "Kein Erzeuger gewählt", "var(--amber)"),
      tile("drop", "Zirkulation", E.pump ? (pumpOn ? "läuft" : "aus") : "–", "", E.pump ? `${pumpMin == null ? "" : `${pumpMin} Min. in 24 Std. · `}Plan ${num(circH, 1)} Std.` : "Keine Pumpe gewählt", "var(--teal)"),
      tile("thermo", "Rücklauf", rv == null ? "–" : num(rv, 1), rv == null ? "" : "°C", E.ret ? `Pumpe stoppt ab ${W.circ.ret_max} °C` : "Kein Sensor gewählt", "#60a5fa"),
      tile("shield", "Legionellenschutz", legD == null ? "–" : legD === 0 ? "heute" : `vor ${legD}`, legD ? (legD === 1 ? "Tag" : "Tagen") : "", !hasGen ? "Kein Erzeuger gewählt" : W.leg.on ? `Nächster Lauf: ${DAYS[W.leg.day]} ${W.leg.time}` : "Ausgeschaltet", "#a78bfa"),
    ].join("");
    const times = `<div class="card tm2sched"><div><b>Warmwasser</b><div>${this._wwBar(W.heat[today], "heat")}</div></div>${E.pump ? `<div><b>Zirkulation</b><div>${this._wwBar(W.circ[today], "circ")}</div></div>` : ""}</div>`;
    return `<div class="tm2wwn"><div class="tm2tank"><span class="chip st ${st[2]}">${ic(st[0], 18)}${st[1]}</span><div class="tm2tk">${this._wwTank(t)}</div>
        <div class="tm2tf"><b>${sh != null ? `Reicht für ca. ${sh} ${sh === 1 ? "Dusche" : "Duschen"}` : "Kein Messwert"}</b><small>Soll ${num(want, 0)} °C · ${W.size} Liter${W.pv.on && pvNow != null ? ` · PV-Überschuss ${wfmt(pvNow)}` : ""}</small></div></div>
      <div class="tm2wwr">${this._tm2WwBtns()}${warn}<div class="tm2vals">${tiles}</div>${times}</div></div>`;
  }
  _tm2WwTimes() {
    const W = this._mdState().ww, E = W.ent, adm = this._admin(), hasGen = !!(E.src || E.rod), key = this._wwDay(), pvNow = this._pvNow(), lg = W.leg, pv = W.pv, lock = this._tm2Locked() ? ic("lock", 14) : "";
    const g = (act, extra = "") => `data-act="tm2g" data-g="${act}" ${extra}`;
    const edit = (attr) => (adm ? `<button class="tm2mini" ${attr}>${lock || ic("pencil", 15)} Ändern</button>` : "");
    const head = (i, t, right) => `<div class="tm2sh"><span>${ic(i, 19)}${t}</span>${right ? `<span class="tm2shr">${right}</span>` : ""}</div>`;
    const sw = (act, on, label) => `<span class="tm2swr">${adm ? lock : ""}<button class="sw ${on ? "on" : ""}" ${g(act)} aria-pressed="${!!on}" aria-label="${label}" ${adm ? "" : "disabled"}></button></span>`;
    const miss = (i, title, text, btn) => `<div class="card tm2f">${head(i, title, "")}<div class="tm2miss">${ic(i, 30)}<span>${text}</span>${adm ? `<button class="btn2" ${g("mdsetup")}>${lock} ${btn}</button>` : ""}</div></div>`;
    const days = `<div class="tm2seg" role="group">${[["wd", "Montag–Freitag"], ["we", "Wochenende"]].map(([k, l]) => `<button class="${key === k ? "sel" : ""}" data-act="wwday" data-k="${k}" aria-pressed="${key === k}">${l}</button>`).join("")}</div>`;
    const heat = `<div class="card tm2f">${head("plan", "Warmwasser-Zeitplan", edit(g("wwsch", 'data-k="heat"')))}${days}<div class="${hasGen ? "" : "wwdim"}">${this._wwBar(W.heat[key], "heat")}</div>
      <div class="tm2note">${hasGen ? `Außerhalb der Zeiten ${W.heat.low} °C${pv.on ? ` · bei PV-Überschuss bis ${pv.max} °C` : ""}` : "Noch kein Wärmeerzeuger gewählt: Der Plan dient nur der Anzeige."}</div></div>`;
    const modes = [["plan", "Zeitplan"], ["demand", "Bei Bedarf"], ["interval", "Intervall"], ["off", "Aus"]], cm = W.circ.mode;
    const cnote = cm === "off" ? "Die Pumpe bleibt aus." : cm === "demand" ? `Startet beim Auslöser und läuft ${W.circ.run} Min. nach.${E.trig ? "" : " Noch kein Auslöser gewählt."}` : cm === "interval" ? `In den Zeiten alle ${W.circ.every} Min. für ${W.circ.on} Min.` : `Stoppt, sobald der Rücklauf ${W.circ.ret_max} °C erreicht.`;
    const circ = !E.pump ? miss("drop", "Zirkulation", "Keine Zirkulationspumpe gewählt.", "Pumpe wählen") : `<div class="card tm2f">${head("drop", `Zirkulation <em class="${this._wwIsOn(E.pump) ? "on" : ""}">${this._wwIsOn(E.pump) ? "Pumpe läuft" : "Pumpe aus"}</em>`, edit(g("tm2ww", 'data-k="circ"')))}
      <div class="tm2seg" role="group">${modes.map(([k, l]) => `<button class="${cm === k ? "sel" : ""}" ${g("wwmode", `data-k="${k}"`)} aria-pressed="${cm === k}" ${adm ? "" : "disabled"}>${l}</button>`).join("")}</div>${cm === "off" ? "" : `<div>${this._wwBar(W.circ[key], "circ")}</div>`}<div class="tm2note">${cnote}</div></div>`;
    const legD = this._wwLegDays();
    const leg = !hasGen ? miss("shield", "Legionellenschutz", "Dafür braucht es einen Wärmeerzeuger oder Heizstab.", "Erzeuger wählen") : `<div class="card tm2f">${head("shield", "Legionellenschutz", `${lg.on ? edit(g("tm2ww", 'data-k="leg"')) : ""}${sw("wwleg", lg.on, "Legionellenschutz")}`)}
      ${lg.on ? `<div class="tm2days">${DAYS.map((d, i) => `<button class="${lg.day === i ? "sel" : ""}" ${g("wwlegday", `data-k="${i}"`)} aria-pressed="${lg.day === i}" ${adm ? "" : "disabled"}>${d}</button>`).join("")}</div><div class="tm2note">${lg.time} Uhr · ${lg.temp} °C · ${lg.hold} Min. halten</div>
        <div class="tm2last ${lg.last && (!lg.last.ok || legD > 9) ? "warn" : lg.last ? "ok" : ""}">${ic(!lg.last ? "info" : lg.last.ok && legD <= 9 ? "check" : "alert", 22)}<span><b>${lg.last ? `Zuletzt: ${new Date(lg.last.ts).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "numeric" })}, ${new Date(lg.last.ts).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr` : "Noch keine Aufheizung aufgezeichnet"}</b>${lg.last ? `<small>${num(lg.last.max, 1)} °C erreicht, ${lg.last.held} Min. gehalten</small>` : ""}</span></div>`
        : `<div class="tm2miss">${ic("alert", 28)}<span>Aus. Bei großen Speichern oder mit Zirkulation wird regelmäßiges Aufheizen empfohlen.</span></div>`}</div>`;
    const val = (l, v, c) => `<div style="--a:${c}"><small>${l}</small><b>${v}</b></div>`;
    const pvC = !E.rod ? miss("bolt", "PV-Überschuss nutzen", "Kein Heizstab gewählt.", "Heizstab wählen") : `<div class="card tm2f">${head("bolt", "PV-Überschuss nutzen", `${pv.on ? edit(g("tm2ww", 'data-k="pv"')) : ""}${sw("wwpv", pv.on, "PV-Überschuss")}`)}
      ${pv.on ? `<div class="tm2tri">${val("Ab", wfmt(pv.min), "var(--teal)")}${val("Bis maximal", `${pv.max} °C`, "var(--amber)")}${val("Heizstab", wfmt(pv.watt), "#60a5fa")}</div>
        <div class="tm2last ${pvNow != null && pvNow >= pv.min ? "ok" : ""}">${ic("bolt", 22)}<span><b>${pvNow == null ? "Kein PV-Sensor gewählt" : `${wfmt(pvNow)} Überschuss`}</b>${pvNow == null ? "" : `<small>${pvNow >= pv.min ? "Der Heizstab darf laufen." : "Zu wenig, der Heizstab bleibt aus."}</small>`}</span></div>` : `<div class="tm2miss">${ic("bolt", 28)}<span>Aus.</span></div>`}</div>`;
    return `<div class="tm2four">${heat}${circ}${leg}${pvC}</div>`;
  }
  _tm2WwHist() {
    const t = this._wwTemps(), sh = this._wwShowers(t), f = (v) => (v == null ? "–" : `${num(v, 1)} °C`);
    return `<div class="tm2wwh"><div class="card tm2cc"><h2>${ic("chart", 18)}Speicher · letzte 24 Stunden<button class="ibtn gear" style="margin-left:auto" data-act="wwreload" aria-label="Aktualisieren">${ic("clock", 18)}</button></h2><div class="tm2ch" data-tm2ch="ww"></div></div>
      <div class="tm2wws"><div class="tm2big"><small>oben im Speicher</small><b>${f(t.top)}</b><span>${sh != null ? `Reicht für ca. ${sh} ${sh === 1 ? "Dusche" : "Duschen"}` : ""}</span></div>${this._tm2WwBtns()}
      <div class="tm2two"><div style="--a:#fbbf24"><small>Mitte</small><b>${f(t.mid)}</b></div><div style="--a:#38bdf8"><small>unten</small><b>${f(t.bot)}</b></div></div></div></div>`;
  }
  /* Werte ändern (hinter der PIN) und Zustandsmeldungen */
  _tm2WwModal(m) {
    const W = this._mdState().ww, adm = this._admin(), close = `<button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button>`;
    if (m.type === "tm2prob") return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Zustand</b><span>Warmwasser & Zirkulation</span></div>${close}</div>${this._wwProblems().map(([lv, i, ti, tx]) => `<div class="dgs ${lv === "mut" ? "" : lv}">${ic(i, 22)}<div><b>${esc(ti)}</b><span>${esc(tx)}</span></div><span></span></div>`).join("")}</div>`;
    const k = m.kind, T = { circ: "Zirkulation", leg: "Legionellenschutz", pv: "PV-Überschuss" }[k];
    const rows = k === "circ" ? `${this._wwNum("Nachlauf", "Bei Bedarf: so lange läuft die Pumpe nach.", "circ.run", W.circ.run, 1, 15, 1, "Min.", adm)}${this._wwNum("Intervall: Pumpe läuft", "", "circ.on", W.circ.on, 1, 15, 1, "Min.", adm)}${this._wwNum("Intervall: alle", "", "circ.every", W.circ.every, 10, 120, 5, "Min.", adm)}${this._wwNum("Pumpe stoppt ab Rücklauf", "", "circ.ret_max", W.circ.ret_max, 30, 60, 1, "°C", adm)}<button class="btn2" data-act="wwsch" data-k="circ">${ic("clock", 16)} Zeiten der Pumpe</button>`
      : k === "leg" ? `${this._wwNumT("Uhrzeit", "Am besten nachts.", "leg.time", W.leg.time, adm)}${this._wwNum("Schutztemperatur", "", "leg.temp", W.leg.temp, 55, 65, 1, "°C", adm)}${this._wwNum("Halten für", "", "leg.hold", W.leg.hold, 10, 60, 5, "Min.", adm)}`
      : `${this._wwNum("Ab Überschuss", "", "pv.min", W.pv.min, 300, 6000, 100, "W", adm)}${this._wwNum("Speicher bis maximal", "", "pv.max", W.pv.max, 50, 65, 1, "°C", adm)}${this._wwNum("Leistung Heizstab", "", "pv.watt", W.pv.watt, 300, 9000, 100, "W", adm)}`;
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>${T}</b><span>Warmwasser & Zirkulation</span></div>${close}</div>${rows}<div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
