/* Modul 20 Abrechnungen – Seite des Addons (Addon-API 1), Stufe v0.3 „Übersicht & Prognose“.
   Der Kern lädt diese Datei per import() und ruft die Funktionen mit seiner Panel-Instanz p auf.
   Daten kommen aus dem Python-Teil über api.call("abrechnung", …); gerechnet wird nur dort (logic.py).
   Register: Übersicht · Verträge · Zähler & Ablesungen · Abschläge. Rechnungen, Fahrtkosten und Vorräte folgen (v0.5). */
const ID = "abrechnung";

export default (api) => {
  const { ic, esc, num } = api;
  const SP = { strom: ["Strom", "bolt", "#fbbf24", "kWh"], gas: ["Gas", "flame", "#fb923c", "kWh"], wasser: ["Wasser & Abwasser", "water", "#38bdf8", "m³"], einspeisung: ["Einspeisung", "pvRoof", "#34d399", "kWh"] };
  const SPK = ["strom", "gas", "wasser", "einspeisung"];
  const MON = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const ART = { strom_bezug: ["Strom Bezug", "1.8.0", "meter"], strom_einsp: ["Strom Einspeisung", "2.8.0", "meter"], gas: ["Gaszähler", "m³", "flame"], wasser: ["Wasserzähler", "Haus", "water"], garten: ["Unterzähler Garten", "ohne Abwasser", "garden"] };
  const SRC = { manuell: "Manuell", sensor: "Automatisch", nfc: "NFC", foto: "Foto", rechnung: "Rechnung", start: "Startstand", geschaetzt: "Geschätzt" };
  const TPL = [
    ["fix", "Fixpreis", { sparte: "strom", tarif: "Fix", verl: 12, frist: 4, p: { ap: "", gp: "", mess: "" } }],
    ["dyn", "Tibber dynamisch", { sparte: "strom", anbieter: "Tibber", tarif: "dynamisch", zahl: "monat", verl: 0, frist: 2, p: { mode: "dyn", auf: "", gp: "" } }],
    ["grund", "Grundversorgung", { sparte: "strom", tarif: "Grundversorgung", verl: 0, frist: 2, p: { ap: "", gp: "" } }],
    ["gas", "Gas Fixpreis", { sparte: "gas", tarif: "Erdgas Fix", verl: 1, frist: 4, p: { ap: "", gp: "" } }],
    ["wasser", "Gemeinde Wasser", { sparte: "wasser", tarif: "Gebührenbescheid", p: { frisch: "", abw: "", zg: "", brutto: false, ust: 7 } }],
    ["eeg", "EEG-Einspeisung", { sparte: "einspeisung", anbieter: "Netzbetreiber", tarif: "EEG", p: { ap: "", ust: 0 } }]];
  const S = (p) => (p._adX = p._adX || {})[ID] || (p._adX[ID] = { d: null, ts: 0, busy: false, tab: "ov", cid: "", mid: "", csp: "", cmon: -1, asp: "", iid: "", fkp: "jahr", trip: "", lk: {}, deep: false });
  const visible = (p) => (p._mdActive && p._mdActive() === ID && !p._stOpen) || (p._modal && p._modal.type === "adx" && p._modal.id === ID);
  const rer = (p) => { if (visible(p)) { p._render(); if (p._modal && p._modal.type === "adx") p._renderModal(); } };
  const load = (p, force) => {
    const s = S(p); if (s.busy) return;
    if (!force && s.d && Date.now() - s.ts < 60000) return;
    s.busy = true;
    api.call(ID, "get", {}).then((d) => { s.d = d; s.ts = Date.now(); s.err = ""; }).catch((e) => { s.err = (e && e.message) || "Keine Antwort"; s.ts = Date.now(); }).finally(() => { s.busy = false; rer(p); });
  };
  const send = (p, cmd, data, ok, then) => api.call(ID, cmd, data).then((d) => { const s = S(p); if (d && d.cards) { s.d = d; s.ts = Date.now(); } if (then) then(d); else { if (ok) p._toast(ok); p._modal = null; p._renderModal(); p._render(); } })
    .catch((e) => p._toast((e && e.message) || "Das hat nicht geklappt"));

  /* ---------- Helfer ---------- */
  const pn = (v) => { const t = String(v == null ? "" : v).trim().replace(/\s/g, ""); if (!t) return null; const x = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t); return isFinite(x) ? x : null; };
  const de = (iso) => { if (!iso) return "–"; const [y, m, d] = String(iso).slice(0, 10).split("-"); return `${d}.${m}.${y}`; };
  const deS = (iso) => { if (!iso) return "–"; const [, m, d] = String(iso).slice(0, 10).split("-"); return `${d}.${m}.`; };
  const iso = (t) => { const m = /^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/.exec(String(t || "").trim()); if (!m) return /^\d{4}-\d{2}-\d{2}$/.test(String(t || "")) ? t : ""; const y = m[3].length === 2 ? "20" + m[3] : m[3]; return `${y}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`; };
  const eur = (v) => `${num(v, 2)} €`;
  const ct = (v, unit) => (v == null ? "–" : unit === "m³" ? `${num(v / 100, 2)} €/m³` : `${num(v, 2)} ct/${unit}`);
  const mask = (t) => { const x = String(t || ""); return x.length > 4 ? x.slice(0, 4) + "-••••" : x; };
  const gx = (p, k, s, o) => (p._gx ? p._gx(k, s, o || { on: 1 }) : "") || ic("energy", s);
  const C = (D, id) => (D.contracts || []).find((c) => c.id === id);
  const M = (D, id) => (D.meters || []).find((m) => m.id === id);
  const cname = (c) => c.tarif || c.anbieter || SP[c.sparte][0];
  const btn = (a, icn, t, o = {}) => `<button class="btn2${o.pri ? " pri" : ""}${o.dng ? " dng" : ""}" data-act="adxa" data-ad="${ID}" data-a="${a}"${o.k != null ? ` data-k="${esc(o.k)}"` : ""}${o.v != null ? ` data-v="${esc(o.v)}"` : ""}${o.dis ? " disabled" : ""}>${icn ? ic(icn, 16) + " " : ""}${t}</button>`;
  const chip = (a, k, t, sel, v) => `<button class="gsch ${sel ? "sel" : ""}" data-act="adxa" data-ad="${ID}" data-a="${a}" data-k="${esc(k)}"${v != null ? ` data-v="${esc(v)}"` : ""} aria-pressed="${!!sel}">${t}</button>`;
  const inp = (k, lab, val, o = {}) => `<label class="abf${o.wide ? " w" : ""}"><span>${lab}${o.unit ? ` <em>${o.unit}</em>` : ""}</span><input data-f="adxf" data-ad="${ID}" data-k="${k}" type="text" ${o.num ? 'inputmode="decimal"' : ""} value="${esc(val == null ? "" : val)}" placeholder="${esc(o.ph || "")}" maxlength="${o.max || 40}" autocomplete="off"></label>`;
  const nv = (v, d = 2) => (v == null || v === "" ? "" : typeof v === "number" ? num(v, d) : v);
  /* Rollenzählwerk: Vorkommastellen dunkel, Nachkommastellen rot wie am echten Zähler */
  const rolls = (m, v) => {
    if (v == null) return `<div class="abroll"><span class="e">noch kein Stand</span></div>`;
    const dec = Math.min(m.dec, 3), [a, b = ""] = Number(v).toFixed(dec).split("."), ip = a.padStart(m.digits, "0").slice(-Math.max(m.digits, a.length));
    return `<div class="abroll" role="img" aria-label="Zählerstand ${num(v, dec)} ${m.unit}">${[...ip].map((c) => `<i>${c}</i>`).join("")}${[...b].map((c) => `<i class="r">${c}</i>`).join("")}</div>`;
  };

  /* ---------- Banner (v0.3): die eine Antwort zuerst, rechts die Abrechnungs-Szene mit einem Ring je Sparte ---------- */
  const sg = (x, d = 0) => `${x > 0 ? "+" : x < 0 ? "−" : "±"}${num(Math.abs(x), d)} €`;
  const ring = (pct, col, inner, lab, sz = 84) => { const r = 34, C = 2 * Math.PI * r, L = C * Math.max(0, Math.min(1, pct)); return `<div class="abring"><svg viewBox="0 0 86 86" width="${sz}" height="${sz}" aria-hidden="true"><circle cx="43" cy="43" r="${r}" class="rb"/><circle cx="43" cy="43" r="${r}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${L.toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 43 43)"/><text x="43" y="48" text-anchor="middle">${esc(inner)}</text></svg><span>${esc(lab)}</span></div>`; };
  const ringsOf = (D) => SPK.filter((k) => k !== "einspeisung" && D.cards[k] && D.cards[k].fc).map((k) => { const f = D.cards[k].fc, col = SP[k][2], nm = SP[k][0].split(" ")[0];
    if (f.deckung != null) return ring(f.deckung / 100, col, `${f.deckung} %`, `${nm} gedeckt`);
    if (f.zahl === "monat") return ring(f.vergangen / f.tage, col, `${num(f.total, 0)} €`, `${nm} ${MON[+f.start.slice(5, 7) - 1]}`);
    return ring(f.vergangen / f.tage, col, `${num(f.total, 0)} €`, `${nm} Jahr`); });
  const hero = (p, D) => {
    const S0 = D.sum || {}, nx = (D.events || [])[0], has = S0.ergebnis != null, rings = ringsOf(D);
    const parts = SPK.filter((k) => k !== "einspeisung" && D.cards[k] && D.cards[k].fc).map((k) => { const f = D.cards[k].fc, nm = SP[k][0].split(" ")[0];
      return f.ergebnis != null ? `${nm} ${sg(f.ergebnis)} ${f.ergebnis >= 0 ? "Guthaben" : "Nachzahlung"}` : f.zahl === "monat" ? `${nm} monatlich, ${num(f.total, 0)} € im ${MON[+f.start.slice(5, 7) - 1]}` : `${nm} ${num(f.total, 0)} € erwartet`; });
    const big = has ? `${sg(S0.ergebnis)}` : !D.contracts.length && !D.meters.length ? "Noch nichts angelegt" : `${D.contracts.filter((c) => c.aktiv).length} ${D.contracts.filter((c) => c.aktiv).length === 1 ? "Vertrag" : "Verträge"} · ${D.meters.length} Zähler`;
    const sub = !D.contracts.length ? "Lege zuerst einen Vertrag an – danach rechnen alle Module mit deinem Preis." : parts.length ? parts.join(" · ") : nx ? `Als Nächstes: ${nx.t} · ${de(nx.d)}` : "Trage beim Vertrag einen Abschlag ein, dann siehst du hier, ob es reicht.";
    const fk = (D.fahrzeuge || []).filter((v) => (v.jahr.e100 != null ? v.jahr : v.d30).e100 != null), vlow = (D.vorraete || []).filter((x) => x.brennstoff && x.st.reicht_bis).sort((a, b) => a.st.reicht_bis.localeCompare(b.st.reicht_bis))[0];
    const extra = [fk.length ? `<span class="chip">${gx(p, "car", 16)}${fk.map((v) => num((v.jahr.e100 != null ? v.jahr : v.d30).e100, 2)).join(" / ")} € je 100 km</span>` : "", vlow ? `<span class="chip">${gx(p, "flame", 16)}${esc(vlow.name)} reicht bis ${MON[+vlow.st.reicht_bis.slice(5, 7) - 1].slice(0, 3)}</span>` : ""].filter(Boolean);
    const chips = SPK.filter((k) => D.cards[k]).map((k) => { const u = D.cards[k].u, f = D.cards[k].fc; return `<span class="chip">${gx(p, SP[k][1], 16)}${k === "einspeisung" && f ? `Einspeisung ≈ ${num(f.total, 0)} €` : `${SP[k][0].split(" ")[0]} ${u && u.ct != null ? ct(u.ct, u.unit) : "dynamisch"}`}</span>`; });
    const scene = rings.length ? `<div class="absc" aria-hidden="true"><div class="abhouse">${gx(p, "house", 118)}<div class="absy">${SPK.filter((k) => k !== "einspeisung" && D.cards[k]).map((k) => gx(p, SP[k][1], 30)).join("")}</div></div><div class="abrings n${rings.length}">${rings.join("")}</div></div>` : "";
    return `<div class="card hero mh hr a-${ID}${scene ? " abhs" : ""}">${p._modLogo(ID)}${scene}<div class="lbl">${ic("euro", 16)}${has ? `Abrechnungsjahr · Stand ${de(D.today)}` : "Abrechnungen"}</div><div class="big${has ? "" : " bs"}">${esc(big)}${has ? `<small>${S0.ergebnis >= 0 ? "voraussichtlich zurück" : "Nachzahlung erwartet"}</small>` : ""}</div><div class="sub">${esc(sub)}${has && S0.lo != null ? `<span class="abband">Bandbreite ${sg(S0.lo)} bis ${sg(S0.hi)}</span>` : ""}</div>
      ${chips.length || extra.length ? `<div class="chips">${chips.join("")}${extra.join("")}</div>` : ""}${rings.length ? `<div class="abrm">${rings.join("")}</div>` : ""}<div class="abhb">${btn("read", "gauge", "Zählerstand erfassen", { pri: 1, dis: !D.meters.length })}${p._admin() ? btn("cnew", "plus", "Vertrag hinzufügen") : ""}</div></div>`;
  };
  const tabs = (s) => `<div class="abtabs" role="tablist">${[["ov", "Übersicht"], ["con", "Verträge"], ["met", "Zähler & Ablesungen"], ["ab", "Abschläge"], ["inv", "Rechnungen"], ["fk", "Fahrtkosten"], ["vr", "Vorräte"]].map(([k, l]) => `<button class="${s.tab === k ? "on" : ""}" role="tab" aria-selected="${s.tab === k}" data-act="adxa" data-ad="${ID}" data-a="tab" data-k="${k}">${l}</button>`).join("")}</div>`;

  /* ---------- Übersicht ---------- */
  /* Spartenkarte 2.0: vier Kennzahlen, Deckungsbalken, Ampel in Worten. Ohne Hochrechnung die Preise wie in v0.1. */
  const spCard = (p, D, k) => {
    const X = D.cards[k], [nm, g, col, unit] = SP[k];
    if (!X) return `<div class="abc empty" style="--c:${col}"><div class="abch">${gx(p, g, 40, { on: 0 })}<div><b>${nm}</b><small>kein Vertrag</small></div></div><div class="mut sm">${k === "einspeisung" ? "Vergütung für eingespeisten Solarstrom." : `Ohne Vertrag rechnen die Module ${k === "strom" ? "mit den Haus-Werten" : "ohne Preis"}.`}</div>${p._admin() ? `<div class="abcb">${btn("cnew", "plus", "Vertrag anlegen", { k })}</div>` : ""}</div>`;
    const c = C(D, X.id), u = X.u || {}, f = X.fc, row = (l, v, cl) => `<div class="abr"><span>${l}</span><b${cl ? ` class="${cl}"` : ""}>${v}</b></div>`;
    const price = u.dyn ? (u.ct != null ? `${num(u.ct, 2)} ct/kWh jetzt` : "Börsenpreis + Aufschlag") : k === "wasser" ? `${num(u.teile.frisch + u.teile.abw, 2)} €/m³` : ct(u.ct, unit);
    const head = `<div class="abch">${gx(p, g, 44)}<div><b>${nm}</b><small>${esc([c.anbieter, c.tarif].filter(Boolean).join(" · ") || "Vertrag")} · ${esc(price)}</small></div></div>`;
    if (!f) return `<div class="abc" style="--c:${col}" data-act="adxa" data-ad="${ID}" data-a="csel" data-k="${esc(c.id)}" role="button" tabindex="0">${head}<div class="mut sm">Keine Hochrechnung möglich.</div></div>`;
    const end = de(new Date(Date.parse(f.ende) - 864e5).toISOString().slice(0, 10)).slice(0, 6), mo = MON[+f.start.slice(5, 7) - 1], prog = Math.round(f.vergangen / f.tage * 100);
    const nPlan = f.abschlaege.filter((x) => x.bezahlt && x.betrag > 0).length;
    let rows, bar, foot, amp;
    if (k === "einspeisung") {
      rows = [row("Gutschrift bisher", eur(f.bisher)), row("eingespeist", `${num(f.menge_bisher, 0)} kWh`), row(`Hochrechnung bis ${end}`, eur(f.total)), row("Vergütung", ct(u.ct, "kWh"))];
      bar = prog; foot = [`Zeitraum ${prog} %`, ""]; amp = ["ok", `≈ ${num(f.total, 0)} € Gutschrift erwartet`];
    } else if (f.zahl === "monat") {
      const cmp = k === "strom" && D.dyncmp && D.dyncmp.diff_monat != null ? D.dyncmp.diff_monat : null;
      rows = [row(`${mo} bisher`, eur(f.bisher)), row("Ø Preis inkl. Grundpreis", f.avg_ct != null ? `${num(f.avg_ct, 1)} ct/kWh` : "–"), row(`Hochrechnung ${mo}`, eur(f.total)), cmp != null ? row("Gegenüber festem Preis", `${num(Math.abs(cmp), 0)} € ${cmp >= 0 ? "günstiger" : "teurer"}/Monat`, cmp >= 0 ? "ok" : "bad") : row(`${unit === "kWh" ? "Verbrauch" : "Menge"} bisher`, `${num(f.menge_bisher, 0)} ${f.unit}`)];
      bar = prog; foot = [`${f.vergangen} von ${f.tage} Tagen`, ""]; amp = ["ok", "Im Plan · monatliche Rechnung"];
    } else if (f.ab_total > 0) {
      rows = [row("Kosten bisher", eur(f.bisher)), row(`Abschläge gezahlt (${nPlan})`, eur(f.gezahlt)), row(`Hochrechnung bis ${end}`, eur(f.total)), row(`Abschläge bis ${end}`, eur(f.ab_total))];
      bar = Math.min(100, f.deckung || 0); foot = [`${de(f.start).slice(0, 6)}–${end} · ${prog} %`, `${f.deckung} % gedeckt`];
      const e = f.empf && f.empf.show ? ` · Abschlag ${f.empf.diff > 0 ? "+" : "−"}${num(Math.abs(f.empf.diff), 0)} € empfohlen` : "";
      const band = Math.round((f.erg_hi - f.erg_lo) / 2);
      amp = f.ergebnis >= 0 ? ["ok", `${sg(f.ergebnis)} Guthaben erwartet (± ${num(band, 0)} €)${e}`] : ["wa", `${sg(f.ergebnis)} Nachzahlung erwartet (± ${num(band, 0)} €)${e}`];
    } else {
      rows = [row("Kosten bisher", eur(f.bisher)), row(`Hochrechnung bis ${end}`, eur(f.total)), row("Verbrauch erwartet", `${num(f.jahr_v, 0)} ${unit} im Jahr`), row("Abschlag", "keiner eingetragen")];
      bar = prog; foot = [`Zeitraum ${prog} %`, ""]; amp = ["mu", `Ohne Abschlag: ${num(f.total, 0)} € fällig mit der Rechnung`];
    }
    const note = f.basis === "jahresverbrauch" ? `<div class="mut sm abhint">${ic("info", 14)} Geschätzt aus dem Jahresverbrauch – mit zwei Ablesungen wird es genauer.</div>` : f.geschaetzt ? `<div class="mut sm">bis heute geschätzt aus der letzten Ablesung</div>` : "";
    return `<div class="abc" style="--c:${col}" data-act="adxa" data-ad="${ID}" data-a="csel" data-k="${esc(c.id)}" role="button" tabindex="0">${head}${rows.join("")}
      <div class="abbar"><i style="width:${bar}%"></i></div><div class="abbf"><span>${foot[0]}</span><span>${foot[1]}</span></div><div class="abamp ${amp[0]}"><i></i>${esc(amp[1])}</div>${note}</div>`;
  };
  /* Jahreskurve: Kosten gemessen (Linie) gegen gezahlte Abschläge (Treppe), Hochrechnung gestrichelt mit Bandbreite. Antippen zeigt den Monat. */
  const curve = (p, D, s) => {
    const ks = SPK.filter((k) => k !== "einspeisung" && D.cards[k] && D.cards[k].fc && D.cards[k].fc.zahl !== "monat");
    const all = SPK.filter((k) => D.cards[k] && D.cards[k].fc);
    const k = all.includes(s.csp) ? s.csp : ks[0] || all[0]; if (!k) return "";
    const f = D.cards[k].fc, ms = f.monate, col = SP[k][2], W = p._narrow ? 380 : 640, H = p._narrow ? 230 : 220, pl = 46, pb = 24, pt = 14;
    const ti = ms.findIndex((m) => m.anteil > 0 && m.anteil < 1), tIdx = ti >= 0 ? ti : ms.filter((m) => m.anteil >= 1).length - 1;
    const mx = Math.max(10, ...ms.map((m) => m.cum_k + m.u), ...ms.map((m) => m.cum_z)) * 1.08, step = mx > 2000 ? 500 : mx > 800 ? 200 : mx > 300 ? 100 : mx > 120 ? 50 : 20;
    const X = (i) => pl + i * (W - pl - 8) / ms.length, Y = (v) => pt + (H - pb - pt) * (1 - v / mx), P = (pts) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const grid = []; for (let v = 0; v <= mx; v += step) grid.push(`<line x1="${pl}" x2="${W - 8}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="gl"/><text x="${pl - 6}" y="${(Y(v) + 3.5).toFixed(1)}" text-anchor="end" class="tx">${num(v, 0)} €</text>`);
    const cumPrev = (i) => (i > 0 ? ms[i - 1].cum_k : 0);
    const meas = [[X(0), Y(0)]]; ms.forEach((m, i) => { if (m.anteil >= 1) meas.push([X(i + 1), Y(m.cum_k)]); });
    const tx = tIdx >= 0 && ti >= 0 ? X(ti) + (X(ti + 1) - X(ti)) * ms[ti].anteil : X(ms.filter((m) => m.anteil >= 1).length);
    if (ti >= 0) meas.push([tx, Y(cumPrev(ti) + ms[ti].k_bis)]);
    const fcs = [meas[meas.length - 1]], hi = [], lo = [];
    ms.forEach((m, i) => { if (m.anteil < 1) { fcs.push([X(i + 1), Y(m.cum_k)]); hi.push([X(i + 1), Y(m.cum_k + m.u)]); lo.push([X(i + 1), Y(Math.max(0, m.cum_k - m.u))]); } });
    const band = hi.length ? `<polygon points="${P([fcs[0], ...hi, ...lo.reverse(), fcs[0]])}" fill="${col}" opacity=".16"/>` : "";
    const stp = [[X(0), Y(0)]]; let cz = 0; ms.forEach((m, i) => { (f.abschlaege || []).filter((x) => x.d.slice(0, 7) === m.m && x.betrag > 0).forEach((x) => { const xx = X(i) + (X(i + 1) - X(i)) * ((+x.d.slice(8, 10) - 1) / 30); stp.push([xx, Y(cz)]); cz += x.betrag; stp.push([xx, Y(cz)]); }); }); stp.push([X(ms.length), Y(cz)]);
    const ab = f.ab_total > 0 ? `<polyline points="${P(stp)}" fill="none" stroke="#fcd34d" stroke-width="2"/>` : "";
    const lab = ms.map((m, i) => `<text x="${((X(i) + X(i + 1)) / 2).toFixed(1)}" y="${H - 7}" text-anchor="middle" class="tx${i === s.cmon ? " on" : ""}">${m.l}</text>`).join("");
    const hit = ms.map((m, i) => `<rect x="${X(i).toFixed(1)}" y="${pt}" width="${(X(i + 1) - X(i)).toFixed(1)}" height="${H - pt}" class="hit${i === s.cmon ? " on" : ""}" data-act="adxa" data-ad="${ID}" data-a="cmon" data-k="${i}"><title>${m.l}</title></rect>`).join("");
    const endY = Y(ms[ms.length - 1].cum_k), endZ = Y(f.ab_total);
    const erg = f.ergebnis != null ? `<text x="${W - 12}" y="${(Math.min(endY, endZ) - 8).toFixed(1)}" text-anchor="end" class="tx b ${f.ergebnis >= 0 ? "ok" : "wa"}">${sg(f.ergebnis)}</text>` : "";
    const sel = ms[s.cmon], det = sel ? `<div class="abmd"><b>${MON[+sel.m.slice(5, 7) - 1]} ${sel.m.slice(0, 4)}</b><span>Kosten ${eur(sel.kosten)}${sel.anteil >= 1 ? " · gemessen" : sel.anteil > 0 ? ` · davon ${eur(sel.k_bis)} bis heute` : " · hochgerechnet"}</span><span>Abschlag ${eur(sel.zahl)}</span><span>Summe bis Monatsende ${eur(sel.cum_k)}${f.ab_total > 0 ? ` · gezahlt ${eur(sel.cum_z)}` : ""}</span></div>` : `<div class="mut sm abmd0">Tippe auf einen Monat für die Werte.</div>`;
    return `<div class="card abcur"><h2>${ic("chart", 18)}${SP[k][0].split(" ")[0]} · Kosten${f.ab_total > 0 ? " und Abschläge" : ""} ${f.zahl === "monat" ? `im ${MON[+f.start.slice(5, 7) - 1]}` : "im Abrechnungsjahr"}<span class="hzrt"><span class="gschips">${all.map((x) => chip("csp", x, SP[x][0].split(" ")[0], x === k)).join("")}</span></span></h2>
      <svg viewBox="0 0 ${W} ${H}" class="abch2" role="img" aria-label="Jahreskurve ${esc(SP[k][0])}">${grid.join("")}${lab}${band}${ab}<polyline points="${P(meas)}" fill="none" stroke="${col}" stroke-width="3" stroke-linejoin="round"/><polyline points="${P(fcs)}" fill="none" stroke="${col}" stroke-width="2.5" stroke-dasharray="6 5"/>
      ${ti >= 0 ? `<line x1="${tx.toFixed(1)}" x2="${tx.toFixed(1)}" y1="${pt}" y2="${H - pb}" class="now"/><text x="${(tx + 4).toFixed(1)}" y="${pt + 9}" class="tx">heute</text>` : ""}<circle cx="${(W - 8).toFixed(1)}" cy="${endY.toFixed(1)}" r="4" fill="${col}"/>${f.ab_total > 0 ? `<circle cx="${(W - 8).toFixed(1)}" cy="${endZ.toFixed(1)}" r="4" fill="#fcd34d"/>` : ""}${erg}${hit}</svg>
      <div class="ablg"><span><i style="background:${col}"></i>Kosten gemessen</span>${f.ab_total > 0 ? `<span><i style="background:#fcd34d"></i>Abschläge</span>` : ""}<span><i class="d" style="border-color:${col}"></i>Hochrechnung ± ${f.pct} %</span><span class="mut">${f.profil === "vorjahr" ? "Verteilung wie im Vorjahr" : "Verteilung nach Standardprofil"}</span></div>${det}</div>`;
  };
  /* Dynamisch oder fest: eigener Netzbezug je Stunde × Börsenpreis der Stunde gegen festen Vergleichspreis (letzte 30 Tage) */
  const dynCard = (p, D) => {
    const s0 = D.cards.strom; if (!s0 || !s0.u || !s0.u.dyn) return "";
    const r = D.dyncmp, v = D.opts.vgl, adm = p._admin();
    const body = !D.tibber || !D.ebuch ? `<div class="mut sm">${ic("info", 14)} Für den Vergleich braucht Modul 20 die Tibber-Verbindung (Einstellungen → Integrationen) und das Haus-Energiebuch (Einstellungen → Haus → Energiequellen). Bis dahin rechnet die Hochrechnung mit dem Preis der aktuellen Stunde.</div>`
      : !r ? `<div class="mut sm">Der Vergleich wird gerade aus den letzten 30 Tagen berechnet …</div>`
        : `<div class="abr"><span>Netzbezug ${num(r.tage, 0)} Tage</span><b>${num(r.kwh, 0)} kWh</b></div><div class="abr"><span>Dein Ø Preis inkl. Aufschlag</span><b class="hl">${num(r.avg_ct, 1)} ct/kWh</b></div><div class="abr"><span>Ø Börsenpreis + Aufschlag</span><b>${num(r.mittel_ct, 1)} ct/kWh</b></div><div class="abr"><span>Bezug in günstigen Stunden</span><b>${r.guenstig} %</b></div>
          ${r.fix != null ? `<div class="abvs"><div><small>dynamisch</small><b>${eur(r.dyn)}</b></div><div><small>${esc((v && v.name) || "fester Preis")} ${num(v.ap, 1)} ct</small><b>${eur(r.fix)}</b></div><div class="${r.diff >= 0 ? "ok" : "wa"}"><small>${r.diff >= 0 ? "dynamisch spart" : "fest wäre günstiger"}</small><b>${num(Math.abs(r.diff_monat), 0)} €/Monat</b></div></div>` : `<div class="mut sm">Trage einen festen Vergleichspreis ein, dann siehst du, was dir der dynamische Tarif bringt.</div>`}
          ${r.abdeckung < 90 ? `<div class="mut sm">Preise für ${r.abdeckung} % des Bezugs vorhanden.</div>` : ""}`;
    return `<div class="card"><h2>${ic("bolt", 18)}Dynamisch oder fest?<span class="hzrt">eigenes Stundenprofil</span></h2>${body}${adm ? `<div class="gbtns" style="margin-top:10px">${btn("vgl", "pencil", v ? "Vergleichspreis ändern" : "Vergleichspreis eintragen")}</div>` : ""}</div>`;
  };
  const evCard = (D) => `<div class="card"><h2>${ic("clock", 18)}Als Nächstes<span class="hzrt">${(D.events || []).length} ${(D.events || []).length === 1 ? "Termin" : "Termine"}</span></h2>${(D.events || []).length ? D.events.slice(0, 6).map((e) => `<div class="abev ${e.c}${e.k === "ablesen" || e.k === "vorrat" ? " lnk" : ""}"${e.k === "ablesen" ? ` data-act="adxa" data-ad="${ID}" data-a="read" data-k="${esc(e.m)}" role="button"` : e.k === "vorrat" ? ` data-act="adxa" data-ad="${ID}" data-a="tab" data-k="vr" role="button"` : ""}><span class="abei">${ic(e.k === "preis" ? "chart" : e.k === "eich" ? "gauge" : e.k === "garantie" ? "shield" : e.k === "abschlag" ? "euro" : e.k === "ablesen" ? "gauge" : e.k === "vorrat" ? "package" : "clock", 18)}</span><span class="abet"><b>${esc(e.t)}</b><small>${esc(e.s)}</small></span><span class="abed"><b>${e.tage <= 0 ? "heute" : e.tage < 60 ? `in ${e.tage} Tagen` : de(e.d)}</b>${e.tage > 0 && e.tage < 60 ? `<small>${de(e.d)}</small>` : ""}</span></div>`).join("") : `<div class="mut sm">Keine Fristen in den nächsten Monaten. Trage Laufzeit und Kündigungsfrist im Vertrag ein, dann erscheinen sie hier.</div>`}</div>`;
  const svcCard = (p, D) => {
    const mg = D.managed || {}, s = D.cards.strom, row = (l, v, src) => `<div class="abr"><span>${l}</span><b>${v}<em class="absrc ${src === "Modul 20" ? "m" : ""}">${src}</em></b></div>`;
    const sp = (k, l) => { const X = D.cards[k], u = X && X.u; return row(l, u && u.ct != null ? ct(u.ct, u.unit) : k === "strom" ? ct(D.haus.price, "kWh") : k === "einspeisung" ? ct(D.haus.feed, "kWh") : "–", u && u.ct != null ? "Modul 20" : k === "strom" && D.tibber ? "Tibber" : k === "strom" || k === "einspeisung" ? "Haus-Werte" : "kein Preis"); };
    return `<div class="card"><h2>${ic("link", 18)}Preise für alle Module<span class="hzrt">Preisdienst</span></h2>${sp("strom", "Strom")}${sp("einspeisung", "Einspeisung")}${sp("gas", "Gas")}${sp("wasser", "Wasser")}
      <div class="vrow"><span>Vertragspreis an die Module geben<small class="mut" style="display:block">Schreibt den festen Strompreis und die Vergütung in Einstellungen → Haus-Werte. Aus: Der Stand von vorher kommt zurück.</small></span><button class="sw ${D.opts.mirror ? "on" : ""}" data-act="adxa" data-ad="${ID}" data-a="mirror" aria-pressed="${!!D.opts.mirror}" aria-label="Vertragspreis an die Module geben" ${p._admin() ? "" : "disabled"}></button></div>
      <div class="mut sm">${mg.price || mg.feed ? `${ic("check", 14)} Haus-Werte werden gerade von Modul 20 gepflegt: ${[mg.price ? "Strompreis" : "", mg.feed ? "Einspeisevergütung" : ""].filter(Boolean).join(" und ")}.` : s && s.u && s.u.dyn ? "Dein Stromvertrag ist dynamisch: Der Preis der Stunde kommt weiter von Tibber." : "Gas- und Wasserpreise nutzen die anderen Module ab der Stufe „Anbindung Module“ (v0.7)."}</div></div>`;
  };
  const stages = `<div class="card abnext"><h2>${ic("layers", 18)}So geht es weiter</h2><div class="abst">${[["v0.1", "Grundgerüst", "Verträge, Zähler, Ablesungen, Preisdienst", 1], ["v0.3", "Übersicht & Prognose", "„Bekomme ich Geld zurück?“, Abschläge, Jahreskurve", 1], ["v0.5", "Rechnungen", "Rechnungsprüfung, Fahrtkosten, Vorräte", 1], ["v0.7", "Anbindung Module", "Alle Module rechnen mit Vertragspreisen", 0]].map(([v, t, d, on]) => `<div class="${on ? "on" : ""}"><em>${v}</em><b>${t}</b><small>${d}</small></div>`).join("")}</div></div>`;
  const overview = (p, D, s) => { const dc = dynCard(p, D);
    return `<div class="abgrid">${SPK.map((k) => spCard(p, D, k)).join("")}</div><div class="ab2 w">${curve(p, D, s) || `<div class="card empty">${ic("chart", 30)}<div class="mut sm" style="margin-top:6px">Die Jahreskurve erscheint, sobald ein Vertrag angelegt ist.</div></div>`}${evCard(D)}</div><div class="ab2">${svcCard(p, D)}${dc || stages}</div>${dc ? stages : ""}`; };

  /* ---------- Abschläge (v0.3) ---------- */
  const AST = { plan: "geplant", gebucht: "gebucht", extra: "Sonderzahlung" };
  const bars = (p, D, k, f) => {
    const col = SP[k][2], q = f.abschlaege.some((x) => x.src === "plan") && (C(D, D.cards[k].id).abschlag || {}).rhythmus === "quartal";
    const grp = []; f.monate.forEach((m, i) => { const g = q ? Math.floor(i / 3) : i; (grp[g] = grp[g] || { l: q ? `Q${g + 1}` : m.l, k: 0, z: 0, fut: 0, n: 0 }); grp[g].k += m.kosten; grp[g].z += m.zahl; grp[g].fut += m.anteil < 1 ? m.kosten - m.k_bis : 0; grp[g].n++; });
    const W = p._narrow ? 380 : 640, H = 230, pl = 14, pb = 26, mx = Math.max(10, ...grp.map((g) => Math.max(g.k, g.z))) * 1.15, bw = (W - pl - 10) / grp.length, Y = (v) => 12 + (H - pb - 12) * (1 - v / mx);
    const b = grp.map((g, i) => { const x = pl + i * bw, w = Math.min(24, bw * .34), gap = 3, kz = g.k - g.fut;
      return `<rect x="${(x + bw / 2 - w - gap / 2).toFixed(1)}" y="${Y(g.z).toFixed(1)}" width="${w.toFixed(1)}" height="${(H - pb - Y(g.z)).toFixed(1)}" rx="4" fill="#fcd34d"/>
        <rect x="${(x + bw / 2 + gap / 2).toFixed(1)}" y="${Y(kz).toFixed(1)}" width="${w.toFixed(1)}" height="${(H - pb - Y(kz)).toFixed(1)}" rx="4" fill="${col}"/>${g.fut > 0 ? `<rect x="${(x + bw / 2 + gap / 2).toFixed(1)}" y="${Y(g.k).toFixed(1)}" width="${w.toFixed(1)}" height="${(Y(kz) - Y(g.k)).toFixed(1)}" rx="4" fill="${col}" opacity=".3" stroke="${col}" stroke-dasharray="3 3"/>` : ""}
        ${grp.length <= 6 ? `<text x="${(x + bw / 2 - w / 2 - gap / 2).toFixed(1)}" y="${(Y(g.z) - 5).toFixed(1)}" text-anchor="middle" class="tx">${num(g.z, 0)}</text><text x="${(x + bw / 2 + w / 2 + gap / 2).toFixed(1)}" y="${(Y(g.k) - 5).toFixed(1)}" text-anchor="middle" class="tx">${num(g.k, 0)}</text>` : ""}
        <text x="${(x + bw / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle" class="tx">${g.l}</text>`; }).join("");
    return `<svg viewBox="0 0 ${W} ${H}" class="abch2" role="img" aria-label="Abschlag gegen Kosten"><line x1="${pl}" x2="${W - 10}" y1="${H - pb}" y2="${H - pb}" class="gl"/>${b}</svg>
      <div class="ablg"><span><i style="background:#fcd34d"></i>Abschlag</span><span><i style="background:${col}"></i>Kosten gemessen</span><span><i class="h" style="background:${col}"></i>Hochrechnung</span><span class="mut">${q ? "je Quartal" : "je Monat"} · Beträge in €</span></div>`;
  };
  const payments = (p, D, s) => {
    const ks = SPK.filter((k) => k !== "einspeisung" && D.cards[k] && D.cards[k].fc && D.cards[k].fc.zahl !== "monat");
    if (!ks.length) return `<div class="card empty">${gx(p, "euro", 44)}<div style="margin:10px 0 4px;font-weight:700">Keine Abschläge</div>Abschläge gibt es bei jährlicher Abrechnung. Trage beim Vertrag den Abschlag ein – monatlich abgerechnete Tarife wie Tibber brauchen keinen.</div>`;
    const k = ks.includes(s.asp) ? s.asp : ks.find((x) => D.cards[x].fc.empf && D.cards[x].fc.empf.show) || ks[0], X = D.cards[k], f = X.fc, c = C(D, X.id), e = f.empf, adm = p._admin(), nm = SP[k][0].split(" ")[0];
    const sw = `<div class="gschips">${ks.map((x) => chip("asp", x, SP[x][0].split(" ")[0], x === k)).join("")}</div>`;
    const endD = de(new Date(Date.parse(f.ende) - 864e5).toISOString().slice(0, 10));
    const rec = !f.ab_total ? `<div class="mut sm">Für ${nm} ist noch kein Abschlag eingetragen.</div>${adm ? `<div class="gbtns" style="margin-top:10px">${btn("abnew", "plus", "Abschlag eintragen", { pri: 1, k })}</div>` : ""}`
      : e && e.neu == null ? `<div class="abem">${gx(p, SP[k][1], 54)}<div><small>Alle Abschläge bis ${endD} sind bezahlt</small><b class="${f.ergebnis >= 0 ? "ok" : "wa"}">${sg(f.ergebnis)}</b><small>${f.ergebnis >= 0 ? "Guthaben" : "Nachzahlung"} mit der Rechnung erwartet · fürs nächste Jahr passen etwa <b class="in">${num(e.next, 0)} € ${e.rhythmus === "quartal" ? "je Quartal" : "im Monat"}</b></small></div></div>`
      : `<div class="abem">${gx(p, SP[k][1], 54)}<div><small>${e && e.show ? (e.diff > 0 ? `${nm} zahlt zu wenig ab` : `${nm} zahlt zu viel ab`) : `Der Abschlag für ${nm} passt`}</small><b>${e && e.show ? `${num(e.alt, 0)} € → <span>${num(e.neu, 0)} €</span>` : `${num((e || {}).alt || 0, 0)} €`}</b><small>${e ? `${e.rhythmus === "quartal" ? "je Quartal" : "im Monat"} · ${e.show ? `dann ± 0 € zum ${endD}` : f.ergebnis >= 0 ? `${sg(f.ergebnis)} Guthaben erwartet` : `${sg(f.ergebnis)} Nachzahlung erwartet`}` : ""}</small></div></div>
        ${f.gruende.length ? `<div class="abwhy"><b>Warum?</b><ul>${f.gruende.map((g) => `<li>${esc(g)}</li>`).join("")}</ul></div>` : ""}
        ${adm ? `<div class="gbtns" style="margin-top:10px">${btn("abnew", "pencil", e && e.show ? `Auf ${num(e.neu, 0)} € ändern` : "Abschlag ändern", { pri: !!(e && e.show), k })}${btn("paynew", "plus", "Zahlung buchen", { k })}</div>` : ""}`;
    const list = f.abschlaege.map((x) => { const st = x.src === "gebucht" && x.betrag === 0 ? "ausgefallen" : AST[x.src];
      return `<div class="abpy${x.bezahlt ? " ok" : ""}"><em>${de(x.d)}</em><b>${eur(x.betrag)}</b><span class="abq ${x.src === "plan" ? "" : x.src === "extra" ? "nfc" : "rechnung"}">${st}</span><small>${x.bezahlt ? (x.betrag > 0 ? `${ic("check", 13)} bezahlt` : "nicht gezahlt") : "offen"}${x.src === "gebucht" && x.plan !== x.betrag ? ` · Plan ${eur(x.plan)}` : ""}${x.note ? " · " + esc(x.note) : ""}</small>${adm ? `<button class="ibtn sm" data-act="adxa" data-ad="${ID}" data-a="${x.src === "plan" ? "payedit" : "paydel"}" data-k="${esc(c.id)}" data-v="${esc(x.d)}" aria-label="${x.src === "plan" ? "Zahlung am " + de(x.d) + " buchen" : "Buchung vom " + de(x.d) + " löschen"}">${ic(x.src === "plan" ? "pencil" : "trash", 15)}</button>` : "<span></span>"}</div>`; }).join("");
    const chg = (c.abplan || []).map((x) => `<div class="abpy"><em>ab ${de(x.ab)}</em><b>${eur(x.betrag)}</b><span class="abq">${x.rhythmus === "quartal" ? "je Quartal" : "monatlich"}</span><small>am ${x.tag}.${x.note ? " · " + esc(x.note) : ""}</small>${adm ? `<button class="ibtn sm" data-act="adxa" data-ad="${ID}" data-a="abdel" data-k="${esc(c.id)}" data-v="${esc(x.ab)}" aria-label="Änderung ab ${de(x.ab)} löschen">${ic("trash", 15)}</button>` : "<span></span>"}</div>`).join("");
    const sum = `<div class="abk3"><div><small>Hochrechnung bis ${endD.slice(0, 6)}</small><b>${eur(f.total)}</b></div><div><small>Abschläge bis ${endD.slice(0, 6)}</small><b>${eur(f.ab_total)}</b></div><div class="${f.ergebnis == null ? "" : f.ergebnis >= 0 ? "ok" : "wa"}"><small>Ergebnis</small><b>${f.ergebnis == null ? "–" : sg(f.ergebnis, 2)}</b></div></div>`;
    return `${sw}<div class="ab2 w"><div class="card"><h2>${ic("chart", 18)}${nm} · Abschlag gegen Kosten<span class="hzrt">${de(f.start).slice(0, 6)}–${endD}</span></h2>${bars(p, D, k, f)}${sum}</div><div class="card"><h2>${ic("lamp", 18)}Empfehlung</h2>${rec}</div></div>
      <div class="ab2"><div class="card"><h2>${ic("list", 18)}Abschläge im Zeitraum<span class="hzrt">${f.abschlaege.filter((x) => x.bezahlt).length} von ${f.abschlaege.length} bezahlt</span></h2><div class="abpys">${list || `<div class="mut sm">Keine Abschläge im Zeitraum.</div>`}</div><div class="mut sm" style="margin-top:8px">Lastschrift: Am Fälligkeitstag gilt der Abschlag als bezahlt. Anders gezahlt? Mit dem Stift buchen, 0 € = ausgefallen.</div></div>
      <div class="card"><h2>${ic("clock", 18)}Änderungen am Abschlag</h2>${chg ? `<div class="abpys">${chg}</div>` : `<div class="mut sm">Bisher gilt der Abschlag aus dem Vertrag: ${eur(c.abschlag.betrag)} ${c.abschlag.rhythmus === "quartal" ? "je Quartal" : "im Monat"} am ${c.abschlag.tag}.</div>`}</div></div>`;
  };

  /* ---------- Verträge ---------- */
  const timeline = (c, D) => {
    const t = c.term; if (!c.beginn || !t) return "";
    const a = Date.parse(c.beginn), b = Date.parse(t.ende), span = Math.max(b - a, 864e5) * 1.12, x = (iso) => Math.max(0, Math.min(100, (Date.parse(iso) - a) / span * 100));
    const mk = (iso, cls, lab) => `<i class="mk ${cls}" style="left:${x(iso).toFixed(1)}%" title="${esc(lab)} ${de(iso)}"></i>`;
    return `<div class="lsec">${ic("clock", 15)}Laufzeit, Preisgarantie und Fristen</div><div class="abtl"><div class="abtlb"><i class="run" style="width:${x(t.ende).toFixed(1)}%"></i>${c.garantie ? `<i class="gar" style="width:${x(c.garantie).toFixed(1)}%"></i>` : ""}${mk(D.today, "now", "heute")}${mk(t.kuendigen_bis, "kb", "Kündigung spätestens")}${mk(t.ende, "end", "Ende der Laufzeit")}</div>
      <div class="abtll"><span>${de(c.beginn)} Beginn</span><span class="kb">${t.tage >= 0 ? `Kündigung spätestens ${de(t.kuendigen_bis)}` : `Frist am ${de(t.kuendigen_bis)} verstrichen`}</span><span>${de(t.ende)} ${t.verlaengert ? "Ende der Verlängerung" : "Ende Erstlaufzeit"}${c.verl ? ` · danach +${c.verl} ${c.verl === 1 ? "Monat" : "Monate"}` : ""}</span></div>
      ${c.garantie ? `<div class="mut sm"><i class="abdot" style="background:#34d399"></i>Preisgarantie bis ${de(c.garantie)}</div>` : ""}</div>`;
  };
  const conDetail = (p, D, c) => {
    const u = c.u || {}, [nm, g, col, unit] = SP[c.sparte], P = c.periods.filter((x) => x.ab <= D.today).slice(-1)[0] || c.periods[0], adm = p._admin(), row = (l, v, cl) => `<div class="abr${cl ? " " + cl : ""}"><span>${l}</span><b>${v}</b></div>`;
    const parts = c.sparte === "wasser"
      ? [row("Frischwasser", `${num(u.teile.frisch, 2)} €/m³`), row("Abwasser", `${num(u.teile.abw, 2)} €/m³`), row("Niederschlagswasser", P.nieder ? `${num(P.nieder, 2)} €/m² · ${num(P.flaeche, 0)} m² = ${eur(u.jahr)}/Jahr` : "–"), row("Zählergebühr", `${num(u.grund, 2)} €/Monat`), row("Umsatzsteuer", `${num(P.ust, 0)} % auf Frischwasser`), row(`Effektiv bei ${num(D.opts.verbrauch.wasser, 0)} m³`, c.eff != null ? `${num(c.eff / 100, 2)} €/m³` : "–", "hl")]
      : [row(c.sparte === "einspeisung" ? "Vergütung" : "Arbeitspreis", P.mode === "dyn" ? `Börsenpreis + ${num(P.auf, 2)} ct/kWh${u.ct != null ? ` · jetzt ${num(u.ct, 2)}` : ""}` : ct(u.ct, unit)),
        P.co2 ? row("davon CO₂-Preis", ct(P.co2, unit), "sub") : "", P.steuer ? row(c.sparte === "gas" ? "davon Energiesteuer" : "davon Stromsteuer", ct(P.steuer, unit), "sub") : "",
        c.sparte !== "einspeisung" ? row("Grundpreis", `${num(P.gp * (P.brutto ? 1 : 1 + P.ust / 100), 2)} €/Monat`) : "", P.mess ? row("Messstellenbetrieb", `${num(P.mess * (P.brutto ? 1 : 1 + P.ust / 100), 2)} €/Monat`) : "",
        row("Umsatzsteuer", `${num(P.ust, 0)} %${P.brutto ? "" : " · netto eingegeben"}`), c.bonus ? row("Bonus (einmalig, 1. Jahr)", `−${eur(c.bonus)}`) : "",
        c.sparte !== "einspeisung" ? row(`Effektiv bei ${num(D.opts.verbrauch[c.sparte], 0)} ${unit}`, c.eff != null ? ct(c.eff, unit) : "–", "hl") : ""];
    const zl = c.meters.map((i) => M(D, i)).filter(Boolean);
    const side = [c.sparte === "gas" ? row("Einheit am Zähler", "m³") + row("Brennwert", `${num(c.brennwert, 3)} kWh/m³`) + row("Zustandszahl", num(c.zustand, 4)) + row("= Faktor", `${num(c.brennwert * c.zustand, 3)} kWh je m³`) : "",
      row("Zähler", zl.length ? zl.map((m) => esc(m.name)).join(", ") : "keiner zugeordnet"), row("Abrechnungsjahr ab", `${c.abr.slice(3)}.${c.abr.slice(0, 2)}.`), row("Abrechnung", { jahr: "jährlich", quartal: "je Quartal", monat: "monatlich" }[c.zahl]),
      c.abschlag.betrag ? row("Abschlag", `${eur(c.abschlag.betrag)} · ${c.abschlag.rhythmus === "quartal" ? "je Quartal" : "monatlich"} am ${c.abschlag.tag}.`) : ""].join("");
    const hist = c.changes.map((x, i) => { const fut = x.ab > D.today, cur = !fut && (i === c.changes.length - 1 || c.changes[i + 1].ab > D.today);
      return `<div class="abpv${cur ? " cur" : ""}${fut ? " fut" : ""}"><em>${de(x.ab)}</em><span>${x.dyn ? "dynamisch" : c.sparte === "wasser" ? `${num(x.ct / 100, 2)} €/m³` : ct(x.ct, unit)}${x.grund ? ` · ${num(x.grund, 2)} €/Mon.` : ""}</span><small>${esc(x.note || (cur ? "gilt heute" : fut ? "angekündigt" : ""))}</small><b class="${x.pct > 0 ? "up" : x.pct < 0 ? "dn" : ""}">${x.pct != null ? `${x.pct > 0 ? "+" : ""}${num(x.pct, 1)} %` : ""}${fut && x.pct > 0 ? " · Sonderkündigung möglich" : ""}</b>${adm ? `<button class="ibtn sm" data-act="adxa" data-ad="${ID}" data-a="pedit" data-k="${esc(c.id)}" data-v="${i}" aria-label="Preis vom ${de(x.ab)} bearbeiten">${ic("pencil", 15)}</button>` : ""}</div>`; }).join("");
    return `<div class="card abdet" style="--c:${col}"><div class="abdh">${gx(p, g, 46)}<div><b>${esc(cname(c))}${c.aktiv ? "" : ` <em class="abtag">${c.ende && c.ende < D.today ? "beendet" : "noch nicht aktiv"}</em>`}</b><small>${esc([c.anbieter, c.nr ? "Vertrag " + mask(c.nr) : "", c.kunde ? "Kunde " + mask(c.kunde) : ""].filter(Boolean).join(" · ") || nm)}</small></div>${adm ? `<span class="abdb">${btn("cedit", "pencil", "Bearbeiten", { k: c.id })}</span>` : ""}</div>
      <div class="ab2 in"><div class="abbox"><div class="abbh">Preis-Bestandteile<small>brutto, gültig ab ${de(P.ab)}</small></div>${parts.join("")}</div><div class="abbox"><div class="abbh">${c.sparte === "gas" ? "Umrechnung & Zähler" : "Zähler & Abrechnung"}</div>${side}</div></div>
      ${timeline(c, D)}<div class="lsec">${ic("chart", 15)}Preisverlauf${adm ? `<button class="lnk" style="margin-left:auto" data-act="adxa" data-ad="${ID}" data-a="pnew" data-k="${esc(c.id)}">+ Neuer Preis ab …</button>` : ""}</div><div class="abpvs">${hist}</div></div>`;
  };
  const contracts = (p, D, s) => {
    if (!D.contracts.length) return `<div class="card empty">${gx(p, "euro", 44)}<div style="margin:10px 0 4px;font-weight:700">Noch kein Vertrag</div>Trage deinen Strom-, Gas- oder Wasservertrag ein. Du brauchst nur die Werte von der letzten Rechnung oder dem Preisblatt.${p._admin() ? `<div class="gbtns" style="margin-top:12px;justify-content:center">${btn("cnew", "plus", "Vertrag hinzufügen", { pri: 1 })}</div>` : ""}</div>`;
    const sel = C(D, s.cid) || D.contracts.find((c) => c.aktiv) || D.contracts[0];
    const list = D.contracts.slice().sort((a, b) => SPK.indexOf(a.sparte) - SPK.indexOf(b.sparte) || (b.beginn || "").localeCompare(a.beginn || "")).map((c) => `<button class="abli${c.id === sel.id ? " sel" : ""}${c.aktiv ? "" : " off"}" style="--c:${SP[c.sparte][2]}" data-act="adxa" data-ad="${ID}" data-a="csel" data-k="${esc(c.id)}">${gx(p, SP[c.sparte][1], 30, { on: c.aktiv ? 1 : 0 })}<span><b>${SP[c.sparte][0]}</b><small>${esc([c.anbieter, c.tarif].filter(Boolean).join(" · ") || "Vertrag")}${c.aktiv ? "" : " · " + (c.ende && c.ende < D.today ? "beendet" : "ab " + de(c.beginn))}</small></span></button>`).join("");
    return `<div class="abcon"><div class="ablist">${list}${p._admin() ? `<button class="abli add" data-act="adxa" data-ad="${ID}" data-a="cnew">${ic("plus", 18)}<span><b>Vertrag hinzufügen</b></span></button>` : ""}</div>${conDetail(p, D, sel)}</div>`;
  };

  /* ---------- Zähler & Ablesungen ---------- */
  const meters = (p, D, s) => {
    const adm = p._admin();
    if (!D.meters.length) return `<div class="card empty">${gx(p, "meter", 44)}<div style="margin:10px 0 4px;font-weight:700">Noch kein Zähler</div>Lege deine Zähler an: Strom, Gas, Wasser. Mit einem Sensor wird der Stand jeden Tag um 0 Uhr gespeichert, ohne Sensor liest du von Hand ab.${adm ? `<div class="gbtns" style="margin-top:12px;justify-content:center">${btn("mnew", "plus", "Zähler hinzufügen", { pri: 1 })}</div>` : ""}</div>`;
    const sel = M(D, s.mid) || D.meters[0];
    const cards = D.meters.map((m) => { const A = ART[m.art], v = m.live != null ? m.live : m.last ? m.last.v : null, src = m.live != null ? "Automatisch" : m.last ? SRC[m.last.src] : "";
      return `<button class="abm${m.id === sel.id ? " sel" : ""}" data-act="adxa" data-ad="${ID}" data-a="msel" data-k="${esc(m.id)}"><div class="abmh">${gx(p, A[2], 30)}<span><b>${esc(m.name)}</b><small>${m.name === A[0] ? A[1] : `${A[0]} · ${A[1]}`}</small></span></div>${rolls(m, v)}<div class="abmf"><span>${m.unit}${m.last ? ` · ${m.live != null ? "jetzt" : de(m.last.t)}` : ""}</span>${src ? `<em class="abq ${m.live != null ? "auto" : m.last.src}">${src}</em>` : ""}</div></button>`; }).join("");
    const rows = sel.rows.map((r) => `<div class="abrd"><b>${de(r.t)}</b><span>${num(r.v, Math.min(sel.dec, 3))} ${sel.unit}</span><span class="mut">${r.start ? (r.note || "Startstand") : r.per != null ? `${r.per >= 0 ? "+" : ""}${num(r.per, r.per < 10 ? 2 : 1)} ${sel.unit}/Tag` : ""}</span><em class="abq ${r.src}">${SRC[r.src] || r.src}</em><span class="mut sm">${esc(r.who || "")}${r.note && !r.start ? " · " + esc(r.note) : ""}</span>${adm ? `<button class="ibtn sm" data-act="adxa" data-ad="${ID}" data-a="rdel" data-k="${esc(sel.id)}" data-v="${esc(r.t)}" aria-label="Ablesung vom ${de(r.t)} löschen">${ic("trash", 15)}</button>` : "<span></span>"}</div>`).join("");
    return `<div class="abms">${cards}${adm ? `<button class="abm add" data-act="adxa" data-ad="${ID}" data-a="mnew">${ic("plus", 22)}<b>Zähler hinzufügen</b></button>` : ""}</div>
      <div class="ab2 w"><div class="card"><h2>${ic("list", 18)}Ablesungen ${esc(sel.name)}<span class="hzrt">Prüfung gegen den Verlauf</span></h2>${rows ? `<div class="abrds">${rows}</div>${sel.n > sel.rows.length ? `<div class="mut sm" style="margin-top:6px">Die letzten ${sel.rows.length} von ${sel.n} Ständen.</div>` : ""}` : `<div class="mut sm">Noch keine Ablesung. Der erste Stand ist der Startstand.</div>`}
        <div class="gbtns" style="margin-top:12px">${btn("read", "gauge", "Zählerstand erfassen", { pri: 1, k: sel.id })}</div></div>
      <div class="card"><h2>${ic("tools", 18)}${esc(sel.name)}</h2><div class="abr"><span>Zählernummer</span><b>${esc(mask(sel.nr)) || "–"}</b></div><div class="abr"><span>Sensor</span><b>${sel.sensor ? esc(sel.sensor) : "keiner – von Hand"}</b></div><div class="abr"><span>Verbrauch zuletzt</span><b>${sel.rate != null ? `${num(sel.rate, sel.rate < 10 ? 2 : 1)} ${sel.unit}/Tag` : "–"}</b></div><div class="abr"><span>Eichfrist</span><b>${sel.eich ? "bis " + sel.eich : "–"}</b></div><div class="abr"><span>Gehört zu</span><b>${sel.used.map((i) => C(D, i)).filter(Boolean).map((c) => esc(cname(c))).join(", ") || "keinem Vertrag"}</b></div>
        ${sel.sensor ? `<div class="mut sm">${ic("check", 14)} Der Stand wird täglich um 0 Uhr gespeichert.</div>` : ""}${adm ? `<div class="gbtns" style="margin-top:10px">${btn("medit", "pencil", "Bearbeiten", { k: sel.id })}${btn("swap", "refresh", "Zähler tauschen", { k: sel.id })}</div>` : ""}</div></div>`;
  };

  /* ================= v0.5: Rechnungen, Fahrtkosten, Vorräte ================= */
  const PUMP = (s) => `<svg viewBox="0 0 64 64" width="${s}" height="${s}" aria-hidden="true"><defs><linearGradient id="abpu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fca5a5"/><stop offset=".5" stop-color="#ef4444"/><stop offset="1" stop-color="#991b1b"/></linearGradient></defs><ellipse cx="30" cy="58.5" rx="20" ry="3.2" fill="var(--gx-sh,#000)" opacity=".22"/><rect x="12" y="8" width="28" height="48" rx="5" fill="url(#abpu)"/><rect x="16" y="13" width="20" height="14" rx="2.5" fill="#0f172a"/><rect x="18" y="16" width="16" height="3" rx="1.5" fill="#34d399"/><rect x="18" y="21" width="10" height="3" rx="1.5" fill="#fbbf24"/><rect x="9" y="54" width="34" height="4" rx="2" fill="#475569"/><path d="M40 22 h5 a4 4 0 0 1 4 4 v18 a3.5 3.5 0 0 0 7 0 V24 l-6-7" fill="none" stroke="#64748b" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 10 h9 v42 h-9z" fill="#fff" opacity=".14"/></svg>`;
  const TANK = (pct, col, txt, s = 84) => { const h = 58 * Math.max(0, Math.min(100, pct == null ? 0 : pct)) / 100, y = 74 - h; return `<svg class="abtank" viewBox="0 0 66 92" width="${Math.round(s * .72)}" height="${s}" aria-hidden="true"><ellipse cx="33" cy="86" rx="24" ry="3.5" fill="var(--gx-sh,#000)" opacity=".22"/><rect x="8" y="10" width="50" height="68" rx="14" class="tk"/><clipPath id="abtk${Math.round(pct || 0)}${col.slice(1)}"><rect x="11" y="13" width="44" height="62" rx="11"/></clipPath><g clip-path="url(#abtk${Math.round(pct || 0)}${col.slice(1)})"><rect x="11" y="${y.toFixed(1)}" width="44" height="${(h + 3).toFixed(1)}" fill="${col}"/><rect x="11" y="${y.toFixed(1)}" width="44" height="4" fill="#fff" opacity=".25"/></g><path d="M15 20 v44" stroke="#fff" stroke-opacity=".16" stroke-width="4" stroke-linecap="round"/><rect x="26" y="4" width="14" height="8" rx="3" class="tc"/><text x="33" y="50" text-anchor="middle">${esc(txt)}</text></svg>`; };
  const VA = { oel: ["Heizöl", "l", "#f59e0b"], pellets: ["Pellets", "t", "#c08457"], lpg: ["Flüssiggas", "l", "#60a5fa"], holz: ["Brennholz", "rm", "#84cc16"], briketts: ["Briketts", "kg", "#a8a29e"], salz: ["Regeneriersalz", "Sack", "#e2e8f0"], pool: ["Poolchemie", "kg", "#38bdf8"], adblue: ["AdBlue", "l", "#93c5fd"], filter: ["Filter", "Stück", "#cbd5e1"], sonst: ["Vorrat", "Stück", "#a78bfa"] };
  const AN = { elektro: "Elektro", benzin: "Benzin", diesel: "Diesel", lpg: "Autogas", hybrid: "Plug-in-Hybrid" };
  const EA = { tanken: ["Tanken", "l"], laden_haus: ["Laden zuhause", "kWh"], laden_weg: ["Laden unterwegs", "kWh"], km: ["Kilometerstand", "km"], fix: ["Fixkosten", ""] };
  const FX = { vers: "Versicherung", steuer: "Kfz-Steuer", wartung: "Wartung/TÜV", reifen: "Reifen", sonst: "Sonstiges" };
  const carIcon = (p, v, s) => (v.antrieb === "elektro" || v.antrieb === "hybrid" ? gx(p, "car", s) : PUMP(s));
  const lv = (x) => (x === "ok" ? `<span class="abok">${ic("check", 15)}</span>` : x === "warn" ? `<span class="abwa">${ic("alert", 15)}</span>` : `<span class="abna">–</span>`);
  const spanDe = (a, b) => `${deS(a).slice(0, 3)}${a.slice(5, 7) === "01" && b.slice(5, 7) === "12" && a.slice(0, 4) === b.slice(0, 4) ? a.slice(0, 4) : `${a.slice(5, 7)}/${a.slice(0, 4)} – ${b.slice(5, 7)}/${b.slice(0, 4)}`}`;
  const invTitle = (r) => { const sp = SP[r.sparte][0].split(" ")[0]; return r.von.slice(5) === "01-01" && r.bis.slice(5) === "12-31" && r.von.slice(0, 4) === r.bis.slice(0, 4) ? `${sp} ${r.von.slice(0, 4)}` : r.von.slice(0, 7) === r.bis.slice(0, 7) ? `${sp} ${MON[+r.von.slice(5, 7) - 1]} ${r.von.slice(0, 4)}` : `${sp} ${r.von.slice(5, 7)}/${r.von.slice(0, 4)} – ${r.bis.slice(5, 7)}/${r.bis.slice(0, 4)}`; };

  /* ---------- Rechnungen ---------- */
  const invoices = (p, D, s) => {
    const L = D.rechnungen || [], adm = p._admin();
    if (!L.length) return `<div class="card empty">${gx(p, "euro", 44)}<div style="margin:10px 0 4px;font-weight:700">Noch keine Rechnung</div>Trage deine letzte Jahresrechnung ein. Modul 20 prüft sie gegen deine Ablesungen, den Vertrag und die gezahlten Abschläge – und übernimmt auf Wunsch Brennwert, neuen Abschlag und Zählerstände.${adm ? `<div class="gbtns" style="margin-top:12px;justify-content:center">${btn("invnew", "plus", "Rechnung hinzufügen", { pri: 1 })}</div>` : ""}</div>`;
    const r = L.find((x) => x.id === s.iid) || L[0], c = C(D, r.cid) || {}, [nm, g, col, unit] = SP[r.sparte], erg = r.ergebnis;
    const list = L.map((x) => `<button class="abli${x.id === r.id ? " sel" : ""}" style="--c:${SP[x.sparte][2]}" data-act="adxa" data-ad="${ID}" data-a="isel" data-k="${esc(x.id)}">${gx(p, SP[x.sparte][1], 30)}<span><b>${esc(invTitle(x))}</b><small>${x.datum ? "vom " + de(x.datum) : de(x.bis)}${x.beleg ? " · Beleg" : ""}${x.warn ? ` · <i class="abwa">${x.warn} Hinweis${x.warn > 1 ? "e" : ""}</i>` : ""}</small></span><em class="${x.sparte === "einspeisung" ? "ok" : x.ergebnis >= 0 ? "ok" : "wa"}">${x.sparte === "einspeisung" ? "+" + eur(x.betrag) : sg(x.ergebnis, 2)}<small>${x.sparte === "einspeisung" ? "Gutschrift" : x.ergebnis >= 0 ? "Guthaben" : "Nachzahlung"}</small></em></button>`).join("");
    const ein = r.sparte === "einspeisung";
    const boxes = `<div class="abk3"><div><small>${ein ? "Gutschrift laut Rechnung" : "Kosten laut Rechnung"}</small><b>${eur(r.betrag)}</b></div><div><small>${ein ? "Abschläge erhalten" : "Abschläge angerechnet"}</small><b>${eur(r.angerechnet)}</b></div><div class="${ein || erg >= 0 ? "ok" : "wa"}"><small>Ergebnis</small><b>${ein ? "+" + eur(r.betrag - r.angerechnet) : sg(erg, 2)}</b></div></div>`;
    const chk = r.pruefung.map((x) => `<div class="abpr">${lv(x.lv)}<span>${esc(x.t)}</span><b class="${x.lv === "ok" ? "ok" : x.lv === "warn" ? "wa" : "mut"}">${esc(x.v || "")}</b></div>`).join("");
    const fc = (D.cards[r.sparte] || {}).fc, e = fc && fc.empf;
    const abl = r.neu_abschlag ? `<div class="mut sm" style="margin-top:10px">Neuer Abschlag laut Rechnung: <b class="tx">${eur(r.neu_abschlag)}</b>${e ? ` · Empfehlung aus der Hochrechnung: <b class="hl">${num(e.neu != null ? e.neu : e.next, 0)} €</b>` : ""}</div>` : "";
    const learn = r.learn.length ? `<div class="abln"><div class="abbh">Aus der Rechnung übernehmen${r.gelernt ? `<small>${ic("check", 13)} übernommen</small>` : ""}</div>${r.learn.map((l) => `<label class="abcb"><input type="checkbox" data-f="adxl" data-ad="${ID}" data-k="${l.k}" ${(s.lk || {})[r.id + l.k] === false ? "" : "checked"} ${adm ? "" : "disabled"}><span>${esc(l.t)}</span></label>`).join("")}${adm ? `<div class="gbtns" style="margin-top:8px">${btn("ilearn", "check", r.gelernt ? "Noch einmal übernehmen" : "Übernehmen", { pri: !r.gelernt, k: r.id })}</div>` : ""}</div>` : "";
    return `<div class="abcon"><div class="ablist">${list}${adm ? `<button class="abli add" data-act="adxa" data-ad="${ID}" data-a="invnew">${ic("plus", 18)}<span><b>Rechnung hinzufügen</b></span></button>` : ""}</div>
      <div class="card abdet" style="--c:${col}"><div class="abdh">${gx(p, g, 46)}<div><b>${esc(nm.split(" ")[0])} · ${r.von.slice(5) === "01-01" && r.bis.slice(5) === "12-31" ? "Jahresrechnung " + r.von.slice(0, 4) : `Rechnung ${de(r.von)} – ${de(r.bis)}`}</b><small>${esc([r.datum ? "Rechnung vom " + de(r.datum) : "", c.anbieter, r.nr ? "Nr. " + mask(r.nr) : ""].filter(Boolean).join(" · "))}</small></div><span class="abdb">${r.beleg ? btn("ibeleg", "download", "Beleg", { k: r.id }) : ""}${adm ? btn("iedit", "pencil", "Bearbeiten", { k: r.id }) : ""}</span></div>
        ${boxes}<div class="lsec">${ic("check", 15)}Rechnungsprüfung <span class="mut sm">· gegen eigene Messung, Vertrag und Abschläge · Toleranz ${num(D.opts.tol, 1)} %</span></div><div class="abprs">${chk}</div>${abl}${learn}
        ${r.note ? `<div class="mut sm" style="margin-top:8px">${esc(r.note)}</div>` : ""}</div></div>`;
  };

  /* ---------- Fahrtkosten ---------- */
  const PER = { monat: ["Monat", "monat"], jahr: ["Jahr", "jahr"], d90: ["90 Tage", "d30"] };
  const cars = (p, D, s) => {
    const V = D.fahrzeuge || [], adm = p._admin(), per = PER[s.fkp] ? s.fkp : "jahr";
    if (!V.length) return `<div class="card empty">${gx(p, "car", 44)}<div style="margin:10px 0 4px;font-weight:700">Noch kein Fahrzeug</div>Lege deine Autos an – Elektro oder Verbrenner. Aus Tankbelegen, Ladungen und Kilometerstand rechnet Modul 20 die Kosten je 100 km, den Verbrauch und die Vollkosten je Kilometer.${adm ? `<div class="gbtns" style="margin-top:12px;justify-content:center">${btn("carnew", "plus", "Fahrzeug hinzufügen", { pri: 1 })}</div>` : ""}</div>`;
    const card = (v) => { const S0 = v[PER[per][1]], el = v.antrieb === "elektro", row = (l, x, cl) => `<div class="abr"><span>${l}</span><b${cl ? ` class="${cl}"` : ""}>${x}</b></div>`;
      const vb = el ? (S0.kwh100 != null ? `${num(S0.kwh100, 1)} kWh/100 km` : "–") : (S0.l100 != null ? `${num(S0.l100, 1)} l/100 km` : "nach 2 Volltankungen");
      const sh = el && S0.kwh ? `<div class="abseg"><i style="width:${S0.anteil.laden_haus || 0}%;background:#fbbf24"></i><i style="width:${S0.anteil.laden_weg || 0}%;background:#60a5fa"></i></div><div class="ablg"><span><i style="background:#fbbf24"></i>Zuhause ${S0.anteil.laden_haus || 0} % · ${num(S0.by.laden_haus.eur, 0)} €</span><span><i style="background:#60a5fa"></i>Unterwegs ${S0.anteil.laden_weg || 0} % · ${num(S0.by.laden_weg.eur, 0)} €</span></div>`
        : !el && S0.preis_l.length > 1 ? (() => { const P = S0.preis_l.map((x) => x.p), mn = Math.min(...P), mx = Math.max(...P), W = 300; return `<svg viewBox="0 0 ${W} 40" class="abspk"><polyline points="${P.map((y, i) => `${(i / (P.length - 1) * W).toFixed(1)},${(34 - (y - mn) / Math.max(.01, mx - mn) * 28).toFixed(1)}`).join(" ")}" fill="none" stroke="#fca5a5" stroke-width="2.5"/></svg><div class="mut sm">Preis je Liter · Ø ${num(P.reduce((a, b) => a + b, 0) / P.length, 3)} € · zuletzt ${num(P[P.length - 1], 3)} €</div>`; })() : "";
      return `<div class="card abcar" style="--c:${el ? "#5eead4" : "#fca5a5"}"><div class="abch">${carIcon(p, v, 54)}<div><b>${esc(v.name)}</b><small>${AN[v.antrieb]}${v.km_live != null ? ` · ${num(v.km_live, 0)} km` : S0.km_stand ? ` · ${num(S0.km_stand, 0)} km` : ""}</small></div><div class="abbig"><b>${S0.e100 != null ? eur(S0.e100) : "–"}</b><small>je 100 km · ${el ? "Strom" : "Kraftstoff"}</small></div>${adm ? `<button class="ibtn sm" data-act="adxa" data-ad="${ID}" data-a="caredit" data-k="${esc(v.id)}" aria-label="${esc(v.name)} bearbeiten">${ic("pencil", 15)}</button>` : ""}</div>
        <div class="abr2">${row(`Strecke · ${PER[per][0]}`, `${num(S0.km, 0)} km`)}${row("Verbrauch", vb)}${row(el ? "Geladen" : "Getankt", el ? `${num(S0.kwh, 0)} kWh` : `${num(S0.liter, 0)} l`)}${row(el ? "Stromkosten" : "Kraftstoffkosten", eur(S0.eur))}${row("Fixkosten anteilig", eur(S0.fix))}${row("Vollkosten", S0.voll_ct != null ? `${num(S0.voll_ct, 1)} ct/km` : "–", "hl")}</div>${sh}</div>`; };
    const ent = V.flatMap((v) => v.eintraege.map((e) => ({ ...e, v }))).sort((a, b) => b.t.localeCompare(a.t)).slice(0, 8);
    const erow = (e) => { const [l, u] = EA[e.art], ic2 = e.art === "tanken" ? PUMP(30) : e.art === "laden_haus" ? gx(p, "wallbox", 30) : e.art === "laden_weg" ? gx(p, "plug", 30) : e.art === "km" ? gx(p, "car", 30) : gx(p, "wrench", 30);
      const t = e.art === "km" ? `Kilometerstand ${num(e.km, 0)} km` : e.art === "fix" ? `${FX[e.fix]}` : `${l} · ${num(e.menge || 0, 1)} ${u}${e.preis ? ` × ${num(e.preis, e.art === "tanken" ? 3 : 2)} €` : ""}`;
      return `<div class="row2">${ic2}<div><b>${esc(t)}</b><small>${de(e.t)} · ${esc(e.v.name)}${e.km && e.art !== "km" ? ` · ${num(e.km, 0)} km` : ""}${e.art === "tanken" ? (e.voll ? " · voll" : " · teilweise") : ""}${e.note ? " · " + esc(e.note) : ""}</small></div><div class="r">${e.betrag != null ? `<b>${eur(e.betrag)}</b>` : ""}<em class="abq ${e.src === "nfc" ? "nfc" : ""}">${{ manuell: "Manuell", nfc: "NFC", modul8: "Modul 8", foto: "Foto" }[e.src]}</em></div>${adm ? `<button class="ibtn sm" data-act="adxa" data-ad="${ID}" data-a="entdel" data-k="${esc(e.v.id)}" data-v="${esc(e.id)}" aria-label="Eintrag löschen">${ic("trash", 15)}</button>` : ""}</div>`; };
    const cmp = V.filter((v) => v.jahr.e100 != null || v.d30.e100 != null), mxv = Math.max(1, ...cmp.map((v) => (v.jahr.voll_ct || v.d30.voll_ct || 0)));
    const bar = (v, x, op) => `<div class="abvb"><span>${esc(v.name)}</span><i style="width:${Math.max(4, x / mxv * 100)}%;background:${v.antrieb === "elektro" ? "#5eead4" : "#fca5a5"};opacity:${op}"></i><b>${eur(x)}</b></div>`;
    const km = pn(s.trip) || 0;
    const calc = km > 0 ? V.map((v) => { const S0 = v.jahr.e100 != null ? v.jahr : v.d30; return `<div class="abr"><span>${esc(v.name)}</span><b>${S0.e100 != null ? eur(km * S0.e100 / 100) : "–"}${S0.voll_ct != null ? ` <em class="mut">· voll ${eur(km * S0.voll_ct / 100)}</em>` : ""}</b></div>`; }).join("") : `<div class="mut sm">Strecke eingeben – zum Beispiel der Weg zur Arbeit hin und zurück.</div>`;
    return `<div class="abfkh"><div class="gschips">${Object.entries(PER).map(([k, [l]]) => chip("fkp", k, l, k === per)).join("")}</div><div class="gbtns">${btn("entnew", "plus", "Tanken oder Laden erfassen", { pri: 1 })}${adm ? btn("carnew", "car", "Fahrzeug hinzufügen") : ""}</div></div>
      <div class="ab2">${V.map(card).join("")}</div>
      <div class="ab3"><div class="card"><h2>${ic("list", 18)}Letzte Einträge<span class="hzrt">Tanken, Laden, Kilometer</span></h2>${ent.length ? ent.map(erow).join("") : `<div class="mut sm">Noch keine Einträge.</div>`}</div>
      <div class="card"><h2>${ic("chart", 18)}Vergleich je 100 km</h2>${cmp.length ? `<div class="mut sm">Nur Energie</div>${cmp.map((v) => bar(v, (v.jahr.e100 != null ? v.jahr : v.d30).e100, 1)).join("")}<div class="mut sm" style="margin-top:8px">Vollkosten mit Fixkosten</div>${cmp.map((v) => bar(v, (v.jahr.voll_ct != null ? v.jahr : v.d30).voll_ct || 0, .6)).join("")}` : `<div class="mut sm">Ab 50 gefahrenen Kilometern mit Kosten erscheint hier der Vergleich.</div>`}
        <div class="lsec">${ic("car", 15)}Fahrt-Rechner</div><div class="abfs one">${inp("trip", "Strecke", s.trip || "", { num: 1, unit: "km", ph: "z. B. 240" })}</div>${calc}</div></div>
      <div class="mut sm">${ic("info", 14)} Laden zuhause übernimmt Modul 20 ab v0.7 automatisch aus der Ladestatistik von Modul 8. Bis dahin trägst du es von Hand ein – der Preis ist mit deinem Vertragspreis${D.home_ct != null ? ` (${num(D.home_ct, 2)} ct/kWh)` : ""} vorbelegt.</div>`;
  };

  /* ---------- Vorräte ---------- */
  const stocks = (p, D, s) => {
    const I = D.vorraete || [], adm = p._admin();
    if (!I.length) return `<div class="card empty">${gx(p, "flame", 44)}<div style="margin:10px 0 4px;font-weight:700">Noch kein Vorrat</div>Heizöl, Pellets, Flüssiggas, Brennholz – oder Regeneriersalz, Poolchemie und Filter. Modul 20 rechnet Bestand, Wert, Reichweite und sagt rechtzeitig, wann du bestellen solltest.${adm ? `<div class="gbtns" style="margin-top:12px;justify-content:center">${btn("itemnew", "plus", "Vorrat hinzufügen", { pri: 1 })}</div>` : ""}</div>`;
    const fuel = I.filter((x) => x.brennstoff), other = I.filter((x) => !x.brennstoff);
    const days = (iso) => Math.round((Date.parse(iso) - Date.parse(D.today)) / 864e5);
    const amp = (x) => { const t = x.st; return t.unter_min ? ["wa", "Mindestbestand erreicht – nachkaufen"] : t.bestellen_bis && days(t.bestellen_bis) <= 0 ? ["wa", `Jetzt bestellen · reicht bis ${de(t.reicht_bis)}`] : t.bestellen_bis && days(t.bestellen_bis) <= 45 ? ["wa", `Reicht bis ${de(t.reicht_bis)} · bestellen bis ${de(t.bestellen_bis)}`] : t.reicht_bis ? ["ok", `Reicht bis ${t.reicht_tage > 365 ? "über ein Jahr" : MON[+t.reicht_bis.slice(5, 7) - 1] + " " + t.reicht_bis.slice(0, 4)}`] : ["mu", "Reichweite nach zwei Zählungen oder Entnahmen"]; };
    const card = (x) => { const t = x.st, a = amp(x), u = x.unit, row = (l, v) => `<div class="abr"><span>${l}</span><b>${v}</b></div>`;
      return `<div class="card abvr" data-act="adxa" data-ad="${ID}" data-a="bknew" data-k="${esc(x.id)}" role="button" tabindex="0"><div class="abvrh">${TANK(t.fuell, VA[x.art][2], t.fuell != null ? `${t.fuell}%` : num(t.bestand, 1))}<div><b>${esc(x.name)}</b><small>${x.lager ? `Lager ${num(x.lager, x.lager < 20 ? 1 : 0)} ${u} · ` : ""}${x.sensor ? "Füllstand-Sensor" : t.rate ? "gerechnet aus Verbrauch" : "gezählt"}</small>
        ${row("Bestand", `${num(t.bestand, t.bestand < 20 ? 1 : 0)} ${u}`)}${row("Ø Einkaufspreis", t.avg ? `${num(t.avg, t.avg < 5 ? 3 : 0)} €/${u}` : "–")}${row(t.ct_kwh ? "Wärmepreis" : "Wert", t.ct_kwh ? `${num(t.ct_kwh, 1)} ct/kWh` : eur(t.wert))}${row(x.min ? "Mindestbestand" : "Verbraucht " + D.today.slice(0, 4), x.min ? `${num(x.min, 1)} ${u}` : `${num(t.verbraucht_jahr, 1)} ${u} · ${eur(t.kosten_jahr)}`)}</div></div>
        <div class="abamp ${a[0]}"><i></i>${esc(a[1])}</div></div>`; };
    const buys = I.flatMap((x) => x.buchungen.filter((b) => b.art === "kauf").map((b) => ({ ...b, x }))).sort((a, b) => b.t.localeCompare(a.t)).slice(0, 6);
    return `<div class="abfkh"><span class="mut sm">${fuel.length} Brennstoff${fuel.length === 1 ? "" : "e"} · ${other.length} Betriebsmittel</span><div class="gbtns">${adm ? btn("bknew", "plus", "Einkauf erfassen", { pri: 1, v: "kauf" }) + btn("itemnew", "package", "Vorrat hinzufügen") : btn("bknew", "minus", "Entnahme buchen", { pri: 1, v: "entnahme" })}</div></div>
      ${fuel.length ? `<div class="abgrid g3">${fuel.map(card).join("")}</div>` : ""}
      <div class="ab3"><div class="card"><h2>${ic("list", 18)}Einkäufe<span class="hzrt">Menge, Preis, Lieferant</span></h2>${buys.length ? buys.map((b) => `<div class="row2">${gx(p, "euro", 30)}<div><b>${esc(b.x.name)} · ${num(b.menge, b.menge < 20 ? 1 : 0)} ${esc(b.x.unit)} × ${num(b.betrag / b.menge, b.betrag / b.menge < 5 ? 3 : 2)} €</b><small>${de(b.t)}${b.liefer ? " · " + esc(b.liefer) : ""}${b.note ? " · " + esc(b.note) : ""}</small></div><div class="r"><b>${eur(b.betrag)}</b></div></div>`).join("") : `<div class="mut sm">Noch keine Einkäufe gebucht.</div>`}</div>
      <div class="card"><h2>${ic("package", 18)}Betriebsmittel<span class="hzrt">Bestand · Mindestbestand</span></h2>${other.length ? other.map((x) => `<div class="row2" data-act="adxa" data-ad="${ID}" data-a="bknew" data-k="${esc(x.id)}" role="button">${gx(p, x.art === "salz" ? "water" : x.art === "pool" ? "pool" : x.art === "adblue" ? "car" : x.art === "filter" ? "fan" : "plug", 30)}<div><b>${esc(x.name)}</b><small>${x.st.bestand <= 0 ? "leer" : x.st.reicht_bis ? "reicht bis " + de(x.st.reicht_bis) : x.st.letzter_kauf ? "zuletzt gekauft " + de(x.st.letzter_kauf) : esc(x.unit)}</small></div><div class="r ${x.st.unter_min ? "bad" : "ok"}"><b>${num(x.st.bestand, 0)}${x.min ? ` · min. ${num(x.min, 0)}` : ""}</b>${x.st.unter_min ? `<small class="wa">nachkaufen</small>` : ""}</div><button class="ibtn sm" data-act="adxa" data-ad="${ID}" data-a="take" data-k="${esc(x.id)}" aria-label="${esc(x.name)}: 1 entnommen" ${x.st.bestand < 1 ? "disabled" : ""}>${ic("minus", 15)}</button></div>`).join("") : `<div class="mut sm">Salz, Poolchemie, AdBlue oder Filter als Stückliste mit Mindestbestand.</div>`}</div></div>
      <div class="mut sm">${ic("info", 14)} Kosten zählen beim Verbrauch, nicht beim Kauf: bewertet mit dem gleitenden Durchschnittspreis.${D.opts.todo ? ` Unter dem Mindestbestand kommt ein Eintrag auf ${esc(D.opts.todo)}.` : " Unter dem Mindestbestand kommt eine Mitteilung – auf Wunsch auch ein Eintrag in eine To-do-Liste (Einstellungen → Modul 20)."}</div>`;
  };

  /* Direktlink aus einer Handy-Mitteilung (Stichtag, NFC-Tag): ?modul=abrechnung&abr=read&m=<Zähler> · abr=fuel&v=<Fahrzeug> · abr=stock&s=<Vorrat> */
  const deep = (p, D, s) => {
    let q; try { q = new URLSearchParams(location.search); } catch (_) { return; }
    const a = q.get("abr"); if (!a) return;
    try { history.replaceState(null, "", location.pathname + "?modul=" + ID); } catch (_) { /* egal */ }
    setTimeout(() => {
      if (a === "read" && M(D, q.get("m"))) { s.tab = "met"; s.mid = q.get("m"); p._modal = { type: "adx", id: ID, k: "r", mid: q.get("m"), src: q.get("src") === "nfc" ? "nfc" : "manuell", f: { v: "", note: "", ...nowF() }, chk: null }; p._render(); p._renderModal(); }
      if (a === "fuel") { s.tab = "fk"; actFn(p, "entnew", { dataset: { k: q.get("v") || "", v: "tanken" } }); }
      if (a === "stock") { s.tab = "vr"; p._render(); }
    }, 50);
  };
  const page = (p, m) => {
    load(p); const s = S(p), D = s.d;
    if (!D) return `<div class="card empty">${s.err ? esc(s.err) : "Lädt …"}</div>`;
    if (!s.deep) { s.deep = true; deep(p, D, s); }
    const body = s.tab === "con" ? contracts(p, D, s) : s.tab === "met" ? meters(p, D, s) : s.tab === "ab" ? payments(p, D, s) : s.tab === "inv" ? invoices(p, D, s) : s.tab === "fk" ? cars(p, D, s) : s.tab === "vr" ? stocks(p, D, s) : overview(p, D, s);
    return `${hero(p, D)}${tabs(s)}<div class="abpg">${body}</div><div class="stleg abfoot">${ic("package", 14)} Addon · Modul 20 · v${esc((m.ad || {}).version || "")} Build ${(m.ad || {}).build || 1} · Beta · Anbindung der anderen Module folgt mit v0.7 · alles bleibt lokal in Home Assistant${p._admin() ? ` · <button class="lnk" data-act="adxa" data-ad="${ID}" data-a="settings">Einstellungen</button>` : ""}</div>`;
  };

  /* ---------- Fenster ---------- */
  const hd = (t, sub) => `<div class="sh"><div><b>${t}</b><span>${sub}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>`;
  const wrap = (body, wide) => `<div class="ov" data-act="close"></div><div class="sheet${wide ? " wide" : ""} absh" role="dialog" aria-modal="true">${body}</div>`;
  const periodFields = (sp, f) => sp === "wasser"
    ? `<div class="abfs">${inp("frisch", "Frischwasser", nv(f.frisch), { num: 1, unit: "€/m³" })}${inp("abw", "Abwasser", nv(f.abw), { num: 1, unit: "€/m³" })}${inp("zg", "Zählergebühr", nv(f.zg), { num: 1, unit: "€/Monat" })}${inp("nieder", "Niederschlagswasser", nv(f.nieder), { num: 1, unit: "€/m² im Jahr" })}${inp("flaeche", "Versiegelte Fläche", nv(f.flaeche, 0), { num: 1, unit: "m²" })}${inp("ust", "Umsatzsteuer", nv(f.ust, 0), { num: 1, unit: "%" })}</div>`
    : `${sp === "strom" ? `<div class="gschips">${chip("pmode", "fix", "Fester Preis", f.mode !== "dyn")}${chip("pmode", "dyn", "Dynamisch (Börsenpreis)", f.mode === "dyn")}</div>` : ""}
      <div class="abfs">${f.mode === "dyn" ? inp("auf", "Aufschlag auf den Börsenpreis", nv(f.auf), { num: 1, unit: "ct/kWh" }) : inp("ap", sp === "einspeisung" ? "Vergütung" : "Arbeitspreis", nv(f.ap), { num: 1, unit: "ct/kWh" })}${sp !== "einspeisung" ? inp("gp", "Grundpreis", nv(f.gp), { num: 1, unit: "€/Monat" }) + inp("mess", "Messstellenbetrieb", nv(f.mess), { num: 1, unit: "€/Monat", ph: "falls getrennt" }) : ""}${sp === "gas" ? inp("co2", "davon CO₂-Preis", nv(f.co2), { num: 1, unit: "ct/kWh", ph: "nur zur Info" }) : ""}${inp("ust", "Umsatzsteuer", nv(f.ust, 0), { num: 1, unit: "%" })}</div>`;
  const bruttoRow = (f) => `<div class="vrow"><span>Preise sind brutto<small class="mut" style="display:block">Aus: Du gibst netto ein, gerechnet und angezeigt wird immer brutto.</small></span><button class="sw ${f.brutto !== false ? "on" : ""}" data-act="adxa" data-ad="${ID}" data-a="pbrutto" aria-pressed="${f.brutto !== false}" aria-label="Preise sind brutto"></button></div>`;

  /* ---------- Sensor für den Zählerstand: nur fortlaufende Zählerstände vorschlagen ----------
     Ein Zählerstand zählt immer weiter (state_class total/total_increasing) und hat die Einheit des Zählers.
     Nicht geeignet: Tages-/Monatszähler (setzen sich zurück), Prognosen, Momentanwerte (measurement). Bonus: Richtung passt
     (Bezug/Einspeisung), Wert passt zum letzten Ablesestand. Abzug: Zähler eines einzelnen Geräts (Steckdose, Schalter). */
  const norm = (t) => String(t || "").toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");
  const UNIT = { strom_bezug: ["kWh", "Wh", "MWh"], strom_einsp: ["kWh", "Wh", "MWh"], gas: ["m³", "m3"], wasser: ["m³", "m3", "L"], garten: ["m³", "m3", "L"] };
  const UF = { Wh: 0.001, MWh: 1000, L: 0.001 };
  const RX = {
    prog: /forecast|prognose|vorhersage|estimat|geschaetzt|erwartet|solcast|forecast_solar|open_meteo/,
    reset: /heute|today|daily|taeglich|(^|[ _.-])tag([ _.-]|$)|day|reset|monat|month|woche|week|(^|[ _.-])jahr([ _.-]|$)|year|stunde|hour|letzte|last_|session|ladevorgang|accumulated|akkumul/,
    dev: /plug|steckdose|switch|schalter|(^|[ _.-])shelly|aqara|sonoff|tasmota|wallbox|go_?e|waschmaschine|trockner|spuel|kuehl|gefrier|fernseh|(^|[ _.-])tv|pc|computer|lampe|licht|light|pumpe|heizstab|klima|entfeuchter|server|router/,
    bez: /bezug|import|consumption|verbrauch|1[._]?8[._]?0|from_grid|netzbezug|zaehlerstand|meter|obis|bought|purchased/,
    ein: /einspeis|export|feed|2[._]?8[._]?0|to_grid|sold|returned|delivered/,
    gen: /production|erzeugung|solar|(^|[ _.-])pv|ertrag|yield|wechselrichter|inverter|fronius|symo|batter|akku/,
    gas: /gas/, wasser: /wasser|water/, garten: /garten|garden|bewaesser/,
  };
  const rank = (p, art, mt, e) => {
    const H = p._hass, x = H.states[e], at = (x && x.attributes) || {}, en = (H.entities || {})[e] || {}, dv = en.device_id ? (H.devices || {})[en.device_id] || {} : {};
    const name = at.friendly_name || e, t = norm(`${name} ${e} ${dv.name_by_user || dv.name || ""}`), pl = norm(en.platform || ""), u = String(at.unit_of_measurement || ""), why = [], bad = [];
    const sc = at.state_class || "", dc = at.device_class || "";
    if (RX.prog.test(t) || RX.prog.test(pl)) bad.push("Prognose, kein Zählerstand");
    if (at.last_reset || RX.reset.test(t)) bad.push("setzt sich zurück (Tages-, Monats- oder Ladezähler)");
    if (sc === "measurement") bad.push("Momentanwert, zählt nicht weiter");
    let s = 40;
    if (sc === "total_increasing" || sc === "total") { s += 15; why.push("zählt fortlaufend"); } else if (!sc) s -= 10;
    if (["energy", "gas", "water"].includes(dc)) s += 8;
    if (art === "strom_bezug") { if (RX.bez.test(t)) { s += 22; why.push("Bezug"); } if (RX.ein.test(t)) { s -= 40; bad.push("Einspeisung, nicht Bezug"); } else if (RX.gen.test(t)) { s -= 35; bad.push("Erzeugung (Solar/Akku), kein Netzbezug"); } }
    if (art === "strom_einsp") { if (RX.ein.test(t)) { s += 22; why.push("Einspeisung"); } else if (RX.bez.test(t)) { s -= 40; bad.push("Bezug, nicht Einspeisung"); } if (RX.gen.test(t) && !RX.ein.test(t)) { s -= 25; bad.push("Erzeugung der Anlage, nicht die Einspeisung"); } }
    if (art === "gas" && RX.gas.test(t)) { s += 22; why.push("Gas"); }
    if ((art === "wasser" || art === "garten") && RX.wasser.test(t)) { s += 14; why.push("Wasser"); }
    if (art === "garten") { if (RX.garten.test(t)) { s += 18; why.push("Garten"); } else s -= 8; }
    if (art === "wasser" && RX.garten.test(t)) s -= 15;
    if (RX.dev.test(t)) { s -= 28; why.push("misst nur ein Gerät"); }
    const raw = x ? parseFloat(x.state) : NaN, v = isFinite(raw) ? raw * (UF[u] || 1) : null;
    if (v == null) { s -= 20; why.push("liefert gerade nichts"); }
    const last = mt && mt.last ? mt.last.v : null;
    if (v != null && last != null) {
      const days = Math.max(0.5, (Date.now() - Date.parse(mt.last.t)) / 864e5), max = last + Math.max(50, (mt.rate || 0) * days * 4 + 5);
      if (v >= last - 0.5 && v <= max) { s += 35; why.unshift(`passt zu deinem Stand ${num(last, 0)} ${mt.unit}`); }
      else if (v < last * 0.5) { s -= 30; bad.push(`viel kleiner als dein Stand ${num(last, 0)} ${mt.unit}`); }
      else if (v < last - 0.5) { s -= 12; why.push("kleiner als dein letzter Stand"); }
    }
    if (u && u !== "kWh" && u !== "m³") why.push(`${u} → wird umgerechnet`);
    return { e, name, s: Math.max(1, Math.min(99, s - bad.length * 30)), why, bad, v, u: u === "m3" ? "m³" : u, q: norm(`${name} ${e} ${dv.name || ""} ${dv.manufacturer || ""}`) };
  };
  const sensPick = (p, D, m) => {
    const f = m.f, st = p._hass.states, units = UNIT[f.art] || [], mt = f.id ? M(D, f.id) : null;
    const all = Object.keys(st).filter((e) => e.startsWith("sensor.") && units.includes(String((st[e].attributes || {}).unit_of_measurement || ""))).map((e) => rank(p, f.art, mt, e));
    if (f.sensor && !all.some((x) => x.e === f.sensor) && st[f.sensor]) all.push(rank(p, f.art, mt, f.sensor));
    const good = all.filter((x) => !x.bad.length).sort((a, b) => b.s - a.s || a.name.localeCompare(b.name, "de")), bad = all.filter((x) => x.bad.length).sort((a, b) => a.name.localeCompare(b.name, "de"));
    const val = (x) => (x.v == null ? "–" : `${num(x.v, x.v >= 1000 ? 0 : 1)} ${x.u === "Wh" || x.u === "MWh" ? "kWh" : x.u === "L" ? "m³" : x.u}`);
    const row = (x, warn) => `<button class="abss-r${x.e === f.sensor ? " sel" : ""}${warn ? " bad" : ""}" data-act="adxa" data-ad="${ID}" data-a="msens" data-k="${esc(x.e)}" data-q="${esc(x.q)}"><span><b>${esc(x.name)}</b><small>${esc(warn ? x.bad[0] : x.why.join(" · ") || x.e)}</small></span><em>${val(x)}</em></button>`;
    const card = (x, i) => `<div class="abss-c${i === 0 ? " best" : ""}${x.e === f.sensor ? " sel" : ""}"><div class="abss-h"><span><b>${esc(x.name)}</b><small>${esc(x.e)}</small></span><em>${val(x)}</em></div><div class="abss-w">${x.why.map((w) => `<i class="${/^passt|zählt|Bezug|Einspeisung|Gas|Wasser|Garten/.test(w) ? "ok" : /Gerät|kleiner|nichts/.test(w) ? "wa" : ""}">${esc(w)}</i>`).join("")}</div>${x.e === f.sensor ? `<span class="mut sm">${ic("check", 13)} ist gewählt</span>` : `<button class="btn2${i === 0 ? " pri" : ""}" data-act="adxa" data-ad="${ID}" data-a="msens" data-k="${esc(x.e)}">Passt</button>`}</div>`;
    const top = good.slice(0, 3), rest = good.slice(3), lim = m.smore ? rest.length : 0;
    const sel = all.find((x) => x.e === f.sensor);
    const gone = f.sensor && !st[f.sensor];
    const cur = gone ? `<div class="abss-cur bad">${ic("alert", 16)}<span><b>${esc(f.sensor)}</b><small>Diesen Sensor gibt es in Home Assistant nicht mehr. Bitte einen neuen wählen oder von Hand ablesen.</small></span><button class="lnk" data-act="adxa" data-ad="${ID}" data-a="msens" data-k="">Von Hand</button></div>`
      : !f.sensor ? `<div class="abss-cur">${ic("pencil", 16)}<span><b>Von Hand ablesen</b><small>Kein Sensor gewählt – du trägst die Stände selbst ein.</small></span></div>`
      : `<div class="abss-cur${sel && sel.bad.length ? " bad" : ""}">${ic(sel && sel.bad.length ? "alert" : "check", 16)}<span><b>${esc(sel ? sel.name : f.sensor)}</b><small>${sel ? (sel.bad.length ? `Achtung: ${esc(sel.bad.join(", "))}. Der Tagesstand würde falsch gespeichert.` : `${val(sel)} · ${esc(sel.why.join(" · ") || f.sensor)}`) : esc(f.sensor)}</small></span><button class="lnk" data-act="adxa" data-ad="${ID}" data-a="msens" data-k="">Von Hand</button></div>`;
    const list = `<div class="abss-all" hidden>${good.map((x) => row(x)).join("")}${bad.map((x) => row(x, 1)).join("")}<div class="mut sm abss-none" hidden>Nichts gefunden.</div></div>`;
    return `${cur}<div class="abss-q">${ic("search", 16)}<input type="search" data-f="adxq" data-ad="${ID}" placeholder="Sensor suchen: Name, Gerät, Hersteller …" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Sensor suchen"></div>
      <div class="abss-def">${top.length ? `<div class="abss-t">Vorschläge <span class="mut sm">· ${good.length} geeignete von ${all.length} Sensoren mit ${units.filter((u) => u !== "m3").join(" oder ")}</span></div><div class="abss-cs">${top.map(card).join("")}</div>` : `<div class="mut sm" style="margin:6px 0">Kein fortlaufender Zählerstand mit ${units[0]} gefunden. ${f.art.startsWith("strom") ? "Ein Stromzähler-Lesekopf (z. B. Tibber Pulse, Tasmota, ESPHome) liefert ihn." : "Ein Lesekopf am Zähler (z. B. ESPHome) liefert ihn."}</div>`}
        ${rest.length ? `${rest.slice(0, lim).map((x) => row(x)).join("")}${!m.smore ? `<button class="lnk abss-more" data-act="adxa" data-ad="${ID}" data-a="smore">${rest.length} weitere geeignete zeigen</button>` : ""}` : ""}
        ${bad.length ? `<button class="abss-tg" data-act="adxa" data-ad="${ID}" data-a="sbad" aria-expanded="${!!m.sbad}">${ic(m.sbad ? "minus" : "plus", 14)} Nicht geeignet (${bad.length}) <span class="mut sm">· Tageszähler, Prognosen, einzelne Geräte</span></button>${m.sbad ? bad.map((x) => row(x, 1)).join("") : ""}` : ""}</div>${list}`;
  };
  const input = (p, el) => {
    if (el.dataset.f !== "adxq") return false;
    const box = el.closest(".absh") || el.getRootNode(), q = norm(el.value.trim()), words = q.split(/\s+/).filter(Boolean);
    const all = box.querySelector(".abss-all"), def = box.querySelector(".abss-def"); if (!all || !def) return true;
    all.hidden = !q; def.hidden = !!q; let n = 0;
    all.querySelectorAll(".abss-r").forEach((r) => { const ok = words.every((w) => (r.dataset.q || "").includes(w)); r.hidden = !ok; if (ok) n++; });
    const none = all.querySelector(".abss-none"); if (none) none.hidden = n > 0;
    return true;
  };
  const modal = (p, m) => {
    const s = S(p), D = s.d; if (!D) return wrap(hd("Abrechnungen", "Lädt …"));
    const f = m.f || {};
    if (m.k === "c") {
      const sp = f.sparte, neu = !f.id;
      const top = neu && !m.step ? `<div class="lsec">${ic("layers", 15)}Vorlage wählen <span class="mut sm">· nur Felder, keine echten Anbieterpreise</span></div><div class="gschips">${TPL.map(([k, l]) => chip("tpl", k, l, m.tpl === k)).join("")}</div>` : "";
      if (!sp) return wrap(hd("Vertrag hinzufügen", "Modul 20 · gilt für alle Nutzer") + top + `<div class="mut sm">Wähle eine Vorlage. Alle Felder lassen sich danach ändern.</div>`, true);
      const ms = D.meters.filter((x) => (({ strom_bezug: "strom", strom_einsp: "einspeisung", gas: "gas", wasser: "wasser", garten: "wasser" })[x.art]) === sp);
      return wrap(hd(neu ? "Vertrag hinzufügen" : "Vertrag bearbeiten", `${SP[sp][0]} · gilt für alle Nutzer`) + top + `
        <div class="abfs">${inp("anbieter", "Anbieter", f.anbieter, { ph: "z. B. Stadtwerke" })}${inp("tarif", "Tarif", f.tarif)}${inp("nr", "Vertragsnummer", f.nr, { ph: "optional, bleibt lokal" })}${inp("kunde", "Kundennummer", f.kunde, { ph: "optional" })}</div>
        <div class="lsec">${ic("clock", 15)}Laufzeit</div><div class="abfs">${inp("beginn", "Beginn", f.beginn ? de(f.beginn) : "", { ph: "TT.MM.JJJJ" })}${inp("erst", "Ende der Erstlaufzeit", f.erst ? de(f.erst) : "", { ph: "TT.MM.JJJJ" })}${inp("verl", "Verlängerung", nv(f.verl, 0), { num: 1, unit: "Monate" })}${inp("frist", "Kündigungsfrist", nv(f.frist, 0), { num: 1, unit: "Wochen" })}${inp("garantie", "Preisgarantie bis", f.garantie ? de(f.garantie) : "", { ph: "TT.MM.JJJJ" })}${inp("ende", "Vertrag beendet am", f.ende ? de(f.ende) : "", { ph: "leer = läuft" })}</div>
        ${neu ? `<div class="lsec">${ic("euro", 15)}Preis ab Vertragsbeginn</div>${periodFields(sp, f.p || {})}${bruttoRow(f.p || {})}` : ""}
        <div class="lsec">${ic("chart", 15)}Abrechnung</div><div class="abfs">${inp("abr", "Abrechnungsjahr beginnt am", f.abr ? `${f.abr.slice(3)}.${f.abr.slice(0, 2)}.` : "01.01.", { ph: "TT.MM." })}${sp !== "einspeisung" ? inp("ab_betrag", "Abschlag", nv((f.abschlag || {}).betrag), { num: 1, unit: "€" }) + inp("ab_tag", "fällig am", nv((f.abschlag || {}).tag, 0), { num: 1, unit: ". des Monats" }) : ""}${sp !== "wasser" && sp !== "einspeisung" ? inp("bonus", "Bonus im ersten Jahr", nv(f.bonus), { num: 1, unit: "€" }) : ""}</div>
        ${sp !== "einspeisung" ? `<div class="gschips">${chip("cab", "monat", "Abschlag monatlich", (f.abschlag || {}).rhythmus !== "quartal")}${chip("cab", "quartal", "je Quartal", (f.abschlag || {}).rhythmus === "quartal")}</div>` : ""}
        ${sp === "gas" ? `<div class="lsec">${ic("flame", 15)}Umrechnung m³ → kWh <span class="mut sm">· steht auf der letzten Rechnung</span></div><div class="abfs">${inp("brennwert", "Brennwert", nv(f.brennwert, 3), { num: 1, unit: "kWh/m³" })}${inp("zustand", "Zustandszahl", nv(f.zustand, 4), { num: 1 })}</div>` : ""}
        <div class="lsec">${ic("gauge", 15)}Zähler</div><div class="gschips">${ms.map((x) => chip("cmeter", x.id, esc(x.name), (f.meters || []).includes(x.id))).join("") || `<span class="mut sm">Noch kein passender Zähler – du kannst ihn danach im Register „Zähler & Ablesungen“ anlegen.</span>`}</div>
        <div class="foot2" style="margin-top:14px">${neu ? btn("close2", "", "Abbrechen") : m.del ? btn("cdel2", "trash", "Wirklich löschen", { dng: 1 }) : btn("cdel", "trash", "Löschen")}${btn("csave", "check", "Speichern", { pri: 1 })}</div>`, true);
    }
    if (m.k === "p") {
      const c = C(D, m.cid); if (!c) return "";
      return wrap(hd(m.i == null ? "Neuer Preis" : "Preis bearbeiten", `${esc(cname(c))} · ${SP[c.sparte][0]}`) + `<div class="abfs">${inp("ab", "Gültig ab", f.ab ? de(f.ab) : "", { ph: "TT.MM.JJJJ" })}${inp("note", "Notiz", f.note, { ph: "z. B. Preisanpassung angekündigt", wide: 1, max: 60 })}</div>${periodFields(c.sparte, f)}${bruttoRow(f)}
        <div class="mut sm">${ic("info", 14)} Der alte Preis bleibt für die Zeit davor erhalten. Kosten werden am Stichtag tagesgenau geteilt.</div>
        <div class="foot2" style="margin-top:14px">${m.i != null && c.periods.length > 1 ? btn("pdel", "trash", "Diesen Preis löschen") : btn("close2", "", "Abbrechen")}${btn("psave", "check", "Speichern", { pri: 1 })}</div>`);
    }
    if (m.k === "m") {
      return wrap(hd(f.id ? "Zähler bearbeiten" : "Zähler hinzufügen", "Modul 20 · gilt für alle Nutzer") + `<div class="lsec">${ic("gauge", 15)}Art</div><div class="gschips">${Object.entries(ART).map(([k, a]) => chip("mart", k, a[0], f.art === k)).join("")}</div>
        ${f.art ? `<div class="abfs">${inp("name", "Name", f.name, { ph: ART[f.art][0], max: 30 })}${inp("nr", "Zählernummer", f.nr, { ph: "optional, bleibt lokal", max: 30 })}${inp("digits", "Stellen vor dem Komma", nv(f.digits, 0), { num: 1 })}${inp("dec", "Stellen nach dem Komma", nv(f.dec, 0), { num: 1 })}${inp("eich", "Eichfrist bis Jahr", f.eich || "", { num: 1, ph: "z. B. 2032" })}</div>
        <div class="lsec">${ic("link", 15)}Sensor für den Zählerstand <span class="mut sm">· optional: speichert täglich um 0 Uhr einen Stand</span></div>${sensPick(p, D, m)}` : `<div class="mut sm">Wähle zuerst die Art des Zählers.</div>`}
        <div class="foot2" style="margin-top:14px">${!f.id ? btn("close2", "", "Abbrechen") : m.del ? btn("mdel2", "trash", "Wirklich löschen", { dng: 1 }) : btn("mdel", "trash", "Löschen")}${btn("msave", "check", "Speichern", { pri: 1, dis: !f.art })}</div>`, true);
    }
    if (m.k === "r") {
      const mt = M(D, m.mid) || D.meters[0]; if (!mt) return "";
      const v = pn(f.v), chk = m.chk, lv = chk ? chk.level : "";
      return wrap(hd("Zählerstand erfassen", mt.name === ART[mt.art][0] ? esc(mt.name) : `${esc(mt.name)} · ${ART[mt.art][0]}`) + `${D.meters.length > 1 ? `<div class="gschips">${D.meters.map((x) => chip("rmeter", x.id, esc(x.name), x.id === mt.id)).join("")}</div>` : ""}
        <div class="abrin">${rolls(mt, v != null ? v : mt.last ? mt.last.v : null)}<div class="mut sm">${mt.last ? `Letzter Stand ${num(mt.last.v, Math.min(mt.dec, 3))} ${mt.unit} vom ${de(mt.last.t)}${mt.expect != null && mt.rate ? ` · erwartet heute etwa ${num(mt.expect, mt.dec > 1 ? 1 : 0)}` : ""}` : "Erster Stand dieses Zählers."}</div></div>
        <div class="abfs">${inp("v", "Zählerstand", f.v, { num: 1, unit: mt.unit, ph: mt.expect != null ? num(mt.expect, 1) : "" })}${inp("d", "Datum", f.d, { ph: "TT.MM.JJJJ" })}${inp("hh", "Stunde", f.hh, { num: 1, max: 2 })}${inp("mm", "Minute", f.mm, { num: 1, max: 2 })}${inp("note", "Notiz", f.note, { ph: "optional", wide: 1, max: 60 })}</div>
        ${chk ? `<div class="abchk ${lv}">${ic(lv === "ok" ? "check" : "alert", 16)}<span>${esc(chk.msg === "plausibel" ? "Plausibel – passt zum Verlauf." : chk.msg)}</span></div>` : ""}
        <div class="foot2" style="margin-top:14px">${btn("close2", "", "Abbrechen")}${btn("rsave", "check", lv === "warn" ? "Trotzdem speichern" : "Speichern", { pri: 1, dis: v == null || lv === "bad" })}</div>`);
    }
    if (m.k === "ab") {
      const c = C(D, m.cid); if (!c) return "";
      return wrap(hd("Abschlag ändern", `${esc(cname(c))} · ${SP[c.sparte][0]}`) + `${m.empf ? `<div class="abchk ok">${ic("lamp", 16)}<span>Empfehlung: ${num(m.empf.neu, 0)} € – damit endet der Zeitraum bei etwa ± 0 €.</span></div>` : ""}
        <div class="abfs">${inp("betrag", "Neuer Abschlag", f.betrag, { num: 1, unit: "€" })}${inp("ab", "Gültig ab", f.ab, { ph: "TT.MM.JJJJ" })}${inp("tag", "fällig am", f.tag, { num: 1, unit: ". des Monats" })}${inp("note", "Notiz", f.note, { ph: "z. B. mit dem Versorger vereinbart", max: 60 })}</div>
        <div class="gschips">${chip("abr", "monat", "monatlich", f.rhythmus !== "quartal")}${chip("abr", "quartal", "je Quartal", f.rhythmus === "quartal")}</div>
        <div class="mut sm">${ic("info", 14)} Ändere den Abschlag zuerst beim Versorger. Hier trägst du ein, was ab dann abgebucht wird – frühere Abschläge bleiben unverändert.</div>
        <div class="foot2" style="margin-top:14px">${btn("close2", "", "Abbrechen")}${btn("absave", "check", "Speichern", { pri: 1 })}</div>`);
    }
    if (m.k === "pay") {
      const c = C(D, m.cid); if (!c) return "";
      return wrap(hd(m.plan != null ? "Zahlung buchen" : "Sonderzahlung buchen", `${esc(cname(c))} · ${SP[c.sparte][0]}`) + `<div class="abfs">${inp("d", "Datum", f.d, { ph: "TT.MM.JJJJ" })}${inp("betrag", "Betrag", f.betrag, { num: 1, unit: "€" })}${inp("note", "Notiz", f.note, { ph: "optional", wide: 1, max: 60 })}</div>
        <div class="mut sm">${ic("info", 14)} ${m.plan != null ? `Geplant waren ${eur(m.plan)}. Trage ein, was wirklich gezahlt wurde – 0 € heißt ausgefallen.` : "Am Tag eines geplanten Abschlags ersetzt die Buchung den Abschlag, an anderen Tagen zählt sie als Sonderzahlung."}</div>
        <div class="foot2" style="margin-top:14px">${btn("close2", "", "Abbrechen")}${btn("paysave", "check", "Buchen", { pri: 1 })}</div>`);
    }
    if (m.k === "vgl") {
      return wrap(hd("Vergleichspreis", "Strom · dynamisch gegen fest") + `<div class="mut sm" style="margin-bottom:6px">Mit welchem festen Tarif soll Modul 20 deinen dynamischen Tarif vergleichen? Zum Beispiel dein alter Vertrag oder ein aktuelles Angebot.</div>
        <div class="abfs">${inp("name", "Name", f.name, { ph: "z. B. Stadtwerke Fix", max: 30 })}${inp("ap", "Arbeitspreis brutto", f.ap, { num: 1, unit: "ct/kWh" })}${inp("gp", "Grundpreis brutto", f.gp, { num: 1, unit: "€/Monat" })}</div>
        <div class="foot2" style="margin-top:14px">${D.opts.vgl ? btn("vgldel", "trash", "Kein Vergleich") : btn("close2", "", "Abbrechen")}${btn("vglsave", "check", "Speichern", { pri: 1 })}</div>`);
    }
    if (m.k === "set") {
      const o = D.opts, svc = D.notify_svc || [], td = D.todos || [];
      return wrap(hd("Einstellungen · Modul 20", "Abrechnungen · gilt für alle Nutzer") + `<div class="lsec">${ic("bell", 15)}Mitteilungen ans Handy <span class="mut sm">· Stichtag, NFC-Tag, Mindestbestand</span></div>
        <div class="gschips">${svc.map((n) => chip("snot", "notify." + n, n.replace(/^mobile_app_/, "Handy "), (m.f.notify || []).includes("notify." + n))).join("") || `<span class="mut sm">Kein Mitteilungsdienst gefunden (Home-Assistant-App einrichten).</span>`}</div>
        <div class="vrow"><span>Erinnerung am Stichtag<small class="mut" style="display:block">Für Zähler ohne Sensor: Mitteilung mit Link direkt in die Eingabe.</small></span><button class="sw ${m.f.rem ? "on" : ""}" data-act="adxa" data-ad="${ID}" data-a="srem" aria-pressed="${!!m.f.rem}" aria-label="Erinnerung am Stichtag"></button></div>
        <div class="abfs">${inp("tage", "Tage vor dem Stichtag", m.f.tage, { num: 1, ph: "0 = am Stichtag" })}${inp("tol", "Toleranz Rechnungsprüfung", m.f.tol, { num: 1, unit: "%" })}</div>
        <div class="lsec">${ic("list", 15)}To-do-Liste für „nachkaufen“</div><div class="gschips">${chip("stodo", "", "keine", !m.f.todo)}${td.map((e) => chip("stodo", e, e.replace("todo.", ""), m.f.todo === e)).join("")}</div>
        <div class="lsec">${ic("chart", 15)}Jahresverbrauch <span class="mut sm">· für die Hochrechnung, solange Ablesungen fehlen</span></div><div class="abfs">${inp("v_strom", "Strom", m.f.v_strom, { num: 1, unit: "kWh" })}${inp("v_gas", "Gas", m.f.v_gas, { num: 1, unit: "kWh" })}${inp("v_wasser", "Wasser", m.f.v_wasser, { num: 1, unit: "m³" })}${inp("v_einspeisung", "Einspeisung", m.f.v_einspeisung, { num: 1, unit: "kWh" })}</div>
        <div class="foot2" style="margin-top:14px">${btn("close2", "", "Abbrechen")}${btn("ssave", "check", "Speichern", { pri: 1 })}</div>`, true);
    }
    if (m.k === "inv") {
      const cs = D.contracts.filter((c) => c.aktiv || (c.rechnungen || []).length || c.id === f.cid), c = C(D, f.cid), sp = c && c.sparte, zu = sp === "gas" || sp === "wasser" ? "m³" : "kWh";
      return wrap(hd(f.id ? "Rechnung bearbeiten" : "Rechnung hinzufügen", c ? `${esc(cname(c))} · ${SP[sp][0]}` : "Modul 20 · gilt für alle Nutzer") + `<div class="gschips">${cs.map((x) => chip("icon", x.id, `${SP[x.sparte][0].split(" ")[0]} · ${esc(cname(x))}`, x.id === f.cid)).join("")}</div>
        ${c ? `<div class="lsec">${ic("clock", 15)}Zeitraum</div><div class="abfs">${inp("von", "von", f.von, { ph: "TT.MM.JJJJ" })}${inp("bis", "bis", f.bis, { ph: "TT.MM.JJJJ" })}${inp("datum", "Rechnung vom", f.datum, { ph: "TT.MM.JJJJ" })}${inp("nr", "Rechnungsnummer", f.nr, { ph: "optional, bleibt lokal", max: 30 })}</div>
        <div class="lsec">${ic("gauge", 15)}Zähler und Menge laut Rechnung</div><div class="abfs">${inp("anfang", "Anfangsstand", f.anfang, { num: 1, unit: zu })}${inp("ende", "Endstand", f.ende, { num: 1, unit: zu })}${inp("menge", "Verbrauch", f.menge, { num: 1, unit: sp === "wasser" ? "m³" : "kWh" })}${sp === "gas" ? inp("brennwert", "Brennwert", f.brennwert, { num: 1, unit: "kWh/m³" }) + inp("zustand", "Zustandszahl", f.zustand, { num: 1 }) : ""}</div>
        <div class="gschips">${chip("igesch", "1", "Endstand vom Versorger geschätzt", !!f.geschaetzt)}</div>
        <div class="lsec">${ic("euro", 15)}Beträge</div><div class="abfs">${inp("betrag", sp === "einspeisung" ? "Gutschrift gesamt" : "Kosten gesamt (brutto)", f.betrag, { num: 1, unit: "€" })}${inp("angerechnet", sp === "einspeisung" ? "Abschläge erhalten" : "Abschläge angerechnet", f.angerechnet, { num: 1, unit: "€", ph: m.abHint || "" })}${inp("ergebnis", "Ergebnis (+ Guthaben, − Nachzahlung)", f.ergebnis, { num: 1, unit: "€", ph: "wird gerechnet" })}${sp !== "einspeisung" ? inp("neu_abschlag", "Neuer Abschlag laut Rechnung", f.neu_abschlag, { num: 1, unit: "€" }) : ""}${inp("note", "Notiz", f.note, { wide: 1, max: 80, ph: "optional" })}</div>
        <div class="lsec">${ic("upload", 15)}Beleg <span class="mut sm">· PDF oder Foto, bleibt lokal in Home Assistant</span></div>
        <label class="abfile"><input type="file" accept="application/pdf,image/*" data-f="adxfile" data-ad="${ID}">${ic("upload", 18)}<span>${m.beleg ? `${esc(m.beleg.name)} · ${num(m.beleg.size / 1e6, 1)} MB · bereit` : f.beleg ? `${esc(f.beleg.name)} · gespeichert – neue Datei ersetzt ihn` : "Datei oder Foto wählen"}</span></label>${m.belegErr ? `<div class="abchk bad">${ic("alert", 16)}<span>${esc(m.belegErr)}</span></div>` : ""}` : `<div class="mut sm">Zu welchem Vertrag gehört die Rechnung?</div>`}
        <div class="foot2" style="margin-top:14px">${!f.id ? btn("close2", "", "Abbrechen") : m.del ? btn("idel2", "trash", "Wirklich löschen", { dng: 1 }) : btn("idel", "trash", "Löschen")}${btn("isave", "check", m.busy ? "Speichert …" : "Speichern", { pri: 1, dis: !c || m.busy })}</div>`, true);
    }
    if (m.k === "car") {
      const st = p._hass.states, km = Object.keys(st).filter((e) => e.startsWith("sensor.") && /^(km|mi)$/.test(String((st[e].attributes || {}).unit_of_measurement || ""))).sort().slice(0, 12);
      return wrap(hd(f.id ? "Fahrzeug bearbeiten" : "Fahrzeug hinzufügen", "Fahrtkosten · gilt für alle Nutzer") + `<div class="abfs">${inp("name", "Name", f.name, { ph: "z. B. BYD Dolphin", max: 30 })}${inp("start_km", "Kilometerstand heute", f.start_km, { num: 1, unit: "km", ph: "optional" })}</div>
        <div class="lsec">${ic("car", 15)}Antrieb</div><div class="gschips">${Object.entries(AN).map(([k, l]) => chip("can", k, l, f.antrieb === k)).join("")}</div>
        <div class="abfs">${f.antrieb !== "elektro" ? inp("tank", "Tankinhalt", f.tank, { num: 1, unit: "l" }) : ""}${f.antrieb === "elektro" || f.antrieb === "hybrid" ? inp("akku", "Akku", f.akku, { num: 1, unit: "kWh" }) : ""}</div>
        <div class="lsec">${ic("gauge", 15)}Kilometerstand-Sensor <span class="mut sm">· optional, z. B. aus der Hersteller-Integration</span></div><div class="gschips">${chip("cks", "", "keiner – aus den Einträgen", !f.sensor)}${km.map((e) => chip("cks", e, esc((st[e].attributes || {}).friendly_name || e), f.sensor === e)).join("")}</div>
        <div class="lsec">${ic("euro", 15)}Fixkosten im Jahr <span class="mut sm">· für die Vollkosten je km, optional</span></div><div class="abfs">${Object.entries(FX).map(([k, l]) => inp("fx_" + k, l, (f.fix || {})[k] || "", { num: 1, unit: "€" })).join("")}</div>
        <div class="foot2" style="margin-top:14px">${!f.id ? btn("close2", "", "Abbrechen") : m.del ? btn("cardel2", "trash", "Wirklich löschen", { dng: 1 }) : btn("cardel", "trash", "Löschen")}${btn("carsave", "check", "Speichern", { pri: 1 })}</div>`, true);
    }
    if (m.k === "ent") {
      const V = D.fahrzeuge || [], v = V.find((x) => x.id === f.vid) || V[0]; if (!v) return "";
      const arts = Object.keys(EA).filter((k) => v.antrieb === "elektro" ? k !== "tanken" : v.antrieb === "hybrid" ? true : !k.startsWith("laden")), a = f.art, u = EA[a][1];
      return wrap(hd("Tanken oder Laden erfassen", `${esc(v.name)} · ${AN[v.antrieb]}`) + `${V.length > 1 ? `<div class="gschips">${V.map((x) => chip("evid", x.id, esc(x.name), x.id === v.id)).join("")}</div>` : ""}
        <div class="gschips">${arts.map((k) => chip("eart", k, EA[k][0], k === a)).join("")}</div>
        <div class="abfs">${inp("d", "Datum", f.d, { ph: "TT.MM.JJJJ" })}${a === "fix" ? inp("betrag", "Betrag", f.betrag, { num: 1, unit: "€" }) : a === "km" ? "" : inp("menge", a === "tanken" ? "Liter" : "Geladen", f.menge, { num: 1, unit: u }) + inp("preis", a === "tanken" ? "Preis je Liter" : "Preis je kWh", f.preis, { num: 1, unit: "€" }) + inp("betrag", "Betrag", f.betrag, { num: 1, unit: "€" })}${inp("km", "Kilometerstand", f.km, { num: 1, unit: "km", ph: a === "km" ? "" : "für den Verbrauch" })}${inp("note", "Notiz", f.note, { wide: 1, max: 60, ph: a === "laden_weg" ? "z. B. Schnelllader Autobahn" : "optional" })}</div>
        ${a === "tanken" ? `<div class="gschips">${chip("evoll", "1", "Voll getankt", f.voll !== false)}${chip("evoll", "0", "Teilweise", f.voll === false)}</div>` : ""}${a === "fix" ? `<div class="gschips">${Object.entries(FX).map(([k, l]) => chip("efix", k, l, f.fix === k)).join("")}</div>` : ""}
        <div class="mut sm">${ic("info", 14)} ${a === "km" ? "Ein Kilometerstand zwischendurch macht Strecke und Verbrauch genauer." : a === "fix" ? "Einzelne Rechnung, z. B. Inspektion. Feste Jahresbeträge stehen beim Fahrzeug." : "Zwei der drei Werte Menge, Preis und Betrag genügen – der dritte wird gerechnet."}${a === "laden_haus" && D.home_ct != null ? ` Vorbelegt mit deinem Vertragspreis ${num(D.home_ct, 2)} ct/kWh.` : ""}</div>
        <div class="foot2" style="margin-top:14px">${btn("close2", "", "Abbrechen")}${btn("entsave", "check", "Speichern", { pri: 1 })}</div>`, true);
    }
    if (m.k === "item") {
      const st = p._hass.states, cand = Object.keys(st).filter((e) => e.startsWith("sensor.") && /^(l|L|%|t|kg|m³)$/.test(String((st[e].attributes || {}).unit_of_measurement || ""))).sort().slice(0, 12);
      return wrap(hd(f.id ? "Vorrat bearbeiten" : "Vorrat hinzufügen", "Vorräte · gilt für alle Nutzer") + `<div class="gschips">${Object.entries(VA).map(([k, [l]]) => chip("iart", k, l, f.art === k)).join("")}</div>
        ${f.art ? `<div class="abfs">${inp("name", "Name", f.name, { ph: VA[f.art][0], max: 30 })}${inp("unit", "Einheit", f.unit, { ph: VA[f.art][1], max: 8 })}${inp("lager", "Lagergröße", f.lager, { num: 1, unit: f.unit || VA[f.art][1], ph: "Tank, Lager" })}${inp("min", "Mindestbestand", f.min, { num: 1, unit: f.unit || VA[f.art][1] })}${inp("liefer", "Lieferzeit", f.liefer, { num: 1, unit: "Tage" })}${!f.id ? inp("start", "Bestand heute", f.start, { num: 1, unit: f.unit || VA[f.art][1] }) : ""}</div>
        <div class="lsec">${ic("gauge", 15)}Füllstand-Sensor <span class="mut sm">· optional, speichert täglich den Bestand</span></div><div class="gschips">${chip("isens", "", "keiner – zählen oder rechnen", !f.sensor)}${cand.map((e) => chip("isens", e, esc((st[e].attributes || {}).friendly_name || e), f.sensor === e)).join("")}</div>
        ${f.sensor && String((st[f.sensor] || { attributes: {} }).attributes.unit_of_measurement) === "%" ? `<div class="mut sm">Sensor in % – Bestand = Prozent × Lagergröße.</div>` : ""}` : `<div class="mut sm">Wähle zuerst, was du lagerst.</div>`}
        <div class="foot2" style="margin-top:14px">${!f.id ? btn("close2", "", "Abbrechen") : m.del ? btn("itemdel2", "trash", "Wirklich löschen", { dng: 1 }) : btn("itemdel", "trash", "Löschen")}${btn("itemsave", "check", "Speichern", { pri: 1, dis: !f.art })}</div>`, true);
    }
    if (m.k === "bk") {
      const I = D.vorraete || [], it = I.find((x) => x.id === f.id) || I[0]; if (!it) return "";
      const a = f.art, adm = p._admin(), t = it.st, hist = it.buchungen.slice(0, 8).map((b) => `<div class="row2 sm"><em class="abq ${b.art === "kauf" ? "rechnung" : b.src === "sensor" ? "sensor" : ""}">${{ kauf: "Einkauf", entnahme: "Entnahme", zaehlung: "Zählung" }[b.art]}</em><div><b>${b.art === "entnahme" ? "−" : b.art === "kauf" ? "+" : "="}${num(b.menge, b.menge < 20 ? 1 : 0)} ${esc(it.unit)}${b.betrag ? " · " + eur(b.betrag) : ""}</b><small>${de(b.t)}${b.liefer ? " · " + esc(b.liefer) : ""}${b.note ? " · " + esc(b.note) : ""}</small></div>${adm ? `<button class="ibtn sm" data-act="adxa" data-ad="${ID}" data-a="bkdel" data-k="${esc(it.id)}" data-v="${esc(b.id)}" aria-label="Buchung löschen">${ic("trash", 15)}</button>` : ""}</div>`).join("");
      return wrap(hd(esc(it.name), `Bestand ${num(t.bestand, t.bestand < 20 ? 1 : 0)} ${esc(it.unit)}${t.avg ? ` · Ø ${num(t.avg, t.avg < 5 ? 3 : 0)} €/${esc(it.unit)}` : ""}`) + `${I.length > 1 ? `<div class="gschips">${I.map((x) => chip("bkid", x.id, esc(x.name), x.id === it.id)).join("")}</div>` : ""}
        <div class="gschips">${(adm ? ["kauf", "entnahme", "zaehlung"] : ["entnahme", "zaehlung"]).map((k) => chip("bkart", k, { kauf: "Einkauf", entnahme: "Entnahme", zaehlung: "Bestand zählen" }[k], k === a)).join("")}</div>
        <div class="abfs">${inp("menge", a === "zaehlung" ? "Bestand jetzt" : "Menge", f.menge, { num: 1, unit: it.unit })}${a === "kauf" ? inp("betrag", "Betrag gesamt", f.betrag, { num: 1, unit: "€", ph: "inkl. Anfahrt" }) + inp("liefer", "Lieferant", f.liefer, { max: 40, ph: "optional" }) : ""}${inp("d", "Datum", f.d, { ph: "TT.MM.JJJJ" })}${inp("note", "Notiz", f.note, { max: 60, ph: "optional" })}</div>
        ${a === "kauf" && pn(f.menge) && pn(f.betrag) ? `<div class="mut sm">= ${num(pn(f.betrag) / pn(f.menge), 3)} € je ${esc(it.unit)} · neuer Ø-Preis ${num((t.bestand * t.avg + pn(f.betrag)) / (t.bestand + pn(f.menge)), 3)} €</div>` : ""}
        <div class="lsec">${ic("list", 15)}Letzte Buchungen${adm ? `<button class="lnk" style="margin-left:auto" data-act="adxa" data-ad="${ID}" data-a="itemedit" data-k="${esc(it.id)}">Vorrat bearbeiten</button>` : ""}</div>${hist || `<div class="mut sm">Noch keine Buchung.</div>`}
        <div class="foot2" style="margin-top:14px">${btn("close2", "", "Schließen")}${btn("bksave", "check", "Buchen", { pri: 1 })}</div>`, true);
    }
    if (m.k === "x") {
      const mt = M(D, m.mid); if (!mt) return "";
      return wrap(hd("Zähler tauschen", `${esc(mt.name)} · der Verbrauch läuft durch`) + `<div class="mut sm" style="margin-bottom:6px">Trage den letzten Stand des alten Zählers und den ersten Stand des neuen ein. Der Verlauf bleibt erhalten.</div>
        <div class="abfs">${inp("end", "Endstand alter Zähler", f.end, { num: 1, unit: mt.unit })}${inp("start", "Anfangsstand neuer Zähler", f.start, { num: 1, unit: mt.unit, ph: "0" })}${inp("d", "Datum des Wechsels", f.d, { ph: "TT.MM.JJJJ" })}${inp("nr", "Neue Zählernummer", f.nr, { ph: "optional", max: 30 })}${inp("eich", "Eichfrist bis Jahr", f.eich, { num: 1 })}</div>
        <div class="foot2" style="margin-top:14px">${btn("close2", "", "Abbrechen")}${btn("xsave", "check", "Wechsel speichern", { pri: 1 })}</div>`);
    }
    return "";
  };

  /* ---------- Aktionen ---------- */
  const grab = (p) => { const m = p._modal; if (!m || m.type !== "adx" || m.id !== ID || !m.f) return; p.shadowRoot.querySelectorAll(`#modal [data-f="adxf"][data-ad="${ID}"]`).forEach((el) => put(m, el.dataset.k, el.value)); };
  const PK = ["mode", "ap", "auf", "gp", "mess", "co2", "steuer", "ust", "frisch", "abw", "nieder", "flaeche", "zg"];
  const put = (m, k, v) => { const f = m.f; if (m.k === "car" && k.startsWith("fx_")) { (f.fix = f.fix || {})[k.slice(3)] = v; return; } if (m.k === "c" && PK.includes(k)) { (f.p = f.p || {})[k] = v; } else if (k === "ab_betrag" || k === "ab_tag") { (f.abschlag = f.abschlag || {})[k === "ab_betrag" ? "betrag" : "tag"] = v; } else f[k] = v; };
  const period = (f, ab) => { const o = { ab, brutto: f.brutto !== false, note: f.note || "", mode: f.mode === "dyn" ? "dyn" : "fix" }; PK.slice(1).forEach((k) => { const x = pn(f[k]); if (x != null) o[k] = x; }); return o; };
  const nowF = () => { const n = new Date(); return { d: n.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }), hh: String(n.getHours()), mm: String(n.getMinutes()).padStart(2, "0") }; };
  const ts = (f) => { const d = iso(f.d); if (!d) return null; const h = Math.min(23, Math.max(0, parseInt(f.hh, 10) || 0)), mi = Math.min(59, Math.max(0, parseInt(f.mm, 10) || 0)); return `${d}T${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}`; };
  const check = (p) => { const m = p._modal, v = pn(m.f.v), t = ts(m.f); if (v == null || !t) { m.chk = null; p._renderModal(); return; } api.call(ID, "check", { id: m.mid, v, t }).then((r) => { if (p._modal === m) { m.chk = r; p._renderModal(); } }).catch(() => {}); };
  /* Vorbelegung einer neuen Rechnung: das letzte abgeschlossene Abrechnungsjahr des Vertrags */
  const invDefaults = (D, c) => { if (!c) return { cid: "" }; const fc = (D.cards[c.sparte] || {}).id === c.id ? D.cards[c.sparte].fc : null, s0 = fc ? fc.start : D.today, y = +s0.slice(0, 4);
    const bis = new Date(Date.parse(s0) - 864e5).toISOString().slice(0, 10), von = `${y - 1}${s0.slice(4)}`;
    return { cid: c.id, von: de(von), bis: de(bis), datum: "", nr: "", anfang: "", ende: "", menge: "", betrag: "", angerechnet: "", ergebnis: "", neu_abschlag: "", brennwert: c.sparte === "gas" ? num(c.brennwert, 3) : "", zustand: c.sparte === "gas" ? num(c.zustand, 4) : "", geschaetzt: false, note: "" }; };
  const abHint = (D, m) => { m.abHint = ""; };
  const actFn = (p, a, el) => {
    const s = S(p), D = s.d, k = el.dataset.k, v = el.dataset.v, adm = p._admin();
    if (a === "settings") { p._mdActiveSet && p._mdActiveSet(ID); p._render(); if (!D || !adm) { s.tab = "ov"; p._modal = null; p._renderModal(); return; } const o = D.opts, vb = o.verbrauch;
      p._modal = { type: "adx", id: ID, k: "set", f: { notify: [...o.notify], rem: o.remind.on, tage: String(o.remind.tage), tol: num(o.tol, 1), todo: o.todo, v_strom: num(vb.strom, 0), v_gas: num(vb.gas, 0), v_wasser: num(vb.wasser, 0), v_einspeisung: num(vb.einspeisung, 0) } }; p._renderModal(); return; }
    if (a === "isel") { s.iid = k; p._render(); return; }
    if (a === "fkp") { s.fkp = k; p._render(); return; }
    if (a === "tab") { s.tab = k; p._render(); return; }
    if (a === "csel") { s.cid = k; s.tab = "con"; p._render(); return; }
    if (a === "msel") { s.mid = k; p._render(); return; }
    if (a === "ibeleg") { const r = ((D || {}).rechnungen || []).find((x) => x.id === k); if (!r) return; p._toast("Beleg wird geladen …");
      api.call(ID, "beleg_get", { cid: r.cid, id: r.id }).then((b) => { const bin = atob(b.data), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        const url = URL.createObjectURL(new Blob([u8], { type: b.type })), a2 = document.createElement("a"); a2.href = url; a2.download = b.name; a2.target = "_blank"; document.body.appendChild(a2); a2.click(); a2.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000); })
        .catch((e) => p._toast((e && e.message) || "Beleg nicht verfügbar")); return; }
    if (a === "csp") { s.csp = k; s.cmon = -1; p._render(); return; }
    if (a === "cmon") { s.cmon = s.cmon === +k ? -1 : +k; p._render(); return; }
    if (a === "asp") { s.asp = k; p._render(); return; }
    if (a === "close2") { p._modal = null; p._renderModal(); return; }
    if (!D) return;
    const m = p._modal && p._modal.type === "adx" && p._modal.id === ID ? p._modal : null;
    if (m) grab(p);
    /* Ablesen dürfen alle */
    if (a === "read") { const mid = k || s.mid || (D.meters[0] || {}).id; if (!mid) return; p._modal = { type: "adx", id: ID, k: "r", mid, f: { v: "", note: "", ...nowF() }, chk: null }; p._renderModal(); return; }
    if (a === "rmeter") { m.mid = k; m.chk = null; check(p); return; }
    /* Fahrtkosten und Vorräte: erfassen dürfen alle */
    if (a === "entnew") { const V = D.fahrzeuge || []; if (!V.length) { s.tab = "fk"; p._render(); return; } const v = V.find((x) => x.id === k) || V[0], art = v.antrieb === "elektro" ? "laden_haus" : "tanken";
      p._modal = { type: "adx", id: ID, k: "ent", f: { vid: v.id, art: el.dataset.v && EA[el.dataset.v] && !(v.antrieb === "elektro" && el.dataset.v === "tanken") ? el.dataset.v : art, d: nowF().d, menge: "", preis: art === "laden_haus" && D.home_ct != null ? num(D.home_ct / 100, 4) : "", betrag: "", km: "", note: "", voll: true, fix: "wartung" } }; p._renderModal(); return; }
    if (a === "evid") { m.f.vid = k; const v = D.fahrzeuge.find((x) => x.id === k); if (v.antrieb === "elektro" && m.f.art === "tanken") m.f.art = "laden_haus"; if (v.antrieb !== "elektro" && v.antrieb !== "hybrid" && m.f.art.startsWith("laden")) m.f.art = "tanken"; p._renderModal(); return; }
    if (a === "eart") { m.f.art = k; if (k === "laden_haus" && !m.f.preis && D.home_ct != null) m.f.preis = num(D.home_ct / 100, 4); if (k !== "laden_haus" && m.f.preis === num((D.home_ct || 0) / 100, 4)) m.f.preis = ""; p._renderModal(); return; }
    if (a === "evoll") { m.f.voll = k === "1"; p._renderModal(); return; }
    if (a === "efix") { m.f.fix = k; p._renderModal(); return; }
    if (a === "entsave") { const f = m.f, d = iso(f.d); if (!d) { p._toast("Bitte das Datum als TT.MM.JJJJ eingeben"); return; }
      send(p, "entry", { vid: f.vid, entry: { art: f.art, t: `${d}T12:00`, menge: pn(f.menge), preis: pn(f.preis), betrag: pn(f.betrag), km: pn(f.km), voll: f.voll !== false, fix: f.fix, note: f.note || "", src: m.src || "manuell" } }, "Eintrag gespeichert"); return; }
    if (a === "bknew") { const I = D.vorraete || []; if (!I.length) { s.tab = "vr"; p._render(); return; } const it = I.find((x) => x.id === k) || I[0]; p._modal = { type: "adx", id: ID, k: "bk", f: { id: it.id, art: el.dataset.v || (adm ? "kauf" : "entnahme"), menge: "", betrag: "", liefer: "", note: "", d: nowF().d } }; p._renderModal(); return; }
    if (a === "bkid") { m.f.id = k; p._renderModal(); return; }
    if (a === "bkart") { m.f.art = k; p._renderModal(); return; }
    if (a === "bksave") { const f = m.f, x = pn(f.menge), d = iso(f.d); if (x == null) { p._toast("Bitte die Menge eingeben"); return; } if (!d) { p._toast("Bitte das Datum als TT.MM.JJJJ eingeben"); return; }
      const now = new Date(), t = d === new Date(now.getTime() - now.getTimezoneOffset() * 6e4).toISOString().slice(0, 10) ? null : `${d}T12:00`;
      send(p, "book", { id: f.id, art: f.art, menge: x, betrag: pn(f.betrag) || 0, liefer: f.liefer || "", note: f.note || "", t }, { kauf: "Einkauf gebucht", entnahme: "Entnahme gebucht", zaehlung: "Bestand gespeichert" }[f.art]); return; }
    if (a === "take") { send(p, "book", { id: k, art: "entnahme", menge: 1 }, "", () => { p._render(); p._toast("1 entnommen"); }); return; }
    if (a === "rsave") { const x = pn(m.f.v), t = ts(m.f); if (x == null) { p._toast("Bitte den Zählerstand eingeben"); return; } if (!t) { p._toast("Bitte das Datum als TT.MM.JJJJ eingeben"); return; }
      send(p, "read", { id: m.mid, v: x, t, note: m.f.note || "", src: m.src || "manuell", force: !!(m.chk && m.chk.level === "warn") }, "", (r) => { if (r.saved) { s.mid = m.mid; p._modal = null; p._renderModal(); p._render(); p._toast("Zählerstand gespeichert"); } else { m.chk = r.check; p._renderModal(); } }); return; }
    if (!adm) { p._toast("Nur Administratoren können das ändern"); return; }
    if (a === "mirror") { send(p, "opts", { opts: { mirror: !D.opts.mirror } }, "", (r) => { p._render(); p._toast((r.mirrored || []).length ? "Haus-Werte aktualisiert" : D.opts.mirror ? "Ausgeschaltet" : "Eingeschaltet"); }); return; }
    /* Verträge */
    if (a === "cnew") { p._modal = { type: "adx", id: ID, k: "c", f: { meters: [], abr: "01-01", abschlag: { rhythmus: "monat", tag: 1 }, p: { brutto: true } } }; if (k && SP[k]) { const t = TPL.find((x) => x[2].sparte === k); if (t) return actFn(p, "tpl", { dataset: { k: t[0] } }); } p._renderModal(); return; }
    if (a === "tpl") { const t = TPL.find((x) => x[0] === k); if (!t) return; const { p: pp, ...rest } = t[2]; m.tpl = k; m.f = { ...m.f, ...rest, p: { brutto: true, ust: rest.sparte === "wasser" ? 7 : rest.sparte === "einspeisung" ? 0 : 19, ...pp }, brennwert: 11.2, zustand: 0.96, meters: D.meters.filter((x) => (({ strom_bezug: "strom", strom_einsp: "einspeisung", gas: "gas", wasser: "wasser", garten: "wasser" })[x.art]) === rest.sparte).map((x) => x.id) }; p._renderModal(); return; }
    if (a === "cedit") { const c = C(D, k); if (!c) return; p._modal = { type: "adx", id: ID, k: "c", f: JSON.parse(JSON.stringify(c)) }; p._renderModal(); return; }
    if (a === "pmode") { if (m.k === "c") (m.f.p = m.f.p || {}).mode = k; else m.f.mode = k; p._renderModal(); return; }
    if (a === "pbrutto") { const o = m.k === "c" ? (m.f.p = m.f.p || {}) : m.f; o.brutto = o.brutto === false; p._renderModal(); return; }
    if (a === "cab") { (m.f.abschlag = m.f.abschlag || {}).rhythmus = k; p._renderModal(); return; }
    if (a === "cmeter") { const L = m.f.meters || []; m.f.meters = L.includes(k) ? L.filter((x) => x !== k) : [...L, k]; p._renderModal(); return; }
    if (a === "cdel") { m.del = true; p._renderModal(); return; }
    if (a === "cdel2") { send(p, "contract_del", { id: m.f.id }, "Vertrag gelöscht"); s.cid = ""; return; }
    if (a === "csave") {
      const f = m.f, dt = (x) => (x ? iso(x) || x : ""), c = { ...f };
      for (const q of ["beginn", "erst", "garantie", "ende"]) { c[q] = dt(f[q]); if (f[q] && !/^\d{4}-\d{2}-\d{2}$/.test(c[q])) { p._toast("Bitte Datumsangaben als TT.MM.JJJJ eingeben"); return; } }
      const ab = /^(\d{1,2})\.(\d{1,2})\.?$/.exec(String(f.abr || "").trim()); if (ab) c.abr = `${ab[2].padStart(2, "0")}-${ab[1].padStart(2, "0")}`;
      ["verl", "frist", "bonus", "brennwert", "zustand"].forEach((q) => { const x = pn(f[q]); if (x != null) c[q] = x; else delete c[q]; });
      c.abschlag = { rhythmus: (f.abschlag || {}).rhythmus || "monat", betrag: pn((f.abschlag || {}).betrag) || 0, tag: pn((f.abschlag || {}).tag) || 1 };
      if (!f.id) { if (!c.beginn) { p._toast("Bitte den Vertragsbeginn eingeben"); return; } const pp = period(f.p || {}, c.beginn); if (c.sparte !== "wasser" && pp.mode !== "dyn" && pp.ap == null) { p._toast("Bitte den Arbeitspreis eingeben"); return; } if (c.sparte === "wasser" && pp.frisch == null) { p._toast("Bitte den Preis für Frischwasser eingeben"); return; } c.periods = [pp]; }
      delete c.p; delete c.changes; delete c.term; delete c.u; delete c.eff; delete c.aktiv;
      send(p, "contract", { contract: c }, "", (r) => { s.cid = r.saved; s.tab = "con"; p._modal = null; p._renderModal(); p._render(); p._toast((r.mirrored || []).length ? "Gespeichert – Haus-Werte aktualisiert" : "Vertrag gespeichert"); }); return;
    }
    if (a === "pnew" || a === "pedit") { const c = C(D, k); if (!c) return; const i = a === "pedit" ? +v : null, src = i != null ? c.periods[i] : c.periods[c.periods.length - 1]; p._modal = { type: "adx", id: ID, k: "p", cid: c.id, i, f: { ...src, ...(i == null ? { ab: "", note: "" } : {}) } }; p._renderModal(); return; }
    if (a === "psave" || a === "pdel") {
      const c = C(D, m.cid); if (!c) return; let P = c.periods.slice();
      if (a === "pdel") P.splice(m.i, 1);
      else { const ab = iso(m.f.ab); if (!ab) { p._toast("Bitte „Gültig ab“ als TT.MM.JJJJ eingeben"); return; } const pp = period(m.f, ab); if (m.i != null) P[m.i] = pp; else { if (P.some((x) => x.ab === ab)) { p._toast("Für diesen Tag gibt es schon einen Preis"); return; } P.push(pp); } }
      const { changes, term, u, eff, aktiv, ...clean } = c;
      send(p, "contract", { contract: { ...clean, periods: P } }, "", (r) => { p._modal = null; p._renderModal(); p._render(); p._toast((r.mirrored || []).length ? "Preis gespeichert – Haus-Werte aktualisiert" : "Preis gespeichert"); }); return;
    }
    /* Abschläge (v0.3) */
    if (a === "abnew") { const X = D.cards[k]; if (!X) return; const c = C(D, X.id), e = X.fc && X.fc.empf, nx = e ? e.ab : "";
      p._modal = { type: "adx", id: ID, k: "ab", cid: c.id, empf: e && e.show ? e : null, f: { betrag: e && e.show ? num(e.neu, 0) : e && e.next ? num(e.next, 0) : c.abschlag.betrag ? num(c.abschlag.betrag, 2) : "", ab: nx ? de(nx) : nowF().d, tag: String((e && e.tag) || c.abschlag.tag || 1), rhythmus: (e && e.rhythmus) || c.abschlag.rhythmus || "monat", note: "" } }; p._renderModal(); return; }
    if (a === "abr") { m.f.rhythmus = k; p._renderModal(); return; }
    if (a === "absave") { const f = m.f, ab = iso(f.ab), b = pn(f.betrag); if (b == null) { p._toast("Bitte den Betrag eingeben"); return; } if (!ab) { p._toast("Bitte „Gültig ab“ als TT.MM.JJJJ eingeben"); return; }
      send(p, "abplan", { id: m.cid, ab, betrag: b, rhythmus: f.rhythmus, tag: pn(f.tag) || 1, note: f.note || "" }, "Abschlag gespeichert"); return; }
    if (a === "abdel") { send(p, "abplan", { id: k, ab: v, del: true }, "", () => { p._render(); p._toast("Änderung gelöscht"); }); return; }
    if (a === "paynew") { const X = D.cards[k]; if (!X) return; p._modal = { type: "adx", id: ID, k: "pay", cid: X.id, plan: null, f: { d: nowF().d, betrag: "", note: "" } }; p._renderModal(); return; }
    if (a === "payedit") { const c = C(D, k), X = c && D.cards[c.sparte], x = X && X.fc && X.fc.abschlaege.find((y) => y.d === v); if (!x) return; p._modal = { type: "adx", id: ID, k: "pay", cid: c.id, plan: x.plan, f: { d: de(x.d), betrag: num(x.betrag, 2), note: x.note || "" } }; p._renderModal(); return; }
    if (a === "paysave") { const f = m.f, d = iso(f.d), b = pn(f.betrag); if (b == null) { p._toast("Bitte den Betrag eingeben (0 = ausgefallen)"); return; } if (!d) { p._toast("Bitte das Datum als TT.MM.JJJJ eingeben"); return; }
      send(p, "pay", { id: m.cid, d, betrag: b, note: f.note || "" }, "Zahlung gebucht"); return; }
    if (a === "paydel") { send(p, "pay_del", { id: k, d: v }, "", () => { p._render(); p._toast("Buchung gelöscht"); }); return; }
    if (a === "vgl") { const x = D.opts.vgl || {}; p._modal = { type: "adx", id: ID, k: "vgl", f: { name: x.name || "", ap: x.ap ? num(x.ap, 2) : "", gp: x.gp ? num(x.gp, 2) : "" } }; p._renderModal(); return; }
    if (a === "vglsave") { const f = m.f, ap = pn(f.ap); if (ap == null || ap <= 0) { p._toast("Bitte den Arbeitspreis eingeben"); return; } send(p, "vgl", { vgl: { name: f.name || "", ap, gp: pn(f.gp) || 0 } }, "Vergleichspreis gespeichert"); return; }
    if (a === "vgldel") { send(p, "vgl", { vgl: {} }, "Vergleich ausgeschaltet"); return; }
    /* Einstellungen */
    if (a === "snot") { const L = m.f.notify || []; m.f.notify = L.includes(k) ? L.filter((x) => x !== k) : [...L, k]; p._renderModal(); return; }
    if (a === "srem") { m.f.rem = !m.f.rem; p._renderModal(); return; }
    if (a === "stodo") { m.f.todo = k; p._renderModal(); return; }
    if (a === "ssave") { const f = m.f; send(p, "opts", { opts: { notify: f.notify, remind: { on: !!f.rem, tage: pn(f.tage) || 0 }, tol: pn(f.tol) || 2, todo: f.todo || "", verbrauch: { strom: pn(f.v_strom), gas: pn(f.v_gas), wasser: pn(f.v_wasser), einspeisung: pn(f.v_einspeisung) } } }, "Einstellungen gespeichert"); return; }
    /* Rechnungen */
    if (a === "invnew") { const c = D.contracts.find((x) => x.aktiv && x.sparte !== "einspeisung") || D.contracts[0]; p._modal = { type: "adx", id: ID, k: "inv", f: invDefaults(D, c) }; abHint(D, p._modal); p._renderModal(); return; }
    if (a === "icon") { m.f = { ...invDefaults(D, C(D, k)), id: m.f.id }; abHint(D, m); p._renderModal(); return; }
    if (a === "igesch") { m.f.geschaetzt = !m.f.geschaetzt; p._renderModal(); return; }
    if (a === "iedit") { const r = (D.rechnungen || []).find((x) => x.id === k); if (!r) return; const n2 = (v, d) => (v == null ? "" : num(v, d));
      p._modal = { type: "adx", id: ID, k: "inv", f: { id: r.id, cid: r.cid, von: de(r.von), bis: de(r.bis), datum: r.datum ? de(r.datum) : "", nr: r.nr, anfang: n2(r.anfang, 2), ende: n2(r.ende, 2), menge: n2(r.menge, 0), betrag: n2(r.betrag, 2), angerechnet: n2(r.angerechnet, 2), ergebnis: n2(r.ergebnis, 2), neu_abschlag: n2(r.neu_abschlag, 2), brennwert: n2(r.brennwert, 3), zustand: n2(r.zustand, 4), geschaetzt: r.geschaetzt, note: r.note, beleg: r.beleg } }; p._renderModal(); return; }
    if (a === "idel") { m.del = true; p._renderModal(); return; }
    if (a === "idel2") { send(p, "inv_del", { cid: m.f.cid, id: m.f.id }, "Rechnung gelöscht"); s.iid = ""; return; }
    if (a === "isave") { const f = m.f, von = iso(f.von), bis = iso(f.bis), dt = f.datum ? iso(f.datum) : ""; if (!von || !bis) { p._toast("Bitte den Zeitraum als TT.MM.JJJJ eingeben"); return; } if (f.datum && !dt) { p._toast("Bitte das Rechnungsdatum als TT.MM.JJJJ eingeben"); return; } if (pn(f.betrag) == null) { p._toast("Bitte den Betrag der Rechnung eingeben"); return; }
      const inv = { id: f.id || "", von, bis, datum: dt, nr: f.nr || "", note: f.note || "", geschaetzt: !!f.geschaetzt }; ["anfang", "ende", "menge", "betrag", "angerechnet", "ergebnis", "neu_abschlag", "brennwert", "zustand"].forEach((q) => { inv[q] = pn(f[q]); });
      if (inv.angerechnet == null) inv.angerechnet = 0; m.busy = true; p._renderModal();
      api.call(ID, "inv", { cid: f.cid, inv, beleg: m.beleg || null }).then((r) => { s.d = r; s.ts = Date.now(); s.iid = r.saved; s.tab = "inv"; p._modal = null; p._renderModal(); p._render(); p._toast("Rechnung gespeichert"); })
        .catch((e) => { m.busy = false; p._renderModal(); p._toast((e && e.message) || "Das hat nicht geklappt"); }); return; }
    if (a === "ilearn") { const r = (D.rechnungen || []).find((x) => x.id === k); if (!r) return; const keys = r.learn.map((l) => l.k).filter((q) => (s.lk || {})[r.id + q] !== false); if (!keys.length) { p._toast("Bitte mindestens einen Punkt wählen"); return; }
      send(p, "inv_learn", { cid: r.cid, id: r.id, keys }, "", (x) => { p._render(); p._toast((x.done || []).length ? `Übernommen: ${x.done.join(", ")}` : "Nichts zu übernehmen"); }); return; }
    /* Fahrzeuge, Vorräte bearbeiten */
    if (a === "carnew" || a === "caredit") { const v = a === "caredit" ? (D.fahrzeuge || []).find((x) => x.id === k) : null; p._modal = { type: "adx", id: ID, k: "car", f: v ? { id: v.id, name: v.name, antrieb: v.antrieb, tank: num(v.tank, 0), akku: v.akku ? num(v.akku, 1) : "", sensor: v.sensor, start_km: "", fix: Object.fromEntries(Object.entries(v.fix).map(([q, x]) => [q, x ? num(x, 2) : ""])) } : { name: "", antrieb: "benzin", tank: "50", akku: "", sensor: "", start_km: "", fix: {} } }; p._renderModal(); return; }
    if (a === "can") { m.f.antrieb = k; p._renderModal(); return; }
    if (a === "cks") { m.f.sensor = k; p._renderModal(); return; }
    if (a === "cardel") { m.del = true; p._renderModal(); return; }
    if (a === "cardel2") { send(p, "car_del", { id: m.f.id }, "Fahrzeug gelöscht"); return; }
    if (a === "carsave") { const f = m.f, fix = {}; Object.keys(FX).forEach((q) => { fix[q] = pn((f.fix || {})[q]) || 0; });
      send(p, "car", { car: { id: f.id || "", name: f.name || "", antrieb: f.antrieb, tank: pn(f.tank) || 0, akku: pn(f.akku) || 0, sensor: f.sensor || "", fix } }, "", (r) => {
        const km = pn(f.start_km); if (km && !f.id) api.call(ID, "entry", { vid: r.saved, entry: { art: "km", t: new Date().toISOString().slice(0, 16), km, note: "Startstand" } }).then((d2) => { s.d = d2; p._render(); }).catch(() => {});
        s.tab = "fk"; p._modal = null; p._renderModal(); p._render(); p._toast("Fahrzeug gespeichert"); }); return; }
    if (a === "entdel") { send(p, "entry_del", { vid: k, id: v }, "", () => { p._render(); p._toast("Eintrag gelöscht"); }); return; }
    if (a === "itemnew" || a === "itemedit") { const it = a === "itemedit" ? (D.vorraete || []).find((x) => x.id === k) : null; p._modal = { type: "adx", id: ID, k: "item", f: it ? { id: it.id, art: it.art, name: it.name, unit: it.unit, lager: it.lager ? num(it.lager, 2) : "", min: it.min ? num(it.min, 2) : "", liefer: String(it.liefer), sensor: it.sensor } : { art: "", name: "", unit: "", lager: "", min: "", liefer: "7", sensor: "", start: "" } }; p._renderModal(); return; }
    if (a === "iart") { m.f.art = k; if (!m.f.id) m.f.unit = VA[k][1]; p._renderModal(); return; }
    if (a === "isens") { m.f.sensor = k; p._renderModal(); return; }
    if (a === "itemdel") { m.del = true; p._renderModal(); return; }
    if (a === "itemdel2") { send(p, "item_del", { id: m.f.id }, "Vorrat gelöscht"); return; }
    if (a === "itemsave") { const f = m.f, st = p._hass.states[f.sensor];
      send(p, "item", { item: { id: f.id || "", art: f.art, name: f.name || "", unit: f.unit || "", lager: pn(f.lager) || 0, min: pn(f.min) || 0, liefer: pn(f.liefer) == null ? 7 : pn(f.liefer), sensor: f.sensor || "", pct: !!(st && (st.attributes || {}).unit_of_measurement === "%") }, start: pn(f.start) }, "", () => { s.tab = "vr"; p._modal = null; p._renderModal(); p._render(); p._toast("Vorrat gespeichert"); }); return; }
    if (a === "bkdel") { send(p, "book_del", { id: k, bid: v }, "", () => { p._renderModal(); p._render(); p._toast("Buchung gelöscht"); }); return; }
    /* Zähler */
    if (a === "mnew") { p._modal = { type: "adx", id: ID, k: "m", f: { art: "", name: "", nr: "", sensor: "", digits: "", dec: "", eich: "" } }; p._renderModal(); return; }
    if (a === "medit") { const x = M(D, k); if (!x) return; p._modal = { type: "adx", id: ID, k: "m", f: { id: x.id, art: x.art, name: x.name, nr: x.nr, sensor: x.sensor, digits: x.digits, dec: x.dec, eich: x.eich || "" } }; p._renderModal(); return; }
    if (a === "mart") { m.f.art = k; if (!m.f.id) { const e = ["strom_bezug", "strom_einsp"].includes(k); m.f.digits = e ? 6 : 5; m.f.dec = e ? 1 : 3; m.f.sensor = ""; } p._renderModal(); return; }
    if (a === "msens") { m.f.sensor = k; p._renderModal(); return; }
    if (a === "smore") { m.smore = true; p._renderModal(); return; }
    if (a === "sbad") { m.sbad = !m.sbad; p._renderModal(); return; }
    if (a === "mdel") { m.del = true; p._renderModal(); return; }
    if (a === "mdel2") { send(p, "meter_del", { id: m.f.id }, "Zähler gelöscht"); s.mid = ""; return; }
    if (a === "msave") { const f = m.f; send(p, "meter", { meter: { id: f.id || "", art: f.art, name: f.name, nr: f.nr, sensor: f.sensor, digits: pn(f.digits), dec: pn(f.dec), eich: pn(f.eich) || 0 } }, "", (r) => { s.mid = r.saved; s.tab = "met"; p._modal = null; p._renderModal(); p._render(); p._toast("Zähler gespeichert"); }); return; }
    if (a === "rdel") { send(p, "read_del", { id: k, t: v }, "", () => { p._render(); p._toast("Ablesung gelöscht"); }); return; }
    if (a === "swap") { const x = M(D, k); if (!x) return; p._modal = { type: "adx", id: ID, k: "x", mid: x.id, f: { end: "", start: "0", nr: "", eich: "", d: nowF().d } }; p._renderModal(); return; }
    if (a === "xsave") { const f = m.f, d = iso(f.d), e = pn(f.end); if (e == null) { p._toast("Bitte den Endstand eingeben"); return; } if (!d) { p._toast("Bitte das Datum als TT.MM.JJJJ eingeben"); return; } send(p, "swap", { id: m.mid, t: `${d}T12:00`, end: e, start: pn(f.start) || 0, nr: f.nr || null, eich: pn(f.eich) || 0 }, "Zählerwechsel gespeichert"); }
  };
  const readFile = (p, m, file) => {
    m.belegErr = ""; if (!file) return;
    const done = (name, type, data, size) => { if (size > 3e6) { m.belegErr = "Die Datei ist größer als 3 MB. Bitte eine kleinere PDF wählen."; m.beleg = null; } else m.beleg = { name, type, data, size }; p._renderModal(); };
    const asB64 = (blob, cb) => { const r = new FileReader(); r.onload = () => cb(String(r.result).split(",")[1] || ""); r.onerror = () => { m.belegErr = "Die Datei ließ sich nicht lesen."; p._renderModal(); }; r.readAsDataURL(blob); };
    if (/^image\/(jpeg|png|webp)$/.test(file.type) && file.size > 1.2e6) {  /* Fotos verkleinern: längste Seite 2200 px, JPEG 85 % */
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => { const k = Math.min(1, 2200 / Math.max(img.width, img.height)), cv = document.createElement("canvas"); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k); cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url);
        cv.toBlob((b) => asB64(b, (d) => done(file.name.replace(/\.\w+$/, "") + ".jpg", "image/jpeg", d, b.size)), "image/jpeg", .85); };
      img.onerror = () => { URL.revokeObjectURL(url); asB64(file, (d) => done(file.name, file.type, d, file.size)); };
      img.src = url; return;
    }
    const type = file.type || (/\.pdf$/i.test(file.name) ? "application/pdf" : /\.heic$/i.test(file.name) ? "image/heic" : "");
    if (!["application/pdf", "image/jpeg", "image/png", "image/heic", "image/webp"].includes(type)) { m.belegErr = "Als Beleg gehen PDF, JPG, PNG, HEIC oder WebP."; p._renderModal(); return; }
    asB64(file, (d) => done(file.name, type, d, file.size));
  };
  const change = (p, el) => {
    if (el.dataset.f === "adxl") { const s = S(p), r = ((s.d || {}).rechnungen || []).find((x) => x.id === s.iid) || ((s.d || {}).rechnungen || [])[0]; if (r) s.lk[r.id + el.dataset.k] = el.checked; return; }
    const m = p._modal;
    if ((!m || m.type !== "adx" || m.id !== ID) && el.dataset.k === "trip") { S(p).trip = el.value; p._render(); return; }
    if (!m || m.type !== "adx" || m.id !== ID || !m.f) return;
    if (el.dataset.f === "adxfile") { grab(p); readFile(p, m, el.files && el.files[0]); return; }
    put(m, el.dataset.k, el.value);
    if (m.k === "r" && ["v", "d", "hh", "mm"].includes(el.dataset.k)) check(p);
  };

  const css = `
.a-${ID}{--a1:#e8b84a;--a2:#3d2c07}.a-${ID} .abhb{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;position:relative;z-index:1}.a-${ID} .abhb .btn2{flex:none;padding:9px 14px;display:inline-flex;gap:7px;align-items:center;background:rgba(10,14,20,.45);border-color:rgba(255,255,255,.22);color:#fff}.a-${ID} .abhb .btn2.pri{background:#f5c451;border-color:#f5c451;color:#2a1d02}
.a-${ID} .chip .gx{vertical-align:-3px;margin-right:4px}
.abtabs{display:flex;gap:8px;overflow-x:auto;margin:12px 0;padding-bottom:2px;scrollbar-width:none}.abtabs button{flex:none;border:1px solid var(--line);background:var(--card);color:var(--mut);border-radius:999px;padding:8px 16px;font:inherit;font-size:.9rem;font-weight:600;cursor:pointer;white-space:nowrap}
.abtabs button.on{background:#f5c451;border-color:#f5c451;color:#2a1d02}.abtabs button.soon{opacity:.5;cursor:default}.abtabs button.soon em{font-style:normal;font-size:.68rem;margin-left:6px;padding:1px 6px;border-radius:6px;background:var(--line)}
.abgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:12px}@media(max-width:1100px){.abgrid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.abgrid{grid-template-columns:minmax(0,1fr)}}
.abc{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:14px 16px;cursor:pointer;display:flex;flex-direction:column;gap:2px;min-width:0}.abc.empty{cursor:default;opacity:.92}.abc:focus-visible{outline:2px solid var(--c)}
.abch{display:flex;gap:10px;align-items:center;margin-bottom:8px}.abch b{display:block;font-size:1.02rem}.abch small{color:var(--mut);font-size:.76rem}.abcb{margin-top:10px}.abcb .btn2{width:100%;display:inline-flex;gap:6px;justify-content:center;align-items:center;padding:9px}
.abr{display:flex;justify-content:space-between;gap:10px;padding:5px 0;font-size:.86rem;border-top:1px solid color-mix(in srgb,var(--line) 60%,transparent)}.abr:first-of-type{border-top:0}.abr span{color:var(--mut)}.abr b{text-align:right;font-weight:600;white-space:nowrap}.abbox .abr b{white-space:normal}.abr b.hl,.abr.hl b{color:#f5c451}.abr.sub span{padding-left:12px}.abr.sub b{font-weight:500;color:var(--mut)}
.abk{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.abk>div{background:color-mix(in srgb,var(--c) 12%,transparent);border-radius:12px;padding:8px 10px}.abk small{display:block;color:var(--mut);font-size:.7rem}.abk b{font-size:1.12rem}.abc .mut.sm{margin-top:6px}.abhint{display:flex;gap:6px;align-items:flex-start}
.ab2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:12px;align-items:start}.ab2.w{grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)}.ab2.in{margin:0}@media(max-width:860px){.ab2,.ab2.w{grid-template-columns:minmax(0,1fr)}}
.abev{display:grid;grid-template-columns:30px minmax(0,1fr) auto;gap:10px;align-items:center;padding:9px 0;border-top:1px solid var(--line)}.abev:first-of-type{border-top:0}.abei{color:var(--mut);display:flex}.abev.wa .abei,.abev.wa .abed b{color:#f59e0b}.abev.ok .abed b{color:#34d399}
.abet b,.abed b{display:block;font-size:.9rem}.abet small,.abed small{color:var(--mut);font-size:.76rem}.abed{text-align:right;white-space:nowrap}
.absrc{font-style:normal;font-size:.68rem;font-weight:700;margin-left:8px;padding:1px 7px;border-radius:6px;background:var(--line);color:var(--mut)}.absrc.m{background:color-mix(in srgb,#f5c451 22%,transparent);color:#f5c451}
.abst{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.abst>div{border:1px solid var(--line);border-radius:14px;padding:10px 12px;opacity:.6}.abst>div.on{opacity:1;border-color:#f5c451}.abst em{font-style:normal;font-size:.7rem;font-weight:800;color:#f5c451}.abst b{display:block;font-size:.9rem}.abst small{color:var(--mut);font-size:.74rem}@media(max-width:700px){.abst{grid-template-columns:1fr 1fr}}
.abcon{display:grid;grid-template-columns:260px minmax(0,1fr);gap:12px;align-items:start}@media(max-width:860px){.abcon{grid-template-columns:1fr}.ablist{flex-direction:row!important;overflow-x:auto}.abli{flex:none;min-width:200px}}
.ablist{display:flex;flex-direction:column;gap:8px}.abli{all:unset;box-sizing:border-box;display:flex;gap:10px;align-items:center;padding:12px 14px;border-radius:16px;background:var(--card);border:1px solid var(--line);cursor:pointer}.abli.sel{border-color:var(--c);box-shadow:inset 0 0 0 1px var(--c)}.abli.off{opacity:.6}.abli b{display:block;font-size:.92rem}.abli small{color:var(--mut);font-size:.74rem}.abli.add{border-style:dashed;color:var(--mut);justify-content:center}
.abdh{display:flex;gap:12px;align-items:center;margin-bottom:12px}.abdh>div{flex:1;min-width:0}.abdh b{display:block;font-size:1.25rem}.abdh small{color:var(--mut);font-size:.8rem}.abdb .btn2{padding:8px 12px;display:inline-flex;gap:6px;align-items:center}.abtag{font-style:normal;font-size:.68rem;padding:2px 8px;border-radius:6px;background:var(--line);color:var(--mut);vertical-align:3px}
.abbox{border:1px solid var(--line);border-radius:14px;padding:10px 12px}.abbh{font-weight:700;font-size:.9rem;display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:4px}.abbh small{color:var(--mut);font-weight:500;font-size:.72rem}
.abtl{margin:8px 0 4px}.abtlb{position:relative;height:8px;border-radius:5px;background:var(--line);margin:14px 0 8px}.abtlb .run{position:absolute;left:0;top:0;bottom:0;border-radius:5px;background:var(--c)}.abtlb .gar{position:absolute;left:0;top:11px;height:3px;border-radius:2px;background:#34d399}
.abtlb .mk{position:absolute;top:-5px;width:12px;height:12px;margin-left:-6px;border-radius:50%;background:var(--c);border:2px solid var(--card)}.abtlb .mk.now{background:#fff;width:3px;margin-left:-1.5px;border-radius:2px;top:-7px;height:22px;border:0}.abtlb .mk.kb{background:#f5c451}.abtlb .mk.end{background:#e6edf3}
.abtll{display:flex;justify-content:space-between;gap:8px;font-size:.74rem;color:var(--mut);flex-wrap:wrap;margin-top:10px}.abtll .kb{color:#f5c451;font-weight:600}.abdot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}
.abpvs{display:flex;flex-direction:column}.abpv{display:grid;grid-template-columns:86px minmax(0,1.2fr) minmax(0,1.3fr) auto 30px;gap:10px;align-items:center;padding:7px 0;border-top:1px solid var(--line);font-size:.86rem}.abpv:first-child{border-top:0}.abpv em{font-style:normal;font-size:.74rem;padding:2px 7px;border-radius:6px;background:var(--line);text-align:center}.abpv.cur em{background:#f5c451;color:#2a1d02;font-weight:700}.abpv.fut em{background:color-mix(in srgb,#f59e0b 25%,transparent);color:#fbbf24}
.abpv small{color:var(--mut)}.abpv b{font-size:.8rem;text-align:right}.abpv b.up{color:#f87171}.abpv b.dn{color:#34d399}.absh .ibtn.sm,.abpg .ibtn.sm{width:30px;height:30px;min-width:0;min-height:0;padding:0;margin:0;display:grid;place-items:center}.abpg .btn2.pri{background:#f5c451;border-color:#f5c451;color:#2a1d02}.abpg .gbtns .btn2{display:inline-flex;gap:6px;align-items:center;justify-content:center}@media(max-width:700px){.abpv{grid-template-columns:78px minmax(0,1fr) auto 30px}.abpv small{display:none}}
.abms{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px;margin-bottom:12px}.abm{all:unset;box-sizing:border-box;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:12px 14px;cursor:pointer;display:flex;flex-direction:column;gap:8px}.abm.sel{border-color:#f5c451;box-shadow:inset 0 0 0 1px #f5c451}.abm.add{border-style:dashed;align-items:center;justify-content:center;color:var(--mut);min-height:120px}
.abmh{display:flex;gap:10px;align-items:center}.abmh b{display:block}.abmh small{color:var(--mut);font-size:.74rem}.abmf{display:flex;justify-content:space-between;align-items:center;font-size:.76rem;color:var(--mut)}
.abroll{display:flex;gap:3px}.abroll i{font-style:normal;font-variant-numeric:tabular-nums;font-weight:800;font-size:1.25rem;width:1.35em;height:1.55em;display:grid;place-items:center;border-radius:6px;background:#0b0f14;color:#f1f5f9;box-shadow:inset 0 0 0 1px #2a3440}.abroll i.r{background:#7f1d1d;color:#fff}.abroll .e{color:var(--mut);font-size:.84rem;padding:8px 0}
.abq{font-style:normal;font-size:.68rem;font-weight:700;padding:2px 8px;border-radius:6px;background:var(--line);color:var(--mut);white-space:nowrap;justify-self:start}.abq.auto,.abq.sensor{background:color-mix(in srgb,#34d399 20%,transparent);color:#6ee7b7}.abq.nfc{background:color-mix(in srgb,#a78bfa 22%,transparent);color:#c4b5fd}.abq.rechnung,.abq.start{background:color-mix(in srgb,#f5c451 22%,transparent);color:#f5c451}
.abrds{display:flex;flex-direction:column;max-height:420px;overflow:auto}.abrd{display:grid;grid-template-columns:86px 110px minmax(70px,1fr) auto minmax(0,1fr) 30px;gap:10px;align-items:center;padding:7px 0;border-top:1px solid var(--line);font-size:.86rem}.abrd:first-child{border-top:0}@media(max-width:700px){.abrd{grid-template-columns:78px 1fr auto 30px}.abrd>span:nth-of-type(2),.abrd>span.sm{display:none}}
.absh .abfs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:8px 0}.abf{display:flex;flex-direction:column;gap:4px;font-size:.76rem;color:var(--mut);min-width:0}.abf.w{grid-column:1/-1}.abf em{font-style:normal;opacity:.8}.abf input{font:inherit;font-size:.95rem;padding:9px 11px;border-radius:11px;border:1px solid var(--line);background:transparent;color:var(--primary-text-color);min-width:0;width:100%;box-sizing:border-box}.abf input:focus{outline:2px solid #f5c451;border-color:transparent}
@media(max-width:480px){.absh .abfs{grid-template-columns:1fr}}.absh .btn2{display:inline-flex;gap:6px;align-items:center;justify-content:center}.absh .btn2.pri{background:#f5c451;border-color:#f5c451;color:#2a1d02}.absh .btn2.dng{background:#ef4444;border-color:#ef4444;color:#fff}
.abrin{display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px;border-radius:16px;background:color-mix(in srgb,var(--line) 40%,transparent);margin:8px 0;text-align:center}.abrin .abroll i{font-size:1.6rem}
.abchk{display:flex;gap:8px;align-items:flex-start;padding:10px 12px;border-radius:12px;font-size:.86rem;margin-top:4px}.abchk.ok{background:color-mix(in srgb,#34d399 14%,transparent);color:#6ee7b7}.abchk.warn{background:color-mix(in srgb,#f59e0b 16%,transparent);color:#fbbf24}.abchk.bad{background:color-mix(in srgb,#ef4444 16%,transparent);color:#fca5a5}
.abfoot{margin-top:6px}
/* v0.3: Banner mit Szene */
.a-${ID} .big small{font-size:1.05rem;font-weight:600;margin-left:10px;color:#fde68a;letter-spacing:0}.a-${ID} .abband{display:block;margin-top:3px;font-size:.8rem;opacity:.75}
.a-${ID}.abhs{min-height:236px}.a-${ID}.abhs .mlogo{top:16px;right:16px;transform:none;width:64px;height:64px;border-radius:19px;background:rgba(15,23,42,.42);backdrop-filter:blur(8px);color:#fff;border-color:rgba(255,255,255,.25)}
.a-${ID}.abhs .lbl,.a-${ID}.abhs .sub,.a-${ID}.abhs .big,.a-${ID}.abhs .chips{max-width:calc(100% - 470px)}
.absc{position:absolute;right:96px;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:10px;pointer-events:none}
.abhouse{position:relative;width:132px;height:150px;display:grid;place-items:end center}.abhouse .absy{position:absolute;left:50%;bottom:-6px;transform:translateX(-50%);display:flex;gap:2px}
.abrings{display:grid;grid-template-columns:repeat(2,auto);gap:4px 10px}.abrings.n1{grid-template-columns:auto}.abrings.n3>:nth-child(3){grid-column:1/-1;justify-self:center}
.abring{display:flex;flex-direction:column;align-items:center;gap:0}.abring span{font-size:.72rem;color:#fde68a;white-space:nowrap;margin-top:-2px}.abring .rb{fill:none;stroke:rgba(255,255,255,.14);stroke-width:7}.abring text{fill:#fff;font-weight:800;font-size:15px}
.abrm{display:none}
@media(max-width:1100px){.a-${ID}.abhs .lbl,.a-${ID}.abhs .sub,.a-${ID}.abhs .big,.a-${ID}.abhs .chips{max-width:calc(100% - 90px)}.absc{display:none}.abrm{display:flex;gap:6px;justify-content:space-around;margin-top:14px;position:relative;z-index:1}.abrm .abring svg{width:70px;height:70px}.a-${ID}.abhs{min-height:0}}
@media(max-width:560px){.a-${ID} .big small{display:block;margin:2px 0 0}.a-${ID} .chips{display:none}.abrm .abring svg{width:62px;height:62px}.abrm .abring span{font-size:.66rem;white-space:normal;text-align:center}.a-${ID} .abhb .btn2{flex:1 1 auto;justify-content:center}.abk3,.abvs{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.abk3>div:last-child,.abvs>div:last-child{grid-column:1/-1}.abcur h2{flex-wrap:wrap}.abcur h2 .hzrt{width:100%;margin:6px 0 0}.abcur h2 .gschips{flex-wrap:wrap}.abcur h2 .hzrt{white-space:normal;overflow:visible;max-width:none}.abk3 b,.abvs b{font-size:.98rem;white-space:nowrap}}
/* Spartenkarte 2.0 */
.abbar{height:8px;border-radius:99px;background:var(--line);margin:10px 0 4px;overflow:hidden}.abbar i{display:block;height:100%;border-radius:99px;background:var(--c)}
.abbf{display:flex;justify-content:space-between;gap:8px;font-size:.72rem;color:var(--mut);white-space:nowrap}@media(max-width:560px){.abr b{white-space:normal}}.abamp{display:flex;gap:7px;align-items:baseline;font-weight:700;font-size:.84rem;margin-top:8px;line-height:1.3}.abamp i{flex:none;width:8px;height:8px;border-radius:50%;background:currentColor;transform:translateY(-1px)}
.abamp.ok{color:#34d399}.abamp.wa{color:#f59e0b}.abamp.mu{color:var(--mut)}.abr b.ok{color:#34d399}.abr b.bad{color:#f87171}
/* Jahreskurve und Balken */
.abch2{width:100%;height:auto;display:block;margin-top:4px}.abch2 .gl{stroke:var(--line);stroke-width:1}.abch2 .tx{fill:var(--mut);font-size:11px}.abch2 .tx.on{fill:var(--primary-text-color);font-weight:700}.abch2 .tx.b{font-size:13px;font-weight:800}.abch2 .tx.ok{fill:#34d399}.abch2 .tx.wa{fill:#f59e0b}
.abch2 .now{stroke:var(--primary-text-color);stroke-opacity:.35;stroke-dasharray:3 3}.abch2 .hit{fill:transparent;cursor:pointer}.abch2 .hit:hover,.abch2 .hit.on{fill:color-mix(in srgb,var(--primary-text-color) 6%,transparent)}
.abcur h2 .gschips{margin:0;flex-wrap:nowrap}.abcur h2 .gsch{padding:4px 10px;font-size:.78rem}
.ablg{display:flex;gap:14px;flex-wrap:wrap;font-size:.74rem;color:var(--mut);margin-top:4px}.ablg i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px;vertical-align:0}.ablg i.d{width:14px;height:0;border-radius:0;border-top:2px dashed;vertical-align:3px}.ablg i.h{opacity:.35;border-radius:2px}
.abmd{display:flex;gap:6px 16px;flex-wrap:wrap;margin-top:10px;padding:9px 12px;border-radius:12px;background:color-mix(in srgb,var(--line) 45%,transparent);font-size:.84rem}.abmd span{color:var(--mut)}.abmd0{margin-top:8px}
/* Abschläge */
.abk3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.abk3>div{background:color-mix(in srgb,var(--line) 45%,transparent);border-radius:12px;padding:8px 10px}.abk3 small{display:block;color:var(--mut);font-size:.7rem}.abk3 b{font-size:1.1rem}.abk3 .ok{background:color-mix(in srgb,#34d399 15%,transparent)}.abk3 .ok b{color:#34d399}.abk3 .wa{background:color-mix(in srgb,#f59e0b 15%,transparent)}.abk3 .wa b{color:#f59e0b}
.abem{display:flex;gap:12px;align-items:center}.abem small{display:block;color:var(--mut);font-size:.82rem}.abem b{display:block;font-size:1.7rem;font-weight:800;margin:2px 0}.abem b span{color:#f5c451}.abem b.ok{color:#34d399}.abem b.wa{color:#f59e0b}.abem small b.in{display:inline;font-size:inherit;margin:0;color:var(--primary-text-color)}
.abwhy{margin-top:12px;font-size:.86rem;line-height:1.45}.abwhy ul{margin:4px 0 0;padding-left:18px;color:var(--mut)}
.abpys{display:flex;flex-direction:column;max-height:380px;overflow:auto}.abpy{display:grid;grid-template-columns:96px 96px auto minmax(0,1fr) 30px;gap:10px;align-items:center;padding:7px 0;border-top:1px solid var(--line);font-size:.86rem}.abpy:first-child{border-top:0}.abpy em{font-style:normal;color:var(--mut)}.abpy b{text-align:right}.abpy small{color:var(--mut);font-size:.76rem}.abpy.ok small{color:#34d399}
@media(max-width:700px){.abpy{grid-template-columns:84px 80px minmax(0,1fr) 30px}.abpy .abq{display:none}}
.abvs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.abvs>div{background:color-mix(in srgb,var(--line) 45%,transparent);border-radius:12px;padding:8px 10px}.abvs small{display:block;color:var(--mut);font-size:.7rem}.abvs b{font-size:1.05rem}.abvs .ok{background:color-mix(in srgb,#34d399 15%,transparent)}.abvs .ok b{color:#34d399}.abvs .wa{background:color-mix(in srgb,#f59e0b 15%,transparent)}.abvs .wa b{color:#f59e0b}
.abpg>.gschips{margin:0 0 10px}
/* Sensor für den Zählerstand */
.abss-cur{display:flex;gap:10px;align-items:center;padding:10px 12px;border-radius:12px;background:color-mix(in srgb,#34d399 12%,transparent);color:#6ee7b7;margin:6px 0 10px}.abss-cur span{flex:1;min-width:0}.abss-cur b{display:block;color:var(--primary-text-color)}.abss-cur small{display:block;color:var(--mut);font-size:.78rem}.abss-cur.bad{background:color-mix(in srgb,#f59e0b 16%,transparent);color:#fbbf24}.abss-cur .lnk{flex:none}
.abss-q{display:flex;gap:8px;align-items:center;border:1px solid var(--line);border-radius:12px;padding:0 12px;margin-bottom:10px;color:var(--mut)}.abss-q input{flex:1;border:0;background:transparent;color:var(--primary-text-color);font:inherit;font-size:.95rem;padding:10px 0;outline:0;min-width:0}
.abss-t{font-weight:700;font-size:.86rem;margin:2px 0 6px}.abss-cs{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px;margin-bottom:8px}
.abss-c{border:1px solid var(--line);border-radius:14px;padding:10px 12px;display:flex;flex-direction:column;gap:7px}.abss-c.best{border-color:#f5c451;box-shadow:inset 0 0 0 1px #f5c451}.abss-c.sel{border-color:#34d399;box-shadow:inset 0 0 0 1px #34d399}
.abss-h{display:flex;gap:8px;align-items:flex-start}.abss-h span{flex:1;min-width:0}.abss-h b{display:block;font-size:.88rem;line-height:1.25}.abss-h small{display:block;color:var(--mut);font-size:.7rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.abss-h em,.abss-r em{font-style:normal;font-weight:700;font-size:.84rem;white-space:nowrap;font-variant-numeric:tabular-nums}
.abss-w{display:flex;flex-wrap:wrap;gap:4px}.abss-w i{font-style:normal;font-size:.7rem;padding:2px 7px;border-radius:6px;background:var(--line);color:var(--mut)}.abss-w i.ok{background:color-mix(in srgb,#34d399 18%,transparent);color:#6ee7b7}.abss-w i.wa{background:color-mix(in srgb,#f59e0b 18%,transparent);color:#fbbf24}
.abss-c .btn2{padding:7px 10px;justify-content:center;flex:none;min-height:0;margin-top:auto}.abss-c .btn2.pri{background:#f5c451;border-color:#f5c451;color:#2a1d02}
.abss-r{all:unset;box-sizing:border-box;display:flex;gap:10px;align-items:center;width:100%;padding:8px 10px;border-radius:10px;cursor:pointer}.abss-r:hover{background:color-mix(in srgb,var(--line) 50%,transparent)}.abss-r span{flex:1;min-width:0}.abss-r b{display:block;font-size:.88rem;font-weight:600}.abss-r small{display:block;color:var(--mut);font-size:.72rem}.abss-r.bad b{color:var(--mut)}.abss-r.bad small{color:#fbbf24}.abss-r.sel{background:color-mix(in srgb,#34d399 14%,transparent)}.abss-r[hidden]{display:none}
.abss-more{display:block;margin:4px 0 6px}.abss-tg{all:unset;box-sizing:border-box;display:flex;gap:6px;align-items:center;width:100%;padding:9px 2px;margin-top:4px;border-top:1px solid var(--line);font-size:.86rem;font-weight:600;cursor:pointer}
/* v0.5 */
.abtabs button.on{background:#f5c451}.abli em{margin-left:auto;font-style:normal;font-weight:800;text-align:right;white-space:nowrap}.abli em small{display:block;font-weight:500;color:var(--mut);font-size:.7rem}.abli em.ok{color:#34d399}.abli em.wa{color:#f59e0b}.abli i.abwa{font-style:normal}
.abwa{color:#f59e0b}.abok{color:#34d399}.abna{color:var(--mut);text-align:center}.abprs{display:flex;flex-direction:column}.abpr{display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:8px;align-items:center;padding:8px 0;border-top:1px solid var(--line);font-size:.88rem}.abpr:first-child{border-top:0}.abpr b{font-size:.84rem;white-space:nowrap}.abpr b.ok{color:#34d399}.abpr b.wa{color:#f59e0b}.abpr b.mut{color:var(--mut)}
.abdet .abk3{margin:4px 0 6px}.mut b.tx{color:var(--primary-text-color)}.mut b.hl{color:#f5c451}.abln{margin-top:12px;border:1px solid var(--line);border-radius:14px;padding:10px 12px}.abln .abbh small{color:#34d399}.abcb{display:flex;gap:9px;align-items:center;padding:5px 0;font-size:.88rem;cursor:pointer}.abcb input{width:18px;height:18px;accent-color:#f5c451}
.abdb{display:flex;gap:6px}@media(max-width:560px){.abdh{flex-wrap:wrap}.abdh>div{flex:1 1 calc(100% - 64px)}.abdb{width:100%}.abdb .btn2{flex:1;justify-content:center}.abdh b{font-size:1.08rem}}.abfile{display:flex;gap:10px;align-items:center;padding:12px 14px;border:1px dashed var(--line);border-radius:14px;cursor:pointer;color:var(--mut);font-size:.88rem}.abfile input{position:absolute;opacity:0;width:1px;height:1px}.abfile:hover{border-color:#f5c451;color:var(--primary-text-color)}
.abfkh{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px}.abfkh .gschips{margin:0}.abfkh .gbtns{margin:0;display:flex;gap:8px;flex-wrap:wrap}.abfkh .gbtns .btn2{flex:none;white-space:nowrap;padding:9px 14px}.abfkh .btn2{display:inline-flex;gap:6px;align-items:center}.abfkh .btn2.pri{background:#f5c451;border-color:#f5c451;color:#2a1d02}
.abcar .abch{margin-bottom:6px}.abcar .abch>div:nth-child(2){flex:1;min-width:0}.abbig{text-align:right}.abbig b{display:block;font-size:1.75rem;font-weight:800;color:var(--c);letter-spacing:-.02em}.abbig small{color:var(--mut);font-size:.74rem}
.abr2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 22px}.abr2 .abr:nth-child(2){border-top:0}.abseg{display:flex;height:11px;border-radius:99px;overflow:hidden;margin:10px 0 6px;background:var(--line)}.abspk{width:100%;height:40px;margin-top:8px;display:block}
.ab3{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:12px;margin-bottom:12px;align-items:start}@media(max-width:860px){.ab3{grid-template-columns:minmax(0,1fr)}.abr2{grid-template-columns:minmax(0,1fr)}.abr2 .abr:nth-child(2){border-top:1px solid color-mix(in srgb,var(--line) 60%,transparent)}}
.row2{display:grid;grid-template-columns:32px minmax(0,1fr) auto auto;gap:10px;align-items:center;padding:8px 0;border-top:1px solid var(--line);font-size:.88rem}.row2:first-of-type{border-top:0}.row2 b{display:block}.row2 small{color:var(--mut);font-size:.76rem}.row2 .r{text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:3px}.row2 .r.bad b{color:#f87171}.row2 .r.ok b{color:#34d399}.row2 .r small.wa{color:#f59e0b}.row2[role=button]{cursor:pointer}.row2.sm{grid-template-columns:auto minmax(0,1fr) auto}
.abvb{display:grid;grid-template-columns:110px minmax(0,1fr) auto;gap:8px;align-items:center;margin:5px 0;font-size:.86rem}.abvb span{color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.abvb i{display:block;height:14px;border-radius:99px}.abvb b{white-space:nowrap}
.abfs.one{grid-template-columns:minmax(0,220px)!important;display:grid;margin:6px 0}.abpg .abf input{font:inherit;font-size:.95rem;padding:9px 11px;border-radius:11px;border:1px solid var(--line);background:transparent;color:var(--primary-text-color);width:100%;box-sizing:border-box}.abpg .abf{display:flex;flex-direction:column;gap:4px;font-size:.76rem;color:var(--mut)}.abpg .abf em{font-style:normal}
.abgrid.g3{grid-template-columns:repeat(3,minmax(0,1fr))}@media(max-width:1100px){.abgrid.g3{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.abgrid.g3{grid-template-columns:minmax(0,1fr)}}
.abvr{cursor:pointer;margin:0}.abvrh{display:flex;gap:14px;align-items:center}.abvrh>div{flex:1;min-width:0}.abvrh>div>b{display:block;font-size:1.02rem}.abvrh>div>small{color:var(--mut);font-size:.76rem;display:block;margin-bottom:4px}
.abtank .tk{fill:#0b0f14;stroke:#3a4654;stroke-width:2.5}.abtank .tc{fill:#3a4654}.abtank text{fill:#fff;font-weight:800;font-size:15px;paint-order:stroke;stroke:rgba(0,0,0,.35);stroke-width:2px}
.abev.lnk{cursor:pointer}.abev.lnk:hover .abet b{text-decoration:underline}.abfoot .lnk{font:inherit;color:#f5c451}
:host([style*="color-scheme: light"]) .abroll i{background:#1f2937}:host([style*="color-scheme: light"]) .abem b span{color:#a16207}:host([style*="color-scheme: light"]) .abr b.hl,:host([style*="color-scheme: light"]) .abr.hl b,:host([style*="color-scheme: light"]) .abtll .kb,:host([style*="color-scheme: light"]) .absrc.m,:host([style*="color-scheme: light"]) .abst em{color:#a16207}
`;
  const art = `<rect x="10" y="12" width="44" height="42" rx="6" class="f"/><rect x="10" y="12" width="44" height="42" rx="6"/><path d="M18 24h28M18 34h12M18 44h12"/><path d="M44 31a6 6 0 1 0 0 14M36 36h7M36 40h7"/>`;
  const search = [
    { id: "contracts", t: "Abrechnungen: Verträge und Preise", k: "vertrag verträge preis arbeitspreis grundpreis strom gas wasser abwasser einspeisung tarif kündigung frist preisgarantie bonus", h: "Verträge mit allen Preis-Bestandteilen, Preiswechseln und Fristen." },
    { id: "meters", t: "Abrechnungen: Zähler und Ablesungen", k: "zähler zählerstand ablesung ablesen gaszähler wasseruhr stromzähler eichfrist zählerwechsel", h: "Zähler anlegen, Stände erfassen und prüfen." },
    { id: "preis", t: "Abrechnungen: Preise für alle Module", k: "preisdienst haus-werte strompreis einspeisevergütung spiegeln", h: "Der Vertragspreis geht an die anderen Module." },
    { id: "rechnung", t: "Abrechnungen: Rechnungen und Belege", k: "rechnung jahresrechnung beleg prüfung prüfen guthaben nachzahlung brennwert zustandszahl", h: "Rechnung eintragen, prüfen lassen und Werte übernehmen." },
    { id: "fahrt", t: "Abrechnungen: Fahrtkosten", k: "fahrtkosten auto elektroauto verbrenner tanken laden kilometer verbrauch liter tankbeleg 100 km", h: "Kosten je 100 km, Verbrauch und Vollkosten je Fahrzeug." },
    { id: "vorrat", t: "Abrechnungen: Vorräte", k: "vorrat vorräte heizöl pellets flüssiggas brennholz salz einkauf bestand mindestbestand nachkaufen reichweite", h: "Bestand, Reichweite, Einkäufe und Mindestbestand." },
    { id: "abschlag", t: "Abrechnungen: Abschläge und Hochrechnung", k: "abschlag abschläge guthaben nachzahlung hochrechnung prognose empfehlung zahlung buchen dynamisch fest vergleich tibber", h: "Reicht der Abschlag? Hochrechnung, Empfehlung und gebuchte Zahlungen." },
  ];
  return { id: ID, page, modal, act: actFn, change, input, css, art, settings: true, settingsTxt: "Verträge, Preise, Zähler, Ablesungen", search,
    icons: { euro: '<circle cx="12" cy="12" r="8.5"/><path d="M15 8.8a4 4 0 1 0 0 6.4M7.5 11h5.5M7.5 13.5h5"/>' } };
};
