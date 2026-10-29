  /* ================= Modul 19 Hausfluss (Beta, nur für Sponsoren) =================
     Ein Haus in der Mitte, bis zu 9 Kacheln drumherum, je Kachel ein Bild und vier Werte. Die Linien zeigen, wohin die
     Energie gerade fließt. Gespeichert wird zentral im Backend (energiefluss.py), die Werte kommen live aus den Entitäten. */
  _efxLoad(force) {
    if (!this._hass || this._efxBusy || (this._efxD && !force)) return;
    this._efxBusy = true;
    this._hass.callWS({ type: "fenster_heizung/ef_get" }).then((r) => { this._efxD = r; }).catch(() => { this._efxD = { locked: true, cfg: null, err: true }; })
      .finally(() => { this._efxBusy = false; if (this._mdActive() === "ef") this._render(); });
  }
  _efxPut(cfg) {
    return this._hass.callWS({ type: "fenster_heizung/ef_set", cfg }).then((r) => { this._efxD = r; }).catch(() => this._toast("Das hat nicht geklappt"));
  }
  _efTab() { if (!this._efT) { try { this._efT = localStorage.getItem("fh_ef_tab") === "strom" ? "strom" : "now"; } catch (e) { this._efT = "now"; } } return this._efT; }
  _efSize() { if (!this._efS) { try { this._efS = localStorage.getItem("fh_ef_size") || "auto"; } catch (e) { this._efS = "auto"; } } return this._efS; }
  _efxSp() { return !!this._spnS().active; }
  _efxCfg() { return (this._efxD && this._efxD.cfg) || { hero: { show: true }, hub: { on: true, name: "Haus", image: "🏠", color: "", top: "", bottom: "", left: "", right: "", top_label: "", bottom_label: "", left_label: "", right_label: "", calc: "total", chips: [] }, nodes: {} }; }
  _efxClone() { return JSON.parse(JSON.stringify(this._efxCfg())); }
  _efxBlank(pos) {
    const p = EF_POS[pos];
    return { on: true, name: p[4], image: p[2] === "supply" ? "svg:sonne" : "⚡", color: "", top: "", bottom: "", left: "", right: "", top_label: "", bottom_label: "", left_label: "", right_label: "", flow: p[2], power: "", power_to_node: "", power_to_house: "", invert: false };
  }
  /* ---- Rechnen: Leistung einer Kachel in W, positiv = zur Kachel, negativ = ins Haus ---- */
  _efxToW(id) { const st = id && this._hass.states[id]; if (!st) return NaN; const v = parseFloat(st.state); return isNaN(v) ? NaN : /^kW$/i.test(st.attributes.unit_of_measurement || "") ? v * 1000 : v; }
  _efxPid(n) { const b = n.bottom && this._hass.states[n.bottom]; return n.power || (b && /^k?W$/i.test(b.attributes.unit_of_measurement || "") ? n.bottom : ""); }
  _efxNodeW(n) {
    if (n.flow === "split") { const a = this._efxToW(n.power_to_node), b = this._efxToW(n.power_to_house); return (isNaN(a) ? 0 : Math.abs(a)) - (isNaN(b) ? 0 : Math.abs(b)); }
    const v = this._efxToW(this._efxPid(n)); if (isNaN(v)) return 0;
    return n.flow === "supply" ? -Math.abs(v) : n.flow === "consume" ? Math.abs(v) : n.invert ? -v : v;
  }
  /* Hausverbrauch: Zufluss (Solar, Netzbezug, Akku entladen) minus Abfluss (Einspeisung, Akku laden). Verbraucher-Kacheln gehören zum Haus,
     nur „Restverbrauch“ zieht sie zusätzlich ab. */
  _efxCalc(nodes) {
    let total = 0, cons = 0, bidir = false, src = false;
    nodes.forEach((n) => {
      const w = this._efxNodeW(n);
      if (n.flow === "consume") { cons += Math.abs(w); return; }
      if (n.flow === "both" || n.flow === "split") bidir = true; else src = true;
      total += -w;
    });
    return { total: Math.max(0, total), rest: Math.max(0, total - cons), bidir, src };
  }
  _efxFmtW(w) { return w >= 1000 ? (w / 1000).toLocaleString("de-DE", { maximumFractionDigits: 2 }) + " kW" : Math.round(w).toLocaleString("de-DE") + " W"; }
  _efxFmt(id) {
    const st = this._hass.states[id]; if (!st) return ["–", "", ""];
    const v = parseFloat(st.state), u = st.attributes.unit_of_measurement || "";
    return [isNaN(v) ? st.state : v.toLocaleString("de-DE", { maximumFractionDigits: Math.abs(v) >= 100 ? 0 : 2 }), u, String(st.attributes.friendly_name || id).split(" ").pop()];
  }
  _efxImg(v) {
    v = String(v || "");
    if (v.startsWith("svg:")) { const i = EF_IMGS.find((x) => x.id === v.slice(4)); return i ? `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${i.s}</svg>` : ""; }
    if (/^(\/local\/|https:)/.test(v)) return `<img src="${esc(v)}" alt="" loading="lazy">`;
    if (v.startsWith("mdi:")) return `<ha-icon icon="${esc(v)}"></ha-icon>`;
    return esc(v);
  }
  _efxSide(n, side, hub, hubW) {
    const id = n[side], lab = String(n[side + "_label"] || "").trim(), lr = side === "left" || side === "right";
    let html = "", calc = false;
    if (id) { const [v, u, l] = this._efxFmt(id); html = lr ? `${v}<i>${esc(lab || u)}</i>` : `${v} ${esc(u)}<i>${esc(lab || l)}</i>`; }
    else if (hub && side === "bottom") { calc = true; html = `${this._efxFmtW(hubW)}<i>${esc(lab || (n.calc === "rest" ? "Restverbrauch" : "Hausverbrauch"))}</i>`; }
    return { id, html, calc };
  }
  _efxNodeHtml(pos, n, hubW) {
    const hub = pos === "hub", col = n.color || (EF_POS[pos] || [])[3] || "#2dd4bf", w = hub ? 0 : this._efxNodeW(n), on = hub || Math.abs(w) > 5;
    const sides = EF_SIDES.map(([s]) => { const o = this._efxSide(n, s, hub, hubW), tag = o.id ? "button" : "span"; return `<${tag} class="efs ${s[0]}" ${o.id ? `data-act="efxmore" data-e="${esc(o.id)}" title="${esc((this._hass.states[o.id] || { attributes: {} }).attributes.friendly_name || o.id)}"` : ""}>${o.html}</${tag}>`; }).join("");
    return `<div class="efn${hub ? " hub" : ""}${on ? " on" : ""}" ${hub ? 'data-act="efxtab" data-v="strom" title="Strom öffnen"' : ""} data-p="${pos}" data-w="${Math.round(w)}" data-c="${col}" style="--c:${col}" role="group" aria-label="${esc(n.name)}">${sides}<div class="efi">${this._efxImg(n.image)}</div><span class="efnm">${esc(n.name)}</span></div>`;
  }
  _efPage() {
    if (!this._efxD) { this._efxLoad(); return `<div class="card empty">Hausfluss wird geladen …</div>`; }
    if (!this._efxSp()) return `<div class="card empty">${ic("heart", 34)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Nur für Sponsoren</div>Der Hausfluss ist ein Beta-Modul und gehört zu den Extras für Sponsoren.<br><button class="btn2 pri" style="margin-top:12px" data-act="spnopen">Sponsor-Bereich öffnen</button></div>`;
    const c = this._efxCfg(), adm = this._admin(), list = EF_POS ? Object.keys(EF_POS).filter((p) => c.nodes[p] && c.nodes[p].on) : [], nodes = list.map((p) => c.nodes[p]);
    if (!list.length) return `<div class="card empty">${ic("energy", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Noch keine Kacheln</div>Lege Solar, Netz, Akku und Verbraucher als Kacheln um dein Haus an.${adm ? `<br><button class="btn2 pri" style="margin-top:12px" data-act="efxstart">Mit Beispiel-Kacheln starten</button> <button class="btn2" style="margin-top:12px" data-act="efxopen">Selbst einrichten</button>` : ""}</div>`;
    const narrow = (this.clientWidth || 1000) < 640, hub = c.hub, calc = this._efxCalc(nodes), hubW = hub.calc === "rest" ? calc.rest : calc.total;
    /* Das Haus sitzt immer genau in der Mitte: Zeilen oben und unten werden paarweise gehalten oder weggelassen, leere Gegenstücke bekommen einen unsichtbaren Platzhalter */
    const has = (r) => list.some((p) => EF_POS[p][1] === r), keep = [1, 2, 3, 4, 5].filter((r) => r === 3 || (r === 1 || r === 5 ? has(1) || has(5) : has(2) || has(4)));
    const ri = (r) => keep.indexOf(r) + 1, COL = { top_1: 1, top_2: 3, left_1: 1, left_2: 1, left_3: 1, right_1: 3, right_2: 3, right_3: 3 };
    const cellAt = (p, html, z) => { const e = EF_POS[p], b = p === "bottom", ct = !narrow && /^top_/.test(p) && list.filter((x) => /^top_/.test(x)).length === 1, col = narrow ? (b ? "1/-1" : COL[p]) : (b || ct ? "2/4" : e[0]); return `<div class="efc${b ? " bt" : ""}${ct ? " ct" : ""}${z && !narrow ? " z" : ""}" style="grid-column:${col};grid-row:${ri(e[1])}">${html}</div>`; };
    const ghost = '<div class="efg" aria-hidden="true"></div>', ghosts = [[1, "top_1"], [5, "bottom"], [2, "left_1"], [4, "left_3"]].filter(([r]) => keep.includes(r) && !has(r)).map(([r, p]) => cellAt(p, ghost, r === 2 || r === 4)).join("");
    const gUp = keep.includes(4) && !has(4), gDn = keep.includes(2) && !has(2), rows = keep.length - (gUp || gDn ? 1 : 0);
    const cells = list.map((p) => cellAt(p, this._efxNodeHtml(p, c.nodes[p], hubW))).join("") + ghosts;
    let hero = "";
    if (c.hero.show) {
      const pe = hub.bottom, w = pe ? this._efxToW(pe) : hubW, chips = [];
      if (calc.src) chips.push(`Solar ${Math.round(nodes.filter((n) => n.flow === "supply").reduce((a, n) => a - this._efxNodeW(n), 0)).toLocaleString("de-DE")} W`);
      if (hub.top && this._hass.states[hub.top]) { const [v, u] = this._efxFmt(hub.top); chips.push(`Hausverbrauch heute ${v} ${u}`); }
      (hub.chips || []).forEach((id) => { if (this._hass.states[id]) { const [v, u] = this._efxFmt(id); chips.push(`${this._wzName(id)} ${v} ${u}`); } });
      hero = this._modHero("ef", { icon: "energy", lbl: !isNaN(w) && w < 0 ? "Einspeisung jetzt" : !pe && hub.calc === "rest" ? "Restverbrauch jetzt" : "Hausverbrauch jetzt", big: isNaN(w) ? "–" : Math.abs(Math.round(w)).toLocaleString("de-DE"), unit: "W", chips });
    }
    const hubCell = `<div class="efc hb${narrow ? "" : gUp ? " hu" : gDn ? " hd" : ""}" style="grid-column:${narrow ? 2 : "2/4"};grid-row:${ri(3)}">${this._efxNodeHtml("hub", hub, hubW)}</div>`;
    const tab = this._efTab(), sz = this._efSize(), SZ = { auto: "Auto", klein: "Klein", mittel: "Mittel", gross: "Groß" };
    const seg = `<div class="efseg" role="tablist"><button class="${tab === "now" ? "on" : ""}" role="tab" aria-selected="${tab === "now"}" data-act="efxtab" data-v="now">Jetzt</button><button class="${tab === "strom" ? "on" : ""}" role="tab" aria-selected="${tab === "strom"}" data-act="efxtab" data-v="strom">Strom</button>${tab === "now" && !narrow ? `<button class="efszb" data-act="efxsize" aria-label="Größe der Kacheln">Größe: ${SZ[sz] || "Auto"}</button>` : ""}</div>`;
    if (tab === "strom") return `<div class="efx${narrow ? " nar" : ""}">${hero}${seg}<div class="card empty">${ic("energy", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Strom-Seiten in Arbeit</div>Energieverteilung, Verbrauch, Quellen und Messgeräte kommen in den nächsten Builds. Mit „Jetzt“ geht es zurück zum Fluss-Bild.</div></div>`;
    setTimeout(() => this._efxLines(), 0);
    return `<div class="efx${narrow ? " nar" : ""}">${hero}${seg}<div class="efboard" id="efboard" data-rows="${rows}"${!narrow && this._efW ? ` style="--eft:${this._efW}px"` : ""}><svg class="eflines" aria-hidden="true">${this._efSvg || ""}</svg><div class="efgrid">${cells}${hubCell}</div></div>
      <div class="mut sm" style="margin:2px 4px">Beta für Sponsoren · Werte live aus deinen Entitäten · Tippe auf einen Wert für den Verlauf</div></div>`;
  }
  /* Kachelgröße: auf Tablet und Desktop nach der Höhe, die unter dem Banner übrig bleibt (Einstellung „Größe“ überschreibt das) */
  _efxFit(b, narrow) {
    if (narrow) { b.style.removeProperty("--eft"); return; }
    const sz = this._efSize(), vh = window.innerHeight || 800, key = (this.clientWidth || 0) + "x" + vh;
    if (this._efK !== key) { this._efK = key; this._efTop = b.getBoundingClientRect().top; }
    const rows = Math.max(3, +b.dataset.rows || 4), avail = vh - (this._efTop || 330) - 70, th = (avail - (rows - 1) * 6) / rows;
    const w = sz === "klein" ? 100 : sz === "mittel" ? 128 : sz === "gross" ? 160 : Math.max(96, Math.min(150, th * 1.15));
    this._efW = Math.round(w); b.style.setProperty("--eft", this._efW + "px");
  }
  _efxLines() {
    const r = this.shadowRoot, b = r && r.getElementById("efboard"), hub = b && b.querySelector(".efn.hub"), svg = b && b.querySelector("svg.eflines"); if (!b || !hub || !svg) return;
    const narrow = b.closest(".efx").classList.contains("nar"); this._efxFit(b, narrow);
    const g = b.getBoundingClientRect(), hb = hub.getBoundingClientRect(), hx = hb.left - g.left + hb.width / 2, hy = hb.top - g.top + hb.height / 2;
    let off = "", act = "";
    const els = [...b.querySelectorAll(".efn:not(.hub):not(.ghost)")];
    els.forEach((el) => {
      const p = EF_POS[el.dataset.p], q = el.getBoundingClientRect(), nx = q.left - g.left + q.width / 2, ny = q.top - g.top + q.height / 2, on = el.classList.contains("on"), col = el.dataset.c, w = +el.dataset.w;
      const vert = p[1] === 1 || p[1] === 5, mx = (hx + nx) / 2, my = (hy + ny) / 2;
      let d = vert ? `M${hx},${hy} C${hx},${my} ${nx},${my} ${nx},${ny}` : `M${hx},${hy} C${mx},${hy} ${mx},${ny} ${nx},${ny}`;
      if (!narrow) {  /* Linien beginnen am Rand des Hauses und enden an der Kachelkante: gerade nach oben oder unten, zur Seite als lange S-Kurve */
        const hl = hb.left - g.left, hr = hb.right - g.left, ht = hb.top - g.top, hbt = hb.bottom - g.top, ql = q.left - g.left, qr = q.right - g.left, qt = q.top - g.top, qb = q.bottom - g.top;
        if (vert) { const up = ny < hy, y0 = up ? ht : hbt, y1 = up ? qb : qt, k = Math.abs(y1 - y0) * 0.5; d = Math.abs(nx - hx) < 20 ? `M${hx},${y0} L${nx},${y1}` : `M${hx},${y0} C${hx},${y0 + (up ? -k : k)} ${nx},${y1 + (up ? k : -k)} ${nx},${y1}`; }
        else if (nx < hx) { const k = (hl - qr) * 0.55; d = `M${hl},${hy} C${hl - k},${hy} ${qr + k},${ny} ${qr},${ny}`; }
        else { const k = (ql - hr) * 0.55; d = `M${hr},${hy} C${hr + k},${hy} ${ql - k},${ny} ${ql},${ny}`; }
      }
      if (narrow && vert && Math.abs(nx - hx) > 20) { const lf = nx < hx, ex = (lf ? q.right : q.left) - g.left; d = `M${hx},${hy} C${hx},${ny + (hy - ny) * 0.35} ${hx + (lf ? -1 : 1) * Math.abs(ex - hx) * 0.45},${ny} ${ex},${ny}`; }  /* Handy: Kurve läuft in der Mitte hoch und biegt seitlich in die Kachel ein */
      const st = `fill="none" stroke="${col}" stroke-opacity="${on ? 0.9 : 0.25}" stroke-width="${on ? 3 : 2}" stroke-linecap="round" stroke-linejoin="round"`;
      const path = `<path id="efp_${el.dataset.p}" d="${d}" ${st}/>`;
      if (on) act += path + `<circle r="4.5" fill="${col}"><animateMotion dur="2.4s" repeatCount="indefinite" keyPoints="${w > 0 ? "0;1" : "1;0"}" keyTimes="0;1" calcMode="linear"><mpath href="#efp_${el.dataset.p}"/></animateMotion></circle>`;
      else off += path;
    });
    const out = off + act; if (svg.innerHTML !== out) svg.innerHTML = out; this._efSvg = out;
  }
  /* ---------------- Einrichtung ---------------- */
  _efxIds() { return Object.keys(this._hass.states).filter((e) => /^(sensor|number|input_number|counter)\./.test(e)); }
  _efxModal() {
    const m = this._modal, adm = this._admin(), c = this._efxCfg();
    const hd = (t, s, back) => `<div class="sh"><div><b>${t}</b><span>${s}</span></div><button class="ibtn" data-act="${back ? "efxback" : "close"}" aria-label="${back ? "Zurück" : "Schließen"}">${ic(back ? "back" : "close", 20)}</button></div>`;
    if (m.type === "efxedit") return this._efxEditModal(hd);
    const row = (pos, n) => {
      const e = EF_POS[pos], fl = n ? EF_FLOWS.find((x) => x[0] === n.flow)[1] : "";
      return `<div class="efrow"><button class="sxrow" data-act="efxedit" data-k="${pos}"><span class="sxi">${n ? `<span class="efmini" style="--c:${n.color || e[3]}">${this._efxImg(n.image)}</span>` : ic("plus", 20)}</span><span class="sxt"><b>${n ? esc(n.name) : "Kachel hinzufügen"}</b><small>${e[4]}${n ? " · " + fl : ""}</small></span></button>${n ? `<button class="sw ${n.on ? "on" : ""}" data-act="efxtog" data-k="${pos}" aria-pressed="${n.on}" aria-label="${esc(n.name)} ${n.on ? "ausblenden" : "einblenden"}" ${adm ? "" : "disabled"}></button>` : ""}</div>`;
    };
    const h = c.hub;
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">${hd("Hausfluss einrichten", "Modul 19 · Beta · gilt für alle Nutzer")}
      <div class="lsec">${ic("home", 15)}Haus (Mitte)</div>
      <div class="efrow"><button class="sxrow" data-act="efxedit" data-k="hub"><span class="sxi"><span class="efmini" style="--c:${h.color || "#2dd4bf"}">${this._efxImg(h.image)}</span></span><span class="sxt"><b>${esc(h.name)}</b><small>${h.bottom ? "Eigener Sensor für den Hausverbrauch" : "Hausverbrauch wird berechnet: " + (h.calc === "rest" ? "Restverbrauch" : "Gesamtverbrauch")}</small></span></button></div>
      <div class="lsec">${ic("energy", 15)}Kacheln</div>
      <div class="efl">${Object.keys(EF_POS).map((p) => row(p, c.nodes[p])).join("")}</div>
      <div class="lsec">${ic("sliders", 15)}Kopfbereich</div>
      <div class="vrow"><span>Hausverbrauch jetzt anzeigen<small class="mut" style="display:block">Große Zahl mit Chips oben auf der Seite</small></span><button class="sw ${c.hero.show ? "on" : ""}" data-act="efxhero" aria-pressed="${c.hero.show}" aria-label="Kopfbereich" ${adm ? "" : "disabled"}></button></div>
      <div class="stowarn" style="margin-top:12px">${ic("info", 16)}<span>Das Modul zeigt nur an und schaltet nichts. Es nutzt Sensoren aus Home Assistant (Leistung in W oder kW, Energie, Ladestand).</span></div>
      <div class="foot2" style="margin-top:12px"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _efxEditModal(hd) {
    const d = this._modal.draft, hub = this._modal.pos === "hub", n = d, adm = this._admin(), ids = this._efxIds(), pe = EF_POS[this._modal.pos];
    const sel = (k, none = "– keiner –") => this._wzSel(ids, n[k] || "", "efxe", `data-w="${k}"`, none);
    const lab = (s) => `<input type="text" class="efli" data-f="efxlab" data-w="${s}" value="${esc(n[s + "_label"])}" maxlength="24" placeholder="Beschriftung (leer = automatisch)" aria-label="Beschriftung">`;
    const chip = (act, k, label, on) => `<button class="gsch ${on ? "sel" : ""}" data-act="${act}" data-k="${esc(k)}" aria-pressed="${on}">${esc(label)}</button>`;
    const q = (this._modal.q || "").toLowerCase(), imgs = EF_IMGS.filter((x) => !q || (x.n + " " + x.k).toLowerCase().includes(q)), emo = EF_EMO.filter((x) => !q || (x[1] + " " + x[2]).toLowerCase().includes(q));
    const imgp = this._modal.imgOpen ? `<div class="efpick"><input type="search" data-f="efximgq" value="${esc(this._modal.q || "")}" placeholder="Suchen: Solar, Auto, Waschmaschine …" class="efli" aria-label="Bild suchen" autocomplete="off">
      <div class="efgal">${imgs.map((x) => `<button class="efpi ${n.image === "svg:" + x.id ? "sel" : ""}" data-act="efximg" data-k="svg:${x.id}" title="${esc(x.n)}"><svg viewBox="0 0 64 64">${x.s}</svg></button>`).join("")}${emo.map((x) => `<button class="efpi ${n.image === x[0] ? "sel" : ""}" data-act="efximg" data-k="${esc(x[0])}" title="${esc(x[1])}"><span>${x[0]}</span></button>`).join("")}</div>
      <input type="text" class="efli" data-f="efximgc" value="${/^(mdi:|\/local\/|https:)/.test(n.image) ? esc(n.image) : ""}" placeholder="Eigenes: mdi:flash oder /local/bild.png" aria-label="Eigenes Bild"></div>` : "";
    const flow = hub ? "" : `<div class="lsec">${ic("energy", 15)}Flussart</div><div class="gschips">${EF_FLOWS.map((f) => chip("efxflow", f[0], f[1], n.flow === f[0])).join("")}</div><div class="mut sm">${esc(EF_FLOWS.find((f) => f[0] === n.flow)[2])}</div>`;
    const pw = hub ? "" : n.flow === "split" ? `<div class="vrow efv"><span>Leistung zur Kachel<small class="mut" style="display:block">zum Beispiel Einspeisung</small></span>${sel("power_to_node")}</div><div class="vrow efv"><span>Leistung ins Haus<small class="mut" style="display:block">zum Beispiel Netzbezug</small></span>${sel("power_to_house")}</div>`
      : `<div class="vrow efv"><span>Leistung (W oder kW)<small class="mut" style="display:block">Steuert die Linie. Leer = „Unten“, wenn es eine Leistung ist</small></span>${sel("power")}</div>${n.flow === "both" ? `<div class="vrow"><span>Vorzeichen umkehren<small class="mut" style="display:block">Positiv = zur Kachel. Liefert dein Sensor es umgekehrt, einschalten</small></span><button class="sw ${n.invert ? "on" : ""}" data-act="efxinv" aria-pressed="${n.invert}" aria-label="Vorzeichen umkehren"></button></div>` : ""}`;
    const hubx = !hub ? "" : `<div class="lsec">${ic("tools", 15)}So wird der Hausverbrauch berechnet</div>
      <div class="gschips">${chip("efxcalc", "total", "Gesamtverbrauch", n.calc === "total")}${chip("efxcalc", "rest", "Restverbrauch", n.calc === "rest")}</div>
      <div class="mut sm">Gesamt = Zufluss (Solar, Netzbezug, Akku entladen) minus Einspeisung und Akku laden. Rest zieht zusätzlich die Verbraucher-Kacheln ab. Wählst du bei „Unten“ einen eigenen Sensor, hat dieser Vorrang.</div>
      ${this._efxHubInfo()}
      <div class="lsec">${ic("list", 15)}Weitere Chips im Kopf</div>
      <div class="gschips">${(n.chips || []).map((e) => `<span class="och">${esc(this._wzName(e))}<button data-act="efxchipdel" data-k="${esc(e)}" aria-label="Entfernen">${ic("close", 12)}</button></span>`).join("")}</div>
      ${(n.chips || []).length < 4 ? this._wzSel(ids, "", "efxchipadd", "", "+ Chip hinzufügen") : ""}`;
    const noP = !hub && (n.flow === "split" ? !n.power_to_node && !n.power_to_house : !n.power && !(n.bottom && /^k?W$/i.test(((this._hass.states[n.bottom] || { attributes: {} }).attributes.unit_of_measurement) || "")));
    const warn = noP ? `<div class="stowarn" style="margin:8px 0">${ic("alert", 16)}<span>Ohne Leistungssensor bleibt die Linie aus. Wähle oben einen Sensor in W oder kW.</span></div>` : "";
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">${hd(hub ? "Haus bearbeiten" : this._modal.isNew ? "Kachel einrichten" : "Kachel bearbeiten", hub ? "Mitte" : pe[4], true)}
      <div class="vrow"><span>Name</span><input type="text" class="efli" style="max-width:55%" data-f="efxname" value="${esc(n.name)}" maxlength="30" aria-label="Name"></div>
      <div class="vrow"><span>Bild</span><button class="btn2" style="flex:none;display:inline-flex;align-items:center;gap:8px" data-act="efximgtog"><span class="efmini" style="--c:${n.color || (pe ? pe[3] : "#2dd4bf")}">${this._efxImg(n.image)}</span> ${this._modal.imgOpen ? "Schließen" : "Ändern"}</button></div>${imgp}
      <div class="vrow"><span>Farbe</span><span class="efsw">${EF_COLORS.map((x) => `<button class="${n.color === x ? "sel" : ""}" style="background:${x}" data-act="efxcol" data-k="${x}" aria-label="Farbe ${x}" aria-pressed="${n.color === x}"></button>`).join("")}<button class="${n.color ? "" : "sel"}" data-act="efxcol" data-k="" aria-label="Standardfarbe" style="background:var(--line)">A</button></span></div>
      ${flow}${pw}${warn}
      <div class="lsec">${ic("sliders", 15)}Werte auf der Kachel</div>
      ${EF_SIDES.map(([s, t]) => `<div class="efside"><div class="mut sm" style="margin:6px 0 2px">${t}${hub && s === "top" ? " · Chip „Hausverbrauch heute“" : hub && s === "bottom" ? " · leer = berechneter Hausverbrauch" : ""}</div>${sel(s, hub && s === "bottom" ? "– berechnet –" : "– nichts –")}${n[s] || (hub && s === "bottom") ? lab(s) : ""}</div>`).join("")}
      ${hubx}
      <div class="foot2" style="margin-top:14px">${hub || this._modal.isNew ? "" : `<button class="btn2" data-act="efxdel" style="color:#fb7185">Entfernen</button>`}<button class="btn2" data-act="efxback">Abbrechen</button><button class="btn2 pri" data-act="efxsave" ${adm ? "" : "disabled"}>Speichern</button></div></div>`;
  }
  _efxHubInfo() {
    const c = this._efxCfg(), list = Object.keys(EF_POS).filter((p) => c.nodes[p] && c.nodes[p].on).map((p) => c.nodes[p]);
    if (!list.length) return "";
    const calc = this._efxCalc(list);
    const miss = !calc.src ? "Es fehlt eine Quelle mit Flussart „Liefert“, zum Beispiel Solar." : !calc.bidir ? "Es fehlt Netz oder Akku mit Flussart „Beides“. Ohne sie ist das Ergebnis nicht vollständig." : "";
    return `<details class="efinfo"><summary>Welche Kacheln einfließen</summary>${list.map((n) => { const w = this._efxNodeW(n); return `<div class="vrow"><span>${esc(n.name)}<small class="mut" style="display:block">${n.flow === "consume" ? "Verbraucher, gehört zum Haus" : n.flow === "supply" ? "Zufluss" : "Zufluss oder Abfluss"}</small></span><b>${n.flow === "consume" ? "–" : this._efxFmtW(Math.abs(w)) + (w > 0 ? " Abfluss" : w < 0 ? " Zufluss" : "")}</b></div>`; }).join("")}</details>${miss ? `<div class="stowarn" style="margin-top:6px">${ic("alert", 16)}<span>${miss}</span></div>` : ""}`;
  }
  _efxAct(a, b) {
    const k = b.dataset.k, m = this._modal;
    if (a === "efxmore") { this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: b.dataset.e }, bubbles: true, composed: true })); return; }
    if (a === "efxopen") { this._modal = { type: "efxmgr" }; this._efxLoad(true); this._renderModal(); return; }
    if (a === "efxstart") {
      const c = this._efxClone(), mk = (p, o) => ({ ...this._efxBlank(p), ...o });
      c.nodes = { top_1: mk("top_1", { name: "PV Dach", image: "svg:solar", flow: "supply" }), left_1: mk("left_1", { name: "Netz", image: "svg:netz", flow: "split", color: "#a78bfa" }), left_2: mk("left_2", { name: "Steckdose", image: "svg:steckdose", flow: "consume", color: "#f97316" }), right_1: mk("right_1", { name: "Auto", image: "svg:auto", flow: "consume", color: "#f472b6" }), bottom: mk("bottom", { name: "Akku", image: "svg:akku", flow: "both" }) };
      this._efxPut(c).then(() => { this._render(); this._toast("Beispiel-Kacheln angelegt, jetzt Entitäten zuordnen"); this._modal = { type: "efxmgr" }; this._renderModal(); }); return;
    }
    if (a === "efxtab") { this._efT = b.dataset.v === "strom" ? "strom" : "now"; try { localStorage.setItem("fh_ef_tab", this._efT); } catch (e) { /* egal */ } this._render(); return; }
    if (a === "efxsize") { const o = ["auto", "klein", "mittel", "gross"]; this._efS = o[(o.indexOf(this._efSize()) + 1) % 4]; try { localStorage.setItem("fh_ef_size", this._efS); } catch (e) { /* egal */ } this._render(); return; }
    if (a === "efxback") { this._modal = { type: "efxmgr" }; this._renderModal(); return; }
    if (a === "efxhero") { const c = this._efxClone(); c.hero.show = !c.hero.show; this._efxPut(c).then(() => { this._renderModal(); this._render(); }); return; }
    if (a === "efxtog") { const c = this._efxClone(); if (c.nodes[k]) c.nodes[k].on = !c.nodes[k].on; this._efxPut(c).then(() => { this._renderModal(); this._render(); }); return; }
    if (a === "efxedit") {
      const c = this._efxCfg(), n = k === "hub" ? c.hub : c.nodes[k];
      this._modal = { type: "efxedit", pos: k, isNew: !n, draft: JSON.parse(JSON.stringify(n || this._efxBlank(k))) }; this._renderModal(); return;
    }
    if (!m || m.type !== "efxedit") return;
    const d = m.draft;
    if (a === "efximgtog") m.imgOpen = !m.imgOpen;
    else if (a === "efximg") { d.image = k; m.imgOpen = false; m.q = ""; }
    else if (a === "efxcol") d.color = k;
    else if (a === "efxflow") d.flow = k;
    else if (a === "efxinv") d.invert = !d.invert;
    else if (a === "efxcalc") d.calc = k;
    else if (a === "efxchipdel") d.chips = d.chips.filter((x) => x !== k);
    else if (a === "efxsave") {
      const c = this._efxClone(); d.name = (d.name || "").trim() || (m.pos === "hub" ? "Haus" : EF_POS[m.pos][4]);
      if (m.pos === "hub") c.hub = d; else c.nodes[m.pos] = { ...d, on: true };
      this._efxPut(c).then(() => { this._modal = { type: "efxmgr" }; this._renderModal(); this._render(); this._toast("Gespeichert"); }); return;
    }
    else if (a === "efxdel") { const c = this._efxClone(); delete c.nodes[m.pos]; this._efxPut(c).then(() => { this._modal = { type: "efxmgr" }; this._renderModal(); this._render(); this._toast("Kachel entfernt"); }); return; }
    this._renderModal();
  }
  _efxChange(t) {
    const f = t.dataset.f, v = t.value || "", m = this._modal; if (!m || m.type !== "efxedit") return false;
    const d = m.draft, ent = (x) => (/^(sensor|number|input_number|counter)\.[a-z0-9_]+$/.test(x) ? x : "");
    if (f === "efxname") { d.name = v.slice(0, 30); return true; }
    if (f === "efxe") { d[t.dataset.w] = ent(v); return true; }
    if (f === "efxlab") { d[t.dataset.w + "_label"] = v.slice(0, 24); return true; }
    if (f === "efxchipadd") { const e = ent(v); if (e && !d.chips.includes(e) && d.chips.length < 4) d.chips.push(e); return true; }
    if (f === "efximgq") { m.q = v; this._renderModal(); const i = this.shadowRoot.querySelector('[data-f="efximgq"]'); if (i) { i.focus(); i.setSelectionRange(v.length, v.length); } return true; }
    if (f === "efximgc") { if (/^(mdi:[a-z0-9-]{2,60}|\/local\/[A-Za-z0-9_.\/-]{1,150}|https:\/\/\S{4,200})$/.test(v)) { d.image = v; this._renderModal(); } return true; }
    return false;
  }
