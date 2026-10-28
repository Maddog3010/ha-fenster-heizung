  /* Lab „Tags & Karten“ (tg): RFID-Karten und NFC-Sticker lösen feste Aktionen aus. Die Tags und ihre Aktionen liegen im Backend (tags.py),
     hier stehen nur Anzeige und Bedienung. Es gibt keine freien Dienstaufrufe, nur die feste Liste des Backends. */
  _tgxLoad(force) {
    if (!this._hass || this._tgxBusy) return;
    if (!force && this._tgxD && Date.now() - this._tgxTs < 20000) return;
    this._tgxBusy = true;
    this._hass.callWS({ type: "fenster_heizung/tg_get" }).then((r) => { this._tgxD = r; this._tgxTs = Date.now(); }).catch(() => {})
      .finally(() => { this._tgxBusy = false; this._tgxRefresh(); });
  }
  _tgxIs() { const m = this._modal; return !!(m && ["tgxmgr", "tgxedit", "tgxfb"].includes(m.type)); }
  _tgxRefresh() { if (this._tgxIs() && this._modal.type === "tgxmgr") { this._renderModal(); this._tgxPoll(); } }
  _tgxPoll() {
    clearTimeout(this._tgxT);
    const D = this._tgxD;
    if (D && D.learn && D.learn.active && this._modal && this._modal.type === "tgxmgr") this._tgxT = setTimeout(() => this._tgxLoad(true), 1500);
  }
  _tgxPut(cfg) {
    return this._hass.callWS({ type: "fenster_heizung/tg_set", cfg }).then((r) => { this._tgxD = r; this._tgxTs = Date.now(); }).catch(() => this._toast("Das hat nicht geklappt"));
  }
  _tgxCall(act, tid) {
    return this._hass.callWS({ type: "fenster_heizung/tg_act", act, tid: tid || "" }).then((r) => { this._tgxD = r; this._tgxTs = Date.now(); return r; }).catch(() => { this._toast("Das hat nicht geklappt"); return null; });
  }
  _tgxWhen(ts) {
    const d = new Date(ts * 1000), n = new Date(), hm = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    if (d.toDateString() === n.toDateString()) return "Heute " + hm;
    const y = new Date(n.getTime() - 864e5); return (d.toDateString() === y.toDateString() ? "Gestern " : d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }) + " ") + hm;
  }
  _tgxPerson(id) { const s = this._hass.states[id]; return s && s.attributes && s.attributes.friendly_name ? s.attributes.friendly_name : String(id || "").replace("person.", ""); }
  _tgxDesc(a) {
    const D = this._tgxD, c = D && D.actions.find((x) => x.k === a.k); if (!c) return "Unbekannte Aktion";
    if (a.k === "pres_vac") return `Urlaub für ${a.arg} ${a.arg === 1 ? "Tag" : "Tage"}`;
    if (a.k === "person_home" || a.k === "person_away") return `${this._tgxPerson(a.arg)} ist ${a.k === "person_home" ? "zu Hause" : "unterwegs"}`;
    if (a.k === "mu_done") return `${(D.bins || {})[a.arg] || "Tonne"} ist draußen`;
    return c.n;
  }
  _tgxIcon(a) { const g = (this._tgxD.actions.find((x) => x.k === a.k) || {}).g; return { fh: "home", pe: "user", ww: "drop", ev: "car", mu: "trash", li: "lamp" }[g] || "nfc"; }
  _tgxNeed(k) {
    const g = ((this._tgxD.actions.find((x) => x.k === k)) || {}).g;
    if (g === "li" && !this._labOn("li")) return "Modul 18 ist nicht eingeschaltet (Labs).";
    if (g === "mu" && !this._labOn("mm")) return "Modul 17 ist nicht eingeschaltet (Labs).";
    return "";
  }
  _tgxCfgNow() { const c = this._tgxD.cfg; return { tags: { ...c.tags }, fb: { ...c.fb } }; }
  _tgxBlank(id) { return { id, isNew: true, name: "", on: true, act: { k: "", arg: null }, persons: [], fb: { notify: false, tts: false, blink: false }, from: "", to: "", g: "" }; }
  _tgxAct(a, b) {
    const k = b.dataset.k, D = this._tgxD, m = this._modal;
    if (a === "tgxopen") { this._modal = { type: "tgxmgr" }; this._tgxLoad(true); this._renderModal(); return; }
    if (!D && a !== "tgxopen") return;
    if (a === "tgxback") { clearTimeout(this._tgxT); this._modal = { type: "tgxmgr" }; this._renderModal(); this._tgxPoll(); return; }
    if (a === "tgxlearn") { this._tgxCall("learn").then(() => { this._renderModal(); this._tgxPoll(); }); return; }
    if (a === "tgxstop") { clearTimeout(this._tgxT); this._tgxCall("stop").then(() => this._renderModal()); return; }
    if (a === "tgxnew") { clearTimeout(this._tgxT); const f = D.learn && D.learn.found; this._tgxCall("stop"); const t = f && D.cfg.tags[f.id]; this._modal = { type: "tgxedit", draft: t ? { ...t, id: f.id, isNew: false, g: (D.actions.find((x) => x.k === t.act.k) || {}).g || "" } : this._tgxBlank(f ? f.id : k) }; this._renderModal(); return; }
    if (a === "tgxedit") { clearTimeout(this._tgxT); const t = D.cfg.tags[k]; if (!t) return; this._modal = { type: "tgxedit", draft: { ...t, id: k, isNew: false, g: (D.actions.find((x) => x.k === t.act.k) || {}).g || "" } }; this._renderModal(); return; }
    if (a === "tgxfb") { clearTimeout(this._tgxT); this._modal = { type: "tgxfb" }; this._renderModal(); return; }
    if (a === "tgxforget") { this._tgxCall("forget", k).then(() => this._renderModal()); return; }
    if (a === "tgxtog") { const c = this._tgxCfgNow(), t = c.tags[k]; if (!t) return; c.tags[k] = { ...t, on: !t.on }; this._tgxPut(c).then(() => this._renderModal()); return; }
    if (a === "tgxfbn") { const c = this._tgxCfgNow(), l = c.fb.notify || []; c.fb = { ...c.fb, notify: l.includes(k) ? l.filter((x) => x !== k) : [...l, k] }; this._tgxPut(c).then(() => this._renderModal()); return; }
    if (!m || m.type !== "tgxedit") return;
    const d = m.draft;
    if (a === "tgxg") { d.g = k; if (!D.actions.some((x) => x.g === k && x.k === d.act.k)) d.act = { k: "", arg: null }; }
    else if (a === "tgxa") { const c = D.actions.find((x) => x.k === k); d.act = { k, arg: c.arg === "days" ? 7 : c.arg === "bin" ? "rest" : c.arg === "person" ? "" : null }; }
    else if (a === "tgxdays") d.act.arg = Math.min(21, Math.max(1, (d.act.arg || 7) + Number(b.dataset.s)));
    else if (a === "tgxbin") d.act.arg = k;
    else if (a === "tgxwho") d.persons = d.persons.includes(k) ? d.persons.filter((x) => x !== k) : [...d.persons, k];
    else if (a === "tgxfbt") d.fb[k] = !d.fb[k];
    else if (a === "tgxwclr") { d.from = ""; d.to = ""; }
    else if (a === "tgxsave") {
      if (!d.act.k || (d.act.k.startsWith("person_") && !d.act.arg)) { this._toast("Bitte eine Aktion wählen"); return; }
      const c = this._tgxCfgNow(), { id, isNew, g, ...t } = d; t.name = (d.name || "").trim() || "Tag"; t.from = d.from && d.to ? d.from : ""; t.to = d.from && d.to ? d.to : "";
      c.tags[id] = t; this._tgxPut(c).then(() => { this._modal = { type: "tgxmgr" }; this._renderModal(); this._tgxPoll(); this._toast("Tag gespeichert"); }); return;
    }
    else if (a === "tgxtest") {
      if (!d.act.k || d.isNew) { this._toast(d.isNew ? "Erst speichern, dann testen" : "Bitte eine Aktion wählen"); return; }
      this._tgxCall("test", d.id).then((r) => this._toast(r && r.test ? r.test.msg : "Das hat nicht geklappt")); return;
    }
    else if (a === "tgxdel") { const c = this._tgxCfgNow(); delete c.tags[d.id]; this._tgxPut(c).then(() => { this._modal = { type: "tgxmgr" }; this._renderModal(); this._toast("Tag gelöscht"); }); return; }
    this._renderModal();
  }
  _tgxChange(t) {
    const f = t.dataset.f, v = t.value || "", m = this._modal;
    if (f === "tgxname" && m && m.draft) { m.draft.name = v.slice(0, 40); return true; }
    if (f === "tgxfrom" && m && m.draft) { m.draft.from = v; if (m.draft.from && !m.draft.to) m.draft.to = "23:59"; return true; }
    if (f === "tgxto" && m && m.draft) { m.draft.to = v; if (m.draft.to && !m.draft.from) m.draft.from = "00:00"; return true; }
    if (f === "tgxperson" && m && m.draft) { m.draft.act.arg = /^person\.[a-z0-9_]+$/.test(v) ? v : ""; this._renderModal(); return true; }
    if (f === "tgxtts" || f === "tgxplayer" || f === "tgxlight") {
      const c = this._tgxCfgNow(), ok = v === "" || /^[a-z_]+\.[a-z0-9_]+$/.test(v);
      if (!ok) return true;
      c.fb = { ...c.fb, tts: { ...c.fb.tts }, ...(f === "tgxlight" ? { light: v } : {}) };
      if (f === "tgxtts") c.fb.tts.ent = v; if (f === "tgxplayer") c.fb.tts.player = v;
      this._tgxPut(c).then(() => this._renderModal()); return true;
    }
    return false;
  }
  _tgxModal() {
    const m = this._modal, D = this._tgxD, adm = this._admin();
    const hd = (t, s, back) => `<div class="sh"><div><b>${t}</b><span>${s}</span></div><button class="ibtn" data-act="${back ? "tgxback" : "close"}" aria-label="${back ? "Zurück" : "Schließen"}">${ic(back ? "back" : "close", 20)}</button></div>`;
    if (!D) return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">${hd("Tags & Karten", "Labs · lädt …")}<div class="mut sm">Die Tags werden geladen.</div></div>`;
    if (m.type === "tgxfb") {
      const F = D.cfg.fb, st = this._hass.states, ids = (p) => Object.keys(st).filter((e) => e.startsWith(p)), svc = Object.keys((this._hass.services || {}).notify || {}).filter((x) => x !== "notify" && x !== "send_message").map((x) => "notify." + x);
      return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">${hd("Rückmeldung einrichten", "Tags & Karten · gilt für alle Tags", true)}
        <div class="mut sm" style="margin:0 0 6px">Hier legst du fest, wohin die Rückmeldung geht. Pro Tag schaltest du dann ein, ob sie kommt.</div>
        <div class="lsec">${ic("bell", 15)}Handy-Nachricht</div>
        <div class="gschips">${svc.length ? svc.map((s) => `<button class="gsch ${F.notify.includes(s) ? "sel" : ""}" data-act="tgxfbn" data-k="${esc(s)}" aria-pressed="${F.notify.includes(s)}" ${adm ? "" : "disabled"}>${esc(s.replace("notify.", ""))}</button>`).join("") : `<span class="mut sm">Es gibt keine Benachrichtigungsdienste (notify).</span>`}</div>
        <div class="lsec" style="margin-top:12px">${ic("tv", 15)}Ansage</div>
        <div class="vrow"><span>Sprachdienst</span>${this._wzSel(ids("tts."), F.tts.ent, "tgxtts", "", "– nicht gewählt –")}</div>
        <div class="vrow"><span>Lautsprecher</span>${this._wzSel(ids("media_player."), F.tts.player, "tgxplayer", "", "– nicht gewählt –")}</div>
        <div class="lsec" style="margin-top:12px">${ic("lamp", 15)}Licht blinkt</div>
        <div class="mut sm" style="margin:0 0 4px">Blinkt kurz grün, bei einem Fehler rot.</div>
        <div class="vrow"><span>Lampe</span>${this._wzSel(ids("light.").filter((e) => !Array.isArray((st[e].attributes || {}).entity_id)), F.light, "tgxlight", "", "– nicht gewählt –")}</div>
        <div class="foot2" style="margin-top:12px"><button class="btn2 pri" data-act="tgxback">Fertig</button></div></div>`;
    }
    if (m.type === "tgxedit") {
      const d = m.draft, A = D.actions, gs = Object.keys(D.groups), cur = A.find((x) => x.k === d.act.k), fb = D.cfg.fb;
      const persons = Object.keys(this._hass.states).filter((e) => e.startsWith("person."));
      const chip = (act, k, label, on, extra = "") => `<button class="gsch ${on ? "sel" : ""}" data-act="${act}" data-k="${esc(k)}" aria-pressed="${on}" ${extra}>${esc(label)}</button>`;
      const need = d.act.k ? this._tgxNeed(d.act.k) : "";
      const arg = !cur ? "" : cur.arg === "days" ? `<div class="vrow"><span>Dauer</span><div class="step" style="flex:none"><button data-act="tgxdays" data-s="-1" aria-label="weniger">${ic("minus", 18)}</button><b>${d.act.arg} ${d.act.arg === 1 ? "Tag" : "Tage"}</b><button data-act="tgxdays" data-s="1" aria-label="mehr">${ic("plus", 18)}</button></div></div>`
        : cur.arg === "bin" ? `<div class="gschips" style="margin:6px 0">${Object.entries(D.bins).map(([k, n]) => chip("tgxbin", k, n, d.act.arg === k)).join("")}</div>`
        : cur.arg === "person" ? `<div style="margin:6px 0">${this._wzSel(persons, d.act.arg || "", "tgxperson", "", "– Person wählen –")}</div><div class="mut sm">${d.act.k === "person_home" ? "Zählt für die automatische Abwesenheit als „zu Hause“, höchstens 12 Stunden." : "Gilt als „unterwegs“. Sind alle unterwegs, wechseln die Räume nach der eingestellten Zeit auf „Abwesend“."}</div>` : "";
      const fbk = (k, t, ok, why) => chip("tgxfbt", k, t, !!d.fb[k] && ok, ok ? "" : `disabled title="${esc(why)}"`);
      return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">${hd(d.isNew ? "Neuen Tag einrichten" : "Tag bearbeiten", `${esc(d.name || "Tag")} · gilt für alle Nutzer`, true)}
        <div class="vrow"><span>Name<small class="mut" style="display:block">Zum Beispiel „Nachttisch-Sticker“</small></span><input type="text" data-f="tgxname" value="${esc(d.name)}" maxlength="40" placeholder="Name" aria-label="Name" style="flex:1;max-width:55%;background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:10px;font:inherit"></div>
        <div class="mut sm" style="margin:0 0 6px">Kennung: <code>${esc(d.id)}</code></div>
        <div class="lsec">${ic("tools", 15)}Aktion (feste Auswahl)</div>
        <div class="gschips">${gs.map((g) => chip("tgxg", g, D.groups[g], d.g === g)).join("")}</div>
        ${d.g ? `<div class="gschips" style="margin-top:8px">${A.filter((x) => x.g === d.g).map((x) => chip("tgxa", x.k, x.n, d.act.k === x.k)).join("")}</div>` : `<div class="mut sm" style="margin-top:6px">Wähle zuerst den Bereich.</div>`}
        ${arg}${need ? `<div class="stowarn" style="margin-top:8px">${ic("alert", 16)}<span>${esc(need)} Die Aktion tut nichts, solange das aus ist.</span></div>` : ""}
        <div class="lsec" style="margin-top:12px">${ic("users", 15)}Nur diese Personen</div>
        <div class="mut sm" style="margin:0 0 4px">Ohne Auswahl darf jeder. Wer scannt, erkennt Home Assistant nur beim Handy mit Companion-App. Ein Leser ohne Person (zum Beispiel ESPHome) führt einen Tag mit Auswahl nicht aus.</div>
        <div class="gschips">${persons.length ? persons.map((p) => chip("tgxwho", p, this._tgxPerson(p), d.persons.includes(p))).join("") : `<span class="mut sm">Keine Personen in Home Assistant.</span>`}</div>
        <div class="lsec" style="margin-top:12px">${ic("bell", 15)}Rückmeldung</div>
        <div class="gschips">${fbk("notify", "Handy-Nachricht", fb.notify.length > 0, "Erst unter „Rückmeldung einrichten“ einen Dienst wählen")}${fbk("tts", "Ansage", !!(fb.tts.ent && fb.tts.player), "Erst unter „Rückmeldung einrichten“ Sprachdienst und Lautsprecher wählen")}${fbk("blink", "Licht blinkt", !!fb.light, "Erst unter „Rückmeldung einrichten“ eine Lampe wählen")}</div>
        <div class="lsec" style="margin-top:12px">${ic("clock", 15)}Zeitfenster (optional)</div>
        <div class="vrow"><span>Nur zwischen<small class="mut" style="display:block">Über Mitternacht möglich, zum Beispiel 20:00 bis 06:00</small></span><span style="display:flex;gap:6px;align-items:center"><input type="time" data-f="tgxfrom" value="${esc(d.from)}" aria-label="von" style="background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:8px"> bis <input type="time" data-f="tgxto" value="${esc(d.to)}" aria-label="bis" style="background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:8px">${d.from ? `<button class="oclr" data-act="tgxwclr" aria-label="Zurücksetzen">${ic("close", 14)}</button>` : ""}</span></div>
        <div class="foot2" style="margin-top:12px">${d.isNew ? "" : `<button class="btn2" data-act="tgxdel" style="color:#fb7185">Löschen</button>`}<button class="btn2" data-act="tgxtest" ${d.isNew ? "disabled" : ""}>Testen</button><button class="btn2 pri" data-act="tgxsave" ${adm ? "" : "disabled"}>Speichern</button></div></div>`;
    }
    const tags = Object.entries(D.cfg.tags), L = D.learn || {}, F = L.found, lg = (D.log || []).slice(0, 6);
    const rc = { ok: "#2dd4bf", fail: "#fb7185", unknown: "#fb7185", deny: "#fbbf24", off: "#fbbf24", time: "#fbbf24" };
    const ready = this._tgxReady();
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">${hd("Tags & Karten", "Labs · gilt für alle Nutzer")}
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px"><div class="mut sm">${tags.length ? `${tags.length} ${tags.length === 1 ? "Tag" : "Tags"} angelernt` : "Noch kein Tag angelernt"}${D.unknown.length ? ` · ${D.unknown.length} unbekannt gescannt` : ""}</div><button class="btn2 pri" data-act="tgxlearn" ${adm && !L.active ? "" : "disabled"}>${ic("plus", 16)} Tag anlernen</button></div>
      ${L.active && !F ? `<div class="tgxscan"><span class="tgxpulse">${ic("nfc", 30)}</span><b>Jetzt Karte oder Sticker an einen Leser halten …</b><span class="mut sm">Wartet noch ${L.left} Sekunden</span><button class="btn2" data-act="tgxstop">Abbrechen</button></div>` : ""}
      ${F ? `<div class="tgxscan found"><span class="tgxpulse">${ic("check", 30)}</span><b>${F.known ? "Bekannter Tag erkannt" : "Neuer Tag erkannt"}</b><span class="mut sm">${esc(F.id)} · ${esc(F.reader)}</span><button class="btn2 pri" data-act="tgxnew" data-k="${esc(F.id)}">${F.known ? "Bearbeiten" : "Einrichten"}</button></div>` : ""}
      ${ready ? `<div class="stowarn">${ic("alert", 16)}<span>${esc(ready)}</span></div>` : ""}
      ${tags.length ? `<div class="sxl tgxl">${tags.map(([id, t]) => { const l = D.last[id]; return `<div class="tgxrow"><button class="sxrow" data-act="tgxedit" data-k="${esc(id)}"><span class="sxi">${ic(this._tgxIcon(t.act), 20)}</span><span class="sxt"><b>${esc(t.name)}</b><small>${esc(this._tgxDesc(t.act))}${l ? ` · zuletzt ${esc(this._tgxWhen(l.ts))}, ${esc(l.reader)}` : " · noch nicht gescannt"}</small></span></button><button class="sw ${t.on ? "on" : ""}" data-act="tgxtog" data-k="${esc(id)}" aria-pressed="${t.on}" aria-label="${esc(t.name)} ${t.on ? "ausschalten" : "einschalten"}" ${adm ? "" : "disabled"}></button></div>`; }).join("")}</div>` : `<div class="mut sm" style="margin:10px 0">Tippe auf „Tag anlernen“ und halte eine Karte oder einen Sticker an einen Leser. Als Leser taugt das Handy mit NFC (Companion-App), ein ESPHome-Leser (PN532 oder RC522) und jeder andere Leser, der in Home Assistant Tags meldet.</div>`}
      ${D.unknown.length ? `<div class="lsec">${ic("info", 15)}Unbekannte Tags</div>${D.unknown.map((u) => `<div class="vrow tgxunk"><span><b>${esc(u.id.length > 22 ? u.id.slice(0, 20) + "…" : u.id)}</b><small class="mut" style="display:block">${esc(this._tgxWhen(u.ts))} · ${esc(u.reader)}</small></span><span style="display:flex;gap:6px"><button class="btn2" data-act="tgxnew" data-k="${esc(u.id)}" ${adm ? "" : "disabled"}>Zuordnen</button><button class="btn2" data-act="tgxforget" data-k="${esc(u.id)}" ${adm ? "" : "disabled"}>Verwerfen</button></span></div>`).join("")}` : ""}
      <div class="lsec">${ic("bell", 15)}Rückmeldung</div>
      <div class="vrow"><span>Handy, Ansage oder blinkendes Licht<small class="mut" style="display:block">${D.cfg.fb.notify.length || D.cfg.fb.tts.ent || D.cfg.fb.light ? "Eingerichtet. Pro Tag schaltest du sie ein." : "Noch nicht eingerichtet."}</small></span><button class="btn2" style="flex:none" data-act="tgxfb" ${adm ? "" : "disabled"}>Einrichten</button></div>
      ${lg.length ? `<div class="lsec">${ic("list", 15)}Protokoll</div><div class="tgxlog">${lg.map((x) => `<div><span class="mut">${esc(this._tgxWhen(x.ts))}</span><b>${esc(x.name)}</b><span class="mut">${esc(x.reader)}</span><span style="color:${rc[x.res] || "inherit"}">${esc(x.msg)}</span></div>`).join("")}</div>` : ""}
      <div class="stowarn" style="margin-top:10px">${ic("alert", 16)}<span><b>Karten und Sticker lassen sich kopieren.</b> Deshalb gibt es keine Aktionen, die einen Alarm entschärfen oder etwas aufschließen. Jeder Tag führt genau eine Aktion aus der festen Liste aus.</span></div>
      <div class="foot2" style="margin-top:12px"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _tgxReady() {
    const D = this._tgxD; if (!D || !D.on) return "Das Lab „Tags & Karten“ ist ausgeschaltet. Tags werden erst nach dem Einschalten ausgeführt.";
    return "";
  }
