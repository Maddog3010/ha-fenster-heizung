  /* ================= Modul 3 · Neue Optik Stufe 2 (Konzept „Modul 3 – Neue Optik“): Energiefluss HD & Hinweise =================
     C1: Geräte als HD-Plaketten (gleiche Symbole wie Modul 19), Balkon als eigener kleiner Knoten, Batterie mit Füllstand
     (unter 20 % rot), Auto als dritter Verbraucher (nur wenn Modul 8 an ist). Linienstärke = Leistung, Leuchtsaum für aktive
     Flüsse, inaktive Wege bleiben als feine graue Spur. Antippen eines Knotens zeigt die Werte im Zeitraum.
     H1: Hinweise mit Symbol, Farbleiste und Knopf zum passenden Modul (nur wenn das Modul an ist), dazu der günstigste Strom.
     Schalter „Energiefluss wie bisher“: layout.m3.flow = false */
  _m3FlowOn() { return this._m3On() && (this._cfg.layout.m3 || {}).flow !== false; }
  _m3Has(id) { return this._mdList().some((m) => m.id === id); }
  /* Auto aus Modul 8: nur wenn das Modul an ist und die Wallbox erreichbar ist */
  _m3Car() {
    if (!this._m3Has("ev") || (this._cfg.layout.m3 || {}).car === false) return null;
    const ev = this._mdState().ev || {}, pe = ev.ent && ev.ent.power;
    if (pe && this._hass.states[pe]) { const w = this._enW(pe); return w == null ? null : { w: Math.max(0, w), who: ev.model || "" }; }
    this._wbLoad(); const s = this._wbSnap();
    if (!s.ok) return null;
    const w = Math.max(0, Number(s.info.power) || 0); return { w, who: s.who && s.who.name ? s.who.name : "" };
  }
  _m3CarDay() {
    const T = (this._wbStD && this._wbStD.data) || null, n = new Date(), td = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
    if (this._wbStatLoad) this._wbStatLoad();
    const r = T && (T.days || []).find((x) => x.d === td); return r ? { kwh: (r.pv || 0) + (r.grid || 0), pv: r.pv || 0 } : null;
  }
  _m3Flow(n) {
    const E = this._enState(), an = this._rkCfg().anim, kw = (w) => (w >= 1000 ? num(w / 1000, 2) + " kW" : Math.round(w) + " W");
    const heat = this._htrTotal(), ws = this._mdState().ww, hasWw = !!(ws.ent.rod || this._m3Has("ww")), ww = this._wwIsOn(ws.ent.rod) ? ws.pv.watt : 0, car = this._m3Car();
    const col = { pv: "#fbbf24", grid: "#60a5fa", exp: "#34d399", bat: n.soc != null && n.soc < 20 ? "#f87171" : "#a78bfa", house: "#2dd4bf", heat: "#f97316", ww: "#38bdf8", car: "#22d3ee" };
    const nm = this._enPvNames(), bal = n.pvb != null, sel = this._m3Sel || "", id = "m3f" + (this.constructor._gxN = ((this.constructor._gxN || 0) + 1) % 1e6);
    /* Linie: graue Spur immer, aktiv mit Leuchtsaum, Stärke nach Leistung und laufenden Punkten (Tempo nach Leistung) */
    const K = [];  /* Aufbau-Schlüssel: welche Linien aktiv, Tempo-Stufe der Punkte; Zahlen und Stärken werden übernommen (K3) */
    const ln = (d, w, c) => {
      const on = w >= 20, sw = (2.4 + Math.min(7, w / 650)).toFixed(1), dur = !on ? "0" : w < 600 ? "2.40" : w < 2500 ? "1.60" : "0.90";  /* drei Tempo-Stufen, damit kleine Änderungen nichts neu starten */ K.push(on ? dur : 0);
      return `<path class="m3tr" d="${d}"/>${on ? `<path class="m3gl" d="${d}" stroke="${c}" style="stroke-width:${(+sw + 7).toFixed(1)}px" filter="url(#${id}b)"/><path class="m3ln" d="${d}" stroke="${c}" style="stroke-width:${sw}px"/><path class="m3dt" d="${d}" style="stroke-width:${Math.max(2.4, sw * .55).toFixed(1)}px;animation-duration:${dur}s"/>` : ""}`;
    };
    /* Plakette: Leuchtring in Gerätefarbe, HD-Symbol, Name und Wert darunter */
    const node = (k, x, y, r, gx, o, c, t1, t2, act, lblPos) => {
      const s = Math.round(r * 1.32), fc = `fill:${act ? c : "var(--mut)"}`, lab = lblPos === "up" ? `<text x="${x}" y="${y - r - 20}" class="m3fn1">${t1}</text><text x="${x}" y="${y - r - 7}" class="m3fn2" style="${fc}">${t2}</text>`
        : lblPos === "left" ? `<text x="${x - r - 8}" y="${y - 2}" class="m3fn1" style="text-anchor:end">${t1}</text><text x="${x - r - 8}" y="${y + 13}" class="m3fn2" style="text-anchor:end;${fc}">${t2}</text>`
        : lblPos === "side" ? `<text x="${x + r + 10}" y="${y - 3}" class="m3fn1" style="text-anchor:start">${t1}</text><text x="${x + r + 10}" y="${y + 12}" class="m3fn2" style="text-anchor:start;${fc}">${t2}</text>`
        : `<text x="${x}" y="${y + r + 15}" class="m3fn1">${t1}</text><text x="${x}" y="${y + r + 29}" class="m3fn2" style="fill:${act ? c : "var(--mut)"}">${t2}</text>`;
      K.push(k + (act ? 1 : 0));
      return `<g class="m3nd${act ? " on" : ""}${sel === k ? " sel" : ""}" data-act="m3fn" data-k="${k}" role="button" tabindex="0" aria-label="${esc(String(t1).replace(/<[^>]+>/g, ""))}: ${esc(String(t2).replace(/<[^>]+>/g, ""))}, antippen für Details" style="--c:${c}">
        ${act ? `<circle cx="${x}" cy="${y}" r="${r + 5}" fill="${c}" opacity=".28" filter="url(#${id}b)"/>` : ""}<circle cx="${x}" cy="${y}" r="${r}" class="m3pq" style="stroke:${act ? c : "var(--line)"}"/>
        ${this._gx(gx, s, o).replace("<svg ", `<svg x="${(x - s / 2).toFixed(1)}" y="${(y - s / 2 - 1).toFixed(1)}" `)}${lab}</g>`;
    };
    const B = [["heat", "radiator", { on: heat > 20 }, col.heat, "Heizung", heat > 20 ? kw(heat) : "aus", heat > 20], ...(hasWw ? [["ww", "boiler", { on: ww > 0 }, col.ww, "Warmwasser", ww ? kw(ww) : "aus", ww > 0]] : []), ...(car ? [["car", "car", { on: car.w > 20 }, col.car, car.w > 20 ? "Auto lädt" : "Auto", car.w > 20 ? kw(car.w) : "lädt nicht", car.w > 20]] : [])];
    const bx = B.length === 3 ? [96, 200, 304] : B.length === 2 ? [140, 260] : [200], bw = { heat: Math.min(heat, n.house), ww: Math.min(ww, n.house), car: car ? Math.min(car.w, n.house) : 0 };
    const exp = n.exp > 20, gridT = exp ? "Einspeisung" : "Netz", gridV = exp ? kw(n.exp) : n.imp > 20 ? "Bezug " + kw(n.imp) : "0 W";
    const batV = n.bc > 20 ? "lädt " + kw(n.bc) : n.dis > 20 ? "entlädt " + kw(n.dis) : "ruht", batT = n.soc != null ? Math.round(n.soc) + " %" : "Batterie";
    const lines = [
      bal ? ln("M142 38Q164 44 175 56", n.pvb, col.pv) : "",
      ln("M200 100V144", n.pv2h, col.pv),
      n.hasBat ? ln("M229 72C300 74 336 100 336 144", n.pv2b, col.pv) : "",
      ln("M171 72C100 74 64 100 64 144", n.exp, col.exp),
      ln("M94 176H168", n.g2h, col.grid),
      n.hasBat ? ln("M306 176H232", n.b2h, col.bat) : "",
      ...B.map(([k], i) => ln(`M200 244C200 262 ${bx[i]} 260 ${bx[i]} 282`, bw[k], col[k])),
    ].join("");
    const nodes = [
      bal ? node("pv2", 122, 34, 20, "balcony", {}, col.pv, esc(nm[1]), kw(n.pvb), n.pvb >= 5, "left") : "",
      node("pv", 200, 70, 29, "pvRoof", {}, col.pv, esc(nm[0]), kw(n.pv), n.pv >= 20, "up"),
      node("grid", 64, 176, 29, "grid", {}, exp ? col.exp : col.grid, gridT, gridV, n.exp > 20 || n.imp > 20),
      node("house", 200, 176, 31, "house", {}, col.house, "Haus", kw(n.house), true),
      n.hasBat ? node("bat", 336, 176, 29, "battery", { lvl: n.soc != null ? n.soc : 60 }, col.bat, batT, batV, n.bc > 20 || n.dis > 20) : "",
      ...B.map(([k, g, o, c, t1, t2, act], i) => node(k, bx[i], 310, 26, g, o, c, t1, t2, act)),
    ].join("");
    const svg = `<svg class="enflow m3fl" viewBox="0 0 400 368" role="img" aria-label="Energiefluss" data-an="${an}"><defs><filter id="${id}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter></defs>${lines}${nodes}</svg>`;
    K.push(sel, an, n.soc != null ? Math.round(n.soc / 5) : "", this._m3Has("ef") ? 1 : 0);
    const big = this._m3Has("ef") ? `<button class="lnk m3big" data-act="mdgo" data-k="ef">Großansicht ›</button>` : "";
    return { svg: `<div class="m3flw" data-kk="${esc("m3f|" + K.join("|"))}" data-ks="1">${svg}</div>`, big, det: this._m3Det(n, { heat, ww, car }) };
  }
  /* Antippen eines Knotens: Werte im gewählten Zeitraum (kWh, Anteil Solar) */
  _m3Det(n, x) {
    const k = this._m3Sel; if (!k) return "";
    const sum = this._enSum(), ok = sum && !sum.empty, P = this._enPer(), per = this._enLabel(P), today = this._enState().range === "day" && P.cur, kwh = (v) => (v == null ? "–" : num(v, v >= 100 ? 0 : v >= 10 ? 1 : 2) + " kWh");
    const price = this._price(), feed = this._feed(), eur = (v, ct) => num(v * ct / 100, 2) + " €", nm = this._enPvNames();
    let bat = null; if (ok && n.hasBat) { const s = this._enSamples(); if (s && this._enState().range === "day") bat = { c: s.reduce((a, y) => a + Math.max(0, y.bat), 0) * 5 / 6e4, d: s.reduce((a, y) => a + Math.max(0, -y.bat), 0) * 5 / 6e4 }; else if (this._enH && this._enH.res) { const t = this._enBk().reduce((a, y) => ({ c: a.c + y.bchg, d: a.d + y.bdis }), { c: 0, d: 0 }); bat = t; } }
    const rooms = this._htrRooms(), heatK = rooms.reduce((a, r) => a + (Number(r.htr.heute_kwh) || 0), 0), heatPv = rooms.reduce((a, r) => a + (Number(r.htr.heute_pv_kwh) || 0), 0);
    const ws = this._mdState().ww, wwK = ws.ent.rod ? (this._wwMinutesOn(ws.ent.rod) || 0) / 60 * ws.pv.watt / 1000 : 0, cd = k === "car" ? this._m3CarDay() : null;
    const self = ok ? Math.max(0, sum.pv - sum.exp) : 0, aut = ok && sum.house > 0 ? Math.round(Math.min(100, Math.max(0, (1 - sum.imp / sum.house) * 100))) : null;
    const D = {
      pv: ["pvRoof", nm[0], "#fbbf24", [[per, kwh(ok ? sum.pv : null)], ["selbst genutzt", ok && sum.pv > 0 ? Math.round(self / sum.pv * 100) + " %" : "–"], ["jetzt", wfmt(n.pv)]]],
      pv2: ["balcony", nm[1], "#fbbf24", [[per, kwh(ok ? sum.pvb : null)], ["Anteil an Solar", ok && sum.pv > 0 ? Math.round(sum.pvb / sum.pv * 100) + " %" : "–"], ["jetzt", wfmt(n.pvb || 0)]]],
      grid: ["grid", "Netz", "#60a5fa", [["Bezug " + per, kwh(ok ? sum.imp : null) + (ok ? " · " + eur(sum.imp, price) : "")], ["Einspeisung", kwh(ok ? sum.exp : null) + (ok ? " · " + eur(sum.exp, feed) : "")], ["jetzt", n.exp > 20 ? "↑ " + wfmt(n.exp) : n.imp > 20 ? "↓ " + wfmt(n.imp) : "0 W"]]],
      house: ["house", "Haus", "#2dd4bf", [[per, kwh(ok ? sum.house : null)], ["Autarkie", aut != null ? aut + " %" : "–"], ["jetzt", wfmt(n.house)]]],
      bat: ["battery", "Batterie", "#a78bfa", [["geladen", bat ? kwh(bat.c) : "–"], ["entladen", bat ? kwh(bat.d) : "–"], ["Ladestand", n.soc != null ? Math.round(n.soc) + " %" : "–"]]],
      heat: ["radiator", "Heizung", "#f97316", [["heute", kwh(heatK)], ["Anteil Solar", heatK > 0 ? Math.round(heatPv / heatK * 100) + " %" : "–"], ["jetzt", wfmt(x.heat)]]],
      ww: ["boiler", "Warmwasser", "#38bdf8", [["heute (geschätzt)", kwh(wwK)], ["oben", this._wwTemps().top != null ? num(this._wwTemps().top, 1) + " °C" : "–"], ["jetzt", x.ww ? wfmt(x.ww) : "aus"]]],
      car: ["car", "Auto", "#22d3ee", [["heute", cd ? kwh(cd.kwh) : "–"], ["Anteil Solar", cd && cd.kwh > 0 ? Math.round(cd.pv / cd.kwh * 100) + " %" : "–"], ["jetzt", x.car && x.car.w > 20 ? wfmt(x.car.w) : "lädt nicht"]]],
    }[k];
    if (!D) return "";
    const go = { heat: "fh", ww: "ww", car: "ev", bat: "bt" }[k], btn = go && this._m3Has(go) ? `<button class="btn2 m3go" data-act="mdgo" data-k="${go}">${{ fh: "Modul 1", ww: "Modul 2", ev: "Modul 8", bt: "Modul 13" }[go]} ›</button>` : "";
    return `<div class="m3fd" style="--c:${D[2]}">${this._gx(D[0], 34, k === "bat" ? { lvl: n.soc ?? 60 } : { on: true })}<b>${esc(D[1])}</b>${D[3].map(([l, v]) => `<span><small>${esc(l)}</small>${v}</span>`).join("")}${btn}<button class="ibtn m3fx" data-act="m3fn" data-k="${k}" aria-label="Schließen">${ic("close", 16)}</button>${!today && ["heat", "ww", "car"].includes(k) ? `<em class="mut sm">Heizung, Warmwasser und Auto nur als Tageswert von heute.</em>` : ""}</div>`;
  }
  /* Stundenpreise aus dem Preissensor (Tibber u. a.): Liste in ct je Abschnitt für heute */
  _m3Prices() {
    const p = this._pv(), e = p.price_mode === "entity" && p.price_sensor ? this._hass.states[p.price_sensor] : null; if (!e) return null;
    const A = e.attributes || {}, u = String(A.unit_of_measurement || "").toLowerCase(), f = (v) => { const x = parseFloat(v); return !isFinite(x) ? null : /ct|cent/.test(u) ? x : /€|eur/.test(u) || x < 5 ? x * 100 : x; };
    const raw = Array.isArray(A.today) ? A.today : Array.isArray(A.raw_today) ? A.raw_today : Array.isArray(A.prices_today) ? A.prices_today : [];
    const v = raw.map((x) => f(typeof x === "object" && x ? x.total ?? x.value ?? x.price : x));
    if (v.length < 12 || v.some((x) => x == null)) return null;
    return { v, step: 1440 / v.length, avg: v.reduce((a, x) => a + x, 0) / v.length };
  }
  _m3CheapTip() {
    const P = this._m3Prices(); if (!P) return null;
    const now = new Date(), m = now.getHours() * 60 + now.getMinutes(), i0 = Math.floor(m / P.step);
    let bi = -1; for (let i = i0; i < P.v.length; i++) if (bi < 0 || P.v[i] < P.v[bi]) bi = i;
    if (bi < 0 || P.v[bi] > P.avg * .92) return null;
    const t = bi * P.step, hh = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.round(t % 60)).padStart(2, "0")}`, low = Math.min(...P.v);
    return { t: bi === i0 ? "Jetzt ist der Strom heute am günstigsten" : `Ab ${hh} ${P.v[bi] <= low + .05 ? "günstigster Strom des Tages" : "günstigster Strom für den Rest des Tages"}`, s: `${num(P.v[bi], 1)} ct statt ${num(P.avg, 1)} ct im Schnitt – gut für Waschmaschine, Trockner und Spülmaschine.` };
  }
  /* H1: Hinweise mit Bild, Farbleiste und Knopf */
  _m3Tips(n, x) {
    const out = [], rooms = this._htrRooms(), ws = this._mdState().ww, heatK = rooms.reduce((a, r) => a + (Number(r.htr.heute_kwh) || 0), 0), heatPv = rooms.reduce((a, r) => a + (Number(r.htr.heute_pv_kwh) || 0), 0);
    const go = (id, l) => (this._m3Has(id) ? [l || "Modul " + { fh: 1, ww: 2, gs: 4, ev: 8, bt: 13 }[id] + " ›", "mdgo", id] : null);
    if (n.exp >= 500) {
      const rodOff = ws.ent.rod && !this._wwIsOn(ws.ent.rod), car = x.car;
      const s = rodOff ? `Der Heizstab ist aus. Er könnte ${wfmt(Math.min(ws.pv.watt, n.exp))} davon nutzen.` : car && car.w < 20 ? "Das Auto lädt gerade nicht. Steckt es, könnte es den Überschuss laden." : rooms.length ? "Heizer könnten mehr davon nutzen, wenn sie nicht ausgelastet oder aus sind." : "Ein Elektroheizer oder Heizstab würde den Überschuss selbst nutzen.";
      out.push({ g: "pvRoof", c: "#fbbf24", t: `${wfmt(n.exp)} Überschuss gehen ins Netz`, s, b: rodOff ? go("ww") : car && car.w < 20 ? go("ev") : go("fh") });
    }
    const ch = this._m3CheapTip(); if (ch) out.push({ g: "price", c: "#84cc16", t: ch.t, s: ch.s, b: go("gs") });
    if (n.imp >= 1500) out.push({ g: "grid", c: "#f87171", t: `Hoher Netzbezug: ${wfmt(n.imp)}`, s: `Gerade laufen Heizung ${wfmt(x.heat)}${x.ww ? ` und Warmwasser ${wfmt(x.ww)}` : ""}${x.car && x.car.w > 20 ? `, das Auto lädt mit ${wfmt(x.car.w)}` : ""}. Der Rest ist Haushalt.`, b: go("fh") });
    if (n.hasBat && n.soc != null && n.soc < 20 && n.pv < 200) out.push({ g: "battery", o: { lvl: n.soc }, c: "#f87171", t: `Batterie nur noch bei ${Math.round(n.soc)} %`, s: "Nachts und ohne Sonne kommt der Strom wieder aus dem Netz.", b: go("bt") });
    this._enOut(n).forEach((nm, i) => out.push({ g: nm === this._enPvNames()[1] ? "balcony" : "pvRoof", c: "#f87171", t: `${esc(nm)} liefert nichts`, s: `${esc(this._enPvNames()[1 - (nm === this._enPvNames()[1] ? 1 : 0)])} erzeugt ${wfmt(nm === this._enPvNames()[1] ? n.pva : n.pvb)}. Ist der Wechselrichter ausgesteckt, aus oder ohne Verbindung?`, b: this._admin() ? ["Prüfen", "mdensetup", ""] : null, k: "o" + i }));
    if (heatK > 0) out.push({ g: "radiator", o: { on: true }, c: "#f97316", t: `${Math.round(heatPv / heatK * 100)} % der Heizer-Energie heute kam aus Solar`, s: `${num(heatK, 1)} kWh für die Raumheizer, davon ${num(heatPv, 1)} kWh mit Sonne.`, b: go("fh") });
    if (!out.length) out.push({ g: "house", c: "#2dd4bf", t: "Alles ruhig", s: "Kein Überschuss, kein hoher Netzbezug.", b: null });
    return `<div class="card"><h2>${ic("info", 18)}Hinweise</h2><div class="m3hl">${out.map((h) => `<div class="m3hn" style="--c:${h.c}">${this._gx(h.g, 38, h.o || {})}<div><b>${h.t}</b>${h.s ? `<span>${h.s}</span>` : ""}</div>${h.b ? `<button class="m3hb" data-act="${h.b[1]}" data-k="${h.b[2]}">${esc(h.b[0])}</button>` : ""}</div>`).join("")}</div></div>`;
  }
