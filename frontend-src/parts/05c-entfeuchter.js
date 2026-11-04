  /* ================= Modul 1: Luftentfeuchter (Schritt 1: Gerät und Regelung, Schritt 2: Standort) =================
     Regelung im Backend (entfeuchter.py). Hier: Anzeige auf der Raumkarte des Standorts mit „Warum?“, Standortwahl
     über Raumkacheln, Einstellungen in Reitern ohne Aufklappmenüs, Zahlen mit Minus und Plus. */
  _lf() {
    const D = this._lfD;
    if ((!D || Date.now() - D.ts > 20000) && !this._lfBusy && this._hass) {
      this._lfBusy = true;
      this._hass.callWS({ type: "fenster_heizung/lf_get" }).then((r) => { this._lfD = { ...(r || {}), ts: Date.now() }; this._lfBusy = false; this._render(); if (this._modal && /^lf/.test(this._modal.type)) this._renderModal(); })
        .catch(() => { this._lfD = { cfg: { devs: [] }, live: {}, rooms: [], ts: Date.now(), err: true }; this._lfBusy = false; });
    }
    return D || null;
  }
  _lfDev() { const D = this._lf(); return D && D.cfg && D.cfg.devs && D.cfg.devs[0] && D.cfg.devs[0].ent ? D.cfg.devs[0] : null; }
  async _lfCmd(cmd, arg = "") {
    try { const r = await this._hass.callWS({ type: "fenster_heizung/lf_cmd", cmd, arg }); this._lfD = { ...r, ts: Date.now() }; this._render(); if (this._modal && /^lf/.test(this._modal.type)) this._renderModal(); }
    catch (e) { this._toast("Entfeuchter: " + ((e && e.message) || "Befehl fehlgeschlagen")); }
  }
  _lfState(L) {
    if (!L || !L.code) return ["off", "–"];
    if (L.on == null) return ["off", "nicht erreichbar"];
    if (L.running) return ["run", "läuft"];
    if (L.on) return ["run", "an"];
    return { full: ["warn", "Tank voll"], window: ["wait", "pausiert"], vent: ["wait", "lüften"], day_off: ["off", "heute aus"], no_hum: ["warn", "aus"], no_loc: ["off", "aus"] }[L.code] || ["off", "aus"];
  }
  _lfSince(ts) { if (!ts) return ""; const m = Math.max(0, Math.round((Date.now() / 1000 - ts) / 60)); return m < 60 ? `seit ${m} Min.` : `seit ${Math.floor(m / 60)} h ${m % 60} min`; }
  /* Kasten auf der Raumkarte des Standorts (Heizungsraum oder Messraum) */
  _lfBox(rid) {
    const D = this._lf(), dev = this._lfDev(); if (!D || !dev || D.loc !== rid) return "";
    const L = D.live || {}, [k, t] = this._lfState(L), adm = this._admin();
    const tank = L.fill != null ? `Tank ${Math.min(100, Math.round(L.fill * 100))} %` : L.full ? "Tank voll" : "";
    const sub = [L.on ? this._lfSince(L.since) : "", tank, L.today_min ? `heute ${hmin(L.today_min)}` : ""].filter(Boolean).join(" · ");
    return `<div class="lfbox ${k}"><div class="lfh"><span class="lfi">${ic("fan", 18)}</span><div class="lft"><b>${esc(dev.name)} <em class="lfhere">hier</em></b><span>${esc(sub || (dev.kind === "watch" ? "nur beobachten" : "Modul 1 regelt"))}</span></div><span class="lfst">${esc(t)}</span>${adm ? `<button class="ibtn" data-act="lfxset" aria-label="Entfeuchter einstellen">${ic("sliders", 16)}</button>` : ""}</div>
      ${L.fill != null ? `<div class="lfbar"><i style="width:${Math.min(100, Math.round(L.fill * 100))}%"></i></div>` : ""}
      <div class="lfwhy"><b>Warum?</b> ${esc((L.why || []).join(" "))}${L.hint ? `<br><span class="lfhint">${esc(L.hint)}</span>` : ""}</div>
      ${(() => { const A = D.ask || {}; if (!A.phase || A.phase === "off") return ""; const t = A.conf ? (A.how === "auto" ? "Standort heute wie gestern übernommen" : "Standort heute bestätigt") : A.phase === "wait" ? "Standort gilt wie gestern, die Abfrage kommt später" : "Standort heute noch nicht bestätigt"; return `<div class="lfconf ${A.conf ? "ok" : "open"}">${ic(A.conf ? "check" : "pin", 13)}${esc(t)}<button class="lnk" data-act="lfxhist">Verlauf</button></div>`; })()}
      <div class="lfbtns"><button class="btn2" data-act="lfxloc">${ic("pin", 15)} Standort ändern</button>${D.off_day ? `<button class="btn2" data-act="lfxon">${ic("check", 15)} Wieder regeln</button>` : `<button class="btn2" data-act="lfxoff">${ic("close", 15)} Heute aus</button>`}${L.full || (L.fill != null && L.fill > 0.05) ? `<button class="btn2" data-act="lfxtank">${ic("drop", 15)} Tank geleert</button>` : ""}</div></div>`;
  }
  /* Standort-Karte (Schritt 2, Vorschlag 2): erscheint ohne Standort oder ab der Uhrzeit der Abfrage, bis der Tag bestätigt ist */
  _lfLocCard() {
    const D = this._lf(), dev = this._lfDev(); if (!D || !dev) return "";
    const R = D.rooms || [], A = D.ask || {}, hasLoc = D.loc && R.some((r) => r.id === D.loc), due = A.phase === "open" || A.phase === "missed";
    if (hasLoc && !due) { this._lfPick = null; return ""; }
    const offer = R.filter((r) => !(A.offer || []).length || A.offer.includes(r.id)), list = offer.length ? offer : R;
    const pick = list.some((r) => r.id === this._lfPick) ? this._lfPick : hasLoc && list.some((r) => r.id === D.loc) ? D.loc : (list.find((r) => r.id === A.yest) || list[0] || {}).id;
    const pn = (R.find((r) => r.id === pick) || {}).name || "";
    const day = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
    const state = A.how === "pause" ? `<span class="lfst2 warn">Pausiert, bis du den Standort bestätigst.</span>` : A.how === "hint" ? `<span class="lfst2 warn">Noch nicht bestätigt. Er läuft wie gestern.</span>` : D.off_day ? `<span class="lfst2">Heute nicht in Betrieb.</span>` : !hasLoc ? `<span class="lfst2">Ohne Standort bleibt er aus.</span>` : "";
    const tiles = list.length ? `<div class="lftiles">${list.map((r) => `<button class="lftile ${pick === r.id ? "sel" : ""}" data-act="lfxsel" data-k="${esc(r.id)}" aria-pressed="${pick === r.id}"><b>${esc(r.name)}${pick === r.id ? `<i class="lfok">${ic("check", 13)}</i>` : ""}</b><span class="${r.hum != null && r.hum > (dev.hi || 60) ? "amber" : ""}">Luftfeuchte ${r.hum != null ? num(r.hum, 0) + " %" : "–"}</span></button>`).join("")}</div>`
      : `<div class="mut sm">Kein Raum mit Luftfeuchte-Sensor gefunden. Wähle in den Raumeinstellungen einen Luftfeuchte-Sensor oder lege einen Messraum an.</div>`;
    return `<div class="card lfloc"><div class="lfh"><span class="lfi">${ic("fan", 18)}</span><div class="lft"><b>Wo steht der ${esc(dev.name)} heute?</b><span>${esc(day)}</span></div></div>
      ${tiles}<div class="lfmeta">${A.yest_name ? `Gestern: <b>${esc(A.yest_name)}</b>` : "Gestern: noch kein Eintrag"}${state}</div>
      <div class="lfbtns lfbig">${pick ? `<button class="btn2 pri" data-act="lfxconf" data-k="${esc(pick)}">${ic("check", 16)} Bestätigen: ${esc(pn)}</button>` : ""}<button class="btn2" data-act="lfxoff">Heute nicht in Betrieb</button><button class="btn2" data-act="lfxhist">Verlauf ansehen</button></div></div>`;
  }
  /* Standortverlauf der letzten 14 Tage */
  _lfHistModal() {
    const D = this._lf() || {}, H = D.hist || [], dev = this._lfDev() || { name: "Luftentfeuchter" };
    const how = { ok: ["ok", "bestätigt"], auto: ["", "wie gestern übernommen"], pause: ["warn", "ohne Antwort pausiert"], hint: ["warn", "ohne Antwort, lief wie gestern"], "": ["", "nicht bestätigt"] };
    const cnt = {}; H.forEach((x) => { if (x.l) cnt[x.name || x.l] = (cnt[x.name || x.l] || 0) + 1; });
    const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]), mx = Math.max(1, ...top.map((x) => x[1]));
    const rows = H.map((x, i) => { const d = new Date(x.d + "T12:00:00"), lbl = i === 0 ? "Heute" : i === 1 ? "Gestern" : d.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" }), hw = how[x.h] || how[""];
      return `<div class="lfhr"><span class="lfhd">${esc(lbl)}</span><b class="${x.l === "off" ? "mut" : ""}">${x.l ? esc(x.name || "Raum gelöscht") : `<span class="mut">kein Eintrag</span>`}</b><span class="lfhh ${hw[0]}">${x.l ? esc(hw[1]) : ""}</span><span class="lfhm">${x.min ? hmin(x.min) : ""}</span></div>`; }).join("");
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Standortverlauf</b><span>${esc(dev.name)} · letzte 14 Tage</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      ${top.length ? `<div class="lsec">${ic("chart", 15)}Tage pro Raum</div><div class="lfdays">${top.map(([n, c]) => `<div><span>${esc(n)}</span><i style="width:${(c / mx) * 100}%" class="${n === "nicht in Betrieb" ? "off" : ""}"></i><b>${c} ${c === 1 ? "Tag" : "Tage"}</b></div>`).join("")}</div>` : ""}
      <div class="lsec">${ic("today", 15)}Tag für Tag</div><div class="lfhist">${rows}</div>
      <div class="mut sm" style="margin:8px 0 0">Rechts die Laufzeit des Tages. Ausführliche Statistik mit Strom und Kosten folgt in einem späteren Schritt.</div>
      <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _lfTiles(D) {
    const R = D.rooms || [], dev = (D.cfg.devs || [])[0] || {};
    if (!R.length) return `<div class="mut sm">Kein Raum mit Luftfeuchte-Sensor gefunden. Wähle in den Raumeinstellungen einen Luftfeuchte-Sensor oder lege einen Messraum an.</div>`;
    return `<div class="lftiles">${R.map((r) => `<button class="lftile ${D.loc === r.id ? "sel" : ""}" data-act="lfxpick" data-k="${esc(r.id)}"><b>${esc(r.name)}${D.loc === r.id ? ic("check", 15) : ""}</b><span class="${r.hum != null && r.hum > (dev.hi || 60) ? "amber" : ""}">Luftfeuchte ${r.hum != null ? num(r.hum, 0) + " %" : "–"}${r.ms ? " · Messraum" : ""}</span></button>`).join("")}</div>
      <div class="lfbtns"><button class="btn2" data-act="${D.off_day ? "lfxon" : "lfxoff"}">${D.off_day ? "Heute wieder in Betrieb" : "Heute nicht in Betrieb"}</button></div>`;
  }
  _lfLocModal() {
    const D = this._lf() || { rooms: [], cfg: { devs: [] } }, dev = (D.cfg.devs || [])[0] || { name: "Luftentfeuchter" };
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Wo steht der ${esc(dev.name)}?</b><span>Modul 1 regelt mit Luftfeuchte und Fenstern dieses Raums</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      ${this._lfTiles(D)}<div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  /* Einstellungen: Reiter Gerät, Zielwerte, Standort */
  _lfSetOpen() {
    const D = this._lf(), d0 = (D && D.cfg && D.cfg.devs && D.cfg.devs[0]) || null;
    this._pkId = null;
    this._modal = { type: "lfset", tab: d0 && d0.ent ? "ziel" : "geraet", draft: { id: "d1", name: "Luftentfeuchter", kind: "entity", ent: "", power: "", run_w: 20, tank: "", cap_l: 0, lph: 0, hi: 60, lo: 55, hi_away: 65, minrun: 15, lock: 10, vent: false, ...(d0 || {}), ask: { on: true, time: "08:00", home_only: true, until: "12:00", miss: "same", rooms: [], push: [], ...((d0 && d0.ask) || {}) } } };
    this._renderModal();
  }
  _lfSetModal() {
    const M = this._modal, d = M.draft, st = this._hass.states, ks = Object.keys(st), D = this._lf() || {};
    const tabs = [["geraet", "Gerät"], ["ziel", "Zielwerte"], ["ort", "Standort"]];
    const step = (k, unit, s, lo, hi, dec = 0) => `<div class="lfstep"><button class="ibtn" data-act="lfxstep" data-k="${k}" data-d="${-s}" data-lo="${lo}" data-hi="${hi}" aria-label="weniger">${ic("minus", 16)}</button><b>${num(d[k], dec)}<small> ${unit}</small></b><button class="ibtn" data-act="lfxstep" data-k="${k}" data-d="${s}" data-lo="${lo}" data-hi="${hi}" aria-label="mehr">${ic("plus", 16)}</button></div>`;
    const row = (l, h, ctl) => `<div class="of"><div class="ol"><b>${l}</b>${h ? `<small>${h}</small>` : ""}</div><div class="oc">${ctl}</div></div>`;
    const seg = (k, opts) => `<div class="seg">${opts.map(([v, l]) => `<button class="${d[k] === v ? "sel" : ""}" data-act="lfxseg" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`;
    let body = "";
    if (M.tab === "geraet") {
      const dom = d.kind === "plug" ? ["switch."] : ["humidifier.", "switch.", "fan.", "input_boolean."];
      const devs = ks.filter((e) => dom.some((p) => e.startsWith(p)));
      const pw = ks.filter((e) => e.startsWith("sensor.") && (st[e].attributes.device_class === "power" || /^k?W$/.test(st[e].attributes.unit_of_measurement || "")));
      const tk = ks.filter((e) => (e.startsWith("binary_sensor.") || e.startsWith("sensor.")) && /tank|wasser|water|bucket|voll|full/i.test(e + " " + (st[e].attributes.friendly_name || "")));
      body = `<div class="lsec">${ic("fan", 15)}Art des Geräts</div>
        <div class="lfkind">${[["entity", "Eigene Entität", "Smarter Entfeuchter in Home Assistant (humidifier, Schalter)."], ["plug", "Schaltsteckdose", "Normaler Entfeuchter an einer Steckdose, am Gerät auf Dauerbetrieb."], ["watch", "Nur beobachten", "Gerät mit eigenem Hygrostat. Modul 1 zeigt an, schaltet aber nicht."]].map(([v, l, h]) => `<button class="${d.kind === v ? "sel" : ""}" data-act="lfxseg" data-k="kind" data-v="${v}"><b>${l}</b><span>${h}</span></button>`).join("")}</div>
        <div class="lsec">${ic("pencil", 15)}Name</div><input class="otxt" type="text" maxlength="30" data-f="lfxname" value="${esc(d.name)}" aria-label="Name des Entfeuchters">
        <div class="lsec">${ic("bolt", 15)}Gerät und Sensoren</div>
        ${row(d.kind === "plug" ? "Schaltsteckdose" : "Entfeuchter", d.kind === "plug" ? "switch.*" : "humidifier.*, Schalter oder Lüfter", this._wzSel(devs, d.ent, "lfxe", `data-k="ent"`, "– Gerät wählen –", /entfeucht|dehumid|humid|trockn/i))}
        ${row("Leistung", "optional, zeigt ob er wirklich läuft", this._wzSel(pw, d.power, "lfxe", `data-k="power"`, "– keine –", /entfeucht|dehumid|steckdose|plug/i))}
        ${d.power ? row("Läuft ab", "darunter gilt er als aus", step("run_w", "W", 5, 1, 500)) : ""}
        ${row("Wassertank-Sensor", "optional, meldet „voll“", this._wzSel(tk, d.tank, "lfxe", `data-k="tank"`, "– keiner –", /tank|voll|full/i))}
        ${!d.tank ? `<div class="mut sm" style="margin:6px 0 2px">Ohne Tank-Sensor schätzt Modul 1 die Füllung aus der Laufzeit. 0 = keine Schätzung.</div>${row("Tankinhalt", "", step("cap_l", "l", 0.5, 0, 50, 1))}${row("Entfeuchtung", "pro Stunde Betrieb", step("lph", "l/h", 0.05, 0, 10, 2))}` : ""}
        ${d.kind === "plug" ? `<div class="gst">${ic("info", 15)}<div>Das Gerät muss auf Dauerbetrieb stehen und nach einer Stromunterbrechung von selbst wieder anlaufen. Bitte am Gerät prüfen. Die Steckdose muss für die Leistung des Geräts ausgelegt sein.</div></div>` : ""}`;
    } else if (M.tab === "ziel") {
      body = `<div class="lsec">${ic("drop", 15)}Zielfeuchte</div>
        ${row("Einschalten über", "Obergrenze", step("hi", "%", 1, 35, 90))}
        ${row("Ausschalten bei", "Untergrenze", step("lo", "%", 1, 30, 85))}
        ${row("Bei Abwesenheit oder Urlaub", "Einschalten über (nur Schutz vor Schimmel)", step("hi_away", "%", 1, 35, 95))}
        <div class="lsec">${ic("clock", 15)}Gegen ständiges Schalten</div>
        ${row("Mindestlaufzeit", "", step("minrun", "Min.", 5, 0, 120))}
        ${row("Sperrzeit nach dem Ausschalten", "", step("lock", "Min.", 5, 0, 120))}
        <div class="lsec">${ic("windy", 15)}Lüften vor Entfeuchten</div>
        <div class="mut sm" style="margin:-2px 0 6px">Ist die Luft draußen trockener, bleibt der Entfeuchter aus und Modul 1 empfiehlt Lüften. Im Winter ist das oft der Fall, deshalb ab Werk aus.</div>
        ${seg("vent", [[false, "Aus"], [true, "Ein"]])}
        <div class="gst">${ic("window", 15)}<div>Bei offenem Fenster im Raum des Standorts bleibt der Entfeuchter immer aus.</div></div>`;
    } else {
      const a = d.ask, R = D.rooms || [], svc = Object.keys((this._hass.services || {}).notify || {}).filter((n) => !["send_message", "persistent_notification", "reload"].includes(n)).sort((x, y) => Number(y.startsWith("mobile_app")) - Number(x.startsWith("mobile_app")) || x.localeCompare(y)).map((n) => "notify." + n);
      const pushAll = [...new Set([...svc, ...a.push])];
      const chips = (arr, sel, act, lbl) => `<div class="lfchips">${arr.map((v) => `<button class="${sel.includes(v) ? "sel" : ""}" data-act="${act}" data-k="${esc(v)}" aria-pressed="${sel.includes(v)}">${esc(lbl(v))}</button>`).join("")}</div>`;
      const aseg = (k, opts) => `<div class="seg">${opts.map(([v, l]) => `<button class="${a[k] === v ? "sel" : ""}" data-act="lfxaseg" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`;
      body = `<div class="lsec">${ic("today", 15)}Tägliche Standortabfrage</div>
        <div class="mut sm" style="margin:-2px 0 6px">Einmal am Tag wird bestätigt, in welchem Raum der Entfeuchter steht. Bis dahin gilt der Raum von gestern.</div>
        ${aseg("on", [[true, "Ein"], [false, "Aus"]])}
        ${a.on ? `${row("Uhrzeit der Abfrage", "Ab dann erscheint die Standort-Karte", `<input class="otxt lftime" type="time" data-f="lfxt" data-k="time" value="${esc(a.time)}" aria-label="Uhrzeit der Abfrage">`)}
        <div class="mut sm" style="margin:8px 0 4px">Abfrage am Handy nur, wenn jemand zu Hause ist</div>${aseg("home_only", [[true, "Ja"], [false, "Nein"]])}
        ${row("Ohne Antwort bis", "Danach gilt die Wahl darunter", `<input class="otxt lftime" type="time" data-f="lfxt" data-k="until" value="${esc(a.until)}" aria-label="Frist für die Antwort">`)}
        ${aseg("miss", [["same", "Wie gestern"], ["pause", "Pausieren"], ["hint", "Nur Hinweis"]])}
        <div class="mut sm" style="margin:4px 0 0">${{ same: "Der Raum von gestern wird für heute übernommen.", pause: "Der Entfeuchter bleibt aus, bis jemand den Standort bestätigt.", hint: "Er läuft wie gestern weiter, die Karte erinnert weiter." }[a.miss]}</div>
        <div class="lsec">${ic("home", 15)}Räume zur Auswahl (je ein Antippen)</div>
        ${R.length ? chips(R.map((r) => r.id), a.rooms.length ? a.rooms : R.map((r) => r.id), "lfxroom", (v) => (R.find((r) => r.id === v) || {}).name || v) : `<div class="mut sm">Kein Raum mit Luftfeuchte-Sensor gefunden.</div>`}
        <div class="mut sm" style="margin:2px 0 0">Alle markiert = alle Räume mit Luftfeuchte-Sensor, auch neue.</div>
        <div class="lsec">${ic("bell", 15)}Erinnerung am Handy</div>
        <div class="mut sm" style="margin:-2px 0 6px">Benachrichtigung mit Tasten für bis zu drei Räume: zuerst der von gestern, dann die meistgenutzten. Ein Tipp auf die Nachricht öffnet das Dashboard.</div>
        ${pushAll.length ? chips(pushAll, a.push, "lfxpush", (v) => v.replace(/^notify\.(mobile_app_)?/, "").replace(/_/g, " ")) : `<div class="mut sm">Kein Benachrichtigungsdienst gefunden. Mit der Home-Assistant-App am Handy gibt es „mobile_app“-Dienste.</div>`}
        ${a.push.length ? `<button class="lnk" data-act="lfxtest" style="margin:6px 0 0">${ic("bell", 14)} Jetzt eine Test-Abfrage senden</button>` : ""}` : ""}
        <div class="lsec">${ic("pin", 15)}Standort jetzt</div>${this._lfTiles(D)}`;
    }
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Luftentfeuchter</b><span>Modul 1 · gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="seg lftabs">${tabs.map(([k, l]) => `<button class="${M.tab === k ? "sel" : ""}" data-act="lfxtab" data-k="${k}">${l}</button>`).join("")}</div>
      ${body}${M.err ? `<div class="gst on">${ic("alert", 15)}<div>${esc(M.err)}</div></div>` : ""}
      <div class="foot2">${d.ent ? `<button class="btn2" data-act="lfxdel">Entfernen</button>` : `<button class="btn2" data-act="close">Abbrechen</button>`}<button class="btn2 pri" data-act="lfxsave">Speichern</button></div></div>`;
  }
  _lfChange(t) {
    const M = this._modal; if (!M || M.type !== "lfset") return false;
    if (t.dataset.f === "lfxname") { M.draft.name = t.value; return true; }
    if (t.dataset.f === "lfxe") { M.draft[t.dataset.k] = t.value || ""; return true; }
    if (t.dataset.f === "lfxt") { if (/^\d\d:\d\d$/.test(t.value)) M.draft.ask[t.dataset.k] = t.value; return true; }
    return false;
  }
  async _lfSave(devs) {
    try { const r = await this._hass.callWS({ type: "fenster_heizung/lf_set", cfg: { devs } }); this._lfD = { ...r, ts: Date.now() }; this._modal = null; this._renderModal(); this._render(); this._toast(devs.length ? "Entfeuchter gespeichert" : "Entfeuchter entfernt"); }
    catch (e) { this._toast("Speichern fehlgeschlagen"); }
  }
  _lfAct(a, b) {
    const M = this._modal;
    if (a === "lfxset") { this._lfSetOpen(); return; }
    if (a === "lfxloc") { this._modal = { type: "lfloc" }; this._renderModal(); return; }
    if (a === "lfxpick") { this._lfCmd("loc", b.dataset.k); if (M && M.type === "lfloc") { this._modal = null; this._renderModal(); } return; }
    if (a === "lfxoff") { this._lfCmd("off_today"); return; }
    if (a === "lfxon") { this._lfCmd("on_today"); return; }
    if (a === "lfxsel") { this._lfPick = b.dataset.k; this._render(); return; }
    if (a === "lfxconf") { this._lfPick = null; this._lfCmd("loc", b.dataset.k); this._toast("Standort für heute bestätigt"); return; }
    if (a === "lfxhist") { this._modal = { type: "lfhist" }; this._renderModal(); return; }
    if (a === "lfxtest") { this._hass.callWS({ type: "fenster_heizung/lf_cmd", cmd: "ask_test" }).then((r) => this._toast(r && r.test_sent ? `Test-Abfrage an ${r.test_sent} ${r.test_sent === 1 ? "Handy" : "Handys"} gesendet` : "Nicht gesendet: erst speichern, dann testen")).catch(() => this._toast("Test fehlgeschlagen")); return; }
    if (a === "lfxtank") { this._lfCmd("tank_empty"); this._toast("Tank als geleert vermerkt"); return; }
    if (!M || M.type !== "lfset") return;
    const d = M.draft;
    if (a === "lfxtab") { M.tab = b.dataset.k; this._pkId = null; this._renderModal(); }
    else if (a === "lfxseg") { const v = b.dataset.v; d[b.dataset.k] = v === "true" ? true : v === "false" ? false : v; if (b.dataset.k === "kind" && v === "plug" && d.ent && !d.ent.startsWith("switch.")) d.ent = ""; this._renderModal(); }
    else if (a === "lfxaseg") { const v = b.dataset.v; d.ask[b.dataset.k] = v === "true" ? true : v === "false" ? false : v; this._renderModal(); }
    else if (a === "lfxroom") { const all = (this._lf() || {}).rooms.map((r) => r.id), cur = d.ask.rooms.length ? [...d.ask.rooms] : [...all], k = b.dataset.k, i = cur.indexOf(k); if (i >= 0) cur.splice(i, 1); else cur.push(k); d.ask.rooms = cur.length === all.length || !cur.length ? [] : cur; this._renderModal(); }
    else if (a === "lfxpush") { const k = b.dataset.k, cur = [...d.ask.push], i = cur.indexOf(k); if (i >= 0) cur.splice(i, 1); else cur.push(k); d.ask.push = cur; this._renderModal(); }
    else if (a === "lfxstep") { const k = b.dataset.k, s = parseFloat(b.dataset.d); d[k] = Math.round(Math.min(parseFloat(b.dataset.hi), Math.max(parseFloat(b.dataset.lo), (Number(d[k]) || 0) + s)) * 100) / 100; this._renderModal(); }
    else if (a === "lfxdel") { this._lfSave([]); }
    else if (a === "lfxsave") {
      M.err = !d.ent ? "Bitte das Gerät wählen (Reiter „Gerät“)." : d.lo >= d.hi ? "Die Untergrenze muss unter der Obergrenze liegen." : "";
      if (M.err) { this._renderModal(); return; }
      this._lfSave([{ ...d, name: String(d.name || "").trim() || "Luftentfeuchter" }]);
    }
  }
