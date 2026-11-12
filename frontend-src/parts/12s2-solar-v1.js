  /* ================= Modul 16 Solar-Prognose · Stufe 4 → v1.0 Stabil (Konzept_Modul16_Neue-Optik E2, E6/E7, F7, F9, F10) =================
     E2  Anlagen einzeln: Tagessummen je Anlage (ab 2 Anlagen), mit Anteil und kleiner Tageskurve.
     E6/F7 Sensoren in Home Assistant: Prognose heute, morgen, Rest heute, korrigiert, Beginn der besten Zeit (eigenes Gerät).
     E7  Startseite: Kachel mit kleinem Sonnenbogen und Tageswert; Tablet: Wandansicht mit großen Zahlen.
     F9  Hauswerte: Ertragssensor aus dem Energie-Dashboard oder Modul 3 vorschlagen.
     F10 Einrichtungs-Check in den Einstellungen. */
  _spSites(C) {
    const L = (C.S.site_sums || []).filter((x) => x && x.n); if (L.length < 2) return "";
    const f1 = (v) => this._spF(v), tot = L.reduce((a, x) => a + (x.t || 0), 0) || 1, cols = ["#f59e0b", "#38bdf8", "#4ade80", "#c084fc", "#f472b6", "#facc15"];
    const spark = (h, c) => { if (!h || !h.length) return ""; const mx = Math.max(.1, ...h.map((x) => x[1])), h0 = h[0][0], h1 = h[h.length - 1][0], sp = Math.max(1, h1 - h0);
      const p = h.map(([t, v]) => `${((t - h0) / sp * 96 + 2).toFixed(1)},${(26 - v / mx * 22).toFixed(1)}`).join(" ");
      return `<svg viewBox="0 0 100 28" class="spsl" aria-hidden="true"><polyline points="2,26 ${p} 98,26" fill="${c}" fill-opacity=".18" stroke="none"/><polyline points="${p}" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/></svg>`; };
    const svcs = [...new Set(L.map((x) => x.svc).filter(Boolean))];
    const rows = L.map((x, i) => { const c = cols[i % cols.length], pc = Math.round((x.t || 0) / tot * 100);
      return `<div class="spsite" style="--c:${c}"><div class="spsn"><i></i><b title="${esc(x.n)}${x.svc ? " · " + esc(x.svc) : ""}">${esc(x.n)}</b><em>${pc} %</em></div>${spark(x.h, c)}
        <div class="spsv"><b>${f1((x.t || 0) * C.cf)}<small> kWh</small></b><span class="mut sm">morgen ${f1((x.m || 0) * C.cf)}</span>${svcs.length > 1 ? `<span class="spsvcl">${esc(x.svc)}</span>` : ""}</div><div class="spsb"><i style="width:${pc}%"></i></div></div>`; }).join("");
    return `<div class="card spcard"><h2>${ic("roof", 18)}Anlagen einzeln<span class="hzrt">${L.length} Anlagen · heute ${f1(tot * C.cf)} · morgen ${f1(L.reduce((a, x) => a + (x.m || 0), 0) * C.cf)} kWh</span></h2><div class="spsites">${rows}</div>
      <div class="mut sm" style="margin-top:6px">Jede Anlage so, wie die Quelle sie liefert${C.cf !== 1 ? `, mit der gelernten Korrektur ×${num(C.cf, 2)}` : ""}. Banner und Kacheln zeigen die Summe.</div></div>`;
  }
  /* Kleiner Sonnenbogen für die Startseite (Kachel) */
  _spMini(sz = 22) {
    const C = this._spCalc(), t = C.night ? .5 : Math.max(0, Math.min(1, (C.nh - C.H0) / Math.max(1, C.H1 - C.H0))), a = Math.PI * (1 - t), x = 16 + 12 * Math.cos(a), y = 24 - 13 * Math.sin(a);
    return `<svg viewBox="0 0 32 32" width="${sz}" height="${sz}" aria-hidden="true"><path d="M4 24 A12 13 0 0 1 28 24" fill="none" stroke="currentColor" stroke-opacity=".45" stroke-width="1.6" stroke-dasharray="2 2.6"/><line x1="2" y1="24.5" x2="30" y2="24.5" stroke="currentColor" stroke-opacity=".5" stroke-width="1.4"/>${C.night
      ? `<circle cx="${x.toFixed(1)}" cy="${(y - 1).toFixed(1)}" r="4.6" fill="currentColor"/><circle cx="${(x + 2.4).toFixed(1)}" cy="${(y - 2.6).toFixed(1)}" r="4" fill="var(--card-background-color,#1c1c1c)"/>`
      : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="#facc15"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" fill="#facc15" opacity=".25"/>`}</svg>`;
  }
  _spStart() {
    if (!this._spD) { this._spWantR = true; this._spLoad(); return { sub: "Lade …", c: "mut", icon: "" }; }
    this._spLoad();
    const S = this._sp(); if (S.error || !S.found) return { sub: S.error ? "Nicht geladen" : "Keine Prognose", c: "mut", icon: "" };
    const C = this._spCalc(), f1 = (v) => this._spF(v);
    const sub = C.night ? `Morgen ${f1(C.tmr)} kWh` : S.got != null ? `${f1(S.got)} von ${f1(C.base)} kWh` : `Heute ${f1(C.base)} kWh`;
    /* Für die Startkachel: Zahl, Einheit und Zeile getrennt, Ring = Anteil des Tages */
    const o = C.night ? { v: f1(C.tmr), l1: "morgen erwartet", p: null } : S.got != null ? { v: f1(S.got), l1: `von ${f1(C.base)} kWh heute`, p: C.base > 0 ? Math.min(1, S.got / C.base) : null } : { v: f1(C.base), l1: "heute erwartet", p: null };
    return { sub, c: S.low ? "wa" : "", icon: this._spMini(26), night: C.night, ...o };
  }
  /* Tablet: Wand mit großen Zahlen, Kurve und bester Zeit – ohne Verlauf und Kalender */
  _spWall(C) {
    const S = C.S, f1 = (v) => this._spF(v), day = C.night ? "tomorrow" : "today";
    const big = (l, v, u, s, c) => `<div class="spwb" style="--c:${c}"><span>${esc(l)}</span><b>${v}<small>${u}</small></b><em>${s}</em></div>`;
    const nums = C.night
      ? [big("Morgen erwartet", f1(C.tmr), "kWh", S.best && S.best_day === "tomorrow" ? `beste Zeit ${S.best.from}–${S.best.to} Uhr` : "", "#38bdf8"), big("Heute erzeugt", f1(S.got != null ? S.got : C.base), "kWh", C.base > 0 && S.got != null ? `${Math.round(S.got / C.base * 100)} % der Prognose` : "", "#facc15")]
      : [big("Heute erwartet", f1(C.base), "kWh", C.cf !== 1 ? `korrigiert ×${num(C.cf, 2)}` : "Prognose von heute früh", "#f59e0b"), big("Bisher", f1(S.got), S.got != null ? "kWh" : "", C.vor == null ? "kein Ertragssensor" : C.vor >= -.1 ? `<span class="g">${Math.abs(C.vor) < .1 ? "genau im Plan" : "+" + f1(C.vor) + " kWh vor Plan"}</span>` : `<span class="w">${f1(-C.vor)} kWh hinter Plan</span>`, "#facc15"),
        big("Noch zu erwarten", f1(C.rest), "kWh", `bis etwa ${C.H1} Uhr`, "#fde047"), big("Morgen", f1(C.tmr), "kWh", S.best && S.best_day === "today" ? `beste Zeit heute ${S.best.from}–${S.best.to} Uhr` : "", "#38bdf8")];
    return `<div class="spx sptm${this.style.colorScheme === "light" ? " lt" : ""}">${this._spDupBox()}${this._spLow(C)}<div class="spwall"><div class="spwn">${nums.join("")}</div>
      <div class="card spcard"><h2>${ic("chart", 18)}${day === "today" ? "Heute" : "Morgen"} · kWh je Stunde</h2>${this._spChart(C, day)}</div></div></div>`;
  }
  /* F9: Ertragssensor aus dem Energie-Dashboard (einmal je Sitzung gelesen) */
  _spEPrefs() {
    if (this._spEP !== undefined || !this._hass) return this._spEP || null;
    this._spEP = null;
    this._hass.callWS({ type: "energy/get_prefs" }).then((r) => { const s = ((r || {}).energy_sources || []).find((x) => x.type === "solar" && x.stat_energy_from); this._spEP = s ? s.stat_energy_from : ""; })
      .catch(() => { this._spEP = ""; }).finally(() => { if (this._modal && this._modal.type === "spset") this._renderModal(); });
    return null;
  }
  _spSuggest() {
    const C = this._sp().cfg, S = this._hass.states, e = this._spEPrefs();
    if (!e || e === C.act || !S[e] || (C.act && S[C.act])) return "";   /* nur wenn noch keiner gewählt ist oder der gewählte fehlt */
    return `<div class="gst">${ic("info", 15)}<span>Im Energie-Dashboard ist <b>${esc((S[e].attributes || {}).friendly_name || e)}</b> als Solarertrag eingetragen. <button class="lnk" data-act="spxep" data-k="${esc(e)}">Diesen Sensor verwenden</button> (als Gesamtzähler)</span></div>`;
  }
  /* Sensoren dieses Moduls in Home Assistant (eigenes Gerät „Strom & Wärme · Solar-Prognose“) */
  _spSensors() {
    const H = this._hass, dev = Object.values(H.devices || {}).find((d) => d && (d.name === "Strom & Wärme · Solar-Prognose"));
    let ids = dev ? Object.values(H.entities || {}).filter((x) => x.device_id === dev.id).map((x) => x.entity_id) : [];
    if (!ids.length) ids = Object.keys(H.states).filter((k) => /^sensor\..*solar_(prognose|beste_zeit|forecast|best_time)/.test(k));
    return ids.filter((k) => H.states[k]);
  }
  /* F10: Einrichtungs-Check */
  _spCheck() {
    const S = this._sp(), C = S.cfg, st = this._hass.states, a = C.act && st[C.act], un = a ? String((a.attributes || {}).unit_of_measurement || "") : "", age = S.fetched ? (Date.now() / 1000 - S.fetched) / 60 : null;
    const ok = (t, d) => ["ok", t, d], wa = (t, d) => ["wa", t, d], no = (t, d) => ["no", t, d];
    const L = [
      S.found ? ok("Prognose kommt an", `${{ energy: "Energie-Schnittstelle", service: "Forecast.Solar-Dienst", sensor: "eigener Sensor" }[S.via] || "Quelle"}${(S.sites || []).length ? " · " + S.sites.length + (S.sites.length === 1 ? " Anlage" : " Anlagen") : ""}`) : no("Keine Prognose", "Forecast.Solar, Solcast oder Open-Meteo einrichten oder einen eigenen Sensor wählen"),
      age == null ? wa("Noch nicht abgerufen", "Der erste Abruf folgt in wenigen Minuten") : age > 90 ? wa("Abruf ist alt", `zuletzt vor ${Math.round(age)} Min. – sonst alle 30 Min.`) : ok("Abruf aktuell", `vor ${Math.max(0, Math.round(age))} Min.`),
      !C.act ? wa("Kein Ertragssensor", "Ohne ihn fehlen „vor / hinter Plan“, Treffsicherheit und Korrektur") : !a ? no("Ertragssensor fehlt", `${C.act} gibt es nicht mehr`) : !/^(Wh|kWh|MWh)$/.test(un) ? wa("Einheit prüfen", `${C.act} meldet „${un || "ohne Einheit"}“, erwartet Wh oder kWh`) : ok("Ertragssensor", `${(a.attributes || {}).friendly_name || C.act} · ${a.state} ${un}`),
      !C.act ? null : S.act_h ? ok("Ertrag je Stunde", "aus der Langzeitstatistik") : wa("Kein Stundenverlauf", "Sensor ohne state_class – die Kurve zeigt dann die Prognose-Form"),
      !C.act ? null : S.corr_raw != null ? ok("Korrektur gelernt", `×${num(S.corr_raw, 2)} aus ${S.corr_n} Tagen${C.corr === false ? " · ausgeschaltet" : ""}`) : wa("Korrektur lernt noch", `${S.corr_n || 0} von 7 Tagen`),
      (S.cands || []).length > 1 ? (S.dup && S.sel_mode !== "manual" ? wa("Mehrere Dienste addiert", "Forecast.Solar, Solcast & Co. für dasselbe Dach zählen doppelt – unten Anlagen wählen") : ok("Anlagen", `${(S.cands || []).filter((x) => x.on).length} von ${(S.cands || []).length} addiert`)) : null,
      this._spSensors().length ? ok("Sensoren in Home Assistant", `${this._spSensors().length} Werte für Automationen`) : wa("Sensoren noch nicht da", "erscheinen nach einem Neustart von Home Assistant"),
    ].filter(Boolean);
    return L;
  }
  _spCheckHtml() {
    const L = this._spCheck(), bad = L.filter((x) => x[0] !== "ok").length, I = { ok: "check", wa: "alert", no: "close" };
    return `<div class="lsec">${ic("shield", 15)}Einrichtungs-Check<span class="spck-s ${bad ? "w" : "g"}">${bad ? `${bad} ${bad === 1 ? "Hinweis" : "Hinweise"}` : "Alles bereit"}</span></div>
      <div class="spck">${L.map(([k, t, d]) => `<div class="${k}"><span>${ic(I[k], 14)}</span><b>${esc(t)}</b><small>${esc(d)}</small></div>`).join("")}</div>`;
  }
  _spSensHtml() {
    const L = this._spSensors(), st = this._hass.states; if (!L.length) return "";
    const v = (k) => { const s = st[k]; if (!s || s.state === "unavailable" || s.state === "unknown") return "–"; if ((s.attributes || {}).device_class === "timestamp") { const d = new Date(s.state); return isNaN(d) ? "–" : d.toLocaleString("de-DE", { weekday: "short", hour: "2-digit", minute: "2-digit" }); } return `${num(parseFloat(s.state), 1)} ${s.attributes.unit_of_measurement || ""}`; };
    return `<div class="lsec" style="margin-top:12px">${ic("chart", 15)}Sensoren in Home Assistant</div>
      <div class="spsens">${L.map((k) => `<button data-act="spxmore" data-k="${esc(k)}"><span>${esc((st[k].attributes || {}).friendly_name || k)}<small>${esc(k)}</small></span><b>${esc(v(k))}</b></button>`).join("")}</div>
      <div class="mut sm" style="margin-top:6px">Für Automationen, zum Beispiel: Waschmaschine starten, wenn „Beste Zeit Beginn“ erreicht ist und „Rest heute“ über 5 kWh liegt.</div>`;
  }
  /* ================= v1.0 Build 2: Anlagen wählen – mehrere Dienste für dasselbe Dach nicht doppelt zählen =================
     Bisher wurden alle gefundenen Prognosen addiert. Stehen Forecast.Solar und Solcast (oder Open-Meteo) für dieselben Module
     in Home Assistant, war die Summe doppelt so hoch. Jetzt: von Hand gewählt, sonst wie im Energie-Dashboard, sonst alle mit Warnung. */
  _spSvcs() { const L = this._sp().cands || [], o = {}; L.forEach((x) => { (o[x.dom] = o[x.dom] || { dom: x.dom, svc: x.svc || x.dom, L: [] }).L.push(x); }); return Object.values(o); }
  _spSiteSel() {
    const S = this._sp(), L = S.cands || [], G = this._spSvcs(), adm = this._admin(), f1 = (v) => this._spF(v), on = L.filter((x) => x.on);
    const sumT = on.reduce((a, x) => a + (x.t || 0), 0), sumM = on.reduce((a, x) => a + (x.m || 0), 0);
    const mode = { manual: "von dir gewählt", energy: "wie im Energie-Dashboard eingetragen", all: "alle gefundenen werden addiert" }[S.sel_mode] || "";
    const warn = S.dup ? `<div class="spdupw">${ic("alert", 16)}<div><b>Mehrere Dienste werden addiert</b>${G.filter((g) => g.L.some((x) => x.on)).map((g) => esc(g.svc)).join(" + ")} – beschreiben sie dieselben Module, ist die Prognose zu hoch. Wähle je Dach nur einen Dienst.</div></div>` : "";
    const quick = G.length > 1 ? `<div class="gschips" style="margin:6px 0 2px">${G.map((g) => `<button class="gsch ${g.L.every((x) => x.on) && on.length === g.L.length ? "sel" : ""}" data-act="spxsvc" data-k="${esc(g.dom)}" ${adm ? "" : "disabled"}>Nur ${esc(g.svc)}</button>`).join("")}${(S.energy_ids || []).length ? `<button class="gsch ${S.sel_mode === "energy" ? "sel" : ""}" data-act="spxsauto" ${adm ? "" : "disabled"}>Wie im Energie-Dashboard</button>` : `<button class="gsch ${S.sel_mode === "all" ? "sel" : ""}" data-act="spxsauto" ${adm ? "" : "disabled"}>Automatisch</button>`}</div>` : "";
    const rows = G.map((g) => `<div class="spsvc"><div class="spsvh">${esc(g.svc)}<span class="mut sm">${g.L.length} ${g.L.length === 1 ? "Anlage" : "Anlagen"} · morgen ${f1(g.L.reduce((a, x) => a + (x.m || 0), 0))} kWh</span></div>
      ${g.L.map((x) => `<button class="spsel${x.on ? " on" : ""}" data-act="spxsite" data-k="${esc(x.id)}" aria-pressed="${!!x.on}" ${adm ? "" : "disabled"}><i>${x.on ? ic("check", 13) : ""}</i><b>${esc(x.n)}</b><span>heute ${f1(x.t)} · morgen ${f1(x.m)} kWh</span></button>`).join("")}</div>`).join("");
    return `<div class="spsites2"><div class="mut sm" style="margin:2px 0 6px">${L.length} ${L.length === 1 ? "Anlage" : "Anlagen"} gefunden · ${esc(mode)}. Addiert: heute <b>${f1(sumT)}</b> · morgen <b>${f1(sumM)} kWh</b>.</div>${warn}${quick}${rows}
      ${S.since ? `<div class="mut sm" style="margin-top:6px">Auswahl geändert am ${new Date(S.since + "T12:00:00").toLocaleDateString("de-DE")}: Die Korrektur lernt ab diesem Tag neu, frühere Tage passen nicht zur neuen Summe.</div>` : ""}</div>`;
  }
  /* Hinweis oben auf der Seite, solange mehrere Dienste ungefragt addiert werden */
  _spDupBox() {
    const S = this._sp(); if (!S.dup || S.sel_mode === "manual") return "";
    const G = this._spSvcs().filter((g) => g.L.some((x) => x.on)), on = (S.cands || []).filter((x) => x.on), f1 = (v) => this._spF(v);
    const per = G.map((g) => `${esc(g.svc)} ${f1(g.L.filter((x) => x.on).reduce((a, x) => a + (x.m || 0), 0))}`).join(" · ");
    return `<div class="card splow spdup">${ic("alert", 20)}<div><b>Prognose vermutlich doppelt gezählt</b><span>${on.length} Anlagen aus ${G.length} Diensten werden addiert (morgen: ${per} kWh). Stehen sie für dieselben Module, ist die Summe zu hoch.</span>
      ${this._admin() ? `<div class="splowb">${G.map((g) => `<button class="btn2" data-act="spxsvc" data-k="${esc(g.dom)}">Nur ${esc(g.svc)}</button>`).join("")}<button class="btn2" data-act="spxopen">Anlagen wählen</button></div>` : ""}</div></div>`;
  }
