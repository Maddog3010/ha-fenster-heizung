  /* ================= Modul 19 v1.0 – Stabil =================
     S1 Schnellstart aus den Haus-Werten: Solar, zweite Anlage, Netz und Akku mit den zentral gewählten Sensoren (Einstellungen → Haus).
     S2 Einrichtungs-Prüfung: fehlende oder ausgefallene Sensoren, falsche Einheit, keine Langzeitstatistik, verdächtiges Vorzeichen.
     S3 Kosten im Strom-Reiter: Netzbezug, Einspeisevergütung und Solar-Ersparnis mit den Preisen aus den Haus-Werten.
     S4 Bild teilen (W5): das Fluss-Bild als PNG, z. B. für Facebook, mit Hinweis „gemacht mit Strom & Wärme“.
     S5 Fire-Tablet schonen: im Tablet-Modus Werte nur alle 5 s neu. */
  /* ---------------- S1 Schnellstart ---------------- */
  _efxHausPlan() {
    const E = this._enState(), g = this._enGrid(), p = this._pv(), soc = (this._haus && this._haus.soc) || p.soc_sensor || "", N = [];
    if (E.ent.pv) N.push(["top_1", { name: E.pvn || "Solar Dach", image: "hd:pvRoof", flow: "supply", color: "#facc15", power: E.ent.pv, bottom: E.ent.pv, bottom_label: "Erzeugung", top: E.ent.pve || "", top_label: E.ent.pve ? "heute" : "" }]);
    if (E.ent.pv2) N.push(["top_2", { name: E.pv2n || "Balkon", image: "hd:balcony", flow: "supply", color: "#fbbf24", power: E.ent.pv2, bottom: E.ent.pv2, bottom_label: "Erzeugung", top: E.ent.pve2 || "", top_label: E.ent.pve2 ? "heute" : "" }]);
    if (g.ent) N.push(["left_1", { name: "Netz", image: "hd:grid", flow: "both", color: "#f87171", power: g.ent, invert: g.sign === "import", bottom: g.ent, bottom_label: g.sign === "import" ? "Bezug +" : "Einspeisung +", top: E.ent.imp || "", top_label: E.ent.imp ? "Bezug heute" : "" }]);
    if (E.bmode === "two" ? E.ent.bchg || E.ent.bdis : E.ent.bat) {
      const two = E.bmode === "two";
      N.push(["left_3", { name: "Akku", image: "hd:battery", flow: two ? "split" : "both", color: "#a78bfa", power: two ? "" : E.ent.bat, power_to_node: two ? E.ent.bchg : "", power_to_house: two ? E.ent.bdis : "", invert: !two && E.bsign === "discharge", bottom: two ? "" : E.ent.bat, bottom_label: "Leistung", top: soc, top_label: soc ? "Ladestand" : "", pct: soc ? "top" : "" }]);
    }
    return N;
  }
  _efxHausHtml(adm) {
    const N = this._efxHausPlan(); if (!N.length) return `<div class="mut sm">Unter Einstellungen → Haus → Energiequellen ist noch nichts gewählt. Dort einmal eintragen, dann legt der Schnellstart die Kacheln an.</div>`;
    const c = this._efxCfg(), free = N.filter(([p]) => !c.nodes[p]);
    return `<div class="efhs"><div class="efhsi">${N.map(([p, o]) => `<span class="${c.nodes[p] ? "used" : ""}">${this._gx(o.image.slice(3), 26, { on: true })}${esc(o.name)}</span>`).join("")}</div>
      <button class="btn2 pri" data-act="efxhaus" ${adm && free.length ? "" : "disabled"}>${free.length ? `${free.length} ${free.length === 1 ? "Kachel" : "Kacheln"} aus den Haus-Werten anlegen` : "Schon angelegt"}</button></div>`;
  }
  _efxHausApply() {
    const c = this._efxClone(); let n = 0;
    this._efxHausPlan().forEach(([p, o]) => { if (!c.nodes[p]) { c.nodes[p] = { ...this._efxBlank(p), ...o }; n++; } });
    if (!c.hub.image || c.hub.image === "🏠") c.hub.image = "hd:house";
    this._efxPut(c).then(() => { this._toast(n ? `${n} ${n === 1 ? "Kachel" : "Kacheln"} mit deinen Sensoren angelegt` : "Alle Plätze sind schon belegt"); this._modal = { type: "efxmgr" }; this._renderModal(); this._render(); });
  }
  /* ---------------- S2 Einrichtungs-Prüfung ---------------- */
  _efxCheck() {
    const c = this._efxCfg(), st = this._hass.states, out = [], list = Object.keys(EF_POS).filter((p) => c.nodes[p] && c.nodes[p].on);
    const unitOk = (id) => /^k?W$/i.test(((st[id] || {}).attributes || {}).unit_of_measurement || "");
    const ltsOk = (id) => !!(((st[id] || {}).attributes || {}).state_class);
    list.forEach((p) => {
      const n = c.nodes[p], ids = n.flow === "split" ? [n.power_to_node, n.power_to_house].filter(Boolean) : (n.group || []).length ? n.group : [this._efxPid(n)].filter(Boolean);
      if (!ids.length) { out.push(["bad", n.name, "Kein Leistungssensor – die Linie bleibt aus", p]); return; }
      ids.forEach((id) => {
        const s = st[id];
        if (!s) out.push(["bad", n.name, `${id} gibt es nicht (umbenannt oder gelöscht?)`, p]);
        else if (/^(unavailable|unknown)$/.test(s.state)) out.push(["bad", n.name, `${this._wzName(id)} meldet „nicht verfügbar“`, p]);
        else if (!unitOk(id)) out.push(["warn", n.name, `${this._wzName(id)} hat die Einheit „${s.attributes.unit_of_measurement || "keine"}“ statt W oder kW`, p]);
        else if (!ltsOk(id)) out.push(["warn", n.name, `${this._wzName(id)} hat keine state_class – der Strom-Reiter bleibt dafür leer`, p]);
      });
      /* Vorzeichen: Solar soll nie ins Netz „verbrauchen“, ein Verbraucher nie liefern */
      if (n.flow === "supply" && n.power) { const v = this._efxToW(n.power); if (v < -50) out.push(["warn", n.name, "Solar liefert negative Werte – Vorzeichen des Sensors prüfen", p]); }
      if (n.flow === "consume" && n.power) { const v = this._efxToW(n.power); if (v < -50) out.push(["warn", n.name, "Verbraucher mit negativer Leistung – falscher Sensor oder Vorzeichen?", p]); }
    });
    const calc = this._efxCalc(list.map((p) => c.nodes[p]));
    if (list.length && !calc.src) out.push(["warn", "Haus", "Keine Kachel mit „Liefert“ (z. B. Solar) – der Hausverbrauch kann nicht stimmen", "hub"]);
    if (list.length && calc.src && !calc.bidir) out.push(["info", "Haus", "Netz oder Akku fehlen („Beides“) – der Hausverbrauch ist dann nur der Solar-Anteil", "hub"]);
    const nodes = list.map((p) => c.nodes[p]), sum = nodes.reduce((a, n) => a - (n.flow === "consume" ? 0 : this._efxNodeW(n)), 0);
    if (list.length && calc.bidir && sum < -300) out.push(["warn", "Haus", `Rechnerisch ${Math.round(-sum)} W „negativer“ Hausverbrauch – vermutlich ist ein Vorzeichen (Netz oder Akku) verdreht. Unter „Vorzeichen umkehren“ prüfen.`, "hub"]);
    return out;
  }
  _efxCheckHtml() {
    const L = this._efxCheck();
    if (!L.length) return `<div class="efck ok">${ic("check", 16)}<span>Alles in Ordnung – alle Sensoren liefern Werte in W oder kW und landen in der Langzeitstatistik.</span></div>`;
    const I = { bad: "alert", warn: "alert", info: "info" };
    return `<div class="efckl">${L.map(([k, n, t, p]) => `<button class="efck ${k}" data-act="efxedit" data-k="${p}">${ic(I[k], 16)}<span><b>${esc(n)}</b>${esc(t)}</span>${ic("chev", 14)}</button>`).join("")}</div>`;
  }
  /* ---------------- S3 Kosten im Strom-Reiter ---------------- */
  _efxCost(T) {
    const pr = Number(this._price()) || 0, fd = Number(this._feed()) || 0; if (!pr) return "";
    /* Kosten = Netzbezug minus Einspeisevergütung. Vorteil = was der Verbrauch ganz aus dem Netz gekostet hätte minus den Kosten,
       also eigener Strom (Solar direkt und aus dem Akku) zum Bezugspreis plus die Vergütung. */
    const eur = (v) => (v / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" }), bez = T.net * pr, ver = T.exp * fd, own = Math.max(0, T.use - T.net) * pr, cost = bez - ver, vt = own + ver;
    const p = this._pv(), dyn = p.price_mode === "entity" && p.price_sensor;
    return `<div class="card efcost"><div class="efh2">${ic("chart", 16)}Kosten im Zeitraum<small class="mut">${dyn ? "mit dem aktuellen Preis aus dem Preis-Sensor" : `${num(pr, 1)} ct Bezug · ${num(fd, 1)} ct Einspeisung`} (Einstellungen → Haus → Preise)</small></div>
      <div class="efcr"><span>Netzbezug</span><b class="neg">−${eur(bez)}</b></div><div class="efcr"><span>Einspeisevergütung</span><b class="pos">+${eur(ver)}</b></div>
      <div class="efcr sub"><span>Stromkosten</span><b class="${cost > 0 ? "neg" : "pos"}">${cost > 0 ? "−" : "+"}${eur(Math.abs(cost))}</b></div>
      <div class="efcr sum"><span>Vorteil durch Solar und Akku<small class="mut" style="display:block;font-weight:500">gegenüber allem Strom aus dem Netz</small></span><b class="pos">+${eur(vt)}</b></div></div>`;
  }
  /* ---------------- S4 Bild teilen (W5) ---------------- */
  _efxShare() {
    const r = this.shadowRoot, b = r && r.getElementById("efboard"); if (!b) { this._toast("Zum Teilen bitte die Ansicht „Jetzt“ mit dem Fluss-Bild öffnen"); return; }
    const g = b.getBoundingClientRect(), W = Math.round(g.width), H0 = Math.round(g.height), pad = 24, top = 70, foot = 46, H = H0 + top + foot, dark = !this._efLight();
    const col = dark ? { bg: "#0f1419", card: "#1c2026", tx: "#e6e8eb", mu: "#9aa3ad" } : { bg: "#f3f4f6", card: "#ffffff", tx: "#1f2328", mu: "#6b7280" };
    const mix = this._efMix || { tot: 0 }, hubW = (() => { const c = this._efxCfg(), nodes = Object.keys(EF_POS).filter((p) => c.nodes[p] && c.nodes[p].on).map((p) => c.nodes[p]), k = this._efxCalc(nodes); return c.hub.calc === "rest" ? k.rest : k.total; })();
    const svgLines = (b.querySelector("svg.eflines") || {}).innerHTML || "";
    const tx = (x, y, s, w, c, t, a) => `<text x="${x}" y="${y}" font-size="${s}" font-weight="${w}" fill="${c}" text-anchor="${a || "middle"}" font-family="-apple-system,Segoe UI,Roboto,sans-serif">${esc(t)}</text>`;
    let tiles = "";
    b.querySelectorAll(".efn").forEach((el) => {
      const q = el.getBoundingClientRect(), x = q.left - g.left, y = q.top - g.top, w = q.width, h = q.height, c = el.dataset.c || "#2dd4bf", hub = el.classList.contains("hub");
      const n = hub ? this._efxCfg().hub : this._efxCfg().nodes[el.dataset.p]; if (!n) return;
      const val = hub ? this._efxFmtW(hubW) : this._efxNoData(n) ? "–" : this._efxFmtW(Math.abs(this._efxNodeW(n))), on = el.classList.contains("on");
      const img = String(n.image || "").startsWith("hd:") ? this._gx(n.image.slice(3), Math.round(Math.min(w, h) * .42), hub ? { on: this._efxNight() } : this._efxState(n, this._efxNodeW(n))) : "";
      const s = Math.round(Math.min(w, h) * .42), ix = x + w / 2 - s / 2, iy = y + h * .44 - s / 2;
      tiles += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${hub ? "transparent" : col.card}" ${hub ? "" : `stroke="${c}" stroke-opacity="${on ? .55 : .18}"`}/>${hub ? "" : `<rect x="${x + w * .2}" y="${y}" width="${w * .6}" height="3" rx="1.5" fill="${c}"/>`}`;
      if (hub && n.ring !== false) tiles += `<g transform="translate(${x + w / 2},${y + h * .44})">${this._efxRingSvg(mix, s * .62, 6)}</g>`;
      tiles += img ? img.replace("<svg ", `<svg x="${ix.toFixed(1)}" y="${iy.toFixed(1)}" `) : tx(x + w / 2, y + h * .5, s * .7, 400, col.tx, n.image || "");
      tiles += tx(x + w / 2, y + h * (hub ? .9 : .8), Math.max(11, w * .1), 800, on || hub ? col.tx : col.mu, val) + tx(x + w / 2, y + h * (hub ? 1.03 : .93), Math.max(9, w * .07), 600, hub ? col.mu : c, n.name);
    });
    const leg = mix.tot ? EF_MIX.filter(([k]) => mix[k] > 0).map(([k, l]) => `${Math.round(mix[k] / mix.tot * 100)} % ${l}`).join(" · ") : "";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W + pad * 2}" height="${H}" viewBox="0 0 ${W + pad * 2} ${H}"><rect width="100%" height="100%" fill="${col.bg}"/>
      ${tx(pad, 34, 20, 800, col.tx, `Hausverbrauch jetzt ${this._efxFmtW(hubW)}`, "start")}${tx(pad, 56, 13, 600, col.mu, leg, "start")}${tx(W + pad, 34, 12, 700, "#2dd4bf", new Date().toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }), "end")}
      <g transform="translate(${pad},${top})"><g fill="none" stroke-linecap="round">${svgLines.replace(/<animateMotion[\s\S]*?<\/animateMotion>/g, "").replace(/<set [^>]*\/>/g, "").replace(/<circle r="[^"]*" fill="#fff" opacity="0">/g, '<circle r="0" opacity="0">').replace(/class="efgl"/g, 'opacity=".2"').replace(/class="efln"/g, 'opacity=".95"').replace(/class="eftr"/g, 'stroke-width="1.5" stroke-dasharray="1.5 6" opacity=".38"')}</g>${tiles}</g>
      ${tx((W + pad * 2) / 2, H - 18, 13, 700, col.mu, "♥ gemacht mit Strom & Wärme · Modul 19 Hausfluss · github.com/Maddog3010/ha-fenster-heizung")}</svg>`;
    const img = new Image(), url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    img.onload = () => {
      const k = 2, cv = document.createElement("canvas"); cv.width = (W + pad * 2) * k; cv.height = H * k; const x = cv.getContext("2d"); x.scale(k, k); x.drawImage(img, 0, 0); URL.revokeObjectURL(url);
      cv.toBlob((blob) => {
        if (!blob) { this._toast("Bild konnte nicht erstellt werden"); return; }
        const name = `hausfluss-${new Date().toISOString().slice(0, 10)}.png`, file = typeof File !== "undefined" ? new File([blob], name, { type: "image/png" }) : null;
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: "Mein Hausfluss" }).catch(() => {}); return; }
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); this._toast("Bild gespeichert");
      }, "image/png");
    };
    img.onerror = () => { URL.revokeObjectURL(url); this._toast("Bild konnte nicht erstellt werden"); };
    img.src = url;
  }
