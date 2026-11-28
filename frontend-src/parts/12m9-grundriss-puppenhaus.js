  /* ================= Modul 0 Build 10: Möbel, Außenbereich, Sonnenlicht =================
     Element „o“: Möbel (Bett, Sofa, Küche, Bad …) und Außen (Baum, Hecke, Pool, Carport, PV …) mit Größe in cm, drehbar, teils mit Entität.
     Grundstück als eigene Etage „Außen“ (floor.ga): das Haus erscheint dort als Umriss, Antippen öffnet die Etage.
     Sonnenlicht: Nordrichtung des Plans + Sonnenstand (sun.sun oder berechnet) → Lichtflächen durch die Fenster, Tageszeit-Regler. */
  _grMK() {
    if (this._grMKc) return this._grMKc;
    const L = [
      ["bett", "Doppelbett", "wohnen", 180, 200], ["bett1", "Einzelbett", "wohnen", 90, 200], ["sofa", "Sofa", "wohnen", 220, 90], ["sessel", "Sessel", "wohnen", 80, 80], ["tisch", "Esstisch", "wohnen", 160, 90],
      ["couchtisch", "Couchtisch", "wohnen", 100, 60], ["schreibtisch", "Schreibtisch", "wohnen", 140, 70], ["schrank", "Schrank", "wohnen", 200, 60], ["regal", "Regal", "wohnen", 100, 35], ["kommode", "Kommode", "wohnen", 120, 50], ["tvboard", "TV-Board", "wohnen", 180, 45],
      ["kueche", "Küchenzeile", "kueche", 300, 60], ["insel", "Kochinsel", "kueche", 180, 90], ["kuehlschrank", "Kühlschrank", "kueche", 60, 65], ["waschmaschine", "Waschmaschine", "bad", 60, 60],
      ["badewanne", "Badewanne", "bad", 170, 75], ["dusche", "Dusche", "bad", 90, 90], ["wc", "WC", "bad", 40, 65], ["waschbecken", "Waschbecken", "bad", 60, 45],
      ["rasen", "Rasen", "garten", 600, 400], ["beet", "Beet", "garten", 200, 100], ["hochbeet", "Hochbeet", "garten", 200, 80], ["baum", "Baum", "garten", 400, 400], ["obstbaum", "Obstbaum", "garten", 350, 350], ["busch", "Busch", "garten", 150, 150],
      ["hecke", "Hecke", "garten", 400, 80], ["teich", "Gartenteich", "garten", 300, 200], ["gewaechshaus", "Gewächshaus", "garten", 300, 200], ["kompost", "Kompost", "garten", 100, 100], ["regentonne", "Regentonne", "garten", 60, 60],
      ["bewaesserung", "Bewässerungszone", "garten", 400, 300], ["wasserhahn", "Wasserhahn außen", "garten", 40, 40], ["maehroboter", "Mähroboter", "garten", 60, 60],
      ["spielturm", "Spielturm mit Rutsche", "spiel", 300, 200], ["schaukel", "Schaukel", "spiel", 250, 150], ["sandkasten", "Sandkasten", "spiel", 150, 150], ["trampolin", "Trampolin", "spiel", 300, 300], ["pool", "Pool", "spiel", 600, 300],
      ["whirlpool", "Whirlpool", "spiel", 220, 220], ["sauna", "Gartensauna", "spiel", 250, 250], ["gartentisch", "Gartentisch", "spiel", 180, 180], ["liegestuhl", "Liegestuhl", "spiel", 70, 190], ["sonnenschirm", "Sonnenschirm", "spiel", 300, 300],
      ["grill", "Grill", "spiel", 60, 50], ["feuerstelle", "Feuerstelle", "spiel", 120, 120],
      ["weg", "Weg / Einfahrt", "bauten", 300, 120], ["trittsteine", "Trittsteine", "bauten", 300, 60], ["holzterrasse", "Holzterrasse", "bauten", 400, 300], ["zaun", "Zaun", "bauten", 400, 10], ["tor", "Tor", "bauten", 300, 10],
      ["gartenhaus", "Gartenhaus", "bauten", 300, 250], ["garage", "Garage", "bauten", 300, 600], ["carport", "Carport", "bauten", 300, 550], ["pv", "PV-Anlage", "bauten", 500, 300], ["zisterne", "Zisterne", "bauten", 200, 200],
      ["nachttisch", "Nachttisch", "wohnen", 50, 40, "box"], ["kleiderschrank", "Kleiderschrank", "wohnen", 250, 60, "doors"], ["schuhschrank", "Schuhschrank", "wohnen", 100, 35, "doors"], ["garderobe", "Garderobe", "wohnen", 120, 40, "doors"],
      ["teppich", "Teppich", "wohnen", 240, 170, "rug"], ["tischrund", "Esstisch rund", "wohnen", 120, 120, "round"], ["hocker", "Hocker", "wohnen", 40, 40, "round"], ["stuhl", "Stuhl", "wohnen", 45, 45, "seat"],
      ["kinderbett", "Kinderbett", "wohnen", 70, 140, "bed"], ["stockbett", "Stockbett", "wohnen", 90, 200, "bed"], ["buecherregal", "Bücherregal", "wohnen", 200, 30, "rows"],
      ["herd", "Herd", "kueche", 60, 60, "stove"], ["spuelmaschine", "Spülmaschine", "kueche", 60, 60, "box"], ["gefrierschrank", "Gefrierschrank", "kueche", 60, 65, "box"], ["theke", "Theke", "kueche", 200, 60, "box"], ["spuele", "Spüle", "kueche", 120, 60, "sink"],
      ["trockner", "Wäschetrockner", "bad", 60, 60, "drum"], ["doppelwaschtisch", "Doppelwaschtisch", "bad", 140, 50, "sink"], ["waeschestaender", "Wäscheständer", "bad", 150, 60, "rows"],
      ["kiesbett", "Kiesfläche", "garten", 300, 200, "rug"], ["pergola", "Pergola", "garten", 300, 300, "grid"], ["blumenkuebel", "Blumenkübel", "garten", 50, 50, "round"], ["brunnen", "Brunnen", "garten", 80, 80, "round"], ["steinmauer", "Steinmauer", "garten", 400, 30, "box"], ["kraeuter", "Kräuterbeet", "garten", 100, 60, "rows"],
      ["tischtennis", "Tischtennisplatte", "spiel", 274, 152, "tt"], ["hollywood", "Hollywoodschaukel", "spiel", 200, 120, "seat"], ["hundehuette", "Hundehütte", "spiel", 80, 100, "box"], ["fussballtor", "Fußballtor", "spiel", 300, 10, "box"],
      ["wallbox", "Wallbox", "bauten", 30, 15, "box"], ["waermepumpe", "Wärmepumpe außen", "bauten", 120, 60, "fan"], ["briefkasten", "Briefkasten", "bauten", 30, 20, "box"], ["kellerabgang", "Kellerabgang", "bauten", 120, 200, "stairs"],
      ["lichtschacht", "Lichtschacht", "bauten", 100, 60, "grid"], ["terrasse", "Terrasse (Stein)", "bauten", 400, 300, "rug"], ["fahrradgarage", "Fahrradgarage", "bauten", 200, 80, "box"], ["solarthermie", "Solarthermie", "bauten", 200, 100, "grid"],
      ["muell", "Mülltonnen", "bauten", 150, 70], ["fahrrad", "Fahrradständer", "bauten", 180, 60], ["auto", "Auto", "bauten", 180, 450], ["gartenlampe", "Gartenlampe", "bauten", 30, 30]];
    const G = { wohnen: ["Wohnen & Schlafen", "#94a3b8"], kueche: ["Küche", "#94a3b8"], bad: ["Bad & Wäsche", "#7dd3fc"], garten: ["Garten & Pflanzen", "#4ade80"], spiel: ["Spielen & Freizeit", "#fbbf24"], bauten: ["Wege, Bauten & Technik", "#a8a29e"] };
    const D = { pool: ["sensor:temperature"], pv: ["sensor:power", "sensor:energy"], zisterne: ["sensor"], muell: ["sensor", "calendar"], garage: ["cover"], tor: ["cover"], maehroboter: ["lawn_mower", "vacuum"], auto: ["sensor:battery", "device_tracker"], waschmaschine: ["sensor:power", "switch", "sensor"], kuehlschrank: ["sensor:temperature"],
      bewaesserung: ["valve", "switch"], wasserhahn: ["valve", "switch"], gartenlampe: ["light", "switch"], whirlpool: ["sensor:temperature", "climate", "water_heater"], sauna: ["sensor:temperature", "climate"], regentonne: ["sensor"], teich: ["sensor:temperature"], gewaechshaus: ["sensor:temperature", "sensor:humidity"], spuelmaschine: ["sensor:power", "switch"], trockner: ["sensor:power", "switch"], herd: ["switch", "sensor:power"], gefrierschrank: ["sensor:temperature"], waermepumpe: ["sensor:power", "climate", "switch"], wallbox: ["sensor:power", "switch"], tischrund: [], kellerabgang: ["cover"], solarthermie: ["sensor:temperature"], hundehuette: [] };
    this._grOUT = new Set(["garten", "spiel", "bauten"]);
    this._grMKc = { L, G, D, by: Object.fromEntries(L.map((x) => [x[0], { k: x[0], n: x[1], g: x[2], w: x[3], h: x[4], sh: x[5] || "", d: D[x[0]] || [] }])) };
    return this._grMKc;
  }
  _grMk(i) { const K = this._grMK(); return K.by[i.ok] || K.by.tisch; }
  _grMobSvg(i, T, hell, st) {
    st = st || this._hass.states;
    const k = this._grMk(i), x = i.x, y = i.y, w = i.w || 40, h = i.h || 40, cx = x + w / 2, cy = y + h / 2, rot = i.r ? ` transform="rotate(${i.r} ${cx} ${cy})"` : "";
    const S = hell ? "#64748b" : "#9aa7bb", F = hell ? "#ffffff" : "#1b2638", L = (dd, c, sw, da) => `<path d="${dd}" fill="none" stroke="${c || S}" stroke-width="${sw || 1.2}"${da ? ` stroke-dasharray="${da}"` : ""} stroke-linecap="round"/>`;
    const R = (xx, yy, ww, hh, rx, f, c, sw) => `<rect x="${xx}" y="${yy}" width="${ww}" height="${hh}" rx="${rx || 0}" fill="${f || F}" stroke="${c || S}" stroke-width="${sw || 1.3}"/>`;
    const C = (xx, yy, r, f, c, sw, da) => `<circle cx="${xx}" cy="${yy}" r="${r}" fill="${f || F}" stroke="${c || S}" stroke-width="${sw || 1.3}"${da ? ` stroke-dasharray="${da}"` : ""}/>`;
    const G1 = "#3f7d4e", G2 = "#5fae6c", m = Math.min(w, h);
    let s = "";
    switch (k.k) {
      case "bett": case "bett1": { const n = k.k === "bett" ? 2 : 1, pw = (w - 8 - (n - 1) * 4) / n; s = R(x, y, w, h, 3) + Array.from({ length: n }, (_, j) => R(x + 4 + j * (pw + 4), y + 4, pw, h * 0.16, 3)) + L(`M${x} ${y + h * 0.3}H${x + w}`) + L(`M${x + 6} ${y + h * 0.36}l${w * 0.25} ${h * 0.08}`, null, 0.8); break; }
      case "sofa": case "sessel": s = R(x, y, w, h, 5) + R(x, y, w, h * 0.28, 4) + R(x, y, w * 0.12, h, 4) + R(x + w * 0.88, y, w * 0.12, h, 4) + (k.k === "sofa" ? L(`M${cx} ${y + h * 0.28}V${y + h}`, null, 0.8) : ""); break;
      case "tisch": { const n = Math.max(1, Math.floor(w / 55)), cw = Math.min(16, w / n - 6); s = Array.from({ length: n }, (_, j) => { const xx = x + (w / n) * (j + 0.5) - cw / 2; return R(xx, y - 12, cw, 10, 3) + R(xx, y + h + 2, cw, 10, 3); }).join("") + R(x, y, w, h, 3); break; }
      case "couchtisch": s = R(x, y, w, h, 6); break;
      case "schreibtisch": s = R(x, y, w, h, 2) + C(cx, y + h + 12, 9) + L(`M${x + 6} ${y + 6}h${w * 0.3}`, null, 0.8); break;
      case "schrank": s = R(x, y, w, h, 1) + L(Array.from({ length: Math.max(1, Math.floor(w / 50)) - 1 }, (_, j) => `M${x + (j + 1) * (w / Math.max(1, Math.floor(w / 50)))} ${y}V${y + h}`).join("") || "M0 0") + L(`M${x} ${y}L${x + w} ${y + h}`, null, 0.6, "3 3"); break;
      case "regal": s = R(x, y, w, h, 1) + L(Array.from({ length: Math.max(1, Math.floor(w / 25)) }, (_, j) => `M${x + (j + 0.5) * (w / Math.max(1, Math.floor(w / 25)))} ${y + 2}V${y + h - 2}`).join(""), null, 0.7); break;
      case "kommode": s = R(x, y, w, h, 2) + L(`M${x + 4} ${y + h * 0.33}H${x + w - 4}M${x + 4} ${y + h * 0.66}H${x + w - 4}`, null, 0.8); break;
      case "tvboard": s = R(x, y, w, h, 2) + L(`M${x + w * 0.15} ${y + h * 0.5}H${x + w * 0.85}`, S, 3); break;
      case "kueche": { s = R(x, y, w, h, 1); const sx = x + w * 0.62, hx = x + w * 0.2, r = Math.min(h * 0.16, 7); s += R(sx, y + h * 0.18, w * 0.16, h * 0.64, 4) + C(sx + w * 0.08, y + h * 0.5, 2) + [[0, 0], [1, 0], [0, 1], [1, 1]].map(([a, b]) => C(hx + a * h * 0.42, y + h * 0.29 + b * h * 0.42, r)).join(""); break; }
      case "insel": { const r = Math.min(h * 0.14, 8); s = R(x, y, w, h, 3) + [[0, 0], [1, 0], [0, 1], [1, 1]].map(([a, b]) => C(x + w * 0.3 + a * h * 0.38, y + h * 0.31 + b * h * 0.38, r)).join(""); break; }
      case "kuehlschrank": s = R(x, y, w, h, 2) + L(`M${x} ${y + h * 0.75}H${x + w}`, null, 0.8) + `<text x="${cx}" y="${y + h * 0.48}" text-anchor="middle" font-size="${Math.min(10, w * 0.32)}" fill="${S}">KS</text>`; break;
      case "waschmaschine": s = R(x, y, w, h, 3) + C(cx, cy + h * 0.06, m * 0.3) + C(cx, cy + h * 0.06, m * 0.18, "none", null, 0.8); break;
      case "badewanne": s = R(x, y, w, h, 6) + R(x + 5, y + 5, w - 10, h - 10, Math.min(h, w) * 0.4, F === "#ffffff" ? "#e0f2fe" : "#16324a", "#7dd3fc") + C(x + w * 0.85, cy, 2.5, "#7dd3fc", "#7dd3fc"); break;
      case "dusche": s = R(x, y, w, h, 2, F === "#ffffff" ? "#e0f2fe" : "#16324a", "#7dd3fc") + L(`M${x} ${y}L${x + w} ${y + h}M${x + w} ${y}L${x} ${y + h}`, "#7dd3fc", 0.8) + C(cx, cy, 3, "#7dd3fc", "#7dd3fc"); break;
      case "wc": s = R(x + w * 0.1, y, w * 0.8, h * 0.28, 2) + `<ellipse cx="${cx}" cy="${y + h * 0.62}" rx="${w * 0.42}" ry="${h * 0.36}" fill="${F}" stroke="${S}" stroke-width="1.3"/>`; break;
      case "waschbecken": s = R(x, y, w, h, 3) + `<ellipse cx="${cx}" cy="${cy + h * 0.06}" rx="${w * 0.32}" ry="${h * 0.28}" fill="none" stroke="#7dd3fc" stroke-width="1.3"/>`; break;
      case "rasen": s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${G1}" fill-opacity="${hell ? 0.28 : 0.35}" stroke="${G2}" stroke-opacity=".5" stroke-dasharray="6 5"/>`; break;
      case "beet": s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#6b4b2e" fill-opacity=".55" stroke="#8b6b4a"/>` + Array.from({ length: Math.max(2, Math.floor(w / 18)) }, (_, j) => C(x + 9 + j * ((w - 18) / Math.max(1, Math.floor(w / 18) - 1)), y + h * (j % 2 ? 0.35 : 0.65), 4, G2, G2, 1)).join(""); break;
      case "weg": s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${hell ? "#e2e8f0" : "#3a4558"}" stroke="${S}" stroke-opacity=".5"/>` + L(Array.from({ length: Math.floor(Math.max(w, h) / 16) }, (_, j) => (w >= h ? `M${x + (j + 1) * 16} ${y}V${y + h}` : `M${x} ${y + (j + 1) * 16}H${x + w}`)).join(""), S, 0.5); break;
      case "baum": case "busch": { const r = m / 2, n = 9; s = `<path d="${Array.from({ length: n }, (_, j) => { const a = (j / n) * Math.PI * 2, a2 = ((j + 1) / n) * Math.PI * 2; return `${j ? "" : `M${cx + r * 0.82 * Math.cos(a)} ${cy + r * 0.82 * Math.sin(a)}`}Q${cx + r * 1.08 * Math.cos((a + a2) / 2)} ${cy + r * 1.08 * Math.sin((a + a2) / 2)} ${cx + r * 0.82 * Math.cos(a2)} ${cy + r * 0.82 * Math.sin(a2)}`; }).join("")}Z" fill="${G1}" fill-opacity=".75" stroke="${G2}" stroke-width="1.4"/>` + (k.k === "baum" ? C(cx, cy, Math.max(2, r * 0.08), "#6b4b2e", "#6b4b2e") + L(`M${cx} ${cy}l${r * 0.4} ${-r * 0.3}M${cx} ${cy}l${-r * 0.35} ${-r * 0.35}M${cx} ${cy}l${r * 0.05} ${r * 0.45}`, G2, 1) : ""); break; }
      case "hecke": s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(w, h) / 2}" fill="${G1}" fill-opacity=".8" stroke="${G2}" stroke-width="1.4"/>` + L(Array.from({ length: Math.floor(Math.max(w, h) / 14) }, (_, j) => (w >= h ? `M${x + 7 + j * 14} ${cy - 2}l3 4` : `M${cx - 2} ${y + 7 + j * 14}l4 3`)).join(""), G2, 1); break;
      case "zaun": { const hor = w >= h; s = L(hor ? `M${x} ${cy}H${x + w}` : `M${cx} ${y}V${y + h}`, "#a8a29e", 2) + Array.from({ length: Math.floor(Math.max(w, h) / 40) + 1 }, (_, j) => (hor ? R(x + j * 40 - 2, cy - 2, 4, 4, 0, "#a8a29e", "#a8a29e") : R(cx - 2, y + j * 40 - 2, 4, 4, 0, "#a8a29e", "#a8a29e"))).join(""); break; }
      case "tor": s = L(`M${x} ${cy}H${x + w}`, "#a8a29e", 3, "8 4") + L(`M${x + w} ${cy}A${w} ${w} 0 0 0 ${x} ${cy - w * 0.0}`, S, 0.8, "4 4"); break;
      case "pool": s = R(x, y, w, h, 10, "#0e7490", "#67e8f9", 2) + R(x + 6, y + 6, w - 12, h - 12, 7, "#22d3ee", "none", 0).replace('fill="#22d3ee"', 'fill="#22d3ee" fill-opacity=".45"') + L(`M${x + w - 20} ${y + 8}v${h * 0.3}M${x + w - 12} ${y + 8}v${h * 0.3}`, "#e0f2fe", 1.2) + L(`M${x + w * 0.2} ${cy}q8 -5 16 0t16 0t16 0`, "#e0f2fe", 1); break;
      case "zisterne": s = C(cx, cy, m / 2, "#0c4a6e", "#38bdf8", 1.6, "6 4") + C(cx, cy, m * 0.12, F, "#38bdf8"); break;
      case "gartenhaus": case "garage": { const rr = Math.min(w, h) / 2; s = R(x, y, w, h, 1, hell ? "#f1f5f9" : "#2a3446", S, 1.6) + L(w >= h ? `M${x} ${y}L${x + rr} ${cy}L${x} ${y + h}M${x + w} ${y}L${x + w - rr} ${cy}L${x + w} ${y + h}M${x + rr} ${cy}H${x + w - rr}` : `M${x} ${y}L${cx} ${y + rr}L${x + w} ${y}M${x} ${y + h}L${cx} ${y + h - rr}L${x + w} ${y + h}M${cx} ${y + rr}V${y + h - rr}`, S, 1) + (k.k === "garage" ? L(`M${x + w * 0.1} ${y + h}H${x + w * 0.9}`, "#f59e0b", 3, "6 3") : ""); break; }
      case "carport": s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${S}" fill-opacity=".08" stroke="${S}" stroke-width="1.4" stroke-dasharray="7 5"/>` + [[0, 0], [1, 0], [0, 1], [1, 1], [0, 0.5], [1, 0.5]].map(([a, b]) => R(x + a * (w - 6), y + b * (h - 6), 6, 6, 1, S, S)).join("") + L(`M${x} ${y}L${x + w} ${y + h}`, S, 0.6, "4 4"); break;
      case "pv": { const cols = Math.max(2, Math.round(w / 34)), rows = Math.max(1, Math.round(h / 60)); s = R(x, y, w, h, 2, "#1e3a8a", "#93c5fd", 1.4) + L(Array.from({ length: cols - 1 }, (_, j) => `M${x + ((j + 1) * w) / cols} ${y}V${y + h}`).join("") + Array.from({ length: rows - 1 }, (_, j) => `M${x} ${y + ((j + 1) * h) / rows}H${x + w}`).join("") || "M0 0", "#93c5fd", 0.8); break; }
      case "muell": { const n = 3, cw = w / n - 3, c = ["#6b7280", "#2563eb", "#92400e"]; s = Array.from({ length: n }, (_, j) => R(x + j * (cw + 3), y, cw, h, 3, c[j], "#0b1220", 1)).join(""); break; }
      case "gartentisch": s = C(cx, cy, m * 0.28) + [0, 1, 2, 3, 4, 5].map((j) => C(cx + m * 0.42 * Math.cos((j * Math.PI) / 3), cy + m * 0.42 * Math.sin((j * Math.PI) / 3), m * 0.08)).join(""); break;
      case "grill": s = C(cx, cy, m / 2, "#1f2937", S) + L(`M${cx - m * 0.3} ${cy - m * 0.12}H${cx + m * 0.3}M${cx - m * 0.32} ${cy}H${cx + m * 0.32}M${cx - m * 0.3} ${cy + m * 0.12}H${cx + m * 0.3}`, "#f97316", 0.9); break;
      case "trampolin": s = C(cx, cy, m / 2, "#111827", "#38bdf8", 2) + C(cx, cy, m * 0.38, "#1f2937", S, 1, "3 3"); break;
      case "auto": { const v = h >= w; s = R(x, y, w, h, Math.min(w, h) * 0.28, hell ? "#cbd5e1" : "#475569", S, 1.4) + (v ? R(x + w * 0.12, y + h * 0.2, w * 0.76, h * 0.15, 4, "#93c5fd", "none", 0) + R(x + w * 0.14, y + h * 0.68, w * 0.72, h * 0.1, 3, "#93c5fd", "none", 0) : R(x + w * 0.2, y + h * 0.12, w * 0.15, h * 0.76, 4, "#93c5fd", "none", 0) + R(x + w * 0.68, y + h * 0.14, w * 0.1, h * 0.72, 3, "#93c5fd", "none", 0)); break; }
      case "maehroboter": s = C(cx, cy, m / 2, "#14532d", "#4ade80", 1.6) + L(`M${cx - m * 0.25} ${cy}H${cx + m * 0.25}`, "#4ade80", 1.4); break;
      case "hochbeet": s = R(x, y, w, h, 3, "#3f7d4e", "#8b5a2b", 4) + Array.from({ length: Math.max(2, Math.floor(w / 22)) }, (_, j) => C(x + 11 + j * ((w - 22) / Math.max(1, Math.floor(w / 22) - 1)), cy + (j % 2 ? -h * 0.15 : h * 0.15), Math.min(5, h * 0.18), G2, G2, 1)).join(""); break;
      case "obstbaum": { const r = m / 2; s = C(cx, cy, r * 0.92, G1, G2, 1.4).replace('fill="' + G1 + '"', 'fill="' + G1 + '" fill-opacity=".75"') + [[0.35, -0.2], [-0.3, 0.1], [0.1, 0.4], [-0.1, -0.45], [0.45, 0.3]].map(([a, b]) => C(cx + a * r, cy + b * r, Math.max(2, r * 0.08), "#ef4444", "#b91c1c", 0.8)).join("") + C(cx, cy, Math.max(2, r * 0.07), "#6b4b2e", "#6b4b2e"); break; }
      case "teich": s = `<path d="M${x + w * 0.1} ${cy}C${x} ${y + h * 0.1} ${x + w * 0.55} ${y - h * 0.05} ${x + w * 0.75} ${y + h * 0.15}S${x + w * 1.02} ${y + h * 0.8} ${x + w * 0.6} ${y + h * 0.95}S${x + w * 0.05} ${y + h * 0.95} ${x + w * 0.1} ${cy}Z" fill="#0e7490" fill-opacity=".75" stroke="#67e8f9" stroke-width="1.6"/>` + C(x + w * 0.35, y + h * 0.4, Math.min(8, m * 0.08), "#4ade80", "#166534", 0.8) + C(x + w * 0.55, y + h * 0.65, Math.min(6, m * 0.06), "#4ade80", "#166534", 0.8); break;
      case "gewaechshaus": s = R(x, y, w, h, 2, "#ecfeff", "#a5f3fc", 1.6).replace('fill="#ecfeff"', 'fill="#a5f3fc" fill-opacity=".22"') + L((w >= h ? `M${x} ${cy}H${x + w}` : `M${cx} ${y}V${y + h}`) + Array.from({ length: Math.max(1, Math.floor(Math.max(w, h) / 30)) }, (_, j) => (w >= h ? `M${x + (j + 1) * 30} ${y}V${y + h}` : `M${x} ${y + (j + 1) * 30}H${x + w}`)).join(""), "#a5f3fc", 0.8) + Array.from({ length: 3 }, (_, j) => C(x + w * (0.25 + j * 0.25), cy + (w >= h ? h * 0.25 : 0), Math.min(5, m * 0.08), G2, G2, 1)).join(""); break;
      case "kompost": s = R(x, y, w, h, 2, "#5b3a1e", "#8b5a2b", 2) + L(Array.from({ length: 4 }, (_, j) => `M${x + (j + 1) * w / 5} ${y + 3}L${x + (j + 1) * w / 5 - w * 0.15} ${y + h - 3}`).join(""), "#a16207", 0.8); break;
      case "regentonne": s = C(cx, cy, m / 2, "#14532d", "#4ade80", 1.4) + C(cx, cy, m * 0.36, "#0e7490", "#67e8f9", 0.8); break;
      case "bewaesserung": { const wet = !!(i.e && st && st[i.e] && ["on", "open"].includes(st[i.e].state)); s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#38bdf8" fill-opacity="${wet ? 0.28 : 0.07}" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="7 5"/>` + [[0.25, 0.3], [0.75, 0.3], [0.5, 0.72]].map(([a, b]) => { const px = x + a * w, py = y + b * h, rr = Math.min(w, h) * 0.18; return C(px, py, 3, "#38bdf8", "#38bdf8") + (wet ? `<path d="M${px - rr} ${py}A${rr} ${rr} 0 0 1 ${px + rr} ${py}" fill="none" stroke="#7dd3fc" stroke-width="1.2" stroke-dasharray="2 3"/>` : ""); }).join(""); break; }
      case "wasserhahn": s = R(x, y, w, h, 3, "#0c4a6e", "#38bdf8", 1.4) + L(`M${x + w * 0.25} ${y + h * 0.4}H${x + w * 0.7}V${y + h * 0.75}`, "#7dd3fc", 1.6); break;
      case "spielturm": { const p = Math.min(w * 0.45, h); s = R(x, y, p, p, 2, "#8b5a2b", "#d6a46b", 1.6) + L(`M${x} ${y}L${x + p} ${y + p}M${x + p} ${y}L${x} ${y + p}`, "#d6a46b", 1) + `<rect x="${x + p}" y="${y + p * 0.3}" width="${w - p}" height="${p * 0.4}" rx="${p * 0.2}" fill="#f97316" fill-opacity=".8" stroke="#fdba74" stroke-width="1.2"/>` + L(`M${x + p + 6} ${cy - p * 0.02 + (y + p * 0.5 - cy)}h${(w - p) * 0.7}`, "#fff7ed", 0.8); break; }
      case "schaukel": s = L(`M${x} ${y + h * 0.2}H${x + w}M${x} ${y}V${y + h}M${x + w} ${y}V${y + h}`, "#d6a46b", 2.4) + [0.35, 0.65].map((a) => R(x + w * a - w * 0.08, y + h * 0.5, w * 0.16, h * 0.12, 2, "#f59e0b", "#fbbf24", 1) + L(`M${x + w * a - w * 0.07} ${y + h * 0.2}V${y + h * 0.5}M${x + w * a + w * 0.07} ${y + h * 0.2}V${y + h * 0.5}`, S, 0.7)).join(""); break;
      case "sandkasten": s = R(x, y, w, h, 3, "#fde68a", "#a16207", 4).replace('fill="#fde68a"', 'fill="#fde68a" fill-opacity=".7"') + Array.from({ length: 9 }, (_, j) => C(x + w * (0.2 + (j % 3) * 0.3), y + h * (0.2 + Math.floor(j / 3) * 0.3), 1.2, "#d97706", "#d97706", 0.5)).join(""); break;
      case "whirlpool": s = R(x, y, w, h, m * 0.18, "#164e63", "#67e8f9", 1.6) + C(cx, cy, m * 0.36, "#22d3ee", "#a5f3fc", 1).replace('fill="#22d3ee"', 'fill="#22d3ee" fill-opacity=".45"') + [[-0.12, -0.1], [0.1, 0.05], [-0.02, 0.16], [0.16, -0.14]].map(([a, b]) => C(cx + a * m, cy + b * m, 2, "none", "#e0f2fe", 0.8)).join(""); break;
      case "sauna": s = R(x, y, w, h, 2, "#7c4a21", "#d6a46b", 1.6) + L(`M${x + w * 0.1} ${y + h * 0.3}H${x + w * 0.9}M${x + w * 0.1} ${y + h * 0.5}H${x + w * 0.9}`, "#d6a46b", 1) + R(x + w * 0.65, y + h * 0.65, w * 0.2, h * 0.2, 2, "#1f2937", "#f97316", 1); break;
      case "liegestuhl": s = R(x, y, w, h, 4, "#f8fafc", S, 1.2).replace('fill="#f8fafc"', 'fill="#38bdf8" fill-opacity=".35"') + L(`M${x + 3} ${y + h * 0.3}H${x + w - 3}`, S, 1); break;
      case "sonnenschirm": { const r = m / 2; s = `<polygon points="${Array.from({ length: 8 }, (_, j) => { const a = (j * Math.PI) / 4 + Math.PI / 8; return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`; }).join(" ")}" fill="#f97316" fill-opacity=".35" stroke="#fdba74" stroke-width="1.4"/>` + L(Array.from({ length: 4 }, (_, j) => { const a = (j * Math.PI) / 4 + Math.PI / 8; return `M${cx - r * Math.cos(a)} ${cy - r * Math.sin(a)}L${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`; }).join(""), "#fdba74", 0.8) + C(cx, cy, 2.5, "#fdba74", "#fdba74"); break; }
      case "feuerstelle": s = C(cx, cy, m / 2, "#44403c", "#a8a29e", 3, "4 2") + `<path d="M${cx} ${cy - m * 0.25}c${m * 0.12} ${m * 0.12} ${m * 0.16} ${m * 0.22} 0 ${m * 0.36}c${-m * 0.16} ${-m * 0.14} ${-m * 0.12} ${-m * 0.24} 0 ${-m * 0.36}z" fill="#f97316" stroke="#fbbf24" stroke-width="0.8"/>`; break;
      case "trittsteine": { const n = Math.max(2, Math.round(Math.max(w, h) / 22)), hor = w >= h; s = Array.from({ length: n }, (_, j) => { const t = (j + 0.5) / n; return `<ellipse cx="${hor ? x + w * t : cx + (j % 2 ? 3 : -3)}" cy="${hor ? cy + (j % 2 ? 3 : -3) : y + h * t}" rx="${hor ? w / n * 0.38 : w * 0.4}" ry="${hor ? h * 0.4 : h / n * 0.38}" fill="${hell ? "#e2e8f0" : "#64748b"}" stroke="${S}" stroke-width="0.8"/>`; }).join(""); break; }
      case "holzterrasse": s = R(x, y, w, h, 1, "#8b5a2b", "#d6a46b", 1.2).replace('fill="#8b5a2b"', 'fill="#8b5a2b" fill-opacity=".8"') + L(Array.from({ length: Math.floor((w >= h ? h : w) / 10) }, (_, j) => (w >= h ? `M${x} ${y + (j + 1) * 10}H${x + w}` : `M${x + (j + 1) * 10} ${y}V${y + h}`)).join(""), "#a16207", 0.6); break;
      case "fahrrad": s = L(`M${x} ${cy}H${x + w}`, S, 1.6) + Array.from({ length: Math.max(2, Math.floor(w / 30)) }, (_, j) => { const bx2 = x + 12 + j * ((w - 24) / Math.max(1, Math.floor(w / 30) - 1)); return L(`M${bx2} ${y}V${y + h}`, "#94a3b8", 2.2); }).join(""); break;
      case "gartenlampe": { const on = !!(i.e && st && st[i.e] && st[i.e].state === "on"); s = (on ? `<circle cx="${cx}" cy="${cy}" r="${m * 2.2}" fill="#fde68a" opacity=".25"/>` : "") + C(cx, cy, Math.max(4, m / 2), on ? "#fde68a" : F, on ? "#fbbf24" : S, 1.4); break; }
      default: {   /* v0.15: einfache Formen für die neuen Gegenstände */
        const sh = k.sh || "box", tint = hell ? "#e2e8f0" : "#243247";
        if (sh === "round") s = `<ellipse cx="${cx}" cy="${cy}" rx="${w / 2}" ry="${h / 2}" fill="${F}" stroke="${S}" stroke-width="1.3"/>`;
        else if (sh === "rug") s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${tint}" fill-opacity=".7" stroke="${S}" stroke-opacity=".7" stroke-dasharray="5 4"/>` + R(x + 6, y + 6, w - 12, h - 12, 2, "none", S, 0.7);
        else if (sh === "rows") { const n2 = Math.max(1, Math.floor((w >= h ? w : h) / 28)); s = R(x, y, w, h, 1) + L(Array.from({ length: n2 }, (_, j) => { const t2 = (j + 1) / (n2 + 1); return w >= h ? `M${x + w * t2} ${y + 2}V${y + h - 2}` : `M${x + 2} ${y + h * t2}H${x + w - 2}`; }).join(""), null, 0.8); }
        else if (sh === "doors") s = R(x, y, w, h, 1) + L(`M${cx} ${y}V${y + h}`, null, 0.9) + C(cx - 4, cy, 1.2, S, S, 1) + C(cx + 4, cy, 1.2, S, S, 1);
        else if (sh === "stove") { const r2 = Math.min(w, h) * 0.17; s = R(x, y, w, h, 2) + [[0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7]].map(([a, b]) => C(x + w * a, y + h * b, r2)).join(""); }
        else if (sh === "drum") s = R(x, y, w, h, 3) + C(cx, cy + h * 0.06, m * 0.3) + L(`M${x + 4} ${y + 5}h${w * 0.25}`, null, 1);
        else if (sh === "sink") { const n2 = w > h * 1.6 ? 2 : 1; s = R(x, y, w, h, 3) + Array.from({ length: n2 }, (_, j) => `<ellipse cx="${x + (w / n2) * (j + 0.5)}" cy="${cy + h * 0.06}" rx="${(w / n2) * 0.34}" ry="${h * 0.28}" fill="none" stroke="#7dd3fc" stroke-width="1.3"/>`).join(""); }
        else if (sh === "bed") s = R(x, y, w, h, 3) + R(x + 4, y + 4, w - 8, Math.min(h * 0.2, 26), 4) + R(x + 3, y + Math.min(h * 0.2, 26) + 7, w - 6, h - Math.min(h * 0.2, 26) - 10, 3, "none", S, 0.8);
        else if (sh === "seat") s = R(x, y, w, h, 7) + R(x, y, w, h * 0.26, 5);
        else if (sh === "grid") s = R(x, y, w, h, 1) + L(Array.from({ length: Math.max(1, Math.floor(w / 40)) }, (_, j) => `M${x + (w / (Math.floor(w / 40) + 1)) * (j + 1)} ${y}V${y + h}`).join("") + Array.from({ length: Math.max(1, Math.floor(h / 40)) }, (_, j) => `M${x} ${y + (h / (Math.floor(h / 40) + 1)) * (j + 1)}H${x + w}`).join(""), null, 0.8);
        else if (sh === "fan") s = R(x, y, w, h, 3) + C(cx, cy, m * 0.36) + L(`M${cx} ${cy - m * 0.3}V${cy + m * 0.3}M${cx - m * 0.3} ${cy}H${cx + m * 0.3}`, null, 1);
        else if (sh === "stairs") s = R(x, y, w, h, 1) + L(Array.from({ length: Math.max(3, Math.floor(h / 22)) }, (_, j) => `M${x} ${y + (h / (Math.max(3, Math.floor(h / 22)) + 1)) * (j + 1)}H${x + w}`).join(""), null, 0.9);
        else if (sh === "tt") s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="#1f5f4a" stroke="${S}"/>` + L(`M${cx} ${y}V${y + h}`, "#e2e8f0", 1.2) + L(`M${x + 2} ${y + 2}H${x + w - 2}V${y + h - 2}H${x + 2}Z`, "#e2e8f0", 0.6);
        else s = R(x, y, w, h, 3);
        break;
      }
    }
    const S2 = i.e && this._grTechState ? this._grTechState(i) : null, lab = S2 && S2.t ? S2.t : "", lw = lab.length * 5.6 + 12;
    const chip = lab ? `<rect x="${cx - lw / 2}" y="${cy - 7.5}" width="${lw}" height="15" rx="7.5" fill="${hell ? "#fff" : "#0b1220"}" opacity=".92"/><text x="${cx}" y="${cy + 3.5}" text-anchor="middle" font-size="9.5" font-weight="700" fill="${S2.on ? "#fbbf24" : hell ? "#334155" : "#e2e8f0"}">${esc(lab)}</text>` : "";
    /* v0.15 E3: Zustand direkt im Plan – farbiger Schein um jeden Gegenstand mit Entität, der gerade läuft (rot bei Fehler) */
    let glow = "";
    if (S2 && (S2.on || S2.al) && !i.ng) {
      const dom = String(i.e || "").split(".")[0], gc = S2.al ? "#ef4444" : ["climate", "water_heater"].includes(dom) ? "#fb923c" : ["valve", "moisture"].includes(dom) ? "#38bdf8" : "#fbbf24";
      glow = `<rect x="${x - 3}" y="${y - 3}" width="${w + 6}" height="${h + 6}" rx="${Math.min(12, m / 3)}" fill="${gc}" fill-opacity=".1" stroke="${gc}" stroke-opacity=".55" stroke-width="2.5" pointer-events="none"/><rect x="${x - 7}" y="${y - 7}" width="${w + 14}" height="${h + 14}" rx="${Math.min(16, m / 2.5)}" fill="none" stroke="${gc}" stroke-opacity=".2" stroke-width="3" pointer-events="none"/>`;
    }
    return `<g><title>${esc(k.n)}${i.n ? ` · ${esc(i.n)}` : ""}${lab ? ` · ${esc(lab)}` : ""}</title><g${rot}>${glow}${s}</g>${chip}</g>`;
  }
  /* Möbel und Außen-Gegenstände einer Etage. which = "aussen" (unter den Räumen) oder "innen" (über den Böden) */
  _grMobLayer(P, fl, T, o, which, st) {
    const hell = o.style === "hell", K = this._grMK(), isOut = (i) => this._grMK() && this._grOUT.has(this._grMk(i).g), f = (P.floors || []).find((x) => x.id === fl) || {};
    let d = "";
    if (which === "aussen" && f.ga) d += this._grHouseOnLot(P, T, o);
    const its = (P.items || []).filter((i) => i.t === "o" && i.fl === fl && (which === "aussen" ? isOut(i) : !isOut(i)));
    const z = (i) => K.L.findIndex((x) => x[0] === i.ok);
    its.sort((a, b) => z(a) - z(b)).forEach((i) => { d += this._grMobSvg(i, T, hell, st); });
    return d;
  }
  /* Grundstück: Haus (erste Etage, die kein Grundstück ist) als Umriss mit Dach-Schraffur; Antippen öffnet die Etage */
  _grHouseOnLot(P, T, o) {
    const main = (P.floors || []).find((f) => !f.ga && /^(eg|erdgeschoss)$/i.test(f.n)) || (P.floors || []).find((f) => !f.ga); if (!main) return "";
    const rs = (P.items || []).filter((i) => i.t === "r" && i.fl === main.id && !i.ds && this._grKind(i).k !== "aussen"); if (!rs.length) return "";
    const pth = rs.map((r) => "M" + this._grPoly(r).map((p) => p[0] + " " + p[1]).join("L") + "Z").join(""), x0 = Math.min(...rs.map((r) => r.x)), y0 = Math.min(...rs.map((r) => r.y)), x1 = Math.max(...rs.map((r) => r.x + r.w)), y1 = Math.max(...rs.map((r) => r.y + r.h));
    const hell = o.style === "hell", fill = hell ? "#e2e8f0" : "#273246";
    return `<g${o.click ? ` data-act="grxfl" data-k="${esc(main.id)}" style="cursor:pointer"` : ""}><title>Haus · ${esc(main.n)} öffnen</title><path d="${pth}" fill="${fill}" stroke="${fill}" stroke-width="16" stroke-linejoin="miter"/><path d="${pth}" fill="${fill}" stroke="${hell ? "#94a3b8" : "#64748b"}" stroke-width="2"/>
      <path d="M${x0} ${y0}L${(x0 + x1) / 2} ${(y0 + y1) / 2}L${x1} ${y0}M${x0} ${y1}L${(x0 + x1) / 2} ${(y0 + y1) / 2}L${x1} ${y1}" stroke="${hell ? "#94a3b8" : "#475569"}" stroke-width="1.2" fill="none"/>
      <rect x="${(x0 + x1) / 2 - 46}" y="${(y0 + y1) / 2 - 13}" width="92" height="26" rx="13" fill="${hell ? "#fff" : "#0b1220"}" stroke="var(--teal,#2dd4bf)"/><text x="${(x0 + x1) / 2}" y="${(y0 + y1) / 2 + 4}" text-anchor="middle" font-size="12" font-weight="800" fill="${hell ? "#0f172a" : "#e2e8f0"}">Haus · ${esc(main.n)}</text></g>`;
  }
  /* ---- Sonnenlicht */
  _grSunPos(date, lat, lon) {
    const rad = Math.PI / 180, n = date.getTime() / 86400000 + 2440587.5 - 2451545.0;
    const L = (280.46 + 0.9856474 * n) % 360, g = ((357.528 + 0.9856003 * n) % 360) * rad, lam = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * rad, eps = (23.439 - 0.0000004 * n) * rad;
    const ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)), dec = Math.asin(Math.sin(eps) * Math.sin(lam));
    const gmst = (((18.697374558 + 24.06570982441908 * n) % 24) + 24) % 24, ha = (gmst * 15 + lon) * rad - ra, la = lat * rad;
    const el = Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(ha));
    const az = Math.atan2(-Math.sin(ha), Math.tan(dec) * Math.cos(la) - Math.sin(la) * Math.cos(ha));
    return { az: ((az / rad) % 360 + 360) % 360, el: el / rad };
  }
  _grSun() {
    const c = (this._hass && this._hass.config) || {}, lat = Number(c.latitude), lon = Number(c.longitude), now = new Date();
    if (this._grSunH != null && isFinite(lat) && isFinite(lon)) { const d = new Date(now); d.setHours(Math.floor(this._grSunH), Math.round((this._grSunH % 1) * 60), 0, 0); return { ...this._grSunPos(d, lat, lon), t: d, src: "Regler" }; }
    const s = this._hass.states["sun.sun"], a = s && s.attributes;
    if (a && a.azimuth != null && a.elevation != null) return { az: Number(a.azimuth), el: Number(a.elevation), t: now, src: "sun.sun" };
    if (isFinite(lat) && isFinite(lon)) return { ...this._grSunPos(now, lat, lon), t: now, src: "berechnet" };
    return null;
  }
  _grDir(az) { return ["Nord", "Nordost", "Ost", "Südost", "Süd", "Südwest", "West", "Nordwest"][Math.round(((az % 360) + 360) % 360 / 45) % 8]; }
  _grSunSvg(P, fl, T, u, ins, bx) {
    const S = this._grSun(); if (!S) return { svg: "", rooms: [], S: null };
    const sc = P.scale > 0 ? P.scale : 40, N = ((P.north || 0) * Math.PI) / 180, A = (S.az * Math.PI) / 180 + N, sx = Math.sin(A), sy = -Math.cos(A), lit = new Set();
    let d = "", clips = "";
    if (S.el > 0.5) {
      const tn = Math.tan((S.el * Math.PI) / 180);
      (P.items || []).filter((i) => i.t === "f" && i.fl === fl && i.fk !== "dach").forEach((i, n) => {
        /* 2026.11.4.2: Fenster dürfen bis zur Wandstärke neben der Wandlinie sitzen (vorher 3 Einheiten – Fenster außen auf der Wand bekamen keine Sonne) */
        const inf = this._grOpenInfo(i, P, 14); if (!inf) return;
        const [x1, y1, x2, y2] = inf.seg, ux = (x2 - x1) / inf.L, uy = (y2 - y1) / inf.L, nx = -uy, ny = ux, hw = this._grHw(i, sc), fx = x1 + ux * inf.t, fy = y1 + uy * inf.t;   /* Fußpunkt auf der Wandlinie */
        const room = ins.find((r) => this._sfInRoom(r, fx + nx * 12, fy + ny * 12)) ? 1 : ins.find((r) => this._sfInRoom(r, fx - nx * 12, fy - ny * 12)) ? -1 : 0; if (!room) return;
        const inx = nx * room, iny = ny * room, outDot = -(sx * inx + sy * iny); if (outDot < 0.05) return;
        const rm = ins.find((r) => this._sfInRoom(r, fx + inx * 12, fy + iny * 12)); if (!rm) return;
        const far = Math.min(8, 2.1 / tn), n0 = (i.fk === "boden" ? 0 : 0.9) / tn, near = n0 > far - 0.5 ? Math.max(0, far - 3) : n0,   /* tiefe Wintersonne: Lichtstreifen bis weit in den Raum */ dx = -sx, dy = -sy, k = (v) => v * sc;
        const E1 = [fx - ux * hw, fy - uy * hw], E2 = [fx + ux * hw, fy + uy * hw];
        const pt = (E, t) => `${E[0] + dx * k(t)} ${E[1] + dy * k(t)}`;
        const id = `${u}sun${n}`; clips += `<clipPath id="${id}"><path d="M${this._grPoly(rm).map((p) => p[0] + " " + p[1]).join("L")}Z"/></clipPath>`;
        d += `<path d="M${pt(E1, 0)}L${pt(E2, 0)}L${pt(E2, near)}L${pt(E1, near)}Z" fill="#fde68a" fill-opacity=".1" clip-path="url(#${id})"/><path d="M${pt(E1, near)}L${pt(E2, near)}L${pt(E2, far)}L${pt(E1, far)}Z" fill="url(#${u}sung)" clip-path="url(#${id})"/>`;   /* schwacher Strahl vom Fenster, dann die Lichtfläche auf dem Boden */
        lit.add(rm.n || "Raum");
      });
    }
    /* 2026.11.4.2: Sonne immer außerhalb des Hauses – Abstand bis zum Rand des Plans in Sonnenrichtung (vorher halbe Breite + 26:
       bei schräger Richtung wie Südwest lag sie in der Hausecke, z. B. im Sportzimmer) */
    const cx = (bx.x0 + bx.x1) / 2, cy = (bx.y0 + bx.y1) / 2, hx = (bx.x1 - bx.x0) / 2, hy = (bx.y1 - bx.y0) / 2;
    const R = Math.min(Math.abs(sx) > 1e-6 ? hx / Math.abs(sx) : Infinity, Math.abs(sy) > 1e-6 ? hy / Math.abs(sy) : Infinity) + (this._grDimsOn && this._grDimsOn() ? 62 : 32), px = cx + sx * R, py = cy + sy * R, up = S.el > 0;
    const sun = `<g pointer-events="none"><circle cx="${px}" cy="${py}" r="11" fill="${up ? "#fbbf24" : "#475569"}" opacity="${up ? 1 : 0.6}"/>${up ? Array.from({ length: 8 }, (_, j) => { const a = (j * Math.PI) / 4; return `<path d="M${px + 14 * Math.cos(a)} ${py + 14 * Math.sin(a)}L${px + 19 * Math.cos(a)} ${py + 19 * Math.sin(a)}" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>`; }).join("") : ""}</g>`;
    return { svg: `<defs><linearGradient id="${u}sung" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde68a" stop-opacity=".55"/><stop offset="1" stop-color="#fbbf24" stop-opacity=".22"/></linearGradient>${clips}</defs><g pointer-events="none" style="mix-blend-mode:screen">${d}</g>${sun}`, rooms: [...lit], S };
  }
  _grSunBar(P, fl) {
    const S = this._grSun(); if (!S) return `<div class="grsun mut sm">Sonnenlicht braucht den Standort in Home Assistant (Einstellungen → System → Allgemein).</div>`;
    const G = this._grSunLast || { rooms: [] }, h = this._grSunH != null ? this._grSunH : S.t.getHours() + S.t.getMinutes() / 60, hh = `${String(Math.floor(h)).padStart(2, "0")}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;
    return `<div class="grsun"><span class="gsi">☀</span><span><b>${hh}</b> · ${S.el > 0 ? `${this._grDir(S.az)} · ${num(S.el, 0)}° hoch` : "Sonne unter dem Horizont"}${S.el > 0 ? ` · <b>${G.rooms.length ? "Sonne in: " + esc(G.rooms.join(", ")) : "keine Sonne durch die Fenster"}</b>` : ""}</span>
      <input type="range" min="5" max="22" step="0.25" value="${h.toFixed(2)}" data-f="grxsunh" aria-label="Tageszeit"><button class="grb ${this._grSunH == null ? "on" : ""}" data-act="grxsunnow">Jetzt</button></div>`;
  }
  /* ---- Modul 0: Entität wählen wie überall sonst (Suchfeld + Vorschläge, 2026.11.4.3b5) – ersetzt die Knopfreihen */
  _grSelItem() { const ed = this._sfEd; return ed ? (ed.plan.items || []).find((x) => x.id === ed.sel) : null; }
  _grPkCtx() {
    const sel = this._grSelItem(); if (!sel) return "";
    const rm = (this._sfPl().items || []).find((r) => r.t === "r" && r.fl === sel.fl && this._sfInRoom(r, sel.x, sel.y)); if (!rm) return "";
    const ar = this._grArea ? this._grArea(rm) : null; return (ar && ar.name) || rm.n || "";
  }
  _grPkUsed() { const sel = this._grSelItem(); return new Set((this._sfPl().items || []).filter((x) => x.e && (!sel || x.id !== sel.id)).map((x) => x.e)); }
  _grPick(sel, cand, hint) {
    return this._wzSel(cand, sel.e || "", "grxpk", `data-k="${esc(sel.t)}"`, "– nicht verbunden –", hint || null);
  }
  /* ---- Baukasten: Möbel/Außen */
  _grMobCat0(cur, act, onlyOut) { const K = this._grMK(); return Object.entries(K.G).filter(([g]) => onlyOut == null || this._grOUT.has(g) === onlyOut).map(([g, [gn, gc]]) => `<div class="grtkg"><small style="color:${gc}">${gn}</small><div class="grseg">${K.L.filter((x) => x[2] === g).map((x) => `<button class="${cur === x[0] ? "on" : ""}" data-act="${act}" data-v="${x[0]}">${x[1]}</button>`).join("")}</div></div>`).join(""); }
  _grMobProps(sel) {
    const k = this._grMk(sel), sc = this._sfScale(), st = this._hass.states, cm = (px) => Math.round((px / sc) * 100);
    const want = k.d, match = (e) => want.some((w) => { const [dm, dc] = w.split(":"); return e.startsWith(dm + ".") && (!dc || ((st[e].attributes || {}).device_class === dc)); }), cand = want.length ? Object.keys(st).filter(match) : [];
    const S = sel.e && this._grTechState ? this._grTechState(sel) : null, step = (act, lab, v) => `<div class="vrow" style="margin:6px 0"><span>${lab}</span><div class="step" style="flex:none"><button data-act="${act}" data-s="-10" aria-label="weniger">${ic("minus", 16)}</button><b>${num(v / 100, 2)} m</b><button data-act="${act}" data-s="10" aria-label="mehr">${ic("plus", 16)}</button></div></div>`;
    return `<details class="grtkd"><summary><span style="color:${this._grMK().G[k.g][1]}">●</span> ${esc(k.n)} <small class="mut">· ändern</small></summary>${this._grMobCat(sel.ok, "grxok2")}</details>
      ${step("grxow", "Breite", cm(sel.w || 40))}${step("grxoh", "Tiefe", cm(sel.h || 40))}
      <div class="grseg" style="margin:2px 0 8px"><button data-act="grxorot" data-s="-15">↺ 15°</button><button data-act="grxorot" data-s="15">↻ 15°</button><button data-act="grxorot" data-s="90">↻ 90°</button><button data-act="grxosz">Normgröße</button></div>
      ${this._grNeoRot ? this._grNeoRot(sel) : ""}
      <div class="vrow" style="margin:6px 0"><span>Fest<small class="mut" style="display:block">Nicht verschiebbar, bis du es ausschaltest</small></span><button class="sw ${sel.lk ? "on" : ""}" data-act="grxlock" role="switch" aria-checked="${!!sel.lk}" aria-label="Fest"></button></div>
      ${want.length ? `<div class="sffld"><label>Verbinden mit Home Assistant (optional)</label>${cand.length || sel.e ? this._grPick(sel, cand, /heiz|thermostat|trv|radiator|klima|ofen|kamin|lampe|licht/i) : `<div class="mut sm">Keine passende Entität gefunden.</div>`}${S ? `<div class="grwall ok" style="margin-top:6px">${ic("check", 14)}<span>${esc(this._wzName(sel.e))} · <b>${esc(S.t || "verbunden")}</b></span></div>` : ""}</div>` : ""}`;
  }
  _grB10Box() {
    const ed = this._sfEd; if (!ed) return "";
    const P = ed.plan, nth = P.north || 0, hasGa = (P.floors || []).some((f) => f.ga);
    return `<div class="sffld"><label>Norden zeigt nach</label><div class="vrow" style="margin:0"><svg viewBox="-20 -20 40 40" width="40" height="40" aria-hidden="true"><circle r="18" fill="none" stroke="var(--line)"/><g transform="rotate(${nth})"><path d="M0 -15L5 3L0 0L-5 3Z" fill="var(--teal,#2dd4bf)"/></g></svg><span class="mut sm" style="flex:1">${nth}° · ${this._grDir(nth)} (für Sonnenlicht und Nordpfeil)</span><div class="step" style="flex:none"><button data-act="grxnorth" data-s="-15" aria-label="15 Grad zurück">${ic("minus", 16)}</button><button data-act="grxnorth" data-s="15" aria-label="15 Grad weiter">${ic("plus", 16)}</button></div></div></div>
      <div class="sffld"><label>Grundstück</label><div class="mut sm" style="margin-bottom:6px">${hasGa ? "Das Grundstück ist eine eigene Etage „Außen“ – das Haus erscheint dort als Umriss." : "Eigene Etage „Außen“ für Garten, Pool, Carport, PV und Wege. Das Haus erscheint dort als Umriss."}</div>${hasGa ? "" : `<button class="btn2" data-act="grxlot" style="flex:none" ${P.floors.length >= 6 ? "disabled" : ""}>Grundstück anlegen</button>`}</div>`;
  }
  _grB10Act(a, b) {
    const v = b && b.dataset ? b.dataset.v : "", s = b && b.dataset ? Number(b.dataset.s || 0) : 0, k = b && b.dataset ? b.dataset.k : "";
    if (a === "grxsunnow") { this._grSunH = null; this._render(); return true; }
    if (a === "grxbig") { this._grBig = !this._grBigOn(); try { localStorage.setItem("fh_gr_big", this._grBig ? "1" : "0"); } catch (_) {} this._render(); return true; }
    if (this._grKAct && this._grKAct(a, b)) return true;   /* 2026.11.4.4b1: Fenster- und Türkontakte */
    const ed = this._sfEd; if (!ed) return false;
    const P = ed.plan;
    if (a === "grxnorth") { this._sfSnap(); P.north = ((((P.north || 0) + s) % 360) + 360) % 360; this._render(); return true; }
    if (a === "grxlot") { if (P.floors.length >= 6 || P.floors.some((f) => f.ga)) return true; this._sfSnap(); const id = "ga" + Date.now().toString(36).slice(-4); P.floors.push({ id, n: "Außen", ga: 1 }); this._sfFlId = id; ed.sel = ""; ed.tool = "o"; this._grOkLast = "rasen"; this._render(); this._toast("Grundstück angelegt – Rasen, Wege, Pool & Co. mit „Möbel“ setzen"); return true; }
    if (this._grKatAct && this._grKatAct(a, b)) return true;   /* v0.15: Katalog-Filter, Favoriten, Spiegeln, Ausrichten */
    if (a === "grxokt") { this._grOkLast = v; this._grRecAdd(v); this._render(); return true; }
    const cur = P.items.find((x) => x.id === ed.sel); if (!cur || cur.t !== "o") return false;
    const sc = this._sfScale(), px = (cm) => Math.max(4, Math.round((cm / 100) * sc));
    if (a === "grxok2") { this._sfSnap(); const kk = this._grMK().by[v]; if (kk) { const cx = cur.x + cur.w / 2, cy = cur.y + cur.h / 2; cur.ok = v; this._grRecAdd(v); cur.w = px(kk.w); cur.h = px(kk.h); cur.x = Math.round(cx - cur.w / 2); cur.y = Math.round(cy - cur.h / 2); if (!kk.d.length) cur.e = ""; } this._grOkLast = v; this._render(); return true; }
    /* 2026.11.4.6: Größe ändern, ohne dass das Element wandert – die Mitte bleibt (gedreht wird um die Mitte) */
    const keepC = (fn) => { const cx = cur.x + (cur.w || 0) / 2, cy = cur.y + (cur.h || 0) / 2; fn(); cur.x = Math.round(cx - (cur.w || 0) / 2); cur.y = Math.round(cy - (cur.h || 0) / 2); };
    if (a === "grxow" || a === "grxoh") { this._sfSnap(); const key = a === "grxow" ? "w" : "h", cm = Math.max(10, Math.round(((cur[key] || 40) / sc) * 100) + s); keepC(() => { cur[key] = px(cm); }); this._render(); return true; }
    if (a === "grxorot") { this._sfSnap(); cur.r = ((((cur.r || 0) + s) % 360) + 360) % 360; this._render(); return true; }
    if (a === "grxosz") { this._sfSnap(); const kk = this._grMk(cur); keepC(() => { cur.w = px(kk.w); cur.h = px(kk.h); }); this._render(); return true; }
    if (a === "grxoe") { this._sfSnap(); cur.e = v; this._render(); return true; }
    return false;
  }
  _grB10Change(t) {
    if (t.dataset && t.dataset.f === "grxpk") { const cur = this._grSelItem(); if (cur) { this._sfSnap(); if (t.dataset.k === "ek") cur.ek = t.value || ""; else { cur.e = t.value || ""; if (!cur.e) delete cur.ek; } this._render(); } return true; }
    if (t.dataset && t.dataset.f === "grxsunh") { this._grSunH = Number(t.value); this._render(); return true; }
    return false;
  }
  /* Sichtfeld des Baukastens: mindestens 800 × 480, größer, wenn etwas darüber hinausragt (z. B. das Grundstück) */
  _grEdVB(fl) {
    const ed = this._sfEd, its = ed ? ed.plan.items.filter((i) => i.fl === fl) : [];
    let x0 = 0, y0 = 0, x1 = 800, y1 = 480;
    its.forEach((i) => { const rb = i.r && i.w && i.h ? (() => { const cx = i.x + i.w / 2, cy = i.y + i.h / 2, t = i.r * Math.PI / 180, ex = Math.abs(i.w / 2 * Math.cos(t)) + Math.abs(i.h / 2 * Math.sin(t)), ey = Math.abs(i.w / 2 * Math.sin(t)) + Math.abs(i.h / 2 * Math.cos(t)); return [cx - ex, cx + ex, cy - ey, cy + ey]; })() : null;   /* gedrehte Elemente: tatsächliche Ausdehnung */
      const a = rb ? [rb[0], rb[1]] : [i.x, i.x2, i.x + (i.w || 0)].filter((v) => v != null), b = rb ? [rb[2], rb[3]] : [i.y, i.y2, i.y + (i.h || 0)].filter((v) => v != null); x0 = Math.min(x0, ...a.map((v) => v - 20)); y0 = Math.min(y0, ...b.map((v) => v - 20)); x1 = Math.max(x1, ...a.map((v) => v + 20)); y1 = Math.max(y1, ...b.map((v) => v + 20)); });
    x0 = Math.max(-50, x0); y0 = Math.max(-50, y0); x1 = Math.min(1200, x1); y1 = Math.min(1200, y1);
    return [x0, y0, x1 - x0, y1 - y0];
  }
