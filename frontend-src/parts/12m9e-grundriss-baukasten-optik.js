  /* ================= Modul 0 · v0.15 E1: Baukasten in neuer Optik =================
     Gleiche ruhige Gestaltung wie der Plan: dunkle Flächen ohne harte Rahmen, Akzent Türkis, Plan-Check als Ampel, Titel „Baukasten“ in der Kopfleiste,
     Drehung in Schritten und „Abstand zur Wand“ bei Gegenständen. Schalter „Wie bisher“ (Einstellungen → Optik) zeigt den früheren Baukasten. */
  _grNeoCss() {
    return `<style>.grneo{gap:12px}
      .grneo .grtop{border:0;border-radius:18px;padding:10px 12px;background:color-mix(in srgb,var(--primary-text-color) 5%,var(--card,#111a2b));box-shadow:0 6px 22px #0000002e;gap:8px}
      .grneo .grtop::before{content:"Baukasten";font-weight:800;font-size:.95rem;letter-spacing:.02em;margin:0 8px 0 4px;color:var(--teal,#2dd4bf)}
      .grneo .grb{border-color:transparent;background:color-mix(in srgb,var(--primary-text-color) 7%,transparent)}.grneo .grb:hover:not(:disabled){background:color-mix(in srgb,var(--primary-text-color) 13%,transparent)}
      .grneo .grb.on{background:color-mix(in srgb,var(--teal,#2dd4bf) 18%,transparent)}.grneo .grb.pri{background:var(--teal,#2dd4bf);box-shadow:0 2px 10px #2dd4bf40}
      .grneo .grb.warn{background:#fbbf2420}.grlamp{width:10px;height:10px;border-radius:50%;display:inline-block;background:#34d399;box-shadow:0 0 0 3px #34d39928}.grlamp.a{background:#fbbf24;box-shadow:0 0 0 3px #fbbf2428}.grlamp.r{background:#f87171;box-shadow:0 0 0 3px #f8717128}
      .grneo .grrail{border:0;border-radius:18px;background:color-mix(in srgb,var(--primary-text-color) 5%,var(--card,#111a2b));padding:8px 5px;gap:3px}.grneo .grrail i{background:color-mix(in srgb,var(--primary-text-color) 12%,transparent)}
      .grneo .grtl{border-radius:12px;padding:7px 2px}.grneo .grtl:hover{background:color-mix(in srgb,var(--primary-text-color) 8%,transparent)}.grneo .grtl.on{box-shadow:none;background:color-mix(in srgb,var(--teal,#2dd4bf) 22%,transparent)}
      .grneo .grcv .sfpl.edit{border:0;border-radius:18px;box-shadow:0 8px 28px #00000038,inset 0 0 0 1px color-mix(in srgb,var(--primary-text-color) 8%,transparent)}
      .grneo .grpsec{border:0;border-radius:18px;background:color-mix(in srgb,var(--primary-text-color) 5%,var(--card,#111a2b))}
      .grneo .grtray{border-radius:16px;border-color:color-mix(in srgb,var(--teal,#2dd4bf) 40%,transparent)}.grneo .grchip{border-color:transparent;background:color-mix(in srgb,var(--primary-text-color) 8%,transparent)}
      .grneo .grseg button{border-color:transparent;background:color-mix(in srgb,var(--primary-text-color) 7%,transparent)}.grneo .grseg button.on{background:color-mix(in srgb,var(--teal,#2dd4bf) 20%,transparent)}
      @media (min-width:901px) and (min-height:520px){
        .grneo{height:calc(100dvh - 150px);min-height:430px;gap:10px}
        .grneo .grbody{flex:1;min-height:0;align-items:stretch}
        .grneo .grrail{position:static;top:auto;overflow-y:auto;min-height:0;scrollbar-width:none;padding:6px 4px;gap:1px}
        .grneo .grtl{padding:5px 2px;font-size:.58rem}.grneo .grtl svg{width:22px;height:22px}
        .grneo .grcv{display:flex;flex-direction:column;min-height:0;gap:8px}
        .grneo .grcv .sfpl.edit{flex:1;min-height:0;display:flex;align-items:center;justify-content:center}
        .grneo .grcv svg.sfpe{width:100%;height:100%;max-height:100%}
        .grneo .grprops{position:static;top:auto;overflow-y:auto;min-height:0;scrollbar-width:thin;padding-right:2px}
        .grneo .grhint{margin:0}.grneo .grtray{margin:0}
      }
      .grgap{display:flex;gap:8px;align-items:center;color:var(--mut);font-size:.8rem;margin:2px 0 8px}.grgap b{color:var(--primary-text-color)}</style>`;
  }
  /* Farbe je Gegenstand (Füllung, Linie) nach Art – Möbel haben Holz, Stoff und Porzellan, Außen-Teile Grün und Wasser. null = bisherige Darstellung */
  _grTint(id, hell) {
    const k = String(id || ""); if (!k || hell || (this._grLookNew && !this._grLookNew())) return null;
    const R = [[/herd|kuehl|gefrier|spuelmaschine|waschmaschine|trockner|kochinsel|kuechen/, ["#c6cfdb", "#6b7a90"]], [/bett|stockbett|kinderbett/, ["#3d5f91", "#a9c3ec"]], [/sofa|sessel|hollywood|hocker|stuhl|bank/, ["#4b5f7c", "#a3b6d4"]], [/tisch|theke|schreib|nachttisch|tischtennis/, ["#8a6238", "#d2a56b"]],
      [/schrank|regal|kommode|garderobe|buecher|schuhschrank/, ["#6e5538", "#c19a66"]], [/wanne|waschtisch|spuele|wc|dusche|bidet|toilette/, ["#8cc6ec", "#e2f2fc"]],
      [/teppich/, ["#5d4a72", "#b39ad0"]],
      [/pool|brunnen|teich|regentonne/, ["#2a7fbf", "#a5d5f5"]], [/baum|hecke|kraeuter|beet|rasen|pflanze|kuebel|strauch|wiese/, ["#2f6b41", "#8ed09f"]],
      [/pergola|terrasse|kies|pflaster|steinmauer|zaun|carport|garage|schuppen|huette|briefkasten/, ["#6b6558", "#c9c1ae"]]];
    const m = R.find((r) => r[0].test(k)); if (!m) return null;
    return hell ? null : m[1];   /* helle Stile (Hell, Karte) behalten die bisherige Darstellung */
  }
  /* Drehung in Schritten + Abstand zur nächsten Wand */
  _grNeoRot(sel) {
    if (!this._grLookNew || !this._grLookNew() || !sel) return "";
    const r = ((Math.round(sel.r || 0) % 360) + 360) % 360, gap = this._grWallGap(sel);
    return `<div class="sffld" style="margin:6px 0"><label>Drehung</label><div class="grseg">${[0, 90, 180, 270].map((d) => `<button class="${r === d ? "on" : ""}" data-act="grxorots" data-v="${d}">${d}°</button>`).join("")}${r % 90 ? `<button class="on" disabled>${r}°</button>` : ""}</div></div>${gap != null ? `<div class="grgap">${ic("ruler", 14)}<span>Abstand zur nächsten Wand: <b>${gap} cm</b></span></div>` : ""}`;
  }
  /* kürzester Abstand (cm) vom Rahmen eines Gegenstands zu einer Wand derselben Etage; null ohne Wände */
  _grWallGap(sel) {
    const ed = this._sfEd; if (!ed || !sel || !sel.w) return null;
    const sc = this._sfScale(), W = ed.plan.items.filter((i) => i.t === "w" && i.fl === sel.fl && [i.x, i.y, i.x2, i.y2].every(Number.isFinite)); if (!W.length) return null;
    const x0 = sel.x, y0 = sel.y, x1 = sel.x + sel.w, y1 = sel.y + (sel.h || 0);
    const dRP = (px, py) => Math.hypot(Math.max(x0 - px, 0, px - x1), Math.max(y0 - py, 0, py - y1));   /* Punkt → Rechteck */
    const dPS = (px, py, a, b, c, d) => { const dx = c - a, dy = d - b, L = dx * dx + dy * dy, t = L ? Math.max(0, Math.min(1, ((px - a) * dx + (py - b) * dy) / L)) : 0; return Math.hypot(px - (a + t * dx), py - (b + t * dy)); };
    let best = Infinity;
    W.forEach((w) => {
      let d = Math.min(dRP(w.x, w.y), dRP(w.x2, w.y2), dPS(x0, y0, w.x, w.y, w.x2, w.y2), dPS(x1, y0, w.x, w.y, w.x2, w.y2), dPS(x0, y1, w.x, w.y, w.x2, w.y2), dPS(x1, y1, w.x, w.y, w.x2, w.y2));
      const mx = (w.x + w.x2) / 2, my = (w.y + w.y2) / 2; if (mx >= x0 && mx <= x1 && my >= y0 && my <= y1) d = 0;
      best = Math.min(best, d);
    });
    return Number.isFinite(best) ? Math.round((best / sc) * 100) : null;
  }
