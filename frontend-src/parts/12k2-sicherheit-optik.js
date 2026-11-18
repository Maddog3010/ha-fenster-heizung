  /* ================= Modul 11 · Neue Optik (v0.7, Konzept_Modul11_Neue-Optik Teil A) =================
     A1 · Haus-Szene als Banner: das Haus im Schnitt mit jedem Melder an seinem Platz (Etage nach Grundriss), Zustand als Farbe des Melders,
          bei Alarm Rauch und Ringe im Raum. Ruhige Szene ohne Bewegung, Ringe pulsieren nur bei „Bewegung: Voll“.
     A2 · Melder-Karten 2.0: kein Farbbalken und kein Rahmen, Zustand in Symbol (LED), Wort und Batterie-Ring. Antippen öffnet das Detailblatt.
     A3 · Übersicht: fünf Kennzahl-Kacheln, Abfahrt-Prüfung, Zeitleiste der letzten 30 Tage.
     A6 · Wartung: Jahresband, Batterie-Prognose, Nachweis. Schalter „Karten wie bisher“: cfg.ui.old (Einstellungen → Modul 11).
     Die alte Darstellung bleibt als *Old-Methoden erhalten und kommt mit dem Schalter zurück. */
  _sfNew() { const c = this._sfx().cfg || {}; return !(c.ui && c.ui.old); }
  /* HD-Symbol eines Melders: Gehäuse von unten, LED zeigt den Zustand */
  _sfHd(kind, st, size = 38) {
    const n = (this.constructor._gxN = ((this.constructor._gxN || 0) + 1) % 1e6), u = "sh" + n + "_", led = { ok: "#34d399", warn: "#f59e0b", alarm: "#ef4444", off: "#94a3b8", pause: "#64748b" }[st] || "#34d399";
    const defs = `<defs><linearGradient id="${u}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8fafc"/><stop offset="1" stop-color="#b6c0cf"/></linearGradient><linearGradient id="${u}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fcd34d"/><stop offset="1" stop-color="#f97316"/></linearGradient><linearGradient id="${u}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#2563eb"/></linearGradient><linearGradient id="${u}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5eead4"/><stop offset="1" stop-color="#0f766e"/></linearGradient></defs>`;
    const vents = Array.from({ length: 12 }, (_, i) => `<rect x="31" y="11" width="2" height="4" rx="1" fill="#8b97a8" transform="rotate(${i * 30} 32 32)"/>`).join("");
    const det = `<ellipse cx="32" cy="55" rx="20" ry="3" fill="#000" opacity=".25"/><circle cx="32" cy="32" r="25" fill="url(#${u}b)" stroke="#94a3b8" stroke-width="1.2"/><circle cx="32" cy="32" r="16" fill="none" stroke="#94a3b8" stroke-width="1.4"/>${vents}`;
    const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="4" fill="${led}"/>`;
    let g;
    if (kind === "smoke") g = `${det}<circle cx="32" cy="32" r="7.5" fill="${led}" opacity=".22"/><circle cx="32" cy="32" r="4.2" fill="${led}"/>`;
    else if (kind === "co") g = `${det}<text x="32" y="36.5" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="12" fill="#475569">CO</text>${dot(46, 18)}`;
    else if (kind === "gas") g = `<ellipse cx="32" cy="57" rx="16" ry="3" fill="#000" opacity=".25"/><path d="M32 6C38 17 47 23 47 37a15 15 0 0 1-30 0C17 28 24 24 26 15c2 5 4 6 6-9z" fill="url(#${u}f)"/><path d="M32 28c4 5 8 8 8 13a8 8 0 0 1-16 0c0-4 3-6 4-9 2 2 3 3 4-4z" fill="#fff7d6" opacity=".92"/>${dot(50, 14)}`;
    else if (kind === "water") g = `<ellipse cx="32" cy="57" rx="16" ry="3" fill="#000" opacity=".25"/><path d="M32 6C43 21 49 29 49 38a17 17 0 0 1-34 0C15 29 21 21 32 6z" fill="url(#${u}w)"/><path d="M24 38a8 8 0 0 0 6 8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>${dot(50, 14)}`;
    else if (kind === "heat") g = `<ellipse cx="32" cy="58" rx="14" ry="3" fill="#000" opacity=".25"/><rect x="26" y="6" width="12" height="38" rx="6" fill="url(#${u}b)" stroke="#94a3b8"/><circle cx="32" cy="46" r="11" fill="#ef4444"/><rect x="30" y="18" width="4" height="28" rx="2" fill="#ef4444"/>${dot(50, 12)}`;
    else g = `<ellipse cx="32" cy="58" rx="16" ry="3" fill="#000" opacity=".25"/><path d="M32 5 10 13v17c0 13 9 21 22 27 13-6 22-14 22-27V13z" fill="url(#${u}s)"/><path d="M22 31l7 7 14-15" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">${defs}${g}</svg>`;
  }
  _sfSt(x) { const C = this._sfx().cfg; return x.alarm ? "alarm" : x.paused ? "pause" : x.off ? "off" : x.bat != null && x.bat < C.bat.pct ? "warn" : "ok"; }
  /* Haus im Schnitt mit den Meldern */
  _sfScene(bad, l) {
    const n = (this.constructor._gxN = ((this.constructor._gxN || 0) + 1) % 1e6), u = "sb" + n + "_", glow = { ok: "#34d399", warn: "#fbbf24", alarm: "#f87171" }[bad] || "#34d399";
    const col = { ok: "#34d399", warn: "#f59e0b", alarm: "#ef4444", off: "#94a3b8", pause: "#64748b" }, fl = this._sfPl().floors, low = [[133, 154], [213, 154], [287, 154]], up = [[155, 92], [265, 92]];
    const free = { low: low.slice(), up: up.slice() }, put = [];
    const order = [...l].sort((a, b) => (b.alarm ? 1 : 0) - (a.alarm ? 1 : 0));
    order.forEach((x) => {
      const fi = fl.findIndex((f) => f.id === x.floor), g = fi === 0 ? "low" : fi > 0 ? "up" : null, any = free.low.length ? "low" : free.up.length ? "up" : null, k = g && free[g].length ? g : any;
      if (k) put.push({ x, p: free[k].shift() });
    });
    const extra = Math.max(0, l.length - put.length);
    let sm = "", dots = "";
    put.forEach(({ x, p: [px, py] }) => {
      const st = this._sfSt(x), c = col[st];
      if (st === "alarm") { sm += `<g opacity=".8"><circle cx="${px + 8}" cy="${py + 12}" r="13" fill="#94a3b8"/><circle cx="${px + 19}" cy="${py + 4}" r="10" fill="#cbd5e1"/><circle cx="${px - 4}" cy="${py + 2}" r="9" fill="#cbd5e1"/></g>`; dots += `<circle class="sfr2" cx="${px}" cy="${py}" r="22" fill="none" stroke="#ef4444" stroke-width="2" opacity=".35"/><circle class="sfr1" cx="${px}" cy="${py}" r="14" fill="none" stroke="#ef4444" stroke-width="2" opacity=".6"/>`; }
      dots += `<circle cx="${px}" cy="${py}" r="6.2" fill="#f1f5f9" stroke="#94a3b8"/><circle cx="${px}" cy="${py}" r="2.4" fill="${c}"/>`;
    });
    const win = [[112, 160], [225, 160], [296, 160], [170, 100], [232, 100], [280, 100]].map(([x, y]) => `<rect x="${x}" y="${y}" width="14" height="16" rx="2" fill="#fcd34d" opacity=".9"/>`).join("");
    return `<svg viewBox="0 0 400 210" aria-hidden="true"><defs><radialGradient id="${u}g" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="${glow}" stop-opacity=".55"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="205" cy="120" rx="190" ry="100" fill="url(#${u}g)"/><ellipse cx="200" cy="196" rx="185" ry="12" fill="#052e2b" opacity=".45"/>
      <ellipse cx="60" cy="40" rx="26" ry="9" fill="#fff" opacity=".18"/><ellipse cx="350" cy="58" rx="22" ry="8" fill="#fff" opacity=".14"/>
      <polygon points="82,78 205,16 328,78" fill="#a23a31" stroke="#7c2a24" stroke-width="3" stroke-linejoin="round"/><rect x="272" y="30" width="16" height="30" fill="#8a3a31"/><rect x="270" y="27" width="20" height="5" fill="#6d2b25"/>
      <rect x="98" y="78" width="214" height="116" rx="3" fill="#2b313c" stroke="#d6c3a1" stroke-width="5"/><rect x="103" y="83" width="204" height="52" fill="#3a4150"/><rect x="103" y="139" width="204" height="50" fill="#363d4b"/><rect x="103" y="135" width="204" height="5" fill="#d6c3a1"/>
      <rect x="183" y="139" width="4" height="50" fill="#1e232c"/><rect x="241" y="139" width="4" height="50" fill="#1e232c"/><rect x="205" y="83" width="4" height="52" fill="#1e232c"/>
      ${win}<rect x="255" y="164" width="11" height="25" rx="2" fill="#7a5230"/>${sm}${dots}
      <path d="M10 196h380" stroke="#1f7a58" stroke-width="3" stroke-linecap="round" opacity=".7"/><circle cx="42" cy="170" r="17" fill="#15803d"/><rect x="40" y="180" width="4" height="16" fill="#6b4423"/><circle cx="364" cy="174" r="13" fill="#16a34a"/><rect x="362" y="182" width="4" height="14" fill="#6b4423"/>
      ${extra ? `<text x="386" y="30" text-anchor="end" font-size="12" font-weight="700" fill="#fff" opacity=".85">+${extra}</text>` : ""}</svg>`;
  }
  _sfBanner(T) {
    const { S, C, l, al, low, due, life, op, bad, pa, act, ask } = T, off = T.off.filter((x) => !x.ask), mv = MV.sf, anim = this._rkCfg ? this._rkCfg().anim : "dezent";
    let big, sub;
    if (!l.length) { big = "Noch keine Melder"; sub = "Melder aus Home Assistant erscheinen hier automatisch. Du kannst sie auch unter Einstellungen von Hand hinzufügen."; }
    else if (al.length) {
      const a = al[0], t = a.since ? new Date(a.since) : null;
      big = al.length > 1 ? `${al.length} Alarme aktiv` : `${String(a.kind || "Alarm").replace(/melder$/i, "alarm")} · ${a.room || a.area || a.name}`;
      sub = `${t && isFinite(t) ? "Seit " + t.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) + " Uhr · " : ""}${al.map((x) => x.name).join(", ")}`;
    } else if (bad === "warn") { big = "Alles ruhig, aber Hinweise"; sub = [low.length ? `${low.length} Batterie${low.length === 1 ? "" : "n"} schwach` : "", off.length ? `${off.length} nicht erreichbar` : "", due.length ? "Prüfung fällig" : "", life.length ? `${life.length} Melder zu tauschen` : "", ask.length ? `${ask.length} wirken ausgeschaltet` : ""].filter(Boolean).join(" · "); }
    else { big = "Alles in Ordnung"; sub = `${act.length} Melder · alle erreichbar · Batterien gut${pa.length ? ` · ${pa.length} ausgeschaltet` : ""}`; }
    const chip = (ico, t, w) => `<span class="chip${w ? " st warn" : ""}">${ic(ico, 14)}${esc(t)}</span>`;
    const chips = (l.length ? chip("shield", `${act.length} Melder`) : "") + (pa.length ? chip("eyeOff", `${pa.length} ausgeschaltet`) : "") + ask.slice(0, 2).map((x) => chip("eyeOff", `${x.name} wirkt aus`, 1)).join("") + low.slice(0, 2).map((x) => chip("energy", `${x.name} ${num(x.bat, 0)} %`, 1)).join("") + off.slice(0, 2).map((x) => chip("alert", `${x.name} offline`, 1)).join("") + (due.length ? chip("clock", "Prüfung fällig", 1) : "") + (life.length ? chip("alert", `${life.length} zu tauschen`, 1) : "") + (op.length ? chip("lock", `${op.length} offen beim Gehen`, 1) : "");
    return `<div class="card sfbn ${bad}"><div class="sfbt"><div class="sfbl">${ic(bad === "alarm" ? "alert" : "shield", 15)}${bad === "alarm" ? "ALARM" : "Sicherheit im Haus"}</div><div class="sfbb">${esc(big)}</div><div class="sfbs">${esc(sub)}</div><div class="chips">${chips}</div></div>
      <div class="sfbi" data-an="${anim}">${this._sfScene(bad, l)}</div>${mv ? `<span class="mlv">v${esc(mv.v)} · Build ${mv.b}</span>` : ""}</div>`;
  }
  /* Beta-Hinweis als schmale Zeile, bis zur nächsten Version weggetippt */
  _sfBetaLine() {
    let seen = ""; try { seen = localStorage.getItem("fh_sf_beta") || ""; } catch (_) { /* privater Modus */ }
    if (seen === (this._ver || "-")) return "";
    return `<div class="sfbeta"><span>Beta · ersetzt keine zertifizierte Anlage · <a href="https://github.com/Maddog3010/ha-fenster-heizung/issues" target="_blank" rel="noopener">Fehler melden</a></span><button class="ibtn" data-act="sfxbeta" aria-label="Hinweis ausblenden">${ic("close", 14)}</button></div>`;
  }
  _sfPage() {
    if (!this._sfNew()) return this._sfPageOld();
    this._sfxLoad();
    const T = this._sfStat(), tab = this._sfTab(), tabs = [["ov", "Übersicht"], ["me", "Melder"], ["pl", "Grundriss"], ["wa", "Wartung"], ["se", "Einstellungen"]];
    const bar = `<div class="sftabs" role="tablist">${tabs.map(([k, t]) => `<button class="${k === tab ? "on" : ""}" data-act="sfxtab" data-k="${k}" role="tab" aria-selected="${k === tab}">${t}</button>`).join("")}</div>`;
    const body = this._sfV ? this._sfView(this._sfV, T) : tab === "me" ? this._sfMel(T) : tab === "pl" ? this._sfPlan(T) : tab === "wa" ? this._sfWart(T) : tab === "se" ? this._sfSet(T) : this._sfOv(T);
    return `${this._sfBanner(T)}${this._sfBetaLine()}${bar}<div class="sfv9">${body}</div>`;
  }
  /* ---- A2 · Melder-Karte 2.0 */
  _sfCard(x) {
    if (!this._sfNew()) return this._sfCardOld(x);
    const C = this._sfx().cfg, st = this._sfSt(x), KN = this._sfxKind(), bt = x.bat != null ? Math.max(0, Math.min(100, x.bat)) : null;
    const stx = { alarm: ["ALARM", "#ef4444"], pause: ["Ausgeschaltet", "#94a3b8"], off: ["Nicht erreichbar", "#94a3b8"], warn: ["Batterie schwach", "#f59e0b"], ok: ["In Ordnung", "#34d399"] }[st];
    const where = [(this._sfPl().floors.find((f) => f.id === x.floor) || {}).n, x.room || x.area].filter(Boolean).join(" · ");
    const R = 15, circ = 2 * Math.PI * R, rc = bt == null ? "#64748b" : bt < C.bat.pct ? "#f59e0b" : "#34d399";
    const ring = bt == null ? `<span class="sfmq">–</span>` : `<svg viewBox="0 0 40 40" width="38" height="38" aria-hidden="true"><circle cx="20" cy="20" r="${R}" fill="none" class="sfrg"/><circle cx="20" cy="20" r="${R}" fill="none" stroke="${rc}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${(circ * (1 - bt / 100)).toFixed(1)}" transform="rotate(-90 20 20)"/><text x="20" y="23.5" text-anchor="middle" class="sfrt">${num(bt, 0)}</text></svg>`;
    const tested = x.tested || (this._sfx().test || {}).last;
    const l1 = x.alarm ? `Alarm ${x.since ? this._sfAgo(x.since) : "aktiv"}` : x.paused ? "Keine Warnungen" : x.off ? "Meldet sich nicht" : x.bat_days != null && x.bat_days < 90 ? `Batterie noch ~ ${this._sfDur(x.bat_days)}` : tested ? `Geprüft ${this._sfAgo(tested)}` : "Noch nie geprüft";
    const l2 = x.paused ? (x.paused.until ? `bis ${this._sfDate(x.paused.until)}` : "bis du ihn einschaltest") : x.life_days != null && !x.alarm ? (x.life_days < 0 ? "Tausch überfällig" : `Tausch in ${this._sfDur(x.life_days)}`) : x.bat_days != null && x.bat_days >= 90 ? `Batterie ~ ${this._sfDur(x.bat_days)}` : x.src ? `Quelle ${esc(x.src)}` : "";
    return `<button class="sfnc ${st}" data-act="sfxdet" data-k="${esc(x.id)}" aria-label="${esc(x.name)}: ${stx[0]}. Details öffnen">
      <span class="sfnt"><span class="sfmi">${this._sfHd(x.k, st, 38)}</span><span class="sfmn"><b>${esc(x.name)}</b><small>${esc(where || x.kind)}</small></span><span class="sfmm">${ic("more", 18)}</span></span>
      <span class="sfms"><i style="background:${stx[1]}"></i><b style="${st === "ok" ? "" : `color:${stx[1]}`}">${stx[0]}</b></span>
      <span class="sfmb">${ring}<span class="sfmx"><b>${l1}</b><small>${l2}</small></span></span></button>`;
  }
  /* ---- A3 · Übersicht */
  _sfKts(T) {
    const { S, C, al, low, off, due, life } = T, l = T.act, n = l.length, last = (S.log || []).find((x) => x.c === "alarm"), withBat = l.filter((x) => x.bat != null);
    const soon = l.filter((x) => x.bat_thr_days != null && x.bat_thr_days <= C.lead && !(x.bat != null && x.bat < C.bat.pct));
    const nextLife = [...life].sort((a, b) => a.life_days - b.life_days)[0];
    const k = (ico, t, v, s, c, go, a = "sfxtab") => `<button class="sfkt" data-act="${a}" data-k="${go}">${ic(ico, 18)}<i style="background:${c}"></i><small>${t}</small><b>${esc(v)}</b><em>${esc(s)}</em></button>`;
    const G = "#34d399", A = "#f59e0b", R = "#ef4444";
    return `<div class="sfkts">${k("shield", "Alarme", al.length ? `${al.length} aktiv` : "keine", al.length ? al.map((x) => x.name).join(", ") : last ? "zuletzt " + this._sfAgo(last.t) : "noch keiner", al.length ? R : G, "me")}
      ${k("energy", "Batterien", withBat.length ? `${withBat.length - low.length} von ${withBat.length} gut` : "unbekannt", low.length ? `${low[0].name} bald leer` : soon.length ? `${soon[0].name} in ~ ${this._sfDur(soon[0].bat_thr_days)}` : withBat.length ? "alle gut" : "kein Batteriewert", low.length ? A : soon.length ? A : G, "wa")}
      ${k("wifi", "Erreichbar", n ? `${n - off.length} von ${n}` : "–", off.length ? `${off[0].name} offline` : T.pa.length ? `${T.pa.length} ausgeschaltet` : "alle erreichbar", off.length ? A : G, "me")}
      ${k("clock", "Prüfung", !C.test.on ? "aus" : due.length ? "fällig" : "läuft", S.test && S.test.last ? "zuletzt " + this._sfAgo(S.test.last) : "noch nie geprüft", due.length ? A : G, "wa")}
      ${k("tools", "Lebensdauer", life.length ? `${life.length} tauschen` : "in Ordnung", nextLife ? `${nextLife.name}${nextLife.life_days < 0 ? ", überfällig" : ""}` : "keine Frist", life.length ? A : G, "wa")}</div>`;
  }
  /* Zeitleiste der letzten 30 Tage aus dem Ereignis-Protokoll */
  _sfTimeline(S) {
    const now = Date.now(), span = 30 * 864e5, rows = [["alarm", "Alarme"], ["bat", "Batterie"], ["off", "Offline"], ["test", "Prüfung"]], pts = { alarm: [], bat: [], off: [], test: [] }, col = { alarm: "#ef4444", bat: "#f59e0b", off: "#64748b", test: "#34d399" };
    (S.log || []).forEach((e) => {
      const t = new Date(e.t).getTime(); if (!isFinite(t) || now - t > span) return;
      const x = String(e.x || ""), k = e.c === "alarm" ? "alarm" : e.c === "off" ? "off" : /Batterie/i.test(x) ? "bat" : /gepr[üu]ft|Erinnerung: Melder|Austausch/i.test(x) ? "test" : null;
      if (k) pts[k].push({ p: Math.max(0, Math.min(100, ((t - (now - span)) / span) * 100)), c: k === "test" && !/gepr[üu]ft:|Melder gepr/i.test(x) ? "#f59e0b" : col[k], t: `${new Date(t).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}: ${x}` });
    });
    const rw = rows.map(([k, n]) => `<div class="sftr"><small>${n}</small><div class="sftb">${pts[k].map((q) => `<span style="left:${q.p.toFixed(1)}%;background:${q.c}" title="${esc(q.t)}"></span>`).join("")}</div></div>`).join("");
    return `<div class="card sfc"><h2>${ic("clock", 18)}Letzte 30 Tage</h2><div class="sftl2">${rw}<div class="sfta"><span>vor 30 Tagen</span><span>heute</span></div></div></div>`;
  }
  /* Ereignisse kompakt: eine Zeile je Ereignis, Entitäts-Namen statt IDs, die letzten 6 sichtbar, der Rest nach „Mehr anzeigen“ */
  _sfLogName(x) {
    const dm = this._sfDetMap();
    return String(x || "").replace(/(?:binary_sensor|sensor|button)\.[a-z0-9_]+/g, (id) => (dm[id] && dm[id].name) || id.split(".")[1].replace(/_(rauch|smoke|alarmstatus)$/, "").replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()));
  }
  _sfLogCard(S) {
    const all = (S.log || []).slice(0, 40), n = this._sfLogMore ? 40 : 6, col = { alarm: "#ef4444", warn: "#f59e0b", ok: "#34d399", off: "#94a3b8" }, today = new Date().toDateString();
    const tm = (t) => { const d = new Date(t); if (!isFinite(d)) return ""; return d.toDateString() === today ? d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }) + " " + d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }); };
    const rows = all.slice(0, n).map((x) => `<div class="sfev" style="--c:${col[x.c] || "#64748b"}"><i></i><span>${esc(this._sfLogName(x.x))}</span><small>${esc(tm(x.t))}</small></div>`).join("");
    const more = all.length > 6 ? `<button class="lnk sfevm" data-act="sfxlogmore">${this._sfLogMore ? "Weniger anzeigen" : `Mehr anzeigen (${all.length - 6})`}</button>` : "";
    return `<div class="card sfc"><h2>${ic("clock", 18)}Ereignisse${all.length ? `<small class="mut">${all.length}</small>` : ""}</h2>${all.length ? `<div class="sfevl${this._sfLogMore ? " all" : ""}">${rows}</div>${more}` : `<div class="mut sm">Noch keine Ereignisse. Alarme, schwache Batterien, Prüfungen und die Abfahrt-Prüfung erscheinen hier.</div>`}</div>`;
  }
  _sfOv(T) {
    if (!this._sfNew()) return this._sfOvOld(T);
    const p = this._sfOvParts(T), l = T.l, rank = (x) => (x.alarm ? 0 : x.off ? 1 : x.bat != null && x.bat < T.C.bat.pct ? 2 : 3);
    const sorted = [...l].sort((a, b) => rank(a) - rank(b) || String(a.floor || "~").localeCompare(String(b.floor || "~")) || a.name.localeCompare(b.name, "de"));
    const list = l.length ? `<div class="card sfc sfmel"><h2>${ic("bell", 18)}Melder<small class="mut">${l.length}</small></h2><div class="sfmg">${sorted.map((x) => this._sfCard(x)).join("")}</div></div>` : "";
    return `${this._sfAskCards(T)}${p.empty}${this._mpWrap("sf", { kacheln: this._sfKts(T), zustand: p.dep, verlauf: this._sfTimeline(T.S), ereignisse: this._sfLogCard(T.S), naechstes: this._sfNext(T), melder: list })}`;
  }
  /* Karte „Als Nächstes“: was als Nächstes ansteht (Batterie, Prüfung, Tausch), nach Dringlichkeit */
  _sfNext(T) {
    const { C, act, due, life } = T, out = [];
    act.filter((x) => x.bat != null && x.bat < C.bat.pct).forEach((x) => out.push([0, "energy", `Batterie ${x.name}`, x.bat_days != null ? "~ " + this._sfDur(x.bat_days) : num(x.bat, 0) + " %", "a", x.id]));
    act.filter((x) => x.bat_thr_days != null && x.bat_thr_days <= C.lead && !(x.bat != null && x.bat < C.bat.pct)).forEach((x) => out.push([1, "energy", `Batterie ${x.name}`, "in ~ " + this._sfDur(x.bat_thr_days), "g", x.id]));
    if (C.test.on && due.length) out.push([0, "clock", due.length === 1 ? `Prüfung ${due[0].name}` : `Prüfung von ${due.length} Meldern`, "fällig", "a", due.length === 1 ? due[0].id : ""]);
    life.forEach((x) => out.push([x.life_days < 0 ? 0 : 1, "tools", `${x.name} tauschen`, x.life_days < 0 ? "überfällig" : "in " + this._sfDur(x.life_days), x.life_days < 0 ? "r" : "a", x.id]));
    out.sort((a, b) => a[0] - b[0]);
    const rows = out.slice(0, 5).map(([, ico, t, v, c, id]) => `<${id ? "button" : "div"} class="sfap sfnx" ${id ? `data-act="sfxdet" data-k="${esc(id)}"` : ""}>${ic(ico, 16)}<span>${esc(t)}</span><span class="sft ${c}">${esc(v).toUpperCase()}</span></${id ? "button" : "div"}>`).join("");
    return `<div class="card sfc"><h2>${ic("list", 18)}Als Nächstes</h2>${rows || `<div class="mut sm">Im Moment steht nichts an.</div>`}</div>`;
  }
  /* ---- Detailblatt eines Melders mit Batterie-Verlauf und Prognose (Stufe 1 · C4) */
  _sfGraph(x) {
    const C = this._sfx().cfg, h = x.bat_hist || [], W = 300, H = 110, now = Date.now() / 1000;
    if (h.length < 2 || x.bat == null) return `<div class="mut sm sfgn">${x.bat == null ? "Dieser Melder meldet keinen Batteriewert." : "Der Verlauf füllt sich, sobald genug Werte da sind (alle 20 Stunden einer). Eine Prognose gibt es ab 7 Tagen."}</div>`;
    const hor = x.bat_days != null ? Math.min(x.bat_days, 365) * 86400 : 0, t0 = h[0][0], t1 = now + hor, X = (t) => 6 + ((t - t0) / Math.max(1, t1 - t0)) * (W - 12), Y = (b) => H - 10 - (Math.max(0, Math.min(100, b)) / 100) * (H - 36);
    const line = h.map(([t, b], i) => `${i ? "L" : "M"}${X(t).toFixed(1)} ${Y(b).toFixed(1)}`).join("") + `L${X(now).toFixed(1)} ${Y(x.bat).toFixed(1)}`;
    const end = x.bat_days != null ? Math.max(0, x.bat - (x.bat / Math.max(1, x.bat_days)) * (hor / 86400)) : null;
    return `<svg viewBox="0 0 ${W} ${H}" class="sfgr" role="img" aria-label="Batterie-Verlauf"><line x1="6" x2="${W - 6}" y1="${Y(C.bat.pct)}" y2="${Y(C.bat.pct)}" class="sfgth"/><text x="8" y="${Y(C.bat.pct) - 3}" class="sfgtx">Schwelle ${C.bat.pct} %</text>
      <path d="${line}" class="sfgl"/>${end != null ? `<path d="M${X(now).toFixed(1)} ${Y(x.bat).toFixed(1)}L${X(t1).toFixed(1)} ${Y(end).toFixed(1)}" class="sfgf"/>` : ""}<circle cx="${X(now).toFixed(1)}" cy="${Y(x.bat).toFixed(1)}" r="3.6" class="sfgp"/><text x="${Math.min(W - 6, X(now) + 6).toFixed(1)}" y="${(Y(x.bat) - 7).toFixed(1)}" class="sfgtx" text-anchor="${X(now) > W - 60 ? "end" : "start"}">heute</text></svg>`;
  }
  /* Einstellungsfenster in der neuen Optik: jeder Abschnitt wird eine Karte mit Icon, Fuß bleibt unten */
  _sfxModal() {
    const h = this._sfxModalOld(), i0 = h.indexOf('<div class="lsec"'), fi = h.indexOf('<div class="foot2"');
    if (i0 < 0 || fi < 0) return h;
    const head = h.slice(0, i0), foot = h.slice(fi).replace(/<\/div>\s*$/, "");
    const parts = h.slice(i0, fi).split(/(?=<div class="lsec")/).map((x) => {
      const m = x.match(/^<div class="lsec"[^>]*>(<svg[\s\S]*?<\/svg>)([\s\S]*?)<\/div>([\s\S]*)$/);
      return m ? `<div class="card sfc sfmc"><h2>${m[1]}${m[2]}</h2>${m[3]}</div>` : x;
    }).join("");
    return head.replace('class="sheet wide"', 'class="sheet wide sfm"') + `<div class="sfmb">${parts}</div>` + foot + "</div>";
  }
  _sfDetModal() {
    const x = this._sfList().find((d) => d.id === (this._modal && this._modal.id)), adm = this._admin();
    if (!x) return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Melder</b></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div><div class="mut sm">Dieser Melder wird nicht mehr erkannt.</div></div>`;
    const st = this._sfSt(x), C = this._sfx().cfg, fc = x.bat_days != null ? `Batterie reicht noch etwa ${this._sfDur(x.bat_days)}` + (x.bat_thr_days != null && x.bat > C.bat.pct ? ` · bis ${C.bat.pct} % etwa ${this._sfDur(x.bat_thr_days)}` : "") : "";
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>${esc(x.name)}</b><span>${esc([(this._sfPl().floors.find((f) => f.id === x.floor) || {}).n, x.room || x.area, x.src ? "Quelle " + x.src : ""].filter(Boolean).join(" · ") || x.kind)}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="sfnd">${this._sfCard(x).replace(/ data-act="sfxdet"[^>]*?(?=>)/, ' disabled')}
        <div class="card sfc" style="margin-top:10px"><h2>${ic("energy", 18)}Batterie<small class="mut">${x.bat != null ? num(x.bat, 0) + " %" : ""}</small></h2>${this._sfGraph(x)}${fc ? `<div class="sfpn">${ic("clock", 15)}${esc(fc)}</div>` : ""}</div>
        <div class="card sfc" style="margin-top:10px"><h2>${ic("check", 18)}Prüfung und Lebensdauer</h2>${this._sfDetFactsPlain(x)}</div>${this._sfPauseCard(x)}${this._sfFaCard(x)}
        ${adm ? `<div class="sfbtn" style="margin-top:12px"><button class="btn2 pri" data-act="sfxdt" data-k="${esc(x.id)}">${ic("check", 15)} Geprüft</button>${x.bat != null ? `<button class="btn2" data-act="sfxdbat" data-k="${esc(x.id)}">Batterie getauscht</button>` : ""}${x.test ? `<button class="btn2" data-act="sfxpress" data-k="${esc(x.id)}">Test auslösen</button>` : ""}<button class="btn2" data-act="sfxeditdet" data-k="${esc(x.id)}">Einstellungen</button></div>` : ""}</div></div>`;
  }
  _sfDetFactsPlain(x) {
    const rows = [["Eingebaut", x.inst ? this._sfMon(x.inst) : "nicht eingetragen"], ["Tausch fällig", x.life && x.inst ? this._sfMon((+x.inst.slice(0, 4) + x.life) + x.inst.slice(4)) : "nicht eingetragen"], ["Zuletzt geprüft", this._sfDate(x.tested || (this._sfx().test || {}).last)], ["Batterie-Typ", x.btype || "nicht eingetragen"]];
    if (x.swaps && x.swaps.length) rows.push(["Batterie getauscht", this._sfDate(x.swaps[x.swaps.length - 1])]);
    return `<div class="sffacts">${rows.map(([a, b]) => `<div><span>${a}</span><b>${esc(b)}</b></div>`).join("")}</div>`;
  }
  /* ---- A6 · Wartung 2.0: Jahresband, Prognose, Nachweis */
  _sfBand(T) {
    const { S, C, l } = T, yr = new Date().getFullYear(), cm = new Date().getMonth(), M = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"], KN = this._sfxKind();
    const mon = (iso) => { const t = new Date(iso); return isFinite(t) && t.getFullYear() === yr ? t.getMonth() : -1; };
    const rows = l.map((x) => {
      const cells = Array(12).fill(""), put = (m, h) => { if (m >= 0 && !cells[m]) cells[m] = h; };
      (x.swaps || []).forEach((t) => put(mon(t), `<span class="sfwd b" title="Batterie getauscht">${ic("energy", 11)}</span>`));
      (x.tests || []).forEach((t) => put(mon(t), `<span class="sfwd g" title="Geprüft ${esc(this._sfDate(t))}">${ic("check", 11)}</span>`));
      const last = x.tested || (S.test || {}).last || (S.test || {}).first, iv = (C.meta[x.id] || {}).int || C.test.months, nx = last ? new Date(last) : null;
      if (nx && isFinite(nx) && C.test.on) { nx.setMonth(nx.getMonth() + iv); const m = nx.getFullYear() === yr ? nx.getMonth() : nx.getFullYear() < yr ? cm : -1; put(m, `<span class="sfwd w" title="Prüfung fällig"></span>`); }
      return `<tr><th>${this._sfHd(x.k, this._sfSt(x), 22)}<span>${esc(x.name)}</span></th>${cells.map((c, i) => `<td class="${i === cm ? "now" : ""}">${c}</td>`).join("")}</tr>`;
    }).join("");
    if (!l.length) return `<div class="card sfc"><h2>${ic("tools", 18)}Jahresband ${yr}</h2><div class="mut sm">Noch keine Melder.</div></div>`;
    return `<div class="card sfc"><h2>${ic("tools", 18)}Jahresband ${yr}</h2><div class="sfjw"><table class="sfjb"><tr><th></th>${M.map((m, i) => `<td class="m${i === cm ? " now" : ""}">${m}</td>`).join("")}</tr>${rows}</table></div>
      <div class="sflg"><span><i style="background:#34d399"></i>geprüft</span><span><i class="ring"></i>fällig</span><span><i style="background:#38bdf8"></i>Batterie getauscht</span></div></div>`;
  }
  _sfPrognose(T) {
    const { C, l } = T, rows = l.filter((x) => x.bat != null).sort((a, b) => (a.bat_days == null ? 9e9 : a.bat_days) - (b.bat_days == null ? 9e9 : b.bat_days) || a.bat - b.bat);
    const r = rows.map((x) => { const c = x.bat < C.bat.pct ? "#f59e0b" : "#34d399"; return `<button class="sfbp" data-act="sfxdet" data-k="${esc(x.id)}"><span>${esc(x.name)}</span><div class="sfbar"><i style="width:${Math.max(2, Math.min(100, x.bat))}%;background:${c}"></i></div><b>${x.bat_days != null ? "~ " + this._sfDur(x.bat_days) : num(x.bat, 0) + " %"}</b></button>`; }).join("");
    return `<div class="card sfc"><h2>${ic("energy", 18)}Batterie-Prognose</h2>${r || `<div class="mut sm">Noch kein Melder mit Batteriewert.</div>`}${C.lead && C.bat.on ? `<div class="sfhint">${ic("bell", 15)}<span>Erinnerung ${C.lead} Tage bevor die Batterie ${C.bat.pct} % erreicht, nicht erst dann.</span></div>` : ""}<div class="mut sm" style="margin-top:8px">Die Prognose ist eine Gerade durch den Verlauf seit dem letzten Tausch und braucht mindestens 7 Tage Messwerte.</div></div>`;
  }
  _sfWart(T) {
    if (!this._sfNew()) return this._sfWartOld(T);
    const p = this._sfWartParts(T), P = T.C.proto, yr = new Date().getFullYear();
    const nach = `<div class="card sfc"><h2>${ic("list", 18)}Nachweis ${yr}</h2><div class="sfdoc"><b>Prüfprotokoll Rauchmelder ${yr}</b><small>${esc(P.name || "Name")} · ${esc(P.addr || "Adresse")}</small><i></i><i class="s"></i><i></i><i class="s"></i></div>
      <div class="mut sm" style="margin:8px 0">Eine Seite für Versicherung, Vermieter oder Schornsteinfeger: alle Melder mit Einbau, Tausch, letzter Prüfung und Batterie.${P.name || P.addr ? "" : " Name und Adresse trägst du in den Einstellungen ein."}</div>
      <div class="sfbtn"><button class="btn2 pri" data-act="sfxprint">${ic("download", 15)} PDF erstellen</button><button class="btn2" data-act="sfxhtml">Als Datei laden</button></div>
      <div class="sfbtn" style="margin-top:8px"><button class="btn2" data-act="sfxbericht">${ic("heart", 15)} Sicherheitsbericht${this._spnS().active ? "" : " (Sponsor)"}</button></div></div>`;
    return `${this._sfWKts(T)}${this._sfBand(T)}<div class="enc"><div class="enco">${this._sfPrognose(T)}</div><div class="enco">${nach}</div></div>${p.list}${p.sl}`;
  }
  _sfWKts(T) {
    const { S, C, l, due, life } = T, w = (T.act || l), low = w.filter((x) => x.bat != null && x.bat < C.bat.pct), soon = w.filter((x) => x.bat_thr_days != null && x.bat_thr_days <= C.lead && !(x.bat != null && x.bat < C.bat.pct));
    const bad = life.filter((x) => x.life_days < 0), nl = [...life].sort((a, b) => a.life_days - b.life_days)[0], shop = new Set();
    l.forEach((x) => { if (x.bat != null && (x.bat < C.bat.pct + 10 || (x.bat_days != null && x.bat_days < 90))) shop.add("b:" + x.id); if (x.life_days != null && x.life_days < 0) shop.add("n:" + x.id); });
    const k = (ico, t, v, s, c) => `<div class="sfkt">${ic(ico, 18)}<i style="background:${c}"></i><small>${t}</small><b>${esc(v)}</b><em>${esc(s)}</em></div>`, G = "#34d399", A = "#f59e0b", R = "#ef4444";
    return `<div class="sfkts sfk4">${k("clock", "Nächste Prüfung", !C.test.on ? "aus" : due.length ? "fällig" : "läuft", S.test && S.test.last ? "zuletzt " + this._sfAgo(S.test.last) : "noch nie geprüft", due.length ? A : G)}
      ${k("tools", "Tausch fällig", bad.length ? `${bad.length} ${bad.length === 1 ? "Melder" : "Melder"}` : life.length ? `${life.length} bald` : "keiner", nl ? esc(nl.name) : "keine Frist", bad.length ? R : life.length ? A : G)}
      ${k("energy", "Batterie bald", low.length || soon.length ? `${low.length + soon.length} ${low.length + soon.length === 1 ? "Melder" : "Melder"}` : "alle gut", low.length ? `${low[0].name}${low[0].bat_days != null ? " ~ " + this._sfDur(low[0].bat_days) : ""}` : soon.length ? soon[0].name : "kein Handlungsbedarf", low.length ? A : soon.length ? A : G)}
      ${k("list", "Einkauf", shop.size ? `${shop.size} ${shop.size === 1 ? "Ding" : "Dinge"}` : "nichts", shop.size ? "Batterien, neue Melder" : "nichts zu besorgen", shop.size ? "#94a3b8" : G)}</div>`;
  }
  /* ---- Einstellungen: Schalter für die alte Darstellung */
  _sfSet(T) {
    if (!this._admin()) return this._sfSetOld(T);
    const o = !this._sfNew();
    const aus = `<div class="card sfc" data-sec="aussehen"><h2>${ic("eye", 18)}Aussehen</h2><div class="vrow"><span>Karten wie bisher<small class="mut" style="display:block">An: Banner mit Schild, Melder-Karten mit Farbbalken, Ampel als Liste und die Wartung aus v0.5 statt Haus-Szene, Kennzahl-Kacheln und Jahresband</small></span><button class="sw ${o ? "on" : ""}" data-act="sfxold" aria-pressed="${o}" aria-label="Karten wie bisher"></button></div></div>`;
    if (o) return `${this._sfSetOld(T)}${this._sfStufenCard(T).replace('data-sec="alarm"', 'style="margin-top:12px"')}${aus.replace('data-sec="aussehen"', 'style="margin-top:12px"')}`;
    return this._sfSetNew(T);
  }
  /* ---- Aktionen */
  _sfxNew(a, b) {
    const k = b.dataset.k;
    if (this._sfxM(a, b)) return true;
    if (this._sfxAlarmAct(a, b)) return true;
    if (a === "sfxdet") { this._modal = { type: "sfdet", id: k }; this._renderModal(); return true; }
    if (a === "sfxdt" || a === "sfxdbat") {
      this._hass.callWS({ type: "fenster_heizung/sf_tested", ent: k, ...(a === "sfxdbat" ? { bat: true } : {}) }).then((r) => { this._sfxD = { d: r || {}, ts: Date.now() }; this._render(); if (this._modal && this._modal.type === "sfdet") this._renderModal(); this._toast(a === "sfxdbat" ? "Batterie getauscht, der Verlauf beginnt neu" : "Melder als geprüft eingetragen"); }).catch(() => this._toast("Das hat nicht geklappt"));
      return true;
    }
    if (a === "sfxold") { this._sfxPatch((c) => { c.ui = { old: !(c.ui && c.ui.old) }; }); return true; }
    if (a === "sfxbeta") { try { localStorage.setItem("fh_sf_beta", this._ver || "-"); } catch (_) { /* privater Modus */ } this._render(); return true; }
    if (a === "sfxscroll") { const el = (this.shadowRoot || this).querySelector(".sfmel"); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" }); return true; }
    if (a === "sfxeditdet" && this._modal && this._modal.type === "sfdet") this._modal = null, this._renderModal();
    return this._sfxNewOld(a, b);
  }
