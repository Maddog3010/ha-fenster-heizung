  /* ================= Modul 0 · v0.16 F1: Etagen-Art, Raumhöhe, Dachschräge, Wohnfläche =================
     Jede Etage hat eine Art (Keller, Erdgeschoss, Obergeschoss, Dachgeschoss, Dachboden, Garage) mit einer üblichen Raumhöhe. Ein Raum kann eine eigene Höhe
     und eine Dachschräge haben: Kniestock (Höhe an der niedrigen Kante), Neigung und die Seite der niedrigen Kante. Die Wohnfläche folgt der
     Wohnflächenverordnung: unter 1 m Höhe zählt nichts, von 1 bis 2 m die Hälfte, ab 2 m voll. */
  static FLOOR_KINDS = [["keller", "Keller", 220], ["eg", "Erdgeschoss", 260], ["og", "Obergeschoss", 250], ["dg", "Dachgeschoss", 250], ["dachboden", "Dachboden", 200], ["garage", "Garage", 250]];
  _grFloorKind(fl) { const f = ((this._sfEd ? this._sfEd.plan : this._grPlan ? this._grPlan() : null) || {}).floors; return f ? (f.find((x) => x.id === fl) || {}).k || "" : ""; }
  /* Maße eines Raums: Grundfläche, Wohnfläche, Volumen (m², m³) und Höhe in cm. P = Plan, r = Raum */
  _grMass(P, r) {
    const sc = P && P.scale > 0 ? P.scale : 40, gf = this._grAreaM2 ? this._grAreaM2(r, sc) : (r.w * r.h) / (sc * sc);
    const fl = ((P && P.floors) || []).find((f) => f.id === r.fl) || {}, kind = this.constructor.FLOOR_KINDS.find((k) => k[0] === fl.k), hh = r.hh || (kind ? kind[2] : 250);
    if (!r.dn || !r.sd) return { gf, wf: gf, vol: (gf * hh) / 100, hh, slope: false };
    /* Streifen quer zur Neigung: Abstand d von der niedrigen Kante, Höhe = Kniestock + d · tan(Neigung), nie höher als die Raumhöhe */
    const horiz = r.sd === "n" || r.sd === "s", len = ((horiz ? r.h : r.w) / sc) * 100, tan = Math.tan((r.dn * Math.PI) / 180), N = 200;
    let wf = 0, vol = 0;
    for (let i = 0; i < N; i++) {
      const d = ((i + 0.5) / N) * len, h = Math.min(hh, (r.kn || 0) + d * tan), w = h < 100 ? 0 : h < 200 ? 0.5 : 1;
      wf += w / N; vol += h / N;
    }
    return { gf, wf: gf * wf, vol: (gf * vol) / 100, hh, slope: true };
  }
  _grMassRow(r, P, row) {
    const m = this._grMass(P, r), f = (v) => `${num(v, 1)} m²`, kind = this.constructor.FLOOR_KINDS.find((k) => k[0] === (((P.floors || []).find((x) => x.id === r.fl) || {}).k));
    if (!r.hh && !r.dn && !kind) return "";
    return row("home", "Höhe", `${num(m.hh / 100, 2)} m`) + (m.slope ? row("home", "Grundfläche · Wohnfläche", `${f(m.gf)} · ${f(m.wf)}`) : "") + row("home", "Volumen", `${num(m.vol, 1)} m³`);
  }
  _grFloorKBox() {
    const ed = this._sfEd; if (!ed) return "";
    const fl = ed.plan.floors.find((f) => f.id === this._sfFl()) || ed.plan.floors[0]; if (!fl) return "";
    return `<div class="sffld"><label>Art der Etage</label><div class="gschips">${[["", "Ohne"], ...this.constructor.FLOOR_KINDS.map((k) => [k[0], k[1]])].map(([k, t]) => `<button class="gsch ${(fl.k || "") === k ? "sel" : ""}" data-act="grxfk" data-v="${k}" aria-pressed="${(fl.k || "") === k}">${t}</button>`).join("")}</div><div class="mut sm">Bestimmt die übliche Raumhöhe. Dachgeschoss: Schrägen am Raum einstellen.</div></div>`;
  }
  _grHeightBox() {
    const T = this._grFloorTargets ? this._grFloorTargets() : []; if (!T.length) return "";
    const b = (a, v, t, on) => `<button class="${on ? "on" : ""}" data-act="${a}" data-v="${v}" aria-pressed="${!!on}">${t}</button>`, one = (k) => { const s = new Set(T.map((r) => r[k] || 0)); return s.size === 1 ? [...s][0] : -1; };
    const hh = one("hh"), kn = one("kn"), dn = one("dn"), sd = new Set(T.map((r) => r.sd || "")).size === 1 ? T[0].sd || "" : "-";
    const P = this._sfEd.plan, ms = T.length === 1 ? this._grMass(P, T[0]) : null, f = (v) => num(v, 1);
    return `<div class="grpsec"><b>Höhe und Dachschräge${T.length > 1 ? ` · ${T.length} Räume` : ""}</b>
      <div class="mut sm" style="margin:6px 0 4px">Raumhöhe</div><div class="grseg">${b("grxhh", 0, "Üblich", hh === 0)}${[220, 240, 250, 260, 280, 300].map((v) => b("grxhh", v, `${num(v / 100, 2)} m`, hh === v)).join("")}</div>
      <div class="mut sm" style="margin:8px 0 4px">Dachschräge: niedrige Kante</div><div class="grseg">${b("grxsd", "", "Keine", sd === "")}${[["n", "oben"], ["s", "unten"], ["w", "links"], ["o", "rechts"]].map(([k, t]) => b("grxsd", k, t, sd === k)).join("")}</div>
      ${sd !== "" && sd !== "-" ? `<div class="mut sm" style="margin:8px 0 4px">Kniestock (Höhe an der niedrigen Kante)</div><div class="grseg">${[0, 50, 80, 100, 120, 150].map((v) => b("grxkn", v, `${num(v / 100, 2)} m`, kn === v)).join("")}</div>
      <div class="mut sm" style="margin:8px 0 4px">Neigung</div><div class="grseg">${[25, 30, 35, 40, 45, 50].map((v) => b("grxdn", v, `${v}°`, dn === v)).join("")}</div>` : ""}
      ${T.length === 1 && this._grBedarf && !T[0].ds ? (() => { const B = this._grBedarf(P, T[0]); return `<div class="mut sm" style="margin-top:8px">Heizbedarf (Schätzung): <b>${B.stufe}</b> · ${B.seiten} Außenwand${B.seiten === 1 ? "" : "wände"} (${f(B.aw)} m) · Fenster ${num(B.fenster, 1)} m²</div>`; })() : ""}
      ${ms && ms.slope ? `<div class="mut sm" style="margin-top:8px">Grundfläche ${f(ms.gf)} m² · <b>Wohnfläche ${f(ms.wf)} m²</b> · Volumen ${f(ms.vol)} m³</div>` : ""}</div>`;
  }
  _grMassAct(a, b) {
    const v = b.dataset.v;
    if (a === "grxfk") { const ed = this._sfEd; if (!ed) return true; const fl = ed.plan.floors.find((f) => f.id === this._sfFl()) || ed.plan.floors[0]; if (!fl) return true; this._sfSnap(); if (v) fl.k = v; else delete fl.k; this._render(); return true; }
    if (!["grxhh", "grxsd", "grxkn", "grxdn"].includes(a)) return false;
    const T = this._grFloorTargets(); if (!T.length) return true;
    this._sfSnap();
    T.forEach((r) => {
      if (a === "grxhh") { if (Number(v)) r.hh = Number(v); else { delete r.hh; delete r.sd; delete r.dn; delete r.kn; } }
      else if (a === "grxsd") { if (v) { r.sd = v; if (!r.hh) r.hh = this._grMass(this._sfEd.plan, r).hh; r.dn = r.dn || 35; r.kn = r.kn != null ? r.kn : 100; } else { delete r.sd; delete r.dn; delete r.kn; } }
      else if (r.sd) { r[a === "grxkn" ? "kn" : "dn"] = Number(v); }
    });
    this._render(); return true;
  }
