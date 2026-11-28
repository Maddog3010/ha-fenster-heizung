  /* ================= Modul 0 · v0.17: Werkzeugleiste im Plan (Dock) =================
     Im Vollbild-Baukasten liegt die Werkzeugleiste als schmale Leiste mit Symbolen links im Plan, wie im Konzept (E1). Zusammengehörige Werkzeuge sind
     gruppiert: „Öffnungen“ (Tür, Durchgang, Fenster) und „Technik“ (Technik, Gerät, Markise). Ein Tipp auf die Gruppe zeigt die Auswahl daneben. */
  _grDock(tl, sf, li, PP) {
    const svg = (p) => `<svg viewBox="0 0 34 34" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
    const T = {
      select: ["Wählen", PP.select], r: ["Raum", PP.r], w: ["Wand", PP.w], d: ["Tür", PP.d], dg: ["Durchgang", '<path d="M5 10h7M22 10h7M5 24h7M22 24h7M12 7v6M22 7v6M12 21v6M22 21v6"/>'], f: ["Fenster", PP.f], s: ["Treppe", PP.s],
      o: ["Möbel", '<rect x="6" y="12" width="22" height="12" rx="3"/><path d="M6 16h22M9 24v3M25 24v3M9 12V9h16v3"/>'], h: ["Technik", '<rect x="7" y="7" width="20" height="20" rx="4"/><path d="M13 13v3M21 13v3M13 21h8"/>'],
      "g:heizer": ["Gerät", '<rect x="8" y="9" width="18" height="17" rx="4"/><path d="M13 13v9M17 13v9M21 13v9"/><path d="M12 6c-1.5 1.5 1.5 2 0 3.5M17 6c-1.5 1.5 1.5 2 0 3.5M22 6c-1.5 1.5 1.5 2 0 3.5"/>'],
      a: ["Markise", '<path d="M5 10h24"/><path d="M6 10l3 12h16l3-12" stroke-dasharray="3 2"/><path d="M9 22h16"/>'], "m:smoke": ["Melder", PP.smoke],
      l: ["Lampe", '<path d="M12 22a7 7 0 1 1 10 0c-1 1-1.5 2-1.5 3.5h-7c0-1.5-.5-2.5-1.5-3.5z"/><path d="M14 29h6"/>'], x: ["Text", PP.x]
    };
    const grp = { op: ["d", "dg", "f"], te: ["h", "g:heizer", "a"] }, mem = (this._grGrp = this._grGrp || { op: "d", te: "h" });
    const norm = (t) => (String(t).startsWith("g:") ? "g:heizer" : String(t).startsWith("m:") ? "m:smoke" : t);
    const cur = norm(tl);
    Object.keys(grp).forEach((g) => { if (grp[g].includes(cur)) mem[g] = cur; });
    if (this._grFlyT !== tl) { this._grFlyT = tl; this._grFly = ""; }
    const one = (k) => `<button class="grdb${cur === k ? " on" : ""}" data-act="sfxtool" data-k="${k === "m:smoke" && String(tl).startsWith("m:") ? tl : k === "g:heizer" && String(tl).startsWith("g:") ? tl : k}" aria-pressed="${cur === k}" title="${T[k][0]}">${svg(T[k][1])}<span>${T[k][0]}</span></button>`;
    const group = (g, label) => {
      const on = grp[g].includes(cur), shown = on ? cur : mem[g], open = this._grFly === g;
      return `<div class="grdg"><button class="grdb${on ? " on" : ""}" data-act="grxfly" data-v="${g}" aria-expanded="${open}" title="${label}">${svg(T[shown][1])}<span>${label}</span><i class="grdc"></i></button>${open ? `<div class="grfly" role="menu">${grp[g].map((k) => `<button class="${cur === k ? "on" : ""}" data-act="sfxtool" data-k="${k}">${svg(T[k][1])}${T[k][0]}</button>`).join("")}</div>` : ""}</div>`;
    };
    return `<div class="grdock">${one("select")}${one("r")}${one("w")}${group("op", "Öffnungen")}${one("s")}<i></i>${one("o")}${group("te", "Technik")}${sf ? one("m:smoke") : ""}${li ? one("l") : ""}${one("x")}</div>`;
  }
