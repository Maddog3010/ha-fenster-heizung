  /* ================= Modul 4 v1.5 (Konzept „Neue Optik“, Stufe 4): Szene, Tablet, Bewegung, W2 Standby, W4 Ziel, W7 Jahr =================
     A1 Geräte-Szene im Banner: die drei wichtigsten Geräte hängen an einer Stromleiste (Solar gelb, Netz rot, Batterie violett),
        laufende mit leuchtendem Kabel und Plakette. Ring links = Herkunft, Antippen schaltet „heute“ ↔ gewählter Zeitraum.
     H2 Tablet-Modus: quer eine Geräte-Wand mit sechs großen Kacheln (laufende zuerst), hoch die Liste. Fertig = Kachel leuchtet türkis.
     Bewegung (nur Modul 4): Aus · Dezent · Voll; im Tablet-Modus immer aus (Fire-Tablet schonen).
     W2 Standby je Gerät, W4 Monatsziel „€ mit Sonne“ im Banner, W7 Jahresrückblick zum Teilen. */
  _gsAnim() { return this._tmOn && this._tmOn() ? "off" : (this._gsState().anim || "soft"); }
  _gsDayP() { const s = new Date(); s.setHours(0, 0, 0, 0); return { rg: "day", s, e: new Date(+s + 864e5), n: 1, u: "d", off: 0, cur: true }; }
  _gsMonthP() { const n = new Date(), s = new Date(n.getFullYear(), n.getMonth(), 1), e = new Date(n.getFullYear(), n.getMonth() + 1, 1); return { rg: "month", s, e, n: Math.round((e - s) / 864e5), u: "d", off: 0, cur: true }; }
  /* Die drei wichtigsten: laufende, dann heute fertige, dann die mit den meisten Läufen */
  _gsTop3(devs) {
    const rk = (d) => (d.running ? 0 : this._gsMode(d) === "done" ? 1 : 2);
    return devs.filter((d) => this._gsTyp(d) !== "kuehl").map((d, i) => ({ d, i })).sort((a, b) => rk(a.d) - rk(b.d) || (b.d.runs || 0) - (a.d.runs || 0) || a.i - b.i).slice(0, 3).map((x) => x.d);
  }
  _gsSrcNow(devs) {
    const w = devs.filter((d) => d.running).reduce((a, d) => [a[0] + d.w[0], a[1] + d.w[1], a[2] + d.w[2]], [0, 0, 0]);
    if (w[0] + w[1] + w[2] > 5) { const i = w.indexOf(Math.max(...w)); return ["pv", "bat", "net"][i]; }
    const sun = this._hass.states["sun.sun"]; return sun && sun.state === "above_horizon" ? "pv" : "net";
  }
  _gsScene(devs) {
    const top = this._gsTop3(devs), src = this._gsSrcNow(devs), C = { pv: "#fbbf24", bat: "#a78bfa", net: "#f87171" }[src], an = this._gsAnim(), day = src === "pv" || (this._hass.states["sun.sun"] || {}).state === "above_horizon";
    const W = 640, H = 230, slot = top.length ? Math.min(150, 400 / top.length) : 150, x0 = W - 20 - slot * top.length;
    const plq = (d) => { if (d.running) return [`${wfmt(d.w[0] + d.w[1] + d.w[2])}`, C, "run"]; if (this._gsMode(d) === "done") return [`fertig ${this._gsHm(d.last.ts)}`, "#2dd4bf", "done"]; if (d.best && d.best.ts * 1000 > Date.now()) return [`ab ${this._gsHm(d.best.ts * 1000)} ☀`, "#cbd5e1", ""]; return ["bereit", "#94a3b8", ""]; };
    const devsSvg = top.map((d, i) => {
      const cx = x0 + slot * i + slot / 2, [t, col, k] = plq(d), run = k === "run", img = this._gx(this._gsHd(d), 92, { on: run, lvl: 80 }).replace(/^<svg[^>]*>/, `<svg x="${(cx - 46).toFixed(1)}" y="118" width="92" height="92" viewBox="0 0 64 64">`);
      const tw = Math.max(70, t.length * 8.6 + 26);
      return `<line x1="${cx}" y1="36" x2="${cx}" y2="${run ? 128 : 124}" stroke="${run ? C : "#64748b"}" stroke-width="${run ? 5 : 1.5}" ${run ? `stroke-dasharray="3 7" stroke-linecap="round" class="gscab"` : 'opacity=".5"'}/>
        ${run ? `<line x1="${cx}" y1="36" x2="${cx}" y2="128" stroke="${C}" stroke-width="14" opacity=".14" class="gsglow"/>` : ""}
        <rect x="${(cx - tw / 2).toFixed(1)}" y="62" width="${tw.toFixed(1)}" height="30" rx="15" fill="#0b1220" fill-opacity=".85" stroke="${col}" stroke-opacity="${run || k === "done" ? 0.9 : 0.35}" ${run ? 'class="gsplq"' : ""}/>
        <text x="${cx}" y="82" text-anchor="middle" font-size="14.5" font-weight="800" fill="${col}">${esc(t)}</text>${img}`;
    }).join("");
    const bars = Array.from({ length: 9 }, (_, i) => `<line x1="${60 + i * 70}" y1="0" x2="${60 + i * 70}" y2="${H}" stroke="#94a3b8" stroke-opacity=".05"/>`).join("");
    const dots = Array.from({ length: 9 }, (_, i) => `<circle cx="${92 + i * 13}" cy="36" r="3.4" fill="${C}" opacity="${0.35 + i * 0.07}"/>`).join("");
    return `<svg class="gsscene gsa-${an}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMaxYMid meet" aria-hidden="true">
      <defs><radialGradient id="gssg" cx=".65" cy=".55" r=".7"><stop offset="0" stop-color="${C}" stop-opacity=".16"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#gssg)"/>${bars}
      <rect x="40" y="16" width="46" height="40" rx="6" fill="${day ? "#1e3a5f" : "#0b1220"}" stroke="#94a3b8" stroke-opacity=".3"/>${day ? `<circle cx="63" cy="36" r="9" fill="#fde047"/>` : `<path d="M66 28a9 9 0 1 0 6 13a7 7 0 1 1-6-13z" fill="#e2e8f0"/>`}
      ${dots}<rect x="${Math.min(x0 - 10, 216)}" y="29" width="${W - Math.min(x0 - 10, 216) - 16}" height="14" rx="7" fill="#05080d" stroke="${C}" stroke-opacity=".35"/>
      <line x1="${Math.min(x0 - 4, 222)}" y1="36" x2="${W - 24}" y2="36" stroke="${C}" stroke-width="2" opacity=".55"/>
      ${devsSvg}<rect x="0" y="${H - 14}" width="${W}" height="14" fill="#000" opacity=".18"/></svg>`;
  }
  _gsHeroScene(devs, P, chips) {
    const ids = devs.map((d) => d.id), useP = this._gsRingP === "period" && P.rg !== "day", PP = useP ? P : this._gsDayP(), T = this._gsAgg(ids, PP).t, per = useP ? this._gsLabel(P) : "Heute";
    const mix = T.v[0] + T.v[1] + T.v[2] > 0 ? { pv: T.v[0], bat: T.v[1], net: T.v[2] } : {}, G = this._gsState();
    let goal = "";
    if (G.goal > 0) { const M = this._gsAgg(ids, this._gsMonthP()).t, f = Math.min(1, M.sv / G.goal); goal = `<div class="gsgoal"><span>${ic("sun", 13)} Monatsziel ${num(G.goal, 0)} € mit Sonne: <b>${num(M.sv, 2)} €</b> · ${num(f * 100, 0)} %</span><i><b style="width:${(f * 100).toFixed(1)}%"></b></i></div>`; }
    return `<div class="card hero mh a-gs gshero gssh gsa-${this._gsAnim()}"><div class="gssl"><button class="gsrg" data-act="gsringt" title="Antippen: heute ↔ Zeitraum">${this._gxRing("pvRoof", mix, 96, { on: true })}</button>
      <div class="gsst2"><small>${esc(per)} gespart</small><div class="gsbig">${num(T.sv, 2)}<small> €</small></div><small class="own">${T.own != null ? `${num(T.own, 0)} % eigener Strom` : ""}</small></div>
      <div class="gssum">${num(T.n)} ${T.n === 1 ? "Durchlauf" : "Durchläufe"} · ${num(T.kwh, 1)} kWh · Kosten ${num(T.c, 2)} €</div>${chips ? `<div class="chips">${chips}</div>` : ""}${goal}</div>
      <div class="gssr">${this._gsScene(devs)}</div></div>`;
  }
  /* ---- H2 Tablet: Geräte-Wand quer, Liste hoch ---- */
  _gsWall(devs, P) {
    const port = window.innerHeight > window.innerWidth, T = this._gsAgg(devs.map((d) => d.id), this._gsDayP()).t;
    const rk = (d) => (d.running ? 0 : this._gsMode(d) === "done" ? 1 : 2), sorted = devs.map((d, i) => ({ d, i })).sort((a, b) => rk(a.d) - rk(b.d) || a.i - b.i).map((x) => x.d);
    const st = (d) => { const R = this._gsRestInfo(d); return d.running ? `<small class="run">läuft · ${R && !R.learn ? `noch ${Math.max(1, Math.round(R.rest / 60))} Min.` : wfmt(d.w[0] + d.w[1] + d.w[2])}</small>` : this._gsMode(d) === "done" ? `<small class="done">fertig ${this._gsHm(d.last.ts)}</small>` : this._gsTyp(d) === "kuehl" ? `<small class="ok">läuft dauernd</small>` : `<small>${d.cover >= 70 ? `${num(d.cover, 0)} % Solar` : "aus"}</small>`; };
    const fresh = (d) => this._gsMode(d) === "done" && Date.now() - new Date(d.last.ts).getTime() < 15 * 60000;
    const head = `<div class="gswh2"><span>Heute gespart <b>${num(T.sv, 2)} €</b></span><small>${T.own != null ? `${num(T.own, 0)} % eigener Strom` : ""}</small></div>`;
    if (port) return `${head}<div class="gslist big">${sorted.map((d) => { const a = this._gsAgg([d.id], this._gsDayP()).t; return `<button class="gsrow2" data-act="gsdet" data-k="${esc(d.id)}"><span class="gsrimg">${this._gxRing(this._gsHd(d), d.running ? { pv: d.w[0], bat: d.w[1], net: d.w[2] } : { pv: a.v[0], bat: a.v[1], net: a.v[2] }, 52, { on: d.running })}</span><span class="gsrt"><b>${esc(d.name)}</b>${st(d)}</span><b class="gsrc">${d.running ? wfmt(d.w[0] + d.w[1] + d.w[2]) : num(a.c, 2) + " €"}</b></button>`; }).join("")}</div>`;
    const pg = Math.max(0, Math.min(this._gsWallP || 0, Math.ceil(sorted.length / 6) - 1)), six = sorted.slice(pg * 6, pg * 6 + 6);
    const tile = (d) => {
      const a = this._gsAgg([d.id], this._gsDayP()).t, base = d.running ? d.w : a.v, tot = base[0] + base[1] + base[2], R = this._gsRestInfo(d);
      return `<button class="card gswt2 ${d.running ? "run" : ""} ${fresh(d) ? "fresh" : ""}" data-act="gsdet" data-k="${esc(d.id)}"><span class="gswth">${this._gxRing(this._gsHd(d), tot > 0 ? { pv: base[0], bat: base[1], net: base[2] } : {}, 64, { on: d.running })}<span class="gsrt"><b>${esc(d.name)}</b>${st(d)}</span></span>
        <span class="gswtv"><b>${d.running ? wfmt(tot) : num(a.c, 2) + " €"}</b><span class="gsrbar">${tot > 0 ? base.map((x, i) => (x > 0 ? `<i style="flex:${x};background:${GS_COL[i]}"></i>` : "")).join("") : ""}</span></span>
        ${d.running && R && !R.learn ? `<span class="g2prog"><i style="width:${Math.round(R.p * 100)}%"></i></span>` : `<span class="g2prog empty"></span>`}</button>`;
    };
    const pages = Math.ceil(sorted.length / 6);
    return `${head}<div class="gswall">${six.map(tile).join("")}</div>${pages > 1 ? `<div class="gswpg"><button class="ibtn" data-act="gswp" data-k="-1" ${pg === 0 ? "disabled" : ""} aria-label="Vorige Geräte">${ic("back", 18)}</button><span>${pg + 1} / ${pages}</span><button class="ibtn nx" data-act="gswp" data-k="1" ${pg >= pages - 1 ? "disabled" : ""} aria-label="Nächste Geräte">${ic("back", 18)}</button></div>` : ""}`;
  }
  /* ---- W7 Jahresrückblick ---- */
  _gsYearRows(devs) { return devs.filter((d) => d.yr && d.yr[0] > 0 && this._gsTyp(d) !== "kuehl").map((d) => ({ d, n: d.yr[0], sun: d.yr[1], kwh: d.yr[2], sv: d.yr[3] })).sort((a, b) => b.n - a.n); }
  _gsVerb(d) { return { wasch: "gewaschen", spuel: "gespült", trockner: "getrocknet" }[this._gsTyp(d)] || "gelaufen"; }
  _gsYearCard(devs) {
    const R = this._gsYearRows(devs), y = new Date().getFullYear(); if (!R.length) return "";
    const sv = R.reduce((a, r) => a + r.sv, 0), n = R.reduce((a, r) => a + r.n, 0), sun = R.reduce((a, r) => a + r.sun, 0);
    return `<div class="card gsyr"><h2>${ic("today", 18)}Dein Jahr ${y}<button class="lgopen" data-act="gsyshare" style="margin-left:auto">Als Bild teilen</button></h2>
      <div class="gsyrs">${R.slice(0, 4).map((r) => `<div>${this._gx(this._gsHd(r.d), 34, { on: true, lvl: 80 })}<span><b>Mit Sonne ${this._gsVerb(r.d)}: ${num(r.sun)} von ${num(r.n)}</b><small>${esc(r.d.name)} · ${num(r.sv, 2)} € gespart</small></span></div>`).join("")}</div>
      <div class="lgnote2">${num(sun)} von ${num(n)} Läufen mit Sonne (über 70 % eigener Strom) · ${num(sv, 2)} € gespart. Gezählt wird seit Modul 4 v1.3.</div></div>`;
  }
  _gsYearSvg(devs) {
    const R = this._gsYearRows(devs).slice(0, 4), y = new Date().getFullYear(), W = 1080, H = 1350, f = "Roboto,system-ui,sans-serif";
    const sv = R.reduce((a, r) => a + r.sv, 0), n = R.reduce((a, r) => a + r.n, 0), sun = R.reduce((a, r) => a + r.sun, 0);
    const row = (r, i) => { const yy = 560 + i * 170, im = this._gx(this._gsHd(r.d), 120, { on: true, lvl: 85 }).replace(/^<svg[^>]*>/, `<svg x="90" y="${yy}" width="120" height="120" viewBox="0 0 64 64">`);
      return `<rect x="70" y="${yy - 15}" width="940" height="150" rx="28" fill="#fff" fill-opacity=".06"/>${im}<text x="240" y="${yy + 52}" font-family="${f}" font-size="42" font-weight="800" fill="#fbbf24">Mit Sonne ${this._gsVerb(r.d)}: ${r.sun} von ${r.n}</text><text x="240" y="${yy + 100}" font-family="${f}" font-size="30" fill="#9aa7b4">${esc(r.d.name)} · ${num(r.sv, 2)} € gespart</text>`; };
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" style="max-width:380px;display:block;margin:0 auto;border-radius:12px"><rect width="${W}" height="${H}" fill="#0f1419"/>
      <text x="70" y="120" font-family="${f}" font-size="30" letter-spacing="7" font-weight="700" fill="#5eead4">STROM &amp; WÄRME · GERÄTESTROM</text>
      <text x="66" y="250" font-family="${f}" font-size="120" font-weight="900" fill="#e6edf3">${y}</text>
      <text x="70" y="350" font-family="${f}" font-size="46" font-weight="800" fill="#e6edf3">${sun} von ${n} Läufen mit Sonne</text>
      <text x="70" y="420" font-family="${f}" font-size="40" fill="#34d399">${num(sv, 2)} € gespart</text>${R.map(row).join("")}
      <text x="${W / 2}" y="${H - 60}" text-anchor="middle" font-family="${f}" font-size="26" fill="#9aa7b4">aus den eigenen Daten · github.com/Maddog3010</text></svg>`;
  }
  _gsYearShare() {
    const devs = ((this._gsD || {}).devices) || [], svg = this._gsYearSvg(devs).replace('width="100%" style="max-width:380px;display:block;margin:0 auto;border-radius:12px"', 'width="1080" height="1350"'), img = new Image();
    img.onload = () => { try { const c = document.createElement("canvas"); c.width = 1080; c.height = 1350; c.getContext("2d").drawImage(img, 0, 0, 1080, 1350); c.toBlob((bl) => { if (!bl) return; const name = `Geraetestrom_${new Date().getFullYear()}.png`, f = new File([bl], name, { type: "image/png" }); if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], title: "Mein Jahr mit der Sonne" }).catch(() => {}); else if (this._s3Save) this._s3Save(bl, name); }, "image/png"); } catch (_) { this._toast("Bild nicht möglich"); } };
    img.onerror = () => this._toast("Bild nicht möglich"); img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }
  /* W2 Standby-Zeile für die Geräte-Seite */
  _gsStandby(d) {
    if (d.sbw == null || d.sbw < 0.5 || this._gsTyp(d) === "kuehl") return "";
    const eur = d.sbw * 8.76 * ((this._price ? this._price() : 30) / 100);
    return `<div class="gssby">${ic("plug", 14)}<span>Standby <b>${num(d.sbw, d.sbw < 10 ? 1 : 0)} W</b> · ${num(eur, 2)} € im Jahr</span>${eur >= 5 ? `<em>Steckdosenleiste mit Schalter spart das</em>` : ""}</div>`;
  }
  _gsSzAct(a, b) {
    const k = b.dataset.k, G = this._gsState();
    if (a === "gsringt") { this._gsRingP = this._gsRingP === "period" ? "today" : "period"; this._render(); return true; }
    if (a === "gswp") { this._gsWallP = Math.max(0, (this._gsWallP || 0) + Number(k)); this._render(); return true; }
    if (a === "gsyshare") { this._gsYearShare(); return true; }
    if (a === "gsscene") { G.scene = G.scene === false; this._mdSave(); this._renderModal(); this._render(); return true; }
    if (a === "gsanim") { G.anim = k; this._mdSave(); this._renderModal(); this._render(); return true; }
    if (a === "gsgoal") { G.goal = Math.max(0, Math.min(500, (+G.goal || 0) + Number(k))); this._mdSave(); this._renderModal(); this._render(); return true; }
    return false;
  }
