  /* D5 Vorlagen zum Start: ein fertiger Grundriss zum Anpassen statt leerem Raster (Maßstab 40 Bildpunkte je Meter) */
  _grTplList() {
    return [
      { k: "wohnung", n: "Wohnung · 3 Zimmer", d: "ca. 75 m²", fl: [["eg", "EG"]], R: { eg: [["Wohnzimmer", 180, 80, 200, 160], ["Küche", 380, 80, 120, 160], ["Schlafzimmer", 180, 240, 160, 160], ["Bad", 340, 240, 80, 160], ["Kinderzimmer", 420, 240, 80, 160]] }, F: { eg: [[280, 80], [440, 80], [260, 400], [460, 400], [500, 160]] }, D: { eg: [[180, 160], [260, 240], [380, 160], [340, 320], [460, 240]] } },
      { k: "reihenhaus", n: "Reihenhaus", d: "EG + OG, ca. 110 m²", fl: [["eg", "EG"], ["og", "OG"]], R: { eg: [["Wohnen & Essen", 200, 80, 240, 200], ["Küche", 440, 80, 120, 200], ["Flur", 200, 280, 80, 120], ["WC", 280, 280, 80, 120]], og: [["Schlafzimmer", 200, 80, 200, 200], ["Kinderzimmer", 400, 80, 160, 200], ["Bad", 200, 280, 120, 120], ["Flur", 320, 280, 120, 120]] }, F: { eg: [[320, 80], [500, 80], [360, 400]], og: [[300, 80], [480, 80], [260, 400]] }, D: { eg: [[240, 400], [280, 340], [440, 180]], og: [[320, 340], [400, 180], [260, 280]] } },
      { k: "doppel", n: "Doppelhaushälfte", d: "EG + OG, ca. 140 m²", fl: [["eg", "EG"], ["og", "OG"]], R: { eg: [["Wohnzimmer", 180, 80, 240, 200], ["Küche", 420, 80, 140, 200], ["Flur", 180, 280, 100, 140], ["Arbeitszimmer", 280, 280, 140, 140], ["Gäste-WC", 420, 280, 80, 140]], og: [["Schlafzimmer", 180, 80, 240, 200], ["Kinderzimmer 1", 420, 80, 140, 200], ["Flur", 180, 280, 100, 140], ["Kinderzimmer 2", 280, 280, 140, 140], ["Bad", 420, 280, 140, 140]] }, F: { eg: [[300, 80], [490, 80], [350, 420], [180, 180]], og: [[300, 80], [490, 80], [350, 420], [180, 180]] }, D: { eg: [[230, 420], [280, 340], [420, 180], [460, 280]], og: [[280, 340], [420, 340], [420, 180], [230, 280]] } },
      { k: "bungalow", n: "Bungalow", d: "ein Geschoss, ca. 120 m²", fl: [["eg", "EG"]], R: { eg: [["Wohnen & Essen", 160, 80, 280, 200], ["Küche", 440, 80, 120, 200], ["Schlafzimmer", 160, 280, 160, 160], ["Kinderzimmer", 320, 280, 120, 160], ["Bad", 440, 280, 120, 160], ["Flur", 560, 80, 80, 360]] }, F: { eg: [[300, 80], [500, 80], [240, 440], [380, 440], [160, 180]] }, D: { eg: [[640, 260], [320, 360], [440, 360], [560, 360], [560, 180]] } },
    ];
  }
  _grTplApply(key) {
    const T = this._grTplList().find((x) => x.k === key), ed = this._sfEd; if (!T || !ed) return;
    const P = ed.plan, uid = (() => { let n = 0; return () => "i" + Date.now().toString(36) + (n++).toString(36) + Math.random().toString(36).slice(2, 4); })();
    P.floors = T.fl.map(([id, n]) => ({ id, n })); P.items = []; P.scale = 40;
    T.fl.forEach(([fl]) => {
      const seen = new Set(), wall = (x, y, x2, y2) => { const k = [x, y, x2, y2].join(), k2 = [x2, y2, x, y].join(); if (seen.has(k) || seen.has(k2)) return; seen.add(k); P.items.push({ id: uid(), fl, t: "w", x, y, x2, y2, r: 0, n: "", e: "" }); };
      (T.R[fl] || []).forEach(([n, x, y, w, h]) => { P.items.push({ id: uid(), fl, t: "r", x, y, w, h, r: 0, n, e: "" }); wall(x, y, x + w, y); wall(x + w, y, x + w, y + h); wall(x, y + h, x + w, y + h); wall(x, y, x, y + h); });
      (T.F[fl] || []).forEach(([x, y]) => { const it = { id: uid(), fl, t: "f", x, y, w: 0, h: 0, r: 0, n: "", e: "" }; const sn = this._sfSnapOpen(fl, x, y, 24, it); if (sn) { it.x = sn.x; it.y = sn.y; it.r = sn.r; } P.items.push(it); });
      (T.D[fl] || []).forEach(([x, y]) => { const it = { id: uid(), fl, t: "d", x, y, w: 0, h: 0, r: 0, n: "", e: "" }; const sn = this._sfSnapOpen(fl, x, y, 24, it); if (sn) { it.x = sn.x; it.y = sn.y; it.r = sn.r; } P.items.push(it); });
    });
    this._sfFlId = T.fl[0][0]; this._grFl = T.fl[0][0];
  }
  _grTplBox() {
    return `<div class="grtpl"><div class="mut sm" style="margin:12px 0 6px">Oder starte mit einer Vorlage und passe sie an:</div><div class="grfr">${this._grTplList().map((t) => `<button data-act="grxtpl" data-v="${t.k}">${esc(t.n)}<small>${esc(t.d)}</small></button>`).join("")}</div></div>`;
  }
