  /* ================= Modul 1: Messraum (Raum nur mit Temperatur und Luftfeuchte, steuert nichts) =================
     Gespeichert im Layout unter "mess" (für alle Nutzer, in Sicherungen enthalten). Symbol, Farbe und Foto wie bei
     Heizungsräumen unter layout.icons/colors/photos mit der Messraum-ID. "parts" hält die Bausteine des Raums
     (heute nur "mess"), damit später Räume aus Bausteinen (Heizung, Fenster, Luft, Messen) möglich sind. */
  _msList() {
    const L = this._cfg.layout || {}, cc = L.colors || {}, n0 = this._collect0 ? this._collect0().length : 0;
    return (Array.isArray(L.mess) ? L.mess : []).map((m, i) => ({ ...MS_DEF, ...m, color: HEX.test(cc[m.id] || "") ? cc[m.id] : COLORS[(n0 + i) % COLORS.length], ms: true }));
  }
  /* Zustand eines Messraums für Raumkarte und Grundriss. Außen (loc "out"): kein Wohlfühlbereich, dafür Frost und Glätte. */
  _msStat(m) {
    const T = m.temp ? this._msVal(m.temp, "t", m.stale) : null, Hm = m.hum ? this._msVal(m.hum, "h", m.stale) : null, okv = (x) => x && x.st !== "none" && x.st !== "bad";
    const vals = [T, Hm].filter(Boolean), none = !vals.length || vals.every((x) => x.st === "none" || x.st === "bad"), tv = okv(T) ? T.v : null, hv = okv(Hm) ? Hm.v : null, out = m.loc === "out";
    let k = "ok", lab = out ? "Draußen" : "Im Wohlfühlbereich", col = out ? "#38bdf8" : "#2dd4bf";
    if (none || (tv == null && hv == null)) { k = "aus"; lab = "Keine Daten"; col = "#94a3b8"; }
    else if (out) { if (tv != null && tv <= 0) { k = "frost"; lab = "Frost"; col = "#60a5fa"; } else if (tv != null && tv <= 3 && hv != null && hv >= 85) { k = "glatt"; lab = "Glätte möglich"; col = "#93c5fd"; } else if (tv != null && tv >= 30) { k = "warm"; lab = "Heiß"; col = "#fb923c"; } }
    else if (hv != null && hv > m.h_hi) { k = "feucht"; lab = "Zu feucht"; col = "#f59e0b"; }
    else if (tv != null && tv < m.t_lo) { k = "kalt"; lab = "Zu kalt"; col = "#60a5fa"; }
    else if (tv != null && tv > m.t_hi) { k = "warm"; lab = "Zu warm"; col = "#fb923c"; }
    else if (hv != null && hv < m.h_lo) { k = "trocken"; lab = "Zu trocken"; col = "#f59e0b"; }
    return { T, Hm, tv, hv, none, k, lab, col, out };
  }
  _msSave(list) { this._cfg.layout.mess = list.map(({ color, ms, ...x }) => x); this._saveLayout(); this._render(); }
  /* Ein Messwert: Zahl (Temperatur in °C), Zustand ok | none | stale | bad und Alter in Stunden */
  _msVal(eid, kind, stale) {
    const s = eid && this._hass.states[eid];
    if (!s || s.state === "unavailable" || s.state === "unknown" || s.state === "") return { st: "none" };
    let v = parseFloat(s.state); if (!isFinite(v)) return { st: "none" };
    if (kind === "t" && /F$/i.test(String((s.attributes || {}).unit_of_measurement || ""))) v = (v - 32) * 5 / 9;
    const age = (Date.now() - new Date(s.last_updated || s.last_changed || Date.now()).getTime()) / 3600000;
    if (kind === "t" ? v < -40 || v > 80 : v < 0 || v > 100) return { st: "bad", v, age };
    return { v: Math.round(v * 10) / 10, age, st: age * 60 > stale ? "stale" : "ok" };
  }
  /* Min und Max heute aus dem Verlauf von Home Assistant (nicht doppelt gespeichert), höchstens alle 10 Minuten neu */
  _msMM(m) {
    const ids = [m.temp, m.hum].filter(Boolean); if (!ids.length || !m.mm) return null;
    const c = (this._msH = this._msH || {})[m.id], key = ids.join(","), d0 = new Date(); d0.setHours(0, 0, 0, 0);
    if (!c || c.key !== key || c.day !== d0.getTime() || Date.now() - c.ts > 600000) {
      if (!c || !c.busy) {
        this._msH[m.id] = { ...(c || {}), key, day: d0.getTime(), ts: Date.now(), busy: true };
        this._hass.callWS({ type: "history/history_during_period", start_time: d0.toISOString(), entity_ids: ids, minimal_response: true, no_attributes: true, significant_changes_only: false })
          .then((r) => {
            const rng = (eid, kind) => { const st = this._hass.states[eid], f = kind === "t" && /F$/i.test(String(((st || {}).attributes || {}).unit_of_measurement || "")); const xs = ((r || {})[eid] || []).map((x) => parseFloat(x.s ?? x.state)).filter((x) => isFinite(x)).map((x) => (f ? (x - 32) * 5 / 9 : x)).filter((x) => (kind === "t" ? x >= -40 && x <= 80 : x >= 0 && x <= 100)); return xs.length ? [Math.min(...xs), Math.max(...xs)] : null; };
            this._msH[m.id] = { key, day: d0.getTime(), ts: Date.now(), t: m.temp ? rng(m.temp, "t") : null, h: m.hum ? rng(m.hum, "h") : null };
            this._render();
          })
          .catch(() => { this._msH[m.id] = { key, day: d0.getTime(), ts: Date.now(), err: true }; });
      }
    }
    return this._msH[m.id] || null;
  }
  _msAgo(h) { const m = Math.round(h * 60); return m < 2 ? "gerade eben" : m < 60 ? `vor ${m} Min.` : m < 1440 ? `vor ${Math.round(m / 60)} Std.` : `vor ${Math.round(m / 1440)} Tagen`; }
  _msCard(m) {
    const T = m.temp ? this._msVal(m.temp, "t", m.stale) : null, Hm = m.hum ? this._msVal(m.hum, "h", m.stale) : null, edit = this._edit, adm = this._admin();
    const vals = [T, Hm].filter(Boolean), none = vals.length && vals.every((x) => x.st === "none" || x.st === "bad");
    const mm = !none ? this._msMM(m) : null, fmtR = (r, d) => (r ? `Min ${num(r[0], d)} · Max ${num(r[1], d)} heute` : "");
    const tone = (x, lo, hi, cold) => (x.st !== "ok" ? "gray" : m.loc === "out" ? (cold === "blue" && x.v <= 0 ? "blue" : "green") : x.v < lo ? cold : x.v > hi ? "amber" : "green");
    const tT = T ? tone(T, m.t_lo, m.t_hi, "blue") : "", tH = Hm ? tone(Hm, m.h_lo, m.h_hi, "amber") : "";
    const box = (x, ttl, icon, unit, d, tn, rng, gauge) => {
      if (x.st === "none") return `<div class="msb none"><div class="t">${ic(icon, 15)}${ttl}</div><div class="v">keine Daten</div></div>`;
      if (x.st === "bad") return `<div class="msb none"><div class="t">${ic(icon, 15)}${ttl}</div><div class="v">unplausibel</div><div class="s">Sensor meldet ${num(x.v, 1)}${unit}</div></div>`;
      return `<div class="msb ${tn}"><div class="t">${ic(icon, 15)}${ttl}</div><div class="v">${num(x.v, d)}<small>${unit}</small></div>${gauge ? `<div class="gauge"><i style="width:${Math.max(0, Math.min(100, x.v))}%"></i></div>` : ""}${rng ? `<div class="s">${rng}</div>` : ""}</div>`;
    };
    const boxes = [T ? box(T, "Temperatur", "thermo", " °C", 1, tT, fmtR(mm && mm.t, 1)) : "", Hm ? box(Hm, "Luftfeuchte", "drop", " %", 0, tH, fmtR(mm && mm.h, 0), true) : ""].join("");
    /* Zuschaltbar: Taupunkt und Schimmelhinweis */
    let extra = "";
    if (T && Hm && T.st !== "none" && T.st !== "bad" && Hm.st !== "none" && Hm.st !== "bad" && (m.dew || (m.mold && m.loc !== "out"))) {
      const o = this._out(), a = airCalc(T.v, Hm.v, o.t, o.rh), [ml, mc] = MOLD[a.lvl];
      extra = `<div class="msx">${m.dew ? `<span>${ic("thermo", 13)}Taupunkt <b>${num(a.td, 1)} °C</b></span>` : ""}${m.mold && m.loc !== "out" ? `<span class="${mc}">${ic("alert", 13)}Schimmel <b>${ml}</b></span>` : ""}</div>`;
    }
    /* Hinweiszeile */
    const ok = vals.filter((x) => x.st === "ok"), stale = vals.filter((x) => x.st === "stale");
    let note = "", ntone = "";
    if (none) note = "Sensor meldet keine Daten";
    else if (vals.some((x) => x.st === "bad")) { note = "Ein Sensor meldet einen unplausiblen Wert"; ntone = "amber"; }
    else if (stale.length && !ok.length) note = `Letzter Wert ${this._msAgo(Math.min(...stale.map((x) => x.age)))}, Sensor meldet sich nicht`;
    else {
      const out = [];
      if (m.loc === "out") { if (T && T.st === "ok" && T.v <= 0) out.push("Frost"); else if (T && T.st === "ok" && Hm && Hm.st === "ok" && T.v <= 3 && Hm.v >= 85) out.push("Glätte möglich"); }
      else if (T && T.st === "ok") { if (T.v < m.t_lo) out.push(`Zu kalt (${num(m.t_lo, 0)}–${num(m.t_hi, 0)} °C)`); else if (T.v > m.t_hi) out.push(`Zu warm (${num(m.t_lo, 0)}–${num(m.t_hi, 0)} °C)`); }
      if (Hm && Hm.st === "ok" && m.loc !== "out") { if (Hm.v > m.h_hi) out.push(`Zu feucht (${num(m.h_lo, 0)}–${num(m.h_hi, 0)} %)`); else if (Hm.v < m.h_lo) out.push(`Zu trocken (${num(m.h_lo, 0)}–${num(m.h_hi, 0)} %)`); }
      const age = Math.min(...vals.filter((x) => x.age != null).map((x) => x.age));
      note = out.length ? out.join(" · ") : `Aktualisiert ${this._msAgo(age)} · ${m.loc === "out" ? "draußen" : "im Wohlfühlbereich"}`; ntone = out.length ? "amber" : "";
      if (stale.length) note += ` · ${stale.length === 1 && vals.length > 1 ? "ein Sensor" : "Sensor"} ${this._msAgo(Math.min(...stale.map((x) => x.age)))}`;
    }
    const bs = m.bat && this._hass.states[m.bat], bv = bs ? parseFloat(bs.state) : NaN, batLow = bs && ((isFinite(bv) && bv <= 15) || bs.state === "on" || /low|niedrig/i.test(bs.state));
    const rkPic = this._rkOn() && !(this._cfg.layout.photos || {})[m.id] ? `<div class="rk2mini msm"><div class="rk2art mini">${this._rkArt("mess", { k: "ok", col: none ? "#94a3b8" : "#2dd4bf", open: [], tilt: [], anyOpen: 0, act: null, heating: false, t0: null, night: false }, { mt: T && T.st !== "none" && T.st !== "bad" ? num(T.v, 1) + "°" : "--°", mh: Hm && Hm.st !== "none" && Hm.st !== "bad" ? num(Hm.v) + " %" : "" })}</div></div>` : "";
    const icon = rkPic ? (edit ? `<button class="rk2minib" data-act="icon" data-id="${esc(m.id)}" aria-label="Raum anpassen">${rkPic}<span class="pen">${ic("pencil", 11)}</span></button>` : rkPic) : edit ? `<button class="rico" style="${rcStyle(m.color)}" data-act="icon" data-id="${esc(m.id)}" aria-label="Symbol ändern">${ico(this._icon(m), 26)}<span class="pen">${ic("pencil", 11)}</span></button>` : `<div class="rico" style="${rcStyle(m.color)}">${ico(this._icon(m), 26)}</div>`;
    if (this._rkOn()) return this._msCard2(m, T, Hm, mm, none, note, ntone, batLow);
    return `<div class="card room msr${none ? " msnone" : ""}${this._ph(m).c}"${this._ph(m).s} data-id="${esc(m.id)}"><div class="rh">${icon}
        <div class="rn"><b>${esc(m.name)}</b><div class="pl"><span class="msbadge">${m.loc === "out" ? "Außen" : "Messraum"}</span>${batLow ? `<span class="pill amber">Batterie leer</span>` : ""}</div></div>
        ${adm ? `<button class="ibtn gear" data-act="msxedit" data-id="${esc(m.id)}" aria-label="Messraum einstellen">${ic("sliders", 17)}</button>` : ""}</div>
      <div class="msv${T && Hm ? "" : " one"}">${boxes}</div>${extra}${this._lfBox(m.id)}
      <div class="msn ${ntone}">${esc(note)}</div></div>`;
  }
  /* Rettung: Messräume, die im Layout fehlen, aber in einer automatischen Sicherung stehen (fenster_heizung/mess_rescue_get) */
  _msRescueLoad() {
    this._hass.callWS({ type: "fenster_heizung/mess_rescue_get" }).then((r) => { this._msRes = r && r.names && r.names.length ? r : null; this._render(); }).catch(() => { this._msRes = null; });
  }
  _msRescueBox() {
    const R = this._msRes; if (!R || !this._admin()) return "";
    const d = R.ts ? new Date(R.ts).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";
    return `<div class="card msres"><span class="gico">${ic("alert", 18)}</span><div><b>${R.names.length === 1 ? "Ein Messraum fehlt" : `${R.names.length} Messräume fehlen`}</b><span>${esc(R.names.join(", "))} ${R.names.length === 1 ? "steht" : "stehen"} noch in der automatischen Sicherung${d ? ` vom ${esc(d)}` : ""}. Zurückholen übernimmt auch Symbol, Farbe und Foto – alles andere bleibt, wie es ist.</span></div>
      <div class="gbtns"><button class="btn2 pri" data-act="msxrescue">${ic("check", 16)} Zurückholen</button><button class="btn2" data-act="msxrescueno">Nicht jetzt</button></div></div>`;
  }
  _msSection() {
    const L = this._msList(); if (!L.length) return this._msRescueBox();
    return `${this._msRescueBox()}<div class="msh"><span class="gico">${ic("thermo", 18)}</span><div><b>Messräume</b><span>${L.length} ${L.length === 1 ? "Raum" : "Räume"} · nur Temperatur und Luftfeuchte, es wird nichts gesteuert</span></div></div>
      <div class="rooms msg">${L.map((m) => this._msCard(m)).join("")}</div>`;
  }
  /* Vorschläge: Bereiche in Home Assistant mit Temperatur- oder Feuchtesensor, aber ohne Thermostat und noch ohne Raum */
  _msSug() {
    const H = this._hass, st = H.states || {}, dc = (e) => ((st[e] || {}).attributes || {}).device_class || "";
    const area = (e) => { const en = (H.entities || {})[e]; if (!en) return ""; if (en.area_id) return en.area_id; const dv = en.device_id && (H.devices || {})[en.device_id]; return (dv && dv.area_id) || ""; };
    const have = new Set([...this._collect(true).map((r) => r.name), ...this._msList().map((m) => m.name)].map((x) => (x || "").toLowerCase().trim()));
    const used = new Set(this._msList().flatMap((m) => [m.temp, m.hum]).filter(Boolean)), g = {};
    for (const e of Object.keys(st)) {
      const a = area(e); if (!a) continue;
      if (e.startsWith("climate.") && !((H.entities || {})[e] || {}).platform?.includes?.("fenster_heizung")) { (g[a] = g[a] || { t: [], h: [], c: 0 }).c++; continue; }
      if (!e.startsWith("sensor.") || used.has(e) || ((H.entities || {})[e] || {}).platform === "fenster_heizung") continue;
      if (dc(e) === "temperature") (g[a] = g[a] || { t: [], h: [], c: 0 }).t.push(e); else if (dc(e) === "humidity") (g[a] = g[a] || { t: [], h: [], c: 0 }).h.push(e);
    }
    return Object.entries(g).filter(([, x]) => !x.c && (x.t.length || x.h.length)).map(([a, x]) => ({ name: ((H.areas || {})[a] || {}).name || a, temp: x.t[0] || "", hum: x.h[0] || "", n: x.t.length + x.h.length }))
      .filter((s) => !have.has(s.name.toLowerCase().trim())).sort((x, y) => x.name.localeCompare(y.name, "de"));
  }
  _msAddFromSug(s) {
    const L = this._msList(), id = "ms_" + Date.now().toString(36);
    this._msSave([...L, { ...MS_DEF, id, name: s.name, temp: s.temp, hum: s.hum }]);
    this._toast(`Messraum „${s.name}“ angelegt`);
  }
  _msOpen(id) {
    const cur = id ? this._msList().find((x) => x.id === id) : null;
    this._pkId = null;
    this._modal = { type: "msx", id: id || null, kind: cur ? "mess" : null, err: "", del: false, draft: cur ? { ...cur } : { ...MS_DEF, id: "", name: "" } };
    this._renderModal();
  }
  /* Grundriss-Raum dieses Messraums: von Hand (layout.gmap) oder automatisch über den Namen */
  _msGpPlanRooms() { const P = this._gpPlan && this._gpPlan(); if (!P || P.error || !Array.isArray(P.items)) return []; const fl = Object.fromEntries((P.floors || []).map((f) => [f.id, f.n])), many = (P.floors || []).length > 1; return P.items.filter((i) => i.t === "r").map((i) => ({ id: i.id, n: (many && fl[i.fl] ? fl[i.fl] + " · " : "") + (i.n || "ohne Namen"), item: i })); }
  _msGpCur(id, name) {
    const gm = this._cfg.layout.gmap || {}, L = this._msGpPlanRooms(), hand = Object.keys(gm).find((k) => gm[k] === id);
    if (hand) return { id: hand, auto: false };
    const all = this._gpAll(), me = { id, name: name || (all.find((x) => x.id === id) || {}).name || "" }, a = L.find((p) => { const r = this._gpMatch(p.item, all.some((x) => x.id === id) ? all : [...all, me]); return r && r.id === id; });
    return a ? { id: a.id, auto: true } : { id: "", auto: false };
  }
  _msGpRow(M) {
    const L = this._msGpPlanRooms(); if (!L.length) return "";
    const cur = M.gp !== undefined ? { id: M.gp, auto: false } : this._msGpCur(M.id || "", M.draft.name), gm = this._cfg.layout.gmap || {}, all = this._gpAll();
    const who = (pid) => { const v = gm[pid]; const r = v && v !== "-" ? all.find((x) => x.id === v) : null; return r && r.id !== M.id ? ` (jetzt: ${r.name})` : ""; };
    return `<div class="of"><div class="ol"><b>Im Grundriss</b><small>${cur.auto ? "automatisch über den Namen" : "Fläche aus dem Grundriss von Modul 11"}</small></div><div class="oc"><select class="osel" data-f="msxgp" aria-label="Fläche im Grundriss">
      <option value="" ${cur.id ? "" : "selected"}>– nicht im Grundriss –</option>${L.map((p) => `<option value="${esc(p.id)}" ${cur.id === p.id ? "selected" : ""}>${esc(p.n + who(p.id))}</option>`).join("")}</select></div></div>`;
  }
  _msGpApply(rec, pid) {
    const g = { ...(this._cfg.layout.gmap || {}) }, auto = this._msGpCur(rec.id, rec.name);
    for (const k of Object.keys(g)) if (g[k] === rec.id) delete g[k];
    if (pid) g[pid] = rec.id; else if (auto.id && auto.auto) g[auto.id] = "-";   /* „nicht im Grundriss“ schlägt die Zuordnung über den Namen */
    this._cfg.layout.gmap = g;
  }
  _msModal() {
    const M = this._modal, d = M.draft, st = this._hass.states, isNew = !M.id;
    const ks = Object.keys(st), dc = (e) => (st[e].attributes || {}).device_class || "";
    const tmp = ks.filter((e) => e.startsWith("sensor.") && dc(e) === "temperature"), hum = ks.filter((e) => e.startsWith("sensor.") && dc(e) === "humidity");
    const bat = ks.filter((e) => (e.startsWith("sensor.") && dc(e) === "battery") || (e.startsWith("binary_sensor.") && dc(e) === "battery"));
    const head = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>${isNew ? "Raum hinzufügen" : "Raumeinstellungen"}</b><span>${isNew ? (M.kind ? "Schritt 2: Angaben" : "Schritt 1: Was für ein Raum?") : `${esc(d.name)} · Messraum · gilt nach dem Speichern`}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>`;
    const kinds = `<div class="mskind">
        <button class="${M.kind === "heat" ? "sel" : ""}" data-act="msxkind" data-k="heat"><b>${ic("radiator", 18)}Mit Heizung und Fenster</b><span>Thermostate pausieren bei offenem Fenster, Heizplan, Berichte.</span></button>
        <button class="${M.kind === "mess" ? "sel" : ""}" data-act="msxkind" data-k="mess"><b>${ic("thermo", 18)}Nur Messwerte <em class="msnew">NEU</em></b><span>Temperatur und Luftfeuchte anzeigen. Es wird nichts gesteuert.</span></button></div>`;
    if (isNew && M.kind !== "mess") {
      const sug = this._msSug();
      return head + kinds + (M.kind === "heat" ? `<div class="gst">${ic("info", 15)}<div>Heizungsräume legst du wie gewohnt in Home Assistant an: <b>Einstellungen → Geräte &amp; Dienste → Integration hinzufügen → „Strom &amp; Wärme“</b>. Pro Raum ein Eintrag mit Fenstersensoren und Thermostaten. Mehrere Räume auf einmal gehen schneller mit dem Einrichtungsassistenten.</div></div>
        <div class="foot2"><button class="btn2" data-act="wz">${ic("tools", 15)} Assistent</button><button class="btn2 pri" data-act="msxha">Zu Geräte &amp; Dienste</button></div></div>`
        : `${sug.length ? `<div class="lsec">${ic("home", 15)}Gefunden in deinen Bereichen</div><div class="mut sm" style="margin:-2px 0 6px">Bereiche mit Temperatur- oder Feuchtesensor, aber ohne Thermostat.</div>${sug.slice(0, 6).map((s, i) => `<div class="wzs"><div><b>${esc(s.name)}</b><span>${[s.temp ? "Temperatur" : "", s.hum ? "Luftfeuchte" : ""].filter(Boolean).join(" und ")}</span></div><button class="btn2" data-act="msxsug" data-i="${i}">Übernehmen</button></div>`).join("")}` : ""}
        <div class="foot2"><button class="btn2" data-act="close">Abbrechen</button></div></div>`);
    }
    const row = (l, h, ctl) => `<div class="of"><div class="ol"><b>${l}</b>${h ? `<small>${h}</small>` : ""}</div><div class="oc">${ctl}</div></div>`;
    const sw = (k, l, h) => `<div class="vrow"><span>${l}${h ? `<small class="mut" style="display:block">${h}</small>` : ""}</span><button class="sw ${d[k] ? "on" : ""}" data-act="msxsw" data-k="${k}" aria-pressed="${!!d[k]}" aria-label="${l}"></button></div>`;
    const nm = (k, unit, min, max, step) => `<span class="onum"><input type="number" inputmode="decimal" data-f="msxn" data-k="${k}" value="${d[k]}" min="${min}" max="${max}" step="${step}"><i>${unit}</i></span>`;
    /* Hinweis bei Doppelung: Sensor schon in einem anderen Raum */
    const dup = (e) => { if (!e) return ""; const r = this._collect(true).find((x) => x.rtEid === e || x.humEid === e); if (r) return `Auch in „${r.name}“ eingetragen. Das ist erlaubt.`; const o = this._msList().find((x) => x.id !== M.id && (x.temp === e || x.hum === e)); return o ? `Auch im Messraum „${o.name}“ eingetragen. Das ist erlaubt.` : ""; };
    const dT = dup(d.temp), dH = dup(d.hum);
    return head + (isNew ? kinds : "") + `
      <div class="lsec">${ic("pencil", 15)}Name</div>
      <input class="otxt" type="text" maxlength="30" data-f="msxname" value="${esc(d.name)}" placeholder="z. B. Keller" aria-label="Name des Messraums">
      ${!isNew ? `<button class="lnk" data-act="icon" data-id="${esc(d.id)}" style="margin:6px 0 0">${ic("image", 14)} Symbol, Farbe und Foto ändern</button>` : `<div class="mut sm" style="margin:6px 0 0">Das Symbol wird nach dem Namen gewählt. Symbol, Farbe und Foto änderst du später unter „Anpassen“.</div>`}
      <div class="lsec">${ic("home", 15)}Wo misst der Sensor?</div>
      <div class="msloc"><button class="${d.loc !== "out" ? "sel" : ""}" data-act="msxloc" data-k="in">${this._gx("house", 34, { on: true })}<b>Innen</b><span>Im Haus, z. B. Keller, Flur, Abstellraum. Mit Wohlfühlbereich und Schimmelhinweis.</span></button>
        <button class="${d.loc === "out" ? "sel" : ""}" data-act="msxloc" data-k="out">${this._gx("forecast", 34, { on: true })}<b>Außen</b><span>Draußen, z. B. Terrasse, Garten, Carport. Mit Frost- und Glättehinweis.</span></button></div>
      ${d.loc === "out" && d.temp ? (() => { const c = this._wxCfg(); return c.outdoor === d.temp ? `<div class="gst">${ic("check", 15)}<span>Dieser Sensor ist schon die Außentemperatur des Hauses (Einstellungen → Haus → Wetter).</span></div>`
        : `<div class="gst">${ic("info", 15)}<span>${c.outdoor ? "Das Haus nutzt einen anderen Außenfühler." : "Das Haus nimmt die Außentemperatur bisher aus der Wetter-Entität."} <button class="lnk" data-act="msxout">Diesen Sensor als Außentemperatur des Hauses verwenden</button> – gilt dann auch für Sommerbetrieb, Schimmelhinweise und Lüften.</span></div>`; })() : ""}
      ${this._msGpRow(M)}
      <div class="lsec">${ic("thermo", 15)}Sensoren</div>
      <div class="mut sm" style="margin:-2px 0 6px">Mindestens einer von beiden. Es werden nur passende Sensoren vorgeschlagen.</div>
      ${row("Temperatur", "Geräteklasse Temperatur", this._wzSel(tmp, d.temp, "msxe", `data-k="temp"`, "– kein Sensor –", /temp/i))}${dT ? `<div class="mut sm msdup">${esc(dT)}</div>` : ""}
      ${row("Luftfeuchte", "Hygrometer, Geräteklasse Luftfeuchte", this._wzSel(hum, d.hum, "msxe", `data-k="hum"`, "– kein Sensor –", /feucht|humid/i))}${dH ? `<div class="mut sm msdup">${esc(dH)}</div>` : ""}
      ${row("Batterie", "optional, Hinweis „Batterie leer“ ab 15 %", this._wzSel(bat, d.bat, "msxe", `data-k="bat"`, "– keine –", /bat/i))}
      <div class="lsec">${ic("eye", 15)}Anzeige</div>
      ${sw("mm", "Min und Max heute", "Aus dem Verlauf von Home Assistant")}${sw("dew", "Taupunkt zeigen", "Braucht beide Sensoren")}${d.loc === "out" ? "" : sw("mold", "Schimmelhinweis zeigen", "Geschätzt, braucht beide Sensoren")}
      <div class="lsec">${ic("check", 15)}${d.loc === "out" ? "Sensor-Alter" : "Wohlfühlbereich und Sensor-Alter"}</div>
      ${d.loc === "out" ? `<div class="mut sm" style="margin:-2px 0 6px">Draußen gibt es keinen Wohlfühlbereich. Hinweis bei Frost (ab 0 °C) und Glätte (bis 3 °C und ab 85 % Luftfeuchte).</div>` : `${row("Temperatur", "Darunter blau, darüber gelb", `<div class="msrg">${nm("t_lo", "°C", -20, 40, 0.5)}<span class="mut">bis</span>${nm("t_hi", "°C", -20, 40, 0.5)}</div>`)}
      ${row("Luftfeuchte", "Außerhalb gelb", `<div class="msrg">${nm("h_lo", "%", 0, 100, 1)}<span class="mut">bis</span>${nm("h_hi", "%", 0, 100, 1)}</div>`)}`}
      ${row("Gilt als veraltet nach", "Danach wird die Zahl grau", nm("stale", "Min.", 10, 1440, 5))}
      ${M.err ? `<div class="gst on">${ic("alert", 15)}<div>${esc(M.err)}</div></div>` : ""}
      ${!isNew ? (M.del ? `<div class="gbox"><b>Messraum „${esc(d.name)}“ löschen?</b>Sensoren in Home Assistant bleiben unverändert.</div><div class="foot2"><button class="btn2" data-act="msxdelno">Abbrechen</button><button class="btn2" style="color:#f87171;border-color:color-mix(in srgb,#f87171 45%,transparent)" data-act="msxdelok">Löschen</button></div>` : `<button class="lnk dng" data-act="msxdel" style="margin:10px 0 0">${ic("trash", 14)} Messraum löschen</button>`) : ""}
      ${M.del ? "" : `<div class="foot2"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="msxsave">${isNew ? "Raum anlegen" : "Speichern"}</button></div>`}</div>`;
  }
  _msChange(t) {
    const M = this._modal; if (!M || M.type !== "msx") return false;
    const f = t.dataset.f, d = M.draft;
    if (f === "msxname") { d.name = t.value; return true; }
    if (f === "msxgp") { M.gp = t.value; return true; }
    if (f === "msxe") { d[t.dataset.k] = t.value || ""; M.err = ""; return true; }
    if (f === "msxn") { const v = parseFloat(String(t.value).replace(",", ".")); if (isFinite(v)) d[t.dataset.k] = v; return true; }
    return false;
  }
  _msAct(a, b) {
    const M = this._modal;
    if (a === "msxadd") { this._msOpen(null); return; }
    if (a === "msxrescueno") { this._msRes = null; this._render(); return; }
    if (a === "msxrescue") {
      this._hass.callWS({ type: "fenster_heizung/mess_rescue" }).then((r) => { if (r && r.layout) this._cfg.layout = { ...this._cfg.layout, ...r.layout }; this._msRes = null; this._toast(`${(r && r.n) || 0} ${r && r.n === 1 ? "Messraum" : "Messräume"} zurückgeholt`); this._render(); })
        .catch((e) => this._toast((e && e.message) || "Zurückholen hat nicht geklappt"));
      return;
    }
    if (a === "msxedit") { this._msOpen(b.dataset.id); return; }
    if (a === "msxwz") { const s = this._msSug()[+b.dataset.i]; if (s) this._msAddFromSug(s); this._renderModal(); return; }
    if (!M || M.type !== "msx") return;
    const d = M.draft;
    if (a === "msxkind") { M.kind = b.dataset.k; this._renderModal(); }
    else if (a === "msxha") { this._modal = null; this._renderModal(); this._nav(HA_PAGE); }
    else if (a === "msxsug") { const s = this._msSug()[+b.dataset.i]; if (s) { M.kind = "mess"; Object.assign(d, { name: s.name, temp: s.temp, hum: s.hum }); this._renderModal(); } }
    else if (a === "msxsw") { d[b.dataset.k] = !d[b.dataset.k]; this._renderModal(); }
    else if (a === "msxloc") { d.loc = b.dataset.k === "out" ? "out" : "in"; if (d.loc === "out") d.mold = false; this._renderModal(); }
    else if (a === "msxout") { this._cfg.layout.wx = { ...(this._cfg.layout.wx || {}), outdoor: d.temp }; this._saveLayout(); this._toast("Außentemperatur des Hauses kommt jetzt von diesem Sensor"); this._renderModal(); }
    else if (a === "msxdel") { M.del = true; this._renderModal(); }
    else if (a === "msxdelno") { M.del = false; this._renderModal(); }
    else if (a === "msxdelok") {
      const L = this._cfg.layout; for (const k of ["icons", "colors", "photos"]) if (L[k] && L[k][M.id]) { const c = { ...L[k] }; delete c[M.id]; L[k] = c; }
      this._msSave(this._msList().filter((x) => x.id !== M.id)); this._modal = null; this._renderModal(); this._toast("Messraum gelöscht");
    }
    else if (a === "msxsave") {
      const name = String(d.name || "").trim(), low = name.toLowerCase();
      const taken = [...this._collect(true).map((r) => r.name), ...this._msList().filter((x) => x.id !== M.id).map((x) => x.name)].some((x) => (x || "").toLowerCase().trim() === low);
      M.err = !name ? "Bitte einen Namen eingeben." : taken ? `Es gibt schon einen Raum „${name}“.` : !d.temp && !d.hum ? "Bitte mindestens einen Sensor wählen: Temperatur oder Luftfeuchte." : d.t_lo >= d.t_hi || d.h_lo >= d.h_hi ? "Beim Wohlfühlbereich muss der erste Wert kleiner sein als der zweite." : "";
      if (M.err) { this._renderModal(); return; }
      const rec = { ...MS_DEF, ...d, name, id: M.id || "ms_" + Date.now().toString(36), parts: ["mess"] };
      if (M.gp !== undefined) this._msGpApply(rec, M.gp);
      const L = this._msList(), i = L.findIndex((x) => x.id === rec.id);
      if (i >= 0) L[i] = rec; else L.push(rec);
      this._msSave(L); this._modal = null; this._renderModal(); this._toast(i >= 0 ? "Messraum gespeichert" : `Messraum „${name}“ angelegt`);
    }
  }
