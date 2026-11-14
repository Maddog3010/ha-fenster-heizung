/* Modul 20 Abrechnungen – Seite des Addons (Addon-API 1), Stufe v0.1 „Grundgerüst“.
   Der Kern lädt diese Datei per import() und ruft die Funktionen mit seiner Panel-Instanz p auf.
   Daten kommen aus dem Python-Teil über api.call("abrechnung", …); gerechnet wird nur dort (logic.py).
   Register: Übersicht · Verträge · Zähler & Ablesungen. Abschläge, Rechnungen, Fahrtkosten und Vorräte folgen (v0.3, v0.5). */
const ID = "abrechnung";

export default (api) => {
  const { ic, esc, num } = api;
  const SP = { strom: ["Strom", "bolt", "#fbbf24", "kWh"], gas: ["Gas", "flame", "#fb923c", "kWh"], wasser: ["Wasser & Abwasser", "water", "#38bdf8", "m³"], einspeisung: ["Einspeisung", "pvRoof", "#34d399", "kWh"] };
  const SPK = ["strom", "gas", "wasser", "einspeisung"];
  const ART = { strom_bezug: ["Strom Bezug", "1.8.0", "meter"], strom_einsp: ["Strom Einspeisung", "2.8.0", "meter"], gas: ["Gaszähler", "m³", "flame"], wasser: ["Wasserzähler", "Haus", "water"], garten: ["Unterzähler Garten", "ohne Abwasser", "garden"] };
  const SRC = { manuell: "Manuell", sensor: "Automatisch", nfc: "NFC", foto: "Foto", rechnung: "Rechnung", start: "Startstand", geschaetzt: "Geschätzt" };
  const TPL = [
    ["fix", "Fixpreis", { sparte: "strom", tarif: "Fix", verl: 12, frist: 4, p: { ap: "", gp: "", mess: "" } }],
    ["dyn", "Tibber dynamisch", { sparte: "strom", anbieter: "Tibber", tarif: "dynamisch", zahl: "monat", verl: 0, frist: 2, p: { mode: "dyn", auf: "", gp: "" } }],
    ["grund", "Grundversorgung", { sparte: "strom", tarif: "Grundversorgung", verl: 0, frist: 2, p: { ap: "", gp: "" } }],
    ["gas", "Gas Fixpreis", { sparte: "gas", tarif: "Erdgas Fix", verl: 1, frist: 4, p: { ap: "", gp: "" } }],
    ["wasser", "Gemeinde Wasser", { sparte: "wasser", tarif: "Gebührenbescheid", p: { frisch: "", abw: "", zg: "", brutto: false, ust: 7 } }],
    ["eeg", "EEG-Einspeisung", { sparte: "einspeisung", anbieter: "Netzbetreiber", tarif: "EEG", p: { ap: "", ust: 0 } }]];
  const S = (p) => (p._adX = p._adX || {})[ID] || (p._adX[ID] = { d: null, ts: 0, busy: false, tab: "ov", cid: "", mid: "" });
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

  /* ---------- Banner ---------- */
  const hero = (p, D) => {
    const act = SPK.filter((k) => D.cards[k]), nx = (D.events || [])[0];
    const big = !D.contracts.length && !D.meters.length ? "Noch nichts angelegt" : `${D.contracts.filter((c) => c.aktiv).length} ${D.contracts.filter((c) => c.aktiv).length === 1 ? "Vertrag" : "Verträge"} · ${D.meters.length} Zähler`;
    const sub = !D.contracts.length ? "Lege zuerst einen Vertrag an – danach rechnen alle Module mit deinem Preis." : nx ? `Als Nächstes: ${nx.t} · ${de(nx.d)}` : "Alles im Blick. Hochrechnung und Abschläge kommen mit der nächsten Stufe.";
    const chips = act.map((k) => { const u = D.cards[k].u; return `<span class="chip">${gx(p, SP[k][1], 16)}${SP[k][0].split(" ")[0]} ${u && u.ct != null ? ct(u.ct, u.unit) : "dynamisch"}</span>`; });
    return `<div class="card hero mh hr a-${ID}">${p._modLogo(ID)}<div class="lbl">${ic("euro", 16)}Abrechnungen</div><div class="big bs">${esc(big)}</div><div class="sub">${esc(sub)}</div>
      ${chips.length ? `<div class="chips">${chips.join("")}</div>` : ""}<div class="abhb">${btn("read", "gauge", "Zählerstand erfassen", { pri: 1, dis: !D.meters.length })}${p._admin() ? btn("cnew", "plus", "Vertrag hinzufügen") : ""}</div></div>`;
  };
  const tabs = (s) => `<div class="abtabs" role="tablist">${[["ov", "Übersicht"], ["con", "Verträge"], ["met", "Zähler & Ablesungen"]].map(([k, l]) => `<button class="${s.tab === k ? "on" : ""}" role="tab" aria-selected="${s.tab === k}" data-act="adxa" data-ad="${ID}" data-a="tab" data-k="${k}">${l}</button>`).join("")}${[["Abschläge", "v0.3"], ["Rechnungen", "v0.5"], ["Fahrtkosten", "v0.5"], ["Vorräte", "v0.5"]].map(([l, v]) => `<button class="soon" disabled title="kommt mit ${v}">${l}<em>${v}</em></button>`).join("")}</div>`;

  /* ---------- Übersicht ---------- */
  const spCard = (p, D, k) => {
    const X = D.cards[k], [nm, g, col, unit] = SP[k];
    if (!X) return `<div class="abc empty" style="--c:${col}"><div class="abch">${gx(p, g, 40, { on: 0 })}<div><b>${nm}</b><small>kein Vertrag</small></div></div><div class="mut sm">${k === "einspeisung" ? "Vergütung für eingespeisten Solarstrom." : `Ohne Vertrag rechnen die Module ${k === "strom" ? "mit den Haus-Werten" : "ohne Preis"}.`}</div>${p._admin() ? `<div class="abcb">${btn("cnew", "plus", "Vertrag anlegen", { k })}</div>` : ""}</div>`;
    const c = C(D, X.id), u = X.u || {}, K = X.cost, row = (l, v, cl) => `<div class="abr"><span>${l}</span><b${cl ? ` class="${cl}"` : ""}>${v}</b></div>`;
    const rows = k === "wasser"
      ? [row("Frischwasser", `${num(u.teile.frisch, 2)} €/m³`), row("Abwasser", `${num(u.teile.abw, 2)} €/m³`), row("Feste Kosten im Jahr", eur(u.grund * 12 + u.jahr)), row("Effektiv je m³", X.eff != null ? `${num(X.eff / 100, 2)} €` : "–", "hl")]
      : [row(k === "einspeisung" ? "Vergütung" : "Arbeitspreis", u.dyn ? (u.ct != null ? `${num(u.ct, 2)} ct/kWh · jetzt` : "Börsenpreis + Aufschlag") : ct(u.ct, unit)), k === "gas" && u.ct_m3 != null ? row("je m³ am Zähler", `${num(u.ct_m3 / 100, 2)} €`) : "",
        k !== "einspeisung" ? row("Grundpreis", `${num(u.grund, 2)} €/Monat`) : "", k !== "einspeisung" ? row(`Effektiv bei ${num(D.opts.verbrauch[k], 0)} ${unit}`, X.eff != null ? ct(X.eff, unit) : "–", "hl") : ""];
    const cost = K && K.gemessen ? `<div class="abk"><div><small>${k === "einspeisung" ? "Gutschrift" : "Kosten"} seit ${deS(K.kurz ? null : X.start) === "–" ? "erster Ablesung" : deS(X.start)}</small><b>${eur(K.eur)}</b></div><div><small>${k === "einspeisung" ? "eingespeist" : "Verbrauch"}</small><b>${num(K.menge, K.menge >= 100 ? 0 : 1)} ${K.unit}</b></div></div>
        <div class="mut sm">${K.est ? "bis heute geschätzt aus der letzten Ablesung" : "gemessen"}${K.kurz ? " · Ablesungen beginnen erst im Abrechnungsjahr" : ""}${k !== "einspeisung" ? ` · davon fest ${eur(K.grund)}` : ""}</div>`
      : `<div class="mut sm abhint">${ic("info", 14)} ${c.meters.length ? "Für Kosten braucht der Zähler mindestens zwei Ablesungen." : "Ordne dem Vertrag einen Zähler zu, dann erscheinen hier Verbrauch und Kosten."}</div>`;
    return `<div class="abc" style="--c:${col}" data-act="adxa" data-ad="${ID}" data-a="csel" data-k="${esc(c.id)}" role="button" tabindex="0"><div class="abch">${gx(p, g, 40)}<div><b>${nm}</b><small>${esc([c.anbieter, c.tarif].filter(Boolean).join(" · ") || "Vertrag")}</small></div></div>${rows.join("")}${cost}</div>`;
  };
  const evCard = (D) => `<div class="card"><h2>${ic("clock", 18)}Als Nächstes<span class="hzrt">${(D.events || []).length} ${(D.events || []).length === 1 ? "Termin" : "Termine"}</span></h2>${(D.events || []).length ? D.events.slice(0, 6).map((e) => `<div class="abev ${e.c}"><span class="abei">${ic(e.k === "preis" ? "chart" : e.k === "eich" ? "gauge" : e.k === "garantie" ? "shield" : "clock", 18)}</span><span class="abet"><b>${esc(e.t)}</b><small>${esc(e.s)}</small></span><span class="abed"><b>${e.tage <= 0 ? "heute" : e.tage < 60 ? `in ${e.tage} Tagen` : de(e.d)}</b>${e.tage > 0 && e.tage < 60 ? `<small>${de(e.d)}</small>` : ""}</span></div>`).join("") : `<div class="mut sm">Keine Fristen in den nächsten Monaten. Trage Laufzeit und Kündigungsfrist im Vertrag ein, dann erscheinen sie hier.</div>`}</div>`;
  const svcCard = (p, D) => {
    const mg = D.managed || {}, s = D.cards.strom, row = (l, v, src) => `<div class="abr"><span>${l}</span><b>${v}<em class="absrc ${src === "Modul 20" ? "m" : ""}">${src}</em></b></div>`;
    const sp = (k, l) => { const X = D.cards[k], u = X && X.u; return row(l, u && u.ct != null ? ct(u.ct, u.unit) : k === "strom" ? ct(D.haus.price, "kWh") : k === "einspeisung" ? ct(D.haus.feed, "kWh") : "–", u && u.ct != null ? "Modul 20" : k === "strom" && D.tibber ? "Tibber" : k === "strom" || k === "einspeisung" ? "Haus-Werte" : "kein Preis"); };
    return `<div class="card"><h2>${ic("link", 18)}Preise für alle Module<span class="hzrt">Preisdienst</span></h2>${sp("strom", "Strom")}${sp("einspeisung", "Einspeisung")}${sp("gas", "Gas")}${sp("wasser", "Wasser")}
      <div class="vrow"><span>Vertragspreis an die Module geben<small class="mut" style="display:block">Schreibt den festen Strompreis und die Vergütung in Einstellungen → Haus-Werte. Aus: Der Stand von vorher kommt zurück.</small></span><button class="sw ${D.opts.mirror ? "on" : ""}" data-act="adxa" data-ad="${ID}" data-a="mirror" aria-pressed="${!!D.opts.mirror}" aria-label="Vertragspreis an die Module geben" ${p._admin() ? "" : "disabled"}></button></div>
      <div class="mut sm">${mg.price || mg.feed ? `${ic("check", 14)} Haus-Werte werden gerade von Modul 20 gepflegt: ${[mg.price ? "Strompreis" : "", mg.feed ? "Einspeisevergütung" : ""].filter(Boolean).join(" und ")}.` : s && s.u && s.u.dyn ? "Dein Stromvertrag ist dynamisch: Der Preis der Stunde kommt weiter von Tibber." : "Gas- und Wasserpreise nutzen die anderen Module ab der Stufe „Anbindung Module“ (v0.7)."}</div></div>`;
  };
  const overview = (p, D) => `<div class="abgrid">${SPK.map((k) => spCard(p, D, k)).join("")}</div><div class="ab2">${evCard(D)}${svcCard(p, D)}</div>
    <div class="card abnext"><h2>${ic("layers", 18)}So geht es weiter</h2><div class="abst">${[["v0.1", "Grundgerüst", "Verträge, Zähler, Ablesungen, Preisdienst", 1], ["v0.3", "Übersicht & Prognose", "„Bekomme ich Geld zurück?“, Abschläge, Jahreskurve", 0], ["v0.5", "Rechnungen", "Rechnungsprüfung, Fahrtkosten, Vorräte", 0], ["v0.7", "Anbindung Module", "Alle Module rechnen mit Vertragspreisen", 0]].map(([v, t, d, on]) => `<div class="${on ? "on" : ""}"><em>${v}</em><b>${t}</b><small>${d}</small></div>`).join("")}</div></div>`;

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

  const page = (p, m) => {
    load(p); const s = S(p), D = s.d;
    if (!D) return `<div class="card empty">${s.err ? esc(s.err) : "Lädt …"}</div>`;
    const body = s.tab === "con" ? contracts(p, D, s) : s.tab === "met" ? meters(p, D, s) : overview(p, D);
    return `${hero(p, D)}${tabs(s)}<div class="abpg">${body}</div><div class="stleg abfoot">${ic("package", 14)} Addon · Modul 20 · v${esc((m.ad || {}).version || "")} Build ${(m.ad || {}).build || 1} · Grundgerüst: Hochrechnung, Abschläge und Rechnungen folgen · alles bleibt lokal in Home Assistant</div>`;
  };

  /* ---------- Fenster ---------- */
  const hd = (t, sub) => `<div class="sh"><div><b>${t}</b><span>${sub}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>`;
  const wrap = (body, wide) => `<div class="ov" data-act="close"></div><div class="sheet${wide ? " wide" : ""} absh" role="dialog" aria-modal="true">${body}</div>`;
  const periodFields = (sp, f) => sp === "wasser"
    ? `<div class="abfs">${inp("frisch", "Frischwasser", nv(f.frisch), { num: 1, unit: "€/m³" })}${inp("abw", "Abwasser", nv(f.abw), { num: 1, unit: "€/m³" })}${inp("zg", "Zählergebühr", nv(f.zg), { num: 1, unit: "€/Monat" })}${inp("nieder", "Niederschlagswasser", nv(f.nieder), { num: 1, unit: "€/m² im Jahr" })}${inp("flaeche", "Versiegelte Fläche", nv(f.flaeche, 0), { num: 1, unit: "m²" })}${inp("ust", "Umsatzsteuer", nv(f.ust, 0), { num: 1, unit: "%" })}</div>`
    : `${sp === "strom" ? `<div class="gschips">${chip("pmode", "fix", "Fester Preis", f.mode !== "dyn")}${chip("pmode", "dyn", "Dynamisch (Börsenpreis)", f.mode === "dyn")}</div>` : ""}
      <div class="abfs">${f.mode === "dyn" ? inp("auf", "Aufschlag auf den Börsenpreis", nv(f.auf), { num: 1, unit: "ct/kWh" }) : inp("ap", sp === "einspeisung" ? "Vergütung" : "Arbeitspreis", nv(f.ap), { num: 1, unit: "ct/kWh" })}${sp !== "einspeisung" ? inp("gp", "Grundpreis", nv(f.gp), { num: 1, unit: "€/Monat" }) + inp("mess", "Messstellenbetrieb", nv(f.mess), { num: 1, unit: "€/Monat", ph: "falls getrennt" }) : ""}${sp === "gas" ? inp("co2", "davon CO₂-Preis", nv(f.co2), { num: 1, unit: "ct/kWh", ph: "nur zur Info" }) : ""}${inp("ust", "Umsatzsteuer", nv(f.ust, 0), { num: 1, unit: "%" })}</div>`;
  const bruttoRow = (f) => `<div class="vrow"><span>Preise sind brutto<small class="mut" style="display:block">Aus: Du gibst netto ein, gerechnet und angezeigt wird immer brutto.</small></span><button class="sw ${f.brutto !== false ? "on" : ""}" data-act="adxa" data-ad="${ID}" data-a="pbrutto" aria-pressed="${f.brutto !== false}" aria-label="Preise sind brutto"></button></div>`;
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
      const st = p._hass.states, u = (ART[f.art] || [])[0] ? (["strom_bezug", "strom_einsp"].includes(f.art) ? "kWh" : "m³") : "";
      const cand = f.art ? Object.keys(st).filter((e) => e.startsWith("sensor.") && String((st[e].attributes || {}).unit_of_measurement || "") === u && (st[e].attributes || {}).state_class !== "measurement").sort().slice(0, 14) : [];
      return wrap(hd(f.id ? "Zähler bearbeiten" : "Zähler hinzufügen", "Modul 20 · gilt für alle Nutzer") + `<div class="lsec">${ic("gauge", 15)}Art</div><div class="gschips">${Object.entries(ART).map(([k, a]) => chip("mart", k, a[0], f.art === k)).join("")}</div>
        ${f.art ? `<div class="abfs">${inp("name", "Name", f.name, { ph: ART[f.art][0], max: 30 })}${inp("nr", "Zählernummer", f.nr, { ph: "optional, bleibt lokal", max: 30 })}${inp("digits", "Stellen vor dem Komma", nv(f.digits, 0), { num: 1 })}${inp("dec", "Stellen nach dem Komma", nv(f.dec, 0), { num: 1 })}${inp("eich", "Eichfrist bis Jahr", f.eich || "", { num: 1, ph: "z. B. 2032" })}</div>
        <div class="lsec">${ic("link", 15)}Sensor <span class="mut sm">· optional: speichert täglich um 0 Uhr einen Stand</span></div><div class="gschips">${chip("msens", "", "keiner – von Hand", !f.sensor)}${cand.map((e) => chip("msens", e, esc((st[e].attributes || {}).friendly_name || e), f.sensor === e)).join("")}</div>
        ${f.sensor && !cand.includes(f.sensor) ? `<div class="mut sm">Gewählt: ${esc(f.sensor)}</div>` : ""}${!cand.length ? `<div class="mut sm">Kein Sensor mit der Einheit ${u} gefunden.</div>` : ""}` : `<div class="mut sm">Wähle zuerst die Art des Zählers.</div>`}
        <div class="foot2" style="margin-top:14px">${!f.id ? btn("close2", "", "Abbrechen") : m.del ? btn("mdel2", "trash", "Wirklich löschen", { dng: 1 }) : btn("mdel", "trash", "Löschen")}${btn("msave", "check", "Speichern", { pri: 1, dis: !f.art })}</div>`);
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
  const put = (m, k, v) => { const f = m.f; if (m.k === "c" && PK.includes(k)) { (f.p = f.p || {})[k] = v; } else if (k === "ab_betrag" || k === "ab_tag") { (f.abschlag = f.abschlag || {})[k === "ab_betrag" ? "betrag" : "tag"] = v; } else f[k] = v; };
  const period = (f, ab) => { const o = { ab, brutto: f.brutto !== false, note: f.note || "", mode: f.mode === "dyn" ? "dyn" : "fix" }; PK.slice(1).forEach((k) => { const x = pn(f[k]); if (x != null) o[k] = x; }); return o; };
  const nowF = () => { const n = new Date(); return { d: n.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }), hh: String(n.getHours()), mm: String(n.getMinutes()).padStart(2, "0") }; };
  const ts = (f) => { const d = iso(f.d); if (!d) return null; const h = Math.min(23, Math.max(0, parseInt(f.hh, 10) || 0)), mi = Math.min(59, Math.max(0, parseInt(f.mm, 10) || 0)); return `${d}T${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}`; };
  const check = (p) => { const m = p._modal, v = pn(m.f.v), t = ts(m.f); if (v == null || !t) { m.chk = null; p._renderModal(); return; } api.call(ID, "check", { id: m.mid, v, t }).then((r) => { if (p._modal === m) { m.chk = r; p._renderModal(); } }).catch(() => {}); };
  const actFn = (p, a, el) => {
    const s = S(p), D = s.d, k = el.dataset.k, v = el.dataset.v, adm = p._admin();
    if (a === "settings") { s.tab = "ov"; p._modal = null; p._renderModal(); p._mdActiveSet && p._mdActiveSet(ID); p._render(); return; }
    if (a === "tab") { s.tab = k; p._render(); return; }
    if (a === "csel") { s.cid = k; s.tab = "con"; p._render(); return; }
    if (a === "msel") { s.mid = k; p._render(); return; }
    if (a === "close2") { p._modal = null; p._renderModal(); return; }
    if (!D) return;
    const m = p._modal && p._modal.type === "adx" && p._modal.id === ID ? p._modal : null;
    if (m) grab(p);
    /* Ablesen dürfen alle */
    if (a === "read") { const mid = k || s.mid || (D.meters[0] || {}).id; if (!mid) return; p._modal = { type: "adx", id: ID, k: "r", mid, f: { v: "", note: "", ...nowF() }, chk: null }; p._renderModal(); return; }
    if (a === "rmeter") { m.mid = k; m.chk = null; check(p); return; }
    if (a === "rsave") { const x = pn(m.f.v), t = ts(m.f); if (x == null) { p._toast("Bitte den Zählerstand eingeben"); return; } if (!t) { p._toast("Bitte das Datum als TT.MM.JJJJ eingeben"); return; }
      send(p, "read", { id: m.mid, v: x, t, note: m.f.note || "", force: !!(m.chk && m.chk.level === "warn") }, "", (r) => { if (r.saved) { s.mid = m.mid; p._modal = null; p._renderModal(); p._render(); p._toast("Zählerstand gespeichert"); } else { m.chk = r.check; p._renderModal(); } }); return; }
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
    /* Zähler */
    if (a === "mnew") { p._modal = { type: "adx", id: ID, k: "m", f: { art: "", name: "", nr: "", sensor: "", digits: "", dec: "", eich: "" } }; p._renderModal(); return; }
    if (a === "medit") { const x = M(D, k); if (!x) return; p._modal = { type: "adx", id: ID, k: "m", f: { id: x.id, art: x.art, name: x.name, nr: x.nr, sensor: x.sensor, digits: x.digits, dec: x.dec, eich: x.eich || "" } }; p._renderModal(); return; }
    if (a === "mart") { m.f.art = k; if (!m.f.id) { const e = ["strom_bezug", "strom_einsp"].includes(k); m.f.digits = e ? 6 : 5; m.f.dec = e ? 1 : 3; m.f.sensor = ""; } p._renderModal(); return; }
    if (a === "msens") { m.f.sensor = k; p._renderModal(); return; }
    if (a === "mdel") { m.del = true; p._renderModal(); return; }
    if (a === "mdel2") { send(p, "meter_del", { id: m.f.id }, "Zähler gelöscht"); s.mid = ""; return; }
    if (a === "msave") { const f = m.f; send(p, "meter", { meter: { id: f.id || "", art: f.art, name: f.name, nr: f.nr, sensor: f.sensor, digits: pn(f.digits), dec: pn(f.dec), eich: pn(f.eich) || 0 } }, "", (r) => { s.mid = r.saved; s.tab = "met"; p._modal = null; p._renderModal(); p._render(); p._toast("Zähler gespeichert"); }); return; }
    if (a === "rdel") { send(p, "read_del", { id: k, t: v }, "", () => { p._render(); p._toast("Ablesung gelöscht"); }); return; }
    if (a === "swap") { const x = M(D, k); if (!x) return; p._modal = { type: "adx", id: ID, k: "x", mid: x.id, f: { end: "", start: "0", nr: "", eich: "", d: nowF().d } }; p._renderModal(); return; }
    if (a === "xsave") { const f = m.f, d = iso(f.d), e = pn(f.end); if (e == null) { p._toast("Bitte den Endstand eingeben"); return; } if (!d) { p._toast("Bitte das Datum als TT.MM.JJJJ eingeben"); return; } send(p, "swap", { id: m.mid, t: `${d}T12:00`, end: e, start: pn(f.start) || 0, nr: f.nr || null, eich: pn(f.eich) || 0 }, "Zählerwechsel gespeichert"); }
  };
  const change = (p, el) => {
    const m = p._modal; if (!m || m.type !== "adx" || m.id !== ID || !m.f) return;
    put(m, el.dataset.k, el.value);
    if (m.k === "r" && ["v", "d", "hh", "mm"].includes(el.dataset.k)) check(p);
  };

  const css = `
.a-${ID}{--a1:#e8b84a;--a2:#3d2c07}.a-${ID} .abhb{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;position:relative;z-index:1}.a-${ID} .abhb .btn2{flex:none;padding:9px 14px;display:inline-flex;gap:7px;align-items:center;background:rgba(10,14,20,.45);border-color:rgba(255,255,255,.22);color:#fff}.a-${ID} .abhb .btn2.pri{background:#f5c451;border-color:#f5c451;color:#2a1d02}
.a-${ID} .chip .gx{vertical-align:-3px;margin-right:4px}
.abtabs{display:flex;gap:8px;overflow-x:auto;margin:12px 0;padding-bottom:2px;scrollbar-width:none}.abtabs button{flex:none;border:1px solid var(--line);background:var(--card);color:var(--mut);border-radius:999px;padding:8px 16px;font:inherit;font-size:.9rem;font-weight:600;cursor:pointer;white-space:nowrap}
.abtabs button.on{background:#f5c451;border-color:#f5c451;color:#2a1d02}.abtabs button.soon{opacity:.5;cursor:default}.abtabs button.soon em{font-style:normal;font-size:.68rem;margin-left:6px;padding:1px 6px;border-radius:6px;background:var(--line)}
.abgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:12px}@media(max-width:1100px){.abgrid{grid-template-columns:1fr 1fr}}@media(max-width:560px){.abgrid{grid-template-columns:1fr}}
.abc{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:14px 16px;cursor:pointer;display:flex;flex-direction:column;gap:2px;min-width:0}.abc.empty{cursor:default;opacity:.92}.abc:focus-visible{outline:2px solid var(--c)}
.abch{display:flex;gap:10px;align-items:center;margin-bottom:8px}.abch b{display:block;font-size:1.02rem}.abch small{color:var(--mut);font-size:.76rem}.abcb{margin-top:10px}.abcb .btn2{width:100%;display:inline-flex;gap:6px;justify-content:center;align-items:center;padding:9px}
.abr{display:flex;justify-content:space-between;gap:10px;padding:5px 0;font-size:.86rem;border-top:1px solid color-mix(in srgb,var(--line) 60%,transparent)}.abr:first-of-type{border-top:0}.abr span{color:var(--mut)}.abr b{text-align:right;font-weight:600;white-space:nowrap}.abbox .abr b{white-space:normal}.abr b.hl,.abr.hl b{color:#f5c451}.abr.sub span{padding-left:12px}.abr.sub b{font-weight:500;color:var(--mut)}
.abk{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.abk>div{background:color-mix(in srgb,var(--c) 12%,transparent);border-radius:12px;padding:8px 10px}.abk small{display:block;color:var(--mut);font-size:.7rem}.abk b{font-size:1.12rem}.abc .mut.sm{margin-top:6px}.abhint{display:flex;gap:6px;align-items:flex-start}
.ab2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;align-items:start}.ab2.w{grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)}.ab2.in{margin:0}@media(max-width:860px){.ab2,.ab2.w{grid-template-columns:1fr}}
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
.abpv small{color:var(--mut)}.abpv b{font-size:.8rem;text-align:right}.abpv b.up{color:#f87171}.abpv b.dn{color:#34d399}.abpg .ibtn.sm{width:30px;height:30px;min-width:0;min-height:0;padding:0;display:grid;place-items:center}.abpg .btn2.pri{background:#f5c451;border-color:#f5c451;color:#2a1d02}.abpg .gbtns .btn2{display:inline-flex;gap:6px;align-items:center;justify-content:center}@media(max-width:700px){.abpv{grid-template-columns:78px minmax(0,1fr) auto 30px}.abpv small{display:none}}
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
:host([style*="color-scheme: light"]) .abroll i{background:#1f2937}:host([style*="color-scheme: light"]) .abr b.hl,:host([style*="color-scheme: light"]) .abr.hl b,:host([style*="color-scheme: light"]) .abtll .kb,:host([style*="color-scheme: light"]) .absrc.m,:host([style*="color-scheme: light"]) .abst em{color:#a16207}
`;
  const art = `<rect x="10" y="12" width="44" height="42" rx="6" class="f"/><rect x="10" y="12" width="44" height="42" rx="6"/><path d="M18 24h28M18 34h12M18 44h12"/><path d="M44 31a6 6 0 1 0 0 14M36 36h7M36 40h7"/>`;
  const search = [
    { id: "contracts", t: "Abrechnungen: Verträge und Preise", k: "vertrag verträge preis arbeitspreis grundpreis strom gas wasser abwasser einspeisung tarif kündigung frist preisgarantie bonus", h: "Verträge mit allen Preis-Bestandteilen, Preiswechseln und Fristen." },
    { id: "meters", t: "Abrechnungen: Zähler und Ablesungen", k: "zähler zählerstand ablesung ablesen gaszähler wasseruhr stromzähler eichfrist zählerwechsel", h: "Zähler anlegen, Stände erfassen und prüfen." },
    { id: "preis", t: "Abrechnungen: Preise für alle Module", k: "preisdienst haus-werte strompreis einspeisevergütung spiegeln", h: "Der Vertragspreis geht an die anderen Module." },
  ];
  return { id: ID, page, modal, act: actFn, change, css, art, settings: true, settingsTxt: "Verträge, Preise, Zähler, Ablesungen", search,
    icons: { euro: '<circle cx="12" cy="12" r="8.5"/><path d="M15 8.8a4 4 0 1 0 0 6.4M7.5 11h5.5M7.5 13.5h5"/>' } };
};
