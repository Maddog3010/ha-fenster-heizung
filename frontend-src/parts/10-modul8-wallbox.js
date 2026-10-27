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
  /* Statusleiste über allen Registern: Zustand, Modus, Fahrzeug, Leistung und Hinweise mit Sprung zur Lösung */
  _wbBar() {
    const s = this._wbSnap(), c = s.cfg, i = s.info, w = s.want || {}, who = s.who;
    const veh = who && who.kind === "vehicle" ? c.vehicles.find((x) => x.name === who.name) : null, MN = { off: "Aus", pv: "Sonne", minpv: "Sonne + Netz", now: "Voll" };
    const em = who ? (veh ? veh.mode : who.kind === "guest" ? c.guest.mode : c.mode) : c.mode;
    const st = !s.ok ? ["bad", "Nicht erreichbar"] : !c.enabled ? ["off", "Regelung aus"] : s.hold > 0 ? ["warn", "Pausiert"] : c.planOn ? ["ok", "Planung aktiv"] : ["ok", "Regelung aktiv"];
    const chip = (cls, t) => `<span class="wbchip ${cls}">${cls ? "<i></i>" : ""}${t}</span>`;
    const chips = chip(st[0], st[1]) + (s.ok && c.enabled && !c.planOn ? chip("", `Modus ${MN[em] || "–"}`) : "") + (s.ok && who ? chip("", `${ic("car", 13)} ${esc(who.name)}`) : "") + (s.ok && i.power > 0 ? chip("", `${ic("energy", 13)} ${wfmt(i.power)}`) : "") + (s.quick ? chip("warn", "Schnellstart") : "");
    const N = [];
    if (!s.ok) N.push([`Keine Verbindung zur Wallbox${s.error ? " (" + esc(s.error) + ")" : ""}. Prüfe Strom und WLAN der Wallbox.`, "wb", "Verbindung prüfen"]);
    else if (c.enabled && s.hold > 0) N.push([`Du hast die Wallbox von Hand umgestellt. Die Regelung pausiert noch ${Math.ceil(s.hold / 60)} Min. und regelt dann wieder.`]);
    if (s.ok && c.enabled && !s.hold && w.state === "gesperrt") N.push(["Die Regelung wartet auf eine Karte. Lege die Karte an der Wallbox an.", "veh", "Karten ansehen"]);
    if (s.ok && c.enabled && !s.hold && w.state && w.state !== "gesperrt" && w.surplus_w == null && (em === "pv" || em === "minpv" || c.planOn)) N.push(["Es fehlt ein Netz-Sensor für den Überschuss (Modul 3 oder Photovoltaik in Modul 1). Ohne ihn wird nicht mit Sonne geladen."]);
    return `<div class="wbbar">${chips}</div>${N.map((n) => `<div class="gst on" style="margin:0 0 10px">${ic("info", 15)}<span>${n[0]}${n[1] ? ` <button class="lnk" data-act="wbgo" data-k="${n[1]}">${n[2]}</button>` : ""}</span></div>`).join("")}`;
  }
  /* Einrichtungs-Check im Register Einstellungen */
  _wbCheck() {
    this._wbFcLoad(); this._tbLoad();
    const s = this._wbSnap(), c = s.cfg, i = s.info, w = s.want || {}, F = this._wbFcD && this._wbFcD.data, TB = this._tb(), cards = (i && i.cards) || [];
    const noCard = c.vehicles.filter((x) => !x.ids.length);
    const R = [
      [s.ok ? "ok" : "bad", "Wallbox verbunden", s.ok ? `${esc(i.name || "go-e Charger")} antwortet.` : "Keine Antwort von der Wallbox.", "wb", "Prüfen"],
      [s.soc != null ? "ok" : "warn", "Ladestand-Sensor des Fahrzeugs", s.soc != null ? `Ladestand ${num(s.soc, 0)} %.` : "Ohne ihn gibt es keine Planung und kein Ladelimit.", null, null, "mdevset"],
      [!c.enabled || !w.state ? "opt" : w.surplus_w != null ? "ok" : "warn", "Netz-Sensor für den Überschuss", !c.enabled || !w.state ? "Wird geprüft, sobald die Regelung läuft." : w.surplus_w != null ? `Überschuss ${wfmt(w.surplus_w)}.` : "Fehlt in Modul 3 und in der Photovoltaik-Einstellung von Modul 1."],
      [c.vehicles.length ? "ok" : "warn", "Fahrzeug angelegt", c.vehicles.length ? c.vehicles.map((x) => esc(x.name)).join(", ") : "Lege ein Fahrzeug an, damit Modus und Limit pro Fahrzeug gelten.", "veh", "Anlegen"],
      [!c.vehicles.length ? "opt" : !cards.length ? "warn" : noCard.length ? "warn" : "ok", "Karten zugeordnet", !c.vehicles.length ? "Zuerst ein Fahrzeug anlegen." : !cards.length ? "In der go-e-App sind noch keine RFID-Karten angelegt." : noCard.length ? `${noCard.map((x) => esc(x.name)).join(", ")} ${noCard.length === 1 ? "hat" : "haben"} noch keine Karte.` : "Jedes Fahrzeug hat mindestens eine Karte.", "veh", "Zuordnen"],
      [TB.connected ? "ok" : "opt", "Strompreis (optional)", TB.connected ? "Tibber ist verbunden." : "Für die Planung nach Preis: Tibber unter Einstellungen → Integrationen verbinden oder einen Preis-Sensor in Modul 1 wählen."],
      [F && F.fs && F.fs.found ? "ok" : "opt", "PV-Prognose (optional)", F && F.fs && F.fs.found ? "Forecast.Solar wurde erkannt." : "Für die Planung nach Sonne: die Integration Forecast.Solar in Home Assistant einrichten."],
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
  /* Abfahrtszeit pro Fahrzeug (in der Planung): eigenes Ziel, eigene Uhrzeit, eigene Tage */
  _wbDep(v) { const c = this._wb(), d = (v && v.dep) || {}; return { on: !!d.on, soc: d.soc || c.planSoc, time: d.time || c.planTime, days: d.days || c.planDays }; }
  _wbdAct(a, b) {
    const c = this._wb(), id = b.dataset.v, k = b.dataset.k;
    const upd = (fn) => this._wbSave({ vehicles: c.vehicles.map((x) => (x.id === id ? { ...x, dep: fn(this._wbDep(x)) } : x)) });
    if (a === "wbdsw") upd((d) => ({ ...d, on: !d.on }));
    else if (a === "wbdsoc") upd((d) => ({ ...d, soc: Math.max(20, Math.min(100, d.soc + Number(b.dataset.s))) }));
    else if (a === "wbddays") upd((d) => ({ ...d, days: k }));
    this._render();
  }
  /* Planung: Strompreis- und PV-Vorhersage, günstigste Ladefenster */
  _wbFcLoad(force) {
    if (!this._hass || this._wbFcBusy) return;
    if (!force && this._wbFcD && Date.now() - this._wbFcD.ts < 60000) return;
    this._wbFcBusy = true;
    this._hass.callWS({ type: "fenster_heizung/wb_forecast" }).then((r) => { this._wbFcD = { data: r || {}, ts: Date.now() }; }).catch(() => { this._wbFcD = { data: { error: true }, ts: Date.now() }; })
      .finally(() => { this._wbFcBusy = false; if (this._wbStT() === "plan" && this._wbVisible()) this._render(); });
  }
  _wbPlanCalc(hours, o) {
    const SL = o.sh || 1, now = new Date(), [hh, mm] = String(o.until || "07:00").split(":").map(Number), dl = new Date(now); dl.setHours(hh || 0, mm || 0, 0, 0); if (dl <= now) dl.setDate(dl.getDate() + 1);
    const P = o.pmax, need = Math.max(0, (o.target - o.soc) / 100 * o.cap), sun = o.strat === "sun", price = o.strat === "price", lv = o.rank === "level", LR = { VERY_CHEAP: 0, CHEAP: 1, NORMAL: 2, EXPENSIVE: 3, VERY_EXPENSIVE: 4 };
    const cand = hours.map((h, i) => ({ i, h, t: new Date(h.t) })).filter((c) => c.t.getTime() + SL * 36e5 > now.getTime() && c.t.getTime() + SL * 36e5 <= dl.getTime());
    const pw = (c) => sun ? Math.min(P, c.h.pv) : P, share = (c) => { const e = pw(c); return e > 0 ? Math.min(c.h.pv, e) / e : 0; }, rk = (c) => lv ? (LR[c.h.level || "NORMAL"] ?? 2) * 100 : 0;
    const pool = cand.filter((c) => !sun || c.h.pv >= o.minkw);
    pool.sort((a, b) => sun ? b.h.pv - a.h.pv : price ? rk(a) + a.h.price - (rk(b) + b.h.price) : rk(a) + a.h.price * (1 - share(a)) - (rk(b) + b.h.price * (1 - share(b))));
    const sel = {}; let left = need;
    for (const c of pool) { if (left <= 0.01) break; const e = Math.min(pw(c) * SL, left); if (e <= 0) continue; sel[c.i] = e; left -= e; }
    const calc = (m) => { let kwh = 0, pv = 0, cost = 0; Object.keys(m).forEach((i) => { const h = hours[i], e = m[i], kw = e / SL, s = kw > 0 ? Math.min(1, h.pv / kw) : 0; kwh += e; pv += e * s; cost += e * (1 - s) * h.price / 100; }); return { kwh, pv, cost }; };
    const imm = {}; let l2 = need; cand.forEach((c) => { if (l2 <= 0.01) return; const e = Math.min(P * SL, l2); imm[c.i] = e; l2 -= e; });
    return { sel, left: Math.max(0, left), need, dl, plan: calc(sel), imm: calc(imm), cand };
  }
  _wbPlan(d) {
    this._wbFcLoad(); this._tbLoad();
    const F = this._wbFcD && this._wbFcD.data, c = this._wbSnap().cfg, adm = this._admin();
    if (!F) return `<div class="card empty">${ic("sun", 30)}<div class="sm" style="margin-top:8px">Vorhersage wird geladen …</div></div>`;
    if (F.error || !(F.hours || []).length) return `<div class="card empty">${ic("sun", 30)}<div style="margin:8px 0 4px;font-weight:700;color:var(--primary-text-color)">Keine Vorhersage verfügbar</div><div class="sm" style="max-width:480px;margin:0 auto">Wähle in den Einstellungen von Modul 3 einen Preis-Sensor mit Stundenpreisen (zum Beispiel Tibber oder aWATTar) und eine PV-Prognose (zum Beispiel Forecast.Solar oder Solcast).</div></div>`;
    const who = this._wbSnap().who, veh = who && who.kind === "vehicle" ? c.vehicles.find((x) => x.name === who.name) : null, vd = veh ? this._wbDep(veh) : null, eff = vd && vd.on ? { soc: vd.soc, time: vd.time, days: vd.days, name: veh.name } : { soc: c.planSoc, time: c.planTime, days: c.planDays, name: "" };
    const P = { strat: c.planStrat || "mix" }, pad = (v) => String(v).padStart(2, "0"), hrs = F.hours, SL = (F.slot_min || 60) / 60, tm = (t) => pad(t.getHours()) + ":" + pad(t.getMinutes());
    const soc = d.soc != null ? d.soc : this._wbSnap().soc != null ? this._wbSnap().soc : 40, ph = c.ph === 1 ? 1 : 3, pmax = Math.round(c.maxA * 0.23 * ph * 10) / 10;
    const R = this._wbPlanCalc(hrs, { strat: P.strat, target: eff.soc, soc, cap: c.cap, until: eff.time, pmax, minkw: Math.max(1.4, c.startW / 1000), sh: SL, rank: this._tb().connected && c.planSrc !== "sensor" && this._tb().res === "lvl" ? "level" : "price" });
    const shown = hrs.map((h, i) => ({ h, i, t: new Date(h.t) })).filter((x) => x.t.getTime() + SL * 36e5 > Date.now()).slice(0, Math.round(30 / SL)), n = shown.length;
    const W = 640, Hh = 240, pl = 36, pr = 40, pb = 24, pt = 8, bw = (W - pl - pr) / n, bar = Math.min(bw * (SL < 1 ? 0.8 : 0.7), 18);
    const mxP = Math.max(pmax, ...shown.map((x) => x.h.pv)), stepP = enStep(mxP), topP = Math.ceil(mxP / stepP) * stepP, mxC = Math.max(...shown.map((x) => x.h.price), 1), topC = Math.ceil(mxC / 10) * 10, minC = Math.min(0, ...shown.map((x) => x.h.price));
    const yP = (v) => Hh - pb - (v / topP) * (Hh - pb - pt), yC = (v) => Hh - pb - ((v - minC) / (topC - minC)) * (Hh - pb - pt);
    let g = "", bars = "", line = "", pts = [];
    for (let v = 0; v <= topP + 1e-9; v += stepP) { const y = yP(v); g += `<line x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${pl - 6}" y="${y + 4}" text-anchor="end" font-size="11" fill="#2dd4bf">${num(v, 0)}</text>`; }
    for (let v = 0; v <= topC; v += topC / 4) g += `<text x="${W - pr + 6}" y="${yC(v) + 4}" font-size="11" fill="#f59e0b">${num(v, 0)}</text>`;
    shown.forEach((x, k) => { const xx = pl + k * bw, cx = xx + bw / 2, on = R.sel[x.i] != null, beyond = x.t.getTime() + SL * 36e5 > R.dl.getTime();
      if (on) bars += `<rect x="${xx + 1}" y="${pt}" width="${bw - 2}" height="${Hh - pb - pt}" rx="4" fill="#2dd4bf" opacity=".16" stroke="#2dd4bf" stroke-opacity=".5"/>`;
      bars += `<rect x="${cx - bar / 2}" y="${yP(x.h.pv)}" width="${bar}" height="${Math.max(0, Hh - pb - yP(x.h.pv))}" rx="2" fill="#2dd4bf" opacity="${beyond ? .3 : .9}"><title>${tm(x.t)} · PV ${num(x.h.pv, 1)} kW · ${num(x.h.price, 1)} ct/kWh${on ? " · Ladung " + num(R.sel[x.i], 1) + " kWh" : ""}</title></rect>`;
      pts.push(`${cx},${yC(x.h.price)}`); if ((x.t.getMinutes() === 0 && x.t.getHours() % 3 === 0) || k === 0) bars += `<text x="${cx}" y="${Hh - 7}" text-anchor="middle" font-size="11" fill="var(--mut)">${pad(x.t.getHours())}${x.t.getHours() === 0 ? "" : ""}</text>`;
      if (x.t.getHours() === 0 && x.t.getMinutes() === 0 && k > 0) bars += `<line x1="${xx}" x2="${xx}" y1="${pt}" y2="${Hh - pb}" stroke="var(--line)"/>`; });
    const dlk = shown.findIndex((x) => x.t.getTime() + SL * 36e5 > R.dl.getTime()); if (dlk > 0) bars += `<line x1="${pl + dlk * bw}" x2="${pl + dlk * bw}" y1="${pt}" y2="${Hh - pb}" stroke="#f87171" stroke-dasharray="4 3"/><text x="${pl + dlk * bw - 4}" y="${pt + 10}" text-anchor="end" font-size="11" fill="#f87171">Bis ${esc(eff.time)}</text>`;
    line = `<polyline points="${pts.join(" ")}" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linejoin="round"/>`;
    const win = []; Object.keys(R.sel).map(Number).sort((a, b) => a - b).forEach((i) => { const l = win[win.length - 1]; if (l && l.end === i) { l.end = i + 1; l.kwh += R.sel[i]; l.idx.push(i); } else win.push({ start: i, end: i + 1, kwh: R.sel[i], idx: [i] }); });
    const hm = (i) => tm(new Date(hrs[i].t)), hend = (i) => tm(new Date(new Date(hrs[i].t).getTime() + SL * 36e5)), wsum = (w) => { let pv = 0, co = 0; w.idx.forEach((i) => { const h = hrs[i], e = R.sel[i], s = Math.min(1, h.pv / Math.max(e / SL, 0.0001)); pv += e * s; co += e * (1 - s) * h.price / 100; }); return { s: w.kwh > 0 ? pv / w.kwh * 100 : 0, c: co }; };
    const chip = (k, t) => `<button class="gsch ${P.strat === k ? "sel" : ""}" data-act="wbplan" data-k="${k}" aria-pressed="${P.strat === k}">${t}</button>`;
    const tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    const sh = R.plan.kwh > 0 ? R.plan.pv / R.plan.kwh * 100 : 0, sav = Math.max(0, R.imm.cost - R.plan.cost), STR = { mix: "Sonne zuerst, dann günstig: wählt die Stunden mit den niedrigsten effektiven Kosten aus PV-Anteil und Preis.", sun: "Nur Sonne: lädt nur in Stunden mit genug PV-Überschuss. Reicht das nicht, fehlt am Ende Energie.", price: "Günstigster Preis: wählt die Stunden mit dem niedrigsten Strompreis, egal ob die Sonne scheint." };
    const FS = F.fs || {}, pvs = c.pvSrc === "sensor" ? "sensor" : "forecast", pvChip = (k, t) => `<button class="gsch ${pvs === k ? "sel" : ""}" data-act="wbpv" data-k="${k}" aria-pressed="${pvs === k}" ${adm ? "" : "disabled"}>${t}</button>`;
    const TB = this._tb(), tbOn = !!TB.connected, src = c.planSrc === "sensor" || !tbOn ? "sensor" : "tibber", srcChip = (k, t) => `<button class="gsch ${src === k ? "sel" : ""}" data-act="wbsrc" data-k="${k}" aria-pressed="${src === k}" ${adm && (k === "sensor" || tbOn) ? "" : "disabled"}>${t}</button>`;
    return `<div class="card"><h2>${ic("sun", 18)}Ladeplanung nach Preis und Sonne</h2>
      <div class="vrow"><span>Planung aktiv<small class="mut" style="display:block">${c.planOn ? "Echte Steuerung: Die Wallbox lädt nur in den geplanten Fenstern und wird dazwischen pausiert." : "Aus: Der Plan wird nur angezeigt, die Wallbox lädt nicht danach."}</small></span><button class="sw ${c.planOn ? "on" : ""}" data-act="wbsw" data-k="planOn" aria-pressed="${!!c.planOn}" aria-label="Planung aktiv" ${adm ? "" : "disabled"}></button></div>
      ${c.planOn ? (() => { const nowI = hrs.findIndex((h) => { const t = new Date(h.t); return t <= new Date() && t.getTime() + SL * 36e5 > Date.now(); }), run = nowI >= 0 && R.sel[nowI] != null, nxt = Object.keys(R.sel).map(Number).filter((i) => i > nowI).sort((a, b) => a - b)[0], fin = R.need <= 0.05;
        return `<div class="otr"><span class="oav" style="width:36px;height:36px;background:${run ? "#2dd4bf" : "#64748b"}">${ic(run ? "energy" : "clock", 18)}</span><div class="opi"><b>${fin ? "Ziel erreicht, es wird nicht geladen" : run ? "Lädt jetzt nach Plan" : nxt != null ? "Wartet auf das nächste Ladefenster" : "Kein Ladefenster geplant"}</b><small>${fin ? "Der Ladestand liegt schon über dem Ziel." : run ? `Bis ${hend(nowI)} Uhr, ${num(R.sel[nowI], 1)} kWh geplant.` : nxt != null ? `Nächster Start um ${hm(nxt)} Uhr.` : "Das Ziel wird mit dem Ladeplan erreicht."}</small></div></div>`; })() : ""}
      ${c.planOn && !c.enabled ? `<div class="gst on">${ic("info", 15)}Die Laderegelung ist aus. Schalte sie im Register „Laden“ ein, sonst wird nichts nach Plan geladen.</div>` : ""}
      <div class="mut sm" style="margin:6px 0 8px">Ziel: <b>${eff.soc} %</b> bis <b>${esc(eff.time)} Uhr</b>${soc != null ? ` · jetzt ${num(soc, 0)} %` : ""} · Ladeleistung bis ${num(pmax, 1)} kW. ${eff.name ? `Abfahrt von <b>${esc(eff.name)}</b>, siehe unten.` : "Ziel und Uhrzeit stellst du unten unter „Standard-Abfahrt“ ein, pro Fahrzeug unten."}</div>
      ${(() => { const wd = R.dl.getDay(), bad = (eff.days === "wk" && (wd === 0 || wd === 6)) || (eff.days === "we" && wd > 0 && wd < 6); return bad ? `<div class="gst on" style="margin:0 0 10px">${ic("info", 15)}<span>Das Ziel liegt auf ${["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"][wd]}, dafür gilt keine Abfahrt (${eff.days === "wk" ? "Mo–Fr" : "Wochenende"}). Es wird nicht nach Plan geladen, es gilt der normale Modus.</span></div>` : ""; })()}
      <div class="gschips">${chip("mix", "Sonne zuerst, dann günstig")}${chip("sun", "Nur Sonne")}${chip("price", "Günstigster Preis")}</div>
      <div class="mut sm" style="margin:2px 0 10px">${STR[P.strat]}</div>
      ${R.left > 0.05 ? `<div class="gst on">${ic("info", 15)}Bis ${esc(eff.time)} Uhr fehlen voraussichtlich ${num(R.left, 1)} kWh. Dann lädt der Ladeplan zum Schluss mit Netzstrom nach.</div>` : ""}
      <div class="wbsc"><svg viewBox="0 0 ${W} ${Hh}" width="100%" role="img" aria-label="PV-Prognose in kW und Strompreis in ct/kWh für die nächsten Stunden">${g}${bars}${line}</svg></div>
      <div class="gsleg" style="margin-top:6px"><span><i style="background:#2dd4bf"></i>PV-Überschuss (kW)</span><span><i style="background:#f59e0b"></i>Strompreis (ct/kWh)</span><span><i style="background:#2dd4bf;opacity:.35;outline:1px solid #2dd4bf"></i>Geplante Ladung</span></div>
      <div class="lugrid" style="margin-top:12px">${tile("Geplant", num(R.plan.kwh, 1) + " kWh", `von ${num(R.need, 1)} kWh benötigt`)}${tile("Sonnenanteil", num(sh, 0) + " %", "erwartet")}${tile("Kosten", num(R.plan.cost, 2) + " €", "erwarteter Netzstrom")}${tile("Ersparnis", num(sav, 2) + " €", "gegenüber sofort laden")}</div></div>
      ${this._wbCard(d, "dep")}
      <div class="card"><h2>${ic("car", 18)}Abfahrtszeit pro Fahrzeug</h2>
        <div class="mut sm" style="margin:0 0 8px">Jedes Fahrzeug kann sein eigenes Ziel und seine eigene Uhrzeit haben. Es gilt das Fahrzeug, das an der Karte erkannt wird. Ohne eigene Abfahrt, bei Gästen und ohne erkannte Karte gilt die Standard-Abfahrt (<b>${c.planSoc} %</b> bis <b>${esc(c.planTime)} Uhr</b>).</div>
        ${c.vehicles.length ? c.vehicles.map((x) => { const dd = this._wbDep(x), act = veh && veh.id === x.id; return `<div class="rfv"><div class="oper" style="padding:0"><span class="oav" style="background:#2dd4bf">${ic("car", 20)}</span><div class="opi"><b>${esc(x.name)}</b><small>${dd.on ? `${dd.soc} % bis ${esc(dd.time)} Uhr · ${({ all: "täglich", wk: "Mo–Fr", we: "Wochenende" })[dd.days]}` : "Nutzt den Ladeplan"}</small></div>${act ? `<span class="ost home">Aktiv</span>` : ""}<button class="sw ${dd.on ? "on" : ""}" data-act="wbdsw" data-v="${x.id}" aria-pressed="${dd.on}" aria-label="Eigene Abfahrt für ${esc(x.name)}" ${adm ? "" : "disabled"}></button></div>
          ${dd.on ? `<div class="vrow"><span>Ziel-Ladestand</span><div class="step" style="flex:none"><button data-act="wbdsoc" data-v="${x.id}" data-s="-5" aria-label="weniger" ${adm ? "" : "disabled"}>${ic("minus", 18)}</button><b>${dd.soc} %</b><button data-act="wbdsoc" data-v="${x.id}" data-s="5" aria-label="mehr" ${adm ? "" : "disabled"}>${ic("plus", 18)}</button></div></div>
          <div class="vrow"><span>Abfahrt</span><input class="osel" type="time" data-f="wbdt" data-v="${x.id}" value="${esc(dd.time)}" style="width:auto;margin:0" aria-label="Abfahrtszeit ${esc(x.name)}" ${adm ? "" : "disabled"}></div>
          <div class="gschips">${[["all", "Täglich"], ["wk", "Mo–Fr"], ["we", "Wochenende"]].map(([k, t]) => `<button class="gsch ${dd.days === k ? "sel" : ""}" data-act="wbddays" data-v="${x.id}" data-k="${k}" aria-pressed="${dd.days === k}" ${adm ? "" : "disabled"}>${t}</button>`).join("")}</div>` : ""}</div>`; }).join("") : `<div class="mut sm">Lege unter „Laden“ → Fahrzeuge &amp; Karten ein Fahrzeug an, dann kannst du hier seine Abfahrtszeit einstellen.</div>`}</div>
      <div class="card"><h2>${ic("clock", 18)}Geplante Ladefenster</h2>${win.length ? `<div class="wbses">${win.map((w) => { const x = wsum(w), d0 = new Date(hrs[w.start].t), tom = d0.toDateString() !== new Date().toDateString(); return `<div class="wbse"><div><b>${hm(w.start)} – ${hend(w.end - 1)}</b><span class="mut sm">${tom ? "morgen" : "heute"} · ${SL < 1 ? num((w.end - w.start) * SL * 60, 0) + " Min." : (w.end - w.start) + " " + (w.end - w.start === 1 ? "Stunde" : "Stunden")}</span></div><div class="wbsb"><i style="width:${x.s}%"></i></div><div class="wbsv"><b>${num(w.kwh, 1)} kWh</b><span class="mut sm">${num(x.s, 0)} % Sonne · ${num(x.c, 2)} €</span></div></div>`; }).join("")}</div>` : `<div class="mut sm">Es ist keine Ladung nötig, das Ziel ist schon erreicht.</div>`}
      <div class="mut sm" style="margin:10px 0 0">Quellen: Preis ${src === "tibber" ? "Tibber" + (TB.home ? " · " + esc(TB.home) : "") : esc(F.price_src || "–")} · PV-Prognose ${pvs === "forecast" ? "Forecast.Solar" : esc(F.pv_src || "–")}. Die Vorhersage ändert sich im Laufe des Tages, der Plan wird alle paar Minuten neu berechnet.</div></div>
      <div class="card"><h2>${ic("tools", 18)}Quellen der Vorhersage</h2>
        <div class="lsec">${ic("energy", 15)}Strompreis</div><div class="gschips">${srcChip("tibber", "Tibber")}${srcChip("sensor", "Preis-Sensor (Modul 1)")}</div>
        ${tbOn ? `<div class="mut sm" style="margin:0 0 10px">Tibber · ${esc(TB.home || "Zuhause")} · ${({ h: "Stundenmittel", q: "Viertelstunden", lvl: "Preisstufen" })[TB.res || "h"]}. Die Auflösung stellst du unter Einstellungen → Integrationen → Tibber ein.</div>` : `<div class="mut sm" style="margin:0 0 10px">Tibber ist nicht verbunden. Du richtest es unter Einstellungen → Integrationen ein.</div>`}
        <div class="lsec">${ic("sun", 15)}PV-Prognose</div><div class="gschips">${pvChip("forecast", "Forecast.Solar")}${pvChip("sensor", "Eigener Sensor")}</div>
        ${pvs === "forecast" ? (FS.found ? `<div class="otr"><span class="oav" style="width:36px;height:36px;background:#f59e0b">${ic("sun", 18)}</span><div class="opi"><b>Forecast.Solar erkannt</b><small>${(FS.sites || []).map((x) => esc(x.name) + " " + num(x.kwp, 1) + " kWp").join(" · ")} · heute ${num(FS.today, 1)} kWh · morgen ${num(FS.tomorrow, 1)} kWh</small></div></div>` : `<div class="gst on">${ic("info", 15)}Forecast.Solar wurde in Home Assistant nicht gefunden. Richte es unter Einstellungen → Geräte &amp; Dienste → Integration hinzufügen ein. Mehrere Dachflächen werden addiert.</div>`) : `<div class="mut sm" style="margin:0 0 6px">Der eigene Prognose-Sensor wird in den Einstellungen von Modul 3 gewählt.</div>`}
        <div class="vrow"><span>Grundverbrauch des Hauses<small class="mut" style="display:block">Wird von der Prognose abgezogen: Überschuss = Erzeugung minus Hausverbrauch.</small></span><div class="step" style="flex:none"><button data-act="wbstep" data-k="baseW" data-s="-100" aria-label="weniger" ${adm ? "" : "disabled"}>${ic("minus", 18)}</button><b>${num(c.baseW / 1000, 1)} kW</b><button data-act="wbstep" data-k="baseW" data-s="100" aria-label="mehr" ${adm ? "" : "disabled"}>${ic("plus", 18)}</button></div></div>
        <div class="mut sm">Forecast.Solar liefert die Werte in Home Assistant, ein Abruf pro Stunde genügt. Die kostenlose Stufe hat ein Limit von 12 Abrufen pro Stunde, das reicht für diese Planung.</div></div>`;
  }
  /* Ladestatistik: Balkendiagramm pro Tag, Anteil Sonne/Netz, Kosten */
  _wbStT() { return this._wbTab === "stat" ? "stat" : this._wbTab === "plan" ? "plan" : this._wbTab === "set" ? "set" : "laden"; }
  _wbTabs() {
    const t = this._wbStT(), b = (k, l, i) => `<button class="${t === k ? "sel" : ""}" data-act="wbtab" data-k="${k}" aria-pressed="${t === k}">${ic(i, 16)}${l}</button>`;
    return `<div class="wbtabs" role="tablist">${b("laden", "Laden", "energy")}${b("plan", "Planung", "sun")}${b("stat", "Ladestatistik", "chart")}${b("set", "Einstellungen", "sliders")}</div>`;
  }
  _wbStatLoad(force) {
    if (!this._hass || this._wbStBusy) return;
    if (!force && this._wbStD && Date.now() - this._wbStD.ts < 30000) return;
    this._wbStBusy = true;
    this._hass.callWS({ type: "fenster_heizung/wb_stats" }).then((r) => { this._wbStD = { data: r || {}, ts: Date.now() }; }).catch(() => { this._wbStD = { data: { error: true }, ts: Date.now() }; })
      .finally(() => { this._wbStBusy = false; if (this._wbStT() === "stat" && this._wbVisible()) this._render(); });
  }
  _wbStS() { const n = new Date(); return this._wbStV || (this._wbStV = { per: "m", y: n.getFullYear(), m: n.getMonth(), what: "e", by: "src" }); }
  _wbStat() {
    this._wbStatLoad();
    const S = this._wbStS(), D = (this._wbStD && this._wbStD.data) || null;
    if (!D) return `<div class="card empty">${ic("chart", 30)}<div class="sm" style="margin-top:8px">Ladestatistik wird geladen …</div></div>`;
    if (D.error) return `<div class="card empty">${ic("chart", 30)}<div class="sm" style="margin-top:8px">Die Ladestatistik konnte nicht geladen werden.</div></div>`;
    const days = D.days || [], pad = (v) => String(v).padStart(2, "0"), MON = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    const kosten = S.what === "k", byV = S.by === "veh";
    let slots = [], lab = (s) => s.l;
    if (S.per === "m") { const n = new Date(S.y, S.m + 1, 0).getDate(); for (let i = 1; i <= n; i++) slots.push({ k: `${S.y}-${pad(S.m + 1)}-${pad(i)}`, l: String(i) }); }
    else if (S.per === "y") for (let i = 0; i < 12; i++) slots.push({ k: `${S.y}-${pad(i + 1)}`, l: MON[i].slice(0, 3) });
    else { const ys = [...new Set(days.map((r) => r.d.slice(0, 4)))].sort(); (ys.length ? ys : [String(S.y)]).forEach((y) => slots.push({ k: y, l: y })); }
    const klen = S.per === "m" ? 10 : S.per === "y" ? 7 : 4, ix = Object.fromEntries(slots.map((s, i) => [s.k, i]));
    const vehs = []; days.forEach((r) => Object.keys(r.veh || {}).forEach((n) => { if (!vehs.includes(n)) vehs.push(n); }));
    const PAL = ["#2dd4bf", "#f59e0b", "#a78bfa", "#60a5fa", "#f472b6", "#a3e635"], SRC = ["#2dd4bf", "#f59e0b"];
    const series = byV ? vehs.map((n, i) => ({ id: n, name: n, col: PAL[i % PAL.length] })) : kosten ? [{ id: "grid", name: "Netzkosten", col: "#f59e0b" }] : [{ id: "pv", name: "Sonne", col: SRC[0] }, { id: "grid", name: "Netz", col: SRC[1] }];
    slots.forEach((s) => { s.v = series.map(() => 0); });
    let tot = { kwh: 0, pv: 0, grid: 0, cost: 0, full: 0, km: 0 };
    days.forEach((r) => { const i = ix[r.d.slice(0, klen)]; if (i == null) return; tot.pv += r.pv; tot.grid += r.grid; tot.cost += r.cost; tot.full += r.full || 0; tot.km += r.km || 0; tot.kwh += r.pv + r.grid;
      series.forEach((se, j) => { slots[i].v[j] += byV ? ((r.veh || {})[se.id] ? (kosten ? r.veh[se.id].cost : r.veh[se.id].kwh) : 0) : se.id === "pv" ? r.pv : kosten ? r.cost : r.grid; }); });
    const mx = Math.max(...slots.map((s) => s.v.reduce((a, b) => a + b, 0)), 0.1), step = enStep(mx), top = Math.ceil(mx / step) * step, W = 640, Hh = 210, pl = 34, pb = 22, n = slots.length, bw = (W - pl) / n, bar = Math.min(bw * 0.66, 30);
    const unit = kosten ? "€" : "kWh"; let grid = "", bars = "";
    for (let v = 0; v <= top + 1e-9; v += step) { const y = Hh - pb - (v / top) * (Hh - pb - 8); grid += `<line x1="${pl}" x2="${W}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${pl - 6}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--mut)">${num(v, step < 1 ? 1 : 0)}</text>`; }
    slots.forEach((s, i) => { let y = Hh - pb; const x = pl + i * bw + (bw - bar) / 2; s.v.forEach((v, j) => { const h = (v / top) * (Hh - pb - 8); if (h > 0.4) { y -= h; bars += `<rect x="${x}" y="${y}" width="${bar}" height="${h}" fill="${series[j].col}" rx="2"><title>${esc(series[j].name)} ${num(v, 2)} ${unit}</title></rect>`; } });
      if (n <= 14 || i % 2 === 0 || S.per === "m" && (i + 1) % 5 === 0 || i === n - 1) bars += `<text x="${x + bar / 2}" y="${Hh - 6}" text-anchor="middle" font-size="11" fill="var(--mut)">${esc(lab(s))}</text>`; });
    const share = tot.kwh > 0 ? tot.pv / tot.kwh * 100 : 0, ppk = tot.kwh > 0 ? tot.cost / tot.kwh : 0, fullGrid = tot.full > 0 ? tot.full : null, saved = fullGrid != null ? Math.max(0, fullGrid - tot.cost) : null;
    const chip = (act, k, t, on) => `<button class="gsch ${on ? "sel" : ""}" data-act="${act}" data-k="${k}" aria-pressed="${on}">${t}</button>`;
    const title = S.per === "m" ? `${MON[S.m]} ${S.y}` : S.per === "y" ? String(S.y) : "Gesamt";
    const nav = S.per === "all" ? "" : `<div class="wbnav"><button data-act="wbnav" data-k="-1" aria-label="Zurück">‹</button><b>${title}</b><button data-act="wbnav" data-k="1" aria-label="Weiter">›</button></div>`;
    const tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    const ses = (D.sessions || []).filter((r) => S.per === "all" ? true : S.per === "y" ? r.start.slice(0, 4) === String(S.y) : r.start.slice(0, 7) === `${S.y}-${pad(S.m + 1)}`).slice(0, 8);
    const fd = (iso) => { const t = new Date(iso); return t.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }) + " " + t.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }); };
    return `<div class="card"><h2>${ic("chart", 18)}Ladestatistik</h2>
      <div class="wbsh"><div class="gschips">${[["m", "Monat"], ["y", "Jahr"], ["all", "Gesamt"]].map(([k, t]) => chip("wbsper", k, t, S.per === k)).join("")}</div>${nav}</div>
      <div class="wbsh"><div class="gschips">${chip("wbswhat", "e", "Energie", !kosten)}${chip("wbswhat", "k", "Kosten", kosten)}</div><div class="gschips">${chip("wbsby", "src", "Sonne / Netz", !byV)}${vehs.length ? chip("wbsby", "veh", "Fahrzeug", byV) : ""}</div></div>
      <div class="wbst"><b>${kosten ? "Ladekosten" : "Geladene Energie"}</b> <span class="mut">${kosten ? num(tot.cost, 2) + " € gesamt" : num(tot.kwh, 1) + " kWh gesamt"} · ${num(share, 0)} % Sonne</span></div>
      <div class="wbsc"><svg viewBox="0 0 ${W} ${Hh}" width="100%" role="img" aria-label="${kosten ? "Ladekosten in Euro" : "Geladene Energie in kWh"} pro ${S.per === "m" ? "Tag" : S.per === "y" ? "Monat" : "Jahr"}">${grid}${bars}</svg></div>
      <div class="gsleg" style="margin-top:6px">${series.map((se) => `<span><i style="background:${se.col}"></i>${esc(se.name)} <b>${byV ? "" : num(se.id === "pv" ? tot.pv : kosten ? tot.cost : tot.grid, kosten ? 2 : 1) + " " + unit}</b></span>`).join("")}<span class="mut">${unit} pro ${S.per === "m" ? "Tag" : S.per === "y" ? "Monat" : "Jahr"}</span></div>
      <div class="lugrid" style="margin-top:12px">${tile("Geladen", num(tot.kwh, 1) + " kWh", `${num(tot.pv, 1)} kWh Sonne · ${num(tot.grid, 1)} kWh Netz`)}${tile("Sonnenanteil", num(share, 0) + " %", "der geladenen Energie")}${tile("Kosten", num(tot.cost, 2) + " €", "nur Netzstrom")}${tile("Ø Preis", tot.kwh > 0 ? num(ppk * 100, 1) + " ct/kWh" : "–", fullGrid != null ? `Ersparnis ${num(saved, 2)} € durch Sonne` : "Preis aus Modul 1")}${tile("Ø Verbrauch", tot.km > 0 ? num(tot.kwh / tot.km * 100, 1) + " kWh/100 km" : "–", tot.km > 0 ? `${num(tot.km, 0)} km laut Kilometerstand` : "braucht den Kilometerstand-Sensor")}${tile("CO₂ gespart", num(tot.pv * 0.38, 0) + " kg", "Sonne statt Netz-Mix (0,38 kg/kWh)")}</div>
      <div class="foot2" style="margin-top:10px"><button class="btn2" data-act="wbcsv">${ic("check", 16)} Als CSV exportieren</button></div>
      <div class="mut sm" style="margin:10px 0 0">Sonne = Überschuss und Hausbatterie, Netz = Bezug vom Netzanschluss. Die Aufteilung wird alle 10 Sekunden aus Ladeleistung und Netzbezug berechnet. Kosten = Netzstrom × Preis zum Zeitpunkt des Ladens.</div></div>
      <div class="card"><h2>${ic("clock", 18)}Letzte Ladevorgänge</h2>${ses.length ? `<div class="wbses">${ses.map((r) => `<div class="wbse"><div><b>${esc(r.veh || "Unbekannt")}</b><span class="mut sm">${fd(r.start)} · ${num(r.min / 60, 1)} h</span></div><div class="wbsb"><i style="width:${r.kwh > 0 ? r.pv / r.kwh * 100 : 0}%"></i></div><div class="wbsv"><b>${num(r.kwh, 1)} kWh</b><span class="mut sm">${num(r.kwh > 0 ? r.pv / r.kwh * 100 : 0, 0)} % Sonne · ${num(r.cost, 2)} €</span></div></div>`).join("")}</div>` : `<div class="mut sm">In diesem Zeitraum gab es keine Ladevorgänge.</div>`}</div>`;
  }
  _wbStAct(a, b) {
    const S = this._wbStS(), k = b.dataset.k;
    if (a === "wbtab") this._wbTab = k;
    else if (a === "wbsec") { this._wbSecO = { ...this._wbSecS(), [k]: !this._wbSecS()[k] }; this._wbSecSave(); }
    else if (a === "wbsecall") { this._wbSecO = Object.fromEntries(["wb", "reg", "veh", "bat", "grd", "ntf"].map((x) => [x, k === "1"])); this._wbSecSave(); }
    else if (a === "wbgo") { this._wbTab = "set"; this._wbSecO = { ...this._wbSecS(), [k]: true }; this._wbSecSave(); }
    else if (a === "wbplan") this._wbSave({ planStrat: k });
    else if (a === "wbsrc") { this._wbSave({ planSrc: k }); }
    else if (a === "wbpv") { this._wbSave({ pvSrc: k }); }
    else if (a === "wbsper") S.per = k;
    else if (a === "wbswhat") S.what = k;
    else if (a === "wbsby") S.by = k;
    else if (a === "wbnav") { const d = Number(k); if (S.per === "m") { let m = S.m + d, y = S.y; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } S.m = m; S.y = y; } else S.y += d; }
    this._render();
  }
  /* Laderegelung der Wallbox in Modul 8 (Modus, Ladeplan, Schwellen; angelehnt an das Prinzip von evcc) */
  _wbCard(d, part) {
    this._wbLoad();
    const s = this._wbSnap(), c = s.cfg, i = s.info, w = s.want, adm = this._admin(), soc = d.soc != null ? d.soc : s.soc;
    if (!c.ip) return `<div class="card lusoon">${ic("energy", 26)}<div><b>Laderegelung</b><span class="mut">Verbinde zuerst deine Wallbox unter Einstellungen → Integrationen.</span></div>${adm ? `<button class="btn2 pri" data-act="igopen" style="flex:none">Integrationen</button>` : ""}</div>`;
    const modes = [["off", "Aus", "close"], ["pv", "Sonne", "sun"], ["minpv", "Sonne + Netz", "bolt"], ["now", "Voll", "energy"]];
    const wsn = s.who, wveh = wsn && wsn.kind === "vehicle" ? c.vehicles.find((x) => x.name === wsn.name) : null, em = wsn ? (wveh ? wveh.mode : wsn.kind === "guest" ? c.guest.mode : c.mode) : c.mode;
    const info = { off: "Es wird nicht geladen.", pv: "Lädt nur mit Überschuss aus der Solaranlage. Ohne Überschuss pausiert die Ladung.", minpv: "Lädt immer mit dem Mindeststrom und nutzt zusätzlich den PV-Überschuss.", now: "Lädt sofort mit dem eingestellten Höchststrom, unabhängig von der Sonne." }[em];
    const tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    const stp = (lab, key, val, unit, step, hint) => `<div class="vrow"><span>${lab}${hint ? `<small class="mut" style="display:block">${hint}</small>` : ""}</span><div class="step" style="flex:none"><button data-act="wbstep" data-k="${key}" data-s="${-step}" aria-label="weniger" ${adm ? "" : "disabled"}>${ic("minus", 18)}</button><b>${val} ${unit}</b><button data-act="wbstep" data-k="${key}" data-s="${step}" aria-label="mehr" ${adm ? "" : "disabled"}>${ic("plus", 18)}</button></div></div>`;
    const sw = (lab, key, on, hint) => `<div class="vrow"><span>${lab}${hint ? `<small class="mut" style="display:block">${hint}</small>` : ""}</span><button class="sw ${on ? "on" : ""}" data-act="wbsw" data-k="${key}" aria-pressed="${on}" aria-label="${lab}" ${adm ? "" : "disabled"}></button></div>`;
    const chips = (key, opts, cur) => `<div class="gschips" style="margin:6px 0">${opts.map(([k, l]) => `<button class="gsch ${cur === k ? "sel" : ""}" data-act="wbset" data-key="${key}" data-k="${k}" aria-pressed="${cur === k}" ${adm ? "" : "disabled"}>${l}</button>`).join("")}</div>`;
    const hhmm = (iso) => { const t = iso ? new Date(iso) : null; return t && isFinite(t) ? t.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : ""; };
    const pw = i.power != null ? wfmt(i.power) : "–", pl = s.plan || {};
    const status = !s.ok ? ["Nicht erreichbar", s.error || "keine Antwort"] : c.enabled ? [i.car_text || "–", (w.state === "pausiert" ? "Regelung pausiert" : w.state === "pv" ? "Lädt mit PV-Überschuss" : w.state === "voll" ? "Lädt mit voller Leistung" : w.state === "minpv" ? "Mindeststrom plus PV" : w.state === "wartet" ? "Wartet auf Überschuss" : w.state === "plan_wartet" ? "Wartet auf das Ladefenster" : w.state === "gesperrt" ? "Wartet auf eine Karte" : w.state === "limit" ? "Ladelimit erreicht" : w.state === "fertig" ? "Fertig geladen" : "Wallbox ist aus")] : [i.car_text || "–", "Regelung ist aus"];
    const sec = (k, ico, t, sm, b, wn) => this._wbSec(k, ico, t, sm, b, wn), X = this._wbxParts(), nv = c.vehicles.length, nc = ((i && i.cards) || []).length, nt = Object.values(c.notify || {}).filter((v) => v === true).length;
    const mainCard = `<div class="card ocard"><h2>${ic("energy", 18)}Wallbox · ${esc(i.name || i.type || "go-e Charger")}</h2>
        ${sw("Laderegelung aktiv", "wbon", c.enabled, c.enabled ? "Strom &amp; Wärme steuert Start, Ladestrom und Phasen." : "Aus: Es wird nichts an der Wallbox verändert.")}
        <div class="seg3 wbm" style="grid-template-columns:repeat(4,1fr)">${modes.map(([k, l, ic_]) => `<button class="${em === k ? "sel" : ""}" data-act="wbmode" data-k="${k}" aria-pressed="${em === k}" ${adm && !c.planOn ? "" : "disabled"}>${ic(ic_, 22)}${l}</button>`).join("")}</div>
        <div class="mut sm" style="margin:-2px 0 10px">${c.planOn ? "Die <b>Planung</b> steuert die Wallbox. Der Modus gilt wieder, wenn du sie im Register „Planung“ ausschaltest." : info + " " + (wsn ? (wveh ? `Gilt für <b>${esc(wveh.name)}</b> (Karte ${esc(String(wsn.card))}).` : "Gilt für das Gastfahrzeug.") : "Gilt, solange kein Fahrzeug an einer Karte erkannt wird.")}</div>
        <div class="lugrid">${tile("Status", esc(status[0]), esc(status[1]))}${tile("Ladeleistung", pw, i.cur != null ? `${num(i.cur, 0)} A · ${i.phases || "–"} ${i.phases === 1 ? "Phase" : "Phasen"}` : "–")}${tile("PV-Überschuss", w.surplus_w != null ? wfmt(w.surplus_w) : "–", c.enabled ? "aus dem Netz-Sensor (Modul 3 oder 1)" : "bei aktiver Regelung")}${tile("Ladestand", soc != null ? num(soc, 0) + " %" : "–", soc != null ? `Limit ${c.limit} %` : "kein Sensor gewählt")}</div>
        ${c.enabled && w.reason ? `<div class="gst">${ic("info", 15)}${esc(w.reason)}</div>` : ""}
        ${i.session_wh != null ? `<div class="mut sm" style="margin-top:6px">Diese Ladung: ${num(i.session_wh / 1000, 1)} kWh · gesamt ${i.total_wh != null ? num(i.total_wh / 1000, 0) + " kWh" : "–"} · Firmware ${esc(i.fw || "–")}</div>` : ""}</div>`;
    const logCard = `<div class="card ocard"><h2>${ic("list", 18)}Letzte Entscheidungen</h2>${s.log.length ? `<div class="rev">${s.log.slice(0, this._wbLogAll ? 12 : 4).map((e) => `<div style="--c:var(--teal)"><time>${hhmm(e.t)}</time><i></i><span>${esc(e.x)}</span></div>`).join("")}${s.log.length > 4 ? `<button class="lnk" data-act="wblog" style="margin-top:6px">${this._wbLogAll ? "Weniger anzeigen" : `Alle ${Math.min(12, s.log.length)} anzeigen`}</button>` : ""}</div>` : `<div class="mut sm">Noch nichts. Hier steht, wann die Regelung die Wallbox umgestellt hat und warum.</div>`}</div>`;
    const regBody = `<div class="lsec">${ic("energy", 15)}Ladestrom</div>
        ${stp("Mindest-Ladestrom", "minA", c.minA, "A", 1, "Darunter lädt das Auto nicht (6 bis 16 A)")}${stp("Höchster Ladestrom", "maxA", c.maxA, "A", 1)}
        <div class="lsec" style="margin-top:12px">${ic("sliders", 15)}Phasenumschaltung</div>${chips("ph", [["auto", "Automatisch"], ["1", "1 Phase"], ["3", "3 Phasen"]], c.ph)}
        <div class="mut sm">Automatisch: Bei wenig Sonne 1 Phase (ab ${wfmt(230 * c.minA)}), bei viel Sonne 3 Phasen (ab ${wfmt(230 * 3 * c.minA)}). Die Umschaltung erfolgt höchstens alle 10 Minuten.</div>
        <div class="lsec" style="margin-top:12px">${ic("sun", 15)}Start und Stopp bei Sonne</div>
        ${stp("Starten ab Überschuss", "startW", wfmt(c.startW), "", 100)}${stp("Start nach", "onMin", c.onMin, "Min.", 1, "Der Überschuss muss so lange da sein")}${stp("Stopp nach", "offMin", c.offMin, "Min.", 1, "Verhindert ständiges Ein- und Ausschalten bei Wolken")}
        <div class="lsec" style="margin-top:12px">${ic("car", 15)}Fahrzeug</div>
        ${stp("Laden bis Ladestand", "limit", c.limit, "%", 5, "Braucht den Ladestand-Sensor des Fahrzeugs")}${stp("Akkukapazität", "cap", c.cap, "kWh", 5, "Für die Berechnung des Ladeplans")}`;
    const batBody = `${sw("Hausbatterie zuerst laden", "batOn", c.batOn, "Das Auto bekommt erst Überschuss, wenn die Batterie voll genug ist (Ladestand-Sensor in Modul 1)")}
        ${c.batOn ? stp("Batterie mindestens", "batSoc", c.batSoc, "%", 5) : ""}
        ${sw("Netzstrom nur bei günstigem Preis", "priceOn", c.priceOn, "Braucht einen Preis-Sensor (dynamischer Tarif) in Modul 1")}
        ${c.priceOn ? stp("Höchster Preis", "priceMax", c.priceMax, "ct/kWh", 1) : ""}`;
    const depCard = `<div class="card ocard"><h2>${ic("clock", 18)}Standard-Abfahrt</h2>
        <div class="mut sm" style="margin:0 0 8px">Gilt für alle Fahrzeuge ohne eigene Abfahrt, für Gäste und ohne erkannte Karte. Braucht den Ladestand-Sensor des Fahrzeugs.</div>
        ${stp("Ziel-Ladestand", "planSoc", c.planSoc, "%", 5)}
        <div class="vrow"><span>Bis</span><input class="osel" type="time" data-f="wbtime" value="${esc(c.planTime)}" style="width:auto;margin:0" aria-label="Uhrzeit" ${adm ? "" : "disabled"}></div>${chips("planDays", [["all", "Täglich"], ["wk", "Mo–Fr"], ["we", "Wochenende"]], c.planDays)}
        ${sw("Spätestens mit Netzstrom nachladen", "plan", c.plan, "Reicht die Sonne nicht, startet die Wallbox im Modus „Sonne“ zur berechneten Zeit mit Netzstrom. Die Planung nach Preis und Sonne ersetzt das, wenn sie aktiv ist.")}
        <div class="gst">${ic("clock", 15)}<span>${soc == null ? "Ohne Ladestand-Sensor ist keine Planung möglich (Fahrzeug einrichten)." : pl.need_kwh > 0 && pl.start ? `Es fehlen etwa <b>${num(pl.need_kwh, 0)} kWh</b>. Reicht die Sonne bis ${esc(c.planTime)} nicht, startet die Wallbox spätestens um <b>${hhmm(pl.start)} Uhr</b> mit Netzstrom.` : pl.need_kwh > 0 ? "Für diesen Tag ist keine Ladung geplant." : "Das Ziel ist schon erreicht."}</span></div></div>`;
    if (part === "dep") return depCard;
    if (part === "set") return `${this._wbCheck()}<div class="wsall"><span class="mut sm">Tippe auf einen Bereich, um ihn zu öffnen.</span><span><button class="lnk" data-act="wbsecall" data-k="1">Alle öffnen</button><button class="lnk" data-act="wbsecall" data-k="0">Alle schließen</button></span></div>
      ${sec("wb", "energy", "Wallbox und Verbindung", `${esc(i.name || i.type || "go-e Charger")} · ${esc(c.ip)}${s.ok ? "" : " · nicht erreichbar"}`, `<div class="lugrid">${tile("Gerät", esc(i.type || "go-e Charger"), esc(i.name || "–"))}${tile("Adresse", esc(c.ip), s.ok ? "erreichbar" : "nicht erreichbar")}${tile("Firmware", esc(i.fw || "–"), i.serial ? "Seriennr. " + esc(i.serial) : "–")}${tile("Gesamt geladen", i.total_wh != null ? num(i.total_wh / 1000, 0) + " kWh" : "–", "seit Inbetriebnahme")}</div>
        <div class="mut sm" style="margin:8px 0">Die Verbindung zur Wallbox richtest du unter Einstellungen → Integrationen ein, dort auch Tibber.</div><div style="display:flex;gap:8px;flex-wrap:wrap">${adm ? `<button class="btn2" data-act="wbtest" ${this._wbTest && this._wbTest.busy ? "disabled" : ""}>${ic("check", 16)} Verbindung testen</button><button class="btn2" data-act="igopen">${ic("tools", 16)} Verbindung ändern</button>` : ""}</div>${this._wbTest && !this._wbTest.busy ? `<div class="gst ${this._wbTest.ok ? "" : "on"}" style="margin-top:8px">${ic(this._wbTest.ok ? "check" : "info", 15)}<span>${this._wbTest.ok ? `Verbindung steht: ${esc(this._wbTest.type || "go-e Charger")}, Firmware ${esc(this._wbTest.fw || "–")}.` : esc(this._wbTest.error || "Keine Antwort")}</span></div>` : ""}`, !s.ok)}
      ${sec("reg", "sliders", "Laderegelung", `${c.minA} bis ${c.maxA} A · Phasen ${c.ph === "auto" ? "automatisch" : c.ph} · Limit ${c.limit} %`, regBody)}
      ${sec("veh", "car", "Fahrzeuge und Karten", `${nv} ${nv === 1 ? "Fahrzeug" : "Fahrzeuge"} · ${nc} ${nc === 1 ? "Karte" : "Karten"}${c.lock ? " · nur mit Karte" : ""}`, this._rfCard(true), !nv || c.vehicles.some((x) => !x.ids.length))}
      ${sec("bat", "home", "Hausbatterie und Strompreis", `Batterie ${c.batOn ? "zuerst bis " + c.batSoc + " %" : "egal"} · Preisgrenze ${c.priceOn ? c.priceMax + " ct" : "aus"}`, batBody)}
      ${sec("grd", "shield", "Hausanschluss-Schutz", c.guard.on ? `An · höchstens ${c.guard.maxA} A pro Phase` : "Aus", X.guard)}
      ${sec("ntf", "bell", "Benachrichtigungen", nt ? `${nt} von 5 Meldungen · ${c.notify.to.length ? c.notify.to.map((x) => esc(x.replace("notify.", ""))).join(", ") : "kein Empfänger"}` : "Aus", X.notify)}`;
    return `${mainCard}
      <div class="card ocard"><h2>${ic("energy", 18)}Schnellstart</h2>${X.quick}</div>
      ${logCard}`;
  }
  /* Fahrzeuge und Karten (nach dem Vorbild von evcc): Das Fahrzeug wird an der Karte erkannt, die an der Wallbox angelegt wird. */
  _rfCard(bare) {
    const sn = this._wbSnap(), c = sn.cfg, adm = this._admin(), cards = (sn.info && sn.info.cards) || [], who = sn.who || null;
    const nm = (i) => (cards.find((x) => x.i === i) || {}).n || `Karte ${i}`;
    const MODES = [["off", "Aus"], ["pv", "Sonne"], ["minpv", "Sonne + Netz"], ["now", "Voll"]], ML = Object.fromEntries(MODES);
    const mode = (id, cur) => `<div class="gschips" style="margin:6px 0">${MODES.map(([k, l]) => `<button class="gsch ${cur === k ? "sel" : ""}" data-act="wbrmode" data-v="${id}" data-k="${k}" aria-pressed="${cur === k}" ${adm ? "" : "disabled"}>${l}</button>`).join("")}</div>`;
    const lim = (id, val) => `<div class="vrow"><span>Ladelimit</span><div class="step" style="flex:none"><button data-act="wbrlim" data-v="${id}" data-s="-5" aria-label="weniger" ${adm ? "" : "disabled"}>${ic("minus", 18)}</button><b>${val} %</b><button data-act="wbrlim" data-v="${id}" data-s="5" aria-label="mehr" ${adm ? "" : "disabled"}>${ic("plus", 18)}</button></div></div>`;
    const used = new Set(c.vehicles.flatMap((x) => x.ids));
    const owner = (i) => c.vehicles.find((x) => x.ids.includes(i)), E = this._evState(), evName = [E.brand === "Andere" ? "" : E.brand, E.model].filter(Boolean).join(" ").trim(), canTake = adm && evName && c.vehicles.length < 6 && !c.vehicles.some((x) => x.name === evName);
    const assign = `<div class="rfa"><div class="lsec">${ic("shield", 15)}Karten zuordnen</div><div class="mut sm" style="margin:2px 0 6px">Pro Fahrzeug sind beliebig viele Karten möglich. Jede Karte gehört aber nur zu einem Fahrzeug.</div>
      ${canTake ? `<button class="btn2" data-act="wbrfromev" style="margin:4px 0 8px">${ic("car", 16)} Fahrzeug aus den Einstellungen übernehmen: ${esc(evName)}</button>` : ""}
      ${cards.length ? cards.map((k) => { const o = owner(k.i), act = who && who.card === k.i; return `<div class="rfc"><div class="rfn"><b>${esc(k.n)}</b>${act ? `<span class="ost home">Aktiv</span>` : ""}<small class="mut">Karte ${k.i} · ${num(k.kwh, 0)} kWh geladen · ${o ? "gehört zu " + esc(o.name) : "keinem Fahrzeug zugeordnet (Gast)"}</small></div>
        ${c.vehicles.length ? `<div class="gschips" style="margin:4px 0 0">${c.vehicles.map((x) => `<button class="gsch ${o && o.id === x.id ? "sel" : ""}" data-act="wbrassign" data-v="${x.id}" data-k="${k.i}" aria-pressed="${!!(o && o.id === x.id)}" ${adm ? "" : "disabled"}>${esc(x.name)}</button>`).join("")}</div>` : `<div class="mut sm">Lege zuerst ein Fahrzeug an.</div>`}</div>`; }).join("") : `<div class="mut sm">Es wurden noch keine Karten von der Wallbox gelesen. Lege sie in der go-e-App an (Einstellungen → Zugang → RFID-Karten).</div>`}</div>`;
    const veh = c.vehicles.map((x) => `<div class="rfv"><div class="oper" style="padding:0"><span class="oav" style="background:#14b8a6">${ic("car", 20)}</span><div class="opi"><b>${esc(x.name)}</b><small>${x.ids.length ? "Erkannt an: " + x.ids.map((i) => esc(nm(i))).join(", ") : "Noch keine Kennung zugeordnet"}</small></div>${adm ? `<button class="ibtn" data-act="wbrvdel" data-v="${x.id}" aria-label="Fahrzeug entfernen">${ic("trash", 16)}</button>` : ""}</div>
      <div class="mut sm" style="margin-top:8px">Kennungen (Karten aus der Wallbox)</div>
      <div class="gschips" style="margin:6px 0">${x.ids.map((i) => `<button class="gsch sel" data-act="wbrrm" data-v="${x.id}" data-k="${i}" aria-label="${esc(nm(i))} entfernen" ${adm ? "" : "disabled"}>${esc(nm(i))} ${ic("close", 12)}</button>`).join("")}</div>
      ${cards.some((k) => !used.has(k.i)) ? `<div class="mut sm" style="margin-top:4px">Freie Karten antippen, um sie diesem Fahrzeug zuzuordnen</div><div class="gschips" style="margin:6px 0">${cards.filter((k) => !used.has(k.i)).map((k) => `<button class="gsch" data-act="wbrcadd" data-v="${x.id}" data-k="${k.i}" aria-label="${esc(k.n)} zuordnen" ${adm ? "" : "disabled"}>${ic("plus", 12)} ${esc(k.n)}</button>`).join("")}</div>` : (cards.length ? `<div class="mut sm" style="margin-top:4px">Alle Karten der Wallbox sind zugeordnet.</div>` : `<div class="mut sm" style="margin-top:4px">Es sind noch keine Karten in der go-e-App angelegt.</div>`)}
      <div class="mut sm" style="margin-top:8px">Modus, sobald das Fahrzeug erkannt wird</div>${mode(x.id, x.mode)}${lim(x.id, x.limit)}</div>`).join("");
    const st = !sn.ok ? ["Wallbox nicht erreichbar", sn.error || "keine Antwort"]
      : !who ? ["Keine Kennung erkannt", c.lock ? "Strom & Wärme verändert nichts, bis eine Karte angelegt wird." : "Es gilt der Modus der Laderegelung oben."]
      : who.kind === "vehicle" ? [`Erkannt: ${who.name} (Karte „${nm(who.card)}“)`, `Die Regelung arbeitet im Modus „${ML[who.mode]}“ mit Ladelimit ${who.limit} %.`]
      : [`Erkannt: Gastfahrzeug (Karte „${nm(who.card)}“)`, `Die Karte ist keinem Fahrzeug zugeordnet. Es gilt der Modus „${ML[who.mode]}“.`];
    return `${bare ? "<div>" : `<div class="card ocard"><h2>${ic("car", 18)}Fahrzeuge &amp; Karten</h2>`}
      <div class="mut sm" style="margin-bottom:8px">Wie bei evcc wird das Fahrzeug an der Karte erkannt, die an der Wallbox angelegt wird. Als Kennung dient der Kartenname aus der go-e-App. Eine Karte gehört zu genau einem Fahrzeug, ein Fahrzeug kann mehrere Karten haben.</div>
      <div class="gst" style="margin:0 0 10px">${ic(who ? "check" : "info", 15)}<span><b>${esc(st[0])}</b><br>${esc(st[1])}</span></div>
      ${assign}
      ${veh}
      ${adm && c.vehicles.length < 6 ? `<button class="lnk" data-act="wbrvadd">${ic("plus", 16)}Fahrzeug hinzufügen</button>` : ""}
      <div class="rfv"><div class="oper" style="padding:0"><span class="oav" style="background:#64748b">${ic("user", 20)}</span><div class="opi"><b>Gastfahrzeug</b><small>Unbekannte Karte</small></div></div>${mode("guest", c.guest.mode)}${lim("guest", c.guest.limit)}</div>
      <div class="vrow"><span>Nur mit erkannter Karte regeln<small class="mut" style="display:block">Ohne angelegte Karte verändert Strom &amp; Wärme nichts an der Wallbox. Die eigentliche Sperre kommt von der Kartenpflicht in der go-e-App.</small></span><button class="sw ${c.lock ? "on" : ""}" data-act="wbrlock" aria-pressed="${c.lock}" aria-label="Nur mit erkannter Karte regeln" ${adm ? "" : "disabled"}></button></div>
      <div class="vrow"><span>Nach dem Abstecken zurücksetzen<small class="mut" style="display:block">Die Wallbox wird auf „neutral“ gestellt und die Erkennung vergessen. Sie gilt nur für eine Ladung.</small></span><button class="sw ${c.reset ? "on" : ""}" data-act="wbrreset" aria-pressed="${c.reset}" aria-label="Nach dem Abstecken zurücksetzen" ${adm ? "" : "disabled"}></button></div></div>`;
  }
  _rfAct(a, b) {
    const c = this._wb(), k = b.dataset.k, id = b.dataset.v;
    const upd = (fn) => { if (id === "guest") this._wbSave({ guest: fn({ ...c.guest }) }); else this._wbSave({ vehicles: c.vehicles.map((x) => (x.id === id ? fn({ ...x }) : x)) }); };
    if (a === "wbrlock") this._wbSave({ lock: !c.lock });
    else if (a === "wbrreset") this._wbSave({ reset: !c.reset });
    else if (a === "wbrmode") upd((x) => ({ ...x, mode: k }));
    else if (a === "wbrlim") upd((x) => ({ ...x, limit: Math.max(50, Math.min(100, x.limit + Number(b.dataset.s))) }));
    else if (a === "wbrrm") upd((x) => ({ ...x, ids: x.ids.filter((i) => i !== Number(k)) }));
    else if (a === "wbrcadd" || a === "wbrassign") { const n = Number(k), has = (c.vehicles.find((x) => x.id === id) || { ids: [] }).ids.includes(n); this._wbSave({ vehicles: c.vehicles.map((x) => (x.id === id ? { ...x, ids: has ? x.ids.filter((i) => i !== n) : [...x.ids, n] } : { ...x, ids: x.ids.filter((i) => i !== n) })) }, true); }
    else if (a === "wbrfromev") { const E = this._evState(), nm2 = [E.brand === "Andere" ? "" : E.brand, E.model].filter(Boolean).join(" ").trim().slice(0, 30); if (nm2) this._wbSave({ vehicles: [...c.vehicles, { id: "v" + Date.now().toString(36), name: nm2, ids: [], mode: "pv", limit: 80 }] }, true); }
    else if (a === "wbrvadd") { const n = c.vehicles.length + 1; this._wbSave({ vehicles: [...c.vehicles, { id: "v" + Date.now().toString(36), name: "Fahrzeug " + n, ids: [], mode: "pv", limit: 80 }] }, true); }
    else if (a === "wbrvdel") this._wbSave({ vehicles: c.vehicles.filter((x) => x.id !== id) }, true);
    this._render();
  }
  _wbAct(a, b) {
    if (a.startsWith("wbr")) return this._rfAct(a, b);
    if (a.startsWith("wbx") || a === "wbcsv") return this._wbxAct(a, b);
    if (a.startsWith("wbd")) return this._wbdAct(a, b);
    if (a === "wbtab" || a === "wbsec" || a === "wbsecall" || a === "wbgo" || a === "wbplan" || a === "wbsrc" || a === "wbpv" || a === "wbsper" || a === "wbswhat" || a === "wbsby" || a === "wbnav") return this._wbStAct(a, b);
    if (a === "wbtest") { this._wbTest = { busy: true }; this._render(); this._hass.callWS({ type: "fenster_heizung/wb_test", ip: this._wb().ip }).then((r) => { this._wbTest = r || { ok: false, error: "Keine Antwort" }; }).catch(() => { this._wbTest = { ok: false, error: "Keine Antwort von Home Assistant" }; }).finally(() => this._render()); return; }
    if (a === "wblog") { this._wbLogAll = !this._wbLogAll; this._render(); return; }
    const c = this._wb(), k = b.dataset.k, R = { minA: [6, 16], maxA: [6, 16], startW: [500, 8000], onMin: [0, 15], offMin: [0, 30], limit: [50, 100], planSoc: [20, 100], cap: [10, 120], batSoc: [0, 100], priceMax: [1, 80], baseW: [0, 3000] };
    if (a === "wbmode") { const who = this._wbSnap().who, v = who && who.kind === "vehicle" ? c.vehicles.find((x) => x.name === who.name) : null; if (v) this._wbSave({ vehicles: c.vehicles.map((x) => (x.id === v.id ? { ...x, mode: k } : x)) }); else if (who && who.kind === "guest") this._wbSave({ guest: { ...c.guest, mode: k } }); else this._wbSave({ mode: k }); }
    else if (a === "wbset") this._wbSave({ [b.dataset.key]: k });
    else if (a === "wbsw" && k === "wbon") { if (c.enabled) this._wbSave({ enabled: false }, true); else { this._modal = { type: "wbon" }; this._renderModal(); return; } }
    else if (a === "wbsw") this._wbSave({ [k]: !c[k] });
    else if (a === "wbstep") { const r = R[k], v = Math.max(r[0], Math.min(r[1], c[k] + Number(b.dataset.s))), p = { [k]: v }; if (k === "minA" && c.maxA < v) p.maxA = v; if (k === "maxA" && c.minA > v) p.minA = v; this._wbSave(p); }
    else if (a === "wbyes") { this._wbSave({ enabled: true }, true); this._modal = null; this._renderModal(); this._toast("Laderegelung ist an"); }
    this._render();
  }
  _wbOnModal() {
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Laderegelung einschalten?</b><span>Wallbox · go-e Charger</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="mut" style="margin:6px 0 10px">Strom &amp; Wärme startet und stoppt dann die Ladung und stellt Ladestrom und Phasen ein. Wenn du die Wallbox in der go-e-App von Hand umstellst, pausiert die Regelung 30 Minuten.</div>
      <div class="gst">${ic("info", 15)}Tipp für den ersten Test: Modus „Aus“ lassen, dann „Voll“ mit niedrigem Höchststrom (zum Beispiel 6 A) und die Wirkung in der go-e-App beobachten.</div>
      <div class="foot2" style="margin-top:14px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="wbyes">Einschalten</button></div></div>`;
  }
  _wbLater(t) { /* Zeitfeld nicht mitten in der Eingabe neu aufbauen (Safari meldet jede Ziffer einzeln) */ clearTimeout(this._wbLT); this._wbLT = setTimeout(() => { const ae = this.shadowRoot.activeElement; if (ae && ae.type === "time") { ae.addEventListener("blur", () => this._render(), { once: true }); } else this._render(); }, 700); }
  _wbChange(t) { const f = t.dataset.f; if (f === "wbdt") { if (/^([01]\d|2[0-3]):[0-5]\d$/.test(t.value)) { const c = this._wb(); this._wbSave({ vehicles: c.vehicles.map((x) => (x.id === t.dataset.v ? { ...x, dep: { ...this._wbDep(x), time: t.value } } : x)) }); this._wbLater(t); } return true; } if (f === "wbradd") { const c = this._wb(); if (t.value) { this._wbSave({ vehicles: c.vehicles.map((x) => (x.id === t.dataset.v ? { ...x, ids: [...x.ids, Number(t.value)] } : x)) }, true); this._render(); } return true; } if (f === "wbtime") { if (/^([01]\d|2[0-3]):[0-5]\d$/.test(t.value)) { this._wbSave({ planTime: t.value }); this._wbLater(t); } return true; } return false; }
  /* Gerätestrom: eigene Berechnung im Backend (fenster_heizung/gs_get). Solar, Netz, Batterie kommen aus Modul 3, Preise aus Modul 1. */
