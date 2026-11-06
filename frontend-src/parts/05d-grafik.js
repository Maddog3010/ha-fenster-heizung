  /* ================= Gemeinsame Grafik-Bibliothek (HD-Symbolsatz) =================
     Ein Symbolsatz für Modul 1, 3, 4 und 19 (Konzepte „Neue Optik“). Alle Symbole im Raster 64 × 64,
     Licht von oben links, weiche Verläufe, Glanzkante und Bodenschatten. Gleiche Farben in hell und dunkel,
     nur Schatten und Rand passen sich über CSS-Variablen an (--gx-sh, --gx-rim).
     Aufruf:  this._gx("washer", 48)                  Symbol als <svg>
              this._gx("battery", 48, { lvl: 35 })    Zustände: on (aktiv/läuft), lvl (0–100), t (Text im Display)
              this._gxRing("washer", { pv: .6, bat: .25, net: .15 }, 72)   Herkunfts-Ring am Bild (Modul 4/19)
              this._gxPct({ pv: .6, bat: .25, net: .15 })                   Prozentzeile unter dem Bild (Modul 4)
              this._gxRest(runs, minuten)             „noch ~ Min.“ erst ab 3 gelernten Läufen (Modul 4)
              this._gxAlt("waschmaschine")            alter Bildname (Modul 19, Modul 4, Raumsymbole) → neues Symbol
     Schalter: Neue Optik „wie bisher“ (classic) und Modul 19 „Alte Symbole behalten“ (keep19) liest _gxCfg(). */
  _gxCfg() { return this._gxSet || { classic: false, keep19: false }; }
  _gxLib() {
    const K = this.constructor;
    if (K._GX) return K._GX;
    const st = (s) => s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ""}/>`).join("");
    const lg = (id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${st(s)}</linearGradient>`;
    const rg = (id, s, cx = .35, cy = .3, r = .85) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${st(s)}</radialGradient>`;
    const sh = (rx = 21, cy = 58.5) => `<ellipse cx="32" cy="${cy}" rx="${rx}" ry="3.2" fill="var(--gx-sh,#000)" opacity=".22"/>`;
    const gl = (d) => `<path d="${d}" fill="#fff" opacity=".32"/>`;
    /* Wiederkehrende Materialien */
    const M = {
      white: [[0, "#ffffff"], [.55, "#eef2f6"], [1, "#c9d3de"]],
      steel: [[0, "#f1f5f9"], [.5, "#cbd5e1"], [1, "#8a99ab"]],
      dark: [[0, "#4b5563"], [.5, "#2b333d"], [1, "#151a20"]],
      glass: [[0, "#bae6fd"], [.5, "#38bdf8"], [1, "#0369a1"]],
      water: [[0, "#7dd3fc"], [1, "#0284c7"]],
      pv: [[0, "#3b5bdb"], [.6, "#1e3a8a"], [1, "#0f1f4d"]],
      gold: [[0, "#fff3b0"], [.45, "#fbbf24"], [1, "#b45309"]],
      fire: [[0, "#fde047"], [.45, "#fb923c"], [1, "#dc2626"]],
      green: [[0, "#86efac"], [.5, "#22c55e"], [1, "#15803d"]],
      teal: [[0, "#5eead4"], [.5, "#14b8a6"], [1, "#0f766e"]],
      red: [[0, "#fca5a5"], [.5, "#ef4444"], [1, "#991b1b"]],
      wood: [[0, "#e0a96d"], [1, "#8a5a2b"]],
    };
    /* Gerätegehäuse (Waschmaschine, Trockner, Spülmaschine): Körper, Bedienleiste, Glanz */
    const body = (q, x = 14, y = 6, w = 36, h = 50) => lg(q("b"), M.white, 0, 0, 1, 1) + sh(19) +
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="url(#${q("b")})" stroke="var(--gx-rim,#94a3b8)" stroke-opacity=".55"/>` +
      `<rect x="${x}" y="${y}" width="${w}" height="10" rx="6" fill="#e2e8f0"/><rect x="${x}" y="${y + 9}" width="${w}" height="1.2" fill="#94a3b8" opacity=".6"/>` +
      gl(`M${x + 3} ${y + 12} h4 v${h - 16} a3 3 0 0 1 -4 -3z`);
    const L = {
      /* ---------- Heizen & Raum (Modul 1) ---------- */
      thermostat: { n: "Thermostat", g: 1, f: (q, o) => lg(q("r"), M.steel, 0, 0, 1, 1) + lg(q("d"), [[0, "#0f2a2e"], [1, "#071417"]]) + lg(q("v"), M.gold) + sh(16) +
        `<rect x="27" y="47" width="10" height="10" rx="2" fill="url(#${q("v")})"/>` +
        (o.on ? `<circle cx="32" cy="27" r="25" fill="#fb923c" opacity=".22"/>` : "") +
        `<circle cx="32" cy="27" r="21" fill="url(#${q("r")})"/><circle cx="32" cy="27" r="16.5" fill="#f8fafc"/>` +
        `<rect x="21" y="20" width="22" height="14" rx="4" fill="url(#${q("d")})"/>` +
        `<text x="32" y="31" text-anchor="middle" font-size="9.5" font-weight="700" font-family="system-ui,sans-serif" fill="${o.on ? "#fdba74" : "#5eead4"}">${o.t || "21°"}</text>` +
        `<path d="M32 8 a19 19 0 0 1 17 10.5" fill="none" stroke="${o.on ? "#f97316" : "#94a3b8"}" stroke-width="2.6" stroke-linecap="round" opacity=".85"/>` +
        gl("M16 20 a17 17 0 0 1 12 -11 a15 15 0 0 0 -9 14z") },
      radiator: { n: "Heizkörper", g: 1, f: (q, o) => { const on = o.on !== false;
        return lg(q("p"), on ? [[0, "#fed7aa"], [.5, "#fb923c"], [1, "#c2410c"]] : M.white, 0, 0, 1, 0) + lg(q("h"), [[0, "#f97316", 0], [1, "#f97316", .95]], 0, 1, 0, 0) + sh(22) +
        (on ? [20, 32, 44].map((x) => `<path d="M${x} 13 q-3 -3 0 -6 q3 -3 0 -6" fill="none" stroke="url(#${q("h")})" stroke-width="2.8" stroke-linecap="round"/>`).join("") : "") +
        `<rect x="8" y="16" width="48" height="5" rx="2.5" fill="${on ? "#ea580c" : "#cbd5e1"}"/><rect x="8" y="49" width="48" height="5" rx="2.5" fill="${on ? "#9a3412" : "#94a3b8"}"/>` +
        [10, 19.5, 29, 38.5, 48].map((x) => `<rect x="${x}" y="17" width="7" height="36" rx="3.5" fill="url(#${q("p")})"/><rect x="${x + 1.4}" y="20" width="1.6" height="30" rx=".8" fill="#fff" opacity="${on ? .45 : .9}"/>`).join("") +
        `<circle cx="55" cy="51" r="4" fill="${on ? "#fbbf24" : "#64748b"}" stroke="#fff" stroke-width="1.4"/>`; } },
      window: { n: "Fenster zu", g: 1, f: (q) => lg(q("f"), M.white, 0, 0, 1, 1) + lg(q("g"), [[0, "#e0f2fe"], [.4, "#7dd3fc"], [1, "#0ea5e9"]], 0, 0, .6, 1) + sh(22) +
        `<rect x="10" y="5" width="44" height="49" rx="4" fill="url(#${q("f")})" stroke="var(--gx-rim,#94a3b8)" stroke-opacity=".55"/>` +
        [[14, 9], [33.5, 9], [14, 31], [33.5, 31]].map(([x, y]) => `<rect x="${x}" y="${y}" width="16.5" height="19" rx="2" fill="url(#${q("g")})"/>` + gl(`M${x} ${y + 2} q0 -2 2 -2 h7 l-9 11z`)).join("") +
        `<rect x="7" y="54" width="50" height="4" rx="2" fill="#cbd5e1"/><rect x="49" y="28" width="2.4" height="7" rx="1.2" fill="#64748b"/>` },
      windowOpen: { n: "Fenster offen", g: 1, f: (q) => lg(q("f"), M.white, 0, 0, 1, 1) + lg(q("g"), [[0, "#e0f2fe"], [.4, "#7dd3fc"], [1, "#0ea5e9"]], 0, 0, .6, 1) + lg(q("s"), [[0, "#bae6fd"], [1, "#38bdf8"]], 0, 0, 1, 0) + sh(22) +
        `<rect x="8" y="5" width="30" height="49" rx="4" fill="url(#${q("f")})" stroke="var(--gx-rim,#94a3b8)" stroke-opacity=".55"/>` +
        `<rect x="12" y="9" width="22" height="41" rx="2" fill="#0b2536" opacity=".85"/>` +
        `<path d="M38 7 L56 12 V48 L38 53z" fill="url(#${q("f")})" stroke="#94a3b8" stroke-opacity=".7"/><path d="M41 12 L53 15.5 V44.5 L41 48z" fill="url(#${q("s")})"/>` + gl("M41 12 L46 13.4 L41 24z") +
        `<path d="M15 22 q6 -4 11 0 t11 0 M15 31 q6 -4 11 0 t11 0 M15 40 q6 -4 11 0" fill="none" stroke="#5eead4" stroke-width="2.4" stroke-linecap="round"/>` +
        `<rect x="5" y="54" width="54" height="4" rx="2" fill="#cbd5e1"/>` },
      flame: { n: "Heizen", g: 1, f: (q, o) => rg(q("a"), [[0, "#fb923c", .55], [1, "#fb923c", 0]], .5, .6, .5) + lg(q("o"), M.fire, 0, 0, 0, 1) + lg(q("i"), [[0, "#fffbeb"], [1, "#fde047"]]) + sh(13) +
        (o.on !== false ? `<circle cx="32" cy="36" r="26" fill="url(#${q("a")})"/>` : "") +
        `<path d="M32 4 C40 15 50 22 50 37 a18 18 0 0 1 -36 0 C14 28 19 22 23 17 C24 24 27 26 29 25 C27 17 29 10 32 4z" fill="url(#${q("o")})"/>` +
        `<path d="M32 28 C37 33 41 37 41 43 a9 9 0 0 1 -18 0 C23 38 27 35 28 32 C29 35 31 35 32 34 C31 32 31 30 32 28z" fill="url(#${q("i")})"/>` + gl("M22 26 C19 31 18 36 20 42 C17 36 18 30 22 26z") },
      frost: { n: "Frostschutz", g: 1, f: (q) => rg(q("b"), [[0, "#e0f2fe"], [1, "#7dd3fc", .25]], .5, .5, .55) + lg(q("s"), [[0, "#e0f2fe"], [1, "#38bdf8"]], 0, 0, 1, 1) +
        `<circle cx="32" cy="31" r="26" fill="url(#${q("b")})"/>` +
        [0, 60, 120].map((a) => `<g transform="rotate(${a} 32 31)"><path d="M32 8 V54 M26 12 L32 18 L38 12 M26 50 L32 44 L38 50 M27.5 21 L32 25 L36.5 21 M27.5 41 L32 37 L36.5 41" fill="none" stroke="url(#${q("s")})" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></g>`).join("") +
        `<path d="M32 24.5 L37.6 27.75 V34.25 L32 37.5 L26.4 34.25 V27.75z" fill="#fff" stroke="#38bdf8" stroke-width="1.6"/>` },
      eco: { n: "Absenkung", g: 1, f: (q) => lg(q("l"), M.green, 0, 0, 1, 1) + sh(15) +
        `<path d="M12 50 C10 26 26 9 54 8 C55 34 40 52 16 51z" fill="url(#${q("l")})"/>` +
        `<path d="M14 51 C24 40 33 31 46 18 M24 41 l-1 -8 M31 34 l9 1 M36 28 l-1 -7" fill="none" stroke="#dcfce7" stroke-width="2" stroke-linecap="round" opacity=".85"/>` + gl("M16 44 C16 28 27 15 46 11 C30 18 21 29 16 44z") },
      schedule: { n: "Heizplan", g: 1, f: (q) => lg(q("r"), M.teal, 0, 0, 1, 1) + lg(q("w"), M.white, 0, 0, 1, 1) + sh(18) +
        `<circle cx="32" cy="31" r="24" fill="url(#${q("r")})"/><circle cx="32" cy="31" r="19.5" fill="url(#${q("w")})"/>` +
        Array.from({ length: 12 }, (_, i) => `<rect x="31.2" y="13.5" width="1.6" height="${i % 3 ? 2.5 : 4}" rx=".8" fill="#64748b" transform="rotate(${i * 30} 32 31)"/>`).join("") +
        `<path d="M32 31 V19.5 M32 31 L40.5 35.5" stroke="#0f172a" stroke-width="2.8" stroke-linecap="round"/><circle cx="32" cy="31" r="2.4" fill="#f97316"/>` + gl("M13 24 a20 20 0 0 1 13 -14 a18 18 0 0 0 -9 16z") },
      person: { n: "Anwesend", g: 1, f: (q) => lg(q("c"), M.teal, 0, 0, 1, 1) + lg(q("s"), [[0, "#fde7cf"], [1, "#e6b18a"]]) + lg(q("t"), [[0, "#334155"], [1, "#0f172a"]]) +
        `<circle cx="32" cy="32" r="26" fill="url(#${q("c")})"/><clipPath id="${q("k")}"><circle cx="32" cy="32" r="26"/></clipPath>` +
        `<g clip-path="url(#${q("k")})"><path d="M10 62 C11 46 20 40 32 40 S53 46 54 62z" fill="url(#${q("t")})"/><path d="M27 38 h10 v5 a5 5 0 0 1 -10 0z" fill="url(#${q("s")})"/></g>` +
        `<circle cx="32" cy="26" r="10.5" fill="url(#${q("s")})"/><path d="M21.5 25 C21 16 27 13.5 32 13.5 S43.5 16 42.5 25 C40 20 35 19 32 21 C29 19 24 20 21.5 25z" fill="#5b3a1f"/>` + gl("M10 26 a22 22 0 0 1 14 -18 a20 20 0 0 0 -11 20z") },
      vacation: { n: "Urlaub", g: 1, f: (q) => lg(q("c"), [[0, "#fdba74"], [.5, "#f97316"], [1, "#c2410c"]], 0, 0, 1, 1) + sh(20) +
        `<path d="M24 16 V10 a3 3 0 0 1 3 -3 h10 a3 3 0 0 1 3 3 v6" fill="none" stroke="#7c2d12" stroke-width="3.4"/>` +
        `<rect x="9" y="16" width="46" height="38" rx="7" fill="url(#${q("c")})"/><rect x="18" y="16" width="5" height="38" fill="#9a3412"/><rect x="41" y="16" width="5" height="38" fill="#9a3412"/>` +
        `<circle cx="32" cy="31" r="5" fill="#fde047"/><path d="M26 42 h12" stroke="#fff7ed" stroke-width="2.4" stroke-linecap="round"/>` + gl("M12 22 a5 5 0 0 1 5 -4 h2 v34 h-2 a5 5 0 0 1 -5 -5z") +
        `<rect x="14" y="54" width="6" height="3.5" rx="1.5" fill="#431407"/><rect x="44" y="54" width="6" height="3.5" rx="1.5" fill="#431407"/>` },
      humidity: { n: "Luftfeuchte", g: 1, f: (q) => lg(q("d"), [[0, "#bae6fd"], [.5, "#38bdf8"], [1, "#0369a1"]], 0, 0, 1, 1) + sh(15) +
        `<path d="M32 4 C41 16 50 26 50 37 a18 18 0 0 1 -36 0 C14 26 23 16 32 4z" fill="url(#${q("d")})"/>` +
        `<text x="32" y="44" text-anchor="middle" font-size="15" font-weight="800" font-family="system-ui,sans-serif" fill="#fff">%</text>` + gl("M21 28 C19 33 19 38 21 43 C16 38 17 32 21 28z") },
      dehumid: { n: "Luftentfeuchter", g: 1, f: (q, o) => lg(q("b"), M.white, 0, 0, 1, 1) + lg(q("w"), M.water) + sh(16) +
        `<rect x="15" y="5" width="34" height="51" rx="7" fill="url(#${q("b")})" stroke="var(--gx-rim,#94a3b8)" stroke-opacity=".55"/>` +
        [11, 15, 19].map((y) => `<rect x="21" y="${y}" width="22" height="2" rx="1" fill="#94a3b8"/>`).join("") +
        `<rect x="20" y="30" width="24" height="20" rx="3.5" fill="#dbeafe" stroke="#93c5fd"/><path d="M20.5 ${50 - (o.lvl != null ? o.lvl : 45) * .19} h23 V46.5 a3 3 0 0 1 -3 3 h-17 a3 3 0 0 1 -3 -3z" fill="url(#${q("w")})"/>` +
        `<circle cx="40" cy="25" r="1.8" fill="${o.on ? "#22c55e" : "#94a3b8"}"/>` + gl("M18 10 a4 4 0 0 1 3 -3 v46 a4 4 0 0 1 -3 -3z") +
        `<path d="M52 30 C56 36 58 39 58 42 a6 6 0 0 1 -12 0 C46 39 48 36 52 30z" fill="url(#${q("w")})" stroke="#fff" stroke-width="1.2"/>` },
      thermo: { n: "Messraum", g: 1, f: (q) => lg(q("g"), [[0, "#ffffff"], [1, "#dbe4ee"]], 0, 0, 1, 0) + lg(q("m"), [[0, "#fca5a5"], [1, "#dc2626"]], 0, 0, 1, 0) + sh(12) +
        `<rect x="25" y="4" width="14" height="40" rx="7" fill="url(#${q("g")})" stroke="#94a3b8"/><circle cx="32" cy="47" r="10" fill="url(#${q("g")})" stroke="#94a3b8"/>` +
        `<rect x="29.5" y="20" width="5" height="26" rx="2.5" fill="url(#${q("m")})"/><circle cx="32" cy="47" r="6.5" fill="url(#${q("m")})"/>` +
        [12, 18, 24, 30].map((y) => `<rect x="40" y="${y}" width="${y % 12 ? 4 : 6}" height="1.6" rx=".8" fill="#64748b"/>`).join("") + gl("M27 9 a5 5 0 0 1 3 -3 v34 h-3z") },
      presence: { n: "Präsenzmelder", g: 1, f: (q, o) => lg(q("d"), M.white, 0, 0, 0, 1) +
        `<rect x="10" y="5" width="44" height="4" rx="2" fill="#cbd5e1"/><path d="M18 9 h28 a14 14 0 0 1 -28 0z" fill="url(#${q("d")})" stroke="#94a3b8" stroke-opacity=".6"/>` +
        `<circle cx="32" cy="16" r="3" fill="${o.on !== false ? "#14b8a6" : "#64748b"}"/>` +
        [[30, 1], [39, .7], [48, .45]].map(([r, a]) => `<path d="M${32 - r * .62} ${9 + r * .78} a${r} ${r} 0 0 0 ${r * 1.24} 0" fill="none" stroke="#14b8a6" stroke-width="3" stroke-linecap="round" opacity="${o.on !== false ? a : .25}" transform="translate(0 ${r * .12})"/>`).join("") },
      heater: { n: "Elektroheizer", g: 1, f: (q, o) => { const st = Math.max(0, Math.min(3, o.stage != null ? o.stage : (o.on === false ? 0 : 2)));
        return lg(q("b"), M.steel, 0, 0, 1, 1) + lg(q("d"), [[0, "#1e293b"], [1, "#0f172a"]]) + sh(20) +
        `<rect x="9" y="12" width="46" height="38" rx="8" fill="url(#${q("b")})" stroke="var(--gx-rim,#94a3b8)" stroke-opacity=".55"/>` +
        `<rect x="14" y="17" width="36" height="13" rx="3.5" fill="url(#${q("d")})"/>` +
        [0, 1, 2].map((i) => `<rect x="${17 + i * 10.5}" y="19.5" width="8" height="8" rx="2" fill="${i < st ? "#fb923c" : "#334155"}"/>`).join("") +
        `<text x="32" y="44" text-anchor="middle" font-size="10" font-weight="800" font-family="system-ui,sans-serif" fill="#334155">${o.t || (st ? "H" + st : "aus")}</text>` +
        `<rect x="14" y="50" width="6" height="5" rx="1.5" fill="#64748b"/><rect x="44" y="50" width="6" height="5" rx="1.5" fill="#64748b"/>` +
        (st ? `<circle cx="53" cy="12" r="7" fill="#f59e0b" stroke="#fff" stroke-width="1.6"/><path d="M54 7.5 L50.5 12.6 H53 L52 16.5 L55.6 11.3 H53z" fill="#fff"/>` : "") + gl("M12 16 a5 5 0 0 1 4 -3 v34 a5 5 0 0 1 -4 -3z"); } },
      /* ---------- Energie (Modul 3 und 19) ---------- */
      sun: { n: "Sonne", g: 2, f: (q) => rg(q("c"), [[0, "#fffbeb"], [.35, "#fde047"], [1, "#f59e0b"]], .4, .35, .75) + lg(q("r"), [[0, "#fbbf24"], [1, "#f97316"]]) + rg(q("a"), [[0, "#fde047", .45], [1, "#fde047", 0]], .5, .5, .5) +
        `<circle cx="32" cy="31" r="29" fill="url(#${q("a")})"/>` +
        Array.from({ length: 12 }, (_, i) => `<path d="M32 2.5 L35 11 H29z" fill="url(#${q("r")})" transform="rotate(${i * 30} 32 31)"/>`).join("") +
        `<circle cx="32" cy="31" r="15" fill="url(#${q("c")})"/>` + gl("M21 25 a12 12 0 0 1 9 -8 a10 10 0 0 0 -6 10z") },
      pvRoof: { n: "Solar Dach", g: 2, f: (q) => lg(q("p"), [[0, "#60a5fa"], [.45, "#2563eb"], [1, "#1e3a8a"]], 0, 0, 1, 1) + rg(q("s"), M.gold, .4, .35, .8) + lg(q("m"), M.steel) + sh(18) +
        `<circle cx="49" cy="13" r="8.5" fill="url(#${q("s")})"/><circle cx="49" cy="13" r="11.5" fill="#fbbf24" opacity=".22"/>` +
        `<path d="M30 42 L28 54 M38 41 L40 54" stroke="url(#${q("m")})" stroke-width="3" stroke-linecap="round"/><rect x="20" y="52.5" width="28" height="3.4" rx="1.7" fill="#64748b"/>` +
        `<path d="M10 22 L52 18 L48 42 L6 46z" fill="url(#${q("p")})" stroke="#e0e7ff" stroke-width="1.2" stroke-linejoin="round"/>` +
        `<path d="M8.4 34.2 L49.8 30 M24 20.6 L20.2 44.6 M38 19.3 L34.2 43.3" stroke="#dbeafe" stroke-width="1.1" opacity=".85"/>` + gl("M10 22 L24 20.7 L13 33z") },
      balcony: { n: "Balkon", g: 2, f: (q) => lg(q("p"), [[0, "#60a5fa"], [.45, "#2563eb"], [1, "#1e3a8a"]], 0, 0, 1, 1) + lg(q("m"), M.steel) + rg(q("s"), M.gold, .4, .35, .8) + sh(24) +
        `<path d="M12 10 L52 10 L48 33 L16 33z" fill="url(#${q("p")})" stroke="#e0e7ff" stroke-width="1.1"/>` +
        `<path d="M22 10 L23.5 33 M32 10 V33 M42 10 L40.5 33 M14 21.5 H50" stroke="#dbeafe" stroke-width=".9" opacity=".85"/>` + gl("M12 10 H23 L15.5 23z") +
        `<circle cx="54" cy="8" r="5.5" fill="url(#${q("s")})"/>` +
        `<rect x="6" y="36" width="52" height="4" rx="2" fill="url(#${q("m")})"/><rect x="6" y="52" width="52" height="4" rx="2" fill="url(#${q("m")})"/>` +
        [9, 18, 27, 36, 45, 53].map((x) => `<rect x="${x}" y="40" width="2.4" height="12" fill="#94a3b8"/>`).join("") },
      battery: { n: "Akku", g: 2, f: (q, o) => { const v = Math.max(0, Math.min(100, o.lvl != null ? o.lvl : 72)); const c = v < 15 ? M.red : [[0, "#c4b5fd"], [.5, "#8b5cf6"], [1, "#5b21b6"]];
        return lg(q("b"), M.white, 0, 0, 1, 1) + lg(q("l"), c, 0, 0, 1, 0) + sh(15) +
        `<rect x="26" y="3" width="12" height="5" rx="2" fill="#94a3b8"/><rect x="17" y="6.5" width="30" height="50" rx="7" fill="url(#${q("b")})" stroke="var(--gx-rim,#94a3b8)" stroke-opacity=".55"/>` +
        `<rect x="21.5" y="12" width="21" height="39.5" rx="4" fill="#1e1b4b"/><rect x="23" y="${13.5 + 36.5 * (1 - v / 100)}" width="18" height="${36.5 * v / 100}" rx="2.8" fill="url(#${q("l")})"/>` +
        `<path d="M34 20 L27 32 H32 L30 42 L37 29 H32z" fill="#fff" opacity=".95"/>` + gl("M20 11 a4 4 0 0 1 3 -3 v46 a4 4 0 0 1 -3 -3z"); } },
      grid: { n: "Stromnetz", g: 2, f: (q) => lg(q("s"), [[0, "#94a3b8"], [1, "#475569"]]) + lg(q("b"), [[0, "#93c5fd"], [1, "#2563eb"]]) + sh(18) +
        `<path d="M30 4 L18 57 M30 4 L42 57 M22 40 L38 40 M24 30 L36 30 M26.5 19 L33.5 19 M22 40 L36 30 M38 40 L24 30 M24 30 L33.5 19 M36 30 L26.5 19 M18 57 L38 40 M42 57 L22 40" fill="none" stroke="url(#${q("s")})" stroke-width="2.4" stroke-linejoin="round"/>` +
        `<path d="M8 16 H52 M12 26 H48" stroke="#475569" stroke-width="3" stroke-linecap="round"/>` +
        [8, 52, 12, 48].map((x, i) => `<rect x="${x - 1.6}" y="${i < 2 ? 16 : 26}" width="3.2" height="5" rx="1" fill="#e2e8f0"/>`).join("") +
        `<path d="M56 24 L49 35 H54 L52 45 L60 32 H55z" fill="url(#${q("b")})"/>` },
      house: { n: "Haus", g: 2, f: (q, o) => lg(q("w"), [[0, "#5eead4"], [1, "#0d9488"]], 0, 0, 1, 1) + lg(q("r"), [[0, "#2dd4bf"], [1, "#0f766e"]], 0, 0, 1, 1) + lg(q("l"), [[0, "#fef9c3"], [1, "#fbbf24"]]) + sh(24) +
        `<rect x="12" y="29" width="40" height="27" fill="url(#${q("w")})"/><path d="M4 33 L32 7 L60 33 L55 35.5 L32 14.5 L9 35.5z" fill="url(#${q("r")})"/>` + gl("M32 7 L4 33 L9 35.5 L32 14.5z") +
        `<path d="M12 31 L32 13 L52 31 V34 L32 16 L12 34z" fill="#134e4a" opacity=".25"/>` +
        `<path d="M34 18 L28.5 27 H32 L30.5 33 L36 24.5 H32.5z" fill="url(#${q("l")})"/>` +
        `<rect x="27" y="40" width="10" height="16" rx="1.5" fill="#134e4a"/><circle cx="35" cy="48.5" r="1" fill="#fde68a"/>` +
        `<rect x="16" y="38" width="8" height="8" rx="1.5" fill="${o.on === false ? "#ccfbf1" : `url(#${q("l")})`}"/><rect x="40" y="38" width="8" height="8" rx="1.5" fill="${o.on === false ? "#ccfbf1" : `url(#${q("l")})`}"/>` },
      meter: { n: "Zähler", g: 2, f: (q) => lg(q("b"), M.white, 0, 0, 1, 1) + lg(q("d"), [[0, "#134e4a"], [1, "#042f2e"]]) + sh(18) +
        `<rect x="12" y="5" width="40" height="51" rx="6" fill="url(#${q("b")})" stroke="var(--gx-rim,#94a3b8)" stroke-opacity=".55"/>` +
        `<rect x="17" y="12" width="30" height="14" rx="3" fill="url(#${q("d")})"/><text x="32" y="22.5" text-anchor="middle" font-size="7.5" font-weight="700" letter-spacing=".4" font-family="ui-monospace,monospace" fill="#5eead4">04217</text>` +
        `<circle cx="22" cy="34" r="2" fill="#ef4444"/><text x="26" y="36.5" font-size="6" font-family="system-ui,sans-serif" fill="#64748b">kWh</text>` +
        `<rect x="17" y="42" width="30" height="9" rx="2" fill="#e2e8f0"/><rect x="20" y="45" width="24" height="3" rx="1.5" fill="#94a3b8"/>` },
      euro: { n: "Kosten", g: 2, f: (q) => lg(q("c"), [[0, "#fde68a"], [.5, "#f59e0b"], [1, "#b45309"]], 0, 0, 0, 1) + lg(q("e"), [[0, "#fff3b0"], [1, "#fbbf24"]]) + sh(18) +
        [44, 34, 24].map((y) => `<rect x="12" y="${y}" width="40" height="10" rx="5" fill="url(#${q("c")})"/><ellipse cx="32" cy="${y + 3.2}" rx="20" ry="3.2" fill="#fde68a" opacity=".55"/>`).join("") +
        `<ellipse cx="32" cy="18" rx="20" ry="7.5" fill="#d97706"/><ellipse cx="32" cy="16" rx="20" ry="7.5" fill="url(#${q("e")})"/>` +
        `<text x="32" y="20" text-anchor="middle" font-size="11" font-weight="800" font-family="system-ui,sans-serif" fill="#92400e">€</text>` },
      car: { n: "Auto", g: 2, f: (q, o) => lg(q("b"), M.teal, 0, 0, 0, 1) + lg(q("g"), [[0, "#e0f2fe"], [1, "#7dd3fc"]], 0, 0, 1, 1) + rg(q("w"), M.steel, .5, .5, .6) + sh(27, 55) +
        `<path d="M32 2 L28.5 8.5 H31.5 L30 13.5 L35 6.5 H32z" fill="#facc15"/>` +
        `<path d="M4 42 L7 32 C8 29 10 28 13 27.5 L20 18 C22 15.5 24.5 14.5 28 14.5 H40 C43 14.5 45 15.5 47 18 L53 27 C57 28 60 30 60 34 V42 a3 3 0 0 1 -3 3 H7 a3 3 0 0 1 -3 -3z" fill="url(#${q("b")})"/>` +
        `<path d="M15 27.5 L21.5 19 C23 17.4 24.5 17 27 17 H31 V27.5z M34 17 H40 C42 17 43.5 17.6 45 19.5 L50 27.5 H34z" fill="url(#${q("g")})"/>` + gl("M7 33 C9 30 12 29 16 29 H58 C58 31 57 31.5 56 31.5 H8z") +
        `<rect x="5" y="35" width="5" height="3" rx="1.5" fill="#fef9c3"/><rect x="55" y="35" width="5" height="3" rx="1.5" fill="#fca5a5"/>` +
        [17, 47].map((x) => `<circle cx="${x}" cy="45" r="8.5" fill="#111827"/><circle cx="${x}" cy="45" r="4.8" fill="url(#${q("w")})"/>`).join("") +
        (o.on ? `<circle cx="32" cy="36" r="4.5" fill="#22c55e" stroke="#fff" stroke-width="1.2"/>` : "") },
      wallbox: { n: "Wallbox", g: 2, f: (q, o) => lg(q("b"), M.white, 0, 0, 1, 1) + rg(q("d"), [[0, "#334155"], [1, "#0f172a"]], .45, .4, .7) + sh(14) +
        `<rect x="17" y="4" width="28" height="40" rx="9" fill="url(#${q("b")})" stroke="var(--gx-rim,#94a3b8)" stroke-opacity=".6"/>` +
        `<circle cx="31" cy="18" r="8.5" fill="url(#${q("d")})"/><circle cx="31" cy="18" r="5.2" fill="none" stroke="${o.on ? "#2dd4bf" : "#38bdf8"}" stroke-width="2.4"/>` + (o.on ? `<circle cx="31" cy="18" r="12" fill="#2dd4bf" opacity=".18"/>` : "") +
        `<rect x="23" y="31" width="16" height="4" rx="2" fill="${o.on ? "#22c55e" : "#94a3b8"}"/>` + gl("M20 10 a6 6 0 0 1 4 -4 v34 a6 6 0 0 1 -4 -4z") +
        `<path d="M38 40 C40 50 46 52 50 50" fill="none" stroke="#1f2937" stroke-width="3.4" stroke-linecap="round"/><rect x="47" y="45" width="9" height="8" rx="2" fill="#334155"/>` },
      heatpump: { n: "Wärmepumpe", g: 2, f: (q, o) => lg(q("b"), M.white, 0, 0, 1, 1) + rg(q("f"), [[0, "#334155"], [1, "#0f172a"]], .5, .5, .6) + sh(25) +
        `<rect x="5" y="10" width="54" height="42" rx="6" fill="url(#${q("b")})" stroke="var(--gx-rim,#94a3b8)" stroke-opacity=".55"/>` +
        `<circle cx="25" cy="31" r="16" fill="url(#${q("f")})"/>` +
        [0, 120, 240].map((a) => `<path d="M25 31 C23 25 25 20 30 18 C30 23 28 27 25 31z" fill="#94a3b8" transform="rotate(${a + (o.on ? 20 : 0)} 25 31)"/>`).join("") +
        `<circle cx="25" cy="31" r="16" fill="none" stroke="#cbd5e1" stroke-width="1.4"/>` + [-8, -3, 2, 7].map((d) => `<path d="M${25 - 15.5} ${31 + d} H${25 + 15.5}" stroke="#cbd5e1" stroke-width=".6" opacity=".7"/>`).join("") +
        `<rect x="45" y="18" width="9" height="4" rx="1.5" fill="#cbd5e1"/><circle cx="49.5" cy="44" r="2" fill="${o.on ? "#22c55e" : "#94a3b8"}"/><rect x="10" y="52" width="6" height="4" fill="#64748b"/><rect x="48" y="52" width="6" height="4" fill="#64748b"/>` },
      bolt: { n: "Strom", g: 2, f: (q) => lg(q("b"), [[0, "#fef08a"], [.5, "#facc15"], [1, "#ca8a04"]], 0, 0, 1, 1) + sh(12) +
        `<path d="M37 3 L13 35 H29 L25 59 L51 25 H35z" fill="url(#${q("b")})" stroke="#a16207" stroke-width="1.2" stroke-linejoin="round"/>` + gl("M37 3 L13 35 H19 L35 12z") },
      lamp: { n: "Licht", g: 2, f: (q, o) => rg(q("a"), [[0, "#fde047", .55], [1, "#fde047", 0]], .5, .45, .5) + rg(q("g"), [[0, "#fffbeb"], [.6, "#fde68a"], [1, "#f59e0b"]], .4, .35, .8) + rg(q("x"), [[0, "#f8fafc"], [1, "#94a3b8"]], .4, .35, .8) + lg(q("s"), M.steel, 0, 0, 1, 0) +
        (o.on !== false ? `<circle cx="32" cy="24" r="28" fill="url(#${q("a")})"/>` : "") +
        `<path d="M32 4 a17 17 0 0 1 10 31 c-2 1.6 -3 3.5 -3 6 H25 c0 -2.5 -1 -4.4 -3 -6 A17 17 0 0 1 32 4z" fill="url(#${q(o.on !== false ? "g" : "x")})"/>` +
        `<rect x="24.5" y="41" width="15" height="11" rx="2.5" fill="url(#${q("s")})"/><path d="M24.5 45 H39.5 M24.5 48.5 H39.5" stroke="#64748b" stroke-width="1"/><path d="M28 52 h8 l-2 4 h-4z" fill="#475569"/>` + gl("M21 14 a13 13 0 0 1 8 -7 a11 11 0 0 0 -5 10z") },
      water: { n: "Wasser", g: 2, f: (q) => lg(q("t"), M.steel, 0, 0, 0, 1) + lg(q("d"), M.water) + sh(14) +
        `<rect x="6" y="14" width="10" height="12" rx="2" fill="url(#${q("t")})"/><path d="M14 16 H38 a10 10 0 0 1 10 10 V31 H40 V27 a3 3 0 0 0 -3 -3 H14z" fill="url(#${q("t")})"/>` +
        `<rect x="22" y="7" width="12" height="5" rx="2.5" fill="#ef4444"/><rect x="26.5" y="11" width="3" height="6" fill="#94a3b8"/><rect x="38" y="31" width="12" height="4" rx="1.5" fill="#64748b"/>` +
        `<path d="M44 38 C48 44 50 47 50 50 a6 6 0 0 1 -12 0 C38 47 40 44 44 38z" fill="url(#${q("d")})"/>` + gl("M10 16 h6 v2 H10z") },
      boiler: { n: "Warmwasser", g: 2, f: (q, o) => lg(q("b"), M.white, 0, 0, 1, 0) + rg(q("g"), [[0, "#fdba74"], [.6, "#f97316"], [1, "#c2410c"]], .4, .35, .8) + sh(15) +
        `<rect x="18" y="4" width="28" height="52" rx="13" fill="url(#${q("b")})" stroke="var(--gx-rim,#94a3b8)" stroke-opacity=".55"/>` +
        `<path d="M18 17 a13 13 0 0 1 28 0 v3 H18z" fill="#1e3a5f"/>` +
        `<circle cx="32" cy="37" r="10" fill="url(#${q("g")})" stroke="#fff" stroke-width="1.6"/>` +
        `<text x="32" y="40.5" text-anchor="middle" font-size="9" font-weight="800" font-family="system-ui,sans-serif" fill="#fff">${o.t || "58°"}</text>` +
        `<rect x="22" y="56" width="4" height="3" rx="1" fill="#64748b"/><rect x="38" y="56" width="4" height="3" rx="1" fill="#64748b"/>` + gl("M21 18 a10 10 0 0 1 3 -8 v40 a10 10 0 0 1 -3 -5z") },
      forecast: { n: "Prognose", g: 2, f: (q) => lg(q("h"), [[0, "#a16207"], [1, "#3f2d10"]]) + rg(q("s"), M.gold, .4, .35, .8) +
        `<path d="M6 54 C14 30 22 18 32 18 C42 18 50 30 58 54z" fill="url(#${q("h")})" opacity=".9"/>` +
        `<path d="M6 54 C14 30 22 18 32 18 C42 18 50 30 58 54" fill="none" stroke="#fbbf24" stroke-width="2.6" stroke-dasharray="3 3.4" stroke-linecap="round"/>` +
        `<circle cx="32" cy="15" r="7" fill="url(#${q("s")})"/>` + [0, 60, 120, 180, 240, 300].map((a) => `<rect x="31" y="3" width="2" height="3.4" rx="1" fill="#f59e0b" transform="rotate(${a} 32 15)"/>`).join("") +
        `<rect x="4" y="53" width="56" height="3" rx="1.5" fill="#64748b"/>` },
      price: { n: "Strompreis", g: 2, f: (q) => lg(q("t"), [[0, "#7dd3fc"], [.5, "#38bdf8"], [1, "#0369a1"]], 0, 0, 1, 1) + sh(16) +
        `<g transform="rotate(38 32 32)"><path d="M14 18 H44 L56 32 L44 46 H14 a4 4 0 0 1 -4 -4 V22 a4 4 0 0 1 4 -4z" fill="url(#${q("t")})"/>` +
        `<circle cx="45" cy="32" r="3.2" fill="#0c4a6e"/><text x="27" y="37.5" text-anchor="middle" font-size="14" font-weight="800" font-family="system-ui,sans-serif" fill="#0c4a6e">ct</text>` +
        gl("M14 18 H40 L36 22 H14 a4 4 0 0 0 -4 4 V22 a4 4 0 0 1 4 -4z") + `</g><circle cx="14" cy="14" r="4" fill="#0f172a"/>` },
      /* ---------- Geräte (Modul 4) ---------- */
      washer: { n: "Waschmaschine", g: 3, f: (q, o) => lg(q("w"), M.water) + lg(q("c"), M.steel, 0, 0, 1, 1) + rg(q("g"), [[0, "#bae6fd"], [.6, "#38bdf8"], [1, "#0369a1"]], .4, .35, .8) + body(q) +
        `<circle cx="20" cy="11" r="2" fill="${o.on ? "#22c55e" : "#94a3b8"}"/><rect x="34" y="9" width="12" height="4" rx="1.5" fill="#0f172a"/>` +
        `<circle cx="32" cy="35" r="14.5" fill="url(#${q("c")})"/><circle cx="32" cy="35" r="11" fill="url(#${q("g")})"/>` +
        (o.on ? `<path d="M21 37 q5.5 -4 11 0 t11 0 a11 11 0 0 1 -22 0z" fill="url(#${q("w")})"/><path d="M21 37 q5.5 -4 11 0 t11 0" fill="none" stroke="#e0f2fe" stroke-width="1.2" opacity=".8"/>` : "") +
        `<path d="M24.5 28 a9 9 0 0 1 7 -3.6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".6"/>` },
      dryer: { n: "Trockner", g: 3, f: (q, o) => lg(q("c"), M.steel, 0, 0, 1, 1) + rg(q("d"), [[0, "#475569"], [1, "#0f172a"]], .4, .35, .8) + body(q) +
        `<circle cx="20" cy="11" r="2" fill="${o.on ? "#22c55e" : "#94a3b8"}"/><circle cx="40" cy="11" r="2.6" fill="#cbd5e1" stroke="#94a3b8"/>` +
        `<circle cx="32" cy="35" r="14.5" fill="url(#${q("c")})"/><circle cx="32" cy="35" r="11" fill="url(#${q("d")})"/>` +
        (o.on ? `<g opacity=".85"><path d="M24 38 q4 -8 9 -4 q-3 6 -9 4z" fill="#f97316"/><path d="M31 41 q6 -1 7 -8 q-6 1 -7 8z" fill="#a78bfa"/></g>` : "") +
        `<path d="M24.5 28 a9 9 0 0 1 7 -3.6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".45"/>` },
      dishwasher: { n: "Spülmaschine", g: 3, f: (q, o) => lg(q("b"), M.white, 0, 0, 1, 1) + sh(19) +
        `<rect x="12" y="8" width="40" height="48" rx="6" fill="url(#${q("b")})" stroke="var(--gx-rim,#94a3b8)" stroke-opacity=".55"/>` +
        `<rect x="12" y="8" width="40" height="9" rx="5" fill="#64748b"/><rect x="12" y="13" width="40" height="4" fill="#64748b"/>` +
        `<rect x="25" y="11" width="14" height="3" rx="1.5" fill="#e2e8f0"/><circle cx="46" cy="12.5" r="1.6" fill="${o.on ? "#22c55e" : "#cbd5e1"}"/>` +
        `<rect x="24" y="22" width="16" height="2.4" rx="1.2" fill="#94a3b8"/>` + [32, 38, 44].map((y) => `<rect x="18" y="${y}" width="28" height="1.6" rx=".8" fill="#cbd5e1"/>`).join("") +
        (o.on ? [[22, 29], [30, 33], [38, 29], [26, 40], [36, 40], [42, 35]].map(([x, y]) => `<path d="M${x} ${y} q2.6 3.6 0 5.4 q-2.6 -1.8 0 -5.4z" fill="#0ea5e9"/>`).join("") : "") +
        gl("M15 18 h4 v34 a3 3 0 0 1 -4 -3z") },
      fridge: { n: "Kühlschrank", g: 3, f: (q, o) => lg(q("b"), M.white, 0, 0, 1, 1) + sh(16) +
        `<rect x="16" y="3" width="32" height="54" rx="6" fill="url(#${q("b")})" stroke="var(--gx-rim,#94a3b8)" stroke-opacity=".55"/>` +
        `<rect x="16" y="20" width="32" height="1.6" fill="#94a3b8"/><rect x="42" y="8" width="2.8" height="8" rx="1.4" fill="#64748b"/><rect x="42" y="25" width="2.8" height="14" rx="1.4" fill="#64748b"/>` +
        `<path d="M26 7 V17 M21.7 9.5 L30.3 14.5 M21.7 14.5 L30.3 9.5" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>` +
        `<text x="27" y="44" text-anchor="middle" font-size="8" font-weight="800" font-family="system-ui,sans-serif" fill="#0369a1">${o.t || "4°"}</text>` +
        gl("M19 8 a4 4 0 0 1 3 -3 v50 a4 4 0 0 1 -3 -3z") + `<rect x="19" y="57" width="5" height="2" rx="1" fill="#64748b"/><rect x="40" y="57" width="5" height="2" rx="1" fill="#64748b"/>` },
      oven: { n: "Herd / Küche", g: 3, f: (q, o) => lg(q("b"), M.white, 0, 0, 1, 1) + rg(q("i"), o.on ? [[0, "#fde047"], [.5, "#f97316"], [1, "#7c2d12"]] : [[0, "#334155"], [1, "#0f172a"]], .5, .45, .7) + sh(22) +
        (o.on !== false ? [22, 32, 42].map((x) => `<path d="M${x} 14 q-2.5 -2.5 0 -5 q2.5 -2.5 0 -5" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>`).join("") : "") +
        `<rect x="7" y="17" width="50" height="38" rx="6" fill="url(#${q("b")})" stroke="var(--gx-rim,#94a3b8)" stroke-opacity=".55"/>` +
        `<rect x="7" y="17" width="50" height="9" rx="5" fill="#475569"/><rect x="7" y="22" width="50" height="4" fill="#475569"/>` +
        `<circle cx="14" cy="21.5" r="1.8" fill="#ef4444"/>` + [30, 37, 44].map((x) => `<rect x="${x}" y="20.5" width="4.5" height="2" rx="1" fill="#cbd5e1"/>`).join("") +
        `<rect x="13" y="31" width="38" height="18" rx="4" fill="url(#${q("i")})"/>` + gl("M13 33 a2 2 0 0 1 2 -2 h10 l-12 12z") },
      pool: { n: "Pool / Pumpe", g: 3, f: (q) => lg(q("w"), [[0, "#67e8f9"], [1, "#0891b2"]]) + lg(q("r"), M.white) + lg(q("m"), M.steel, 0, 0, 1, 0) + sh(27, 57) +
        `<path d="M3 30 H61 L56 54 H8z" fill="url(#${q("r")})"/><path d="M7 32 H57 L53 51 H11z" fill="url(#${q("w")})"/>` +
        `<path d="M9 38 q6 -3 12 0 t12 0 t12 0 t10 0 M11 45 q6 -3 12 0 t12 0 t12 0" fill="none" stroke="#cffafe" stroke-width="1.8" stroke-linecap="round" opacity=".85"/>` +
        `<path d="M16 33 V13 a5 5 0 0 1 10 0 M24 33 V15 M38 33 V13 a5 5 0 0 1 10 0 M46 33 V15" fill="none" stroke="url(#${q("m")})" stroke-width="3" stroke-linecap="round"/>` },
      pc: { n: "PC / Server", g: 3, f: (q, o) => lg(q("s"), [[0, "#818cf8"], [.55, "#3b82f6"], [1, "#0e7490"]], 0, 0, 1, 1) + lg(q("f"), M.dark, 0, 0, 0, 1) + lg(q("t"), M.white, 0, 0, 1, 0) + sh(25) +
        `<rect x="3" y="8" width="44" height="31" rx="4" fill="url(#${q("f")})"/><rect x="6" y="11" width="38" height="24" rx="2" fill="url(#${q("s")})"/>` + gl("M6 11 H24 L6 27z") +
        `<path d="M21 39 h8 l2 7 h-12z" fill="#64748b"/><rect x="13" y="46" width="24" height="3.5" rx="1.75" fill="#475569"/>` +
        `<rect x="50" y="14" width="11" height="36" rx="3" fill="url(#${q("t")})" stroke="var(--gx-rim,#94a3b8)" stroke-opacity=".6"/><rect x="53" y="19" width="5" height="1.6" rx=".8" fill="#94a3b8"/><rect x="53" y="23" width="5" height="1.6" rx=".8" fill="#94a3b8"/><circle cx="55.5" cy="43" r="1.6" fill="${o.on === false ? "#94a3b8" : "#22c55e"}"/>` },
      tvset: { n: "Fernseher", g: 3, f: (q, o) => lg(q("s"), o.on ? [[0, "#fda4af"], [.45, "#a855f7"], [1, "#1e3a8a"]] : [[0, "#334155"], [1, "#0b1220"]], 0, 0, 1, 1) + lg(q("f"), M.dark, 0, 0, 0, 1) + sh(20) +
        `<rect x="3" y="9" width="58" height="36" rx="3" fill="url(#${q("f")})"/><rect x="5.5" y="11.5" width="53" height="31" rx="1.5" fill="url(#${q("s")})"/>` + gl("M5.5 11.5 H28 L5.5 31z") +
        `<path d="M24 45 L20 54 M40 45 L44 54" stroke="#475569" stroke-width="3" stroke-linecap="round"/><rect x="16" y="53" width="32" height="3" rx="1.5" fill="#334155"/>` },
      workshop: { n: "Werkstatt", g: 3, f: (q) => lg(q("t"), M.wood, 0, 0, 0, 1) + lg(q("v"), [[0, "#fdba74"], [.5, "#f97316"], [1, "#9a3412"]], 0, 0, 1, 1) + lg(q("m"), M.steel) + sh(24) +
        `<rect x="6" y="34" width="52" height="7" rx="2" fill="url(#${q("t")})"/><rect x="10" y="41" width="5" height="16" rx="1.5" fill="#8a5a2b"/><rect x="49" y="41" width="5" height="16" rx="1.5" fill="#8a5a2b"/><rect x="10" y="49" width="44" height="3" fill="#6b4423"/>` +
        `<rect x="34" y="22" width="16" height="12" rx="2.5" fill="url(#${q("v")})"/><rect x="38" y="18" width="8" height="5" rx="1.5" fill="#475569"/><circle cx="46" cy="28" r="2" fill="#7c2d12"/>` +
        `<g transform="rotate(-35 22 20)"><rect x="20" y="10" width="4" height="22" rx="2" fill="#8a5a2b"/><rect x="14" y="6" width="16" height="7" rx="2" fill="url(#${q("m")})"/></g>` },
      plug: { n: "Steckdose", g: 3, f: (q, o) => lg(q("b"), M.white, 0, 0, 1, 1) + rg(q("i"), [[0, "#f1f5f9"], [1, "#94a3b8"]], .5, .4, .7) + sh(21) +
        `<rect x="9" y="7" width="46" height="46" rx="15" fill="url(#${q("b")})" stroke="var(--gx-rim,#94a3b8)" stroke-opacity=".55"/>` +
        `<circle cx="32" cy="30" r="15" fill="url(#${q("i")})"/><circle cx="25.5" cy="30" r="2.8" fill="#334155"/><circle cx="38.5" cy="30" r="2.8" fill="#334155"/>` +
        `<rect x="30.6" y="15" width="2.8" height="4" rx="1" fill="#cbd5e1"/><rect x="30.6" y="41" width="2.8" height="4" rx="1" fill="#cbd5e1"/>` +
        `<circle cx="50" cy="12" r="4" fill="${o.on ? "#22c55e" : "#475569"}" stroke="#fff" stroke-width="1.2"/>` + gl("M13 14 a6 6 0 0 1 5 -4 h8 l-13 16z") },
    };
    /* Gruppen für Übersicht und Auswahl */
    const G = [[1, "Heizen & Raum", "Modul 1"], [2, "Energie", "Modul 3 · Modul 19"], [3, "Geräte", "Modul 4"]];
    /* Alte Namen → neue Symbole. Modul 19 (EF_IMGS), Modul 4 (GS_TYP), Raumsymbole (COLOR_ICONS) */
    const A = {
      sonne: "pvRoof", solar: "pvRoof", haus: "house", akku: "battery", auto: "car", wallbox: "wallbox", steckdose: "plug", waschmaschine: "washer",
      trockner: "dryer", kuehlschrank: "fridge", wasser: "boiler", blitz: "bolt", heizung: "radiator", netz: "grid", lampe: "lamp",
      wasch: "washer", spuel: "dishwasher", kuehl: "fridge", ofen: "oven", pool: "pool", pc: "pc", tv: "tvset", werk: "workshop", sonst: "plug",
      radiator: "radiator", window: "window", windowOpen: "windowOpen", sun: "sun", car: "car", fridge: "fridge", laundry: "washer", pot: "oven",
      lamp: "lamp", drop: "humidity", suitcase: "vacation", tools: "workshop", wave: "pool", gamepad: "pc", roof: "house" };
    return (K._GX = { L, G, A });
  }
  _gx(k, s = 48, o = {}) {
    const X = this._gxLib(), d = X.L[k];
    if (!d) return "";
    const u = "gx" + (this.constructor._gxN = ((this.constructor._gxN || 0) + 1) % 1e6) + "_";
    return `<svg class="gx" viewBox="0 0 64 64" width="${s}" height="${s}" aria-hidden="true">${d.f((n) => u + n, o)}</svg>`;
  }
  /* Neuer Name für einen alten Bild- oder Symbolnamen. Bei „wie bisher“ oder (für Modul 19) „Alte Symbole behalten“: null */
  _gxAlt(old, m19 = false) {
    const c = this._gxCfg();
    if (c.classic || (m19 && c.keep19)) return null;
    const X = this._gxLib();
    return X.L[old] ? old : X.A[old] || null;
  }
  /* Herkunft: Solar, Batterie, Netz – Farben wie die bisherigen Balken in Modul 4 (gelb, violett, rot) */
  static GX_SRC = [["pv", "Solar", "#fbbf24"], ["bat", "Batterie", "#a78bfa"], ["net", "Netz", "#f87171"]]; /* wie GS_COL in Modul 4 */
  _gxRing(k, mix = {}, s = 72, o = {}) {
    const r = 29, C = 2 * Math.PI * r, tot = this.constructor.GX_SRC.reduce((a, [id]) => a + (Number(mix[id]) || 0), 0) || 1;
    let off = 0;
    const arcs = this.constructor.GX_SRC.map(([id, , c]) => {
      const f = (Number(mix[id]) || 0) / tot; if (f <= 0) return "";
      const len = Math.max(0, f * C - (f < 1 ? 2.2 : 0)), a = `<circle cx="32" cy="32" r="${r}" fill="none" stroke="${c}" stroke-width="4.2" stroke-linecap="round" stroke-dasharray="${len.toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 32 32)"/>`;
      off += f * C; return a;
    }).join("");
    const d = this._gxLib().L[k], u = "gx" + (this.constructor._gxN = ((this.constructor._gxN || 0) + 1) % 1e6) + "_";
    return `<svg class="gx gxr" viewBox="0 0 64 64" width="${s}" height="${s}" aria-hidden="true"><circle cx="32" cy="32" r="${r}" fill="none" stroke="var(--line,#2a3440)" stroke-width="4.2"/>${arcs}` +
      (d ? `<svg x="13" y="13" width="38" height="38" viewBox="0 0 64 64">${d.f((n) => u + n, o)}</svg>` : "") + `</svg>`;
  }
  _gxPct(mix = {}) {
    const S = this.constructor.GX_SRC, tot = S.reduce((a, [id]) => a + (Number(mix[id]) || 0), 0);
    if (!tot) return `<div class="gxpct mut">noch keine Daten</div>`;
    return `<div class="gxpct">${S.filter(([id]) => mix[id] > 0).map(([id, n, c]) => `<span><i style="background:${c}"></i>${Math.round(mix[id] / tot * 100)} % ${n}</span>`).join("")}</div>`;
  }
  /* „noch ~ Min.“ erst, wenn mindestens drei Läufe gelernt sind */
  _gxRest(runs, min) {
    if ((runs || 0) < 3) return `<span class="gxrest learn">lernt noch · ${runs || 0}/3 Läufe</span>`;
    return min > 0 ? `<span class="gxrest">noch ~${Math.round(min)} Min.</span>` : "";
  }
