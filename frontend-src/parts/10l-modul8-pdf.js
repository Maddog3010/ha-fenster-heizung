  /* ================= Modul 8 · Ladenachweis als echte PDF-Datei (2026.11.3b23) =================
     Kleiner PDF-Schreiber ohne Bibliothek: A4 hochkant, Helvetica (WinAnsi, Umlaute und €), Tabelle mit Kopf auf jeder Seite,
     Summe, Fußnote und Seitenzahl. Vorher wurde ein HTML-Fenster zum Drucken geöffnet – in den Apps von Home Assistant
     ging das nicht, dann kam eine .html-Datei. */
  _pdfBytes(pages) {
    const enc = (s) => String(s).replace(/[^\x20-\x7e\xa0-\xff€–—„“”‚‘’…•]/g, "?").replace(/€/g, "\x80").replace(/–/g, "\x96").replace(/—/g, "\x97").replace(/„/g, "\x84").replace(/“/g, "\x93").replace(/”/g, "\x94").replace(/‚/g, "\x82").replace(/‘/g, "\x91").replace(/’/g, "\x92").replace(/…/g, "\x85").replace(/•/g, "\x95").replace(/[\\()]/g, (c) => "\\" + c);
    const objs = [], add = (s) => { objs.push(s); return objs.length; };
    const cat = add(""), pg = add(""), f1 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"), f2 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
    const kids = pages.map((ops) => {
      const body = ops.map((o) => o.t === "text" ? `BT /${o.b ? "F2" : "F1"} ${o.s} Tf ${o.c || "0 0 0"} rg ${o.x.toFixed(1)} ${o.y.toFixed(1)} Td (${enc(o.v)}) Tj ET`
        : o.t === "line" ? `${o.c || "0.8 0.8 0.8"} RG ${o.w || 0.5} w ${o.x1.toFixed(1)} ${o.y.toFixed(1)} m ${o.x2.toFixed(1)} ${o.y.toFixed(1)} l S`
        : `${o.c} rg ${o.x.toFixed(1)} ${o.y.toFixed(1)} ${o.w.toFixed(1)} ${o.h.toFixed(1)} re f`).join("\n");
      const st = add(`<< /Length ${body.length} >>\nstream\n${body}\nendstream`);
      return add(`<< /Type /Page /Parent ${pg} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${st} 0 R >>`);
    });
    objs[cat - 1] = `<< /Type /Catalog /Pages ${pg} 0 R >>`;
    objs[pg - 1] = `<< /Type /Pages /Kids [${kids.map((k) => k + " 0 R").join(" ")}] /Count ${kids.length} >>`;
    let out = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"; const off = [];
    objs.forEach((o, i) => { off.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const x = out.length;
    out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${off.map((o) => String(o).padStart(10, "0") + " 00000 n \n").join("")}trailer\n<< /Size ${objs.length + 1} /Root ${cat} 0 R >>\nstartxref\n${x}\n%%EOF`;
    const b = new Uint8Array(out.length); for (let i = 0; i < out.length; i++) b[i] = out.charCodeAt(i) & 255; return b;
  }
  /* Breite eines Textes in Helvetica (genähert, reicht für rechtsbündige Zahlen und zum Kürzen) */
  _pdfW(s, size, bold) {
    let w = 0; for (const ch of String(s)) w += /[0-9€]/.test(ch) ? 556 : /[ ,.:;!|il]/.test(ch) ? 278 : /[fjrt()\-–*]/.test(ch) ? 333 : /[mwMW]/.test(ch) ? 833 : /[A-ZÄÖÜ]/.test(ch) ? 667 : 520;
    return w * size / 1000 * (bold ? 1.06 : 1);
  }
  _pdfFit(s, size, max, bold) { s = String(s); if (this._pdfW(s, size, bold) <= max) return s; while (s.length > 1 && this._pdfW(s + "…", size, bold) > max) s = s.slice(0, -1); return s + "…"; }
  /* Ladenachweis: Seiten bauen */
  _wbPdfDoc(o) {
    const { title, sub, rows, sum, foot, notes } = o, X = [40, 132, 320, 470, 555], pages = []; let ops = [], y = 0, pno = 0;
    const T = (x, yy, v, s, b, c) => ops.push({ t: "text", x, y: yy, v, s, b, c }), Tr = (xr, yy, v, s, b, c) => T(xr - this._pdfW(v, s, b), yy, v, s, b, c), L = (yy, c, w) => ops.push({ t: "line", x1: 40, x2: 555, y: yy, c, w });
    const head = () => {
      ops = []; pno++; y = 800;
      if (pno === 1) { T(40, y, title, 18, true); y -= 18; T(40, y, sub, 10, false, "0.33 0.33 0.33"); y -= 26; } else { T(40, y, title + " (Fortsetzung)", 11, true); y -= 22; }
      ops.push({ t: "rect", x: 40, y: y - 5, w: 515, h: 18, c: "0.94 0.95 0.96" });
      [["Datum", 0], ["Fahrzeug", 1], ["Karte", 2]].forEach(([t, i]) => T(X[i] + (i ? 0 : 4), y, t, 9, true)); Tr(X[3], y, "kWh", 9, true); Tr(X[4] - 4, y, "Betrag €", 9, true); y -= 20;
    };
    const end = () => { T(40, 30, foot, 8, false, "0.45 0.45 0.45"); pages.push(ops); };
    head();
    rows.forEach((r) => {
      const h = r.note ? 26 : 16;
      if (y - h < 90) { end(); head(); }
      T(X[0] + 4, y, r.date, 9); T(X[1], y, this._pdfFit(r.veh, 9, X[2] - X[1] - 8), 9); T(X[2], y, this._pdfFit(r.card, 9, 100), 9); Tr(X[3], y, r.kwh, 9); Tr(X[4] - 4, y, r.eur, 9);
      if (r.note) T(X[1], y - 10, this._pdfFit(r.note, 7.5, X[3] - X[1] - 60), 7.5, false, "0.4 0.4 0.4");
      L(y - h + 11); y -= h;
    });
    if (y < 120) { end(); head(); }
    L(y + 6, "0 0 0", 1.2); y -= 10;
    T(X[0] + 4, y, sum.label, 10, true); Tr(X[3], y, sum.kwh, 10, true); Tr(X[4] - 4, y, sum.eur, 10, true); y -= 26;
    notes.forEach((n) => { if (y < 60) { end(); head(); } T(40, y, this._pdfFit(n, 8.5, 515), 8.5, false, "0.33 0.33 0.33"); y -= 13; });
    end();
    pages.forEach((p, i) => p.push({ t: "text", x: 555 - this._pdfW(`Seite ${i + 1} von ${pages.length}`, 8), y: 30, v: `Seite ${i + 1} von ${pages.length}`, s: 8, c: "0.45 0.45 0.45" }));
    return this._pdfBytes(pages);
  }
