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
    this._efBandV = (this._efBandV || 0) + 1;  /* Banner sofort neu zeichnen */
    return this._hass.callWS({ type: "fenster_heizung/ef_set", cfg }).then((r) => { this._efxD = r; }).catch(() => this._toast("Das hat nicht geklappt"));
  }
  _efTab() { if (!this._efT) { try { this._efT = localStorage.getItem("fh_ef_tab") === "strom" ? "strom" : "now"; } catch (e) { this._efT = "now"; } } return this._efT; }
  _efSize() { if (!this._efS) { try { this._efS = localStorage.getItem("fh_ef_size") || "auto"; } catch (e) { this._efS = "auto"; } } return this._efS; }
  _efxSp() { return !!this._spnS().active; }
  _efxCfg() { return (this._efxD && this._efxD.cfg) || { hero: { show: true }, banner: "band", theme: "nacht", shape: "kachel", mobile: "fluss", hub: { on: true, name: "Haus", image: "hd:house", color: "", ring: true, top: "", bottom: "", left: "", right: "", top_label: "", bottom_label: "", left_label: "", right_label: "", calc: "total", chips: [] }, nodes: {} }; }
  _efxClone() { return JSON.parse(JSON.stringify(this._efxCfg())); }
  _efxBlank(pos) {
    const p = EF_POS[pos];
    return { on: true, name: p[4], image: p[2] === "supply" ? "hd:pvRoof" : "⚡", color: "", top: "", bottom: "", left: "", right: "", top_label: "", bottom_label: "", left_label: "", right_label: "", flow: p[2], power: "", power_to_node: "", power_to_house: "", invert: false, run_w: 10, pct: "", status: "" };
  }
  /* ---- Rechnen: Leistung einer Kachel in W, positiv = zur Kachel, negativ = ins Haus ---- */
  _efxToW(id) { const st = id && this._hass.states[id]; if (!st) return NaN; const v = parseFloat(st.state); return isNaN(v) ? NaN : /^kW$/i.test(st.attributes.unit_of_measurement || "") ? v * 1000 : v; }
  _efxPid(n) { const b = n.bottom && this._hass.states[n.bottom]; return n.power || (b && /^k?W$/i.test(b.attributes.unit_of_measurement || "") ? n.bottom : ""); }
  _efxNodeW(n) {
    if ((n.group || []).length && n.flow !== "split") { const s = n.group.reduce((a, e) => { const v = this._efxToW(e); return a + (isNaN(v) ? 0 : Math.abs(v)); }, 0); return n.flow === "supply" ? -s : s; }  /* W3 Gruppen-Kachel: Summe */
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
    if (/^(unavailable|unknown)$/.test(st.state)) return ["–", "", String(st.attributes.friendly_name || id).split(" ").pop()];
    return [isNaN(v) ? st.state : v.toLocaleString("de-DE", { maximumFractionDigits: Math.abs(v) >= 100 ? 0 : 2 }), u, String(st.attributes.friendly_name || id).split(" ").pop()];
  }
  /* Bild einer Kachel: mit „Alte Symbole behalten“ das ursprüngliche Symbol (image_alt), sonst das HD-Bild */
  _efxImgN(n, o) { const c = this._efxCfg(); return this._efxImg(c.keep_old && n && n.image_alt ? n.image_alt : n && n.image, o); }
  /* Zustand für HD-Bilder aus den Werten der Kachel (v0.7, Konzept K3): läuft ab „run_w“ (Standard 10 W),
     Füllstand aus dem gewählten %-Wert („pct“: leer = erster Wert in %, Seite = genau dieser, „none“ = kein Ring) */
  _efxPctId(n) {
    if (n.pct === "none") return "";
    if (n.pct && n[n.pct]) return n[n.pct];
    const s = EF_SIDES.map(([x]) => n[x]).find((e) => e && this._hass.states[e] && (this._hass.states[e].attributes.unit_of_measurement || "") === "%");
    return s || "";
  }
  _efxState(n, w) {
    const id = this._efxPctId(n), st = id && this._hass.states[id], v = st ? parseFloat(st.state) : NaN, rw = Number(n.run_w) > 0 ? Number(n.run_w) : 10;
    return { on: Math.abs(w) >= rw, lvl: isNaN(v) ? undefined : Math.max(0, Math.min(100, v)) };
  }
  /* Keine Daten: der Leistungssensor fehlt oder meldet „nicht verfügbar“ */
  _efxNoData(n) {
    const ids = n.flow === "split" ? [n.power_to_node, n.power_to_house].filter(Boolean) : (n.group || []).length ? n.group : [this._efxPid(n)].filter(Boolean);
    return ids.length > 0 && ids.every((id) => { const st = this._hass.states[id]; return !st || /^(unavailable|unknown)$/.test(st.state); });
  }
  /* Status-Punkt (Konzept B1/K3): grün läuft, gelb wartet, rot Störung oder keine Daten. Aus einer frei wählbaren Entität. */
  _efxDot(n) {
    if (this._efxNoData(n)) return ["err", "keine Daten"];
    const st = n.status && this._hass.states[n.status]; if (!n.status) return null;
    if (!st || /^(unavailable|unknown)$/.test(st.state)) return ["err", "Status nicht verfügbar"];
    const v = String(st.state).toLowerCase(), dc = st.attributes.device_class || "";
    if (n.status.startsWith("binary_sensor.") && /^(problem|safety|smoke|moisture|tamper)$/.test(dc)) return v === "on" ? ["err", "Störung"] : ["ok", "in Ordnung"];
    if (/(error|fault|fehler|st[öo]rung|problem|alarm|defekt|blocked|blockiert|failed)/.test(v)) return ["err", st.state];
    if (/^(on|an|ein|true|running|run|läuft|laeuft|active|aktiv|charging|lädt|laedt|heating|heizt|cleaning|washing|drying|spülen|spuelen|betrieb|in_betrieb|working|cooling|home)$/.test(v)) return ["ok", st.state];
    if (/^(off|aus|false|idle|standby|stand-by|ready|bereit|docked|finished|fertig|done|complete|completed|end|ende|not_home|0)$/.test(v)) return ["off", st.state];
    if (/(paus|wait|wart|pending|delay|verz|scheduled|geplant|sleep|program)/.test(v)) return ["wait", st.state];
    return ["ok", st.state];
  }
  /* Herkunft des Hausverbrauchs (Konzept D1/K4): Zufluss nach Bild-Art gruppiert. Einspeisung und Akku-Laden kommen zuerst
     aus Solar – so zeigt der Ring, was im Haus ankommt. Unbekannte Quellen zählen als „Sonstige“. */
  _efxKind(n) {
    const t = (String(n.image || "") + " " + String(n.image_alt || "") + " " + String(n.name || "")).toLowerCase();
    if (/pvroof|balcony|forecast|sonne|solar|☀|🌤|\bpv\b|balkon|photovolt/.test(t)) return "pv";
    if (/battery|akku|🔋|batter|speicher/.test(t)) return "bat";
    if (/grid|netz|strommast|bezug|einspeis/.test(t)) return "net";
    return "oth";
  }
  _efxMix(nodes) {
    const m = { pv: 0, bat: 0, net: 0, oth: 0 }; let out = 0;
    nodes.forEach((n) => { if (n.flow === "consume") return; const w = this._efxNodeW(n); if (w < 0) m[this._efxKind(n)] += -w; else out += w; });
    const take = Math.min(m.pv, out); m.pv -= take; out -= take; if (out > 0) m.oth = Math.max(0, m.oth - out);
    const tot = m.pv + m.bat + m.net + m.oth; return { ...m, tot };
  }
  /* Ring um das Haus: immer vier Bögen (auch mit Länge 0), damit der Aufbau gleich bleibt und der Ring beim Neuzeichnen gleitet */
  _efxRingHtml(mix, img, txt) {
    const R = 44, C = 2 * Math.PI * R, S = EF_MIX; let off = 0;
    const arcs = S.map(([k, , c]) => {
      const f = mix.tot > 0 ? mix[k] / mix.tot : 0, len = f > 0 ? Math.max(0, f * C - (f < .999 ? 2.4 : 0)) : 0;
      const a = `<circle class="efha" cx="50" cy="50" r="${R}" stroke="${c}" stroke-dasharray="${len.toFixed(1)} ${C.toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}"/>`; off += f * C; return a;
    }).join("");
    return `<div class="efhr" data-kk="efhr" data-ks="1" title="${esc(txt)}"><svg class="efhrs" viewBox="0 0 100 100" aria-hidden="true"><circle class="efht" cx="50" cy="50" r="${R}"/>${arcs}</svg><div class="efhri">${img}</div></div>`;
  }
  _efxMixTxt(mix) {
    if (!mix.tot) return "Gerade fließt kein Strom ins Haus";
    return EF_MIX.filter(([k]) => mix[k] > 0).map(([k, l]) => `${Math.round(mix[k] / mix.tot * 100)} % ${l}`).join(" · ");
  }
  /* Abends leuchten die Fenster der Haus-Bilder: Sonne unter dem Horizont, ohne sun.sun zwischen 18 und 7 Uhr */
  _efxNight() { const s = this._hass.states["sun.sun"]; if (s) return s.state === "below_horizon"; const h = new Date().getHours(); return h >= 18 || h < 7; }
  _efxImg(v, o) {
    v = String(v || "");
    if (v.startsWith("hd:")) return this._gx(v.slice(3), 64, o || { on: true, lvl: 80 }).replace('class="gx"', 'class="gx efhd"');
    if (v.startsWith("svg:")) { const i = EF_IMGS.find((x) => x.id === v.slice(4)); return i ? `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${i.s}</svg>` : ""; }
    if (/^(\/local\/|https:)/.test(v)) return `<img src="${esc(v)}" alt="" loading="lazy">`;
    if (v.startsWith("mdi:")) return `<ha-icon icon="${esc(v)}"></ha-icon>`;
    return esc(v);
  }
  _efxSide(n, side, hub, hubW) {
    const id = n[side], lab = String(n[side + "_label"] || "").trim(), lr = side === "left" || side === "right";
    let html = "", calc = false;
    if (id) { const [v, u, l] = this._efxFmt(id); html = lr ? `${v}<i>${esc(lab || u)}</i>` : `${v} ${esc(u)}<i>${esc(lab || l)}</i>`; }
    else if (!hub && side === "bottom" && (n.group || []).length) { calc = true; html = `${this._efxFmtW(Math.abs(this._efxNodeW(n)))}<i>${esc(lab || n.group.length + " Geräte zusammen")}</i>`; }
    else if (hub && side === "bottom") { calc = true; html = `${this._efxFmtW(hubW)}<i>${esc(lab || (n.calc === "rest" ? "Restverbrauch" : "Hausverbrauch"))}</i>`; }
    return { id, html, calc };
  }
  _efxNodeHtml(pos, n, hubW) {
    const hub = pos === "hub", col = n.color || (EF_POS[pos] || [])[3] || "#2dd4bf", w = hub ? 0 : this._efxNodeW(n), nd = !hub && this._efxNoData(n), on = hub || (!nd && Math.abs(w) > 5);
    const sides = EF_SIDES.map(([s]) => { const o = this._efxSide(n, s, hub, hubW), tag = o.id ? "button" : "span"; return `<${tag} class="efs ${s[0]}" ${o.id ? `data-act="efxmore" data-e="${esc(o.id)}" title="${esc((this._hass.states[o.id] || { attributes: {} }).attributes.friendly_name || o.id)}"` : ""}>${o.html}</${tag}>`; }).join("");
    const isHd = String(this._efxCfg().keep_old && n.image_alt ? n.image_alt : n.image || "").startsWith("hd:");
    let pic;
    if (hub) {
      const img = this._efxImgN(n, { on: this._efxNight() }), mix = this._efMix || { tot: 0 };
      pic = n.ring === false ? `<div class="efi${isHd ? " hd" : ""}">${img}</div>` : this._efxRingHtml(mix, img, this._efxMixTxt(mix));
    } else {
      const zs = nd ? { on: false } : this._efxState(n, w), pr = !nd && zs.lvl != null ? `<svg class="efpr" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" pathLength="100"/><circle cx="50" cy="50" r="46" pathLength="100" stroke-dasharray="${zs.lvl.toFixed(1)} 100"/></svg>` : "";
      pic = `${pr}<div class="efi${isHd ? " hd" : ""}" data-g="${esc(String(n.image || "").replace(/^hd:/, ""))}">${this._efxImgN(n, zs)}</div>`;
    }
    if (!hub && (n.group || []).length) pic += `<button class="efgb" data-act="efxgrp" data-k="${pos}" aria-label="${(n.group || []).length} Geräte anzeigen">×${n.group.length}</button>`;
    const dot = hub ? null : this._efxDot(n), dh = dot ? `<i class="efdot ${dot[0]}" title="${esc(dot[1])}" aria-label="Status: ${esc(dot[1])}"></i>` : "";
    return `<div class="efn${hub ? " hub" : ""}${on ? " on" : ""}${nd ? " nd" : ""}" ${hub ? 'data-act="efxtab" data-v="strom" title="Strom öffnen"' : ""} data-p="${pos}" data-w="${Math.round(w)}" data-c="${col}" style="--c:${col}" role="group" aria-label="${esc(n.name)}${hub && n.ring !== false ? ": " + esc(this._efxMixTxt(this._efMix || { tot: 0 })) : ""}${dot ? ", " + esc(dot[1]) : ""}">${sides}${pic}${dh}<span class="efnm">${esc(n.name)}</span></div>`;
  }
  _efPage() {
    if (!this._efxD) { this._efxLoad(); return `<div class="card empty">Hausfluss wird geladen …</div>`; }
    if (!this._efxSp()) return `<div class="card empty">${ic("heart", 34)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Nur für Sponsoren</div>Der Hausfluss ist eine Vorabversion und gehört zu den Extras für Sponsoren.<br><button class="btn2 pri" style="margin-top:12px" data-act="spnopen">Sponsor-Bereich öffnen</button></div>`;
    const c = this._efxCfg(), adm = this._admin(), list = EF_POS ? Object.keys(EF_POS).filter((p) => c.nodes[p] && c.nodes[p].on) : [], nodes = list.map((p) => c.nodes[p]);
    if (!list.length) return `<div class="card empty">${ic("energy", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Noch keine Kacheln</div>Lege Solar, Netz, Akku und Verbraucher als Kacheln um dein Haus an.${adm ? `<br><div style="margin-top:12px;text-align:left">${this._efxTplHtml(adm)}</div><button class="btn2" style="margin-top:8px" data-act="efxopen">Selbst einrichten</button>` : ""}</div>`;
    const narrow = (this.clientWidth || 1000) < 640, hub = c.hub, calc = this._efxCalc(nodes), hubW = hub.calc === "rest" ? calc.rest : calc.total;
    this._efMix = this._efxMix(nodes);
    /* Das Haus sitzt immer genau in der Mitte: Zeilen oben und unten werden paarweise gehalten oder weggelassen, leere Gegenstücke bekommen einen unsichtbaren Platzhalter */
    const ar = !!this._efArr && adm && !narrow;  /* W1 Anordnen: alle neun Plätze sichtbar, freie als Ablagefläche */
    const has = (r) => list.some((p) => EF_POS[p][1] === r), keep = ar ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5].filter((r) => r === 3 || (r === 1 || r === 5 ? has(1) || has(5) : has(2) || has(4)));
    const ri = (r) => keep.indexOf(r) + 1, COL = { top_1: 1, top_2: 3, left_1: 1, left_2: 1, left_3: 1, right_1: 3, right_2: 3, right_3: 3 };
    const cellAt = (p, html, z) => { const e = EF_POS[p], b = p === "bottom", ct = !ar && /^top_/.test(p) && list.filter((x) => /^top_/.test(x)).length === 1, col = narrow ? (b ? "1/-1" : ct ? "2" : COL[p]) : (b || ct ? "2/4" : e[0]); return `<div class="efc${b ? " bt" : ""}${ct ? " ct" : ""}${z ? " z" : ""}"${ar ? ` data-slot="${p}"` : ""} style="grid-column:${col};grid-row:${ri(e[1])}">${html}</div>`; };
    const ghost = '<div class="efg" aria-hidden="true"></div>', ghosts = [[1, "top_1"], [5, "bottom"], [2, "left_1"], [4, "left_3"]].filter(([r]) => !ar && keep.includes(r) && !has(r)).map(([r, p]) => cellAt(p, ghost, r === 2 || r === 4)).join("");
    const gUp = keep.includes(4) && !has(4), gDn = keep.includes(2) && !has(2), rows = keep.length - (gUp || gDn ? 1 : 0);
    const slots = ar ? Object.keys(EF_POS).filter((p) => !list.includes(p)).map((p) => cellAt(p, `<button class="efslot${this._efPick ? " pk" : ""}" data-act="efxslot" data-p="${p}" aria-label="Freier Platz ${EF_POS[p][4]}">${ic("plus", 18)}<small>${EF_POS[p][4]}</small></button>`)).join("") : "";
    const pair = narrow && list.includes("top_1") && list.includes("top_2");  /* Handy: beide oberen Kacheln nebeneinander, mittig über dem Haus */
    const cells = (pair ? `<div class="efc tp" style="grid-column:1/-1;grid-row:${ri(1)}">${this._efxNodeHtml("top_1", c.nodes.top_1, hubW)}${this._efxNodeHtml("top_2", c.nodes.top_2, hubW)}</div>` : "") + list.filter((p) => !(pair && (p === "top_1" || p === "top_2"))).map((p) => cellAt(p, this._efxNodeHtml(p, c.nodes[p], hubW))).join("") + ghosts;
    const arr = !!this._efArr && adm, L = this._efxLook(), tm = !!(this._tmOn && this._tmOn()), items = this._efxItems(list), mob = narrow ? this._efMob() : "", lt = this._efLight();
    let hero = "";
    if (c.hero.show && !tm) {
      const pe = hub.bottom, w = pe ? this._efxToW(pe) : hubW, chips = [];
      if (calc.src) chips.push(`Solar ${Math.round(nodes.filter((n) => n.flow === "supply").reduce((a, n) => a - this._efxNodeW(n), 0)).toLocaleString("de-DE")} W`);
      if (hub.top && this._hass.states[hub.top]) { const [v, u] = this._efxFmt(hub.top); chips.push(`Hausverbrauch heute ${v} ${u}`); }
      (hub.chips || []).forEach((id) => { if (this._hass.states[id]) { const [v, u] = this._efxFmt(id); chips.push(`${this._wzName(id)} ${v} ${u}`); } });
      const lbl = !isNaN(w) && w < 0 ? "Einspeisung jetzt" : !pe && hub.calc === "rest" ? "Restverbrauch jetzt" : "Hausverbrauch jetzt", big = isNaN(w) ? "–" : Math.abs(Math.round(w)).toLocaleString("de-DE");
      hero = L.banner === "band" ? this._efxBand(items, { narrow, lbl, big, unit: "W", chips }) : this._modHero("ef", { icon: "energy", lbl, big, unit: "W", chips });
    }
    const hubCell = `<div class="efc hb${gUp ? " hu" : gDn ? " hd" : ""}" style="grid-column:${narrow ? 2 : "2/4"};grid-row:${ri(3)}">${this._efxNodeHtml("hub", hub, hubW)}</div>`;
    const tab = this._efTab(), sz = this._efSize(), SZ = { auto: "Auto", klein: "Klein", mittel: "Mittel", gross: "Groß" }, MB = { fluss: "Fluss", raster: "Raster", brett: "Brett" };
    const seg = `<div class="efseg" role="tablist"><button class="${tab === "now" ? "on" : ""}" role="tab" aria-selected="${tab === "now"}" data-act="efxtab" data-v="now">Jetzt</button><button class="${tab === "strom" ? "on" : ""}" role="tab" aria-selected="${tab === "strom"}" data-act="efxtab" data-v="strom">Strom</button>${tab === "now" && adm && !tm && !narrow ? `<button class="efszb efab${arr ? " on" : ""}" data-act="efxarr" aria-pressed="${arr}">${arr ? "Fertig" : "Anordnen"}</button>` : ""}${tab === "now" && !narrow && !tm ? `<button class="efszb" data-act="efxsize" aria-label="Größe der Kacheln">Größe: ${SZ[sz] || "Auto"}</button>` : tab === "now" && narrow ? `<button class="efszb" data-act="efxmob" aria-label="Ansicht wechseln">Ansicht: ${MB[mob]}</button>` : ""}</div>`;
    const cls = `efx${narrow ? " nar" : ""}${lt ? " lt" : ""}${L.shape === "rund" ? " sh-rund" : ""}${tm ? " wall" : ""}`;
    const foot = `<div class="mut sm" style="margin:2px 4px">Vorabversion für Sponsoren · Werte live aus deinen Entitäten · Tippe auf einen Wert für den Verlauf</div>`;
    if (tab === "strom") return `<div class="${cls}">${hero}${seg}${this._efStrom(narrow)}</div>`;
    if (narrow && !tm && mob === "fluss" && !arr) { setTimeout(() => this._efxColLines(), 0); return `<div class="${cls}">${hero}${seg}${this._efxCol(items, hubW)}${this._efxToday()}${foot}</div>`; }
    if (narrow && !tm && mob === "raster" && !arr) { const R = this._efxRaster(items, hubW, adm); return `<div class="${cls}">${R.card}${seg}${R.grid}${foot}</div>`; }
    setTimeout(() => this._efxLines(), 0);
    const board = `${arr && !narrow ? `<div class="stowarn" style="margin:0">${ic("info", 16)}<span>Anordnen: Kachel auf einen anderen Platz ziehen – oder antippen und dann den Ziel-Platz antippen. Belegte Plätze werden getauscht.</span></div>` : ""}<div class="efboard th-${L.theme}${arr && !narrow ? " arr" : ""}" id="efboard" data-rows="${rows}"${!narrow && this._efW ? ` style="--eft:${this._efW}px"` : ""}><svg class="eflines" aria-hidden="true">${this._efSvg || ""}</svg><div class="efgrid">${cells}${slots}${hubCell}</div></div>`;
    if (tm) { const quer = (window.innerWidth || 1280) >= (window.innerHeight || 800); return `<div class="${cls} ${quer ? "quer" : "hoch"}">${seg}<div class="efwall">${board}${this._efxWallSide(items, hubW, quer)}</div></div>`; }
    return `<div class="${cls}">${hero}${seg}${board}${arr ? "" : this._efxToday()}
      ${foot}</div>`;
  }
  /* Kachelgröße: auf Tablet und Desktop nach der Höhe, die unter dem Banner übrig bleibt (Einstellung „Größe“ überschreibt das) */
  _efxFit(b, narrow) {
    if (narrow) { b.style.removeProperty("--eft"); return; }
    const sz = this._efSize(), vh = window.innerHeight || 800, key = (this.clientWidth || 0) + "x" + vh;
    if (this._efK !== key) { this._efK = key; this._efTop = b.getBoundingClientRect().top; }
    const wall = !!b.closest(".wall"), wq = wall && !!b.closest(".quer");
    /* Wand-Ansicht: unten liegt das Dock des Tablet-Modus, und die Haus-Zeile ist etwa doppelt so hoch wie eine breite Kachel */
    const rows = Math.max(3, +b.dataset.rows || 4) + (wall ? 0.5 : 0), avail = vh - (this._efTop || 330) - (wall ? 115 : 70), th = (avail - (rows - 1) * 6) / rows;
    const w = wall ? Math.max(130, Math.min(wq ? 215 : 190, th * 2.15)) : sz === "klein" ? 100 : sz === "mittel" ? 128 : sz === "gross" ? 160 : Math.max(96, Math.min(150, th * 1.15));
    this._efW = Math.round(w); b.style.setProperty("--eft", this._efW + "px");
    if (wall) {  /* Wand-Ansicht: nachmessen und verkleinern, bis das Brett über dem Dock Platz hat */
      const dock = this.shadowRoot.querySelector(".tmdock"), lim = (dock ? dock.getBoundingClientRect().top : vh) - b.getBoundingClientRect().top - 12;
      for (let i = 0; i < 3; i++) { const bh = b.getBoundingClientRect().height; if (bh <= lim || this._efW <= 110) break; this._efW = Math.max(110, Math.floor(this._efW * lim / bh)); b.style.setProperty("--eft", this._efW + "px"); }
    }
  }
  _efxLines() {
    const r = this.shadowRoot, b = r && r.getElementById("efboard"), hub = b && b.querySelector(".efn.hub"), svg = b && b.querySelector("svg.eflines"); if (!b || !hub || !svg) return;
    const narrow = b.closest(".efx").classList.contains("nar"); this._efxFit(b, narrow);
    if (b.classList.contains("arr")) this._efxDragBind(b);
    const g = b.getBoundingClientRect(), hb = hub.getBoundingClientRect(), hx = hb.left - g.left + hb.width / 2, hy = hb.top - g.top + hb.height / 2;
    let off = "", act = "", defs = "";
    const c = this._efxCfg(), grad = c.lines === "grad", hubCol = (c.hub && c.hub.color) || "#2dd4bf";
    let an = this._rkCfg().anim; try { if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) an = "aus"; } catch (_) { /* egal */ }
    b.dataset.an = an;
    const els = [...b.querySelectorAll(".efn:not(.hub):not(.ghost)")];
    els.forEach((el) => {
      const p = EF_POS[el.dataset.p], q = el.getBoundingClientRect(), nx = q.left - g.left + q.width / 2, ny = q.top - g.top + q.height / 2, on = el.classList.contains("on"), col = el.dataset.c, w = +el.dataset.w;
      const vert = p[1] === 1 || p[1] === 5, mx = (hx + nx) / 2, my = (hy + ny) / 2;
      let d = vert ? `M${hx},${hy} C${hx},${my} ${nx},${my} ${nx},${ny}` : `M${hx},${hy} C${mx},${hy} ${mx},${ny} ${nx},${ny}`;
      {  /* Linien beginnen am Rand des Hauses und enden an der Kachelkante: gerade nach oben oder unten, zur Seite als lange S-Kurve */
        const hl = hb.left - g.left, hr = hb.right - g.left, ht = hb.top - g.top, hbt = hb.bottom - g.top, ql = q.left - g.left, qr = q.right - g.left, qt = q.top - g.top, qb = q.bottom - g.top;
        if (vert) { const up = ny < hy, y0 = up ? ht : hbt, y1 = up ? qb : qt, k = Math.abs(y1 - y0) * 0.5; d = Math.abs(nx - hx) < 20 ? `M${hx},${y0} L${nx},${y1}` : `M${hx},${y0} C${hx},${y0 + (up ? -k : k)} ${nx},${y1 + (up ? k : -k)} ${nx},${y1}`; }
        else if (nx < hx) { const k = (hl - qr) * 0.55; d = `M${hl},${hy} C${hl - k},${hy} ${qr + k},${ny} ${qr},${ny}`; }
        else { const k = (ql - hr) * 0.55; d = `M${hr},${hy} C${hr + k},${hy} ${ql - k},${ny} ${ql},${ny}`; }
      }
      /* v0.7 Leuchtlinien (Konzept C1): ruhende Wege als feine gestrichelte Spur, aktive mit Leuchtsaum, Stärke nach Leistung,
         auf Wunsch Farbverlauf von der Kachelfarbe zur Hausfarbe. Punkte nur mit „Animationen“ Dezent oder Voll. */
      const pid = `efp_${el.dataset.p}`, f = Math.max(0, Math.min(1, (Math.log10(Math.max(10, Math.abs(w))) - 1) / 2.5));
      if (!on) { off += `<path id="${pid}" class="eftr" d="${d}" stroke="${col}"/>`; return; }
      const sw = (1.8 + 3.4 * f).toFixed(1), stroke = grad ? `url(#efgr_${el.dataset.p})` : col;
      if (grad) defs += `<linearGradient id="efgr_${el.dataset.p}" gradientUnits="userSpaceOnUse" x1="${nx.toFixed(1)}" y1="${ny.toFixed(1)}" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}"><stop offset="0" stop-color="${col}"/><stop offset="1" stop-color="${hubCol}"/></linearGradient>`;
      act += `<path class="efgl" d="${d}" stroke="${stroke}" stroke-width="${(+sw + 4 + 3 * f).toFixed(1)}"${an === "voll" ? ' filter="url(#efblur)"' : ""}/><path id="${pid}" class="efln" d="${d}" stroke="${stroke}" stroke-width="${sw}"/>`;
      if (an !== "aus") {  /* Fluss nach Leistung: wenig Watt = wenige, langsame, kleine Punkte; viel Watt = viele, schnelle, größere. Phase an die Uhr gebunden, damit der Fluss beim Neuzeichnen nicht springt. */
        const n = Math.round(2 + 7 * f), dur = +(4.5 - 3 * f).toFixed(2), r = (1.5 + 1.1 * f).toFixed(1), ph = (Date.now() / 1000) % dur, kp = w > 0 ? "0;1" : "1;0";
        act += Array.from({ length: n }, (_, k) => `<circle r="${r}" fill="#fff" opacity="0"><set attributeName="opacity" to=".9" begin="0.12s" fill="freeze"/><animateMotion dur="${dur}s" begin="${(-ph - k * dur / n).toFixed(2)}s" repeatCount="indefinite" keyPoints="${kp}" keyTimes="0;1" calcMode="linear"><mpath href="#${pid}"/></animateMotion></circle>`).join("");
      }
    });
    const out = `<defs><filter id="efblur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.5"/></filter>${defs}</defs>` + off + act; if (svg.innerHTML !== out) svg.innerHTML = out; this._efSvg = out;
  }
  /* W1 Kacheln ziehen: Zeiger-Ereignisse (Maus, Finger, Stift). Kurzes Antippen wählt aus, ein zweites Antippen legt ab. */
  _efxDragBind(b) {
    if (this._efPick) { const el = b.querySelector(`[data-slot="${this._efPick}"] .efn`); if (el) el.classList.add("pick"); }
    b.onpointerdown = (ev) => {
      const cell = ev.target.closest("[data-slot]"), el = cell && cell.querySelector(".efn:not(.hub)"); if (!el || ev.button > 0) return;
      ev.preventDefault(); const from = cell.dataset.slot, x0 = ev.clientX, y0 = ev.clientY; let moved = false;
      this._dragging = true; el.setPointerCapture && el.setPointerCapture(ev.pointerId);
      const mv = (e) => { const dx = e.clientX - x0, dy = e.clientY - y0; if (!moved && Math.hypot(dx, dy) < 8) return; moved = true; el.classList.add("drag"); el.style.transform = `translate(${dx}px,${dy}px)`;
        b.querySelectorAll("[data-slot].over").forEach((x) => x.classList.remove("over")); const t = this._efxSlotAt(e.clientX, e.clientY, el); if (t && t.dataset.slot !== from) t.classList.add("over"); };
      const up = (e) => { el.removeEventListener("pointermove", mv); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up); this._dragging = false;
        el.style.transform = ""; el.classList.remove("drag");
        if (!moved) { if (this._efPick && this._efPick !== from) this._efxMove(this._efPick, from); else { this._efPick = this._efPick === from ? null : from; this._render(); } return; }
        const t = this._efxSlotAt(e.clientX, e.clientY, el); if (t && t.dataset.slot !== from) this._efxMove(from, t.dataset.slot); else this._render(); };
      el.addEventListener("pointermove", mv); el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    };
  }
  _efxSlotAt(x, y, skip) {
    const r = this.shadowRoot, l = (r.elementsFromPoint ? r.elementsFromPoint(x, y) : [r.elementFromPoint(x, y)]).filter(Boolean);
    for (const e of l) { if (skip && skip.contains(e)) continue; const s = e.closest && e.closest("[data-slot]"); if (s) return s; }
    return null;
  }
  _efxSlot(p) { if (this._efPick) this._efxMove(this._efPick, p); else this._toast("Erst eine Kachel antippen oder ziehen"); }
  _efxMove(from, to) {
    const c = this._efxClone(), a = c.nodes[from], b = c.nodes[to]; if (!a) return;
    if (b) c.nodes[from] = b; else delete c.nodes[from]; c.nodes[to] = a; this._efPick = null;
    this._efxPut(c).then(() => { this._render(); this._toast(b ? `${a.name} und ${b.name} getauscht` : `${a.name} verschoben`); });
  }
  /* ---------------- Einrichtung ---------------- */
  _efxIds() { return Object.keys(this._hass.states).filter((e) => /^(sensor|number|input_number|counter)\./.test(e)); }
  _efxStIds() { return Object.keys(this._hass.states).filter((e) => EF_ST_RE.test(e)); }
  _efxModal() {
    const m = this._modal, adm = this._admin(), c = this._efxCfg();
    const hd = (t, s, back) => `<div class="sh"><div><b>${t}</b><span>${s}</span></div><button class="ibtn" data-act="${back ? "efxback" : "close"}" aria-label="${back ? "Zurück" : "Schließen"}">${ic(back ? "back" : "close", 20)}</button></div>`;
    if (m.type === "efxedit") return this._efxEditModal(hd);
    if (m.type === "efxgrp") return this._efxGrpModal();
    const row = (pos, n) => {
      const e = EF_POS[pos], fl = n ? EF_FLOWS.find((x) => x[0] === n.flow)[1] : "";
      return `<div class="efrow"><button class="sxrow" data-act="efxedit" data-k="${pos}"><span class="sxi">${n ? `<span class="efmini" style="--c:${n.color || e[3]}">${this._efxImgN(n)}</span>` : ic("plus", 20)}</span><span class="sxt"><b>${n ? esc(n.name) : "Kachel hinzufügen"}</b><small>${e[4]}${n ? " · " + fl : ""}</small></span></button>${n ? `<button class="sw ${n.on ? "on" : ""}" data-act="efxtog" data-k="${pos}" aria-pressed="${n.on}" aria-label="${esc(n.name)} ${n.on ? "ausblenden" : "einblenden"}" ${adm ? "" : "disabled"}></button>` : ""}</div>`;
    };
    const h = c.hub;
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">${hd("Hausfluss einrichten", "Modul 19 · Beta · gilt für alle Nutzer")}
      <div class="lsec">${ic("home", 15)}Haus (Mitte)</div>
      <div class="efrow"><button class="sxrow" data-act="efxedit" data-k="hub"><span class="sxi"><span class="efmini" style="--c:${h.color || "#2dd4bf"}">${this._efxImgN(h)}</span></span><span class="sxt"><b>${esc(h.name)}</b><small>${h.bottom ? "Eigener Sensor für den Hausverbrauch" : "Hausverbrauch wird berechnet: " + (h.calc === "rest" ? "Restverbrauch" : "Gesamtverbrauch")}</small></span></button></div>
      <div class="lsec">${ic("energy", 15)}Kacheln</div>
      <div class="efl">${Object.keys(EF_POS).map((p) => row(p, c.nodes[p])).join("")}</div>
      <div class="lsec">${ic("image", 15)}Bilder</div>
      <div class="vrow"><span>Alte Symbole behalten<small class="mut" style="display:block">Aus: eingebaute Symbole erscheinen als HD-Bilder. Emojis und eigene Bilder bleiben immer.</small></span><button class="sw ${c.keep_old ? "on" : ""}" data-act="efxkeep" aria-pressed="${!!c.keep_old}" aria-label="Alte Symbole behalten" ${adm ? "" : "disabled"}></button></div>
      <div class="lsec">${ic("list", 15)}Vorlagen</div><div class="mut sm" style="margin-bottom:6px">Ein Tipp legt passende Kacheln mit HD-Bildern auf freie Plätze. Belegte Plätze bleiben, wie sie sind.</div>${this._efxTplHtml(adm)}
      <div class="lsec">${ic("image", 15)}Aussehen</div>
      <div class="vrow"><span>Tageswerte-Leiste<small class="mut" style="display:block">Schmale Zeile unter dem Fluss-Bild: Solar, Verbrauch, Autarkie heute</small></span><button class="sw ${c.today !== false ? "on" : ""}" data-act="efxtoday" aria-pressed="${c.today !== false}" aria-label="Tageswerte-Leiste" ${adm ? "" : "disabled"}></button></div>
      ${(() => { const L = this._efxLook(), ch = (act, cur, opts) => `<span class="gschips" style="flex:none;justify-content:flex-end">${opts.map(([k, l]) => `<button class="gsch ${cur === k ? "sel" : ""}" data-act="${act}" data-k="${k}" aria-pressed="${cur === k}" ${adm ? "" : "disabled"}>${l}</button>`).join("")}</span>`;
        return `<div class="vrow"><span>Banner<small class="mut" style="display:block">Lichtband: Quellen fließen ins Haus, Verbraucher gehen ab, Herkunft als Balken. Einheitlich: Banner wie in den anderen Modulen.</small></span>${ch("efxbanner", L.banner, [["band", "Lichtband"], ["classic", "Einheitlich"]])}</div>
        <div class="mut sm" style="margin:8px 0 4px">Thema für das Fluss-Bild</div><div class="efthp">${EF_THEMES.map(([k, l, d]) => `<button class="efth ${L.theme === k ? "sel" : ""}" data-act="efxtheme" data-k="${k}" aria-pressed="${L.theme === k}" ${adm ? "" : "disabled"}><span class="efthv th-${k}"></span><b>${l}</b><small>${d}</small></button>`).join("")}</div>
        <div class="vrow"><span>Kachelform<small class="mut" style="display:block">Rund zeigt nur Bild, oberen und unteren Wert</small></span>${ch("efxshape", L.shape, [["kachel", "Kachel"], ["rund", "Rund"]])}</div>
        <div class="vrow"><span>Handy-Ansicht<small class="mut" style="display:block">Unter 640 px Breite. Auf dem Handy mit „Ansicht“ umschaltbar.</small></span>${ch("efxmobd", L.mobile, [["fluss", "Fluss-Spalte"], ["raster", "Kachel-Raster"], ["brett", "Brett"]])}</div>`; })()}
      <div class="lsec">${ic("energy", 15)}Linien</div>
      <div class="vrow"><span>Farbe der Linien<small class="mut" style="display:block">Einfarbig in der Kachelfarbe oder als Verlauf von der Kachel zum Haus. Stärke folgt immer der Leistung.</small></span><span class="gschips" style="flex:none">${[["mono", "Einfarbig"], ["grad", "Verlauf"]].map(([k, l]) => `<button class="gsch ${(c.lines || "mono") === k ? "sel" : ""}" data-act="efxlines" data-k="${k}" aria-pressed="${(c.lines || "mono") === k}" ${adm ? "" : "disabled"}>${l}</button>`).join("")}</span></div>
      ${this._animLook()}
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
    const q = (this._modal.q || "").toLowerCase(), hdi = EF_HD.filter((x) => !q || (x[1] + " " + x[2]).toLowerCase().includes(q)), imgs = this._efxCfg().keep_old ? EF_IMGS.filter((x) => !q || (x.n + " " + x.k).toLowerCase().includes(q)) : [], emo = EF_EMO.filter((x) => !q || (x[1] + " " + x[2]).toLowerCase().includes(q));
    const imgp = this._modal.imgOpen ? `<div class="efpick"><input type="search" data-f="efximgq" value="${esc(this._modal.q || "")}" placeholder="Suchen: Solar, Auto, Waschmaschine …" class="efli" aria-label="Bild suchen" autocomplete="off">
      <div class="efgal">${hdi.map((x) => `<button class="efpi hd ${n.image === "hd:" + x[0] ? "sel" : ""}" data-act="efximg" data-k="hd:${x[0]}" title="${esc(x[1])}">${this._gx(x[0], 40, { on: true, lvl: 80 })}</button>`).join("")}${imgs.map((x) => `<button class="efpi ${n.image === "svg:" + x.id ? "sel" : ""}" data-act="efximg" data-k="svg:${x.id}" title="${esc(x.n)}"><svg viewBox="0 0 64 64">${x.s}</svg></button>`).join("")}${emo.map((x) => `<button class="efpi ${n.image === x[0] ? "sel" : ""}" data-act="efximg" data-k="${esc(x[0])}" title="${esc(x[1])}"><span>${x[0]}</span></button>`).join("")}</div>
      <input type="text" class="efli" data-f="efximgc" value="${/^(mdi:|\/local\/|https:)/.test(n.image) ? esc(n.image) : ""}" placeholder="Eigenes: mdi:flash oder /local/bild.png" aria-label="Eigenes Bild" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done"></div>` : "";
    const flow = hub ? "" : `<div class="lsec">${ic("energy", 15)}Flussart</div><div class="gschips">${EF_FLOWS.map((f) => chip("efxflow", f[0], f[1], n.flow === f[0])).join("")}</div><div class="mut sm">${esc(EF_FLOWS.find((f) => f[0] === n.flow)[2])}</div>`;
    const pw = hub ? "" : n.flow === "split" ? `<div class="vrow efv"><span>Leistung zur Kachel<small class="mut" style="display:block">zum Beispiel Einspeisung</small></span>${sel("power_to_node")}</div><div class="vrow efv"><span>Leistung ins Haus<small class="mut" style="display:block">zum Beispiel Netzbezug</small></span>${sel("power_to_house")}</div>`
      : `<div class="vrow efv"><span>Leistung (W oder kW)<small class="mut" style="display:block">Steuert die Linie. Leer = „Unten“, wenn es eine Leistung ist</small></span>${sel("power")}</div>${n.flow === "both" ? `<div class="vrow"><span>Vorzeichen umkehren<small class="mut" style="display:block">Positiv = zur Kachel. Liefert dein Sensor es umgekehrt, einschalten</small></span><button class="sw ${n.invert ? "on" : ""}" data-act="efxinv" aria-pressed="${n.invert}" aria-label="Vorzeichen umkehren"></button></div>` : ""}`;
    const HB = [["hd:house", "house", "Haus"], ["hd:houseGarage", "houseGarage", "Mit Garage"], ["hd:flat", "flat", "Wohnung"], ["hd:bungalow", "bungalow", "Bungalow"]];
    const hubImg = !hub ? "" : `<div class="lsec">${ic("home", 15)}Haus-Bild</div><div class="efhb">${HB.map(([v, g, l]) => `<button class="efhbb ${n.image === v ? "sel" : ""}" data-act="efximg" data-k="${v}" aria-pressed="${n.image === v}">${this._gx(g, 40, { on: true })}<span>${l}</span></button>`).join("")}<button class="efhbb ${/^(\/local\/|https:)/.test(n.image) ? "sel" : ""}" data-act="efximgtog">${ic("image", 22)}<span>Eigenes Foto</span></button></div>
      <div class="mut sm">Ein eigenes Foto (/local/haus.jpg) wird rund zugeschnitten. Die Fenster der Haus-Bilder leuchten abends.</div>
      <div class="vrow"><span>Herkunfts-Ring<small class="mut" style="display:block">Ring um das Haus: woher der Hausverbrauch gerade kommt – Solar, Akku, Netz. Berechnet aus den Kacheln mit „Liefert“ und „Beides“.</small></span><button class="sw ${n.ring !== false ? "on" : ""}" data-act="efxring" aria-pressed="${n.ring !== false}" aria-label="Herkunfts-Ring"></button></div>`;
    const zst = hub ? "" : `<div class="lsec">${ic("image", 15)}Bild mit Zustand</div>
      <div class="vrow"><span>Läuft ab<small class="mut" style="display:block">Ab dieser Leistung zeigt das Bild „läuft“ (Trommel dreht, Lampe leuchtet)</small></span><span style="display:flex;align-items:center;gap:6px;flex:none"><input type="number" class="efli" style="width:90px" data-f="efxrun" min="1" max="5000" step="1" value="${Number(n.run_w) > 0 ? Number(n.run_w) : 10}" aria-label="Läuft ab Watt"><span class="mut">W</span></span></div>
      <div class="mut sm" style="margin:6px 0 2px">Ladestand-Ring um das Bild</div><div class="gschips">${[["", "Automatisch"], ...EF_SIDES.filter(([x]) => n[x]), ["none", "Aus"]].map(([k, l]) => chip("efxpct", k, l, (n.pct || "") === k)).join("")}</div>
      <div class="mut sm">Automatisch = der erste Wert in %, zum Beispiel Ladestand von Akku oder Auto.</div>
      <div class="lsec">${ic("list", 15)}Gruppe (mehrere Geräte als eine Kachel)</div><div class="mut sm">Zum Beispiel alle Kühlschränke: Die Kachel zeigt die Summe, „×3“ am Bild öffnet die einzelnen Geräte. Ist eine Gruppe gesetzt, ersetzt sie „Leistung“.</div>
      <div class="gschips">${(n.group || []).map((e) => `<span class="och">${esc(this._wzName(e))}<button data-act="efxgrpdel" data-k="${esc(e)}" aria-label="Entfernen">${ic("close", 12)}</button></span>`).join("")}</div>
      ${n.flow !== "split" && (n.group || []).length < 8 ? this._wzSel(ids, "", "efxgrpadd", "", "+ Gerät zur Gruppe") : ""}
      <div class="efside"><div class="mut sm" style="margin:8px 0 2px">Status-Punkt · grün läuft, gelb wartet, rot Störung</div>${this._wzSel(this._efxStIds(), n.status || "", "efxst", "", "– kein Punkt –")}</div>
      <div class="mut sm">Zum Beispiel der Status der Waschmaschine. Fehlen die Leistungswerte, zeigt die Kachel auch ohne Entität einen roten Punkt.</div>`;
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
      ${hubImg}${flow}${pw}${warn}
      <div class="lsec">${ic("sliders", 15)}Werte auf der Kachel</div>
      ${EF_SIDES.map(([s, t]) => `<div class="efside"><div class="mut sm" style="margin:6px 0 2px">${t}${hub && s === "top" ? " · Chip „Hausverbrauch heute“" : hub && s === "bottom" ? " · leer = berechneter Hausverbrauch" : ""}</div>${sel(s, hub && s === "bottom" ? "– berechnet –" : "– nichts –")}${n[s] || (hub && s === "bottom") ? lab(s) : ""}</div>`).join("")}
      ${zst}${hubx}
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
      c.nodes = { top_1: mk("top_1", { name: "PV Dach", image: "hd:pvRoof", flow: "supply" }), left_1: mk("left_1", { name: "Netz", image: "hd:grid", flow: "split", color: "#a78bfa" }), left_2: mk("left_2", { name: "Steckdose", image: "hd:plug", flow: "consume", color: "#f97316" }), right_1: mk("right_1", { name: "Auto", image: "hd:car", flow: "consume", color: "#f472b6" }), bottom: mk("bottom", { name: "Akku", image: "hd:battery", flow: "both" }) };
      this._efxPut(c).then(() => { this._render(); this._toast("Beispiel-Kacheln angelegt, jetzt Entitäten zuordnen"); this._modal = { type: "efxmgr" }; this._renderModal(); }); return;
    }
    if (a === "efxtab") { this._efT = b.dataset.v === "strom" ? "strom" : "now"; try { localStorage.setItem("fh_ef_tab", this._efT); } catch (e) { /* egal */ } this._render(); return; }
    if (a === "efxsize") { const o = ["auto", "klein", "mittel", "gross"]; this._efS = o[(o.indexOf(this._efSize()) + 1) % 4]; try { localStorage.setItem("fh_ef_size", this._efS); } catch (e) { /* egal */ } this._render(); return; }
    if (a === "efxback") { this._modal = { type: "efxmgr" }; this._renderModal(); return; }
    if (a === "efxkeep") { const c = this._efxClone(); c.keep_old = !c.keep_old; this._efxPut(c).then(() => { this._renderModal(); this._render(); this._toast(c.keep_old ? "Alte Symbole werden angezeigt" : "HD-Bilder werden angezeigt"); }); return; }
    if (a === "efxrng") { this._efPr = { range: k, off: 0 }; this._efSel = null; try { localStorage.setItem("fh_ef_rng", k); } catch (_) { /* egal */ } this._render(); return; }
    if (a === "efxoff") { const P = this._efP(); P.off = Math.min(0, P.off + Number(k)); this._efSel = null; this._render(); return; }
    if (a === "efxsel") { this._efSel = this._efSel === Number(k) ? null : Number(k); this._render(); return; }
    if (a === "efxtpl") { this._efxTpl(k); return; }
    if (a === "efxgrp") { this._modal = { type: "efxgrp", pos: k }; this._renderModal(); return; }
    if (a === "efxarr") { this._efArr = !this._efArr; this._efPick = null; this._render(); return; }
    if (a === "efxslot") { this._efxSlot(b.dataset.p); return; }
    if (a === "efxtoday") { const c = this._efxClone(); c.today = c.today === false; this._efxPut(c).then(() => { this._renderModal(); this._render(); }); return; }
    if (a === "efxgrpdel") { const m = this._modal; if (m && m.type === "efxedit") { m.draft.group = (m.draft.group || []).filter((x) => x !== k); this._renderModal(); } return; }
    if (a === "efxmob") { const o = ["fluss", "raster", "brett"]; const v = o[(o.indexOf(this._efMob()) + 1) % 3]; try { localStorage.setItem("fh_ef_mob", v); } catch (_) { /* egal */ } this._render(); return; }
    if (a === "efxall") { this._efAll = !this._efAll; this._render(); return; }
    if (["efxbanner", "efxtheme", "efxshape", "efxmobd"].includes(a)) {
      const c = this._efxClone(), f = { efxbanner: "banner", efxtheme: "theme", efxshape: "shape", efxmobd: "mobile" }[a]; c[f] = k;
      if (a === "efxmobd") { try { localStorage.removeItem("fh_ef_mob"); } catch (_) { /* egal */ } }
      this._efxPut(c).then(() => { this._renderModal(); this._render(); }); return;
    }
    if (a === "efxlines") { const c = this._efxClone(); c.lines = k === "grad" ? "grad" : "mono"; this._efxPut(c).then(() => { this._renderModal(); this._render(); }); return; }
    if (a === "efxhero") { const c = this._efxClone(); c.hero.show = !c.hero.show; this._efxPut(c).then(() => { this._renderModal(); this._render(); }); return; }
    if (a === "efxtog") { const c = this._efxClone(); if (c.nodes[k]) c.nodes[k].on = !c.nodes[k].on; this._efxPut(c).then(() => { this._renderModal(); this._render(); }); return; }
    if (a === "efxedit") {
      const c = this._efxCfg(), n = k === "hub" ? c.hub : c.nodes[k];
      this._modal = { type: "efxedit", pos: k, isNew: !n, draft: JSON.parse(JSON.stringify(n || this._efxBlank(k))) }; this._renderModal(); return;
    }
    if (!m || m.type !== "efxedit") return;
    const d = m.draft;
    if (a === "efximgtog") m.imgOpen = !m.imgOpen;
    else if (a === "efximg") { d.image = k; d.image_alt = ""; m.imgOpen = false; m.q = ""; }
    else if (a === "efxcol") d.color = k;
    else if (a === "efxflow") d.flow = k;
    else if (a === "efxinv") d.invert = !d.invert;
    else if (a === "efxcalc") d.calc = k;
    else if (a === "efxring") d.ring = d.ring === false;
    else if (a === "efxpct") d.pct = k;
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
    if (f === "efxrun") { const x = Math.round(Number(v)); if (x >= 1 && x <= 5000) d.run_w = x; return true; }
    if (f === "efxgrpadd") { const e = ent(v); d.group = d.group || []; if (e && !d.group.includes(e) && d.group.length < 8) d.group.push(e); this._renderModal(); return true; }
    if (f === "efxst") { d.status = EF_ST_RE.test(v) ? v : ""; return true; }
    if (f === "efxe") { d[t.dataset.w] = ent(v); return true; }
    if (f === "efxlab") { d[t.dataset.w + "_label"] = v.slice(0, 24); return true; }
    if (f === "efxchipadd") { const e = ent(v); if (e && !d.chips.includes(e) && d.chips.length < 4) d.chips.push(e); return true; }
    if (f === "efximgq") { m.q = v; this._renderModal(); const i = this.shadowRoot.querySelector('[data-f="efximgq"]'); if (i) { i.focus(); i.setSelectionRange(v.length, v.length); } return true; }
    if (f === "efximgc") {
      /* iPhone schreibt den Anfang groß („Mdi:…“) und Nutzer tippen gern „_“ oder Leerzeichen: mdi-Namen vereinheitlichen statt still zu ignorieren */
      let x = v.trim(); if (/^mdi\s*:/i.test(x)) x = "mdi:" + x.replace(/^mdi\s*:\s*/i, "").toLowerCase().replace(/[_\s]+/g, "-");
      if (!x) return true;
      if (/^(mdi:[a-z0-9-]{2,60}|\/local\/[A-Za-z0-9_.\/-]{1,150}|https:\/\/\S{4,200})$/.test(x)) { d.image = x; d.image_alt = ""; this._renderModal(); }
      else this._toast("Unbekanntes Format – zum Beispiel mdi:solar-panel oder /local/bild.png");
      return true;
    }
    return false;
  }
