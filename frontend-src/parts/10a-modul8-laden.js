  _wbxToday(d) {
    const s = this._wbSnap(), i = s.info, T = (this._wbStD && this._wbStD.data) || null, td = ((n) => `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`)(new Date()), r = T && (T.days || []).find((x) => x.d === td);
    this._wbStatLoad();
    const kwh = r ? r.pv + r.grid : 0, pv = r ? r.pv : 0, share = kwh > 0 ? pv / kwh * 100 : 0, now = i.power != null ? i.power : 0, sur = s.want && s.want.surplus_w != null ? s.want.surplus_w : 0, ns = now > 0 ? Math.min(100, sur / now * 100) : 0;
    const tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    return `<div class="card ocard"><h2>${ic("clock", 18)}Heute</h2>
      <div class="lugrid">${tile("Geladen", num(kwh, 1) + " kWh", `${num(pv, 1)} kWh Sonne`)}${tile("Sonnenanteil", num(share, 0) + " %", "heute")}${tile("Kosten", num(r ? r.cost : 0, 2) + " €", "Netzstrom")}${tile("Jetzt", num(now / 1000, 1) + " kW", now > 0 ? num(ns, 0) + " % davon Sonne" : "keine Ladung")}</div>
      ${now > 0 ? `<div class="gsbar" style="margin-top:10px" role="img" aria-label="Anteil Sonne und Netz jetzt"><i style="width:${ns}%;background:#2dd4bf"></i><i style="width:${100 - ns}%;background:#f59e0b"></i></div><div class="gsleg" style="margin-top:6px"><span><i style="background:#2dd4bf"></i>Sonne</span><span><i style="background:#f59e0b"></i>Netz</span></div>` : ""}</div>`;
  }
  _wbxParts() {
    const sn = this._wbSnap(), c = sn.cfg, G = c.guard, N = c.notify, q = sn.quick && sn.quick.k, adm = this._admin(), sw = (lab, k, on, hint) => `<div class="vrow"><span>${lab}${hint ? `<small class="mut" style="display:block">${hint}</small>` : ""}</span><button class="sw ${on ? "on" : ""}" data-act="wbxsw" data-k="${k}" aria-pressed="${on}" aria-label="${lab}" ${adm ? "" : "disabled"}></button></div>`;
    const Q = [["h1", "1 Stunde voll"], ["goal", "Bis zum Ziel voll"], ["sun", "Heute nur Sonne"]], gi = sn.guard;
    const svc = [...new Set([...Object.keys((this._hass.services || {}).notify || {}).filter((n) => n !== "send_message").sort().map((n) => "notify." + n), ...N.to])];
    const min = sn.quick && sn.quick.until ? Math.max(1, Math.ceil((sn.quick.until * 1000 - Date.now()) / 6e4)) : 0;
    return {
      quick: `        <div class="mut sm" style="margin:0 0 6px">Einmalig, ohne den Modus oder die Planung zu ändern. Endet von selbst, beim Abstecken oder mit „Stopp“.</div>
        ${q ? `<div class="otr"><span class="oav" style="width:36px;height:36px;background:#2dd4bf">${ic("energy", 18)}</span><div class="opi"><b>Schnellstart läuft: ${esc(Q.find((x) => x[0] === q)[1])}</b><small>${q === "h1" ? `Noch ${min} Minuten.` : q === "goal" ? "Bis zum Ladelimit oder zum Abstecken." : "Bis Mitternacht, nur mit Überschuss."}</small></div><button class="btn2 dng" data-act="wbxq" data-k="" style="flex:none">Stopp</button></div>` : `<div class="gschips">${Q.map(([k, l]) => `<button class="gsch" data-act="wbxq" data-k="${k}" ${adm && c.enabled ? "" : "disabled"}>${l}</button>`).join("")}</div>${c.enabled ? "" : `<div class="mut sm" style="margin-top:6px">Schalte zuerst die Laderegelung ein.</div>`}`}`,
      guard: `        ${sw("Wallbox drosseln, wenn der Hausanschluss voll ist", "guard", G.on, "Schützt die Hauptsicherung, zum Beispiel wenn Herd, Backofen und Wallbox zusammen laufen.")}
        ${G.on ? `<div class="vrow"><span>Höchststrom am Hausanschluss<small class="mut" style="display:block">Pro Phase, Wert deiner Hauptsicherung oder niedriger.</small></span><div class="step" style="flex:none"><button data-act="wbxg" data-s="-1" aria-label="weniger" ${adm ? "" : "disabled"}>${ic("minus", 18)}</button><b>${G.maxA} A</b><button data-act="wbxg" data-s="1" aria-label="mehr" ${adm ? "" : "disabled"}>${ic("plus", 18)}</button></div></div>
        ${gi ? `<div class="gsbar" style="margin-top:8px" role="progressbar" aria-valuenow="${gi.total_a}" aria-valuemin="0" aria-valuemax="${G.maxA}"><i style="width:${Math.min(100, gi.house_a / G.maxA * 100)}%;background:#6366f1"></i><i style="width:${Math.min(100 - Math.min(100, gi.house_a / G.maxA * 100), gi.wb_a / G.maxA * 100)}%;background:#2dd4bf"></i></div><div class="gsleg" style="margin-top:6px"><span><i style="background:#6366f1"></i>Haus</span><span><i style="background:#2dd4bf"></i>Wallbox</span></div><div class="mut sm" style="margin-top:4px">Haus ${num(gi.house_a, 1)} A + Wallbox ${num(gi.wb_a, 1)} A = ${num(gi.total_a, 1)} A von ${G.maxA} A${gi.limited ? " · Die Wallbox wird gerade gedrosselt." : "."}</div>` : `<div class="mut sm" style="margin-top:8px">Für die Messung braucht Modul 3 (Energie) oder die Photovoltaik-Einstellung einen Zähler-Sensor.</div>`}
        <div class="mut sm" style="margin-top:4px">Der Hausstrom wird aus dem Netzbezug geschätzt (gleichmäßig auf drei Phasen). Die Wallbox wird zuerst gedrosselt, nie das Haus.</div>` : ""}`,
      notify: `        <div class="mut sm" style="margin:0 0 6px">Meldungen aufs Handy, zum Beispiel über die Home-Assistant-App.</div>
        ${sw("Ladung gestartet", "start", N.start)}${sw("Ziel-Ladestand erreicht", "goal", N.goal)}${sw("Ladeplan reicht nicht, Netzstrom nötig", "plan", N.plan)}${sw("Wallbox nicht erreichbar", "off", N.off)}${sw("Auto steckt lange ohne Ladung", "long", N.long, "Nach 12 Stunden, zum Beispiel wenn der Ladeplan nie startet.")}
        <div class="lsec" style="margin-top:8px">${ic("bell", 15)}Senden an</div>
        ${svc.length ? `<div class="gschips">${svc.map((n) => `<button class="gsch ${N.to.includes(n) ? "sel" : ""}" data-act="wbxn" data-k="${esc(n)}" aria-pressed="${N.to.includes(n)}" ${adm ? "" : "disabled"}>${esc(n.replace("notify.", ""))}${((this._hass.services || {}).notify || {})[n.slice(7)] === undefined ? " (nicht gefunden)" : ""}</button>`).join("")}</div>` : `<div class="mut sm">Keine Benachrichtigungsdienste gefunden. Installiere die Home-Assistant-App auf dem Handy, dann erscheint sie hier.</div>`}` };
  }
  _wbxQuickCard() { return `<div class="card ocard"><h2>${ic("energy", 18)}Schnellstart</h2>${this._wbxParts().quick}</div>`; }
  _wbSecS() {
    if (!this._wbSecO) { let v = {}; try { v = JSON.parse(localStorage.getItem("fh_wbsec") || "{}") || {}; } catch (e) { v = {}; } this._wbSecO = v && typeof v === "object" ? v : {}; }
    return this._wbSecO;
  }
  _wbSecSave() { try { localStorage.setItem("fh_wbsec", JSON.stringify(this._wbSecO || {})); } catch (e) { /* ohne Speicher */ } }
  _wbSec(key, ico, title, sum, body, warn) {
    const o = !!this._wbSecS()[key];
    return `<div class="card ocard wsec ${o ? "open" : ""}"><button data-act="wbsec" data-k="${key}" aria-expanded="${o}">${ic(ico, 20)}<span class="wst"><b>${title}${warn ? `<em class="wdot" title="Braucht Aufmerksamkeit">!</em>` : ""}</b><span>${sum}</span></span><span class="wch">${ic("chev", 18)}</span></button>${o ? `<div class="wbody">${body}</div>` : ""}</div>`;
  }
  /* Hinweise mit Sprung zur Lösung (Statusleiste und Satz-Zeile der neuen Optik) */
  _wbHints() {
    const s = this._wbSnap(), c = s.cfg, w = s.want || {}, who = s.who;
    const veh = who && who.kind === "vehicle" ? c.vehicles.find((x) => x.name === who.name) : null;
    const em = who ? (veh ? veh.mode : who.kind === "guest" ? c.guest.mode : c.mode) : c.mode;
    const N = [];
    if (!s.ok) N.push([`Keine Verbindung zur Wallbox${s.error ? " (" + esc(s.error) + ")" : ""}. Prüfe Strom und WLAN der Wallbox.`, "wb", "Verbindung prüfen"]);
    else if (c.enabled && s.hold > 0) N.push([`Du hast die Wallbox von Hand umgestellt. Die Regelung pausiert noch ${Math.ceil(s.hold / 60)} Min. und regelt dann wieder.`]);
    if (s.ok && c.enabled && !s.hold && w.state === "gesperrt") N.push(["Die Regelung wartet auf eine Karte. Lege die Karte an der Wallbox an.", "veh", "Karten ansehen"]);
    if (s.ok && c.enabled && !s.hold && w.state && w.state !== "gesperrt" && w.surplus_w == null && (em === "pv" || em === "minpv" || c.planOn)) N.push(["Es fehlt ein Netz-Sensor für den Überschuss (Einstellungen → Haus → Energiequellen). Ohne ihn wird nicht mit Sonne geladen."]);
    return N;
  }
  /* Statusleiste über allen Registern: Zustand, Modus, Fahrzeug, Leistung und Hinweise mit Sprung zur Lösung */
  _wbBar() {
    const s = this._wbSnap(), c = s.cfg, i = s.info, w = s.want || {}, who = s.who;
    const veh = who && who.kind === "vehicle" ? c.vehicles.find((x) => x.name === who.name) : null, MN = { off: "Aus", pv: "Sonne", minpv: "Sonne + Netz", now: "Voll" };
    const em = who ? (veh ? veh.mode : who.kind === "guest" ? c.guest.mode : c.mode) : c.mode;
    const st = !s.ok ? ["bad", "Nicht erreichbar"] : !c.enabled ? ["off", "Regelung aus"] : s.hold > 0 ? ["warn", "Pausiert"] : c.planOn ? ["ok", "Planung aktiv"] : ["ok", "Regelung aktiv"];
    const chip = (cls, t) => `<span class="wbchip ${cls}">${cls ? "<i></i>" : ""}${t}</span>`;
    const chips = chip(st[0], st[1]) + (s.ok && c.enabled && !c.planOn ? chip("", `Modus ${MN[em] || "–"}`) : "") + (s.ok && who ? chip("", `${ic("car", 13)} ${esc(who.name)}`) : "") + (s.ok && i.power > 0 ? chip("", `${ic("energy", 13)} ${wfmt(i.power)}`) : "") + (s.quick ? chip("warn", "Schnellstart") : "");
    const N = this._wbHints();
    return `<div class="wbbar">${chips}</div>${N.map((n) => `<div class="gst on" style="margin:0 0 10px">${ic("info", 15)}<span>${n[0]}${n[1] ? ` <button class="lnk" data-act="wbgo" data-k="${n[1]}">${n[2]}</button>` : ""}</span></div>`).join("")}`;
  }
  /* Einrichtungs-Check im Register Einstellungen */
  _wbCheck() {
    this._wbFcLoad(); this._tbLoad();
    const s = this._wbSnap(), c = s.cfg, i = s.info, w = s.want || {}, F = this._wbFcD && this._wbFcD.data, TB = this._tb(), cards = (i && i.cards) || [];
    const noCard = c.vehicles.filter((x) => !x.ids.length);
    const R = [
      [s.ok ? "ok" : "bad", "Wallbox verbunden", s.ok ? `${esc(this._wbName())} antwortet${i.ctrl === false ? ", aber ohne Schalter: nur Anzeige" : ""}.` : "Keine Antwort von der Wallbox.", "wb", "Prüfen"],
      [s.soc != null ? "ok" : "warn", "Ladestand-Sensor des Fahrzeugs", s.soc != null ? `Ladestand ${num(s.soc, 0)} %.` : "Ohne ihn gibt es keine Planung und kein Ladelimit.", null, null, "mdevset"],
      [!c.enabled || !w.state ? "opt" : w.surplus_w != null ? "ok" : "warn", "Netz-Sensor für den Überschuss", !c.enabled || !w.state ? "Wird geprüft, sobald die Regelung läuft." : w.surplus_w != null ? `Überschuss ${wfmt(w.surplus_w)}.` : "Fehlt unter Einstellungen → Haus → Energiequellen."],
      [c.vehicles.length ? "ok" : "warn", "Fahrzeug angelegt", c.vehicles.length ? c.vehicles.map((x) => esc(x.name)).join(", ") : "Lege ein Fahrzeug an, damit Modus und Limit pro Fahrzeug gelten.", "veh", "Anlegen"],
      this._wbHa(c) ? [c.defVeh ? "ok" : c.vehicles.length ? "warn" : "opt", "Fahrzeug an dieser Wallbox", c.defVeh ? `${esc((c.vehicles.find((x) => x.id === c.defVeh) || {}).name || "")} ist fest zugeordnet.` : c.vehicles.length ? "Die Wallbox meldet keine Karten. Wähle das Fahrzeug, das hier lädt." : "Zuerst ein Fahrzeug anlegen.", "veh", "Wählen"] : [!c.vehicles.length ? "opt" : !cards.length ? "warn" : noCard.length ? "warn" : "ok", "Karten zugeordnet", !c.vehicles.length ? "Zuerst ein Fahrzeug anlegen." : !cards.length ? "In der go-e-App sind noch keine RFID-Karten angelegt." : noCard.length ? `${noCard.map((x) => esc(x.name)).join(", ")} ${noCard.length === 1 ? "hat" : "haben"} noch keine Karte.` : "Jedes Fahrzeug hat mindestens eine Karte.", "veh", "Zuordnen"],
      [TB.connected ? "ok" : "opt", "Strompreis (optional)", TB.connected ? "Tibber ist verbunden." : "Für die Planung nach Preis: Tibber unter Einstellungen → Integrationen verbinden oder einen Preis-Sensor in Modul 1 wählen."],
      [F && F.fs && F.fs.found ? "ok" : "opt", "PV-Prognose (optional)", F && F.fs && F.fs.found ? (F.fs.m16 ? "Kommt aus Modul 16 (Solar-Prognose)." : "Forecast.Solar wurde erkannt.") : "Für die Planung nach Sonne: Modul 16 einschalten oder Forecast.Solar in Home Assistant einrichten."],
    ];
    const need = R.filter((r) => r[0] !== "opt"), done = need.filter((r) => r[0] === "ok").length, all = need.length && done === need.length;
    const ico = { ok: ["check", "#2dd4bf"], warn: ["info", "#f59e0b"], bad: ["info", "#f87171"], opt: ["minus", "#64748b"] };
    return `<div class="card ocard"><h2>${ic("check", 18)}Einrichtung<span class="mut sm" style="margin-left:auto;font-weight:500">${all ? "Alles bereit" : `${done} von ${need.length} erledigt`}</span></h2>
      <div class="gsbar" role="progressbar" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${need.length}"><i style="width:${need.length ? done / need.length * 100 : 0}%;background:${all ? "#2dd4bf" : "#f59e0b"}"></i></div>
      ${R.map((r) => `<div class="wck"><span class="wcki" style="color:${ico[r[0]][1]}">${ic(ico[r[0]][0], 16)}</span><span class="wckt"><b>${r[1]}</b><small class="mut">${r[2]}</small></span>${r[0] !== "ok" && r[3] && this._admin() ? `<button class="lnk" data-act="wbgo" data-k="${r[3]}">${r[4]}</button>` : ""}${r[0] !== "ok" && r[5] && this._admin() ? `<button class="lnk" data-act="${r[5]}">Einrichten</button>` : ""}</div>`).join("")}</div>`;
  }
  _wbxAct(a, b) {
    const c = this._wb(), k = b.dataset.k;
    if (a === "wbxq") { this._hass.callWS({ type: "fenster_heizung/wb_quick", kind: k || "" }).then((r) => { this._wbD = { snap: this._wbSaveT ? { ...r, cfg: this._wbSnap().cfg } : r, ts: Date.now() }; this._render(); }).catch(() => this._toast("Schnellstart konnte nicht gestartet werden")); return; }
    if (a === "wbxsw") { if (k === "guard") this._wbSave({ guard: { ...c.guard, on: !c.guard.on } }, true); else this._wbSave({ notify: { ...c.notify, [k]: !c.notify[k] } }, true); }
    else if (a === "wbxg") this._wbSave({ guard: { ...c.guard, maxA: Math.max(10, Math.min(63, c.guard.maxA + Number(b.dataset.s))) } });
    else if (a === "wbxn") this._wbSave({ notify: { ...c.notify, to: c.notify.to.includes(k) ? c.notify.to.filter((x) => x !== k) : [...c.notify.to, k] } }, true);
    else if (a === "wbcsv") return this._wbCsv();
    this._render();
  }
  _wbCsv() {
    const D = (this._wbStD && this._wbStD.data) || {}, days = D.days || [];
    if (!days.length) return this._toast("Noch keine Ladungen zum Exportieren");
    const f = (v, n) => String(Number(v || 0).toFixed(n)).replace(".", ","), rows = [["Datum", "Sonne kWh", "Netz kWh", "Gesamt kWh", "Kosten EUR", "Kosten ohne Sonne EUR", "Kilometer"]];
    days.forEach((r) => rows.push([r.d, f(r.pv, 2), f(r.grid, 2), f(r.pv + r.grid, 2), f(r.cost, 2), f(r.full, 2), f(r.km, 1)]));
    rows.push([]); rows.push(["Ladevorgänge"]); rows.push(["Start", "Dauer Minuten", "Fahrzeug", "kWh", "davon Sonne kWh", "Kosten EUR"]);
    (D.sessions || []).forEach((x) => rows.push([x.start, f(x.min, 0), x.veh, f(x.kwh, 2), f(x.pv, 2), f(x.cost, 2)]));
    const csv = "\ufeff" + rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\r\n");
    try { const u = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })), el = document.createElement("a"); el.href = u; el.download = "ladestatistik.csv"; document.body.appendChild(el); el.click(); el.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); this._toast("Ladestatistik exportiert"); }
    catch (e) { this._toast("Export nicht möglich"); }
  }
