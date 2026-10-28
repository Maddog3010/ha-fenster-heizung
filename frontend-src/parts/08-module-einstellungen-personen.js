  /* ================= Module (Modul 2: Warmwasser & Zirkulation, weitere Module) ================= */
  _mdState() {
    if (!this._mds) {
      let act = "fh"; try { act = localStorage.getItem("fh_mod_active") || "fh"; } catch (_) { /* Speicher gesperrt */ }
      this._mds = { active: act, on: { ww: true, en: true, gs: true, lu: false, rb: false, wp: false, ev: false, wx: false, ga: false, sf: false, pl: false, bt: false, dt: false, wa: false, sp: false }, ext: [], ww: JSON.parse(JSON.stringify(WW_DEF)), loaded: false };
    }
    return this._mds;
  }
  _mdApply(r) {
    const s = this._mdState();
    if (r && r.modules) {
      s.on = { ww: true, en: true, gs: true, lu: false, rb: false, wp: false, ev: false, wx: false, ga: false, sf: false, pl: false, bt: false, dt: false, wa: false, sp: false, ...(r.modules.on || {}) }; s.ext = Array.isArray(r.modules.ext) ? r.modules.ext : [];
      if (r.modules.gs) this._mdState().gs = r.modules.gs;
      if (r.modules.ev) { const ev = this._mdState().ev = { brand: "", model: "", body: "limousine", color: "blue", ...r.modules.ev }; ev.ent = { soc: "", odo: "", range: "", plug: "", power: "", charging: "", ...(r.modules.ev.ent || {}) }; }
      const en = r.modules.energy, E = this._enState(); E.on = s.on.en !== false;
      if (en) {
        const has = Object.values(en.ent || {}).some(Boolean); let mig = false; try { mig = localStorage.getItem("fh_energy_mig") === "1"; } catch (_) { /* Speicher gesperrt */ }
        if (has || mig) { E.ent = { ...E.ent, ...(en.ent || {}) }; E.sign = en.sign || ""; E.bsign = en.bsign || "charge"; E.bmode = en.bmode === "two" ? "two" : "one"; E.pvn = en.pvn || ""; E.pv2n = en.pv2n || ""; }
        else if (Object.values(E.ent).some(Boolean) && this._admin()) { try { localStorage.setItem("fh_energy_mig", "1"); } catch (_) { /* Speicher gesperrt */ } this._mdSave(); }
        else { try { localStorage.setItem("fh_energy_mig", "1"); } catch (_) { /* Speicher gesperrt */ } }
      }
    }
    const w = r && r.wasser; if (!w) return;
    const d = JSON.parse(JSON.stringify(WW_DEF)), c = w.ww || {}, st = w.status || {}, keep = { day: s.ww.day };
    s.ww = { ...d, ...c, ent: { ...d.ent, ...(c.ent || {}) }, heat: { ...d.heat, ...(c.heat || {}) }, circ: { ...d.circ, ...(c.circ || {}) }, leg: { ...d.leg, ...(c.leg || {}), last: st.leg_last || null }, pv: { ...d.pv, ...(c.pv || {}) }, boost: !!st.boost, circ5: !!st.circ5, away: !!st.away, info: { want: st.want, leg: !!st.leg_running }, ...keep };
    s.loaded = true;
  }
  _mdBackup() { const W = this._mdState().ww, ww = JSON.parse(JSON.stringify(W)); ["boost", "circ5", "away", "day", "info"].forEach((k) => delete ww[k]); delete ww.leg.last; const E = this._enState(); return { modules: { on: this._mdState().on, ext: this._mdState().ext, gs: this._gsState(), ev: this._evState(), energy: { ent: E.ent, sign: E.sign || "", bsign: E.bsign, bmode: E.bmode === "two" ? "two" : "one", pvn: E.pvn || "", pv2n: E.pv2n || "" } }, ww }; }
  _mdSave() {
    clearTimeout(this._mdT);
    this._mdT = setTimeout(() => {
      this._mdT = null;
      if (!this._hass) return; const b = this._mdBackup();
      this._hass.callWS({ type: "fenster_heizung/set_modules", modules: b.modules })
        .then(() => this._hass.callWS({ type: "fenster_heizung/set_wasser", ww: b.ww }))
        .then((r) => { this._mdPoll(r); })
        .catch(() => this._toast("Modul-Einstellung konnte nicht gespeichert werden"));
    }, 500);
  }
  _mdPoll(r) {
    if (!this._hass) return;
    const apply = (x) => { if (!x || this._dragging || (this._modal && ["wwset", "wwsch", "mods", "enset", "gsset", "evset"].includes(this._modal.type)) || this._mdT) return; this._mdApply(x); this._render(); };
    if (r) { apply(r); return; }
    this._hass.callWS({ type: "fenster_heizung/get_modules" }).then(apply).catch(() => {});
  }
  _mdActiveSet(id) { const s = this._mdState(); s.active = id; try { localStorage.setItem("fh_mod_active", id); } catch (_) { /* Speicher gesperrt */ } }
  _mdList() { const s = this._mdState(); return [MODS[0], ...(s.on.ww ? [MODS[1]] : []), ...(this._enOn() ? [MODS[2]] : []), ...(s.on.gs !== false ? [MODS[3]] : []), ...MODS.filter((m) => m.beta && s.on[m.id] === true), ...s.ext.filter((x) => x.on).map((x) => ({ id: x.id, n: 0, name: x.name, short: x.name, icon: "puzzle", tag: "Externes Modul", ext: x }))]; }
  _mdActive() { const s = this._mdState(); return this._mdList().some((m) => m.id === s.active) ? s.active : "fh"; }
  _stDone(id) {
    if (id === "fh") { const n = this._collect().length; return n ? n + (n === 1 ? " Raum" : " Räume") : ""; }
    if (id === "gs") { const n = this._gsState().devices.length; return n ? n + (n === 1 ? " Gerät" : " Geräte") : ""; }
    const E = id === "ww" ? (this._mdState().ww.ent || {}) : (this._enState().ent || {});
    return Object.values(E).some((v) => v) ? "Eingerichtet" : "";
  }
  _fhOpenSet() {
    if (!this._fhOpen) { let a = null; try { a = JSON.parse(localStorage.getItem("fh-open") || "null"); } catch (_) {} this._fhOpen = new Set(Array.isArray(a) ? a : [this._pv().sensor ? "sum" : "pv"]); }
    return this._fhOpen;
  }
  _stRender() {
    const sr = this.shadowRoot, s = this._mdState();
    const row = (icn, ttl, txt, act, k, extra) => `<button class="sxrow" data-act="${act}"${k ? ` data-k="${k}"` : ""}><span class="sxi">${ic(icn, 20)}</span><span class="sxt"><b>${ttl}</b><small>${txt}</small></span>${extra || ""}<span class="sxg">${ic("chev", 16)}</span></button>`;
    const isOn = (m) => m.id === "fh" || (m.id === "ww" ? s.on.ww : m.beta ? s.on[m.id] === true : m.id === "gs" ? s.on.gs !== false : this._enOn());
    const act = MODS.filter(isOn), off = MODS.filter((m) => !isOn(m));
    const mods = act.map((m) => {
      const d = this._stDone(m.id), chip = m.beta ? `<em class="sxc ${STG[modSt(m)].c}">${STG[modSt(m)].t}</em>` : d ? `<em class="sxc ok">${esc(d)}</em>` : `<em class="sxc">Offen</em>`;
      return row(m.icon, `<i>Modul ${m.n}</i> ${esc(m.name)}`, esc(MOD_SET[m.id].txt), MOD_SET[m.id].act, "", chip);
    }).join("");
    const ext = s.ext.map((x) => row("puzzle", `<i>Eigenes Modul</i> ${esc(x.name)}`, esc(x.url), "mdmgr", "", `<em class="sxc ${x.on ? "ok" : "off"}">${x.on ? "An" : "Aus"}</em>`)).join("");
    const offG = off.map((m) => `<button class="sxoff" data-act="mdtog" data-k="${m.id}"><span class="sxi">${ic(m.icon, 18)}</span><span class="sxt"><b>${esc(m.name)}</b><small>Modul ${m.n}</small></span><em class="sxc">Einschalten</em></button>`).join("");
    const soon = MOD_SOON.map((x) => `<div class="sxoff soon"><span class="sxi">${ic(x[0], 18)}</span><span class="sxt"><b>${esc(x[1])}</b><small>${esc(x[2])}</small></span><em class="sxc">Bald</em></div>`).join("");
    const grp = (ico, ttl, sub, body) => `<div class="sxh2"><span class="sxhi">${ic(ico, 16)}</span><b>${ttl}</b><small>${sub}</small></div>${body}`;
    sr.getElementById("main").innerHTML = `
      <div class="bar${this._narrow ? " nar" : ""}">${this._narrow ? `<button class="ib0" data-act="menu" aria-label="Menü">${ic("menu", 24)}</button>` : ""}
        <div class="brand"><img class="blogo" src="${LOGO_URL}" alt="MADDOG3010" draggable="false"><div><em class="pn">${esc(PRODUCT)}</em><b>Einstellungen</b><span><em class="tag">Alle Module an einem Ort</em>${this._ver ? `<em class="ver">Version ${esc(this._ver)}</em>` : ""}</span></div></div>
        <button class="pillbtn pri" data-act="mdstx">${ic("check", 16)}<span class="bl">Fertig</span></button></div>
      <div class="wrap">
        <div class="sxw">
        <div class="sxsum"><div><b>${act.length}</b><span>${act.length === 1 ? "Modul aktiv" : "Module aktiv"}</span></div><div><b>${this._collect().length}</b><span>Räume</span></div><div><b>${this._ortPersons().length}</b><span>Personen</span></div><div><b>${this._ver ? esc(this._ver) : "–"}</b><span>Version</span></div></div>
        ${grp("tools", "Allgemein", "Einrichtung und Verbindungen", `<div class="card sxl">
          ${row("tools", "Einrichtungsassistent", "Räume, Ventile und Fenster zuordnen", "wz")}
          ${row("puzzle", "Store &amp; Integrationen", "Dienste und Geräte entdecken, verbinden und verwalten", "igopen")}
          ${row("flask", "Labs", "Experimentelle Funktionen ansehen und einschalten", "labopen", "", `<em class="sxc ${this._labCount() ? "ok" : "off"}">${this._labCount() ? this._labCount() + " an" : "Aus"}</em>`)}
          ${row("users", "Personen &amp; Standort", "Personen, iCloud-Standort und Home-Zone auf der Karte", "ortopen", "", this._ortChip())}
          ${row("palette", "Darstellung", "Akzentfarbe, Wetter, Raumsymbole", "look")}</div>`)}
        ${grp("layers", "Meine Module", `${act.length} aktiv · Einstellungen je Modul`, `<div class="card sxl">${mods}${ext}</div>`)}
        ${off.length || soon ? grp("plus", "Weitere Module", "Ausgeschaltet – mit einem Tipp einschalten", `<div class="sxgrid">${offG}${soon}</div>`) : ""}
        ${grp("shield", "System", "Sichern, prüfen, verwalten", `<div class="card sxl">
          ${row("sliders", "Sichern &amp; Wiederherstellen", "Einstellungen als Datei sichern und zurückspielen", "gen")}
          ${row("shield", "Diagnose", "Ventile, Fenster und Verbindung prüfen", "diag")}
          ${row("puzzle", "Module verwalten", "Module ein- und ausschalten, eigene Module hinzufügen", "mdmgr")}</div>`)}</div>
      </div>`;
  }
  /* ---------------- Personen & Standort: iCloud-Ortung, Personen-Einstellungen, Home-Zone auf der Karte ---------------- */
  _ort() {
    if (!this._ortS) {
      const h = this._hass, hz = h && h.states["zone.home"], hc = (h && h.config) || {};
      this._ortS = { zdef: { lat: Number(hz ? hz.attributes.latitude : hc.latitude) || 51.1657, lon: Number(hz ? hz.attributes.longitude : hc.longitude) || 10.4515, r: Math.round(Number(hz && hz.attributes.radius) || 150) }, draft: null, map: null };
    }
    const pr = this._cfg.presence || {};
    this._ortS.zone = pr.zone || this._ortS.zdef; this._ortS.per = pr.people || {}; this._ortS.own = !!pr.zone;
    return this._ortS;
  }
  _ortZone() { return this._ort().zone; }
  _ortDist(lat, lon) {
    const z = this._ortZone(), R = 6371000, rad = (x) => (x * Math.PI) / 180, dl = rad(lat - z.lat), dn = rad(lon - z.lon);
    const a = Math.sin(dl / 2) ** 2 + Math.cos(rad(z.lat)) * Math.cos(rad(lat)) * Math.sin(dn / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }
  _ortFmtD(m) { return m == null ? "–" : m < 1000 ? `${Math.round(m / 10) * 10} m` : `${num(m / 1000, m < 10000 ? 1 : 0)} km`; }
  _ortAgo(iso) { const t = iso ? new Date(iso).getTime() : NaN; if (!isFinite(t)) return ""; const m = Math.max(0, Math.round((Date.now() - t) / 60000)); return m < 1 ? "gerade eben" : m < 60 ? `vor ${m} Min.` : m < 1440 ? `vor ${Math.round(m / 60)} Std.` : `vor ${Math.round(m / 1440)} Tagen`; }
  _ortTracker(id) {
    const h = this._hass, s = h.states[id]; if (!s) return { id, name: id, missing: true };
    const a = s.attributes || {}, reg = (h.entities || {})[id], cloud = (reg && reg.platform === "icloud") || /icloud/i.test(id) || a.source_type === "gps" && /iphone|ipad|apple/i.test(String(a.friendly_name || id));
    const bat = a.battery_level ?? a.battery;
    return { id, name: a.friendly_name || id, state: s.state, icloud: !!cloud, bat: bat != null && isFinite(Number(bat)) ? Number(bat) : null, acc: a.gps_accuracy != null ? Number(a.gps_accuracy) : null, lat: a.latitude != null ? Number(a.latitude) : null, lon: a.longitude != null ? Number(a.longitude) : null, seen: this._ortAgo(s.last_updated || s.last_changed) };
  }
  _ortPersons() {
    const h = this._hass, st = h.states, o = this._ort(), COL = ["#14b8a6", "#6366f1", "#f59e0b", "#ec4899", "#22c55e", "#0ea5e9"];
    return Object.keys(st).filter((e) => e.startsWith("person.")).map((id, i) => {
      const s = st[id], a = s.attributes || {}, cfg = o.per[id] || {};
      const trackers = cfg.trackers ? cfg.trackers.slice() : [...new Set([...(a.device_trackers || []), ...(a.source ? [a.source] : [])])].filter((x) => x.startsWith("device_tracker."));
      const tr = trackers.map((t) => this._ortTracker(t));
      const good = tr.filter((x) => x.lat != null && (cfg.acc ?? 100) >= (x.acc ?? 0));
      let lat = a.latitude != null ? Number(a.latitude) : null, lon = a.longitude != null ? Number(a.longitude) : null;
      if (lat == null && good[0]) { lat = good[0].lat; lon = good[0].lon; }
      const dist = lat != null ? this._ortDist(lat, lon) : null, inZone = o.own && dist != null && dist <= o.zone.r;
      const home = s.state === "home" || inZone || tr.some((x) => x.state === "home") || (cfg.wifi && (st[cfg.wifi] || {}).state === "home");
      return { id, name: cfg.label || a.friendly_name || id, state: s.state, col: COL[i % COL.length], tr, lat, lon, dist, home, count: cfg.count !== false, acc: cfg.acc ?? 100, wifi: cfg.wifi || "", noSrc: !tr.length && !cfg.wifi, unavailable: s.state === "unavailable" || s.state === "unknown" };
    });
  }
  _ortChip() {
    const P = this._ortPersons(), n = P.filter((x) => !x.noSrc).length;
    return P.length ? `<em class="sxc ${n === P.length ? "ok" : ""}">${n} von ${P.length} mit Ortung</em>` : `<em class="sxc">Offen</em>`;
  }
  /* Karte: eigene Kachelberechnung (OpenStreetMap), ohne Zusatzbibliothek */
  _ortPx(lat, lon, z) { const n = 256 * 2 ** z, sn = Math.sin((lat * Math.PI) / 180); return [((lon + 180) / 360) * n, (0.5 - Math.log((1 + sn) / (1 - sn)) / (4 * Math.PI)) * n]; }
  _ortLL(x, y, z) { const n = 256 * 2 ** z, lon = (x / n) * 360 - 180, lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI; return [lat, lon]; }
  _ortMapInner(c, z, zone, dots, showZone = true) {
    const [cx, cy] = this._ortPx(c.lat, c.lon, z), n = 2 ** z, tx0 = Math.floor(cx / 256), ty0 = Math.floor(cy / 256);
    let t = "";
    for (let dy = -2; dy <= 2; dy++) for (let dx = -3; dx <= 3; dx++) {
      const tx = tx0 + dx, ty = ty0 + dy; if (ty < 0 || ty >= n) continue;
      const X = ((tx % n) + n) % n;
      t += `<img class="otile" alt="" draggable="false" src="https://tile.openstreetmap.org/${z}/${X}/${ty}.png" style="left:calc(50% + ${Math.round(tx * 256 - cx)}px);top:calc(50% + ${Math.round(ty * 256 - cy)}px)">`;
    }
    const mpp = (156543.03392 * Math.cos((c.lat * Math.PI) / 180)) / 2 ** z, rp = Math.max(6, zone.r / mpp);
    const d = dots.map((p) => { const [px, py] = this._ortPx(p.lat, p.lon, z); return `<div class="odot" style="left:calc(50% + ${Math.round(px - cx)}px);top:calc(50% + ${Math.round(py - cy)}px);background:${p.col}" title="${esc(p.name)}">${esc(p.name.slice(0, 1).toUpperCase())}</div>`; }).join("");
    return `<div class="otiles">${t}</div>${showZone ? `<div class="ozone" style="width:${rp * 2}px;height:${rp * 2}px;left:calc(50% + ${Math.round(this._ortPx(zone.lat, zone.lon, z)[0] - cx)}px);top:calc(50% + ${Math.round(this._ortPx(zone.lat, zone.lon, z)[1] - cy)}px)"></div>` : ""}${d}`;
  }
  _ortZoomFor(r) { const lat = this._ortZone().lat; for (let z = 18; z >= 12; z--) { if (r / ((156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** z) <= 70) return z; } return 12; }
  _ortRender() {
    const sr = this.shadowRoot, o = this._ort(), P = this._ortPersons(), z = o.zone, adm = this._admin();
    const withSrc = P.filter((x) => x.dist != null && x.lat != null), inZ = P.filter((x) => x.home).length;
    const cloud = P.flatMap((x) => x.tr).filter((x) => x.icloud), clouds = [...new Set(cloud.map((x) => x.id))].length;
    const pres = this._pres();
    const per = P.map((x) => {
      const t0 = x.tr[0], st = x.unavailable ? ["off", "Nicht erreichbar"] : x.home ? ["home", "Zu Hause"] : x.dist != null ? ["away", `Unterwegs · ${this._ortFmtD(x.dist)}`] : ["off", "Keine Ortung"];
      const src = x.tr.length ? x.tr.map((q) => `${q.icloud ? "iCloud" : "Gerät"}${q.bat != null ? ` · Akku ${Math.round(q.bat)} %` : ""}${q.seen ? ` · ${q.seen}` : ""}`).slice(0, 1).join("") : x.wifi ? "Nur WLAN-Erkennung" : "Noch keine Quelle gewählt";
      return `<div class="oper"><span class="oav" style="background:${x.col}">${esc(x.name.slice(0, 1).toUpperCase())}</span><div class="opi"><b>${esc(x.name)}</b><small>${esc(t0 ? t0.name + " · " : "")}${esc(src)}</small><small>${x.count ? "Zählt für automatisches Abwesend" : "Zählt nicht für automatisches Abwesend"}</small></div><span class="ost ${st[0]}">${esc(st[1])}</span><button class="ibtn" data-act="ortper" data-k="${esc(x.id)}" aria-label="${esc(x.name)} bearbeiten">${ic("pencil", 17)}</button></div>`;
    }).join("");
    sr.getElementById("main").innerHTML = `
      <div class="bar${this._narrow ? " nar" : ""}">${this._narrow ? `<button class="ib0" data-act="menu" aria-label="Menü">${ic("menu", 24)}</button>` : ""}
        <div class="brand"><img class="blogo" src="${LOGO_URL}" alt="MADDOG3010" draggable="false"><div><em class="pn">${esc(PRODUCT)}</em><b>Personen &amp; Standort</b><span><em class="tag">Wer ist zu Hause und wo ist das Zuhause</em>${this._ver ? `<em class="ver">Version ${esc(this._ver)}</em>` : ""}</span></div></div>
        <button class="pillbtn pri" data-act="ortback">${ic("check", 16)}<span class="bl">Fertig</span></button></div>
      <div class="wrap"><div class="sxw">
        <div class="card ocard"><h2>${ic("pin", 18)}Standort-Quelle</h2>
          <div class="oper" style="padding-top:0"><span class="oav" style="background:#64748b">${ic("cloud", 22)}</span><div class="opi"><b>Apple iCloud (Wo ist?)</b><small>${clouds ? `${clouds} iCloud-Gerät${clouds > 1 ? "e" : ""} gefunden. Der Standort kommt von der Home-Assistant-Integration „Apple iCloud“.` : "Noch kein iCloud-Gerät gefunden. Richte zuerst die Home-Assistant-Integration „Apple iCloud“ ein."}</small></div><span class="ost ${clouds ? "home" : "off"}">${clouds ? "Verbunden" : "Nicht eingerichtet"}</span></div>
          <details class="ohint"><summary>iPhone: Das muss stimmen</summary><ol>
            <li><b>Wo ist? und Standortdienste an.</b> Auf dem iPhone: Einstellungen → Apple-Account → Wo ist? → „Mein iPhone suchen“ an. Dazu Datenschutz &amp; Sicherheit → Ortungsdienste an.</li>
            <li><b>Zwei-Faktor-Anmeldung.</b> Home Assistant fragt beim Einrichten einen sechsstelligen Code ab, der auf einem vertrauenswürdigen Apple-Gerät erscheint. Apple beendet die Sitzung gelegentlich, dann musst du dich in Home Assistant erneut anmelden.</li>
            <li><b>Jede Person mit eigener Apple-ID</b> bekommt in Home Assistant einen eigenen Eintrag „Apple iCloud“. Die Geräte stammen aus dem jeweils angemeldeten Konto.</li>
            <li><b>Die Aktualisierung ist nicht sekundengenau.</b> Die Integration fragt in einem wechselnden Takt ab, abhängig von Zone, Entfernung und Akkustand. Der Stromsparmodus des iPhones kann Standortmeldungen zusätzlich verzögern.</li>
            <li><b>Zusätzlich das WLAN nutzen.</b> Als zweite Quelle bei der Person ist ein Router- oder Ping-Gerät sehr zuverlässig, wenn das Handy im Haus ist. Die Person gilt als zu Hause, sobald eine Quelle „zu Hause“ meldet.</li>
            <li><b>Datenschutz.</b> „Strom &amp; Wärme“ nutzt nur „zu Hause“ oder „unterwegs“ und die Entfernung zur Home-Zone. Es wird kein Standortverlauf gespeichert.</li></ol></details></div>
        <div class="card ocard"><h2>${ic("home", 18)}Home-Zone</h2>
          <div class="omap sm" id="omap-main">${this._ortMapInner(z, this._ortZoomFor(Math.max(z.r, ...withSrc.map((x) => Math.min(x.dist, 2000)).concat([0])) * 0.9 || z.r), z, withSrc)}<div class="opin">${ic("pin", 34)}</div><span class="oatt">© OpenStreetMap-Mitwirkende</span></div>
          <div class="ocoord"><span>Radius <b>${z.r} m</b></span><span>Breite <b>${num(z.lat, 5)}</b></span><span>Länge <b>${num(z.lon, 5)}</b></span><span>In der Zone <b>${inZ} von ${P.length}</b></span></div>
          <div class="mut sm" style="margin:8px 0 0">Die Zone gilt für „Anwesenheit &amp; Urlaub“ und für die automatische Erkennung. Eine Person zählt als zu Hause, wenn ihr Standort in der Zone liegt oder Home Assistant „zu Hause“ meldet.${o.own ? "" : " Noch keine eigene Zone festgelegt: Es gilt vorerst die Zone von Home Assistant."}</div>
          ${adm ? `<div class="plnk"><button class="lnk" data-act="ortzone">${ic("pencil", 16)}Home-Zone auf der Karte festlegen</button></div>` : ""}</div>
        <div class="card ocard"><h2>${ic("users", 18)}Personen im Haushalt</h2>${per || `<div class="mut">Keine Personen gefunden. Lege sie in Home Assistant unter Einstellungen → Personen an.</div>`}
          <div class="mut sm" style="margin-top:8px">${pres.auto ? `Der Haushalt wird abwesend, wenn alle zählenden Personen ${pres.away_after} Min. nicht zu Hause sind.` : "Die automatische Erkennung ist aus (Anwesenheit &amp; Urlaub → Einstellungen)."}</div></div>
      </div></div>`;
  }
  _ortPerModal() {
    const d = this._ort().draft, h = this._hass, p = this._ortPersons().find((x) => x.id === d.id) || { name: d.id }, all = Object.keys(h.states).filter((e) => e.startsWith("device_tracker.")).filter((e) => !d.trackers.includes(e)).sort((a, b) => Number(this._ortTracker(b).icloud) - Number(this._ortTracker(a).icloud));
    const wifi = Object.keys(h.states).filter((e) => e.startsWith("device_tracker.") || e.startsWith("binary_sensor.")).sort();
    const tr = d.trackers.map((id) => { const q = this._ortTracker(id); return `<div class="otr"><span class="oav" style="width:36px;height:36px;background:#64748b">${ic("user", 18)}</span><div class="opi"><b>${esc(q.name)} ${q.icloud ? `<span class="ocp">iCloud</span>` : ""}</b><small>${q.missing ? "Entität nicht gefunden" : [q.state === "home" ? "Zu Hause" : q.state === "not_home" ? "Unterwegs" : q.state, q.bat != null ? `Akku ${Math.round(q.bat)} %` : "", q.acc != null ? `Genauigkeit ${Math.round(q.acc)} m` : "", q.seen].filter(Boolean).join(" · ")}</small></div><button class="ibtn" data-act="ortrm" data-k="${esc(id)}" aria-label="Quelle entfernen">${ic("trash", 17)}</button></div>`; }).join("");
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>${esc(p.name)}</b><span>${esc(d.id)}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("user", 15)}Name</div>
      <input class="osel" type="text" data-f="ortlabel" maxlength="30" value="${esc(d.label)}" placeholder="${esc((h.states[d.id].attributes || {}).friendly_name || d.id)}">
      <div class="lsec">${ic("pin", 15)}Standortquellen</div>
      ${tr || `<div class="mut sm">Noch keine Quelle. Wähle das iPhone aus der Liste.</div>`}
      <select class="osel" data-f="ortadd" aria-label="Gerät hinzufügen"><option value="">+ Gerät hinzufügen …</option>${all.map((e) => { const q = this._ortTracker(e); return `<option value="${esc(e)}">${q.icloud ? "iCloud · " : ""}${esc(q.name)} (${esc(e)})</option>`; }).join("")}</select>
      <div class="mut sm">iCloud-Geräte stehen oben. Mehrere Quellen: Die Person ist zu Hause, sobald eine davon „zu Hause“ meldet.</div>
      <div class="lsec">${ic("shield", 15)}WLAN- oder Router-Erkennung (optional)</div>
      <select class="osel" data-f="ortwifi" aria-label="WLAN-Erkennung"><option value="">Keine</option>${wifi.map((e) => `<option value="${esc(e)}" ${d.wifi === e ? "selected" : ""}>${esc((h.states[e].attributes || {}).friendly_name || e)} (${esc(e)})</option>`).join("")}</select>
      <div class="lsec">${ic("sliders", 15)}Regeln</div>
      <div class="vrow"><span>Zählt für automatisches Abwesend</span><button class="sw ${d.count ? "on" : ""}" data-act="ortcount" aria-pressed="${d.count}" aria-label="Zählt für Abwesenheit"></button></div>
      <div class="vrow"><span>Ungenaue Standorte ignorieren ab</span><div class="step"><button data-act="ortacc" data-k="-50" aria-label="weniger">${ic("minus", 18)}</button><b>${d.acc} m</b><button data-act="ortacc" data-k="50" aria-label="mehr">${ic("plus", 18)}</button></div></div>
      <div class="mut sm">Meldet das iPhone eine schlechtere Genauigkeit, wird die Position nicht für die Home-Zone benutzt.</div>
      <div class="foot2" style="margin-top:14px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="ortpsave">Speichern</button></div></div>`;
  }
  _ortZoneModal() {
    const o = this._ort(), m = o.map, P = this._ortPersons().filter((x) => x.lat != null), h = this._hass, hc = h.config || {};
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Home-Zone</b><span>Karte verschieben, der Pin zeigt dein Zuhause</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="omap" id="omap-edit">${this._ortMapInner(m, m.z, { lat: m.lat, lon: m.lon, r: m.r }, P)}<div class="opin">${ic("pin", 34)}</div><div class="ozb"><button data-act="ortz" data-k="1" aria-label="Vergrößern">+</button><button data-act="ortz" data-k="-1" aria-label="Verkleinern">−</button></div><span class="oatt">© OpenStreetMap-Mitwirkende</span></div>
      <div class="ocoord"><span>Breite <b id="olat">${num(m.lat, 5)}</b></span><span>Länge <b id="olon">${num(m.lon, 5)}</b></span></div>
      <div class="vrow" style="margin-top:8px"><span>Radius</span><b id="orv">${m.r} m</b></div>
      <input class="orng" type="range" min="30" max="1000" step="10" value="${m.r}" data-f="ortr" aria-label="Radius der Home-Zone">
      <div class="plnk"><button class="lnk" data-act="ortha">${ic("home", 16)}Standort von Home Assistant übernehmen</button><button class="lnk" data-act="ortme">${ic("pin", 16)}Position einer Person übernehmen</button></div>
      <div class="mut sm" style="margin:6px 0 0">Tipp: Ein Radius von 100 bis 200 m ist für iCloud sinnvoll, weil die Position des iPhones einige Meter abweichen kann. Zu klein, und die Person gilt am Gartentor schon als unterwegs.${hc.latitude ? "" : ""}</div>
      <div class="foot2" style="margin-top:14px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="ortzsave">Zone speichern</button></div></div>`;
  }
  _ortBind() {
    const box = this.shadowRoot.getElementById("modal"), el = box && box.querySelector("#omap-edit"); if (!el || el._ob) return; el._ob = true;
    let drag = null, raf = 0;
    const redraw = () => { raf = 0; const o = this._ort(), m = o.map; const inner = el.querySelector(".otiles"); const html = this._ortMapInner(m, m.z, { lat: m.lat, lon: m.lon, r: m.r }, this._ortPersons().filter((x) => x.lat != null)); const tmp = document.createElement("div"); tmp.innerHTML = html; el.querySelectorAll(".otiles,.ozone,.odot").forEach((n) => n.remove()); [...tmp.children].reverse().forEach((n) => el.insertBefore(n, el.firstChild)); const la = box.querySelector("#olat"), lo = box.querySelector("#olon"); if (la) la.textContent = num(m.lat, 5); if (lo) lo.textContent = num(m.lon, 5); };
    el.addEventListener("pointerdown", (e) => { if (e.target.closest(".ozb")) return; drag = { x: e.clientX, y: e.clientY }; try { el.setPointerCapture(e.pointerId); } catch (_) {} });
    el.addEventListener("pointermove", (e) => { if (!drag) return; const m = this._ort().map, [cx, cy] = this._ortPx(m.lat, m.lon, m.z), [la, lo] = this._ortLL(cx - (e.clientX - drag.x), cy - (e.clientY - drag.y), m.z); drag = { x: e.clientX, y: e.clientY }; m.lat = Math.max(-80, Math.min(80, la)); m.lon = lo; if (!raf) raf = requestAnimationFrame(redraw); });
    const rg = box.querySelector("[data-f=ortr]"); if (rg) rg.addEventListener("input", () => { const m = this._ort().map; m.r = Number(rg.value); const v = box.querySelector("#orv"); if (v) v.textContent = `${m.r} m`; if (!raf) raf = requestAnimationFrame(redraw); });
    const end = () => { drag = null; }; el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
    el.addEventListener("wheel", (e) => { e.preventDefault(); this._ortAct("ortz", { dataset: { k: e.deltaY < 0 ? "1" : "-1" } }); }, { passive: false });
  }
  _ortAct(a, b) {
    const o = this._ort(), k = b.dataset ? b.dataset.k : "";
    if (a === "ortopen") { this._ortOpen = true; this._render(); }
    else if (a === "ortback") { this._ortOpen = false; this._render(); }
    else if (a === "ortper") { const x = this._ortPersons().find((q) => q.id === k); if (!x) return; o.draft = { id: k, label: (o.per[k] || {}).label || "", trackers: x.tr.map((q) => q.id), wifi: x.wifi, count: x.count, acc: x.acc }; this._modal = { type: "ortper" }; this._renderModal(); }
    else if (a === "ortrm") { o.draft.trackers = o.draft.trackers.filter((e) => e !== k); this._renderModal(); }
    else if (a === "ortcount") { o.draft.count = !o.draft.count; this._renderModal(); }
    else if (a === "ortacc") { o.draft.acc = Math.max(20, Math.min(500, o.draft.acc + Number(k))); this._renderModal(); }
    else if (a === "ortpsave") { const d = o.draft; this._cfg.presence = { ...this._pres(), people: { ...o.per, [d.id]: { label: d.label.trim(), trackers: d.trackers, wifi: d.wifi, count: d.count, acc: d.acc } } }; this._savePresence(); this._modal = null; this._renderModal(); this._render(); this._toast("Person gespeichert"); }
    else if (a === "ortzone") { const z = o.zone; o.map = { lat: z.lat, lon: z.lon, r: z.r, z: this._ortZoomFor(z.r) }; this._modal = { type: "ortzone" }; this._renderModal(); }
    else if (a === "ortz") { const m = o.map; m.z = Math.max(5, Math.min(19, m.z + Number(k))); this._renderModal(); }
    else if (a === "ortha") { const hz = this._hass.states["zone.home"], hc = this._hass.config || {}; const la = Number(hz ? hz.attributes.latitude : hc.latitude), lo = Number(hz ? hz.attributes.longitude : hc.longitude); if (isFinite(la) && isFinite(lo)) { o.map.lat = la; o.map.lon = lo; this._renderModal(); } }
    else if (a === "ortme") { const x = this._ortPersons().find((q) => q.lat != null); if (x) { o.map.lat = x.lat; o.map.lon = x.lon; this._renderModal(); this._toast(`Position von ${x.name} übernommen`); } else this._toast("Keine Position verfügbar"); }
    else if (a === "ortzsave") { const m = o.map; this._cfg.presence = { ...this._pres(), zone: { lat: Math.round(m.lat * 1e6) / 1e6, lon: Math.round(m.lon * 1e6) / 1e6, r: m.r } }; this._savePresence(); this._modal = null; this._renderModal(); this._render(); this._toast("Home-Zone gespeichert"); }
  }
  _ortChange(t) {
    const o = this._ort(), f = t.dataset.f;
    if (f === "ortlabel") { o.draft.label = t.value; return true; }
    if (f === "ortadd") { if (t.value && !o.draft.trackers.includes(t.value)) { o.draft.trackers.push(t.value); this._renderModal(); } return true; }
    if (f === "ortwifi") { o.draft.wifi = t.value; return true; }
    if (f === "ortr") { o.map.r = Number(t.value); return true; }
    return false;
  }
  /* Integrationen: Wallbox (go-e Charger) direkt über die lokale HTTP-API verbinden. Die Daten liegen im Backend (wb_get, wb_set, wb_test). */
