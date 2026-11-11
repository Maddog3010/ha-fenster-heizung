  /* ================= Modul 3 · Neue Optik Stufe 1 (Konzept „Modul 3 – Neue Optik“): Symbole & Kacheln =================
     HD-Symbole an den Kacheln (Solar mit Balkon, Netzbezug, Einspeisung, Verbrauch), Kacheln 2.0 mit Verlauf als Fläche
     und Punkt „jetzt“, Vergleich als Plakette, Doppelring im Banner (außen Autarkie, innen Eigenverbrauch) und
     Preis-Skala relativ zum Tagesdurchschnitt. Schalter „Kacheln wie bisher“: layout.m3.old */
  _m3On() { return !((this._cfg.layout.m3 || {}).old) && !this._gxCfg().classic; }
  /* HD-Symbol mit kleiner Richtungs-Plakette (Netzbezug ↓ rot, Einspeisung ↑ grün) */
  _m3Ic(f, o = {}) {
    const k = { pv: "pvRoof", imp: "grid", exp: "grid", house: "house" }[f] || "house", tag = f === "imp" ? ["↓", "#f87171"] : f === "exp" ? ["↑", "#34d399"] : null;
    return `<span class="m3ic">${this._gx(k, 40, o)}${f === "pv" && o.balk ? `<span class="m3sub">${this._gx("balcony", 20)}</span>` : ""}${tag ? `<i class="m3ar" style="background:${tag[1]}">${tag[0]}</i>` : ""}</span>`;
  }
  /* Verlauf als Fläche mit Farbverlauf, weißer Punkt = jetzt */
  _m3Spark(f, c) {
    const E = this._enState(); let v = [];
    if (E.range === "day") { const s = this._enSamples() || [], h = Array(24).fill(0), k = Array(24).fill(0); s.forEach((x) => { const i = Math.min(23, Math.floor(x.t / 60)); h[i] += x[f]; k[i]++; }); v = h.map((x, i) => (k[i] ? x / k[i] : null)); }
    else if (this._enH && this._enH.res) { const now = Date.now(); v = this._enBk().map((d) => (+d.d - (E.range === "year" ? 15 * 864e5 : 432e5) > now ? null : f === "house" ? Math.max(0, d.pv - d.exp + d.imp - d.bchg + d.bdis) : d[f])); }
    const pts = v.map((x, i) => [i, x]).filter((p) => p[1] != null); if (pts.length < 2) return "";
    const mx = Math.max(...pts.map((p) => p[1]), 1e-6), X = (i) => (i / Math.max(1, v.length - 1)) * 100, Y = (y) => 30 - (y / mx) * 26, id = "m3g" + (this.constructor._gxN = ((this.constructor._gxN || 0) + 1) % 1e6);
    const d = pts.map((p, i) => `${i ? "L" : "M"}${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join(""), last = pts[pts.length - 1], P = this._enPer();
    const dot = P.cur ? `<circle cx="${X(last[0]).toFixed(1)}" cy="${Y(last[1]).toFixed(1)}" r="2.6" fill="#fff" stroke="${c}" stroke-width="1.4" vector-effect="non-scaling-stroke"/>` : "";
    return `<div class="m3sp"><svg viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient></defs>
      <path d="${d}L${X(last[0]).toFixed(1)} 32L${X(pts[0][0]).toFixed(1)} 32Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke="${c}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>${dot ? `<i class="m3now" style="left:${Math.min(97, X(last[0])).toFixed(1)}%;top:${Math.min(30, Y(last[1]) / 32 * 34).toFixed(1)}px;--c:${c}"></i>` : ""}
      ${E.range === "day" ? `<div class="m3ax"><span>0</span><span>12</span><span>24 Uhr</span></div>` : ""}</div>`;
  }
  /* Vergleich als Plakette: grün = besser, rot = schlechter, grau = neutral */
  _m3Cmp(cur, old, good, on) {
    if (!on || old == null || old < 0.05) return "";
    const d = Math.round((cur - old) / old * 100); if (!isFinite(d)) return "";
    const c = d === 0 || good === "none" ? "nt" : (d > 0) === (good === "up") ? "up" : "dn";
    return `<span class="m3pl ${c}" title="${esc(this._enCmpLbl())}">${d > 0 ? "▲" : d < 0 ? "▼" : "="} ${Math.abs(d)} %</span>`;
  }
  _m3Tiles(tl, ok, hl) {
    return `<div class="tiles entiles m3tiles">${tl.map(([f, , lab, v, c, sub, cm, o]) => `<button class="tile entile m3t${hl === f ? " sel" : ""}" style="--a:${c}" data-act="entile" data-k="${f}" aria-pressed="${hl === f}">
      <div class="m3h">${this._m3Ic(f, o || {})}<span class="m3l">${lab}</span>${cm}</div>
      <div class="v">${v}<small>kWh</small></div><div class="g">${sub || "&nbsp;"}</div>${ok ? this._m3Spark(f, c) : ""}</button>`).join("")}</div>`;
  }
  /* Doppelring: außen Autarkie (türkis), innen Eigenverbrauch (gelb) */
  _m3Ring(out, inn, ringA, lab) {
    const R1 = 50, R2 = 38, C1 = 2 * Math.PI * R1, C2 = 2 * Math.PI * R2, a = (p, C) => `${(Math.max(0, Math.min(100, p || 0)) / 100 * C).toFixed(1)} ${C.toFixed(1)}`;
    return `<div class="mring enrg m3ring" data-act="enring" role="button" tabindex="0" title="Tippen: ${ringA ? "gedeckt jetzt" : "Autarkie im Zeitraum"}" aria-label="${lab} ${out} %, Eigenverbrauch ${inn == null ? "unbekannt" : inn + " %"}, tippen zum Umschalten">
      <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="${R1}" class="m3b"/><circle cx="60" cy="60" r="${R1}" class="m3o" stroke-dasharray="${a(out, C1)}" transform="rotate(-90 60 60)"/>
      <circle cx="60" cy="60" r="${R2}" class="m3b i"/>${inn != null ? `<circle cx="60" cy="60" r="${R2}" class="m3i" stroke-dasharray="${a(inn, C2)}" transform="rotate(-90 60 60)"/>` : ""}</svg>
      <div class="rv"><b>${out}<small>%</small></b><span>${esc(lab)}</span>${inn != null ? `<em class="m3in">☀ ${inn} % selbst</em>` : ""}</div></div>`;
  }
  /* Preis-Skala: relativ zum Tagesdurchschnitt. Nur mit Preissensor, der Tageswerte kennt (Tibber u. a.) */
  _m3Price() {
    const p = this._pv(), e = p.price_mode === "entity" && p.price_sensor ? this._hass.states[p.price_sensor] : null;
    if (!e) return "";
    const A = e.attributes || {}, cur = this._price(), f = (v) => { const x = parseFloat(v); if (!isFinite(x)) return null; const u = String(A.unit_of_measurement || "").toLowerCase(); return /ct|cent/.test(u) ? x : /€|eur/.test(u) || x < 5 ? x * 100 : x; };
    let lo = f(A.min_price ?? A.min), hi = f(A.max_price ?? A.max), avg = f(A.avg_price ?? A.average ?? A.mean);
    const today = Array.isArray(A.today) ? A.today.map((x) => f(typeof x === "object" ? x.total ?? x.value ?? x.price : x)).filter((x) => x != null) : [];
    if (today.length) { lo = Math.min(...today); hi = Math.max(...today); avg = today.reduce((s, x) => s + x, 0) / today.length; }
    if (lo == null || hi == null || hi - lo < 0.5) return `<span class="chip enpr">${ic("bolt", 16)}Strom jetzt ${num(cur, 1)} ct</span>`;
    avg = avg ?? (lo + hi) / 2;
    const pos = Math.max(0, Math.min(100, (cur - lo) / (hi - lo) * 100)), rel = cur <= avg - (avg - lo) * .35 ? ["günstig", "#34d399"] : cur >= avg + (hi - avg) * .35 ? ["teuer", "#f87171"] : ["mittel", "#fbbf24"];
    return `<span class="chip enpr m3pr" title="Heute ${num(lo, 1)} bis ${num(hi, 1)} ct, Durchschnitt ${num(avg, 1)} ct">${ic("bolt", 16)}Strom jetzt ${num(cur, 1)} ct <b class="m3rel" style="background:${rel[1]}">${rel[0]}</b><span class="m3sc"><i style="left:${pos.toFixed(0)}%"></i></span></span>`;
  }
  _m3Look() {
    const old = !!(this._cfg.layout.m3 || {}).old, fo = (this._cfg.layout.m3 || {}).flow === false;
    return `<div class="vrow"><span>Kacheln wie bisher<small class="mut" style="display:block">An: Kacheln und Ring aus v1.2 statt HD-Symbolen, Verlauf als Fläche und Doppelring</small></span><button class="sw ${old ? "on" : ""}" data-act="m3old" aria-pressed="${old}" aria-label="Kacheln wie bisher"></button></div>
      <div class="vrow"><span>Energiefluss wie bisher<small class="mut" style="display:block">An: Kreise mit Linien-Symbolen und Text-Hinweise statt HD-Plaketten, Auto und Hinweisen mit Knopf</small></span><button class="sw ${fo ? "on" : ""}" data-act="m3flow" aria-pressed="${fo}" aria-label="Energiefluss wie bisher"></button></div>${this._m3ScLook()}${this._m3PigLook()}${this._m3On() ? `<div class="lsec">${ic("sun", 15)}Bewegung</div>${this._animLook()}` : ""}`;
  }
