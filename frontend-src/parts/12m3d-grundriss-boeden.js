  /* ================= Modul 0 · v0.16 A4: Bodenbelag je Raum =================
     Jeder Raum kann einen eigenen Belag (Holz, Parkett hell/dunkel, Fliese groß/klein, Naturstein, Teppich, Vinyl, Pflaster, Rasen) und eine
     Verlegerichtung (0°, 45°, 90°) haben. Ohne Angabe bleibt es wie bisher (Belag nach dem Raumnamen). Die Muster liegen im Koordinatensystem des
     Plans: Räume mit gleichem Belag und gleicher Richtung sind automatisch „durchgehend verlegt“, das Muster läuft über die Tür ohne Versatz weiter. */
  static FLOOR_MATS = [["holz", "Holz"], ["parkett_hell", "Parkett hell"], ["parkett_dunkel", "Parkett dunkel"], ["fliese", "Fliese"], ["fliese_gross", "Fliese groß"], ["fliese_klein", "Fliese klein"], ["naturstein", "Naturstein"], ["teppich", "Teppich"], ["vinyl", "Vinyl"], ["pflaster", "Pflaster"], ["rasen", "Rasen"]];
  /* Muster-Name für einen Raum; legt bei Bedarf den Eintrag in FM an. Ohne eigenen Belag der bisherige Name (k0). */
  _grFmKey(r, k0, FM) {
    if (!r || !r.fm || !this.constructor.FLOOR_MATS.some((m) => m[0] === r.fm)) return k0;
    const deg = r.fd === 45 || r.fd === 90 ? r.fd : 0, key = `fm_${r.fm}_${deg}`;
    FM[key] = { m: r.fm, d: deg };
    return key;
  }
  _grFmPats(u, FM, T, o) {
    const ks = Object.keys(FM); if (!ks.length) return "";
    const F = T.fl, hell = o.style === "hell", blue = o.style === "bauplan";
    const col = { parkett_hell: [["#8a6f4a", "#6d563a"], ["#e6cf9f", "#c9ab72"]], parkett_dunkel: [["#4a3426", "#2f2118"], ["#9b7b5f", "#7a5c42"]], naturstein: [["#5d636d", "#454a53"], ["#d3d6db", "#aeb3bb"]], vinyl: [["#59606b", "#444a54"], ["#e5e7eb", "#c4c8cf"]], rasen: [["#2f6a3f", "#3f8a52"], ["#a7d9a0", "#7fbf7a"]] };
    const C = (m, fb) => (blue ? [F.fliese[0], F.fliese[1]] : col[m] ? col[m][hell ? 1 : 0] : fb);
    return ks.map((key) => {
      const { m, d } = FM[key], tf = d ? ` patternTransform="rotate(${d})"` : "", id = `${u}${key}`;
      let w = 96, h = 32, body = "";
      if (m === "holz" || m === "parkett_hell" || m === "parkett_dunkel") {
        const [bg, ln] = m === "holz" ? (blue ? C(m) : [F.holz[0], F.holz[1]]) : C(m);
        body = `<rect width="96" height="32" fill="${bg}"/><path d="M0 0.5H96M0 16.5H96M0.5 0V16M48.5 16V32" stroke="${ln}" stroke-width="1"/>`;
      } else if (m === "fliese" || m === "fliese_gross" || m === "fliese_klein") {
        const z = m === "fliese" ? 24 : m === "fliese_gross" ? 32 : 12; w = h = z;
        body = `<rect width="${z}" height="${z}" fill="${F.fliese[0]}"/><path d="M0 0.5H${z}M0.5 0V${z}" stroke="${F.fliese[1]}" stroke-width="1.2"/>`;
      } else if (m === "naturstein") {
        const [bg, ln] = C(m); w = 64; h = 42;
        body = `<rect width="64" height="42" fill="${bg}"/><path d="M0 14.5H64M0 28.5H64M20.5 0V14M44.5 14V28M10.5 28V42M50.5 28V42" stroke="${ln}" stroke-width="1.2"/>`;
      } else if (m === "vinyl") {
        const [bg, ln] = C(m); w = 120; h = 40;
        body = `<rect width="120" height="40" fill="${bg}"/><path d="M0 0.5H120M0 20.5H120M0.5 0V20M60.5 20V40" stroke="${ln}" stroke-width="1"/>`;
      } else if (m === "teppich") {
        w = h = 10; body = `<rect width="10" height="10" fill="${F.teppich[0]}"/><circle cx="5" cy="5" r="1" fill="${F.teppich[1]}"/>`;
      } else if (m === "pflaster") {
        w = 40; h = 20; body = `<rect width="40" height="20" fill="${F.aussen[0]}"/><path d="M0 0.5H40M0 10.5H40M20.5 0V10M0.5 10V20M40 10V20" stroke="${F.aussen[1]}" stroke-width="1.4"/>`;
      } else {   /* rasen */
        const [bg, ln] = C(m); w = h = 16;
        body = `<rect width="16" height="16" fill="${bg}"/><path d="M3 5l1.5-3M10 12l1.5-3M13 4l1-2.5M6 14l1-2.5" stroke="${ln}" stroke-width="1" stroke-linecap="round"/>`;
      }
      return `<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse"${tf}>${body}</pattern>`;
    }).join("\n      ");
  }
  /* Eigenschaften im Baukasten: Belag und Richtung für den gewählten Raum – bei Mehrfachauswahl für alle ausgewählten Räume */
  _grFloorTargets() { const ed = this._sfEd; if (!ed) return []; const ids = new Set([...(ed.multi || []), ed.sel].filter(Boolean)); return ed.plan.items.filter((i) => i.t === "r" && ids.has(i.id)); }
  _grFloorBox() {
    const T = this._grFloorTargets(); if (!T.length) return "";
    const mats = this.constructor.FLOOR_MATS, cur = new Set(T.map((r) => r.fm || "")), curD = new Set(T.map((r) => r.fd || 0)), one = cur.size === 1 ? [...cur][0] : null;
    const b = (a, v, t, on) => `<button class="${on ? "on" : ""}" data-act="${a}" data-v="${v}" aria-pressed="${!!on}">${t}</button>`;
    return `<div class="grpsec"><b>Boden${T.length > 1 ? ` · ${T.length} Räume` : ""}</b>
      <div class="grseg">${b("grxfm", "", "Standard", one === "")}${mats.map(([k, t]) => b("grxfm", k, t, one === k)).join("")}</div>
      <div class="mut sm" style="margin:8px 0 4px">Verlegerichtung${[...cur].every((x) => !x) ? " (erst einen Belag wählen)" : ""}</div>
      <div class="grseg">${[0, 45, 90].map((dg) => b("grxfd", dg, `${dg}°`, curD.size === 1 && curD.has(dg))).join("")}</div>
      <div class="mut sm" style="margin-top:8px">Räume mit gleichem Belag und gleicher Richtung sind durchgehend verlegt. Mehrere Räume wählst du mit „Mehrfachauswahl“.</div></div>`;
  }
  _grFloorAct(a, b) {
    if (a !== "grxfm" && a !== "grxfd") return false;
    const T = this._grFloorTargets(); if (!T.length) return true;
    this._sfSnap(); const v = b.dataset.v;
    T.forEach((r) => { if (a === "grxfm") { if (v) r.fm = v; else { delete r.fm; delete r.fd; } } else if (r.fm) { if (Number(v)) r.fd = Number(v); else delete r.fd; } });
    this._render(); return true;
  }
  /* v0.16 B7: Verlauf zeigt, was sich geändert hat („+2 Räume · 1 Tür geändert · −1 Fenster“) */
  _grChgTxt(c) {
    if (!c) return "";
    const N = { floor: ["Etage", "Etagen"], r: ["Raum", "Räume"], w: ["Wand", "Wände"], d: ["Tür", "Türen"], f: ["Fenster", "Fenster"], o: ["Gegenstand", "Gegenstände"], h: ["Heizkörper", "Heizkörper"], m: ["Melder", "Melder"] };
    const nm = (t, n) => { const x = N[t] || ["Element", "Elemente"]; return n === 1 ? x[0] : x[1]; };
    const parts = [];
    [["add", "+", ""], ["mod", "", " geändert"], ["del", "−", ""]].forEach(([k, sg, suf]) => Object.entries(c[k] || {}).forEach(([t, n]) => parts.push(`<span class="chg ${k}">${sg}${n} ${nm(t, n)}${suf}</span>`)));
    return parts.length ? `<span class="chgs" style="display:block;font-size:12px;margin:2px 0">${parts.join(" · ")}</span>` : `<span class="mut sm" style="display:block">keine Änderung am Plan</span>`;
  }
