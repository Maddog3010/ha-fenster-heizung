  /* ================= Startseite · Neue Optik Stufe 1 (Konzept_Startseite_Neue-Optik) =================
     Zustandsfarben wie Modul 1 (Türkis gut, Blau Info, Orange aktiv, Bernstein Hinweis, Rot Warnung, Violett Nacht, Grau aus),
     HD-Symbole an den Kacheln, Gesamt-Ampel als Text oben, runde Bubbles mit Ring in Zustandsfarbe.
     Einstellungen in layout.start: look = "new" | "classic" (Wie bisher), amp = false → einfache Kopfzeile wie bisher.
     Der globale Schalter „wie bisher“ der Grafik-Bibliothek (_gxCfg().classic) gilt auch hier. */
  _hzNew() { const l = (this._cfg && this._cfg.layout && this._cfg.layout.start) || {}; return l.look !== "classic" && !this._gxCfg().classic; }
  _hzAmpOn() { return this._hzHead() !== "simple"; }
  /* Zustand aus den bisherigen Klassen: bad → Warnung, wa → Hinweis, in → Info, mut → aus */
  _hzZ(c) { return { bad: "warn", wa: "hint", in: "info", mut: "off", act: "act", ok: "ok", night: "night" }[c] || "ok"; }
  static HZ_HD = { fh: "radiator", ww: "boiler", en: "pvRoof", gs: "plug", lu: "fan", rb: "shutter", wp: "heatpump", ev: "car", wx: "weather", ga: "garden", sf: "smoke", pl: "pool", bt: "battery", dt: "price", wa: "wrench", sp: "forecast", ef: "house", mu: "bin", li: "lamp" };
  _hzHdFor(m) {
    const K = this.constructor.HZ_HD, L = this._gxLib().L;
    if (K[m.id]) return K[m.id];
    if (m.icon === "robot") return "robot";
    const a = this._gxAlt(m.icon || ""); return a && L[a] ? a : "";
  }
  /* Räume, die gerade heizen (Thermostat meldet hvac_action heating) */
  _hzHeatN() {
    const st = this._hass.states; let n = 0;
    try { this._collect().forEach((r) => { if ((r.thermos || []).some((e) => st[e] && (st[e].attributes || {}).hvac_action === "heating")) n++; }); } catch (_) { /* egal */ }
    return n;
  }
  /* Zusätzliche Warnungen für die Gesamt-Ampel: Modul 9 (Frost, Sturm, Gewitter …) und Modul 11 (Alarm, offline) */
  _hzWarnX() {
    const out = [], on = this._mdState().on;
    if (on.wx) {
      try {
        const S = this._wxs(), W = (!S.error && S.state && S.state.warn) || this._wxsLocal(), NM = this._wxsNames(), o = this._out();
        Object.keys(NM).forEach((k) => { const w = W[k]; if (w && w.a) out.push({ k: `wx:${k}`, i: k === "frost" ? "snow" : k === "heat" ? "sun" : "alert", t: `Warnung: ${k === "frost" && w.kind === "ice" ? "Glätte" : NM[k]}${w.lv ? ` · Stufe ${w.lv}` : ""}`, s: k === "frost" && o.t != null ? `Draußen ${num(o.t, 1)} °C` : w.v != null && k === "storm" ? `Böen ${num(w.v, 0)} km/h` : "Modul 9", r: "jetzt", c: "bad", soft: true, mod: "wx", hd: "weather", frost: k === "frost" }); });
        const OL = (S.state && S.state.officials) || [], hmx = (iso) => { const t = new Date(iso); return String(t.getHours()).padStart(2, "0") + ":" + String(t.getMinutes()).padStart(2, "0"); };
        if (OL.length) OL.forEach((x, j) => out.push({ k: `wx:off:${j}:${x.titel}`, i: "alert", t: `${x.vorab ? "Vorab" : x.kommt ? "Bald" : "Amtliche Warnung"}: ${esc(x.titel)} · Stufe ${x.stufe}`, s: `${esc(String(x.quelle).split(" · ")[0])}${x.vorab || x.kommt ? (x.von ? " · ab " + hmx(x.von) : "") : x.bis ? " · bis " + hmx(x.bis) : ""}`, r: "jetzt", c: x.vorab || x.kommt ? "warn" : "bad", soft: true, mod: "wx", hd: "weather" }));
        else { const O = S.state && S.state.official; if (O && O.level > 0 && O.title) out.push({ k: "wx:dwd", i: "alert", t: `${esc(O.title)}`, s: "DWD / NINA", r: "jetzt", c: "bad", soft: true, mod: "wx", hd: "weather" }); }
        ((S.vor || []).filter((x) => !x.done)).forEach((x) => out.push({ k: `wx:vor:${x.id}`, i: x.icon === "battery" ? "energy" : x.icon, t: `Vorsorge: ${esc(x.title)}`, s: esc(x.text), r: "jetzt", c: "info", soft: true, mod: "wx", hd: "weather" }));
      } catch (_) { /* Modul 9 noch nicht geladen */ }
    }
    if (on.sf) {
      try {
        const T = this._sfStat();
        T.al.forEach((x) => out.push({ k: `sf:al:${x.id}`, nosn: true, i: "alert", t: `Rauchmelder ${esc(x.name || "")}: Alarm`, s: esc(x.room || x.area || "Modul 11"), r: "jetzt", c: "bad", mod: "sf", hd: "smoke", alarm: true }));
        if (T.off.length) out.push({ k: "sf:off", i: "alert", t: T.off.length === 1 ? `Melder offline: ${esc(T.off[0].name || "")}` : `${T.off.length} Melder offline`, s: "Modul 11 · nicht erreichbar", r: "", c: "bad", soft: true, mod: "sf", hd: "smoke" });
      } catch (_) { /* Modul 11 noch nicht geladen */ }
    }
    return out;
  }
  /* Gesamt-Ampel: drei Stufen. Info-Einträge (z. B. Müllabfuhr) lassen die Ampel grün. */
  _hzLevel(hints) {
    const warn = hints.filter((h) => h.c === "bad"), hint = hints.filter((h) => h.c === "wa"), info = hints.filter((h) => h.c !== "bad" && h.c !== "wa");
    const strip = (t) => String(t || "").replace(/<[^>]*>/g, "");
    if (warn.length) return { z: "warn", t: strip(warn[0].t).replace(/^Warnung: /, "Warnung: "), s: [...warn.slice(1), ...hint].slice(0, 2).map((h) => strip(h.t)).join(" · ") || strip(warn[0].s), n: warn.length + hint.length, info: info.length };
    if (hint.length) return { z: "hint", t: hint.length === 1 ? "1 Hinweis" : `${hint.length} Hinweise`, s: hint.slice(0, 2).map((h) => strip(h.t)).join(" · "), n: hint.length, info: info.length };
    return { z: "ok", t: "Alles in Ordnung", s: info.length ? info.slice(0, 2).map((h) => strip(h.t)).join(" · ") : "Keine offenen Hinweise.", n: 0, info: info.length };
  }
  _hzAmpel(hints) {
    const L = this._hzLevel(hints), sym = L.z === "ok" ? ic("check", 26) : `<b>!</b>`;
    return `<div class="card hzamp z-${L.z}"${L.n || L.info ? ` data-act="hzgo" data-k="" data-b="hinweise" role="button" tabindex="0"` : ""}>
      <span class="hzal" aria-hidden="true"><i class="r"></i><i class="y"></i><i class="g"></i></span>
      <span class="hzab" aria-hidden="true">${sym}</span>
      <div class="hzax"><b>${esc(L.t)}</b><small>${esc(L.s)}${L.info && L.z !== "ok" ? ` · ${L.info} Info` : ""}</small></div>
      ${L.n || L.info ? `<span class="hzago">${L.n ? "Ansehen" : "Info"}${ic("chev", 16)}</span>` : ""}</div>`;
  }
  /* Runde Bubbles mit Ring in Zustandsfarbe (Konzept E1). p = Füllung des Rings 0–1, sonst voller Ring. */
  _hzBubN(x) {
    const r = 34, C = 2 * Math.PI * r, p = x.p == null ? 1 : Math.max(0.02, Math.min(1, x.p)), z = this._hzZ(this._hzCfg().bub.warn ? x.c || "" : "");
    const hd = { wetter: "weather", personen: "people", alarm: "shield", solar: "pvRoof", batterie: "battery", auto: "car", fenster: "windowOpen", muell: "bin", warmwasser: "boiler", preis: "price", hinweise: "" }[x.id];
    const pic = hd ? this._gx(hd, 26, x.o || {}) : ic(x.i, 20), long = String(x.b).length > 7;
    return `<button class="hzbn z-${z}" role="listitem" data-act="hzbub" data-k="${x.id}" aria-label="${esc(x.s)}: ${esc(x.b)}"><span class="hzbr"><svg viewBox="0 0 76 76" aria-hidden="true"><circle cx="38" cy="38" r="${r}" class="bg"/><circle cx="38" cy="38" r="${r}" class="fg" data-hzr="b${x.id}" stroke-dasharray="${(p * C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 38 38)"/></svg><span class="hzbp">${pic}</span><b class="${long ? "lg" : ""}">${esc(x.b)}</b></span><small>${esc(x.s)}</small></button>`;
  }
  /* Werte für Ring und Bild der runden Bubbles */
  _hzBubX(x) {
    const st = this._hass.states;
    if (x.id === "batterie" || x.id === "auto") { const v = parseFloat(String(x.b).replace(",", ".")); if (isFinite(v)) { x.p = v / 100; x.o = { lvl: v }; } }
    if (x.id === "personen") { const P = this._ortPersons().filter((p) => p.count), n = P.filter((p) => p.home).length; if (P.length) { x.p = n / P.length; x.b = `${n} / ${P.length}`; x.s = "zu Hause"; } }
    if (x.id === "alarm") { const e = this._hzAlarmEnt(), s = e && st[e] ? st[e].state : ""; x.o = { k: s === "triggered" ? "bad" : s === "disarmed" ? "off" : "ok" }; if (!x.c && s && s !== "disarmed") x.c = "ok"; }
    if (x.id === "wetter") { const t = this._out().t; if (t != null && t <= 0) x.o = { frost: true }; if (this._hzWarnX().some((h) => h.mod === "wx")) x.c = "bad"; }
    if (x.id === "solar" && this._enOn()) { const N = this._enNow(); if (N) { x.c = x.c || (N.pv > 50 ? "act" : "off"); x.o = { on: N.pv > 50 }; } }
    if (x.id === "fenster") x.o = {};
    if (x.id === "warmwasser") x.o = { t: String(x.b).replace(/\s*°C/, "°") };
    if (x.id === "auto" && x.s === "lädt") x.c = "act";
    if (x.id === "hinweise" && x.c === "wa" && this._hzHints().some((h) => h.c === "bad")) x.c = "bad";
    return x;
  }
  _hzLookRows(c, sw, chip) {
    return `<div class="lsec" style="margin-top:12px">${ic("palette", 15)}Darstellung</div>
      <div class="vrow"><span>Optik<small class="mut" style="display:block">Neu: HD-Symbole, Zustandsfarben und runde Bubbles. Wie bisher: Kacheln mit einfachen Symbolen.</small></span><span class="gschs">${chip("hzlook", "new", "Neue Optik", c.look !== "classic")}${chip("hzlook", "classic", "Wie bisher", c.look === "classic")}</span></div>
      ${c.look !== "classic" ? `<div class="vrow"><span>Kachelgröße<small class="mut" style="display:block">S: nur die Zahl. M: Zahl mit Ring oder Mini-Verlauf. L: mit großem Verlauf der letzten 24 Stunden.</small></span><span class="gschs">${chip("hzksize", "s", "S", this._hzKs() === "s")}${chip("hzksize", "m", "M", this._hzKs() === "m")}${chip("hzksize", "l", "L", this._hzKs() === "l")}</span></div>` : ""}
      ${c.look !== "classic" ? this._hzLook4(chip) : ""}
      ${c.look !== "classic" ? `<div class="vrow"><span>Kopfbereich<small class="mut" style="display:block">Szene: Haus mit Tageszeit und Wetter, Gesamt-Ampel und Werten. Ampel: nur die Gesamt-Ampel als Zeile. Einfach: Kopfzeile in der Karte „Zuhause“ wie bisher.</small></span><span class="gschs">${chip("hzhead", "scene", "Szene", this._hzHead() === "scene")}${chip("hzhead", "text", "Ampel", this._hzHead() === "text")}${chip("hzhead", "simple", "Einfach", this._hzHead() === "simple")}</span></div>` : ""}`;
  }
