  /* Modul 11 (Beta): Reiter Übersicht, Grundriss (Baukasten), Wartung und Einstellungen. Daten und Meldungen kommen aus sicherheit.py. */
  _sfTab() { let t = this._sfT; if (!t) { try { t = localStorage.getItem("fh_sf_tab"); } catch (_) { /* privater Modus */ } } return ["ov", "me", "pl", "wa", "se"].includes(t) ? t : "ov"; }
  _sfMon(s) { return /^\d{4}-\d{2}$/.test(s || "") ? s.slice(5) + "/" + s.slice(0, 4) : ""; }
  _sfDur(d) { d = Math.max(0, Math.round(d)); return d < 14 ? `${d} ${d === 1 ? "Tag" : "Tagen"}` : d < 70 ? `${Math.round(d / 7)} Wochen` : d < 700 ? `${Math.round(d / 30)} Monate` : `${num(d / 365, 1)} Jahre`; }
  _sfDate(iso) { const t = iso ? new Date(iso) : null; return t && isFinite(t) ? t.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }) : "nie"; }
  _sfDetMap() { const m = {}; this._sfList().forEach((d) => { m[d.id] = d; }); return m; }
  _sfPl() { return this._sfEd ? this._sfEd.plan : this._sfx().cfg.plan; }
  _sfFl() { const f = this._sfPl().floors; return f.some((x) => x.id === this._sfFlId) ? this._sfFlId : f[0].id; }
  _sfDepRows() {
    const H = this._hass, C = this._sfx().cfg;
    return C.depart.ents.map((e) => {
      const s = H.states[e], st = s ? s.state : "unavailable", dom = e.split(".")[0], dc = s ? (s.attributes || {}).device_class : "", open = ["on", "open", "opening", "unlocked"].includes(st);
      const txt = dom === "lock" ? (open ? "entriegelt" : "verriegelt") : dom === "switch" || dom === "light" || dom === "input_boolean" ? (open ? "an" : "aus") : st === "unavailable" || st === "unknown" ? "unbekannt" : open ? "offen" : "zu";
      return { id: e, name: this._wzName(e), open, txt, ico: dom === "lock" ? "lock" : dom === "light" ? "lamp" : dom === "switch" || dom === "input_boolean" ? "energy" : dc === "door" || dc === "garage_door" ? "door" : "windowOpen" };
    });
  }
  _sfStat() {
    const S = this._sfx(), C = S.cfg, l = this._sfList(), al = l.filter((x) => x.alarm), pa = l.filter((x) => x.paused && !x.alarm), act = l.filter((x) => !x.paused), low = act.filter((x) => x.bat != null && x.bat < C.bat.pct), off = act.filter((x) => x.off);
    const due = C.test.on ? act.filter((x) => x.test_due && !x.off) : [], life = act.filter((x) => x.life_days != null && x.life_days <= C.lead), op = this._sfDepRows().filter((x) => x.open), ask = act.filter((x) => x.ask);
    /* Ausgeschaltete Melder (pa) zählen nicht bei Batterie, Erreichbarkeit, Prüfung und Lebensdauer; ein Alarm zählt immer */
    return { S, C, l, al, pa, act, ask, low, off, due, life, op, bad: al.length ? "alarm" : low.length || off.length || due.length || life.length || ask.length ? "warn" : "ok" };
  }
  _sfLogo(bad) {
    if (bad === "ok") return this._modLogo("sf");
    return `<div class="mlogo" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M32 5 9 14v17c0 14 9 22 23 28 14-6 23-14 23-28V14z" class="f"/><path d="M32 22v17"/><path d="M32 46v.5"/></svg></div>`;
  }
  _sfPageOld() {
    this._sfxLoad();
    const T = this._sfStat(), { C, l, al, low, off, due, life, op } = T, tab = this._sfTab();
    const msg = !l.length ? ["Noch keine Melder", "Melder aus Home Assistant erscheinen hier automatisch. Du kannst sie auch unter Einstellungen von Hand hinzufügen."]
      : al.length ? [`${al.length} ${al.length === 1 ? "Alarm" : "Alarme"} aktiv`, al.map((x) => x.name + (x.room || x.area ? " (" + (x.room || x.area) + ")" : "")).join(", ")]
        : T.bad === "warn" ? ["Alles ruhig, aber es gibt Hinweise", [low.length ? `${low.length} Batterie${low.length === 1 ? "" : "n"} schwach` : "", off.length ? `${off.length} nicht erreichbar` : "", due.length ? "Prüfung fällig" : "", life.length ? `${life.length} Melder zu tauschen` : ""].filter(Boolean).join(" · ")]
          : ["Alles in Ordnung", `${l.length} ${l.length === 1 ? "Melder meldet" : "Melder melden"} keinen Alarm, alle erreichbar und mit guter Batterie`];
    const chip = (ico, t, w) => `<span class="chip${w ? " st warn" : ""}">${ic(ico, 16)}${t}</span>`;
    const hero = `<div class="card hero mh a-sf sfh ${T.bad}">${this._sfLogo(T.bad)}<div class="lbl">${ic("shield", 16)}Sicherheit im Haus</div><div class="big">${esc(msg[0])}</div><div class="sub">${esc(msg[1])}</div>
      <div class="chips">${chip("shield", `${l.length} Melder`)}${low.length ? chip("alert", `${low.length} Batterie schwach`, 1) : ""}${off.length ? chip("alert", `${off.length} nicht erreichbar`, 1) : ""}${due.length ? chip("clock", "Prüfung fällig", 1) : ""}${life.length ? chip("alert", `${life.length} zu tauschen`, 1) : ""}${op.length ? chip("lock", `${op.length} offen beim Gehen`, 1) : ""}${!C.notify.to.length ? chip("bell", "Keine Meldung eingerichtet") : ""}</div></div>`;
    const tabs = [["ov", "Übersicht"], ["pl", "Grundriss"], ["wa", "Wartung"], ["se", "Einstellungen"]];
    const bar = `<div class="sftabs" role="tablist">${tabs.map(([k, t]) => `<button class="${k === tab ? "on" : ""}" data-act="sfxtab" data-k="${k}" role="tab" aria-selected="${k === tab}">${t}</button>`).join("")}</div>`;
    const body = tab === "pl" ? this._sfPlan(T) : tab === "wa" ? this._sfWart(T) : tab === "se" ? this._sfSet(T) : this._sfOv(T);
    return `${this._betaBox("Das Modul liest vorhandene Melder und meldet Alarme aufs Handy. Es ersetzt keine zertifizierten Rauchmelder oder Alarmanlage.")}${hero}${bar}${body}`;
  }
  /* ---- Übersicht: Ampel, Abfahrt-Prüfung, Ereignisse, Melder */
  _sfCardOld(x) {
    const C = this._sfx().cfg, KN = this._sfxKind(), adm = this._admin(), st = x.alarm ? ["alarm", "ALARM"] : x.off ? ["off", "Nicht erreichbar"] : ["ok", "In Ordnung"], bt = x.bat != null ? Math.max(0, Math.min(100, x.bat)) : null, bc = bt == null ? "" : bt < C.bat.pct ? "#f87171" : bt < 40 ? "#f59e0b" : "#34d399", where = [x.floor ? (this._sfPl().floors.find((f) => f.id === x.floor) || {}).n : "", x.room || x.area].filter(Boolean).join(" · ");
    return `<div class="sfd ${st[0]}"><div class="sfdh"><span class="sfdi">${ic(KN[x.k][1], 20)}</span><div class="sfdt"><b>${esc(x.name)}</b><small>${esc(x.kind)}${where ? " · " + esc(where) : ""}</small></div><span class="sfs ${st[0]}">${st[1]}</span></div>
      <div class="sfb">${bt != null ? `<div class="sfbar"><i style="width:${bt}%;background:${bc}"></i></div><span>${ic("energy", 13)} Batterie ${num(bt, 0)} %${bt < C.bat.pct ? " · schwach" : ""}</span>` : `<span class="mut">Batterie unbekannt</span>`}${x.alarm && x.since ? `<span class="sfsince">seit ${esc(this._sfAgo(x.since))}</span>` : ""}${adm && x.test ? `<button class="lnk" data-act="sfxpress" data-k="${esc(x.id)}">${ic("bell", 14)}Testen</button>` : ""}</div></div>`;
  }
  _sfOvParts(T) {
    const { S, C, l, al, low, off, due, life } = T, rows = this._sfDepRows(), H = this._hass;
    const dot = (c) => `<span class="sfdot ${c}"></span>`, ap = (c, a, b) => `<div class="sfap">${dot(c)}<span>${a}</span><b>${b}</b></div>`;
    const ampel = `<div class="card sfc"><h2>${ic("shield", 18)}Ampel</h2>
      ${ap(al.length ? "r" : "g", "Alarme", al.length ? `${al.length} aktiv` : "keine")}${ap(low.length ? "a" : "g", "Batterien", low.length ? `${low.length} schwach` : "in Ordnung")}${ap(off.length ? "a" : "g", "Erreichbarkeit", l.length ? `${l.length - off.length} von ${l.length}` : "–")}
      ${ap(due.length ? "a" : "g", "Prüfung", !C.test.on ? "aus" : due.length ? "fällig" : S.test && S.test.last ? "zuletzt " + this._sfAgo(S.test.last) : "läuft")}${ap(life.length ? "a" : "g", "Lebensdauer", life.length ? `${life.length} zu tauschen` : "in Ordnung")}</div>`;
    const pp = this._pres(), op = (this._ortPersons ? this._ortPersons() : []).filter((x) => x.count), pers = op, home = pp.mode === "away" || pp.mode === "vacation" ? 0 : op.filter((x) => x.home).length, fr = C.depart.frost, ft = fr.on && fr.ent && H.states[fr.ent] ? parseFloat(fr.ent.startsWith("weather.") ? H.states[fr.ent].attributes.temperature : H.states[fr.ent].state) : NaN;
    const water = l.filter((x) => x.k === "water" && x.alarm), open = rows.filter((x) => x.open);
    const dep = `<div class="card sfc"><h2>${ic("lock", 18)}Abfahrt-Prüfung${rows.length ? `<small class="${open.length ? "sfwarn" : "mut"}">${open.length ? `${open.length} offen` : "alles zu"}</small>` : ""}</h2>
      ${rows.length ? rows.map((x) => `<div class="sfap">${ic(x.ico, 16)}<span>${esc(x.name)}</span><span class="sft ${x.open ? "a" : "g"}">${x.txt.toUpperCase()}</span></div>`).join("") : `<div class="mut sm">Hier zeigt das Modul, was offen ist, bevor du gehst: Fenster, Türen, Herd, Garage. ${this._admin() ? `Wähle es unter <button class="lnk" data-act="sfxtab" data-k="se">Einstellungen</button> aus.` : ""}</div>`}
      ${pers.length ? `<div class="sfap">${ic("users", 16)}<span>Anwesenheit</span><b>${home ? `${home} von ${pers.length} zu Hause` : "alle unterwegs"}</b></div>` : ""}
      ${isFinite(ft) && ft < fr.below ? `<div class="sfhint warn">${ic("alert", 16)}<span>Frostgefahr: draußen ${num(ft, 0)} °C. Fenster schließen, Leitungen und Außenhahn prüfen.</span></div>` : ""}
      ${water.length ? `<div class="sfhint warn">${ic("drop", 16)}<span>Wasser gemeldet: ${esc(water.map((x) => x.name).join(", "))}</span></div>` : ""}
      ${rows.length && !home && open.length ? `<div class="sfhint warn">${ic("alert", 16)}<span>Niemand ist zu Hause, aber ${open.length} ${open.length === 1 ? "Ding ist" : "Dinge sind"} offen.</span></div>` : ""}</div>`;
    const lg = (S.log || []).slice(0, 12), col = { alarm: "#ef4444", warn: "#f59e0b", ok: "#34d399", off: "#94a3b8" };
    const log = `<div class="card sfc"><h2>${ic("clock", 18)}Ereignisse</h2>${lg.length ? `<div class="sftl">${lg.map((x) => `<div style="--c:${col[x.c] || "#64748b"}"><b>${esc(x.x)}</b><small>${esc(new Date(x.t).toLocaleString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }))}</small></div>`).join("")}</div>` : `<div class="mut sm">Noch keine Ereignisse. Alarme, schwache Batterien, Prüfungen und die Abfahrt-Prüfung erscheinen hier.</div>`}</div>`;
    const empty = !l.length ? `<div class="card sfc"><h2>${ic("puzzle", 18)}Melder verbinden</h2><div class="mut sm" style="margin:0 0 10px">Das Modul liest Melder mit der Geräteklasse Rauch, CO, Gas, Wasser, Hitze oder Sicherheit. Für X-Sense, Zigbee, Z-Wave und Homematic gibt es unter Einstellungen → Integrationen eine Anleitung.</div>${this._admin() ? `<button class="btn2 pri" data-act="sfxgoig" style="flex:none;padding:10px 18px">${ic("puzzle", 16)} Integrationen öffnen</button>` : ""}</div>` : "";
    const list = l.length ? `<div class="card sfc"><h2>${ic("bell", 18)}Melder<small class="mut">${l.length}</small></h2><div class="sfg">${l.map((x) => this._sfCard(x)).join("")}</div></div>` : "";
    return { empty, ampel, log, dep, list };
  }
  _sfOvOld(T) { const p = this._sfOvParts(T); return `${p.empty}<div class="enc"><div class="enco">${p.ampel}${p.log}</div><div class="enco">${p.dep}</div></div>${p.list}`; }
  /* ---- Grundriss: Ansicht und Baukasten */
  _sfPlanInner(fl, edit) {
    const S = this._sfx(), P = this._sfPl(), dm = this._sfDetMap(), items = P.items.filter((i) => i.fl === fl), KN = this._sfxKind(), ed = this._sfEd, sel = edit && ed ? ed.sel : "", ord = ["r", "s", "w", "d", "f", "x", "l", "m"], liOn = !!(this._liOn && this._liOn());
    const mk = items.filter((i) => i.t === "m" && i.e && dm[i.e] && dm[i.e].alarm);
    const inside = (r, m) => this._sfInRoom(r, m.x, m.y, -0.01);
    let out = P.bg[fl] ? `<image href="${P.bg[fl]}" x="0" y="0" width="800" height="480" preserveAspectRatio="xMidYMid meet" opacity=".6"></image>` : "";
    if (edit) out += `<defs><pattern id="sfgr" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" class="sfgd"></circle></pattern></defs><rect width="800" height="480" fill="url(#sfgr)"></rect>`;
    out += this._sfHalos(items, dm);
    const wn = items.filter((i) => i.t === "m" && i.e && dm[i.e] && !dm[i.e].alarm && ["w", "o"].includes(this._sfMkState(dm[i.e])));
    const sorted = [...items].sort((a, b) => ord.indexOf(a.t) - ord.indexOf(b.t));
    sorted.forEach((i) => {
      const id = `data-id="${i.id}"`, a = i.r ? ` transform="rotate(${i.r} ${i.x} ${i.y})"` : "";
      if (i.t === "r") out += `<g ${id}><path class="sfr${i.ds ? " ds" : ""}${mk.some((m) => inside(i, m)) ? " al" : wn.some((m) => inside(i, m)) ? " wn" : ""}" d="${this._sfRPath(i)}"></path><text class="sfrn" x="${this._sfRLab(i)[0]}" y="${this._sfRLab(i)[1]}">${esc(i.n)}</text></g>`;
      else if (i.t === "s") out += `<g ${id}><rect class="sfst" x="${i.x}" y="${i.y}" width="${i.w}" height="${i.h}"></rect>${Array.from({ length: Math.max(2, Math.floor(i.h / 14)) }, (_, k) => `<path class="sfsl" d="M${i.x} ${i.y + 7 + k * 14}H${i.x + i.w}"></path>`).join("")}<text class="sfrn" x="${i.x + 6}" y="${i.y + 16}">${esc(i.n)}</text></g>`;
      else if (i.t === "w") out += `<g ${id}><path class="sfw" d="M${i.x} ${i.y}L${i.x2} ${i.y2}"></path><path class="sfhit" d="M${i.x} ${i.y}L${i.x2} ${i.y2}"></path></g>`;
      else if (i.t === "d") out += `<g ${id}${a}><rect class="sfdg" x="${i.x - 15}" y="${i.y - 3.5}" width="30" height="7"></rect>${i.dg ? `<path class="sfda" d="M${i.x - 15} ${i.y - 6}v12M${i.x + 15} ${i.y - 6}v12"></path>` : `<path class="sfda" d="M${i.x - 15} ${i.y}a15 15 0 0 1 15 -15"${i.mh || i.mv ? ` transform="translate(${i.x} ${i.y}) scale(${i.mh ? -1 : 1} ${i.mv ? -1 : 1}) translate(${-i.x} ${-i.y})"` : ""}></path>`}<rect class="sfhit" x="${i.x - 16}" y="${i.y - 16}" width="32" height="32"></rect></g>`;
      else if (i.t === "f") out += `<g ${id}${a}><rect class="sffw" x="${i.x - 17}" y="${i.y - 3.5}" width="34" height="7"></rect><rect class="sfhit" x="${i.x - 18}" y="${i.y - 14}" width="36" height="28"></rect></g>`;
      else if (i.t === "x") out += `<text ${id} class="sftx" x="${i.x}" y="${i.y}">${esc(i.n || "Text")}</text>`;
      else if (i.t === "l") {   /* Lampe (Modul 18): nur sichtbar, wenn das Addon an ist. Leuchtet in ihrer Farbe, wenn sie an ist. */
        if (!liOn) return;
        const st = i.e && this._hass.states[i.e], on = !!(st && st.state === "on"), un = !st || st.state === "unavailable", c = on && this._liLampHex ? this._liLampHex(i.e) : "#ffd27a";
        const body = i.k === "streifen" ? `<rect class="sflp" x="${i.x - 22}" y="${i.y - 4}" width="44" height="8" rx="4"${a}></rect>` : `<circle class="sflp" cx="${i.x}" cy="${i.y}" r="${i.k === "spot" ? 6 : 9}"></circle>${i.k === "steh" ? `<path class="sflf" d="M${i.x} ${i.y + 9}v7M${i.x - 5} ${i.y + 16}h10"></path>` : ""}`;
        out += `<g ${id} class="sfli${on ? " on" : ""}${un ? " un" : ""}${i.e ? "" : " no"}" style="--lc:${c}">${on ? `<circle class="sflg" cx="${i.x}" cy="${i.y}" r="24"></circle>` : ""}${body}<circle class="sfhit" cx="${i.x}" cy="${i.y}" r="18"></circle><title>${esc(i.e ? this._wzName(i.e) : "Lampe ohne Entität")}</title></g>`;
      }
      else if (i.t === "m") {
        const d = i.e ? dm[i.e] : null, c = !d ? "n" : d.alarm ? "a" : d.off ? "o" : d.bat != null && d.bat < S.cfg.bat.pct ? "w" : "g", ico = d ? KN[d.k][1] : "shield";
        out += `<g ${id} class="sfmk ${c}">${c === "a" ? `<circle class="sfpulse" cx="${i.x}" cy="${i.y}" r="26"></circle>` : ""}<circle class="sfmc" cx="${i.x}" cy="${i.y}" r="15"></circle><g transform="translate(${i.x - 8} ${i.y - 8})">${ic(ico, 16)}</g>${d && d.bat != null && d.bat < S.cfg.bat.pct ? `<text class="sfbt" x="${i.x + 19}" y="${i.y + 4}">${num(d.bat, 0)} %</text>` : ""}<circle class="sfhit" cx="${i.x}" cy="${i.y}" r="20"></circle></g>`;
      }
    });
    if (!edit && mk.length) {  /* Fluchtweg: Linie vom alarmierenden Melder zur nächsten Tür (Luftlinie, Plan prüfen) */
      const e = this._sfEscapeFor(mk[0]);
      if (e) out += this._sfEscSvg(e);
    }
    if (edit && ed && ed.multi && ed.multi.length) items.filter((i) => ed.multi.includes(i.id)).forEach((i) => { out += i.t === "w" ? `<path class="sfsel" d="M${i.x} ${i.y}L${i.x2} ${i.y2}" style="stroke-width:6"></path>` : i.t === "r" && i.pts ? `<path class="sfsel" d="${this._sfRPath(i)}"></path>` : i.t === "r" || i.t === "s" ? `<rect class="sfsel" x="${i.x}" y="${i.y}" width="${i.w}" height="${i.h}"></rect>` : `<circle class="sfsel" cx="${i.x}" cy="${i.y}" r="22"></circle>`; });
    if (sel) {
      const i = items.find((x) => x.id === sel);
      if (i) {
        const hd = (k, x, y) => `<g data-h="${k}"><circle class="sfhh" cx="${x}" cy="${y}" r="18"></circle><rect class="sfhd" x="${x - 5}" y="${y - 5}" width="10" height="10" rx="2"></rect></g>`;
        if (i.t === "r" && i.pts) out += `<path class="sfsel" d="${this._sfRPath(i)}"></path>${this._sfRHandles(i, ed.vsel)}`;
        else if (i.t === "r" || i.t === "s") out += `<rect class="sfsel" x="${i.x}" y="${i.y}" width="${i.w}" height="${i.h}"></rect>${hd("br", i.x + i.w, i.y + i.h)}`;
        else if (i.t === "w") out += hd("p1", i.x, i.y) + hd("p2", i.x2, i.y2);
        else out += `<circle class="sfsel" cx="${i.x}" cy="${i.y}" r="${i.t === "m" ? 22 : 20}"></circle>`;
      }
    }
    return out;
  }
  /* ---- Lampen im Baukasten (Modul 18 ab Build 5). Ohne Addon „licht“ bleiben sie unsichtbar und unverändert gespeichert. */
  _sfLampIds() { const st = this._hass.states; if (this._liMine && this._liMine()) return (this._liD().lamps || []).map((x) => x.e).filter((e) => st[e]).sort((a, b) => this._wzName(a).localeCompare(this._wzName(b), "de"));   /* Modul 18 „Meine Lampen“: nur deine Lampen */
    return Object.keys(st).filter((e) => e.startsWith("light.") && !Array.isArray((st[e].attributes || {}).entity_id)).sort((a, b) => this._wzName(a).localeCompare(this._wzName(b), "de")); }
  _sfLampName(e) { const c = this._liMine && this._liMine() && this._liCfg ? this._liCfg()[e] : null; return (c && c.n) || this._wzName(e); }
  _sfLampFree(P) {
    if (!(this._liOn && this._liOn())) return "";
    const pl = new Set(P.items.filter((i) => i.t === "l" && i.e).map((i) => i.e)), free = this._sfLampIds().filter((e) => !pl.has(e));
    if (!free.length) return "";
    const cnt = {}; free.forEach((e) => { const n = this._sfLampName(e); cnt[n] = (cnt[n] || 0) + 1; });   /* gleiche Namen (z. B. zwei „H70D1“): Entitäts-ID dazu */
    return `<div class="sffld"><label>Noch nicht platzierte Lampen (antippen setzt sie in ihren Raum, sonst in die Mitte)</label><div class="gschips">${free.slice(0, 60).map((e) => `<button class="gsch" data-act="sfxlplace" data-k="${esc(e)}" title="${esc(e)}">${esc(this._sfLampName(e))}${cnt[this._sfLampName(e)] > 1 ? `<small class="mut"> · ${esc(e.replace(/^light\./, ""))}</small>` : ""}${this._liAreaOf && this._liAreaOf(e) ? `<small class="mut"> · ${esc(this._liAreaName(this._liAreaOf(e)))}</small>` : ""}</button>`).join("")}${free.length > 60 ? `<span class="mut sm">+${free.length - 60}</span>` : ""}</div></div>`;
  }
  _sfLampProps(sel) {
    const pl = new Set(this._sfEd.plan.items.filter((i) => i.t === "l" && i.e && i.id !== sel.id).map((i) => i.e)), ids = this._sfLampIds().filter((e) => !pl.has(e) || e === sel.e);
    const K = [["decke", "Decke"], ["steh", "Steh"], ["spot", "Spot"], ["streifen", "Streifen"], ["aussen", "Außen"]];
    return `<div class="sffld"><label>Lampe aus Home Assistant</label>${this._sfSel(ids, sel.e || "", "sfxpl", "", "– keine –")}</div>
      <div class="sffld"><label>Art</label><div class="sfshp" style="grid-template-columns:repeat(5,1fr)">${K.map(([k, t]) => `<button data-act="sfxplk" data-v="${k}" class="${(sel.k || "decke") === k ? "on" : ""}">${t}</button>`).join("")}</div>
      <small class="mut" style="display:block">Streifen erscheint als Balken und lässt sich drehen. Hat die Lampe keinen Bereich in Home Assistant, bekommt sie in Modul 18 den Raum, in dem sie hier steht.</small></div>`;
  }
  _sfFloorBar(edit) {
    const P = this._sfPl(), fl = this._sfFl();
    return `<span class="sffl">${P.floors.map((f) => `<button class="${f.id === fl ? "on" : ""}" data-act="sfxfl" data-k="${f.id}">${esc(f.n)}</button>`).join("")}${edit && P.floors.length < 6 ? `<button data-act="sfxfadd" aria-label="Etage hinzufügen">+ Etage</button>` : ""}</span>`;
  }
  _sfPlan(T) {
    const adm = this._admin(), ed = this._sfEd, fl = this._sfFl(), P = this._sfPl(), n = P.items.length;
    if (!ed) {
      const al = T.al, sel = this._sfSelDet && T.l.find((x) => x.id === this._sfSelDet), here = P.items.filter((i) => i.fl === fl && i.t === "m").length;
      const empty = !n ? `<div class="sfemp">${ic("home", 34)}<b>Noch kein Grundriss</b><span>${adm ? "Zeichne dein Haus mit dem Baukasten: Räume, Wände, Türen und Fenster ziehen, dann die Melder darauf setzen." : "Ein Administrator kann den Grundriss zeichnen."}</span>${adm ? `<button class="btn2 pri" data-act="sfxedit" style="flex:none;padding:10px 20px">${ic("pencil", 16)} Grundriss zeichnen</button>` : ""}</div>` : "";
      const nw = this._sfNew(), KN = this._sfxKind(), dm = this._sfDetMap(), fobj = P.floors.find((f) => f.id === fl) || {}, onFl = P.items.filter((i) => i.fl === fl && i.t === "m" && i.e && dm[i.e]).map((i) => dm[i.e]);
      const cv = this._sfCoverage(fl), ec = this._sfEscCheck(fl), rooms = cv.rooms, covered = cv.covered;
      const stc = (x) => { const s = this._sfSt(x); return { alarm: ["ALARM", "#ef4444"], pause: ["ausgeschaltet", "#94a3b8"], off: ["nicht erreichbar", "#94a3b8"], warn: [`Batterie ${num(x.bat, 0)} %`, "#f59e0b"], ok: ["In Ordnung", "#34d399"] }[s]; };
      const lrow = (x) => { const s = stc(x); return `<button class="sflr${sel && sel.id === x.id ? " on" : ""}" data-act="sfxplsel" data-k="${esc(x.id)}"><span class="sfmi">${this._sfHd(x.k, this._sfSt(x), 32)}</span><span class="sfmn"><b>${esc(x.name)}</b><small>${esc(x.room || x.area || "ohne Raum")}</small></span><span class="sfls" style="color:${s[1]}"><i style="background:${s[1]}"></i>${s[0]}</span></button>`; };
      const kts = nw && n ? `<div class="sfkts sfk3"><div class="sfkt">${ic("shield", 18)}<i style="background:#34d399"></i><small>Melder ${esc(fobj.n || "")}</small><b>${onFl.length}</b><em>von ${T.l.length} gesamt</em></div><div class="sfkt">${ic("home", 18)}<i style="background:${cv.open.length ? "#f59e0b" : "#34d399"}"></i><small>Abdeckung</small><b>${rooms.length ? `${covered.length} von ${rooms.length} Räumen` : "keine Räume"}</b><em>${cv.open.length ? esc(cv.open.map((r) => r.n).filter(Boolean).slice(0, 2).join(", ") || "Raum") + " ohne Melder" : rooms.length ? "alle mit Melder" : "Räume im Plan ergänzen"}</em></div><div class="sfkt">${ic("door", 18)}<i style="background:${ec.exits && !ec.bad.length ? "#34d399" : "#f59e0b"}"></i><small>Fluchtweg</small><b>${ec.exits ? (ec.explicit ? [ec.nd ? `${ec.nd} ${ec.nd === 1 ? "Außentür" : "Außentüren"}` : "", ec.ns ? `${ec.ns} ${ec.ns === 1 ? "Treppe" : "Treppen"}` : ""].filter(Boolean).join(" · ") : `${ec.exits} ${ec.exits === 1 ? "Außentür" : "Außentüren"}`) : ec.doors ? "kein Ausgang markiert" : "keine Tür"}</b><em>${ec.markers && ec.bad.length ? `${ec.bad.length} ${ec.bad.length === 1 ? "Melder" : "Melder"} ohne freien Weg` : ec.exits ? "jeder Melder hat einen Weg" : "Tür im Plan ergänzen"}</em></div></div>` : "";
      const leg = nw ? `<span class="sfleg"><span><i style="background:#34d399"></i>in Ordnung</span><span><i style="background:#f59e0b"></i>Hinweis</span><span><i style="background:#ef4444"></i>Alarm</span><span><i style="background:#94a3b8"></i>aus</span></span>` : "";
      const listc = nw && onFl.length ? `<div class="card sfc"><h2>${ic("bell", 18)}Melder ${esc(fobj.n || "")}<small class="mut">${onFl.length}</small></h2>${onFl.map(lrow).join("")}</div>` : "";
      const one = sel ? `<div class="card sfc"><h2>${ic(KN[sel.k][1], 18)}${esc(sel.name)}</h2>${nw ? "" : this._sfCard(sel)}${this._sfDetFacts(sel)}</div>` : "";
      const side = nw ? `${al.length ? `<div class="card sfc"><h2>${ic("alert", 18)}Alarm</h2>${al.map((x) => this._sfCard(x)).join("")}${this._sfEscHint(al[0])}</div>` : ""}${listc}${one}${!listc && !al.length && !one ? `<div class="card sfc"><h2>${ic("info", 18)}Tipp</h2><div class="mut sm">Tippe auf einen Melder im Plan, dann siehst du Batterie, Einbaudatum und Prüfung.${here ? "" : " Auf dieser Etage sitzt noch kein Melder."}</div></div>` : ""}`
        : sel ? `<div class="card sfc"><h2>${ic("bell", 18)}${esc(sel.name)}</h2>${this._sfCard(sel)}${this._sfDetFacts(sel)}</div>` : al.length ? `<div class="card sfc"><h2>${ic("alert", 18)}Alarm</h2>${al.map((x) => this._sfCard(x)).join("")}${this._sfEscHint(al[0])}</div>` : `<div class="card sfc"><h2>${ic("info", 18)}Tipp</h2><div class="mut sm">Tippe auf einen Melder im Plan, dann siehst du Batterie, Einbaudatum und Prüfung.${here ? "" : " Auf dieser Etage sitzt noch kein Melder."}</div></div>`;
      return `${kts}<div class="enc"><div class="enco"><div class="card sfc"><h2>${ic("home", 18)}Grundriss<span class="sfhr">${this._sfFloorBar(false)}${adm && n ? `<button class="sfed" data-act="sfxedit" title="Der Baukasten liegt in Modul 0 · Haus & Grundriss. Nach dem Speichern geht es hierher zurück.">${ic("pencil", 14)} Bearbeiten</button>` : ""}</span></h2>${leg ? `<div class="sflegw">${leg}</div>` : ""}${n ? `<div class="sfpl"><svg class="sfpv" viewBox="0 0 800 480" role="img" aria-label="Grundriss">${this._sfPlanInner(fl, false)}</svg></div>` : empty}</div></div><div class="enco">${side}</div></div>`;
    }
    const sel = P.items.find((x) => x.id === ed.sel), dm = this._sfDetMap(), placed = new Set(P.items.filter((i) => i.t === "m" && i.e).map((i) => i.e)), free = T.l.filter((d) => !placed.has(d.id));
    const tile = (k, t, p) => `<button class="sfti${ed.tool === k ? " on" : ""}" data-act="sfxtool" data-k="${k}" aria-pressed="${ed.tool === k}"><svg viewBox="0 0 34 34" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${p}</svg>${t}</button>`;
    const PP = { select: '<path d="M9 6l16 9-7 2-3 7z"/>', r: '<rect x="5" y="7" width="24" height="20" rx="2"/>', w: '<path d="M5 27 29 7" stroke-width="3"/>', d: '<path d="M8 27V9h18M8 9a18 18 0 0 1 18 18"/>', f: '<rect x="5" y="14" width="24" height="6"/><path d="M17 14v6"/>', s: '<path d="M6 28h6v-6h6v-6h6v-6h4"/>', x: '<path d="M8 9h18M17 9v17"/>', smoke: '<circle cx="17" cy="17" r="10"/><path d="M17 11c1 3 4 3 4 6a4 4 0 0 1-8 0c0-2 1-3 2-5z"/>', co: '<circle cx="17" cy="17" r="10"/><path d="M12 14v6M16 14h4v6h-4z"/>', gas: '<circle cx="17" cy="17" r="10"/><path d="M13 21c0-5 4-4 4-9 3 2 5 5 4 9z"/>', water: '<circle cx="17" cy="17" r="10"/><path d="M17 9c3 4 5 6 5 9a5 5 0 0 1-10 0c0-3 2-5 5-9z"/>', heat: '<circle cx="17" cy="17" r="10"/><path d="M17 9v10a3 3 0 1 1-3 3"/>', bg: '<rect x="5" y="7" width="24" height="20" rx="2"/><circle cx="12" cy="14" r="2"/><path d="M7 25l7-6 5 4 4-3 4 5"/>' };
    const fname = P.floors.find((f) => f.id === fl);
    const mlt = ed.multi || [], multiBox = `<div class="sfpr"><b>${mlt.length} Elemente ausgewählt</b><div class="mut sm" style="margin:4px 0 8px">Tippe weitere Elemente an oder ziehe eines, um alle zu verschieben.</div><div class="sfbtn"><button class="btn2" data-act="sfxmdup">Duplizieren</button><button class="btn2 sfdel" data-act="sfxmdel">Löschen</button></div><button class="btn2" data-act="sfxmclr" style="flex:none;width:100%;margin-top:8px">Auswahl aufheben</button></div>`;
    const prop = mlt.length ? multiBox : !sel ? `<div class="mut sm">Wähle ein Element im Plan aus, oder ein Werkzeug links. Räume und Wände ziehst du auf, alles andere setzt du mit einem Tipp.</div>`
      : `<div class="sfpr"><b>${{ r: "Raum", w: "Wand", d: "Tür", f: "Fenster", s: "Treppe", x: "Text", m: "Melder" }[sel.t === "d" && sel.dg ? "x" : sel.t] === "Text" && sel.t === "d" ? "Durchgang" : { r: "Raum", w: "Wand", d: "Tür", f: "Fenster", s: "Treppe", x: "Text", m: "Melder", l: "Lampe" }[sel.t]}</b>
        ${sel.t === "r" || sel.t === "s" || sel.t === "x" ? `<div class="sffld"><label>Name</label><input class="osel" data-f="sfxpn" value="${esc(sel.n)}" maxlength="30" placeholder="${sel.t === "x" ? "Text" : "zum Beispiel Küche"}"></div>` : ""}
        ${sel.t === "r" || sel.t === "s" ? `<div class="vrow" style="margin:6px 0"><span>Breite</span><div class="step" style="flex:none"><button data-act="sfxpw" data-s="-20" aria-label="schmaler">${ic("minus", 16)}</button><b>${sel.w}</b><button data-act="sfxpw" data-s="20" aria-label="breiter">${ic("plus", 16)}</button></div></div><div class="vrow" style="margin:6px 0"><span>Höhe</span><div class="step" style="flex:none"><button data-act="sfxph" data-s="-20" aria-label="niedriger">${ic("minus", 16)}</button><b>${sel.h}</b><button data-act="sfxph" data-s="20" aria-label="höher">${ic("plus", 16)}</button></div></div>` : ""}
        ${sel.t === "r" ? this._sfRPanel(sel) : ""}
        ${sel.t === "r" ? `<div class="sfshp" style="grid-template-columns:repeat(2,1fr)"><button data-act="sfxpds" class="${sel.ds ? "on" : ""}">Rand nur gestrichelt</button><button data-act="sfxpds" data-v="all">Alle Räume der Etage</button></div><small class="mut" style="display:block">Gestrichelte Räume sind nur Flächen mit Namen. Wände zeichnest du extra, nur sie sperren den Weg.</small>` : ""}
        ${sel.t === "d" || sel.t === "s" ? `<div class="sffld"><label>${sel.t === "d" ? "Art der Tür" : "Treppe"}</label><div class="sfshp" style="grid-template-columns:repeat(2,1fr)"><button data-act="sfxpex" data-v="0" class="${sel.ex === 1 ? "" : "on"}">${sel.t === "d" ? "Innentür" : "Kein Ausgang"}</button><button data-act="sfxpex" data-v="1" class="${sel.ex === 1 ? "on" : ""}">${sel.t === "d" ? "Außentür" : "Ausgang nach unten"}</button></div><small class="mut" style="display:block">Nur markierte Ausgänge zählen für den Fluchtweg.</small></div>` : ""}
        ${sel.t === "d" || sel.t === "f" || (sel.t === "l" && sel.k === "streifen") ? `<button class="btn2" data-act="sfxprot" style="flex:none;width:100%;margin:6px 0">Drehen</button>` : ""}
        ${sel.t === "d" ? `<div class="sfshp" style="grid-template-columns:repeat(2,1fr)"><button data-act="sfxpdg" data-v="0" class="${sel.dg ? "" : "on"}">Tür</button><button data-act="sfxpdg" data-v="1" class="${sel.dg ? "on" : ""}">Durchgang</button></div>` : ""}
        ${sel.t === "d" && !sel.dg ? `<div class="sfshp" style="grid-template-columns:repeat(2,1fr)"><button data-act="sfxpmir" data-k="mv" class="${sel.mv ? "on" : ""}">Öffnung spiegeln (innen/außen)</button><button data-act="sfxpmir" data-k="mh" class="${sel.mh ? "on" : ""}">Angel spiegeln (links/rechts)</button></div>` : ""}
        ${sel.t === "l" ? this._sfLampProps(sel) : ""}
        ${sel.t === "m" ? `<div class="sffld"><label>Melder (aus den Einstellungen)</label>${this._sfSel(T.l.map((d) => d.id), sel.e || "", "sfxpe", "", "– keiner –")}</div>` : ""}
        ${sel.t === "m" ? `<div class="vrow" style="margin:6px 0"><span>Reichweite<small class="mut" style="display:block">Wie weit der Melder im Plan reicht</small></span><div class="step" style="flex:none"><button data-act="sfxprg" data-s="-1" aria-label="weniger">${ic("minus", 16)}</button><b>${num(this._sfRangeM(sel, sel.e ? dm[sel.e] : null), 1)} m</b><button data-act="sfxprg" data-s="1" aria-label="mehr">${ic("plus", 16)}</button></div></div>` : ""}${sel.t === "r" ? `<div class="sffld"><label>Raum aus Modul 1 (optional)</label><div class="gschips"><button class="gsch ${!sel.lk ? "sel" : ""}" data-act="sfxplkset" data-v="">keiner</button>${this._sfRoomNames().map((n) => `<button class="gsch ${sel.lk === n ? "sel" : ""}" data-act="sfxplkset" data-v="${esc(n)}">${esc(n)}</button>`).join("")}</div></div>` : ""}
        <div class="sfbtn"><button class="btn2" data-act="sfxpdup">Duplizieren</button><button class="btn2 sfdel" data-act="sfxpdel">Löschen</button></div></div>`;
    const bgBox = `<div class="sffld"><label>Hintergrundbild für ${esc(fname.n)} (zum Beispiel ein Foto deines Bauplans)</label><div class="sfbtn"><label class="btn2 sffile">${ic("image", 15)} ${P.bg[fl] ? "Ersetzen" : "Bild wählen"}<input type="file" accept="image/*" data-f="sfxbg" hidden></label>${P.bg[fl] ? `<button class="btn2" data-act="sfxbgrm">Entfernen</button>` : ""}</div></div>`;
    const flBox = `<div class="sffld"><label>Name der Etage</label><div class="sfbtn"><input class="osel" data-f="sfxfn" value="${esc(fname.n)}" maxlength="16">${P.floors.length > 1 ? `<button class="btn2 sfdel" data-act="sfxfrm" style="flex:none">Etage löschen</button>` : ""}</div></div>`;
    const scW = Math.round(800 / this._sfScale()), scaleBox = `<div class="sffld"><label>Maßstab: Wie breit ist der Plan in Wirklichkeit?</label><div class="gschips">${[10, 15, 20, 30].map((w) => `<button class="gsch ${scW === w ? "sel" : ""}" data-act="sfxpscale" data-k="${w}" aria-pressed="${scW === w}">${w} m</button>`).join("")}</div><div class="mut sm">Damit stimmen die Reichweiten der Melder und die Länge des Fluchtwegs.</div></div>`;
    const ioBox = `<div class="sffld"><label>Plan sichern oder einlesen</label><div class="sfbtn"><button class="btn2" data-act="sfxpexp">${ic("download", 15)} Plan sichern</button><label class="btn2 sffile">${ic("upload", 15)} Plan einlesen<input type="file" accept="application/json,.json" data-f="sfxpimp" hidden></label></div></div>`;
    const tb = `<div class="sftb2"><button class="btn2" data-act="sfxundo" ${(ed.hist || []).length ? "" : "disabled"}>↶ Rückgängig</button><button class="btn2" data-act="sfxredo" ${(ed.fut || []).length ? "" : "disabled"}>↷ Wiederholen</button><button class="btn2${ed.mm ? " pri" : ""}" data-act="sfxmm" aria-pressed="${!!ed.mm}">Mehrfach</button></div>`;
    return `<div class="enc"><div class="enco"><div class="card sfc"><h2>${ic("home", 18)}Grundriss bearbeiten<span class="sfhr">${this._sfFloorBar(true)}</span></h2>${tb}
      <div class="sfpl edit"><svg class="sfpe" viewBox="0 0 800 480" role="img" aria-label="Grundriss bearbeiten">${this._sfPlanInner(fl, true)}</svg></div>
      <div class="sfhint">${ic("info", 15)}<span>${{ select: "Elemente antippen und ziehen. Am Eckpunkt ändert sich die Größe.", r: "Auf dem Plan ziehen, um einen Raum aufzuziehen.", s: "Auf dem Plan ziehen, um eine Treppe aufzuziehen.", w: "Auf dem Plan ziehen, um eine Wand zu zeichnen." }[ed.tool] || "Auf den Plan tippen, um das Element zu setzen."}</span></div>
      ${this._sfLampFree(P)}
      ${free.length ? `<div class="sffld"><label>Noch nicht platzierte Melder (antippen setzt sie in die Mitte)</label><div class="gschips">${free.map((d) => `<button class="gsch" data-act="sfxplace" data-k="${esc(d.id)}">${esc(d.name)}</button>`).join("")}</div></div>` : ""}</div></div>
      <div class="enco"><div class="card sfc"><div class="sfgrp">RÄUME UND BAUTEILE</div><div class="sftiles">${tile("select", "Auswählen", PP.select)}${tile("r", "Raum", PP.r)}${tile("w", "Wand", PP.w)}${tile("d", "Tür", PP.d)}${tile("dg", "Durchgang", '<path d="M5 10h7M22 10h7M5 24h7M22 24h7M12 7v6M22 7v6M12 21v6M22 21v6"/>')}${tile("f", "Fenster", PP.f)}${tile("s", "Treppe", PP.s)}</div>
        ${this._mdList().some((m) => m.id === "sf") ? `<div class="sfgrp">MELDER (MODUL 11) UND TEXT</div><div class="sftiles">${tile("m:smoke", "Rauch", PP.smoke)}${tile("m:co", "CO", PP.co)}${tile("m:gas", "Gas", PP.gas)}${tile("m:water", "Wasser", PP.water)}${tile("m:heat", "Hitze", PP.heat)}${tile("x", "Text", PP.x)}</div>` : `<div class="sfgrp">TEXT</div><div class="sftiles">${tile("x", "Text", PP.x)}</div>`}${this._liOn && this._liOn() ? `<div class="sfgrp">LICHT (MODUL 18)</div><div class="sftiles">${tile("l", "Lampe", '<path d="M12 22a7 7 0 1 1 10 0c-1 1-1.5 2-1.5 3.5h-7c0-1.5-.5-2.5-1.5-3.5z"/><path d="M14 29h6"/>')}</div>` : ""}</div>
        <div class="card sfc">${prop}</div><div class="card sfc">${flBox}${scaleBox}${bgBox}${ioBox}</div>
        <div class="sfbtn"><button class="btn2" data-act="sfxcancel">Abbrechen</button><button class="btn2 pri" data-act="sfxsave">Speichern</button></div></div></div>`;
  }
  _sfDetFacts(x) {
    const C = this._sfx().cfg, rows = [["Eingebaut", x.inst ? this._sfMon(x.inst) : "nicht eingetragen"], ["Tausch fällig", x.life && x.inst ? this._sfMon((+x.inst.slice(0, 4) + x.life) + x.inst.slice(4)) : "nicht eingetragen"], ["Zuletzt geprüft", this._sfDate(x.tested || (this._sfx().test || {}).last)], ["Batterie-Typ", x.btype || "nicht eingetragen"]];
    if (x.bat_days != null) rows.splice(1, 0, ["Batterie reicht noch", "etwa " + this._sfDur(x.bat_days)]);
    return `<div class="sffacts">${rows.map(([a, b]) => `<div><span>${a}</span><b>${esc(b)}</b></div>`).join("")}</div>${this._admin() ? `<div class="sfbtn" style="margin-top:10px">${x.test ? `<button class="btn2" data-act="sfxpress" data-k="${esc(x.id)}">Test auslösen</button>` : ""}<button class="btn2" data-act="sfxtested" data-k="${esc(x.id)}">Als geprüft</button></div>` : ""}`;
  }
  /* ---- Wartung */
  _sfWartParts(T) {
    const { S, C, l, life, due } = T, adm = this._admin(), now = Date.now(), bad = (x) => x.life_days != null && x.life_days < 0;
    const row = (x) => {
      const m = x.inst && x.life ? (() => { const s = new Date(x.inst + "-01").getTime(), e = new Date((+x.inst.slice(0, 4) + x.life) + x.inst.slice(4) + "-01").getTime(); return Math.max(0, Math.min(100, ((now - s) / (e - s)) * 100)); })() : null;
      const st = bad(x) ? ["r", "Tausch überfällig"] : x.life_days != null && x.life_days <= C.lead ? ["a", `Tausch in ${this._sfDur(x.life_days)}`] : x.test_due ? ["a", "Prüfung fällig"] : ["g", "In Ordnung"];
      const c = st[0] === "r" ? "#ef4444" : st[0] === "a" ? "#f59e0b" : "#34d399";
      return `<div class="sfwr"><div class="sfwm"><b>${esc(x.name)}</b>
        <small>${x.inst ? `Einbau ${this._sfMon(x.inst)}${x.life ? ` · Tausch ${this._sfMon((+x.inst.slice(0, 4) + x.life) + x.inst.slice(4))}` : ""}` : (adm ? `<button class="lnk" data-act="sfxeditdet" data-k="${esc(x.id)}">Einbaudatum eintragen</button>` : "Kein Einbaudatum")}</small>
        <small>${x.bat != null ? `Batterie ${num(x.bat, 0)} %${x.bat_days != null ? ` · reicht noch etwa ${this._sfDur(x.bat_days)}` : ""}` : "Batterie unbekannt"} · zuletzt geprüft ${esc(this._sfDate(x.tested || (S.test || {}).last))}</small>
        ${m != null ? `<div class="sfbar" style="margin-top:6px;max-width:300px"><i style="width:${m}%;background:${c}"></i></div>` : ""}</div>
        <div class="sfwr2"><span class="sft ${st[0]}">${st[1].toUpperCase()}</span>${adm ? `<button class="lnk" data-act="sfxtested" data-k="${esc(x.id)}">${ic("check", 14)}Geprüft</button>` : ""}</div></div>`;
    };
    const shop = {};
    l.forEach((x) => { if (x.bat != null && (x.bat < C.bat.pct + 10 || (x.bat_days != null && x.bat_days < 90))) { const k = x.btype || "Batterie (Typ fehlt)"; (shop[k] = shop[k] || []).push(x.name); } });
    const newd = l.filter((x) => bad(x)).map((x) => x.name);
    const list = `<div class="card sfc"><h2>${ic("clock", 18)}Lebensdauer und Batterie</h2>${l.length ? `<div class="sfwg">${l.map(row).join("")}</div>` : `<div class="mut sm">Noch keine Melder.</div>`}</div>`;
    const sl = `<div class="card sfc"><h2>${ic("energy", 18)}Einkaufsliste</h2>${Object.keys(shop).length || newd.length ? `${Object.keys(shop).map((k) => `<div class="sfap"><span>${shop[k].length} × ${esc(k)}<small class="mut" style="display:block">${esc(shop[k].join(", "))}</small></span><b>bald</b></div>`).join("")}${newd.length ? `<div class="sfap"><span>${newd.length} × neuer Melder<small class="mut" style="display:block">${esc(newd.join(", "))}</small></span><b>fällig</b></div>` : ""}<div class="sfbtn" style="margin-top:8px"><button class="btn2" data-act="sfxcopy">${ic("copy", 15)} Liste kopieren</button></div>` : `<div class="mut sm">Im Moment ist nichts zu besorgen. Batterien unter ${C.bat.pct + 10} % und Melder am Ende der Lebensdauer erscheinen hier.</div>`}</div>`;
    const yr = new Date().getFullYear(), pr = `<div class="card sfc"><h2>${ic("list", 18)}Jahresprotokoll ${yr}</h2><div class="mut sm" style="margin:0 0 10px">Eine Seite zum Abheften oder für Vermieter und Versicherung: alle Melder mit Einbau, Tausch, letzter Prüfung und Batterie. ${C.proto.name || C.proto.addr ? "" : `Name und Adresse für den Kopf trägst du in den Einstellungen ein.`}</div>
      <div class="sfbtn"><button class="btn2 pri" data-act="sfxprint">${ic("download", 15)} PDF erstellen</button><button class="btn2" data-act="sfxhtml">Als Datei laden</button></div></div>`;
    return { list, sl, pr };
  }
  _sfWartOld(T) { const p = this._sfWartParts(T); return `<div class="enc"><div class="enco">${p.list}</div><div class="enco">${p.sl}${p.pr}</div></div>`; }
  _sfxProto() {
    const T = this._sfStat(), { C, l, S } = T, yr = new Date().getFullYear(), P = C.proto, fl = (id) => (C.plan.floors.find((f) => f.id === id) || {}).n || "";
    const rows = l.map((x) => { const end = x.inst && x.life ? this._sfMon((+x.inst.slice(0, 4) + x.life) + x.inst.slice(4)) : "–", res = x.life_days != null && x.life_days < 0 ? "Tausch fällig" : x.bat != null && x.bat < C.bat.pct ? "Batterie schwach" : x.off ? "nicht erreichbar" : "in Ordnung"; return `<tr><td>${esc(x.name)}</td><td>${esc([fl(x.floor), x.room || x.area].filter(Boolean).join(" · ") || "–")}</td><td>${esc(x.kind)}</td><td>${esc(this._sfMon(x.inst) || "–")}</td><td>${esc(end)}</td><td>${esc(this._sfDate(x.tested || (S.test || {}).last))}</td><td>${x.bat != null ? num(x.bat, 0) + " %" : "–"}</td><td>${res}</td></tr>`; }).join("");
    const ev = (S.log || []).filter((x) => new Date(x.t).getFullYear() === yr).slice(0, 20).map((x) => `<li>${esc(new Date(x.t).toLocaleDateString("de-DE"))}: ${esc(x.x)}</li>`).join("");
    return `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Prüfprotokoll Melder ${yr}</title><style>body{font:14px/1.45 system-ui,sans-serif;margin:32px;color:#111}h1{font-size:22px;margin:0 0 4px}table{border-collapse:collapse;width:100%;margin:16px 0}th,td{border:1px solid #bbb;padding:6px 8px;text-align:left;font-size:12.5px}th{background:#eee}.k{display:flex;gap:32px;margin:8px 0 14px;color:#333}.s{margin-top:40px;display:flex;gap:60px}.s div{border-top:1px solid #333;padding-top:4px;min-width:200px;font-size:12px}small{color:#555}</style></head><body><h1>Prüfprotokoll Rauch- und Sicherheitsmelder ${yr}</h1><small>Erstellt am ${new Date().toLocaleDateString("de-DE")} mit Strom &amp; Wärme</small>
      <div class="k"><span><b>Name:</b> ${esc(P.name) || "&nbsp;______________"}</span><span><b>Adresse:</b> ${esc(P.addr) || "&nbsp;______________"}</span><span><b>Geprüft von:</b> ${esc(P.who) || "&nbsp;______________"}</span></div>
      <table><thead><tr><th>Melder</th><th>Ort</th><th>Art</th><th>Eingebaut</th><th>Tausch bis</th><th>Zuletzt geprüft</th><th>Batterie</th><th>Ergebnis</th></tr></thead><tbody>${rows || `<tr><td colspan="8">Keine Melder</td></tr>`}</tbody></table>
      ${ev ? `<b>Ereignisse ${yr}</b><ul>${ev}</ul>` : ""}<div class="s"><div>Datum</div><div>Unterschrift</div></div></body></html>`;
  }
  /* Ausgabe als Datei: auf Handy und Tablet über das Teilen-Menü (in der App geht weder Drucken noch ein Download), am Rechner als Download */
  _sfDeliver(data, name, mime, title) {
    try {
      const blob = new Blob([data], { type: mime }), file = typeof File !== "undefined" ? new File([blob], name, { type: mime }) : null, touch = window.matchMedia && window.matchMedia("(pointer:coarse)").matches;
      if (file && touch && navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title }).catch(() => {}); return; }
      const u = URL.createObjectURL(blob), a = document.createElement("a"); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); this._toast(`Gespeichert: ${name}`);
    } catch (_) { this._toast("Das hat nicht geklappt"); }
  }
  _sfxPrint() { this._sfxPdf("proto"); }
  _sfxHtml() { this._sfDeliver(this._sfxProto(), `Pruefprotokoll-Melder-${new Date().getFullYear()}.html`, "text/html", "Prüfprotokoll Melder"); }
  /* ---- Einstellungen: Melder und Batterie, Abfahrt-Prüfung, Allgemein */
  _sfSetOld(T, ex = {}) {
    const { C, l } = T, H = this._hass, adm = this._admin(), KN = this._sfxKind(), NM = this._sfxNames();
    if (!adm) return `<div class="card sfc"><div class="mut sm">Die Einstellungen kann nur ein Administrator ändern.</div></div>`;
    const sw = (act, k, on, label) => `<button class="sw ${on ? "on" : ""}" data-act="${act}" data-k="${k}" aria-pressed="${!!on}" aria-label="${label}"></button>`;
    const sel = l.find((x) => x.id === this._sfSelDet) || null, ids = new Set(l.map((x) => x.id));
    const cand = Object.keys(H.states).filter((e) => e.startsWith("binary_sensor.") && !ids.has(e));
    const rowsL = l.map((x) => `<button class="sfmr${sel && sel.id === x.id ? " on" : ""}" data-act="sfxeditdet" data-k="${esc(x.id)}"><span class="sfdi">${ic(KN[x.k][1], 18)}</span><span class="sfmt"><b>${esc(x.name)}</b><small>${esc([(C.plan.floors.find((f) => f.id === x.floor) || {}).n, x.room || x.area].filter(Boolean).join(" · ") || "ohne Raum")}${x.bat != null ? " · Batterie " + num(x.bat, 0) + " %" : ""}${x.manual ? " · von Hand" : ""}</small></span>${ic("pencil", 15)}</button>`).join("");
    const det = `<div class="card sfc" data-sec="melder"><h2>${ic("shield", 18)}Melder<small class="mut">${l.length}</small></h2><div class="mut sm" style="margin:-4px 0 8px">Gefunden werden Melder mit der Geräteklasse Rauch, CO, Gas, Wasser, Hitze oder Sicherheit. Alles andere fügst du von Hand hinzu.</div>${rowsL || `<div class="mut sm">Noch keine Melder gefunden.</div>`}
      <div class="sffld" style="margin-top:10px"><label>Melder von Hand hinzufügen</label>${this._sfSel(cand, "", "sfxmadd", "", "+ Binärsensor wählen", /rauch|smoke|wasser|water|leck|gas|co|hitze|heat/i)}</div></div>`;
    let ed = `<div class="card sfc"><div class="mut sm">Wähle links einen Melder, um Raum, Batterie, Einbaudatum und Prüfung festzulegen.</div></div>`;
    if (sel) {
      const m = (C.meta || {})[sel.id] || {}, fld = (lab, inner) => `<div class="sffld"><label>${lab}</label>${inner}</div>`, o = (arr, cur) => arr.map(([v, t]) => `<option value="${v}" ${String(cur) === String(v) ? "selected" : ""}>${t}</option>`).join(""), mf = (k, extra = "") => `data-f="sfxmf" data-k="${k}" data-e="${esc(sel.id)}" ${extra}`;
      const bat = Object.keys(H.states).filter((e) => e.startsWith("sensor.") && ((H.states[e].attributes || {}).device_class === "battery" || /batter|akku/i.test(e))), btn = Object.keys(H.states).filter((e) => e.startsWith("button."));
      const bty = ["CR123A", "CR2", "CR2032", "AA", "AAA", "9 V Block", "Lithium 10 Jahre", "Akku", "Netzbetrieb"], curT = m.btype || "";
      ed = `<div class="card sfc"><h2>${ic(KN[sel.k][1], 18)}${esc(sel.name)}</h2>
        ${fld("Name", `<input class="osel" ${mf("name")} value="${esc(m.name || "")}" maxlength="40" placeholder="${esc(this._wzName(sel.id))}">`)}
        ${fld("Art", `<select class="osel" ${mf("kind")}>${o(Object.keys(NM).map((k) => [k, KN[k][0]]), sel.k)}</select>`)}
        ${fld("Etage", `<select class="osel" ${mf("floor")}><option value="">– keine –</option>${o(C.plan.floors.map((f) => [f.id, esc(f.n)]), m.floor || "")}</select>`)}
        ${fld(`Raum${sel.area ? ` (aus Home Assistant: ${esc(sel.area)})` : ""}`, `<input class="osel" ${mf("room")} value="${esc(m.room || "")}" maxlength="40" placeholder="${esc(sel.area || "zum Beispiel Schlafzimmer")}">`)}
        <div class="sfgrp">BATTERIE</div>
        ${fld(`Batterie-Sensor${sel.bat != null ? ` (aktuell ${num(sel.bat, 0)} %)` : " (nicht gefunden)"}`, this._sfSel(bat, m.bat || "", "sfxmbat", `data-e="${esc(sel.id)}"`, "automatisch suchen", /batter|akku/i))}
        ${fld("Batterie-Typ (für die Einkaufsliste)", `<select class="osel" ${mf("btype")}><option value="">– unbekannt –</option>${o(bty.map((b) => [b, b]), curT)}</select>`)}
        <div class="mut sm">Warnen ab ${C.bat.pct} % stellst du unter „Weitere Einstellungen“ ein.</div>
        <div class="sfgrp">LEBENSDAUER UND PRÜFUNG</div>
        ${fld("Eingebaut am", `<input class="osel" type="month" ${mf("inst")} value="${esc(m.inst || "")}">`)}
        ${fld("Austausch nach", `<select class="osel" ${mf("life")}>${o([[0, "nicht überwachen"], [5, "5 Jahren"], [7, "7 Jahren"], [10, "10 Jahren (Rauchmelder)"], [15, "15 Jahren"]], m.life || 0)}</select>`)}
        ${fld("Prüfen alle", `<select class="osel" ${mf("int")}>${o([[0, `wie allgemein (${C.test.months} ${C.test.months === 1 ? "Monat" : "Monate"})`], [1, "1 Monat"], [3, "3 Monate"], [6, "6 Monate"], [12, "12 Monate"]], m.int || 0)}</select>`)}
        ${fld(`Test-Knopf des Melders${sel.test ? "" : " (keiner gefunden)"}`, this._sfSel(btn, m.press || "", "sfxmpress", `data-e="${esc(sel.id)}"`, "automatisch suchen", /test/i))}
        <div class="sfbtn" style="margin-top:12px"><button class="btn2 sfdel" data-act="sfxrmdet" data-k="${esc(sel.id)}">${sel.manual ? "Entfernen" : "Ausblenden"}</button><button class="btn2 pri" data-act="sfxeditdet" data-k="">Fertig</button></div></div>`;
    }
    const rows = this._sfDepRows(), dc = Object.keys(H.states).filter((e) => { const d = e.split(".")[0], dcl = (H.states[e].attributes || {}).device_class; return d === "cover" || d === "lock" || d === "switch" || d === "light" || d === "input_boolean" || (d === "binary_sensor" && ["window", "door", "garage_door", "opening"].includes(dcl)); }).filter((e) => !C.depart.ents.includes(e));
    let m1 = []; try { m1 = [...new Set(this._collect0().flatMap((r) => r.windows || []))].filter((e) => !C.depart.ents.includes(e)); } catch (_) { /* Modul 1 nicht bereit */ }
    const fr = C.depart.frost, wx = Object.keys(H.states).filter((e) => e.startsWith("weather.") || (e.startsWith("sensor.") && (H.states[e].attributes || {}).device_class === "temperature"));
    const dep = `<div class="card sfc" data-sec="abfahrt"><h2>${ic("lock", 18)}Abfahrt-Prüfung</h2><div class="mut sm" style="margin:-4px 0 6px">Du bekommst eine Meldung, wenn alle Personen weg sind und hier noch etwas offen ist. Kameras und Schlösser werden nur angezeigt, nie gesteuert.</div>
      <div class="vrow"><span>Beim Verlassen melden<small class="mut" style="display:block">Wenn die letzte Person geht</small></span>${sw("sfxdep", "", C.depart.on, "Abfahrt-Prüfung")}</div>
      ${rows.map((x, i) => `<div class="sfap">${ic(x.ico, 16)}<span>${esc(x.name)}</span><button class="ibtn" data-act="sfxdrm" data-i="${i}" aria-label="Entfernen">${ic("close", 16)}</button></div>`).join("")}
      <div class="sffld">${this._sfSel(dc, "", "sfxdadd", "", "+ Fenster, Tür, Herd oder Garage", /fenster|window|tür|door|herd|haust|garage|bügel/i)}</div>
      ${m1.length ? `<button class="btn2" data-act="sfxdm1" style="flex:none;width:100%;margin-top:8px">${m1.length} Fenster aus Modul 1 übernehmen</button>` : ""}
      <div class="vrow"><span>Frost-Hinweis<small class="mut" style="display:block">Warnen, wenn es draußen kalt wird</small></span>${sw("sfxfrost", "", fr.on, "Frost-Hinweis")}</div>
      ${fr.on ? `<div class="sffld"><label>Außentemperatur</label>${this._sfSel(wx, fr.ent, "sfxfent", "", "– wählen –", /außen|outdoor|aussen|weather/i)}</div><div class="vrow"><span>Hinweis unter</span><div class="step" style="flex:none"><button data-act="sfxfb" data-s="-1" aria-label="weniger">${ic("minus", 16)}</button><b>${fr.below} °C</b><button data-act="sfxfb" data-s="1" aria-label="mehr">${ic("plus", 16)}</button></div></div>` : ""}</div>`;
    const q = C.quiet, gen = `<div class="card sfc" data-sec="allg"><h2>${ic("bell", 18)}Allgemein</h2>
      <div class="vrow"><span>Ruhezeit<small class="mut" style="display:block">Nur Alarme kommen durch, Hinweise warten</small></span>${sw("sfxq", "", q.on, "Ruhezeit")}</div>
      ${q.on ? `<div class="sfbtn"><div class="sffld" style="flex:1"><label>Von</label><span class="tin">${this._tIn(q.from, false, `Uhrzeit`)}<input type="hidden" data-f="sfxqt" data-k="from" value="${q.from}"></span></div><div class="sffld" style="flex:1"><label>Bis</label><span class="tin">${this._tIn(q.to, false, `Uhrzeit`)}<input type="hidden" data-f="sfxqt" data-k="to" value="${q.to}"></span></div></div>` : ""}
      <div class="sffld"><label>Erinnerung vor Ablauf der Lebensdauer</label><div class="gschips">${[[0, "Aus"], [7, "7 Tage"], [14, "14 Tage"], [30, "30 Tage"], [60, "60 Tage"]].map(([k, t]) => `<button class="gsch ${C.lead === k ? "sel" : ""}" data-act="sfxlead" data-k="${k}" aria-pressed="${C.lead === k}">${t}</button>`).join("")}</div></div>
      <div class="sfgrp">KOPF DES JAHRESPROTOKOLLS</div>
      ${[["name", "Name", "zum Beispiel Familie Müller"], ["addr", "Adresse", "Straße, Ort"], ["who", "Geprüft von", "Name"]].map(([k, t, p]) => `<div class="sffld"><label>${t}</label><input class="osel" data-f="sfxpr" data-k="${k}" value="${esc(C.proto[k])}" maxlength="60" placeholder="${p}"></div>`).join("")}
      <button class="btn2" data-act="sfxopen" style="flex:none;width:100%;margin-top:10px">${ic("pencil", 15)} Weitere Einstellungen (Alarm-Aktionen, Batterie, Meldungen)</button></div>`;
    return `<div class="enc"><div class="enco">${det}${dep}</div><div class="enco">${ed}${ex.mid || ""}${gen}${ex.post || ""}</div></div>`;
  }
  /* ---- Aktionen und Eingaben der neuen Oberfläche */
  _sfxNewOld(a, b) {
    const k = b.dataset.k, s = Number(b.dataset.s), ed = this._sfEd;
    const uid = () => "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    if (a === "sfxtab") { this._sfT = k; try { localStorage.setItem("fh_sf_tab", k); } catch (_) { /* privater Modus */ } this._render(); return true; }
    if (a === "sfxfl") { this._sfFlId = k; if (ed) ed.sel = ""; this._render(); return true; }
    if (a === "sfxedit") { this._grEdit("sf"); return true; }   /* Modul 0 Build 3: der Baukasten liegt in Modul 0 */
    if (a === "sfxcancel") { this._sfEd = null; if (ed && ed.host === "gr") this._grEditDone(ed, false); else this._render(); return true; }
    if (a === "sfxsave") { if (!ed) return true; const p = JSON.parse(JSON.stringify(ed.plan)); this._sfEd = null; if (ed.host === "gr") { this._grSavePlan(p); this._grEditDone(ed, true); } else { this._sfxPatch((c) => { c.plan = p; }); this._toast("Grundriss gespeichert"); } return true; }
    if (a === "sfxprint") { this._sfxPrint(); return true; }
    if (a === "sfxhtml") { this._sfxHtml(); return true; }
    if (a === "sfxcopy") { const T = this._sfStat(), C = T.C, sh = {}; T.l.forEach((x) => { if (x.bat != null && (x.bat < C.bat.pct + 10 || (x.bat_days != null && x.bat_days < 90))) { const q = x.btype || "Batterie"; sh[q] = (sh[q] || 0) + 1; } }); const txt = Object.entries(sh).map(([q, n]) => `${n} × ${q}`).concat(T.l.filter((x) => x.life_days != null && x.life_days < 0).map((x) => `1 × neuer Melder (${x.name})`)).join("\n") || "Nichts zu besorgen"; this._clip(txt, "Liste kopiert"); return true; }
    if (a === "sfxplsel") { this._sfSelDet = this._sfSelDet === k ? "" : k; this._render(); return true; }
    if (a === "sfxjump") { const el = (this.shadowRoot || this).querySelector(`[data-sec="${k}"]`); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" }); return true; }
    if (a === "sfxeditdet") { this._sfSelDet = k || ""; this._sfT = "se"; this._render(); return true; }
    if (a === "sfxrmdet") { this._sfSelDet = ""; this._sfxPatch((c) => { if (c.add.includes(k)) { c.add = c.add.filter((x) => x !== k); delete c.meta[k]; } else if (!c.excl.includes(k)) c.excl.push(k); }); return true; }
    if (a === "sfxdep") { this._sfxPatch((c) => { c.depart.on = !c.depart.on; }); return true; }
    if (a === "sfxfrost") { this._sfxPatch((c) => { c.depart.frost.on = !c.depart.frost.on; }); return true; }
    if (a === "sfxfb") { this._sfxPatch((c) => { c.depart.frost.below = Math.max(-10, Math.min(10, c.depart.frost.below + s)); }); return true; }
    if (a === "sfxdrm") { this._sfxPatch((c) => { c.depart.ents.splice(Number(b.dataset.i), 1); }); return true; }
    if (a === "sfxdm1") { let w = []; try { w = [...new Set(this._collect0().flatMap((r) => r.windows || []))]; } catch (_) { /* leer */ } this._sfxPatch((c) => { w.forEach((e) => { if (!c.depart.ents.includes(e) && c.depart.ents.length < 30) c.depart.ents.push(e); }); }); return true; }
    if (a === "sfxq") { this._sfxPatch((c) => { c.quiet.on = !c.quiet.on; }); return true; }
    if (a === "sfxlead") { this._sfxPatch((c) => { c.lead = Number(k); }); return true; }
    if (!ed) return false;
    if (this._sfxP2(a, b)) return true;
    const P = ed.plan, fl = this._sfFl(), cur = P.items.find((x) => x.id === ed.sel);
    if (["sfxfadd", "sfxfrm", "sfxbgrm", "sfxplace", "sfxlplace", "sfxpdel", "sfxpdup", "sfxprot", "sfxpw", "sfxph", "sfxplk"].includes(a)) this._sfSnap();
    if (a === "sfxtool") { ed.tool = k; ed.sel = ""; ed.mm = false; ed.multi = []; this._render(); return true; }
    if (a === "sfxfadd") { const nm = ["OG", "Keller", "DG", "UG", "Garten", "Anbau"].find((n) => !P.floors.some((f) => f.n === n)) || "Etage", id = "f" + Date.now().toString(36).slice(-6); P.floors.push({ id, n: nm }); this._sfFlId = id; ed.sel = ""; this._render(); return true; }
    if (a === "sfxfrm") { if (P.floors.length > 1) { P.items = P.items.filter((x) => x.fl !== fl); delete P.bg[fl]; P.floors = P.floors.filter((f) => f.id !== fl); this._sfFlId = P.floors[0].id; ed.sel = ""; this._render(); } return true; }
    if (a === "sfxbgrm") { delete P.bg[fl]; this._render(); return true; }
    if (a === "sfxplace") { const d = this._sfDetMap()[k]; if (d) { const it = { id: uid(), fl, t: "m", x: 400, y: 240, r: 0, n: "", e: k }; P.items.push(it); ed.sel = it.id; this._render(); } return true; }
    if (a === "sfxlplace") {   /* Lampe aus der Liste setzen: in die Mitte ihres Raums, sonst in die Planmitte */
      const it = { id: uid(), fl, t: "l", x: 400, y: 240, r: 0, n: "", e: k, k: "decke" }, rm = this._liRoomOfLamp ? this._liRoomOfLamp(k, fl, P) : null;
      if (rm) { const c = this._sfRCen ? this._sfRCen(rm) : [rm.x + rm.w / 2, rm.y + rm.h / 2]; const n = P.items.filter((q) => q.t === "l" && this._sfInRoom(rm, q.x, q.y)).length; it.x = Math.round((c[0] + (n % 3) * 30 - 30) / 10) * 10; it.y = Math.round((c[1] + Math.floor(n / 3) * 30) / 10) * 10; }
      P.items.push(it); ed.sel = it.id; this._render(); return true;
    }
    if (!cur) return false;
    if (a === "sfxplk") { if (cur.t === "l" && ["decke", "steh", "spot", "streifen", "aussen"].includes(b.dataset.v)) { cur.k = b.dataset.v; this._render(); } return true; }
    if (a === "sfxpdel") { P.items = P.items.filter((x) => x.id !== cur.id); ed.sel = ""; this._render(); return true; }
    if (a === "sfxpdup") { const c = { ...cur, id: uid(), x: cur.x + 20, y: cur.y + 20 }; if (c.pts) c.pts = c.pts.map((q) => [q[0] + 20, q[1] + 20]); if (c.t === "w") { c.x2 += 20; c.y2 += 20; } if (c.t === "m" || c.t === "l") c.e = ""; P.items.push(c); ed.sel = c.id; this._render(); return true; }
    if (a === "sfxpmir") { if (cur && cur.t === "d" && (k === "mv" || k === "mh")) { this._sfSnap(); cur[k] = cur[k] ? 0 : 1; this._render(); } return true; }
    if (a === "sfxpdg") { if (cur && cur.t === "d") { this._sfSnap(); if (Number(b.dataset.v)) cur.dg = 1; else delete cur.dg; this._render(); } return true; }
    if (a === "sfxpds") { if (cur && cur.t === "r") { this._sfSnap(); if (b.dataset.v === "all") P.items.filter((q) => q.t === "r" && q.fl === fl).forEach((q) => { q.ds = 1; }); else if (cur.ds) delete cur.ds; else cur.ds = 1; this._render(); } return true; }
    if (a === "sfxpex") { if (cur) { this._sfSnap(); cur.ex = Number(b.dataset.v) ? 1 : 0; this._render(); } return true; }
    if (a === "sfxprot") { cur.r = ((cur.r || 0) + 90) % 360; this._render(); return true; }
    if (a === "sfxpw") { const nw = Math.max(40, Math.min(780, cur.w + s)); if (cur.t === "r" && cur.pts) this._sfRResize(cur, nw, cur.h); else cur.w = nw; this._render(); return true; }
    if (a === "sfxph") { const nh = Math.max(40, Math.min(460, cur.h + s)); if (cur.t === "r" && cur.pts) this._sfRResize(cur, cur.w, nh); else cur.h = nh; this._render(); return true; }
    return false;
  }
  _sfxNewChange(t) {
    const f = t.dataset.f, v = t.value || "", ed = this._sfEd;
    if (f === "sfxmadd") { if (v) { this._sfxPatch((c) => { if (!c.add.includes(v) && c.add.length < 60) c.add.push(v); }); this._sfSelDet = v; } return true; }
    if (f === "sfxdadd") { if (v) this._sfxPatch((c) => { if (!c.depart.ents.includes(v) && c.depart.ents.length < 30) c.depart.ents.push(v); }); return true; }
    if (f === "sfxfent") { this._sfxPatch((c) => { c.depart.frost.ent = v; }); return true; }
    if (f === "sfxtts") { this._sfxPatch((c) => { c.tts[t.dataset.k] = v; }); return true; }
    if (f === "sfxcont") { this._sfxPatch((c) => { c.contact.to = v; }); return true; }
    if (f === "sfxqt") { this._sfxPatch((c) => { c.quiet[t.dataset.k] = v || c.quiet[t.dataset.k]; }); return true; }
    if (f === "sfxpr") { this._sfxPatch((c) => { c.proto[t.dataset.k] = v.trim(); }); return true; }
    if (f === "sfxmf" || f === "sfxmbat" || f === "sfxmpress") {
      const e = t.dataset.e, key = f === "sfxmbat" ? "bat" : f === "sfxmpress" ? "press" : t.dataset.k;
      this._sfxPatch((c) => { const m = (c.meta[e] = c.meta[e] || {}); m[key] = ["life", "int"].includes(key) ? Number(v) || 0 : v; if (key === "kind" && !v) delete m.kind; });
      return true;
    }
    if (!ed) return false;
    if (this._sfxP2Change(t)) return true;
    const P = ed.plan, cur = P.items.find((x) => x.id === ed.sel);
    if (["sfxfn", "sfxpn", "sfxpe", "sfxpl"].includes(f)) this._sfSnap();
    if (f === "sfxfn") { const fl = P.floors.find((x) => x.id === this._sfFl()); if (fl && v.trim()) { fl.n = v.trim().slice(0, 16); this._render(); } return true; }
    if (f === "sfxpn" && cur) { cur.n = v.slice(0, 30); this._render(); return true; }
    if (f === "sfxpe" && cur) { cur.e = v; this._render(); return true; }
    if (f === "sfxpl" && cur && cur.t === "l") { cur.e = /^light\.[a-z0-9_]+$/.test(v) ? v : ""; this._render(); return true; }
    if (f === "sfxbg") {
      const file = t.files && t.files[0]; if (!file) return true;
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const sc = Math.min(1, 1000 / Math.max(img.width, img.height)), cv = document.createElement("canvas"); cv.width = Math.max(1, Math.round(img.width * sc)); cv.height = Math.max(1, Math.round(img.height * sc));
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url);
        let q = 0.7, d = cv.toDataURL("image/jpeg", q); while (d.length > 300000 && q > 0.3) { q -= 0.1; d = cv.toDataURL("image/jpeg", q); }
        if (d.length > 300000) { this._toast("Das Bild ist zu groß"); return; }
        P.bg[this._sfFl()] = d; this._render();
      };
      img.onerror = () => { URL.revokeObjectURL(url); this._toast("Das Bild konnte nicht gelesen werden"); };
      img.src = url; return true;
    }
    return false;
  }
  /* Zeigen und Ziehen im Baukasten (Maus, Finger, Stift) */
  _sfxBind(sr) {
    const pt = (e, svg) => { const b = svg.getBoundingClientRect(); return [Math.max(0, Math.min(800, ((e.clientX - b.left) / b.width) * 800)), Math.max(0, Math.min(480, ((e.clientY - b.top) / b.height) * 480))]; };
    const g = (v) => Math.round(v / 20) * 20, g10 = (v) => Math.round(v / 10) * 10;
    const paint = () => { const svg = sr.querySelector("svg.sfpe"); if (svg && this._sfEd) svg.innerHTML = this._sfPlanInner(this._sfFl(), true); };
    sr.addEventListener("pointerdown", (e) => {
      const svg = e.target.closest && e.target.closest("svg.sfpe"), ed = this._sfEd; if (!svg || !ed) return;
      e.preventDefault(); const [x, y] = pt(e, svg), P = ed.plan, fl = this._sfFl(), h = e.target.closest("[data-h]"), el = e.target.closest("[data-id]"), uid = () => "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), tool = ed.tool;
      this._sfDrag = null; this._sfSnap();
      if (h && ed.sel) { let hk = h.dataset.h; const rm = P.items.find((i) => i.id === ed.sel); if (rm && rm.t === "r" && rm.pts && /^a\d+$/.test(hk)) { const k0 = Number(hk.slice(1)), A = rm.pts[k0], B = rm.pts[(k0 + 1) % rm.pts.length]; if (rm.pts.length < 16) { rm.pts.splice(k0 + 1, 0, [Math.round((A[0] + B[0]) / 20) * 10, Math.round((A[1] + B[1]) / 20) * 10]); hk = "v" + (k0 + 1); } } if (/^v\d+$/.test(hk)) ed.vsel = Number(hk.slice(1)); this._sfDrag = { k: hk, id: ed.sel }; }
      else if (tool === "select" && ed.mm) { ed.multi = ed.multi || []; if (el) { const id = el.dataset.id, pre = ed.multi.includes(id); if (!pre) ed.multi.push(id); ed.sel = ""; const os = {}; P.items.filter((i) => ed.multi.includes(i.id)).forEach((i) => { os[i.id] = JSON.parse(JSON.stringify(i)); }); this._sfDrag = { k: "movem", os, sx: x, sy: y, moved: false, off: pre ? id : "" }; } else ed.multi = []; paint(); }
      else if (tool === "select") { ed.multi = []; if (el) { ed.sel = el.dataset.id; const it = P.items.find((i) => i.id === ed.sel); this._sfDrag = { k: "move", id: ed.sel, sx: x, sy: y, o: JSON.parse(JSON.stringify(it)), moved: false }; } else ed.sel = ""; paint(); }
      else if (tool === "r" || tool === "s" || tool === "w") {
        const it = tool === "w" ? { id: uid(), fl, t: "w", x: g(x), y: g(y), x2: g(x), y2: g(y), r: 0, n: "", e: "" } : { id: uid(), fl, t: tool, x: g(x), y: g(y), w: 0, h: 0, r: 0, n: "", e: "" };
        P.items.push(it); ed.sel = it.id; this._sfDrag = { k: "new", id: it.id, sx: g(x), sy: g(y) }; paint();
      } else {
        const it = { id: uid(), fl, t: tool.startsWith("m:") ? "m" : tool === "dg" ? "d" : tool, x: g10(x), y: g10(y), r: 0, n: tool === "x" ? "Text" : "", e: "" }; if (tool === "dg") it.dg = 1;
        if (it.t === "l") { it.k = "decke"; it.e = this._liFreeLampAt ? this._liFreeLampAt(fl, x, y, P) : ""; }
        if (it.t === "m") { const kind = tool.slice(2), pl = new Set(P.items.filter((i) => i.t === "m" && i.e).map((i) => i.e)), d = this._sfList().find((q) => q.k === kind && !pl.has(q.id)); if (d) it.e = d.id; }
        if (it.t === "d" || it.t === "f") { const sn = this._sfSnapOpen(fl, x, y); if (sn) { it.x = sn.x; it.y = sn.y; it.r = sn.r; } }
        P.items.push(it); ed.sel = it.id; ed.tool = "select"; this._render();
      }
    });
    window.addEventListener("pointermove", (e) => {
      const d = this._sfDrag, ed = this._sfEd, svg = sr.querySelector("svg.sfpe"); if (!d || !ed || !svg) return;
      if (d.k === "movem") { e.preventDefault(); const [mx, my] = pt(e, svg), dx = g(mx - d.sx), dy = g(my - d.sy); if (dx || dy) d.moved = true; ed.plan.items.forEach((i) => { const o = d.os[i.id]; if (!o) return; i.x = o.x + dx; i.y = o.y + dy; if (o.pts) i.pts = o.pts.map((q) => [q[0] + dx, q[1] + dy]); if (i.t === "w") { i.x2 = o.x2 + dx; i.y2 = o.y2 + dy; } }); paint(); return; }
      const [x, y] = pt(e, svg), it = ed.plan.items.find((i) => i.id === d.id); if (!it) return; e.preventDefault();
      if (/^v\d+$/.test(d.k)) { if (it.pts) { it.pts[Number(d.k.slice(1))] = [g10(x), g10(y)]; this._sfRSync(it); } }
      else if (d.k === "move") { const dx = g(x - d.sx), dy = g(y - d.sy); if (dx || dy) d.moved = true; it.x = d.o.x + dx; it.y = d.o.y + dy; if (d.o.pts) it.pts = d.o.pts.map((q) => [q[0] + dx, q[1] + dy]); if (it.t === "w") { it.x2 = d.o.x2 + dx; it.y2 = d.o.y2 + dy; } if (it.t === "d" || it.t === "f") { const sn = this._sfSnapOpen(this._sfFl(), it.x, it.y); if (sn) { it.x = sn.x; it.y = sn.y; it.r = sn.r; } } }
      else if (d.k === "new" || d.k === "br") { if (it.t === "w") { let X = g(x), Y = g(y); const dx = Math.abs(X - it.x), dy = Math.abs(Y - it.y); if (dx > dy * 4) Y = it.y; else if (dy > dx * 4) X = it.x; it.x2 = X; it.y2 = Y; } else { const ox = d.k === "new" ? d.sx : it.x, oy = d.k === "new" ? d.sy : it.y; if (d.k === "new") { it.x = Math.min(ox, g(x)); it.y = Math.min(oy, g(y)); it.w = Math.abs(g(x) - ox); it.h = Math.abs(g(y) - oy); } else { it.w = Math.max(20, g(x) - it.x); it.h = Math.max(20, g(y) - it.y); } } }
      else if (d.k === "p1") { it.x = g(x); it.y = g(y); } else if (d.k === "p2") { it.x2 = g(x); it.y2 = g(y); }
      paint();
    }, { passive: false });
    const up = () => {
      const d = this._sfDrag, ed = this._sfEd; if (!d) return; this._sfDrag = null; if (!ed) return;
      if (d.k === "movem") { if (!d.moved && d.off) ed.multi = ed.multi.filter((i) => i !== d.off); this._sfSnapTrim(); this._render(); return; }
      if (d.k === "new") { const it = ed.plan.items.find((i) => i.id === d.id); if (it && ((it.t === "w" && Math.abs(it.x2 - it.x) + Math.abs(it.y2 - it.y) < 20) || (it.t !== "w" && (it.w < 40 || it.h < 40)))) { ed.plan.items = ed.plan.items.filter((i) => i.id !== d.id); ed.sel = ""; } else ed.tool = "select"; }
      this._sfSnapTrim(); this._render();
    };
    window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
    /* Im Ansichtsmodus: Melder antippen zeigt die Daten */
    sr.addEventListener("click", (e) => { const svg = e.target.closest && e.target.closest("svg.sfpv"); if (!svg || this._sfEd) return; const el = e.target.closest("[data-id]"), it = el && this._sfx().cfg.plan.items.find((i) => i.id === el.dataset.id); this._sfSelDet = it && it.t === "m" && it.e ? it.e : ""; this._render(); });
  }
