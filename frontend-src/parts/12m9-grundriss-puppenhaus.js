  /* ================= Modul 0 Build 10: Möbel, Außenbereich, Puppenhaus, Sonnenlicht =================
     Element „o“: Möbel (Bett, Sofa, Küche, Bad …) und Außen (Baum, Hecke, Pool, Carport, PV …) mit Größe in cm, drehbar, teils mit Entität.
     Grundstück als eigene Etage „Außen“ (floor.ga): das Haus erscheint dort als Umriss, Antippen öffnet die Etage.
     Puppenhaus: alle Etagen schräg übereinander, Wände leicht hochgezogen; Antippen einer Etage klappt sie flach.
     Sonnenlicht: Nordrichtung des Plans + Sonnenstand (sun.sun oder berechnet) → Lichtflächen durch die Fenster, Tageszeit-Regler. */
  _grMK() {
    if (this._grMKc) return this._grMKc;
    const L = [
      ["bett", "Doppelbett", "wohnen", 180, 200], ["bett1", "Einzelbett", "wohnen", 90, 200], ["sofa", "Sofa", "wohnen", 220, 90], ["sessel", "Sessel", "wohnen", 80, 80], ["tisch", "Esstisch", "wohnen", 160, 90],
      ["couchtisch", "Couchtisch", "wohnen", 100, 60], ["schreibtisch", "Schreibtisch", "wohnen", 140, 70], ["schrank", "Schrank", "wohnen", 200, 60], ["regal", "Regal", "wohnen", 100, 35], ["kommode", "Kommode", "wohnen", 120, 50], ["tvboard", "TV-Board", "wohnen", 180, 45],
      ["kueche", "Küchenzeile", "kueche", 300, 60], ["insel", "Kochinsel", "kueche", 180, 90], ["kuehlschrank", "Kühlschrank", "kueche", 60, 65], ["waschmaschine", "Waschmaschine", "bad", 60, 60],
      ["badewanne", "Badewanne", "bad", 170, 75], ["dusche", "Dusche", "bad", 90, 90], ["wc", "WC", "bad", 40, 65], ["waschbecken", "Waschbecken", "bad", 60, 45],
      ["rasen", "Rasen", "aussen", 600, 400], ["beet", "Beet", "aussen", 200, 100], ["weg", "Weg / Einfahrt", "aussen", 300, 120], ["baum", "Baum", "aussen", 400, 400], ["busch", "Busch", "aussen", 150, 150], ["hecke", "Hecke", "aussen", 400, 80],
      ["zaun", "Zaun", "aussen", 400, 10], ["tor", "Tor", "aussen", 300, 10], ["pool", "Pool", "aussen", 600, 300], ["zisterne", "Zisterne", "aussen", 200, 200], ["gartenhaus", "Gartenhaus", "aussen", 300, 250], ["garage", "Garage", "aussen", 300, 600],
      ["carport", "Carport", "aussen", 300, 550], ["pv", "PV-Anlage", "aussen", 500, 300], ["muell", "Mülltonnen", "aussen", 150, 70], ["gartentisch", "Gartentisch", "aussen", 180, 180], ["grill", "Grill", "aussen", 60, 50],
      ["trampolin", "Trampolin", "aussen", 300, 300], ["auto", "Auto", "aussen", 180, 450], ["maehroboter", "Mähroboter", "aussen", 60, 60]];
    const G = { wohnen: ["Wohnen & Schlafen", "#94a3b8"], kueche: ["Küche", "#94a3b8"], bad: ["Bad & Wäsche", "#7dd3fc"], aussen: ["Außen", "#4ade80"] };
    const D = { pool: ["sensor:temperature"], pv: ["sensor:power", "sensor:energy"], zisterne: ["sensor"], muell: ["sensor", "calendar"], garage: ["cover"], tor: ["cover"], maehroboter: ["lawn_mower", "vacuum"], auto: ["sensor:battery", "device_tracker"], waschmaschine: ["sensor:power", "switch", "sensor"], kuehlschrank: ["sensor:temperature"] };
    this._grMKc = { L, G, D, by: Object.fromEntries(L.map((x) => [x[0], { k: x[0], n: x[1], g: x[2], w: x[3], h: x[4], d: D[x[0]] || [] }])) };
    return this._grMKc;
  }
  _grMk(i) { const K = this._grMK(); return K.by[i.ok] || K.by.tisch; }
  _grMobSvg(i, T, hell, st) {
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
      default: s = R(x, y, w, h, 3);
    }
    const S2 = i.e && this._grTechState ? this._grTechState(i) : null, lab = S2 && S2.t ? S2.t : "", lw = lab.length * 5.6 + 12;
    const chip = lab ? `<rect x="${cx - lw / 2}" y="${cy - 7.5}" width="${lw}" height="15" rx="7.5" fill="${hell ? "#fff" : "#0b1220"}" opacity=".92"/><text x="${cx}" y="${cy + 3.5}" text-anchor="middle" font-size="9.5" font-weight="700" fill="${S2.on ? "#fbbf24" : hell ? "#334155" : "#e2e8f0"}">${esc(lab)}</text>` : "";
    return `<g><title>${esc(k.n)}${i.n ? ` · ${esc(i.n)}` : ""}${lab ? ` · ${esc(lab)}` : ""}</title><g${rot}>${s}</g>${chip}</g>`;
  }
  /* Möbel und Außen-Gegenstände einer Etage. which = "aussen" (unter den Räumen) oder "innen" (über den Böden) */
  _grMobLayer(P, fl, T, o, which, st) {
    const hell = o.style === "hell", K = this._grMK(), isOut = (i) => this._grMk(i).g === "aussen", f = (P.floors || []).find((x) => x.id === fl) || {};
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
        const inf = this._grOpenInfo(i, P); if (!inf) return;
        const [x1, y1, x2, y2] = inf.seg, ux = (x2 - x1) / inf.L, uy = (y2 - y1) / inf.L, nx = -uy, ny = ux, hw = this._grHw(i, sc);
        const room = ins.find((r) => this._sfInRoom(r, i.x + nx * 12, i.y + ny * 12)) ? 1 : ins.find((r) => this._sfInRoom(r, i.x - nx * 12, i.y - ny * 12)) ? -1 : 0; if (!room) return;
        const inx = nx * room, iny = ny * room, outDot = -(sx * inx + sy * iny); if (outDot < 0.05) return;
        const rm = ins.find((r) => this._sfInRoom(r, i.x + inx * 12, i.y + iny * 12)); if (!rm) return;
        const far = Math.min(8, 2.1 / tn), n0 = (i.fk === "boden" ? 0 : 0.9) / tn, near = n0 > far - 0.5 ? Math.max(0, far - 3) : n0,   /* tiefe Wintersonne: Lichtstreifen bis weit in den Raum */ dx = -sx, dy = -sy, k = (v) => v * sc;
        const E1 = [i.x - ux * hw, i.y - uy * hw], E2 = [i.x + ux * hw, i.y + uy * hw];
        const pt = (E, t) => `${E[0] + dx * k(t)} ${E[1] + dy * k(t)}`;
        const id = `${u}sun${n}`; clips += `<clipPath id="${id}"><path d="M${this._grPoly(rm).map((p) => p[0] + " " + p[1]).join("L")}Z"/></clipPath>`;
        d += `<path d="M${pt(E1, 0)}L${pt(E2, 0)}L${pt(E2, near)}L${pt(E1, near)}Z" fill="#fde68a" fill-opacity=".1" clip-path="url(#${id})"/><path d="M${pt(E1, near)}L${pt(E2, near)}L${pt(E2, far)}L${pt(E1, far)}Z" fill="url(#${u}sung)" clip-path="url(#${id})"/>`;   /* schwacher Strahl vom Fenster, dann die Lichtfläche auf dem Boden */
        lit.add(rm.n || "Raum");
      });
    }
    const cx = (bx.x0 + bx.x1) / 2, cy = (bx.y0 + bx.y1) / 2, R = Math.max(bx.x1 - bx.x0, bx.y1 - bx.y0) / 2 + 26, px = cx + sx * R, py = cy + sy * R, up = S.el > 0;
    const sun = `<g pointer-events="none"><circle cx="${px}" cy="${py}" r="11" fill="${up ? "#fbbf24" : "#475569"}" opacity="${up ? 1 : 0.6}"/>${up ? Array.from({ length: 8 }, (_, j) => { const a = (j * Math.PI) / 4; return `<path d="M${px + 14 * Math.cos(a)} ${py + 14 * Math.sin(a)}L${px + 19 * Math.cos(a)} ${py + 19 * Math.sin(a)}" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>`; }).join("") : ""}</g>`;
    return { svg: `<defs><linearGradient id="${u}sung" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde68a" stop-opacity=".55"/><stop offset="1" stop-color="#fbbf24" stop-opacity=".22"/></linearGradient>${clips}</defs><g pointer-events="none" style="mix-blend-mode:screen">${d}</g>${sun}`, rooms: [...lit], S };
  }
  _grSunBar(P, fl) {
    const S = this._grSun(); if (!S) return `<div class="grsun mut sm">Sonnenlicht braucht den Standort in Home Assistant (Einstellungen → System → Allgemein).</div>`;
    const G = this._grSunLast || { rooms: [] }, h = this._grSunH != null ? this._grSunH : S.t.getHours() + S.t.getMinutes() / 60, hh = `${String(Math.floor(h)).padStart(2, "0")}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;
    return `<div class="grsun"><span class="gsi">☀</span><span><b>${hh}</b> · ${S.el > 0 ? `${this._grDir(S.az)} · ${num(S.el, 0)}° hoch` : "Sonne unter dem Horizont"}${S.el > 0 ? ` · <b>${G.rooms.length ? "Sonne in: " + esc(G.rooms.join(", ")) : "keine Sonne durch die Fenster"}</b>` : ""}</span>
      <input type="range" min="5" max="22" step="0.25" value="${h.toFixed(2)}" data-f="grxsunh" aria-label="Tageszeit"><button class="grb ${this._grSunH == null ? "on" : ""}" data-act="grxsunnow">Jetzt</button></div>`;
  }
  /* ---- Puppenhaus */
  _grDoll(P, o) {
    o = o || {}; const sty = o.style || this._grStyle(), T = this._grTheme(sty), fls = this._grFloors(P), ga = fls.find((f) => f.ga), houses = fls.filter((f) => !f.ga);
    const k = o.k || 1, a = 0.866 * k, b = 0.5 * k, pr = (x, y) => [a * x - a * y, b * x + b * y], H = (o.wall || 22) * k;
    const box = (fl) => { const rs = (P.items || []).filter((i) => (i.t === "r" || (i.t === "o" && fl === (ga || {}).id)) && i.fl === fl); if (!rs.length) return null; return { x0: Math.min(...rs.map((r) => r.x)), y0: Math.min(...rs.map((r) => r.y)), x1: Math.max(...rs.map((r) => r.x + (r.w || 0))), y1: Math.max(...rs.map((r) => r.y + (r.h || 0))) }; };
    const stack = [...(ga ? [ga] : []), ...houses].filter((f) => box(f.id)); if (!stack.length) return null;
    const hb = houses.map((f) => box(f.id)).filter(Boolean), hy = hb.length ? Math.max(...hb.map((q) => { const c = [[q.x0, q.y0], [q.x1, q.y0], [q.x0, q.y1], [q.x1, q.y1]].map((p) => pr(p[0], p[1])[1]); return Math.max(...c) - Math.min(...c); })) : 200;
    const LH = Math.max(90 * k, hy * (o.gap || 0.62));
    let body = "", pts = [];
    stack.forEach((f, idx) => {
      const lvl = f.ga ? 0 : houses.indexOf(f) + (ga ? 0 : 0), dy = -lvl * LH, q = box(f.id);
      const G = this._grDraw(P, f.id, { style: sty, labels: o.labels !== false, deco: false, dims: false, bare: true, doors: true, windows: true, layers: { licht: !!o.licht, sf: false, gt: false, mo: true, ht: false } });
      const corners = [[q.x0, q.y0], [q.x1, q.y0], [q.x1, q.y1], [q.x0, q.y1]].map((p) => { const r = pr(p[0], p[1]); return [r[0], r[1] + dy]; });
      corners.forEach((c) => pts.push(c, [c[0], c[1] - H]));
      const slab = corners.map((c) => c.join(" ")).join("L"), th = 7 * k;
      const side = `<path d="M${corners[1][0]} ${corners[1][1]}L${corners[2][0]} ${corners[2][1]}L${corners[2][0]} ${corners[2][1] + th}L${corners[1][0]} ${corners[1][1] + th}Z" fill="${sty === "hell" ? "#cbd5e1" : "#0b1424"}"/><path d="M${corners[2][0]} ${corners[2][1]}L${corners[3][0]} ${corners[3][1]}L${corners[3][0]} ${corners[3][1] + th}L${corners[2][0]} ${corners[2][1] + th}Z" fill="${sty === "hell" ? "#94a3b8" : "#070d18"}"/>`;
      const shadow = idx ? `<path d="M${slab}Z" transform="translate(${10 * k} ${26 * k})" fill="#000" opacity=".28" filter="url(#dollblur)"/>` : "";
      body += `<g class="grdl" data-act="grxdoll" data-k="${esc(f.id)}" style="cursor:pointer">${shadow}${f.ga ? "" : side}<g transform="matrix(${a} ${b} ${-a} ${b} 0 ${dy})">${G.svg}</g>`;
      if (!f.ga) {   /* Wände hochziehen: Außenkanten der Räume, hinten zuerst */
        const W = [];
        (P.items || []).filter((i) => i.t === "r" && i.fl === f.id && !i.ds && this._grKind(i).k !== "aussen").forEach((r) => { const Q = this._grPoly(r); Q.forEach((p, j) => { const q2 = Q[(j + 1) % Q.length]; W.push([p, q2]); }); });
        const key = (s) => `${Math.round(Math.min(s[0][0], s[1][0]))},${Math.round(Math.min(s[0][1], s[1][1]))},${Math.round(Math.max(s[0][0], s[1][0]))},${Math.round(Math.max(s[0][1], s[1][1]))}`, cnt = new Map();
        W.forEach((s) => cnt.set(key(s), (cnt.get(key(s)) || 0) + 1));
        W.sort((s1, s2) => (s1[0][0] + s1[0][1] + s1[1][0] + s1[1][1]) - (s2[0][0] + s2[0][1] + s2[1][0] + s2[1][1])).forEach((s) => {
          const inner = cnt.get(key(s)) > 1, A1 = pr(...s[0]), A2 = pr(...s[1]), y1 = A1[1] + dy, y2 = A2[1] + dy, hh = inner ? H * 0.55 : H;
          const dxs = s[1][0] - s[0][0], dys = s[1][1] - s[0][1], lightSide = Math.abs(dxs) > Math.abs(dys);
          const fill = sty === "hell" ? (lightSide ? "#e2e8f0" : "#cbd5e1") : sty === "bauplan" ? (lightSide ? "#1e5ba8" : "#174a8a") : lightSide ? "#3b475c" : "#2b3547";
          body += `<path d="M${A1[0]} ${y1}L${A2[0]} ${y2}L${A2[0]} ${y2 - hh}L${A1[0]} ${y1 - hh}Z" fill="${fill}" fill-opacity="${inner ? 0.55 : 0.82}" stroke="${sty === "hell" ? "#94a3b8" : "#5b6b84"}" stroke-width="${0.8 * k}"/>`;
        });
        const lp = corners[0], lab = `${f.n}`;
        body += `<g pointer-events="none"><rect x="${lp[0] - 30 * k - lab.length * 4.2 * k}" y="${lp[1] - 13 * k - H}" width="${lab.length * 8.4 * k + 18 * k}" height="${24 * k}" rx="${12 * k}" fill="${sty === "hell" ? "#fff" : "#0b1220"}" stroke="var(--teal,#2dd4bf)" stroke-width="${1.2 * k}"/><text x="${lp[0] - 21 * k}" y="${lp[1] + 4 * k - H}" text-anchor="end" font-size="${12 * k}" font-weight="800" fill="${sty === "hell" ? "#0f172a" : "#e2e8f0"}">${esc(lab)}</text></g>`;
      }
      body += `</g>`;
    });
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), m = 30 * k, vb = { x: Math.min(...xs) - m - 60 * k, y: Math.min(...ys) - m, w: Math.max(...xs) - Math.min(...xs) + 2 * m + 60 * k, h: Math.max(...ys) - Math.min(...ys) + 2 * m + 10 * k };
    return { vb, svg: `<defs><filter id="dollblur"><feGaussianBlur stdDeviation="${8 * k}"/></filter></defs>${body}`, T };
  }
  _grDollMini(P) {
    try { const D = this._grDoll(P, { k: 1, labels: false, wall: 26, gap: 0.55 }); if (!D) return this._grHouse(P); return `<svg class="grhs grdm" viewBox="${D.vb.x} ${D.vb.y} ${D.vb.w} ${D.vb.h}" aria-hidden="true">${D.svg}</svg>`; } catch (_) { return this._grHouse(P); }
  }
  /* ---- Baukasten: Möbel/Außen */
  _grMobCat(cur, act, onlyOut) { const K = this._grMK(); return Object.entries(K.G).filter(([g]) => onlyOut == null || (g === "aussen") === onlyOut).map(([g, [gn, gc]]) => `<div class="grtkg"><small style="color:${gc}">${gn}</small><div class="grseg">${K.L.filter((x) => x[2] === g).map((x) => `<button class="${cur === x[0] ? "on" : ""}" data-act="${act}" data-v="${x[0]}">${x[1]}</button>`).join("")}</div></div>`).join(""); }
  _grMobProps(sel) {
    const k = this._grMk(sel), sc = this._sfScale(), st = this._hass.states, cm = (px) => Math.round((px / sc) * 100);
    const want = k.d, match = (e) => want.some((w) => { const [dm, dc] = w.split(":"); return e.startsWith(dm + ".") && (!dc || ((st[e].attributes || {}).device_class === dc)); }), cand = want.length ? Object.keys(st).filter(match).sort((a, b) => this._wzName(a).localeCompare(this._wzName(b), "de")).slice(0, 20) : [];
    const S = sel.e && this._grTechState ? this._grTechState(sel) : null, step = (act, lab, v) => `<div class="vrow" style="margin:6px 0"><span>${lab}</span><div class="step" style="flex:none"><button data-act="${act}" data-s="-10" aria-label="weniger">${ic("minus", 16)}</button><b>${num(v / 100, 2)} m</b><button data-act="${act}" data-s="10" aria-label="mehr">${ic("plus", 16)}</button></div></div>`;
    return `<details class="grtkd"><summary><span style="color:${this._grMK().G[k.g][1]}">●</span> ${esc(k.n)} <small class="mut">· ändern</small></summary>${this._grMobCat(sel.ok, "grxok2")}</details>
      ${step("grxow", "Breite", cm(sel.w || 40))}${step("grxoh", "Tiefe", cm(sel.h || 40))}
      <div class="grseg" style="margin:2px 0 8px"><button data-act="grxorot" data-s="-15">↺ 15°</button><button data-act="grxorot" data-s="15">↻ 15°</button><button data-act="grxorot" data-s="90">↻ 90°</button><button data-act="grxosz">Normgröße</button></div>
      ${want.length ? `<div class="sffld"><label>Verbinden mit Home Assistant (optional)</label>${cand.length ? `<div class="gschips"><button class="gsch ${!sel.e ? "sel" : ""}" data-act="grxoe" data-v="">keine</button>${cand.map((e) => `<button class="gsch ${sel.e === e ? "sel" : ""}" data-act="grxoe" data-v="${esc(e)}">${esc(this._wzName(e))}</button>`).join("")}</div>` : `<div class="mut sm">Keine passende Entität gefunden.</div>`}${S ? `<div class="grwall ok" style="margin-top:6px">${ic("check", 14)}<span>${esc(this._wzName(sel.e))} · <b>${esc(S.t || "verbunden")}</b></span></div>` : ""}</div>` : ""}`;
  }
  _grB10Box() {
    const ed = this._sfEd; if (!ed) return "";
    const P = ed.plan, nth = P.north || 0, hasGa = (P.floors || []).some((f) => f.ga);
    return `<div class="sffld"><label>Norden zeigt nach</label><div class="vrow" style="margin:0"><svg viewBox="-20 -20 40 40" width="40" height="40" aria-hidden="true"><circle r="18" fill="none" stroke="var(--line)"/><g transform="rotate(${nth})"><path d="M0 -15L5 3L0 0L-5 3Z" fill="var(--teal,#2dd4bf)"/></g></svg><span class="mut sm" style="flex:1">${nth}° · ${this._grDir(nth)} (für Sonnenlicht und Nordpfeil)</span><div class="step" style="flex:none"><button data-act="grxnorth" data-s="-15" aria-label="15 Grad zurück">${ic("minus", 16)}</button><button data-act="grxnorth" data-s="15" aria-label="15 Grad weiter">${ic("plus", 16)}</button></div></div></div>
      <div class="sffld"><label>Grundstück</label><div class="mut sm" style="margin-bottom:6px">${hasGa ? "Das Grundstück ist eine eigene Etage „Außen“ – das Haus erscheint dort als Umriss." : "Eigene Etage „Außen“ für Garten, Pool, Carport, PV und Wege. Das Haus erscheint dort als Umriss."}</div>${hasGa ? "" : `<button class="btn2" data-act="grxlot" style="flex:none" ${P.floors.length >= 6 ? "disabled" : ""}>Grundstück anlegen</button>`}</div>`;
  }
  _grB10Act(a, b) {
    const v = b && b.dataset ? b.dataset.v : "", s = b && b.dataset ? Number(b.dataset.s || 0) : 0, k = b && b.dataset ? b.dataset.k : "";
    if (a === "grxview") { this._grView = k === "3d" ? "3d" : "2d"; this._render(); return true; }
    if (a === "grxdoll") { this._grFl = k; this._grView = "2d"; this._render(); return true; }
    if (a === "grxsunnow") { this._grSunH = null; this._render(); return true; }
    const ed = this._sfEd; if (!ed) return false;
    const P = ed.plan;
    if (a === "grxnorth") { this._sfSnap(); P.north = ((((P.north || 0) + s) % 360) + 360) % 360; this._render(); return true; }
    if (a === "grxlot") { if (P.floors.length >= 6 || P.floors.some((f) => f.ga)) return true; this._sfSnap(); const id = "ga" + Date.now().toString(36).slice(-4); P.floors.push({ id, n: "Außen", ga: 1 }); this._sfFlId = id; ed.sel = ""; ed.tool = "o"; this._grOkLast = "rasen"; this._render(); this._toast("Grundstück angelegt – Rasen, Wege, Pool & Co. mit „Möbel“ setzen"); return true; }
    if (a === "grxokt") { this._grOkLast = v; this._render(); return true; }
    const cur = P.items.find((x) => x.id === ed.sel); if (!cur || cur.t !== "o") return false;
    const sc = this._sfScale(), px = (cm) => Math.max(4, Math.round((cm / 100) * sc));
    if (a === "grxok2") { this._sfSnap(); const kk = this._grMK().by[v]; if (kk) { const cx = cur.x + cur.w / 2, cy = cur.y + cur.h / 2; cur.ok = v; cur.w = px(kk.w); cur.h = px(kk.h); cur.x = Math.round(cx - cur.w / 2); cur.y = Math.round(cy - cur.h / 2); if (!kk.d.length) cur.e = ""; } this._grOkLast = v; this._render(); return true; }
    if (a === "grxow" || a === "grxoh") { this._sfSnap(); const key = a === "grxow" ? "w" : "h", cm = Math.max(10, Math.round(((cur[key] || 40) / sc) * 100) + s); cur[key] = px(cm); this._render(); return true; }
    if (a === "grxorot") { this._sfSnap(); cur.r = ((((cur.r || 0) + s) % 360) + 360) % 360; this._render(); return true; }
    if (a === "grxosz") { this._sfSnap(); const kk = this._grMk(cur); cur.w = px(kk.w); cur.h = px(kk.h); this._render(); return true; }
    if (a === "grxoe") { this._sfSnap(); cur.e = v; this._render(); return true; }
    return false;
  }
  _grB10Change(t) {
    if (t.dataset && t.dataset.f === "grxsunh") { this._grSunH = Number(t.value); this._render(); return true; }
    return false;
  }
  /* Sichtfeld des Baukastens: mindestens 800 × 480, größer, wenn etwas darüber hinausragt (z. B. das Grundstück) */
  _grEdVB(fl) {
    const ed = this._sfEd, its = ed ? ed.plan.items.filter((i) => i.fl === fl) : [];
    let x0 = 0, y0 = 0, x1 = 800, y1 = 480;
    its.forEach((i) => { const a = [i.x, i.x2, i.x + (i.w || 0)].filter((v) => v != null), b = [i.y, i.y2, i.y + (i.h || 0)].filter((v) => v != null); x0 = Math.min(x0, ...a.map((v) => v - 20)); y0 = Math.min(y0, ...b.map((v) => v - 20)); x1 = Math.max(x1, ...a.map((v) => v + 20)); y1 = Math.max(y1, ...b.map((v) => v + 20)); });
    x0 = Math.max(-50, x0); y0 = Math.max(-50, y0); x1 = Math.min(1200, x1); y1 = Math.min(1200, y1);
    return [x0, y0, x1 - x0, y1 - y0];
  }
