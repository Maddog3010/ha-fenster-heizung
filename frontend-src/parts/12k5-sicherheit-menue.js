  /* ================= Modul 11 · v0.9 Menüstruktur: nur Seiten, keine Aufklappmenüs und Popups =================
     Reiter: Übersicht · Melder · Grundriss · Wartung · Einstellungen. Ein Melder öffnet eine eigene Seite (this._sfV = {t:"det"}),
     Geräte-Auswahl ist eine Seite mit Suche (this._sfV = {t:"pick"}), Einstellungen haben Bereichs-Reiter (this._sfSec). */
  _sfGo(v) { this._sfV = v || null; this._render(); setTimeout(() => { const el = (this.shadowRoot || this).querySelector(".sftabs"); if (el && el.scrollIntoView) el.scrollIntoView({ block: "start" }); }, 30); }
  /* Auswahl-Zeile: öffnet die Auswahl-Seite (ersetzt das Aufklappmenü _wzSel) */
  _sfSel(opts, cur, f, extra = "", none = "– keiner –", hint = null) {
    const id = f + "|" + extra, meta = { f };
    extra.replace(/data-([a-z]+)="([^"]*)"/g, (_, a, v) => { meta[a] = v.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"); });
    (this._sfPkReg = this._sfPkReg || {})[id] = { opts, cur, f, none, hint, meta };
    const s = cur ? this._hass.states[cur] : null;
    return `<button class="sfpkb ${cur ? "set" : ""}" data-act="sfxpick" data-pid="${esc(id)}"><span class="sfpkt">${cur ? `<b>${esc(this._wzName(cur))}</b><small>${esc(cur)}${s ? " · " + esc(s.state) : ""}</small>` : `<span class="mut">${esc(none)}</span>`}</span>${ic("chev", 16)}</button>`;
  }
  _sfPickTitle(f, k) {
    const m = { sfxmadd: "Melder hinzufügen", sfxdadd: "Zur Abfahrt-Prüfung", sfxfent: "Außentemperatur", sfxcont: "Kontaktperson", sfxmbat: "Batterie-Sensor", sfxmpress: "Test-Knopf", sfxadd: "Aktion hinzufügen", sfxpe: "Melder im Plan" };
    return f === "sfxtts" ? (k === "engine" ? "Sprachdienst" : "Lautsprecher") : m[f] || "Auswahl";
  }
  _sfPickPage(V) {
    const H = this._hass.states, h = V.hint, sc = (e) => (h && (h.test(e) || h.test(this._wzName(e))) ? 0 : 1), all = [...new Set([...V.opts, ...(V.cur && !V.opts.includes(V.cur) ? [V.cur] : [])])].sort((a, b) => sc(a) - sc(b) || this._wzName(a).localeCompare(this._wzName(b), "de")).slice(0, 400);
    const none = V.none && !/^\+/.test(V.none) ? `<button class="sfprw ${V.cur ? "" : "on"}" data-act="sfxpicked" data-v="" data-q=""><span class="sfpi">${ic("close", 16)}</span><span class="sfpt"><b>${esc(V.none.replace(/^[–\s]+|[–\s]+$/g, ""))}</b></span></button>` : "";
    const rows = all.map((e) => { const s = H[e], nm = this._wzName(e); return `<button class="sfprw ${V.cur === e ? "on" : ""}" data-act="sfxpicked" data-v="${esc(e)}" data-q="${esc((nm + " " + e).toLowerCase())}"><span class="sfpi">${ic(e.startsWith("light.") ? "lamp" : e.startsWith("cover.") ? "windowOpen" : e.startsWith("lock.") ? "lock" : "energy", 16)}</span><span class="sfpt"><b>${esc(nm)}</b><small>${esc(e)}${s ? " · " + esc(s.state) : ""}</small></span>${V.cur === e ? ic("check", 16) : ""}</button>`; }).join("");
    return `<div class="sfback"><button data-act="sfxback">${ic("back", 18)}<span>Zurück</span></button></div><div class="sfpk"><div class="sfttl">${this._sfPickTitle(V.f, V.meta && V.meta.k)}</div><input class="osel sfpq" data-f="sfpq" placeholder="Suchen …" autocomplete="off" aria-label="Suchen"><div class="sfprl">${none}${rows || `<div class="mut sm" style="padding:12px">Nichts gefunden.</div>`}</div></div>`;
  }
  _sfView(V, T) { return V.t === "pick" ? this._sfPickPage(V) : this._sfDetPage(V.id, T); }
  /* ---- Reiter Melder */
  _sfRow(x) {
    const C = this._sfx().cfg, st = this._sfSt(x), bt = x.bat != null ? Math.max(0, Math.min(100, x.bat)) : null;
    const col = { alarm: "#ef4444", pause: "#94a3b8", off: "#94a3b8", warn: "#f59e0b", ok: "#34d399" }[st];
    const txt = st === "alarm" ? "ALARM" : st === "pause" ? "ausgeschaltet" : st === "off" ? "nicht erreichbar" : st === "warn" ? `Batterie ${num(bt, 0)} %` : "In Ordnung";
    const tested = x.tested || (this._sfx().test || {}).last, where = [x.room || x.area, x.alarm ? "" : tested ? "geprüft " + this._sfAgo(tested) : ""].filter(Boolean).join(" · ") || x.kind;
    return `<button class="sfrow ${st}" data-act="sfxdet" data-k="${esc(x.id)}" aria-label="${esc(x.name)}: ${txt}. Seite öffnen"><span class="sfri">${this._sfHd(x.k, st, 42)}</span><span class="sfrt"><b>${esc(x.name)}</b><small>${esc(where)}</small></span><span class="sfrs"><b style="color:${col}">${txt}</b>${bt != null ? `<i class="sfbar"><u style="width:${bt}%;background:${bt < C.bat.pct ? "#f59e0b" : "#34d399"}"></u></i>` : ""}</span>${ic("chev", 16)}</button>`;
  }
  _sfMel(T) {
    const adm = this._admin(), S = T.S, fl = this._sfPl().floors, groups = [];
    fl.forEach((f) => { const g = T.l.filter((x) => x.floor === f.id); if (g.length) groups.push([f.n, g]); });
    const rest = T.l.filter((x) => !fl.some((f) => f.id === x.floor)); if (rest.length) groups.push([fl.length ? "Ohne Etage" : "Melder", rest]);
    const ids = new Set(T.l.map((x) => x.id)), H = this._hass.states, cand = Object.keys(H).filter((e) => e.startsWith("binary_sensor.") && !ids.has(e));
    const hid = S.excl || [];
    return `${this._sfKts(T)}<div class="sfmel">${groups.length ? groups.map(([n, g]) => `<div class="sfgh">${esc(n)}<small>${g.length}</small></div>${g.map((x) => this._sfRow(x)).join("")}`).join("") : `<div class="card sfc"><div class="mut sm">Noch keine Melder gefunden. Füge einen von Hand hinzu oder richte deinen Hersteller unter Integrationen ein.</div></div>`}</div>
      ${adm ? `<div class="sfgh">Hinzufügen</div>${this._sfSel(cand, "", "sfxmadd", "", "+ Melder (Binärsensor) hinzufügen", /rauch|smoke|wasser|water|leck|gas|co|hitze|heat/i)}` : ""}
      ${hid.length ? `<div class="sfgh">Ausgeblendet<small>${hid.length}</small></div>${hid.map((x) => `<div class="sfrow o"><span class="sfri">${ic("eyeOff", 20)}</span><span class="sfrt"><b>${esc(x.name || x.id)}</b><small>${esc(x.id)}</small></span>${adm ? `<button class="btn2" data-act="sfxexcl" data-k="${esc(x.id)}" style="flex:none">Einblenden</button>` : ""}</div>`).join("")}` : ""}`;
  }
  /* ---- Melder-Seite (ersetzt das Fenster) */
  _sfDetPage(id, T) {
    const x = this._sfList().find((d) => d.id === id), adm = this._admin(), back = `<div class="sfback"><button data-act="sfxback">${ic("back", 18)}<span>Zurück</span></button></div>`;
    if (!x) return `${back}<div class="card sfc"><div class="mut sm">Dieser Melder wird nicht mehr erkannt.</div></div>`;
    const C = this._sfx().cfg, H = this._hass, st = this._sfSt(x), KN = this._sfxKind(), NM = this._sfxNames(), bt = x.bat != null ? Math.max(0, Math.min(100, x.bat)) : null;
    const fc = x.bat_days != null ? `Batterie reicht noch etwa ${this._sfDur(x.bat_days)}` + (x.bat_thr_days != null && x.bat > C.bat.pct ? ` · bis ${C.bat.pct} % etwa ${this._sfDur(x.bat_thr_days)}` : "") : "";
    const col = { alarm: "#ef4444", pause: "#94a3b8", off: "#94a3b8", warn: "#f59e0b", ok: "#34d399" }[st], txt = { alarm: "ALARM", pause: "Ausgeschaltet", off: "Nicht erreichbar", warn: "Batterie schwach", ok: "In Ordnung" }[st];
    const where = [(this._sfPl().floors.find((f) => f.id === x.floor) || {}).n, x.room || x.area, x.src ? "Quelle " + x.src : ""].filter(Boolean).join(" · ") || x.kind;
    const head = `<div class="sfdh ${st}"><span class="sfdr" style="--p:${bt == null ? 0 : bt};--c:${bt != null && bt < C.bat.pct ? "#f59e0b" : "#34d399"}"><i>${bt == null ? "–" : num(bt, 0)}</i></span><span class="sfdt"><b>${esc(x.name)}</b><small>${esc(where)}</small><em style="color:${col}">● ${txt}</em></span></div>`;
    let ed = "";
    if (adm) {
      const m = (C.meta || {})[x.id] || {}, e = esc(x.id), c = (k, v, t, on) => `<button class="gsch ${on ? "sel" : ""}" data-act="sfxmset" data-e="${e}" data-k="${k}" data-v="${esc(String(v))}" aria-pressed="${!!on}">${t}</button>`;
      const bat = Object.keys(H.states).filter((q) => q.startsWith("sensor.") && ((H.states[q].attributes || {}).device_class === "battery" || /batter|akku/i.test(q))), btn = Object.keys(H.states).filter((q) => q.startsWith("button."));
      const bty = ["CR123A", "CR2", "CR2032", "AA", "AAA", "9 V Block", "Lithium 10 Jahre", "Akku", "Netzbetrieb"], fl = C.plan.floors;
      ed = `<div class="card sfc"><h2>${ic("pencil", 18)}Bearbeiten</h2>
        <div class="sffld"><label>Name</label><input class="osel" data-f="sfxmf" data-k="name" data-e="${e}" value="${esc(m.name || "")}" maxlength="40" placeholder="${esc(this._wzName(x.id))}"></div>
        <div class="sfhl">Art</div><div class="sfat">${Object.keys(NM).map((k) => `<button class="${x.k === k ? "on" : ""}" data-act="sfxmset" data-e="${e}" data-k="kind" data-v="${k}" aria-pressed="${x.k === k}">${ic(KN[k][1], 22)}<b>${NM[k]}</b></button>`).join("")}</div>
        <div class="sfhl">Etage</div><div class="gschips">${c("floor", "", "keine", !m.floor)}${fl.map((f) => c("floor", f.id, esc(f.n), m.floor === f.id)).join("")}</div>
        <div class="sffld"><label>Raum${x.area ? ` (aus Home Assistant: ${esc(x.area)})` : ""}</label><input class="osel" data-f="sfxmf" data-k="room" data-e="${e}" value="${esc(m.room || "")}" maxlength="40" placeholder="${esc(x.area || "zum Beispiel Schlafzimmer")}"></div>
        <div class="sfhl">Batterie-Typ (für die Einkaufsliste)</div><div class="gschips">${c("btype", "", "unbekannt", !m.btype)}${bty.map((b) => c("btype", b, b, m.btype === b)).join("")}</div>
        <div class="sffld"><label>Batterie-Sensor${x.bat != null ? ` (aktuell ${num(x.bat, 0)} %)` : " (nicht gefunden)"}</label>${this._sfSel(bat, m.bat || "", "sfxmbat", `data-e="${e}"`, "automatisch suchen", /batter|akku/i)}</div>
        ${(() => { const iv = m.inst || "", y0 = new Date().getFullYear(), iy = Number(iv.slice(0, 4)) || y0, im = iv.slice(5, 7), MN = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"], ys = (this._sfInstY && this._sfInstY[x.id]) || iy, mm = (i) => String(i + 1).padStart(2, "0"), yb = (d, t) => `<button class="sfyb" data-act="sfxinsty" data-e="${e}" data-k="${ys + d}" aria-label="${t}" ${ys + d > y0 || ys + d < y0 - 40 ? "disabled" : ""}>${ic("chev", 18)}</button>`; return `<div class="sfhl">Eingebaut am<b class="sfdv">${iv ? this._sfMon(iv) : "nicht eingetragen"}</b></div><div class="sfcal"><div class="sfcy">${yb(-1, "Jahr zurück")}<b>${ys}</b>${yb(1, "Jahr vor")}</div><div class="sfcm">${MN.map((n, i) => `<button class="${iv && ys === iy && im === mm(i) ? "on" : ""}" data-act="sfxmset" data-e="${e}" data-k="inst" data-v="${ys}-${mm(i)}" ${ys === y0 && i > new Date().getMonth() ? "disabled" : ""}>${n}</button>`).join("")}</div>${iv ? `<button class="sfcc" data-act="sfxmset" data-e="${e}" data-k="inst" data-v="">Datum entfernen</button>` : ""}</div>`; })()}
        <div class="sfhl">Austausch nach</div><div class="gschips">${[[0, "nicht überwachen"], [5, "5 Jahre"], [7, "7 Jahre"], [10, "10 Jahre"], [15, "15 Jahre"]].map(([v, t]) => c("life", v, t, (m.life || 0) === v)).join("")}</div>
        <div class="sfhl">Prüfen alle</div><div class="gschips">${[[0, `wie allgemein (${C.test.months} Mon.)`], [1, "1 Monat"], [3, "3 Monate"], [6, "6 Monate"], [12, "12 Monate"]].map(([v, t]) => c("int", v, t, (m.int || 0) === v)).join("")}</div>
        <div class="sffld"><label>Test-Knopf des Melders${x.test ? "" : " (keiner gefunden)"}</label>${this._sfSel(btn, m.press || "", "sfxmpress", `data-e="${e}"`, "automatisch suchen", /test/i)}</div></div>`;
    }
    const acts = adm ? `<div class="sfbtn"><button class="btn2 pri" data-act="sfxdt" data-k="${esc(x.id)}">${ic("check", 15)} Geprüft</button>${x.bat != null ? `<button class="btn2" data-act="sfxdbat" data-k="${esc(x.id)}">Batterie getauscht</button>` : ""}${x.test ? `<button class="btn2" data-act="sfxpress" data-k="${esc(x.id)}">Test auslösen</button>` : ""}<button class="btn2 sfdel" data-act="sfxrmdet" data-k="${esc(x.id)}">${x.manual ? "Entfernen" : "Ausblenden"}</button></div>` : "";
    return `${back}${head}
      <div class="card sfc"><h2>${ic("energy", 18)}Batterie<small class="mut">${x.bat != null ? num(x.bat, 0) + " %" : ""}</small></h2>${this._sfGraph(x)}${fc ? `<div class="sfpn">${ic("clock", 15)}${esc(fc)}</div>` : ""}</div>
      <div class="card sfc"><h2>${ic("check", 18)}Prüfung und Lebensdauer</h2>${this._sfDetFactsPlain(x)}</div>${this._sfPauseCard(x)}${this._sfFaCard(x)}${ed}${acts}`;
  }
  /* ---- Reiter Einstellungen: Bereichs-Reiter statt langer Liste */
  _sfSetNew(T) {
    const C = T.C, H = this._hass, st = H.states, NM = this._sfxNames(), sw = (act, k, on, label) => `<button class="sw ${on ? "on" : ""}" data-act="${act}" data-k="${k}" aria-pressed="${!!on}" aria-label="${label}"></button>`;
    const chip = (act, k, t, on, ex = "") => `<button class="gsch ${on ? "sel" : ""}" data-act="${act}" data-k="${k}" ${ex} aria-pressed="${!!on}">${t}</button>`;
    const card = (ico, t, inner, sub = "") => `<div class="card sfc"><h2>${ic(ico, 18)}${t}</h2>${sub ? `<div class="mut sm" style="margin:-4px 0 8px">${sub}</div>` : ""}${inner}</div>`;
    const vr = (t, s, r) => `<div class="vrow"><span>${t}${s ? `<small class="mut" style="display:block">${s}</small>` : ""}</span>${r}</div>`;
    const secs = [["melder", "shield", "Melder"], ["alarm", "alert", "Alarm"], ["akt", "energy", "Aktionen"], ["batt", "energy", "Batterie"], ["pruef", "clock", "Prüfung"], ["meld", "bell", "Meldungen"], ["abf", "lock", "Abfahrt"], ["look", "eye", "Aussehen"]], sec = secs.some((s) => s[0] === this._sfSec) ? this._sfSec : "melder";
    const nav = `<div class="sfsec" role="tablist">${secs.map(([k, i, t]) => `<button class="${k === sec ? "on" : ""}" data-act="sfxsec" data-k="${k}" role="tab" aria-selected="${k === sec}">${ic(i, 15)}${t}</button>`).join("")}</div>`;
    let body = "";
    if (sec === "melder") body = card("shield", "Welche Melder", `<div class="gschips">${Object.keys(NM).map((k) => chip("sfxkind", k, NM[k], C.kinds.includes(k))).join("")}</div><div class="sfpn" style="margin-top:10px">${ic("info", 15)}<span>Hersteller wie X-Sense richtest du unter <button class="lnk" data-act="sfxgoig">Einstellungen → Integrationen</button> ein.</span></div><button class="btn2" data-act="sfxtab" data-k="me" style="flex:none;width:100%;margin-top:10px">${ic("shield", 15)} Alle Melder ansehen und bearbeiten</button>`, "Gelesen werden Melder mit passender Geräteklasse. Schalte Arten aus, die du nicht brauchst.");
    else if (sec === "alarm") {
      const R = [[0, "Nur einmal"], [5, "5 Min."], [10, "10 Min."], [15, "15 Min."], [30, "30 Min."], [60, "60 Min."]];
      body = `${this._sfStufenCard(T)}${card("clock", "Erinnerung wiederholen", `<div class="gschips">${R.map(([v, t]) => chip("sfxrepv", v, t, C.repeat === v)).join("")}</div>`, "Solange der Alarm anhält, kommt in diesem Abstand eine Meldung.")}`;
    } else if (sec === "akt") {
      const actOpts = Object.keys(st).filter((e) => /^(light|switch|cover|input_boolean|script|scene)\./.test(e));
      const list = C.acts.map((x, i) => `<div class="sfact"><div class="vrow" style="margin:0"><span><b>${esc(this._wzName(x.ent))}</b><small class="mut" style="display:block">${esc(x.ent)}</small></span><button class="ibtn" data-act="sfxrm" data-i="${i}" aria-label="Entfernen">${ic("close", 16)}</button></div>
        <div class="sfhl">Bei</div><div class="gschips">${[["any", "Jedem Alarm"], ...Object.keys(NM).map((k) => [k, NM[k]])].map(([k, t]) => chip("sfxak", k, t, x.kind === k, `data-i="${i}"`)).join("")}</div>
        <div class="sfhl">Dann</div><div class="gschips">${this._sfxDo(x.ent).map(([k, t]) => chip("sfxad", k, t, x.do === k, `data-i="${i}"`)).join("")}</div>
        <div class="sfhl">Wann</div><div class="gschips">${[[1, "Sofort"], [2, "Stufe 2"], [3, "Stufe 3"], [4, "Stufe 4"]].map(([k, t]) => chip("sfxast", k, t, (x.st || 1) === k, `data-i="${i}"`)).join("")}</div></div>`).join("");
      body = card("energy", "Aktionen bei Alarm", `${list || `<div class="mut sm">Noch keine Aktion.</div>`}${C.acts.length < 12 ? `<div style="margin-top:10px">${this._sfSel(actOpts, "", "sfxadd", "", "+ Aktion hinzufügen", /licht|light|flur|ventil|sirene|rollo/i)}</div>` : ""}`, "Das Modul schaltet nur, was du hier auswählst, einmal pro Alarm. Gut sind Licht an, Rollläden öffnen (Fluchtweg), Lüftung aus, Wasserventil schließen oder eine Sirene per Skript.");
    } else if (sec === "batt") {
      body = card("energy", "Schwache Batterie", `${vr("Melden ab", "Einmal pro Woche, solange sie unter der Grenze liegt.", sw("sfxbat", "", C.bat.on, "Schwache Batterie melden"))}${C.bat.on ? `<div class="gschips">${[10, 15, 20, 30, 40].map((v) => chip("sfxbatv", v, v + " %", C.bat.pct === v)).join("")}</div>` : ""}`) + card("wave", "Nicht erreichbar", `${vr("Melden", "Wenn sich ein Melder so lange nicht meldet. Einmal pro Tag.", sw("sfxoff", "", C.off.on, "Erreichbarkeit"))}${C.off.on ? `<div class="gschips">${[[15, "15 Min."], [60, "1 Std."], [180, "3 Std."], [720, "12 Std."], [1440, "1 Tag"]].map(([k, t]) => chip("sfxoffm", k, t, C.off.min === k)).join("")}</div>` : ""}`);
    } else if (sec === "pruef") {
      body = card("clock", "Prüf-Erinnerung", `${vr("Regelmäßig an den Test erinnern", "Du drückst den Testknopf und tippst danach auf „Geprüft“.", sw("sfxtst", "", C.test.on, "Prüf-Erinnerung"))}${C.test.on ? `<div class="gschips">${[[1, "Monatlich"], [3, "Alle 3 Monate"], [6, "Alle 6 Monate"], [12, "Jährlich"]].map(([k, t]) => chip("sfxtstm", k, t, C.test.months === k)).join("")}</div>` : ""}`)
        + card("tools", "Erinnerung vor Ablauf der Lebensdauer", `<div class="gschips">${[[0, "Aus"], [7, "7 Tage"], [14, "14 Tage"], [30, "30 Tage"], [60, "60 Tage"]].map(([k, t]) => chip("sfxlead", k, t, C.lead === k)).join("")}</div>`)
        + card("pencil", "Kopf des Jahresprotokolls", [["name", "Name", "zum Beispiel Familie Müller"], ["addr", "Adresse", "Straße, Ort"], ["who", "Geprüft von", "Name"]].map(([k, t, p]) => `<div class="sffld"><label>${t}</label><input class="osel" data-f="sfxpr" data-k="${k}" value="${esc(C.proto[k])}" maxlength="60" placeholder="${p}"></div>`).join(""));
    } else if (sec === "meld") {
      const svc = [...new Set([...Object.keys(((H.services || {}).notify) || {}).filter((n) => !["send_message", "reload", "persistent_notification"].includes(n)).sort().map((n) => "notify." + n), ...C.notify.to])], q = C.quiet;
      body = card("bell", "Wann melden", [["alarm", "Alarm"], ["end", "Alarm beendet"], ["bat", "Batterie schwach"], ["off", "Nicht erreichbar"], ["test", "Prüfung fällig"], ["life", "Austausch fällig"], ["depart", "Abfahrt-Prüfung"]].map(([k, t]) => vr(t, "", sw("sfxn", k, C.notify[k], t))).join(""))
        + card("bell", "Senden an", `${svc.length ? `<div class="gschips">${svc.map((n) => chip("sfxns", esc(n), esc(n), C.notify.to.includes(n))).join("")}</div>` : `<div class="mut sm">Es wurde kein Benachrichtigungsdienst (notify.*) gefunden. Die Mobile App von Home Assistant legt einen an.</div>`}<button class="btn2" data-act="sfxtest" style="flex:none;width:100%;margin-top:10px" ${C.notify.to.length ? "" : "disabled"}>${ic("bell", 16)} Test senden</button>`)
        + card("clock", "Ruhezeit", `${vr("Ruhezeit", "Nur Alarme kommen durch, Hinweise warten", sw("sfxq", "", q.on, "Ruhezeit"))}${q.on ? `<div class="sfbtn"><div class="sffld" style="flex:1"><label>Von</label><span class="tin">${this._tIn(q.from, false, "Uhrzeit")}<input type="hidden" data-f="sfxqt" data-k="from" value="${q.from}"></span></div><div class="sffld" style="flex:1"><label>Bis</label><span class="tin">${this._tIn(q.to, false, "Uhrzeit")}<input type="hidden" data-f="sfxqt" data-k="to" value="${q.to}"></span></div></div>` : ""}`);
    } else if (sec === "abf") {
      const rows = this._sfDepRows(), dc = Object.keys(st).filter((e) => { const d = e.split(".")[0], dcl = (st[e].attributes || {}).device_class; return d === "cover" || d === "lock" || d === "switch" || d === "light" || d === "input_boolean" || (d === "binary_sensor" && ["window", "door", "garage_door", "opening"].includes(dcl)); }).filter((e) => !C.depart.ents.includes(e));
      let m1 = []; try { m1 = [...new Set(this._collect0().flatMap((r) => r.windows || []))].filter((e) => !C.depart.ents.includes(e)); } catch (_) { /* Modul 1 nicht bereit */ }
      const fr = C.depart.frost, wx = Object.keys(st).filter((e) => e.startsWith("weather.") || (e.startsWith("sensor.") && (st[e].attributes || {}).device_class === "temperature"));
      body = card("lock", "Abfahrt-Prüfung", `${vr("Beim Verlassen melden", "Wenn die letzte Person geht", sw("sfxdep", "", C.depart.on, "Abfahrt-Prüfung"))}${rows.map((x, i) => `<div class="sfap">${ic(x.ico, 16)}<span>${esc(x.name)}</span><button class="ibtn" data-act="sfxdrm" data-i="${i}" aria-label="Entfernen">${ic("close", 16)}</button></div>`).join("")}<div style="margin-top:8px">${this._sfSel(dc, "", "sfxdadd", "", "+ Fenster, Tür, Herd oder Garage", /fenster|window|tür|door|herd|haust|garage|bügel/i)}</div>${m1.length ? `<button class="btn2" data-act="sfxdm1" style="flex:none;width:100%;margin-top:8px">${m1.length} Fenster aus Modul 1 übernehmen</button>` : ""}`, "Du bekommst eine Meldung, wenn alle Personen weg sind und hier noch etwas offen ist. Kameras und Schlösser werden nur angezeigt, nie gesteuert.")
        + card("wave", "Frost-Hinweis", `${vr("Warnen, wenn es draußen kalt wird", "", sw("sfxfrost", "", fr.on, "Frost-Hinweis"))}${fr.on ? `<div class="sffld"><label>Außentemperatur</label>${this._sfSel(wx, fr.ent, "sfxfent", "", "– wählen –", /außen|outdoor|aussen|weather/i)}</div><div class="gschips">${[-5, 0, 2, 3, 5].map((v) => chip("sfxfbv", v, v + " °C", fr.below === v)).join("")}</div>` : ""}`);
    } else {
      const o = !this._sfNew();
      body = card("eye", "Aussehen", vr("Karten wie bisher", "An: Banner mit Schild, Melder-Karten mit Farbbalken, Ampel als Liste und die Wartung aus v0.5 statt Haus-Szene, Kennzahl-Kacheln und Jahresband", sw("sfxold", "", o, "Karten wie bisher")));
    }
    return `${nav}<div class="sfsb">${body}</div>`;
  }
  /* ---- Aktionen */
  _sfxM(a, b) {
    const k = b.dataset.k;
    if (a === "sfxdet" && this._sfNew()) { this._sfGo({ t: "det", id: k }); return true; }
    if (a === "sfxeditdet" && this._sfNew()) { if (k) this._sfGo({ t: "det", id: k }); return true; }
    if (a === "sfxback") { const V = this._sfV; this._sfV = (V && V.back) || null; this._render(); return true; }
    if (a === "sfxtab") { this._sfV = null; return false; }
    if (a === "sfxopen" && this._sfNew()) { this._sfV = null; this._sfT = "se"; try { localStorage.setItem("fh_sf_tab", "se"); } catch (_) { /* privater Modus */ } this._sfxLoad(true); this._render(); return true; }
    if (a === "sfxsecgo") { this._sfSec = k; this._sfV = null; this._sfT = "se"; try { localStorage.setItem("fh_sf_tab", "se"); } catch (_) { /* privater Modus */ } this._render(); return true; }
    if (a === "sfxsec") { this._sfSec = k; this._render(); return true; }
    if (a === "sfxrmdet") { this._sfV = null; return false; }
    if (a === "sfxpick") { const r = (this._sfPkReg || {})[b.dataset.pid]; if (r) this._sfGo({ t: "pick", ...r, back: this._sfV }); return true; }
    if (a === "sfxpicked") {
      const V = this._sfV; if (!V || V.t !== "pick") return true;
      const v = b.dataset.v || "", f = V.f, meta = V.meta || {}; this._sfV = V.back || null;
      if (f === "sfxadd") { if (v) this._sfxPatch((c) => { if (c.acts.length < 12) c.acts.push({ id: "a" + Date.now().toString(36), kind: "any", ent: v, do: this._sfxDo(v)[0][0] }); }); }
      else this._sfxChange({ dataset: { ...meta, f }, value: v });
      this._render(); return true;
    }
    if (a === "sfxinsty") { (this._sfInstY = this._sfInstY || {})[b.dataset.e] = Number(k); this._render(); return true; }
    if (a === "sfxmset") { this._sfxNewChange({ dataset: { f: "sfxmf", k, e: b.dataset.e }, value: b.dataset.v || "" }); return true; }
    if (a === "sfxplkset") { this._sfxNewChange({ dataset: { f: "sfxplk" }, value: b.dataset.v || "" }); return true; }
    if (a === "sfxrepv") { this._sfxPatch((c) => { c.repeat = Number(k); }); return true; }
    if (a === "sfxbatv") { this._sfxPatch((c) => { c.bat.pct = Number(k); }); return true; }
    if (a === "sfxfbv") { this._sfxPatch((c) => { c.depart.frost.below = Number(k); }); return true; }
    return false;
  }
