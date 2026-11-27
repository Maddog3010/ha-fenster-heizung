  /* ================= Tablet-Modus · Stufe 7 (2026.11.5b15) =================
     Module in Entwicklung (5 Lüftung, 6 Rollläden, 7 Wärmepumpe, 10 Garten, 12 Pool, 13 Batterie) mit den Reitern „Jetzt“, „Vorschau“
     (Bild mit Zahlen zum Antippen) und „Fahrplan“, dazu Modul 0 · Haus & Grundriss als Wärmekarte. Alles ohne Scrollen. */
  static TM2_CS = {
    lu: { P: () => LU_PINS, S: () => LU_STEPS, I: () => LU_IDEAS, O: () => LU_OPEN, N: "Lüftung & Raumluft" },
    rb: { P: () => RB_PINS, S: () => RB_STEPS, I: () => RB_IDEAS, O: () => RB_OPEN, N: "Rollläden & Beschattung" },
    wp: { P: () => WP_PINS, S: () => WP_STEPS, I: () => WP_IDEAS, O: () => WP_OPEN, N: "Wärmepumpe" },
    ga: { P: () => GA_PINS, S: () => GA_STEPS, I: () => GA_IDEAS, O: () => GA_OPEN, N: "Garten & Bewässerung", live: false },
    pl: { P: () => PL_PINS, S: () => PL_STEPS, I: () => PL_IDEAS, O: () => PL_OPEN, N: "Pool & Sauna" },
    bt: { P: () => BT_PINS, S: () => BT_STEPS, I: () => BT_IDEAS, O: () => BT_OPEN, N: "Batteriespeicher-Planung" }
  };
  _tm2CsOn(v) { return !!this.constructor.TM2_CS[v]; }
  _tm2CsStatus(v) {
    if (v === "lu") { const R = this._collect(), n = R.filter((r) => this._airData(r)).length; return n ? `${n} von ${R.length} Räumen mit Luftfeuchte · in Entwicklung` : "In Entwicklung"; }
    return "In Entwicklung · Vorschau mit Beispielwerten";
  }
  _tm2CsBadge() { return `<span class="tm2csbd">${ic("clock", 16)}In Entwicklung</span>`; }
  _tm2Cs(v) {
    const t = this._tm2Tab(v);
    return t === "pre" ? this._tm2CsPre(v) : t === "plan" ? this._tm2CsPlan(v) : this._tm2CsNow(v);
  }
  /* Reiter „Jetzt“: echte Werte aus Home Assistant, groß und ohne Scrollen */
  _tm2CsTiles(v) {
    const tl = (l, val, u, sub, c) => this._tm2Tile4(l, val, u, sub, c);
    if (v === "lu") {
      const L = this._collect().map((r) => ({ r, a: this._airData(r) })), land = this._tm2Land(), per = land ? 8 : 6, p = this._tm2Page("cslu", L.length, per);
      if (!L.length) return { none: ["drop", "Noch keine Räume eingerichtet.", "Räume legst du in Modul 1 an."] };
      const tiles = L.slice(p.from, p.to).map(({ r, a }) => !a ? tl(esc(r.name), "–", "", "Kein Luftfeuchte-Sensor", "#8e99ae") : tl(esc(r.name), num(a.rh), "%", `Taupunkt ${num(a.td, 1)} °C · Schimmel ${MOLD[a.lvl][0]}`, a.rh >= 70 ? "#f87171" : a.rh >= 60 ? "#fbbf24" : "#34d399"));
      return { tiles, pager: this._tm2Pager("cslu", p, "Räume"), note: "Luftfeuchte, Taupunkt und Schimmelrisiko je Raum. Sensoren wählst du in den Raumeinstellungen von Modul 1." };
    }
    if (v === "bt") {
      const soc = this._soc(), p = this._pv(), pv = this._pvNow();
      return { tiles: [tl("Ladestand", soc != null ? num(soc, 0) : "–", soc != null ? "%" : "", soc != null ? "Sensor aus Modul 1" : "Noch kein Sensor gewählt", "#34d399"),
        tl("PV-Überschuss", pv != null ? wfmt(pv) : "–", "", pv != null ? "Verfügbar zum Laden" : "Noch kein Sensor gewählt", "#fbbf24"),
        tl("Untergrenze", p.soc_min != null && p.soc_sensor ? num(p.soc_min, 0) : "–", p.soc_min != null && p.soc_sensor ? "%" : "", "Heizer erst darüber (Modul 1)", "#60a5fa")],
      modes: [["sun", "PV laden", "Überschuss in die Batterie"], ["shield", "Halten", "Ladestand nicht verändern"], ["home", "Haus aus Batterie", "Verbrauch aus dem Speicher decken"], ["energy", "Netzladen", "Bei günstigem Strom laden"]] };
    }
    if (v === "pl") {
      const pv = this._pvNow(), pr = this._price(), o = this._out();
      return { tiles: [tl("PV-Überschuss", pv != null ? wfmt(pv) : "–", "", pv != null ? (pv >= 1000 ? "Gut für Pumpe und Heizung" : "Eher wenig") : "Noch kein Sensor gewählt", "#fbbf24"),
        tl("Strompreis", pr ? num(pr, 1) : "–", pr ? "ct/kWh" : "", pr ? "Aus Modul 1" : "Noch kein Preis gewählt", "#a78bfa"),
        tl("Außentemperatur", o.t != null ? num(o.t, 1) : "–", o.t != null ? "°C" : "", o.t != null && o.t < 10 ? "Pool-Heizung lohnt kaum" : "Draußen", "#60a5fa")] };
    }
    if (v === "rb") {
      const sun = this._hass.states["sun.sun"], o = this._out(), el = sun ? Number(sun.attributes.elevation) : NaN, az = sun ? Number(sun.attributes.azimuth) : NaN;
      const dir = isFinite(az) ? ["Nord", "Nordost", "Ost", "Südost", "Süd", "Südwest", "West", "Nordwest"][Math.round(az / 45) % 8] : "";
      return { tiles: [tl("Sonnenhöhe", isFinite(el) ? num(el, 0) : "–", isFinite(el) ? "°" : "", isFinite(el) ? (el > 0 ? "Sonne über dem Horizont" : "Sonne unter dem Horizont") : "Keine Sonnen-Entität", "#fbbf24"),
        tl("Richtung", dir || "–", "", isFinite(az) ? `${num(az, 0)} °` : "", "#fb923c"),
        tl("Draußen", o.t != null ? num(o.t, 1) : "–", o.t != null ? "°C" : "", o.rh != null ? `${num(o.rh)} % Luftfeuchte` : "", "#60a5fa")] };
    }
    const o = this._out();   /* wp */
    return { tiles: [tl("Außentemperatur", o.t != null ? num(o.t, 1) : "–", o.t != null ? "°C" : "", o.t != null && o.t < 7 ? "Abtauen wird wahrscheinlicher" : "Kaum Abtau-Bedarf", "#60a5fa"), tl("Luftfeuchte", o.rh != null ? num(o.rh) : "–", o.rh != null ? "%" : "", "Draußen", "#2dd4bf")] };
  }
  _tm2CsNow(v) {
    const D = this._tm2CsTiles(v);
    if (D.none) return this._tm2None(...D.none);
    const land = this._tm2Land(), n = D.tiles.length, c = land ? (n >= 4 ? 4 : Math.max(2, n)) : 2;
    const modes = D.modes ? `<div class="tm2csmodes">${D.modes.map((m, i) => `<div class="tm2csmo${i ? " off" : ""}"><b>${ic(m[0], 20)}${m[1]}</b><small>${m[2]}</small></div>`).join("")}</div>` : "";
    return `<div class="tm2cs now"><div class="tm2csbar">${this._tm2CsBadge()}<span class="tm2csnote">${esc(D.note || "Die Werte kommen aus Home Assistant. Gesteuert wird in diesem Modul noch nichts.")}</span></div>
      <div class="tm2csg" style="--c:${c}">${D.tiles.join("")}</div>${modes}${D.pager || ""}</div>`;
  }
  /* Reiter „Vorschau“: Bild mit Zahlen, rechts die Erklärung zur gewählten Zahl */
  _tm2CsScr(v) { const P = this.constructor.TM2_CS[v].P(), K = Object.keys(P), cur = ((this._tm2CsS || {})[v]); return K.includes(cur) ? cur : K[0]; }
  _tm2CsPre(v) {
    const P = this.constructor.TM2_CS[v].P(), K = Object.keys(P), sc = this._tm2CsScr(v), d = P[sc], pk = `${v}.${sc}`, sel = Math.min(Math.max(0, ((this._tm2CsPn || {})[pk]) || 0), d.pins.length - 1), cur = d.pins[sel];
    const name = (k) => P[k].t || P[k].alt.split(" mit ")[0].split(",")[0];
    const chips = K.length > 1 ? `<div class="tm2csch" role="tablist">${K.map((k) => `<button class="tm2csc${k === sc ? " sel" : ""}" role="tab" aria-selected="${k === sc}" data-act="tm2cssc" data-m="${v}" data-k="${k}">${esc(name(k))}</button>`).join("")}</div>` : "";
    const rows = d.pins.map((p, i) => `<button class="tm2csrow${i === sel ? " sel" : ""}" data-act="tm2cspin" data-m="${v}" data-s="${sc}" data-i="${i}"><span class="gan">${i + 1}</span><span>${esc(p[2])}</span></button>`).join("");
    return `<div class="tm2cs"><div class="tm2csbar">${chips}${this._tm2CsBadge()}</div>
      <div class="tm2csmain"><div class="card tm2csimg" data-tm2ch="csimg" data-m="${v}" data-s="${sc}" data-src="${GA_IMG}${d.img}${this._ver ? "?v=" + encodeURIComponent(this._ver) : ""}"></div>
      <div class="tm2csside"><div class="card tm2cscur"><div class="tm2csh"><span class="gan">${sel + 1}</span><b>${esc(cur[2])}</b></div><p>${esc(cur[3])}</p></div><div class="tm2csrows">${rows}</div></div></div></div>`;
  }
  _tm2CsImg(box, w, h) {
    const src = box.dataset.src, Z = this._tm2CsZ || (this._tm2CsZ = {}), z = Z[src];
    if (!z) { const im = new Image(); im.onload = () => { Z[src] = [im.naturalWidth || 1100, im.naturalHeight || 520]; if (this._tm2Shows(this._tmV())) this._render(); }; im.onerror = () => { Z[src] = [1100, 520]; }; im.src = src; }
    const [W, H] = z || [1100, 520], s = Math.min((w - 20) / W, (h - 20) / H), wd = Math.max(40, Math.floor(W * s)), ht = Math.max(30, Math.floor(H * s));
    const d = this.constructor.TM2_CS[box.dataset.m].P()[box.dataset.s], pk = `${box.dataset.m}.${box.dataset.s}`, sel = Math.min(Math.max(0, ((this._tm2CsPn || {})[pk]) || 0), d.pins.length - 1);
    box.innerHTML = `<div class="tm2cswrap" style="width:${wd}px;height:${ht}px"><img src="${esc(src)}" alt="${esc(d.alt)}" draggable="false">${d.pins.map((p, i) => `<button class="gapin${i === sel ? " on" : ""}" style="left:${p[0]}%;top:${p[1]}%" data-act="tm2cspin" data-m="${box.dataset.m}" data-s="${box.dataset.s}" data-i="${i}" aria-label="${esc(p[2])}" aria-pressed="${i === sel}">${i + 1}</button>`).join("")}</div>`;
  }
  /* Reiter „Fahrplan“: Stufen, Ideen und offene Fragen */
  _tm2CsPlan(v) {
    const C = this.constructor.TM2_CS[v], S = C.S(), I = C.I(), O = C.O();
    return `<div class="tm2cs"><div class="tm2csbar">${this._tm2CsBadge()}<span class="tm2csnote">${esc(C.N)}: so geht es weiter</span></div>
      <div class="tm2csplan"><div class="card tm2csst"><h3>${ic("clock", 18)}Fahrplan</h3>${S.map(([n, t, d], i) => `<div class="tm2css"><span class="tm2cssn${i === 0 ? " d" : ""}">${esc(n)}</span><span><b>${esc(t)}</b><small>${esc(d)}</small></span></div>`).join("")}</div>
      <div class="tm2csrt"><div class="card"><h3>${ic("puzzle", 18)}Weitere Ideen</h3><div class="tm2cschips">${I.slice(0, 8).map((x) => `<span>${esc(x)}</span>`).join("")}</div></div>
      <div class="card"><h3>${ic("info", 18)}Noch offen</h3><ul>${O.slice(0, 3).map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></div></div></div>`;
  }
  _tm7Act(a, b) {
    if (a === "tm2cssc") { (this._tm2CsS || (this._tm2CsS = {}))[b.dataset.m] = b.dataset.k; this._render(); return true; }
    if (a === "tm2cspin") { (this._tm2CsPn || (this._tm2CsPn = {}))[`${b.dataset.m}.${b.dataset.s}`] = +b.dataset.i; this._render(); return true; }
    return false;
  }
  /* ---------- Modul 0 · Haus & Grundriss: die Wärmekarte, ohne Scrollen ---------- */
  _tm2Gr() { this._grTv = true; try { return `<div class="tm2gr">${this._grPage()}</div>`; } finally { this._grTv = false; } }
