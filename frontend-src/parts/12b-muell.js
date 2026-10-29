  /* Modul 17: Müllabfuhr (Labs). Termine, Ampel, Erinnerung, Ansage und Licht laufen im Backend (muell.py).
     Das Modul gibt es nur, solange das Lab „Müllabfuhr“ (mm) an ist. Ausgeschaltet verschwinden Modul und Store-Eintrag. */
  _muDef() { return { cal: "", time: "18:30", bins: { rest: { on: true, match: "rest,hausmüll,hausmuell,schwarz" }, bio: { on: true, match: "bio" }, papier: { on: true, match: "papier,pappe,blau" }, gelb: { on: true, match: "gelb,wertstoff,verpackung,lvp" } }, push: { on: false, to: [] }, cost: { on: false, fee: 0, incl: 0 }, wx: true, tts: { on: false, ent: "", player: "", text: "Morgen wird {tonnen} abgeholt." }, light: { on: false, ent: "" } }; }
  _mu() {
    const d = (this._muD && this._muD.d) || {}, df = this._muDef(), c = d.cfg || {};
    return { ...d, cfg: { ...df, ...c, bins: Object.fromEntries(Object.keys(df.bins).map((k) => [k, { ...df.bins[k], ...((c.bins || {})[k] || {}) }])), push: { ...df.push, ...(c.push || {}) }, cost: { ...df.cost, ...(c.cost || {}) }, tts: { ...df.tts, ...(c.tts || {}) }, light: { ...df.light, ...(c.light || {}) } } };
  }
  _muLoad(force) {
    if (!this._hass || this._muBusy) return;
    if (!force && this._muD && Date.now() - this._muD.ts < 20000) return;
    this._muBusy = true;
    this._hass.callWS({ type: "fenster_heizung/mu_get" }).then((r) => { if (!this._muT) this._muD = { d: r || {}, ts: Date.now() }; }).catch(() => { this._muD = { d: { error: "Keine Antwort von Home Assistant" }, ts: Date.now() }; })
      .finally(() => { this._muBusy = false; if (this._muVisible()) { this._render(); if (this._modal && this._modal.type === "muset") this._renderModal(); } });
  }
  _muVisible() { return !!(this._modal && this._modal.type === "muset") || (!!this._mdActive && this._mdActive() === "mu" && !this._stOpen && !this._igOpen && !this._labOpen); }
  _muHasWcs() { return Object.values(this._hass.entities || {}).some((e) => e && e.platform === "waste_collection_schedule"); }
  _muSave(cfg, quiet) {
    if (!(this._muD && this._muD.d && this._muD.d.cfg)) { this._toast("Noch nicht geladen, bitte kurz warten und nochmal versuchen"); return; }
    const s = this._mu(); this._muD = { d: { ...s, cfg }, ts: Date.now() };
    clearTimeout(this._muT);
    this._muT = setTimeout(() => {
      this._muT = null;
      this._hass.callWS({ type: "fenster_heizung/mu_set", cfg: this._mu().cfg }).then((r) => { this._muD = { d: r || {}, ts: Date.now() }; if (this._muVisible() && !this._muQuiet) { this._render(); if (this._modal && this._modal.type === "muset") this._renderModal(); } })
        .catch(() => this._toast("Die Einstellung konnte nicht gespeichert werden"));
    }, 500);
    this._muQuiet = !!quiet;
    if (!quiet) { this._render(); if (this._modal && this._modal.type === "muset") this._renderModal(); }
  }
  _muPatch(fn, quiet) { const c = JSON.parse(JSON.stringify(this._mu().cfg)); fn(c); this._muSave(c, quiet); }
  _muCall(act, bin) { this._hass.callWS({ type: "fenster_heizung/mu_act", act, ...(bin ? { bin } : {}) }).then((r) => { this._muD = { d: r || {}, ts: Date.now() }; this._render(); }).catch(() => this._toast("Das hat nicht geklappt")); }
  _muDate(iso) { return iso ? new Date(iso + "T12:00:00").toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" }) : ""; }
  _muWhen(d) { return d == null ? "" : d === 0 ? "heute" : d === 1 ? "morgen" : `in ${d} Tagen`; }
  _muxAct(a, b) {
    const k = b.dataset.k;
    if (a === "muxopen") { this._muLoad(true); this._modal = { type: "muset" }; this._renderModal(); return; }
    if (a === "muxdone") { this._muCall("done", k); return; }
    if (a === "muxundo") { this._muCall("undo", k); return; }
    if (a === "muxsnooze") { this._muCall("snooze"); this._toast("Ich erinnere in einer Stunde noch einmal"); return; }
    if (a === "muxtest") { this._hass.callWS({ type: "fenster_heizung/mu_test" }).then((r) => this._toast(r && r.sent ? `Test an ${r.sent} ${r.sent === 1 ? "Dienst" : "Diensten"} gesendet` : "Kein Benachrichtigungsdienst gewählt")).catch(() => this._toast("Test fehlgeschlagen")); return; }
    if (a === "muxhide") { const h = this._muLay().hidden; this._muLaySave({ hidden: h.includes(k) ? h.filter((x) => x !== k) : [...h, k] }); return; }
    if (a === "muxreset") { this._muLaySave({ order: Object.keys(MU_NAMES), hidden: [] }); this._toast("Anordnung zurückgesetzt"); return; }
    if (a === "muxstore") { this._modal = null; this._renderModal(); this._sto = { q: "", c: "haus" }; this._igOpen = true; this._labOpen = false; this._render(); return; }
    this._muPatch((c) => {
      if (a === "muxsw") { if (k.startsWith("bin:")) c.bins[k.slice(4)].on = !c.bins[k.slice(4)].on; else if (k === "push") c.push.on = !c.push.on; else if (k === "tts") c.tts.on = !c.tts.on; else if (k === "light") c.light.on = !c.light.on; else if (k === "cost") c.cost.on = !c.cost.on; else if (k === "wx") c.wx = !c.wx; }
      else if (a === "muxns") c.push.to = c.push.to.includes(k) ? c.push.to.filter((x) => x !== k) : [...c.push.to, k];
    });
  }
  _muxChange(t) {
    const f = t.dataset.f, k = t.dataset.k, v = t.value || "";
    if (f === "muxsel") { this._muPatch((c) => { if (k === "cal") c.cal = v; else if (k === "tts_ent") c.tts.ent = v; else if (k === "tts_player") c.tts.player = v; else if (k === "light") c.light.ent = v; }); return true; }
    if (f === "muxtime") { if (/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) this._muPatch((c) => { c.time = v; }, true); return true; }
    if (f === "muxmatch") { this._muPatch((c) => { c.bins[k].match = v; }, true); return true; }
    if (f === "muxtext") { this._muPatch((c) => { c.tts.text = v; }, true); return true; }
    if (f === "muxnum") { const n = Number(String(v).replace(",", ".")); if (isFinite(n)) this._muPatch((c) => { c.cost[k] = Math.max(0, n); }, true); return true; }
    return false;
  }
  _muSetupCard(S) {
    const none = !S.cal;
    return `<div class="card"><h2>${ic("trash", 18)}${none ? "Noch kein Abfallkalender" : "Kalender liefert keine Termine"}</h2>
      <div class="mut sm" style="margin:0 0 10px">${none ? "Modul 17 liest die Abholtermine aus einem Kalender von Home Assistant. Am einfachsten geht das mit der Integration waste_collection_schedule, sie kennt viele Entsorger." : esc(S.error || "Bitte einen anderen Kalender wählen.")}</div>
      ${none ? `<div class="stost"><b>1</b><span>Im Store „Abfallkalender“ öffnen und einrichten</span></div><div class="stost"><b>2</b><span>Dort deinen Entsorger wählen, es entsteht ein Kalender</span></div><div class="stost"><b>3</b><span>Hier erscheint er automatisch, oder du wählst ihn in den Einstellungen</span></div>` : ""}
      <div class="gbtns" style="margin-top:10px">${this._admin() ? `<button class="btn2 pri" data-act="muxstore">${ic("puzzle", 16)} Zum Store</button><button class="btn2" data-act="muxopen">${ic("sliders", 16)} Einstellungen</button>` : `<span class="mut sm">Das richtet ein Administrator ein.</span>`}</div></div>`;
  }
  _muPage() {
    this._muLoad(); const S = this._mu(), C = S.cfg, adm = this._admin();
    const banner = `<div class="labban">${ic("flask", 22)}<div><b>Labs · Müllabfuhr</b>Dieses Modul ist ein Experiment und nur da, solange das Lab eingeschaltet ist. Die Termine kommen aus deinem Abfallkalender, die Erinnerungen laufen im Hintergrund.</div></div>`;
    if (!S.on) return `${banner}<div class="card empty">${S.error ? esc(S.error) : "Lädt …"}</div>`;
    if (!S.cal || (S.error && !(S.bins || []).some((x) => x.next))) return `${banner}${this._muSetupCard(S)}`;
    const rows = S.bins || [], due = rows.filter((x) => ["out", "today"].includes(x.state)), up = rows.filter((x) => x.next);
    const lbl = { out: "raus!", today: "heute", soon: "morgen", ok: "ok", done: "draußen", none: "–" };
    const tile = (x) => { const tap = ["out", "today", "soon"].includes(x.state) ? "muxdone" : x.state === "done" ? "muxundo" : ""; return `<${tap ? `button data-act="${tap}" data-k="${x.k}"` : "div"} class="mubin ${x.state}" ${tap ? `aria-label="${esc(x.name)}: ${tap === "muxdone" ? "steht draußen" : "wieder zurücknehmen"}"` : ""}><i class="bin" style="background:${x.color}"></i><b>${esc(x.name)}</b><small>${lbl[x.state]}</small></${tap ? "button" : "div"}>`; };
    const head = due.length ? `<div class="mulead"><b>${due.some((x) => x.state === "today") ? "Heute wird abgeholt" : "Morgen wird abgeholt"}</b><span>${due.map((x) => esc(x.name)).join(", ")}. Tippe auf die Tonne, wenn sie draußen steht.</span></div>` : `<div class="mulead ok"><b>Nichts zu tun</b><span>${up[0] ? `Als Nächstes: ${esc(up[0].name)}, ${this._muWhen(up[0].days)}.` : "Keine Termine in den nächsten Wochen."}</span></div>`;
    const ampel = `<div class="card"><h2>${ic("trash", 18)}Tonnen</h2>${head}<div class="mugrid">${rows.map(tile).join("")}</div>${C.push.on && due.some((x) => x.state === "out") ? `<div class="gbtns" style="margin-top:10px"><button class="btn2" data-act="muxsnooze">${ic("clock", 16)} Später erinnern</button></div>` : ""}</div>`;
    const next = `<div class="card"><h2>${ic("clock", 18)}Nächste Abholungen</h2><div class="wxl">${up.map((x) => `<div class="wxr ${x.days <= 1 ? "hot" : ""}"><span class="wxi"><i class="bin sm" style="background:${x.color}"></i></span><div class="wxm"><div class="wxt"><b>${esc(x.name)}</b><em>${this._muWhen(x.days)}</em></div><small>${this._muDate(x.next)}</small></div></div>`).join("") || `<div class="mut sm">Keine Termine gefunden.</div>`}</div></div>`;
    const M = S.month || {}, first = (new Date(M.y || 2026, (M.m || 1) - 1, 1).getDay() + 6) % 7, n = new Date(M.y || 2026, M.m || 1, 0).getDate(), col = Object.fromEntries(rows.map((x) => [x.k, x.color]));
    const cells = [...Array(first).fill(`<i class="mucd e"></i>`), ...Array.from({ length: n }, (_, i) => { const d = i + 1, bs = (M.d || {})[d] || []; return `<i class="mucd ${d === M.today ? "today" : ""}"><b>${d}</b><span>${bs.map((k) => `<u style="background:${col[k] || "#999"}"></u>`).join("")}</span></i>`; })];
    const mon = new Date(M.y || 2026, (M.m || 1) - 1, 1).toLocaleDateString("de-DE", { month: "long", year: "numeric" });
    const cal = `<div class="card"><h2>${ic("today", 18)}${esc(mon)}</h2><div class="mucal">${DAYS_SHORT_MU.map((d) => `<em>${d}</em>`).join("")}${cells.join("")}</div></div>`;
    const notes = S.notes || [], nt = `<div class="card"><h2>${ic("info", 18)}Hinweise</h2>${notes.length ? `<div class="wxl">${notes.map((x) => `<div class="wxr hot"><span class="wxi">${ic(x.k === "storm" ? "windy" : x.k === "frost" ? "snow" : "alert", 18)}</span><div class="wxm"><small>${esc(x.text)}</small></div></div>`).join("")}</div>` : `<div class="mut sm">Keine Verschiebung und keine Wetterwarnung für die nächsten Abholungen.${C.wx ? "" : " Wetter-Hinweise sind aus."}</div>`}</div>`;
    const info = (ico, t, txt, on) => `<div class="wxr ${on ? "" : "off"}"><span class="wxi">${ic(ico, 18)}</span><div class="wxm"><div class="wxt"><b>${t}</b><em>${on ? "An" : "Aus"}</em></div><small>${txt}</small></div></div>`;
    const nTo = C.push.to.length, tn = (e) => esc(this._wzName(e) || e);
    const rem = `<div class="card"><h2>${ic("bell", 18)}Erinnerung am Vorabend</h2><div class="wxl">
      ${info("bell", "Nachricht aufs Handy", C.push.on ? (nTo ? `Um ${esc(C.time)} Uhr an ${nTo} ${nTo === 1 ? "Dienst" : "Dienste"}.` : "An, aber noch kein Dienst gewählt (Einstellungen).") : "Aus. In den Einstellungen einschalten.", C.push.on)}
      ${info("music", "Ansage", C.tts.on && C.tts.ent && C.tts.player ? `Sprachausgabe auf ${tn(C.tts.player)} um ${esc(C.time)} Uhr.` : "Sprachausgabe über einen Lautsprecher, zum Beispiel im Flur.", C.tts.on && !!C.tts.ent && !!C.tts.player)}
      ${info("lamp", "Licht", C.light.on && C.light.ent ? `${tn(C.light.ent)} leuchtet in der Farbe der Tonne ab ${esc(C.time)} Uhr${S.light_on ? " (jetzt an)" : ""}, bis sie als draußen markiert ist.` : "Ein Licht in der Farbe der Tonne, bis sie draußen steht.", C.light.on && !!C.light.ent)}</div>
      ${adm ? `<div class="gbtns" style="margin-top:8px"><button class="btn2" data-act="muxopen">${ic("sliders", 16)} Einstellungen</button></div>` : ""}</div>`;
    let cost = ""; if (C.cost.on && S.stats) { const s = S.stats; cost = `<div class="card"><h2>${ic("chart", 18)}Restmüll ${s.year}: Leerungen und Kosten</h2><div class="lugrid">${this._labTile("Bisher geleert", `${s.done} von ${s.total}`, "Restmüll in diesem Jahr")}${this._labTile("Enthalten", s.incl ? String(s.incl) : "–", s.incl ? `noch ${s.free} frei` : "Keine Zahl eingetragen", s.incl && s.free === 0 ? "amber" : "")}${this._labTile("Extra", s.extra != null ? String(s.extra) : "–", s.cost != null ? `${num(s.cost, 2)} € zusätzlich` : "Gebühr je Leerung eintragen", s.extra ? "amber" : "green")}</div></div>`; }
    const B = { tonnen: ampel, next, cal, rem, hint: nt, cost }, lay = this._muLay(), edit = this._edit && adm;
    const eb = edit ? `<div class="banner">${ic("grip", 18)}<div>Ziehe die Karten an den Griffen, um sie zu verschieben. Mit dem Auge blendest du eine Karte aus. <button class="lnk" data-act="muxreset">Zurücksetzen</button></div></div>` : "";
    const blocks = lay.order.filter((id) => B[id] && (edit || !lay.hidden.includes(id))).map((id) => `<section class="blk mub ${MU_WIDE.includes(id) ? "wide" : ""} ${edit ? "editing" : ""} ${lay.hidden.includes(id) ? "hid" : ""}" data-sort="mublk" data-id="${id}">
      ${edit ? `<div class="etag"><span class="grip" data-handle title="Verschieben">${ic("grip", 18)}</span>${MU_NAMES[id]}<button class="eyeb" data-act="muxhide" data-k="${id}" aria-pressed="${!lay.hidden.includes(id)}" aria-label="${MU_NAMES[id]} ${lay.hidden.includes(id) ? "einblenden" : "ausblenden"}" title="${lay.hidden.includes(id) ? "Einblenden" : "Ausblenden"}">${ic(lay.hidden.includes(id) ? "eyeOff" : "eye", 18)}<span>${lay.hidden.includes(id) ? "Ausgeblendet" : "Sichtbar"}</span></button></div>` : ""}${B[id]}</section>`).join("");
    return `${banner}${eb}<div class="mublks">${blocks}</div>`;
  }
  _muLay() { const l = (this._cfg && this._cfg.layout && this._cfg.layout.mu) || {}, known = Object.keys(MU_NAMES), o = (Array.isArray(l.order) ? l.order : []).filter((x) => known.includes(x)); return { order: [...o, ...known.filter((x) => !o.includes(x))], hidden: (Array.isArray(l.hidden) ? l.hidden : []).filter((x) => known.includes(x)) }; }
  _muLaySave(patch) { const l = this._muLay(); this._cfg.layout.mu = { order: l.order, hidden: l.hidden, ...patch }; this._saveLayout(); this._render(); }
  _muxModal() {
    const S = this._mu(), C = S.cfg, H = this._hass, st = H.states, adm = this._admin();
    const sw = (k, on, label) => `<button class="sw ${on ? "on" : ""}" data-act="muxsw" data-k="${k}" aria-pressed="${!!on}" aria-label="${esc(label)}" ${adm ? "" : "disabled"}></button>`;
    const cals = Object.keys(st).filter((e) => e.startsWith("calendar.")), tts = Object.keys(st).filter((e) => e.startsWith("tts.")), pl = Object.keys(st).filter((e) => e.startsWith("media_player.")), li = Object.keys(st).filter((e) => e.startsWith("light."));
    const svc = [...new Set([...Object.keys((H.services || {}).notify || {}).filter((n) => !["send_message", "reload", "persistent_notification"].includes(n)).sort().map((n) => "notify." + n), ...C.push.to])];
    const chip = (act, k, t, on) => `<button class="gsch ${on ? "sel" : ""}" data-act="${act}" data-k="${esc(k)}" aria-pressed="${!!on}">${t}</button>`;
    const BN = { rest: "Restmüll", bio: "Bio", papier: "Papier", gelb: "Gelber Sack" }, COL = { rest: "#78716c", bio: "#92400e", papier: "#3b82f6", gelb: "#eab308" };
    const cur = C.cal || S.cal || "";
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Müllabfuhr</b><span>Modul 17 · Labs · gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("today", 15)}Abfallkalender</div>
      ${this._wzSel(cals, cur, "muxsel", 'data-k="cal"', "– Kalender wählen –", /abfall|müll|waste|tonne|entsorg/i)}
      <div class="gst">${ic("info", 15)}<span>${C.cal ? "Gewählt." : cur ? "Automatisch erkannt (waste_collection_schedule)." : "Noch keiner gefunden."} Die Integration richtest du im <button class="lnk" data-act="muxstore">Store</button> ein.</span></div>
      <div class="lsec" style="margin-top:12px">${ic("trash", 15)}Tonnen</div>
      <div class="mut sm" style="margin:0 0 6px">Welche Tonnen du hast und woran Modul 17 sie im Kalendertitel erkennt. Mehrere Wörter mit Komma trennen.</div>
      ${Object.keys(BN).map((k) => `<div class="vrow"><span style="display:flex;align-items:center;gap:8px"><i class="bin sm" style="background:${COL[k]}"></i><b>${BN[k]}</b></span><input class="osel" type="text" data-f="muxmatch" data-k="${k}" value="${esc(C.bins[k].match)}" style="width:48%;flex:none;margin:0" aria-label="Erkennungswörter ${BN[k]}" ${adm ? "" : "disabled"}>${sw("bin:" + k, C.bins[k].on, BN[k])}</div>`).join("")}
      <div class="lsec" style="margin-top:12px">${ic("clock", 15)}Vorabend</div>
      <div class="vrow"><span>Uhrzeit<small class="mut" style="display:block">Ab dann gilt „morgen wird abgeholt“: Ampel, Nachricht, Ansage und Licht.</small></span><input class="osel" type="time" data-f="muxtime" value="${esc(C.time)}" style="width:auto;margin:0" aria-label="Uhrzeit am Vorabend" ${adm ? "" : "disabled"}></div>
      <div class="lsec" style="margin-top:12px">${ic("bell", 15)}Nachricht aufs Handy</div>
      <div class="vrow"><span>Am Vorabend erinnern<small class="mut" style="display:block">Eine Nachricht, wenn morgen eine Tonne abgeholt wird und sie noch nicht als draußen markiert ist.</small></span>${sw("push", C.push.on, "Nachricht aufs Handy")}</div>
      ${svc.length ? `<div class="gschips">${svc.map((n) => chip("muxns", n, esc(n), C.push.to.includes(n))).join("")}</div>` : `<div class="mut sm">Es wurde kein Benachrichtigungsdienst (notify.*) gefunden. Die Mobile App von Home Assistant legt einen an.</div>`}
      <div class="mut sm" style="margin:2px 0 6px">${C.push.to.length ? `Gesendet wird an: ${C.push.to.map(esc).join(", ")}.` : "Es ist noch kein Dienst gewählt."}</div>
      <div class="lsec" style="margin-top:12px">${ic("music", 15)}Ansage</div>
      <div class="vrow"><span>Sprachausgabe<small class="mut" style="display:block">Sagt die Erinnerung über einen Lautsprecher an. Im Text steht {tonnen} für die Tonnen.</small></span>${sw("tts", C.tts.on, "Ansage")}</div>
      ${C.tts.on ? `${this._wzSel(tts, C.tts.ent, "muxsel", 'data-k="tts_ent"', "– Sprachdienst (tts) wählen –", /cloud|piper|google|tts/i)}${this._wzSel(pl, C.tts.player, "muxsel", 'data-k="tts_player"', "– Lautsprecher wählen –", /flur|wohn|küche|speaker|echo|nest|sonos/i)}<input class="osel" type="text" data-f="muxtext" value="${esc(C.tts.text)}" style="margin:6px 0" aria-label="Text der Ansage" ${adm ? "" : "disabled"}>` : ""}
      <div class="lsec" style="margin-top:12px">${ic("lamp", 15)}Licht</div>
      <div class="vrow"><span>Licht in der Farbe der Tonne<small class="mut" style="display:block">Leuchtet ab der Vorabend-Uhrzeit, bis die Tonne als draußen markiert ist, und geht dann wieder aus.</small></span>${sw("light", C.light.on, "Licht")}</div>
      ${C.light.on ? this._wzSel(li, C.light.ent, "muxsel", 'data-k="light"', "– Licht wählen –", /flur|eingang|tür|tuer|diele/i) : ""}
      <div class="lsec" style="margin-top:12px">${ic("chart", 15)}Kosten</div>
      <div class="vrow"><span>Leerungen zählen<small class="mut" style="display:block">Zeigt Restmüll-Leerungen im Jahr und was darüber hinaus kostet.</small></span>${sw("cost", C.cost.on, "Kosten")}</div>
      ${C.cost.on ? `<div class="vrow"><span>Enthaltene Leerungen pro Jahr</span><input class="osel" type="number" inputmode="numeric" min="0" max="99" data-f="muxnum" data-k="incl" value="${C.cost.incl}" style="width:90px;margin:0" ${adm ? "" : "disabled"}></div><div class="vrow"><span>Gebühr je weitere Leerung (€)</span><input class="osel" type="number" inputmode="decimal" min="0" step="0.01" data-f="muxnum" data-k="fee" value="${C.cost.fee}" style="width:90px;margin:0" ${adm ? "" : "disabled"}></div>` : ""}
      <div class="lsec" style="margin-top:12px">${ic("alert", 15)}Hinweise</div>
      <div class="vrow"><span>Wetter-Hinweise<small class="mut" style="display:block">Warnt vor Sturm und Frost an Abholtagen. Nutzt Modul 9, falls eingeschaltet.</small></span>${sw("wx", C.wx, "Wetter-Hinweise")}</div>
      <div class="foot2" style="margin-top:12px"><button class="btn2" data-act="muxtest" ${C.push.to.length || C.tts.on ? "" : "disabled"}>${ic("bell", 16)} Test senden</button><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
