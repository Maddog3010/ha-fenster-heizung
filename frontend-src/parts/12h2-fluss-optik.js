  /* ================= Modul 19 v0.8 – Banner & Themen (Konzept Neue Optik A, F, H) =================
     A  Lichtband-Banner: Quellen fließen links ins Haus, Verbraucher gehen rechts ab, Herkunfts-Balken unter der Zahl.
        Wird nur alle 10 s neu gezeichnet (data-kk mit Zeitfenster), damit nichts flackert und die Bänder ruhig laufen.
     F  Themen fürs Brett (Nachtglas, Blaupause, Sternenhimmel, Haus im Garten), Kachelform Kachel oder Rund, Hell-Variante.
     H1 Handy: A Fluss-Spalte (Standard), B Kachel-Raster, oder das Brett wie bisher.
     H2 Tablet-Modus: Wand-Ansicht mit breiten Kacheln und Seitenspalte (quer) bzw. Feldern darunter (hoch), Ruhebild mit Haus. */
  _efxLook() {
    const c = this._efxCfg();
    return { banner: c.banner === "classic" ? "classic" : "band", theme: EF_THEMES.some((t) => t[0] === c.theme) ? c.theme : "nacht", shape: c.shape === "rund" ? "rund" : "kachel", mobile: ["fluss", "raster", "brett"].includes(c.mobile) ? c.mobile : "fluss" };
  }
  /* Handy-Ansicht: Einstellung für alle, auf dem Gerät mit „Ansicht“ umschaltbar (gemerkt pro Gerät) */
  _efMob() { let v = ""; try { v = localStorage.getItem("fh_ef_mob") || ""; } catch (_) { /* egal */ } return ["fluss", "raster", "brett"].includes(v) ? v : this._efxLook().mobile; }
  _efLight() { return this.style.colorScheme === "light"; }
  /* Alle sichtbaren Kacheln mit den Werten, die die neuen Ansichten brauchen */
  _efxItems(list) {
    const c = this._efxCfg();
    return list.map((p) => {
      const n = c.nodes[p], w = this._efxNodeW(n), nd = this._efxNoData(n), col = n.color || (EF_POS[p] || [])[3] || "#2dd4bf";
      return { p, n, w, nd, col, on: !nd && Math.abs(w) > 5, kind: n.flow === "consume" ? "use" : this._efxKind(n), src: n.flow !== "consume" };
    });
  }
  _efxSub(it) {
    const w = it.w;
    if (!it.src) return it.on ? (it.n.bottom_label || "läuft") : "ruht";
    if (it.kind === "bat") return w > 5 ? "lädt" : w < -5 ? "entlädt" : "ruht";
    if (it.kind === "net") return w > 5 ? "Einspeisung" : w < -5 ? "Bezug" : "ruht";
    return it.on ? (it.n.bottom_label || "Erzeugung") : "ruht";
  }
  _efxVal(id) { if (!id) return ""; const [v, u] = this._efxFmt(id); return v === "–" ? "" : `${v}${u ? " " + u : ""}`; }
  /* Herkunfts-Balken mit Legende (Banner, Tablet) */
  _efxBar(mix) {
    const seg = EF_MIX.map(([k, , col]) => (mix.tot && mix[k] > 0 ? `<i style="width:${(mix[k] / mix.tot * 100).toFixed(2)}%;background:${col}"></i>` : "")).join("");
    const leg = mix.tot ? EF_MIX.filter(([k]) => mix[k] > 0).map(([k, l, col]) => `<span style="color:${col}">${Math.round(mix[k] / mix.tot * 100)} % ${l}</span>`).join(" · ") : `<span>Gerade fließt kein Strom ins Haus</span>`;
    return `<div class="efbar">${seg || "<i style=\"flex:1;background:var(--line)\"></i>"}</div><div class="efleg">${leg}</div>`;
  }
  _efxRingSvg(mix, R, sw) {
    const C = 2 * Math.PI * R; let off = 0;
    return `<circle cx="0" cy="0" r="${R}" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="${sw}"/>` + EF_MIX.map(([k, , col]) => {
      const f = mix.tot > 0 ? mix[k] / mix.tot : 0; if (f <= 0) return "";
      const a = `<circle cx="0" cy="0" r="${R}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${Math.max(0, f * C - (f < .999 ? 3 : 0)).toFixed(1)} ${C.toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}" transform="rotate(-90)"/>`; off += f * C; return a;
    }).join("");
  }
  /* ---------------- A · Lichtband-Banner ---------------- */
  _efxBand(items, o) {
    const mix = this._efMix || { tot: 0 }, night = this._efxNight(), narrow = o.narrow, key = Math.floor(Date.now() / 10000) + "|" + (this._efBandV || 0) + "|" + (narrow ? 1 : 0) + "|" + (this._efLight() ? 1 : 0);
    if (this._efBandC && this._efBandC.k === key) return this._efBandC.h;
    const W = narrow ? 600 : 820, H = 200, hx = W - (narrow ? 120 : 170), hy = 100, an = this._rkCfg().anim;
    const f = (w) => Math.max(0, Math.min(1, (Math.log10(Math.max(10, Math.abs(w))) - 1) / 2.5));
    const inn = items.filter((x) => x.on && x.w < 0), out = items.filter((x) => x.on && x.w > 0);
    const band = (x, d) => { const k = f(x.w), sw = (2 + 6 * k).toFixed(1), dur = (3.2 - 2 * k).toFixed(2);
      return `<path d="${d}" stroke="${x.col}" stroke-width="${(+sw + 8).toFixed(1)}" class="efbg"/><path d="${d}" stroke="${x.col}" stroke-width="${sw}" class="efbm"/>${an !== "aus" ? `<path d="${d}" class="efbd" stroke-width="${Math.max(1.6, sw * .3).toFixed(1)}" style="animation-duration:${dur}s"/>` : ""}`; };
    const ys = (n, i) => (n <= 1 ? 100 : 40 + (120 * i) / (n - 1));
    const lines = inn.map((x, i) => { const y = ys(inn.length, i); return band(x, `M${W * (narrow ? .3 : .08)},${y.toFixed(0)} C${hx - 220},${y.toFixed(0)} ${hx - 120},${hy} ${hx - 40},${hy}`); }).join("")
      + out.map((x, i) => { const y = ys(out.length, i); return band(x, `M${hx + 40},${hy} C${hx + 100},${hy} ${hx + 90},${y.toFixed(0)} ${W + 30},${y.toFixed(0)}`); }).join("");
    const stars = night ? Array.from({ length: 22 }, (_, i) => `<circle class="efstar" style="animation-delay:${(i * .37 % 3).toFixed(2)}s" cx="${(i * 97 + 31) % W}" cy="${(i * 53 + 17) % 190}" r="${i % 4 ? .8 : 1.3}" fill="#fff" opacity="${.25 + (i % 3) * .2}"/>`).join("") : "";
    const house = this._gx("house", 46, { on: night }).replace("<svg ", `<svg x="-23" y="-25" `);
    const h = `<div class="card efband${night ? " nt" : ""}${narrow ? " nar" : ""}" data-an="${an}" data-kk="efband|${key}">
      <svg class="efbs" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMaxYMid meet" aria-hidden="true">${stars}<g fill="none" stroke-linecap="round" mask="url(#efbmask)">${lines}</g>
        <g transform="translate(${hx},${hy})"><circle r="56" fill="url(#efbglow)"/>${this._efxRingSvg(mix, 36, 6)}<circle r="29" fill="rgba(255,255,255,.07)"/>${house}</g>
        <defs><linearGradient id="efbfade" x1="0" x2="1"><stop offset="${narrow ? .38 : .08}" stop-color="#fff" stop-opacity="0"/><stop offset="${narrow ? .62 : .4}" stop-color="#fff"/></linearGradient><mask id="efbmask"><rect x="0" y="0" width="${W}" height="${H}" fill="url(#efbfade)"/></mask><radialGradient id="efbglow"><stop offset="0" stop-color="#2dd4bf" stop-opacity=".35"/><stop offset="1" stop-color="#2dd4bf" stop-opacity="0"/></radialGradient></defs></svg>
      ${this._efxBadge()}<div class="efbt"><div class="lbl">${ic("energy", 15)}${esc(o.lbl)}</div><div class="big">${esc(o.big)}<small>${esc(o.unit || "")}</small></div>${this._efxBar(mix)}
      ${o.chips.length ? `<div class="chips">${o.chips.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>` : ""}</div></div>`;
    this._efBandC = { k: key, h }; return h;
  }
  /* ---------------- H1 · Handy A: Fluss-Spalte ---------------- */
  _efxCol(items, hubW) {
    const mix = this._efMix || { tot: 0 }, src = items.filter((x) => x.src).slice(0, 4), use = items.filter((x) => !x.src);
    const act = use.filter((x) => x.on || x.nd), rest = use.filter((x) => !x.on && !x.nd), all = !!this._efAll;
    const pic = (x, s) => { const zs = x.nd ? { on: false } : this._efxState(x.n, x.w), pr = !x.nd && zs.lvl != null ? `<svg class="efpr" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" pathLength="100"/><circle cx="50" cy="50" r="46" pathLength="100" stroke-dasharray="${zs.lvl.toFixed(1)} 100"/></svg>` : ""; return `<span class="efq${s ? " " + s : ""}">${pr}<span class="efqi">${this._efxImgN(x.n, zs)}</span></span>`; };
    const dot = (x) => { const d = this._efxDot(x.n); return d ? `<i class="efdot ${d[0]}" title="${esc(d[1])}"></i>` : ""; };
    const pe = (x) => (x.n.flow === "split" ? (x.w > 0 ? x.n.power_to_node : x.n.power_to_house) || x.n.power_to_house : this._efxPid(x.n));
    const srcH = src.map((x) => `<button class="efsq${x.on ? " on" : ""}${x.nd ? " nd" : ""}" data-p="${x.p}" data-c="${x.col}" data-w="${Math.round(x.w)}" style="--c:${x.col}" ${pe(x) ? `data-act="efxmore" data-e="${esc(pe(x))}"` : ""}>${pic(x)}${dot(x)}<b>${x.nd ? "–" : this._efxFmtW(Math.abs(x.w))}</b><small>${esc(x.n.name)}${x.src && x.kind !== "pv" ? " " + this._efxSub(x) : ""}</small></button>`).join("");
    const row = (x) => { const sub = ["top", "left", "right"].map((s) => this._efxVal(x.n[s])).filter(Boolean).join(" · ");
      return `<button class="efpill${x.on ? " on" : ""}${x.nd ? " nd" : ""}" style="--c:${x.col}" data-p="${x.p}" ${pe(x) ? `data-act="efxmore" data-e="${esc(pe(x))}"` : ""}>${pic(x, "sm")}<span class="efpt"><small>${esc(x.n.name)}</small><b>${x.nd ? "–" : this._efxFmtW(Math.abs(x.w))}</b><span>${esc(x.nd ? "keine Daten" : sub || this._efxSub(x))}</span></span>${dot(x)}</button>`; };
    const hub = this._efxCfg().hub;
    return `<div class="efcol th-${this._efxLook().theme}" id="efcol">
      ${src.length ? `<div class="efsec">Quellen</div><div class="efsrc" style="grid-template-columns:repeat(${src.length},minmax(0,1fr))">${srcH}</div>` : ""}
      <svg class="efcl" aria-hidden="true">${this._efColSvg || ""}</svg>
      <button class="efhouse" data-act="efxtab" data-v="strom" aria-label="Haus: ${esc(this._efxMixTxt(mix))}" style="--c:${hub.color || "#2dd4bf"}">${this._efxRingHtml(mix, this._efxImgN(hub, { on: this._efxNight() }), this._efxMixTxt(mix))}<b>${this._efxFmtW(hubW)}</b><small>${esc(hub.name || "Haus")}</small></button>
      ${use.length ? `<div class="efsec">Verbraucher</div><div class="efcons">${act.map(row).join("")}${all ? rest.map(row).join("") : ""}</div>
      ${rest.length ? `<button class="efmore" data-act="efxall">${all ? "Ruhende ausblenden" : `+ ${rest.length} weitere (ruhen)`}<span>${all ? "" : "alle zeigen ›"}</span></button>` : ""}` : ""}</div>`;
  }
  _efxColLines() {
    const r = this.shadowRoot, b = r && r.getElementById("efcol"), svg = b && b.querySelector("svg.efcl"), h = b && b.querySelector(".efhouse .efhr"); if (!b || !svg || !h) return;
    const g = b.getBoundingClientRect(), hb = h.getBoundingClientRect(), hx = hb.left - g.left + hb.width / 2, ht = hb.top - g.top + 2;
    let an = this._rkCfg().anim; try { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) an = "aus"; } catch (_) { /* egal */ }
    let out = "";
    b.querySelectorAll(".efsq").forEach((el, i) => {
      const q = el.getBoundingClientRect(), x = q.left - g.left + q.width / 2, y = q.bottom - g.top + 2, w = +el.dataset.w, col = el.dataset.c, on = el.classList.contains("on");
      const d = `M${x.toFixed(1)},${y.toFixed(1)} C${x.toFixed(1)},${(y + (ht - y) * .6).toFixed(1)} ${hx.toFixed(1)},${(ht - (ht - y) * .5).toFixed(1)} ${hx.toFixed(1)},${ht.toFixed(1)}`;
      if (!on) { out += `<path class="eftr" d="${d}" stroke="${col}"/>`; return; }
      const f = Math.max(0, Math.min(1, (Math.log10(Math.max(10, Math.abs(w))) - 1) / 2.5)), sw = (1.8 + 3 * f).toFixed(1), id = "efcp" + i;
      out += `<path class="efgl" d="${d}" stroke="${col}" stroke-width="${(+sw + 4).toFixed(1)}"/><path id="${id}" class="efln" d="${d}" stroke="${col}" stroke-width="${sw}"/>`;
      if (an !== "aus") { const n = Math.round(2 + 4 * f), dur = +(3.5 - 2 * f).toFixed(2), ph = (Date.now() / 1000) % dur, kp = w > 0 ? "1;0" : "0;1";
        out += Array.from({ length: n }, (_, k) => `<circle r="${(1.4 + f).toFixed(1)}" fill="#fff" opacity=".9"><animateMotion dur="${dur}s" begin="${(-ph - k * dur / n).toFixed(2)}s" repeatCount="indefinite" keyPoints="${kp}" keyTimes="0;1" calcMode="linear"><mpath href="#${id}"/></animateMotion></circle>`).join(""); }
    });
    if (svg.innerHTML !== out) svg.innerHTML = out; this._efColSvg = out;
  }
  /* ---------------- H1 · Handy B: Kachel-Raster ---------------- */
  _efxRaster(items, hubW, adm) {
    const mix = this._efMix || { tot: 0 }, hub = this._efxCfg().hub, sorted = [...items.filter((x) => x.on || x.nd), ...items.filter((x) => !x.on && !x.nd)];
    const arrow = (x) => (x.nd ? "! keine Daten" : !x.on ? "– ruht" : x.w < 0 ? "↓ ins Haus" : x.src ? "↑ " + this._efxSub(x) : "↑ " + (x.n.bottom_label || "läuft"));
    const dot = (x) => { const d = this._efxDot(x.n); return d ? `<i class="efdot ${d[0]}" title="${esc(d[1])}"></i>` : ""; };
    const pe = (x) => (x.n.flow === "split" ? x.n.power_to_house || x.n.power_to_node : this._efxPid(x.n));
    const tile = (x) => { const zs = x.nd ? { on: false } : this._efxState(x.n, x.w), pr = !x.nd && zs.lvl != null ? `<svg class="efpr" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" pathLength="100"/><circle cx="50" cy="50" r="46" pathLength="100" stroke-dasharray="${zs.lvl.toFixed(1)} 100"/></svg>` : "";
      return `<button class="efrt${x.on ? " on" : ""}${x.nd ? " nd" : ""}" style="--c:${x.col}" ${pe(x) ? `data-act="efxmore" data-e="${esc(pe(x))}"` : ""}><span class="efra">${esc(arrow(x))}</span>${dot(x)}<span class="efq">${pr}<span class="efqi">${this._efxImgN(x.n, zs)}</span></span><b>${x.nd ? "–" : this._efxFmtW(Math.abs(x.w))}</b><small>${esc(x.n.name)}</small></button>`; };
    const today = hub.top ? this._efxVal(hub.top) : "";
    const card = `<div class="card efhc" style="--c:${hub.color || "#2dd4bf"}" data-act="efxtab" data-v="strom">${this._efxRingHtml(mix, this._efxImgN(hub, { on: this._efxNight() }), this._efxMixTxt(mix))}<div><div class="lbl">Hausverbrauch jetzt</div><div class="big">${Math.round(hubW).toLocaleString("de-DE")}<small>W</small></div><div class="efleg">${mix.tot ? EF_MIX.filter(([k]) => mix[k] > 0).map(([k, l, col]) => `<span style="color:${col}">${Math.round(mix[k] / mix.tot * 100)} % ${l}</span>`).join(" · ") : ""}${today ? ` · heute ${esc(today)}` : ""}</div></div></div>`;
    return { card, grid: `<div class="efras th-${this._efxLook().theme}">${sorted.map(tile).join("")}${adm ? `<button class="efrt add" data-act="efxopen">+ Kachel</button>` : ""}</div>` };
  }
  /* ---------------- H2 · Tablet-Modus: Wand-Ansicht ---------------- */
  _efxFacts(items, hubW) {
    const mix = this._efMix || { tot: 0 }, hub = this._efxCfg().hub, kwh = (id) => { const st = id && this._hass.states[id]; return st && /^kWh$/i.test(st.attributes.unit_of_measurement || "") ? parseFloat(st.state) : NaN; };
    const pvToday = items.filter((x) => x.kind === "pv").map((x) => EF_SIDES.map(([s]) => kwh(x.n[s])).find((v) => !isNaN(v))).filter((v) => v != null && !isNaN(v));
    const pvNow = items.filter((x) => x.kind === "pv" && x.w < 0).reduce((a, x) => a - x.w, 0), bat = items.find((x) => x.kind === "bat"), soc = bat ? this._efxState(bat.n, bat.w).lvl : undefined, use = kwh(hub.top);
    const F = [["Solar jetzt", this._efxFmtW(pvNow), "#fbbf24"], ["Haus jetzt", this._efxFmtW(hubW), "#2dd4bf"], ["Autarkie jetzt", mix.tot ? Math.round(100 - mix.net / mix.tot * 100) + " %" : "–", "#4ade80"]];
    if (pvToday.length) F.push(["Solar heute", pvToday.reduce((a, b) => a + b, 0).toLocaleString("de-DE", { maximumFractionDigits: 1 }) + " kWh", "#fbbf24"]);
    if (!isNaN(use)) F.push(["Verbrauch heute", use.toLocaleString("de-DE", { maximumFractionDigits: 1 }) + " kWh", "#e5e7eb"]);
    if (soc != null) F.push(["Akku", Math.round(soc) + " %", "#a78bfa"]);
    const D = this._efxStatLoad && this._efxStatLoad({ range: "day", off: 0 }), pr = Number(this._price()) || 0;  /* v1.0: Vorteil heute mit den Haus-Preisen */
    if (D && D.any && pr) { const T = D.tot, v = (T.exp * (Number(this._feed()) || 0) + Math.max(0, T.use - T.net) * pr) / 100; F.push(["Vorteil heute", (v >= 0 ? "+" : "−") + Math.abs(v).toLocaleString("de-DE", { style: "currency", currency: "EUR" }), v >= 0 ? "#4ade80" : "#f87171"]); }
    return F;
  }
  _efxWallSide(items, hubW, quer) {
    const F = this._efxFacts(items, hubW);
    if (!quer) return `<div class="efwf">${F.slice(0, 4).map(([l, v, c]) => `<div><small>${esc(l)}</small><b style="color:${c}">${esc(v)}</b></div>`).join("")}</div>`;
    return `<div class="efws"><div class="card"><div class="efsec">Herkunft jetzt</div>${this._efxBar(this._efMix || { tot: 0 })}</div>
      <div class="card"><div class="efsec">Überblick</div>${F.map(([l, v, c]) => `<div class="efwr"><span>${esc(l)}</span><b style="color:${c}">${esc(v)}</b></div>`).join("")}</div></div>`;
  }
  /* Ruhebild im Tablet-Modus: Haus mit Herkunfts-Ring und Hausverbrauch, ohne Bewegung */
  _efxSleep() {
    try {
      if (this._tmV() !== "ef" || !this._efxD || !this._efxSp()) return "";
      const c = this._efxCfg(), list = Object.keys(EF_POS).filter((p) => c.nodes[p] && c.nodes[p].on), nodes = list.map((p) => c.nodes[p]); if (!list.length) return "";
      const calc = this._efxCalc(nodes), w = c.hub.calc === "rest" ? calc.rest : calc.total, mix = this._efxMix(nodes);
      return `<div class="tmef"><svg viewBox="-60 -60 120 120" width="150" height="150" aria-hidden="true">${this._efxRingSvg(mix, 48, 7)}${this._gx("house", 56, { on: true }).replace("<svg ", '<svg x="-28" y="-30" ')}</svg><b>${this._efxFmtW(w)}</b><small>Haus jetzt · ${esc(this._efxMixTxt(mix))}</small></div>`;
    } catch (_) { return ""; }
  }
